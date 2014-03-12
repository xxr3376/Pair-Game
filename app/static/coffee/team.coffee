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
          else
            text.text "Enqueue failed, #{json.reason}"
        (err) ->
          text.text "Network Error"
      ).fin ->
        loading.fadeOut 500
        btn.removeAttr 'disabled'
)
