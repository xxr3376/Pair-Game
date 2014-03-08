define(['api', 'util/polyfill', 'status-bar', 'image-viewer', 'singleface-controller', 'mousetrap', 'attr', 'admin', 'config'], function(API, polyfill, statusBar, ImageViewer, SingleFaceController, Mousetrap, AttrSelector, Admin, CONFIG) {
  'use strict';

  polyfill();

  var config = CONFIG.attr;
  var vaildType = Object.keys(config);
  var api = new API(vaildType, window.poseOption);

  var iv = new ImageViewer({ container: document.body });
  var scOption = {iv: iv, mousetrap: Mousetrap};
  var sc = new SingleFaceController(scOption);
  var attrOption = {
    config: config[poseOption.type],
    mousetrap: Mousetrap,
  };
  if (api.mode === 'view' ) {
    attrOption.noModify = true;
  }
  var attr = new AttrSelector(attrOption);

  api.on(API.Events.NEW_IMAGE, function(id) {
    iv.setImage(api.borrow(id));
  });
  api.on(API.Events.DATA_READY, function(imgDetail) {
    attr.hide();
    sc.setData(imgDetail.data);
    sc.show();
    attr.show(imgDetail.data);
  });
  attr.on(AttrSelector.Events.USER_DONE, function(result) {
    api.setDataHead(result);
    attr.hide();
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
