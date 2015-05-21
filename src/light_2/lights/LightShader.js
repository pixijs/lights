var glslify = require('glslify');

/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.lights
 * @param shaderManager {ShaderManager} The WebGL shader manager this shader works for.
 */
function LightShader(shaderManager, vertexSrc, fragmentSrc, customUniforms, customAttributes) {
    var uniforms = {
        projectionMatrix:   { type: 'mat3', value: new Float32Array([1, 0, 0,
                                                                     0, 1, 0,
                                                                     0, 0, 1]) },
        // textures from the previously rendered FBOs
        uSampler:       { type: 'sampler2D', value: shaderManager.renderer.normalsRenderTarget },
        uNormalSampler: { type: 'sampler2D', value: shaderManager.renderer.diffuseRenderTarget },

        // size of the renderer viewport
        uViewSize:      { type: '2f', value: [0, 0] },

        // ambient lighting color, alpha channel used for intensity
        uAmbientColor:  { type: '4f', value: shaderManager.renderer._lightAmbientColorRgba }
    };

    if (customUniforms)
    {
        for (var u in customUniforms)
        {
            uniforms[u] = customUniforms[u];
        }
    }

    var attributes = {
        aVertexPosition: 0
    };

    if (customAttributes)
    {
        for (var a in customAttributes)
        {
            attributes[a] = customAttributes[a];
        }
    }

    PIXI.Shader.call(this, shaderManager, vertexSrc, fragmentSrc, uniforms, attributes);
}

LightShader.prototype = Object.create(PIXI.Shader.prototype);
LightShader.prototype.constructor = LightShader;
module.exports = LightShader;
