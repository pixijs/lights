import { Geometry, Renderer, BLEND_MODES, DRAW_MODES } from '@pixi/core';
import { Layer } from '@pixi/layers';
import { Mesh } from '@pixi/mesh';
import { LayerFinder, lightGroup } from '../../main';
import { LightShader } from './LightShader';
import { ViewportQuad } from './ViewportQuad';

/**
 * Base light class.
 * @extends PIXI.Mesh
 * @memberof PIXI.lights
 */
export class Light extends Mesh
{
    /** Light height */
    lightHeight: number;
    /** Brightness */
    brightness: number;
    /** Shader name */
    shaderName: string;
    /** Use Viewport Quad */
    readonly useViewportQuad: boolean;

    /**
     * @param {number} [color=0xFFFFFF] - The color of the light.
     * @param {number} [brightness=1] - The brightness of the light, in range [0, 1].
     * @param {PIXI.lights.LightShader} [material] -
     * @param {Float32Array} [vertices] -
     * @param {Uint16Array} [indices] -
     */
    constructor(color = 0x4d4d59, brightness = 0.8, material: LightShader,
        vertices? : Float32Array, indices?: Uint16Array)
    {
        let geom: Geometry;
        let useViewportQuad = false;

        if (!vertices)
        {
            geom = ViewportQuad._instance;
            useViewportQuad = true;
        }
        else
        {
            geom = new Geometry().addAttribute('aVertexPosition', vertices).addIndex(indices);
        }

        super(geom, material);

        this.blendMode = BLEND_MODES.ADD;

        this.drawMode = useViewportQuad ? DRAW_MODES.TRIANGLE_STRIP : DRAW_MODES.TRIANGLES;

        /**
         * The height of the light from the viewport.
         *
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
         * By default the light uses a viewport sized quad as the mesh.
         *
         * @member {boolean}
         */
        this.useViewportQuad = useViewportQuad;

        // compatibility with old version and its ols bugs :)
        if (color === null)
        {
            color = 0x4d4d59;
        }

        // color and brightness are exposed through setters
        this.tint = color;
        this.brightness = brightness;
        this.parentGroup = lightGroup;
    }

    /**
     * The color of the lighting.
     */
    get color(): number
    {
        return this.tint;
    }
    set color(val: number)
    {
        this.tint = val;
    }

    /**
     * Falloff
     * @member {number[]}
     */
    get falloff(): ArrayLike<number>
    {
        return this.material.uniforms.uLightFalloff;
    }

    set falloff(value: ArrayLike<number>)
    {
        this.material.uniforms.uLightFalloff[0] = value[0];
        this.material.uniforms.uLightFalloff[1] = value[1];
        this.material.uniforms.uLightFalloff[2] = value[2];
    }

    /**
     * Last layer
     * @type {PIXI.layers.Layer}
     */
    lastLayer: Layer;

    /**
     * Sync Shader
     * @param {PIXI.Renderer} renderer - Renderer
     */
    syncShader(renderer: Renderer): void
    {
        const { uniforms } = this.shader;

        // TODO: actually pass UV's of screen instead of size
        uniforms.uViewSize[0] = renderer.screen.width;
        uniforms.uViewSize[1] = renderer.screen.height;
        uniforms.uViewPixels[0] = renderer.view.width;
        uniforms.uViewPixels[1] = renderer.view.height;
        uniforms.uFlipY = !renderer.framebuffer.current;
        uniforms.uSampler = LayerFinder._instance.diffuseTexture;
        uniforms.uNormalSampler = LayerFinder._instance.normalTexture;
        uniforms.uUseViewportQuad = this.useViewportQuad;
        uniforms.uBrightness = this.brightness;
    }

    _renderDefault(renderer: Renderer): void
    {
        if (!this._activeParentLayer)
        {
            return;
        }
        LayerFinder._instance.check(this._activeParentLayer);

        const shader = this.shader as unknown as LightShader;

        shader.alpha = this.worldAlpha;
        if (shader.update)
        {
            shader.update();
        }

        renderer.batch.flush();

        shader.uniforms.translationMatrix = this.transform.worldTransform.toArray(true);
        if (this.useViewportQuad)
        {
            // TODO: pass the viewport (translated screen) instead
            (this.geometry as ViewportQuad).update(renderer.screen);
        }

        this.syncShader(renderer);

        renderer.shader.bind(shader);

        renderer.state.set(this.state);

        renderer.geometry.bind(this.geometry, shader);

        renderer.geometry.draw(this.drawMode, this.size, this.start, this.geometry.instanceCount);
    }
}
