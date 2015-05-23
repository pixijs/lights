// compute Distance
float D = length(lightVector);

// normalize vectors
vec3 N = normalize(normalColor.xyz * 2.0 - 1.0);
vec3 L = normalize(lightVector);

// pre-multiply light color with intensity
// then perform "N dot L" to determine our diffuse
vec3 diffuse = (uLightColor.rgb * uLightColor.a) * max(dot(N, L), 0.0);

// pre-multiply ambient color with intensity
//vec3 ambient = uAmbientColor.rgb * uAmbientColor.a;

// calculate attenuation
float attenuation = 1.0 / (uLightFalloff.x + (uLightFalloff.y * D) + (uLightFalloff.z * D * D));

// calculate final intesity and color, then combine
vec3 intensity = /*ambient +*/ diffuse * attenuation;
vec3 finalColor = diffuseColor.rgb * intensity;
