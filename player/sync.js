'use strict';{
const A=window.KPA;const {$,$$,esc,LS,toast}=A;const PREFIX='kniga-mastera-v1-';
const S=LS.get('sync',{code:'',name:'',pid:'',auto:false});if(!S.pid){S.pid='p'+A.uid()+A.uid();LS.set('sync',S)}
const q=new URLSearchParams(location.search).get('room');if(q){S.code=q.toUpperCase().slice(0,8);LS.set('sync',S)}
let peer=null,conn=null,st='не подключено',live=false,perm={},init=null,map=null,lastSent={},retry=0,tmr;
const sv=()=>LS.set('sync',S);
function connect(){if(!window.Peer){st='модуль связи не загружен';return paint()}if(!S.code)return;clearTimeout(tmr);
 if(!peer||peer.destroyed){peer=new Peer({debug:0});peer.on('open',()=>dial());peer.on('error',e=>{st=e.type==='peer-unavailable'?'стол Мастера не открыт — жду…':'ошибка связи ('+e.type+')';live=false;paint();again()});peer.on('disconnected',()=>{try{peer.reconnect()}catch(e){}})}
 else if(peer.open)dial();st='подключение…';paint()}
function dial(){try{conn&&conn.close()}catch(e){}conn=peer.connect(PREFIX+S.code,{reliable:true});
 conn.on('open',()=>{live=true;retry=0;st='за столом';S.auto=true;sv();conn.send({t:'hello',name:S.name||A.H.name,pid:S.pid,hero:{id:A.H.id,name:A.H.name}});paint();toast('Связь с Мастером установлена')});
 conn.on('data',onState);conn.on('close',()=>{live=false;st='связь потеряна — переподключаюсь…';paint();again()});conn.on('error',()=>{})}
function again(){clearTimeout(tmr);if(!S.auto)return;tmr=setTimeout(connect,Math.min(20000,1500*(++retry)))}
function onState(d){if(!d||d.t!=='state')return;perm=d.perm||{};init=d.init;map=d.map;LS.set('handouts',d.handouts||[]);
 if(d.hero){const H=A.H;const h=d.hero;['id','name','cls','lvl','hp','maxhp','thp','ac','spd','st','inv','coins','spells','slots','ds','insp','xp','conds'].forEach(f=>{if(h[f]!==undefined)H[f]=h[f]});if(typeof h.notes==='string'&&!document.activeElement?.matches('#nt'))H.notes=h.notes;A.H=H;snapSent()}
 A.render()}
const F={notes:H=>H.notes,slots:H=>H.slots,conds:H=>H.conds,inv:H=>({inv:H.inv,coins:H.coins}),hp:H=>({hp:H.hp,maxhp:H.maxhp,thp:H.thp,ds:H.ds})};
function snapSent(){Object.keys(F).forEach(f=>lastSent[f]=JSON.stringify(F[f](A.H)))}
function onLocal(){if(!live)return;const ch={};Object.keys(F).forEach(f=>{const v=JSON.stringify(F[f](A.H));if(v!==lastSent[f]&&perm[f]&&perm[f]!=='off'){ch[f]=F[f](A.H);lastSent[f]=v;if(perm[f]==='approve')toast('Отправлено Мастеру на одобрение')}});if(Object.keys(ch).length)try{conn.send({t:'edit',ch})}catch(e){}}
function paint(){const b=$('#link');if(b){b.className='lk'+(live?' on':'');b.textContent=live?'◉':'◌'}if(A&&localStorage.getItem('kp_tab')==='"table"'&&!document.activeElement?.matches('input,textarea'))A.render()}
const PN={notes:'Записи',slots:'Ячейки',conds:'Состояния',inv:'Сумка',hp:'Хиты'};
function render(){return `<div class="card"><h3 style="margin-top:0">Стол Мастера</h3><div class="row"><span class="grow ${live?'':'muted'}">${live?'◉ ':'◌ '}${esc(st)}</span></div>
 ${live?`<div style="margin-top:8px">${Object.keys(PN).map(f=>`<span class="chip${perm[f]&&perm[f]!=='off'?' on':''}">${PN[f]}: ${perm[f]==='direct'?'сам':perm[f]==='approve'?'через Мастера':'только Мастер'}</span>`).join('')}</div><button class="btn" id="sdis" style="width:100%;margin-top:8px">Выйти из-за стола</button>`:`
 <input class="inp" id="scode" placeholder="Код комнаты (от Мастера)" value="${esc(S.code)}" style="text-transform:uppercase;font-size:24px;letter-spacing:6px;text-align:center;margin-top:8px" maxlength="8" autocapitalize="characters">
 <input class="inp" id="sname" placeholder="Ваше имя (игрок)" value="${esc(S.name)}" style="margin-top:6px"><button class="btn ac" id="sgo" style="width:100%;margin-top:8px;padding:14px">◎ Сесть за стол</button>`}</div>
 ${init?`<h3>Инициатива · раунд ${init.round}</h3><div class="card init">${init.list.map((c,i)=>`<div class="${i===init.turn?'cur':''}" style="${c.dead?'opacity:.45':''}"><b style="width:30px">${esc(c.init)}</b><span class="grow">${esc(c.n)}${i===init.turn?' <small class="soon">ходит</small>':''}${c.conds.length?`<br><small class="muted">${c.conds.map(esc).join(', ')}</small>`:''}</span><span class="muted">${esc(c.st)}</span></div>`).join('')}</div>`:''}
 ${map?`<h3>${esc(map.n)}</h3><img id="mapc" src="${map.src}" alt="Карта">`:''}
 <div class="card"><h3 style="margin-top:0">Без интернета</h3><button class="btn" id="exp" style="width:100%">⧉ Скопировать код героя</button><textarea class="inp" id="imp" placeholder="Вставьте код героя от Мастера (KP1:…)" style="margin-top:8px;min-height:70px"></textarea><button class="btn" id="impb" style="width:100%;margin-top:6px">Загрузить героя</button></div>`}
function bind(){const g=$('#sgo');if(g)g.onclick=()=>{S.code=$('#scode').value.trim().toUpperCase();S.name=$('#sname').value.trim();S.auto=true;sv();retry=0;connect()};
 const d=$('#sdis');if(d)d.onclick=()=>{S.auto=false;sv();try{conn.close()}catch(e){}live=false;st='не подключено';init=null;map=null;A.render()};
 $('#exp').onclick=()=>{const c='KP1:'+btoa(unescape(encodeURIComponent(JSON.stringify(A.H))));(navigator.clipboard?navigator.clipboard.writeText(c):Promise.reject()).then(()=>toast('Код скопирован'),()=>{$('#imp').value=c;toast('Код в поле ниже')})};
 $('#impb').onclick=()=>{try{const h=JSON.parse(decodeURIComponent(escape(atob($('#imp').value.trim().replace(/^KP1:/,'')))));A.H=Object.assign(A.H,h);A.save();toast('Герой загружен');A.render()}catch(e){toast('Неверный код')}}}
window.KP={linked:()=>live,can:f=>perm[f]&&perm[f]!=='off',render,bind,onLocal};
$('#link').onclick=()=>{localStorage.setItem('kp_tab','"table"');location.hash='';A.render();KM.go(4)};
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&S.auto&&!live){retry=0;connect()}});
if(S.code&&(S.auto||q))connect();
}
