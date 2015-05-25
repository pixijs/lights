// calculate final intesity and color, then combine
vec3 intensity = diffuse * attenuation;
vec4 diffuseColor = texture2D(uSampler, texCoord);
vec3 finalColor = diffuseColor.rgb * intensity;

gl_FragColor = vec4(finalColor, diffuseColor.a);
