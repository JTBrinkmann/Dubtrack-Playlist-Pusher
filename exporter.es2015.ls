/*
 * Dubtrack Playlist Exporter
 * by Brinkie Pie (aka. jtbrinkmann)
 *
 * This exports playlists in the plug.dj format,
 * to provide compatibility with existing importers.
 * Technically it would only need  to save format and cid/fkid
 * of each song, for importers to work.
 *
 * I wanted to try something new, so I (ab)used generators
 * to create async code that looks as pretty as synchroneous code
 * (i.e. without the async-typical waterfall)
 * This is such a small script, I don't see why I shouldn't be allowed
 * to go a bit overboard ^3^
 */

#== helper functions ==
# tiny ES2015 implementation of an await-defer feature,
# within the first argument (function called `generator`) you can use
# suspend the execution by using `yield` and continue it by calling `defer`
# it makes sense to have defer in/as the callback of an async function
#
# idea inspired by IcedCoffeeScript http://maxtaco.github.io/coffee-script/
# implementation inspired by suspend https://github.com/jmar777/suspend
suspend = (generator, callback) !->
	gen = generator(next)
	args = []; queue=0
	running = false
	do !function next
		args[queue++] = arguments
		while not running and queue
			running := true
			val = gen.next(args[--queue])
			if val.done
				# keep `running == true` to silence any further calls of next()
				callback?!
				break
			else
				running := false

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
	(defer) *<-! suspend
	[,status] = yield $.getScript url, defer

	if status != \success
		return errorHandler "Error loading #name script: #status"

	# though unlikely, callback may be fired before script is executed
	# check if script exported desired variable, if not wait 5s
	if not exports of window
		yield setTimeout defer, 5_000ms

		# check again
		if not exports of window
			# give up
			return errorHandler "Error loading #name script: script file loaded, but apparently failed initializing. Maybe your browser is unsupported?"

	callback!

# error handler
errorHandler = (message) !->
	console.error(message)
	alert message #ToDo

#== main ==
# apply await-defer patch
# (note: instead of `await`, we must actually use `yield`)
(defer) *<-! suspend

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
yield getScript \JSZip, \JSZip, 'https://cdnjs.cloudflare.com/ajax/libs/jszip/2.5.0/jszip.min.js', defer
zip = new JSZip()

# get playlists
[playlists] = yield fetch "playlists", "https://api.dubtrack.fm/playlist", defer

# bitmap to avoid having multiple files with the same name
# because Dubtrack allows multiple playlists to have the same name
fileNames = {}

# load all playlists and add them to zip
for pl in playlists
	# get songs
	$icon .appendTo ".playlist-#{pl._id}"
	[songs] = yield fetch "songs (#{pl.name})", "https://api.dubtrack.fm/playlist/#{pl._id}/songs", defer

	# choose filename (see comments above `fileNames = {}`)
	i = 0
	filename = pl.name
	while filename of fileNames
		filename = "#{pl.name} (#{++i})"
	fileNames[filename] = true

	# add playlist as JSON file to output zip
	zip.file "#{pl.name}.json", JSON.stringify do
		meta: {}, time: 0, status: \ok # useless plug.dj crap
		data: for {_song} in songs
			_song{cid:fkid, duration:songLength, id:_id, name:title}
				..image = _song.images.thumbnail
				..format = 1+(_song.type == \soundcloud)
				..artist = ''
				.. # told you I'd go a bit overboard with code-patterns

# done fetching playlist data!
$icon .remove!
$css .remove!
console.log "done fetching data!"

# get FileSaver.js
# note: koffsyrup's fork has better IE support for text files,
# but as we try to export a zip, it doesn't really matter yet
# maybe one day, if we'll ever implement <IE10 support
yield getScript \FileSaver, \saveAs, 'https://cdn.rawgit.com/eligrey/FileSaver.js/master/FileSaver.min.js', defer

# save as ZIP
date = /[^T]+/.exec(new Date().toISOString!).0
saveAs zip.generate(type:\blob), "#{date}_dubtrack_playlists.zip"
console.log "zip download started!"
