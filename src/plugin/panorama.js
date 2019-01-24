import * as THREE from 'three';
import {CSS3DObject, CSS3DRenderer} from './CSS3DRenderer';

export class Panorama {
  constructor(config) {
    this._config = Object.assign({
      sourceData: '',
      container: document.body,   //容器
      radius: 500,                //球体半径
      fov: 80,                    //相机视角，可用于放大和缩小图片
      offsetLongitude: 0,         //经度偏移量，可用于默认展示图片位置
      offsetLatitude: 0,          //纬度偏移量，可用于默认展示图片位置
      supportTouch: true,         //是否支持手指滑动
      supportOrient: true,        //是否支持陀螺仪
      onFrame(lon, lat) {
        return {lon, lat};
      },
    }, config);

    this._fix = {
      lat: this._config.offsetLatitude || 0,
      lon: this._config.offsetLongitude || 180,
      isFixed: this._config.offsetLatitude || this._config.offsetLongitude,
    };

    this._touch = this._orient = {
      lat: 0,
      lon: 0,
    };
    this.box = this._config.container;
    this.camera;
    this.scene;
    this.renderer;
    this.touchX = 0;
    this.touchY = 0;
    this.lon = -110;
    this.lat = -50;//调整初始值
    this.domElement = null;
    this.sourceData = typeof(this._config.sourceData) == 'string' ? JSON.parse(this._config.sourceData) : this._config.sourceData;
    this.starts = {
      pz: {
        lon: 90,
        lat: -20,
      },
      px: {
        lon: 180,
        lat: -20,
      },
      nz: {
        lon: 270,
        lat: -20,
      },
      nx: {
        lon: 0,
        lat: -20,
      },
      py: {
        lon: null,
        lat: 0,
      },
      ny: {
        lon: null,
        lat: -80,
      },

    };
    this.marksElements = [];
    this.wrapList = [];

    this.canMove = true;
    this.start();
  }

  start() {
    this.init();
    this.animate();
    this.resetBoxPostion();
  }

  initMask() {
    let mask = document.createElement('div');
    mask.id = 'mask';
    mask.className = 'mask';
    ['mask-title', 'mask-detail'].map(item => {
      let child = document.createElement('div');
      child.className = item;
      mask.appendChild(child);
    });
    let img = document.createElement('img');
    img.id = 'mask-img';
    img.className = 'mask-img';
    mask.appendChild(img);
    this.box.appendChild(mask);
  }


  _processSidesData() {
    let flipAngle = Math.PI, // 180度
      rightAngle = flipAngle / 2, // 90度
      tileWidth = 512;
    for (let key  in  this.sourceData) {
      switch (key) {
        case 'px': {
          this.sourceData[key].position = [-tileWidth, 0, 0];
          this.sourceData[key].rotation = [0, rightAngle, 0];
          break;
        }

        case 'nx': {
          this.sourceData[key].position = [tileWidth, 0, 0];
          this.sourceData[key].rotation = [0, -rightAngle, 0];
          break;
        }
        case 'py': {
          this.sourceData[key].position = [0, tileWidth, 0];
          this.sourceData[key].rotation = [rightAngle, 0, Math.PI];
          break;
        }
        case 'ny': {
          this.sourceData[key].position = [0, -tileWidth, 0];
          this.sourceData[key].rotation = [-rightAngle, 0, Math.PI];
          break;
        }
        case 'pz': {
          this.sourceData[key].position = [0, 0, tileWidth];
          this.sourceData[key].rotation = [0, Math.PI, 0];
          break;
        }
        case 'nz': {
          this.sourceData[key].position = [0, 0, -tileWidth];
          this.sourceData[key].rotation = [0, 0, 0];
          break;
        }
      }
    }

  }


  _initEverySide() {
    for (let name in this.sourceData) {
      let side = this.sourceData[name];
      let cube_item = document.createElement('div');
      cube_item.className = 'cube_surface';
      cube_item.style.height = '1024px';
      cube_item.style.width = '1024px';
      cube_item.style.position = 'relative';

      let element = document.createElement('img');
      element.className = 'cube_surface_image';
      element.width = 1026;
      element.height = 1026; // 2 pixels extra to close the gap.
      element.src = side.url;
      cube_item.appendChild(element);
      // 添加一个渲染器
      let object = new CSS3DObject(cube_item);

      object.position.fromArray(side.position);
      object.rotation.fromArray(side.rotation);
      this.scene.add(object);

      let innerDots = this.sourceData[name].tags;
      if (innerDots) {
        this.initAllTags(cube_item, innerDots, name);
      }
    }

  }


