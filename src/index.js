module.exports = PIXI.lights = {
//    LitSprite: require('./light_1/LitSprite'),
//    LightingRenderer: require('./light_1/webgl/LightingRenderer')

    Light:                  require('./lights/Light'),
    LightShader:            require('./lights/LightShader'),

    PointLight:             require('./lights/point/PointLight'),
    PointLightShader:       require('./lights/point/PointLightShader'),

    LightRenderer:          require('./renderers/LightRenderer'),
    WebGLDeferredRenderer:  require('./renderers/WebGLDeferredRenderer')
};

require('./lightSpriteMixin');
