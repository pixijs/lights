/**
 *
 * @class
 * @private
 * @memberof PIXI.lights
 * @extends PIXI.ObjectRenderer
 * @param renderer {WebGLRenderer} The renderer this sprite batch works for.
 */
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

PIXI.WebGLRenderer.registerPlugin('lights', LightRenderer);

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
