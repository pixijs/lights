precision lowp float;

// imports the common uniforms like samplers, and ambient color
#pragma glslify: import("../shared/commonUniforms.glsl")

uniform vec4 uLightColor;       // light color, alpha channel used for intensity.
uniform vec3 uLightDirection;   // light direction
uniform vec3 uLightFalloff;     // light falloff attenuation coefficients

void main()
{
// sets diffuseColor and normalColor from their respective textures
#pragma glslify: import("../shared/loadColors.glsl")

    // the directional vector of the light
    vec3 lightVector = uLightDirection;

// does lambertian illumination calculations and sets "finalColor"
#pragma glslify: import("../shared/computeLambert.glsl")

    gl_FragColor = vec4(finalColor, diffuseColor.a);
}