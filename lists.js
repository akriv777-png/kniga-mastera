'use strict';{
/* Единая панель сортировки/фильтров/избранного для всех каталогов (оборачивает lazyList) */
const ST=LS.get('lists',{});const FV=LS.get('favs',{});const sv=()=>{LS.set('lists',ST);LS.set('favs',FV)};
const RAR=['Обычный','Необычный','Редкий','Очень редкий','Легендарный','Артефакт','Разная'];
const gp=c=>{const m=String(c||'').replace(/\s/g,'').match(/([\d.,]+)(пм|зм|эм|см|мм)/);if(!m)return -1;return parseFloat(m[1].replace(',','.'))*({пм:10,зм:1,эм:.5,см:.1,мм:.01}[m[2]])};
const crn=v=>{v=String(v);return v.includes('/')?eval(v):+v};
const SZ=['Крошечный','Маленький','Средний','Большой','Огромный','Громадный'];
const CFG={
 mon:{t:'monsters',sorts:[['n','Имя'],['cr','Опасность'],['xp','Опыт'],['hp','Хиты'],['ac','КД'],['sz','Размер']],key:{n:x=>x.n,cr:x=>crn(x.cr),xp:x=>x.xp||0,hp:x=>x.hp,ac:x=>x.ac,sz:x=>SZ.indexOf(x.sz)},
  filters:{sz:['Размер',SZ.map(s=>[s,s]),(x,v)=>x.sz===v],src:['Источник',[['srd','Основные правила'],['book','Книга (оригинальные)']],(x,v)=>v==='book'?!!x.book:!x.book],leg:['Особые',[['lg','Легендарные'],['rc','С перезарядкой'],['sp','Заклинатели']],(x,v)=>v==='lg'?(x.lg||[]).length>0:v==='rc'?[...(x.a||[])].some(a=>/перезаряд/i.test(a.n)):[...(x.f||[])].some(a=>/заклинан|колдовств/i.test(a.n))]}},
 sp:{t:'spells',sorts:[['n','Имя'],['l','Уровень'],['sc','Школа'],['t','Время']],key:{n:x=>x.n,l:x=>x.l,sc:x=>x.sc,t:x=>/реакц/.test(x.t)?0:/бонус/.test(x.t)?1:/1 действ/.test(x.t)?2:3},
  filters:{dmg:['Урон',[['y','Наносит урон'],['n','Без урона']],(x,v)=>v==='y'?!!x.dmg:!x.dmg],tm:['Время',[['a','1 действие'],['b','Бонусное'],['r','Реакция'],['l','Дольше']],(x,v)=>v==='a'?/^1 действ/.test(x.t):v==='b'?/бонус/.test(x.t):v==='r'?/реакц/.test(x.t):!/действ|реакц/.test(x.t)]}},
 it:{t:'items',sorts:[['n','Имя'],['cost','Цена'],['w','Вес'],['rar','Редкость']],key:{n:x=>x.n,cost:x=>gp(x.cost),w:x=>x.w||0,rar:x=>RAR.indexOf(x.rar)},
  filters:{att:['Настройка',[['y','Требует'],['n','Не требует']],(x,v)=>v==='y'?!!x.att:!x.att],src:['Источник',[['srd','Справочник'],['art','Артефакты Книги'],['insp','Вдохновлённые легендами']],(x,v)=>v==='srd'?!x.art:v==='art'?!!x.art&&!x.insp:!!x.insp],w:['Вес',[['0','Невесомое'],['l','До 2 кг'],['h','Тяжёлое (>5 кг)']],(x,v)=>v==='0'?!x.w:v==='l'?(x.w||0)<=2:(x.w||0)>5],cost:['Цена',[['c','До 10 зм'],['m','10–100 зм'],['e','Дороже 100 зм']],(x,v)=>{const g=gp(x.cost);return v==='c'?g>=0&&g<10:v==='m'?g>=10&&g<=100:g>100}]}},
 npc:{t:'npcs',sorts:[['n','Имя'],['r','Роль/народ']],key:{n:x=>x.n,r:x=>x.r||''},filters:{src:['Источник',[['b','Из Книги'],['u','Мои']],(x,v)=>v==='u'?String(x.id).startsWith('u'):!String(x.id).startsWith('u')]}}};
function kindOf(el,items){const x=items[0]||{};if(el.id==='castList')return 'npc';if(el.id==='spList')return 'sp';if(el.id==='itList')return 'it';if(x.cr!=null)return 'mon';if(x.sc)return 'sp';return null}
const og=lazyList;
window.lazyList=lazyList=function(el,items,tpl){if(!el)return og.apply(this,arguments);const k=kindOf(el,items);if(!k)return og.apply(this,arguments);const C=CFG[k];const s=ST[k]=ST[k]||{s:'',d:1,f:{},fo:0};const fav=FV[C.t]=FV[C.t]||[];
 let L=items.slice();Object.entries(s.f).forEach(([f,v])=>{if(v&&C.filters[f])L=L.filter(x=>C.filters[f][2](x,v))});if(s.fo)L=L.filter(x=>fav.includes(x.id));
 if(s.s&&C.key[s.s]){const kf=C.key[s.s];L.sort((a,b)=>{const A=kf(a),B=kf(b);return (typeof A==='string'?A.localeCompare(B,'ru'):A-B)*s.d})}
 L.sort((a,b)=>(fav.includes(b.id)?1:0)-(fav.includes(a.id)?1:0));
 bar(el,k,C,s,items.length,L.length);
 const t2=x=>tpl(x).replace(/^(\s*<div class="[^"]*card[^"]*"[^>]*>)/,`$1<button class="fav${fav.includes(x.id)?' on':''}" data-fav="${esc(x.id)}" aria-label="В избранное">${fav.includes(x.id)?'★':'☆'}</button>`);
 if(!el._favb){el._favb=1;el.addEventListener('click',e=>{const b=e.target.closest('[data-fav]');if(!b)return;e.stopPropagation();e.preventDefault();const f=FV[CFG[el._k].t];const id=b.dataset.fav;const i=f.indexOf(id);i>=0?f.splice(i,1):f.push(id);sv();b.classList.toggle('on',i<0);b.textContent=i<0?'★':'☆';toast(i<0?'В избранном — всегда сверху':'Убрано из избранного')},true)}el._k=k;
 if(!L.length){el.innerHTML=`<div class="empty">Ничего не найдено.${Object.values(s.f).some(Boolean)||s.fo?' <button class="btn sm" data-lreset>Сбросить фильтры</button>':''}</div>`;const r=el.querySelector('[data-lreset]');if(r)r.onclick=()=>{s.f={};s.fo=0;sv();render()};return}
 return og.call(this,el,L,t2)};
function bar(el,k,C,s,tot,n){let b=el.previousElementSibling;if(!b||!b.classList.contains('lbar')){b=document.createElement('div');b.className='lbar';el.before(b)}
 const nf=Object.values(s.f).filter(Boolean).length;const sl=(C.sorts.find(x=>x[0]===s.s)||['','Как в книге'])[1];
 b.innerHTML=`<button class="lb" data-lb="sort">⇅ ${sl}</button>${s.s?`<button class="lb" data-lb="dir" aria-label="Направление">${s.d>0?'↑':'↓'}</button>`:''}<button class="lb${s.fo?' on':''}" data-lb="fav">★ Избранное</button><button class="lb${nf?' on':''}" data-lb="flt">⚲ Фильтры${nf?' · '+nf:''}</button><span class="lcount">${n}${n!==tot?' из '+tot:''}</span>`;
 b.onclick=e=>{const x=e.target.closest('[data-lb]');if(!x)return;const a=x.dataset.lb;
  if(a==='dir'){s.d=-s.d;sv();render()}if(a==='fav'){s.fo=s.fo?0:1;sv();render()}
  if(a==='sort')openSheet(`<div class="sb-title">Сортировка</div><div class="list" style="margin-top:10px">${[['','Как в книге'],...C.sorts].map(([v,l])=>`<button class="btn${s.s===v?' red':''}" data-so="${v}">${l}</button>`).join('')}</div>`,r=>r.querySelectorAll('[data-so]').forEach(q=>q.onclick=()=>{s.s=q.dataset.so;s.d=1;sv();closeSheet();render()}));
  if(a==='flt')openSheet(`<div class="sb-title">Фильтры</div>${Object.entries(C.filters).map(([f,[l,opts]])=>`<label class="f">${l}</label><div class="chips">${[['','Все'],...opts].map(([v,t])=>`<button class="chip${(s.f[f]||'')===v?' on':''}" data-ff="${f}" data-fv="${v}">${t}</button>`).join('')}</div>`).join('')}<button class="btn dark" id="lfr" style="width:100%;margin-top:12px">Сбросить всё</button>`,r=>{r.querySelectorAll('[data-ff]').forEach(q=>q.onclick=()=>{s.f[q.dataset.ff]=q.dataset.fv;sv();r.querySelectorAll(`[data-ff="${q.dataset.ff}"]`).forEach(z=>z.classList.toggle('on',z===q));render(true)});r.querySelector('#lfr').onclick=()=>{s.f={};sv();closeSheet();render()}})}}
function render(keepSheet){const y=page.scrollTop;try{window.render?window.render():KM.go(S.sec)}catch(e){KM.go(S.sec)}page.scrollTop=y}
KM.lists={ST,FV,CFG};
}
{/* Универсальная панель для прочих списков (герои, заметки, задания, карты, раздатки, инвентарь) */
const DS=LS.get('dlists',{});const dsv=()=>LS.set('dlists',DS);
const txt=c=>(c.querySelector('.t')?.textContent||c.textContent||'').trim();
const num=c=>{const m=(c.querySelector('.m')?.textContent||'').match(/(\d+[.,]?\d*)\s*(кг|зм)/);return m?parseFloat(m[1].replace(',','.')):0};
function enhance(root,scope){[...new Set([...root.querySelectorAll('.card')].map(c=>c.parentElement))].forEach((L,ix)=>{if(L.classList.contains('dbar')||L.closest('#tabbar'))return;if(L.id==='npcList'||L.id==='spList'||L.id==='itList'||L.id==='castList'||L.closest('.cb-list,[data-nolist]'))return;const cards=[...L.children].filter(c=>c.classList.contains('card'));if(cards.length<3)return;
 const key=scope+':'+(L.id||ix);const s=DS[key]=DS[key]||{q:'',s:'',pin:[]};
 cards.forEach((c,i)=>{c.dataset.o=i;const h=txt(c).slice(0,60);c.dataset.h=h;if(!c.querySelector('.pin')){const b=document.createElement('button');b.className='pin'+(s.pin.includes(h)?' on':'');b.textContent=s.pin.includes(h)?'★':'☆';b.setAttribute('aria-label','Закрепить');b.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();const k=s.pin.indexOf(h);k>=0?s.pin.splice(k,1):s.pin.push(h);dsv();b.classList.toggle('on',k<0);b.textContent=k<0?'★':'☆';apply()},true);c.append(b)}});
 let bar=L.previousElementSibling;if(!bar||!bar.classList.contains('dbar')){bar=document.createElement('div');bar.className='lbar dbar';L.before(bar)}
 const hasW=cards.some(c=>/кг|зм/.test(c.querySelector('.m')?.textContent||''));
 const SO=[['','Как есть'],['az','А–Я'],['za','Я–А'],...(hasW?[['w','Вес/цена ↓']]:[])];
 bar.innerHTML=`<input class="lq" placeholder="Поиск в списке…" value="${esc(s.q)}"><button class="lb" data-ds>⇅ ${SO.find(x=>x[0]===s.s)?.[1]||'Как есть'}</button>`;
 const apply=()=>{const q=s.q.toLowerCase();const arr=[...L.children].filter(c=>c.dataset.o!=null);arr.forEach(c=>c.style.display=!q||c.textContent.toLowerCase().includes(q)?'':'none');
  arr.sort((a,b)=>{const pa=s.pin.includes(a.dataset.h)?1:0,pb=s.pin.includes(b.dataset.h)?1:0;if(pa!==pb)return pb-pa;if(s.s==='az')return txt(a).localeCompare(txt(b),'ru');if(s.s==='za')return txt(b).localeCompare(txt(a),'ru');if(s.s==='w')return num(b)-num(a);return a.dataset.o-b.dataset.o}).forEach(c=>L.append(c))};
 const inp=bar.querySelector('.lq');inp.oninput=()=>{s.q=inp.value;dsv();apply()};
 bar.querySelector('[data-ds]').onclick=()=>{const i=SO.findIndex(x=>x[0]===s.s);s.s=SO[(i+1)%SO.length][0];dsv();bar.querySelector('[data-ds]').textContent='⇅ '+SO.find(x=>x[0]===s.s)[1];apply()};apply()})}
const og=KM.go;KM.go=function(i){const r=og.apply(this,arguments);setTimeout(()=>enhance(page,'s'+S.sec),60);return r};
new MutationObserver(()=>{clearTimeout(enhance.t);enhance.t=setTimeout(()=>{enhance(page,'s'+S.sec);const sh=document.querySelector('#sheet.open');if(sh)enhance(sh,'sheet')},120)}).observe(document.body,{childList:true,subtree:true});
}
