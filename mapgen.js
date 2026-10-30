'use strict';{
/* ===== Stage 6: procedural maps, textures, light, styles ===== */
const R=s=>{let a=s>>>0||1;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
const ADD=[['pillar','Колонна','#5a514a'],['altar','Алтарь','#3b3430'],['table','Стол','#3b3430'],['rug','Ковёр','#5a1f1a'],['road','Дорога','#6b5a40'],['roof','Крыша','#4a2a20'],['torch','Факел','#3b3430'],['rubble','Обломки','#3b3430'],['bones','Кости','#3b3430'],['crate','Ящик','#3b3430']];
ADD.forEach(t=>{if(!TC[t[0]]){TILES.push(t);TC[t[0]]=t}});
const ICON={pillar:'●',altar:'⊓',table:'▭',rug:'▒',road:'·',roof:'▲',torch:'✦',rubble:'∴',bones:'☠',crate:'▤'};
const _ti=window.tileIcon;window.tileIcon=tileIcon=k=>ICON[k]||_ti(k);
const TYPES=[['dungeon','Подземелье'],['cave','Пещера'],['crypt','Склеп / храм'],['forest','Лес'],['village','Таверна / деревня']];
const NAMES={dungeon:['Чертоги','Казематы','Подвалы','Застенки'],cave:['Пещера','Грот','Логово','Нора'],crypt:['Склеп','Храм','Усыпальница','Святилище'],forest:['Чаща','Опушка','Тропа','Роща'],village:['Деревня','Постоялый двор','Хутор','Застава']};
const ADJ=['Чёрного Епископа','Ржавой Луны','Шепчущих Костей','Кривого Ворона','Семи Свечей','Пепельной Девы','Утопленника','Слепого Короля'];
function gen(type,W,H,seed,o){const r=R(seed),ri=n=>Math.floor(r()*n),g=Array(W*H).fill(''),I=(x,y)=>y*W+x,inb=(x,y)=>x>0&&y>0&&x<W-1&&y<H-1;
 const set=(x,y,t)=>{if(x>=0&&y>=0&&x<W&&y<H)g[I(x,y)]=t},get=(x,y)=>x>=0&&y>=0&&x<W&&y<H?g[I(x,y)]:'';const rooms=[];
 const carve=(x0,y0,x1,y1,t='floor')=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)set(x,y,t)};
 const walls=()=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(!g[I(x,y)]){let n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const t=get(x+dx,y+dy);if(t&&t!=='wall')n++}if(n)g[I(x,y)]='wall'}};
 const corridor=(a,b)=>{let x=a.cx,y=a.cy;const hf=r()<.5;const stepX=()=>{while(x!==b.cx){if(get(x,y)!=='floor')set(x,y,'floor');x+=Math.sign(b.cx-x)}},stepY=()=>{while(y!==b.cy){if(get(x,y)!=='floor')set(x,y,'floor');y+=Math.sign(b.cy-y)}};if(hf){stepX();stepY()}else{stepY();stepX()}};
 if(type==='dungeon'||type==='crypt'){const leaves=[];(function split(x,y,w,h,d){if(d>4||(w<12&&h<12)){leaves.push({x,y,w,h});return}const v=w>h?1:h>w?0:r()<.5;if(v&&w>=12){const s=5+ri(w-10);split(x,y,s,h,d+1);split(x+s,y,w-s,h,d+1)}else if(!v&&h>=12){const s=5+ri(h-10);split(x,y,w,s,d+1);split(x,y+s,w,h-s,d+1)}else leaves.push({x,y,w,h})})(1,1,W-2,H-2,0);
  leaves.forEach(l=>{const w=Math.max(3,Math.min(l.w-2,3+ri(l.w-3))),h=Math.max(3,Math.min(l.h-2,3+ri(l.h-3)));const x=l.x+1+ri(Math.max(1,l.w-w-1)),y=l.y+1+ri(Math.max(1,l.h-h-1));if(x+w>=W-1||y+h>=H-1)return;carve(x,y,x+w-1,y+h-1);rooms.push({x,y,w,h,cx:x+(w>>1),cy:y+(h>>1)})});
  for(let i=1;i<rooms.length;i++)corridor(rooms[i-1],rooms[i]);if(rooms.length>3)corridor(rooms[0],rooms[rooms.length-1]);walls();
  // doors at room borders where corridor enters
  rooms.forEach(rm=>{for(let x=rm.x-1;x<=rm.x+rm.w;x++)for(const y of[rm.y-1,rm.y+rm.h])door(x,y);for(let y=rm.y;y<rm.y+rm.h;y++)for(const x of[rm.x-1,rm.x+rm.w])door(x,y)});
  function door(x,y){if(get(x,y)!=='floor')return;const h=get(x-1,y)==='wall'&&get(x+1,y)==='wall',v=get(x,y-1)==='wall'&&get(x,y+1)==='wall';if((h||v)&&r()<.75)set(x,y,'door')}
  if(type==='crypt'){rooms.forEach((rm,i)=>{if(rm.w>=5&&rm.h>=5){for(let y=rm.y+1;y<rm.y+rm.h-1;y+=2){set(rm.x+1,y,'pillar');set(rm.x+rm.w-2,y,'pillar')}}if(i===rooms.length-1){set(rm.cx,rm.y+1,'altar');for(let y=rm.y+2;y<rm.y+rm.h-1;y++)if(get(rm.cx,y)==='floor')set(rm.cx,y,'rug')}if(r()<.5)set(rm.x+ri(rm.w),rm.y+ri(rm.h),'bones')})}
  else rooms.forEach(rm=>{if(r()<.35)set(rm.x+ri(rm.w),rm.y+ri(rm.h),'rubble');if(r()<.3)set(rm.x,rm.y,'crate')});
  if(rooms[0])set(rooms[0].cx,rooms[0].cy,'stairs')}
 else if(type==='cave'){for(let i=0;i<W*H;i++){const x=i%W,y=(i/W)|0;g[i]=inb(x,y)&&r()<.55?'floor':''}
  for(let k=0;k<5;k++){const n=g.slice();for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){let c=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(g[I(x+dx,y+dy)]==='floor')c++;n[I(x,y)]=c>=5?'floor':''}g.splice(0,g.length,...n)}
  // keep largest region
  const seen=new Uint8Array(W*H);let best=[];for(let i=0;i<W*H;i++)if(g[i]==='floor'&&!seen[i]){const st=[i],reg=[];seen[i]=1;while(st.length){const j=st.pop();reg.push(j);const x=j%W,y=(j/W)|0;[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{const k=I(x+dx,y+dy);if(inb(x+dx,y+dy)&&!seen[k]&&g[k]==='floor'){seen[k]=1;st.push(k)}})}if(reg.length>best.length)best=reg}
  const keep=new Set(best);for(let i=0;i<W*H;i++)if(g[i]==='floor'&&!keep.has(i))g[i]='';
  for(let k=0;k<2;k++){const s=best[ri(best.length)];const x=s%W,y=(s/W)|0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(get(x+dx,y+dy)==='floor'&&dx*dx+dy*dy<=4+r()*2)set(x+dx,y+dy,'water')}
  for(let k=0;k<best.length/40;k++){const s=best[ri(best.length)];if(g[s]==='floor')g[s]=r()<.5?'rubble':'bones'}
  walls();for(let k=0;k<6;k++){const s=best[ri(best.length)];rooms.push({cx:s%W,cy:(s/W)|0,x:s%W,y:(s/W)|0,w:1,h:1})}}
 else if(type==='forest'){g.fill('grass');for(let i=0;i<W*H;i++)if(r()<.28)g[i]='tree';
  for(let k=0;k<2;k++){const n=g.slice();for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){let c=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(g[I(x+dx,y+dy)]==='tree')c++;n[I(x,y)]=c>=4?'tree':'grass'}g.splice(0,g.length,...n)}
  let y=ri(H);for(let x=0;x<W;x++){set(x,y,'road');set(x,y+1,'road');if(r()<.3)y=Math.max(1,Math.min(H-3,y+(r()<.5?-1:1)))}
  const cx=3+ri(W-8),cy=3+ri(H-8);for(let dy=-2;dy<=2;dy++)for(let dx=-3;dx<=3;dx++)if(dx*dx/9+dy*dy/4<=1)set(cx+dx,cy+dy,'water');
  for(let k=0;k<4;k++){const x=1+ri(W-2),yy=1+ri(H-2);if(get(x,yy)==='grass'){set(x,yy,'rubble');rooms.push({cx:x,cy:yy,x,y:yy,w:1,h:1})}}}
 else if(type==='village'){g.fill('grass');const my=(H>>1);for(let x=0;x<W;x++){set(x,my,'road');set(x,my+1,'road')}const mx=(W>>1);for(let y=0;y<H;y++){set(mx,y,'road')}
  // tavern
  const tw=Math.min(10,W-4),th=Math.min(7,(H>>1)-2),tx=2,ty=my-th-1;carve(tx,ty,tx+tw-1,ty+th-1,'wall');carve(tx+1,ty+1,tx+tw-2,ty+th-2,'floor');set(tx+(tw>>1),ty+th-1,'door');
  for(let x=tx+2;x<tx+tw-2;x+=3)for(let y2=ty+2;y2<ty+th-2;y2+=2)set(x,y2,'table');set(tx+1,ty+1,'torch');set(tx+tw-2,ty+1,'torch');set(tx+tw-2,ty+th-2,'crate');rooms.push({x:tx+1,y:ty+1,w:tw-2,h:th-2,cx:tx+(tw>>1),cy:ty+(th>>1)});
  for(let k=0;k<8;k++){const w=3+ri(3),h=3+ri(2),x=1+ri(W-w-2),y2=1+ri(H-h-2);let ok=true;for(let yy=y2-1;yy<=y2+h;yy++)for(let xx=x-1;xx<=x+w;xx++)if(get(xx,yy)!=='grass')ok=false;if(!ok)continue;carve(x,y2,x+w-1,y2+h-1,'roof');set(x+(w>>1),y2+h-1,'door');rooms.push({x,y:y2,w,h,cx:x+(w>>1),cy:y2+(h>>1)})}
  for(let i=0;i<W*H;i++)if(g[i]==='grass'&&r()<.06)g[i]='tree';const wx=mx+2,wy=my+3;if(get(wx,wy)==='grass')set(wx,wy,'water')}
 // auto placement: traps, chests, torches
 const floors=[];for(let i=0;i<W*H;i++)if(g[i]==='floor'||g[i]==='grass')floors.push(i);
 if(o.traps){const n=Math.max(1,Math.round(floors.length/90));for(let k=0;k<n;k++){const i=floors[ri(floors.length)];if(g[i]==='floor'||g[i]==='grass')g[i]='trap'}}
 if(o.loot){rooms.slice(1).forEach(rm=>{if(r()<.45){const x=rm.x+ri(rm.w),y=rm.y+ri(rm.h);if(get(x,y)==='floor'||get(x,y)==='grass')set(x,y,'chest')}})}
 if(type!=='forest'&&type!=='village')rooms.forEach(rm=>{if(r()<.6){for(const[x,y]of[[rm.x,rm.y],[rm.x+rm.w-1,rm.y+rm.h-1]])if(get(x,y)==='floor'){set(x,y,'torch');break}}});
 return {g,rooms}}
