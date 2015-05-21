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

    // the directional vector of the light
    vec3 lightVector = vec3(vLightPosition.xy - textureCoord, vLightPosition.z);

    // correct for aspect ratio
    lightVector.x *= uViewSize.x / uViewSize.y;

// does lambertian illumination calculations and sets "finalColor"
#pragma glslify: import("../shared/computeLambert.glsl")

    gl_FragColor = vec4(finalColor, diffuseColor.a);
}