'use strict';/*bundle*/
/* sheet.js */
'use strict';{
/* ===== Paperless: full hero sheet, roll entry, level-up, encounter builder, campaign ===== */
const SK=[['Акробатика',1],['Анализ',3],['Атлетика',0],['Внимательность',4],['Выживание',4],['Выступление',5],['Запугивание',5],['История',3],['Ловкость рук',1],['Магия',3],['Медицина',4],['Обман',5],['Природа',3],['Проницательность',4],['Религия',3],['Скрытность',1],['Убеждение',5],['Уход за животными',4]];
const AB=['СИЛ','ЛОВ','ТЕЛ','ИНТ','МДР','ХАР'];
const HD={'Варвар':12,'Воин':10,'Паладин':10,'Следопыт':10,'Бард':8,'Жрец':8,'Друид':8,'Монах':8,'Плут':8,'Колдун':8,'Изобретатель':8,'Волшебник':6,'Чародей':6};
const XPL=[0,300,900,2700,6500,14000,23000,34000,48000,64000,85000,100000,120000,140000,165000,195000,225000,265000,305000,355000];
const md=v=>Math.floor((v-10)/2),fm=v=>(v>=0?'+':'')+v,pb=l=>2+Math.floor((Math.max(1,l)-1)/4);
const hdOf=p=>{for(const k in HD)if((p.cls||'').toLowerCase().includes(k.toLowerCase()))return HD[k];return 8};
function fix(p){p.prof=p.prof||[];p.exp=p.exp||[];p.svp=p.svp||[];p.thp=p.thp||0;p.hdu=p.hdu||0;p.ds=p.ds||{s:0,f:0};p.exh=p.exh||0;p.insp=!!p.insp;p.coins=p.coins||{мм:0,см:0,эм:0,зм:p.gold||0,пм:0};p.xp=p.xp||0;p.spd=p.spd||9;p.feat=p.feat||'';p.profs=p.profs||'';return p}
const skMod=(p,i)=>md(p.st[SK[i][1]])+(p.exp.includes(i)?2*pb(p.lvl):p.prof.includes(i)?pb(p.lvl):0);
const svMod=(p,j)=>md(p.st[j])+(p.svp.includes(j)?pb(p.lvl):0);
/* ---- roll entry: physical die or virtual, vs AC/DC ---- */
function rollEntry(o){let adv=0;const die=o.die||20;
 openSheet(`<div class="sb-title">${esc(o.label)}</div><div class="sb-sub">${o.mod!=null?'модификатор '+fm(o.mod):''}${o.vs?` · против ${o.vsL||'СЛ'} ${o.vs}`:''}</div>
 ${die===20?chips('adv',[['0','Обычный'],['1','Преимущество'],['-1','Помеха']],0):''}
 <div class="re-out" id="reo">Введи, что выпало на кубике</div>
 <div class="re-pad">${Array.from({length:die},(_,i)=>`<button data-v="${i+1}" class="${i+1===die?'n20':i===0?'n1':''}">${i+1}</button>`).join('')}</div>
 <div class="row" style="margin-top:10px"><button class="btn red grow" id="rev">🎲 Бросить за меня</button></div>`,r=>{
 bindChips(r,(n,v)=>{adv=+v});
 const show=(nat,extra)=>{const t=nat+(o.mod||0);let h=`<b class="re-t">${t}</b> <small>(${extra||nat}${o.mod?' '+fm(o.mod):''})</small>`;let ok=null;
  if(o.vs!=null){ok=die===20&&nat===20&&o.atk?true:die===20&&nat===1&&o.atk?false:t>=o.vs;h+=`<div class="re-v ${ok?'ok':'no'}">${die===20&&nat===20?'Критическое попадание! ':die===20&&nat===1?'Критический провал. ':''}${ok?(o.atk?'Попадание':'Успех'):(o.atk?'Промах':'Провал')}</div>`}
  else if(die===20&&nat===20)h+='<div class="re-v ok">Натуральная 20!</div>';else if(die===20&&nat===1)h+='<div class="re-v no">Натуральная 1</div>';
  $('#reo',r).innerHTML=h;$('#reo',r).classList.remove('pop');void $('#reo',r).offsetWidth;$('#reo',r).classList.add('pop');
  KM.logS&&KM.logS(`${o.label}: ${t}${ok==null?'':ok?' — успех':' — провал'}`);
  if(o.on)o.on(t,nat,ok,r)};
 $('.re-pad',r).onclick=e=>{const b=e.target.closest('[data-v]');if(b)show(+b.dataset.v)};
 $('#rev',r).onclick=()=>{const a=1+Math.floor(Math.random()*die),b=1+Math.floor(Math.random()*die);const n=adv>0?Math.max(a,b):adv<0?Math.min(a,b):a;show(n,adv?`${a} и ${b}`:null)}})}
KM.rollEntry=rollEntry;
/* ---- full hero sheet ---- */
function heroSheet(p,tab){fix(p);tab=tab||'main';const P=pb(p.lvl),nx=XPL[Math.min(19,p.lvl)];
 const T=[['main','Основное'],['skills','Навыки'],['gear','Кошель'],['feat','Черты'],['lvl','Уровень']];
 let h=`<div class="sb-title">${esc(p.name)}</div><div class="sb-sub">${esc(p.cls)} · ${p.lvl} ур. · мастерство ${fm(P)}</div><div class="seg" id="hst">${T.map(([k,l])=>`<button data-t="${k}" class="${k===tab?'on':''}">${l}</button>`).join('')}</div>`;
 if(tab==='main'){h+=`<div class="hs-grid"><div class="hs-box"><small>Хиты</small><b>${p.hp}<i>/${p.maxhp}</i></b><div class="row"><button class="btn sm" data-hp="-1">−</button><button class="btn sm" data-hp="1">＋</button><button class="btn sm red" data-dmg>Урон/лечение</button></div></div>
  <div class="hs-box"><small>Врем. хиты</small><b>${p.thp}</b><div class="row"><button class="btn sm" data-thp="-1">−</button><button class="btn sm" data-thp="1">＋</button><button class="btn sm" data-thp="0">0</button></div></div>
  <div class="hs-box"><small>Кости хитов к${hdOf(p)}</small><b>${p.lvl-p.hdu}<i>/${p.lvl}</i></b><button class="btn sm" data-spendhd ${p.lvl-p.hdu>0?'':'disabled'}>Потратить</button></div>
  <div class="hs-box"><small>КД · Скорость · Иниц.</small><b>${p.ac} · ${p.spd} м · ${fm(md(p.st[1]))}</b><button class="btn sm" data-init>Бросок инициативы</button></div></div>
  <div class="hs-row"><button class="chip${p.insp?' on':''}" data-insp>✦ Вдохновение</button><span class="muted">Истощение</span>${[0,1,2,3,4,5,6].map(i=>`<button class="pip${p.exh>=i&&i?' on':''}" data-exh="${i}">${i||'0'}</button>`).join('')}</div>
  ${p.hp<=0?`<div class="hs-ds"><b>Спасброски от смерти</b><div>Успехи ${[1,2,3].map(i=>`<button class="pip g${p.ds.s>=i?' on':''}" data-ds="s${i}"></button>`).join('')}</div><div>Провалы ${[1,2,3].map(i=>`<button class="pip r${p.ds.f>=i?' on':''}" data-ds="f${i}"></button>`).join('')}</div><button class="btn sm red" data-dsroll>Бросок к20</button></div>`:''}
  <div class="sec-h">Спасброски</div><div class="hs-sv">${AB.map((a,j)=>`<button data-sv="${j}" class="${p.svp.includes(j)?'on':''}"><small>${a}</small><b>${fm(svMod(p,j))}</b></button>`).join('')}</div>
  <div class="muted" style="font-size:12px">Тап — бросок. Долгий тап — владение.</div>
  <div class="row" style="margin-top:10px"><button class="btn" data-rest="s">☾ Короткий отдых</button><button class="btn" data-rest="l">☀ Долгий отдых</button></div>`}
 if(tab==='skills')h+=`<div class="hs-sk">${SK.map(([n,a],i)=>`<div class="hs-s"><button class="dot${p.exp.includes(i)?' x':p.prof.includes(i)?' on':''}" data-pr="${i}" aria-label="Владение"></button><span data-sk="${i}">${n} <small>${AB[a]}</small></span><b data-sk="${i}">${fm(skMod(p,i))}</b></div>`).join('')}</div><div class="muted" style="font-size:12px;margin-top:6px">Кружок: нет → владение → компетентность. Тап по навыку — проверка (можно ввести число с кубика). Пассивная Внимательность: <b>${10+skMod(p,3)}</b></div>`;
 if(tab==='gear')h+=`<div class="hs-coins">${['мм','см','эм','зм','пм'].map(c=>`<label><small>${c}</small><input type="number" inputmode="numeric" data-coin="${c}" value="${p.coins[c]}"></label>`).join('')}</div><div class="muted" style="font-size:12.5px;margin:6px 0">Всего ≈ <b>${(p.coins.мм/100+p.coins.см/10+p.coins.эм/2+ +p.coins.зм+p.coins.пм*10).toFixed(1)} зм</b></div><div class="row"><button class="btn sm" data-conv>Обменять мелочь на золото</button></div><div class="muted" style="margin-top:10px;font-size:12.5px">Инвентарь — на карточке героя (${p.inv.length} предм.)</div>`;
 if(tab==='feat')h+=`<label class="f">Владения (доспехи, оружие, инструменты, языки)</label><textarea class="inp" data-tx="profs" rows="3">${esc(p.profs)}</textarea><label class="f">Умения и черты</label><textarea class="inp" data-tx="feat" rows="6" placeholder="Ярость (2/день), Безрассудная атака…">${esc(p.feat)}</textarea><label class="f">Раса · предыстория</label><input class="inp" data-tx="race" value="${esc(p.race||'')}">`;
 if(tab==='lvl')h+=`<div class="hs-box"><small>Опыт</small><b>${p.xp.toLocaleString('ru')}<i> / ${nx.toLocaleString('ru')}</i></b><div class="hpbar"><i style="width:${Math.min(100,p.xp/nx*100)}%"></i></div><div class="row"><input class="inp" id="xpa" type="number" inputmode="numeric" placeholder="+ опыт" style="flex:1"><button class="btn sm" data-xp>Начислить</button></div></div>
  <button class="btn red" data-lvlup style="margin-top:12px;width:100%">⬆ Повысить до ${p.lvl+1} уровня</button><div class="muted" style="font-size:12.5px;margin-top:6px">Хиты +${Math.floor(hdOf(p)/2)+1+md(p.st[2])} (среднее к${hdOf(p)} + ТЕЛ), кость хитов, бонус мастерства, ячейки заклинаний — автоматически. ${p.xp>=nx?'<b style="color:#c9a45a">Опыта хватает!</b>':''}</div>`;
 openSheet(h,r=>{const re=t=>{save();heroSheet(p,t||tab);KM.rPcsSoft&&KM.rPcsSoft()};
  $('#hst',r).onclick=e=>{const b=e.target.closest('[data-t]');if(b)heroSheet(p,b.dataset.t)};
  r.oninput=e=>{const t=e.target;if(t.dataset.coin){p.coins[t.dataset.coin]=+t.value||0;p.gold=p.coins.зм;save()}if(t.dataset.tx){p[t.dataset.tx]=t.value;save()}};
  let lp;r.onpointerdown=e=>{const b=e.target.closest('[data-sv]');if(b)lp=setTimeout(()=>{lp='x';const j=+b.dataset.sv;p.svp=p.svp.includes(j)?p.svp.filter(x=>x!==j):[...p.svp,j];re()},500)};r.onpointerup=()=>{if(lp!=='x')clearTimeout(lp)};
  r.onclick=e=>{const t=e.target,d=t.closest('button,[data-sk]')?.dataset||{};
   if(d.hp){p.hp=Math.max(0,Math.min(p.maxhp,p.hp+ +d.hp));re()}
   if(d.thp!=null&&t.closest('[data-thp]')){p.thp=+d.thp?Math.max(0,p.thp+ +d.thp):0;re()}
   if(t.closest('[data-dmg]'))return dmgHeal(p,()=>heroSheet(p,'main'));
   if(t.closest('[data-spendhd]')){const D=hdOf(p);rollEntry({label:`Кость хитов к${D}`,die:D,mod:md(p.st[2]),on:(v)=>{p.hdu++;p.hp=Math.min(p.maxhp,p.hp+Math.max(1,v));save();setTimeout(()=>heroSheet(p,'main'),900);toast(`+${Math.max(1,v)} хитов`)}})}
   if(t.closest('[data-init]'))rollEntry({label:p.name+': инициатива',mod:md(p.st[1]),on:v=>{p.init=v;save()}});
   if(t.closest('[data-insp]')){p.insp=!p.insp;re()}
   if(d.exh!=null&&t.closest('[data-exh]')){p.exh=+d.exh;re()}
   if(d.ds){const k=d.ds[0],n=+d.ds[1];p.ds[k]=p.ds[k]>=n?n-1:n;re()}
   if(t.closest('[data-dsroll]'))rollEntry({label:'Спасбросок от смерти',mod:0,vs:10,on:(v,nat)=>{if(nat===20){p.hp=1;p.ds={s:0,f:0};toast('Встаёт с 1 хитом!')}else if(nat===1)p.ds.f=Math.min(3,p.ds.f+2);else if(v>=10)p.ds.s=Math.min(3,p.ds.s+1);else p.ds.f=Math.min(3,p.ds.f+1);if(p.ds.s>=3)toast(p.name+' стабилизирован');if(p.ds.f>=3)toast(p.name+' погиб…');save()}});
   if(d.sv!=null&&t.closest('[data-sv]')&&lp!=='x'){const j=+d.sv;rollEntry({label:`${p.name}: спасбросок ${AB[j]}`,mod:svMod(p,j)})}
   if(d.pr!=null){const i=+d.pr;if(p.exp.includes(i))p.exp=p.exp.filter(x=>x!==i);else if(p.prof.includes(i)){p.prof=p.prof.filter(x=>x!==i);p.exp.push(i)}else p.prof.push(i);if(i===3)p.pp=10+skMod(p,3);re()}
   if(d.sk!=null&&!t.closest('[data-pr]')){const i=+d.sk;rollEntry({label:`${p.name}: ${SK[i][0]}`,mod:skMod(p,i)})}
   if(t.closest('[data-rest]'))rest(p,d.rest,()=>heroSheet(p,'main'));
   if(t.closest('[data-conv]')){const c=p.coins;const tot=c.мм+c.см*10+c.эм*50;c.зм+=Math.floor(tot/100);const rem=tot%100;c.эм=0;c.см=Math.floor(rem/10);c.мм=rem%10;p.gold=c.зм;re()}
   if(t.closest('[data-xp]')){p.xp+=+$('#xpa',r).value||0;re();if(p.xp>=XPL[Math.min(19,p.lvl)])toast('Можно повысить уровень!')}
   if(t.closest('[data-lvlup]'))levelUp(p)}})}
function dmgHeal(p,back){openSheet(`<div class="sb-title">${esc(p.name)}</div><div class="sb-sub">${p.hp}/${p.maxhp} хитов${p.thp?' · врем. '+p.thp:''}</div><input class="inp" id="dv" type="number" inputmode="numeric" placeholder="Сколько?" style="font-size:22px;text-align:center;margin-top:12px"><div class="row" style="margin-top:10px"><button class="btn red grow" id="dd">Урон</button><button class="btn grow" id="dh">Лечение</button></div>`,r=>{setTimeout(()=>$('#dv',r).focus(),100);
 $('#dd',r).onclick=()=>{let v=+$('#dv',r).value||0;const a=Math.min(p.thp,v);p.thp-=a;v-=a;const was=p.hp;p.hp=Math.max(0,p.hp-v);if(was>0&&p.hp===0){p.ds={s:0,f:0};toast(p.name+' без сознания!')}else if(was===0&&v>0){p.ds.f=Math.min(3,p.ds.f+1);toast('Урон при 0 хитов — провал спасброска')}
  if((p.conds||[]).includes('Концентрация')&&v>0)toast(`Концентрация: спасбросок ТЕЛ СЛ ${Math.max(10,Math.floor(v/2))}`);KM.logS&&KM.logS(`${p.name}: −${v+a} хитов`);save();back()};
 $('#dh',r).onclick=()=>{const v=+$('#dv',r).value||0;if(p.hp===0)p.ds={s:0,f:0};p.hp=Math.min(p.maxhp,p.hp+v);KM.logS&&KM.logS(`${p.name}: +${v} хитов`);save();back()}})}
function rest(p,k,back){KM.uses&&KM.uses.onRest(p,k);if(k==='l'){const old=JSON.stringify(p);p.hp=p.maxhp;p.thp=0;p.hdu=Math.max(0,p.hdu-Math.max(1,Math.floor(p.lvl/2)));if(p.exh)p.exh--;p.ds={s:0,f:0};if(p.slots)for(const l in p.slots){const s=p.slots[l];if(s&&typeof s==='object'){if('u' in s)s.u=0;if('used' in s)s.used=0}}if(p.slotsUsed)p.slotsUsed={};p.conds=(p.conds||[]).filter(c=>c!=='Концентрация');save();KM.logS&&KM.logS(p.name+': долгий отдых');back();KM.undoToast('Долгий отдых: всё восстановлено',()=>{Object.assign(p,JSON.parse(old));save();back()})}
 else{toast('Короткий отдых: трать кости хитов');if(/колдун/i.test(p.cls)&&p.slots)for(const l in p.slots){const s=p.slots[l];if(s){if('u' in s)s.u=0;if('used' in s)s.used=0}}save();back()}}
KM.partyRest=function(ids,k,autoHD){const L=[];players.filter(p=>ids.includes(p.id)).forEach(p=>{fix(p);if(k==='l'){KM.uses&&KM.uses.onRest(p,'l');p.hp=p.maxhp;p.thp=0;p.hdu=Math.max(0,(p.hdu||0)-Math.max(1,Math.floor(p.lvl/2)));if(p.exh)p.exh--;p.ds={s:0,f:0};if(p.slots)for(const l in p.slots){const s=p.slots[l];if(s&&typeof s==='object'){if('u' in s)s.u=0;if('used' in s)s.used=0}}p.conds=(p.conds||[]).filter(c=>c!=='Концентрация'&&c!=='Без сознания');L.push(p.name+': всё восстановлено')}else{KM.uses&&KM.uses.onRest(p,'s');let got=0,sp=0;if(/колдун/i.test(p.cls||'')&&p.slots)for(const l in p.slots){const s=p.slots[l];if(s){if('u' in s)s.u=0;if('used' in s)s.used=0}}if(autoHD){const hd=hdOf(p);while(p.hp<p.maxhp&&(p.hdu||0)<p.lvl){const r=Math.floor(Math.random()*hd)+1+md(p.st[2]);const v=Math.max(0,r);p.hp=Math.min(p.maxhp,p.hp+v);got+=v;p.hdu=(p.hdu||0)+1;sp++}}if(p.hp>0)p.conds=(p.conds||[]).filter(c=>c!=='Без сознания');L.push(p.name+(sp?`: ${sp} к${hdOf(p)} → +${got} хитов`:': короткий отдых'))}});save();const T=LS.get('restEv',{n:0});LS.set('restEv',{n:(T.n||0)+1,k,ids,t:Date.now(),L});KM.logS&&KM.logS((k==='l'?'Долгий':'Короткий')+' отдых: '+L.join('; '));KM.table&&KM.table.push(true);return L};
KM.partyRestUI=function(){let k='s',auto=true,sel=new Set(players.map(p=>p.id));const pnt=r=>{r.innerHTML=`<div class="sb-title">⛺ Отдых отряда</div><div class="sb-sub">Только Мастер решает, когда герои отдыхают. Результат придёт игрокам.</div><div class="chips" style="margin:10px 0"><button class="chip${k==='s'?' on':''}" data-rk="s">☕ Короткий (1 час)</button><button class="chip${k==='l'?' on':''}" data-rk="l">🌙 Долгий (8 часов)</button></div><p class="muted" style="font-size:13px">${k==='s'?'Короткий: герои тратят кости хитов на лечение, колдун восстанавливает ячейки, восстанавливаются умения «на короткий отдых».':'Долгий: все хиты, половина костей хитов, все ячейки и заряды «на долгий отдых», −1 истощение. Не чаще раза в сутки.'}</p>${k==='s'?`<label class="row" style="gap:8px;margin:6px 0"><input type="checkbox" data-auto ${auto?'checked':''}> Автоматически потратить кости хитов до полного здоровья</label>`:''}<div class="list">${players.map(p=>`<button class="card${sel.has(p.id)?' on':''}" data-rp="${p.id}" style="text-align:left"><div class="grow"><div class="t">${sel.has(p.id)?'☑':'☐'} ${esc(p.name)}</div><div class="m">хиты ${p.hp}/${p.maxhp} · кости хитов ${Math.max(0,p.lvl-(p.hdu||0))}/${p.lvl}</div></div></button>`).join('')}</div><button class="btn red" data-rgo style="width:100%;margin-top:12px">Отдохнуть (${sel.size})</button>`};openSheet('<div id="prw"></div>',r=>{const w=r.querySelector('#prw');pnt(w);w.onclick=e=>{const t=e.target.closest('button,input');if(!t)return;const d=t.dataset;if(d.rk){k=d.rk;pnt(w)}if(d.auto!=null){auto=t.checked}if(d.rp){sel.has(d.rp)?sel.delete(d.rp):sel.add(d.rp);pnt(w)}if(d.rgo!=null){if(!sel.size)return toast('Выберите героев');const bk=JSON.stringify(players);const L=KM.partyRest([...sel],k,auto);closeSheet();try{rRefresh()}catch(_){}KM.undoToast((k==='l'?'🌙 Долгий':'☕ Короткий')+' отдых: '+L.length+' героя',()=>{const o=JSON.parse(bk);o.forEach((x,i)=>Object.assign(players[i],x));save();try{rRefresh()}catch(_){}KM.table&&KM.table.push(true)})}}})};
function levelUp(p){const old=JSON.stringify(p);const add=Math.max(1,Math.floor(hdOf(p)/2)+1+md(p.st[2]));p.lvl++;p.maxhp+=add;p.hp+=add;try{KM.ensureSlots&&KM.ensureSlots(p)}catch(e){}save();KM.logS&&KM.logS(`${p.name} достигает ${p.lvl} уровня (+${add} хитов)`);
 KM.summon&&KM.summon();heroSheet(p,'lvl');KM.undoToast(`${p.name}: ${p.lvl} уровень, +${add} хитов`,()=>{Object.assign(p,JSON.parse(old));save();heroSheet(p,'lvl')})}
KM.heroSheet=heroSheet;
/* inject into hero cards */
const _r=rPcs;window.rPcs=rPcs=function(){_r.apply(this,arguments);$$('.hero').forEach(h=>{const p=fix(players[+h.dataset.i]);if(!p)return;
 const strip=document.createElement('div');strip.className='hs-strip';strip.innerHTML=`<button class="btn sm red" data-sheet>📜 Лист героя</button><button class="btn sm" data-dmg2>± Хиты</button><button class="btn sm" data-chk>🎲 Проверка</button>${p.thp?`<span class="chip on">врем. ${p.thp}</span>`:''}${p.insp?'<span class="chip on">✦</span>':''}${p.exh?`<span class="chip">истощ. ${p.exh}</span>`:''}${p.hp<=0?`<span class="chip red">при смерти ${p.ds.s}✓ ${p.ds.f}✗</span>`:''}`;
 h.querySelector('.pcstats4').before(strip);
 strip.onclick=e=>{e.stopPropagation();if(e.target.closest('[data-sheet]'))heroSheet(p);if(e.target.closest('[data-dmg2]'))dmgHeal(p,()=>{closeSheet();rPcs()});if(e.target.closest('[data-chk]'))heroSheet(p,'skills')}})};
KM.rPcsSoft=()=>{if(KM.SECTIONS[S.sec][0]==='pcs'){const st=page.scrollTop;rPcs();page.scrollTop=st}};
/* ---- encounter builder ---- */
const THR=[[25,50,75,100],[50,100,150,200],[75,150,225,400],[125,250,375,500],[250,500,750,1100],[300,600,900,1400],[350,750,1100,1700],[450,900,1400,2100],[550,1100,1600,2400],[600,1200,1900,2800],[800,1600,2400,3600],[1000,2000,3000,4500],[1100,2200,3400,5100],[1250,2500,3800,5700],[1400,2800,4300,6400],[1600,3200,4800,7200],[2000,3900,5900,8800],[2100,4200,6300,9500],[2400,4900,7300,10900],[2800,5700,8500,12700]];
const DIFN=['Лёгкий','Средний','Трудный','Смертельный'];
const mult=n=>n<=1?1:n===2?1.5:n<=6?2:n<=10?2.5:n<=14?3:4;
let enc=LS.get('enc',[]);
function encounter(q){const party=players.length?players:[{lvl:1}];const th=[0,0,0,0];party.forEach(p=>THR[Math.min(19,Math.max(0,p.lvl-1))].forEach((v,i)=>th[i]+=v));
 const n=enc.reduce((a,e)=>a+e.c,0),raw=enc.reduce((a,e)=>a+(DATA.monsters.find(m=>m.id===e.id)?.xp||0)*e.c,0),adj=raw*mult(n);let d=-1;th.forEach((v,i)=>{if(adj>=v)d=i});
 const res=q?DATA.monsters.filter(m=>m.n.toLowerCase().includes(q.toLowerCase())).slice(0,8):[];
 openSheet(`<div class="sb-title">Конструктор столкновения</div><div class="sb-sub">Отряд: ${party.length} × ур. ${party.map(p=>p.lvl).join(', ')}</div>
 <div class="enc-bar">${DIFN.map((l,i)=>`<div class="${d>=i?'on':''} d${i}"><small>${l}</small><b>${th[i]}</b></div>`).join('')}</div>
 <div class="enc-sum">Опыт: ${raw} × ${mult(n)} = <b>${Math.round(adj)}</b> → <b class="d${Math.max(0,d)}">${d<0?'Пустяк':DIFN[d]}</b><br><small>Награда отряду: ${raw} опыта (по ${Math.floor(raw/party.length)} каждому)</small></div>
 <div class="list">${enc.map((e,i)=>{const m=DATA.monsters.find(x=>x.id===e.id);return m?`<div class="card enc-r"><div class="grow"><div class="t">${esc(m.n)}</div><div class="m">ПО ${crTxt(m.cr)} · ${m.xp} оп. · КД ${m.ac} · ${m.hp} хит.</div></div><button class="btn sm" data-c="${i}" data-d="-1">−</button><b>${e.c}</b><button class="btn sm" data-c="${i}" data-d="1">＋</button></div>`:''}).join('')}</div>
 <input class="inp" id="eq" placeholder="Найти монстра…" value="${esc(q||'')}" style="margin-top:8px"><div class="list" id="eres">${res.map(m=>`<button class="card" data-add="${m.id}"><div class="t">${esc(m.n)}</div><div class="m">ПО ${crTxt(m.cr)} · ${m.xp} оп.</div></button>`).join('')}</div>
 <div class="row" style="margin-top:12px"><button class="btn red grow" id="ego" ${enc.length?'':'disabled'}>⚔ В бой (+ герои)</button><button class="btn" id="ecl">Очистить</button><button class="btn" id="exp">＋ опыт героям</button></div>`,r=>{
 const sv=()=>LS.set('enc',enc);let tm;$('#eq',r).oninput=e=>{clearTimeout(tm);tm=setTimeout(()=>{encounter(e.target.value);setTimeout(()=>{const i=$('#eq');if(i){i.focus();i.setSelectionRange(99,99)}},30)},250)};
 r.onclick=e=>{const a=e.target.closest('[data-add]');if(a){const x=enc.find(z=>z.id===a.dataset.add);x?x.c++:enc.push({id:a.dataset.add,c:1});sv();encounter('')}
  const c=e.target.closest('[data-c]');if(c){const x=enc[+c.dataset.c];x.c+= +c.dataset.d;if(x.c<=0)enc.splice(+c.dataset.c,1);sv();encounter(q)}};
 $('#ecl',r).onclick=()=>{const o=enc;enc=[];sv();encounter('');KM.undoToast('Столкновение очищено',()=>{enc=o;sv();encounter('')})};
 $('#exp',r).onclick=()=>{const each=Math.floor(raw/party.length);players.forEach(p=>{fix(p);p.xp+=each});save();toast(`+${each} опыта каждому`);KM.logS&&KM.logS(`Опыт: +${each} каждому`)};
 $('#ego',r).onclick=()=>{players.forEach(p=>{if(!combat.list.some(c=>c.name===p.name))addCombatant({n:p.name,hp:p.hp,maxhp:p.maxhp,ac:p.ac,st:p.st},true)});enc.forEach(e=>{const m=DATA.monsters.find(x=>x.id===e.id);for(let i=0;i<e.c;i++)addCombatant({...m,n:m.n})});closeSheet();KM.go(KM.SECTIONS.findIndex(x=>x[0]==='combat'));setTimeout(()=>{try{rCombat()}catch(e){}},450);toast('Бой начат: бросьте инициативу')}})}
KM.encounter=encounter;
const _rc=rCombat;window.rCombat=rCombat=function(){_rc.apply(this,arguments);if($('#encB'))return;const b=document.createElement('button');b.id='encB';b.className='btn';b.style.cssText='width:100%;margin:6px 0';b.textContent='⚖ Конструктор столкновения · сложность';b.onclick=()=>encounter('');const hd=page.querySelector('.hdr,header,.page-h');(hd&&hd.nextSibling?hd.parentNode.insertBefore(b,hd.nextSibling):page.prepend(b))};
/* ---- campaign: quests, handouts, calendar & weather, shop ---- */
let camp=LS.get('camp',{q:[],h:[],day:1,month:0,year:1492,wx:'',shop:[]});const csave=()=>LS.set('camp',camp);KM.hoAdd=(n,t,sh)=>{camp.h.unshift({n,t,sh:!!sh});csave();KM.table&&KM.table.push(true)};if(camp.cal!==2){camp.month=Math.max(0,Math.min(11,+camp.month||0));camp.cal=2;setTimeout(()=>{camp.day=Math.max(1,Math.min(camp.day||1,dim(camp.month,camp.year)));csave()},0)}
const MON=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];const MONG=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];const WD=['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];const SEAS=m=>m<2||m>10?'Зима':m<5?'Весна':m<8?'Лето':'Осень';const leap=y=>camp.leap!==false&&(y%4===0&&y%100!==0||y%400===0);const dim=(m,y)=>[31,leap(y)?29:28,31,30,31,30,31,31,30,31,30,31][m];const wday=()=>{const d=new Date(0);d.setUTCFullYear(camp.year,camp.month,camp.day);return WD[d.getUTCDay()]};function addDays(n){camp.day+=n;while(camp.day>dim(camp.month,camp.year)){camp.day-=dim(camp.month,camp.year);camp.month++;if(camp.month>11){camp.month=0;camp.year++}}while(camp.day<1){camp.month--;if(camp.month<0){camp.month=11;camp.year--}camp.day+=dim(camp.month,camp.year)}}
const WX=[['☀','Ясно',22,30],['⛅','Облачно',14,22],['🌧','Дождь',8,16],['⛈','Гроза',12,20],['🌫','Туман',4,10],['❄','Снег',-12,0],['🌬','Сильный ветер',2,12]];
function weather(){const seasonCold=[0,1,10,11].includes(camp.month);const pool=seasonCold?[1,4,5,6,5]:[0,0,1,2,3,4,6];const w=WX[pool[Math.floor(Math.random()*pool.length)]];const t=w[2]+Math.floor(Math.random()*(w[3]-w[2]+1));camp.wx=`${w[0]} ${w[1]}, ${t} °C`;csave()}
let cview='notes';
const _rn=rNotes;window.rNotes=rNotes=function(){const seg=`<div class="seg" id="cseg">${[['notes','Заметки'],['q','Квесты'],['h','Раздатки'],['cal','Календарь'],['shop','Лавка']].map(([k,l])=>`<button data-v="${k}" class="${cview===k?'on':''}">${l}</button>`).join('')}</div>`;
 if(cview==='notes'){_rn.apply(this,arguments);const h=page.querySelector('.hdr,.ph,header');const d=document.createElement('div');d.innerHTML=seg;(page.children[1]?page.insertBefore(d.firstChild,page.children[1]):page.append(d.firstChild))}
 else{page.onclick=null;page.oninput=null;page.innerHTML=header('Сюжет','кампания','tri',0)+seg+'<div id="cbody"></div>';campBody()}
 $('#cseg').onclick=e=>{const b=e.target.closest('[data-v]');if(b){cview=b.dataset.v;rNotes()}}};
function campBody(){const B=$('#cbody');
 if(cview==='q'){B.innerHTML=`<div class="row"><input class="inp grow" id="qn" placeholder="Новый квест: найти пропавшую дочь мельника…"><button class="btn red" id="qa">＋</button></div><div class="list" style="margin-top:8px">${camp.q.map((q,i)=>`<div class="card q-${q.s}"><div class="grow"><div class="t">${q.s==='done'?'✓ ':q.s==='fail'?'✗ ':''}${esc(q.n)}</div><textarea class="inp" data-qt="${i}" rows="2" placeholder="Зацепки, награда, кто дал…">${esc(q.t||'')}</textarea></div><div class="col"><button class="btn sm" data-qs="${i}">${q.s==='open'?'Выполнен':q.s==='done'?'Провален':'Открыть'}</button><button class="btn sm dark" data-qd="${i}">✕</button></div></div>`).join('')||'<div class="muted">Квестов пока нет.</div>'}</div>`;
  $('#qa').onclick=()=>{const v=$('#qn').value.trim();if(!v)return;camp.q.unshift({n:v,s:'open',t:''});csave();campBody()};
  B.oninput=e=>{const i=e.target.dataset.qt;if(i!=null){camp.q[+i].t=e.target.value;csave()}};
  B.onclick=e=>{const s=e.target.dataset.qs,d=e.target.dataset.qd;if(s!=null){const q=camp.q[+s];q.s=q.s==='open'?'done':q.s==='done'?'fail':'open';csave();campBody()}if(d!=null){const o=camp.q.slice();camp.q.splice(+d,1);csave();campBody();KM.undoToast('Квест удалён',()=>{camp.q=o;csave();campBody()})}}}
 if(cview==='h'){B.innerHTML=`<div class="muted" style="font-size:12.5px">Раздатки — письма, карты, записки. Открой на весь экран и покажи игрокам.</div><div class="row" style="margin:8px 0"><button class="btn red" id="ha">＋ Текст</button><button class="btn" id="htpl">＋ Из шаблона</button><label class="btn">＋ Картинка<input type="file" accept="image/*" id="hi" hidden></label></div><div class="list">${camp.h.map((h,i)=>`<div class="card"><div class="grow" data-hv="${i}"><div class="t">${esc(h.n)}</div><div class="m">${h.img?'изображение':esc((h.t||'').slice(0,60))}</div></div><button class="btn sm${h.sh?' red':''}" data-hs="${i}">${h.sh?'◎ У игроков':'◌ Игрокам'}</button><button class="btn sm" data-hv="${i}">Показать</button>${h.img?'':`<button class="btn sm" data-he="${i}" aria-label="Изменить">✎</button>`}<button class="btn sm dark" data-hd="${i}">✕</button></div>`).join('')}</div>`;
  B.querySelectorAll('[data-hs]').forEach(b=>b.onclick=e=>{e.stopPropagation();const h=camp.h[+b.dataset.hs];h.sh=!h.sh;csave();campBody();toast(h.sh?'Раздатка отправлена игрокам':'Раздатка скрыта')});
  $('#htpl').onclick=()=>KM.hoTpl(()=>campBody());$('#ha').onclick=()=>{openSheet(`<div class="sb-title">Раздатка</div><input class="inp" id="hn" placeholder="Название"><textarea class="inp" id="ht" rows="8" placeholder="Текст письма…" style="margin-top:8px"></textarea><button class="btn red" id="hs" style="margin-top:10px">Сохранить</button>`,r=>{$('#hs',r).onclick=()=>{camp.h.unshift({n:$('#hn',r).value||'Письмо',t:$('#ht',r).value});csave();closeSheet();campBody()}})};
  $('#hi').onchange=e=>{const f=e.target.files[0];if(!f)return;const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas'),k=Math.min(1,1200/Math.max(im.width,im.height));c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);camp.h.unshift({n:f.name.replace(/\.\w+$/,''),img:c.toDataURL('image/jpeg',.75)});try{csave()}catch(e){toast('Мало места')}campBody()};im.src=fr.result};fr.readAsDataURL(f)};
  B.onclick=e=>{const v=e.target.closest('[data-hv]'),d=e.target.dataset.hd,ed=e.target.dataset.he;if(ed!=null){const h=camp.h[+ed];openSheet(`<div class="sb-title">Изменить раздатку</div><input class="inp" id="hn" value="${esc(h.n)}"><textarea class="inp" id="ht" rows="8" style="margin-top:8px">${esc(h.t||'')}</textarea><div class="row" style="margin-top:10px"><button class="btn" id="hp">Предпросмотр</button><button class="btn red grow" id="hs">Сохранить</button></div>`,r=>{$('#hp',r).onclick=()=>KMH.open({n:$('#hn',r).value,t:$('#ht',r).value});$('#hs',r).onclick=()=>{h.n=$('#hn',r).value||'Письмо';h.t=$('#ht',r).value;csave();closeSheet();campBody();KM.table&&KM.table.push(true);toast('Раздатка обновлена')}});return}if(d!=null){const o=camp.h.slice();camp.h.splice(+d,1);csave();campBody();KM.undoToast('Раздатка удалена',()=>{camp.h=o;csave();campBody()});return}if(v){const h=camp.h[+v.dataset.hv];KMH.open(h)}}}
 if(cview==='cal'){if(!camp.wx)weather();B.innerHTML=`<div class="hs-box" style="text-align:center"><small>Сегодня</small><b style="font-size:26px">${camp.day} ${MONG[camp.month]}</b><div class="muted">${wday()} · ${camp.year} г. · ${SEAS(camp.month)}${leap(camp.year)?' · високосный':''}</div><div style="font-size:20px;margin:8px 0">${camp.wx}</div><div class="row" style="justify-content:center"><button class="btn sm" data-dd="-1">◀ День</button><button class="btn sm red" data-dd="1">День ▶</button><button class="btn sm" data-dd="7">+ Неделя</button><button class="btn sm" data-wx>⟳ Погода</button></div></div><label class="f">Месяц</label>${chips('mon',MON.map((m,i)=>[i,m]),camp.month)}<label class="f">Високосные годы</label>${chips('leap',[['1','Как в жизни'],['0','Без 29 февраля']],camp.leap===false?'0':'1')}`;
  bindChips(B,(n,v)=>{if(n==='leap'){camp.leap=v==='1';}else{camp.month=+v;}camp.day=Math.min(camp.day,dim(camp.month,camp.year));csave();weather();campBody()});
  B.onclick=e=>{const d=e.target.dataset.dd;if(d){addDays(+d);csave();weather();KM.logS&&KM.logS(`${wday()}, ${camp.day} ${MONG[camp.month]} — ${camp.wx}`);campBody()}if(e.target.closest('[data-wx]')){weather();campBody()}}}
 if(cview==='shop'&&KM.shops){KM.shops.embed(B);return}if(cview==='shop'){if(!camp.shop.length)stock();B.innerHTML=`<div class="row"><button class="btn sm" id="sr">⟳ Новый ассортимент</button>${chips('mk',[['0.8','Дёшево'],['1','Обычно'],['1.3','Дорого']],camp.mk||1)}</div><div class="list" style="margin-top:8px">${camp.shop.map((id,i)=>{const it=DATA.items.find(x=>x.id===id);if(!it)return'';return`<div class="card"><div class="grow" data-io="${id}"><div class="t">${esc(it.n)}</div><div class="m">${esc(it.cat)} · ${it.rar||''}</div></div><b class="price">${price(it)}</b><button class="btn sm" data-buy="${id}">Продать</button></div>`}).join('')}</div>`;
  bindChips(B,(n,v)=>{camp.mk=+v;csave();campBody()});$('#sr').onclick=()=>{stock();campBody()};
  B.onclick=e=>{const o=e.target.closest('[data-io]');if(o)return showItem(o.dataset.io);const b=e.target.closest('[data-buy]');if(b){const it=DATA.items.find(x=>x.id===b.dataset.buy);openSheet(`<div class="sb-title">Кто покупает?</div><div class="sb-sub">${esc(it.n)} · ${price(it)}</div><div class="list" style="margin-top:12px">${players.map((p,i)=>`<button class="card" data-pi="${i}"><div class="t">${esc(p.name)}</div><div class="m">${fix(p).coins.зм} зм</div></button>`).join('')}</div>`,r=>{r.onclick=ev=>{const x=ev.target.closest('[data-pi]');if(!x)return;const p=players[+x.dataset.pi],c=gp(it);if(p.coins.зм<c)return toast('Не хватает золота');p.coins.зм-=Math.ceil(c);p.gold=p.coins.зм;giveItem(p,it);closeSheet()}})}}}}
const gp=it=>{const m=String(it.cost||'').replace(/\s/g,'').match(/([\d,.]+)(мм|см|эм|зм|пм)/);if(!m)return 0;return +m[1].replace(',','.')*({мм:.01,см:.1,эм:.5,зм:1,пм:10}[m[2]])*(camp.mk||1)};
const price=it=>{const v=gp(it);return v?(v>=1?Math.round(v)+' зм':Math.round(v*10)+' см'):'—'};
function stock(){const pool=DATA.items.filter(i=>gp(i)>0&&!i.art&&(i.rar==='Обычный'||!i.rar||Math.random()<.04));camp.shop=Array.from({length:14},()=>pool[Math.floor(Math.random()*pool.length)].id).filter((v,i,a)=>a.indexOf(v)===i);csave()}

;KM.cal={MON,MONG,WD,dim,wday,dateIn:n=>{const o=[camp.day,camp.month,camp.year];addDays(n);const r=`${camp.day} ${MONG[camp.month]}`;[camp.day,camp.month,camp.year]=o;return r},addDays:n=>{addDays(n);csave();KM.uses&&KM.uses.onDays(n)},season:()=>SEAS(camp.month),short:()=>`${wday().slice(0,2)}, ${camp.day} ${MONG[camp.month]}`,full:()=>`${wday()}, ${camp.day} ${MONG[camp.month]} ${camp.year} г.`};
(function(){let lastD=null;setInterval(()=>{try{const D=sess.day;if(lastD===null){lastD=D;return}if(D>lastD){addDays(D-lastD);KM.uses&&KM.uses.onDays(D-lastD);csave();weather();KM.logS&&KM.logS('Новый день: '+KM.cal.full())}lastD=D}catch(e){}},1500)})();
}

;
/* combat.js */
'use strict';{
/* ===== Deep combat tracker ===== */
const DT=[['огн','огонь'],['холод','холод'],['электр','электричество'],['кисл','кислота'],['яд','яд'],['некрот','некротическая энергия'],['излуч','излучение'],['псих','психическая энергия'],['звук','звук'],['силов','силовое поле'],['дробящ','дробящий'],['колющ','колющий'],['рубящ','рубящий']];
const dtOf=s=>{s=String(s||'').toLowerCase();const d=DT.find(([k])=>s.includes(k));return d?d[0]:''};
const md=v=>Math.floor((v-10)/2),fm=v=>(v>=0?'+':'')+v,R=n=>1+Math.floor(Math.random()*n),AB=['СИЛ','ЛОВ','ТЕЛ','ИНТ','МДР','ХАР'];
const monOf=c=>c&&c.mon?DATA.monsters.find(m=>m.id===c.mon):null;
const pOf=c=>c&&c.pc?players.find(p=>p.id===c.pid||p.name===c.base):null;
const C=()=>combat;
function norm(){const k=C();k.log=k.log||[];k.undo=k.undo||[];k.list.forEach(c=>{c.conds=(c.conds||[]).map(x=>typeof x==='string'?{n:x,r:0}:x);c.thp=c.thp||0;c.eco=c.eco||{a:0,b:0,r:0,m:0};c.ds=c.ds||{s:0,f:0};c.note=c.note||'';const m=monOf(c);if(m&&c.legMax==null){c.legMax=(m.lg||[]).length?3:0;c.leg=0;c.rech={};[...(m.a||[]),...(m.f||[])].forEach(a=>{if(/перезаряд/i.test(a.n))c.rech[a.n]=1})}})}
function snap(txt){const k=C();k.undo=k.undo||[];k.log=k.log||[];k.undo.push(JSON.stringify({list:k.list,turn:k.turn,round:k.round}));if(k.undo.length>40)k.undo.shift();if(txt)logC(txt)}
function logC(t){const k=C();k.log=k.log||[];k.log.unshift(`Р${k.round}: ${t}`);k.log.length=Math.min(k.log.length,80);KM.logS&&KM.logS(t)}
function undo(){const k=C();const s=k.undo.pop();if(!s)return toast('Нечего отменять');Object.assign(k,JSON.parse(s));k.log.unshift('↶ отменено');save();rCombat()}
/* ---- damage core ---- */
function rv(c,dt){const m=monOf(c);if(!m||!dt)return 1;const has=f=>String(m[f]||'').toLowerCase().includes(dt);if(has('imm'))return 0;if(has('vul'))return 2;if(has('res'))return .5;return 1}
function damage(c,amt,dt,mult){if(mult==null)mult=rv(c,dt);let v=Math.floor(amt*mult);const out=[];if(mult!==1)out.push(mult===0?'иммунитет':mult===2?'уязвимость ×2':'сопротивление ½');
 const a=Math.min(c.thp,v);c.thp-=a;let rest=v-a;const was=c.hp;c.hp=Math.max(0,c.hp-rest);const over=rest-was;
 if(c.hp===0&&was>0){if(c.pc){if(over>=c.max){c.dead=1;out.push('мгновенная смерть (массивный урон)')}else{c.ds={s:0,f:0};addCond(c,'Без сознания',0);out.push('без сознания — спасброски от смерти')}}else{c.dead=1;out.push('повержен')}}
 else if(was===0&&rest>0&&c.pc&&!c.dead){c.ds.f=Math.min(3,c.ds.f+1);out.push('провал спасброска от смерти');if(c.ds.f>=3){c.dead=1;out.push('погиб')}}
 if(c.hp===0&&c.conds.some(x=>x.n==='Концентрация')){c.conds=c.conds.filter(x=>x.n!=='Концентрация');out.push('концентрация прервана')}else if(v>0&&c.conds.some(x=>x.n==='Концентрация')&&!c.dead)out.push(`⚠ концентрация: спас ТЕЛ СЛ ${Math.max(10,Math.floor(v/2))}`);
 syncP(c);logC(`${c.name}: −${v}${dt?' ('+(DT.find(d=>d[0]===dt)||[0,dt])[1]+')':''}${out.length?' · '+out.join(', '):''}`);return {v,out}}
function heal(c,v){if(c.dead&&!c.pc)c.dead=0;if(c.hp===0){c.ds={s:0,f:0};c.conds=c.conds.filter(x=>x.n!=='Без сознания');c.dead=0}c.hp=Math.min(c.max,c.hp+v);syncP(c);logC(`${c.name}: +${v} хитов`)}
function syncP(c){const p=pOf(c);if(p){p.hp=c.hp;p.maxhp=c.max;p.thp=c.thp;p.ds=c.ds}}
function addCond(c,n,r,end){if(!c.conds.some(x=>x.n===n))c.conds.push({n,r:r||0,end:end||'end'})}
/* ---- turn flow ---- */
function next(dir=1){const k=C();if(!k.list.length)return;snap();const cur=k.list[k.turn];
 if(dir>0&&cur){tick(cur,'end')}
 let i=k.turn,guard=0;do{i+=dir;if(i>=k.list.length){i=0;k.round++;logC('— раунд '+k.round+' —')}if(i<0){i=k.list.length-1;k.round=Math.max(1,k.round-1)}guard++}while(guard<=k.list.length&&(k.list[i].dead&&!k.list[i].pc||k.list[i].delay));
 k.turn=i;const n=k.list[i];k.tt=Date.now();if(dir>0&&n){n.eco={a:0,b:0,r:0,m:0};n.leg=0;tick(n,'start');n.conds=n.conds.filter(x=>x.n!=='Подготовлено');
  const msgs=[];Object.keys(n.rech||{}).forEach(a=>{if(!n.rech[a]){const d=R(6),need=+(a.match(/(\d)\s*[–-]\s*6/)||[0,6])[1];if(d>=need){n.rech[a]=1;msgs.push(`«${a.replace(/\s*\(.*\)/,'')}» перезарядилось (к6=${d})`)}}});
  if(n.pc&&n.hp===0&&!n.dead)msgs.push('Спасбросок от смерти!');msgs.forEach(toast)}
 save();rCombat();if(n&&n.pc&&n.hp===0&&!n.dead&&dir>0)setTimeout(()=>deathSave(n),350)}
function tick(c,when){c.conds.forEach(x=>{if(x.r>0&&(x.end||'end')===when){x.r--;if(!x.r){x.gone=1;toast(`${c.name}: «${x.n}» закончилось`);logC(`${c.name}: «${x.n}» закончилось`)}}});c.conds=c.conds.filter(x=>!x.gone)}
function deathSave(c){KM.rollEntry({label:c.name+': спасбросок от смерти',mod:0,vs:10,on:(v,nat)=>{snap();if(nat===20){c.hp=1;c.ds={s:0,f:0};c.conds=c.conds.filter(x=>x.n!=='Без сознания');toast(c.name+' приходит в себя с 1 хитом!')}else if(nat===1)c.ds.f+=2;else if(v>=10)c.ds.s++;else c.ds.f++;
 if(c.ds.f>=3){c.dead=1;toast(c.name+' погибает…')}else if(c.ds.s>=3){addCond(c,'Стабилизирован',0);toast(c.name+' стабилизирован')}syncP(c);logC(`${c.name}: спасбросок от смерти ${v} (${c.ds.s}✓ ${c.ds.f}✗)`);save();setTimeout(()=>{closeSheet();rCombat()},900)}})}
/* ---- parse monster actions ---- */
function parseAtk(a){const d=a.d||'';const h=d.match(/([+−-]\s*\d+)\s*к попаданию/);const dm=[...d.matchAll(/(\d+)\s*\((\d+к\d+(?:\s*[+−-]\s*\d+)?)\)\s*([а-яё]+)/gi)].map(x=>({avg:+x[1],dice:x[2].replace(/\s/g,'').replace('−','-'),dt:dtOf(x[3])}));const sv=d.match(/спасбросок\s+([А-Яа-я]+)\s+(?:со\s+)?СЛ\s*(\d+)/i);return {hit:h?+h[1].replace(/[\s−]/g,m=>m==='−'?'-':''):null,dm,save:sv?{ab:sv[1],dc:+sv[2]}:null}}
const avgD=s=>{const m=String(s).match(/(\d+)к(\d+)([+-]\d+)?/);return m?Math.floor(+m[1]*(+m[2]+1)/2)+(+m[3]||0):0};
const rollD=(s,crit)=>{const m=String(s).match(/(\d+)к(\d+)([+-]\d+)?/);if(!m)return 0;let t=+m[3]||0;for(let i=0;i<(+m[1])*(crit?2:1);i++)t+=R(+m[2]);return t};
/* ---- attack flow ---- */
function attack(src,act){const k=C();const foes=k.list.filter(c=>!c.dead&&c!==src&&(!src||c.pc!==src.pc));const A=act?parseAtk(act):{hit:0,dm:[]};let tgt=foes[0]||k.list.find(c=>c!==src);let adv=0;
 if(A.save&&!A.hit)return multi(src,act);
 openSheet(`<div class="sb-title">${esc(act?act.n:'Атака')}</div><div class="sb-sub">${src?esc(src.name)+' · ':''}${A.hit!=null?'бонус '+fm(A.hit):''}${A.dm.length?' · '+A.dm.map(d=>d.dice+' '+(DT.find(x=>x[0]===d.dt)||['',''])[1]).join(' + '):''}</div>
 <label class="f">Цель</label><div class="chips" id="tg">${k.list.filter(c=>c!==src&&!c.dead).map(c=>`<button class="chip${c===tgt?' on':''}" data-id="${c.id}">${esc(c.name)} · КД ${c.ac??"—"}</button>`).join('')}</div>
 ${A.hit==null?`<label class="f">Бонус атаки</label><input class="inp" id="hb" type="number" inputmode="numeric" value="${src&&src.pc?pb2(src):4}">`:''}
 ${chips('adv',[['0','Обычно'],['1','Преимущество'],['-1','Помеха']],0)}
 <div class="re-out" id="ao">Что выпало на к20?</div><div class="re-pad" id="ap">${Array.from({length:20},(_,i)=>`<button data-v="${i+1}" class="${i===19?'n20':i===0?'n1':''}">${i+1}</button>`).join('')}</div>
 <div class="row" style="margin-top:8px"><button class="btn grow" id="avr">🎲 Бросить за меня</button><button class="btn" id="askip">Сразу урон</button></div><div id="dmgz"></div>`,r=>{
 $('#tg',r).onclick=e=>{const b=e.target.closest('[data-id]');if(!b)return;tgt=k.list.find(c=>c.id===b.dataset.id);$$('#tg .chip',r).forEach(x=>x.classList.toggle('on',x===b))};bindChips(r,(n,v)=>adv=+v);
 const res=(nat,txt)=>{const bonus=A.hit!=null?A.hit:+($('#hb',r)||{}).value||0,tot=nat+bonus,crit=nat===20,hit=crit||nat!==1&&tot>=tgt.ac;
  $('#ao',r).innerHTML=`<b class="re-t">${tot}</b> <small>(${txt||nat} ${fm(bonus)}) против КД ${tgt.ac??"—"}</small><div class="re-v ${hit?'ok':'no'}">${crit?'КРИТ! ':''}${hit?'Попадание':'Промах'}</div>`;$('#ao',r).classList.remove('pop');void $('#ao',r).offsetWidth;$('#ao',r).classList.add('pop');
  logC(`${src?src.name:'Атака'} → ${tgt.name}: ${tot} — ${crit?'крит':hit?'попадание':'промах'}`);if(src)src.eco.a=1;save();
  if(hit)dmgForm(r,src,tgt,A,crit);else $('#dmgz',r).innerHTML=`<button class="btn red" id="dn" style="width:100%;margin-top:10px">Готово</button>`,$('#dn',r).onclick=()=>{closeSheet();rCombat()}};
 $('#ap',r).onclick=e=>{const b=e.target.closest('[data-v]');if(b)res(+b.dataset.v)};
 $('#avr',r).onclick=()=>{const a=R(20),b=R(20),n=adv>0?Math.max(a,b):adv<0?Math.min(a,b):a;res(n,adv?a+' и '+b:null)};
 $('#askip',r).onclick=()=>dmgForm(r,src,tgt,A,false)})}
const pb2=c=>{const p=pOf(c);return p?2+Math.floor((p.lvl-1)/4)+Math.max(md(p.st[0]),md(p.st[1])):4};
function dmgForm(r,src,tgt,A,crit){const d=A.dm[0]||{dice:'',dt:''};let dt=d.dt;const allDice=A.dm.map(x=>x.dice).join(' + ');const mult0=rv(tgt,dt);let mult=mult0;
 $('#dmgz',r).innerHTML=`<div class="sec-h">Урон по ${esc(tgt.name)}</div>${crit?`<div class="re-v ok">Крит: брось кости урона дважды${allDice?' — '+allDice.replace(/(\d+)к/g,(m,n)=>2*n+'к'):''} (модификатор один раз)</div>`:''}
 <input class="inp" id="dv" type="number" inputmode="numeric" placeholder="${allDice?'сумма кубиков '+allDice:'урон'}" style="font-size:24px;text-align:center">
 <div class="row" style="margin-top:6px">${allDice?`<button class="btn sm" id="dav">Среднее ${A.dm.reduce((s,x)=>s+(crit?avgD(x.dice)+avgD(x.dice.replace(/[+-]\d+$/,'')):x.avg),0)}</button><button class="btn sm" id="drl">🎲 Бросить</button>`:''}</div>
 <label class="f">Тип урона</label><div class="chips" id="dts">${DT.map(([k2,l])=>`<button class="chip${k2===dt?' on':''}" data-dt="${k2}">${l}</button>`).join('')}</div>
 ${chips('mul',[['1','обычный'],['0.5','сопр. ½'],['2','уязв. ×2'],['0','иммун.']],mult0)}${mult0!==1?`<div class="muted" style="font-size:12px">Учтено по статблоку цели</div>`:''}
 <button class="btn red" id="dap" style="width:100%;margin-top:10px;padding:16px">Нанести урон</button>`;
 bindChips($('#dmgz',r),(n,v)=>{if(n==='mul')mult=+v});$('#dts',r).onclick=e=>{const b=e.target.closest('[data-dt]');if(!b)return;dt=b.dataset.dt;mult=rv(tgt,dt);$$('#dts .chip',r).forEach(x=>x.classList.toggle('on',x===b));$$('[data-chips=mul] .chip',r).forEach(x=>x.classList.toggle('on',+x.dataset.v===mult))};
 const dav=$('#dav',r);if(dav){dav.onclick=()=>$('#dv',r).value=dav.textContent.replace(/\D/g,'');$('#drl',r).onclick=()=>{$('#dv',r).value=A.dm.reduce((s,x)=>s+rollD(x.dice,crit),0)}}
 setTimeout(()=>$('#dv',r).focus(),50);$('#dmgz',r).scrollIntoView({behavior:'smooth'});
 $('#dap',r).onclick=()=>{const v=+$('#dv',r).value||0;if(!v)return toast('Введи урон с кубиков');snap();const o=damage(tgt,v,dt,mult);save();closeSheet();rCombat();flash(tgt.id);toast(`${tgt.name}: −${o.v}${o.out.length?' · '+o.out.join(', '):''}`)}}
function flash(id){const e=document.querySelector(`[data-cid="${id}"]`);if(e){e.classList.remove('hitfx');void e.offsetWidth;e.classList.add('hitfx')}}
/* ---- multi-target (area / save) ---- */
function multi(src,act,ids){const k=C();const A=act?parseAtk(act):{dm:[],save:null};let sel=new Set(ids||k.list.filter(c=>!c.dead&&src&&c.pc!==src.pc).map(c=>c.id));const sv={};let dt=(A.dm[0]||{}).dt||'';const ABI={СИЛ:0,Силы:0,ЛОВ:1,Ловкости:1,ТЕЛ:2,Телосложения:2,ИНТ:3,Интеллекта:3,МДР:4,Мудрости:4,ХАР:5,Харизмы:5};let ab=A.save?(ABI[A.save.ab]??1):1;
 const draw=()=>openSheet(`<div class="sb-title">${esc(act?act.n:'Урон по области')}</div><div class="sb-sub">Несколько целей · спасбросок — половина урона</div>
 <div class="row"><div class="grow"><label class="f">Урон</label><input class="inp" id="mv" type="number" inputmode="numeric" placeholder="${A.dm.map(d=>d.dice).join('+')||'сумма'}" style="font-size:20px"></div><div><label class="f">СЛ</label><input class="inp" id="mdc" type="number" inputmode="numeric" value="${A.save?A.save.dc:(src&&src.pc?13:13)}" style="width:70px"></div></div>
 ${A.dm.length?`<button class="btn sm" id="mrl">🎲 Бросить ${A.dm.map(d=>d.dice).join('+')}</button>`:''}
 <label class="f">Спасбросок</label>${chips('mab',AB.map((a,i)=>[i,a]),ab)}
 <label class="f">Тип урона</label><div class="chips" id="mdt">${DT.map(([k2,l])=>`<button class="chip${k2===dt?' on':''}" data-dt="${k2}">${l}</button>`).join('')}</div>
 <div class="list" id="mt" style="margin-top:8px">${k.list.filter(c=>!c.dead).map(c=>`<div class="card mt-r${sel.has(c.id)?' on':''}" data-id="${c.id}"><button class="dot${sel.has(c.id)?' on':''}" data-sel></button><div class="grow"><div class="t">${esc(c.name)}</div><div class="m">${c.hp}/${c.max} · КД ${c.ac??"—"}</div></div><button class="btn sm${sv[c.id]===1?' on-g':''}" data-s="1">Успех</button><button class="btn sm${sv[c.id]===0?' on-r':''}" data-s="0">Провал</button></div>`).join('')}</div>
 <div class="row" style="margin-top:6px"><button class="btn sm" id="mauto">🎲 Спасброски монстров</button></div>
 <button class="btn red" id="map" style="width:100%;margin-top:10px;padding:16px">Нанести всем выбранным</button>`,r=>{
 bindChips(r,(n,v)=>{if(n==='mab')ab=+v});$('#mdt',r).onclick=e=>{const b=e.target.closest('[data-dt]');if(b){dt=b.dataset.dt;$$('#mdt .chip',r).forEach(x=>x.classList.toggle('on',x===b))}};
 const mr=$('#mrl',r);if(mr)mr.onclick=()=>$('#mv',r).value=A.dm.reduce((s,x)=>s+rollD(x.dice),0);
 $('#mt',r).onclick=e=>{const row=e.target.closest('[data-id]');if(!row)return;const id=row.dataset.id;const s=e.target.closest('[data-s]');if(s){sv[id]=+s.dataset.s;sel.add(id)}else{sel.has(id)?sel.delete(id):sel.add(id)}const v=$('#mv',r).value,dc=$('#mdc',r).value;draw();setTimeout(()=>{$('#mv').value=v;$('#mdc').value=dc},0)};
 $('#mauto',r).onclick=()=>{const dc=+$('#mdc',r).value||13;k.list.filter(c=>sel.has(c.id)&&!c.pc).forEach(c=>{const m=monOf(c);let b=m?md(m.st[ab]):0;const sm=m&&String(m.sv||'').match(new RegExp(AB[ab].slice(0,3)+'[а-я]*\\s*([+-]\\d+)','i'));if(sm)b=+sm[1];sv[c.id]=R(20)+b>=dc?1:0});const v=$('#mv',r).value;draw();setTimeout(()=>$('#mv').value=v,0)};
 $('#map',r).onclick=()=>{const v=+$('#mv',r).value||0;if(!v)return toast('Введи урон');snap(`${act?act.n:'Область'}: ${v} урона`);const msg=[];k.list.filter(c=>sel.has(c.id)).forEach(c=>{const o=damage(c,sv[c.id]===1?Math.floor(v/2):v,dt);msg.push(`${c.name} −${o.v}`)});if(src){src.eco.a=1;if(act&&src.rech&&act.n in src.rech)src.rech[act.n]=0}save();closeSheet();rCombat();sel.forEach(flash);toast(msg.join(', '))}});draw()}
/* ---- bulk add ---- */
function bulk(q){const k=C();const pool=[...DATA.monsters.map(m=>({m,n:m.n})),...(typeof allCast==='function'?allCast():[]).map(c=>{const m=DATA.monsters.find(x=>c.stat&&x.n.toLowerCase()===String(c.stat).toLowerCase().trim())||DATA.monsters.find(x=>c.stat&&String(c.stat).toLowerCase().includes(x.n.toLowerCase()));return m?{m,n:c.n,npc:1}:null}).filter(Boolean)];
 const st=bulk.st=bulk.st||{n:1,hp:'avg'};const ql=(q||'').toLowerCase();const res=ql?pool.filter(x=>x.n.toLowerCase().includes(ql)).slice(0,12):pool.filter(x=>x.m.top).slice(0,10);
 openSheet(`<div class="sb-title">Добавить в бой</div><div class="sb-sub">Сколько, хиты — и тап по существу</div>
 <div class="row bulk-n">${[1,2,3,4,5,6,8].map(n=>`<button class="btn sm${st.n===n?' red':''}" data-n="${n}">×${n}</button>`).join('')}</div>
 ${chips('hpm',[['avg','Средние хиты'],['roll','Бросить хиты']],st.hp)}
 <input class="inp" id="bq" placeholder="Гоблин, разбойник, имя НИП…" value="${esc(q||'')}" style="margin-top:8px">
 <div class="list" id="br">${res.map((x,i)=>`<button class="card" data-i="${i}"><div class="t">${esc(x.n)}${x.npc?' <small>(НИП)</small>':''}</div><div class="m">${x.npc?esc(x.m.n)+' · ':''}ПО ${crTxt(x.m.cr)} · КД ${x.m.ac} · ${x.m.hp} хит. (${x.m.hd})</div></button>`).join('')}</div>
 <div class="row" style="margin-top:10px"><button class="btn" id="bpc">＋ Все герои</button><button class="btn" id="bcu">＋ Своё существо</button></div>`,r=>{
 $$('[data-n]',r).forEach(b=>b.onclick=()=>{st.n=+b.dataset.n;bulk($('#bq',r).value)});bindChips(r,(n,v)=>{st.hp=v});
 let tm;$('#bq',r).oninput=e=>{clearTimeout(tm);tm=setTimeout(()=>{bulk(e.target.value);setTimeout(()=>{const i=$('#bq');i.focus();i.setSelectionRange(99,99)},20)},250)};
 $('#br',r).onclick=e=>{const b=e.target.closest('[data-i]');if(!b)return;const x=res[+b.dataset.i];snap(`+${st.n} ${x.n}`);for(let i=0;i<st.n;i++)addMon(x.m,x.npc?x.n:null,st.hp==='roll');renum();save();toast(`+${st.n} × ${x.n}`);rCombat()};
 $('#bpc',r).onclick=()=>{snap('+ герои');players.forEach(p=>{if(!k.list.some(c=>c.pc&&(c.pid===p.id||c.base===p.name)))k.list.push({id:uid(),pid:p.id,base:p.name,name:p.name,init:0,dex:md(p.st[1]),hp:p.hp,max:p.maxhp,thp:p.thp||0,ac:p.ac,pc:true,conds:[],noinit:1})});norm();save();rCombat();initSheet()};
 $('#bcu',r).onclick=()=>{const n=prompt('Название','Страж');if(!n)return;const hp=+prompt('Хиты','11')||1,ac=+prompt('КД','13')||10;snap('+ '+n);k.list.push({id:uid(),base:n,name:n,init:R(20),dex:0,hp,max:hp,ac,pc:false,conds:[]});norm();sortC2();save();rCombat()}})}
function addMon(m,nm,roll){const k=C();let hp=m.hp;if(roll){const h=String(m.hd).replace(/\s/g,'').replace('−','-');hp=Math.max(1,rollD(h))}const dex=md(m.st[1]);const b=nm||m.n;k.list.push({id:uid(),base:b,name:b,init:R(20)+dex,dex,hp,max:hp,thp:0,ac:m.ac,pc:false,mon:m.id,conds:[],hide:1});norm();sortC2()}
function renum(){const k=C();const g={};k.list.forEach(c=>{if(!c.pc)(g[c.base]=g[c.base]||[]).push(c)});Object.values(g).forEach(a=>{if(a.length>1)a.forEach((c,i)=>c.name=c.base+' '+(i+1));else a[0].name=a[0].base})}
function sortC2(){const k=C();const cur=k.list[k.turn];k.list.sort((a,b)=>b.init-a.init||b.dex-a.dex||(b.pc?1:0)-(a.pc?1:0));k.turn=Math.max(0,k.list.indexOf(cur))}
/* ---- initiative entry ---- */
function initSheet(){const k=C();openSheet(`<div class="sb-title">Инициатива</div><div class="sb-sub">Впиши, что выпало на к20 — модификатор ЛОВ добавлю сам</div>
 <div class="list">${k.list.map((c,i)=>`<div class="card ini-r"><div class="grow"><div class="t">${esc(c.name)}</div><div class="m">ЛОВ ${fm(c.dex||0)} · сейчас ${c.init}</div></div><input class="inp" data-i="${i}" type="number" inputmode="numeric" placeholder="к20" style="width:74px;font-size:20px;text-align:center"></div>`).join('')}</div>
 <div class="row" style="margin-top:10px"><button class="btn" id="irm">🎲 Монстрам</button><button class="btn" id="ira">🎲 Всем</button><button class="btn red grow" id="iok">Готово</button></div>`,r=>{
 const ins=$$('[data-i]',r);ins.forEach((x,j)=>x.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();(ins[j+1]||$('#iok',r)).focus()}});setTimeout(()=>{const f=ins.find((x,j)=>k.list[j].pc);f&&f.focus()},150);
 const rl=f=>ins.forEach((x,j)=>{if(f(k.list[j])&&!x.value)x.value=R(20)});$('#irm',r).onclick=()=>rl(c=>!c.pc);$('#ira',r).onclick=()=>rl(()=>1);
 $('#iok',r).onclick=()=>{snap('инициатива');ins.forEach((x,j)=>{if(x.value!==''){const c=k.list[j];c.init=+x.value+(c.dex||0);c.noinit=0}});k.turn=0;sortC2();k.turn=0;k.t0=k.t0||Date.now();k.tt=Date.now();const ties=k.list.filter((c,i)=>i&&c.init===k.list[i-1].init).length;save();closeSheet();rCombat();toast(ties?'Ничьи решены по ЛОВ':'Порядок готов — ход '+(k.list[0]||{}).name)}})}
