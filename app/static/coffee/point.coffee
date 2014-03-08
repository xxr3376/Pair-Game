define ["util/type", "helper/events", "status-bar", "jquery", "image-viewer"], (type, Events, statusBar, $, ImageViewer) ->
  MIN_SCALE = 0.5
  class Point
    Events.mixin Point
    @Events = type.createEnum(["USER_DONE", "USER_EXIT"])
    @status = type.createEnum(["ENABLE", "DISABLE"])
    constructor: (options) ->
      @status = Point.status.DISABLE
      {@mousetrap, @iv} = options
      @clearData = =>
        @result = null
        @scale = 1
        @pointsLeft = 4
        @pointEl = []
        @pointPos = []
        @lastPosition = [0, 0]
        @_updatePending = false
        @status = Point.status.DISABLE

      @clearData()

      @pointNames = ["leftEye", "rightEye", "leftMouth", "rightMouth"]
      doneBtn = @doneBtn = document.createElement("button")
      doneBtn.className = "btn"
      doneBtn.innerText = "完成(Tab)"
      doneBtn.style.left = "0"
      doneBtn.style.bottom = "80px"
      doneBtn.style.display = "none"
      doneBtn.onclick = =>
        @trigger Point.Events.USER_DONE, @getResult()  if @vaildate()
      cancelBtn = @cancelBtn = document.createElement("button")
      cancelBtn.className = "btn"
      cancelBtn.innerText = "取消(ESC)"
      cancelBtn.style.left = "0"
      cancelBtn.style.bottom = "120px"
      cancelBtn.style.display = "none"
      cancelBtn.onclick = =>
        @trigger Point.Events.USER_EXIT

      @mousetrap.bind "tab", (e) =>
        e.preventDefault()
        console.log @status
        @doneBtn.click()  if @status is Point.status.ENABLE

      @mousetrap.bind "esc", (e) =>
        e.preventDefault()
        @cancelBtn.click()  if @status is Point.status.ENABLE

      document.body.appendChild doneBtn
      document.body.appendChild cancelBtn

      @iv.on ImageViewer.SCALE, (scale) =>
        newScale = 1 / scale
        @scale = newScale if newScale > MIN_SCALE
        @applyTransform()

      return

    addPoint: (x, y) ->
      @pointPos.push [x, y]
      point = document.createElement("div")
      point.className = "point"
      point.title = @pointNames[@pointNames.length - @pointsLeft]
      point.dataset.id = @pointPos.length - 1
      @iv.coverEl.appendChild point
      @pointEl.push point
      @pointsLeft--
      @applyTransform()
      return

    _updateTransform: =>
      @_updatePending = false
      for i in [0...@pointEl.length]
        pointEl = @pointEl[i]
        pos = @pointPos[i]
        transformStyle = "translate(#{pos[0]}px, #{pos[1]}px) scale(#{@scale})"
        style = pointEl.style
        style.transform = transformStyle
        style.mozTransform = transformStyle
        style.webkitTransform = transformStyle

    applyTransform: ->
      if @_updatePending isnt true
        @_updatePending = true
        window.requestAnimationFrame @_updateTransform
    show: (previousResult) ->
      @clearData()
      @status = Point.status.ENABLE
      if previousResult
        result = @result = previousResult
        for p in result.basic_points
          @addPoint p[0], p[1]
      @doneBtn.style.display = "block"
      @cancelBtn.style.display = "block"
      drag = false
      dragPoint = false
      $(@iv.coverEl).on "mousedown", (e) =>
        drag = true
        dragPoint = +e.target.dataset.id  if e.button is 0 and e.target.className is "point"
        @lastPosition = [e.pageX, e.pageY]
        return

      $(@iv.coverEl).on "mousemove", (e) =>
        helper = "Points Left: " + @pointsLeft
        helper = e.target.title  if e.target.className is "point"
        dx = e.pageX - @lastPosition[0]
        dy = e.pageY - @lastPosition[1]
        @lastPosition = [e.pageX, e.pageY]
        if dragPoint isnt false
          x = dx / @iv.transform.scale
          y = dy / @iv.transform.scale
          @pointPos[dragPoint][0] += x
          @pointPos[dragPoint][1] += y
          @applyTransform()
          return

      $(@iv.coverEl).on "mouseleave mouseup", (e) =>
        if drag
          if e.button is 0 and dragPoint isnt false and e.shiftKey
            if dragPoint is 3
              @iv.coverEl.removeChild @pointEl[dragPoint]
              @pointEl.splice dragPoint, 1
              @pointPos.splice dragPoint, 1
          if e.button is 0 and dragPoint is false and e.target.tagName is "DIV" and e.target.className is "cover"
            if @pointsLeft > 0
              x = e.offsetX
              y = e.offsetY
              @addPoint x, y
          drag = false
          dragPoint = false
          return

    hide: ->
      @status = Point.status.DISABLE
      @doneBtn.style.display = "none"
      @cancelBtn.style.display = "none"
      @iv.clear()
      return

    vaildate: ->
      result = @pointPos
      if result.length is 0
        @trigger Point.Events.USER_EXIT
        return false
      if result.length <= 2
        alert "需标注 3~4 点"
        return false
      true

    getResult: ->
      @result = {}  if @result is null
      @result.basic_points = @pointPos
      return @result

  return Point
