precision lowp float;

// imports the common uniforms like samplers, and ambient color
#pragma glslify: import("../shared/commonUniforms.glsl");

uniform float uLightHeight;

void main()
{
// sets diffuseColor and normalColor from their respective textures
//#pragma glslify: import("../shared/loadColors.glsl")

vec2 texCoord = gl_FragCoord.xy / uViewSize;
texCoord.y = 1.0 - texCoord.y;

vec4 diffuseColor = texture2D(uSampler, texCoord);
vec4 normalColor = texture2D(uNormalSampler, texCoord);

// if no normal color here, just discard
//if (normalColor.a == 0.0) discard;





    vec2 lightPosition = translationMatrix[2].xy / uViewSize;
//    lightPosition.y = 1.0 - lightPosition.y;

    // the directional vector of the light
    vec3 lightVector = vec3(lightPosition - texCoord, uLightHeight);

    // correct for aspect ratio
//    lightVector.x *= uViewSize.x / uViewSize.y;




// does lambertian illumination calculations and sets "finalColor"
//#pragma glslify: import("../shared/computeLambert.glsl")

// compute Distance
float D = length(lightVector);

// normalize vectors
vec3 N = normalize(normalColor.xyz * 2.0 - 1.0);
vec3 L = normalize(lightVector);

// pre-multiply light color with intensity
// then perform "N dot L" to determine our diffuse
vec3 diffuse = (uLightColor.rgb * uLightColor.a) * max(dot(N, L), 0.0);

// pre-multiply ambient color with intensity
vec3 ambient = uAmbientColor.rgb * uAmbientColor.a;

// calculate attenuation
float attenuation = 1.0 / (uLightFalloff.x + (uLightFalloff.y * D) + (uLightFalloff.z * D * D));

// calculate final intesity and color, then combine
vec3 intensity = ambient + diffuse * attenuation;
vec3 finalColor = diffuseColor.rgb * intensity;





    gl_FragColor = vec4(finalColor, diffuseColor.a);
}