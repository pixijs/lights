/**
 * The WebGLDeferredRenderer draws the scene and all its content onto a webGL enabled canvas. This renderer
 * should be used for browsers that support webGL. This Render works by automatically managing webGLBatchs.
 * So no need for Sprite Batches or Sprite Clouds.
 * Don't forget to add the view to your DOM or you will not see anything :)
 *
 * @class
 * @memberof PIXI.lights
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
    options = options || {};

    this._lightAmbientColor = 0x000000;
    this._lightAmbientColorRgba = [0, 0, 0, 0];

    this.ambientColor = options.ambientColor || this._lightAmbientColor;
    this.ambientIntensity = options.ambientIntensity || this._lightAmbientColorRgba[3];

    this.lights = [];

    this.renderingNormals = false;

    this._doWebGLRender = PIXI.WebGLRenderer.prototype.render;

    PIXI.WebGLRenderer.call(this, width, height, options);
}

WebGLDeferredRenderer.prototype = Object.create(PIXI.WebGLRenderer.prototype);
WebGLDeferredRenderer.prototype.constructor = WebGLDeferredRenderer;
module.exports = WebGLDeferredRenderer;

Object.defineProperties(WebGLDeferredRenderer.prototype, {
    /**
     * The color of ambient lighting
     *
     * @member {number}
     * @memberof WebGLDeferredRenderer#
     */
    ambientColor: {
        get: function ()
        {
            return this._lightAmbientColor;
        },
        set: function (val)
        {
            this._lightAmbientColor = val;
            PIXI.utils.hex2rgb(val, this._lightAmbientColorRgba);
        }
    },
    /**
     * The intensity of ambient lighting
     *
     * @member {number}
     * @memberof WebGLDeferredRenderer#
     */
    ambientIntensity: {
        get: function ()
        {
            return this._lightAmbientColorRgba[3];
        },
        set: function (val)
        {
            this._lightAmbientColorRgba[3] = val;
        }
    }
});

/** @lends PIXI.DisplayObject# */
Object.assign(WebGLDeferredRenderer.prototype, {
    /**
     * Initializes the context and necessary framebuffers.
     */
    _initContext: function ()
    {
        // call parent init
        PIXI.WebGLRenderer.prototype._initContext.call(this);

        // first create our render targets.
        this.diffuseTexture = new PIXI.RenderTexture(this, this.width, this.height, null, this.resolution);
        this.normalsTexture = new PIXI.RenderTexture(this, this.width, this.height, null, this.resolution);

//        this.outputRenderTarget = this.renderTarget;

        // render targets bind when they get created, so we need to reset back to the default one.
        this.renderTarget.activate();
    },

    render: function (object)
    {
        // render diffuse
        this.renderingNormals = false;
        this.diffuseTexture.render(object);
//        this.renderTarget = this.diffuseRenderTarget;
//        this._doWebGLRender(object);

        // render normals
        this.renderingNormals = true;
        this.normalsTexture.render(object);
//        this.renderTarget = this.normalsRenderTarget;
//        this._doWebGLRender(object);

        // render lights
        this.setRenderTarget(this.renderTarget);
        this.setObjectRenderer(this.plugins.lights);
        this.plugins.lights.flush();

        // composite to viewport
//        this._composite();
    },

    _renderLights: function () {
        
    },

    _updateLight: function () {
        
    }
});
