//jQuery plugin to simplify implementation of full page transitions
//2015 — Erik Friberg

(function($) {

    'use strict';

    $.cssPageTransitions = function(element, options) {

        var plugin = this;
        plugin.element = $(element);
        plugin.settings = {};

        plugin.pushed = false;

        plugin.wrapper = null;
        plugin.newElement = null;
        plugin.elementsOut = null;

        //setup defaults
        var defaults = {
            urlAttr: 'href',
            onClicked: function() {},
            onLoaded: function() {},
            elementsOut: 'article',
            elementsIn: 'article',
            classOut: '.is-moveout',
            classIn: '.is-movein',
            alignWithPrevious: true,
            scrollDisable: true,
            updateUrl: true,
            animationEnded: function() {},
            onErrorLoading: null
        };

        /****** PUBLIC FUNCTIONS ******/
        //check if the url is local
        plugin.localUrl = function(url) {
            if (url.indexOf(document.domain) > -1 || url.indexOf(':') === -1) {
                return true;
            }
            return false;
        };

        //Add new URL address to history
        plugin.bindNewLocalUrl = function(url) {
            //handle window location field
            if(url !== window.location) {
                //add the new page to the window.history
                window.history.pushState('{pushed: true}', null, url);
                plugin.pushed = true;
                return true;
            }
            return false;
        };

        //bind event to make back button update after pushState event
        plugin.bindBackButtonUrl = function() {
            $(window).on("popstate", function(e) {
                if(plugin.pushed || e.originalEvent.state !== null) {
                    window.location.reload();
                }else{
                    window.history.replaceState('{pushed: true}', null, window.location);
                }
            });
            return false;
        };

        //replaces click actions on both mobile and desktop with customFunction
        plugin.bindTouchClicks = function(elem,callbackFunction) {
            var e = 'ontouchstart' in $(window) ? 'touchstart':'click';
            //bind callback event so that this is preserved
            $(elem).on(e, function(e){callbackFunction.apply(elem,[e]);});
            return false;
        };

        //executes customFunction on animationEnd and transitonEnd
        plugin.bindAnimationTranstionEnd = function(elem, callbackFunction) {
            var animationEndEvent = 'webkitAnimationEnd oanimationend msAnimationEnd animationend webkitTransitionEnd otransitonend msTransitionEnd transitionend';
            $(elem).one(animationEndEvent, function(e) {
                //prevents animationEndEvent from firing twice a bit backwards but works
                $(this).off(animationEndEvent);
                //bind callback event so that this is preserved
                callbackFunction.apply(elem,[e]);
            });
            return false;
        };

        //toggle scroll
        plugin.togglePreventWindowScroll = function(bind) {
            var scrollEvent = 'mousewheel DOMMouseScroll touchmove scroll';

            if(bind) {
                $(window).on(scrollEvent, function(ev) {
                    ev.preventDefault();
                });
                return true;
            }else{
                $(window).off(scrollEvent);
            }
            return false;
        };

        /****** PRIVATE FUNCTIONS ******/

        //Start fading animation
        var startAnimationOut = function() {
            //add classes
            plugin.elementsOut.addClass(plugin.settings.classOut);
            //set the new element to align at the top of the previous content
            if(plugin.settings.alignWithPrevious) {
                plugin.wrapper.css({'overflow':'hidden', 'height':plugin.elementsOut.height()});
            }
        };

        //Start fade in animation
        var startAnimationIn = function() {
            //set the new element to align at the top of the previous content
            if(plugin.settings.alignWithPrevious) {
                var currentScroll = $(document).scrollTop();
                var offset = plugin.wrapper.offset();
                plugin.newElement.css({ "top": (currentScroll-offset.top)+"px"});
            }
        };

        //Functions after transition ends
        var registerTransitionAnimationEnd = function(e) {

            //Toggle scroll
            if(plugin.settings.scrollDisable) {
                plugin.togglePreventWindowScroll(false);
            }

            //call custom function
            plugin.settings.animationEnded.call();

            //Scroll to top of new content
            if(plugin.settings.alignWithPrevious) {
                plugin.newElement.css({ "top": "0px"});
                var offset = plugin.wrapper.offset();
                $(document).scrollTop(offset.top);
                plugin.wrapper.css({'overflow':'visible', 'height':'auto'});
            }

            //remove classes
            plugin.element.removeClass(plugin.settings.classOut);
            plugin.newElement.removeClass(plugin.settings.classIn);
            return false;
        };

        //Register classes and handle logic
        var registerCssPageTransitions = function(data, response, status, xhr) {
            //on error
            if ( status == "error" ) {
                //Call custom function
                if($.isFunction(plugin.settings.onErrorLoading)){
                    plugin.settings.onErrorLoading.call();
                }else{
                    //if no custom error function was defined, send the user to the page without effects
                    window.location.href = plugin.element.attr(plugin.settings.urlAttr);
                }
                return false;
            }

            //insert loaded element into page
            plugin.newElement = data.children().addClass(plugin.settings.classIn).insertAfter(plugin.elementsOut);

            //start animating in
            startAnimationIn();

            //Call custom function
            plugin.settings.onLoaded.call();

            //bind new url
            if(plugin.settings.updateUrl === true){
                plugin.bindNewLocalUrl(plugin.element.attr(plugin.settings.urlAttr));

                //set the document title to match the link
                var title = plugin.element.attr('title');
                if( typeof(title) !== 'undefined'){
                    document.title = title;
                }
            }

            //handle animationEnds
            plugin.bindAnimationTranstionEnd(plugin.newElement, registerTransitionAnimationEnd);
            return false;
        };

        //Retrive from url
        var registerLoadUrl = function(e) {
            var url = plugin.element.unbind(e)
                .attr(plugin.settings.urlAttr);

            //check if the link is local or not
            if(!plugin.localUrl(url)) {
                return false;
            }

            //prevent default link action
            e.preventDefault();

            //Call custom function
            plugin.settings.onClicked.call();

            //start animating out
            startAnimationOut();

            //bind scrollevent
            if(plugin.settings.scrollDisable) {
                plugin.togglePreventWindowScroll(true);
            }

            //load the next page
            var data  = $('<div>').load( url +' '+plugin.settings.elementsIn, function(response, status, xhr) {
                registerCssPageTransitions.apply(plugin.element,[data,response,status,xhr]);
            });
            return false;
        };

        //inits the plugin object
        plugin.init = function() {
            plugin.settings = $.extend({}, defaults, options);
            plugin.elementsOut = $(plugin.settings.elementsOut);

            //add wrapper
            if(plugin.settings.alignWithPrevious) {
                plugin.wrapper = $('#js-CssPageTransitionsWrapper');

                //create new if wrapper doesn’t exist
                if (!plugin.wrapper.length) {
                    var wrapper = $('<div />').attr('id','js-CssPageTransitionsWrapper')
                    .css({'position': 'relative', 'width': '100%'});
                    plugin.elementsOut.wrapAll(wrapper);
                    plugin.wrapper = $('#js-CssPageTransitionsWrapper');
                }
            }

            //store the initial page
            if('state' in window.history && window.history.state !== null) {
                window.history.replaceState({path: document.location.href}, document.title, document.location.href);
            }

            //bind back button for corrected behaviour
            if(plugin.settings.updateUrl === true){
                plugin.bindBackButtonUrl();
            }

            //Trigger the plugin on click
            plugin.bindTouchClicks(element, registerLoadUrl);
            return false;
        };

        //Fire up the plugin
        plugin.init();

    };

    // add the plugin to the jQuery.fn object
    $.fn.cssPageTransitions = function(options) {
        return this.each(function() {
            if (undefined === $(this).data('cssPageTransitions')) {
                var plugin = new $.cssPageTransitions(this, options);
                $(this).data('cssPageTransitions', plugin);
            }
        });
    };

})(jQuery);