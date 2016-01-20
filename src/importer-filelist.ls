export $el = do
    $ "<ul class='jtb jtb-files'>"
        .on \input, \.jtb-playlist-select, !->
            plID = $ this .val!
            if plID == \new
                console.log "selected 'new playlist'"
                ...
            else
                console.log "selected playlist #plID (#{$ this .text!})"
                ...

        .on \click, \.jtb-import-pl-btn, !->
            return if exporter.working

            $file =  $ this .closest \.jtb-file
            $sel = $file .find \.jtb-playlist-select
            plID = $sel.val!
            file = $file.data \file
            songs = file.parsed.data

            if plID == \new-suggested
                name = file.name .replace /\.json(?:\.txt)?$|\.txt$/, ''
                startWorking!
                exporter.createPlaylist do
                    name
                    songs
                    callback

            else if plID == \new
                $input = $file.find \.jtb-name-input
                nameInput = $input.val!
                if not $input.length
                    # show playlist input field
                    console.log "selected 'new playlist' destination"
                    $ "<input class=jtb-name-input placeholder='new playlist name'>"
                        .insertAfter $sel.hide!
                        .focus!
                    $ "<button class='jtb-abort-btn jtb-btn'>✘</button>"
                        .appendTo $sel.parent!

                else if not nameInput
                    alert "please enter a playlist name"

                else
                    # create new playlist
                    console.log "create new playlist"
                    startWorking!
                    exporter.createPlaylist do
                        nameInput
                        songs
                        callback
            else
                # import songs into existing playlist
                console.log "import to playlist #plID"
                startWorking!
                exporter.importSongs do
                    plID
                    songs
                    callback

            !function startWorking
                $file .find \.jtb-file-actions
                    .slideUp!
                    .before exporter.$loadingIcon
                exporter.setWorking true
            !function callback
                exporter.setWorking false
                exporter.$loadingIcon.remove!
                $file .addClass \jtb-file-imported

        .on \click, \.jtb-abort-btn, !->
            $file =  $ this .closest \.jtb-file
            $file .find \.jtb-playlist-select
                .show!
            $file .find ".jtb-name-input,.jtb-abort-btn"
                .remove!

        .on \click, \.jtb-filename, !->
            $fileActions = $ this .siblings \.jtb-file-actions
                .slideToggle!