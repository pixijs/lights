/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.lights
 * @param shaderManager {ShaderManager} The WebGL shader manager this shader works for.
 */
function CompositeShader(shaderManager) {
    PIXI.Shader.call(this,
        shaderManager,
        // vertex shader
        null,
        // fragment shader
        null,
        // custom uniforms
        null,
        // custom attributes
        null
    );
}

CompositeShader.prototype = Object.create(PIXI.Shader.prototype);
CompositeShader.prototype.constructor = CompositeShader;
module.exports = CompositeShader;

PIXI.ShaderManager.registerPlugin('compositeShader', CompositeShader);
