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
        glslify(__dirname + '/point2.frag'),
        // custom uniforms
        null,
        // custom attributes
        {
            aLightColor: 1,
            aLightPosition: 2,
            aLightFalloff: 3
        }
    );
}

PointLightShader.prototype = Object.create(LightShader.prototype);
PointLightShader.prototype.constructor = PointLightShader;
module.exports = PointLightShader;

PIXI.ShaderManager.registerPlugin('pointLightShader', PointLightShader);
