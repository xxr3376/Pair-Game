getURLParamters = (url) ->
  params = {}
  url = url.split('?').pop().split('&')
  for item in url
    tmp = item.split('=')
    params[decodeURIComponent(tmp[0])] = decodeURIComponent(tmp[1])
  return params

empty_url = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzc3NyI+PC9yZWN0Pjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjEwMCIgeT0iMTAwIiBzdHlsZT0iZmlsbDojNTU1O2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1zaXplOjU2cHg7Zm9udC1mYW1pbHk6QXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWY7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+PzwvdGV4dD48L3N2Zz4="

define(['q', 'jquery'],
  (Q, $) ->
    ($ '.choice').prop 'src', empty_url
    promise = Q ($.getJSON "/game/fake_prepare/#{token}")

    token = getURLParamters(location.href)['token']
    loading = $ '#loading'
    loading.fadeIn 500
    submit = $ '#submit'

    choice = (($ "#choice#{i}") for i in [1..3])
    console.log choice
    init_round = (data) ->
      console.log data
      for i in [0...3]
        choice[i].prop 'src', data[i].path

    promise.then(
      (data) ->
        switch data.status
          when 'SUCCESS'
            init_round data.round
            loading.fadeOut 500
          when 'EXIT'
            alert 'Your partener exit game.'
            location.href = '/team'
          when 'INVAILD'
            alert 'you are not belong here'
            location.href = '/team'
    )
    ($ '.choice').on 'click', ->
      @.classList.toggle 'active'
    submit.on 'click', ->
      data = {}
      promise = Q $.ajax(
        url: 'game/fake_submit'
        type: 'POST'
        dataType: 'json'
        contentType: 'json'
        data: JSON.stringify data
      )
)
