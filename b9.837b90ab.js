'use strict';/*bundle*/
/* table.js */
'use strict';{
/* «Стол»: живая связь Книги Мастера с Книгами Игроков (WebRTC через PeerJS, Мастер — хост) */
const PREFIX='kniga-mastera-v1-';const PURL='https://akriv777-png.github.io/kniga-mastera/player/';
const ALPH='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const T=Object.assign({code:'',on:false,perm:{},link:{},lock:{},audit:[]},LS.get('table',{}));T.lock=T.lock||{};T.audit=T.audit||[];const sv=()=>LS.set('table',T);
if(!T.code){T.code=Array.from({length:5},()=>ALPH[Math.floor(Math.random()*ALPH.length)]).join('');sv()}
const DEF={notes:'direct',slots:'direct',conds:'direct',hp:'direct',inv:'approve',lvl:'approve',trade:'approve',rest:'off',uses:'off'};const PROT=['inv','lvl','trade','rest','uses'];/* защищённые: никогда не «сам» */
const PL={notes:'Записи',slots:'Ячейки',conds:'Состояния',hp:'Текущие хиты',inv:'Сумка и монеты',lvl:'Уровень, опыт, характеристики',trade:'Обмен',rest:'Отдых',uses:'Заряды и умения'};
function audit(who,hero,f,what,res){T.audit.unshift({t:Date.now(),who,hero,f,what:String(what).slice(0,140),res});T.audit.length=Math.min(T.audit.length,200);sv()}
let peer=null,conns={},pend=[],status='выкл',retry=0,last={};
const permOf=pid=>{const P=Object.assign({},DEF,T.perm[pid]||{});PROT.forEach(f=>{if(P[f]==='direct')P[f]='approve'});if(T.strict)['hp','conds','slots','rest','uses','notes'].forEach(f=>{if(P[f]==='direct')P[f]='approve'});if(T.lock[pid])Object.keys(P).forEach(f=>P[f]=f==='notes'?P[f]:'off');return P};
const heroOf=pid=>players.find(p=>p.id===T.link[pid]);
addEventListener('offline',()=>{try{upd()}catch(e){}});addEventListener('online',()=>{try{if(T.on)start()}catch(e){}});
function start(){if(!window.Peer)return toast('Модуль связи не загружен');stop(true);status='подключение…';peer=new Peer(PREFIX+T.code,{debug:0,config:{iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302','stun:stun.cloudflare.com:3478']},{urls:['turn:openrelay.metered.ca:80','turn:openrelay.metered.ca:443','turn:openrelay.metered.ca:443?transport=tcp'],username:'openrelayproject',credential:'openrelayproject'}]}});startRelay();
 peer.on('open',()=>{status='открыт';retry=0;T.on=true;sv();upd()});
 peer.on('connection',c=>{c.on('open',()=>{conns[c.peer]={c,name:'?',pid:null};upd()});c.on('data',d=>onData(c,d));c.on('close',()=>{delete conns[c.peer];upd()});c.on('error',()=>{})});
 peer.on('disconnected',()=>{status='переподключение…';upd();setTimeout(()=>{try{peer&&!peer.destroyed&&peer.reconnect()}catch(e){}},1500)});
 peer.on('error',e=>{status=e.type==='unavailable-id'?'код занят — повтор…':'ошибка: '+e.type;upd();if(['unavailable-id','network','server-error','socket-error','socket-closed'].includes(e.type)){clearTimeout(start.t);start.t=setTimeout(()=>T.on&&start(),Math.min(15000,2000*(++retry)))}})}
let relay=null,rst='',seen={};
async function startRelay(){if(relay)return;try{relay=await KMRelay.open(T.code,'dm','dm',onRelay,(t,ok)=>{rst=t;upd()})}catch(e){rst='ретранслятор: ошибка';upd()}}
function onRelay(pid,m){pid=String(pid).slice(0,40);const id='mq:'+pid;seen[id]=Date.now();
 if(m.t==='bye'){delete conns[id];upd();return}if(m.t==='ping'){if(conns[id])relay.send(pid,{t:'pong'});else relay.send(pid,{t:'who'});return}
 if(!conns[id]){if(m.t!=='hello')return relay.send(pid,{t:'who'});const c={peer:id,send:x=>relay&&relay.send(pid,x),close(){}};conns[id]={c,name:'?',pid:null,relay:1}}
 if(m.t==='hello')Object.keys(conns).forEach(k=>{if(k!==id&&conns[k].pid===String(m.pid||'').slice(0,40)){try{conns[k].c.close()}catch(e){}delete conns[k]}});
 onData(conns[id].c,m)}
setInterval(()=>{const now=Date.now();let ch=0;Object.keys(conns).forEach(k=>{if(k.startsWith('mq:')&&now-(seen[k]||0)>75000){delete conns[k];ch=1}});if(ch)upd()},15000);
function stop(keep){if(!keep)Object.values(conns).forEach(k=>{try{k.c.send({t:'closed'})}catch(e){}});const r0=relay,p0=peer;relay=null;rst='';peer=null;setTimeout(()=>{try{r0&&r0.end()}catch(e){}try{p0&&p0.destroy()}catch(e){}},keep?0:900);conns={};if(!keep){T.on=false;sv();status='выкл'}upd()}
function onData(c,d){const k=conns[c.peer];if(!k||!d||typeof d!=='object')return;if(d.t==='ping'){try{c.send({t:'pong'})}catch(e){}return}
 if(d.t==='hello'){k.name=String(d.name||'Игрок').slice(0,40);k.pid=String(d.pid||c.peer).slice(0,40);
  if(!T.link[k.pid]){const h=players.find(p=>p.id===d.hero?.id)||players.find(p=>p.name===d.hero?.name);if(h){T.link[k.pid]=h.id;sv()}}
  last[c.peer]='';upd();toast('За стол сел: '+k.name);push(true)}
 if(d.t==='buy'&&k.pid){const h=heroOf(k.pid);if(h&&KM.shops){const v=KM.shops.onBuy(k,h,d);if(v){pend.push({id:uid(),pid:k.pid,who:(k.name==='Новый герой'?'Игрок':k.name),hero:h.name,f:'buy',v,warn:v.warn});audit(k.name,h.name,'buy',`купить «${v.real}» за ${v.pf}`,'ждёт одобрения');toast(`${k.name}: хочет купить «${v.n}»`);try{rRefresh()}catch(e){}try{upd()}catch(e){}}}return}
 if(d.t==='build'&&k.pid&&d.hero&&typeof d.hero==='object'){const h=heroOf(k.pid);const v=Object.assign({},d.hero,{kind:d.kind==='lvl'?'lvl':'new'});pend=pend.filter(x=>!(x.pid===k.pid&&x.f==='build'));const p={id:uid(),pid:k.pid,who:(k.name==='Новый герой'?'Игрок':k.name),hero:h?h.name:v.name,f:'build',v,warn:d.kind==='lvl'&&h&&v.lvl!==(h.lvl||1)+1?'уровень прыгает больше чем на 1':''};pend.push(p);audit(k.name,p.hero,'build',desc(p),'ждёт одобрения');toast(`${k.name}: ${v.kind==='lvl'?'просит повысить уровень':'прислал нового героя'} — «${v.name}»`);try{upd()}catch(e){}return}
 if(d.t==='trade'&&k.pid){const h=heroOf(k.pid);if(h)onTrade(k,h,d);return}
 if(d.t==='edit'&&k.pid){const h=heroOf(k.pid);if(!h)return;const P=permOf(k.pid);const ch=d.ch||{};
  Object.keys(ch).forEach(f=>{if(!PL[f]||f==='trade')return;const mode=P[f];const ds=desc({f,v:ch[f],h});if(mode==='off'){audit(k.name,h.name,f,ds,'отклонено (нет прав)');return}if(mode==='direct'){apply(h,f,ch[f]);audit(k.name,h.name,f,ds,'применено')}else{pend=pend.filter(x=>!(x.pid===k.pid&&x.f===f));pend.push({id:uid(),pid:k.pid,who:(k.name==='Новый герой'?'Игрок':k.name),hero:h.name,f,v:ch[f],warn:warn(h,f,ch[f])});audit(k.name,h.name,f,ds,'ждёт одобрения');toast(`${k.name}: запрос — ${PL[f]}`)}});
  save();rRefresh();push(true);upd()}}
function warn(h,f,v){try{if(f==='inv'){const W=[];const have=new Set((h.inv||[]).map(x=>x.n));(v.inv||[]).forEach(x=>{if(!have.has(x.n))W.push('новый предмет «'+x.n+'»');else{const o=h.inv.find(y=>y.n===x.n);if((x.q||1)>(o.q||1))W.push('больше «'+x.n+'»')}});const ZM={мм:.01,см:.1,эм:.5,зм:1,пм:10};const sum=c=>Object.entries(c||{}).reduce((a,[k,n])=>a+(ZM[k]||0)*n,0);const d=sum(v.coins)-sum(h.coins);if(d>0.001)W.push('монет больше на '+(Math.round(d*100)/100).toLocaleString('ru-RU')+' зм');return W.join('; ')}if(f==='lvl'){const W=[];if(v.lvl>h.lvl)W.push('уровень '+h.lvl+'→'+v.lvl);if((v.maxhp||0)>(h.maxhp||0))W.push('макс. хиты '+h.maxhp+'→'+v.maxhp);if((v.xp||0)>(h.xp||0))W.push('опыт +'+((v.xp||0)-(h.xp||0)));if(JSON.stringify(v.st)!==JSON.stringify(h.st))W.push('характеристики изменены');return W.join('; ')}if(f==='hp'&&v.hp>(h.maxhp||v.maxhp))return 'хиты выше максимума'}catch(e){}return ''}
function onTrade(k,h,d){const it=(h.inv||[]).find(x=>x.id===d.item);const to=players.find(p=>p.id===d.to);if(!it||!to)return;const P=permOf(k.pid);const ds=`«${it.n}» → ${to.name}`;if(P.trade==='off'){audit(k.name,h.name,'trade',ds,'отклонено (нет прав)');return}pend.push({id:uid(),pid:k.pid,who:(k.name==='Новый герой'?'Игрок':k.name),hero:h.name,f:'trade',v:{item:it.id,n:it.n,to:to.id,toN:to.name}});audit(k.name,h.name,'trade',ds,'ждёт одобрения');toast(`${k.name}: обмен — ${ds}`);upd()}
function apply(h,f,v){if(f==='rest'){KM.partyRest&&KM.partyRest([h.id],v==='l'?'l':'s',true);return}if(f==='uses'&&v&&typeof v==='object'){h.uses=h.uses||{};Object.keys(v).forEach(k=>{if(h.uses[k]&&typeof v[k]==='number')h.uses[k].used=Math.max(0,Math.min(h.uses[k].max,v[k]))});return}if(f==='build'&&v){['name','race','cls','bg','lvl','st','hp','maxhp','ac','spd','inv','coins','spells','slots','prof','svp','look','trait','xp'].forEach(k=>{if(v[k]!==undefined)h[k]=JSON.parse(JSON.stringify(v[k]))});h.gold=(h.coins||{}).зм||0;if(window.KM&&KM.uses&&KM.uses.sync)try{KM.uses.sync(h)}catch(e){}return}if(f==='buy'){KM.shops&&KM.shops.applyBuy(h,v);return}if(f==='trade'){const i=(h.inv||[]).findIndex(x=>x.id===v.item);const to=players.find(p=>p.id===v.to);if(i<0||!to)return;const [it]=h.inv.splice(i,1);to.inv=to.inv||[];to.inv.push(it);return}if(f==='lvl'&&v){['lvl','xp','maxhp','st','ac','spd','cls','race','name'].forEach(k=>{if(v[k]!==undefined)h[k]=v[k]});return}if(f==='notes')h.pnotes=String(v||'').slice(0,5000);if(f==='slots'&&v&&typeof v==='object')h.slots=v;if(f==='conds'&&Array.isArray(v))h.conds=v.map(String).slice(0,20);if(f==='inv'&&v){if(Array.isArray(v.inv)){const old=h.inv||[];h.inv=v.inv.slice(0,200).map(x=>{const o=old.find(y=>y.id===x.id);return o&&o.unid?Object.assign({},x,{n:o.n,item:o.item,unid:1}):x})}if(v.coins)h.coins=v.coins}if(f==='hp'&&v){h.hp=Math.max(0,Math.min(+v.maxhp||h.maxhp,+v.hp));h.thp=Math.max(0,+v.thp||0);if(v.ds)h.ds=v.ds}
 const c=combat.list.find(x=>x.pc&&(x.pid===h.id||x.name===h.name));if(c&&f==='hp'){c.hp=h.hp;c.thp=h.thp}if(c&&f==='conds')c.conds=h.conds.map(n=>({n,r:0}))}
function rRefresh(){try{if(page&&S.sec===6&&window.rPcs)rPcs();if(S.sec===4)rCombat()}catch(e){}}
/* --- что видит игрок --- */
function initView(){const k=combat;if(!k.list||!k.list.length)return null;return {round:k.round,turn:k.turn,log:(k.log||[]).slice(0,4).map(x=>String(x).replace(/\d+\/\d+/g,'')),list:k.list.map(c=>({n:c.name,pc:!!c.pc,init:c.delay?'⏸':c.init,st:c.pc?`${c.hp}/${c.max}`:c.dead?'повержен':c.hp<c.max/2?'тяжело ранен':c.hp<c.max?'ранен':'цел',conds:(c.conds||[]).map(x=>x.n||x).filter(n=>n!=='Подготовлено'),dead:!!c.dead}))}}
let mapCache={key:'',img:null};
function mapView(){try{let m=KM.mapCur?KM.mapCur():null;if(!m){const ms=LS.get('maps',[]);const id=LS.get('mapcur',ms[0]&&ms[0].id);m=ms.find(x=>x.id===id)}if(!m||!m.shared)return null;const cur=combat.list&&combat.list[combat.turn],tk=(m.tok||[]).filter(t=>!t.hid&&!(m.fog&&m.fog[t.y*m.W+t.x])).map(t=>{const c=t.cid&&combat.list.find(z=>z.id===t.cid);return{x:t.x,y:t.y,n:t.n||'',c:t.c||'#888',k:t.k||'',cur:!!(cur&&t.cid&&cur.id===t.cid),dead:!!(c?c.dead:t.dead),st:c?(c.pc?c.hp+'/'+c.max:c.dead?'повержен':c.hp<=c.max/4?'при смерти':c.hp<c.max/2?'тяжело ранен':c.hp<c.max?'ранен':'цел'):'',cd:c?(c.conds||[]).map(x=>x.n||x).filter(n=>n!=='Подготовлено').slice(0,3):[]}}),ping=m.ping&&Date.now()-m.ping.t<20000?m.ping:null;const H=a=>{let h=7;const s=typeof a==='string'?a:JSON.stringify(a||0);for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return h};const key=m.id+'|'+m.W+'x'+m.H+'|'+H((m.fog||[]).join(''))+'|'+H((m.g||[]).join(','))+'|'+H(m.dec)+'|'+[m.grid,m.gs,m.style,m.light,m.coord,m.th].join();if(key===mapCache.key)return Object.assign({},mapCache.img,{tok:tk,ping,aoe:m.aoe||null});
 const CS=Math.max(8,Math.min(24,Math.floor(1100/Math.max(m.W,m.H)))),cv=document.createElement('canvas');cv.width=m.W*CS;cv.height=m.H*CS;const g=cv.getContext('2d');const m2=Object.assign({},m,{tok:[],ping:null});drawMap(g,m2,CS,1);mapCache={key,img:{n:m.name,src:cv.toDataURL('image/jpeg',.72),W:m.W,H:m.H,CS}};cv.width=cv.height=0;return Object.assign({},mapCache.img,{tok:tk,ping,aoe:m.aoe||null})}catch(e){return null}}
function heroView(h){if(!h)return null;const o={};['id','name','cls','lvl','hp','maxhp','thp','ac','spd','st','inv','coins','spells','slots','ds','insp','xp','exh','uses'].forEach(f=>o[f]=h[f]);o.inv=(h.inv||[]).map(x=>{if(!x.unid)return x;const it=x.item&&DATA.items.find(i=>i.id===x.item);return{id:x.id,n:'Неопознанный предмет'+(it&&it.sub?' ('+String(it.sub).toLowerCase()+')':''),q:x.q,w:x.w,unid:1}});o.conds=(h.conds||[]).map(x=>x.n||x);o.notes=h.pnotes||'';o._v=h._v||(h._v=1);o._sig=sig(o);if(KM.uses&&h.uses){o.usesA={};Object.entries(h.uses).forEach(([k,u])=>o.usesA[k]=KM.uses.again(u))}return o}
const decs={};const PLN=p=>p.f==='buy'?'Покупка':p.f==='build'?'Лист героя':p.f==='trade'?'Обмен':(PL[p.f]||p.f);
function push(force){if(!peer)return;const camp=LS.get('camp',{});const ho=(camp.h||[]).filter(x=>x.sh).map(x=>{const sig=x.n+'|'+(x.t||'')+'|'+(x.img||'').length;let hh=0;for(let i=0;i<sig.length;i++)hh=(hh*31+sig.charCodeAt(i))|0;return{n:x.n,t:x.t,img:x.img,rev:(hh>>>0).toString(36)}});const iv=initView(),mv=mapView();
 Object.entries(conns).forEach(([id,k])=>{if(!k.pid)return;const msg={t:'state',pend:pend.filter(p=>p.pid===k.pid).map(p=>({f:p.f,d:desc(p)})),dec:(decs[k.pid]||[]).filter(x=>Date.now()-x.t<6e5),hero:heroView(heroOf(k.pid)),perm:permOf(k.pid),lock:!!T.lock[k.pid],party:players.filter(p=>p.id!==T.link[k.pid]).map(p=>({id:p.id,n:p.name})),init:iv,handouts:ho,rest:(()=>{const e=LS.get('restEv',null);return e&&e.ids&&e.ids.includes(T.link[k.pid])?{n:e.n,k:e.k,t:e.t,L:e.L}:null})(),strict:!!T.strict,map:mv,shows:LS.get('shows',[]).filter(x=>!x.hid).slice(0,15),showDel:[...LS.get('showDel',[]),...LS.get('shows',[]).filter(x=>x.hid).map(x=>x.id)].slice(-150),shop:KM.shops?KM.shops.view():null,dm:'Мастер'};const s=JSON.stringify(msg);if(!force&&s===last[id])return;last[id]=s;try{k.c.send(msg)}catch(e){}})}
setInterval(()=>push(false),1200);
const wake=()=>{if(!document.hidden&&T.on&&(!peer||peer.destroyed||peer.disconnected))start();else if(T.on&&peer){try{push(true)}catch(e){}}};document.addEventListener('visibilitychange',wake);addEventListener('pageshow',wake);addEventListener('online',()=>setTimeout(wake,500));addEventListener('focus',wake);setInterval(()=>{if(T.on&&(!peer||peer.destroyed||peer.disconnected))start()},12000);
/* --- интерфейс Мастера --- */
function qrSvg(t){try{const q=qrcode(0,'M');q.addData(t);q.make();return q.createSvgTag({cellSize:5,margin:2,scalable:true})}catch(e){return ''}}
function code(h){return 'KP1:'+btoa(unescape(encodeURIComponent(JSON.stringify(heroView(h)))))}
if(!T.sec){T.sec=Array.from(crypto.getRandomValues(new Uint32Array(4))).map(x=>x.toString(36)).join('');sv()}
const MECH=['id','name','cls','lvl','xp','maxhp','ac','spd','st','inv','coins','spells'];
function sig(o){const str=T.sec+'|'+JSON.stringify(MECH.map(k=>o[k]===undefined?null:o[k]));let h1=0xdeadbeef,h2=0x41c6ce57;for(let i=0;i<str.length;i++){const c=str.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677)}h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return (h2>>>0).toString(36)+(h1>>>0).toString(36)}
function pc(p){return `<div class="card tb-req" data-rq="${p.id}"><div class="grow"><div class="t">${p.who&&!/^Новый герой$|^Игрок$/.test(p.who)&&p.who!==p.hero?esc(p.who)+' → ':''}${esc(p.hero)}</div><div class="m">${p.f==='buy'?'Покупка в лавке':p.f==='build'?'🧙 Лист героя':PL[p.f]||p.f}: ${esc(desc(p))}</div>${p.warn?`<div class="tb-warn">⚠ ${esc(p.warn)}</div>`:''}</div><button class="btn sm red" data-ok="${p.id}" aria-label="Одобрить">✓</button><button class="btn sm dark" data-no="${p.id}" aria-label="Отклонить">✕</button></div>`}
function ui(){const url=PURL+'?room='+T.code;const cs=Object.entries(conns);const P=document.getElementById('tbpanel');const openSheet=(h,a)=>{if(P&&P.isConnected&&S.sec===6&&!ui.sheet){P.innerHTML=h;a&&a(P)}else{ui.sheet=0;window.openSheet?window.openSheet(h,a):KM.openSheet(h,a)}};
 openSheet(`<div class="sb-title">Стол игроков</div><div class="sb-sub">Живая связь с «Книгой Игрока»</div>${peer?`<div class="tb-st">◉ Прямая связь: ${esc(status)}<br>${rst?(rst.includes('подключён')?'◉ ':'◌ ')+esc(rst):'◌ ретранслятор: запуск…'}<br><small class="muted">Если прямое соединение не проходит (мобильный интернет, NAT), игроки автоматически подключатся через зашифрованный ретранслятор.</small></div>`:''}
 ${peer?`<div class="tb-code"><small>Код комнаты</small><b>${T.code}</b><button class="btn sm" id="tbqrt" style="margin:6px 0">${LS.get('qrHide',false)?'▸ Показать QR-код':'▾ Скрыть QR-код'}</button><div class="tb-qr"${LS.get('qrHide',false)?' style="display:none"':''}>${qrSvg(url)}</div><div class="muted" style="font-size:12px;word-break:break-all">${esc(url)}</div></div>`:`<p class="muted" style="margin-top:10px">Игроки откроют «Книгу Игрока» и введут код — их листы будут обновляться в реальном времени. Интернет нужен обоим; данные идут напрямую между телефонами, а при сбое — через зашифрованный ретранслятор.</p>`}
 ${peer?`<div class="card"><b>📣 Объявление игрокам</b><textarea class="inp" id="tbann" placeholder="Например: «Вы слышите вой с севера…»" style="min-height:54px;margin-top:6px"></textarea><button class="btn ac" id="tbannb" style="width:100%;margin-top:6px">Показать на вкладке «Мастер»</button></div>`:''}<div class="row" style="margin-top:10px">${peer?`<button class="btn dark grow" id="tbs">■ Закрыть стол</button><button class="btn" id="tbn">Новый код</button>`:`<button class="btn red grow" id="tbo" style="padding:16px">◎ Открыть стол</button>`}</div>
 ${LS.get('shows',[]).length?`<div class="sec-h">Показано игрокам${peer?'':' <small class="m">(увидят после открытия стола)</small>'} <button class="btn sm" id="tbclr" style="float:right">🧹 Удалить всё</button></div>${LS.get('shows',[]).slice(0,12).map((x,i)=>`<div class="it"><div class="grow"><div class="t">${x.i||'📣'} ${esc(x.n)}</div>${x.t?`<div class="m" style="font-size:12px;opacity:.8;white-space:pre-line">${esc(x.t.slice(0,140))}${x.t.length>140?'…':''}</div>`:''}</div><button class="btn sm" data-shh="${i}">${x.hid?'Вернуть':'Скрыть'}</button><button class="btn sm" data-shx="${i}" aria-label="Удалить">✕</button></div>`).join('')}`:''}
 ${pend.length?`<div class="sec-h">Запросы игроков (${pend.length})</div><div class="row" style="margin-bottom:6px"><button class="btn sm" id="tbokall">✓ Одобрить всё без ⚠</button></div>${pend.filter(p=>!cs.some(([,k])=>k.pid===p.pid)).map(pc).join('')}`:''}
 ${cs.length?`<div class="sec-h">За столом (${cs.length})</div>${cs.map(([id,k])=>{const P=permOf(k.pid);return `<div class="card tb-p"><div style="width:100%"><div class="row"><div class="t grow">${heroOf(k.pid)?esc(heroOf(k.pid).name)+' <small class="muted">· '+esc(k.name===heroOf(k.pid).name||k.name==='Новый герой'?'игрок':k.name)+'</small>':esc(k.name==='Новый герой'?'Игрок (герой не выбран)':k.name)}</div><button class="btn sm${T.lock[k.pid]?' red':''}" data-lock="${esc(k.pid)}">${T.lock[k.pid]?'🔒 Лист заблокирован':'🔓 Заблокировать лист'}</button></div><div class="row" style="gap:6px;margin:6px 0"><button class="btn sm" data-rs="${esc(id)}">↻ Синхронизировать</button><button class="btn sm" data-kick="${esc(id)}">⏏ Отключить</button></div><label class="muted" style="font-size:13px">Герой: <select data-lk="${esc(k.pid)}" class="inp" style="min-height:36px;padding:4px">${['<option value="">— не выбран —</option>',...players.map(p=>`<option value="${p.id}"${T.link[k.pid]===p.id?' selected':''}>${esc(p.name)}</option>`)].join('')}</select></label>${(()=>{const q=pend.filter(p=>p.pid===k.pid);return q.length?`<div class="tb-preq"><div class="muted" style="font-size:13px;margin:6px 0 2px">⏳ Запросы (${q.length}):</div>${q.map(pc).join('')}</div>`:''})()}
  <div class="tb-perm">${Object.keys(PL).map(f=>`<button class="chip${P[f]!=='off'?' on':''}" data-pf="${esc(k.pid)}|${f}">${PL[f]}: ${P[f]==='direct'?'сам':P[f]==='approve'?'с одобрения':'нет'}</button>`).join('')}</div></div></div>`}).join('')}`:peer?'<p class="muted">Пока никого. Покажите игрокам QR-код.</p>':''}
 <div class="row" style="margin-top:8px;gap:8px"><button class="btn grow${T.strict?' red':''}" id="tbstrict" aria-pressed="${!!T.strict}">${T.strict?'🔒 Строгий режим: все изменения игроков (хиты, состояния, ячейки, отдых, записи) — через Мастера':'🔓 Свободный режим: игроки меняют хиты и состояния сами'}</button><button class="btn" id="tbrest">⛺ Отдых</button></div>
 ${peer?`<div class="row" style="margin-top:8px"><button class="btn grow" id="tbsync">⟳ Принудительно синхронизировать</button></div>`:''}
 <details class="tb-audit"><summary>Журнал действий игроков (${T.audit.length})</summary>${T.audit.slice(0,60).map(a=>`<div class="tb-a"><small>${new Date(a.t).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}</small> <b>${esc(a.who)}</b> → ${esc(a.hero)} · ${PL[a.f]||a.f}: ${esc(a.what)} <i class="${/примен|одобр/.test(a.res)?'ok':/отклон/.test(a.res)?'no':''}">${esc(a.res)}</i></div>`).join('')||'<p class="muted">Пусто.</p>'}</details>
 <div class="sec-h">Без интернета</div><p class="muted" style="font-size:13px">Код героя переносит лист в «Книгу Игрока» и обратно.</p><div class="row">${players.map(p=>`<button class="btn sm" data-cp="${p.id}">⧉ ${esc(p.name)}</button>`).join('')}</div>
 <textarea class="inp" id="tbi" placeholder="Вставьте код героя от игрока (KP1:…)" style="margin-top:8px;min-height:70px"></textarea><button class="btn" id="tbib" style="width:100%;margin-top:6px">Принять героя от игрока</button>`,r=>{
 const on=(s,f)=>{const e=$(s,r);if(e)e.onclick=f};on('#tbclr',()=>{const a=LS.get('shows',[]);if(!a.length)return;const d0=LS.get('showDel',[]);LS.set('showDel',[...d0,...a.map(x=>x.id)].slice(-150));LS.set('shows',[]);push(true);ui();KM.undoToast&&KM.undoToast('Показанное удалено ('+a.length+')',()=>{LS.set('shows',a);LS.set('showDel',d0);push(true);ui()})});r.querySelectorAll('[data-shx]').forEach(b=>b.onclick=()=>{const a=LS.get('shows',[]),i=+b.dataset.shx,x=a[i];if(!x)return;a.splice(i,1);LS.set('shows',a);const d0=LS.get('showDel',[]);LS.set('showDel',[...d0,x.id].slice(-150));push(true);ui();KM.undoToast&&KM.undoToast('Удалено: '+x.n,()=>{const b2=LS.get('shows',[]);b2.splice(i,0,x);LS.set('shows',b2);LS.set('showDel',LS.get('showDel',[]).filter(z=>z!==x.id));push(true);ui()})});r.querySelectorAll('[data-rs]').forEach(b=>b.onclick=()=>{last[b.dataset.rs]='';push(true);toast('Отправлено заново')});r.querySelectorAll('[data-kick]').forEach(b=>b.onclick=()=>{const k=conns[b.dataset.kick];if(!k||!confirm('Отключить игрока от стола?'))return;try{k.c.send({t:'closed'})}catch(e){}delete conns[b.dataset.kick];upd();ui()});on('#tbannb',()=>{const v=$('#tbann',r).value.trim();if(!v)return toast('Напишите текст');KM.showPlayers({i:'📣',n:v.split('\n')[0].slice(0,60),t:v});ui()});r.querySelectorAll('[data-shh]').forEach(b=>b.onclick=()=>{const a=LS.get('shows',[]),x=a[+b.dataset.shh];x.hid=!x.hid;LS.set('shows',a);push(true);ui()});on('#tbo',()=>{start();setTimeout(ui,900)});on('#tbs',()=>{stop();ui()});on('#tbn',()=>{T.code=Array.from({length:5},()=>ALPH[Math.floor(Math.random()*ALPH.length)]).join('');sv();start();setTimeout(ui,900)});
 r.querySelectorAll('[data-shx]').forEach(b=>{const w=b.parentElement;if(!w||w._sw)return;w._sw=1;let x0=0,y0=0,t=0,dx=0;w.addEventListener('touchstart',e=>{if(e.touches.length>1){clearTimeout(t);return}x0=e.touches[0].clientX;y0=e.touches[0].clientY;dx=0;t=setTimeout(()=>{navigator.vibrate&&navigator.vibrate(20);b.click()},650)},{passive:true});w.addEventListener('touchmove',e=>{const p=e.touches[0];dx=p.clientX-x0;if(Math.abs(dx)>8||Math.abs(p.clientY-y0)>8)clearTimeout(t);if(dx<0&&Math.abs(dx)>Math.abs(p.clientY-y0))w.style.transform='translateX('+Math.max(dx,-120)+'px)'},{passive:true});w.addEventListener('touchend',()=>{clearTimeout(t);w.style.transform='';if(dx<-80)b.click()});w.title='Смахните влево или удерживайте, чтобы удалить'});
 r.querySelectorAll('[data-ok],[data-no]').forEach(b=>b.onclick=()=>{const id=b.dataset.ok||b.dataset.no;const p=pend.find(x=>x.id===id);pend=pend.filter(x=>x!==p);if(p){audit('Мастер',p.hero,p.f,desc(p),b.dataset.ok?'одобрено':'отклонено Мастером');if(!b.dataset.ok){(decs[p.pid]=decs[p.pid]||[]).push({id:uid(),t:Date.now(),d:PLN(p)+' — '+desc(p)});decs[p.pid]=decs[p.pid].slice(-10)}if(b.dataset.ok){let h=heroOf(p.pid);if(!h&&p.f==='build'&&p.v){h=Object.assign({},p.v,{id:uid(),pnotes:'',notes:''});players.push(h);T.link[p.pid]=h.id;sv()}if(h&&p.f==='build'&&p.v&&!p.v._applied){}if(h){apply(h,p.f,p.v);save();rRefresh()}}}push(true);upd();ui()});
 {const hs=[...r.querySelectorAll('.sec-h')].find(h=>/Запросы/.test(h.textContent));if(hs){const sub=r.querySelector('.sb-sub');const grp=[hs];let n=hs.nextElementSibling;while(n&&!n.classList.contains('sec-h')){grp.push(n);n=n.nextElementSibling}let at=sub;grp.forEach(e=>{at.after(e);at=e});}}
 {const qb=r.querySelector('#tbqrt'),qe=r.querySelector('.tb-qr');if(qb&&qe)qb.onclick=e=>{e.preventDefault();const sc=qb.closest('.sheet,.sb,[class*=sheet]')||document.scrollingElement,y=sc.scrollTop,h=!LS.get('qrHide',false);LS.set('qrHide',h);qe.style.display=h?'none':'';qb.textContent=h?'▸ Показать QR-код':'▾ Скрыть QR-код';sc.scrollTop=y}}
 const oa=r.querySelector('#tbokall');if(oa)oa.onclick=()=>{pend.filter(p=>!p.warn).forEach(p=>{let h=heroOf(p.pid);if(!h&&p.f==='build'&&p.v){h=Object.assign({},p.v,{id:uid(),pnotes:'',notes:''});players.push(h);T.link[p.pid]=h.id;sv()}if(h&&p.f==='build'&&p.v&&!p.v._applied){}if(h){apply(h,p.f,p.v);audit('Мастер',p.hero,p.f,desc(p),'одобрено')}});pend=pend.filter(p=>p.warn);save();rRefresh();push(true);upd();ui()};
 r.querySelectorAll('[data-lock]').forEach(b=>b.onclick=()=>{const pid=b.dataset.lock;T.lock[pid]=!T.lock[pid];audit('Мастер','—','lock',T.lock[pid]?'лист заблокирован':'лист разблокирован','');sv();push(true);ui()});
 const st=r.querySelector('#tbstrict');if(st)st.onclick=()=>{T.strict=!T.strict;sv();push(true);ui();toast(T.strict?'Строгий режим: изменения игроков ждут одобрения':'Свободный режим')};const tr=r.querySelector('#tbrest');if(tr)tr.onclick=()=>KM.partyRestUI();
 const fs=r.querySelector('#tbsync');if(fs)fs.onclick=()=>{last={};push(true);toast('Состояние отправлено всем игрокам')};
 r.querySelectorAll('[data-lk]').forEach(s=>s.onchange=()=>{T.link[s.dataset.lk]=s.value;sv();push(true);ui()});
 r.querySelectorAll('[data-pf]').forEach(b=>b.onclick=()=>{const [pid,f]=b.dataset.pf.split('|');const P=Object.assign({},DEF,T.perm[pid]||{});P[f]=PROT.includes(f)?(P[f]==='off'?'approve':'off'):(P[f]==='direct'?'approve':P[f]==='approve'?'off':'direct');T.perm[pid]=P;sv();push(true);ui()});
 r.querySelectorAll('[data-cp]').forEach(b=>b.onclick=()=>{const c=code(players.find(p=>p.id===b.dataset.cp));(navigator.clipboard?navigator.clipboard.writeText(c):Promise.reject()).then(()=>toast('Код героя скопирован'),()=>{$('#tbi',r).value=c;toast('Код в поле ниже')})});
 on('#tbib',()=>{try{const h=JSON.parse(decodeURIComponent(escape(atob($('#tbi',r).value.trim().replace(/^KP1:/,'')))));if(!h._sig||h._sig!==sig(h)){if(!confirm(h._sig?'⚠ Код героя изменён вне Книги Мастера (подпись не совпадает): характеристики, предметы или монеты могли быть подправлены. Принять всё равно?':'⚠ Код без подписи Мастера (создан игроком). Принять героя?'))return}const ex=players.find(p=>p.id===h.id)||players.find(p=>p.name===h.name);const keep=['name','lvl','hp','maxhp','thp','ac','spd','st','inv','coins','spells','slots','ds','insp','conds'];if(ex){keep.forEach(f=>{if(h[f]!=null)ex[f]=h[f]});if(h.notes)ex.pnotes=h.notes}else{const n={...h,id:h.id||uid(),pnotes:h.notes||'',notes:''};players.push(n)}save();rRefresh();toast('Герой принят');closeSheet()}catch(e){toast('Неверный код')}})})}
function desc(p){const v=p.v;if(p.f==='rest')return v==='l'?'долгий отдых':'короткий отдых';if(p.f==='uses')return 'израсходовать заряды: '+Object.keys(v||{}).length;if(p.f==='build')return `${v.kind==='lvl'?'повышение уровня':'новый лист героя'}: ${v.name}, ${v.race||''} ${v.cls||''} ${v.lvl||1} ур., хиты ${v.maxhp}, КД ${v.ac}, хар. ${(v.st||[]).join('/')}`;if(p.f==='buy')return `купить «${v.real}»${v.q>1?' ×'+v.q:''} за ${v.pf} — «${v.sn}»`;if(p.f==='trade')return `передать «${v.n}» → ${v.toN}`;if(p.f==='lvl')return `ур. ${v.lvl}, опыт ${v.xp||0}, макс. хиты ${v.maxhp}, хар. ${(v.st||[]).join('/')}`;if(p.f==='hp')return `хиты ${v.hp}${v.thp?' +'+v.thp:''}`;if(p.f==='inv')return `предметов ${v.inv?.length||0}, ${Object.entries(v.coins||{}).filter(x=>x[1]).map(x=>x[1]+' '+x[0]).join(' ')}`;if(p.f==='conds')return (v||[]).join(', ')||'нет';if(p.f==='slots')return Object.entries(v||{}).map(([l,s])=>`${l}:${s.max-s.used}/${s.max}`).join(' ');return String(v).slice(0,80)}
/* кнопка «Стол» в разделе Героев и бейдж */
const fab=document.createElement('button');fab.id='tbfab';fab.setAttribute('aria-label','Стол игроков');fab.onclick=()=>{ui.sheet=1;ui()};document.body.append(fab);
function upd(){if(navigator.onLine===false&&T.on)status='Нет интернета — подключусь сам';const n=Object.keys(conns).length;const uk=n+':'+pend.length+':'+status+':'+rst;if(uk!==upd.k&&!upd.busy&&S.sec===6&&document.getElementById('tbpanel')&&!document.activeElement?.closest?.('#tbpanel')){upd.busy=1;clearTimeout(upd.t);upd.t=setTimeout(()=>{upd.k=uk;try{ui()}finally{upd.busy=0}},150)}try{const rb=null;if(rb){rb.style.position='relative';let bg=rb.querySelector('.tb-bdg');if(pend.length){if(!bg){bg=document.createElement('i');bg.className='tb-bdg';bg.style.cssText='position:absolute;top:2px;right:10%;min-width:16px;height:16px;border-radius:8px;background:#c22;color:#fff;font:700 10px/16px sans-serif;text-align:center;font-style:normal;box-shadow:0 0 6px #f33';rb.append(bg)}bg.textContent=pend.length}else bg&&bg.remove()}}catch(e){}fab.className=peer?(status==='открыт'?'on':'wait'):'';fab.innerHTML=`◎${n?`<b>${n}</b>`:''}${pend.length?`<i>${pend.length}</i>`:''}`;fab.style.display=(S.sec===6||S.sec===4||peer)?'':'none'}
const og=KM.go;KM.go=function(i){const r=og.apply(this,arguments);setTimeout(upd,50);return r};setInterval(upd,2000);upd();
function panel(){return;const pg=document.getElementById('page');if(!pg||document.getElementById('tbpanel'))return;const d=document.createElement('div');d.id='tbpanel';d.className='card tb-panel';const h=pg.querySelector('.hdr,header,.head')||pg.firstElementChild;h?h.after(d):pg.prepend(d);ui()}
KM.table={ui,panel,start,stop,push,get conns(){return conns},get pend(){return pend},T};
if(T.on)setTimeout(start,800);
}

/* показать игрокам: вкладка «Мастер» у игрока */
KM.showPlayers=o=>{const a=LS.get('shows',[]);a.unshift(Object.assign({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),ts:Date.now()},o));LS.set('shows',a.slice(0,30));try{KM.table.push(true)}catch(e){}toast(KM.table&&KM.table.T&&KM.table.T.on?'Показано игрокам ✓':'Стол закрыт — покажется, когда игроки подключатся')};
;(()=>{const sh=document.getElementById('sheet');if(!sh)return;const mo=new MutationObserver(()=>{if(!sh.classList.contains('open'))return;const pg=document.getElementById('sheetPage');if(!pg||pg.querySelector('.km-show')||pg.querySelector('#tbann'))return;if(pg.querySelector('#ishow,[data-noshow]'))return;if(pg.querySelectorAll('.list .card,button.card').length>=3&&!pg.querySelector('.sp-grid,.desc'))return;const h0=pg.querySelector('.sb-title,h2,h3');if(!h0)return;if(pg.querySelector('input:not([type=checkbox]):not([type=range]),textarea,select')&&!pg.querySelector('.desc,.hx-p'))return;const b=document.createElement('button');b.className='btn sm km-show';b.textContent='📣 Показать игрокам';b.style.cssText='margin:6px 0 8px;display:inline-flex';b.onclick=()=>{const ds=[...pg.querySelectorAll('[data-show-title]')].pop();if(ds){KM.showPlayers({i:'👁',n:ds.dataset.showTitle.slice(0,80),t:(ds.dataset.showText||'').slice(0,1500)});return}const h=pg.querySelector('.sb-title,h2,h3')||h0;const txt=n=>{const c=n.cloneNode(true);c.querySelectorAll('button,input,textarea,select,.km-show,script,style,[data-dm],details,img,svg,canvas,.sb-title,h2,h3,.chips,[data-chips]').forEach(x=>x.remove());c.querySelectorAll('div,p,li,tr,br,section').forEach(x=>x.after('\n'));c.querySelectorAll('span,b,i,small,td,th,dt,dd,em,strong').forEach(x=>x.after(' '));return c.textContent.replace(/[ \t]+/g,' ').replace(/ *\n */g,'\n').replace(/\n{3,}/g,'\n\n').trim()};const t=txt(pg);const im=pg.querySelector('img:not(.sp-plate):not([aria-hidden])[src^="data:"],img:not(.sp-plate):not([aria-hidden])[src^="http"]');KM.showPlayers({i:'👁',n:h.textContent.replace('📣 Показать игрокам','').trim().slice(0,80),t:t.slice(0,2500),img:im&&im.src.length<400000?im.src:''})};(pg.querySelector('.sb-sub')||h0).after(b)});mo.observe(sh,{attributes:true,attributeFilter:['class']});const sp=document.getElementById('sheetPage');sp&&mo.observe(sp,{childList:true})})();

;
/* lists.js */
'use strict';{
/* Единая панель сортировки/фильтров/избранного для всех каталогов (оборачивает lazyList) */
const ST=LS.get('lists',{});const FV=LS.get('favs',{});const sv=()=>{LS.set('lists',ST);LS.set('favs',FV)};
const RAR=['Обычный','Необычный','Редкий','Очень редкий','Легендарный','Артефакт','Разная'];
const gp=c=>{const m=String(c||'').replace(/\s/g,'').match(/([\d.,]+)(пм|зм|эм|см|мм)/);if(!m)return -1;return parseFloat(m[1].replace(',','.'))*({пм:10,зм:1,эм:.5,см:.1,мм:.01}[m[2]])};
const crn=v=>{v=String(v);return v.includes('/')?eval(v):+v};
const SZ=['Крошечный','Маленький','Средний','Большой','Огромный','Громадный'];
const CFG={
 mon:{t:'monsters',sorts:[['n','Имя'],['cr','Опасность'],['xp','Опыт'],['hp','Хиты'],['ac','КД'],['sz','Размер']],key:{n:x=>x.n,cr:x=>crn(x.cr),xp:x=>x.xp||0,hp:x=>x.hp,ac:x=>x.ac,sz:x=>SZ.indexOf(x.sz)},
  filters:{sz:['Размер',SZ.map(s=>[s,s]),(x,v)=>x.sz===v],src:['Источник',[['srd','Основные правила'],['book','Книга (оригинальные)']],(x,v)=>v==='book'?!!x.book:!x.book],leg:['Особые',[['lg','Легендарные'],['rc','С перезарядкой'],['sp','Заклинатели']],(x,v)=>v==='lg'?(x.lg||[]).length>0:v==='rc'?[...(x.a||[])].some(a=>/перезаряд/i.test(a.n)):[...(x.f||[])].some(a=>/заклинан|колдовств/i.test(a.n))]}},
 sp:{t:'spells',sorts:[['n','Имя'],['l','Уровень'],['sc','Школа'],['t','Время']],key:{n:x=>x.n,l:x=>x.l,sc:x=>x.sc,t:x=>/реакц/.test(x.t)?0:/бонус/.test(x.t)?1:/1 действ/.test(x.t)?2:3},
  filters:{dmg:['Урон',[['y','Наносит урон'],['n','Без урона']],(x,v)=>v==='y'?!!x.dmg:!x.dmg],tm:['Время',[['a','1 действие'],['b','Бонусное'],['r','Реакция'],['l','Дольше']],(x,v)=>v==='a'?/^1 действ/.test(x.t):v==='b'?/бонус/.test(x.t):v==='r'?/реакц/.test(x.t):!/действ|реакц/.test(x.t)]}},
 it:{t:'items',sorts:[['n','Имя'],['cost','Цена'],['w','Вес'],['rar','Редкость']],key:{n:x=>x.n,cost:x=>gp(x.cost),w:x=>x.w||0,rar:x=>RAR.indexOf(x.rar)},
  filters:{att:['Настройка',[['y','Требует'],['n','Не требует']],(x,v)=>v==='y'?!!x.att:!x.att],src:['Источник',[['srd','Справочник'],['art','Артефакты Книги'],['insp','Вдохновлённые легендами']],(x,v)=>v==='srd'?!x.art:v==='art'?!!x.art&&!x.insp:!!x.insp],w:['Вес',[['0','Невесомое'],['l','До 2 кг'],['h','Тяжёлое (>5 кг)']],(x,v)=>v==='0'?!x.w:v==='l'?(x.w||0)<=2:(x.w||0)>5],cost:['Цена',[['c','До 10 зм'],['m','10–100 зм'],['e','Дороже 100 зм']],(x,v)=>{const g=gp(x.cost);return v==='c'?g>=0&&g<10:v==='m'?g>=10&&g<=100:g>100}]}},
 npc:{t:'npcs',sorts:[['n','Имя'],['r','Роль/народ']],key:{n:x=>x.n,r:x=>x.r||''},filters:{src:['Источник',[['b','Из Книги'],['u','Мои']],(x,v)=>v==='u'?String(x.id).startsWith('u'):!String(x.id).startsWith('u')]}}};
function kindOf(el,items){const x=items[0]||{};if(el.id==='castList')return 'npc';if(el.id==='spList')return 'sp';if(el.id==='itList')return 'it';if(x.cr!=null)return 'mon';if(x.sc)return 'sp';return null}
const og=lazyList;
window.lazyList=lazyList=function(el,items,tpl){if(!el)return og.apply(this,arguments);const k=kindOf(el,items);if(!k)return og.apply(this,arguments);const C=CFG[k];const s=ST[k]=ST[k]||{s:'',d:1,f:{},fo:0};const fav=FV[C.t]=FV[C.t]||[];
 let L=items.slice();Object.entries(s.f).forEach(([f,v])=>{if(v&&C.filters[f])L=L.filter(x=>C.filters[f][2](x,v))});if(s.fo)L=L.filter(x=>fav.includes(x.id));
 if(s.s&&C.key[s.s]){const kf=C.key[s.s];L.sort((a,b)=>{const A=kf(a),B=kf(b);return (typeof A==='string'?A.localeCompare(B,'ru'):A-B)*s.d})}
 L.sort((a,b)=>(fav.includes(b.id)?1:0)-(fav.includes(a.id)?1:0));
 bar(el,k,C,s,items.length,L.length);
 const t2=x=>tpl(x).replace(/^(\s*<div class="[^"]*card[^"]*"[^>]*>)/,`$1<button class="fav${fav.includes(x.id)?' on':''}" data-fav="${esc(x.id)}" aria-label="В избранное">${fav.includes(x.id)?'★':'☆'}</button>`);
 if(!el._favb){el._favb=1;el.addEventListener('click',e=>{const b=e.target.closest('[data-fav]');if(!b)return;e.stopPropagation();e.preventDefault();const f=FV[CFG[el._k].t];const id=b.dataset.fav;const i=f.indexOf(id);i>=0?f.splice(i,1):f.push(id);sv();b.classList.toggle('on',i<0);b.textContent=i<0?'★':'☆';toast(i<0?'В избранном — всегда сверху':'Убрано из избранного')},true)}el._k=k;
 if(!L.length&&!window.KM_core&&/spList|itList/.test(el.id)){el.innerHTML='<div class="empty km-ld">Загружаю книгу…</div>';return} if(!L.length){el.innerHTML=`<div class="empty">Ничего не найдено.${Object.values(s.f).some(Boolean)||s.fo?' <button class="btn sm" data-lreset>Сбросить фильтры</button>':''}</div>`;const r=el.querySelector('[data-lreset]');if(r)r.onclick=()=>{s.f={};s.fo=0;sv();render()};return}
 return og.call(this,el,L,t2)};
function bar(el,k,C,s,tot,n){let b=el.previousElementSibling;if(!b||!b.classList.contains('lbar')){b=document.createElement('div');b.className='lbar';el.before(b)}
 const nf=Object.values(s.f).filter(Boolean).length;const sl=(C.sorts.find(x=>x[0]===s.s)||['','Как в книге'])[1];
 b.innerHTML=`<button class="lb" data-lb="sort">⇅ ${sl}</button>${s.s?`<button class="lb" data-lb="dir" aria-label="Направление">${s.d>0?'↑':'↓'}</button>`:''}<button class="lb${s.fo?' on':''}" data-lb="fav">★ Избранное</button><button class="lb${nf?' on':''}" data-lb="flt">⚲ Фильтры${nf?' · '+nf:''}</button><span class="lcount">${n}${n!==tot?' из '+tot:''}</span>`;
 b.onclick=e=>{const x=e.target.closest('[data-lb]');if(!x)return;const a=x.dataset.lb;
  if(a==='dir'){s.d=-s.d;sv();render()}if(a==='fav'){s.fo=s.fo?0:1;sv();render()}
  if(a==='sort')openSheet(`<div class="sb-title">Сортировка</div><div class="list" style="margin-top:10px">${[['','Как в книге'],...C.sorts].map(([v,l])=>`<button class="btn${s.s===v?' red':''}" data-so="${v}">${l}</button>`).join('')}</div>`,r=>r.querySelectorAll('[data-so]').forEach(q=>q.onclick=()=>{s.s=q.dataset.so;s.d=1;sv();closeSheet();render()}));
  if(a==='flt')openSheet(`<div class="sb-title">Фильтры</div>${Object.entries(C.filters).map(([f,[l,opts]])=>`<label class="f">${l}</label><div class="chips">${[['','Все'],...opts].map(([v,t])=>`<button class="chip${(s.f[f]||'')===v?' on':''}" data-ff="${f}" data-fv="${v}">${t}</button>`).join('')}</div>`).join('')}<button class="btn dark" id="lfr" style="width:100%;margin-top:12px">Сбросить всё</button>`,r=>{r.querySelectorAll('[data-ff]').forEach(q=>q.onclick=()=>{s.f[q.dataset.ff]=q.dataset.fv;sv();r.querySelectorAll(`[data-ff="${q.dataset.ff}"]`).forEach(z=>z.classList.toggle('on',z===q));render(true)});r.querySelector('#lfr').onclick=()=>{s.f={};sv();closeSheet();render()}})}}
function render(keepSheet){const y=page.scrollTop;try{window.render?window.render():KM.go(S.sec)}catch(e){KM.go(S.sec)}page.scrollTop=y}
KM.lists={ST,FV,CFG};
}
{/* Универсальная панель для прочих списков (герои, заметки, задания, карты, раздатки, инвентарь) */
const DS=LS.get('dlists',{});const dsv=()=>LS.set('dlists',DS);
const txt=c=>(c.querySelector('.t')?.textContent||c.textContent||'').trim();
const num=c=>{const m=(c.querySelector('.m')?.textContent||'').match(/(\d+[.,]?\d*)\s*(кг|зм)/);return m?parseFloat(m[1].replace(',','.')):0};
function enhance(root,scope){[...new Set([...root.querySelectorAll('.card')].map(c=>c.parentElement))].forEach((L,ix)=>{if(L.classList.contains('dbar')||L.closest('#tabbar'))return;if(L.id==='npcList'||L.id==='spList'||L.id==='itList'||L.id==='castList'||L.closest('.cb-list,[data-nolist]'))return;const cards=[...L.children].filter(c=>c.classList.contains('card'));if(cards.length<3)return;
 const key=scope+':'+(L.id||ix);const s=DS[key]=DS[key]||{q:'',s:'',pin:[]};
 cards.forEach((c,i)=>{c.dataset.o=i;const h=txt(c).slice(0,60);c.dataset.h=h;if(!c.querySelector('.pin')){const b=document.createElement('button');b.className='pin'+(s.pin.includes(h)?' on':'');b.textContent=s.pin.includes(h)?'★':'☆';b.setAttribute('aria-label','Закрепить');b.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();const k=s.pin.indexOf(h);k>=0?s.pin.splice(k,1):s.pin.push(h);dsv();b.classList.toggle('on',k<0);b.textContent=k<0?'★':'☆';apply()},true);c.append(b)}});
 let bar=L.previousElementSibling;if(!bar||!bar.classList.contains('dbar')){bar=document.createElement('div');bar.className='lbar dbar';L.before(bar)}
 const hasW=cards.some(c=>/кг|зм/.test(c.querySelector('.m')?.textContent||''));
 const SO=[['','Как есть'],['az','А–Я'],['za','Я–А'],...(hasW?[['w','Вес/цена ↓']]:[])];
 bar.innerHTML=`<input class="lq" placeholder="Поиск в списке…" value="${esc(s.q)}"><button class="lb" data-ds>⇅ ${SO.find(x=>x[0]===s.s)?.[1]||'Как есть'}</button>`;
 const apply=()=>{const q=s.q.toLowerCase();const arr=[...L.children].filter(c=>c.dataset.o!=null);arr.forEach(c=>c.style.display=!q||c.textContent.toLowerCase().includes(q)?'':'none');
  arr.sort((a,b)=>{const pa=s.pin.includes(a.dataset.h)?1:0,pb=s.pin.includes(b.dataset.h)?1:0;if(pa!==pb)return pb-pa;if(s.s==='az')return txt(a).localeCompare(txt(b),'ru');if(s.s==='za')return txt(b).localeCompare(txt(a),'ru');if(s.s==='w')return num(b)-num(a);return a.dataset.o-b.dataset.o}).forEach(c=>L.append(c))};
 const inp=bar.querySelector('.lq');inp.oninput=()=>{s.q=inp.value;dsv();apply()};
 bar.querySelector('[data-ds]').onclick=()=>{const i=SO.findIndex(x=>x[0]===s.s);s.s=SO[(i+1)%SO.length][0];dsv();bar.querySelector('[data-ds]').textContent='⇅ '+SO.find(x=>x[0]===s.s)[1];apply()};apply()})}