  initSides() {
    this._processSidesData();//补充position等信息
    this._initEverySide();//初始化每一个面

    this.renderer = new CSS3DRenderer(); // 定义渲染器
    this.renderer.setSize(window.innerWidth, window.innerHeight); // 定义尺寸
    this.renderer.domElement.className += '  cube-box';
    this.domElement = this.renderer.domElement;
    this.box.appendChild(this.renderer.domElement); // 将场景到加入页面中

  }


  initAllTags(dom, dots, name) {
    dots.map(item => {
      let wrap = document.createElement('div');
      wrap.className = 'tag-wrap ' + name;
      let dot = document.createElement('div');
      let mark = document.createElement('div');
      mark.className = `mark ${name}`;
      dot.className = 'tag-dot';
      mark.style.left = item.position.x + 'px';
      mark.style.top = item.position.y + 'px';

      this.marksElements.push(mark);
      this.wrapList.push(wrap);
      wrap.appendChild(dot);
      dom.appendChild(mark);
      this.box.appendChild(wrap);
      this._initLabel(wrap, item);
      wrap.onclick = this.callDetailView.bind(this);
    });
  }


  _initLabel(wrap, dot) {
    let textEle = document.createElement('div');
    textEle.className = 'tag-label';
    textEle.innerHTML = dot.label;
    textEle.setAttribute('data-image', dot.images[0]);
    textEle.setAttribute('data-title', dot.title);
    textEle.setAttribute('data-detail', dot.content);

    wrap.appendChild(textEle);
  }


  setBoxTransform(mark, wrap, width, height) {
    let rect = mark.getBoundingClientRect();
    let left = rect.left;
    let top = rect.top;
    let translateX = left - (width / 2);
    let translateY = top - (height / 2);
    wrap.style.transform = 'translateX(' + translateX + 'px) translateY(' + translateY + 'px) ';
  }


  init() {
    /**
     * 添加相机
     * @type {THREE.PerspectiveCamera}
     */
    this.camera = new THREE.PerspectiveCamera(
      this._config.fov, // 相机视角的夹角
      window.innerWidth / window.innerHeight,  // 相机画幅比
      1, // 最近焦距
      1000, // 最远焦距
    );

    /**
     * 创建场景
     * @type {THREE.Scene}
     */
    this.scene = new THREE.Scene();

    this.initMask();//初始化遮罩

    /**
     *正方体的6个面的资源及相关（坐标、旋转等）设置
     */
    this.initSides();

    this._initControl();

    window.addEventListener('resize', this._bindResize = this.onWindowResize.bind(this));

  }


  update(config = {}) {
    this._config = Object.assign({}, this._config, config);
    if (config.fov) {
      this.camera.fov = config.fov;
    }
  }

  _initControl() {
    const self = this;
    const config = this._config;

    if (config.supportTouch) {
      let fov;
      this._toucher = new Toucher({
        container: config.container,
        radius: config.radius,
        onChange({lon, lat, scale}) {
          if (scale) {
            fov = self._config.fov / scale;
            fov = Math.min(100, Math.max(fov, 70));
            self.update({fov});
          }
          if (lon !== undefined && lat !== undefined) {
            //超出范围，用fix来补
            if (self._fix.lat + self._orient.lat + lat > 90) {
              self._fix.lat = 90 - self._orient.lat - lat;
            } else if (self._fix.lat + self._orient.lat + lat < -90) {
              self._fix.lat = -90 - self._orient.lat - lat;
            }
            self._touch = {lon, lat};
          }
        },
      });
    }

    if (config.supportOrient) {
      this._orienter = new Orienter({
        onChange({lat, lon}) {
          const {_fix} = self;
          if (!_fix.isFixed) {
            self._fix = {
              lat: _fix.lat - lat,
              lon: _fix.lon - lon,
              isFixed: true,
            };
          }
          if (Math.abs(self._orient.lat - lat) >= 90) {
            return;
          }
          //超出范围，用fix来补
          if (self._fix.lat + self._touch.lat + lat > 90) {
            self._fix.lat = 90 - self._touch.lat - lat;
          } else if (self._fix.lat + self._touch.lat + lat < -90) {
            self._fix.lat = -90 - self._touch.lat - lat;
          }

          self._orient = {lat, lon};
        },
      });
    }

  }

