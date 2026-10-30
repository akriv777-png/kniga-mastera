'use strict';
/* ================= PLAYERS v2 ================= */
const ABN=['СИЛ','ЛОВ','ТЕЛ','ИНТ','МДР','ХАР'];
const PRESET={'Маг':[8,14,13,16,12,10],'Воин':[16,12,15,9,13,10],'Плут':[10,16,13,12,12,14]};
players.forEach(p=>{p.lvl=p.lvl||1;p.st=p.st||PRESET[p.cls]||[10,10,10,10,10,10];p.conds=p.conds||[];p.gold=p.gold??(p.cls==='Плут'?15:10);p.inv=p.inv||[];
  if(!p.inv.length&&!p._seeded){p._seeded=1;const seed={'Маг':['quarterstaff','dagger','component-pouch'],'Воин':['chain-mail','longsword','shield'],'Плут':['shortsword','shortbow','leather-armor','thieves-tools']}[p.cls]||[];
   seed.forEach(id=>{const it=D.items.find(x=>x.id===id);if(it)p.inv.push({id:uid(),item:it.id,n:it.n,q:1,w:it.w||0})})}});
save();
const attOf=x=>{const it=x.item&&D.items.find(i=>i.id===x.item);return !!(it&&it.att)};const attN=p=>p.inv.filter(x=>x.att).length;
const invW=p=>Math.round(p.inv.reduce((a,x)=>a+(x.w||0)*x.q,0)*10)/10;
const kg=n=>String(Math.round(n*10)/10).replace('.',',')+' кг';
function rPcs(){page.oninput=null;
  page.innerHTML=header('Герои','листы персонажей отряда · онлайн-стол — кнопка ◎','tri',1)+players.map((p,i)=>`<div class="hero" data-i="${i}">
   <div class="hero-top"><label class="portrait">${p.photo?`<img src="${p.photo}" alt="">`:`<span>${esc((p.name||'?')[0])}</span>`}<input type="file" accept="image/*" data-photo hidden><i>📷</i></label>
    <div class="hero-id"><input class="pcn" data-k="name" value="${esc(p.name)}" placeholder="Имя"><div class="row" style="gap:6px;flex-wrap:nowrap"><input class="pcc" data-k="cls" value="${esc(p.cls)}" placeholder="Класс" style="flex:1;margin:0"><span class="lvl">ур.<input data-k="lvl" type="number" inputmode="numeric" value="${p.lvl}"></span></div>
    <div class="hpline"><div class="hpbar"><i style="width:${Math.max(0,Math.min(100,p.hp/p.maxhp*100))}%"></i></div></div></div></div>
   <div class="pcstats4"><div class="shield"><small>ХИТЫ</small><div class="hpin"><input data-k="hp" type="number" inputmode="numeric" value="${p.hp}"><em>/</em><input data-k="maxhp" type="number" inputmode="numeric" value="${p.maxhp}" class="mx"></div></div>
    <div class="shield"><small>КД</small><input data-k="ac" type="number" inputmode="numeric" value="${p.ac}"></div>
    <div class="shield"><small>ВНИМ.</small><input data-k="pp" type="number" inputmode="numeric" value="${p.pp}"></div>
    <button class="shield gold" data-purse="${p.id}" style="font:inherit"><small>КОШЕЛЁК</small><b style="font-size:20px;color:#f0c64a">${KM.coin.fmtTot(p)}</b><i style="display:block;font-size:10px;opacity:.75;font-style:normal">${KM.coin.mini(p)}</i></button></div>
   <div class="abil hero-ab">${p.st.map((v,j)=>`<div><small>${ABN[j]}</small><input data-st="${j}" type="number" inputmode="numeric" value="${v}"><i>${fmod(mod(v))}</i></div>`).join('')}</div>
   ${KM.uses?KM.uses.row(p):''}<div class="conds-row">${p.conds.map(c=>`<span class="cond">${esc(c)}</span>`).join('')}<button class="chip" data-conds>${p.conds.length?'✎':'＋ Состояние'}</button></div>
   <div class="inv-h"><b>Инвентарь</b><span>${p.inv.length} предм. · ${kg(invW(p))}${p.inv.some(attOf)?` · <b class="att-n${attN(p)>3?' over':''}" title="Настройка: короткий отдых (1 ч) рядом с предметом — и его магия работает на вас. Одновременно можно быть настроенным максимум на 3 предмета." data-atth>✧ Настроено ${attN(p)}/3</b>`:''}</span><button class="btn sm" data-addinv>＋</button></div>
   <div class="inv">${p.inv.map((x,k)=>`<div class="inv-r" data-k="${k}"><span class="nm" data-open>${esc(x.n)}</span>${attOf(x)?`<button class="chip att${x.att?' on':''}" data-att title="${x.att?'Настроен — нажмите, чтобы снять':'Настроиться (макс. 3)'}">✧${x.att?' Настроен':''}</button>`:''}<span class="w">${x.w?kg(x.w*x.q):''}</span><div class="q"><button data-q="-1">−</button><b>${x.q}</b><button data-q="1">+</button></div><button class="rm" data-rm>✕</button></div>`).join('')||'<div class="muted" style="font-size:13px;padding:6px 2px">Пусто. Добавь из «Лута» или кнопкой ＋</div>'}</div>
   <details class="pnotes"><summary>Заметки</summary><textarea class="inp" data-k="notes">${esc(p.notes||'')}</textarea></details>
   ${players.length>1?'<button class="btn sm dark" data-del style="margin-top:8px">Удалить героя</button>':''}</div>`).join('')+`<button class="btn red" id="addPc">＋ Новый герой</button><div class="row" style="gap:8px;margin-top:8px"><button class="btn grow" id="bldPc">🧙 Мастер создания</button><button class="btn grow" id="rndPc">🎲 Случайный</button></div><button class="btn" id="pRest" style="width:100%;margin-top:8px">⛺ Отдых отряда</button><div style="height:20px"></div>`;
  const P=e=>{const h=e.target&&e.target.closest&&e.target.closest('.hero');return h?players[+h.dataset.i]:null};
  page.oninput=e=>{const t=e.target;if(!t.closest('.hero'))return;const p=P(e);if(t.dataset.k){const k=t.dataset.k;p[k]=t.type==='number'?+t.value:t.value;if(k==='hp'||k==='maxhp'){const b=t.closest('.hero').querySelector('.hpbar i');b.style.width=Math.max(0,Math.min(100,p.hp/p.maxhp*100))+'%'}save()}
   if(t.dataset.st!=null){p.st[+t.dataset.st]=+t.value||0;t.nextElementSibling.textContent=fmod(mod(+t.value||0));save()}};
  page.onchange=e=>{const t=e.target;if(t.dataset.photo==null||!t.files[0])return;const p=P(e);const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');const S0=320;c.width=c.height=S0;const g=c.getContext('2d');const s=Math.min(im.width,im.height);g.drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,S0,S0);p.photo=c.toDataURL('image/jpeg',.8);save();rPcs();toast('Портрет сохранён')};im.src=fr.result};fr.readAsDataURL(t.files[0])};
  page.onclick=e=>{const t=e.target;const h=t.closest('.hero');if(!h)return;const p=players[+h.dataset.i];
   if(t.closest('[data-conds]'))return heroConds(p);
   if(t.closest('[data-addinv]'))return pickItem(it=>{giveItem(p,it);rPcs()});
   if(t.closest('[data-atth]'))return toast('Настройка: короткий отдых (1 ч) рядом с предметом — и его магия работает на вас. Одновременно можно быть настроенным максимум на 3 предмета.');const r=t.closest('.inv-r');if(r){const x=p.inv[+r.dataset.k];
    if(t.dataset.q){x.q=Math.max(1,x.q+ +t.dataset.q);save();rPcs()}else if(t.closest('[data-att]')){if(!x.att&&attN(p)>=3)return toast('Уже настроено 3 предмета — сначала снимите настройку с другого');x.att=x.att?0:1;save();rPcs();try{KM.table.push(true)}catch(e){}toast(x.att?'✧ Настроен: '+x.n:'Настройка снята: '+x.n)}else if(t.closest('[data-rm]')){const k=+r.dataset.k;p.inv.splice(k,1);save();rPcs();KM.undoToast('«'+x.n+'» убрано',()=>{p.inv.splice(k,0,x);save();rPcs()})}else if(t.closest('[data-open]')&&x.item)showItem(x.item)}
   if(t.closest('[data-del]')){const i=+h.dataset.i;players.splice(i,1);save();rPcs();KM.undoToast('Герой «'+p.name+'» удалён',()=>{players.splice(i,0,p);save();rPcs()})}};
  $('#pRest').onclick=()=>KM.partyRestUI();const addB=h=>{const o=Object.assign({id:uid(),conds:[],inv:[],notes:'',pp:10,init:0,gold:0},h);o.id=uid();players.push(o);save();rPcs();page.scrollTo({top:page.scrollHeight,behavior:'smooth'});toast('Герой «'+o.name+'» добавлен')};$('#bldPc').onclick=()=>window.KMB?KMB.open(addB,{host:'dm'}):toast('Мастер создания не загружен');$('#rndPc').onclick=()=>window.KMB&&addB(KMB.random());
  $('#addPc').onclick=()=>{players.push({id:uid(),name:'Новый герой',cls:'Класс',lvl:1,hp:10,maxhp:10,ac:12,pp:10,init:0,st:[10,10,10,10,10,10],conds:[],gold:0,inv:[],notes:''});save();rPcs();page.scrollTo({top:page.scrollHeight,behavior:'smooth'})}}
function heroConds(p){openSheet(`<div class="sb-title">Состояния</div><div class="sb-sub">${esc(p.name)}</div><div class="row" style="margin-top:12px">${CONDS.map(x=>`<button class="chip${p.conds.includes(x)?' on':''}" data-c="${x}">${x}</button>`).join('')}</div><div class="row" style="margin-top:18px"><button class="btn red" id="cok">Готово</button></div>`,r=>{
  $$('[data-c]',r).forEach(b=>b.onclick=()=>{const x=b.dataset.c;p.conds=p.conds.includes(x)?p.conds.filter(y=>y!==x):[...p.conds,x];b.classList.toggle('on');save()});$('#cok',r).onclick=()=>{closeSheet();rPcs()}})}
function giveItem(p,it,q=1){const ex=p.inv.find(x=>x.item===it.id);if(ex)ex.q+=q;else p.inv.push({id:uid(),item:it.id,n:it.n,q,w:it.w||0});save();toast(`«${it.n}» → ${p.name}`)}
function choosePlayer(it){openSheet(`<div class="sb-title">Кому отдать?</div><div class="sb-sub">${esc(it.n)}</div><div class="list" style="margin-top:14px">${players.map((p,i)=>`<button class="card hero-pick" data-i="${i}">${p.photo?`<img src="${p.photo}">`:`<span>${esc(p.name[0])}</span>`}<div><div class="t">${esc(p.name)}</div><div class="m">${esc(p.cls)} · ${p.inv.length} предм.</div></div></button>`).join('')}</div>`,r=>{
  $$('[data-i]',r).forEach(b=>b.onclick=()=>{giveItem(players[+b.dataset.i],it);closeSheet()})})}
function pickItem(cb){openSheet(`<div class="sb-title">Добавить предмет</div>${searchBox('pq','Меч, зелье, верёвка…','')}<div class="list" id="pl"></div>
  <div class="sec-h">Своё</div><div class="row"><input class="inp grow" id="cn" placeholder="Название"><input class="inp" id="cw" type="number" inputmode="decimal" placeholder="кг" style="width:70px"><button class="btn" id="cok">OK</button></div>`,r=>{
  const fill=q=>{const L=D.items.filter(i=>!q||(i.n).toLowerCase().includes(q)).slice(0,40);$('#pl',r).innerHTML=L.map(i=>`<div class="card" data-id="${i.id}" style="padding:8px 12px"><div class="t" style="font-size:15px">${esc(i.n)}</div><div class="m">${esc(i.sub||i.cat)}${i.w?' · '+kg(i.w):''}</div></div>`).join('')};
  fill('');const qi=$('#pq',r);qi.oninput=()=>fill(qi.value.trim().toLowerCase());
  $('#pl',r).onclick=e=>{const c=e.target.closest('.card');if(!c)return;cb(D.items.find(i=>i.id===c.dataset.id));closeSheet()};
  $('#cok',r).onclick=()=>{const n=$('#cn',r).value.trim();if(!n)return;cb({id:'custom-'+uid(),n,w:+$('#cw',r).value||0});closeSheet()}})}

/* ================= LOOT ================= */
const RCOL={'Обычный':'#a89d95','Необычный':'#5fd07a','Редкий':'#5aa2ff','Очень редкий':'#b67bff','Легендарный':'#ffb547','Артефакт':'#ff5a50','Разная':'#d6b26a'};
const rItemsCatalog=rItems;
let lootTab=LS.get('loottab','cat');let lootRes=LS.get('lootres',null);let lootCfg=LS.get('lootcfg',{tier:0,kind:'hoard'});
rItems=function(){page.oninput=null;page.onclick=null;
  if(lootTab==='cat'){rItemsCatalog();$('.ph',page).insertAdjacentHTML('afterend',lootSeg());bindLootSeg();return}
  const TI=[['0','ПО 0–4'],['1','ПО 5–10'],['2','ПО 11–16'],['3','ПО 17+']];
  page.innerHTML=header('Лут','добыча и сокровища','tri',2)+lootSeg()+`<div class="gen">
   <label class="f">Опасность побеждённых</label>${chips('tier',TI,lootCfg.tier)}
   <label class="f">Что генерировать</label>${chips('kind',[['ind','Карманы (1 враг)'],['hoard','Клад (логово)'],['magic','1 магический предмет']],lootCfg.kind)}
   <button class="btn red" id="gen" style="width:100%;justify-content:center;margin-top:10px;padding:14px;font-size:16px">🜏 Сгенерировать добычу</button></div>
   <div id="lootOut">${lootRes?lootHtml(lootRes):'<div class="empty">Брось кости судьбы — и узнай, что нашли герои.</div>'}</div>
   <p class="muted" style="font-size:11.5px;margin-top:14px">Упрощённый генератор по мотивам таблиц сокровищ (суммы монет ≈ средним из Руководства Мастера; предметы — случайные из справочника нужной редкости).</p>`;
  bindLootSeg();bindChips(page,(n,v)=>{lootCfg[n]=n==='tier'?+v:v;LS.set('lootcfg',lootCfg);rItems()});
  $('#gen').onclick=()=>{lootRes=genLoot(lootCfg.tier,lootCfg.kind);LS.set('lootres',lootRes);$('#lootOut').innerHTML=lootHtml(lootRes);$('#lootOut').animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:350})};
  $('#lootOut').onclick=e=>{const g=e.target.closest('[data-give]');if(g){const it=D.items.find(i=>i.id===g.dataset.give);return choosePlayer(it)}
   const gc=e.target.closest('[data-gold]');if(gc){splitGold(+gc.dataset.gold);return}
   const c=e.target.closest('[data-open]');if(c)showItem(c.dataset.open)}}
