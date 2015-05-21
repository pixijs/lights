precision lowp float;

attribute vec2 aVertexPosition;
attribute vec4 aLightColor;
attribute vec3 aLightPosition;
attribute vec3 aLightFalloff;

uniform mat3 projectionMatrix;

varying vec4 vLightColor;
varying vec3 vLightPosition;
varying vec3 vLightFalloff;

void main(void) {
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

    vLightColor = aLightColor;
    vLightPosition = aLightPosition;
    vLightFalloff = aLightFalloff;
}
