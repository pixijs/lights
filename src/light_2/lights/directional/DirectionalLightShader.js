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
        glslify(__dirname + '/directional.fag'),
        // custom uniforms
        {
            samplerNormalDepth: { type: "sampler2D", value: null },
            samplerColor: 		{ type: "sampler2D", value: null },
            matProjInverse:     { type: "m4", value: new Float32Array([ 1, 0, 0, 0,
                                                                        0, 1, 0, 0,
                                                                        0, 0, 1, 0,
                                                                        0, 0, 0, 1 ]) },
            viewWidth:          { type: "1f", value: 800 },
            viewHeight:         { type: "1f", value: 600 },

            lightDirection:     { type: "v2", value: new PIXI.Point(0, 1) },
            lightColor:         { type: "c", value: [0, 0, 0] },
            lightIntensity:     { type: "1f", value: 1.0 }
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
