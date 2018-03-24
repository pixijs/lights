import Light from '../light/Light';

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
export default class PointLight extends Light {
    constructor(color=0xFFFFFF, brightness=1, radius=Infinity) {
        if (radius !== Infinity) {
            const shape = new PIXI.Circle(0, 0, radius);
            const {vertices, indices} = shape.getMesh();

            super(color, brightness, vertices, indices);

            this.useViewportQuad = false;
            this.drawMode = PIXI.DRAW_MODES.TRIANGLE_FAN;
        }
        else {
            super(color, brightness);
        }
        this.radius = radius;
        this.shaderName = 'pointLightShader';
    }

    syncShader(shader) {
        super.syncShader(shader);
        shader.uniforms.uLightRadius = this.radius;
    }
}
