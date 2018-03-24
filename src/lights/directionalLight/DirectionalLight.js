import Light from '../light/Light';

/**
 * @class
 * @extends PIXI.lights.Light
 * @memberof PIXI.lights
 *
 * @param [color=0xFFFFFF] {number} The color of the light.
 * @param [brightness=1] {number} The intensity of the light.
 * @param [target] {PIXI.DisplayObject|PIXI.Point} The object in the scene to target.
 */
export default class DirectionalLight extends Light {
    constructor(color=0xFFFFFF, brightness=1, target) {
        super(color, brightness);

        this.target = target;
        this._directionVector = new PIXI.Point();
        this.shaderName = 'directionalLightShader';
    }

    updateTransform() {
        this.containerUpdateTransform();

        let vec = this._directionVector,
            wt = this.worldTransform,
            tx = this.target.worldTransform ? this.target.worldTransform.tx : this.target.x,
            ty = this.target.worldTransform ? this.target.worldTransform.ty : this.target.y;

        // calculate direction from this light to the target
        vec.x = wt.tx - tx;
        vec.y = wt.ty - ty;

        // normalize
        const len = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
        vec.x /= len;
        vec.y /= len;
    }

    syncShader(shader) {
        super.syncShader(shader);

        const uLightDirection = shader.uniforms.uLightDirection;
        uLightDirection[0] = this._directionVector.x;
        uLightDirection[1] = this._directionVector.y;
        shader.uniforms.uLightDirection = uLightDirection;
    }
}
