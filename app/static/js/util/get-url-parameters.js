(function() {
  define(function() {
    var getURLParameters;
    getURLParameters = function(url) {
      var item, params, tmp, _i, _len;
      params = {};
      url = url.split('?').pop().split('&');
      for (_i = 0, _len = url.length; _i < _len; _i++) {
        item = url[_i];
        tmp = item.split('=');
        params[decodeURIComponent(tmp[0])] = decodeURIComponent(tmp[1]);
      }
      return params;
    };
    return getURLParameters;
  });

}).call(this);
