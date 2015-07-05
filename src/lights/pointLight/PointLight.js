var Light = require('../light/Light');

/**
 * @class
 * @extends PIXI.lights.Light
 * @memberof PIXI.lights
 *
 * @param [color=0xFFFFFF] {number} The color of the light.
 * @param [brightness=1] {number} The intensity of the light.
 * @param [radius=Infinity] {number} The distance the light reaches. You will likely need
 *  to change the falloff of the light as well if you change this value. Infinity will
 *  use the entire viewport as the drawing surface.
 */
function PointLight(color, brightness, radius) {
    radius = radius || Infinity;

    if (radius !== Infinity) {
        var shape = new PIXI.Circle(0, 0, radius),
            mesh = shape.getMesh();

        Light.call(this, color, brightness, mesh.vertices, mesh.indices);

        this.useViewportQuad = false;
        this.drawMode = PIXI.DRAW_MODES.TRIANGLE_FAN;
    }
    else {
        Light.call(this, color, brightness);
    }

    this._syncShader = Light.prototype.syncShader;

    this.radius = radius;
    this.shaderName = 'pointLightShader';
}

PointLight.prototype = Object.create(Light.prototype);
PointLight.prototype.constructor = PointLight;
module.exports = PointLight;

PointLight.prototype.syncShader = function (shader) {
    this._syncShader(shader);

    shader.uniforms.uLightRadius.value = this.radius;
}
