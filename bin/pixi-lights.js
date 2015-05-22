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
function Light(color, vertices, indices) {
    if (this.constructor === Light) {
        throw new Error('Light is an abstract base and should not be created directly!');
    }

    PIXI.DisplayObject.call(this);

    /**
     * An array of vertices
     *
     * @member {Float32Array}
     */
    this.vertices = vertices || new Float32Array([0,   0,
                                                  1024, 0,
                                                  1024, 512,
                                                  0,   512]);

    /**
     * An array containing the indices of the vertices
     *
     * @member {Uint16Array}
     */
    this.indices = new Uint16Array([0,1,2, 0,2,3]);

    /**
     * The blend mode to be applied to the sprite. Set to blendModes.NORMAL to remove any blend mode.
     *
     * @member {number}
     * @default CONST.BLEND_MODES.NORMAL;
     */
    this.blendMode = PIXI.BLEND_MODES.NORMAL;

    this._vertexBuffer = null;
    this._indexBuffer = null;

    this.needsUpdate = true;

    // light stuff...

    this._color = 0xFFFFFF;
    this._colorRgba = [1, 1, 1, 1];

    if (color || color === 0) {
        this.color = color;
    }

    this.height = 0.075;

    this.falloff = [0.4, 7.0, 40.0];

    // hack around bug in interaction manager. It dies when processing raw DOs
//    this.children = [];

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
//Light.prototype.renderWebGL = function (renderer)
//{
//    // I actually don't want to interrupt the current batch, so don't set light as the current object renderer.
//    // light renderer works a bit differently in that ALL lights are in a single batch no matter what.
//
//    // renderer.setObjectRenderer(renderer.plugins.lights);
//
////    if (renderer.renderingNormals) {
////        renderer.plugins.lights.render(this);
//        renderer.lights.push(this);
////    }
//};

Light.prototype.renderWebGL = function (renderer)
{
    // add lights to their renderer on the normals pass
    if (!renderer.renderingNormals) {
        return;
    }

//    renderer.setObjectRenderer(renderer.plugins.lights);
    renderer.plugins.lights.render(this);
};

Light.prototype.destroy = function ()
{
    PIXI.DisplayObject.prototype.destroy.call(this);

    // TODO: Destroy buffers!
}

},{}],4:[function(require,module,exports){


/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.lights
 * @param shaderManager {ShaderManager} The WebGL shader manager this shader works for.
 */
function LightShader(shaderManager, vertexSrc, fragmentSrc, customUniforms, customAttributes) {
    var uniforms = {
        alpha:              { type: '1f', value: 0 },
        translationMatrix:  { type: 'mat3', value: new Float32Array(9) },
        projectionMatrix:   { type: 'mat3', value: new Float32Array(9) },

        // textures from the previously rendered FBOs
        uSampler:       { type: 'sampler2D', value: null },
        uNormalSampler: { type: 'sampler2D', value: null },

        // size of the renderer viewport
        uViewSize:      { type: '2f', value: new Float32Array(2) },

        // ambient lighting color, alpha channel used for intensity
        uAmbientColor:  { type: '4f', value: new Float32Array(4) },

        // light color, alpha channel used for intensity.
        uLightColor:    { type: '4f', value: new Float32Array([1, 1, 1, 1]) },

        // light falloff attenuation coefficients
        uLightFalloff:  { type: '3f', value: new Float32Array([0, 0, 0]) }
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

    PIXI.Shader.call(this, shaderManager, vertexSrc || LightShader.defaultVertexSrc, fragmentSrc || LightShader.defaultFragmentSrc, uniforms, attributes);
}

LightShader.prototype = Object.create(PIXI.Shader.prototype);
LightShader.prototype.constructor = LightShader;
module.exports = LightShader;

LightShader.defaultVertexSrc = "#define GLSLIFY 1\n\nprecision lowp float;\r\n\r\nattribute vec2 aVertexPosition;\r\n\r\nuniform mat3 translationMatrix;\r\nuniform mat3 projectionMatrix;\r\n\r\nvoid main(void) {\r\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\r\n}\r\n";
LightShader.defaultFragmentSrc = "#define GLSLIFY 1\n\nprecision lowp float;\r\n\r\nuniform sampler2D uSampler;\r\nuniform sampler2D uNormalSampler;\r\n\r\nuniform mat3 translationMatrix;\r\n\r\nuniform float alpha;\r\n\r\nuniform vec2 uViewSize;\r\n\r\nuniform vec4 uAmbientColor; // ambient color, alpha channel used for intensity.\r\n\r\nuniform vec2 uLightPosition;// light position, normalized to viewport.\r\nuniform vec4 uLightColor;   // light color, alpha channel used for intensity.\r\nuniform vec3 uLightFalloff; // light falloff attenuation coefficients.\r\n\n\r\nvoid main(void){\r\n//vec4 diffuseColor = texture2D(uSampler, vTextureCoord);\r\n//vec4 normalColor = texture2D(uNormalSampler, vTextureCoord);\r\n\r\nvec2 texCoord = gl_FragCoord.xy / uViewSize;\r\n\r\nvec4 diffuseColor = texture2D(uSampler, texCoord);\r\nvec4 normalColor = texture2D(uNormalSampler, texCoord);\r\n\r\n// if no normal color here, just discard\r\nif (normalColor.a == 0.0) discard;\r\n\n\r\n    // this shader should always be overriden by a specific light type...\r\n    gl_FragColor = vec4(mix(diffuseColor.rgb, normalColor.rgb, 0.5), diffuseColor.a);\r\n}\r\n";

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
        null,
        // fragment shader
        "#define GLSLIFY 1\n\nprecision lowp float;\r\n\r\n// imports the common uniforms like samplers, and ambient color\r\nuniform sampler2D uSampler;\r\nuniform sampler2D uNormalSampler;\r\n\r\nuniform mat3 translationMatrix;\r\n\r\nuniform float alpha;\r\n\r\nuniform vec2 uViewSize;\r\n\r\nuniform vec4 uAmbientColor; // ambient color, alpha channel used for intensity.\r\n\r\nuniform vec2 uLightPosition;// light position, normalized to viewport.\r\nuniform vec4 uLightColor;   // light color, alpha channel used for intensity.\r\nuniform vec3 uLightFalloff; // light falloff attenuation coefficients.\r\n\n\r\nuniform float uLightHeight;\r\n\r\nvoid main()\r\n{\r\n// sets diffuseColor and normalColor from their respective textures\r\n//#pragma glslify: import(\"../shared/loadColors.glsl\")\r\n\r\nvec2 texCoord = gl_FragCoord.xy / uViewSize;\r\ntexCoord.y = 1.0 - texCoord.y;\r\n\r\nvec4 diffuseColor = texture2D(uSampler, texCoord);\r\nvec4 normalColor = texture2D(uNormalSampler, texCoord);\r\n\r\n// if no normal color here, just discard\r\n//if (normalColor.a == 0.0) discard;\r\n\r\n\r\n\r\n\r\n\r\n    vec2 lightPosition = translationMatrix[2].xy / uViewSize;\r\n//    lightPosition.y = 1.0 - lightPosition.y;\r\n\r\n    // the directional vector of the light\r\n    vec3 lightVector = vec3(lightPosition - texCoord, uLightHeight);\r\n\r\n    // correct for aspect ratio\r\n//    lightVector.x *= uViewSize.x / uViewSize.y;\r\n\r\n\r\n\r\n\r\n// does lambertian illumination calculations and sets \"finalColor\"\r\n//#pragma glslify: import(\"../shared/computeLambert.glsl\")\r\n\r\n// compute Distance\r\nfloat D = length(lightVector);\r\n\r\n// normalize vectors\r\nvec3 N = normalize(normalColor.xyz * 2.0 - 1.0);\r\nvec3 L = normalize(lightVector);\r\n\r\n// pre-multiply light color with intensity\r\n// then perform \"N dot L\" to determine our diffuse\r\nvec3 diffuse = (uLightColor.rgb * uLightColor.a) * max(dot(N, L), 0.0);\r\n\r\n// pre-multiply ambient color with intensity\r\nvec3 ambient = uAmbientColor.rgb * uAmbientColor.a;\r\n\r\n// calculate attenuation\r\nfloat attenuation = 1.0 / (uLightFalloff.x + (uLightFalloff.y * D) + (uLightFalloff.z * D * D));\r\n\r\n// calculate final intesity and color, then combine\r\nvec3 intensity = ambient + diffuse * attenuation;\r\nvec3 finalColor = diffuseColor.rgb * intensity;\r\n\r\n\r\n\r\n\r\n\r\n    gl_FragColor = vec4(finalColor, diffuseColor.a);\r\n}",
        // custom uniforms
        {
            // height of the light above the viewport
            uLightHeight: { type: '1f', value: 0.075 }
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

    // the total number of indices in our batch, there are 6 points per quad.
    var numIndices = LightRenderer.MAX_LIGHTS * 6;

    /**
     * Holds the indices
     *
     * @member {Uint16Array}
     */
    this.indices = new Uint16Array(numIndices);

    //TODO this could be a single buffer shared amongst all renderers as we reuse this set up in most renderers
    for (var i = 0, j = 0; i < numIndices; i += 6, j += 4)
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
}

LightRenderer.MAX_LIGHTS = 500;

LightRenderer.prototype = Object.create(PIXI.ObjectRenderer.prototype);
LightRenderer.prototype.constructor = LightRenderer;
module.exports = LightRenderer;

PIXI.WebGLRenderer.registerPlugin('lights', LightRenderer);

/**
 * Renders the light object.
 *
 * @param light {Light} the light to render
 */
LightRenderer.prototype.render = function (light)
{
    this.lights[this.currentBatchSize++] = light;
};

LightRenderer.prototype.flush = function ()
{
    var renderer = this.renderer,
        gl = renderer.gl,
        diffuseTexture = renderer.diffuseTexture,
        normalsTexture = renderer.normalsTexture,
        lastShader = null;

    for (var i = 0; i < this.currentBatchSize; ++i)
    {
        var light = this.lights[i],
            shader = light.shader || this.renderer.shaderManager.plugins[light.shaderName];

        if (!light._vertexBuffer)
        {
            this._initWebGL(light);
        }

        // set shader if needed
        if (shader !== lastShader) {
            lastShader = shader;
            renderer.shaderManager.setShader(shader);
        }

        renderer.blendModeManager.setBlendMode(light.blendMode);

        // set uniforms
        light.worldTransform.toArray(true, shader.uniforms.translationMatrix.value);
        renderer.currentRenderTarget.projectionMatrix.toArray(true, shader.uniforms.projectionMatrix.value);

        shader.uniforms.alpha.value = light.worldAlpha;

        shader.uniforms.uViewSize.value[0] = renderer.width;
        shader.uniforms.uViewSize.value[1] = renderer.height;

        shader.uniforms.uAmbientColor.value[0] = renderer._lightAmbientColorRgba[0];
        shader.uniforms.uAmbientColor.value[1] = renderer._lightAmbientColorRgba[1];
        shader.uniforms.uAmbientColor.value[2] = renderer._lightAmbientColorRgba[2];
        shader.uniforms.uAmbientColor.value[3] = renderer._lightAmbientColorRgba[3];

        shader.uniforms.uLightColor.value[0] = light._colorRgba[0];
        shader.uniforms.uLightColor.value[1] = light._colorRgba[1];
        shader.uniforms.uLightColor.value[2] = light._colorRgba[2];
        shader.uniforms.uLightColor.value[3] = light._colorRgba[3];

        shader.uniforms.uLightFalloff.value[0] = light.falloff[0];
        shader.uniforms.uLightFalloff.value[1] = light.falloff[1];
        shader.uniforms.uLightFalloff.value[2] = light.falloff[2];

        shader.syncUniforms();

        // have to set these manually due to the way pixi base shader makes assumptions about texture units
        gl.uniform1i(shader.uniforms.uSampler._location, 0);
        gl.uniform1i(shader.uniforms.uNormalSampler._location, 1);

        if (!light.needsUpdate)
        {
            // update vertex data
            gl.bindBuffer(gl.ARRAY_BUFFER, light._vertexBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, light.vertices);
            gl.vertexAttribPointer(shader.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);

            // bind diffuse texture
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, diffuseTexture.baseTexture._glTextures[gl.id]);

            // bind normal texture
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, normalsTexture.baseTexture._glTextures[gl.id]);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, light._indexBuffer);
            gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, light.indices);
        }
        else
        {
            light.needsUpdate = false;

            // upload vertex data
            gl.bindBuffer(gl.ARRAY_BUFFER, light._vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, light.vertices, gl.STATIC_DRAW);
            gl.vertexAttribPointer(shader.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);

            // bind diffuse texture
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, diffuseTexture.baseTexture._glTextures[gl.id]);

            // bind normal texture
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, normalsTexture.baseTexture._glTextures[gl.id]);

            // static upload of index buffer
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, light._indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, light.indices, gl.STATIC_DRAW);
        }

        gl.drawElements(gl.TRIANGLES, light.indices.length, gl.UNSIGNED_SHORT, 0);
    }

    this.currentBatchSize = 0;
};

