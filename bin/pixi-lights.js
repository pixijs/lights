(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = PIXI.light = {
//    LitSprite: require('./light_1/LitSprite'),
//    LightingRenderer: require('./light_1/webgl/LightingRenderer')

    LightRenderer: require('./light_2/LightRenderer'),
    WebGLDeferredRenderer: require('./light_2/WebGLDeferredRenderer')
};

require('./light_2/lightSpriteMixin');

},{"./light_2/LightRenderer":2,"./light_2/WebGLDeferredRenderer":3,"./light_2/lightSpriteMixin":4}],2:[function(require,module,exports){
function LightRenderer(renderer)
{
    PIXI.ObjectRenderer.call(this, renderer);

    /**
     * The number of lights this renderer can draw at a time.
     *
     * @member {number}
     */
    this.size = LightRenderer.MAX_LIGHTS;

    // the total number of indices in our batch, 6 points per quad.
    var numIndices = this.size * 6;

    /**
     * Holds the indices of the geometry (quads) to draw.
     *
     * @member {Uint16Array}
     */
    this.indices = new Uint16Array(numIndices);

    // fill the indices with the quads to draw
    for (var i=0, j=0; i < numIndices; i += 6, j += 4)
    {
        this.indices[i + 0] = j + 0;
        this.indices[i + 1] = j + 1;
        this.indices[i + 2] = j + 2;
        this.indices[i + 3] = j + 0;
        this.indices[i + 4] = j + 2;
        this.indices[i + 5] = j + 3;
    }
}

LightRenderer.MAX_LIGHTS = 500;

LightRenderer.prototype = Object.create(PIXI.ObjectRenderer.prototype);
LightRenderer.prototype.constructor = LightRenderer;
module.exports = LightRenderer;

PIXI.WebGLRenderer.registerPlugin('light', LightRenderer);

/**
 * Sets up the renderer context and necessary buffers.
 *
 * @private
 * @param gl {WebGLRenderingContext} the current WebGL drawing context
 */
LightRenderer.prototype.onContextChange = function ()
{}

/**
 * Renders the light object.
 *
 * @param light {Light} The light to render.
 */
LightRenderer.prototype.render = function (light)
{}

/**
 * Renders the content and empties the current batch.
 *
 */
LightRenderer.prototype.flush = function ()
{}

/**
 * Draws the currently batched lights.
 *
 * @private
 * @param texture {Texture}
 * @param size {number}
 * @param startIndex {number}
 */
LightRenderer.prototype.renderBatch = function (texture, size, startIndex)
{}

/**
 * Destroys the SpriteBatch.
 *
 */
LightRenderer.prototype.destroy = function ()
{}

},{}],3:[function(require,module,exports){
/**
 * The WebGLDeferredRenderer draws the scene and all its content onto a webGL enabled canvas. This renderer
 * should be used for browsers that support webGL. This Render works by automatically managing webGLBatchs.
 * So no need for Sprite Batches or Sprite Clouds.
 * Don't forget to add the view to your DOM or you will not see anything :)
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.SystemRenderer
 * @param [width=0] {number} the width of the canvas view
 * @param [height=0] {number} the height of the canvas view
 * @param [options] {object} The optional renderer parameters
 * @param [options.view] {HTMLCanvasElement} the canvas to use as a view, optional
 * @param [options.transparent=false] {boolean} If the render view is transparent, default false
 * @param [options.autoResize=false] {boolean} If the render view is automatically resized, default false
 * @param [options.antialias=false] {boolean} sets antialias. If not available natively then FXAA antialiasing is used
 * @param [options.forceFXAA=false] {boolean} forces FXAA antialiasing to be used over native. FXAA is faster, but may not always lok as great
 * @param [options.resolution=1] {number} the resolution of the renderer retina would be 2
 * @param [options.clearBeforeRender=true] {boolean} This sets if the CanvasRenderer will clear the canvas or
 *      not before the new render pass.
 * @param [options.preserveDrawingBuffer=false] {boolean} enables drawing buffer preservation, enable this if
 *      you need to call toDataUrl on the webgl context.
 */
function WebGLDeferredRenderer(width, height, options)
{
    PIXI.WebGLRenderer.call(this, width, height, options);
 
    this.viewportRenderTarget = this.renderTarget;

    this.diffuseRenderTarget = null;
    this.normalsRenderTarget = null;
    this.lightsRenderTarget = null;

    this.lights = [];

    this.renderingNormals = false;

    this._doWebGLRender = PIXI.WebGLRenderer.prototype.render;
}

WebGLDeferredRenderer.prototype = Object.create(PIXI.WebGLRenderer.prototype);
WebGLDeferredRenderer.prototype.constructor = WebGLDeferredRenderer;

module.exports = WebGLDeferredRenderer;

/** @lends PIXI.DisplayObject# */
Object.assign(WebGLDeferredRenderer.prototype, {
    /**
     * Initializes the context and necessary framebuffers.
     */
    _initContext: function ()
    {
        PIXI.WebGLRenderer.prototype._initContext.call(this);

        this.diffuseRenderTarget = new PIXI.RenderTarget(this.gl, this.width, this.height, null, this.resolution, false);
        this.normalsRenderTarget = new PIXI.RenderTarget(this.gl, this.width, this.height, null, this.resolution, false);
        this.lightsRenderTarget  = new PIXI.RenderTarget(this.gl, this.width, this.height, null, this.resolution, false);

        // render targets bind when they get created, so we need to reset back to the default one.
        this.renderTarget.activate();
    },

    render: function (object)
    {
        // render diffuse
        this.renderingNormals = false;
        this.renderTarget = this.diffuseRenderTarget;
        this._doWebGLRender(object);

        // render normals
        this.renderingNormals = true;
        this.renderTarget = this.normalsRenderTarget;
        this._doWebGLRender(object);

        // render lights
        this.plugins.light.flush();

        // composite to viewport
//        this._composite();
    },

    _renderLights: function () {
        
    },

    _updateLight: function () {
        
    }
});

},{}],4:[function(require,module,exports){
var tempTexture = null;

 /**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {WebGLRenderer}
 * @private
 */
PIXI.Sprite.prototype._renderWebGL = function (renderer)
{
    if (!this._originalTexture) {
        this._originalTexture = this._texture;
    }

    if (renderer.renderingNormals && this.normalTexture)
    {
        this._texture = this.normalTexture;
    }
    else
    {
        this._texture = this._originalTexture;
    }

    renderer.setObjectRenderer(renderer.plugins.sprite);
    renderer.plugins.sprite.render(this);
};

},{}]},{},[1])


//# sourceMappingURL=pixi-lights.js.map