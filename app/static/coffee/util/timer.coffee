define ->
  class Timer
    constructor: ->
      @init = Date.now()
    restart: ->
      @init = Date.now()
    millisecond: ->
      return Date.now() - @init
    second: ->
      return @millisecond() / 1000
  return Timer
