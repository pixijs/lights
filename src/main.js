const plugins = {};
const diffuseGroup = new PIXI.display.Group();
const normalGroup = new PIXI.display.Group();
const lightGroup = new PIXI.display.Group();

diffuseGroup.useRenderTexture = true;
normalGroup.useRenderTexture = true;

function registerPlugin(name, func) {
    plugins[name] = func;
}

export {
    plugins,
    diffuseGroup,
    normalGroup,
    lightGroup,
    registerPlugin
};