const og=KM.go;KM.go=function(i){const r=og.apply(this,arguments);setTimeout(()=>enhance(page,'s'+S.sec),60);return r};
new MutationObserver(()=>{clearTimeout(enhance.t);enhance.t=setTimeout(()=>{enhance(page,'s'+S.sec);const sh=document.querySelector('#sheet.open');if(sh)enhance(sh,'sheet')},120)}).observe(document.body,{childList:true,subtree:true});
}

;
/* novice.js */
'use strict';{
/* ===== Режим новичка: шпаргалки, пошаговые сценарии, недавнее, «что делать сейчас» ===== */
const NV=LS.get('novice',{on:1,rec:[]});const nsv=()=>LS.set('novice',NV);
const REF={
'Действия в бою':[['Действие','Атака · Заклинание · Рывок (двойное движение) · Отход (без провоцированных атак) · Уклонение (атаки по тебе с помехой) · Помощь (союзнику преимущество) · Засада/Спрятаться · Подготовка · Использовать предмет'],['Бонусное действие','Только если что-то его даёт: заклинание, умение класса, второе оружие.'],['Реакция','1 за раунд, можно в чужой ход: провоцированная атака, «Щит», Подготовленное действие.'],['Движение','Скорость в метрах, можно дробить до/после действия. Труднопроходимая местность — вдвое медленнее.'],['Свободно','Сказать пару слов, открыть дверь, вынуть оружие.']],
'Состояния':[['Ослеплённый','Проваливает проверки зрения; атаки по нему с преимуществом, его — с помехой.'],['Испуганный','Помеха пока видит источник страха; не может приблизиться к нему.'],['Схваченный','Скорость 0. Освободиться: Атлетика/Акробатика против Атлетики.'],['Недееспособный','Нет действий и реакций.'],['Невидимый','Его атаки с преимуществом, по нему — с помехой.'],['Парализованный','Недееспособен, проваливает спасы СИЛ/ЛОВ, удар вблизи — критический.'],['Отравленный','Помеха на атаки и проверки.'],['Сбитый с ног','Ползёт; встать — половина скорости. Вблизи по нему преимущество, издалека — помеха.'],['Опутанный','Скорость 0; его атаки с помехой, по нему — с преимуществом.'],['Ошеломлённый','Недееспособен, проваливает спасы СИЛ/ЛОВ, по нему преимущество.'],['Без сознания','Роняет всё, падает; удар вблизи — критический.']],
'Проверки и СЛ':[['Очень легко','СЛ 5 — почти любой справится'],['Легко','СЛ 10 — залезть на забор, услышать громкий разговор'],['Средне','СЛ 15 — вскрыть простой замок, переплыть бурную реку'],['Трудно','СЛ 20 — перепрыгнуть пропасть 6 м, обмануть стражника-ветерана'],['Очень трудно','СЛ 25 — уговорить короля отдать трон'],['Почти невозможно','СЛ 30 — только с удачей и магией'],['Совет','Не уверен — бери 12. Бросок нужен, только если есть и шанс провала, и цена провала.']],
'Укрытие':[['Половинное','+2 к КД и спасам ЛОВ: низкая стена, другой существо, ствол дерева.'],['Три четверти','+5 к КД и спасам ЛОВ: бойница, толстое дерево.'],['Полное','Нельзя выбрать целью напрямую.']],
'Отдых':[['Короткий','1 час. Трать кости хитов: кость + мод. ТЕЛ. Колдун получает ячейки, некоторые умения перезаряжаются.'],['Долгий','8 часов (сон 6). Все хиты, половина костей хитов, все ячейки. Не чаще раза в сутки.'],['Прерывание','Час боя/ходьбы/колдовства прерывает долгий отдых — начинайте заново.']],
'Преимущество и помеха':[['Преимущество','Брось к20 дважды, бери больший. Даётся за хитрость, помощь, удачную позицию.'],['Помеха','Брось к20 дважды, бери меньший. Темнота, ранение, неудобство.'],['Оба сразу','Взаимно отменяются, бросай один к20.']]};
const FLOW={
'Бой':['Опиши, кого видят герои и где. Спроси: кто кого заметил? (Внимательность против Скрытности.)','Добавь монстров: Бой → «+» → выбери из бестиария. Героев — кнопкой «Герои».','Все бросают инициативу (к20 + ЛОВ). Трекер сам отсортирует.','В свой ход существо: движется и делает ОДНО действие (+бонусное, если есть).','Атака: к20 + бонус ≥ КД цели → попадание, бросай урон. 20 на кубике — крит (кубы урона ×2).','Хиты на 0: монстр повержен, герой без сознания — спасброски от смерти в начале его хода.','Бой кончается, когда враги повержены, сбежали или сдались. Нажми «Завершить бой» — получишь опыт и добычу.'],
'Проверка':['Игрок описывает, ЧТО делает герой — не «я кидаю Убеждение».','Нужен ли бросок? Если провал невозможен или ничего не стоит — просто скажи «получилось».','Выбери навык (например Атлетика) и СЛ: 10 легко, 15 средне, 20 трудно.','Игрок бросает к20 + модификатор навыка.','Результат ≥ СЛ — успех. Провал — история идёт дальше, но с осложнением.'],
'Отдых':['Спроси: короткий (1 час) или долгий (8 часов)? Где отдыхают? Безопасно ли?','Можно бросить случайную встречу (1 из 6 — кто-то приходит).','Короткий: каждый тратит кости хитов по желанию. Долгий: всё восстановлено.','Отметь в листах героев: хиты, ячейки, умения. Сдвинь календарь.'],
'Повышение уровня':['Раздай опыт после боя или вехи (или повышай по сюжету — так проще).','Каждый герой: +кость хитов (бросок или среднее) + мод. ТЕЛ к максимуму хитов.','Новые умения класса — смотри таблицу класса; на 4, 8, 12… +2 к характеристике или черта.','Заклинатели: новые ячейки и заклинания. Бонус мастерства растёт на 5, 9, 13, 17.','Обнови лист героя в разделе «Герои».']};
const NOW={0:'Начни сессию: зачитай краткое «в прошлый раз», затем опиши сцену тремя деталями.',1:'Ищешь врага? Фильтр «Опасность» ≈ уровню героев. ★ — запомнить на сессию.',2:'Игрок кастует? Найди заклинание поиском, проверь концентрацию и дальность.',3:'После боя: «Генератор лута» → выдай вещь герою одним касанием.',4:'Бой: следи за подсветкой — чей ход. Урон — тап по существу.',5:'Не знаешь, что кинуть? Атака/проверка — к20, урон — по оружию.',6:'Герои: держи открытым лист игрока — хиты и состояния под рукой.',7:'Карта: открой туман по мере того, как герои идут.',8:'Заметки: запиши имена, которые придумал на ходу, — игроки их запомнят.',9:'Правила: не помнишь — реши в пользу веселья, проверишь после игры.'};
function card(t,rows){return `<div class="card nv-ref"><div class="t">${t}</div>${rows.map(([a,b])=>`<div class="nv-r"><b>${a}</b><span>${b}</span></div>`).join('')}</div>`}
function hub(tab){tab=tab||'ref';const tabs=[['ref','Шпаргалки'],['flow','По шагам'],['rec','Недавнее']];
 openSheet(`<div class="sb-title">Помощник мастера</div><button class="btn red" id="nvs" style="width:100%;margin:8px 0">⌕ Найти что угодно (правило, монстр, заклинание…)</button><div class="seg">${tabs.map(([k,l])=>`<button class="${k===tab?'on':''}" data-nt="${k}">${l}</button>`).join('')}</div><div id="nvb" style="margin-top:10px">${
  tab==='ref'?Object.keys(REF).map(k=>`<button class="btn nv-big" data-rf="${k}">${k}</button>`).join(''):
  tab==='flow'?Object.keys(FLOW).map(k=>`<button class="btn nv-big" data-fl="${k}">▶ ${k} — шаг за шагом</button>`).join(''):
  (NV.rec.length?NV.rec.map(r=>`<button class="btn nv-big" data-rc="${esc(r.k)}|${esc(r.id)}">${esc(r.n)} <small>${esc(r.k)}</small></button>`).join(''):'<div class="empty">Здесь появится то, что ты открывал.</div>')
 }</div><button class="btn dark" id="nvbk2" style="width:100%;margin-top:12px">🛡 Сохранность данных и экскурсия</button><label class="nv-tg"><input type="checkbox" id="nvon" ${NV.on?'checked':''}> Режим новичка (подсказки «что делать сейчас»)</label>`,r=>{
  r.querySelector('#nvs').onclick=()=>{closeSheet();setTimeout(()=>KM.assist&&KM.assist.open?KM.assist.open():document.querySelector('.as-fab')?.click(),250)};
  r.querySelectorAll('[data-nt]').forEach(b=>b.onclick=()=>hub(b.dataset.nt));
  r.querySelectorAll('[data-rf]').forEach(b=>b.onclick=()=>openSheet(`<div class="sb-title">${b.dataset.rf}</div>${card('',REF[b.dataset.rf])}<button class="btn dark" id="nvbk" style="width:100%">← Назад</button>`,q=>q.querySelector('#nvbk').onclick=()=>hub('ref')));
  r.querySelectorAll('[data-fl]').forEach(b=>b.onclick=()=>flow(b.dataset.fl,0));
  r.querySelectorAll('[data-rc]').forEach(b=>b.onclick=()=>{const [k,id]=b.dataset.rc.split('|');closeSheet();setTimeout(()=>OPEN[k]&&OPEN[k](id),250)});
  r.querySelector('#nvbk2').onclick=()=>KM.tour.ui();r.querySelector('#nvon').onchange=e=>{NV.on=e.target.checked?1:0;nsv();now()}})}
function flow(k,i){const st=FLOW[k];openSheet(`<div class="sb-title">${k}: шаг ${i+1} из ${st.length}</div><div class="nv-prog"><i style="width:${(i+1)/st.length*100}%"></i></div><p class="nv-step">${st[i]}</p>${k==='Проверка'&&i===2?`<div class="chips">${[['Легко',10],['Средне',15],['Трудно',20]].map(([l,v])=>`<button class="chip" data-dc="${v}">${l} · СЛ ${v}</button>`).join('')}</div>`:''}<div style="display:flex;gap:8px;margin-top:14px"><button class="btn dark" id="fp" style="flex:1">${i?'← Назад':'← Меню'}</button><button class="btn red" id="fn" style="flex:2">${i<st.length-1?'Дальше →':'Готово ✓'}</button></div>`,r=>{
 r.querySelector('#fp').onclick=()=>i?flow(k,i-1):hub('flow');r.querySelector('#fn').onclick=()=>{if(i<st.length-1)flow(k,i+1);else{closeSheet();toast('Готово! Сценарий «'+k+'» пройден');if(k==='Бой')KM.go(4)}};
 r.querySelectorAll('[data-dc]').forEach(b=>b.onclick=()=>{const d=1+Math.floor(Math.random()*20);toast(`СЛ ${b.dataset.dc}: на к20 выпало ${d} — добавь модификатор игрока`)})})}
const OPEN={'Монстр':id=>showMon(id),'Заклинание':id=>showSpell(id),'Предмет':id=>KM.showItem(id)};
function rec(k,id,n){NV.rec=NV.rec.filter(r=>!(r.k===k&&r.id===id));NV.rec.unshift({k,id,n});NV.rec.length=Math.min(NV.rec.length,12);nsv()}
const wm=window.showMon;if(wm)window.showMon=showMon=function(id){const m=DATA.monsters.find(x=>x.id===id);m&&rec('Монстр',id,m.n);return wm.apply(this,arguments)};
const ws=window.showSpell;if(ws)window.showSpell=showSpell=function(id){const m=DATA.spells.find(x=>x.id===id);m&&rec('Заклинание',id,m.n);return ws.apply(this,arguments)};
const wi=KM.showItem;if(wi)KM.showItem=function(id){const m=DATA.items.find(x=>x.id===id);m&&rec('Предмет',id,m.n);return wi.apply(this,arguments)};
function now(){let b=document.getElementById('nvnow');if(!NV.on){b&&b.remove();return}const t=NOW[S.sec];if(!t)return;const h=page.querySelector(':scope>.ph');if(!b){b=document.createElement('div');b.id='nvnow'}b.innerHTML=`<span>✦</span><p>${t}</p><button aria-label="Помощник">?</button>`;b.querySelector('button').onclick=()=>hub();(h&&h.parentNode===page?h.after(b):page.prepend(b))}
const og=KM.go;KM.go=function(){const r=og.apply(this,arguments);now();setTimeout(now,30);return r};
const f=document.createElement('button');f.id='nvfab';f.textContent='?';f.setAttribute('aria-label','Помощник мастера');f.onclick=()=>hub();document.body.append(f);
setTimeout(now,800);KM.novice={hub,flow,REF,FLOW,NV};}

