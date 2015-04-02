(function (WIN, DOC, $, UND){
	var tmpU = navigator.userAgent,
		yBrowser = {
			versions:function(){
				return {
					trident: tmpU.indexOf('Trident') > -1,
					presto: tmpU.indexOf('Presto') > -1,
					webKit: tmpU.indexOf('AppleWebKit') > -1,
					gecko: tmpU.indexOf('Gecko') > -1 && tmpU.indexOf('KHTML') == -1,
					mobile: !!tmpU.match(/AppleWebKit.*Mobile.*/) || !!tmpU.match(/Mobile/),
					ios: tmpU.indexOf('ios') > -1,
					android: tmpU.indexOf('Android') > -1,
					linux: tmpU.indexOf('Linux') > -1,
					iPhone: tmpU.indexOf('iPhone') > -1,
					mac: tmpU.indexOf('Mac') > -1,
					iPad: tmpU.indexOf('iPad') > -1,
					safari: tmpU.indexOf('Safari') > -1,
					maxthon: tmpU.indexOf('Maxthon') > -1,
					isIE: tmpU.indexOf("MSIE") > -1,
					isIE6: tmpU.indexOf("MSIE 6.0") > -1,
					isIE7: tmpU.indexOf("MSIE 7.0") > -1
				};
			}()
		},
		demilamedia = function(){
		},
		mainObjs = {
			mainObjects: [],
			loadedObjects: []
		},
		mainObj_num = 0,
		loaded_num = 0,
		currentNum = -1,
		domHtml_mask = "<div id='demilamedia_mask'></div>",
		domHtml_tit = "<div id='demilamedia_tit'></div>",
		domHtml_tip = "<div id='demilamedia_tips'></div>",
		domHtml_box = "<div id='demilamedia'>\
		<div class='demilamedia_top'><div class='hlb_left'></div><div class='hlb_middle'></div><div class='hlb_right'></div></div>\
		<div id='demilamedia_objs'><div class='objleftbg'><div class='objrightbg'><div id='demilamedia_main'></div></div></div><span id='demilamedia_loading'></span></div>\
		<div id='demilamedia_arrbtn'><a id='demilamedia_leftbtn' title='上一张'></a><a id='demilamedia_rightbtn' title='下一张'></a><div id='demilamedia_pagenum'></div></div>\
		<a id='demilamedia_closebtn' title='关闭'>关闭</a>\
		<div class='demilamedia_bottom'><div class='hlb_left'></div><div class='hlb_middle'></div><div class='hlb_right'></div></div>\
		</div>",
		defaultOption = {
			soundW: 650,
			soundH: 80,
			videoW: 650,
			videoH: 330,
			defW: 120,
			defH: 100,
			minImgW: 200,
			minImgH: 200,
			maxW: $(WIN).width(),
			maxH: $(WIN).height(),
			maxImgW: $(WIN).width() - 100,
			maxImgH: $(WIN).height() - 120,
			tips: "按ESC键返回 按方向键切换"
		},
		$hxlb_mask = null,
		$hxlb = null,
		$hxlb_objs = null,
		$hxlb_arrs = null,
		$hxlb_close = null,
		$hxlb_loading = null,
		$hxlb_main = null,
		$hxlb_tit = null,
		$hxlb_tip = null,
		$hxlb_num = null,
		filecheck = {
			img: /^jpg|png|gif$/i,
			video: /^swf|mp4|flv|wmv$/i,
			sound: /^wma|wav|mp3$/i
		},
		videoFileCheck = /^mp4$/i,
		soundFileCheck = /^mp3|ogg|wav$/i,
		flashplayer = {need: false, statue: ""};

	demilamedia.open = function(objs){
		objInit(objs);
		//console.log($hxlb);
		$hxlb_mask.show();
		$hxlb.show();
		loadshow();
		makeMainSize(defaultOption.defW, defaultOption.defH, function(){
			demilamedia.currentObj(0);
		}, true);
		if(objs.length <= 1){
			$hxlb_arrs.children().hide();
		}else{
			var $events = $._data($hxlb_lbtn[0], "events");
			if(!($events && $events["click"])){
				$hxlb_lbtn.on("click", function(){
					if($(this).hasClass("disable")){
						return;
					}
					demilamedia.prevObj();
				});
			}
			$events = $._data($hxlb_rbtn[0], "events");
			if(!($events && $events["click"])){
				$hxlb_rbtn.on("click", function(){
					if($(this).hasClass("disable")){
						return;
					}
					demilamedia.nextObj();
				});
			}
		}
		return false;
	}
	demilamedia.init = function(options){
		$.extend(defaultOption, options);
		/*if(!Modernizr.audio || !Modernizr.video){
			flashplayer = {need: true, statue: "loading"};
			require.async(["jwplayer", "jwplayer.html5"], function(jw, jwh5){
				jw();
				jwh5();
				flashplayer.statue = "finish";
				//swfobject = so;
				//swfobject.onDomLoad();
			});
		}*/

		$("body").append($(domHtml_box)).append($(domHtml_mask)).append($(domHtml_tit)).append($(domHtml_tip));
		$hxlb_mask = $("#demilamedia_mask");
		$hxlb = $("#demilamedia");
		$hxlb_objs = $hxlb.find("#demilamedia_objs");
		$hxlb_arrs = $hxlb.find("#demilamedia_arrbtn");
		$hxlb_lbtn = $hxlb_arrs.find("#demilamedia_leftbtn");
		$hxlb_rbtn = $hxlb_arrs.find("#demilamedia_rightbtn");
		$hxlb_close = $hxlb.find("#demilamedia_closebtn");
		$hxlb_main = $hxlb.find("#demilamedia_main");
		$hxlb_loading = $hxlb.find("#demilamedia_loading");
		$hxlb_tit = $("#demilamedia_tit");
		$hxlb_tip = $("#demilamedia_tips");
		$hxlb_num = $hxlb.find("#demilamedia_pagenum");
		hxboxResize();
		$(WIN).on("resize", hxboxResize).on("keyup", function(e){
			switch(e.keyCode){
				case 37:
					demilamedia.prevObj();
					break;
				case 39:
					demilamedia.nextObj();
					break;
				case 27:
					demilamedia.close();
					break;
			}
		});
		$hxlb_close.on("click", function(){
			demilamedia.close();
		});
		$hxlb_mask.on("click", function(){
			demilamedia.close();
		});
		$hxlb_tip.html(defaultOption.tips);
		//$hxlb_tit.css({"margin-left": -0.5 * defaultOption.maxW});
		makeTxtPos();
	}
	demilamedia.prevObj = function(){
		currentNum--;
		if(currentNum < 0){
			//currentNum = mainObj_num - 1;
			currentNum++;
		}else{
			demilamedia.currentObj(currentNum);
		}
	}
	demilamedia.nextObj = function(){
		currentNum++;
		if(currentNum > mainObj_num - 1){
			//currentNum = 0;
			currentNum--;
		}else{
			demilamedia.currentObj(currentNum);
		}
	}
	demilamedia.close = function(){
		$hxlb_main.html("");
		$hxlb_arrs.children().hide();
		txthide();
		currentNum = 0;
		makeMainSize(0, 0, function(){
			$hxlb.hide();
			$hxlb_mask.hide();
			loadhide();
		}, true);
	}
	demilamedia.currentObj = function(idx){
		//console.log(mainObjs);
		loadshow();
		txthide();
		//console.log($hxlb_loading);
		//console.log(mainObjs.mainObjects[idx]);
		if(mainObjs.loadedObjects[idx]){
			var obj = mainObjs.loadedObjects[idx];
			if(isImage(obj)){
				obj = checkImgSize(obj);
				makeMainSize(obj.width, obj.height, function(){
					$hxlb_main.html(getImgHtml(obj));
					makeTxtPos();
					makeThePage();
				});
			}else if(isSound(obj)){
				makeMainSize(defaultOption.soundW, defaultOption.soundH, function(){
					var ss = getSoundHtml(obj);
					if(ss.flash){
						$hxlb_main.html(ss.html);
						flash_add("demilamedia_flash", "/static/scripts/plug/demilamedia/videoplayer/", defaultOption.soundW, defaultOption.soundH, {playlist: obj});
					}else{
						$hxlb_main.html(ss);
					}
					makeTxtPos();
					makeThePage();
				});
			}else if(isVideo(obj)){
				makeMainSize(defaultOption.videoW, defaultOption.videoH, function(){
					var ss = getVideoHtml(obj);
					if(ss.flash){
						$hxlb_main.html(ss.html);
						flash_add("demilamedia_flash", "/static/scripts/plug/demilamedia/videoplayer/", defaultOption.videoW, defaultOption.videoH, {playlist: obj});
					}else{
						$hxlb_main.html(ss);
					}
					makeTxtPos();
					makeThePage();
				});
			}
		}else{
			var paths = mainObjs.mainObjects[idx].href;
			if(isImage(paths)){
				var img = new Image();
				img.src = paths;
				mainObjs.loadedObjects[idx] = img;
				img.onload = function(){
					img = checkImgSize(img);
					makeMainSize(img.width, img.height, function(){
						$hxlb_main.html(getImgHtml(img));
						makeTxtPos();
						makeThePage();
					});
				}
				img.onabort = function(){
					mainObjs.loadedObjects.splice(idx, 1);
				}
			}else if(isSound(paths)){
				mainObjs.loadedObjects[idx] = paths;
				makeMainSize(defaultOption.soundW, defaultOption.soundH, function(){
					var ss = getSoundHtml(paths);
					if(ss.flash){
						$hxlb_main.html(ss.html);
						flash_add("demilamedia_flash", "/static/scripts/plug/demilamedia/videoplayer/", defaultOption.soundW, defaultOption.soundH, {playlist: paths});
					}else{
						$hxlb_main.html(ss);
					}
					makeTxtPos();
					makeThePage();
				});
			}else if(isVideo(paths)){
				mainObjs.loadedObjects[idx] = paths;
				makeMainSize(defaultOption.videoW, defaultOption.videoH, function(){
					var ss = getVideoHtml(paths);
					if(ss.flash){
						$hxlb_main.html(ss.html);
						flash_add("demilamedia_flash", "/static/scripts/plug/demilamedia/videoplayer/", defaultOption.videoW, defaultOption.videoH, {playlist: paths});
					}else{
						$hxlb_main.html(ss);
					}
					makeTxtPos();
					makeThePage();
				});
			}
		}
		$hxlb_tit.html(mainObjs.mainObjects[idx].title);
		currentNum = idx;
		if(currentNum == 0){
			$hxlb_lbtn.addClass("disable");
		}else{
			$hxlb_lbtn.removeClass("disable");
		}
		if(currentNum == mainObj_num - 1){
			$hxlb_rbtn.addClass("disable");
		}else{
			$hxlb_rbtn.removeClass("disable");
		}
	}
	$.fn.demilamedia = function(options){
		//alert(options);
		console.log("building...");
	}
	$.fn.demilamedia.open = function(objs){
		//alert(objs.length);
		console.log("building...");
	}
	$.extend({
		demilamedia: demilamedia
	});
	demilamedia.init();

	function checkImgSize(img){
		//console.log(img.width + "," + img.height);
		//console.log(defaultOption);
		if(img.width < defaultOption.minImgW){
			img.height = parseInt(img.height * defaultOption.minImgW / img.width);
			img.width = defaultOption.minImgW;
			return img;
		}
		if(img.height < defaultOption.minImgH){
			img.width = parseInt(img.width * defaultOption.minImgH / img.height);
			img.height = defaultOption.minImgH;
			return img;
		}
		if(img.width > defaultOption.maxImgW){
			img.height = parseInt(img.height * defaultOption.maxImgW / img.width);
			img.width = defaultOption.maxImgW;
		}
		if(img.height > defaultOption.maxImgH){
			img.width = parseInt(img.width * defaultOption.maxImgH / img.height);
			img.height = defaultOption.maxImgH;
			return img;
		}
		return img;
	}
	function makeThePage(){
		$hxlb_num.html((currentNum + 1) + "/" + mainObj_num);
	}
	function makeMainSize(w, h, callback, arrhide){
		$hxlb_arrs.children().hide();
		$hxlb.animate({
			"margin-left": -1 * (w + 40) / 2,
			"margin-top": -1 * (h + 60) / 2
		});
		$hxlb_main.animate({
			width: w,
			height: h
		}, function(){
			if(callback){
				callback();
			}
			if(!arrhide){
				$hxlb_arrs.children().show();
				txtshow();
			}
		});
	}
	function objInit(objs){
		if(isArray(objs)){
			mainObj_num = objs.length;
			loaded_num = 0;
			mainObjs.mainObjects = objs;
		}
	}
	function txthide(){
		$hxlb_tit.hide();
		$hxlb_tip.hide();
	}
	function txtshow(){
		$hxlb_tit.slideDown();
		$hxlb_tip.show();
	}
	function makeTxtPos(){
		$hxlb_tit.css("top", (defaultOption.maxH - $hxlb_main.height() - 60) / 2 - 20 - 3);
		$hxlb_tip.css("top", (defaultOption.maxH + $hxlb_main.height() + 60) / 2 + 1);
	}
	function getImgHtml(img){
		return "<img src='" + img.src + "' width='" + img.width + "' height='" + img.height + "' />";
	}
	function getSoundHtml(path){
		var tmp = "";
		if(yBrowser.versions.mobile || yBrowser.versions.iPad){
			if(soundFileCheck.test(getFileName(path))){
			 	tmp = "<audio id='demilamedia_sound' controls='controls' autoplay='autoplay'>\
					<source src='" + path + "' type='audio/" + getFileName(path) + "' />\
					<embed src='" + path + "' />\
					</audio>";
			}
			return tmp;
		}else if(Modernizr.audio){
		 	tmp = "<audio id='demilamedia_sound' controls='controls' autoplay='autoplay'>\
				<source src='" + path + "' type='audio/" + getFileName(path) + "' />\
				<embed src='" + path + "' />\
				</audio>";
			return tmp;
		}else{
			tmp = getFlashHtml();
			return {flash: true, html: tmp};
		}
	}
	function getVideoHtml(path){
		var tmp = "";
		if(yBrowser.versions.mobile || yBrowser.versions.iPad){
			if(videoFileCheck.test(getFileName(path))){
				tmp = "<video id='demilamedia_video' controls='controls' autoplay='autoplay'>\
					<source src='" + path + "' type='video/" + getFileName(path) + "' />\
					</video>";
			}
			return tmp;
		}else if(Modernizr.video){
			tmp = "<video id='demilamedia_video' controls='controls' autoplay='autoplay'>\
					<source src='" + path + "' type='video/" + getFileName(path) + "' />\
					</video>";
			return tmp;
		}else{
			tmp = getFlashHtml();
			return {flash: true, html: tmp};
		}
	}
	function getFlashHtml(){
		return "<div id='demilamedia_flash'></div>";
	}
	function getLoadHtml(){
		return "<span class='loading'></span>";
	}
	function loadhide(){
		//$hxlb_loading.hide();
		$hxlb_main.html("");
	}
	function loadshow(){
		//$hxlb_loading.show();
		$hxlb_main.html(getLoadHtml());
	}
	function hxboxResize(){
		var tW = $(WIN).width(),
			tH = $(WIN).height();
		defaultOption.maxW = tW;
		defaultOption.maxH = tH;
		if(defaultOption.videoW > tW - 10){
			defaultOption.videoW = tW - 10;
		}
		if(defaultOption.videoH > tH - 120){
			defaultOption.videoH = tH - 120;
		}
		if(defaultOption.soundW > tW - 10){
			defaultOption.soundW = tW - 10;
		}
		if(defaultOption.soundH > tH - 120){
			defaultOption.soundH = tH - 120;
		}
		makeTxtPos();
	}
	function isVideo(obj){
		if(isString(obj)){
			return filecheck.video.test(getFileName(obj));
		}
		return false;
	}
	function isSound(obj){
		if(isString(obj)){
			return filecheck.sound.test(getFileName(obj));
		}
		return false;
	}
	function isImage(obj){
		if(isObject(obj)){
			return obj.tagName.toLowerCase() === "img";
		}else if(isString(obj)){
			return filecheck.img.test(getFileName(obj));
		}
		return null;
	}
	function isArray(obj){
		return Object.prototype.toString.call(obj) === '[object Array]';
	}
	function isObject(obj){
		return typeof obj === 'object';
	}
	function isString(s){
		return typeof s === 'string';
	}
	function isNumber(n){
		return typeof n === 'number';
	}
	function getFileName(str){
		var tmp = /\.[^\.]+$/.exec(str.toLowerCase());
		if(!tmp || tmp.length == 0){
			return null;
		}
		var d = tmp[0];
		d = d.replace(".", "");
		return d;
	}
	function flash_add(domid, flashpath, flash_w, flash_h, flash_arg){
		/*if(flashplayer.need && flashplayer.statue != "finish"){
			setTimeout(function(){
				flash_add(domid, flashpath, flash_w, flash_h, flash_arg);
			}, 500);
			return;
		}*/
	    var mainDom = document.getElementById(domid),
	    	main_id = mainDom.id,
	    	playerPath = "/static/scripts/plug/demilamedia/videoplayer/player.swf",
	    	n = "opaque";
		
	    if(yBrowser.versions.isIE){
	    	mainDom.innerHTML = '\x3cobject classid\x3d"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width\x3d"100%" height\x3d"100%" id\x3d"' + main_id + '" name\x3d"' + main_id + '" tabindex\x3d"0"\x3e\x3cparam name\x3d"movie" value\x3d"' + playerPath + '"\x3e\x3cparam name\x3d"allowfullscreen" value\x3d"true"\x3e\x3cparam name\x3d"allowscriptaccess" value\x3d"always"\x3e\x3cparam name\x3d"seamlesstabbing" value\x3d"true"\x3e\x3cparam name\x3d"wmode" value\x3d"' + n + '"\x3e\x3cparam name\x3d"bgcolor" value\x3d"#000000"\x3e\x3cparam name\x3d"autostart" value\x3d"true"\x3e\x3cparam name\x3d"flashvars" value\x3d"file=' + flash_arg.playlist + '"\x3e\x3c/object\x3e';
	    }else{
	    	var f = document.createElement("object");
	    	f.setAttribute("type", "application/x-shockwave-flash");
	    	f.setAttribute("data", playerPath);
	    	f.setAttribute("width", "100%");
	    	f.setAttribute("height", "100%");
	    	f.setAttribute("bgcolor", "#000000");
	    	f.setAttribute("id", main_id);
	    	f.setAttribute("name", main_id);
	    	f.setAttribute("flashvars", "file=" + flash_arg.playlist);
	    	f.className = "jwswf";
	    	setParam(f, "file", flash_arg.playlist);
	    	setParam(f, "allowfullscreen", "true");
	    	setParam(f, "allowscriptaccess", "always");
	    	setParam(f, "seamlesstabbing", "true");
	    	setParam(f, "autostart", "true");
	    	setParam(f, "wmode", n);
	    	mainDom.parentNode.replaceChild(f, mainDom);
	    }
	    function setParam(a, b, c) {
			var e = document.createElement("param");
			e.setAttribute("name", b);
			e.setAttribute("value", c);
			a.appendChild(e)
		}
	}
})(window, document, jQuery);