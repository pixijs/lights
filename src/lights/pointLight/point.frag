precision lowp float;

// imports the common uniforms like samplers, and ambient color
#pragma glslify: import("../_shared/commonUniforms.glsl");

uniform float uLightRadius;

void main()
{
    vec2 texCoord = gl_FragCoord.xy / uViewSize;
    texCoord.y = 1.0 - texCoord.y; // FBOs positions are flipped.

    vec4 normalColor = texture2D(uNormalSampler, texCoord);
    normalColor.g = 1.0 - normalColor.g; // Green layer is flipped Y coords.

    // bail out early when normal has no data
    if (normalColor.a == 0.0) discard;

    vec2 lightPosition = translationMatrix[2].xy / uViewSize;

    // the directional vector of the light
    vec3 lightVector = vec3(lightPosition - texCoord, uLightHeight);

    // correct for aspect ratio
    lightVector.x *= uViewSize.x / uViewSize.y;

    // compute Distance
    float D = length(lightVector);

    // bail out early when pixel outside of light sphere
    if (D > uLightRadius) discard;

    // normalize vectors
    vec3 N = normalize(normalColor.xyz * 2.0 - 1.0);
    vec3 L = normalize(lightVector);
    
    // pre-multiply light color with intensity
    // then perform "N dot L" to determine our diffuse
    vec3 diffuse = (uLightColor.rgb * uLightColor.a) * max(dot(N, L), 0.0);

    // calculate attenuation
    float attenuation = 1.0 / (uLightFalloff.x + (uLightFalloff.y * D) + (uLightFalloff.z * D * D));
    
    // calculate final intesity and color, then combine
    vec3 intensity = diffuse * attenuation;
    vec4 diffuseColor = texture2D(uSampler, texCoord);
    vec3 finalColor = diffuseColor.rgb * intensity;

    gl_FragColor = vec4(finalColor, diffuseColor.a);
}