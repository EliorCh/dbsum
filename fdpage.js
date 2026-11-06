/* ============ page 5: functional dependencies ============ */
(function(){const {x,m,esc}=H;
const F5=FD.parse('A->BCE, CD->E, B->D, E->A, C->B');
const fdList=(F,opt={})=>`<ol class="fdlist" dir="ltr">${F.map((f,i)=>`<li class="${(opt.cls&&opt.cls[i])||''}">${opt.strike&&opt.strike[i]?fdStrike(f,opt.strike[i]):`${f.l}→${f.r}`}</li>`).join('')}</ol>`;
const fdStrike=(f,s)=>`${[...f.l].map(c=>s.side==='l'&&c===s.A?`<s>${c}</s>`:c).join('')}→${[...f.r].map(c=>s.side==='r'&&c===s.A?`<s>${c}</s>`:c).join('')}`;
window.fdList=fdList;
/* closure figure: FD list (used ones marked) + growing result */
function closureSteps(X,F,label){const {steps,res}=FD.closure(X,F);const out=[];
  const fig=(k)=>{const used=steps.slice(0,k).map(s=>F.indexOf(s.fd)),last=k?F.indexOf(steps[k-1].fd):-1;const cur=k?steps[k-1].res:FD.S(X);
    return `<div class="clofig"><div class="clof"><div class="rtname">F</div>${fdList(F,{cls:F.map((_,i)=>i===last?'on':used.includes(i)?'done':'')})}</div>
      <div class="clor"><div class="rtname"><bdi dir="ltr">${label||X}⁺</bdi></div>${H.set(cur,k?steps[k-1].add:'')}<div class="muted">${cur.length} מתוך ${FD.S([].concat(...F.map(f=>[...f.l+f.r])).join('')+X).length}</div></div></div>`;};
  out.push({h:`התחלה: ${x('result = '+FD.S(X))}`,p:`<p>הסגור מתחיל מהתכונות עצמן — כל קבוצה קובעת את עצמה (רפלקסיביות).</p>`,cap:`result = ${FD.S(X)}`,fig:()=>fig(0)});
  steps.forEach((s,k)=>out.push({h:`${x(s.fd.l+'→'+s.fd.r)}`,p:`<p>אגף שמאל ${x(s.fd.l)} כבר בתוך ${x(steps[k-1]?steps[k-1].res:FD.S(X))}, ולכן מוסיפים את אגף ימין.</p><p>נוסף: ${x(s.add)}</p>`,cap:`result = ${s.res}`,fig:()=>fig(k+1)}));
  out.push({h:'אין יותר שינויים — סוף',p:`<p>עוברים שוב על כל התלויות: אף אחת לא מוסיפה תכונה חדשה. האלגוריתם עוצר.</p>${m(`${FD.S(X)}⁺ = ${res}`)}`,cap:`${FD.S(X)}⁺ = ${res}`,fig:()=>fig(steps.length)});
  return out;}
GEN['f-closA']=()=>({steps:closureSteps('A',F5)});
GEN['f-closB']=()=>({steps:closureSteps('B',F5)});
/* candidate key: course algorithm */
GEN['f-key']=()=>{const R='ABCDE',{key,steps}=FD.oneKey(R,F5);let cur=R;const out=[{h:`התחלה: ${x('result = R = ABCDE')}`,p:'<p>R כולה היא תמיד מפתח־על. מנסים להוריד ממנה תכונה אחת בכל פעם.</p>',cap:'result = ABCDE',fig:()=>keyFig(R,R,'')}];
  steps.forEach(s=>{const before=cur;if(s.ok)cur=s.try;const now=cur;
    out.push({h:`מנסים להוריד את ${s.A}`,p:`${m(`(${s.try||'∅'})⁺ = ${s.c||'∅'}`)}<p>${s.ok?`הסגור הוא כל R — ${s.A} מיותרת ויוצאת.`:`הסגור אינו כל R — ${s.A} נחוצה ונשארת.`}</p>`,cap:`result = ${now}`,fig:()=>keyFig(R,now,s.A,s.ok)});});
  out.push({h:'התוצאה',p:`<p>המפתח שהתקבל: ${x(key)}. אבל הסדר משנה: אם היינו מנסים להוריד קודם את E, היינו מקבלים מפתח אחר.</p><p>כל המפתחות הקבילים (בדיקה של כל תת־הקבוצות): ${x(FD.keys(R,F5).join(', '))}</p>`,cap:`מפתח קביל: ${key}`,fig:()=>keyFig(R,key,'')});
  return {steps:out};};
function keyFig(R,cur,A,ok){return `<div class="keyfig">${[...R].map(c=>`<span class="kc ${cur.includes(c)?'in':'out'}${c===A?(ok?' drop':' keep'):''}">${c}</span>`).join('')}</div>`;}
/* canonical cover stepper */
function canonSteps(F){const {Fc,log}=FD.canon(F);const out=[];let cur=log[0].F;
  out.push({h:'התחלה: איחוד אגפי שמאל זהים',p:`<p>תלויות עם אותו אגף שמאל מאוחדות לאחת (כלל האיחוד). זה לא משנה את הסגור.</p>`,cap:`${cur.length} תלויות`,fig:(c=>()=>fdList(c))(cur)});
  log.slice(1).forEach(L=>{const before=cur,i=before.findIndex(f=>f.l===L.fd.l&&f.r===L.fd.r);cur=L.F;
    const lhs=L.kind==='lhs';
    out.push({h:`${L.A} עודפת ב${lhs?'אגף שמאל':'אגף ימין'} של ${x(L.fd.l+'→'+L.fd.r)}`,
      p:lhs?`<p>האם ${x(FD.minus(L.fd.l,L.A))} לבד קובעת את ${x(L.fd.r)}? מחשבים את הסגור שלה <strong>לפי F הנוכחית</strong>:</p>${m(L.why)}<p>${x(L.fd.r)} בפנים — ${L.A} מיותרת.</p>`
        :`<p>מורידים את ${L.A} מאגף ימין, ובודקים אם עדיין אפשר להסיק אותה. מחשבים את ${x(L.fd.l+'⁺')} <strong>בלי</strong> ${L.A} בתלות הזאת:</p>${m(L.why)}<p>${L.A} עדיין בסגור — היא עודפת.</p>`,
      cap:`${L.merged?'אחרי איחוד: ':''}${cur.length} תלויות`,fig:((b,c,i,L)=>()=>`<div class="cvfig"><div><div class="rtname">לפני</div>${fdList(b,{strike:b.map((_,k)=>k===i?{side:L.kind==='lhs'?'l':'r',A:L.A}:null),cls:b.map((_,k)=>k===i?'on':'')})}</div><div class="cvarr">←</div><div><div class="rtname">אחרי</div>${fdList(c)}</div></div>`)(before,cur,i,L)});});
  out.push({h:'סוף: אין תכונות עודפות',p:`<p>בדקנו כל תכונה בכל תלות — אין עוד עודפות, ולכל אגף שמאל תלות אחת.</p>${m('F<sub>c</sub> = { '+FD.fds(Fc)+' }')}<p class="sxnote">הכיסוי הקנוני אינו יחיד: סדר הבדיקה יכול לתת תוצאה אחרת, שקולה לוגית. כאן הבדיקה היא לפי סדר התלויות, ובכל תלות קודם אגף שמאל.</p>`,cap:`F_c — ${Fc.length} תלויות`,fig:()=>fdList(Fc)});
  return out;}
GEN['f-canon5']=()=>({steps:canonSteps(F5)});
GEN['f-canon6']=()=>({steps:canonSteps(FD.parse('E->NS, NL->EMD, EN->LCD, C->S, D->M, M->D, EPD->AE, NLCP->A'))});

/* slide-2 relation: does X→Y hold? */
{const host=document.getElementById('fdRel');if(host){const R='ABCD',rows=['aehl','afhm','bfim','cgin','cgio'];let X='A',Y='C';
  const draw=()=>{const ix=c=>R.indexOf(c);let bad=null;const seen={};
    rows.forEach((r,i)=>{const kx=[...X].map(c=>r[ix(c)]).join(),ky=[...Y].map(c=>r[ix(c)]).join();if(kx in seen&&seen[kx].ky!==ky&&!bad)bad=[seen[kx].i,i];if(!(kx in seen))seen[kx]={ky,i};});
    const tr=rows.map((r,i)=>`<tr class="${bad&&bad.includes(i)?'bad':''}">${[...r].map((v,j)=>`<td class="${X.includes(R[j])?'cx':Y.includes(R[j])?'cy':''}">${v}</td>`).join('')}</tr>`).join('');
    host.querySelector('.fdrt').innerHTML=`<table class="rt" dir="ltr"><thead><tr>${[...R].map(c=>`<th class="${X.includes(c)?'cx':Y.includes(c)?'cy':''}">${c}</th>`).join('')}</tr></thead><tbody>${tr}</tbody></table>`;
    host.querySelector('.fdv').innerHTML=!X||!Y?'<span class="muted">בחר אגף שמאל ואגף ימין</span>':`${x(X+'→'+Y)} ${bad?`<b class="no">לא מתקיימת</b>: בשורות ${bad[0]+1} ו־${bad[1]+1} יש אותו ${X}, אבל ${Y} שונה.`:`<b class="yes">מתקיימת</b>: כל ערך של ${X} מופיע עם ערך אחד בלבד של ${Y}${FD.sub(Y,X)?' (תלות טריוויאלית)':''}.`}`;
    host.querySelectorAll('[data-side]').forEach(b=>b.setAttribute('aria-pressed',(b.dataset.side==='l'?X:Y).includes(b.dataset.a)));};
  host.querySelector('.fdpick').innerHTML=['l','r'].map(sd=>`<div><span class="muted">${sd==='l'?'אגף שמאל':'אגף ימין'}:</span> ${[...R].map(c=>`<button type="button" class="chip" data-side="${sd}" data-a="${c}">${c}</button>`).join('')}</div>`).join('');
  host.addEventListener('click',e=>{const b=e.target.closest('[data-side]');if(!b)return;const a=b.dataset.a;if(b.dataset.side==='l')X=X.includes(a)?FD.minus(X,a):FD.uni(X,a);else Y=Y.includes(a)?FD.minus(Y,a):FD.uni(Y,a);draw();});draw();}}

/* calculator */
{const C=document.getElementById('fdCalc');if(C){const go=()=>{const R=FD.S(C.querySelector('[name=R]').value.replace(/[^A-Za-z]/g,'').toUpperCase());
  const F=FD.parse(C.querySelector('[name=F]').value.toUpperCase());const X=FD.S(C.querySelector('[name=X]').value.replace(/[^A-Za-z]/g,'').toUpperCase());const out=C.querySelector('.calcout');
  if(!R||!F.length){out.innerHTML='<div class="sqlmsg">הזן תבנית ותלויות.</div>';return;}
  const extra=FD.minus(FD.S(F.map(f=>f.l+f.r).join('')),R);if(extra){out.innerHTML=`<div class="sqlerr">התכונות ${esc(extra)} מופיעות בתלויות אבל לא ב־R.</div>`;return;}
  const ks=FD.keys(R,F),{Fc,log}=FD.canon(F),cl=X?FD.closure(X,F):null,bv=FD.bcnfViolation(R,F),tv=FD.is3NF(R,F);
  out.innerHTML=`<div class="calcgrid">
   ${cl?`<div class="calcbox"><h4>${x(X+'⁺')}</h4><ol class="calcsteps" dir="ltr"><li>result = ${X}</li>${cl.steps.map(s=>`<li>${s.fd.l}→${s.fd.r} &nbsp;⇒&nbsp; + ${s.add} &nbsp;= ${s.res}</li>`).join('')}</ol>${m(`${X}⁺ = ${cl.res}`)}<p>${FD.sub(R,cl.res)?`${x(X)} מפתח־על של R.`:`${x(X)} אינו מפתח־על.`}</p></div>`:''}
   <div class="calcbox"><h4>מפתחות קבילים</h4>${m(ks.join(',  '))}<p class="muted">תכונות ראשוניות: ${x(FD.S(ks.join(''))||'—')}</p></div>
   <div class="calcbox"><h4>כיסוי קנוני</h4>${fdList(Fc)}<ul class="calclog">${log.slice(1).map(L=>`<li>${L.A} עודפת ב${L.kind==='lhs'?'אגף שמאל':'אגף ימין'} של ${x(L.fd.l+'→'+L.fd.r)}: ${x(L.why)}</li>`).join('')||'<li>אין תכונות עודפות</li>'}</ul></div>
   <div class="calcbox"><h4>צורה נורמלית של R</h4><p>${bv?`<b class="no">לא ב־BCNF</b>: ${x(bv.l+'→'+bv.r)} ו־${x(bv.l)} אינו מפתח־על.`:'<b class="yes">ב־BCNF</b>'}</p><p>${bv?(tv?`<b class="no">לא ב־3NF</b>: ${x(tv.l+'→'+tv.r)}, ו־${x(tv.r)} לא כולה ראשונית.`:'<b class="yes">ב־3NF</b> — כל הפרה של BCNF היא לתכונות ראשוניות.'):''}</p></div></div>`;};
  C.querySelector('.calcBtn').onclick=go;C.querySelectorAll('input').forEach(i=>i.addEventListener('keydown',e=>{if(e.key==='Enter')go();}));
  C.querySelectorAll('[data-ex]').forEach(b=>b.onclick=()=>{const [R,F,X]=b.dataset.ex.split('|');C.querySelector('[name=R]').value=R;C.querySelector('[name=F]').value=F;C.querySelector('[name=X]').value=X;go();});go();}}

/* practice with checker */
document.querySelectorAll('.fdcheck').forEach(el=>{const R=el.dataset.r,F=FD.parse(el.dataset.f),kind=el.dataset.kind,arg=el.dataset.arg;
  const want=kind==='clo'?FD.clo(arg,F):kind==='keys'?FD.keys(R,F).sort().join(','):'';const inp=el.querySelector('input'),out=el.querySelector('.fdres');
  const norm=v=>kind==='clo'?FD.S(v.replace(/[^A-Za-z]/g,'').toUpperCase()):v.toUpperCase().split(/[,\s;]+/).filter(Boolean).map(k=>FD.S(k)).sort().join(',');
  const go=()=>{const got=norm(inp.value);if(!got){out.innerHTML='';return;}out.innerHTML=got===want?'<span class="verdict good">נכון ✓</span>':`<span class="verdict bad">עדיין לא${kind==='clo'?(FD.sub(got,want)?' — חסרות תכונות':' — יש תכונות שלא נקבעות'):''}</span>`;};
  el.querySelector('button').onclick=go;inp.addEventListener('keydown',e=>{if(e.key==='Enter')go();});});
/* ex5 Q1: DDL editor */
{const host=document.getElementById('ddl5');const K=window.SQLKIT;if(host&&K){const sql=host.querySelector('script[type="text/plain"]').textContent.trim();
  host.querySelector('.ddlbtn').onclick=function(){const ed=host.querySelector('.ddled');ed.hidden=!ed.hidden;this.textContent=ed.hidden?'ערוך והרץ':'סגור עורך';if(!ed.dataset.made){ed.dataset.made=1;K.editor(ed,'empty',sql,r=>K.resultHTML(r,'התוצאה'));}};}}
})();
