uniform sampler2D uSampler;
uniform sampler2D uNormalSampler;

uniform mat3 translationMatrix;

uniform float alpha;

uniform vec2 uViewSize;

uniform vec4 uAmbientColor; // ambient color, alpha channel used for intensity.

uniform vec2 uLightPosition;// light position, normalized to viewport.
uniform vec4 uLightColor;   // light color, alpha channel used for intensity.
uniform vec3 uLightFalloff; // light falloff attenuation coefficients.
