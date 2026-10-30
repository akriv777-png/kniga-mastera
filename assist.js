'use strict';{
/* ===== Stage 7: offline assistant «Око» ===== */
const RULES=[
['Короткий отдых','Не меньше 1 часа. Можно потратить кости хитов: брось кость + мод. ТЕЛ за каждую. Колдуны восстанавливают ячейки.'],
['Долгий отдых','8 часов, не больше 2 часов лёгкой активности. Восстанавливаются все хиты и половина костей хитов (минимум 1), все ячейки. Истощение −1 (если поел и попил).'],
['Спасброски от смерти','При 0 хитов в начале хода брось к20 без модификаторов: 10+ успех, ниже — провал. 3 успеха — стабилен, 3 провала — смерть. 1 = два провала, 20 = встаёт с 1 хитом. Урон при 0 хитов — провал (крит — два).'],
['Концентрация','При получении урона — спасбросок ТЕЛ, СЛ 10 или половина урона (что больше). Провал — заклинание прерывается. Одновременно только одно заклинание с концентрацией.'],
['Укрытие','Половинное: +2 к КД и спасброскам ЛОВ. Три четверти: +5. Полное: нельзя выбрать целью напрямую.'],
['Преимущество и помеха','Бросаешь 2к20: с преимуществом берёшь больший, с помехой — меньший. Несколько источников не складываются; преимущество и помеха гасят друг друга.'],
['Инициатива','В начале боя все бросают к20 + мод. ЛОВ. Ходят по убыванию. При равенстве — по ЛОВ или решает Мастер.'],
['Действия в бою','В свой ход: перемещение, одно действие, при наличии — бонусное действие, одно реагирование до начала следующего хода. Действия: атака, заклинание, рывок, отход, уклонение, помощь, засада (подготовка), поиск, использование предмета.'],
['Критическое попадание','Натуральная 20 на атаке — попадание независимо от КД, кости урона бросаются дважды (модификатор один раз). Натуральная 1 — промах.'],
['Захват','Вместо одной атаки: проверка СИЛ (Атлетика) против Атлетики или Акробатики цели. Скорость цели становится 0.'],
['Падение','1к6 дробящего урона за каждые 3 м падения, максимум 20к6. Приземляется сбитым с ног.'],
['Истощение','1: помеха на проверки. 2: скорость вдвое. 3: помеха на атаки и спасброски. 4: максимум хитов вдвое. 5: скорость 0. 6: смерть.'],
['Сложность (СЛ)','Очень лёгкая 5, лёгкая 10, средняя 15, трудная 20, очень трудная 25, почти невозможная 30.'],
['Опыт за уровень','2: 300, 3: 900, 4: 2 700, 5: 6 500, 6: 14 000, 7: 23 000, 8: 34 000, 9: 48 000, 10: 64 000, 11: 85 000, 12: 100 000.'],
['Бонус мастерства','Уровни 1–4: +2, 5–8: +3, 9–12: +4, 13–16: +5, 17–20: +6.'],
['Пассивная Внимательность','10 + мод. МДР + бонус мастерства (если владеет). С преимуществом +5, с помехой −5.'],
['Сложность боя','Сложи опыт монстров, умножь: 1 монстр ×1, 2 — ×1,5, 3–6 — ×2, 7–10 — ×2,5, 11–14 — ×3, 15+ — ×4. Сравни с порогами отряда в «Бою».'],
['Видимость','Слабо заслонённая местность (сумрак): помеха на Внимательность. Сильно заслонённая (тьма): эффективно ослеплён.'],
['Невидимость и скрытность','Спрятаться — Скрытность против пассивной Внимательности. Невидимый: атаки по нему с помехой, его атаки — с преимуществом.'],
['Удушение','Задержать дыхание: 1 + мод. ТЕЛ минут (минимум 30 с). Затем раундов равно мод. ТЕЛ (минимум 1), после — 0 хитов.']];
const SYN={'хп':'хиты','hp':'хиты','жизни':'хиты','здоровье':'хиты','кд':'класс доспеха','ас':'класс доспеха','броня':'класс доспеха','конц':'концентрация','ини':'инициатива','инициатива':'инициатива','сл':'сложность','дс':'сложность','спас':'спасбросок','спасы':'спасбросок','отдых':'отдых','лут':'добыча','сокровища':'добыча','нип':'персонаж','npc':'персонаж','крит':'критическое','адв':'преимущество','помеха':'помеха','хил':'лечение','лечилка':'лечение','фаербол':'огненный шар','фб':'огненный шар','мм':'волшебная стрела','ячейки':'ячейка','слоты':'ячейка','опыт':'опыт','xp':'опыт','экспа':'опыт','ловушка':'ловушка','яд':'отравленный','стан':'ошеломлённый','паралич':'парализованный'};
const norm=s=>String(s||'').toLowerCase().replace(/ё/g,'е').replace(/[^a-zа-я0-9к+\- ]/g,' ');
const END=/(иями|ями|ами|ого|его|ому|ему|ыми|ими|ых|их|ой|ей|ий|ый|ая|яя|ое|ее|ые|ие|ам|ям|ах|ях|ом|ем|ую|юю|ов|ев|ы|и|а|я|о|е|у|ю|ь)$/;
const stem=w=>w.length>4?w.replace(END,''):w;
const toks=s=>norm(s).split(/\s+/).filter(Boolean).flatMap(w=>{const y=SYN[w];return y?norm(y).split(' '):[w]}).map(stem);
const lev=(a,b)=>{if(Math.abs(a.length-b.length)>2)return 9;const d=[...Array(b.length+1).keys()];for(let i=1;i<=a.length;i++){let p=d[0];d[0]=i;for(let j=1;j<=b.length;j++){const t=d[j];d[j]=Math.min(d[j]+1,d[j-1]+1,p+(a[i-1]===b[j-1]?0:1));p=t}}return d[b.length]};
let IDX=null;
function build(){const L=[];const add=(k,id,n,txt,open,sub)=>L.push({k,id,n,sub:sub||'',nt:toks(n),bt:new Set(toks(txt).slice(0,120)),open});
 DATA.spells.forEach(s=>add('Заклинание',s.id,s.n,[s.sc,s.dt,s.ds||s.tx||''].join(' '),()=>showSpell(s.id),(s.l?s.l+' круг':'заговор')+' · '+s.sc));
 DATA.monsters.forEach(m=>add('Монстр',m.id,m.n,[m.ty,m.sz].join(' '),()=>showMon(m.id),'ПО '+(m.cr??'?')+' · КД '+m.ac+' · '+m.hp+' хитов'));
 DATA.items.forEach(i=>add(i.art?'Артефакт':'Предмет',i.id,i.n,[i.cat,i.rar,i.sub||''].join(' '),()=>KM.showItem(i.id),[i.cat,i.rar,i.cost].filter(Boolean).join(' · ')));
 try{allCast().forEach(c=>add('НИП',c.id,c.n,[c.r,c.mo||'',c.ch||''].join(' '),()=>showCast(c.id),c.r))}catch(e){}
 CONDR.forEach(([n,t])=>add('Состояние',n,n,t,()=>say(`<b>${n}</b><br>${t}`),t.slice(0,60)+'…'));
 Object.entries(KM.GLOSS||{}).forEach(([n,t])=>add('Термин',n,n,t,()=>say(`<b>${n}</b><br>${t}`),t.slice(0,60)+'…'));
 RULES.forEach(([n,t])=>add('Правило',n,n,t,()=>say(`<b>${n}</b><br>${t}`),t.slice(0,60)+'…'));
 (typeof notes!=='undefined'?notes:[]).forEach(n=>add('Заметка',n.id,n.title,n.text||'',()=>{KM.go(KM.SECTIONS.findIndex(x=>x[0]==='notes'))},(n.text||'').slice(0,50)));
 (KM.players||[]).forEach(p=>add('Герой',p.id,p.name,p.cls||'',()=>KM.go(KM.SECTIONS.findIndex(x=>x[0]==='pcs')),`${p.cls||''} ${p.lvl||1} ур. · ${p.hp}/${p.maxhp} хитов · КД ${p.ac}`));
 IDX=L}
function search(q){if(!IDX)build();const Q=toks(q);if(!Q.length)return[];const out=[];
 for(const e of IDX){let s=0;for(const w of Q){let b=0;for(const t of e.nt){if(t===w)b=Math.max(b,10);else if(t.startsWith(w)||w.startsWith(t)&&t.length>3)b=Math.max(b,7);else if(w.length>3&&lev(w,t)<=(w.length>6?2:1))b=Math.max(b,5)}if(!b&&e.bt.has(w))b=2;s+=b}
  if(s>0){if(norm(e.n)===norm(q)||e.nt.join(' ')===Q.join(' '))s+=20;else if(e.nt.length===Q.length)s+=3;if(e.k==='Монстр'&&/хит|класс|кд|хп/.test(norm(q)))s+=8;out.push([s/Math.max(1,Q.length)+(e.k==='Правило'||e.k==='Состояние'?.5:0),e])}}
 return out.sort((a,b)=>b[0]-a[0]).slice(0,7).map(x=>x[1])}
const TIPS={sess:['Начни сцену: опиши три детали — звук, запах, свет.','Новички теряются: в конце сцены спроси «Что вы делаете?» каждого по имени.'],npc:['Дай НИП одну манеру речи и одно желание — этого достаточно.','«🎲» создаст случайного НИП за одно касание.'],spells:['Нажми «Каст» в книге заклинаний героя — ячейка спишется сама.'],items:['Генератор добычи учитывает уровень отряда и источник.'],combat:['Объявляй ход и следующего: «Ход Лиры, готовится Торин».','Концентрация: при уроне — спасбросок ТЕЛ, СЛ 10 или половина урона.'],dice:['Скажи «брось 2к6+3» — я брошу сам.'],pcs:['Пассивная Внимательность героев помогает не выдавать ловушки броском.'],map:['«＋» → «Сгенерировать» создаст подземелье, пещеру, склеп, лес или деревню.','Туман: включи «Вид игроков», чтобы показать карту за столом.'],notes:['Записывай имена, которые придумал на ходу, — игроки их запомнят.']};
const CHIPS=['Концентрация','Спасброски от смерти','Короткий отдых','Сложность боя','Укрытие','брось 1к20','Огненный шар','Гоблин'];
let box,log;
function say(h,me){const d=document.createElement('div');d.className='as-m'+(me?' me':'');d.innerHTML=h;log.append(d);log.scrollTop=1e9;return d}
function roll(e){const m=norm(e).match(/(\d*)\s*к\s*(\d+)\s*([+\-]\s*\d+)?/);if(!m)return null;const n=Math.min(50,+m[1]||1),d=+m[2],b=+(m[3]||'0').replace(/\s/g,'');const r=[];for(let i=0;i<n;i++)r.push(1+Math.floor(Math.random()*d));const t=r.reduce((a,c)=>a+c,0)+b;return `🎲 ${n}к${d}${b?(b>0?'+':'')+b:''}: [${r.join(', ')}]${b?' '+(b>0?'+':'')+b:''} = <b>${t}</b>`}
function answer(q){say(esc(q),1);const nq=norm(q);
 if(/^(брос|кинь|кубик|roll)|^\d*\s*к\d/.test(nq)||/\d*к\d+/.test(nq)&&nq.length<20){const r=roll(q);if(r)return say(r)}
 if(/^(как|что|помощь|помоги)\s*(ты|умеешь)?\s*$/.test(nq))return say('Я ищу без интернета по заклинаниям, монстрам, предметам, артефактам, НИП, состояниям, правилам, твоим заметкам и героям. Понимаю сокращения: хп, кд, конц, сл, нип. Могу бросить кости: «брось 3к6+2».');
 const pl=(KM.players||[]).find(p=>nq.includes(norm(p.name).split(' ')[0])&&p.name);if(pl&&/хит|хп|кд|жив|состо/.test(nq))return say(`<b>${esc(pl.name)}</b>: ${pl.hp}/${pl.maxhp} хитов, КД ${pl.ac}${(pl.conds||[]).length?', состояния: '+pl.conds.join(', '):''}.`);
 const R=search(q);if(!R.length)return say('Не нашёл. Попробуй короче или другим словом — например «яд», «отдых», «дракон».');
 const top=R[0];if(top.k==='Монстр'&&/хит|хп|кд|класс/.test(nq)){const m=DATA.monsters.find(x=>x.id===top.id);say(`<b>${esc(m.n)}</b>: ${m.hp} хитов (${m.hd}), КД ${m.ac}, ПО ${m.cr}, опыт ${m.xp}.`)}if((top.k==='Правило'||top.k==='Состояние'||top.k==='Термин')&&R.length)top.open();
 if(['Правило','Состояние','Термин'].includes(top.k)||top.k==='Монстр'&&/хит|хп|кд|класс/.test(nq))R.length=Math.min(R.length,3);
 const d=say(R.length<=3?'Ещё по теме:':'Нашёл — вот лучшее:');const ul=document.createElement('div');ul.className='as-res';ul.innerHTML=R.map((e,i)=>`<button data-i="${i}"><i>${e.k}</i><b>${esc(e.n)}</b><small>${esc(e.sub)}</small></button>`).join('');d.append(ul);
 ul.onclick=ev=>{const b=ev.target.closest('[data-i]');if(!b)return;const e=R[+b.dataset.i];if(['Правило','Состояние','Термин'].includes(e.k))e.open();else{close();e.open()}}}
function open(){if(!box){box=document.createElement('div');box.className='as-box';box.innerHTML=`<div class="as-hd"><span class="as-ey"></span><b>Око Книги</b><small>помощник без сети</small><button class="as-x" aria-label="Закрыть">✕</button></div><div class="as-log"></div><div class="as-chips"></div><form class="as-in"><input placeholder="Спроси: хп гоблина, конц, брось 2к6…" enterkeyhint="search"><button>➤</button></form>`;document.body.append(box);log=box.querySelector('.as-log');
  box.querySelector('.as-x').onclick=close;box.querySelector('form').onsubmit=e=>{e.preventDefault();const i=box.querySelector('input');if(i.value.trim()){answer(i.value.trim());i.value=''}};
  box.querySelector('.as-chips').onclick=e=>{const b=e.target.closest('button');if(b)answer(b.textContent)}}
 IDX=null;const sec=(KM.SECTIONS[(window.S||{}).sec]||[])[0]||(typeof S!=='undefined'?(KM.SECTIONS[S.sec]||[])[0]:'');const tips=TIPS[sec]||TIPS.sess;
 if(!log.childElementCount)say('Я — Око Книги. Спрашивай о правилах, заклинаниях, монстрах и твоих записях. Работаю без интернета.');
 say('<i>Совет:</i> '+tips[Math.floor(Math.random()*tips.length)]);
 box.querySelector('.as-chips').innerHTML=CHIPS.map(c=>`<button>${c}</button>`).join('');box.classList.add('on');document.documentElement.classList.add('as-open')}
function close(){box&&box.classList.remove('on');document.documentElement.classList.remove('as-open')}
const fab=document.createElement('button');fab.className='as-fab';fab.setAttribute('aria-label','Помощник');fab.innerHTML=`<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="none" stroke="#c9a45a" stroke-width=".8" stroke-dasharray="1 2"/><circle cx="20" cy="20" r="14" fill="none" stroke="#8a1c14" stroke-width=".6"/><path d="M7 20Q20 9 33 20Q20 31 7 20z" fill="#1a110c" stroke="#d9c49a" stroke-width="1.1"/><circle cx="20" cy="20" r="5" fill="#8a1c14"/><circle cx="20" cy="20" r="2" fill="#0a0605"/></svg>`;
fab.onclick=()=>box&&box.classList.contains('on')?close():open();document.body.append(fab);
KM.assist={open,close,search,answer};}