KM.genMap=gen;
/* ---- new map sheet with generator ---- */
window.newMap=newMap=function(){const seed=Math.floor(Math.random()*99999);const st=LS.get('mgopt',{type:'dungeon',W:24,H:24,style:'dark',theme:'stone',traps:1,loot:1,light:1});
 openSheet(`<div class="sb-title">Новая карта</div><div class="sb-sub">Сгенерировать или начать с чистого листа</div>
 <label class="f">Тип местности</label>${chips('ty',TYPES,st.type)}
 <div class="row"><div class="grow"><label class="f">Ширина</label><input class="inp" id="nw" type="number" value="${st.W}"></div><div class="grow"><label class="f">Высота</label><input class="inp" id="nh" type="number" value="${st.H}"></div><div class="grow"><label class="f">Зерно</label><input class="inp" id="ns" type="number" value="${seed}"></div></div>
 <div class="row" style="margin-top:4px">${[['S',16,16],['M',24,24],['L',36,36],['XL',48,48]].map(([l,w,h])=>`<button class="btn sm" data-sz="${w}">${{S:'Малая',M:'Средняя',L:'Большая',XL:'Огромная'}[l]}</button>`).join('')}</div>
 <label class="f">Стиль</label>${chips('st',[['dark','Тёмный'],['parch','Пергамент']],st.style)}
 <label class="f">Камень / тема</label>${chips('th',[['stone','Серый камень'],['sand','Песчаник'],['moss','Мшистый'],['blood','Кровавый']],st.theme)}
 <div class="row" style="margin-top:8px;flex-wrap:wrap;gap:12px"><label><input type="checkbox" id="oT"${st.traps?' checked':''}> Ловушки</label><label><input type="checkbox" id="oL"${st.loot?' checked':''}> Сундуки</label><label><input type="checkbox" id="oLi"${st.light?' checked':''}> Освещение</label><label><input type="checkbox" id="oF"> Скрыть туманом</label></div>
 <label class="f">Название</label><input class="inp" id="nn" placeholder="Придумаю сам">
 <div class="muted" style="font-size:12.5px;margin-top:6px">1 клетка = 1,5 м. Всё сгенерированное можно править кистью.</div>
 <div class="row" style="margin-top:14px"><button class="btn red grow" id="ngen">✦ Сгенерировать</button><button class="btn" id="nok">Пустая</button></div>`,r=>{
 const S={...st};bindChips(r,(n,v)=>{if(n==='ty')S.type=v;if(n==='st')S.style=v;if(n==='th')S.theme=v});
 $$('[data-sz]',r).forEach(b=>b.onclick=()=>{$('#nw',r).value=$('#nh',r).value=b.dataset.sz});
 const make=empty=>{const W=Math.max(8,Math.min(64,+$('#nw',r).value||24)),H=Math.max(8,Math.min(64,+$('#nh',r).value||24)),seed=+$('#ns',r).value||1;
  Object.assign(S,{W,H,traps:$('#oT',r).checked,loot:$('#oL',r).checked,light:$('#oLi',r).checked});LS.set('mgopt',S);
  const res=empty?{g:Array(W*H).fill('')}:gen(S.type,W,H,seed,S);const rr=R(seed);const nm=$('#nn',r).value||(empty?'Карта '+(maps.length+1):NAMES[S.type][Math.floor(rr()*4)]+' '+ADJ[Math.floor(rr()*ADJ.length)]);
  const fog=Array(W*H).fill($('#oF',r).checked?1:0);const mm={id:uid(),name:nm,W,H,g:res.g,fog,tok:[],style:S.style,theme:S.theme,light:S.light&&!empty,grid:true,seed,type:S.type};
  if(res.rooms&&res.rooms[0]&&fog[0]){const a=res.rooms[0];for(let y=a.y-1;y<=a.y+a.h;y++)for(let x=a.x-1;x<=a.x+a.w;x++)if(x>=0&&y>=0&&x<W&&y<H)fog[y*W+x]=0}
  maps.push(mm);mapCur=mm.id;saveMaps();closeSheet();rMap();toast(empty?'Пустая карта':'Карта сгенерирована · зерно '+seed)};
 $('#ngen',r).onclick=()=>make(0);$('#nok',r).onclick=()=>make(1)})};
