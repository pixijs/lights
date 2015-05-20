module.exports = PIXI.lights = {
//    LitSprite: require('./light_1/LitSprite'),
//    LightingRenderer: require('./light_1/webgl/LightingRenderer')

    PointLight:             require('./light_2/lights/point/PointLight'),
    DirectionalLight:       require('./light_2/lights/directional/DirectionalLight'),
    EmissiveLight:          require('./light_2/lights/emissive/EmissiveLight'),

    LightRenderer:          require('./light_2/LightRenderer'),
    WebGLDeferredRenderer:  require('./light_2/WebGLDeferredRenderer')
};

require('./light_2/lightSpriteMixin');
