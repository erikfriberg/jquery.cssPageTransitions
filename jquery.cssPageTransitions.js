'use strict';

//jQuery plugin to simplify implementation of full page transitions
//2015 — Erik Friberg

(function($) {

    $.cssPageTransitions = function(element, options) {

        var plugin = this;
        plugin.settings = {};

        var $element = $(element),
             element = element;

        plugin.canScroll = true;

        //setup defaults
        var defaults = {
            urlAttr: 'href',
            externalUrl: false,
            onLoaded: function() {},
            elementsOut: 'body',
            classOut: '.is-moveout',
            classIn: '.is-movein',
            alignWithPrevious: true,
            scrollDisable: true,
            updateUrl: true,
            animationEnded: function() {}
        };

        /****** PUBLIC FUNCTIONS ******/
        //plugin functions
        //check if local url
        plugin.localUrl = function(url) {
            if (url.indexOf(document.domain) > -1 || url.indexOf(':') === -1) {
                return true;
            }
            return false;
        };

        //Add new URL address to history
        plugin.bindNewLocalUrl = function(url){
            //handle window location field
            if(url != window.location) {
                //add the new page to the window.history
                window.history.pushState({path: url},'',url);
            }
        };

        //bind event to make back button update after pushState event
        plugin.bindBackButtonUrl = function() {
            $(window).one("popstate", function(e) {
                if (e.originalEvent.state !== null) {
                    window.location.reload();
                }
            });
        };

        //replaces click actions on both mobile and desktop with customFunction
        plugin.bindTouchClicks = function(elem,callbackFunction) {
            var e = 'ontouchstart' in $(window) ? 'touchstart' : 'click';
            //bind callback event so that this is preserved
            $(elem).on(e, function(e){callbackFunction.apply(elem,[e])});
        };

        //executes customFunction on animationEnd and transitonEnd
        plugin.bindAnimationTranstionEnd = function(elem, callbackFunction) {
            var animationEndEvent = 'webkitAnimationEnd oanimationend msAnimationEnd animationend webkitTransitionEnd otransitonend msTransitionEnd transitionend';
            $(elem).one(animationEndEvent, function(e) {
                //prevents animationEndEvent from firing twice a bit backwards but works
                $(elem).off(animationEndEvent);
                //bind callback event so that this is preserved
                callbackFunction.apply(elem,[e]);
            });
        };

        /****** PRIVATE FUNCTIONS ******/
        //prevent Scroll
        var bindWindowScroll = function() {
            $(window).on('mousewheel', function(ev) {
                if ( !plugin.canScroll) {
                    ev.preventDefault();
                }
            });
        }

        //Register classes and handle logic
        var registerCssPageTransitions = function(data) {
            //add classes
            $(plugin.settings.elementsOut).addClass(plugin.settings.classOut);
            var newElement = $(data).addClass(plugin.settings.classIn).insertAfter(plugin.settings.elementsOut);

            //preventScrolling
            plugin.canScroll = false;

            //set the new element to align at the top of the previous content
            if(plugin.settings.alignWithPrevious) {
                var currentScroll = $(document).scrollTop();
                var offset = $('.js-registerCssPageTransitions-wrapper').offset();
                $(newElement).css({ "top": (currentScroll-offset.top+1)+"px"});
            }

            //Call custom cunction
            plugin.settings.onLoaded.call();

            //bind new url
            if(plugin.settings.updateUrl == true){
                plugin.bindNewLocalUrl($(this).attr(plugin.settings.urlAttr));
                var title = $(this).attr('title');
                if( typeof(title) != 'undefined'){
                    document.title = $(this).attr('title');
                }
            }

            //handle animationEnds
            plugin.bindAnimationTranstionEnd(plugin.settings.elementsOut, function(e) {

                //return scroll control
                plugin.canScroll = true;

                //remove window event
                if(plugin.settings.scrollDisable) {
                    $(window).off('mousewheel');
                }

                plugin.settings.animationEnded.call();

                //Scroll to top of new content
                if(plugin.settings.alignWithPrevious) {
                    $(newElement).css({ "top": "0px"});
                    var offset = $('.js-registerCssPageTransitions-wrapper').offset();
                    $(document).scrollTop(offset.top);
                }

                //remove classes
                $(this).removeClass(plugin.settings.classOut);
                $(newElement).removeClass(plugin.settings.classIn);
            });
        };

        //Retrive from url
        var getUrlIfLocal = function(e) {
            var url = $(this).attr(plugin.settings.urlAttr);
            $(this).unbind(e);

            //check if the link is local, if not continue as normal
            if(!plugin.localUrl(url) && !plugin.settings.externalUrl) {
                return 0;
            }

            //prevent default link action
            e.preventDefault();

            var elem = this;
            //load the next page
            $.get( url, function(data){
                registerCssPageTransitions.apply(elem,[data])
            });
        };

        //inits the plugin object
        plugin.init = function() {
            plugin.settings = $.extend({}, defaults, options);
            plugin.bindTouchClicks(element, getUrlIfLocal);

            //bind scrollevent
            if(plugin.settings.scrollDisable) {
                bindWindowScroll();
            }

            //add wrapper if it doesn't already exists
            if(plugin.settings.alignWithPrevious && !$('.js-registerCssPageTransitions-wrapper').length){
                var wrapper = $('<div />').addClass('js-registerCssPageTransitions-wrapper');
                wrapper.css({'position': 'relative', 'width': '100%'});
                $(plugin.settings.elementsOut).wrapAll(wrapper);
            }
        };

        //Fire up the plugin
        plugin.init();

    }

    // add the plugin to the jQuery.fn object
    $.fn.cssPageTransitions = function(options) {
        return this.each(function() {
            if (undefined == $(this).data('cssPageTransitions')) {
                var plugin = new $.cssPageTransitions(this, options);
                $(this).data('cssPageTransitions', plugin);
            }
        });
    }

})(jQuery);