/* ---- menu: style, grid, light, regenerate, import/export ---- */
const _menu=mapMenu;window.mapMenu=mapMenu=function(){_menu();const m=curMap();const L=$('.sheet .list')||$$('.list').pop();if(!L)return;
 L.insertAdjacentHTML('afterbegin',`<div class="row" style="flex-wrap:wrap;gap:6px"><button class="btn sm" id="mxg">${m.grid===false?'▦ Показать сетку':'▢ Скрыть сетку'}</button><button class="btn sm" id="mxs">${m.style==='parch'?'☾ Тёмный стиль':'📜 Пергамент'}</button><button class="btn sm" id="mxl">${m.light?'☀ Без освещения':'🕯 Освещение'}</button><button class="btn sm${m.shared?' red':''}" id="mxp">${m.shared?'◎ Видна игрокам':'◌ Показать игрокам'}</button>${m.seed?`<button class="btn sm" id="mxr">⟳ Новое зерно</button>`:''}</div>`);
 L.insertAdjacentHTML('beforeend',`<button class="btn" id="mxe">⇩ Экспорт карты (файл)</button><button class="btn" id="mxi">⇧ Импорт карты</button>`);
 const T=(k,v)=>{histPush(m);m[k]=v;saveMaps();closeSheet();rMap()};
 $('#mxg').onclick=()=>T('grid',m.grid===false);$('#mxs').onclick=()=>T('style',m.style==='parch'?'dark':'parch');$('#mxl').onclick=()=>T('light',!m.light);$('#mxp').onclick=()=>{T('shared',!m.shared);toast(m.shared?'Карта (с туманом) у игроков':'Карта скрыта от игроков')};
 const rg=$('#mxr');if(rg)rg.onclick=()=>{histPush(m);m.seed=Math.floor(Math.random()*99999);const o=LS.get('mgopt',{traps:1,loot:1});m.g=gen(m.type||'dungeon',m.W,m.H,m.seed,o).g;m.tok=[];saveMaps();closeSheet();rMap();KM.undoToast('Новая карта · зерно '+m.seed,()=>{histMove(m,'hist','redo');rMap()})};
 $('#mxe').onclick=()=>{const o={...m};delete o.hist;delete o.redo;const b=new Blob([JSON.stringify({kniga:'map',v:1,map:o})],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=(m.name||'карта')+'.json';document.body.append(a);a.click();a.remove();toast('Файл карты сохранён')};
 $('#mxi').onclick=()=>{const i=document.createElement('input');i.type='file';i.accept='.json,application/json';i.onchange=()=>{const f=i.files[0];if(!f)return;f.text().then(t=>{try{const d=JSON.parse(t),mm=d.map||d;if(!mm.W||!mm.g)throw 0;mm.id=uid();mm.fog=mm.fog||Array(mm.W*mm.H).fill(0);mm.tok=mm.tok||[];maps.push(mm);mapCur=mm.id;saveMaps();closeSheet();rMap();toast('Карта импортирована')}catch(e){toast('Это не файл карты')}})};i.click()}};
/* ---- textured renderer with cached base layer ---- */
const PAL={dark:{stone:['#3a3633','#2e2a27','#151211','#4a4440'],sand:['#4a3e2e','#3d3325','#1a140d','#5c4d38'],moss:['#2f3a2c','#263023','#111510','#3e4a39'],blood:['#3a2826','#2e1f1d','#160c0b','#4a3230']},
 parch:{stone:['#e6d6b0','#dccaa0','#3a2a1a','#c9b588'],sand:['#ead8ac','#e0cb98','#4a3216','#cdb37e'],moss:['#dcdcb0','#cfd0a0','#2e3a1e','#b8bd88'],blood:['#e8d2b0','#dfc29e','#5a1810','#c9a888']}};
const cache=new Map();
function base(m,CS){const key=m.id+'|'+CS+'|'+(m.style||'dark')+(m.theme||'stone')+(m.grid!==false)+'|'+m.g.join(',').length+'|'+hashG(m.g);const c0=cache.get(m.id);if(c0&&c0.key===key)return c0.cv;
 const cv=document.createElement('canvas');cv.width=m.W*CS;cv.height=m.H*CS;const g=cv.getContext('2d');paint(g,m,CS);cache.set(m.id,{key,cv});if(cache.size>6)cache.delete(cache.keys().next().value);return cv}
function hashG(a){let h=0;for(let i=0;i<a.length;i++){const s=a[i];h=(h*31+(s?s.charCodeAt(0)*7+s.length:1)+i)|0}return h}
function paint(g,m,CS){const P=(PAL[m.style]||PAL.dark)[m.theme]||PAL.dark.stone,par=m.style==='parch',r=R(m.seed||7),W=m.W,H=m.H,get=(x,y)=>x>=0&&y>=0&&x<W&&y<H?m.g[y*W+x]:'';
 g.fillStyle=par?'#d9c49a':'#0b0807';g.fillRect(0,0,W*CS,H*CS);
 if(par){for(let k=0;k<W*H/3;k++){g.fillStyle=`rgba(120,80,30,${r()*.08})`;g.beginPath();g.arc(r()*W*CS,r()*H*CS,r()*CS*1.5,0,7);g.fill()}}
 const isWall=t=>t==='wall'||!t;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=m.g[y*W+x],X=x*CS,Y=y*CS;if(!t){if(!par){g.fillStyle=`rgba(255,255,255,${r()*.015})`;g.fillRect(X,Y,CS,CS)}else{g.strokeStyle='rgba(60,40,20,.18)';g.beginPath();for(let k=0;k<3;k++){const o=r()*CS;g.moveTo(X+o,Y);g.lineTo(X,Y+o)}g.stroke()}continue}
  const fl=['floor','chest','trap','door','stairs','pillar','altar','table','torch','rubble','bones','crate','rug'].includes(t);
  if(fl){g.fillStyle=(x*7+y*13)%3?P[0]:P[1];g.fillRect(X,Y,CS,CS);// flagstones
   g.strokeStyle=par?'rgba(60,40,20,.25)':'rgba(0,0,0,.35)';g.lineWidth=1;const o=((y%2)*CS/2);g.beginPath();g.moveTo(X,Y+CS/2);g.lineTo(X+CS,Y+CS/2);g.moveTo(X+((o+CS/4)%CS),Y);g.lineTo(X+((o+CS/4)%CS),Y+CS/2);g.moveTo(X+((o+CS*3/4)%CS),Y+CS/2);g.lineTo(X+((o+CS*3/4)%CS),Y+CS);g.stroke();
   for(let k=0;k<3;k++){g.fillStyle=par?`rgba(90,60,30,${r()*.15})`:`rgba(255,240,220,${r()*.05})`;g.fillRect(X+r()*CS,Y+r()*CS,1.5,1.5)}}
  if(t==='grass'||t==='tree'){g.fillStyle=par?'#d2cc98':((x+y)%2?'#2c3d22':'#304425');g.fillRect(X,Y,CS,CS);g.strokeStyle=par?'rgba(70,90,30,.45)':'rgba(120,160,80,.3)';g.beginPath();for(let k=0;k<4;k++){const a=X+r()*CS,b=Y+r()*CS;g.moveTo(a,b);g.lineTo(a+(r()-.5)*3,b-3-r()*2)}g.stroke()}
  if(t==='road'){g.fillStyle=par?'#cdb07a':'#4f4232';g.fillRect(X,Y,CS,CS);for(let k=0;k<4;k++){g.fillStyle=par?'rgba(90,60,20,.3)':'rgba(0,0,0,.3)';g.beginPath();g.arc(X+r()*CS,Y+r()*CS,1+r()*2,0,7);g.fill()}}
  if(t==='water'||t==='lava'){const w=t==='water';g.fillStyle=w?(par?'#9fb4b0':'#163848'):'#7a1c08';g.fillRect(X,Y,CS,CS);g.strokeStyle=w?(par?'rgba(40,70,80,.5)':'rgba(140,200,230,.25)'):'rgba(255,170,60,.6)';g.lineWidth=1.2;for(let k=0;k<2;k++){const yy=Y+8+k*14+r()*3;g.beginPath();g.moveTo(X+2,yy);g.bezierCurveTo(X+10,yy-4,X+20,yy+4,X+CS-2,yy);g.stroke()}g.lineWidth=1;
   for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const n=get(x+dx,y+dy);if(n&&n!==t){g.fillStyle=w?'rgba(220,240,240,.18)':'rgba(255,200,80,.35)';g.fillRect(dx>0?X+CS-2:X,dy>0?Y+CS-2:Y,dx?2:CS,dy?2:CS)}}}
  if(t==='roof'){g.fillStyle=par?'#a8805a':'#4a2a20';g.fillRect(X,Y,CS,CS);g.strokeStyle=par?'rgba(70,40,20,.5)':'rgba(0,0,0,.45)';g.beginPath();for(let k=0;k<4;k++){g.moveTo(X,Y+k*8+4);g.lineTo(X+CS,Y+k*8+4)}g.stroke()}
  if(t==='wall'){g.fillStyle=P[2];g.fillRect(X,Y,CS,CS);// bricks with edge highlight on floor-facing sides
   g.fillStyle=P[3];for(let row=0;row<4;row++){const off=row%2?CS/4:0;for(let c=-1;c<2;c++){const bx=X+off+c*CS/2+1,bw=CS/2-2;const x0=Math.max(X+1,bx),x1=Math.min(X+CS-1,bx+bw);if(x1>x0){g.globalAlpha=.25+r()*.25;g.fillRect(x0,Y+row*CS/4+1,x1-x0,CS/4-2)}}}g.globalAlpha=1;
   g.strokeStyle=par?'#2a1a0c':'#000';g.lineWidth=par?2.4:2;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const n=get(x+dx,y+dy);if(n&&n!=='wall'){g.beginPath();const ex=dx>0?X+CS:X,ey=dy>0?Y+CS:Y;if(dx){g.moveTo(ex,Y);g.lineTo(ex+(r()-.5),Y+CS)}else{g.moveTo(X,ey);g.lineTo(X+CS,ey+(r()-.5))}g.stroke();g.fillStyle='rgba(0,0,0,.28)';if(dx)g.fillRect(dx>0?X+CS:X-6,Y,6,CS);else g.fillRect(X,dy>0?Y+CS:Y-6,CS,6)}}g.lineWidth=1}
  // props
  const ink=par?'#2a1a0c':'#0a0605';
  if(t==='door'){const hz=isWall(get(x-1,y))&&isWall(get(x+1,y));g.fillStyle=par?'#8a5a2a':'#6b3e18';if(hz)g.fillRect(X,Y+CS*.36,CS,CS*.28);else g.fillRect(X+CS*.36,Y,CS*.28,CS);g.strokeStyle=ink;g.lineWidth=1.5;if(hz)g.strokeRect(X+.5,Y+CS*.36,CS-1,CS*.28);else g.strokeRect(X+CS*.36,Y+.5,CS*.28,CS-1);g.lineWidth=1}
  if(t==='stairs'){for(let k=0;k<6;k++){g.fillStyle=`rgba(0,0,0,${.08+k*.08})`;g.fillRect(X+2,Y+2+k*CS/6.5,CS-4,CS/6.5-1)}g.strokeStyle=ink;g.strokeRect(X+2,Y+2,CS-4,CS-4)}
  if(t==='pillar'){g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.arc(X+CS/2+3,Y+CS/2+3,CS*.36,0,7);g.fill();g.fillStyle=par?'#bfae88':'#5f5852';g.beginPath();g.arc(X+CS/2,Y+CS/2,CS*.36,0,7);g.fill();g.strokeStyle=ink;g.lineWidth=1.5;g.stroke();g.beginPath();g.arc(X+CS/2,Y+CS/2,CS*.22,0,7);g.stroke();g.lineWidth=1}
  if(t==='altar'){g.fillStyle=par?'#8c7a5a':'#4d4038';g.fillRect(X+3,Y+8,CS-6,CS-16);g.strokeStyle=ink;g.strokeRect(X+3,Y+8,CS-6,CS-16);g.fillStyle='#7a1a12';g.beginPath();g.arc(X+CS/2,Y+CS/2,3,0,7);g.fill()}
  if(t==='rug'){g.fillStyle=par?'rgba(120,30,20,.55)':'#4a1612';g.fillRect(X+2,Y,CS-4,CS);g.strokeStyle=par?'rgba(200,160,80,.6)':'rgba(190,150,70,.45)';g.strokeRect(X+5,Y,CS-10,CS)}
  if(t==='table'){g.fillStyle='rgba(0,0,0,.3)';g.fillRect(X+5,Y+9,CS-6,CS-14);g.fillStyle=par?'#9a6a3a':'#5a3a1e';g.fillRect(X+3,Y+7,CS-6,CS-14);g.strokeStyle=ink;g.strokeRect(X+3,Y+7,CS-6,CS-14);g.fillStyle=par?'#6a4020':'#3a2410';g.beginPath();g.arc(X+CS/2,Y+3,3,0,7);g.arc(X+CS/2,Y+CS-3,3,0,7);g.fill()}
  if(t==='crate'){g.fillStyle=par?'#a07a48':'#5e4022';g.fillRect(X+5,Y+5,CS-10,CS-10);g.strokeStyle=ink;g.strokeRect(X+5,Y+5,CS-10,CS-10);g.beginPath();g.moveTo(X+5,Y+5);g.lineTo(X+CS-5,Y+CS-5);g.moveTo(X+CS-5,Y+5);g.lineTo(X+5,Y+CS-5);g.stroke()}
  if(t==='rubble'||t==='bones'){for(let k=0;k<6;k++){g.fillStyle=t==='bones'?(par?'#f2e8d0':'#cfc6b0'):(par?'#8a7a60':'#5a524a');g.beginPath();if(t==='bones'){const a=X+4+r()*(CS-8),b=Y+4+r()*(CS-8),an=r()*3;g.save();g.translate(a,b);g.rotate(an);g.fillRect(-5,-1,10,2);g.arc(-5,0,2,0,7);g.arc(5,0,2,0,7);g.fill();g.restore()}else{g.arc(X+r()*CS,Y+r()*CS,1.5+r()*3,0,7);g.fill()}}}
  if(t==='tree'){g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.arc(X+CS/2+4,Y+CS/2+4,CS*.55,0,7);g.fill();const c=par?['#6a7a3a','#8a9a4a']:['#1a3018','#2c4a26'];g.fillStyle=c[0];g.beginPath();for(let k=0;k<7;k++){const a=k/7*6.28,rr=CS*(.42+r()*.14);g.arc(X+CS/2+Math.cos(a)*CS*.18,Y+CS/2+Math.sin(a)*CS*.18,rr*.55,0,7)}g.fill();g.fillStyle=c[1];g.beginPath();g.arc(X+CS/2-3,Y+CS/2-3,CS*.24,0,7);g.fill();g.strokeStyle=ink;g.globalAlpha=.4;g.beginPath();g.arc(X+CS/2,Y+CS/2,CS*.5,0,7);g.stroke();g.globalAlpha=1}
  if(t==='chest'){g.fillStyle='rgba(0,0,0,.35)';g.fillRect(X+8,Y+11,CS-12,CS-17);g.fillStyle=par?'#8a5a24':'#6b3e18';g.fillRect(X+6,Y+9,CS-12,CS-17);g.strokeStyle=ink;g.strokeRect(X+6,Y+9,CS-12,CS-17);g.fillStyle='#b8902a';g.fillRect(X+6,Y+13,CS-12,2);g.fillRect(X+CS/2-2,Y+14,4,5)}
  if(t==='trap'){g.strokeStyle=par?'rgba(120,20,10,.75)':'rgba(170,40,30,.7)';g.setLineDash([3,2]);g.strokeRect(X+4,Y+4,CS-8,CS-8);g.setLineDash([]);g.beginPath();for(let k=0;k<3;k++)for(let j=0;j<3;j++){g.moveTo(X+9+k*7,Y+9+j*7);g.arc(X+9+k*7,Y+9+j*7,1.3,0,7)}g.fillStyle=g.strokeStyle;g.fill()}
  if(t==='torch'){g.fillStyle='#3a2410';g.fillRect(X+CS/2-2,Y+CS/2-2,4,10);g.fillStyle='#e8a040';g.beginPath();g.arc(X+CS/2,Y+CS/2-4,4,0,7);g.fill()}}
 if(m.grid!==false){g.strokeStyle=par?'rgba(60,40,20,.22)':'rgba(255,255,255,.07)';g.lineWidth=1;g.beginPath();for(let x=0;x<=W;x++){g.moveTo(x*CS+.5,0);g.lineTo(x*CS+.5,H*CS)}for(let y=0;y<=H;y++){g.moveTo(0,y*CS+.5);g.lineTo(W*CS,y*CS+.5)}g.stroke()}
 if(par){const gr=g.createRadialGradient(W*CS/2,H*CS/2,Math.min(W,H)*CS*.3,W*CS/2,H*CS/2,Math.max(W,H)*CS*.75);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(90,50,10,.35)');g.fillStyle=gr;g.fillRect(0,0,W*CS,H*CS)}}
function lightLayer(m,CS){const key=m.id+'L'+hashG(m.g)+m.tok.map(t=>t.k==='pc'?t.x+','+t.y:'').join('');const c0=cache.get(m.id+'L');if(c0&&c0.key===key)return c0.cv;
 const cv=document.createElement('canvas');cv.width=m.W*CS;cv.height=m.H*CS;const g=cv.getContext('2d');g.fillStyle='rgba(4,2,8,.42)';g.fillRect(0,0,cv.width,cv.height);g.globalCompositeOperation='destination-out';
 const L=[];m.g.forEach((t,i)=>{if(t==='torch'||t==='lava'||t==='altar')L.push([i%m.W,(i/m.W)|0,t==='torch'?5:t==='altar'?3:2])});m.tok.forEach(t=>{if(t.k==='pc')L.push([t.x,t.y,4])});
 if(m.type==='forest'||m.type==='village')L.length=0;
 L.forEach(([x,y,r])=>{const X=x*CS+CS/2,Y=y*CS+CS/2,gr=g.createRadialGradient(X,Y,0,X,Y,r*CS);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(.6,'rgba(0,0,0,.7)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(X-r*CS,Y-r*CS,r*CS*2,r*CS*2)});
 g.globalCompositeOperation='source-over';L.forEach(([x,y,r],i)=>{const X=x*CS+CS/2,Y=y*CS+CS/2,gr=g.createRadialGradient(X,Y,0,X,Y,r*CS*.8);gr.addColorStop(0,'rgba(255,160,60,.16)');gr.addColorStop(1,'rgba(255,120,40,0)');g.fillStyle=gr;g.fillRect(X-r*CS,Y-r*CS,r*CS*2,r*CS*2)});
 cache.set(m.id+'L',{key,cv});return cv}
window.drawMap=drawMap=function(g,m,CS,fogA){g.drawImage(base(m,CS),0,0);
 if(m.light&&m.type!=='forest'&&m.type!=='village')g.drawImage(lightLayer(m,CS),0,0);
 const par=m.style==='parch';
 m.tok.forEach(t=>{const X=t.x*CS+CS/2,Y=t.y*CS+CS/2;if(fogA>=1&&m.fog[t.y*m.W+t.x])return;g.fillStyle='rgba(0,0,0,.5)';g.beginPath();g.arc(X+1,Y+2,CS*.4,0,7);g.fill();
  const col=t.k==='pc'?'#c9a45a':t.k==='mon'?'#8a1c14':'#3c5a7a';g.fillStyle=col;g.beginPath();g.arc(X,Y,CS*.4,0,7);g.fill();g.strokeStyle=par?'#2a1a0c':'#e8dcc0';g.lineWidth=2;g.stroke();g.lineWidth=1;
  g.fillStyle=t.k==='pc'?'#1a1208':'#f0e6d0';g.font=`700 ${t.n.length>1?11:15}px Georgia,serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(t.n,X,Y+1)});
 for(let i=0;i<m.fog.length;i++)if(m.fog[i]){const x=i%m.W,y=(i/m.W)|0;g.fillStyle=par?`rgba(60,40,22,${fogA})`:`rgba(5,3,3,${fogA})`;g.fillRect(x*CS,y*CS,CS,CS);if(fogA<1){g.fillStyle='rgba(120,120,140,.12)';g.fillRect(x*CS,y*CS,CS,CS)}}};
}
