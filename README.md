# jquery.cssPageTransitions
Jquery plugin to simplify implementation of full page transitions via Ajax.

The plugin is inspired by http://tympanus.net/codrops/2013/10/30/medium-style-page-transition/

## Usage

jQuery.cssPageTransitions depends on jQuery. Include them both in end of your HTML code:

```html
<script src=“jquery.js” type=“text/javascript”></script>
<script src=“jquery.cssPageTransitions.js” type=“text/javascript”></script>
```

Prepare your CSS with classes for “slide-in” animations and “slide-out” animations. For example:



```css
@keyframes next-movein {
    from { transform: translate3d(100%,0,0); opacity: 0.5; }
    to { transform: translate3d(0,0,0); opacity: 1; }
}

@keyframes next-moveout {
    from { transform: translate3d(0,0,0); opacity: 1; }
    to { transform: translate3d(-100%,0,0); opacity: 0.25; }
}

.is-movein, .is-moveout {
    top: 0;
    left: 0;
    position: absolute;
    width: 100%;
}

.is-movein {
    animation: next-movein 0.5s cubic-bezier(0.445, 0.05, 0.55, 0.95);
}

.is-moveout {
    animation: next-moveout 0.5s cubic-bezier(0.445, 0.05, 0.55, 0.95);
    animation-fill-mode: forwards;
}
```

then all you need to do in your code is

```js
$( document ).ready(function() {
		$(‘.next’).cssPageTransitions( { 
		elementsOut: ‘.elemToAnimate’
});
```

This causes the targeted class element named “.elemToAnimate” to transition out and the new source will be loaded to take it’s place.

# License

All code licensed under the [MIT License](http://www.opensource.org/licenses/mit-license.php). All images licensed under [Creative Commons Attribution 3.0 Unported License](http://creativecommons.org/licenses/by/3.0/deed.en_US).
