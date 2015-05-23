precision lowp float;

#pragma glslify: import("../_shared/commonUniforms.glsl");

void main(void)
{
#pragma glslify: import("../_shared/loadColors.glsl");

    // simplified lambert shading that makes assumptions for ambient color

    // compute Distance
//    float D = length(lightVector);
    float D = 1.0;
    
    // normalize vectors
    vec3 N = normalize(normalColor.xyz * 2.0 - 1.0);
//    vec3 L = normalize(lightVector);
    vec3 L = vec3(1.0, 1.0, 1.0);
    
    // pre-multiply light color with intensity
    // then perform "N dot L" to determine our diffuse
    vec3 diffuse = (uLightColor.rgb * uLightColor.a) * max(dot(N, L), 0.0);
    
    // pre-multiply ambient color with intensity
//    vec3 ambient = uAmbientColor.rgb * uAmbientColor.a;
    
    // calculate attenuation
//    float attenuation = 1.0 / (uLightFalloff.x + (uLightFalloff.y * D) + (uLightFalloff.z * D * D));
    
    // calculate final intesity and color, then combine
//    vec3 intensity = ambient + diffuse * attenuation;
//    vec3 finalColor = diffuseColor.rgb * intensity;
    vec3 finalColor = diffuseColor.rgb * diffuse;

    // calculate just ambient light color, most lights will override this frag
//    vec3 ambientColor = uLightColor.rgb * uLightColor.a;
//    gl_FragColor = vec4(diffuseColor.rgb * ambientColor, diffuseColor.a);
    gl_FragColor = vec4(finalColor, diffuseColor.a);
}