function lootSeg(){return `<div class="seg" id="lseg"><button data-t="cat" class="${lootTab==='cat'?'on':''}">Каталог</button><button data-t="gen" class="${lootTab==='gen'?'on':''}">Генератор лута</button></div>`}
function bindLootSeg(){$('#lseg').onclick=e=>{const b=e.target.closest('[data-t]');if(!b)return;lootTab=b.dataset.t;LS.set('loottab',lootTab);rItems()}}
const dsum=(n,d)=>{let s=0;for(let i=0;i<n;i++)s+=rnd(d);return s};
function genLoot(t,kind){const R0={coins:{},items:[]};
  const C=[[['cp',5,6,1],['sp',4,6,1],['gp',3,6,1]],[['sp',4,6,10],['gp',2,6,10],['ep',2,6,10]],[['gp',4,6,10],['pp',1,6,10],['ep',2,6,10]],[['gp',2,6,100],['pp',2,6,10]]];
  const H=[[['cp',6,6,100],['sp',3,6,100],['gp',2,6,10]],[['cp',2,6,100],['sp',2,6,1000],['gp',6,6,100],['pp',3,6,10]],[['gp',4,6,1000],['pp',5,6,100]],[['gp',12,6,1000],['pp',8,6,1000]]];
  if(kind!=='magic'){const tbl=kind==='ind'?C[t]:H[t];tbl.forEach(([c,n,d,m],i)=>{if(kind==='ind'&&i===tbl.length-1&&rnd(2)===1)return;R0.coins[c]=dsum(n,d)*m})}
  const RW=[['Обычный','Необычный'],['Необычный','Редкий'],['Редкий','Очень редкий'],['Очень редкий','Легендарный']][t];
  const nMag=kind==='magic'?1:kind==='hoard'?[1,2,2,3][t]+(rnd(4)===4?1:0):(rnd(6)===6?1:0);
  const pool=r=>D.items.filter(i=>i.cat==='Магические'&&i.rar===r);
  for(let i=0;i<nMag;i++){const r=RW[rnd(10)<=7?0:1];const P=pool(r).length?pool(r):pool('Необычный');R0.items.push(P[rnd(P.length)-1].id)}
  if(kind!=='magic'){const gear=D.items.filter(i=>['Снаряжение','Оружие','Доспехи','Инструменты'].includes(i.cat));const n=kind==='hoard'?2+rnd(3):rnd(2);for(let i=0;i<n;i++)R0.items.push(gear[rnd(gear.length)-1].id)}
  if(kind==='hoard'){const G=[[10,'безделушки'],[50,'самоцветы'],[100,'жемчуг и янтарь'],[500,'драгоценности'],[1000,'изумруды']];const g=G[Math.min(4,t+rnd(2)-1)];R0.gems={n:dsum(2,4),v:g[0],k:g[1]}}
  return R0}
