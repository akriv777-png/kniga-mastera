'use strict';
/* ===== STAGE 5: cast of NPCs ===== */
const CAST=(window.NPC_RAW||'').trim().split('\n').map((l,i)=>{const f=l.split('|');return {id:'c'+i,n:f[0],r:f[1],look:f[2],nat:f[3],quirk:f[4],mot:f[5],sec:f[6],ph:f[7].split(';'),hook:f[8],stat:f[9],base:true}});
let ownCast=LS.get('cast',[]);let npcRel=LS.get('npcrel',{});let npcLinks=LS.get('npclinks',{});
const saveCast=()=>{LS.set('cast',ownCast);LS.set('npcrel',npcRel);LS.set('npclinks',npcLinks)};
const allCast=()=>[...ownCast,...CAST];const findCast=id=>allCast().find(c=>c.id===id);
function npcSigil(c,size=56){const r=prng(hsh(c.id+c.n));const hue=Math.floor(r()*360);const col=`hsl(${hue},55%,62%)`,dk=`hsl(${hue},40%,18%)`;
 const hood=r()<.5,horns=/тифлинг|драконо/.test(c.r),ears=/эльф/.test(c.r),beard=/дварф/.test(c.r)||r()<.2;const ey=46+r()*4,ew=7+r()*4;
 let p=`<circle cx="50" cy="50" r="47" fill="${dk}" stroke="${col}" stroke-width="1.5"/>`;
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2;p+=`<path d="M${50+43*Math.cos(a)} ${50+43*Math.sin(a)}l${2*Math.cos(a+1.6)} ${2*Math.sin(a+1.6)}" stroke="${col}"/>`}
 if(hood)p+=`<path d="M22 86C20 50 30 18 50 16s30 34 28 70" fill="#0a0605" stroke="${col}" stroke-width="1.2"/>`;
 if(horns)p+=`<path d="M34 30q-10-16 2-22M66 30q10-16-2-22" stroke="${col}" stroke-width="2.5" fill="none"/>`;
 if(ears)p+=`<path d="M30 46l-12-8 12 16M70 46l12-8-12 16" stroke="${col}" fill="none"/>`;
 p+=`<ellipse cx="50" cy="50" rx="${17+r()*4}" ry="${22+r()*3}" fill="#120a08" stroke="${col}" stroke-width="1.3"/>`;
 const et=Math.floor(r()*4);[50-ew,50+ew].forEach((x,k)=>{p+=et===0?`<circle cx="${x}" cy="${ey}" r="2.6" fill="${col}"/>`:et===1?`<path d="M${x-4} ${ey}q4-4 8 0q-4 4-8 0" fill="${col}"/>`:et===2?`<path d="M${x-4} ${ey}h8" stroke="${col}" stroke-width="2"/>`:`<circle cx="${x}" cy="${ey}" r="3.2" fill="none" stroke="${col}"/><circle cx="${x}" cy="${ey}" r="1" fill="#d42a22"/>`;if(k&&r()<.25)p+=`<path d="M${x-5} ${ey-8}l10 14" stroke="#d42a22" stroke-width="1.2"/>`});
 const my=60+r()*3;p+=r()<.5?`<path d="M44 ${my}q6 ${r()<.5?4:-3} 12 0" stroke="${col}" fill="none"/>`:`<path d="M44 ${my}h12" stroke="${col}"/>`;
 if(beard)p+=`<path d="M36 58q14 34 28 0" stroke="${col}" fill="none" stroke-dasharray="2 2"/>`;
 p+=`<text x="50" y="96" text-anchor="middle" font-size="9" fill="${col}" font-family="serif">${esc(c.n[0])}</text>`;
 return `<svg class="nsig" viewBox="0 0 100 100" width="${size}" height="${size}" style="filter:drop-shadow(0 0 4px ${col})">${p}</svg>`}
const REL=[['-2','Враг'],['-1','Неприязнь'],['0','Нейтрален'],['1','Дружелюбен'],['2','Союзник']];
let npcView=LS.get('npcview','beasts');let castQ='';
const _rNpc=rNpc;
rNpc=function(){page.oninput=null;page.onclick=null;
 if(npcView==='beasts'){_rNpc();$('.ph',page).insertAdjacentHTML('afterend',npcSeg());bindNpcSeg();return}
 page.innerHTML=header('Персонажи','лица, голоса и тайны мира','eye',0)+npcSeg()+`<div class="row"><div class="grow">${searchBox('castQ','Найти, напр. кузнец',castQ)}</div><button class="btn red" id="rndNpc">🎲 Случайный</button></div><div class="row" style="margin:-2px 0 8px"><button class="btn sm dark" id="newCast">＋ Свой персонаж</button></div><div class="list" id="castList"></div>`;
 bindNpcSeg();bindSearch('castQ',q=>{castQ=q;fillCast()});$('#rndNpc').onclick=()=>{const c=randomNpc();showCast(c.id)};$('#newCast').onclick=()=>editCast();fillCast()};
