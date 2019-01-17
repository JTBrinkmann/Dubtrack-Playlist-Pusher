/*
 * Dubtrack Playlist Exporter
 * by Brinkie Pie (aka. jtbrinkmann)
 *
 * This exports playlists in the plug.dj format,
 * to provide compatibility with existing importers.
 * Technically it would only need  to save format and cid/fkid
 * of each song, for importers to work.
 *
 * NOTE: THIS SCRIPT WAS WRITTEN IN LIVESCRIPT!
 * If you are looking at the JavaScript source, you might want to instead
 * hop over to the livescript source files, for a more understandable
 * and better documented code (LiveScript strips single line comments when compiled)
 * You can find the source files at:
 * https://github.com/JTBrinkmann/Dubtrack-Playlist-Pusher/tree/master/src
 */

# close previous instance, if any
try window.pusher?.noConflict?!

require! {
    auxiliaries: 'aux'
}

try
  isFileSaverSupported = !!new Blob
  
  
if !isFileSaverSupported
    # let FileSaver load in the background
    aux.getScript \FileSaver, \saveAs, "https://cdn.rawgit.com/eligrey/FileSaver.js/master/dist/FileSaver.min.js"


# add CSS
$ \#jtb-css .remove!
$css = $ "<link rel=stylesheet id=jtb-css href='https://cdn.rawgit.com/JTBrinkmann/dubtrack-playlist-pusher/master/styles.css'>"
    .appendTo \head

# show playlist manager (for maximum fun)
$ \.play-song-link .click!

# load Playlist Pusher API
window.pusher = require \api

# let JSZip load in the background, if downloading ZIPs is supported
if window.pusher.browserSupportsZip
    aux.getScript \JSZip, \JSZip, "https://cdnjs.cloudflare.com/ajax/libs/jszip/2.5.0/jszip.min.js"


# load GUI
Dubtrack.app.loadUserPlaylists !->
    require \gui

    # apply split-playlist button patch
    require \split-playlist