import { Texture } from '@pixi/core';
import { Dict } from '@pixi/utils';
import { IMeshMaterialOptions, MeshMaterial } from '@pixi/mesh';
import { Matrix } from '@pixi/math';
import vert from './light.vert';

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
        const uniforms: Dict<any> = {
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
            uLightHeight: 0.075
        };

        if (options.uniforms)
        {
            Object.assign(uniforms, options.uniforms);
        }

        super(Texture.WHITE, options);
    }

    static defaultVertexSrc: string = vert;
}
