'use strict';{
/* Компактный док: одна кнопка «Инструменты» (Помощник мастера) и отдельная — «Стол игроков» */
const d=document.createElement('div');d.id='kdock';d.setAttribute('data-noswipe','');
const t=document.createElement('button');t.id='kdock-t';t.setAttribute('aria-label','Помощник мастера');t.textContent='?';t.onclick=()=>document.getElementById('nvfab')?.click();
d.append(t);document.body.append(d);
const grab=()=>{const f=document.getElementById('tbfab');if(f&&f.parentNode!==d)d.prepend(f)};grab();setTimeout(grab,500);
}

;(()=>{const d=document.getElementById('kdock');if(!d)return;let t;const pg=document.getElementById('page');const hide=()=>{d.classList.add('kd-hide');clearTimeout(t);t=setTimeout(()=>d.classList.remove('kd-hide'),900)};(pg||window).addEventListener('scroll',hide,{passive:true})})();
;(()=>{const go=()=>{const d=document.getElementById('kdock');if(!d){return setTimeout(go,500)}let pt;const arm=()=>{clearTimeout(pt);pt=setTimeout(()=>d.classList.add('kd-peek'),2500)};
d.addEventListener('click',e=>{if(d.classList.contains('kd-peek')){e.stopPropagation();e.preventDefault();d.classList.remove('kd-peek');arm()}},true);
d.addEventListener('touchstart',()=>{if(!d.classList.contains('kd-peek'))arm()},{passive:true});
new MutationObserver(()=>{if(!d.classList.contains('kd-hide')&&!d.classList.contains('kd-peek'))arm()}).observe(d,{attributes:true,attributeFilter:['class']});arm()};
document.readyState==='loading'?addEventListener('DOMContentLoaded',go):go()})();