const CN={cp:'мм',sp:'см',ep:'эм',gp:'зм',pp:'пм'};
function lootHtml(r){const gp=Math.round(((r.coins.cp||0)/100+(r.coins.sp||0)/10+(r.coins.ep||0)/2+(r.coins.gp||0)+(r.coins.pp||0)*10+(r.gems?r.gems.n*r.gems.v:0)));
  return `<div class="loot-coins">${Object.entries(r.coins).map(([c,v])=>`<div><b>${v.toLocaleString('ru')}</b><small>${CN[c]}</small></div>`).join('')}${r.gems?`<div class="gem"><b>${r.gems.n}×${r.gems.v}</b><small>зм · ${r.gems.k}</small></div>`:''}</div>
  ${gp?`<button class="btn sm" data-gold="${gp}" style="margin:2px 0 10px">⚖ Всего ≈ ${gp.toLocaleString('ru')} зм — поделить между героями</button>`:''}
  <div class="list">${r.items.map(id=>{const i=D.items.find(x=>x.id===id);if(!i)return'';const c=RCOL[i.rar]||'#aaa';return `<div class="card loot" style="--rc:${c}" data-open="${i.id}"><div class="t">${esc(i.n)}</div><div class="m"><span style="color:${c};font-weight:700">${esc(i.cat==='Магические'?i.rar:i.cat)}</span> · ${esc(i.sub||'')}${i.w?' · '+kg(i.w):''}</div><button class="btn sm red give" data-give="${i.id}">В инвентарь</button></div>`}).join('')}</div>`}
