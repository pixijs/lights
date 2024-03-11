/*!
 * @pixi/lights - v4.1.0
 * Compiled Mon, 11 Mar 2024 15:17:16 UTC
 *
 * @pixi/lights is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2024, Ivan Popelyshev, All Rights Reserved
 */this.PIXI=this.PIXI||{},this.PIXI.lights=function(u,s,b,m){"use strict";function $(r,t=40,e,i){e=e||new Float32Array((t+1)*2),i=i||new Uint16Array(t+1);const a=Math.PI*2/t;let o=-1;i[++o]=o;for(let n=0;n<=t;++n){const c=n*2,R=a*n;e[c]=Math.cos(R)*r.radius,e[c+1]=Math.sin(R)*r.radius,i[++o]=o}return i[o]=1,{vertices:e,indices:i}}const g=new m.Group(0,!1),p=new m.Group(0,!1),P=new m.Group(0,!1);g.useRenderTexture=!0,p.useRenderTexture=!0;const T=class{constructor(){this.lastLayer=null,this.diffuseTexture=null,this.normalTexture=null}check(t){if(this.lastLayer===t)return;this.lastLayer=t;const e=t._activeStageParent,i=t;if(this.diffuseTexture=s.Texture.WHITE,this.normalTexture=s.Texture.WHITE,i.diffuseTexture&&i.normalTexture)this.diffuseTexture=i.diffuseTexture,this.normalTexture=i.normalTexture;else for(let a=0;a<e._activeLayers.length;a++){const o=e._activeLayers[a];o.group===p&&(this.normalTexture=o.getRenderTexture()),o.group===g&&(this.diffuseTexture=o.getRenderTexture())}}};let h=T;h._instance=new T;const V=class extends s.Quad{update(t){const e=this.buffers[0].data,i=t.x,a=t.y,o=t.x+t.width,n=t.y+t.height;(e[0]!==i||e[1]!==a||e[4]!==o||e[5]!==n)&&(e[0]=e[6]=i,e[1]=e[3]=a,e[2]=e[4]=o,e[5]=e[7]=n,this.buffers[0].update())}};let x=V;x._instance=new V;class f extends b.Mesh{constructor(t=5066073,e=.8,i,a,o){super(a?new s.Geometry().addAttribute("aVertexPosition",a).addIndex(o):x._instance,i),this.shaderName=null,this.lastLayer=null,this.blendMode=s.BLEND_MODES.ADD;const n=!a;this.drawMode=n?s.DRAW_MODES.TRIANGLE_STRIP:s.DRAW_MODES.TRIANGLES,this.lightHeight=.075,this.falloff=[.75,3,20],this.useViewportQuad=n,this.tint=t!=null?t:5066073,this.brightness=e,this.parentGroup=P}get color(){return this.tint}set color(t){this.tint=t}get falloff(){return this.material.uniforms.uLightFalloff}set falloff(t){this.material.uniforms.uLightFalloff[0]=t[0],this.material.uniforms.uLightFalloff[1]=t[1],this.material.uniforms.uLightFalloff[2]=t[2]}syncShader(t){const{uniforms:e}=this.shader;e.uViewSize[0]=t.screen.width,e.uViewSize[1]=t.screen.height,e.uViewPixels[0]=t.view.width,e.uViewPixels[1]=t.view.height,e.uFlipY=!t.framebuffer.current,e.uSampler=h._instance.diffuseTexture,e.uNormalSampler=h._instance.normalTexture,e.uUseViewportQuad=this.useViewportQuad,e.uBrightness=this.brightness}_renderDefault(t){if(!this._activeParentLayer)return;h._instance.check(this._activeParentLayer);const e=this.shader;e.alpha=this.worldAlpha,e.update&&e.update(),t.batch.flush(),e.uniforms.translationMatrix=this.transform.worldTransform.toArray(!0),this.useViewportQuad&&this.geometry.update(t.screen),this.syncShader(t),t.shader.bind(e),t.state.set(this.state),t.geometry.bind(this.geometry,e),t.geometry.draw(this.drawMode,this.size,this.start,this.geometry.instanceCount)}}const D=`vec3 intensity = diffuse * attenuation;
vec4 diffuseColor = texture2D(uSampler, texCoord);
vec3 finalColor = diffuseColor.rgb * intensity;

gl_FragColor = vec4(finalColor, diffuseColor.a);
`,w=`uniform sampler2D uSampler;
uniform sampler2D uNormalSampler;

uniform mat3 translationMatrix;

uniform vec2 uViewPixels;   // size of the viewport, in pixels
uniform vec2 uViewSize;     // size of the viewport, in CSS

uniform vec4 uColor;   // light color, alpha channel used for intensity.
uniform float uBrightness;
uniform vec3 uLightFalloff; // light attenuation coefficients (constant, linear, quadratic)
uniform float uLightHeight; // light height above the viewport
uniform float uFlipY;             // whether we use renderTexture, FBO is flipped
`,C=`// normalize vectors
vec3 N = normalize(normalColor.xyz * 2.0 - 1.0);
vec3 L = normalize(lightVector);

// pre-multiply light color with intensity
// then perform "N dot L" to determine our diffuse
vec3 diffuse = uColor.rgb * uBrightness * max(dot(N, L), 0.0);
`,y=`vec2 texCoord = gl_FragCoord.xy / uViewPixels;
texCoord.y = (1.0 - texCoord.y) * uFlipY + texCoord.y * (1.0 - uFlipY); // FBOs positions are flipped.
`,v=`vec4 normalColor = texture2D(uNormalSampler, texCoord);
normalColor.g = 1.0 - normalColor.g; // Green layer is flipped Y coords.

// bail out early when normal has no data
if (normalColor.a == 0.0) discard;
`,N=`attribute vec2 aVertexPosition;

uniform bool uUseViewportQuad;
uniform mat3 translationMatrix;
uniform mat3 projectionMatrix;

void main(void) {
    if (uUseViewportQuad) {
        gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    }
    else
    {
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    }
}
`;var O=Object.defineProperty,z=Object.defineProperties,G=Object.getOwnPropertyDescriptors,_=Object.getOwnPropertySymbols,E=Object.prototype.hasOwnProperty,j=Object.prototype.propertyIsEnumerable,F=(r,t,e)=>t in r?O(r,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):r[t]=e,Q=(r,t)=>{for(var e in t||(t={}))E.call(t,e)&&F(r,e,t[e]);if(_)for(var e of _(t))j.call(t,e)&&F(r,e,t[e]);return r},H=(r,t)=>z(r,G(t));class l extends b.MeshMaterial{constructor(t){const e={translationMatrix:s.Matrix.IDENTITY.toArray(!0),uNormalSampler:s.Texture.WHITE,uViewSize:new Float32Array(2),uViewPixels:new Float32Array(2),uLightFalloff:new Float32Array([0,0,0]),uLightHeight:.075,uBrightness:1,uUseViewportQuad:!0};Object.assign(e,t==null?void 0:t.uniforms),super(s.Texture.WHITE,H(Q({},t),{uniforms:e}))}}l.defaultVertexSrc=N;const B=`precision highp float;

${w}

void main(void)
{
${y}
${v}
    // simplified lambert shading that makes assumptions for ambient color
    vec3 diffuse = uColor.rgb * uBrightness;
    vec4 diffuseColor = texture2D(uSampler, texCoord);
    vec3 finalColor = diffuseColor.rgb * diffuse;

    gl_FragColor = vec4(finalColor, diffuseColor.a);
}
`,M=class extends l{constructor(){super({program:M._program})}};let L=M;L._program=new s.Program(l.defaultVertexSrc,B);class W extends f{constructor(t=16777215,e=.5){super(t,e,new L)}}const U=`precision highp float;

// imports the common uniforms like samplers, and ambient color
${w}

uniform float uLightRadius;

void main()
{
${y}
${v}

    vec2 lightPosition = translationMatrix[2].xy / uViewSize;

    // the directional vector of the light
    vec3 lightVector = vec3(lightPosition - texCoord, uLightHeight);

    // correct for aspect ratio
    lightVector.x *= uViewSize.x / uViewSize.y;

    // compute Distance
    float D = length(lightVector);

    // bail out early when pixel outside of light sphere
    if (D > uLightRadius) discard;

${C}

    // calculate attenuation
    float attenuation = 1.0 / (uLightFalloff.x + (uLightFalloff.y * D) + (uLightFalloff.z * D * D));

${D}
}
`,I=class extends l{constructor(){super({program:I._program,uniforms:{uLightRadius:1}})}};let d=I;d._program=new s.Program(l.defaultVertexSrc,U);class X extends f{constructor(t=16777215,e=1,i=1/0){if(i!==1/0){const a=new s.Circle(0,0,i),{vertices:o,indices:n}=$(a);super(t,e,new d,o,n),this.drawMode=s.DRAW_MODES.TRIANGLE_FAN}else super(t,e,new d);this.shaderName="pointLightShader",this.radius=i}get radius(){return this.material.uniforms.uLightRadius}set radius(t){this.material.uniforms.uLightRadius=t}}const Y=`precision highp float;

// imports the common uniforms like samplers, and ambient/light color
${w}

uniform vec2 uLightDirection;

void main()
{
${y}
${v}

    // the directional vector of the light
    vec3 lightVector = vec3(uLightDirection, uLightHeight);

    // compute Distance
    float D = length(lightVector);

${C}

    // calculate attenuation
    float attenuation = 1.0;

${D}
}
`,A=class extends l{constructor(){super({program:A._program,uniforms:{uLightRadius:1,uLightDirection:new s.Point}})}};let S=A;S._program=new s.Program(l.defaultVertexSrc,Y);class k extends f{constructor(t=16777215,e=1,i){super(t,e,new S),this.target=i}syncShader(t){super.syncShader(t);const e=this.material.uniforms.uLightDirection,i=this.worldTransform,a=this.target.worldTransform;let o,n;a?(o=a.tx,n=a.ty):(o=this.target.x,n=this.target.y),e.x=i.tx-o,e.y=i.ty-n;const c=Math.sqrt(e.x*e.x+e.y*e.y);e.x/=c,e.y/=c}}return u.AmbientLight=W,u.AmbientLightShader=L,u.DirectionalLight=k,u.DirectionalLightShader=S,u.LayerFinder=h,u.Light=f,u.LightShader=l,u.PointLight=X,u.PointLightShader=d,u.ViewportQuad=x,u.diffuseGroup=g,u.lightGroup=P,u.normalGroup=p,u}({},PIXI,PIXI,PIXI.layers);
//# sourceMappingURL=pixi-lights.js.map