/* ---- combatant sheet ---- */
const CONDL=['Ослеплён','Очарован','Оглохший','Испуган','Схвачен','Недееспособен','Невидим','Парализован','Окаменел','Отравлен','Сбит с ног','Опутан','Ошеломлён','Без сознания','Концентрация','Ускорен','Благословлён','Подготовлено'];
function cSheet(c,tab){const k=C();const m=monOf(c);openSheet(`<div class="sb-title">${esc(c.name)}</div><div class="sb-sub">КД ${c.ac??"—"} · иниц. ${c.init}${m?` · ${esc(m.n)}, ПО ${crTxt(m.cr)}`:''}</div>
 <div class="cs-hp"><button class="btn red big" data-q="-5">−5</button><button class="btn red big" data-q="-1">−1</button><div class="cs-v"><b>${c.hp}</b><small>/ ${c.max}${c.thp?` +${c.thp} вр.`:''}</small></div><button class="btn big" data-q="1">+1</button><button class="btn big" data-q="5">+5</button></div>
 <div class="row"><input class="inp grow" id="cv" type="number" inputmode="numeric" placeholder="число" style="font-size:20px;text-align:center"><button class="btn red" id="cd">Урон</button><button class="btn" id="ch">Лечить</button><button class="btn" id="ct">Врем.</button></div>
 <div class="row" style="margin-top:6px"><button class="btn sm" id="cmx">Макс. хиты…</button><button class="btn sm" id="cac">КД…</button><button class="btn sm" id="cin">Иниц.…</button><button class="btn sm" id="chd">${c.hide?'👁 Показать хиты игрокам':'🙈 Скрыть хиты'}</button></div>
 <label class="f">Состояния (тап — добавить, раунды — длительность)</label><div class="row" id="cdur">${[0,1,2,3,10].map(n=>`<button class="chip${(cSheet.dur||0)===n?' on':''}" data-dur="${n}">${n?n+' р.':'∞'}</button>`).join('')}${chips('ce',[['start','в начале хода'],['end','в конце хода']],cSheet.end||'end')}</div>
 <div class="chips" id="ccl">${CONDL.map(n=>{const x=c.conds.find(y=>y.n===n);return `<button class="chip${x?' on':''}" data-cn="${n}">${n}${x&&x.r?' · '+x.r:''}</button>`}).join('')}</div>
 <label class="f">Заметка</label><textarea class="inp" id="cnt" rows="2" placeholder="Знает про ловушку, ранен в ногу…">${esc(c.note)}</textarea>
 <div class="row" style="margin-top:10px"><button class="btn" id="cdl">${c.delay?'▶ Вступить сейчас':'⏸ Отложить ход'}</button><button class="btn" id="crd">Подготовить</button>${m?'<button class="btn" id="csb">Статблок</button>':''}<button class="btn dark" id="crm">✕ Убрать</button></div>`,r=>{
 const re=()=>{save();cSheet(c);rCombat()};
 $$('[data-q]',r).forEach(b=>b.onclick=()=>{snap();const q=+b.dataset.q;q<0?damage(c,-q,'',1):heal(c,q);re()});
 const V=()=>+$('#cv',r).value||0;$('#cd',r).onclick=()=>{snap();const o=damage(c,V(),'',1);o.out.length&&toast(o.out.join(', '));re()};$('#ch',r).onclick=()=>{snap();heal(c,V());re()};$('#ct',r).onclick=()=>{snap();c.thp=Math.max(c.thp,V());syncP(c);re()};
 $('#cmx',r).onclick=()=>{const v=+prompt('Максимум хитов',c.max);if(v){snap(c.name+': макс. хиты '+v);c.max=v;c.hp=Math.min(c.hp,v);syncP(c);re()}};
 $('#cac',r).onclick=()=>{const v=+prompt('КД',c.ac);if(v){snap();c.ac=v;re()}};$('#cin',r).onclick=()=>{const v=prompt('Инициатива',c.init);if(v!=null&&v!==''){snap();c.init=+v;sortC2();re()}};
 $('#chd',r).onclick=()=>{c.hide=!c.hide;re()};
 $('#cdur',r).onclick=e=>{const b=e.target.closest('[data-dur]');if(b){cSheet.dur=+b.dataset.dur;cSheet(c)}};bindChips(r,(n,v)=>{if(n==='ce')cSheet.end=v});
 $('#ccl',r).onclick=e=>{const b=e.target.closest('[data-cn]');if(!b)return;const n=b.dataset.cn;snap();const x=c.conds.find(y=>y.n===n);if(x)c.conds=c.conds.filter(y=>y!==x);else{c.conds.push({n,r:cSheet.dur||0,end:cSheet.end||'end'});logC(`${c.name}: ${n}${cSheet.dur?' на '+cSheet.dur+' р.':''}`)}const p=pOf(c);if(p)p.conds=c.conds.map(y=>y.n);re()};
 $('#cnt',r).oninput=e=>{c.note=e.target.value;save()};
 $('#cdl',r).onclick=()=>{snap();if(c.delay){c.delay=0;const i=k.list.indexOf(c);k.list.splice(i,1);const cur=k.list[k.turn]||k.list[0];const j=k.list.indexOf(cur);k.list.splice(j,0,c);c.init=(cur?cur.init:c.init);k.turn=j;logC(c.name+' вступает')}else{c.delay=1;logC(c.name+' откладывает ход');if(k.list[k.turn]===c){closeSheet();return next()}}re()};
 $('#crd',r).onclick=()=>{snap();addCond(c,'Подготовлено',0);logC(c.name+' готовит действие');re()};
 const sb=$('#csb',r);if(sb)sb.onclick=()=>showMon(c.mon);
 $('#crm',r).onclick=()=>{snap('убран '+c.name);const i=k.list.indexOf(c);k.list.splice(i,1);if(k.turn>=k.list.length)k.turn=0;else if(i<k.turn)k.turn--;save();closeSheet();rCombat();KM.undoToast(c.name+' убран',undo)}})}
