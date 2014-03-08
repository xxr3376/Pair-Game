define ['all-task', 'image-manager', 'jquery', 'tpl!reviewpanel', 'api'], (AllTask, ImageManager, $, ReviewPanel, API) ->
  env = AllTask(window.poseOption.type, true)
  im = new ImageManager IMG_SERVER: poseOption.img_server
  O = window.poseOption
  api = new API([], O)
  config = {}
  requestData = ->
    $.getJSON "#{O.server}review/get/#{O.task_id}/#{O.checklist_id}", (result) ->
      if result.status != 'SUCCESS'
        alert result.status
      else
        config.id = result.id
        config.path = result.path
        init result

  wrapper = document.createElement 'div'
  wrapper.className = 'admin-panel'
  document.body.appendChild wrapper

  init = (result) ->
    im.fetch result
    env.iv.setImage (im.borrow result.id)
    env.ready_callback result
    wrapper.innerHTML = ReviewPanel opinion: result.state, comment: result.reason || ''
    commentBox = ($ '#admin-comment')
    ($ '#admin-btn-accept, #admin-btn-reject').on 'click', (e)->
      if 'active' not in e.target.classList
        ($ '#admin-btn-accept, #admin-btn-reject').removeClass 'active'
        e.target.classList.add 'active'
        result.state = parseInt e.target.dataset.state
        if e.target.dataset.state == '2'
          commentBox.show()
        else
          commentBox.hide()
      return
    ($ '#admin-submit-btn').on 'click', ->
      result.comment = commentBox.val()
      if result.state == 2 and result.comment.length == 0
        alert '请填写不通过原因'
        return
      submit result.state, result.comment
  submit = (state, reason) ->
    api.post_json "/api/review/submit/#{O.task_id}/#{config.id}",
      state: state
      reason: reason
      (r) ->
        if r.status == "SUCCESS"
          next()
        else
          alert r.status
    return
  next = ->
    if config.id == O.checklist_id
      window.goBack()
    else
      im.pay config.id
      env.iv.clearbox()
      wrapper.innerHTML = ''
      requestData()

  requestData()
