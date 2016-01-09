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

# IE <10 is explicitly unsupported
if /MSIE [1-9]\./.test(navigator?.userAgent)
	alert "Warning: Internet Explorer <10 is explicitly unsupported by this exporter!"

#== helper functions ==
series = !-> [].reduce.call &, ((promise, fn) -> $.Deferred (def) !-> promise.then (...args) -> fn def.resolve, ...args), $.Deferred (.resolve!)

# fetches a JSON file
fetch = (name, url, callback) !->
	console.log "[fetch]", name
	$.getJSON url, (data, status) !->
		if status != \success or data.code != 200
			{code, message, data} = data
			errorHandler "Error ##code fetching #name: #message. #{data.message}."
		else
			callback data.data

getScript = (name, exports, url, callback) !->
	if exports of window
		# looks like the script is already loaded
		return callback!

	console.log "[getScript]", name
	(,status) <-! $.getScript url

	if status != \success
		return errorHandler "Error loading #name script: #status"

	# though unlikely, callback may be fired before script is executed
	# check if script exported desired variable, if not wait 5s
	if not exports of window
		setTimeout do
			!->
				# check again
				if not exports of window
					# give up
					return errorHandler "Error loading #name script: script file loaded, but apparently failed initializing. Maybe your browser is unsupported?"
				else
					callback!
			5_000ms
	else
		callback!

# error handler
errorHandler = (message) !->
	console.error(message)
	alert message #ToDo

#== main ==
# add CSS for spinning circle animation
$css = $ """<style>
.pl-exporter-spin {
	font-size: 15px;
	font-family: initial;
	float: right;
	animation: pl-exporter-spin 2s infinite linear;
}
@keyframes pl-exporter-spin {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(359deg);
	}
}
</style>""" #.replace(/(.*)(transform|animation)(.*)/g, '$1-webkit-$3\n$1$3').replace(/@([\s\S]+)\}/, '@-webkit-$1\n@$1')
	.appendTo \head
$icon = $ "<i class='pl-exporter-spin'>C</i>"

# prepare output zip
<-! getScript \JSZip, \JSZip, 'https://cdnjs.cloudflare.com/ajax/libs/jszip/2.5.0/jszip.min.js'

zip = new JSZip()

# get playlists
(playlists) <-! fetch "playlists", "https://api.dubtrack.fm/playlist"

# bitmap to avoid having multiple files with the same name
# because Dubtrack allows multiple playlists to have the same name
fileNames = {}

# asynchroneously load all playlists and add them to zip
playlists.reduce do
	(promise, pl) -> $.Deferred (def) !-> promise.then !->
		# get songs
		$icon .appendTo ".playlist-#{pl._id}"
		(songs) <-! fetch "songs (#{pl.name})", "https://api.dubtrack.fm/playlist/#{pl._id}/songs"

		# choose filename (see comments above `fileNames = {}`)
		i = 0
		filename = pl.name
		while filename of fileNames
			filename = "#{pl.name} (#{++i})"
		fileNames[filename] = true

		console.log "adding '#{pl.name}' to zip"
		# add playlist as JSON file to output zip
		zip.file "#{pl.name}.json", JSON.stringify do
			meta: {}, time: 0, status: \ok # useless plug.dj crap
			data: for {_song} in songs
				_song{cid:fkid, duration:songLength, id:_id, name:title}
					..image = _song.images.thumbnail
					..format = 1+(_song.type == \soundcloud)
					..artist = ''
					..

		# fetch neyxt playlist
		def.resolve!
	$.Deferred (.resolve!)
.then !->
	# done fetching playlist data!
	$icon .remove!
	$css .remove!
	console.log "done fetching data!"

	# get FileSaver.js
	# note: koffsyrup's fork has better IE support for text files,
	# but as we try to export a zip, it doesn't really matter yet
	# maybe one day, if we'll ever implement <IE10 support
	<-! getScript \FileSaver, \saveAs, 'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2014-11-29/FileSaver.min.js'

	# save as ZIP
	date = /[^T]+/.exec(new Date().toISOString!).0
	saveAs zip.generate(type:\blob), "#{date}_dubtrack_playlists.zip"
	console.log "zip download started!"
