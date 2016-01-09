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
var suspend, fetch, getScript, errorHandler;
suspend = function(generator, callback){
  var gen, args, queue, running;
  gen = generator(next);
  args = [];
  queue = 0;
  running = false;
  function next(){
    var val;
    args[queue++] = arguments;
    while (!running && queue) {
      running = true;
      val = gen.next(args[--queue]);
      if (val.done) {
        if (typeof callback == 'function') {
          callback();
        }
        break;
      } else {
        running = false;
      }
    }
  } next();
};
fetch = function(name, url, callback){
  console.log("[fetch]", name);
  $.getJSON(url, function(data, status){
    var ref$, code, message;
    if (status !== 'success' || data.code !== 200) {
      ref$ = data, code = ref$.code, message = ref$.message, data = ref$.data;
      errorHandler("Error #" + code + " fetching " + name + ": " + message + ". " + data.message + ".");
    } else {
      callback(data.data);
    }
  });
};
getScript = function(name, exports, url, callback){
  if (exports in window) {
    return callback();
  }
  console.log("[getScript]", name);
  suspend(function*(defer){
    var ref$, status;
    ref$ = (yield $.getScript(url, defer)), status = ref$[1];
    if (status !== 'success') {
      return errorHandler("Error loading " + name + " script: " + status);
    }
    if (!exports in window) {
      (yield setTimeout(defer, 5000));
      if (!exports in window) {
        return errorHandler("Error loading " + name + " script: script file loaded, but apparently failed initializing. Maybe your browser is unsupported?");
      }
    }
    callback();
  });
};
errorHandler = function(message){
  console.error(message);
  alert(message);
};
suspend(function*(defer){
  var $css, $icon, zip, playlists, fileNames, i$, len$, pl, songs, i, filename, _song, date, fn$ = function*(){
    var i$, ref$, len$, x$, results$ = [];
    for (i$ = 0, len$ = (ref$ = songs).length; i$ < len$; ++i$) {
      _song = ref$[i$]._song;
      x$ = {
        cid: _song.fkid,
        duration: _song.songLength,
        id: _song._id,
        name: _song.title
      };
      x$.image = _song.images.thumbnail;
      x$.format = 1 + (_song.type === 'soundcloud');
      x$.artist = '';
      x$;
      results$.push(x$);
    }
    return results$;
  };
  $css = $("<style>\n.pl-exporter-spin {\n	font-size: 15px;\n	font-family: initial;\n	float: right;\n	animation: pl-exporter-spin 2s infinite linear;\n}\n@keyframes pl-exporter-spin {\n	0% {\n		transform: rotate(0deg);\n	}\n	100% {\n		transform: rotate(359deg);\n	}\n}\n</style>").appendTo('head');
  $icon = $("<i class='pl-exporter-spin'>C</i>");
  (yield getScript('JSZip', 'JSZip', 'https://cdnjs.cloudflare.com/ajax/libs/jszip/2.5.0/jszip.min.js', defer));
  zip = new JSZip();
  playlists = (yield fetch("playlists", "https://api.dubtrack.fm/playlist", defer))[0];
  fileNames = {};
  for (i$ = 0, len$ = playlists.length; i$ < len$; ++i$) {
    pl = playlists[i$];
    $icon.appendTo(".playlist-" + pl._id);
    songs = (yield fetch("songs (" + pl.name + ")", "https://api.dubtrack.fm/playlist/" + pl._id + "/songs", defer))[0];
    i = 0;
    filename = pl.name;
    while (filename in fileNames) {
      filename = pl.name + " (" + (++i) + ")";
    }
    fileNames[filename] = true;
    zip.file(pl.name + ".json", JSON.stringify({
      meta: {},
      time: 0,
      status: 'ok',
      data: (yield* (fn$()))
    }));
  }
  $icon.remove();
  $css.remove();
  console.log("done fetching data!");
  (yield getScript('FileSaver', 'saveAs', 'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2014-11-29/FileSaver.min.js', defer));
  date = /[^T]+/.exec(new Date().toISOString())[0];
  saveAs(zip.generate({
    type: 'blob'
  }), date + "_dubtrack_playlists.zip");
  console.log("zip download started!");
});
