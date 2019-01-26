# happy-panorama

> A Vue.js project 

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
# happy-panorama

>a simple panorama plugin based on THREE.JS 

>including CSS3DRenderer && DeviceOrientationControls

```
import {Panorama} from 'panorama';

sourcedata
 nx: {
      url: "xx",// the url of img
      tags: [
        {
          active: true,
          content: "the content of tag",
          images: ["xx"],//the images-list of the dot
          label: "the label of dot",
          position: {x: 430, y: 589},//the position of the dot,base from left-top
          title: "the title of dot",
        }
      ],
    },
 ny:{...},
 nz:{...},
 px:{...},
 py:{...},
 pz:{...}

```
####demo-git

![image](https://github.com/MJingv/happy-panorama/blob/master/src/assets/show.gif)

####abridge building speed
##### 1.happypack-plugin
- 按需加载 import {Panorama} from 'panorama';
- 启用happypack多核构建项目
- 修改source-map配置
- 启用DllPlugin和DllReferencePlugin预编译库文件

##### 2.pacle 

##### 3.roolup

