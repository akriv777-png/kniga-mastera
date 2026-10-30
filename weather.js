'use strict';{
/* ===== Живая погода: климат × сезон, марковские переходы по игровому времени, эффекты, оверлей ===== */
const ST={clear:['☀','Ясно'],cloud:['⛅','Облачно'],rain:['🌧','Дождь'],storm:['⛈','Гроза'],fog:['🌫','Туман'],snow:['❄','Снег'],bliz:['🌨','Метель'],wind:['🌬','Сильный ветер'],heat:['🔥','Зной']};
const EFF={clear:'Без помех. Видимость отличная.',cloud:'Без помех. Ночью темнее обычного (тусклый свет).',rain:'Слабая видимость: помеха на Внимательность (зрение и слух). Костры гаснут, следы смываются. Путь −25 %.',storm:'Сильный ливень и ветер: помеха на Внимательность и дальнобойные атаки; молнии! Путь −50 %, разумно переждать.',fog:'Видимость 20 м — местность слабо заслонена; дальше — сильно заслонена. Легко заблудиться: Выживание СЛ 15.',snow:'Труднопроходимая местность. Путь −50 %. Следы видно отчётливо (Выживание с преимуществом).',bliz:'Видимость 10 м, сильный холод: каждый час спасбросок ТЕЛ СЛ 10 или 1 уровень истощения без тёплой одежды. Путь −75 %.',wind:'Помеха на дальнобойные атаки оружием, гаснет открытое пламя, полёт затруднён. Туман рассеивается.',heat:'Без воды: каждый час спасбросок ТЕЛ СЛ 5 (+1 за час), провал — истощение. Тяжёлые доспехи — помеха.'};
const CL={temp:['Умеренный',[[8,18],[2,9],[-6,2],[10,20]]],north:['Северный',[[2,10],[-8,0],[-25,-10],[-2,6]]],desert:['Пустыня',[[22,34],[30,45],[8,20],[18,30]]],trop:['Тропики',[[24,31],[26,34],[22,28],[25,32]]],mount:['Горы',[[0,10],[6,16],[-18,-5],[-2,8]]],coast:['Побережье',[[9,16],[16,24],[1,8],[8,15]]]};
const SEAS=['Весна','Лето','Зима','Осень'];
// базовые переходы [clear,cloud,rain,storm,fog,snow,bliz,wind,heat]
const K=Object.keys(ST);
function row(o){return K.map(k=>o[k]||0)}
function P(cl,se,cur){const cold=CL[cl][1][se][1]<=1,hot=CL[cl][1][se][0]>=24;let b={clear:4,cloud:3,rain:2,storm:.6,fog:1,wind:1};
 if(cold)b={clear:3,cloud:3,snow:2.5,bliz:.7,fog:1,wind:1.2};if(hot)b={clear:6,cloud:1.5,heat:2.5,wind:.8,storm:.3};if(cl==='trop')b={clear:3,cloud:2,rain:3,storm:1.5,fog:.5};if(cl==='coast')b.fog=(b.fog||0)+1.5,b.wind=(b.wind||0)+1;if(cl==='desert'&&!hot)b={clear:6,cloud:1,wind:1.5};
 const r=row(b);const i=K.indexOf(cur);if(i>=0&&r[i])r[i]*=3.2;/* инерция */ if(cur==='storm')r[K.indexOf('rain')]+=3,r[K.indexOf('cloud')]+=2;if(cur==='rain')r[K.indexOf('cloud')]+=2;if(cur==='bliz')r[K.indexOf('snow')]+=3;return r}
const W=Object.assign({cl:'temp',se:-1,cur:'clear',t:14,wind:8,ov:'',fx:1,last:null,hist:[]},LS.get('wx2',{}));const sv=()=>LS.set('wx2',W);
const season=()=>W.se>=0?W.se:(()=>{try{const m=camp.month;return m<2||m>10?2:m<5?0:m<8?1:3}catch(e){return 1}})();
const pick=r=>{const s=r.reduce((a,b)=>a+b,0);let x=Math.random()*s;for(let i=0;i<r.length;i++){x-=r[i];if(x<=0)return K[i]}return K[0]};
function temp(){const [lo,hi]=CL[W.cl][1][season()];let t=lo+Math.random()*(hi-lo);if(W.cur==='rain'||W.cur==='storm')t-=3;if(W.cur==='heat')t+=6;if(W.cur==='clear')t+=2;let h=0;try{h=(sess.min%1440)/60}catch(e){}t-=(h<6||h>21)?5:0;return Math.round(t)}
function windv(){return Math.round({storm:55,bliz:60,wind:45,rain:18,snow:15,fog:4,heat:8,clear:8,cloud:12}[W.cur]*(.6+Math.random()*.8))}
function step(n=1){for(let i=0;i<n;i++)W.cur=pick(P(W.cl,season(),W.cur));W.t=temp();W.wind=windv();publish()}
function cur(){return W.ov||W.cur}
function text(){const s=ST[cur()];return `${s[0]} ${s[1]}, ${W.t} °C, ветер ${W.wind} км/ч`}
function publish(){try{sess.weather=text();LS.set('sess',sess)}catch(e){}try{camp.wx=text();LS.set('camp',camp)}catch(e){}W.hist.unshift(text());W.hist.length=Math.min(W.hist.length,8);sv();overlay()}
function forecast(){let c=W.cur;const out=[];for(let i=0;i<3;i++){const r=P(W.cl,season(),c);const s=r.reduce((a,b)=>a+b,0);const j=r.indexOf(Math.max(...r));c=K[j];out.push([c,Math.round(r[j]/s*100)])}return out}
/* привязка к игровому времени: шаг каждые 4 часа */
function abs(){try{return sess.day*1440+sess.min}catch(e){return 0}}
function tick(){const a=abs();if(W.last==null){W.last=a;sv();return}const d=a-W.last;if(d>=240){step(Math.min(12,Math.floor(d/240)));W.last=a-(d%240);sv();if(S.sec===0&&!document.querySelector('#sheet.open'))try{KM.go(0)}catch(e){}toast('Погода сменилась: '+text())}else if(d<0){W.last=a;sv()}}
setInterval(tick,1500);
/* лист настроек */
function ui(){const f=forecast();openSheet(`<div class="sb-title">Погода</div><div class="wx-now"><div class="wx-ic">${ST[cur()][0]}</div><div><b>${ST[cur()][1]}${W.ov?' <small>(вручную)</small>':''}</b><span>${W.t} °C · ветер ${W.wind} км/ч · ${SEAS[season()]}, ${CL[W.cl][0].toLowerCase()} климат</span></div></div>
<div class="wx-eff"><b>Что это значит в игре</b><p>${EFF[cur()]}</p></div>
<label class="f">Прогноз (каждые 4 часа)</label><div class="wx-fc">${f.map(([k,p],i)=>`<div><small>+${(i+1)*4} ч</small><i>${ST[k][0]}</i><span>${ST[k][1]}</span><small>${p} %</small></div>`).join('')}</div>
<label class="f">Климат / регион</label><div class="chips">${Object.entries(CL).map(([k,v])=>`<button class="chip${W.cl===k?' on':''}" data-wcl="${k}">${v[0]}</button>`).join('')}</div>
<label class="f">Сезон</label><div class="chips"><button class="chip${W.se<0?' on':''}" data-wse="-1">По календарю</button>${SEAS.map((s,i)=>`<button class="chip${W.se===i?' on':''}" data-wse="${i}">${s}</button>`).join('')}</div>
<label class="f">Задать вручную</label><div class="chips"><button class="chip${!W.ov?' on':''}" data-wov="">Авто</button>${K.map(k=>`<button class="chip${W.ov===k?' on':''}" data-wov="${k}">${ST[k][0]} ${ST[k][1]}</button>`).join('')}</div>
<div class="row" style="margin-top:12px"><button class="btn red grow" id="wxs">⟳ Следующие 4 часа</button><button class="btn grow" id="wxfx">${W.fx?'Эффекты на экране: вкл':'Эффекты на экране: выкл'}</button></div>
${W.hist.length?`<label class="f">Недавно</label><div class="muted" style="font-size:13px;line-height:1.6">${W.hist.slice(1,6).map(esc).join('<br>')}</div>`:''}`,r=>{
 r.querySelectorAll('[data-wcl]').forEach(b=>b.onclick=()=>{W.cl=b.dataset.wcl;step(1);ui()});
 r.querySelectorAll('[data-wse]').forEach(b=>b.onclick=()=>{W.se=+b.dataset.wse;step(1);ui()});
 r.querySelectorAll('[data-wov]').forEach(b=>b.onclick=()=>{W.ov=b.dataset.wov;W.t=temp();W.wind=windv();publish();ui()});
 r.querySelector('#wxs').onclick=()=>{W.last=abs();step(1);ui()};r.querySelector('#wxfx').onclick=()=>{W.fx=W.fx?0:1;sv();overlay();ui()}})}
/* перехват кнопки погоды в Сессии и Календаре */
document.addEventListener('click',e=>{const b=e.target.closest('[data-a=wx],[data-wx]');if(!b||!b.closest('#page'))return;e.stopPropagation();e.preventDefault();ui()},true);
/* ===== оверлей: дождь, снег, туман, молнии ===== */
const cv=document.createElement('canvas');cv.id='wxfx';document.body.append(cv);const g=cv.getContext('2d');let parts=[],raf=0,flash=0,mode='';
const calmM=()=>document.documentElement.classList.contains('calm')||matchMedia('(prefers-reduced-motion: reduce)').matches;
function overlay(){const sec=S.sec;const m=cur();const on=W.fx&&(sec===0||sec===7)&&['rain','storm','snow','bliz','fog','wind'].includes(m)&&!document.hidden;cv.style.display=on?'block':'none';document.body.dataset.wx=on?m:'';if(!on){cancelAnimationFrame(raf);raf=0;return}
 if(mode!==m){mode=m;const n={rain:90,storm:150,snow:70,bliz:160,fog:7,wind:26}[m];parts=Array.from({length:n},()=>np(true))}if(!raf)raf=requestAnimationFrame(draw)}
function np(init){const w=innerWidth,h=innerHeight;return {x:Math.random()*w*1.2-w*.1,y:init?Math.random()*h:-20,v:Math.random()}}
let lt=0;function draw(t){raf=requestAnimationFrame(draw);if(t-lt<33)return;lt=t;const w=cv.width=innerWidth,h=cv.height=innerHeight;g.clearRect(0,0,w,h);const m=mode,c=calmM();const sp=c?.3:1;
 if(m==='rain'||m==='storm'){g.strokeStyle=m==='storm'?'rgba(190,200,230,.42)':'rgba(170,185,215,.32)';g.lineWidth=1.1;g.beginPath();const sl=m==='storm'?5:2;for(const p of parts){const L=12+p.v*14;g.moveTo(p.x,p.y);g.lineTo(p.x-sl,p.y+L);p.y+=(14+p.v*10)*sp;p.x-=sl*.4*sp;if(p.y>h)Object.assign(p,np())}g.stroke();
  if(m==='storm'&&!c){if(Math.random()<.006)flash=1;if(flash>0){g.fillStyle=`rgba(225,230,255,${flash*.35})`;g.fillRect(0,0,w,h);flash-=.12}}}
 else if(m==='snow'||m==='bliz'){g.fillStyle='rgba(240,240,250,.75)';const dx=m==='bliz'?4:.6;for(const p of parts){g.beginPath();g.arc(p.x,p.y,1+p.v*2.2,0,7);g.fill();p.y+=(1+p.v*1.6)*sp*(m==='bliz'?2:1);p.x+=(Math.sin(t/900+p.v*9)*.6+dx)*sp;if(p.y>h||p.x>w+20)Object.assign(p,np(),{x:Math.random()*w-(m==='bliz'?w*.3:0)})}}
 else if(m==='fog'){for(const p of parts){const r=180+p.v*160;const gr=g.createRadialGradient(p.x,p.y,0,p.x,p.y,r);gr.addColorStop(0,'rgba(200,195,190,.16)');gr.addColorStop(1,'rgba(200,195,190,0)');g.fillStyle=gr;g.fillRect(p.x-r,p.y-r,r*2,r*2);p.x+=(.25+p.v*.3)*sp;if(p.x-r>w)p.x=-r}}
 else if(m==='wind'){g.strokeStyle='rgba(220,210,190,.18)';g.lineWidth=1;for(const p of parts){g.beginPath();g.moveTo(p.x,p.y);g.quadraticCurveTo(p.x+30,p.y-6,p.x+70+p.v*40,p.y);g.stroke();p.x+=(9+p.v*8)*sp;if(p.x>w)Object.assign(p,{x:-120,y:Math.random()*h})}}}
document.addEventListener('visibilitychange',overlay);
const og=KM.go;KM.go=function(){const r=og.apply(this,arguments);setTimeout(overlay,50);return r};
if(W.last==null)publish();setTimeout(overlay,600);
try{window.weather=weather=function(){step(6)}}catch(e){}
KM.wx={ui,step,W,text,EFF,forecast,overlay,cur};
}
