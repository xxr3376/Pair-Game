define(['util/polyfill', 'util/type', 'helper/events', 'tpl!messagepanel', 'api'], function(polyfill, type, Events, messageTemplate, API) {

  Message.Events = type.createEnum('USER_DONE');

  Events.mixin(Message);

  function Message(api, mousetrap) {
    this.api = api;

    var wrapper = this.wrapper = document.createElement('div');
    wrapper.className = 'message-panel';
    document.body.appendChild(wrapper);

    wrapper.innerHTML = messageTemplate();
    this.submit_btn = document.getElementById('message-submit-btn');
    this.question_field = document.getElementById('message-question');
    if (api.mode == 'view') {
      this.submit_btn.disabled="disabled";
      this.submit_btn.style.cursor = "not-allowed";
      this.question_field.disabled="disabled";
    }
    else {
      this.submit_btn.onclick = this.submit.bind(this);
    }
    var self = this;
    api.on(API.Events.DATA_READY, function reload(imgDetail) {
      self.question_field.value = '';
      self.submit_btn.setAttribute('state', 'false');
      if (imgDetail.flags) {
        self.question_field.value = imgDetail.flags['bad_image_text'] || '';
        self.submit_btn.setAttribute('state', imgDetail.flags['bad_image'] || 'false');
        console.log(api.mode);
        if (api.mode == 'view') {
          if (!imgDetail.flags['bad_image']) {
            self.wrapper.style.display = "none";
          }
          else {
            self.wrapper.style.display = "block";
          }
        }
      }
    });
    mousetrap.bind('x', function() {
      self.submit_btn.click();
    });
  }
  Message.prototype.submit = function() {
    var exist_message = this.question_field.value;
    console.log(exist_message);
    if (!exist_message) {
      var new_message = prompt('请输入特殊情况内容');
      if (new_message) {
        exist_message = new_message;
        this.question_field.value = new_message;
      }
      else {
        return;
      }
    }
    this.api.setFlagHead({'bad_image': true, 'bad_image_text': exist_message});
    this.api.setDataHead([]);
    this.trigger(Message.Events.USER_DONE);
  }
  return Message;
});
