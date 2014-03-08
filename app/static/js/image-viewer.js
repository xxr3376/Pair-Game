define(['util/type', 'helper/events', 'status-bar', 'jquery'], function(type, Events, statusBar, $) {
  'use strict';

  var ViewMode = type.createEnum([
    'NORMAL',
    'PAN',
  ]);

  var MIN_SCALE = 0.1;

  ImageViewer.Events = type.createEnum([
    'SCALE',
  ]);

  Events.mixin(ImageViewer);
  function ImageViewer(options) {
    var self = this;
    this.viewMode = ViewMode.NORMAL;
    this.lastPosition = [0, 0];

    this._updatePending = false;
    this._updateTransform = _updateTransform.bind(this);

    this.onloadList = [];

    var drag = false;

    var wrapEl = this.wrapEl = document.createElement('div');
    wrapEl.className = 'image-viewer';
    options.container.appendChild(wrapEl);

    wrapEl.onmousewheel = function(e) {
      e.preventDefault();
      e.stopPropagation();
      var delta = e.wheelDelta / 360;
      self.zoom(delta, e.pageX, e.pageY);
    };

    wrapEl.onmousedown = function(e) {
      e.preventDefault();
      e.stopPropagation();
      drag = true;
      if (e.button === 1) {
        self.viewMode = ViewMode.PAN;
      }
      self.lastPosition = [e.pageX, e.pageY];
    };

    wrapEl.onmousemove = function(e) {
      e.preventDefault();
      e.stopPropagation();

      var dx = e.pageX - self.lastPosition[0];
      var dy = e.pageY - self.lastPosition[1];
      self.lastPosition = [e.pageX, e.pageY];

      if (drag && self.viewMode === ViewMode.PAN) {
        self.pan(dx, dy);
      }
     /* else if (dragPoint !== false) {
        var x = (Math.sin(self.transform.roll) * dy + Math.cos(self.transform.roll) * dx) / self.transform.scale;
        var y = (Math.cos(self.transform.roll) * dy - Math.sin(self.transform.roll) * dx) / self.transform.scale;
        self.pointEl[dragPoint].style.webkitTransform = 'translate(' + (self.pointPos[dragPoint][0] += x) + 'px, ' + (self.pointPos[dragPoint][1] += y) + 'px)';
      }
        */
    };

    wrapEl.onmouseleave = wrapEl.onmouseup = function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.button === 1) {
        self.viewMode = ViewMode.NORMAL;
      }
    };

    var overlayEl = this.overlayEl = document.createElement('div');
    overlayEl.className = 'overlay';
    wrapEl.appendChild(overlayEl);
    var coverEl = this.coverEl = document.createElement('div');
    coverEl.className = 'cover';
    overlayEl.appendChild(coverEl);
    var boxEl = this.boxEl = document.createElement('div');
    boxEl.className = 'box';
    overlayEl.appendChild(boxEl);
  }

  var prototype = ImageViewer.prototype;

  prototype.setImage = function(imgEle) {
    this.el = imgEle;
    this.overlayEl.appendChild(this.el);
    var self = this;
    if (!this.el.complete) {
      this.el.onload = function(e) {
        self.el.onload = null;
        var target = e.target;
        var callback;
        while (callback = self.onloadList.shift()) {
          callback(target, self);
        }
      }
    }
    this.reset();
  };

  var _updateTransform = function() {
    this._updatePending = false;

    var transform = this.transform;
    var transformStyle = 'scale(' + transform.scale + ') ' +
                         'translate3d(' + transform.translateX + 'px,' + transform.translateY + 'px, 0) ' +
                         'rotateZ(' + transform.roll + 'rad)';

    var style = this.overlayEl.style;
    style.transform = transformStyle;
    style.mozTransform = transformStyle;
    style.webkitTransform = transformStyle;
    style.webkitTransformOrigin = transform.originX + 'px ' + transform.originY + 'px';
  };

  prototype.applyTransform = function() {
    if (this._updatePending !== true) {
      this._updatePending = true;
      window.requestAnimationFrame(this._updateTransform);
    }
  };

  prototype.zoom = function(delta, x, y) {
    var transform = this.transform;
    var scale = this.transform.scale;
    var N = 0.5;
    delta = scale * (delta > 0 ? N : (-1 / (1 + N))) * Math.abs(delta);
    if (scale + delta <= MIN_SCALE) {
      return;
    }
    // scale for translate offset
    scale = -delta / ((scale + delta) * scale);

    transform.translateX += (x - transform.originX) * scale;
    transform.translateY += (y - transform.originY) * scale;
    transform.scale += delta;

    this.trigger(ImageViewer.SCALE, transform.scale);
    this.applyTransform();
  };

  prototype.pan = function(dx, dy) {
    var transform = this.transform;
    transform.translateX += dx / transform.scale;
    transform.translateY += dy / transform.scale;

    this.applyTransform();
  };

  prototype.rollImage = function(p1, p2, center) {
    console.log(center);
    var roll = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
    this.transform.roll = -roll;
    this.transform.originX = center.x
    this.transform.originY = center.y
    this.applyTransform();
  };
  prototype.clearbox = function() {
    $(this.boxEl).empty().unbind();
  }
  prototype.clear = function() {
    $(this.coverEl).empty().unbind();
  }
  prototype.afterLoad = function(callback) {
    var self = this;
    if (this.el.complete) {
      callback(this.el, this);
    }
    else {
      this.onloadList.push(callback);
    }
  };
  prototype.center = function(box) {
    var roll = -this.transform.roll;
    var screen = {
      width: this.wrapEl.clientWidth,
      height: this.wrapEl.clientHeight,
    };
    var sin = Math.sin(roll);
    var cos = Math.cos(roll);

    var boxWidth = Math.abs(sin) * box.height + cos * box.width;
    var boxHeight = cos * box.height + Math.abs(sin) * box.width;
    var scale = Math.min(
      (screen.width / boxWidth),
      (screen.height / boxHeight)
    );
    this.transform.scale = Math.max(scale, MIN_SCALE);

    var ox = this.transform.originX;
    var oy = this.transform.originY;
    var dx = box.x - ox;
    var dy = box.y - oy;
    var x = cos * dx - sin * dy;
    var y = cos * dy + sin * dx;
    this.transform.translateX = (screen.width / 2 - ox) / scale - x;
    this.transform.translateY = (screen.height / 2 - oy)/ scale - y;
    this.applyTransform()
    this.trigger(ImageViewer.SCALE, scale);
  }
  prototype.reset = function(done) {
    var self = this;
    this.clear();
    this.transform = {
      scale: 1,
      roll: 0,
      translateX: 0,
      translateY: 0,
      originX: 0,
      originY: 0,
    };
    this.onloadList = [];
  };
  return ImageViewer;
});
