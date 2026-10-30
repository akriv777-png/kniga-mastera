'use strict';{
/* ===== Вставка кодов: iOS-надёжная вставка, нормализация, кнопка «Вставить» ===== */
const ZW=/[\s\u200B-\u200D\uFEFF\u00A0]+/g;
const normRoom=v=>{v=String(v||'');const m=v.match(/[?&#]room=([A-Za-z0-9]+)/);if(m)v=m[1];return v.replace(/[^A-Za-z0-9]/g,'').toUpperCase().slice(0,12)};
const normHero=v=>{v=String(v||'').replace(ZW,'').replace(/^["'«“]+|["'»”]+$/g,'');v=v.replace(/^kp1[:：]/i,'KP1:');if(!/^KP1:/.test(v)&&/^[A-Za-z0-9+/=_-]{20,}$/.test(v))v='KP1:'+v;return v.replace(/-/g,'+').replace(/_/g,'/').replace(/^KP1:/,'KP1:')};
const isRoom=el=>el.id==='scode';const isHero=el=>['imp','tbi'].includes(el.id);
const fix=el=>{if(isRoom(el)){const n=normRoom(el.value);if(n!==el.value)el.value=n}else if(isHero(el)){const n=normHero(el.value);if(n!==el.value)el.value=n}};
document.addEventListener('input',e=>{const t=e.target;if(t.matches&&t.matches('#scode,#imp,#tbi'))fix(t)},true);
document.addEventListener('change',e=>{const t=e.target;if(t.matches&&t.matches('#scode,#imp,#tbi'))fix(t)},true);
async function pasteInto(el){let txt='';try{txt=await navigator.clipboard.readText()}catch(e){}
 if(!txt){el.focus();try{el.select()}catch(e){}toast('Нажми и удерживай поле → «Вставить»');return}
 el.value=txt;fix(el);el.dispatchEvent(new Event('input',{bubbles:true}));toast('Вставлено');
 if(isRoom(el)){const g=document.getElementById('sgo');g&&g.classList.add('pulse')}}
function enhance(root){(root||document).querySelectorAll('#scode,#imp,#tbi').forEach(el=>{if(el.dataset.pst)return;el.dataset.pst=1;
 const b=document.createElement('button');b.type='button';b.className='btn sm pst-b';b.textContent='📋 Вставить';b.onclick=e=>{e.preventDefault();pasteInto(el)};
 const w=document.createElement('div');w.className='pst-row';w.appendChild(b);
 if(isRoom(el)){const h=document.createElement('span');h.className='pst-h';h.textContent='или наведи камеру телефона на QR-код Мастера';w.appendChild(h)}
 el.after(w)})}
new MutationObserver(m=>{for(const r of m)for(const n of r.addedNodes)if(n.nodeType===1&&(n.matches('#scode,#imp,#tbi')||n.querySelector('#scode,#imp,#tbi')))enhance(n.parentNode||n)}).observe(document.body,{childList:true,subtree:true});
enhance();
window.KM=window.KM||{};KM.paste={normRoom,normHero,pasteInto};
}
