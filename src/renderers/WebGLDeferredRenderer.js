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

    this.renderingNormals = false;
    this.renderingUnlit = false;
    this._forwardRender = PIXI.WebGLRenderer.prototype.render;

    PIXI.WebGLRenderer.call(this, width, height, options);
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
        // call parent init
        PIXI.WebGLRenderer.prototype._initContext.call(this);

        // first create our render targets.
        this.diffuseTexture = new PIXI.RenderTexture(this, this.width, this.height, null, this.resolution);
        this.normalsTexture = new PIXI.RenderTexture(this, this.width, this.height, null, this.resolution);
    },

    // TODO Optimizations:
    // Only call `updateTransform` once, right now it is call each render pass.
    // Optimize render texture rendering to reduce duplication, or use render targets directly.
    // Cache tree transversal, cache elements to use for each render pass?

    render: function (object)
    {
        // no point rendering if our context has been blown up!
        if (this.gl.isContextLost())
        {
            return;
        }

        this.drawCount = 0;

        this._lastObjectRendered = object;

        /////////////
        //  Rendering
        this.renderingUnlit = false;

        // render diffuse
        this.renderingNormals = false;
        this.diffuseTexture.render(object);

        // render normals
        this.renderingNormals = true;
        this.normalsTexture.render(object);

        // render lights
        this.setRenderTarget(this.renderTarget);
        this.setObjectRenderer(this.plugins.lights);
        this.plugins.lights.flush();

        // forward render unlit objects (no normal texture)
        var cbr = this.clearBeforeRender,
            draws = this.drawCount;

        this.renderingNormals = false;
        this.renderingUnlit = true;
        this.clearBeforeRender = false;

        this._forwardRender(object);
        this.clearBeforeRender = cbr;
        this.drawCount += draws;
        /////////////
    }
});
