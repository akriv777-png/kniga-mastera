/* Ленивая догрузка контент-паков (≈1.6 МБ): после первого экрана, без блокировки запуска. Список заменяется бандлом при публикации. */
(function(){const L=["pk.ac9670fe.js"];
let st=0;const cbs=[];
const fin=()=>{st=2;const D=window.DATA;if(D&&D.items)delete D.items._dd;try{window.KM_tc&&KM_tc()}catch(e){}dispatchEvent(new Event('kmpacks'));cbs.splice(0).forEach(f=>{try{f()}catch(e){}})};
const load=()=>{if(st)return;st=1;let i=0;const nx=()=>{if(i>=L.length)return fin();const s=document.createElement('script');s.src=L[i++];s.async=false;s.onload=s.onerror=nx;document.head.appendChild(s)};nx()};
window.KMP={load,ready:()=>st===2,then:f=>st===2?f():(cbs.push(f),load())};
const go=()=>setTimeout(()=>(window.requestIdleCallback?requestIdleCallback(load,{timeout:800}):load()),300);
if(document.readyState==='complete')go();else addEventListener('load',go)})();
