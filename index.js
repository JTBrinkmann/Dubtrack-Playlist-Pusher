/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

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
	var aux, api, $css;
	aux = __webpack_require__(1);
	api = __webpack_require__(2);
	aux.getScript('FileSaver', 'saveAs', "https://cdn.rawgit.com/koffsyrup/FileSaver.js/master/FileSaver.js");
	$('#jtb-css').remove();
	$css = $("<link rel=stylesheet id=jtb-css href='https://cdn.rawgit.com/JTBrinkmann/dubtrack-playlist-exporter/master/styles.css'>").appendTo('head');
	$('.play-song-link').click();
	window.exporter = __webpack_require__(2);
	if (exporter.browserSupportsZip) {
	  aux.getScript('JSZip', 'JSZip', "https://cdnjs.cloudflare.com/ajax/libs/jszip/2.5.0/jszip.min.js");
	}
	Dubtrack.app.loadUserPlaylists(function(){
	  __webpack_require__(5);
	});

/***/ },
/* 1 */
/***/ function(module, exports) {

	var fetch, getScript, errorHandler, out$ = typeof exports != 'undefined' && exports || this;
	out$.fetch = fetch = function(name, url, callback){
	  if (typeof console.time == 'function') {
	    console.time("[fetch] " + name);
	  }
	  $.getJSON(url, function(data, status){
	    var ref$, code, message;
	    if (typeof console.timeEnd == 'function') {
	      console.timeEnd("[fetch] " + name);
	    }
	    if (status !== 'success' || data.code !== 200) {
	      ref$ = data, code = ref$.code, message = ref$.message, data = ref$.data;
	      errorHandler("Error #" + code + " fetching " + name + ": " + message + ". " + data.message + ".");
	    } else {
	      callback(data.data);
	    }
	  });
	};
	out$.getScript = getScript = function(name, exports, url, callback){
	  if (exports in window) {
	    return typeof callback == 'function' ? callback() : void 8;
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
	          if (typeof callback == 'function') {
	            callback();
	          }
	        }
	      }, 5000);
	    } else {
	      if (typeof callback == 'function') {
	        callback();
	      }
	    }
	  });
	};
	out$.errorHandler = errorHandler = function(message){
	  console.error(message);
	  alert(message);
	};

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var aux, handleInputFiles, MAX_PAGE_SIZE, FORMATS, browserIsSafari, ref$, ref1$, exporter, ref2$, out$ = typeof exports != 'undefined' && exports || this;
	aux = __webpack_require__(1);
	handleInputFiles = __webpack_require__(3).handleInputFiles;
	MAX_PAGE_SIZE = 20;
	FORMATS = [void 8, 'youtube', 'soundcloud'];
	browserIsSafari = ((ref$ = navigator.vendor) != null ? ref$.indexOf('Apple') : void 8) !== -1 && !((ref1$ = navigator.userAgent) != null && ref1$.indexOf('CriOS')) !== -1;
	exporter = module.exports;
	ref2$ = out$;
	ref2$._debug = {};
	ref2$.aux = aux;
	ref2$.avgPageFetch = 200;
	ref2$.avgPageFetchSamples = 2;
	ref2$.playlists = {};
	ref2$.isImporting = false;
	ref2$.browserIsSafari = browserIsSafari;
	ref2$.browserSupportsZip = window.Blob && !browserIsSafari;
	ref2$.browserSupportsDragnDrop = 'draggable' in document.body;
	ref2$.$loadingIcon = $("<i class='jtb-spin'>C</i>");
	ref2$.fetchPlaylistsList = function(callback){
	  var pls, i, playlistsArr, res$;
	  if (exporter._playlistsArr) {
	    if (typeof callback == 'function') {
	      callback(void 8, exporter._playlistsArr);
	    }
	  } else if (Dubtrack.app.browserView) {
	    pls = Dubtrack.app.browserView.model.models;
	    i = pls.length;
	    res$ = [];
	    while (i--) {
	      res$.push(pls[i].attributes);
	    }
	    playlistsArr = res$;
	    exporter._playlistsArr = playlistsArr;
	    if (typeof callback == 'function') {
	      callback(void 8, playlistsArr);
	    }
	  } else {
	    aux.fetch("playlists", "https://api.dubtrack.fm/playlist", function(playlistsArr){
	      if (!('length' in playlistsArr)) {
	        console.warn("playlists data not an array", playlistsArr);
	        return callback(new TypeError("couldn't parse playlists data"));
	      }
	      playlistsArr = playlistsArr.sort(function(a, b){
	        if (a.name < b.name) {
	          return -1;
	        } else if (a.name > b.name) {
	          return +1;
	        } else {
	          return 0;
	        }
	      });
	      exporter._playlistsArr = playlistsArr;
	      if (typeof callback == 'function') {
	        callback(void 8, playlistsArr);
	      }
	    });
	  }
	};
	ref2$.getPlaylist = function(playlist, callback){
	  var plID;
	  if (typeof callback !== 'function') {
	    return;
	  }
	  if (!playlist) {
	    callback(new TypeError("no valid playlist specified"));
	  } else if (playlist._id) {
	    callback(void 8, playlist);
	  } else {
	    if (typeof playlist === 'string') {
	      plID = playlist;
	    } else if ('id' in playlist) {
	      plID = playlist.id;
	    } else {
	      callback(new TypeError("no valid playlist specified"));
	      return;
	    }
	    exporter.fetchPlaylistsList(function(err){
	      var i$, ref$, len$, pl;
	      if (err) {
	        return callback(err);
	      }
	      for (i$ = 0, len$ = (ref$ = exporter._playlistsArr).length; i$ < len$; ++i$) {
	        pl = ref$[i$];
	        if (pl._id === plID) {
	          return callback(void 8, pl);
	        }
	      }
	      callback(new TypeError("playlist not found"));
	    });
	  }
	};
	ref2$.fetchPlaylist = function(playlist, callback){
	  var d;
	  d = Date.now();
	  exporter.getPlaylist(playlist, function(err, pl){
	    var ref$, songs, ref1$, i$, ref2$, len$, totalItems, $playlist, pages;
	    if (err) {
	      return typeof callback == 'function' ? callback(err) : void 8;
	    }
	    if (pl._id in exporter.playlists) {
	      return callback(void 8, exporter.playlists[pl._id]);
	    } else if ((ref$ = Dubtrack.app.browserView) != null && ref$.browserItemsList) {
	      songs = Dubtrack.app.browserView.browserItemsList.model.models;
	      if (((ref1$ = songs[0]) != null ? ref1$.attributes.playlistid : void 8) === pl._id) {
	        for (i$ = 0, len$ = (ref2$ = Dubtrack.app.browserView.browserItemsList.model.models).length; i$ < len$; ++i$) {
	          pl = ref2$[i$];
	          throw Error('unimplemented');
	        }
	      }
	    }
	    totalItems = pl.totalItems || 0;
	    if (totalItems === 0) {
	      console.log("skipping empty playlist '" + pl.name + "'");
	    }
	    $playlist = $(".playlist-" + pl._id).append(exporter.$loadingIcon);
	    exporter._debug.playlists = {};
	    pages = Math.ceil(totalItems / MAX_PAGE_SIZE);
	    $.Deferred(function(defFetchSongs){
	      var songs, offset, page, fetchPage;
	      songs = new Array(totalItems);
	      offset = 0;
	      page = 0;
	      exporter._debug.playlists[pl.name] = [];
	      (fetchPage = function(){
	        if (++page <= pages) {
	          aux.fetch("songs (" + pl.name + ") [" + page + "/" + pages + "]", "https://api.dubtrack.fm/playlist/" + pl._id + "/songs?page=" + page, function(page){
	            var ref$, i$, len$, o, _song, err;
	            (ref$ = exporter._debug.playlists[pl.name])[ref$.length] = page;
	            try {
	              for (i$ = 0, len$ = page.length; i$ < len$; ++i$) {
	                o = i$;
	                _song = page[i$]._song;
	                songs[o + offset] = {
	                  id: _song._id,
	                  cid: _song.fkid,
	                  format: FORMATS.indexOf(_song.type),
	                  artist: '',
	                  name: _song.title,
	                  duration: _song.songLength,
	                  image: _song.images.thumbnail
	                };
	              }
	              offset += page.length;
	            } catch (e$) {
	              err = e$;
	              callback(new TypeError("couldn't parse song data (" + err + ")"));
	            }
	            fetchPage();
	          });
	        } else {
	          defFetchSongs.resolve(songs);
	        }
	      })();
	    }).then(function(songs){
	      exporter.playlists[pl._id] = {
	        id: pl._id,
	        name: pl.name,
	        totalItems: totalItems,
	        data: {
	          time: Date.now() - d,
	          status: 'ok',
	          data: songs,
	          meta: {
	            id: pl.id,
	            name: pl.name,
	            totalItems: pl.totalItems
	          }
	        }
	      };
	      $playlist.addClass('jtb-playlist-loaded');
	      exporter.$loadingIcon.remove();
	      if (pages !== 0) {
	        exporter.avgPageFetch *= exporter.avgPageFetchSamples;
	        exporter.avgPageFetch += (Date.now() - d) / pages;
	        exporter.avgPageFetch /= ++exporter.avgPageFetchSamples;
	      }
	      if (typeof callback == 'function') {
	        callback(void 8, exporter.playlists[pl._id]);
	      }
	    });
	  });
	};
	ref2$.etaFetchAllPlaylists = function(callback){
	  exporter.fetchPlaylistsList(function(err, playlistsArr){
	    var eta, i$, len$, pl;
	    if (err) {
	      return typeof callback == 'function' ? callback(err) : void 8;
	    }
	    eta = 0;
	    for (i$ = 0, len$ = playlistsArr.length; i$ < len$; ++i$) {
	      pl = playlistsArr[i$];
	      if (pl.totalItems && !(pl._id in exporter.playlists)) {
	        eta += exporter.avgPageFetch * Math.ceil(pl.totalItems / MAX_PAGE_SIZE);
	      }
	    }
	    console.info("ETA for fetching all songs: %c" + Math.round(eta / 1000) + "s", 'font-weight: bold');
	    callback(null, eta);
	  });
	};
	ref2$.fetchAllPlaylists = function(callback, etaCallback){
	  var etaTimeout, updateETA;
	  if (typeof etaCallback === 'function') {
	    updateETA = function(){
	      clearTimeout(etaTimeout);
	      exporter.etaFetchAllPlaylists(function(err, eta){
	        if (!err) {
	          etaCallback(Math.round(eta / 1000));
	          etaTimeout = setTimeout(updateETA, 1000);
	        }
	      });
	    };
	  }
	  exporter.fetchPlaylistsList(function(err, playlistsArr){
	    if (err) {
	      return typeof callback == 'function' ? callback(err) : void 8;
	    }
	    $.Deferred(function(defFetchPlaylists){
	      var i, fetchNextPlaylist;
	      if (typeof console.time == 'function') {
	        console.time("fetched playlists' songs");
	      }
	      i = 0;
	      (fetchNextPlaylist = function(err){
	        var pl;
	        if (err) {
	          return typeof callback == 'function' ? callback(err) : void 8;
	        }
	        if (updateETA) {
	          updateETA();
	        }
	        pl = playlistsArr[i++];
	        if (pl) {
	          exporter.fetchPlaylist(pl, fetchNextPlaylist);
	        } else {
	          defFetchPlaylists.resolve();
	        }
	      })();
	    }).then(function(){
	      if (typeof console.timeEnd == 'function') {
	        console.timeEnd("fetched playlists' songs");
	      }
	      if (updateETA) {
	        clearTimeout(etaTimeout);
	      }
	      if (typeof callback == 'function') {
	        callback();
	      }
	    });
	  });
	};
	ref2$.downloadPlaylist = function(playlist){
	  exporter.fetchPlaylist(playlist, function(err, pl){
	    if (err) {
	      return typeof callback == 'function' ? callback(err) : void 8;
	    }
	    $(".play-song-link, .sidebar .import-playlist").click();
	    if (exporter.browserIsSafari) {
	      exporter.$data.val(JSON.stringify(pl.data));
	      exporter.$name.text(pl.name + ".json");
	    } else {
	      saveTextAs(JSON.stringify(pl.data), pl.name + ".json");
	    }
	  });
	};
	ref2$.downloadZip = function(){
	  var i$, ref$, pl, o, filename, date;
	  if (!exporter.zip) {
	    exporter.zip = new JSZip();
	    for (i$ in ref$ = exporter.playlists) {
	      pl = ref$[i$];
	      o = 1;
	      filename = pl.name;
	      while (filename in exporter.zip.files) {
	        filename = pl.name + " (" + (++o) + ")";
	      }
	      exporter.zip.file(filename + ".json", JSON.stringify(pl.data));
	    }
	  }
	  date = /[^T]+/.exec(new Date().toISOString())[0];
	  saveAs(exporter.zip.generate({
	    type: 'blob'
	  }), date + "_dubtrack_playlists.zip");
	  console.log("zip download started!");
	};
	ref2$.createPlaylist = function(name, optSongs, callback){
	  var x$;
	  if (!optSongs || typeof optSongs === 'function') {
	    callback = optSongs;
	    optSongs = null;
	  }
	  x$ = new Dubtrack.Model.Playlist({
	    name: name
	  });
	  x$.parse = Dubtrack.helpers.parse;
	  x$.save({}, {
	    success: function(pl){
	      Dubtrack.user.playlist.add(pl);
	      if (optSongs) {
	        exporter.importSongs(pl.id, optSongs, callback, x$);
	      } else {
	        if (typeof callback == 'function') {
	          callback(void 8, pl);
	        }
	      }
	    }
	  });
	};
	ref2$.importSongs = function(playlistID, songsArray, callback, _internal_pl){
	  var i, title;
	  i = 0;
	  title = "imported " + songsArray.length + " songs into " + playlistID;
	  console.time(title);
	  function importSong(){
	    var song, ref$, url;
	    song = songsArray[i++];
	    if (song) {
	      if (typeof song.cid !== 'string' || ((ref$ = song.format) !== 1 && ref$ !== 2)) {
	        console.warn("skipping song with unknown format", song);
	        i++;
	        importSong();
	      } else {
	        url = Dubtrack.config.apiUrl + Dubtrack.config.urls.playlistSong.split(':id').join(playlistID);
	        Dubtrack.helpers.sendRequest(url, {
	          fkid: song.cid,
	          type: FORMATS[song.format]
	        }, 'post', importSong);
	      }
	    } else {
	      console.timeEnd(title);
	      if (typeof callback === 'function') {
	        if (_internal_pl) {
	          callback(void 8, _internal_pl, songsArray);
	        } else {
	          callback(void 8, songsArray);
	        }
	      }
	    }
	  } importSong();
	};
	ref2$.handleInputFiles = handleInputFiles;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var $filelist, handleInputFiles, out$ = typeof exports != 'undefined' && exports || this;
	$filelist = __webpack_require__(4).$el;
	out$.handleInputFiles = handleInputFiles = function(inputfiles){
	  var $playlistSelect, i$, ref$, len$, pl, autoScrolling, scrollTo;
	  exporter._debug.inputfiles = inputfiles;
	  $(".play-song-link, .sidebar .import-playlist").click();
	  $playlistSelect = $("<select class=jtb-playlist-select>").append($("<option disabled>select destination</option>")).append($("<option value=new>create new</option>")).append($("<option disabled>------------------</option>"));
	  for (i$ = 0, len$ = (ref$ = Dubtrack.app.browserView.model.models).length; i$ < len$; ++i$) {
	    pl = ref$[i$];
	    $('<option>').text(pl.attributes.name).val(pl.id).appendTo($playlistSelect);
	  }
	  $filelist.show();
	  autoScrolling = 0;
	  scrollTo = $filelist[0].scrollHeight;
	  handleFiles($filelist, inputfiles);
	  function handleFiles($parentEl, files){
	    var i$, len$, file;
	    console.log("adding files", files);
	    for (i$ = 0, len$ = files.length; i$ < len$; ++i$) {
	      file = files[i$];
	      parseFileMeta($parentEl, file);
	    }
	    for (i$ = 0, len$ = files.length; i$ < len$; ++i$) {
	      if (files[i$].detectedType) {
	        (fn$.call(this, files[i$]));
	      }
	    }
	    function fn$(file){
	      var reader;
	      if (file._data) {
	        if (file.detectedType !== 'ZIP') {
	          parseFileData(file)({
	            target: {
	              result: file.asText()
	            }
	          });
	        } else {
	          errorHandler(file, "skipping nested ZIP");
	        }
	      } else {
	        reader = new FileReader();
	        reader.onload = parseFileData(file);
	        switch (file.detectedType) {
	        case 'ZIP':
	          reader.readAsArrayBuffer(file);
	          break;
	        case 'JSON':
	          reader.readAsText(file);
	        }
	      }
	    }
	  }
	  function parseFileMeta($parentEl, file){
	    var type, filename;
	    type = "";
	    switch (file.type) {
	    case 'text/plain':
	      type = "assuming ";
	      // fallthrough
	    case 'application/json':
	    case 'text/javascript':
	    case 'text/json':
	      type += file.detectedType = 'JSON';
	      break;
	    case 'application/octet-stream':
	      type = "assuming ";
	      // fallthrough
	    case 'application/zip':
	    case 'application/x-zip-compressed':
	      type += file.detectedType = 'ZIP';
	      break;
	    default:
	      filename = file.name.toLowerCase();
	      if (/\.json(?:\.txt)?$/.test(filename)) {
	        type += file.detectedType = 'JSON';
	      } else if (/\.txt$/.test(filename)) {
	        type = "assuming ";
	        type += file.detectedType = 'JSON';
	      } else if (/\.zip$/.test(filename)) {
	        type += file.detectedType = 'ZIP';
	      }
	    }
	    file.$el = $("<li class=jtb-file>").data('file', file).append($("<span class=jtb-filename>").text(file.name + " "), $("<span class=jtb-type>").text(type)).appendTo($parentEl);
	    if (!type) {
	      errorHandler(file, "unknown format");
	    }
	  }
	  function parseFileData(file){
	    return function(e){
	      var data, header, zip, f, err, $sel, ref$, id, name, i$, len$, pl, suggestedPlaylist;
	      data = e.target.result;
	      if (file.detectedType === 'ZIP') {
	        try {
	          header = new Int8Array(data.slice(0, 2));
	          if (header[0] === 80 && header[1] === 75) {
	            console.log("adding ZIP", file.name);
	            zip = new JSZip(data);
	            handleFiles(file.$el, (function(){
	              var i$, ref$, results$ = [];
	              for (i$ in ref$ = zip.files) {
	                f = ref$[i$];
	                results$.push(f);
	              }
	              return results$;
	            }()));
	          } else {
	            errorHandler(file, "not a ZIP file");
	          }
	        } catch (e$) {
	          err = e$;
	          errorHandler(file, "corrupted ZIP file", err);
	        }
	      } else if (file.detectedType === 'JSON') {
	        try {
	          if (data[0] === '[') {
	            errorHandler(file, "file not in plug.dj playlist format");
	          } else if (data[0] === '{') {
	            console.log("adding JSON", file.name);
	            file.parsed = JSON.parse(data);
	          } else {
	            errorHandler(file, "not a JSON file");
	          }
	        } catch (e$) {
	          err = e$;
	          errorHandler(file, "corrupted JSON file", err);
	        }
	        if (file.parsed) {
	          if (!file.parsed.data) {
	            errorHandler(file, "file not in plug.dj playlist format", err);
	            return;
	          }
	          autoScroll(
	          $("<div class=jtb-file-actions>").append($sel = $playlistSelect.clone(true)).append($("<button class='jtb-import-pl-btn jtb-btn'>").text("import")).appendTo(file.$el));
	          if (file.parsed.meta) {
	            ref$ = file.parsed.meta, id = ref$.id, name = ref$.name;
	          }
	          if (id) {
	            for (i$ = 0, len$ = (ref$ = Dubtrack.app.browserView.model.models).length; i$ < len$; ++i$) {
	              pl = ref$[i$];
	              if (pl.id === id) {
	                suggestedPlaylist = pl;
	                break;
	              }
	            }
	          }
	          if (!suggestedPlaylist && name) {
	            for (i$ = 0, len$ = (ref$ = Dubtrack.app.browserView.model.models).length; i$ < len$; ++i$) {
	              pl = ref$[i$];
	              if (pl.attributes.name === name) {
	                suggestedPlaylist = pl;
	                break;
	              }
	            }
	          }
	          if (suggestedPlaylist) {
	            $sel.val(pl.id);
	          } else {
	            if (!name) {
	              name = file.name.replace(/\.json(?:\.txt)?$|\.txt$/, '');
	            }
	            $("<option value=new-suggested>").text("create \"" + name + "\"").insertAfter($sel.find("option:eq(1)"));
	            $sel.val('new-suggested');
	          }
	        }
	      }
	    };
	  }
	  function errorHandler(file, msg, err){
	    console.error("[file importing error]", msg, file, err);
	    autoScroll(
	    $("<div class=jtb-file-actions>").append($("<span>").text(msg)).appendTo(file.$el.addClass('jtb-error')));
	  }
	  function autoScroll($el){
	    if (autoScrolling) {
	      autoScrolling = 2;
	    } else {
	      autoScrolling = 1;
	      requestAnimationFrame(autoScrollCallback);
	    }
	  }
	  function autoScrollCallback(){
	    if (--autoScrolling > 0) {
	      requestAnimationFrame(autoScrollCallback);
	    } else {
	      $filelist.animate({
	        scrollTop: scrollTo
	      });
	    }
	  }
	};

