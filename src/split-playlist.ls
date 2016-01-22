require! {
    auxiliaries: aux
}

pusher.removePlaylist = (playlistid, callback) !->
    for pl in Dubtrack.app.browserView.model.models when pl.id == playlistid
        pl.destroy!
        return callback?(,pl)
    # playlist not found
    callback? new Error("playlist '#playlistid' not found")

pusher.sizes = [20, 50, 100, 200, 500]
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
    name = @model.get \name


    # Too lazy to actually add any customizable options here
    if pusher.working
        aux.errorHandler new TypeError("already splitting")
    else
        title = "[splitPlaylist] done!"
        console.time title
        pusher.setWorking true
        $btn.text "loading whole playlist…"
        pusher.splitPlaylist playlistid, size, "#name (%d)",
            (err) !->
                # stop blocking
                pusher.setWorking false

                # reset split size button
                $btn.text "Split Size: #size"
                # show error / success message
                console.timeEnd title
                if err
                    aux.errorHandler err
                else
                    # close current playlist
                    Dubtrack.app.browserView?.playlistContainer?.empty!
                    Dubtrack.app.navigate "/browser/queue/", {-trigger}

                    alert """
                        done splitting \"#name\"

                        if the new playlists don't show up in your playlist-list, you might need to refresh.
                    """
            (err, eta) !->
                if eta >= 1
                    $btn.text "Splitting… #{eta}s"
                else
                    $btn.text "Splitting…"

pusher.splitPlaylist = (playlistid, limit, nameTemplate, callback, etaCallback) !->
    if not isFinite(limit) or limit < 1
        return callback? new TypeError("limit too small")

    if typeof callback != \function
        callback = null

    # prepare name
    name = nameTemplate.split "%d"

    # fetch playlists list and all songs from playlist we're going to split
    (err, playlistsArr) <-! pusher.fetchPlaylistsList
    return callback?(err) if err
    (err2, data) <-! pusher.fetchPlaylist playlistid
    return callback?(err) if err

    songs = data.data.data
    if not songs.length # note: we're not using totalItems because it's unreliable
        return callback new Error "Playlist appears to be empty"
    else if songs.length <= limit
        return callback new Error "Hold on there sunny, this playlist is already small enough! (≤ #limit songs)"

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

    # prepare eta
    if typeof etaCallback == \function
        # calculate eta
        remainingSongs = []
        var etaTimeout
        updateETA = !->
            clearTimeout etaTimeout
            maxRemaining = Math.max.apply(, remainingSongs)
            console.log "[eta]", maxRemaining*pusher.avgSongAdd/1000ms_to_s, maxRemaining, pusher.avgSongAdd
            etaCallback(,Math.round maxRemaining*pusher.avgSongAdd/1000ms_to_s)
            etaTimeout := setTimeout updateETA, 1_000ms

    # create all chunks (i.e. new playlists containing only a part of the original one)
    $.Deferred (def) !->
        res = {}
        remainingPlaylists = totalPlaylists
        for let i til totalPlaylists
            # create next playlist
            songsSlice = songs.slice(i*limit, (i+1)*limit)

            remainingSongs[i] = songsSlice.length if updateETA

            pusher.createPlaylist do
                name.join(i+1)
                songsSlice
                (err, playlist) !->
                    --remainingPlaylists
                    console.log "[split] playlist done", i+1, remainingPlaylists, err
                    if err # an error occured
                        callback?(err)
                    else # done adding songs
                        playlist.i = i+1
                        res[playlist.id] = playlist

                    if remainingPlaylists == 0
                        # we've finished all playlists
                        def.resolve(res)

                updateETA && !-> # eta update
                    remainingSongs[i]--

        # initially run updateETA
        updateETA! if updateETA

    .then (res) !-> # finished all playlists
        clearTimeout etaTimeout

        # delete original (source) playlist
        <-! pusher.removePlaylist playlistid

        # DONE!
        callback(,res) if callback

# add event listener
Dubtrack.View.BrowserInfo::events["click .jtb-split-btn"] = pusher.showSplitPlaylistGUI
Dubtrack.View.BrowserInfo::events["click .jtb-split-size-btn"] = pusher.changeSplitSize

# add button
Dubtrack.els.templates.playlist.playlistInfo_ ||= Dubtrack.els.templates.playlist.playlistInfo
Dubtrack.els.templates.playlist.playlistInfo .= replace do
    /(queue-playlist">.*?<\/a>).*<\/div>$/
    "$1<a href=# class='text-button jtb-split-size-btn' data-split-size=50>Split Size: 50</a>
    <a href=# class='text-button jtb-split-btn'>Split Playlist</a></div>"
