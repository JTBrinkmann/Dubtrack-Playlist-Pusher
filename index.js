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
	 * NOTE: THIS SCRIPT WAS WRITTEN IN LIVESCRIPT!
	 * If you are looking at the JavaScript source, you might want to instead
	 * hop over to the livescript source files, for a more understandable
	 * and better documented code (LiveScript strips single line comments when compiled)
	 * You can find the source files at:
	 * https://github.com/JTBrinkmann/Dubtrack-Playlist-Pusher/tree/master/src
	 */
	var ref$, aux, $css;
	try {
	  if ((ref$ = window.pusher) != null) {
	    if (typeof ref$.noConflict == 'function') {
	      ref$.noConflict();
	    }
	  }
	} catch (e$) {}
	aux = __webpack_require__(1);
	aux.getScript('FileSaver', 'saveAs', "https://cdn.rawgit.com/koffsyrup/FileSaver.js/master/FileSaver.js");
	$('#jtb-css').remove();
	$css = $("<link rel=stylesheet id=jtb-css href='https://cdn.rawgit.com/JTBrinkmann/dubtrack-playlist-pusher/master/styles.css'>").appendTo('head');
	$('.play-song-link').click();
	window.pusher = __webpack_require__(2);
	if (window.pusher.browserSupportsZip) {
	  aux.getScript('JSZip', 'JSZip', "https://cdnjs.cloudflare.com/ajax/libs/jszip/2.5.0/jszip.min.js");
	}
	Dubtrack.app.loadUserPlaylists(function(){
	  __webpack_require__(5);
	  __webpack_require__(6);
	});

