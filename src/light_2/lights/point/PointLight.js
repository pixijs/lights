var Light = require('../Light'),
    PointLightShader = require('./PointLightShader');

/**
 * @class
 * @extends PIXI.lights.Light
 * @memberof PIXI.lights
 *
 * @param [color=0xFFFFFF] {number} The color of the light.
 * @param [intensity=1] {number} The intensity of the light.
 * @param [distance=0] {number} The distance the light reaches.
 * @param [decay=1] {number} The decay factor of the light. Physically correct lights should be 2.
 */
function PointLight(color, intensity, distance, decay) {
    Light.call(this, color);

    this.intensity = intensity !== undefined ? intensity : 1;
    this.distance = distance !== undefined ? distance : 0;
    this.decay = decay !== undefined ? decay : 1;	// for physically correct lights, should be 2.

    this.shader = 'pointLightShader';
}

PointLight.prototype = Object.create(Light.prototype);
PointLight.prototype.constructor = PointLight;
