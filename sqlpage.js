/* =================== SQL page =================== */
(function(){
if(typeof SQLD==='undefined')return;
const toRel=(r,name)=>({name:name||'',attrs:r.cols,rows:r.rows.map(t=>t.map(v=>typeof v==='number'?String(Math.round(v*100)/100):v)),prov:r.rows.map(()=>[])});
const KW=/\b(select|distinct|from|where|and|or|not|in|exists|union|all|intersect|except|minus|some|any|contains|group|by|having|order|asc|desc|as|join|inner|left|right|full|outer|natural|on|using|insert|into|values|delete|update|set|create|view|table|drop|primary|key|foreign|references|unique|null|is|like|between|count|sum|avg|min|max|integer|text|char|varchar|coalesce)\b/gi;
function hl(sql){
  return esc(sql).replace(/('[^']*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]+)/g,(m,s,n,w)=>{
    if(s)return `<span class="sstr">${s}</span>`;if(n)return `<span class="snum">${n}</span>`;
    return /^(select|distinct|from|where|and|or|not|in|exists|union|all|intersect|except|minus|some|any|contains|group|by|having|order|asc|desc|as|join|inner|left|right|full|outer|natural|on|using|insert|into|values|delete|update|set|create|view|table|drop|primary|key|foreign|references|unique|null|is|like|between)$/i.test(w)?`<b class="skw">${w}</b>`:
      /^(count|sum|avg|min|max|coalesce)$/i.test(w)?`<span class="sfn">${w}</span>`:w;});
}
document.querySelectorAll('pre.sqlcode[data-hl]').forEach(p=>p.innerHTML=hl(p.textContent));

/* ---- live engine (lazy) ---- */
let enginePromise=null;
function loadScript(src){return new Promise((ok,bad)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>bad(new Error('לא הצלחתי לטעון '+src));document.head.append(s);});}
function engine(){
  if(!enginePromise)enginePromise=(async()=>{
    await loadScript('sql-wasm.js');await loadScript('sqlwasm-b64.js');
    const bin=Uint8Array.from(atob(window.SQL_WASM_B64),c=>c.charCodeAt(0));
    return await initSqlJs({wasmBinary:bin});
  })();
  return enginePromise;
}
async function runLive(dbKey,sql){
  const SQL=await engine();const db=new SQL.Database();
  try{db.exec('PRAGMA foreign_keys=ON;'+SQLD.DBS[dbKey]);
    const out=db.exec(sql);const mod=db.getRowsModified();
    if(out.length){const r=out[out.length-1];return {cols:r.columns,rows:r.values};}
    return {cols:[],rows:[],msg:`בוצע. ${mod} שורות הושפעו.`};
  }catch(e){return {error:e.message};}finally{db.close();}
}
function resultHTML(r,label,before){
  if(r.error)return `<div class="sqlerr" dir="ltr"><b>Error:</b> ${esc(r.error)}</div>`;
  if(r.msg&&!r.cols.length)return `<div class="sqlmsg">${esc(r.msg)}</div>`;
  if(before&&before.rows.length===r.rows.length&&before.cols.join()===r.cols.join()){   // update: show old -> new per cell
    const a=toRel(before),b=toRel(r);let n=0;
    const rows=b.rows.map((t,i)=>{const o=a.rows[i],ch=t.some((v,j)=>v!==o[j]);if(ch)n++;
      return `<tr class="${ch?'upd':''}">${t.map((v,j)=>v===o[j]?`<td>${esc(v)}</td>`:`<td class="chg"><del>${esc(o[j])}</del> → <b>${esc(v)}</b></td>`).join('')}</tr>`;}).join('');
    return `<div class="rtwrap"><div class="rtname">${label}</div><table class="rt"><thead><tr>${b.attrs.map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table><div class="rtcount">${n} שורות עודכנו מתוך ${b.rows.length}</div></div>`;}
  return relTable(toRel(r),before?toRel(before):null,{label,noprov:1});
}
/* tables a query uses, shown beside it */
function usedTables(db,sql){const T=(SQLD.TABLES||{})[db];if(!T)return [];return Object.keys(T).filter(n=>new RegExp('\\b'+n+'\\b','i').test(sql));}
function sourcesHTML(db,sql,label,all){const T=(SQLD.TABLES||{})[db];if(!T)return '';const ns=all?Object.keys(T):usedTables(db,sql);if(!ns.length)return '';
  const tabs=ns.length>2;
  const body=ns.map(n=>`<div class="srct" data-t="${n}">${relTable(toRel(T[n]),null,{label:n,noprov:1})}</div>`).join('');
  const bar=tabs?`<div class="srctabs" role="tablist"><button type="button" data-t="*" aria-pressed="true">הכל</button>${ns.map(n=>`<button type="button" data-t="${n}" aria-pressed="false">${n}</button>`).join('')}</div>`:'';
  return `<aside class="srcside"><div class="sxlab">${label||'הטבלאות שהשאילתה משתמשת בהן'}</div>${bar}${body}</aside>`;}

