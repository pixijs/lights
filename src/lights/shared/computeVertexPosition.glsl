vec2 texCoord = gl_FragCoord.xy / uViewSize;
texCoord.y = 1.0 - texCoord.y; // FBOs positions are flipped.
