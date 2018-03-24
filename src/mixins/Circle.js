/**
 * Contains mixins for the `PIXI.Circle` class.
 * @class Circle
 * @memberof PIXI
 * @see http://pixijs.download/release/docs/PIXI.Circle.html
 */
/**
 * Creates vertices and indices arrays to describe this circle.
 * @method PIXI.Circle#getMesh
 * @param [totalSegments=40] {number} Total segments to build for the circle mesh.
 * @param [verticesOutput] {Float32Array} An array to output the vertices into. Length must be
 *  `((totalSegments + 2) * 2)` or more. If not passed it is created for you.
 * @param [indicesOutput] {Uint16Array} An array to output the indices into, in gl.TRIANGLE_FAN format. Length must
 *  be `(totalSegments + 3)` or more. If not passed it is created for you.
 * @return {PIXI.Circle~MeshData} Object with verticies and indices arrays
 */
PIXI.Circle.prototype.getMesh = function getMesh(totalSegments = 40, vertices, indices) {
    vertices = vertices || new Float32Array((totalSegments + 1) * 2);
    indices = indices || new Uint16Array(totalSegments + 1);

    let seg = (Math.PI * 2) / totalSegments,
        indicesIndex = -1;

    indices[++indicesIndex] = indicesIndex;

    for (let i = 0; i <= totalSegments; ++i) {
        let index = i*2;
        let angle = seg * i;

        vertices[index] = Math.cos(angle) * this.radius;
        vertices[index+1] = Math.sin(angle) * this.radius;

        indices[++indicesIndex] = indicesIndex;
    }

    indices[indicesIndex] = 1;

    return { vertices, indices };
};

/**
 * @typedef PIXI.Circle~MeshData
 * @property {Float32Array} vertices - Vertices data
 * @property {Uint16Array} indices - Indices data
 */