/* 5e кошелёк: мм/см/эм/зм/пм, p.gold = coins.зм (совместимость) */
const CV={мм:1,см:10,эм:50,зм:100,пм:1000},CK=['мм','см','эм','зм','пм'];
function purse(p){if(!p.coins||typeof p.coins!=='object')p.coins={мм:0,см:0,эм:0,зм:+p.gold||0,пм:0};CK.forEach(k=>p.coins[k]=Math.max(0,Math.floor(+p.coins[k]||0)));if(!p._c2){if((+p.gold||0)!==p.coins.зм&&p.coins.зм===0)p.coins.зм=+p.gold||0;p._c2=1}p.gold=p.coins.зм;return p.coins}
const cpOf=p=>{const c=purse(p);return CK.reduce((a,k)=>a+c[k]*CV[k],0)};
const nf=v=>(Math.round(v*100)/100).toLocaleString('ru-RU');
function addCoins(p,c){const P=purse(p);Object.keys(c||{}).forEach(k=>{const kk={pm:'пм',zm:'зм',em:'эм',sm:'см',mm:'мм'}[k]||k;if(CV[kk])P[kk]+=Math.floor(+c[k]||0)});p.gold=P.зм}
function addCp(p,cp){const P=purse(p);cp=Math.floor(cp);[['пм',1000],['зм',100],['см',10],['мм',1]].forEach(([k,v])=>{const n=Math.floor(cp/v);if(k==='пм')return;P[k]+=n;cp-=n*v});p.gold=P.зм}
KM.coin={CV,CK,purse,cpOf,addCoins,addCp,fmtTot:p=>'≈'+nf(cpOf(p)/100),mini:p=>{const c=purse(p);return CK.slice().reverse().filter(k=>c[k]).map(k=>c[k]+' '+k).join(' · ')||'пусто'}};
players.forEach(purse);
function purseUI(p){const draw=()=>openSheet(`<div class="sb-title">Кошелёк — ${esc(p.name)}</div><div class="sb-sub">1 пм = 10 зм · 1 зм = 2 эм = 10 см = 100 мм</div>
 <div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin-top:10px">${CK.slice().reverse().map(k=>`<label style="text-align:center"><small class="muted">${k}</small><input class="inp" data-pc="${k}" type="number" inputmode="numeric" value="${p.coins[k]}" style="text-align:center;padding:8px 2px"></label>`).join('')}</div>
 <p style="margin:10px 0">Всего ≈ <b id="pctot">${nf(cpOf(p)/100)}</b> зм</p><div class="row"><button class="btn grow" id="pcx">Обменять мелочь на золото</button><button class="btn ac" id="pcok">Готово</button></div>`,()=>{
  $$('[data-pc]').forEach(i=>i.oninput=()=>{p.coins[i.dataset.pc]=Math.max(0,+i.value||0);p.gold=p.coins.зм;$('#pctot').textContent=nf(cpOf(p)/100);save()});
  $('#pcx').onclick=()=>{const c=p.coins;const cp=c.мм+c.см*10+c.эм*50;c.мм=cp%10;c.см=Math.floor(cp%100/10);c.эм=0;c.зм+=Math.floor(cp/100);p.gold=c.зм;save();draw()};$('#pcok').onclick=()=>{closeSheet();rPcs()}});draw()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-purse]');if(!b)return;const p=players.find(x=>x.id===b.dataset.purse);if(p)purseUI(p)});
function splitGold(g,coins){const n=players.length;if(!n)return;const cp=coins?CK.reduce((a,k)=>a+(+coins[{мм:'mm',см:'sm',эм:'em',зм:'zm',пм:'pm'}[k]]||+coins[k]||0)*CV[k],0):Math.round(g*100);const each=Math.floor(cp/n),rem=cp-each*n;players.forEach((p,i)=>addCp(p,each+(i===0?rem:0)));save();toast(`Каждому по ${nf(each/100)} зм (монетами)`+(rem?` · остаток ${rem} мм → ${players[0].name}`:''))}
/* item sheet: add give button */
const _showItem=showItem;
showItem=function(id){_showItem(id);const it=D.items.find(x=>x.id===id);if(!it)return;$('#sheetPage').insertAdjacentHTML('beforeend',`<div class="row" style="margin-top:18px"><button class="btn red" id="giveIt">🎒 В инвентарь</button></div>`);$('#giveIt').onclick=()=>choosePlayer(it)};
/* rarity colors in catalog */
const _fillIt=fillIt;fillIt=function(){_fillIt();$$('#itList .badge').forEach(b=>{const c=RCOL[b.textContent];if(c){b.style.color=c;b.style.borderColor=c+'66';b.style.background=c+'1f'}})};

