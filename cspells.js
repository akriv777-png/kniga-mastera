'use strict';
/* cspells.js — заклинания НИП / монстров / существ. Ключи: n:<НИП id> (npcLinks), m:<монстр id>, x:<своё существо>, c:<имя бойца> */
(function(){
const E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SP=()=>DATA.spells||[],sp=id=>SP().find(s=>s.id===id);const mon=id=>id&&(DATA.monsters||[]).find(m=>m.id===id||m.n===id);
const ST=()=>LS.get('crsp',{});
function parse(m){if(!m)return[];const t=JSON.stringify(m).toLowerCase();if(!/заклинан|колдовств|заговор/.test(t))return[];const out=[];
 SP().forEach(s=>{const n=(s.n||'').toLowerCase();if(n.length<4)return;const i=t.indexOf(n);if(i<0)return;const a=t[i-1]||' ',b=t[i+n.length]||' ';if(/[а-яёa-z]/.test(a)||/[а-яёa-z]/.test(b))return;out.push(s.id)});return out}
function get(key){if(key.startsWith('n:')){try{const l=npcLinks[key.slice(2)];return (l&&l.spells)||[]}catch(e){return[]}}
 const s=ST();if(s[key])return s[key];if(key.startsWith('m:'))return parse(mon(key.slice(2)));return[]}
function set(key,a){a=[...new Set(a)];if(key.startsWith('n:')){const id=key.slice(2);npcLinks[id]=npcLinks[id]||{items:[],spells:[]};npcLinks[id].spells=a;LS.set('npclinks',npcLinks);return}const s=ST();s[key]=a;LS.set('crsp',s)}
const keyOfMonOr=(mid,fb)=>mid&&mon(mid)?'m:'+mon(mid).id:fb;
const keyOfComb=c=>c.npc?'n:'+c.npc:keyOfMonOr(c.mon,'c:'+(c.base||c.name));
function keyOfTok(t){if(t.npc)return'n:'+t.npc;if(t.cr&&/^x:/.test(t.cr)){const x=LS.get('creat',[]).find(z=>'x:'+z.id===t.cr);if(x&&!ST()[t.cr]&&x.mon)return keyOfMonOr(x.mon,t.cr);return t.cr}
 const c=t.cid&&(combat.list||[]).find(z=>z.id===t.cid);if(c&&!c.pc)return keyOfComb(c);const m=t.mid||t.mon;if(m)return keyOfMonOr(m,null);return null}
function nameOf(key){const id=key.slice(2);if(key[0]==='n'){const c=typeof findCast==='function'&&findCast(id);return c?c.n:id}if(key[0]==='m'){const m=mon(id);return m?m.n:id}if(key[0]==='x'){const x=LS.get('creat',[]).find(z=>z.id===id);return x?x.n:id}return id}
/* редактор */
function edit(key,title,back){const cur=()=>get(key);const row=(s,on)=>`<div class="row" style="gap:6px;align-items:center;padding:4px 0"><div class="grow">${E(s.n)} <small class="muted">${s.l?s.l+' ур.':'заговор'}</small></div>${on?`<button class="btn sm" data-csd="${s.id}" aria-label="Убрать">✕</button>`:`<button class="btn sm" data-csa="${s.id}">＋</button>`}</div>`;
 const draw=r=>{const a=cur().map(sp).filter(Boolean).sort((x,y)=>x.l-y.l||x.n.localeCompare(y.n,'ru'));r.querySelector('#csL').innerHTML=a.length?a.map(s=>row(s,1)).join(''):'<p class="muted">Пока нет заклинаний</p>';bindL(r)};
 const res=(r,q)=>{q=(q||'').toLowerCase().trim();const h=cur();const a=q?SP().filter(s=>!h.includes(s.id)&&s.n.toLowerCase().includes(q)).sort((x,y)=>(y.n.toLowerCase().startsWith(q))-(x.n.toLowerCase().startsWith(q))||x.l-y.l).slice(0,30):[];r.querySelector('#csR').innerHTML=a.map(s=>row(s,0)).join('');bindL(r)};
 const bindL=r=>{r.querySelectorAll('[data-csd]').forEach(b=>b.onclick=()=>{set(key,cur().filter(x=>x!==b.dataset.csd));draw(r);res(r,r.querySelector('#csQ').value)});r.querySelectorAll('[data-csa]').forEach(b=>b.onclick=()=>{set(key,[...cur(),b.dataset.csa]);draw(r);res(r,r.querySelector('#csQ').value);toast('＋ '+(sp(b.dataset.csa)||{}).n)})};
 const pre=key[0]==='m'&&!ST()[key]&&get(key).length;
 openSheet(`<div class="sb-title" data-noshow>✧ Заклинания</div><div class="sb-sub">${E(title||nameOf(key))}${key[0]==='m'?' · для всех «'+E(nameOf(key))+'»':''}${pre?' · взято из блока статистики':''}</div><div id="csL"></div><input class="inp" id="csQ" placeholder="Найти заклинание в базе…" style="margin-top:8px"><div id="csR"></div>${back?'<button class="btn" id="csB" style="width:100%;margin-top:8px">← Назад</button>':''}`,r=>{draw(r);let tm;r.querySelector('#csQ').oninput=e=>{clearTimeout(tm);tm=setTimeout(()=>res(r,e.target.value),120)};const bb=r.querySelector('#csB');if(bb)bb.onclick=back})}
/* группы для карты: НИП/существа на карте, в бою и с заданным списком */
function groups(){const keys=new Map();const add=(k,n)=>{if(k&&!keys.has(k))keys.set(k,n||nameOf(k))};
 try{const m=maps.find(x=>x.id===mapCur);(m&&m.tok||[]).forEach(t=>{if(t.k==='pc'||(KM.tokHero&&KM.tokHero(t)))return;add(keyOfTok(t))})}catch(e){}
 (combat.list||[]).forEach(c=>{if(!c.pc)add(keyOfComb(c))});Object.keys(ST()).forEach(k=>add(k));try{Object.keys(npcLinks).forEach(id=>add('n:'+id))}catch(e){}
 return [...keys].map(([k,n])=>({key:k,n,a:get(k).map(sp).filter(Boolean)})).filter(g=>g.a.length)}
KM.csp={get,set,edit,groups,parse,keyOfComb,keyOfTok,nameOf};
})();
