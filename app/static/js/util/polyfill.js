define(function() {
  'use strict';
  
  var polyfill = function() {

    // requestAnimationFrame
    var requestAnimationFrame = window.requestAnimationFrame ||
                                window.webkitRequestAnimationFrame ||
                                window.mozRequestAnimationFrame;
    if (!requestAnimationFrame) {
      requestAnimationFrame = function(callback) {
        setTimeout(callback, 1000 / 60);
      };
    }
    window.requestAnimationFrame = requestAnimationFrame;

  };

  return polyfill;
});
