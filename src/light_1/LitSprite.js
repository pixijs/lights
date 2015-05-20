function LitSprite(texture, normalMap) {
    PIXI.Sprite.call(this, texture);

    this._normalMap = normalMap;
}

LitSprite.prototype = Object.create(PIXI.Sprite.prototype);
LitSprite.prototype.constructor = LitSprite;

module.exports = LitSprite;

LitSprite.prototype._renderWebGL = function (renderer) {
    renderer.setObjectRenderer(renderer.plugins.lighting);
    renderer.plugins.lighting.render(this);
};

LitSprite.prototype._renderCanvas = function () {
    throw new Error('Lit sprites are not supported in canvas, yet!');
};
