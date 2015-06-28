# pixi-lights

A plugin that adds deferred lighting to Pixi.js

**Note**: This modules *requires* v3.0.7 (or higher) of pixi.js.

### WARNING: Experimental

This module is experimental and unoptimized, I do not consider it "production ready" yet.

## Roadmap

1. More lighting types, left are:
 - Spot lights
 - Hemisphere lights
 - Area lights
2. Add dynamic shadows
3. Write tests!

## Usage

This module comes with a couple different objects. The important bits are that is comes with a custom
renderer that does deferred shading, the `WebGLDeferredRenderer`. There also multiple light objects
that can be added to your scene like normal objects and they will emit light.

Here is a quick usage example:

```js
var renderer = new PIXI.lights.WebGLDeferredRenderer(1024, 512),
    stage = new PIXI.Container(),
    light = new PIXI.lights.PointLight(0xffffff, 1);

PIXI.loader.add(['block.png', 'blockNormal.png']).load(function (loader, res) {
    var block = new PIXI.Sprite(res['block.png'].texture);

    // also need to set the normal texture for lighting to work right
    block.normalTexture = res['blockNormal.png'].texture;

    // add the block and the light to the stage
    stage.addChild(block);
    stage.addChild(light);

    animate();
});

function animate() {
    requestAnimationFrame(animate);
    renderer.render(stage);
}
```

Pretty much exactly the same as any normal PIXI scene, except for two things:

1. You must use the `PIXI.lights.WebGLDeferredRenderer`
2. You must assign a normal texture to any sprite you want illuminated

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