;
/* weather.js */
'use strict';{
/* ===== Живая погода: климат × сезон, марковские переходы по игровому времени, эффекты, оверлей ===== */
const ST={clear:['☀','Ясно'],cloud:['⛅','Облачно'],rain:['🌧','Дождь'],storm:['⛈','Гроза'],fog:['🌫','Туман'],snow:['❄','Снег'],bliz:['🌨','Метель'],wind:['🌬','Сильный ветер'],heat:['🔥','Зной']};
const EFF={clear:'Без помех. Видимость отличная.',cloud:'Без помех. Ночью темнее обычного (тусклый свет).',rain:'Слабая видимость: помеха на Внимательность (зрение и слух). Костры гаснут, следы смываются. Путь −25 %.',storm:'Сильный ливень и ветер: помеха на Внимательность и дальнобойные атаки; молнии! Путь −50 %, разумно переждать.',fog:'Видимость 20 м — местность слабо заслонена; дальше — сильно заслонена. Легко заблудиться: Выживание СЛ 15.',snow:'Труднопроходимая местность. Путь −50 %. Следы видно отчётливо (Выживание с преимуществом).',bliz:'Видимость 10 м, сильный холод: каждый час спасбросок ТЕЛ СЛ 10 или 1 уровень истощения без тёплой одежды. Путь −75 %.',wind:'Помеха на дальнобойные атаки оружием, гаснет открытое пламя, полёт затруднён. Туман рассеивается.',heat:'Без воды: каждый час спасбросок ТЕЛ СЛ 5 (+1 за час), провал — истощение. Тяжёлые доспехи — помеха.'};
const CL={temp:['Умеренный',[[8,18],[2,9],[-6,2],[10,20]]],north:['Северный',[[2,10],[-8,0],[-25,-10],[-2,6]]],desert:['Пустыня',[[22,34],[30,45],[8,20],[18,30]]],trop:['Тропики',[[24,31],[26,34],[22,28],[25,32]]],mount:['Горы',[[0,10],[6,16],[-18,-5],[-2,8]]],coast:['Побережье',[[9,16],[16,24],[1,8],[8,15]]]};
const SEAS=['Весна','Лето','Зима','Осень'];
// базовые переходы [clear,cloud,rain,storm,fog,snow,bliz,wind,heat]
const K=Object.keys(ST);
function row(o){return K.map(k=>o[k]||0)}
function P(cl,se,cur){const cold=CL[cl][1][se][1]<=1,hot=CL[cl][1][se][0]>=24;let b={clear:4,cloud:3,rain:2,storm:.6,fog:1,wind:1};
 if(cold)b={clear:3,cloud:3,snow:2.5,bliz:.7,fog:1,wind:1.2};if(hot)b={clear:6,cloud:1.5,heat:2.5,wind:.8,storm:.3};if(cl==='trop')b={clear:3,cloud:2,rain:3,storm:1.5,fog:.5};if(cl==='coast')b.fog=(b.fog||0)+1.5,b.wind=(b.wind||0)+1;if(cl==='desert'&&!hot)b={clear:6,cloud:1,wind:1.5};
 const r=row(b);const i=K.indexOf(cur);if(i>=0&&r[i])r[i]*=3.2;/* инерция */ if(cur==='storm')r[K.indexOf('rain')]+=3,r[K.indexOf('cloud')]+=2;if(cur==='rain')r[K.indexOf('cloud')]+=2;if(cur==='bliz')r[K.indexOf('snow')]+=3;return r}
const W=Object.assign({cl:'temp',se:-1,cur:'clear',t:14,wind:8,ov:'',fx:1,last:null,hist:[]},LS.get('wx2',{}));const sv=()=>LS.set('wx2',W);
const season=()=>W.se>=0?W.se:(()=>{try{const m=camp.month;return m<2||m>10?2:m<5?0:m<8?1:3}catch(e){return 1}})();
const pick=r=>{const s=r.reduce((a,b)=>a+b,0);let x=Math.random()*s;for(let i=0;i<r.length;i++){x-=r[i];if(x<=0)return K[i]}return K[0]};
function temp(){const [lo,hi]=CL[W.cl][1][season()];let t=lo+Math.random()*(hi-lo);if(W.cur==='rain'||W.cur==='storm')t-=3;if(W.cur==='heat')t+=6;if(W.cur==='clear')t+=2;let h=0;try{h=(sess.min%1440)/60}catch(e){}t-=(h<6||h>21)?5:0;return Math.round(t)}
function windv(){return Math.round({storm:55,bliz:60,wind:45,rain:18,snow:15,fog:4,heat:8,clear:8,cloud:12}[W.cur]*(.6+Math.random()*.8))}
function step(n=1){for(let i=0;i<n;i++)W.cur=pick(P(W.cl,season(),W.cur));W.t=temp();W.wind=windv();publish()}
function cur(){return W.ov||W.cur}
function text(){const s=ST[cur()];return `${s[0]} ${s[1]}, ${W.t} °C, ветер ${W.wind} км/ч`}
function publish(){try{sess.weather=text();LS.set('sess',sess)}catch(e){}try{camp.wx=text();LS.set('camp',camp)}catch(e){}W.hist.unshift(text());W.hist.length=Math.min(W.hist.length,8);sv();overlay()}
function forecast(){let c=W.cur;const out=[];for(let i=0;i<3;i++){const r=P(W.cl,season(),c);const s=r.reduce((a,b)=>a+b,0);const j=r.indexOf(Math.max(...r));c=K[j];out.push([c,Math.round(r[j]/s*100)])}return out}
/* привязка к игровому времени: шаг каждые 4 часа */
function abs(){try{return sess.day*1440+sess.min}catch(e){return 0}}
function tick(){const a=abs();if(W.last==null){W.last=a;sv();return}const d=a-W.last;if(d>=240){step(Math.min(12,Math.floor(d/240)));W.last=a-(d%240);sv();if(S.sec===0&&!document.querySelector('#sheet.open'))try{KM.go(0)}catch(e){}toast('Погода сменилась: '+text())}else if(d<0){W.last=a;sv()}}
setInterval(tick,1500);
/* лист настроек */
function ui(){const f=forecast();openSheet(`<div class="sb-title">Погода</div><div class="wx-now"><div class="wx-ic">${ST[cur()][0]}</div><div><b>${ST[cur()][1]}${W.ov?' <small>(вручную)</small>':''}</b><span>${W.t} °C · ветер ${W.wind} км/ч · ${SEAS[season()]}, ${CL[W.cl][0].toLowerCase()} климат</span></div></div>
<div class="wx-eff"><b>Что это значит в игре</b><p>${EFF[cur()]}</p></div>
<label class="f">Прогноз (каждые 4 часа)</label><div class="wx-fc">${f.map(([k,p],i)=>`<div><small>+${(i+1)*4} ч</small><i>${ST[k][0]}</i><span>${ST[k][1]}</span><small>${p} %</small></div>`).join('')}</div>
<label class="f">Климат / регион</label><div class="chips">${Object.entries(CL).map(([k,v])=>`<button class="chip${W.cl===k?' on':''}" data-wcl="${k}">${v[0]}</button>`).join('')}</div>
<label class="f">Сезон</label><div class="chips"><button class="chip${W.se<0?' on':''}" data-wse="-1">По календарю</button>${SEAS.map((s,i)=>`<button class="chip${W.se===i?' on':''}" data-wse="${i}">${s}</button>`).join('')}</div>
<label class="f">Задать вручную</label><div class="chips"><button class="chip${!W.ov?' on':''}" data-wov="">Авто</button>${K.map(k=>`<button class="chip${W.ov===k?' on':''}" data-wov="${k}">${ST[k][0]} ${ST[k][1]}</button>`).join('')}</div>
<div class="row" style="margin-top:12px"><button class="btn red grow" id="wxs">⟳ Следующие 4 часа</button><button class="btn grow" id="wxfx">${W.fx?'Эффекты на экране: вкл':'Эффекты на экране: выкл'}</button></div>
${W.hist.length?`<label class="f">Недавно</label><div class="muted" style="font-size:13px;line-height:1.6">${W.hist.slice(1,6).map(esc).join('<br>')}</div>`:''}`,r=>{
 r.querySelectorAll('[data-wcl]').forEach(b=>b.onclick=()=>{W.cl=b.dataset.wcl;step(1);ui()});
 r.querySelectorAll('[data-wse]').forEach(b=>b.onclick=()=>{W.se=+b.dataset.wse;step(1);ui()});
 r.querySelectorAll('[data-wov]').forEach(b=>b.onclick=()=>{W.ov=b.dataset.wov;W.t=temp();W.wind=windv();publish();ui()});
 r.querySelector('#wxs').onclick=()=>{W.last=abs();step(1);ui()};r.querySelector('#wxfx').onclick=()=>{W.fx=W.fx?0:1;sv();overlay();ui()}})}
/* перехват кнопки погоды в Сессии и Календаре */
document.addEventListener('click',e=>{const b=e.target.closest('[data-a=wx],[data-wx]');if(!b||!b.closest('#page'))return;e.stopPropagation();e.preventDefault();ui()},true);
/* ===== оверлей: дождь, снег, туман, молнии ===== */
const cv=document.createElement('canvas');cv.id='wxfx';document.body.append(cv);const g=cv.getContext('2d');let parts=[],raf=0,flash=0,mode='';
const calmM=()=>document.documentElement.classList.contains('calm')||matchMedia('(prefers-reduced-motion: reduce)').matches;
function overlay(){const sec=S.sec;const m=cur();const on=W.fx&&(sec===0||sec===7)&&['rain','storm','snow','bliz','fog','wind'].includes(m)&&!document.hidden;cv.style.display=on?'block':'none';document.body.dataset.wx=on?m:'';if(!on){cancelAnimationFrame(raf);raf=0;return}
 if(mode!==m){mode=m;const n={rain:90,storm:150,snow:70,bliz:160,fog:7,wind:26}[m];parts=Array.from({length:n},()=>np(true))}if(!raf)raf=requestAnimationFrame(draw)}
function np(init){const w=innerWidth,h=innerHeight;return {x:Math.random()*w*1.2-w*.1,y:init?Math.random()*h:-20,v:Math.random()}}
let lt=0;function draw(t){raf=requestAnimationFrame(draw);if(t-lt<33)return;lt=t;const w=cv.width=innerWidth,h=cv.height=innerHeight;g.clearRect(0,0,w,h);const m=mode,c=calmM();const sp=c?.3:1;
 if(m==='rain'||m==='storm'){g.strokeStyle=m==='storm'?'rgba(190,200,230,.42)':'rgba(170,185,215,.32)';g.lineWidth=1.1;g.beginPath();const sl=m==='storm'?5:2;for(const p of parts){const L=12+p.v*14;g.moveTo(p.x,p.y);g.lineTo(p.x-sl,p.y+L);p.y+=(14+p.v*10)*sp;p.x-=sl*.4*sp;if(p.y>h)Object.assign(p,np())}g.stroke();
  if(m==='storm'&&!c){if(Math.random()<.006)flash=1;if(flash>0){g.fillStyle=`rgba(225,230,255,${flash*.35})`;g.fillRect(0,0,w,h);flash-=.12}}}
 else if(m==='snow'||m==='bliz'){g.fillStyle='rgba(240,240,250,.75)';const dx=m==='bliz'?4:.6;for(const p of parts){g.beginPath();g.arc(p.x,p.y,1+p.v*2.2,0,7);g.fill();p.y+=(1+p.v*1.6)*sp*(m==='bliz'?2:1);p.x+=(Math.sin(t/900+p.v*9)*.6+dx)*sp;if(p.y>h||p.x>w+20)Object.assign(p,np(),{x:Math.random()*w-(m==='bliz'?w*.3:0)})}}
 else if(m==='fog'){for(const p of parts){const r=180+p.v*160;const gr=g.createRadialGradient(p.x,p.y,0,p.x,p.y,r);gr.addColorStop(0,'rgba(200,195,190,.16)');gr.addColorStop(1,'rgba(200,195,190,0)');g.fillStyle=gr;g.fillRect(p.x-r,p.y-r,r*2,r*2);p.x+=(.25+p.v*.3)*sp;if(p.x-r>w)p.x=-r}}
 else if(m==='wind'){g.strokeStyle='rgba(220,210,190,.18)';g.lineWidth=1;for(const p of parts){g.beginPath();g.moveTo(p.x,p.y);g.quadraticCurveTo(p.x+30,p.y-6,p.x+70+p.v*40,p.y);g.stroke();p.x+=(9+p.v*8)*sp;if(p.x>w)Object.assign(p,{x:-120,y:Math.random()*h})}}}
document.addEventListener('visibilitychange',overlay);
const og=KM.go;KM.go=function(){const r=og.apply(this,arguments);setTimeout(overlay,50);return r};
if(W.last==null)publish();setTimeout(overlay,600);
try{window.weather=weather=function(){step(6)}}catch(e){}
KM.wx={ui,step,W,text,EFF,forecast,overlay,cur};
}

