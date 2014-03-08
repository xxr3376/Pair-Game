define ['util/type', 'helper/events'], (type, Events) ->
  class SingleFaceController
    constructor: (options) ->
      @face = null
      @box = null
      @padding = 1.5
      {@iv, @mousetrap} = options
      @display = true
      @mousetrap.bind 'space', (e) =>
        e.preventDefault()
        if @display
          @iv.boxEl.className = 'box hide'
          @display = false
        else
          @iv.boxEl.className = 'box'
          @display = true
        return
    setData: (data) ->
      @face = data.basic_points
    show: (roll) ->
      if !@box
        @box = document.createElement 'div'
        @box.className = 'bounding-box'
        @iv.boxEl.appendChild @box
      minX = maxX = @face[0][0]
      minY = maxY = @face[0][1]
      for p in @face
        minX = Math.min minX, p[0]
        minY = Math.min minY, p[1]
        maxX = Math.max maxX, p[0]
        maxY = Math.max maxY, p[1]
      paddingX = (maxX - minX) / 2
      paddingY = (maxY - minY) / 2

      box = @box
      box.style.left = "#{minX - paddingX - 5}px"
      box.style.top = "#{minY - paddingY - 5}px"
      box.style.width = "#{maxX - minX + 2 * paddingX}px"
      box.style.height = "#{maxY - minY + 1.7 * paddingY}px"
      box.style.pointerEvents = "none"

      face =
        width: (maxX - minX) * (1 + 2 * @padding)
        height: (maxY - minY) * (1 + 2 * @padding)
        x: (maxX + minX) / 2
        y: (maxY + minY) / 2
      if roll and @face.length == 4
        @iv.rollImage @face[0], @face[1], face
      @iv.center face
    hide: ->
      @box.remove()
      @box = null
  return SingleFaceController