/* ---- end combat ---- */
function endCombat(){const k=C();const dead=k.list.filter(c=>!c.pc);const XPT={'0':10,'1/8':25,'1/4':50,'1/2':100,1:200,2:450,3:700,4:1100,5:1800,6:2300,7:2900,8:3900,9:5000,10:5900,11:7200,12:8400,13:10000,14:11500,15:13000,16:15000,17:18000,18:20000,19:22000,20:25000,21:33000,22:41000,23:50000,24:62000,25:75000,26:90000,27:105000,28:120000,29:135000,30:155000};const xpOf=c=>{const m=monOf(c)||DATA.monsters.find(x=>x.n===c.name||x.name===c.name);return +(m&&m.xp)||XPT[String(m&&m.cr!=null?m.cr:c.cr).trim()]||+c.xp||0};const xp=dead.reduce((s,c)=>s+xpOf(c),0);const party=players.length||1;
 openSheet(`<div class="sb-title">Завершить бой</div><div class="sb-sub">${k.round} раунд(ов) · ${fmtT(Date.now()-(k.t0||Date.now()))}</div>
 <div class="hs-box" style="margin-top:10px"><small>Опыт за монстров</small><b>${xp}</b><div class="muted">По ${Math.floor(xp/party)} каждому из ${party}</div></div>
 <label class="row" style="margin-top:8px"><input type="checkbox" id="exx" checked> Начислить опыт героям</label><label class="row"><input type="checkbox" id="exl" checked> Сгенерировать добычу с тел</label>
 <button class="btn red" id="eok" style="width:100%;margin-top:12px;padding:16px">Завершить</button>`,r=>{$('#eok',r).onclick=()=>{const old=JSON.stringify(k);const each=Math.floor(xp/party);
 if($('#exx',r).checked&&xp)players.forEach(p=>{p.xp=(p.xp||0)+each});k.list.filter(c=>c.pc).forEach(syncP);const loot=$('#exl',r).checked;
 Object.assign(k,{list:[],turn:0,round:1,log:[],undo:[],t0:0});save();closeSheet();logC(`Бой окончен: +${each} опыта каждому`);
 KM.undoToast(`Бой окончен${xp?' · +'+each+' опыта каждому':''}`,()=>{Object.assign(k,JSON.parse(old));if(xp)players.forEach(p=>p.xp-=each);save();rCombat()});
 if(loot){const crs=dead.map(c=>{const v=String(monOf(c)?.cr||0);return v.includes('/')?eval(v):+v});const mx=Math.max(0,...crs);const L2=KM.loot2();L2.t=String(mx>=17?3:mx>=11?2:mx>=5?1:0);L2.src=dead.some(c=>c.legMax)?'lair':mx>=5||dead.length>=4?'chest':'corpse';LS.set('loot2',L2);KM.go(KM.SECTIONS.findIndex(x=>x[0]==='items'));setTimeout(()=>{const s=document.querySelector('#lseg [data-t=gen]');s&&s.click();setTimeout(()=>{const b=document.querySelector('#gen');b&&b.click()},200)},500)}else rCombat()}})}
