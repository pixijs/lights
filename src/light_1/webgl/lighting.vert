precision lowp float;

attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aColor;
attribute float aRotation;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;
varying vec4 vColor;
varying float vRotation;

const vec2 center = vec2(-1.0, 1.0);

void main(void) {
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

    vTextureCoord = aTextureCoord;
    vColor = vec4(aColor.rgb * aColor.a, aColor.a);
    vRotation = aRotation;
}