const withSide=(main,side)=>side?`<div class="sxgrid"><div class="sxmain">${main}</div>${side}</div>`:main;
function editor(host,dbKey,sql,onRun){
  host.innerHTML=`<textarea dir="ltr" spellcheck="false" rows="${Math.min(14,sql.split('\n').length+1)}">${esc(sql)}</textarea>
   <div class="ldbtns"><button class="btn runBtn" type="button">הרץ</button><button class="btn ghost resetBtn" type="button">איפוס</button><span class="kbd">Ctrl+Enter</span></div><div class="sqlout"></div>`;
  const ta=host.querySelector('textarea'),out=host.querySelector('.sqlout');
  const go=async()=>{out.innerHTML='<div class="sqlmsg">מריץ…</div>';try{const r=await runLive(dbKey,ta.value);out.innerHTML=onRun?onRun(r):resultHTML(r,'התוצאה שלך');}catch(e){out.innerHTML=`<div class="sqlerr">${esc(e.message)}. אפשר עדיין לקרוא את התוצאות המחושבות בעמוד.</div>`;}};
  host.querySelector('.runBtn').onclick=go;host.querySelector('.resetBtn').onclick=()=>{ta.value=sql;out.innerHTML='';};
  ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();go();}});
  return {go,ta};
}

/* ---- bank tables with "added" badges ---- */
{const g=document.getElementById('sqlBank');if(g){const T=SQLD.TABLES.bank;
  g.innerHTML=['customer','branch','deposit','borrow'].map(n=>{let h=relTable(toRel(T[n]),null,{label:n,noprov:1});
    const ex=SQLD.EXTRA[n]||[];let i=-1;h=h.replace(/<tr class="">/g,m=>{i++;return ex.includes(i)?'<tr class="xrow">':m;});return h;}).join('');}}

/* ---- example cards ---- */
const EXI=Object.fromEntries((SQLD.EX||[]).map(e=>[e.id,e]));
document.querySelectorAll('.sqlex[data-ex]').forEach(el=>{
  const e=EXI[el.dataset.ex];if(!e)return;
  const res=e.res.error?resultHTML(e.res):e.diff?resultHTML(e.res,`${e.diff} אחרי הפקודה`,e.before):resultHTML(e.res,'תוצאה');
  el.innerHTML=`<div class="sxq">${capHTML(e.q)}</div>`+withSide(`
   ${e.course?`<div class="sxlab">בתחביר הקורס</div><pre class="sqlcode course">${hl(e.course)}</pre><div class="sxlab">גרסה שרצה ב־SQLite</div>`:''}
   <pre class="sqlcode">${hl(e.sql)}</pre>
   ${e.ra?`<div class="sxra"><span>באלגברה:</span> <code class="xp wrap">${e.ra}</code></div>`:''}
   <div class="sxres">${res}</div>
   ${e.note?`<p class="sxnote">${capHTML(e.note)}</p>`:''}
   <div class="ldbtns"><button class="btn ghost editBtn" type="button">ערוך והרץ</button></div><div class="sxed" hidden></div>`,sourcesHTML(e.db,e.sql,e.diff?'הטבלאות לפני הפקודה':null));
  const b=el.querySelector('.editBtn'),ed=el.querySelector('.sxed');let made=false;
  b.onclick=()=>{ed.hidden=!ed.hidden;b.textContent=ed.hidden?'ערוך והרץ':'סגור עורך';
    if(!made){made=true;editor(ed,e.db,e.sql+(e.after?';\n'+e.after:''),r=>resultHTML(r,'התוצאה שלך',e.diff?e.before:null));}};
});

