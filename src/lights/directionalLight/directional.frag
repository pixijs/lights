precision lowp float;

// imports the common uniforms like samplers, and ambient/light color
#pragma glslify: import("../_shared/commonUniforms.glsl")

uniform vec2 uLightDirection;

void main()
{
#pragma glslify: import("../_shared/computeVertexPosition.glsl");
#pragma glslify: import("../_shared/loadNormals.glsl");

    // the directional vector of the light
    vec3 lightVector = vec3(uLightDirection, uLightHeight);

    // compute Distance
    float D = length(lightVector);

#pragma glslify: import("../_shared/computeDiffuse.glsl");

    // calculate attenuation
    float attenuation = 1.0;

#pragma glslify: import("../_shared/combine.glsl");
}