const npcSeg=()=>`<div class="seg" id="nseg"><button data-nv="beasts" class="${npcView==='beasts'?'on':''}">Бестиарий</button><button data-nv="cast" class="${npcView==='cast'?'on':''}">Персонажи (${allCast().length})</button></div>`;
function bindNpcSeg(){$('#nseg').onclick=e=>{const b=e.target.closest('[data-nv]');if(b){npcView=b.dataset.nv;LS.set('npcview',npcView);rNpc()}}}
function fillCast(){const q=castQ.toLowerCase();const L=allCast().filter(c=>!q||(c.n+' '+c.r+' '+c.look+' '+c.mot).toLowerCase().includes(q));
 lazyList($('#castList'),L,c=>{const rel=npcRel[c.id]?.v||0;return `<div class="card cast${c.base?'':' own'}" data-cid="${c.id}">${npcSigil(c,52)}<div class="t">${esc(c.n)}</div>${rel?`<span class="badge rel${rel}">${REL.find(x=>+x[0]===rel)[1]}</span>`:''}<div class="m">${esc(c.r)}</div><div class="m hand" style="opacity:.8">«${esc(c.ph[0])}»</div></div>`});
 $('#castList').onclick=e=>{const c=e.target.closest('[data-cid]');if(c)showCast(c.dataset.cid)}}
function showCast(id){const c=findCast(id);if(!c)return;const rel=npcRel[id]||{v:0,t:''};const lk=npcLinks[id]||{items:[],spells:[]};const mon=D.monsters.find(m=>m.id===c.stat);
 openSheet(`<div class="cast-head">${npcSigil(c,110)}<div><div class="sb-title">${esc(c.n)}</div><div class="sb-sub">${esc(c.r)}</div></div></div>
 <div class="fld"><b>Внешность.</b> ${esc(c.look)}</div><div class="fld"><b>Характер.</b> ${esc(c.nat)}</div><div class="fld"><b>Манера речи.</b> ${esc(c.quirk)}</div><div class="fld"><b>Чего хочет.</b> ${esc(c.mot)}</div>
 <details class="fld secret"><summary>🔒 Тайна (только для Мастера)</summary>${esc(c.sec)}</details>
 <div class="sec-h">Фразы</div>${c.ph.map(p=>`<div class="phr hand">«${esc(p)}»</div>`).join('')}
 <div class="sec-h">Завязка</div><div class="fld">${esc(c.hook)}</div>
 <div class="sec-h">Отношение к отряду</div>${chips('rel',REL,rel.v)}<textarea class="inp" id="relT" rows="2" placeholder="Заметка, напр. должен Борину 10 зм">${esc(rel.t)}</textarea>
 <div class="sec-h">Связи</div><div class="row">${lk.items.map(i=>`<button class="chip" data-li="${i}">◆ ${esc((D.items.find(x=>x.id===i)||{n:i}).n)}</button>`).join('')}${lk.spells.map(i=>`<button class="chip" data-ls="${i}">✦ ${esc((D.spells.find(x=>x.id===i)||{n:i}).n)}</button>`).join('')}</div>
 <div class="row"><input class="inp grow" id="lnkQ" placeholder="Привязать предмет или заклинание, напр. посох"></div><div id="lnkR"></div>
 <div class="sec-h">В игру</div><div class="row"><button class="btn red" id="cScene">＋ В сцену</button><button class="btn" id="cInit">⚔ В инициативу</button><button class="btn" id="cMap">◉ На карту</button>${mon?`<button class="btn dark" id="cStat">Статблок: ${esc(mon.n)}</button>`:''}</div>
 ${c.base?'':`<div class="row" style="margin-top:12px"><button class="btn sm dark" id="cEd">Изменить</button><button class="btn sm dark" id="cDel">🗑 Удалить</button></div>`}`,r=>{
  bindChips(r,(n,v)=>{npcRel[id]={...rel,v:+v};rel.v=+v;saveCast();$$('[data-chips=rel] .chip',r).forEach(b=>b.classList.toggle('on',b.dataset.v===v))});
  $('#relT',r).onchange=e=>{rel.t=e.target.value;npcRel[id]=rel;saveCast()};
  $('#cScene',r).onclick=()=>{if(typeof sess!=="undefined"){sess.npcs.includes(c.n)||sess.npcs.push(c.n);LS.set('sess',sess)}toast(`${c.n} — в сцене`)};
  $('#cInit',r).onclick=()=>{const m=mon?{...mon,n:c.n}:{n:c.n,ac:10,hp:4,init:0};addCombatant(m);toast(`${c.n} в инициативе`)};
  $('#cMap',r).onclick=()=>{try{const m=curMap();m.tok.push({id:uid(),x:Math.floor(m.W/2),y:Math.floor(m.H/2),n:c.n.slice(0,2),c:'#5aa2ff',k:'npc'});saveMaps();toast(`${c.n} на карте`)}catch(e){toast('Сначала открой карту')}};
  mon&&($('#cStat',r).onclick=()=>showMon(mon.id));
  $('#lnkQ',r).oninput=e=>{const q=e.target.value.toLowerCase();if(q.length<2){$('#lnkR',r).innerHTML='';return}const L=[...D.items.filter(i=>i.n.toLowerCase().includes(q)).slice(0,5).map(i=>['i',i]),...D.spells.filter(s=>s.n.toLowerCase().includes(q)).slice(0,5).map(s=>['s',s])];
   $('#lnkR',r).innerHTML=L.map(([t,o])=>`<button class="chip" data-add="${t}:${o.id}">${t==='i'?'◆':'✦'} ${esc(o.n)}</button>`).join('')};
  r.onclick=e=>{const a=e.target.closest('[data-add]');if(a){const[t,i]=a.dataset.add.split(':');lk[t==='i'?'items':'spells'].push(i);npcLinks[id]=lk;saveCast();showCast(id);return}
   const li=e.target.closest('[data-li]');if(li)return showItem(li.dataset.li);const ls=e.target.closest('[data-ls]');if(ls)return showSpell(ls.dataset.ls)};
  if(!c.base){$('#cEd',r).onclick=()=>editCast(c);$('#cDel',r).onclick=()=>{const i=ownCast.indexOf(c);ownCast.splice(i,1);saveCast();closeSheet();rNpc();KM.undoToast(`«${c.n}» удалён`,()=>{ownCast.splice(i,0,c);saveCast();rNpc()})}}})}
