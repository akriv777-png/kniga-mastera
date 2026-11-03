'use strict';{
/* ===== Свои персонажи Мастера: герой-лист (KMB/heroSheet) + роль + статблок для боя ===== */
const LSK='dmchars',ISK='dmitems';let dmc=LS.get(LSK,[]),dmi=LS.get(ISK,[]);
const _set=LS.set;LS.set=function(k,v){_set.call(LS,k,v);if(k==='players')try{_set.call(LS,LSK,dmc)}catch(e){}};
const persist=()=>{_set.call(LS,LSK,dmc);_set.call(LS,ISK,dmi)};
const E=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const md=v=>Math.floor(((+v||10)-10)/2),fm=v=>(v>=0?'+':'')+v,pbf=l=>2+Math.floor((Math.max(1,l)-1)/4);
const AB=['Сил','Лов','Тел','Инт','Мдр','Хар'];const nid=()=>Math.random().toString(36).slice(2,9);
const SP=()=>DATA.spells||[],IT=()=>DATA.items||[];const spl=id=>SP().find(s=>s.id===id),itm=id=>IT().find(i=>i.id===id);
const addItems=()=>{const ex=new Set(IT().map(i=>i.id));dmi.forEach(i=>{if(!ex.has(i.id))DATA.items.push(i)})};addItems();
const CLS=p=>window.KMB?KMB.CLASSES.find(c=>p.cls&&String(p.cls).includes(c.n)):null;
const fixD=p=>{const d0=({title:'',cat:'',bio:'',look:'',nat:'',quirk:'',mot:'',sec:'',hist:'',ph:'',hook:'',tac:'',cr:'',sz:'Средний',ty:'',al:'',spd:'',res:'',imm:'',ci:'',vul:'',se:'',la:'Общий',f:'',a:'',r:'',lg:'',lair:'',inn:[]});p.dm=p.dm||{};for(const k in d0)if(p.dm[k]==null)p.dm[k]=d0[k];p.spells=p.spells||[];p.inv=p.inv||[];p.st=p.st||[10,10,10,10,10,10];p.svp=p.svp||[];p.prof=p.prof||[];p.lvl=p.lvl||1;return p};
const lines=t=>String(t||'').split('\n').map(x=>x.trim()).filter(Boolean).map(x=>{const m=x.match(/^(.+?)\s*(?:—|–|:)\s+(.+)$/);return m?{n:m[1],d:m[2]}:{n:x,d:''}});
const maxL=p=>{const s=p.slots||{};return Math.max(0,...Object.keys(s).filter(k=>s[k]&&(s[k].max||0)>0).map(Number))};
function crOf(p){const D=p.dm;if(D.cr!==''&&D.cr!=null&&!isNaN(+D.cr))return +D.cr;return p.lvl<2?.5:Math.round(p.lvl*.75)}
function toMon(p){fixD(p);const D=p.dm,P=pbf(p.lvl);const skM=i=>KM.skMod?KM.skMod(Object.assign({exp:[]},p),i):0;
 const atk=p.inv.map(x=>itm(x.item)).filter(it=>it&&it.cat==='Оружие'&&it.dmg).map(it=>{const fin=/фехтов/i.test(it.prop||''),rng=/дальнобой/i.test(it.sub||'');const a=rng?1:fin&&p.st[1]>p.st[0]?1:0;const m=md(p.st[a]);return{n:it.n,d:`${rng?'Дальнобойная':'Рукопашная'} атака оружием: ${fm(m+P)} к попаданию. Попадание: ${String(it.dmg).replace(/^(\S+)/,'$1'+(m?fm(m):''))}${it.dt?' '+it.dt:''}.`}});
 const G=[];(D.inn||[]).forEach(g=>{const ids=(g.ids||[]).filter(spl);if(ids.length)G.push({g:g.u?g.u+'/день':'По желанию',u:+g.u||0,ids})});
 const mine=p.spells.map(spl).filter(Boolean);const can=mine.filter(s=>!s.l).map(s=>s.id);if(can.length)G.push({g:'Заговоры',u:0,ids:can});
 [...new Set(mine.filter(s=>s.l).map(s=>s.l))].sort((a,b)=>a-b).forEach(L=>{const sl=(p.slots||{})[L];G.push({g:`${L}-й уровень${sl&&sl.max?` (${sl.max} яч.)`:''}`,u:sl&&sl.max||0,ids:mine.filter(s=>s.l===L).map(s=>s.id)})});
 const lair=String(D.lair||'').split('\n').map(x=>x.trim()).filter(Boolean);
 const m={id:'dmc-'+p.id,sz:D.sz||'Средний',ty:D.ty||('гуманоид ('+String(p.race||'человек').toLowerCase()+')'),al:D.al,ac:p.ac||10,acn:'',hp:p.maxhp||p.hp||1,hd:p.lvl+'к'+(KM.hdOf?KM.hdOf(p):8),sp:D.spd||((p.spd||9)+' м'),st:p.st.slice(),
  sv:p.svp.map(j=>AB[j]+' '+fm(md(p.st[j])+P)).join(', '),sk:p.prof.map(i=>KM.SK?KM.SK[i][0]+' '+fm(skM(i)):'').filter(Boolean).join(', '),vul:D.vul,res:D.res,imm:D.imm,ci:D.ci,se:(D.se?D.se+', ':'')+'пассивное Восприятие '+(10+skM(3)),la:D.la,cr:crOf(p),xp:0,my:true,uniq:true,orig:true,pack:'dmchars',
  f:[{n:'Класс',d:`${p.cls||'—'}${p.sub?' ('+p.sub+')':''}, ${p.lvl}-й уровень · бонус мастерства ${fm(P)}`},...lines(p.feat),...lines(D.f),...(lair.length?[{n:'Действия логова',d:'На инициативе 20: '+lair.join(' / ')}]:[])],
  a:[...atk,...lines(D.a)],r:lines(D.r),lg:lines(D.lg),bio:D.bio,photo:p.photo,spl:G,kit:[...new Set(p.inv.map(x=>x.item).filter(i=>i&&itm(i)))],pid0:p.id,
  L:{title:D.title||`${p.race||''} · ${p.cls||''} ${p.lvl} ур.`,cat:D.cat||'Мои',look:D.look||p.look||'',nat:D.nat||p.trait||'',quirk:D.quirk,mot:D.mot,sec:D.sec,hist:D.hist,ph:String(D.ph||'').split('\n').map(x=>x.trim()).filter(Boolean),hook:D.hook,tac:D.tac}};
 const nm=p.name||'Без имени';Object.defineProperty(m,'n',{get:()=>nm,set:()=>{},enumerable:true});return m}
function sync(){addItems();const ms=dmc.map(toMon);const A=DATA.monsters;for(let i=A.length-1;i>=0;i--)if(String(A[i].id).startsWith('dmc-'))A.splice(i,1);ms.forEach(m=>{A.push(m);KM.kit&&KM.kit.clr&&KM.kit.clr(m.id)});return ms}
const byId=id=>dmc.find(p=>p.id===id||'dmc-'+p.id===id);
const refresh=()=>{persist();sync();try{if(typeof npcView!=='undefined'&&npcView==='leg'&&$('#legList'))KM.rLegSoft&&KM.rLegSoft()}catch(e){}};
function add(h){const p=fixD(Object.assign({conds:[],inv:[],notes:'',pp:10,init:0,gold:0},h));p.id=nid();dmc.push(p);refresh();edit(p.id);toast('Персонаж «'+p.name+'» создан')}
function create(){openSheet(`<div class="dmc"><div class="dmc-h">✦ Новый персонаж Мастера ✦</div><p class="kb-tip">Создаётся по правилам героя: народ, класс, подкласс, характеристики, навыки, заклинания класса, снаряжение. Затем — роль, статблок и арсенал. В отряд игроков не попадает.</p>
 <button class="btn red dmc-big" id="dcB">🧙 Мастер создания</button><button class="btn dmc-big" id="dcR">🎲 Случайный персонаж</button></div>`,r=>{
 $('#dcB',r).onclick=()=>window.KMB?KMB.open(add,{host:'dm'}):toast('Мастер создания не загружен');$('#dcR',r).onclick=()=>window.KMB&&add(KMB.random())})}
let etab='main';
const TA=(k,l,ph,rows)=>`<label class="f">${l}</label><textarea class="inp" data-dm="${k}" rows="${rows||3}" placeholder="${E(ph||'')}">`;
function edit(id,tab){const p=byId(id);if(!p)return;fixD(p);const D=p.dm;tab=etab=tab||etab||'main';const T=[['main','Основное'],['sb','Статблок'],['mag','Магия'],['gear','Снаряжение'],['role','Роль']];
 const v=k=>E(D[k]);const inp=(k,l,ph,ty)=>`<label class="f">${l}</label><input class="inp" data-dm="${k}" value="${v(k)}" placeholder="${E(ph||'')}"${ty?` type="${ty}" inputmode="decimal"`:''}>`;const ta=(k,l,ph,rows)=>TA(k,l,ph,rows)+v(k)+'</textarea>';
 const m=toMon(p);let h=`<div class="dmc"><div class="cast-head">${avHtml(m,84)}<div><div class="sb-title">${E(p.name)}</div><div class="sb-sub">${E(p.race)} · ${E(p.cls)}${p.sub?' ('+E(p.sub)+')':''} · ${p.lvl} ур. · ПО ${crTxt(m.cr)}</div></div></div>
 <div class="seg dmc-seg" id="dseg">${T.map(([k,l])=>`<button data-et="${k}" class="${k===tab?'on':''}">${l}</button>`).join('')}</div>`;
 if(tab==='main')h+=`<label class="f">Имя</label><input class="inp" data-p="name" value="${E(p.name)}">${inp('title','Титул','Владычица Северных топей')}${inp('cat','Категория','Мои (по умолчанию) — или своя: Злодеи, Союзники…')}
  <div class="row" style="gap:8px">${`<div class="grow">${inp('ty','Раса / тип (аватар подберётся сам)','гуманоид (эльф), нежить (лич)…')}</div>`}<div style="width:96px">${inp('cr','ПО (пусто — авто)',String(crOf(p)),'number')}</div></div>
  <div class="row" style="gap:8px"><div class="grow">${inp('sz','Размер','Средний')}</div><div class="grow">${inp('al','Мировоззрение','нейтральный')}</div></div>
  <label class="btn dmc-ph">📷 Свой портрет<input type="file" accept="image/*" id="dPh" hidden></label>${p.photo?'<button class="btn sm dark" id="dPhX">Убрать портрет</button>':''}
  <div class="dmc-card"><b>Характеристики, КД, хиты, навыки, спасброски, уровень, отдых</b> — в листе героя по правилам класса.<button class="btn red" id="dHS" style="width:100%;margin-top:8px">📜 Открыть лист героя</button>
  <div class="kb-st">${p.st.map((s,j)=>`<div><small>${AB[j]}</small><b>${s}</b><i>${fm(md(s))}</i></div>`).join('')}</div><div class="muted">КД ${m.ac} · ${m.hp} хитов · ${E(m.sp)} · иниц. ${fm(md(p.st[1]))}</div></div>`;
 if(tab==='sb')h+=`<p class="kb-tip">Пустая строка — новый пункт. Формат: «Название — описание».</p>${inp('spd','Скорости (пусто — из народа)','9 м, полёт 18 м')}${inp('res','Сопротивления','огонь, некротическая энергия')}${inp('imm','Иммунитеты к урону','яд')}${inp('ci','Иммунитеты к состояниям','испуг, очарование')}${inp('vul','Уязвимости','')}${inp('se','Чувства','тёмное зрение 18 м')}${inp('la','Языки','Общий, Эльфийский')}
  ${ta('f','Особенности','Тёмный дар — раз в день переносит провал в успех',3)}${ta('a','Действия (оружие из снаряжения добавляется само)','Пламенная волна — конус 4,5 м, спасбросок Ловкости Сл 15, 4к6 огнём',3)}${ta('r','Реакции','Парирование — +3 к КД против одной атаки',2)}${ta('lg','Легендарные действия','Легендарные действия — 3 за раунд\nУдар — одна атака оружием',3)}${ta('lair','Действия логова (по строке)','Тени гасят свет в радиусе 6 м',2)}`;
 if(tab==='mag'){const c=CLS(p),ml=maxL(p);const mine=p.spells.map(spl).filter(Boolean).sort((a,b)=>a.l-b.l||a.n.localeCompare(b.n,'ru'));
  h+=`<div class="sec-h">Заклинания класса</div><p class="kb-tip">${c&&c.ca!=null?`Только из списка класса «${E(c.n)}», до ${ml||0}-го уровня (по ячейкам). Ячейки: ${Object.entries(p.slots||{}).filter(([k,s])=>s&&s.max).map(([k,s])=>k+'-й × '+s.max).join(', ')||'нет'}.`:`${E(p.cls||'Класс')} не использует заклинания класса${ml?'':' на этом уровне'} — используйте врождённую магию ниже.`}</p>
  <div class="chips" style="flex-wrap:wrap">${mine.map(s=>`<span class="chip on"><span data-ksp="${s.id}">${E(s.n)} <small>${s.l||'з'}</small></span> <b data-rsp="${s.id}" style="margin-left:4px;cursor:pointer">✕</b></span>`).join('')||'<span class="muted">Пока нет</span>'}</div>
  ${c&&c.ca!=null?`<input class="inp" id="dSQ" placeholder="🔎 Найти заклинание класса…" style="margin-top:8px"><div class="kb-sl" id="dSL"></div>`:''}
  <div class="sec-h">Врождённая магия</div><p class="kb-tip">По желанию или N раз в день — любые заклинания (дар, проклятие, артефакт).</p>
  ${(D.inn||[]).map((g,gi)=>`<div class="dmc-card"><div class="row" style="align-items:center;gap:6px"><b>✦</b><select class="inp" data-gu="${gi}" style="width:auto;min-height:36px">${[0,1,2,3].map(u=>`<option value="${u}"${(+g.u||0)===u?' selected':''}>${u?u+'/день':'По желанию'}</option>`).join('')}</select><button class="btn sm dark" data-gx="${gi}" style="margin-left:auto">✕ группа</button></div>
   <div class="chips" style="flex-wrap:wrap;margin-top:6px">${(g.ids||[]).map(i=>spl(i)).filter(Boolean).map(s=>`<span class="chip on"><span data-ksp="${s.id}">${E(s.n)}</span> <b data-gr="${gi}:${s.id}" style="margin-left:4px;cursor:pointer">✕</b></span>`).join('')}</div>
   <input class="inp" data-gq="${gi}" placeholder="🔎 Добавить любое заклинание…" style="margin-top:6px"><div class="kb-sl" data-gl="${gi}"></div></div>`).join('')}
  <button class="btn" id="dGA">＋ Группа врождённой магии</button>`}
 if(tab==='gear')h+=`<div class="sec-h">Оружие, доспехи, магические предметы</div>${p.inv.map((x,k)=>`<div class="inv-r"><span class="nm" ${x.item?`data-kit="${x.item}"`:''}>${E(x.n)}${x.q>1?' ×'+x.q:''}</span><button class="rm" data-ri="${k}">✕</button></div>`).join('')||'<div class="muted">Пусто</div>'}
  <input class="inp" id="dIQ" placeholder="🔎 Найти в базе предметов: меч, плащ, посох…" style="margin-top:8px"><div class="kb-sl" id="dIL"></div>
  <details class="dmc-card"><summary><b>✚ Своя карточка предмета</b></summary><input class="inp" id="ciN" placeholder="Название"><div class="row" style="gap:6px"><select class="inp" id="ciC" style="flex:1"><option>Оружие</option><option>Магические</option><option>Доспехи</option><option>Снаряжение</option></select><select class="inp" id="ciR" style="flex:1">${['Обычный','Необычный','Редкий','Очень редкий','Легендарный','Артефакт'].map(x=>`<option>${x}</option>`).join('')}</select></div>
  <div class="row" style="gap:6px"><input class="inp" id="ciS" placeholder="Тип: длинный меч, кольцо…" style="flex:2"><input class="inp" id="ciD" placeholder="Урон 1к8" style="flex:1"></div><textarea class="inp" id="ciT" rows="3" placeholder="Описание и свойства"></textarea><button class="btn red" id="ciOk" style="width:100%">Создать и выдать</button></details>
  <div class="muted" style="margin-top:8px">Кошель, вес и настройка — в листе героя.</div>`;
 if(tab==='role')h+=`${ta('bio','Коротко (2–3 предложения, вверху карточки)','Кто это и зачем он в истории',3)}${ta('look','Внешность','')}${ta('nat','Характер','')}${ta('quirk','Манера речи','')}${ta('mot','Цели — чего хочет','')}${ta('sec','🔒 Тайна (только Мастер)','')}${ta('hist','История','',4)}${ta('ph','Фразы (по строке)','Мы помним каждого…',3)}${ta('hook','Завязка / крючок','')}${ta('tac','🗡 Тактика в бою','')}`;
 h+=`<div class="dmc-foot"><button class="btn red" id="dOk">✓ Готово</button><button class="btn" id="dFi">⚔ В бой</button><button class="btn" id="dDu">Копия</button><button class="btn dark" id="dDe">🗑</button></div></div>`;
 openSheet(h,r=>{const re=t=>{refresh();const y=sp.scrollTop;edit(p.id,t||tab);sp.scrollTop=y};
  KM.kit&&KM.kit.bind(r,()=>edit(p.id,tab));
  $('#dseg',r).onclick=e=>{const b=e.target.closest('[data-et]');if(b)edit(p.id,b.dataset.et)};
  r.oninput=e=>{const t=e.target;if(t.dataset.dm){D[t.dataset.dm]=t.value;persist()}if(t.dataset.p){p[t.dataset.p]=t.value;persist()}
   if(t.id==='dSQ'||t.dataset.gq!=null)srch(t)};
  r.onchange=e=>{const t=e.target;if(t.dataset.dm||t.dataset.p)refresh();if(t.dataset.gu!=null){D.inn[+t.dataset.gu].u=+t.value;re()}
   if(t.id==='dPh'&&t.files[0]){const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=c.height=320;const s=Math.min(im.width,im.height);c.getContext('2d').drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,320,320);p.photo=c.toDataURL('image/jpeg',.8);re();toast('Портрет сохранён')};im.src=fr.result};fr.readAsDataURL(t.files[0])}};
  const srch=t=>{const q=t.value.trim().toLowerCase();const gi=t.dataset.gq;const box=gi!=null?r.querySelector(`[data-gl="${gi}"]`):$('#dSL',r);if(!q){box.innerHTML='';return}
   const c=CLS(p),ml=maxL(p);let L=SP().filter(s=>s.n.toLowerCase().includes(q));if(gi==null)L=L.filter(s=>(s.cl||[]).includes(c.n)&&(s.l||0)<=ml&&(s.l||c.ca!=null));
   box.innerHTML=L.slice(0,25).map(s=>`<button class="kb-s" data-as="${s.id}" ${gi!=null?`data-ag="${gi}"`:''}><b>${E(s.n)}</b><small>${s.l?s.l+'-й уровень':'Заговор'} · ${E(s.sc||'')}</small></button>`).join('')||'<div class="muted">Нет подходящих</div>'};
  const isrch=q=>{q=q.trim().toLowerCase();const box=$('#dIL',r);box.innerHTML=q?IT().filter(i=>i.n.toLowerCase().includes(q)).slice(0,25).map(i=>`<button class="kb-s" data-ai="${i.id}"><b>${E(i.n)}</b><small>${E(i.cat||'')} · ${E(i.rar||'')}${i.dmg?' · '+E(i.dmg):''}</small></button>`).join('')||'<div class="muted">Нет</div>':''};
  const iq=$('#dIQ',r);if(iq)iq.oninput=()=>isrch(iq.value);
  const give=it=>{const ex=p.inv.find(x=>x.item===it.id);if(ex)ex.q++;else p.inv.push({id:nid(),item:it.id,n:it.n,q:1,w:it.w||0});try{p.ac=KMB.acOf(p)}catch(e){}toast('«'+it.n+'» → '+p.name)};
  r.onclick=e=>{const t=e.target,c=s=>t.closest(s);let b;
   if(b=c('[data-as]')){e.stopPropagation();const id=b.dataset.as;if(b.dataset.ag!=null){const g=D.inn[+b.dataset.ag];g.ids=g.ids||[];g.ids.includes(id)||g.ids.push(id)}else{const cc=CLS(p);if(!(spl(id).cl||[]).includes(cc&&cc.n))return toast('⛔ Не из списка класса');p.spells.includes(id)||p.spells.push(id)}return re()}
   if(b=c('[data-rsp]')){e.stopPropagation();p.spells=p.spells.filter(x=>x!==b.dataset.rsp);return re()}
   if(b=c('[data-gr]')){e.stopPropagation();const[gi,id]=b.dataset.gr.split(':');D.inn[+gi].ids=D.inn[+gi].ids.filter(x=>x!==id);return re()}
   if(b=c('[data-gx]')){D.inn.splice(+b.dataset.gx,1);return re()}
   if(c('#dGA')){D.inn.push({u:0,ids:[]});return re()}
   if(b=c('[data-ai]')){give(itm(b.dataset.ai));return re()}
   if(b=c('[data-ri]')){p.inv.splice(+b.dataset.ri,1);return re()}
   if(c('#ciOk')){const n=$('#ciN',r).value.trim();if(!n)return toast('Название?');const it={id:'dmi-'+nid(),n,cat:$('#ciC',r).value,sub:$('#ciS',r).value.trim(),rar:$('#ciR',r).value,dmg:$('#ciD',r).value.trim(),ds:$('#ciT',r).value.trim()+`\n\nПринадлежит: ${p.name}.`,own:true,w:0};dmi.push(it);DATA.items.push(it);give(it);return re()}
   if(c('#dPhX')){delete p.photo;return re()}
   if(c('#dHS'))return sheet(p.id);
   if(c('#dOk')){refresh();closeSheet();return}
   if(c('#dFi'))return fight(p.id);
   if(c('#dDu'))return dup(p.id);
   if(c('#dDe'))return del(p.id)}})}
