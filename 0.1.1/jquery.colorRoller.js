/*
* jquery.colorRoller.min.js, version 0.1.1
* https://colorroller.hivekey.net
*
* Copyright 2017-, Francois du Plessis
* Date:2017-02-21 00:00:00 +0000
*/
(function ($) {
    "use strict";

    if (!window) {
        console.error('$.colorRoller error: no window object found.');
        return;
    }

    window.colorRoller = {};

    $.colorRoller = function (settings, callback) {

        settings = jQuery.extend({
            themeName: 'custom-theme', // default theme name 
            themeUrl: '', // support for loading absolute url to css file
            devMode: false, // enable to output styles on screen
            cssScope: '', // for secondary uiTheme scoping
            fetchCSS: '/dist/0.1.1/fetchCSS.php', // absolute location of your fetchCSS.php 
            urlColorNames: { bgColorHeader: "", borderColorHeader: "", fcHeader: "", iconColorHeader: "", bgColorContent: "", borderColorContent: "", fcContent: "", iconColorContent: "", bgColorDefault: "", borderColorDefault: "", fcDefault: "", iconColorDefault: "", bgColorHover: "", borderColorHover: "", fcHover: "", iconColorHover: "", bgColorActive: "", borderColorActive: "", fcActive: "", iconColorActive: "", bgColorHighlight: "", borderColorHighlight: "", fcHighlight: "", iconColorHighlight: "", bgColorError: "", borderColorError: "", fcError: "", iconColorError: "", bgColorOverlay: "", bgColorShadow: "" }
        }, settings);

        function searchStringFor(string, term) {
            string = string || "";
            term = term || "";

            var search_term = term.toString();
            var search_string = string.toString();

            return search_string.indexOf(search_term) !== -1 ? true : false;
        }

        function getArrayIndex(needle, haystack) {
            for (var hay = 0, hayLength = haystack.length; hay < hayLength; hay++) {
                if (searchStringFor(haystack[hay], needle)) {
                    return haystack[hay];
                }
            }
        }

        function getVarVal(url, parameter) {
            parameter = parameter.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regexS = "[\\?&]" + parameter + "=([^&#]*)";
            var regex = new RegExp(regexS);
            var results = regex.exec(url);
            return results !== null ? results[1] : '';
        }

        function parseAndPopulate(cssLinkUrl, themeName, cssScope) {
            window.colorRoller[themeName] = {};
            window.colorRoller[themeName].uiHex = {};
            window.colorRoller[themeName].cssScope = cssScope;
            window.colorRoller[themeName].cssUrl = cssLinkUrl;

            $.ajax({ url: cssLinkUrl }).done(function (data) {

                var themerollerURL = getArrayIndex('/themeroller/', data.split('*'));

                for (var className in settings.urlColorNames) {
                    window.colorRoller[themeName].uiHex[className] = getVarVal(themerollerURL, className);
                }

                writeCSStoPageHead(themeName);
            }).fail(function () {
                console.error(arguments);
            });
        }

        function writeCSStoPageHead(uiThemeName) {

            if (settings.devMode) {
                var devMarkup = '<h1 style="margin:0px;">Theme Name: ' + uiThemeName + '</h1>';
                devMarkup += '<h2 style="margin:10px 0px;">Theme URL: ' + window.colorRoller[uiThemeName].cssUrl + '</h2><hr />';
            }

            var cssMarkup = '';
            var hoverMarkup = '';
            var styleMarkup = '';
            var computedStyle = '';
            var styleScope = window.colorRoller[uiThemeName].cssScope ? '.' + window.colorRoller[uiThemeName].cssScope + ' ' : '';

            for (var className in settings.urlColorNames) {
                searchStringFor(className, 'Hover') ? hoverMarkup = ':hover ' : hoverMarkup = '';

                if (searchStringFor(className, 'bg')) { cssMarkup = 'background-color:#'; } else
                    if (searchStringFor(className, 'border')) { cssMarkup = 'border: 1px solid #'; } else
                        if (searchStringFor(className, 'fc') || searchStringFor(className, 'icon')) { cssMarkup = 'color:#'; }

                computedStyle = styleScope + '.' + className + hoverMarkup + ' {' + cssMarkup + window.colorRoller[uiThemeName].uiHex[className] + ';} \n';
                styleMarkup += computedStyle;

                if (settings.devMode) {
                    devMarkup += '<strong class="' + className + '">Class name: ' + className + '</strong> <em>' + computedStyle + ' </em><br /><hr />';
                }
            }

            $('<style type="text/css" theme="' + uiThemeName + '">' + styleMarkup + '</style>').appendTo('head');

            if (settings.devMode) {
                var appendDevMarkup = '<div style="padding:20px; margin:20px; background-color:#fff; color: #222; border:1px solid lime;" class="' + window.colorRoller[uiThemeName].cssScope + '" rel="colorRollerDev">' + devMarkup + '<textarea style="height:400px; width:99%;">' + styleMarkup + '</textarea></div>';

                var injAnchor = $('div[rel="devModeAnchor"]').length > 0 ? $('div[rel="devModeAnchor"]') : injAnchor = $('body');
                $('div[rel="colorRollerDev"]').length > 0 ? $('div[rel="colorRollerDev"]').after(appendDevMarkup) : injAnchor.append(appendDevMarkup);
            }

            if (typeof callback === 'function') { // make sure the callback is a function
                callback.call(this); // brings the scope to the callback
            }
        }

        var themeToSearch = settings.themeUrl ? settings.themeUrl : settings.themeName;

        if (searchStringFor(settings.themeUrl, 'http')) {
            if (settings.fetchCSS.toString() !== '') {

                parseAndPopulate(settings.fetchCSS + "?url=" + settings.themeUrl, settings.themeName, settings.cssScope);

            }
            else {

                console.error(' fetchCSS undefined! \n Specify the ABSOLUTE file location of fetchCSS.php in $.colorRoller settings, or add as an option to $.colorRoller() i.e. $.colorRoller({themeUrl:"http://external.com/styles.css",fetchCSS:"/location/to/fetchCSS.php"}); ');
                return;

            }
        }
        else {
            for (var cssLinkTagEQ = 0, linkLength = $('link').length; cssLinkTagEQ < linkLength ; cssLinkTagEQ++) {
                var cssUrl = $('link:eq(' + cssLinkTagEQ + ')').attr('href');
                if (searchStringFor(cssUrl, themeToSearch)) {
                    parseAndPopulate(cssUrl, themeToSearch, settings.cssScope);
                    break;
                }
            }
        }

        $.colorRoller.destroy = function (themeName, callback) {
            if (typeof themeName === 'undefined') {
                $('style[theme]').remove();
                delete window.colorRoller;
            }
            else {
                $('style').each(function () {
                    if ($(this).attr('theme') === themeName) {
                        $(this).remove();
                        delete window.colorRoller[themeName];
                    }
                });
            }

            if (typeof callback === 'function') { // make sure the callback is a function
                callback.call(this); // brings the scope to the callback
            }
        }

        return this;
    };
})(jQuery);
/**/