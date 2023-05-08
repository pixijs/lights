import { Light } from '../light/Light';
import { Circle, DRAW_MODES } from '@pixi/core';
import { getCircleMesh } from '../../mixins/Circle';
import { PointLightShader } from './PointLightShader';
import type { IDestroyOptions } from '@pixi/display';

const DEFAULT_SHAPE_SEGMENTS = 40;
/**
 * @memberof PIXI.lights
 */
export class PointLight extends Light
{
    /** circle cache for update */
    public shapeCache?: Circle;
    /** shapeCache verticesCache */
    public verticesCache?: Float32Array;
    /** shapeCache indicesCache */
    public indicesCache?: Uint16Array;

    /** if shapeCache, this allow setup segments (ex: circle)
     * @default 40 - low value for performance
     */
    public _shapeSgments: number;

    /**
     * @param {number} [color=0xFFFFFF] - The color of the light.
     * @param {number} [brightness=1] - The intensity of the light.
     * @param {number} [radius=Infinity] - The distance the light reaches. You will likely need
     *  to change the falloff of the light as well if you change this value. Infinity will
     *  use the entire viewport as the drawing surface.
     */
    constructor(color = 0xFFFFFF, brightness = 1, radius = Infinity)
    {
        if (radius !== Infinity)
        {
            const shape = new Circle(0, 0, radius);
            const { vertices, indices } = getCircleMesh(shape,DEFAULT_SHAPE_SEGMENTS);

            super(color, brightness, new PointLightShader(), vertices, indices);

            this.drawMode = DRAW_MODES.TRIANGLE_FAN;
            this._shapeSgments = DEFAULT_SHAPE_SEGMENTS;
            this.shapeCache = shape;
            this.verticesCache = vertices;
            this.indicesCache = indices;
        }
        else
        {
            super(color, brightness, new PointLightShader());
        }
        this.shaderName = 'pointLightShader';
        this.radius = radius;
    }

    /** Radius */
    get radius(): number
    {
        return this.material.uniforms.uLightRadius;
    }

    set radius(value: number)
    {
        const { shapeCache, _shapeSgments, verticesCache, indicesCache,geometry,material } = this;
        getCircleMesh(shapeCache, _shapeSgments, verticesCache, indicesCache);
        geometry.buffers[0].update(verticesCache);
        geometry.buffers[1].update(indicesCache);
        material.uniforms.uLightRadius = value;
    }

    get shapeSgments(): number
    {
        return this._shapeSgments;
    }

    /** Set shape max segments for mesh, low value for performance */
    set shapeSgments(value: number)
    {
        const { shapeCache, verticesCache, indicesCache } = this;
        getCircleMesh(shapeCache, value, verticesCache, indicesCache);
        this._shapeSgments = value;
        this.geometry.buffers[0].update(verticesCache);
        this.geometry.buffers[1].update(indicesCache);
    }

    override destroy(options?: boolean | IDestroyOptions): void
    {
        super.destroy(options);
        delete this.shapeCache;
        delete this.verticesCache;
        delete this.indicesCache;
    }
}
