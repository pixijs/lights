var LightShader = require('../light/LightShader');
var glslify = require('glslify');

/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.lights
 * @param shaderManager {ShaderManager} The WebGL shader manager this shader works for.
 */
function AmbientLightShader(shaderManager) {
    LightShader.call(this,
        shaderManager,
        // vertex shader
        null,
        // fragment shader
        glslify(__dirname + '/ambient.frag')
    );
}

AmbientLightShader.prototype = Object.create(LightShader.prototype);
AmbientLightShader.prototype.constructor = AmbientLightShader;
module.exports = AmbientLightShader;

PIXI.ShaderManager.registerPlugin('ambientLightShader', AmbientLightShader);
