(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = PIXI.lights = {
//    LitSprite: require('./light_1/LitSprite'),
//    LightingRenderer: require('./light_1/webgl/LightingRenderer')

    Light:                  require('./lights/light/Light'),
    LightShader:            require('./lights/light/LightShader'),

    AmbientLight:           require('./lights/ambientLight/AmbientLight'),
    AmbientLightShader:     require('./lights/ambientLight/AmbientLightShader'),

    PointLight:             require('./lights/pointLight/PointLight'),
    PointLightShader:       require('./lights/pointLight/PointLightShader'),

    LightRenderer:          require('./renderers/LightRenderer'),
    WebGLDeferredRenderer:  require('./renderers/WebGLDeferredRenderer'),

    WireframeShader:        require('./lights/WireframeShader')
};

require('./lightSpriteMixin');
require('./shapeMeshMixin');

},{"./lightSpriteMixin":2,"./lights/WireframeShader":3,"./lights/ambientLight/AmbientLight":4,"./lights/ambientLight/AmbientLightShader":5,"./lights/light/Light":6,"./lights/light/LightShader":7,"./lights/pointLight/PointLight":8,"./lights/pointLight/PointLightShader":9,"./renderers/LightRenderer":10,"./renderers/WebGLDeferredRenderer":11,"./shapeMeshMixin":12}],2:[function(require,module,exports){
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
 * @extends PIXI.Shader
 * @memberof PIXI.lights
 * @param shaderManager {ShaderManager} The WebGL shader manager this shader works for.
 */
function WireframeShader(shaderManager) {
    PIXI.Shader.call(this,
        shaderManager,
        // vertex shader
        [
            'precision lowp float;',

            'attribute vec2 aVertexPosition;',

            'uniform mat3 projectionMatrix;',

            'void main(void) {',
            '    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
            '}'
        ].join('\n'),
        // fragment shader
        [
            'void main() {',
            '    gl_FragColor = vec4(0, 0, 0, 1);',
            '}'
        ].join('\n'),
        // uniforms
        {
            translationMatrix:  { type: 'mat3', value: new Float32Array(9) },
            projectionMatrix:   { type: 'mat3', value: new Float32Array(9) }
        },
        // attributes
        {
            aVertexPosition: 0
        }
    );
}

WireframeShader.prototype = Object.create(PIXI.Shader.prototype);
WireframeShader.prototype.constructor = WireframeShader;
module.exports = WireframeShader;

PIXI.ShaderManager.registerPlugin('wireframeShader', WireframeShader);

},{}],4:[function(require,module,exports){
var Light = require('../light/Light');

/**
 * @class
 * @extends PIXI.lights.Light
 * @memberof PIXI.lights
 *
 * @param [color=0xFFFFFF] {number} The color of the light.
 * @param [brightness=0.5] {number} The brightness of the light.
 */
function AmbientLight(color, brightness) {
    // ambient light is drawn using a full-screen quad
    Light.call(this, color, brightness);

    this.shaderName = 'ambientLightShader';
}

AmbientLight.prototype = Object.create(Light.prototype);
AmbientLight.prototype.constructor = AmbientLight;
module.exports = AmbientLight;

AmbientLight.prototype.renderWebGL = function (renderer)
{
    // add lights to their renderer on the normals pass
    if (!renderer.renderingNormals) {
        return;
    }

    // I actually don't want to interrupt the current batch, so don't set light as the current object renderer.
    // Light renderer works a bit differently in that lights are draw individually on flush (called by WebGLDeferredRenderer).
    //renderer.setObjectRenderer(renderer.plugins.lights);

    renderer.plugins.lights.render(this);
};

},{"../light/Light":6}],5:[function(require,module,exports){
var LightShader = require('../light/LightShader');


/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.lights
 * @param shaderManager {ShaderManager} The WebGL shader manager this shader works for.
 */
function AmbientLightShader(shaderManager) {
    LightShader.call(this,
        shaderManager,
        // vertex shader
        null,
        // fragment shader
        "#define GLSLIFY 1\n\nprecision lowp float;\r\n\r\nuniform sampler2D uSampler;\r\nuniform sampler2D uNormalSampler;\r\n\r\nuniform mat3 translationMatrix;\r\n\r\nuniform vec2 uViewSize;\r\n\r\nuniform vec4 uAmbientColor; // ambient color, alpha channel used for intensity.\r\n\r\nuniform vec4 uLightColor;   // light color, alpha channel used for intensity.\r\nuniform vec3 uLightFalloff; // light attenuation coefficients (constant, linear, quadratic)\r\nuniform float uLightHeight; // light height above the viewport\r\n\n\r\nvoid main(void)\r\n{\r\nvec2 texCoord = gl_FragCoord.xy / uViewSize;\r\ntexCoord.y = 1.0 - texCoord.y; // FBOs are flipped.\r\n\r\nvec4 diffuseColor = texture2D(uSampler, texCoord);\r\nvec4 normalColor = texture2D(uNormalSampler, texCoord);\r\n\r\n// if no normal color here, just discard\r\nif (normalColor.a == 0.0) discard;\r\n\n\r\n    // simplified lambert shading that makes assumptions for ambient color\r\n\r\n    // compute Distance\r\n//    float D = length(lightVector);\r\n    float D = 1.0;\r\n    \r\n    // normalize vectors\r\n    vec3 N = normalize(normalColor.xyz * 2.0 - 1.0);\r\n//    vec3 L = normalize(lightVector);\r\n    vec3 L = vec3(1.0, 1.0, 1.0);\r\n    \r\n    // pre-multiply light color with intensity\r\n    // then perform \"N dot L\" to determine our diffuse\r\n    vec3 diffuse = (uLightColor.rgb * uLightColor.a) * max(dot(N, L), 0.0);\r\n    \r\n    // pre-multiply ambient color with intensity\r\n//    vec3 ambient = uAmbientColor.rgb * uAmbientColor.a;\r\n    \r\n    // calculate attenuation\r\n//    float attenuation = 1.0 / (uLightFalloff.x + (uLightFalloff.y * D) + (uLightFalloff.z * D * D));\r\n    \r\n    // calculate final intesity and color, then combine\r\n//    vec3 intensity = ambient + diffuse * attenuation;\r\n//    vec3 finalColor = diffuseColor.rgb * intensity;\r\n    vec3 finalColor = diffuseColor.rgb * diffuse;\r\n\r\n    // calculate just ambient light color, most lights will override this frag\r\n//    vec3 ambientColor = uLightColor.rgb * uLightColor.a;\r\n//    gl_FragColor = vec4(diffuseColor.rgb * ambientColor, diffuseColor.a);\r\n    gl_FragColor = vec4(finalColor, diffuseColor.a);\r\n}\r\n"
    );
}

AmbientLightShader.prototype = Object.create(LightShader.prototype);
AmbientLightShader.prototype.constructor = AmbientLightShader;
module.exports = AmbientLightShader;

PIXI.ShaderManager.registerPlugin('ambientLightShader', AmbientLightShader);

},{"../light/LightShader":7}],6:[function(require,module,exports){
/**
 * Excuse the mess, haven't cleaned this up yet!
 */



/**
 * @class
 * @extends PIXI.DisplayObject
 * @memberof PIXI.lights
 *
 * @param [color=0xFFFFFF] {number} The color of the light.
 * @param [brightness=1] {number} The brightness of the light, in range [0, 1].
 */
function Light(color, brightness, vertices, indices) {
    if (this.constructor === Light) {
        throw new Error('Light is an abstract base class, it should not be created directly!');
    }
    
    PIXI.DisplayObject.call(this);

    /**
     * An array of vertices
     *
     * @member {Float32Array}
     */
    this.vertices = vertices || new Float32Array(8);

    /**
     * An array containing the indices of the vertices
     *
     * @member {Uint16Array}
     */
    this.indices = indices || new Uint16Array([0,1,2, 0,2,3]);

    /**
     * The blend mode to be applied to the light.
     *
     * @member {number}
     * @default CONST.BLEND_MODES.ADD;
     */
    this.blendMode = PIXI.BLEND_MODES.ADD;

    /**
     * The draw mode to be applied to the light geometry.
     *
     * @member {number}
     * @default CONST.DRAW_MODES.TRIANGLES;
     */
    this.drawMode = PIXI.DRAW_MODES.TRIANGLES;

    /**
     * When set, the renderer will reupload the geometry data.
     * 
     * @member {boolean}
     */
    this.needsUpdate = true;

    /**
     * The height of the light from the viewport.
     *
     * @member {number}
     * @default 0.075
     */
    this.height = 0.075;

    /**
     * The falloff attenuation coeficients.
     *
     * @member {number[]}
     * @default [0.75, 3, 20]
     */
    this.falloff = [0.75, 3, 20];

    /**
     * The name of the shader plugin to use.
     *
     * @member {string}
     */
    this.shaderName = null;

    /**
     * By default the light uses a viewport sized quad as the mesh.
     */
    this.useViewportQuad = true;

    // webgl buffers
    this._vertexBuffer = null;
    this._indexBuffer = null;

    // color and brightness are exposed through setters
    this._color = 0x4d4d59;
    this._colorRgba = [0.3, 0.3, 0.35, 0.8];

    // run the color setter
    if (color || color === 0) {
        this.color = color;
    }
    
    // run the brightness setter
    if (brightness || brightness === 0) {
        this.brightness = brightness;
    }
}

Light.prototype = Object.create(PIXI.DisplayObject.prototype);
Light.prototype.constructor = Light;
module.exports = Light;

Object.defineProperties(Light.prototype, {
    /**
     * The color of the lighting.
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
    },

    /**
     * The brightness of this lighting. Normalized in the range [0, 1].
     *
     * @member {number}
     * @memberof Light#
     */
    brightness: {
        get: function ()
        {
            return this._colorRgba[3];
        },
        set: function (val)
        {
            this._colorRgba[3] = val;
        }
    }
});

Light.prototype.syncShader = function (shader) {
    shader.uniforms.uUseViewportQuad.value = this.useViewportQuad;

    shader.uniforms.uLightColor.value[0] = this._colorRgba[0];
    shader.uniforms.uLightColor.value[1] = this._colorRgba[1];
    shader.uniforms.uLightColor.value[2] = this._colorRgba[2];
    shader.uniforms.uLightColor.value[3] = this._colorRgba[3];

    shader.uniforms.uLightHeight.value = this.height;

    shader.uniforms.uLightFalloff.value[0] = this.falloff[0];
    shader.uniforms.uLightFalloff.value[1] = this.falloff[1];
    shader.uniforms.uLightFalloff.value[2] = this.falloff[2];
};

Light.prototype.renderWebGL = function (renderer)
{
    // add lights to their renderer on the normals pass
    if (!renderer.renderingNormals) {
        return;
    }

    // I actually don't want to interrupt the current batch, so don't set light as the current object renderer.
    // Light renderer works a bit differently in that lights are draw individually on flush (called by WebGLDeferredRenderer).
    //renderer.setObjectRenderer(renderer.plugins.lights);

    renderer.plugins.lights.render(this);
};

Light.prototype.destroy = function ()
{
    PIXI.DisplayObject.prototype.destroy.call(this);

    // TODO: Destroy buffers!
};

Light.DRAW_MODES = {
    
};

},{}],7:[function(require,module,exports){


/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.lights
 * @param shaderManager {ShaderManager} The WebGL shader manager this shader works for.
 */
function LightShader(shaderManager, vertexSrc, fragmentSrc, customUniforms, customAttributes) {
    var uniforms = {
        translationMatrix:  { type: 'mat3', value: new Float32Array(9) },
        projectionMatrix:   { type: 'mat3', value: new Float32Array(9) },

        // textures from the previously rendered FBOs
        uSampler:       { type: 'sampler2D', value: null },
        uNormalSampler: { type: 'sampler2D', value: null },

        // should we apply the translation matrix or not.
        uUseViewportQuad: { type: 'bool', value: true },

        // size of the renderer viewport
        uViewSize:      { type: '2f', value: new Float32Array(2) },

        // light color, alpha channel used for intensity.
        uLightColor:    { type: '4f', value: new Float32Array([1, 1, 1, 1]) },

        // light falloff attenuation coefficients
        uLightFalloff:  { type: '3f', value: new Float32Array([0, 0, 0]) },

        // height of the light above the viewport
        uLightHeight: { type: '1f', value: 0.075 }
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

    PIXI.Shader.call(this, shaderManager, vertexSrc || LightShader.defaultVertexSrc, fragmentSrc, uniforms, attributes);
}

LightShader.prototype = Object.create(PIXI.Shader.prototype);
LightShader.prototype.constructor = LightShader;
module.exports = LightShader;

LightShader.defaultVertexSrc = "#define GLSLIFY 1\n\nprecision lowp float;\r\n\r\nattribute vec2 aVertexPosition;\r\n\r\nuniform bool uUseViewportQuad;\r\nuniform mat3 translationMatrix;\r\nuniform mat3 projectionMatrix;\r\n\r\nvoid main(void) {\r\n    if (uUseViewportQuad) {\r\n        gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\r\n    }\r\n    else\r\n    {\r\n        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\r\n    }\r\n}\r\n";

},{}],8:[function(require,module,exports){
var Light = require('../light/Light');

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
function PointLight(color, brightness, radius) {
    radius = radius || Infinity;

    if (radius !== Infinity) {
        var shape = new PIXI.math.Circle(0, 0, radius),
            mesh = shape.getMesh();

        Light.call(this, color, brightness, mesh.vertices, mesh.indices);

        this.useViewportQuad = false;
        this.drawMode = PIXI.DRAW_MODES.TRIANGLE_FAN;
    }
    else {
        Light.call(this, color, brightness);
    }

    this._syncShader = Light.prototype.syncShader;

    this.radius = radius;
    this.shaderName = 'pointLightShader';
}

PointLight.prototype = Object.create(Light.prototype);
PointLight.prototype.constructor = PointLight;
module.exports = PointLight;

PointLight.prototype.syncShader = function (shader) {
    this._syncShader(shader);

    shader.uniforms.uLightRadius.value = this.radius;
}

},{"../light/Light":6}],9:[function(require,module,exports){
var LightShader = require('../light/LightShader');


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
        "#define GLSLIFY 1\n\nprecision lowp float;\r\n\r\n// imports the common uniforms like samplers, and ambient color\r\nuniform sampler2D uSampler;\r\nuniform sampler2D uNormalSampler;\r\n\r\nuniform mat3 translationMatrix;\r\n\r\nuniform vec2 uViewSize;\r\n\r\nuniform vec4 uAmbientColor; // ambient color, alpha channel used for intensity.\r\n\r\nuniform vec4 uLightColor;   // light color, alpha channel used for intensity.\r\nuniform vec3 uLightFalloff; // light attenuation coefficients (constant, linear, quadratic)\r\nuniform float uLightHeight; // light height above the viewport\r\n\n\r\nuniform float uLightRadius;\r\n\r\nvoid main()\r\n{\r\n    vec2 texCoord = gl_FragCoord.xy / uViewSize;\r\n    texCoord.y = 1.0 - texCoord.y; // FBOs positions are flipped.\r\n\r\n    vec4 normalColor = texture2D(uNormalSampler, texCoord);\r\n    normalColor.g = 1.0 - normalColor.g; // Green layer is flipped Y coords.\r\n\r\n    // bail out early when normal has no data\r\n    if (normalColor.a == 0.0) discard;\r\n\r\n    vec2 lightPosition = translationMatrix[2].xy / uViewSize;\r\n\r\n    // the directional vector of the light\r\n    vec3 lightVector = vec3(lightPosition - texCoord, uLightHeight);\r\n\r\n    // correct for aspect ratio\r\n    lightVector.x *= uViewSize.x / uViewSize.y;\r\n\r\n    // compute Distance\r\n    float D = length(lightVector);\r\n\r\n    // bail out early when pixel outside of light sphere\r\n    if (D > uLightRadius) discard;\r\n\r\n    // normalize vectors\r\n    vec3 N = normalize(normalColor.xyz * 2.0 - 1.0);\r\n    vec3 L = normalize(lightVector);\r\n    \r\n    // pre-multiply light color with intensity\r\n    // then perform \"N dot L\" to determine our diffuse\r\n    vec3 diffuse = (uLightColor.rgb * uLightColor.a) * max(dot(N, L), 0.0);\r\n\r\n    // calculate attenuation\r\n    float attenuation = 1.0 / (uLightFalloff.x + (uLightFalloff.y * D) + (uLightFalloff.z * D * D));\r\n    \r\n    // calculate final intesity and color, then combine\r\n    vec3 intensity = diffuse * attenuation;\r\n    vec4 diffuseColor = texture2D(uSampler, texCoord);\r\n    vec3 finalColor = diffuseColor.rgb * intensity;\r\n\r\n    gl_FragColor = vec4(finalColor, diffuseColor.a);\r\n}",
        // custom uniforms
        {
            // height of the light above the viewport
            uLightRadius:   { type: '1f', value: 1 }
        }
    );
}

PointLightShader.prototype = Object.create(LightShader.prototype);
PointLightShader.prototype.constructor = PointLightShader;
module.exports = PointLightShader;

PIXI.ShaderManager.registerPlugin('pointLightShader', PointLightShader);

},{"../light/LightShader":7}],10:[function(require,module,exports){
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

        // set uniforms, can do some optimizations here.
        shader.uniforms.uViewSize.value[0] = renderer.width;
        shader.uniforms.uViewSize.value[1] = renderer.height;

        light.worldTransform.toArray(true, shader.uniforms.translationMatrix.value);
        renderer.currentRenderTarget.projectionMatrix.toArray(true, shader.uniforms.projectionMatrix.value);

        if (light.useViewportQuad) {
            // update verts to ensure it is a fullscreen quad even if the renderer is resized. This should be optimized
            light.vertices[2] = light.vertices[4] = renderer.width;
            light.vertices[5] = light.vertices[7] = renderer.height;
        }

        light.syncShader(shader);

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

            // update indices
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

        gl.drawElements(renderer.drawModes[light.drawMode], light.indices.length, gl.UNSIGNED_SHORT, 0);
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

},{}],11:[function(require,module,exports){
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

    this.renderingNormals = false;

    PIXI.WebGLRenderer.call(this, width, height, options);
}

WebGLDeferredRenderer.prototype = Object.create(PIXI.WebGLRenderer.prototype);
WebGLDeferredRenderer.prototype.constructor = WebGLDeferredRenderer;
module.exports = WebGLDeferredRenderer;

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

        // render normals
        this.renderingNormals = true;
        this.normalsTexture.render(object);

        // render lights
        this.setRenderTarget(this.renderTarget);
        this.setObjectRenderer(this.plugins.lights);
        this.plugins.lights.flush();
    }
});

},{}],12:[function(require,module,exports){
/**
 * Creates vertices and indices arrays to describe this circle.
 * 
 * @param [totalSegments=40] {number} Total segments to build for the circle mesh.
 * @param [verticesOutput] {Float32Array} An array to output the vertices into. Length must be
 *  `((totalSegments + 2) * 2)` or more. If not passed it is created for you.
 * @param [indicesOutput] {Uint16Array} An array to output the indices into, in gl.TRIANGLE_FAN format. Length must
 *  be `(totalSegments + 3)` or more. If not passed it is created for you.
 */
PIXI.math.Circle.prototype.getMesh = function (totalSegments, vertices, indices)
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

},{}]},{},[1])


//# sourceMappingURL=pixi-lights.js.map