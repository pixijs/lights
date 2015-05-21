/**
 * @class
 * @extends PIXI.DisplayObject
 * @memberof PIXI.lights
 *
 * @param [color=0xFFFFFF] {number} The color of the light.
 */
function Light(color) {
    PIXI.DisplayObject.call(this);

    this._color = 0xFFFFFF;
    this._colorRgba = [0, 0, 0, 1];

    this.color = color !== undefined ? color : this._color;

    this.height = 1;
    
    this.falloff = [0.4, 7.0, 40.0];

    // hack around bug in interaction manager. It dies when processing raw DOs
    this.children = [];

    this.shaderName = null;
}

Light.prototype = Object.create(PIXI.DisplayObject.prototype);
Light.prototype.constructor = Light;
module.exports = Light;

Object.defineProperties(Light.prototype, {
    /**
     * The color of lighting
     *
     * @member {number}
     * @memberof Light#
     */
    color: {
        get: function ()
        {
            return this._color;
        },
        set: function (val)
        {
            this._color = val;
            PIXI.utils.hex2rgb(val, this._colorRgba);
        }
    }
});

/**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {WebGLRenderer}
 * @private
 */
Light.prototype.renderWebGL = function (renderer)
{
    // I actually don't want to interrupt the current batch, so don't set light as the current object renderer.
    // light renderer works a bit differently in that ALL lights are in a single batch no matter what.

    // renderer.setObjectRenderer(renderer.plugins.lights);

    if (renderer.renderingNormals) {
        renderer.plugins.lights.render(this);
    }
};
