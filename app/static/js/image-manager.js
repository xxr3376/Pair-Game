define([], function() {
  'use strict';
  function ImageManager(options) {
    this.fetchPool = {};
    this.IMG_SERVER = options.IMG_SERVER;
  }
  var prototype = ImageManager.prototype;
  prototype.init = function(data) {
    for (var i = 0; i < data.length; i++) {
      this.fetch(data[i]);
    }
  };
  prototype.fetch = function(imgMeta) {
    var id = imgMeta.id;
    if (this.fetchPool[id]) {
      return;
    }
    var img = document.createElement('img');
    var path = imgMeta.path;
    if (path.match(/^https?:\/\//)) {
      img.src = path;
    }
    else {
      img.src = this.IMG_SERVER + path;
    }
    this.fetchPool[id] = {
      node: img,
      id: id,
      hold: true,
      time: new Date()
    };
  };
  prototype.borrow = function(id) {
    var ele = this.fetchPool[id];
    if (ele === undefined) {
      throw 'Try to borrow img that havent fetched';
    }
    if (ele.hold === false) {
      throw 'Try to borrow img that havent pay back';
    }
    ele.hold = false;
    return ele.node;
  };
  prototype.pay = function(id) {
    var ele = this.fetchPool[id];
    if (ele === undefined) {
      throw 'Try to pay img that havent fetched';
    }
    if (ele.hold === true) {
      throw 'Try to pay img that already paid back';
    }
    ele.node.remove();
    ele.hold = true;
  };
  return ImageManager;
});
