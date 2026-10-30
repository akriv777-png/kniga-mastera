'use strict';
/* Раздатки по шаблону: выбор шаблона → поля [..] → предпросмотр → сохранить / сразу игрокам */
(()=>{const E=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const fields=t=>[...new Set((t.match(/\[[^\]]+\]/g)||[]).map(x=>x.slice(1,-1)))];
function fill(T,r){let n=T.n,t=T.t;fields(T.n+'\n'+T.t).forEach((f,i)=>{const v=(r.querySelector(`[data-f="${i}"]`)||{}).value||'['+f+']';n=n.split('['+f+']').join(v);t=t.split('['+f+']').join(v)});return{n,t}}
function form(T,done){const F=fields(T.n+'\n'+T.t);openSheet(`<div class="sb-title">${E(T.n)}</div><div class="muted" style="font-size:12.5px">${E(T.k)} · заполните поля, пустые останутся в скобках</div>${F.map((f,i)=>`<label class="f">${E(f)}</label><input class="inp" data-f="${i}" placeholder="${E(f)}">`).join('')}<div class="row" style="margin-top:12px;gap:8px;flex-wrap:wrap"><button class="btn" id="tpP">Предпросмотр</button><button class="btn" id="tpS">Сохранить</button><button class="btn red grow" id="tpG">📣 Сохранить и показать игрокам</button></div>`,r=>{
 r.querySelector('#tpP').onclick=()=>window.KMH&&KMH.open(fill(T,r));
 const save=sh=>{const o=fill(T,r);KM.hoAdd(o.n,o.t,sh);closeSheet();toast(sh?'Раздатка у игроков (вкладка «Мастер»)':'Раздатка сохранена в «Кампания → Раздатки»');done&&done()};
 r.querySelector('#tpS').onclick=()=>save(0);r.querySelector('#tpG').onclick=()=>save(1)})}
KM.hoTpl=done=>{const L=window.HANDOUT_TPL||[];openSheet(`<div class="sb-title">Раздатка по шаблону</div><div class="muted" style="font-size:12.5px">Выберите шаблон — дальше заполните поля</div><div class="list" style="margin-top:8px">${L.map((T,i)=>`<div class="card" data-tp="${i}" data-noshow><div class="grow"><div class="t">${E(T.n)}</div><div class="m">${E(T.k)} · ${E(T.t.split('\n')[0].slice(0,50))}</div></div></div>`).join('')}</div>`,r=>{r.querySelector('.list').onclick=e=>{const c=e.target.closest('[data-tp]');if(c)form(L[+c.dataset.tp],done)}})};
})();
