define(['q', 'jquery'],
  (Q, $) ->
    btn = $ '#enqueue'
    loading = $ '#loading'
    text = $ '#text'

    callback = ->
      Recaptcha.focus_response_field.call null, arguments

    window.Recaptcha.create(
      "6Lf05PASAAAAAJ69VIVt1HEGuHBpkD1yF3-a6gBz"
      "recaptcha"
      theme: "clean"
      callback: callback
    )

    btn.on 'click', ->
      btn.prop 'disabled', 'disabled'
      data =
        challenge: Recaptcha.get_challenge()
        response: Recaptcha.get_response()
      loading.fadeIn 500
      promise = Q ($.getJSON '/team/enqueue', data)

      promise.then(
        (json) ->
          switch json.status
            when "SUCCESS"
              text.text "Enqueue successful, token: #{json.token}"
              window.location.href = "/game?token=#{json.token}"
            when "RECAPTCA"
              text.text "Recaptca is incorrect, please retry"
              Recaptcha.reload()
            else
              text.text "Enqueue failed, #{json.reason}, pls retry"
        (err) ->
          text.text "Network Error, pls refresh page"
      ).fin ->
        btn.prop 'disabled', false
        loading.fadeOut 500
)
