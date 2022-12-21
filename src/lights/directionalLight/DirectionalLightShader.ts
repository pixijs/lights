import { Program, Point } from '@pixi/core';
import { LightShader } from '../light/LightShader';
import { directionalFrag } from './directional.frag';

/**
 * @memberof PIXI.lights
 */
export class DirectionalLightShader extends LightShader
{
    constructor()
    {
        super({
            program: DirectionalLightShader._program,
            uniforms: {
                uLightRadius: 1.0,
                uLightDirection: new Point()
            }
        });
    }

    static _program = new Program(LightShader.defaultVertexSrc, directionalFrag);
}
