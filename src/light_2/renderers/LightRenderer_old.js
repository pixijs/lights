/**
 *
 * @class
 * @private
 * @memberof PIXI.lights
 * @extends PIXI.ObjectRenderer
 * @param renderer {WebGLRenderer} The renderer this sprite batch works for.
 */
function LightRenderer(renderer)
{
    PIXI.ObjectRenderer.call(this, renderer);

    /**
     * Number of values sent in the vertex buffer.
     *
     * To support:
     *  attribute vec2 aVertexPosition;
     *  attribute vec4 aLightColor;
     *  attribute vec3 aLightPosition;
     *  attribute vec3 aLightFalloff;
     * We need 12 values.
     *
     * @member {number}
     */
    this.vertSize = 12;

    /**
     * The size of the vertex information in bytes.
     *
     * @member {number}
     */
    this.vertByteSize = this.vertSize * 4;

    /**
     * The number of lights this renderer can draw at a time.
     *
     * @member {number}
     */
    this.size = LightRenderer.MAX_LIGHTS;

    // the total number of bytes in our batch
    var numVerts = (this.size * 4) * this.vertByteSize;

    // the total number of indices in our batch, there are 6 points per quad.
    var numIndices = this.size * 6;

    /**
     * Holds the vertex data that will be sent to the vertex shader.
     *
     * @member {ArrayBuffer}
     */
    this.vertices = new ArrayBuffer(numVerts);

    /**
     * View on the vertices as a Float32Array for positions
     *
     * @member {Float32Array}
     */
    this.positions = new Float32Array(this.vertices);

    /**
     * View on the vertices as a Uint32Array for colors
     *
     * @member {Uint32Array}
     */
    this.colors = new Uint32Array(this.vertices);

    /**
     * Holds the indices of the geometry (quads) to draw.
     *
     * @member {Uint16Array}
     */
    this.indices = new Uint16Array(numIndices);

    // fill the indices with the quads to draw
    for (var i=0, j=0; i < numIndices; i += 6, j += 4)
    {
        this.indices[i + 0] = j + 0;
        this.indices[i + 1] = j + 1;
        this.indices[i + 2] = j + 2;
        this.indices[i + 3] = j + 0;
        this.indices[i + 4] = j + 2;
        this.indices[i + 5] = j + 3;
    }

    /**
     * The current size of the batch, each render() call adds to this number.
     *
     * @member {number}
     */
    this.currentBatchSize = 0;

    /**
     * The current lights in the batch.
     *
     * @member {Light[]}
     */
    this.lights = [];

    /**
     * The vertex GL buffer that will be uploaded to the GPU.
     * 
     * @member {glBuffer}
     */
    this.vertexBuffer = null;

    /**
     * The index GL buffer that will be uploaded to the GPU.
     * 
     * @member {glBuffer}
     */
    this.vertexBuffer = null;
}

LightRenderer.MAX_LIGHTS = 500;

LightRenderer.prototype = Object.create(PIXI.ObjectRenderer.prototype);
LightRenderer.prototype.constructor = LightRenderer;
module.exports = LightRenderer;

PIXI.WebGLRenderer.registerPlugin('lights', LightRenderer);

/**
 * Sets up the renderer context and necessary buffers.
 *
 * @private
 * @param gl {WebGLRenderingContext} the current WebGL drawing context
 */
LightRenderer.prototype.onContextChange = function ()
{
    var gl = this.renderer.gl;

    // create a couple of buffers
    this.vertexBuffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();

    // upload the index data
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
};

/**
 * Renders the light object.
 *
 * @param light {Light} The light to render.
 */
LightRenderer.prototype.render = function (light)
{
    if (this.currentBatchSize >= this.size)
    {
        this.flush();
    }

    var index = this.currentBatchSize * this.vertByteSize;

    var worldTransform = light.worldTransform;

    var a = worldTransform.a;
    var b = worldTransform.b;
    var c = worldTransform.c;
    var d = worldTransform.d;
    var tx = worldTransform.tx;
    var ty = worldTransform.ty;

    var positions = this.positions;
    var colors = this.colors;

    if (this.renderer.roundPixels)
    {
        // xy
        positions[index+0] = positions[index+12] = positions[index+24] = positions[index+36] = a + c + tx | 0;
        positions[index+1] = positions[index+13] = positions[index+25] = positions[index+37] = d + b + ty | 0;
    }
    else
    {
        // xy
        positions[index+0] = positions[index+12] = positions[index+24] = positions[index+36] = a + c + tx;
        positions[index+1] = positions[index+13] = positions[index+25] = positions[index+37] = d + b + ty;
    }

    colors[index+2] = colors[index+14] = colors[index+26] = colors[index+38] = light._colorRgba[0];
    colors[index+3] = colors[index+15] = colors[index+27] = colors[index+39] = light._colorRgba[1];
    colors[index+4] = colors[index+16] = colors[index+28] = colors[index+40] = light._colorRgba[2];
    colors[index+5] = colors[index+17] = colors[index+29] = colors[index+41] = light._colorRgba[3];

    positions[index+6] = positions[index+18] = positions[index+30] = positions[index+42] = positions[index];
    positions[index+7] = positions[index+19] = positions[index+31] = positions[index+43] = positions[index+1];
    positions[index+8] = positions[index+20] = positions[index+32] = positions[index+44] = this.renderer.roundPixels ? (light.height | 0) : light.height;

    positions[index+9 ] = positions[index+21] = positions[index+33] = positions[index+45] = light.falloff[0];
    positions[index+10] = positions[index+22] = positions[index+34] = positions[index+46] = light.falloff[1];
    positions[index+11] = positions[index+23] = positions[index+35] = positions[index+47] = light.falloff[2];

    this.lights[this.currentBatchSize++] = light;
};

