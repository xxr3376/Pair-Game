define(['api', 'util/polyfill', 'status-bar', 'image-viewer', 'singleface-controller', 'mousetrap', 'pose-selector', 'admin'], function(API, polyfill, statusBar, ImageViewer, SingleFaceController, Mousetrap, PoseSelector, Admin) {
  'use strict';

  polyfill();

  var vaildType = ['ORIENTATION'];
  var api = new API(vaildType, window.poseOption);

  var iv = new ImageViewer({ container: document.body });

  var scOption = {iv: iv, mousetrap: Mousetrap};
  var sc = new SingleFaceController(scOption);
  var ps = new PoseSelector({iv: iv});

  api.on(API.Events.NEW_IMAGE, function(id) {
    iv.setImage(api.borrow(id));
  });
  api.on(API.Events.DATA_READY, function(imgDetail) {
    ps.hide();
    sc.setData(imgDetail.data);
    sc.show(true);
    ps.show(imgDetail.data);
  });
  ps.on(PoseSelector.Events.USER_DONE, function(result) {
    api.setDataHead(result);
    ps.hide();
    iv.reset();
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
