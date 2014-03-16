define ->
  Events = ->
  Events.mixin = (obj) ->
    obj::on = @::on
    obj::off = @::off
    obj::trigger = @::trigger
    return

  Events::on = (name, callback, context) ->
    @_events = @_events or Object.create(null)
    (@_events[name] or (@_events[name] = [])).push [
      callback
      context or this
    ]
    return

  Events::off = (name) ->
    @_events = @_events or Object.create(null)
    if name
      delete @_events[name]
    else
      @_events = {}
    return

  Events::trigger = (name, arg) ->
    i = -1
    events = undefined
    event = undefined
    length = undefined
    @_events = @_events or Object.create(null)
    if events = @_events[name]
      length = events.length
      (event = events[i])[0].call event[1], arg  while ++i < length
    return

  return Events

