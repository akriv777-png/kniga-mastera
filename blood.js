'use strict';
/* ===== Realistic cover blood: viscous drips, detaching drops, splatter, soaking stains ===== */
(function(){const cv=$('#cover');if(!cv||cv.classList.contains('gone'))return;const face=$('.face',cv);
 const C=document.createElement('canvas');C.className='bloodfx';const S=document.createElement('canvas');S.className='bloodfx stain';face.append(S,C);
 const g=C.getContext('2d'),sg=S.getContext('2d');let W,H,dpr;
 function fit(){dpr=Math.min(2,devicePixelRatio||1);W=face.clientWidth;H=face.clientHeight;for(const c of[C,S]){c.width=W*dpr;c.height=H*dpr;c.style.width=W+'px';c.style.height=H+'px'}g.setTransform(dpr,0,0,dpr,0,0);sg.setTransform(dpr,0,0,dpr,0,0)}
 fit();addEventListener('resize',fit);
 const R=Math.random,lerp=(a,b,t)=>a+(b-a)*t;
 const drips=[...Array(12)].map((_,i)=>({x:(i+.5)/15*W+(R()-.5)*16,len:R()*H*.25,w:2+R()*R()*11,v:8+R()*30,visc:.5+R()*.5,bulge:R(),ph:R()*9,max:H*(.25+R()*.55)}));
 const drops=[],spl=[];
 function shade(x0,x1,a=1){const gr=g.createLinearGradient(x0,0,x1,0);gr.addColorStop(0,`rgba(40,0,0,${a})`);gr.addColorStop(.25,`rgba(118,4,2,${a})`);gr.addColorStop(.55,`rgba(72,0,0,${a})`);gr.addColorStop(1,`rgba(18,0,0,${a})`);return gr}
 function drawDrip(d,t){const w=d.w,L=d.len,x=d.x+Math.sin(t/3000+d.ph)*.6;const hr=w*(.75+d.bulge*.75);
  g.beginPath();g.moveTo(x-w*1.6,0);g.bezierCurveTo(x-w*.9,6,x-w*.55,L*.25,x-w*.45,L-hr*1.2);
  g.bezierCurveTo(x-hr*1.15,L-hr*.4,x-hr,L+hr*.9,x,L+hr);g.bezierCurveTo(x+hr,L+hr*.9,x+hr*1.15,L-hr*.4,x+w*.45,L-hr*1.2);
  g.bezierCurveTo(x+w*.55,L*.25,x+w*.9,6,x+w*1.6,0);g.closePath();g.fillStyle=shade(x-hr*1.2,x+hr*1.2);g.fill();
  // specular + subsurface rim
  g.strokeStyle='rgba(255,190,180,.35)';g.lineWidth=Math.max(.6,w*.18);g.beginPath();g.moveTo(x-w*.22,8);g.lineTo(x-w*.18,L-hr*1.3);g.stroke();
  g.fillStyle='rgba(255,230,220,.55)';g.beginPath();g.ellipse(x-hr*.38,L+hr*.05,hr*.18,hr*.35,-.3,0,7);g.fill();
  g.fillStyle='rgba(255,40,20,.12)';g.beginPath();g.ellipse(x+hr*.3,L+hr*.55,hr*.5,hr*.3,0,0,7);g.fill()}
 function drawDrop(p){const r=p.r,st=Math.min(3,1+Math.abs(p.vy)/500);g.save();g.translate(p.x,p.y);g.scale(1/Math.sqrt(st),st);
  g.beginPath();g.moveTo(0,-r*1.4);g.bezierCurveTo(r*.9,-r*.6,r,r,0,r);g.bezierCurveTo(-r,r,-r*.9,-r*.6,0,-r*1.4);g.fillStyle=shade(-r,r);g.fill();
  g.fillStyle='rgba(255,230,220,.6)';g.beginPath();g.ellipse(-r*.35,-r*.1,r*.18,r*.32,-.3,0,7);g.fill();g.restore()}
 function stain(x,y,r,a){const gr=sg.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(70,0,0,${a})`);gr.addColorStop(.6,`rgba(90,4,2,${a*.7})`);gr.addColorStop(1,'rgba(40,0,0,0)');sg.fillStyle=gr;sg.beginPath();sg.arc(x,y,r,0,7);sg.fill()}
 function splat(x,y,r){stain(x,y,r*3,.55);for(let i=0;i<7+R()*8;i++){const a=-Math.PI*R(),s=80+R()*260;spl.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:.6+R()*r*.45,life:1})}}
 // top pooling band
 function pool(t){const gr=g.createLinearGradient(0,0,0,26);gr.addColorStop(0,'rgba(30,0,0,.95)');gr.addColorStop(.6,'rgba(110,4,2,.85)');gr.addColorStop(1,'rgba(90,0,0,0)');g.fillStyle=gr;g.beginPath();g.moveTo(0,0);
  for(let x=0;x<=W;x+=12)g.lineTo(x,10+Math.sin(x*.05+t/1800)*3+Math.sin(x*.13)*4);g.lineTo(W,0);g.fill();
  g.strokeStyle='rgba(255,170,160,.18)';g.lineWidth=1;g.beginPath();for(let x=0;x<=W;x+=12)g.lineTo(x,8+Math.sin(x*.05+t/1800)*3+Math.sin(x*.13)*4);g.stroke()}
 let lt=0,run=true;const still=()=>document.documentElement.classList.contains('calm')||matchMedia('(prefers-reduced-motion: reduce)').matches;
 function frame(t){if(cv.classList.contains('gone')){run=false;return}requestAnimationFrame(frame);let dt=Math.min(.05,(t-lt)/1000||0);lt=t;if(document.hidden)return;if(still())dt=0;
  g.clearRect(0,0,W,H);pool(t);
  for(const d of drips){const n=.6+.8*Math.max(0,Math.sin(t/(900*d.visc)+d.ph));d.len+=d.v*n*dt*(d.len>d.max?.05:1);d.bulge+=dt*(.25+R()*.15)/d.visc;
   if(d.bulge>1.2){d.bulge=.1;drops.push({x:d.x,y:d.len+d.w,vy:20,r:d.w*.9});d.len*=.97;if(R()<.12){d.len=0;d.max=H*(.25+R()*.6);d.v=8+R()*30}}
   drawDrip(d,t)}
  for(let i=drops.length-1;i>=0;i--){const p=drops[i];p.vy+=1500*dt;p.y+=p.vy*dt;g.strokeStyle='rgba(120,5,2,.25)';g.lineWidth=p.r*.5;
   if(p.y>H*(.86+((p.x*7)%10)/100)){splat(p.x,p.y,p.r);drops.splice(i,1)}else drawDrop(p)}
  for(let i=spl.length-1;i>=0;i--){const s=spl[i];s.vy+=900*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt*2.2;if(s.life<=0){stain(s.x,s.y,s.r*2.4,.5);spl.splice(i,1);continue}g.fillStyle=`rgba(130,6,3,${s.life})`;g.beginPath();g.arc(s.x,s.y,s.r,0,7);g.fill()}
  // slow soaking fade of stains
  if((t|0)%60<17){sg.globalCompositeOperation='destination-out';sg.fillStyle='rgba(0,0,0,.004)';sg.fillRect(0,0,W,H);sg.globalCompositeOperation='source-over'}}
 requestAnimationFrame(frame);
 if(still()){for(let i=0;i<40;i++)frame(performance.now()+i*30)}
})();
