define(['util/type', 'helper/events', 'tpl!facebox'], function(type, Events, faceBoxTemplate) {
  'use strict';

  MultiFaceController.Events = type.createEnum(['EDIT', 'EXIT', 'CHANGE']);
  MultiFaceController.status = type.createEnum(['ENABLE', 'DISABLE']);

  Events.mixin(MultiFaceController);
  function MultiFaceController(options) {
    this.faces = [];
    this.iv = options.iv;
    this.options = options;
    this.mousetrap = options.mousetrap;
    this.boxes = [];
    this.display = true;
    this.status = MultiFaceController.status.DISABLE;
    var self = this;
    this.mousetrap.bind('enter', function() {
      if (self.status === MultiFaceController.status.ENABLE) {
        noBtn.click();
      }
    });
    this.mousetrap.bind('space', function() {
      if (self.display) {
        self.iv.boxEl.className = 'box hide';
        self.display = false;
      }
      else {
        self.iv.boxEl.className = 'box';
        self.display = true;
      }
    });
    if (!options.noModify) {
      var noBtn = this.noBtn = document.createElement('button');
      noBtn.className = 'btn';
      noBtn.innerText = options.noBtnText || '完成(Enter)';
      noBtn.style.right = '0'
      noBtn.style.bottom = '40px';
      noBtn.style.display = 'none';
      noBtn.onclick = function() {
        self.trigger(MultiFaceController.Events.EXIT, self.faces);
      };
      document.body.appendChild(noBtn);
      var newBtn = this.newBtn = document.createElement('button');
      newBtn.className = 'btn';
      newBtn.innerText = '添加脸(A)';
      newBtn.style.right = '0';
      newBtn.style.bottom = '80px';
      newBtn.style.display = 'none';
      newBtn.onclick = function() {
        self.trigger(MultiFaceController.Events.EDIT, [-1, null]);
      };
      this.mousetrap.bind('a', function() {
        if (self.status === MultiFaceController.status.ENABLE) {
          newBtn.click();
        }
      });
      document.body.appendChild(newBtn);
    }
  }
  var prototype = MultiFaceController.prototype;
  prototype.makeUpbox = function() {
    var self = this;
    var faceBoxClickListener = function(e){
      if (e.button === 0) {
        var id = this.getAttribute('data-id', -1);
        if (e.target.className === 'close') {
          self.removeFace(id);
          self.trigger(MultiFaceController.Events.CHANGE, self.faces);
        } else {
          self.trigger(MultiFaceController.Events.EDIT, [id, self.faces[id]]);
        }
      }
    };
    while (this.boxes.length < this.faces.length) {
      var id = this.boxes.length;
      var box = document.createElement('div');
      box.className = 'bounding-box';
      box.setAttribute('data-id', id);
      if (!this.options.noModify) {
        box.innerHTML = faceBoxTemplate();
      }
      box.onclick = faceBoxClickListener;
      this.iv.boxEl.appendChild(box);
      this.boxes.push(box);
    }
  }
  prototype.removeFace = function(id) {
    this.faces.splice(id, 1);
    var box = this.boxes.pop();
    box.onclick = null;
    box.remove();
    this.show();
  }
  prototype.editFace = function(id, result) {
    if (id === -1) {
      this.faces.push(result);
    }
    else {
      this.faces[id] = result;
    }
    this.trigger(MultiFaceController.Events.CHANGE, this.faces);
  };
  prototype.setData = function(data) {
    this.iv.clearbox();
    if (data instanceof Array) {
      this.faces = data;
      this.boxes = [];
      this.makeUpbox();
    }
    else {
      this.faces = [];
      this.boxes = [];
    }
  }
  prototype.show = function() {
    this.status = MultiFaceController.status.ENABLE;
    this.makeUpbox();
    if (!this.options.noModify) {
      this.noBtn.style.display = 'block';
      this.newBtn.style.display = 'block';
    }
    for (var i = 0, length = this.faces.length; i < length; i++) {
      var points = this.faces[i].basic_points;
      var minX, maxX, minY, maxY;
      minX = maxX = points[0][0];
      minY = maxY = points[0][1];
      for (var j = 1; j < points.length; j++) {
        minX = Math.min(minX, points[j][0]);
        minY = Math.min(minY, points[j][1]);
        maxX = Math.max(maxX, points[j][0]);
        maxY = Math.max(maxY, points[j][1]);
      }
      var paddingX = (maxX - minX) / 2;
      var paddingY = (maxY - minY) / 2;
      var box = this.boxes[i];
      box.style.left = minX - paddingX - 5 + 'px';
      box.style.top = minY - paddingY - 5 + 'px';
      box.style.width = (maxX - minX + 2 * paddingX )  + 'px';
      box.style.height = (maxY - minY + 1.7 * paddingY ) + 'px';
    }
    this.iv.boxEl.style.pointerEvents="auto";
    this.iv.afterLoad(function(el, iv) {
      var width = el.naturalWidth;
      var height = el.naturalHeight;
      var box = {
        width: width,
        height: height,
        x: width / 2,
        y: height / 2,
      };
      iv.center(box);
    });
  };
  prototype.normalize = function(id) {
    if (id != -1) {
      this.boxes[id].style.borderColor = '';
    }
  }

  prototype.highlight = function(id) {
    if (id != -1) {
      this.boxes[id].style.borderColor = '#0000FF';
    }
  }
  prototype.hide = function() {
    this.status = MultiFaceController.status.DISABLE;
    this.iv.boxEl.style.pointerEvents='none';
    if (!this.options.noModify) {
      this.noBtn.style.display = 'none';
      this.newBtn.style.display = 'none';
    }
  };
  return MultiFaceController;
});

