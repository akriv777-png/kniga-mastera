/* Анимации только на видимом: .aw без .anim-on — на паузе; скрытая вкладка — всё на паузе */
;(()=>{const SEL='.ring,.sp-circle,.result,.roll-stage,.fx-par,.ph,.empty,.sp-art-ring,.ssig,.card,.nsig,.esig,.cb-cur';const MAX=14;const on=new Set();const H=document.documentElement;
if(!('IntersectionObserver' in window))return;
const io=new IntersectionObserver(es=>{for(const e of es){const t=e.target;if(e.isIntersecting){if(on.size<MAX||!t.classList.contains('card')){on.add(t);t.classList.add('anim-on')}}else{on.delete(t);t.classList.remove('anim-on')}}},{rootMargin:'40px'});
const seen=new WeakSet();const watch=n=>{if(n.nodeType!==1)return;const a=n.matches(SEL)?[n]:[];a.push(...n.querySelectorAll(SEL));for(const el of a){if(seen.has(el))continue;seen.add(el);el.classList.add('aw');io.observe(el)}};
let q=[],raf=0;const flush=()=>{raf=0;const b=q;q=[];b.forEach(watch);on.forEach(t=>{if(!t.isConnected){on.delete(t);io.unobserve(t)}})};
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)q.push(n);if(!raf)raf=requestAnimationFrame(flush)}).observe(document.body,{childList:true,subtree:true});
watch(document.body);
const vis=()=>H.classList.toggle('anim-pause',document.hidden);document.addEventListener('visibilitychange',vis);addEventListener('pagehide',()=>H.classList.add('anim-pause'));addEventListener('pageshow',vis);vis();
let st;addEventListener('scroll',()=>{H.classList.add('scrolling');clearTimeout(st);st=setTimeout(()=>H.classList.remove('scrolling'),160)},{passive:true,capture:true});
})();
