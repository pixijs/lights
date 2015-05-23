uniform sampler2D uSampler;
uniform sampler2D uNormalSampler;

uniform mat3 translationMatrix;

uniform vec2 uViewSize;

uniform vec4 uAmbientColor; // ambient color, alpha channel used for intensity.

uniform vec4 uLightColor;   // light color, alpha channel used for intensity.
uniform vec3 uLightFalloff; // light attenuation coefficients (constant, linear, quadratic)
uniform float uLightHeight; // light height above the viewport