/* ---- execution-order stepper ---- */
{const ex=document.querySelector('.ex.sqlstep');if(ex){
  ex.querySelector('.q').insertAdjacentHTML('afterend',sourcesHTML('bank','from deposit natural join customer','הטבלאות בשאילתה').replace('class="srcside"','class="srcside strip"'));
  const S=SQLD.STEPS,lines=S.sql.split('\n'),clauseLine=[1,2,3,4,0,5];
  const bi=S.group.cols.indexOf('branch_name'),groups=[...new Set(S.group.rows.map(r=>r[bi]))];
  const gtable=(withHaving)=>{const rows=S.group.rows.map(r=>{const g=groups.indexOf(r[bi]),out=withHaving&&!S.having.includes(r[bi]);
      return `<tr class="grp g${g%4}${out?' gone':''}">${r.map(v=>`<td>${esc(fmt(v))}</td>`).join('')}</tr>`;}).join('');
    return `<div class="rtwrap"><table class="rt"><thead><tr>${S.group.cols.map(c=>`<th class="${c==='branch_name'?'fresh':''}">${c}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table><div class="rtcount">${groups.length} קבוצות${withHaving?` · ${groups.length-S.having.length} נפלו ב־having`:''}</div></div>`;};
  const stages=[
    ()=>relTable(toRel(S.from),null,{noprov:1}),
    ()=>relTable(toRel(S.where),toRel(S.from),{noprov:1}),
    ()=>gtable(false),()=>gtable(true),
    ()=>relTable(toRel(S.select),null,{noprov:1}),
    ()=>relTable(toRel(S.order),null,{noprov:1})];
  const caps=['8 שורות: כל חשבון עם פרטי הבעלים','3 שורות נמחקו (לקוחות מ־Haifa)','3 קבוצות לפי סניף','Hamerkaz נפלה: שורה אחת בלבד','שורה אחת לכל קבוצה','מיון לפי avg_balance, מהגבוה לנמוך'];
  const steps=[...ex.querySelectorAll('.step')],panel=ex.querySelector('.algpanel'),cap=ex.querySelector('.livecap'),box=ex.querySelector('.steps');
  const prevB=ex.querySelector('.prevBtn'),nextB=ex.querySelector('.nextBtn'),allB=ex.querySelector('.allBtn'),prog=ex.querySelector('.prog');let cur=0;
  function go(i){cur=Math.max(0,Math.min(steps.length-1,i));steps.forEach((s,j)=>s.hidden=j!==cur);
    const code=lines.map((l,j)=>`<span class="sl${j===clauseLine[cur]?' on':''}${[1,2,3,4,0,5].slice(0,cur+1).includes(j)?' done':''}">${hl(l)}</span>`).join('\n');
    panel.innerHTML=`<pre class="sqlcode stepcode">${code}</pre><div class="rtrow">${stages[cur]()}</div>`;cap.innerHTML=capHTML(caps[cur]);
    prog.textContent=`שלב ${cur+1} מתוך ${steps.length}`;prevB.disabled=cur===0;nextB.disabled=allB.disabled=cur===steps.length-1;}
  function lock(){panel.style.minHeight=cap.style.minHeight=box.style.minHeight='';const keep=cur;let a=0,b=0,c=0;
    steps.forEach((_,j)=>{go(j);a=Math.max(a,panel.offsetHeight);b=Math.max(b,cap.offsetHeight);c=Math.max(c,box.offsetHeight);});
    panel.style.minHeight=a+'px';cap.style.minHeight=b+'px';box.style.minHeight=c+'px';go(keep);}
  prevB.onclick=()=>go(cur-1);nextB.onclick=()=>go(cur+1);allB.onclick=()=>go(steps.length-1);
  go(0);lock();let t;window.addEventListener('resize',()=>{clearTimeout(t);t=setTimeout(lock,150);});if(document.fonts)document.fonts.ready.then(lock);
}}

/* ---- join explorer ---- */
{const X=document.getElementById('joinX');if(X){const J=SQLD.JOINS;
  const cust=toRel(J.customer),dep=toRel(J.deposit);
  const render=k=>{const r=J[k].res,cols=r.cols;
    const cOnly=['street','customer_city'].map(c=>cols.indexOf(c)),dOnly=['account_number','balance'].map(c=>cols.indexOf(c));
    const rows=r.rows.map(t=>{const lo=dOnly.every(i=>t[i]===null),ro=cOnly.every(i=>t[i]===null);
      return `<tr class="${lo?'jl':ro?'jr':''}">${t.map(v=>v===null?'<td class="nul">null</td>':`<td>${esc(fmt(v))}</td>`).join('')}</tr>`;}).join('');
    X.querySelector('.jsql').innerHTML=hl(J[k].sql);
    X.querySelector('.jout').innerHTML=`<div class="rtwrap"><div class="rtname">תוצאה</div><table class="rt"><thead><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table><div class="rtcount">${r.rows.length} שורות</div></div>`;
    X.querySelectorAll('.jbtns button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.j===k));};
  X.querySelector('.jin').innerHTML=relTable(cust,null,{label:'customer',noprov:1})+relTable(dep,null,{label:'deposit',noprov:1});
  X.querySelector('.jbtns').addEventListener('click',e=>{const b=e.target.closest('button');if(b)render(b.dataset.j);});render('inner');
}}

/* ---- count & null demo ---- */
{const N=document.getElementById('nullDemo');if(N){const R=SQLD.NULLS,v=R.rows[0];
  const items=[['count(*)',v[0],'כל השורות, גם עם null'],['count(x)',v[1],'שורות שבהן x אינו null'],['count(distinct x)',v[2],'ערכים שונים שאינם null'],['sum(x)',v[3],'1 + 1 + 2'],['avg(x)',Math.round(v[4]*100)/100,'4 / 3 — לא 4 / 4'],
    ["where x = null",R.cmp.rows[0][0],'שורות — השוואה ל־null אף פעם אינה אמת'],["where x is null",R.is.rows[0][0],'שורה — הדרך הנכונה']];
  N.innerHTML=`<div class="rtrow">${relTable(toRel(R.table),null,{label:'t',noprov:1}).replace(/<td class="">null<\/td>/,'<td class="nul">null</td>')}
   <div class="rtwrap"><table class="rt nulltab"><tbody>${items.map(([e,val,why])=>`<tr><td dir="ltr"><code class="xp">${e}</code></td><td class="big">${val}</td><td class="why">${capHTML(why)}</td></tr>`).join('')}</tbody></table></div></div>`;}}

/* ---- exercise 3 review ---- */
{const L=document.getElementById('ex3List'),T=document.getElementById('ex3Tabs');if(L){
  const vt={ok:'תקין',note:'הערה',fix:'תיקון'};
  L.innerHTML=SQLD.EX3.map(e=>`<div class="sqlex e3" data-q="${e.id[1]}" id="${e.id}">
    <div class="sxq"><span class="vd ${e.verdict}">${vt[e.verdict]}</span> ${capHTML(e.q)}</div>
    ${withSide(`<div class="sxlab">בפתרון הרשמי</div><pre class="sqlcode course">${hl(e.official)}</pre>
    <div class="sxlab">גרסה שרצה ב־SQLite</div><pre class="sqlcode">${hl(e.sql)}</pre>
    ${e.note?`<p class="sxnote">${capHTML(e.note)}</p>`:''}
    <div class="sxres">${e.diff?resultHTML(e.res,`${e.diff} אחרי הפקודה`,e.before):resultHTML(e.res,'תוצאה על נתוני הדוגמה')}</div>
    <div class="ldbtns"><button class="btn ghost editBtn" type="button">ערוך והרץ</button></div><div class="sxed" hidden></div>`,sourcesHTML(e.db,e.sql,'נתוני הדוגמה בשאילתה'))}</div>`).join('');
  L.querySelectorAll('.e3').forEach(el=>{const e=SQLD.EX3.find(x=>x.id===el.id);
    const b=el.querySelector('.editBtn'),ed=el.querySelector('.sxed');let made=false;
    b.onclick=()=>{ed.hidden=!ed.hidden;b.textContent=ed.hidden?'ערוך והרץ':'סגור עורך';if(!made){made=true;editor(ed,e.db,e.sql);}};
});
  const qs=['1','2','3','4','5'],names={1:'1. אנשים ומכוניות',2:'2. שאילתות (כמו תרגיל 2)',3:'3. עדכונים',4:'4. תצפיות',5:'5. הקבצה'};
  T.className='practice-tabs';T.innerHTML=qs.map((q,i)=>`<button type="button" data-q="${q}" aria-pressed="${i===0}">${names[q]}</button>`).join('');
  const show=q=>{L.querySelectorAll('.e3').forEach(x=>x.hidden=x.dataset.q!==q);T.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.q===q));};
  T.onclick=e=>{const b=e.target.closest('button');if(b)show(b.dataset.q);};show('1');
}}

/* ---- practice with auto-check ---- */
{const P=document.getElementById('practiceList');if(P){
  const norm=r=>r.rows.map(x=>JSON.stringify(x.map(v=>typeof v==='number'?Math.round(v*1000)/1000:v))).sort();
  const side=sourcesHTML('bank','',`נתוני הבנק`,true);
  P.innerHTML=SQLD.PRACTICE.map((p,i)=>`<div class="ladder sqlp" data-i="${i}"><div class="lq"><b>${i+1}.</b> ${capHTML(p.q)}</div>`+withSide(`
    <ol class="hints">${p.hints.map(h=>`<li>${capHTML(h)}</li>`).join('')}</ol><div class="pred"></div>
    <div class="ldbtns"><button class="btn ghost hintBtn2" type="button">רמז</button><button class="btn ghost expBtn" type="button">הצג תוצאה צפויה</button></div><div class="pexp" hidden></div>`,side)+`</div>`).join('');
  P.querySelectorAll('.sqlp').forEach(el=>{const p=SQLD.PRACTICE[+el.dataset.i],hints=[...el.querySelectorAll('.hints li')];let n=0;hints.forEach(h=>h.hidden=true);
    const hb=el.querySelector('.hintBtn2');const upd=()=>{hb.textContent=n<hints.length?`רמז ${n+1} מתוך ${hints.length}`:'כל הרמזים פתוחים';hb.disabled=n>=hints.length;};upd();
    hb.onclick=()=>{if(n<hints.length){hints[n].hidden=false;n++;upd();}};
    const eb=el.querySelector('.expBtn'),ex=el.querySelector('.pexp');eb.onclick=()=>{ex.hidden=!ex.hidden;eb.textContent=ex.hidden?'הצג תוצאה צפויה':'הסתר';if(!ex.innerHTML)ex.innerHTML=resultHTML(p.expected,'תוצאה צפויה');};
    editor(el.querySelector('.pred'),'bank','-- כתוב כאן את השאילתה שלך\nselect ',r=>{
      if(r.error)return resultHTML(r);
      const ok=JSON.stringify(norm(r))===JSON.stringify(norm(p.expected));
      const same=r.rows.length===p.expected.rows.length;
      return `<div class="verdict ${ok?'good':'bad'}">${ok?'נכון ✓ התוצאה זהה לתוצאה הצפויה.':`עדיין לא. לשאילתה שלך יש ${r.rows.length} שורות; לתוצאה הצפויה יש ${p.expected.rows.length}.${same?' מספר השורות זהה, אז בדוק את הערכים או את העמודות.':''}`}</div>${resultHTML(r,'התוצאה שלך')}`;});
    el.querySelector('.runBtn').textContent='בדוק';});
}}

/* ---- playground ---- */
{const sel=document.getElementById('playDb');if(sel){
  const sch=document.getElementById('playSchema'),ta=document.getElementById('playSql'),out=document.getElementById('playOut');
  const showSchema=()=>{const T=SQLD.TABLES[sel.value];sch.className='bankgrid';sch.innerHTML=Object.keys(T).map(n=>relTable(toRel(T[n]),null,{label:n,noprov:1})).join('');};
  sel.onchange=showSchema;showSchema();
  const go=async()=>{out.innerHTML='<div class="sqlmsg">מריץ…</div>';try{out.innerHTML=resultHTML(await runLive(sel.value,ta.value),'תוצאה');}catch(e){out.innerHTML=`<div class="sqlerr">${esc(e.message)}</div>`;}};
  document.getElementById('playRun').onclick=go;ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();go();}});
}}
document.querySelectorAll('code.xp').forEach(c=>{if(c.textContent.length>26)c.classList.add('wrap');});
window.SQLKIT={hl,runLive,resultHTML,editor,toRel,sourcesHTML,withSide};
})();
