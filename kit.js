'use strict';
/* kit.js — «Арсенал» существа: заклинания (с ячейками/использованиями), особое оружие и предметы, короткое био.
   Источник: m.spl/m.kit/m.bio (legends.js) или автоматический разбор статблока. Показывается в статблоке, карточках НПС/персонажей и в бою. */
(function(){
const E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const lc=s=>String(s||'').toLowerCase().replace(/ё/g,'е');
let SPI=null,WPI=null;
function idx(){if(SPI)return;SPI=(DATA.spells||[]).filter(s=>(s.n||'').length>=3).map(s=>[lc(s.n),s.id]).sort((a,b)=>b[0].length-a[0].length);
 WPI={};(DATA.items||[]).forEach(i=>{if(i.cat==='Оружие'&&!WPI[lc(i.n)])WPI[lc(i.n)]=i.id})}
const W=/[а-яa-z]/;
function findSpells(t){t=lc(t);const out=[];const used=[];
 for(const [n,id] of SPI){let i=t.indexOf(n);while(i>=0){const a=t[i-1]||' ',b=t[i+n.length]||' ';if(!W.test(a)&&!W.test(b)&&!used.some(([x,y])=>i<y&&i+n.length>x)){used.push([i,i+n.length]);out.push([i,id]);break}i=t.indexOf(n,i+1)}}
 return out.sort((a,b)=>a[0]-b[0]).map(x=>x[1])}
function label(seg){let m;
 if(m=seg.match(/(\d+)[-‑ ]*(?:й|го)?(?:\s*уров\S*)?\s*\((\d+)(?:\s*яч\S*)?\)/i))return {g:`${m[1]}-й уровень (${m[2]} яч.)`,u:+m[2],l:+m[1]};
 if(m=seg.match(/(\d+)\s*\/\s*(?:день|сутки)/i))return {g:`${m[1]}/день`,u:+m[1]};
 if(/заговор|неограничен|по желанию/i.test(seg))return {g:'По желанию',u:0};return null}
function parseSpells(m){const fs=[...(m.f||[]),...(m.a||[])].filter(x=>/заклинан|колдовств/i.test(x.n||'')||/по желанию:|\d\/день:/i.test(x.d||''));if(!fs.length)return[];
 const G=[];const seen=new Set();
 fs.forEach(f=>String(f.d||'').split(/\n|;|(?=—\s*\d)|(?=\d+\s*\/\s*день)/).forEach(seg=>{const ids=findSpells(seg).filter(i=>!seen.has(i));if(!ids.length)return;ids.forEach(i=>seen.add(i));
  const l=label(seg)||{g:'Заклинания',u:0};const g=G.find(x=>x.g===l.g);g?g.ids.push(...ids):G.push({...l,ids})}));return G}
function innate(m,G){const seen=new Set([].concat(...G.map(g=>g.ids)));const ids=[];[...(m.f||[]),...(m.a||[]),...(m.r||[])].forEach(x=>{const n=lc(x.n).replace(/\s*\(.*\)\s*/,'').trim();const hit=SPI.find(z=>z[0]===n);if(hit&&!seen.has(hit[1])){seen.add(hit[1]);ids.push(hit[1])}});if(ids.length)G.push({g:'Врождённая магия',u:0,ids});return G}
function weapons(m){const out=[];(m.a||[]).forEach(a=>{const n=lc(a.n);if(/мультиатака/.test(n))return;const c=[n.replace(/\s*\(.*\)\s*/,'').trim(),(n.match(/\(([^)]+)\)/)||[])[1]];for(const k of c){if(k&&WPI[k]){out.push(WPI[k]);break}}});return [...new Set(out)]}
const monOf=c=>c&&c.mon?(DATA.monsters||[]).find(m=>m.id===c.mon):null;
const cache={};
function kit(m){if(!m)return null;if(cache[m.id])return cache[m.id];idx();
 const spl=m.spl?m.spl.map(g=>({...g,ids:g.ids.filter(i=>(DATA.spells||[]).some(s=>s.id===i))})):innate(m,parseSpells(m));
 const it=[...(m.kit||[]),...weapons(m)].filter((v,i,a)=>a.indexOf(v)===i&&(DATA.items||[]).some(x=>x.id===v));
 return cache[m.id]={spl,it}}
const has=m=>{const k=kit(m);return !!(k&&(k.spl.length||k.it.length))};
const spN=id=>((DATA.spells||[]).find(s=>s.id===id)||{n:id});const itN=id=>((DATA.items||[]).find(s=>s.id===id)||{n:id});
/* c — боец (необязателен): отмечаем потраченные ячейки */
function html(m,c){const k=kit(m);if(!k||!(k.spl.length||k.it.length))return'';const ku=(c&&c.ku)||{};
 return `<div class="sec-h">🎒 Арсенал</div>`+k.spl.map((g,gi)=>{const used=ku[gi]||0;return `<div class="fld"><b>✦ ${E(g.g)}</b>${g.u&&c?` <span class="kit-u" data-ku="${gi}" style="cursor:pointer;letter-spacing:2px">${'●'.repeat(Math.max(0,g.u-used))}${'○'.repeat(Math.min(g.u,used))}</span>`:g.u?` <small class="muted">×${g.u}</small>`:''}<div class="row" style="gap:4px;flex-wrap:wrap;margin-top:4px">${g.ids.map(i=>{const s=spN(i);return `<button class="chip" data-ksp="${i}">${E(s.n)}${s.l?` <small>${s.l}</small>`:''}</button>`}).join('')}</div></div>`}).join('')+
 (k.it.length?`<div class="fld"><b>◆ Оружие и предметы</b><div class="row" style="gap:4px;flex-wrap:wrap;margin-top:4px">${k.it.map(i=>`<button class="chip" data-kit="${i}">${E(itN(i).n)}</button>`).join('')}</div></div>`:'')}
function bind(root,back,c){root.addEventListener('click',e=>{const s=e.target.closest('[data-ksp]'),i=e.target.closest('[data-kit]'),u=e.target.closest('[data-ku]');
 if(u&&c){const gi=+u.dataset.ku;const m=monOf(c);const g=kit(m).spl[gi];c.ku=c.ku||{};c.ku[gi]=((c.ku[gi]||0)+1)%(g.u+1);try{save()}catch(_){}u.textContent='●'.repeat(g.u-c.ku[gi])+'○'.repeat(c.ku[gi]);e.stopPropagation();return}
 if(s||i){e.stopPropagation();s?showSpell(s.dataset.ksp):showItem(i.dataset.kit);if(back){sp.insertAdjacentHTML('afterbegin','<button class="btn sm" id="kitBack" style="margin-bottom:8px">← Назад</button>');const b=sp.querySelector('#kitBack');b&&(b.onclick=ev=>{ev.stopPropagation();back()})}}},true)}
function bio(m){return m&&m.bio?`<div class="fld bio" style="font-style:italic;opacity:.92">${E(m.bio)}</div>`:''}
/* статблок */
const _sm=window.showMon;if(_sm)window.showMon=showMon=function(id){_sm(id);const m=findMon(id);if(!m||!sp)return;const t=sp.querySelector('.sb-sub');if(m.bio&&t)t.insertAdjacentHTML('afterend',bio(m));
 const h=html(m);if(h){const at=sp.querySelector('#toFight');const row=at&&at.closest('.row');row?row.insertAdjacentHTML('beforebegin',h):sp.insertAdjacentHTML('beforeend',h);bind(sp,()=>showMon(id))}};
/* бой (хук из combat.js) */
window.KM_kitCS=function(c,tab,r,cs){try{if(!c||c.pc)return;const m=monOf(c);if(!m)return;const h=html(m,c);if(!h)return;
 const row=r.querySelector('#cdl');const at=row&&row.closest('.row');at?at.insertAdjacentHTML('beforebegin',h):r.insertAdjacentHTML('beforeend',h);bind(r,()=>cs(c,tab),c)}catch(e){console.warn('kit',e)}};
window.KM=window.KM||{};KM.kit={kit,has,html,bind,bio,clr:id=>{delete cache[id]}};
})();
