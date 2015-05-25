var glslify = require('glslify');

/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.lights
 * @param shaderManager {ShaderManager} The WebGL shader manager this shader works for.
 */
function WireframeShader(shaderManager) {
    PIXI.Shader.call(this,
        shaderManager,
        // vertex shader
        [
            'precision lowp float;',

            'attribute vec2 aVertexPosition;',

            'uniform mat3 projectionMatrix;',

            'void main(void) {',
            '    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
            '}'
        ].join('\n'),
        // fragment shader
        [
            'void main() {',
            '    gl_FragColor = vec4(0, 0, 0, 1);',
            '}'
        ].join('\n'),
        // uniforms
        {
            translationMatrix:  { type: 'mat3', value: new Float32Array(9) },
            projectionMatrix:   { type: 'mat3', value: new Float32Array(9) }
        },
        // attributes
        {
            aVertexPosition: 0
        }
    );
}

WireframeShader.prototype = Object.create(PIXI.Shader.prototype);
WireframeShader.prototype.constructor = WireframeShader;
module.exports = WireframeShader;

PIXI.ShaderManager.registerPlugin('wireframeShader', WireframeShader);
