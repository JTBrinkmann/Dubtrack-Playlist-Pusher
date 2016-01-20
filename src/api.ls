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


browserIsSafari = navigator.vendor?.indexOf(\Apple) != -1
    and not navigator.userAgent?.indexOf(\CriOS) != -1

#== API ==
exporter = module.exports
export
    #== misc ==
    _debug: {}
    aux: aux
    avgPageFetch: 200ms
    avgPageFetchSamples: 2

    # data
    playlists: {}
    isImporting: false

    # browser data
    browserIsSafari: browserIsSafari
    browserSupportsZip: window.Blob and not browserIsSafari #ToDo improve
    browserSupportsDragnDrop: \draggable of document.body

    # the C in this font looks like a cheap circle-arrow icon ^_^
    $loadingIcon: $ "<i class='jtb-spin'>C</i>"




    #== EXPORTER ==
    fetchPlaylistsList: (callback) !->
        if exporter._playlistsArr
            # we already have the playlistsArr cached, so we'll just serve that
            callback?(,exporter._playlistsArr)

        else if Dubtrack.app.browserView
            # playlist manager already opened => playlists are already cached
            # it's also already sorted, but in reverse order
            # and wrapped in Backbone Models
            pls = Dubtrack.app.browserView.model.models; i = pls.length
            playlistsArr = [pls[i].attributes while i--]

            # cache playlistsArr
            exporter._playlistsArr = playlistsArr

            # call callback
            callback?(,playlistsArr)

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
            exporter._playlistsArr = playlistsArr

            # call callback
            callback?(,playlistsArr)

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
            (err) <-! exporter.fetchPlaylistsList
            return callback(err) if err

            # loop through all playlists to find the one we're looking for
            for pl in exporter._playlistsArr when pl._id == plID
                return callback(,pl)

            # playlist not in playlistsArr
            callback new TypeError("playlist not found")

    fetchPlaylist: (playlist, callback) !->
        # get current time for benchmarking
        d = Date.now!

        # get playlist object, if pl is just the playlist ID
        (err, pl) <-! exporter.getPlaylist(playlist)
        return callback?(err) if err

        # check if we already have the playlist cached
        if pl._id of exporter.playlists
            # we do have it cached, serve it
            return callback(,exporter.playlists[pl._id])

        else if Dubtrack.app.browserView?.browserItemsList
            # check if currently displayed playlist in playlist manager
            # matches the playlist we're fetching (so we can avoid manually
            # fetching the songs)
            songs = Dubtrack.app.browserView.browserItemsList.model.models
            if songs.0?.attributes.playlistid == pl._id
                for pl in Dubtrack.app.browserView.browserItemsList.model.models
                    ...

        # playlist not cached yet, continue manually fetching

        # new and untouched playlists might not have a totalItems attribute
        totalItems = pl.totalItems || 0
        if totalItems == 0
            console.log "skipping empty playlist '#{pl.name}'"
            # we don't actually run any code to skip the playlist
            # fetchPage will just synchroneously finish instantly
            # as the amount of pages to load is 0

        # visually indicate that the playlist is loading
        $playlist = $ ".playlist-#{pl._id}"
            .append exporter.$loadingIcon

        # fetch all songs
        # the Dubtrack server only lets us download MAX_PAGE_SIZE (20)
        # songs of a playlist per request, so we need to do multiple
        # requests to actually get all songs of the playlist
        exporter._debug.playlists = {}
        pages = Math.ceil(totalItems / MAX_PAGE_SIZE)
        $.Deferred (defFetchSongs) !->
            songs = new Array(totalItems)
            offset = 0
            page = 0
            exporter._debug.playlists[pl.name] = []

            # fetch a single page
            do fetchPage = !->
                if ++page <= pages
                    (page) <-! aux.fetch "songs (#{pl.name}) [#page/#pages]", "https://api.dubtrack.fm/playlist/#{pl._id}/songs?page=#page"
                    exporter._debug.playlists[pl.name][*] = page
                    try
                        # convert song data to plug.dj format
                        for {_song}, o in page
                            songs[o + offset] =
                                id:       _song._id
                                cid:      _song.fkid
                                format:   FORMATS.indexOf(_song.type)
                                artist:   ''
                                name:     _song.title
                                duration: _song.songLength
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
            # cache result
            exporter.playlists[pl._id] =
                id: pl._id
                name: pl.name
                totalItems: totalItems
                data:
                    # rather unnecessary meta data… but why not
                    time: Date.now! - d
                    status: \ok

                    # songs
                    data: songs

                    # for easier re-importing
                    meta:
                        id: pl.id
                        name: pl.name
                        totalItems: pl.totalItems

            # visually indicate we're done loading
            $playlist .addClass \jtb-playlist-loaded
            exporter.$loadingIcon .remove!

            # update avg. page fetch speed
            if pages != 0
                exporter.avgPageFetch *= exporter.avgPageFetchSamples
                exporter.avgPageFetch += (Date.now! - d)/pages
                exporter.avgPageFetch /= ++exporter.avgPageFetchSamples

            # call callback, if any
            callback?(,exporter.playlists[pl._id])

    etaFetchAllPlaylists: (callback) !->
        # calculate the estimated time to fetch all playlists
        (err, playlistsArr) <-! exporter.fetchPlaylistsList
        return callback?(err) if err

        # loop through all playlists and increase the eta by
        # the amount of pages * average time to fetch a page
        eta = 0ms
        for pl in playlistsArr when pl.totalItems and pl._id not of exporter.playlists
            eta += exporter.avgPageFetch * Math.ceil(pl.totalItems / MAX_PAGE_SIZE)

        console.info "ETA for fetching all songs: %c#{Math.round(eta/1000)}s", 'font-weight: bold'
        callback(null, eta)

    fetchAllPlaylists: (callback, etaCallback) !->
        # get list of all playlists
        # if already cached, this will be synchroneous
        if typeof etaCallback == \function
            var etaTimeout
            updateETA = !->
                clearTimeout etaTimeout
                (err, eta) <-! exporter.etaFetchAllPlaylists
                if not err
                    etaCallback Math.round(eta/1000ms_to_s)
                    etaTimeout := setTimeout updateETA, 1_000ms

        (err, playlistsArr) <-! exporter.fetchPlaylistsList
        return callback?(err) if err

        # asynchroneously load all playlists and add them to zip
        $.Deferred (defFetchPlaylists) !->
            console.time? "fetched playlists' songs"
            i = 0
            do fetchNextPlaylist = (err) !->
                return callback?(err) if err

                # update eta
                updateETA! if updateETA

                # load next playlist, if any
                pl = playlistsArr[i++]
                if pl
                    exporter.fetchPlaylist pl, fetchNextPlaylist
                else
                    defFetchPlaylists.resolve!

        .then !->
            # done fetching playlist data!
            console.timeEnd? "fetched playlists' songs"

            # clear eta update timeout
            clearTimeout etaTimeout if updateETA

            # call callback, if any
            callback?!

    downloadPlaylist: (playlist) !->
        (err, pl) <-! exporter.fetchPlaylist(playlist)
        return callback?(err) if err

        # make sure Import/Export Dialog is displayed
        $ ".play-song-link, .sidebar .import-playlist" .click!

        if exporter.browserIsSafari # show in text area
            exporter.$data.val JSON.stringify(pl.data)
            exporter.$name.text "#{pl.name}.json"
        else # download as file (worst case: open it in a new tab/window)
            saveTextAs JSON.stringify(pl.data), "#{pl.name}.json"
    downloadZip: !->
        # create ZIP file
        if not exporter.zip
            exporter.zip = new JSZip()
            for ,pl of exporter.playlists
                # Autorename file, if file with same name already present
                # (Dubtrack allows multiple playlists to have the same name
                # however, files in ZIPs cannot have the same name,
                # while being in the same folder)
                o = 1
                filename = pl.name
                while filename of exporter.zip.files
                    filename = "#{pl.name} (#{++o})"

                # add fille to zip
                exporter.zip.file "#{filename}.json", JSON.stringify pl.data

        # download ZIP
        date = /[^T]+/.exec(new Date().toISOString!).0
        saveAs exporter.zip.generate(type:\blob), "#{date}_dubtrack_playlists.zip"
        console.log "zip download started!"




    #== IMPORTER ==
    createPlaylist: (name, optSongs, callback) !->
        if not optSongs or typeof optSongs == \function
            callback = optSongs
            optSongs = null
        new Dubtrack.Model.Playlist(name: name)
            ..parse = Dubtrack.helpers.parse
            ..save {}, success: (pl) !->
                Dubtrack.user.playlist.add pl
                if optSongs
                    exporter.importSongs pl.id, optSongs, callback, ..
                else
                    callback?(,pl)
    importSongs: (playlistID, songsArray, callback, _internal_pl) !->
        i = 0
        title = "imported #{songsArray.length} songs into #playlistID"
        console.time title
        do !function importSong
            song = songsArray[i++]
            if song
                if typeof song.cid != \string or song.format not in [1, 2]
                    # skip invalid song
                    console.warn "skipping song with unknown format", song
                    i++
                    importSong!
                else
                    # send import request
                    url = Dubtrack.config.apiUrl +
                        Dubtrack.config.urls.playlistSong.split \:id .join playlistID
                    Dubtrack.helpers.sendRequest do
                        url
                        fkid: song.cid,
                        type: FORMATS[song.format]
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