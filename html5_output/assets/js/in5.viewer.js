/*TO DO:
- thumbnail transition
- future: DOMMatrix v. WebKitCSSMatrix
	https://stackoverflow.com/questions/5603615/get-the-scale-value-of-an-element
*/

$(function(){
	if($('body').hasClass('webapp-instructions')) return;
	var beenDragged=!1;
	var svgns = ' xmlns="http://www.w3.org/2000/svg"',
	icons = { toc:{title:'Go to Table of Contents', enabled:viewOpts.toc, action:function(){nav.to(viewOpts.toc)}, html:'<svg viewBox="0 0 48 48"'+svgns+'><path d="M0 0h48v48H0z" fill="none"/><path d="M6 36h36v-4H6v4zm0-10h36v-4H6v4zm0-14v4h36v-4H6z"/></svg>'},
		thumbs:{title:'Toggle page thumbnails', action:function(){togglePageThumbs()}, enabled:viewOpts.thumbs, html:'<svg viewBox="0 0 32 32"'+svgns+'><path d="M4 4h6v6H4zm9 0h6v6h-6zm9 0h6v6h-6zM4 13h6v6H4zm9 0h6v6h-6zm9 0h6v6h-6zM4 22h6v6H4zm9 0h6v6h-6zm9 0h6v6h-6z"/></svg>'}, id:'opt-thumbs-btn',
		zoomin:{title:'Zoom in', enabled:viewOpts.zoom, id:'opt-zoom-in-btn', 'class':'hideFS',
		action:function(){zoom('in');}, html:'<svg viewBox="0 0 24 24"'+svgns+'><path d="M9 9V6h1v3h3v1h-3v3H9v-3H6V9h3zm7.5 5.4c1-1.4 1.5-3 1.5-5C18 5 14.2 1 9.5 1S1 4.8 1 9.5 4.8 18 9.5 18c1.8 0 3.5-.6 5-1.5l6.2 6.3h.4l2-1.8v-.3l-6-6.3zm-7 1.6C13 16 16 13 16 9.5S13 3 9.5 3 3 6 3 9.5 6 16 9.5 16z" fill-rule="evenodd"/></svg>'},
		zoomout:{title:'Zoom out', enabled:viewOpts.zoom, id:'opt-zoom-out-btn', 'class':'hideFS',
		action:function(){zoom('out');},
		html:'<svg viewBox="0 0 24 24"'+svgns+'><path d="M16.5 14.4c1-1.4 1.5-3 1.5-5C18 5 14.2 1 9.5 1S1 4.8 1 9.5 4.8 18 9.5 18c1.8 0 3.5-.6 5-1.5l6.2 6.3h.4l2-1.8v-.3l-6-6.3zm-7 1.6C13 16 16 13 16 9.5S13 3 9.5 3 3 6 3 9.5 6 16 9.5 16zM6 9v1h7V9H6z" fill-rule="evenodd"/></svg>'},
		fullscreen:{title:'Toggle fullscreen', enabled:viewOpts.fs && fullscreenEnabled(), id:'opt-fs-btn',
		action:function(){toggleFullScreen();}, html:'<svg'+svgns+' viewBox="0 0 48 48"><path d="M7 38.3h34V11H7v27.3zm-3.6-31h10.3V4H0v13.7h3.4V7.4zm0 24H0V45h13.7v-3H3.4V31.4zM34.4 4v3.4h10.2v10.3H48V4H34.3zm10.2 37.7H34.3V45H48V31.5h-3.4v10.3z"/></svg>'},
		pdf:{title:'Download PDF version', enabled:viewOpts.pdf, 
		action:function(e){if(window.trackButtonClick){window.trackButtonClick(e);} window.open(viewOpts.pdf,'_blank');},html:'<svg viewBox="0 0 48 48"'+svgns+'><path d="M0 0h48v48H0z" fill="none"/><path d="M38.7 20C37.3 13.3 31.3 8 24 8c-5.8 0-10.8 3.3-13.3 8C4.7 16.8 0 22 0 28c0 6.6 5.4 12 12 12h26c5.5 0 10-4.5 10-10 0-5.3-4-9.6-9.3-10zM34 26L24 36 14 26h6v-8h8v8h6z"/></svg>'},
		in5:{title:'Built with in5', enabled:viewOpts.footer, action:function(e){ window.open($('#in5footer a').attr('href'),'_blank'); },html:'<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 48 47.8"><defs><style>.cls-1{fill:#e34f26;}</style></defs><path d="M0 0l4.4 43L24 48l19.6-5L48 0zm8.4 11.4l7-3.3v6.4l-7 3.3zm30 5.7v12l-6 5.5V17a1.7 1.7 0 0 1 0-.2 3 3 0 0 0-.7-2c-.6-.6-1.5-.7-3-.7-1.3 0-2.3.4-3 1a3 3 0 0 0-.5 2h.2v9c0 .4-.2.5-.2.5a8 8 0 0 1-8 7.6 8 8 0 0 1-7.2-4 11 11 0 0 1-1.4-3.6s-.2 0-.2-.2V21l7-3.2V26a1.8 1.8 0 0 0 .3.8c0 .2.3.6 1.3.6s1-.3 1.2-.6a2 2 0 0 0 .2-1V17a10.5 10.5 0 0 1 2.7-7 10.3 10.3 0 0 1 8-3 9.4 9.4 0 0 1 7.5 3c2.5 2.7 2.2 6.2 2.2 7z"/></svg>',init:function(){ $('#in5footer').hide(); } }
	};

	var $vbar = $('<div id="viewer-options-bar"><span id="viewer-title"><span id="viewer-logo"></span></span><span id="viewer-pagecount"></span><span id="viewer-options"></span></div>').css('background-color',viewOpts.bg).addClass(getContrast(viewOpts.bg));
	var $vwrap = $('<div id="viewer-options-wrap" class="collapsed">');
	var $vthumbs = $('<div id="viewer-options-thumb-images"></div>');
	var $vthumbwrap = $('<div id="viewer-thumb-wrap"></div>').append($vthumbs);
	var th=1, tlen=icons.thumbs.enabled?nav.numPages:0, $titem;
	var numLayouts = in5.layouts.length;
	for(th;th<=tlen;th++) {
		var li = 0, nl = numLayouts, la;
		for(li;li<nl;li++) {
			la = in5.layouts[li];
			$titem = $('<div data-index="'+th+'" class="viewer-page-thumb"><img class=" '+la.class+'" title="page '+th+'" alt="page '+th+'" src="assets/images/pagethumb_'+((th*.0001).toFixed(4).substr(2)+'_'+li)+'.jpg"/></div>'); 
			$titem[0].pageIndex = th;
			$titem.on(clickEv,function(e){if(!beenDragged){nav.to(this.pageIndex); togglePageThumbs();} });
			$vthumbs.append($titem);
		}
	}
	var $thumbImages = $vthumbwrap.hide().find('img').on('dragstart', function(e) { e.preventDefault(); });
	if(tlen && fitTallToWidth && !numLayouts){
		$thumbImages.first().one('load',function(){
			try { $thumbImages.css({'max-height':this.naturalHeight,'min-width':this.naturalWidth,'object-fit':'cover','object-position':'top left'}); }catch(err){};
		});
	}
	$vwrap.append($vthumbwrap);
	$(document).on('pageRendered',function(){ $('.viewer-page-thumb').removeClass('active').filter('[data-index="'+nav.current+'"]').addClass('active'); });
	$progbar = $("<div id='viewer_progress_bar'> </div>");
	if(viewOpts.progress) {
		if(!multifile) $progbar.css({'-webkit-transition':'.5s width','transition':'.5s width'});
		$vwrap.append($progbar);
		updateReadingProgress(getStartPage());
	}
	function togglePageThumbs(){ $vthumbwrap.toggle({duration:0,start:function(){
		$('.viewer-page-thumb.active').each(function(ind,el){
			$th = $(this), w = $th.width();
			if(w > 0) { $vthumbwrap.scrollLeft($th.offset().left - window.innerWidth/2 + w/2); };
		});
	}}); }
	$vwrap.append($vbar);
	var $vlogo = $vwrap.find('#viewer-logo'), $vtitle = $vwrap.find('#viewer-title'), $vcount = $vwrap.find('#viewer-pagecount'), $vopts = $vwrap.find('#viewer-options');
	$vtitle.append(viewOpts.title ? document.title : '');
	viewOpts.page ? $vcount.html(getPageStr()).on(clickEv,function(e){ if(!$vcount.find('input').length) { $vcount.html(getPageEdit()); } }) : $vcount.hide();
	if(viewOpts.logo){
		var $logoImg='';
		switch(viewOpts.logo.split('.').pop()){
		case 'png': $logoImg = $("<img src='"+viewOpts.logo+"' alt='logo' />"); break;
		case 'svg': $logoImg = $("<object data='"+viewOpts.logo+"' alt='logo' type='image/svg+xml'></object>"); break;
		}
		$vlogo.append($logoImg);
		$logoImg.on('load',function(e) { $vlogo.width($logoImg.width()); });
	} else { $vlogo.hide(); }
	
	var icon, cicon, $btn, iconCount=0, cl;
	for(icon in icons){
		cicon = icons[icon];
		if(!cicon.enabled) continue;
		iconCount++;
		cl = "viewer-option-btn" + (cicon.class?' '+cicon.class:'');
		$btn = $('<div class="'+cl+'" title="'+cicon.title+'" name="'+cicon.title+'">'+cicon.html+'</div>');
		if(cicon.id) $btn.attr('id',cicon.id);
		$vopts.append($btn);
		$btn[0].clickAction = cicon.action;
		$btn.on(clickEv, function(e) { this.clickAction(e); });
		if(cicon.init) cicon.init();
	}
	if(!iconCount && !viewOpts.title && !viewOpts.page) $vwrap.addClass('no-options');
	var $vtog = $('<span id="view-toggle" style="background:'+viewOpts.bg+';"><svg xmlns="http://www.w3.org/2000/svg" width="26" height="26"><g><path d="M.046 2.582L2.13.498l10.837 10.836L23.803.498l2.084 2.084-12.92 12.92z"/><path d="M.046 13.582l2.084-2.084 10.837 10.836 10.836-10.836 2.084 2.084-12.92 12.92z"/></g></svg></span>');
	$vbar.append($vtog);
	$vtog.on(clickEv, function(e) { $vwrap.toggleClass('collapsed'); scaleLayoutFunc(); });
	$('body').append($vwrap);

	$(document).on('newPage',function(e,data) {
		/*to do: reset zoom here, hide thumbs?*/
		if(viewOpts.page) $vcount.html(getPageStr());
		if(multifile) updateReadingProgress(nav.current);
		else updateReadingProgress(data.index+1);
	});
	function getPageStr(){ return $vcount.data('keepOpen') ? getPageEdit : '<span id="page-display-wrap" style="cursor:pointer;">'+ (nav.current || '—') + ' / ' + nav.numPages +'</span>'; }
	function getPageEdit(){
		$in = $('<input type="number" style="min-width:6ex;" min="1" max="'+nav.numPages+'" id="jump_to_page" autofocus="autofocus" formnovalidate="formnovalidate" size="'+(nav.numPages.toString().length+4)+'" value="'+(nav.current||1)+'"/>');
		$in.on('keypress',function(e){ if(e.which == 13) { $vcount.data('keepOpen',!1); nav.to(Math.min (Math.max(1, parseInt($in.val())),nav.numPages) ); } }).on('input',function(e) { 
			if(e.originalEvent.inputType == 'insertText') { return; }
			$vcount.data('keepOpen',!0); 
			nav.to(parseInt($in.val())); 
		});
		return $("<span id='page-edit-wrap'/>").append([$in,$("<span> / " + nav.numPages + "</span>").on(clickEv,function(e){ $vcount.data('keepOpen',!1); setTimeout(function(){$vcount.html(getPageStr());},1); }) ]);
	}
	function updateReadingProgress(currentPage){
		var progress = currentPage/nav.numPages;
		$progbar.css('width',(progress*100)+'%');
	}
	
	function getContrast(c){
		if(c=='transparent') return 'light';
		c = c.split('#').pop();
		if(c.length === 3) {c=c+c;}
    	var r = parseInt(c.substr(0,2),16), g = parseInt(c.substr(2,2),16), b = parseInt(c.substr(4,2),16), yiq = ((r*.3)+(g*.59)+(b*.114));
		return yiq>156?'light':'dark';
	}
	
	if(!touchEnabled) {
		var x,left,down;
		$vthumbwrap.mousedown(function(e){ e.preventDefault(),down=!0,beenDragged=!1,x=e.pageX,left=$(this).scrollLeft(); });
		$(window).mousemove(function(e){
			if(!down) return;
			var newX=e.pageX;
			if(newX === x || (!beenDragged && Math.abs(newX-x)<5) ) return;
			$vthumbwrap.scrollLeft(left-newX+x),beenDragged=!0,$('html').addClass('dragging');
		}).mouseup(function(e){if(down){ down=!1; setTimeout(function(){beenDragged=!1; $('html').removeClass('dragging');},1);
		}});
	}
});

