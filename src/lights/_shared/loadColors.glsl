vec2 texCoord = gl_FragCoord.xy / uViewSize;
texCoord.y = 1.0 - texCoord.y; // FBOs are flipped.

vec4 diffuseColor = texture2D(uSampler, texCoord);
vec4 normalColor = texture2D(uNormalSampler, texCoord);

// if no normal color here, just discard
if (normalColor.a == 0.0) discard;
