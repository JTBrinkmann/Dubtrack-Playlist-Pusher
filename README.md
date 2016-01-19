Dubtrack Playlist Pusher
========================
Adds simple and intuitive playlist **importing** & **exporting** capabilities to Dubtrack; useful for transferring playlists to another account.

![Why can't we just take our Dubtrack playlists, and push them somewhere else?](http://i.imgur.com/mygfvYj.jpg)


Usage
-----
Create a bookmarklet with the following URL:
```js
javascript:$.getScript("https://rawgit.com/JTBrinkmann/dubtrack-playlist-exporter/master/exporter.js");void(8)
```

Give it any name (e.g. "Dubtrack Playlist Pusher"). Then go to Dubtrack (make sure you're logged in) and click the bookmarklet.
[more detailed instructions](http://www.howtogeek.com/189358/beginner-geek-how-to-use-bookmarklets-on-any-device/)

Then go to Dubtrack.fm, be logged in and click the bookmark. Go to the playlist manager (it should auto-open) and click the "Import/Export playlists" button in the bottom-left corner.

**NOTE:** Freshly imported playlists might not show up in the playlist-list, or show up with with a wrong number of songs. Refreshing the page fixes this (sorry).


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
