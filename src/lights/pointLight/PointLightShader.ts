import { Program } from '@pixi/core';
import { LightShader } from '../light/LightShader';
import { pointFrag } from './point.frag';

export class PointLightShader extends LightShader
{
    constructor()
    {
        super({
            program: PointLightShader._program,
            uniforms: {
                uLightRadius: 1.0
            }
        });
    }

    static _program = new Program(LightShader.defaultVertexSrc, pointFrag);
}
