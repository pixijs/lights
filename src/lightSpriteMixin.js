var tempTexture = null;

 /**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {WebGLRenderer}
 * @private
 */
PIXI.Sprite.prototype._renderWebGL = function (renderer)
{
    if (renderer.renderingUnlit && !this.unlit) {
        return;
    }

    if (!this._originalTexture) {
        this._originalTexture = this._texture;
    }

    if (renderer.renderingNormals && this.normalTexture)
    {
        this._texture = this.normalTexture;
    }
    else
    {
        this._texture = this._originalTexture;
    }

    renderer.setObjectRenderer(renderer.plugins.sprite);
    renderer.plugins.sprite.render(this);
};
