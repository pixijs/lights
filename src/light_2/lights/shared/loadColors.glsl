vec4 diffuseColor = texture2D(uSampler, vTextureCoord);
vec4 normalColor = texture2D(uNormalSampler, vTextureCoord);

// if no normal color here, just discard
if (normalColor.a == 0.0) discard;
