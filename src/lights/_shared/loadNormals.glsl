vec4 normalColor = texture2D(uNormalSampler, texCoord);
normalColor.g = 1.0 - normalColor.g; // Green layer is flipped Y coords.

// bail out early when normal has no data
if (normalColor.a == 0.0) discard;
