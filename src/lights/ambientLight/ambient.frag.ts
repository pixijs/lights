import { commonUniforms, computeVertexPosition, loadNormals } from '../shared';

export const ambientFrag = `precision highp float;

${commonUniforms}

void main(void)
{
${computeVertexPosition}
${loadNormals}
    // simplified lambert shading that makes assumptions for ambient color
    vec3 diffuse = uColor.rgb * uBrightness;
    vec4 diffuseColor = texture2D(uSampler, texCoord);
    vec3 finalColor = diffuseColor.rgb * diffuse;

    gl_FragColor = vec4(finalColor, diffuseColor.a);
}
`;
