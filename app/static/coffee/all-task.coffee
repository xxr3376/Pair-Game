define [
  "config"
  "util/polyfill"
  "status-bar"
  "image-viewer"
  "mousetrap"
  "multiface-controller"
  "singleface-controller"
  "point"
  "attr"
  "landmark"
  "age-range"
  "pose-selector"
  "pose-3d"
], (
  CONFIG
  polyfill
  statusBar
  ImageViewer
  Mousetrap
  MultiFaceController
  SingleFaceController
  Point
  Attr
  Landmark
  AgeRange
  PoseSelector
  Pose3D
) ->
  polyfill()
  moduleMap =
    'INIT': Point
    'ORIENTATION': PoseSelector
    'POSE3D': Pose3D
    'GENDER': Attr
    'RACE': Attr
    'LANDMARK': Landmark
    'AGE_RANGE:lower': AgeRange
    'AGE_RANGE:upper': AgeRange
    'AGE_RANGE:lower,upper': AgeRange

  generateConfig = (taskname)->
    for set of CONFIG
      config = CONFIG[set][taskname]
      return config if config
    return null
  prepare = (taskname, noModify) ->
    Module = moduleMap[taskname]
    env =
      iv: new ImageViewer container: document.body
      mousetrap: Mousetrap
    FaceController = if taskname == 'INIT' then MultiFaceController else SingleFaceController
    env.faceController = new FaceController iv: env.iv, mousetrap: env.mousetrap
    console.log generateConfig taskname
    moduleOption =
      config: generateConfig taskname
      mousetrap: env.mousetrap
      noModify: noModify
    env.module = new Module moduleOption
    env.ready_callback = (imgDetail) ->
      env.module.hide()
      env.faceController.setData imgDetail.data
      env.faceController.show()
      if taskname != 'INIT'
        env.module.show imgDetail.data
    env.done_callback = () ->
      env.module.hide()
      env.faceController.hide()
      env.iv.clearbox()
      env.iv.clear()
    if taskname == 'INIT'
      #about multiface
      lastFaceId = -1
      mc = env.faceController
      env.faceController.on MultiFaceController.Events.EDIT, (arg) ->
        lastFaceId = arg[0]
        mc.highlight lastFaceId
        mc.hide()
        env.module.show arg[1]
      normalize = ->
        env.module.hide()
        mc.normalize lastFaceId
        mc.show()
      env.module.on Point.Events.USER_DONE, normalize
      env.module.on Point.Events.USER_EXIT, normalize
    return env
  return prepare
