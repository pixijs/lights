import { Program } from '@pixi/core';
import { Point } from '@pixi/math';
import { LightShader } from '../light/LightShader';
import { PointLightShader } from '../pointLight/PointLightShader';
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
            program: PointLightShader._program,
            uniforms: {
                uLightRadius: 1.0,
                uLightDirection: new Point()
            }
        });
    }

    static _program= new Program(LightShader.defaultVertexSrc, fragment);
}