/***/ },
/* 1 */
/***/ function(module, exports) {

	var fetch, getScript, errorHandler, ref$, timers, out$ = typeof exports != 'undefined' && exports || this;
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
	if (!window.console) {
	  window.console = {
	    log: $.noop
	  };
	}
	(ref$ = window.console).warn || (ref$.warn = window.console.log);
	(ref$ = window.console).error || (ref$.error = window.console.log);
	if (!window.console.time || !window.console.timeEnd) {
	  timers = {};
	  window.console.time = function(title){
	    timers[title] = Date.now();
	  };
	  window.console.timeEnd = function(title){
	    console.log(title, (Date.now() - timers[title]) + "ms");
	    delete timers[title];
	  };
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var aux, handleInputFiles, MAX_PAGE_SIZE, FORMATS, PLAYLIST_LOADED_RESET_TIMEOUT, PLAYLIST_LIST_RESET_TIMEOUT, pusher, ref$, ref1$, ref2$, close, out$ = typeof exports != 'undefined' && exports || this;
	aux = __webpack_require__(1);
	handleInputFiles = __webpack_require__(3).handleInputFiles;
	MAX_PAGE_SIZE = 20;
	FORMATS = [void 8, 'youtube', 'soundcloud'];
	PLAYLIST_LOADED_RESET_TIMEOUT = 2 * 60000;
	PLAYLIST_LIST_RESET_TIMEOUT = 2 * 60000;
	pusher = module.exports;
	ref$ = out$;
	ref$._debug = {};
	ref$.aux = aux;
	ref$.avgPageFetch = 200;
	ref$.avgPageFetchSamples = 2;
	ref$.avgSongAdd = 200;
	ref$.avgSongAddSamples = 2;
	ref$.playlistLoadedResetTimeouts = {};
	ref$.working = false;
	ref$.playlists = {};
	ref$.isImporting = false;
	ref$.browserSupportsZip = window.Blob && ((ref1$ = navigator.vendor) != null ? ref1$.indexOf('Apple') : void 8) === -1 && ((ref2$ = navigator.userAgent) != null ? ref2$.indexOf('CriOS') : void 8) === -1;
	ref$.browserSupportsDragnDrop = 'draggable' in document.body;
	ref$.$loadingIcon = $("<i class='jtb-spin'>C</i>");
	ref$.setWorking = function(val){
	  var ref$;
	  val = !!val;
	  pusher.working = val;
	  if ((ref$ = pusher.$browser) != null) {
	    ref$.toggleClass('jtb-working', val);
	  }
	};
	ref$.noConflict = function(){
	  $('.jtb').remove();
	  pusher.$browser.removeClass("jtb-dropping jtb-importing jtb-working").off('dragover dragend dragenter dragleave drop');
	  $('.close-import-playlist').off('click', pusher._closeBtnClick);
	  $(".sidebar .import-playlist").contents()[1].textContent = pusher._importBtnText;
	  Dubtrack.View.ImportPlaylistBrowser.prototype.openView = Dubtrack.View.ImportPlaylistBrowser.prototype.openView_;
	  delete Dubtrack.View.ImportPlaylistBrowser.prototype.openView_;
	  Dubtrack.View.ImportPlaylistBrowser.prototype.closeView = Dubtrack.View.ImportPlaylistBrowser.prototype.closeView_;
	  delete Dubtrack.View.ImportPlaylistBrowser.prototype.closeView_;
	  Dubtrack.View.playlistItem.prototype.viewDetails = Dubtrack.View.playlistItem.prototype.viewDetails_;
	  delete Dubtrack.View.playlistItem.prototype.viewDetails_;
	  delete Dubtrack.View.BrowserInfo.prototype.events["click .jtb-split-btn"];
	  delete Dubtrack.View.BrowserInfo.prototype.events["click .jtb-split-size-btn"];
	  Dubtrack.els.templates.playlist.playlistInfo = Dubtrack.els.templates.playlist.playlistInfo_;
	};
	ref$.fetchPlaylistsList = function(callback){
	  var pls, i, playlistsArr, res$;
	  if (typeof callback !== 'function') {
	    return;
	  }
	  if (pusher._playlistsArr) {
	    callback(void 8, pusher._playlistsArr);
	  } else if (Dubtrack.app.browserView) {
	    pls = Dubtrack.app.browserView.model.models;
	    i = pls.length;
	    res$ = [];
	    while (i--) {
	      res$.push(pls[i].attributes);
	    }
	    playlistsArr = res$;
	    callback(void 8, playlistsArr);
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
	      pusher._playlistsArr = playlistsArr;
	      setTimeout(function(){
	        delete pusher._playlistsArr;
	      }, PLAYLIST_LIST_RESET_TIMEOUT);
	      callback(void 8, playlistsArr);
	    });
	  }
	};
	ref$.getPlaylist = function(playlist, callback){
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
	    pusher.fetchPlaylistsList(function(err, playlistsArr){
	      var i$, len$, pl;
	      if (err) {
	        return callback(err);
	      }
	      for (i$ = 0, len$ = playlistsArr.length; i$ < len$; ++i$) {
	        pl = playlistsArr[i$];
	        if (pl._id === plID) {
	          return callback(void 8, pl);
	        }
	      }
	      callback(new TypeError("playlist not found"));
	    });
	  }
	};
	ref$.fetchPlaylist = function(playlist, callback, etaCallback){
	  var d;
	  d = Date.now();
	  pusher.getPlaylist(playlist, function(err, pl){
	    var totalItems, $playlist, pages;
	    if (err) {
	      return typeof callback == 'function' ? callback(err) : void 8;
	    }
	    /*if Dubtrack.app.browserView?.browserItemsList
	        songs = Dubtrack.app.browserView.browserItemsList.model.models
	        if songs.0?.attributes.playlistid == pl._id
	            for pl in Dubtrack.app.browserView.browserItemsList.model.models
	                ...
	    */
	    totalItems = pl.totalItems || 0;
	    if (totalItems === 0) {
	      console.log("skipping empty playlist '" + pl.name + "'");
	    }
	    $playlist = $(".playlist-" + pl._id).append(pusher.$loadingIcon);
	    pusher._debug.playlists = {};
	    pages = Math.ceil(totalItems / MAX_PAGE_SIZE);
	    $.Deferred(function(defFetchSongs){
	      var songs, offset, page, fetchPage;
	      songs = new Array(totalItems);
	      offset = 0;
	      page = 0;
	      (fetchPage = function(){
	        if (++page <= pages) {
	          if (typeof etaCallback == 'function') {
	            etaCallback(page, pages);
	          }
	          aux.fetch("songs (" + pl.name + ") [" + page + "/" + pages + "]", "https://api.dubtrack.fm/playlist/" + pl._id + "/songs?page=" + page, function(page){
	            var i$, len$, o, _song, err;
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
	      $playlist.addClass('jtb-playlist-loaded');
	      pusher.$loadingIcon.remove();
	      clearTimeout(pusher.playlistLoadedResetTimeouts[pl._id]);
	      pusher.playlistLoadedResetTimeouts[pl._id] = setTimeout(function(){
	        $playlist.removeClass('jtb-playlist-loaded');
	      }, PLAYLIST_LOADED_RESET_TIMEOUT);
	      if (pages !== 0) {
	        pusher.avgPageFetch *= pusher.avgPageFetchSamples;
	        pusher.avgPageFetch += (Date.now() - d) / pages;
	        pusher.avgPageFetch /= ++pusher.avgPageFetchSamples;
	      }
	      if (typeof callback == 'function') {
	        callback(null, {
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
	              totalItems: totalItems
	            }
	          }
	        });
	      }
	    });
	  });
	};
	ref$.etaFetchAllPlaylists = function(callback){
	  pusher.fetchPlaylistsList(function(err, playlistsArr){
	    var eta, i$, len$, pl;
	    if (err) {
	      return typeof callback == 'function' ? callback(err) : void 8;
	    }
	    eta = 0;
	    for (i$ = 0, len$ = playlistsArr.length; i$ < len$; ++i$) {
	      pl = playlistsArr[i$];
	      if (pl.totalItems && !(pl._id in pusher.playlists)) {
	        eta += pusher.avgPageFetch * Math.ceil(pl.totalItems / MAX_PAGE_SIZE);
	      }
	    }
	    console.info("ETA for fetching all songs: %c" + Math.round(eta / 1000) + "s", 'font-weight: bold');
	    callback(void 8, eta);
	  });
	};
	ref$.fetchAllPlaylists = function(callback, etaCallback){
	  pusher.fetchPlaylistsList(function(err, playlistsArr){
	    var remainingPages, i$, len$, pl, etaTimeout, updateETA, title;
	    if (err) {
	      return typeof callback == 'function' ? callback(err) : void 8;
	    }
	    if (typeof etaCallback === 'function') {
	      remainingPages = 0;
	      for (i$ = 0, len$ = playlistsArr.length; i$ < len$; ++i$) {
	        pl = playlistsArr[i$];
	        if (pl.totalItems) {
	          remainingPages += Math.ceil(pl.totalItems / MAX_PAGE_SIZE);
	        }
	      }
	      updateETA = function(){
	        clearTimeout(etaTimeout);
	        etaCallback(void 8, Math.round(remainingPages * pusher.avgPageFetch / 1000));
	        etaTimeout = setTimeout(updateETA, 1000);
	      };
	    }
	    title = "fetched playlists' songs";
	    $.Deferred(function(defFetchPlaylists){
	      var res, i, fetchNextPlaylist;
	      console.time(title);
	      res = {};
	      i = 0;
	      (fetchNextPlaylist = function(err, playlist){
	        var pl;
	        if (err) {
	          return typeof callback == 'function' ? callback(err) : void 8;
	        }
	        if (playlist) {
	          res[playlist.id] = playlist;
	        }
	        pl = playlistsArr[i++];
	        if (updateETA) {
	          updateETA();
	        }
	        if (pl) {
	          pusher.fetchPlaylist(pl, fetchNextPlaylist, updateETA && function(page){
	            remainingPages--;
	            updateETA();
	          });
	        } else {
	          defFetchPlaylists.resolve(res);
	        }
	      })();
	    }).then(function(res){
	      console.timeEnd(title);
	      if (updateETA) {
	        clearTimeout(etaTimeout);
	      }
	      if (typeof callback == 'function') {
	        callback(void 8, res);
	      }
	    });
	  });
	};
	ref$.downloadPlaylist = function(playlist, callback){
	  pusher.fetchPlaylist(playlist, function(err, pl){
	    var json;
	    if (err) {
	      return typeof callback == 'function' ? callback(err) : void 8;
	    }
	    $(".play-song-link, .sidebar .import-playlist").click();
	    json = JSON.stringify(pl.data);
	    if (!pusher.browserSupportsZip) {
	      pusher.$data.val(json);
	      pusher.$name.text(pl.name + ".json");
	    } else {
	      saveTextAs(json, pl.name + ".json");
	    }
	    if (typeof callback == 'function') {
	      callback(void 8, pl);
	    }
	  });
	};
	ref$.downloadZip = function(callback, etaCallback){
	  pusher.fetchAllPlaylists(function(err, playlists){
	    var zip, i$, pl, o, filename, date;
	    if (err) {
	      return typeof callback == 'function' ? callback(err) : void 8;
	    }
	    zip = new JSZip();
	    for (i$ in playlists) {
	      pl = playlists[i$];
	      o = 1;
	      filename = pl.name;
	      while (filename in zip.files) {
	        filename = pl.name + " (" + (++o) + ")";
	      }
	      zip.file(filename + ".json", JSON.stringify(pl.data));
	    }
	    date = /[^T]+/.exec(new Date().toISOString())[0];
	    saveAs(zip.generate({
	      type: 'blob'
	    }), date + "_dubtrack_playlists.zip");
	    console.log("zip download started!");
	    if (typeof callback == 'function') {
	      callback(void 8, playlists);
	    }
	  }, etaCallback);
	};
	ref$.createPlaylist = function(name, optSongs, callback, etaCallback){
	  var x$;
	  if (!optSongs || typeof optSongs === 'function') {
	    callback = optSongs;
	    optSongs = null;
	  }
	  delete pusher._playlistsArr;
	  x$ = new Dubtrack.Model.Playlist({
	    name: name
	  });
	  x$.parse = Dubtrack.helpers.parse;
	  x$.save({}, {
	    success: function(pl){
	      setTimeout(function(){
	        Dubtrack.user.playlist.add(pl);
	      }, 2000);
	      if (optSongs) {
	        pusher.importSongs(pl.id, optSongs, callback, etaCallback, x$);
	      } else {
	        if (typeof callback == 'function') {
	          callback(void 8, pl);
	        }
	      }
	    }
	  });
	};
	ref$.importSongs = function(playlistID, songsArray, callback, etaCallback, _internal_pl){
	  var i, title, d, url;
	  if (typeof etaCallback !== 'function') {
	    etaCallback = null;
	  }
	  i = 0;
	  title = "imported " + songsArray.length + " songs into " + playlistID;
	  console.time(title);
	  d = Date.now();
	  url = Dubtrack.config.apiUrl + Dubtrack.config.urls.playlistSong.split(':id').join(playlistID);
	  function importSong(){
	    var song, ref$;
	    if (i) {
	      pusher.avgSongAdd *= pusher.avgSongAddSamples;
	      pusher.avgSongAdd += Date.now() - d;
	      pusher.avgSongAdd /= ++pusher.avgSongAddSamples;
	      d = Date.now();
	    }
	    song = songsArray[i++];
	    if (etaCallback) {
	      etaCallback(i);
	    }
	    if (song) {
	      if (typeof song.cid !== 'string' || ((ref$ = song.format) !== 1 && ref$ !== 2)) {
	        console.warn("skipping song with unknown format", song);
	        i++;
	        importSong();
	      } else {
	        Dubtrack.helpers.sendRequest(url, {
	          fkid: song.cid || song.fkid,
	          type: FORMATS[song.format] || song.type
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
	ref$.handleInputFiles = handleInputFiles;
	out$.close = close = pusher.noConflict;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var $filelist, handleInputFiles, out$ = typeof exports != 'undefined' && exports || this;
	$filelist = __webpack_require__(4).$el;
	out$.handleInputFiles = handleInputFiles = function(inputfiles){
	  var $playlistSelect, i$, ref$, len$, pl, autoScrolling, scrollTo;
	  pusher._debug.inputfiles = inputfiles;
	  $(".play-song-link, .sidebar .import-playlist").click();
	  $playlistSelect = $("<select class=jtb-playlist-select>").append($("<option disabled>select destination</option>")).append($("<option value=new>create new playlist</option>")).append($("<option disabled>------------------</option>"));
	  for (i$ = 0, len$ = (ref$ = Dubtrack.app.browserView.model.models).length; i$ < len$; ++i$) {
	    pl = ref$[i$];
	    $('<option>').text(pl.attributes.name).val(pl.id).appendTo($playlistSelect);
	  }
	  $filelist.show();
	  pusher.$importHint.show();
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
	            file.suggestedName = name;
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
	out$.$el = $el = $("<ul class='jtb jtb-files'>").on('input', '.jtb-playlist-select', function(){
	  var plID, $file, $sel;
	  plID = $(this).val();
	  if (plID === 'new') {
	    console.log("selected 'new playlist' destination");
	    $file = $(this).closest('.jtb-file');
	    $sel = $file.find('.jtb-playlist-select');
	    $("<input class=jtb-name-input placeholder='new playlist name'>").insertAfter($sel.hide()).focus();
	    $("<button class='jtb-abort-btn jtb-btn'>✘</button>").appendTo($sel.parent());
	  } else {
	    console.log("selected playlist " + plID + " (" + $(this).text() + ")");
	  }
	}).on('click', '.jtb-import-pl-btn', function(){
	  var $file, $sel, plID, file, songs, $input, nameInput;
	  if (pusher.working) {
	    return;
	  }
	  $file = $(this).closest('.jtb-file');
	  $sel = $file.find('.jtb-playlist-select');
	  plID = $sel.val();
	  file = $file.data('file');
	  songs = file.parsed.data;
	  if (!plID) {
	    alert("please select a playlist to import to");
	  } else if (plID === 'new-suggested') {
	    startWorking();
	    pusher.createPlaylist(file.suggestedName, songs, callback);
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
	      startWorking();
	      pusher.createPlaylist(nameInput, songs, callback);
	    }
	  } else {
	    console.log("import to playlist " + plID);
	    startWorking();
	    pusher.importSongs(plID, songs, callback);
	  }
	  function startWorking(){
	    $file.find('.jtb-file-actions').slideUp().before(pusher.$loadingIcon);
	    pusher.setWorking(true);
	  }
	  function callback(){
	    pusher.setWorking(false);
	    pusher.$loadingIcon.remove();
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

	var pusher, $filelist;
	pusher = __webpack_require__(2);
	$filelist = __webpack_require__(4).$el;
	requestAnimationFrame(function(){
	  var $browser, $diag, x$, $fileInput, isFileSelecting, ref$, dragTarget;
	  pusher.$browser = $browser = $('#browser');
	  pusher.$diag = $diag = $('#import-playlist-container');
	  x$ = $(".sidebar .import-playlist").contents()[1];
	  pusher._importBtnText = x$.textContent;
	  x$.textContent = " Import/Export playlists";
	  $filelist.hide().appendTo($diag);
	  pusher.$importHint = $("<div class='jtb jtb-note' style='display:none'>note: Freshly imported playlists might not show up in the playlist-list,\ or show up with with a wrong number of songs.\ Refreshing the page fixes this (sorry)</div>").appendTo($diag);
	  $fileInput = $("<input class=jtb type='file' multiple>").hide().appendTo(document.body).on('change', function(){
	    console.log("file selector onchange");
	    pusher.handleInputFiles(this.files);
	  });
	  isFileSelecting = false;
	  $("<button class='jtb jtb-import-btn'>Plug.dj / Dubtrack</button>").appendTo($diag.find('.playlist-type-select')).on('click', function(){
	    console.log("import btn click");
	    if (!isFileSelecting) {
	      isFileSelecting = true;
	      $fileInput.click();
	      requestAnimationFrame(function(){
	        isFileSelecting = false;
	      });
	    }
	  });
	  if (pusher.browserSupportsDragnDrop) {
	    $diag.find('.playlist-type-select').append($("<div class='jtb jtb-note'>or drag'n'drop the zip/JSON file here.</div>"));
	  }
	  $("<h3 class='jtb jtb-headline'>Export Playlists</h3>").appendTo($diag);
	  $("<button class='jtb jtb-export-btn jtb-btn'>Download All</button>").appendTo($diag).on('click', function(){
	    var this$ = this;
	    if (pusher.working) {
	      return;
	    }
	    this.textContent = "Downloading…";
	    clearTimeout(this.dataset.timeout);
	    pusher.setWorking(true);
	    pusher.downloadZip(function(err, playlists){
	      pusher.setWorking(false);
	      if (err) {
	        console.error(err);
	        $("<div class='jtb jtb-error'>").text(err.message).insertAfter(this$);
	      } else {
	        this$.textContent = "Downloaded All ✔";
	        this$.dataset.timeout = setTimeout(function(){
	          this$.textContent("Download All");
	        }, 10 * 60000);
	      }
	    }, function(err, eta){
	      if (err) {
	        console.error(err);
	      } else {
	        if (eta >= 1) {
	          this$.textContent = "Downloading… " + eta + "s";
	        } else {
	          this$.textContent = "Downloading…";
	        }
	      }
	    });
	  }).toggle(pusher.browserSupportsZip);
	  $("<div class='jtb jtb-note'>or click the playlist names<br>to export them individually</div>").appendTo($diag);
	  if (!pusher.browserSupportsZip) {
	    pusher.$name = $("<b class=jtb>").appendTo($diag);
	    pusher.$data = $("<textarea class=jtb>").css({
	      maxHeight: '5em'
	    }).attr('placeholder', "note: because the Safari developers explicitly don't\ want to let you download files that were generated on-the-fly,\ you <b>cannot</b> download playlists as files on Safari.\ Instead, click on a playlist (in the left) and then copy the text\ from here and save it in a file manually… or just use a better browser").on('focus', function(it){
	      return it.select();
	    }).appendTo($diag);
	  }
	  (ref$ = Dubtrack.View.ImportPlaylistBrowser.prototype).openView_ || (ref$.openView_ = Dubtrack.View.ImportPlaylistBrowser.prototype.openView);
	  Dubtrack.View.ImportPlaylistBrowser.prototype.openView = function(){
	    if (!pusher.isImporting) {
	      console.log("[ImportPlaylistBrowser] openView");
	      $browser.addClass('jtb-importing');
	      pusher.isImporting = true;
	      this.openView_.apply(this, arguments);
	    }
	  };
	  (ref$ = Dubtrack.View.ImportPlaylistBrowser.prototype).closeView_ || (ref$.closeView_ = Dubtrack.View.ImportPlaylistBrowser.prototype.closeView);
	  Dubtrack.View.ImportPlaylistBrowser.prototype.closeView = function(){
	    console.log("[ImportPlaylistBrowser] closeView");
	    $browser.removeClass('jtb-importing');
	    pusher.isImporting = false;
	    this.closeView_.apply(this, arguments);
	  };
	  $('.close-import-playlist').off('click', pusher._closeBtnClick).on('click', pusher._closeBtnClick = function(){
	    $browser.removeClass('jtb-importing');
	    pusher.isImporting = false;
	  });
	  Dubtrack.View.playlistItem.prototype.viewDetails_ = Dubtrack.View.playlistItem.prototype.viewDetails;
	  Dubtrack.View.playlistItem.prototype.viewDetails = function(){
	    var plID;
	    console.log("[viewDetails]", pusher.isImporting, this.model.get('_id'));
	    if (pusher.isImporting) {
	      plID = this.model.get('_id');
	      if (!pusher.working) {
	        pusher.setWorking(true);
	        pusher.downloadPlaylist(plID, function(){
	          pusher.setWorking(false);
	        });
	      }
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
	  pusher.isImporting = $diag.css('display') !== 'none';
	  $browser.toggleClass('jtb-importing', pusher.isImporting).on('dragover', function(e){
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
	    pusher.handleInputFiles(inputfiles);
	  });
	});

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var aux, ref$;
	aux = __webpack_require__(1);
	pusher.removePlaylist = function(playlistid, callback){
	  var i$, ref$, len$, pl;
	  for (i$ = 0, len$ = (ref$ = Dubtrack.app.browserView.model.models).length; i$ < len$; ++i$) {
	    pl = ref$[i$];
	    if (pl.id === playlistid) {
	      pl.destroy();
	      return typeof callback == 'function' ? callback(void 8, pl) : void 8;
	    }
	  }
	  if (typeof callback == 'function') {
	    callback(new Error("playlist '" + playlistid + "' not found"));
	  }
	};
	pusher.sizes = [5, 20, 50, 100, 200, 500];
	pusher.changeSplitSize = function(e){
	  var $btn, size, newSize;
	  if (e != null) {
	    e.preventDefault();
	  }
	  $btn = $('.jtb-split-size-btn');
	  size = $btn.data('split-size');
	  newSize = pusher.sizes[(pusher.sizes.indexOf(size) + 1) % pusher.sizes.length];
	  $btn.data('split-size', newSize);
	  $btn.text("Split Size: " + newSize);
	};
	pusher.showSplitPlaylistGUI = function(e){
	  var $btn, size, playlistid;
	  if (e != null) {
	    e.preventDefault();
	  }
	  $btn = $('.jtb-split-size-btn');
	  size = $btn.data('split-size');
	  console.log("[split gui]", this != null ? this.model : void 8, size);
	  if (!(this != null && this.model)) {
	    return;
	  }
	  playlistid = this.model.id;
	  pusher.splitPlaylist(playlistid, size, this.model.get('name') + " (%d)", function(err){
	    $btn.text("Split Size: " + size);
	    if (err) {
	      aux.errorHandler(err);
	    }
	  }, function(err, eta){
	    console.log("Splitting… " + eta + "s", new Date());
	    if (eta >= 1) {
	      eta = "ca. " + eta;
	    } else {
	      eta = "<1";
	    }
	    $btn.text("Splitting… " + eta + "s");
	  });
	};
	pusher.splitPlaylist = function(playlistid, limit, nameTemplate, callback, etaCallback){
	  var title, name;
	  if (!isFinite(limit) || limit < 1) {
	    return typeof callback == 'function' ? callback(new TypeError("limit too small")) : void 8;
	  }
	  if (pusher.splitting) {
	    return typeof callback == 'function' ? callback(new TypeError("already splitting")) : void 8;
	  }
	  pusher.splitting = true;
	  if (typeof callback !== 'function') {
	    callback = null;
	  }
	  title = "[splitPlaylist] done!";
	  console.time(title);
	  name = nameTemplate.split("%d");
	  pusher.fetchPlaylistsList(function(err, playlistsArr){
	    if (err) {
	      if (typeof callback == 'function') {
	        callback(err);
	      }
	      console.timeEnd(title);
	      return;
	    }
	    pusher.fetchPlaylist(playlistid, function(err2, data){
	      var songs, remainingSongs, etaTimeout, updateETA, totalPlaylists, plNames, res$, i$, ref$, len$, pl, i, abort, res;
	      if (err) {
	        if (typeof callback == 'function') {
	          callback(err);
	        }
	        console.timeEnd(title);
	        return;
	      }
	      songs = data.data.data;
	      if (!songs.length) {
	        callback(new Error("Playlist '" + playlistid + "' is empty"));
	      }
	      if (typeof etaCallback === 'function') {
	        remainingSongs = songs.length;
	        updateETA = function(){
	          clearTimeout(etaTimeout);
	          etaCallback(void 8, Math.round(remainingSongs * pusher.avgSongAdd / 1000));
	          etaTimeout = setTimeout(updateETA, 1000);
	        };
	      }
	      totalPlaylists = Math.ceil(songs.length / limit);
	      res$ = {};
	      for (i$ = 0, len$ = (ref$ = playlistsArr).length; i$ < len$; ++i$) {
	        pl = ref$[i$];
	        res$[pl.name] = true;
	      }
	      plNames = res$;
	      for (i$ = 0; i$ < totalPlaylists; ++i$) {
	        i = i$;
	        if (name.join(i) in plNames) {
	          abort = !confirm("You are about to create playlists with names that are already used (e.g. \"" + name.join(i) + "\")!\n\nAre you sure you want to continue?");
	          if (abort) {
	            console.timeEnd(title);
	            return;
	          } else {
	            break;
	          }
	        }
	      }
	      i = 0;
	      res = {};
	      function createNextPlaylist(err, playlist){
	        if (playlist && callback) {
	          playlist.i = i - 1;
	          res[playlist.id] = playlist;
	        }
	        if (err) {
	          if (typeof callback == 'function') {
	            callback(err);
	          }
	          console.timeEnd(title);
	        } else if (i < totalPlaylists) {
	          pusher.createPlaylist(name.join(i + 1), songs.slice(i * limit, (++i) * limit), createNextPlaylist, updateETA && function(){
	            remainingSongs--;
	            updateETA();
	          });
	        } else {
	          clearTimeout(etaTimeout);
	          pusher.removePlaylist(playlistid, function(){
	            console.timeEnd(title);
	            if (callback) {
	              callback(void 8, true);
	            }
	          });
	        }
	      } createNextPlaylist();
	    });
	  });
	};
	Dubtrack.View.BrowserInfo.prototype.events["click .jtb-split-btn"] = pusher.showSplitPlaylistGUI;
	Dubtrack.View.BrowserInfo.prototype.events["click .jtb-split-size-btn"] = pusher.changeSplitSize;
	(ref$ = Dubtrack.els.templates.playlist).playlistInfo_ || (ref$.playlistInfo_ = Dubtrack.els.templates.playlist.playlistInfo);
	(ref$ = Dubtrack.els.templates.playlist).playlistInfo = ref$.playlistInfo.replace(/(queue-playlist">.*?<\/a>).*<\/div>$/, "$1<a href=# class='text-button jtb-split-size-btn' data-split-size=50>Split Size: 50</a><a href=# class='text-button jtb-split-btn'>Split Playlist</a></div>");

/***/ }
/******/ ]);