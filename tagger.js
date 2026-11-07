/* text tagger: choose a category, click phrases; "בדוק" gives a clear per-phrase verdict */
(function(){
const CAT={e:['ישות','#2457C5'],a:['תכונה','#12806C'],k:['מפתח','#C0392B'],r:['קשר','#B86A00']};
const nm=k=>k?CAT[k][0]:'לא מסמנים';
document.querySelectorAll('.tagger').forEach(T=>{
  const toks=[...T.querySelectorAll('.tg')],out=T.querySelector('.tgout');let cur='e';
  T.querySelector('.tgbar').innerHTML=`<span class="tglab">סמן כ:</span>`+Object.entries(CAT).map(([k,[n,c]])=>`<button type="button" class="tgcat" data-c="${k}" style="--c:${c}">${n}</button>`).join('')+`<button type="button" class="tgcat" data-c="">מחק סימון</button><span class="tgsep"></span><button type="button" class="btn tgcheck">בדוק</button><button type="button" class="btn ghost tgshow">הצג תשובה</button><button type="button" class="btn ghost tgreset">התחל מחדש</button>`;
  const clear=()=>{T.querySelectorAll('.tgb').forEach(b=>b.remove());toks.forEach(t=>t.classList.remove('v-ok','v-bad','v-miss','dim'));T.classList.remove('checked');out.innerHTML='';};
  const paint=()=>{T.querySelectorAll('.tgcat').forEach(b=>b.setAttribute('aria-pressed',b.dataset.c===cur));
    toks.forEach(t=>{['m-e','m-a','m-k','m-r'].forEach(c=>t.classList.remove(c));if(t.dataset.mine)t.classList.add('m-'+t.dataset.mine);});};
  T.querySelector('.tgbar').addEventListener('click',e=>{const b=e.target.closest('.tgcat');if(b){cur=b.dataset.c;paint();}});
  toks.forEach(t=>{t.dataset.mine='';t.addEventListener('click',()=>{clear();t.dataset.mine=t.dataset.mine===cur?'':cur;paint();});
    t.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();t.click();}});});
  const badge=(t,cls,txt)=>t.insertAdjacentHTML('afterend',`<span class="tgb ${cls}">${txt}</span>`);
  T.querySelector('.tgcheck').onclick=()=>{clear();T.classList.add('checked');const bad=[],miss=[];let ok=0;
    toks.forEach(t=>{const want=t.dataset.k||'',mine=t.dataset.mine||'';
      if(!want&&!mine){t.classList.add('dim');return;}
      if(mine===want){ok++;t.classList.add('v-ok');badge(t,'ok','✓');}
      else if(!mine){miss.push(t);t.classList.add('v-miss');}
      else{bad.push(t);t.classList.add('v-bad');badge(t,'bad',`✗ ${want?nm(want):'לא לסמן'}`);}});
    const total=toks.filter(t=>t.dataset.k).length;
    const row=(t,kind)=>`<tr><td><span class="tgb ${kind}">${kind==='bad'?'✗':'חסר'}</span> <b>${t.textContent}</b></td><td>${kind==='bad'?`<s>${nm(t.dataset.mine)}</s> ← `:''}<b>${nm(t.dataset.k||'')}</b></td><td>${t.dataset.why||''}</td></tr>`;
    out.innerHTML=`<div class="tgsum"><span class="tgb ok">✓ ${ok} נכונים</span><span class="tgb bad">✗ ${bad.length} שגויים</span><span class="tgb miss">${miss.length} לא סומנו</span><span class="muted">מתוך ${total} ביטויים שצריך לסמן</span></div>`+
      (bad.length?`<h4 class="tgh">✗ איפה טעית</h4><div class="tbl"><table><tr><th>ביטוי</th><th>סימנת ← התשובה</th><th>למה</th></tr>${bad.map(t=>row(t,'bad')).join('')}</table></div>`:'')+(miss.length?`<details class="tgmiss"><summary>ביטויים שעוד לא סימנת (${miss.length}) — מסומנים בטקסט במסגרת מקווקוות</summary><div class="tbl"><table><tr><th>ביטוי</th><th>התשובה</th><th>למה</th></tr>${miss.map(t=>row(t,'miss')).join('')}</table></div></details>`:'')+(!bad.length&&!miss.length?'<div class="verdict good">הכל נכון ✓</div>':'');};
  T.querySelector('.tgshow').onclick=()=>{clear();toks.forEach(t=>{t.dataset.mine=t.dataset.k||'';});paint();
    out.innerHTML=`<div class="tbl"><table><tr><th>ביטוי</th><th>מה זה</th><th>למה</th></tr>${toks.map(t=>`<tr><td><b>${t.textContent}</b></td><td>${nm(t.dataset.k||'')}</td><td>${t.dataset.why||''}</td></tr>`).join('')}</table></div>`;};
  T.querySelector('.tgreset').onclick=()=>{clear();toks.forEach(t=>t.dataset.mine='');paint();};
  paint();});
})();
