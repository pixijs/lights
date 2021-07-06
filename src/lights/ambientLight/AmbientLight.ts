import { Light } from '../light/Light';
import { AmbientLightShader } from './AmbientLightShader';

/**
 * Ambient light is drawn using a full-screen quad
 * @class
 * @extends PIXI.lights.Light
 * @memberof PIXI.lights
 *
 * @param [color=0xFFFFFF] {number} The color of the light.
 * @param [brightness=0.5] {number} The brightness of the light.
 */
export class AmbientLight extends Light
{
    constructor(color = 0xFFFFFF, brightness = 0.5)
    {
        super(color, brightness, new AmbientLightShader());
    }
}
