export $el = do
    $ "<ul class='jtb jtb-files'>"
        .on \input, \.jtb-playlist-select, !->
            plID = $ this .val!
            if plID == \new
                # show playlist input field
                console.log "selected 'new playlist' destination"
                $file =  $ this .closest \.jtb-file
                $sel = $file .find \.jtb-playlist-select
                $ "<input class=jtb-name-input placeholder='new playlist name'>"
                    .insertAfter $sel.hide!
                    .focus!
                $ "<button class='jtb-abort-btn jtb-btn'>✘</button>"
                    .appendTo $sel.parent!
            else
                console.log "selected playlist #plID (#{$ this .text!})"

        .on \click, \.jtb-import-pl-btn, !->
            return if pusher.working

            $file =  $ this .closest \.jtb-file
            $sel = $file .find \.jtb-playlist-select
            plID = $sel.val!
            file = $file.data \file
            songs = file.parsed.data

            if not plID
                alert "please select a playlist to import to"

            else if plID == \new-suggested
                name = file.name .replace /\.json(?:\.txt)?$|\.txt$/, ''
                startWorking!
                pusher.createPlaylist do
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
                    pusher.createPlaylist do
                        nameInput
                        songs
                        callback
            else
                # import songs into existing playlist
                console.log "import to playlist #plID"
                startWorking!
                pusher.importSongs do
                    plID
                    songs
                    callback

            !function startWorking
                $file .find \.jtb-file-actions
                    .slideUp!
                    .before pusher.$loadingIcon
                pusher.setWorking true
            !function callback
                pusher.setWorking false
                pusher.$loadingIcon.remove!
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