/* ================= MAP BUILDER ================= */
const TILES=[['floor','Пол','#3b3430'],['wall','Стена','#141110'],['door','Дверь','#7a4a22'],['water','Вода','#1d4f73'],['tree','Деревья','#24502a'],['lava','Лава','#c2380e'],['stairs','Лестница','#6b625b'],['chest','Сундук','#3b3430'],['trap','Ловушка','#3b3430'],['grass','Трава','#3d5b2a']];
const TC=Object.fromEntries(TILES.map(t=>[t[0],t]));
let maps=LS.get('maps',null);
if(!maps){maps=[sampleMap()];LS.set('maps',maps)}
let mapCur=LS.get('mapcur',maps[0].id);
let mt={tool:'pan',tile:'wall',fogView:false,tokKind:'pc',locked:true,autoLock:LS.get('autolock',true)};
const snap=m=>JSON.stringify({g:m.g,fog:m.fog,tok:m.tok});
function histPush(m){m.hist=m.hist||[];m.redo=[];m.hist.push(snap(m));if(m.hist.length>60)m.hist.shift()}
function histMove(m,from,to){if(!(m[from]||[]).length)return false;m[to]=m[to]||[];m[to].push(snap(m));const o=JSON.parse(m[from].pop());m.g=o.g;m.fog=o.fog;m.tok=o.tok;saveMaps();return true}
let relockT;
let view=LS.get('mapview',{s:1,x:0,y:0});
function sampleMap(){const W=20,H=20,g=Array(W*H).fill('');const set=(x,y,t)=>{if(x>=0&&y>=0&&x<W&&y<H)g[y*W+x]=t};
  for(let y=2;y<12;y++)for(let x=2;x<11;x++)set(x,y,(x===2||x===10||y===2||y===11)?'wall':'floor');set(10,6,'door');
  for(let y=5;y<16;y++)for(let x=11;x<18;x++)set(x,y,(x===11||x===17||y===5||y===15)?'wall':'floor');set(11,6,'door');set(14,15,'door');
  set(15,8,'chest');set(13,12,'trap');set(4,4,'stairs');for(let x=3;x<7;x++)set(x,9,'water');for(let y=13;y<20;y++)for(let x=0;x<8;x++)if(rnd(3)===1)set(x,y,'tree');else set(x,y,'grass');set(15,17,'lava');set(16,17,'lava');set(16,18,'lava');
  return {id:uid(),name:'Логово гоблинов',W,H,g,fog:Array(W*H).fill(0),tok:[{id:uid(),x:5,y:6,n:'Э',c:'#d6b26a',k:'pc'},{id:uid(),x:6,y:6,n:'Б',c:'#d6b26a',k:'pc'},{id:uid(),x:5,y:7,n:'Л',c:'#d6b26a',k:'pc'},{id:uid(),x:14,y:9,n:'Г',c:'#d42a22',k:'mon'},{id:uid(),x:15,y:11,n:'Г',c:'#d42a22',k:'mon'}]}}
