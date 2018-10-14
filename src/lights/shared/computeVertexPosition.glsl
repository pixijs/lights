vec2 texCoord = gl_FragCoord.xy / uViewSize;
texCoord.y = (1.0 - texCoord.y) * uFlipY + texCoord.y * (1.0 - uFlipY); // FBOs positions are flipped.
