import { Program } from '@pixi/core';
import { LightShader } from '../light/LightShader';
import { ambientFrag } from './ambient.frag';

/**
 * @class
 * @extends PIXI.lights.LightShader
 * @memberof PIXI.lights
 */
export class AmbientLightShader extends LightShader
{
    constructor()
    {
        super({
            program: AmbientLightShader._program
        });
    }

    static _program = new Program(LightShader.defaultVertexSrc, ambientFrag);
}
