define(function() {
  'use strict';

  var type = {

    _uniqId: 10000,

    createEnum: function(values) {
      var result = {};
      for (var i = 0, length = values.length; i < length; i++) {
        result[values[i]] = ++this._uniqId;
      }
      return result;
    },

  };

  return type;
});
