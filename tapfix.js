/* tapfix.js — надёжные тапы на iPhone: если клик «проглочен» (перерисовка, слой поверх, iOS hover), дожимаем его сами */
(function(){if(window.__tapfix)return;window.__tapfix=1;
const SEL='button,a[href],summary,label,select,.btn,.chip,[data-t],[data-tab],[role=button],[onclick],[data-go],[data-sec]';
const sig=el=>{if(!el)return'';let s=el.tagName+'|'+(el.id||'')+'|'+(el.className||'')+'|'+(el.textContent||'').trim().slice(0,40);for(const a of el.attributes||[])if(a.name.startsWith('data-'))s+='|'+a.name+'='+a.value;return s};
let st=null,clicked=0;
let synth=null;document.addEventListener('click',e=>{if(synth&&e.isTrusted&&Date.now()-synth.t<900&&(e.target===synth.el||synth.el.contains(e.target))){e.stopPropagation();e.preventDefault();synth=null;return}clicked=Date.now()},true);
document.addEventListener('touchstart',e=>{if(e.touches.length!==1){st=null;return}const t=e.touches[0];const el=e.target.closest&&e.target.closest(SEL);if(!el||el.closest('input,textarea,[contenteditable],canvas,.map-wrap,#pmap,.no-tapfix')){st=null;return}st={x:t.clientX,y:t.clientY,t:Date.now(),el,sig:sig(el)}},{passive:true,capture:true});
document.addEventListener('touchmove',e=>{if(!st)return;const t=e.touches[0];if(Math.hypot(t.clientX-st.x,t.clientY-st.y)>10)st=null},{passive:true,capture:true});
document.addEventListener('touchcancel',()=>{st=null},{passive:true,capture:true});
document.addEventListener('touchend',e=>{const s=st;st=null;if(!s||Date.now()-s.t>700)return;const t0=Date.now();
 setTimeout(()=>{if(clicked>=t0)return;let el=s.el;if(!el.isConnected){const at=document.elementFromPoint(s.x,s.y);const c=at&&at.closest&&at.closest(SEL);el=c&&sig(c)===s.sig?c:null}
  if(!el||el.disabled||el.tagName==='SELECT'||el.tagName==='SUMMARY'&&false)return;const r=el.getBoundingClientRect();if(r.width===0&&r.height===0)return;synth={el,t:Date.now()};try{el.click()}catch(_){}},450)},{passive:true,capture:true});
})();
