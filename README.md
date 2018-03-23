# pixi-lights

A plugin that adds deferred lighting to Pixi.js

**Note**: This modules *requires* v4.7.1 (or higher) of [pixi.js](https://github.com/pixijs/pixi.js).
**Note**: This modules *requires* v0.1.5 (or higher) of [pixi-layers](https://github.com/pixijs/pixi-display).

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

You have to create three layers: one for sprites, one for their normals and one for lights. 
Sprites and normals are rendered to temporary RenderTexture, and lights have those two textures as an input.  

```js
var WIDTH = 800, HEIGHT = 600;

var app = new PIXI.Application(WIDTH, HEIGHT);
document.body.appendChild(app.view);

var stage = app.stage = new PIXI.display.Stage();
var light = new PIXI.lights.PointLight(0xffffff, 1);

// put all layers for deferred rendering of normals
stage.addChild(new PIXI.display.Layer(PIXI.lights.diffuseGroup));
stage.addChild(new PIXI.display.Layer(PIXI.lights.normalGroup));
stage.addChild(new PIXI.display.Layer(PIXI.lights.lightGroup));

PIXI.loader.baseUrl = 'https://cdn.rawgit.com/pixijs/pixi-lights/b7fd7924fdf4e6a6b913ff29161402e7b36f0c0f/';

PIXI.loader
    .add('bg_diffuse', 'test/BGTextureTest.jpg')
    .add('bg_normal', 'test/BGTextureNORM.jpg')
    .load(onAssetsLoaded);

function createPair(diffuseTex, normalTex) {
    var container = new PIXI.Container();
    var diffuseSprite = new PIXI.Sprite(diffuseTex);
    diffuseSprite.parentGroup = PIXI.lights.diffuseGroup;
    var normalSprite = new PIXI.Sprite(normalTex);
    normalSprite.parentGroup = PIXI.lights.normalGroup;
    container.addChild(diffuseSprite);
    container.addChild(normalSprite);
    return container;
}

function onAssetsLoaded(loader, res) {
    var bg = createPair(res.bg_diffuse.texture, res.bg_normal.texture);
    light.position.set(525, 160);
    
    //add more lights if needed
    bg.interactive = true;
    bg.on('mousemove', function (event) {
        light.position.copy(event.data.global);
    });

    bg.on('pointerdown', function (event) {
        var clickLight = new PIXI.lights.PointLight(0xffffff);
        clickLight.position.copy(event.data.global);
        stage.addChild(clickLight);
    });
}

```

## Building

You normally don't need to build this module, you can just download a release from the
releases page.

However, if you are developing on the project or want a bleeding edge build then you
will need to have [node][node] and [gulp][gulp] setup on your machine.

Then you can install dependencies and build:

```js
npm i && npm run build
```

That will output the built distributables to `./bin`.

[node]:       http://nodejs.org/
[gulp]:       http://gulpjs.com/
