exporter = require \api
$filelist = require "importer-filelist" .$el

<-! requestAnimationFrame
$browser = $ \#browser
$diag = $ \#import-playlist-container


# update Import Playlists button
$ ".sidebar .import-playlist"
    .contents!.1 .textContent = " Import/Export playlists"

# add FileList
$filelist
    .hide!
    .appendTo $diag
exporter.$importHint = $ "<div class=jtb-note style='display:none'>
    note: Freshly imported playlists might not show up in the playlist-list,
    \ or show up with with a wrong number of songs.
    \ Refreshing the page fixes this (sorry)</div>"
    .appendTo $diag

# add import button
# invisible file input button
$fileInput = $ "<input type='file' multiple>"
    .hide!
    .appendTo document.body
    .on \change, !->
        console.log "file selector onchange"
        exporter.handleInputFiles @files

# visible import button
isFileSelecting = false
$ "<button class='jtb-import-btn'>Plug.dj / Dubtrack</button>"
    .appendTo $diag.find \.playlist-type-select
    .on \click, !->
        console.log "import btn click"
        if not isFileSelecting
            isFileSelecting := true
            $fileInput.click!
            requestAnimationFrame !->
                isFileSelecting := false

# drag'n'drop support hint
if exporter.browserSupportsDragnDrop
    $diag.find \.playlist-type-select
        .append do
            $ "<div class='jtb-note'>or drag'n'drop the zip/JSON file here.</div>"

# add Export Playlist section
$ "<h3 class='jtb-headline'>Export Playlists</h3>"
    .appendTo $diag

# Export All Playlists button
$ "<button class='jtb-export-btn jtb-btn'>Download All</button>"
    .appendTo $diag
    .on \click, !->
        # update button text
        @textContent = "Downloading…"

        # clear button text reset timer, if any
        clearTimeout @dataset.timeout

        # download all playlists in a zip
        exporter.downloadZip do
            (err, playlists) !~> # done fetching playlists
                if err
                    console.error err
                    $ "<div class=jtb-error>"
                        .text err.message
                        .insertAfter this
                else
                    # note: the ZIP isn't necessarily done saving yet
                    # but it really doesn't matter to us

                    # update button text
                    @textContent = "Downloaded All ✔"

                    # reset button text after 1 minute
                    @dataset.timeout = setTimeout do
                        !~>
                            @textContent "Download All"
                        10min * 60_000min_to_ms

            (err, eta) !~> # ETA update
                if err
                    console.error err
                else
                    if eta < 1
                        eta = "<1"
                    else
                        eta = "ca. #eta"
                    @textContent = "Downloading… #{eta}s"

    # we can't download the auto-generated zip on Safari and IE9-
    .toggle exporter.browserSupportsZip

# individual playlist export hint
$ "<div class='jtb-note'>or click the playlist names<br>to export them individually</div>"
    .appendTo $diag

# safari warning
if exporter.browserIsSafari
    exporter.$name = $ "<b>"
    exporter.$data = $ "<textarea>"
        .css maxHeight: \5em
        .attr \placeholder, "note: because the Safari developers explicitly don't
        \ want to let you download files that were generated on-the-fly,
        \ you <b>cannot</b> download playlists as files on Safari.
        \ Instead, click on a playlist (in the left) and then copy the text
        \ from here and save it in a file manually… or just use a better browser"
        .appendTo $diag
        .on \focus, (.select!)



Dubtrack.View.ImportPlaylistBrowser::openView_ ||= Dubtrack.View.ImportPlaylistBrowser::openView
Dubtrack.View.ImportPlaylistBrowser::openView = !->
    console.log "[ImportPlaylistBrowser] openView"
    $browser .addClass \jtb-importing
    exporter.isImporting := true
    @openView_ ...
Dubtrack.View.ImportPlaylistBrowser::closeView_ ||= Dubtrack.View.ImportPlaylistBrowser::closeView
Dubtrack.View.ImportPlaylistBrowser::closeView = !->
    console.log "[ImportPlaylistBrowser] closeView"
    $browser .removeClass \jtb-importing
    exporter.isImporting := false
    @closeView_ ...
$ \.close-import-playlist
    .on \click, !->
        $browser .removeClass \jtb-importing
        exporter.isImporting := false

Dubtrack.View.playlistItem::viewDetails_ = Dubtrack.View.playlistItem::viewDetails
Dubtrack.View.playlistItem::viewDetails = !->
    console.log "[viewDetails]", exporter.isImporting, @model.get(\_id)
    if exporter.isImporting
        plID = @model.get \_id
        exporter.downloadPlaylist plID
    else
        @viewDetails_ ...
# patch playlist click handler without redrawing
$ \.playlist_icon
    .off \click
    .on \click, (e) !->
        if /playlist-([0-9a-f]{24})/.exec(" #{this.className} ")
            id = that.1
            for pl in Dubtrack.app.browserView.model.models when pl.id == id
                Dubtrack.View.playlistItem::viewDetails.call do
                    model: pl
                    viewDetails_: Dubtrack.View.playlistItem::viewDetails_
                    e
                return
            console.log "[click] pl not found"


#== Drag'n'Drop Handler ==
exporter.isImporting = ($diag.css(\display) != \none)
var dragTarget
$browser
    .toggleClass \jtb-importing, exporter.isImporting

    .on \dragover, (e) !->
        # indicate this element is droppable, if user is dragging files
        e.stopPropagation!; e.preventDefault!

        # make sure Import/Export Dialog is displayed
        $ ".play-song-link, .sidebar .import-playlist" .click!

    # add CSS class `jtb-dropping`
    .on \dragend, (e) !->
        e.stopPropagation!; e.preventDefault!
        $browser .removeClass \jtb-dropping

    # dragexit does NOT seem to work in Chrome v47.0!
    # using `dragleave` and checking for dragTarget instead
    .on \dragenter, (e) !->
        e.stopPropagation!; e.preventDefault!
        $browser .addClass \jtb-dropping
        dragTarget := e.target
    .on \dragleave, (e) !->
        e.stopPropagation!; e.preventDefault!
        if dragTarget == e.target
            $browser .removeClass \jtb-dropping

    # handle file drops
    .on \drop, (e) !->
        $browser .removeClass \jtb-dropping

        # only continue if files have been dropped
        inputfiles = e.originalEvent.dataTransfer?.files
        return if not inputfiles?.0

        e.stopPropagation!; e.preventDefault!

        exporter.handleInputFiles(inputfiles)