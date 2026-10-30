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
 <label class="f">Цель</label><div class="chips" id="tg">${k.list.filter(c=>c!==src&&!c.dead).map(c=>`<button class="chip${c===tgt?' on':''}" data-id="${c.id}">${esc(c.name)} · КД ${c.ac}</button>`).join('')}</div>
 ${A.hit==null?`<label class="f">Бонус атаки</label><input class="inp" id="hb" type="number" inputmode="numeric" value="${src&&src.pc?pb2(src):4}">`:''}
 ${chips('adv',[['0','Обычно'],['1','Преимущество'],['-1','Помеха']],0)}
 <div class="re-out" id="ao">Что выпало на к20?</div><div class="re-pad" id="ap">${Array.from({length:20},(_,i)=>`<button data-v="${i+1}" class="${i===19?'n20':i===0?'n1':''}">${i+1}</button>`).join('')}</div>
 <div class="row" style="margin-top:8px"><button class="btn grow" id="avr">🎲 Бросить за меня</button><button class="btn" id="askip">Сразу урон</button></div><div id="dmgz"></div>`,r=>{
 $('#tg',r).onclick=e=>{const b=e.target.closest('[data-id]');if(!b)return;tgt=k.list.find(c=>c.id===b.dataset.id);$$('#tg .chip',r).forEach(x=>x.classList.toggle('on',x===b))};bindChips(r,(n,v)=>adv=+v);
 const res=(nat,txt)=>{const bonus=A.hit!=null?A.hit:+($('#hb',r)||{}).value||0,tot=nat+bonus,crit=nat===20,hit=crit||nat!==1&&tot>=tgt.ac;
  $('#ao',r).innerHTML=`<b class="re-t">${tot}</b> <small>(${txt||nat} ${fm(bonus)}) против КД ${tgt.ac}</small><div class="re-v ${hit?'ok':'no'}">${crit?'КРИТ! ':''}${hit?'Попадание':'Промах'}</div>`;$('#ao',r).classList.remove('pop');void $('#ao',r).offsetWidth;$('#ao',r).classList.add('pop');
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
function multi(src,act){const k=C();const A=act?parseAtk(act):{dm:[],save:null};let sel=new Set(k.list.filter(c=>!c.dead&&src&&c.pc!==src.pc).map(c=>c.id));const sv={};let dt=(A.dm[0]||{}).dt||'';const ABI={СИЛ:0,Силы:0,ЛОВ:1,Ловкости:1,ТЕЛ:2,Телосложения:2,ИНТ:3,Интеллекта:3,МДР:4,Мудрости:4,ХАР:5,Харизмы:5};let ab=A.save?(ABI[A.save.ab]??1):1;
 const draw=()=>openSheet(`<div class="sb-title">${esc(act?act.n:'Урон по области')}</div><div class="sb-sub">Несколько целей · спасбросок — половина урона</div>
 <div class="row"><div class="grow"><label class="f">Урон</label><input class="inp" id="mv" type="number" inputmode="numeric" placeholder="${A.dm.map(d=>d.dice).join('+')||'сумма'}" style="font-size:20px"></div><div><label class="f">СЛ</label><input class="inp" id="mdc" type="number" inputmode="numeric" value="${A.save?A.save.dc:(src&&src.pc?13:13)}" style="width:70px"></div></div>
 ${A.dm.length?`<button class="btn sm" id="mrl">🎲 Бросить ${A.dm.map(d=>d.dice).join('+')}</button>`:''}
 <label class="f">Спасбросок</label>${chips('mab',AB.map((a,i)=>[i,a]),ab)}
 <label class="f">Тип урона</label><div class="chips" id="mdt">${DT.map(([k2,l])=>`<button class="chip${k2===dt?' on':''}" data-dt="${k2}">${l}</button>`).join('')}</div>
 <div class="list" id="mt" style="margin-top:8px">${k.list.filter(c=>!c.dead).map(c=>`<div class="card mt-r${sel.has(c.id)?' on':''}" data-id="${c.id}"><button class="dot${sel.has(c.id)?' on':''}" data-sel></button><div class="grow"><div class="t">${esc(c.name)}</div><div class="m">${c.hp}/${c.max} · КД ${c.ac}</div></div><button class="btn sm${sv[c.id]===1?' on-g':''}" data-s="1">Успех</button><button class="btn sm${sv[c.id]===0?' on-r':''}" data-s="0">Провал</button></div>`).join('')}</div>
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
function cSheet(c,tab){const k=C();const m=monOf(c);openSheet(`<div class="sb-title">${esc(c.name)}</div><div class="sb-sub">КД ${c.ac} · иниц. ${c.init}${m?` · ${esc(m.n)}, ПО ${crTxt(m.cr)}`:''}</div>
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
function endCombat(){const k=C();const dead=k.list.filter(c=>!c.pc&&c.mon);const xp=dead.reduce((s,c)=>s+(monOf(c)?.xp||0),0);const party=players.length||1;
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
  <div class="cb-list">${L.map((c,i)=>i===k.turn?'':`<div class="cb-row${c.dead?' dead':''}${c.pc?' pc':''}${c.delay?' delay':''}" data-cid="${c.id}"><span class="ini">${c.delay?'⏸':c.init}</span><div class="grow"><div class="t">${esc(c.name)}${i===(k.turn+1)%L.length?' <small class="nx">следующий</small>':''}</div>${bar(c)}<div class="cb-c">${cn(c)}${c.note?'<span class="cond">✎</span>':''}${c.legMax&&!c.dead?`<button class="cb-lg" data-legc="${c.id}" aria-label="Легендарное действие">Л ${'●'.repeat(c.legMax-(c.leg||0))}${'○'.repeat(c.leg||0)}</button>`:''}</div></div><div class="cb-r"><b>${hpTxt(c)}</b><small>КД ${c.ac}</small></div></div>`).join('')}</div>
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
function quick(c,s){openSheet(`<div class="sb-title">${esc(c.name)}: ${s<0?'урон':'лечение'}</div><div class="sb-sub">${c.hp}/${c.max} · КД ${c.ac}</div><input class="inp" id="qv" type="number" inputmode="numeric" style="font-size:30px;text-align:center;margin-top:10px" placeholder="0">${s<0?`<div class="chips" id="qdt" style="margin-top:6px">${DT.map(([k2,l])=>`<button class="chip" data-dt="${k2}">${l}</button>`).join('')}</div>`:''}<button class="btn ${s<0?'red':''}" id="qok" style="width:100%;margin-top:10px;padding:16px">${s<0?'Нанести':'Вылечить'}</button>`,r=>{let dt='';setTimeout(()=>$('#qv',r).focus(),60);const q=$('#qdt',r);if(q)q.onclick=e=>{const b=e.target.closest('[data-dt]');if(b){dt=b.dataset.dt;$$('#qdt .chip',r).forEach(x=>x.classList.toggle('on',x===b))}};
 $('#qok',r).onclick=()=>{const v=+$('#qv',r).value||0;snap();if(s<0){const o=damage(c,v,dt);toast(`${c.name}: −${o.v}${o.out.length?' · '+o.out.join(', '):''}`)}else heal(c,v);save();closeSheet();rCombat();flash(c.id)}})}
KM.combat={damage,attack,multi,bulk,initSheet,next,undo,endCombat,parseAtk,cSheet,addMon:(m,n)=>{addMon(m,n);renum();save();rCombat()}};
}

document.addEventListener('click',e=>{if(!e.target.closest||!e.target.closest('#cbshow'))return;const t=window.KM&&KM.table;if(!t||!t.conns||!Object.keys(t.conns).length){toast('Стол не открыт: откройте ◎ Онлайн, чтобы игроки видели порядок ходов');return}t.push(true);toast('Порядок ходов и текущий ход показаны игрокам (вкладка «Мастер»)')});
