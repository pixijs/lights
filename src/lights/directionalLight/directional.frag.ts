import { combine, commonUniforms, computeDiffuse, computeVertexPosition, loadNormals } from '../shared';

export default `precision highp float;

// imports the common uniforms like samplers, and ambient/light color
${commonUniforms}

uniform vec2 uLightDirection;

void main()
{
${computeVertexPosition}
${loadNormals}

    // the directional vector of the light
    vec3 lightVector = vec3(uLightDirection, uLightHeight);

    // compute Distance
    float D = length(lightVector);

${computeDiffuse}

    // calculate attenuation
    float attenuation = 1.0;

${combine}
}
`;
