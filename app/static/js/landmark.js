// Generated by CoffeeScript 1.6.3
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  define(["util/type", "helper/events", "status-bar", "jquery", "image-viewer"], function(type, Events, statusBar, $, ImageViewer) {
    var Landmark, MIN_SCALE;
    MIN_SCALE = 0.5;
    Landmark = (function() {
      Events.mixin(Landmark);

      Landmark.Events = type.createEnum(["USER_DONE"]);

      Landmark.status = type.createEnum(["ENABLE", "DISABLE"]);

      function Landmark(options) {
        this.show = __bind(this.show, this);
        this._updateTransform = __bind(this._updateTransform, this);
        var doneBtn,
          _this = this;
        this.iv = options.iv;
        this.pointAttr = [
          {
            name: "contour_chin",
            color: "#FF0000"
          }, {
            name: "contour_left1",
            color: "#FF0000"
          }, {
            name: "contour_left2",
            color: "#FF0000"
          }, {
            name: "contour_left3",
            color: "#FF0000"
          }, {
            name: "contour_left4",
            color: "#FF0000"
          }, {
            name: "contour_left5",
            color: "#FF0000"
          }, {
            name: "contour_left6",
            color: "#FF0000"
          }, {
            name: "contour_left7",
            color: "#FF0000"
          }, {
            name: "contour_left8",
            color: "#FF0000"
          }, {
            name: "contour_left9",
            color: "#FF0000"
          }, {
            name: "contour_right1",
            color: "#FF0000"
          }, {
            name: "contour_right2",
            color: "#FF0000"
          }, {
            name: "contour_right3",
            color: "#FF0000"
          }, {
            name: "contour_right4",
            color: "#FF0000"
          }, {
            name: "contour_right5",
            color: "#FF0000"
          }, {
            name: "contour_right6",
            color: "#FF0000"
          }, {
            name: "contour_right7",
            color: "#FF0000"
          }, {
            name: "contour_right8",
            color: "#FF0000"
          }, {
            name: "contour_right9",
            color: "#FF0000"
          }, {
            name: "left_eye_bottom",
            color: "#FF0000"
          }, {
            name: "left_eye_left_corner",
            color: "#FF0000"
          }, {
            name: "left_eye_lower_left_quarter",
            color: "#FF0000"
          }, {
            name: "left_eye_lower_right_quarter",
            color: "#FF0000"
          }, {
            name: "left_eye_pupil",
            color: "#FF0000"
          }, {
            name: "left_eye_right_corner",
            color: "#FF0000"
          }, {
            name: "left_eye_top",
            color: "#FF0000"
          }, {
            name: "left_eye_upper_left_quarter",
            color: "#FF0000"
          }, {
            name: "left_eye_upper_right_quarter",
            color: "#FF0000"
          }, {
            name: "left_eyebrow_left_corner",
            color: "#FF0000"
          }, {
            name: "left_eyebrow_lower_left_quarter",
            color: "#FF0000"
          }, {
            name: "left_eyebrow_lower_middle",
            color: "#FF0000"
          }, {
            name: "left_eyebrow_lower_right_quarter",
            color: "#FF0000"
          }, {
            name: "left_eyebrow_right_corner",
            color: "#FF0000"
          }, {
            name: "left_eyebrow_upper_left_quarter",
            color: "#FF0000"
          }, {
            name: "left_eyebrow_upper_middle",
            color: "#FF0000"
          }, {
            name: "left_eyebrow_upper_right_quarter",
            color: "#FF0000"
          }, {
            name: "mouth_left_corner",
            color: "#FF0000"
          }, {
            name: "mouth_lower_lip_bottom",
            color: "#FF0000"
          }, {
            name: "mouth_lower_lip_left_contour1",
            color: "#FF0000"
          }, {
            name: "mouth_lower_lip_left_contour2",
            color: "#FF0000"
          }, {
            name: "mouth_lower_lip_left_contour3",
            color: "#FF0000"
          }, {
            name: "mouth_lower_lip_right_contour1",
            color: "#FF0000"
          }, {
            name: "mouth_lower_lip_right_contour2",
            color: "#FF0000"
          }, {
            name: "mouth_lower_lip_right_contour3",
            color: "#FF0000"
          }, {
            name: "mouth_lower_lip_top",
            color: "#FF0000"
          }, {
            name: "mouth_right_corner",
            color: "#FF0000"
          }, {
            name: "mouth_upper_lip_bottom",
            color: "#FF0000"
          }, {
            name: "mouth_upper_lip_left_contour1",
            color: "#FF0000"
          }, {
            name: "mouth_upper_lip_left_contour2",
            color: "#FF0000"
          }, {
            name: "mouth_upper_lip_left_contour3",
            color: "#FF0000"
          }, {
            name: "mouth_upper_lip_right_contour1",
            color: "#FF0000"
          }, {
            name: "mouth_upper_lip_right_contour2",
            color: "#FF0000"
          }, {
            name: "mouth_upper_lip_right_contour3",
            color: "#FF0000"
          }, {
            name: "mouth_upper_lip_top",
            color: "#FF0000"
          }, {
            name: "nose_contour_left1",
            color: "#FF0000"
          }, {
            name: "nose_contour_left2",
            color: "#FF0000"
          }, {
            name: "nose_contour_left3",
            color: "#FF0000"
          }, {
            name: "nose_contour_lower_middle",
            color: "#FF0000"
          }, {
            name: "nose_contour_right1",
            color: "#FF0000"
          }, {
            name: "nose_contour_right2",
            color: "#FF0000"
          }, {
            name: "nose_contour_right3",
            color: "#FF0000"
          }, {
            name: "nose_left",
            color: "#FF0000"
          }, {
            name: "nose_right",
            color: "#FF0000"
          }, {
            name: "nose_tip",
            color: "#FF0000"
          }, {
            name: "right_eye_bottom",
            color: "#FF0000"
          }, {
            name: "right_eye_left_corner",
            color: "#FF0000"
          }, {
            name: "right_eye_lower_left_quarter",
            color: "#FF0000"
          }, {
            name: "right_eye_lower_right_quarter",
            color: "#FF0000"
          }, {
            name: "right_eye_pupil",
            color: "#FF0000"
          }, {
            name: "right_eye_right_corner",
            color: "#FF0000"
          }, {
            name: "right_eye_top",
            color: "#FF0000"
          }, {
            name: "right_eye_upper_left_quarter",
            color: "#FF0000"
          }, {
            name: "right_eye_upper_right_quarter",
            color: "#FF0000"
          }, {
            name: "right_eyebrow_left_corner",
            color: "#FF0000"
          }, {
            name: "right_eyebrow_lower_left_quarter",
            color: "#FF0000"
          }, {
            name: "right_eyebrow_lower_middle",
            color: "#FF0000"
          }, {
            name: "right_eyebrow_lower_right_quarter",
            color: "#FF0000"
          }, {
            name: "right_eyebrow_right_corner",
            color: "#FF0000"
          }, {
            name: "right_eyebrow_upper_left_quarter",
            color: "#FF0000"
          }, {
            name: "right_eyebrow_upper_middle",
            color: "#FF0000"
          }, {
            name: "right_eyebrow_upper_right_quarter",
            color: "#FF0000"
          }
        ];
        this.clearData = function() {
          _this.scale = 1;
          _this.pointList = [];
          _this.lastPosition = [0, 0];
          _this._updatePending = false;
          return _this.pointsLeft = _this.pointAttr.length;
        };
        this.clearData();
        doneBtn = this.doneBtn = document.createElement("button");
        doneBtn.className = "btn";
        doneBtn.innerText = "完成(Tab)";
        doneBtn.style.left = "0";
        doneBtn.style.bottom = "80px";
        doneBtn.style.display = "none";
        doneBtn.onclick = function() {
          if (_this.vaildate()) {
            return _this.trigger(Point.Events.USER_DONE, _this.getResult());
          }
        };
        this.iv.on(ImageViewer.SCALE, function(scale) {
          var newScale;
          newScale = (1 / scale) * 3;
          if (newScale > MIN_SCALE) {
            _this.scale = newScale;
          }
          return _this.applyTransform();
        });
        return;
      }

      Landmark.prototype.applyTransform = function() {
        if (this._updatePending !== true) {
          this._updatePending = true;
          return window.requestAnimationFrame(this._updateTransform);
        }
      };

      Landmark.prototype._updateTransform = function() {
        var point, pointEl, pos, style, transformStyle, _i, _len, _ref, _results;
        this._updatePending = false;
        _ref = this.pointList;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          point = _ref[_i];
          pointEl = point.el;
          pos = point.position;
          transformStyle = "translate(" + pos[0] + "px, " + pos[1] + "px) scale(" + this.scale + ")";
          style = pointEl.style;
          style.transform = transformStyle;
          style.mozTransform = transformStyle;
          _results.push(style.webkitTransform = transformStyle);
        }
        return _results;
      };

      Landmark.prototype.addPoint = function(x, y) {
        var lastId, point, tmpPoint, _ref;
        lastId = this.pointList.length - 1;
        if ((_ref = this.pointList[lastId]) != null) {
          _ref.el.style.background = this.pointAttr[lastId].color;
        }
        console.log("addPoint " + x + ", " + y);
        point = document.createElement('div');
        point.className = "point";
        point.style.background = "#00FF00";
        point.title = this.pointAttr[this.pointList.length].name;
        point.dataset.id = this.pointList.length;
        this.iv.coverEl.appendChild(point);
        tmpPoint = {
          position: [x, y],
          el: point
        };
        this.pointList.push(tmpPoint);
        this.pointsLeft -= 1;
        this.applyTransform();
      };

      Landmark.prototype.show = function(previousResult) {
        var drag, dragPoint, p, _i, _len, _ref,
          _this = this;
        this.clearData();
        if (previousResult && previousResult.landmark_83) {
          this.result = previousResult;
          _ref = previousResult.landmark_83;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            p = _ref[_i];
            this.addPoint(p[0], p[1]);
          }
        }
        this.doneBtn.style.display = "block";
        drag = false;
        dragPoint = false;
        $(this.iv.coverEl).on("mousedown", function(e) {
          drag = true;
          if (e.button === 0 && e.target.className === "point") {
            dragPoint = +e.target.dataset.id;
          }
          _this.lastPosition = [e.pageX, e.pageY];
        });
        $(this.iv.coverEl).on("mousemove", function(e) {
          var dx, dy, helper, x, y;
          helper = "Points Left: " + _this.pointsLeft;
          if (e.target.className === "point") {
            helper = e.target.title;
          }
          dx = e.pageX - _this.lastPosition[0];
          dy = e.pageY - _this.lastPosition[1];
          _this.lastPosition = [e.pageX, e.pageY];
          if (dragPoint !== false) {
            x = dx / _this.iv.transform.scale;
            y = dy / _this.iv.transform.scale;
            _this.pointList[dragPoint].position[0] += x;
            _this.pointList[dragPoint].position[1] += y;
            _this.applyTransform();
          }
        });
        return $(this.iv.coverEl).on("mouseleave mouseup", function(e) {
          var x, y;
          if (drag) {
            if (e.button === 0 && dragPoint === false && e.target.tagName === "DIV" && e.target.className === "cover") {
              if (_this.pointsLeft > 0) {
                x = e.offsetX;
                y = e.offsetY;
                _this.addPoint(x, y);
              }
            }
            drag = false;
            dragPoint = false;
          }
        });
      };

      Landmark.prototype.hide = function() {};

      return Landmark;

    })();
    return Landmark;
  });

}).call(this);
