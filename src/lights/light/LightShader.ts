import { Texture, utils, Matrix } from '@pixi/core';
import { IMeshMaterialOptions, MeshMaterial } from '@pixi/mesh';
import { vert } from '../shared';

/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.lights
 * @param shaderManager {ShaderManager} The WebGL shader manager this shader works for.
 */
export class LightShader extends MeshMaterial
{
    constructor(options?: IMeshMaterialOptions)
    {
        const uniforms: utils.Dict<any> = {
            translationMatrix: Matrix.IDENTITY.toArray(true),
            // textures from the previously rendered FBOs
            uNormalSampler: Texture.WHITE,
            // size of the renderer viewport, CSS
            uViewSize: new Float32Array(2),
            // same, in PIXELS
            uViewPixels: new Float32Array(2),
            // light falloff attenuation coefficients
            uLightFalloff: new Float32Array([0, 0, 0]),
            // height of the light above the viewport
            uLightHeight: 0.075,
            uBrightness: 1.0,
            uUseViewportQuad: true,
        };

        if (options.uniforms)
        {
            Object.assign(uniforms, options.uniforms);
        }

        super(Texture.WHITE, { ...options, uniforms });
    }

    static defaultVertexSrc: string = vert;
}
