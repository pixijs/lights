import { Light } from '../light/Light';
import { Point, Renderer } from '@pixi/core';
import { DisplayObject } from '@pixi/display';
import { DirectionalLightShader } from './DirectionalLightShader';

/**
 * @class
 * @extends PIXI.lights.Light
 * @memberof PIXI.lights
 *
 * @param [color=0xFFFFFF] {number} The color of the light.
 * @param [brightness=1] {number} The intensity of the light.
 * @param [target] {PIXI.DisplayObject|PIXI.Point} The object in the scene to target.
 */
export class DirectionalLight extends Light
{
    target: DisplayObject | Point;

    constructor(color = 0xFFFFFF, brightness = 1, target: DisplayObject | Point)
    {
        super(color, brightness, new DirectionalLightShader());

        this.target = target;
    }

    syncShader(renderer: Renderer): void
    {
        super.syncShader(renderer);

        const shader = this.material;

        const vec = shader.uniforms.uLightDirection;
        const wt = this.worldTransform;
        const twt = (this.target as any).worldTransform;

        let tx: number;
        let ty: number;

        if (twt)
        {
            tx = twt.tx;
            ty = twt.ty;
        }
        else
        {
            tx = this.target.x;
            ty = this.target.y;
        }

        // calculate direction from this light to the target
        vec.x = wt.tx - tx;
        vec.y = wt.ty - ty;

        // normalize
        const len = Math.sqrt((vec.x * vec.x) + (vec.y * vec.y));

        vec.x /= len;
        vec.y /= len;
    }
}
