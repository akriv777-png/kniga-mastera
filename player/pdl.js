/* Лёгкий загрузчик справочника игрока: pdata разбит на pd-items/pd-spells/pd-art и грузится после первого экрана */
(function(){const P=window.PDATA={spells:[],items:[],art:[]};const done={};
window.PDL=(k,a)=>{const t=P[k]||(P[k]=[]);for(let i=0;i<a.length;i++){const x=a[i];if(x&&typeof x.n==='string')x.n=x.n.replace(/\s*\((i{1,3}|iv|v)\)$/,(m,r)=>' '+r.toUpperCase());t.push(x)}done[k]=1;dispatchEvent(new CustomEvent('pdata',{detail:k}))};
const Q=['items','spells','art'];const load=()=>{const k=Q.shift();if(!k)return;const s=document.createElement('script');s.src='pd-'+k+'.js';s.onload=s.onerror=()=>setTimeout(load,30);document.head.appendChild(s)};
window.PDL.ready=k=>!!done[k];
const go=()=>(window.requestIdleCallback?requestIdleCallback(load,{timeout:600}):setTimeout(load,200));
if(document.readyState==='complete')go();else addEventListener('load',go)})();
