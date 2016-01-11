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
var series, fetch, getScript, errorHandler, $css, $icon, slice$ = [].slice;
if (/MSIE [1-9]\./.test(typeof navigator != 'undefined' && navigator !== null ? navigator.userAgent : void 8)) {
  alert("Warning: Internet Explorer <10 is explicitly unsupported by this exporter!");
}
series = function(){
  [].reduce.call(arguments, function(promise, fn){
    return $.Deferred(function(def){
      promise.then(function(){
        var args;
        args = slice$.call(arguments);
        return fn.apply(null, [def.resolve].concat(slice$.call(args)));
      });
    });
  }, $.Deferred(function(it){
    return it.resolve();
  }));
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
  $.getScript(url, function(arg$, status){
    if (status !== 'success') {
      return errorHandler("Error loading " + name + " script: " + status);
    }
    if (!exports in window) {
      setTimeout(function(){
        if (!exports in window) {
          return errorHandler("Error loading " + name + " script: script file loaded, but apparently failed initializing. Maybe your browser is unsupported?");
        } else {
          callback();
        }
      }, 5000);
    } else {
      callback();
    }
  });
};
errorHandler = function(message){
  console.error(message);
  alert(message);
};
$css = $("<style>\n.pl-exporter-spin {\n	font-size: 15px;\n	font-family: initial;\n	float: right;\n	animation: pl-exporter-spin 2s infinite linear;\n}\n@keyframes pl-exporter-spin {\n	0% {\n		transform: rotate(0deg);\n	}\n	100% {\n		transform: rotate(359deg);\n	}\n}\n</style>").appendTo('head');
$icon = $("<i class='pl-exporter-spin'>C</i>");
getScript('JSZip', 'JSZip', 'https://cdnjs.cloudflare.com/ajax/libs/jszip/2.5.0/jszip.min.js', function(){
  var zip;
  zip = new JSZip();
  fetch("playlists", "https://api.dubtrack.fm/playlist", function(playlists){
    var fileNames;
    fileNames = {};
    playlists.reduce(function(promise, pl){
      return $.Deferred(function(def){
        promise.then(function(){
          $icon.appendTo(".playlist-" + pl._id);
          fetch("songs (" + pl.name + ")", "https://api.dubtrack.fm/playlist/" + pl._id + "/songs", function(songs){
            var i, filename, _song;
            i = 0;
            filename = pl.name;
            while (filename in fileNames) {
              filename = pl.name + " (" + (++i) + ")";
            }
            fileNames[filename] = true;
            console.log("adding '" + pl.name + "' to zip");
            zip.file(pl.name + ".json", JSON.stringify({
              meta: {},
              time: 0,
              status: 'ok',
              data: (function(){
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
              }())
            }));
            def.resolve();
          });
        });
      });
    }, $.Deferred(function(it){
      return it.resolve();
    })).then(function(){
      $icon.remove();
      $css.remove();
      console.log("done fetching data!");
      getScript('FileSaver', 'saveAs', 'https://cdn.rawgit.com/eligrey/FileSaver.js/master/FileSaver.min.js', function(){
        var date;
        date = /[^T]+/.exec(new Date().toISOString())[0];
        saveAs(zip.generate({
          type: 'blob'
        }), date + "_dubtrack_playlists.zip");
        console.log("zip download started!");
      });
    });
  });
});
