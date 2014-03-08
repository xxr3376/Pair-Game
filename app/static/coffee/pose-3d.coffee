# global THREE
define ["util/type", "helper/events", "status-bar"], (type, Events, statusBar) ->
  WIDTH = window.innerWidth
  HEIGHT = window.innerHeight
  NEAR = 1
  FAR = 1000
  class Pose3D
    Events.mixin Pose3D
    @Events = type.createEnum(["USER_DONE"])

    constructor: (options) ->
      @options = options or {}
      {@mousetrap, @iv} = options

      @stopped = true
      renderer = undefined
      try
        renderer = new THREE.WebGLRenderer(antialias: true)
      catch e
        renderer = new THREE.CanvasRenderer()
      renderer.setSize WIDTH, HEIGHT
      scene = new THREE.Scene()
      camera = new THREE.OrthographicCamera(WIDTH / -2, WIDTH / 2, HEIGHT / 2, HEIGHT / -2, NEAR, FAR)
      camera.position.z = 200
      scene.add camera

      loader = new THREE.JSONLoader()
      mesh = undefined
      meshMaterial = undefined
      meshWireMaterial = undefined

      loader.load "/static/model/face.min.json", (geometry, materials) =>
        geometry.computeVertexNormals()
        meshMaterial = new THREE.MeshFaceMaterial(materials)
        meshWireMaterial = new THREE.MeshBasicMaterial(
          color: 0x1A4FFF
          wireframe: true
        )
        mesh = @mesh = new THREE.Mesh(geometry, meshMaterial)
        mesh.scale.set 80, 80, 80
        mesh.position.y = 0
        mesh.position.x = 0
        mesh.rotation.order = "ZXY"
        scene.add mesh

      pointLight = new THREE.PointLight(0xFFFFFF)
      pointLight.position.x = 0
      pointLight.position.y = 500
      pointLight.position.z = 500
      scene.add pointLight
      pointLight = new THREE.PointLight(0xFFFFFF)
      pointLight.position.x = 0
      pointLight.position.y = -500
      pointLight.position.z = 500
      scene.add pointLight

      gldom = @el = renderer.domElement
      gldom.style.cssText = "position:absolute;top:0;right:0;display:none;"
      @iv.wrapEl.appendChild @el

      loop_ = =>
        window.requestAnimationFrame loop_ unless @stopped
        if @options.noModify
          scale = @result.pose_3d.scale * @iv.transform.scale * 4 / 9
          mesh.scale.set scale, scale, scale
        RAD2DEG = 180 / Math.PI
        if !@options.noStatus
          statusBar.status = "Roll: " + (mesh.rotation.z * RAD2DEG).toFixed(3) + ", Pitch: " + (mesh.rotation.x * RAD2DEG).toFixed(3) + ", Yaw: " + (mesh.rotation.y * RAD2DEG).toFixed(3)
        renderer.render scene, camera

      @show = (previousResult) =>
        @stopped = false
        @result = previousResult
        if previousResult and previousResult.pose_3d
          if previousResult.pose_3d
            p3d = previousResult.pose_3d
            q = new THREE.Quaternion(p3d.x, p3d.y, p3d.z, p3d.w)
            mesh.rotation.setFromQuaternion q
            scale = p3d.scale * @iv.transform.scale * 4 / 9
            mesh.scale.set scale, scale, scale
        else
          mesh.rotation.set 0, 0, 0
          mesh.scale.set 80, 80, 80
        @doneBtn.style.display = "block"  unless @options.noModify
        @el.style.display = "block"
        loop_()



      unless @options.noModify
        doneBtn = @doneBtn = document.createElement("button")
        doneBtn.className = "btn"
        doneBtn.innerText = "Finish"
        doneBtn.style.left = "0"
        doneBtn.style.bottom = "80px"
        doneBtn.style.display = "none"
        doneBtn.onclick = =>
          @trigger Pose3D.Events.USER_DONE, @getResult()
        document.body.appendChild doneBtn

        @mousetrap.bind ['w', 's', 'a', 'd', 'q', 'e', 'W', 'S', 'A', 'D', 'Q', 'E'], (e) ->
          m = new THREE.Matrix4()
          t = new THREE.Matrix4()
          n = new THREE.Matrix4()
          r = new THREE.Euler()
          char = String.fromCharCode e.keyCode

          switch char
            when 'q'
              r.set 0, 0, 0.01, 'ZXY'
            when 'Q'
              r.set 0, 0, 0.1, 'ZXY'
            when 'e'
              r.set 0, 0, -0.01, 'ZXY'
            when 'E'
              r.set 0, 0, -0.1, 'ZXY'
            when 'a'
              r.set 0, -0.01, 0, 'ZXY'
            when 'A'
              r.set 0, -0.1, 0, 'ZXY'
            when 'd'
              r.set 0, 0.01, 0, 'ZXY'
            when 'D'
              r.set 0, 0.1, 0, 'ZXY'
            when 's'
              r.set 0.01, 0, 0, 'ZXY'
            when 'S'
              r.set 0.1, 0, 0, 'ZXY'
            when 'w'
              r.set -0.01, 0, 0, 'ZXY'
            when 'W'
              r.set -0.1, 0, 0, 'ZXY'
          m.makeRotationFromEuler mesh.rotation
          t.makeRotationFromEuler r
          n.multiplyMatrices m, t

          mesh.rotation.setFromRotationMatrix n, 'ZXY'

      @mousetrap.bind ['u', 'o', 'j', 'l', 'i', 'k', 'U', 'O', 'I', 'K', 'H', 'L'], (e) ->
        char = String.fromCharCode e.keyCode
        switch char
          when 'u'
            mesh.rotation.z += 0.01
          when 'U'
            mesh.rotation.z += 0.1
          when 'o'
            mesh.rotation.z -= 0.01
          when 'O'
            mesh.rotation.z -= 0.1
          when 'j'
            mesh.rotation.y -= 0.01
          when 'J'
            mesh.rotation.y -= 0.1
          when 'l'
            mesh.rotation.y += 0.01
          when 'L'
            mesh.rotation.y += 0.1
          when 'k'
            mesh.rotation.x += 0.01
          when 'K'
            mesh.rotation.x += 0.1
          when 'i'
            mesh.rotation.x -= 0.01
          when 'I'
            mesh.rotation.x -= 0.1

      @mousetrap.bind "t", ->
        if mesh.material is meshWireMaterial
          renderer.domElement.style.opacity = 1
          mesh.material = meshMaterial
        else
          renderer.domElement.style.opacity = 0.7
          mesh.material = meshWireMaterial

      beginRotate = null
      endRotate = null
      down = false
      unless @options.noModify
        gldom.addEventListener "mousedown", (e) ->
          if e.button is 0
            e.preventDefault()
            e.stopPropagation()
            down = true
            beginRotate = new THREE.Vector3(e.clientX - gldom.offsetLeft, e.clientY - gldom.offsetTop, 3000)

        gldom.addEventListener "mousemove", (e) ->
          if down
            e.preventDefault()
            e.stopPropagation()
            endRotate = new THREE.Vector3(e.clientX - gldom.offsetLeft, e.clientY - gldom.offsetTop, 3000)
            if endRotate.distanceToSquared(beginRotate) < 0.5
              return
            angle = Math.acos(beginRotate.dot(endRotate) / beginRotate.length() / endRotate.length()) * 8
            axis = beginRotate.cross(endRotate).normalize()
            mesh.rotateOnAxis axis, angle
            beginRotate = endRotate

        gldom.addEventListener "mouseleave", (e) ->
          e.preventDefault()
          down = false

        gldom.addEventListener "mousewheel", (e) ->
          e.preventDefault()
          if e.shiftKey
            e.stopPropagation()
            delta = e.wheelDelta / 120
            mesh.scale.addScalar delta  if mesh.scale.x + delta > 0

        gldom.addEventListener "mouseup", (e) ->
          e.preventDefault()
          down = false

    hide: ->
      @stopped = true
      @el.style.display = "none"
      @doneBtn.style.display = "none"  unless @options.noModify

    getResult: ->
      @result = {} unless @result
      q = new THREE.Quaternion()
      q.setFromEuler @mesh.rotation
      @result.pose_3d =
        x: q.x
        y: q.y
        z: q.z
        w: q.w
        scale: @mesh.scale.x * 9 / 4 / @iv.transform.scale
      return @result

    setSize: (s) ->
      s *= 4 / 9
      @mesh.scale.set s, s, s

  return Pose3D
