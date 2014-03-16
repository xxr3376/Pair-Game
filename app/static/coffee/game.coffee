empty_url = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzc3NyI+PC9yZWN0Pjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjEwMCIgeT0iMTAwIiBzdHlsZT0iZmlsbDojNTU1O2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1zaXplOjU2cHg7Zm9udC1mYW1pbHk6QXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWY7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+PzwvdGV4dD48L3N2Zz4="

SETTINGS =
  timeout: 60
  init_score: 0
  punishment_time: 20
  game_length: 25

define(['q', 'jquery', 'util/get-url-parameters', 'util/timer', 'util/countdown', 'bootstrap'],
  (Q, $, getURLParameters, Timer, Countdown) ->
    ($ '.choice').attr 'src', empty_url
    token = getURLParameters(location.href)['token']
    if not token
      return
    # send prepare request as soon as possible
    promise = Q ($.getJSON "/game/fake_prepare/#{token}")

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
    game_length = SETTINGS.game_length

    # util
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
      length_dom.text game_length
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
          when 'EXIT'
            ($ '#modal-exit').modal('show')
          when 'INVAILD'
            alert 'you are not belong here'
            location.href = '/team'
        loading.fadeOut 300
    )
    ($ '.choice').on 'click', ->
      count = 0
      count += 1 for state in hightlight when state
      if count == 2 and hightlight[@.dataset.num] is 0
        return
      hightlight[@.dataset.num] ^= 1
      console.log hightlight
      @.classList.toggle 'active'

    submit = (data) ->
      toggle_input submit_dom, false
      loading.fadeIn 300
      promise = Q $.ajax(
        url: "/game/fake_submit/#{token}"
        type: 'POST'
        dataType: 'json'
        contentType: 'application/json'
        data: JSON.stringify data
      )
      promise.then(
        (data) ->
          console.log data
          switch data.status
            when 'SUCCESS'
              game_length -= 1
              init_round data.round
              score_dom.text data.score
              toggle_input submit_dom, true
            when 'RETRY'
              # TODO
              clear_action()
              toggle_input submit_dom, true
            when 'DONE'
              ($ '#modal-win').modal('show')
            when 'EXIT'
              ($ '#modal-exit').modal('show')
          toggle_input submit_dom, true
          loading.fadeOut 300
          return
      )

    submit_dom.on 'click', ->
      count = 0
      unselected = -1
      for i in [0...3]
        count += 1 if hightlight[i]
        unselected = i if not hightlight[i]
      if count != 2
        #TODO show tips
        return
      data =
        type: 'normal'
        time: countdown.stop()
        choice: unselected
      submit data
    countdown.on Countdown.Events.DONE, ->
      data =
        type: 'timeout'
      submit data
)
