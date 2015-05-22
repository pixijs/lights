var LightShader = require('../LightShader');
var glslify = require('glslify');

/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.lights
 * @param shaderManager {ShaderManager} The WebGL shader manager this shader works for.
 */
function DirectionalLightShader(shaderManager) {
    LightShader.call(this,
        shaderManager,
        // vertex shader
        null,
        // fragment shader
        glslify(__dirname + '/directional.frag'),
        // custom uniforms
        {
            // the directional vector of the light
            uLightDirection: { type: '3f', value: new Float32Array(3) }
        }
    );
}

DirectionalLightShader.prototype = Object.create(LightShader.prototype);
DirectionalLightShader.prototype.constructor = DirectionalLightShader;
module.exports = DirectionalLightShader;

PIXI.ShaderManager.registerPlugin('directionalLightShader', DirectionalLightShader);
