'use strict';{
/* Док ширмы: «?» помощник (шпаргалки) + стол игроков + поиск; всегда видим, одно касание */
const d=document.createElement('div');d.id='kdock';d.setAttribute('data-noswipe','');
const t=document.createElement('button');t.id='kdock-t';t.setAttribute('aria-label','Помощник мастера');t.textContent='?';t.onclick=()=>KM.novice&&KM.novice.hub();
const g=document.createElement('button');g.id='kdock-g';g.setAttribute('aria-label','Настройки раздела');g.textContent='⚙';g.onclick=()=>document.querySelector('#page .fx-gear')?.click();
d.append(t,g);document.body.append(d);
const grab=()=>{const f=document.getElementById('tbfab');if(f&&f.parentNode!==d)d.prepend(f)};grab();setTimeout(grab,500);
}