;
/* tour.js */
'use strict';{
/* ===== Экскурсия первого запуска + автосохранение/резервные копии ===== */
const P=!!window.KM_PLAYER;const KEY=P?'kpm.tour':'km.tour';
const STEPS=P?[
 [null,'Добро пожаловать в «Книгу Игрока»','Это лист вашего героя — без бумаги и ластика. Покажу главное за 20 секунд.'],
 ['#ribbons','Закладки','Герой, Сумка, Чары, Записи и Стол. Можно и свайпать страницы.'],
 ['#hpc','Хиты','Коснитесь, чтобы получить урон или лечение. При 0 — спасброски от смерти.'],
 ['#link','Стол Мастера','Введите код от Мастера — лист будет синхронизироваться. Предметы, золото и уровни выдаёт Мастер.']
]:[
 [null,'Добро пожаловать, Мастер','«Книга Мастера» ведёт игру вместе с вами: бой, правила, погода, добыча. Покажу главное за 30 секунд.'],
 ['#ribbons','Закладки разделов','Сессия, Бестиарий, Чары, Лут, Бой, Кубики, Герои, Карта, Заметки, Правила. Свайп листает страницы.'],
 ['#kdock-t','Инструменты: Око и Помощник','Шпаргалки, пошаговые сценарии (бой, проверка, отдых, уровень) и недавнее. Первый раз? Начните отсюда.'],
 ['#kdock-t','Око — поиск всего','Спросите что угодно: «фаербол», «хилка», «сколько хитов у гоблина». Понимает сленг.'],
 ['#page .ph','Сессия','Партия, инициатива, сцена, время и погода. Время идёт — погода меняется сама.'],
 [null,'Всё сохраняется само','Данные хранятся на телефоне и автоматически копируются. Резервную копию в файл — в Помощнике («?»). Удачной игры!']];
function el(sel){if(!sel)return null;for(const s of sel.split(',')){const e=document.querySelector(s);if(e&&e.getBoundingClientRect().width>0&&getComputedStyle(e).display!=="none")return e}return null}
function run(i=0){let ov=document.getElementById('tour');if(!ov){ov=document.createElement('div');ov.id='tour';document.body.append(ov)}
 const st=STEPS[i];if(!st){ov.remove();localStorage.setItem(KEY,'1');return}const e=el(st[0]);if(st[0]&&!e)return run(i+1);
 const r=e?e.getBoundingClientRect():null;const pad=8;
 ov.innerHTML=`<div class="tr-hole" style="${r?`left:${r.left-pad}px;top:${r.top-pad}px;width:${r.width+pad*2}px;height:${r.height+pad*2}px`:'left:50%;top:40%;width:0;height:0'}"></div><div class="tr-card" style="${r&&r.top>innerHeight/2?`bottom:${innerHeight-r.top+18}px`:`top:${r?r.bottom+18:innerHeight*.3}px`}"><small>${i+1} из ${STEPS.length}</small><b>${st[1]}</b><p>${st[2]}</p><div class="row"><button class="btn dark" data-tr="skip">Пропустить</button><button class="btn red grow" data-tr="next">${i<STEPS.length-1?'Дальше →':'Начать игру'}</button></div></div>`;
 ov.onclick=ev=>{const b=ev.target.closest('[data-tr]');if(!b)return;if(b.dataset.tr==='skip'){ov.remove();localStorage.setItem(KEY,'1')}else run(i+1)}}
function maybe(){if(localStorage.getItem(KEY)||navigator.webdriver&&!window.__tour)return;const cv=document.getElementById('cover');if(cv&&!cv.classList.contains('gone')){return setTimeout(maybe,700)}setTimeout(()=>run(0),500)}
setTimeout(maybe,1200);
/* ---- резервные копии ---- */
const PFX=P?['kp_','kpm.']:['km.'];const BK=P?'kpm.backups':'km.backups';
function dump(){const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(PFX.some(p=>k.startsWith(p))&&k!==BK)o[k]=localStorage.getItem(k)}return o}
function auto(){try{const L=JSON.parse(localStorage.getItem(BK)||'[]');const d=dump();const s=JSON.stringify(d);if(L[0]&&L[0].s===s.length&&Date.now()-L[0].t<36e5)return;L.unshift({t:Date.now(),s:s.length,d});L.length=Math.min(L.length,3);localStorage.setItem(BK,JSON.stringify(L))}catch(e){/* переполнение: храним одну */try{localStorage.setItem(BK,JSON.stringify([{t:Date.now(),d:dump()}]))}catch(_){}}}
setInterval(auto,5*60e3);document.addEventListener('visibilitychange',()=>{if(document.hidden)auto()});setTimeout(auto,8000);
function exportFile(){const b=new Blob([JSON.stringify({app:P?'kniga-igroka':'kniga-mastera',v:1,t:new Date().toISOString(),data:dump()})],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=(P?'kniga-igroka':'kniga-mastera')+'-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000);toast('Резервная копия сохранена в файл')}
function restore(d){Object.entries(d).forEach(([k,v])=>localStorage.setItem(k,v));toast('Восстановлено — перезагружаю…');setTimeout(()=>location.reload(),900)}
function importFile(){const i=document.createElement('input');i.type='file';i.accept='application/json,.json';i.onchange=()=>{const f=i.files[0];if(!f)return;f.text().then(t=>{try{const o=JSON.parse(t);if(!o.data)throw 0;if(confirm('Заменить текущие данные копией от '+new Date(o.t).toLocaleString('ru-RU')+'?'))restore(o.data)}catch(e){toast('Это не файл копии')}})};i.click()}
function ui(){const L=JSON.parse(localStorage.getItem(BK)||'[]');openSheet(`<div class="sb-title">Сохранность данных</div><p class="muted">Всё сохраняется на этом устройстве автоматически. Каждые 5 минут делается снимок (хранятся 3 последних).</p><button class="btn red" id="bkx" style="width:100%;margin-top:8px">⇩ Сохранить копию в файл</button><button class="btn" id="bki" style="width:100%;margin-top:8px">⇧ Восстановить из файла</button><label class="f">Автоснимки</label>${L.map((b,j)=>`<button class="btn nv-big" data-bk="${j}">↺ ${new Date(b.t).toLocaleString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</button>`).join('')||'<p class="muted">Ещё нет.</p>'}<button class="btn dark" id="bkt" style="width:100%;margin-top:10px">Показать экскурсию снова</button>`,r=>{r.querySelector('#bkx').onclick=exportFile;r.querySelector('#bki').onclick=importFile;r.querySelectorAll('[data-bk]').forEach(b=>b.onclick=()=>{if(confirm('Вернуть данные к этому снимку?'))restore(L[+b.dataset.bk].d)});r.querySelector('#bkt').onclick=()=>{closeSheet();localStorage.removeItem(KEY);setTimeout(()=>run(0),450)}})}
KM.tour={run,ui,exportFile,auto};
}

;
/* shops.js */
'use strict';{
/* ===== Лавки и торговцы ===== */
const pk=a=>a[Math.random()*a.length|0],rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const RP={'Обычный':[50,100],'Необычный':[200,500],'Редкий':[2000,5000],'Очень редкий':[10000,40000],'Легендарный':[50000,150000],'Артефакт':[200000,300000],'Разная':[100,1000]};
function base(it){if(!it)return 0;const m=String(it.cost||'').replace(/\s/g,'').match(/([\d.,]+)(мм|см|эм|зм|пм)/);if(m){const v=parseFloat(m[1].replace(',','.'));return v*{мм:.01,см:.1,эм:.5,зм:1,пм:10}[m[2]]}
 if(it.cat==='Магические'){const r=RP[it.rar]||RP['Разная'];let h=0;for(const ch of it.id)h=(h*31+ch.charCodeAt(0))>>>0;let v=r[0]+(h%1000)/1000*(r[1]-r[0]);if(/Зелье/.test(it.sub||'')||/^Зелье/.test(it.n))v/=2;if(/Свиток/.test(it.sub||'')||/^Свиток/.test(it.n))v/=2;return Math.round(v/5)*5}return 0}
const fmt=g=>{if(g>=1)return (Math.round(g*10)/10).toLocaleString('ru')+' зм';if(g>=.1)return Math.round(g*10)+' см';return Math.max(1,Math.round(g*100))+' мм'};
const RANK=['Обычный','Необычный','Редкий','Очень редкий','Легендарный'];
const I=()=>DATA.items;const nm=(it,re)=>re.test(it.n);
const TY={
 smith:{n:'Кузница',i:'⚒',who:'Кузнец',f:it=>it.cat==='Доспехи'||it.cat==='Оружие'&&/рукопаш/i.test(it.sub||'')||it.cat==='Снаряжение'&&/Цепь|Молот|Кирка|Лом|Котелок|Крюк|Капкан|Шип|Замок|Кандал|Подков/i.test(it.n),
  ph:['Сталь не врёт, в отличие от людей.','Подожди, пока остынет — тогда и поговорим о цене.','Кто вам ковал этот клинок? Позор ремеслу.','За починку — отдельно.']},
 arms:{n:'Оружейная',i:'⚔',who:'Оружейник',f:it=>it.cat==='Оружие'||/Стрел|Болт|Снаряды|Иглы|Колчан|Футляр для болтов/i.test(it.n),
  ph:['Лук под твою руку? Есть. Совесть под твою руку — нет.','Пристрелять можно во дворе, только кур не трогай.','Этот меч видел три войны.','Беру только звонкой монетой.']},
 alch:{n:'Алхимик',i:'⚗',who:'Алхимик',f:it=>/Кислота|Алхимический|Противоядие|Масло|Духи|Мыло|Яд|флакон|Зелье|Набор травника|Набор отравителя|Инструменты алхимика/i.test(it.n)||it.cat==='Магические'&&/Зелье|Масло|Пыль|Порош/i.test(it.n+(it.sub||'')),mag:1,
  ph:['Не нюхай это. Нет, серьёзно.','Побочные эффекты? Только приятные. В основном.','Свежая партия, ещё булькает.','Платите вперёд — некоторые клиенты не возвращаются.']},
 magic:{n:'Магическая лавка',i:'✧',who:'Чародей-торговец',f:it=>it.cat==='Магические'&&it.rar!=='Артефакт'||/Волшебная палочка|Жезл|Посох|Кристалл|Сфера|Мешочек с компонентами|Книга заклинаний/i.test(it.n),mag:1,
  ph:['Руками не трогать. Предметы кусаются.','Каждая вещь здесь выбрала хозяина. Посмотрим, выберет ли вас.','Скидок нет. Магия — не капуста.','Опознание — 100 зм, и я никому не скажу, что вы это нашли.']},
 inn:{n:'Трактир',i:'🍺',who:'Трактирщик',custom:[['Кружка эля',.04],['Бутылка вина',2],['Сытный ужин',.3],['Скромный обед',.1],['Ночлег в общем зале',.05],['Комната на ночь',.5],['Лучшая комната',2],['Корм и стойло для лошади',.5],['Паёк в дорогу (1 день)',.5],['Горячая ванна',.1]],
  ph:['Садитесь, грейтесь. Сапоги — у порога.','Слышали, что говорят на рынке? Ну так слушайте.','Драться — во дворе!','Каша сегодня почти без камней.']},
 fence:{n:'Скупщик',i:'🗝',who:'Скупщик',f:it=>it.rar!=='Артефакт'&&(it.cat!=='Магические'||RANK.indexOf(it.rar)<=2),mag:1,buy:.6,mk:.9,unid:.5,
  ph:['Откуда вещь — не моё дело. И не ваше.','Говори тише. Стены здесь любопытные.','Цена хорошая. Для меня.','Если спросят — вы меня не знаете.']},
 trav:{n:'Странствующий торговец',i:'🐴',who:'Торговец',f:it=>it.cat!=='Транспорт'&&(it.cat!=='Магические'||RANK.indexOf(it.rar)<=1),mag:1,size:.6,mk:1.15,unid:.3,
  ph:['Последний экземпляр! Ну, почти.','Был в Глубоководье, был в Невервинтере — такого не видел нигде!','Завтра меня здесь уже не будет. Решайтесь.','Для вас — особая цена. Почти без наценки.']},
 temple:{n:'Храм',i:'☩',who:'Жрец',f:it=>/Святая вода|Противоядие|Набор целителя|Священный символ|Амулет|Эмблема|Реликварий|Ладан|Благовон|Молитвенник|Кадило/i.test(it.n)||it.cat==='Магические'&&/лечения/i.test(it.n),mag:1,
  custom:[['Лечение ран (заклинание)',10],['Малое восстановление',40],['Снятие проклятия',90],['Высшее восстановление',450],['Оживление мёртвого',1250],['Благословение в путь',5]],
  ph:['Да пребудет с вами свет.','Пожертвование не обязательно. Но желательно.','Боги видят всё. Даже кошельки.','Ступайте с миром — и возвращайтесь целыми.']},
 stable:{n:'Конюшня',i:'🐎',who:'Конюх',f:it=>it.cat==='Транспорт'&&!/Судн|Корабл|Лодк|Водн|Морск/i.test(it.sub||'')&&!/Парус|Лодк|Галер|Корабл|Ладья|Плот|Шлюп|Баркас|Килев|Гребн|Драккар|Каравелл|Яхт/i.test(it.n),
  ph:['Эта кобыла кусается только тех, кто торгуется.','Овёс — включён. Седло — нет.','Обижать лошадь — обижать меня.','Повозка с колесом? Двумя колёсами — дороже.']},
 gen:{n:'Товарная лавка',i:'⛁',who:'Лавочник',f:it=>it.cat==='Снаряжение'||it.cat==='Инструменты',
  ph:['Верёвка, факелы, мешки — всё, что нужно герою.','Берёте десять — одиннадцатый за полцены.','В подземелье без мела? Смельчак.','Возврат не принимаем, особенно из подземелий.']}};
/* SHOP_EXTRA (data/shops2.js): новые типы лавок и доп. фильтры */
(()=>{const X=window.SHOP_EXTRA||{};const ICO={'Конюшня':'🐎','Верфь':'⚓','Мастер ловушек':'🪤','Тёмная лавка':'🗝'};const WHO={'Конюшня':'Конюх','Верфь':'Корабел','Мастер ловушек':'Ловчий','Тёмная лавка':'Скупщик'};const PH={'Верфь':['Днище смолёное, парус новый — почти.','Море берёт плату. Я беру меньше.','Лодку на вёслах или мечту под парусом?'],'Мастер ловушек':['Не трогай ту пружину. Нет, ту тоже.','Хорошая ловушка молчит до последнего.','Подписываю каждую — чтобы знали, чья работа.'],'Тёмная лавка':['Ты меня не видел. Я тебя тоже.','Цена включает моё молчание.','Откуда товар? Из ниоткуда.']};
 const mt=(m,it)=>m&&(!m.cat||m.cat.test(it.cat||''))&&(!m.sub||m.sub.test(it.sub||''));
 Object.entries(X).forEach(([n,cfg],i)=>{const ex=new Set(cfg.extra||[]);const g=it=>mt(cfg.match,it)||ex.has(it.n);const k=Object.keys(TY).find(k=>TY[k].n===n||(n.includes('/')&&n.split('/').some(p=>TY[k].n===p)));
  if(k){const f0=TY[k].f;TY[k].f=it=>f0(it)||g(it)}else{const key='x'+i;TY[key]={n,i:ICO[n]||'✦',who:WHO[n]||'Торговец',f:g,ph:PH[n]||['Смотри, но руками не трогай.','Редкий товар — редкая цена.','Только для своих.']}}})})();
const TOWN=[['village','Деревня',.6],['town','Город',1],['city','Столица',1.6]];
const WEALTH=[['Бедная',.9,1],['Средняя',1,2],['Богатая',1.15,3]];
const NAMES=['Аларик','Бруна','Ведомир','Гуннар','Дарина','Ефим','Злата','Ивар','Корвин','Лада','Мирон','Нора','Остап','Пелагея','Ратибор','Северина','Тарас','Ульяна','Фрол','Харальд','Эльга','Ярина','Бренн Каменная Рука','Мило Медовик','Ильфиэль','Акта','Дренч','Сорша','Вилхельм Сажа','Голуба','Добрыня Кожемяка','Ингрид Рыжая','Квинт','Мара Шёпот','Никодим','Олав Солёный','Прасковья','Рурик','Тильда Узелок','Фенвик','Цветана','Эрих Ворон','Юлиана','Ясень','Барнаби Финк','Орсолья','Тумм Зелёный Палец','Гризельда'];
const TRAIT=['ворчливый, но честный','льстивый и хитрый','рассеянный учёный','весёлый болтун','подозрительный ко всем','мечтательный романтик','жадный до мелочей','щедрый, если польстить','молчаливый великан','нервный, всё время озирается','набожный и строгий','азартный спорщик'];
let SH=LS.get('shops',null);const sv=()=>LS.set('shops',SH);
const dayNo=()=>{try{const c=LS.get('camp',{});return (c.year||0)*372+(c.month||0)*31+(c.day||1)}catch(e){return 0}};
function genStock(s){const T=TY[s.type],town=TOWN.find(x=>x[0]===s.town)||TOWN[1],W=WEALTH[s.wealth]||WEALTH[1];const n=Math.round(12*town[2]*(T.size||1));const cap=W[2]-(s.town==='village'?1:0)+(s.town==='city'?1:0);
 let pool=T.f?I().filter(it=>T.f(it)&&base(it)>0&&(it.cat!=='Магические'||RANK.indexOf(it.rar)<=Math.max(0,cap-1))&&!it.art):[];const out=[];
 const used=new Set();for(let i=0;i<n*3&&out.length<n&&pool.length;i++){const it=pk(pool);if(used.has(it.id))continue;if(it.cat==='Магические'&&Math.random()>.55)continue;used.add(it.id);out.push({k:uid(),item:it.id,q:it.cat==='Магические'?1:rnd(1,it.cat==='Снаряжение'?6:3),unid:it.cat==='Магические'&&Math.random()<(T.unid||0)?1:0})}
 (T.custom||[]).forEach(([n,p])=>out.push({k:uid(),n,p,q:99,svc:1}));return out}
function mk(type,town='town',wealth=1){const T=TY[type];const usedN=new Set((typeof SH!=='undefined'&&SH||[]).map(x=>x.merch&&x.merch.n)),freeN=NAMES.filter(x=>!usedN.has(x)),usedT=new Set((typeof SH!=='undefined'&&SH||[]).map(x=>x.merch&&x.merch.trait));const m={n:pk(freeN.length?freeN:NAMES),trait:pk(TRAIT.filter(x=>!usedT.has(x)).concat(TRAIT.length?[]:[])||TRAIT)||pk(TRAIT),who:T.who,id:uid()};const s={id:uid(),type,town,wealth,name:`${T.n} «${pk(['Медный','Старый','Золотой','Кривой','Синий','Северный','Серебряный','Дубовый'])} ${pk(['Котёл','Ключ','Молот','Ворон','Фонарь','Рог','Щит','Колокол'])}»`,merch:m,mk:T.mk||1,buy:T.buy||.5,hag:0,stock:[],day:dayNo(),shared:false};s.stock=genStock(s);return s}
if(!SH){SH=[mk('gen'),mk('smith'),mk('alch'),mk('inn')];sv()}
const itemOf=x=>x.item?I().find(i=>i.id===x.item):null;
const priceOf=(s,x)=>{const it=itemOf(x);const b=x.p!=null?x.p:base(it);const W=WEALTH[s.wealth]||WEALTH[1];return Math.max(.01,b*(s.mk||1)*W[1]*(1-(s.hag||0)))};
const nameOf=(x,safe)=>{const it=itemOf(x);if(x.unid&&safe)return `Неопознанный предмет${it&&it.sub?' ('+String(it.sub).toLowerCase()+')':''}`;return x.n||(it?it.n:'?')};
function restock(s){if(!(s.stock||[]).length&&(window.DATA.items||[]).length){s.stock=genStock(s);s.day=dayNo()}const d=dayNo(),gap=d-(s.day||d);if(gap>=7){const k=Math.min(1,gap/21);const keep=s.stock.filter(x=>x.svc||x.own||Math.random()>k*.6);const fresh=genStock(s).filter(x=>!x.svc&&!keep.some(y=>y.item===x.item)).slice(0,Math.max(0,Math.round(12*k)));s.stock=keep.concat(fresh);s.day=d;s.hag=0;sv();return true}return false}
/* --- монеты --- */
const CP={пм:1000,зм:100,эм:50,см:10,мм:1};
const total=c=>Object.keys(CP).reduce((a,k)=>a+(+(c||{})[k]||0)*CP[k],0);
function pay(p,g){p.coins=p.coins||{мм:0,см:0,эм:0,зм:0,пм:0};const need=Math.round(g*100);let t=total(p.coins);if(t<need)return false;t-=need;const pm=Math.min(p.coins.пм||0,Math.floor(t/1000));t-=pm*1000;p.coins={пм:pm,зм:Math.floor(t/100),эм:0,см:Math.floor(t%100/10),мм:t%10};p.gold=p.coins.зм;return true}
function earn(p,g){p.coins=p.coins||{мм:0,см:0,эм:0,зм:0,пм:0};let c=Math.round(g*100);p.coins.зм=(+p.coins.зм||0)+Math.floor(c/100);c%=100;p.coins.см=(+p.coins.см||0)+Math.floor(c/10);p.coins.мм=(+p.coins.мм||0)+c%10;p.gold=p.coins.зм}
const purse=p=>{const c=p.coins||{};return fmt(total(c)/100)};
/* --- покупка/продажа --- */
function buy(s,x,p,q=1){const pr=priceOf(s,x)*q;if(!pay(p,pr)){toast(`${p.name}: не хватает (${purse(p)})`);return false}
 const it=itemOf(x);p.inv=p.inv||[];if(x.svc){KM.logS&&KM.logS(`${p.name} оплатил: ${x.n} (${fmt(pr)})`)}else if(it){const ex=!x.unid&&p.inv.find(y=>y.item===it.id&&!y.unid);if(ex)ex.q+=q;else p.inv.push({id:uid(),item:it.id,n:it.n,q,w:it.w||0,...(x.unid?{unid:1}:{})})}else p.inv.push({id:uid(),n:x.n,q,w:0});
 if(!x.svc){x.q-=q;if(x.q<=0)s.stock=s.stock.filter(y=>y!==x)}save();sv();KM.logS&&KM.logS(`${p.name} купил «${nameOf(x)}»${q>1?' ×'+q:''} за ${fmt(pr)} в «${s.name}»`);toast(`${p.name}: «${nameOf(x)}» за ${fmt(pr)}`);return true}
function sell(s,p,invId,q=1){const y=(p.inv||[]).find(z=>z.id===invId);if(!y)return;const it=y.item?I().find(i=>i.id===y.item):null;const g=Math.max(.01,base(it)||(y.p||0))*(s.buy||.5)*q;earn(p,g);y.q-=q;if(y.q<=0)p.inv=p.inv.filter(z=>z!==y);
 const ex=s.stock.find(z=>z.item&&z.item===y.item);if(ex)ex.q+=q;else s.stock.push({k:uid(),item:y.item,n:y.item?undefined:y.n,p:y.item?undefined:(y.p||1),q,unid:y.unid?1:0});save();sv();KM.logS&&KM.logS(`${p.name} продал «${y.n}» за ${fmt(g)}`);toast(`+${fmt(g)} → ${p.name}`)}
/* --- торг --- */
function haggleUI(s,r){const dc=10+s.wealth*3+(/жадн|подозр|строг/.test(s.merch.trait)?2:0)-(/щедр|весёл|болтун/.test(s.merch.trait)?2:0);
 openSheet(`<div class="sb-title">Торг с ${esc(s.merch.n)}</div><div class="sb-sub">${esc(s.merch.trait)} · СЛ Убеждения ${dc}</div><p class="muted">Игрок бросает к20 + Убеждение (или Обман/Запугивание — на твой вкус). Введи итог:</p><input class="inp" id="hgv" type="number" inputmode="numeric" placeholder="Итог броска" style="font-size:28px;text-align:center"><div class="row" style="margin-top:10px"><button class="btn red grow" id="hgo">Торговаться</button></div><p class="muted" style="font-size:12px;margin-top:8px">≥СЛ: −10% · ≥СЛ+5: −20% · ≤СЛ−5: торговец обиделся, +10% до следующего завоза.</p>`,q=>{q.querySelector('#hgo').onclick=()=>{const v=+q.querySelector('#hgv').value;if(!v)return;let h,t;if(v>=dc+5){h=.2;t=`«${pk(['Грабёж средь бела дня! Ладно, ладно…','Вы меня разорите. Двадцать процентов, и ни медяком больше.'])}» — скидка 20%`}else if(v>=dc){h=.1;t=`«${pk(['Хм. Для постоянных клиентов — десять процентов.','Только ради вашей улыбки.'])}» — скидка 10%`}else if(v<=dc-5){h=-.1;t=`«${pk(['Вон из моей лавки! …Ладно, но теперь дороже.','Оскорбляете? Цены выросли.'])}» — наценка 10%`}else{h=0;t=`«${pk(['Нет. Цена окончательная.','Хорошая попытка.'])}» — без изменений`}s.hag=h;sv();KM.logS&&KM.logS(`Торг в «${s.name}»: ${v} против СЛ ${dc} → ${h>0?'−'+h*100+'%':h<0?'+10%':'без изменений'}`);toast(t);closeSheet();setTimeout(()=>open(s.id),250)}})}
/* --- представление для игроков --- */
function view(){const s=SH.find(x=>x.shared);if(!s)return null;return{id:s.id,n:s.name,ty:TY[s.type].n,i:TY[s.type].i,m:{n:s.merch.n,t:s.merch.trait,ph:pk(TY[s.type].ph)},hag:s.hag||0,items:s.stock.map(x=>{const it=itemOf(x);const safe=!x.unid&&it;return{k:x.k,n:nameOf(x,true),p:Math.round(priceOf(s,x)*100)/100,q:x.svc?null:x.q,cat:it?it.cat:(x.svc?'Услуга':'Товар'),rar:x.unid?'?':(it&&it.rar)||'',item:safe?it.id:null,unid:x.unid?1:0}})}}
function onBuy(k,h,d,P){const s=SH.find(x=>x.id===d.shop&&x.shared);const x=s&&s.stock.find(y=>y.k===d.k);if(!x)return null;const q=Math.max(1,Math.min(+d.q||1,x.svc?99:x.q));const pr=priceOf(s,x)*q;return{shop:s.id,k:x.k,q,n:nameOf(x,true),real:nameOf(x),price:pr,pf:fmt(pr),sn:s.name,warn:total(h.coins)<pr*100?'не хватает денег ('+purse(h)+')':''}}
function applyBuy(h,v){const s=SH.find(x=>x.id===v.shop);const x=s&&s.stock.find(y=>y.k===v.k);if(!x){toast('Товар уже продан');return}buy(s,x,h,v.q)}
/* --- интерфейс --- */
const sig=s=>{try{return npcSigil({id:s.merch.id||s.id,n:s.merch.n},46)}catch(e){return `<b class="shp-av">${esc(s.merch.n[0])}</b>`}};
function list(){SH.forEach(restock);openSheet(`<div class="sb-title" data-noshow>Лавки и торговцы</div><div class="sb-sub">Тап — открыть лавку · ◉ — витрина видна игрокам</div><div class="list" style="margin-top:12px">${SH.map(s=>`<button class="card shp-c" data-sh="${s.id}"><span class="shp-i">${TY[s.type].i}</span><div class="grow"><div class="t">${esc(s.name)}${s.shared?' <small class="shp-live">◉ игрокам</small>':''}</div><div class="m">${esc(s.merch.n)} — ${esc(s.merch.trait)} · ${s.stock.length} поз.</div></div></button>`).join('')}</div><div class="sec-h">Новая лавка</div><div class="shp-new">${Object.entries(TY).map(([k,t])=>`<button class="chip" data-new="${k}">${t.i} ${t.n}</button>`).join('')}</div>`,r=>{r.onclick=e=>{const a=e.target.closest('[data-sh]');if(a)return open(a.dataset.sh);const n=e.target.closest('[data-new]');if(n){const s=mk(n.dataset.new);if(!(s.stock||[]).length)s.stock=genStock(s);SH.unshift(s);sv();toast('Открыта: '+s.name);open(s.id)}}})}
let filt='';
function open(id){const s=SH.find(x=>x.id===id);if(!s)return list();restock(s);const T=TY[s.type];const tw=TOWN.find(x=>x[0]===s.town)||TOWN[1];
 const rows=s.stock.filter(x=>!filt||nameOf(x).toLowerCase().includes(filt)).map(x=>{const it=itemOf(x);return`<div class="card shp-row" data-inf="${x.k}" style="cursor:pointer"><div class="grow"><div class="t">${esc(nameOf(x))}${x.unid?' <small class="shp-un">не опознан</small>':''}</div><div class="m">${it?esc(it.cat)+(it.rar&&it.rar!=='Обычный'?' · '+esc(it.rar):''):x.svc?'услуга':'товар'}${x.svc?'':' · ×'+x.q}</div></div><b class="price">${fmt(priceOf(s,x))}</b><button class="btn sm red" data-b="${x.k}">Купить</button><button class="btn sm shp-x" data-del="${x.k}" aria-label="Убрать">✕</button></div>`}).join('');
 openSheet(`<div class="shp-hd">${sig(s)}<div class="grow"><div class="sb-title" style="margin:0" id="shn">${esc(s.name)}</div><div class="sb-sub">${T.i} ${T.n} · ${esc(s.merch.n)}, ${esc(s.merch.trait)}</div></div></div>
 <div class="shp-say">«${esc(pk(T.ph))}»</div>
 <div class="row shp-tools"><button class="btn sm ${s.shared?'ac':''}" id="shs">${s.shared?'◉ Видно игрокам':'◌ Показать игрокам'}</button><button class="btn sm" id="shh">🎲 Торг${s.hag?` (${s.hag>0?'−':'+'}${Math.abs(s.hag*100)}%)`:''}</button><button class="btn sm" id="shsl">⇄ Продать</button><button class="btn sm" id="shr">⟳ Завоз</button></div>
 <div class="shp-o"><span>Место:</span>${TOWN.map(([k,n])=>`<button class="chip ${s.town===k?'on':''}" data-tw="${k}">${n}</button>`).join('')}</div>
 <div class="shp-o"><span>Достаток:</span>${WEALTH.map((w,i)=>`<button class="chip ${s.wealth===i?'on':''}" data-wl="${i}">${w[0]}</button>`).join('')}</div>
 <input class="inp" id="shf" placeholder="Поиск в лавке…" value="${esc(filt)}" style="margin:8px 0">
 <div class="list" data-nolist>${rows||'<p class="muted">Пусто. Нажми «Завоз».</p>'}</div>
 <div class="row" style="margin-top:10px"><button class="btn sm grow" id="sha">＋ Предмет из книги</button><button class="btn sm grow" id="shc">＋ Свой товар</button></div>
 <div class="row" style="margin-top:6px"><button class="btn sm grow" id="shn2">✎ Переименовать</button><button class="btn sm grow" id="shm">↻ Новый торговец</button><button class="btn sm dark" id="shd">Закрыть лавку</button></div>
 <button class="btn sm" id="shb" style="width:100%;margin-top:6px">← Все лавки</button>`,r=>{
 const re=()=>open(id);
 r.querySelector('#shf').oninput=e=>{filt=e.target.value.trim().toLowerCase();clearTimeout(r._t);r._t=setTimeout(()=>{re();setTimeout(()=>{const f=document.getElementById('shf');if(f){f.focus();f.setSelectionRange(f.value.length,f.value.length)}},30)},350)};
 r.onclick=e=>{const t=e.target;const g=(q)=>t.closest(q);
  if(g('#shb'))return list();
  if(g('#shs')){const on=!s.shared;SH.forEach(x=>x.shared=false);s.shared=on;sv();KM.table&&KM.table.push&&KM.table.push(true);toast(on?'Витрина у игроков':'Витрина скрыта');return re()}
  if(g('#shh'))return haggleUI(s);
  if(g('#shr')){s.stock=genStock(s);s.day=dayNo();s.hag=0;sv();toast('Новый завоз');return re()}
  if(g('#shsl'))return sellUI(s);
  if(g('[data-tw]')){s.town=g('[data-tw]').dataset.tw;s.stock=genStock(s);sv();return re()}
  if(g('[data-wl]')){s.wealth=+g('[data-wl]').dataset.wl;s.stock=genStock(s);sv();return re()}
  if(g('#shn2')){const n=prompt('Название лавки',s.name);if(n){s.name=n.trim();sv();re()}return}
  if(g('#shm')){s.merch={n:pk(NAMES),trait:pk(TRAIT),id:uid()};sv();return re()}
  if(g('#shd')){if(!confirm('Закрыть лавку «'+s.name+'»?'))return;const i=SH.indexOf(s);SH.splice(i,1);sv();KM.undoToast?KM.undoToast('Лавка закрыта',()=>{SH.splice(i,0,s);sv()}):0;return list()}
  if(g('#shc')){const n=prompt('Название товара или услуги');if(!n)return;const p=parseFloat(String(prompt('Цена в зм (0.1 = 1 см)','1')).replace(',','.'));if(!(p>0))return;s.stock.unshift({k:uid(),n:n.trim(),p,q:+prompt('Количество','1')||1});sv();return re()}
  if(g('#sha'))return addUI(s);
  const d=g('[data-del]');if(d){const x=s.stock.find(y=>y.k===d.dataset.del);s.stock=s.stock.filter(y=>y!==x);sv();KM.undoToast&&KM.undoToast('Убрано: '+nameOf(x),()=>{s.stock.push(x);sv();re()});return re()}
  const b=g('[data-b]');if(b){const x=s.stock.find(y=>y.k===b.dataset.b);return whoUI(s,x)}
  const inf=g('[data-inf]');if(inf){const x=s.stock.find(y=>y.k===inf.dataset.inf);return infoUI(s,x)}}})}
function sp0(){const P=sp0.el();return P?P.scrollTop:0}sp0.el=()=>document.getElementById('sheetPage');
function infoUI(s,x){const it=itemOf(x);const R=it&&it.rar||'';const sig=['✶','⚜','☽','✠','❂','♆','⚔','✦'][(nameOf(x).length)%8];
 const F=(k,v)=>v?`<div><b>${k}</b>${esc(String(v))}</div>`:'';
 const sy=infoUI.y!=null&&infoUI.s===s?infoUI.y:sp0();infoUI.s=s;infoUI.y=sy;
 openSheet(`<div class="sb-title">${esc(nameOf(x))}</div><div class="sb-sub">${it?esc(it.sub||it.cat||''):x.svc?'услуга':'товар'}${R&&R!=='Обычный'?' · '+esc(R.toLowerCase()):''}${it&&it.att?' · требует настройки':''}${x.unid?' · игроки видят: «'+esc(nameOf(x,true))+'»':''}</div>${typeof glyphs==='function'?glyphs(3):''}
 <div class="sp-grid"><div><b>Цена здесь</b>${fmt(priceOf(s,x))}</div>${it?F('Базовая цена',it.cost):''}${F('В наличии',x.svc?'':'×'+x.q)}${it?F('Вес',it.w?it.w+' кг':'')+F('Урон',it.dmg)+F('Класс доспеха',it.acv)+F('Редкость',R)+F('Заряды',it.ch||it.charges)+(it.prop?`<div style="grid-column:1/-1"><b>Свойства</b>${esc(it.prop)}</div>`:''):''}</div>
 ${it&&(it.ds||it.d)?`<div class="redline"></div><div class="desc dropcap">${esc(it.ds||it.d)}</div>`:''}${it&&it.mech?`<p class="muted" style="font-size:13px">${esc(it.mech)}</p>`:''}
 <div class="row" style="margin-top:12px;flex-wrap:wrap;gap:6px"><button class="btn red grow" id="ibuy">Продать герою</button><button class="btn grow" id="ishow">📣 Показать игрокам</button></div>
 <div class="row" style="margin-top:6px;flex-wrap:wrap;gap:6px"><button class="btn sm" id="ipr">Цена…</button><button class="btn sm" id="iun">${x.unid?'✓ Опознан':'? Неопознан'}</button><button class="btn sm" id="iback">← В лавку</button></div>`,r=>{const back=()=>{infoUI.y=null;open(s.id);const P=sp0.el();if(P)P.scrollTop=sy;requestAnimationFrame(()=>{if(P)P.scrollTop=sy})};window.KM_sheetRet=back;r.onclick=e=>{const g=q=>e.target.closest(q);if(g('#iback'))return back();if(g('#ibuy'))return whoUI(s,x);if(g('#ishow')){KM.showPlayers&&KM.showPlayers({i:'🛒',n:nameOf(x,true),t:(x.unid?'Неопознанный предмет':(it&&(it.ds||it.d)||''))+'\nЦена: '+fmt(priceOf(s,x))});return}if(g('#iun')){x.unid=x.unid?0:1;sv();return infoUI(s,x)}if(g('#ipr')){const p=parseFloat(String(prompt('Базовая цена в зм',x.p!=null?x.p:base(it))).replace(',','.'));if(p>0){x.p=p;sv()}return infoUI(s,x)}}})}
function whoUI(s,x){openSheet(`<div class="sb-title">Кто покупает?</div><div class="sb-sub">${esc(nameOf(x))} · ${fmt(priceOf(s,x))}</div><div class="list" style="margin-top:12px">${players.map((p,i)=>`<button class="card" data-pi="${i}"><div class="grow"><div class="t">${esc(p.name)}</div><div class="m">кошелёк: ${purse(p)}</div></div>${total(p.coins)<priceOf(s,x)*100?'<small class="shp-un">мало</small>':''}</button>`).join('')||'<p class="muted">Нет героев.</p>'}</div>`,r=>{r.onclick=e=>{const b=e.target.closest('[data-pi]');if(!b)return;if(buy(s,x,players[+b.dataset.pi],1))open(s.id)}})}
function sellUI(s){openSheet(`<div class="sb-title">Продать в «${esc(s.name)}»</div><div class="sb-sub">Торговец платит ${Math.round((s.buy||.5)*100)}% цены</div>${players.map((p,pi)=>`<div class="sec-h">${esc(p.name)} · ${purse(p)}</div><div class="list">${(p.inv||[]).map(y=>{const it=y.item?I().find(i=>i.id===y.item):null;const g=Math.max(.01,base(it))*(s.buy||.5);return`<button class="card" data-sp="${pi}" data-si="${y.id}"><div class="grow"><div class="t">${esc(y.n)}${y.q>1?' ×'+y.q:''}</div></div><b class="price">${base(it)?fmt(g):'—'}</b></button>`}).join('')||'<p class="muted">Пусто</p>'}</div>`).join('')}`,r=>{r.onclick=e=>{const b=e.target.closest('[data-si]');if(!b)return;sell(s,players[+b.dataset.sp],b.dataset.si);sellUI(s)}})}
function addUI(s){openSheet(`<div class="sb-title">Добавить в «${esc(s.name)}»</div><input class="inp" id="adq" placeholder="Название предмета…" style="margin:10px 0"><div class="list" id="adl"></div>`,r=>{const q=r.querySelector('#adq'),L=r.querySelector('#adl');const go=()=>{const v=q.value.trim().toLowerCase();L.innerHTML=v.length<2?'<p class="muted">Начни вводить название</p>':I().filter(i=>i.n.toLowerCase().includes(v)).slice(0,25).map(i=>`<button class="card" data-ad="${i.id}"><div class="grow"><div class="t">${esc(i.n)}</div><div class="m">${esc(i.cat)} · ${esc(i.rar||'')}</div></div><b class="price">${fmt(base(i)||0)}</b></button>`).join('')};q.oninput=go;go();setTimeout(()=>q.focus(),300);
 L.onclick=e=>{const b=e.target.closest('[data-ad]');if(!b)return;const it=I().find(i=>i.id===b.dataset.ad);const ex=s.stock.find(y=>y.item===it.id);if(ex)ex.q++;else s.stock.unshift({k:uid(),item:it.id,q:1,...(base(it)?{}:{p:50})});sv();toast('В лавке: '+it.n)}})}
function identifyUI(){const L=[];players.forEach((p,pi)=>(p.inv||[]).forEach(y=>{if(y.unid)L.push([pi,y])}));openSheet(`<div class="sb-title">Опознание предметов</div><div class="sb-sub">Игроки видят их как «неопознанный предмет»</div><div class="list" style="margin-top:12px">${L.map(([pi,y])=>`<button class="card" data-id="${pi}|${y.id}"><div class="grow"><div class="t">${esc(y.n)}</div><div class="m">${esc(players[pi].name)}</div></div><span class="btn sm">Опознать</span></button>`).join('')||'<p class="muted">Нет неопознанных предметов.</p>'}</div>`,r=>{r.onclick=e=>{const b=e.target.closest('[data-id]');if(!b)return;const [pi,id]=b.dataset.id.split('|');const y=players[+pi].inv.find(z=>z.id===id);if(y){delete y.unid;save();KM.table&&KM.table.push&&KM.table.push(true);toast('Опознано: '+y.n)}identifyUI()}})}
function embed(B){B.innerHTML=`<div class="list">${SH.map(s=>`<button class="card shp-c" data-sh="${s.id}"><span class="shp-i">${TY[s.type].i}</span><div class="grow"><div class="t">${esc(s.name)}${s.shared?' <small class="shp-live">◉ игрокам</small>':''}</div><div class="m">${esc(s.merch.n)} · ${s.stock.length} поз.</div></div></button>`).join('')}</div><div class="row" style="margin-top:8px"><button class="btn sm grow" id="shall">Все лавки и новые</button><button class="btn sm grow" id="shid">? Опознание</button></div>`;B.onclick=e=>{const a=e.target.closest('[data-sh]');if(a)return open(a.dataset.sh);if(e.target.closest('#shall'))return list();if(e.target.closest('#shid'))return identifyUI()}}
KM.shops={list,open,view,onBuy,applyBuy,embed,identifyUI,base,fmt,all:()=>SH,mk,buy,sell,pay,total};
}

;
/* improv.js */
'use strict';{
/* ===== Импровизатор: мгновенные столы для Мастера ===== */
const pk=a=>a[Math.random()*a.length|0],d=n=>1+(Math.random()*n|0);
const NM={
 'Человек':{м:['Аларик','Бран','Ведомир','Горан','Дарий','Евсей','Жерар','Ивар','Корвин','Лука','Мирон','Остап','Ратибор','Савва','Тарас','Феликс'],ж:['Агата','Белла','Велена','Дарина','Ева','Злата','Ирма','Ксения','Лада','Мирра','Нора','Оксана','Рада','Северина','Таисия','Ульяна'],ф:['Ковальский','Черноус','Медведь','Сорокин','Брод','Молотов','Тихий','Рыжов','Камнелом','Вереск']},
 'Эльф':{м:['Аэлар','Галинндан','Ивеллиос','Лоринель','Мелиамне','Сариэль','Тирон','Эрдан'],ж:['Адри','Бетринна','Ильфиэль','Кейлет','Лиа','Найвара','Сариэль','Шанайра'],ф:['Звездолист','Тихая Роса','Серебряный Ручей','Лунный Шёпот','Ясень']},
 'Дварф':{м:['Барендд','Бруенор','Даин','Торин','Гримм','Харбек','Ульфгар','Вондал'],ж:['Амбер','Бардрин','Гуннлода','Хлин','Ильде','Рисвин','Торбера','Эльдет'],ф:['Железнобородый','Каменная Рука','Глубокоруд','Молотобой','Пепельный Горн']},
 'Полурослик':{м:['Альтон','Корин','Гаррет','Линдал','Мило','Осборн','Перрин','Роско'],ж:['Андри','Кэлли','Кора','Лиди','Мерла','Нэдди','Серафина','Верна'],ф:['Чайный Лист','Тёплый Очаг','Подхолмов','Медовик','Быстроног']},
 'Орк':{м:['Грумш','Дренч','Хольг','Краск','Мург','Рендар','Шамп','Ург'],ж:['Баггі','Эмен','Энгонг','Кансиф','Мива','Нега','Ованка','Шаутха'],ф:['Разбитый Клык','Кровавый Глаз','Сын Бури','Громобой','Пепельная Шкура']},
 'Тифлинг':{м:['Акменос','Дамакос','Экемон','Кайрон','Леукис','Мордай','Скамос'],ж:['Акта','Бриселия','Крила','Дамайя','Эа','Каллиста','Лерисса','Немея'],ф:['Надежда','Песнь','Тоска','Отвага','Пепел','Безмолвие']}};
const TV={a:['Пьяный','Хромой','Золотой','Ржавый','Танцующий','Спящий','Одноглазый','Весёлый','Сломанный','Седьмой','Болотный','Поющий'],b:['Грифон','Бочонок','Котёл','Тролль','Ворон','Кабан','Фонарь','Якорь','Меч','Гусь','Дракон','Подкова'],f:['пол засыпан опилками, у камина спит огромный пёс','на стене — голова мантикоры, хозяин клянётся, что сам её добыл','по вечерам играет слепой лютнист, который знает все слухи','над стойкой висит долговая доска с именами местных','половина зала — игорный стол, где режутся в кости на ставку','в подвале, говорят, есть дверь, которую никто не открывал','хозяйка — отставной наёмник, у стойки лежит алебарда','здесь собираются возчики; лучшее место, чтобы найти попутчиков'],
 food:[['Похлёбка с перловкой и хлеб','4 мм'],['Жареная форель с луком','1 см'],['Пирог с бараниной','8 мм'],['Каша с салом','3 мм'],['Кабанья нога на компанию','5 см'],['Сыр, яблоки и тёмное пиво','6 мм']],drink:[['Кружка эля','4 мм'],['Сидр','3 мм'],['Медовуха','5 мм'],['Бутылка вина','2 зм'],['Дварфийский «Горн»','1 см']],room:[['Место в общем зале','5 мм'],['Комната на двоих','5 см'],['Лучшая комната с ванной','1 зм']]};
const RU=[['Мельника видели ночью у старого кургана с лопатой.',1],['Говорят, что под храмом есть второй — постарше и пострашнее.',1],['Караваны на северной дороге пропадают — а лошадей потом находят живыми.',1],['Граф тайно продаёт зерно соседям, пока город голодает.',0],['В колодце на площади поселилась русалка; вода теперь сладкая.',0],['Старая ведьма с болот ищет храбрецов и платит золотом.',1],['Кузнец выковал меч, который ночью звенит сам по себе.',1],['Стражники берут взятки молоком — дескать, для котов капитана.',0],['Через три дня будет затмение, и мёртвые выйдут из земли.',0],['Младшая дочь бургомистра сбежала с бродячим цирком.',1],['На маяке опять зажгли огонь — хотя смотритель умер год назад.',1],['Гномы с ярмарки продают карты к сокровищам — все одинаковые.',1],['В лесу видели белого оленя; кто его поймает, исполнит желание.',0],['Новый жрец не отбрасывает тени.',1],['Монеты, отчеканенные в этом году, тают в руке при полной луне.',0],['Пропавший купец вернулся — но не узнаёт собственную жену.',1]];
const HK=['Кто-то оставил героям записку: «Не доверяйте старосте. Приходите к мосту ночью».','Умирающий гонец суёт в руки запечатанный свиток и просит доставить его — до заката.','Местный ребёнок предлагает медный амулет в обмен на поиски пропавшего брата.','Объявление на доске: «Изгнать нечто из подвала винокурни. Оплата — бочка лучшего».','В городе объявлен турнир, и главный приз — старая карта с отметкой на болотах.','Шайка грабителей нечаянно украла у героев то, что принадлежит кому-то опасному.','Жрица просит сопроводить реликвию в соседний храм; по пути за ней охотятся.','Таинственный покровитель платит за то, чтобы герои просто провели ночь в заброшенной усадьбе.','Мост рухнул, и единственный путь лежит через старые шахты.','Дракон требует дань с деревни. Староста предлагает героям выбор: заплатить или драться.','Учёный ищет охрану для экспедиции к «падшей звезде».','Героев по ошибке принимают за знаменитых наёмников — и предлагают контракт.'];
const TW=['Подкрепление: прибегают ещё 1к4 врага.','Свидетель: невинный оказывается в гуще событий.','Огонь! Что-то загорается, и пламя распространяется.','Предательство: союзник раскрывает свои истинные мотивы.','Обвал или ловушка перекрывают путь назад.','Погода резко портится (смотри погоду).','Враг сдаётся и предлагает сделку.','Цель оказывается не тем, кем казалась.','Время ограничено: у героев есть 3 раунда/10 минут.','Появляется третья сторона, враждебная всем.','Потерянная вещь героя находится у противника.','Магия выходит из-под контроля: дикий всплеск.'];
const NPCF={look:['шрам через бровь','золотой зуб','татуировки на руках','слишком дорогая одежда','глаза разного цвета','безупречно чистые перчатки','повязка на глазу','вечно мокрые волосы','бородавка на носу','огромная шляпа с пером'],how:['говорит шёпотом','постоянно жуёт','перебивает','шутит невпопад','заикается, когда врёт','цитирует священные тексты','считает всё вслух','никогда не смотрит в глаза','называет всех «голубчик»','напевает себе под нос'],want:['вернуть долг','отомстить соседу','уехать из города','защитить дочь','найти древнюю книгу','стать старостой','разбогатеть быстро','загладить старую вину'],sec:['состоит в культе','должен опасным людям','на самом деле дворянин в изгнании','шпионит для графа','видел убийство и молчит','оборотень, сам того не зная','подделывает монеты','влюблён в героя']};
const RD=[['У меня есть города, но нет домов; леса, но нет деревьев; вода, но нет рыбы.','Карта'],['Чем больше из меня берёшь, тем больше я становлюсь.','Яма'],['Я всегда впереди, но меня не видно.','Будущее'],['Говорю без рта, слышу без ушей, оживаю с ветром.','Эхо'],['Меня ломают, даже не касаясь — одним словом.','Обещание (или тишина)'],['Чем больше сохнет, тем мокрее становится.','Полотенце'],['Есть у меня ключи, но не открою ни одной двери.','Клавесин (или карта)'],['Утром на четырёх, днём на двух, вечером на трёх.','Человек'],['Легче пера, но сильнейший не удержит долго.','Дыхание'],['Кто меня делает — продаёт, кто покупает — не использует, кто использует — не знает.','Гроб']];
const TR=[['Скрытая яма с кольями','Восприятие','Ловкость','колющий'],['Отравленная игла в замке','Расследование','Телосложение','яд'],['Падающая решётка','Восприятие','Ловкость','дробящий'],['Огненная руна на двери','Магия','Ловкость','огонь'],['Дротики из стены','Восприятие','Ловкость','колющий'],['Катящийся валун','Восприятие','Ловкость','дробящий'],['Морозная плита пола','Природа','Телосложение','холод'],['Электрическая цепь на сундуке','Расследование','Ловкость','электричество'],['Газ сна из щелей','Восприятие','Телосложение','— сон 1 мин.'],['Сеть с потолка','Восприятие','Сила','— опутан']];
const POCK=['огрызок свечи','игральные кости со свинцом','любовное письмо без подписи','засушенная лапка кролика','ключ от неизвестной двери','кусок карты','деревянный солдатик','флакон дешёвых духов','медальон с портретом','зуб дракона (поддельный)','список долгов','молитвенные чётки','трубка и щепоть табака','тряпичная кукла'];
const TER={'Лес':['зверь','фея','растение','гуманоид','чудовище'],'Подземелье':['нежить','слизь','аберрация','конструкт','чудовище'],'Горы':['великан','дракон','зверь','элементаль','чудовище'],'Болото':['нежить','зверь','растение','дракон'],'Дорога':['гуманоид','зверь','чудовище'],'Город':['гуманоид','исчадие','нежить'],'Руины':['нежить','конструкт','чудовище','аберрация'],'Степь':['зверь','гуманоид','чудовище'],'Море':['зверь','чудовище','элементаль'],'Деревня':['гуманоид','зверь','нежить']};
const XT=()=>{const X=window.TABLES_EXTRA||{};return Object.keys(X).filter(k=>X[k]&&X[k].rows)};const rollD=dd=>{const m=String(dd).match(/(\d*)к(\d+)/);if(!m)return 1;let v=0;for(let i=0;i<(+m[1]||1);i++)v+=1+Math.floor(Math.random()*+m[2]);return v};
const BUD=[0,50,100,150,250,500,600,750,900,1100,1200,1600,2000,2200,2500,2800,3200,3900,4200,4900,5700];
const party=()=>{const p=(KM.players||[]).filter(x=>!x.away);return p.length?p:[{lvl:1},{lvl:1},{lvl:1},{lvl:1}]};
const avgL=()=>{const p=party();return Math.max(1,Math.min(20,Math.round(p.reduce((a,x)=>a+(+x.lvl||1),0)/p.length)))};
function enc(ter){const P=party(),L=avgL(),budget=P.reduce((a,x)=>a+BUD[Math.max(1,Math.min(20,+x.lvl||1))],0);const ty=TER[ter];
 const pool=DATA.monsters.filter(m=>m.xp&&ty.some(t=>(m.ty||'').startsWith(t))&&m.xp<=budget&&m.xp>=budget/12);if(!pool.length)return null;const m=pk(pool);
 let n=1;for(let k=6;k>=1;k--){const mul=k==1?1:k==2?1.5:k<=6?2:2.5;if(m.xp*k*mul<=budget*1.1){n=k;break}}return{m,n,budget,adj:Math.round(m.xp*n*(n==1?1:n==2?1.5:2))}}
let ST={ter:'Лес',race:'Человек'};try{Object.assign(ST,JSON.parse(localStorage['km.imp']||'{}'))}catch(e){}
const sv=()=>localStorage['km.imp']=JSON.stringify(ST);
const K=[['name','✒','Имя'],['npc','☺','Нрав'],['tav','🍺','Таверна'],['rum','👂','Слух'],['hook','⚑','Зацепка'],['enc','⚔','Встреча'],['trap','⚠','Ловушка'],['twist','↯','Поворот'],['riddle','?','Загадка'],['tbl','🎲','Таблицы'],['ho','📜','Раздатка'],['os','📖','Ваншоты'],['camp','🏰','Кампании'],['shop','⚖','Лавки']];
let last=null;
function gen(k){const L=avgL();const tier=L<=4?0:L<=10?1:L<=16?2:3;
 switch(k){
 case'name':{const r=NM[ST.race],s=pk(['м','ж']);const nm=pk(r[s])+' '+pk(r.ф);return{t:nm,s:`${ST.race}, ${s==='м'?'мужчина':'женщина'}`,note:[nm,`${ST.race}. `],opt:'race'}}
 case'npc':{const o=`Внешность: ${pk(NPCF.look)}.\nМанера: ${pk(NPCF.how)}.\nХочет: ${pk(NPCF.want)}.\nТайна: ${pk(NPCF.sec)}.`;return{t:'Характер НИП',b:o,note:['НИП',o]}}
 case'tav':{const X=(window.TABLES_EXTRA||{}).tavern||{};const n=`«${pk(TV.a.concat(X.a||[]))} ${pk(TV.b.concat(X.b||[]))}»`,f=pk(TV.f),fd=pk(TV.food),dr=pk(TV.drink),rm=pk(TV.room);const b=`Особенность: ${f}.\nБлюдо дня: ${fd[0]} — ${fd[1]}.\nНапиток: ${dr[0]} — ${dr[1]}.\nНочлег: ${rm[0]} — ${rm[1]}.`+(X.owner&&X.owner.length?`\nХозяин: ${[].concat(pk(X.owner)).join(' — ')}.`:'');return{t:'Таверна '+n,b,note:['Таверна '+n,b]}}
 case'rum':{const X=window.TABLES_EXTRA;const r=pk(X&&X.rumor?RU.concat(X.rumor):RU);return{t:'Слух',b:r[0],s:r[1]?'Правда (или почти)':'Ложь — но кому-то выгодно, чтобы в неё верили',note:['Слух',r[0]+(r[1]?' (правда)':' (ложь)')]}}
 case'tbl':{const X=window.TABLES_EXTRA||{},ks=XT();if(!ks.length)return{t:'Таблицы',b:'Нет таблиц.'};if(!ks.includes(ST.tbl))ST.tbl=ks[0];const T=X[ST.tbl],v=rollD(T.d),it=T.rows.find(x=>v<=x[0])||T.rows[T.rows.length-1];return{t:T.n,b:it[1],s:`Бросок ${T.d}: ${v}`,note:[T.n,it[1]]}}
 case'hook':{const Q=(window.TABLES_EXTRA||{}).quest;const h=Q&&Math.random()<.5?`${pk(Q.giver)[0].toUpperCase()+pk(Q.giver).slice(1)} просит ${pk(Q.task)} — ${pk(Q.where)}.\nПодвох: ${pk(Q.twist)}.\nНаграда: ${pk(Q.reward)}.`:pk(HK);return{t:'Зацепка',b:h,note:['Зацепка',h]}}
 case'twist':{const h=pk(TW);return{t:'Осложнение',b:h,note:null}}
 case'riddle':{const r=pk(RD);return{t:'Загадка',b:'«'+r[0]+'»',hid:r[1],note:['Загадка',r[0]+'\nОтвет: '+r[1]]}}
 case'pock':{const c=d(6)*(tier+1);return{t:'В карманах',b:`${pk(POCK)}, ${pk(POCK)} и ${c} ${pk(['мм','см','см','зм'])}.`,note:null}}
 case'trap':{const t=pk(TR),dc=[[10,12],[12,15],[15,18],[18,21]][tier],dm=['2к10','4к10','10к10','18к10'][tier],sev=pk(['неудобная','опасная']);const DC=sev==='опасная'?dc[1]:dc[0];
   return{t:t[0],b:`Заметить: ${t[1]} СЛ ${DC}.\nИзбежать: спасбросок ${t[2]} СЛ ${DC}.\nУрон: ${t[3].startsWith('—')?t[3].slice(2):dm+' ('+t[3]+')'}.\nОбезвредить: Ловкость (воровские инструменты) СЛ ${DC}.`,s:`Уровень отряда ${L} · ${sev}`,note:[t[0],'']}}
 case'enc':{const XE=(window.TABLES_EXTRA||{}).enc||{},row=XE[({'Подземелье':'Подземье','Руины':'Руины/Склеп','Степь':'Степь/Равнины','Дорога':'Степь/Равнины'})[ST.ter]||ST.ter];if(row&&(Math.random()<.45||!enc(ST.ter))){const v=d(100),it=row.find(x=>v<=x[0])||row[row.length-1],mo=it[2]&&DATA.monsters.find(m=>m.id===it[2]);return{t:'Встреча (к100: '+v+')',b:it[1]+(mo?`\n${mo.n}: КД ${mo.ac}, хиты ${mo.hp}, ПО ${({0.125:'1/8',0.25:'1/4',0.5:'1/2'})[mo.cr]||mo.cr}.`:''),s:ST.ter+' · таблица встреч местности',note:['Встреча',it[1]],enc:mo?{m:mo,n:1}:null}}const e=enc(ST.ter);if(!e)return{t:'Встреча',b:'Для этой местности и уровня в бестиарии нет подходящих существ.'};const w=Math.random();
   const why=pk(['охотятся','охраняют логово','спорят над добычей','спят после пира','преследуют раненого путника','устроили засаду','заблудились и злы','ищут то же, что и герои']);
   return{t:`${e.n} × ${e.m.n}`,b:`${e.m.ty}, ПО ${({0.125:'1/8',0.25:'1/4',0.5:'1/2'})[e.m.cr]||e.m.cr}, КД ${e.m.ac}, хиты ${e.m.hp}.\nЧто делают: ${why}.\nОпыт с поправкой: ${e.adj} из бюджета ${e.budget} (средняя сложность).`,s:ST.ter+' · уровень '+L,enc:e,opt:'ter',note:[`Встреча: ${e.n} × ${e.m.n}`,why]}}
 }}
function card(k){const g=last=gen(k);const pub=(g.b||'').split('\n').filter(l=>!/СЛ|Опыт|Что делают|бюджет|Обезвредить|Заметить/.test(l)).join('\n');return `<div class="imp-res" data-show-title="${esc(g.t)}" data-show-text="${esc(pub)}"><div class="imp-t">${esc(g.t)}</div>${g.s?`<div class="m">${esc(g.s)}</div>`:''}${g.b?`<p>${esc(g.b).replace(/\n/g,'<br>')}</p>`:''}${g.hid?`<details><summary>Ответ</summary><b>${esc(g.hid)}</b></details>`:''}
 <div class="imp-act"><button class="btn sm" data-re="${k}">↻ Ещё</button>${g.enc?`<button class="btn sm ac" data-fight>⚔ В бой</button><button class="btn sm" data-mon>Статы</button>`:''}${g.note?'<button class="btn sm" data-note>✎ В заметки</button>':''}</div></div>`}
function opts(k){if(k==='name'||k==='race')return`<div class="imp-o">${Object.keys(NM).map(r=>`<button class="chip ${ST.race===r?'on':''}" data-race="${r}">${r}</button>`).join('')}</div>`;if(k==='tbl'){const X=window.TABLES_EXTRA||{};return`<div class="imp-o">${XT().map(r=>`<button class="chip ${ST.tbl===r?'on':''}" data-tbl="${r}">${esc(X[r].n.replace(/\s*\(.*\)$/,''))}</button>`).join('')}</div>`}if(k==='enc')return`<div class="imp-o">${Object.keys(TER).map(r=>`<button class="chip ${ST.ter===r?'on':''}" data-ter="${r}">${r}</button>`).join('')}</div>`;return''}
function show(k){openSheet(`<h3>${K.find(x=>x[0]===k)[2]}</h3>${opts(k)}<div id="impb">${card(k)}</div>`,r=>bind(r,k))}
function bind(r,k){r.onclick=e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.re){r.querySelector('#impb').innerHTML=card(k);KM.fx&&0}
 else if(b.dataset.race){ST.race=b.dataset.race;sv();r.querySelectorAll('[data-race]').forEach(x=>x.classList.toggle('on',x===b));r.querySelector('#impb').innerHTML=card(k)}
 else if(b.dataset.tbl){ST.tbl=b.dataset.tbl;sv();r.querySelectorAll('[data-tbl]').forEach(x=>x.classList.toggle('on',x===b));r.querySelector('#impb').innerHTML=card(k)}
 else if(b.dataset.ter){ST.ter=b.dataset.ter;sv();r.querySelectorAll('[data-ter]').forEach(x=>x.classList.toggle('on',x===b));r.querySelector('#impb').innerHTML=card(k)}
 else if(b.hasAttribute('data-fight')&&last.enc){for(let i=0;i<last.enc.n;i++)KM.combat.addMon(last.enc.m);closeSheet();toast(`В бою: ${last.enc.n} × ${last.enc.m.n}`);KM.go(4)}
 else if(b.hasAttribute('data-mon')&&last.enc){showMon(last.enc.m.id)}
 else if(b.hasAttribute('data-note')&&last.note){const g=last;notes.unshift({id:uid(),title:g.note[0],text:(g.note[1]||g.b||''),tag:k==='name'||k==='npc'?'НИП':k==='tav'?'Место':k==='hook'?'Квест':k==='rum'?'Тайна':'Сцена',t:Date.now()});save();toast('Сохранено в заметки');b.disabled=true;b.textContent='✓ В заметках'}}}
function panel(){if(S.sec!==0)return;let p=document.getElementById('impp');if(p&&p.parentNode===page)return;p=document.createElement('div');p.id='impp';p.className='card imp-p';
 p.innerHTML=`<div class="imp-h"><b>✦ Импровизатор</b><span class="m">игроки ушли не туда? — один тап</span></div><div class="imp-g">${K.map(([k,i,t])=>`<button data-imp="${k}"><i>${i}</i>${t}</button>`).join('')}</div>`;
 p.onclick=e=>{const b=e.target.closest('[data-imp]');if(!b)return;if(b.dataset.imp==='shop')return KM.shops.list();if(b.dataset.imp==='ho')return KM.hoTpl();if(b.dataset.imp==='os')return KM.oneshots();if(b.dataset.imp==='camp')return KM.camps();show(b.dataset.imp)};
 const after=page.querySelector('#nvnow')||page.querySelector(':scope>.ph');after&&after.parentNode===page?after.after(p):page.prepend(p)}
const og=KM.go;KM.go=function(){const r=og.apply(this,arguments);setTimeout(panel,60);return r};
setTimeout(panel,300);new MutationObserver(()=>{if(S.sec===0&&!document.getElementById('impp'))panel()}).observe(page,{childList:true});
KM.imp={gen,show,enc};
}

