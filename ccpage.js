/* ============ page 8: concurrency control ============ */
(function(){const {x,m,esc}=H;
const sch=a=>a.map(([t,s])=>({t,s}));
const S3=sch([['T0','read(A)'],['T0','A = A-50'],['T0','write(A)'],['T1','read(A)'],['T1','tmp = A*0.1'],['T1','A = A-tmp'],['T1','write(A)'],['T0','read(B)'],['T0','B = B+50'],['T0','write(B)'],['T1','read(B)'],['T1','B = B+tmp'],['T1','write(B)']]);
const S4=sch([['T0','read(A)'],['T0','A = A-50'],['T1','read(A)'],['T1','tmp = A*0.1'],['T1','A = A-tmp'],['T1','write(A)'],['T0','write(A)'],['T0','read(B)'],['T0','B = B+50'],['T0','write(B)'],['T1','read(B)'],['T1','B = B+tmp'],['T1','write(B)']]);
window.CCS={S3,S4};
/* value-tracking stepper */
function valSteps(S,init,final){const tr=CC.exec(S,init);const out=[];let prev={...init};
  const fig=(i)=>{const db=i<0?init:tr[i].db;const cells=Object.keys(db).map(k=>`<span class="${i>=0&&db[k]!==(i?tr[i-1].db:init)[k]?'fresh':''}">${k} = ${db[k]}</span>`).join('');
    return `<div class="dbvals">${cells}</div>${CC.schedTable(S,{cur:i,num:true})}`;};
  out.push({h:'ערכים התחלתיים',p:`<p>${x('A = 1000')}, ${x('B = 2000')}. סכום: 3000 — וצריך להישאר 3000.</p>`,cap:'A = 1000, B = 2000',fig:()=>fig(-1)});
  S.forEach((e,i)=>{if(CC.op(e.s).k==='c')return;out.push({h:`${e.t}: ${x(e.s)}`,p:`<p>${tr[i].note}</p>`,cap:`A = ${tr[i].db.A}, B = ${tr[i].db.B}`,fig:()=>fig(i)});});
  const f=tr[tr.length-1].db;out[out.length-1].p+=`<p><strong>ערכים סופיים: ${x(`A = ${f.A}, B = ${f.B}`)}</strong>. סכום: ${f.A+f.B}. ${final}</p>`;
  return {steps:out};}
GEN['c-s3']=()=>valSteps(S3,{A:1000,B:2000},'כמו התזמון הסדרתי S1 — התזמון תקין.');
GEN['c-s4']=()=>valSteps(S4,{A:1000,B:2000},'נעלמו 50 ש״ח: הכתיבה של T0 ל־A דרסה את הכתיבה של T1. אין תזמון סדרתי שנותן את התוצאה הזו.');
/* precedence graph construction */
function pgSteps(S,opt={}){const T=CC.txns(S),all=CC.edges(S),U=CC.uniqEdges(all);const out=[];const shown=[];
  const fig=(hl,fresh,cyc)=>`<div class="ccgrid">${CC.schedTable(S,{num:true,hl})}${CC.graphSvg(T,shown.slice(),{fresh,cycle:cyc,pos:opt.pos,labels:true,h:opt.h})}</div>`;
  out.push({h:'קודקוד לכל טרנזקציה',p:`<p>עוברים על כל זוג פעולות של טרנזקציות שונות, על אותו פריט, כשלפחות אחת מהן כתיבה. כל זוג כזה נותן קשת מהטרנזקציה שפעלה קודם.</p>`,cap:`${T.length} קודקודים, אין קשתות`,fig:(()=>{const s0=[];return ()=>`<div class="ccgrid">${CC.schedTable(S,{num:true})}${CC.graphSvg(T,s0,{pos:opt.pos,h:opt.h})}</div>`;})()});
  U.forEach(e=>{shown.push(e);const snap=shown.slice();const hl={};e.all.forEach(a=>{hl[a.i]='e1';hl[a.j]='e2';});
    out.push({h:`קשת ${e.from} → ${e.to}`,p:`<p>${e.all.map(a=>`${x(a.why)} (שורות ${a.i+1}, ${a.j+1})`).join('<br>')}</p><p>${e.from} חייבת להיות לפני ${e.to} בכל תזמון סדרתי שקול.</p>`,cap:`${snap.length} קשתות`,fig:((s,h,k)=>()=>`<div class="ccgrid">${CC.schedTable(S,{num:true,hl:h})}${CC.graphSvg(T,s,{fresh:[k],pos:opt.pos,labels:true,h:opt.h})}</div>`)(snap,hl,e.from+'>'+e.to)});});
  const cyc=CC.cycle(T,U),orders=cyc?[]:CC.topoAll(T,U);
  out.push({h:cyc?'יש מעגל — לא conflict serializable':'אין מעגל — conflict serializable',p:cyc?`<p>המעגל ${x(cyc.join(' → '))}: כל טרנזקציה במעגל צריכה לבוא לפני הבאה, וגם אחרי עצמה. אין סדר סדרתי שמקיים את כל הקשתות.</p>`:`<p>כל מיון טופולוגי של הגרף הוא תזמון סדרתי שקול: ${orders.map(o=>x(o.join(', '))).join(' או ')}.</p>`,cap:cyc?'מעגל':'בלי מעגלים',fig:()=>`<div class="ccgrid">${CC.schedTable(S,{num:true})}${CC.graphSvg(T,U,{cycle:cyc||[],pos:opt.pos,labels:true,h:opt.h})}</div>`});
  return {steps:out};}
const S5=sch([['T1','read(A)'],['T2','read(B)'],['T2','write(B)'],['T3','read(C)'],['T3','read(B)'],['T3','C=C+B'],['T2','read(A)'],['T2','A=1.1*A'],['T3','write(C)'],['T1','read(C)'],['T1','C=C-A'],['T1','write(C)'],['T2','write(A)']]);
window.GENPG=pgSteps;
GEN['c-pg5']=()=>pgSteps(S5,{pos:{T1:[60,60],T2:[260,60],T3:[160,190]}});
GEN['c-pg10']=()=>pgSteps(CC.parseShort('r1(Q) w2(Q) w1(Q) w3(Q)'),{pos:{T1:[60,60],T2:[260,60],T3:[160,190]}});
const S7=CC.parseShort('r0(A) w1(A) r2(A) w0(A) w2(A)');
GEN['c-pg7']=()=>pgSteps(S7,{pos:{T0:[60,60],T1:[260,60],T2:[160,190]}});
/* timestamp protocol stepper */
function tsSteps(S,ts,mode,intro){const r=CC.tsSim(S,ts,mode);const items=[...new Set(r.log.map(l=>l.x))].sort();const out=[];
  const tsTable=(l,prev)=>H.tbl(['פריט','R-TS','W-TS'],items.map(it=>({c:[it,cellTS(l?l.R[it]:0,prev?prev.R[it]:0),cellTS(l?l.W[it]:0,prev?prev.W[it]:0)]})));
  const cellTS=(v,p)=>v!==p?`<b class="tsnew">${v??0}</b>`:`${v??0}`;
  const hl=k=>Object.fromEntries(r.log.slice(0,k+1).map(l=>[l.i,l.res==='ok'?'ok':l.res==='ignore'?'ign':l.res==='skip'?'ign':'rb']));
  const fig=k=>`<div class="ccgrid">${CC.schedTable(S,{num:true,cur:k>=0?r.log[k].i:-1,hl:k>=0?hl(k):{}})}${tsTable(k>=0?r.log[k]:null,k>0?r.log[k-1]:null)}</div>`;
  out.push({h:'התחלה',p:intro+`<p>חותמות הזמן: ${Object.entries(ts).map(([t,v])=>x(`TS(${t}) = ${v}`)).join(', ')}. לכל פריט R-TS ו־W-TS מתחילים ב־0.</p>`,cap:'כל החותמות 0',fig:()=>fig(-1)});
  r.log.forEach((l,k)=>{const verdict={ok:'מתבצעת',rollback:`נדחית — ${l.t} מגולגלת אחורנית`,ignore:'מתעלמים ממנה (חוק תומאס)',skip:'מדלגים'}[l.res];
    out.push({h:`${l.t}: ${x(l.s)} — ${verdict}`,p:`<p>${x(l.why)}</p>${l.res==='ok'?`<p>מעדכנים: ${x(CC.op(l.s).k==='r'?`R-TS(${l.x}) = max(R-TS, ${ts[l.t]}) = ${l.R[l.x]}`:`W-TS(${l.x}) = ${l.W[l.x]}`)}</p>`:''}`,cap:verdict,fig:()=>fig(k)});});
  return {steps:out,r};}
GEN['c-ts21']=()=>{const g=tsSteps(CC.parseShort('r1(A) w1(A) w2(B) r2(A) r3(B) r3(C) w3(A) r1(C) w2(C)'),{T1:1,T2:2,T3:3},'basic','<p>הדוגמה מהמצגת.</p>');return g;};
GEN['c-thomas']=()=>{const S=CC.parseShort('r1(Q) w2(Q) w1(Q)');const a=tsSteps(S,{T1:100,T2:200},'thomas','<p>T1 ותיקה יותר: <code class="xp">TS(T1) &lt; TS(T2)</code>, ולכן התזמון צריך להיות שקול ל־T1 ואחריה T2.</p>');
  a.steps[a.steps.length-1].p+=`<p>בפרוטוקול הבסיסי ${x('w1(Q)')} הייתה גורמת לגלגול של T1. לפי חוק תומאס מתעלמים ממנה: בסדר T1 ← T2, T2 הייתה דורסת אותה בכל מקרה. התוצאה שקולת־תצפית לסדר הסדרתי T1, T2 — אבל לא שקולת־קונפליקט.</p>`;return a;};
GEN['c-q7ts']=()=>tsSteps(S7,{T0:0,T1:1,T2:2},'basic','<p>חותמות זמן לפי סדר ההתחלה: T0, אחריה T1, אחריה T2.</p>');
GEN['c-q7th']=()=>tsSteps(S7,{T0:0,T1:1,T2:2},'thomas','<p>אותו תזמון, עם חוק הכתיבה של תומאס.</p>');

/* 2PL check of the three transactions in Q6 */
{const h=document.getElementById('q6tx');if(h){const T={T1:['slock(X)','read(X)','slock(Y)','read(Y)','t=X+Y','unlock(X)','unlock(Y)','xlock(Z)','Z=t','write(Z)','unlock(Z)'],T2:['slock(X)','read(X)','xlock(Y)','read(Y)','slock(Z)','read(Z)','Y=Z+X','write(Y)','unlock(X)','unlock(Y)','unlock(Z)'],T3:['xlock(W)','read(W)','xlock(Y)','read(Y)','Y=W','W=Y+1','write(Y)','unlock(Y)','write(W)','unlock(W)']};
  const cols=Object.entries(T).map(([t,ops])=>{const c=CC.twoPL(ops);return `<div class="rtwrap"><div class="rtname">${t} ${c.ok?'<b class="yes">2PL ✓</b>':'<b class="no">לא 2PL</b>'}</div><table class="rt sched" dir="ltr"><tbody>${ops.map((s,i)=>{const o=CC.op(s);const ph=c.bad.includes(i)?'badl':(c.firstUnlock>=0&&i>=c.firstUnlock?'shrink':'grow');return `<tr><td><span class="lockcol ${o.k==='c'||o.k==='r'||o.k==='w'?'':ph}">${s}</span></td></tr>`;}).join('')}</tbody></table></div>`;}).join('');
  h.innerHTML=`<div class="rtrow">${cols}</div><p class="muted"><span class="lockcol grow">ירוק</span> — פאזת גדילה, <span class="lockcol shrink">כתום</span> — פאזת הצטמקות, <span class="lockcol badl">אדום</span> — בקשת נעילה אחרי שחרור.</p>`;}}
/* precedence graph of Q3 (static) */
{const h=document.getElementById('q3graph');if(h){const N=['T0','T1','T2','T3','T4'],E=[['T0','T1'],['T0','T3'],['T0','T2'],['T1','T3'],['T1','T2'],['T3','T4'],['T2','T4']].map(([from,to])=>({from,to}));
  h.innerHTML=CC.graphSvg(N,E,{w:300,h:260,pos:{T0:[60,40],T1:[240,40],T3:[60,140],T2:[240,140],T4:[150,225]}});}}
/* schedule analyzer */
{const A=document.getElementById('ccTool');if(A){const go=()=>{const out=A.querySelector('.calcout');let S;try{S=CC.parseShort(A.querySelector('textarea').value);}catch(e){out.innerHTML='<div class="sqlerr">כתוב פעולות בצורה r1(A) w2(B), מופרדות ברווחים.</div>';return;}
  const T=CC.txns(S),U=CC.uniqEdges(CC.edges(S)),cyc=CC.cycle(T,U),vs=CC.viewSerial(S),ts=Object.fromEntries(T.map((t,i)=>[t,i+1])),b=CC.tsSim(S,ts,'basic'),th=CC.tsSim(S,ts,'thomas');
  const tsLine=r=>r.stopped===null?'<b class="yes">עובר</b>':`<b class="no">נכשל</b> בפעולה ${r.stopped+1}: ${x(S[r.stopped].t+': '+esc(S[r.stopped].s))}`;
  out.innerHTML=`<div class="ccgrid">${CC.schedTable(S,{num:true})}${CC.graphSvg(T,U,{cycle:cyc||[],labels:true})}</div><div class="calcgrid">
   <div class="calcbox"><h4>conflict serializable</h4><p>${cyc?`<b class="no">לא</b> — מעגל ${x(cyc.join(' → '))}`:`<b class="yes">כן</b> — שקול ל־${CC.topoAll(T,U).map(o=>x(o.join(', '))).join(' או ')}`}</p></div>
   <div class="calcbox"><h4>view serializable</h4><p>${vs.length?`<b class="yes">כן</b> — שקול ל־${vs.map(o=>x(o.join(', '))).join(' או ')}`:'<b class="no">לא</b>'}</p><p class="muted">בדיקה של כל ${T.length}! הסדרים</p></div>
   <div class="calcbox"><h4>פרוטוקול תג זמן</h4><p class="muted">חותמות לפי מספר הטרנזקציה:</p><p>${x(T.map(t=>`TS(${t})=${ts[t]}`).join(', '))}</p><p>בסיסי: ${tsLine(b)}</p><p>חוק תומאס: ${tsLine(th)}</p></div></div>`;};
  A.querySelector('.calcBtn').onclick=go;A.querySelectorAll('[data-ex]').forEach(c=>c.onclick=()=>{A.querySelector('textarea').value=c.dataset.ex;go();});go();}}
})();
(function(){const sch=a=>a.map(([t,s])=>({t,s}));
GEN['c-q2b']=()=>{const S=sch([['T0','read(A)'],['T1','read(B)'],['T0','read(B)'],['T1','read(A)'],['T0','if (A==0) B=B+1'],['T0','write(B)'],['T1','if (B==0) A=A+1'],['T1','write(A)']]);const g=window.GENPG(S,{pos:{T0:[70,80],T1:[250,80]},h:160});
  g.steps[g.steps.length-1].p+='<p>וגם התוצאה שגויה: שתי הטרנזקציות קוראות 0 לפני שהשנייה כותבת, ובסוף <code class="xp">A = 1</code> ו־<code class="xp">B = 1</code> — התנאי <code class="xp">A=0 ∨ B=0</code> הופר.</p>';return g;};
GEN['c-q6b']=()=>window.GENPG(sch([['T1','slock(X)'],['T1','read(X)'],['T1','slock(Y)'],['T1','read(Y)'],['T1','t=X+Y'],['T1','unlock(X)'],['T1','unlock(Y)'],['T2','slock(X)'],['T2','read(X)'],['T2','xlock(Y)'],['T2','read(Y)'],['T2','slock(Z)'],['T2','read(Z)'],['T2','Y=Z+X'],['T2','write(Y)'],['T2','unlock(X)'],['T2','unlock(Y)'],['T2','unlock(Z)'],['T1','xlock(Z)'],['T1','Z=t'],['T1','write(Z)'],['T1','unlock(Z)']]),{pos:{T1:[70,80],T2:[250,80]},h:160});
})();
