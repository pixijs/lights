/**
 * @class
 * @extends PIXI.DisplayObject
 * @memberof PIXI.lights
 *
 * @param [color=0xFFFFFF] {number} The color of the light.
 */
function Light(color) {
    PIXI.DisplayObject.call(this);

    this.color = color !== undefined ? color : 0xFFFFFF;
}

Light.prototype = Object.create(PIXI.DisplayObject.prototype);
Light.prototype.constructor = Light;

/**
 *
 * Renders the object using the WebGL renderer
 *
 * @param renderer {WebGLRenderer}
 * @private
 */
Light.prototype._renderWebGL = function (renderer)
{
    // I actually don't want to interrupt the current batch, so don't set light as the current object renderer.
    // light renderer works a bit differently in that ALL lights are in a single batch no matter what.

    // renderer.setObjectRenderer(renderer.plugins.light);

    renderer.plugins.lights.render(this);
};

/**
 *
 * Renders the object using the WebGL renderer
 *
 * @param renderer {CanvasRenderer}
 * @private
 */
Light.prototype._renderCanvas = function (renderer)
{
    return;
};
