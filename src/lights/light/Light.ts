import { BLEND_MODES, DRAW_MODES } from '@pixi/constants';
import { Geometry, Renderer } from '@pixi/core';
import { Layer } from '@pixi/layers';
import { Mesh } from '@pixi/mesh';
import { LayerFinder, lightGroup } from '../../main';
import { LightShader } from './LightShader';
import { ViewportQuad } from './ViewportQuad';

/**
 * @class
 * @extends PIXI.DisplayObject
 * @memberof PIXI.lights
 *
 * @param [color=0xFFFFFF] {number} The color of the light.
 * @param [brightness=1] {number} The brightness of the light, in range [0, 1].
 */
export class Light extends Mesh
{
    lightHeight: number;
    shaderName: string;
    readonly useViewportQuad: boolean;

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

        this.drawMode = DRAW_MODES.TRIANGLES;

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
         * By default the light uses a viewport sized quad as the mesh.
         */
        this.useViewportQuad = useViewportQuad;

        // color and brightness are exposed through setters
        this.tint = color;
        this.alpha = brightness;
        this.parentGroup = lightGroup;
    }

    /**
     * The color of the lighting.
     *
     * @member {number}
     * @memberof Light#
     */
    get color(): number
    {
        return this.tint;
    }
    set color(val: number)
    {
        this.tint = val;
    }

    get falloff(): ArrayLike<number>
    {
        return this.material.uniforms.uLightOff;
    }

    set falloff(value: ArrayLike<number>)
    {
        this.material.uniforms.uLightOff[0] = value[0];
        this.material.uniforms.uLightOff[1] = value[1];
        this.material.uniforms.uLightOff[2] = value[2];
    }

    /**
     * The brightness of this lighting. Normalized in the range [0, 1].
     *
     * @member {number}
     * @memberof Light#
     */
    get brightness(): number
    {
        return this.alpha;
    }
    set brightness(val: number)
    {
        this.alpha = val;
    }

    lastLayer: Layer;

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
    }

    _renderDefault(renderer: Renderer): void
    {
        if (this._activeParentLayer)
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

        if (!this.useViewportQuad)
        {
            shader.uniforms.translationMatrix = this.transform.worldTransform.toArray(true);
        }
        else
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
