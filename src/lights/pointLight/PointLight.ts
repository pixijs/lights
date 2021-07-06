import { Light } from '../light/Light';
import { DRAW_MODES } from '@pixi/constants';
import { Circle } from '@pixi/math';
import { getCircleMesh } from '../../mixins/Circle';
import { PointLightShader } from './PointLightShader';

/**
 * @class
 * @extends PIXI.lights.Light
 * @memberof PIXI.lights
 *
 * @param [color=0xFFFFFF] {number} The color of the light.
 * @param [brightness=1] {number} The intensity of the light.
 * @param [radius=Infinity] {number} The distance the light reaches. You will likely need
 *  to change the falloff of the light as well if you change this value. Infinity will
 *  use the entire viewport as the drawing surface.
 */
export class PointLight extends Light
{
    constructor(color = 0xFFFFFF, brightness = 1, radius = Infinity)
    {
        if (radius !== Infinity)
        {
            const shape = new Circle(0, 0, radius);
            const { vertices, indices } = getCircleMesh(shape);

            super(color, brightness, new PointLightShader(), vertices, indices);

            this.drawMode = DRAW_MODES.TRIANGLE_FAN;
        }
        else
        {
            super(color, brightness, new PointLightShader());
        }
        this.shaderName = 'pointLightShader';
        this.radius = radius;
    }

    get radius(): number
    {
        return this.material.uniforms.uLightRadius;
    }

    set radius(value: number)
    {
        this.material.uniforms.uLightRadius = value;
    }
}
