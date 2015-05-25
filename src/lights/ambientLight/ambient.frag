precision lowp float;

#pragma glslify: import("../_shared/commonUniforms.glsl");

void main(void)
{
    vec2 texCoord = gl_FragCoord.xy / uViewSize;
    texCoord.y = 1.0 - texCoord.y; // FBOs positions are flipped.

    vec4 normalColor = texture2D(uNormalSampler, texCoord);
    normalColor.g = 1.0 - normalColor.g; // Green layer is flipped Y coords.

    // bail out early when normal has no data
    if (normalColor.a == 0.0) discard;

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