  callDetailView(e) {
    e.stopPropagation();//阻止冒泡,遮罩事件无法影响上层(box)
    this.canMove = false;
    let mask = document.getElementById('mask');
    mask.style.display = 'flex';

    _getMaskChild(0).innerHTML = _getAttrContent('data-title');
    _getMaskChild(1).innerHTML = _getAttrContent('data-detail');
    _getMaskChild(2).setAttribute('src', _getAttrContent('data-image'));

    mask.onclick = _close.bind(this);

    function _getMaskChild(index) {
      //0:title,1:detail,2:img
      return mask.children[index];
    }

    function _getAttrContent(str) {
      let target = e.currentTarget;
      return target.lastChild.getAttribute(str);
    }

    function _close(e) {
      e.stopPropagation();//阻止冒泡,遮罩事件无法影响上层(box)
      mask.style.display = 'none';
      this.canMove = true;
    }
  }

  resetBoxPostion() {
    let t = this;
    for (let i = 0; i < this.marksElements.length; i++) {
      let markEle = this.marksElements[i];
      let wrap = this.wrapList[i];

      let name = wrap.className.slice(-2);
      let startPosition = this.starts[name];

      wrap.style.visibility = 'hidden';//全部隐藏

      function _move(needMove) {
        if (needMove) {
          wrap.style.visibility = 'visible';
          t.setBoxTransform(markEle, wrap, wrap.style.width, wrap.style.height);
        } else {
          wrap.style.visibility = 'hidden';//全部隐藏
        }
      }

      if (['px', 'nx', 'pz', 'nz'].indexOf(name) > -1) {
        let newLon = (this.lon % 360 + 360) % 360;//范围[0,360)
        let diff = newLon - startPosition.lon;
        if (name == 'px') {
          //px特殊处理360到0
          diff = Math.min(diff, 360 - newLon);
        }

        let needMove = Math.abs(diff) < this._config.fov;
        _move(needMove);

      } else if (name == 'py') {
        let needMove = this.lat >= 20 && this.lat <= 70;
        _move(needMove);
      }
      else if (name == 'ny') {
        let needMove = this.lat >= -70 && this.lat <= -20;
        _move(needMove);
      }
    }
  }

  onWindowResize() {
    //窗体大小改变触发更新
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }


  destroy() {
    this._toucher && this._toucher.unbind();
    this._orienter && this._orienter.destroy();
    this._bindResize && window.removeEventListener('resize', this.onWindowResize);
    cancelAnimationFrame(this._intFrame);
  }

  animate() {
    /**
     * 实时渲染函数
     */

    const config = this._config;
    let lat = this._touch.lat + this._fix.lat + this._orient.lat;
    let lon = this._touch.lon + this._fix.lon + this._orient.lon;

    //外部传的经纬度
    let obj = config.onFrame(lon, lat) || {};
    lon += (obj.lon || 0);
    lat += (obj.lat || 0);

    lat = Math.max(-80, Math.min(80, lat)); //限制固定角度内旋转

    this.lon = lon;
    this.lat = lat;

    lat = THREE.Math.degToRad(lat);
    lon = THREE.Math.degToRad(lon);

    let target = new THREE.Vector3();

    if (this.canMove) {
      target.x = 500 * Math.cos(lat) * Math.cos(lon);
      target.y = 500 * Math.sin(lat);
      target.z = 500 * Math.cos(lat) * Math.sin(lon);
    }
    this.camera.lookAt(target);
    this.resetBoxPostion();
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
    this._intFrame = requestAnimationFrame(this.animate.bind(this));
  }
}


class Orienter {
  constructor(config) {
    this._config = Object.assign({
      onChange() {
      },
      onOrient() {
      },
    }, config);

    this.lon = this.lat = 0;
    this.moothFactor = 10;
    this.boundary = 320;
    this.direction = window.orientation || 0;
    this.bind();
  }


  bind() {
    window.addEventListener('deviceorientation', this._bindChange = this._onChange.bind(this));
    window.addEventListener('orientationchange', this._bindOrient = this._onOrient.bind(this));
  }


  destroy() {
    window.removeEventListener('deviceorientation', this._bindChange, false);
    window.removeEventListener('orientationchange', this._bindOrient, false);
  }


  _onOrient(event) {
    this.direction = window.orientation;
    this._config.onOrient(event);
    this.lastLon = this.lastLat = undefined;
  }

  _mooth(x, lx) { //插值为了平滑些

    if (lx === undefined) {
      return x;
    }

    //0至360,边界值特例，有卡顿待优化
    if (Math.abs(x - lx) > this.boundary) {
      if (lx > this.boundary) {
        lx = 0;
      } else {
        lx = 360;
      }
    }


    //滤波降噪
    x = lx + (x - lx) / this.moothFactor;
    return x;
  }

