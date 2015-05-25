var Light = require('../light/Light');

/**
 * @class
 * @extends PIXI.lights.Light
 * @memberof PIXI.lights
 *
 * @param [color=0xFFFFFF] {number} The color of the light.
 * @param [brightness=1] {number} The intensity of the light.
 * @param [target] {PIXI.DisplayObject|PIXI.Point} The object in the scene to target.
 */
function DirectionalLight(color, brightness, target) {
    Light.call(this, color, brightness);

    this.target = target;
    this._directionVector = new PIXI.Point();

    this._updateTransform = Light.prototype.updateTransform;
    this._syncShader = Light.prototype.syncShader;

    this.shaderName = 'directionalLightShader';
}

DirectionalLight.prototype = Object.create(Light.prototype);
DirectionalLight.prototype.constructor = DirectionalLight;
module.exports = DirectionalLight;

DirectionalLight.prototype.updateTransform = function () {
    this._updateTransform();

    var vec = this._directionVector,
        wt = this.worldTransform,
        tx = this.target.worldTransform ? this.target.worldTransform.tx : this.target.x,
        ty = this.target.worldTransform ? this.target.worldTransform.ty : this.target.y;

    // calculate direction from this light to the target
    vec.x = wt.tx - tx;
    vec.y = wt.ty - ty;

    // normalize
    var len = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
    vec.x /= len;
    vec.y /= len;
};

DirectionalLight.prototype.syncShader = function (shader) {
    this._syncShader(shader);

    shader.uniforms.uLightDirection.value[0] = this._directionVector.x;
    shader.uniforms.uLightDirection.value[1] = this._directionVector.y;
};
