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
	var aux, api, $css;
	aux = __webpack_require__(1);
	api = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"api\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	aux.getScript('FileSaver', 'saveAs', "https://cdn.rawgit.com/koffsyrup/FileSaver.js/master/FileSaver.js");
	$('#jtb-css').remove();
	$css = $("<link rel=stylesheet id=jtb-css href='https://cdn.rawgit.com/JTBrinkmann/dubtrack-playlist-exporter/master/styles.css'>").appendTo('head');
	$('.play-song-link').click();
	window.exporter = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"api\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
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
/* 2 */,
/* 3 */,
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
	exporter = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"api\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
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
	    clearTimeout(this.dataset.timeout);
	    exporter.downloadZip(function(err, playlists){
	      if (err) {
	        console.error(err);
	        $("<div class=jtb-error>").text(err.message).insertAfter(this$);
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
	        if (eta < 1) {
	          eta = "<1";
	        } else {
	          eta = "ca. " + eta;
	        }
	        this$.textContent = "Downloading… " + eta + "s";
	      }
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