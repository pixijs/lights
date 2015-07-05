var tempTexture = null;

 /**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {WebGLRenderer}
 * @private
 */
PIXI.Sprite.prototype._renderWebGL = function (renderer)
{
    if (!this._originalTexture) {
        this._originalTexture = this._texture;
    }

    // unlit render pass
    if (renderer.renderingUnlit)
    {
        // if it has a normal texture it is considered "lit", so skip it
        if (this.normalTexture)
        {
            return;
        }
        // otherwise do a normal draw for unlit pass
        else
        {
            this._texture = this._originalTexture;
        }
    }
    // normals render pass
    else if (renderer.renderingNormals)
    {
        // if it has no normal texture it is considered "unlit", so skip it
        if (!this.normalTexture)
        {
            return;
        }
        else
        {
            this._texture = this.normalTexture;
        }
    }
    // diffuse render pass, always just draw the texture
    else
    {
        this._texture = this._originalTexture;
    }

    renderer.setObjectRenderer(renderer.plugins.sprite);
    renderer.plugins.sprite.render(this);
};
