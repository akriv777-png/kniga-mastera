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
