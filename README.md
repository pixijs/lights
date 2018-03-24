# PixiJS Lights

[![Build Status](https://travis-ci.org/pixijs/pixi-lights.svg?branch=master)](https://travis-ci.org/pixijs/pixi-lights)

A plugin that adds deferred lighting to Pixi.js

**Note**: This modules *requires* v4.7.1 (or higher) of [pixi.js](https://github.com/pixijs/pixi.js)
and v0.1.6 (or higher) of [pixi-layers](https://github.com/pixijs/pixi-display).

* [Demo](http://pixijs.io/pixi-lights/demo/index.html)
* [Documentation](http://pixijs.io/pixi-lights/docs/index.html)

### WARNING: Experimental

@xerver: This module is experimental and unoptimized, I do not consider it "production ready" yet.
@ivanpopelyshev: I approve it for production

## Roadmap

1. More lighting types, left are:
 - Spot lights
 - Hemisphere lights
 - Area lights
2. Add dynamic shadows
3. Write tests!

## Usage

[Example](http://pixijs.io/examples/#/layers/normals.js)

You have to create three layers: one for sprites, one for their normals and one for lights. Sprites and normals are rendered to temporary RenderTexture, and lights have those two textures as an input.
 
```js
var WIDTH = 800, HEIGHT = 600;
// Black background is requirement!
var app = new PIXI.Application(WIDTH, HEIGHT, {backgroundColor: 0x000000 });
document.body.appendChild(app.view);

var stage = app.stage = new PIXI.display.Stage();

// put all layers for deferred rendering of normals
stage.addChild(new PIXI.display.Layer(PIXI.lights.diffuseGroup));
stage.addChild(new PIXI.display.Layer(PIXI.lights.normalGroup));
stage.addChild(new PIXI.display.Layer(PIXI.lights.lightGroup));

// adding big lighted element
var bgDiffuse = new PIXI.Sprite(PIXI.Texture.fromImage('test/BGTextureTest.jpg'));
bgDiffuse.parentGroup = PIXI.lights.diffuseGroup;
var bgNormals = new PIXI.Sprite(PIXI.Texture.fromImage('test/BGTextureNORM.jpg'));
bgNormals.parentGroup = PIXI.lights.normalGroup;
var bg = new PIXI.Container();
bg.addChild(bgNormals, bgDiffuse);

//adding a light
var light = new PIXI.lights.PointLight(0xffffff, 1);
stage.addChild(bg);
light.position.set(525, 160);
bg.addChild(light);

```

## Building

You normally don't need to build this module, you can just download a release from the releases page.

However, if you are developing on the project or want a bleeding edge build then you
will need to have [node][node] setup on your machine.

Then you can install dependencies and build:

```js
npm i && npm run build
```

That will output the built distributables to `./lib`.

[node]:       http://nodejs.org/
