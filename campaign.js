'use strict';
/* «Кампании»: готовые кампании (data/camp*.js грузятся лениво), прогресс по главам, карты, встречи → трекер */
(()=>{const E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const FILES=['data/camp1.js','data/camp2.js','data/camp3.js','data/camp4.js'];let ld=null;
function load(){if(window.CAMPAIGNS&&window.CAMPAIGNS.length>=FILES.length)return Promise.resolve();if(ld)return ld;window.CAMPAIGNS=window.CAMPAIGNS||[];
 ld=Promise.all(FILES.map(f=>new Promise(r=>{if(document.querySelector(`script[data-cf="${f}"]`))return r();const s=document.createElement('script');s.src=f;s.dataset.cf=f;s.onload=s.onerror=()=>r();document.head.appendChild(s)}))).then(()=>{const o=FILES.map(f=>f.match(/camp(\d)/)[1]);CAMPAIGNS.sort((a,b)=>parseInt(a.lvl)-parseInt(b.lvl))});return ld}
const P=id=>LS.get('camp_'+id,null),setP=(id,v)=>LS.set('camp_'+id,v);
const mname=id=>{const m=D.monsters.find(z=>z.id===id);return m?m.n:id};
const monL=a=>a.map(([id,n])=>`<a class="cpM" data-mon="${E(id)}">${E(mname(id))}</a>${n>1?' ×'+n:''}`).join(', ');
const bar=(c,p)=>{const d=p?p.done.length:0,t=c.chapters.length;return`<div class="tkHp" style="height:10px;margin:6px 0 0"><i style="width:${d/t*100}%;background:#8a6a2a"></i></div><div class="m">${p?`Пройдено глав: ${d} из ${t}`:'Не начата'}</div>`};
function list(){load().then(()=>{const A=window.CAMPAIGNS||[];openSheet(`<div class="sb-title">Кампании</div><div class="muted" style="font-size:12.5px">Готовые кампании на несколько вечеров: главы, сцены, NPC, карты, встречи и награды. Не связаны с вашими заметками — начинайте с любой.</div><div class="list" style="margin-top:10px">${A.map((c,i)=>`<div class="card" data-cp="${i}"><div class="grow"><div class="t">${E(c.n)}</div><div class="m">Уровни ${E(c.lvl)} · ${E(c.sess)} · глав: ${c.chapters.length}</div>${bar(c,P(c.id))}</div></div>`).join('')}</div>`,r=>{r.onclick=e=>{const c=e.target.closest('[data-cp]');if(c)camp(+c.dataset.cp)}})})}
function camp(i,sy){const c=CAMPAIGNS[i];if(!c)return;const p=P(c.id);
 openSheet(`<div class="sb-title" data-noshow>${E(c.n)}</div><div class="muted">Уровни ${E(c.lvl)} · ${E(c.sess)}</div>${bar(c,p)}
 <h3>Завязка</h3><p>${E(c.premise)}</p>
 <details><summary><b>Как вовлечь героев</b></summary><ul>${c.hooks.map(h=>`<li>${E(h)}</li>`).join('')}</ul></details>
 <details><summary><b>Персонажи (${c.npcs.length})</b></summary>${c.npcs.map(n=>`<p><b>${E(n.n)}</b> <span class="muted">— ${E(n.role)}</span><br>${E(n.d)}</p>`).join('')}</details>
 <details><summary><b>Советы новичку</b></summary><ul>${c.tips.map(h=>`<li>${E(h)}</li>`).join('')}</ul></details>
 <details><summary><b>Финал</b> <small class="muted">(только для Мастера)</small></summary><p>${E(c.finale)}</p></details>
 <h3>Главы</h3><div class="list">${c.chapters.map((h,k)=>`<div class="card" data-ch="${k}"><div class="grow"><div class="t">${p&&p.done.includes(k)?'✓ ':p&&p.cur===k?'▶ ':''}${k+1}. ${E(h.n)}</div><div class="m">Ур. ${h.lvl} · ${E(h.goal)}</div></div></div>`).join('')}</div>
 <div class="row" style="gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn" id="cpB">← Список</button><button class="btn" id="cpH">📣 Завязку игрокам</button>${p?'<button class="btn" id="cpR">Сбросить прогресс</button>':''}<button class="btn red" id="cpS" style="width:100%;min-height:50px">${p?'▶ Продолжить: глава '+((p.cur||0)+1):'▶ Начать кампанию'}</button></div>`,r=>{
  if(sy)document.getElementById('sheetPage')&&(document.getElementById('sheetPage').scrollTop=sy);
  r.onclick=e=>{const h=e.target.closest('[data-ch]');if(h)return chap(i,+h.dataset.ch)};
  r.querySelector('#cpB').onclick=list;r.querySelector('#cpH').onclick=()=>KM.showPlayers&&KM.showPlayers({i:'🏰',n:c.n,t:c.premise});
  const rs=r.querySelector('#cpR');if(rs)rs.onclick=()=>{if(confirm('Сбросить прогресс кампании?')){LS.set('camp_'+c.id,null);camp(i)}};
  r.querySelector('#cpS').onclick=()=>{let q=P(c.id);if(!q){q={t:Date.now(),done:[],cur:0};setP(c.id,q);toast('Кампания начата')}chap(i,q.cur||0)}})}
function chap(i,k){const c=CAMPAIGNS[i],h=c&&c.chapters[k];if(!h)return;let p=P(c.id);if(p){p.cur=k;setP(c.id,p)}const done=p&&p.done.includes(k);
 openSheet(`<div class="sb-title" data-noshow>${k+1}. ${E(h.n)}</div><div class="muted">${E(c.n)} · уровень ${h.lvl}</div>
 <p><b>Цель:</b> ${E(h.goal)}</p><p>${E(h.sum)}</p>
 <h3>Сцены</h3><ol>${h.scenes.map(s=>`<li><b>${E(s.n)}.</b> ${E(s.t)}</li>`).join('')}</ol>
 <h3>Места</h3>${h.locs.map((l,j)=>`<div class="card" style="align-items:center"><div class="grow"><div class="t">${E(l.n)}</div><div class="m">${E(l.d)}${l.mon.length?'<br>Враги: '+monL(l.mon):''}</div></div><button class="btn sm" data-map="${j}">🗺 Карта</button></div>`).join('')}
 <h3>Встречи</h3>${h.enc.map((en,j)=>`<div class="card"><div class="grow"><div class="t">${E(en.n)}</div><div class="m">${monL(en.mon)}</div><div class="m" style="margin-top:4px">${E(en.tac)}</div></div><button class="btn sm" data-enc="${j}">⚔ В трекер</button></div>`).join('')}
 <h3>Награда</h3><p>${E(h.loot)}</p>
 ${h.shop?`<details><summary><b>⚖ ${E(h.shop.n)}</b></summary><ul>${h.shop.items.map(x=>`<li>${E(x)}</li>`).join('')}</ul></details>`:''}
 ${h.handout?`<div class="card"><div class="grow"><div class="t">📜 ${E(h.handout.n)}</div><div class="m" style="font-style:italic">${E(h.handout.t)}</div></div><button class="btn sm" id="cpHo">📣 Игрокам</button></div>`:''}
 ${h.tip?`<p class="muted" style="font-size:13px">💡 ${E(h.tip)}</p>`:''}
 <div class="row" style="gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn" id="cpC">← Кампания</button>${k>0?'<button class="btn" id="cpPv">‹ Пред.</button>':''}${k<c.chapters.length-1?'<button class="btn" id="cpNx">След. ›</button>':''}<button class="btn" id="cpN">📝 В заметки</button><button class="btn ${done?'':'red'}" id="cpD" style="width:100%;min-height:50px">${done?'✓ Глава пройдена (отменить)':'✓ Отметить главу пройденной'}</button></div>`,r=>{
  r.onclick=e=>{const mo=e.target.closest('[data-mon]');if(mo){showMon(mo.dataset.mon);window.KM_sheetRet=()=>chap(i,k);return}
   const mb=e.target.closest('[data-map]');if(mb){const l=h.locs[+mb.dataset.map];return KM.preMap('cp-'+c.id+'-'+k+'-'+mb.dataset.map,{type:l.type,W:l.W||26,H:l.H||24,dang:l.dang||40,mon:l.mon,mons:l.mon.length?1:0,name:l.n})}
   const eb=e.target.closest('[data-enc]');if(eb){const en=h.enc[+eb.dataset.enc];let n=0;en.mon.forEach(([id,q])=>{const m=D.monsters.find(z=>z.id===id);if(m)for(let t=0;t<q;t++){addCombatant(m);n++}});toast(`В трекер добавлено: ${n}`);return}};
  r.querySelector('#cpC').onclick=()=>camp(i);const pv=r.querySelector('#cpPv'),nx=r.querySelector('#cpNx');pv&&(pv.onclick=()=>chap(i,k-1));nx&&(nx.onclick=()=>chap(i,k+1));
  const ho=r.querySelector('#cpHo');ho&&(ho.onclick=()=>KM.showPlayers&&KM.showPlayers({i:'📜',n:h.handout.n,t:h.handout.t}));
  r.querySelector('#cpN').onclick=()=>{const t=Date.now();notes.unshift({id:uid(),title:`${c.n} — гл. ${k+1}: ${h.n}`,text:`Цель: ${h.goal}\n\n${h.sum}\n\n${h.scenes.map((s,j)=>`${j+1}. ${s.n}: ${s.t}`).join('\n')}\n\nНаграда: ${h.loot}`,tag:'Квест',t});save();toast('Добавлено в заметки')};
  r.querySelector('#cpD').onclick=()=>{let q=P(c.id)||{t:Date.now(),done:[],cur:k};q.done=q.done.includes(k)?q.done.filter(x=>x!==k):[...q.done,k];if(!done&&k<c.chapters.length-1)q.cur=k+1;setP(c.id,q);toast(done?'Отметка снята':(q.done.length===c.chapters.length?'Кампания завершена! 🎉':'Глава пройдена'));chap(i,k)}})}
KM.camps=list;KM.campLoad=load;})();
