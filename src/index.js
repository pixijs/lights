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