/**
 * Prepares all the buffers to render this light.
 *
 * @param light {Light} The light object to prepare for rendering.
 */
LightRenderer.prototype._initWebGL = function (light)
{
    var gl = this.renderer.gl;

    // create the buffers
    light._vertexBuffer = gl.createBuffer();
    light._indexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, light._vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, light.vertices, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, light._indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, light.indices, gl.STATIC_DRAW);
};

LightRenderer.prototype.destroy = function ()
{
    
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
        // call parent init
        PIXI.WebGLRenderer.prototype._initContext.call(this);

        // first create our render targets.
        this.diffuseTexture = new PIXI.RenderTexture(this, this.width, this.height, null, this.resolution);
        this.normalsTexture = new PIXI.RenderTexture(this, this.width, this.height, null, this.resolution);
    },

    render: function (object)
    {
        // render diffuse
        this.renderingNormals = false;
        this.diffuseTexture.render(object);
//        this.renderTarget = this.diffuseRenderTarget;
//        this._doWebGLRender(object);

        // render normals
        this.renderingNormals = true;
        this.normalsTexture.render(object);
//        this.renderTarget = this.normalsRenderTarget;
//        this._doWebGLRender(object);

        // render lights
        this.setRenderTarget(this.renderTarget);
        this.setObjectRenderer(this.plugins.lights);
        this.plugins.lights.flush();

        // composite to viewport
//        this._composite();
    }
});

},{}]},{},[1])


//# sourceMappingURL=pixi-lights.js.map