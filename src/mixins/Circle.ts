import { Circle } from '@pixi/core';

/**
 * PixiJS namespace.
 * @namespace PIXI
 */

/**
 * PixiJS Lights namespace.
 * @namespace PIXI.lights
 */

/**
 * Circle class from PixiJS.
 * @class PIXI.Circle
 */

/**
 * Creates vertices and indices arrays to describe this circle.
 * @method PIXI.Circle#getMesh
 * @param {PIXI.Circle} shape -
 * @param {number} [totalSegments=40] - Total segments to build for the circle mesh.
 * @param vertices -
 * @param indices -
 *  `((totalSegments + 2) * 2)` or more. If not passed it is created for you.
 *  be `(totalSegments + 3)` or more. If not passed it is created for you.
 * @return {PIXI.lights.CircleMeshData} Object with verticies and indices arrays
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getCircleMesh(shape: Circle, totalSegments = 40, vertices?: Float32Array, indices?: Uint16Array)
{
    vertices = vertices || new Float32Array((totalSegments + 1) * 2);
    indices = indices || new Uint16Array(totalSegments + 1);

    const seg = (Math.PI * 2) / totalSegments;
    let indicesIndex = -1;

    indices[++indicesIndex] = indicesIndex;

    for (let i = 0; i <= totalSegments; ++i)
    {
        const index = i * 2;
        const angle = seg * i;

        vertices[index] = Math.cos(angle) * shape.radius;
        vertices[index + 1] = Math.sin(angle) * shape.radius;

        indices[++indicesIndex] = indicesIndex;
    }

    indices[indicesIndex] = 1;

    return { vertices, indices };
}

/**
 * @memberof PIXI.lights
 * @property {Float32Array} vertices - Vertices data
 * @property {Uint16Array} indices - Indices data
 */
export interface CircleMeshData
{
    vertices: Float32Array;
    indices: Uint16Array;
}
