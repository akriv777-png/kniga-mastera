// Android/Chrome: кнопка «Назад» закрывает окна, установка PWA, dvh. Без iOS-only API.
(()=>{const ua=navigator.userAgent,isAnd=/Android/i.test(ua),isIOS=/iPhone|iPad|iPod/i.test(ua)&&!/Android/i.test(ua);
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
document.documentElement.classList.toggle('is-android',isAnd);
/* --- высота экрана: dvh/fallback --- */
const vh=()=>document.documentElement.style.setProperty('--vh',(window.visualViewport?visualViewport.height:innerHeight)/100+'px');vh();addEventListener('resize',vh);window.visualViewport&&visualViewport.addEventListener('resize',vh);
/* --- аппаратная «Назад» --- */
const top=()=>{const h=[...document.querySelectorAll('.handout,.hx-o')].pop();if(h)return{c:()=>{const x=h.querySelector('.hx-x');x?x.click():h.remove()}};const s=document.getElementById('sheet');if(s&&s.classList.contains('open'))return{c:()=>{try{closeSheet()}catch(e){s.classList.remove('show','open')}}};return null};
let guard=false,skip=0;
const sync=()=>{const m=top();if(m&&!guard){guard=true;history.pushState({kmModal:1},'')}else if(!m&&guard){guard=false;if(history.state&&history.state.kmModal){skip++;history.back()}}};
new MutationObserver(()=>setTimeout(sync,0)).observe(document.body,{childList:true,subtree:false,attributes:true,attributeFilter:['class'],});
const s0=document.getElementById('sheet');s0&&new MutationObserver(()=>setTimeout(sync,0)).observe(s0,{attributes:true,attributeFilter:['class']});
addEventListener('popstate',()=>{if(skip){skip--;return}if(guard){guard=false;const m=top();if(m)m.c()}});
/* --- установка --- */
let dp=null;addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;document.documentElement.classList.add('can-install');window.dispatchEvent(new Event('km-install'))});
addEventListener('appinstalled',()=>{dp=null;document.documentElement.classList.remove('can-install');try{toast('Установлено на главный экран')}catch(e){}});
const how=()=>isIOS?'В Safari: кнопка «Поделиться» ⬆ → «На экран „Домой“».':isAnd?'В Chrome: меню ⋮ (вверху справа) → «Установить приложение» или «Добавить на главный экран». В Samsung Internet: ☰ → «Добавить страницу на» → «Главный экран».':'В Chrome/Edge: значок установки ⊕ в адресной строке или меню ⋮ → «Установить».';
window.KMInstall={can:()=>!!dp,standalone,isAndroid:isAnd,isIOS,how,
 prompt:async()=>{if(dp){dp.prompt();const r=await dp.userChoice.catch(()=>({}));dp=null;document.documentElement.classList.remove('can-install');return r&&r.outcome}alert('Как установить:\n'+how());return 'manual'},
 html:()=>standalone()?'':`<div class="card km-inst"><b>📲 Установить на телефон</b><p class="muted" style="font-size:13px;margin:4px 0 8px">Работает без интернета, открывается как приложение. ${how()}</p><button class="btn ac" data-kminst style="width:100%">${dp?'Установить':'Как установить'}</button></div>`};
document.addEventListener('click',e=>{if(e.target.closest('[data-kminst]'))KMInstall.prompt()});
const st=document.createElement('style');st.textContent=`@supports (height:100dvh){.handout,.hx-o{height:100dvh}.hx-p{max-height:84dvh}}`;document.head.append(st)})();
