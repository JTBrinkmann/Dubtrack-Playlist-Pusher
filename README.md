# dubtrack-playlist-exporter
Exports Dubtrack playlists to a plug.dj playlist JSON format; useful for transferring playlists to another account.

Usage
-----
Create a bookmarklet with the following URL:
```js
javascript:$.getScript("https://rawgit.com/JTBrinkmann/dubtrack-playlist-exporter/master/exporter.js");void(8)
```

Give it any name (e.g. "dubtrack-playlist-exporter"). Then go to Dubtrack (make sure you're logged in) and click the bookmarklet.
If you have problems, detailed instructions on how to add bookmarklets here http://www.howtogeek.com/189358/beginner-geek-how-to-use-bookmarklets-on-any-device/

Compatibility
-------------
Exporting playlists works on all browsers that can run Dubtrack, however saving the playlists in a ZIP might not. Currently, it's been tested to work on **Google Chrome**, **Firefox** and **Internet Explorer 10**.

Apparently it is **not** working on **Internet Explorer 9** and **Safari**. If it doesn't work for you, you can simply try again on another browser (possibly even on another device). The exporter has not yet been tested with mobile browsers.

Importing
---------
This exporter has been made to be completly compatible with existing Dubtrack playlist importers like https://dubtrack-playlist.appspot.com/

To transfer/copy playlists to another account, use this exporter to download your playlists, then use the [playlist importer](https://dubtrack-playlist.appspot.com/) to import any playlist individually to the other account. Voilà!
