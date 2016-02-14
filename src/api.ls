require! {
    auxiliaries: aux
    "input-file-handler": {handleInputFiles}
}


# song limit when fetching songs from a playlist.
# This is configured on Dubtrack's servers,
# do NOT increase the number in this code!
# It will only result in exported playlists MISSING songs!
const MAX_PAGE_SIZE = 20
const FORMATS = [, \youtube, \soundcloud]
const PLAYLIST_LOADED_RESET_TIMEOUT = 2min * 60_000min_to_ms
const PLAYLIST_LIST_RESET_TIMEOUT   = 2min * 60_000min_to_ms


#== API ==
pusher = module.exports
export
    #== misc ==
    _debug: {}
    aux: aux
    avgPageFetch: 200ms
    avgPageFetchSamples: 2
    avgSongAdd: 200ms
    avgSongAddSamples: 2
    playlistLoadedResetTimeouts: {}
    working: false

    # data
    playlists: {}
    isImporting: false

    # browser data
    browserSupportsZip: window.Blob #ToDo improve
        and navigator.vendor?.indexOf(\Apple) == -1
        and navigator.userAgent?.indexOf(\CriOS) == -1
    browserSupportsDragnDrop: \draggable of document.body

    # the C in this font looks like a cheap circle-arrow icon ^_^
    $loadingIcon: $ "<i class='jtb-spin'>C</i>"

    setWorking: (!!val) !->
        pusher.working = val
        pusher.$browser?.toggleClass \jtb-working, val

    noConflict: !->
        # remove DOM elements
        $ \.jtb .remove!

        pusher.$browser
            # remove custom CSS classes
            .removeClass "jtb-dropping jtb-importing jtb-working"
            # detach drag'n'drop event listeners
            .off 'dragover dragend dragenter dragleave drop'
        $ \.close-import-playlist
            .off \click, pusher._closeBtnClick

        # revert import button text
        $ ".sidebar .import-playlist"
            .contents!.1 .textContent = pusher._importBtnText

        # revert monkey-patched functions
        Dubtrack.View.ImportPlaylistBrowser::openView = Dubtrack.View.ImportPlaylistBrowser::openView_
        delete Dubtrack.View.ImportPlaylistBrowser::openView_

        Dubtrack.View.ImportPlaylistBrowser::closeView = Dubtrack.View.ImportPlaylistBrowser::closeView_
        delete Dubtrack.View.ImportPlaylistBrowser::closeView_

        Dubtrack.View.playlistItem::viewDetails = Dubtrack.View.playlistItem::viewDetails_
        delete Dubtrack.View.playlistItem::viewDetails_

        # keep the patched $(".playlist_icon") click handler

        # split-playlist
        # remove event listener
        delete Dubtrack.View.BrowserInfo::events["click .jtb-split-btn"]
        delete Dubtrack.View.BrowserInfo::events["click .jtb-split-size-btn"]

        # add button
        Dubtrack.els.templates.playlist.playlistInfo = Dubtrack.els.templates.playlist.playlistInfo_



    #== EXPORTER ==
    fetchPlaylistsList: (callback) !->
        return if typeof callback != \function

        if pusher._playlistsArr
            # we already have the playlistsArr cached, so we'll just serve that
            callback(,pusher._playlistsArr)

        else if Dubtrack.app.browserView
            # playlist manager already opened => playlists are already cached
            # it's also already sorted, but in reverse order
            # and wrapped in Backbone Models
            pls = Dubtrack.app.browserView.model.models; i = pls.length
            playlistsArr = [pls[i].attributes while i--]

            # call callback
            callback(,playlistsArr)

        else
            # we need to fetch the playlist list manually
            (playlistsArr) <-! aux.fetch "playlists", "https://api.dubtrack.fm/playlist"
            if \length not of playlistsArr
                console.warn "playlists data not an array", playlistsArr
                return callback new TypeError("couldn't parse playlists data")

            # sort array, so that when looking at the playlist manager,
            # it looks like we're loading the playlists top to bottom. This feels more
            # intuitive for the user than jumping around from playlist to playlist.
            # Note: This is a naive sorting algoritm, I know. Blame Dubtrack for using it
            playlistsArr .= sort (a, b) ->
                if a.name < b.name then -1 else if a.name > b.name then +1 else 0

            # cache playlistsArr
            pusher._playlistsArr = playlistsArr

            # clear the cache later
            setTimeout do
                !-> delete pusher._playlistsArr
                PLAYLIST_LIST_RESET_TIMEOUT

            # call callback
            callback(,playlistsArr)

    getPlaylist: (playlist, callback) !->
        # turns a playlistID or playlist object into
        return if typeof callback != \function
        if not playlist
            callback new TypeError("no valid playlist specified")

        else if playlist._id
            # parameter is already the desired playlist object
            callback(,playlist)
        else
            # parse playlist parameter
            if typeof playlist == \string
                plID = playlist
            else if \id of playlist
                plID = playlist.id
            else
                # playlist parameter couldn't be parsed
                callback new TypeError("no valid playlist specified")
                return

            # make sure playlist-list is loaded, first
            (err, playlistsArr) <-! pusher.fetchPlaylistsList
            return callback(err) if err

            # loop through all playlists to find the one we're looking for
            for pl in playlistsArr when pl._id == plID
                return callback(,pl)

            # playlist not in playlistsArr
            callback new TypeError("playlist not found")

    fetchPlaylist: (playlist, callback, etaCallback) !->
        # get current time for benchmarking
        d = Date.now!

        # get playlist object, if pl is just the playlist ID
        (err, pl) <-! pusher.getPlaylist(playlist)
        return callback?(err) if err

        # check if currently displayed playlist in playlist manager
        # matches the playlist we're fetching (so we can avoid manually
        # fetching the songs)
        /*if Dubtrack.app.browserView?.browserItemsList
            songs = Dubtrack.app.browserView.browserItemsList.model.models
            if songs.0?.attributes.playlistid == pl._id
                for pl in Dubtrack.app.browserView.browserItemsList.model.models
                    ...
        */

        # new and untouched playlists might not have a totalItems attribute
        totalItems = pl.totalItems || 0
        if totalItems == 0
            console.log "skipping empty playlist '#{pl.name}'"
            # we don't actually run any code to skip the playlist
            # fetchPage will just synchroneously finish instantly
            # as the amount of pages to load is 0

        # visually indicate that the playlist is loading
        $playlist = $ ".playlist-#{pl._id}"
            .append pusher.$loadingIcon

        # fetch all songs
        # the Dubtrack server only lets us download MAX_PAGE_SIZE (20)
        # songs of a playlist per request, so we need to do multiple
        # requests to actually get all songs of the playlist
        pusher._debug.playlists = {}
        pages = Math.ceil(totalItems / MAX_PAGE_SIZE)
        $.Deferred (defFetchSongs) !->
            songs = new Array(totalItems)
            offset = 0
            page = 0

            # fetch a single page
            do fetchPage = !->
                if ++page <= pages
                    etaCallback?(page, pages)
                    (page) <-! aux.fetch "songs (#{pl.name}) [#page/#pages]", "https://api.dubtrack.fm/playlist/#{pl._id}/songs?page=#page"
                    try
                        # convert song data to plug.dj format
                        for {_song}, o in page
                            songs[o + offset] =
                                id:       _song._id
                                cid:      _song.fkid
                                format:   FORMATS.indexOf(_song.type)
                                artist:   ''
                                title:    _song.name
                                duration: ~~(_song.songLength / 1000)
                                image:    _song.images.thumbnail
                        offset += page.length
                    catch err
                        callback new TypeError "couldn't parse song data (#err)"

                    # fetch the next page
                    fetchPage!
                else
                    # fetched all pages! continue
                    defFetchSongs.resolve(songs)

        .then (songs) !-> # fetched all songs, continue
            # visually indicate we're done loading
            $playlist .addClass \jtb-playlist-loaded
            pusher.$loadingIcon .remove!
            clearTimeout pusher.playlistLoadedResetTimeouts[pl._id]
            pusher.playlistLoadedResetTimeouts[pl._id] = setTimeout do
                !->
                    $playlist .removeClass \jtb-playlist-loaded
                PLAYLIST_LOADED_RESET_TIMEOUT

            # update avg. page fetch speed
            if pages != 0
                pusher.avgPageFetch *= pusher.avgPageFetchSamples
                pusher.avgPageFetch += (Date.now! - d)/pages
                pusher.avgPageFetch /= ++pusher.avgPageFetchSamples

            # call callback, if any
            callback? null,
                id: pl._id
                name: pl.name
                totalItems: totalItems
                data:
                    # rather unnecessary meta data… but why not
                    time: Date.now! - d
                    status: \ok
                    dubtrackPlaylistPusherFormat: 2

                    # songs
                    data: songs

                    # for easier re-importing
                    meta:
                        id: pl.id
                        name: pl.name
                        totalItems: totalItems

    etaFetchAllPlaylists: (callback) !->
        # calculate the estimated time to fetch all playlists
        (err, playlistsArr) <-! pusher.fetchPlaylistsList
        return callback?(err) if err

        # loop through all playlists and increase the eta by
        # the amount of pages * average time to fetch a page
        eta = 0ms
        for pl in playlistsArr when pl.totalItems and pl._id not of pusher.playlists
            eta += pusher.avgPageFetch * Math.ceil(pl.totalItems / MAX_PAGE_SIZE)

        console.info "ETA for fetching all songs: %c#{Math.round(eta/1000)}s", 'font-weight: bold'
        callback(,eta)

    fetchAllPlaylists: (callback, etaCallback) !->
        # get list of all playlists
        # if already cached, this will be synchroneous

        (err, playlistsArr) <-! pusher.fetchPlaylistsList
        return callback?(err) if err

        if typeof etaCallback == \function
            # calculate eta
            remainingPages = 0

            # loop through all playlists and increase the eta by
            # the amount of pages * average time to fetch a page
            for pl in playlistsArr when pl.totalItems
                remainingPages += Math.ceil(pl.totalItems / MAX_PAGE_SIZE)

            var etaTimeout
            updateETA = !->
                clearTimeout etaTimeout
                etaCallback(,Math.round remainingPages*pusher.avgPageFetch/1000ms_to_s)
                etaTimeout := setTimeout updateETA, 1_000ms

        # asynchroneously load all playlists and add them to zip
        title = "fetched playlists' songs"
        $.Deferred (defFetchPlaylists) !->
            console.time title
            res = {}
            i = 0
            do fetchNextPlaylist = (err, playlist) !->
                return callback?(err) if err
                if playlist
                    res[playlist.id] = playlist

                pl = playlistsArr[i++]

                # update eta
                updateETA! if updateETA

                # load next playlist, if any
                if pl
                    pusher.fetchPlaylist pl, fetchNextPlaylist,
                        updateETA && (page) !-> # eta update
                            remainingPages--
                            updateETA!
                else
                    defFetchPlaylists.resolve res

        .then (res) !->
            # done fetching playlist data!
            console.timeEnd title

            # clear eta update timeout
            clearTimeout etaTimeout if updateETA

            # call callback, if any
            callback?(,res)

    downloadPlaylist: (playlist, callback) !->
        (err, pl) <-! pusher.fetchPlaylist(playlist)
        return callback?(err) if err

        # make sure Import/Export Dialog is displayed
        $ ".play-song-link, .sidebar .import-playlist" .click!

        json = JSON.stringify(pl.data)
        if not pusher.browserSupportsZip # show in text area
            pusher.$data.val json
            pusher.$name.text "#{pl.name}.json"
        else # download as file (worst case: open it in a new tab/window)
            saveTextAs json, "#{pl.name}.json"
        callback?(, pl)

    downloadZip: (callback, etaCallback) !->
        # fetch all songs
        (err, playlists) <-! pusher.fetchAllPlaylists _, etaCallback
        return callback?(err) if err

        # create ZIP file
        zip = new JSZip()
        for ,pl of playlists
            # Autorename file, if file with same name already present
            # (Dubtrack allows multiple playlists to have the same name
            # however, files in ZIPs cannot have the same name,
            # while being in the same folder)
            o = 1
            filename = pl.name
            while filename of zip.files
                filename = "#{pl.name} (#{++o})"

            # add file to zip
            zip.file "#{filename}.json", JSON.stringify pl.data

        # download ZIP
        date = /[^T]+/.exec(new Date().toISOString!).0
        saveAs zip.generate(type:\blob), "#{date}_dubtrack_playlists.zip"
        console.log "zip download started!"
        callback?(,playlists)





    #== IMPORTER ==
    createPlaylist: (name, optSongs, callback, etaCallback) !->
        if not optSongs or typeof optSongs == \function
            callback = optSongs
            optSongs = null

        # clear playlists-list cache (because we're adding a playlist now, duh)
        delete pusher._playlistsArr

        # create playlist
        new Dubtrack.Model.Playlist(name: name)
            ..parse = Dubtrack.helpers.parse
            ..save {}, success: (pl) !->
                # add playlist locally (might not always trigger a redraw)
                Dubtrack.app.browserView.model.add ..
                #Dubtrack.app.browserView.appendEl pl
                if optSongs
                    pusher.importSongs pl.id, optSongs, callback, etaCallback, ..
                else
                    callback?(,pl)
    importSongs: (playlistID, songsArray, callback, etaCallback, _internal_pl) !->
        etaCallback = null if typeof etaCallback != \function
        i = 0
        title = "imported #{songsArray.length} songs into #playlistID"

        console.time title
        d = Date.now!
        url = Dubtrack.config.apiUrl +
            Dubtrack.config.urls.playlistSong.split \:id .join playlistID
        do !function importSong
            if i # update avg. song add speed
                pusher.avgSongAdd *= pusher.avgSongAddSamples
                pusher.avgSongAdd += Date.now! - d
                pusher.avgSongAdd /= ++pusher.avgSongAddSamples
                d := Date.now!
            song = songsArray[i++]

            etaCallback(i) if etaCallback

            if song
                if typeof song.cid != \string or song.format not in [1, 2]
                    # skip invalid song
                    console.warn "skipping song with unknown format", song
                    i++
                    importSong!
                else
                    # send import request
                    Dubtrack.helpers.sendRequest do
                        url
                        fkid: song.cid || song.fkid
                        type: FORMATS[song.format] || song.type
                        \post
                        importSong
            else
                console.timeEnd title
                if typeof callback == \function
                    if _internal_pl
                        callback(,_internal_pl, songsArray)
                    else
                        callback(,songsArray)

    handleInputFiles: handleInputFiles

export close = pusher.noConflict