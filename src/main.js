module.exports = {
    plugins: {},
    registerPlugin: function(name, fun) {
        this.plugins[name] = fun;
    },
    lightGroup: new PIXI.display.Group(),
    normalGroup: new PIXI.display.Group()
};