const SYL=['ра','ве','мир','бо','сла','гор','ди','ан','ти','ла','ке','зор','ми','на','ву','лен','ар','то','се','рин','мо','ха','ель','дан'];
function randomNpc(){const R=a=>a[Math.floor(Math.random()*a.length)];const L=CAST;const nm=(R(SYL)+R(SYL)+(Math.random()<.5?R(SYL):'')).replace(/^./,x=>x.toUpperCase());
 const c={id:'u'+uid(),n:nm+' '+R(L).n.split(' ').slice(1).join(' '),r:R(L).r,look:R(L).look,nat:R(L).nat,quirk:R(L).quirk,mot:R(L).mot,sec:R(L).sec,ph:[R(L).ph[0],R(L).ph[1]||R(L).ph[0],R(L).ph[2]||R(L).ph[0]],hook:R(L).hook,stat:R(L).stat};c.n=c.n.trim();ownCast.unshift(c);saveCast();if(npcView==='cast')fillCast();return c}
function editCast(c){const n=c||{id:'u'+uid(),n:'',r:'',look:'',nat:'',quirk:'',mot:'',sec:'',ph:[''],hook:'',stat:'commoner'};const F=[['n','Имя','напр. Мирон Кривой'],['r','Раса и роль','напр. человек · мельник'],['look','Внешность','напр. мука в бороде'],['nat','Характер','напр. ворчлив, но добр'],['quirk','Манера речи','напр. говорит пословицами'],['mot','Чего хочет','напр. вернуть дочь'],['sec','Тайна','напр. сам продал мельницу'],['ph','Фразы через «;»','напр. Мука — не мука!'],['hook','Завязка','напр. по ночам мельница крутится сама']];
 openSheet(`<div class="sb-title">${c?'Изменить персонажа':'Новый персонаж'}</div>${F.map(([k,l,p])=>`<label class="lbl">${l}</label><textarea class="inp" rows="${k==='n'||k==='r'?1:2}" data-f="${k}" placeholder="${p}">${esc(k==='ph'?n.ph.join(';'):n[k])}</textarea>`).join('')}<label class="lbl">Статблок</label><select class="inp" id="cStatS">${D.monsters.filter(m=>m.ty&&m.ty.startsWith('гуманоид')).map(m=>`<option value="${m.id}"${m.id===n.stat?' selected':''}>${esc(m.n)}</option>`).join('')}</select><button class="btn red" id="cSave" style="margin-top:12px">Сохранить</button>`,r=>{
  $('#cSave',r).onclick=()=>{$$('[data-f]',r).forEach(t=>{n[t.dataset.f]=t.dataset.f==='ph'?t.value.split(';').map(s=>s.trim()).filter(Boolean):t.value.trim()});if(!n.ph.length)n.ph=['…'];n.stat=$('#cStatS',r).value;if(!n.n)return toast('Нужно имя');if(!c)ownCast.unshift(n);saveCast();showCast(n.id);if(npcView==='cast')rNpc()}})}
Object.assign(KM,{CAST,allCast,showCast,randomNpc,npcSigil});
