'use strict';
/* Резервная связь «Стола»: MQTT поверх WSS через публичные брокеры, сообщения шифруются AES-GCM ключом из кода комнаты.
   Используется, когда прямое WebRTC-соединение (PeerJS) не устанавливается — мобильный интернет, строгий NAT, блокировки. */
window.KMRelay=(function(){
 const BROKERS=['wss://public.cloud.shiftr.io','wss://broker.emqx.io:8084/mqtt','wss://broker.hivemq.com:8884/mqtt','wss://test.mosquitto.org:8081/mqtt'];
 const te=new TextEncoder(),td=new TextDecoder();
 const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
 const b64=u=>{let s='';const a=new Uint8Array(u);for(let i=0;i<a.length;i+=0x8000)s+=String.fromCharCode.apply(null,a.subarray(i,i+0x8000));return btoa(s)};
 const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
 async function keys(code){code=String(code).toUpperCase();const h=hex(await crypto.subtle.digest('SHA-256',te.encode('kniga-mastera-room:'+code))).slice(0,32);
  const base=await crypto.subtle.importKey('raw',te.encode(code),'PBKDF2',false,['deriveKey']);
  const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:te.encode('km-relay-v1'),iterations:60000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);return{h,key}}
 async function enc(key,obj){const iv=crypto.getRandomValues(new Uint8Array(12));const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,te.encode(JSON.stringify(obj)));return b64(iv)+'.'+b64(ct)}
 async function dec(key,s){const [a,b]=String(s).split('.');const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(a)},key,unb64(b));return JSON.parse(td.decode(pt))}
 /* role: 'dm' | 'p'; me: id игрока; onMsg(from,msg); onStatus(text,ok) */
 async function open(code,role,me,onMsg,onStatus){
  if(!window.mqtt||!window.crypto||!crypto.subtle){onStatus&&onStatus('ретранслятор недоступен в этом браузере',false);return null}
  const {h,key}=await keys(code);const T='kmr1/'+h+'/';const mine=role==='dm'?T+'dm':T+'p/'+me;
  let bi=0,cl=null,ended=false,ok=false,fails=0;
  const R={get ok(){return ok},broker:'',async send(to,msg){if(!cl||!ok)return false;try{const body=await enc(key,{f:role==='dm'?'dm':me,m:msg});cl.publish(to==='dm'?T+'dm':T+'p/'+to,body,{qos:1});return true}catch(e){return false}},
   end(){ended=true;try{cl&&cl.end(true)}catch(e){}}};
  function go(){if(ended)return;const url=BROKERS[bi%BROKERS.length];R.broker=url.split('/')[2];onStatus&&onStatus('ретранслятор: подключаюсь к '+R.broker.split(':')[0]+'…',false);
   try{cl&&cl.end(true)}catch(e){}
   cl=mqtt.connect(url,{clientId:'km'+Math.random().toString(36).slice(2,12),clean:true,connectTimeout:8000,reconnectPeriod:0,keepalive:30,protocolVersion:4,...(url.includes('shiftr')?{username:'public',password:'public'}:{})});
   cl.on('connect',()=>{fails=0;cl.subscribe(mine,{qos:1},err=>{if(err)return;ok=true;onStatus&&onStatus('ретранслятор подключён ('+R.broker.split(':')[0]+')',true)})});
   cl.on('message',async(t,p)=>{try{const d=await dec(key,typeof p==='string'?p:td.decode(p));if(d&&d.m)onMsg(d.f,d.m)}catch(e){}});
   const down=()=>{if(ended)return;const was=ok;ok=false;if(!was)bi++;fails++;onStatus&&onStatus('ретранслятор: нет связи, повтор…',false);clearTimeout(R.t);R.t=setTimeout(go,Math.min(15000,800*fails))};
   cl.on('close',down);cl.on('error',()=>{try{cl.end(true)}catch(e){}})}
  go();return R}
 return{open,BROKERS}})();
