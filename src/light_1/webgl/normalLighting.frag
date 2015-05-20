#ifdef GL_ES
precision mediump float;
#endif

//fixed number of lights
#define N_LIGHTS 2

//attributes from vertex shader
varying vec2 vTextureCoord;
varying vec4 vColor;

//our texture samplers
uniform sampler2D uSampler;     //diffuse map
uniform sampler2D uNormalMap;   //normal map

//values used for shading algorithm...
uniform vec2 Resolution;        //resolution of canvas
uniform vec4 AmbientColor;      //ambient RGBA -- alpha is intensity 

uniform vec3 LightPos[N_LIGHTS];     //light position, normalized
uniform vec4 LightColor[N_LIGHTS];   //light RGBA -- alpha is intensity
uniform vec3 Falloff[N_LIGHTS];      //attenuation coefficients

// uniform float Test[2];

void main() {
	//RGBA of our diffuse color
	vec4 DiffuseColor = texture2D(u_texture0, vTextureCoord);
	
	//RGB of our normal map
	vec3 NormalMap = texture2D(u_normals, vTextureCoord).rgb;
	
	vec3 Sum = vec3(0.0);

	for (int i=0; i<N_LIGHTS; i++) {
		//The delta position of light
		vec3 LightDir = vec3(LightPos[i].xy - (gl_FragCoord.xy / Resolution.xy), LightPos[i].z);
		
		//Correct for aspect ratio
		LightDir.x *= Resolution.x / Resolution.y;
		
		//Determine distance (used for attenuation) BEFORE we normalize our LightDir
		float D = length(LightDir);
		
		//normalize our vectors
		vec3 N = normalize(NormalMap * 2.0 - 1.0);
		vec3 L = normalize(LightDir);
		
		//Some normal maps may need to be inverted like so:
		// N.y = 1.0 - N.y;

		//Pre-multiply light color with intensity
		//Then perform "N dot L" to determine our diffuse term
		vec3 Diffuse = (LightColor[i].rgb * LightColor[i].a) * max(dot(N, L), 0.0);

		//pre-multiply ambient color with intensity
		vec3 Ambient = AmbientColor.rgb * AmbientColor.a;
		
		//calculate attenuation
		float Attenuation = 1.0 / ( Falloff[i].x + (Falloff[i].y*D) + (Falloff[i].z*D*D) );
		
		//the calculation which brings it all together
		vec3 Intensity = Ambient + Diffuse * Attenuation;
		vec3 FinalColor = DiffuseColor.rgb * Intensity;

		Sum += FinalColor;
	}

	gl_FragColor = vColor * vec4(Sum, DiffuseColor.a);
}