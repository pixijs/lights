import {registerPlugin} from '../../main';
import vertex from './wireframe.vert';
import fragment from './wireframe.frag';

/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.lights
 * @param shaderManager {ShaderManager} The WebGL shader manager this shader works for.
 */
export default class WireframeShader extends PIXI.Shader {
    constructor(gl) {
        super(gl, vertex, fragment, {
            aVertexPosition: 0
        });
    }
}

registerPlugin('wireframeShader', WireframeShader);
