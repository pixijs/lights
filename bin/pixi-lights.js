(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = PIXI.lights = {
//    LitSprite: require('./light_1/LitSprite'),
//    LightingRenderer: require('./light_1/webgl/LightingRenderer')

    Light:                  require('./light_2/lights/Light'),
    LightShader:            require('./light_2/lights/LightShader'),

    PointLight:             require('./light_2/lights/point/PointLight'),
    PointLightShader:       require('./light_2/lights/point/PointLightShader'),

    LightRenderer:          require('./light_2/renderers/LightRenderer'),
    WebGLDeferredRenderer:  require('./light_2/renderers/WebGLDeferredRenderer')
};

require('./light_2/lightSpriteMixin');

},{"./light_2/lightSpriteMixin":2,"./light_2/lights/Light":3,"./light_2/lights/LightShader":4,"./light_2/lights/point/PointLight":5,"./light_2/lights/point/PointLightShader":6,"./light_2/renderers/LightRenderer":7,"./light_2/renderers/WebGLDeferredRenderer":8}],2:[function(require,module,exports){
var tempTexture = null;

 /**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {WebGLRenderer}
 * @private
 */
PIXI.Sprite.prototype._renderWebGL = function (renderer)
{
    if (!this._originalTexture) {
        this._originalTexture = this._texture;
    }

    if (renderer.renderingNormals && this.normalTexture)
    {
        this._texture = this.normalTexture;
    }
    else
    {
        this._texture = this._originalTexture;
    }

    renderer.setObjectRenderer(renderer.plugins.sprite);
    renderer.plugins.sprite.render(this);
};

},{}],3:[function(require,module,exports){
/**
 * @class
 * @extends PIXI.DisplayObject
 * @memberof PIXI.lights
 *
 * @param [color=0xFFFFFF] {number} The color of the light.
 */
function Light(color) {
    PIXI.DisplayObject.call(this);

    this._color = 0xFFFFFF;
    this._colorRgba = [0, 0, 0, 1];

    this.color = color !== undefined ? color : this._color;

    this.height = 1;
    
    this.falloff = [0.4, 7.0, 40.0];

    // hack around bug in interaction manager. It dies when processing raw DOs
    this.children = [];

    this.shaderName = null;
}

Light.prototype = Object.create(PIXI.DisplayObject.prototype);
Light.prototype.constructor = Light;
module.exports = Light;

Object.defineProperties(Light.prototype, {
    /**
     * The color of lighting
     *
     * @member {number}
     * @memberof Light#
     */
    color: {
        get: function ()
        {
            return this._color;
        },
        set: function (val)
        {
            this._color = val;
            PIXI.utils.hex2rgb(val, this._colorRgba);
        }
    }
});

/**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {WebGLRenderer}
 * @private
 */
Light.prototype.renderWebGL = function (renderer)
{
    // I actually don't want to interrupt the current batch, so don't set light as the current object renderer.
    // light renderer works a bit differently in that ALL lights are in a single batch no matter what.

    // renderer.setObjectRenderer(renderer.plugins.light);

    renderer.plugins.lights.render(this);
};

},{}],4:[function(require,module,exports){


/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.lights
 * @param shaderManager {ShaderManager} The WebGL shader manager this shader works for.
 */
function LightShader(shaderManager, vertexSrc, fragmentSrc, customUniforms, customAttributes) {
    var uniforms = {
        projectionMatrix:   { type: 'mat3', value: new Float32Array([1, 0, 0,
                                                                     0, 1, 0,
                                                                     0, 0, 1]) },
        // textures from the previously rendered FBOs
        uSampler:       { type: 'sampler2D', value: shaderManager.renderer.normalsRenderTarget },
        uNormalSampler: { type: 'sampler2D', value: shaderManager.renderer.diffuseRenderTarget },

        // size of the renderer viewport
        uViewSize:      { type: '2f', value: [0, 0] },

        // ambient lighting color, alpha channel used for intensity
        uAmbientColor:  { type: '4f', value: shaderManager.renderer._lightAmbientColorRgba }
    };

    if (customUniforms)
    {
        for (var u in customUniforms)
        {
            uniforms[u] = customUniforms[u];
        }
    }

    var attributes = {
        aVertexPosition: 0
    };

    if (customAttributes)
    {
        for (var a in customAttributes)
        {
            attributes[a] = customAttributes[a];
        }
    }

    PIXI.Shader.call(this, shaderManager, vertexSrc, fragmentSrc, uniforms, attributes);
}

LightShader.prototype = Object.create(PIXI.Shader.prototype);
LightShader.prototype.constructor = LightShader;
module.exports = LightShader;

},{}],5:[function(require,module,exports){
var Light = require('../Light');

/**
 * @class
 * @extends PIXI.lights.Light
 * @memberof PIXI.lights
 *
 * @param [color=0xFFFFFF] {number} The color of the light.
 * @param [intensity=1] {number} The intensity of the light.
 * @param [distance=0] {number} The distance the light reaches.
 * @param [decay=1] {number} The decay factor of the light. Physically correct lights should be 2.
 */
function PointLight(color, intensity, distance, decay) {
    Light.call(this, color);

    this.shaderName = 'pointLightShader';
}

PointLight.prototype = Object.create(Light.prototype);
PointLight.prototype.constructor = PointLight;
module.exports = PointLight;

},{"../Light":3}],6:[function(require,module,exports){
var LightShader = require('../LightShader');


/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.lights
 * @param shaderManager {ShaderManager} The WebGL shader manager this shader works for.
 */
function PointLightShader(shaderManager) {
    LightShader.call(this,
        shaderManager,
        // vertex shader
        "#define GLSLIFY 1\n\nprecision lowp float;\r\n\r\nattribute vec2 aVertexPosition;\r\nattribute vec4 aLightColor;\r\nattribute vec3 aLightPosition;\r\nattribute vec3 aLightFalloff;\r\n\r\nuniform mat3 projectionMatrix;\r\n\r\nvarying vec4 vLightColor;\r\nvarying vec3 vLightPosition;\r\nvarying vec3 vLightFalloff;\r\n\r\nvoid main(void) {\r\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\r\n\r\n    vLightColor = aLightColor;\r\n    vLightPosition = aLightPosition;\r\n    vLightFalloff = aLightFalloff;\r\n}\r\n",
        // fragment shader
        "#define GLSLIFY 1\n\nprecision lowp float;\r\n\r\n// imports the common uniforms like samplers, and ambient color\r\nuniform sampler2D uSampler;\r\nuniform sampler2D uNormalSampler;\r\n\r\nuniform vec2 uViewSize;\r\n\r\nuniform vec4 uAmbientColor; // ambient color, alpha channel used for intensity.\r\n\n\r\nvarying vec4 vLightColor;   // light color, alpha channel used for intensity.\r\nvarying vec3 vLightPosition;// light position normalized to view size (position / viewport)\r\nvarying vec3 vLightFalloff; // light falloff attenuation coefficients\r\n\r\nvoid main()\r\n{\r\n// sets diffuseColor and normalColor from their respective textures\r\nvec2 textureCoord = gl_FragCoord.xy / uViewSize;\r\n\r\nvec4 diffuseColor = texture2D(uSampler, textureCoord);\r\nvec4 normalColor = texture2D(uNormalSampler, textureCoord);\r\n\r\n// if no normal color here, just discard\r\nif (normalColor.a == 0.0) discard;\r\n\n\r\n    // the directional vector of the light\r\n    vec3 lightVector = vec3(vLightPosition.xy - textureCoord, vLightPosition.z);\r\n\r\n    // correct for aspect ratio\r\n    lightVector.x *= uViewSize.x / uViewSize.y;\r\n\r\n// does lambertian illumination calculations and sets \"finalColor\"\r\n// compute Distance\r\nfloat D = length(lightVector);\r\n\r\n// normalize vectors\r\nvec3 N = normalize(normalColor.xyz * 2.0 - 1.0);\r\nvec3 L = normalize(lightVector);\r\n\r\n// pre-multiply light color with intensity\r\n// then perform \"N dot L\" to determine our diffuse\r\nvec3 diffuse = (vLightColor.rgb * vLightColor.a) * max(dot(N, L), 0.0);\r\n\r\n// pre-multiply ambient color with intensity\r\nvec3 ambient = uAmbientColor.rgb * uAmbientColor.a;\r\n\r\n// calculate attenuation\r\nfloat attenuation = 1.0 / (vLightFalloff.x + (vLightFalloff.y * D) + (vLightFalloff.z * D * D));\r\n\r\n// calculate final intesity and color, then combine\r\nvec3 intensity = ambient + diffuse * attenuation;\r\nvec3 finalColor = diffuseColor.rgb * intensity;\r\n\n\r\n    gl_FragColor = vec4(finalColor, diffuseColor.a);\r\n}",
        // custom uniforms
        null,
        // custom attributes
        {
            aLightColor: 0,
            aLightPosition: 0,
            aLightFalloff: 0
        }
    );
}

PointLightShader.prototype = Object.create(LightShader.prototype);
PointLightShader.prototype.constructor = PointLightShader;
module.exports = PointLightShader;

PIXI.ShaderManager.registerPlugin('pointLightShader', PointLightShader);

},{"../LightShader":4}],7:[function(require,module,exports){
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
    if (this.currentBatchSize > (this.size * 0.5))
    {
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
    }
    else
    {
        var view = this.positions.subarray(0, this.currentBatchSize * this.vertByteSize);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, view);
    }

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

    // set the vertex attribute
    gl.vertexAttribPointer(this.shader.attributes.aVertexPosition, 2, gl.FLOAT, false, this.vertByteSize, 0);
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

},{}],8:[function(require,module,exports){
/**
 * The WebGLDeferredRenderer draws the scene and all its content onto a webGL enabled canvas. This renderer
 * should be used for browsers that support webGL. This Render works by automatically managing webGLBatchs.
 * So no need for Sprite Batches or Sprite Clouds.
 * Don't forget to add the view to your DOM or you will not see anything :)
 *
 * @class
 * @memberof PIXI.lights
 * @extends PIXI.SystemRenderer
 * @param [width=0] {number} the width of the canvas view
 * @param [height=0] {number} the height of the canvas view
 * @param [options] {object} The optional renderer parameters
 * @param [options.view] {HTMLCanvasElement} the canvas to use as a view, optional
 * @param [options.transparent=false] {boolean} If the render view is transparent, default false
 * @param [options.autoResize=false] {boolean} If the render view is automatically resized, default false
 * @param [options.antialias=false] {boolean} sets antialias. If not available natively then FXAA antialiasing is used
 * @param [options.forceFXAA=false] {boolean} forces FXAA antialiasing to be used over native. FXAA is faster, but may not always lok as great
 * @param [options.resolution=1] {number} the resolution of the renderer retina would be 2
 * @param [options.clearBeforeRender=true] {boolean} This sets if the CanvasRenderer will clear the canvas or
 *      not before the new render pass.
 * @param [options.preserveDrawingBuffer=false] {boolean} enables drawing buffer preservation, enable this if
 *      you need to call toDataUrl on the webgl context.
 */
function WebGLDeferredRenderer(width, height, options)
{
    options = options || {};

    this._lightAmbientColor = 0x000000;
    this._lightAmbientColorRgba = [0, 0, 0, 0];

    this.ambientColor = options.ambientColor || this._lightAmbientColor;
    this.ambientIntensity = options.ambientIntensity || this._lightAmbientColorRgba[3];

    this.lights = [];

    this.renderingNormals = false;

    this._doWebGLRender = PIXI.WebGLRenderer.prototype.render;

    PIXI.WebGLRenderer.call(this, width, height, options);
}

WebGLDeferredRenderer.prototype = Object.create(PIXI.WebGLRenderer.prototype);
WebGLDeferredRenderer.prototype.constructor = WebGLDeferredRenderer;
module.exports = WebGLDeferredRenderer;

Object.defineProperties(WebGLDeferredRenderer.prototype, {
    /**
     * The color of ambient lighting
     *
     * @member {number}
     * @memberof WebGLDeferredRenderer#
     */
    ambientColor: {
        get: function ()
        {
            return this._lightAmbientColor;
        },
        set: function (val)
        {
            this._lightAmbientColor = val;
            PIXI.utils.hex2rgb(val, this._lightAmbientColorRgba);
        }
    },
    /**
     * The intensity of ambient lighting
     *
     * @member {number}
     * @memberof WebGLDeferredRenderer#
     */
    ambientIntensity: {
        get: function ()
        {
            return this._lightAmbientColorRgba[3];
        },
        set: function (val)
        {
            this._lightAmbientColorRgba[3] = val;
        }
    }
});

/** @lends PIXI.DisplayObject# */
Object.assign(WebGLDeferredRenderer.prototype, {
    /**
     * Initializes the context and necessary framebuffers.
     */
    _initContext: function ()
    {
        // first create our render targets.
        this.diffuseRenderTarget = new PIXI.RenderTarget(this.gl, this.width, this.height, null, this.resolution, false);
        this.normalsRenderTarget = new PIXI.RenderTarget(this.gl, this.width, this.height, null, this.resolution, false);

        // call parent init
        PIXI.WebGLRenderer.prototype._initContext.call(this);

        this.outputRenderTarget = this.renderTarget;

        // render targets bind when they get created, so we need to reset back to the default one.
        this.renderTarget.activate();
    },

    render: function (object)
    {
        // render diffuse
        this.renderingNormals = false;
        this.renderTarget = this.diffuseRenderTarget;
        this._doWebGLRender(object);

        // render normals
        this.renderingNormals = true;
        this.renderTarget = this.normalsRenderTarget;
        this._doWebGLRender(object);

        // render lights
        this.setRenderTarget(this.outputRenderTarget);
        this.plugins.lights.flush();

        // composite to viewport
//        this._composite();
    },

    _renderLights: function () {
        
    },

    _updateLight: function () {
        
    }
});

},{}]},{},[1])


//# sourceMappingURL=pixi-lights.js.map