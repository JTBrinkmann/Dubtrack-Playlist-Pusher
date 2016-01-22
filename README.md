Dubtrack Playlist Pusher
========================
Adds simple and intuitive playlist **importing**, **exporting** and splitting capabilities to Dubtrack; useful for transferring playlists to another account.

![Why can't we just take our Dubtrack playlists, and push them somewhere else?](http://i.imgur.com/oxFwWnN.jpg)


Usage
-----
Create a bookmarklet with the following URL:
```js
javascript:$.getScript("https://rawgit.com/JTBrinkmann/Dubtrack-Playlist-Pusher/master/index.js");void(8)
```

Give it any name (e.g. "Dubtrack Playlist Pusher"). Then go to Dubtrack (make sure you're logged in) and click the bookmarklet.
[more detailed instructions](http://www.howtogeek.com/189358/beginner-geek-how-to-use-bookmarklets-on-any-device/)

Then go to Dubtrack.fm, be logged in and click the bookmark. Go to the playlist manager (it should auto-open)

### to import or export
Click the "Import/Export playlists" button in the bottom-left corner. Then follow the instructions that show up (it's dead simple, really).

![screenshot of the import/export button](https://i.imgur.com/TKHHJoO.png)

Importing playlists can take anywhere between 10-30 seconds per 100 songs in the playlist (because Dubtrack doesn't support moving songs in bulk).

**NOTE:** Freshly imported playlists might not show up in the playlist-list, or show up with with a wrong number of songs. Refreshing the page fixes this (sorry).

### to split playlists
Open a playlist and click, select your desired playlist-size by clicking the "Split Size" button. **If you don't see the two "split" buttons, try changing to another playlist and back.** Click the "Split Playlist" button to start splitting.

![screenshot of the split buttons](https://i.imgur.com/JwyNYKU.png)

**This WILL take a while!** As mentioned with the importing, splitting playlists can take anywhere between 10-30 seconds per 100 songs in the playlist (because Dubtrack doesn't support moving songs in bulk). **You cannot automatically undo splitting**, make backups first! (i.e. export the playlist using this script, **before** splitting).

The "Split Size" refers to how large the chunks will be, that the playlist gets split into. For example, when splitting a 333 song playlist with split size = 100, the 4 resulting playlists will have 100, 100, 100, and 33 songs respectively.

If you notice there are less songs after splitting then there were before, there are two possible reasons:
* the song count was incorrect, and the amount of songs did infact not change
* songs that were removed from Soundcloud or Youtube were automatically removed by Dubtrack


Compatibility
-------------
**(PLEASE READ, SAFARI USERS)**

Tested to work on **Google Chrome**, **Firefox** and **Internet Explorer 10** and up.

Apparently it is **not** working on **Internet Explorer 9** (and below) and **Safari**. This is because these browsers don't support downloading files that were generated on-the-fly (which is what this exporter does). If it doesn't work for you, you can simply try again on another browser (possibly even on another device). The exporter has not yet been tested with mobile browsers.


Importing
---------
You can use this tool to import playlists that were exported with this tool, and playlists exported from plug.dj. It also works across accounts!
In addition, playlists exported with this tool are completly compatible with other Dubtrack playlist importers like [dubtrack-playlist.appspot.com](https://dubtrack-playlist.appspot.com/)


Transferring Playlists
----------------------
Seriously? Just export them from one account, copy the files over (if necessary) and import them into the other account.
