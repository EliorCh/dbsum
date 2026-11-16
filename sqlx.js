/* SQLX — interactive breakdown of a SQL query: clickable clauses, source tables, and what each clause does to rows/columns. */
(function(){
const K=()=>window.SQLKIT;
const esc=v=>String(v==null?'null':v).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const fmtv=v=>v==null?'null':typeof v==='number'?String(Math.round(v*100)/100):v;

/* ---------- lexical helpers ---------- */
function mask(s){ // depth per char, and quote flag
  const d=new Array(s.length),q=new Array(s.length);let dep=0,inq=false;
  for(let i=0;i<s.length;i++){const c=s[i];
    if(inq){q[i]=true;d[i]=dep;if(c==="'")inq=false;continue;}
    if(c==="'"){inq=true;q[i]=true;d[i]=dep;continue;}
    if(c==='(')dep++;d[i]=dep;q[i]=false;if(c===')')dep--;
    if(c===')')d[i]=dep;}
  return {d,q};}
function top(s,re){const {d,q}=mask(s);const out=[];re.lastIndex=0;let m;
  while((m=re.exec(s))){if(d[m.index]===0&&!q[m.index])out.push({i:m.index,t:m[0],m});if(m[0]==='')re.lastIndex++;}return out;}
function closeParen(s,i){let dep=0,inq=false;for(let j=i;j<s.length;j++){const c=s[j];if(inq){if(c==="'")inq=false;continue;}if(c==="'"){inq=true;continue;}
  if(c==='(')dep++;else if(c===')'){dep--;if(!dep)return j;}}return -1;}
const stripSemi=s=>s.replace(/;\s*$/,'');
function splitStatements(s){const cuts=top(s,/;/g).map(x=>x.i);const out=[];let p=0;for(const c of cuts){out.push([p,c]);p=c+1;}out.push([p,s.length]);
  return out.filter(([a,b])=>s.slice(a,b).trim());}

/* ---------- parse one SELECT (offsets relative to text) ---------- */
const CL=/\b(select|from|where|group\s+by|having|order\s+by)\b/gi;
function parseSelect(t,off){
  const so=top(t,/\b(union(\s+all)?|except|intersect)\b/gi);
  if(so.length){const o=so[0];return {kind:'setop',off,text:t,op:o.t.toLowerCase(),left:{a:off,b:off+o.i},right:{a:off+o.i+o.t.length,b:off+t.length},opAt:off+o.i,opLen:o.t.length};}
  const ks=top(t,CL);const P={kind:'select',off,text:t};
  ks.forEach((k,n)=>{const end=n+1<ks.length?ks[n+1].i:t.length;const key=k.t.toLowerCase().replace(/\s+/,' ');P[key]={a:off+k.i,kb:off+k.i+k.t.length,b:off+end,body:t.slice(k.i+k.t.length,end)};});
  if(P.select){const m=P.select.body.match(/^\s*distinct\b/i);if(m){P.distinct={a:P.select.kb+m[0].indexOf(m[0].trim()),b:P.select.kb+m[0].length};P.selbody=P.select.body.slice(m[0].length);P.selA=P.select.kb+m[0].length;}else{P.selbody=P.select.body;P.selA=P.select.kb;}}
  return P;}
/* FROM items */
const JOINRE=/\b(natural\s+)?((left|right|full)\s+(outer\s+)?|inner\s+|cross\s+)?join\b/gi;
function parseFrom(F){ // F={a,kb,b,body}
  const body=F.body,base=F.kb;const seps=[...top(body,/,/g),...top(body,JOINRE)].sort((x,y)=>x.i-y.i);
  const items=[];let p=0;const segs=[];for(const s of seps){segs.push([p,s.i]);p=s.i+s.t.length;}segs.push([p,body.length]);
  const joinSyntax=top(body,JOINRE).length>0,natural=/\bnatural\b|\busing\b/i.test(body);
  for(const [a,b] of segs){let seg=body.slice(a,b);const on=top(seg,/\b(on|using)\b/gi);if(on.length)seg=seg.slice(0,on[0].i);
    const lead=seg.match(/^\s*/)[0].length;const st=a+lead;const s2=seg.trim();if(!s2)continue;
    if(s2[0]==='('){const c=closeParen(s2,0);const sub=s2.slice(1,c);const rest=s2.slice(c+1).trim().replace(/^as\s+/i,'');
      items.push({derived:true,sub,alias:rest||null,name:rest||'(תת־שאילתה)',a:base+st,b:base+st+c+1});}
    else{const m=s2.match(/^(\w+)(?:\s+(?:as\s+)?(\w+))?/);items.push({name:m[1],alias:m[2]||m[1],a:base+st,b:base+st+m[1].length});}}
  return {items,joinSyntax,natural};}
/* WHERE conjuncts */
function conjuncts(W){const body=W.body,base=W.kb;const ands=top(body,/\band\b/gi),bets=top(body,/\bbetween\b/gi);
  const cut=[];let pend=0;const bi=bets.map(x=>x.i);
  for(const a of ands){const before=bi.filter(x=>x<a.i).length;if(before>pend){pend++;continue;}cut.push(a);}
  const out=[];let p=0;for(const c of cut){out.push([p,c.i]);p=c.i+c.t.length;}out.push([p,body.length]);
  return out.map(([a,b])=>{const s=body.slice(a,b);const l=s.match(/^\s*/)[0].length,r=s.match(/\s*$/)[0].length;return {a:base+a+l,b:base+b-r,text:s.trim()};}).filter(x=>x.text);}
const isJoin=t=>{const m=t.match(/^(\w+)\.(\w+)\s*=\s*(\w+)\.(\w+)$/);return !!m&&m[1].toLowerCase()!==m[3].toLowerCase();};
/* subqueries inside a span of text */
function subqs(full,a,b){const out=[];const t=full.slice(a,b);const re=/\(\s*select\b/gi;let m;
  while((m=re.exec(t))){const st=m.index;const c=closeParen(t,st);if(c<0)break;out.push({a:a+st,b:a+c+1,text:t.slice(st+1,c)});re.lastIndex=c+1;}return out;}
/* columns referenced in an expression */
function refs(expr,cols){const q=expr.replace(/'[^']*'/g,'');const hit=new Set();
  for(const m of q.matchAll(/\b(\w+)\.(\w+)\b/g)){const k=(m[1]+'.'+m[2]).toLowerCase();cols.forEach((c,i)=>{if(c.toLowerCase()===k)hit.add(i);});}
  const bare=q.replace(/\b\w+\.\w+\b/g,' ');
  for(const m of bare.matchAll(/\b([a-z_]\w*)\b/gi)){const w=m[1].toLowerCase();cols.forEach((c,i)=>{const cl=c.toLowerCase();if(cl===w||cl.endsWith('.'+w))hit.add(i);});}
  return hit;}

/* ---------- table renderer ---------- */
function table(cols,rows,o={}){const vis=cols.map((c,i)=>i).filter(i=>!cols[i].startsWith('__'));const cap=o.cap||60;
  const head=vis.map(i=>`<th class="${o.colHi&&o.colHi.has(i)?'xh':''}${o.colNew&&o.colNew.has(i)?' xn':''}">${esc(cols[i])}</th>`).join('');
  const body=rows.slice(0,cap).map((r,ri)=>`<tr class="${o.rowCls?o.rowCls(r,ri):''}" data-ri="${ri}">${vis.map(i=>`<td class="${o.colHi&&o.colHi.has(i)?'xh':''}${o.cellCls?' '+o.cellCls(r,ri,i):''}">${esc(fmtv(r[i]))}</td>`).join('')}</tr>`).join('');
  const more=rows.length>cap?`<div class="rtcount">מוצגות ${cap} שורות מתוך ${rows.length}</div>`:`<div class="rtcount">${o.count||(rows.length===1?'שורה אחת':rows.length+' שורות')}</div>`;
  return `<div class="rtwrap xtw">${o.label?`<div class="rtname">${o.label}</div>`:''}<table class="rt">${head?`<thead><tr>${head}</tr></thead>`:''}<tbody>${body}</tbody></table>${more}</div>`;}

/* ---------- build the model for a statement ---------- */
async function build(db,src,extra){
  const R=(q)=>K().runLive(db,q);
  const sts=splitStatements(src);const S=sts.map(([a,b])=>({a,b,t:src.slice(a,b)}));
  // pick the statement to explain
  let ix=S.findIndex(s=>/^\s*(update|delete|insert|create\s+view|with|select)\b/i.test(s.t));if(ix<0)ix=S.length-1;
  const st=S[ix];const setup=S.slice(0,ix).map(s=>s.t).join(';\n');const pre=(extra?extra.replace(/;?\s*$/,';\n'):'')+(setup?setup+';\n':'');
  const lead=st.t.match(/^\s*/)[0].length;let t=st.t.slice(lead);let off=st.a+lead;
  const M={src,db,ranges:[],steps:[],pre,R};
  let withPre='';
  // create view v as <select>
  let mv=t.match(/^create\s+view\s+(\w+)\s+as\s*\(?/i);
  if(mv){M.view=mv[1];off+=mv[0].length;t=t.slice(mv[0].length);if(mv[0].trim().endsWith('(')){const c=closeParen('('+t,0);t=t.slice(0,c-1);} M.after=S.slice(ix+1).map(s=>s.t).join(';\n');}
  if(/^(create\s+table|drop|alter)\b/i.test(t))return {msg:'זו פקודת הגדרה (DDL) — היא יוצרת או משנה מבנה של טבלה, ואין בה שורות לסנן. את התוצאה רואים בהרצה.'};
  let mi=t.match(/^insert\s+into\s+(\w+)(\s*\([^)]*\))?\s*/i);
  if(mi&&/^\s*select\b/i.test(t.slice(mi[0].length))){M.insert=mi[1];off+=mi[0].length;t=t.slice(mi[0].length);}
  else if(mi){return {msg:'פקודת insert עם values פשוט מוסיפה את השורה — אין כאן מה לפרק.'};}
  let mw=t.match(/^with\s+(\w+)\s+as\s*\(/i);
  if(mw){const c=closeParen(t,mw[0].length-1);withPre=t.slice(0,c+1)+'\n';M.cte={name:mw[1],a:off+mw[0].length,b:off+c,text:t.slice(mw[0].length,c)};
    const rest=t.slice(c+1);const l2=rest.match(/^\s*/)[0].length;off+=c+1+l2;t=rest.slice(l2);}
  M.withPre=withPre;const run=(q)=>R(pre+withPre+q);M.run=run;
  // DML
  const md=t.match(/^delete\s+(?:from\s+)?(\w+)(?:\s+(\w+))?/i),mu=t.match(/^update\s+(\w+)(?:\s+(\w+))?\s+set\b/i);
  if(md||mu){const name=(md||mu)[1];const W=top(t,/\bwhere\b/gi);
    const P={kind:md?'delete':'update',from:{items:[{name,alias:name,a:off+(md||mu)[0].indexOf(name),b:off+(md||mu)[0].indexOf(name)+name.length}],joinSyntax:false,natural:false}};
    if(mu){const sb=t.toLowerCase().indexOf('set')+3;const se=W.length?W[0].i:t.length;P.set={a:off+sb-3,b:off+se,text:t.slice(sb,se).trim()};}
    if(W.length){const w=W[0];P.where={a:off+w.i,kb:off+w.i+5,b:off+t.length,body:t.slice(w.i+5)};}
    M.P=P;M.text=t;M.off=off;return explainDML(M,P);}
  const P=parseSelect(t,off);M.P=P;M.text=t;M.off=off;
  if(P.kind==='setop')return explainSetop(M,P);
  return explainSelect(M,P);
}
function addR(M,a,b,role,id,title,color){M.ranges.push({a,b,role,id,title,color});}

/* ---------- pastel colours: one per part of the query ---------- */
const CC=['c0','c1','c2','c3','c4'];
const colorOf=k=>k==='from'||k[0]==='j'?'pj':k[0]==='c'?'p'+CC[+k.slice(1)%5]:k==='select'||k==='set'?'ps':k==='having'?'ph':k==='group'?'pg':k[0]==='s'?'pq':k==='distinct'||k==='order'?'pd':'';

/* ---------- table renderer with per-row / per-column classes ---------- */
function tbl(cols,rows,o={}){const vis=cols.map((c,i)=>i).filter(i=>!cols[i].startsWith('__'));const cap=o.cap||60;
  const cc=i=>o.colCls?o.colCls(i)||'':'';
  const head=vis.map(i=>`<th class="${cc(i)}">${esc(cols[i])}</th>`).join('');
  const body=rows.slice(0,cap).map((r,ri)=>`<tr class="${o.rowCls?o.rowCls(r,ri)||'':''}" data-ri="${o.ri?o.ri(r,ri):ri}">${vis.map(i=>`<td class="${cc(i)}">${esc(fmtv(r[i]))}</td>`).join('')}</tr>`).join('');
  const n=o.total!=null?o.total:rows.length;
  const more=rows.length>cap||o.total>rows.length?`<div class="rtcount">מוצגות ${Math.min(cap,rows.length)} שורות מתוך ${n}</div>`:`<div class="rtcount">${o.count||(n===1?'שורה אחת':n+' שורות')}</div>`;
  return `<div class="rtwrap xtw${o.cls?' '+o.cls:''}">${o.label?`<div class="rtname">${o.label}</div>`:''}<table class="rt">${head?`<thead><tr>${head}</tr></thead>`:''}<tbody>${body}</tbody></table>${more}</div>`;}

/* which columns of a source table an expression touches */
function colHits(expr,S){if(!expr)return new Set();const q=expr.replace(/'[^']*'/g,'');const out=new Set();const names=[S.alias,S.name].filter(Boolean).map(x=>x.toLowerCase());
  for(const m of q.matchAll(/\b(\w+)\.(\w+)\b/g))if(names.includes(m[1].toLowerCase()))S.cols.forEach(c=>{if(c.toLowerCase()===m[2].toLowerCase())out.add(c);});
  const bare=q.replace(/\b\w+\.\w+\b/g,' ');for(const m of bare.matchAll(/\b([a-z_]\w*)\b/gi))S.cols.forEach(c=>{if(c.toLowerCase()===m[1].toLowerCase())out.add(c);});
  return out;}
const mentions=(text,name)=>new RegExp('\\b'+name+'\\b','i').test(text.replace(/'[^']*'/g,''));

/* ---------- all tables of the exercise, with rowids ---------- */
async function gatherSources(M,items,run){const db=M.db;const S=[];
  for(const [i,it] of items.entries()){let r;
    if(it.derived)r=await run(`select * from (${it.sub})`);
    else{r=await run(`select rowid as __rid, * from ${it.name}`);if(r.error)r=await run(`select * from ${it.name}`);}
    S.push({key:'i'+i,i,name:it.derived?null:it.name,alias:it.alias||it.name,label:it.derived?`תת־שאילתה${it.alias?' '+it.alias:''}`:(it.alias&&it.alias.toLowerCase()!==it.name.toLowerCase()?`${it.name} ${it.alias}`:it.name),
      cols:(r.cols||[]).filter(c=>c!=='__rid'),rcols:r.cols||[],rows:r.rows||[],hasRid:(r.cols||[])[0]==='__rid',from:true});}
  const used=new Set(items.filter(x=>!x.derived).map(x=>x.name.toLowerCase()));
  const SD=typeof SQLD!=='undefined'?SQLD:(window.SQLD||{});const all=Object.keys((SD.TABLES||{})[db]||{});
  for(const n of all){if(used.has(n.toLowerCase()))continue;const r=await run(`select rowid as __rid, * from ${n}`);if(r.error)continue;
    S.push({key:'u'+n,name:n,alias:n,label:n,cols:r.cols.filter(c=>c!=='__rid'),rcols:r.cols,rows:r.rows,hasRid:true,from:false});}
  return S;}

/* render the source tables for one step.  v[key] = {fade, rowCls(rid), colCls(col), colFade} */
function srcHTML(S,v){return `<div class="xsrc">${S.map(s=>{const o=v[s.key]||{};
  const big=s.rows.length>30;let rows=s.rows;
  if(big&&o.rowCls){const sc=r=>{const c=o.rowCls(r[0])||'';return c.includes('p')?0:c.includes('xfade')?2:1;};rows=rows.slice().sort((a,b)=>sc(a)-sc(b));}
  const ci=c=>s.rcols[c];
  return `<div class="xsrct${o.fade?' xoff':''}${o.on?' on':''}">${tbl(s.rcols,rows,{label:esc(s.label),cap:big?12:60,total:s.rows.length,
    rowCls:o.rowCls?(r=>o.rowCls(s.hasRid?r[0]:null)):null,
    colCls:i=>{const c=ci(i);const k=o.colCls?o.colCls(c):'';return k||(o.colFade?'xcfade':'');}})}</div>`;}).join('')}</div>`;}

async function colList(M,from,run){ // qualified column list, or null for select *
  if(from.natural||from.items.some(i=>i.derived||(M.cte&&i.name.toLowerCase()===M.cte.name.toLowerCase())))return null;
  const parts=[];for(const it of from.items){const r=await run(`pragma table_info(${it.name})`);if(r.error||!r.rows.length)return null;
    r.rows.forEach(row=>parts.push(`${it.alias}.${row[1]} as "${it.alias}.${row[1]}"`));}
  return parts.join(', ');}
async function explainSelect(M,P){
  const full=M.src,run=M.run;
  const from=P.from?parseFrom(P.from):{items:[],joinSyntax:false,natural:false};
  const conds=P.where?conjuncts(P.where):[];
  const J=conds.filter(c=>!from.joinSyntax&&isJoin(c.text)),F=conds.filter(c=>!J.includes(c));
  if(P.from){addR(M,P.from.a,P.from.b,'from','from','from: מאילו טבלאות','pj');from.items.forEach((it,i)=>addR(M,it.a,it.b,'tbl','t'+i,it.name));}
  J.forEach((c,i)=>addR(M,c.a,c.b,'join','j'+i,'תנאי צירוף','pj'));F.forEach((c,i)=>addR(M,c.a,c.b,'cond','c'+i,'תנאי סינון',colorOf('c'+i)));
  if(P['group by'])addR(M,P['group by'].a,P['group by'].b,'group','group','group by','pg');
  if(P.having)addR(M,P.having.a,P.having.b,'having','having','having','ph');
  if(P.select){addR(M,P.select.a,P.distinct?P.distinct.a:P.selA,'select','select','select','ps');addR(M,P.selA,P.select.b,'select','select','select','ps');}
  if(P.distinct)addR(M,P.distinct.a,P.distinct.b,'distinct','distinct','distinct','pd');
  if(P['order by'])addR(M,P['order by'].a,P['order by'].b,'order','order','order by','pd');
  if(M.cte)addR(M,M.cte.a,M.cte.b,'cte','cte','with');
  const SQ=[];[P.where,P.having,P.select].filter(Boolean).forEach(z=>subqs(full,z.kb||z.a,z.b).forEach(s=>SQ.push(s)));
  SQ.forEach((s,i)=>addR(M,s.a,s.b,'subq','s'+i,'תת־שאילתה','pq'));
  // data
  if(!P.from){const f=await run(M.text);if(f.error)return {error:f.error};M.S=[];M.subqs=[];M.steps=[{id:'select',title:'select',rk:'select',cap:'שאילתה בלי from: select פשוט מחשב את הביטויים ומחזיר שורה אחת.',src:{},work:tbl(f.cols,f.rows,{label:'התוצאה',cls:'xres'})}];return M;}
  const S=await gatherSources(M,from.items,run);
  if(M.cte){const r=await run(`select * from ${M.cte.name}`);S.unshift({key:'cte',name:M.cte.name,alias:M.cte.name,label:`${M.cte.name} (with)`,cols:r.cols||[],rcols:r.cols||[],rows:r.rows||[],hasRid:false,from:true});}
  const cl=await colList(M,from,run);const sel=cl||'*';const fromSQL=P.from?' from '+P.from.body:'';
  const FS=S.filter(s=>s.key[0]==='i');
  const rid=FS.filter(s=>s.hasRid).map(s=>`, ${s.alias}.rowid as "__r${s.i}"`).join('');
  const jw=J.length?' where '+J.map(c=>c.text).join(' and '):'';
  const fc=await run(`select ${sel}${rid}${F.map((c,i)=>`, (${c.text}) as "__c${i}"`).join('')}${fromSQL}${jw}`);
  if(fc.error)return {error:fc.error};
  const col=n=>fc.cols.indexOf(n);const RI=FS.map(s=>[s,col('__r'+s.i)]).filter(x=>x[1]>=0);
  const ci=F.map((_,i)=>col('__c'+i));const truth=(r,i)=>!!r[ci[i]];
  const keepTo=k=>r=>F.slice(0,k).every((_,i)=>truth(r,i));const keep=keepTo(F.length);
  const contrib=rows=>{const m={};RI.forEach(([s,ix])=>m[s.key]=new Set(rows.map(r=>r[ix])));return m;};
  const kept=fc.rows.filter(keep);
  // group
  let G=null;const gb=P['group by'];const agg=/\b(count|sum|avg|min|max)\s*\(/i.test(P.selbody||'');
  const where=[...J,...F].map(c=>c.text).join(' and ')||'1';
  if(gb){const gx=gb.body.trim().split(',').map(x=>`(${x.trim()})`).join(" || ' | ' || ");
    const gq=await run(`select ${sel}${rid}, ${gx} as "__g"${fromSQL} where ${where}`);
    if(!gq.error){const gi=gq.cols.indexOf('__g');const keys=[...new Set(gq.rows.map(r=>r[gi]))];G={q:gq,gi,keys,expr:gb.body.trim()};
      if(P.having){const hq=await run(`select ${gx} as "__g", (${P.having.body.trim()}) as "__h"${fromSQL} where ${where} group by ${gb.body}`);
        if(!hq.error)G.hv=Object.fromEntries(hq.rows.map(r=>[r[0],!!r[1]]));}}}
  const final=await run(M.text);
  const nodist=P.distinct?await run(M.text.slice(0,P.distinct.a-M.off)+M.text.slice(P.distinct.b-M.off)):null;
  // ---- steps ----
  const steps=[];const W=fc.cols;
  const wcol=(expr,cls)=>{const h=refs(expr,W);return i=>h.has(i)?cls:'';};
  const fadeUnused=(extra={})=>{const v={};S.forEach(s=>{if(!s.from)v[s.key]={fade:!(extra.sub&&mentions(extra.sub,s.name))};});return v;};
  // 1. all tables
  steps.push({id:'tables',title:'כל הטבלאות',rk:'tbl',cap:'כל הטבלאות בתרגיל. בשלבים הבאים מה שלא רלוונטי ייעלם בהדרגה, וכל חלק בשאילתה יסמן בצבע משלו את השורות והעמודות שהוא משפיע עליהן.',src:{},work:''});
  // 2. from
  if(P.from){const v=fadeUnused();const c0=contrib(fc.rows);
    FS.forEach(s=>{const jc=new Set(J.flatMap(c=>[...colHits(c.text,s)]));
      v[s.key]={on:true,colCls:c=>jc.has(c)?'pj':'',rowCls:J.length&&c0[s.key]?(r=>r==null||c0[s.key].has(r)?'':'xfade'):null};});
    const prod=FS.reduce((x,s)=>x*s.rows.length,1);
    const cap=FS.length>1?(from.joinSyntax?`הצירוף שכתוב ב־from מחבר את ${FS.map(s=>s.label).join(', ')}.`:J.length?`מכפלה של ${FS.map(s=>s.label).join(' × ')} (${prod} זוגות), ומתוכה נשארות רק ${fc.rows.length} שורות שמקיימות את תנאי הצירוף (סגול). שורות במקור שלא מתחברות לשום דבר דהויות.`:`בלי תנאי צירוף — מכפלה קרטזית: כל שורה עם כל שורה, ${prod} שורות.`)
      :`from לוקח את הטבלה ${FS.map(s=>s.label).join('')}. שאר הטבלאות לא משתתפות.`;
    steps.push({id:'from',title:'from',rk:'from',cap,src:v,work:FS.length>1?tbl(W,fc.rows,{label:'אחרי הצירוף',colCls:wcol(J.map(c=>c.text).join(' '),'pj')}):''});}
  // 3. each condition
  F.forEach((c,i)=>{const alive=fc.rows.filter(keepTo(i)),pass=alive.filter(r=>truth(r,i));const ca=contrib(alive),cp=contrib(pass);const cls=colorOf('c'+i);
    const v=fadeUnused({sub:c.text});FS.forEach(s=>{const h=colHits(c.text,s);v[s.key]={on:true,colCls:x=>h.has(x)?cls:'',rowCls:ca[s.key]?(r=>r==null?'':cp[s.key].has(r)?cls:ca[s.key].has(r)?'xfade xred':'xfade'):null};});
    steps.push({id:'c'+i,title:F.length>1?`תנאי ${i+1}`:'where',rk:'c'+i,cap:`<code class="xp">${esc(c.text)}</code> — ${pass.length} מתוך ${alive.length} שורות מקיימות אותו (בצבע). השורות שלא — נזרקות.`,src:v,
      work:FS.length>1||true?tbl(W,fc.rows,{label:FS.length>1?'אחרי הצירוף':null,colCls:wcol(c.text,cls),rowCls:r=>!keepTo(i)(r)?'xgone':truth(r,i)?cls:'xfade xred xstrike'}):''});});
  // 4. group / having
  if(G){const gcls=r=>'pg'+(G.keys.indexOf(r[G.gi])%6);const gc={};RI.forEach(([s,ix])=>{gc[s.key]=new Map();G.q.rows.forEach(r=>{const m=gc[s.key];const k=r[ix];const g=G.keys.indexOf(r[G.gi]);m.set(k,m.has(k)&&m.get(k)!==g?-1:g);});});
    const vG=(withH)=>{const v=fadeUnused();FS.forEach(s=>{const h=colHits(G.expr,s);v[s.key]={on:true,colCls:x=>h.has(x)?'pgk':'',rowCls:gc[s.key]?(r=>{if(r==null)return '';const g=gc[s.key].get(r);if(g===undefined)return 'xfade';if(withH&&G.hv&&!G.hv[G.keys[g]])return 'xfade xstrike';return g<0?'':'pg'+(g%6);}):null};});return v;};
    steps.push({id:'group',title:'group by',rk:'group',cap:`השורות שנשארו מתחלקות ל־${G.keys.length} קבוצות לפי <code class="xp">${esc(G.expr)}</code> — צבע פסטל לכל קבוצה, גם בטבלאות המקור.`,src:vG(false),
      work:tbl(G.q.cols,G.q.rows.slice().sort((a,b)=>G.keys.indexOf(a[G.gi])-G.keys.indexOf(b[G.gi])),{label:'הקבוצות',rowCls:gcls,colCls:wcol(G.expr,'pgk')})});
    if(G.hv){const ok=G.keys.filter(k=>G.hv[k]).length;
      steps.push({id:'having',title:'having',rk:'having',cap:`<code class="xp">${esc(P.having.body.trim())}</code> נבדק על כל קבוצה: ${ok} מתוך ${G.keys.length} קבוצות נשארות. השאר מחוקות.`,src:vG(true),
        work:tbl(G.q.cols,G.q.rows.slice().sort((a,b)=>G.keys.indexOf(a[G.gi])-G.keys.indexOf(b[G.gi])),{label:'הקבוצות',rowCls:r=>gcls(r)+(G.hv[r[G.gi]]?'':' xfade xstrike'),colCls:wcol(P.having.body,'ph')})});}}
  // 5. select
  const alive=G&&G.hv?G.q.rows.filter(r=>G.hv[r[G.gi]]):kept;const ca=contrib(alive);
  {const v=fadeUnused();FS.forEach(s=>{const h=colHits(P.selbody||'',s);const star=(P.selbody||'').trim()==='*';v[s.key]={on:true,colFade:!star,colCls:x=>star||h.has(x)?'ps':'',rowCls:ca[s.key]?(r=>r==null||ca[s.key].has(r)?'':'xfade'):null};});
    const res=nodist||final;const dupIdx=new Set();if(P.distinct){const seen=new Set();(res.rows||[]).forEach((r,i)=>{const k=JSON.stringify(r);if(seen.has(k))dupIdx.add(i);seen.add(k);});}
    steps.push({id:'select',title:'select',rk:'select',cap:`select בוחר את העמודות לתוצאה (ירוק); שאר העמודות דהויות.${agg&&!gb?' יש פונקציית הקבצה בלי group by — כל השורות הן קבוצה אחת, ויוצאת שורה אחת.':''}${P.distinct?'':' בלי distinct — שורות כפולות נשארות.'}`,src:v,
      work:res.error?`<div class="sqlerr">${esc(res.error)}</div>`:tbl(res.cols,res.rows,{label:'התוצאה'+(P.distinct?' לפני distinct':''),cls:'xres',rowCls:(r,i)=>dupIdx.has(i)?'xfade xred xstrike':''})});}
  if(P.distinct)steps.push({id:'distinct',title:'distinct',rk:'distinct',cap:`distinct זורק שורות כפולות: ${(nodist.rows||[]).length} ← ${(final.rows||[]).length} שורות.`,src:steps[steps.length-1].src,work:tbl(final.cols||[],final.rows||[],{label:'התוצאה',cls:'xres'})});
  if(P['order by'])steps.push({id:'order',title:'order by',rk:'order',cap:'order by ממיין את התוצאה — תמיד בסוף.',src:steps[steps.length-1].src,work:tbl(final.cols||[],final.rows||[],{label:'התוצאה',cls:'xres'})});
  if(M.view)steps.push({id:'view',title:'התצפית',rk:'select',cap:`התצפית ${M.view} היא השאילתה הזו עם שם — בכל שימוש היא מחושבת מחדש.`,src:steps[steps.length-1].src,work:tbl(final.cols||[],final.rows||[],{label:M.view,cls:'xres'})});
  if(M.insert){const r=await M.R(M.src);const n=(final.rows||[]).length;steps.push({id:'insert',title:'insert',rk:'select',cap:`השורות שהשאילתה מחזירה (${n}) נוספות ל־${M.insert}.`,src:steps[steps.length-1].src,work:r.error?`<div class="sqlerr">${esc(r.error)}</div>`:tbl(r.cols,r.rows,{label:M.insert+' אחרי ההוספה',cls:'xres',rowCls:(x,i)=>i>=r.rows.length-n?'ps':''})});}
  Object.assign(M,{steps,S,subqs:SQ,outerAliases:from.items.map(i=>i.alias),condOfSub:s=>F.findIndex(c=>c.a<=s.a&&s.b<=c.b),fc,F,ci,W});
  return M;}

async function explainDML(M,P){const run=M.run;const it=P.from.items[0];const conds=P.where?conjuncts(P.where):[];
  addR(M,it.a,it.b,'tbl','t0',it.name);conds.forEach((c,i)=>addR(M,c.a,c.b,'cond','c'+i,'תנאי',colorOf('c'+i)));if(P.set)addR(M,P.set.a,P.set.b,'select','set','set','ps');
  const SQ=[];if(P.where)subqs(M.src,P.where.kb,P.where.b).forEach(s=>SQ.push(s));if(P.set)subqs(M.src,P.set.a,P.set.b).forEach(s=>SQ.push(s));SQ.forEach((s,i)=>addR(M,s.a,s.b,'subq','s'+i,'תת־שאילתה','pq'));
  const S=await gatherSources(M,[{name:it.name,alias:it.alias}],run);const T=S[0];
  const fc=await run(`select rowid as __rid, *${conds.map((c,i)=>`, (${c.text}) as "__c${i}"`).join('')} from ${it.name}`);if(fc.error)return {error:fc.error};
  const ci=conds.map((_,i)=>fc.cols.indexOf('__c'+i));const truth=(r,i)=>!!r[ci[i]];const hit=r=>conds.every((_,i)=>truth(r,i));
  const after=await M.R(M.pre+M.text+';\nselect rowid as __rid, * from '+it.name);
  const steps=[];const fadeUnused=(sub)=>{const v={};S.forEach(s=>{if(!s.from)v[s.key]={fade:!(sub&&mentions(sub,s.name))};});return v;};
  steps.push({id:'tables',title:'כל הטבלאות',rk:'tbl',cap:`כל הטבלאות בתרגיל. ${P.kind} פועל על טבלה אחת: ${it.name}.`,src:{},work:''});
  conds.forEach((c,i)=>{const cls=colorOf('c'+i);const alive=fc.rows.filter(r=>conds.slice(0,i).every((_,k)=>truth(r,k)));const pass=new Set(alive.filter(r=>truth(r,i)).map(r=>r[0])),al=new Set(alive.map(r=>r[0]));
    const v=fadeUnused(c.text);const h=colHits(c.text,T);v[T.key]={on:true,colCls:x=>h.has(x)?cls:'',rowCls:r=>pass.has(r)?cls:al.has(r)?'xfade xred':'xfade'};
    steps.push({id:'c'+i,title:conds.length>1?`תנאי ${i+1}`:'where',rk:'c'+i,cap:`<code class="xp">${esc(c.text)}</code> — ${pass.size} שורות מקיימות אותו (בצבע).`,src:v,work:''});});
  const hs=new Set(fc.rows.filter(hit).map(r=>r[0]));
  if(P.kind==='delete'){const v=fadeUnused();v[T.key]={on:true,rowCls:r=>hs.has(r)?'xfade xred xstrike':''};
    steps.push({id:'res',title:'אחרי המחיקה',rk:'tbl',cap:conds.length?`${hs.size} שורות נמחקות (מחוקות למעלה). כך נראית הטבלה אחרי:`:'בלי where — כל השורות נמחקות.',src:v,work:after.error?`<div class="sqlerr">${esc(after.error)}</div>`:tbl(after.cols,after.rows,{label:it.name+' אחרי',cls:'xres'})});}
  else{const setc=colHits(P.set.text.split(',').map(x=>x.split('=')[0]).join(' '),T);const v=fadeUnused(P.set.text);v[T.key]={on:true,colCls:x=>setc.has(x)?'ps':'',rowCls:r=>hs.has(r)?'ps':''};
    steps.push({id:'set',title:'set',rk:'set',cap:`<code class="xp">${esc(P.set.text)}</code> — משנה את העמודה המסומנת רק ב־${conds.length?hs.size+' השורות שעברו את where':'כל השורות'}. למטה: הטבלה אחרי.`,src:v,
      work:after.error?`<div class="sqlerr">${esc(after.error)}</div>`:tbl(after.cols,after.rows,{label:it.name+' אחרי',cls:'xres',colCls:i=>setc.has(after.cols[i])?'ps':'',rowCls:r=>hs.has(r[0])?'ps':''})});}
  Object.assign(M,{steps,S,subqs:SQ,outerAliases:[it.alias],condOfSub:s=>conds.findIndex(c=>c.a<=s.a&&s.b<=c.b),fc,F:conds,ci,W:fc.cols});return M;}

async function explainSetop(M,P){const run=M.run;const L=M.src.slice(P.left.a,P.left.b).trim(),Rt=M.src.slice(P.right.a,P.right.b).trim();
  addR(M,P.left.a,P.left.b,'from','left','השאילתה הראשונה','pc0');addR(M,P.right.a,P.right.b,'from','right','השאילתה השנייה','pc1');addR(M,P.opAt,P.opAt+P.opLen,'select','op',P.op,'ps');
  const a=await run(L),b=await run(Rt),f=await run(M.text);if(a.error||b.error||f.error)return {error:(a.error||b.error||f.error)};
  const S=await gatherSources(M,[],run);const v=(t)=>{const o={};S.forEach(s=>o[s.key]={fade:!mentions(t,s.name)});return o;};
  const name={union:'איחוד','union all':'איחוד עם כפילויות',except:'הפרש',intersect:'חיתוך'}[P.op.replace(/\s+/,' ')]||P.op;const kf=new Set(f.rows.map(r=>JSON.stringify(r)));
  M.steps=[{id:'tables',title:'כל הטבלאות',rk:'tbl',cap:'כל הטבלאות בתרגיל.',src:{},work:''},
    {id:'left',title:'צד ראשון',rk:'left',cap:'התוצאה של השאילתה הראשונה.',src:v(L),work:tbl(a.cols,a.rows,{label:'צד ראשון',rowCls:r=>kf.has(JSON.stringify(r))?'pc0':'xfade xred'})},
    {id:'right',title:'צד שני',rk:'right',cap:'התוצאה של השאילתה השנייה.',src:v(Rt),work:tbl(b.cols,b.rows,{label:'צד שני',rowCls:()=>'pc1'})},
    {id:'op',title:P.op,rk:'op',cap:`${P.op} — ${name}. פעולות קבוצה זורקות כפילויות בעצמן (חוץ מ־union all).`,src:v(M.text),work:`<div class="xpair">${tbl(a.cols,a.rows,{label:'ראשון'})}${tbl(b.cols,b.rows,{label:'שני'})}<div class="xarrow">←</div>${tbl(f.cols,f.rows,{label:'התוצאה',cls:'xres'})}</div>`}];
  M.S=S;M.subqs=[];return M;}

/* ---------- correlated subquery for one outer row ---------- */
function innerAliases(sub){const P=parseSelect(sub,0);const out=new Set();if(P.from)parseFrom(P.from).items.forEach(i=>{out.add((i.alias||'').toLowerCase());if(i.name)out.add(i.name.toLowerCase());});return out;}
async function subFor(M,s,row,cols){const inner=innerAliases(s.text);const outer=new Set(M.outerAliases.map(a=>(a||'').toLowerCase()));
  let used=false;const sql=s.text.replace(/'[^']*'|\b(\w+)\.(\w+)\b/g,(m,al,c)=>{if(!al)return m;const k=al.toLowerCase();if(!outer.has(k)||inner.has(k))return m;
    let ci=cols.findIndex(x=>x.toLowerCase()===(al+'.'+c).toLowerCase());if(ci<0)ci=cols.findIndex(x=>x.toLowerCase()===c.toLowerCase());if(ci<0)return m;used=true;const v=row[ci];
    return v==null?'null':typeof v==='number'?String(v):"'"+String(v).replace(/'/g,"''")+"'";});
  return {sql,used,r:await M.run(sql)};}

/* ---------- UI ---------- */
function renderQuery(src,ranges){ranges=ranges.slice().sort((x,y)=>x.a-y.a||y.b-x.b);
  const K2=K();let out='',pos=0;const ev=[];ranges.forEach((r,i)=>{ev.push({p:r.a,open:true,i,r});ev.push({p:r.b,open:false,i,r});});
  ev.sort((x,y)=>x.p-y.p||(x.open===y.open?(x.open?y.r.b-x.r.b:x.r.a-y.r.a):(x.open?1:-1)));
  for(const e of ev){if(e.p>pos){out+=K2.hl(src.slice(pos,e.p));pos=e.p;}
    out+=e.open?`<span class="xq x-${e.r.role}${e.r.color?' q'+e.r.color:''}" data-k="${e.r.id}" title="${esc(e.r.title||'')}">`:'</span>';}
  out+=K2.hl(src.slice(pos));return out;}
async function mount(el,db,sql,extra){
  el.innerHTML='<div class="sqlmsg">מכין את הפירוק…</div>';
  let M;try{M=await build(db,sql,extra);}catch(e){M={error:e.message};}
  if(!M||M.msg){el.innerHTML=`<div class="sqlmsg">${M?M.msg:'אין כאן מה לפרק.'}</div>`;return;}
  if(M.error){el.innerHTML=`<div class="sqlerr">השאילתה עצמה נכשלת, ולכן אין מה לפרק: ${esc(M.error)}</div>`;return;}
  el.innerHTML=`<div class="xhelp">לחץ על חלק בשאילתה או על שלב. כל חלק בשאילתה צבוע בצבע פסטל — ובאותו צבע מסומנות השורות והעמודות שהוא משפיע עליהן. מה שלא רלוונטי דהוי.</div>
   <pre class="sqlcode xquery">${renderQuery(sql,M.ranges)}</pre>
   <div class="xsteps">${M.steps.map((s,i)=>`<button type="button" class="chip" data-s="${i}">${i+1}. ${s.title}</button>`).join('')}</div>
   <div class="xcap"></div><div class="xsrcbox"></div><div class="xpanel"></div>`;
  const Q=el.querySelector('.xquery'),cap=el.querySelector('.xcap'),sb=el.querySelector('.xsrcbox'),pan=el.querySelector('.xpanel');
  const hiQ=k=>Q.querySelectorAll('.xq').forEach(x=>x.classList.toggle('on',!!k&&(x.dataset.k===k||(k==='tbl'&&x.classList.contains('x-tbl')))));
  function show(i,k){const s=M.steps[i];el.querySelectorAll('.xsteps .chip').forEach((b,j)=>b.setAttribute('aria-pressed',j===i));
    hiQ(k||s.rk);cap.innerHTML=s.cap;sb.innerHTML=srcHTML(M.S,s.src||{});pan.innerHTML=s.work||'';
    if(k&&/^t\d+$/.test(k)){const want='i'+k.slice(1);M.S.forEach((x,j)=>{if(x.key===want)sb.querySelectorAll('.xsrct')[j].classList.add('pick');});}}
  async function showSub(k){const s=M.subqs[+k.slice(1)];hiQ(k);el.querySelectorAll('.xsteps .chip').forEach(b=>b.setAttribute('aria-pressed','false'));
    const v={};M.S.forEach(t=>{v[t.key]={fade:!(t.name&&mentions(s.text,t.name)),on:!!(t.name&&mentions(s.text,t.name)),colCls:c=>colHits(s.text,{...t,alias:null}).has(c)?'pq':''};});
    sb.innerHTML=srcHTML(M.S,v);
    const alone=await M.run(s.text);const inner=innerAliases(s.text);const outerRef=M.outerAliases.some(a=>a&&new RegExp('\\b'+a+'\\.','i').test(s.text)&&!inner.has(a.toLowerCase()));
    if(!alone.error&&!outerRef){cap.innerHTML='תת־שאילתה רגילה (לא מתואמת): היא מחושבת פעם אחת, על הטבלאות המודגשות, והתוצאה שלה משמשת את התנאי סביבה.';pan.innerHTML=tbl(alone.cols,alone.rows,{label:'התוצאה של תת־השאילתה',cls:'xres'});return;}
    const ci=M.condOfSub(s);const fc=M.fc;
    cap.innerHTML='תת־שאילתה <b>מתואמת</b>: היא משתמשת בעמודה של השורה החיצונית, ולכן מחושבת מחדש לכל שורה. <b>לחץ על שורה בטבלה</b> כדי לראות מה היא מחזירה עבורה.';
    pan.innerHTML=`<div class="xpair">${tbl(fc.cols,fc.rows,{label:'השורות החיצוניות',rowCls:r=>ci>=0?(r[M.ci[ci]]?'pq':'xfade'):'',colCls:(()=>{const h=refs(s.text,fc.cols);return i=>h.has(i)?'pq':'';})()})}<div class="xsubout"><div class="sqlmsg">בחר שורה ←</div></div></div>`;
    const out=pan.querySelector('.xsubout');
    pan.querySelectorAll('tbody tr').forEach(tr=>tr.addEventListener('click',async()=>{pan.querySelectorAll('tbody tr').forEach(x=>x.classList.remove('xsel'));tr.classList.add('xsel');
      const row=fc.rows[+tr.dataset.ri];const r=await subFor(M,s,row,fc.cols);const cv=ci>=0?row[M.ci[ci]]:null;
      const verdict=ci>=0?`<div class="verdict ${cv?'good':'bad'}">${M.F.length>1?`תנאי ${ci+1} ב־where`:'התנאי ב־where'} לשורה הזו: ${cv?'אמת — השורה נשארת':'שקר — השורה נזרקת'}</div>`:'';
      out.innerHTML=r.used?`${verdict}<pre class="sqlcode xsmall">${K().hl(r.sql)}</pre>${r.r.error?`<div class="sqlerr">${esc(r.r.error)}</div>`:tbl(r.r.cols,r.r.rows,{label:'מה שתת־השאילתה מחזירה לשורה הזו',cls:'xres',count:r.r.rows.length?undefined:'אין שורות — התוצאה ריקה'})}`
        :'<div class="sqlmsg">תת־השאילתה מתייחסת לעמודה החיצונית בלי כינוי, ולכן אי אפשר להציב בה ערכים כאן.</div>';}));}
  el.querySelector('.xsteps').addEventListener('click',e=>{const b=e.target.closest('.chip');if(b)show(+b.dataset.s);});
  Q.addEventListener('click',e=>{const x=e.target.closest('.xq');if(!x)return;e.stopPropagation();const k=x.dataset.k;
    if(/^s\d+$/.test(k)&&M.subqs.length)return showSub(k);
    let i=M.steps.findIndex(s=>s.rk===k||s.id===k);if(i<0&&k[0]==='t')i=0;if(i<0&&k[0]==='j')i=M.steps.findIndex(s=>s.id==='from');if(i<0)i=M.steps.length-1;show(i,k);});
  let mh=0;for(let i=0;i<M.steps.length;i++){show(i);mh=Math.max(mh,pan.offsetHeight);}pan.style.minHeight=Math.min(mh,640)+'px';show(0);}
/* a toggle button placed in a .ldbtns bar; getSql() is read each time it opens, so it follows a textarea */
function button(bar,db,getSql,label,before,extra){if(!bar)return;const L=label||'פירוק אינטראקטיבי';
  const b=document.createElement('button');b.type='button';b.className='btn xbtn';b.textContent=L;bar.prepend(b);
  const box=document.createElement('div');box.className='sqlx';box.hidden=true;bar.after(box);let last=null;
  b.onclick=async()=>{if(!box.hidden){box.hidden=true;b.textContent=L;return;}
    const q=getSql().replace(/--[^\n]*/g,'').trim();box.hidden=false;b.textContent='סגור פירוק';
    if(!q){box.innerHTML='<div class="sqlmsg">כתוב שאילתה קודם.</div>';last=null;return;}
    if(q!==last){last=q;if(before)try{await before();}catch(e){box.innerHTML=`<div class="sqlerr">${esc(e.message)}</div>`;return;}mount(box,db,q,extra);}};}
window.SQLX={mount,build,button};
})();
