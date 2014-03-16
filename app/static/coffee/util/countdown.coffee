define(['util/timer', 'util/type', 'util/events'], (Timer, Type, Events) ->
  class Countdown
    Events.mixin Countdown
    @Events = Type.createEnum ['TICK', 'DONE']

    constructor: (@time, @interval) -> # in second
      @handler = -1

    next_tick: ->
      # make timeout more accuracy
      next = ((@counter + 1)  * @interval) * 1000
      return next - @timer.millisecond()
    start: ->
      @timer = new Timer()
      @counter = 0
      target = @time / @interval
      stepFunc = =>
        @counter += 1
        @trigger Countdown.Events.TICK, @timer.second()
        if @counter == target
          @trigger Countdown.Events.DONE
          @handler = -1
        else
          @handler = setTimeout stepFunc, @next_tick()
      @handler = setTimeout stepFunc, @next_tick()
      # trigger at 0
      @trigger Countdown.Events.TICK, 0
    stop: ->
      clearTimeout @handler
      return @timer.second()
)
