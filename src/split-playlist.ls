require! {
    auxiliaries: aux
}

pusher.removePlaylist = (playlistid, callback) !->
    for pl in Dubtrack.app.browserView.model.models when pl.id == playlistid
        pl.destroy!
        return callback?(,pl)
    # playlist not found
    callback? new Error("playlist '#playlistid' not found")

pusher.sizes = [5, 20, 50, 100, 200, 500]
pusher.changeSplitSize = (e) !->
    e?.preventDefault!
    $btn = $ \.jtb-split-size-btn
    size = $btn.data \split-size
    newSize = pusher.sizes[(pusher.sizes.indexOf(size) + 1) % pusher.sizes.length]
    $btn.data \split-size, newSize
    $btn.text "Split Size: #newSize"

pusher.showSplitPlaylistGUI = (e) !->
    e?.preventDefault!
    $btn = $ \.jtb-split-size-btn
    size = $btn.data \split-size
    console.log "[split gui]", @?model, size

    return if not @?model
    playlistid = @model.id


    # Too lazy to actually add any customizable options here
    pusher.splitPlaylist playlistid, size, "#{@model.get \name} (%d)",
        (err) !->
            $btn.text "Split Size: #size"
            aux.errorHandler err if err
        (err, eta) !->
            console.log "Splitting… #{eta}s", new Date()
            if eta >= 1
                eta = "ca. #eta"
            else
                eta = "<1"
            $btn.text "Splitting… #{eta}s"

pusher.splitPlaylist = (playlistid, limit, nameTemplate, callback, etaCallback) !->
    if not isFinite(limit) or limit < 1
        return callback? new TypeError("limit too small")

    if pusher.splitting
        return callback? new TypeError("already splitting")
    pusher.splitting = true

    if typeof callback != \function
        callback = null

    title = "[splitPlaylist] done!"
    console.time title

    # prepare name
    name = nameTemplate.split "%d"

    # fetch playlists list and all songs from playlist we're going to split
    (err, playlistsArr) <-! pusher.fetchPlaylistsList
    if err
        callback?(err)
        console.timeEnd title
        return

    (err2, data) <-! pusher.fetchPlaylist playlistid
    if err
        callback?(err)
        console.timeEnd title
        return

    songs = data.data.data
    if not songs.length # note: we're not using totalItems because it's unreliable
        callback new Error "Playlist '#playlistid' is empty"

    # prepare eta
    if typeof etaCallback == \function
        # calculate eta
        remainingSongs = songs.length

        var etaTimeout
        updateETA = !->
            clearTimeout etaTimeout
            etaCallback(,Math.round remainingSongs*pusher.avgSongAdd/1000ms_to_s)
            etaTimeout := setTimeout updateETA, 1_000ms

    # calculate how many playlists we'll split up to
    totalPlaylists = Math.ceil(songs.length / limit)

    # check if there'll be name collissions
    plNames = {[pl.name, true] for pl in playlistsArr}
    for i til totalPlaylists when name.join(i) of plNames
        abort = not confirm """
            You are about to create playlists with names that are already used (e.g. "#{name.join(i)}")!

            Are you sure you want to continue?
        """
        if abort
            # abort playlist splitting
            console.timeEnd title
            return
        else
            # don't check for any other name
            break

    i = 0
    res = {}
    do !function createNextPlaylist err, playlist
        # cache playlist data, if we have a callback
        if playlist and callback
            playlist.i = i - 1
            res[playlist.id] = playlist


        if err # an error occured
            callback?(err)
            console.timeEnd title

        else if i < totalPlaylists
            # create next playlist
            pusher.createPlaylist do
                name.join(i+1)
                songs.slice(i*limit, (++i)*limit)
                createNextPlaylist
                updateETA && !-> # eta update
                    remainingSongs--
                    updateETA!

        else # finished creating playlists
            clearTimeout etaTimeout

            # delete original playlist
            <-! pusher.removePlaylist playlistid

            # DONE!
            console.timeEnd title
            callback(,true) if callback

# add event listener
Dubtrack.View.BrowserInfo::events["click .jtb-split-btn"] = pusher.showSplitPlaylistGUI
Dubtrack.View.BrowserInfo::events["click .jtb-split-size-btn"] = pusher.changeSplitSize

# add button
Dubtrack.els.templates.playlist.playlistInfo_ ||= Dubtrack.els.templates.playlist.playlistInfo
Dubtrack.els.templates.playlist.playlistInfo .= replace do
    /(queue-playlist">.*?<\/a>).*<\/div>$/
    "$1<a href=# class='text-button jtb-split-size-btn' data-split-size=50>Split Size: 50</a>
    <a href=# class='text-button jtb-split-btn'>Split Playlist</a></div>"