const curMap=()=>maps.find(m=>m.id===mapCur)||maps[0];
const saveMaps=()=>{try{const cm=maps.find(x=>x.id===mapCur);if(cm)cm.rev=(cm.rev||0)+1;LS.set('maps',maps);LS.set('mapcur',mapCur)}catch(e){toast('Хранилище переполнено')}};
function rMap(){page.oninput=null;page.onclick=null;const m=curMap();
  page.innerHTML=header('Карта','конструктор подземелий','pent',0)+`
  <div class="row" style="margin-bottom:8px"><select class="inp grow" id="mSel">${maps.map(x=>`<option value="${x.id}"${x.id===m.id?' selected':''}>${esc(x.name)} (${x.W}×${x.H})</option>`).join('')}</select><button class="btn sm" id="mNew">＋</button><button class="btn sm" id="mMenu">⋯</button></div>
  <div class="row" style="margin:8px 0"><button class="btn sm${mt.locked?'':' red'}" id="mLock">${mt.locked?'🔒 Редактировать':'🔓 Готово (заблокировать)'}</button><button class="btn sm" id="mUndo" aria-label="Отменить">↶ Отменить</button><button class="btn sm" id="mRedo" aria-label="Повторить">↷ Повторить</button></div>
  <div class="seg tools" id="mtools">${[['paint','🖌 Кисть'],['erase','⌫ Стереть'],['token','◉ Фишка'],['fog','☁ Туман'],['pan','✋ Двигать']].map(([k,l])=>`<button data-t="${k}" class="${!mt.locked&&mt.tool===k?'on':''}">${l}</button>`).join('')}</div>
    <div class="map-wrap" id="mw"><canvas id="mc"></canvas><div class="zoom"><button id="zi">＋</button><button id="zo">−</button><button id="zf">⤢</button></div></div>
<div id="mopts"></div><label class="row muted" style="font-size:12.5px;margin-top:8px"><input type="checkbox" id="mAuto"${mt.autoLock?' checked':''}> Автоблокировка через 30 с бездействия</label>`;
  const setLock=v=>{mt.locked=v;if(v)mt.tool='pan';rMap();if(!v)toast('Режим правки: можно рисовать')};
  $('#mLock').onclick=()=>setLock(!mt.locked);$('#mAuto').onchange=e=>{mt.autoLock=e.target.checked;LS.set('autolock',mt.autoLock)};
  const bump=()=>{clearTimeout(relockT);if(mt.autoLock&&!mt.locked)relockT=setTimeout(()=>{if(S.sec===SECTIONS.findIndex(x=>x[0]==='map')&&!mt.locked){setLock(true);toast('Карта заблокирована')}else mt.locked=true},30000)};bump();
  $('#mUndo').onclick=()=>{histMove(m,'hist','redo')?draw():toast('Нечего отменять')};$('#mRedo').onclick=()=>{histMove(m,'redo','hist')?draw():toast('Нечего повторять')};
  $('#mSel').onchange=e=>{mapCur=e.target.value;saveMaps();view={s:1,x:0,y:0};rMap()};
  $('#mNew').onclick=newMap;$('#mMenu').onclick=mapMenu;
  $('#mtools').onclick=e=>{const b=e.target.closest('[data-t]');if(!b)return;mt.tool=b.dataset.t;if(mt.locked&&mt.tool!=='pan'){mt.locked=false;$('#mLock').textContent='🔓 Готово (заблокировать)';$('#mLock').classList.add('red')}$$('#mtools button').forEach(x=>x.classList.toggle('on',x===b));opts()};
  const cv=$('#mc'),wrap=$('#mw');const dpr=Math.min(2,devicePixelRatio||1);const CS=32;
  function size(){const w=wrap.clientWidth,h=wrap.clientHeight;cv.width=w*dpr;cv.height=h*dpr;cv.style.width=w+'px';cv.style.height=h+'px';draw()}
  function fit(){const w=wrap.clientWidth,h=wrap.clientHeight;view.s=Math.min(w/(m.W*CS),h/(m.H*CS));view.x=(w-m.W*CS*view.s)/2;view.y=(h-m.H*CS*view.s)/2;draw()}
  function draw(){const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.fillStyle='#070505';g.fillRect(0,0,cv.width,cv.height);g.translate(view.x,view.y);g.scale(view.s,view.s);
    drawMap(g,m,CS,mt.fogView?1:.55);}
  function opts(){const O=$('#mopts');
    if(mt.tool==='paint')O.innerHTML=`<div class="tiles">${TILES.map(([k,l,c])=>`<button data-tile="${k}" class="${mt.tile===k?'on':''}"><i style="background:${c}">${tileIcon(k)}</i>${l}</button>`).join('')}</div>`;
    else if(mt.tool==='token')O.innerHTML=`${chips('tk',[['pc','Герой'],['mon','Монстр'],['npc','НИП'],['del','Удалить фишку']],mt.tokKind)}<div class="muted" style="font-size:12.5px">Тапни клетку — поставить. Перетащи фишку — двигать.</div><div class="row" style="margin-top:6px">${players.map(p=>`<button class="btn sm" data-pp="${p.id}">${esc(p.name)}</button>`).join('')}</div>`;
    else if(mt.tool==='fog')O.innerHTML=`${chips('fv',[['0','Вид Мастера'],['1','Вид игроков']],mt.fogView?1:0)}<div class="row" style="margin-top:6px"><button class="btn sm" id="fAll">Скрыть всё</button><button class="btn sm" id="fNone">Открыть всё</button></div><div class="muted" style="font-size:12.5px;margin-top:6px">Води пальцем: скрытые клетки открываются, открытые — скрываются.</div>`;
    else O.innerHTML=`<div class="muted" style="font-size:12.5px">${mt.locked?'🔒 Карта заблокирована: касания только двигают и масштабируют. Нажми «Редактировать» или выбери инструмент.':'Двумя пальцами — зум и сдвиг в любом режиме.'}</div>`;
    $$('[data-tile]',O).forEach(b=>b.onclick=()=>{mt.tile=b.dataset.tile;opts()});
    bindChips(O,(n,v)=>{if(n==='tk')mt.tokKind=v;if(n==='fv'){mt.fogView=v==='1';draw()}opts()});
    $$('[data-pp]',O).forEach(b=>b.onclick=()=>{histPush(m);const p=players.find(x=>x.id===b.dataset.pp);m.tok.push({id:uid(),x:Math.floor(m.W/2),y:Math.floor(m.H/2),n:p.name[0],c:'#d6b26a',k:'pc',photo:p.photo||null});saveMaps();draw()});
    const fa=$('#fAll',O);if(fa){fa.onclick=()=>{histPush(m);m.fog.fill(1);saveMaps();draw()};$('#fNone',O).onclick=()=>{histPush(m);m.fog.fill(0);saveMaps();draw()}}}
  // input
  const dist=t=>{let d=document.getElementById('mdist');if(!t){d&&d.remove();return}if(!d){d=document.createElement('div');d.id='mdist';d.style.cssText='position:absolute;left:50%;top:10px;transform:translateX(-50%);background:rgba(10,6,5,.85);color:#e8c77a;border:1px solid #a87b3e;border-radius:12px;padding:4px 12px;font-size:15px;pointer-events:none;z-index:5';$('#mw').append(d)}d.textContent=t};
  const pts=new Map();let gest=null,drag=null,fogMode=null,last=null;
  const cell=(cx,cy)=>{const r=cv.getBoundingClientRect();const x=Math.floor(((cx-r.left)-view.x)/view.s/CS),y=Math.floor(((cy-r.top)-view.y)/view.s/CS);return x>=0&&y>=0&&x<m.W&&y<m.H?{x,y}:null};
  function apply(c){if(!c)return;const i=c.y*m.W+c.x;if(last===i)return;last=i;
    if(mt.tool==='paint')m.g[i]=mt.tile;else if(mt.tool==='erase'){m.g[i]='';m.tok=m.tok.filter(t=>t.x!==c.x||t.y!==c.y)}
    else if(mt.tool==='fog'){if(fogMode==null)fogMode=m.fog[i]?0:1;m.fog[i]=fogMode}draw()}
  cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pts.size===2){if(drag&&drag.snap){const o=JSON.parse(drag.snap);m.g=o.g;m.fog=o.fog;m.tok=o.tok;if(m.hist&&m.hist.length)m.hist.pop();draw()}drag=null;dist(null);const [a,b]=[...pts.values()];gest={d:Math.hypot(a.x-b.x,a.y-b.y),cx:(a.x+b.x)/2,cy:(a.y+b.y)/2,v:{...view}};return}
    last=null;fogMode=null;const c=cell(e.clientX,e.clientY);
    bump();if(mt.locked||mt.tool==='pan'){drag={pan:1,x:e.clientX,y:e.clientY,v:{...view}};return}
    if(mt.tool==='token'&&c){const t=m.tok.find(t=>t.x===c.x&&t.y===c.y);if(mt.tokKind==='del'){if(t){histPush(m);m.tok=m.tok.filter(z=>z!==t);saveMaps();draw()}return}
      if(t){const sn=JSON.stringify({g:m.g,fog:m.fog,tok:m.tok});histPush(m);drag={tok:m.tok.find(z=>z.id===t.id)||t,snap:sn,ox:t.x,oy:t.y};return}histPush(m);const n=mt.tokKind==='pc'?'Г':mt.tokKind==='mon'?'М':'N';const lbl=prompt('Буква/имя фишки',n);if(lbl==null)return;m.tok.push({id:uid(),x:c.x,y:c.y,n:lbl.slice(0,2),c:mt.tokKind==='pc'?'#d6b26a':mt.tokKind==='mon'?'#d42a22':'#5aa2ff',k:mt.tokKind});saveMaps();draw();return}
    const sn=JSON.stringify({g:m.g,fog:m.fog,tok:m.tok});if(c)histPush(m);drag={paint:1,snap:sn};apply(c)});
  cv.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(gest&&pts.size>=2){const [a,b]=[...pts.values()];const d=Math.hypot(a.x-b.x,a.y-b.y),cx=(a.x+b.x)/2,cy=(a.y+b.y)/2;const r=cv.getBoundingClientRect();
      const s=Math.max(.3,Math.min(4,gest.v.s*d/gest.d));const k=s/gest.v.s;view.s=s;view.x=(gest.cx-r.left)-((gest.cx-r.left)-gest.v.x)*k+(cx-gest.cx);view.y=(gest.cy-r.top)-((gest.cy-r.top)-gest.v.y)*k+(cy-gest.cy);draw();return}
    if(!drag)return;if(drag.pan){view.x=drag.v.x+e.clientX-drag.x;view.y=drag.v.y+e.clientY-drag.y;draw()}
    else if(drag.tok){const c=cell(e.clientX,e.clientY);if(c&&(m.g[c.y*m.W+c.x]==='wall'||window.KM_SOLID&&KM_SOLID(m,c.x,c.y))){dist('⛔ Стена');return}if(c){drag.tok.x=c.x;drag.tok.y=c.y;dist(`${Math.max(Math.abs(c.x-drag.ox),Math.abs(c.y-drag.oy))} кл · ${(Math.max(Math.abs(c.x-drag.ox),Math.abs(c.y-drag.oy))*1.5).toLocaleString('ru')} м`);draw()}}else if(drag.paint)apply(cell(e.clientX,e.clientY))});
  const up=e=>{pts.delete(e.pointerId);dist(null);if(pts.size<2)gest=null;if(!pts.size){if(drag&&!drag.pan)saveMaps();drag=null;LS.set('mapview',view)}};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  $('#zi').onclick=()=>zoom(1.25);$('#zo').onclick=()=>zoom(.8);$('#zf').onclick=fit;
  function zoom(k){const w=wrap.clientWidth/2,h=wrap.clientHeight/2;const s=Math.max(.3,Math.min(4,view.s*k));const kk=s/view.s;view.x=w-(w-view.x)*kk;view.y=h-(h-view.y)*kk;view.s=s;LS.set('mapview',view);draw()}
  opts();size();if(!LS.get('mapview',null)||view._fit!==m.id){fit();view._fit=m.id}
  window.KM.mapDraw=draw;KM.mapCur=()=>curMap();KM.mapSave=()=>saveMaps();KM.mapView=()=>view;KM.mapPan=(x,y)=>{view.x=wrap.clientWidth/2-(x+.5)*CS*view.s;view.y=wrap.clientHeight/2-(y+.5)*CS*view.s;LS.set('mapview',view);draw()}}
