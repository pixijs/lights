# PixiJS Lights

[![Build CI](https://github.com/pixijs/lights/actions/workflows/build.yml/badge.svg)](https://github.com/pixijs/lights/actions/workflows/build.yml) [![npm version](https://badge.fury.io/js/@pixi%2Flights.svg)](https://badge.fury.io/js/@pixi%2Flights)

A plugin that adds deferred lighting to PixiJS.

**Note**: This modules *requires* v7.0.0+ of [PixiJS](https://github.com/pixijs/pixijs) and v2.0.1+ of [@pixi/layers](https://github.com/pixijs/layers).

* [Demo](https://pixijs.io/lights/demo/index.html)

## Usage

You have to create three layers: one for sprites, one for their normals and one for lights. Sprites and normals are rendered to temporary RenderTexture, and lights have those two textures as an input.

```js
// Get class references
import {Application, Sprite, Container, lights} from 'pixi.js';
import {Layer, Stage} from '@pixi/layers';
import {diffuseGroup, normalGroup, lightGroup, PointLight} from '@pixi/lights';

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
const light = new PointLight(0xffffff, 1);
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

* [Run This](https://pixijs.io/lights/demo/usage.html)

### Filters

If you want to use light shaders inside a filter, make sure its full-screen:

```js
app.stage.filters = [new BlurFilter()];
app.stage.filterArea = app.screen;
```

## Vanilla JS

Navigate `pixi-lights` npm package, take `dist/pixi-lights.js` file.

```html
<script src='lib/pixi.js'></script>
<script src='lib/pixi-lights.umd.js'></script>
```

all classes can be accessed through `PIXI.lights` global namespace.

## Building

You normally don't need to build this module, you can just download a release from the releases page.

Then you can install dependencies and build:

```js
npm i && npm run build
```

That will output the built distributables to `./lib` and `./dist`.

## Roadmap

1. More lighting types, left are:
 - Spot lights
 - Hemisphere lights
 - Area lights
2. Add dynamic shadows
3. Write tests!
