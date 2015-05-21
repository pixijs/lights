var LightShader = require('../LightShader');
var glslify = require('glslify');

/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.lights
 * @param shaderManager {ShaderManager} The WebGL shader manager this shader works for.
 */
function PointLightShader(shaderManager) {
    LightShader.call(this,
        shaderManager,
        // vertex shader
        glslify(__dirname + '/point.vert'),
        // fragment shader
        glslify(__dirname + '/point.frag'),
        // custom uniforms
        null,
        // custom attributes
        {
            aLightColor: 0,
            aLightPosition: 0,
            aLightFalloff: 0
        }
    );
}

PointLightShader.prototype = Object.create(LightShader.prototype);
PointLightShader.prototype.constructor = PointLightShader;
module.exports = PointLightShader;

PIXI.ShaderManager.registerPlugin('pointLightShader', PointLightShader);
