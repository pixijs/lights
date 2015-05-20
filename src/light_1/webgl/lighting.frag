precision lowp float;

varying vec2 vTextureCoord;
varying vec4 vColor;
varying float vRotation;

uniform sampler2D uSampler;     // diffuse texture map
uniform sampler2D uNormalMap;   // normal texture map

uniform vec3 uLightColor;       // directional light color
uniform vec3 uAmbientColor;     // ambient light color

//#define M_PI 3.1415926535897932384626433832795

void main(void) {
    // get the color values from the texture and normalmap
    vec4 clrDiffuse = texture2D(uSampler, vTexureCoord);
    vec3 clrNormal = texture2D(uNormalMap, vTextureCoord).rgb;

    // scale & normalize the normalmap color to get a normal vector for this texel
    vec3 normal = normalize(clrNormal * 2.0 - 1.0);

    float angle = vRotation;

    vec2 rotatedN;
    rotatedN.r = (N.r)*sin(angle) - (N.g)*cos(angle);
    rotatedN.g = (N.r)*cos(angle) + (N.g)*sin(angle);

    normal.r = rotatedN.g;
    normal.g = rotatedN.r;

    normal = (normal + 1.0) / 2.0;

    vec3 finalColor = (uAmbientColor + (uLightColor * normal)) * clrDiffuse.rgb;

    gl_FragColor = vec4(finalColor, clrDiffuse.a);
}