;
/* hotpl.js */
'use strict';
/* Раздатки по шаблону: выбор шаблона → поля [..] → предпросмотр → сохранить / сразу игрокам */
(()=>{const E=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const fields=t=>[...new Set((t.match(/\[[^\]]+\]/g)||[]).map(x=>x.slice(1,-1)))];
function fill(T,r){let n=T.n,t=T.t;fields(T.n+'\n'+T.t).forEach((f,i)=>{const v=(r.querySelector(`[data-f="${i}"]`)||{}).value||'['+f+']';n=n.split('['+f+']').join(v);t=t.split('['+f+']').join(v)});return{n,t}}
function form(T,done){const F=fields(T.n+'\n'+T.t);openSheet(`<div class="sb-title">${E(T.n)}</div><div class="muted" style="font-size:12.5px">${E(T.k)} · заполните поля, пустые останутся в скобках</div>${F.map((f,i)=>`<label class="f">${E(f)}</label><input class="inp" data-f="${i}" placeholder="${E(f)}">`).join('')}<div class="row" style="margin-top:12px;gap:8px;flex-wrap:wrap"><button class="btn" id="tpP">Предпросмотр</button><button class="btn" id="tpS">Сохранить</button><button class="btn red grow" id="tpG">📣 Сохранить и показать игрокам</button></div>`,r=>{
 r.querySelector('#tpP').onclick=()=>window.KMH&&KMH.open(fill(T,r));
 const save=sh=>{const o=fill(T,r);KM.hoAdd(o.n,o.t,sh);closeSheet();toast(sh?'Раздатка у игроков (вкладка «Мастер»)':'Раздатка сохранена в «Кампания → Раздатки»');done&&done()};
 r.querySelector('#tpS').onclick=()=>save(0);r.querySelector('#tpG').onclick=()=>save(1)})}
KM.hoTpl=done=>{const L=window.HANDOUT_TPL||[];openSheet(`<div class="sb-title">Раздатка по шаблону</div><div class="muted" style="font-size:12.5px">Выберите шаблон — дальше заполните поля</div><div class="list" style="margin-top:8px">${L.map((T,i)=>`<div class="card" data-tp="${i}" data-noshow><div class="grow"><div class="t">${E(T.n)}</div><div class="m">${E(T.k)} · ${E(T.t.split('\n')[0].slice(0,50))}</div></div></div>`).join('')}</div>`,r=>{r.querySelector('.list').onclick=e=>{const c=e.target.closest('[data-tp]');if(c)form(L[+c.dataset.tp],done)}})};
})();

