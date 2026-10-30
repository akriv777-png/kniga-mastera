'use strict';{
/* WebGL: low-res smoky ink fog + drifting embers behind the book. ~0.3 scale, 30 fps cap, paused when hidden. */
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
const cv=document.createElement('canvas');cv.id='glfx';document.body.prepend(cv);
const gl=cv.getContext('webgl',{alpha:true,antialias:false,depth:false,powerPreference:'low-power',premultipliedAlpha:false});
if(gl){const vs='attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}';
const fs=`precision mediump float;uniform vec2 r;uniform float t;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
float fb(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){vec2 uv=gl_FragCoord.xy/r;vec2 q=uv*vec2(r.x/r.y,1.)*2.2;
float f=fb(q+vec2(t*.03,-t*.05)+fb(q*1.3-t*.02));
vec3 smoke=mix(vec3(.05,.025,.02),vec3(.28,.07,.05),smoothstep(.45,.85,f));
float a=smoothstep(.35,.9,f)*.55*(1.-uv.y*.6);
vec2 g=uv*vec2(r.x/r.y,1.)*vec2(18.,9.);g.y-=t*.35;vec2 c=floor(g);vec2 fr=fract(g)-.5;float e=h(c);
fr.x+=sin(t*.8+e*20.)*.25;float em=step(.93,e)*smoothstep(.12,.0,length(fr))*(.5+.5*sin(t*3.+e*40.));
gl_FragColor=vec4(smoke+vec3(1.,.55,.2)*em,a+em*.9);}`;
const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o};const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,vs));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);gl.useProgram(pr);
const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);const pl=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(pl);gl.vertexAttribPointer(pl,2,gl.FLOAT,false,0,0);
const ur=gl.getUniformLocation(pr,'r'),ut=gl.getUniformLocation(pr,'t');gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
const S=.3;const size=()=>{cv.width=Math.max(64,innerWidth*S|0);cv.height=Math.max(64,innerHeight*S|0);gl.viewport(0,0,cv.width,cv.height);gl.uniform2f(ur,cv.width,cv.height)};size();let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(size,200)});
let last=0;const t0=performance.now();const off=()=>document.hidden||document.documentElement.classList.contains('paused')||document.documentElement.classList.contains('lowfx')||(KM.settings&&KM.settings.fx===false)||!!document.querySelector('.show#sheet,#sheet.show')||!document.querySelector('#cover.gone')||!!document.getElementById('mc');
(function loop(now){requestAnimationFrame(loop);if(now-last<33||off())return;last=now;gl.uniform1f(ut,(now-t0)/1000);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,3)})(0);
KM.gl=true}}}
