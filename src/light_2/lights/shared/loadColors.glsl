//vec4 diffuseColor = texture2D(uSampler, vTextureCoord);
//vec4 normalColor = texture2D(uNormalSampler, vTextureCoord);

vec2 texCoord = gl_FragCoord.xy / uViewSize;

vec4 diffuseColor = texture2D(uSampler, texCoord);
vec4 normalColor = texture2D(uNormalSampler, texCoord);

// if no normal color here, just discard
if (normalColor.a == 0.0) discard;
