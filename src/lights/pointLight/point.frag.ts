import commonUniforms from '../shared/commonUniforms.glsl';
import computeVertexPosition from '../shared/computeVertexPosition.glsl';
import loadNormals from '../shared/loadNormals.glsl';
import computeDiffuse from '../shared/computeDiffuse.glsl';
import combine from '../shared/combine.glsl';

export default `precision highp float;

// imports the common uniforms like samplers, and ambient color
${commonUniforms}

uniform float uLightRadius;

void main()
{
${computeVertexPosition}
${loadNormals}

    vec2 lightPosition = translationMatrix[2].xy / uViewSize;

    // the directional vector of the light
    vec3 lightVector = vec3(lightPosition - texCoord, uLightHeight);

    // correct for aspect ratio
    lightVector.x *= uViewSize.x / uViewSize.y;

    // compute Distance
    float D = length(lightVector);

    // bail out early when pixel outside of light sphere
    if (D > uLightRadius) discard;

${computeDiffuse}

    // calculate attenuation
    float attenuation = 1.0 / (uLightFalloff.x + (uLightFalloff.y * D) + (uLightFalloff.z * D * D));

${combine}
}
`;
