'use strict';/*bundle*/
/* sync.js */
'use strict';{
const A=window.KPA;const {$,$$,esc,LS,toast}=A;const PREFIX='kniga-mastera-v1-';
const S=LS.get('sync',{code:'',name:'',pid:'',auto:false});if(!S.pid){S.pid='p'+A.uid()+A.uid();LS.set('sync',S)}
const q=new URLSearchParams(location.search).get('room');if(q){S.code=q.toUpperCase().slice(0,8);LS.set('sync',S)}
let peer=null,conn=null,st='не подключено',live=false,perm=LS.get('perm',{}),init=null,map=null,shop=LS.get('shop',null),lastSent=LS.get('lastSent',{}),retry=0,tmr,lock=LS.get('lock',false),party=[],waiting=LS.get('waiting',{});let pendL=[];
const sv=()=>LS.set('sync',S);
/* связь: сначала прямой WebRTC (PeerJS + STUN/TURN), параллельно — зашифрованный ретранслятор MQTT; что ответит первым, тем и пользуемся */
let lastRx=0;setInterval(()=>{if(live&&mode==='relay'&&Date.now()-lastRx>70000){live=false;st='связь потеряна — переподключаюсь…';paint();again()}},10000);
let shows=[];let relay=null,mode='',p2pT=null,helloT=null,pingT=null;
function hello(){return {t:'hello',name:S.name||A.H.name,pid:S.pid,hero:{id:A.H.id,name:A.H.name}}}
function onOpen(via){onState.ok=0;live=true;retry=0;mode=via;st='за столом'+(via==='relay'?' · через ретранслятор':' · напрямую');S.auto=true;sv();clearInterval(helloT);
 const q=LS.get('trades',[]);q.forEach(t=>conn.send(t));LS.set('trades',[]);flush(true);paint();toast('Связь с Мастером установлена')}
function connect(){if(!S.code)return;clearTimeout(tmr);st='подключение…';paint();
 if(window.Peer){if(!peer||peer.destroyed){try{peer=new Peer({debug:0,config:{iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302','stun:stun.cloudflare.com:3478']},{urls:['turn:openrelay.metered.ca:80','turn:openrelay.metered.ca:443','turn:openrelay.metered.ca:443?transport=tcp'],username:'openrelayproject',credential:'openrelayproject'}]}});peer.on('open',()=>dial());peer.on('error',e=>{if(dmClosed.at&&!live)st='Мастер закрыл стол — подключусь сам, когда он откроет снова';else if(e.type==='peer-unavailable'&&!live)st='стол Мастера не найден напрямую — пробую ретранслятор…';else if(!live)st='прямая связь недоступна ('+e.type+') — пробую ретранслятор…';paint();if(!relay)startRelay();if(e.type!=='peer-unavailable')again()});peer.on('disconnected',()=>{try{peer.reconnect()}catch(e){}})}catch(e){}}else if(peer.open)dial()}
 clearTimeout(p2pT);p2pT=setTimeout(()=>{if(!live)startRelay()},6000)}
function dial(){if(live&&mode==='p2p')return;let c;try{c=peer.connect(PREFIX+S.code,{reliable:true})}catch(e){return}
 c.on('open',()=>{if(live&&mode==='relay'){try{relay.send('dm',{t:'bye'})}catch(e){}}conn=c;c.send(hello());onOpen('p2p')});
 c.on('data',onState);c.on('close',()=>{if(conn!==c)return;live=false;st='связь потеряна — переподключаюсь…';paint();again();startRelay()});c.on('error',()=>{})}
async function startRelay(){if(!window.KMRelay||!S.code)return;if(relay&&relay.code===S.code){if(relay.ok&&!live)relay.send('dm',hello());return}
 try{relay&&relay.end()}catch(e){}relay=await KMRelay.open(S.code,'p',S.pid,(f,m)=>{if(f!=='dm')return;if(m.t==='who'){relay.send('dm',hello());return}if(m.t==='pong'){lastRx=Date.now();return}if(m.t==='closed'){dmClosed();return}
   if(m.t==='state'&&(!live||mode==='relay')){if(!live){conn={send:x=>relay.send('dm',x),close(){}};onOpen('relay')}onState(m)}},
  (t,ok)=>{if(!live){st=ok?'ретранслятор подключён — жду стол Мастера…':t;paint()}if(ok){relay.send('dm',hello());clearInterval(helloT);helloT=setInterval(()=>{if(!live&&relay&&relay.ok)relay.send('dm',hello());else clearInterval(helloT)},5000)}});
 if(relay)relay.code=S.code;clearInterval(pingT);pingT=setInterval(()=>{if(live&&mode==='relay'&&relay)relay.send('dm',{t:'ping'})},25000)}
function again(){clearTimeout(tmr);if(!S.auto)return;tmr=setTimeout(connect,Math.min(15000,1500*(++retry)))}
function dmClosed(){dmClosed.at=Date.now();clearTimeout(tmr);clearTimeout(p2pT);clearInterval(helloT);clearInterval(pingT);try{conn&&conn.close()}catch(e){}try{relay&&relay.end()}catch(e){}relay=null;live=false;mode='';st='Мастер закрыл стол — подключусь сам, когда он откроет снова';paint();try{toast('Мастер закрыл стол. Я переподключусь автоматически')}catch(e){}}
function onState(d){lastRx=Date.now();if(d&&d.t==='state')dmClosed.at=0;if(d&&d.t==='closed'){dmClosed();return}if(!d||d.t!=='state')return;if(!onState.ok){onState.ok=1;setTimeout(()=>toast('✓ Синхронизировано с Мастером — лист обновлён'),300)}perm=d.perm||{};if(!!d.strict!==!!S.strict){S.strict=!!d.strict;try{toast(d.strict?'🔒 Строгий режим: изменения идут Мастеру на одобрение':'🔓 Мастер разрешил менять лист самостоятельно')}catch(e){}}if(!d.rest&&LS.get('restN',null)===null)LS.set('restN',0);if(d.rest&&d.rest.n){const ln=LS.get('restN',null);if(d.rest.n!==ln){LS.set('restN',d.rest.n);if(ln!==null)setTimeout(()=>{toast((d.rest.k==='l'?'🌙 Мастер объявил долгий отдых — силы восстановлены':'☕ Мастер объявил короткий отдых')+((d.rest.L||[]).length?'\n'+(d.rest.L.find(x=>A.H&&x.startsWith(A.H.name))||''):''));try{navigator.vibrate&&navigator.vibrate([30,40,30])}catch(e){}},400)}}lock=!!d.lock;LS.set('perm',perm);LS.set('lock',lock);party=d.party||[];init=d.init;try{const c=init&&init.list[init.turn],key=init?init.round+':'+init.turn:'';if(c&&c.pc&&A.H&&c.n===A.H.name&&key!==onState.tk){toast('⚔ Ваш ход!');navigator.vibrate&&navigator.vibrate([80,60,80])}onState.tk=key}catch(e){}map=d.map;window.__kpMap=map;{const sw=d.shows||[],seen=LS.get('showSeen',null),ids=sw.map(x=>x.id);if(seen){const nw=sw.filter(x=>!seen.includes(x.id));if(nw.length){toast('📣 Мастер показывает: «'+nw[0].n+'»');try{navigator.vibrate&&navigator.vibrate([40,30,40])}catch(e){}if(localStorage.getItem('kp_tab')!=='"table"')document.documentElement.classList.add('km-newdm')}const hist=LS.get('showHist',[]);nw.forEach(x=>hist.unshift(x));LS.set('showHist',hist.slice(0,40))}{const del=d.showDel||[];if(del.length)LS.set('showHist',LS.get('showHist',[]).filter(x=>!del.includes(x.id)))}LS.set('showSeen',ids);shows=sw}shop=d.shop||null;LS.set('shop',shop);{const ho=d.handouts||[],K=h=>h.rev!=null?h.n+'#'+h.rev:h.n+'|'+(h.t||'').length+'|'+(h.img||'').length,old=LS.get('hoKeys',[]),ks=ho.map(K);if(old){const nw=ks.map((k,i)=>old.includes(k)?-1:i).filter(i=>i>=0);if(nw.length){LS.set('hoNew',nw);toast('📜 Новая записка от Мастера: «'+ho[nw[0]].n+'»'+(nw.length>1?' (+'+(nw.length-1)+')':''));try{navigator.vibrate&&navigator.vibrate(60)}catch(e){}}}LS.set('hoKeys',ks);LS.set('handouts',ho)}
 if(Array.isArray(d.pend)){const now=Date.now(),wt=LS.get('waitT',{});Object.keys(waiting).forEach(f=>{if(!d.pend.some(x=>x.f===f)&&now-(wt[f]||0)>4000)delete waiting[f]});d.pend.forEach(x=>{if(F[x.f]&&!waiting[x.f])waiting[x.f]='?'});pendL=d.pend;LS.set('waiting',waiting)}if(Array.isArray(d.dec)){const sn=LS.get('decSeen',[]);d.dec.filter(x=>!sn.includes(x.id)).forEach((x,i)=>{setTimeout(()=>toast('✕ Мастер отклонил: '+x.d),300+i*1600);sn.push(x.id);Object.keys(F).forEach(f=>{if(!d.pend||!d.pend.some(y=>y.f===f))delete waiting[f]})});LS.set('decSeen',sn.slice(-60));LS.set('waiting',waiting)}
 if(d.hero){const H=A.H;const h=d.hero;['id','name','cls','lvl','hp','maxhp','thp','ac','spd','st','inv','coins','spells','slots','ds','insp','xp','conds','uses','usesA','_sig','_v'].forEach(f=>{if(h[f]!==undefined)H[f]=h[f]});{const o=JSON.stringify(LS.get('usesPrev',{}));const nw={};Object.entries(H.uses||{}).forEach(([k,u])=>nw[k]=u.used);const op=JSON.parse(o);const back=Object.keys(nw).filter(k=>op[k]>nw[k]).map(k=>H.uses[k].n);if(back.length)toast('♻ Восстановлено: '+back.join(', '));LS.set('usesPrev',nw)}if(typeof h.notes==='string'&&!document.activeElement?.matches('#nt'))H.notes=h.notes;A.H=H;snapSent();Object.keys(waiting).forEach(f=>{if(JSON.stringify(F[f](H))===waiting[f])delete waiting[f]});LS.set('waiting',waiting)}
 A.render()}
const F={notes:H=>H.notes,slots:H=>H.slots,conds:H=>H.conds,inv:H=>({inv:H.inv,coins:H.coins}),hp:H=>({hp:H.hp,thp:H.thp,ds:H.ds}),lvl:H=>({lvl:H.lvl,xp:H.xp||0,maxhp:H.maxhp,st:H.st,ac:H.ac,spd:H.spd,cls:H.cls,race:H.race,name:H.name})};
function snapSent(){Object.keys(F).forEach(f=>lastSent[f]=JSON.stringify(F[f](A.H)));LS.set('lastSent',lastSent)}
/* изменения офлайн копятся (lastSent хранится) и уходят при переподключении; Мастер — источник истины */
function flush(re){if(!live)return;const ch={};Object.keys(F).forEach(f=>{const v=JSON.stringify(F[f](A.H));if(lastSent[f]!==undefined&&v!==lastSent[f]&&(re||perm[f]&&perm[f]!=='off')){ch[f]=F[f](A.H);if(perm[f]==='approve'){waiting[f]=v;const wt=LS.get('waitT',{});wt[f]=Date.now();LS.set('waitT',wt)}}});LS.set('waiting',waiting);if(Object.keys(ch).length)try{conn.send({t:'edit',ch});if(Object.keys(ch).some(f=>perm[f]==='approve'))toast('Отправлено Мастеру на одобрение')}catch(e){}}
function onLocal(){if(!S.code)return;if(!live){const n=Object.keys(F).filter(f=>JSON.stringify(F[f](A.H))!==lastSent[f]).length;if(n&&lastSent.notes!==undefined)toast('Нет связи — изменения отправятся Мастеру при подключении');return}flush(false)}
function req(f,v){if(!live)return toast('Нет связи с Мастером');try{conn.send({t:'edit',ch:{[f]:v}})}catch(e){}}
function build(hero,kind){const m={t:'build',hero,kind:kind||'new'};if(live){try{conn.send(m)}catch(e){}toast('Отправлено Мастеру на одобрение')}else{const q=LS.get('trades',[]);q.push(m);LS.set('trades',q);toast('Отправится Мастеру при подключении')}}
function trade(item,to){const m={t:'trade',item,to};if(live){try{conn.send(m)}catch(e){}toast('Запрос на передачу отправлен Мастеру')}else{const q=LS.get('trades',[]);q.push(m);LS.set('trades',q);toast('Передача отправится при подключении')}}
function paint(){const b=$('#link');if(b){b.className='lk'+(live?' on':S.auto&&S.code?' wait':' off');b.textContent=live?'◉':'◌'}if(A&&localStorage.getItem('kp_tab')==='"table"'&&!document.activeElement?.matches('input,textarea'))A.render()}
const PN={notes:'Записи',slots:'Ячейки',conds:'Состояния',hp:'Хиты',inv:'Сумка',lvl:'Уровень и хар-ки',trade:'Обмен'};
function render(){document.documentElement.classList.remove('km-newdm');const H0=LS.get('showHist',[]).filter(x=>!shows.some(y=>y.id===x.id));return `${init?(()=>{const cur=init.list[init.turn]||{},me=A&&A.H&&cur.pc&&cur.n===A.H.name,nx=init.list[(init.turn+1)%init.list.length]||{};return `<div class="card pcb" style="border:1px solid rgba(224,87,76,.55);margin:4px 0 10px"><div class="row" style="align-items:center"><b class="grow" style="font-size:17px">⚔ Бой · раунд ${init.round}</b><small class="muted">дальше: ${esc(nx.n||'')}</small></div>${me?`<div class="pcb-me" style="margin:8px 0;padding:12px;border-radius:12px;background:linear-gradient(135deg,#7a1b14,#3a0c08);color:#ffe9c2;text-align:center"><b style="font-size:20px">Ваш ход!</b><div style="font-size:13px;margin-top:4px">Действие · Бонусное действие · Движение · Реакция<br>Скажите Мастеру, что делаете, и бросьте к20 для атаки</div></div>`:`<div style="margin:6px 0;font-size:15px">Сейчас ходит: <b>${esc(cur.n||'')}</b></div>`}<div class="init">${init.list.map((c,i)=>`<div class="${i===init.turn?'cur':''}" style="${c.dead?'opacity:.45':''}${i===init.turn?';background:rgba(224,87,76,.18);border-radius:8px':''}"><b style="width:30px">${esc(c.init)}</b><span class="grow">${esc(c.n)}${i===init.turn?' <small class="soon">ходит</small>':''}${c.conds.length?`<br><small class="muted">${c.conds.map(esc).join(', ')}</small>`:''}</span><span class="muted">${esc(c.st)}</span></div>`).join('')}</div>${(init.log||[]).length?`<div class="muted" style="font-size:12px;margin-top:6px">${init.log.map(esc).join('<br>')}</div>`:''}</div>`})():''}${shows.length?`<h3 style="margin-top:4px">📣 Мастер показывает</h3>${shows.map((x,i)=>`<div class="card km-sw" data-sw="${esc(x.id)}" style="cursor:pointer">${x.img?`<img src="${x.img}" alt="" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px;margin-bottom:6px">`:''}<b>${esc(x.i||'')} ${esc(x.n)}</b><div class="muted" style="font-size:13px;white-space:pre-wrap;max-height:90px;overflow:hidden">${esc((x.t||'').slice(0,240))}</div></div>`).join('')}`:live?'<div class="pe-empty"><div class="pe-i">📣</div><b>Здесь появится всё, что покажет Мастер</b><small>Лавки, записки, карты, портреты, бой</small></div>':''}${(()=>{const H=LS.get('handouts',[]);return H.length?`<h3>📜 Раздатки (${H.length})</h3><div class="list">${H.map((h,i)=>`<button class="card" data-pho="${i}" style="width:100%;text-align:left"><div class="t">${esc(h.n||'Раздатка')}</div><div class="m">${h.img?'изображение':esc((h.t||'').slice(0,70))}</div></button>`).join('')}</div>`:''})()}${map?`<h3>🗺 ${esc(map.n)}</h3><div id="pmap" class="pmap"><canvas></canvas><button class="pm-fs" aria-label="Карта во весь экран">⤢</button></div><p class="muted" style="font-size:12px">Двумя пальцами — увеличить, одним — двигать, ⤢ — во весь экран. Фишки обновляются вживую.</p>`:''}<div class="card"><h3 style="margin-top:0">Стол Мастера</h3><div class="row"><span class="grow ${live?'':'muted'}">${live?'◉ ':'◌ '}${esc(st)}</span></div>
 ${S.strict&&live?'<div class="tb-warn" style="font-size:13px">🔒 Строгий режим: изменения ждут одобрения Мастера</div>':''}${lock?'<div class="tb-warn" style="font-size:14px">🔒 Мастер заблокировал лист — изменения недоступны.</div>':''}${Object.keys(waiting).length||pendL.length?`<div class="muted" style="margin-top:6px">⏳ Ждут одобрения: ${[...new Set([...Object.keys(waiting).map(f=>PN[f]||f),...pendL.filter(x=>!F[x.f]).map(x=>x.f==='buy'?'Покупка':x.f==='build'?'Лист героя':PN[x.f]||x.f)])].join(', ')}</div>`:''}${live?`<div style="margin-top:8px">${Object.keys(PN).map(f=>`<span class="chip${perm[f]&&perm[f]!=='off'?' on':''}">${PN[f]}: ${perm[f]==='direct'?'сам':perm[f]==='approve'?'через Мастера':'только Мастер'}</span>`).join('')}</div><button class="btn" id="sdis" style="width:100%;margin-top:8px">Выйти из-за стола</button>`:`
 <input class="inp" id="scode" placeholder="Код комнаты" value="${esc(S.code)}" style="text-transform:uppercase;font-size:24px;letter-spacing:6px;text-align:center;margin-top:8px" autocapitalize="characters" autocomplete="off" autocorrect="off" spellcheck="false" inputmode="text">
 <input class="inp" id="sname" placeholder="Ваше имя (игрок)" value="${esc(S.name)}" style="margin-top:6px"><button class="btn ac" id="sgo" style="width:100%;margin-top:8px;padding:14px">◎ Сесть за стол</button>`}</div>
 
 ${shop?`<h3>${esc(shop.i)} ${esc(shop.n)}</h3><div class="card"><div class="muted">${esc(shop.m.n)} — ${esc(shop.m.t)}</div><p style="font-style:italic;margin:6px 0 10px">«${esc(shop.m.ph)}»</p>${(()=>{const c=A.H.coins||{},cp=(c.пм||0)*1000+(c.зм||0)*100+(c.эм||0)*50+(c.см||0)*10+(c.мм||0);return `<div class="row" style="align-items:center;gap:6px;margin-bottom:8px;font-size:13px"><span>👛 Кошелёк:</span>${['пм','зм','эм','см','мм'].filter(k=>c[k]).map(k=>`<b>${c[k]} ${k}</b>`).join(' ')||'<b>пусто</b>'}<span class="muted">≈ ${fmtG(cp/100)}</span></div>`})()}${shop.hag?`<div class="chip on" style="display:inline-block;margin-bottom:8px">${shop.hag>0?'Скидка '+Math.round(shop.hag*100)+'%':'Наценка '+Math.round(-shop.hag*100)+'%'}</div>`:''}${shop.items.map(x=>`<div class="it" data-shi="${x.k}"><div class="grow"><div class="t">${esc(x.n)}</div><div class="m">${esc(x.cat)}${x.rar&&x.rar!=='Обычный'?' · '+esc(x.rar):''}${x.q?' · в наличии '+x.q:''}</div></div><b style="white-space:nowrap;margin:0 8px;color:${(()=>{const c=A.H.coins||{};return ((c.пм||0)*1000+(c.зм||0)*100+(c.эм||0)*50+(c.см||0)*10+(c.мм||0))<x.p*100?'#c66':'inherit'})()}">${fmtMix(x.p)}</b><button class="btn sm ac" data-shb="${x.k}">Купить</button></div>`).join('')}<p class="muted" style="font-size:12px;margin-top:8px">Покупка — запрос Мастеру; золото спишется после одобрения.</p></div>`:''}
 ${H0.length?`<details class="card"><summary>История показанного (${H0.length})</summary>${H0.map((x,i)=>`<div class="it" data-swh="${esc(x.id)}"><div class="grow"><div class="t">${esc(x.i||'')} ${esc(x.n)}</div><div class="m">${new Date(x.ts).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}</div></div></div>`).join('')}</details>`:''}
 ${window.KMInstall?KMInstall.html():''}<div class="card"><h3 style="margin-top:0">Без интернета</h3><button class="btn" id="exp" style="width:100%">⧉ Скопировать код героя</button><textarea class="inp" id="imp" placeholder="Вставьте код героя от Мастера (KP1:…)" style="margin-top:8px;min-height:70px"></textarea><button class="btn" id="impb" style="width:100%;margin-top:6px">Загрузить героя</button></div>`}
function fmtMix(g){let cp=Math.round(g*100);const o=[];[['зм',100],['см',10],['мм',1]].forEach(([k,v])=>{const n=Math.floor(cp/v);if(n){o.push(n.toLocaleString('ru')+' '+k);cp-=n*v}});return o.join(' ')||'0 мм'}
function fmtG(g){return g>=1?(Math.round(g*10)/10).toLocaleString('ru')+' зм':g>=.1?Math.round(g*10)+' см':Math.max(1,Math.round(g*100))+' мм'}
function buyReq(x){const m={t:'buy',shop:shop.id,k:x.k,q:1};if(!live)return toast('Нужна связь с Мастером');try{conn.send(m)}catch(e){}toast('Запрос на покупку отправлен Мастеру')}
function bind(){document.querySelectorAll('[data-shb]').forEach(b=>b.onclick=e=>{e.stopPropagation();const x=shop.items.find(y=>y.k===b.dataset.shb);if(x)buyReq(x)});document.querySelectorAll('[data-shi]').forEach(b=>b.onclick=e=>{if(e.target.closest('[data-shb]'))return;const x=shop.items.find(y=>y.k===b.dataset.shi);const i=x.item&&((window.PDATA||{items:[]}).items.find(y=>y.id===x.item)||((window.PDATA||{}).art||[]).find(y=>y.id===x.item));openSheet(`<h3>${esc(x.n)}</h3>${x.unid?'<p class="muted">Торговец и сам толком не знает, что это. Свойства откроются после опознания.</p>':window.PITEM?window.PITEM(i,{d:x.cat}):''}<div class="row" style="margin-top:10px"><b class="grow">${fmtG(x.p)}</b><button class="btn ac" id="shbq">Купить</button></div>`,r=>{r.querySelector('#shbq').onclick=()=>{buyReq(x);closeSheet()}})});
const g=$('#sgo');if(g)g.onclick=()=>{S.code=$('#scode').value.replace(/[^a-zA-Z0-9]/g,'').toUpperCase();try{relay&&relay.end()}catch(e){}relay=null;S.name=$('#sname').value.trim();S.auto=true;sv();retry=0;connect()};
 const d=$('#sdis');if(d)d.onclick=()=>{S.auto=false;sv();try{mode==='relay'&&relay.send('dm',{t:'bye'})}catch(e){}try{conn.close()}catch(e){}try{relay&&relay.end()}catch(e){}relay=null;clearTimeout(p2pT);clearInterval(helloT);clearInterval(pingT);live=false;mode='';st='не подключено';init=null;map=null;A.render()};
 $('#exp').onclick=()=>{const c='KP1:'+btoa(unescape(encodeURIComponent(JSON.stringify(A.H))));(navigator.clipboard?navigator.clipboard.writeText(c):Promise.reject()).then(()=>toast('Код скопирован'),()=>{$('#imp').value=c;toast('Код в поле ниже')})};
 $('#impb').onclick=()=>{try{const h=JSON.parse(decodeURIComponent(escape(atob($('#imp').value.trim().replace(/^KP1:/,'')))));A.H=Object.assign(A.H,h);A.save();toast('Герой загружен');A.render()}catch(e){toast('Неверный код')}}}
window.KP={_shows:()=>shows,linked:()=>live||!!(S.code&&lastSent.notes!==undefined),online:()=>live,can:f=>!lock&&perm[f]&&perm[f]!=='off',mode:f=>lock?'off':perm[f]||'off',locked:()=>lock,party:()=>party,waiting:()=>waiting,trade,build,req,render,bind,onLocal};
$('#link').onclick=()=>{localStorage.setItem('kp_tab','"table"');location.hash='';A.render();KM.go(4)};
const wake=()=>{if(!document.hidden&&S.auto&&S.code&&!live){retry=0;connect()}};document.addEventListener('visibilitychange',wake);addEventListener('pageshow',wake);addEventListener('online',()=>setTimeout(wake,400));addEventListener('focus',wake);
setInterval(()=>{if(!S.auto||!S.code)return;if(live&&Date.now()-lastRx>40000){live=false;st='связь потеряна — переподключаюсь…';paint();try{conn&&conn.close()}catch(e){}relay=null;connect();return}if(live){try{conn.send({t:'ping'})}catch(e){}return}if(Date.now()-(wake.t||0)>14000){wake.t=Date.now();connect()}},12000);
if(S.code&&(S.auto||q))connect();
}

document.addEventListener('click',e=>{const ph=e.target.closest&&e.target.closest('[data-pho]');if(ph&&window.KMH){const h=LS.get('handouts',[])[+ph.dataset.pho];if(h)KMH.open(h);return}const a=e.target.closest('[data-sw],[data-swh],#mapc');if(!a||!window.KMH)return;let h;if(a.id==='mapc'){const m=document.getElementById('mapc');h={n:'Карта',img:m.src}}else if(a.dataset.sw!=null){const A=[...(window.KP&&KP._shows?KP._shows():[]),...LS.get('showHist',[])];h=A.find(x=>x.id===a.dataset.sw)}else{const A=[...LS.get('showHist',[]),...(window.KP&&KP._shows?KP._shows():[])];h=A.find(x=>x.id===a.dataset.swh)}if(h)KMH.open({n:h.n,t:h.t,img:h.img})});

;
/* pmap.js */
'use strict';
/* Живая карта игрока: фон от Мастера + фишки, туман уже в фоне. Пан/зум жестами. */
(()=>{const st={s:1,x:0,y:0},img=new Image();let src='',lastM=null,lastCv=null,fk='';
function fit(cv,m){const W=m.W*m.CS,H=m.H*m.CS;st.s=Math.min(cv.width/W,cv.height/H);st.x=(cv.width-W*st.s)/2;st.y=(cv.height-H*st.s)/2}
function draw(){const box=document.getElementById('pmap');const m=window.__kpMap;if(!box||!m)return;const cv=box.querySelector('canvas');const dpr=Math.min(2,devicePixelRatio||1);const w=box.clientWidth,h=box.clientHeight;if(cv.width!==w*dpr||cv.height!==h*dpr){cv.width=w*dpr;cv.height=h*dpr;cv.style.width=w+'px';cv.style.height=h+'px'}
 if(m.src!==src){src=m.src;img.onload=draw;img.src=src;}if(cv!==lastCv){lastCv=cv;if(!cv._b){cv._b=1;bind(cv)}}const k=m.n+m.W+'x'+m.H;if(fk!==k){fk=k;fit(cv,m)}
 const g=cv.getContext('2d'),CS=m.CS||24;g.setTransform(1,0,0,1,0,0);g.fillStyle='#070505';g.fillRect(0,0,cv.width,cv.height);g.setTransform(st.s,0,0,st.s,st.x,st.y);if(img.complete&&img.naturalWidth)g.drawImage(img,0,0,m.W*CS,m.H*CS);
 if(m.aoe&&window.KM_AOE)KM_AOE.draw(g,m.aoe,CS,m.W,m.H);(m.tok||[]).forEach(t=>{const X=t.x*CS+CS/2,Y=t.y*CS+CS/2,r=CS*.42;if(t.cur){g.save();g.strokeStyle='#ffd36a';g.lineWidth=3;g.shadowColor='#ffd36a';g.shadowBlur=10;g.beginPath();g.arc(X,Y,r+5,0,7);g.stroke();g.restore()}g.fillStyle=t.c;g.beginPath();g.arc(X,Y,r,0,7);g.fill();g.strokeStyle='rgba(0,0,0,.7)';g.lineWidth=2;g.stroke();g.fillStyle='#fff';g.font=`700 ${CS*.4}px sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(t.n.slice(0,2),X,Y+1);if(t.cd&&t.cd.length&&!t.dead){const CI={'Отравлен':'☠','Ошеломлён':'💫','Оглушён':'💫','Ослеплён':'🙈','Испуган':'😱','Схвачен':'✊','Опутан':'🕸','Сбит с ног':'⤵','Невидим':'👻','Парализован':'⚡','Окаменел':'🗿','Без сознания':'💤','Очарован':'💘','Концентрация':'🌀'};g.save();g.font=`${CS*.34}px sans-serif`;t.cd.forEach((n,i)=>g.fillText(CI[n]||'•',X-r+i*CS*.33,Y-r));g.restore()}
  if(t.dead){g.strokeStyle='rgba(20,0,0,.9)';g.lineWidth=3;g.beginPath();g.moveTo(X-r,Y-r);g.lineTo(X+r,Y+r);g.moveTo(X+r,Y-r);g.lineTo(X-r,Y+r);g.stroke()}
  if(t.st&&st.s>.9){g.font=`600 ${CS*.28}px sans-serif`;g.fillStyle='rgba(0,0,0,.7)';const tw=g.measureText(t.st).width+6;g.fillRect(X-tw/2,Y+r+2,tw,CS*.34);g.fillStyle='#f3e6c8';g.fillText(t.st,X,Y+r+2+CS*.17)}});
 const p=m.ping;if(p){const X=p.x*CS+CS/2,Y=p.y*CS+CS/2,k=(Date.now()/600)%1;g.strokeStyle=`rgba(255,90,60,${1-k})`;g.lineWidth=3;g.beginPath();g.arc(X,Y,CS*(.4+k*1.4),0,7);g.stroke();g.fillStyle='rgba(255,90,60,.5)';g.beginPath();g.arc(X,Y,CS*.3,0,7);g.fill()}
 lastM=m}
function bind(cv){const P=new Map();let base=null;
 cv.addEventListener('touchstart',e=>{e.preventDefault();[...e.changedTouches].forEach(t=>P.set(t.identifier,[t.clientX,t.clientY]));base=snap()},{passive:false});
 cv.addEventListener('touchmove',e=>{e.preventDefault();const dpr=cv.width/cv.clientWidth;[...e.changedTouches].forEach(t=>P.has(t.identifier)&&P.set(t.identifier,[t.clientX,t.clientY]));const now=snap();if(!base||now.n!==base.n){base=now;return}
  if(now.n>=2){const k=Math.max(.3,Math.min(8,base.s*now.d/base.d))/st.s;const r=cv.getBoundingClientRect(),cx=(now.cx-r.left)*dpr,cy=(now.cy-r.top)*dpr;st.x=cx-(cx-st.x)*k;st.y=cy-(cy-st.y)*k;st.s*=k}
  st.x+=(now.cx-base.cx)*dpr;st.y+=(now.cy-base.cy)*dpr;base=snap();draw()},{passive:false});
 const end=e=>{[...e.changedTouches].forEach(t=>P.delete(t.identifier));base=snap()};cv.addEventListener('touchend',end);cv.addEventListener('touchcancel',end);
 function snap(){const a=[...P.values()];if(!a.length)return null;const cx=a.reduce((s,p)=>s+p[0],0)/a.length,cy=a.reduce((s,p)=>s+p[1],0)/a.length;const d=a.length>1?Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1])||1:1;return{n:a.length,cx,cy,d,s:st.s}}}
function PFS(on){const box=document.getElementById('pmap');if(!box)return;box.classList.toggle('fs',on);document.documentElement.classList.toggle('pm-lock',on);const b=box.querySelector('.pm-fs');if(b)b.textContent=on?'✕ Закрыть':'⤢';if(on){try{history.pushState({pfs:1},'')}catch(e){}}else if(history.state&&history.state.pfs){PFS.pop=1;history.back()}lastCv=null;const cv=box.querySelector('canvas');if(cv)cv.width=0;draw()}
addEventListener('popstate',()=>{if(PFS.pop){PFS.pop=0;return}const box=document.getElementById('pmap');if(box&&box.classList.contains('fs'))PFS(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const box=document.getElementById('pmap');if(box&&box.classList.contains('fs'))PFS(false)}});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.pm-fs');if(!b)return;const box=document.getElementById('pmap');PFS(!box.classList.contains('fs'));lastCv=null;const cv=box.querySelector('canvas');cv.width=0;draw()});
setInterval(()=>{const m=window.__kpMap,box=document.getElementById('pmap');if(!box||!m)return;const cv=box.querySelector('canvas');if(m!==lastM||cv!==lastCv||m.ping||cv.width!==Math.round(box.clientWidth*Math.min(2,devicePixelRatio||1)))draw()},120);
window.KPMap={draw,st}})();

;
/* ../tour.js */
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
/* ../paste.js */
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
/* ../blood.js */
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
