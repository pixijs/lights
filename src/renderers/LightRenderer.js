var main = require('../main');
var glCore = PIXI.glCore;

/**
 *
 * @class
 * @private
 * @memberof PIXI.lights
 * @extends PIXI.ObjectRenderer
 * @param renderer {WebGLRenderer} The renderer this sprite batch works for.
 */
function LightRenderer(renderer) {
    PIXI.ObjectRenderer.call(this, renderer);

    // the total number of indices in our batch, there are 6 points per quad.
    var numIndices = LightRenderer.MAX_LIGHTS * 6;

    /**
     * Holds the indices
     *
     * @member {Uint16Array}
     */
    this.indices = new Uint16Array(numIndices);

    //TODO this could be a single buffer shared amongst all renderers as we reuse this set up in most renderers
    for (var i = 0, j = 0; i < numIndices; i += 6, j += 4) {
        this.indices[i + 0] = j + 0;
        this.indices[i + 1] = j + 1;
        this.indices[i + 2] = j + 2;
        this.indices[i + 3] = j + 0;
        this.indices[i + 4] = j + 2;
        this.indices[i + 5] = j + 3;
    }

    this.shaders = {};

    /**
     * The current lights in the batch.
     *
     * @member {Light[]}
     */
    this.lights = [];
}

LightRenderer.MAX_LIGHTS = 500;

LightRenderer.prototype = Object.create(PIXI.ObjectRenderer.prototype);
LightRenderer.prototype.constructor = LightRenderer;
module.exports = LightRenderer;

PIXI.WebGLRenderer.registerPlugin('lights', LightRenderer);

LightRenderer.prototype.onContextChange = function () {
    this.gl = this.renderer.gl;
    for (var key in main.plugins) {
        this.shaders[key] = new (main.plugins[key])(this.gl);
    }
};

/**
 * Renders the light object.
 *
 * @param light {Light} the light to render
 */
LightRenderer.prototype.render = function (mesh) {
    var renderer = this.renderer;
    var gl = renderer.gl;

    this.lights.push(mesh);
    /**
     * Prepares all the buffers to render this light.
     */
    var glData = mesh._glDatas[renderer.CONTEXT_UID];

    if (!glData) {
        renderer.bindVao(null);

        glData = {
            shader: this.shaders[mesh.shaderName],
            vertexBuffer: glCore.GLBuffer.createVertexBuffer(gl, mesh.vertices, gl.STREAM_DRAW),
            indexBuffer: glCore.GLBuffer.createIndexBuffer(gl, mesh.indices, gl.STATIC_DRAW),
            // build the vao object that will render..
            vao: null,
            dirty: mesh.dirty
        };

        // build the vao object that will render..
        glData.vao = new glCore.VertexArrayObject(gl)
            .addIndex(glData.indexBuffer)
            .addAttribute(glData.vertexBuffer, glData.shader.attributes.aVertexPosition, gl.FLOAT, false, 2 * 4, 0)

        mesh._glDatas[renderer.CONTEXT_UID] = glData;
    }

    renderer.bindVao(glData.vao);

    if (mesh.useViewportQuad) {
        mesh.vertices[2] = mesh.vertices[4] = renderer.screen.width;
        mesh.vertices[5] = mesh.vertices[7] = renderer.screen.height;
    }
    glData.vertexBuffer.upload(mesh.vertices);

    if (glData.dirty !== mesh.dirty) {
        glData.dirty = mesh.dirty;
        glData.indexBuffer.upload(mesh.indices);
    }
};

LightRenderer.prototype.flush = function () {
    var diffuseTexture = null,
        normalTexture = null,
        lastLayer = null,
        lastShader = null,
        renderer = this.renderer;

    for (var i = 0; i < this.lights.length; ++i) {
        var light = this.lights[i],
            layer = this.lights[i]._activeParentLayer;

        if (!layer) {
            continue;
        }

        if (lastLayer !== layer) {
            lastLayer = layer;
            var stage = layer._activeStageParent;

            if (layer.diffuseTexture &&
                layer.normalTexture) {
                diffuseTexture = layer.diffuseTexture;
                normalTexture = layer.normalTexture;
            } else {
                for (var j = 0; j < stage._activeLayers.length; j++) {
                    var texLayer = stage._activeLayers[j];
                    if (texLayer.group === main.normalGroup) {
                        normalTexture = texLayer.getRenderTexture();
                    }
                    if (texLayer.group === main.diffuseGroup) {
                        diffuseTexture = texLayer.getRenderTexture();
                    }
                }
            }

            renderer.bindTexture(diffuseTexture, 0, true);
            renderer.bindTexture(normalTexture, 1, true);
        }

        var glData = light._glDatas[renderer.CONTEXT_UID],
            shader = glData.shader;

        if (lastShader !== shader) {
            lastShader = shader;
            renderer.bindShader(shader);

            shader.uniforms.uSampler = 0;
            shader.uniforms.uNormalSampler = 1;

            var uViewSize = shader.uniforms.uViewSize;
            uViewSize[0] = renderer.screen.width;
            uViewSize[1] = renderer.screen.height;
            shader.uniforms.uViewSize = uViewSize;
        }

        renderer.bindVao(glData.vao);

        light.syncShader(shader);
        renderer.state.setBlendMode(light.blendMode);
        shader.uniforms.translationMatrix = light.worldTransform.toArray(true);

        glData.vao.draw(light.drawMode, light.indices.length, 0);
    }

    this.lights.length = 0;
};

LightRenderer.prototype.stop = function() {
    this.flush();
};
