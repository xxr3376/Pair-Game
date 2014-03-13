define(['q', 'jquery'],
  (Q, $) ->
    btn = $ '#start'
    loading = $ '#loading'
    text = $ '#text'
    choice = {}
    choice.time = 13
    choice.choice = 3
    btn.on 'click', ->
      btn.prop 'disabled', 'disabled'
      loading.fadeIn 500
      $.ajax({
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(choice),
        dataType: 'json',
        url: '/game/hand_in'
        success: (e) ->
          console.log e
          if e.status is "OK"
            text.text "#{e.round}"
          else
            text.text "#{e.status}:#{e.msg}"
          loading.fadeOut 500
          btn.removeAttr 'disabled'
      })
)
