vec2 textureCoord = gl_FragCoord.xy / uViewSize;

vec4 diffuseColor = texture2D(uSampler, textureCoord);
vec4 normalColor = texture2D(uNormalSampler, textureCoord);

// if no normal color here, just discard
//if (normalColor.a == 0.0) discard;
