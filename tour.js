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
 ['#nvfab','Помощник мастера','Шпаргалки, пошаговые сценарии (бой, проверка, отдых, уровень) и недавнее. Первый раз? Начните отсюда.'],
 ['.as-fab','Око — поиск всего','Спросите что угодно: «фаербол», «хилка», «сколько хитов у гоблина». Понимает сленг.'],
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