  _onChange(evt) {
    switch (this.direction) {
      case 0 :
        this.lon = -(evt.alpha + evt.gamma);
        this.lat = evt.beta - 90;
        break;
      case 90:
        this.lon = evt.alpha - Math.abs(evt.beta);
        this.lat = evt.gamma < 0 ? -90 - evt.gamma : 90 - evt.gamma;
        break;
      case -90:
        this.lon = -(evt.alpha + Math.abs(evt.beta));
        this.lat = evt.gamma > 0 ? evt.gamma - 90 : 90 + evt.gamma;
        break;
    }

    this.lon = this.lon > 0 ? this.lon % 360 : this.lon % 360 + 360;

    //插值为了平滑，修复部分android手机陀螺仪数字有抖动异常的
    this.lastLat = this.lat = this._mooth(this.lat, this.lastLat);
    this.lastLon = this.lon = this._mooth(this.lon, this.lastLon);

    this._config.onChange({
      lon: this.lon,
      lat: this.lat,
    });
  }
}

class Toucher {
  constructor(config) {
    this.config = Object.assign({
      radius: 50,
      container: document.body,
      onStart() {
      },
      onMove() {
      },
      onEnd() {
      },
      onChange() {
      },
    }, config);
    this.lat = this.lon = 0;
    this.lastX = this.lastY = 0;
    this.lastDistance = 0;
    this.startX = this.startY = 0;
    this.speed = {lat: 0, lon: 0};
    this.deceleration = 0.5;
    this.factor = 50 / this.config.radius;
    this.bind();
  }

  bind() {
    const {container} = this.config;
    container.addEventListener('touchstart', this._bindStart = this._onStart.bind(this));
    container.addEventListener('touchmove', this._bindMove = this._onMove.bind(this));
    container.addEventListener('touchend', this._bindEnd = this._onEnd.bind(this));

  }

  unbind() {
    const {container} = this.config;
    container.removeEventListener('touchstart', this._bindStart);
    container.removeEventListener('touchmove', this._bindMove);
    container.removeEventListener('touchend', this._bindEnd);
  }

  _onStart(event) {
    const evt = event.changedTouches[0];
    this.startX = this.lastX = evt.clientX;
    this.startY = this.lastY = evt.clientY;
    this.startTime = Date.now();
    this.config.onStart(event);
    this.speed = {lat: 0, lon: 0};
    this.lastDistance = undefined;
  }

  _onMove(event) {
    event.preventDefault();
    const evt = event.changedTouches[0];
    switch (event.changedTouches.length) {
      case 1 :
        if (!this.lastDistance) {
          this.lon += (this.lastX - evt.clientX) * this.factor;
          this.lat += (evt.clientY - this.lastY) * this.factor;

          this.lastX = evt.clientX;
          this.lastY = evt.clientY;

          this.config.onChange({
            lat: this.lat,
            lon: this.lon,
          });
        }
        break;
      case 2:
        const evt1 = event.changedTouches[1];
        let distance = Math.abs(evt.clientX - evt1.clientX) + Math.abs(evt.clientY - evt1.clientY);
        if (this.lastDistance === undefined) {
          this.lastDistance = distance;
        }
        let scale = distance / this.lastDistance;
        if (scale) {
          this.config.onChange({scale});
          this.lastDistance = distance;
        }
    }
    this.config.onMove(event);
  }

  _onEnd(event) {
    //惯性
    let t = (Date.now() - this.startTime) / 10;
    this.speed = {
      lat: (this.startY - this.lastY) / t,
      lon: (this.startX - this.lastX) / t,
    };

    this._inertance();
    this.config.onEnd(event);
  }

  _subSpeed(speed) {
    if (speed !== 0) {
      if (speed > 0) {
        speed -= this.deceleration;
        speed < 0 && (speed = 0);
      } else {
        speed += this.deceleration;
        speed > 0 && (speed = 0);
      }
    }
    return speed;
  }

  _inertance() {
    const speed = this.speed;
    speed.lat = this._subSpeed(speed.lat);
    speed.lon = this._subSpeed(speed.lon);

    this.lat -= speed.lat;
    this.lon += speed.lon;


    this.config.onChange({
      isUserInteracting: false,
      speed,
      lat: this.lat,
      lon: this.lon,
    });

    if (speed.lat === 0 && speed.lon === 0) {
      this._intFrame && cancelAnimationFrame(this._intFrame);
      this._intFrame = 0;
    } else {
      this._intFrame = requestAnimationFrame(this._inertance.bind(this));
    }
  }
}
