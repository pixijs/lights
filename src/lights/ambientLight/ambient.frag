precision lowp float;

#pragma glslify: import("../_shared/commonUniforms.glsl");

void main(void)
{
#pragma glslify: import("../_shared/computeVertexPosition.glsl");
#pragma glslify: import("../_shared/loadNormals.glsl");

    // simplified lambert shading that makes assumptions for ambient color

    // compute Distance
    float D = 1.0;
    
    // normalize vectors
    vec3 N = normalize(normalColor.xyz * 2.0 - 1.0);
    vec3 L = vec3(1.0, 1.0, 1.0);
    
    // pre-multiply light color with intensity
    // then perform "N dot L" to determine our diffuse
    vec3 diffuse = (uLightColor.rgb * uLightColor.a) * max(dot(N, L), 0.0);

    vec4 diffuseColor = texture2D(uSampler, texCoord);
    vec3 finalColor = diffuseColor.rgb * diffuse;

    gl_FragColor = vec4(finalColor, diffuseColor.a);
}