function zoom(dir){
	var flipTarg = $('.pages.flip .activePage .page-scale-wrap'), $body = $('body'),
		scaleTarg = flipTarg.length ? flipTarg : $('#container'),
		scaled = window.scaleLayoutFunc !== undefined, scrollStart = {x:window.scrollX,y:window.scrollY},
		newScale, currentScale, scaleChange, removeZoomClass;
	switch(dir){
		case 'in':
			$body.addClass('zoomed').redraw();
			var maxScale = 10;
			currentScale = parseFloat(getCurrentScale(scaleTarg[0],!0));
			newScale = currentScale + (currentScale > .9 ? 1 : currentScale);
			if(newScale > maxScale) newScale = maxScale;
			if(scaled) {window.scaleLayoutFunc(!1,newScale);}
			else if(flip){window.scaleFlipLayout(!1,newScale);}
			else {scaleTarg.css(prefix.css+'transform','scale('+newScale+','+newScale+')').css(prefix.css+'transform-origin', '0 0 0');}
			break;
		case 'out':
			$body.removeClass('zoomed');/*dims w/o scrollbars*/
			minScale = scaled ? window.scaleLayoutFunc(!0) : 1;
			currentScale = parseFloat(getCurrentScale(scaleTarg[0],!0));
			newScale = currentScale - 1;
			if(newScale < minScale+.1) {
				newScale = minScale;
				removeZoomClass = !0;
				/*removeDrag();*/
			}
			if(!removeZoomClass) $body.addClass('zoomed');
			if(scaled) {window.scaleLayoutFunc(!1,newScale);}
			else if(flip){window.scaleFlipLayout(!1);}
			else {scaleTarg.css(prefix.css+'transform', 'scale('+newScale+','+newScale+')').css(prefix.css+'transform-origin', '0 0 0');}
			break;
		default: return !1;
	}
	scaleChange = (newScale/currentScale);
	window.scrollTo(scrollStart.x *scaleChange,scrollStart.y*scaleChange);
	if(removeZoomClass) { $body.removeClass('zoomed'); if(pageMode[0] !== 'c') { $(window).scrollTop(0); } }
}

function initDrag(el,scroller){
	if(!touchEnabled) return;
	var x,y,left,down, $el = $(el), $s = scroller ? $(scroller) : $el;
	$el.mousedown(function(e){e.preventDefault(),down=!0,x=e.pageX,y=e.pageY,left=$s.scrollLeft(),sTop=$s.scrollTop();});
	$(window).mousemove(function(e){
		if(down){
			var newX=e.pageX,newY=e.pageY;
			$s.scrollLeft(left-newX+x), $s.scrollTop(sTop-newY+y),beenDragged=!0,$('html').addClass('dragging');
		}
	}).mouseup(function(e){if(down){ down=!1; setTimeout(function(){beenDragged=!1; $('html').removeClass('dragging');},1); }});
}

function removeDrag(){
	$('html,body').removeClass('zoomed').scrollTop(0).scrollLeft(0).off('mousedown'); 
	$(window).off('mousemove'); 
}