const fmtT=ms=>{const s=Math.max(0,Math.floor(ms/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
/* ---- render ---- */
let timer;
window.rCombat=rCombat=function(){norm();const k=C(),L=k.list,cur=L[k.turn];page.oninput=null;page.onclick=null;clearInterval(timer);
 const hpTxt=c=>c.hide&&k.pv?(c.dead?'повержен':c.hp<c.max/2?'тяжело ранен':c.hp<c.max?'ранен':'цел'):`${c.hp}/${c.max}${c.thp?' +'+c.thp:''}`;
 const bar=c=>`<div class="hpbar"><i style="width:${Math.max(0,Math.min(100,c.hp/c.max*100))}%"></i></div>`;
 const cn=c=>c.conds.map(x=>`<span class="cond">${esc(x.n)}${x.r?' '+x.r:''}</span>`).join('');
 let h=header('Бой','трекер инициативы','tri',0)+`<div class="cb-top"><div class="cb-rd"><small>РАУНД</small><b>${k.round}</b></div><div class="cb-tm"><b id="tmr"><i>бой</i> ${fmtT(Date.now()-(k.t0||Date.now()))}<br><i>ход</i> ${fmtT(Date.now()-(k.tt||Date.now()))}</b></div><button class="btn sm" id="cbshow" aria-label="Показать порядок ходов игрокам" style="margin-left:auto">📣 Игрокам</button>
  <button class="btn sm" id="cbu" aria-label="Отменить">↶</button><button class="btn sm${k.pv?' red':''}" id="cpv">${k.pv?'👁 Игроки':'🙈 Мастер'}</button><button class="btn sm" id="cmn">⋯</button></div>
  <div class="row cb-add"><button class="btn red grow" id="cad">＋ Существа</button><button class="btn grow" id="cin2">🎲 Инициатива</button><button class="btn" id="cenc">⚖</button></div>`;
 if(!L.length)h+=`<div class="cb-empty"><div class="esig"></div><p>Бой не начат.</p><button class="btn red" id="cst" style="padding:16px 22px">⚔ Начать: герои + монстры</button></div>`;
 else{const m=monOf(cur);const pp=pOf(cur);const pw=pp?(pp.inv||[]).map(x=>DATA.items.find(i=>i.id===x.item)).filter(i=>i&&i.dmg).map(i=>({n:i.n,d:`Атака оружием: ${fm(pb2(cur))} к попаданию. Попадание: ${avgD(i.dmg.split(' ')[0]+(md(pp.st[/фехт|дальн|лук|арбал/i.test(i.prop+i.sub)?1:0])>=0?'+':'')+md(pp.st[/фехт|дальн|лук|арбал/i.test(i.prop+i.sub)?1:0]))} (${i.dmg.split(' ')[0]}${fm(md(pp.st[/фехт|дальн|лук|арбал/i.test(i.prop+i.sub)?1:0]))}) ${i.dmg.split(' ')[1]||''} урона.`,t:'w'})):[];const acts=pw.length?pw:m?[...(m.a||[]).map(a=>({...a,t:'a'})),...(m.f||[]).filter(a=>/перезаряд|заклинан|колдовств/i.test(a.n)).map(a=>({...a,t:'f'}))]:[];
  h+=`<div class="cb-cur${cur.dead?' dead':''}" data-cid="${cur.id}" id="curc"><div class="cb-ch" data-open="${cur.id}"><div><small>ХОДИТ</small><b>${esc(cur.name)}</b></div><div class="cb-ac">КД<b>${cur.ac}</b></div></div>
  <div class="cb-hp" data-open="${cur.id}"><b>${k.pv&&cur.hide?hpTxt(cur):cur.hp}</b>${k.pv&&cur.hide?'':`<small>/${cur.max}${cur.thp?' +'+cur.thp+' вр.':''}</small>`}${bar(cur)}</div>
  ${cur.conds.length?`<div class="cb-conds">${cn(cur)}</div>`:''}
  ${cur.pc&&cur.hp===0&&!cur.dead?`<button class="btn red" id="cds" style="width:100%;margin:6px 0">☠ Спасбросок от смерти · ${cur.ds.s}✓ ${cur.ds.f}✗</button>`:''}
  <div class="cb-eco">${[['a','Действие'],['b','Бонус'],['m','Движение'],['r','Реакция']].map(([e,l])=>`<button data-eco="${e}" class="${cur.eco[e]?'used':''}">${l}</button>`).join('')}</div>
  ${cur.legMax?`<div class="cb-leg"><small>Легендарные</small>${Array.from({length:cur.legMax},(_,i)=>`<button class="pip${cur.leg>i?' on':''}" data-leg="${i}"></button>`).join('')}</div>`:''}
  ${Object.keys(cur.rech||{}).length?`<div class="cb-leg"><small>Перезарядка</small>${Object.entries(cur.rech).map(([n,v])=>`<button class="chip${v?' on':''}" data-rc="${esc(n)}">${esc(n.replace(/\s*\(.*\)/,''))} ${v?'готово':'⌛'}</button>`).join('')}</div>`:''}
  ${LS.get('novice',{on:1}).on?(()=>{const IN=['Без сознания','Ошеломлён','Ошеломлен','Парализован','Окаменение','Недееспособен'];const ic=cur.conds.find(x=>IN.includes(x.n));const st=(ok,t)=>`<li class="${ok?'ok':''}" style="${ok?'opacity:.5;text-decoration:line-through':''}">${t}</li>`;let b;
   if(cur.dead)b=`<b>${esc(cur.name)} повержен.</b> Нажмите «Следующий ход».`;
   else if(cur.pc&&cur.hp===0)b=`<b>Герой без сознания.</b> Нажмите «☠ Спасбросок от смерти», затем «Следующий ход».`;
   else if(ic)b=`<b>Состояние «${esc(ic.n)}»:</b> существо не может действовать. Нажмите «Следующий ход».`;
   else if(cur.pc)b=`<ol style="margin:4px 0 0 18px;padding:0">${st(cur.eco.m,'Спросите игрока: «Что делаешь?» Двигаться можно в любой момент хода.')}${st(cur.eco.a,'Атака: игрок бросает к20 → нажмите «⚔ Атака» или оружие ниже и введите число. Книга сравнит с КД и вычтет урон.')}${st(cur.eco.b,'Бонусное действие или заклинание — «✧ Заклинание».')}${st(0,'Готово → «Следующий ход ▶».')}</ol>`;
   else b=`<ol style="margin:4px 0 0 18px;padding:0">${st(cur.eco.m,'Подведите монстра к ближайшему герою (кнопка «Движение» — отметить).')}${st(cur.eco.a,'Нажмите атаку ниже → выберите цель → «🎲 Бросить за меня». Попадание, урон, сопротивления и концентрация считаются сами.')}${st(0,'Готово → «Следующий ход ▶». Ошиблись — «↶».')}</ol>`;
   return `<div class="cb-guide" style="margin:8px 0;padding:10px 12px;border-radius:10px;background:rgba(196,161,90,.1);border:1px solid rgba(196,161,90,.3);font-size:13.5px;line-height:1.45"><small style="opacity:.7">ПОДСКАЗКА · что делать сейчас</small><div>${b}</div></div>`})():''}
  <div class="cb-acts">${acts.map((a,i)=>{const P=parseAtk(a);return `<button class="cb-act" data-act="${i}"><b>${esc(a.n)}</b><small>${P.hit!=null?fm(P.hit)+' · ':''}${P.dm.map(d=>d.dice).join('+')}${P.save?` · спас ${P.save.ab} СЛ ${P.save.dc}`:''}</small></button>`}).join('')}
   <button class="cb-act" data-act="atk"><b>⚔ Атака</b><small>ввести бросок</small></button><button class="cb-act" data-act="aoe"><b>✦ По области</b><small>несколько целей</small></button>${cur.pc?`<button class="cb-act" data-act="spell"><b>✧ Заклинание</b><small>гримуар героя</small></button>`:''}</div>
  ${cur.note?`<div class="muted cb-note">✎ ${esc(cur.note)}</div>`:''}
  <div class="row cb-nav"><button class="btn" id="cpr">◀</button><button class="btn red grow big" id="cnx">Следующий ход ▶</button></div></div>
  <div class="cb-list">${L.map((c,i)=>i===k.turn?'':`<div class="cb-row${c.dead?' dead':''}${c.pc?' pc':''}${c.delay?' delay':''}" data-cid="${c.id}"><span class="ini">${c.delay?'⏸':c.init}</span><div class="grow"><div class="t">${esc(c.name)}${i===(k.turn+1)%L.length?' <small class="nx">следующий</small>':''}</div>${bar(c)}<div class="cb-c">${cn(c)}${c.note?'<span class="cond">✎</span>':''}${c.legMax&&!c.dead?`<button class="cb-lg" data-legc="${c.id}" aria-label="Легендарное действие">Л ${'●'.repeat(c.legMax-(c.leg||0))}${'○'.repeat(c.leg||0)}</button>`:''}</div></div><div class="cb-r"><b>${hpTxt(c)}</b><small>КД ${c.ac??"—"}</small></div></div>`).join('')}</div>
  <div class="muted" style="font-size:12px;margin:6px 2px">Свайп по строке ← урон, → лечение · свайп по карточке хода ← следующий · тап — подробно</div>
  <details class="cb-log"><summary>Журнал боя (${k.log.length})</summary>${k.log.slice(0,40).map(x=>`<div>${esc(x)}</div>`).join('')}</details>
  <button class="btn dark" id="cend" style="width:100%;margin-top:8px">🏁 Завершить бой · опыт и добыча</button>`}
 page.innerHTML=h+'<div style="height:24px"></div>';
 const on=(s,f)=>{const e=$(s);if(e)e.onclick=f};
 on('#cbu',undo);on('#cpv',()=>{k.pv=!k.pv;save();rCombat()});on('#cad',()=>bulk(''));on('#cin2',initSheet);on('#cenc',()=>KM.encounter&&KM.encounter(''));on('#cst',()=>{snap();players.forEach(p=>{if(!k.list.some(c=>c.pc&&(c.pid===p.id||c.base===p.name)))k.list.push({id:uid(),pid:p.id,base:p.name,name:p.name,init:0,dex:md(p.st[1]),hp:p.hp,max:p.maxhp,thp:p.thp||0,ac:p.ac,pc:true,conds:[],noinit:1})});norm();save();rCombat();if(players.length)toast('Герои за столом: '+players.length);$('#cad').click()});
 on('#cmn',()=>openSheet(`<div class="sb-title">Бой</div><div class="list" style="margin-top:12px"><button class="btn" id="m1">🏰 Ход логова (иниц. 20)</button><button class="btn" id="m2">⟲ Сбросить таймер хода</button><button class="btn" id="m3">🏁 Завершить бой</button><button class="btn dark" id="m4">✕ Очистить без опыта</button></div>`,r=>{$('#m1',r).onclick=()=>{snap();k.list.push({id:uid(),base:'Логово',name:'Логово',init:20,dex:-99,hp:1,max:1,ac:0,pc:false,conds:[],lair:1});sortC2();save();closeSheet();rCombat()};$('#m2',r).onclick=()=>{k.tt=Date.now();closeSheet()};$('#m3',r).onclick=endCombat;$('#m4',r).onclick=()=>{const o=JSON.stringify(k);Object.assign(k,{list:[],turn:0,round:1,log:[],undo:[],t0:0});save();closeSheet();rCombat();KM.undoToast('Бой очищен',()=>{Object.assign(k,JSON.parse(o));save();rCombat()})}}));
 if(!L.length)return;
 on('#cnx',()=>next(1));on('#cpr',()=>next(-1));on('#cend',endCombat);on('#cds',()=>deathSave(cur));
 page.querySelector('.cb-eco').onclick=e=>{const b=e.target.closest('[data-eco]');if(b){cur.eco[b.dataset.eco]^=1;save();const y=page.scrollTop;rCombat();page.scrollTop=y}};
 page.querySelectorAll('[data-legc]').forEach(b=>{b.onpointerdown=e=>e.stopPropagation();b.onclick=e=>{e.stopPropagation();const c=L.find(z=>z.id===b.dataset.legc);if((c.leg||0)>=c.legMax)return toast('Легендарные действия исчерпаны до хода '+c.name);snap();c.leg=(c.leg||0)+1;logC(c.name+': легендарное действие ('+(c.legMax-c.leg)+' осталось)');save();rCombat()}});page.querySelectorAll('[data-leg]').forEach(b=>b.onclick=()=>{const i=+b.dataset.leg;cur.leg=cur.leg>i?i:i+1;save();rCombat()});
 page.querySelectorAll('[data-rc]').forEach(b=>b.onclick=()=>{cur.rech[b.dataset.rc]^=1;save();rCombat()});
 page.querySelector('.cb-acts').onclick=e=>{const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act;if(a==='atk')return attack(cur,null);if(a==='aoe')return multi(cur,null);if(a==='spell'){const p=pOf(cur);KM.go(KM.SECTIONS.findIndex(x=>x[0]==='spells'));return}
  const m=monOf(cur);const pp=pOf(cur);let acts;if(pp){acts=(pp.inv||[]).map(x=>DATA.items.find(i=>i.id===x.item)).filter(i=>i&&i.dmg).map(i=>{const s=md(pp.st[/фехт|дальн|лук|арбал/i.test(i.prop+i.sub)?1:0]);return {n:i.n,d:`Атака оружием: ${fm(pb2(cur))} к попаданию. Попадание: ${avgD(i.dmg.split(' ')[0])+s} (${i.dmg.split(' ')[0]}${fm(s)}) ${i.dmg.split(' ')[1]||''} урона.`}})}else acts=[...(m.a||[]),...(m.f||[]).filter(x=>/перезаряд|заклинан|колдовств/i.test(x.n))];const act=acts[+a];const P=parseAtk(act);if(act.n in (cur.rech||{})&&!cur.rech[act.n])toast('Ещё не перезарядилось');if(P.hit!=null)attack(cur,act);else if(P.save||P.dm.length)multi(cur,act);else openSheet(`<div class="sb-title">${esc(act.n)}</div><div class="sb-body" style="margin-top:10px">${esc(act.d)}</div>`)};
 page.querySelectorAll('#curc [data-open]').forEach(e=>e.onclick=()=>cSheet(cur));
 // swipes & taps on rows
 page.querySelectorAll('.cb-row').forEach(row=>{let x0,y0,dx=0,mv=0;row.addEventListener('pointerdown',e=>{x0=e.clientX;y0=e.clientY;dx=0;mv=0});row.addEventListener('pointermove',e=>{if(x0==null)return;dx=e.clientX-x0;if(Math.abs(dx)>10&&Math.abs(dx)>Math.abs(e.clientY-y0)){mv=1;row.style.transform=`translateX(${dx}px)`;row.classList.toggle('sw-l',dx<-60);row.classList.toggle('sw-r',dx>60)}});
  const end=()=>{const c=L.find(z=>z.id===row.dataset.cid);row.style.transform='';row.classList.remove('sw-l','sw-r');if(x0==null)return;x0=null;if(mv&&dx<-60)quick(c,-1);else if(mv&&dx>60)quick(c,1);else if(!mv)cSheet(c)};row.addEventListener('pointerup',end);row.addEventListener('pointercancel',()=>{x0=null;row.style.transform=''})});
 const cc=$('#curc');let sx;cc.addEventListener('pointerdown',e=>{if(e.target.closest('button,[data-open]'))return sx=null;sx=e.clientX});cc.addEventListener('pointerup',e=>{if(sx!=null&&e.clientX-sx<-80)next(1);else if(sx!=null&&e.clientX-sx>80)next(-1);sx=null});
 timer=setInterval(()=>{const t=$('#tmr');if(!t)return clearInterval(timer);t.innerHTML='<i>бой</i> '+fmtT(Date.now()-(k.t0||Date.now()))+'<br><i>ход</i> '+fmtT(Date.now()-(k.tt||Date.now()))},1000)};
function quick(c,s){openSheet(`<div class="sb-title">${esc(c.name)}: ${s<0?'урон':'лечение'}</div><div class="sb-sub">${c.hp}/${c.max} · КД ${c.ac??"—"}</div><input class="inp" id="qv" type="number" inputmode="numeric" style="font-size:30px;text-align:center;margin-top:10px" placeholder="0">${s<0?`<div class="chips" id="qdt" style="margin-top:6px">${DT.map(([k2,l])=>`<button class="chip" data-dt="${k2}">${l}</button>`).join('')}</div>`:''}<button class="btn ${s<0?'red':''}" id="qok" style="width:100%;margin-top:10px;padding:16px">${s<0?'Нанести':'Вылечить'}</button>`,r=>{let dt='';setTimeout(()=>$('#qv',r).focus(),60);const q=$('#qdt',r);if(q)q.onclick=e=>{const b=e.target.closest('[data-dt]');if(b){dt=b.dataset.dt;$$('#qdt .chip',r).forEach(x=>x.classList.toggle('on',x===b))}};
 $('#qok',r).onclick=()=>{const v=+$('#qv',r).value||0;snap();if(s<0){const o=damage(c,v,dt);toast(`${c.name}: −${o.v}${o.out.length?' · '+o.out.join(', '):''}`)}else heal(c,v);save();closeSheet();rCombat();flash(c.id)}})}
KM.combat={damage,attack,multi,bulk,initSheet,next,undo,endCombat,parseAtk,cSheet,addMon:(m,n)=>{addMon(m,n);renum();save();rCombat()}};
}

document.addEventListener('click',e=>{if(!e.target.closest||!e.target.closest('#cbshow'))return;const t=window.KM&&KM.table;if(!t||!t.conns||!Object.keys(t.conns).length){toast('Стол не открыт: откройте ◎ Онлайн, чтобы игроки видели порядок ходов');return}t.push(true);toast('Порядок ходов и текущий ход показаны игрокам (вкладка «Мастер»)')});

;
/* assist.js */
'use strict';{
/* ===== Stage 7: offline assistant «Око» ===== */
const RULES=[
['Короткий отдых','Не меньше 1 часа. Можно потратить кости хитов: брось кость + мод. ТЕЛ за каждую. Колдуны восстанавливают ячейки.'],
['Долгий отдых','8 часов, не больше 2 часов лёгкой активности. Восстанавливаются все хиты и половина костей хитов (минимум 1), все ячейки. Истощение −1 (если поел и попил).'],
['Спасброски от смерти','При 0 хитов в начале хода брось к20 без модификаторов: 10+ успех, ниже — провал. 3 успеха — стабилен, 3 провала — смерть. 1 = два провала, 20 = встаёт с 1 хитом. Урон при 0 хитов — провал (крит — два).'],
['Концентрация','При получении урона — спасбросок ТЕЛ, СЛ 10 или половина урона (что больше). Провал — заклинание прерывается. Одновременно только одно заклинание с концентрацией.'],
['Укрытие','Половинное: +2 к КД и спасброскам ЛОВ. Три четверти: +5. Полное: нельзя выбрать целью напрямую.'],
['Преимущество и помеха','Бросаешь 2к20: с преимуществом берёшь больший, с помехой — меньший. Несколько источников не складываются; преимущество и помеха гасят друг друга.'],
['Инициатива','В начале боя все бросают к20 + мод. ЛОВ. Ходят по убыванию. При равенстве — по ЛОВ или решает Мастер.'],
['Действия в бою','В свой ход: перемещение, одно действие, при наличии — бонусное действие, одно реагирование до начала следующего хода. Действия: атака, заклинание, рывок, отход, уклонение, помощь, засада (подготовка), поиск, использование предмета.'],
['Критическое попадание','Натуральная 20 на атаке — попадание независимо от КД, кости урона бросаются дважды (модификатор один раз). Натуральная 1 — промах.'],
['Захват','Вместо одной атаки: проверка СИЛ (Атлетика) против Атлетики или Акробатики цели. Скорость цели становится 0.'],
['Падение','1к6 дробящего урона за каждые 3 м падения, максимум 20к6. Приземляется сбитым с ног.'],
['Истощение','1: помеха на проверки. 2: скорость вдвое. 3: помеха на атаки и спасброски. 4: максимум хитов вдвое. 5: скорость 0. 6: смерть.'],
['Сложность (СЛ)','Очень лёгкая 5, лёгкая 10, средняя 15, трудная 20, очень трудная 25, почти невозможная 30.'],
['Опыт за уровень','2: 300, 3: 900, 4: 2 700, 5: 6 500, 6: 14 000, 7: 23 000, 8: 34 000, 9: 48 000, 10: 64 000, 11: 85 000, 12: 100 000.'],
['Бонус мастерства','Уровни 1–4: +2, 5–8: +3, 9–12: +4, 13–16: +5, 17–20: +6.'],
['Пассивная Внимательность','10 + мод. МДР + бонус мастерства (если владеет). С преимуществом +5, с помехой −5.'],
['Сложность боя','Сложи опыт монстров, умножь: 1 монстр ×1, 2 — ×1,5, 3–6 — ×2, 7–10 — ×2,5, 11–14 — ×3, 15+ — ×4. Сравни с порогами отряда в «Бою».'],
['Видимость','Слабо заслонённая местность (сумрак): помеха на Внимательность. Сильно заслонённая (тьма): эффективно ослеплён.'],
['Невидимость и скрытность','Спрятаться — Скрытность против пассивной Внимательности. Невидимый: атаки по нему с помехой, его атаки — с преимуществом.'],
['Удушение','Задержать дыхание: 1 + мод. ТЕЛ минут (минимум 30 с). Затем раундов равно мод. ТЕЛ (минимум 1), после — 0 хитов.']];
const SYN={'фаербол':'огненный шар','файрбол':'огненный шар','фб':'огненный шар','хилка':'лечение ран','хил':'лечение ран','хилл':'лечение ран','лечилка':'зелье лечения','хилки':'зелье лечения','моб':'монстр','мобы':'монстр','босс':'легендарный','сейв':'спасбросок','сейвы':'спасбросок','крит':'критическое попадание','адвантаж':'преимущество','адв':'преимущество','дизадвантаж':'помеха','дизад':'помеха','стан':'ошеломлённый','инвиз':'невидимость','невидимка':'невидимость','лут':'добыча','нпс':'нип','нпц':'нип','непись':'нип','непися':'нип','мастер':'мастер','баф':'благословение','бафф':'благословение','дебаф':'проклятие','магмиссайл':'волшебная стрела','мисайл':'волшебная стрела','телепорт':'туманный шаг','отхил':'лечение ран','реген':'регенерация','дпс':'урон','дамаг':'урон','дамага':'урон','урон':'урон','скрытка':'скрытность','стелс':'скрытность','перса':'персонаж','перс':'персонаж','сундук':'добыча','шмот':'снаряжение','шмотки':'снаряжение','броник':'доспех','ловушки':'ловушка','бой':'инициатива','кость':'кубик','дайс':'кубик','дайсы':'кубик','лвл':'уровень','левел':'уровень','левелап':'повышение уровня','апнуть':'повышение уровня','отдохнуть':'отдых','привал':'короткий отдых','ночёвка':'долгий отдых','ночевка':'долгий отдых','хп':'хиты','hp':'хиты','жизни':'хиты','здоровье':'хиты','кд':'класс доспеха','ас':'класс доспеха','броня':'класс доспеха','конц':'концентрация','ини':'инициатива','инициатива':'инициатива','сл':'сложность','дс':'сложность','спас':'спасбросок','спасы':'спасбросок','отдых':'отдых','лут':'добыча','сокровища':'добыча','нип':'персонаж','npc':'персонаж','крит':'критическое','адв':'преимущество','помеха':'помеха','хил':'лечение','лечилка':'лечение','фаербол':'огненный шар','фб':'огненный шар','мм':'волшебная стрела','ячейки':'ячейка','слоты':'ячейка','опыт':'опыт','xp':'опыт','экспа':'опыт','ловушка':'ловушка','яд':'отравленный','стан':'ошеломлённый','паралич':'парализованный'};
const norm=s=>String(s||'').toLowerCase().replace(/ё/g,'е').replace(/[^a-zа-я0-9к+\- ]/g,' ');
const END=/(иями|ями|ами|ого|его|ому|ему|ыми|ими|ых|их|ой|ей|ий|ый|ая|яя|ое|ее|ые|ие|ам|ям|ах|ях|ом|ем|ую|юю|ов|ев|ы|и|а|я|о|е|у|ю|ь)$/;
const stem=w=>w.length>4?w.replace(END,''):w;
const toks=s=>norm(s).split(/\s+/).filter(Boolean).flatMap(w=>{const y=SYN[w];return y?norm(y).split(' '):[w]}).map(stem);
const lev=(a,b)=>{if(Math.abs(a.length-b.length)>2)return 9;const d=[...Array(b.length+1).keys()];for(let i=1;i<=a.length;i++){let p=d[0];d[0]=i;for(let j=1;j<=b.length;j++){const t=d[j];d[j]=Math.min(d[j]+1,d[j-1]+1,p+(a[i-1]===b[j-1]?0:1));p=t}}return d[b.length]};
let IDX=null;addEventListener("kmpacks",()=>{IDX=null});
function build(){const L=[];const add=(k,id,n,txt,open,sub)=>L.push({k,id,n,sub:sub||'',nt:toks(n),bt:new Set(toks(txt).slice(0,120)),open});
 DATA.spells.forEach(s=>add('Заклинание',s.id,s.n,[s.sc,s.dt,s.ds||s.tx||''].join(' '),()=>showSpell(s.id),(s.l?s.l+' круг':'заговор')+' · '+s.sc));
 DATA.monsters.forEach(m=>add('Монстр',m.id,m.n,[m.ty,m.sz].join(' '),()=>showMon(m.id),'ПО '+(m.cr??'?')+' · КД '+m.ac+' · '+m.hp+' хитов'));
 DATA.items.forEach(i=>add(i.art?'Артефакт':'Предмет',i.id,i.n,[i.cat,i.rar,i.sub||''].join(' '),()=>KM.showItem(i.id),[i.cat,i.rar,i.cost].filter(Boolean).join(' · ')));
 try{allCast().forEach(c=>add('НИП',c.id,c.n,[c.r,c.mo||'',c.ch||''].join(' '),()=>showCast(c.id),c.r))}catch(e){}
 CONDR.forEach(([n,t])=>add('Состояние',n,n,t,()=>say(`<b>${n}</b><br>${t}`),t.slice(0,60)+'…'));
 Object.entries(KM.GLOSS||{}).forEach(([n,t])=>add('Термин',n,n,t,()=>say(`<b>${n}</b><br>${t}`),t.slice(0,60)+'…'));
 RULES.forEach(([n,t])=>add('Правило',n,n,t,()=>say(`<b>${n}</b><br>${t}`),t.slice(0,60)+'…'));
 (typeof notes!=='undefined'?notes:[]).forEach(n=>add('Заметка',n.id,n.title,n.text||'',()=>{KM.go(KM.SECTIONS.findIndex(x=>x[0]==='notes'))},(n.text||'').slice(0,50)));
 (KM.players||[]).forEach(p=>add('Герой',p.id,p.name,p.cls||'',()=>KM.go(KM.SECTIONS.findIndex(x=>x[0]==='pcs')),`${p.cls||''} ${p.lvl||1} ур. · ${p.hp}/${p.maxhp} хитов · КД ${p.ac}`));
 IDX=L}
function search(q){if(!IDX)build();const Q=toks(q);if(!Q.length)return[];const out=[];
 for(const e of IDX){let s=0;for(const w of Q){let b=0;for(const t of e.nt){if(t===w)b=Math.max(b,10);else if(t.startsWith(w)||w.startsWith(t)&&t.length>3)b=Math.max(b,7);else if(w.length>3&&lev(w,t)<=(w.length>6?2:1))b=Math.max(b,5)}if(!b&&e.bt.has(w))b=2;s+=b}
  if(s>0){if(norm(e.n)===norm(q)||e.nt.join(' ')===Q.join(' '))s+=20;else if(e.nt.length===Q.length)s+=3;if(e.k==='Монстр'&&/хит|класс|кд|хп/.test(norm(q)))s+=8;out.push([s/Math.max(1,Q.length)+(e.k==='Правило'||e.k==='Состояние'?.5:0),e])}}
 return out.sort((a,b)=>b[0]-a[0]).slice(0,7).map(x=>x[1])}
const TIPS={sess:['Начни сцену: опиши три детали — звук, запах, свет.','Новички теряются: в конце сцены спроси «Что вы делаете?» каждого по имени.'],npc:['Дай НИП одну манеру речи и одно желание — этого достаточно.','«🎲» создаст случайного НИП за одно касание.'],spells:['Нажми «Каст» в книге заклинаний героя — ячейка спишется сама.'],items:['Генератор добычи учитывает уровень отряда и источник.'],combat:['Объявляй ход и следующего: «Ход Лиры, готовится Торин».','Концентрация: при уроне — спасбросок ТЕЛ, СЛ 10 или половина урона.'],dice:['Скажи «брось 2к6+3» — я брошу сам.'],pcs:['Пассивная Внимательность героев помогает не выдавать ловушки броском.'],map:['«＋» → «Сгенерировать» создаст подземелье, пещеру, склеп, лес или деревню.','Туман: включи «Вид игроков», чтобы показать карту за столом.'],notes:['Записывай имена, которые придумал на ходу, — игроки их запомнят.']};
const CHIPS=['Концентрация','Спасброски от смерти','Короткий отдых','Сложность боя','Укрытие','брось 1к20','Огненный шар','Гоблин'];
let box,log;
function say(h,me){const d=document.createElement('div');d.className='as-m'+(me?' me':'');d.innerHTML=h;log.append(d);log.scrollTop=1e9;return d}
function roll(e){const m=norm(e).match(/(\d*)\s*к\s*(\d+)\s*([+\-]\s*\d+)?/);if(!m)return null;const n=Math.min(50,+m[1]||1),d=+m[2],b=+(m[3]||'0').replace(/\s/g,'');const r=[];for(let i=0;i<n;i++)r.push(1+Math.floor(Math.random()*d));const t=r.reduce((a,c)=>a+c,0)+b;return `🎲 ${n}к${d}${b?(b>0?'+':'')+b:''}: [${r.join(', ')}]${b?' '+(b>0?'+':'')+b:''} = <b>${t}</b>`}
function answer(q){say(esc(q),1);const nq=norm(q);
 if(/^(брос|кинь|кубик|roll)|^\d*\s*к\d/.test(nq)||/\d*к\d+/.test(nq)&&nq.length<20){const r=roll(q);if(r)return say(r)}
 if(/^(как|что|помощь|помоги)\s*(ты|умеешь)?\s*$/.test(nq))return say('Я ищу без интернета по заклинаниям, монстрам, предметам, артефактам, НИП, состояниям, правилам, твоим заметкам и героям. Понимаю сокращения: хп, кд, конц, сл, нип. Могу бросить кости: «брось 3к6+2».');
 const pl=(KM.players||[]).find(p=>nq.includes(norm(p.name).split(' ')[0])&&p.name);if(pl&&/хит|хп|кд|жив|состо/.test(nq))return say(`<b>${esc(pl.name)}</b>: ${pl.hp}/${pl.maxhp} хитов, КД ${pl.ac}${(pl.conds||[]).length?', состояния: '+pl.conds.join(', '):''}.`);
 const R=search(q);if(!R.length)return say('Не нашёл. Попробуй короче или другим словом — например «яд», «отдых», «дракон».');
 const top=R[0];if(top.k==='Монстр'&&/хит|хп|кд|класс/.test(nq)){const m=DATA.monsters.find(x=>x.id===top.id);say(`<b>${esc(m.n)}</b>: ${m.hp} хитов (${m.hd}), КД ${m.ac}, ПО ${crTxt(m.cr)}, опыт ${m.xp}.`)}if((top.k==='Правило'||top.k==='Состояние'||top.k==='Термин')&&R.length)top.open();
 if(['Правило','Состояние','Термин'].includes(top.k)||top.k==='Монстр'&&/хит|хп|кд|класс/.test(nq))R.length=Math.min(R.length,3);
 const d=say(R.length<=3?'Ещё по теме:':'Нашёл — вот лучшее:');const ul=document.createElement('div');ul.className='as-res';ul.innerHTML=R.map((e,i)=>`<button data-i="${i}"><i>${e.k}</i><b>${esc(e.n)}</b><small>${esc(e.sub)}</small></button>`).join('');d.append(ul);
 ul.onclick=ev=>{const b=ev.target.closest('[data-i]');if(!b)return;const e=R[+b.dataset.i];if(['Правило','Состояние','Термин'].includes(e.k))e.open();else{close();e.open()}}}
function open(){if(!box){box=document.createElement('div');box.className='as-box';box.innerHTML=`<div class="as-hd"><span class="as-ey"></span><b>Око Книги</b><small>помощник без сети</small><button class="as-x" aria-label="Закрыть">✕</button></div><div class="as-log"></div><div class="as-chips"></div><form class="as-in"><input placeholder="Спроси: хп гоблина, конц, брось 2к6…" enterkeyhint="search"><button>➤</button></form>`;document.body.append(box);log=box.querySelector('.as-log');
  box.querySelector('.as-x').onclick=close;box.querySelector('form').onsubmit=e=>{e.preventDefault();const i=box.querySelector('input');if(i.value.trim()){answer(i.value.trim());i.value=''}};
  box.querySelector('.as-chips').onclick=e=>{const b=e.target.closest('button');if(b)answer(b.textContent)}}
 IDX=null;const sec=(KM.SECTIONS[(window.S||{}).sec]||[])[0]||(typeof S!=='undefined'?(KM.SECTIONS[S.sec]||[])[0]:'');const tips=TIPS[sec]||TIPS.sess;
 if(!log.childElementCount)say('Я — Око Книги. Спрашивай о правилах, заклинаниях, монстрах и твоих записях. Работаю без интернета.');
 say('<i>Совет:</i> '+tips[Math.floor(Math.random()*tips.length)]);
 box.querySelector('.as-chips').innerHTML=CHIPS.map(c=>`<button>${c}</button>`).join('');box.classList.add('on');document.documentElement.classList.add('as-open')}
function close(){box&&box.classList.remove('on');document.documentElement.classList.remove('as-open')}
const fab=document.createElement('button');fab.className='as-fab';fab.setAttribute('aria-label','Помощник');fab.innerHTML=`<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="none" stroke="#c9a45a" stroke-width=".8" stroke-dasharray="1 2"/><circle cx="20" cy="20" r="14" fill="none" stroke="#8a1c14" stroke-width=".6"/><path d="M7 20Q20 9 33 20Q20 31 7 20z" fill="#1a110c" stroke="#d9c49a" stroke-width="1.1"/><circle cx="20" cy="20" r="5" fill="#8a1c14"/><circle cx="20" cy="20" r="2" fill="#0a0605"/></svg>`;
fab.onclick=()=>box&&box.classList.contains('on')?close():open();document.body.append(fab);
KM.assist={open,close,search,answer};}

;
/* webgl.js */
'use strict';{
/* WebGL: low-res smoky ink fog + drifting embers behind the book. ~0.3 scale, 30 fps cap, paused when hidden. */
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
const cv=document.createElement('canvas');cv.id='glfx';document.body.prepend(cv);
const gl=cv.getContext('webgl',{alpha:true,antialias:false,depth:false,powerPreference:'low-power',premultipliedAlpha:false});
if(gl){const vs='attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}';
const fs=`precision mediump float;uniform vec2 r;uniform float t;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
float fb(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){vec2 uv=gl_FragCoord.xy/r;vec2 q=uv*vec2(r.x/r.y,1.)*2.2;
float f=fb(q+vec2(t*.03,-t*.05)+fb(q*1.3-t*.02));
vec3 smoke=mix(vec3(.05,.025,.02),vec3(.28,.07,.05),smoothstep(.45,.85,f));
float a=smoothstep(.35,.9,f)*.55*(1.-uv.y*.6);
vec2 g=uv*vec2(r.x/r.y,1.)*vec2(18.,9.);g.y-=t*.35;vec2 c=floor(g);vec2 fr=fract(g)-.5;float e=h(c);
fr.x+=sin(t*.8+e*20.)*.25;float em=step(.93,e)*smoothstep(.12,.0,length(fr))*(.5+.5*sin(t*3.+e*40.));
gl_FragColor=vec4(smoke+vec3(1.,.55,.2)*em,a+em*.9);}`;
const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o};const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,vs));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);gl.useProgram(pr);
const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);const pl=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(pl);gl.vertexAttribPointer(pl,2,gl.FLOAT,false,0,0);
const ur=gl.getUniformLocation(pr,'r'),ut=gl.getUniformLocation(pr,'t');gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
const S=.3;const size=()=>{cv.width=Math.max(64,innerWidth*S|0);cv.height=Math.max(64,innerHeight*S|0);gl.viewport(0,0,cv.width,cv.height);gl.uniform2f(ur,cv.width,cv.height)};size();let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(size,200)});
let last=0;const t0=performance.now();const off=()=>document.hidden||document.documentElement.classList.contains('paused')||document.documentElement.classList.contains('lowfx')||(KM.settings&&KM.settings.fx===false)||!!document.querySelector('.show#sheet,#sheet.show')||!document.querySelector('#cover.gone')||!!document.getElementById('mc');
(function loop(now){requestAnimationFrame(loop);if(now-last<33||off())return;last=now;gl.uniform1f(ut,(now-t0)/1000);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,3)})(0);
KM.gl=true}}}
