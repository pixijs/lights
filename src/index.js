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
