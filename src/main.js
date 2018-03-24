/**
 * @namespace PIXI.lights
 */

/**
 * @static
 * @memberof PIXI.lights
 * @member {Object}
 */
const plugins = {};

/**
 * @static
 * @memberof PIXI.lights
 * @member {PIXI.display.Group}
 */
const diffuseGroup = new PIXI.display.Group();

/**
 * @static
 * @memberof PIXI.lights
 * @member {PIXI.display.Group}
 */
const normalGroup = new PIXI.display.Group();

/**
 * @static
 * @memberof PIXI.lights
 * @member {PIXI.display.Group}
 */
const lightGroup = new PIXI.display.Group();

diffuseGroup.useRenderTexture = true;
normalGroup.useRenderTexture = true;

/**
 * @static
 * @memberof PIXI.lights
 * @param {string} name - Name of the plugin
 * @param {class} classRef - Class references
 */
function registerPlugin(name, classRef) {
    plugins[name] = classRef;
}

export {
    plugins,
    diffuseGroup,
    normalGroup,
    lightGroup,
    registerPlugin
};