;
/* oneshot.js */
'use strict';
/* «Ваншоты»: 50 готовых завязок (TABLES_EXTRA.oneshot) — фильтр по уровню, случайный, 📣 зацепка игрокам, «Начать» = заметки */
(()=>{const E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const L=()=>((window.TABLES_EXTRA||{}).oneshot||[]);
const lv=o=>{const m=String(o.lvl||'1').match(/\d+/g)||[1];return[+m[0],+(m[1]||m[0])]};
const B=[['','Все'],['1','1–4'],['5','5–10'],['11','11+']];let F=LS.get('osF','');
const fit=o=>{if(!F)return true;const[a,b]=lv(o),lo=+F,hi=F==='1'?4:F==='5'?10:20;return a<=hi&&b>=lo};
function list(){const A=L().map((o,i)=>[o,i]).filter(([o])=>fit(o));openSheet(`<div class="sb-title">Ваншоты</div><div class="muted" style="font-size:12.5px">Готовые приключения на один вечер. Выберите — и нажмите «Начать».</div><div class="chips" style="margin:8px 0">${B.map(([v,t])=>`<button class="chip${F===v?' on':''}" data-osf="${v}">${t}</button>`).join('')}</div><button class="btn red" id="osR" style="width:100%;min-height:48px">🎲 Случайный ваншот</button><div class="list" style="margin-top:10px">${A.map(([o,i])=>`<div class="card" data-os="${i}"><div class="grow"><div class="t">${E(o.n)}</div><div class="m">Уровни ${E(o.lvl)} · ${E(String(o.hook).slice(0,80))}…</div></div></div>`).join('')||'<div class="muted">Нет ваншотов для этих уровней</div>'}</div>`,r=>{r.onclick=e=>{const f=e.target.closest('[data-osf]');if(f){F=f.dataset.osf;LS.set('osF',F);return list()}if(e.target.closest('#osR')){if(A.length)one(A[Math.floor(Math.random()*A.length)][1]);return}const c=e.target.closest('[data-os]');if(c)one(+c.dataset.os)}})}
function one(i){const o=L()[i];if(!o)return;openSheet(`<div class="sb-title" data-noshow>${E(o.n)}</div><div class="muted">Уровни ${E(o.lvl)}</div><h3>Зацепка</h3><p>${E(o.hook)}</p><h3>Сцены</h3><ol>${(o.scenes||[]).map(s=>`<li>${E(s)}</li>`).join('')}</ol><h3>Поворот <small class="muted">(только для Мастера)</small></h3><p>${E(o.twist)}</p><h3>Награда</h3><p>${E(o.reward)}</p><div class="row" style="gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn" id="osB">← Список</button><button class="btn" id="osP">📣 Зацепку игрокам</button><button class="btn" id="osM">🗺 Карта</button><button class="btn red" id="osS" style="width:100%;min-height:50px">▶ Начать: создать заметки</button></div>`,r=>{
 r.querySelector('#osB').onclick=list;r.querySelector('#osM').onclick=()=>KM.osMap&&KM.osMap(o,i);
 r.querySelector('#osP').onclick=()=>KM.showPlayers&&KM.showPlayers({i:'📖',n:o.n,t:o.hook});
 r.querySelector('#osS').onclick=()=>{const t=Date.now(),mk=(title,text,tag,k)=>({id:uid(),title,text,tag,t:t-k});const add=[mk('Ваншот: '+o.n,`Уровни ${o.lvl}\n\nЗацепка: ${o.hook}\n\nНаграда: ${o.reward}`,'Квест',0),...(o.scenes||[]).map((s,k)=>mk(`${o.n} — сцена ${k+1}`,s,'Сцена',k+1)),mk(`${o.n} — поворот (тайна)`,o.twist,'Тайна',9)];const before=notes.slice();notes.unshift(...add);save();closeSheet();KM.undoToast?KM.undoToast(`Создано заметок: ${add.length}`,()=>{notes.length=0;notes.push(...before);save();render()}):toast('Заметки созданы')}})}
KM.oneshots=list;})();

