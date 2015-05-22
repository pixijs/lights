/**
 * Don't look at this, it isn't done yet!
 */
 
 
 
 
 
 
 precision lowp float;

// imports the common uniforms like samplers, and ambient/light color
#pragma glslify: import("../shared/commonUniforms.glsl")

uniform vec3 uLightDirection;   // light direction

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
