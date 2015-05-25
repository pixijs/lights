var Light = require('../light/Light');

/**
 * @class
 * @extends PIXI.lights.Light
 * @memberof PIXI.lights
 *
 * @param [color=0xFFFFFF] {number} The color of the light.
 * @param [brightness=0.5] {number} The brightness of the light.
 */
function AmbientLight(color, brightness) {
    // ambient light is drawn using a full-screen quad
    Light.call(this, color, brightness);

    this.shaderName = 'ambientLightShader';
}

AmbientLight.prototype = Object.create(Light.prototype);
AmbientLight.prototype.constructor = AmbientLight;
module.exports = AmbientLight;

AmbientLight.prototype.renderWebGL = function (renderer)
{
    // add lights to their renderer on the normals pass
    if (!renderer.renderingNormals) {
        return;
    }

    // I actually don't want to interrupt the current batch, so don't set light as the current object renderer.
    // Light renderer works a bit differently in that lights are draw individually on flush (called by WebGLDeferredRenderer).
    //renderer.setObjectRenderer(renderer.plugins.lights);

    renderer.plugins.lights.render(this);
};
