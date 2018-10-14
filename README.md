# PixiJS Lights

[![Build Status](https://travis-ci.org/pixijs/pixi-lights.svg?branch=master)](https://travis-ci.org/pixijs/pixi-lights)

A plugin that adds deferred lighting to PixiJS.

**Note**: This modules *requires* v4.5.0+ of [pixi.js](https://github.com/pixijs/pixi.js) and v0.1.6 of [pixi-layers](https://github.com/pixijs/pixi-display).

* [Demo](https://pixijs.io/pixi-lights/demo/index.html)
* [Documentation](https://pixijs.io/pixi-lights/docs/index.html)

## Usage

[Example](https://pixijs.io/pixi-lights/demo/usage.html)

You have to create three layers: one for sprites, one for their normals and one for lights. Sprites and normals are rendered to temporary RenderTexture, and lights have those two textures as an input.
 
```js
import 'pixi.js';
import 'pixi-layers';
import 'pixi-lights';

// Get class references
const {Application, Sprite, Container, lights, display} = PIXI;
const {diffuseGroup, normalGroup, lightGroup} = lights;
const {Layer, Stage} = display;

// Create new application
const app = new Application({
    backgroundColor: 0x000000, // Black is required!
    width: 800,
    height: 600
});
document.body.appendChild(app.view);

// Use the pixi-layers Stage instead of default Container
app.stage = new Stage();

// Add the background diffuse color
const diffuse = Sprite.fromImage('images/BGTextureTest.jpg');
diffuse.parentGroup = diffuseGroup;

// Add the background normal map
const normals = Sprite.fromImage('images/BGTextureNORM.jpg');
normals.parentGroup = normalGroup;

// Create the point light
const light = new PIXI.lights.PointLight(0xffffff, 1);
light.x = app.screen.width / 2;
light.y = app.screen.height / 2;

// Create a background container 
const background = new Container();
background.addChild(
    normals,
    diffuse,
    light
);

app.stage.addChild(
    // put all layers for deferred rendering of normals
    new Layer(diffuseGroup),
    new Layer(normalGroup),
    new Layer(lightGroup),
    // Add the lights and images
    background
);
```

### Filters

If you want to use light shaders inside a filter, make sure its full-screen:

```js
app.stage.filters = [new PIXI.filters.BlurFilter()];
app.stage.filterArea = app.screen;
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

## Roadmap

1. More lighting types, left are:
 - Spot lights
 - Hemisphere lights
 - Area lights
2. Add dynamic shadows
3. Write tests!
