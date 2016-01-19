/*
 * Dubtrack Playlist Exporter
 * by Brinkie Pie (aka. jtbrinkmann)
 *
 * This exports playlists in the plug.dj format,
 * to provide compatibility with existing importers.
 * Technically it would only need  to save format and cid/fkid
 * of each song, for importers to work.
 *
 * This is a more serious implementation. For a more fun one (ab)using
 * fancy code-patterns and newer browser features, see the file
 * exporter.es2015.ls (in the same folder / at the same base URL as this one)
 */

require! {
    auxiliaries: 'aux'
    api
}


# let FileSaver load in the background
aux.getScript \FileSaver, \saveAs, "https://cdn.rawgit.com/koffsyrup/FileSaver.js/master/FileSaver.js"


# add CSS for spinning circle animation
$ \#jtb-css .remove!
$css = $ "<link rel=stylesheet id=jtb-css href='https://cdn.rawgit.com/JTBrinkmann/dubtrack-playlist-exporter/master/styles.css'>"
    .appendTo \head

# show playlist manager (for maximum fun)
$ \.play-song-link .click!

# load API
window.exporter = require \api

# let JSZip load in the background, if downloading ZIPs is supported
if exporter.browserSupportsZip
    aux.getScript \JSZip, \JSZip, "https://cdnjs.cloudflare.com/ajax/libs/jszip/2.5.0/jszip.min.js"


# load GUI
Dubtrack.app.loadUserPlaylists !->
    require \gui