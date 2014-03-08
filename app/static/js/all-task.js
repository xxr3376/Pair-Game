// Generated by CoffeeScript 1.6.3
(function() {
  define(["config", "util/polyfill", "status-bar", "image-viewer", "mousetrap", "multiface-controller", "singleface-controller", "point", "attr", "landmark", "age-range", "pose-selector", "pose-3d"], function(CONFIG, polyfill, statusBar, ImageViewer, Mousetrap, MultiFaceController, SingleFaceController, Point, Attr, Landmark, AgeRange, PoseSelector, Pose3D) {
    var generateConfig, moduleMap, prepare;
    polyfill();
    moduleMap = {
      'INIT': Point,
      'ORIENTATION': PoseSelector,
      'POSE3D': Pose3D,
      'GENDER': Attr,
      'RACE': Attr,
      'LANDMARK': Landmark,
      'AGE_RANGE:lower': AgeRange,
      'AGE_RANGE:upper': AgeRange,
      'AGE_RANGE:lower,upper': AgeRange
    };
    generateConfig = function(taskname) {
      var config, set;
      for (set in CONFIG) {
        config = CONFIG[set][taskname];
        if (config) {
          return config;
        }
      }
      return null;
    };
    prepare = function(taskname, noModify) {
      var FaceController, Module, env, lastFaceId, mc, moduleOption, normalize;
      Module = moduleMap[taskname];
      env = {
        iv: new ImageViewer({
          container: document.body
        }),
        mousetrap: Mousetrap
      };
      FaceController = taskname === 'INIT' ? MultiFaceController : SingleFaceController;
      env.faceController = new FaceController({
        iv: env.iv,
        mousetrap: env.mousetrap
      });
      console.log(generateConfig(taskname));
      moduleOption = {
        config: generateConfig(taskname),
        mousetrap: env.mousetrap,
        noModify: noModify
      };
      env.module = new Module(moduleOption);
      env.ready_callback = function(imgDetail) {
        env.module.hide();
        env.faceController.setData(imgDetail.data);
        env.faceController.show();
        if (taskname !== 'INIT') {
          return env.module.show(imgDetail.data);
        }
      };
      env.done_callback = function() {
        env.module.hide();
        env.faceController.hide();
        env.iv.clearbox();
        return env.iv.clear();
      };
      if (taskname === 'INIT') {
        lastFaceId = -1;
        mc = env.faceController;
        env.faceController.on(MultiFaceController.Events.EDIT, function(arg) {
          lastFaceId = arg[0];
          mc.highlight(lastFaceId);
          mc.hide();
          return env.module.show(arg[1]);
        });
        normalize = function() {
          env.module.hide();
          mc.normalize(lastFaceId);
          return mc.show();
        };
        env.module.on(Point.Events.USER_DONE, normalize);
        env.module.on(Point.Events.USER_EXIT, normalize);
      }
      return env;
    };
    return prepare;
  });

}).call(this);
