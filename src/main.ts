import { Texture } from '@pixi/core';
import { Group, Layer } from '@pixi/layers';
import { Dict } from '@pixi/utils';

const plugins: Dict<any> = {};

const diffuseGroup = new Group(0, false);

const normalGroup = new Group(0, false);

const lightGroup = new Group(0, false);

diffuseGroup.useRenderTexture = true;
normalGroup.useRenderTexture = true;

export class LayerFinder
{
    lastLayer: Layer = null;
    diffuseTexture: Texture = null;
    normalTexture: Texture = null;

    check(layer: Layer): void
    {
        if (this.lastLayer === layer)
        {
            return;
        }
        this.lastLayer = layer;

        const stage = layer._activeStageParent;
        const layerAny = layer as any;

        this.diffuseTexture = Texture.WHITE;
        this.normalTexture = Texture.WHITE;

        if (layerAny.diffuseTexture && layerAny.normalTexture)
        {
            this.diffuseTexture = layerAny.diffuseTexture;
            this.normalTexture = layerAny.normalTexture;
        }
        else
        {
            for (let j = 0; j < stage._activeLayers.length; j++)
            {
                const texLayer = stage._activeLayers[j];

                if (texLayer.group === normalGroup)
                {
                    this.normalTexture = texLayer.getRenderTexture();
                }
                if (texLayer.group === diffuseGroup)
                {
                    this.diffuseTexture = texLayer.getRenderTexture();
                }
            }
        }
    }

    static _instance = new LayerFinder();
}

export {
    plugins,
    diffuseGroup,
    normalGroup,
    lightGroup
};
