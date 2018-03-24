import {lightGroup} from '../../main';

/**
 * @class
 * @extends PIXI.DisplayObject
 * @memberof PIXI.lights
 *
 * @param [color=0xFFFFFF] {number} The color of the light.
 * @param [brightness=1] {number} The brightness of the light, in range [0, 1].
 */
export default class Light extends PIXI.Container {
    constructor(color, brightness, vertices, indices) {
        super();

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
         * @default PIXI.BLEND_MODES.ADD
         * @see http://pixijs.download/release/docs/PIXI.html#.BLEND_MODES
         */
        this.blendMode = PIXI.BLEND_MODES.ADD;

        /**
         * The draw mode to be applied to the light geometry.
         *
         * @member {number}
         * @default PIXI.DRAW_MODES.TRIANGLES
         * @see http://pixijs.download/release/docs/PIXI.html#.DRAW_MODES
         */
        this.drawMode = PIXI.DRAW_MODES.TRIANGLES;

        /**
         * When incremented the renderer will re-upload indices
         *
         * @member {number}
         */
        this.dirty = 0;

        /**
         * The height of the light from the viewport.
         *
         * @member {number}
         * @default 0.075
         */
        this.lightHeight = 0.075;

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

        this.parentGroup = lightGroup;


        /**
         * WebGL data for this light
         * @member {Object}
         * @private
         */
        this._glDatas = {};

        this.shaderName = 'lights';
    }

    /**
     * The color of the lighting.
     *
     * @member {number}
     * @memberof Light#
     */
    get color() {
        return this._color;
    }
    set color(val) {
        this._color = val;
        PIXI.utils.hex2rgb(val, this._colorRgba);
    }

    /**
     * The brightness of this lighting. Normalized in the range [0, 1].
     *
     * @member {number}
     * @memberof Light#
     */
    get brightness() {
        return this._colorRgba[3];
    }
    set brightness(val) {
        this._colorRgba[3] = val;
    }

    syncShader(shader) {
        shader.uniforms.uUseViewportQuad = this.useViewportQuad;

        let uLightColor = shader.uniforms.uLightColor;
        if (uLightColor) {
            uLightColor[0] = this._colorRgba[0];
            uLightColor[1] = this._colorRgba[1];
            uLightColor[2] = this._colorRgba[2];
            uLightColor[3] = this._colorRgba[3];
            shader.uniforms.uLightColor = uLightColor;
        }

        shader.uniforms.uLightHeight = this.lightHeight;

        let uLightFalloff = shader.uniforms.uLightFalloff;
        if (uLightFalloff) {
            uLightFalloff[0] = this.falloff[0];
            uLightFalloff[1] = this.falloff[1];
            uLightFalloff[2] = this.falloff[2];
            shader.uniforms.uLightFalloff = uLightFalloff;
        }
    }

    _renderWebGL(renderer) {
        renderer.setObjectRenderer(renderer.plugins.lights);
        renderer.plugins.lights.render(this);
    }
}
