/**
 * @class
 * @extends PIXI.DisplayObject
 * @memberof PIXI.lights
 *
 * @param [color=0xFFFFFF] {number} The color of the light.
 */
function Light(color, vertices, indices) {
    if (this.constructor === Light) {
        throw new Error('Light is an abstract base and should not be created directly!');
    }

    PIXI.DisplayObject.call(this);

    /**
     * An array of vertices
     *
     * @member {Float32Array}
     */
    this.vertices = vertices || new Float32Array([0,   0,
                                                  1024, 0,
                                                  1024, 512,
                                                  0,   512]);

    /**
     * An array containing the indices of the vertices
     *
     * @member {Uint16Array}
     */
    this.indices = new Uint16Array([0,1,2, 0,2,3]);

    /**
     * The blend mode to be applied to the light.
     *
     * @member {number}
     * @default CONST.BLEND_MODES.ADD;
     */
    this.blendMode = PIXI.BLEND_MODES.ADD;

    this._vertexBuffer = null;
    this._indexBuffer = null;

    this.needsUpdate = true;

    // light stuff...

    this._color = 0xFFFFFF;
    this._colorRgba = [1, 1, 1, 1];

    if (color || color === 0) {
        this.color = color;
    }

    this.height = 0.075;

    this.falloff = [0.4, 7.0, 40.0];

    // hack around bug in interaction manager. It dies when processing raw DOs
//    this.children = [];

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
//Light.prototype.renderWebGL = function (renderer)
//{
//    // I actually don't want to interrupt the current batch, so don't set light as the current object renderer.
//    // light renderer works a bit differently in that ALL lights are in a single batch no matter what.
//
//    // renderer.setObjectRenderer(renderer.plugins.lights);
//
////    if (renderer.renderingNormals) {
////        renderer.plugins.lights.render(this);
//        renderer.lights.push(this);
////    }
//};

Light.prototype.renderWebGL = function (renderer)
{
    // add lights to their renderer on the normals pass
    if (!renderer.renderingNormals) {
        return;
    }

//    renderer.setObjectRenderer(renderer.plugins.lights);
    renderer.plugins.lights.render(this);
};

Light.prototype.destroy = function ()
{
    PIXI.DisplayObject.prototype.destroy.call(this);

    // TODO: Destroy buffers!
}
