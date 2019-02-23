uniform sampler2D uSampler;
uniform sampler2D uNormalSampler;

uniform mat3 translationMatrix;

uniform vec2 uViewPixels;   // size of the viewport, in pixels
uniform vec2 uViewSize;     // size of the viewport, in CSS

uniform vec4 uLightColor;   // light color, alpha channel used for intensity.
uniform vec3 uLightFalloff; // light attenuation coefficients (constant, linear, quadratic)
uniform float uLightHeight; // light height above the viewport
uniform float uFlipY;             // whether we use renderTexture, FBO is flipped
