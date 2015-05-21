/**
 * Don't look at this, it isn't done yet!
 */






var glslify = require('glslify');

/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.lights
 * @param shaderManager {ShaderManager} The WebGL shader manager this shader works for.
 */
function DirectionalLightShader(shaderManager) {
    PIXI.Shader.call(this,
        shaderManager,
        // vertex shader
        glslify(__dirname + '/directional.vert'),
        // fragment shader
        glslify(__dirname + '/directional.frag'),
        // custom uniforms
        {
            // textures from the previously rendered FBOs
            uSampler:       { type: 'sampler2D', value: shaderManager.renderer.normalsRenderTarget },
            uNormalSampler: { type: 'sampler2D', value: shaderManager.renderer.diffuseRenderTarget },

            // size of the renderer viewport
            uViewSize:      { type: '2f', value: [0, 0] },

            // ambient lighting color, alpha channel used for intensity
            uAmbientColor:  { type: '4f', value: [0, 0, 0, 0] },

            // light color, alpha channel used for intensity.
            uLightColor:    { type: '4f', value: [0, 0, 0, 0] },

            // light direction, z is the height above the viewport
            uLightDirection:{ type: '3f', value: [0, 0, 0] },

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

DirectionalLightShader.prototype = Object.create(PIXI.Shader.prototype);
DirectionalLightShader.prototype.constructor = DirectionalLightShader;
module.exports = DirectionalLightShader;

PIXI.ShaderManager.registerPlugin('directionalLightShader', DirectionalLightShader);
