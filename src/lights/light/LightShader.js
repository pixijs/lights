import vertex from './light.vert';

/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.lights
 * @param shaderManager {ShaderManager} The WebGL shader manager this shader works for.
 */
export default class LightShader extends PIXI.Shader {
    constructor(gl, vertexSrc, fragmentSrc, customUniforms, customAttributes) {
        const uniforms = {
            translationMatrix:  { type: 'mat3', value: new Float32Array(9) },
            projectionMatrix:   { type: 'mat3', value: new Float32Array(9) },

            // textures from the previously rendered FBOs
            uSampler:       { type: 'sampler2D', value: null },
            uNormalSampler: { type: 'sampler2D', value: null },

            // should we apply the translation matrix or not.
            uUseViewportQuad: { type: 'bool', value: true },

            // size of the renderer viewport
            uViewSize:      { type: '2f', value: new Float32Array(2) },

            // light color, alpha channel used for intensity.
            uLightColor:    { type: '4f', value: new Float32Array([1, 1, 1, 1]) },

            // light falloff attenuation coefficients
            uLightFalloff:  { type: '3f', value: new Float32Array([0, 0, 0]) },

            // height of the light above the viewport
            uLightHeight: { type: '1f', value: 0.075 }
        };

        if (customUniforms) {
            for (const u in customUniforms) {
                uniforms[u] = customUniforms[u];
            }
        }

        const attributes = {
            aVertexPosition: 0
        };

        if (customAttributes) {
            for (const a in customAttributes) {
                attributes[a] = customAttributes[a];
            }
        }

        super(gl, vertexSrc || LightShader.defaultVertexSrc, fragmentSrc, attributes);
    }
}

/**
 * @static
 * @member {string}
 */
LightShader.defaultVertexSrc = vertex;
