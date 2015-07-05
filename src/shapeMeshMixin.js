/**
 * Creates vertices and indices arrays to describe this circle.
 * 
 * @param [totalSegments=40] {number} Total segments to build for the circle mesh.
 * @param [verticesOutput] {Float32Array} An array to output the vertices into. Length must be
 *  `((totalSegments + 2) * 2)` or more. If not passed it is created for you.
 * @param [indicesOutput] {Uint16Array} An array to output the indices into, in gl.TRIANGLE_FAN format. Length must
 *  be `(totalSegments + 3)` or more. If not passed it is created for you.
 */
PIXI.Circle.prototype.getMesh = function (totalSegments, vertices, indices)
{
    totalSegments = totalSegments || 40;

    vertices = vertices || new Float32Array((totalSegments + 1) * 2);
    indices = indices || new Uint16Array(totalSegments + 1);

    var seg = (Math.PI * 2) / totalSegments,
        indicesIndex = -1;

    indices[++indicesIndex] = indicesIndex;

    for (var i = 0; i <= totalSegments; ++i)
    {
        var index = i*2;
        var angle = seg * i;

        vertices[index] = Math.cos(angle) * this.radius;
        vertices[index+1] = Math.sin(angle) * this.radius;

        indices[++indicesIndex] = indicesIndex;
    }

    indices[indicesIndex] = 1;

    return {
        vertices: vertices,
        indices: indices
    };
};
