/*
 * jquery.colorRoller.min.js, version 0.1.0
 * http://colorroller.redpear.co.za/
 *
 * Copyright 2012-, Francois du Plessis
 * Date:2012-07-16 00:00:00 +0000
 */
(function ($) {
    $.colorRoller = {
        version: '0.1.0'
    };
    $.colorRoller = function (settings, callback) {
        settings = jQuery.extend({
			themeName: 'custom-theme', // default theme name 
			themeUrl: '', // support for loading absolute url to css file
			devMode: false, // enable to output styles on screen
			cssScope: '', // for secondary uiTheme scoping
			fetchCSS: '/scripts/0.1.0/fetchCSS.php', // absolute location of your fetchCSS.php 
			urlColorNames: {bgColorHeader:"", borderColorHeader:"", fcHeader:"", iconColorHeader:"", bgColorContent:"", borderColorContent:"", fcContent:"", iconColorContent:"", bgColorDefault:"", borderColorDefault:"", fcDefault:"", iconColorDefault:"", bgColorHover:"", borderColorHover:"", fcHover:"", iconColorHover:"", bgColorActive:"", borderColorActive:"", fcActive:"", iconColorActive:"", bgColorHighlight:"", borderColorHighlight:"", fcHighlight:"", iconColorHighlight:"", bgColorError:"", borderColorError:"", fcError:"", iconColorError:"", bgColorOverlay:"", bgColorShadow:""}
        }, settings);

		function searchStringFor(string, term) 
		{
			if (string == null) { string = ""; }
			if (term == null) { term = ""; }
		
			var result;
			var search_term = term.toString();
			var search_string = string.toString();
		
			var string_check = search_string.indexOf(search_term);
			if (string_check != -1) {
				var result = true;
			} else {
				var result = false;
			}
			return (result);
		}
		
		function getArrayIndex(needle, haystack) 
		{
			for (hay = 0; hay < haystack.length; hay++) {
				if (searchStringFor(haystack[hay], needle)) {
					return haystack[hay];
				}
			}
		}
		
		function getVarVal(url, parameter) 
		{
			parameter = parameter.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
			var regexS = "[\\?&]" + parameter + "=([^&#]*)";
			var regex = new RegExp(regexS);
			var results = regex.exec(url);
			if (results == null)
				return "";
			else
				return results[1];
		}
		
		function parseAndPopulate(cssLinkUrl, themeName, cssScope)
		{
			if(typeof colorRoller=='undefined'){colorRoller=new Object();}
			colorRoller[themeName] = {};
			colorRoller[themeName].uiHex = {};
			colorRoller[themeName].cssScope = cssScope;
			colorRoller[themeName].cssUrl = cssLinkUrl;
			
			$.ajax({url: cssLinkUrl}).done(
				function(data) 
				{ 
		
					themerollerURL = getArrayIndex('/themeroller/', data.split('*'));
					
					for (className in settings.urlColorNames)
					{
						colorRoller[themeName].uiHex[className] = getVarVal(themerollerURL, className);
					}
				
					writeCSStoPageHead(themeName);
				}
			).error(function(jqXHR, textStatus, ex) 
			{ 
				alert(textStatus + "\n" + ex + "\n" + jqXHR.responseText);
    	    });
		}
		
		function writeCSStoPageHead(uiThemeName)
		{
			if (settings.devMode)
			{	
				devMarkup = '<h1 style="margin:0px;">Theme Name: '+uiThemeName+'</h1>';
				devMarkup += '<h2 style="margin:10px 0px;">Theme URL: '+colorRoller[uiThemeName].cssUrl+'</h2><hr />';
			}
			
			cssMarkup = '';
			hoverMarkup = '';
			styleMarkup = '';
			computedStyle = '';
			styleScope = colorRoller[uiThemeName].cssScope ? '.'+ colorRoller[uiThemeName].cssScope + ' ' : '';
			
			for (className in settings.urlColorNames)
			{
				searchStringFor(className, 'Hover') ? hoverMarkup = ':hover ' : hoverMarkup = '';
				
				if (searchStringFor(className, 'bg')) {cssMarkup = 'background-color:#';} else
				if (searchStringFor(className, 'border')) {cssMarkup = 'border: 1px solid #'; } else 
				if (searchStringFor(className, 'fc') || searchStringFor(className, 'icon')) {cssMarkup = 'color:#';} 
		
				computedStyle = styleScope + '.' + className + hoverMarkup + ' {' + cssMarkup + colorRoller[uiThemeName].uiHex[className] + ';} \n'; 
				styleMarkup += computedStyle;
				
				if (settings.devMode)
				{
					devMarkup += '<strong class="'+className+'">Class name: '+className+'</strong> <em>' +computedStyle+ ' </em><br /><hr />';
				}
			}
			
			$('<style type="text/css" theme="'+uiThemeName+'">'+styleMarkup+'</style>').appendTo('head');
				
			if (settings.devMode)
			{	
				appendDevMarkup = '<div style="padding:20px; margin:20px; background-color:#fff; color: #222; border:1px solid lime;" class="'+colorRoller[uiThemeName].cssScope+'" rel="colorRollerDev">'+devMarkup+'<textarea style="height:400px; width:99%;">'+styleMarkup+'</textarea></div>';
				$('div[rel="devModeAnchor"]').size() > 0 ? injAnchor = $('div[rel="devModeAnchor"]') : injAnchor = $('body');
				$('div[rel="colorRollerDev"]').size() > 0 ? $('div[rel="colorRollerDev"]').after(appendDevMarkup) : injAnchor.append(appendDevMarkup);
			}
			
			if (typeof callback == 'function') { // make sure the callback is a function
    	    	callback.call(this); // brings the scope to the callback
	    	}
		}

		settings.themeUrl ? themeToSearch = settings.themeUrl : themeToSearch = settings.themeName;
		
		if (searchStringFor(settings.themeUrl, 'http') )
		{
			if (settings.fetchCSS.toString() != '')
			{
				fetchCSSurl = settings.fetchCSS + "?url="+settings.themeUrl
			}
			else
			{
				alert(' fetchCSS undefined! \n Specify the ABSOLUTE file location of fetchCSS.php in $.colorRoller settings, or add as an option to $.colorRoller() i.e. $.colorRoller({themeUrl:"http://external.com/styles.css",fetchCSS:"/location/to/fetchCSS.php"}); ');
				return;
			}
			
			parseAndPopulate(fetchCSSurl, settings.themeName, settings.cssScope);
		}
		else
		{
			for (var cssLinkTagEQ = 0; cssLinkTagEQ < $('link').size(); cssLinkTagEQ++) 
			{
				cssUrl = $('link:eq(' + cssLinkTagEQ + ')').attr('href');
				if (searchStringFor(cssUrl, themeToSearch)) 
				{ 
					parseAndPopulate(cssUrl, themeToSearch, settings.cssScope); 
					break; 
				}
			}
		}
		
		$.colorRoller.destroy = function (themeName,callback)
		{
			if(typeof themeName=='undefined')
			{
				$('style[theme]').remove();
				colorRoller = {};
			}
			else
			{
				$('style').each(function(){	
					if ($(this).attr('theme') == themeName) 
					{ 
						$(this).remove();
						delete colorRoller[themeName];
					} 
				});
			}
			
			if (typeof callback == 'function') { // make sure the callback is a function
    	    	callback.call(this); // brings the scope to the callback
	    	}
		}
		
        return this;
    };
})(jQuery);
/**/