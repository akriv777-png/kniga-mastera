'use strict';
/* Заготовленные карты: детерминированная генерация по ключу, лениво, по тапу «Карта» */
(()=>{
const hs=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
function place(m,mons,key){if(!mons||!mons.length)return;const old=(m.tok||[]).filter(t=>t.k==='mon');m.tok=(m.tok||[]).filter(t=>t.k!=='mon');const pc=m.tok.filter(t=>t.k==='pc');const W=m.W;
 const FREE=c=>c&&!['wall','pit','water','lava','tree','cloud','air','rock','door','stairs'].includes(c);const used=new Set(m.tok.map(t=>t.y*W+t.x));(m.links||[]).forEach(l=>used.add(l.y*W+l.x));
 const cand=[];for(let i=0;i<m.g.length;i++){const x=i%W,y=(i/W)|0;if(!FREE(m.g[i])||used.has(i))continue;if(window.KM_SOLID&&KM_SOLID(m,x,y))continue;const d=pc.length?Math.min(...pc.map(p=>Math.hypot(p.x-x,p.y-y))):99;if(d<6)continue;cand.push(i)}
 const pos=old.map(t=>t.y*W+t.x).filter(i=>!used.has(i));let h=hs(key);const pick=()=>{if(pos.length)return pos.shift();if(!cand.length)return -1;h=Math.imul(h^h>>>15,2246822507)>>>0;const k=h%cand.length;return cand.splice(k,1)[0]};
 mons.forEach(([id,n])=>{const mo=D.monsters.find(z=>z.id===id);if(!mo)return;let g0=-1;for(let q=1;q<=n;q++){let i=-1;if(g0>=0){const gx=g0%W,gy=(g0/W)|0;let best=-1,bd=9;cand.forEach((c,k)=>{const d=Math.max(Math.abs(c%W-gx),Math.abs(((c/W)|0)-gy));if(d<bd){bd=d;best=k}});if(best>=0&&bd<=3)i=cand.splice(best,1)[0]}if(i<0)i=pick();if(i<0)return;if(g0<0)g0=i;{const ci=cand.indexOf(i);if(ci>=0)cand.splice(ci,1)}used.add(i);
  m.tok.push({id:uid(),x:i%W,y:(i/W)|0,n:(mo.n[0]+(n>1?q:'')).slice(0,3),c:'#d42a22',k:'mon',mid:mo.id,nm:mo.n+(n>1?' '+q:''),hp:mo.hp,mhp:mo.hp,ac:mo.ac,sz:mo.sz})}})}
function open(key,o){if(typeof maps==='undefined'||!KM.genSet)return toast('Карты недоступны');
 let m=maps.find(x=>x.pre===key);let made=0;
 if(!m){const opt=Object.assign({type:'dungeon',W:24,H:24,dens:50,dang:40,th:'',th2:'',doors:1,traps:1,chests:1,mons:1,fog:1,dec:1,link:1,pcs:1},o||{},{seed:key});let set;
  try{set=KM.genSet(opt,0)}catch(e){console.error(e);return toast('Не получилось: '+e.message)}
  place(set[0],o&&o.mon,key);set.forEach((x,i)=>{delete x._G;x.pre=i?key+'#'+i:key;x.shared=false;maps.push(x)});if(o&&o.name)set[0].name=o.name;m=set[0];made=set.length}
 mapCur=m.id;try{view={s:1,x:0,y:0}}catch(e){}saveMaps();closeSheet();
 const mi=SECTIONS.findIndex(s=>s[0]==='map');const fin=()=>{try{rMap()}catch(e){}toast(made?(made>1?`Карта готова · связанных: ${made}`:'Карта готова'):'Открыта: '+m.name)};
 if(S.sec===mi)fin();else{KM.go(mi);setTimeout(fin,450)}}
KM.preMap=open;
/* тип карты для ваншота по ключевым словам */
const KW=[[/мельниц/,'mill'],[/таверн|трактир|корчм/,'tavern'],[/склеп|крипт/,'crypt'],[/гробниц|курган|пирамид/,'tomb'],[/катакомб/,'catacombs'],[/канализ|сток/,'sewer'],[/тюрьм|темниц/,'prison'],[/культ|секта|алтар/,'cult'],[/некромант/,'necro'],[/алхими|лаборатор/,'lab'],[/вампир/,'vampire'],[/дракон/,'dragon'],[/паук|паутин/,'spider'],[/слиз/,'slime'],[/ледян|лёд|мороз|снег/,'icecave'],[/вулкан|лава/,'volcano'],[/шахт|рудник/,'mine'],[/грот|подводн/,'grotto'],[/пещер/,'cave'],[/подземь/,'underdark'],[/болот|топь/,'swamp'],[/джунгл/,'jungle'],[/пустын|пес[ко]/,'desert'],[/оазис/,'oasis'],[/гор[аыне]|перевал/,'mountain'],[/каньон|ущель/,'canyon'],[/озер|остров/,'lake'],[/побереж|берег|маяк/,'coast'],[/фе[йия]|фей/,'feywild'],[/чащ|роща/,'deepforest'],[/лес/,'forest'],[/деревн|сел[оа]|хутор/,'village'],[/рынок|ярмарк/,'market'],[/порт|док|причал/,'port'],[/корабл|судн/,'ship'],[/трущоб/,'slums'],[/караван/,'caravan'],[/ферм/,'farm'],[/кладбищ|могил/,'graveyard'],[/поле бо|битв/,'battlefield'],[/особняк|поместь/,'manor'],[/дворец|бал/,'palace'],[/лавк|магазин/,'shop'],[/кузн/,'smithy'],[/храм|монастыр|святилищ/,'temple'],[/библиотек|архив/,'library'],[/замок/,'castle'],[/крепост|форт/,'fortress'],[/башн|маг/,'magetower'],[/часов/,'clocktower'],[/лагер/,'camp'],[/город|улиц/,'city'],[/подвал|погреб/,'cellar'],[/дом/,'house']];
KM.osType=o=>{const t=(o.n+' '+(o.scenes||[]).join(' ')+' '+o.hook).toLowerCase();for(const [r,ty] of KW)if(r.test(t)&&(!KM.LOCTYPES||KM.LOCTYPES.some(l=>l[0]===ty)))return ty;return 'dungeon'};
KM.osMap=(o,i)=>{const lv=+(String(o.lvl).match(/\d+/)||[1])[0];open('os-'+i,{type:KM.osType(o),W:26,H:24,dang:Math.min(80,25+lv*5),name:o.n})};
})();
