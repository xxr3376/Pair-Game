define ["util/type", "helper/events", "status-bar", "jquery", "image-viewer"], (type, Events, statusBar, $, ImageViewer) ->
  MIN_SCALE = 0.5
  class Landmark
    Events.mixin Landmark
    @Events = type.createEnum(["USER_DONE"])
    @status = type.createEnum(["ENABLE", "DISABLE"])
    constructor: (options) ->
      @iv = options.iv
      @pointAttr = [
        {
          name: "contour_chin"
          color: "#FF0000"
        }
        {
          name: "contour_left1"
          color: "#FF0000"
        }
        {
          name: "contour_left2"
          color: "#FF0000"
        }
        {
          name: "contour_left3"
          color: "#FF0000"
        }
        {
          name: "contour_left4"
          color: "#FF0000"
        }
        {
          name: "contour_left5"
          color: "#FF0000"
        }
        {
          name: "contour_left6"
          color: "#FF0000"
        }
        {
          name: "contour_left7"
          color: "#FF0000"
        }
        {
          name: "contour_left8"
          color: "#FF0000"
        }
        {
          name: "contour_left9"
          color: "#FF0000"
        }
        {
          name: "contour_right1"
          color: "#FF0000"
        }
        {
          name: "contour_right2"
          color: "#FF0000"
        }
        {
          name: "contour_right3"
          color: "#FF0000"
        }
        {
          name: "contour_right4"
          color: "#FF0000"
        }
        {
          name: "contour_right5"
          color: "#FF0000"
        }
        {
          name: "contour_right6"
          color: "#FF0000"
        }
        {
          name: "contour_right7"
          color: "#FF0000"
        }
        {
          name: "contour_right8"
          color: "#FF0000"
        }
        {
          name: "contour_right9"
          color: "#FF0000"
        }
        {
          name: "left_eye_bottom"
          color: "#FF0000"
        }
        {
          name: "left_eye_left_corner"
          color: "#FF0000"
        }
        {
          name: "left_eye_lower_left_quarter"
          color: "#FF0000"
        }
        {
          name: "left_eye_lower_right_quarter"
          color: "#FF0000"
        }
        {
          name: "left_eye_pupil"
          color: "#FF0000"
        }
        {
          name: "left_eye_right_corner"
          color: "#FF0000"
        }
        {
          name: "left_eye_top"
          color: "#FF0000"
        }
        {
          name: "left_eye_upper_left_quarter"
          color: "#FF0000"
        }
        {
          name: "left_eye_upper_right_quarter"
          color: "#FF0000"
        }
        {
          name: "left_eyebrow_left_corner"
          color: "#FF0000"
        }
        {
          name: "left_eyebrow_lower_left_quarter"
          color: "#FF0000"
        }
        {
          name: "left_eyebrow_lower_middle"
          color: "#FF0000"
        }
        {
          name: "left_eyebrow_lower_right_quarter"
          color: "#FF0000"
        }
        {
          name: "left_eyebrow_right_corner"
          color: "#FF0000"
        }
        {
          name: "left_eyebrow_upper_left_quarter"
          color: "#FF0000"
        }
        {
          name: "left_eyebrow_upper_middle"
          color: "#FF0000"
        }
        {
          name: "left_eyebrow_upper_right_quarter"
          color: "#FF0000"
        }
        {
          name: "mouth_left_corner"
          color: "#FF0000"
        }
        {
          name: "mouth_lower_lip_bottom"
          color: "#FF0000"
        }
        {
          name: "mouth_lower_lip_left_contour1"
          color: "#FF0000"
        }
        {
          name: "mouth_lower_lip_left_contour2"
          color: "#FF0000"
        }
        {
          name: "mouth_lower_lip_left_contour3"
          color: "#FF0000"
        }
        {
          name: "mouth_lower_lip_right_contour1"
          color: "#FF0000"
        }
        {
          name: "mouth_lower_lip_right_contour2"
          color: "#FF0000"
        }
        {
          name: "mouth_lower_lip_right_contour3"
          color: "#FF0000"
        }
        {
          name: "mouth_lower_lip_top"
          color: "#FF0000"
        }
        {
          name: "mouth_right_corner"
          color: "#FF0000"
        }
        {
          name: "mouth_upper_lip_bottom"
          color: "#FF0000"
        }
        {
          name: "mouth_upper_lip_left_contour1"
          color: "#FF0000"
        }
        {
          name: "mouth_upper_lip_left_contour2"
          color: "#FF0000"
        }
        {
          name: "mouth_upper_lip_left_contour3"
          color: "#FF0000"
        }
        {
          name: "mouth_upper_lip_right_contour1"
          color: "#FF0000"
        }
        {
          name: "mouth_upper_lip_right_contour2"
          color: "#FF0000"
        }
        {
          name: "mouth_upper_lip_right_contour3"
          color: "#FF0000"
        }
        {
          name: "mouth_upper_lip_top"
          color: "#FF0000"
        }
        {
          name: "nose_contour_left1"
          color: "#FF0000"
        }
        {
          name: "nose_contour_left2"
          color: "#FF0000"
        }
        {
          name: "nose_contour_left3"
          color: "#FF0000"
        }
        {
          name: "nose_contour_lower_middle"
          color: "#FF0000"
        }
        {
          name: "nose_contour_right1"
          color: "#FF0000"
        }
        {
          name: "nose_contour_right2"
          color: "#FF0000"
        }
        {
          name: "nose_contour_right3"
          color: "#FF0000"
        }
        {
          name: "nose_left"
          color: "#FF0000"
        }
        {
          name: "nose_right"
          color: "#FF0000"
        }
        {
          name: "nose_tip"
          color: "#FF0000"
        }
        {
          name: "right_eye_bottom"
          color: "#FF0000"
        }
        {
          name: "right_eye_left_corner"
          color: "#FF0000"
        }
        {
          name: "right_eye_lower_left_quarter"
          color: "#FF0000"
        }
        {
          name: "right_eye_lower_right_quarter"
          color: "#FF0000"
        }
        {
          name: "right_eye_pupil"
          color: "#FF0000"
        }
        {
          name: "right_eye_right_corner"
          color: "#FF0000"
        }
        {
          name: "right_eye_top"
          color: "#FF0000"
        }
        {
          name: "right_eye_upper_left_quarter"
          color: "#FF0000"
        }
        {
          name: "right_eye_upper_right_quarter"
          color: "#FF0000"
        }
        {
          name: "right_eyebrow_left_corner"
          color: "#FF0000"
        }
        {
          name: "right_eyebrow_lower_left_quarter"
          color: "#FF0000"
        }
        {
          name: "right_eyebrow_lower_middle"
          color: "#FF0000"
        }
        {
          name: "right_eyebrow_lower_right_quarter"
          color: "#FF0000"
        }
        {
          name: "right_eyebrow_right_corner"
          color: "#FF0000"
        }
        {
          name: "right_eyebrow_upper_left_quarter"
          color: "#FF0000"
        }
        {
          name: "right_eyebrow_upper_middle"
          color: "#FF0000"
        }
        {
          name: "right_eyebrow_upper_right_quarter"
          color: "#FF0000"
        }
      ]

      @clearData = =>
        @scale = 1
        @pointList = []
        @lastPosition = [0, 0]
        @_updatePending = false
        @pointsLeft = @pointAttr.length
      @clearData()


      doneBtn = @doneBtn = document.createElement("button")
      doneBtn.className = "btn"
      doneBtn.innerText = "完成(Tab)"
      doneBtn.style.left = "0"
      doneBtn.style.bottom = "80px"
      doneBtn.style.display = "none"
      doneBtn.onclick = =>
        @trigger Point.Events.USER_DONE, @getResult()  if @vaildate()

      @iv.on ImageViewer.SCALE, (scale) =>
        newScale = (1 / scale) * 3
        @scale = newScale if newScale > MIN_SCALE
        @applyTransform()
      return

    applyTransform: ->
      if @_updatePending isnt true
        @_updatePending = true
        window.requestAnimationFrame @_updateTransform

    _updateTransform: =>
      @_updatePending = false
      for point in @pointList
        pointEl = point.el
        pos = point.position
        transformStyle = "translate(#{pos[0]}px, #{pos[1]}px) scale(#{@scale})"
        style = pointEl.style
        style.transform = transformStyle
        style.mozTransform = transformStyle
        style.webkitTransform = transformStyle

    addPoint: (x, y) ->
      lastId = @pointList.length - 1
      @pointList[lastId]?.el.style.background = @pointAttr[lastId].color
      console.log "addPoint #{x}, #{y}"
      point = document.createElement 'div'
      point.className = "point"
      point.style.background = "#00FF00"
      point.title = @pointAttr[@pointList.length].name
      point.dataset.id = @pointList.length
      @iv.coverEl.appendChild point
      tmpPoint =
        position: [x, y]
        el: point
      @pointList.push tmpPoint
      @pointsLeft -= 1
      @applyTransform()
      return
    show: (previousResult) =>
      @clearData()
      if previousResult && previousResult.landmark_83
        @result = previousResult
        for p in previousResult.landmark_83
          @addPoint p[0], p[1]
      @doneBtn.style.display = "block"

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
          @pointList[dragPoint].position[0] += x
          @pointList[dragPoint].position[1] += y
          @applyTransform()
          return

      $(@iv.coverEl).on "mouseleave mouseup", (e) =>
        if drag
          if e.button is 0 and dragPoint is false and e.target.tagName is "DIV" and e.target.className is "cover"
            if @pointsLeft > 0
              x = e.offsetX
              y = e.offsetY
              @addPoint x, y
          drag = false
          dragPoint = false
          return

    hide: ->
      return

  return Landmark
