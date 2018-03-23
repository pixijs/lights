module.exports = {
    plugins: {},
    registerPlugin: function(name, fun) {
        this.plugins[name] = fun;
    },
    diffuseGroup: new PIXI.display.Group(),
    normalGroup: new PIXI.display.Group(),
    lightGroup: new PIXI.display.Group()
};

module.exports.diffuseGroup.useRenderTexture = true;
module.exports.normalGroup.useRenderTexture = true;
