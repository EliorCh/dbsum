/* ============ page 6: design & normalization ============ */
(function(){const {x,m,esc}=H;
const F6=FD.parse('A->BC, CD->E, B->D, E->A');
/* decomposition "tree" figure: rows of schemas */
const schBox=(s,F,fresh,cls)=>{const v=cls==='3nf'?null:FD.bcnfViolation(s,F);return `<div class="sch ${v?'bad':'ok'}${fresh&&fresh.includes(s)?' fresh':''}">(${[...s].join(',')})<small>${v?`מפר: ${v.l}→${v.r}`:'BCNF ✓'}</small></div>`;};
function bcnfSteps(R,F){const {res,log}=FD.bcnf(R,F);const out=[];const hist=[[FD.S(R)]];let cur=[FD.S(R)];
  log.forEach(L=>{cur=cur.flatMap(s=>s===L.from?L.into:[s]);hist.push([...cur]);});
  const fig=(k,fresh)=>`<div class="dtree">${hist.slice(0,k+1).map((lv,i)=>`<div class="lvl">${lv.map(s=>schBox(s,F,i===k?fresh:null)).join('')}</div>${i<k?`<div class="arrow">↓ ${log[i].fd.l}→${log[i].fd.r}</div>`:''}`).join('')}</div>`;
  const ks=FD.keys(R,F);
  out.push({h:'התחלה: result = {R}',p:`<p>המפתחות של R: ${x(ks.join(', '))}. תלות מפרה BCNF אם היא לא טריוויאלית ואגף השמאל שלה אינו מפתח־על.</p>`,cap:`R = (${[...R].join(',')})`,fig:()=>fig(0,[FD.S(R)])});
  log.forEach((L,i)=>{const [a,b]=L.into;out.push({h:`מפרקים את (${[...L.from].join(',')}) לפי ${x(L.fd.l+'→'+L.fd.r)}`,
    p:`<p>${x(L.fd.l+'⁺')} בתוך ${x(L.from)} הוא ${x(FD.inter(FD.clo(L.fd.l,F),L.from))} — לא כל התבנית, אז ${x(L.fd.l)} אינו מפתח־על שלה.</p><p>לפי האלגוריתם: <code class="xp">(Ri − β)</code> ו־<code class="xp">(α, β)</code>:</p>${m(`(${[...a].join(',')})   ,   (${[...b].join(',')})`)}<p>הפירוק משמר מידע: החיתוך ${x(L.fd.l)} קובע את כל ${x('('+[...b].join(',')+')')}.</p>`,
    cap:`${hist[i+1].length} תבניות`,fig:()=>fig(i+1,L.into)});});
  out.push({h:'סוף: כל התבניות ב־BCNF',p:`${m('{ '+res.map(s=>'('+[...s].join(',')+')').join(',  ')+' }')}${presNote(F,res)}`,cap:'כל התבניות ב־BCNF',fig:()=>fig(hist.length-1,[])});
  return out;}
function presNote(F,parts){const P=FD.preserves(F,parts),lost=P.filter(p=>!p.ok);return lost.length?`<p>הפירוק <strong>לא משמר תלויות</strong>: ${lost.map(p=>x(p.fd.l+'→'+p.fd.r)).join(', ')} ${lost.length>1?'אובדות':'אובדת'} — אי אפשר לבדוק ${lost.length>1?'אותן':'אותה'} בלי צירוף.</p>`:'<p>הפירוק גם משמר תלויות.</p>';}
GEN['n-bcnf6']=()=>({steps:bcnfSteps('ABCDE',F6)});
GEN['n-bcnfP']=()=>({steps:bcnfSteps('ABC',FD.parse('AB->C, C->B'))});
/* 3NF synthesis */
function synthSteps(R,F){const s=FD.synth3NF(R,F);const out=[];let built=[];
  const fig=(list,fresh)=>`<div class="dtree"><div class="lvl">${list.length?list.map(x0=>`<div class="sch ok${fresh&&fresh.includes(x0)?' fresh':''}">(${[...x0].join(',')})</div>`).join(''):'<span class="muted">result = ∅</span>'}</div></div>`;
  out.push({h:`שלב 1: כיסוי קנוני`,p:`<p>מחשבים את ${x('F<sub>c</sub>')} (ראה <a href="fd.html#canon">כיסוי קנוני</a>):</p>${m('F<sub>c</sub> = { '+FD.fds(s.Fc)+' }')}<p>ממיינים את התלויות לפי גודל (מספר התכונות בתלות), מהגדולה לקטנה.</p>`,cap:'result = ∅',fig:()=>fig([],[])});
  s.log.forEach(L=>{if(!L.skip)built=built.concat(L.sch);const snap=[...built];
    out.push({h:`${x(L.fd.l+'→'+L.fd.r)}`,p:L.skip?`<p>התבנית ${x('('+[...L.sch].join(',')+')')} כבר מוכלת ב־${x('('+[...L.skip].join(',')+')')} — לא מוסיפים.</p>`:`<p>אף תבנית ב־result לא מכילה את ${x(L.sch)}, אז מוסיפים את ${x('('+[...L.sch].join(',')+')')}.</p>`,cap:`${snap.length} תבניות`,fig:()=>fig(snap,L.skip?[]:[L.sch])});});
  out.push({h:'בדיקת מפתח',p:`<p>מפתחות קבילים של R: ${x(s.ks.join(', '))}. ${s.hasKey?`התבנית ${x('('+[...s.hasKey].join(',')+')')} כבר מכילה מפתח — אין צורך להוסיף.`:`אף תבנית לא מכילה מפתח, מוסיפים ${x('('+[...s.added].join(',')+')')}.`}</p>${m('{ '+s.res.map(t=>'('+[...t].join(',')+')').join(',  ')+' }')}<p>הפירוק משמר מידע (יש תבנית עם מפתח) ומשמר תלויות (כל תלות ב־${x('F<sub>c</sub>')} נמצאת בשלמותה בתבנית אחת).</p>`,cap:'פירוק ל־3NF',fig:()=>fig(s.res,s.added?[s.added]:[])});
  return out;}
GEN['n-3nf6']=()=>({steps:synthSteps('ABCDE',F6)});
/* chase tableau */
function chaseSteps(R,F,parts){const c=FD.chase(R,F,parts);const out=[];
  const tab=(snap)=>{const T=snap.T,n=snap.note;const win=T.findIndex(t=>[...c.R].every(a=>t[a]==='a'));
    return `<div class="rtwrap"><table class="rt chase" dir="ltr"><thead><tr><th></th>${[...c.R].map(a=>`<th>${a}</th>`).join('')}</tr></thead><tbody>${T.map((t,i)=>`<tr class="${i===win?'win':''}"><th>R${i+1}=(${[...parts[i]].join(',')})</th>${[...c.R].map(a=>{const v=t[a],chg=n&&n.cells.some(([k,b])=>k===i&&b===a);return `<td class="${v==='a'?'a':''}${chg?' chg':''}">${v==='a'?'a':`b<sub>${v.slice(1)}</sub>`}</td>`;}).join('')}</tr>`).join('')}</tbody></table></div>`;};
  out.push({h:'בניית הטבלה',p:`<p>שורה לכל תבנית, עמודה לכל תכונה. בשורה i כותבים <code class="xp">a</code> בעמודות של התכונות ש־R<sub>i</sub> מכילה, ו־<code class="xp">b<sub>ij</sub></code> (ערך ״לא ידוע״) בשאר.</p><p>הרעיון: אם יש יחס שבו כל הצירוף מחזיר שורה שלא הייתה ביחס, הטבלה הזאת מתארת אותו.</p>`,cap:'מצב התחלתי',fig:()=>tab(c.snaps[0])});
  c.snaps.slice(1).forEach(s=>{const n=s.note;out.push({h:`${x(n.fd.l+'→'+n.fd.r)}: שורות ${n.i+1} ו־${n.j+1}`,p:`<p>שתי השורות שוות ב־${x(n.fd.l)}, ולכן חייבות להיות שוות גם ב־${x(n.a)}. לכן ${n.drop.replace(/b(\d+)/,'b<sub>$1</sub>')} מוחלף ב־${n.keep==='a'?'a':n.keep.replace(/b(\d+)/,'b<sub>$1</sub>')} ${n.cells.length>1?`(בכל העמודה — ${n.cells.length} תאים)`:''}.</p>`,cap:`עמודה ${n.a}: ${n.drop} מוחלף ב־${n.keep}`,fig:()=>tab(s)});});
  out.push({h:c.ok?'יש שורה של a בלבד — משמר מידע':'אין שורה של a — לא משמר מידע',p:c.ok?`<p>אחרי שאי אפשר להפעיל עוד תלות, יש שורה שכולה ${x('a')}. המשמעות: כל שורה בצירוף של ההטלות חייבת להיות שורה של היחס המקורי. <strong>הפירוק משמר מידע.</strong></p>`:'<p>אין שורה שכולה a — הטבלה עצמה היא דוגמה נגדית: יחס חוקי שהצירוף שלו מחזיר שורה חדשה.</p>',cap:c.ok?'משמר מידע ✓':'לא משמר מידע',fig:()=>tab(c.snaps[c.snaps.length-1])});
  return out;}
GEN['n-chase7']=()=>({steps:chaseSteps('ABCDE',FD.parse('A->C, B->C, C->D, DE->C, CE->A'),['AD','AB','BE','CDE','AE'])});

/* natural join demo with spurious rows highlighted */
function njoin(r1,c1,r2,c2){const common=c1.filter(c=>c2.includes(c)),cols=c1.concat(c2.filter(c=>!common.includes(c)));const out=[];
  r1.forEach(a=>r2.forEach(b=>{if(common.every(c=>a[c1.indexOf(c)]===b[c2.indexOf(c)]))out.push(cols.map(c=>c1.includes(c)?a[c1.indexOf(c)]:b[c2.indexOf(c)]));}));return {cols,rows:out};}
function proj(rows,cols,keep){const seen=new Set(),out=[];rows.forEach(r=>{const t=keep.map(c=>r[cols.indexOf(c)]);const k=JSON.stringify(t);if(!seen.has(k)){seen.add(k);out.push(t);}});return out;}
function joinFig(host,cols,rows,p1,p2,names){const a=proj(rows,cols,p1),b=proj(rows,cols,p2),j=njoin(a,p1,b,p2);const orig=new Set(rows.map(r=>JSON.stringify(j.cols.map(c=>r[cols.indexOf(c)]))));
  const t=(nm,cs,rs,mark)=>`<div class="rtwrap"><div class="rtname">${nm}</div><table class="rt" dir="ltr"><thead><tr>${cs.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>${rs.map(r=>{const fake=mark&&!orig.has(JSON.stringify(r));return `<tr class="${fake?'fresh spur':''}">${r.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`;}).join('')}</tbody></table><div class="rtcount">${rs.length} שורות${mark?` · ${rs.filter(r=>!orig.has(JSON.stringify(r))).length} מזויפות`:''}</div></div>`;
  host.innerHTML=`<div class="rtrow">${t(names[0],cols,rows)}</div><div class="rtrow">${t(names[1],p1,a)}${t(names[2],p2,b)}</div><div class="rtrow">${t(names[3],j.cols,j.rows,true)}</div>`;}
{const h=document.getElementById('lossyJoin');if(h)joinFig(h,['branch-name','loan-number','customer-name','amount'],[['Hamerkaz',17,'Morag',1000],['Pinkas',23,'Tamir',2000],['Aviv',15,'Avivi',1500],['Hamerkaz',14,'Lerner',1500],['Tsafon',93,'Even',500]],['customer-name','amount'],['branch-name','loan-number','amount'],['borrow','amt','loan','amt ⋈ loan']);}
{const h=document.getElementById('q2Join');if(h)joinFig(h,['A','B','C','D','E'],[['a1','b1','c1','d1','e1'],['a2','b2','c1','d2','e2']],['A','B','C'],['C','D','E'],['r','r1 = π_ABC(r)','r2 = π_CDE(r)','r1 ⋈ r2']);}
/* dependency preservation table (ex6 Q3) */
{const h=document.getElementById('presQ3');if(h){const P=FD.preserves(F6,['ABC','ADE']);
  h.innerHTML=H.tbl(['תלות ב־F','סגור אגף שמאל לפי F1 ∪ F2','נשמרת?'],P.map(p=>({c:[`${p.fd.l}→${p.fd.r}`,`${p.fd.l}⁺ = ${p.c}`,p.ok?'✓':'✗'],cls:p.ok?'':'gone'})));}}

/* decomposition tool */
{const C=document.getElementById('nCalc');if(C){const go=()=>{const R=FD.S(C.querySelector('[name=R]').value.replace(/[^A-Za-z]/g,'').toUpperCase()),F=FD.parse(C.querySelector('[name=F]').value.toUpperCase());
  const parts=C.querySelector('[name=D]').value.toUpperCase().split(/[;|]+|\)\s*,\s*\(/).map(s=>FD.S(s.replace(/[^A-Z]/g,''))).filter(Boolean);const out=C.querySelector('.calcout');
  if(!R||!F.length){out.innerHTML='<div class="sqlmsg">הזן תבנית ותלויות.</div>';return;}
  const b=FD.bcnf(R,F),s=FD.synth3NF(R,F);let dec='';
  if(parts.length){const cover=FD.S(parts.join(''));if(cover!==R)dec=`<div class="calcbox"><h4>הפירוק שהזנת</h4><p class="sqlerr">האיחוד של התבניות הוא ${esc(cover)}, לא R.</p></div>`;
    else{const ch=FD.chase(R,F,parts),P=FD.preserves(F,parts);dec=`<div class="calcbox"><h4>הפירוק שהזנת</h4><p>${parts.map(p=>x('('+[...p].join(',')+')')).join(' ')}</p><p>${ch.ok?'<b class="yes">משמר מידע</b>':'<b class="no">לא משמר מידע</b>'} (בדיקת טבלה)</p><p>${P.every(p=>p.ok)?'<b class="yes">משמר תלויות</b>':`<b class="no">לא משמר תלויות</b>: ${P.filter(p=>!p.ok).map(p=>x(p.fd.l+'→'+p.fd.r)).join(', ')}`}</p><p>${parts.map(p=>{const v=FD.bcnfViolation(p,F);return `${x('('+[...p].join(',')+')')}: ${v?`לא BCNF (${x(v.l+'→'+v.r)})`:'BCNF'}`;}).join('<br>')}</p></div>`;}}
  out.innerHTML=`<div class="calcgrid">${dec}<div class="calcbox"><h4>פירוק ל־BCNF</h4><ol class="calclog">${b.log.map(L=>`<li>(${[...L.from].join(',')}) לפי ${x(L.fd.l+'→'+L.fd.r)} ← ${L.into.map(s=>'('+[...s].join(',')+')').join(' , ')}</li>`).join('')||'<li>R כבר ב־BCNF</li>'}</ol>${m(b.res.map(s=>'('+[...s].join(',')+')').join(', '))}${presNote(F,b.res)}</div>
  <div class="calcbox"><h4>פירוק ל־3NF (סינתזה)</h4><p>${x('F<sub>c</sub> = { '+FD.fds(s.Fc)+' }')}</p>${m(s.res.map(t=>'('+[...t].join(',')+')').join(', '))}<p class="muted">${s.added?`נוספה תבנית מפתח ${x(s.added)}.`:'יש תבנית שמכילה מפתח.'}</p></div></div>`;};
  C.querySelector('.calcBtn').onclick=go;C.querySelectorAll('input').forEach(i=>i.addEventListener('keydown',e=>{if(e.key==='Enter')go();}));
  const EX={ex6:['ABCDE','A→BC, CD→E, B→D, E→A','ABC; ADE'],q2:['ABCDE','A→BC, CD→E, B→D, E→A','ABC; CDE'],q7:['ABCDE','A→C, B→C, C→D, DE→C, CE→A','AD; AB; BE; CDE; AE'],lend:['BACLNM','B→AC, L→MB','BAC; BLNM']};
  C.querySelectorAll('[data-ex]').forEach(b0=>b0.onclick=()=>{const [R,F,D]=EX[b0.dataset.ex];C.querySelector('[name=R]').value=R;C.querySelector('[name=F]').value=F;C.querySelector('[name=D]').value=D;go();});go();}}
})();
