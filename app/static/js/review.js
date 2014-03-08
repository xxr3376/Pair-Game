// Generated by CoffeeScript 1.6.3
(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  define(['all-task', 'image-manager', 'jquery', 'tpl!reviewpanel', 'api'], function(AllTask, ImageManager, $, ReviewPanel, API) {
    var O, api, config, env, im, init, next, requestData, submit, wrapper;
    env = AllTask(window.poseOption.type, true);
    im = new ImageManager({
      IMG_SERVER: poseOption.img_server
    });
    O = window.poseOption;
    api = new API([], O);
    config = {};
    requestData = function() {
      return $.getJSON("" + O.server + "review/get/" + O.task_id + "/" + O.checklist_id, function(result) {
        if (result.status !== 'SUCCESS') {
          return alert(result.status);
        } else {
          config.id = result.id;
          config.path = result.path;
          return init(result);
        }
      });
    };
    wrapper = document.createElement('div');
    wrapper.className = 'admin-panel';
    document.body.appendChild(wrapper);
    init = function(result) {
      var commentBox;
      im.fetch(result);
      env.iv.setImage(im.borrow(result.id));
      env.ready_callback(result);
      wrapper.innerHTML = ReviewPanel({
        opinion: result.state,
        comment: result.reason || ''
      });
      commentBox = $('#admin-comment');
      ($('#admin-btn-accept, #admin-btn-reject')).on('click', function(e) {
        if (__indexOf.call(e.target.classList, 'active') < 0) {
          ($('#admin-btn-accept, #admin-btn-reject')).removeClass('active');
          e.target.classList.add('active');
          result.state = parseInt(e.target.dataset.state);
          if (e.target.dataset.state === '2') {
            commentBox.show();
          } else {
            commentBox.hide();
          }
        }
      });
      return ($('#admin-submit-btn')).on('click', function() {
        result.comment = commentBox.val();
        if (result.state === 2 && result.comment.length === 0) {
          alert('请填写不通过原因');
          return;
        }
        return submit(result.state, result.comment);
      });
    };
    submit = function(state, reason) {
      api.post_json("/api/review/submit/" + O.task_id + "/" + config.id, {
        state: state,
        reason: reason
      }, function(r) {
        if (r.status === "SUCCESS") {
          return next();
        } else {
          return alert(r.status);
        }
      });
    };
    next = function() {
      if (config.id === O.checklist_id) {
        return window.goBack();
      } else {
        im.pay(config.id);
        env.iv.clearbox();
        wrapper.innerHTML = '';
        return requestData();
      }
    };
    return requestData();
  });

}).call(this);
