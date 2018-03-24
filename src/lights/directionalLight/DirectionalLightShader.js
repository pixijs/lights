import {registerPlugin} from '../../main';
import LightShader from '../light/LightShader';
import fragment from './directional.frag';

/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.lights
 * @param shaderManager {ShaderManager} The WebGL shader manager this shader works for.
 */
export default class DirectionalLightShader extends LightShader {
    constructor(gl) {
        super(gl, null, fragment, {
            // the directional vector of the light
            uLightDirection: {
                type: '2f',
                value: new Float32Array(2)
            }
        });
    }
}

registerPlugin('directionalLightShader', DirectionalLightShader);
