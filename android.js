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
const tabs=[];window.KMTab=prev=>{if(guard)return;tabs.push(prev);if(tabs.length>30)tabs.shift();history.pushState({kmTab:1},'')};
addEventListener('popstate',()=>{if(skip){skip--;return}if(guard){guard=false;const m=top();if(m)m.c();return}if(tabs.length&&window.KM){const t=tabs.pop();KM.go.fromBack=1;KM.go(t)}});
/* --- портрет --- */
const lock=()=>{try{screen.orientation&&screen.orientation.lock&&screen.orientation.lock('portrait').catch(()=>{})}catch(e){}};lock();document.addEventListener('click',lock,{once:true});
{const o=document.createElement('div');o.id='km-rot';o.setAttribute('role','alert');o.innerHTML='<div class="km-rot-b"><div class="km-rot-i">📱</div><b>Поверните телефон вертикально</b><small>Книга читается только в портретной ориентации</small></div>';document.body.append(o)}
/* --- установка --- */
let dp=null;addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;document.documentElement.classList.add('can-install');window.dispatchEvent(new Event('km-install'))});
addEventListener('appinstalled',()=>{dp=null;document.documentElement.classList.remove('can-install');try{toast('Установлено на главный экран')}catch(e){}});
const how=()=>isIOS?'В Safari: кнопка «Поделиться» ⬆ → «На экран „Домой“».':isAnd?'В Chrome: меню ⋮ (вверху справа) → «Установить приложение» или «Добавить на главный экран». В Samsung Internet: ☰ → «Добавить страницу на» → «Главный экран».':'В Chrome/Edge: значок установки ⊕ в адресной строке или меню ⋮ → «Установить».';
window.KMInstall={can:()=>!!dp,standalone,isAndroid:isAnd,isIOS,how,
 prompt:async()=>{if(dp){dp.prompt();const r=await dp.userChoice.catch(()=>({}));dp=null;document.documentElement.classList.remove('can-install');return r&&r.outcome}alert('Как установить:\n'+how());return 'manual'},
 html:()=>standalone()?'':`<div class="card km-inst"><b>📲 Установить на телефон</b><p class="muted" style="font-size:13px;margin:4px 0 8px">Работает без интернета, открывается как приложение. ${how()}</p><button class="btn ac" data-kminst style="width:100%">${dp?'Установить':'Как установить'}</button></div>`};
document.addEventListener('click',e=>{if(e.target.closest('[data-kminst]'))KMInstall.prompt()});
const st=document.createElement('style');st.textContent=`#km-rot{display:none}@media (orientation:landscape) and (max-height:500px) and (pointer:coarse){#km-rot{display:flex;position:fixed;inset:0;z-index:9999;align-items:center;justify-content:center;background:radial-gradient(ellipse at center,#2a1a10 0,#0b0a12 75%);color:#e8c77a;text-align:center;font-family:'Cormorant Garamond',serif}#km-rot .km-rot-b{border:1px solid #a87b3e;padding:22px 34px;border-radius:14px;box-shadow:0 0 0 4px rgba(168,123,62,.15),0 0 40px rgba(0,0,0,.8) inset;display:flex;flex-direction:column;gap:6px}#km-rot b{font:400 24px 'Ruslan Display','Cormorant Garamond',serif;color:#e8c77a}#km-rot small{color:#b9a58a;font-size:15px}#km-rot .km-rot-i{font-size:42px;animation:kmrot 1.8s ease-in-out infinite}}@keyframes kmrot{0%,30%{transform:rotate(-90deg)}60%,100%{transform:rotate(0)}}@supports (height:100dvh){.handout,.hx-o{height:100dvh}.hx-p{max-height:84dvh}}`;document.head.append(st)})();

/* --- доступность: подписи значков; лёгкая вибрация (Android) --- */
;(()=>{const L={'✕':'Удалить','✎':'Изменить','＋':'Добавить','+':'Добавить','−':'Уменьшить','-':'Уменьшить','◎':'Стол игроков','👁':'Помощники','🔔':'Уведомления','⚙':'Настройки','?':'Подсказка','★':'В избранном','☆':'В избранное','⟳':'Обновить','↶':'Отменить','…':'Ещё','⋯':'Ещё','▶':'Старт','■':'Стоп','◀':'Назад'};
 const lab=root=>{(root.querySelectorAll?root:document).querySelectorAll('button:not([aria-label]),[role=button]:not([aria-label])').forEach(b=>{const t=(b.textContent||'').trim();if(L[t])b.setAttribute('aria-label',L[t]);else if(!t&&b.title)b.setAttribute('aria-label',b.title)})};
 let q=0;new MutationObserver(()=>{if(q)return;q=requestAnimationFrame(()=>{q=0;lab(document)})}).observe(document.body,{childList:true,subtree:true});lab(document);
 if(navigator.vibrate&&!matchMedia('(prefers-reduced-motion:reduce)').matches)document.addEventListener('pointerdown',e=>{const b=e.target.closest('.btn.red,.btn.ac,[data-shb],.dbtn,.kp-d');if(b)try{navigator.vibrate(7)}catch(_){}},{passive:true});})();
/* --- подсказка прокрутки вкладок (узкие экраны) --- */
;(()=>{const r=document.getElementById('ribbons');if(!r)return;const u=()=>{const m=r.scrollWidth-r.clientWidth>4;r.classList.toggle('more-r',m&&r.scrollLeft<r.scrollWidth-r.clientWidth-4);r.classList.toggle('more-l',m&&r.scrollLeft>4)};r.addEventListener('scroll',u,{passive:true});addEventListener('resize',u);new MutationObserver(u).observe(r,{childList:true});setTimeout(u,300);
const st=document.createElement('style');st.textContent='#ribbons.more-r{-webkit-mask-image:linear-gradient(90deg,#000 80%,transparent);mask-image:linear-gradient(90deg,#000 80%,transparent)}#ribbons.more-l{-webkit-mask-image:linear-gradient(90deg,transparent,#000 20%);mask-image:linear-gradient(90deg,transparent,#000 20%)}#ribbons.more-l.more-r{-webkit-mask-image:linear-gradient(90deg,transparent,#000 15%,#000 85%,transparent);mask-image:linear-gradient(90deg,transparent,#000 15%,#000 85%,transparent)}';document.head.append(st)})();
