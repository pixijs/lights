precision lowp float;

// imports the common uniforms like samplers, and ambient color
#pragma glslify: import("../shared/commonUniforms.glsl")

varying vec4 vLightColor;   // light color, alpha channel used for intensity.
varying vec3 vLightPosition;// light position normalized to view size (position / viewport)
varying vec3 vLightFalloff; // light falloff attenuation coefficients

void main()
{
// sets diffuseColor and normalColor from their respective textures
#pragma glslify: import("../shared/loadColors.glsl")

    gl_FragColor = diffuseColor;
}