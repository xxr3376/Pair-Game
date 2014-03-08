$(function(){
	"use strict";
	function getModuleName(href) {
		href = href.replace(/^https?:\/\//, '');
		var sp = href.split('/')
    var module = sp[1] + '/' + sp[2] ? sp[2] : '';
		if (module == ""){
			module = "index";
		}
		return module;
	}
	var currentModule = getModuleName(window.location.href);
	var links = $('#navi-menu>li');
	for (var i = 0, len = links.length; i < len; i++) {
		var link = links[i].querySelector('a');
		if (getModuleName(link.href) == currentModule) {
			$(links[i]).addClass('active');
		}
	}
});
