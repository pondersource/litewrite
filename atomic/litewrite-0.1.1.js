/******/ var __webpack_modules__ = ({

/***/ 734
(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = (function(require) {

  var $ = __webpack_require__(486);
  var _ = __webpack_require__(523);

  function sync(method, model, options) {
    var resp;
    var done = $.Deferred();

    switch (method) {
      case "read":    resp = model.id !== undefined ? find(model) : findAll(model); break;
      case "create":  resp = set(model);                                            break;
      case "update":  resp = set(model);                                            break;
      case "delete":  resp = destroy(model);                                        break;
    }

    resp.then(function(res) {
      options.success(res);
      if (options.complete) options.complete(res);
      done.resolve(res);
    }, function(res) {
      options.error(res);
      if (options.complete) options.complete(res);
      done.reject(res);
    });

    return done;
  }


  function find(model) {
    return model.collection.remote.get(model.id);
  }

  function findAll(collection) {
    return collection.remote.getAll().then(function(objMap) {
      return _.values(objMap);
    });
  }

  function set(model) {
    return model.collection.remote.set(model.id, model.toJSON()).then(function() {
      return model.toJSON();
    });
  }

  function destroy(model) {
    return model.collection.remote.remove(model.id.toString()).then(function() {
      return model.toJSON();
    });
  }



  return sync;
}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },

/***/ 757
(module, exports) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
 * Snap.js
 *
 * Copyright 2013, Jacob Kelley - http://jakiestfu.com/
 * Released under the MIT Licence
 * http://opensource.org/licenses/MIT
 *
 * Github:  http://github.com/jakiestfu/Snap.js/
 * Version: 1.9.3
 */
/*jslint browser: true*/
/*global define, module, ender*/ (function(win, doc) {
  'use strict';
  var Snap = Snap ||
  function(userOpts) {
    var settings = {
      element: null,
      dragger: null,
      disable: 'none',
      addBodyClasses: true,
      hyperextensible: true,
      resistance: 0.5,
      flickThreshold: 50,
      transitionSpeed: 0.3,
      easing: 'ease',
      maxPosition: 266,
      minPosition: -266,
      tapToClose: true,
      touchToDrag: true,
      slideIntent: 40,
      // degrees
      minDragDistance: 5
    },
      cache = {
        simpleStates: {
          opening: null,
          towards: null,
          hyperExtending: null,
          halfway: null,
          flick: null,
          translation: {
            absolute: 0,
            relative: 0,
            sinceDirectionChange: 0,
            percentage: 0
          }
        }
      },
      eventList = {},
      utils = {
        hasTouch: ('ontouchstart' in doc.documentElement || win.navigator.msPointerEnabled),
        eventType: function(action) {
          var eventTypes = {
            down: (utils.hasTouch ? 'touchstart' : 'mousedown'),
            move: (utils.hasTouch ? 'touchmove' : 'mousemove'),
            up: (utils.hasTouch ? 'touchend' : 'mouseup'),
            out: (utils.hasTouch ? 'touchcancel' : 'mouseout')
          };
          return eventTypes[action];
        },
        page: function(t, e) {
          return (utils.hasTouch && e.touches.length && e.touches[0]) ? e.touches[0]['page' + t] : e['page' + t];
        },
        klass: {
          has: function(el, name) {
            return (el.className).indexOf(name) !== -1;
          },
          add: function(el, name) {
            if (!utils.klass.has(el, name) && settings.addBodyClasses) {
              el.className += " " + name;
            }
          },
          remove: function(el, name) {
            if (settings.addBodyClasses) {
              el.className = (el.className).replace(name, "").replace(/^\s+|\s+$/g, '');
            }
          }
        },
        dispatchEvent: function(type) {
          if (typeof eventList[type] === 'function') {
            return eventList[type].call();
          }
        },
        vendor: function() {
          var tmp = doc.createElement("div"),
            prefixes = 'webkit Moz O ms'.split(' '),
            i;
          for (i in prefixes) {
            if (typeof tmp.style[prefixes[i] + 'Transition'] !== 'undefined') {
              return prefixes[i];
            }
          }
        },
        transitionCallback: function() {
          return (cache.vendor === 'Moz' || cache.vendor === 'ms') ? 'transitionend' : cache.vendor + 'TransitionEnd';
        },
        canTransform: function() {
          return typeof settings.element.style[cache.vendor + 'Transform'] !== 'undefined';
        },
        deepExtend: function(destination, source) {
          var property;
          for (property in source) {
            if (source[property] && source[property].constructor && source[property].constructor === Object) {
              destination[property] = destination[property] || {};
              utils.deepExtend(destination[property], source[property]);
            } else {
              destination[property] = source[property];
            }
          }
          return destination;
        },
        angleOfDrag: function(x, y) {
          var degrees, theta;
          // Calc Theta
          theta = Math.atan2(-(cache.startDragY - y), (cache.startDragX - x));
          if (theta < 0) {
            theta += 2 * Math.PI;
          }
          // Calc Degrees
          degrees = Math.floor(theta * (180 / Math.PI) - 180);
          if (degrees < 0 && degrees > -180) {
            degrees = 360 - Math.abs(degrees);
          }
          return Math.abs(degrees);
        },
        events: {
          addEvent: function addEvent(element, eventName, func) {
            if (element.addEventListener) {
              return element.addEventListener(eventName, func, false);
            } else if (element.attachEvent) {
              return element.attachEvent("on" + eventName, func);
            }
          },
          removeEvent: function addEvent(element, eventName, func) {
            if (element.addEventListener) {
              return element.removeEventListener(eventName, func, false);
            } else if (element.attachEvent) {
              return element.detachEvent("on" + eventName, func);
            }
          },
          prevent: function(e) {
            if (e.preventDefault) {
              e.preventDefault();
            } else {
              e.returnValue = false;
            }
          }
        },
        parentUntil: function(el, attr) {
          var isStr = typeof attr === 'string';
          while (el.parentNode) {
            if (isStr && el.getAttribute && el.getAttribute(attr)) {
              return el;
            } else if (!isStr && el === attr) {
              return el;
            }
            el = el.parentNode;
          }
          return null;
        }
      },
      action = {
        translate: {
          get: {
            matrix: function(index) {

              if (!utils.canTransform()) {
                return parseInt(settings.element.style.left, 10);
              } else {
                var matrix = win.getComputedStyle(settings.element)[cache.vendor + 'Transform'].match(/\((.*)\)/),
                  ieOffset = 8;
                if (matrix) {
                  matrix = matrix[1].split(',');
                  if (matrix.length === 16) {
                    index += ieOffset;
                  }
                  return parseInt(matrix[index], 10);
                }
                return 0;
              }
            }
          },
          easeCallback: function() {
            settings.element.style[cache.vendor + 'Transition'] = '';
            cache.translation = action.translate.get.matrix(4);
            cache.easing = false;
            clearInterval(cache.animatingInterval);

            if (cache.easingTo === 0) {
              utils.klass.remove(doc.body, 'snapjs-right');
              utils.klass.remove(doc.body, 'snapjs-left');
            }

            utils.dispatchEvent('animated');
            utils.events.removeEvent(settings.element, utils.transitionCallback(), action.translate.easeCallback);
          },
          easeTo: function(n) {

            if (!utils.canTransform()) {
              cache.translation = n;
              action.translate.x(n);
            } else {
              cache.easing = true;
              cache.easingTo = n;

              settings.element.style[cache.vendor + 'Transition'] = 'all ' + settings.transitionSpeed + 's ' + settings.easing;

              cache.animatingInterval = setInterval(function() {
                utils.dispatchEvent('animating');
              }, 1);

              utils.events.addEvent(settings.element, utils.transitionCallback(), action.translate.easeCallback);
              action.translate.x(n);
            }
            if (n === 0) {
              settings.element.style[cache.vendor + 'Transform'] = '';
            }
          },
          x: function(n) {
            if ((settings.disable === 'left' && n > 0) || (settings.disable === 'right' && n < 0)) {
              return;
            }

            if (!settings.hyperextensible) {
              if (n === settings.maxPosition || n > settings.maxPosition) {
                n = settings.maxPosition;
              } else if (n === settings.minPosition || n < settings.minPosition) {
                n = settings.minPosition;
              }
            }

            n = parseInt(n, 10);
            if (isNaN(n)) {
              n = 0;
            }

            if (utils.canTransform()) {
              var theTranslate = 'translate3d(' + n + 'px, 0,0)';
              settings.element.style[cache.vendor + 'Transform'] = theTranslate;
            } else {
              settings.element.style.width = (win.innerWidth || doc.documentElement.clientWidth) + 'px';

              settings.element.style.left = n + 'px';
              settings.element.style.right = '';
            }
          }
        },
        drag: {
          listen: function() {
            cache.translation = 0;
            cache.easing = false;
            utils.events.addEvent(settings.element, utils.eventType('down'), action.drag.startDrag);
            utils.events.addEvent(settings.element, utils.eventType('move'), action.drag.dragging);
            utils.events.addEvent(settings.element, utils.eventType('up'), action.drag.endDrag);
          },
          stopListening: function() {
            utils.events.removeEvent(settings.element, utils.eventType('down'), action.drag.startDrag);
            utils.events.removeEvent(settings.element, utils.eventType('move'), action.drag.dragging);
            utils.events.removeEvent(settings.element, utils.eventType('up'), action.drag.endDrag);
          },
          startDrag: function(e) {
            // No drag on ignored elements
            var target = e.target ? e.target : e.srcElement,
              ignoreParent = utils.parentUntil(target, 'data-snap-ignore');

            if (ignoreParent) {
              utils.dispatchEvent('ignore');
              return;
            }


            if (settings.dragger) {
              var dragParent = utils.parentUntil(target, settings.dragger);

              // Only use dragger if we're in a closed state
              if (!dragParent && (cache.translation !== settings.minPosition && cache.translation !== settings.maxPosition)) {
                return;
              }
            }

            utils.dispatchEvent('start');
            settings.element.style[cache.vendor + 'Transition'] = '';
            cache.isDragging = true;
            cache.hasIntent = null;
            cache.intentChecked = false;
            cache.startDragX = utils.page('X', e);
            cache.startDragY = utils.page('Y', e);
            cache.dragWatchers = {
              current: 0,
              last: 0,
              hold: 0,
              state: ''
            };
            cache.simpleStates = {
              opening: null,
              towards: null,
              hyperExtending: null,
              halfway: null,
              flick: null,
              translation: {
                absolute: 0,
                relative: 0,
                sinceDirectionChange: 0,
                percentage: 0
              }
            };
          },
          dragging: function(e) {
            if (cache.isDragging && settings.touchToDrag) {

              var thePageX = utils.page('X', e),
                thePageY = utils.page('Y', e),
                translated = cache.translation,
                absoluteTranslation = action.translate.get.matrix(4),
                whileDragX = thePageX - cache.startDragX,
                openingLeft = absoluteTranslation > 0,
                translateTo = whileDragX,
                diff;

              // Shown no intent already
              if ((cache.intentChecked && !cache.hasIntent)) {
                return;
              }

              if (settings.addBodyClasses) {
                if ((absoluteTranslation) > 0) {
                  utils.klass.add(doc.body, 'snapjs-left');
                  utils.klass.remove(doc.body, 'snapjs-right');
                } else if ((absoluteTranslation) < 0) {
                  utils.klass.add(doc.body, 'snapjs-right');
                  utils.klass.remove(doc.body, 'snapjs-left');
                }
              }

              if (cache.hasIntent === false || cache.hasIntent === null) {
                var deg = utils.angleOfDrag(thePageX, thePageY),
                  inRightRange = (deg >= 0 && deg <= settings.slideIntent) || (deg <= 360 && deg > (360 - settings.slideIntent)),
                  inLeftRange = (deg >= 180 && deg <= (180 + settings.slideIntent)) || (deg <= 180 && deg >= (180 - settings.slideIntent));
                if (!inLeftRange && !inRightRange) {
                  cache.hasIntent = false;
                } else {
                  cache.hasIntent = true;
                }
                cache.intentChecked = true;
              }

              if (
              (settings.minDragDistance >= Math.abs(thePageX - cache.startDragX)) || // Has user met minimum drag distance?
              (cache.hasIntent === false)) {
                return;
              }

              utils.events.prevent(e);
              utils.dispatchEvent('drag');

              cache.dragWatchers.current = thePageX;
              // Determine which direction we are going
              if (cache.dragWatchers.last > thePageX) {
                if (cache.dragWatchers.state !== 'left') {
                  cache.dragWatchers.state = 'left';
                  cache.dragWatchers.hold = thePageX;
                }
                cache.dragWatchers.last = thePageX;
              } else if (cache.dragWatchers.last < thePageX) {
                if (cache.dragWatchers.state !== 'right') {
                  cache.dragWatchers.state = 'right';
                  cache.dragWatchers.hold = thePageX;
                }
                cache.dragWatchers.last = thePageX;
              }
              if (openingLeft) {
                // Pulling too far to the right
                if (settings.maxPosition < absoluteTranslation) {
                  diff = (absoluteTranslation - settings.maxPosition) * settings.resistance;
                  translateTo = whileDragX - diff;
                }
                cache.simpleStates = {
                  opening: 'left',
                  towards: cache.dragWatchers.state,
                  hyperExtending: settings.maxPosition < absoluteTranslation,
                  halfway: absoluteTranslation > (settings.maxPosition / 2),
                  flick: Math.abs(cache.dragWatchers.current - cache.dragWatchers.hold) > settings.flickThreshold,
                  translation: {
                    absolute: absoluteTranslation,
                    relative: whileDragX,
                    sinceDirectionChange: (cache.dragWatchers.current - cache.dragWatchers.hold),
                    percentage: (absoluteTranslation / settings.maxPosition) * 100
                  }
                };
              } else {
                // Pulling too far to the left
                if (settings.minPosition > absoluteTranslation) {
                  diff = (absoluteTranslation - settings.minPosition) * settings.resistance;
                  translateTo = whileDragX - diff;
                }
                cache.simpleStates = {
                  opening: 'right',
                  towards: cache.dragWatchers.state,
                  hyperExtending: settings.minPosition > absoluteTranslation,
                  halfway: absoluteTranslation < (settings.minPosition / 2),
                  flick: Math.abs(cache.dragWatchers.current - cache.dragWatchers.hold) > settings.flickThreshold,
                  translation: {
                    absolute: absoluteTranslation,
                    relative: whileDragX,
                    sinceDirectionChange: (cache.dragWatchers.current - cache.dragWatchers.hold),
                    percentage: (absoluteTranslation / settings.minPosition) * 100
                  }
                };
              }
              action.translate.x(translateTo + translated);
            }
          },
          endDrag: function(e) {
            if (cache.isDragging) {
              utils.dispatchEvent('end');
              var translated = action.translate.get.matrix(4);

              // Tap Close
              if (cache.dragWatchers.current === 0 && translated !== 0 && settings.tapToClose) {
                utils.dispatchEvent('close');
                utils.events.prevent(e);
                action.translate.easeTo(0);
                cache.isDragging = false;
                cache.startDragX = 0;
                return;
              }

              // Revealing Left
              if (cache.simpleStates.opening === 'left') {
                // Halfway, Flicking, or Too Far Out
                if ((cache.simpleStates.halfway || cache.simpleStates.hyperExtending || cache.simpleStates.flick)) {
                  if (cache.simpleStates.flick && cache.simpleStates.towards === 'left') { // Flicking Closed
                    action.translate.easeTo(0);
                  } else if (
                  (cache.simpleStates.flick && cache.simpleStates.towards === 'right') || // Flicking Open OR
                  (cache.simpleStates.halfway || cache.simpleStates.hyperExtending) // At least halfway open OR hyperextending
                  ) {
                    action.translate.easeTo(settings.maxPosition); // Open Left
                  }
                } else {
                  action.translate.easeTo(0); // Close Left
                }
                // Revealing Right
              } else if (cache.simpleStates.opening === 'right') {
                // Halfway, Flicking, or Too Far Out
                if ((cache.simpleStates.halfway || cache.simpleStates.hyperExtending || cache.simpleStates.flick)) {
                  if (cache.simpleStates.flick && cache.simpleStates.towards === 'right') { // Flicking Closed
                    action.translate.easeTo(0);
                  } else if (
                  (cache.simpleStates.flick && cache.simpleStates.towards === 'left') || // Flicking Open OR
                  (cache.simpleStates.halfway || cache.simpleStates.hyperExtending) // At least halfway open OR hyperextending
                  ) {
                    action.translate.easeTo(settings.minPosition); // Open Right
                  }
                } else {
                  action.translate.easeTo(0); // Close Right
                }
              }
              cache.isDragging = false;
              cache.startDragX = utils.page('X', e);
            }
          }
        }
      },
      init = function(opts) {
        if (opts.element) {
          utils.deepExtend(settings, opts);
          cache.vendor = utils.vendor();
          action.drag.listen();
        }
      };
    /*
     * Public
     */
    this.open = function(side) {
      utils.dispatchEvent('open');
      utils.klass.remove(doc.body, 'snapjs-expand-left');
      utils.klass.remove(doc.body, 'snapjs-expand-right');

      if (side === 'left') {
        cache.simpleStates.opening = 'left';
        cache.simpleStates.towards = 'right';
        utils.klass.add(doc.body, 'snapjs-left');
        utils.klass.remove(doc.body, 'snapjs-right');
        action.translate.easeTo(settings.maxPosition);
      } else if (side === 'right') {
        cache.simpleStates.opening = 'right';
        cache.simpleStates.towards = 'left';
        utils.klass.remove(doc.body, 'snapjs-left');
        utils.klass.add(doc.body, 'snapjs-right');
        action.translate.easeTo(settings.minPosition);
      }
    };
    this.close = function() {
      utils.dispatchEvent('close');
      action.translate.easeTo(0);
    };
    this.expand = function(side) {
      var to = win.innerWidth || doc.documentElement.clientWidth;

      if (side === 'left') {
        utils.dispatchEvent('expandLeft');
        utils.klass.add(doc.body, 'snapjs-expand-left');
        utils.klass.remove(doc.body, 'snapjs-expand-right');
      } else {
        utils.dispatchEvent('expandRight');
        utils.klass.add(doc.body, 'snapjs-expand-right');
        utils.klass.remove(doc.body, 'snapjs-expand-left');
        to *= -1;
      }
      action.translate.easeTo(to);
    };

    this.on = function(evt, fn) {
      eventList[evt] = fn;
      return this;
    };
    this.off = function(evt) {
      if (eventList[evt]) {
        eventList[evt] = false;
      }
    };

    this.enable = function() {
      utils.dispatchEvent('enable');
      action.drag.listen();
    };
    this.disable = function() {
      utils.dispatchEvent('disable');
      action.drag.stopListening();
    };

    this.settings = function(opts) {
      utils.deepExtend(settings, opts);
    };

    this.state = function() {
      var state, fromLeft = action.translate.get.matrix(4);
      if (fromLeft === settings.maxPosition) {
        state = 'left';
      } else if (fromLeft === settings.minPosition) {
        state = 'right';
      } else {
        state = 'closed';
      }
      return {
        state: state,
        info: cache.simpleStates
      };
    };
    init(userOpts);
  };
  if (( true) && module.exports) {
    module.exports = Snap;
  }
  if (typeof ender === 'undefined') {
    this.Snap = Snap;
  }
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function() {
      return Snap;
    }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  }
}).call(this, window, document);


/***/ },

/***/ 692
(module) {

(function (global, factory) {
	 true ? module.exports = factory() :
	0;
}(this, (function () {
	var assignedElements = new Map();

	function assign(ta) {
	  if (!ta || !ta.nodeName || ta.nodeName !== 'TEXTAREA' || assignedElements.has(ta)) return;
	  var previousHeight = null;

	  function cacheScrollTops(el) {
	    var arr = [];

	    while (el && el.parentNode && el.parentNode instanceof Element) {
	      if (el.parentNode.scrollTop) {
	        arr.push([el.parentNode, el.parentNode.scrollTop]);
	      }

	      el = el.parentNode;
	    }

	    return function () {
	      return arr.forEach(function (_ref) {
	        var node = _ref[0],
	            scrollTop = _ref[1];
	        node.style.scrollBehavior = 'auto';
	        node.scrollTop = scrollTop;
	        node.style.scrollBehavior = null;
	      });
	    };
	  }

	  var computed = window.getComputedStyle(ta);

	  function setHeight(_ref2) {
	    var _ref2$restoreTextAlig = _ref2.restoreTextAlign,
	        restoreTextAlign = _ref2$restoreTextAlig === void 0 ? null : _ref2$restoreTextAlig,
	        _ref2$testForHeightRe = _ref2.testForHeightReduction,
	        testForHeightReduction = _ref2$testForHeightRe === void 0 ? true : _ref2$testForHeightRe;
	    var initialOverflowY = computed.overflowY;

	    if (ta.scrollHeight === 0) {
	      // If the scrollHeight is 0, then the element probably has display:none or is detached from the DOM.
	      return;
	    } // disallow vertical resizing


	    if (computed.resize === 'vertical') {
	      ta.style.resize = 'none';
	    } else if (computed.resize === 'both') {
	      ta.style.resize = 'horizontal';
	    }

	    var restoreScrollTops; // remove inline height style to accurately measure situations where the textarea should shrink
	    // however, skip this step if the new value appends to the previous value, as textarea height should only have grown

	    if (testForHeightReduction) {
	      // ensure the scrollTop values of parent elements are not modified as a consequence of shrinking the textarea height
	      restoreScrollTops = cacheScrollTops(ta);
	      ta.style.height = '';
	    }

	    var newHeight;

	    if (computed.boxSizing === 'content-box') {
	      newHeight = ta.scrollHeight - (parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom));
	    } else {
	      newHeight = ta.scrollHeight + parseFloat(computed.borderTopWidth) + parseFloat(computed.borderBottomWidth);
	    }

	    if (computed.maxHeight !== 'none' && newHeight > parseFloat(computed.maxHeight)) {
	      if (computed.overflowY === 'hidden') {
	        ta.style.overflow = 'scroll';
	      }

	      newHeight = parseFloat(computed.maxHeight);
	    } else if (computed.overflowY !== 'hidden') {
	      ta.style.overflow = 'hidden';
	    }

	    ta.style.height = newHeight + 'px';

	    if (restoreTextAlign) {
	      ta.style.textAlign = restoreTextAlign;
	    }

	    if (restoreScrollTops) {
	      restoreScrollTops();
	    }

	    if (previousHeight !== newHeight) {
	      ta.dispatchEvent(new Event('autosize:resized', {
	        bubbles: true
	      }));
	      previousHeight = newHeight;
	    }

	    if (initialOverflowY !== computed.overflow && !restoreTextAlign) {
	      var textAlign = computed.textAlign;

	      if (computed.overflow === 'hidden') {
	        // Webkit fails to reflow text after overflow is hidden,
	        // even if hiding overflow would allow text to fit more compactly.
	        // The following is intended to force the necessary text reflow.
	        ta.style.textAlign = textAlign === 'start' ? 'end' : 'start';
	      }

	      setHeight({
	        restoreTextAlign: textAlign,
	        testForHeightReduction: true
	      });
	    }
	  }

	  function fullSetHeight() {
	    setHeight({
	      testForHeightReduction: true,
	      restoreTextAlign: null
	    });
	  }

	  var handleInput = function () {
	    var previousValue = ta.value;
	    return function () {
	      setHeight({
	        // if previousValue is '', check for height shrinkage because the placeholder may be taking up space instead
	        // if new value is merely appending to previous value, skip checking for height deduction
	        testForHeightReduction: previousValue === '' || !ta.value.startsWith(previousValue),
	        restoreTextAlign: null
	      });
	      previousValue = ta.value;
	    };
	  }();

	  var destroy = function (style) {
	    ta.removeEventListener('autosize:destroy', destroy);
	    ta.removeEventListener('autosize:update', fullSetHeight);
	    ta.removeEventListener('input', handleInput);
	    window.removeEventListener('resize', fullSetHeight); // future todo: consider replacing with ResizeObserver

	    Object.keys(style).forEach(function (key) {
	      return ta.style[key] = style[key];
	    });
	    assignedElements["delete"](ta);
	  }.bind(ta, {
	    height: ta.style.height,
	    resize: ta.style.resize,
	    textAlign: ta.style.textAlign,
	    overflowY: ta.style.overflowY,
	    overflowX: ta.style.overflowX,
	    wordWrap: ta.style.wordWrap
	  });

	  ta.addEventListener('autosize:destroy', destroy);
	  ta.addEventListener('autosize:update', fullSetHeight);
	  ta.addEventListener('input', handleInput);
	  window.addEventListener('resize', fullSetHeight); // future todo: consider replacing with ResizeObserver

	  ta.style.overflowX = 'hidden';
	  ta.style.wordWrap = 'break-word';
	  assignedElements.set(ta, {
	    destroy: destroy,
	    update: fullSetHeight
	  });
	  fullSetHeight();
	}

	function destroy(ta) {
	  var methods = assignedElements.get(ta);

	  if (methods) {
	    methods.destroy();
	  }
	}

	function update(ta) {
	  var methods = assignedElements.get(ta);

	  if (methods) {
	    methods.update();
	  }
	}

	var autosize = null; // Do nothing in Node.js environment

	if (typeof window === 'undefined') {
	  autosize = function autosize(el) {
	    return el;
	  };

	  autosize.destroy = function (el) {
	    return el;
	  };

	  autosize.update = function (el) {
	    return el;
	  };
	} else {
	  autosize = function autosize(el, options) {
	    if (el) {
	      Array.prototype.forEach.call(el.length ? el : [el], function (x) {
	        return assign(x);
	      });
	    }

	    return el;
	  };

	  autosize.destroy = function (el) {
	    if (el) {
	      Array.prototype.forEach.call(el.length ? el : [el], destroy);
	    }

	    return el;
	  };

	  autosize.update = function (el) {
	    if (el) {
	      Array.prototype.forEach.call(el.length ? el : [el], update);
	    }

	    return el;
	  };
	}

	var autosize$1 = autosize;

	return autosize$1;

})));


/***/ },

/***/ 391
(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//     Backbone.js 1.6.1

//     (c) 2010-2024 Jeremy Ashkenas and DocumentCloud
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(factory) {

  // Establish the root object, `window` (`self`) in the browser, or `global` on the server.
  // We use `self` instead of `window` for `WebWorker` support.
  var root = typeof self == 'object' && self.self === self && self ||
            typeof __webpack_require__.g == 'object' && __webpack_require__.g.global === __webpack_require__.g && __webpack_require__.g;

  // Set up Backbone appropriately for the environment. Start with AMD.
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(523), __webpack_require__(486), exports], __WEBPACK_AMD_DEFINE_RESULT__ = (function(_, $, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      root.Backbone = factory(root, exports, _, $);
    }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else // removed by dead control flow
{ var _, $; }

})(function(root, Backbone, _, $) {

  // Initial Setup
  // -------------

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create a local reference to a common array method we'll want to use later.
  var slice = Array.prototype.slice;

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '1.6.1';

  // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
  // the `$` variable.
  Backbone.$ = $;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PATCH"`, `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... this will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // a custom event channel. You may bind a callback to an event with `on` or
  // remove with `off`; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {};

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // A private global variable to share between listeners and listenees.
  var _listening;

  // Iterates over the standard `event, callback` (as well as the fancy multiple
  // space-separated events `"change blur", callback` and jQuery-style event
  // maps `{event: callback}`).
  var eventsApi = function(iteratee, events, name, callback, opts) {
    var i = 0, names;
    if (name && typeof name === 'object') {
      // Handle event maps.
      if (callback !== void 0 && 'context' in opts && opts.context === void 0) opts.context = callback;
      for (names = _.keys(name); i < names.length ; i++) {
        events = eventsApi(iteratee, events, names[i], name[names[i]], opts);
      }
    } else if (name && eventSplitter.test(name)) {
      // Handle space-separated event names by delegating them individually.
      for (names = name.split(eventSplitter); i < names.length; i++) {
        events = iteratee(events, names[i], callback, opts);
      }
    } else {
      // Finally, standard events.
      events = iteratee(events, name, callback, opts);
    }
    return events;
  };

  // Bind an event to a `callback` function. Passing `"all"` will bind
  // the callback to all events fired.
  Events.on = function(name, callback, context) {
    this._events = eventsApi(onApi, this._events || {}, name, callback, {
      context: context,
      ctx: this,
      listening: _listening
    });

    if (_listening) {
      var listeners = this._listeners || (this._listeners = {});
      listeners[_listening.id] = _listening;
      // Allow the listening to use a counter, instead of tracking
      // callbacks for library interop
      _listening.interop = false;
    }

    return this;
  };

  // Inversion-of-control versions of `on`. Tell *this* object to listen to
  // an event in another object... keeping track of what it's listening to
  // for easier unbinding later.
  Events.listenTo = function(obj, name, callback) {
    if (!obj) return this;
    var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
    var listeningTo = this._listeningTo || (this._listeningTo = {});
    var listening = _listening = listeningTo[id];

    // This object is not listening to any other events on `obj` yet.
    // Setup the necessary references to track the listening callbacks.
    if (!listening) {
      this._listenId || (this._listenId = _.uniqueId('l'));
      listening = _listening = listeningTo[id] = new Listening(this, obj);
    }

    // Bind callbacks on obj.
    var error = tryCatchOn(obj, name, callback, this);
    _listening = void 0;

    if (error) throw error;
    // If the target obj is not Backbone.Events, track events manually.
    if (listening.interop) listening.on(name, callback);

    return this;
  };

  // The reducing API that adds a callback to the `events` object.
  var onApi = function(events, name, callback, options) {
    if (callback) {
      var handlers = events[name] || (events[name] = []);
      var context = options.context, ctx = options.ctx, listening = options.listening;
      if (listening) listening.count++;

      handlers.push({callback: callback, context: context, ctx: context || ctx, listening: listening});
    }
    return events;
  };

  // An try-catch guarded #on function, to prevent poisoning the global
  // `_listening` variable.
  var tryCatchOn = function(obj, name, callback, context) {
    try {
      obj.on(name, callback, context);
    } catch (e) {
      return e;
    }
  };

  // Remove one or many callbacks. If `context` is null, removes all
  // callbacks with that function. If `callback` is null, removes all
  // callbacks for the event. If `name` is null, removes all bound
  // callbacks for all events.
  Events.off = function(name, callback, context) {
    if (!this._events) return this;
    this._events = eventsApi(offApi, this._events, name, callback, {
      context: context,
      listeners: this._listeners
    });

    return this;
  };

  // Tell this object to stop listening to either specific events ... or
  // to every object it's currently listening to.
  Events.stopListening = function(obj, name, callback) {
    var listeningTo = this._listeningTo;
    if (!listeningTo) return this;

    var ids = obj ? [obj._listenId] : _.keys(listeningTo);
    for (var i = 0; i < ids.length; i++) {
      var listening = listeningTo[ids[i]];

      // If listening doesn't exist, this object is not currently
      // listening to obj. Break out early.
      if (!listening) break;

      listening.obj.off(name, callback, this);
      if (listening.interop) listening.off(name, callback);
    }
    if (_.isEmpty(listeningTo)) this._listeningTo = void 0;

    return this;
  };

  // The reducing API that removes a callback from the `events` object.
  var offApi = function(events, name, callback, options) {
    if (!events) return;

    var context = options.context, listeners = options.listeners;
    var i = 0, names;

    // Delete all event listeners and "drop" events.
    if (!name && !context && !callback) {
      for (names = _.keys(listeners); i < names.length; i++) {
        listeners[names[i]].cleanup();
      }
      return;
    }

    names = name ? [name] : _.keys(events);
    for (; i < names.length; i++) {
      name = names[i];
      var handlers = events[name];

      // Bail out if there are no events stored.
      if (!handlers) break;

      // Find any remaining events.
      var remaining = [];
      for (var j = 0; j < handlers.length; j++) {
        var handler = handlers[j];
        if (
          callback && callback !== handler.callback &&
            callback !== handler.callback._callback ||
              context && context !== handler.context
        ) {
          remaining.push(handler);
        } else {
          var listening = handler.listening;
          if (listening) listening.off(name, callback);
        }
      }

      // Replace events if there are any remaining.  Otherwise, clean up.
      if (remaining.length) {
        events[name] = remaining;
      } else {
        delete events[name];
      }
    }

    return events;
  };

  // Bind an event to only be triggered a single time. After the first time
  // the callback is invoked, its listener will be removed. If multiple events
  // are passed in using the space-separated syntax, the handler will fire
  // once for each event, not once for a combination of all events.
  Events.once = function(name, callback, context) {
    // Map the event into a `{event: once}` object.
    var events = eventsApi(onceMap, {}, name, callback, this.off.bind(this));
    if (typeof name === 'string' && context == null) callback = void 0;
    return this.on(events, callback, context);
  };

  // Inversion-of-control versions of `once`.
  Events.listenToOnce = function(obj, name, callback) {
    // Map the event into a `{event: once}` object.
    var events = eventsApi(onceMap, {}, name, callback, this.stopListening.bind(this, obj));
    return this.listenTo(obj, events);
  };

  // Reduces the event callbacks into a map of `{event: onceWrapper}`.
  // `offer` unbinds the `onceWrapper` after it has been called.
  var onceMap = function(map, name, callback, offer) {
    if (callback) {
      var once = map[name] = _.once(function() {
        offer(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
    }
    return map;
  };

  // Trigger one or many events, firing all bound callbacks. Callbacks are
  // passed the same arguments as `trigger` is, apart from the event name
  // (unless you're listening on `"all"`, which will cause your callback to
  // receive the true name of the event as the first argument).
  Events.trigger = function(name) {
    if (!this._events) return this;

    var length = Math.max(0, arguments.length - 1);
    var args = Array(length);
    for (var i = 0; i < length; i++) args[i] = arguments[i + 1];

    eventsApi(triggerApi, this._events, name, void 0, args);
    return this;
  };

  // Handles triggering the appropriate event callbacks.
  var triggerApi = function(objEvents, name, callback, args) {
    if (objEvents) {
      var events = objEvents[name];
      var allEvents = objEvents.all;
      if (events && allEvents) allEvents = allEvents.slice();
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, [name].concat(args));
    }
    return objEvents;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
    }
  };

  // A listening class that tracks and cleans up memory bindings
  // when all callbacks have been offed.
  var Listening = function(listener, obj) {
    this.id = listener._listenId;
    this.listener = listener;
    this.obj = obj;
    this.interop = true;
    this.count = 0;
    this._events = void 0;
  };

  Listening.prototype.on = Events.on;

  // Offs a callback (or several).
  // Uses an optimized counter if the listenee uses Backbone.Events.
  // Otherwise, falls back to manual tracking to support events
  // library interop.
  Listening.prototype.off = function(name, callback) {
    var cleanup;
    if (this.interop) {
      this._events = eventsApi(offApi, this._events, name, callback, {
        context: void 0,
        listeners: void 0
      });
      cleanup = !this._events;
    } else {
      this.count--;
      cleanup = this.count === 0;
    }
    if (cleanup) this.cleanup();
  };

  // Cleans up memory bindings between the listener and the listenee.
  Listening.prototype.cleanup = function() {
    delete this.listener._listeningTo[this.obj._listenId];
    if (!this.interop) delete this.obj._listeners[this.id];
  };

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Allow the `Backbone` object to serve as a global event bus, for folks who
  // want global "pubsub" in a convenient place.
  _.extend(Backbone, Events);

  // Backbone.Model
  // --------------

  // Backbone **Models** are the basic data object in the framework --
  // frequently representing a row in a table in a database on your server.
  // A discrete chunk of data and a bunch of useful, related methods for
  // performing computations and transformations on that data.

  // Create a new model with the specified attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var attrs = attributes || {};
    options || (options = {});
    this.preinitialize.apply(this, arguments);
    this.cid = _.uniqueId(this.cidPrefix);
    this.attributes = {};
    if (options.collection) this.collection = options.collection;
    if (options.parse) attrs = this.parse(attrs, options) || {};
    var defaults = _.result(this, 'defaults');

    // Just _.defaults would work fine, but the additional _.extends
    // is in there for historical reasons. See #3843.
    attrs = _.defaults(_.extend({}, defaults, attrs), defaults);

    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // The value returned during the last failed validation.
    validationError: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // The prefix is used to create the client id which is used to identify models locally.
    // You may want to override this if you're experiencing name clashes with model ids.
    cidPrefix: 'c',

    // preinitialize is an empty function by default. You can override it with a function
    // or object.  preinitialize will run before any instantiation logic is run in the Model.
    preinitialize: function(){},

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Proxy `Backbone.sync` by default -- but override this if you need
    // custom syncing semantics for *this* particular model.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      return _.escape(this.get(attr));
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Special-cased proxy to underscore's `_.matches` method.
    matches: function(attrs) {
      return !!_.iteratee(attrs, this)(this.attributes);
    },

    // Set a hash of model attributes on the object, firing `"change"`. This is
    // the core primitive operation of a model, updating the data and notifying
    // anyone who needs to know about the change in state. The heart of the beast.
    set: function(key, val, options) {
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      var attrs;
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options || (options = {});

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Extract attributes and options.
      var unset      = options.unset;
      var silent     = options.silent;
      var changes    = [];
      var changing   = this._changing;
      this._changing = true;

      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }

      var current = this.attributes;
      var changed = this.changed;
      var prev    = this._previousAttributes;

      // For each `set` attribute, update or delete the current value.
      for (var attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(current[attr], val)) changes.push(attr);
        if (!_.isEqual(prev[attr], val)) {
          changed[attr] = val;
        } else {
          delete changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }

      // Update the `id`.
      if (this.idAttribute in attrs) {
        var prevId = this.id;
        this.id = this.get(this.idAttribute);
        if (this.id !== prevId) {
          this.trigger('changeId', this, prevId, options);
        }
      }

      // Trigger all relevant attribute changes.
      if (!silent) {
        if (changes.length) this._pending = options;
        for (var i = 0; i < changes.length; i++) {
          this.trigger('change:' + changes[i], this, current[changes[i]], options);
        }
      }

      // You might be wondering why there's a `while` loop here. Changes can
      // be recursively nested within `"change"` events.
      if (changing) return this;
      if (!silent) {
        while (this._pending) {
          options = this._pending;
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;
      return this;
    },

    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
    // if the attribute doesn't exist.
    unset: function(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
    },

    // Clear all attributes on the model, firing `"change"`.
    clear: function(options) {
      var attrs = {};
      for (var key in this.attributes) attrs[key] = void 0;
      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (attr == null) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var old = this._changing ? this._previousAttributes : this.attributes;
      var changed = {};
      var hasChanged;
      for (var attr in diff) {
        var val = diff[attr];
        if (_.isEqual(old[attr], val)) continue;
        changed[attr] = val;
        hasChanged = true;
      }
      return hasChanged ? changed : false;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (attr == null || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Fetch the model from the server, merging the response with the model's
    // local attributes. Any changed attributes will trigger a "change" event.
    fetch: function(options) {
      options = _.extend({parse: true}, options);
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        var serverAttrs = options.parse ? model.parse(resp, options) : resp;
        if (!model.set(serverAttrs, options)) return false;
        if (success) success.call(options.context, model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, val, options) {
      // Handle both `"key", value` and `{key: value}` -style arguments.
      var attrs;
      if (key == null || typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options = _.extend({validate: true, parse: true}, options);
      var wait = options.wait;

      // If we're not waiting and attributes exist, save acts as
      // `set(attr).save(null, opts)` with validation. Otherwise, check if
      // the model will be valid when the attributes, if any, are set.
      if (attrs && !wait) {
        if (!this.set(attrs, options)) return false;
      } else if (!this._validate(attrs, options)) {
        return false;
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      var model = this;
      var success = options.success;
      var attributes = this.attributes;
      options.success = function(resp) {
        // Ensure attributes are restored during synchronous saves.
        model.attributes = attributes;
        var serverAttrs = options.parse ? model.parse(resp, options) : resp;
        if (wait) serverAttrs = _.extend({}, attrs, serverAttrs);
        if (serverAttrs && !model.set(serverAttrs, options)) return false;
        if (success) success.call(options.context, model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);

      // Set temporary attributes if `{wait: true}` to properly find new ids.
      if (attrs && wait) this.attributes = _.extend({}, attributes, attrs);

      var method = this.isNew() ? 'create' : options.patch ? 'patch' : 'update';
      if (method === 'patch' && !options.attrs) options.attrs = attrs;
      var xhr = this.sync(method, this, options);

      // Restore attributes.
      this.attributes = attributes;

      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;
      var wait = options.wait;

      var destroy = function() {
        model.stopListening();
        model.trigger('destroy', model, model.collection, options);
      };

      options.success = function(resp) {
        if (wait) destroy();
        if (success) success.call(options.context, model, resp, options);
        if (!model.isNew()) model.trigger('sync', model, resp, options);
      };

      var xhr = false;
      if (this.isNew()) {
        _.defer(options.success);
      } else {
        wrapError(this, options);
        xhr = this.sync('delete', this, options);
      }
      if (!wait) destroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base =
        _.result(this, 'urlRoot') ||
        _.result(this.collection, 'url') ||
        urlError();
      if (this.isNew()) return base;
      var id = this.get(this.idAttribute);
      return base.replace(/[^\/]$/, '$&/') + encodeURIComponent(id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return !this.has(this.idAttribute);
    },

    // Check if the model is currently in a valid state.
    isValid: function(options) {
      return this._validate({}, _.extend({}, options, {validate: true}));
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    _validate: function(attrs, options) {
      if (!options.validate || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, options) || null;
      if (!error) return true;
      this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
      return false;
    }

  });

  // Backbone.Collection
  // -------------------

  // If models tend to represent a single row of data, a Backbone Collection is
  // more analogous to a table full of data ... or a small slice or page of that
  // table, or a collection of rows that belong together for a particular reason
  // -- all of the messages in this particular folder, all of the documents
  // belonging to this particular author, and so on. Collections maintain
  // indexes of their models, both in order, and for lookup by `id`.

  // Create a new **Collection**, perhaps to contain a specific type of `model`.
  // If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    this.preinitialize.apply(this, arguments);
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));
  };

  // Default options for `Collection#set`.
  var setOptions = {add: true, remove: true, merge: true};
  var addOptions = {add: true, remove: false};

  // Splices `insert` into `array` at index `at`.
  var splice = function(array, insert, at) {
    at = Math.min(Math.max(at, 0), array.length);
    var tail = Array(array.length - at);
    var length = insert.length;
    var i;
    for (i = 0; i < tail.length; i++) tail[i] = array[i + at];
    for (i = 0; i < length; i++) array[i + at] = insert[i];
    for (i = 0; i < tail.length; i++) array[i + length + at] = tail[i];
  };

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,


    // preinitialize is an empty function by default. You can override it with a function
    // or object.  preinitialize will run before any instantiation logic is run in the Collection.
    preinitialize: function(){},

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model) { return model.toJSON(options); });
    },

    // Proxy `Backbone.sync` by default.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Add a model, or list of models to the set. `models` may be Backbone
    // Models or raw JavaScript objects to be converted to Models, or any
    // combination of the two.
    add: function(models, options) {
      return this.set(models, _.extend({merge: false}, options, addOptions));
    },

    // Remove a model, or a list of models from the set.
    remove: function(models, options) {
      options = _.extend({}, options);
      var singular = !_.isArray(models);
      models = singular ? [models] : models.slice();
      var removed = this._removeModels(models, options);
      if (!options.silent && removed.length) {
        options.changes = {added: [], merged: [], removed: removed};
        this.trigger('update', this, options);
      }
      return singular ? removed[0] : removed;
    },

    // Update a collection by `set`-ing a new list of models, adding new ones,
    // removing models that are no longer present, and merging models that
    // already exist in the collection, as necessary. Similar to **Model#set**,
    // the core operation for updating the data contained by the collection.
    set: function(models, options) {
      if (models == null) return;

      options = _.extend({}, setOptions, options);
      if (options.parse && !this._isModel(models)) {
        models = this.parse(models, options) || [];
      }

      var singular = !_.isArray(models);
      models = singular ? [models] : models.slice();

      var at = options.at;
      if (at != null) at = +at;
      if (at > this.length) at = this.length;
      if (at < 0) at += this.length + 1;

      var set = [];
      var toAdd = [];
      var toMerge = [];
      var toRemove = [];
      var modelMap = {};

      var add = options.add;
      var merge = options.merge;
      var remove = options.remove;

      var sort = false;
      var sortable = this.comparator && at == null && options.sort !== false;
      var sortAttr = _.isString(this.comparator) ? this.comparator : null;

      // Turn bare objects into model references, and prevent invalid models
      // from being added.
      var model, i;
      for (i = 0; i < models.length; i++) {
        model = models[i];

        // If a duplicate is found, prevent it from being added and
        // optionally merge it into the existing model.
        var existing = this.get(model);
        if (existing) {
          if (merge && model !== existing) {
            var attrs = this._isModel(model) ? model.attributes : model;
            if (options.parse) attrs = existing.parse(attrs, options);
            existing.set(attrs, options);
            toMerge.push(existing);
            if (sortable && !sort) sort = existing.hasChanged(sortAttr);
          }
          if (!modelMap[existing.cid]) {
            modelMap[existing.cid] = true;
            set.push(existing);
          }
          models[i] = existing;

        // If this is a new, valid model, push it to the `toAdd` list.
        } else if (add) {
          model = models[i] = this._prepareModel(model, options);
          if (model) {
            toAdd.push(model);
            this._addReference(model, options);
            modelMap[model.cid] = true;
            set.push(model);
          }
        }
      }

      // Remove stale models.
      if (remove) {
        for (i = 0; i < this.length; i++) {
          model = this.models[i];
          if (!modelMap[model.cid]) toRemove.push(model);
        }
        if (toRemove.length) this._removeModels(toRemove, options);
      }

      // See if sorting is needed, update `length` and splice in new models.
      var orderChanged = false;
      var replace = !sortable && add && remove;
      if (set.length && replace) {
        orderChanged = this.length !== set.length || _.some(this.models, function(m, index) {
          return m !== set[index];
        });
        this.models.length = 0;
        splice(this.models, set, 0);
        this.length = this.models.length;
      } else if (toAdd.length) {
        if (sortable) sort = true;
        splice(this.models, toAdd, at == null ? this.length : at);
        this.length = this.models.length;
      }

      // Silently sort the collection if appropriate.
      if (sort) this.sort({silent: true});

      // Unless silenced, it's time to fire all appropriate add/sort/update events.
      if (!options.silent) {
        for (i = 0; i < toAdd.length; i++) {
          if (at != null) options.index = at + i;
          model = toAdd[i];
          model.trigger('add', model, this, options);
        }
        if (sort || orderChanged) this.trigger('sort', this, options);
        if (toAdd.length || toRemove.length || toMerge.length) {
          options.changes = {
            added: toAdd,
            removed: toRemove,
            merged: toMerge
          };
          this.trigger('update', this, options);
        }
      }

      // Return the added (or merged) model (or models).
      return singular ? models[0] : models;
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any granular `add` or `remove` events. Fires `reset` when finished.
    // Useful for bulk operations and optimizations.
    reset: function(models, options) {
      options = options ? _.clone(options) : {};
      for (var i = 0; i < this.models.length; i++) {
        this._removeReference(this.models[i], options);
      }
      options.previousModels = this.models;
      this._reset();
      models = this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return models;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      return this.add(model, _.extend({at: this.length}, options));
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      return this.remove(model, options);
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      return this.add(model, _.extend({at: 0}, options));
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      return this.remove(model, options);
    },

    // Slice out a sub-array of models from the collection.
    slice: function() {
      return slice.apply(this.models, arguments);
    },

    // Get a model from the set by id, cid, model object with id or cid
    // properties, or an attributes object that is transformed through modelId.
    get: function(obj) {
      if (obj == null) return void 0;
      return this._byId[obj] ||
        this._byId[this.modelId(this._isModel(obj) ? obj.attributes : obj, obj.idAttribute)] ||
        obj.cid && this._byId[obj.cid];
    },

    // Returns `true` if the model is in the collection.
    has: function(obj) {
      return this.get(obj) != null;
    },

    // Get the model at the given index.
    at: function(index) {
      if (index < 0) index += this.length;
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of
    // `filter`.
    where: function(attrs, first) {
      return this[first ? 'find' : 'filter'](attrs);
    },

    // Return the first model with matching attributes. Useful for simple cases
    // of `find`.
    findWhere: function(attrs) {
      return this.where(attrs, true);
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      var comparator = this.comparator;
      if (!comparator) throw new Error('Cannot sort a set without a comparator');
      options || (options = {});

      var length = comparator.length;
      if (_.isFunction(comparator)) comparator = comparator.bind(this);

      // Run sort based on type of `comparator`.
      if (length === 1 || _.isString(comparator)) {
        this.models = this.sortBy(comparator);
      } else {
        this.models.sort(comparator);
      }
      if (!options.silent) this.trigger('sort', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return this.map(attr + '');
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
    fetch: function(options) {
      options = _.extend({parse: true}, options);
      var success = options.success;
      var collection = this;
      options.success = function(resp) {
        var method = options.reset ? 'reset' : 'set';
        collection[method](resp, options);
        if (success) success.call(options.context, collection, resp, options);
        collection.trigger('sync', collection, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      options = options ? _.clone(options) : {};
      var wait = options.wait;
      model = this._prepareModel(model, options);
      if (!model) return false;
      if (!wait) this.add(model, options);
      var collection = this;
      var success = options.success;
      options.success = function(m, resp, callbackOpts) {
        if (wait) {
          m.off('error', collection._forwardPristineError, collection);
          collection.add(m, callbackOpts);
        }
        if (success) success.call(callbackOpts.context, m, resp, callbackOpts);
      };
      // In case of wait:true, our collection is not listening to any
      // of the model's events yet, so it will not forward the error
      // event. In this special case, we need to listen for it
      // separately and handle the event just once.
      // (The reason we don't need to do this for the sync event is
      // in the success handler above: we add the model first, which
      // causes the collection to listen, and then invoke the callback
      // that triggers the event.)
      if (wait) {
        model.once('error', this._forwardPristineError, this);
      }
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new collection with an identical list of models as this one.
    clone: function() {
      return new this.constructor(this.models, {
        model: this.model,
        comparator: this.comparator
      });
    },

    // Define how to uniquely identify models in the collection.
    modelId: function(attrs, idAttribute) {
      return attrs[idAttribute || this.model.prototype.idAttribute || 'id'];
    },

    // Get an iterator of all models in this collection.
    values: function() {
      return new CollectionIterator(this, ITERATOR_VALUES);
    },

    // Get an iterator of all model IDs in this collection.
    keys: function() {
      return new CollectionIterator(this, ITERATOR_KEYS);
    },

    // Get an iterator of all [ID, model] tuples in this collection.
    entries: function() {
      return new CollectionIterator(this, ITERATOR_KEYSVALUES);
    },

    // Private method to reset all internal state. Called when the collection
    // is first initialized or reset.
    _reset: function() {
      this.length = 0;
      this.models = [];
      this._byId  = {};
    },

    // Prepare a hash of attributes (or other model) to be added to this
    // collection.
    _prepareModel: function(attrs, options) {
      if (this._isModel(attrs)) {
        if (!attrs.collection) attrs.collection = this;
        return attrs;
      }
      options = options ? _.clone(options) : {};
      options.collection = this;

      var model;
      if (this.model.prototype) {
        model = new this.model(attrs, options);
      } else {
        // ES class methods didn't have prototype
        model = this.model(attrs, options);
      }

      if (!model.validationError) return model;
      this.trigger('invalid', this, model.validationError, options);
      return false;
    },

    // Internal method called by both remove and set.
    _removeModels: function(models, options) {
      var removed = [];
      for (var i = 0; i < models.length; i++) {
        var model = this.get(models[i]);
        if (!model) continue;

        var index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;

        // Remove references before triggering 'remove' event to prevent an
        // infinite loop. #3693
        delete this._byId[model.cid];
        var id = this.modelId(model.attributes, model.idAttribute);
        if (id != null) delete this._byId[id];

        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }

        removed.push(model);
        this._removeReference(model, options);
      }
      if (models.length > 0 && !options.silent) delete options.index;
      return removed;
    },

    // Method for checking whether an object should be considered a model for
    // the purposes of adding to the collection.
    _isModel: function(model) {
      return model instanceof Model;
    },

    // Internal method to create a model's ties to a collection.
    _addReference: function(model, options) {
      this._byId[model.cid] = model;
      var id = this.modelId(model.attributes, model.idAttribute);
      if (id != null) this._byId[id] = model;
      model.on('all', this._onModelEvent, this);
    },

    // Internal method to sever a model's ties to a collection.
    _removeReference: function(model, options) {
      delete this._byId[model.cid];
      var id = this.modelId(model.attributes, model.idAttribute);
      if (id != null) delete this._byId[id];
      if (this === model.collection) delete model.collection;
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if (model) {
        if ((event === 'add' || event === 'remove') && collection !== this) return;
        if (event === 'destroy') this.remove(model, options);
        if (event === 'changeId') {
          var prevId = this.modelId(model.previousAttributes(), model.idAttribute);
          var id = this.modelId(model.attributes, model.idAttribute);
          if (prevId != null) delete this._byId[prevId];
          if (id != null) this._byId[id] = model;
        }
      }
      this.trigger.apply(this, arguments);
    },

    // Internal callback method used in `create`. It serves as a
    // stand-in for the `_onModelEvent` method, which is not yet bound
    // during the `wait` period of the `create` call. We still want to
    // forward any `'error'` event at the end of the `wait` period,
    // hence a customized callback.
    _forwardPristineError: function(model, collection, options) {
      // Prevent double forward if the model was already in the
      // collection before the call to `create`.
      if (this.has(model)) return;
      this._onModelEvent('error', model, collection, options);
    }
  });

  // Defining an @@iterator method implements JavaScript's Iterable protocol.
  // In modern ES2015 browsers, this value is found at Symbol.iterator.
  /* global Symbol */
  var $$iterator = typeof Symbol === 'function' && Symbol.iterator;
  if ($$iterator) {
    Collection.prototype[$$iterator] = Collection.prototype.values;
  }

  // CollectionIterator
  // ------------------

  // A CollectionIterator implements JavaScript's Iterator protocol, allowing the
  // use of `for of` loops in modern browsers and interoperation between
  // Backbone.Collection and other JavaScript functions and third-party libraries
  // which can operate on Iterables.
  var CollectionIterator = function(collection, kind) {
    this._collection = collection;
    this._kind = kind;
    this._index = 0;
  };

  // This "enum" defines the three possible kinds of values which can be emitted
  // by a CollectionIterator that correspond to the values(), keys() and entries()
  // methods on Collection, respectively.
  var ITERATOR_VALUES = 1;
  var ITERATOR_KEYS = 2;
  var ITERATOR_KEYSVALUES = 3;

  // All Iterators should themselves be Iterable.
  if ($$iterator) {
    CollectionIterator.prototype[$$iterator] = function() {
      return this;
    };
  }

  CollectionIterator.prototype.next = function() {
    if (this._collection) {

      // Only continue iterating if the iterated collection is long enough.
      if (this._index < this._collection.length) {
        var model = this._collection.at(this._index);
        this._index++;

        // Construct a value depending on what kind of values should be iterated.
        var value;
        if (this._kind === ITERATOR_VALUES) {
          value = model;
        } else {
          var id = this._collection.modelId(model.attributes, model.idAttribute);
          if (this._kind === ITERATOR_KEYS) {
            value = id;
          } else { // ITERATOR_KEYSVALUES
            value = [id, model];
          }
        }
        return {value: value, done: false};
      }

      // Once exhausted, remove the reference to the collection so future
      // calls to the next method always return done.
      this._collection = void 0;
    }

    return {value: void 0, done: true};
  };

  // Backbone.View
  // -------------

  // Backbone Views are almost more convention than they are actual code. A View
  // is simply a JavaScript object that represents a logical chunk of UI in the
  // DOM. This might be a single item, an entire list, a sidebar or panel, or
  // even the surrounding frame which wraps your whole app. Defining a chunk of
  // UI as a **View** allows you to define your DOM events declaratively, without
  // having to worry about render order ... and makes it easy for the view to
  // react to specific changes in the state of your models.

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    this.preinitialize.apply(this, arguments);
    _.extend(this, _.pick(options, viewOptions));
    this._ensureElement();
    this.initialize.apply(this, arguments);
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be set as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be preferred to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // preinitialize is an empty function by default. You can override it with a function
    // or object.  preinitialize will run before any instantiation logic is run in the View
    preinitialize: function(){},

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function() {
      this._removeElement();
      this.stopListening();
      return this;
    },

    // Remove this view's element from the document and all event listeners
    // attached to it. Exposed for subclasses using an alternative DOM
    // manipulation API.
    _removeElement: function() {
      this.$el.remove();
    },

    // Change the view's element (`this.el` property) and re-delegate the
    // view's events on the new element.
    setElement: function(element) {
      this.undelegateEvents();
      this._setElement(element);
      this.delegateEvents();
      return this;
    },

    // Creates the `this.el` and `this.$el` references for this view using the
    // given `el`. `el` can be a CSS selector or an HTML string, a jQuery
    // context or an element. Subclasses can override this to utilize an
    // alternative DOM manipulation API and are only required to set the
    // `this.el` property.
    _setElement: function(el) {
      this.$el = el instanceof Backbone.$ ? el : Backbone.$(el);
      this.el = this.$el[0];
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save',
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    delegateEvents: function(events) {
      events || (events = _.result(this, 'events'));
      if (!events) return this;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[method];
        if (!method) continue;
        var match = key.match(delegateEventSplitter);
        this.delegate(match[1], match[2], method.bind(this));
      }
      return this;
    },

    // Add a single event listener to the view's element (or a child element
    // using `selector`). This only works for delegate-able events: not `focus`,
    // `blur`, and not `change`, `submit`, and `reset` in Internet Explorer.
    delegate: function(eventName, selector, listener) {
      this.$el.on(eventName + '.delegateEvents' + this.cid, selector, listener);
      return this;
    },

    // Clears all callbacks previously bound to the view by `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      if (this.$el) this.$el.off('.delegateEvents' + this.cid);
      return this;
    },

    // A finer-grained `undelegateEvents` for removing a single delegated event.
    // `selector` and `listener` are both optional.
    undelegate: function(eventName, selector, listener) {
      this.$el.off(eventName + '.delegateEvents' + this.cid, selector, listener);
      return this;
    },

    // Produces a DOM element to be assigned to your view. Exposed for
    // subclasses using an alternative DOM manipulation API.
    _createElement: function(tagName) {
      return document.createElement(tagName);
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = _.extend({}, _.result(this, 'attributes'));
        if (this.id) attrs.id = _.result(this, 'id');
        if (this.className) attrs['class'] = _.result(this, 'className');
        this.setElement(this._createElement(_.result(this, 'tagName')));
        this._setAttributes(attrs);
      } else {
        this.setElement(_.result(this, 'el'));
      }
    },

    // Set attributes from a hash on this view's element.  Exposed for
    // subclasses using an alternative DOM manipulation API.
    _setAttributes: function(attributes) {
      this.$el.attr(attributes);
    }

  });

  // Proxy Backbone class methods to Underscore functions, wrapping the model's
  // `attributes` object or collection's `models` array behind the scenes.
  //
  // collection.filter(function(model) { return model.get('age') > 10 });
  // collection.each(this.addView);
  //
  // `Function#apply` can be slow so we use the method's arg count, if we know it.
  var addMethod = function(base, length, method, attribute) {
    switch (length) {
      case 1: return function() {
        return base[method](this[attribute]);
      };
      case 2: return function(value) {
        return base[method](this[attribute], value);
      };
      case 3: return function(iteratee, context) {
        return base[method](this[attribute], cb(iteratee, this), context);
      };
      case 4: return function(iteratee, defaultVal, context) {
        return base[method](this[attribute], cb(iteratee, this), defaultVal, context);
      };
      default: return function() {
        var args = slice.call(arguments);
        args.unshift(this[attribute]);
        return base[method].apply(base, args);
      };
    }
  };

  var addUnderscoreMethods = function(Class, base, methods, attribute) {
    _.each(methods, function(length, method) {
      if (base[method]) Class.prototype[method] = addMethod(base, length, method, attribute);
    });
  };

  // Support `collection.sortBy('attr')` and `collection.findWhere({id: 1})`.
  var cb = function(iteratee, instance) {
    if (_.isFunction(iteratee)) return iteratee;
    if (_.isObject(iteratee) && !instance._isModel(iteratee)) return modelMatcher(iteratee);
    if (_.isString(iteratee)) return function(model) { return model.get(iteratee); };
    return iteratee;
  };
  var modelMatcher = function(attrs) {
    var matcher = _.matches(attrs);
    return function(model) {
      return matcher(model.attributes);
    };
  };

  // Underscore methods that we want to implement on the Collection.
  // 90% of the core usefulness of Backbone Collections is actually implemented
  // right here:
  var collectionMethods = {forEach: 3, each: 3, map: 3, collect: 3, reduce: 0,
    foldl: 0, inject: 0, reduceRight: 0, foldr: 0, find: 3, detect: 3, filter: 3,
    select: 3, reject: 3, every: 3, all: 3, some: 3, any: 3, include: 3, includes: 3,
    contains: 3, invoke: 0, max: 3, min: 3, toArray: 1, size: 1, first: 3,
    head: 3, take: 3, initial: 3, rest: 3, tail: 3, drop: 3, last: 3,
    without: 0, difference: 0, indexOf: 3, shuffle: 1, lastIndexOf: 3,
    isEmpty: 1, chain: 1, sample: 3, partition: 3, groupBy: 3, countBy: 3,
    sortBy: 3, indexBy: 3, findIndex: 3, findLastIndex: 3};


  // Underscore methods that we want to implement on the Model, mapped to the
  // number of arguments they take.
  var modelMethods = {keys: 1, values: 1, pairs: 1, invert: 1, pick: 0,
    omit: 0, chain: 1, isEmpty: 1};

  // Mix in each Underscore method as a proxy to `Collection#models`.

  _.each([
    [Collection, collectionMethods, 'models'],
    [Model, modelMethods, 'attributes']
  ], function(config) {
    var Base = config[0],
        methods = config[1],
        attribute = config[2];

    Base.mixin = function(obj) {
      var mappings = _.reduce(_.functions(obj), function(memo, name) {
        memo[name] = 0;
        return memo;
      }, {});
      addUnderscoreMethods(Base, obj, mappings, attribute);
    };

    addUnderscoreMethods(Base, _, methods, attribute);
  });

  // Backbone.sync
  // -------------

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    _.defaults(options || (options = {}), {
      emulateHTTP: Backbone.emulateHTTP,
      emulateJSON: Backbone.emulateJSON
    });

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = _.result(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || model.toJSON(options));
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }

    // Pass along `textStatus` and `errorThrown` from jQuery.
    var error = options.error;
    options.error = function(xhr, textStatus, errorThrown) {
      options.textStatus = textStatus;
      options.errorThrown = errorThrown;
      if (error) error.call(options.context, xhr, textStatus, errorThrown);
    };

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
    model.trigger('request', model, xhr, options);
    return xhr;
  };

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch': 'PATCH',
    'delete': 'DELETE',
    'read': 'GET'
  };

  // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
  // Override this if you'd like to use a different library.
  Backbone.ajax = function() {
    return Backbone.$.ajax.apply(Backbone.$, arguments);
  };

  // Backbone.Router
  // ---------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    this.preinitialize.apply(this, arguments);
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // preinitialize is an empty function by default. You can override it with a function
    // or object.  preinitialize will run before any instantiation logic is run in the Router.
    preinitialize: function(){},

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (_.isFunction(name)) {
        callback = name;
        name = '';
      }
      if (!callback) callback = this[name];
      var router = this;
      Backbone.history.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment);
        if (router.execute(callback, args, name) !== false) {
          router.trigger.apply(router, ['route:' + name].concat(args));
          router.trigger('route', name, args);
          Backbone.history.trigger('route', router, name, args);
        }
      });
      return this;
    },

    // Execute a route handler with the provided parameters.  This is an
    // excellent place to do pre-route setup or post-route cleanup.
    execute: function(callback, args, name) {
      if (callback) callback.apply(this, args);
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
      return this;
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      this.routes = _.result(this, 'routes');
      var route, routes = _.keys(this.routes);
      while ((route = routes.pop()) != null) {
        this.route(route, this.routes[route]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
      .replace(optionalParam, '(?:$1)?')
      .replace(namedParam, function(match, optional) {
        return optional ? match : '([^/?]+)';
      })
      .replace(splatParam, '([^?]*?)');
      return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted decoded parameters. Empty or unmatched parameters will be
    // treated as `null` to normalize cross-browser behavior.
    _extractParameters: function(route, fragment) {
      var params = route.exec(fragment).slice(1);
      return _.map(params, function(param, i) {
        // Don't decode the search params.
        if (i === params.length - 1) return param || null;
        return param ? decodeURIComponent(param) : null;
      });
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on either
  // [pushState](http://diveintohtml5.info/history.html) and real URLs, or
  // [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
  // and URL fragments. If the browser supports neither (old IE, natch),
  // falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    this.checkUrl = this.checkUrl.bind(this);

    // Ensure that `History` can be used outside of the browser.
    if (typeof window !== 'undefined') {
      this.location = window.location;
      this.history = window.history;
    }
  };

  // Cached regex for stripping a leading hash/slash and trailing space.
  var routeStripper = /^[#\/]|\s+$/g;

  // Cached regex for stripping leading and trailing slashes.
  var rootStripper = /^\/+|\/+$/g;

  // Cached regex for stripping urls of hash.
  var pathStripper = /#.*$/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Are we at the app root?
    atRoot: function() {
      var path = this.location.pathname.replace(/[^\/]$/, '$&/');
      return path === this.root && !this.getSearch();
    },

    // Does the pathname match the root?
    matchRoot: function() {
      var path = this.decodeFragment(this.location.pathname);
      var rootPath = path.slice(0, this.root.length - 1) + '/';
      return rootPath === this.root;
    },

    // Unicode characters in `location.pathname` are percent encoded so they're
    // decoded for comparison. `%25` should not be decoded since it may be part
    // of an encoded parameter.
    decodeFragment: function(fragment) {
      return decodeURI(fragment.replace(/%25/g, '%2525'));
    },

    // In IE6, the hash fragment and search params are incorrect if the
    // fragment contains `?`.
    getSearch: function() {
      var match = this.location.href.replace(/#.*/, '').match(/\?.+/);
      return match ? match[0] : '';
    },

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(window) {
      var match = (window || this).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the pathname and search params, without the root.
    getPath: function() {
      var path = this.decodeFragment(
        this.location.pathname + this.getSearch()
      ).slice(this.root.length - 1);
      return path.charAt(0) === '/' ? path.slice(1) : path;
    },

    // Get the cross-browser normalized URL fragment from the path or hash.
    getFragment: function(fragment) {
      if (fragment == null) {
        if (this._usePushState || !this._wantsHashChange) {
          fragment = this.getPath();
        } else {
          fragment = this.getHash();
        }
      }
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error('Backbone.history has already been started');
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({root: '/'}, this.options, options);
      this.root             = this.options.root;
      this._trailingSlash   = this.options.trailingSlash;
      this._wantsHashChange = this.options.hashChange !== false;
      this._hasHashChange   = 'onhashchange' in window && (document.documentMode === void 0 || document.documentMode > 7);
      this._useHashChange   = this._wantsHashChange && this._hasHashChange;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.history && this.history.pushState);
      this._usePushState    = this._wantsPushState && this._hasPushState;
      this.fragment         = this.getFragment();

      // Normalize root to always include a leading and trailing slash.
      this.root = ('/' + this.root + '/').replace(rootStripper, '/');

      // Transition from hashChange to pushState or vice versa if both are
      // requested.
      if (this._wantsHashChange && this._wantsPushState) {

        // If we've started off with a route from a `pushState`-enabled
        // browser, but we're currently in a browser that doesn't support it...
        if (!this._hasPushState && !this.atRoot()) {
          var rootPath = this.root.slice(0, -1) || '/';
          this.location.replace(rootPath + '#' + this.getPath());
          // Return immediately as browser will do redirect to new url
          return true;

        // Or if we've started out with a hash-based route, but we're currently
        // in a browser where it could be `pushState`-based instead...
        } else if (this._hasPushState && this.atRoot()) {
          this.navigate(this.getHash(), {replace: true});
        }

      }

      // Proxy an iframe to handle location events if the browser doesn't
      // support the `hashchange` event, HTML5 history, or the user wants
      // `hashChange` but not `pushState`.
      if (!this._hasHashChange && this._wantsHashChange && !this._usePushState) {
        this.iframe = document.createElement('iframe');
        this.iframe.src = 'javascript:0';
        this.iframe.style.display = 'none';
        this.iframe.tabIndex = -1;
        var body = document.body;
        // Using `appendChild` will throw on IE < 9 if the document is not ready.
        var iWindow = body.insertBefore(this.iframe, body.firstChild).contentWindow;
        iWindow.document.open();
        iWindow.document.close();
        iWindow.location.hash = '#' + this.fragment;
      }

      // Add a cross-platform `addEventListener` shim for older browsers.
      var addEventListener = window.addEventListener || function(eventName, listener) {
        return attachEvent('on' + eventName, listener);
      };

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._usePushState) {
        addEventListener('popstate', this.checkUrl, false);
      } else if (this._useHashChange && !this.iframe) {
        addEventListener('hashchange', this.checkUrl, false);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      if (!this.options.silent) return this.loadUrl();
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      // Add a cross-platform `removeEventListener` shim for older browsers.
      var removeEventListener = window.removeEventListener || function(eventName, listener) {
        return detachEvent('on' + eventName, listener);
      };

      // Remove window listeners.
      if (this._usePushState) {
        removeEventListener('popstate', this.checkUrl, false);
      } else if (this._useHashChange && !this.iframe) {
        removeEventListener('hashchange', this.checkUrl, false);
      }

      // Clean up the iframe if necessary.
      if (this.iframe) {
        document.body.removeChild(this.iframe);
        this.iframe = null;
      }

      // Some environments will throw when clearing an undefined interval.
      if (this._checkUrlInterval) clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();

      // If the user pressed the back button, the iframe's hash will have
      // changed and we should use that for comparison.
      if (current === this.fragment && this.iframe) {
        current = this.getHash(this.iframe.contentWindow);
      }

      if (current === this.fragment) {
        if (!this.matchRoot()) return this.notfound();
        return false;
      }
      if (this.iframe) this.navigate(current);
      this.loadUrl();
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragment) {
      // If the root doesn't match, no routes can match either.
      if (!this.matchRoot()) return this.notfound();
      fragment = this.fragment = this.getFragment(fragment);
      return _.some(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      }) || this.notfound();
    },

    // When no route could be matched, this method is called internally to
    // trigger the `'notfound'` event. It returns `false` so that it can be used
    // in tail position.
    notfound: function() {
      this.trigger('notfound');
      return false;
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: !!options};

      // Normalize the fragment.
      fragment = this.getFragment(fragment || '');

      // Strip trailing slash on the root unless _trailingSlash is true
      var rootPath = this.root;
      if (!this._trailingSlash && (fragment === '' || fragment.charAt(0) === '?')) {
        rootPath = rootPath.slice(0, -1) || '/';
      }
      var url = rootPath + fragment;

      // Strip the fragment of the query and hash for matching.
      fragment = fragment.replace(pathStripper, '');

      // Decode for matching.
      var decodedFragment = this.decodeFragment(fragment);

      if (this.fragment === decodedFragment) return;
      this.fragment = decodedFragment;

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._usePushState) {
        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && fragment !== this.getHash(this.iframe.contentWindow)) {
          var iWindow = this.iframe.contentWindow;

          // Opening and closing the iframe tricks IE7 and earlier to push a
          // history entry on hash-tag change.  When replace is true, we don't
          // want this.
          if (!options.replace) {
            iWindow.document.open();
            iWindow.document.close();
          }

          this._updateHash(iWindow.location, fragment, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) return this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        var href = location.href.replace(/(javascript:|#).*$/, '');
        location.replace(href + '#' + fragment);
      } else {
        // Some browsers require that `hash` contains a leading #.
        location.hash = '#' + fragment;
      }
    }

  });

  // Create the default Backbone.history.
  Backbone.history = new History;

  // Helpers
  // -------

  // Helper function to correctly set up the prototype chain for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function and add the prototype properties.
    child.prototype = _.create(parent.prototype, protoProps);
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Set up inheritance for the model, collection, router, view and history.
  Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function(model, options) {
    var error = options.error;
    options.error = function(resp) {
      if (error) error.call(options.context, model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };

  // Provide useful information when things go wrong. This method is not meant
  // to be used directly; it merely provides the necessary introspection for the
  // external `debugInfo` function.
  Backbone._debug = function() {
    return {root: root, _: _};
  };

  return Backbone;
});


/***/ },

/***/ 87
(__unused_webpack_module, exports) {

!function(n,t){ true?t(exports):0}(this,(function(n){"use strict";try{self["workbox:window:7.4.0"]&&_()}catch(n){}function t(n,t){return new Promise((function(r){var e=new MessageChannel;e.port1.onmessage=function(n){r(n.data)},n.postMessage(t,[e.port2])}))}function r(n,t){(null==t||t>n.length)&&(t=n.length);for(var r=0,e=Array(t);r<t;r++)e[r]=n[r];return e}function e(n,t,r){return t&&function(n,t){for(var r=0;r<t.length;r++){var e=t[r];e.enumerable=e.enumerable||!1,e.configurable=!0,"value"in e&&(e.writable=!0),Object.defineProperty(n,u(e.key),e)}}(n.prototype,t),Object.defineProperty(n,"prototype",{writable:!1}),n}function i(n,t){var e="undefined"!=typeof Symbol&&n[Symbol.iterator]||n["@@iterator"];if(e)return(e=e.call(n)).next.bind(e);if(Array.isArray(n)||(e=function(n,t){if(n){if("string"==typeof n)return r(n,t);var e={}.toString.call(n).slice(8,-1);return"Object"===e&&n.constructor&&(e=n.constructor.name),"Map"===e||"Set"===e?Array.from(n):"Arguments"===e||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e)?r(n,t):void 0}}(n))||t){e&&(n=e);var i=0;return function(){return i>=n.length?{done:!0}:{done:!1,value:n[i++]}}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function o(n,t){return o=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(n,t){return n.__proto__=t,n},o(n,t)}function u(n){var t=function(n,t){if("object"!=typeof n||!n)return n;var r=n[Symbol.toPrimitive];if(void 0!==r){var e=r.call(n,t);if("object"!=typeof e)return e;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(n)}(n,"string");return"symbol"==typeof t?t:t+""}try{self["workbox:core:7.4.0"]&&_()}catch(n){}var a=function(){var n=this;this.promise=new Promise((function(t,r){n.resolve=t,n.reject=r}))};function c(n,t){var r=location.href;return new URL(n,r).href===new URL(t,r).href}var f=function(n,t){this.type=n,Object.assign(this,t)};function s(n,t,r){return n&&n.then||(n=Promise.resolve(n)),t?n.then(t):n}function v(){}var h={type:"SKIP_WAITING"};function l(n,t){return n&&n.then?n.then(v):Promise.resolve()}var d=function(n){function r(t,r){var e,i;return void 0===r&&(r={}),(e=n.call(this)||this).nn={},e.tn=0,e.rn=new a,e.en=new a,e.on=new a,e.un=0,e.an=new Set,e.cn=function(){var n=e.fn,t=n.installing;e.tn>0||!c(t.scriptURL,e.sn.toString())||performance.now()>e.un+6e4?(e.vn=t,n.removeEventListener("updatefound",e.cn)):(e.hn=t,e.an.add(t),e.rn.resolve(t)),++e.tn,t.addEventListener("statechange",e.ln)},e.ln=function(n){var t=e.fn,r=n.target,i=r.state,o=r===e.vn,u={sw:r,isExternal:o,originalEvent:n};!o&&e.dn&&(u.isUpdate=!0),e.dispatchEvent(new f(i,u)),"installed"===i?e.mn=self.setTimeout((function(){"installed"===i&&t.waiting===r&&e.dispatchEvent(new f("waiting",u))}),200):"activating"===i&&(clearTimeout(e.mn),o||e.en.resolve(r))},e.yn=function(n){var t=e.hn,r=t!==navigator.serviceWorker.controller;e.dispatchEvent(new f("controlling",{isExternal:r,originalEvent:n,sw:t,isUpdate:e.dn})),r||e.on.resolve(t)},e.wn=(i=function(n){var t=n.data,r=n.ports,i=n.source;return s(e.getSW(),(function(){e.an.has(i)&&e.dispatchEvent(new f("message",{data:t,originalEvent:n,ports:r,sw:i}))}))},function(){for(var n=[],t=0;t<arguments.length;t++)n[t]=arguments[t];try{return Promise.resolve(i.apply(this,n))}catch(n){return Promise.reject(n)}}),e.sn=t,e.nn=r,navigator.serviceWorker.addEventListener("message",e.wn),e}var i,u;u=n,(i=r).prototype=Object.create(u.prototype),i.prototype.constructor=i,o(i,u);var v=r.prototype;return v.register=function(n){var t=(void 0===n?{}:n).immediate,r=void 0!==t&&t;try{var e=this;return s(function(n,t){var r=n();if(r&&r.then)return r.then(t);return t(r)}((function(){if(!r&&"complete"!==document.readyState)return l(new Promise((function(n){return window.addEventListener("load",n)})))}),(function(){return e.dn=Boolean(navigator.serviceWorker.controller),e.gn=e.pn(),s(e.bn(),(function(n){e.fn=n,e.gn&&(e.hn=e.gn,e.en.resolve(e.gn),e.on.resolve(e.gn),e.gn.addEventListener("statechange",e.ln,{once:!0}));var t=e.fn.waiting;return t&&c(t.scriptURL,e.sn.toString())&&(e.hn=t,Promise.resolve().then((function(){e.dispatchEvent(new f("waiting",{sw:t,wasWaitingBeforeRegister:!0}))})).then((function(){}))),e.hn&&(e.rn.resolve(e.hn),e.an.add(e.hn)),e.fn.addEventListener("updatefound",e.cn),navigator.serviceWorker.addEventListener("controllerchange",e.yn),e.fn}))})))}catch(n){return Promise.reject(n)}},v.update=function(){try{return this.fn?s(l(this.fn.update())):s()}catch(n){return Promise.reject(n)}},v.getSW=function(){return void 0!==this.hn?Promise.resolve(this.hn):this.rn.promise},v.messageSW=function(n){try{return s(this.getSW(),(function(r){return t(r,n)}))}catch(n){return Promise.reject(n)}},v.messageSkipWaiting=function(){this.fn&&this.fn.waiting&&t(this.fn.waiting,h)},v.pn=function(){var n=navigator.serviceWorker.controller;return n&&c(n.scriptURL,this.sn.toString())?n:void 0},v.bn=function(){try{var n=this;return s(function(n,t){try{var r=n()}catch(n){return t(n)}if(r&&r.then)return r.then(void 0,t);return r}((function(){return s(navigator.serviceWorker.register(n.sn,n.nn),(function(t){return n.un=performance.now(),t}))}),(function(n){throw n})))}catch(n){return Promise.reject(n)}},e(r,[{key:"active",get:function(){return this.en.promise}},{key:"controlling",get:function(){return this.on.promise}}])}(function(){function n(){this.Pn=new Map}var t=n.prototype;return t.addEventListener=function(n,t){this.jn(n).add(t)},t.removeEventListener=function(n,t){this.jn(n).delete(t)},t.dispatchEvent=function(n){n.target=this;for(var t,r=i(this.jn(n.type));!(t=r()).done;){(0,t.value)(n)}},t.jn=function(n){return this.Pn.has(n)||this.Pn.set(n,new Set),this.Pn.get(n)},n}());n.Workbox=d,n.WorkboxEvent=f,n.messageSW=t}));
//# sourceMappingURL=workbox-window.prod.umd.js.map


/***/ },

/***/ 286
(module) {

const CORE = 'https://atomicdata.dev/properties/'
const PARENT = CORE + 'parent'
const NAME = CORE + 'name'
const SHORTNAME = CORE + 'shortname'
const DESCRIPTION = CORE + 'description'
const CLASS = CORE + 'isA'
const PREFIX = 'litewrite-note/v1\n'
const READ_BATCH = 100
const MEMBER_LIMIT = 500

module.exports = async function driveDocuments (store, onStatus) {
  const { table, rowClass } = await store.getData()
  if (!table || !rowClass) throw new Error('Litewrite needs an Atomic Notes table.')

  let tail = Promise.resolve()
  let pending = 0
  const failed = new Set()

  function belongsToTable (row) {
    const classes = row.get(CLASS)
    return row.get(PARENT) === table && Array.isArray(classes) && classes.includes(rowClass)
  }

  function parseNote (row) {
    if (!belongsToTable(row)) return
    const value = row.get(DESCRIPTION)
    if (typeof value !== 'string' || !value.startsWith(PREFIX)) return
    const note = JSON.parse(value.slice(PREFIX.length))
    if (note.id !== row.get(SHORTNAME)) throw new Error('Atomic note ID mismatch.')
    return note
  }

  async function readRows (property, value) {
    const subjects = await store.query({ property, value })
    if (subjects.length >= MEMBER_LIMIT) throw new Error('Too many rows to load safely in this Atomic view.')
    const rows = []
    for (let offset = 0; offset < subjects.length; offset += READ_BATCH) {
      const batch = await store.getMany(subjects.slice(offset, offset + READ_BATCH))
      if (batch.some(row => row.error)) throw new Error('Atomic could not read a note.')
      rows.push(...batch)
    }
    return rows
  }

  async function getRow (id) {
    const rows = (await readRows(SHORTNAME, id)).filter(row =>
      belongsToTable(row) && row.get(SHORTNAME) === id
    )
    if (rows.length > 1) throw new Error('Duplicate Atomic note ID.')
    return rows[0]
  }

  function write (id, operation) {
    pending++
    onStatus('Saving to Atomic…')
    const result = tail.then(operation)
    tail = result.catch(() => {})
    return result.then(() => {
      failed.delete(id)
    }, error => {
      failed.add(id)
      throw error
    }).finally(() => {
      if (--pending === 0) onStatus(failed.size ? 'An edit was not saved. Edit the note again to retry.' : 'Saved to Atomic')
    })
  }

  return {
    async get (id) {
      await tail
      const row = await getRow(id)
      return row && parseNote(row)
    },
    async getAll () {
      await tail
      const notes = Object.create(null)
      for (const row of await readRows(PARENT, table)) {
        const note = parseNote(row)
        if (!note) continue
        if (Object.hasOwn(notes, note.id)) throw new Error('Duplicate Atomic note ID.')
        notes[note.id] = note
      }
      return notes
    },
    set (id, note) {
      return write(id, async () => {
        const row = await getRow(id)
        const props = {
          [NAME]: note.title || 'Note',
          [SHORTNAME]: id,
          [DESCRIPTION]: PREFIX + JSON.stringify(note)
        }
        if (!row) {
          await store.newResource({ parent: table, isA: [rowClass], propVals: props })
          return
        }
        if (!parseNote(row)) throw new Error('The Atomic row does not contain a Litewrite note.')
        for (const [property, value] of Object.entries(props)) row.set(property, value)
        await row.save()
      })
    },
    remove (id) {
      return write(id, async () => {
        const row = await getRow(id)
        if (!row) return
        if (!parseNote(row)) throw new Error('The Atomic row does not contain a Litewrite note.')
        await row.destroy()
      })
    }
  }
}


/***/ },

/***/ 255
(module, __unused_webpack_exports, __webpack_require__) {

const _ = __webpack_require__(523)
const Backbone = __webpack_require__(391)
const utils = __webpack_require__(413)
const Doc = __webpack_require__(929)
const rsSync = __webpack_require__(734)
const lang = __webpack_require__(321)
const { v4: uuid } = __webpack_require__(80)

const Docs = Backbone.Collection.extend({
  model: Doc,

  sync: rsSync,

  initialize: function (models, options) {
    _.bindAll(this, 'sort', 'save', 'welcome', 'rsChange')

    this
      .on('change:lastEdited', this.sort)
      .on('change:lastEdited', this.save)

    this.once('sync', this.welcome)

    this.remote = options.remote

    this.remote.on?.('change', this.rsChange)
  },

  addNew: _.throttle(function (options) {
    return this.add(_.defaults(options || {}, {
      id: uuid(),
      lastEdited: Date.now()
    }))
  }, 1000, { leading: true }),

  // Sort by 'lastEdited'
  comparator: function (first, second) {
    return first.get('lastEdited') > second.get('lastEdited') ? -1 : 1
  },

  save: function (doc) {
    doc.throttledSave()
  },

  welcome: function () {
    if (this.isEmpty()) {
      const welcomeContent = lang.welcome.replace(/{Alt}/g, utils.hotKey)
      this.addNew({ content: welcomeContent })
    }
  },

  events: [],

  rsChange: function (event) {
    this.events.push(event)
    this.handleEvents()
  },

  handleEvents: _.debounce(function () {
    _.each(this.events, function (event) {
      if (event.origin === 'window') {
        return
      }
      // Remove
      if (event.oldValue && !event.newValue) {
        this.remove(event.oldValue)
        return
      }
      // Add
      const existingDoc = this.get(event.newValue.id)
      if (!existingDoc) {
        this.add(event.newValue)
        return
      }
      // Update
      const isLatest = event.newValue.lastEdited > existingDoc.get('lastEdited')
      if (!isLatest) {
        return
      }
      this.set(event.newValue, { remove: false })
      this.trigger('remoteUpdate', event.newValue.id)
    }, this)
    this.events = []
  }, 400)

})

module.exports = Docs


/***/ },

/***/ 907
(module, __unused_webpack_exports, __webpack_require__) {

const _ = __webpack_require__(523)
const Backbone = __webpack_require__(391)
const AppView = __webpack_require__(406)
const Doc = __webpack_require__(929)
const Docs = __webpack_require__(255)

function Litewrite (storage) {
  this.initialize(storage)
}

_.extend(Litewrite.prototype, Backbone.Events, {
  initialize: function (storage) {
    _.bindAll(
      this,
      'loadDoc',
      'open',
      'openOnCreate',
      'handlePrevious',
      'updateDocs',
      'handleRemoteRemove',
      'triggerConnected',
      'triggerDisconnected'
    )

    const connection = typeof storage === 'function' ? storage(this) : storage
    this.useHistory = connection.useHistory !== false
    this.state = connection.state || new Backbone.Model({ query: '' })
    this.doc = new Doc()
    this.docs = new Docs(null, { remote: connection.documents })

    this.doc
      .on('change:content', this.doc.updateLastEdited)
      .on('change:public', this.doc.updateLastEdited)
      .on('change:content', this.doc.updateTitle)
      .on('change:id', this.handlePrevious)
      .on('change:id', this.setUrl)
      .on('change', this.updateDocs)

    this.app = new AppView({
      litewrite: this,
      remote: connection.publicDocuments,
      persistSearch: !!connection.state,
      model: this.doc,
      collection: this.docs
    })

    if (connection.onError) {
      this.docs.fetch({
        success: this.loadDoc,
        error: (docs, error) => connection.onError(error)
      })
    } else {
      this.state.fetch().always(() => this.docs.fetch().always(this.loadDoc))
    }
  },

  loadDoc: function () {
    this.docs
      .on('add', this.openOnCreate)
      .on('remove', this.handleRemoteRemove)

    this.trigger('ready')
  },

  // Open a document. Either pass a Doc or an ID.
  open: function (doc) {
    if (!_.isObject(doc)) {
      doc = this.docs.get(doc)
      if (!doc) {
        this.docs.welcome()
        doc = this.docs.first()
      }
    }
    this.doc.set(doc.toJSON())
  },

  openOnCreate: function (doc) {
    if (doc.isEmpty()) {
      this.open(doc)
    }
  },

  // remove empty documents
  handlePrevious: function (doc) {
    const previous = this.docs.get(doc.previous('id'))
    if (previous && previous.isEmpty()) {
      previous.destroy()
    }
  },

  updateDocs: function (doc) {
    this.docs.set(doc.toJSON(), { add: false, remove: false })
  },

  handleRemoteRemove: function (doc, docs, options) {
    const removedLocally = options.success && options.error
    // Open first doc so editor doesn't display the removed doc
    if (!removedLocally) {
      this.open()
    }
  },

  triggerConnected: function (backend) {
    this.trigger('connected', backend)
  },

  triggerDisconnected: function () {
    this.trigger('disconnected')
    this.docs.reset()
    this.open()
  },

  setUrl: function (doc) {
    if (this.useHistory) Backbone.history.navigate(doc.getUrl())
  }

})

module.exports = Litewrite


/***/ },

/***/ 929
(module, __unused_webpack_exports, __webpack_require__) {

const Backbone = __webpack_require__(391)
const rsSync = __webpack_require__(734)
const timeAgo = (__webpack_require__(413).timeAgo)

const Doc = Backbone.Model.extend({
  defaults: {
    title: '',
    content: '',
    lastEdited: null,
    public: null,
    cursorPos: 0
  },

  sync: rsSync,

  isEmpty: function () {
    return this.get('content').trim() === ''
  },

  // Only update lastEdited if you didn't switch the document
  updateLastEdited: function (doc) {
    if (!doc.changed.id) {
      doc.set('lastEdited', new Date().getTime())
    }
  },

  // Title consists of the first 40 characters of the first not empty line
  updateTitle: function (doc) {
    const matchTitle = doc.get('content').match(/[^\s].{0,40}/)
    doc.set('title', matchTitle ? matchTitle[0] : '')
  },

  getUrl: function () {
    const title = this.get('title')
      .toLowerCase()
      .replace(/\s|&nbsp;/g, '-')
      .replace(/"|’|'|,|\//g, '')
    return title ? '!' + '(' + this.id + ')-' + encodeURI(title) : ''
  },

  getOpacity: function () {
    // Time passed since this document was edited the last time in milliseconds
    const diff = new Date().getTime() - this.get('lastEdited')
    // The older the document the smaller the opacity
    // but the opacity is allway between 0.4 and 1
    // For documents older than 3 months the opacity won't change anymore
    const limit = 90 * 86400000
    const opacity = diff > limit ? 0.4 : Math.round((0.4 + ((limit - diff) / limit) * 0.6) * 100) / 100
    return opacity
  },

  // Save to the local cache immediately. remoteStorage schedules network sync;
  // delaying this write can lose the last second of typing on reload.
  throttledSave: function () {
    this.save()
  },

  formatDate: function () {
    return timeAgo(this.get('lastEdited'))
  }

})

module.exports = Doc


/***/ },

/***/ 830
(module, __unused_webpack_exports, __webpack_require__) {

module.exports = {
  emptyDoc: 'Schreibe etwas …',
  search: 'Suchen',
  footer: 'write lite, open source',
  delete: 'löschen',
  confirmDelete: 'Möchtest du die Notiz wirklich löschen?',
  share: 'teilen',
  unshare: 'verstecken',
  open: 'öffnen',
  modified: 'zuletzt bearbeitet',
  updateCache: 'Eine neue Version von Litewrite ist verfügbar. Seite neuladen?',
  welcome: __webpack_require__(962),
  secondsAgo: function (x) {
    if (x === 1) return 'vor einer Sekunde'
    return 'vor ' + x + ' Sekunden'
  },
  minutesAgo: function (x) {
    if (x === 1) return 'vor einer Minute'
    return 'vor ' + x + ' Minuten'
  },
  hoursAgo: function (x) {
    if (x === 1) return 'vor einer Stunde'
    return 'vor ' + x + ' Stunden'
  },
  daysAgo: function (x) {
    if (x === 1) return 'vor einem Tag'
    return 'vor ' + x + ' Tagen'
  },
  weeksAgo: function (x) {
    if (x === 1) return 'vor einer Woche'
    return 'vor ' + x + ' Wochen'
  },
  monthsAgo: function (x) {
    if (x === 1) return 'vor einem Monat'
    return 'vor ' + x + ' Monaten'
  },
  yearsAgo: function (x) {
    if (x === 1) return 'vor einem Jahr'
    return 'vor ' + x + ' Jahren'
  }
}


/***/ },

/***/ 810
(module, __unused_webpack_exports, __webpack_require__) {

module.exports = {
  emptyDoc: 'Write …',
  search: 'Search',
  footer: 'write lite, open source',
  delete: 'delete',
  confirmDelete: 'Are you sure that you want to delete the document?',
  share: 'share',
  unshare: 'unshare',
  open: 'open',
  modified: 'modified',
  updateCache: 'New Litewrite version available. Refresh?',
  welcome: __webpack_require__(230),
  secondsAgo: function (x) {
    if (x === 1) return 'a second ago'
    return x + ' seconds ago'
  },
  minutesAgo: function (x) {
    if (x === 1) return 'a minute ago'
    return x + ' minutes ago'
  },
  hoursAgo: function (x) {
    if (x === 1) return 'an hour ago'
    return x + ' hours ago'
  },
  daysAgo: function (x) {
    if (x === 1) return 'a day ago'
    return x + ' days ago'
  },
  weeksAgo: function (x) {
    if (x === 1) return 'a week ago'
    return x + ' weeks ago'
  },
  monthsAgo: function (x) {
    if (x === 1) return 'a month ago'
    return x + ' months ago'
  },
  yearsAgo: function (x) {
    if (x === 1) return 'a year ago'
    return x + ' years ago'
  }
}


/***/ },

/***/ 797
(module, __unused_webpack_exports, __webpack_require__) {

module.exports = {
  emptyDoc: 'Écrire …',
  search: 'Rechercher',
  footer: 'Ecrivez léger, écrivez libre !',
  delete: 'effacer',
  confirmDelete: 'Voulez-vous vraiment supprimer la note ?',
  share: 'partager',
  unshare: 'cacher',
  open: 'ouvrir',
  modified: 'dernière modification',
  updateCache: 'Une nouvelle version de Litewrite est disponible. La charger maintenant ?',
  welcome: __webpack_require__(35),
  secondsAgo: function (x) {
    if (x === 1) return 'il y a une seconde'
    return 'il y a ' + x + ' secondes'
  },
  minutesAgo: function (x) {
    if (x === 1) return 'il y a une minute'
    return 'il y a ' + x + ' minutes'
  },
  hoursAgo: function (x) {
    if (x === 1) return 'il y a une heure'
    return 'il y a ' + x + ' heures'
  },
  daysAgo: function (x) {
    if (x === 1) return 'il y a un jour'
    return 'il y a ' + x + ' jours'
  },
  weeksAgo: function (x) {
    if (x === 1) return 'il y a une semaine'
    return 'il y a ' + x + ' semaines'
  },
  monthsAgo: function (x) {
    if (x === 1) return 'il y a un mois'
    return 'il y a ' + x + ' mois'
  },
  yearsAgo: function (x) {
    if (x === 1) return 'il y a un an'
    return 'il y a ' + x + ' ans'
  }
}


/***/ },

/***/ 321
(module, __unused_webpack_exports, __webpack_require__) {

const lang = (navigator.language || navigator.browserLanguage).slice(0, 2)

const translations = {
  de: __webpack_require__(830),
  en: __webpack_require__(810),
  fr: __webpack_require__(797),
  ru: __webpack_require__(780)
}

module.exports = translations[lang] || translations.en


/***/ },

/***/ 780
(module, __unused_webpack_exports, __webpack_require__) {

module.exports = {
  emptyDoc: 'Пишите …',
  search: 'Найти',
  footer: 'Пишите с легкостью! Исходный код открыт.',
  delete: 'Удалить',
  confirmDelete: 'Вы уверены, что хотите удалить документ?',
  share: 'опубликовать',
  unshare: 'отменить публикацию',
  open: 'открыть',
  modified: 'изменён',
  updateCache: 'Доступна новая версия Litewrite. Загрузить?',
  welcome: __webpack_require__(540),
  secondsAgo: function (x) {
    return timeAgoWithPlural('секунду_секунды_секунд', x)
  },
  minutesAgo: function (x) {
    return timeAgoWithPlural('минуту_минуты_минут', x)
  },
  hoursAgo: function (x) {
    return timeAgoWithPlural('час_часа_часов', x)
  },
  daysAgo: function (x) {
    return timeAgoWithPlural('день_дня_дней', x)
  },
  weeksAgo: function (x) {
    return timeAgoWithPlural('неделю_недели_недель', x)
  },
  monthsAgo: function (x) {
    return timeAgoWithPlural('месяц_месяца_месяцев', x)
  },
  yearsAgo: function (x) {
    return timeAgoWithPlural('год_года_лет', x)
  }
}

function timeAgoWithPlural (word, number) {
  const num = number > 1 ? (number + ' ') : ''
  return num + plural(word, +number) + ' назад'
}

function plural (word, num) {
  const forms = word.split('_')
  return num % 10 === 1 && num % 100 !== 11 ? forms[0] : (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2])
}


/***/ },

/***/ 413
(module, __unused_webpack_exports, __webpack_require__) {

const $ = __webpack_require__(486)
const _ = __webpack_require__(523)
const translations = __webpack_require__(321)

const utils = {}

utils.isMac = /Mac/.test(navigator.platform)

function setModes () {
  // Keep in sync with value in litewrite.css
  utils.isMobile = window.matchMedia('(max-width:1024px)').matches
  utils.isDesktop = !utils.isMobile
}

$(window).on('resize', setModes)
setModes()

// For more info:
// http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript/3561711#3561711
utils.escapeRegExp = function (str) {
  return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}

// in seconds
const hour = 3600
const day = 24 * hour
const week = 7 * day
const month = 30.4 * day
const year = 365 * day

const quantifiers = [
  {
    name: 'yearsAgo',
    time: year
  },
  {
    name: 'monthsAgo',
    time: month
  },
  {
    name: 'weeksAgo',
    time: week
  },
  {
    name: 'daysAgo',
    time: day
  },
  {
    name: 'hoursAgo',
    time: hour
  },
  {
    name: 'minutesAgo',
    time: 60
  },
  {
    name: 'secondsAgo',
    time: 1
  }
]

utils.timeAgo = function (date) {
  const diff = (Date.now() - date) / 1000 // in seconds

  const quantifier = _.find(quantifiers, function (q) {
    return diff >= q.time
  })

  if (!quantifier) {
    return
  }

  const count = Math.round(diff / quantifier.time)
  return translations[quantifier.name](count)
}

utils.registerServiceWorker = function () {
  const Workbox = (__webpack_require__(87).Workbox)
  const wb = new Workbox('service-worker.js')

  wb.addEventListener('waiting', function () {
    if (!window.confirm(translations.updateCache)) return
    wb.addEventListener('controlling', function () {
      window.location.reload()
    })
    wb.messageSkipWaiting()
  })

  wb.register()
}

utils.hotKey = utils.isMac ? 'Alt' : 'Ctrl'

module.exports = utils


/***/ },

/***/ 406
(module, __unused_webpack_exports, __webpack_require__) {

const Backbone = __webpack_require__(391)
const _ = __webpack_require__(523)
const EntriesView = __webpack_require__(217)
const EditorView = __webpack_require__(116)
const DateView = __webpack_require__(285)
const AsideView = __webpack_require__(673)
const SearchView = __webpack_require__(977)
const ShareView = __webpack_require__(470)
const DeleteView = __webpack_require__(794)
const utils = __webpack_require__(413)

// Enable search if at least this number of documents
const searchMinDocCount = 10

const AppView = Backbone.View.extend({
  el: 'body',

  initialize: function (options) {
    _.bindAll(this, 'toggleSearch')

    this.litewrite = options.litewrite

    this.editor = new EditorView({ model: this.model, litewrite: this.litewrite })
    this.aside = new AsideView({ model: this.model, collection: this.collection })
    this.search = new SearchView({ model: this.litewrite.state, persist: options.persistSearch })
    this.entries = new EntriesView({ litewrite: this.litewrite, collection: this.collection })
    this.date = new DateView({ model: this.model })
    const deleteView = new DeleteView({ model: this.model })
    if (options.remote) {
      const share = new ShareView({ model: this.model, collection: this.collection, remote: options.remote })
      this.litewrite
        .on('connected', share.show)
        .on('disconnected', share.hide)
      deleteView.on('delete', share.unshare)
    }

    this.litewrite
      .on('ready', this.editor.render)
      .on('ready', this.editor.desktopFocus)

    this.collection
      .on('update', this.toggleSearch)

    this.search
      .on('focus', this.aside.show)
      .on('blur', this.editor.desktopFocus)

    this.editor
      .on('typing', this.aside.desktopHide)

    this.aside
      .on('opening', this.editor.blur)

    this.entries
      .on('open', this.editor.desktopFocus)
      .on('open', this.aside.hide)

    deleteView
      .on('delete', this.editor.render)
      .on('delete', this.editor.focus)
  },

  events: {
    'click #add': 'newDoc',
    'touchend #add': 'newDoc',
    'click #menu-button': 'toggleAside',
    'touchend #menu-button': 'toggleAside',
    keydown: 'handleKey',
    keyup: 'closeAside'
  },

  newDoc: function () {
    if (utils.isMobile) {
      this.aside.hide()
    }
    if (!this.model.isEmpty()) {
      this.collection.addNew()
    }
    this.editor.focus()
    this.search.clear()
    return false
  },

  toggleAside: function () {
    this.aside.toggle()
    return false
  },

  toggleSearch: function () {
    if (this.collection.length >= searchMinDocCount) {
      this.search.show()
    } else {
      this.search.hide()
    }
  },

  // Global key handler for shortcuts
  handleKey: function (e) {
    const tabKey = e.keyCode === 9

    const sKey = e.keyCode === 83
    const saveShortcut = sKey && e.metaKey

    if (tabKey && !e.shiftKey) {
      this.editor.insertTab()
    }

    if (tabKey || saveShortcut) {
      e.preventDefault()
      return
    }

    const hotKey = (utils.isMac && e.altKey) || e.ctrlKey
    if (!hotKey) return

    const shortcut = this.shortcuts[e.keyCode]
    if (!shortcut) {
      return
    }

    e.preventDefault()
    e.stopPropagation()

    shortcut.call(this, e)
  },

  shortcuts: {
    32: function space () {
      this.aside.toggle()
    },
    68: function d () {
      this.newDoc()
    },
    38: function up () {
      this.previous()
    },
    40: function down () {
      this.next()
    },
    70: function f () {
      this.search.focus()
    }
  },

  previous: function () {
    const id = this.entries.previous(this.model.id)
    if (id) {
      this.litewrite.open(id)
    }
  },

  next: function () {
    const id = this.entries.next(this.model.id)
    if (id) {
      this.litewrite.open(id)
    }
  },

  closeAside: function (e) {
    const isModKey = e.keyCode === 18
    if (!isModKey) {
      return
    }
    if (this.search.isFocused()) {
      return
    }
    this.aside.hide()
  }

})

module.exports = AppView


/***/ },

/***/ 673
(module, __unused_webpack_exports, __webpack_require__) {

const _ = __webpack_require__(523)
const $ = __webpack_require__(486)
const Backbone = __webpack_require__(391)
const utils = __webpack_require__(413)
const Snap = __webpack_require__(757)
const lang = __webpack_require__(321)

// Allow hiding of sitebar if at list this number of docs
const minDocsForHide = 3

const AsideView = Backbone.View.extend({
  el: 'body',

  initialize: function () {
    _.bindAll(this, 'show', 'hide', 'toggle', 'desktopShow', 'desktopHide', 'handleSnapper', 'triggerOpening')

    this.$sidebar = this.$('aside')

    this.collection
      .on('add', this.desktopShow)
      .on('remove', this.desktopShow)
      .on('change:title', this.desktopShow)

    this.initSnapper()
    this.setFooter()
  },

  initSnapper: function () {
    this.snapper = new Snap({
      element: this.$('#snap-content')[0],
      disable: 'right',
      maxPosition: 265
    })

    this.snapper.on('end', this.triggerOpening)

    this.handleSnapper()
    $(window).on('resize', this.handleSnapper)
  },

  triggerOpening: function () {
    if (this.snapper.state().info.opening) {
      this.trigger('opening')
    }
  },

  show: function () {
    if (utils.isDesktop) {
      this.$el.addClass('show-aside')
      return
    }
    this.snapper.open('left')
  },

  hide: function () {
    if (utils.isMobile) {
      this.snapper.close()
      return
    }
    // Hide sidebar when 3 or more docs and the open doc is not empty
    if (this.collection.length < minDocsForHide || this.model.isEmpty()) {
      return
    }
    this.$el.removeClass('show-aside')
  },

  toggle: function () {
    if (utils.isDesktop) {
      this.$el.toggleClass('show-aside')
      return
    }
    if (this.snapper.state().state === 'closed') {
      this.show()
      return
    }
    this.hide()
  },

  desktopShow: function () {
    if (utils.isDesktop) {
      this.show()
    }
  },

  desktopHide: _.debounce(function () {
    if (utils.isDesktop) {
      this.hide()
    }
  }, 3000),

  handleSnapper: _.debounce(function () {
    if (utils.isMobile) {
      this.snapper.enable()
      return
    }
    this.snapper.close()
    this.snapper.disable()
  }, 700),

  setFooter: function () {
    this.$sidebar.find('footer a').text(lang.footer)
  }
})

module.exports = AsideView


/***/ },

/***/ 285
(module, __unused_webpack_exports, __webpack_require__) {

const _ = __webpack_require__(523)
const Backbone = __webpack_require__(391)
const lang = __webpack_require__(321)

const updateInterval = 20000

const DateView = Backbone.View.extend({
  el: '#date',

  initialize: function (options) {
    _.bindAll(this, 'render')
    this.model.on('change:lastEdited', this.render)
    this.refreshTimeout = null
  },

  render: function () {
    const lastModified = this.model.formatDate()
    this.$el.html(lastModified ? lang.modified + ' ' + lastModified : '')
    this.refresh()
  },

  refresh: function () {
    clearTimeout(this.refreshTimeout)
    this.refreshTimeout = setTimeout(_.bind(function () {
      // Stop updating when window is inactive
      window.requestAnimationFrame(this.render)
    }, this), updateInterval)
  }

})

module.exports = DateView


/***/ },

/***/ 794
(module, __unused_webpack_exports, __webpack_require__) {

const Backbone = __webpack_require__(391)
const _ = __webpack_require__(523)
const lang = __webpack_require__(321)

const DeleteView = Backbone.View.extend({
  el: '#delete',

  initialize: function () {
    _.bindAll(this, 'render')
    this.model.on('change:content', this.render)
    this.$el.text(lang.delete)
    this.render()
  },

  events: {
    click: 'delete'
  },

  render: function () {
    this.$el.toggleClass('hide', this.model.get('content') === '')
  },

  delete: function () {
    if (!window.confirm(lang.confirmDelete)) {
      return
    }

    this.model.set({
      content: '',
      cursorPos: 0
    })
    this.trigger('delete')
  }

})

module.exports = DeleteView


/***/ },

/***/ 116
(module, __unused_webpack_exports, __webpack_require__) {

const _ = __webpack_require__(523)
const Backbone = __webpack_require__(391)
const utils = __webpack_require__(413)
const lang = __webpack_require__(321)
const autosize = __webpack_require__(692)
const $ = __webpack_require__(486)

const EditorView = Backbone.View.extend({
  el: '#editor',

  initialize: function (options) {
    _.bindAll(
      this,
      'render',
      'focus',
      'blur',
      'desktopFocus',
      'handleCharEncodings',
      'setCursor',
      'insertTab'
    )

    this.litewrite = options.litewrite
    this.litewrite.state
      .on('change:query', this.render)

    this.model
      .on('change:id', this.render)
      .on('change:content', this.handleCharEncodings)
      .on('update', this.render)

    autosize(this.$el)
    this.setPlaceholder()
    this.render()
  },

  render: function () {
    // Only re-render when content changed
    const content = this.model.get('content')
    const query = this.litewrite.state.get('query')

    const highlightedText = this.applyHighlights(content, query)
    this.updateHighlight(highlightedText)

    if (content === this.$el.val()) {
      return
    }

    this.$el.val(content || '')
    autosize.update(this.$el)

    const pos = this.model.get('cursorPos')
    if (pos) {
      this.setCursor(pos)
    }
  },

  focus: function () {
    if (utils.isDesktop) {
      this.$el.focus()
      return
    }

    // Doesn't seem to work for textarea on iOS at all.
    // Maybe it works on other platforms.
    setTimeout(_.bind(this.$el.focus, this.$el), 500)
  },

  desktopFocus: function () {
    if (utils.isDesktop) {
      this.focus()
    }
  },

  blur: function () {
    this.$el.blur()
  },

  events: {
    input: 'updateOpenDoc'
  },

  updateOpenDoc: function () {
    this.model.set({
      content: this.$el.val(),
      cursorPos: this.$el.prop('selectionStart')
    })
    this.trigger('typing')
  },

  // Set CSS class for certain languages to adjust styling.
  // For char classes see: http://kourge.net/projects/regexp-unicode-block
  handleCharEncodings: function (doc) {
    const c = doc.get('content')
    const isCyrillic = !!c.match('[\u0400-\u04FF\u0500-\u052F]')
    this.$el.toggleClass('cyrillic', isCyrillic)

    // Arabic, Hebrew, Syriac & Thaana
    const isRTL = !!c.match('[\u0600-\u06FF\u0750-\u077F\u0590-\u05FF\u0700-\u074F\u0780-\u07BF]')
    this.$el.toggleClass('rtl', isRTL)
  },

  setPlaceholder: function () {
    this.$el.attr('placeholder', lang.emptyDoc)
  },

  setCursor: function (pos) {
    this.$el
      .prop('selectionStart', pos)
      .prop('selectionEnd', pos)
  },

  insertTab: function () {
    const pos = this.$el.prop('selectionStart')
    const v = this.$el.val()
    this.$el.val(v.substring(0, pos) + '\t' + v.substring(pos, v.length))
    this.setCursor(pos + 1)
    this.updateOpenDoc()
  },

  escapeRegex: function (str) {
    return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
  },

  applyHighlights: function (text, query) {
    text = text.replace(/\n$/, '\n\n')
    if (query) {
      const queryRegex = new RegExp('(' + this.escapeRegex(query) + ')', 'gi')
      text = text.split(queryRegex).map((part, i) => {
        const escaped = _.escape(part)
        return i % 2 ? '<mark>' + escaped + '</mark>' : escaped
      }).join('')
    } else {
      text = _.escape(text)
    }

    const ua = window.navigator.userAgent.toLowerCase()
    const isIE = !!ua.match(/msie|trident\/7|edge/)
    if (isIE) {
      // IE wraps whitespace differently in a div vs textarea, this fixes it
      text = text.replace(/ /g, ' <wbr>')
    }

    return text
  },

  updateHighlight: function (highlightedText) {
    $('.highlights').html(highlightedText)
  }

})

module.exports = EditorView


/***/ },

/***/ 217
(module, __unused_webpack_exports, __webpack_require__) {

const _ = __webpack_require__(523)
const Backbone = __webpack_require__(391)
const lang = __webpack_require__(321)

const EntriesView = Backbone.View.extend({
  el: '#entries',

  initialize: function (options) {
    _.bindAll(this, 'filter', 'render', 'update', 'toTop', 'removeItem', 'selectDoc', 'openFirst')

    this.litewrite = options.litewrite

    this.collection
      .on('add reset', this.render)
      .on('change:title', this.update)
      .on('change:lastEdited', this.toTop)
      .on('remove', this.removeItem)

    this.litewrite.doc
      .on('change:id', this.selectDoc)

    this.litewrite.state
      .on('change:query', this.render)
      .on('change:query', this.openFirst)
  },

  events: {
    'click .item': 'openDoc'
  },

  filter: function (doc) {
    const query = this.litewrite.state.get('query')
    if (!query) {
      return true
    }
    return doc.get('content').toLowerCase().indexOf(query.toLowerCase()) !== -1
  },

  render: function () {
    const items = document.createDocumentFragment()
    for (const doc of this.collection.filter(this.filter)) {
      const item = document.createElement('li')
      item.className = 'item'
      item.dataset.id = doc.id
      const link = document.createElement('a')
      link.href = '#!' + doc.getUrl()
      link.style.opacity = doc.getOpacity()
      link.textContent = doc.get('title') || lang.emptyDoc
      item.append(link)
      items.append(item)
    }
    this.el.replaceChildren(items)
    this.selectDoc()
  },

  find: function (id) {
    return this.$('.item[data-id=' + id + ']')
  },

  // Update text and href for a doc
  update: function (doc) {
    const $item = this.find(doc.id).find('a')
    if (!$item.length || doc.isEmpty()) {
      this.render()
      return
    }
    $item.text(doc.get('title'))
    $item.attr('href', '#!' + doc.getUrl())
  },

  // Moves a doc from its current position to the top of the list
  toTop: function (doc) {
    const $item = this.removeItem(doc)
    $item.children('a').css('opacity', 1)
    this.$el.prepend($item)
  },

  removeItem: function (doc) {
    return this.find(doc.id).remove()
  },

  // Add a 'selected' class to the open doc
  selectDoc: function () {
    if (this.$selected) {
      this.$selected.removeClass('selected')
    }
    this.$selected = this.find(this.litewrite.doc.id)
      .addClass('selected')
  },

  selectedFirst: function () {
    return this.$selected.attr('data-id') === this.collection.first().id
  },

  // Event handler to open a document
  openDoc: function (e) {
    e.preventDefault()

    const id = this.$(e.currentTarget).attr('data-id')
    this.litewrite.open(id)
    this.trigger('open')
  },

  openFirst: function () {
    const id = this.$('.item').attr('data-id')
    this.litewrite.open(id)
  },

  previous: function (id) {
    return this.find(id).prev().attr('data-id')
  },

  next: function (id) {
    return this.find(id).next().attr('data-id')
  }

})

module.exports = EntriesView


/***/ },

/***/ 977
(module, __unused_webpack_exports, __webpack_require__) {

const Backbone = __webpack_require__(391)
const lang = __webpack_require__(321)

const SearchView = Backbone.View.extend({
  el: '#search',

  initialize: function (options) {
    this.persist = options.persist
    this.render()
    this.setPlaceholder()
  },

  events: {
    search: 'search',
    keyup: 'handleKey',
    focus: 'triggerFocus'
  },

  render: function () {
    this.$el.val(this.model.get('query'))
  },

  search: function () {
    const query = this.$el.val()
    this.setQuery(query)
  },

  setQuery: function (query) {
    if (this.persist) this.model.save('query', query)
    else this.model.set('query', query)
  },

  handleKey: function (e) {
    const isEnter = e.which === 13
    if (isEnter) {
      e.preventDefault()
      this.trigger('blur')
      return
    }
    this.search()
  },

  focus: function () {
    this.$el.removeClass('hide')
    this.$el.focus()
  },

  triggerFocus: function () {
    this.trigger('focus')
  },

  isFocused: function () {
    return this.$el.is(':focus')
  },

  show: function () {
    this.$el.removeClass('hide')
  },

  hide: function () {
    // Never hide search if not empty
    if (this.model.get('query')) {
      return
    }
    this.$el.addClass('hide')
    this.trigger('blur')
  },

  clear: function () {
    this.setQuery('')
    this.render()
  },

  setPlaceholder: function () {
    this.$el.attr('placeholder', lang.search)
  }

})

module.exports = SearchView


/***/ },

/***/ 470
(module, __unused_webpack_exports, __webpack_require__) {

const _ = __webpack_require__(523)
const Backbone = __webpack_require__(391)
const template = __webpack_require__(847)
const lang = __webpack_require__(321)

const ShareView = Backbone.View.extend({
  el: '#sharing',

  initialize: function (options) {
    _.bindAll(this, 'setLink', 'updatePublic', 'show', 'hide', 'unshare')
    this.remote = options.remote
    this.template = _.template(template)

    this.$shareButton = this.$('.share')
    this.$link = this.$('.link')
    this.$unshareButton = this.$('.unshare')

    this.model.on('change:public', this.setLink)
    this.collection.on('sync', this.updatePublic)

    this.render()
  },

  events: {
    'click .share': 'share',
    'click .unshare': 'unshare'
  },

  render: function () {
    this.$shareButton.text(lang.share)
    this.$link.text(lang.open)
    this.$unshareButton.text(lang.unshare)
    this.setLink()
  },

  share: function () {
    const html = this.renderDocument(this.model)
    this.remote.addRaw('text/html', html).then(_.bind(function (url) {
      this.model.set('public', url)
    }, this))
  },

  unshare: function () {
    const url = this.model.get('public')
    if (!url) {
      return
    }

    const publicId = url.split('/').slice(-2).join('/')
    this.remote.remove(publicId).then(_.bind(function (url) {
      this.model.set('public', null)
    }, this))
  },

  setLink: function () {
    const link = this.model.get('public')
    if (link) {
      this.$link.attr('href', link)
    }
    this.$el.toggleClass('is-shared', !!link)
  },

  updatePublic: function (doc) {
    if (!doc.get('public')) {
      return
    }
    const id = doc.get('public').match(/.+\/(.+?)$/)[1]
    const html = this.renderDocument(doc)
    this.remote.setRaw(id, 'text/html', html)
  },

  renderDocument: function (doc) {
    const data = doc.toJSON()
    data.date = new Date(data.lastEdited).toDateString()
    return this.template(data)
  },

  show: function (backend) {
    // Enable sharing only for supported backends
    if (backend === 'remotestorage') {
      this.$el.removeClass('hide')
    }
  },

  hide: function () {
    this.$el.addClass('hide')
  }

})

module.exports = ShareView


/***/ },

/***/ 847
(module) {

module.exports = "<!DOCTYPE html>\n<html>\n\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width,minimum-scale=1.0,maximum-scale=1.0\">\n\n  <title><%- title %></title>\n  <meta name=\"description\" content=\"Litewrite Document\">\n\n  <style>\n  html {\n    height: 100%;\n  }\n\n  body {\n    font: normal 24px/150% 'Alegreya', Georgia, serif;\n    max-width: 800px;\n    width: 92%;\n    height: 100%;\n    padding: 3.5% 4% 8% 4%;\n    margin: 0 auto;\n    box-sizing: border-box;\n  }\n\n  p {\n    min-height: 92%;\n    margin: 0;\n    padding-bottom: 4%;\n    white-space: pre-wrap;\n  }\n\n  .date {\n    opacity: .5;\n    font-size: 14px;\n  }\n  </style>\n</head>\n\n<body>\n\n    <p><%- content %></p>\n\n    <span class=\"date\"><%- date %></span>\n\n</body>\n\n</html>\n";

/***/ },

/***/ 962
(module) {

module.exports = "Litewrite\n\nHallo, schön dass du hier bist!\n\nLitewrite ist eine simple Anwendung für Notizen und Schreibarbeiten. Es funktioniert offline und dein Browser speichert deine Daten. Um deine Notizen langfristig zu speichern und auf verschiedenen Geräten zu benutzen, kannst du sie mit dem offenen remoteStorage-Standard, Dropbox oder Google Drive synchronisieren. Nutze dafür einfach das Widget oben rechts.\n\nDer komplette Code ist open-source, daher kannst du uns helfen, das App zu verbessern! Wenn du Probleme oder Vorschläge hast, melde das einfach auf http://github.com/litewrite/litewrite/issues\n\nWir hoffen, dass es dir hier gefällt!\n\nJorin & Jan-Christoph\n\n\nWenn du eine Tastatur benutzt, kannst du übrigens auch Tastenkürzel nutzen, um schneller zu arbeiten:\n- {Alt} + d: Neue Notiz\n- {Alt} + f: Suchfeld fokussieren\n- {Alt} + ↑: Zur Notiz darüber wechseln\n- {Alt} + ↓: Zur Notiz darunter wechseln\n";

/***/ },

/***/ 35
(module) {

module.exports = "Litewrite\n\nSalut !\n\nLitewrite est une application minimaliste créé pour prendre des notes et écrire simplement. Elle fonctionne hors-ligne dans votre navigateur et fait des sauvegarde en permanence de vos données. Vous pouvez également synchroniser vos notes sur vos différents appareils en utilisant le protocole ouvert remoteStorage. Jetez un œil au widget en haut à droite pour paramétrer la synchronisation.\n\nLitewrite est libre, ce qui signifie que vous pouvez participer à son amélioration ! Si vous avez le moindre problème ou des suggestions, dites nous le ici http://github.com/litewrite/litewrite/issues\n\nRavi de vous avoir à bord !\n\nJorin & Jan-Christoph\n\n\n\nSi vous avez un clavier, vous avez la possibilité d'utiliser des raccourcis claviers pour aller plus vite:\n- {Alt} + d: nouvelle note\n- {Alt} + f: aller au champ de recherche\n- {Alt} + ↑: passer à la note du dessus\n- {Alt} + ↓: passer à la note du dessous\n";

/***/ },

/***/ 540
(module) {

module.exports = "Litewrite\n\nЭта программа поможет вам сосредоточится на вашем тексте или заметке. Приложение работает даже без подключения к интернету. Браузер будет автоматически сохранять ваши данные. Вы также можете синхронизировать свои заметки на разных устройствах, используя открытый стандарт remoteStorage. Чтобы начать пользоваться синхронизацией, нажмите на виджет вверху справа.\n\nОбратите внимание, что Litewrite является программой с открытым исходным кодом. Это означает, что Вы можете помочь сделать её лучше! Если Вы нашли какие-нибудь ошибки, или у Вас есть предложения по улучшению - сообщите нам по адресу http://github.com/litewrite/litewrite/issues\n\nМы очень рады, что Вы здесь. Надеемся, что приложение Вам понравится!\n\nДжорин и Ян-Криштоф\n\n\n\nКстати, если Вы используете клавиатуру, попробуйте следующие сочетания клавиш:\n- {Alt} + d: новое примечание\n- {Alt} + f: поместить курсор в поле для поиска\n- {Alt} + ↑: переключится на одно примечание вверх\n- {Alt} + ↓: переключится на одно примечание вниз\n";

/***/ },

/***/ 230
(module) {

module.exports = "Litewrite\n\nHey! Good to see you!\n\nLitewrite is a distraction-free app designed for simple note taking and writing. It works offline and your browser will keep your data saved. If you like your notes to be saved permanently and available on all your devices, you can use the open remoteStorage standard, Dropbox or Google Drive. Just check out the widget in the top right to get started.\n\nAnd it is all open source, meaning you can help make it better! If you have any problems or suggestions let us know at http://github.com/litewrite/litewrite/issues\n\nCool you’re here, hope you like it!\n\nJorin & Jan-Christoph\n\n\n\nBy the way, if you use a keyboard you can also use shortcuts to work more quickly:\n- {Alt} + d: new note\n- {Alt} + f: focus search field\n- {Alt} + ↑: switch to note above\n- {Alt} + ↓: switch to note below\n- {Alt} + Space: open sidebar when collapsed\n";

/***/ },

/***/ 486
(module, __unused_webpack_exports, __webpack_require__) {



// Bundlers are able to synchronously require an ESM module from a CommonJS one.
const { jQuery } = __webpack_require__( 842 );
module.exports = jQuery;


/***/ },

/***/ 842
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   jQuery: () => (/* binding */ jQuery)
/* harmony export */ });
/* unused harmony export $ */
/*!
 * jQuery JavaScript Library v4.0.0
 * https://jquery.com/
 *
 * Copyright OpenJS Foundation and other contributors
 * Released under the MIT license
 * https://jquery.com/license/
 *
 * Date: 2026-01-18T00:20Z
 */
// For ECMAScript module environments where a proper `window`
// is present, execute the factory and get jQuery.
function jQueryFactory( window, noGlobal ) {

if ( typeof window === "undefined" || !window.document ) {
	throw new Error( "jQuery requires a window with a document" );
}

var arr = [];

var getProto = Object.getPrototypeOf;

var slice = arr.slice;

// Support: IE 11+
// IE doesn't have Array#flat; provide a fallback.
var flat = arr.flat ? function( array ) {
	return arr.flat.call( array );
} : function( array ) {
	return arr.concat.apply( [], array );
};

var push = arr.push;

var indexOf = arr.indexOf;

// [[Class]] -> type pairs
var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var fnToString = hasOwn.toString;

var ObjectFunctionString = fnToString.call( Object );

// All support tests are defined in their respective modules.
var support = {};

function toType( obj ) {
	if ( obj == null ) {
		return obj + "";
	}

	return typeof obj === "object" ?
		class2type[ toString.call( obj ) ] || "object" :
		typeof obj;
}

function isWindow( obj ) {
	return obj != null && obj === obj.window;
}

function isArrayLike( obj ) {

	var length = !!obj && obj.length,
		type = toType( obj );

	if ( typeof obj === "function" || isWindow( obj ) ) {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}

var document$1 = window.document;

var preservedScriptAttributes = {
	type: true,
	src: true,
	nonce: true,
	noModule: true
};

function DOMEval( code, node, doc ) {
	doc = doc || document$1;

	var i,
		script = doc.createElement( "script" );

	script.text = code;
	for ( i in preservedScriptAttributes ) {
		if ( node && node[ i ] ) {
			script[ i ] = node[ i ];
		}
	}

	if ( doc.head.appendChild( script ).parentNode ) {
		script.parentNode.removeChild( script );
	}
}

var version = "4.0.0",

	rhtmlSuffix = /HTML$/i,

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	};

jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {

		// Return all the elements in a clean array
		if ( num == null ) {
			return slice.call( this );
		}

		// Return just the one element from the set
		return num < 0 ? this[ num + this.length ] : this[ num ];
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	even: function() {
		return this.pushStack( jQuery.grep( this, function( _elem, i ) {
			return ( i + 1 ) % 2;
		} ) );
	},

	odd: function() {
		return this.pushStack( jQuery.grep( this, function( _elem, i ) {
			return i % 2;
		} ) );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor();
	}
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && typeof target !== "function" ) {
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		if ( ( options = arguments[ i ] ) != null ) {

			// Extend the base object
			for ( name in options ) {
				copy = options[ name ];

				// Prevent Object.prototype pollution
				// Prevent never-ending loop
				if ( name === "__proto__" || target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = Array.isArray( copy ) ) ) ) {
					src = target[ name ];

					// Ensure proper type for the source value
					if ( copyIsArray && !Array.isArray( src ) ) {
						clone = [];
					} else if ( !copyIsArray && !jQuery.isPlainObject( src ) ) {
						clone = {};
					} else {
						clone = src;
					}
					copyIsArray = false;

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend( {

	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	isPlainObject: function( obj ) {
		var proto, Ctor;

		// Detect obvious negatives
		// Use toString instead of jQuery.type to catch host objects
		if ( !obj || toString.call( obj ) !== "[object Object]" ) {
			return false;
		}

		proto = getProto( obj );

		// Objects with no prototype (e.g., `Object.create( null )`) are plain
		if ( !proto ) {
			return true;
		}

		// Objects with prototype are plain iff they were constructed by a global Object function
		Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
		return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
	},

	isEmptyObject: function( obj ) {
		var name;

		for ( name in obj ) {
			return false;
		}
		return true;
	},

	// Evaluates a script in a provided context; falls back to the global one
	// if not specified.
	globalEval: function( code, options, doc ) {
		DOMEval( code, { nonce: options && options.nonce }, doc );
	},

	each: function( obj, callback ) {
		var length, i = 0;

		if ( isArrayLike( obj ) ) {
			length = obj.length;
			for ( ; i < length; i++ ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},


	// Retrieve the text value of an array of DOM nodes
	text: function( elem ) {
		var node,
			ret = "",
			i = 0,
			nodeType = elem.nodeType;

		if ( !nodeType ) {

			// If no nodeType, this is expected to be an array
			while ( ( node = elem[ i++ ] ) ) {

				// Do not traverse comment nodes
				ret += jQuery.text( node );
			}
		}
		if ( nodeType === 1 || nodeType === 11 ) {
			return elem.textContent;
		}
		if ( nodeType === 9 ) {
			return elem.documentElement.textContent;
		}
		if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}

		// Do not include comment or processing instruction nodes

		return ret;
	},


	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArrayLike( Object( arr ) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
						[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	isXMLDoc: function( elem ) {
		var namespace = elem && elem.namespaceURI,
			docElem = elem && ( elem.ownerDocument || elem ).documentElement;

		// Assume HTML when documentElement doesn't yet exist, such as inside
		// document fragments.
		return !rhtmlSuffix.test( namespace || docElem && docElem.nodeName || "HTML" );
	},

	// Note: an element does not contain itself
	contains: function( a, b ) {
		var bup = b && b.parentNode;

		return a === bup || !!( bup && bup.nodeType === 1 && (

			// Support: IE 9 - 11+
			// IE doesn't have `contains` on SVG.
			a.contains ?
				a.contains( bup ) :
				a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
		) );
	},

	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var length, value,
			i = 0,
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArrayLike( elems ) ) {
			length = elems.length;
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return flat( ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
} );

if ( typeof Symbol === "function" ) {
	jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
}

// Populate the class2type map
jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
	function( _i, name ) {
		class2type[ "[object " + name + "]" ] = name.toLowerCase();
	} );

function nodeName( elem, name ) {
	return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
}

var pop = arr.pop;

// https://www.w3.org/TR/css3-selectors/#whitespace
var whitespace = "[\\x20\\t\\r\\n\\f]";

var isIE = document$1.documentMode;

var rbuggyQSA = isIE && new RegExp(

	// Support: IE 9 - 11+
	// IE's :disabled selector does not pick up the children of disabled fieldsets
	":enabled|:disabled|" +

	// Support: IE 11+
	// IE 11 doesn't find elements on a `[name='']` query in some cases.
	// Adding a temporary attribute to the document before the selection works
	// around the issue.
	"\\[" + whitespace + "*name" + whitespace + "*=" +
	whitespace + "*(?:''|\"\")"

);

var rtrimCSS = new RegExp(
	"^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$",
	"g"
);

// https://www.w3.org/TR/css-syntax-3/#ident-token-diagram
var identifier = "(?:\\\\[\\da-fA-F]{1,6}" + whitespace +
	"?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+";

var rleadingCombinator = new RegExp( "^" + whitespace + "*([>+~]|" +
	whitespace + ")" + whitespace + "*" );

var rdescend = new RegExp( whitespace + "|>" );

var rsibling = /[+~]/;

var documentElement$1 = document$1.documentElement;

// Support: IE 9 - 11+
// IE requires a prefix.
var matches = documentElement$1.matches || documentElement$1.msMatchesSelector;

/**
 * Create key-value caches of limited size
 * @returns {function(string, object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {

		// Use (key + " ") to avoid collision with native prototype properties
		// (see https://github.com/jquery/sizzle/issues/157)
		if ( keys.push( key + " " ) > jQuery.expr.cacheLength ) {

			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return ( cache[ key + " " ] = value );
	}
	return cache;
}

/**
 * Checks a node for validity as a jQuery selector context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Attribute selectors: https://www.w3.org/TR/selectors/#attribute-selectors
var attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +

	// Operator (capture 2)
	"*([*^$|!~]?=)" + whitespace +

	// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
	"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" +
	whitespace + "*\\]";

var pseudos = ":(" + identifier + ")(?:\\((" +

	// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
	// 1. quoted (capture 3; capture 4 or capture 5)
	"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +

	// 2. simple (capture 6)
	"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +

	// 3. anything else (capture 2)
	".*" +
	")\\)|)";

var filterMatchExpr = {
	ID: new RegExp( "^#(" + identifier + ")" ),
	CLASS: new RegExp( "^\\.(" + identifier + ")" ),
	TAG: new RegExp( "^(" + identifier + "|[*])" ),
	ATTR: new RegExp( "^" + attributes ),
	PSEUDO: new RegExp( "^" + pseudos ),
	CHILD: new RegExp(
		"^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" +
		whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" +
		whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i" )
};

var rpseudo = new RegExp( pseudos );

// CSS escapes
// https://www.w3.org/TR/CSS21/syndata.html#escaped-characters

var runescape = new RegExp( "\\\\[\\da-fA-F]{1,6}" + whitespace +
	"?|\\\\([^\\r\\n\\f])", "g" ),
	funescape = function( escape, nonHex ) {
		var high = "0x" + escape.slice( 1 ) - 0x10000;

		if ( nonHex ) {

			// Strip the backslash prefix from a non-hex escape sequence
			return nonHex;
		}

		// Replace a hexadecimal escape sequence with the encoded Unicode code point
		// Support: IE <=11+
		// For values outside the Basic Multilingual Plane (BMP), manually construct a
		// surrogate pair
		return high < 0 ?
			String.fromCharCode( high + 0x10000 ) :
			String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	};

function unescapeSelector( sel ) {
	return sel.replace( runescape, funescape );
}

function selectorError( msg ) {
	jQuery.error( "Syntax error, unrecognized expression: " + msg );
}

var rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" );

var tokenCache = createCache();

function tokenize( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = jQuery.expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || ( match = rcomma.exec( soFar ) ) ) {
			if ( match ) {

				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[ 0 ].length ) || soFar;
			}
			groups.push( ( tokens = [] ) );
		}

		matched = false;

		// Combinators
		if ( ( match = rleadingCombinator.exec( soFar ) ) ) {
			matched = match.shift();
			tokens.push( {
				value: matched,

				// Cast descendant combinators to space
				type: match[ 0 ].replace( rtrimCSS, " " )
			} );
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in filterMatchExpr ) {
			if ( ( match = jQuery.expr.match[ type ].exec( soFar ) ) && ( !preFilters[ type ] ||
				( match = preFilters[ type ]( match ) ) ) ) {
				matched = match.shift();
				tokens.push( {
					value: matched,
					type: type,
					matches: match
				} );
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	if ( parseOnly ) {
		return soFar.length;
	}

	return soFar ?
		selectorError( selector ) :

		// Cache the tokens
		tokenCache( selector, groups ).slice( 0 );
}

var preFilter = {
	ATTR: function( match ) {
		match[ 1 ] = unescapeSelector( match[ 1 ] );

		// Move the given value to match[3] whether quoted or unquoted
		match[ 3 ] = unescapeSelector( match[ 3 ] || match[ 4 ] || match[ 5 ] || "" );

		if ( match[ 2 ] === "~=" ) {
			match[ 3 ] = " " + match[ 3 ] + " ";
		}

		return match.slice( 0, 4 );
	},

	CHILD: function( match ) {

		/* matches from filterMatchExpr["CHILD"]
			1 type (only|nth|...)
			2 what (child|of-type)
			3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
			4 xn-component of xn+y argument ([+-]?\d*n|)
			5 sign of xn-component
			6 x of xn-component
			7 sign of y-component
			8 y of y-component
		*/
		match[ 1 ] = match[ 1 ].toLowerCase();

		if ( match[ 1 ].slice( 0, 3 ) === "nth" ) {

			// nth-* requires argument
			if ( !match[ 3 ] ) {
				selectorError( match[ 0 ] );
			}

			// numeric x and y parameters for jQuery.expr.filter.CHILD
			// remember that false/true cast respectively to 0/1
			match[ 4 ] = +( match[ 4 ] ?
				match[ 5 ] + ( match[ 6 ] || 1 ) :
				2 * ( match[ 3 ] === "even" || match[ 3 ] === "odd" )
			);
			match[ 5 ] = +( ( match[ 7 ] + match[ 8 ] ) || match[ 3 ] === "odd" );

		// other types prohibit arguments
		} else if ( match[ 3 ] ) {
			selectorError( match[ 0 ] );
		}

		return match;
	},

	PSEUDO: function( match ) {
		var excess,
			unquoted = !match[ 6 ] && match[ 2 ];

		if ( filterMatchExpr.CHILD.test( match[ 0 ] ) ) {
			return null;
		}

		// Accept quoted arguments as-is
		if ( match[ 3 ] ) {
			match[ 2 ] = match[ 4 ] || match[ 5 ] || "";

		// Strip excess characters from unquoted arguments
		} else if ( unquoted && rpseudo.test( unquoted ) &&

			// Get excess from tokenize (recursively)
			( excess = tokenize( unquoted, true ) ) &&

			// advance to the next closing parenthesis
			( excess = unquoted.indexOf( ")", unquoted.length - excess ) -
				unquoted.length ) ) {

			// excess is a negative index
			match[ 0 ] = match[ 0 ].slice( 0, excess );
			match[ 2 ] = unquoted.slice( 0, excess );
		}

		// Return only captures needed by the pseudo filter method (type and argument)
		return match.slice( 0, 3 );
	}
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[ i ].value;
	}
	return selector;
}

// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
function access( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		len = elems.length,
		bulk = key == null;

	// Sets many values
	if ( toType( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			access( elems, fn, i, key[ i ], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( typeof value !== "function" ) {
			raw = true;
		}

		if ( bulk ) {

			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, _key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < len; i++ ) {
				fn(
					elems[ i ], key, raw ?
						value :
						value.call( elems[ i ], i, fn( elems[ i ], key ) )
				);
			}
		}
	}

	if ( chainable ) {
		return elems;
	}

	// Gets
	if ( bulk ) {
		return fn.call( elems );
	}

	return len ? fn( elems[ 0 ], key ) : emptyGet;
}

// Only count HTML whitespace
// Other whitespace should count in values
// https://infra.spec.whatwg.org/#ascii-whitespace
var rnothtmlwhite = /[^\x20\t\r\n\f]+/g;

jQuery.fn.extend( {
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each( function() {
			jQuery.removeAttr( this, name );
		} );
	}
} );

jQuery.extend( {
	attr: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set attributes on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		// Attribute hooks are determined by the lowercase version
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			hooks = jQuery.attrHooks[ name.toLowerCase() ];
		}

		if ( value !== undefined ) {
			if ( value === null ||

				// For compat with previous handling of boolean attributes,
				// remove when `false` passed. For ARIA attributes -
				// many of which recognize a `"false"` value - continue to
				// set the `"false"` value as jQuery <4 did.
				( value === false && name.toLowerCase().indexOf( "aria-" ) !== 0 ) ) {

				jQuery.removeAttr( elem, name );
				return;
			}

			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			elem.setAttribute( name, value );
			return value;
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		ret = elem.getAttribute( name );

		// Non-existent attributes return null, we normalize to undefined
		return ret == null ? undefined : ret;
	},

	attrHooks: {},

	removeAttr: function( elem, value ) {
		var name,
			i = 0,

			// Attribute names can contain non-HTML whitespace characters
			// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
			attrNames = value && value.match( rnothtmlwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( ( name = attrNames[ i++ ] ) ) {
				elem.removeAttribute( name );
			}
		}
	}
} );

// Support: IE <=11+
// An input loses its value after becoming a radio
if ( isIE ) {
	jQuery.attrHooks.type = {
		set: function( elem, value ) {
			if ( value === "radio" && nodeName( elem, "input" ) ) {
				var val = elem.value;
				elem.setAttribute( "type", value );
				if ( val ) {
					elem.value = val;
				}
				return value;
			}
		}
	};
}

// CSS string/identifier serialization
// https://drafts.csswg.org/cssom/#common-serializing-idioms
var rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g;

function fcssescape( ch, asCodePoint ) {
	if ( asCodePoint ) {

		// U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
		if ( ch === "\0" ) {
			return "\uFFFD";
		}

		// Control characters and (dependent upon position) numbers get escaped as code points
		return ch.slice( 0, -1 ) + "\\" + ch.charCodeAt( ch.length - 1 ).toString( 16 ) + " ";
	}

	// Other potentially-special ASCII characters get backslash-escaped
	return "\\" + ch;
}

jQuery.escapeSelector = function( sel ) {
	return ( sel + "" ).replace( rcssescape, fcssescape );
};

var sort = arr.sort;

var splice = arr.splice;

var hasDuplicate;

// Document order sorting
function sortOrder( a, b ) {

	// Flag for duplicate removal
	if ( a === b ) {
		hasDuplicate = true;
		return 0;
	}

	// Sort on method existence if only one input has compareDocumentPosition
	var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
	if ( compare ) {
		return compare;
	}

	// Calculate position if both inputs belong to the same document
	// Support: IE 11+
	// IE sometimes throws a "Permission denied" error when strict-comparing
	// two documents; shallow comparisons work.
	// eslint-disable-next-line eqeqeq
	compare = ( a.ownerDocument || a ) == ( b.ownerDocument || b ) ?
		a.compareDocumentPosition( b ) :

		// Otherwise we know they are disconnected
		1;

	// Disconnected nodes
	if ( compare & 1 ) {

		// Choose the first element that is related to the document
		// Support: IE 11+
		// IE sometimes throws a "Permission denied" error when strict-comparing
		// two documents; shallow comparisons work.
		// eslint-disable-next-line eqeqeq
		if ( a == document$1 || a.ownerDocument == document$1 &&
			jQuery.contains( document$1, a ) ) {
			return -1;
		}

		// Support: IE 11+
		// IE sometimes throws a "Permission denied" error when strict-comparing
		// two documents; shallow comparisons work.
		// eslint-disable-next-line eqeqeq
		if ( b == document$1 || b.ownerDocument == document$1 &&
			jQuery.contains( document$1, b ) ) {
			return 1;
		}

		// Maintain original order
		return 0;
	}

	return compare & 4 ? -1 : 1;
}

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
jQuery.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	hasDuplicate = false;

	sort.call( results, sortOrder );

	if ( hasDuplicate ) {
		while ( ( elem = results[ i++ ] ) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			splice.call( results, duplicates[ j ], 1 );
		}
	}

	return results;
};

jQuery.fn.uniqueSort = function() {
	return this.pushStack( jQuery.uniqueSort( slice.apply( this ) ) );
};

var i,
	outermostContext,

	// Local document vars
	document,
	documentElement,
	documentIsHTML,

	// Instance-specific data
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	compilerCache = createCache(),
	nonnativeSelectorCache = createCache(),

	// Regular expressions

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),

	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = jQuery.extend( {

		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		needsContext: new RegExp( "^" + whitespace +
			"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace +
			"*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	}, filterMatchExpr ),

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr$1 = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	// Used for iframes; see `setDocument`.
	// Support: IE 9 - 11+
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE.
	unloadHandler = function() {
		setDocument();
	},

	inDisabledFieldset = addCombinator(
		function( elem ) {
			return elem.disabled === true && nodeName( elem, "fieldset" );
		},
		{ dir: "parentNode", next: "legend" }
	);

function find( selector, context, results, seed ) {
	var m, i, elem, nid, match, groups, newSelector,
		newContext = context && context.ownerDocument,

		// nodeType defaults to 9, since context defaults to document
		nodeType = context ? context.nodeType : 9;

	results = results || [];

	// Return early from calls with invalid selector or context
	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	// Try to shortcut find operations (as opposed to filters) in HTML documents
	if ( !seed ) {
		setDocument( context );
		context = context || document;

		if ( documentIsHTML ) {

			// If the selector is sufficiently simple, try using a "get*By*" DOM method
			// (excepting DocumentFragment context, where the methods don't exist)
			if ( nodeType !== 11 && ( match = rquickExpr$1.exec( selector ) ) ) {

				// ID selector
				if ( ( m = match[ 1 ] ) ) {

					// Document context
					if ( nodeType === 9 ) {
						if ( ( elem = context.getElementById( m ) ) ) {
							push.call( results, elem );
						}
						return results;

					// Element context
					} else {
						if ( newContext && ( elem = newContext.getElementById( m ) ) &&
							jQuery.contains( context, elem ) ) {

							push.call( results, elem );
							return results;
						}
					}

				// Type selector
				} else if ( match[ 2 ] ) {
					push.apply( results, context.getElementsByTagName( selector ) );
					return results;

				// Class selector
				} else if ( ( m = match[ 3 ] ) && context.getElementsByClassName ) {
					push.apply( results, context.getElementsByClassName( m ) );
					return results;
				}
			}

			// Take advantage of querySelectorAll
			if ( !nonnativeSelectorCache[ selector + " " ] &&
				( !rbuggyQSA || !rbuggyQSA.test( selector ) ) ) {

				newSelector = selector;
				newContext = context;

				// qSA considers elements outside a scoping root when evaluating child or
				// descendant combinators, which is not what we want.
				// In such cases, we work around the behavior by prefixing every selector in the
				// list with an ID selector referencing the scope context.
				// The technique has to be used as well when a leading combinator is used
				// as such selectors are not recognized by querySelectorAll.
				// Thanks to Andrew Dupont for this technique.
				if ( nodeType === 1 &&
					( rdescend.test( selector ) || rleadingCombinator.test( selector ) ) ) {

					// Expand context for sibling selectors
					newContext = rsibling.test( selector ) &&
						testContext( context.parentNode ) ||
						context;

					// Outside of IE, if we're not changing the context we can
					// use :scope instead of an ID.
					// Support: IE 11+
					// IE sometimes throws a "Permission denied" error when strict-comparing
					// two documents; shallow comparisons work.
					// eslint-disable-next-line eqeqeq
					if ( newContext != context || isIE ) {

						// Capture the context ID, setting it first if necessary
						if ( ( nid = context.getAttribute( "id" ) ) ) {
							nid = jQuery.escapeSelector( nid );
						} else {
							context.setAttribute( "id", ( nid = jQuery.expando ) );
						}
					}

					// Prefix every selector in the list
					groups = tokenize( selector );
					i = groups.length;
					while ( i-- ) {
						groups[ i ] = ( nid ? "#" + nid : ":scope" ) + " " +
							toSelector( groups[ i ] );
					}
					newSelector = groups.join( "," );
				}

				try {
					push.apply( results,
						newContext.querySelectorAll( newSelector )
					);
					return results;
				} catch ( qsaError ) {
					nonnativeSelectorCache( selector, true );
				} finally {
					if ( nid === jQuery.expando ) {
						context.removeAttribute( "id" );
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrimCSS, "$1" ), context, results, seed );
}

/**
 * Mark a function for special use by jQuery selector module
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ jQuery.expando ] = true;
	return fn;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		return nodeName( elem, "input" ) && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		return ( nodeName( elem, "input" ) || nodeName( elem, "button" ) ) &&
			elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for :enabled/:disabled
 * @param {Boolean} disabled true for :disabled; false for :enabled
 */
function createDisabledPseudo( disabled ) {

	// Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
	return function( elem ) {

		// Only certain elements can match :enabled or :disabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-enabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-disabled
		if ( "form" in elem ) {

			// Check for inherited disabledness on relevant non-disabled elements:
			// * listed form-associated elements in a disabled fieldset
			//   https://html.spec.whatwg.org/multipage/forms.html#category-listed
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-fe-disabled
			// * option elements in a disabled optgroup
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-option-disabled
			// All such elements have a "form" property.
			if ( elem.parentNode && elem.disabled === false ) {

				// Option elements defer to a parent optgroup if present
				if ( "label" in elem ) {
					if ( "label" in elem.parentNode ) {
						return elem.parentNode.disabled === disabled;
					} else {
						return elem.disabled === disabled;
					}
				}

				// Support: IE 6 - 11+
				// Use the isDisabled shortcut property to check for disabled fieldset ancestors
				return elem.isDisabled === disabled ||

					// Where there is no isDisabled, check manually
					elem.isDisabled !== !disabled &&
						inDisabledFieldset( elem ) === disabled;
			}

			return elem.disabled === disabled;

		// Try to winnow out elements that can't be disabled before trusting the disabled property.
		// Some victims get caught in our net (label, legend, menu, track), but it shouldn't
		// even exist on them, let alone have a boolean value.
		} else if ( "label" in elem ) {
			return elem.disabled === disabled;
		}

		// Remaining elements are neither :enabled nor :disabled
		return false;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction( function( argument ) {
		argument = +argument;
		return markFunction( function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ ( j = matchIndexes[ i ] ) ] ) {
					seed[ j ] = !( matches[ j ] = seed[ j ] );
				}
			}
		} );
	} );
}

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [node] An element or document object to use to set the document
 */
function setDocument( node ) {
	var subWindow,
		doc = node ? node.ownerDocument || node : document$1;

	// Return early if doc is invalid or already selected
	// Support: IE 11+
	// IE sometimes throws a "Permission denied" error when strict-comparing
	// two documents; shallow comparisons work.
	// eslint-disable-next-line eqeqeq
	if ( doc == document || doc.nodeType !== 9 ) {
		return;
	}

	// Update global variables
	document = doc;
	documentElement = document.documentElement;
	documentIsHTML = !jQuery.isXMLDoc( document );

	// Support: IE 9 - 11+
	// Accessing iframe documents after unload throws "permission denied" errors (see trac-13936)
	// Support: IE 11+
	// IE sometimes throws a "Permission denied" error when strict-comparing
	// two documents; shallow comparisons work.
	// eslint-disable-next-line eqeqeq
	if ( isIE && document$1 != document &&
		( subWindow = document.defaultView ) && subWindow.top !== subWindow ) {
		subWindow.addEventListener( "unload", unloadHandler );
	}
}

find.matches = function( expr, elements ) {
	return find( expr, null, null, elements );
};

find.matchesSelector = function( elem, expr ) {
	setDocument( elem );

	if ( documentIsHTML &&
		!nonnativeSelectorCache[ expr + " " ] &&
		( !rbuggyQSA || !rbuggyQSA.test( expr ) ) ) {

		try {
			return matches.call( elem, expr );
		} catch ( e ) {
			nonnativeSelectorCache( expr, true );
		}
	}

	return find( expr, document, null, [ elem ] ).length > 0;
};

jQuery.expr = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	find: {
		ID: function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var elem = context.getElementById( id );
				return elem ? [ elem ] : [];
			}
		},

		TAG: function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

				// DocumentFragment nodes don't have gEBTN
			} else {
				return context.querySelectorAll( tag );
			}
		},

		CLASS: function( className, context ) {
			if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
				return context.getElementsByClassName( className );
			}
		}
	},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: preFilter,

	filter: {
		ID: function( id ) {
			var attrId = unescapeSelector( id );
			return function( elem ) {
				return elem.getAttribute( "id" ) === attrId;
			};
		},

		TAG: function( nodeNameSelector ) {
			var expectedNodeName = unescapeSelector( nodeNameSelector ).toLowerCase();
			return nodeNameSelector === "*" ?

				function() {
					return true;
				} :

				function( elem ) {
					return nodeName( elem, expectedNodeName );
				};
		},

		CLASS: function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				( pattern = new RegExp( "(^|" + whitespace + ")" + className +
					"(" + whitespace + "|$)" ) ) &&
				classCache( className, function( elem ) {
					return pattern.test(
						typeof elem.className === "string" && elem.className ||
							typeof elem.getAttribute !== "undefined" &&
								elem.getAttribute( "class" ) ||
							""
					);
				} );
		},

		ATTR: function( name, operator, check ) {
			return function( elem ) {
				var result = jQuery.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				if ( operator === "=" ) {
					return result === check;
				}
				if ( operator === "!=" ) {
					return result !== check;
				}
				if ( operator === "^=" ) {
					return check && result.indexOf( check ) === 0;
				}
				if ( operator === "*=" ) {
					return check && result.indexOf( check ) > -1;
				}
				if ( operator === "$=" ) {
					return check && result.slice( -check.length ) === check;
				}
				if ( operator === "~=" ) {
					return ( " " + result.replace( rwhitespace, " " ) + " " )
						.indexOf( check ) > -1;
				}
				if ( operator === "|=" ) {
					return result === check || result.slice( 0, check.length + 1 ) === check + "-";
				}

				return false;
			};
		},

		CHILD: function( type, what, _argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, _context, xml ) {
					var cache, outerCache, node, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType,
						diff = false;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( ( node = node[ dir ] ) ) {
									if ( ofType ?
										nodeName( node, name ) :
										node.nodeType === 1 ) {

										return false;
									}
								}

								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {

							// Seek `elem` from a previously-cached index
							outerCache = parent[ jQuery.expando ] ||
								( parent[ jQuery.expando ] = {} );
							cache = outerCache[ type ] || [];
							nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
							diff = nodeIndex && cache[ 2 ];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( ( node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								( diff = nodeIndex = 0 ) || start.pop() ) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									outerCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						} else {

							// Use previously-cached element index if available
							if ( useCache ) {
								outerCache = elem[ jQuery.expando ] ||
									( elem[ jQuery.expando ] = {} );
								cache = outerCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex;
							}

							// xml :nth-child(...)
							// or :nth-last-child(...) or :nth(-last)?-of-type(...)
							if ( diff === false ) {

								// Use the same loop as above to seek `elem` from the start
								while ( ( node = ++nodeIndex && node && node[ dir ] ||
									( diff = nodeIndex = 0 ) || start.pop() ) ) {

									if ( ( ofType ?
										nodeName( node, name ) :
										node.nodeType === 1 ) &&
										++diff ) {

										// Cache the index of each encountered element
										if ( useCache ) {
											outerCache = node[ jQuery.expando ] ||
												( node[ jQuery.expando ] = {} );
											outerCache[ type ] = [ dirruns, diff ];
										}

										if ( node === elem ) {
											break;
										}
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		PSEUDO: function( pseudo, argument ) {

			// pseudo-class names are case-insensitive
			// https://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var fn = jQuery.expr.pseudos[ pseudo ] ||
				jQuery.expr.setFilters[ pseudo.toLowerCase() ] ||
				selectorError( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as jQuery does
			if ( fn[ jQuery.expando ] ) {
				return fn( argument );
			}

			return fn;
		}
	},

	pseudos: {

		// Potentially complex pseudos
		not: markFunction( function( selector ) {

			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrimCSS, "$1" ) );

			return matcher[ jQuery.expando ] ?
				markFunction( function( seed, matches, _context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( ( elem = unmatched[ i ] ) ) {
							seed[ i ] = !( matches[ i ] = elem );
						}
					}
				} ) :
				function( elem, _context, xml ) {
					input[ 0 ] = elem;
					matcher( input, null, xml, results );

					// Don't keep the element
					// (see https://github.com/jquery/sizzle/issues/299)
					input[ 0 ] = null;
					return !results.pop();
				};
		} ),

		has: markFunction( function( selector ) {
			return function( elem ) {
				return find( selector, elem ).length > 0;
			};
		} ),

		contains: markFunction( function( text ) {
			text = unescapeSelector( text );
			return function( elem ) {
				return ( elem.textContent || jQuery.text( elem ) ).indexOf( text ) > -1;
			};
		} ),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// https://www.w3.org/TR/selectors/#lang-pseudo
		lang: markFunction( function( lang ) {

			// lang value must be a valid identifier
			if ( !ridentifier.test( lang || "" ) ) {
				selectorError( "unsupported lang: " + lang );
			}
			lang = unescapeSelector( lang ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( ( elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute( "xml:lang" ) || elem.getAttribute( "lang" ) ) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( ( elem = elem.parentNode ) && elem.nodeType === 1 );
				return false;
			};
		} ),

		// Miscellaneous
		target: function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		root: function( elem ) {
			return elem === documentElement;
		},

		focus: function( elem ) {
			return elem === document.activeElement &&
				document.hasFocus() &&
				!!( elem.type || elem.href || ~elem.tabIndex );
		},

		// Boolean properties
		enabled: createDisabledPseudo( false ),
		disabled: createDisabledPseudo( true ),

		checked: function( elem ) {

			// In CSS3, :checked should return both checked and selected elements
			// https://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			return ( nodeName( elem, "input" ) && !!elem.checked ) ||
				( nodeName( elem, "option" ) && !!elem.selected );
		},

		selected: function( elem ) {

			// Support: IE <=11+
			// Accessing the selectedIndex property
			// forces the browser to treat the default option as
			// selected when in an optgroup.
			if ( isIE && elem.parentNode ) {
				// eslint-disable-next-line no-unused-expressions
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		empty: function( elem ) {

			// https://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		parent: function( elem ) {
			return !jQuery.expr.pseudos.empty( elem );
		},

		// Element/input types
		header: function( elem ) {
			return rheader.test( elem.nodeName );
		},

		input: function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		button: function( elem ) {
			return nodeName( elem, "input" ) && elem.type === "button" ||
				nodeName( elem, "button" );
		},

		text: function( elem ) {
			return nodeName( elem, "input" ) && elem.type === "text";
		},

		// Position-in-collection
		first: createPositionalPseudo( function() {
			return [ 0 ];
		} ),

		last: createPositionalPseudo( function( _matchIndexes, length ) {
			return [ length - 1 ];
		} ),

		eq: createPositionalPseudo( function( _matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		} ),

		even: createPositionalPseudo( function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		} ),

		odd: createPositionalPseudo( function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		} ),

		lt: createPositionalPseudo( function( matchIndexes, length, argument ) {
			var i;

			if ( argument < 0 ) {
				i = argument + length;
			} else if ( argument > length ) {
				i = length;
			} else {
				i = argument;
			}

			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		} ),

		gt: createPositionalPseudo( function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		} )
	}
};

jQuery.expr.pseudos.nth = jQuery.expr.pseudos.eq;

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	jQuery.expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	jQuery.expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = jQuery.expr.pseudos;
jQuery.expr.setFilters = new setFilters();

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		skip = combinator.next,
		key = skip || dir,
		checkNonElements = base && key === "parentNode",
		doneName = done++;

	return combinator.first ?

		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( ( elem = elem[ dir ] ) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
			return false;
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
			if ( xml ) {
				while ( ( elem = elem[ dir ] ) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( ( elem = elem[ dir ] ) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ jQuery.expando ] || ( elem[ jQuery.expando ] = {} );

						if ( skip && nodeName( elem, skip ) ) {
							elem = elem[ dir ] || elem;
						} else if ( ( oldCache = outerCache[ key ] ) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return ( newCache[ 2 ] = oldCache[ 2 ] );
						} else {

							// Reuse newcache so results back-propagate to previous elements
							outerCache[ key ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( ( newCache[ 2 ] = matcher( elem, context, xml ) ) ) {
								return true;
							}
						}
					}
				}
			}
			return false;
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[ i ]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[ 0 ];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		find( selector, contexts[ i ], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( ( elem = unmatched[ i ] ) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ jQuery.expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ jQuery.expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction( function( seed, results, context, xml ) {
		var temp, i, elem, matcherOut,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed ||
				multipleContexts( selector || "*",
					context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems;

		if ( matcher ) {

			// If we have a postFinder, or filtered seed, or non-seed postFilter
			// or preexisting results,
			matcherOut = postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

				// ...intermediate processing is necessary
				[] :

				// ...otherwise use results directly
				results;

			// Find primary matches
			matcher( matcherIn, matcherOut, context, xml );
		} else {
			matcherOut = matcherIn;
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( ( elem = temp[ i ] ) ) {
					matcherOut[ postMap[ i ] ] = !( matcherIn[ postMap[ i ] ] = elem );
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {

					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( ( elem = matcherOut[ i ] ) ) {

							// Restore matcherIn since elem is not yet a final match
							temp.push( ( matcherIn[ i ] = elem ) );
						}
					}
					postFinder( null, ( matcherOut = [] ), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( ( elem = matcherOut[ i ] ) &&
						( temp = postFinder ? indexOf.call( seed, elem ) : preMap[ i ] ) > -1 ) {

						seed[ temp ] = !( results[ temp ] = elem );
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	} );
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = jQuery.expr.relative[ tokens[ 0 ].type ],
		implicitRelative = leadingRelative || jQuery.expr.relative[ " " ],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf.call( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {

			// Support: IE 11+
			// IE sometimes throws a "Permission denied" error when strict-comparing
			// two documents; shallow comparisons work.
			// eslint-disable-next-line eqeqeq
			var ret = ( !leadingRelative && ( xml || context != outermostContext ) ) || (
				( checkContext = context ).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );

			// Avoid hanging onto element
			// (see https://github.com/jquery/sizzle/issues/299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( ( matcher = jQuery.expr.relative[ tokens[ i ].type ] ) ) {
			matchers = [ addCombinator( elementMatcher( matchers ), matcher ) ];
		} else {
			matcher = jQuery.expr.filter[ tokens[ i ].type ].apply( null, tokens[ i ].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ jQuery.expando ] ) {

				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( jQuery.expr.relative[ tokens[ j ].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(

						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 )
							.concat( { value: tokens[ i - 2 ].type === " " ? "*" : "" } )
					).replace( rtrimCSS, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( ( tokens = tokens.slice( j ) ) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,

				// We must always have either seed elements or outermost context
				elems = seed || byElement && jQuery.expr.find.TAG( "*", outermost ),

				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = ( dirruns += contextBackup == null ? 1 : Math.random() || 0.1 );

			if ( outermost ) {

				// Support: IE 11+
				// IE sometimes throws a "Permission denied" error when strict-comparing
				// two documents; shallow comparisons work.
				// eslint-disable-next-line eqeqeq
				outermostContext = context == document || context || outermost;
			}

			// Add elements passing elementMatchers directly to results
			for ( ; ( elem = elems[ i ] ) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;

					// Support: IE 11+
					// IE sometimes throws a "Permission denied" error when strict-comparing
					// two documents; shallow comparisons work.
					// eslint-disable-next-line eqeqeq
					if ( !context && elem.ownerDocument != document ) {
						setDocument( elem );
						xml = !documentIsHTML;
					}
					while ( ( matcher = elementMatchers[ j++ ] ) ) {
						if ( matcher( elem, context || document, xml ) ) {
							push.call( results, elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {

					// They will have gone through all possible matchers
					if ( ( elem = !matcher && elem ) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// `i` is now the count of elements visited above, and adding it to `matchedCount`
			// makes the latter nonnegative.
			matchedCount += i;

			// Apply set filters to unmatched elements
			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
			// no element matchers and no seed.
			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
			// numerically zero.
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( ( matcher = setMatchers[ j++ ] ) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {

					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !( unmatched[ i ] || setMatched[ i ] ) ) {
								setMatched[ i ] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					jQuery.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

function compile( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {

		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[ i ] );
			if ( cached[ jQuery.expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector,
			matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
}

/**
 * A low-level selection function that works with jQuery's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with jQuery selector compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
function select( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( ( selector = compiled.selector || selector ) );

	results = results || [];

	// Try to minimize operations if there is only one selector in the list and no seed
	// (the latter of which guarantees us context)
	if ( match.length === 1 ) {

		// Reduce context if the leading compound selector is an ID
		tokens = match[ 0 ] = match[ 0 ].slice( 0 );
		if ( tokens.length > 2 && ( token = tokens[ 0 ] ).type === "ID" &&
				context.nodeType === 9 && documentIsHTML &&
				jQuery.expr.relative[ tokens[ 1 ].type ] ) {

			context = ( jQuery.expr.find.ID(
				unescapeSelector( token.matches[ 0 ] ),
				context
			) || [] )[ 0 ];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr.needsContext.test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[ i ];

			// Abort if we hit a combinator
			if ( jQuery.expr.relative[ ( type = token.type ) ] ) {
				break;
			}
			if ( ( find = jQuery.expr.find[ type ] ) ) {

				// Search, expanding context for leading sibling combinators
				if ( ( seed = find(
					unescapeSelector( token.matches[ 0 ] ),
					rsibling.test( tokens[ 0 ].type ) &&
						testContext( context.parentNode ) || context
				) ) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
}

// Initialize against the default document
setDocument();

jQuery.find = find;

// These have always been private, but they used to be documented as part of
// Sizzle so let's maintain them for now for backwards compatibility purposes.
find.compile = compile;
find.select = select;
find.setDocument = setDocument;
find.tokenize = tokenize;

function dir( elem, dir, until ) {
	var matched = [],
		truncate = until !== undefined;

	while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
		if ( elem.nodeType === 1 ) {
			if ( truncate && jQuery( elem ).is( until ) ) {
				break;
			}
			matched.push( elem );
		}
	}
	return matched;
}

function siblings( n, elem ) {
	var matched = [];

	for ( ; n; n = n.nextSibling ) {
		if ( n.nodeType === 1 && n !== elem ) {
			matched.push( n );
		}
	}

	return matched;
}

var rneedsContext = jQuery.expr.match.needsContext;

// rsingleTag matches a string consisting of a single HTML element with no attributes
// and captures the element's name
var rsingleTag = /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;

function isObviousHtml( input ) {
	return input[ 0 ] === "<" &&
		input[ input.length - 1 ] === ">" &&
		input.length >= 3;
}

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( typeof qualifier === "function" ) {
		return jQuery.grep( elements, function( elem, i ) {
			return !!qualifier.call( elem, i, elem ) !== not;
		} );
	}

	// Single element
	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		} );
	}

	// Arraylike of elements (jQuery, arguments, Array)
	if ( typeof qualifier !== "string" ) {
		return jQuery.grep( elements, function( elem ) {
			return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
		} );
	}

	// Filtered directly for both simple and complex selectors
	return jQuery.filter( qualifier, elements, not );
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	if ( elems.length === 1 && elem.nodeType === 1 ) {
		return jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [];
	}

	return jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
		return elem.nodeType === 1;
	} ) );
};

jQuery.fn.extend( {
	find: function( selector ) {
		var i, ret,
			len = this.length,
			self = this;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter( function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			} ) );
		}

		ret = this.pushStack( [] );

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		return len > 1 ? jQuery.uniqueSort( ret ) : ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow( this, selector || [], false ) );
	},
	not: function( selector ) {
		return this.pushStack( winnow( this, selector || [], true ) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
} );

// Initialize a jQuery object

// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (trac-9521)
	// Strict HTML recognition (trac-11290: must start with <)
	// Shortcut simple #id case for speed
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,

	init = jQuery.fn.init = function( selector, context ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// HANDLE: $(DOMElement)
		if ( selector.nodeType ) {
			this[ 0 ] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( typeof selector === "function" ) {
			return rootjQuery.ready !== undefined ?
				rootjQuery.ready( selector ) :

				// Execute immediately if ready is not present
				selector( jQuery );

		} else {

			// Handle obvious HTML strings
			match = selector + "";
			if ( isObviousHtml( match ) ) {

				// Assume that strings that start and end with <> are HTML and skip
				// the regex check. This also handles browser-supported HTML wrappers
				// like TrustedHTML.
				match = [ null, selector, null ];

			// Handle HTML strings or selectors
			} else if ( typeof selector === "string" ) {
				match = rquickExpr.exec( selector );
			} else {
				return jQuery.makeArray( selector, this );
			}

			// Match html or make sure no context is specified for #id
			// Note: match[1] may be a string or a TrustedHTML wrapper
			if ( match && ( match[ 1 ] || !context ) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[ 1 ] ) {
					context = context instanceof jQuery ? context[ 0 ] : context;

					// Option to run scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[ 1 ],
						context && context.nodeType ? context.ownerDocument || context : document$1,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {

							// Properties of context are called as methods if possible
							if ( typeof this[ match ] === "function" ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document$1.getElementById( match[ 2 ] );

					if ( elem ) {

						// Inject the element directly into the jQuery object
						this[ 0 ] = elem;
						this.length = 1;
					}
					return this;
				}

			// HANDLE: $(expr) & $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}
		}

	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document$1 );

var rparentsprev = /^(?:parents|prev(?:Until|All))/,

	// Methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend( {
	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter( function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( jQuery.contains( this, targets[ i ] ) ) {
					return true;
				}
			}
		} );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			targets = typeof selectors !== "string" && jQuery( selectors );

		// Positional selectors never match, since there's no _selection_ context
		if ( !rneedsContext.test( selectors ) ) {
			for ( ; i < l; i++ ) {
				for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

					// Always skip document fragments
					if ( cur.nodeType < 11 && ( targets ?
						targets.index( cur ) > -1 :

						// Don't pass non-elements to jQuery#find
						cur.nodeType === 1 &&
							jQuery.find.matchesSelector( cur, selectors ) ) ) {

						matched.push( cur );
						break;
					}
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
	},

	// Determine the position of an element within the set
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// Index in selector
		if ( typeof elem === "string" ) {
			return indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.uniqueSort(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	}
} );

function sibling( cur, dir ) {
	while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
	return cur;
}

jQuery.each( {
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, _i, until ) {
		return dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, _i, until ) {
		return dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, _i, until ) {
		return dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return siblings( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return siblings( elem.firstChild );
	},
	contents: function( elem ) {
		if ( elem.contentDocument != null &&

			// Support: IE 11+
			// <object> elements with no `data` attribute has an object
			// `contentDocument` with a `null` prototype.
			getProto( elem.contentDocument ) ) {

			return elem.contentDocument;
		}

		// Support: IE 9 - 11+
		// Treat the template element as a regular one in browsers that
		// don't support it.
		if ( nodeName( elem, "template" ) ) {
			elem = elem.content || elem;
		}

		return jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {

			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.uniqueSort( matched );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
} );

// Convert String-formatted options into Object-formatted ones
function createOptions( options ) {
	var object = {};
	jQuery.each( options.match( rnothtmlwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	} );
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		createOptions( options ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,

		// Last fire value for non-forgettable lists
		memory,

		// Flag to know if list was already fired
		fired,

		// Flag to prevent firing
		locked,

		// Actual callback list
		list = [],

		// Queue of execution data for repeatable lists
		queue = [],

		// Index of currently firing callback (modified by add/remove as needed)
		firingIndex = -1,

		// Fire callbacks
		fire = function() {

			// Enforce single-firing
			locked = locked || options.once;

			// Execute callbacks for all pending executions,
			// respecting firingIndex overrides and runtime changes
			fired = firing = true;
			for ( ; queue.length; firingIndex = -1 ) {
				memory = queue.shift();
				while ( ++firingIndex < list.length ) {

					// Run callback and check for early termination
					if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
						options.stopOnFalse ) {

						// Jump to end and forget the data so .add doesn't re-fire
						firingIndex = list.length;
						memory = false;
					}
				}
			}

			// Forget the data if we're done with it
			if ( !options.memory ) {
				memory = false;
			}

			firing = false;

			// Clean up if we're done firing for good
			if ( locked ) {

				// Keep an empty list if we have data for future add calls
				if ( memory ) {
					list = [];

				// Otherwise, this object is spent
				} else {
					list = "";
				}
			}
		},

		// Actual Callbacks object
		self = {

			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {

					// If we have memory from a past run, we should fire after adding
					if ( memory && !firing ) {
						firingIndex = list.length - 1;
						queue.push( memory );
					}

					( function add( args ) {
						jQuery.each( args, function( _, arg ) {
							if ( typeof arg === "function" ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && toType( arg ) !== "string" ) {

								// Inspect recursively
								add( arg );
							}
						} );
					} )( arguments );

					if ( memory && !firing ) {
						fire();
					}
				}
				return this;
			},

			// Remove a callback from the list
			remove: function() {
				jQuery.each( arguments, function( _, arg ) {
					var index;
					while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
						list.splice( index, 1 );

						// Handle firing indexes
						if ( index <= firingIndex ) {
							firingIndex--;
						}
					}
				} );
				return this;
			},

			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ?
					jQuery.inArray( fn, list ) > -1 :
					list.length > 0;
			},

			// Remove all callbacks from the list
			empty: function() {
				if ( list ) {
					list = [];
				}
				return this;
			},

			// Disable .fire and .add
			// Abort any current/pending executions
			// Clear all callbacks and values
			disable: function() {
				locked = queue = [];
				list = memory = "";
				return this;
			},
			disabled: function() {
				return !list;
			},

			// Disable .fire
			// Also disable .add unless we have memory (since it would have no effect)
			// Abort any pending executions
			lock: function() {
				locked = queue = [];
				if ( !memory && !firing ) {
					list = memory = "";
				}
				return this;
			},
			locked: function() {
				return !!locked;
			},

			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( !locked ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					queue.push( args );
					if ( !firing ) {
						fire();
					}
				}
				return this;
			},

			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},

			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};

function Identity( v ) {
	return v;
}
function Thrower( ex ) {
	throw ex;
}

function adoptValue( value, resolve, reject, noValue ) {
	var method;

	try {

		// Check for promise aspect first to privilege synchronous behavior
		if ( value && typeof( method = value.promise ) === "function" ) {
			method.call( value ).done( resolve ).fail( reject );

		// Other thenables
		} else if ( value && typeof( method = value.then ) === "function" ) {
			method.call( value, resolve, reject );

		// Other non-thenables
		} else {

			// Control `resolve` arguments by letting Array#slice cast boolean `noValue` to integer:
			// * false: [ value ].slice( 0 ) => resolve( value )
			// * true: [ value ].slice( 1 ) => resolve()
			resolve.apply( undefined, [ value ].slice( noValue ) );
		}

	// For Promises/A+, convert exceptions into rejections
	// Since jQuery.when doesn't unwrap thenables, we can skip the extra checks appearing in
	// Deferred#then to conditionally suppress rejection.
	} catch ( value ) {
		reject( value );
	}
}

jQuery.extend( {

	Deferred: function( func ) {
		var tuples = [

				// action, add listener, callbacks,
				// ... .then handlers, argument index, [final state]
				[ "notify", "progress", jQuery.Callbacks( "memory" ),
					jQuery.Callbacks( "memory" ), 2 ],
				[ "resolve", "done", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 0, "resolved" ],
				[ "reject", "fail", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 1, "rejected" ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				catch: function( fn ) {
					return promise.then( null, fn );
				},

				// Keep pipe for back-compat
				pipe: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;

					return jQuery.Deferred( function( newDefer ) {
						jQuery.each( tuples, function( _i, tuple ) {

							// Map tuples (progress, done, fail) to arguments (done, fail, progress)
							var fn = typeof fns[ tuple[ 4 ] ] === "function" &&
								fns[ tuple[ 4 ] ];

							// deferred.progress(function() { bind to newDefer or newDefer.notify })
							// deferred.done(function() { bind to newDefer or newDefer.resolve })
							// deferred.fail(function() { bind to newDefer or newDefer.reject })
							deferred[ tuple[ 1 ] ]( function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && typeof returned.promise === "function" ) {
									returned.promise()
										.progress( newDefer.notify )
										.done( newDefer.resolve )
										.fail( newDefer.reject );
								} else {
									newDefer[ tuple[ 0 ] + "With" ](
										this,
										fn ? [ returned ] : arguments
									);
								}
							} );
						} );
						fns = null;
					} ).promise();
				},
				then: function( onFulfilled, onRejected, onProgress ) {
					var maxDepth = 0;
					function resolve( depth, deferred, handler, special ) {
						return function() {
							var that = this,
								args = arguments,
								mightThrow = function() {
									var returned, then;

									// Support: Promises/A+ section 2.3.3.3.3
									// https://promisesaplus.com/#point-59
									// Ignore double-resolution attempts
									if ( depth < maxDepth ) {
										return;
									}

									returned = handler.apply( that, args );

									// Support: Promises/A+ section 2.3.1
									// https://promisesaplus.com/#point-48
									if ( returned === deferred.promise() ) {
										throw new TypeError( "Thenable self-resolution" );
									}

									// Support: Promises/A+ sections 2.3.3.1, 3.5
									// https://promisesaplus.com/#point-54
									// https://promisesaplus.com/#point-75
									// Retrieve `then` only once
									then = returned &&

										// Support: Promises/A+ section 2.3.4
										// https://promisesaplus.com/#point-64
										// Only check objects and functions for thenability
										( typeof returned === "object" ||
											typeof returned === "function" ) &&
										returned.then;

									// Handle a returned thenable
									if ( typeof then === "function" ) {

										// Special processors (notify) just wait for resolution
										if ( special ) {
											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special )
											);

										// Normal processors (resolve) also hook into progress
										} else {

											// ...and disregard older resolution values
											maxDepth++;

											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special ),
												resolve( maxDepth, deferred, Identity,
													deferred.notifyWith )
											);
										}

									// Handle all other returned values
									} else {

										// Only substitute handlers pass on context
										// and multiple values (non-spec behavior)
										if ( handler !== Identity ) {
											that = undefined;
											args = [ returned ];
										}

										// Process the value(s)
										// Default process is resolve
										( special || deferred.resolveWith )( that, args );
									}
								},

								// Only normal processors (resolve) catch and reject exceptions
								process = special ?
									mightThrow :
									function() {
										try {
											mightThrow();
										} catch ( e ) {

											if ( jQuery.Deferred.exceptionHook ) {
												jQuery.Deferred.exceptionHook( e,
													process.error );
											}

											// Support: Promises/A+ section 2.3.3.3.4.1
											// https://promisesaplus.com/#point-61
											// Ignore post-resolution exceptions
											if ( depth + 1 >= maxDepth ) {

												// Only substitute handlers pass on context
												// and multiple values (non-spec behavior)
												if ( handler !== Thrower ) {
													that = undefined;
													args = [ e ];
												}

												deferred.rejectWith( that, args );
											}
										}
									};

							// Support: Promises/A+ section 2.3.3.3.1
							// https://promisesaplus.com/#point-57
							// Re-resolve promises immediately to dodge false rejection from
							// subsequent errors
							if ( depth ) {
								process();
							} else {

								// Call an optional hook to record the error, in case of exception
								// since it's otherwise lost when execution goes async
								if ( jQuery.Deferred.getErrorHook ) {
									process.error = jQuery.Deferred.getErrorHook();
								}
								window.setTimeout( process );
							}
						};
					}

					return jQuery.Deferred( function( newDefer ) {

						// progress_handlers.add( ... )
						tuples[ 0 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								typeof onProgress === "function" ?
									onProgress :
									Identity,
								newDefer.notifyWith
							)
						);

						// fulfilled_handlers.add( ... )
						tuples[ 1 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								typeof onFulfilled === "function" ?
									onFulfilled :
									Identity
							)
						);

						// rejected_handlers.add( ... )
						tuples[ 2 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								typeof onRejected === "function" ?
									onRejected :
									Thrower
							)
						);
					} ).promise();
				},

				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 5 ];

			// promise.progress = list.add
			// promise.done = list.add
			// promise.fail = list.add
			promise[ tuple[ 1 ] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(
					function() {

						// state = "resolved" (i.e., fulfilled)
						// state = "rejected"
						state = stateString;
					},

					// rejected_callbacks.disable
					// fulfilled_callbacks.disable
					tuples[ 3 - i ][ 2 ].disable,

					// rejected_handlers.disable
					// fulfilled_handlers.disable
					tuples[ 3 - i ][ 3 ].disable,

					// progress_callbacks.lock
					tuples[ 0 ][ 2 ].lock,

					// progress_handlers.lock
					tuples[ 0 ][ 3 ].lock
				);
			}

			// progress_handlers.fire
			// fulfilled_handlers.fire
			// rejected_handlers.fire
			list.add( tuple[ 3 ].fire );

			// deferred.notify = function() { deferred.notifyWith(...) }
			// deferred.resolve = function() { deferred.resolveWith(...) }
			// deferred.reject = function() { deferred.rejectWith(...) }
			deferred[ tuple[ 0 ] ] = function() {
				deferred[ tuple[ 0 ] + "With" ]( this === deferred ? undefined : this, arguments );
				return this;
			};

			// deferred.notifyWith = list.fireWith
			// deferred.resolveWith = list.fireWith
			// deferred.rejectWith = list.fireWith
			deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
		} );

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( singleValue ) {
		var

			// count of uncompleted subordinates
			remaining = arguments.length,

			// count of unprocessed arguments
			i = remaining,

			// subordinate fulfillment data
			resolveContexts = Array( i ),
			resolveValues = slice.call( arguments ),

			// the primary Deferred
			primary = jQuery.Deferred(),

			// subordinate callback factory
			updateFunc = function( i ) {
				return function( value ) {
					resolveContexts[ i ] = this;
					resolveValues[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( !( --remaining ) ) {
						primary.resolveWith( resolveContexts, resolveValues );
					}
				};
			};

		// Single- and empty arguments are adopted like Promise.resolve
		if ( remaining <= 1 ) {
			adoptValue( singleValue, primary.done( updateFunc( i ) ).resolve, primary.reject,
				!remaining );

			// Use .then() to unwrap secondary thenables (cf. gh-3000)
			if ( primary.state() === "pending" ||
				typeof( resolveValues[ i ] && resolveValues[ i ].then ) === "function" ) {

				return primary.then();
			}
		}

		// Multiple arguments are aggregated like Promise.all array elements
		while ( i-- ) {
			adoptValue( resolveValues[ i ], updateFunc( i ), primary.reject );
		}

		return primary.promise();
	}
} );

// These usually indicate a programmer mistake during development,
// warn about them ASAP rather than swallowing them by default.
var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;

// If `jQuery.Deferred.getErrorHook` is defined, `asyncError` is an error
// captured before the async barrier to get the original error cause
// which may otherwise be hidden.
jQuery.Deferred.exceptionHook = function( error, asyncError ) {

	if ( error && rerrorNames.test( error.name ) ) {
		window.console.warn(
			"jQuery.Deferred exception",
			error,
			asyncError
		);
	}
};

jQuery.readyException = function( error ) {
	window.setTimeout( function() {
		throw error;
	} );
};

// The deferred used on DOM ready
var readyList = jQuery.Deferred();

jQuery.fn.ready = function( fn ) {

	readyList
		.then( fn )

		// Wrap jQuery.readyException in a function so that the lookup
		// happens at the time of error handling instead of callback
		// registration.
		.catch( function( error ) {
			jQuery.readyException( error );
		} );

	return this;
};

jQuery.extend( {

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See trac-6781
	readyWait: 1,

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document$1, [ jQuery ] );
	}
} );

jQuery.ready.then = readyList.then;

// The ready event handler and self cleanup method
function completed() {
	document$1.removeEventListener( "DOMContentLoaded", completed );
	window.removeEventListener( "load", completed );
	jQuery.ready();
}

// Catch cases where $(document).ready() is called
// after the browser event has already occurred.
if ( document$1.readyState !== "loading" ) {

	// Handle it asynchronously to allow scripts the opportunity to delay ready
	window.setTimeout( jQuery.ready );

} else {

	// Use the handy event callback
	document$1.addEventListener( "DOMContentLoaded", completed );

	// A fallback to window.onload, that will always work
	window.addEventListener( "load", completed );
}

// Matches dashed string for camelizing
var rdashAlpha = /-([a-z])/g;

// Used by camelCase as callback to replace()
function fcamelCase( _all, letter ) {
	return letter.toUpperCase();
}

// Convert dashed to camelCase
function camelCase( string ) {
	return string.replace( rdashAlpha, fcamelCase );
}

/**
 * Determines whether an object can have data
 */
function acceptData( owner ) {

	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
}

function Data() {
	this.expando = jQuery.expando + Data.uid++;
}

Data.uid = 1;

Data.prototype = {

	cache: function( owner ) {

		// Check if the owner object already has a cache
		var value = owner[ this.expando ];

		// If not, create one
		if ( !value ) {
			value = Object.create( null );

			// We can accept data for non-element nodes in modern browsers,
			// but we should not, see trac-8335.
			// Always return an empty object.
			if ( acceptData( owner ) ) {

				// If it is a node unlikely to be stringify-ed or looped over
				// use plain assignment
				if ( owner.nodeType ) {
					owner[ this.expando ] = value;

				// Otherwise secure it in a non-enumerable property
				// configurable must be true to allow the property to be
				// deleted when data is removed
				} else {
					Object.defineProperty( owner, this.expando, {
						value: value,
						configurable: true
					} );
				}
			}
		}

		return value;
	},
	set: function( owner, data, value ) {
		var prop,
			cache = this.cache( owner );

		// Handle: [ owner, key, value ] args
		// Always use camelCase key (gh-2257)
		if ( typeof data === "string" ) {
			cache[ camelCase( data ) ] = value;

		// Handle: [ owner, { properties } ] args
		} else {

			// Copy the properties one-by-one to the cache object
			for ( prop in data ) {
				cache[ camelCase( prop ) ] = data[ prop ];
			}
		}
		return value;
	},
	get: function( owner, key ) {
		return key === undefined ?
			this.cache( owner ) :

			// Always use camelCase key (gh-2257)
			owner[ this.expando ] && owner[ this.expando ][ camelCase( key ) ];
	},
	access: function( owner, key, value ) {

		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				( ( key && typeof key === "string" ) && value === undefined ) ) {

			return this.get( owner, key );
		}

		// When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i,
			cache = owner[ this.expando ];

		if ( cache === undefined ) {
			return;
		}

		if ( key !== undefined ) {

			// Support array or space separated string of keys
			if ( Array.isArray( key ) ) {

				// If key is an array of keys...
				// We always set camelCase keys, so remove that.
				key = key.map( camelCase );
			} else {
				key = camelCase( key );

				// If a key with the spaces exists, use it.
				// Otherwise, create an array by matching non-whitespace
				key = key in cache ?
					[ key ] :
					( key.match( rnothtmlwhite ) || [] );
			}

			i = key.length;

			while ( i-- ) {
				delete cache[ key[ i ] ];
			}
		}

		// Remove the expando if there's no more data
		if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

			// Support: Chrome <=35 - 45+
			// Webkit & Blink performance suffers when deleting properties
			// from DOM nodes, so set to undefined instead
			// https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
			if ( owner.nodeType ) {
				owner[ this.expando ] = undefined;
			} else {
				delete owner[ this.expando ];
			}
		}
	},
	hasData: function( owner ) {
		var cache = owner[ this.expando ];
		return cache !== undefined && !jQuery.isEmptyObject( cache );
	}
};

var dataPriv = new Data();

var dataUser = new Data();

//	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /[A-Z]/g;

function getData( data ) {
	if ( data === "true" ) {
		return true;
	}

	if ( data === "false" ) {
		return false;
	}

	if ( data === "null" ) {
		return null;
	}

	// Only convert to a number if it doesn't change the string
	if ( data === +data + "" ) {
		return +data;
	}

	if ( rbrace.test( data ) ) {
		return JSON.parse( data );
	}

	return data;
}

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = getData( data );
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
			dataUser.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}

jQuery.extend( {
	hasData: function( elem ) {
		return dataUser.hasData( elem ) || dataPriv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return dataUser.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		dataUser.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to dataPriv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return dataPriv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		dataPriv.remove( elem, name );
	}
} );

jQuery.fn.extend( {
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = dataUser.get( elem );

				if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE 11+
						// The attrs elements can be null (trac-14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = camelCase( name.slice( 5 ) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					dataPriv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each( function() {
				dataUser.set( this, key );
			} );
		}

		return access( this, function( value ) {
			var data;

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {

				// Attempt to get data from the cache
				// The key will always be camelCased in Data
				data = dataUser.get( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			this.each( function() {

				// We always store the camelCased key
				dataUser.set( this, key, value );
			} );
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each( function() {
			dataUser.remove( this, key );
		} );
	}
} );

jQuery.extend( {
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = dataPriv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || Array.isArray( data ) ) {
					queue = dataPriv.set( elem, type, jQuery.makeArray( data ) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// Clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// Not public - generate a queueHooks object, or return the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return dataPriv.get( elem, key ) || dataPriv.set( elem, key, {
			empty: jQuery.Callbacks( "once memory" ).add( function() {
				dataPriv.remove( elem, [ type + "queue", key ] );
			} )
		} );
	}
} );

jQuery.fn.extend( {
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[ 0 ], type );
		}

		return data === undefined ?
			this :
			this.each( function() {
				var queue = jQuery.queue( this, type, data );

				// Ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			} );
	},
	dequeue: function( type ) {
		return this.each( function() {
			jQuery.dequeue( this, type );
		} );
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},

	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
} );

var pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;

var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );

var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

// isHiddenWithinTree reports if an element has a non-"none" display style (inline and/or
// through the CSS cascade), which is useful in deciding whether or not to make it visible.
// It differs from the :hidden selector (jQuery.expr.pseudos.hidden) in two important ways:
// * A hidden ancestor does not force an element to be classified as hidden.
// * Being disconnected from the document does not force an element to be classified as hidden.
// These differences improve the behavior of .toggle() et al. when applied to elements that are
// detached or contained within hidden ancestors (gh-2404, gh-2863).
function isHiddenWithinTree( elem, el ) {

	// isHiddenWithinTree might be called from jQuery#filter function;
	// in that case, element will be second argument
	elem = el || elem;

	// Inline style trumps all
	return elem.style.display === "none" ||
		elem.style.display === "" &&
		jQuery.css( elem, "display" ) === "none";
}

var ralphaStart = /^[a-z]/,

	// The regex visualized:
	//
	//                         /----------\
	//                        |            |    /-------\
	//                        |  / Top  \  |   |         |
	//         /--- Border ---+-| Right  |-+---+- Width -+---\
	//        |                 | Bottom |                    |
	//        |                  \ Left /                     |
	//        |                                               |
	//        |                              /----------\     |
	//        |          /-------------\    |            |    |- END
	//        |         |               |   |  / Top  \  |    |
	//        |         |  / Margin  \  |   | | Right  | |    |
	//        |---------+-|           |-+---+-| Bottom |-+----|
	//        |            \ Padding /         \ Left /       |
	// BEGIN -|                                               |
	//        |                /---------\                    |
	//        |               |           |                   |
	//        |               |  / Min \  |    / Width  \     |
	//         \--------------+-|       |-+---|          |---/
	//                           \ Max /       \ Height /
	rautoPx = /^(?:Border(?:Top|Right|Bottom|Left)?(?:Width|)|(?:Margin|Padding)?(?:Top|Right|Bottom|Left)?|(?:Min|Max)?(?:Width|Height))$/;

function isAutoPx( prop ) {

	// The first test is used to ensure that:
	// 1. The prop starts with a lowercase letter (as we uppercase it for the second regex).
	// 2. The prop is not empty.
	return ralphaStart.test( prop ) &&
		rautoPx.test( prop[ 0 ].toUpperCase() + prop.slice( 1 ) );
}

function adjustCSS( elem, prop, valueParts, tween ) {
	var adjusted, scale,
		maxIterations = 20,
		currentValue = tween ?
			function() {
				return tween.cur();
			} :
			function() {
				return jQuery.css( elem, prop, "" );
			},
		initial = currentValue(),
		unit = valueParts && valueParts[ 3 ] || ( isAutoPx( prop ) ? "px" : "" ),

		// Starting value computation is required for potential unit mismatches
		initialInUnit = elem.nodeType &&
			( !isAutoPx( prop ) || unit !== "px" && +initial ) &&
			rcssNum.exec( jQuery.css( elem, prop ) );

	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

		// Support: Firefox <=54 - 66+
		// Halve the iteration target value to prevent interference from CSS upper bounds (gh-2144)
		initial = initial / 2;

		// Trust units reported by jQuery.css
		unit = unit || initialInUnit[ 3 ];

		// Iteratively approximate from a nonzero starting point
		initialInUnit = +initial || 1;

		while ( maxIterations-- ) {

			// Evaluate and update our best guess (doubling guesses that zero out).
			// Finish if the scale equals or crosses 1 (making the old*new product non-positive).
			jQuery.style( elem, prop, initialInUnit + unit );
			if ( ( 1 - scale ) * ( 1 - ( scale = currentValue() / initial || 0.5 ) ) <= 0 ) {
				maxIterations = 0;
			}
			initialInUnit = initialInUnit / scale;

		}

		initialInUnit = initialInUnit * 2;
		jQuery.style( elem, prop, initialInUnit + unit );

		// Make sure we update the tween properties later on
		valueParts = valueParts || [];
	}

	if ( valueParts ) {
		initialInUnit = +initialInUnit || +initial || 0;

		// Apply relative offset (+=/-=) if specified
		adjusted = valueParts[ 1 ] ?
			initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
			+valueParts[ 2 ];
		if ( tween ) {
			tween.unit = unit;
			tween.start = initialInUnit;
			tween.end = adjusted;
		}
	}
	return adjusted;
}

// Matches dashed string for camelizing
var rmsPrefix = /^-ms-/;

// Convert dashed to camelCase, handle vendor prefixes.
// Used by the css & effects modules.
// Support: IE <=9 - 11+
// Microsoft forgot to hump their vendor prefix (trac-9572)
function cssCamelCase( string ) {
	return camelCase( string.replace( rmsPrefix, "ms-" ) );
}

var defaultDisplayMap = {};

function getDefaultDisplay( elem ) {
	var temp,
		doc = elem.ownerDocument,
		nodeName = elem.nodeName,
		display = defaultDisplayMap[ nodeName ];

	if ( display ) {
		return display;
	}

	temp = doc.body.appendChild( doc.createElement( nodeName ) );
	display = jQuery.css( temp, "display" );

	temp.parentNode.removeChild( temp );

	if ( display === "none" ) {
		display = "block";
	}
	defaultDisplayMap[ nodeName ] = display;

	return display;
}

function showHide( elements, show ) {
	var display, elem,
		values = [],
		index = 0,
		length = elements.length;

	// Determine new display value for elements that need to change
	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		display = elem.style.display;
		if ( show ) {

			// Since we force visibility upon cascade-hidden elements, an immediate (and slow)
			// check is required in this first loop unless we have a nonempty display value (either
			// inline or about-to-be-restored)
			if ( display === "none" ) {
				values[ index ] = dataPriv.get( elem, "display" ) || null;
				if ( !values[ index ] ) {
					elem.style.display = "";
				}
			}
			if ( elem.style.display === "" && isHiddenWithinTree( elem ) ) {
				values[ index ] = getDefaultDisplay( elem );
			}
		} else {
			if ( display !== "none" ) {
				values[ index ] = "none";

				// Remember what we're overwriting
				dataPriv.set( elem, "display", display );
			}
		}
	}

	// Set the display of the elements in a second loop to avoid constant reflow
	for ( index = 0; index < length; index++ ) {
		if ( values[ index ] != null ) {
			elements[ index ].style.display = values[ index ];
		}
	}

	return elements;
}

jQuery.fn.extend( {
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each( function() {
			if ( isHiddenWithinTree( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		} );
	}
} );

var isAttached = function( elem ) {
		return jQuery.contains( elem.ownerDocument, elem ) ||
			elem.getRootNode( composed ) === elem.ownerDocument;
	},
	composed = { composed: true };

// Support: IE 9 - 11+
// Check attachment across shadow DOM boundaries when possible (gh-3504).
// Provide a fallback for browsers without Shadow DOM v1 support.
if ( !documentElement$1.getRootNode ) {
	isAttached = function( elem ) {
		return jQuery.contains( elem.ownerDocument, elem );
	};
}

// rtagName captures the name from the first start tag in a string of HTML
// https://html.spec.whatwg.org/multipage/syntax.html#tag-open-state
// https://html.spec.whatwg.org/multipage/syntax.html#tag-name-state
var rtagName = /<([a-z][^\/\0>\x20\t\r\n\f]*)/i;

var wrapMap = {

	// Table parts need to be wrapped with `<table>` or they're
	// stripped to their contents when put in a div.
	// XHTML parsers do not magically insert elements in the
	// same way that tag soup parsers do, so we cannot shorten
	// this by omitting <tbody> or other required elements.
	thead: [ "table" ],
	col: [ "colgroup", "table" ],
	tr: [ "tbody", "table" ],
	td: [ "tr", "tbody", "table" ]
};

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

function getAll( context, tag ) {

	// Support: IE <=9 - 11+
	// Use typeof to avoid zero-argument method invocation on host objects (trac-15151)
	var ret;

	if ( typeof context.getElementsByTagName !== "undefined" ) {

		// Use slice to snapshot the live collection from gEBTN
		ret = arr.slice.call( context.getElementsByTagName( tag || "*" ) );

	} else if ( typeof context.querySelectorAll !== "undefined" ) {
		ret = context.querySelectorAll( tag || "*" );

	} else {
		ret = [];
	}

	if ( tag === undefined || tag && nodeName( context, tag ) ) {
		return jQuery.merge( [ context ], ret );
	}

	return ret;
}

var rscriptType = /^$|^module$|\/(?:java|ecma)script/i;

// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		dataPriv.set(
			elems[ i ],
			"globalEval",
			!refElements || dataPriv.get( refElements[ i ], "globalEval" )
		);
	}
}

var rhtml = /<|&#?\w+;/;

function buildFragment( elems, context, scripts, selection, ignored ) {
	var elem, tmp, tag, wrap, attached, j,
		fragment = context.createDocumentFragment(),
		nodes = [],
		i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		elem = elems[ i ];

		if ( elem || elem === 0 ) {

			// Add nodes directly
			if ( toType( elem ) === "object" && ( elem.nodeType || isArrayLike( elem ) ) ) {
				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

			// Convert non-html into a text node
			} else if ( !rhtml.test( elem ) ) {
				nodes.push( context.createTextNode( elem ) );

			// Convert html into DOM nodes
			} else {
				tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

				// Deserialize a standard representation
				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
				wrap = wrapMap[ tag ] || arr;

				// Create wrappers & descend into them.
				j = wrap.length;
				while ( --j > -1 ) {
					tmp = tmp.appendChild( context.createElement( wrap[ j ] ) );
				}

				tmp.innerHTML = jQuery.htmlPrefilter( elem );

				jQuery.merge( nodes, tmp.childNodes );

				// Remember the top-level container
				tmp = fragment.firstChild;

				// Ensure the created nodes are orphaned (trac-12392)
				tmp.textContent = "";
			}
		}
	}

	// Remove wrapper from fragment
	fragment.textContent = "";

	i = 0;
	while ( ( elem = nodes[ i++ ] ) ) {

		// Skip elements already in the context collection (trac-4087)
		if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
			if ( ignored ) {
				ignored.push( elem );
			}
			continue;
		}

		attached = isAttached( elem );

		// Append to fragment
		tmp = getAll( fragment.appendChild( elem ), "script" );

		// Preserve script evaluation history
		if ( attached ) {
			setGlobalEval( tmp );
		}

		// Capture executables
		if ( scripts ) {
			j = 0;
			while ( ( elem = tmp[ j++ ] ) ) {
				if ( rscriptType.test( elem.type || "" ) ) {
					scripts.push( elem );
				}
			}
		}
	}

	return fragment;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	if ( ( elem.type || "" ).slice( 0, 5 ) === "true/" ) {
		elem.type = elem.type.slice( 5 );
	} else {
		elem.removeAttribute( "type" );
	}

	return elem;
}

function domManip( collection, args, callback, ignored ) {

	// Flatten any nested arrays
	args = flat( args );

	var fragment, first, scripts, hasScripts, node, doc,
		i = 0,
		l = collection.length,
		iNoClone = l - 1,
		value = args[ 0 ],
		valueIsFunction = typeof value === "function";

	if ( valueIsFunction ) {
		return collection.each( function( index ) {
			var self = collection.eq( index );
			args[ 0 ] = value.call( this, index, self.html() );
			domManip( self, args, callback, ignored );
		} );
	}

	if ( l ) {
		fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
		first = fragment.firstChild;

		if ( fragment.childNodes.length === 1 ) {
			fragment = first;
		}

		// Require either new content or an interest in ignored elements to invoke the callback
		if ( first || ignored ) {
			scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
			hasScripts = scripts.length;

			// Use the original fragment for the last item
			// instead of the first because it can end up
			// being emptied incorrectly in certain situations (trac-8070).
			for ( ; i < l; i++ ) {
				node = fragment;

				if ( i !== iNoClone ) {
					node = jQuery.clone( node, true, true );

					// Keep references to cloned scripts for later restoration
					if ( hasScripts ) {
						jQuery.merge( scripts, getAll( node, "script" ) );
					}
				}

				callback.call( collection[ i ], node, i );
			}

			if ( hasScripts ) {
				doc = scripts[ scripts.length - 1 ].ownerDocument;

				// Re-enable scripts
				jQuery.map( scripts, restoreScript );

				// Evaluate executable scripts on first document insertion
				for ( i = 0; i < hasScripts; i++ ) {
					node = scripts[ i ];
					if ( rscriptType.test( node.type || "" ) &&
						!dataPriv.get( node, "globalEval" ) &&
						jQuery.contains( doc, node ) ) {

						if ( node.src && ( node.type || "" ).toLowerCase()  !== "module" ) {

							// Optional AJAX dependency, but won't run scripts if not present
							if ( jQuery._evalUrl && !node.noModule ) {
								jQuery._evalUrl( node.src, {
									nonce: node.nonce,
									crossOrigin: node.crossOrigin
								}, doc );
							}
						} else {
							DOMEval( node.textContent, node, doc );
						}
					}
				}
			}
		}
	}

	return collection;
}

var rcheckableType = /^(?:checkbox|radio)$/i;

var rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

function on( elem, types, selector, data, fn, one ) {
	var origFn, type;

	// Types can be a map of types/handlers
	if ( typeof types === "object" ) {

		// ( types-Object, selector, data )
		if ( typeof selector !== "string" ) {

			// ( types-Object, data )
			data = data || selector;
			selector = undefined;
		}
		for ( type in types ) {
			on( elem, type, selector, data, types[ type ], one );
		}
		return elem;
	}

	if ( data == null && fn == null ) {

		// ( types, fn )
		fn = selector;
		data = selector = undefined;
	} else if ( fn == null ) {
		if ( typeof selector === "string" ) {

			// ( types, selector, fn )
			fn = data;
			data = undefined;
		} else {

			// ( types, data, fn )
			fn = data;
			data = selector;
			selector = undefined;
		}
	}
	if ( fn === false ) {
		fn = returnFalse;
	} else if ( !fn ) {
		return elem;
	}

	if ( one === 1 ) {
		origFn = fn;
		fn = function( event ) {

			// Can use an empty set, since event contains the info
			jQuery().off( event );
			return origFn.apply( this, arguments );
		};

		// Use same guid so caller can remove using origFn
		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
	}
	return elem.each( function() {
		jQuery.event.add( this, types, fn, data, selector );
	} );
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.get( elem );

		// Only attach events to objects that accept data
		if ( !acceptData( elem ) ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Ensure that invalid selectors throw exceptions at attach time
		// Evaluate against documentElement in case elem is a non-element node (e.g., document)
		if ( selector ) {
			jQuery.find.matchesSelector( documentElement$1, selector );
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !( events = elemData.events ) ) {
			events = elemData.events = Object.create( null );
		}
		if ( !( eventHandle = elemData.handle ) ) {
			eventHandle = elemData.handle = function( e ) {

				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
			};
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend( {
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join( "." )
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !( handlers = events[ type ] ) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup ||
					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}
		}

	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

		if ( !elemData || !( events = elemData.events ) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[ 2 ] &&
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector ||
						selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown ||
					special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove data and the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			dataPriv.remove( elem, "handle events" );
		}
	},

	dispatch: function( nativeEvent ) {

		var i, j, ret, matched, handleObj, handlerQueue,
			args = new Array( arguments.length ),

			// Make a writable jQuery.Event from the native event object
			event = jQuery.event.fix( nativeEvent ),

			handlers = (
				dataPriv.get( this, "events" ) || Object.create( null )
			)[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[ 0 ] = event;

		for ( i = 1; i < arguments.length; i++ ) {
			args[ i ] = arguments[ i ];
		}

		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( ( handleObj = matched.handlers[ j++ ] ) &&
				!event.isImmediatePropagationStopped() ) {

				// If the event is namespaced, then each handler is only invoked if it is
				// specially universal or its namespaces are a superset of the event's.
				if ( !event.rnamespace || handleObj.namespace === false ||
					event.rnamespace.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
						handleObj.handler ).apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( ( event.result = ret ) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, handleObj, sel, matchedHandlers, matchedSelectors,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		if ( delegateCount &&

			// Support: Firefox <=42 - 66+
			// Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
			// https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
			// Support: IE 11+
			// ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
			!( event.type === "click" && event.button >= 1 ) ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't check non-elements (trac-13208)
				// Don't process clicks on disabled elements (trac-6911, trac-8165, trac-11382, trac-11764)
				if ( cur.nodeType === 1 && !( event.type === "click" && cur.disabled === true ) ) {
					matchedHandlers = [];
					matchedSelectors = {};
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (trac-13203)
						sel = handleObj.selector + " ";

						if ( matchedSelectors[ sel ] === undefined ) {
							matchedSelectors[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) > -1 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matchedSelectors[ sel ] ) {
							matchedHandlers.push( handleObj );
						}
					}
					if ( matchedHandlers.length ) {
						handlerQueue.push( { elem: cur, handlers: matchedHandlers } );
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		cur = this;
		if ( delegateCount < handlers.length ) {
			handlerQueue.push( { elem: cur, handlers: handlers.slice( delegateCount ) } );
		}

		return handlerQueue;
	},

	addProp: function( name, hook ) {
		Object.defineProperty( jQuery.Event.prototype, name, {
			enumerable: true,
			configurable: true,

			get: typeof hook === "function" ?
				function() {
					if ( this.originalEvent ) {
						return hook( this.originalEvent );
					}
				} :
				function() {
					if ( this.originalEvent ) {
						return this.originalEvent[ name ];
					}
				},

			set: function( value ) {
				Object.defineProperty( this, name, {
					enumerable: true,
					configurable: true,
					writable: true,
					value: value
				} );
			}
		} );
	},

	fix: function( originalEvent ) {
		return originalEvent[ jQuery.expando ] ?
			originalEvent :
			new jQuery.Event( originalEvent );
	},

	special: jQuery.extend( Object.create( null ), {
		load: {

			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		click: {

			// Utilize native event to ensure correct state for checkable inputs
			setup: function( data ) {

				// For mutual compressibility with _default, replace `this` access with a local var.
				// `|| data` is dead code meant only to preserve the variable through minification.
				var el = this || data;

				// Claim the first handler
				if ( rcheckableType.test( el.type ) &&
					el.click && nodeName( el, "input" ) ) {

					// dataPriv.set( el, "click", ... )
					leverageNative( el, "click", true );
				}

				// Return false to allow normal processing in the caller
				return false;
			},
			trigger: function( data ) {

				// For mutual compressibility with _default, replace `this` access with a local var.
				// `|| data` is dead code meant only to preserve the variable through minification.
				var el = this || data;

				// Force setup before triggering a click
				if ( rcheckableType.test( el.type ) &&
					el.click && nodeName( el, "input" ) ) {

					leverageNative( el, "click" );
				}

				// Return non-false to allow normal event-path propagation
				return true;
			},

			// For cross-browser consistency, suppress native .click() on links
			// Also prevent it if we're currently inside a leveraged native-event stack
			_default: function( event ) {
				var target = event.target;
				return rcheckableType.test( target.type ) &&
					target.click && nodeName( target, "input" ) &&
					dataPriv.get( target, "click" ) ||
					nodeName( target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {
				if ( event.result !== undefined ) {

					// Setting `event.originalEvent.returnValue` in modern
					// browsers does the same as just calling `preventDefault()`,
					// the browsers ignore the value anyway.
					// Incidentally, IE 11 is the only browser from our supported
					// ones which respects the value returned from a `beforeunload`
					// handler attached by `addEventListener`; other browsers do
					// so only for inline handlers, so not setting the value
					// directly shouldn't reduce any functionality.
					event.preventDefault();
				}
			}
		}
	} )
};

// Ensure the presence of an event listener that handles manually-triggered
// synthetic events by interrupting progress until reinvoked in response to
// *native* events that it fires directly, ensuring that state changes have
// already occurred before other listeners are invoked.
function leverageNative( el, type, isSetup ) {

	// Missing `isSetup` indicates a trigger call, which must force setup through jQuery.event.add
	if ( !isSetup ) {
		if ( dataPriv.get( el, type ) === undefined ) {
			jQuery.event.add( el, type, returnTrue );
		}
		return;
	}

	// Register the controller as a special universal handler for all event namespaces
	dataPriv.set( el, type, false );
	jQuery.event.add( el, type, {
		namespace: false,
		handler: function( event ) {
			var result,
				saved = dataPriv.get( this, type );

			// This controller function is invoked under multiple circumstances,
			// differentiated by the stored value in `saved`:
			// 1. For an outer synthetic `.trigger()`ed event (detected by
			//    `event.isTrigger & 1` and non-array `saved`), it records arguments
			//    as an array and fires an [inner] native event to prompt state
			//    changes that should be observed by registered listeners (such as
			//    checkbox toggling and focus updating), then clears the stored value.
			// 2. For an [inner] native event (detected by `saved` being
			//    an array), it triggers an inner synthetic event, records the
			//    result, and preempts propagation to further jQuery listeners.
			// 3. For an inner synthetic event (detected by `event.isTrigger & 1` and
			//    array `saved`), it prevents double-propagation of surrogate events
			//    but otherwise allows everything to proceed (particularly including
			//    further listeners).
			// Possible `saved` data shapes: `[...], `{ value }`, `false`.
			if ( ( event.isTrigger & 1 ) && this[ type ] ) {

				// Interrupt processing of the outer synthetic .trigger()ed event
				if ( !saved.length ) {

					// Store arguments for use when handling the inner native event
					// There will always be at least one argument (an event object),
					// so this array will not be confused with a leftover capture object.
					saved = slice.call( arguments );
					dataPriv.set( this, type, saved );

					// Trigger the native event and capture its result
					this[ type ]();
					result = dataPriv.get( this, type );
					dataPriv.set( this, type, false );

					if ( saved !== result ) {

						// Cancel the outer synthetic event
						event.stopImmediatePropagation();
						event.preventDefault();

						// Support: Chrome 86+
						// In Chrome, if an element having a focusout handler is
						// blurred by clicking outside of it, it invokes the handler
						// synchronously. If that handler calls `.remove()` on
						// the element, the data is cleared, leaving `result`
						// undefined. We need to guard against this.
						return result && result.value;
					}

				// If this is an inner synthetic event for an event with a bubbling
				// surrogate (focus or blur), assume that the surrogate already
				// propagated from triggering the native event and prevent that
				// from happening again here.
				} else if ( ( jQuery.event.special[ type ] || {} ).delegateType ) {
					event.stopPropagation();
				}

			// If this is a native event triggered above, everything is now in order.
			// Fire an inner synthetic event with the original arguments.
			} else if ( saved.length ) {

				// ...and capture the result
				dataPriv.set( this, type, {
					value: jQuery.event.trigger(
						saved[ 0 ],
						saved.slice( 1 ),
						this
					)
				} );

				// Abort handling of the native event by all jQuery handlers while allowing
				// native handlers on the same element to run. On target, this is achieved
				// by stopping immediate propagation just on the jQuery event. However,
				// the native event is re-wrapped by a jQuery one on each level of the
				// propagation so the only way to stop it for jQuery is to stop it for
				// everyone via native `stopPropagation()`. This is not a problem for
				// focus/blur which don't bubble, but it does also stop click on checkboxes
				// and radios. We accept this limitation.
				event.stopPropagation();
				event.isImmediatePropagationStopped = returnTrue;
			}
		}
	} );
}

jQuery.removeEvent = function( elem, type, handle ) {

	// This "if" is needed for plain objects
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle );
	}
};

jQuery.Event = function( src, props ) {

	// Allow instantiation without the 'new' keyword
	if ( !( this instanceof jQuery.Event ) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ?
			returnTrue :
			returnFalse;

		// Create target properties
		this.target = src.target;
		this.currentTarget = src.currentTarget;
		this.relatedTarget = src.relatedTarget;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || Date.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// https://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	constructor: jQuery.Event,
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,
	isSimulated: false,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;

		if ( e && !this.isSimulated ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Includes all common event props including KeyEvent and MouseEvent specific props
jQuery.each( {
	altKey: true,
	bubbles: true,
	cancelable: true,
	changedTouches: true,
	ctrlKey: true,
	detail: true,
	eventPhase: true,
	metaKey: true,
	pageX: true,
	pageY: true,
	shiftKey: true,
	view: true,
	"char": true,
	code: true,
	charCode: true,
	key: true,
	keyCode: true,
	button: true,
	buttons: true,
	clientX: true,
	clientY: true,
	offsetX: true,
	offsetY: true,
	pointerId: true,
	pointerType: true,
	screenX: true,
	screenY: true,
	targetTouches: true,
	toElement: true,
	touches: true,
	which: true
}, jQuery.event.addProp );

jQuery.each( { focus: "focusin", blur: "focusout" }, function( type, delegateType ) {

	// Support: IE 11+
	// Attach a single focusin/focusout handler on the document while someone wants focus/blur.
	// This is because the former are synchronous in IE while the latter are async. In other
	// browsers, all those handlers are invoked synchronously.
	function focusMappedHandler( nativeEvent ) {

		// `eventHandle` would already wrap the event, but we need to change the `type` here.
		var event = jQuery.event.fix( nativeEvent );
		event.type = nativeEvent.type === "focusin" ? "focus" : "blur";
		event.isSimulated = true;

		// focus/blur don't bubble while focusin/focusout do; simulate the former by only
		// invoking the handler at the lower level.
		if ( event.target === event.currentTarget ) {

			// The setup part calls `leverageNative`, which, in turn, calls
			// `jQuery.event.add`, so event handle will already have been set
			// by this point.
			dataPriv.get( this, "handle" )( event );
		}
	}

	jQuery.event.special[ type ] = {

		// Utilize native event if possible so blur/focus sequence is correct
		setup: function() {

			// Claim the first handler
			// dataPriv.set( this, "focus", ... )
			// dataPriv.set( this, "blur", ... )
			leverageNative( this, type, true );

			if ( isIE ) {
				this.addEventListener( delegateType, focusMappedHandler );
			} else {

				// Return false to allow normal processing in the caller
				return false;
			}
		},
		trigger: function() {

			// Force setup before trigger
			leverageNative( this, type );

			// Return non-false to allow normal event-path propagation
			return true;
		},

		teardown: function() {
			if ( isIE ) {
				this.removeEventListener( delegateType, focusMappedHandler );
			} else {

				// Return false to indicate standard teardown should be applied
				return false;
			}
		},

		// Suppress native focus or blur if we're currently inside
		// a leveraged native-event stack
		_default: function( event ) {
			return dataPriv.get( event.target, type );
		},

		delegateType: delegateType
	};
} );

// Create mouseenter/leave events using mouseover/out and event-time checks
// so that event delegation works in jQuery.
// Do the same for pointerenter/pointerleave and pointerover/pointerout
jQuery.each( {
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mouseenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
} );

jQuery.fn.extend( {

	on: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn );
	},
	one: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {

			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ?
					handleObj.origType + "." + handleObj.namespace :
					handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {

			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {

			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each( function() {
			jQuery.event.remove( this, types, fn, selector );
		} );
	}
} );

var

	// Support: IE <=10 - 11+
	// In IE using regex groups here causes severe slowdowns.
	rnoInnerhtml = /<script|<style|<link/i;

// Prefer a tbody over its parent table for containing new rows
function manipulationTarget( elem, content ) {
	if ( nodeName( elem, "table" ) &&
		nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ) {

		return jQuery( elem ).children( "tbody" )[ 0 ] || elem;
	}

	return elem;
}

function cloneCopyEvent( src, dest ) {
	var type, i, l,
		events = dataPriv.get( src, "events" );

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( events ) {
		dataPriv.remove( dest, "handle events" );
		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type, events[ type ][ i ] );
			}
		}
	}

	// 2. Copy user data
	if ( dataUser.hasData( src ) ) {
		dataUser.set( dest, jQuery.extend( {}, dataUser.get( src ) ) );
	}
}

function remove( elem, selector, keepData ) {
	var node,
		nodes = selector ? jQuery.filter( selector, elem ) : elem,
		i = 0;

	for ( ; ( node = nodes[ i ] ) != null; i++ ) {
		if ( !keepData && node.nodeType === 1 ) {
			jQuery.cleanData( getAll( node ) );
		}

		if ( node.parentNode ) {
			if ( keepData && isAttached( node ) ) {
				setGlobalEval( getAll( node, "script" ) );
			}
			node.parentNode.removeChild( node );
		}
	}

	return elem;
}

jQuery.extend( {
	htmlPrefilter: function( html ) {
		return html;
	},

	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = isAttached( elem );

		// Fix IE cloning issues
		if ( isIE && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
				!jQuery.isXMLDoc( elem ) ) {

			// We eschew jQuery#find here for performance reasons:
			// https://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {

				// Support: IE <=11+
				// IE fails to set the defaultValue to the correct value when
				// cloning textareas.
				if ( nodeName( destElements[ i ], "textarea" ) ) {
					destElements[ i ].defaultValue = srcElements[ i ].defaultValue;
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		// Return the cloned set
		return clone;
	},

	cleanData: function( elems ) {
		var data, elem, type,
			special = jQuery.event.special,
			i = 0;

		for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
			if ( acceptData( elem ) ) {
				if ( ( data = elem[ dataPriv.expando ] ) ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataPriv.expando ] = undefined;
				}
				if ( elem[ dataUser.expando ] ) {

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataUser.expando ] = undefined;
				}
			}
		}
	}
} );

jQuery.fn.extend( {
	detach: function( selector ) {
		return remove( this, selector, true );
	},

	remove: function( selector ) {
		return remove( this, selector );
	},

	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().each( function() {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						this.textContent = value;
					}
				} );
		}, null, value, arguments.length );
	},

	append: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		} );
	},

	prepend: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		} );
	},

	before: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		} );
	},

	after: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		} );
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; ( elem = this[ i ] ) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		} );
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = jQuery.htmlPrefilter( value );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch ( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var ignored = [];

		// Make the changes, replacing each non-ignored context element with the new content
		return domManip( this, arguments, function( elem ) {
			var parent = this.parentNode;

			if ( jQuery.inArray( this, ignored ) < 0 ) {
				jQuery.cleanData( getAll( this ) );
				if ( parent ) {
					parent.replaceChild( elem, this );
				}
			}

		// Force callback invocation
		}, ignored );
	}
} );

jQuery.each( {
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );
			push.apply( ret, elems );
		}

		return this.pushStack( ret );
	};
} );

var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var rcustomProp = /^--/;

function getStyles( elem ) {

	// Support: IE <=11+ (trac-14150)
	// In IE popup's `window` is the opener window which makes `window.getComputedStyle( elem )`
	// break. Using `elem.ownerDocument.defaultView` avoids the issue.
	var view = elem.ownerDocument.defaultView;

	// `document.implementation.createHTMLDocument( "" )` has a `null` `defaultView`
	// property; check `defaultView` truthiness to fallback to window in such a case.
	if ( !view ) {
		view = window;
	}

	return view.getComputedStyle( elem );
}

// A method for quickly swapping in/out CSS properties to get correct calculations.
function swap( elem, options, callback ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.call( elem );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
}

function curCSS( elem, name, computed ) {
	var ret,
		isCustomProp = rcustomProp.test( name );

	computed = computed || getStyles( elem );

	// getPropertyValue is needed for `.css('--customProperty')` (gh-3144)
	if ( computed ) {

		// A fallback to direct property access is needed as `computed`, being
		// the output of `getComputedStyle`, contains camelCased keys and
		// `getPropertyValue` requires kebab-case ones.
		//
		// Support: IE <=9 - 11+
		// IE only supports `"float"` in `getPropertyValue`; in computed styles
		// it's only available as `"cssFloat"`. We no longer modify properties
		// sent to `.css()` apart from camelCasing, so we need to check both.
		// Normally, this would create difference in behavior: if
		// `getPropertyValue` returns an empty string, the value returned
		// by `.css()` would be `undefined`. This is usually the case for
		// disconnected elements. However, in IE even disconnected elements
		// with no styles return `"none"` for `getPropertyValue( "float" )`
		ret = computed.getPropertyValue( name ) || computed[ name ];

		if ( isCustomProp && ret ) {

			// Support: Firefox 105 - 135+
			// Spec requires trimming whitespace for custom properties (gh-4926).
			// Firefox only trims leading whitespace.
			//
			// Fall back to `undefined` if empty string returned.
			// This collapses a missing definition with property defined
			// and set to an empty string but there's no standard API
			// allowing us to differentiate them without a performance penalty
			// and returning `undefined` aligns with older jQuery.
			//
			// rtrimCSS treats U+000D CARRIAGE RETURN and U+000C FORM FEED
			// as whitespace while CSS does not, but this is not a problem
			// because CSS preprocessing replaces them with U+000A LINE FEED
			// (which *is* CSS whitespace)
			// https://www.w3.org/TR/css-syntax-3/#input-preprocessing
			ret = ret.replace( rtrimCSS, "$1" ) || undefined;
		}

		if ( ret === "" && !isAttached( elem ) ) {
			ret = jQuery.style( elem, name );
		}
	}

	return ret !== undefined ?

		// Support: IE <=9 - 11+
		// IE returns zIndex value as an integer.
		ret + "" :
		ret;
}

var cssPrefixes = [ "Webkit", "Moz", "ms" ],
	emptyStyle = document$1.createElement( "div" ).style;

// Return a vendor-prefixed property or undefined
function vendorPropName( name ) {

	// Check for vendor prefixed names
	var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in emptyStyle ) {
			return name;
		}
	}
}

// Return a potentially-mapped vendor prefixed property
function finalPropName( name ) {
	if ( name in emptyStyle ) {
		return name;
	}
	return vendorPropName( name ) || name;
}

var reliableTrDimensionsVal, reliableColDimensionsVal,
	table = document$1.createElement( "table" );

// Executing table tests requires only one layout, so they're executed
// at the same time to save the second computation.
function computeTableStyleTests() {
	if (

		// This is a singleton, we need to execute it only once
		!table ||

		// Finish early in limited (non-browser) environments
		!table.style
	) {
		return;
	}

	var trStyle,
		col = document$1.createElement( "col" ),
		tr = document$1.createElement( "tr" ),
		td = document$1.createElement( "td" );

	table.style.cssText = "position:absolute;left:-11111px;" +
		"border-collapse:separate;border-spacing:0";
	tr.style.cssText = "box-sizing:content-box;border:1px solid;height:1px";
	td.style.cssText = "height:9px;width:9px;padding:0";

	col.span = 2;

	documentElement$1
		.appendChild( table )
		.appendChild( col )
		.parentNode
		.appendChild( tr )
		.appendChild( td )
		.parentNode
		.appendChild( td.cloneNode( true ) );

	// Don't run until window is visible
	if ( table.offsetWidth === 0 ) {
		documentElement$1.removeChild( table );
		return;
	}

	trStyle = window.getComputedStyle( tr );

	// Support: Firefox 135+
	// Firefox always reports computed width as if `span` was 1.
	// Support: Safari 18.3+
	// In Safari, computed width for columns is always 0.
	// In both these browsers, using `offsetWidth` solves the issue.
	// Support: IE 11+
	// In IE, `<col>` computed width is `"auto"` unless `width` is set
	// explicitly via CSS so measurements there remain incorrect. Because of
	// the lack of a proper workaround, we accept this limitation, treating
	// IE as passing the test.
	reliableColDimensionsVal = isIE || Math.round( parseFloat(
		window.getComputedStyle( col ).width )
	) === 18;

	// Support: IE 10 - 11+
	// IE misreports `getComputedStyle` of table rows with width/height
	// set in CSS while `offset*` properties report correct values.
	// Support: Firefox 70 - 135+
	// Only Firefox includes border widths
	// in computed dimensions for table rows. (gh-4529)
	reliableTrDimensionsVal = Math.round( parseFloat( trStyle.height ) +
		parseFloat( trStyle.borderTopWidth ) +
		parseFloat( trStyle.borderBottomWidth ) ) === tr.offsetHeight;

	documentElement$1.removeChild( table );

	// Nullify the table so it wouldn't be stored in the memory;
	// it will also be a sign that checks were already performed.
	table = null;
}

jQuery.extend( support, {
	reliableTrDimensions: function() {
		computeTableStyleTests();
		return reliableTrDimensionsVal;
	},

	reliableColDimensions: function() {
		computeTableStyleTests();
		return reliableColDimensionsVal;
	}
} );

var cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	};

function setPositiveNumber( _elem, value, subtract ) {

	// Any relative (+/-) values have already been
	// normalized at this point
	var matches = rcssNum.exec( value );
	return matches ?

		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
		value;
}

function boxModelAdjustment( elem, dimension, box, isBorderBox, styles, computedVal ) {
	var i = dimension === "width" ? 1 : 0,
		extra = 0,
		delta = 0,
		marginDelta = 0;

	// Adjustment may not be necessary
	if ( box === ( isBorderBox ? "border" : "content" ) ) {
		return 0;
	}

	for ( ; i < 4; i += 2 ) {

		// Both box models exclude margin
		// Count margin delta separately to only add it after scroll gutter adjustment.
		// This is needed to make negative margins work with `outerHeight( true )` (gh-3982).
		if ( box === "margin" ) {
			marginDelta += jQuery.css( elem, box + cssExpand[ i ], true, styles );
		}

		// If we get here with a content-box, we're seeking "padding" or "border" or "margin"
		if ( !isBorderBox ) {

			// Add padding
			delta += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// For "border" or "margin", add border
			if ( box !== "padding" ) {
				delta += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );

			// But still keep track of it otherwise
			} else {
				extra += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}

		// If we get here with a border-box (content + padding + border), we're seeking "content" or
		// "padding" or "margin"
		} else {

			// For "content", subtract padding
			if ( box === "content" ) {
				delta -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// For "content" or "padding", subtract border
			if ( box !== "margin" ) {
				delta -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	// Account for positive content-box scroll gutter when requested by providing computedVal
	if ( !isBorderBox && computedVal >= 0 ) {

		// offsetWidth/offsetHeight is a rounded sum of content, padding, scroll gutter, and border
		// Assuming integer scroll gutter, subtract the rest and round down
		delta += Math.max( 0, Math.ceil(
			elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
			computedVal -
			delta -
			extra -
			0.5

		// If offsetWidth/offsetHeight is unknown, then we can't determine content-box scroll gutter
		// Use an explicit zero to avoid NaN (gh-3964)
		) ) || 0;
	}

	return delta + marginDelta;
}

function getWidthOrHeight( elem, dimension, extra ) {

	// Start with computed style
	var styles = getStyles( elem ),

		// To avoid forcing a reflow, only fetch boxSizing if we need it (gh-4322).
		// Fake content-box until we know it's needed to know the true value.
		boxSizingNeeded = isIE || extra,
		isBorderBox = boxSizingNeeded &&
			jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
		valueIsBorderBox = isBorderBox,

		val = curCSS( elem, dimension, styles ),
		offsetProp = "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 );

	// Return a confounding non-pixel value or feign ignorance, as appropriate.
	if ( rnumnonpx.test( val ) ) {
		if ( !extra ) {
			return val;
		}
		val = "auto";
	}


	if (
		(

			// Fall back to offsetWidth/offsetHeight when value is "auto"
			// This happens for inline elements with no explicit setting (gh-3571)
			val === "auto" ||

			// Support: IE 9 - 11+
			// Use offsetWidth/offsetHeight for when box sizing is unreliable.
			// In those cases, the computed value can be trusted to be border-box.
			( isIE && isBorderBox ) ||

			( !support.reliableColDimensions() && nodeName( elem, "col" ) ) ||

			( !support.reliableTrDimensions() && nodeName( elem, "tr" ) )
		) &&

		// Make sure the element is visible & connected
		elem.getClientRects().length ) {

		isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

		// Where available, offsetWidth/offsetHeight approximate border box dimensions.
		// Where not available (e.g., SVG), assume unreliable box-sizing and interpret the
		// retrieved value as a content box dimension.
		valueIsBorderBox = offsetProp in elem;
		if ( valueIsBorderBox ) {
			val = elem[ offsetProp ];
		}
	}

	// Normalize "" and auto
	val = parseFloat( val ) || 0;

	// Adjust for the element's box model
	return ( val +
		boxModelAdjustment(
			elem,
			dimension,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles,

			// Provide the current computed size to request scroll gutter calculation (gh-3589)
			val
		)
	) + "px";
}

jQuery.extend( {

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = cssCamelCase( name ),
			isCustomProp = rcustomProp.test( name ),
			style = elem.style;

		// Make sure that we're working with the right name. We don't
		// want to query the value if it is a CSS custom property
		// since they are user-defined.
		if ( !isCustomProp ) {
			name = finalPropName( origName );
		}

		// Gets hook for the prefixed version, then unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (trac-7345)
			if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
				value = adjustCSS( elem, name, ret );

				// Fixes bug trac-9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set (trac-7116)
			if ( value == null || value !== value ) {
				return;
			}

			// If the value is a number, add `px` for certain CSS properties
			if ( type === "number" ) {
				value += ret && ret[ 3 ] || ( isAutoPx( origName ) ? "px" : "" );
			}

			// Support: IE <=9 - 11+
			// background-* props of a cloned element affect the source element (trac-8908)
			if ( isIE && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !( "set" in hooks ) ||
				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

				if ( isCustomProp ) {
					style.setProperty( name, value );
				} else {
					style[ name ] = value;
				}
			}

		} else {

			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks &&
				( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var val, num, hooks,
			origName = cssCamelCase( name ),
			isCustomProp = rcustomProp.test( name );

		// Make sure that we're working with the right name. We don't
		// want to modify the value if it is a CSS custom property
		// since they are user-defined.
		if ( !isCustomProp ) {
			name = finalPropName( origName );
		}

		// Try prefixed name followed by the unprefixed name
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		// Convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Make numeric if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || isFinite( num ) ? num || 0 : val;
		}

		return val;
	}
} );

jQuery.each( [ "height", "width" ], function( _i, dimension ) {
	jQuery.cssHooks[ dimension ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// Elements with `display: none` can have dimension info if
				// we invisibly show them.
				return jQuery.css( elem, "display" ) === "none" ?
					swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, dimension, extra );
					} ) :
					getWidthOrHeight( elem, dimension, extra );
			}
		},

		set: function( elem, value, extra ) {
			var matches,
				styles = getStyles( elem ),

				// To avoid forcing a reflow, only fetch boxSizing if we need it (gh-3991)
				isBorderBox = extra &&
					jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
				subtract = extra ?
					boxModelAdjustment(
						elem,
						dimension,
						extra,
						isBorderBox,
						styles
					) :
					0;

			// Convert to pixels if value adjustment is needed
			if ( subtract && ( matches = rcssNum.exec( value ) ) &&
				( matches[ 3 ] || "px" ) !== "px" ) {

				elem.style[ dimension ] = value;
				value = jQuery.css( elem, dimension );
			}

			return setPositiveNumber( elem, value, subtract );
		}
	};
} );

// These hooks are used by animate to expand properties
jQuery.each( {
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// Assumes a single number if not a string
				parts = typeof value === "string" ? value.split( " " ) : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( prefix !== "margin" ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
} );

jQuery.fn.extend( {
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( Array.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	}
} );

function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || jQuery.easing._default;
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( isAutoPx( prop ) ? "px" : "" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			// Use a property on the element directly when it is not a DOM element,
			// or when there is no matching style property that exists.
			if ( tween.elem.nodeType !== 1 ||
				tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
				return tween.elem[ tween.prop ];
			}

			// Passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails.
			// Simple values such as "10px" are parsed to Float;
			// complex values such as "rotate(1rad)" are returned as-is.
			result = jQuery.css( tween.elem, tween.prop, "" );

			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {

			// Use step hook for back compat.
			// Use cssHook if its there.
			// Use .style if available and use plain properties where available.
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.nodeType === 1 && (
				jQuery.cssHooks[ tween.prop ] ||
					tween.elem.style[ finalPropName( tween.prop ) ] != null ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	},
	_default: "swing"
};

jQuery.fx = Tween.prototype.init;

// Back compat <1.8 extension point
jQuery.fx.step = {};

var
	fxNow, inProgress,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rrun = /queueHooks$/;

function schedule() {
	if ( inProgress ) {
		if ( document$1.hidden === false && window.requestAnimationFrame ) {
			window.requestAnimationFrame( schedule );
		} else {
			window.setTimeout( schedule, 13 );
		}

		jQuery.fx.tick();
	}
}

// Animations created synchronously will run synchronously
function createFxNow() {
	window.setTimeout( function() {
		fxNow = undefined;
	} );
	return ( fxNow = Date.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		i = 0,
		attrs = { height: type };

	// If we include width, step value is 1 to do all cssExpand values,
	// otherwise step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

			// We're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display,
		isBox = "width" in props || "height" in props,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHiddenWithinTree( elem ),
		dataShow = dataPriv.get( elem, "fxshow" );

	// Queue-skipping animations hijack the fx hooks
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always( function() {

			// Ensure the complete handler is called before this completes
			anim.always( function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			} );
		} );
	}

	// Detect show/hide animations
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.test( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// Pretend to be hidden if this is a "show" and
				// there is still data from a stopped show/hide
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;

				// Ignore all other no-op show/hide data
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
		}
	}

	// Bail out if this is a no-op like .hide().hide()
	propTween = !jQuery.isEmptyObject( props );
	if ( !propTween && jQuery.isEmptyObject( orig ) ) {
		return;
	}

	// Restrict "overflow" and "display" styles during box animations
	if ( isBox && elem.nodeType === 1 ) {

		// Support: IE <=9 - 11+
		// Record all 3 overflow attributes because IE does not infer the shorthand
		// from identically-valued overflowX and overflowY.
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Identify a display type, preferring old show/hide data over the CSS cascade
		restoreDisplay = dataShow && dataShow.display;
		if ( restoreDisplay == null ) {
			restoreDisplay = dataPriv.get( elem, "display" );
		}
		display = jQuery.css( elem, "display" );
		if ( display === "none" ) {
			if ( restoreDisplay ) {
				display = restoreDisplay;
			} else {

				// Get nonempty value(s) by temporarily forcing visibility
				showHide( [ elem ], true );
				restoreDisplay = elem.style.display || restoreDisplay;
				display = jQuery.css( elem, "display" );
				showHide( [ elem ] );
			}
		}

		// Animate inline elements as inline-block
		if ( display === "inline" || display === "inline-block" && restoreDisplay != null ) {
			if ( jQuery.css( elem, "float" ) === "none" ) {

				// Restore the original display value at the end of pure show/hide animations
				if ( !propTween ) {
					anim.done( function() {
						style.display = restoreDisplay;
					} );
					if ( restoreDisplay == null ) {
						display = style.display;
						restoreDisplay = display === "none" ? "" : display;
					}
				}
				style.display = "inline-block";
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always( function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		} );
	}

	// Implement show/hide animations
	propTween = false;
	for ( prop in orig ) {

		// General show/hide setup for this element animation
		if ( !propTween ) {
			if ( dataShow ) {
				if ( "hidden" in dataShow ) {
					hidden = dataShow.hidden;
				}
			} else {
				dataShow = dataPriv.set( elem, "fxshow", { display: restoreDisplay } );
			}

			// Store hidden/visible for toggle so `.stop().toggle()` "reverses"
			if ( toggle ) {
				dataShow.hidden = !hidden;
			}

			// Show elements before animating them
			if ( hidden ) {
				showHide( [ elem ], true );
			}

			// eslint-disable-next-line no-loop-func
			anim.done( function() {

				// The final step of a "hide" animation is actually hiding the element
				if ( !hidden ) {
					showHide( [ elem ] );
				}
				dataPriv.remove( elem, "fxshow" );
				for ( prop in orig ) {
					jQuery.style( elem, prop, orig[ prop ] );
				}
			} );
		}

		// Per-property setup
		propTween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );
		if ( !( prop in dataShow ) ) {
			dataShow[ prop ] = propTween.start;
			if ( hidden ) {
				propTween.end = propTween.start;
				propTween.start = 0;
			}
		}
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = cssCamelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( Array.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// Not quite $.extend, this won't overwrite existing keys.
			// Reusing 'index' because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = Animation.prefilters.length,
		deferred = jQuery.Deferred().always( function() {

			// Don't match elem in the :animated selector
			delete tick.elem;
		} ),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

				percent = 1 - ( remaining / animation.duration || 0 ),
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ] );

			// If there's more to do, yield
			if ( percent < 1 && length ) {
				return remaining;
			}

			// If this was an empty animation, synthesize a final progress notification
			if ( !length ) {
				deferred.notifyWith( elem, [ animation, 1, 0 ] );
			}

			// Resolve the animation and report its conclusion
			deferred.resolveWith( elem, [ animation ] );
			return false;
		},
		animation = deferred.promise( {
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, {
				specialEasing: {},
				easing: jQuery.easing._default
			}, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
					animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,

					// If we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// Resolve when we played the last frame; otherwise, reject
				if ( gotoEnd ) {
					deferred.notifyWith( elem, [ animation, 1, 0 ] );
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		} ),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length; index++ ) {
		result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			if ( typeof result.stop === "function" ) {
				jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
					result.stop.bind( result );
			}
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( typeof animation.opts.start === "function" ) {
		animation.opts.start.call( elem, animation );
	}

	// Attach callbacks from options
	animation
		.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		} )
	);

	return animation;
}

jQuery.Animation = jQuery.extend( Animation, {

	tweeners: {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value );
			adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
			return tween;
		} ]
	},

	tweener: function( props, callback ) {
		if ( typeof props === "function" ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.match( rnothtmlwhite );
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length; index++ ) {
			prop = props[ index ];
			Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
			Animation.tweeners[ prop ].unshift( callback );
		}
	},

	prefilters: [ defaultPrefilter ],

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			Animation.prefilters.unshift( callback );
		} else {
			Animation.prefilters.push( callback );
		}
	}
} );

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || easing ||
			typeof speed === "function" && speed,
		duration: speed,
		easing: fn && easing || easing && typeof easing !== "function" && easing
	};

	// Go to the end state if fx are off
	if ( jQuery.fx.off ) {
		opt.duration = 0;

	} else {
		if ( typeof opt.duration !== "number" ) {
			if ( opt.duration in jQuery.fx.speeds ) {
				opt.duration = jQuery.fx.speeds[ opt.duration ];

			} else {
				opt.duration = jQuery.fx.speeds._default;
			}
		}
	}

	// Normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( typeof opt.old === "function" ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend( {
	fadeTo: function( speed, to, easing, callback ) {

		// Show any hidden elements after setting opacity to 0
		return this.filter( isHiddenWithinTree ).css( "opacity", 0 ).show()

			// Animate to the value specified
			.end().animate( { opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {

				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || dataPriv.get( this, "finish" ) ) {
					anim.stop( true );
				}
			};

		doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue ) {
			this.queue( type || "fx", [] );
		}

		return this.each( function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = dataPriv.get( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this &&
					( type == null || timers[ index ].queue === type ) ) {

					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// Start the next in the queue if the last step wasn't forced.
			// Timers currently will call their complete callbacks, which
			// will dequeue but only if they were gotoEnd.
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		} );
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each( function() {
			var index,
				data = dataPriv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// Enable finishing flag on private data
			data.finish = true;

			// Empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// Look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// Look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// Turn off finishing flag
			delete data.finish;
		} );
	}
} );

jQuery.each( [ "toggle", "show", "hide" ], function( _i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
} );

// Generate shortcuts for custom animations
jQuery.each( {
	slideDown: genFx( "show" ),
	slideUp: genFx( "hide" ),
	slideToggle: genFx( "toggle" ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
} );

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		i = 0,
		timers = jQuery.timers;

	fxNow = Date.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];

		// Run the timer and safely remove it when done (allowing for external removal)
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	jQuery.fx.start();
};

jQuery.fx.start = function() {
	if ( inProgress ) {
		return;
	}

	inProgress = true;
	schedule();
};

jQuery.fx.stop = function() {
	inProgress = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,

	// Default speed
	_default: 400
};

// Based off of the plugin by Clint Helfers, with permission.
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = window.setTimeout( next, time );
		hooks.stop = function() {
			window.clearTimeout( timeout );
		};
	} );
};

var rfocusable = /^(?:input|select|textarea|button)$/i,
	rclickable = /^(?:a|area)$/i;

jQuery.fn.extend( {
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each( function() {
			delete this[ jQuery.propFix[ name ] || name ];
		} );
	}
} );

jQuery.extend( {
	prop: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			return ( elem[ name ] = value );
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		return elem[ name ];
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {

				// Support: IE <=9 - 11+
				// elem.tabIndex doesn't always return the
				// correct value when it hasn't been explicitly set
				// Use proper attribute retrieval (trac-12072)
				var tabindex = elem.getAttribute( "tabindex" );

				if ( tabindex ) {
					return parseInt( tabindex, 10 );
				}

				if (
					rfocusable.test( elem.nodeName ) ||

					// href-less anchor's `tabIndex` property value is `0` and
					// the `tabindex` attribute value: `null`. We want `-1`.
					rclickable.test( elem.nodeName ) && elem.href
				) {
					return 0;
				}

				return -1;
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	}
} );

// Support: IE <=11+
// Accessing the selectedIndex property forces the browser to respect
// setting selected on the option. The getter ensures a default option
// is selected when in an optgroup. ESLint rule "no-unused-expressions"
// is disabled for this code since it considers such accessions noop.
if ( isIE ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {

			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				// eslint-disable-next-line no-unused-expressions
				parent.parentNode.selectedIndex;
			}
			return null;
		},
		set: function( elem ) {


			var parent = elem.parentNode;
			if ( parent ) {
				// eslint-disable-next-line no-unused-expressions
				parent.selectedIndex;

				if ( parent.parentNode ) {
					// eslint-disable-next-line no-unused-expressions
					parent.parentNode.selectedIndex;
				}
			}
		}
	};
}

jQuery.each( [
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
} );

// Strip and collapse whitespace according to HTML spec
// https://infra.spec.whatwg.org/#strip-and-collapse-ascii-whitespace
function stripAndCollapse( value ) {
	var tokens = value.match( rnothtmlwhite ) || [];
	return tokens.join( " " );
}

function getClass( elem ) {
	return elem.getAttribute && elem.getAttribute( "class" ) || "";
}

function classesToArray( value ) {
	if ( Array.isArray( value ) ) {
		return value;
	}
	if ( typeof value === "string" ) {
		return value.match( rnothtmlwhite ) || [];
	}
	return [];
}

jQuery.fn.extend( {
	addClass: function( value ) {
		var classNames, cur, curValue, className, i, finalValue;

		if ( typeof value === "function" ) {
			return this.each( function( j ) {
				jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		classNames = classesToArray( value );

		if ( classNames.length ) {
			return this.each( function() {
				curValue = getClass( this );
				cur = this.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					for ( i = 0; i < classNames.length; i++ ) {
						className = classNames[ i ];
						if ( cur.indexOf( " " + className + " " ) < 0 ) {
							cur += className + " ";
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						this.setAttribute( "class", finalValue );
					}
				}
			} );
		}

		return this;
	},

	removeClass: function( value ) {
		var classNames, cur, curValue, className, i, finalValue;

		if ( typeof value === "function" ) {
			return this.each( function( j ) {
				jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( !arguments.length ) {
			return this.attr( "class", "" );
		}

		classNames = classesToArray( value );

		if ( classNames.length ) {
			return this.each( function() {
				curValue = getClass( this );

				// This expression is here for better compressibility (see addClass)
				cur = this.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					for ( i = 0; i < classNames.length; i++ ) {
						className = classNames[ i ];

						// Remove *all* instances
						while ( cur.indexOf( " " + className + " " ) > -1 ) {
							cur = cur.replace( " " + className + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						this.setAttribute( "class", finalValue );
					}
				}
			} );
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var classNames, className, i, self;

		if ( typeof value === "function" ) {
			return this.each( function( i ) {
				jQuery( this ).toggleClass(
					value.call( this, i, getClass( this ), stateVal ),
					stateVal
				);
			} );
		}

		if ( typeof stateVal === "boolean" ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		classNames = classesToArray( value );

		if ( classNames.length ) {
			return this.each( function() {

				// Toggle individual class names
				self = jQuery( this );

				for ( i = 0; i < classNames.length; i++ ) {
					className = classNames[ i ];

					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}
			} );
		}

		return this;
	},

	hasClass: function( selector ) {
		var className, elem,
			i = 0;

		className = " " + selector + " ";
		while ( ( elem = this[ i++ ] ) ) {
			if ( elem.nodeType === 1 &&
				( " " + stripAndCollapse( getClass( elem ) ) + " " ).indexOf( className ) > -1 ) {
				return true;
			}
		}

		return false;
	}
} );

jQuery.fn.extend( {
	val: function( value ) {
		var hooks, ret, valueIsFunction,
			elem = this[ 0 ];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] ||
					jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks &&
					"get" in hooks &&
					( ret = hooks.get( elem, "value" ) ) !== undefined
				) {
					return ret;
				}

				ret = elem.value;

				// Handle cases where value is null/undef or number
				return ret == null ? "" : ret;
			}

			return;
		}

		valueIsFunction = typeof value === "function";

		return this.each( function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( valueIsFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";

			} else if ( typeof val === "number" ) {
				val += "";

			} else if ( Array.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				} );
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		} );
	}
} );

jQuery.extend( {
	valHooks: {
		select: {
			get: function( elem ) {
				var value, option, i,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one",
					values = one ? null : [],
					max = one ? index + 1 : options.length;

				if ( index < 0 ) {
					i = max;

				} else {
					i = one ? index : 0;
				}

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					if ( option.selected &&

							// Don't return options that are disabled or in a disabled optgroup
							!option.disabled &&
							( !option.parentNode.disabled ||
								!nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];

					if ( ( option.selected =
						jQuery.inArray( jQuery( option ).val(), values ) > -1
					) ) {
						optionSet = true;
					}
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	}
} );

if ( isIE ) {
	jQuery.valHooks.option = {
		get: function( elem ) {

			var val = elem.getAttribute( "value" );
			return val != null ?
				val :

				// Support: IE <=10 - 11+
				// option.text throws exceptions (trac-14686, trac-14858)
				// Strip and collapse whitespace
				// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
				stripAndCollapse( jQuery.text( elem ) );
		}
	};
}

// Radios and checkboxes getter/setter
jQuery.each( [ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( Array.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
			}
		}
	};
} );

var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	stopPropagationCallback = function( e ) {
		e.stopPropagation();
	};

jQuery.extend( jQuery.event, {

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special, lastElement,
			eventPath = [ elem || document$1 ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

		cur = lastElement = tmp = elem = elem || document$1;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "." ) > -1 ) {

			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split( "." );
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf( ":" ) < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join( "." );
		event.rnamespace = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (trac-9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (trac-9724)
		if ( !onlyHandlers && !special.noBubble && !isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === ( elem.ownerDocument || document$1 ) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {
			lastElement = cur;
			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( dataPriv.get( cur, "events" ) || Object.create( null ) )[ event.type ] &&
				dataPriv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( ( !special._default ||
				special._default.apply( eventPath.pop(), data ) === false ) &&
				acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name as the event.
				// Don't do default actions on window, that's where global variables be (trac-6170)
				if ( ontype && typeof elem[ type ] === "function" && !isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;

					if ( event.isPropagationStopped() ) {
						lastElement.addEventListener( type, stopPropagationCallback );
					}

					elem[ type ]();

					if ( event.isPropagationStopped() ) {
						lastElement.removeEventListener( type, stopPropagationCallback );
					}

					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	// Piggyback on a donor event to simulate a different one
	// Used only for `focus(in | out)` events
	simulate: function( type, elem, event ) {
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true
			}
		);

		jQuery.event.trigger( e, null, elem );
	}

} );

jQuery.fn.extend( {

	trigger: function( type, data ) {
		return this.each( function() {
			jQuery.event.trigger( type, data, this );
		} );
	},
	triggerHandler: function( type, data ) {
		var elem = this[ 0 ];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
} );

var location = window.location;

var nonce = { guid: Date.now() };

var rquery = /\?/;

// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml, parserErrorElem;
	if ( !data || typeof data !== "string" ) {
		return null;
	}

	// Support: IE 9 - 11+
	// IE throws on parseFromString with invalid input.
	try {
		xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
	} catch ( e ) {}

	parserErrorElem = xml && xml.getElementsByTagName( "parsererror" )[ 0 ];
	if ( !xml || parserErrorElem ) {
		jQuery.error( "Invalid XML: " + (
			parserErrorElem ?
				jQuery.map( parserErrorElem.childNodes, function( el ) {
					return el.textContent;
				} ).join( "\n" ) :
				data
		) );
	}
	return xml;
};

var
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( Array.isArray( obj ) ) {

		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {

				// Treat each array item as a scalar.
				add( prefix, v );

			} else {

				// Item is non-scalar (array or object), encode its numeric index.
				buildParams(
					prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
					v,
					traditional,
					add
				);
			}
		} );

	} else if ( !traditional && toType( obj ) === "object" ) {

		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {

		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, valueOrFunction ) {

			// If value is a function, invoke it and use its return value
			var value = typeof valueOrFunction === "function" ?
				valueOrFunction() :
				valueOrFunction;

			s[ s.length ] = encodeURIComponent( key ) + "=" +
				encodeURIComponent( value == null ? "" : value );
		};

	if ( a == null ) {
		return "";
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( Array.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		} );

	} else {

		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" );
};

jQuery.fn.extend( {
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map( function() {

			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		} ).filter( function() {
			var type = this.type;

			// Use .is( ":disabled" ) so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		} ).map( function( _i, elem ) {
			var val = jQuery( this ).val();

			if ( val == null ) {
				return null;
			}

			if ( Array.isArray( val ) ) {
				return jQuery.map( val, function( val ) {
					return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
				} );
			}

			return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		} ).get();
	}
} );

var
	r20 = /%20/g,
	rhash = /#.*$/,
	rantiCache = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

	// trac-7653, trac-8125, trac-8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (trac-10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Anchor tag for parsing the document origin
	originAnchor = document$1.createElement( "a" );

originAnchor.href = location.href;

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnothtmlwhite ) || [];

		if ( typeof func === "function" ) {

			// For each dataType in the dataTypeExpression
			while ( ( dataType = dataTypes[ i++ ] ) ) {

				// Prepend if requested
				if ( dataType[ 0 ] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

				// Otherwise append
				} else {
					( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" &&
				!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		} );
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes trac-9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {

		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}

		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},

		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

			// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {

								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s.throws ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return {
								state: "parsererror",
								error: conv ? e : "No conversion from " + prev + " to " + current
							};
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend( {

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: location.href,
		type: "GET",
		isLocal: rlocalProtocol.test( location.protocol ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",

		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /\bxml\b/,
			html: /\bhtml/,
			json: /\bjson\b/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": JSON.parse,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var transport,

			// URL without anti-cache param
			cacheURL,

			// Response headers
			responseHeadersString,
			responseHeaders,

			// timeout handle
			timeoutTimer,

			// Url cleanup var
			urlAnchor,

			// Request state (becomes false upon send and true upon completion)
			completed,

			// To know if global events are to be dispatched
			fireGlobals,

			// Loop variable
			i,

			// uncached part of the url
			uncached,

			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),

			// Callbacks context
			callbackContext = s.context || s,

			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context &&
				( callbackContext.nodeType || callbackContext.jquery ) ?
				jQuery( callbackContext ) :
				jQuery.event,

			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),

			// Status-dependent callbacks
			statusCode = s.statusCode || {},

			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},

			// Default abort message
			strAbort = "canceled",

			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( completed ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( ( match = rheaders.exec( responseHeadersString ) ) ) {

								// Support: IE 11+
								// `getResponseHeader( key )` in IE doesn't combine all header
								// values for the provided key into a single result with values
								// joined by commas as other browsers do. Instead, it returns
								// them on separate lines.
								responseHeaders[ match[ 1 ].toLowerCase() + " " ] =
									( responseHeaders[ match[ 1 ].toLowerCase() + " " ] || [] )
										.concat( match[ 2 ] );
							}
						}
						match = responseHeaders[ key.toLowerCase() + " " ];
					}
					return match == null ? null : match.join( ", " );
				},

				// Raw string
				getAllResponseHeaders: function() {
					return completed ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( completed == null ) {
						name = requestHeadersNames[ name.toLowerCase() ] =
							requestHeadersNames[ name.toLowerCase() ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( completed == null ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( completed ) {

							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						} else {

							// Lazy-add the new callbacks in a way that preserves old ones
							for ( code in map ) {
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR );

		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (trac-10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || location.href ) + "" )
			.replace( rprotocol, location.protocol + "//" );

		// Alias method option to type as per ticket trac-12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = ( s.dataType || "*" ).toLowerCase().match( rnothtmlwhite ) || [ "" ];

		// A cross-domain request is in order when the origin doesn't match the current origin.
		if ( s.crossDomain == null ) {
			urlAnchor = document$1.createElement( "a" );

			// Support: IE <=8 - 11+
			// IE throws exception on accessing the href property if url is malformed,
			// e.g. http://example.com:80x/
			try {
				urlAnchor.href = s.url;

				// Support: IE <=8 - 11+
				// Anchor's host property isn't correctly set when s.url is relative
				urlAnchor.href = urlAnchor.href;
				s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
					urlAnchor.protocol + "//" + urlAnchor.host;
			} catch ( e ) {

				// If there is an error parsing the URL, assume it is crossDomain,
				// it can be rejected by the transport if it is invalid
				s.crossDomain = true;
			}
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// If request was aborted inside a prefilter, stop there
		if ( completed ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an ESM-usage scenario (trac-15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		// Remove hash to simplify url manipulation
		cacheURL = s.url.replace( rhash, "" );

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// Remember the hash so we can put it back
			uncached = s.url.slice( cacheURL.length );

			// If data is available and should be processed, append data to url
			if ( s.data && ( s.processData || typeof s.data === "string" ) ) {
				cacheURL += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data;

				// trac-9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add or update anti-cache param if needed
			if ( s.cache === false ) {
				cacheURL = cacheURL.replace( rantiCache, "$1" );
				uncached = ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" +
					( nonce.guid++ ) + uncached;
			}

			// Put hash and anti-cache on the URL that will be requested (gh-1732)
			s.url = cacheURL + uncached;

		// Change '%20' to '+' if this is encoded form body content (gh-2658)
		} else if ( s.data && s.processData &&
			( s.contentType || "" ).indexOf( "application/x-www-form-urlencoded" ) === 0 ) {
			s.data = s.data.replace( r20, "+" );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
				s.accepts[ s.dataTypes[ 0 ] ] +
					( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend &&
			( s.beforeSend.call( callbackContext, jqXHR, s ) === false || completed ) ) {

			// Abort if not done already and return
			return jqXHR.abort();
		}

		// Aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		completeDeferred.add( s.complete );
		jqXHR.done( s.success );
		jqXHR.fail( s.error );

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}

			// If request was aborted inside ajaxSend, stop there
			if ( completed ) {
				return jqXHR;
			}

			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = window.setTimeout( function() {
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				completed = false;
				transport.send( requestHeaders, done );
			} catch ( e ) {

				// Rethrow post-completion exceptions
				if ( completed ) {
					throw e;
				}

				// Propagate others as results
				done( -1, e );
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Ignore repeat invocations
			if ( completed ) {
				return;
			}

			completed = true;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				window.clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Use a noop converter for missing script but not if jsonp
			if ( !isSuccess &&
				jQuery.inArray( "script", s.dataTypes ) > -1 &&
				jQuery.inArray( "json", s.dataTypes ) < 0 ) {
				s.converters[ "text script" ] = function() {};
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader( "Last-Modified" );
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader( "etag" );
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {

				// Extract error from statusText and normalize for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
} );

jQuery.each( [ "get", "post" ], function( _i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {

		// Shift arguments if data argument was omitted.
		// Handle the null callback placeholder.
		if ( typeof data === "function" || data === null ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		// The url can be an options object (which then must have .url)
		return jQuery.ajax( jQuery.extend( {
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		}, jQuery.isPlainObject( url ) && url ) );
	};
} );

jQuery.ajaxPrefilter( function( s ) {
	var i;
	for ( i in s.headers ) {
		if ( i.toLowerCase() === "content-type" ) {
			s.contentType = s.headers[ i ] || "";
		}
	}
} );

jQuery._evalUrl = function( url, options, doc ) {
	return jQuery.ajax( {
		url: url,

		// Make this explicit, since user can override this through ajaxSetup (trac-11264)
		type: "GET",
		dataType: "script",
		cache: true,
		async: false,
		global: false,
		scriptAttrs: options.crossOrigin ? { "crossOrigin": options.crossOrigin } : undefined,

		// Only evaluate the response if it is successful (gh-4126)
		// dataFilter is not invoked for failure responses, so using it instead
		// of the default converter is kludgy but it works.
		converters: {
			"text script": function() {}
		},
		dataFilter: function( response ) {
			jQuery.globalEval( response, options, doc );
		}
	} );
};

jQuery.fn.extend( {
	wrapAll: function( html ) {
		var wrap;

		if ( this[ 0 ] ) {
			if ( typeof html === "function" ) {
				html = html.call( this[ 0 ] );
			}

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map( function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			} ).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( typeof html === "function" ) {
			return this.each( function( i ) {
				jQuery( this ).wrapInner( html.call( this, i ) );
			} );
		}

		return this.each( function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		} );
	},

	wrap: function( html ) {
		var htmlIsFunction = typeof html === "function";

		return this.each( function( i ) {
			jQuery( this ).wrapAll( htmlIsFunction ? html.call( this, i ) : html );
		} );
	},

	unwrap: function( selector ) {
		this.parent( selector ).not( "body" ).each( function() {
			jQuery( this ).replaceWith( this.childNodes );
		} );
		return this;
	}
} );

jQuery.expr.pseudos.hidden = function( elem ) {
	return !jQuery.expr.pseudos.visible( elem );
};
jQuery.expr.pseudos.visible = function( elem ) {
	return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
};

jQuery.ajaxSettings.xhr = function() {
	return new window.XMLHttpRequest();
};

var xhrSuccessStatus = {

	// File protocol always yields status code 0, assume 200
	0: 200
};

jQuery.ajaxTransport( function( options ) {
	var callback;

	return {
		send: function( headers, complete ) {
			var i,
				xhr = options.xhr();

			xhr.open(
				options.type,
				options.url,
				options.async,
				options.username,
				options.password
			);

			// Apply custom fields if provided
			if ( options.xhrFields ) {
				for ( i in options.xhrFields ) {
					xhr[ i ] = options.xhrFields[ i ];
				}
			}

			// Override mime type if needed
			if ( options.mimeType && xhr.overrideMimeType ) {
				xhr.overrideMimeType( options.mimeType );
			}

			// X-Requested-With header
			// For cross-domain requests, seeing as conditions for a preflight are
			// akin to a jigsaw puzzle, we simply never set it to be sure.
			// (it can always be set on a per-request basis or even using ajaxSetup)
			// For same-domain requests, won't change header if already provided.
			if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
				headers[ "X-Requested-With" ] = "XMLHttpRequest";
			}

			// Set headers
			for ( i in headers ) {
				xhr.setRequestHeader( i, headers[ i ] );
			}

			// Callback
			callback = function( type ) {
				return function() {
					if ( callback ) {
						callback = xhr.onload = xhr.onerror = xhr.onabort = xhr.ontimeout = null;

						if ( type === "abort" ) {
							xhr.abort();
						} else if ( type === "error" ) {
							complete(

								// File: protocol always yields status 0; see trac-8605, trac-14207
								xhr.status,
								xhr.statusText
							);
						} else {
							complete(
								xhrSuccessStatus[ xhr.status ] || xhr.status,
								xhr.statusText,

								// For XHR2 non-text, let the caller handle it (gh-2498)
								( xhr.responseType || "text" ) === "text" ?
									{ text: xhr.responseText } :
									{ binary: xhr.response },
								xhr.getAllResponseHeaders()
							);
						}
					}
				};
			};

			// Listen to events
			xhr.onload = callback();
			xhr.onabort = xhr.onerror = xhr.ontimeout = callback( "error" );

			// Create the abort callback
			callback = callback( "abort" );

			try {

				// Do send the request (this may raise an exception)
				xhr.send( options.hasContent && options.data || null );
			} catch ( e ) {

				// trac-14683: Only rethrow if this hasn't been notified as an error yet
				if ( callback ) {
					throw e;
				}
			}
		},

		abort: function() {
			if ( callback ) {
				callback();
			}
		}
	};
} );

function canUseScriptTag( s ) {

	// A script tag can only be used for async, cross domain or forced-by-attrs requests.
	// Requests with headers cannot use a script tag. However, when both `scriptAttrs` &
	// `headers` options are specified, both are impossible to satisfy together; we
	// prefer `scriptAttrs` then.
	// Sync requests remain handled differently to preserve strict script ordering.
	return s.scriptAttrs || (
		!s.headers &&
		(
			s.crossDomain ||

			// When dealing with JSONP (`s.dataTypes` include "json" then)
			// don't use a script tag so that error responses still may have
			// `responseJSON` set. Continue using a script tag for JSONP requests that:
			//   * are cross-domain as AJAX requests won't work without a CORS setup
			//   * have `scriptAttrs` set as that's a script-only functionality
			// Note that this means JSONP requests violate strict CSP script-src settings.
			// A proper solution is to migrate from using JSONP to a CORS setup.
			( s.async && jQuery.inArray( "json", s.dataTypes ) < 0 )
		)
	);
}

// Install script dataType. Don't specify `contents.script` so that an explicit
// `dataType: "script"` is required (see gh-2432, gh-4822)
jQuery.ajaxSetup( {
	accepts: {
		script: "text/javascript, application/javascript, " +
			"application/ecmascript, application/x-ecmascript"
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
} );

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}

	// These types of requests are handled via a script tag
	// so force their methods to GET.
	if ( canUseScriptTag( s ) ) {
		s.type = "GET";
	}
} );

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {
	if ( canUseScriptTag( s ) ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery( "<script>" )
					.attr( s.scriptAttrs || {} )
					.prop( { charset: s.scriptCharset, src: s.url } )
					.on( "load error", callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					} );

				// Use native DOM manipulation to avoid our domManip AJAX trickery
				document$1.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );

var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup( {
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce.guid++ ) );
		this[ callback ] = true;
		return callback;
	}
} );

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" &&
				( s.contentType || "" )
					.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
				rjsonp.test( s.data ) && "data"
		);

	// Get callback name, remembering preexisting value associated with it
	callbackName = s.jsonpCallback = typeof s.jsonpCallback === "function" ?
		s.jsonpCallback() :
		s.jsonpCallback;

	// Insert callback into url or form data
	if ( jsonProp ) {
		s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
	} else if ( s.jsonp !== false ) {
		s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
	}

	// Use data converter to retrieve json after script execution
	s.converters[ "script json" ] = function() {
		if ( !responseContainer ) {
			jQuery.error( callbackName + " was not called" );
		}
		return responseContainer[ 0 ];
	};

	// Force json dataType
	s.dataTypes[ 0 ] = "json";

	// Install callback
	overwritten = window[ callbackName ];
	window[ callbackName ] = function() {
		responseContainer = arguments;
	};

	// Clean-up function (fires after converters)
	jqXHR.always( function() {

		// If previous value didn't exist - remove it
		if ( overwritten === undefined ) {
			jQuery( window ).removeProp( callbackName );

		// Otherwise restore preexisting value
		} else {
			window[ callbackName ] = overwritten;
		}

		// Save back as free
		if ( s[ callbackName ] ) {

			// Make sure that re-using the options doesn't screw things around
			s.jsonpCallback = originalSettings.jsonpCallback;

			// Save the callback name for future use
			oldCallbacks.push( callbackName );
		}

		// Call if it was a function and we have a response
		if ( responseContainer && typeof overwritten === "function" ) {
			overwritten( responseContainer[ 0 ] );
		}

		responseContainer = overwritten = undefined;
	} );

	// Delegate to script
	return "script";
} );

jQuery.ajaxPrefilter( function( s, origOptions ) {

	// Binary data needs to be passed to XHR as-is without stringification.
	if ( typeof s.data !== "string" && !jQuery.isPlainObject( s.data ) &&
			!Array.isArray( s.data ) &&

			// Don't disable data processing if explicitly set by the user.
			!( "processData" in origOptions ) ) {
		s.processData = false;
	}

	// `Content-Type` for requests with `FormData` bodies needs to be set
	// by the browser as it needs to append the `boundary` it generated.
	if ( s.data instanceof window.FormData ) {
		s.contentType = false;
	}
} );

// Argument "data" should be string of html or a TrustedHTML wrapper of obvious HTML
// context (optional): If specified, the fragment will be created in this context,
// defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( typeof data !== "string" && !isObviousHtml( data + "" ) ) {
		return [];
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}

	var parsed, scripts;

	if ( !context ) {

		// Stop scripts or inline event handlers from being executed immediately
		// by using DOMParser
		context = ( new window.DOMParser() )
			.parseFromString( "", "text/html" );
	}

	parsed = rsingleTag.exec( data );
	scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[ 1 ] ) ];
	}

	parsed = buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};

/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	var selector, type, response,
		self = this,
		off = url.indexOf( " " );

	if ( off > -1 ) {
		selector = stripAndCollapse( url.slice( off ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( typeof params === "function" ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax( {
			url: url,

			// If "type" variable is undefined, then "GET" method will be used.
			// Make value of this field explicit since
			// user can override it through ajaxSetup method
			type: type || "GET",
			dataType: "html",
			data: params
		} ).done( function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		// If the request succeeds, this function gets "data", "status", "jqXHR"
		// but they are ignored because response was set above.
		// If it fails, this function gets "jqXHR", "status", "error"
		} ).always( callback && function( jqXHR, status ) {
			self.each( function() {
				callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
			} );
		} );
	}

	return this;
};

jQuery.expr.pseudos.animated = function( elem ) {
	return jQuery.grep( jQuery.timers, function( fn ) {
		return elem === fn.elem;
	} ).length;
};

jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

		// Need to be able to calculate position if either
		// top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( typeof options === "function" ) {

			// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
			options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend( {

	// offset() relates an element's border box to the document origin
	offset: function( options ) {

		// Preserve chaining for setter
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each( function( i ) {
					jQuery.offset.setOffset( this, options, i );
				} );
		}

		var rect, win,
			elem = this[ 0 ];

		if ( !elem ) {
			return;
		}

		// Return zeros for disconnected and hidden (display: none) elements (gh-2310)
		// Support: IE <=11+
		// Running getBoundingClientRect on a
		// disconnected node in IE throws an error
		if ( !elem.getClientRects().length ) {
			return { top: 0, left: 0 };
		}

		// Get document-relative position by adding viewport scroll to viewport-relative gBCR
		rect = elem.getBoundingClientRect();
		win = elem.ownerDocument.defaultView;
		return {
			top: rect.top + win.pageYOffset,
			left: rect.left + win.pageXOffset
		};
	},

	// position() relates an element's margin box to its offset parent's padding box
	// This corresponds to the behavior of CSS absolute positioning
	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset, doc,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// position:fixed elements are offset from the viewport, which itself always has zero offset
		if ( jQuery.css( elem, "position" ) === "fixed" ) {

			// Assume position:fixed implies availability of getBoundingClientRect
			offset = elem.getBoundingClientRect();

		} else {
			offset = this.offset();

			// Account for the *real* offset parent, which can be the document or its root element
			// when a statically positioned element is identified
			doc = elem.ownerDocument;
			offsetParent = elem.offsetParent || doc.documentElement;
			while ( offsetParent &&
				offsetParent !== doc.documentElement &&
				jQuery.css( offsetParent, "position" ) === "static" ) {

				offsetParent = offsetParent.offsetParent || doc.documentElement;
			}
			if ( offsetParent && offsetParent !== elem && offsetParent.nodeType === 1 &&
				jQuery.css( offsetParent, "position" ) !== "static" ) {

				// Incorporate borders into its offset, since they are outside its content origin
				parentOffset = jQuery( offsetParent ).offset();
				parentOffset.top += jQuery.css( offsetParent, "borderTopWidth", true );
				parentOffset.left += jQuery.css( offsetParent, "borderLeftWidth", true );
			}
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	// This method will return documentElement in the following cases:
	// 1) For the element inside the iframe without offsetParent, this method will return
	//    documentElement of the parent window
	// 2) For the hidden or detached element
	// 3) For body or html element, i.e. in case of the html node - it will return itself
	//
	// but those exceptions were never presented as a real life use-cases
	// and might be considered as more preferable results.
	//
	// This logic, however, is not guaranteed and can change at any point in the future
	offsetParent: function() {
		return this.map( function() {
			var offsetParent = this.offsetParent;

			while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || documentElement$1;
		} );
	}
} );

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {

			// Coalesce documents and windows
			var win;
			if ( isWindow( elem ) ) {
				win = elem;
			} else if ( elem.nodeType === 9 ) {
				win = elem.defaultView;
			}

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : win.pageXOffset,
					top ? val : win.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length );
	};
} );

// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( {
		padding: "inner" + name,
		content: type,
		"": "outer" + name
	}, function( defaultExtra, funcName ) {

		// Margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( isWindow( elem ) ) {

					// $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
					return funcName.indexOf( "outer" ) === 0 ?
						elem[ "inner" + name ] :
						elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?

					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable );
		};
	} );
} );

jQuery.each( [
	"ajaxStart",
	"ajaxStop",
	"ajaxComplete",
	"ajaxError",
	"ajaxSuccess",
	"ajaxSend"
], function( _i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
} );

jQuery.fn.extend( {

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {

		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ?
			this.off( selector, "**" ) :
			this.off( types, selector || "**", fn );
	},

	hover: function( fnOver, fnOut ) {
		return this
			.on( "mouseenter", fnOver )
			.on( "mouseleave", fnOut || fnOver );
	}
} );

jQuery.each(
	( "blur focus focusin focusout resize scroll click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup contextmenu" ).split( " " ),
	function( _i, name ) {

		// Handle event binding
		jQuery.fn[ name ] = function( data, fn ) {
			return arguments.length > 0 ?
				this.on( name, null, data, fn ) :
				this.trigger( name );
		};
	}
);

// Bind a function to a context, optionally partially applying any
// arguments.
// jQuery.proxy is deprecated to promote standards (specifically Function#bind)
// However, it is not slated for removal any time soon
jQuery.proxy = function( fn, context ) {
	var tmp, args, proxy;

	if ( typeof context === "string" ) {
		tmp = fn[ context ];
		context = fn;
		fn = tmp;
	}

	// Quick check to determine if target is callable, in the spec
	// this throws a TypeError, but we will just return undefined.
	if ( typeof fn !== "function" ) {
		return undefined;
	}

	// Simulated bind
	args = slice.call( arguments, 2 );
	proxy = function() {
		return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
	};

	// Set the guid of unique handler to the same of original handler, so it can be removed
	proxy.guid = fn.guid = fn.guid || jQuery.guid++;

	return proxy;
};

jQuery.holdReady = function( hold ) {
	if ( hold ) {
		jQuery.readyWait++;
	} else {
		jQuery.ready( true );
	}
};

jQuery.expr[ ":" ] = jQuery.expr.filters = jQuery.expr.pseudos;

// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	} );
}

var

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in AMD
// (trac-7102#comment:10, gh-557)
// and CommonJS for browser emulators (trac-13566)
if ( typeof noGlobal === "undefined" ) {
	window.jQuery = window.$ = jQuery;
}

return jQuery;

}

var jQuery = jQueryFactory( window, true );



/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = ((/* unused pure expression or super */ null && (jQuery)));


/***/ },

/***/ 523
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  VERSION: () => (/* reexport */ VERSION),
  after: () => (/* reexport */ after),
  all: () => (/* reexport */ every),
  allKeys: () => (/* reexport */ allKeys),
  any: () => (/* reexport */ some),
  assign: () => (/* reexport */ extendOwn),
  before: () => (/* reexport */ before),
  bind: () => (/* reexport */ bind),
  bindAll: () => (/* reexport */ bindAll),
  chain: () => (/* reexport */ chain),
  chunk: () => (/* reexport */ chunk),
  clone: () => (/* reexport */ clone),
  collect: () => (/* reexport */ map),
  compact: () => (/* reexport */ compact),
  compose: () => (/* reexport */ compose),
  constant: () => (/* reexport */ constant),
  contains: () => (/* reexport */ contains),
  countBy: () => (/* reexport */ countBy),
  create: () => (/* reexport */ create),
  debounce: () => (/* reexport */ debounce),
  "default": () => (/* reexport */ index_default),
  defaults: () => (/* reexport */ defaults),
  defer: () => (/* reexport */ defer),
  delay: () => (/* reexport */ delay),
  detect: () => (/* reexport */ find),
  difference: () => (/* reexport */ difference),
  drop: () => (/* reexport */ rest),
  each: () => (/* reexport */ each),
  escape: () => (/* reexport */ modules_escape),
  every: () => (/* reexport */ every),
  extend: () => (/* reexport */ extend),
  extendOwn: () => (/* reexport */ extendOwn),
  filter: () => (/* reexport */ filter),
  find: () => (/* reexport */ find),
  findIndex: () => (/* reexport */ findIndex),
  findKey: () => (/* reexport */ findKey),
  findLastIndex: () => (/* reexport */ findLastIndex),
  findWhere: () => (/* reexport */ findWhere),
  first: () => (/* reexport */ first),
  flatten: () => (/* reexport */ flatten_flatten),
  foldl: () => (/* reexport */ reduce),
  foldr: () => (/* reexport */ reduceRight),
  forEach: () => (/* reexport */ each),
  functions: () => (/* reexport */ functions),
  get: () => (/* reexport */ get),
  groupBy: () => (/* reexport */ groupBy),
  has: () => (/* reexport */ has_has),
  head: () => (/* reexport */ first),
  identity: () => (/* reexport */ identity),
  include: () => (/* reexport */ contains),
  includes: () => (/* reexport */ contains),
  indexBy: () => (/* reexport */ indexBy),
  indexOf: () => (/* reexport */ indexOf),
  initial: () => (/* reexport */ initial),
  inject: () => (/* reexport */ reduce),
  intersection: () => (/* reexport */ intersection),
  invert: () => (/* reexport */ invert),
  invoke: () => (/* reexport */ invoke),
  isArguments: () => (/* reexport */ modules_isArguments),
  isArray: () => (/* reexport */ isArray),
  isArrayBuffer: () => (/* reexport */ isArrayBuffer),
  isBoolean: () => (/* reexport */ isBoolean),
  isDataView: () => (/* reexport */ modules_isDataView),
  isDate: () => (/* reexport */ isDate),
  isElement: () => (/* reexport */ isElement),
  isEmpty: () => (/* reexport */ isEmpty),
  isEqual: () => (/* reexport */ isEqual),
  isError: () => (/* reexport */ isError),
  isFinite: () => (/* reexport */ isFinite_isFinite),
  isFunction: () => (/* reexport */ modules_isFunction),
  isMap: () => (/* reexport */ isMap),
  isMatch: () => (/* reexport */ isMatch),
  isNaN: () => (/* reexport */ isNaN_isNaN),
  isNull: () => (/* reexport */ isNull),
  isNumber: () => (/* reexport */ isNumber),
  isObject: () => (/* reexport */ isObject),
  isRegExp: () => (/* reexport */ isRegExp),
  isSet: () => (/* reexport */ isSet),
  isString: () => (/* reexport */ isString),
  isSymbol: () => (/* reexport */ isSymbol),
  isTypedArray: () => (/* reexport */ modules_isTypedArray),
  isUndefined: () => (/* reexport */ isUndefined),
  isWeakMap: () => (/* reexport */ isWeakMap),
  isWeakSet: () => (/* reexport */ isWeakSet),
  iteratee: () => (/* reexport */ iteratee),
  keys: () => (/* reexport */ keys),
  last: () => (/* reexport */ last),
  lastIndexOf: () => (/* reexport */ lastIndexOf),
  map: () => (/* reexport */ map),
  mapObject: () => (/* reexport */ mapObject),
  matcher: () => (/* reexport */ matcher),
  matches: () => (/* reexport */ matcher),
  max: () => (/* reexport */ max),
  memoize: () => (/* reexport */ memoize),
  methods: () => (/* reexport */ functions),
  min: () => (/* reexport */ min),
  mixin: () => (/* reexport */ mixin),
  negate: () => (/* reexport */ negate),
  noop: () => (/* reexport */ noop),
  now: () => (/* reexport */ now),
  object: () => (/* reexport */ object),
  omit: () => (/* reexport */ omit),
  once: () => (/* reexport */ once),
  pairs: () => (/* reexport */ pairs),
  partial: () => (/* reexport */ modules_partial),
  partition: () => (/* reexport */ partition),
  pick: () => (/* reexport */ pick),
  pluck: () => (/* reexport */ pluck),
  property: () => (/* reexport */ property),
  propertyOf: () => (/* reexport */ propertyOf),
  random: () => (/* reexport */ random),
  range: () => (/* reexport */ range),
  reduce: () => (/* reexport */ reduce),
  reduceRight: () => (/* reexport */ reduceRight),
  reject: () => (/* reexport */ reject),
  rest: () => (/* reexport */ rest),
  restArguments: () => (/* reexport */ restArguments),
  result: () => (/* reexport */ result),
  sample: () => (/* reexport */ sample),
  select: () => (/* reexport */ filter),
  shuffle: () => (/* reexport */ shuffle),
  size: () => (/* reexport */ size),
  some: () => (/* reexport */ some),
  sortBy: () => (/* reexport */ sortBy),
  sortedIndex: () => (/* reexport */ sortedIndex),
  tail: () => (/* reexport */ rest),
  take: () => (/* reexport */ first),
  tap: () => (/* reexport */ tap),
  template: () => (/* reexport */ template),
  templateSettings: () => (/* reexport */ templateSettings),
  throttle: () => (/* reexport */ throttle),
  times: () => (/* reexport */ times),
  toArray: () => (/* reexport */ toArray),
  toPath: () => (/* reexport */ toPath),
  transpose: () => (/* reexport */ unzip),
  unescape: () => (/* reexport */ modules_unescape),
  union: () => (/* reexport */ union),
  uniq: () => (/* reexport */ uniq),
  unique: () => (/* reexport */ uniq),
  uniqueId: () => (/* reexport */ uniqueId),
  unzip: () => (/* reexport */ unzip),
  values: () => (/* reexport */ values),
  where: () => (/* reexport */ where),
  without: () => (/* reexport */ without),
  wrap: () => (/* reexport */ wrap),
  zip: () => (/* reexport */ zip)
});

// NAMESPACE OBJECT (decoupled): ./node_modules/underscore/modules/index.js
var modules_namespaceObject = {};
__webpack_require__.r(modules_namespaceObject);
__webpack_require__.d(modules_namespaceObject, {
  VERSION: () => (VERSION),
  after: () => (after),
  all: () => (every),
  allKeys: () => (allKeys),
  any: () => (some),
  assign: () => (extendOwn),
  before: () => (before),
  bind: () => (bind),
  bindAll: () => (bindAll),
  chain: () => (chain),
  chunk: () => (chunk),
  clone: () => (clone),
  collect: () => (map),
  compact: () => (compact),
  compose: () => (compose),
  constant: () => (constant),
  contains: () => (contains),
  countBy: () => (countBy),
  create: () => (create),
  debounce: () => (debounce),
  "default": () => (underscore_array_methods),
  defaults: () => (defaults),
  defer: () => (defer),
  delay: () => (delay),
  detect: () => (find),
  difference: () => (difference),
  drop: () => (rest),
  each: () => (each),
  escape: () => (modules_escape),
  every: () => (every),
  extend: () => (extend),
  extendOwn: () => (extendOwn),
  filter: () => (filter),
  find: () => (find),
  findIndex: () => (findIndex),
  findKey: () => (findKey),
  findLastIndex: () => (findLastIndex),
  findWhere: () => (findWhere),
  first: () => (first),
  flatten: () => (flatten_flatten),
  foldl: () => (reduce),
  foldr: () => (reduceRight),
  forEach: () => (each),
  functions: () => (functions),
  get: () => (get),
  groupBy: () => (groupBy),
  has: () => (has_has),
  head: () => (first),
  identity: () => (identity),
  include: () => (contains),
  includes: () => (contains),
  indexBy: () => (indexBy),
  indexOf: () => (indexOf),
  initial: () => (initial),
  inject: () => (reduce),
  intersection: () => (intersection),
  invert: () => (invert),
  invoke: () => (invoke),
  isArguments: () => (modules_isArguments),
  isArray: () => (isArray),
  isArrayBuffer: () => (isArrayBuffer),
  isBoolean: () => (isBoolean),
  isDataView: () => (modules_isDataView),
  isDate: () => (isDate),
  isElement: () => (isElement),
  isEmpty: () => (isEmpty),
  isEqual: () => (isEqual),
  isError: () => (isError),
  isFinite: () => (isFinite_isFinite),
  isFunction: () => (modules_isFunction),
  isMap: () => (isMap),
  isMatch: () => (isMatch),
  isNaN: () => (isNaN_isNaN),
  isNull: () => (isNull),
  isNumber: () => (isNumber),
  isObject: () => (isObject),
  isRegExp: () => (isRegExp),
  isSet: () => (isSet),
  isString: () => (isString),
  isSymbol: () => (isSymbol),
  isTypedArray: () => (modules_isTypedArray),
  isUndefined: () => (isUndefined),
  isWeakMap: () => (isWeakMap),
  isWeakSet: () => (isWeakSet),
  iteratee: () => (iteratee),
  keys: () => (keys),
  last: () => (last),
  lastIndexOf: () => (lastIndexOf),
  map: () => (map),
  mapObject: () => (mapObject),
  matcher: () => (matcher),
  matches: () => (matcher),
  max: () => (max),
  memoize: () => (memoize),
  methods: () => (functions),
  min: () => (min),
  mixin: () => (mixin),
  negate: () => (negate),
  noop: () => (noop),
  now: () => (now),
  object: () => (object),
  omit: () => (omit),
  once: () => (once),
  pairs: () => (pairs),
  partial: () => (modules_partial),
  partition: () => (partition),
  pick: () => (pick),
  pluck: () => (pluck),
  property: () => (property),
  propertyOf: () => (propertyOf),
  random: () => (random),
  range: () => (range),
  reduce: () => (reduce),
  reduceRight: () => (reduceRight),
  reject: () => (reject),
  rest: () => (rest),
  restArguments: () => (restArguments),
  result: () => (result),
  sample: () => (sample),
  select: () => (filter),
  shuffle: () => (shuffle),
  size: () => (size),
  some: () => (some),
  sortBy: () => (sortBy),
  sortedIndex: () => (sortedIndex),
  tail: () => (rest),
  take: () => (first),
  tap: () => (tap),
  template: () => (template),
  templateSettings: () => (templateSettings),
  throttle: () => (throttle),
  times: () => (times),
  toArray: () => (toArray),
  toPath: () => (toPath),
  transpose: () => (unzip),
  unescape: () => (modules_unescape),
  union: () => (union),
  uniq: () => (uniq),
  unique: () => (uniq),
  uniqueId: () => (uniqueId),
  unzip: () => (unzip),
  values: () => (values),
  where: () => (where),
  without: () => (without),
  wrap: () => (wrap),
  zip: () => (zip)
});

;// ./node_modules/underscore/modules/_setup.js
// Current version.
var VERSION = '1.13.8';

// Establish the root object, `window` (`self`) in the browser, `global`
// on the server, or `this` in some virtual machines. We use `self`
// instead of `window` for `WebWorker` support.
var root = (typeof self == 'object' && self.self === self && self) ||
          (typeof __webpack_require__.g == 'object' && __webpack_require__.g.global === __webpack_require__.g && __webpack_require__.g) ||
          Function('return this')() ||
          {};

// Save bytes in the minified (but not gzipped) version:
var ArrayProto = Array.prototype, ObjProto = Object.prototype;
var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

// Create quick reference variables for speed access to core prototypes.
var push = ArrayProto.push,
    slice = ArrayProto.slice,
    _setup_toString = ObjProto.toString,
    _setup_hasOwnProperty = ObjProto.hasOwnProperty;

// Modern feature detection.
var supportsArrayBuffer = typeof ArrayBuffer !== 'undefined',
    supportsDataView = typeof DataView !== 'undefined';

// All **ECMAScript 5+** native function implementations that we hope to use
// are declared here.
var nativeIsArray = Array.isArray,
    nativeKeys = Object.keys,
    nativeCreate = Object.create,
    nativeIsView = supportsArrayBuffer && ArrayBuffer.isView;

// Create references to these builtin functions because we override them.
var _isNaN = isNaN,
    _isFinite = isFinite;

// Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
  'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

// The largest integer that can be represented exactly.
var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;

;// ./node_modules/underscore/modules/restArguments.js
// Some functions take a variable number of arguments, or a few expected
// arguments at the beginning and then a variable number of values to operate
// on. This helper accumulates all remaining arguments past the function’s
// argument length (or an explicit `startIndex`), into an array that becomes
// the last argument. Similar to ES6’s "rest parameter".
function restArguments(func, startIndex) {
  startIndex = startIndex == null ? func.length - 1 : +startIndex;
  return function() {
    var length = Math.max(arguments.length - startIndex, 0),
        rest = Array(length),
        index = 0;
    for (; index < length; index++) {
      rest[index] = arguments[index + startIndex];
    }
    switch (startIndex) {
      case 0: return func.call(this, rest);
      case 1: return func.call(this, arguments[0], rest);
      case 2: return func.call(this, arguments[0], arguments[1], rest);
    }
    var args = Array(startIndex + 1);
    for (index = 0; index < startIndex; index++) {
      args[index] = arguments[index];
    }
    args[startIndex] = rest;
    return func.apply(this, args);
  };
}

;// ./node_modules/underscore/modules/isObject.js
// Is a given variable an object?
function isObject(obj) {
  var type = typeof obj;
  return type === 'function' || (type === 'object' && !!obj);
}

;// ./node_modules/underscore/modules/isNull.js
// Is a given value equal to null?
function isNull(obj) {
  return obj === null;
}

;// ./node_modules/underscore/modules/isUndefined.js
// Is a given variable undefined?
function isUndefined(obj) {
  return obj === void 0;
}

;// ./node_modules/underscore/modules/isBoolean.js


// Is a given value a boolean?
function isBoolean(obj) {
  return obj === true || obj === false || _setup_toString.call(obj) === '[object Boolean]';
}

;// ./node_modules/underscore/modules/isElement.js
// Is a given value a DOM element?
function isElement(obj) {
  return !!(obj && obj.nodeType === 1);
}

;// ./node_modules/underscore/modules/_tagTester.js


// Internal function for creating a `toString`-based type tester.
function tagTester(name) {
  var tag = '[object ' + name + ']';
  return function(obj) {
    return _setup_toString.call(obj) === tag;
  };
}

;// ./node_modules/underscore/modules/isString.js


/* harmony default export */ const isString = (tagTester('String'));

;// ./node_modules/underscore/modules/isNumber.js


/* harmony default export */ const isNumber = (tagTester('Number'));

;// ./node_modules/underscore/modules/isDate.js


/* harmony default export */ const isDate = (tagTester('Date'));

;// ./node_modules/underscore/modules/isRegExp.js


/* harmony default export */ const isRegExp = (tagTester('RegExp'));

;// ./node_modules/underscore/modules/isError.js


/* harmony default export */ const isError = (tagTester('Error'));

;// ./node_modules/underscore/modules/isSymbol.js


/* harmony default export */ const isSymbol = (tagTester('Symbol'));

;// ./node_modules/underscore/modules/isArrayBuffer.js


/* harmony default export */ const isArrayBuffer = (tagTester('ArrayBuffer'));

;// ./node_modules/underscore/modules/isFunction.js



var isFunction = tagTester('Function');

// Optimize `isFunction` if appropriate. Work around some `typeof` bugs in old
// v8, IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).
var nodelist = root.document && root.document.childNodes;
if ( true && typeof Int8Array != 'object' && typeof nodelist != 'function') {
  isFunction = function(obj) {
    return typeof obj == 'function' || false;
  };
}

/* harmony default export */ const modules_isFunction = (isFunction);

;// ./node_modules/underscore/modules/_hasObjectTag.js


/* harmony default export */ const _hasObjectTag = (tagTester('Object'));

;// ./node_modules/underscore/modules/_stringTagBug.js



// In IE 10 - Edge 13, `DataView` has string tag `'[object Object]'`.
// In IE 11, the most common among them, this problem also applies to
// `Map`, `WeakMap` and `Set`.
// Also, there are cases where an application can override the native
// `DataView` object, in cases like that we can't use the constructor
// safely and should just rely on alternate `DataView` checks
var hasDataViewBug = (
      supportsDataView && (!/\[native code\]/.test(String(DataView)) || _hasObjectTag(new DataView(new ArrayBuffer(8))))
    ),
    isIE11 = (typeof Map !== 'undefined' && _hasObjectTag(new Map));

;// ./node_modules/underscore/modules/isDataView.js





var isDataView = tagTester('DataView');

// In IE 10 - Edge 13, we need a different heuristic
// to determine whether an object is a `DataView`.
// Also, in cases where the native `DataView` is
// overridden we can't rely on the tag itself.
function alternateIsDataView(obj) {
  return obj != null && modules_isFunction(obj.getInt8) && isArrayBuffer(obj.buffer);
}

/* harmony default export */ const modules_isDataView = (hasDataViewBug ? alternateIsDataView : isDataView);

;// ./node_modules/underscore/modules/isArray.js



// Is a given value an array?
// Delegates to ECMA5's native `Array.isArray`.
/* harmony default export */ const isArray = (nativeIsArray || tagTester('Array'));

;// ./node_modules/underscore/modules/_has.js


// Internal function to check whether `key` is an own property name of `obj`.
function has(obj, key) {
  return obj != null && _setup_hasOwnProperty.call(obj, key);
}

;// ./node_modules/underscore/modules/isArguments.js



var isArguments = tagTester('Arguments');

// Define a fallback version of the method in browsers (ahem, IE < 9), where
// there isn't any inspectable "Arguments" type.
(function() {
  if (!isArguments(arguments)) {
    isArguments = function(obj) {
      return has(obj, 'callee');
    };
  }
}());

/* harmony default export */ const modules_isArguments = (isArguments);

;// ./node_modules/underscore/modules/isFinite.js



// Is a given object a finite number?
function isFinite_isFinite(obj) {
  return !isSymbol(obj) && _isFinite(obj) && !isNaN(parseFloat(obj));
}

;// ./node_modules/underscore/modules/isNaN.js



// Is the given value `NaN`?
function isNaN_isNaN(obj) {
  return isNumber(obj) && _isNaN(obj);
}

;// ./node_modules/underscore/modules/constant.js
// Predicate-generating function. Often useful outside of Underscore.
function constant(value) {
  return function() {
    return value;
  };
}

;// ./node_modules/underscore/modules/_createSizePropertyCheck.js


// Common internal logic for `isArrayLike` and `isBufferLike`.
function createSizePropertyCheck(getSizeProperty) {
  return function(collection) {
    var sizeProperty = getSizeProperty(collection);
    return typeof sizeProperty == 'number' && sizeProperty >= 0 && sizeProperty <= MAX_ARRAY_INDEX;
  }
}

;// ./node_modules/underscore/modules/_shallowProperty.js
// Internal helper to generate a function to obtain property `key` from `obj`.
function shallowProperty(key) {
  return function(obj) {
    return obj == null ? void 0 : obj[key];
  };
}

;// ./node_modules/underscore/modules/_getByteLength.js


// Internal helper to obtain the `byteLength` property of an object.
/* harmony default export */ const _getByteLength = (shallowProperty('byteLength'));

;// ./node_modules/underscore/modules/_isBufferLike.js



// Internal helper to determine whether we should spend extensive checks against
// `ArrayBuffer` et al.
/* harmony default export */ const _isBufferLike = (createSizePropertyCheck(_getByteLength));

;// ./node_modules/underscore/modules/isTypedArray.js





// Is a given value a typed array?
var typedArrayPattern = /\[object ((I|Ui)nt(8|16|32)|Float(32|64)|Uint8Clamped|Big(I|Ui)nt64)Array\]/;
function isTypedArray(obj) {
  // `ArrayBuffer.isView` is the most future-proof, so use it when available.
  // Otherwise, fall back on the above regular expression.
  return nativeIsView ? (nativeIsView(obj) && !modules_isDataView(obj)) :
                _isBufferLike(obj) && typedArrayPattern.test(_setup_toString.call(obj));
}

/* harmony default export */ const modules_isTypedArray = (supportsArrayBuffer ? isTypedArray : constant(false));

;// ./node_modules/underscore/modules/_getLength.js


// Internal helper to obtain the `length` property of an object.
/* harmony default export */ const _getLength = (shallowProperty('length'));

;// ./node_modules/underscore/modules/_collectNonEnumProps.js




// Internal helper to create a simple lookup structure.
// `collectNonEnumProps` used to depend on `_.contains`, but this led to
// circular imports. `emulatedSet` is a one-off solution that only works for
// arrays of strings.
function emulatedSet(keys) {
  var hash = {};
  for (var l = keys.length, i = 0; i < l; ++i) hash[keys[i]] = true;
  return {
    contains: function(key) { return hash[key] === true; },
    push: function(key) {
      hash[key] = true;
      return keys.push(key);
    }
  };
}

// Internal helper. Checks `keys` for the presence of keys in IE < 9 that won't
// be iterated by `for key in ...` and thus missed. Extends `keys` in place if
// needed.
function collectNonEnumProps(obj, keys) {
  keys = emulatedSet(keys);
  var nonEnumIdx = nonEnumerableProps.length;
  var constructor = obj.constructor;
  var proto = (modules_isFunction(constructor) && constructor.prototype) || ObjProto;

  // Constructor is a special case.
  var prop = 'constructor';
  if (has(obj, prop) && !keys.contains(prop)) keys.push(prop);

  while (nonEnumIdx--) {
    prop = nonEnumerableProps[nonEnumIdx];
    if (prop in obj && obj[prop] !== proto[prop] && !keys.contains(prop)) {
      keys.push(prop);
    }
  }
}

;// ./node_modules/underscore/modules/keys.js





// Retrieve the names of an object's own properties.
// Delegates to **ECMAScript 5**'s native `Object.keys`.
function keys(obj) {
  if (!isObject(obj)) return [];
  if (nativeKeys) return nativeKeys(obj);
  var keys = [];
  for (var key in obj) if (has(obj, key)) keys.push(key);
  // Ahem, IE < 9.
  if (hasEnumBug) collectNonEnumProps(obj, keys);
  return keys;
}

;// ./node_modules/underscore/modules/isEmpty.js






// Is a given array, string, or object empty?
// An "empty" object has no enumerable own-properties.
function isEmpty(obj) {
  if (obj == null) return true;
  // Skip the more expensive `toString`-based type checks if `obj` has no
  // `.length`.
  var length = _getLength(obj);
  if (typeof length == 'number' && (
    isArray(obj) || isString(obj) || modules_isArguments(obj)
  )) return length === 0;
  return _getLength(keys(obj)) === 0;
}

;// ./node_modules/underscore/modules/isMatch.js


// Returns whether an object has a given set of `key:value` pairs.
function isMatch(object, attrs) {
  var _keys = keys(attrs), length = _keys.length;
  if (object == null) return !length;
  var obj = Object(object);
  for (var i = 0; i < length; i++) {
    var key = _keys[i];
    if (attrs[key] !== obj[key] || !(key in obj)) return false;
  }
  return true;
}

;// ./node_modules/underscore/modules/underscore.js


// If Underscore is called as a function, it returns a wrapped object that can
// be used OO-style. This wrapper holds altered versions of all functions added
// through `_.mixin`. Wrapped objects may be chained.
function _(obj) {
  if (obj instanceof _) return obj;
  if (!(this instanceof _)) return new _(obj);
  this._wrapped = obj;
}

_.VERSION = VERSION;

// Extracts the result from a wrapped and chained object.
_.prototype.value = function() {
  return this._wrapped;
};

// Provide unwrapping proxies for some methods used in engine operations
// such as arithmetic and JSON stringification.
_.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

_.prototype.toString = function() {
  return String(this._wrapped);
};

;// ./node_modules/underscore/modules/_toBufferView.js


// Internal function to wrap or shallow-copy an ArrayBuffer,
// typed array or DataView to a new view, reusing the buffer.
function toBufferView(bufferSource) {
  return new Uint8Array(
    bufferSource.buffer || bufferSource,
    bufferSource.byteOffset || 0,
    _getByteLength(bufferSource)
  );
}

;// ./node_modules/underscore/modules/isEqual.js











// We use this string twice, so give it a name for minification.
var tagDataView = '[object DataView]';

// Perform a deep comparison to check if two objects are equal.
function isEqual(a, b) {
  var todo = [{a: a, b: b}];
  // Initializing stacks of traversed objects for cycle detection.
  var aStack = [], bStack = [];

  while (todo.length) {
    var frame = todo.pop();
    if (frame === true) {
      // Remove the first object from the stack of traversed objects.
      aStack.pop();
      bStack.pop();
      continue;
    }
    a = frame.a;
    b = frame.b;

    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](https://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) {
      if (a !== 0 || 1 / a === 1 / b) continue;
      return false;
    }
    // `null` or `undefined` only equal to itself (strict comparison).
    if (a == null || b == null) return false;
    // `NaN`s are equivalent, but non-reflexive.
    if (a !== a) {
      if (b !== b) continue;
      return false;
    }
    // Exhaust primitive checks
    var type = typeof a;
    if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;

// Internal recursive comparison function for `_.isEqual`.
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = _setup_toString.call(a);
    if (className !== _setup_toString.call(b)) return false;
    // Work around a bug in IE 10 - Edge 13.
    if (hasDataViewBug && className == '[object Object]' && modules_isDataView(a)) {
      if (!modules_isDataView(b)) return false;
      className = tagDataView;
    }
    switch (className) {
      // These types are compared by value.
    case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
    case '[object String]':
      // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
      // equivalent to `new String("5")`.
      if ('' + a === '' + b) continue;
      return false;
    case '[object Number]':
      todo.push({a: +a, b: +b});
      continue;
    case '[object Date]':
    case '[object Boolean]':
      // Coerce dates and booleans to numeric primitive values. Dates are compared by their
      // millisecond representations. Note that invalid dates with millisecond representations
      // of `NaN` are not equivalent.
      if (+a === +b) continue;
      return false;
    case '[object Symbol]':
      if (SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b)) continue;
      return false;
    case '[object ArrayBuffer]':
    case tagDataView:
      // Coerce to typed array so we can fall through.
      todo.push({a: toBufferView(a), b: toBufferView(b)});
      continue;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays && modules_isTypedArray(a)) {
      var byteLength = _getByteLength(a);
      if (byteLength !== _getByteLength(b)) return false;
      if (a.buffer === b.buffer && a.byteOffset === b.byteOffset) continue;
      areArrays = true;
    }
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(modules_isFunction(aCtor) && aCtor instanceof aCtor &&
                               modules_isFunction(bCtor) && bCtor instanceof bCtor)
          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }

    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) {
        if (bStack[length] === b) break;
        return false;
      }
    }
    if (length >= 0) continue;

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    todo.push(true);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        todo.push({a: a[length], b: b[length]});
      }
    } else {
      // Deep compare objects.
      var _keys = keys(a), key;
      length = _keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = _keys[length];
        if (!has(b, key)) return false;
        todo.push({a: a[key], b: b[key]});
      }
    }
  }
  return true;
}

;// ./node_modules/underscore/modules/allKeys.js




// Retrieve all the enumerable property names of an object.
function allKeys(obj) {
  if (!isObject(obj)) return [];
  var keys = [];
  for (var key in obj) keys.push(key);
  // Ahem, IE < 9.
  if (hasEnumBug) collectNonEnumProps(obj, keys);
  return keys;
}

;// ./node_modules/underscore/modules/_methodFingerprint.js




// Since the regular `Object.prototype.toString` type tests don't work for
// some types in IE 11, we use a fingerprinting heuristic instead, based
// on the methods. It's not great, but it's the best we got.
// The fingerprint method lists are defined below.
function ie11fingerprint(methods) {
  var length = _getLength(methods);
  return function(obj) {
    if (obj == null) return false;
    // `Map`, `WeakMap` and `Set` have no enumerable keys.
    var keys = allKeys(obj);
    if (_getLength(keys)) return false;
    for (var i = 0; i < length; i++) {
      if (!modules_isFunction(obj[methods[i]])) return false;
    }
    // If we are testing against `WeakMap`, we need to ensure that
    // `obj` doesn't have a `forEach` method in order to distinguish
    // it from a regular `Map`.
    return methods !== weakMapMethods || !modules_isFunction(obj[forEachName]);
  };
}

// In the interest of compact minification, we write
// each string in the fingerprints only once.
var forEachName = 'forEach',
    hasName = 'has',
    commonInit = ['clear', 'delete'],
    mapTail = ['get', hasName, 'set'];

// `Map`, `WeakMap` and `Set` each have slightly different
// combinations of the above sublists.
var mapMethods = commonInit.concat(forEachName, mapTail),
    weakMapMethods = commonInit.concat(mapTail),
    setMethods = ['add'].concat(commonInit, forEachName, hasName);

;// ./node_modules/underscore/modules/isMap.js




/* harmony default export */ const isMap = (isIE11 ? ie11fingerprint(mapMethods) : tagTester('Map'));

;// ./node_modules/underscore/modules/isWeakMap.js




/* harmony default export */ const isWeakMap = (isIE11 ? ie11fingerprint(weakMapMethods) : tagTester('WeakMap'));

;// ./node_modules/underscore/modules/isSet.js




/* harmony default export */ const isSet = (isIE11 ? ie11fingerprint(setMethods) : tagTester('Set'));

;// ./node_modules/underscore/modules/isWeakSet.js


/* harmony default export */ const isWeakSet = (tagTester('WeakSet'));

;// ./node_modules/underscore/modules/values.js


// Retrieve the values of an object's properties.
function values(obj) {
  var _keys = keys(obj);
  var length = _keys.length;
  var values = Array(length);
  for (var i = 0; i < length; i++) {
    values[i] = obj[_keys[i]];
  }
  return values;
}

;// ./node_modules/underscore/modules/pairs.js


// Convert an object into a list of `[key, value]` pairs.
// The opposite of `_.object` with one argument.
function pairs(obj) {
  var _keys = keys(obj);
  var length = _keys.length;
  var pairs = Array(length);
  for (var i = 0; i < length; i++) {
    pairs[i] = [_keys[i], obj[_keys[i]]];
  }
  return pairs;
}

;// ./node_modules/underscore/modules/invert.js


// Invert the keys and values of an object. The values must be serializable.
function invert(obj) {
  var result = {};
  var _keys = keys(obj);
  for (var i = 0, length = _keys.length; i < length; i++) {
    result[obj[_keys[i]]] = _keys[i];
  }
  return result;
}

;// ./node_modules/underscore/modules/functions.js


// Return a sorted list of the function names available on the object.
function functions(obj) {
  var names = [];
  for (var key in obj) {
    if (modules_isFunction(obj[key])) names.push(key);
  }
  return names.sort();
}

;// ./node_modules/underscore/modules/_createAssigner.js
// An internal function for creating assigner functions.
function createAssigner(keysFunc, defaults) {
  return function(obj) {
    var length = arguments.length;
    if (defaults) obj = Object(obj);
    if (length < 2 || obj == null) return obj;
    for (var index = 1; index < length; index++) {
      var source = arguments[index],
          keys = keysFunc(source),
          l = keys.length;
      for (var i = 0; i < l; i++) {
        var key = keys[i];
        if (!defaults || obj[key] === void 0) obj[key] = source[key];
      }
    }
    return obj;
  };
}

;// ./node_modules/underscore/modules/extend.js



// Extend a given object with all the properties in passed-in object(s).
/* harmony default export */ const extend = (createAssigner(allKeys));

;// ./node_modules/underscore/modules/extendOwn.js



// Assigns a given object with all the own properties in the passed-in
// object(s).
// (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
/* harmony default export */ const extendOwn = (createAssigner(keys));

;// ./node_modules/underscore/modules/defaults.js



// Fill in a given object with default properties.
/* harmony default export */ const defaults = (createAssigner(allKeys, true));

;// ./node_modules/underscore/modules/_baseCreate.js



// Create a naked function reference for surrogate-prototype-swapping.
function ctor() {
  return function(){};
}

// An internal function for creating a new object that inherits from another.
function baseCreate(prototype) {
  if (!isObject(prototype)) return {};
  if (nativeCreate) return nativeCreate(prototype);
  var Ctor = ctor();
  Ctor.prototype = prototype;
  var result = new Ctor;
  Ctor.prototype = null;
  return result;
}

;// ./node_modules/underscore/modules/create.js



// Creates an object that inherits from the given prototype object.
// If additional properties are provided then they will be added to the
// created object.
function create(prototype, props) {
  var result = baseCreate(prototype);
  if (props) extendOwn(result, props);
  return result;
}

;// ./node_modules/underscore/modules/clone.js




// Create a (shallow-cloned) duplicate of an object.
function clone(obj) {
  if (!isObject(obj)) return obj;
  return isArray(obj) ? obj.slice() : extend({}, obj);
}

;// ./node_modules/underscore/modules/tap.js
// Invokes `interceptor` with the `obj` and then returns `obj`.
// The primary purpose of this method is to "tap into" a method chain, in
// order to perform operations on intermediate results within the chain.
function tap(obj, interceptor) {
  interceptor(obj);
  return obj;
}

;// ./node_modules/underscore/modules/toPath.js



// Normalize a (deep) property `path` to array.
// Like `_.iteratee`, this function can be customized.
function toPath(path) {
  return isArray(path) ? path : [path];
}
_.toPath = toPath;

;// ./node_modules/underscore/modules/_toPath.js



// Internal wrapper for `_.toPath` to enable minification.
// Similar to `cb` for `_.iteratee`.
function _toPath_toPath(path) {
  return _.toPath(path);
}

;// ./node_modules/underscore/modules/_deepGet.js
// Internal function to obtain a nested property in `obj` along `path`.
function deepGet(obj, path) {
  var length = path.length;
  for (var i = 0; i < length; i++) {
    if (obj == null) return void 0;
    obj = obj[path[i]];
  }
  return length ? obj : void 0;
}

;// ./node_modules/underscore/modules/get.js




// Get the value of the (deep) property on `path` from `object`.
// If any property in `path` does not exist or if the value is
// `undefined`, return `defaultValue` instead.
// The `path` is normalized through `_.toPath`.
function get(object, path, defaultValue) {
  var value = deepGet(object, _toPath_toPath(path));
  return isUndefined(value) ? defaultValue : value;
}

;// ./node_modules/underscore/modules/has.js



// Shortcut function for checking if an object has a given property directly on
// itself (in other words, not on a prototype). Unlike the internal `has`
// function, this public version can also traverse nested properties.
function has_has(obj, path) {
  path = _toPath_toPath(path);
  var length = path.length;
  for (var i = 0; i < length; i++) {
    var key = path[i];
    if (!has(obj, key)) return false;
    obj = obj[key];
  }
  return !!length;
}

;// ./node_modules/underscore/modules/identity.js
// Keep the identity function around for default iteratees.
function identity(value) {
  return value;
}

;// ./node_modules/underscore/modules/matcher.js



// Returns a predicate for checking whether an object has a given set of
// `key:value` pairs.
function matcher(attrs) {
  attrs = extendOwn({}, attrs);
  return function(obj) {
    return isMatch(obj, attrs);
  };
}

;// ./node_modules/underscore/modules/property.js



// Creates a function that, when passed an object, will traverse that object’s
// properties down the given `path`, specified as an array of keys or indices.
function property(path) {
  path = _toPath_toPath(path);
  return function(obj) {
    return deepGet(obj, path);
  };
}

;// ./node_modules/underscore/modules/_optimizeCb.js
// Internal function that returns an efficient (for current engines) version
// of the passed-in callback, to be repeatedly applied in other Underscore
// functions.
function optimizeCb(func, context, argCount) {
  if (context === void 0) return func;
  switch (argCount == null ? 3 : argCount) {
    case 1: return function(value) {
      return func.call(context, value);
    };
    // The 2-argument case is omitted because we’re not using it.
    case 3: return function(value, index, collection) {
      return func.call(context, value, index, collection);
    };
    case 4: return function(accumulator, value, index, collection) {
      return func.call(context, accumulator, value, index, collection);
    };
  }
  return function() {
    return func.apply(context, arguments);
  };
}

;// ./node_modules/underscore/modules/_baseIteratee.js








// An internal function to generate callbacks that can be applied to each
// element in a collection, returning the desired result — either `_.identity`,
// an arbitrary callback, a property matcher, or a property accessor.
function baseIteratee(value, context, argCount) {
  if (value == null) return identity;
  if (modules_isFunction(value)) return optimizeCb(value, context, argCount);
  if (isObject(value) && !isArray(value)) return matcher(value);
  return property(value);
}

;// ./node_modules/underscore/modules/iteratee.js



// External wrapper for our callback generator. Users may customize
// `_.iteratee` if they want additional predicate/iteratee shorthand styles.
// This abstraction hides the internal-only `argCount` argument.
function iteratee(value, context) {
  return baseIteratee(value, context, Infinity);
}
_.iteratee = iteratee;

;// ./node_modules/underscore/modules/_cb.js




// The function we call internally to generate a callback. It invokes
// `_.iteratee` if overridden, otherwise `baseIteratee`.
function cb(value, context, argCount) {
  if (_.iteratee !== iteratee) return _.iteratee(value, context);
  return baseIteratee(value, context, argCount);
}

;// ./node_modules/underscore/modules/mapObject.js



// Returns the results of applying the `iteratee` to each element of `obj`.
// In contrast to `_.map` it returns an object.
function mapObject(obj, iteratee, context) {
  iteratee = cb(iteratee, context);
  var _keys = keys(obj),
      length = _keys.length,
      results = {};
  for (var index = 0; index < length; index++) {
    var currentKey = _keys[index];
    results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
  }
  return results;
}

;// ./node_modules/underscore/modules/noop.js
// Predicate-generating function. Often useful outside of Underscore.
function noop(){}

;// ./node_modules/underscore/modules/propertyOf.js



// Generates a function for a given object that returns a given property.
function propertyOf(obj) {
  if (obj == null) return noop;
  return function(path) {
    return get(obj, path);
  };
}

;// ./node_modules/underscore/modules/times.js


// Run a function **n** times.
function times(n, iteratee, context) {
  var accum = Array(Math.max(0, n));
  iteratee = optimizeCb(iteratee, context, 1);
  for (var i = 0; i < n; i++) accum[i] = iteratee(i);
  return accum;
}

;// ./node_modules/underscore/modules/random.js
// Return a random integer between `min` and `max` (inclusive).
function random(min, max) {
  if (max == null) {
    max = min;
    min = 0;
  }
  return min + Math.floor(Math.random() * (max - min + 1));
}

;// ./node_modules/underscore/modules/now.js
// A (possibly faster) way to get the current timestamp as an integer.
/* harmony default export */ const now = (Date.now || function() {
  return new Date().getTime();
});

;// ./node_modules/underscore/modules/_createEscaper.js


// Internal helper to generate functions for escaping and unescaping strings
// to/from HTML interpolation.
function createEscaper(map) {
  var escaper = function(match) {
    return map[match];
  };
  // Regexes for identifying a key that needs to be escaped.
  var source = '(?:' + keys(map).join('|') + ')';
  var testRegexp = RegExp(source);
  var replaceRegexp = RegExp(source, 'g');
  return function(string) {
    string = string == null ? '' : '' + string;
    return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
  };
}

;// ./node_modules/underscore/modules/_escapeMap.js
// Internal list of HTML entities for escaping.
/* harmony default export */ const _escapeMap = ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;'
});

;// ./node_modules/underscore/modules/escape.js



// Function for escaping strings to HTML interpolation.
/* harmony default export */ const modules_escape = (createEscaper(_escapeMap));

;// ./node_modules/underscore/modules/_unescapeMap.js



// Internal list of HTML entities for unescaping.
/* harmony default export */ const _unescapeMap = (invert(_escapeMap));

;// ./node_modules/underscore/modules/unescape.js



// Function for unescaping strings from HTML interpolation.
/* harmony default export */ const modules_unescape = (createEscaper(_unescapeMap));

;// ./node_modules/underscore/modules/templateSettings.js


// By default, Underscore uses ERB-style template delimiters. Change the
// following template settings to use alternative delimiters.
/* harmony default export */ const templateSettings = (_.templateSettings = {
  evaluate: /<%([\s\S]+?)%>/g,
  interpolate: /<%=([\s\S]+?)%>/g,
  escape: /<%-([\s\S]+?)%>/g
});

;// ./node_modules/underscore/modules/template.js




// When customizing `_.templateSettings`, if you don't want to define an
// interpolation, evaluation or escaping regex, we need one that is
// guaranteed not to match.
var noMatch = /(.)^/;

// Certain characters need to be escaped so that they can be put into a
// string literal.
var escapes = {
  "'": "'",
  '\\': '\\',
  '\r': 'r',
  '\n': 'n',
  '\u2028': 'u2028',
  '\u2029': 'u2029'
};

var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

function escapeChar(match) {
  return '\\' + escapes[match];
}

// In order to prevent third-party code injection through
// `_.templateSettings.variable`, we test it against the following regular
// expression. It is intentionally a bit more liberal than just matching valid
// identifiers, but still prevents possible loopholes through defaults or
// destructuring assignment.
var bareIdentifier = /^\s*(\w|\$)+\s*$/;

// JavaScript micro-templating, similar to John Resig's implementation.
// Underscore templating handles arbitrary delimiters, preserves whitespace,
// and correctly escapes quotes within interpolated code.
// NB: `oldSettings` only exists for backwards compatibility.
function template(text, settings, oldSettings) {
  if (!settings && oldSettings) settings = oldSettings;
  settings = defaults({}, settings, _.templateSettings);

  // Combine delimiters into one regular expression via alternation.
  var matcher = RegExp([
    (settings.escape || noMatch).source,
    (settings.interpolate || noMatch).source,
    (settings.evaluate || noMatch).source
  ].join('|') + '|$', 'g');

  // Compile the template source, escaping string literals appropriately.
  var index = 0;
  var source = "__p+='";
  text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
    source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
    index = offset + match.length;

    if (escape) {
      source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
    } else if (interpolate) {
      source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
    } else if (evaluate) {
      source += "';\n" + evaluate + "\n__p+='";
    }

    // Adobe VMs need the match returned to produce the correct offset.
    return match;
  });
  source += "';\n";

  var argument = settings.variable;
  if (argument) {
    // Insure against third-party code injection. (CVE-2021-23358)
    if (!bareIdentifier.test(argument)) throw new Error(
      'variable is not a bare identifier: ' + argument
    );
  } else {
    // If a variable is not specified, place data values in local scope.
    source = 'with(obj||{}){\n' + source + '}\n';
    argument = 'obj';
  }

  source = "var __t,__p='',__j=Array.prototype.join," +
    "print=function(){__p+=__j.call(arguments,'');};\n" +
    source + 'return __p;\n';

  var render;
  try {
    render = new Function(argument, '_', source);
  } catch (e) {
    e.source = source;
    throw e;
  }

  var template = function(data) {
    return render.call(this, data, _);
  };

  // Provide the compiled source as a convenience for precompilation.
  template.source = 'function(' + argument + '){\n' + source + '}';

  return template;
}

;// ./node_modules/underscore/modules/result.js



// Traverses the children of `obj` along `path`. If a child is a function, it
// is invoked with its parent as context. Returns the value of the final
// child, or `fallback` if any child is undefined.
function result(obj, path, fallback) {
  path = _toPath_toPath(path);
  var length = path.length;
  if (!length) {
    return modules_isFunction(fallback) ? fallback.call(obj) : fallback;
  }
  for (var i = 0; i < length; i++) {
    var prop = obj == null ? void 0 : obj[path[i]];
    if (prop === void 0) {
      prop = fallback;
      i = length; // Ensure we don't continue iterating.
    }
    obj = modules_isFunction(prop) ? prop.call(obj) : prop;
  }
  return obj;
}

;// ./node_modules/underscore/modules/uniqueId.js
// Generate a unique integer id (unique within the entire client session).
// Useful for temporary DOM ids.
var idCounter = 0;
function uniqueId(prefix) {
  var id = ++idCounter + '';
  return prefix ? prefix + id : id;
}

;// ./node_modules/underscore/modules/chain.js


// Start chaining a wrapped Underscore object.
function chain(obj) {
  var instance = _(obj);
  instance._chain = true;
  return instance;
}

;// ./node_modules/underscore/modules/_executeBound.js



// Internal function to execute `sourceFunc` bound to `context` with optional
// `args`. Determines whether to execute a function as a constructor or as a
// normal function.
function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
  if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
  var self = baseCreate(sourceFunc.prototype);
  var result = sourceFunc.apply(self, args);
  if (isObject(result)) return result;
  return self;
}

;// ./node_modules/underscore/modules/partial.js




// Partially apply a function by creating a version that has had some of its
// arguments pre-filled, without changing its dynamic `this` context. `_` acts
// as a placeholder by default, allowing any combination of arguments to be
// pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.
var partial = restArguments(function(func, boundArgs) {
  var placeholder = partial.placeholder;
  var bound = function() {
    var position = 0, length = boundArgs.length;
    var args = Array(length);
    for (var i = 0; i < length; i++) {
      args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
    }
    while (position < arguments.length) args.push(arguments[position++]);
    return executeBound(func, bound, this, this, args);
  };
  return bound;
});

partial.placeholder = _;
/* harmony default export */ const modules_partial = (partial);

;// ./node_modules/underscore/modules/bind.js




// Create a function bound to a given object (assigning `this`, and arguments,
// optionally).
/* harmony default export */ const bind = (restArguments(function(func, context, args) {
  if (!modules_isFunction(func)) throw new TypeError('Bind must be called on a function');
  var bound = restArguments(function(callArgs) {
    return executeBound(func, bound, context, this, args.concat(callArgs));
  });
  return bound;
}));

;// ./node_modules/underscore/modules/_isArrayLike.js



// Internal helper for collection methods to determine whether a collection
// should be iterated as an array or as an object.
// Related: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
// Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
/* harmony default export */ const _isArrayLike = (createSizePropertyCheck(_getLength));

;// ./node_modules/underscore/modules/_flatten.js





// Internal implementation of a recursive `flatten` function.
function flatten(input, depth, strict) {
  if (!depth && depth !== 0) depth = Infinity;
  var output = [], idx = 0, i = 0, length = _getLength(input) || 0, stack = [];
  while (true) {
    if (i >= length) {
      if (!stack.length) break;
      var frame = stack.pop();
      i = frame.i;
      input = frame.v;
      length = _getLength(input);
      continue;
    }
    var value = input[i++];
    if (stack.length >= depth) {
      output[idx++] = value;
    } else if (_isArrayLike(value) && (isArray(value) || modules_isArguments(value))) {
      // Flatten current level of array or arguments object.
      stack.push({i: i, v: input});
      i = 0;
      input = value;
      length = _getLength(input);
    } else if (!strict) {
      output[idx++] = value;
    }
  }
  return output;
}

;// ./node_modules/underscore/modules/bindAll.js




// Bind a number of an object's methods to that object. Remaining arguments
// are the method names to be bound. Useful for ensuring that all callbacks
// defined on an object belong to it.
/* harmony default export */ const bindAll = (restArguments(function(obj, keys) {
  keys = flatten(keys, false, false);
  var index = keys.length;
  if (index < 1) throw new Error('bindAll must be passed function names');
  while (index--) {
    var key = keys[index];
    obj[key] = bind(obj[key], obj);
  }
  return obj;
}));

;// ./node_modules/underscore/modules/memoize.js


// Memoize an expensive function by storing its results.
function memoize(func, hasher) {
  var memoize = function(key) {
    var cache = memoize.cache;
    var address = '' + (hasher ? hasher.apply(this, arguments) : key);
    if (!has(cache, address)) cache[address] = func.apply(this, arguments);
    return cache[address];
  };
  memoize.cache = {};
  return memoize;
}

;// ./node_modules/underscore/modules/delay.js


// Delays a function for the given number of milliseconds, and then calls
// it with the arguments supplied.
/* harmony default export */ const delay = (restArguments(function(func, wait, args) {
  return setTimeout(function() {
    return func.apply(null, args);
  }, wait);
}));

;// ./node_modules/underscore/modules/defer.js




// Defers a function, scheduling it to run after the current call stack has
// cleared.
/* harmony default export */ const defer = (modules_partial(delay, _, 1));

;// ./node_modules/underscore/modules/throttle.js


// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time. Normally, the throttled function will run
// as much as it can, without ever going more than once per `wait` duration;
// but if you'd like to disable the execution on the leading edge, pass
// `{leading: false}`. To disable execution on the trailing edge, ditto.
function throttle(func, wait, options) {
  var timeout, context, args, result;
  var previous = 0;
  if (!options) options = {};

  var later = function() {
    previous = options.leading === false ? 0 : now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };

  var throttled = function() {
    var _now = now();
    if (!previous && options.leading === false) previous = _now;
    var remaining = wait - (_now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = _now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };

  throttled.cancel = function() {
    clearTimeout(timeout);
    previous = 0;
    timeout = context = args = null;
  };

  return throttled;
}

;// ./node_modules/underscore/modules/debounce.js



// When a sequence of calls of the returned function ends, the argument
// function is triggered. The end of a sequence is defined by the `wait`
// parameter. If `immediate` is passed, the argument function will be
// triggered at the beginning of the sequence instead of at the end.
function debounce(func, wait, immediate) {
  var timeout, previous, args, result, context;

  var later = function() {
    var passed = now() - previous;
    if (wait > passed) {
      timeout = setTimeout(later, wait - passed);
    } else {
      timeout = null;
      if (!immediate) result = func.apply(context, args);
      // This check is needed because `func` can recursively invoke `debounced`.
      if (!timeout) args = context = null;
    }
  };

  var debounced = restArguments(function(_args) {
    context = this;
    args = _args;
    previous = now();
    if (!timeout) {
      timeout = setTimeout(later, wait);
      if (immediate) result = func.apply(context, args);
    }
    return result;
  });

  debounced.cancel = function() {
    clearTimeout(timeout);
    timeout = args = context = null;
  };

  return debounced;
}

;// ./node_modules/underscore/modules/wrap.js


// Returns the first function passed as an argument to the second,
// allowing you to adjust arguments, run code before and after, and
// conditionally execute the original function.
function wrap(func, wrapper) {
  return modules_partial(wrapper, func);
}

;// ./node_modules/underscore/modules/negate.js
// Returns a negated version of the passed-in predicate.
function negate(predicate) {
  return function() {
    return !predicate.apply(this, arguments);
  };
}

;// ./node_modules/underscore/modules/compose.js
// Returns a function that is the composition of a list of functions, each
// consuming the return value of the function that follows.
function compose() {
  var args = arguments;
  var start = args.length - 1;
  return function() {
    var i = start;
    var result = args[start].apply(this, arguments);
    while (i--) result = args[i].call(this, result);
    return result;
  };
}

;// ./node_modules/underscore/modules/after.js
// Returns a function that will only be executed on and after the Nth call.
function after(times, func) {
  return function() {
    if (--times < 1) {
      return func.apply(this, arguments);
    }
  };
}

;// ./node_modules/underscore/modules/before.js
// Returns a function that will only be executed up to (but not including) the
// Nth call.
function before(times, func) {
  var memo;
  return function() {
    if (--times > 0) {
      memo = func.apply(this, arguments);
    }
    if (times <= 1) func = null;
    return memo;
  };
}

;// ./node_modules/underscore/modules/once.js



// Returns a function that will be executed at most one time, no matter how
// often you call it. Useful for lazy initialization.
/* harmony default export */ const once = (modules_partial(before, 2));

;// ./node_modules/underscore/modules/findKey.js



// Returns the first key on an object that passes a truth test.
function findKey(obj, predicate, context) {
  predicate = cb(predicate, context);
  var _keys = keys(obj), key;
  for (var i = 0, length = _keys.length; i < length; i++) {
    key = _keys[i];
    if (predicate(obj[key], key, obj)) return key;
  }
}

;// ./node_modules/underscore/modules/_createPredicateIndexFinder.js



// Internal function to generate `_.findIndex` and `_.findLastIndex`.
function createPredicateIndexFinder(dir) {
  return function(array, predicate, context) {
    predicate = cb(predicate, context);
    var length = _getLength(array);
    var index = dir > 0 ? 0 : length - 1;
    for (; index >= 0 && index < length; index += dir) {
      if (predicate(array[index], index, array)) return index;
    }
    return -1;
  };
}

;// ./node_modules/underscore/modules/findIndex.js


// Returns the first index on an array-like that passes a truth test.
/* harmony default export */ const findIndex = (createPredicateIndexFinder(1));

;// ./node_modules/underscore/modules/findLastIndex.js


// Returns the last index on an array-like that passes a truth test.
/* harmony default export */ const findLastIndex = (createPredicateIndexFinder(-1));

;// ./node_modules/underscore/modules/sortedIndex.js



// Use a comparator function to figure out the smallest index at which
// an object should be inserted so as to maintain order. Uses binary search.
function sortedIndex(array, obj, iteratee, context) {
  iteratee = cb(iteratee, context, 1);
  var value = iteratee(obj);
  var low = 0, high = _getLength(array);
  while (low < high) {
    var mid = Math.floor((low + high) / 2);
    if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
  }
  return low;
}

;// ./node_modules/underscore/modules/_createIndexFinder.js




// Internal function to generate the `_.indexOf` and `_.lastIndexOf` functions.
function createIndexFinder(dir, predicateFind, sortedIndex) {
  return function(array, item, idx) {
    var i = 0, length = _getLength(array);
    if (typeof idx == 'number') {
      if (dir > 0) {
        i = idx >= 0 ? idx : Math.max(idx + length, i);
      } else {
        length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
      }
    } else if (sortedIndex && idx && length) {
      idx = sortedIndex(array, item);
      return array[idx] === item ? idx : -1;
    }
    if (item !== item) {
      idx = predicateFind(slice.call(array, i, length), isNaN_isNaN);
      return idx >= 0 ? idx + i : -1;
    }
    for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
      if (array[idx] === item) return idx;
    }
    return -1;
  };
}

;// ./node_modules/underscore/modules/indexOf.js




// Return the position of the first occurrence of an item in an array,
// or -1 if the item is not included in the array.
// If the array is large and already in sort order, pass `true`
// for **isSorted** to use binary search.
/* harmony default export */ const indexOf = (createIndexFinder(1, findIndex, sortedIndex));

;// ./node_modules/underscore/modules/lastIndexOf.js



// Return the position of the last occurrence of an item in an array,
// or -1 if the item is not included in the array.
/* harmony default export */ const lastIndexOf = (createIndexFinder(-1, findLastIndex));

;// ./node_modules/underscore/modules/find.js




// Return the first value which passes a truth test.
function find(obj, predicate, context) {
  var keyFinder = _isArrayLike(obj) ? findIndex : findKey;
  var key = keyFinder(obj, predicate, context);
  if (key !== void 0 && key !== -1) return obj[key];
}

;// ./node_modules/underscore/modules/findWhere.js



// Convenience version of a common use case of `_.find`: getting the first
// object containing specific `key:value` pairs.
function findWhere(obj, attrs) {
  return find(obj, matcher(attrs));
}

;// ./node_modules/underscore/modules/each.js




// The cornerstone for collection functions, an `each`
// implementation, aka `forEach`.
// Handles raw objects in addition to array-likes. Treats all
// sparse array-likes as if they were dense.
function each(obj, iteratee, context) {
  iteratee = optimizeCb(iteratee, context);
  var i, length;
  if (_isArrayLike(obj)) {
    for (i = 0, length = obj.length; i < length; i++) {
      iteratee(obj[i], i, obj);
    }
  } else {
    var _keys = keys(obj);
    for (i = 0, length = _keys.length; i < length; i++) {
      iteratee(obj[_keys[i]], _keys[i], obj);
    }
  }
  return obj;
}

;// ./node_modules/underscore/modules/map.js




// Return the results of applying the iteratee to each element.
function map(obj, iteratee, context) {
  iteratee = cb(iteratee, context);
  var _keys = !_isArrayLike(obj) && keys(obj),
      length = (_keys || obj).length,
      results = Array(length);
  for (var index = 0; index < length; index++) {
    var currentKey = _keys ? _keys[index] : index;
    results[index] = iteratee(obj[currentKey], currentKey, obj);
  }
  return results;
}

;// ./node_modules/underscore/modules/_createReduce.js




// Internal helper to create a reducing function, iterating left or right.
function createReduce(dir) {
  // Wrap code that reassigns argument variables in a separate function than
  // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
  var reducer = function(obj, iteratee, memo, initial) {
    var _keys = !_isArrayLike(obj) && keys(obj),
        length = (_keys || obj).length,
        index = dir > 0 ? 0 : length - 1;
    if (!initial) {
      memo = obj[_keys ? _keys[index] : index];
      index += dir;
    }
    for (; index >= 0 && index < length; index += dir) {
      var currentKey = _keys ? _keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  return function(obj, iteratee, memo, context) {
    var initial = arguments.length >= 3;
    return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
  };
}

;// ./node_modules/underscore/modules/reduce.js


// **Reduce** builds up a single result from a list of values, aka `inject`,
// or `foldl`.
/* harmony default export */ const reduce = (createReduce(1));

;// ./node_modules/underscore/modules/reduceRight.js


// The right-associative version of reduce, also known as `foldr`.
/* harmony default export */ const reduceRight = (createReduce(-1));

;// ./node_modules/underscore/modules/filter.js



// Return all the elements that pass a truth test.
function filter(obj, predicate, context) {
  var results = [];
  predicate = cb(predicate, context);
  each(obj, function(value, index, list) {
    if (predicate(value, index, list)) results.push(value);
  });
  return results;
}

;// ./node_modules/underscore/modules/reject.js




// Return all the elements for which a truth test fails.
function reject(obj, predicate, context) {
  return filter(obj, negate(cb(predicate)), context);
}

;// ./node_modules/underscore/modules/every.js




// Determine whether all of the elements pass a truth test.
function every(obj, predicate, context) {
  predicate = cb(predicate, context);
  var _keys = !_isArrayLike(obj) && keys(obj),
      length = (_keys || obj).length;
  for (var index = 0; index < length; index++) {
    var currentKey = _keys ? _keys[index] : index;
    if (!predicate(obj[currentKey], currentKey, obj)) return false;
  }
  return true;
}

;// ./node_modules/underscore/modules/some.js




// Determine if at least one element in the object passes a truth test.
function some(obj, predicate, context) {
  predicate = cb(predicate, context);
  var _keys = !_isArrayLike(obj) && keys(obj),
      length = (_keys || obj).length;
  for (var index = 0; index < length; index++) {
    var currentKey = _keys ? _keys[index] : index;
    if (predicate(obj[currentKey], currentKey, obj)) return true;
  }
  return false;
}

;// ./node_modules/underscore/modules/contains.js




// Determine if the array or object contains a given item (using `===`).
function contains(obj, item, fromIndex, guard) {
  if (!_isArrayLike(obj)) obj = values(obj);
  if (typeof fromIndex != 'number' || guard) fromIndex = 0;
  return indexOf(obj, item, fromIndex) >= 0;
}

;// ./node_modules/underscore/modules/invoke.js






// Invoke a method (with arguments) on every item in a collection.
/* harmony default export */ const invoke = (restArguments(function(obj, path, args) {
  var contextPath, func;
  if (modules_isFunction(path)) {
    func = path;
  } else {
    path = _toPath_toPath(path);
    contextPath = path.slice(0, -1);
    path = path[path.length - 1];
  }
  return map(obj, function(context) {
    var method = func;
    if (!method) {
      if (contextPath && contextPath.length) {
        context = deepGet(context, contextPath);
      }
      if (context == null) return void 0;
      method = context[path];
    }
    return method == null ? method : method.apply(context, args);
  });
}));

;// ./node_modules/underscore/modules/pluck.js



// Convenience version of a common use case of `_.map`: fetching a property.
function pluck(obj, key) {
  return map(obj, property(key));
}

;// ./node_modules/underscore/modules/where.js



// Convenience version of a common use case of `_.filter`: selecting only
// objects containing specific `key:value` pairs.
function where(obj, attrs) {
  return filter(obj, matcher(attrs));
}

;// ./node_modules/underscore/modules/max.js





// Return the maximum element (or element-based computation).
function max(obj, iteratee, context) {
  var result = -Infinity, lastComputed = -Infinity,
      value, computed;
  if (iteratee == null || (typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null)) {
    obj = _isArrayLike(obj) ? obj : values(obj);
    for (var i = 0, length = obj.length; i < length; i++) {
      value = obj[i];
      if (value != null && value > result) {
        result = value;
      }
    }
  } else {
    iteratee = cb(iteratee, context);
    each(obj, function(v, index, list) {
      computed = iteratee(v, index, list);
      if (computed > lastComputed || (computed === -Infinity && result === -Infinity)) {
        result = v;
        lastComputed = computed;
      }
    });
  }
  return result;
}

;// ./node_modules/underscore/modules/min.js





// Return the minimum element (or element-based computation).
function min(obj, iteratee, context) {
  var result = Infinity, lastComputed = Infinity,
      value, computed;
  if (iteratee == null || (typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null)) {
    obj = _isArrayLike(obj) ? obj : values(obj);
    for (var i = 0, length = obj.length; i < length; i++) {
      value = obj[i];
      if (value != null && value < result) {
        result = value;
      }
    }
  } else {
    iteratee = cb(iteratee, context);
    each(obj, function(v, index, list) {
      computed = iteratee(v, index, list);
      if (computed < lastComputed || (computed === Infinity && result === Infinity)) {
        result = v;
        lastComputed = computed;
      }
    });
  }
  return result;
}

;// ./node_modules/underscore/modules/toArray.js








// Safely create a real, live array from anything iterable.
var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
function toArray(obj) {
  if (!obj) return [];
  if (isArray(obj)) return slice.call(obj);
  if (isString(obj)) {
    // Keep surrogate pair characters together.
    return obj.match(reStrSymbol);
  }
  if (_isArrayLike(obj)) return map(obj, identity);
  return values(obj);
}

;// ./node_modules/underscore/modules/sample.js






// Sample **n** random values from a collection using the modern version of the
// [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
// If **n** is not specified, returns a single random element.
// The internal `guard` argument allows it to work with `_.map`.
function sample(obj, n, guard) {
  if (n == null || guard) {
    if (!_isArrayLike(obj)) obj = values(obj);
    return obj[random(obj.length - 1)];
  }
  var sample = toArray(obj);
  var length = _getLength(sample);
  n = Math.max(Math.min(n, length), 0);
  var last = length - 1;
  for (var index = 0; index < n; index++) {
    var rand = random(index, last);
    var temp = sample[index];
    sample[index] = sample[rand];
    sample[rand] = temp;
  }
  return sample.slice(0, n);
}

;// ./node_modules/underscore/modules/shuffle.js


// Shuffle a collection.
function shuffle(obj) {
  return sample(obj, Infinity);
}

;// ./node_modules/underscore/modules/sortBy.js




// Sort the object's values by a criterion produced by an iteratee.
function sortBy(obj, iteratee, context) {
  var index = 0;
  iteratee = cb(iteratee, context);
  return pluck(map(obj, function(value, key, list) {
    return {
      value: value,
      index: index++,
      criteria: iteratee(value, key, list)
    };
  }).sort(function(left, right) {
    var a = left.criteria;
    var b = right.criteria;
    if (a !== b) {
      if (a > b || a === void 0) return 1;
      if (a < b || b === void 0) return -1;
    }
    return left.index - right.index;
  }), 'value');
}

;// ./node_modules/underscore/modules/_group.js



// An internal function used for aggregate "group by" operations.
function group(behavior, partition) {
  return function(obj, iteratee, context) {
    var result = partition ? [[], []] : {};
    iteratee = cb(iteratee, context);
    each(obj, function(value, index) {
      var key = iteratee(value, index, obj);
      behavior(result, value, key);
    });
    return result;
  };
}

;// ./node_modules/underscore/modules/groupBy.js



// Groups the object's values by a criterion. Pass either a string attribute
// to group by, or a function that returns the criterion.
/* harmony default export */ const groupBy = (group(function(result, value, key) {
  if (has(result, key)) result[key].push(value); else result[key] = [value];
}));

;// ./node_modules/underscore/modules/indexBy.js


// Indexes the object's values by a criterion, similar to `_.groupBy`, but for
// when you know that your index values will be unique.
/* harmony default export */ const indexBy = (group(function(result, value, key) {
  result[key] = value;
}));

;// ./node_modules/underscore/modules/countBy.js



// Counts instances of an object that group by a certain criterion. Pass
// either a string attribute to count by, or a function that returns the
// criterion.
/* harmony default export */ const countBy = (group(function(result, value, key) {
  if (has(result, key)) result[key]++; else result[key] = 1;
}));

;// ./node_modules/underscore/modules/partition.js


// Split a collection into two arrays: one whose elements all pass the given
// truth test, and one whose elements all do not pass the truth test.
/* harmony default export */ const partition = (group(function(result, value, pass) {
  result[pass ? 0 : 1].push(value);
}, true));

;// ./node_modules/underscore/modules/size.js



// Return the number of elements in a collection.
function size(obj) {
  if (obj == null) return 0;
  return _isArrayLike(obj) ? obj.length : keys(obj).length;
}

;// ./node_modules/underscore/modules/_keyInObj.js
// Internal `_.pick` helper function to determine whether `key` is an enumerable
// property name of `obj`.
function keyInObj(value, key, obj) {
  return key in obj;
}

;// ./node_modules/underscore/modules/pick.js







// Return a copy of the object only containing the allowed properties.
/* harmony default export */ const pick = (restArguments(function(obj, keys) {
  var result = {}, iteratee = keys[0];
  if (obj == null) return result;
  if (modules_isFunction(iteratee)) {
    if (keys.length > 1) iteratee = optimizeCb(iteratee, keys[1]);
    keys = allKeys(obj);
  } else {
    iteratee = keyInObj;
    keys = flatten(keys, false, false);
    obj = Object(obj);
  }
  for (var i = 0, length = keys.length; i < length; i++) {
    var key = keys[i];
    var value = obj[key];
    if (iteratee(value, key, obj)) result[key] = value;
  }
  return result;
}));

;// ./node_modules/underscore/modules/omit.js








// Return a copy of the object without the disallowed properties.
/* harmony default export */ const omit = (restArguments(function(obj, keys) {
  var iteratee = keys[0], context;
  if (modules_isFunction(iteratee)) {
    iteratee = negate(iteratee);
    if (keys.length > 1) context = keys[1];
  } else {
    keys = map(flatten(keys, false, false), String);
    iteratee = function(value, key) {
      return !contains(keys, key);
    };
  }
  return pick(obj, iteratee, context);
}));

;// ./node_modules/underscore/modules/initial.js


// Returns everything but the last entry of the array. Especially useful on
// the arguments object. Passing **n** will return all the values in
// the array, excluding the last N.
function initial(array, n, guard) {
  return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
}

;// ./node_modules/underscore/modules/first.js


// Get the first element of an array. Passing **n** will return the first N
// values in the array. The **guard** check allows it to work with `_.map`.
function first(array, n, guard) {
  if (array == null || array.length < 1) return n == null || guard ? void 0 : [];
  if (n == null || guard) return array[0];
  return initial(array, array.length - n);
}

;// ./node_modules/underscore/modules/rest.js


// Returns everything but the first entry of the `array`. Especially useful on
// the `arguments` object. Passing an **n** will return the rest N values in the
// `array`.
function rest(array, n, guard) {
  return slice.call(array, n == null || guard ? 1 : n);
}

;// ./node_modules/underscore/modules/last.js


// Get the last element of an array. Passing **n** will return the last N
// values in the array.
function last(array, n, guard) {
  if (array == null || array.length < 1) return n == null || guard ? void 0 : [];
  if (n == null || guard) return array[array.length - 1];
  return rest(array, Math.max(0, array.length - n));
}

;// ./node_modules/underscore/modules/compact.js


// Trim out all falsy values from an array.
function compact(array) {
  return filter(array, Boolean);
}

;// ./node_modules/underscore/modules/flatten.js


// Flatten out an array, either recursively (by default), or up to `depth`.
// Passing `true` or `false` as `depth` means `1` or `Infinity`, respectively.
function flatten_flatten(array, depth) {
  return flatten(array, depth, false);
}

;// ./node_modules/underscore/modules/difference.js





// Take the difference between one array and a number of other arrays.
// Only the elements present in just the first array will remain.
/* harmony default export */ const difference = (restArguments(function(array, rest) {
  rest = flatten(rest, true, true);
  return filter(array, function(value){
    return !contains(rest, value);
  });
}));

;// ./node_modules/underscore/modules/without.js



// Return a version of the array that does not contain the specified value(s).
/* harmony default export */ const without = (restArguments(function(array, otherArrays) {
  return difference(array, otherArrays);
}));

;// ./node_modules/underscore/modules/uniq.js





// Produce a duplicate-free version of the array. If the array has already
// been sorted, you have the option of using a faster algorithm.
// The faster algorithm will not work with an iteratee if the iteratee
// is not a one-to-one function, so providing an iteratee will disable
// the faster algorithm.
function uniq(array, isSorted, iteratee, context) {
  if (!isBoolean(isSorted)) {
    context = iteratee;
    iteratee = isSorted;
    isSorted = false;
  }
  if (iteratee != null) iteratee = cb(iteratee, context);
  var result = [];
  var seen = [];
  for (var i = 0, length = _getLength(array); i < length; i++) {
    var value = array[i],
        computed = iteratee ? iteratee(value, i, array) : value;
    if (isSorted && !iteratee) {
      if (!i || seen !== computed) result.push(value);
      seen = computed;
    } else if (iteratee) {
      if (!contains(seen, computed)) {
        seen.push(computed);
        result.push(value);
      }
    } else if (!contains(result, value)) {
      result.push(value);
    }
  }
  return result;
}

;// ./node_modules/underscore/modules/union.js




// Produce an array that contains the union: each distinct element from all of
// the passed-in arrays.
/* harmony default export */ const union = (restArguments(function(arrays) {
  return uniq(flatten(arrays, true, true));
}));

;// ./node_modules/underscore/modules/intersection.js



// Produce an array that contains every item shared between all the
// passed-in arrays.
function intersection(array) {
  var result = [];
  var argsLength = arguments.length;
  for (var i = 0, length = _getLength(array); i < length; i++) {
    var item = array[i];
    if (contains(result, item)) continue;
    var j;
    for (j = 1; j < argsLength; j++) {
      if (!contains(arguments[j], item)) break;
    }
    if (j === argsLength) result.push(item);
  }
  return result;
}

;// ./node_modules/underscore/modules/unzip.js




// Complement of zip. Unzip accepts an array of arrays and groups
// each array's elements on shared indices.
function unzip(array) {
  var length = (array && max(array, _getLength).length) || 0;
  var result = Array(length);

  for (var index = 0; index < length; index++) {
    result[index] = pluck(array, index);
  }
  return result;
}

;// ./node_modules/underscore/modules/zip.js



// Zip together multiple lists into a single array -- elements that share
// an index go together.
/* harmony default export */ const zip = (restArguments(unzip));

;// ./node_modules/underscore/modules/object.js


// Converts lists into objects. Pass either a single array of `[key, value]`
// pairs, or two parallel arrays of the same length -- one of keys, and one of
// the corresponding values. Passing by pairs is the reverse of `_.pairs`.
function object(list, values) {
  var result = {};
  for (var i = 0, length = _getLength(list); i < length; i++) {
    if (values) {
      result[list[i]] = values[i];
    } else {
      result[list[i][0]] = list[i][1];
    }
  }
  return result;
}

;// ./node_modules/underscore/modules/range.js
// Generate an integer Array containing an arithmetic progression. A port of
// the native Python `range()` function. See
// [the Python documentation](https://docs.python.org/library/functions.html#range).
function range(start, stop, step) {
  if (stop == null) {
    stop = start || 0;
    start = 0;
  }
  if (!step) {
    step = stop < start ? -1 : 1;
  }

  var length = Math.max(Math.ceil((stop - start) / step), 0);
  var range = Array(length);

  for (var idx = 0; idx < length; idx++, start += step) {
    range[idx] = start;
  }

  return range;
}

;// ./node_modules/underscore/modules/chunk.js


// Chunk a single array into multiple arrays, each containing `count` or fewer
// items.
function chunk(array, count) {
  if (count == null || count < 1) return [];
  var result = [];
  var i = 0, length = array.length;
  while (i < length) {
    result.push(slice.call(array, i, i += count));
  }
  return result;
}

;// ./node_modules/underscore/modules/_chainResult.js


// Helper function to continue chaining intermediate results.
function chainResult(instance, obj) {
  return instance._chain ? _(obj).chain() : obj;
}

;// ./node_modules/underscore/modules/mixin.js






// Add your own custom functions to the Underscore object.
function mixin(obj) {
  each(functions(obj), function(name) {
    var func = _[name] = obj[name];
    _.prototype[name] = function() {
      var args = [this._wrapped];
      push.apply(args, arguments);
      return chainResult(this, func.apply(_, args));
    };
  });
  return _;
}

;// ./node_modules/underscore/modules/underscore-array-methods.js





// Add all mutator `Array` functions to the wrapper.
each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
  var method = ArrayProto[name];
  _.prototype[name] = function() {
    var obj = this._wrapped;
    if (obj != null) {
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) {
        delete obj[0];
      }
    }
    return chainResult(this, obj);
  };
});

// Add all accessor `Array` functions to the wrapper.
each(['concat', 'join', 'slice'], function(name) {
  var method = ArrayProto[name];
  _.prototype[name] = function() {
    var obj = this._wrapped;
    if (obj != null) obj = method.apply(obj, arguments);
    return chainResult(this, obj);
  };
});

/* harmony default export */ const underscore_array_methods = (_);

;// ./node_modules/underscore/modules/index.js
// Named Exports
// =============

//     Underscore.js 1.13.8
//     https://underscorejs.org
//     (c) 2009-2026 Jeremy Ashkenas, Julian Gonggrijp, and DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

// Baseline setup.



// Object Functions
// ----------------
// Our most fundamental functions operate on any JavaScript object.
// Most functions in Underscore depend on at least one function in this section.

// A group of functions that check the types of core JavaScript values.
// These are often informally referred to as the "isType" functions.



























// Functions that treat an object as a dictionary of key-value pairs.
















// Utility Functions
// -----------------
// A bit of a grab bag: Predicate-generating functions for use with filters and
// loops, string escaping and templating, create random numbers and unique ids,
// and functions that facilitate Underscore's chaining and iteration conventions.



















// Function (ahem) Functions
// -------------------------
// These functions take a function as an argument and return a new function
// as the result. Also known as higher-order functions.















// Finders
// -------
// Functions that extract (the position of) a single element from an object
// or array based on some criterion.









// Collection Functions
// --------------------
// Functions that work on any collection of elements: either an array, or
// an object of key-value pairs.
























// `_.pick` and `_.omit` are actually object functions, but we put
// them here in order to create a more natural reading order in the
// monolithic build as they depend on `_.contains`.



// Array Functions
// ---------------
// Functions that operate on arrays (and array-likes) only, because they’re
// expressed in terms of operations on an ordered list of values.

















// OOP
// ---
// These modules support the "object-oriented" calling style. See also
// `underscore.js` and `index-default.js`.



;// ./node_modules/underscore/modules/index-default.js
// Default Export
// ==============
// In this module, we mix our bundled exports into the `_` object and export
// the result. This is analogous to setting `module.exports = _` in CommonJS.
// Hence, this module is also the entry point of our UMD bundle and the package
// entry point for CommonJS and AMD users. In other words, this is (the source
// of) the module you are interfacing with when you do any of the following:
//
// ```js
// // CommonJS
// var _ = require('underscore');
//
// // AMD
// define(['underscore'], function(_) {...});
//
// // UMD in the browser
// // _ is available as a global variable
// ```



// Add all of the Underscore functions to the wrapper object.
var index_default_ = mixin(modules_namespaceObject);
// Legacy Node.js API.
index_default_._ = index_default_;
// Export the Underscore API.
/* harmony default export */ const index_default = (index_default_);

;// ./node_modules/underscore/modules/index-all.js
// ESM Exports
// ===========
// This module is the package entry point for ES module users. In other words,
// it is the module they are interfacing with when they import from the whole
// package instead of from a submodule, like this:
//
// ```js
// import { map } from 'underscore';
// ```
//
// The difference with `./index-default`, which is the package entry point for
// CommonJS, AMD and UMD users, is purely technical. In ES modules, named and
// default exports are considered to be siblings, so when you have a default
// export, its properties are not automatically available as named exports. For
// this reason, we re-export the named exports in addition to providing the same
// default export as in `./index-default`.




/***/ },

/***/ 80
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  v4: () => (/* reexport */ dist_v4)
});

// UNUSED EXPORTS: MAX, NIL, parse, stringify, v1, v1ToV6, v3, v5, v6, v6ToV1, v7, validate, version

;// ./node_modules/uuid/dist/rng.js
const rnds8 = new Uint8Array(16);
function rng() {
    return crypto.getRandomValues(rnds8);
}

;// ./node_modules/uuid/dist/stringify.js
/* unused harmony import specifier */ var validate;

const byteToHex = [];
for (let i = 0; i < 256; ++i) {
    byteToHex.push((i + 0x100).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
    return (byteToHex[arr[offset + 0]] +
        byteToHex[arr[offset + 1]] +
        byteToHex[arr[offset + 2]] +
        byteToHex[arr[offset + 3]] +
        '-' +
        byteToHex[arr[offset + 4]] +
        byteToHex[arr[offset + 5]] +
        '-' +
        byteToHex[arr[offset + 6]] +
        byteToHex[arr[offset + 7]] +
        '-' +
        byteToHex[arr[offset + 8]] +
        byteToHex[arr[offset + 9]] +
        '-' +
        byteToHex[arr[offset + 10]] +
        byteToHex[arr[offset + 11]] +
        byteToHex[arr[offset + 12]] +
        byteToHex[arr[offset + 13]] +
        byteToHex[arr[offset + 14]] +
        byteToHex[arr[offset + 15]]).toLowerCase();
}
function stringify(arr, offset = 0) {
    const uuid = unsafeStringify(arr, offset);
    if (!validate(uuid)) {
        throw TypeError('Stringified UUID is invalid');
    }
    return uuid;
}
/* harmony default export */ const dist_stringify = ((/* unused pure expression or super */ null && (stringify)));

;// ./node_modules/uuid/dist/v4.js


function v4(options, buf, offset) {
    if (!buf && !options && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return _v4(options, buf, offset);
}
function _v4(options, buf, offset) {
    options = options || {};
    const rnds = options.random ?? options.rng?.() ?? rng();
    if (rnds.length < 16) {
        throw new Error('Random bytes length must be >= 16');
    }
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;
    if (buf) {
        offset = offset || 0;
        if (offset < 0 || offset + 16 > buf.length) {
            throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
        }
        for (let i = 0; i < 16; ++i) {
            buf[offset + i] = rnds[i];
        }
        return buf;
    }
    return unsafeStringify(rnds);
}
/* harmony default export */ const dist_v4 = (v4);

;// ./node_modules/uuid/dist/index.js
















/***/ }

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ const __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	const cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	const module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ // define getter/value functions for harmony exports
/******/ __webpack_require__.d = (exports, definition) => {
/******/ 	for(var key in definition) {
/******/ 		if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 			Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 		}
/******/ 	}
/******/ };
/******/ 
/******/ /* webpack/runtime/global */
/******/ __webpack_require__.g = (function() {
/******/ 	if (typeof globalThis === 'object') return globalThis;
/******/ 	try {
/******/ 		return this || new Function('return this')();
/******/ 	} catch (e) {
/******/ 		if (typeof window === 'object') return window;
/******/ 	}
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ __webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop));
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ // define __esModule on exports
/******/ __webpack_require__.r = (exports) => {
/******/ 	Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 	Object.defineProperty(exports, '__esModule', { value: true });
/******/ };
/******/ 
/************************************************************************/
/* harmony import */ var _litewrite_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(907);
/* harmony import */ var _atomic_drive_storage_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(286);
/* global LITEWRITE_CSS, LITEWRITE_MARKUP */



async function view ({ root, store }) {
  const style = document.createElement('style')
  style.textContent = "html, body {\n\tmargin: 0;\n  padding: 0;\n  overflow: hidden;\n\tcolor: #000;\n\tbackground: #fcfcfc url(data:image/png;base64,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) repeat;\n\tfont:16px FreeSans, Helvetica, sans-serif;\n}\n\n\n@font-face {\n  font-family: 'Alegreya';\n  font-weight: normal;\n  src: url(data:font/ttf;base64,AAEAAAARAQAABAAQRFNJRwAAAAEAARxMAAAACEZGVE1f3jIRAAEbjAAAABxHREVGAiMABgABG6gAAAAgR1BPU7AAy4EAARvIAAAAZEdTVUJEdkx1AAEcLAAAACBPUy8yrWp8ZQAAAZgAAABgY21hcGT6PjMAAAnQAAADpmdhc3AAAAAQAAEbhAAAAAhnbHlmKNXmegAAEXAAAPXoaGVhZPiBCRwAAAEcAAAANmhoZWEHCAO0AAABVAAAACRobXR4n99CVQAAAfgAAAfYbG9jYa2Zb+IAAA2AAAAD7m1heHACPwBYAAABeAAAACBuYW1lVlhdyAABB1gAAAdrcG9zdAshIcQAAQ7EAAAMv3ByZXBoBoyFAAANeAAAAAcAAQAAAAEAxRhJyTlfDzz1AAsD6AAAAADLKmJzAAAAAMsqYnP/Lf7bA+ADsQAAAAgAAgAAAAAAAAABAAAD+P6nAAAD7P8t/yoD4AABAAAAAAAAAAAAAAAAAAAB9gABAAAB9gBVAAcAAAAAAAIAAAABAAEAAABAAAAAAAAAAAIBlwGQAAUAAAK8AooAAACMArwCigAAAd0AMgD6AQICAAUDBQAAAgAEoAAA70AAIEsAAAAAAAAAAHB5cnMAQAAg+wID+P6nAAAD+AFZIAAAkwAAAAAAvAKJAAAAIAACAMoAAAAAAAABTQAAAMoAAAEdAD0BKgA7AfIACwHLADUCnwAjArwANwCwADsBNQBUATUADwHIAEQB+gASAO4ADwFEACQA7gA8AUkAIgIVACYBYgAjAdsAGwGfABQBvwAEAa4AEAHHACgBpAAmAeUAOAHHACQA7gA4AO4ADwH6AB8B+gASAfoAMwFoADoDQAAhAkL/7gJVADoCdQAoAr8AOgJPADoCAAA6ApsAKALyADoBaQA4AUcAFwJ0ADkB+wBEA08ALgLPADYCtAAoAicAPwK5ACgCYwA5AhIAOQIiAAkCqQAjAmL/9wOk//kCkAAMAhr/7QI4ACIBNQBgAUkAJQE1ABkB+gA4Acr/+gGOAEcB0gApAfwAFwGoACQCGQAkAcAAJAFKACkB+AA0AhYAGQEaACoA+gAPAfEAGQD0ABkDQAAnAjIAJwHyACQCEAAoAgQAJAF/AC0BkgAxAUoAFQIdABwBvf/2AsH//AHbAAgBvv/3AcwAJAE1AC4BdACYATUAFQH6ACsAygAAAR0AWAGoACQCDQAmAbwAHgIlAB8BdACYAgAAIwGOAEYCtQAqAUEAHgGrABQB+gASAdQAHgGOADIBLgAZAfoAEgFJABgBJQAfAY4AgQIIADUCMQAqAO4APAGOAGMA+QAbAVIAHAGrAC4CrQAbAskAGwKxAB8BaAAfAkL/7gJC/+4CQv/uAkL/7gJC/+4CQv/uAyr/9gJ1ACgCTwA6Ak8AOgJPADoCTwA6AWkAHwFpADgBaQAnAWkANwLJAAkCzwA2ArQAKAK0ACgCtAAoArQAKAK0ACgB+gBEArQAKAKpACMCqQAjAqkAIwKpACMCGv/tAh8AOAJPACkB0gApAdIAKQHSACkB0gApAdIAKQHSACkCjQAeAagAJAHAACQBwAAkAcAAJAHAACQBGgAGARoAKgEa//4BGgALAfwAKwIyACcB8gAkAfIAJAHyACQB8gAkAfIAJAH6ABIB8gAkAh0AHAIdABwCHQAcAh0AHAG+//cB/gAVAb7/9wJC/+4B0gApAkL/7gHSACkCQv/uAdIAKQJ1ACgBqAAkAnUAKAGoACQCdQAoAagAJAJ1ACgBqAAkAr8AOgIlACQCyQAJAhkAJAJPADoBwAAkAk8AOgHAACQCTwA6AcAAJAJPADoBwAAkAk8AOgHAACQCmwAoAfgANAKbACgB+AA0ApsAKAH4ADQCmwAoAfgANALyADoCFv/1Au4AKgIYAAgBaQAWARr/5AFpACIBGgAHAWkAOAEaABIBaQA4ARoAKgFpADgBGgAqArAAOAIUACoBRwAXAPr/7AJ0ADkB8QAZAgAAJwH7AEQA9AAZAfsARAD0ABkB+wBEATAAGQIVAEQBTAAZAicAPQD3AAMCzwA2AjIAJwLPADYCMgAnAs8ANgIyACcCzwA2AhUAJwK0ACgB8gAkArQAKAHyACQCtAAoAfIAJAPDACkDAwAkAmMAOQF/AC0CYwA5AX8ALQJjADkBf//4AhIAOQGSADECEgA5AZIAMQISADkBkgAxAhIAOQGSADECIgAJAUoAFQIiAAkBgAAVAiIACQFSABUCqQAjAh0AHAKpACMCHQAcAqkAIwIdABwCqQAjAh0AHAKpACMCHQAcAqkAIwIdABwDpP/5AsH//AIa/+0Bvv/3Ahr/7QI4ACIBzAAkAjgAIgHMACQCOAAiAcwAJAF+/8sCQv/uAdIAKQMq//YCjQAeArQAKAHyACQCEgA5AZIAMQIiAAkBSgAVAPoADwGOADYBjgAvAY4ATwGOAJEBjgB2AY4AXAGOACMBjgBKAY4AjAIaAAgDUQAqAlgABAOk//kCwf/8A6T/+QLB//wDpP/5AsH//AIa/+0Bvv/3Acr/+gOW//oAsAAcALAAAgDuAA8BSwAcAUsAAgGNAB8B6wAgAesAIAFUADwA7gA8AcAAPAKSADwD7AAjAQUAFAEFAC4Aff8tAWAAHwE3AAoBIgAYATgAHgEhAB0BRwAnATgAHAF9AB0BYAAfAPkAGwFJABgBJQAfATcACgEiABgBOAAeASEAHQFHACcBOAAcAcAAOAJMAAwCMwACAx0AKAH8ACsCxAA4AhQABwH6ABIB+gAEAfoAEQGQ/+4B+gAtAfoAEgH6ABIB+gASAfoAPAJLACkCPgApAY4AfQGOAE8BjgA2AY4ARgGOADEBjgAyAY4AdgGOACMBjgA2AY4AkQGOAGoBjgBZASwAKQFKACkBQAApAhUAJgFiACQB3AAaAagAKwG9AAIBpAAfAccAKAGkACYB5QA4AccAJAHCABQBwgBDAcIAFAHCADMBwgADAcIAJwHCACcBwgAvAcIALgHCACMBuAARAbgAPgG4ABIBuAAbAbgAAwG4ABMBuAAkAbgALAG4ACsBuAAgAY4AowI4ACkBYAAfAPkAGwFJABgBJQAfATcACgEiABgBOAAeASEAHQFHACcBOAAcAWAAHwD5ABsBSQAYASUAHwE3AAoBIgAYATgAHgEhAB0BRwAnATgAHAFBAB4BWQAPASQAHAFqABwBNgAcAOkAHQFXACYBawARAMoAHgC6ABABWAASALUAEgIpAB0BUgAcAWcAHAFcABwBEgAgARYAIQDmABEBbgAWATcAAgHhAAUBSQAMATb//wE3ABoDDwBkAcQAAAJ9AAABGgAqAs8ANgAAAAMAAAADAAAAHAABAAAAAAGcAAMAAQAAABwABAGAAAAAXABAAAUAHAB+AKwBSAF+AZIB/wIbAjcCxwLdAyMDlAOpA7wDwB6FHvMgFCAaIB4gIiAmIDAgOiBEIHAgeSCJIKMgrCEiISYhLiICIgYiDyISIhoiHiIrIkgiYCJlJcr7Av//AAAAIACgAK4BSgGSAfoCGAI3AsYC2AMjA5QDqQO8A8AegB7yIBMgGCAcICAgJCAwIDkgRCBwIHQgfyCjIKwhIiEmIS4iAiIGIg8iESIaIh4iKyJIImAiZCXK+wH////j/8L/wf/A/63/Rv8u/xP+hf51/jD9wP2s/Lr9luLX4mvhTOFJ4UjhR+FG4T3hNeEs4QHg/uD54ODg2OBj4C/gWN+F307fed9433Hfbt9i30bfL98s28gGkgABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgIKAAAAAAEAAAEAAAAAAAAAAAAAAAAAAAABAAIAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAADAAQABQAGAAcACAAJAAoACwAMAA0ADgAPABAAEQASABMAFAAVABYAFwAYABkAGgAbABwAHQAeAB8AIAAhACIAIwAkACUAJgAnACgAKQAqACsALAAtAC4ALwAwADEAMgAzADQANQA2ADcAOAA5ADoAOwA8AD0APgA/AEAAQQBCAEMARABFAEYARwBIAEkASgBLAEwATQBOAE8AUABRAFIAUwBUAFUAVgBXAFgAWQBaAFsAXABdAF4AXwBgAGEAAACFAIYAiACKAJIAlwCdAKIAoQCjAKUApACmAKgAqgCpAKsArACuAK0ArwCwALIAtACzALUAtwC2ALsAugC8AL0BZwBxAGQAZQBpAWkAdwCgAG8AawGFAHUAagGPAIcAmQGMAHIBkAGRAGcAdgGHAYkBiAFWAY0AbAB7AVUApwC5AIAAYwBuAYsBPwGOAVQAbQB8AWwAYgCBAIQAlgESARMBXwFgAWQBZQFhAWIAuAGSAMABOAFwAYQBbgFvAZMBlAFoAHgBYwFmAW0AgwCLAIIAjACJAI4AjwCQAI0AlACVAAAAkwCbAJwAmgDyAUsBUQBwAU0BTgFPAHkBUgFQAUwAALgB/4WwBI0AAAAAAAAAAAAAAAAeAEQAjADoAS4BkAGmAdgCCgJWAnoClAKoAroC0gLwAyADUgOKA7QD5gQeBEIEggS6BNgE/AUaBTwFXAWSBeYGLgaABq4G6Ac0B3oHvAggCFIIfAjWCRYJcAm6CdoKHApOCqAK5gsmC2gLoAv8DGAMtgzmDQANFg0wDVANZg18DcAN8g4cDlwOjA7MDyoPdg+oD9YQKhBYEMIRDBEqEW4RqBHmEiASUBKQEsoTKBOGE8oT+BQ0FEoUhhSqFKoUyhUMFVQVkhYAFh4WchaQFtQXEBc6F1gXtBfIF+YYGBhGGHoYkBjWGRQZJhlOGYQZpBnMGjAanhsCGzgbjhvkHEAcph0GHWYd0B4cHnYe0B8wH5Qf1CAUIFogpCDqIVIhgCGuIeIiICJYInwiviMMI1wjsCQKJG4kuiUWJWolviYWJngm1CcwJ4wn1CgUKFQomijiKRgpTimIKcYqBCpsKpoqyCr6KzYrbCuYK9IsICxuLMItGi1uLbguFC5qLrwvFi9sL8owHDBYMJIw1DEUMU4xhDHEMgQyUDKgMuYzNDOOM8w0KjRsNMQ1ADVkNag2CDZONqQ3FjdqN9o4KDiSOOg5WjnUOjQ6sDsMO1o7njvePBI8VjyOPNY9Hj1cPYI92D40PnI+qj8YP4I/1EAiQF5AskD0QURBgkHOQgZCUkKOQuRDPkOcQ/xEWES4RQxFUkWARaxF3kYORkpGhEbaRyJHgkfOSDZIiEjuSUBJlEneSjhKhkrqS0JLmkvoTEZMlEzmTSZNdE2yThBObE68TwpPXE+uUAhQYFC8URZRbFG4UiZSmFMCU1pTyFQGVERUgFS6VP5VQFWGVfRWXlbYV0RXlFfcWDZYhFjYWRxZPllaWXZZjlmgWcBZ5loKWixaPlpaWpxa5ltOW7pcIlyQXQJdeF3cXjBeRl5cXnhelF6uXt5fDl8+X2hfqF+6X8xf6mAUYHJgimCiYLpg2GD8YSphYGGEYb5h9GI6YlhijmK8YvBjFGNCY3hjnGPWZApkZGS0ZTBlZmWUZexmImY2ZlpmlmbIZwpnPmdyZ6RnzmgqaIBolGisaMZo5Gj4aQxpLGlQaWppfGmYabpqBGpEaoJqomrUawJrOmtka5RrzGvwbDBsaGyIbLhs5m0mbU5tfm20bdhuHG5SbnBuoG7SbwxvNG9mb55vxHAEcDxwUnCocMZw/HEqcV5xgnGwceZyCnJEcnpymHLOcvxzMHNUc4JzuHPcdBZ0SnSGdLZ04HUadUh1hnXYdiB2UHZ8dtB2+Hdcd3x3vnf2eDJ4aHiUeMx5AnlWea557HoYemB6bHp4eqp69AAAAAIAPf/0AMUCtgAHAA4AADYGIiY0NjIWJwM/ARcDB7QjNx0iNx5KCAdTCTQcGCQhMiQhiAHIChIL/iYHAAIAOwGfAQICiQAJABMAABM2NTQnNxcGDwE3NjU0JzcXBg8BQQEHRgcOFRlvAQdGBw4VGQGhIRpEWw4IbmYOAiEaRFsOCG5mDgAAAAACAAsAIwHgAj0AJQArAAATJzcXPwEXBzMXPwEXBzMXBycHMxcHJw8BJzcnDwInNwcnNxc3MwczFzcnMwMPayUoCCc1NSUoCCdsBBNoGWsEE2YkJwclRiQlJwclbwMPbRkuGjQ3GUQBagolAaAFBqABogUGoQkkAW4JJAGlCAaoAQGmCAaoAQolAW1uAW8BAAADADX/ZgGQApIALgA0ADoAAAE2NTQnBx4DFxYVFAYPAic3IiYvATY1NxQWFzcmJyY0Nj8CFwcWHwEGDwI0Jwc+AQIGFBYXNwFHAkIQASAbMgsgZFENGgUNI0EeBQstITIRNzIqYkwOGgYOQzQEDgUnD08PKzN/NCgmDgFdDxs4B6YBDg0fDSImPlMHjwMHig4NCT9IBEkzA68WJyJtUgaUBAmOAhEHPUcE5SwnoAMpAXImNiYUmAAABQAj/6ECkwKmAAcADwAXAB8AKAAAEhYyNjQmIgYWBiImNDYyFhIWMjY0JiIGFgYiJjQ2MhYDFwIHAy8BNgFSPUw2OFgv7lGDSVWDRWU9TDY4WC/uUYRIVYNFSAWuWNcmBYUBVwG7NSdePDBrZleNX1j+ODUnXjwwa2ZXjV9YAbQO/v2N/qwTDMoCHAACADf/5AK9AokAOQBBAAABIgcnNj8BNjcXBw4BKwEHFhQHFxUGIyInDgEjIiY1NDY3Njc1JjQ2MzIfAg8BLgEiBhQWHwE2NTQFFBYyNycOAQGqEyYOFSDOSwIKDQcYJ2QDKiiMLw8JdipqM2J0GxQmL1JyVUMoDgIwCiMrRDA+WaAS/opboTvhJy8BbwkrEAIMBwQYHw0HBiV9PnYQH2oqMF1PIDoSJRUHVotbEQYPSgEgFilUWEyKJDJ2uztGM8kSQwAAAQA7AZ8AiAKJAAkAABM2NTQnNxcGDwFBAQdGBw4VGQGhIRpEWw4IbmYOAAABAFT/bgEmAokAHwAANzU0Njc2PwEzFwcOAx0BFBYXFh8BFQcjLgMnJlQnGzktFAQNAQ84JB4dFSskDhUECS8jKhAko61FcyFEEwkdBAUyNmI6rT5rH0AUCQUaAh0dNB5HAAAAAQAP/24A4QKJAB8AABMVFAYHBg8BIyc3PgM9ATQmJyYvATU3Mx4DFxbhJxw4LhMEDQEPOCQeHRUrIw8VBAkvIyoPJQFUrUVzIUQUCB0EBTI2YjqtPmsfQBUIBRoCHR00HkcAAAUARAGhAYUC4QAHABAAGQAjACsAABMWFw8BJzQ3FzY3HwEGByYnFyYnPwEWFwYHNwYiIyc3NjcWFycGDwEvATYzVjctBgZqCQ4sLx0DHCAkGrgcEBgIHCgWGWQzOwgOASk+Fgp5CxIiBgUkHwKaHSIhBR0mHr0sIBAHJjYMEi44NhcBKC4eE6AHHQgNGh8dkD01BQRuDAAAAQASAB4B6AH0ABIAAAEXBhU3Fw8BFwcnNjUHJzcWMzcBEgoGzAYIygExCQHGBgtqVwEB9AZ7UAYKMwHCCwZvWAEJMQHJAAAAAQAP/2MArQBjAAwAADc2MhYUBgcnNT4BNCdAIi4dVDgSIywgSRopWV0hDwoYQkceAAAAAAEAJADSASABKwAGAAABFw8BJz8BARkHBfAHBq4BKwk2Ggg0FAAAAAABADz/9ACzAGsABwAANgYiJjQ2MhazIzcdIjceGCQhMiQhAAABACL/kgEnAqMACAAAARcCAyMnNjcTAR8IY2swBzUncwKjCv6Z/mAIsJgBwQAAAAACACb/9AHvAfkABwAPAAAkBiImNDYyFgQWMjY0JiIGAe+JynaKyHf+b2KaXWSaW5CciOSZh8tnX59qXwABACP/9AE9AfkAHQAANxQWMzcXByYjIgc3PgE9ATQmIwcnNzY3MxcOAQcG1RQdNQIJVCQ7UAY4IhkdNQMEkj8CBhQPAgZwKBwDBC4DDC4FK0LkIxYGAyoREBERISKfAAABABv/9AHFAfkAHQAAATQmIgYHIyc+ATIWFAYHFzMyNj8BBg8BJiMHJzc2AQ0oRUIXCQsZYG5LWnsEmTcqDygVCAzrVjYKT6MBaiQoMCktMD9CY4WLByI5BVRJBwcMEli5AAAAAQAU/5cBZQH5ACQAABcyNjU0LwI3PgE0JiIGByMnPgEzMhYUBgcVFhUUBiMiJic3FmlLZrMFBUEoMy09PxcKCiFjITtHPDKHsWAiHQEFKiNMOWQBBSMQE0FAJxwXKhstPVtMGgUgXFCTIicGCQAAAAIABP+XAaMB+QARABUAACUzFwcmJxcPASc2NyYjNwE3FwM1IwcBQF0GCCU2BwVHBgUBml0EARQEIEUJoY8INwECqQcMCWdOBCUBegEK/qDg4AAAAAEAEP+XAXwCGgAdAAASFhQOASMiJic3FjMyNjQmLwE/Aj4BPwEPASYjB+99XYQ8Hx4CBSonUGpcdQkRCL0eGQghGAZndAcBDUt8b0AfKgYJSmw5FAv0CAgCDxYEdgYIfgAAAAACACj/9AGjAlYAGQAjAAATMhYVFAYiJjU0PgI3Nj8BHwEOAwcXNhYmIgcGFRQWMjb2UVxwqWIlOkckTSMSBwsgUkBCDwRRgUVnMgNAaDkBWGU/UHB3Wj1vT0IVLgsGBR4MMjhgNwI0iE0lFhdMW0AAAQAm/5cBogHxABIAABMzFwYDByMvARMHDgEPATY/ARa50xZneRkHPAr6rTEhCicOBQY8Ae0cz/7rVhIWAeoHAiQ3BmFMBQQAAwA4//QBrwJWABIAHAAoAAA3NDcuATQ2MhYVFAceARUUBiImNhYyNjQuAScGFRMUFx4BFzY1NCYiBjiBNDtnjF1jOT92nWRJRmFCLSU8Ww85FxUePDdUNHxpPBxDdGJGQFw1HkY1SmhJKEY9SzUVHidUAT0zJA4LECRGNDk0AAACACT/lwGfAfkAGQAjAAA3IiY1NDYyFhUUDgIHBg8BLwE+AzcnBiYWMjc2NTQmIgbRUVxwqWIlOkcjTiITBwsgUkBCDgNRgURkNgNBZzmVZT9QcHdaPW9PQhUuCwYFHgwxOGA3AzSHTCUVGExbQAAAAgA4//QArwGDAAcADwAANgYiJjQ2MhY0BiImNDYyFq8jNx0iNx4jNx0iNx4YJCEyJCHmJCEyJCEAAAAAAgAP/2MArwGDAAwAFAAANzYyFhQGByc1PgE0JzYGIiY0NjIWQCIuHVQ4EiMsIHEjNx0iNx5JGilZXSEPChhCRx71JCEyJCEAAQAfAEYBxwHQAA8AADcnPwIfAQYPARUfAgcmJwgCy8kJB3BSmqi1AR5u7wsvVlEFMiciPAZGTwsoNAAAAgASAJ0B6AF5AAcADwAAJRcHBSc3FjM3FwcFJzcWMwHiBgj+OAYLllnWBgj+OAYLllncCjMCCTEBowozAgkxAQAAAAABADMARgHbAdAADwAAARcPAi8BNj8BNS8CNxYB0wgCy8kJB3BSmqi1AR5uAScLL1ZRBTInIjwGRk8LKDQAAAAAAgA6//QBSQK2ABcAHwAAATQvAT8BHgEVFAcOAg8BFw8BLwE/ATYCBiImNDYyFgEHywIhDl2DJxQeQA0DFQM9CRgDdzk5IzcdIjceAfNzDAs1BANfQ0ApFRgqCQlfCBEEeA5MJ/5UJCEyJCEAAgAh/y8DHwJlAC0ANwAABSI1NDcnBgciJjQ+ATMXPwEfAQYHFzI2NTQmIAYQFhcVBy4BNTQ+AjMyFhAGJTI2NyYiBhUUFgHdJCsGWmEnKUZqNWQJBR8IOhoEam+g/uW3sbAavNI9bKNflb6r/sIbdTg2X1ARDB0UvAKrREqQnmAQGQEPDMe6BHpogpPN/tPPCgckCeCkUpl3R7H++rpRroIhjlsqPgAAAv/u//YCTwKJACUAKwAABSc3PgE0LwEmIg8BBhUUOwEXByYjBzc+ATcTNzMSFx4BHwEHJiIDMjcDIwMBSQMEMyYJIRiAPSUJPDkCBklCbggcIhDDPwhUSwwoLAIHSGeLJDlPB18KBycEECYcbQEIaBsMKQQrBwMvAyEpAf8R/snhJR4EBCkDAREFAQb+9QAAAwA6//QCHgKBAB4AJwA1AAAEJiMiBzc+ATUTNCYjByc3FjM3MhYVFAYHHgEVFAYjJhYyNjU0Jw8BEzQmIyIHBgcWPgQBHlgYLkYGLiABDxYiAgdJJnZfZj03SVKMX140ekWHaATRVloKBAgFXhMMIRkUCgoMLgkjKgGkIBYCBCwDBE9JMlAYEFA4TnNTIEM5bxgCuwFpQD4EC+gIAQQTGjEAAAABACj/9AJBAokAGwAAJQYgJhA2MzIfAQYPATY1NCMiBhQWMzI2PwEGBwIgVv8AosaXSmQEEwYwA5Nld31oRFMTMBQHHCinASbIGAZLXAQbFl2N+6BNUQRbSAAAAAIAOv/0ApcCgQAWACIAAAUmIyIHNz4BNRM0JiMHJzcWMzcyFhAGAyIGBwIUFjMyNhAmAT1dJDxGBi4gAQ8WIgIHQyaYkrfIxhUOAQ8yTGx8nwwMDC4JIyoBpCAWAgQsAwSm/ubNAlwJDf5/bSWVAQaOAAAAAQA6//YCFAKJADAAABMXNxcHJiIHBhQWMj4BPwEXBg8BJiMiBzc+ATUTNCYjByc3FiA3FwYPATY1NCYiBgfbZ3oEDlZbKAQZikYfCCwDEgkF0EBiSAYtIQEPFiICB08BEFgDEQYwAi+bFAEBYgELBTsDB5BYExEvOgUFU1UGBwouBiMrAaQgFgIELAMMBkpcBB0OMRYLHAABADr/9AH0AokAKwAABSYjIgc3PgE1EzQmIwcnNxYgNxcGDwE2NTQmIgYPARc3FwcmIg8BFBYzNxcBQV8mPEYGLiABDxYiAgdPAQFUAxEGMAIqjRQBCGdpBA5MVCgEEhpHAgQEDC4JIyoBpCAWAgQsAwwGTVwEIA4xFgsc0wELBTwDB6YpGwMEAAAAAAEAKP/0AlACiQAqAAAABhQXBw4BIyImEDYzMh8BBg8BNjU0JiMiBhAWMzI2NzU0JisBJzcWMzcXAj4NBwYrgziGnsKdSngEFAYvA0dQcn99ZyREIRUiRQIJRDtWBAEOQYQeCRIcpwErwxgGS1wEGxsuKon/AJ8TE3oiFAQyBAUWAAAAAAEAOv/0ArkChgBDAAAlFBYzNxcHJiMHNz4BPQEmIw8BFBYzNxcHNCIGBzc+ATUTNCYjByc3FjMyNwcOAQ8BFzI/ATQmIwcnNxQzMjcHDgEHAgJeEhotAglPLHMJLx1qLqYEEhotAgmBawEGLiABDxYiAgdJHClMBCsVAgaoQFQBDxYiAgc8RlgEJRkCDnApGwMELgMCLQEoQpcBC7MpGwMELgMIBC4JIyoBpCAWAgQsAwktBx02ogEKtiAWAgQsAwktBRcd/twAAQA4//QBOAKGAB4AADcUFjM3FwcmIyIHNz4BNRM0JiMHJzcWMzI3Bw4BBwLVEho1AglUIzpGBi8hAQ8WKgIHTh8qUwQqHAIOcCkbAwQuAwwuCSMqAaQgFgIELAMJLQUXHf7eAAEAF/9wARUChgAWAAA3EzQmIwcnNzM3Bw4BBwYHDgEHJzc+AYMBDhcvAgdsdAQjFAILAgFNVREDPSxzAakgFQQELAktBRQg7r5meyMhCCVbAAAAAAIAOf/yAmoChgAcADgAABMWMzI3Bw4BBwIUFjM3FwcmIwc3PgE1EzQmIwcnBTQvATcWMzcXBw4BDwEXHgEzFwcGIyIvAT8BNk1JHClMBCUcAQwRGy0CCU8scwovHAEPFiICAX8/AgdJJVwEBxosLaGoJDkjBAZICzI+rwGzHwKAAwktBhkd/k8lGwMELgMBLQUcKwGkIBYCBB0aBAQrBwQHKQUgL6nbLyYEIgxW8w66HwAAAAEARP/2AfkChgApAAAFJiMiBzc+ATUTNCYjByc3FjMyNwcOBgcGFQYVFBYyNj8BFwYHAdeuQGFEBicdAQ8WIgIHSh0oTAQLEQ0JBwMDAQIMHY83ESwDEgsJCQouBiMrAaQgFgIELAMJLQIDBgMNBRMEFBKn2zMaMlwFBVtjAAAAAQAu/+0DHgKDADcAABMCFDM3FwcmIyIHNz4BNxI0Ji8BNxYzNxIXMzYTFjM3FwcOARUUEx4BMzcXByYjBzc2NQMjAwcDxiIfKQIJQBksMgUgHAQsKS4DCE0gRFVUBU5fMBJsAgUrJBoHEhgcAgk7JGgEOyIFwRjCAgj+XTkBBC0ECC4EISgBkTkaAwUjBQT+79/QAR4CBgQlBRkZTf61OyQCBC0DCC4HKwGw/ewHAhsAAAAAAQA2/9gCrgKFACwAACURNCMHJzcWMzI3Bw4BBwMHAgMjAxQWMzcXByYjIgc3NjcTNCYvATcWMzcWEwIsISYCCT0bLD4FIyABDh21vwUFDhEzAgk/HjA6BT0BDSUyAwg6HEOUvJEBlSsBBC0ECC4FHR39zg4BGQEO/lUWEgEELQQILgc4AbUfGgUFJQUE5v72AAAAAAIAKP/0AowCiQAHABAAADYWMjY0JiIGEyImEDYgFhAGfnzBeH/CdL97mr4BCJ7ByaKR86KQ/jesAR3MrP7jzAACAD//+AIQAoEAHgApAAAAFhQGKwEHFBYzNxcHNCIGBzc+ATUTNCYjByc3FjM3FzQmIyIGBwYHFzYBom6MWVQCDx02AgmEawIHLBwBDxYiAgdJJn6CW2ESCAEJA2p5AoFcq4ZiRCIDBC4DBgIuCB8rAaQgFgIELAMExU1HBAp/lA8UAAACACj/KAMkAokAFAAcAAAFFjMyNx8BBiMiJiciJhA2IBYQBgckFjI2NCYiBgGXwmgzJgQGSxRHj7J7mr4BCJ6JbP7nfMF4f8J0BYQKAxJESoKsAR3MrP79vB7JopHzopAAAAAAAgA5//ACWwKBACcANAAAABYVFAcXHgEzFw8BIiYvASMHFBYzFwc0Jwc3PgE1EzQmIwcnNxYzNxc0IyIGBwYHFzY3PgEBlGyTbh03KAQGVRk5GGtTAxgwAglqcwkvHQEPFiICB0kme3a3CgcBCQFnJSIOFwKBVEODQ64wJQQiCzMswpU2HAQqAQIDLQUfKwGkIBYCBCwDBK+ECQ6ZXQoJIw83AAABADn/9AHSAokALwAAFyImLwE2NTcUFjI2NTQnLgUnJjU0NjMyHwEGDwEnNjU0JiIGFB4BFxYVFAbbKk4lBQwtMZBMLSFCAwMoLRs1hWFMTQMQBicGAzR6R0WmIDaKDBERCk1hBWxCOzMsIhkiAQIVGxcsPU9rGQZNXAQFFR81KDdRO1YcLjlWbQAAAAEACf/8AhcCiQAoAAA3EQ4FDwE2PwEXITcXFhcHLgUnBhEUFjM3FwcmIwc3PgHpLykvDRMFBS8MAwlTATZVCQINLwYGEg4rKCoQGh83AwlkL4kIRh6iAbQCAgwKIx4jBFhVCAsLCEFoBCMgJAoNAgKg/rolHwMELgMEKwYlAAAAAQAj//QCiAKGACkAADYWMjY1Ay4BIwcnNxYzMjcHDgEVERQGIiY1ETQmIwcnNxYzMjcHDgEHA7hWo1YGAg0WKwIHSx0pQQQsGYLfcg8WIgIHSx0oSgQlGQIIl2pXUgFGIxMCBCwDCS0GFB/+sGlzc2oBSyAWAgQsAwktBRcd/toAAAAAAf/3/+8CYwKIACEAAAMWMzI3FwcOARUUEzMSNTQrASc3FjM3Bw4BBwMHAgMmLwECUh09XgMENiN+CaZFNAIGTUJuCB8YC9dAWVQSSgICgAMLBycEEBIh/k4BrCAoBCsHAy8BEh395BYBJQEEOAEEAAH/+f/vA6MCiAA5AAADJzcWMzI3FwcOARUUEzMTJy4BLwE3FjMyNxcHDgEVFBMzEjU0KwEnNxYzNwcOAQcDByYnIwMHAgMmBgEGUCFGSwMEMyN7Bo0SCiomAgdQHkBUAwQ0I3wGokQyAgdLQGoHHhgK0j45RAaOQFNUEgJRBCsDCwcnBBATJ/5VAYA3HRoCBCsDCwcnBBASIf5OAbUcIwQrBwMvAhEd/eQWzdv+bhYBJgEDOAAAAAABAAz/+AKLAoUAQQAAExYzMjcXBwYVFBc+Ajc2NTQvATcWMzcXBw4BDwEXHgEfAQcmIwcnNzY1NC8BDgEVFB8BByYjByc3PgE/AScmLwEbYilMQAMDTnEKKR4QIjoCBkklYQQGKzAteZIbPy8CB04umwMEThRtexQ6AgdJJWMEBylGM26DMFkCAoADCAcjBh4SrA41KRcvEBgGBCcHBAclCSc4mdUoJwQEKwMIBycEHw8dpKMiDhoEBCsHBAcpDD8/iMRHDAQAAAH/7f/0Ai4ChQA4AAASBhQeATsBNzY1NC8BNxYzNxcHDgEHBg8BBgcGFBYzNxcHJiMiBzc+AT0BNC8BJicmLwE3FjM3FwfCHzg3AQVyED8CBkolXAQGLickAgFrEQMCEhoxAglTITdGBjQaHVoiDhc3AgZALo4DAwJXDx6BdNQdFRoEBCcHBAclCSZBBAK8HzgpWxwDBC4DDC4KKDosNzq3Rg8ZBQQnAwgHIwABACL//QIMAokAGAAAJQclBycBBw4BDwE2PwEXBRcGAzc+AT8BBgHvD/6WRg4Bda1FOggvEAIKrwECC7/DyzRAEC8UDRAGBiACNAYDO0wEZ1wJCwcd/v7MBwFQVQVtAAABAGD/dwEcAoAACwAABScSNQM3Fw8BER8BARa2Cwu4BAZydASJCwEUZAF7CwYfGP1xGAcAAQAl/5IBKgKjAAkAABM3MxIWFwcjJiclCC6JKR0HMCoqApkK/eqTYAigpQABABn/dwDVAoAACwAAExcCFRMHJz8BES8BH7YLC7gEBnJ0BAKAC/7sZP6FCwYfGAKPGAcAAQA4ADkBwgHhAA8AAAEXFh8BBycmJyMPAS8BNhMBDgs0IFUoC1g9BjxJMgUmgQHhCH1JvB4By5KawgcJYwExAAH/+v9wAdD/rwAIAAANASc3FjI2NRcByP44BguWoI8GjgIJMQEFAQoAAAAAAQBHAgkBDQLKAAgAABMnPwEWFw8BJkgBJgpOSBQJQwKUCykCXk4TAj4AAAACACn/9AHLAdAAJAAsAAAAJiIGDwEvATYzMhYVFAYVFDMyNxcOAQciLwEGIyImNTQ2PwIHBhQWMzI/AQEdLkc8EA8FDHgrQUoSKRshDg4zFlIHBE4gOEgdGL0Cix0nHiswBAFWOBkNDAMrRkQ9D7cgLhkQGDAIUQFORjYdLAc0LHsJPiYwZgAAAgAX//QB2ALmABQAHgAAEzQjByc3NjcXBgM2MzIWFAYjIi8BNxYyNjQmIyIGB1UlFgMERk4GDwhhGFZrkWg7RglEKntNTTcUPhkCcjYDAyEJFA0X/shGd8yZDAg4FVucah8XAAEAJP/0AYMB0AAaAAAXIiY0NjMyHwEGDwE1NCYjIgYUFjMyPwEfAQb1X3KFYjY/AxIDKS0lPUJJPy8yEAYLWAx40ZMTBzxOAx8lLVenZRkIAh9DAAIAJP/0AhkC5gAeACgAABciJjQ2MzIXNTQjBzc2NxcGAhUUMzI3Fw4BByIvAQYTJiIGFBYzMjY35VZrkmcgJSUZBEZOBgsRKRshDg40FU4LB2hoJX9NTDgVNyEJdcqaBKY2BCUJFA0R/nzbLhkQGDIGRwNHAYgXW5toGhsAAAAAAgAk//QBlgHQAAgAHQAAATQmIgYHNz4BBxUUFjMyNx8BDgEjIiY0NjMyFQ8BAUErV0MJtQ8K0lFDNUYGCxtjG150hFmVBg0BSygqQDYJAgo6EFRmHwIdFS96ypiRMQwAAQAp//wBxgLmACYAAAEyHwEGDwEmIyIPATcXByYjAxQzNxcHJiMHNzY1ES4BLwE/ATU+AQFSOTkCEA8LMkFwAwGKAwo+RgQzPAIHVSdwBTkBGSUEBzwBfALmEwkcJQMluTEDAzUD/tM3AgQrAgQnBzQBDhgPAgYiCwSCmAAAAAADADT/DgHnAeMALAA0AD8AADciJwYVFBceARUUBiMiJjU2PwE1LgE1Njc1JjU0NjMyFjM2NxcHBg8BFhUUBiYWMjY0JiIGEhYyNjU0JicOARXkGCIqeHRhmV9HUB8zES8+HDhKcEoUQgwuXAMLLCoEKHOuP2I1QGE1AzpuWUx3GCaCCBcVLQQGMTRFb0Y/KiMNBgY4JBwkBCdeR2sLBhgEOAYDBS04S2dzRzptSDz+Ciw8Jx0dEBE2FAAAAAEAGf/0AfYC5gAzAAA3ETQrASc3NjcXBgM2MzIWFRQGFRQzNxcHJiMiBzc2NTc0JiMiBwYVFBYzNxcHJiMHNz4BVyUVBARGTgYPCXIkQUgQIyMCCDQcLkIEOAYrKDpFAxAUIwIJNiVjBh0XXgIUNAMgCRQNF/7ATkQ9D74gOAIEKwMMKQ8yxjI2N3OAHxkCBCsDAikDGAAAAgAq//QA9ALIAAcAHgAAEgYiJjQ2MhYDNTQjBzc2NxcOARUUMzcXByYjIgc3NsAiLxsiLhxYJRkEMl4FCQ4jIwIINBwuQgQ4AnwiHDAiHf2z/jYEJQcWDBXXdjgCBCsDDCkPAAIAD/8PALQCyAASABoAADcRNCYjBzc2NxcGERQGByc3PgESBiImNDYyFlsRFxsENloFEUI9EgIrH1kiLxsiLhwmATYfFwMlCBQMHf5LSHYlEwgragK9IhwwIh0AAgAZ//IB4wLmABkANQAANxE0Iwc3NjcXBgIVFBYzNxcHJiMHNzY3PgETNCMnNxYzNxcHDgIHFx4BMxcHBiImLwE/ATZXJRkERk4GCxEQFCMCCTYlYwUZEQkC8TcDCT4kXwMIKUkdRmkiOB8DBjseMCp2AnoYhwHrNgQlCRQNEf564B8ZAgQrAwYpAxAHMAEiFQUdAgYFHww9GkaHLCYFHRAZPKcOcBcAAQAZ//QA4wLmABoAADcRNCMHNzY3FwYCFRQWMzcXByYjIgc3Njc+AVclGQRGTgYLERATIwIINBwuQgQcEQgDhwHrNgQlCRQNEf543h4aAgQrAwwpCBEILwAAAAABACf/9AMhAdEASQAAATQjIgcGFBYzNxcHJiMHNz4BPQE0JisBJz8BFwYHFzYzMhYXNjMyFhUUBhQWMzcXByYjBzc+ATU3NCYiDwEUMzcXByYjIgc3NjUBgVovRQkQFCMCCTYlYwYdFxYbCwMDjAYJAgJwIzBCDnAnP0oOEBQjAgk2JWMFHRgEK1xFCyMjAgg0HC5CBDgBJGg0z0YZAgQrAwIpAxgc9CIbBCEdCCAiA0wpJk9GOw++PxkCBCsDBikFGhzGMjYy+DgCBCsDDCkPMgAAAAEAJ//0AgkB0QAyAAABNCMiBwYUFjM3FwcmIwc3PgE9ATQmKwEnPwEXBgcXNjMyFhUUBhUUMzcXByYjIgc3NjUBgVovRQkQFCMCCTYlYwUdGBYbCwMDjAYJAgJyIT9KDiMjAgg0HC5CBDgBJGg0z0YZAgQrAwYpBRoc9CIbBCEdCCAiA0xGOw++IDgCBCsDDCkPMgACACT/9AHOAdAABwAPAAAkBiImNDYyFgQWMjY0JiIGAc6GuGyGuGz+pk93Qk93QoeTfM2TfL9wW6hyXAACACj/EwHsAdEAIgArAAAXNxcHIyIHNz4BNTcRNCYrASc/ARcGBxc2MzIWFAYjJxcUFicWMjY0JiIHBtoiAghfKUEFIBMCFhsLAwOMBgcDBF4WVmuTZkkBExMtek1MZTsIvgEDJgcnBBsppgEqIhsEIR0IHBoHQXXKmgRnLiH8E1ubaDGDAAAAAgAk/xYB5QHeABkAIwAAFyImNDYzMhc3FwYRFBYzNxcHIwc3PgE/AQYTJiIGFBYzMjY35VZrkmcvLTcIEw0XGgIHXGsFKRcCBGhoJX9NTTcVNyEMd8uaCRcJL/3wNh4BAicEJgIWJcNIAYsXW5xqHBwAAAABAC3//AFoAdEAJgAAEwYVFz4BMx8BBg8BNCYiBgcGFBYzNxcHJiMHNz4BPQE0JiMHJz8BvgkEHlEeHwMOAicLJjIVCBQcLAEJPydpBR4UEhQVBQOHAcs2MQMvPAQEUj0DKRslH7Y4GAIELAIEKAMhL9whHAMHHx4AAAAAAQAx//QBYgHQACYAADcvATY/ARQWMjY0LgI1NDYzMh8BBg8BNjU0JiIGFRQXHgEVFAYiQg4DCQMjLFs0L340aU8wNAIOBSUCJ00vV1E7bowEBQcyVAVCNiIyKUI7JD1SEAU4QgMUCSQhIBctLSs6JjpWAAABABX/9AE4AhQAHAAANzU0Ji8BNzY/ARcGBzcXBycGFRQWMzI3FwYjIiZSGCEEBTg0EBQEBJMDCZEHIyseJgpNGEQ4bfYbFgEGHhswEAgaMQMDNQNujDMqEho8NwAAAAABABz/9AIbAdAAKgAANxQzMj4BNzU0JiMHPwEXDgEVFDMyNxcOASMiLwEGIyImNTc0Iwc/ARcOAZtQFTMWGxYcGASaBgkNKRshDhYyD1IHBWwfQEUEJRkEjwYKEJtiFg8U6B4YASQdDBfMeC4ZECIuUQJTPDjzNgQlHgwauAAAAAH/9v/vAcQBywAiAAABNCsBJzcWMzcHDgEHAwcCJyYvATcWMzI3FwcOARUUEzMSNgFaKyYEBTcxUgcVGBORNl0dETMCBjwZKU0CBiIZVQRrDgGLFQYfAQElAxws/qsRASlWMAIEIQEHBR8BCw0e/uEBAy0AAf/8/+8CwgHLADwAADc2Ny4BIyc3FjM3FwcOARUUEzM+Ajc2NTQrASc3FjM3Bw4BBwMHJicjAwcCJyYvATcWMzI3FwcOARUUE+BaEAsfHQIGOhZ1AgYiF1IEEisYCxUpJQQFMzBSBxQYEo01NSUGbzZaHBExAgY6GChLAgYhGFJR4SwiIAQhAQUFHwEKDRr+3i1tOx45CxkGHwIBJQIdLP6rEa94/uoRASlWMQEEIQEHBR8BCw4c/uAAAAABAAj/+gHRAcgAPAAAJTQvAQYVFBYfAQcmIwcnNzY3Nj8BJy4BLwE3FjM3FwciFRQfATc2NCMnNzM3FwcGDwEXFh8BByYjByc3NgEyEUllERsCBjwXPAMGFgskGFZMIicjAgZFIGYCBi0YNz0fKwIFSUcDBhs5VlwwNQIGOyBwAgYuMw0YZnsQCgYCBCEEAwUfCwwjHmRsMSAGBCICBAUfEwwjUE0mGgQhAwUgCUJlg0YFBCICBgUfAQAAAAH/9/8OAcUBywArAAA3EjQrASc3FjM3Bw4BBwMOASMiIyImNTcyNjcmJyYvATcWMzI3FwcOARUUE+Z1Ji4CBjQxVQcWFwuBUVA+AQEIJAU6ZyI/RBctAgY8GSdPAgYiGVlbARgwBCEEASUEFx7+0LpuLwoHXVPGqy8BBCEBBwUfAQsPHP7rAAABACT/+gGgAc4AGAAAFycBBw4BDwE2PwEfAgYHNz4BPwEGFQclLgoBEH0xJQUnCgEGgNIIoH6UKCwKKBEQ/ucCGQGHBgMlMgZRQAUIBRXOuwkDOT4FWUgQCQAAAAEALv97ASACiQAoAAASNjQmNTQ2Mx8BByYiBhQWFRQHFRYVFAYUFjM3FwcGIyImNTQ2NTQnN1o1KUM7OQMIHTAeG0lJGx4gMgMIGB45QylhBAEXKjOCHzFDBgUeBSc0gxpMGAYbThuGNCYGBhwIQzEgfhJCFhUAAAEAmP7zAOEDJwAIAAATFwIVEwcnNBPWCwYBOwkCAycG/qim/dsLBhMEEAAAAQAV/3sBBwKJACgAADYGFBYVFAYjLwE3FjI2NCY1NDc1JjU0NjQmIwcnNzYzMhYVFAYVFBcH2zUpQzs5AwgdMB4bSUkbHiAyAwgYHjlDKWEE7Sozgh8xQwYFHgUnNIMaTBgGG04bhjQmBgYcCEMxIH4SQhYVAAAAAQArAMoB0gFNABUAABIWMzI/ATMXFQ8BIiYjIg8BIyc1PwGjvhEZIQoGFkwQHL4QHB4LBhZMEAFBKyoNFQVZBCspDhUFWQQAAgBY/w4A4AHQAAcADgAAEjYyFhQGIiYXEw8BJxM3aSM3HSI3HkoIB1MJNBwBrCQhMiQhiP44ChILAdoHAAAAAAIAJP9mAYMCkgAhACcAABciJw8BJzcuATQ2PwIXBxYfAQYPATU0JicDFjI2Nx8BBgIGFBYXE/ULBQ0aBQ1LV3VZEhoGEjo0AxIDKR4aIgYkOCAGC1hzPy8pIQwBjAMHjA5zu48KwAQJuQIRBzxOAx8eKQf+ogEREAIfQwGkV5NdEQFaAAEAJv/0AdcCVgAuAAAlFhQGIiYiBy8BNj0BLgEvAT8BNTQ2MzIfAQ8BJiMiDwE3FwcmIwcGBzcyFjMyNwHKDSxDsFQoBw9oARgmBAc8a1hGIQUXEz0qVwQDoQMKT00CBTs3HnYYRAeMHkQ2LR4EIkVeMBcQAgYiCxFrgg8LPwMhfE4DAzUDT1ExCxZLAAAAAAIAHgCtAZ4CLQAdACUAABMmNDcnPwEWFzYyFzcfAQcWFAcXDwEnBiInBy8BPgEUFjI2NCYiYhkbRgInICMlWCVEDRtGHBdHAyhCJl8mQwsXIDg5Ujo6UgEVJF0mRQwaIiMYGEsDKEUlWyRCCx5CGxtDAycem1I5OVI6AAABAB//9gINAf0ASQAAEwcnNzMuBC8BNxYzMjcXBw4BFBcjFzc2NC8BNxYzNxcHBgcGBzcXByMHBgc3FwcjBxQWMzcXByYjIgc3PgE1NDUHJzczJifChAUFcAkhDRwhGQIHOh4oWQUDKBcMAVBdDTUBBT4kUAUGLxQRN3MGA40jCAK3BgO7AQ0TLgIJSBwuQAUvE7QFBbEJDAEXAQcdEUAVIAsBCSQDBwoiBAoVGZ2fFh4FByUGAwclBxoWWgIJHjkRFgQJHjocFAIIJgIKKwgiPAgFAQcdIBUAAAAAAgCY/vMA4QMnAAUADAAAPwEXEwcnGwE3FwYPAZhAAwE7CQEBPAsFAT6mDAP+TwsGAnkBqgsG+bAJAAAAAgAj/5cB3QKJACkAOAAANiY0Njc+ATMyFhQGByMuASIGFB4DFAYHDgEiJjU0NjczHgEyNjQuAScUHgIXNjU0JyYnJicGWjc+NgRVOic8DQYODjo2IDhQTzhCMwJjc0MKBQ8KQEwtN09NSlxYCz9VJCZcDj/gUFpXIDhQHiU1ByIsIz1ANjpNXWEaMVsuIhY3CDVBKkA/N9kmUD5YKyg9NUAcHEY+JgAAAgBGAjYBRwKTAAcADwAAAAYiJjQ2MhYOASImNDYyFgFHHSgWHSgWph0oFh0oFgJTHRomHRknHRomHRkAAwAq//QCiwJWABsAIwArAAAlBiImNDYzMh8BBg8BNjU0IyIGFBYzMjY/AQYHJDQ2MhYUBiICFBYyNjQmIgG/LYhNX04oOAIKAyEBQC0zMTEiJQggCwL+Z7L9srL9iJnampralhNYkGQMBCczAg0LLD16SSQnAjEmCvyzs/yzAZ/cm5vcmwAAAAIAHgFXATYChwAfACYAAAEyNxcGByIvAQYjIiY0PwI0JiMiDwEvATYzMhYVBxQnBhQWMj8BAQoSEQkcHzgFBDIVJDEkegEdFigeCgUJUh0xMgyDERcoHAIBkA0MMAoyATAxTwoeFB0gFwcCIS8uJogbPgUjFxc+AAIAFAAuAX0BkAAKABUAAAEfAQcXDwEmJzU2Jx8BBxcPASYnNTYBZhYBa2sBFkRoYFoWAWtrARZEaGABkA8KlZsKD0ZgD1tSDwqVmwoPRmAPWwAAAAEAEgAeAcoBKQANAAABFwYHFwcnNjUFJzcWMwHEBgcBATEJAf6OBguWWQEpCj8viAsGcFgCCTEBAAAAAAQAHgEvAbYCxwAHAA8ANgA/AAASNDYyFhQGIgIUFjI2NCYiFzU0KwEnNxY7ATcyFhUUBxcWMxcUBiIvASMGFBYzFwcmKwEHNz4BNxc2NTQjIhUGHneqd3eqVGOMY2OMAwwLAgMeDQsfJiswHRUUAxArER0ZAQcRAgISDgwtAhEIKB0fNAYCAaaqd3eqdwESjGNjjGPObxIEEQECHRopFisgBAwFIDcOJgkEEQECFQEOSQMMHiYILgABADICUgFdAo0ABwAAARcHBSc3FjMBVwYH/uIGCl87Ao0KLwIJLQEAAgAZAY0BFQKJAAcADwAAEjQ2MhYUBiImFBYyNjQmIhlJaklJah8xRjExRgHWaklJakmhRjExRjEAAAAAAgAS/7UB6AH3ABIAGwAAJQcXByc2NQcnNxYzPwEXBhU3FwMFJzcWMjY1FwHgygExCQHGBgtqVwEzCgbMBgj+OAYLlqCPBvkBuAsGZ1YBCTEBvwgGcVAGCv6LAgkxAQUBCgAAAAEAGAFYATQC2AAbAAATNCIHIyc+ATIWFAYHFzMyNj8BBg8BJiMHJzc2vGolBwoUSFQ7QFADUiAaCCYOBQmWOioGRV8Cby4+KSIuL0xpXQUWIwQ+MQYFBxlNdQAAAQAfAVcA/gLYACIAABMWMjY1NCMvATc2NTQmIyIHIyc+ATIWFRQHFRYVFAYjIiYnJRtDN2gFBCo1GBQlIwcKDkVFMkZXcT8ZFQEBlwglHToFIAkaKBMWHCULICoeOiEFGEAuUxofAAABAIECCQFHAssACAAAAQcGBy8BNjcXAUcBVFQJFElNCgKgC0BMAhNPXgIAAAEANf8OAgYB0AAtAAA3BhUUFw8BJzY3EzQnPwEXDgEUMzI2NzUnPwEXDgEVFDMyNxcOASMiLwEGByInfwQIBUIHCwQGBwVXBgkRVBg4IAcFVgYJDSkbIQ4WMg9UBQZSLyohC2AOKVAHDwyOoQD/NjgHEwwZssAcHOldBxIMF8t5LhkQIi5NAkUKGgAAAQAq/5cB+wKBACkAABMXNw8BKgEGBwYRFAYHBiMiJjQ3MxQWMzI2NREuASMiBhQWFxUuATU0Nv2BfQYCCCgeAgsfFCxYOE4mDzQsPSgBBxMxMSAlaYp0AoEEAyoEERxI/r1nXBQsMFssQkZTbQG8CgRQimEyDwl1a1NxAAEAPACoALMBHwAHAAA2BiImNDYyFrMjNx0iNx7MJCEyJCEAAAEAY/8XAR8AFwAXAAAFFAYiJjQ3Mx4BMjY1NCc3MwceAxcWAR9NRCsZCQEeLBxVISsZBBsNFQUPiyY4FCAoGx4VERoxbEkDEgkSBxIAAAAAAQAbAVgA3QLYACIAABM3MxcGBwYVFBYzNxcHJiMHNz4BPQE0JiMHJzc+Bq8GAQUUBAYNESACBzggWwQfGg8SIQMDNR8SDgwIBwLXAQ8SIXB5GBMCAyQCByMCFhvRFg0DAyAHBAMCAgECAAAAAgAcAVcBNgKHAAcAEQAAAAYiJjQ2MhYGFjMyNTQmIyIVATZVfUhWfUfUKSFDKSFDAbJbT4ZbTnhBXjpBXgAAAAIALgAuAZcBkAAKABUAADcvATcnPwEWFxUGBy8BNyc/ARYXFQbrFgFrawEWRGhg8hYBa2sBFkRoYC4PCpWbCg9GYA9bUg8KlZsKD0ZgD1sABAAb/6EClAKmACIAKwA7AD8AABM3MxcGBwYVFBYzNxcHJiMHNz4BPQE0JiMHJzc+BiUXAgcDLwE2ARMzFwcnFw8BJzY1Jz8CFwc1IwevBgEFFAQGDREgAgc4IFsEHxoPEiEDAzUfEg4MCAcBmgWuWNcmBYUBVzg3BQY2BAQ9BQSaAqwDJz4GWgKDAQ8SIXB5GBMCAyQCByMCFhvRFg0DAyAHBAMCAgECEA7+/Y3+rBMMygIc/fIHLAJhBgcGOi8DIusBBtt9fQADABv/oQK0AqYAIgArAEcAABM3MxcGBwYVFBYzNxcHJiMHNz4BPQE0JiMHJzc+BiUXAgcDLwE2ARM0IgcjJz4BMhYUBgcXMzI2PwEGDwEmIwcnNzavBgEFFAQGDREgAgc4IFsEHxoPEiEDAzUfEg4MCAcBmgWuWNcmBYUBVxxqJQcKFEhUO0BQA1IgGggmDgUJljoqBkVfAoMBDxIhcHkYEwIDJAIHIwIWG9EWDQMDIAcEAwICAQIQDv79jf6sEwzKAhz+ai4+KSIuL0xpXQUWIwQ+MQYFBxlNdQAABAAf/6ECmAKmACIAKwA7AD8AABMWMjY1NCMvATc2NTQmIyIHIyc+ATIWFRQHFRYVFAYjIiYnARcCBwMvATYBEzMXBycXDwEnNjUnPwIXBzUjByUbQzdoBQQqNRgUJSMHCg5FRTJGV3E/GRUBAiwFrljXJgWFAVc4NwUGNgQEPQUEmgKsAyc+BloBQwglHToFIAkaKBMWHCULICoeOiEFGEAuUxofAVcO/v2N/qwTDMoCHP3yBywCYQYHBjovAyLrAQbbfX0AAAACAB//DgEuAdAAFwAfAAAXFB8BDwEuATU0Nz4CPwEnPwEfAQ8BBhI2MhYUBiImYcsCIQ5dgycUHkANAxUDPQkYA3c5OSM3HSI3Hi9zDAs1BANfQ0ApFRgqCQlfCBEEeA5MJwGsJCEyJCEAAAAD/+7/9gJPA0kAJQArADMAAAUnNz4BNC8BJiIPAQYVFDsBFwcmIwc3PgE3EzczEhceAR8BByYiAzI3AyMLASc/ARYXDwEBSQMEMyYJIRiAPSUJPDkCBklCbggcIhDDPwhUSwwoLAIHSGeLJDlPB18kBBAJaV4GCAoHJwQQJhxtAQhoGwwpBCsHAy8DISkB/xH+yeElHgQEKQMBEQUBBv71AfgKMAY8MRgFAAAAA//u//YCTwNJACUAKwAzAAAFJzc+ATQvASYiDwEGFRQ7ARcHJiMHNz4BNxM3MxIXHgEfAQcmIgMyNwMjAwEHBgcvATcXAUkDBDMmCSEYgD0lCTw5AgZJQm4IHCIQwz8IVEsMKCwCB0hniyQ5TwdfAREEZWkIBscJCgcnBBAmHG0BCGgbDCkEKwcDLwMhKQH/Ef7J4SUeBAQpAwERBQEG/vUCAgoiKAUYbQYAAAP/7v/2Ak8DTgAlACsANwAABSc3PgE0LwEmIg8BBhUUOwEXByYjBzc+ATcTNzMSFx4BHwEHJiIDMjcDIwsBJzczFhcPASYnBgcBSQMEMyYJIRiAPSUJPDkCBklCbggcIhDDPwhUSwwoLAIHSGeLJDlPB18SDooOSUEOCUM3NEYKBycEECYcbQEIaBsMKQQrBwMvAyEpAf8R/snhJR4EBCkDAREFAQb+9QG4Fm8+MRYBJxoYKQAAAAAD/+7/9gJPAzQAJQArAEEAAAUnNz4BNC8BJiIPAQYVFDsBFwcmIwc3PgE3EzczEhceAR8BByYiAzI3AyMDEhYzMj8BMxcVDwEiJiMiDwEjJzU/AQFJAwQzJgkhGIA9JQk8OQIGSUJuCBwiEMM/CFRLDCgsAgdIZ4skOU8HXzt0CxYgCwYWTBARdAwXHwoGFkwQCgcnBBAmHG0BCGgbDCkEKwcDLwMhKQH/Ef7J4SUeBAQpAwERBQEG/vUCFyEiCxUFTwQhIgsVBU8EAAAE/+7/9gJPAzIAJQArADMAOwAABSc3PgE0LwEmIg8BBhUUOwEXByYjBzc+ATcTNzMSFx4BHwEHJiIDMjcDIwMSBiImNDYyFg4BIiY0NjIWAUkDBDMmCSEYgD0lCTw5AgZJQm4IHCIQwz8IVEsMKCwCB0hniyQ5Twdf8R0oFh0oFqYdKBYdKBYKBycEECYcbQEIaBsMKQQrBwMvAyEpAf8R/snhJR4EBCkDAREFAQb+9QHhHRomHRknHRomHRkAAAAE/+7/9gJPA0YAJQArADUAPQAABSc3PgE0LwEmIg8BBhUUOwEXByYjBzc+ATcTNzMSFx4BHwEHJiIDMjcDIwMTMjU0JiMiFRQWNgYiJjQ2MhYBSQMEMyYJIRiAPSUJPDkCBklCbggcIhDDPwhUSwwoLAIHSGeLJDlPB19zLBsYLCBhLksoLkwnCgcnBBAmHG0BCGgbDCkEKwcDLwMhKQH/Ef7J4SUeBAQpAwERBQEG/vUBtycWGicYGA40LEkvLAAC//b/9gMQAokAQgBGAAAkNjU0Jw8CBhUUOwEHJiMHJzY3EyYjByc3FjMyNxcGDwE2NTQmIgYHFz8BFw8CFx4BMzI2PwEXBg8BJisBIgcnNwM3JyMBaCYZY1tHEDc5BUpARAchHvcEFSICB28w2lADEQYwAjKaFgEfdlwEDVZtHAYlKW06CywDEgkF0D0iRFACAludHgkpExUYqwgKih8PIi8HBCMjNwHJEAIELAMMBkpcBB0OMRYKFeQLDQU1AwmpJh4oUgUFU1UGBwoHJwESC9oAAAEAKP8XAkECiQAzAAAWJhA2MzIfAQYPATY1NCMiBhQWMzI2PwEGDwEGDwEeAxcWFRQGIiY0NzMeATI2NTQnN7+XxpdKZAQTBjADk2V3fWhEUxMwFAcGTGoNBBsNFQYOTUQrGQkBHS0cVRYFpQEhyBgGS1wEGxZdjfugTVEEW0gJIwQnAxIJEgcSECY4FCAoGx4VERoxSgAAAgA6//YCFANJADAAOAAAExc3FwcmIgcGFBYyPgE/ARcGDwEmIyIHNz4BNRM0JiMHJzcWIDcXBg8BNjU0JiIGBy8BPwEWFw8B22d6BA5WWygEGYpGHwgsAxIJBdBAYkgGLSEBDxYiAgdPARBYAxEGMAIvmxQBQgQQCWleBggBYgELBTsDB5BYExEvOgUFU1UGBwouBiMrAaQgFgIELAMMBkpcBB0OMRYLHOUKMAY8MRgFAAAAAgA6//YCFANJADAAOAAAExc3FwcmIgcGFBYyPgE/ARcGDwEmIyIHNz4BNRM0JiMHJzcWIDcXBg8BNjU0JiIGBzcHBgcvATcX22d6BA5WWygEGYpGHwgsAxIJBdBAYkgGLSEBDxYiAgdPARBYAxEGMAIvmxQB8wRlaQgGxwkBYgELBTsDB5BYExEvOgUFU1UGBwouBiMrAaQgFgIELAMMBkpcBB0OMRYLHO8KIigFGG0GAAAAAgA6//YCFANOADAAPAAAExc3FwcmIgcGFBYyPgE/ARcGDwEmIyIHNz4BNRM0JiMHJzcWIDcXBg8BNjU0JiIGBy8BNzMWFw8BJicGB9tnegQOVlsoBBmKRh8ILAMSCQXQQGJIBi0hAQ8WIgIHTwEQWAMRBjACL5sUATAOig5JQQ4JQzc0RgFiAQsFOwMHkFgTES86BQVTVQYHCi4GIysBpCAWAgQsAwwGSlwEHQ4xFgscpRZvPjEWAScaGCkAAAAAAwA6//YCFAMyADAAOABAAAATFzcXByYiBwYUFjI+AT8BFwYPASYjIgc3PgE1EzQmIwcnNxYgNxcGDwE2NTQmIgYHNgYiJjQ2MhYOASImNDYyFttnegQOVlsoBBmKRh8ILAMSCQXQQGJIBi0hAQ8WIgIHTwEQWAMRBjACL5sUAdMdKBYdKBamHSgWHSgWAWIBCwU7AweQWBMRLzoFBVNVBgcKLgYjKwGkIBYCBCwDDAZKXAQdDjEWCxzOHRomHRknHRomHRkAAAACAB//9AE4A0kAHgAmAAA3FBYzNxcHJiMiBzc+ATUTNCYjByc3FjMyNwcOAQcCAyc/ARYXDwHVEho1AglUIzpGBi8hAQ8WKgIHTh8qUwQqHAIOsgQQCWleBghwKRsDBC4DDC4JIyoBpCAWAgQsAwktBRcd/t4CCwowBjwxGAUAAAIAOP/0AVgDSQAeACYAADcUFjM3FwcmIyIHNz4BNRM0JiMHJzcWMzI3Bw4BBwITBwYHLwE3F9USGjUCCVQjOkYGLyEBDxYqAgdOHypTBCocAg6DBGVpCAbHCXApGwMELgMMLgkjKgGkIBYCBCwDCS0FFx3+3gIVCiIoBRhtBgAAAgAn//QBSQNOAB4AKgAANxQWMzcXByYjIgc3PgE1EzQmIwcnNxYzMjcHDgEHAgMnNzMWFw8BJicGB9USGjUCCVQjOkYGLyEBDxYqAgdOHypTBCocAg6gDooOSUEOCUM3NEZwKRsDBC4DDC4JIyoBpCAWAgQsAwktBRcd/t4ByxZvPjEWAScaGCkAAAADADf/9AE4AzIAHgAmAC4AADcUFjM3FwcmIyIHNz4BNRM0JiMHJzcWMzI3Bw4BBwISBiImNDYyFg4BIiY0NjIW1RIaNQIJVCM6RgYvIQEPFioCB04fKlMEKhwCDmMdKBYdKBamHSgWHSgWcCkbAwQuAwwuCSMqAaQgFgIELAMJLQUXHf7eAfQdGiYdGScdGiYdGQAAAgAJ//QCngKBABwALQAABSYjIgc3PgE9ASMnNzM3NCYjByc3FjM3MhYVFAYnMjYQJiMiBg8BMxcHIwcUFgFEXSU7RgY0GoUHB4UBDxYiAgdDJpiQuch7bHyflBUOAQmqBQaqBTMMDAwuCilIkwcgxSAWAgQsAwSog5XNM5UBBo4JDeMHIK03JQAAAAACADb/2AKuAzQALABCAAAlETQjByc3FjMyNwcOAQcDBwIDIwMUFjM3FwcmIyIHNzY3EzQmLwE3FjM3FhMCFjMyPwEzFxUPASImIyIPASMnNT8BAiwhJgIJPRssPgUjIAEOHbW/BQUOETMCCT8eMDoFPQENJTIDCDocQ5S86nQLFiALBhZMEBF0DBcfCgYWTBCRAZUrAQQtBAguBR0d/c4OARkBDv5VFhIBBC0ECC4HOAG1HxoFBSUFBOb+9gKXISILFQVPBCEiCxUFTwQAAAAAAwAo//QCjANJAAcAEAAYAAA2FjI2NCYiBhMiJhA2IBYQBgEnPwEWFw8BfnzBeH/CdL97mr4BCJ7B/vYEEAlpXgYIyaKR86KQ/jesAR3MrP7jzAMVCjAGPDEYBQADACj/9AKMA0kABwAQABgAADYWMjY0JiIGEyImEDYgFhAGEwcGBy8BNxd+fMF4f8J0v3uavgEInsErBGVpCAbHCcmikfOikP43rAEdzKz+48wDHwoiKAUYbQYAAAMAKP/0AowDTgAHABAAHAAANhYyNjQmIgYTIiYQNiAWEAYDJzczFhcPASYnBgd+fMF4f8J0v3uavgEInsH4DooOSUEOCUM3NEbJopHzopD+N6wBHcys/uPMAtUWbz4xFgEnGhgpAAAAAwAo//QCjAM0AAcAEAAmAAA2FjI2NCYiBhMiJhA2IBYQBgIWMzI/ATMXFQ8BIiYjIg8BIyc1PwF+fMF4f8J0v3uavgEInsGrdAwVIQoGFkwQEXQMFx4LBhZMEMmikfOikP43rAEdzKz+48wDNCEiCxUFTwQhIgsVBU8EAAQAKP/0AowDMgAHABAAGAAgAAA2FjI2NCYiBhMiJhA2IBYQBhIGIiY0NjIWDgEiJjQ2MhZ+fMF4f8J0v3uavgEInsELHSgWHSgWph0oFh0oFsmikfOikP43rAEdzKz+48wC/h0aJh0ZJx0aJh0ZAAABAEQAUAG1AcEAEQAAAR8BBxcPAScHLwE2Nyc/ARYXAYgLH46RAyqLjAsbTD6RAitOPgHBAyqPhwweio4DKko+kAsaTz4AAAADACj/ngKMAsQAFwAfACcAABM0NjMyFzcfAQceARUUBiMiJwcvATcuAQUyNjU0JwMWAxQXEyYjIgYovos7MiodAylCS8GOPzo8GwI7PEIBNF94XPI1nE3vMTpddAEplMwVUAcMTCaOXJXMGnAGCnEni6qRc51S/jQnASKTUAHJHpAAAAACACP/9AKIA0kAKQAxAAA2FjI2NQMuASMHJzcWMzI3Bw4BFREUBiImNRE0JiMHJzcWMzI3Bw4BBwMTJz8BFhcPAbhWo1YGAg0WKwIHSx0pQQQsGYLfcg8WIgIHSx0oSgQlGQIIDgQQCWleBgiXaldSAUYjEwIELAMJLQYUH/6waXNzagFLIBYCBCwDCS0FFx3+2gIPCjAGPDEYBQACACP/9AKIA0kAKQAxAAA2FjI2NQMuASMHJzcWMzI3Bw4BFREUBiImNRE0JiMHJzcWMzI3Bw4BBwMBBwYHLwE3F7hWo1YGAg0WKwIHSx0pQQQsGYLfcg8WIgIHSx0oSgQlGQIIAUMEZWkIBscJl2pXUgFGIxMCBCwDCS0GFB/+sGlzc2oBSyAWAgQsAwktBRcd/toCGQoiKAUYbQYAAAAAAgAj//QCiANOACkANQAANhYyNjUDLgEjByc3FjMyNwcOARURFAYiJjURNCYjByc3FjMyNwcOAQcDEyc3MxYXDwEmJwYHuFajVgYCDRYrAgdLHSlBBCwZgt9yDxYiAgdLHShKBCUZAgggDooOSUEOCUM3NEaXaldSAUYjEwIELAMJLQYUH/6waXNzagFLIBYCBCwDCS0FFx3+2gHPFm8+MRYBJxoYKQAAAwAj//QCiAMyACkAMQA5AAA2FjI2NQMuASMHJzcWMzI3Bw4BFREUBiImNRE0JiMHJzcWMzI3Bw4BBwMABiImNDYyFg4BIiY0NjIWuFajVgYCDRYrAgdLHSlBBCwZgt9yDxYiAgdLHShKBCUZAggBIx0oFh0oFqYdKBYdKBaXaldSAUYjEwIELAMJLQYUH/6waXNzagFLIBYCBCwDCS0FFx3+2gH4HRomHRknHRomHRkAAAAAAv/t//QCLgNJADgAQAAAEgYUHgE7ATc2NTQvATcWMzcXBw4BBwYPAQYHBhQWMzcXByYjIgc3PgE9ATQvASYnJi8BNxYzNxcHNwcGBy8BNxfCHzg3AQVyED8CBkolXAQGLickAgFrEQMCEhoxAglTITdGBjQaHVoiDhc3AgZALo4DA84EZWkIBscJAlcPHoF01B0VGgQEJwcEByUJJkEEArwfOClbHAMELgMMLgooOiw3OrdGDxkFBCcDCAcjuAoiKAUYbQYAAAACADj/9AIJAoYAKAAzAAATMAcwFTMyFhQGKwEVFBYzNxcHJiMiBzc+ATUTNCYjByc3FjMyNwcOARc0JiMiBwYHFhc24wJSZ2+OX0cSGjUCCVQjOkYGLyEBDxYqAgdOHypTBCoc0FpiGQIGAi05eQIgHwpUnHMkKRsDBC4DDC4JIyoBpCAWAgQsAwktBRf8RUAIjGEPAg8AAAEAKf/0AkYC5gA/AAAlNDY3MxQWMjY0LgM0PgI1NCYiBgcDBjM3FwcmIwc3PgE1ES4BLwE/ATQ2MzIWFAYHBhUUFx4BFRQGIyImASAaDA4ySy4tQUEtKTEpRXM3AQYCKS8CB0UecAUjFgEbIwQHPHptO10nGD9tKERqSDFDKQ45Dy0yMz0yKCs/RT0oNRksM1pf/nA3AQQqAgQnBB8mAQAWEQIGIguHl0tVQxU1LDE6FUwuQF8fAAADACn/9AHLAsoAJAAsADUAAAAmIgYPAS8BNjMyFhUUBhUUMzI3Fw4BByIvAQYjIiY1NDY/AgcGFBYzMj8BAyc/ARYXDwEmAR0uRzwQDwUMeCtBShIpGyEODjMWUgcETiA4SB0YvQKLHSceKzAEvAEmCk5IFAlDAVY4GQ0MAytGRD0PtyAuGRAYMAhRAU5GNh0sBzQsewk+JjBmAcILKQJeThMCPgAAAAADACn/9AHLAssAJAAsADUAAAAmIgYPAS8BNjMyFhUUBhUUMzI3Fw4BByIvAQYjIiY1NDY/AgcGFBYzMj8BEwcGBy8BNjcXAR0uRzwQDwUMeCtBShIpGyEODjMWUgcETiA4SB0YvQKLHSceKzAEQgFUVAkUSU0KAVY4GQ0MAytGRD0PtyAuGRAYMAhRAU5GNh0sBzQsewk+JjBmAc4LQEwCE09eAgAAAAADACn/9AHLAr8AJAAsADkAAAAmIgYPAS8BNjMyFhUUBhUUMzI3Fw4BByIvAQYjIiY1NDY/AgcGFBYzMj8BAyc2NzMWFw8BJicGBwEdLkc8EA8FDHgrQUoSKRshDg4zFlIHBE4gOEgdGL0Cix0nHiswBMIOMVkOSUEOCRZkTiwBVjgZDQwDK0ZEPQ+3IC4ZEBgwCFEBTkY2HSwHNCx7CT4mMGYBPhYzZlVEFgETTjonAAMAKf/0AcsCtAAkACwAQQAAACYiBg8BLwE2MzIWFRQGFRQzMjcXDgEHIi8BBiMiJjU0Nj8CBwYUFjMyPwECFjI2NzMXFQ8BIiYjIg8BIyc1PwEBHS5HPBAPBQx4K0FKEikbIQ4OMxZSBwROIDhIHRi9AosdJx4rMAR3dBcgFQYWTBARdAwVIAsGFkwQAVY4GQ0MAytGRD0PtyAuGRAYMAhRAU5GNh0sBzQsewk+JjBmAcwhGxwVBVkEISoNFQVZBAAAAAAEACn/9AHLApMAJAAsADQAPAAAACYiBg8BLwE2MzIWFRQGFRQzMjcXDgEHIi8BBiMiJjU0Nj8CBwYUFjMyPwESBiImNDYyFg4BIiY0NjIWAR0uRzwQDwUMeCtBShIpGyEODjMWUgcETiA4SB0YvQKLHSceKzAEQB0oFh0oFqYdKBYdKBYBVjgZDQwDK0ZEPQ+3IC4ZEBgwCFEBTkY2HSwHNCx7CT4mMGYBgR0aJh0ZJx0aJh0ZAAAABAAp//QBywLEACQALAA2AD4AAAAmIgYPAS8BNjMyFhUUBhUUMzI3Fw4BByIvAQYjIiY1NDY/AgcGFBYzMj8BAzI1NCYjIhUUFjYGIiY0NjIWAR0uRzwQDwUMeCtBShIpGyEODjMWUgcETiA4SB0YvQKLHSceKzAEPSwbGCwgYS5LKC5NJgFWOBkNDAMrRkQ9D7cgLhkQGDAIUQFORjYdLAc0LHsJPiYwZgF0JxYaJxgYDjQsSS8sAAMAHv/0AnkB0AAqADMAPQAABSImJwYHIiY1NDY/AjQjIgYHLwE2MzIXNjMyFhUPAQUeATMyPwEfAQ4BJQYUFjMyNyY1NxU3NjU0JiMiBgHgP2AYVDc4SB0YvwFWHT0hBQx5KmIaPVtASQIJ/vIFUz0zNhIGCx1h/owgKBsqSQxGrxQqHzdDDDgzWQ5GNh0rBzQyaBsaAytGUFBLQxMOQE1gGgkCHRcttQk9KkQlMDsHMgYMIS1NAAABACT/FwGDAdAAMQAAMiY0NjMyHwEGDwE1NCYjIgYUFjMyPwEfAQYPAR4DFxYVFAYiJjQ3Mx4BMjY1NCc3g1+FYjY/AxIDKS0lPUJJPy8yEAYLTjINBBsNFQYOTUQrGQkBHS0cVRd1yJMTBzxOAx8lLVenZRkIAh87BycDEgkSBxIQJjgUICgbHhURGjFLAAADACT/9AGWAsoACAAdACYAAAE0JiIGBzc+AQcVFBYzMjcfAQ4BIyImNDYzMhUPAQEnPwEWFw8BJgFBK1dDCbUPCtJRQzVGBgsbYxtedIRZlQYN/vIBJgpOSBQJQwFLKCpANgkCCjoQVGYfAh0VL3rKmJExDAGSCykCXk4TAj4AAAMAJP/0AZYCywAIAB0AJgAAATQmIgYHNz4BBxUUFjMyNx8BDgEjIiY0NjMyFQ8BAwcGBy8BNjcXAUErV0MJtQ8K0lFDNUYGCxtjG150hFmVBg0QAVRUCRRJTQoBSygqQDYJAgo6EFRmHwIdFS96ypiRMQwBngtATAITT14CAAAAAwAk//QBlgK/AAgAHQAqAAABNCYiBgc3PgEHFRQWMzI3HwEOASMiJjQ2MzIVDwEBJzY3MxYXDwEmJwYHAUErV0MJtQ8K0lFDNUYGCxtjG150hFmVBg3+7A4xWQ5JQQ4JFmROLAFLKCpANgkCCjoQVGYfAh0VL3rKmJExDAEOFjNmVUQWARNOOicAAAAEACT/9AGWApMACAAdACUALQAAATQmIgYHNz4BBxUUFjMyNx8BDgEjIiY0NjMyFQ8BAgYiJjQ2MhYOASImNDYyFgFBK1dDCbUPCtJRQzVGBgsbYxtedIRZlQYNEh0oFh0oFqYdKBYdKBYBSygqQDYJAgo6EFRmHwIdFS96ypiRMQwBUR0aJh0ZJx0aJh0ZAAACAAb/9AD0AsoAFgAfAAA3NTQjBzc2NxcOARUUMzcXByYjIgc3NgMnPwEWFw8BJmglGQQyXgUJDiMjAgg0HC5CBDhhASYKTkgUCUNe/jYEJQcWDBXXdjgCBCsDDCkPAmgLKQJeThMCPgAAAAACACr/9AEMAssAFgAfAAA3NTQjBzc2NxcOARUUMzcXByYjIgc3NhMHBgcvATY3F2glGQQyXgUJDiMjAgg0HC5CBDikAVRUCRRJTQpe/jYEJQcWDBXXdjgCBCsDDCkPAnQLQEwCE09eAgAAAAAC//7/9AEgAr4AFgAjAAA3NTQjBzc2NxcOARUUMzcXByYjIgc3NgMnNjczFhcPASYnBgdoJRkEMl4FCQ4jIwIINBwuQgQ4XA4xWQ5JQQ4JFmROLF7+NgQlBxYMFdd2OAIEKwMMKQ8B4xYzZlVEFgETTjsmAAMAC//0AQwCkwAWAB4AJgAANzU0Iwc3NjcXDgEVFDM3FwcmIyIHNzYSBiImNDYyFg4BIiY0NjIWaCUZBDJeBQkOIyMCCDQcLkIEOKQdKBYdKBamHSgWHSgWXv42BCUHFgwV13Y4AgQrAwwpDwInHRomHRknHRomHRkAAAACACv/9AHRAuUAGwAkAAAlFAYiJjQ2MzIXNyYnBy8BNyYnPwEWFzcfAQcWAjY0JyYiBhQWAdGAt2+DXBwuAiQ7hQkEdkZgDwpvU4oIBHmkjjwSLIJEU/Jrk3nHkRoCUj1AAx46PC0hBDBEQwUdO5n+Z1ugRilXpW4AAAAAAgAn//QCCQK0ADIARwAAATQjIgcGFBYzNxcHJiMHNz4BPQE0JisBJz8BFwYHFzYzMhYVFAYVFDM3FwcmIyIHNzY1AhYyNjczFxUPASImIyIPASMnNT8BAYFaL0UJEBQjAgk2JWMFHRgWGwsDA4wGCQICciE/Sg4jIwIINBwuQgQ4lXQXIBUGFkwQEXQMFSALBhZMEAEkaDTPRhkCBCsDBikFGhz0IhsEIR0IICIDTEY7D74gOAIEKwMMKQ8yAkAhGxwVBVkEISoNFQVZBAAAAAMAJP/0Ac4CygAHAA8AGAAAJAYiJjQ2MhYEFjI2NCYiBhMnPwEWFw8BJgHOhrhshrhs/qZPd0JPd0IKASYKTkgUCUOHk3zNk3y/cFuoclwBVgspAl5OEwI+AAAAAwAk//QBzgLLAAcADwAYAAAkBiImNDYyFgQWMjY0JiIGAQcGBy8BNjcXAc6GuGyGuGz+pk93Qk93QgEIAVRUCRRJTQqHk3zNk3y/cFuoclwBYgtATAITT14CAAADACT/9AHOAr8ABwAPABwAACQGIiY0NjIWBBYyNjQmIgY3JzY3MxYXDwEmJwYHAc6GuGyGuGz+pk93Qk93QgQOMVkOSUEOCRZkTiyHk3zNk3y/cFuoclzSFjNmVUQWARNOOicAAwAk//QBzgK0AAcADwAkAAAkBiImNDYyFgQWMjY0JiIGEhYyNjczFxUPASImIyIPASMnNT8BAc6GuGyGuGz+pk93Qk93Qk90FyAVBhZMEBF0DBUhCgYWTBCHk3zNk3y/cFuoclwBYCEbHBUFWQQhKg0VBVkEAAAABAAk//QBzgKTAAcADwAXAB8AACQGIiY0NjIWBBYyNjQmIgYABiImNDYyFg4BIiY0NjIWAc6GuGyGuGz+pk93Qk93QgEGHSgWHSgWph0oFh0oFoeTfM2TfL9wW6hyXAEVHRomHRknHRomHRkAAwASAB0B6AHxAAcADwAXAAABFwcFJzcWMxYGIiY0NjIWEAYiJjQ2MhYB4gYI/jgGC5ZZKCM3HSI3HiM3HSI3HgEpCjMCCTEB4iQhMiQhASskITIkIQAAAAMAJP+eAc4CGwAVABsAIgAANzQ2MzIXNx8BBxYVFAYjIicHLwE3JhcWMjY0JyYGFBcTJiMkhmInIi8dAy9ZhmIoKTcbAjZTkCJkQi2ZQiiYICbSa5MOWQcMVz2Ca5MRZwYKaD0SHFuuOjJcqzcBJhgAAAAAAgAc//QCGwLKACoAMwAANxQzMj4BNzU0JiMHPwEXDgEVFDMyNxcOASMiLwEGIyImNTc0Iwc/ARcOAQMnPwEWFw8BJptQFTMWGxYcGASaBgkNKRshDhYyD1IHBWwfQEUEJRkEjwYKEBgBJgpOSBQJQ5tiFg8U6B4YASQdDBfMeC4ZECIuUQJTPDjzNgQlHgwauAGiCykCXk4TAj4AAgAc//QCGwLLACoAMwAANxQzMj4BNzU0JiMHPwEXDgEVFDMyNxcOASMiLwEGIyImNTc0Iwc/ARcOARMHBgcvATY3F5tQFTMWGxYcGASaBgkNKRshDhYyD1IHBWwfQEUEJRkEjwYKEOYBVFQJFElNCptiFg8U6B4YASQdDBfMeC4ZECIuUQJTPDjzNgQlHgwauAGuC0BMAhNPXgIAAgAc//QCGwK/ACoANwAANxQzMj4BNzU0JiMHPwEXDgEVFDMyNxcOASMiLwEGIyImNTc0Iwc/ARcOAQMnNjczFhcPASYnBgebUBUzFhsWHBgEmgYJDSkbIQ4WMg9SBwVsH0BFBCUZBI8GChAeDjFZDklBDgkWZE4sm2IWDxToHhgBJB0MF8x4LhkQIi5RAlM8OPM2BCUeDBq4AR4WM2ZVRBYBE046JwAAAwAc//QCGwKTACoAMgA6AAA3FDMyPgE3NTQmIwc/ARcOARUUMzI3Fw4BIyIvAQYjIiY1NzQjBz8BFw4BEgYiJjQ2MhYOASImNDYyFptQFTMWGxYcGASaBgkNKRshDhYyD1IHBWwfQEUEJRkEjwYKEOQdKBYdKBamHSgWHSgWm2IWDxToHhgBJB0MF8x4LhkQIi5RAlM8OPM2BCUeDBq4AWEdGiYdGScdGiYdGQAAAAAC//f/DgHFAssAKwA0AAA3EjQrASc3FjM3Bw4BBwMOASMiIyImNTcyNjcmJyYvATcWMzI3FwcOARUUGwEHBgcvATY3F+Z1Ji4CBjQxVQcWFwuBUVA+AQEIJAU6ZyI/RBctAgY8GSdPAgYiGVmFAVRUCRRJTQpbARgwBCEEASUEFx7+0LpuLwoHXVPGqy8BBCEBBwUfAQsPHP7rAkULQEwCE09eAgAAAAACABX/EwHYAuYAJwAvAAATNCMHNzY3FwYDNjMyFxYVFAYjIicUFxYXNxcHIyIGFTc+Ajc2NTcXFjI2NCYiB1UlGQRGTgYPCGIYYDYqkmckIwQPHSICCD86VgUgDwYBAwJEKntNTWJAAnI2BCUJFA0X/shGSjlTbJoEfBMkAwEDJgYBJwQSBxEbHL8eFVybajYAAAAAA//3/w4BxQKTACsAMwA7AAA3EjQrASc3FjM3Bw4BBwMOASMiIyImNTcyNjcmJyYvATcWMzI3FwcOARUUExIGIiY0NjIWDgEiJjQ2MhbmdSYuAgY0MVUHFhcLgVFQPgEBCCQFOmciP0QXLQIGPBknTwIGIhlZgx0oFh0oFqYdKBYdKBZbARgwBCEEASUEFx7+0LpuLwoHXVPGqy8BBCEBBwUfAQsPHP7rAfgdGiYdGScdGiYdGQAAAAP/7v/2Ak8DCgAlACsAMwAABSc3PgE0LwEmIg8BBhUUOwEXByYjBzc+ATcTNzMSFx4BHwEHJiIDMjcDIwMBFwcFJzcWMwFJAwQzJgkhGIA9JQk8OQIGSUJuCBwiEMM/CFRLDCgsAgdIZ4skOU8HXwEABgf+4gYKXzsKBycEECYcbQEIaBsMKQQrBwMvAyEpAf8R/snhJR4EBCkDAREFAQb+9QH5Ci8CCS0BAAADACn/9AHLAo0AJAAsADQAAAAmIgYPAS8BNjMyFhUUBhUUMzI3Fw4BByIvAQYjIiY1NDY/AgcGFBYzMj8BExcHBSc3FjMBHS5HPBAPBQx4K0FKEikbIQ4OMxZSBwROIDhIHRi9AosdJx4rMARQBgf+4gYKXzsBVjgZDQwDK0ZEPQ+3IC4ZEBgwCFEBTkY2HSwHNCx7CT4mMGYBuwovAgktAQAAAAP/7v/2Ak8DMgAlACsANwAABSc3PgE0LwEmIg8BBhUUOwEXByYjBzc+ATcTNzMSFx4BHwEHJiIDMjcDIwMSMjczFw4BIiYnNzMBSQMEMyYJIRiAPSUJPDkCBklCbggcIhDDPwhUSwwoLAIHSGeLJDlPB18qjBoIEAw8YDwMEAgKBycEECYcbQEIaBsMKQQrBwMvAyEpAf8R/snhJR4EBCkDAREFAQb+9QHvMgoqODgqCgAAAAMAKf/0AcsCqgAkACwAOAAAACYiBg8BLwE2MzIWFRQGFRQzMjcXDgEHIi8BBiMiJjU0Nj8CBwYUFjMyPwECMjczFw4BIiYnNzMBHS5HPBAPBQx4K0FKEikbIQ4OMxZSBwROIDhIHRi9AosdJx4rMASDjBoIEAw8YDwMEAgBVjgZDQwDK0ZEPQ+3IC4ZEBgwCFEBTkY2HSwHNCx7CT4mMGYBlkIKMEJCMAoAAAAC/+7/DwJPAokANQA7AAAEJjQ2NyIHJzc+ATQvASYiDwEGFRQ7ARcHJiMHNz4BNxM3MxIXHgEfAQcmJw4BFBYzMjcXBgcDMjcDIwMBuT0vL0NOAwQzJgkhGIA9JQk8OQIGSUJuCBwiEMM/CFRLDCgsAgciICohIBUmLA0xM90kOU8HX/EyTEQvCgcnBBAmHG0BCGgbDCkEKwcDLwMhKQH/Ef7J4SUeBAQpAgEsNzUeFxMuEQICBQEG/vUAAAIAKf8PAdkB0AAuADYAAAEHFDMyNxcOARQWMzI3FwYHIiY0NyYvAQYjIiY1NDY/AjQmIgYPAS8BNjMyFxYHBhQWMzI/AQFqEikbIRBPOSAVJiwNMTMzPFU7BQROIDhIHRi9Ai5HPBAPBQx4K0wkG9gdJx4rMAQBT+YuGRNTUTUeFxMuETNdWAlFAU5GNh0sBzQsMjgZDQwDK0YsIdoLPCYwZgAAAgAo//QCQQNJABsAIwAAJQYgJhA2MzIfAQYPATY1NCMiBhQWMzI2PwEGBwMHBgcvATcXAiBW/wCixpdKZAQTBjADk2V3fWhEUxMwFAcfBGVpCAbHCRwopwEmyBgGS1wEGxZdjfugTVEEW0gC7goiKAUYbQYAAAAAAgAk//QBgwLLABoAIwAAFyImNDYzMh8BBg8BNTQmIyIGFBYzMj8BHwEGEwcGBy8BNjcX9V9yhWI2PwMSAyktJT1CST8vMhAGC1hPAVRUCRRJTQoMeNGTEwc8TgMfJS1Xp2UZCAIfQwKsC0BMAhNPXgIAAAACACj/9AJBA20AGwAoAAAlBiAmEDYzMh8BBg8BNjU0IyIGFBYzMjY/AQYHASc2NzMWFw8BJicGBwIgVv8AosaXSmQEEwYwA5Nld31oRFMTMBQH/qwOMVkOSUEOCRZkTiwcKKcBJsgYBktcBBsWXY37oE1RBFtIApkWM2ZVRBYBE046JwACACT/9AGbAr4AGgAnAAAXIiY0NjMyHwEGDwE1NCYjIgYUFjMyPwEfAQYDJzY3MxYXDwEmJwYH9V9yhWI2PwMSAyktJT1CST8vMhAGC1ifDjFZDklBDgkWZE4sDHjRkxMHPE4DHyUtV6dlGQgCH0MCGxYzZlVEFgETTjsmAAAAAAIAKP/0AkEDPQAbACMAACUGICYQNjMyHwEGDwE2NTQjIgYUFjMyNj8BBgcCBiImNDYyFgIgVv8AosaXSmQEEwYwA5Nld31oRFMTMBQHiSIwGiIwGhwopwEmyBgGS1wEGxZdjfugTVEEW0gCzSMeLSMeAAAAAgAk//QBgwLIABoAIgAAFyImNDYzMh8BBg8BNTQmIyIGFBYzMj8BHwEGEgYiJjQ2Mhb1X3KFYjY/AxIDKS0lPUJJPy8yEAYLWAQiMBoiMBoMeNGTEwc8TgMfJS1Xp2UZCAIfQwKJIx4tIx4AAgAo//QCQQNGABsAJwAAJQYgJhA2MzIfAQYPATY1NCMiBhQWMzI2PwEGBwMXByMmJz8BFhc2NwIgVv8AosaXSmQEEwYwA5Nld31oRFMTMBQHPA6KDklBDglDNzRGHCinASbIGAZLXAQbFl2N+6BNUQRbSAMgFm8+MRYBJxoYKQACACT/9AGNAsYAGgAnAAAXIiY0NjMyHwEGDwE1NCYjIgYUFjMyPwEfAQYDPwEWFzY3HwEGByMm9V9yhWI2PwMSAyktJT1CST8vMhAGC1jJEAg8RFMtCBA0XQ5MDHjRkxMHPE4DHyUtV6dlGQgCH0MCuhcBNDE+JwEXNWtZAAAAAAMAOv/0ApcDRgAWACIALgAABSYjIgc3PgE1EzQmIwcnNxYzNzIWEAYDIgYHAhQWMzI2ECY3FwcjJic/ARYXNjcBPV0kPEYGLiABDxYiAgdDJpiSt8jGFQ4BDzJMbHyfMQ6KDklBDglDNzRGDAwMLgkjKgGkIBYCBCwDBKb+5s0CXAkN/n9tJZUBBo71Fm8+MRYBJxoYKQAAAwAk//QCQwLmAAkAKAAyAAABNjU0JzcXBg8BASImNDYzMhc1NCMHNzY3FwYCFRQzMjcXDgEHIi8BBhMmIgYUFjMyNjcB/AEHRgcOFRn+3lZrkmcgJSUZBEZOBgsRKRshDg40FU4LB2hoJX9NTDgVNyEB3SEaRFsOCG5mDv4cdcqaBKY2BCUJFA0R/nzbLhkQGDIGRwNHAYgXW5toGhsAAAIACf/0Ap4CgQAcAC0AAAUmIyIHNz4BPQEjJzczNzQmIwcnNxYzNzIWFRQGJzI2ECYjIgYPATMXByMHFBYBRF0lO0YGNBqFBweFAQ8WIgIHQyaYkLnIe2x8n5QVDgEJqgUGqgUzDAwMLgopSJMHIMUgFgIELAMEqIOVzTOVAQaOCQ3jByCtNyUAAAAAAgAk//QCGQLmACgAMgAAFyImNDYzMhc1Byc3FzU0Iwc3NjcXBgc3Fw8BBhUUMzI3Fw4BByIvAQYTJiIGFBYzMjY35VZrkmcgJXIJB3QlGQRGTgYKBk8NBFsJKRshDg40FU4LB2hoJX9NTDgVNyEJdcqaBEwBCScBLDYEJQkUDQ6EBA0lAdbZLhkQGDIGRwNHAYgXW5toGhsAAAAAAgA6//YCFAMKADAAOAAAExc3FwcmIgcGFBYyPgE/ARcGDwEmIyIHNz4BNRM0JiMHJzcWIDcXBg8BNjU0JiIGBzcXBwUnNxYz22d6BA5WWygEGYpGHwgsAxIJBdBAYkgGLSEBDxYiAgdPARBYAxEGMAIvmxQB4gYH/uIGCl87AWIBCwU7AweQWBMRLzoFBVNVBgcKLgYjKwGkIBYCBCwDDAZKXAQdDjEWCxzmCi8CCS0BAAAAAwAk//QBlgKNAAgAHQAlAAABNCYiBgc3PgEHFRQWMzI3HwEOASMiJjQ2MzIVDwEDFwcFJzcWMwFBK1dDCbUPCtJRQzVGBgsbYxtedIRZlQYNAgYH/uIGCl87AUsoKkA2CQIKOhBUZh8CHRUvesqYkTEMAYsKLwIJLQEAAAIAOv/2AhQDWQAwADwAABMXNxcHJiIHBhQWMj4BPwEXBg8BJiMiBzc+ATUTNCYjByc3FiA3FwYPATY1NCYiBgc2MjczFw4BIiYnNzPbZ3oEDlZbKAQZikYfCCwDEgkF0EBiSAYtIQEPFiICB08BEFgDEQYwAi+bFAEdjhkIEAw8YDwMEAgBYgELBTsDB5BYExEvOgUFU1UGBwouBiMrAaQgFgIELAMMBkpcBB0OMRYLHPNCCjBCQjAKAAAAAwAk//QBlgKqAAgAHQApAAABNCYiBgc3PgEHFRQWMzI3HwEOASMiJjQ2MzIVDwEDFjI3MxcOASImJzcBQStXQwm1DwrSUUM1RgYLG2MbXnSEWZUGDeMZjRoIEAw8YDwMEAFLKCpANgkCCjoQVGYfAh0VL3rKmJExDAGoQkIKMEJCMAoAAgA6//YCFAM9ADAAOAAAExc3FwcmIgcGFBYyPgE/ARcGDwEmIyIHNz4BNRM0JiMHJzcWIDcXBg8BNjU0JiIGBzYGIiY0NjIW22d6BA5WWygEGYpGHwgsAxIJBdBAYkgGLSEBDxYiAgdPARBYAxEGMAIvmxQBiSIwGiIwGgFiAQsFOwMHkFgTES86BQVTVQYHCi4GIysBpCAWAgQsAwwGSlwEHQ4xFgscziMeLSMeAAADACT/9AGWAsgACAAdACUAAAE0JiIGBzc+AQcVFBYzMjcfAQ4BIyImNDYzMhUPAQIGIiY0NjIWAUErV0MJtQ8K0lFDNUYGCxtjG150hFmVBg1bIjAaIjAaAUsoKkA2CQIKOhBUZh8CHRUvesqYkTEMAXsjHi0jHgABADr/DwIUAokAQQAAExc3FwcmIgcGFBYyPgE/ARcGDwEmJw4BFBYzMjcXBgciJjQ2NyYjIgc3PgE1EzQmIwcnNxYgNxcGDwE2NTQmIgYH22d6BA5WWygEGYpGHwgsAxIJBRQeJx8gFiUsDTEzMj0tLYg2V0gGLSEBDxYiAgdPARBYAxEGMAIvmxQBAWIBCwU7AweQWBMRLzoFBVNVBgEBKjU0HhcTLhEyS0MtBAouBiMrAaQgFgIELAMMBkpcBB0OMRYLHAAAAAIAJP8PAZ8B0AAiACsAAAQmNDY3BiMiJjQ2MzIVDwEhFRQWMzI3HwEOARQWMzI3FwYHEzQmIgYHNz4BAQk9MC8hFF50hFmVBg3+7FFDNUYGC1IyIBUmLA0xMwYrV0MJtQ8K8TJMRS4MesqYkTEMEFRmHwIdUkE9HhcTLhECPCgqQDYJAgoAAAACADr/9gIUA0YAMAA8AAATFzcXByYiBwYUFjI+AT8BFwYPASYjIgc3PgE1EzQmIwcnNxYgNxcGDwE2NTQmIgYHExcHIyYnPwEWFzY322d6BA5WWygEGYpGHwgsAxIJBdBAYkgGLSEBDxYiAgdPARBYAxEGMAIvmxQB1g6KDklBDglDNzRGAWIBCwU7AweQWBMRLzoFBVNVBgcKLgYjKwGkIBYCBCwDDAZKXAQdDjEWCxwBIRZvPjEWAScaGCkAAAADACT/9AGWAsYACAAdACoAAAE0JiIGBzc+AQcVFBYzMjcfAQ4BIyImNDYzMhUPAQE/ARYXNjcfAQYHIyYBQStXQwm1DwrSUUM1RgYLG2MbXnSEWZUGDf7YEAg8RFMtCBA0XQ5MAUsoKkA2CQIKOhBUZh8CHRUvesqYkTEMAawXATQxPicBFzVrWQAAAAIAKP/0AlADbQAqADcAAAAGFBcHDgEjIiYQNjMyHwEGDwE2NTQmIyIGEBYzMjY3NTQmKwEnNxYzNxcBJzY3MxYXDwEmJwYHAj4NBwYrgziGnsKdSngEFAYvA0dQcn99ZyREIRUiRQIJRDtWBP6JDjFZDklBDgkWZE4sAQ5BhB4JEhynASvDGAZLXAQbGy4qif8AnxMTeiIUBDIEBRYBoRYzZlVEFgETTjonAAAEADT/DgHnAr4ALAA0AD8ATAAANyInBhUUFx4BFRQGIyImNTY/ATUuATU2NzUmNTQ2MzIWMzY3FwcGDwEWFRQGJhYyNjQmIgYSFjI2NTQmJw4BFQMnNjczFhcPASYnBgfkGCIqeHRhmV9HUB8zES8+HDhKcEoUQgwuXAMLLCoEKHOuP2I1QGE1AzpuWUx3GCYBDjFZDklBDgkWZE4sgggXFS0EBjE0RW9GPyojDQYGOCQcJAQnXkdrCwYYBDgGAwUtOEtnc0c6bUg8/gosPCcdHRARNhQCfhYzZlVEFgETTjsmAAACACj/9AJQAzIAKgA2AAAABhQXBw4BIyImEDYzMh8BBg8BNjU0JiMiBhAWMzI2NzU0JisBJzcWMzcXADI3MxcOASImJzczAj4NBwYrgziGnsKdSngEFAYvA0dQcn99ZyREIRUiRQIJRDtWBP7XjBoIEAw8YDwMEAgBDkGEHgkSHKcBK8MYBktcBBsbLiqJ/wCfExN6IhQEMgQFFgHjMgoqODgqCgAAAAAEADT/DgHnAqoALAA0AD8ASwAANyInBhUUFx4BFRQGIyImNTY/ATUuATU2NzUmNTQ2MzIWMzY3FwcGDwEWFRQGJhYyNjQmIgYSFjI2NTQmJw4BFRIyNzMXDgEiJic3M+QYIip4dGGZX0dQHzMRLz4cOEpwShRCDC5cAwssKgQoc64/YjVAYTUDOm5ZTHcYJiaMGggQDDxgPAwQCIIIFxUtBAYxNEVvRj8qIw0GBjgkHCQEJ15HawsGGAQ4BgMFLThLZ3NHOm1IPP4KLDwnHR0QETYUAtdCCjBCQjAKAAAAAAIAKP/0AlADPQAqADIAAAAGFBcHDgEjIiYQNjMyHwEGDwE2NTQmIyIGEBYzMjY3NTQmKwEnNxYzNxcCBiImNDYyFgI+DQcGK4M4hp7CnUp4BBQGLwNHUHJ/fWckRCEVIkUCCUQ7VgSsIjAaIjAaAQ5BhB4JEhynASvDGAZLXAQbGy4qif8AnxMTeiIUBDIEBRYB1SMeLSMeAAAAAAQANP8OAecCyAAsADQAPwBHAAA3IicGFRQXHgEVFAYjIiY1Nj8BNS4BNTY3NSY1NDYzMhYzNjcXBwYPARYVFAYmFjI2NCYiBhIWMjY1NCYnDgEVEgYiJjQ2MhbkGCIqeHRhmV9HUB8zES8+HDhKcEoUQgwuXAMLLCoEKHOuP2I1QGE1AzpuWUx3GCagIjAaIjAagggXFS0EBjE0RW9GPyojDQYGOCQcJAQnXkdrCwYYBDgGAwUtOEtnc0c6bUg8/gosPCcdHRARNhQC7CMeLSMeAAAAAgAo/tsCUAKJACoAOQAAAAYUFwcOASMiJhA2MzIfAQYPATY1NCYjIgYQFjMyNjc1NCYrASc3FjM3FwE2MhYVFAYHJzU+ATU0JwI+DQcGK4M4hp7CnUp4BBQGLwNHUHJ/fWckRCEVIkUCCUQ7VgT+0CIvH0w0Eh8pKAEOQYQeCRIcpwErwxgGS1wEGxsuKon/AJ8TE3oiFAQyBAUW/oYaJyAxTxsPChM3GSYYAAQANP8OAecC4AAsADQAPwBOAAA3IicGFRQXHgEVFAYjIiY1Nj8BNS4BNTY3NSY1NDYzMhYzNjcXBwYPARYVFAYmFjI2NCYiBhIWMjY1NCYnDgEVEwYiJjU0NjcXFQ4BFRQX5BgiKnh0YZlfR1AfMxEvPhw4SnBKFEIMLlwDCywqBChzrj9iNUBhNQM6bllMdxgmpCIvH0w0Eh8pKIIIFxUtBAYxNEVvRj8qIw0GBjgkHCQEJ15HawsGGAQ4BgMFLThLZ3NHOm1IPP4KLDwnHR0QETYUAocaJyAxTxsPChM3GSYYAAIAOv/0ArkDhwBDAFAAACUUFjM3FwcmIwc3PgE9ASYjDwEUFjM3Fwc0IgYHNz4BNRM0JiMHJzcWMzI3Bw4BDwEXMj8BNCYjByc3FDMyNwcOAQcCASc2NzMWFw8BJicGBwJeEhotAglPLHMJLx1qLqYEEhotAgmBawEGLiABDxYiAgdJHClMBCsVAgaoQFQBDxYiAgc8RlgEJRkCDv6YDjFZDklBDgkWZE4scCkbAwQuAwItAShClwELsykbAwQuAwgELgkjKgGkIBYCBCwDCS0HHTaiAQq2IBYCBCwDCS0FFx3+3AHcFjNmVUQWARNOOyYAAAAC//X/9AH2A6wAMwBAAAA3ETQrASc3NjcXBgM2MzIWFRQGFRQzNxcHJiMiBzc2NTc0JiMiBwYVFBYzNxcHJiMHNz4BAyc2NzMWFw8BJicGB1clFQQERk4GDwlyJEFIECMjAgg0HC5CBDgGKyg6RQMQFCMCCTYlYwYdF1QOMVkOSUEOCRZkTixeAhQ0AyAJFA0X/sBORD0PviA4AgQrAwwpDzLGMjY3c4AfGQIEKwMCKQMYArsWM2ZVRBYBE046JwACACr/9ALDAoYATgBUAAAlFBYzNxcHJiMHNz4BPQEmIw8BFBYzNxcHNCIGBzc+ATUTIyc3FjM1NCYjByc3FjMyNwcOAQ8BMzI3NTQmIwcnNxQzMjcHBgcGFTcXDwEGJyEHFzI3AlwSGi0CCU8scwkvHWoupgQSGi0CCYFrAQYuIAFaCQcoNA8WIgIHSRwpTAQrFQIBrlsvDxYiAgc8RlgEJQ0QTg0EWQpH/scDqEBUcCkbAwQuAwItAShClwELsykbAwQuAwgELgkjKgFICScBLSAWAgQsAwktBx02EAEsIBYCBCwDCS0FDA9HAg0lAdfXZAEKAAAAAAEACP/0AfgC5gA/AAA3EQcnNxYzNTQrASc3NjcXBgc3Fw8BBgc2MzIWFRQGFRQzNxcHJiMiBzc2NTc0JiMiBwYVFBYzNxcHJiMHNz4BWUgJByMnJRUEBEZOBgkIXA0EZwQBciRBSBAjIwIINBwuQgQ4BisoOkUDEBQjAgk2JWMGHRdeAawBCScBOjQDIAkUDQ2UBQ0lAU46TkQ9D74gOAIEKwMMKQ8yxjI2N3OAHxkCBCsDAikDGAACABb/9AFfA2MAHgAyAAA3FBYzNxcHJiMiBzc+ATUTNCYjByc3FjMyNwcOAQcKARYyNjczFxUPASImIgYHIyc1PwHVEho1AglUIzpGBi8hAQ8WKgIHTh8qUwQqHAIOUnQXIBUGFkwQEXQYHxUGFkwQcCkbAwQuAwwuCSMqAaQgFgIELAMJLQUXHf7eAk8hHBsVBVkEIRscFQVZBAAC/+T/9AEtArQAFgArAAA3NTQjBzc2NxcOARUUMzcXByYjIgc3NgIWMjY3MxcVDwEiJiMiDwEjJzU/AWglGQQyXgUJDiMjAgg0HC5CBDgXdBcgFQYWTBARdAwVIQoGFkwQXv42BCUHFgwV13Y4AgQrAwwpDwJyIRscFQVZBCEqDRUFWQQAAAAAAgAi//QBTQMKAB4AJgAANxQWMzcXByYjIgc3PgE1EzQmIwcnNxYzMjcHDgEHAhMXBwUnNxYz1RIaNQIJVCM6RgYvIQEPFioCB04fKlMEKhwCDnIGB/7iBgpfO3ApGwMELgMMLgkjKgGkIBYCBCwDCS0FFx3+3gIMCi8CCS0BAAACAAf/9AEUAo0AFgAeAAA3NTQjBzc2NxcOARUUMzcXByYjIgc3NhMXBwUnNxYzaCUZBDJeBQkOIyMCCDQcLkIEOKcFBv7+BQlVNl7+NgQlBxYMFdd2OAIEKwMMKQ8CYQovAgktAQAAAAIAOP/0ATgDWQAeACoAADcUFjM3FwcmIyIHNz4BNRM0JiMHJzcWMzI3Bw4BBwIDFjI3MxcOASImJzfVEho1AglUIzpGBi8hAQ8WKgIHTh8qUwQqHAIOeRmNGggQDDxgPAwQcCkbAwQuAwwuCSMqAaQgFgIELAMJLQUXHf7eAltCQgowQkIwCgACABL/9AECAqoAFgAiAAA3NTQjBzc2NxcOARUUMzcXByYjIgc3NgIyNzMXDgEiJic3M2glGQQyXgUJDiMjAgg0HC5CBDgkjBoIEAw8YDwMEAhe/jYEJQcWDBXXdjgCBCsDDCkPAjxCCjBCQjAKAAAAAQA4/w8BSQKGAC4AABYmNDY3IyIHNz4BNRM0JiMHJzcWMzI3Bw4BBwIVFBYzNxcHJicOARQWMzI3FwYHsz0vLyguRgYvIQEPFioCB04fKlMEKhwCDhIaNQIJFhopISAVJiwNMTPxMkxELwwuCSMqAaQgFgIELAMJLQUXHf7ejikbAwQuAQErNzUeFxMuEQAAAgAq/w8A/QLIACYALgAANzU0Iwc3NjcXDgEVFBczNxcHJicOARQWMzI3FwYHIiY0NjciBzc2EgYiJjQ2MhZoJRkEMl4FCQ4fBCMCCBwcKiEgFSYsDTEzMj0vLyQ4BDhYIi8bIi4cXv42BCUHFgwV13Y3AQIEKwIBLDc1HhcTLhEyTEQvDCkPAlAiHDAiHQAAAgA4//QBOAM9AB4AJgAANxQWMzcXByYjIgc3PgE1EzQmIwcnNxYzMjcHDgEHAhIGIiY0NjIW1RIaNQIJVCM6RgYvIQEPFioCB04fKlMEKhwCDhkiMBoiMBpwKRsDBC4DDC4JIyoBpCAWAgQsAwktBRcd/t4B9CMeLSMeAAEAKv/0APQB0AAWAAA3NTQjBzc2NxcOARUUMzcXByYjIgc3NmglGQQyXgUJDiMjAgg0HC5CBDhe/jYEJQcWDBXXdjgCBCsDDCkPAAACADj/cAJ+AoYAHgA1AAA3FBYzNxcHJiMiBzc+ATUTNCYjByc3FjMyNwcOAQcCBRM0JiMHJzczNwcOAQcGBw4BByc3PgHVEho1AglUIzpGBi8hAQ8WKgIHTh8qUwQqHAIOARcBDhcvAgdsdAQjFQELAgFNVREDPSxwKRsDBC4DDC4JIyoBpCAWAgQsAwktBRcd/t6LAakgFQQELAktBRQg7r5meyMhCCVbAAAABAAq/w8BzgLIAAcAHgAxADkAABIGIiY0NjIWAzU0Iwc3NjcXDgEVFDM3FwcmIyIHNzYFETQmIwc3NjcXBhEUBgcnNz4BEgYiJjQ2MhbAIi8bIi4cWCUZBDJeBQkOIyMCCDQcLkIEOAENERcbBDZaBRFCPRICKx9ZIi8bIi4cAnwiHDAiHf2z/jYEJQcWDBXXdjgCBCsDDCkPBgE2HxcDJQgUDB3+S0h2JRMIK2oCvSIcMCIdAAAAAAIAF/9wAT8DbQAWACMAADcTNCYjByc3MzcHDgEHBgcOAQcnNz4BAyc2NzMWFw8BJicGB4MBDhcvAgdsdAQjFAILAgFNVREDPSxYDjFZDklBDgkWZE4scwGpIBUEBCwJLQUUIO6+ZnsjIQglWwKlFjNmVUQWARNOOicAAAAC/+z/DwEOAr8AEgAfAAA3ETQmIwc3NjcXBhEUBgcnNz4BAyc2NzMWFw8BJicGB1sRFxsENloFEUI9EgIrH2EOMVkOSUEOCRZkTiwmATYfFwMlCBQMHf5LSHYlEwgragJRFjNmVUQWARNOOicAAAAAAwA5/tsCagKGABwAOABHAAATFjMyNwcOAQcCFBYzNxcHJiMHNz4BNRM0JiMHJwU0LwE3FjM3FwcOAQ8BFx4BMxcHBiMiLwE/ATYDNjIWFRQGByc1PgE1NCdNSRwpTAQlHAEMERstAglPLHMKLxwBDxYiAgF/PwIHSSVcBAcaLC2hqCQ5IwQGSAsyPq8Bsx+wIi8fTDQSHykoAoADCS0GGR3+TyUbAwQuAwEtBRwrAaQgFgIEHRoEBCsHBAcpBSAvqdsvJgQiDFbzDrof/YEaJyAxTxsPChM3GSYYAAMAGf7bAeMC5gAZADUARAAANxE0Iwc3NjcXBgIVFBYzNxcHJiMHNzY3PgETNCMnNxYzNxcHDgIHFx4BMxcHBiImLwE/ATYDNjIWFRQGByc1PgE1NCdXJRkERk4GCxEQFCMCCTYlYwUZEQkC8TcDCT4kXwMIKUkdRmkiOB8DBjseMCp2AnoYdyIvH0w0Eh8pKIcB6zYEJQkUDRH+euAfGQIEKwMGKQMQBzABIhUFHQIGBR8MPRpGhywmBR0QGTynDnAX/iAaJyAxTxsPChM3GSYYAAAAAgAn//IB8gHQABgANAAANzU0JiMnPwEXBhEUFjM3FwcmIwc3Njc+ARM0Iyc3FjM3FwcOAgcXHgEzFwcGIiYvAT8BNmYXIgYEhQYMEBQjAgk2JWMFGREJAvE3Awk+JF8DCClJHUZpIjgfAwY7HjAqdgJ6GIffGxYFIxENQv7hHxkCBCsDBikDEAcwASIVBR0CBgUfDD0aRocsJgUdEBk8pw5wFwACAET/9gH5A0kAKQAxAAAFJiMiBzc+ATUTNCYjByc3FjMyNwcOBgcGFQYVFBYyNj8BFwYHAwcGBy8BNxcB165AYUQGJx0BDxYiAgdKHShMBAsRDQkHAwMBAgwdjzcRLAMSC34EZWkIBscJCQkKLgYjKwGkIBYCBCwDCS0CAwYDDQUTBBQSp9szGjJcBQVbYwMWCiIoBRhtBgAAAAACABn/9AD9A7EAGgAjAAA3ETQjBzc2NxcGAhUUFjM3FwcmIyIHNzY3PgETBwYHLwE2NxdXJRkERk4GCxEQEyMCCDQcLkIEHBEIA6YBVFQJFElNCocB6zYEJQkUDRH+eN4eGgIEKwMMKQgRCC8DGQtATAITT14CAAACAET+2wH5AoYAKQA4AAAFJiMiBzc+ATUTNCYjByc3FjMyNwcOBgcGFQYVFBYyNj8BFwYPATYyFhUUBgcnNT4BNTQnAdeuQGFEBicdAQ8WIgIHSh0oTAQLEQ0JBwMDAQIMHY83ESwDEgvlIi8fTDQSHykoCQkKLgYjKwGkIBYCBCwDCS0CAwYDDQUTBBQSp9szGjJcBQVbY1oaJyAxTxsPChM3GSYYAAACABn+2wDjAuYAGgApAAA3ETQjBzc2NxcGAhUUFjM3FwcmIyIHNzY3PgEHNjIWFRQGByc1PgE1NCdXJRkERk4GCxEQEyMCCDQcLkIEHBEIAw8iLx9MNBIfKSiHAes2BCUJFA0R/njeHhoCBCsDDCkIEQgvyhonIDFPGw8KEzcZJhgAAAACAET/9gH5AoYACQAzAAABNjU0JzcXBg8BEyYjIgc3PgE1EzQmIwcnNxYzMjcHDgYHBhUGFRQWMjY/ARcGBwGgAQdGBw4VGSyuQGFEBicdAQ8WIgIHSh0oTAQLEQ0JBwMDAQIMHY83ESwDEgsBkSEaRFsOCG5mDv5oCQouBiMrAaQgFgIELAMJLQIDBgMNBRMEFBKn2zMaMlwFBVtjAAAAAgAZ//QBMALmAAkAJAAAEzY1NCc3FwYPAQMRNCMHNzY3FwYCFRQWMzcXByYjIgc3Njc+AekBB0YHDhUZnSUZBEZOBgsREBMjAgg0HC5CBBwRCAMB0yEaRFsOCG5mDv62Aes2BCUJFA0R/njeHhoCBCsDDCkIEQgvAAAAAAIARP/2AfkChgApADEAAAUmIyIHNz4BNRM0JiMHJzcWMzI3Bw4GBwYVBhUUFjI2PwEXBgcSBiImNDYyFgHXrkBhRAYnHQEPFiICB0odKEwECxENCQcDAwECDB2PNxEsAxILFyM3HSI3HgkJCi4GIysBpCAWAgQsAwktAgMGAw0FEwQUEqfbMxoyXAUFW2MBpiQhMiQhAAAAAgAZ//QBRwLmABoAIgAANxE0Iwc3NjcXBgIVFBYzNxcHJiMiBzc2Nz4CBiImNDYyFlclGQRGTgYLERATIwIINBwuQgQcEQgD8CM3HSI3HocB6zYEJQkUDRH+eN4eGgIEKwMMKQgRCC+SJCEyJCEAAAEAPf/2AfkChgAyAAAFJiMiBzc+AT0BBy8BPwE0JiMHJzcWMzI3Bw4GBwYHNx8BBwYVFBYyNj8BFwYHAdeuQGFEBicdQwkFUQEPFiICB0odKEwECxENCQcDAwEDB7QIBcIDHY83ESwDEgsJCQouBiMrqyEDICjPIBYCBCwDCS0CAwYDDQUTBBqbWQUfYE17MxoyXAUFW2MAAQAD//QA8gLmACQAADc1By8BNzU0Iwc3NjcXBgM3HwEHBhUUFjM3FwcmIyIHNzY3PgFXRQkGVCUZBEZOBg4JRAgGUwQQEyMCCDQcLkIEHBEIA4fTJgIgL+02BCUJFA0X/ucmBB8ud6UeGgIEKwMMKQgRCC8AAAAAAgA2/9gCrgNJACwANAAAJRE0IwcnNxYzMjcHDgEHAwcCAyMDFBYzNxcHJiMiBzc2NxM0Ji8BNxYzNxYTAwcGBy8BNxcCLCEmAgk9Gyw+BSMgAQ4dtb8FBQ4RMwIJPx4wOgU9AQ0lMgMIOhxDlLwUBGVpCAbHCZEBlSsBBC0ECC4FHR39zg4BGQEO/lUWEgEELQQILgc4AbUfGgUFJQUE5v72AoIKIigFGG0GAAIAJ//0AgkCywAyADsAAAE0IyIHBhQWMzcXByYjBzc+AT0BNCYrASc/ARcGBxc2MzIWFRQGFRQzNxcHJiMiBzc2NRMHBgcvATY3FwGBWi9FCRAUIwIJNiVjBR0YFhsLAwOMBgkCAnIhP0oOIyMCCDQcLkIEOCQBVFQJFElNCgEkaDTPRhkCBCsDBikFGhz0IhsEIR0IICIDTEY7D74gOAIEKwMMKQ8yAkILQEwCE09eAgAAAAIANv7bAq4ChQAsADsAACURNCMHJzcWMzI3Bw4BBwMHAgMjAxQWMzcXByYjIgc3NjcTNCYvATcWMzcWEwc2MhYVFAYHJzU+ATU0JwIsISYCCT0bLD4FIyABDh21vwUFDhEzAgk/HjA6BT0BDSUyAwg6HEOUvO4iLx9MNBIfKSiRAZUrAQQtBAguBR0d/c4OARkBDv5VFhIBBC0ECC4HOAG1HxoFBSUFBOb+9u4aJyAxTxsPChM3GSYYAAAAAgAn/tsCCQHRADIAQQAAATQjIgcGFBYzNxcHJiMHNz4BPQE0JisBJz8BFwYHFzYzMhYVFAYVFDM3FwcmIyIHNzY1BzYyFhUUBgcnNT4BNTQnAYFaL0UJEBQjAgk2JWMFHRgWGwsDA4wGCQICciE/Sg4jIwIINBwuQgQ4myIvH0w0Eh8pKAEkaDTPRhkCBCsDBikFGhz0IhsEIR0IICIDTEY7D74gOAIEKwMMKQ8yuxonIDFPGw8KEzcZJhgAAAAAAgA2/9gCrgNGACwAOAAAJRE0IwcnNxYzMjcHDgEHAwcCAyMDFBYzNxcHJiMiBzc2NxM0Ji8BNxYzNxYTAxcHIyYnPwEWFzY3AiwhJgIJPRssPgUjIAEOHbW/BQUOETMCCT8eMDoFPQENJTIDCDocQ5S8MQ6KDklBDglDNzRGkQGVKwEELQQILgUdHf3ODgEZAQ7+VRYSAQQtBAguBzgBtR8aBQUlBQTm/vYCtBZvPjEWAScaGCkAAAIAJ//0AgkCxgAyAD8AAAE0IyIHBhQWMzcXByYjBzc+AT0BNCYrASc/ARcGBxc2MzIWFRQGFRQzNxcHJiMiBzc2NQM/ARYXNjcfAQYHIyYBgVovRQkQFCMCCTYlYwUdGBYbCwMDjAYJAgJyIT9KDiMjAgg0HC5CBDj0EAg8RFMtCBA0XQ5MASRoNM9GGQIEKwMGKQUaHPQiGwQhHQggIgNMRjsPviA4AgQrAwwpDzICUBcBNDE+JwEXNWtZAAAAAAEANv9mAq4ChQAzAAAlETQjByc3FjMyNwcOAQcDDgEHJzc2NyYDIwMUFjM3FwcmIyIHNz4BNxM0Ji8BNxYzNxYTAiwhJgIJPhosPgUkHwEJA0tVEQNcFI3IBQUOETIDCUEgMjQFIxoCDCM0Awg8FUh+0pEBlSsBBC0ECC4EHh3+PmFwHyEIKVDaAR3+VRYSAgQuBAguAyMwAZ4dGgcFJQUExv7WAAAAAAEAJ/9wAc8B0QAsAAABMhYVBw4BByc3PgE/ATQmIgcGFBYzNxcHJiMHNz4BPQE0JisBJz8BFwYHFzYBRj9KCwZGVBEDPioCASteRQkQFCMCCTYlYwUdGBYbCwMDjAYJAgJyAdBGO+9max8hCCFRU8YyNjTPRhkCBCsDBikFGhz0IhsEIR0IICIDTAAAAwAo//QCjAMKAAcAEAAYAAA2FjI2NCYiBhMiJhA2IBYQBhMXBwUnNxYzfnzBeH/CdL97mr4BCJ7BGgYH/uIGCl87yaKR86KQ/jesAR3MrP7jzAMWCi8CCS0BAAADACT/9AHOAo0ABwAPABcAACQGIiY0NjIWBBYyNjQmIgYBFwcFJzcWMwHOhrhshrhs/qZPd0JPd0IBFgYH/uIGCl87h5N8zZN8v3BbqHJcAU8KLwIJLQEAAwAo//QCjANZAAcAEAAcAAA2FjI2NCYiBhMiJhA2IBYQBgIyNzMXDgEiJic3M358wXh/wnS/e5q+AQiewc2OGQgQDDxgPAwQCMmikfOikP43rAEdzKz+48wDI0IKMEJCMAoAAAMAJP/0Ac4CqgAHAA8AGwAAJAYiJjQ2MhYEFjI2NCYiBhIyNzMXDgEiJic3MwHOhrhshrhs/qZPd0JPd0JOjBoIEAw8YDwMEAiHk3zNk3y/cFuoclwBKkIKMEJCMAoAAAQAKP/0AowDRQAHABAAGAAgAAA2FjI2NCYiBhMiJhA2IBYQBgMHBgcvATcfAQcGBy8BNxd+fMF4f8J0v3uavgEInsEdA1BUCAmZCaIDUFQHCpkJyaKR86KQ/jesAR3MrP7jzAMiCSgvBRV1BDQJKC8EFXYFAAAAAAQAJP/0Ac4CwQAHAA8AFwAfAAAkBiImNDYyFgQWMjY0JiIGEwcGBy8BNx8BBwYHLwE3FwHOhrhshrhs/qZPd0JPd0LJAkxPCRCMCaECTE8JEIwJh5N8zZN8v3BbqHJcAVoJN0ICEpcDJgk3QgISlwMAAAAAAgAp//QDhgKJACwANgAAJBYyPgE/ARcGDwEmIgYjIiYQNjMyFjMyNxcGDwE2NTQmIgYPARc3FwcmIw8BJBYyNjcTNCYiBgJHGYpGHwgsAxIJBdKWqB93l7qIIJAry2UDEQYwAjCbEwIIaHoEDlY2TgP+OHfBTwIBSsp2QBMRLzoFBVNVBggNrQEczA4OBkpcBB0OMRYLHMIBCwU7Awe/YKFMXAEDSjKSAAAAAAMAJP/0AtsB0AAdACUALgAAJR8BDgEjIicGIyImNDYyFz4BMzIWFRQPASEVFBYyJBYyNjQmIgYlNCMiBgc3PgECwgYLG2MbdzdCaVRpg8YzIlopR08LDf7wUXj9+ExzP0xzPwIRVytDCbUPClcCHRUvVlZ8zZNXLCtGQCIaDBBUZl1wW6hyXA1SQDYJAQsAAAMAOf/wAlsDSQAnADQAPAAAABYVFAcXHgEzFw8BIiYvASMHFBYzFwc0Jwc3PgE1EzQmIwcnNxYzNxc0IyIGBwYHFzY3PgETBwYHLwE3FwGUbJNuHTcoBAZVGTkYa1MDGDACCWpzCS8dAQ8WIgIHSSZ7drcKBwEJAWclIg4XJARlaQgGxwkCgVRDg0OuMCUEIgszLMKVNhwEKgECAy0FHysBpCAWAgQsAwSvhAkOmV0KCSMPNwFiCiIoBRhtBgAAAAIALf/8AWgCywAmAC8AABMGFRc+ATMfAQYPATQmIgYHBhQWMzcXByYjBzc+AT0BNCYjByc/AgcGBy8BNjcXvgkEHlEeHwMOAicLJjIVCBQcLAEJPydpBR4UEhQVBQOHWQFUVAkUSU0KAcs2MQMvPAQEUj0DKRslH7Y4GAIELAIEKAMhL9whHAMHHx7PC0BMAhNPXgIAAAAAAwA5/tsCWwKBACcANABDAAAAFhUUBxceATMXDwEiJi8BIwcUFjMXBzQnBzc+ATUTNCYjByc3FjM3FzQjIgYHBgcXNjc+AQM2MhYVFAYHJzU+ATU0JwGUbJNuHTcoBAZVGTkYa1MDGDACCWpzCS8dAQ8WIgIHSSZ7drcKBwEJAWclIg4XoiIvH0w0Eh8pKAKBVEODQ64wJQQiCzMswpU2HAQqAQIDLQUfKwGkIBYCBCwDBK+ECQ6ZXQoJIw83/fIaJyAxTxsPChM3GSYYAAAAAAIALf7bAWgB0QAmADUAABMGFRc+ATMfAQYPATQmIgYHBhQWMzcXByYjBzc+AT0BNCYjByc/AQM2MhYVFAYHJzU+ATU0J74JBB5RHh8DDgInCyYyFQgUHCwBCT8naQUeFBIUFQUDh0oiLx9MNBIfKSgByzYxAy88BARSPQMpGyUftjgYAgQsAgQoAyEv3CEcAwcfHv3SGicgMU8bDwoTNxkmGAAAAwA5//ACWwNGACcANABAAAAAFhUUBxceATMXDwEiJi8BIwcUFjMXBzQnBzc+ATUTNCYjByc3FjM3FzQjIgYHBgcXNjc+ARMXByMmJz8BFhc2NwGUbJNuHTcoBAZVGTkYa1MDGDACCWpzCS8dAQ8WIgIHSSZ7drcKBwEJAWclIg4XBw6KDklBDglDNzRGAoFUQ4NDrjAlBCILMyzClTYcBCoBAgMtBR8rAaQgFgIELAMEr4QJDpldCgkjDzcBlBZvPjEWAScaGCkAAAAAAv/4//wBaALGACYAMwAAEwYVFz4BMx8BBg8BNCYiBgcGFBYzNxcHJiMHNz4BPQE0JiMHJz8BJz8BFhc2Nx8BBgcjJr4JBB5RHh8DDgInCyYyFQgUHCwBCT8naQUeFBIUFQUDh78QCDxEUy0IEDRdDkwByzYxAy88BARSPQMpGyUftjgYAgQsAgQoAyEv3CEcAwcfHt0XATQxPicBFzVrWQAAAAACADn/9AHSA0kALwA3AAAXIiYvATY1NxQWMjY1NCcuBScmNTQ2MzIfAQYPASc2NTQmIgYUHgEXFhUUBhMHBgcvATcX2ypOJQUMLTGQTC0hQgMDKC0bNYVhTE0DEAYnBgM0ekdFpiA2il4EZWkIBscJDBERCk1hBWxCOzMsIhkiAQIVGxcsPU9rGQZNXAQFFR81KDdRO1YcLjlWbQMfCiIoBRhtBgAAAAACADH/9AFiAssAJgAvAAA3LwE2PwEUFjI2NC4CNTQ2MzIfAQYPATY1NCYiBhUUFx4BFRQGIhMHBgcvATY3F0IOAwkDIyxbNC9+NGlPMDQCDgUlAidNL1dRO26M7AFUVAkUSU0KBAUHMlQFQjYiMilCOyQ9UhAFOEIDFAkkISAXLS0rOiY6VgKsC0BMAhNPXgIAAAAAAgA5//QB0gNtAAwAPAAAEyc2NzMWFw8BJicGBxMiJi8BNjU3FBYyNjU0Jy4FJyY1NDYzMh8BBg8BJzY1NCYiBhQeARcWFRQGog4xWQ5JQQ4JFmROLDAqTiUFDC0xkEwtIUIDAygtGzWFYUxNAxAGJwYDNHpHRaYgNooCvhYzZlVEFgETTjon/TcREQpNYQVsQjszLCIZIgECFRsXLD1PaxkGTVwEBRUfNSg3UTtWHC45Vm0AAgAx//QBYgK/ACYAMwAANy8BNj8BFBYyNjQuAjU0NjMyHwEGDwE2NTQmIgYVFBceARUUBiIDJzY3MxYXDwEmJwYHQg4DCQMjLFs0L340aU8wNAIOBSUCJ00vV1E7bowiDjFZDklBDgkWZE4sBAUHMlQFQjYiMilCOyQ9UhAFOEIDFAkkISAXLS0rOiY6VgIcFjNmVUQWARNOOicAAQA5/xcB0gKJAEcAABciJi8BNjU3FBYyNjU0Jy4FJyY1NDYzMh8BBg8BJzY1NCYiBhQeARcWFRQGDwEeAxcWFRQGIiY0NzMeATI2NTQnN9sqTiUFDC0xkEwtIUIDAygtGzWFYUxNAxAGJwYDNHpHRaYgNmxYDgQbDRUFD01EKxkJAR4sHFUWDBERCk1hBWxCOzMsIhkiAQIVGxcsPU9rGQZNXAQFFR81KDdRO1YcLjlLaAwqAxIJEgcSECY4FCAoGx4VERoxSQABADH/FwFiAdAAPAAANhYyNjQuAjU0NjMyHwEGDwE2NTQmIgYVFBceARQGDwEeAxcWFRQGIiY0NzMeATI2NTQnNyIvATY/AWAsWzQvfjRpTzA0Ag4FJQInTS9XUTtTPQ4EGw0VBQ9NRCsZCQEeLBxVFjw3AwkDI1k2IjIpQjskPVIQBThCAxQJJCEgFy0tKzpYTwsqAxIJEgcSECY4FCAoGx4VERoxSRUHMlQFAAAAAAIAOf/0AdIDRgAvADsAABciJi8BNjU3FBYyNjU0Jy4FJyY1NDYzMh8BBg8BJzY1NCYiBhQeARcWFRQGExcHIyYnPwEWFzY32ypOJQUMLTGQTC0hQgMDKC0bNYVhTE0DEAYnBgM0ekdFpiA2ikEOig5JQQ4JQzc0RgwREQpNYQVsQjszLCIZIgECFRsXLD1PaxkGTVwEBRUfNSg3UTtWHC45Vm0DURZvPjEWAScaGCkAAgAx//QBbALGACYAMwAANy8BNj8BFBYyNjQuAjU0NjMyHwEGDwE2NTQmIgYVFBceARUUBiIDPwEWFzY3HwEGByMmQg4DCQMjLFs0L340aU8wNAIOBSUCJ00vV1E7bowsEAg8RFMtCBA0XQ5MBAUHMlQFQjYiMilCOyQ9UhAFOEIDFAkkISAXLS0rOiY6VgK6FwE0MT4nARc1a1kAAQAJ/xcCFwKJAD8AADcRDgUPATY/ARchNxcWFwcuBScGERQWMzcXByYnBx4DFxYVFAYiJjQ3Mx4BMjY1NCc3Bzc+AekvKS8NEwUFLwwDCVMBNlUJAg0vBgYSDisoKhAaHzcDCUExEQQbDRUFD01EKxkJAR4sHFUagAhGHqIBtAICDAojHiMEWFUICwsIQWgEIyAkCg0CAqD+uiUfAwQuAgEyAxIJEgcSECY4FCAoGx4VERoxVQQrBiUAAAABABX/FwE4AhQANAAANzU0Ji8BNzY/ARcGBzcXBycGFRQWMzI3FwYrAQceAxcWFRQGIiY0NzMeATI2NTQnNy4BUhghBAU4NBAUBASTAwmRByMrHiYKTRgMDQQbDRUGDk1EKxkJAR0tHFUYJyFt9hsWAQYeGzAQCBoxAwM1A26MMyoSGjwmAxIJEgcSECY4FCAoGx4VERoxTgk3AAACAAn//AIXA0YAKAA0AAA3EQ4FDwE2PwEXITcXFhcHLgUnBhEUFjM3FwcmIwc3PgETFwcjJic/ARYXNjfpLykvDRMFBS8MAwlTATZVCQINLwYGEg4rKCoQGh83AwlkL4kIRh6uDooOSUEOCUM3NEaiAbQCAgwKIx4jBFhVCAsLCEFoBCMgJAoNAgKg/rolHwMELgMEKwYlAvMWbz4xFgEnGhgpAAIAFf/0AZACFAAJACYAAAE2NTQnNxcGDwEFNTQmLwE3Nj8BFwYHNxcHJwYVFBYzMjcXBiMiJgFJAQdGBw4VGf7+GCEEBTg0EBQEBH8DCX0HIyseJgpNGEQ4ARkhGkRbDghuZg6q9hsWAQYeGzAQCBoxAwM1A26MMyoSGjw3AAAAAQAJ//wCFwKJADMAADc1Byc3FjM1DgUPATY/ARchNxcWFwcuBScGBzcXDwEGFBYzNxcHJiMHNz4B6V0JBzAvLykvDRMFBS8MAwlTATZVCQINLwYGEg4rKCoIBU0NBFcCGh83AwlkL4kIRh6iiQEJJwH9AgIMCiMeIwRYVQgLCwhBaAQjICQKDQICSbQFDSUBgl4fAwQuAwQrBiUAAQAV//QBOAIUACcAADc1Byc3FjM1NCYvATc2PwEXBgc3FwcnBzM3Fw8BFRQWMzI3FwYjIiZSNAkHGR0YIQQFODQQFAQEkwMJkQYNbA0EgyMrHiYKTRhEOG2CAQknAUYbFgEGHhswEAgaMQMDNQNyBQ0lAVozKhIaPDcAAAIAI//0AogDYwApAD0AADYWMjY1Ay4BIwcnNxYzMjcHDgEVERQGIiY1ETQmIwcnNxYzMjcHDgEHAxIWMjY3MxcVDwEiJiIGByMnNT8BuFajVgYCDRYrAgdLHSlBBCwZgt9yDxYiAgdLHShKBCUZAghcdBcgFQYWTBARdBgfFQYWTBCXaldSAUYjEwIELAMJLQYUH/6waXNzagFLIBYCBCwDCS0FFx3+2gJTIRwbFQVZBCEbHBUFWQQAAAAAAgAc//QCGwK0ACoAPwAANxQzMj4BNzU0JiMHPwEXDgEVFDMyNxcOASMiLwEGIyImNTc0Iwc/ARcOARIWMjY3MxcVDwEiJiMiDwEjJzU/AZtQFTMWGxYcGASaBgkNKRshDhYyD1IHBWwfQEUEJRkEjwYKEDx0FyAVBhZMEBF0DBUhCgYWTBCbYhYPFOgeGAEkHQwXzHguGRAiLlECUzw48zYEJR4MGrgBrCEbHBUFWQQhKg0VBVkEAAIAI//0AogDCgApADEAADYWMjY1Ay4BIwcnNxYzMjcHDgEVERQGIiY1ETQmIwcnNxYzMjcHDgEHAwEXBwUnNxYzuFajVgYCDRYrAgdLHSlBBCwZgt9yDxYiAgdLHShKBCUZAggBMgYH/uIGCl87l2pXUgFGIxMCBCwDCS0GFB/+sGlzc2oBSyAWAgQsAwktBRcd/toCEAovAgktAQAAAAACABz/9AIbAo0AKgAyAAA3FDMyPgE3NTQmIwc/ARcOARUUMzI3Fw4BIyIvAQYjIiY1NzQjBz8BFw4BExcHBSc3FjObUBUzFhsWHBgEmgYJDSkbIQ4WMg9SBwVsH0BFBCUZBI8GChD0Bgf+4gYKXzubYhYPFOgeGAEkHQwXzHguGRAiLlECUzw48zYEJR4MGrgBmwovAgktAQAAAAACACP/9AKIA1kAKQA1AAA2FjI2NQMuASMHJzcWMzI3Bw4BFREUBiImNRE0JiMHJzcWMzI3Bw4BBwMSMjczFw4BIiYnNzO4VqNWBgINFisCB0sdKUEELBmC33IPFiICB0sdKEoEJRkCCE6OGQgQDDxgPAwQCJdqV1IBRiMTAgQsAwktBhQf/rBpc3NqAUsgFgIELAMJLQUXHf7aAh1CCjBCQjAKAAIAHP/0AhsCqgAqADYAADcUMzI+ATc1NCYjBz8BFw4BFRQzMjcXDgEjIi8BBiMiJjU3NCMHPwEXDgETFjI3MxcOASImJzebUBUzFhsWHBgEmgYJDSkbIQ4WMg9SBwVsH0BFBCUZBI8GChAVGY0aCBAMPGA8DBCbYhYPFOgeGAEkHQwXzHguGRAiLlECUzw48zYEJR4MGrgBuEJCCjBCQjAKAAAAAwAj//QCiANGACkAMwA7AAA2FjI2NQMuASMHJzcWMzI3Bw4BFREUBiImNRE0JiMHJzcWMzI3Bw4BBwMTMjU0JiMiFRQWNgYiJjQ2Mha4VqNWBgINFisCB0sdKUEELBmC33IPFiICB0sdKEoEJRkCCKUsGxgsIGEuSyguTCeXaldSAUYjEwIELAMJLQYUH/6waXNzagFLIBYCBCwDCS0FFx3+2gHOJxYaJxgYDjQsSS8sAAAAAwAc//QCGwLEACoANAA8AAA3FDMyPgE3NTQmIwc/ARcOARUUMzI3Fw4BIyIvAQYjIiY1NzQjBz8BFw4BEzI1NCYjIhUUFjYGIiY0NjIWm1AVMxYbFhwYBJoGCQ0pGyEOFjIPUgcFbB9ARQQlGQSPBgoQZywbGCwgYS5LKC5NJptiFg8U6B4YASQdDBfMeC4ZECIuUQJTPDjzNgQlHgwauAFUJxYaJxgYDjQsSS8sAAADACP/9AKIA0UAKQAxADkAADYWMjY1Ay4BIwcnNxYzMjcHDgEVERQGIiY1ETQmIwcnNxYzMjcHDgEHAxMHBgcvATcfAQcGBy8BNxe4VqNWBgINFisCB0sdKUEELBmC33IPFiICB0sdKEoEJRkCCPsDUFQICZkJogNQVAcKmQmXaldSAUYjEwIELAMJLQYUH/6waXNzagFLIBYCBCwDCS0FFx3+2gIcCSgvBRV1BDQJKC8EFXYFAAAAAwAc//QCGwLBACoAMgA6AAA3FDMyPgE3NTQmIwc/ARcOARUUMzI3Fw4BIyIvAQYjIiY1NzQjBz8BFw4BEwcGBy8BNx8BBwYHLwE3F5tQFTMWGxYcGASaBgkNKRshDhYyD1IHBWwfQEUEJRkEjwYKEKcCTE8JEIwJoQJMTwkQjAmbYhYPFOgeGAEkHQwXzHguGRAiLlECUzw48zYEJR4MGrgBpgk3QgISlwMmCTdCAhKXAwAAAQAj/w8CiAKGADgAAAQmNDcGIyImNRE0JiMHJzcWMzI3Bw4BBwMUFjI2NQMuASMHJzcWMzI3Bw4BFREUDgEUFjMyNxcGBwGDPF4qNGlyDxYiAgdLHShKBCUZAghWo1YGAg0WKwIHSx0pQQQsGYovIBYlLA0xM/EzX18Mc2oBSyAWAgQsAwktBRcd/tpjaldSAUYjEwIELAMJLQcUHv6wZIlDOB4XEy4RAAAAAAEAHP8PAikB0AAzAAAEJjQ3Ji8BBiMiJjU3NCMHPwEXDgEVFDMyNzU0JiMHPwEXDgEVFDMyNxcOARQWMzI3FwYHAZI8UjcGBW8cQEUEJRkEjwYKEFAoURYcGASaBgkNKRshEVsuIRUlLA0xM/EzX1YMQgJTPDjzNgQlHgwbuVViOegeGAEkHQwXzHguGRNfQDggFxMuEQAAAv/5/+8DowNOADkARQAAAyc3FjMyNxcHDgEVFBMzEycuAS8BNxYzMjcXBw4BFRQTMxI1NCsBJzcWMzcHDgEHAwcmJyMDBwIDJiUnNzMWFw8BJicGBwYBBlAhRksDBDMjewaNEgoqJgIHUB5AVAMENCN8BqJEMgIHS0BqBx4YCtI+OUQGjkBTVBIBDQ6KDklBDglDNzRGAlEEKwMLBycEEBMn/lUBgDcdGgIEKwMLBycEEBIh/k4BtRwjBCsHAy8CER395BbN2/5uFgEmAQM4eRZvPjEWAScaGCkAAAL//P/vAsICvwA8AEkAADc2Ny4BIyc3FjM3FwcOARUUEzM+Ajc2NTQrASc3FjM3Bw4BBwMHJicjAwcCJyYvATcWMzI3FwcOARUUGwEnNjczFhcPASYnBgfgWhALHx0CBjoWdQIGIhdSBBIrGAsVKSUEBTMwUgcUGBKNNTUlBm82WhwRMQIGOhgoSwIGIRhSAw4xWQ5JQQ4JFmROLFHhLCIgBCEBBQUfAQoNGv7eLW07HjkLGQYfAgElAh0s/qsRr3j+6hEBKVYxAQQhAQcFHwELDhz+4AG/FjNmVUQWARNOOicAAAL/7f/0Ai4DTgA4AEQAABIGFB4BOwE3NjU0LwE3FjM3FwcOAQcGDwEGBwYUFjM3FwcmIyIHNz4BPQE0LwEmJyYvATcWMzcXBy8BNzMWFw8BJicGB8IfODcBBXIQPwIGSiVcBAYuJyQCAWsRAwISGjECCVMhN0YGNBodWiIOFzcCBkAujgMDVQ6KDklBDglDNzRGAlcPHoF01B0VGgQEJwcEByUJJkEEArwfOClbHAMELgMMLgooOiw3OrdGDxkFBCcDCAcjbhZvPjEWAScaGCkAAAAAAv/3/w4BxQK/ACsAOAAANxI0KwEnNxYzNwcOAQcDDgEjIiMiJjU3MjY3JicmLwE3FjMyNxcHDgEVFBMDJzY3MxYXDwEmJwYH5nUmLgIGNDFVBxYXC4FRUD4BAQgkBTpnIj9EFy0CBjwZJ08CBiIZWX8OMVkOSUEOCRZkTixbARgwBCEEASUEFx7+0LpuLwoHXVPGqy8BBCEBBwUfAQsPHP7rAbUWM2ZVRBYBE046JwAD/+3/9AIuAzIAOABAAEgAABIGFB4BOwE3NjU0LwE3FjM3FwcOAQcGDwEGBwYUFjM3FwcmIyIHNz4BPQE0LwEmJyYvATcWMzcXBzYGIiY0NjIWDgEiJjQ2MhbCHzg3AQVyED8CBkolXAQGLickAgFrEQMCEhoxAglTITdGBjQaHVoiDhc3AgZALo4DA64dKBYdKBamHSgWHSgWAlcPHoF01B0VGgQEJwcEByUJJkEEArwfOClbHAMELgMMLgooOiw3OrdGDxkFBCcDCAcjlx0aJh0ZJx0aJh0ZAAAAAgAi//0CDANJABgAIAAAJQclBycBBw4BDwE2PwEXBRcGAzc+AT8BBgMHBgcvATcXAe8P/pZGDgF1rUU6CC8QAgqvAQILv8PLNEAQLxQwBGVpCAbHCQ0QBgYgAjQGAztMBGdcCQsHHf7+zAcBUFUFbQKmCiIoBRhtBgAAAAIAJP/6AaACywAYACEAABcnAQcOAQ8BNj8BHwIGBzc+AT8BBhUHJQEHBgcvATY3Fy4KARB9MSUFJwoBBoDSCKB+lCgsCigREP7nAQoBVFQJFElNCgIZAYcGAyUyBlFABQgFFc67CQM5PgVZSBAJAp0LQEwCE09eAgAAAAACACL//QIMAz0AGAAgAAAlByUHJwEHDgEPATY/ARcFFwYDNz4BPwEGAgYiJjQ2MhYB7w/+lkYOAXWtRToILxACCq8BAgu/w8s0QBAvFJoiMBoiMBoNEAYGIAI0BgM7TARnXAkLBx3+/swHAVBVBW0ChSMeLSMeAAACACT/+gGgAsgAGAAgAAAXJwEHDgEPATY/AR8CBgc3PgE/AQYVByUSBiImNDYyFi4KARB9MSUFJwoBBoDSCKB+lCgsCigREP7nvyIwGiIwGgIZAYcGAyUyBlFABQgFFc67CQM5PgVZSBAJAnojHi0jHgAAAAIAIv/9AgwDRgAYACQAACUHJQcnAQcOAQ8BNj8BFwUXBgM3PgE/AQYDFwcjJic/ARYXNjcB7w/+lkYOAXWtRToILxACCq8BAgu/w8s0QBAvFE0Oig5JQQ4JQzc0Rg0QBgYgAjQGAztMBGdcCQsHHf7+zAcBUFUFbQLYFm8+MRYBJxoYKQAAAAACACT/+gGgAsYAGAAlAAAXJwEHDgEPATY/AR8CBgc3PgE/AQYVByUDPwEWFzY3HwEGByMmLgoBEH0xJQUnCgEGgNIIoH6UKCwKKBEQ/ucOEAg8RFMtCBA0XQ5MAhkBhwYDJTIGUUAFCAUVzrsJAzk+BVlIEAkCqxcBNDE+JwEXNWtZAAAB/8v/YQGbAlYALAAAEwc3FwcmJwMOASMiJjQ2NzMeATMyNxM0Ji8BPwI+ATMyFhQGByMuASIGBwbhB4IDCjxEHgZeOR4xDAYLCy4aMgcgEy4EB0YKBlQ6JD0MBg0NNS8YBgwBsk0DAzUCAf64PE4UHTEGGiVLAT8YCQEGIgphPk8VHzMHGygRFCoAAAX/7v/2Ak8DrgAlACsANQA9AEUAAAUnNz4BNC8BJiIPAQYVFDsBFwcmIwc3PgE3EzczEhceAR8BByYiAzI3AyMDEzI1NCYjIhUUFjYGIiY0NjIWNwcGBy8BNxcBSQMEMyYJIRiAPSUJPDkCBklCbggcIhDDPwhUSwwoLAIHSGeLJDlPB1+DKBkVKB1XKUMlKkQjKARaXwcGtAgKBycEECYcbQEIaBsMKQQrBwMvAyEpAf8R/snhJR4EBCkDAREFAQb+9QGvIxMYIxYVDC8oQSsodAkeJAQWYgYAAAAFACn/9AHLAu8AJAAsADYAPgBGAAAAJiIGDwEvATYzMhYVFAYVFDMyNxcOAQciLwEGIyImNTQ2PwIHBhQWMzI/AQMyNTQmIyIVFBY2BiImNDYyFjcHBgcvATcXAR0uRzwQDwUMeCtBShIpGyEODjMWUgcETiA4SB0YvQKLHSceKzAELCgZFSgdVylDJSpEIyUEWl8HBrQIAVY4GQ0MAytGRD0PtyAuGRAYMAhRAU5GNh0sBzQsewk+JjBmAS8jExgjFhUMLyhBKyh0CR4kBBZiBgAAAAP/9v/2AxADegBCAEYATwAAJDY1NCcPAgYVFDsBByYjByc2NxMmIwcnNxYzMjcXBg8BNjU0JiIGBxc/ARcPAhceATMyNj8BFwYPASYrASIHJzcDNycjAQcGBy8BNjcXAWgmGWNbRxA3OQVKQEQHIR73BBUiAgdvMNpQAxEGMAIymhYBH3ZcBA1WbRwGJSltOgssAxIJBdA9IkRQAgJbnR4JAS4BVFQJFElNCikTFRirCAqKHw8iLwcEIyM3AckQAgQsAwwGSlwEHQ4xFgoV5AsNBTUDCakmHihSBQVTVQYHCgcnARIL2gE0C0BMAhNPXgIAAAAEAB7/9AJ5AssAKgAzAD0ARgAABSImJwYHIiY1NDY/AjQjIgYHLwE2MzIXNjMyFhUPAQUeATMyPwEfAQ4BJQYUFjMyNyY1NxU3NjU0JiMiBhMHBgcvATY3FwHgP2AYVDc4SB0YvwFWHT0hBQx5KmIaPVtASQIJ/vIFUz0zNhIGCx1h/owgKBsqSQxGrxQqHzdDigFUVAkUSU0KDDgzWQ5GNh0rBzQyaBsaAytGUFBLQxMOQE1gGgkCHRcttQk9KkQlMDsHMgYMIS1NAVULQEwCE09eAgAAAAAEACj/ngKMA0kAFwAfACcALwAAEzQ2MzIXNx8BBx4BFRQGIyInBy8BNy4BBTI2NTQnAxYDFBcTJiMiBgEHBgcvATcXKL6LOzIqHQMpQkvBjj86PBsCOzxCATRfeFzyNZxN7zE6XXQBYQRlaQgGxwkBKZTMFVAHDEwmjlyVzBpwBgpxJ4uqkXOdUv40JwEik1AByR6QAVYKIigFGG0GAAAABAAk/54BzgLLABUAGwAiACsAADc0NjMyFzcfAQcWFRQGIyInBy8BNyYXFjI2NCcmBhQXEyYjEwcGBy8BNjcXJIZiJyIvHQMvWYZiKCk3GwI2U5AiZEItmUIomCAmjgFUVAkUSU0K0muTDlkHDFc9gmuTEWcGCmg9EhxbrjoyXKs3ASYYAQYLQEwCE09eAgAAAgA5/tsB0gKJAC8APgAAFyImLwE2NTcUFjI2NTQnLgUnJjU0NjMyHwEGDwEnNjU0JiIGFB4BFxYVFAYHNjIWFRQGByc1PgE1NCfbKk4lBQwtMZBMLSFCAwMoLRs1hWFMTQMQBicGAzR6R0WmIDaKgCIvH0w0Eh8pKAwREQpNYQVsQjszLCIZIgECFRsXLD1PaxkGTVwEBRUfNSg3UTtWHC45Vm1RGicgMU8bDwoTNxkmGAAAAgAx/tsBYgHQACYANQAANy8BNj8BFBYyNjQuAjU0NjMyHwEGDwE2NTQmIgYVFBceARUUBiIXNjIWFRQGByc1PgE1NCdCDgMJAyMsWzQvfjRpTzA0Ag4FJQInTS9XUTtujC4iLx9MNBIfKSgEBQcyVAVCNiIyKUI7JD1SEAU4QgMUCSQhIBctLSs6JjpWURonIDFPGw8KEzcZJhgAAgAJ/tsCFwKJACgANwAANxEOBQ8BNj8BFyE3FxYXBy4FJwYRFBYzNxcHJiMHNz4BBzYyFhUUBgcnNT4BNTQn6S8pLw0TBQUvDAMJUwE2VQkCDS8GBhIOKygqEBofNwMJZC+JCEYeCyIvH0w0Eh8pKKIBtAICDAojHiMEWFUICwsIQWgEIyAkCg0CAqD+uiUfAwQuAwQrBiWvGicgMU8bDwoTNxkmGAAAAgAV/tsBOAIUABwAKwAANzU0Ji8BNzY/ARcGBzcXBycGFRQWMzI3FwYjIiYXNjIWFRQGByc1PgE1NCdSGCEEBTg0EBQEBJMDCZEHIyseJgpNGEQ4KyIvH0w0Eh8pKG32GxYBBh4bMBAIGjEDAzUDbowzKhIaPDeIGicgMU8bDwoTNxkmGAAAAAEAD/8PALEB0AASAAA3ETQmIwc3NjcXBhEUBgcnNz4BWxEXGwQ2WgURQj0SAisfJgE2HxcDJQgUDB3+S0h2JRMIK2oAAQA2Ag8BWAK/AAwAABMnNjczFhcPASYnBgdEDjFZDklBDgkWZE4sAhAWM2ZVRBYBE046JwAAAAABAC8CDgFfAsYADAAAEz8BFhc2Nx8BBgcjJi8QCDxEUy0IEDRdDkwCrhcBNDE+JwEXNWtZAAAAAAEATwIuAT8CqgALAAASMjczFw4BIiYnNzOAjhkIEAw8YDwMEAgCaEIKMEJCMAoAAAEAkQJaAP0CyAAHAAASBiImNDYyFv0iMBoiMBoCfSMeLSMeAAIAdgIgARcCxAAJABEAABMyNTQmIyIVFBY2BiImNDYyFsksGxgsIGEuSyguTCcCRicWGicYGA40LEkvLAAAAAABAFz/DwEvACoAFgAAFzQ+BDc2NzMOARQWMzI3FwYHIiZcFwkUCxoGFRUqRDAgFSYsDTEzMj2THCMPFw0bBhUVRkI6HhcTLhEyAAAAAQAjAicBbAK0ABQAABIWMjY3MxcVDwEiJiMiDwEjJzU/AZB0FyAVBhZMEBF0DBUgCwYWTBACniEbHBUFWQQhKg0VBVkEAAAAAgBKAhYBgALBAAcADwAAAQcGBy8BNx8BBwYHLwE3FwEAAkxPCRCMCaECTE8JEIwJApgJN0ICEpcDJgk3QgISlwMAAAABAIz/QAED/7cABwAABAYiJjQ2MhYBAyM3HSI3HpwkITIkIQACAAgAAAH6AokABwALAAAzJxM3MxIXBwMjAyERCe0/CHNLB+kHsAFHDQJrEf5f4QcCHP4dAAAAAAEAKv/6AyQCiQApAAAkNjQmIgYUFhcHJwcnJic3HgE7AS4BNTQ2IBYVFAYHMzI2PwEGDwEnBycCLVB3w3taTwcp9BACESYLKjFcS1W6AQejXE9rMCsLKBQBEP4pB2aUyYp+xrQ9FwcOEEdYBUQyO51RfKycfFuoNi9CBVxIEA4GFQAAAAEABP+aAj4B+QAvAAAlFBYzFxQGIyImNRM0JiIGBwYVFw8BJzYSNTQmIgYPAS8BPwEyBDMyNxcPASIGBwYBrywxBSYGPTgFGW4XAgwEBUgGBQ0RJx4QBxoBPA9AAQEYMl4GCgdDKQIQmTUwBwgxP0QBDSYQECLFrWUHEAwMAUuFIhYhIQESB2IHCgoHLgcVItUAAAAC//n/7wOjA0kAOQBBAAADJzcWMzI3FwcOARUUEzMTJy4BLwE3FjMyNxcHDgEVFBMzEjU0KwEnNxYzNwcOAQcDByYnIwMHAgMmNyc/ARYXDwEGAQZQIUZLAwQzI3sGjRIKKiYCB1AeQFQDBDQjfAaiRDICB0tAagceGArSPjlEBo5AU1QS+wQQCWleBggCUQQrAwsHJwQQEyf+VQGANx0aAgQrAwsHJwQQEiH+TgG1HCMEKwcDLwIRHf3kFs3b/m4WASYBAzi5CjAGPDEYBQAAAv/8/+8CwgLKADwARQAANzY3LgEjJzcWMzcXBw4BFRQTMz4CNzY1NCsBJzcWMzcHDgEHAwcmJyMDBwInJi8BNxYzMjcXBw4BFRQbASc/ARYXDwEm4FoQCx8dAgY6FnUCBiIXUgQSKxgLFSklBAUzMFIHFBgSjTU1JQZvNlocETECBjoYKEsCBiEYUgkBJgpOSBQJQ1HhLCIgBCEBBQUfAQoNGv7eLW07HjkLGQYfAgElAh0s/qsRr3j+6hEBKVYxAQQhAQcFHwELDhz+4AJDCykCXk4TAj4AAv/5/+8DowNJADkAQQAAAyc3FjMyNxcHDgEVFBMzEycuAS8BNxYzMjcXBw4BFRQTMxI1NCsBJzcWMzcHDgEHAwcmJyMDBwIDJiUHBgcvATcXBgEGUCFGSwMEMyN7Bo0SCiomAgdQHkBUAwQ0I3wGokQyAgdLQGoHHhgK0j45RAaOQFNUEgIwBGVpCAbHCQJRBCsDCwcnBBATJ/5VAYA3HRoCBCsDCwcnBBASIf5OAbUcIwQrBwMvAhEd/eQWzdv+bhYBJgEDOMMKIigFGG0GAAL//P/vAsICywA8AEUAADc2Ny4BIyc3FjM3FwcOARUUEzM+Ajc2NTQrASc3FjM3Bw4BBwMHJicjAwcCJyYvATcWMzI3FwcOARUUEwEHBgcvATY3F+BaEAsfHQIGOhZ1AgYiF1IEEisYCxUpJQQFMzBSBxQYEo01NSUGbzZaHBExAgY6GChLAgYhGFIBBwFUVAkUSU0KUeEsIiAEIQEFBR8BCg0a/t4tbTseOQsZBh8CASUCHSz+qxGveP7qEQEpVjEBBCEBBwUfAQsOHP7gAk8LQEwCE09eAgAAAAAD//n/7wOjAzIAOQBBAEkAAAMnNxYzMjcXBw4BFRQTMxMnLgEvATcWMzI3FwcOARUUEzMSNTQrASc3FjM3Bw4BBwMHJicjAwcCAyYkBiImNDYyFg4BIiY0NjIWBgEGUCFGSwMEMyN7Bo0SCiomAgdQHkBUAwQ0I3wGokQyAgdLQGoHHhgK0j45RAaOQFNUEgIQHSgWHSgWph0oFh0oFgJRBCsDCwcnBBATJ/5VAYA3HRoCBCsDCwcnBBASIf5OAbUcIwQrBwMvAhEd/eQWzdv+bhYBJgEDOKIdGiYdGScdGiYdGQAD//z/7wLCApMAPABEAEwAADc2Ny4BIyc3FjM3FwcOARUUEzM+Ajc2NTQrASc3FjM3Bw4BBwMHJicjAwcCJyYvATcWMzI3FwcOARUUEwAGIiY0NjIWDgEiJjQ2MhbgWhALHx0CBjoWdQIGIhdSBBIrGAsVKSUEBTMwUgcUGBKNNTUlBm82WhwRMQIGOhgoSwIGIRhSAQUdKBYdKBamHSgWHSgWUeEsIiAEIQEFBR8BCg0a/t4tbTseOQsZBh8CASUCHSz+qxGveP7qEQEpVjEBBCEBBwUfAQsOHP7gAgIdGiYdGScdGiYdGQAAAAL/7f/0Ai4DSQA4AEAAABIGFB4BOwE3NjU0LwE3FjM3FwcOAQcGDwEGBwYUFjM3FwcmIyIHNz4BPQE0LwEmJyYvATcWMzcXBy8BPwEWFw8Bwh84NwEFchA/AgZKJVwEBi4nJAIBaxEDAhIaMQIJUyE3RgY0Gh1aIg4XNwIGQC6OAwNnBBAJaV4GCAJXDx6BdNQdFRoEBCcHBAclCSZBBAK8HzgpWxwDBC4DDC4KKDosNzq3Rg8ZBQQnAwgHI64KMAY8MRgFAAAAAv/3/w4BxQLKACsANAAANxI0KwEnNxYzNwcOAQcDDgEjIiMiJjU3MjY3JicmLwE3FjMyNxcHDgEVFBMDJz8BFhcPASbmdSYuAgY0MVUHFhcLgVFQPgEBCCQFOmciP0QXLQIGPBknTwIGIhlZeQEmCk5IFAlDWwEYMAQhBAElBBce/tC6bi8KB11TxqsvAQQhAQcFHwELDxz+6wI5CykCXk4TAj4AAAAAAf/6AOAB0AEfAAgAACUFJzcWMjY1FwHI/jgGC5agjwbiAgkxAQUBCgAAAAAB//oA4AOcAR8ABwAAJQUnNwQzJRcDlPxsBgsBKawBvAbiAgkxAQYKAAAAAAEAHAGnAK4CiQAOAAATBiImNTQ2NxcVDgEVFBeMIi8fTDQSHykoAcEaJyAxTxsPChM3GSYYAAAAAQACAacAlAKJAA4AABM2MhYVFAYHJzU+ATU0JyQiLx9MNBIfKSgCbxonIDFPGw8KEzcZJhgAAAABAA//YwCtAGMADAAANzYyFhQGByc1PgE0J0AiLh1UOBIjLCBJGilZXSEPChhCRx4AAAAAAgAcAacBSQKJAA4AHQAAAQYiJjU0NjcXFQ4BFRQXBwYiJjU0NjcXFQ4BFRQXASciLx9MNBIfKSidIi8fTDQSHykoAcEaJyAxTxsPChM3GSYYDhonIDFPGw8KEzcZJhgAAgACAacBLwKJAA4AHQAAEzYyFhUUBgcnNT4BNTQvATYyFhUUBgcnNT4BNTQnvyIvH0w0Eh8pKJkiLx9MNBIfKSgCbxonIDFPGw8KEzcZJhgOGicgMU8bDwoTNxkmGAAAAgAf/4EBTABjAA4AHQAANzYyFhUUBgcnNT4BNTQnNzYyFhUUBgcnNT4BNTQnQSIvH0w0Eh8pKJ0iLx9MNBIfKShJGicgMU8bDwoTNxkmGA4aJyAxTxsPChM3GSYYAAAABAAg/6MBzwJWAAQACQAOABMAABM3EwcnEwcnNxcTPwEXBycPASc32jUFPgtENQU+CwMCpAgJ+gOhCAkBNAP+dQkIAekDvAkI/v81DQk+OjUPCz4ABwAg/6MBzwJWAAQACQAOABIAFwAcACEAAD8BFwcnPwIXBycPASc/AhUHNwcnNx8BPwEXBycPASc32jUFPgtWAqQICfoDoQgJsTc3NTUFPgsDAqQICfoDoQgJWgOxCQjJNQ0JPjo1Dws+oQSWBPYDoQkI5TUNCT46NQ8LPgAAAAABADwAdQEZAVIABwAANiImNDYyFhTZYjs/YT11P1xCQFwAAAABADz/9ACzAGsABwAANgYiJjQ2MhazIzcdIjceGCQhMiQhAAACADz/9AGFAGsABwAPAAA2BiImNDYyHgEGIiY0NjIWsyM3HSI3HtIjNx0iNx4YJCEyJCEyJCEyJCEAAAADADz/9AJXAGsABwAPABcAACQGIiY0NjIeAQYiJjQ2MhYEBiImNDYyFgGFIzcdIjce0iM3HSI3Hv5cIzcdIjceGCQhMiQhMiQhMiQhMiQhMiQhAAAHACP/oQPgAqYABwAPABcAHwAnAC8AOAAAEhYyNjQmIgYWBiImNDYyFhIWMjY0JiIGFgYiJjQ2Mh4CMjY0JiIGFgYiJjQ2MhYBFwIHAy8BNgFSPUw2OFgv7lGDSVWDRWU9TDY4WC/uUYRIVYNFXz1MNjhYL+5Rg0lVg0X+awWuWNcmBYUBVwG7NSdePDBrZleNX1j+ODUnXjwwa2ZXjV9YdjUnXjwwa2ZXjV9YAbQO/v2N/qwTDMoCHAAAAAEAFAAuANcBkAAKAAATHwEHFw8BJic1NsAWAWtrARZEaGABkA8KlZsKD0ZgD1sAAAEALgAuAPEBkAAKAAA3LwE3Jz8BFhcVBkUWAWtrARZEaGAuDwqVmwoPRmAPWwAAAAH/Lf+hATUCpgAIAAABFwIHAy8BNgEBMAWuWNcmBYUBVwKTDv79jf6sEwzKAhwAAAIAHwFXAUEC2AAHAA8AAAAGIiY0NjIWBhYyNjQmIgYBQVWDSlaCSvM3WjM4WjIByHFkrm9klUZBckdBAAIACgFYAR4C2AAPABMAABMzFwcnFw8BJzY1Jz8CFwc1IwfiNwUGNgQEPQUEmgKsAyc+BloB9wcsAmEGBwY6LwMi6wEG2319AAEAGAFXAQEC6wAbAAASFhQGIyImJzcWMjY1NC8BPwI+AT8BDwEmIweuSnFAGBUCBh1ENX8GCwV9EhEFHRAGQEgFAkAzX1caHwcIJx49BgeoBQQBCg4DVQYFTQAAAgAeAVcBHALYABYAIAAAEhYUBiImNDY3Nj8BHwEOBAcXNjcWJiIHBhUUFjI24jpKckItIEI1FgYKBRAtJigKAycXLiU5HQIjOx8CPj9hR0xwWxo3EQgEGwIGGh80HgQbAVoqFBALKzIjAAAAAQAdAVgBGALTABIAABMzFwYPASMvARMHDgEPATY/ARZ7iRRFQRIIMQaWYR8UBiAJAwQmAtAZipVADg8BJAUCFSIERDUDAwAAAwAnAVcBIALYABAAGgAjAAATNDcmNTQ2MhYVFAcWFAYiJjYWMjY0LgEnBhU2BhQeARc2NCYnTENHXz89SE1qQjsnNyMcGR4uKB0ZGRofHgGvPyMnNyo/Lyg3ISZpQzAdJiApHg4OGCrwHCMcDg0WQR8AAAACABwBWAEaAtgAFgAgAAASJjQ2MhYUBgcGDwEvAT4ENycGByYyNzY1NCYiBhRWOkpyQi0gQjUWBQsFEC0mKAoDKRUJOhwCIzsfAfI+YUdLcFsaNxEIAxwCBhoeNR4DGgEwExIKKzIjPwAAAAABAB0BWQFeAocALgAAAQcUMzcXByYjBzc2NTc0IyIHBhQWMzcXByYjBzc2PQE0JisBJz8BFwYHFzYzMhYBPQoVFQEGJxlFAyECLh0lBgkMEwEGJxhHBCIOEQgCA2kFBgECQBgrMQI1lCABAyICBiIHHnM8HIQgDgEDIgIEIgQgjhURAxwTBhUVAjIsAAIAH/+AAUEBAQAHAA8AAAQGIiY0NjIWBhYyNjQmIgYBQVWDSlaCSvM3WjM4WjIPcWSub2SVRkFyR0EAAAEAG/+BAN0BAQAiAAATNzMXBgcGFRQWMzcXByYjBzc+AT0BNCYjByc3PgavBgEFFAQGDREgAgc4IFsEHxoPEiEDAzUfEg4MCAcBAAEPEiFweRgTAgMkAgcjAhYb0RYNAwMgBwQDAgIBAgAAAAEAGP+BATQBAQAbAAA3NCIHIyc+ATIWFAYHFzMyNj8BBg8BJiMHJzc2vGolBwoUSFQ7QFADUiAaCCYOBQmWOioGRV+YLj4pIi4vTGldBRYjBD4xBgUHGU11AAAAAQAf/4AA/gEBACIAABcWMjY1NCMvATc2NTQmIyIHIyc+ATIWFRQHFRYVFAYjIiYnJRtDN2gFBCo1GBQlIwcKDkVFMkZXcT8ZFQFACCUdOgUgCRooExYcJQsgKh07IQUYQC5TGh8AAAACAAr/gQEeAQEADwATAAA3MxcHJxcPASc2NSc/AhcHNSMH4jcFBjYEBD0FBJoCrAMnPgZaIAcsAmEGBwY6LwMi6wEG2319AAABABj/gAEBARQAGwAANhYUBiMiJic3FjI2NTQvAT8CPgE/AQ8BJiMHrkpxQBgVAgYdRDV/BgsFfRIRBR0QBkBIBWkzX1caHwcIJx49BgeoBQQBCg4DVQYFTQAAAAIAHv+AARwBAQAWACAAADYWFAYiJjQ2NzY/AR8BDgQHFzY3FiYiBwYVFBYyNuI6SnJCLSBCNRYGCgUQLSYoCgMnFy4lOR0CIzsfZz9hR0xwWxs2EgcEGwIGGh80HgQbAVoqFBALKzIjAAAAAAEAHf+BARgA/AASAAA3MxcGDwEjLwETBw4BDwE2PwEWe4kURUESCDEGlmEfFAYgCQMEJvkZipVADg8BJAUCFSIERDUDAwAAAAMAJ/+AASABAQAQABoAIwAAFzQ3JjU0NjIWFRQHFhQGIiY2FjI2NC4BJwYVNgYUHgEXNjQmJ0xDR18/PUhNakI7JzcjHBkeLigdGRkaHx4oPyMnNyo/Lyg3ISZpQzAdJiApHg4OGCrwHCMcDg0WQR8AAAAAAgAc/4EBGgEBABYAIAAANiY0NjIWFAYHBg8BLwE+BDcnBgcmMjc2NTQmIgYUVjpKckItIEI1FgULBRAtJigKAykVCTocAiM7Hxs+YUdLcFsbNhIHAxwCBhoeNR4DGgEwExIKKzIjPwABADj/9gG2AgEAPQAABSciBzc+ATUjJzczEzQmIwcnNxY7ATI3FwYPATY1NCYiDgMXFAcWMzcXBy4BIg8BMxcHIxUUFjMyNxcHAQttJEAFLhRCBwZDAQsQIQIHRzIyRHcFDgYxASJdFwkDAQEEFjpbBg4XKT0oA14FBV8NDRUoAgkCAgorCCE3Bx4BAhcOAQglAwsHP0kDGwsiEQMPFBkMBGEBCggzAQIFPgceJxwUAggmAAABAAz/9wIWAfsANAAAJTI/AQYPAQYiJicjJzczJjQ3Iyc3Mz4BMzIfAQYPATY1NCMiBgczNxcPAQYUFzM3Fw8BHgEBYmcbMhAFBkjDfRJQBQVLAQROBQVXG5JlQFIEEAUyAnBAVA4CtwYDwQEEBLcGA7YSVSl2BEo7CB9fVAcdCS8XBx1VZRMGPEwDFBNGRT4ECR4BCDIVBAkeAT1EAAAAAgACAYoCKAKCADMAUgAAAQYUOwEXByYjBzc2NzY0Ji8BNxYzNxczNjczNxcHDgEUHgEzNxcHJiIHNzY1JyMGDwEmJwc1DgEPATY/ARczNx8BBy4BJwYVFDM3FwcmIwc3PgEBNAgMDgIEIQ0oAxUDEAwSAwQjDyk0BBocLikCAxEMCwgKCwIEGEAJAxcJAyAgGisU4SARBCAEAQQnfSgEBSAFEB4EFRYBAzAUQgMbDQI2eRUCFwEDGQEZeCcGAgMVAgKZRlICAhYBCTF3DgECGAEDGQERfkxdA30vaZQBDiEDKyUEBAQETQMjDwFCXRoBARoCAhgCDgACACj/9AMJAosAFAAiAAATIh0BFBcWIDczDgEjIiYQNiAWHQEnNCcmIAcGHQEUMyEyNbQFCVsBF102M5pXmNnYATHYhgpd/vpdCgUBygUBNwS1CgthbTxFwgETwsKKCM0MCl1gCg2yBQUAAAACACv/9AHRAuUAEAAbAAAlFAYiJjQ2MzIXNyYnPwEeAQI2NCcmIyIGFBYzAdF/v2h/Wxs0AkjZDwqr2I89EChPO0JQRPJqlIHBjxoCrmUhBEn//oham0YvVKVxAAEAOP/0ApMChgA4AAA3EzQmIwcnNxYzITI2NwcOAQcCFRQWMzcXByYjIgc3PgE1EzQmIgYHAhUUFxYzNxcHLgEiBgc3PgGOAQ8WKgIHTikBNCF3AgQqHAIOEho1AglUIzpGBi8hASurMAEOEQoRNQIJGi87cgEGLyF4AZ4gFgIEMgMGAzMFFx3+7ZcoHAMELgMMLgkiKwGeIhAQHv7tlzQKBgMELgECCAQuCSIAAAAAAQAH//sB2AKJABwAACUHJQcnEwM3FzUkNxcWFwcuAS8BExUDNz4BPwEGAb8P/p40E+nWDgEBR08KAgsqCDdIqLvOuzg9Dy8WDRAGCA0BKAEnIAEBCggJW1wIST4DB/76EP7xBwJQTwVtAAAAAQASAOoB6AEpAAcAAAEXBwUnNxYzAeIGCP44BguWWQEpCjMCCTEBAAEABP/0AfgC5gASAAATIiMnNzA3FxYTMxM3MwMHAicmCwICAwV8CAhmBrsPLd4/bCIRAZwEIQYIRP7dAoEN/SIUASZULgAAAAMAEQB1AegBkAARABsAJQAAEzIXNjMyFhQGIiYnBiMiJjQ2FzI3JicmIgYUFiUiBx4CMjY0JpJHLi1JMjlOXDUXK0syOU4uOxwmIhAtKS4BCDkeERgqMikuAZBXV093VS4rWU92Vt86URQILUowozgkKCMtSTEAAAH/7v9iAaECVwAdAAABMhYUBgcjLgEiBgcDDgEjIiY0NjczHgEyNjcTPgEBSiA3DAYNCzAwHwEfBF06HjEMBgsLLjEgAiADVwJXFR40BxsoHxz9/z5QFB0xBholJSYB+zZQAAACAC0AegHQAZ8AFQArAAASFjMyPwEzFxUPASImIyIPASMnNT8BHgEzMj8BMxcVDwEiJiMiDwEjJzU/AaS8EBkhCgYWTBAcuhAcHgsGFkwQG7wQGSEKBhZMEBy6EBweCwYWTBABkysqDRUFWQQrKQ4VBVkEoisqDRUFWQQrKQ4VBVkEAAABABIAGAHoAfoAHwAAJQcjByMnNwcnNxYzNwcnNxYzNzMXBzcXDwIyPgE1FwHg4xUjGgchrQYLYlUa1gYLhlokGggiwQYIzhsidFUGnwGGCH4BCTEBZQEJMQGHCn0GCjMBZQMCAQoAAAIAEv+1AegB0AARABsAACUXByYnJiUnPwIfAQYPARUXEwUnNxYyPgE3FwHGAR4pJSb+8ggCy8kJB3BSmqjP/jgGC5Z9aUgBBnkLKBMREnMLL1ZRBTInIjwGRv7vAgkxAQMCAQoAAAAAAgAS/7UB6AHQABEAGwAAEyc3HgIfAQ8CLwE2PwE1JxMFJzcWMj4BNxc0AR5fgF9ECALLyQkHcFKaqPf+OAYLln1pSAEGAZ0LKC03KRwLL1ZRBTInIjwGRv5pAgkxAQMCAQoAAAIAPP+iAb8CiwANABUAABMnPwIfAw8CLwETAx8BMxMvAT0BTVcvC1VOAkxXLwtVaH9FRgZ/RUYBBhWxvQIHuaIarr0CB7kB5P7OkZwBMZKcAAAAAAEAKf/0AiUC5gA9AAATAxQzNxcHJiMHNz4BPQEuAS8BPwE0NjMyHwEGDwEuAiMiDwEyNjcXDgEVFBYzNxcHJiMiBzc+AT0BNCYjtAQxPgIHVSdwBSMWAhkkBAc8hXM9SAIQDwsHGEkkfgEBtmMhBQkOEBMjAgg0HC5CBCQUGSwBkv7QNwEEKgIEJwUjNOsYEgEGIguEmiIJICsDBxUiuS4ECAwV2HUeGgIEKwMMKQokN9ojEwAAAAABACn/9AItAuYANwAANxEuAS8BPwE1PgEzMhc3FwYCFRQWMzcXByYjIgc3NjURJy4BIyIPATcXByYjAxQzNxcHJiMHNzZsAhglBAc8AXpnNS5KBgsREBMjAgg0HC5CBDgBGEYdbgEBigMKPkYEMzwCB1UncAU5XgEOFxEBBiILBIKYERENEf533R4aAgQrAwwpDzICFA4TGLkxAwM1A/7TNwIEKwIEJwcAAAAAAQB9Ar8BXQNJAAcAAAEHBgcvATcXAV0EZWkIBscJAxMKIigFGG0GAAEATwLGAT8DMgALAAASMjczFw4BIiYnNzOBjBoIEAw8YDwMEAgDADIKKjg4KgoAAAEANgLIAVgDTgALAAATJzczFhcPASYnBgdEDooOSUEOCUM3NEYCyRZvPjEWAScaGCkAAAACAEYC1QFHAzIABwAPAAAABiImNDYyFg4BIiY0NjIWAUcdKBYdKBamHSgWHSgWAvIdGiYdGScdGiYdGQABADECvwERA0kABwAAEyc/ARYXDwE1BBAJaV4GCAMJCjAGPDEYBQAAAQAyAs8BXQMKAAcAAAEXBwUnNxYzAVcGB/7iBgpfOwMKCi8CCS0BAAIAdgKiARcDRgAJABEAABMyNTQmIyIVFBY2BiImNDYyFsksGxgsIGEuSyguTCcCyCcWGicYGA40LEkvLAAAAAABACMCuwFsAzQAFQAAEhYzMj8BMxcVDwEiJiMiDwEjJzU/AZB0DBUhCgYWTBARdAwXHgsGFkwQAyghIgsVBU8EISILFQVPBAABADYCwAFYA0YACwAAARcHIyYnPwEWFzY3AUoOig5JQQ4JQzc0RgNFFm8+MRYBJxoYKQAAAQCRAs8A/QM9AAcAABIGIiY0NjIW/SIwGiIwGgLyIx4tIx4AAQBq/tsA/P+9AA4AABc2MhYVFAYHJzU+ATU0J4wiLx9MNBIfKShdGicgMU8bDwoTNxkmGAAAAAACAFkCrQGdA0UABwAPAAABBwYHLwE3HwEHBgcvATcXAREDUFQICZkJogNQVAcKmQkDFgkoLwUVdQQ0CSgvBBV2BQAAAAEAKf/8AgIC2gAwAAATMAczNxcHJyMDFDM3FwcuASMnBzc2Nz4BPQEuAS8BPwE0NjMyFh8CBg8BLgIjIrYByDgFCSXYBC1DAgcWKxIqcAUeDwkDARwiBAc8j2UpUBMUAhUUCwcZSySGAfIxAggtAv7SNwIELQECAQInAg4IKhjrGRACBiILgpAYDA0JGSEDBxQhAAABACn//AHrAuYAKQAAEzAHNxcHJiMDFDM3FwcmIhU3PgE9AS4BLwE/ATQ2MzIWHwEGDwEuASMitgGIAwo8RgQxPgIHNLgFJRQBHCIEBzyJaSVFIQILDwsWVyR8AfIxAwM1A/7TNwEEKgIEJwUmMesZEAIGIguKlBERCR4rAxYmAAEAKf/8AcYC5gAmAAATAxQzNxcHJiIVNz4BPQEuAS8BPwE0NjMyHwEGDwEmIgYVMzcXBye0BDMyAgcwsgUkFQEcIgQHPIJkOTkCEA8LMoYvvjgFCSUBkP7SNwIEKwIEJwUlL+4ZEAIGIguKlBMJHCUDJXV1AggtAgAAAAACACb/9AHvAlYABwAPAAAkBiImEDYyFgQWMjY0JiIGAe+JynaKyHf+cWGYXGKaWaq2ogENs6H2gnrNhHoAAAAAAQAk//QBPgJWAB4AADcUFjM3FwcmIyIHNz4BNRE0JiMHJzcUNzY3Fw4BBwbWFB01AglUJDtQBjkhGR01AwRiVB8GFA8CCHAoHAMELgMMLgQtRQE9IxYGAyoDEA4GEREhItQAAAEAGv/0AcYCVgAbAAABNCIHIyc+ATIWFAYHFzMyNj8BBg8BJiMHJzc2ASe5OgkLGm9/V2mFBJk3Kg8oFwgM61Y2CmOqAcFSbS03TEd1sKQHIjkFVkkHBwwScdYAAQAr//QBcQJWACQAADcyNjQmIy8BNz4BNCYiBgcjJz4BMzIWFAYHFRYVFAYjIiYnNxaARmBVXgUFQSgzKj9BFgoKHWchOEo8MoeqXCIdAQUqOkNtNQUjEBRBQikaFCoXLEJbTBoHI2hIhSInBgkAAAIAAv/1AaECVwARABUAACUzFwcmJxcPASc2NyYjNwE3FwM1IwcBPl0GCCU2BwVHBgUBml0EARQEIEUJoe0INwECqQcMCWdOBCUBegEK/qDg4AAAAAEAH//0AXcCdwAcAAASFhQGIyImJzcWMzI2NTQvAT8CPgE/AQ8BJiMH8netXiAdAgUqJ0pe0wkRCL0eGQghGAZndAkBZU6XjCEoBglIOHUEC/4ICAIPFgR2BgiVAAAAAAIAKP/0AaMCVgAZACMAABMyFhUUBiImNTQ+Ajc2PwEfAQ4DBxc2FiYiBwYVFBYyNvZRXHCpYiU6RyRNIxIHCyBSQEIPBFGBRWcyA0BoOQFYZT9QcHdaPW9PQhUuCwYFHgwyOGA3AjSITSUWF0xbQAABACb/9AGiAk4AEgAAEzMXBgMHIy8BEwcOAQ8BNj8BFrnTFmd5GQc8CvqtMSEKJw4FBjwCShzP/utWEhYB6gcCJDcGYUwFBAADADj/9AGvAlYAEgAcACgAADc0Ny4BNDYyFhUUBx4BFRQGIiY2FjI2NC4BJwYVExQXHgEXNjU0JiIGOIE0O2eMXWM5P3adZElGYUItJTxbDzkXFR48N1Q0fGk8HEN0YkZAXDUeRjVKaEkoRj1LNRUeJ1QBPTMkDgsQJEY0OTQAAAIAJP/1AZ8CVwAZACMAADciJjU0NjIWFRQOAgcGDwEvAT4DNycGJhYyNzY1NCYiBtFRXHCpYiU6RyNOIhMHCyBSQEIOA1GBRGQ2A0FnOfNlP1Bwd1o9b09CFS4LBgUeDDE4YDcDNIdMJRUYTFtAAAACABT/9AGuAlYABwAPAAAkBiImEDYyFgQWMjY0JiIGAa56tmp7tGv+nlWFUFWITaq2ogENs6D3gnrNhHkAAAAAAQBD//QBfwJWABwAACUUFjM3FwcmIyIHNz4BNRE0JiMHJzc2NxcOAQcGAQYXIj4CCV8pQlgHQiYeIT4DBOMJBhgRAghwKBwDBC4DDC4ELUUBPSMWBgMqGwYRESEi1AAAAQAU//QBsgJWABsAAAE0IgcjJz4BMhYUBgcXMzI2PwEGDwEmIwcnNzYBFrI2CQsZa3xUZX8DkTUpDigWCAvjUzYJYKIBwVJtLTdMR3WwpAciOQVWSQcHDBJx1gABADP/9AGDAlYAKgAANzI2NCYjLwE3PgE0JiIGByMnPgU3NjMyFhQGBxUWFRQGIyImJzcWikpkWWIFBUMqNixCRBcKCgYMEBUXGg0gFTpMPjSMsF8iHgEFLDpDbTUFIxAUQUIpGhQqBQcKCwwKBAhCW0waByNoSIUiJwYJAAAAAAIAA//1AaUCVwARABUAAAE3FxEzFwcmJxcPASc2NyYjPwE1IwcBHQQgXgYIJjYHBUcGBQGcXQT1CaMCVgEK/qAINwECqQcMCWdOBCUR4OAAAQAn//QBjAJ3ABwAAAAWFAYjIiYnNxYzMjY1NC8BPwI+AT8BDwEmIwcBAXyzYiEeAgUsKE5k3gkRCcQfGgkhGQZseQoBZU+VjSEoBglIOHUEC/4ICAIPFgR2BgiVAAAAAgAn//QBnwJWABgAIgAAEzIWFRQGIiY1ND4CNzY3HwEOAwcXNhYiBwYVFBYyNjT0UFtvqGEkO0YjSjgGDCBRQEIOBFA7ZjIDQGc4AVhlP1Bwdls9b09CFSwTBR4MMjhgNwI0OyUWF0xbQGwAAQAv//QBuQJOABIAABMzFwYPASMvAQEHDgEPATY/ARbI3BV+bRoGPQoBBrczIgsnDgYGPgJKHPLyVhIWAeoHAiM4BmFMBQQAAwAu//QBlgJWABIAHwAqAAA3NDcuATQ2MhYVFAceARUUBiImNhYyNjQuAicmJwYVEgYUFhcWFzY1NCYuejI3Y4dZXjY8cZhfSEJbPikmLwEEA1U/MBEWGzk4NHxpPBxDdGJGQFw1HkY1SmhJKEY9SzQXGQEBAiZVAZQ0OSQRFSAkRjQ5AAAAAAIAI//1AZsCVwAYACIAADciJjU0NjIWFRQOAgcGBy8BPgM3JwYmFjI3NjU0JiIGzlBbb6hhJDtGI0o4BgwgUUBBDgNQf0JkNgNBZjjzZT9QcHZbPW9PQhUsEwUeDDE4YDcDNIdMJRUYS1xAAAIAEf/0AacB+QAHAA8AACQGIiY0NjIWBBYyNjQmIgYBp3m0aXqzaf6gVYVQVoZOkJyI5JmHy2deoGpfAAEAPv/0AXcB+QAdAAAlFBYzNxcHJiMiBzc+AT0BNCYjByc3MjY3Fw4BBwYA/xciPQIJXihBWAdAJh4gPQMFDKsvBhcRAgZwKBwDBC4DDC4ELELkIxYGAyoYCRERISKfAAEAEv/0AaoB+QAdAAATNCYiBgcjJz4BMhYUBgcXMzI2PwEGDwEmIwcnNzb4JkE/FggLGF1pSFV0BI40KA4oFAcM4VI0CkubAWokKDApLTA/QmOFiwciOQVUSQcHDBJYuAAAAAABABv/lwF2AfkAJgAAFzI2NTQvAjc+ATQmIyIHIyc2NzYzMhYUBgcVFhUUDgEjIiY1NxZyTmu7BQVDKjUuI0I1CgopPSQgPEo+NIxVhUAjHgQsI0w5ZAEFIxATQUAnMyohGA89W0waBSBcNGpFIicGCQAAAAIAA/+XAZ4B+QARABUAAAE3FxEzFwcmJxcPASc2NyYjPwE1IwcBFwQhXAYIJTUHBUcGBQGYXATwCZ8B+AEK/qAINwECqQcMCWdOBCUR4OAAAQAT/5cBgwIaAB0AABIWFA4BIyImJzcWMzI2NCYvAT8CPgE/AQ8BJiMH9H9ehj0fHgIELCZRbV53CREJvx4aCCEYBml2BwENS3xvQB8qBglKbDkUC/QICAIPFgR2Bgh+AAAAAAIAJP/0AZgCVgAZACMAABMyFhUUBiImNTQ+Ajc2PwEfAQ4DBxc2FiYiBwYVFBYyNu9PWm6lYSQ5RSNMIhIHCx5RPkEOBE98Q2MyAz9lNwFYZT9QcHdaPW9PQhUuCwYFHgszOGA3AjSITSUWF0xbQAABACz/lwGyAfEAEgAAEzMXBgMHIy8BAQcOAQ8BNj8BFsPZFnVzGQc9CgECszMiCicOBQY+Ae0c5P8AVhIWAeoHAiQ3BmFMBQQAAAAAAwAr//QBjwJWABIAHQAoAAA3NDcuATQ2MhYVFAceARUUBiImNhYyNjQuAicGFRIGFBYXFhc2NTQmK3gxNmGGWFw1O3CWXkhAWj0rIDYDUz4wERYaOTczfGk8HEN0YkZAXDUeRjVKaEkoRj1LNRQdAiVWAZQ0OSQRFSAjRzQ5AAACACD/lwGUAfkAGQAjAAA3IiY1NDYyFhUUDgIHBg8BLwE+AzcnBiYWMjc2NTQmIgbJT1pupWEkOUUjTCISBwseUT5ADgNPfEFhNgM/ZTeVZT9QcHdaPW9PQhUuCwYFHgsyOGA3AzSHTCUVGExbQAAAAQCjAdsA8ALFAAkAABM2NTQnNxcGDwGpAQdGBw4VGQHdIRpEWw4IbmYOAAABACn/DwHvAuYAOAAAEwMUMzcXByYjBzc2NREuAS8BPwE0NzYzMhYfAQYPAS4CIgYHBhUyNjcXBhEUBgcnNz4BNRE0JiO0BDE+AgdVJ3AFOQEcIgQHPDhEdiVFIQIQDwsHGElLNA4Xr2QiBRFBPhICKiAYHAGS/tA3AQQqAgQnCDMBDBkQAgYiC3pKWhERCSArAwcVIiAhOG4DCQwd/ktHdiYTCCpqaAE2Jw8AAgAfAQMBQQKEAAcADwAAAAYiJjQ2MhYGFjI2NCYiBgFBVYNKVoJK8zdaMzhaMgF0cWSub2SVRkFyR0EAAQAbAQQA3QKEACIAABM3MxcGBwYVFBYzNxcHJiMHNz4BPQE0JiMHJzc+Bq8GAQUUBAYNESACBzggWwQfGg8SIQMDNR8SDgwIBwKDAQ8SIXB5GBMCAyQCByMCFhvRFg0DAyAHBAMCAgECAAAAAQAYAQQBNAKEABsAABM0IgcjJz4BMhYUBgcXMzI2PwEGDwEmIwcnNza8aiUHChRIVDtAUANSIBoIJg4FCZY6KgZFXwIbLj4pIi4vTGldBRYjBD4xBgUHGU11AAABAB8BAwD+AoQAIgAAExYyNjU0Iy8BNzY1NCYjIgcjJz4BMhYVFAcVFhUUBiMiJiclG0M3aAUEKjUYFCUjBwoORUUyRldxPxkVAQFDCCUdOgUgCRooExYcJQsgKh46IQUYQC5TGh8AAAIACgEEAR4ChAAPABMAABMzFwcnFw8BJzY1Jz8CFwc1IwfiNwUGNgQEPQUEmgKsAyc+BloBowcsAmEGBwY6LwMi6wEG2319AAEAGAEDAQEClwAbAAASFhQGIyImJzcWMjY1NC8BPwI+AT8BDwEmIweuSnFAGBUCBh1ENX8GCwV9EhEFHRAGQEgFAewzX1caHwcIJx49BgeoBQQBCg4DVQYFTQAAAgAeAQMBHAKEABYAIAAAEhYUBiImNDY3Nj8BHwEOBAcXNjcWJiIHBhUUFjI24jpKckItIEI1FgYKBRAtJigKAycXLiU5HQIjOx8B6j9hR0xwWxo3EQgEGwIGGh80HgQbAVoqFBALKzIjAAAAAQAdAQQBGAJ/ABIAABMzFwYPASMvARMHDgEPATY/ARZ7iRRFQRIIMQaWYR8UBiAJAwQmAnwZipVADg8BJAUCFSIERDUDAwAAAwAnAQMBIAKEABAAGgAjAAATNDcmNTQ2MhYVFAcWFAYiJjYWMjY0LgEnBhU2BhQeARc2NCYnTENHXz89SE1qQjsnNyMcGR4uKB0ZGRofHgFbPyMnNyo/Lyg3ISZpQzAdJiApHg4OGCrwHCMcDg0WQR8AAAACABwBBAEaAoQAFgAgAAASJjQ2MhYUBgcGDwEvAT4ENycGByYyNzY1NCYiBhRWOkpyQi0gQjUWBQsFEC0mKAoDKRUJOhwCIzsfAZ4+YUdLcFsaNxEIAxwCBhoeNR4DGgEwExIKKzIjPwAAAAACAB//+AFBAXkABwAPAAAkBiImNDYyFgYWMjY0JiIGAUFVg0pWgkrzN1ozOFoyaXFkrm9klUZBckdBAAABABv/+QDdAXkAIgAAEzczFwYHBhUUFjM3FwcmIwc3PgE9ATQmIwcnNz4GrwYBBRQEBg0RIAIHOCBbBB8aDxIhAwM1HxIODAgHAXgBDxIhcHkYEwIDJAIHIwIWG9EWDQMDIAcEAwICAQIAAAABABj/+QE0AXkAGwAAEzQiByMnPgEyFhQGBxczMjY/AQYPASYjByc3NrxqJQcKFEhUO0BQA1IgGggmDgUJljoqBkVfARAuPikiLi9MaV0FFiMEPjEGBQcZTXUAAAEAH//4AP4BeQAiAAA3FjI2NTQjLwE3NjU0JiMiByMnPgEyFhUUBxUWFRQGIyImJyUbQzdoBQQqNRgUJSMHCg5FRTJGV3E/GRUBOAglHToFIAkaKBMWHCULICodOyEFGEAuUxofAAAAAgAK//kBHgF5AA8AEwAANzMXBycXDwEnNjUnPwIXBzUjB+I3BQY2BAQ9BQSaAqwDJz4GWpgHLAJhBgcGOi8DIusBBtt9fQAAAQAY//gBAQGMABsAADYWFAYjIiYnNxYyNjU0LwE/Aj4BPwEPASYjB65KcUAYFQIGHUQ1fwYLBX0SEQUdEAZASAXhM19XGh8HCCcePQYHqAUEAQoOA1UGBU0AAAACAB7/+AEcAXkAFgAgAAA2FhQGIiY0Njc2PwEfAQ4EBxc2NxYmIgcGFRQWMjbiOkpyQi0gQjUWBgoFEC0mKAoDJxcuJTkdAiM7H98/YUdMcFsbNhIHBBsCBhofNB4EGwFaKhQQCysyIwAAAAABAB3/+QEYAXQAEgAAEzMXBg8BIy8BEwcOAQ8BNj8BFnuJFEVBEggxBpZhHxQGIAkDBCYBcRmKlUAODwEkBQIVIgRENQMDAAADACf/+AEgAXkAEAAaACMAADc0NyY1NDYyFhUUBxYUBiImNhYyNjQuAScGFTYGFB4BFzY0JidMQ0dfPz1ITWpCOyc3IxwZHi4oHRkZGh8eUD8jJzcqPy8oNyEmaUMwHSYgKR4ODhgq8BwjHA4NFkEfAAAAAAIAHP/5ARoBeQAWACAAADYmNDYyFhQGBwYPAS8BPgQ3JwYHJjI3NjU0JiIGFFY6SnJCLSBCNRYFCwUQLSYoCgMpFQk6HAIjOx+TPmFHS3BbGzYSBwMcAgYaHjUeAxoBMBMSCisyIz8AAgAeAVcBNgKHAB8AJgAAATI3FwYHIi8BBiMiJjQ/AjQmIyIPAS8BNjMyFhUHFCcGFBYyPwEBChIRCRwfOAUEMhUkMSR6AR0WKB4KBQlSHTEyDIMRFygcAgGQDQwwCjIBMDFPCh4UHSAXBwIhLy4miBs+BSMXFz4AAgAPAVgBPQMyABQAHAAAEyIHJz8BFwYHNjMyFhQGIyIvARE0ExYyNjQmIgcgBQoCA3MECwU+CzhDXEUuLwY9GkApKTsdAwICAxwTCg6+KkuFXgkGAXgj/o4LMl09GgAAAQAcAVcBBQKHABkAABMiJjQ2MzIfAQYPATU0JiMiFRQWMzI3HwEGpkBKV0IlKQILAiMZFUUpJR0oBQk5AVdOh1sNBSozAhQWGl00OxMBHC0AAAAAAgAcAVcBYQMyABwAJQAAATI3FwYHIi8BBiMiJjQ2MzIXNTQjBz8BFw4BFRQnJiIGFBYzMjcBNxARCRshNwYEQQw4Q11ECRwZEARxBQgMPRVEKSkgGSABkA0MLwsuASxKhF4CWiMCIBMJDOWNG7wMM1w8GgACABwBVwEWAocABwAbAAATNCMiBgc3NgcVHgEzMjcfAQYjIiY0NjMyFQ8B0i4bJARjDnMCLicmKAQJPStATVU+ZwQIAiwwJCEFASQILzUTARouToReZSIHAAAAAAEAHQFcAS8DMgAmAAATNDYzMh8BBg8BJiIGBxU3FwcmJwcUMzcXByYjBzc2PQEuAS8BPwFJVEcnIgIKCwcfSiABVQIHJC0CHScCBT0aTwQkARAYAwUnAoJRXwwIFhwCGDI4HgICJwEBsx8BAyQCAyEEIJ0PCQEEHAYAAAADACYAxwFHApUAJQAvADcAABMXNjcXBwYPARYUBiMiJwYVFDMyFhQGIiY1Njc1LgE1Njc1JjQ2FzI1NCYjIhUUFgYWMjY0JicGqkEdPAMIGRkDGkw6EhQWbChDZXE5EDAeJhAmMEk3NiIcNyIiIj4yKUofAocGAhIDKwMCAxxTQAUMDR0gUUcuKBQfBAQjGBIYAxprQrNBIidBIifNGCAmDgoYAAEAEQFZAVEDMgAvAAABBxQzNxcHJiMHNzY1NzQjIgcGFRQzNxcHJiMHNz4BNRE0JisBJz8BFwYHPgEzMhYBMQsVFQEGJxhGBCADLh4nAhUTAgYoGUQFEQ4LDg4DA3MFDAUROw4sMAI1lCABAyICBiIHHnM8Hlw1HwEDIgICIgEQEQE+Ew8CHBMKD8YPJSsAAAIAHgFYAK4DJQAHABwAABIGIiY0NjIWAzU0JiMHPwEXBhUUMzcXByYjBzc2kBokFRklFUkMDg8DbQUPFRQBBSgZSQQkAuoaFiYZFv6TkhMPAh8UCh7AHgEDIgIHIgcAAAIAEADGAIoDJQAQABgAABM1NCYjBz8BFwYRFAcnNz4BEgYiJjQ2MhZACg4SA20EDF4QARwTSholFRolFQF2vhMPAh8UChf+8F0zEAYbQAGzGhYmGRYAAAACABIBVgFJAzIAFwA2AAATBzU/ARcOARUUMzcXByYjBzc+ATURNCcXNCMnNxYzNxcHDgUHFxYfAQcGIycmLwE/ATYgDgJzBQgMFRQBBigZRAQWChSzIgIGKhxBAgUUGw8XChoDPCQjAgQjERUYGkUCRQ4DAQEJFhMKCueYHwEDIQIEIgMVHwErIQGrDQQZAQMDHQcUChYKGQNTMAEEGggDCClpDEEOAAABABIBWQCkAzIAFwAAEwc1PwEXDgEVFDM3FwcmIwc3PgE1ETQnIA4CcwUIDBUWAQYpGUYEFwoUAwEBCRYTCgrolx8BAyECBiEGFh4BKyEBAAEAHQFZAg8ChwBEAAABBxQzNxcHJiMHNzY/ATQjIg8BFDM3FwcmIwc3NjU3NCMiBwYUFjM3FwcmIwc3PgE9ATQmKwEnPwEXBgcXNjMyFzYzMhYB7goVFQEGKRhCAx4BAi8cJAgVFAEGJhlFBCACLh0lBgkMEwEGJxhHBRIPDhEIAgNpBQYBAUMWRRFAGysxAjWUIAEDIgIDIQUeczwbkyABAyICBiIHHnM8HIcdDgEDIgICIgIPEY4VEQMcEwYVFQIyNDQsAAAAAgAcAVcBNgKHAAcAEQAAAAYiJjQ2MhYGFjMyNTQmIyIVATZVfUhWfUfUKSFDKSFDAbJbT4ZbTnhBXjpBXgAAAAIAHADKAUsChwAhACoAADcnBzc+ATU3NTQmKwEnPwEXBgcXNjMyFhQGIycVFBYzNxcnFjI2NCYiBwawR0kEEwwDDhIIAgNpBQUCAzcNOUVfRiQKEBkBMxpBKSg5HgXNAQQhAhAYZLYVEQMcEwYTEgMsS4ReAj0bEwECoQoyXDsXVQAAAAIAHADMAUYCkAAZACIAABMiJjQ2MzIXNxcGERQWOwEXByMHNz4BPwEGNyYiBhQWMzI3lzhDXUQfIigGDQgNEQEESEoEGxABAj8/FUQpKSAYIQFYS4VeBhAHHf6yHREBIQIgAg4XcSz0DDNcPRsAAAABACABXAD+AocAJQAAEzU0JiMHJz8BFwYVFzYzHwEGDwE0JiMiBwYUFjM3FwcmIwc3PgFJCw8MAwJoBQYDLC0WAwoCIgcLGhgGDBAeAQYwHEoEEw0BrYIVEQEEGxQFIRwCQAIEOy4CHBMicB8NAQMkAgMiARMAAAABACEBVwDzAocAIgAAEyc2PwEWMzI2NCYnJjQ2MzIfAQYPATY1NCMiBhUUHgEUBiIkAwYCHgE6FR0bKkdHNyUfAggEHwEwExlnJklgAWcGHDcDRBIbFxQiWTULBSYqAgoEKxENGTImQTcAAAABABEBVwDTArUAGgAAExQzMjcXBiMiJj0BNCYvATc2NxcGBzcXBycGdikUGAg0Ei0nDxUEAyk3EAQDVAIGUwQBwzYKEy0lKZISDgEEGhMsBxMhAgInAkwAAQAWAVcBZgKHACQAAAEyNxcGByIvAQYjIjU3NCMHPwEXBhUUMzI3NTQmKwE/ARcGFRQBOhERCiMbOAYEPRJeBBYRBGkFES0ZKA0RDARuBRABkA0MNQUyAjNMkiACHxQKKI04HYgTDR4TCSKwGwAAAAEAAgFVATMChAAgAAATNCsBJzcWMzcHDgEPAiYnJi8BNxYzNxcHDgEVFBczNuIYFQIEJh44BQ4NC1Y9NxEKIAEEKBJSAgUVDS4FQgJSDQQdAQEgAg8Y2Aq5Mh4CAh4BBQQdAQcIEKatAAAAAAEABQFVAdsChAA2AAAANCsBJzcWMzcHDgEPAiYnIw8BJicmLwE3FjM3FwcOARUUFzM2Ny4BIyc3FjM3FwcOARUUFzMBihYVAgQkHjgFDQ4KVDwBLgY6PTYQCh8BBCYSUQIFFA0sBSQXBRESAQUlElACBRUMLAUCRBwEHAEBIAEQGNgKCKGfCrkyHwECHgEFBB0BBwgQplpIEQ8DHgEEAx4CBQgQpgAAAAEADAFbAT0CggA4AAATNC8BBhQfAQcmIwcnNzY/AScuAS8BNxYzNxcHIhUUHwE3NjQjJzczNxcHBg8BFxYfAQcmIwcnNzLICSo3GgEELA4tAgQUJjUtExsWAQQoHkkCBBsPHiISGQEDNTICBBgeNTUfIQEEKRRSAQQbAYUGDjlBFgEDGwMCBBoKLT0/GxMEAx0BAwQbDAcWKisXDwMbAgMcDCNBSCoEAhwBBAQaAAAAAf//AMYBNQKEACgAABMXMjUXBwYVFBczNjQrASc3FjI2MwcOAQ8BDgEjKgEmNTc2NyYnJiMnBjNYAgUiMgRCFRkBBCQsKwEFDg4GUi49KQEIIARSLSosDxoBAoABBQQdAQ8Smp4cAx0CASADDRHBak0lCAYFXH5qHAMAAAEAGgFcARgChQAYAAATJzcHDgEPATY/AR8CBgc3PgE/AQYVBycjCadDIRcDHQYBBFKPBmhFTxscBh4LCroBXRPuBAIWIAQ6KQQFAhGFaQYCIyYDPy4KBAADAGT/xQKrAgwAEQAqADYAAAE1IxEzNTQzMh0BMzU0JiMGIhczMh0BFBYzNzUGIyI9ATQ7ATUjIj0BIwcDIjURNDMhMhURFCMBCUpKGCtKLCI3CKoaCiwiPwwOKQo6OgoVWf9QUAGnUFABQXT+qLQMOIiyICkgCgqEICklGQQ5WgokChw4/oVQAadQUP5ZUAABAAAAAAHEAcQAAwAAMREhEQHEAcT+PAABAAAAAAJ9An0AAwAAMREhEQJ9An39gwACACr/9AD0AsgABwAeAAASBiImNDYyFgM1NCMHNzY3Fw4BFRQzNxcHJiMiBzc2wCIvGyIuHFglGQQyXgUJDiMjAgg0HC5CBDgCfCIcMCId/bP+NgQlBxYMFdd2OAIEKwMMKQ8AAQA2/9gCrgKFACwAACURNCMHJzcWMzI3Bw4BBwMHAgMjAxQWMzcXByYjIgc3NjcTNCYvATcWMzcWEwIsISYCCT0bLD4FIyABDh21vwUFDhEzAgk/HjA6BT0BDSUyAwg6HEOUvJEBlSsBBC0ECC4FHR39zg4BGQEO/lUWEgEELQQILgc4AbUfGgUFJQUE5v72AAAAAAAAHAFWAAEAAAAAAAAAewD4AAEAAAAAAAEACAGGAAEAAAAAAAIABwGfAAEAAAAAAAMAEQHLAAEAAAAAAAQACAHvAAEAAAAAAAUADQIUAAEAAAAAAAYAEAJEAAEAAAAAAAcALwK1AAEAAAAAAAgAFAMPAAEAAAAAAAkAFANOAAEAAAAAAAsAHAOdAAEAAAAAAAwAHAP0AAEAAAAAAA0AkAUzAAEAAAAAAA4AGgX6AAMAAQQJAAAA9gAAAAMAAQQJAAEAEAF0AAMAAQQJAAIADgGPAAMAAQQJAAMAIgGnAAMAAQQJAAQAEAHdAAMAAQQJAAUAGgH4AAMAAQQJAAYAIAIiAAMAAQQJAAcAXgJVAAMAAQQJAAgAKALlAAMAAQQJAAkAKAMkAAMAAQQJAAsAOANjAAMAAQQJAAwAOAO6AAMAAQQJAA0BIAQRAAMAAQQJAA4ANAXEAEMAbwBwAHkAcgBpAGcAaAB0ACAAKABjACkAIAAyADAAMQAxACwAIABKAHUAYQBuACAAUABhAGIAbABvACAAZABlAGwAIABQAGUAcgBhAGwAIAAoAGoAdQBhAG4AQABoAHUAZQByAHQAYQB0AGkAcABvAGcAcgBhAGYAaQBjAGEALgBjAG8AbQAuAGEAcgApACwAIAB3AGkAdABoACAAUgBlAHMAZQByAHYAZQBkACAARgBvAG4AdAAgAE4AYQBtAGUAcwAgACIAQQBsAGUAZwByAGUAeQBhACIAIAAiAEEAbABlAGcAcgBlAHkAYQAgAFMAQwAiAABDb3B5cmlnaHQgKGMpIDIwMTEsIEp1YW4gUGFibG8gZGVsIFBlcmFsIChqdWFuQGh1ZXJ0YXRpcG9ncmFmaWNhLmNvbS5hciksIHdpdGggUmVzZXJ2ZWQgRm9udCBOYW1lcyAiQWxlZ3JleWEiICJBbGVncmV5YSBTQyIAAEEAbABlAGcAcgBlAHkAYQAAQWxlZ3JleWEAAFIAZQBnAHUAbABhAHIAAFJlZ3VsYXIAAEYATwBOAFQATABBAEIAOgBPAFQARgBFAFgAUABPAFIAVAAARk9OVExBQjpPVEZFWFBPUlQAAEEAbABlAGcAcgBlAHkAYQAAQWxlZ3JleWEAAFYAZQByAHMAaQBvAG4AIAAxAC4AMAAwADMAAFZlcnNpb24gMS4wMDMAAEEAbABlAGcAcgBlAHkAYQAtAFIAZQBnAHUAbABhAHIAAEFsZWdyZXlhLVJlZ3VsYXIAAEEAbABlAGcAcgBlAHkAYQAgAGkAcwAgAGEAIAB0AHIAYQBkAGUAbQBhAHIAawAgAG8AZgAgAEoAdQBhAG4AIABQAGEAYgBsAG8AIABkAGUAbAAgAFAAZQByAGEAbAAAQWxlZ3JleWEgaXMgYSB0cmFkZW1hcmsgb2YgSnVhbiBQYWJsbyBkZWwgUGVyYWwAAEoAdQBhAG4AIABQAGEAYgBsAG8AIABkAGUAbAAgAFAAZQByAGEAbAAASnVhbiBQYWJsbyBkZWwgUGVyYWwAAEoAdQBhAG4AIABQAGEAYgBsAG8AIABkAGUAbAAgAFAAZQByAGEAbAAASnVhbiBQYWJsbyBkZWwgUGVyYWwAAHcAdwB3AC4AaAB1AGUAcgB0AGEAdABpAHAAbwBnAHIAYQBmAGkAYwBhAC4AYwBvAG0ALgBhAHIAAHd3dy5odWVydGF0aXBvZ3JhZmljYS5jb20uYXIAAHcAdwB3AC4AaAB1AGUAcgB0AGEAdABpAHAAbwBnAHIAYQBmAGkAYwBhAC4AYwBvAG0ALgBhAHIAAHd3dy5odWVydGF0aXBvZ3JhZmljYS5jb20uYXIAAFQAaABpAHMAIABGAG8AbgB0ACAAUwBvAGYAdAB3AGEAcgBlACAAaQBzACAAbABpAGMAZQBuAHMAZQBkACAAdQBuAGQAZQByACAAdABoAGUAIABTAEkATAAgAE8AcABlAG4AIABGAG8AbgB0ACAATABpAGMAZQBuAHMAZQAsACAAVgBlAHIAcwBpAG8AbgAgADEALgAxAC4AIABUAGgAaQBzACAAbABpAGMAZQBuAHMAZQAgAGkAcwAgAGEAdgBhAGkAbABhAGIAbABlACAAdwBpAHQAaAAgAGEAIABGAEEAUQAgAGEAdAA6ACAAaAB0AHQAcAA6AC8ALwBzAGMAcgBpAHAAdABzAC4AcwBpAGwALgBvAHIAZwAvAE8ARgBMAABUaGlzIEZvbnQgU29mdHdhcmUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIFNJTCBPcGVuIEZvbnQgTGljZW5zZSwgVmVyc2lvbiAxLjEuIFRoaXMgbGljZW5zZSBpcyBhdmFpbGFibGUgd2l0aCBhIEZBUSBhdDogaHR0cDovL3NjcmlwdHMuc2lsLm9yZy9PRkwAAGgAdAB0AHAAOgAvAC8AcwBjAHIAaQBwAHQAcwAuAHMAaQBsAC4AbwByAGcALwBPAEYATAAAaHR0cDovL3NjcmlwdHMuc2lsLm9yZy9PRkwAAAACAAAAAAAA/6kAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAfYAAAABAAIAAwAEAAUABgAHAAgACQAKAAsADAANAA4ADwAQABEAEgATABQAFQAWABcAGAAZABoAGwAcAB0AHgAfACAAIQAiACMAJAAlACYAJwAoACkAKgArACwALQAuAC8AMAAxADIAMwA0ADUANgA3ADgAOQA6ADsAPAA9AD4APwBAAEEAQgBDAEQARQBGAEcASABJAEoASwBMAE0ATgBPAFAAUQBSAFMAVABVAFYAVwBYAFkAWgBbAFwAXQBeAF8AYABhAQIAowCEAIUAvQCWAOgAhgCOAIsAnQCpAKQAigDaAIMAkwEDAQQAjQCXAIgAwwDeAQUAngCqAPUA9AD2AKIArQDJAMcArgBiAGMAkABkAMsAZQDIAMoAzwDMAM0AzgDpAGYA0wDQANEArwBnAPAAkQDWANQA1QBoAOsA7QCJAGoAaQBrAG0AbABuAKAAbwBxAHAAcgBzAHUAdAB2AHcA6gB4AHoAeQB7AH0AfAC4AKEAfwB+AIAAgQDsAO4AugEGAQcBCAEJAQoBCwD9AP4BDAENAQ4BDwD/AQABEAERARIBAQETARQBFQEWARcBGAEZARoBGwEcAR0BHgD4APkBHwEgASEBIgEjASQBJQEmAScBKAEpASoBKwEsAS0BLgD6ANcBLwEwATEBMgEzATQBNQE2ATcBOAE5AToBOwE8AT0A4gDjAT4BPwFAAUEBQgFDAUQBRQFGAUcBSAFJAUoBSwCwALEBTAFNAU4BTwFQAVEBUgFTAVQBVQD7APwA5ADlAVYBVwFYAVkBWgFbAVwBXQFeAV8BYAFhAWIBYwFkAWUBZgFnAWgBaQFqAWsAuwFsAW0BbgFvAOYA5wCmAXABcQFyAXMBdAF1AXYBdwF4AXkBegDYAOEA2wDcAN0A4ADZAN8BewCoAJ8AmwF8AX0BfgF/AYABgQGCAYMAsgCzALYAtwDEALQAtQDFAIIAwgCHAYQBhQCrAMYAvgC/ALwBhgGHAYgBiQGKAYsBjAGNAY4BjwGQAZEBkgGTAZQBlQGWAZcA9wGYAIwBmQCYAJoAmQDvAKUAkgCcAKcAjwCUAJUAuQDAAMEBmgGbAZwBnQGeAZ8BoAGhAaIBowGkAaUBpgGnAagBqQGqAasBrAGtAa4BrwGwAbEBsgGzAbQBtQG2AbcBuAG5AboBuwG8Ab0BvgG/AcABwQHCAcMBxAHFAcYBxwHIAckBygHLAcwBzQHOAc8B0AHRAdIB0wHUAdUB1gHXAdgB2QHaAdsB3AHdAd4B3wHgAeEB4gHjAeQB5QHmAecB6AHpAeoB6wHsAe0B7gHvAfAB8QHyAfMB9AH1AfYB9wH4AfkB+gduYnNwYWNlCHR3by5zdXBzCnRocmVlLnN1cHMIb25lLnN1cHMHQW1hY3JvbgdhbWFjcm9uBkFicmV2ZQZhYnJldmUHQW9nb25lawdhb2dvbmVrC0NjaXJjdW1mbGV4C2NjaXJjdW1mbGV4CkNkb3RhY2NlbnQKY2RvdGFjY2VudAZEY2Fyb24GZGNhcm9uBkRjcm9hdAdFbWFjcm9uB2VtYWNyb24GRWJyZXZlBmVicmV2ZQpFZG90YWNjZW50CmVkb3RhY2NlbnQHRW9nb25lawdlb2dvbmVrBkVjYXJvbgZlY2Fyb24LR2NpcmN1bWZsZXgLZ2NpcmN1bWZsZXgKR2RvdGFjY2VudApnZG90YWNjZW50DEdjb21tYWFjY2VudAxnY29tbWFhY2NlbnQLSGNpcmN1bWZsZXgLaGNpcmN1bWZsZXgESGJhcgRoYmFyBkl0aWxkZQZpdGlsZGUHSW1hY3JvbgdpbWFjcm9uBklicmV2ZQZpYnJldmUHSW9nb25lawdpb2dvbmVrAklKAmlqC0pjaXJjdW1mbGV4C2pjaXJjdW1mbGV4DEtjb21tYWFjY2VudAxrY29tbWFhY2NlbnQMa2dyZWVubGFuZGljBkxhY3V0ZQZsYWN1dGUMTGNvbW1hYWNjZW50DGxjb21tYWFjY2VudAZMY2Fyb24GbGNhcm9uBExkb3QEbGRvdAZOYWN1dGUGbmFjdXRlDE5jb21tYWFjY2VudAxuY29tbWFhY2NlbnQGTmNhcm9uBm5jYXJvbgNFbmcDZW5nB09tYWNyb24Hb21hY3JvbgZPYnJldmUGb2JyZXZlDU9odW5nYXJ1bWxhdXQNb2h1bmdhcnVtbGF1dAZSYWN1dGUGcmFjdXRlDFJjb21tYWFjY2VudAxyY29tbWFhY2NlbnQGUmNhcm9uBnJjYXJvbgZTYWN1dGUGc2FjdXRlC1NjaXJjdW1mbGV4C3NjaXJjdW1mbGV4CFRjZWRpbGxhCHRjZWRpbGxhBlRjYXJvbgZ0Y2Fyb24EVGJhcgR0YmFyBlV0aWxkZQZ1dGlsZGUHVW1hY3Jvbgd1bWFjcm9uBlVicmV2ZQZ1YnJldmUFVXJpbmcFdXJpbmcNVWh1bmdhcnVtbGF1dA11aHVuZ2FydW1sYXV0B1VvZ29uZWsHdW9nb25lawtXY2lyY3VtZmxleAt3Y2lyY3VtZmxleAtZY2lyY3VtZmxleAt5Y2lyY3VtZmxleAZaYWN1dGUGemFjdXRlClpkb3RhY2NlbnQKemRvdGFjY2VudApBcmluZ2FjdXRlCmFyaW5nYWN1dGUHQUVhY3V0ZQdhZWFjdXRlC09zbGFzaGFjdXRlC29zbGFzaGFjdXRlDFNjb21tYWFjY2VudAxzY29tbWFhY2NlbnQHdW5pMDIxQQd1bmkwMjFCCGRvdGxlc3NqDGRvdGJlbG93Y29tYgZXZ3JhdmUGd2dyYXZlBldhY3V0ZQZ3YWN1dGUJV2RpZXJlc2lzCXdkaWVyZXNpcwZZZ3JhdmUGeWdyYXZlDm9uZWRvdGVubGVhZGVyDnR3b2RvdGVubGVhZGVyCXplcm8uc3Vwcwlmb3VyLnN1cHMJZml2ZS5zdXBzCHNpeC5zdXBzCnNldmVuLnN1cHMKZWlnaHQuc3VwcwluaW5lLnN1cHMGbi5zdXBzCXplcm8uc2luZghvbmUuc2luZgh0d28uc2luZgp0aHJlZS5zaW5mCWZvdXIuc2luZglmaXZlLnNpbmYIc2l4LnNpbmYKc2V2ZW4uc2luZgplaWdodC5zaW5mCW5pbmUuc2luZgRFdXJvCWVzdGltYXRlZAlhY3V0ZS5jYXAJYnJldmUuY2FwDmNpcmN1bWZsZXguY2FwDGRpZXJlc2lzLmNhcAlncmF2ZS5jYXAKbWFjcm9uLmNhcAhyaW5nLmNhcAl0aWxkZS5jYXAJY2Fyb24uY2FwDWRvdGFjY2VudC5jYXALY29tbWFhY2NlbnQQaHVuZ2FydW1sYXV0LmNhcANmLmYDZi5sA2YudAd6ZXJvLmxmBm9uZS5sZgZ0d28ubGYIdGhyZWUubGYHZm91ci5sZgdmaXZlLmxmBnNpeC5sZghzZXZlbi5sZghlaWdodC5sZgduaW5lLmxmB3plcm8udGYGb25lLnRmBnR3by50Zgh0aHJlZS50Zgdmb3VyLnRmB2ZpdmUudGYGc2l4LnRmCHNldmVuLnRmCGVpZ2h0LnRmB25pbmUudGYJemVyby50b3NmCG9uZS50b3NmCHR3by50b3NmCnRocmVlLnRvc2YJZm91ci50b3NmCWZpdmUudG9zZghzaXgudG9zZgpzZXZlbi50b3NmCmVpZ2h0LnRvc2YJbmluZS50b3NmCWNhcm9uLmFsdAJmagl6ZXJvLm51bXIIb25lLm51bXIIdHdvLm51bXIKdGhyZWUubnVtcglmb3VyLm51bXIJZml2ZS5udW1yCHNpeC5udW1yCnNldmVuLm51bXIKZWlnaHQubnVtcgluaW5lLm51bXIJemVyby5kbm9tCG9uZS5kbm9tCHR3by5kbm9tCnRocmVlLmRub20JZm91ci5kbm9tCWZpdmUuZG5vbQhzaXguZG5vbQpzZXZlbi5kbm9tCmVpZ2h0LmRub20JbmluZS5kbm9tBmEuc3VwcwZiLnN1cHMGYy5zdXBzBmQuc3VwcwZlLnN1cHMGZi5zdXBzBmcuc3VwcwZoLnN1cHMGaS5zdXBzBmouc3VwcwZrLnN1cHMGbC5zdXBzBm0uc3VwcwZvLnN1cHMGcC5zdXBzBnEuc3VwcwZyLnN1cHMGcy5zdXBzBnQuc3VwcwZ1LnN1cHMGdi5zdXBzBncuc3VwcwZ4LnN1cHMGeS5zdXBzBnouc3Vwcwtmb3VuZHJ5aWNvbgdzcXVhcmUxB3NxdWFyZTIKaWRvdGFjY2VudAROLnNjAAABAAH//wAPAAAAAQAAAADJiW8xAAAAAMsqYG0AAAAAyypicgABAAAADgAAABgAAAAAAAIAAQADAfUAAQAEAAAAAgAAAAEAAAAKAB4ALAABREZMVAAIAAQAAAAA//8AAQAAAAFrZXJuAAgAAAABAAAAAQAEAAIAAAABAAgAAQAmAAEAAAABAAwABgHPAAAB0AAAAdEAAAHSAAAB1AAAAdUAAAABAAEBcAABAAAACgAcAB4AAURGTFQACAAEAAAAAP//AAAAAAAAAAAAAQAAAAA=);\n}\n\n@font-face {\n  font-family: 'Alegreya';\n  font-weight: bold;\n  src: url(data:font/ttf;base64,AAEAAAARAQAABAAQRFNJRwAAAAEAARgUAAAACEZGVE1f3jIEAAEXVAAAABxHREVGAiIABgABF3AAAAAgR1BPU7AAy4EAAReQAAAAZEdTVUJEdkx1AAEX9AAAACBPUy8yrpt8NgAAAZgAAABgY21hcGT6PjMAAAnMAAADpmdhc3AAAAAQAAEXTAAAAAhnbHlmF7DXcAAAEWgAAPHEaGVhZPi6CR8AAAEcAAAANmhoZWEHQAPuAAABVAAAACRobXR4sg0sMgAAAfgAAAfUbG9jYUhIhG4AAA18AAAD7G1heHACPgBXAAABeAAAACBuYW1l/JuNkQABAywAAAdocG9zdLlS298AAQqUAAAMuHByZXBoBoyFAAANdAAAAAcAAQAAAAEAxTSwPKdfDzz1AAsD6AAAAADLKmJxAAAAAMsqYnH/M/7CBBID0QABAAgAAgAAAAAAAAABAAAD+P6nAAAEGP8z/zkEEgABAAAAAAAAAAAAAAAAAAAB9QABAAAB9QBUAAcAAAAAAAIAAAABAAEAAABAAAAAAAAAAAIBnAK8AAUAAAK8AooAAACMArwCigAAAd0AMgD6AQICAAUDBQAAAgAEoAAA70AAIEsAAAAAAAAAAHB5cnMAIAAg+wID+P6nAAAD+AFZIAAAkwAAAAAAqAKOAAAAIAACAK4AAAAAAAABTQAAAK4AAAEdADIBQQArAg4ACQHSACICyQASAtAAKQCwACsBNQBGATUADwGcACkB+gARAO4ABAFEACMA7gApAUkAFAH1ABoBbQAVAeQADwGvAAsB1AACAasAAQHQABwBqwAZAd8AJgHQABgA7gAnAO4ABAHWABwB+gARAdYAJwFyADEDXwAYAnH/9AJ1ACQCaQAcArUAJgJVACQCFAAkAo4AHALrACUBbQAkAU0ACgKTACUCEwAqA0kAGwLZACICogAcAkEAJwKnABwCgwAkAhwAJAI5AAUCjwASAnH/+QPE//oCqgAHAlb/9gJEABMBPQBRAUkADAE9AA4B6QAgAcX/9wGOAEEB3wAbAgL//gGwABkCGQAZAc8AGQFWABgCAAAnAiAAAgElABkBEgAHAgcAAwEJAAMDRwAYAjoAGAH3ABkCGgAWAgUAGQGdABsBmQAdAUwABAIjAA8B1P/1AuT/+AHxAAEB0f/pAcoAFAFBACwBTgB0AUEACwH6ABsArgAAAR0AMgGwABkCBgAbAbwADQI4ABUBTgB0AfQAHAGOAC4CuAArAVUAFwHDAA8B+gARAdQAHgGOADIBLgAVAfoAEQFgABYBNgAWAY4AcwIUACQCNwAYAO4AKQGOAFkBCQAUAWIAFwHDACkC+gAUAxgAFAL6ABYBcgAKAnH/9AJx//QCcf/0AnH/9AJx//QCcf/0A2f//AJpABwCVQAkAlUAJAJVACQCVQAkAW0AEgFtACQBbQATAW0AIQLFAAgC2QAiAqIAHAKiABwCogAcAqIAHAKiABwB+gA0AqIAHAKPABICjwASAo8AEgKPABICVv/2Aj0AJAJ/ABgB3wAbAd8AGwHfABsB3wAbAd8AGwHfABsCngASAbAAGQHPABkBzwAZAc8AGQHPABkBJQALASUAGQEl//gBJf/+AfwAHQI6ABgB9wAZAfcAGQH3ABkB9wAZAfcAGQH6ABEB9wAYAiMADwIjAA8CIwAPAiMADwHR/+kCAQAAAdH/6QJx//QB3wAbAnH/9AHfABsCcf/0Ad8AGwJpABwBsAAZAmkAHAGwABkCaQAcAbAAGQJpABwBsAAZArUAJgJeABkCxQAIAhkAGQJVACQBzwAZAlUAJAHPABkCVQAkAc8AGQJVACQBzwAZAlUAJAHPABkCjgAcAgAAJwKOABwCAAAnAo4AHAIAACcCjgAcAgAAJwLrACUCIP/kAukAEwIj//MBbQAGASX/3wFtACQBJQAIAW0AJAElAAEBbQAkASUAGQFtACQBJQAZAroAJAI4ABkBTQAKARL/6AKTACUCBwADAhkAGAITACoBCQADAhMAKgEJAAMCGQAqAWwAAwIqACoBigADAjYAJwEo//8C2QAiAjoAGALZACICOgAYAtkAIgI6ABgC1wAkAiQAGAKiABwB9wAZAqIAHAH3ABkCogAcAfcAGQOsAB0DAwAZAoMAJAGdABsCgwAkAZ0AGwKDACQBnf/0AhwARAGZAB0CHAAkAZkAHQIcAEQBmQAdAhwARAGZAB0COQAFAUwABAI5AAUBtgAEAjkABQFbAAYCjwASAiMADwKPABICIwAPAo8AEgIjAA8CjwASAiMADwKPABICIwAPAo8AEgIjAA8DxP/6AuT/+AJW//YB0f/pAlb/9gJEABMBygAUAkQAEwHKABQCRAATAcoAFAGg/9kCcf/0Ad8AGwNn//wCngASAqIAHAH3ABgCHABEAZkAHQI5AAUBTAAEARIABwGOACUBjgAhAY4AMwGOAHwBjgBqAY4AVQGOABMBjgAxAUEAUwJcAAoDWQAYAm3/9APE//oC5P/4A8T/+gLk//gDxP/6AuT/+AJW//YB0f/pAcX/9wNs//cA2gAcANoABgDuAAQBkgAcAZIABgGlAAwCAAAoAgAAKAFUADIA7gApAcoAKQKlACkEGAASAQkADwEJACkAm/8zAWEAHQFRAAkBMQARAUkAGAEwABYBUAAeAUkAFgGQABUBYQAdAQkAFAFgABYBNgAWAVEACQExABEBSQAYATAAFgFQAB4BSQAWAdgAKQI9AAUCOAABAx0AKAH9AB0CyQAkAjb//wH6ABEB+f/8AgMADAGp/+sB+gAcAfoADwHpABkB6QAXAgsAMgJvABgCXwAYAY4AYgGOADMBjgAgAY4ALgGOACcBjgAyAY4AagGOABQBjgAgAY4AfAGOAFUBjgA3AUYAGAFWABgBUQAYAgEAIAFuABYB7gAUAbMAGwHVAAABrAASAdAAHAGqABkB3wAmAdAAGAHHABMBxwAyAccACwHHACEBx//9AccAGQHHABoBxwAhAccAIAHHABcBvQANAb0ALgG9AAYBvQAPAb3//QG9AAYBvQAXAb0AHgG9AB0BvQAUAY4AkgJkABgBYQAdAQkAFAFgABYBNgAWAVEACQExABEBSQAYATAAFgFQAB4BSQAWAWEAHQEJABQBYAAWATYAFgFRAAkBMQARAUkAGAEwABYBUAAeAUkAFgFVABcBagABATQAFwF3ABcBSwAXAPkAFAFpACABfwAFANgAFQDQAAwBcgAFAMkABQJCABUBYgAXAXsAEgFqABcBLgAWASQAFgDwAAcBgAAPAVAAAgIIAAMBYwAIAU7/9gFCABEDDwBkAc4AAAKCAAABJQAZAAAAAwAAAAMAAAAcAAEAAAAAAZwAAwABAAAAHAAEAYAAAABcAEAABQAcAH4ArAFIAX4BkgH/AhsCNwLHAt0DIwOUA6kDvAPAHoUe8yAUIBogHiAiICYgMCA6IEQgcCB5IIkgoyCsISIhJiEuIgIiBiIPIhIiGiIeIisiSCJgImUlyvsC//8AAAAgAKAArgFKAZIB+gIYAjcCxgLYAyMDlAOpA7wDwB6AHvIgEyAYIBwgICAkIDAgOSBEIHAgdCB/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AD0APgA/AEAAQQBCAEMARABFAEYARwBIAEkASgBLAEwATQBOAE8AUABRAFIAUwBUAFUAVgBXAFgAWQBaAFsAXABdAF4AXwBgAGEBAgCjAIQAhQC9AJYA6ACGAI4AiwCdAKkApACKANoAgwCTAQMBBACNAJcAiADDAN4BBQCeAKoA9QD0APYAogCtAMkAxwCuAGIAYwCQAGQAywBlAMgAygDPAMwAzQDOAOkAZgDTANAA0QCvAGcA8ACRANYA1ADVAGgA6wDtAIkAagBpAGsAbQBsAG4AoABvAHEAcAByAHMAdQB0AHYAdwDqAHgAegB5AHsAfQB8ALgAoQB/AH4AgACBAOwA7gC6AQYBBwEIAQkBCgELAP0A/gEMAQ0BDgEPAP8BAAEQAREBEgEBARMBFAEVARYBFwEYARkBGgEbARwBHQEeAPgA+QEfASABIQEiASMBJAElASYBJwEoASkBKgErASwBLQEuAPoA1wEvATABMQEyATMBNAE1ATYBNwE4ATkBOgE7ATwBPQDiAOMBPgE/AUABQQFCAUMBRAFFAUYBRwFIAUkBSgFLALAAsQFMAU0BTgFPAVABUQFSAVMBVAFVAPsA/ADkAOUBVgFXAVgBWQFaAVsBXAFdAV4BXwFgAWEBYgFjAWQBZQFmAWcBaAFpAWoBawC7AWwBbQFuAW8A5gDnAKYBcAFxAXIBcwF0AXUBdgF3AXgBeQF6ANgA4QDbANwA3QDgANkA3wF7AKgAnwCbAXwBfQF+AX8BgAGBAYIBgwCyALMAtgC3AMQAtAC1AMUAggDCAIcBhAGFAKsAxgC+AL8AvAGGAYcBiAGJAYoBiwGMAY0BjgGPAZABkQGSAZMBlAGVAZYBlwD3AZgAjAGZAJgAmgCZAO8ApQCSAJwApwCPAJQAlQC5AMAAwQGaAZsBnAGdAZ4BnwGgAaEBogGjAaQBpQGmAacBqAGpAaoBqwGsAa0BrgGvAbABsQGyAbMBtAG1AbYBtwG4AbkBugG7AbwBvQG+Ab8BwAHBAcIBwwHEAcUBxgHHAcgByQHKAcsBzAHNAc4BzwHQAdEB0gHTAdQB1QHWAdcB2AHZAdoB2wHcAd0B3gHfAeAB4QHiAeMB5AHlAeYB5wHoAekB6gHrAewB7QHuAe8B8AHxAfIB8wH0AfUB9gH3AfgB+QduYnNwYWNlCHR3by5zdXBzCnRocmVlLnN1cHMIb25lLnN1cHMHQW1hY3JvbgdhbWFjcm9uBkFicmV2ZQZhYnJldmUHQW9nb25lawdhb2dvbmVrC0NjaXJjdW1mbGV4C2NjaXJjdW1mbGV4CkNkb3RhY2NlbnQKY2RvdGFjY2VudAZEY2Fyb24GZGNhcm9uBkRjcm9hdAdFbWFjcm9uB2VtYWNyb24GRWJyZXZlBmVicmV2ZQpFZG90YWNjZW50CmVkb3RhY2NlbnQHRW9nb25lawdlb2dvbmVrBkVjYXJvbgZlY2Fyb24LR2NpcmN1bWZsZXgLZ2NpcmN1bWZsZXgKR2RvdGFjY2VudApnZG90YWNjZW50DEdjb21tYWFjY2VudAxnY29tbWFhY2NlbnQLSGNpcmN1bWZsZXgLaGNpcmN1bWZsZXgESGJhcgRoYmFyBkl0aWxkZQZpdGlsZGUHSW1hY3JvbgdpbWFjcm9uBklicmV2ZQZpYnJldmUHSW9nb25lawdpb2dvbmVrAklKAmlqC0pjaXJjdW1mbGV4C2pjaXJjdW1mbGV4DEtjb21tYWFjY2VudAxrY29tbWFhY2NlbnQMa2dyZWVubGFuZGljBkxhY3V0ZQZsYWN1dGUMTGNvbW1hYWNjZW50DGxjb21tYWFjY2VudAZMY2Fyb24GbGNhcm9uBExkb3QEbGRvdAZOYWN1dGUGbmFjdXRlDE5jb21tYWFjY2VudAxuY29tbWFhY2NlbnQGTmNhcm9uBm5jYXJvbgNFbmcDZW5nB09tYWNyb24Hb21hY3JvbgZPYnJldmUGb2JyZXZlDU9odW5nYXJ1bWxhdXQNb2h1bmdhcnVtbGF1dAZSYWN1dGUGcmFjdXRlDFJjb21tYWFjY2VudAxyY29tbWFhY2NlbnQGUmNhcm9uBnJjYXJvbgZTYWN1dGUGc2FjdXRlC1NjaXJjdW1mbGV4C3NjaXJjdW1mbGV4CFRjZWRpbGxhCHRjZWRpbGxhBlRjYXJvbgZ0Y2Fyb24EVGJhcgR0YmFyBlV0aWxkZQZ1dGlsZGUHVW1hY3Jvbgd1bWFjcm9uBlVicmV2ZQZ1YnJldmUFVXJpbmcFdXJpbmcNVWh1bmdhcnVtbGF1dA11aHVuZ2FydW1sYXV0B1VvZ29uZWsHdW9nb25lawtXY2lyY3VtZmxleAt3Y2lyY3VtZmxleAtZY2lyY3VtZmxleAt5Y2lyY3VtZmxleAZaYWN1dGUGemFjdXRlClpkb3RhY2NlbnQKemRvdGFjY2VudApBcmluZ2FjdXRlCmFyaW5nYWN1dGUHQUVhY3V0ZQdhZWFjdXRlC09zbGFzaGFjdXRlC29zbGFzaGFjdXRlDFNjb21tYWFjY2VudAxzY29tbWFhY2NlbnQHdW5pMDIxQQd1bmkwMjFCCGRvdGxlc3NqDGRvdGJlbG93Y29tYgZXZ3JhdmUGd2dyYXZlBldhY3V0ZQZ3YWN1dGUJV2RpZXJlc2lzCXdkaWVyZXNpcwZZZ3JhdmUGeWdyYXZlDm9uZWRvdGVubGVhZGVyDnR3b2RvdGVubGVhZGVyCXplcm8uc3Vwcwlmb3VyLnN1cHMJZml2ZS5zdXBzCHNpeC5zdXBzCnNldmVuLnN1cHMKZWlnaHQuc3VwcwluaW5lLnN1cHMGbi5zdXBzCXplcm8uc2luZghvbmUuc2luZgh0d28uc2luZgp0aHJlZS5zaW5mCWZvdXIuc2luZglmaXZlLnNpbmYIc2l4LnNpbmYKc2V2ZW4uc2luZgplaWdodC5zaW5mCW5pbmUuc2luZgRFdXJvCWVzdGltYXRlZAlhY3V0ZS5jYXAJYnJldmUuY2FwDmNpcmN1bWZsZXguY2FwDGRpZXJlc2lzLmNhcAlncmF2ZS5jYXAKbWFjcm9uLmNhcAhyaW5nLmNhcAl0aWxkZS5jYXAJY2Fyb24uY2FwDWRvdGFjY2VudC5jYXALY29tbWFhY2NlbnQQaHVuZ2FydW1sYXV0LmNhcANmLmYDZi5sA2YudAd6ZXJvLmxmBm9uZS5sZgZ0d28ubGYIdGhyZWUubGYHZm91ci5sZgdmaXZlLmxmBnNpeC5sZghzZXZlbi5sZghlaWdodC5sZgduaW5lLmxmB3plcm8udGYGb25lLnRmBnR3by50Zgh0aHJlZS50Zgdmb3VyLnRmB2ZpdmUudGYGc2l4LnRmCHNldmVuLnRmCGVpZ2h0LnRmB25pbmUudGYJemVyby50b3NmCG9uZS50b3NmCHR3by50b3NmCnRocmVlLnRvc2YJZm91ci50b3NmCWZpdmUudG9zZghzaXgudG9zZgpzZXZlbi50b3NmCmVpZ2h0LnRvc2YJbmluZS50b3NmCWNhcm9uLmFsdAJmagl6ZXJvLm51bXIIb25lLm51bXIIdHdvLm51bXIKdGhyZWUubnVtcglmb3VyLm51bXIJZml2ZS5udW1yCHNpeC5udW1yCnNldmVuLm51bXIKZWlnaHQubnVtcgluaW5lLm51bXIJemVyby5kbm9tCG9uZS5kbm9tCHR3by5kbm9tCnRocmVlLmRub20JZm91ci5kbm9tCWZpdmUuZG5vbQhzaXguZG5vbQpzZXZlbi5kbm9tCmVpZ2h0LmRub20JbmluZS5kbm9tBmEuc3VwcwZiLnN1cHMGYy5zdXBzBmQuc3VwcwZlLnN1cHMGZi5zdXBzBmcuc3VwcwZoLnN1cHMGaS5zdXBzBmouc3VwcwZrLnN1cHMGbC5zdXBzBm0uc3VwcwZvLnN1cHMGcC5zdXBzBnEuc3VwcwZyLnN1cHMGcy5zdXBzBnQuc3VwcwZ1LnN1cHMGdi5zdXBzBncuc3VwcwZ4LnN1cHMGeS5zdXBzBnouc3Vwcwtmb3VuZHJ5aWNvbgdzcXVhcmUxB3NxdWFyZTIKaWRvdGFjY2VudAABAAH//wAPAAAAAQAAAADJiW8xAAAAAMsqYGEAAAAAyypicQABAAAADgAAABgAAAAAAAIAAQADAfQAAQAEAAAAAgAAAAEAAAAKAB4ALAABREZMVAAIAAQAAAAA//8AAQAAAAFrZXJuAAgAAAABAAAAAQAEAAIAAAABAAgAAQAmAAEAAAABAAwABgHPAAAB0AAAAdEAAAHSAAAB1AAAAdUAAAABAAEBcAABAAAACgAcAB4AAURGTFQACAAEAAAAAP//AAAAAAAAAAAAAQAAAAA=);\n}\n\n/* for cyrillic text */\n@font-face {\n  font-family: 'Gregor';\n  font-weight: normal;\n  src: url(data:font/otf;base64,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AOQA4gDhAMAA4AFMAN8A3QDeANwAuwDaANsA2QC9ARMA2ADWANcA1QDUAL4ApQEUANIA0QDTAL8BFQC8AU8BUAD0AOUBUQFSAW8BVQFTAVQBcQFXAXIBWAFuAWUBbAFmAW0BZAF4AWcBjgFzAXUBdAF2AWMBhwGGAYsBigGJAYgBFgEXAYMBWQGFAYQBggF3AYwBaQGNAWEBSAFNAXwBYAF6AV8BewFoAX0BXgEZARgBfgFdAWsBXAF/AVsBgQFaAYABagDuAXABVgF5AWIBGgERAMQAzADHALgAyADLAMUAygEyAUMBJAE2ATMBLAErAS8BPQE/ATgBJwEjAToBLQFBASUBKQE0ASgBKgEuAT4BQAExASYBMAE7ATcBNQCiAKMAuQCgAKEApACvAM8ArQC0ALMBBAAAAXcAFAIpAC0CMwBLAiYAEwI/AEsCNAAyAfsAFAJWADwCGQAUAR0AWgEsADUCRwAtAkQAHgJHAC0BmgAUAoT/8QKLACMCbAAtAtcAIwKUACMCXQAjAq4AMgL/ACMBXwAjAWMAFAKsACMCPwAjA50AIwLbACMC3AA3AkcAIwLZADcClAAjAlkANwJsAAoCrQAFAoD/9gOR//YChwAFAlv/9gJZACgBFABVAbgACgEUAB4CZgBkAhUAAAD/ABQCCgAjAigACgHgAC0CRwAtAhUALQFlACMCBwAYAmEAIwEhACMBMQAoAkUAIwEbACMDlwAeAmAAHgJEAC0CRAAeAjsALQGxACMBvwAyAW4AGQJaAA8CL//9AxT/9gI7AA8CG//2AiAAMgFtADIBCgBuAW0AMgJvABQChP/sAp4ALQKLACMCPwAjAtAACgKUACMDrgAPAjIALQMPACMDDwAjAsAAIwK0AAADnQAtAv8AIwLcADcDBQAjAkcAIwJ2ADcCdgAPAnUAAAMpAC0ChwAFAw8AIwLIAAUEAwAjBAsAIwLkABQDtwAjAnwAIwJ3ADwD7gAjAnb/+wIKAB0CSAA3AhAAHgG8AB4CU//7AhUAMgMYABQBzQAoAmIAHgKWAB4CfgAeAiH/9gMWAB4CXwAeAkQALQJbAB4CUwAeAeAAPAIEABQCMv/2AsIAHgIdAAUCaAAeAkwABQOSAB4DdAAeAmMABQL5AB4CCgAeAekALQMbAB4CEwAAAQQAAAEQAEsBgQBLApgAKAIbADcC4AAoA1EAMgD6AEsBEQA8AREAFAGBABkCOgAUASwAUAFUAAoA/wBGAbgACgIXAAAEGgAAAdYARgHWAFABLABQASwAUAHWAFACWgAeAjgAKAGUADcBlAA8A6wAXwIAACgDTwAoAxwACgIUAF8CeAAjAkUASwGzADwCPwAeAkwAHgJYAEYA+gAoAlsAFAMiACABIQAjATYAZAEsAFABbQAAAgoAHAJGAAcBTgAUAjoAIwJVAA8B9gAUA0EAMgJY//cDMQAyAaMARwGjADkBowBPAaMAPwGjAGQBowCfAaMAIwGjAGYBowA8APr/qwD/ABkCKABLAiIAUAJVAA8CVQAPAlUADwI6AC0COgAtAjoALQI6AC0CWwAeAVgAFAEXABABEgAUAgoALQIKAC0CCgAtAb0AHgH2ABQB9gAUAfYAFAH2ABQB9gAUAfYAFAKBADcBZAAFAfQAVgRIACgCf//xAn4AIwLcADcCowAFAkz/9gFiAB4Cf//xAn4AIwLbACMBzAAkAn//8QG5AO8A/wAoAn//8QJ///EC3AA3An//8QJ+ACMCf//xAn4AIwFjAB4BbAAeAVUAHgLcADcC3AA3AtwANwKjAAUCowAFAqMABQJ0ABMB/gAUAS4ANwEmADwCVgAHAnv/5wM/AC0CsQA3AkoAFAGR//sCEgAyAlgABwIvACMCOgAtAkb/9gJHABABEQAeAbsAMgJjADcCRgAoAkz/9gNBABkCwwAOAkz/9gI6ADcBQABGAZEAKALcADcCdQAAAj8AIwG8AB4CfgAeAsAAIwEhACMB4AAtAZAAMgHHAFABkQBBAhUAMgDX/84BCf/EAjL/7AJcAB4ClAAjAlkANwHsADIB0AAeAnYANwI/ACMDEQAKAk0ANQMFACMCWwAeAY3/eAPQAAADD//2BBoAIwNNAB4CWAAeA68AIwNCAAoAIwAAAmcAMgEEAAADQQAtA+IAJwOq//oCgQAjAoAAIwM7ACgDhAAtAlcAGQKE//ECBQAUAoT/8QIFABQCdgA3AeAALQHgAC0CIAAyAr8ALQIVAC0CYAAeAloADwJaAA8CWgAPAhgAGQG6ADIBxQAjAcUAIwJEAC0CIAAyAnIAIwIVAC0CFQAtAhUALQIHABgBxQAjAkQALQJaAA8CrQAFApQAIwKUACMClAAjAnYANwJZACgC1wAjApQAIwEhAA8BIQAjAV8AIwKsACMCYAAeAsIAMgJZACgCrQAjApQAIwKUACMCLAA3AmwACgKtAAUCrQAFAq0ABQLbACMC2wAjAmoAHgLvACMBGwAjAj8AIwG7ACMCPwAjATQAKAJVACMC3AA3AtwANwFfACMCVwBpAOQAUAADAAAAAAAA/7UAMgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAPToAAQoyMAAACw0sAAEAB//2AAEACP/2AAEACf/sAAIAAf/sAAIAA//YAAIACf/sAAMABf/sAAMACf/sAAQAAf/YAAQAA//YAAQABf/iAAQAB//iAAQACf/OAAUAA//2AAUABAAKAAUABv/sAAUACf/YAAYABAAKAAYAB//YAAYACf/sAAcAAQAUAAcAAv/sAAcAA//OAAcABP/EAAcABf/sAAcABv/sAAcACP/YAAcBRf/iAAgAAQAKAAgACf/iAAkAA//2AAkABAAKAA8ACQAUABAAEf/2ABAAEv/EABAAFQAKABAAGAAUABAAGQAeABAAIP/YABAAI//EABAAJf/sABAAJv/sABAAMP/sABAAMf/iABAAMv/OABAAM//sABAANP/sABAAOf/sABAAPv/OABAAQf/iABAAQv/YABAAQ//YABAARP/OABAARf+SABAASP+6ABEAEP/2ABEAEf/2ABEAEv/iABEAE//2ABEAGP/sABEAGgAKABEAG//sABEAHP/iABEAIf/2ABEAIgAKABEAKf/sABEAMv/sABEAM//sABEANP/2ABEANf/sABEANv/2ABEAN//sABEAOP/2ABEAOf/2ABEAOv/2ABEAPP/sABEAPf/sABEAPv/sABEAP//sABEAQP/iABEAQ//sABEARP/2ABEARf/2ABEARv/OABEAR//YABEASP/iABEASf/YABIAEAAKABIAEwAUABIAFQAKABIAFwAKABIAGAAUABIAGQAeABIAGgAUABIAGwAUABIAHAAKABIAIQAUABIAIgAKABIAIwAUABIAJwAUABIAKQAKABIAPv/YABIAQv/sABIAQ//sABIARP/YABIARf/iABIAR//iABIASP/iABIASf/iABMAEP/OABMAEf/sABMAEv/iABMAFP/sABMAGf/YABMAGv/2ABMAJv/iABMAKP/YABMAKf/YABMAMf/YABMAMv/OABMAM//OABMANP/YABMANf/OABMANv/iABMAN//OABMAOf/sABMAOv/iABMAO//sABMAPP/iABMAPf/iABMAPv/iABMAP//iABMAQP/iABMAQf/iABMAQv/iABMAQ//iABMARP/sABMARv/sABMAR//YABMASP/iABMASf/YABQAFQAKABQAFv/iABQAGf/fABQAIP/sABQAIv/2ABQAMP/iABQAMf/iABQAMv/YABQAM//iABQANP/YABQANf/YABQANv/YABQAN//YABQAPP/sABQAPf/iABQAP//OABQAQP/YABQAQf/iABQAQ//iABQARP/YABQARf/YABQARv/iABQAR//YABQASP/YABQASf/OABUAEP/EABUAEv/2ABUAFv/sABUAF//2ABUAHP/YABUAHwAKABUAIQAKABUAJAAKABUAMP+SABUAMf/iABUAMv+mABUAM/+wABUANP+6ABUANf/OABUANv+wABUAN//sABUAOP/YABUAOf/EABUAOv/iABUAO//iABUAPP+wABUAPf+6ABUAPv+mABUAP/+6ABUAQP+mABUAQf/EABUAQv+cABUAQ//OABUARP/EABUARf+6ABUARv+6ABUAR//EABUASP+6ABUASf+mABYAFwAKABYAGAAUABYAGgAKABYAI//2ABYAJABGABYAKf/2ABYAMP/iABYAMf/YABYANf/OABYAP//iABYAQP/2ABYAQ//sABYARP/iABYARf/OABYARv/OABYAR//EABYASP+6ABYASf+6ABcAFAAKABcAFQAUABcAGAAoABcAGgAKABcAHQAUABcAJgAKABcAKf/sABcAMP/sABcAMv/OABcAM//YABcANP/YABcANf/iABcANv/2ABcAOf/iABcAPP/2ABcAPf/2ABcAPv+6ABcAP//OABcAQP/OABcAQf/iABcAQv/OABcAQ//OABcARP/OABcARv/OABcASP/iABcASf/iABgAEAAKABgAEQAKABgAEv/iABgAFAAKABgAFv/sABgAFwAKABgAGAAKABgAGQAyABgAHAAUABgAHwAKABgAIQAeABgAIgAKABgAJAAKABgAKAAKABgAMP/sABgAMv/sABgAOf/2ABgAPP/2ABgAPf/2ABgAPv/sABgAP//sABgAQP/sABgAQf/sABgAQv/sABgAQ//sABgARP/sABgARf/sABgARv/sABgAR//2ABgASP/sABgASf/sABkAEP/EABkAEQAKABkAEv/iABkAFP/sABkAGAAUABkAGQAUABkAHwAKABkAJAAeABkAKf/OABkAMP/OABkAMv/iABkAM//iABkANP/iABkANv/iABkAOP/sABkAPv/sABkAQP/sABkAQf/iABkAQv/OABkAQ//2ABkARf/iABkARv/gABkAR//sABkASP/sABkASf/sABoAEAAUABoAEQAUABoAEv/2ABoAFv/iABoAFwAKABoAGwAeABoAHAAKABoAHv/sABoAMP/iABoAMv/EABoAM//OABoANP/EABoANf/iABoANv/iABoAOf/iABoAPv/YABoAP//YABoAQP/YABoAQf/sABoAQv/YABoAQ//YABoARP/YABoARf+6ABoARv/OABoAR//YABoASP/EABoASf/iABsAEv/sABsAGf/2ABsAHP/sABsAIv/2ABsAJf+6ABsAKP/YABsAMAANABsAMv/sABsAM//iABsANP/iABsANf/OABsANv/sABsAN//iABsAOP/iABsAOf/OABsAPP/sABsAPf/iABsAPv/2ABsAP//iABsAQP/sABsAQf/iABsAQv/sABsAQ//YABsARP/iABsARf+mABsARv+mABsAR//YABsASP+mABsASf/OABwAEQAKABwAEv/sABwAFAAUABwAFQAKABwAGQAeABwAGgAKABwAGwAKABwAHQAeABwAIgAKABwAJf/iABwAKAAKABwAMP/YABwAMf/iABwAMv/EABwAM//OABwANP/EABwANf/iABwANv/sABwAN//iABwAPP/iAB0AFAAUAB0AFQAUAB0AFwAUAB0AKf/2AB0AMP/YAB0AMv/YAB0AM//iAB0ANP/YAB0ANv/YAB0AN//iAB0AOP/sAB0AOf/iAB0APP/2AB0APf/2AB0APv/YAB0AP//YAB0AQP/YAB0AQf/YAB0AQv/YAB0AQ//iAB0ARP/YAB0ARf/YAB0ARv/YAB0AR//YAB0ASP/YAB0ASf/YAB4AH//2AB4AKP/2AB4AKf/sAB4AMP/sAB4AMf/sAB4AMv/sAB4ANP/sAB4ANf/iAB4ANv/iAB4AN//iAB4AOP/iAB4AOf/sAB4AOv/sAB4AO//sAB4APP/sAB4APf/sAB4APv/iAB4AP//iAB4AQP/iAB4AQf/YAB4AQv/YAB4AQ//iAB4ARP/YAB4ARf/iAB4ARv/sAB4AR//YAB4ASP/sAB4ASf/EAB8AFQAKAB8AIgAKAB8AMP/OAB8AMf/iAB8AMv/OAB8ANP/OAB8ANf/iAB8ANv/YAB8AN//iAB8AOP/2AB8AOf/sAB8AOv/iAB8AO//iAB8APP/sAB8APf/iAB8APv/OAB8AP//YAB8AQP+mAB8AQv/OAB8ARP/sAB8ASf/sACAAIQAKACAAI//YACAAMP/tACAAMv/YACAAM//YACAANP/iACAANv/sACAAN//iACAAOP/sACAAOf/sACAAOv/iACAAO//iACAAPP/sACAAPf/sACAAPv/sACAAP//2ACAAQP/2ACAAQf/2ACAAQv/sACAAQ//2ACAARP/2ACAARf/sACAARv/sACAAR//YACAASP/iACAASf/iACEAEv/iACEAFQAKACEAFv/sACEAGAAUACEAIP/iACEAIQAKACEAIgAUACEAMP/OACEAMf/sACEAMv/OACEAM//OACEANP/OACEANf/OACEANv/YACEAN//sACEAOP/2ACEAOf/sACEAOv/sACEAO//sACEAPP/iACEAPf/iACEAPv/OACEAP//EACEAQP/OACEAQf/iACEAQv/OACEAQ//iACEARP/iACEARf/OACEARv/OACEAR//sACEASP/OACIAEP/sACIAEf/sACIAEv/OACIAFP/2ACIAFv/2ACIAF//sACIAGP/iACIAGf/sACIAHP/sACIAHf/sACIAHv/2ACIAIP/sACIAIf/2ACIAIv/2ACIAI//EACIAJP/2ACIAJf/OACIAJv/iACIAJ//2ACIAKP/iACIAKf/sACIAMP+wACIAMf/YACIAMv+mACIAM/+wACIANP+wACIANf/OACIANv+6ACIAN/+wACIAOP/EACIAOf+wACIAOv+6ACIAO//OACIAPP/OACIAPf/EACIAPv/EACIAP/+6ACIAQP+6ACIAQf/EACIAQv/EACIAQ//EACIARP/EACIARf+wACIARv+wACIAR/+6ACIASP+6ACIASf+mACMAEv/sACMAFQAKACMAJAAKACMAMP+cACMAMv+SACMAM/+mACMANP+IACMANf/YACMANv+mACMAOP/OACMAOf/EACMAPf/OACMAPv+mACMAP//iACMAQP+cACMAQf+cACMAQv+wACMAQ//EACMARP+mACMARf/EACMARv+mACMAR/+6ACMASP/EACMASf+6ACQAEP/iACQAIv/2ACQAMP/iACQAMv/iACQAM//iACQANP/iACQANf/YACQANv/iACQAN//2ACQAOP/sACQAOf/sACQAOv/2ACQAO//2ACQAPP/sACQAPf/iACQAPv/YACQAP//OACQAQP/OACQAQf/iACQAQv/EACQAQ//OACQARP/OACQARf/sACQARv/iACQAR//OACQASP/YACQASf/OACUAEP/sACUAGQAKACUAMP+6ACUAMf/sACUAMv+mACUAM/+mACUANP/EACUANf/EACUANv/EACUAN//sACUAOP/OACUAOf/OACUAOv/2ACUAOwBJACUAPP/OACUAPf+wACUAPv/EACUAP/+wACUAQP+SACUAQf/OACUAQv+wACUAQ//OACUARP/OACUARf/iACUARv/iACUAR//YACUASP/YACUASf/YACYAEP/sACYAEv/iACYAFwAKACYAMP+6ACYAMf/iACYAMv+mACYAM/+cACYANP+6ACYANv/OACYAN//iACYAOP/iACYAOf/EACYAOv/iACYAO//iACYAPP/YACYAPf/OACYAPv+6ACYAP//EACYAQP+wACYAQf/OACYAQv+6ACYAQ//iACYARP/EACYARf+6ACYARv+6ACYAR/+6ACYASP+6ACYASf+6ACcAEv/iACcAFv/sACcAIgAKACcAKP/iACcAMP/YACcAMv/OACcAPv/YACcAQP/OACcAQf/iACcAQv/EACcARP/OACcARf/EACcARv+mACcAR//YACcASP+wACcASf/OACgAEv/iACgAFAAKACgAFv/2ACgAGAAUACgAGQAUACgAGgAeACgAGwAoACgAHAAKACgAHwAKACgAIQAUACgAIgAUACgAKf/iACgAMP+mACgAMv+IACgAM/+IACgANP+wACgANf/iACgANv+6ACgAN//2ACgAOP/sACgAOf/iACgAOv/2ACgAPP/OACgAPf/YACgAPv+6ACgAP//OACgAQP+cACgAQf/EACgAQv+wACgAQ/+6ACgARP+6ACgARf+wACgARv/EACgAR/+6ACgASP/EACgASf+mACkAEv/sACkAFv/2ACkAGQAUACkAGgAUACkAHQAKACkAIgAKACkAJv/YACkAJwAKACkAMP/iACkAMf/OACkAMv+wACkAM//OACkANP+6ACkANf/EACkANv+6ACkAOP/OACkAOf/OACkAOv/OACkAO//iACkAPP/OACkAPf/OACkAPv/EACkAP//OACkAQP/EACkAQf+6ACkAQv/EACkAQ/+mACkARP+wACkARf+SACkARv+cACkAR//OACkASP+mACkASf/YADAAEv/YADAAFf/iADAAFv+wADAAF//sADAAMf/iADAAMv/iADAAM//iADAANf/YADAANv/2ADAAN//YADAAOP/iADAAOf/sADAAPv/sADAAP//sADAAQP/iADAAQf/sADAAQv/2ADAAQ//2ADAARf+6ADAARv/YADAASP/OADEAEP/sADEAEf/lADEAFf/YADEAF//YADEAKf/OADEAMf/2ADEAMv/2ADEANAAKADEANgAKADEASf/sADIAEAAKADIAKP+mADIAMAAKADIAM//2ADIAPAAKADMAEAAUADMAFv/sADMAKf/OADMAMP/sADMAMQAKADMAM//2ADMANP/2ADMANQAKADMANv/sADMAOAAUADMAOwAKADMAPAAKADMAPQAKADMAPwAKADMARv/iADMASAAKADQAFP/YADQAFf/sADQAFv/2ADQAI/+cADQAJv/OADQAKP9qADQAMP/iADQAMf/2ADQAMv/sADQAM//iADQANP/sADQANf/2ADQANv/sADQAOP/sADQAOf/YADQAPv/YADQAQP/iADQARf/YADQARv/OADQASP/iADQAj//iADUAFwAKADUAMQAeADUANP/sADUANQAUADUANgAKADUANwAUADUAOAAoADUAOQAUADUAOgAKADUAOwAeADUAPAAWADUAPQAKADUAPv/2ADUAPwAUADUAQwAUADUARgAKADYAFf/sADYAF//2ADYAI/+6ADYAJf+6ADYAJv/2ADYAJ//iADYAKP+6ADYAMQAKADYAM//2ADYANQAUADYANgAyADYANwAKADYAOAAeADYAPAAUADYAPQAoADYAPwAoADYAQP/2ADYAQQAeADYAQgAKADYAQwAUADYARAAUADYARQAUADYARwAUADYASAAUADYASQAKADcAJP/iADcAJf/EADcAMP/iADcAMf/sADcAMv/2ADcANf/2ADcANv/2ADcAOAAUADcARv/sADcASP/sADgAM//sADgANf/2ADgANgAKADgAOAAeADgAOQAKADgAOwAKADgAQgAKADkAEP/2ADkAFf/sADkAF//sADkAJv/sADkAMP/iADkAM//YADkANP/iADkANf/sADkAOv/2ADkARP/sADkASf/sADoAHgA1ADoAJv/EADoAMAAKADoAMv/2ADoAM//iADoANP/iADoANf/sADoAOf/2ADsANP/2ADsANwAKADsAOAAKADsAOwAeADsAPAAeADsAQwAUADsARAAKADsARf/2ADwAFv/sADwAHP/sADwAIP/iADwAKP9qADwAMv/2ADwAM//sADwANP/sADwAR//YAD0AFf/sAD0AFv/iAD0AGv/2AD0AIP/iAD0AMP/2AD0AMv/sAD0ANf/2AD0APv/1AD4AEP/OAD4AFP/OAD4AFf/OAD4AGv/YAD4AKP9CAD4AKf/iAD4AMP/sAD4AM//sAD4ANP/2AD4ANf/sAD4AN//9AD4AP//iAD4AQf/sAD4AQ//+AD8AKP+SAD8AQP/+AEAAFf/iAEAAF//OAEAAKP+wAEAAPv/+AEAAPwAeAEAAQP/2AEAARf/iAEAASP/iAEEAEP/YAEEAFf/OAEEAMP/2AEEAMv/sAEEANP/sAEEANv/2AEIAI/+wAEIAMAAKAEIAM//2AEIANf/2AEIANv/2AEIAPP/sAEIAQ//2AEMAMv/2AEMAO//2AEMAPv//AEMAQP/2AEMARP/2AEMARf/iAEQARf/iAEUAF//YAEUAMP/2AEUAMf/2AEUAM//YAEUAN//2AEUAQv/iAEYAEP+cAEYAMP/sAEYAMv/sAEYAM//iAEYANP/EAEYANf/2AEYAPv/sAEYAR//2AEcAFf/OAEcANgAKAEcAQP/sAEcASP/iAEgAEP+wAEgAMP/iAEgAMf/sAEgAMv/YAEgAM//YAEgANP/sAEgANf/2AEgANv/iAEgAN//2AEgAOf/2AEgAO//sAEgAQP/OAEgAR//sAEgASf/YAEkAM//YAEkANf/sAEkAOf/2AEkAOv/2AEkAO//sAEkARv/2AE4AT//iAE4AUAAeAE4AUgAKAE4AWv/sAE4AXP/iAE4AX//EAE4AYP+mAE4AYf9+AE4AYv+6AE4AZf+mAE4AaP+mAE4AagAKAE4AbQAUAE4Ab//EAE4Ac//iAE4AfP/OAE4Agf/EAE8AUP/sAE8AUv/iAE8AVP/OAE8AVf/2AE8AW//iAE8AXf/iAE8AX//iAE8AYf/EAE8AYv/iAE8AY//sAE8AZP/YAE8AZf+cAE8AZv/iAE8AaP+6AE8AbP/iAE8Abf/YAE8Abv/sAE8Ab//sAE8AcP/sAE8Acf/sAE8Acv/sAE8Ac//sAE8AdP/OAE8Adf/sAE8Adv/sAE8Ad//sAE8AeP/sAE8Aef/iAE8Aev/iAE8Ae//YAE8AfP/YAE8Aff+6AE8Afv+wAE8Af/+wAE8AgP+6AE8Agf/EAE8Agv/sAE8Ag//OAE8AhP/OAE8Ahf/OAE8Ahv/OAE8Ah//OAE8AiP/OAE8Aif/OAE8Aiv/OAE8Ai//OAE8AjP/OAE8Ajf/iAE8BLf/sAFAAUv/YAFAAVP/OAFAAW//iAFAAX//2AFAAYP/sAFAAYf+wAFAAZf+6AFAAaP/EAFAAbP/sAFAAbf/2AFAAbv/iAFAAb//OAFAAcf/iAFAAcv/OAFAAc//iAFAAdP/2AFAAdf/sAFAAdv/iAFAAd//iAFAAeP/iAFAAev/iAFAAe//iAFAAfP/iAFAAff/iAFAAfv/sAFAAf//iAFAAgP/iAFAAgf/sAFAAgv/iAFAAg//YAFAAhP/YAFAAhf/YAFAAhv/iAFAAh//sAFAAiP/OAFAAif/OAFAAiv/OAFAAi//YAFAAjP/iAFAAjf/iAFABLf/iAFEATv9+AFEAUv/YAFEAVf/iAFEAV//iAFEAWP/iAFEAWf/OAFEAWv/OAFEAXP/OAFEAX//OAFEAYv/EAFEAZf/sAFEAZv/iAFEAZ//2AFEAav/sAFEAbf/sAFEAbv+cAFEAb//EAFEAcP+mAFEAcf+cAFEAcv+IAFEAc/+SAFEAdP/EAFEAdf+mAFEAdv/EAFEAd//iAFEAeP/EAFEAef+wAFEAev+mAFEAfP+IAFEAff+6AFEAfv+6AFEAf/+SAFEAgP/YAFEAgf/iAFEAgv/OAFEAg//YAFEAhP+6AFEAhf/EAFEAhv+wAFEAh/+wAFEAiP+6AFEAif+wAFEAiv+6AFEAi/+cAFEAjP+mAFEAjf+6AFEBLf+wAFIATwAKAFIAUQAKAFIAUwAKAFIAVP/iAFIAWwAUAFIAXP/iAFIAXQAKAFIAXgAKAFIAX//OAFIAYv/OAFIAZf/OAFIAZv/iAFIAaP/YAFIAagAUAFIAb/+wAFIAcP/sAFIAcf/sAFIAc//EAFIAdP/iAFIAdf/iAFIAdv/iAFIAd//iAFIAeP/OAFIAef/sAFIAev/YAFIAe//iAFIAfP+wAFIAff/iAFIAfv/OAFIAf/+cAFIAgP+wAFIAgf/OAFIAgv+wAFIAg//iAFIAhP/YAFIAhf+mAFIAhv/YAFIAh//iAFIAiP+6AFIAif/iAFIAiv/iAFIAi//iAFIAjP/sAFIAjf/sAFIBLf/OAFIBMgAKAFMAVP/sAFMAV//YAFMAW//sAFMAXP/sAFMAX//YAFMAYf/OAFMAYv/iAFMAaP/iAFMAbf/sAFMAbv/iAFMAb//YAFMAcP/iAFMAcf/sAFMAcv/sAFMAc//OAFMAdP/2AFMAdf/2AFMAdv/sAFMAd//YAFMAeP/YAFMAev/YAFMAe//iAFMAfP/sAFMAff/sAFMAfv/sAFMAf//YAFMAgP/YAFMAgf/YAFMAgv/iAFMAg//iAFMAhP/OAFMAhf+6AFMAhv/2AFMAh//sAFMAiP/iAFMAif/sAFMAiv/sAFMAi//2AFMAjP/sAFMAjf/sAFMBLf/YAFMBMv/sAFQATwAKAFQAUAAKAFQAUQAKAFQAUwAUAFQAVf/2AFQAWwAUAFQAXP/OAFQAXQAUAFQAXgAoAFQAX/+6AFQAYv/YAFQAYwAeAFQAZAAoAFQAZwAeAFQAaP/2AFQAagAeAFQAbAAUAFQAbQAUAFQAbv/sAFQAb//EAFQAcP/2AFQAcf/2AFQAcgAKAFQAc//YAFQAdP/2AFQAdf/sAFQAdv/2AFQAev/2AFQAe//2AFQAfP/YAFQAfv/sAFQAf//OAFQAgP/OAFQAgf/YAFQAgv/OAFQAhf/EAFQAiP/OAFQAi//iAFQAjP/sAFQBLf/YAFUAUv/iAFUAU//sAFUAVv/2AFUAV//iAFUAWP/sAFUAXAAKAFUAXf/iAFUAX//OAFUAYP/iAFUAYf/OAFUAYv/iAFUAY//2AFUAZf/OAFUAaP/iAFUAbP/YAFUAbv/2AFUAb//sAFUAcP/sAFUAcf/2AFUAcv/2AFUAc//2AFUBLf/2AFYAVwAeAFYAX//EAFYAaP/sAFYAbf/2AFYAbv/iAFYAb//EAFYAcP/sAFYAcf/sAFYAc//EAFYAdP/sAFYAdf/sAFYAeP/2AFYAev/2AFYAfP/OAFYAfv/iAFYAf/+6AFYAgP/OAFYAgf/YAFYAgv/OAFYAhf/OAFYAhv/2AFYAiP/OAFYAi//sAFYAjP/sAFYBLf/EAFcATwAKAFcAUwAUAFcAVgAeAFcAWAAeAFcAXP/iAFcAXQAKAFcAX//iAFcAYv/sAFcAbv/iAFcAb//YAFcAcP/sAFcAcf/sAFcAc/+6AFcAdf/sAFcAdv/2AFcAd//sAFcAeP/sAFcAev/2AFcAe//2AFcAfP+wAFcAff/sAFcAfv/YAFcAf/+wAFcAgP/iAFcAgf/2AFcAgv/YAFcAhf/OAFcAhv/2AFcAh//2AFcAiP/EAFcAif/2AFcAiv/2AFcAi//YAFcAjP/2AFcBLf/YAFgAVP/2AFgAVf/iAFgAWf/sAFgAWwAKAFgAXP/EAFgAXQAKAFgAX//OAFgAYv+cAFgAaP+wAFgAaQAKAFgAbv/OAFgAb/+cAFgAcf/sAFgAc/+mAFgAdP/sAFgAdf/iAFgAdv/CAFgAd//EAFgAeP/DAFgAef/iAFgAev/2AFgAe//2AFgAfP+mAFgAff/sAFgAfv/EAFgAf/+SAFgAgP+mAFgAgf+SAFgAgv+wAFgAhP/iAFgAhf+SAFgAhv/iAFgAh//sAFgAiP+wAFgAiv/EAFgAi//iAFgAjP/sAFgAjf/sAFgBLf+6AFkATwAUAFkAWwAsAFkAXP/fAFkAXQAKAFkAXgAUAFkAX//OAFkAYv/2AFkAaQAUAFkAbAAKAFoATgAKAFoATwAUAFoAWwAeAFoAXP/YAFoAXQAUAFoAX//OAFoAYP/sAFoAYv/YAFoAYwAUAFoAZf/iAFoAaP/sAFoAagAeAFoAa//iAFoAbAAeAFoAbQAUAFoAbv/iAFoAb//OAFoAcP/2AFoAcf/2AFoAcv/2AFoAc//YAFoAdf/sAFoAdv/iAFoAeP/sAFoAegAKAFoAfP/YAFoAfv/iAFoAf//EAFoAgP/YAFoAgf/OAFoAgv/iAFoAhf/EAFoAiP/OAFoAi//sAFoAjP/iAFoAjf/sAFoBLf/YAFsATwAKAFsAUAAUAFsAUQAUAFsAUwAeAFsAVAAUAFsAVwAKAFsAWAAUAFsAWQAUAFsAXP/hAFsAXQAKAFsAXgAUAFsAX//OAFsAYv/iAFsAbAAeAFsAbv/sAFsAb//EAFsAc//EAFsAeP/2AFsAfv/YAFsAf//OAFsAgP/YAFsAgf/YAFsAgv/YAFsAg//2AFsAhf/EAFsAh//2AFsAiP/YAFsAif/2AFsAiv/2AFsBLf/OAFsBMgAUAFwATv/YAFwAT//YAFwAUP/iAFwAUf/EAFwAUv/OAFwAU//YAFwAVP/EAFwAVf/sAFwAVv/2AFwAV//YAFwAWP/YAFwAWf/iAFwAWv+6AFwAW//OAFwAXf/YAFwAX//sAFwAYP/OAFwAYf+cAFwAYv/sAFwAY//OAFwAZP/iAFwAZf+6AFwAZ//YAFwAaP/YAFwAaf/iAFwAav/YAFwAa//YAFwAbP/YAFwAbf/gAFwAbv/iAFwAb//iAFwAcP/sAFwAcf/iAFwAcv/iAFwAc//YAFwAdP/YAFwAdf/2AFwAdv/sAFwAd//sAFwAeP/sAFwAev/YAFwAe//sAFwAfP/OAFwAff/iAFwAfv/iAFwAf//iAFwAgP/sAFwAgf/YAFwAgv/iAFwAg//YAFwAhP/YAFwAhf/YAFwAhv/YAFwAh//YAFwAiP/OAFwAif/YAFwAiv/YAFwBLf/iAFwBMv/OAF0ATwAoAF0AUAAUAF0AUQAUAF0AUgAUAF0AVAAKAF0AVwAKAF0AWAAKAF0AWQAKAF0AWv/2AF0AWwAKAF0AXP/YAF0AXgAUAF0AX//iAF0AYQAKAF0AYv/YAF0AYwAUAF0AZf/sAF0Aa//2AF0AbAAKAF0AbQAUAF0Abv/sAF0Ab//YAF0Ac//OAF0Aef/iAF0Aev/2AF0AfP/EAF0Afv/OAF0Af/+wAF0AgP/OAF0Agf/OAF0Agv/YAF0Ag//2AF0Ahf/OAF0Ajf/sAF0BLf/OAF4AUv+wAF4AU//iAF4AVP/YAF4AVf/2AF4AWP/2AF4AWf/iAF4AW//iAF4AXf/iAF4AX//sAF4AYf/sAF4AbP/2AF4Abf/2AF4Abv/YAF4Ab//YAF4AcP/sAF4Acf/sAF4Acv/YAF4Ac/+6AF4AdP/sAF4Adf/iAF4Adv/2AF4Ad//2AF4AeP/sAF4Aef/YAF4Aev/OAF4Ae//iAF4AfP+6AF4Aff/YAF4Afv/OAF4Af/+6AF4AgP/iAF4Agv/OAF4Ag//sAF4AhP/sAF4Ahf/2AF4Ahv/iAF4Ah//iAF4AiP/sAF4Aif/sAF4Aiv/iAF4Ai//YAF4AjP/sAF4Ajf+6AF4BLf/EAF8AUgAUAF8AVAAeAF8AVQAKAF8AVwAKAF8AWf/2AF8AWv/2AF8AWwAKAF8AXAAUAF8AYQAKAF8AYwAUAF8AawAUAF8AbAAUAF8AbQAKAF8Abv/2AF8Ac//iAF8AeP/2AF8Aev/sAF8Ae//2AF8AfP/iAF8Af//sAF8Agf/2AF8Ahf/iAF8BLf/sAGAATv+wAGAAWv/iAGAAXP/iAGAAX//sAGAAYf/2AGAAYwAKAGAAbf/YAGAAbv+wAGAAb//EAGAAcP+6AGAAcf+wAGAAcv/EAGAAc/+cAGAAdP+6AGAAdf+mAGAAdv/EAGAAd/+6AGAAeP+6AGAAef+mAGAAev+mAGAAe/+wAGAAfP+SAGAAff/EAGAAfv/EAGAAf/+mAGAAgP/EAGAAgf/OAGAAgv+IAGAAg//EAGAAhP/EAGAAhf+6AGAAhv+6AGAAh//EAGAAiP/EAGAAif+mAGAAiv+6AGAAi/+6AGAAjP/EAGAAjf+cAGABLf/OAGEATv+IAGEAVf/iAGEAWv/iAGEAXP/YAGEAXQAUAGEAX//YAGEAYv/OAGEAbf/iAGEAbv+mAGEAb/+mAGEAcP+mAGEAcf+6AGEAcv+cAGEAc/+IAGEAdP+wAGEAdf+cAGEAdv/EAGEAd//PAGEAeP+mAGEAef+cAGEAev+cAGEAe/+6AGEAfP90AGEAff+wAGEAfv+6AGEAf/9qAGEAgP+wAGEAgf/YAGEAgv+cAGEAg//EAGEAhP+6AGEAhf+6AGEAhv+wAGEAh/+mAGEAiP+wAGEAif+6AGEAiv/EAGEAi/+6AGEAjP+wAGEAjf+mAGEBLf+wAGIATv/iAGIAT//OAGIAUf/YAGIAUv/EAGIAVP+6AGIAVf/OAGIAVv/iAGIAV//sAGIAWP/2AGIAWf/2AGIAWv/OAGIAW//YAGIAXf/OAGIAX//2AGIAYP/sAGIAYf/sAGIAY//JAGIAZf/iAGIAaP+wAGIAbP/iAGIAbf/iAGIAbv/iAGIAb//2AGIAcP/sAGIAcf/2AGIAcv/iAGIAc//2AGIAdP/sAGIAd//sAGIAeP/sAGIAef/iAGIAev/iAGIAe//2AGIAfP/iAGIAf//iAGIAgf/sAGIAgv/2AGIAg//iAGIAhP/YAGIAhf/2AGIAhv/2AGIAh//2AGIAiP/2AGIAif/2AGIAiv/sAGIAi//2AGIAjP/sAGIAjf/sAGIBLf/2AGMATwAKAGMAUwAUAGMAVAAKAGMAWgAKAGMAWwAeAGMAXP/EAGMAXQAeAGMAX//OAGMAYP/2AGMAaP/sAGMAbQAKAGMAbv/2AGMAb//OAGMAc//OAGMAfP/EAGMAfv/iAGMAf//EAGMAgf+6AGMAgv/iAGMAhf+cAGMBLf/sAGQATwAKAGQAUwAUAGQAVAAUAGQAWwAUAGQAXP/sAGQAX//OAGQAYv/sAGQAZAAUAGQAZf/iAGQAZgAUAGQAZwAUAGQAaP/YAGQAbAAKAGQAbv/sAGQAb//OAGQAcP/2AGQAcf/2AGQAc//OAGQAdP/2AGQAeP/YAGQAef/sAGQAev/iAGQAe//sAGQAfP/OAGQAff/sAGQAfv/iAGQAgP/iAGQAgf/iAGQAgv/YAGQAhf/OAGQAhv/sAGQAiP/YAGQAif/sAGQAiv/sAGQAi//iAGQAjP/sAGQAjf/sAGQBLf/OAGUATwAUAGUAUwAeAGUAVAAUAGUAXP/EAGUAX//OAGUAYv/sAGUAZAAKAGUAZgAUAGUAaP/iAGUAbv/iAGUAb//EAGUAc//YAGUAe//2AGUAfP/OAGUAfv/2AGUAf//OAGUAgf/iAGUAgv/2AGUBLf/sAGYATwAKAGYAX//YAGYAZAAUAGYAZwAyAGYAbv/iAGYAb//iAGYAc//YAGYAfP/OAGYAf//EAGYAgf/iAGYAgv/iAGYAhf/EAGYAiP/YAGYBLf/sAGcAUwAKAGcAVAAeAGcAXP/iAGcAX//YAGcAYP/sAGcAZAAKAGcAaP/YAGcAbv/iAGcAb//iAGcAcP/sAGcAcf/2AGcAc//OAGcAdf/2AGcAeP/sAGcAef/sAGcAev/sAGcAe//sAGcAfP/OAGcAfv/sAGcAf//YAGcAgf/OAGcAgv/OAGcAhf/EAGcAi//2AGcBLf/YAGgATv/OAGgAUP/iAGgAUf/OAGgAUv//AGgAU//iAGgAVP/iAGgAVf/YAGgAV//sAGgAWP/YAGgAWv+6AGgAXf/iAGgAYP90AGgAYf+IAGgAYv/sAGgAY//iAGgAZf90AGgAaP+cAGgAaf/iAGgAa//sAGgAbf/iAGgAcf/2AGgAdP/iAGgAeP/iAGgAef/2AGgAev/sAGgAfv/iAGgAf//iAGgAgP/iAGgAgf/OAGgAg//YAGgAhP/2AGgAhf/YAGgAhv/sAGgAh//sAGgAiP/iAGgAif/YAGgAiv/2AGgAi//2AGgAjP/YAGgBMv/OAGkAWAAUAGkAWv/2AGkAXP/2AGkAX//sAGkAagAUAGkAbAAeAGkAbQAKAGkAbv/2AGkAb//sAGkAc//YAGkAeP/2AGkAef/sAGkAfP/sAGkAgP/2AGkAgf/iAGkAgv/YAGkAhf/OAGkAi//2AGkAjf/2AGkBLf/sAGoATv/sAGoAUf/YAGoAUv/sAGoAVP/OAGoAWP/iAGoAWv/YAGoAXP/sAGoAXf/iAGoAYP+SAGoAYf/EAGoAZf9+AGoAaP9qAGoAa//iAGoAbf/iAGoAbv/2AGoAb//2AGoAcP/sAGoAcf/2AGoAcv/2AGoAdP/iAGoAeP/iAGoAev/2AGoAe//2AGoAfv/iAGoAf//2AGoAgP/YAGoAgf/EAGoAg//YAGoAhf/YAGoAiP/iAGsATv/iAGsAU//iAGsAVP/YAGsAWf/iAGsAWv/iAGsAW//iAGsAXf/iAGsAX//sAGsAYP/YAGsAYf/YAGsAYgAKAGsAaP/EAGsAbP/iAGsAbf/sAGsAbv/iAGsAb//sAGsAcv/iAGsAeP/sAGsAef/iAGsAev/sAGsAe//2AGsAgv/2AGsAg//sAGsAhf/2AGsAiAAKAGsAjP/sAGsAjf/sAGwATv+6AGwAUP/YAGwAUf/YAGwAUv/EAGwAU//YAGwAVP/OAGwAVf/sAGwAV//iAGwAWv+wAGwAW//iAGwAXf/iAGwAXv/2AGwAYP/YAGwAYf/EAGwAYv/2AGwAY/+6AGwAZP/sAGwAZf+6AGwAZv/OAGwAZ//OAGwAaP/EAGwAaf/YAGwAa//qAGwAbf/OAGwAbv/2AGwAb//2AGwAcP/2AGwAcf/2AGwAcv/iAGwAc//2AGwAdf/2AGwAdv/iAGwAd//2AGwAeP/2AGwAef/2AGwAev/2AGwAfP/2AGwAff/2AGwAfv/2AGwAf//YAGwAgf/2AGwAgv/2AGwAg//2AGwAhP/sAGwAhf/sAGwAhv/sAGwAh//iAGwAiP/2AGwAif/sAGwAiv/sAGwAi//2AGwAjP/sAGwAjf/sAG0ATgAKAG0ATwAKAG0AUAAoAG0AUQAUAG0AUwAUAG0AVAAUAG0AVgAeAG0AXP/iAG0AX//YAG0AYv/YAG0AYwAUAG0AZf/iAG0AZgAUAG0AZwAKAG0AaP/iAG0AbAAKAG0AbQAUAG0Abv/iAG0Ab//YAG0AcP/2AG0Acf/2AG0Ac//YAG0AdP/2AG0Adf/2AG0Ad//2AG0AeP/sAG0Aef/sAG0Aev/sAG0AfP/iAG0Afv/sAG0Af//sAG0AgP/YAG0Agf/YAG0Agv/iAG0Ag//2AG0AhP/YAG0Ahf/OAG0AiP/iAG0BLf/sAG4AZf9qAG4Aav/sAG4AbgAKAG4Ab//YAG4AcAAKAG4Acf/2AG4AcgAKAG4Ac//iAG4AdP/sAG4Adf/sAG4Adv/sAG4Ad//sAG4AeP/2AG4AfP/YAG4Af//OAG4AgP/EAG4Agf+6AG4Agv/sAG4AhP/2AG4Ahf+6AG4Ahv/2AG4AiP/OAG4Ai//sAG4AjP/2AG4Ajf/2AG4BLf/iAG8AWv+wAG8Abv/2AG8AcP/2AG8Acf/2AG8Acv/sAG8Ac//2AG8AdP/sAG8Adf/iAG8AeP/YAG8Afv/iAG8Af//sAG8Ag//iAG8AhP/sAG8Ahf/YAG8Ahv/YAG8Ah//YAG8Ai//2AHAAWP/sAHAAWv+mAHAAbgAKAHAAcf/sAHAAdP/sAHAAdf/sAHAAeP/YAHAAfv/iAHAAf//iAHAAgP/iAHAAgf/YAHAAgv/2AHAAg//OAHAAhf/OAHAAh//OAHAAiP/iAHAAiv/iAHAAi//2AHAAjP/YAHAAjf/OAHEAV//sAHEAWP/iAHEAWv+6AHEAbv/sAHEAb//2AHEAcv/sAHEAdf/sAHEAeP/2AHEAfP/sAHEAf//iAHEAgQAKAHEAgv/iAHIAVv/YAHIAWv/sAHIAbv/sAHIAb//iAHIAc//OAHIAdP/2AHIAdf/sAHIAd//sAHIAe//2AHIAfP/iAHIAff/sAHIAfv/sAHIAf/+6AHIAgP/iAHIAgf/2AHIAgwAKAHIAhP/sAHIAhf/YAHIAhv/2AHIAh//BAHIAiP/iAHIAiv/2AHIAi//iAHIAjAAUAHMAV//2AHMAWP/YAHMAWv+6AHMAb//2AHMAcAAKAHMAcQAKAHMAcv/2AHMAc//sAHMAeP/iAHMAfv/sAHMAf//sAHMAgf/sAHMAhP/sAHMAhf/YAHMAh//sAHQAWv/YAHQAYv/sAHQAbv/2AHQAb//2AHQAcAAKAHQAcgAKAHQAc//iAHQAeAAKAHQAeQAKAHQAewAKAHQAfP/sAHQAfQAKAHQAfv/2AHQAf/+6AHQAgv/sAHQAgwAKAHQAhAAKAHQAiP/YAHQAjAAKAHQAjQAKAHUAWv+wAHUAbv/2AHUAb//iAHUAcP/sAHUAcf/sAHUAeQAKAHUAev/sAHUAfv/iAHUAf//OAHUAgP/iAHUAgf/YAHUAhf/iAHYAWv/OAHYAYP/sAHYAdAAKAHYAdgAUAHYAfP/2AHYAf//YAHYAgP/2AHYAgv/iAHYAgwAKAHYAhf/EAHYAiwAKAHYAjAAKAHYBLf/2AHcAYP/YAHcAeAAKAHgAVv/sAHgAV//2AHgAWP/iAHgAbv/EAHgAb/+wAHgAcP/2AHgAc/+mAHgAdP/sAHgAdf/iAHgAd//iAHgAeP/OAHgAef/iAHgAev/iAHgAe//sAHgAfP+wAHgAfv/iAHgAf//OAHgAgv+mAHgAhf+wAHgAiP/EAHgAif/YAHgAi//iAHgAjP/iAHgBLf+mAHkAbv/2AHkAb//2AHkAcAAoAHkAcgAeAHkAc//iAHkAdAAUAHkAegAKAHkAf//OAHkAjQAUAHoAWv/iAHoAc//iAHoAdAAKAHoAewAUAHoAfP/sAHoAf//YAHoAjAAeAHsAbQAKAHsAcQAKAHsAcgAKAHsAc//2AHsAdAAKAHsAeAAKAHsAfP/iAHsAf//iAHsAjAAUAHwATv/YAHwAV//EAHwAWP/OAHwAWv+wAHwAXf/iAHwAbf/iAHwAbv/sAHwAcP/2AHwAcf/tAHwAcv/sAHwAdP/YAHwAdv/sAHwAd//sAHwAeP/2AHwAef/iAHwAev/sAHwAff/iAHwAf//sAHwAgf/YAHwAhf/YAHwAiv/2AHwAi//sAHwAjf/sAH0AcQAKAH0AcgAUAH0AdAAKAH0AeAAKAH0Afv/2AH0Af//sAH0AgQAKAH0AjAAUAH4AWP/EAH4AWv+6AH4Acv/2AH4Ac//2AH4AdP/YAH4Adf/iAH4Adv/sAH4AeP/sAH4Aef/iAH4Aev/iAH4Ae//iAH4Af//iAH4Ag//2AH4AhP/sAH4Ahf/iAH4Ahv/2AH4Ah//sAH4AiP/2AH4Aif/iAH4Aiv/2AH4Ai//sAH4AjP/2AH4Ajf/iAH8AWv/YAH8AbgAeAH8AcAAKAH8AcgAUAH8AdAAUAH8AdQAKAH8AewAKAH8AgQAeAH8AhgAUAH8AhwAUAH8AjAAKAIAAVv/OAIAAV//2AIAAWP/sAIAAWv/EAIAAbf/YAIAAcAAKAIAAcv/2AIAAdf/sAIAAd//sAIAAgv/sAIAAjP/iAIAAjf/YAIEAVv/EAIEAV//YAIEAWv+mAIEAW//OAIEAYP/OAIEAbP/2AIEAbf/iAIEAbv/EAIEAb//YAIEAcP/2AIEAcf/iAIEAcv/YAIEAc/+wAIEAdP/iAIEAdf/YAIEAdv/sAIEAd//YAIEAfP+6AIEAff/iAIEAf/+cAIEAgP/sAIEAgv/FAIEAhP/sAIEAhv/2AIEAi//2AIEAjP/2AIEAjf/OAIEBLf+6AIIAUv/EAIIAVv/YAIIAV//OAIIAWP/EAIIAbv/2AIIAcP/sAIIAcf/iAIIAcv/sAIIAdP/iAIIAdv/YAIIAd//OAIIAeP/OAIIAef/2AIIAev/iAIIAe//iAIIAf//sAIIAgP/YAIIAgf/YAIIAg//YAIIAhP/YAIIAhf/OAIIAhv/iAIIAiP/2AIIAi//iAIIAjP/iAIIAjf/sAIMAcgAoAIMAdAAKAIMAdgAUAIMAeAAUAIMAfgAUAIMAf//EAIMAhAAeAIMAjAAoAIQAb//YAIQAcAAKAIQAcgAeAIQAc//YAIQAdP/2AIQAfgAUAIQAf//sAIQAgv/2AIQAhf/sAIQAjAAUAIQAjQAKAIUAWv/YAIUAb//YAIUAcAAUAIUAcQAKAIUAfv/2AIUAf//iAIUAgv/sAIUAhgAUAIYAWv/iAIYAZf+6AIYAbgAKAIYAb//YAIYAcQAKAIYAfgAKAIYAf//sAIYAgv/iAIYAhwAeAIYAigAKAIcAZf/YAIcAbgAUAIcAb//iAIcAcQAKAIcAfgAKAIcAf//sAIcAiP/sAIcAigAKAIgAVv/EAIgAWP/EAIgAWv+mAIgAZf9qAIgAbf/2AIgAbv/2AIgAb//YAIgAcP/OAIgAcf/iAIgAcv/iAIgAc//sAIgAdP/EAIgAfv/YAIgAf//iAIgAgv/2AIgAg//YAIgAhP/iAIgAhf+IAIgAif/gAIgAiv/2AIgAjP/YAIkAcQAKAIkAigAeAIkAiwAKAIoAUv/YAIoAWv+6AIoAbf/iAIoAb//iAIoAcP/YAIoAcv/iAIoAc//OAIoAdP/EAIoAdf/2AIoAdv/YAIoAd//iAIoAeP/YAIoAev/iAIoAfv/EAIoAf//OAIoAg//YAIoAhP/YAIoAhf+cAIoAhv/iAIoAh//iAIoAiP+wAIoAi//sAIoAjP/YAIoAjf/iAIsAVv/OAIsAWP/iAIsAWv+6AIsAZ//2AIsAbf/YAIsAbv/sAIsAb//sAIsAcP/iAIsAcv/YAIsAdv/OAIsAd//iAIsAeP/iAIsAfv/iAIsAf//YAIsAgf/sAIsAg//OAIsAhP/iAIsAhf/iAIsAif/sAIsAjP/sAIwAVv/OAIwAWP/EAIwAWv+6AIwAbf/EAIwAbv/iAIwAb//2AIwAcP/YAIwAc//sAIwAdP/EAIwAdv/YAIwAd//OAIwAeP/iAIwAev/iAIwAe//YAIwAff/YAIwAfv/OAIwAf//YAIwAgP/iAIwAgf/iAIwAgv/2AIwAg//OAIwAhP/sAIwAhf/OAIwAhv/OAIwAh//OAIwAiP/iAIwAif/YAIwAiv/YAIwAi//iAIwAjf/sAI0AcgAUAI0AdP/2AI0AeAAKAI0AeQAKAI0AegAKAI0AewAKAI0AfP/sAI0AfQAUAI0Afv/2AI0Agv/sAI0AgwAKAI0AhAAUAI0Ahf/iAI0AhwAKAI0AiQAKAI0AigAKAI0BLf/sAS0AWv/OAS0AdP/sATIAU//iATIAVP/sATIAXP/sATIAaP/iAUUAAf/iAUUACf/2AAAAAQAAAAoAHgAsAAFsYXRuAAgABAAAAAD//wABAAAAAWtlcm4ACAAAAAEAAAABAAQAAgAAAAEACAABKtYABAAAAIEBDAEaASgBMgFIAVoBaAGKAZQBngGkAf4CgALaA1wDwgRMBJYFAAV+BeQGUgbIBxoHhAf2CEwItgk4CfYKWArGCzgLqgvsDH4NBA1aDYQNmg3cDjIOdA7aDwQPIg9QD3IPlA+2D9gQEhAcED4QWBB2EJAQlhCwENIQ5BEeETgRfhJEEuoTqBRiFQwVrhYIFm4W/BeaF8AYVhjUGcIaUBsCG2AcAhyoHW4dxB5eHqwe5h9MH+4gQCC6ISgh/iKcIwYjTCOeI9AkMiRwJMIk9CUqJTQlliW8JdomACZeJoAm3icMJz4nsCgaKDwoaiiMKLYo2CkuKTwpninwKmoqsCq6KswAAwAH//YACP/2AAn/7AADAAH/7AAD/9gACf/sAAIABf/sAAn/7AAFAAH/2AAD/9gABf/iAAf/4gAJ/84ABAAD//YABAAKAAb/7AAJ/9gAAwAEAAoAB//YAAn/7AAIAAEAFAAC/+wAA//OAAT/xAAF/+wABv/sAAj/2AFF/+IAAgABAAoACf/iAAIAA//2AAQACgABAAkAFAAWABH/9gAS/8QAFQAKABgAFAAZAB4AIP/YACP/xAAl/+wAJv/sADD/7AAx/+IAMv/OADP/7AA0/+wAOf/sAD7/zgBB/+IAQv/YAEP/2ABE/84ARf+SAEj/ugAgABD/9gAR//YAEv/iABP/9gAY/+wAGgAKABv/7AAc/+IAIf/2ACIACgAp/+wAMv/sADP/7AA0//YANf/sADb/9gA3/+wAOP/2ADn/9gA6//YAPP/sAD3/7AA+/+wAP//sAED/4gBD/+wARP/2AEX/9gBG/84AR//YAEj/4gBJ/9gAFgAQAAoAEwAUABUACgAXAAoAGAAUABkAHgAaABQAGwAUABwACgAhABQAIgAKACMAFAAnABQAKQAKAD7/2ABC/+wAQ//sAET/2ABF/+IAR//iAEj/4gBJ/+IAIAAQ/84AEf/sABL/4gAU/+wAGf/YABr/9gAm/+IAKP/YACn/2AAx/9gAMv/OADP/zgA0/9gANf/OADb/4gA3/84AOf/sADr/4gA7/+wAPP/iAD3/4gA+/+IAP//iAED/4gBB/+IAQv/iAEP/4gBE/+wARv/sAEf/2ABI/+IASf/YABkAFQAKABb/4gAZ/98AIP/sACL/9gAw/+IAMf/iADL/2AAz/+IANP/YADX/2AA2/9gAN//YADz/7AA9/+IAP//OAED/2ABB/+IAQ//iAET/2ABF/9gARv/iAEf/2ABI/9gASf/OACIAEP/EABL/9gAW/+wAF//2ABz/2AAfAAoAIQAKACQACgAw/5IAMf/iADL/pgAz/7AANP+6ADX/zgA2/7AAN//sADj/2AA5/8QAOv/iADv/4gA8/7AAPf+6AD7/pgA//7oAQP+mAEH/xABC/5wAQ//OAET/xABF/7oARv+6AEf/xABI/7oASf+mABIAFwAKABgAFAAaAAoAI//2ACQARgAp//YAMP/iADH/2AA1/84AP//iAED/9gBD/+wARP/iAEX/zgBG/84AR//EAEj/ugBJ/7oAGgAUAAoAFQAUABgAKAAaAAoAHQAUACYACgAp/+wAMP/sADL/zgAz/9gANP/YADX/4gA2//YAOf/iADz/9gA9//YAPv+6AD//zgBA/84AQf/iAEL/zgBD/84ARP/OAEb/zgBI/+IASf/iAB8AEAAKABEACgAS/+IAFAAKABb/7AAXAAoAGAAKABkAMgAcABQAHwAKACEAHgAiAAoAJAAKACgACgAw/+wAMv/sADn/9gA8//YAPf/2AD7/7AA//+wAQP/sAEH/7ABC/+wAQ//sAET/7ABF/+wARv/sAEf/9gBI/+wASf/sABkAEP/EABEACgAS/+IAFP/sABgAFAAZABQAHwAKACQAHgAp/84AMP/OADL/4gAz/+IANP/iADb/4gA4/+wAPv/sAED/7ABB/+IAQv/OAEP/9gBF/+IARv/gAEf/7ABI/+wASf/sABsAEAAUABEAFAAS//YAFv/iABcACgAbAB4AHAAKAB7/7AAw/+IAMv/EADP/zgA0/8QANf/iADb/4gA5/+IAPv/YAD//2ABA/9gAQf/sAEL/2ABD/9gARP/YAEX/ugBG/84AR//YAEj/xABJ/+IAHQAS/+wAGf/2ABz/7AAi//YAJf+6ACj/2AAwAA0AMv/sADP/4gA0/+IANf/OADb/7AA3/+IAOP/iADn/zgA8/+wAPf/iAD7/9gA//+IAQP/sAEH/4gBC/+wAQ//YAET/4gBF/6YARv+mAEf/2ABI/6YASf/OABQAEQAKABL/7AAUABQAFQAKABkAHgAaAAoAGwAKAB0AHgAiAAoAJf/iACgACgAw/9gAMf/iADL/xAAz/84ANP/EADX/4gA2/+wAN//iADz/4gAaABQAFAAVABQAFwAUACn/9gAw/9gAMv/YADP/4gA0/9gANv/YADf/4gA4/+wAOf/iADz/9gA9//YAPv/YAD//2ABA/9gAQf/YAEL/2ABD/+IARP/YAEX/2ABG/9gAR//YAEj/2ABJ/9gAHAAf//YAKP/2ACn/7AAw/+wAMf/sADL/7AA0/+wANf/iADb/4gA3/+IAOP/iADn/7AA6/+wAO//sADz/7AA9/+wAPv/iAD//4gBA/+IAQf/YAEL/2ABD/+IARP/YAEX/4gBG/+wAR//YAEj/7ABJ/8QAFQAVAAoAIgAKADD/zgAx/+IAMv/OADT/zgA1/+IANv/YADf/4gA4//YAOf/sADr/4gA7/+IAPP/sAD3/4gA+/84AP//YAED/pgBC/84ARP/sAEn/7AAaACEACgAj/9gAMP/tADL/2AAz/9gANP/iADb/7AA3/+IAOP/sADn/7AA6/+IAO//iADz/7AA9/+wAPv/sAD//9gBA//YAQf/2AEL/7ABD//YARP/2AEX/7ABG/+wAR//YAEj/4gBJ/+IAIAAS/+IAFQAKABb/7AAYABQAIP/iACEACgAiABQAMP/OADH/7AAy/84AM//OADT/zgA1/84ANv/YADf/7AA4//YAOf/sADr/7AA7/+wAPP/iAD3/4gA+/84AP//EAED/zgBB/+IAQv/OAEP/4gBE/+IARf/OAEb/zgBH/+wASP/OAC8AEP/sABH/7AAS/84AFP/2ABb/9gAX/+wAGP/iABn/7AAc/+wAHf/sAB7/9gAg/+wAIf/2ACL/9gAj/8QAJP/2ACX/zgAm/+IAJ//2ACj/4gAp/+wAMP+wADH/2AAy/6YAM/+wADT/sAA1/84ANv+6ADf/sAA4/8QAOf+wADr/ugA7/84APP/OAD3/xAA+/8QAP/+6AED/ugBB/8QAQv/EAEP/xABE/8QARf+wAEb/sABH/7oASP+6AEn/pgAYABL/7AAVAAoAJAAKADD/nAAy/5IAM/+mADT/iAA1/9gANv+mADj/zgA5/8QAPf/OAD7/pgA//+IAQP+cAEH/nABC/7AAQ//EAET/pgBF/8QARv+mAEf/ugBI/8QASf+6ABsAEP/iACL/9gAw/+IAMv/iADP/4gA0/+IANf/YADb/4gA3//YAOP/sADn/7AA6//YAO//2ADz/7AA9/+IAPv/YAD//zgBA/84AQf/iAEL/xABD/84ARP/OAEX/7ABG/+IAR//OAEj/2ABJ/84AHAAQ/+wAGQAKADD/ugAx/+wAMv+mADP/pgA0/8QANf/EADb/xAA3/+wAOP/OADn/zgA6//YAOwBJADz/zgA9/7AAPv/EAD//sABA/5IAQf/OAEL/sABD/84ARP/OAEX/4gBG/+IAR//YAEj/2ABJ/9gAHAAQ/+wAEv/iABcACgAw/7oAMf/iADL/pgAz/5wANP+6ADb/zgA3/+IAOP/iADn/xAA6/+IAO//iADz/2AA9/84APv+6AD//xABA/7AAQf/OAEL/ugBD/+IARP/EAEX/ugBG/7oAR/+6AEj/ugBJ/7oAEAAS/+IAFv/sACIACgAo/+IAMP/YADL/zgA+/9gAQP/OAEH/4gBC/8QARP/OAEX/xABG/6YAR//YAEj/sABJ/84AJAAS/+IAFAAKABb/9gAYABQAGQAUABoAHgAbACgAHAAKAB8ACgAhABQAIgAUACn/4gAw/6YAMv+IADP/iAA0/7AANf/iADb/ugA3//YAOP/sADn/4gA6//YAPP/OAD3/2AA+/7oAP//OAED/nABB/8QAQv+wAEP/ugBE/7oARf+wAEb/xABH/7oASP/EAEn/pgAhABL/7AAW//YAGQAUABoAFAAdAAoAIgAKACb/2AAnAAoAMP/iADH/zgAy/7AAM//OADT/ugA1/8QANv+6ADj/zgA5/84AOv/OADv/4gA8/84APf/OAD7/xAA//84AQP/EAEH/ugBC/8QAQ/+mAET/sABF/5IARv+cAEf/zgBI/6YASf/YABUAEv/YABX/4gAW/7AAF//sADH/4gAy/+IAM//iADX/2AA2//YAN//YADj/4gA5/+wAPv/sAD//7ABA/+IAQf/sAEL/9gBD//YARf+6AEb/2ABI/84ACgAQ/+wAEf/lABX/2AAX/9gAKf/OADH/9gAy//YANAAKADYACgBJ/+wABQAQAAoAKP+mADAACgAz//YAPAAKABAAEAAUABb/7AAp/84AMP/sADEACgAz//YANP/2ADUACgA2/+wAOAAUADsACgA8AAoAPQAKAD8ACgBG/+IASAAKABUAFP/YABX/7AAW//YAI/+cACb/zgAo/2oAMP/iADH/9gAy/+wAM//iADT/7AA1//YANv/sADj/7AA5/9gAPv/YAED/4gBF/9gARv/OAEj/4gCP/+IAEAAXAAoAMQAeADT/7AA1ABQANgAKADcAFAA4ACgAOQAUADoACgA7AB4APAAWAD0ACgA+//YAPwAUAEMAFABGAAoAGQAV/+wAF//2ACP/ugAl/7oAJv/2ACf/4gAo/7oAMQAKADP/9gA1ABQANgAyADcACgA4AB4APAAUAD0AKAA/ACgAQP/2AEEAHgBCAAoAQwAUAEQAFABFABQARwAUAEgAFABJAAoACgAk/+IAJf/EADD/4gAx/+wAMv/2ADX/9gA2//YAOAAUAEb/7ABI/+wABwAz/+wANf/2ADYACgA4AB4AOQAKADsACgBCAAoACwAQ//YAFf/sABf/7AAm/+wAMP/iADP/2AA0/+IANf/sADr/9gBE/+wASf/sAAgAHgA1ACb/xAAwAAoAMv/2ADP/4gA0/+IANf/sADn/9gAIADT/9gA3AAoAOAAKADsAHgA8AB4AQwAUAEQACgBF//YACAAW/+wAHP/sACD/4gAo/2oAMv/2ADP/7AA0/+wAR//YAAgAFf/sABb/4gAa//YAIP/iADD/9gAy/+wANf/2AD7/9QAOABD/zgAU/84AFf/OABr/2AAo/0IAKf/iADD/7AAz/+wANP/2ADX/7AA3//0AP//iAEH/7ABD//4AAgAo/5IAQP/+AAgAFf/iABf/zgAo/7AAPv/+AD8AHgBA//YARf/iAEj/4gAGABD/2AAV/84AMP/2ADL/7AA0/+wANv/2AAcAI/+wADAACgAz//YANf/2ADb/9gA8/+wAQ//2AAYAMv/2ADv/9gA+//8AQP/2AET/9gBF/+IAAQBF/+IABgAX/9gAMP/2ADH/9gAz/9gAN//2AEL/4gAIABD/nAAw/+wAMv/sADP/4gA0/8QANf/2AD7/7ABH//YABAAV/84ANgAKAED/7ABI/+IADgAQ/7AAMP/iADH/7AAy/9gAM//YADT/7AA1//YANv/iADf/9gA5//YAO//sAED/zgBH/+wASf/YAAYAM//YADX/7AA5//YAOv/2ADv/7ABG//YAEQBP/+IAUAAeAFIACgBa/+wAXP/iAF//xABg/6YAYf9+AGL/ugBl/6YAaP+mAGoACgBtABQAb//EAHP/4gB8/84Agf/EADEAUP/sAFL/4gBU/84AVf/2AFv/4gBd/+IAX//iAGH/xABi/+IAY//sAGT/2ABl/5wAZv/iAGj/ugBs/+IAbf/YAG7/7ABv/+wAcP/sAHH/7ABy/+wAc//sAHT/zgB1/+wAdv/sAHf/7AB4/+wAef/iAHr/4gB7/9gAfP/YAH3/ugB+/7AAf/+wAID/ugCB/8QAgv/sAIP/zgCE/84Ahf/OAIb/zgCH/84AiP/OAIn/zgCK/84Ai//OAIz/zgCN/+IBLf/sACkAUv/YAFT/zgBb/+IAX//2AGD/7ABh/7AAZf+6AGj/xABs/+wAbf/2AG7/4gBv/84Acf/iAHL/zgBz/+IAdP/2AHX/7AB2/+IAd//iAHj/4gB6/+IAe//iAHz/4gB9/+IAfv/sAH//4gCA/+IAgf/sAIL/4gCD/9gAhP/YAIX/2ACG/+IAh//sAIj/zgCJ/84Aiv/OAIv/2ACM/+IAjf/iAS3/4gAvAE7/fgBS/9gAVf/iAFf/4gBY/+IAWf/OAFr/zgBc/84AX//OAGL/xABl/+wAZv/iAGf/9gBq/+wAbf/sAG7/nABv/8QAcP+mAHH/nABy/4gAc/+SAHT/xAB1/6YAdv/EAHf/4gB4/8QAef+wAHr/pgB8/4gAff+6AH7/ugB//5IAgP/YAIH/4gCC/84Ag//YAIT/ugCF/8QAhv+wAIf/sACI/7oAif+wAIr/ugCL/5wAjP+mAI3/ugEt/7AALgBPAAoAUQAKAFMACgBU/+IAWwAUAFz/4gBdAAoAXgAKAF//zgBi/84AZf/OAGb/4gBo/9gAagAUAG//sABw/+wAcf/sAHP/xAB0/+IAdf/iAHb/4gB3/+IAeP/OAHn/7AB6/9gAe//iAHz/sAB9/+IAfv/OAH//nACA/7AAgf/OAIL/sACD/+IAhP/YAIX/pgCG/9gAh//iAIj/ugCJ/+IAiv/iAIv/4gCM/+wAjf/sAS3/zgEyAAoAKgBU/+wAV//YAFv/7ABc/+wAX//YAGH/zgBi/+IAaP/iAG3/7ABu/+IAb//YAHD/4gBx/+wAcv/sAHP/zgB0//YAdf/2AHb/7AB3/9gAeP/YAHr/2AB7/+IAfP/sAH3/7AB+/+wAf//YAID/2ACB/9gAgv/iAIP/4gCE/84Ahf+6AIb/9gCH/+wAiP/iAIn/7ACK/+wAi//2AIz/7ACN/+wBLf/YATL/7AAoAE8ACgBQAAoAUQAKAFMAFABV//YAWwAUAFz/zgBdABQAXgAoAF//ugBi/9gAYwAeAGQAKABnAB4AaP/2AGoAHgBsABQAbQAUAG7/7ABv/8QAcP/2AHH/9gByAAoAc//YAHT/9gB1/+wAdv/2AHr/9gB7//YAfP/YAH7/7AB//84AgP/OAIH/2ACC/84Ahf/EAIj/zgCL/+IAjP/sAS3/2AAWAFL/4gBT/+wAVv/2AFf/4gBY/+wAXAAKAF3/4gBf/84AYP/iAGH/zgBi/+IAY//2AGX/zgBo/+IAbP/YAG7/9gBv/+wAcP/sAHH/9gBy//YAc//2AS3/9gAZAFcAHgBf/8QAaP/sAG3/9gBu/+IAb//EAHD/7ABx/+wAc//EAHT/7AB1/+wAeP/2AHr/9gB8/84Afv/iAH//ugCA/84Agf/YAIL/zgCF/84Ahv/2AIj/zgCL/+wAjP/sAS3/xAAjAE8ACgBTABQAVgAeAFgAHgBc/+IAXQAKAF//4gBi/+wAbv/iAG//2ABw/+wAcf/sAHP/ugB1/+wAdv/2AHf/7AB4/+wAev/2AHv/9gB8/7AAff/sAH7/2AB//7AAgP/iAIH/9gCC/9gAhf/OAIb/9gCH//YAiP/EAIn/9gCK//YAi//YAIz/9gEt/9gAJwBU//YAVf/iAFn/7ABbAAoAXP/EAF0ACgBf/84AYv+cAGj/sABpAAoAbv/OAG//nABx/+wAc/+mAHT/7AB1/+IAdv/CAHf/xAB4/8MAef/iAHr/9gB7//YAfP+mAH3/7AB+/8QAf/+SAID/pgCB/5IAgv+wAIT/4gCF/5IAhv/iAIf/7ACI/7AAiv/EAIv/4gCM/+wAjf/sAS3/ugAJAE8AFABbACwAXP/fAF0ACgBeABQAX//OAGL/9gBpABQAbAAKACUATgAKAE8AFABbAB4AXP/YAF0AFABf/84AYP/sAGL/2ABjABQAZf/iAGj/7ABqAB4Aa//iAGwAHgBtABQAbv/iAG//zgBw//YAcf/2AHL/9gBz/9gAdf/sAHb/4gB4/+wAegAKAHz/2AB+/+IAf//EAID/2ACB/84Agv/iAIX/xACI/84Ai//sAIz/4gCN/+wBLf/YAB8ATwAKAFAAFABRABQAUwAeAFQAFABXAAoAWAAUAFkAFABc/+EAXQAKAF4AFABf/84AYv/iAGwAHgBu/+wAb//EAHP/xAB4//YAfv/YAH//zgCA/9gAgf/YAIL/2ACD//YAhf/EAIf/9gCI/9gAif/2AIr/9gEt/84BMgAUADsATv/YAE//2ABQ/+IAUf/EAFL/zgBT/9gAVP/EAFX/7ABW//YAV//YAFj/2ABZ/+IAWv+6AFv/zgBd/9gAX//sAGD/zgBh/5wAYv/sAGP/zgBk/+IAZf+6AGf/2ABo/9gAaf/iAGr/2ABr/9gAbP/YAG3/4ABu/+IAb//iAHD/7ABx/+IAcv/iAHP/2AB0/9gAdf/2AHb/7AB3/+wAeP/sAHr/2AB7/+wAfP/OAH3/4gB+/+IAf//iAID/7ACB/9gAgv/iAIP/2ACE/9gAhf/YAIb/2ACH/9gAiP/OAIn/2ACK/9gBLf/iATL/zgAjAE8AKABQABQAUQAUAFIAFABUAAoAVwAKAFgACgBZAAoAWv/2AFsACgBc/9gAXgAUAF//4gBhAAoAYv/YAGMAFABl/+wAa//2AGwACgBtABQAbv/sAG//2ABz/84Aef/iAHr/9gB8/8QAfv/OAH//sACA/84Agf/OAIL/2ACD//YAhf/OAI3/7AEt/84ALABS/7AAU//iAFT/2ABV//YAWP/2AFn/4gBb/+IAXf/iAF//7ABh/+wAbP/2AG3/9gBu/9gAb//YAHD/7ABx/+wAcv/YAHP/ugB0/+wAdf/iAHb/9gB3//YAeP/sAHn/2AB6/84Ae//iAHz/ugB9/9gAfv/OAH//ugCA/+IAgv/OAIP/7ACE/+wAhf/2AIb/4gCH/+IAiP/sAIn/7ACK/+IAi//YAIz/7ACN/7oBLf/EABcAUgAUAFQAHgBVAAoAVwAKAFn/9gBa//YAWwAKAFwAFABhAAoAYwAUAGsAFABsABQAbQAKAG7/9gBz/+IAeP/2AHr/7AB7//YAfP/iAH//7ACB//YAhf/iAS3/7AAoAE7/sABa/+IAXP/iAF//7ABh//YAYwAKAG3/2ABu/7AAb//EAHD/ugBx/7AAcv/EAHP/nAB0/7oAdf+mAHb/xAB3/7oAeP+6AHn/pgB6/6YAe/+wAHz/kgB9/8QAfv/EAH//pgCA/8QAgf/OAIL/iACD/8QAhP/EAIX/ugCG/7oAh//EAIj/xACJ/6YAiv+6AIv/ugCM/8QAjf+cAS3/zgApAE7/iABV/+IAWv/iAFz/2ABdABQAX//YAGL/zgBt/+IAbv+mAG//pgBw/6YAcf+6AHL/nABz/4gAdP+wAHX/nAB2/8QAd//PAHj/pgB5/5wAev+cAHv/ugB8/3QAff+wAH7/ugB//2oAgP+wAIH/2ACC/5wAg//EAIT/ugCF/7oAhv+wAIf/pgCI/7AAif+6AIr/xACL/7oAjP+wAI3/pgEt/7AAMQBO/+IAT//OAFH/2ABS/8QAVP+6AFX/zgBW/+IAV//sAFj/9gBZ//YAWv/OAFv/2ABd/84AX//2AGD/7ABh/+wAY//JAGX/4gBo/7AAbP/iAG3/4gBu/+IAb//2AHD/7ABx//YAcv/iAHP/9gB0/+wAd//sAHj/7AB5/+IAev/iAHv/9gB8/+IAf//iAIH/7ACC//YAg//iAIT/2ACF//YAhv/2AIf/9gCI//YAif/2AIr/7ACL//YAjP/sAI3/7AEt//YAFQBPAAoAUwAUAFQACgBaAAoAWwAeAFz/xABdAB4AX//OAGD/9gBo/+wAbQAKAG7/9gBv/84Ac//OAHz/xAB+/+IAf//EAIH/ugCC/+IAhf+cAS3/7AAmAE8ACgBTABQAVAAUAFsAFABc/+wAX//OAGL/7ABkABQAZf/iAGYAFABnABQAaP/YAGwACgBu/+wAb//OAHD/9gBx//YAc//OAHT/9gB4/9gAef/sAHr/4gB7/+wAfP/OAH3/7AB+/+IAgP/iAIH/4gCC/9gAhf/OAIb/7ACI/9gAif/sAIr/7ACL/+IAjP/sAI3/7AEt/84AEwBPABQAUwAeAFQAFABc/8QAX//OAGL/7ABkAAoAZgAUAGj/4gBu/+IAb//EAHP/2AB7//YAfP/OAH7/9gB//84Agf/iAIL/9gEt/+wADgBPAAoAX//YAGQAFABnADIAbv/iAG//4gBz/9gAfP/OAH//xACB/+IAgv/iAIX/xACI/9gBLf/sABkAUwAKAFQAHgBc/+IAX//YAGD/7ABkAAoAaP/YAG7/4gBv/+IAcP/sAHH/9gBz/84Adf/2AHj/7AB5/+wAev/sAHv/7AB8/84Afv/sAH//2ACB/84Agv/OAIX/xACL//YBLf/YACgATv/OAFD/4gBR/84AUv//AFP/4gBU/+IAVf/YAFf/7ABY/9gAWv+6AF3/4gBg/3QAYf+IAGL/7ABj/+IAZf90AGj/nABp/+IAa//sAG3/4gBx//YAdP/iAHj/4gB5//YAev/sAH7/4gB//+IAgP/iAIH/zgCD/9gAhP/2AIX/2ACG/+wAh//sAIj/4gCJ/9gAiv/2AIv/9gCM/9gBMv/OABQAWAAUAFr/9gBc//YAX//sAGoAFABsAB4AbQAKAG7/9gBv/+wAc//YAHj/9gB5/+wAfP/sAID/9gCB/+IAgv/YAIX/zgCL//YAjf/2AS3/7AAeAE7/7ABR/9gAUv/sAFT/zgBY/+IAWv/YAFz/7ABd/+IAYP+SAGH/xABl/34AaP9qAGv/4gBt/+IAbv/2AG//9gBw/+wAcf/2AHL/9gB0/+IAeP/iAHr/9gB7//YAfv/iAH//9gCA/9gAgf/EAIP/2ACF/9gAiP/iABsATv/iAFP/4gBU/9gAWf/iAFr/4gBb/+IAXf/iAF//7ABg/9gAYf/YAGIACgBo/8QAbP/iAG3/7ABu/+IAb//sAHL/4gB4/+wAef/iAHr/7AB7//YAgv/2AIP/7ACF//YAiAAKAIz/7ACN/+wANQBO/7oAUP/YAFH/2ABS/8QAU//YAFT/zgBV/+wAV//iAFr/sABb/+IAXf/iAF7/9gBg/9gAYf/EAGL/9gBj/7oAZP/sAGX/ugBm/84AZ//OAGj/xABp/9gAa//qAG3/zgBu//YAb//2AHD/9gBx//YAcv/iAHP/9gB1//YAdv/iAHf/9gB4//YAef/2AHr/9gB8//YAff/2AH7/9gB//9gAgf/2AIL/9gCD//YAhP/sAIX/7ACG/+wAh//iAIj/9gCJ/+wAiv/sAIv/9gCM/+wAjf/sACcATgAKAE8ACgBQACgAUQAUAFMAFABUABQAVgAeAFz/4gBf/9gAYv/YAGMAFABl/+IAZgAUAGcACgBo/+IAbAAKAG0AFABu/+IAb//YAHD/9gBx//YAc//YAHT/9gB1//YAd//2AHj/7AB5/+wAev/sAHz/4gB+/+wAf//sAID/2ACB/9gAgv/iAIP/9gCE/9gAhf/OAIj/4gEt/+wAGgBl/2oAav/sAG4ACgBv/9gAcAAKAHH/9gByAAoAc//iAHT/7AB1/+wAdv/sAHf/7AB4//YAfP/YAH//zgCA/8QAgf+6AIL/7ACE//YAhf+6AIb/9gCI/84Ai//sAIz/9gCN//YBLf/iABEAWv+wAG7/9gBw//YAcf/2AHL/7ABz//YAdP/sAHX/4gB4/9gAfv/iAH//7ACD/+IAhP/sAIX/2ACG/9gAh//YAIv/9gAUAFj/7ABa/6YAbgAKAHH/7AB0/+wAdf/sAHj/2AB+/+IAf//iAID/4gCB/9gAgv/2AIP/zgCF/84Ah//OAIj/4gCK/+IAi//2AIz/2ACN/84ADABX/+wAWP/iAFr/ugBu/+wAb//2AHL/7AB1/+wAeP/2AHz/7AB//+IAgQAKAIL/4gAYAFb/2ABa/+wAbv/sAG//4gBz/84AdP/2AHX/7AB3/+wAe//2AHz/4gB9/+wAfv/sAH//ugCA/+IAgf/2AIMACgCE/+wAhf/YAIb/9gCH/8EAiP/iAIr/9gCL/+IAjAAUAA8AV//2AFj/2ABa/7oAb//2AHAACgBxAAoAcv/2AHP/7AB4/+IAfv/sAH//7ACB/+wAhP/sAIX/2ACH/+wAFABa/9gAYv/sAG7/9gBv//YAcAAKAHIACgBz/+IAeAAKAHkACgB7AAoAfP/sAH0ACgB+//YAf/+6AIL/7ACDAAoAhAAKAIj/2ACMAAoAjQAKAAwAWv+wAG7/9gBv/+IAcP/sAHH/7AB5AAoAev/sAH7/4gB//84AgP/iAIH/2ACF/+IADQBa/84AYP/sAHQACgB2ABQAfP/2AH//2ACA//YAgv/iAIMACgCF/8QAiwAKAIwACgEt//YAAgBg/9gAeAAKABgAVv/sAFf/9gBY/+IAbv/EAG//sABw//YAc/+mAHT/7AB1/+IAd//iAHj/zgB5/+IAev/iAHv/7AB8/7AAfv/iAH//zgCC/6YAhf+wAIj/xACJ/9gAi//iAIz/4gEt/6YACQBu//YAb//2AHAAKAByAB4Ac//iAHQAFAB6AAoAf//OAI0AFAAHAFr/4gBz/+IAdAAKAHsAFAB8/+wAf//YAIwAHgAJAG0ACgBxAAoAcgAKAHP/9gB0AAoAeAAKAHz/4gB//+IAjAAUABcATv/YAFf/xABY/84AWv+wAF3/4gBt/+IAbv/sAHD/9gBx/+0Acv/sAHT/2AB2/+wAd//sAHj/9gB5/+IAev/sAH3/4gB//+wAgf/YAIX/2ACK//YAi//sAI3/7AAIAHEACgByABQAdAAKAHgACgB+//YAf//sAIEACgCMABQAFwBY/8QAWv+6AHL/9gBz//YAdP/YAHX/4gB2/+wAeP/sAHn/4gB6/+IAe//iAH//4gCD//YAhP/sAIX/4gCG//YAh//sAIj/9gCJ/+IAiv/2AIv/7ACM//YAjf/iAAsAWv/YAG4AHgBwAAoAcgAUAHQAFAB1AAoAewAKAIEAHgCGABQAhwAUAIwACgAMAFb/zgBX//YAWP/sAFr/xABt/9gAcAAKAHL/9gB1/+wAd//sAIL/7ACM/+IAjf/YABwAVv/EAFf/2ABa/6YAW//OAGD/zgBs//YAbf/iAG7/xABv/9gAcP/2AHH/4gBy/9gAc/+wAHT/4gB1/9gAdv/sAHf/2AB8/7oAff/iAH//nACA/+wAgv/FAIT/7ACG//YAi//2AIz/9gCN/84BLf+6ABoAUv/EAFb/2ABX/84AWP/EAG7/9gBw/+wAcf/iAHL/7AB0/+IAdv/YAHf/zgB4/84Aef/2AHr/4gB7/+IAf//sAID/2ACB/9gAg//YAIT/2ACF/84Ahv/iAIj/9gCL/+IAjP/iAI3/7AAIAHIAKAB0AAoAdgAUAHgAFAB+ABQAf//EAIQAHgCMACgACwBv/9gAcAAKAHIAHgBz/9gAdP/2AH4AFAB//+wAgv/2AIX/7ACMABQAjQAKAAgAWv/YAG//2ABwABQAcQAKAH7/9gB//+IAgv/sAIYAFAAKAFr/4gBl/7oAbgAKAG//2ABxAAoAfgAKAH//7ACC/+IAhwAeAIoACgAIAGX/2ABuABQAb//iAHEACgB+AAoAf//sAIj/7ACKAAoAFQBW/8QAWP/EAFr/pgBl/2oAbf/2AG7/9gBv/9gAcP/OAHH/4gBy/+IAc//sAHT/xAB+/9gAf//iAIL/9gCD/9gAhP/iAIX/iACJ/+AAiv/2AIz/2AADAHEACgCKAB4AiwAKABgAUv/YAFr/ugBt/+IAb//iAHD/2ABy/+IAc//OAHT/xAB1//YAdv/YAHf/4gB4/9gAev/iAH7/xAB//84Ag//YAIT/2ACF/5wAhv/iAIf/4gCI/7AAi//sAIz/2ACN/+IAFABW/84AWP/iAFr/ugBn//YAbf/YAG7/7ABv/+wAcP/iAHL/2AB2/84Ad//iAHj/4gB+/+IAf//YAIH/7ACD/84AhP/iAIX/4gCJ/+wAjP/sAB4AVv/OAFj/xABa/7oAbf/EAG7/4gBv//YAcP/YAHP/7AB0/8QAdv/YAHf/zgB4/+IAev/iAHv/2AB9/9gAfv/OAH//2ACA/+IAgf/iAIL/9gCD/84AhP/sAIX/zgCG/84Ah//OAIj/4gCJ/9gAiv/YAIv/4gCN/+wAEQByABQAdP/2AHgACgB5AAoAegAKAHsACgB8/+wAfQAUAH7/9gCC/+wAgwAKAIQAFACF/+IAhwAKAIkACgCKAAoBLf/sAAIAWv/OAHT/7AAEAFP/4gBU/+wAXP/sAGj/4gACAAH/4gAJ//YAAgAHAAEACQAAAA8AKQAJADAASQAkAE4AjQA+AS0BLQB+ATIBMgB/AUUBRQCAAQAEAgABAQEHR3JlZ29yAAEBASr4EAD4zwH4zwwA+NAC+NAD+BgE+xz7yvq0+jcFHBJzDxwUCRGgHFhWEgC2AgABAAgADwAWAB0AJAArADIAOQBAAEcATgBVAFwAYwBqAHEAeAB/AIYAjQCUAJsAogCpALAAtwC+AMUAzADTANoA4QDoAO8A9gD9AQQBCwESARkBIAEnAS4BNQE8AUMBSgFRAVgBXwFmAW0BdAF7AYIBiQGQAZcBngGlAawBswG6AcEByQHVAd4B6QHxAfYB/QIDAgkCEAIUAhsCJAIsAi4CMwI6AkECSAJPAlYCXQJkAmsCcgJ5AoAChwKOApUCnAKjAqoCsQK4Ar8CxgLNAtQC2wLiAukC8AL3Av4DBQMMAxMDGAMfAyYDMQM4Az8DRgNNA1MDWQNfA2UDawNyA3gDhQOKA5EDlwOdA6QDqgO3A8EDyAPOA9gD3wPmA+wD8wP6BAEECAQOBBgEHgQkBCoEMQQ4BD8ERgRNBFMEWgRkBGsEcQR3BH0EgwSIBI8EnASiBKgErwS2BLwEwgTIBM4E1QTcBOME8AT3BTMFOXVuaTA0MTB1bmkwNDExdW5pMDQxMnVuaTA0MTN1bmkwNDE0dW5pMDQxNXVuaTA0MTZ1bmkwNDE3dW5pMDQxOHVuaTA0MTl1bmkwNDFBdW5pMDQxQnVuaTA0MUN1bmkwNDFEdW5pMDQxRXVuaTA0MUZ1bmkwNDIwdW5pMDQyMXVuaTA0MjJ1bmkwNDIzdW5pMDQyNHVuaTA0MjV1bmkwNDI2dW5pMDQyN3VuaTA0Mjh1bmkwNDI5dW5pMDQyQXVuaTA0MkJ1bmkwNDJDdW5pMDQyRHVuaTA0MkV1bmkwNDJGdW5pMDQzMHVuaTA0MzF1bmkwNDMydW5pMDQzM3VuaTA0MzR1bmkwNDM1dW5pMDQzNnVuaTA0Mzd1bmkwNDM4dW5pMDQzOXVuaTA0M0F1bmkwNDNCdW5pMDQzQ3VuaTA0M0R1bmkwNDNFdW5pMDQzRnVuaTA0NDB1bmkwNDQxdW5pMDQ0MnVuaTA0NDN1bmkwNDQ0dW5pMDQ0NXVuaTA0NDZ1bmkwNDQ3dW5pMDQ0OHVuaTA0NDl1bmkwNDRBdW5pMDQ0QnVuaTA0NEN1bmkwNDREdW5pMDQ0RXVuaTA0NEZub3RlcXVhbGdyZWF0ZXJlcXVhbGxlc3NlcXVhbGFwcHJveGVxdWFsaW5maW5pdHlEZWx0YXJhZGljYWxhYnJldmVBYnJldmVsb3plbmdlRXVyb3Byb2R1Y3RzdW1tYXRpb25pbnRlZ3JhbHBpT21lZ2F1bmkwMEFEdW5pMDQwRXVuaTA0MDN1bmkwNDUzdW5pMDQ1Q3VuaTA0MEN1bmkwNDU2dW5pMDQ1NHVuaTA0NTd1bmkwNDA3dW5pMDQwNnVuaTA0NTF1bmkwNDU4dW5pMDQwOHVuaTA0NUV1bmkwNDVCdW5pMDQwMXVuaTA0MDV1bmkwNDU1dW5pMDQ5MXVuaTA0MDR1bmkwNDkwdW5pMDQwQnVuaTA0MEZ1bmkwNDVGdW5pMDQwOXVuaTA0NTl1bmkwNDBBdW5pMDQ1QXVuaTA0NTJ1bmkyMTE2dW5pMDQwMl8wMDMxdW5pMDBBMHVuaTAzQTlwYXJ0aWFsZGlmZkFtYWNyb25hbWFjcm9uQW9nb25la2FvZ29uZWtDY2Fyb25jY2Fyb25jYWN1dGV6YWN1dGVkY2Fyb25lbWFjcm9ubmFjdXRldWh1bmdhcnVtbGF1dHVyaW5ndW1hY3JvbnRjYXJvbnNhY3V0ZXVuaTAxNTdyYWN1dGVvaHVuZ2FydW1sYXV0emRvdGFjY2VudHVuaTAxMzdlY2Fyb25lZG90YWNjZW50ZW9nb25la3VuaTAxMjNyY2Fyb25vbWFjcm9udW9nb25la1VtYWNyb25Fb2dvbmVrRWNhcm9uRWRvdGFjY2VudENhY3V0ZVphY3V0ZURjYXJvbkVtYWNyb25pbWFjcm9uaW9nb25la0lvZ29uZWt1bmkwMTM2bmNhcm9udW5pMDEyMlpkb3RhY2NlbnR1bmkwMTU2UmNhcm9uUmFjdXRlU2FjdXRlVGNhcm9uVXJpbmdVb2dvbmVrVWh1bmdhcnVtbGF1dE5jYXJvbk5hY3V0ZXVuaTAxNDZ1bmkwMTQ1bGFjdXRlTGFjdXRlbGNhcm9uTGNhcm9udW5pMDEzQ3VuaTAxM0JPbWFjcm9uT2h1bmdhcnVtbGF1dEltYWNyb25Db3B5cmlnaHQgKGMpIDIwMTMgYnkgVmljdG9yaWEgT25pc2h1ay4gQWxsIHJpZ2h0cyByZXNlcnZlZC5HcmVnb3IAmAIAAQBUAJcAxADOAQ8BQgFNAXEBfwGRAbcB3AHgAhMCFwIcAk8CZALMAvIDWQO6A8ADywPoA+wEEgQrBC8EZgSrBL8FAwVMBY0FkgWWBbgFywXvBfYF/AYNBkcGdQZ+BoIGiQaOBr8G8QcTBzUHOQc+B1kHXQdhB4kHjQeRB5YHnAemB6oHrgfMB9AH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);\n}\n\n.scrollbox {\n\theight: 100%;\n\tmargin: 0 0 0 16%;\n\toverflow: auto;\n\t-webkit-overflow-scrolling: touch;\n\tbackground-color: transparent;\n}\n\n.hide {\n\tdisplay: none !important;\n}\n\n#root > .scrollbox {\n  width: 84%;\n  position: fixed;\n}\n\n.editor , .backdrop {\n  position: relative;\n  width: 96%;\n  margin: 3.5% 0 0 4%; /* make sure cursor is not hidden in very top left corner */\n  padding: 0 20% 8% 0;\n  min-height: 88%;\n  font: normal 24px/150% 'Alegreya', Georgia, serif;\n  outline: none;\n  overflow: auto;\n  border: none;\n  background: transparent;  /* firefox mobile has a gradient otherwise */\n  -webkit-overflow-scrolling: touch; /* enable native smooth scrolling on iOS */\n  word-wrap: break-word; /* prevent scrolling for long words or links without whitespace */\n  -webkit-tap-highlight-color: rgba(0,0,0,0); /* prevent grey flash when clicking */\n  box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  -webkit-box-sizing: border-box;\n  -ms-box-sizing: border-box;\n\tresize: none;\n}\n\n.editor.cyrillic {\n  font-family: 'Gregor', Georgia, serif;\n}\n\n.editor.rtl {\n  direction: rtl;\n}\n\n.date {\n\tposition: relative;\n\tfloat: left;\n\tmargin: 0 0 2% 4%;\n\topacity: .2;\n\tfont-size: 14px;\n  cursor: default;\n  -moz-user-select: none;\n  -webkit-user-select: none;\n  -ms-user-select: none;\n}\n\naside > .scrollbox{\n  width:100%;\n  margin:0;\n}\n\naside {\n  position: fixed;\n  width: 16%;\n  min-width: 135px;\n  height: 100%;\n  padding-right: 5px; /* If the sidebar has a scrollbar, there should be some space */\n  opacity: 0;\n  overflow: auto;\n  -moz-user-select: none;\n  -webkit-user-select: none;\n  -ms-user-select: none;\n  /* prevent grey flash when clicking */\n  -webkit-tap-highlight-color: rgba(0,0,0,0);\n  box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  -webkit-box-sizing: border-box;\n  -ms-box-sizing: border-box;\n  transition: opacity 0.4s;\n  -webkit-transition: opacity 0.4s;\n  -moz-transition: opacity 0.4s;\n  -o-transition: opacity 0.4s;\n  -ms-transition: opacity 0.4s;\n}\n\naside:hover,\naside:focus,\n.show-aside aside {\n  opacity: 1;\n}\n\n.search {\n  display: block;\n  opacity: 0.5;\n  z-index: 100;\n  width: 76%;\n  font-size: 16px;\n  margin: 18px 15px 15px 17px;\n  padding: 0;\n  background: none;\n  outline: none;\n  border: none;\n  border-bottom: 1px solid #999;\n  height: 33px;\n  -webkit-transition: all 0.3s ease;\n  -moz-transition: all 0.3s ease;\n  -o-transition: all 0.3s ease;\n  -ms-transition: all 0.3s ease;\n  transition: all 0.3s ease;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  -ms-box-sizing: border-box;\n  box-sizing: border-box;\n  /* Default search style in Safari conflicts with our styling */\n  -webkit-appearance: textfield;\n}\n\n.search:hover,\n.search:focus {\n  opacity: 1;\n}\n\n.search.hide {\n  height: 0;\n  padding: 0;\n  margin: 0;\n  border: 0;\n}\n\naside a,\n.add {\n\tdisplay: block;\n  cursor: pointer;\n  outline: none;\n\tcolor: #444;\n  text-decoration: none;\n\twhite-space: nowrap;\n  overflow: hidden;\n}\n\n.add {\n\tposition: relative;\n\tcolor: #999;\n\tpadding: 18px 18px 4px 18px;\n\tfont-weight: bold;\n}\n\n.add:hover, .add:focus {\n  color: #000;\n}\n\n.entries {\n\theight: auto;\n  display: block;\n\tmargin: 0;\n\tpadding: 0;\n\tpadding-top: 7px;\n\t-webkit-overflow-scrolling: touch; /* enable native smooth scrolling on iOS */\n\tlist-style: none;\n}\n\n.entries a {\n\ttext-overflow: ellipsis;\n  height: 1.35em;\n  padding: .5em 0 .5em 1.2em;\n\t-webkit-tap-highlight-color: rgba(0,0,0,0); /* prevent grey flash when clicking */\n}\n\n.entries a:hover,\n.entries a:focus,\n.entries .selected {\n\tcolor: #000;\n}\n\n.entries .selected {\n\tfont-weight: bold;\n}\n\n.entries li:last-child {\n\tmargin-bottom: 50px; /* some space after the last document in the list */\n}\n\n\nfooter {\n  position: fixed;\n  bottom: 0;\n  padding: 1em 2em;\n  font-size: .7em;\n  white-space: nowrap;\n  cursor: default;\n  text-shadow: 1px 0 white, 0 1px white, -1px 0 white, 0 -1px white;\n}\n\nfooter a {\n  display: inline;\n  padding: 0;\n  cursor: alias;\n}\n\n#remotestorage-connect {\n  position: absolute;\n  top: 0 !important;\n\tright: 3px !important;\n  z-index: 100000;\n  /* Add some space on left to keep menu button visible on mobile */\n  margin-left: 36px;\n  -moz-user-select: none;\n  -webkit-user-select: none;\n  -ms-user-select: none;\n}\n\n::-webkit-scrollbar {\n  width: .2em;\n}\n\n::-webkit-scrollbar-track-piece {\n  background-color: transparent;\n}\n\n::-webkit-scrollbar-thumb {\n  background: rgba(50,50,50,.3);\n}\n\n::selection {\n  background-color: rgba(255,255,0,.5);\n}\n\n::-moz-selection {\n  background-color: rgba(255,255,0,.5);\n}\n\n\n.menu-button {\n\tdisplay: none;\n}\n\n.actions {\n\tcolor: #444;\n  opacity: .5;\n\tfont-size: 14px;\n\tfloat: right;\n\tmargin-right: 2%;\n\tmargin-bottom: 2%;\n\t-moz-user-select: none;\n\t-webkit-user-select: none;\n\t-ms-user-select: none;\n}\n.actions:hover {\n  opacity: 1;\n}\n\n.delete,\n.share,\n.unshare,\n.link {\n\tcursor: pointer;\n}\n\n.sharing {\n  display: inline;\n  margin-left: 15px;\n}\n\n.link {\n\tcolor: #444;\n\ttext-decoration: none;\n\tmargin-right: 15px;\n\tdisplay: none;\n}\n\n.unshare {\n\tdisplay: none;\n}\n\n.delete:hover,\n.share:hover,\n.unshare:hover,\n.link:hover {\n\ttext-decoration: underline;\n}\n\n.is-shared .link,\n.is-shared .unshare {\n\tdisplay: initial;\n}\n\n.is-shared .share {\n\tdisplay: none;\n}\n\n\n/* Smartphones (portrait and landscape) ----------- */\n\n/* keep in sync with value in utils.js */\n@media (max-width: 1024px) {\n\n\t#root > .scrollbox {\n\t\twidth: 100%;\n    margin: 0;\n\t\toverflow-x: hidden;\n\t}\n\n  .snap-content {\n    position: absolute;\n    top: 0;\n    right: 0;\n    bottom: 0;\n    left: 0;\n    z-index: 2;\n    overflow: auto;\n    background: #fcfcfc url(data:image/png;base64,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) repeat;\n    -webkit-overflow-scrolling: touch;\n            transform: translate3d(0, 0, 0);\n    -webkit-transform: translate3d(0, 0, 0);\n       -moz-transform: translate3d(0, 0, 0);\n        -ms-transform: translate3d(0, 0, 0);\n         -o-transform: translate3d(0, 0, 0);\n\t  -webkit-box-shadow: 0 0 20px -2px rgba(100,100,110,.3);\n\t  box-shadow: 0 0 20px -2px rgba(100,100,110,.3);\n  }\n\n  .editor, .backdrop {\n    padding-right: 4%;\n  }\n\n  .actions {\n    margin-right: 5%;\n    margin-bottom: 5%;\n  }\n\n\t.snapjs-left .editor, .snapjs-left .backdrop {\n\t\topacity: .5;\n\t}\n\n\taside {\n\t\topacity: 1;\n    font-size: 24px;\n    background: #fcfcfc url(data:image/png;base64,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) repeat;\n    position: absolute;\n    top: 0;\n    bottom: 0;\n    width: 265px;\n    -webkit-overflow-scrolling: touch;\n\t}\n\n\t.add {\n    padding:4px .5em;\n  }\n\n\t.entries {\n    /* always show scrollbar on mobile to prevent scroll issues */\n\t\toverflow-y: auto;\n\t}\n\n\t.entries a {\n    padding: 10px 0 10px 14px;\n  }\n\n  .entries a:hover,\n  .entries a:focus {\n\t\tcolor: initial; /* prevent flickering when scrolling on mobile */\n\t}\n\n\t.menu-button {\n    display: block;\n    z-index: 1;\n    left: 0; top: 0;\n    padding: 14px;\n    cursor: pointer;\n    -moz-user-select: none;\n    -webkit-user-select: none;\n    -ms-user-select: none;\n    /* prevent grey flash when clicking */\n    -webkit-tap-highlight-color: rgba(0,0,0,0);\n\t}\n\n\tfooter {\n    display: none;\n  }\n\n  .date {\n    display: none;\n  }\n\n/* end of Smartphone styles */\n}\n\n\n@media print {\n\t.entries,\n  .menu-button,\n  footer,\n  #remotestorage-connect {\n\t\tdisplay: none;\n\t}\n\n\tbody, .editor , .backdrop{\n\t\tmargin: 0;\n\t\tpadding: 10px;\n\t\theight: auto;\n\t\twidth: auto;\n\t\tposition: static;\n\t}\n\n}\n\n.editor {\n  z-index: 2;\n}\n\n.backdrop {\n  position: absolute;\n  z-index: 1;\n  /* border: 2px solid #685972; */\n  /* background-color: #fff; */\n  overflow: auto;\n  pointer-events: none;\n  -webkit-transition: -webkit-transform 1s;\n  transition: -webkit-transform 1s;\n  transition: transform 1s;\n  transition: transform 1s, -webkit-transform 1s;\n}\n\n.highlights {\n\twhite-space: pre-wrap;\n\tword-wrap: break-word;\n\tcolor: transparent;\n}\n\nmark {\n  border-radius: 3px;\n  color: transparent;\n  /* background-color: #b1d5e5; */\n  background-color:rgba(255,255,0,.5);\n}\n\n"
  root.innerHTML = "\n\t<div id=\"snap-content\" class=\"snap-content scrollbox\">\n\t\t<svg id=\"menu-button\" class=\"menu-button\" height=\"15\" width=\"15\">\n\t\t\t<path d=\"m0 0v3h15v-3h-15zm0 6v3h15v-3h-15zm0 6v3h15v-3h-15z\"/>\n\t\t</svg>\n\n\t\t<div id=\"remotestorage-connect\"></div>\n\t\t<div class=\"backdrop\">\n\t\t\t<div class=\"highlights\"></div>\n\t\t</div>\n    <textarea id=\"editor\" class=\"editor\"></textarea>\n\n    <div class=\"actions\">\n      <span id=\"delete\" class=\"delete hide\"></span>\n      <div id=\"sharing\" class=\"sharing hide\">\n        <span class=\"share\"></span>\n        <a class=\"link\" target=\"litewrite-public\"></a>\n        <span class=\"unshare\"></span>\n      </div>\n    </div>\n\n\t\t<div id=\"date\" class=\"date\"></div>\n\t</div>\n\n  <aside>\n    <input type=\"search\" id=\"search\" class=\"search hide\">\n    <div id=\"add\" class=\"add\">+</div>\n    <ul id=\"entries\" class=\"entries scrollbox\"></ul>\n\n    \n  </aside>\n\n\t"
  root.prepend(style)

  const status = root.querySelector('#remotestorage-connect')
  const editor = root.querySelector('#editor')
  status.setAttribute('role', 'status')
  editor.disabled = true
  const showStatus = message => { status.textContent = message }

  showStatus('Loading Atomic notes…')
  const documents = await _atomic_drive_storage_js__WEBPACK_IMPORTED_MODULE_1__(store, showStatus)
  await new Promise((resolve, reject) => {
    const litewrite = new _litewrite_js__WEBPACK_IMPORTED_MODULE_0__({ documents, onError: reject, useHistory: false })
    litewrite.once('ready', () => {
      litewrite.open()
      editor.disabled = false
      if (status.textContent === 'Loading Atomic notes…') showStatus('Atomic storage connected')
      resolve()
    })
  })
}

export { view };
