PIXI.lights = {
    Light:                  require('./lights/light/Light'),
    LightShader:            require('./lights/light/LightShader'),

    AmbientLight:           require('./lights/ambientLight/AmbientLight'),
    AmbientLightShader:     require('./lights/ambientLight/AmbientLightShader'),

    PointLight:             require('./lights/pointLight/PointLight'),
    PointLightShader:       require('./lights/pointLight/PointLightShader'),

    DirectionalLight:             require('./lights/directionalLight/DirectionalLight'),
    DirectionalLightShader:       require('./lights/directionalLight/DirectionalLightShader'),

    LightRenderer:          require('./renderers/LightRenderer'),

    WireframeShader:        require('./lights/WireframeShader')
};

Object.assign(PIXI.lights, require('./main'));

module.exports = PIXI.lights;

require('./shapeMeshMixin');
