precision lowp float;

// imports the common uniforms like samplers, and ambient color
#pragma glslify: import("../_shared/commonUniforms.glsl");

uniform float uLightRadius;

void main()
{
#pragma glslify: import("../_shared/computeVertexPosition.glsl");
#pragma glslify: import("../_shared/loadNormals.glsl");

    vec2 lightPosition = translationMatrix[2].xy / uViewSize;

    // the directional vector of the light
    vec3 lightVector = vec3(lightPosition - texCoord, uLightHeight);

    // correct for aspect ratio
    lightVector.x *= uViewSize.x / uViewSize.y;

    // compute Distance
    float D = length(lightVector);

    // bail out early when pixel outside of light sphere
    if (D > uLightRadius) discard;

#pragma glslify: import("../_shared/computeDiffuse.glsl");

    // calculate attenuation
    float attenuation = 1.0 / (uLightFalloff.x + (uLightFalloff.y * D) + (uLightFalloff.z * D * D));

#pragma glslify: import("../_shared/combine.glsl");
}