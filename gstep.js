/* ============ generic living-figure stepper ============
   <div class="ex gstep" data-gen="name"> … .q … </div>  — GEN[name]() returns {steps:[{h,p,cap,fig}]}
   The figure, caption and step text are rebuilt in place; heights lock to the tallest step. */
window.GEN=window.GEN||{};
window.initGsteps=function(root){(root||document).querySelectorAll('.ex.gstep:not(.ready)').forEach(ex=>{const g=GEN[ex.dataset.gen];if(!g)return;
  let spec;try{spec=g();}catch(e){console.error(ex.dataset.gen,e);return;}ex.classList.add('ready');
  ex.insertAdjacentHTML('beforeend',`<div class="exgrid"><div class="exfig"><figure class="fig livefig algfig"><div class="algpanel"></div><figcaption class="livecap"></figcaption></figure>
  <div class="stepbar"><button class="btn ghost prevBtn" type="button">הקודם</button><span class="prog"></span><button class="btn nextBtn" type="button">השלב הבא</button><button class="btn ghost allBtn" type="button">לסוף</button></div></div>
  <div class="steps">${spec.steps.map(s=>`<div class="step"><div class="sh">${s.h}</div>${s.p||''}</div>`).join('')}</div></div>`);
  const steps=[...ex.querySelectorAll('.step')],panel=ex.querySelector('.algpanel'),cap=ex.querySelector('.livecap'),box=ex.querySelector('.steps');
  const prevB=ex.querySelector('.prevBtn'),nextB=ex.querySelector('.nextBtn'),allB=ex.querySelector('.allBtn'),prog=ex.querySelector('.prog');let cur=0;
  function go(i,fwd){cur=Math.max(0,Math.min(steps.length-1,i));steps.forEach((s,j)=>{s.hidden=j!==cur;s.classList.toggle('new',j===cur&&!!fwd);});
    const st=spec.steps[cur];panel.innerHTML=typeof st.fig==='function'?st.fig():st.fig||'';cap.innerHTML=st.cap||'';
    prog.textContent=`שלב ${cur+1} מתוך ${steps.length}`;prevB.disabled=cur===0;nextB.disabled=allB.disabled=cur===steps.length-1;}
  function lock(){panel.style.minHeight=cap.style.minHeight=box.style.minHeight='';const keep=cur;let a=0,b=0,c=0;
    steps.forEach((_,j)=>{go(j);a=Math.max(a,panel.offsetHeight);b=Math.max(b,cap.offsetHeight);c=Math.max(c,box.offsetHeight);});
    panel.style.minHeight=a+'px';cap.style.minHeight=b+'px';box.style.minHeight=c+'px';go(keep);}
  prevB.onclick=()=>go(cur-1);nextB.onclick=()=>go(cur+1,true);allB.onclick=()=>go(steps.length-1);
  go(0);lock();let t;window.addEventListener('resize',()=>{clearTimeout(t);t=setTimeout(lock,150);});if(document.fonts)document.fonts.ready.then(lock);
  const d=ex.closest('details');if(d)d.addEventListener('toggle',()=>{if(d.open)lock();});
});};
/* small shared helpers */
window.H={
  esc:s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),
  x:s=>`<code class="xp">${s}</code>`,            // inline math/code (LTR)
  m:s=>`<p class="mathline"><code class="xp">${s}</code></p>`, // math on its own line
  set:(s,fresh='')=>`<span class="aset">${[...s].map(c=>`<b class="${fresh.includes(c)?'fresh':''}">${c}</b>`).join('')}</span>`,
  tbl:(head,rows,cls='')=>`<div class="rtwrap"><table class="rt ${cls}" dir="ltr"><thead><tr>${head.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr class="${r.cls||''}">${(r.c||r).map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
};
document.addEventListener('DOMContentLoaded',()=>initGsteps());
if(document.readyState!=='loading')setTimeout(()=>initGsteps(),0);
