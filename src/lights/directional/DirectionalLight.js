/**
 * Don't look at this, it isn't done yet!
 */






var Light = require('../Light');

/**
 * @class
 * @extends PIXI.lights.Light
 * @memberof PIXI.lights
 *
 * @param [color=0xFFFFFF] {number} The color of the light.
 * @param [intensity=1] {number} The intensity of the light.
 */
function DirectionalLight(color, intensity, target) {
    Light.call(this, color);

    this.intensity = intensity !== undefined ? intensity : 1;

    this.shaderName = 'directionalLightShader';
}

DirectionalLight.prototype = Object.create(Light.prototype);
DirectionalLight.prototype.constructor = DirectionalLight;
