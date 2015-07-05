/**
 * Excuse the mess, haven't cleaned this up yet!
 */



/**
 * @class
 * @extends PIXI.DisplayObject
 * @memberof PIXI.lights
 *
 * @param [color=0xFFFFFF] {number} The color of the light.
 * @param [brightness=1] {number} The brightness of the light, in range [0, 1].
 */
function Light(color, brightness, vertices, indices) {
    if (this.constructor === Light) {
        throw new Error('Light is an abstract base class, it should not be created directly!');
    }
    
    PIXI.DisplayObject.call(this);

    /**
     * An array of vertices
     *
     * @member {Float32Array}
     */
    this.vertices = vertices || new Float32Array(8);

    /**
     * An array containing the indices of the vertices
     *
     * @member {Uint16Array}
     */
    this.indices = indices || new Uint16Array([0,1,2, 0,2,3]);

    /**
     * The blend mode to be applied to the light.
     *
     * @member {number}
     * @default CONST.BLEND_MODES.ADD;
     */
    this.blendMode = PIXI.BLEND_MODES.ADD;

    /**
     * The draw mode to be applied to the light geometry.
     *
     * @member {number}
     * @default CONST.DRAW_MODES.TRIANGLES;
     */
    this.drawMode = PIXI.DRAW_MODES.TRIANGLES;

    /**
     * When set, the renderer will reupload the geometry data.
     * 
     * @member {boolean}
     */
    this.needsUpdate = true;

    /**
     * The height of the light from the viewport.
     *
     * @member {number}
     * @default 0.075
     */
    this.height = 0.075;

    /**
     * The falloff attenuation coeficients.
     *
     * @member {number[]}
     * @default [0.75, 3, 20]
     */
    this.falloff = [0.75, 3, 20];

    /**
     * The name of the shader plugin to use.
     *
     * @member {string}
     */
    this.shaderName = null;

    /**
     * By default the light uses a viewport sized quad as the mesh.
     */
    this.useViewportQuad = true;

    this.visible = false;

    // webgl buffers
    this._vertexBuffer = null;
    this._indexBuffer = null;

    // color and brightness are exposed through setters
    this._color = 0x4d4d59;
    this._colorRgba = [0.3, 0.3, 0.35, 0.8];

    // run the color setter
    if (color || color === 0) {
        this.color = color;
    }
    
    // run the brightness setter
    if (brightness || brightness === 0) {
        this.brightness = brightness;
    }
}

Light.prototype = Object.create(PIXI.DisplayObject.prototype);
Light.prototype.constructor = Light;
module.exports = Light;

Object.defineProperties(Light.prototype, {
    /**
     * The color of the lighting.
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
    },

    /**
     * The brightness of this lighting. Normalized in the range [0, 1].
     *
     * @member {number}
     * @memberof Light#
     */
    brightness: {
        get: function ()
        {
            return this._colorRgba[3];
        },
        set: function (val)
        {
            this._colorRgba[3] = val;
        }
    }
});

Light.prototype.syncShader = function (shader) {
    shader.uniforms.uUseViewportQuad.value = this.useViewportQuad;

    shader.uniforms.uLightColor.value[0] = this._colorRgba[0];
    shader.uniforms.uLightColor.value[1] = this._colorRgba[1];
    shader.uniforms.uLightColor.value[2] = this._colorRgba[2];
    shader.uniforms.uLightColor.value[3] = this._colorRgba[3];

    shader.uniforms.uLightHeight.value = this.height;

    shader.uniforms.uLightFalloff.value[0] = this.falloff[0];
    shader.uniforms.uLightFalloff.value[1] = this.falloff[1];
    shader.uniforms.uLightFalloff.value[2] = this.falloff[2];
};

Light.prototype.renderWebGL = function (renderer)
{
    // add lights to their renderer on the normals pass
    if (!renderer.renderingNormals) {
        return;
    }

    // I actually don't want to interrupt the current batch, so don't set light as the current object renderer.
    // Light renderer works a bit differently in that lights are draw individually on flush (called by WebGLDeferredRenderer).
    //renderer.setObjectRenderer(renderer.plugins.lights);

    renderer.plugins.lights.render(this);
};

Light.prototype.destroy = function ()
{
    PIXI.DisplayObject.prototype.destroy.call(this);

    // TODO: Destroy buffers!
};

Light.DRAW_MODES = {
    
};
