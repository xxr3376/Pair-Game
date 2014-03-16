(function() {
  define(function() {
    var type;
    type = {
      _uniqId: 10000,
      createEnum: function(values) {
        var result, t, _i, _len;
        result = {};
        for (_i = 0, _len = values.length; _i < _len; _i++) {
          t = values[_i];
          result[t] = ++this._uniqId;
        }
        return result;
      }
    };
    return type;
  });

}).call(this);