/**
 * Renders the content and empties the current batch.
 *
 */
LightRenderer.prototype.flush = function ()
{
    // If the batch is length 0 then return as there is nothing to draw
    if (this.currentBatchSize === 0)
    {
        return;
    }

    var gl = this.renderer.gl;
    var shader;

    // upload the verts to the buffer
//    if (this.currentBatchSize > (this.size * 0.5))
//    {
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
//    }
//    else
//    {
//        var view = this.positions.subarray(0, this.currentBatchSize * this.vertByteSize);
//        gl.bufferSubData(gl.ARRAY_BUFFER, 0, view);
//    }

    var nextShader;
    var batchSize = 0;
    var start = 0;

    var currentShader = null;

    var light;

    for (var i = 0, j = this.currentBatchSize; i < j; ++i)
    {
        light = this.lights[i];

        nextShader = light.shader || this.renderer.shaderManager.plugins[light.shaderName];

        if (currentShader !== nextShader)
        {
            this.renderBatch(batchSize, start);

            start = i;
            batchSize = 0;

            currentShader = nextShader;

            shader = currentShader.shaders ? currentShader.shaders[gl.id] : currentShader;

            this.renderer.shaderManager.setShader(shader);

            // set some uniform values
            shader.uniforms.projectionMatrix.value = this.renderer.currentRenderTarget.projectionMatrix.toArray(true);
            
            shader.uniforms.uSampler.value = this.renderer.diffuseTexture;
            shader.uniforms.uNormalSampler.value = this.renderer.normalTexture;

            shader.uniforms.uViewSize.value[0] = this.renderer.width;
            shader.uniforms.uViewSize.value[1] = this.renderer.height;

            shader.syncUniforms();

            gl.activeTexture(gl.TEXTURE0);
        }

        batchSize++;
    }

    this.renderBatch(batchSize, start);

    this.currentBatchSize = 0;
};

/**
 * Draws the currently batched lights.
 *
 * @private
 * @param texture {Texture}
 * @param size {number}
 * @param startIndex {number}
 */
LightRenderer.prototype.renderBatch = function (size, startIndex)
{
    if (size === 0)
    {
        return;
    }

    var gl = this.renderer.gl;

    gl.drawElements(gl.TRIANGLES, size * 6, gl.UNSIGNED_SHORT, startIndex * 6 * 2);

    // increment the draw count
    this.renderer.drawCount++;
};

LightRenderer.prototype.start = function () {
    var gl = this.renderer.gl;

    // bind the buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    // set the vertex attributes
    var shader = this.renderer.shaderManager.plugins.pointLightShader,
        stride = this.vertByteSize;

    gl.vertexAttribPointer(shader.attributes.aVertexPosition, 2, gl.FLOAT, false, stride, 0);
    gl.vertexAttribPointer(shader.attributes.aLightColor, 4, gl.UNSIGNED_BYTE, true, stride, 2 * 4);
    gl.vertexAttribPointer(shader.attributes.aLightPosition, 3, gl.FLOAT, false, stride, 6 * 4);
    gl.vertexAttribPointer(shader.attributes.aLightFalloff, 3, gl.FLOAT, false, stride, 9 * 4);
};

/**
 * Destroys the SpriteBatch.
 *
 */
LightRenderer.prototype.destroy = function ()
{
    this.renderer.gl.deleteBuffer(this.vertexBuffer);
    this.renderer.gl.deleteBuffer(this.indexBuffer);

    this.renderer = null;

    this.vertices = null;
    this.positions = null;
    this.indices = null;

    this.vertexBuffer = null;
    this.indexBuffer = null;

    this.lights = null;
};
