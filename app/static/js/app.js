define(['jquery', 'util/polyfill', 'util/type', 'status-bar', 'image-viewer', 'pose-selector', 'pose-3d', 'image-manager', 'multiface-controller', 'point'], function($, polyfill, type, statusBar, ImageViewer, PoseSelector, Pose3D, ImageManager, MultiFaceController, Point) {
  'use strict';

  polyfill();

  var SERVER = '/api/';
  var IMG_SERVER = 'http://localhost:9998/';

  $.getJSON(SERVER + 'getNewList', function(reply) {
    if (reply.status === 'SUCCESS') {
      init(reply.data)
    }
    else {
      alert(reply.status);
    }
  });
  window.onbeforeunload = function(e) {
    $.ajax({
      type: 'GET',
      url: SERVER + 'releaseAll',
      async: false,
    });
  };
  var im = new ImageManager({ IMG_SERVER: IMG_SERVER} );
  var iv = new ImageViewer({ container: document.body });
  var mc = new MultiFaceController({ container: document.body , iv: iv});
  var ps = new PoseSelector({iv: iv});
  var pose3d = new Pose3D({iv: iv});
  var po = new Point({iv: iv});
  document.body.appendChild(pose3d.el);
  document.body.appendChild(statusBar.el);

  var lastFaceId = -1;
  var imgs = [];
  mc.on(MultiFaceController.Events.EDIT, function(arg) {
    lastFaceId = arg[0];
    mc.hide();
    po.show(arg[1]);
  });
  mc.on(MultiFaceController.Events.EXIT, function(results) {
    imgs[0].data = results;
    upload(imgs[0].id, imgs[0].data, true)
    nextImage();
  });
  mc.on(MultiFaceController.Events.CHANGE, function(results) {
    imgs[0].data = results;
    upload(imgs[0].id, imgs[0].data, false)
  });

  po.on(Point.Events.USER_DONE, function(result) {
    po.hide();
    if (result.points.length === 4) {
      iv.rollImage(result.points[0], result.points[1]);
    }
    ps.show(result);
    /*
    mc.editFace(lastFaceId, result);
    mc.show();
    */
  });
  ps.on(PoseSelector.Events.USER_DONE, function(result) {
    ps.hide();
    iv.reset();
    pose3d.show(result);
  });
  pose3d.on(Pose3D.Events.USER_DONE, function(result) {
    pose3d.hide();
    mc.editFace(lastFaceId, result);
    mc.show();
  });

  function init(data) {
    im.init(data);
    imgs = data;
    iv.setImage(im.borrow(imgs[0].id));
    mc.setData(imgs[0].data);
    mc.show();
  }
  function nextImage() {
    var oldImg = imgs.shift();
    im.pay(oldImg.id);
    mc.hide();
    if (imgs.length <= 0) {
      alert('No More');
      return;
    }
    var newImg = imgs[0];
    statusBar.status = 'Thank you! Next IMG_ID is ' + newImg.id;
    iv.setImage(im.borrow(newImg.id));
    mc.setData(newImg.data);
    mc.show();
  }
  function upload(id, data, done) {
    var d = JSON.stringify({
      'id': id,
      'data': data,
      'done': done,
    });
    $.ajax({
      type: 'POST',
      contentType: 'application/json',
      data: d,
      dataType: 'json',
      url: '/api/submit',
      success: function (e) {
        if (e.status !== 'SUCCESS') {
          window.open('data:text/plain;charset=utf-8,' + d);
        }
        if (e.next) {
          imgs.push(e.next);
          im.fetch(e.next);
        }
      }
    });
  }
});
