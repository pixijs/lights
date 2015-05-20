var glslify = require('glslify');

/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.lights
 * @param shaderManager {ShaderManager} The WebGL shader manager this shader works for.
 */
function PointLightShader(shaderManager) {
    PIXI.Shader.call(this,
        shaderManager,
        // vertex shader
        glslify(__dirname + '/point.vert'),
        // fragment shader
        glslify(__dirname + '/point.fag'),
        // custom uniforms
        {
            // textures from the previously rendered FBOs
            uSampler:       { type: 'sampler2D', value: null },
            uNormalSampler: { type: 'sampler2D', value: null },

            // size of the renderer viewport
            uViewSize:      { type: '2f', value: [0, 0] },

            // ambient lighting color, alpha channel used for intensity
            uAmbientColor:  { type: '4f', value: [0, 0, 0, 0] },

            // light color, alpha channel used for intensity.
            uLightColor:    { type: '4f', value: [0, 0, 0, 0] },

            // light position normalized with X/Y normalize to view size (position / viewport)
            // z is the height above the viewport
            uLightPosition: { type: '3f', value: [0, 0, 0] },

            // light falloff attenuation coefficients
            uLightFalloff:  { type: '3f', value: [0, 0, 0] }
        },
        // custom attributes
        {
            aVertexPosition: 0,
            aTextureCoord: 0
        }
    );
}

PointLightShader.prototype = Object.create(PIXI.Shader.prototype);
PointLightShader.prototype.constructor = PointLightShader;
module.exports = PointLightShader;

PIXI.ShaderManager.registerPlugin('pointLightShader', PointLightShader);
