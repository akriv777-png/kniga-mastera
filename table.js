'use strict';{
/* «Стол»: живая связь Книги Мастера с Книгами Игроков (WebRTC через PeerJS, Мастер — хост) */
const PREFIX='kniga-mastera-v1-';const PURL='https://akriv777-png.github.io/kniga-mastera/player/';
const ALPH='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const T=LS.get('table',{code:'',on:false,perm:{},link:{}});const sv=()=>LS.set('table',T);
if(!T.code){T.code=Array.from({length:5},()=>ALPH[Math.floor(Math.random()*ALPH.length)]).join('');sv()}
const DEF={notes:'direct',slots:'direct',conds:'direct',inv:'approve',hp:'approve'};
const PL={notes:'Записи',slots:'Ячейки',conds:'Состояния',inv:'Сумка и монеты',hp:'Хиты'};
let peer=null,conns={},pend=[],status='выкл',retry=0,last={};
const permOf=pid=>Object.assign({},DEF,T.perm[pid]||{});
const heroOf=pid=>players.find(p=>p.id===T.link[pid]);
function start(){if(!window.Peer)return toast('Модуль связи не загружен');stop(true);status='подключение…';peer=new Peer(PREFIX+T.code,{debug:0});
 peer.on('open',()=>{status='открыт';retry=0;T.on=true;sv();upd()});
 peer.on('connection',c=>{c.on('open',()=>{conns[c.peer]={c,name:'?',pid:null};upd()});c.on('data',d=>onData(c,d));c.on('close',()=>{delete conns[c.peer];upd()});c.on('error',()=>{})});
 peer.on('disconnected',()=>{status='переподключение…';upd();setTimeout(()=>{try{peer&&!peer.destroyed&&peer.reconnect()}catch(e){}},1500)});
 peer.on('error',e=>{status=e.type==='unavailable-id'?'код занят — повтор…':'ошибка: '+e.type;upd();if(['unavailable-id','network','server-error','socket-error','socket-closed'].includes(e.type)){clearTimeout(start.t);start.t=setTimeout(()=>T.on&&start(),Math.min(30000,2000*(++retry)))}})}
function stop(keep){try{peer&&peer.destroy()}catch(e){}peer=null;conns={};if(!keep){T.on=false;sv();status='выкл'}upd()}
function onData(c,d){const k=conns[c.peer];if(!k||!d||typeof d!=='object')return;
 if(d.t==='hello'){k.name=String(d.name||'Игрок').slice(0,40);k.pid=String(d.pid||c.peer).slice(0,40);
  if(!T.link[k.pid]){const h=players.find(p=>p.id===d.hero?.id)||players.find(p=>p.name===d.hero?.name);if(h){T.link[k.pid]=h.id;sv()}}
  last[c.peer]='';upd();toast('За стол сел: '+k.name);push(true)}
 if(d.t==='edit'&&k.pid){const h=heroOf(k.pid);if(!h)return;const P=permOf(k.pid);const ch=d.ch||{};
  Object.keys(ch).forEach(f=>{if(!PL[f])return;const mode=P[f];if(mode==='off')return;if(mode==='direct')apply(h,f,ch[f]);else{pend=pend.filter(x=>!(x.pid===k.pid&&x.f===f));pend.push({id:uid(),pid:k.pid,who:k.name,hero:h.name,f,v:ch[f]});toast(`${k.name}: запрос — ${PL[f]}`)}});
  save();rRefresh();push(true);upd()}}
function apply(h,f,v){if(f==='notes')h.pnotes=String(v||'').slice(0,5000);if(f==='slots'&&v&&typeof v==='object')h.slots=v;if(f==='conds'&&Array.isArray(v))h.conds=v.map(String).slice(0,20);if(f==='inv'&&v){if(Array.isArray(v.inv))h.inv=v.inv.slice(0,200);if(v.coins)h.coins=v.coins}if(f==='hp'&&v){h.hp=Math.max(0,Math.min(+v.maxhp||h.maxhp,+v.hp));h.thp=Math.max(0,+v.thp||0);if(v.ds)h.ds=v.ds}
 const c=combat.list.find(x=>x.pc&&(x.pid===h.id||x.name===h.name));if(c&&f==='hp'){c.hp=h.hp;c.thp=h.thp}if(c&&f==='conds')c.conds=h.conds.map(n=>({n,r:0}))}
function rRefresh(){try{if(page&&S.sec===6&&window.rPcs)rPcs();if(S.sec===4)rCombat()}catch(e){}}
/* --- что видит игрок --- */
function initView(){const k=combat;if(!k.list||!k.list.length)return null;return {round:k.round,turn:k.turn,list:k.list.map(c=>({n:c.name,pc:!!c.pc,init:c.delay?'⏸':c.init,st:c.pc?`${c.hp}/${c.max}`:c.dead?'повержен':c.hp<c.max/2?'тяжело ранен':c.hp<c.max?'ранен':'цел',conds:(c.conds||[]).map(x=>x.n||x).filter(n=>n!=='Подготовлено'),dead:!!c.dead}))}}
let mapCache={key:'',img:null};
function mapView(){try{const ms=LS.get('maps',[]);const id=LS.get('mapcur',ms[0]&&ms[0].id);const m=ms.find(x=>x.id===id);if(!m||!m.shared)return null;const key=m.id+JSON.stringify(m.fog)+JSON.stringify(m.tok)+m.g.length;if(key===mapCache.key)return mapCache.img;
 const CS=24,cv=document.createElement('canvas');cv.width=m.W*CS;cv.height=m.H*CS;const g=cv.getContext('2d');drawMap(g,m,CS,1);mapCache={key,img:{n:m.name,src:cv.toDataURL('image/jpeg',.72),W:m.W,H:m.H}};return mapCache.img}catch(e){return null}}
function heroView(h){if(!h)return null;const o={};['id','name','cls','lvl','hp','maxhp','thp','ac','spd','st','inv','coins','spells','slots','ds','insp','xp','exh'].forEach(f=>o[f]=h[f]);o.conds=(h.conds||[]).map(x=>x.n||x);o.notes=h.pnotes||'';return o}
function push(force){if(!peer)return;const camp=LS.get('camp',{});const ho=(camp.h||[]).filter(x=>x.sh).map(x=>({n:x.n,t:x.t,img:x.img}));const iv=initView(),mv=mapView();
 Object.entries(conns).forEach(([id,k])=>{if(!k.pid)return;const msg={t:'state',hero:heroView(heroOf(k.pid)),perm:permOf(k.pid),init:iv,handouts:ho,map:mv,dm:'Мастер'};const s=JSON.stringify(msg);if(!force&&s===last[id])return;last[id]=s;try{k.c.send(msg)}catch(e){}})}
setInterval(()=>push(false),1200);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&T.on&&(!peer||peer.destroyed||peer.disconnected))start()});
/* --- интерфейс Мастера --- */
function qrSvg(t){try{const q=qrcode(0,'M');q.addData(t);q.make();return q.createSvgTag({cellSize:5,margin:2,scalable:true})}catch(e){return ''}}
function code(h){return 'KP1:'+btoa(unescape(encodeURIComponent(JSON.stringify(heroView(h)))))}
function ui(){const url=PURL+'?room='+T.code;const cs=Object.entries(conns);
 openSheet(`<div class="sb-title">Стол игроков</div><div class="sb-sub">Живая связь с «Книгой Игрока» · ${esc(status)}</div>
 ${peer?`<div class="tb-code"><small>Код комнаты</small><b>${T.code}</b><div class="tb-qr">${qrSvg(url)}</div><div class="muted" style="font-size:12px;word-break:break-all">${esc(url)}</div></div>`:`<p class="muted" style="margin-top:10px">Игроки откроют «Книгу Игрока» и введут код — их листы будут обновляться в реальном времени. Интернет нужен обоим; данные идут напрямую между телефонами.</p>`}
 <div class="row" style="margin-top:10px">${peer?`<button class="btn dark grow" id="tbs">■ Закрыть стол</button><button class="btn" id="tbn">Новый код</button>`:`<button class="btn red grow" id="tbo" style="padding:16px">◎ Открыть стол</button>`}</div>
 ${pend.length?`<div class="sec-h">Запросы игроков</div>${pend.map(p=>`<div class="card"><div class="grow"><div class="t">${esc(p.who)} → ${esc(p.hero)}</div><div class="m">${PL[p.f]}: ${esc(desc(p))}</div></div><button class="btn sm red" data-ok="${p.id}">✓</button><button class="btn sm dark" data-no="${p.id}">✕</button></div>`).join('')}`:''}
 ${cs.length?`<div class="sec-h">За столом (${cs.length})</div>${cs.map(([id,k])=>{const P=permOf(k.pid);return `<div class="card tb-p"><div style="width:100%"><div class="t">${esc(k.name)}</div><label class="muted" style="font-size:13px">Герой: <select data-lk="${esc(k.pid)}" class="inp" style="min-height:36px;padding:4px">${['<option value="">— не выбран —</option>',...players.map(p=>`<option value="${p.id}"${T.link[k.pid]===p.id?' selected':''}>${esc(p.name)}</option>`)].join('')}</select></label>
  <div class="tb-perm">${Object.keys(PL).map(f=>`<button class="chip${P[f]!=='off'?' on':''}" data-pf="${esc(k.pid)}|${f}">${PL[f]}: ${P[f]==='direct'?'сам':P[f]==='approve'?'с одобрения':'нет'}</button>`).join('')}</div></div></div>`}).join('')}`:peer?'<p class="muted">Пока никого. Покажите игрокам QR-код.</p>':''}
 <div class="sec-h">Без интернета</div><p class="muted" style="font-size:13px">Код героя переносит лист в «Книгу Игрока» и обратно.</p><div class="row">${players.map(p=>`<button class="btn sm" data-cp="${p.id}">⧉ ${esc(p.name)}</button>`).join('')}</div>
 <textarea class="inp" id="tbi" placeholder="Вставьте код героя от игрока (KP1:…)" style="margin-top:8px;min-height:70px"></textarea><button class="btn" id="tbib" style="width:100%;margin-top:6px">Принять героя от игрока</button>`,r=>{
 const on=(s,f)=>{const e=$(s,r);if(e)e.onclick=f};on('#tbo',()=>{start();setTimeout(ui,900)});on('#tbs',()=>{stop();ui()});on('#tbn',()=>{T.code=Array.from({length:5},()=>ALPH[Math.floor(Math.random()*ALPH.length)]).join('');sv();start();setTimeout(ui,900)});
 r.querySelectorAll('[data-ok],[data-no]').forEach(b=>b.onclick=()=>{const id=b.dataset.ok||b.dataset.no;const p=pend.find(x=>x.id===id);pend=pend.filter(x=>x!==p);if(p&&b.dataset.ok){const h=heroOf(p.pid);if(h){apply(h,p.f,p.v);save();rRefresh()}}push(true);ui()});
 r.querySelectorAll('[data-lk]').forEach(s=>s.onchange=()=>{T.link[s.dataset.lk]=s.value;sv();push(true)});
 r.querySelectorAll('[data-pf]').forEach(b=>b.onclick=()=>{const [pid,f]=b.dataset.pf.split('|');const P=permOf(pid);P[f]=P[f]==='direct'?'approve':P[f]==='approve'?'off':'direct';T.perm[pid]=P;sv();push(true);ui()});
 r.querySelectorAll('[data-cp]').forEach(b=>b.onclick=()=>{const c=code(players.find(p=>p.id===b.dataset.cp));(navigator.clipboard?navigator.clipboard.writeText(c):Promise.reject()).then(()=>toast('Код героя скопирован'),()=>{$('#tbi',r).value=c;toast('Код в поле ниже')})});
 on('#tbib',()=>{try{const h=JSON.parse(decodeURIComponent(escape(atob($('#tbi',r).value.trim().replace(/^KP1:/,'')))));const ex=players.find(p=>p.id===h.id)||players.find(p=>p.name===h.name);const keep=['name','lvl','hp','maxhp','thp','ac','spd','st','inv','coins','spells','slots','ds','insp','conds'];if(ex){keep.forEach(f=>{if(h[f]!=null)ex[f]=h[f]});if(h.notes)ex.pnotes=h.notes}else{const n={...h,id:h.id||uid(),pnotes:h.notes||'',notes:''};players.push(n)}save();rRefresh();toast('Герой принят');closeSheet()}catch(e){toast('Неверный код')}})})}
