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

    DirectionalLight:             require('./lights/directionalLight/DirectionalLight'),
    DirectionalLightShader:       require('./lights/directionalLight/DirectionalLightShader'),

    LightRenderer:          require('./renderers/LightRenderer'),
    WebGLDeferredRenderer:  require('./renderers/WebGLDeferredRenderer'),

    WireframeShader:        require('./lights/WireframeShader')
};

require('./lightSpriteMixin');
require('./shapeMeshMixin');

},{"./lightSpriteMixin":2,"./lights/WireframeShader":3,"./lights/ambientLight/AmbientLight":4,"./lights/ambientLight/AmbientLightShader":5,"./lights/directionalLight/DirectionalLight":6,"./lights/directionalLight/DirectionalLightShader":7,"./lights/light/Light":8,"./lights/light/LightShader":9,"./lights/pointLight/PointLight":10,"./lights/pointLight/PointLightShader":11,"./renderers/LightRenderer":12,"./renderers/WebGLDeferredRenderer":13,"./shapeMeshMixin":14}],2:[function(require,module,exports){
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

    // unlit render pass
    if (renderer.renderingUnlit)
    {
        // if it has a normal texture it is considered "lit", so skip it
        if (this.normalTexture)
        {
            return;
        }
        // otherwise do a normal draw for unlit pass
        else
        {
            this._texture = this._originalTexture;
        }
    }
    // normals render pass
    else if (renderer.renderingNormals)
    {
        // if it has no normal texture it is considered "unlit", so skip it
        if (!this.normalTexture)
        {
            return;
        }
        else
        {
            this._texture = this.normalTexture;
        }
    }
    // diffuse render pass, always just draw the texture
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

},{"../light/Light":8}],5:[function(require,module,exports){
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
        "#define GLSLIFY 1\nprecision lowp float;\n\nuniform sampler2D uSampler;\nuniform sampler2D uNormalSampler;\n\nuniform mat3 translationMatrix;\n\nuniform vec2 uViewSize;     // size of the viewport\n\nuniform vec4 uLightColor;   // light color, alpha channel used for intensity.\nuniform vec3 uLightFalloff; // light attenuation coefficients (constant, linear, quadratic)\nuniform float uLightHeight; // light height above the viewport\n\n\nvoid main(void)\n{\nvec2 texCoord = gl_FragCoord.xy / uViewSize;\ntexCoord.y = 1.0 - texCoord.y; // FBOs positions are flipped.\n\nvec4 normalColor = texture2D(uNormalSampler, texCoord);\nnormalColor.g = 1.0 - normalColor.g; // Green layer is flipped Y coords.\n\n// bail out early when normal has no data\nif (normalColor.a == 0.0) discard;\n\n\n    // simplified lambert shading that makes assumptions for ambient color\n\n    // compute Distance\n    float D = 1.0;\n    \n    // normalize vectors\n    vec3 N = normalize(normalColor.xyz * 2.0 - 1.0);\n    vec3 L = vec3(1.0, 1.0, 1.0);\n    \n    // pre-multiply light color with intensity\n    // then perform \"N dot L\" to determine our diffuse\n    vec3 diffuse = (uLightColor.rgb * uLightColor.a) * max(dot(N, L), 0.0);\n\n    vec4 diffuseColor = texture2D(uSampler, texCoord);\n    vec3 finalColor = diffuseColor.rgb * diffuse;\n\n    gl_FragColor = vec4(finalColor, diffuseColor.a);\n}\n"
    );
}

AmbientLightShader.prototype = Object.create(LightShader.prototype);
AmbientLightShader.prototype.constructor = AmbientLightShader;
module.exports = AmbientLightShader;