function sheet(id){const p=byId(id);if(!p||!KM.heroSheet)return;KM.heroSheet(p);setTimeout(()=>{try{sp.insertAdjacentHTML('afterbegin',`<button class="btn sm" id="dBack" style="margin-bottom:8px">← К персонажу</button>`);$('#dBack',sp).onclick=e=>{e.stopPropagation();refresh();edit(p.id)}}catch(e){}},0)}
function fight(id){const p=byId(id);if(!p)return;refresh();const m=DATA.monsters.find(x=>x.id==='dmc-'+p.id);addCombatant(m);toast(`${p.name} — в инициативе (под управлением Мастера)`)}
function dup(id){const p=byId(id);if(!p)return;const q=JSON.parse(JSON.stringify(p));q.id=nid();q.name=p.name+' (копия)';dmc.push(q);refresh();edit(q.id);toast('Копия создана')}
function del(id){const p=byId(id);if(!p)return;if(!confirm(`Удалить персонажа «${p.name}»? Это нельзя отменить.`))return;dmc=dmc.filter(x=>x!==p);refresh();closeSheet();toast('Удалён: '+p.name);try{KM.rLegSoft&&KM.rLegSoft()}catch(e){}}
/* бой: кнопка листа героя */
const _cs=window.KM_kitCS;window.KM_kitCS=function(c,tab,r,cs){_cs&&_cs(c,tab,r,cs);try{if(c&&String(c.mon||'').startsWith('dmc-')){const p=byId(c.mon);if(!p)return;r.insertAdjacentHTML('beforeend',`<div class="row" style="margin-top:8px"><button class="btn" id="dcHS">📜 Лист героя: ${E(p.name)}</button><button class="btn dark" id="dcEd">✎ Персонаж</button></div>`);$('#dcHS',r).onclick=()=>sheet(p.id);$('#dcEd',r).onclick=()=>edit(p.id)}}catch(e){console.warn(e)}};
sync();
KM.dmc={list:()=>dmc,mons:()=>sync(),create,edit,sheet,fight,dup,del,toMon};
const st=document.createElement('style');st.textContent=`.dmc-h{font:400 24px 'Cormorant Garamond',serif;color:#e8c77a;text-align:center;letter-spacing:.06em;margin:4px 0 10px;text-shadow:0 0 12px rgba(232,199,122,.35)}
.dmc-big{width:100%;margin-top:8px;min-height:52px;font-size:16px}.dmc-seg{margin:10px 0;overflow-x:auto;flex-wrap:nowrap}.dmc-seg button{white-space:nowrap}
.dmc-card{border:1px solid rgba(232,199,122,.28);border-radius:14px;padding:10px 12px;margin:10px 0;background:radial-gradient(120% 140% at 0 0,rgba(142,26,18,.18),rgba(20,14,10,.4));box-shadow:inset 0 0 0 1px rgba(255,255,255,.03),0 0 18px rgba(232,199,122,.06)}
.dmc-card summary{cursor:pointer;padding:4px 0}.dmc .inp{font-size:16px}.dmc-ph{display:inline-block;margin:10px 6px 0 0}
.dmc-foot{display:flex;gap:6px;position:sticky;bottom:0;padding:10px 0 calc(6px + env(safe-area-inset-bottom));background:linear-gradient(transparent,var(--bg,#14100c) 35%);margin-top:12px}.dmc-foot .btn:first-child{flex:1}
.card.leg.mine{border-color:rgba(232,199,122,.5);box-shadow:0 0 0 1px rgba(232,199,122,.15),0 0 16px rgba(232,199,122,.1)}.card.leg.mine .badge{background:linear-gradient(135deg,#8e1a12,#c9a45a)}`;document.head.append(st);
}
