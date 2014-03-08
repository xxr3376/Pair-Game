define(['util/polyfill', 'util/type', 'helper/events', 'tpl!adminpanel', 'api'], function(polyfill, type, Events, adminPanelTemplate, API) {
  'use strict';

  Admin.Events = type.createEnum(['USER_DONE']);

  Events.mixin(Admin);

  function Admin(api) {
    this.api = api;
    this.result = {
      opinion: 'fresh',
      comment : '',
    };
    var wrapper = this.wrapper = document.createElement('div');
    wrapper.className = 'admin-panel';
    document.body.appendChild(wrapper);

    var self = this;
    var switchButton = function(e) {
      if (e.target.className.indexOf('active') < 0) {
        self.accept_btn.className = self.reject_btn.className = 'button';
        e.target.className += ' active';
        self.result.opinion = e.target.dataset.state;
        if (e.target.dataset.state === 'reject') {
          self.commentBox.style.display = 'block';
        }
        else {
          self.commentBox.style.display = 'none';
        }
      }
    };

    api.on(API.Events.DATA_READY, function reload(imgDetail) {
      console.log(imgDetail);
      wrapper.innerHTML = adminPanelTemplate({
        users: api.getUserList(),
        current: api.user_id,
        opinion: imgDetail.opinion,
        comment: imgDetail.comment || '',
      });
      self.result.opinion = imgDetail.opinion;
      self.result.comment = imgDetail.comment || '';
      var accept_btn = self.accept_btn = document.getElementById('admin-btn-accept');
      var reject_btn = self.reject_btn = document.getElementById('admin-btn-reject');
      document.getElementById('admin-submit-btn').onclick = self.submit.bind(self);
      self.commentBox = document.getElementById('admin-comment');
      accept_btn.onclick = reject_btn.onclick = switchButton;
      document.getElementById('admin-user-select').onchange = function() {
        var user_id = this.selectedOptions[0].dataset.id;
        self.api.switchUser(user_id);
      };
    });
  }
  Admin.prototype.submit = function(e) {
    this.result.comment = this.commentBox.value;
    if (this.result.opinion === 'reject' && this.result.comment.length == 0) {
      alert('请填写不通过原因');
      return;
    }
    var self = this;
    if (this.result.opinion !== 'fresh'){
      this.api.addHeadComment(this.result.opinion === 'accept', this.result.comment, function() {
        self.trigger(Admin.Events.USER_DONE);
      });
    }
    else {
      this.trigger(Admin.Events.USER_DONE);
    }
  };
  return Admin;
});
