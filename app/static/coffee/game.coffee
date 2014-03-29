empty_url = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzc3NyI+PC9yZWN0Pjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjEwMCIgeT0iMTAwIiBzdHlsZT0iZmlsbDojNTU1O2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1zaXplOjU2cHg7Zm9udC1mYW1pbHk6QXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWY7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+PzwvdGV4dD48L3N2Zz4="

SETTINGS = window.global_setting

define(['q', 'jquery', 'util/get-url-parameters', 'util/timer', 'util/countdown', 'bootstrap'],
  (Q, $, getURLParameters, Timer, Countdown) ->
    ($ '.choice').attr 'src', empty_url
    token = getURLParameters(location.href)['token']
    if not token
      return
    # send prepare request as soon as possible
    promise = Q ($.getJSON "/game/prepare/#{token}")

    # dom
    loading = $ '#loading'
    submit_dom = $ '#submit'
    choice = (($ "#choice#{i}") for i in [1..3])
    score_dom = $ '#score'
    time_dom = $ '#time'
    length_dom = $ '#game-length'

    ($ '#modal-exit, #modal-win').on 'hide', ->
      location.href = '/team'


    # show loading at first
    loading.fadeIn 100
    countdown = new Countdown SETTINGS.timeout, 1

    # global var
    hightlight = [0, 0, 0]
    ingame = false
    pending = false

    # util
    alert = do ->
      # store timeout handler for hide message
      hideHandler = -1
      alert_dom = $ '#alert'

      hideFunction = ->
        alert_dom.attr 'class', 'alert'
        alert_dom.html '&nbsp;'

      return (html, type = "info") ->
        alert_dom.html html
        alert_dom.attr 'class', "alert alert-#{type}"
        if hideHandler != -1
          clearTimeout hideHandler
        hideHandler = setTimeout hideFunction, 2000

    toggle_input = (dom, state) ->
      if state
        dom.attr 'disabled', false
      else
        dom.prop 'disabled', 'disabled'
    clear_action = ->
      for i in [0...3]
        choice[i].removeClass 'active'
      hightlight = [0, 0, 0]

    init_round = (data) ->
      for i in [0...3]
        choice[i].attr 'src', data[i].path
      time_dom.text ''
      time_dom.addClass 'take-easy'
      clear_action()
      countdown.start()

    countdown.on Countdown.Events.TICK, (timepass) ->
      time_dom.text (SETTINGS.timeout - timepass)
      if timepass == SETTINGS.punishment_time
        time_dom.removeClass 'take-easy'


    promise.then(
      (data) ->
        switch data.status
          when 'SUCCESS'
            init_round data.round
            length_dom.text data.round_length
            ingame = true
          when 'EXIT'
            ($ '#modal-exit').modal('show')
          when 'INVAILD'
            ($ '#modal-exit').modal('show')
            location.href = '/team'
        loading.fadeOut 300
    )
    ($ '.choice').on 'click', ->
      submit_dom.popover 'hide'

      count = 0
      count += 1 for state in hightlight when state
      if count == 2 and hightlight[@.dataset.num] is 0
        return
      hightlight[@.dataset.num] ^= 1
      @.classList.toggle 'active'

    submit = (data) ->
      pending = true
      submit_dom.popover 'hide'
      toggle_input submit_dom, false
      loading.fadeIn 300
      promise = Q $.ajax(
        url: "/game/submit/#{token}"
        type: 'POST'
        dataType: 'json'
        contentType: 'application/json'
        data: JSON.stringify data
      )
      promise.then(
        (data) ->
          pending = false
          switch data.status
            when 'SUCCESS'
              alert 'Great! Next Round', 'success'
              countdown.stop()
              ($ '.choice').attr 'src', empty_url
              init_round data.round
              score_dom.text (parseInt data.score)
              length_dom.text data.round_length
              toggle_input submit_dom, true
            when 'TIMEOUT'
              alert 'Opps, You or your partener exceed the time limit.', 'danger'
              countdown.stop()
              ($ '.choice').attr 'src', empty_url
              init_round data.round
              score_dom.text (parseInt data.score)
              length_dom.text data.round_length
              toggle_input submit_dom, true
            when 'FAIL'
              alert "Your choice didn't match your partener's.", 'danger'
              countdown.stop()
              ($ '.choice').attr 'src', empty_url
              init_round data.round
              score_dom.text (parseInt data.score)
              length_dom.text data.round_length
              toggle_input submit_dom, true
            when 'RETRY'
              alert 'Your choice do not pair with your partener, please retry', 'danger'
              clear_action()
              score_dom.text (parseInt data.score)
              toggle_input submit_dom, true
            when 'DONE'
              countdown.stop()
              ($ '#modal-win').modal('show')
              score_dom.text (parseInt data.score)
              ($ '#final-score').text (parseInt data.score)
              ingame = false
            when 'EXIT'
              countdown.stop()
              ($ '#modal-exit').modal('show')
              ingame = false
          toggle_input submit_dom, true
          loading.fadeOut 300
          return
      )

    submit_dom.popover trigger: 'manual'
    submit_dom.on 'click', ->
      count = 0
      unselected = -1
      for i in [0...3]
        count += 1 if hightlight[i]
        unselected = i if not hightlight[i]
      if count != 2
        submit_dom.popover 'show'
        return
      data =
        type: 'normal'
        time: countdown.current()
        choice: unselected
      submit data
    countdown.on Countdown.Events.DONE, ->
      if not pending
        data =
          type: 'timeout'
        submit data
    window.onbeforeunload = (e) ->
      if ingame
        message = 'You are still in game, Are you going to exit?'
        e = e or window.event
        e.returnValue = message if e
        return message
)
