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
        this.plugins.lights.flush();

        // composite to viewport
//        this._composite();
    },

    _renderLights: function () {
        
    },

    _updateLight: function () {
        
    }
});
