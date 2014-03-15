define(['q', 'jquery'],
  (Q, $) ->
    btn = $ '#enqueue'
    loading = $ '#loading'
    text = $ '#text'

    btn.on 'click', ->
      btn.prop 'disabled', 'disabled'
      loading.fadeIn 500
      promise = Q ($.getJSON '/team/enqueue')

      promise.then(
        (json) ->
          if json.status is "SUCCESS"
            text.text "Enqueue successful, token: #{json.token}"
            window.location.href = "/game?token=#{json.token}"
          else
            text.text "Enqueue failed, #{json.reason}, pls retry"
        (err) ->
          text.text "Network Error, pls refresh page"
      ).fin ->
        btn.prop 'disabled', false
        loading.fadeOut 500
)
