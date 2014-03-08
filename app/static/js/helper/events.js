define(function() {
  'use strict';

  function Events() {
  }

  Events.mixin = function(obj) {
    obj.prototype.on      = this.prototype.on;
    obj.prototype.off     = this.prototype.off;
    obj.prototype.trigger = this.prototype.trigger;
  };

  var prototype = Events.prototype;

  prototype.on = function(name, callback, context) {
    this._events = this._events || Object.create(null);
    (this._events[name] || (this._events[name] = []))
    .push([callback, context || this]);
  };

  prototype.off = function(name) {
    this._events = this._events || Object.create(null);
    if (name) {
      delete this._events[name];
    } else {
      this._events = {};
    }
  };

  prototype.trigger = function(name, arg) {
    var i = -1, events, event, length;
    this._events = this._events || Object.create(null);
    if ((events = this._events[name])) {
      length = events.length;
      while (++i < length) {
        (event = events[i])[0].call(event[1], arg);
      }
    }
  };

  return Events;
});
