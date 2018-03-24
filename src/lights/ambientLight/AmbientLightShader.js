import {registerPlugin} from '../../main';
import LightShader from '../light/LightShader';
import fragment from './ambient.frag';

/**
 * @class
 * @extends PIXI.lights.LightShader
 * @memberof PIXI.lights
 * @param gl {ShaderManager} The WebGL shader manager this shader works for.
 */
export default class AmbientLightShader extends LightShader {
    constructor(gl) {
        super(gl, null, fragment);
    }
}

registerPlugin('ambientLightShader', AmbientLightShader);
