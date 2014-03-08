define(['jquery', 'util/type', 'helper/events', 'image-manager'], function($, type, Events, ImageManager) {
  'use strict';

  API.Events = type.createEnum(['NEW_IMAGE', 'DATA_READY']);

  Events.mixin(API);

  function API(vaildType, poseOption) {
    this.vaildType = vaildType;
    this.im = new ImageManager({ IMG_SERVER: poseOption.img_server} );
    this.server = poseOption.server;
    this.mode = poseOption.mode;
    this.task_id = poseOption.task_id;
    this.img_id = poseOption.img_id;
    this.user_id = poseOption.user_id;
    this.imgs = [];
  }
  API.prototype.begin = function() {
    var INIT_SETTING = {
      'new' : {
        'url' : this.server + 'getTaskInfo/' + this.task_id,
      },
      'edit' : {
        'url' : this.server + 'getDetail/' + this.task_id + '/' + this.img_id,
      },
      'view' : {
        'url' : this.server + 'getAllRecord/' + this.task_id + '/' + this.img_id,
      },
    }
    var initSetting = INIT_SETTING[this.mode];
    var self = this;
    $.getJSON(initSetting.url, function(reply) {
      if (reply.status === 'SUCCESS') {
        self.processReply(reply);
      }
      else {
        alert(reply.status);
      }
    });
  };
  API.prototype.setDataHead = function(data) {
    this.currentImg().data = data;
  };
  API.prototype.setFlagHead = function(dict) {
    this.currentImg().flags = dict;
  }
  API.prototype.fillBlank = function() {
    if (!this.currentImg().flags) {
      this.currentImg().flags = {rotate: 0};
    }
  }
  API.prototype.uploadHead = function(done, callback) {
    this.fillBlank();
    this.upload(this.imgs[0].id, this.currentImg().data, this.currentImg().flags, done, callback);
  };
  API.prototype.post_json = function(url, data, callback) {
    $.ajax({
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(data),
      dataType: 'json',
      url: url,
      success: callback
    });
  };
  API.prototype.upload = function (id, data, flags, done, callback) {
    var d = {
      'img_id': id,
      'data': data,
      'flags' : flags,
      'done': done,
    };
    if (done) {
      d['next'] = true;
    }
    var self = this;
    this.post_json('/api/submit/' + this.task_id, d, function (e) {
      if (e.status !== 'SUCCESS') {
        window.open('data:text/plain;charset=utf-8,' + d);
      }
      if (e.next) {
        self.imgs.push(e.next);
        self.im.fetch(e.next);
      }
      callback && callback();
    });
  };
  API.prototype.nextImage = function(before) {
    var oldImg = this.imgs.shift();
    before && before();
    this.im.pay(oldImg.id);
    if (this.imgs.length <= 0) {
      alert('No More');
      return;
    }
    this.trigger(API.Events.NEW_IMAGE, this.currentImg().id);
    this.trigger(API.Events.DATA_READY, this.currentImg());
  };
  API.prototype.borrow = function (id) {
    return this.im.borrow(id);
  };
  API.prototype.vaildCheck = function (data) {
    if (parseInt(data.task_id) !== this.task_id) {
      return false;
    }
    var match = false;
    for (var i = 0; i < this.vaildType.length; i++) {
      if (this.vaildType[i] === data.type) {
        match = true;
        break;
      }
    }
    if (!match) {
      return false;
    }
    return true;
  };
  API.prototype.currentImg = function() {
    if (this.mode === 'new' || this.mode === 'edit') {
      return this.imgs[0];
    }
    else {
      return this.imgs[0].data[this.user_id];
    }
  }

  API.prototype.processReply = function(data) {
    if (!this.vaildCheck(data)) {
      return;
    }
    if (this.mode === 'new') {
      this.imgs = data.data;
    }
    else {
      this.imgs = [data.data];
    }
    if (this.mode === 'view') {
      if (this.user_id == -1) {
        this.user_id = Object.keys(this.imgs[0].data)[0]
      }
      else {
        if (!this.imgs[0].data[this.user_id]) {
          alert('USRE_VAILD_FAILED');
          return;
        }
      }
    }
    this.im.init(this.imgs);
    this.trigger(API.Events.NEW_IMAGE, this.imgs[0].id);
    this.trigger(API.Events.DATA_READY, this.currentImg());
  };
  API.prototype.addHeadComment = function(accept, comment, callback) {
    if (accept) {
      this.currentImg().opinion = 'accept';
    }
    else {
      this.currentImg().opinion = 'reject';
      this.currentImg().comment = comment || '';
    }
    this.addComment(this.currentImg().record_id, accept, comment, callback);
  };
  API.prototype.addComment = function(record_id, accept, comment, callback) {
    var d = { };
    if (accept) {
      d['opinion'] = 'accept';
    }
    else {
      d['opinion'] = 'reject';
      d['comment'] = comment || '';
    }
    this.post_json('/api/evaluate/' + record_id, d, callback);
  };
  API.prototype.getUserList = function() {
    if (this.mode !== 'view') {
      throw 'getUserList can only user in view mode';
    }
    var list = {};
    console.log(this.imgs[0]);
    for (var user_id in this.imgs[0].data) {
      list[user_id] = this.imgs[0].data[user_id].username;
    }
    return list;
  }
  API.prototype.switchUser = function(user_id) {
    this.user_id = user_id;
    this.trigger(API.Events.DATA_READY, this.currentImg());
  };
  return API;
});