function desc(p){const v=p.v;if(p.f==='hp')return `хиты ${v.hp}${v.thp?' +'+v.thp:''}`;if(p.f==='inv')return `предметов ${v.inv?.length||0}, ${Object.entries(v.coins||{}).filter(x=>x[1]).map(x=>x[1]+' '+x[0]).join(' ')}`;if(p.f==='conds')return (v||[]).join(', ')||'нет';if(p.f==='slots')return Object.entries(v||{}).map(([l,s])=>`${l}:${s.max-s.used}/${s.max}`).join(' ');return String(v).slice(0,80)}
/* кнопка «Стол» в разделе Героев и бейдж */
const fab=document.createElement('button');fab.id='tbfab';fab.setAttribute('aria-label','Стол игроков');fab.onclick=ui;document.body.append(fab);
function upd(){const n=Object.keys(conns).length;fab.className=peer?(status==='открыт'?'on':'wait'):'';fab.innerHTML=`◎${n?`<b>${n}</b>`:''}${pend.length?'<i></i>':''}`;fab.style.display=(S.sec===6||S.sec===4||peer)?'':'none'}
const og=KM.go;KM.go=function(i){const r=og.apply(this,arguments);setTimeout(upd,50);return r};setInterval(upd,2000);upd();
KM.table={ui,start,stop,push,get conns(){return conns},get pend(){return pend},T};
if(T.on)setTimeout(start,800);
}
