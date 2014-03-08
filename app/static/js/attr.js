define(['util/type', 'helper/events', 'status-bar', 'tpl!./attr'], function(type, Events, statusBar, attrTemplate) {
  'use strict';

  Attr.Events = type.createEnum(['USER_DONE']);
  Attr.Status = type.createEnum(['ACTIVE', 'INACTIVE']);

  Events.mixin(Attr);
  function Attr(options) {
    this.mousetrap = options.mousetrap;
    this.name = options.config.name;
    this.options = options.config.options;
    this.keyword = options.config.keyword;
    this.status = Attr.Status.INACTIVE;
    var el = this.el = document.createElement('div');
    el.className = 'attr-selector';
    el.style.display = 'none';
    this.result = null;

    this.el.innerHTML = attrTemplate({name: this.name, data: this.options});
    var self = this;
    if (!options.noModify) {
      this.el.onclick = function(e) {
        if (e.target.className.indexOf('attr-btn') > -1) {
          self.choose(e.target.dataset.cell);
        }
      };
      var keyList = this.hotkeyList = [];
      for (var i = 0; i <= this.options.length; ++i) {
        keyList.push(String(i));
      }
      this.mousetrap.bind(keyList, function(e, combo) {
          if (self.status == Attr.Status.ACTIVE) {
            self.choose(parseInt(combo));
          }
      });
    }

    document.body.appendChild(el); // ps show
  }

  Attr.prototype.getResult = function() {
    return this.result;
  };
  Attr.prototype.choose = function(optionId) {
    if (!this.result) {
      this.result = {};
    }
    this.result[this.keyword] = optionId;
    if (optionId > 0) {
      statusBar.status = this.options[optionId - 1];
    }
    else {
      statusBar.status = '不确定';
    }
    clearTimeout(this.fadeId);
    this.fadeId = setTimeout(function() {
        statusBar.status = '';
      }, 1000);
    this.trigger(Attr.Events.USER_DONE, this.getResult());
  }
  Attr.prototype.show = function(previousResult) {
    this.result = null;
    var all_btn = this.el.querySelectorAll('.attr-btn');
    var length = all_btn.length;
    for (var i = 0; i < length; ++i) {
      all_btn[i].className = 'attr-btn';
    }
    this.result = previousResult || {};
    if (previousResult[this.keyword]) {
      var e = this.el.querySelector('.attr-btn[data-cell="' + this.result[this.keyword] + '"]');
      e.className += ' active';
    }
    this.el.style.display = 'block';
    this.status = Attr.Status.ACTIVE;
  };
  Attr.prototype.hide = function() {
    this.el.style.display = 'none';
    this.status = Attr.Status.INACTIVE;
  };
  return Attr;
});