/***/ },
/* 4 */
/***/ function(module, exports) {

	var $el, out$ = typeof exports != 'undefined' && exports || this;
	out$.$el = $el = $("<ul class='jtb-files'>").on('input', '.jtb-playlist-select', function(){
	  var plID;
	  plID = $(this).val();
	  if (plID === 'new') {
	    console.log("selected 'new playlist'");
	    throw Error('unimplemented');
	  } else {
	    console.log("selected playlist " + plID + " (" + $(this).text() + ")");
	    throw Error('unimplemented');
	  }
	}).on('click', '.jtb-import-pl-btn', function(){
	  var $file, $sel, plID, file, songs, name, $input, nameInput;
	  $file = $(this).closest('.jtb-file');
	  $sel = $file.find('.jtb-playlist-select');
	  plID = $sel.val();
	  file = $file.data('file');
	  songs = file.parsed.data;
	  if (plID === 'new-suggested') {
	    $file.find('.jtb-file-actions').slideUp().before(exporter.$loadingIcon);
	    name = file.name.replace(/\.json(?:\.txt)?$|\.txt$/, '');
	    exporter.createPlaylist(name, songs, callback);
	  } else if (plID === 'new') {
	    $input = $file.find('.jtb-name-input');
	    nameInput = $input.val();
	    if (!$input.length) {
	      console.log("selected 'new playlist' destination");
	      $("<input class=jtb-name-input placeholder='new playlist name'>").insertAfter($sel.hide()).focus();
	      $("<button class='jtb-abort-btn jtb-btn'>✘</button>").appendTo($sel.parent());
	    } else if (!nameInput) {
	      alert("please enter a playlist name");
	    } else {
	      console.log("create new playlist");
	      $file.find('.jtb-file-actions').slideUp().before(exporter.$loadingIcon);
	      exporter.createPlaylist(nameInput, songs, callback);
	    }
	  } else {
	    console.log("import to playlist " + plID);
	    $file.find('.jtb-file-actions').slideUp().before(exporter.$loadingIcon);
	    exporter.importSongs(plID, songs, callback);
	  }
	  function callback(){
	    exporter.$loadingIcon.remove();
	    $file.addClass('jtb-file-imported');
	  }
	}).on('click', '.jtb-abort-btn', function(){
	  var $file;
	  $file = $(this).closest('.jtb-file');
	  $file.find('.jtb-playlist-select').show();
	  $file.find(".jtb-name-input,.jtb-abort-btn").remove();
	}).on('click', '.jtb-filename', function(){
	  var $fileActions;
	  $fileActions = $(this).siblings('.jtb-file-actions').slideToggle();
	});

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var exporter, $filelist;
	exporter = __webpack_require__(2);
	$filelist = __webpack_require__(4).$el;
	requestAnimationFrame(function(){
	  var $browser, $diag, $fileInput, isFileSelecting, ref$, dragTarget;
	  $browser = $('#browser');
	  $diag = $('#import-playlist-container');
	  $(".sidebar .import-playlist").contents()[1].textContent = " Import/Export playlists";
	  $filelist.hide().insertAfter($diag.find('.playlist-type-select'));
	  $fileInput = $("<input type='file' multiple>").hide().appendTo(document.body).on('change', function(){
	    console.log("file selector onchange");
	    exporter.handleInputFiles(this.files);
	  });
	  isFileSelecting = false;
	  $("<button class='jtb-import-btn'>Plug.dj / Dubtrack</button>").appendTo($diag.find('.playlist-type-select')).on('click', function(){
	    console.log("import btn click");
	    if (!isFileSelecting) {
	      isFileSelecting = true;
	      $fileInput.click();
	      requestAnimationFrame(function(){
	        isFileSelecting = false;
	      });
	    }
	  });
	  if (exporter.browserSupportsDragnDrop) {
	    $diag.find('.playlist-type-select').append($("<div class='jtb-note'>or drag'n'drop the zip/JSON file here.</div>"));
	  }
	  $("<h3 class='jtb-headline'>Export Playlists</h3>").appendTo($diag);
	  $("<button class='jtb-export-btn jtb-btn'>Download All</button>").appendTo($diag).on('click', function(){
	    var this$ = this;
	    this.textContent = "Downloading…";
	    exporter.fetchAllPlaylists(function(err){
	      if (err) {
	        $("<div class=jtb-error>").text(err.message).insertAfter(this$);
	      } else {
	        exporter.downloadZip();
	        this$.textContent = "Downloaded All ✔";
	      }
	    }, function(eta){
	      this$.textContent = "Downloading… ca. " + eta + "s";
	    });
	  }).toggle(exporter.browserSupportsZip);
	  $("<div class='jtb-note'>or click the playlist names<br>to export them individually</div>").appendTo($diag);
	  if (exporter.browserIsSafari) {
	    exporter.$name = $("<b>");
	    exporter.$data = $("<textarea>").css({
	      maxHeight: '5em'
	    }).attr('placeholder', "note: because the Safari developers explicitly don't\ want to let you download files that were generated on-the-fly,\ you <b>cannot</b> download playlists as files on Safari.\ Instead, click on a playlist (in the left) and then copy the text\ from here and save it in a file manually… or just use a better browser").appendTo($diag).on('focus', function(it){
	      return it.select();
	    });
	  }
	  (ref$ = Dubtrack.View.ImportPlaylistBrowser.prototype).openView_ || (ref$.openView_ = Dubtrack.View.ImportPlaylistBrowser.prototype.openView);
	  Dubtrack.View.ImportPlaylistBrowser.prototype.openView = function(){
	    console.log("[ImportPlaylistBrowser] openView");
	    $browser.addClass('jtb-importing');
	    exporter.isImporting = true;
	    this.openView_.apply(this, arguments);
	  };
	  (ref$ = Dubtrack.View.ImportPlaylistBrowser.prototype).closeView_ || (ref$.closeView_ = Dubtrack.View.ImportPlaylistBrowser.prototype.closeView);
	  Dubtrack.View.ImportPlaylistBrowser.prototype.closeView = function(){
	    console.log("[ImportPlaylistBrowser] closeView");
	    $browser.removeClass('jtb-importing');
	    exporter.isImporting = false;
	    this.closeView_.apply(this, arguments);
	  };
	  $('.close-import-playlist').on('click', function(){
	    $browser.removeClass('jtb-importing');
	    exporter.isImporting = false;
	  });
	  Dubtrack.View.playlistItem.prototype.viewDetails_ = Dubtrack.View.playlistItem.prototype.viewDetails;
	  Dubtrack.View.playlistItem.prototype.viewDetails = function(){
	    var plID;
	    console.log("[viewDetails]", exporter.isImporting, this.model.get('_id'));
	    if (exporter.isImporting) {
	      plID = this.model.get('_id');
	      exporter.downloadPlaylist(plID);
	    } else {
	      this.viewDetails_.apply(this, arguments);
	    }
	  };
	  $('.playlist_icon').off('click').on('click', function(e){
	    var that, id, i$, ref$, len$, pl;
	    if (that = /playlist-([0-9a-f]{24})/.exec(" " + this.className + " ")) {
	      id = that[1];
	      for (i$ = 0, len$ = (ref$ = Dubtrack.app.browserView.model.models).length; i$ < len$; ++i$) {
	        pl = ref$[i$];
	        if (pl.id === id) {
	          Dubtrack.View.playlistItem.prototype.viewDetails.call({
	            model: pl,
	            viewDetails_: Dubtrack.View.playlistItem.prototype.viewDetails_
	          }, e);
	          return;
	        }
	      }
	      console.log("[click] pl not found");
	    }
	  });
	  exporter.isImporting = $diag.css('display') !== 'none';
	  $browser.toggleClass('jtb-importing', exporter.isImporting).on('dragover', function(e){
	    e.stopPropagation();
	    e.preventDefault();
	    $(".play-song-link, .sidebar .import-playlist").click();
	  }).on('dragend', function(e){
	    e.stopPropagation();
	    e.preventDefault();
	    $browser.removeClass('jtb-dropping');
	  }).on('dragenter', function(e){
	    e.stopPropagation();
	    e.preventDefault();
	    $browser.addClass('jtb-dropping');
	    dragTarget = e.target;
	  }).on('dragleave', function(e){
	    e.stopPropagation();
	    e.preventDefault();
	    if (dragTarget === e.target) {
	      $browser.removeClass('jtb-dropping');
	    }
	  }).on('drop', function(e){
	    var inputfiles, ref$;
	    $browser.removeClass('jtb-dropping');
	    inputfiles = (ref$ = e.originalEvent.dataTransfer) != null ? ref$.files : void 8;
	    if (!(inputfiles != null && inputfiles[0])) {
	      return;
	    }
	    e.stopPropagation();
	    e.preventDefault();
	    exporter.handleInputFiles(inputfiles);
	  });
	});

/***/ }
/******/ ]);