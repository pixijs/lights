precision lowp float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D uNormalSampler;

uniform vec2 uViewSize;

uniform vec4 uAmbientColor; // ambient color, alpha channel used for intensity.
uniform vec4 uLightColor;   // light color, alpha channel used for intensity.
uniform vec3 uLightPosition;// light position normalized to view size (position / viewport)
uniform vec3 uLightFalloff; // light falloff attenuation coefficients

void main()
{
// sets diffuseColor and normalColor from their respective textures
#pragma glslify: import("../shared/loadColors.glsl");

    // the directional vector of the light
    vec3 lightVector = vec3(uLightPosition.xy - (gl_FragCoord.xy / uViewSize), uLightPosition.z);

    // correct for aspect ratio
    lightVector.x *= Resolution.x / Resolution.y;

// does lambertian illumination calculations and sets "finalColor"
#pragma glslify: import("../shared/computeLambert.glsl")

    gl_FragColor = vec4(finalColor, diffuseColor.a);
}