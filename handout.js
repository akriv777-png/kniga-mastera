// Общий рендер раздаток (Книга Мастера + Книга Игрока): пергамент, печать, картинка, полноэкранный просмотр с зумом.
(()=>{const e=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const hash=s=>{let h=7;for(const c of String(s))h=(h*31+c.charCodeAt(0))|0;return Math.abs(h)};
const SEALS=['✶','⚜','☽','✠','❂','♆','⚔','✦'];
function body(h,mini){const sd=hash((h.n||'')+(h.t||'').length),seal=SEALS[sd%SEALS.length],tilt=((sd%5)-2)*.6;
 const txt=e(h.t||'').replace(/\n/g,'<br>');
 return `<div class="hx-p${h.img?' hx-img':''}${mini?' hx-mini':''}" style="--tilt:${tilt}deg">${h.n?`<div class="hx-n">${e(h.n)}</div>`:''}${h.img?`<div class="hx-fr"><img src="${h.img}" alt="" draggable="false"></div>`:''}${h.t?`<div class="hx-t">${txt}</div>`:''}<div class="hx-seal" aria-hidden="true">${seal}</div></div>`}
function open(h){const o=document.createElement('div');o.className='handout hx-o';o.innerHTML=`<div class="hx-z">${body(h)}</div><button class="hx-x" aria-label="Закрыть">✕</button><div class="hx-tip">двойной тап или щипок — масштаб</div>`;document.body.append(o);
 const z=o.querySelector('.hx-z');let s=1,x=0,y=0,P=new Map(),d0=0,s0=1,lx=0,ly=0,moved=0,lastT=0;
 const ap=()=>{z.style.transform=`translate(${x}px,${y}px) scale(${s})`};
 o.addEventListener('pointerdown',ev=>{if(ev.target.closest('.hx-x'))return;o.setPointerCapture?.(ev.pointerId);P.set(ev.pointerId,[ev.clientX,ev.clientY]);moved=0;lx=ev.clientX;ly=ev.clientY;if(P.size===2){const[a,b]=[...P.values()];d0=Math.hypot(a[0]-b[0],a[1]-b[1]);s0=s}});
 o.addEventListener('pointermove',ev=>{if(!P.has(ev.pointerId))return;P.set(ev.pointerId,[ev.clientX,ev.clientY]);if(P.size===2){const[a,b]=[...P.values()];s=Math.min(5,Math.max(1,s0*Math.hypot(a[0]-b[0],a[1]-b[1])/d0));moved=1}else if(s>1){x+=ev.clientX-lx;y+=ev.clientY-ly;moved=1}lx=ev.clientX;ly=ev.clientY;if(s===1){x=0;y=0}ap()});
 const up=ev=>{P.delete(ev.pointerId);if(P.size)return;if(moved)return;const t=Date.now();if(t-lastT<320){s=s>1?1:2.5;if(s===1){x=y=0}z.style.transition='transform .25s';ap();setTimeout(()=>z.style.transition='',260);lastT=0}else{lastT=t;setTimeout(()=>{if(lastT===t&&s===1&&!ev.target.closest('.hx-p'))close()},330)}};
 o.addEventListener('pointerup',up);o.addEventListener('pointercancel',ev=>P.delete(ev.pointerId));
 o.addEventListener('wheel',ev=>{ev.preventDefault();s=Math.min(5,Math.max(1,s*(ev.deltaY<0?1.15:.87)));if(s===1)x=y=0;ap()},{passive:false});
 const close=()=>{o.classList.add('out');setTimeout(()=>o.remove(),250)};o.querySelector('.hx-x').onclick=close;return o}
window.KMH={body,open,card:(h,attr)=>`<div class="hx-card" ${attr||''}>${body(h,1)}</div>`};
const st=document.createElement('style');st.textContent=`
.hx-o{animation:hxf .3s ease;touch-action:none;overflow:hidden;flex-direction:column}
.hx-o.out{opacity:0;transition:opacity .25s}
.hx-z{max-width:100%;max-height:100%;display:flex;align-items:center;justify-content:center;transform-origin:center;will-change:transform}
.hx-p{position:relative;max-width:min(560px,92vw);max-height:84vh;overflow:auto;background:radial-gradient(ellipse at 30% 20%,#f4e7c5 0,#e8d4a4 45%,#d6bb83 85%,#b8975c 100%);color:#2b1a0b;padding:34px 26px 46px;border-radius:3px;box-shadow:inset 0 0 70px rgba(110,70,20,.55),inset 0 0 12px rgba(80,45,10,.5),0 18px 50px rgba(0,0,0,.85);transform:rotate(var(--tilt));animation:hxu .55s cubic-bezier(.2,.8,.2,1);clip-path:polygon(0 1%,4% 0,11% 1.2%,19% .2%,28% 1%,37% 0,48% 1.1%,58% .1%,69% 1%,79% 0,90% 1.2%,100% .3%,99.2% 12%,100% 27%,99.3% 44%,100% 61%,99.1% 78%,100% 99%,90% 98.8%,78% 100%,64% 99%,50% 100%,37% 98.9%,22% 100%,9% 99%,0 100%,.8% 82%,0 63%,.9% 45%,0 28%,.7% 12%)}
.hx-p::before{content:'';position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(90,60,20,.035) 0 2px,transparent 2px 5px),radial-gradient(circle at 80% 85%,rgba(120,70,20,.18),transparent 30%),radial-gradient(circle at 12% 70%,rgba(120,70,20,.12),transparent 22%)}
.hx-n{font:400 26px 'Ruslan Display','Cormorant Garamond',serif;text-align:center;color:#5a1f12;margin-bottom:14px;letter-spacing:.5px;border-bottom:1px solid rgba(90,31,18,.35);padding-bottom:8px}
.hx-t{font:400 22px/1.38 'Marck Script','Cormorant Garamond',serif;white-space:normal;word-wrap:break-word}
.hx-t::first-letter{font:400 46px/1 'Ruslan Display',serif;color:#7a1d10;float:left;margin:2px 6px 0 0}
.hx-fr{padding:8px;background:#3a2412;box-shadow:0 0 0 2px #a87b3e inset,0 6px 18px rgba(0,0,0,.5);margin:0 auto 12px;max-width:100%}
.hx-fr img{display:block;width:100%;height:auto;max-height:62vh;object-fit:contain;filter:sepia(.18) contrast(1.05)}
.hx-seal{position:absolute;right:16px;bottom:10px;width:46px;height:46px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#d2453a,#8e1a12 60%,#5e0d08);color:#f6cbb8;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 3px 6px rgba(0,0,0,.5),inset 0 -3px 6px rgba(0,0,0,.4);transform:rotate(-14deg)}
.hx-x{position:absolute;top:calc(12px + env(safe-area-inset-top));right:14px;width:44px;height:44px;border-radius:50%;border:1px solid #a87b3e;background:rgba(20,12,6,.8);color:#e8c77a;font-size:20px;z-index:2}
.hx-tip{position:absolute;bottom:calc(12px + env(safe-area-inset-bottom));left:0;right:0;text-align:center;color:#a99;font-size:12px;pointer-events:none}
.hx-card{cursor:pointer;margin:8px 0;max-height:220px;overflow:hidden;position:relative;-webkit-mask-image:linear-gradient(#000 75%,transparent)}
.hx-mini{max-width:100%;padding:18px 16px 30px;transform:rotate(0);animation:none}
.hx-mini .hx-n{font-size:19px;margin-bottom:8px}.hx-mini .hx-t{font-size:18px}.hx-mini .hx-t::first-letter{font-size:32px}.hx-mini .hx-seal{width:34px;height:34px;font-size:16px}
.hx-new{animation:hxg 1.6s ease 2}
@keyframes hxf{from{opacity:0}}
@keyframes hxu{from{transform:rotate(var(--tilt)) scaleY(.06);opacity:0}60%{opacity:1}}
@keyframes hxg{50%{filter:drop-shadow(0 0 14px #e8c77a)}}`;document.head.append(st)})();
