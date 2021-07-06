import { Program } from '@pixi/core';
import { Point } from '@pixi/math';
import { LightShader } from '../light/LightShader';
import fragment from './directional.frag';

/**
 * @class
 * @extends PIXI.Shader
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

    static _program= new Program(LightShader.defaultVertexSrc, fragment);
}
