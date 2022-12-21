import { Light } from '../light/Light';
import { Circle, DRAW_MODES } from '@pixi/core';
import { getCircleMesh } from '../../mixins/Circle';
import { PointLightShader } from './PointLightShader';

/**
 * @memberof PIXI.lights
 */
export class PointLight extends Light
{
    /**
     * @param {number} [color=0xFFFFFF] - The color of the light.
     * @param {number} [brightness=1] - The intensity of the light.
     * @param {number} [radius=Infinity] - The distance the light reaches. You will likely need
     *  to change the falloff of the light as well if you change this value. Infinity will
     *  use the entire viewport as the drawing surface.
     */
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

    /** Radius */
    get radius(): number
    {
        return this.material.uniforms.uLightRadius;
    }

    set radius(value: number)
    {
        this.material.uniforms.uLightRadius = value;
    }
}
