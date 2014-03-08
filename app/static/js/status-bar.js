define(function() {
  'use strict';

  var statusBar = {
    _status: '',

    el: document.createElement('div'),

    get status() {
      return this._status;
    },

    set status(str) {
      if (str !== this._status) {
        this.el.innerText = this._status = str;
      }
    }
  };

  statusBar.el.addEventListener('mousedown', function(e) { e.stopPropagation(); });
  statusBar.el.addEventListener('mousemove', function(e) { e.stopPropagation(); });
  statusBar.el.addEventListener('mouseup', function(e) { e.stopPropagation(); });

  statusBar.el.className = 'status-bar';
  document.body.appendChild(statusBar.el);

  return statusBar;
});
