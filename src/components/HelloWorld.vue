<template>
  <div id="box" class="box" ref="box"></div>
</template>

<script>
  import {Panorama} from './../plugin/panorama';

  export default {
    name: 'HelloWorld',
    data() {
      return {
        msg: 'Welcome to Your Vue.js App',
        data: []
      };
    },

    mounted() {
      this.initPanorama();
    },
    methods: {

      //
      initPanorama() {
        //initFn
        new Panorama({
          sourceData: {
            nx: {
              url: "http://img-ys011.didistatic.com/static/carshare/orion_mis/b32804dc4532_20180917150731",
              tags: [
                {
                  active: true,
                  content: "the content of tag",
                  images: ["http://img-ys011.didistatic.com/static/carshare/orion_mis/d790ab962341_20180917182324.png"],//the images-list of the dot
                  label: "the label of dot",
                  position: {x: 430, y: 589},//the position of the dot
                  title: "the title of dot",
                }
              ],
            },
            ny: {
              url: "http://img-ys011.didistatic.com/static/carshare/orion_mis/0709f4251335_20180917150716",
              tags: [
                {
                  active: false,
                  content: "启动车辆时按下顶部安全按钮，松开手刹；停车时拉起手刹车。",
                  images: ["http://img-ys011.didistatic.com/static/carshare/orion_mis/2929cd741270_20180917152913.png"],
                  label: "手刹",
                  position: {x: 318, y: 667},
                  title: "手刹",
                }, {
                  active: true,
                  content: "踩下刹车，前后推动换挡杆，即可完成档位切换。",
                  images: ["http://img-ys011.didistatic.com/static/carshare/orion_mis/a5dedd022749_20180917152944.png"],
                  label: "档位",
                  position: {x: 296, y: 929},
                  title: "档位",
                }
              ]
            },
            nz: {
              url: "http://img-ys011.didistatic.com/static/carshare/orion_mis/6b9147855877_20180917150741",
              tags: [
                {
                  active: true,
                  content: "仪表盘显示绿色READY时表示车辆为启动状态。续航里程会受空调、蓝牙播放音乐使用影响出现浮动。",
                  images: ["http://img-ys011.didistatic.com/static/carshare/orion_mis/d790ab962341_20180917182324.png"],
                  label: "仪表盘",
                  position: {x: 430, y: 589},
                  title: "仪表盘",
                }
              ],

            },
            px: {
              tags: [],
              url: "http://img-ys011.didistatic.com/static/carshare/orion_mis/95d76e355744_20180917150721"
            },
            py: {
              tags: [],
              url: "http://img-ys011.didistatic.com/static/carshare/orion_mis/09c9b30a9122_20180917150703"
            },
            pz: {

              tags: [],
              url: "http://img-ys011.didistatic.com/static/carshare/orion_mis/8efb1e5a3544_20180917150708"
            }
          },
          offsetLongitude: -90,
          offsetLatitude: -30,
          supportOrient: false,
          container: this.$refs.box,
          onFrame: function (lon, lat) {
            return;
          },
        });
      },
    }
  };
</script>

<style>
  body {
    background: #eee;
  }

  .view {
    width: 100%;
    overflow: hidden;
  }

  .guid_image {
    width: 100%;
    height: auto;
  }

  body, html {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  body {
    background-color: #000000;
    margin: 0;
    cursor: move;
    -webkit-overflow-scrolling: touch;
  }

  .box {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;

  }

  .tag-wrap {
    display: flex;
    position: absolute;
    z-index: 100;
    transform-origin: 50% 50% 0px
  }

  .tag-label {
    position: relative;
    border-radius: 5px;
    background-color: rgba(0, 0, 0, .5);
    color: #fff;
    font-size: 14px;
    padding: 5px 10px;
    border-radius: 5px;
    top: -10px;
    left: 15px;
  }

  .tag-dot {
    border-radius: 50%;
    width: 12px;
    height: 12px;
    background-color: rgba(255, 163, 54, 1);
    position: relative;
    animation: blink 1.5s linear infinite;
    cursor: pointer;

  }

  @keyframes blink {
    0% {
      box-shadow: 0 0 0 0px rgba(255, 163, 54, .3), 0 0 0 0px rgba(255, 163, 54, .3);
    }
    30% {
      box-shadow: 0 0 0 3px rgba(255, 163, 54, .5), 0 0 0 10px rgba(255, 163, 54, .2);
    }
    100% {
      box-shadow: 0 0 0 10px rgba(255, 163, 54, .1), 0 0 0 5px rgba(255, 163, 54, 0.05);
    }
  }

  .mask {
    display: none;
    flex-direction: column;
    color: #000;
    background-color: #FFFFFF;
    z-index: 1000;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }

  .mask-title {
    font-size: 25px;
    margin: 20% 30px 0 30px;
  }

  .mask-title::after {
    /*content: url(close@2x.png);*/
    display: block;
    position: absolute;
    right: 40px;
    top: 40px;
  }

  .mask-detail {
    margin: 18px 30px 40px 30px;
    font-size: 14px;
    color: #2A2A2A;
  }

  .mask-img {
    display: block;
    width: 100%;

  }

  .mark {
    width: 1px;
    height: 1px;
    background-color: green;
    position: absolute;
  }

</style>
