/*!
 * @pixi/lights - v4.1.0
 * Compiled Mon, 11 Mar 2024 15:17:16 UTC
 *
 * @pixi/lights is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2024, Ivan Popelyshev, All Rights Reserved
 */import{Texture as h,Quad as z,Geometry as R,BLEND_MODES as O,DRAW_MODES as d,Matrix as I,Program as m,Circle as E,Point as j}from"@pixi/core";import{Mesh as G,MeshMaterial as H}from"@pixi/mesh";import{Group as g}from"@pixi/layers";function Q(r,t=40,e,i){e=e||new Float32Array((t+1)*2),i=i||new Uint16Array(t+1);const a=Math.PI*2/t;let o=-1;i[++o]=o;for(let s=0;s<=t;++s){const l=s*2,V=a*s;e[l]=Math.cos(V)*r.radius,e[l+1]=Math.sin(V)*r.radius,i[++o]=o}return i[o]=1,{vertices:e,indices:i}}const p=new g(0,!1),x=new g(0,!1),C=new g(0,!1);p.useRenderTexture=!0,x.useRenderTexture=!0;const T=class{constructor(){this.lastLayer=null,this.diffuseTexture=null,this.normalTexture=null}check(t){if(this.lastLayer===t)return;this.lastLayer=t;const e=t._activeStageParent,i=t;if(this.diffuseTexture=h.WHITE,this.normalTexture=h.WHITE,i.diffuseTexture&&i.normalTexture)this.diffuseTexture=i.diffuseTexture,this.normalTexture=i.normalTexture;else for(let a=0;a<e._activeLayers.length;a++){const o=e._activeLayers[a];o.group===x&&(this.normalTexture=o.getRenderTexture()),o.group===p&&(this.diffuseTexture=o.getRenderTexture())}}};let u=T;u._instance=new T;const D=class extends z{update(t){const e=this.buffers[0].data,i=t.x,a=t.y,o=t.x+t.width,s=t.y+t.height;(e[0]!==i||e[1]!==a||e[4]!==o||e[5]!==s)&&(e[0]=e[6]=i,e[1]=e[3]=a,e[2]=e[4]=o,e[5]=e[7]=s,this.buffers[0].update())}};let w=D;w._instance=new D;class c extends G{constructor(t=5066073,e=.8,i,a,o){super(a?new R().addAttribute("aVertexPosition",a).addIndex(o):w._instance,i),this.shaderName=null,this.lastLayer=null,this.blendMode=O.ADD;const s=!a;this.drawMode=s?d.TRIANGLE_STRIP:d.TRIANGLES,this.lightHeight=.075,this.falloff=[.75,3,20],this.useViewportQuad=s,this.tint=t!=null?t:5066073,this.brightness=e,this.parentGroup=C}get color(){return this.tint}set color(t){this.tint=t}get falloff(){return this.material.uniforms.uLightFalloff}set falloff(t){this.material.uniforms.uLightFalloff[0]=t[0],this.material.uniforms.uLightFalloff[1]=t[1],this.material.uniforms.uLightFalloff[2]=t[2]}syncShader(t){const{uniforms:e}=this.shader;e.uViewSize[0]=t.screen.width,e.uViewSize[1]=t.screen.height,e.uViewPixels[0]=t.view.width,e.uViewPixels[1]=t.view.height,e.uFlipY=!t.framebuffer.current,e.uSampler=u._instance.diffuseTexture,e.uNormalSampler=u._instance.normalTexture,e.uUseViewportQuad=this.useViewportQuad,e.uBrightness=this.brightness}_renderDefault(t){if(!this._activeParentLayer)return;u._instance.check(this._activeParentLayer);const e=this.shader;e.alpha=this.worldAlpha,e.update&&e.update(),t.batch.flush(),e.uniforms.translationMatrix=this.transform.worldTransform.toArray(!0),this.useViewportQuad&&this.geometry.update(t.screen),this.syncShader(t),t.shader.bind(e),t.state.set(this.state),t.geometry.bind(this.geometry,e),t.geometry.draw(this.drawMode,this.size,this.start,this.geometry.instanceCount)}}const P=`vec3 intensity = diffuse * attenuation;
vec4 diffuseColor = texture2D(uSampler, texCoord);
vec3 finalColor = diffuseColor.rgb * intensity;

gl_FragColor = vec4(finalColor, diffuseColor.a);
`,y=`uniform sampler2D uSampler;
uniform sampler2D uNormalSampler;

uniform mat3 translationMatrix;

uniform vec2 uViewPixels;   // size of the viewport, in pixels
uniform vec2 uViewSize;     // size of the viewport, in CSS

uniform vec4 uColor;   // light color, alpha channel used for intensity.
uniform float uBrightness;
uniform vec3 uLightFalloff; // light attenuation coefficients (constant, linear, quadratic)
uniform float uLightHeight; // light height above the viewport
uniform float uFlipY;             // whether we use renderTexture, FBO is flipped
`,F=`// normalize vectors
vec3 N = normalize(normalColor.xyz * 2.0 - 1.0);
vec3 L = normalize(lightVector);

// pre-multiply light color with intensity
// then perform "N dot L" to determine our diffuse
vec3 diffuse = uColor.rgb * uBrightness * max(dot(N, L), 0.0);
`,v=`vec2 texCoord = gl_FragCoord.xy / uViewPixels;
texCoord.y = (1.0 - texCoord.y) * uFlipY + texCoord.y * (1.0 - uFlipY); // FBOs positions are flipped.
`,L=`vec4 normalColor = texture2D(uNormalSampler, texCoord);
normalColor.g = 1.0 - normalColor.g; // Green layer is flipped Y coords.

// bail out early when normal has no data
if (normalColor.a == 0.0) discard;
`,B=`attribute vec2 aVertexPosition;

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
`;var U=Object.defineProperty,Y=Object.defineProperties,k=Object.getOwnPropertyDescriptors,_=Object.getOwnPropertySymbols,W=Object.prototype.hasOwnProperty,q=Object.prototype.propertyIsEnumerable,M=(r,t,e)=>t in r?U(r,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):r[t]=e,J=(r,t)=>{for(var e in t||(t={}))W.call(t,e)&&M(r,e,t[e]);if(_)for(var e of _(t))q.call(t,e)&&M(r,e,t[e]);return r},K=(r,t)=>Y(r,k(t));class n extends H{constructor(t){const e={translationMatrix:I.IDENTITY.toArray(!0),uNormalSampler:h.WHITE,uViewSize:new Float32Array(2),uViewPixels:new Float32Array(2),uLightFalloff:new Float32Array([0,0,0]),uLightHeight:.075,uBrightness:1,uUseViewportQuad:!0};Object.assign(e,t==null?void 0:t.uniforms),super(h.WHITE,K(J({},t),{uniforms:e}))}}n.defaultVertexSrc=B;const X=`precision highp float;

${y}

void main(void)
{
${v}
${L}
    // simplified lambert shading that makes assumptions for ambient color
    vec3 diffuse = uColor.rgb * uBrightness;
    vec4 diffuseColor = texture2D(uSampler, texCoord);
    vec3 finalColor = diffuseColor.rgb * diffuse;

    gl_FragColor = vec4(finalColor, diffuseColor.a);
}
`,A=class extends n{constructor(){super({program:A._program})}};let b=A;b._program=new m(n.defaultVertexSrc,X);class Z extends c{constructor(t=16777215,e=.5){super(t,e,new b)}}const ee=`precision highp float;

// imports the common uniforms like samplers, and ambient color
${y}

uniform float uLightRadius;

void main()
{
${v}
${L}

    vec2 lightPosition = translationMatrix[2].xy / uViewSize;

    // the directional vector of the light
    vec3 lightVector = vec3(lightPosition - texCoord, uLightHeight);

    // correct for aspect ratio
    lightVector.x *= uViewSize.x / uViewSize.y;

    // compute Distance
    float D = length(lightVector);

    // bail out early when pixel outside of light sphere
    if (D > uLightRadius) discard;

${F}

    // calculate attenuation
    float attenuation = 1.0 / (uLightFalloff.x + (uLightFalloff.y * D) + (uLightFalloff.z * D * D));

${P}
}
`,$=class extends n{constructor(){super({program:$._program,uniforms:{uLightRadius:1}})}};let f=$;f._program=new m(n.defaultVertexSrc,ee);class te extends c{constructor(t=16777215,e=1,i=1/0){if(i!==1/0){const a=new E(0,0,i),{vertices:o,indices:s}=Q(a);super(t,e,new f,o,s),this.drawMode=d.TRIANGLE_FAN}else super(t,e,new f);this.shaderName="pointLightShader",this.radius=i}get radius(){return this.material.uniforms.uLightRadius}set radius(t){this.material.uniforms.uLightRadius=t}}const ie=`precision highp float;

// imports the common uniforms like samplers, and ambient/light color
${y}

uniform vec2 uLightDirection;

void main()
{
${v}
${L}

    // the directional vector of the light
    vec3 lightVector = vec3(uLightDirection, uLightHeight);

    // compute Distance
    float D = length(lightVector);

${F}

    // calculate attenuation
    float attenuation = 1.0;

${P}
}
`,N=class extends n{constructor(){super({program:N._program,uniforms:{uLightRadius:1,uLightDirection:new j}})}};let S=N;S._program=new m(n.defaultVertexSrc,ie);class re extends c{constructor(t=16777215,e=1,i){super(t,e,new S),this.target=i}syncShader(t){super.syncShader(t);const e=this.material.uniforms.uLightDirection,i=this.worldTransform,a=this.target.worldTransform;let o,s;a?(o=a.tx,s=a.ty):(o=this.target.x,s=this.target.y),e.x=i.tx-o,e.y=i.ty-s;const l=Math.sqrt(e.x*e.x+e.y*e.y);e.x/=l,e.y/=l}}export{Z as AmbientLight,b as AmbientLightShader,re as DirectionalLight,S as DirectionalLightShader,u as LayerFinder,c as Light,n as LightShader,te as PointLight,f as PointLightShader,w as ViewportQuad,p as diffuseGroup,C as lightGroup,x as normalGroup};
//# sourceMappingURL=pixi-lights.mjs.map
