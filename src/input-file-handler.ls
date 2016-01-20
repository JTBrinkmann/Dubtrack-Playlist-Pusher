$filelist = require "importer-filelist" .$el

export handleInputFiles = (inputfiles) !->
    # DEBUG
    exporter._debug.inputfiles = inputfiles

    # make sure Import/Export Dialog is displayed
    $ ".play-song-link, .sidebar .import-playlist" .click!

    $playlistSelect = $ "<select class=jtb-playlist-select>"
        .append do # implied default selection
            $ "<option disabled>select destination</option>"
        .append do
            $ "<option value=new>create new playlist</option>"
        .append do
            $ "<option disabled>------------------</option>"

    for pl in Dubtrack.app.browserView.model.models
        $ \<option>
            .text pl.attributes.name
            .val pl.id
            .appendTo $playlistSelect

    # show filelist, if not already visible
    $filelist .show!
    exporter.$importHint .show!

    # set up autoscrolling
    autoScrolling = 0
    scrollTo = $filelist.0.scrollHeight

    # process files
    handleFiles $filelist, inputfiles

    !function handleFiles $parentEl, files
        console.log "adding files", files

        for file in files
            parseFileMeta $parentEl, file

        for let file in files when file.detectedType
            if file._data
                # file from ZIP, we already its the content

                # do not process nested ZIPs
                if file.detectedType != \ZIP
                    parseFileData(file) do
                        target: result: file.asText!
                else
                    errorHandler file, "skipping nested ZIP"

            else # read file's content, first
                reader = new FileReader()
                reader.onload = parseFileData(file)
                # load file
                switch file.detectedType
                | \ZIP =>
                    reader.readAsArrayBuffer(file)
                | \JSON =>
                    reader.readAsText(file)
                # no other case should be possible

    !function parseFileMeta $parentEl, file
        type = ""

        # detect file type
        # … by MIME Type
        switch file.type
        | \text/plain =>
            type = "assuming "
            fallthrough
        | \application/json, \text/javascript, \text/json =>
            type += (file.detectedType = \JSON)

        | \application/octet-stream =>
            type = "assuming "
            fallthrough
        | \application/zip ,\application/x-zip-compressed =>
            type += (file.detectedType = \ZIP)

        | otherwise =>
            # … by filename extension
            filename = file.name .toLowerCase!
            if /\.json(?:\.txt)?$/.test filename
                type += (file.detectedType = \JSON)
            else if /\.txt$/.test filename
                type = "assuming "
                type += (file.detectedType = \JSON)
            else if /\.zip$/.test filename
                type += (file.detectedType = \ZIP)


        # add list item
        file.$el = $ "<li class=jtb-file>"
            .data \file, file
            .append do
                $ "<span class=jtb-filename>" .text "#{file.name} "
                $ "<span class=jtb-type>" .text type
            .appendTo $parentEl

        if not type
            errorHandler file, "unknown format"

    !function parseFileData file
        return (e) !->
            data = e.target.result
            if file.detectedType == \ZIP
                try
                    # check if ZIP starts with "PK"
                    # to see if it's even a ZIP
                    header = new Int8Array(data.slice(0,2))
                    if header.0 == 80 and header.1 == 75
                        # read file as ZIP
                        console.log "adding ZIP", file.name
                        zip = new JSZip(data)
                        handleFiles file.$el, [f for ,f of zip.files]
                    else
                        errorHandler file, "not a ZIP file"
                catch err
                    errorHandler file, "corrupted ZIP file", err

            else if file.detectedType == \JSON
                try
                    if data.0 == \[
                        errorHandler file, "file not in plug.dj playlist format"
                    else if data.0 == \{
                        # read as JSON
                        console.log "adding JSON", file.name
                        file.parsed = JSON.parse(data)
                    else
                        errorHandler file, "not a JSON file"
                catch err
                    errorHandler file, "corrupted JSON file", err

                if file.parsed
                    if not file.parsed.data
                        errorHandler file, "file not in plug.dj playlist format", err
                        return

                    # file successfully parsed!

                    # add playlist select
                    $ "<div class=jtb-file-actions>"
                        .append do
                            $sel = $playlistSelect .clone(true)
                        .append do
                            $ "<button class='jtb-import-pl-btn jtb-btn'>"
                                .text "import"
                        .appendTo file.$el
                    |> autoScroll

                    # auto-select/suggest a playlist to import to
                    if file.parsed.meta
                        {id, name} = file.parsed.meta

                    if id
                        # playlist has an id stored,
                        # test if we have a playlist with that ID
                        for pl in Dubtrack.app.browserView.model.models
                            if pl.id == id
                                suggestedPlaylist = pl
                                break

                    if not suggestedPlaylist and name
                        # playlist has a name stored
                        # test if we have a playlist with that name
                        for pl in Dubtrack.app.browserView.model.models
                            if pl.attributes.name == name
                                suggestedPlaylist = pl
                                break

                    if suggestedPlaylist
                        # select suggested playlist
                        $sel.val pl.id
                    else
                        if not name
                            name = file.name .replace /\.json(?:\.txt)?$|\.txt$/, ''
                        # suggest creating a new playlist with the same name
                        $ "<option value=new-suggested>"
                            .text "create \"#name\""
                            .insertAfter $sel.find("option:eq(1)")
                        $sel.val \new-suggested


    !function errorHandler file, msg, err
        console.error "[file importing error]", msg, file, err
        $ "<div class=jtb-file-actions>"
            .append do
                $ "<span>"
                    .text msg
            .appendTo do
                file.$el .addClass \jtb-error
        |> autoScroll

    !function autoScroll $el
        # auto-scroll down
        if autoScrolling
            autoScrolling := 2
        else
            autoScrolling := 1
            requestAnimationFrame autoScrollCallback
    !function autoScrollCallback
        if --autoScrolling > 0
            requestAnimationFrame autoScrollCallback
        else
            $filelist.animate do
                scrollTop: scrollTo
