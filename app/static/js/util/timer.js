(function() {
  define(function() {
    var Timer;
    Timer = (function() {
      function Timer() {
        this.init = Date.now();
      }

      Timer.prototype.restart = function() {
        return this.init = Date.now();
      };

      Timer.prototype.millisecond = function() {
        return Date.now() - this.init;
      };

      Timer.prototype.second = function() {
        return Math.floor(this.millisecond() / 1000);
      };

      return Timer;

    })();
    return Timer;
  });

}).call(this);
