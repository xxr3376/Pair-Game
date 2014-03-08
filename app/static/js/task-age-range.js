define(['api', 'util/polyfill', 'status-bar', 'image-viewer', 'singleface-controller', 'mousetrap', 'age-range', 'admin', 'config'], function(API, polyfill, statusBar, ImageViewer, SingleFaceController, Mousetrap, AgeRange, Admin, CONFIG) {
  'use strict';
  polyfill();
  var config = CONFIG.age_range;
  var vaildType = Object.keys(config);
  var api = new API(vaildType, window.poseOption);

  var iv = new ImageViewer({ container: document.body });
  var scOption = {iv: iv, mousetrap: Mousetrap};
  var sc = new SingleFaceController(scOption);
  var rangeOption = {
    config: config[poseOption.type],
    mousetrap: Mousetrap,
  };
  if (api.mode === 'view' ) {
    rangeOption.noModify = true;
  }
  var range = new AgeRange(rangeOption);

  api.on(API.Events.NEW_IMAGE, function(id) {
    iv.setImage(api.borrow(id));
  });
  api.on(API.Events.DATA_READY, function(imgDetail) {
    range.hide();
    sc.setData(imgDetail.data);
    sc.show();
    range.show(imgDetail.data);
  });
  range.on(AgeRange.Events.USER_DONE, function(result) {
    api.setDataHead(result);
    range.hide();
    if (poseOption.mode === 'new') {
      api.uploadHead(true);
      api.nextImage(function() {
        sc.hide();
        iv.clearbox();
        iv.clear();
      });
    }
    else if (poseOption.mode === 'edit') {
      api.uploadHead(false, function() {
        window.goBack();
      });
    }
    else if (poseOption.mode === 'view' ) {
      window.goBack();
    }
  });
  if (api.mode === 'view') {
    var admin = new Admin(api);
    admin.on(Admin.Events.USER_DONE, function() {
      statusBar.status = '已经保存';
      setTimeout(function() { statusBar.status = '';}, 1000);
    });
  }

  api.begin();
});
