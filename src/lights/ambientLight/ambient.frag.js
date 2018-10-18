import commonUniforms from '../shared/commonUniforms.glsl';
import computeVertexPosition from '../shared/computeVertexPosition.glsl';
import loadNormals from '../shared/loadNormals.glsl';

export default `precision highp float;

${commonUniforms}

void main(void)
{
${computeVertexPosition}
${loadNormals}
    // simplified lambert shading that makes assumptions for ambient color
    vec3 diffuse = uLightColor.rgb * uLightColor.a;
    vec4 diffuseColor = texture2D(uSampler, texCoord);
    vec3 finalColor = diffuseColor.rgb * diffuse;
    
    gl_FragColor = vec4(finalColor, diffuseColor.a);
}
`;