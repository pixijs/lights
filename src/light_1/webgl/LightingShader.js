function LightingShader(shaderManager) {
    PIXI.TextureShader.call(this,
        // vertex shader
//        fs.readFileSync(__dirname + '/light.vert', 'utf8'),
        null,
        // fragment shader
//        fs.readFileSync(__dirname + '/light.frag', 'utf8'),
        fs.readFileSync(__dirname + '/normalLighting.frag', 'utf8'),
        // custom uniforms
        {
            uNormalMap: { type: 'sampler2D', value: 0 },
            uLightColor: { type: '3f', value: [0, 0, 0] },
            uAmbientColor: { type: '3f', value: [0, 0, 0] }
        },
        // custom attributes
        {
            aRotation: 0
        }
    );
}

LightingShader.prototype = Object.create(PIXI.TextureShader.prototype);
LightingShader.prototype.constructor = LightingShader;

module.exports = LightingShader;
