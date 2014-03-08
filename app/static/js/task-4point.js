define(['api', 'util/polyfill', 'status-bar', 'image-viewer', 'multiface-controller', 'point', 'admin', 'mousetrap', 'message'], function(API, polyfill, statusBar, ImageViewer, MultiFaceController, Point, Admin, Mousetrap, Message) {
  'use strict';

  polyfill();

  var vaildType = ['INIT'];
  var api = new API(vaildType, window.poseOption);

  var iv = new ImageViewer({ container: document.body });
  var mcOption = { container: document.body , iv: iv, mousetrap: Mousetrap};

  if (api.mode == 'edit') {
    mcOption.noBtnText = '保存(Enter)';
  }
  else if (api.mode === 'view' ) {
    mcOption.noBtnText = '退出(Enter)';
    mcOption.noModify = true;
  }
  var mc = new MultiFaceController(mcOption);
  var po = new Point({iv: iv, mousetrap:Mousetrap});
  var message = new Message(api, Mousetrap);

  api.on(API.Events.NEW_IMAGE, function(id) {
    iv.setImage(api.borrow(id));
  });
  api.on(API.Events.DATA_READY, function(imgDetail) {
    po.hide();
    mc.setData(imgDetail.data);
    mc.show();
  });
  var lastFaceId = -1;
  mc.on(MultiFaceController.Events.EDIT, function(arg) {
    lastFaceId = arg[0];
    mc.highlight(lastFaceId);
    mc.hide();
    po.show(arg[1]);
  });
  function upload() {
    if (poseOption.mode === 'new') {
      api.uploadHead(true);
      api.nextImage(function() {
        iv.clearbox();
        iv.clear();
        mc.hide();
      });
    }
    else if (poseOption.mode === 'edit') {
      api.uploadHead(false, function() {
        window.goBack();
      });
    }
    else {
      window.goBack();
    }
  }
  message.on(Message.Events.USER_DONE, function() {
    upload();
  });
  mc.on(MultiFaceController.Events.EXIT, function(results) {
    api.setDataHead(results);
    if (api.mode != 'view' && results.length == 0 && ! confirm('No FACE??')) {
      return;
    }
    upload();
  });
  mc.on(MultiFaceController.Events.CHANGE, function(results) {
    api.setDataHead(results);
    if (poseOption.mode !== 'view') {
      api.uploadHead(false);
    }
  });
  po.on(Point.Events.USER_DONE, function(result) {
    po.hide();
    mc.editFace(lastFaceId, result);
    mc.normalize(lastFaceId);
    mc.show();
  });
  po.on(Point.Events.USER_EXIT, function(result) {
    po.hide();
    mc.normalize(lastFaceId);
    mc.show();
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
