precision lowp float;

attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

void main() {
    // full screen quad proxy to draw upon
    gl_Position = vec4(sign(aVertexPosition.xy), 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}