PIXI.ShaderManager.registerPlugin('ambientLightShader', AmbientLightShader);

},{"../light/LightShader":9}],6:[function(require,module,exports){
var Light = require('../light/Light');

/**
 * @class
 * @extends PIXI.lights.Light
 * @memberof PIXI.lights
 *
 * @param [color=0xFFFFFF] {number} The color of the light.
 * @param [brightness=1] {number} The intensity of the light.
 * @param [target] {PIXI.DisplayObject|PIXI.Point} The object in the scene to target.
 */
function DirectionalLight(color, brightness, target) {
    Light.call(this, color, brightness);

    this.target = target;
    this._directionVector = new PIXI.Point();

    this._updateTransform = Light.prototype.updateTransform;
    this._syncShader = Light.prototype.syncShader;

    this.shaderName = 'directionalLightShader';
}

DirectionalLight.prototype = Object.create(Light.prototype);
DirectionalLight.prototype.constructor = DirectionalLight;
module.exports = DirectionalLight;

DirectionalLight.prototype.updateTransform = function () {
    this._updateTransform();

    var vec = this._directionVector,
        wt = this.worldTransform,
        tx = this.target.worldTransform ? this.target.worldTransform.tx : this.target.x,
        ty = this.target.worldTransform ? this.target.worldTransform.ty : this.target.y;

    // calculate direction from this light to the target
    vec.x = wt.tx - tx;
    vec.y = wt.ty - ty;

    // normalize
    var len = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
    vec.x /= len;
    vec.y /= len;
};

DirectionalLight.prototype.syncShader = function (shader) {
    this._syncShader(shader);

    shader.uniforms.uLightDirection.value[0] = this._directionVector.x;
    shader.uniforms.uLightDirection.value[1] = this._directionVector.y;
};

},{"../light/Light":8}],7:[function(require,module,exports){
var LightShader = require('../light/LightShader');


/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.lights
 * @param shaderManager {ShaderManager} The WebGL shader manager this shader works for.
 */
function DirectionalLightShader(shaderManager) {
    LightShader.call(this,
        shaderManager,
        // vertex shader
        null,
        // fragment shader
        "#define GLSLIFY 1\nprecision lowp float;\n\n// imports the common uniforms like samplers, and ambient/light color\nuniform sampler2D uSampler;\nuniform sampler2D uNormalSampler;\n\nuniform mat3 translationMatrix;\n\nuniform vec2 uViewSize;     // size of the viewport\n\nuniform vec4 uLightColor;   // light color, alpha channel used for intensity.\nuniform vec3 uLightFalloff; // light attenuation coefficients (constant, linear, quadratic)\nuniform float uLightHeight; // light height above the viewport\n\n\nuniform vec2 uLightDirection;\n\nvoid main()\n{\nvec2 texCoord = gl_FragCoord.xy / uViewSize;\ntexCoord.y = 1.0 - texCoord.y; // FBOs positions are flipped.\n\nvec4 normalColor = texture2D(uNormalSampler, texCoord);\nnormalColor.g = 1.0 - normalColor.g; // Green layer is flipped Y coords.\n\n// bail out early when normal has no data\nif (normalColor.a == 0.0) discard;\n\n\n    // the directional vector of the light\n    vec3 lightVector = vec3(uLightDirection, uLightHeight);\n\n    // compute Distance\n    float D = length(lightVector);\n\n// normalize vectors\nvec3 N = normalize(normalColor.xyz * 2.0 - 1.0);\nvec3 L = normalize(lightVector);\n\n// pre-multiply light color with intensity\n// then perform \"N dot L\" to determine our diffuse\nvec3 diffuse = (uLightColor.rgb * uLightColor.a) * max(dot(N, L), 0.0);\n\n\n    // calculate attenuation\n    float attenuation = 1.0;\n\n// calculate final intesity and color, then combine\nvec3 intensity = diffuse * attenuation;\nvec4 diffuseColor = texture2D(uSampler, texCoord);\nvec3 finalColor = diffuseColor.rgb * intensity;\n\ngl_FragColor = vec4(finalColor, diffuseColor.a);\n\n}\n",
        // custom uniforms
        {
            // the directional vector of the light
            uLightDirection: { type: '2f', value: new Float32Array(2) }
        }
    );
}

DirectionalLightShader.prototype = Object.create(LightShader.prototype);
DirectionalLightShader.prototype.constructor = DirectionalLightShader;
module.exports = DirectionalLightShader;

PIXI.ShaderManager.registerPlugin('directionalLightShader', DirectionalLightShader);

},{"../light/LightShader":9}],8:[function(require,module,exports){
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

    this.visible = false;

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

},{}],9:[function(require,module,exports){


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

LightShader.defaultVertexSrc = "#define GLSLIFY 1\nprecision lowp float;\n\nattribute vec2 aVertexPosition;\n\nuniform bool uUseViewportQuad;\nuniform mat3 translationMatrix;\nuniform mat3 projectionMatrix;\n\nvoid main(void) {\n    if (uUseViewportQuad) {\n        gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    }\n    else\n    {\n        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    }\n}\n";

},{}],10:[function(require,module,exports){
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
        var shape = new PIXI.Circle(0, 0, radius),
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

},{"../light/Light":8}],11:[function(require,module,exports){
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
        "#define GLSLIFY 1\nprecision lowp float;\n\n// imports the common uniforms like samplers, and ambient color\nuniform sampler2D uSampler;\nuniform sampler2D uNormalSampler;\n\nuniform mat3 translationMatrix;\n\nuniform vec2 uViewSize;     // size of the viewport\n\nuniform vec4 uLightColor;   // light color, alpha channel used for intensity.\nuniform vec3 uLightFalloff; // light attenuation coefficients (constant, linear, quadratic)\nuniform float uLightHeight; // light height above the viewport\n\n\nuniform float uLightRadius;\n\nvoid main()\n{\nvec2 texCoord = gl_FragCoord.xy / uViewSize;\ntexCoord.y = 1.0 - texCoord.y; // FBOs positions are flipped.\n\nvec4 normalColor = texture2D(uNormalSampler, texCoord);\nnormalColor.g = 1.0 - normalColor.g; // Green layer is flipped Y coords.\n\n// bail out early when normal has no data\nif (normalColor.a == 0.0) discard;\n\n\n    vec2 lightPosition = translationMatrix[2].xy / uViewSize;\n\n    // the directional vector of the light\n    vec3 lightVector = vec3(lightPosition - texCoord, uLightHeight);\n\n    // correct for aspect ratio\n    lightVector.x *= uViewSize.x / uViewSize.y;\n\n    // compute Distance\n    float D = length(lightVector);\n\n    // bail out early when pixel outside of light sphere\n    if (D > uLightRadius) discard;\n\n// normalize vectors\nvec3 N = normalize(normalColor.xyz * 2.0 - 1.0);\nvec3 L = normalize(lightVector);\n\n// pre-multiply light color with intensity\n// then perform \"N dot L\" to determine our diffuse\nvec3 diffuse = (uLightColor.rgb * uLightColor.a) * max(dot(N, L), 0.0);\n\n\n    // calculate attenuation\n    float attenuation = 1.0 / (uLightFalloff.x + (uLightFalloff.y * D) + (uLightFalloff.z * D * D));\n\n// calculate final intesity and color, then combine\nvec3 intensity = diffuse * attenuation;\nvec4 diffuseColor = texture2D(uSampler, texCoord);\nvec3 finalColor = diffuseColor.rgb * intensity;\n\ngl_FragColor = vec4(finalColor, diffuseColor.a);\n\n}",
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

},{"../light/LightShader":9}],12:[function(require,module,exports){
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
        renderer.drawCount++;
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

},{}],13:[function(require,module,exports){
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
    this.renderingUnlit = false;
    this._forwardRender = PIXI.WebGLRenderer.prototype.render;

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

    // TODO Optimizations:
    // Only call `updateTransform` once, right now it is call each render pass.
    // Optimize render texture rendering to reduce duplication, or use render targets directly.
    // Cache tree transversal, cache elements to use for each render pass?

    render: function (object)
    {
        // no point rendering if our context has been blown up!
        if (this.gl.isContextLost())
        {
            return;
        }

        this.drawCount = 0;

        this._lastObjectRendered = object;

        /////////////
        //  Rendering
        this.renderingUnlit = false;

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

        // forward render unlit objects (no normal texture)
        var cbr = this.clearBeforeRender,
            draws = this.drawCount;

        this.renderingNormals = false;
        this.renderingUnlit = true;
        this.clearBeforeRender = false;

        this._forwardRender(object);
        this.clearBeforeRender = cbr;
        this.drawCount += draws;
        /////////////
    }
});

},{}],14:[function(require,module,exports){
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

},{}]},{},[1])


//# sourceMappingURL=pixi-lights.js.map