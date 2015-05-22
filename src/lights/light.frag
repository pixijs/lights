precision lowp float;

#pragma glslify: import("./shared/commonUniforms.glsl");

void main(void){
#pragma glslify: import("./shared/loadColors.glsl");

    // this shader should always be overriden by a specific light type...
    gl_FragColor = vec4(mix(diffuseColor.rgb, normalColor.rgb, 0.5), diffuseColor.a);
}