;
/* campaign.js */
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

;
/* premap.js */
'use strict';
/* Заготовленные карты: детерминированная генерация по ключу, лениво, по тапу «Карта» */
(()=>{
const hs=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
function place(m,mons,key){if(!mons||!mons.length)return;const old=(m.tok||[]).filter(t=>t.k==='mon');m.tok=(m.tok||[]).filter(t=>t.k!=='mon');const pc=m.tok.filter(t=>t.k==='pc');const W=m.W;
 const FREE=c=>c&&!['wall','pit','water','lava','tree','cloud','air','rock','door','stairs'].includes(c);const used=new Set(m.tok.map(t=>t.y*W+t.x));(m.links||[]).forEach(l=>used.add(l.y*W+l.x));
 const cand=[];for(let i=0;i<m.g.length;i++){const x=i%W,y=(i/W)|0;if(!FREE(m.g[i])||used.has(i))continue;if(window.KM_SOLID&&KM_SOLID(m,x,y))continue;const d=pc.length?Math.min(...pc.map(p=>Math.hypot(p.x-x,p.y-y))):99;if(d<6)continue;cand.push(i)}
 const pos=old.map(t=>t.y*W+t.x).filter(i=>!used.has(i));let h=hs(key);const pick=()=>{if(pos.length)return pos.shift();if(!cand.length)return -1;h=Math.imul(h^h>>>15,2246822507)>>>0;const k=h%cand.length;return cand.splice(k,1)[0]};
 mons.forEach(([id,n])=>{const mo=D.monsters.find(z=>z.id===id);if(!mo)return;let g0=-1;for(let q=1;q<=n;q++){let i=-1;if(g0>=0){const gx=g0%W,gy=(g0/W)|0;let best=-1,bd=9;cand.forEach((c,k)=>{const d=Math.max(Math.abs(c%W-gx),Math.abs(((c/W)|0)-gy));if(d<bd){bd=d;best=k}});if(best>=0&&bd<=3)i=cand.splice(best,1)[0]}if(i<0)i=pick();if(i<0)return;if(g0<0)g0=i;{const ci=cand.indexOf(i);if(ci>=0)cand.splice(ci,1)}used.add(i);
  m.tok.push({id:uid(),x:i%W,y:(i/W)|0,n:(mo.n[0]+(n>1?q:'')).slice(0,3),c:'#d42a22',k:'mon',mid:mo.id,nm:mo.n+(n>1?' '+q:''),hp:mo.hp,mhp:mo.hp,ac:mo.ac,sz:mo.sz})}})}
function open(key,o){if(typeof maps==='undefined'||!KM.genSet)return toast('Карты недоступны');
 let m=maps.find(x=>x.pre===key);let made=0;
 if(!m){const opt=Object.assign({type:'dungeon',W:24,H:24,dens:50,dang:40,th:'',th2:'',doors:1,traps:1,chests:1,mons:1,fog:1,dec:1,link:1,pcs:1},o||{},{seed:key});let set;
  try{set=KM.genSet(opt,0)}catch(e){console.error(e);return toast('Не получилось: '+e.message)}
  place(set[0],o&&o.mon,key);set.forEach((x,i)=>{delete x._G;x.pre=i?key+'#'+i:key;x.shared=false;maps.push(x)});if(o&&o.name)set[0].name=o.name;m=set[0];made=set.length}
 mapCur=m.id;try{view={s:1,x:0,y:0}}catch(e){}saveMaps();closeSheet();
 const mi=SECTIONS.findIndex(s=>s[0]==='map');const fin=()=>{try{rMap()}catch(e){}toast(made?(made>1?`Карта готова · связанных: ${made}`:'Карта готова'):'Открыта: '+m.name)};
 if(S.sec===mi)fin();else{KM.go(mi);setTimeout(fin,450)}}
KM.preMap=open;
/* тип карты для ваншота по ключевым словам */
const KW=[[/мельниц/,'mill'],[/таверн|трактир|корчм/,'tavern'],[/склеп|крипт/,'crypt'],[/гробниц|курган|пирамид/,'tomb'],[/катакомб/,'catacombs'],[/канализ|сток/,'sewer'],[/тюрьм|темниц/,'prison'],[/культ|секта|алтар/,'cult'],[/некромант/,'necro'],[/алхими|лаборатор/,'lab'],[/вампир/,'vampire'],[/дракон/,'dragon'],[/паук|паутин/,'spider'],[/слиз/,'slime'],[/ледян|лёд|мороз|снег/,'icecave'],[/вулкан|лава/,'volcano'],[/шахт|рудник/,'mine'],[/грот|подводн/,'grotto'],[/пещер/,'cave'],[/подземь/,'underdark'],[/болот|топь/,'swamp'],[/джунгл/,'jungle'],[/пустын|пес[ко]/,'desert'],[/оазис/,'oasis'],[/гор[аыне]|перевал/,'mountain'],[/каньон|ущель/,'canyon'],[/озер|остров/,'lake'],[/побереж|берег|маяк/,'coast'],[/фе[йия]|фей/,'feywild'],[/чащ|роща/,'deepforest'],[/лес/,'forest'],[/деревн|сел[оа]|хутор/,'village'],[/рынок|ярмарк/,'market'],[/порт|док|причал/,'port'],[/корабл|судн/,'ship'],[/трущоб/,'slums'],[/караван/,'caravan'],[/ферм/,'farm'],[/кладбищ|могил/,'graveyard'],[/поле бо|битв/,'battlefield'],[/особняк|поместь/,'manor'],[/дворец|бал/,'palace'],[/лавк|магазин/,'shop'],[/кузн/,'smithy'],[/храм|монастыр|святилищ/,'temple'],[/библиотек|архив/,'library'],[/замок/,'castle'],[/крепост|форт/,'fortress'],[/башн|маг/,'magetower'],[/часов/,'clocktower'],[/лагер/,'camp'],[/город|улиц/,'city'],[/подвал|погреб/,'cellar'],[/дом/,'house']];
KM.osType=o=>{const t=(o.n+' '+(o.scenes||[]).join(' ')+' '+o.hook).toLowerCase();for(const [r,ty] of KW)if(r.test(t)&&(!KM.LOCTYPES||KM.LOCTYPES.some(l=>l[0]===ty)))return ty;return 'dungeon'};
KM.osMap=(o,i)=>{const lv=+(String(o.lvl).match(/\d+/)||[1])[0];open('os-'+i,{type:KM.osType(o),W:26,H:24,dang:Math.min(80,25+lv*5),name:o.n})};
})();

