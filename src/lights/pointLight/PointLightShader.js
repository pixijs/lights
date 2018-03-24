import {registerPlugin} from '../../main';
import LightShader from '../light/LightShader';
import fragment from './point.frag';

/**
 * @class
 * @extends PIXI.lights.LightShader
 * @memberof PIXI.lights
 * @param gl {ShaderManager} The WebGL shader manager this shader works for.
 */
export default class PointLightShader extends LightShader {
    constructor(gl) {
        super(gl, null, fragment, {
            // height of the light above the viewport
            uLightRadius: {
                type: '1f',
                value: 1
            }
        });
    }
}

registerPlugin('pointLightShader', PointLightShader);
