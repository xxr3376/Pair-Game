define(['api', 'util/polyfill', 'status-bar', 'image-viewer', 'singleface-controller', 'mousetrap', 'pose-3d', 'admin'], function(API, polyfill, statusBar, ImageViewer, SingleFaceController, Mousetrap, Pose3D, Admin) {
  'use strict';

  polyfill();

  var vaildType = ['POSE3D'];
  var api = new API(vaildType, window.poseOption);

  var iv = new ImageViewer({ container: document.body });

  var scOption = {iv: iv, mousetrap: Mousetrap};
  var sc = new SingleFaceController(scOption);
  var pose3dOption = {iv: iv, mousetrap: Mousetrap};
  if (api.mode === 'view' ) {
    pose3dOption.noModify = true;
  }
  var pose3d = new Pose3D(pose3dOption);

  api.on(API.Events.NEW_IMAGE, function(id) {
    iv.setImage(api.borrow(id));
  });
  api.on(API.Events.DATA_READY, function(imgDetail) {
    pose3d.hide();
    sc.setData(imgDetail.data);
    sc.show();
    iv.afterLoad(function() {
        pose3d.show(imgDetail.data);
    });
  });
  pose3d.on(Pose3D.Events.USER_DONE, function(result) {
    api.setDataHead(result);
    pose3d.hide();
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
