/* Аватары по расе/типу существа: свой портрет > базовый webp > SVG-глиф */
;(()=>{
const R=[[/драконорожд/,'dragonborn'],[/полу-?эльф/,'halfelf'],[/полу-?орк/,'halforc'],[/полурослик|хоббит/,'halfling'],[/дроу|т[её]мн\S* эльф/,'drow'],[/эльф|эладрин/,'elf'],[/дварф|дворф/,'dwarf'],[/гном/,'gnome'],[/тифлинг/,'tiefling'],[/аасимар/,'aasimar'],[/голиаф/,'goliath'],[/гоблин|хобгоблин|багбир|кобольд/,'goblin'],[/орк/,'orc'],[/человек|люд/,'human'],
[/нежить|зомби|скелет|вампир|лич|призрак/,'undead'],[/исчади|демон|дьявол/,'fiend'],[/дракон/,'dragon'],[/элементал/,'elemental'],[/великан|огр|тролл/,'giant'],[/аберрац/,'aberration'],[/конструкт|голем/,'construct'],[/фе[яий]|фейр/,'fey'],[/слиз/,'ooze'],[/растени/,'plant'],[/небожител|ангел/,'celestial'],[/чудовищ/,'monstrosity'],[/звер|рой/,'beast'],[/гуманоид/,'humanoid']];
const key=s=>{s=String(s||'').toLowerCase();if(!s)return null;for(const[re,k]of R)if(re.test(s))return k;return null};
const monBy=id=>{try{return (typeof allMonsters==='function'?allMonsters():D.monsters).find(m=>m.id===id)}catch(e){return null}};
const monByN=n=>{if(!n)return null;try{return (typeof allMonsters==='function'?allMonsters():D.monsters).find(m=>m.n===n)}catch(e){return null}};
const pl=id=>{try{return players.find(p=>p.id===id)}catch(e){return null}};
/* сущность → {photo,k} */
function of(x){if(!x)return{};if(x.photo)return{photo:x.photo};
 if(x.pid){const p=pl(x.pid);if(p)return of(p)}
 if(x.mon||x.mid){const m=monBy(x.mon||x.mid);if(m)return of(m)}
 if(x.cid){try{const c=combat.list.find(c=>c.id===x.cid);if(c)return of(c)}catch(e){}}
 const k=key(x.race)||key(x.ty)||key(x.r)||(x.base||x.nm?key((monByN(x.base||x.nm)||{}).ty):null);return{k}}
function url(x,small){const o=of(x);return o.photo||(o.k?`img/av/${o.k}${small?'-s':''}.webp`:null)}
/* html-аватар; fallback — npcSigil или буква */
function html(x,px,cls){const u=url(x,px<=96);if(u)return `<img class="av nsig${cls?' '+cls:''}" src="${u}" width="${px}" height="${px}" alt="" loading="lazy" decoding="async" onerror="this.remove()">`;
 try{if(window.npcSigil)return npcSigil({id:x.id||x.n||x.name,n:x.n||x.name||'?',r:x.r||x.ty||x.race||''},px)}catch(e){}return ''}
KM.avKey=key;KM.avUrl=url;KM.avHtml=html;window.avHtml=html;
/* токены карты: картинка поверх кружка */
const C={};const img=u=>{if(C[u])return C[u];const i=new Image();i.decoding='async';i.onload=()=>{i.ok=1;clearTimeout(img.t);img.t=setTimeout(()=>{try{window.KM&&KM.redrawMap&&KM.redrawMap()}catch(e){}},60)};i.src=u;return C[u]=i};
const tok=(g,t,X,Y,r)=>{const u=url(t,1);if(!u)return;const i=img(u);if(!i.ok)return;g.save();g.beginPath();g.arc(X,Y,r,0,7);g.clip();g.drawImage(i,X-r,Y-r,r*2,r*2);g.restore();if(t.dead){g.fillStyle='rgba(0,0,0,.55)';g.beginPath();g.arc(X,Y,r,0,7);g.fill()}};KM.avTok=tok;
const _d=window.drawMap;if(typeof _d==='function'){window.drawMap=drawMap=function(g,m,CS,fogA){_d.apply(this,arguments);try{(m.tok||[]).forEach(t=>{if(fogA>=1&&(t.hid||m.fog&&m.fog[t.y*m.W+t.x]))return;tok(g,t,t.x*CS+CS/2,t.y*CS+CS/2,CS*.36)})}catch(e){}}}
})();