;
/* paste.js */
'use strict';{
/* ===== Вставка кодов: iOS-надёжная вставка, нормализация, кнопка «Вставить» ===== */
const ZW=/[\s\u200B-\u200D\uFEFF\u00A0]+/g;
const normRoom=v=>{v=String(v||'');const m=v.match(/[?&#]room=([A-Za-z0-9]+)/);if(m)v=m[1];return v.replace(/[^A-Za-z0-9]/g,'').toUpperCase().slice(0,12)};
const normHero=v=>{v=String(v||'').replace(ZW,'').replace(/^["'«“]+|["'»”]+$/g,'');v=v.replace(/^kp1[:：]/i,'KP1:');if(!/^KP1:/.test(v)&&/^[A-Za-z0-9+/=_-]{20,}$/.test(v))v='KP1:'+v;return v.replace(/-/g,'+').replace(/_/g,'/').replace(/^KP1:/,'KP1:')};
const isRoom=el=>el.id==='scode';const isHero=el=>['imp','tbi'].includes(el.id);
const fix=el=>{if(isRoom(el)){const n=normRoom(el.value);if(n!==el.value)el.value=n}else if(isHero(el)){const n=normHero(el.value);if(n!==el.value)el.value=n}};
document.addEventListener('input',e=>{const t=e.target;if(t.matches&&t.matches('#scode,#imp,#tbi'))fix(t)},true);
document.addEventListener('change',e=>{const t=e.target;if(t.matches&&t.matches('#scode,#imp,#tbi'))fix(t)},true);
async function pasteInto(el){let txt='';try{txt=await navigator.clipboard.readText()}catch(e){}
 if(!txt){el.focus();try{el.select()}catch(e){}toast('Нажми и удерживай поле → «Вставить»');return}
 el.value=txt;fix(el);el.dispatchEvent(new Event('input',{bubbles:true}));toast('Вставлено');
 if(isRoom(el)){const g=document.getElementById('sgo');g&&g.classList.add('pulse')}}
function enhance(root){(root||document).querySelectorAll('#scode,#imp,#tbi').forEach(el=>{if(el.dataset.pst)return;el.dataset.pst=1;
 const b=document.createElement('button');b.type='button';b.className='btn sm pst-b';b.textContent='📋 Вставить';b.onclick=e=>{e.preventDefault();pasteInto(el)};
 const w=document.createElement('div');w.className='pst-row';w.appendChild(b);
 if(isRoom(el)){const h=document.createElement('span');h.className='pst-h';h.textContent='или наведи камеру телефона на QR-код Мастера';w.appendChild(h)}
 el.after(w)})}
new MutationObserver(m=>{for(const r of m)for(const n of r.addedNodes)if(n.nodeType===1&&(n.matches('#scode,#imp,#tbi')||n.querySelector('#scode,#imp,#tbi')))enhance(n.parentNode||n)}).observe(document.body,{childList:true,subtree:true});
enhance();
window.KM=window.KM||{};KM.paste={normRoom,normHero,pasteInto};
}

;
/* dock.js */
'use strict';{
/* Компактный док: одна кнопка «Инструменты» (Око Книги + Помощник мастера) и отдельная — «Стол игроков» */
const d=document.createElement('div');d.id='kdock';d.setAttribute('data-noswipe','');
const t=document.createElement('button');t.id='kdock-t';t.setAttribute('aria-label','Инструменты: Око Книги и Помощник мастера');t.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><path d="M2.5 12C5 7.5 8.3 5.5 12 5.5s7 2 9.5 6.5c-2.5 4.5-5.8 6.5-9.5 6.5S5 16.5 2.5 12z" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';
t.onclick=()=>openSheet(`<div class="sb-title">Инструменты</div><div class="sb-sub">Быстрые помощники Мастера</div>
 <button class="btn nv-big" id="kd-eye">◉ Око Книги <small>поиск по правилам, заклинаниям, монстрам</small></button>
 <button class="btn nv-big" id="kd-nv">? Помощник мастера <small>шпаргалки и пошаговые сценарии</small></button>`,()=>{
  $('#kd-eye').onclick=()=>{closeSheet();setTimeout(()=>KM.assist?KM.assist.open():document.querySelector('.as-fab')?.click(),250)};
  $('#kd-nv').onclick=()=>document.getElementById('nvfab')?.click()});
d.append(t);document.body.append(d);
const grab=()=>{const f=document.getElementById('tbfab');if(f&&f.parentNode!==d)d.prepend(f)};grab();setTimeout(grab,500);
}

;(()=>{const d=document.getElementById('kdock');if(!d)return;let t;const pg=document.getElementById('page');const hide=()=>{d.classList.add('kd-hide');clearTimeout(t);t=setTimeout(()=>d.classList.remove('kd-hide'),900)};(pg||window).addEventListener('scroll',hide,{passive:true})})();
;(()=>{const go=()=>{const d=document.getElementById('kdock');if(!d){return setTimeout(go,500)}let pt;const arm=()=>{clearTimeout(pt);pt=setTimeout(()=>d.classList.add('kd-peek'),2500)};
d.addEventListener('click',e=>{if(d.classList.contains('kd-peek')){e.stopPropagation();e.preventDefault();d.classList.remove('kd-peek');arm()}},true);
d.addEventListener('touchstart',()=>{if(!d.classList.contains('kd-peek'))arm()},{passive:true});
new MutationObserver(()=>{if(!d.classList.contains('kd-hide')&&!d.classList.contains('kd-peek'))arm()}).observe(d,{attributes:true,attributeFilter:['class']});arm()};
document.readyState==='loading'?addEventListener('DOMContentLoaded',go):go()})();

;
/* uses.js */
'use strict';{
/* Автоучёт ограниченных использований: заряды предметов/артефактов, умения классов, «1/день», «на рассвете», отдых.
   Время берётся из игрового календаря (KM.cal), отдых — из листа героя. Восстановление → тост + лента уведомлений + синхронизация игрокам. */
const PER={day:'1/день',dawn:'на рассвете',dusk:'на закате',week:'раз в неделю',month:'раз в месяц',short:'короткий отдых',long:'долгий отдых',storm:'в грозу (вручную)',none:'не восстанавливается'};
const DAYS={day:1,dawn:1,dusk:1,week:7,month:30};
const st=LS.get('uses',{abs:0,feed:[]});const sv=()=>LS.set('uses',st);
const roll=e=>{const m=String(e||'').replace(/\s/g,'').match(/^(\d*)[кd](\d+)([+-]\d+)?$/i);if(!m)return parseInt(e)||0;let t=0;for(let i=0;i<(+m[1]||1);i++)t+=1+Math.floor(Math.random()*+m[2]);return t+(+m[3]||0)};
function perOf(t){t=String(t||'').toLowerCase();return /рассвет/.test(t)?'dawn':/закат/.test(t)?'dusk':/недел/.test(t)?'week':/месяц/.test(t)?'month':/коротк/.test(t)?'short':/долг/.test(t)?'long':/гроз|бур/.test(t)?'storm':/день|сутк|день/.test(t)?'day':''}
/* лимит из структурированных полей (uses/recharge/regain — artifacts2) или из текста (chg, описание) */
function limitOf(it){if(!it)return null;if(it.uses)return{max:+it.uses,per:it.recharge==='none'?'none':(it.recharge||'dawn'),regain:it.regain||''};
 const c=String(it.chg||'');if(c&&c!=='—'){let m=c.match(/(\d+)\s*\/\s*(день|сутки|неделю|недел)/i);if(m)return{max:+m[1],per:perOf(m[2])||'day',regain:''};m=c.match(/^\s*(\d+)/);if(m){const rg=(c.match(/восст[а-я.]*\s+([0-9]*[кd]\d+(?:\s*[+-]\s*\d+)?|\d+)/i)||[])[1]||'';return{max:+m[1],per:perOf(c)||'none',regain:rg.replace(/\s/g,'')}}}
 const d=String(it.d||it.prop||'');let m=d.match(/(\d+)\s+заряд/i);if(m){const rg=(d.match(/восстанавлива[а-я]*\s+([0-9]*[кd]\d+(?:\s*[+-]\s*\d+)?)/i)||[])[1]||'';return{max:+m[1],per:perOf(d.slice(m.index,m.index+400))||'dawn',regain:rg.replace(/\s/g,'')}}
 m=d.match(/(\d+)\s*\/\s*день/i)||d.match(/(?:один|1)\s+раз\s+в\s+день/i);if(m)return{max:+(m[1]||1)||1,per:'day',regain:''};return null}
const md=v=>Math.floor((v-10)/2);
const CLS={Воин:p=>[['Второе дыхание',1,'short'],p.lvl>=2&&['Всплеск действий',p.lvl>=17?2:1,'short'],p.lvl>=9&&['Упорный',p.lvl>=17?3:p.lvl>=13?2:1,'long']],
 Варвар:p=>[['Ярость',p.lvl>=17?6:p.lvl>=12?5:p.lvl>=6?4:p.lvl>=3?3:2,'long']],Бард:p=>[['Вдохновение барда',Math.max(1,md((p.st||[])[5]||10)),p.lvl>=5?'short':'long']],
 Жрец:p=>[p.lvl>=2&&['Божественный канал',p.lvl>=18?3:p.lvl>=6?2:1,'short']],Паладин:p=>[['Божественное чувство',1+Math.max(0,md((p.st||[])[5]||10)),'long'],['Наложение рук (хиты)',5*p.lvl,'long'],p.lvl>=3&&['Божественный канал',1,'short']],
 Монах:p=>[p.lvl>=2&&['Ки',p.lvl,'short']],Чародей:p=>[p.lvl>=2&&['Очки чародейства',p.lvl,'long']],Друид:p=>[p.lvl>=2&&['Дикий облик',2,'short']],Волшебник:p=>[['Магическое восстановление',1,'long']],Колдун:p=>[],Следопыт:p=>[],Плут:p=>[p.lvl>=20&&['Удача',1,'short']],Изобретатель:p=>[]};
function itemOf(x){return x.item&&(DATA.items.find(i=>i.id===x.item)||(window.KM&&KM.loot&&KM.loot.art&&KM.loot.art(x.item)))}
function sync(p){p.uses=p.uses||{};const U=p.uses,seen=new Set();
 (p.inv||[]).forEach(x=>{const it=itemOf(x);const L=limitOf(it);if(!L||!L.max)return;const k='i:'+x.id;seen.add(k);const u=U[k];if(!u)U[k]={n:x.n,max:L.max,used:0,per:L.per,regain:L.regain,src:'item'};else{u.n=x.n;u.max=L.max;u.per=u.per||L.per}});
 const f=CLS[p.cls];if(f)f(p).filter(Boolean).forEach(([n,max,per])=>{const k='c:'+n;seen.add(k);if(!U[k])U[k]={n,max,used:0,per,src:'class'};else{U[k].max=max;U[k].per=per;U[k].used=Math.min(U[k].used,max)}});
 Object.keys(U).forEach(k=>{if((k.startsWith('i:')||k.startsWith('c:'))&&!seen.has(k))delete U[k]});return U}
function again(u){if(!u.used)return '';if(u.per==='short')return 'после короткого отдыха';if(u.per==='long')return 'после долгого отдыха';if(u.per==='none')return 'не восстанавливается';if(u.per==='storm')return 'в грозу';
 const d=DAYS[u.per];if(!d)return '';const left=Math.max(1,(u.at||0)+d-st.abs);const dt=KM.cal&&KM.cal.dateIn?KM.cal.dateIn(left):'через '+left+' дн.';return (u.per==='dawn'?'на рассвете, ':u.per==='dusk'?'на закате, ':'')+dt}
function feed(t){st.feed.unshift({t,d:KM.cal?KM.cal.short():'',at:Date.now()});st.feed.length=Math.min(st.feed.length,80);sv();badge()}
function restore(p,u,why){if(!u.used)return '';const before=u.used;if(u.regain&&/\d/.test(u.regain)&&u.per!=='short'&&u.per!=='long'){u.used=Math.max(0,u.used-roll(u.regain))}else u.used=0;u.at=0;const got=before-u.used;return got?`${u.n} +${got} (${u.max-u.used}/${u.max})`:''}
function after(msgs,why){if(!msgs.length)return;const t=why+': '+msgs.join('; ');toast('♻ '+t);feed(t);save();try{KM.table&&KM.table.push(true)}catch(e){}try{S.sec===6&&window.rPcs&&rPcs()}catch(e){}}
function onDays(n){if(!(n>0))return;st.abs+=n;sv();const out=[];players.forEach(p=>{sync(p);Object.values(p.uses).forEach(u=>{const d=DAYS[u.per];if(!d||!u.used)return;if(st.abs-(u.at||0)>=d){const r=restore(p,u);if(r)out.push(p.name+' — '+r)}})});after(out,'Новый день')}
function onRest(p,k){sync(p);const out=[];Object.values(p.uses).forEach(u=>{if(u.per==='short'||(k==='l'&&u.per==='long')){const r=restore(p,u);if(r)out.push(r)}});after(out.map(x=>p.name+' — '+x),k==='l'?'Долгий отдых':'Короткий отдых')}
function use(p,k,d=1){sync(p);const u=p.uses[k];if(!u)return;if(d>0&&u.used>=u.max)return toast(`${u.n}: всё потрачено — ${again(u)||'восстановите вручную'}`);u.used=Math.max(0,Math.min(u.max,u.used+d));if(d>0)u.at=st.abs;save();try{KM.table&&KM.table.push(true)}catch(e){}if(d>0)toast(`${u.n}: ${u.max-u.used}/${u.max}${u.used?' · снова '+again(u):''}`)}
function row(p){const U=sync(p);const ks=Object.keys(U);if(!ks.length)return '';return `<div class="use-row">${ks.map(k=>{const u=U[k];const pips=u.max<=8?Array.from({length:u.max},(_,i)=>`<i class="${i<u.max-u.used?'on':''}"></i>`).join(''):`<b>${u.max-u.used}/${u.max}</b>`;return `<button class="use-c${u.used>=u.max?' out':''}" data-use="${p.id}|${esc(k)}" title="${esc(PER[u.per]||'')}"><span>${esc(u.n)}</span><em>${pips}</em>${u.used?`<small>↻ ${esc(again(u))}</small>`:`<small>${esc(PER[u.per]||'')}</small>`}</button>`}).join('')}<button class="use-c add" data-useadd="${p.id}">＋ Ресурс</button></div>`}
function addUI(p){openSheet(`<div class="sb-title">Новый ресурс — ${esc(p.name)}</div><div class="sb-sub">Умение, заряды, «1/день» — восстановится само</div>
 <input class="inp" id="un" placeholder="Название (напр. Дыхание дракона)"><div class="row" style="margin-top:8px"><input class="inp" id="um" type="number" inputmode="numeric" value="1" style="width:80px"><select class="inp grow" id="up">${Object.entries(PER).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></div><input class="inp" id="ur" placeholder="Сколько восстанавливается (пусто = всё, или 1к6+1)" style="margin-top:8px"><button class="btn red" id="uok" style="width:100%;margin-top:10px">Добавить</button>`,()=>{
 $('#uok').onclick=()=>{const n=$('#un').value.trim();if(!n)return toast('Название?');p.uses=p.uses||{};p.uses['u:'+uid()]={n,max:Math.max(1,+$('#um').value||1),used:0,per:$('#up').value,regain:$('#ur').value.trim(),src:'dm'};save();closeSheet();rPcs()}})}
function manage(p,k){const u=p.uses[k];openSheet(`<div class="sb-title">${esc(u.n)}</div><div class="sb-sub">${esc(PER[u.per]||'')}${u.regain?' · восст. '+esc(u.regain):''} · осталось ${u.max-u.used}/${u.max}${u.used?' · снова '+esc(again(u)):''}</div>
 <div class="row" style="margin-top:10px"><button class="btn red grow" id="u1">− Потратить 1</button><button class="btn grow" id="u2">＋ Вернуть 1</button></div><div class="row" style="margin-top:8px"><button class="btn grow" id="u3">♻ Восстановить всё</button>${u.src==='dm'?'<button class="btn dark" id="u4">Удалить</button>':''}</div>`,()=>{
 $('#u1').onclick=()=>{use(p,k,1);closeSheet();rPcs()};$('#u2').onclick=()=>{use(p,k,-1);closeSheet();rPcs()};$('#u3').onclick=()=>{u.used=0;save();closeSheet();rPcs()};const d=$('#u4');if(d)d.onclick=()=>{const o=u;delete p.uses[k];save();closeSheet();rPcs();KM.undoToast&&KM.undoToast('Ресурс удалён',()=>{p.uses[k]=o;save();rPcs()})}})}
document.addEventListener('click',e=>{const b=e.target.closest('[data-use],[data-useadd]');if(!b)return;e.stopPropagation();if(b.dataset.useadd){const p=players.find(x=>x.id===b.dataset.useadd);if(p)addUI(p);return}const [id,k]=b.dataset.use.split('|');const p=players.find(x=>x.id===id);if(!p)return;let t=b._lp;if(t){b._lp=0;return}use(p,k,1);rPcs()},true);
document.addEventListener('contextmenu',e=>{const b=e.target.closest('[data-use]');if(!b)return;e.preventDefault();const [id,k]=b.dataset.use.split('|');const p=players.find(x=>x.id===id);if(p)manage(p,k)});
let lpT;document.addEventListener('touchstart',e=>{const b=e.target.closest&&e.target.closest('[data-use]');if(!b)return;lpT=setTimeout(()=>{b._lp=1;const [id,k]=b.dataset.use.split('|');const p=players.find(x=>x.id===id);if(p)manage(p,k)},500)},{passive:true});document.addEventListener('touchend',()=>clearTimeout(lpT),{passive:true});document.addEventListener('touchmove',()=>clearTimeout(lpT),{passive:true});
function feedUI(){openSheet(`<div class="sb-title">Уведомления</div><div class="sb-sub">Восстановления зарядов и умений</div>${st.feed.length?st.feed.map(f=>`<div class="card" style="padding:10px"><small class="muted">${esc(f.d)}</small><div>${esc(f.t)}</div></div>`).join(''):'<p class="muted">Пока пусто. Когда пройдёт игровой день или отдых — здесь появятся восстановленные ресурсы.</p>'}${st.feed.length?'<button class="btn dark" id="fclr" style="width:100%;margin-top:8px">Очистить</button>':''}`,()=>{const c=$('#fclr');if(c)c.onclick=()=>{const o=st.feed;st.feed=[];sv();badge();closeSheet();KM.undoToast&&KM.undoToast('Лента очищена',()=>{st.feed=o;sv();badge()})}});st.seen=st.feed.length;sv();badge()}
function badge(){const b=document.getElementById('kdock-f');if(!b)return;const n=Math.max(0,st.feed.length-(st.seen||0));b.innerHTML='🔔'+(n?`<b>${n}</b>`:'')}
setTimeout(()=>{const d=document.getElementById('kdock');if(!d)return;const b=document.createElement('button');b.id='kdock-f';b.setAttribute('aria-label','Уведомления');b.onclick=feedUI;d.append(b);badge()},300);
players.forEach(p=>{try{sync(p)}catch(e){}});
KM.uses={sync,limitOf,onDays,onRest,use,row,again,feed,PER,get st(){return st}};
}

;
/* blood.js */
'use strict';
/* ===== Realistic cover blood: viscous drips, detaching drops, splatter, soaking stains ===== */
(function(){const cv=$('#cover');if(!cv||cv.classList.contains('gone'))return;const face=$('.face',cv);
 const C=document.createElement('canvas');C.className='bloodfx';const S=document.createElement('canvas');S.className='bloodfx stain';face.append(S,C);
 const g=C.getContext('2d'),sg=S.getContext('2d');let W,H,dpr;
 function fit(){dpr=Math.min(2,devicePixelRatio||1);W=face.clientWidth;H=face.clientHeight;for(const c of[C,S]){c.width=W*dpr;c.height=H*dpr;c.style.width=W+'px';c.style.height=H+'px'}g.setTransform(dpr,0,0,dpr,0,0);sg.setTransform(dpr,0,0,dpr,0,0)}
 fit();addEventListener('resize',fit);
 const R=Math.random,lerp=(a,b,t)=>a+(b-a)*t;
 const drips=[...Array(12)].map((_,i)=>({x:(i+.5)/15*W+(R()-.5)*16,len:R()*H*.25,w:2+R()*R()*11,v:8+R()*30,visc:.5+R()*.5,bulge:R(),ph:R()*9,max:H*(.25+R()*.55)}));
 const drops=[],spl=[];
 function shade(x0,x1,a=1){const gr=g.createLinearGradient(x0,0,x1,0);gr.addColorStop(0,`rgba(40,0,0,${a})`);gr.addColorStop(.25,`rgba(118,4,2,${a})`);gr.addColorStop(.55,`rgba(72,0,0,${a})`);gr.addColorStop(1,`rgba(18,0,0,${a})`);return gr}
 function drawDrip(d,t){const w=d.w,L=d.len,x=d.x+Math.sin(t/3000+d.ph)*.6;const hr=w*(.75+d.bulge*.75);
  g.beginPath();g.moveTo(x-w*1.6,0);g.bezierCurveTo(x-w*.9,6,x-w*.55,L*.25,x-w*.45,L-hr*1.2);
  g.bezierCurveTo(x-hr*1.15,L-hr*.4,x-hr,L+hr*.9,x,L+hr);g.bezierCurveTo(x+hr,L+hr*.9,x+hr*1.15,L-hr*.4,x+w*.45,L-hr*1.2);
  g.bezierCurveTo(x+w*.55,L*.25,x+w*.9,6,x+w*1.6,0);g.closePath();g.fillStyle=shade(x-hr*1.2,x+hr*1.2);g.fill();
  // specular + subsurface rim
  g.strokeStyle='rgba(255,190,180,.35)';g.lineWidth=Math.max(.6,w*.18);g.beginPath();g.moveTo(x-w*.22,8);g.lineTo(x-w*.18,L-hr*1.3);g.stroke();
  g.fillStyle='rgba(255,230,220,.55)';g.beginPath();g.ellipse(x-hr*.38,L+hr*.05,hr*.18,hr*.35,-.3,0,7);g.fill();
  g.fillStyle='rgba(255,40,20,.12)';g.beginPath();g.ellipse(x+hr*.3,L+hr*.55,hr*.5,hr*.3,0,0,7);g.fill()}
 function drawDrop(p){const r=p.r,st=Math.min(3,1+Math.abs(p.vy)/500);g.save();g.translate(p.x,p.y);g.scale(1/Math.sqrt(st),st);
  g.beginPath();g.moveTo(0,-r*1.4);g.bezierCurveTo(r*.9,-r*.6,r,r,0,r);g.bezierCurveTo(-r,r,-r*.9,-r*.6,0,-r*1.4);g.fillStyle=shade(-r,r);g.fill();
  g.fillStyle='rgba(255,230,220,.6)';g.beginPath();g.ellipse(-r*.35,-r*.1,r*.18,r*.32,-.3,0,7);g.fill();g.restore()}
 function stain(x,y,r,a){const gr=sg.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(70,0,0,${a})`);gr.addColorStop(.6,`rgba(90,4,2,${a*.7})`);gr.addColorStop(1,'rgba(40,0,0,0)');sg.fillStyle=gr;sg.beginPath();sg.arc(x,y,r,0,7);sg.fill()}
 function splat(x,y,r){stain(x,y,r*3,.55);for(let i=0;i<7+R()*8;i++){const a=-Math.PI*R(),s=80+R()*260;spl.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:.6+R()*r*.45,life:1})}}
 // top pooling band
 function pool(t){const gr=g.createLinearGradient(0,0,0,26);gr.addColorStop(0,'rgba(30,0,0,.95)');gr.addColorStop(.6,'rgba(110,4,2,.85)');gr.addColorStop(1,'rgba(90,0,0,0)');g.fillStyle=gr;g.beginPath();g.moveTo(0,0);
  for(let x=0;x<=W;x+=12)g.lineTo(x,10+Math.sin(x*.05+t/1800)*3+Math.sin(x*.13)*4);g.lineTo(W,0);g.fill();
  g.strokeStyle='rgba(255,170,160,.18)';g.lineWidth=1;g.beginPath();for(let x=0;x<=W;x+=12)g.lineTo(x,8+Math.sin(x*.05+t/1800)*3+Math.sin(x*.13)*4);g.stroke()}
 let lt=0,run=true;const still=()=>document.documentElement.classList.contains('calm')||matchMedia('(prefers-reduced-motion: reduce)').matches;
 function frame(t){if(cv.classList.contains('gone')){run=false;return}requestAnimationFrame(frame);let dt=Math.min(.05,(t-lt)/1000||0);lt=t;if(document.hidden)return;if(still())dt=0;
  g.clearRect(0,0,W,H);pool(t);
  for(const d of drips){const n=.6+.8*Math.max(0,Math.sin(t/(900*d.visc)+d.ph));d.len+=d.v*n*dt*(d.len>d.max?.05:1);d.bulge+=dt*(.25+R()*.15)/d.visc;
   if(d.bulge>1.2){d.bulge=.1;drops.push({x:d.x,y:d.len+d.w,vy:20,r:d.w*.9});d.len*=.97;if(R()<.12){d.len=0;d.max=H*(.25+R()*.6);d.v=8+R()*30}}
   drawDrip(d,t)}
  for(let i=drops.length-1;i>=0;i--){const p=drops[i];p.vy+=1500*dt;p.y+=p.vy*dt;g.strokeStyle='rgba(120,5,2,.25)';g.lineWidth=p.r*.5;
   if(p.y>H*(.86+((p.x*7)%10)/100)){splat(p.x,p.y,p.r);drops.splice(i,1)}else drawDrop(p)}
  for(let i=spl.length-1;i>=0;i--){const s=spl[i];s.vy+=900*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt*2.2;if(s.life<=0){stain(s.x,s.y,s.r*2.4,.5);spl.splice(i,1);continue}g.fillStyle=`rgba(130,6,3,${s.life})`;g.beginPath();g.arc(s.x,s.y,s.r,0,7);g.fill()}
  // slow soaking fade of stains
  if((t|0)%60<17){sg.globalCompositeOperation='destination-out';sg.fillStyle='rgba(0,0,0,.004)';sg.fillRect(0,0,W,H);sg.globalCompositeOperation='source-over'}}
 requestAnimationFrame(frame);
 if(still()){for(let i=0;i<40;i++)frame(performance.now()+i*30)}
})();