function tileIcon(k){return {door:'▮',stairs:'≡',chest:'▣',trap:'✕',tree:'♣',water:'≈',lava:'≈'}[k]||''}
function drawMap(g,m,CS,fogA){
  for(let y=0;y<m.H;y++)for(let x=0;x<m.W;x++){const t=m.g[y*m.W+x];const X=x*CS,Y=y*CS;
    if(!t){g.fillStyle=(x+y)%2?'#100c0b':'#0d0a09';g.fillRect(X,Y,CS,CS);continue}
    const base=t==='chest'||t==='trap'?'floor':t;g.fillStyle=TC[base][2];g.fillRect(X,Y,CS,CS);
    if(t==='wall'){g.fillStyle='#2a2320';g.fillRect(X+1,Y+1,CS-2,CS/2-2);g.fillRect(X+1,Y+CS/2+1,CS-2,CS/2-2);g.fillStyle='#0a0807';g.fillRect(X+CS/2,Y,1,CS/2);g.fillRect(X+CS/4,Y+CS/2,1,CS/2)}
    if(t==='floor'||t==='chest'||t==='trap'){g.strokeStyle='rgba(255,255,255,.04)';g.strokeRect(X+.5,Y+.5,CS-1,CS-1)}
    if(t==='water'||t==='lava'){g.strokeStyle=t==='water'?'rgba(140,200,255,.35)':'rgba(255,220,120,.55)';g.lineWidth=1.5;for(let k=0;k<2;k++){g.beginPath();g.moveTo(X+4,Y+10+k*12);g.quadraticCurveTo(X+10,Y+5+k*12,X+16,Y+10+k*12);g.quadraticCurveTo(X+22,Y+15+k*12,X+28,Y+10+k*12);g.stroke()}g.lineWidth=1}
    if(t==='tree'){g.fillStyle='#173a1c';g.beginPath();g.arc(X+CS/2,Y+CS/2,CS*.42,0,7);g.fill();g.fillStyle='#2f6b35';g.beginPath();g.arc(X+CS/2-3,Y+CS/2-3,CS*.26,0,7);g.fill()}
    if(t==='grass'){g.strokeStyle='rgba(140,200,90,.35)';for(let k=0;k<3;k++){g.beginPath();g.moveTo(X+6+k*9,Y+24);g.lineTo(X+8+k*9,Y+16);g.stroke()}}
    if(t==='door'){g.fillStyle='#3b3430';g.fillRect(X,Y,CS,CS);g.fillStyle='#8a5526';g.fillRect(X+4,Y+3,CS-8,CS-6);g.fillStyle='#e0b060';g.fillRect(X+CS-11,Y+CS/2-1,3,3)}
    if(t==='stairs'){g.fillStyle='#4a423c';for(let k=0;k<5;k++){g.fillRect(X+3,Y+3+k*6,CS-6,4)}}
    if(t==='chest'){g.fillStyle='#6b3e18';g.fillRect(X+6,Y+10,CS-12,CS-16);g.fillStyle='#d6b26a';g.fillRect(X+6,Y+14,CS-12,2);g.fillRect(X+CS/2-2,Y+15,4,5)}
    if(t==='trap'){g.strokeStyle='#d42a22';g.lineWidth=2.5;g.beginPath();g.moveTo(X+8,Y+8);g.lineTo(X+CS-8,Y+CS-8);g.moveTo(X+CS-8,Y+8);g.lineTo(X+8,Y+CS-8);g.stroke();g.lineWidth=1}}
  g.strokeStyle='rgba(255,255,255,.06)';g.beginPath();for(let x=0;x<=m.W;x++){g.moveTo(x*CS,0);g.lineTo(x*CS,m.H*CS)}for(let y=0;y<=m.H;y++){g.moveTo(0,y*CS);g.lineTo(m.W*CS,y*CS)}g.stroke();
  m.tok.forEach(t=>{const X=t.x*CS+CS/2,Y=t.y*CS+CS/2;if(fogA>=1&&m.fog[t.y*m.W+t.x])return;g.fillStyle='rgba(0,0,0,.5)';g.beginPath();g.arc(X+1,Y+2,CS*.4,0,7);g.fill();
    g.fillStyle=t.c;g.beginPath();g.arc(X,Y,CS*.4,0,7);g.fill();g.strokeStyle='#fff';g.lineWidth=2;g.stroke();g.lineWidth=1;
    g.fillStyle=t.k==='pc'?'#1a1208':'#fff';g.font=`800 ${t.n.length>1?11:15}px Manrope,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(t.n,X,Y+1)});
  for(let i=0;i<m.fog.length;i++)if(m.fog[i]){const x=i%m.W,y=(i/m.W)|0;g.fillStyle=`rgba(5,3,3,${fogA})`;g.fillRect(x*CS,y*CS,CS,CS);if(fogA<1){g.fillStyle='rgba(120,120,140,.12)';g.fillRect(x*CS,y*CS,CS,CS)}}}
function newMap(){openSheet(`<div class="sb-title">Новая карта</div><label class="f">Название</label><input class="inp" id="nn" value="Подземелье ${maps.length+1}">
  <div class="row"><div class="grow"><label class="f">Ширина</label><input class="inp" id="nw" type="number" value="20"></div><div class="grow"><label class="f">Высота</label><input class="inp" id="nh" type="number" value="20"></div></div>
  <div class="muted" style="font-size:12.5px;margin-top:6px">1 клетка = 1,5 м</div><div class="row" style="margin-top:14px"><button class="btn red" id="nok">Создать</button></div>`,r=>{
  $('#nok',r).onclick=()=>{const W=Math.max(5,Math.min(60,+$('#nw',r).value||20)),H=Math.max(5,Math.min(60,+$('#nh',r).value||20));const mm={id:uid(),name:$('#nn',r).value||'Карта',W,H,g:Array(W*H).fill(''),fog:Array(W*H).fill(0),tok:[]};maps.push(mm);mapCur=mm.id;saveMaps();view={s:1,x:0,y:0};closeSheet();rMap()}})}
function mapMenu(){const m=curMap();openSheet(`<div class="sb-title">${esc(m.name)}</div><div class="list" style="margin-top:14px">
  <button class="btn" id="mx1">🖼 Экспорт PNG</button><button class="btn" id="mx2">✎ Переименовать</button><button class="btn" id="mx3">⧉ Дублировать</button><button class="btn" id="mx5">▦ Залить всё полом</button><button class="btn dark" id="mx4">✕ Удалить карту</button></div>`,r=>{
  $('#mx1',r).onclick=()=>exportPNG(m);
  $('#mx2',r).onclick=()=>{const n=prompt('Название',m.name);if(n){m.name=n;saveMaps();closeSheet();rMap()}};
  $('#mx3',r).onclick=()=>{const c=JSON.parse(JSON.stringify(m));c.id=uid();c.name+=' (копия)';maps.push(c);mapCur=c.id;saveMaps();closeSheet();rMap()};
  $('#mx5',r).onclick=()=>{histPush(m);m.g=m.g.map(t=>t||'floor');saveMaps();closeSheet();rMap()};
  $('#mx4',r).onclick=()=>{if(maps.length<2)return toast('Должна остаться хотя бы одна карта');const old=maps.slice();maps=maps.filter(x=>x!==m);mapCur=maps[0].id;saveMaps();closeSheet();rMap();KM.undoToast('Карта «'+m.name+'» удалена',()=>{maps=old;mapCur=m.id;saveMaps();rMap()})}})}
function exportPNG(m){const CS=48,c=document.createElement('canvas');c.width=m.W*CS;c.height=m.H*CS;const g=c.getContext('2d');g.scale(CS/32,CS/32);drawMap(g,m,32,1);
  c.toBlob(b=>{const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=(m.name||'map')+'.png';document.body.append(a);a.click();a.remove();
   openSheet(`<div class="sb-title">Экспорт</div><div class="sb-sub">Зажми картинку, чтобы сохранить в Фото</div><img src="${u}" style="width:100%;margin-top:12px;border-radius:12px">`)},'image/png')}
setTimeout(()=>window.__boot(),0);
