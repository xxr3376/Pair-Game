define(['util/type', 'helper/events', 'tpl!./pose'], function(type, Events, poseTemplate) {
  'use strict';

  PoseSelector.Events = type.createEnum(['USER_DONE']);
  PoseSelector.Status = type.createEnum(['INIT', 'PITCH', 'YAW']);

  Events.mixin(PoseSelector);
  function PoseSelector() {
    var el = this.el = document.createElement('div');
    this.status = PoseSelector.Status.INIT;
    el.className = 'pose-selector';
    el.style.display = 'none';
    this.result = null;

    document.body.appendChild(el); // ps show
    var self = this;
    el.onclick = function(e) {
      if (e.target.className.indexOf('select-pitch') > -1) {
        self.pitch = +e.target.dataset.cell;
        el.innerHTML = poseTemplate({ type: 'yaw', pitch: ['U', 'M', 'D'][self.pitch], prefix: '/static/img/pose/' });
        if (self.yaw !== null) {
          self.el.querySelectorAll('.select-yaw')[self.yaw].className += ' active';
        }
        this.status = PoseSelector.Status.YAW;
      } else if (e.target.className.indexOf('select-yaw') > -1) {
        self.yaw = +e.target.dataset.cell;
        self.trigger(PoseSelector.Events.USER_DONE, self.getResult());
        this.status = PoseSelector.Status.INIT;
      }
    };
    var doneBtn = this.doneBtn = document.createElement('button');
    doneBtn.className = 'btn';
    doneBtn.innerText = '跳过';
    doneBtn.style.left = '0';
    doneBtn.style.bottom = '80px';
    doneBtn.style.display = 'none';
    doneBtn.onclick = function() {
      if (self.status === PoseSelector.Status.PITCH) {
        el.innerHTML = poseTemplate({ type: 'yaw', pitch: ['U', 'M', 'D'][self.pitch], prefix: '/static/img/pose/' });
        if (self.yaw !== null) {
          self.el.querySelectorAll('.select-yaw')[self.yaw].className += ' active';
        }
        self.status = PoseSelector.Status.YAW;
      }
      else if (self.status === PoseSelector.Status.YAW) {
        self.trigger(PoseSelector.Events.USER_DONE, self.getResult());
        self.status = PoseSelector.Status.INIT;
      }
    };
    document.body.appendChild(doneBtn);
  }

  PoseSelector.prototype.getResult = function() {
    if (!this.result) {
      this.result = {};
    }
    this.result.pose_3_5 = {
      pitch: this.pitch,
      yaw: this.yaw,
    };
    return this.result;
  };
  PoseSelector.prototype.show = function(previousResult) {
    this.yaw = null;
    this.pitch = null;
    this.result = null;
    if (previousResult) {
      var result = this.result = previousResult;
      if (result.pose_3_5) {
        this.yaw = result.pose_3_5.yaw;
        this.pitch = result.pose_3_5.pitch;
        this.doneBtn.style.display = 'block';
      }
    }
    this.el.style.display = 'block';
    this.el.innerHTML = poseTemplate({ cells: ['U.jpg', 'D.jpg'], prefix: '/static/img/pose/' });
    if (this.pitch !== null) {
      this.el.querySelectorAll('.select-pitch')[this.pitch].className += ' active';
    }
    this.status = PoseSelector.Status.PITCH;
  };
  PoseSelector.prototype.hide = function() {
    this.el.style.display = 'none';
    this.doneBtn.style.display = 'none';
  };
  return PoseSelector;
});
