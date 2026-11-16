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
async function build(db,src){
  const R=(q)=>K().runLive(db,q);
  const sts=splitStatements(src);const S=sts.map(([a,b])=>({a,b,t:src.slice(a,b)}));
  // pick the statement to explain
  let ix=S.findIndex(s=>/^\s*(update|delete|insert|create\s+view|with|select)\b/i.test(s.t));if(ix<0)ix=S.length-1;
  const st=S[ix];const setup=S.slice(0,ix).map(s=>s.t).join(';\n');const pre=setup?setup+';\n':'';
  const lead=st.t.match(/^\s*/)[0].length;let t=st.t.slice(lead);let off=st.a+lead;
  const M={src,db,ranges:[],steps:[],pre,R};
  let withPre='';
  // create view v as <select>
  let mv=t.match(/^create\s+view\s+(\w+)\s+as\s*\(?/i);
  if(mv){M.view=mv[1];off+=mv[0].length;t=t.slice(mv[0].length);if(mv[0].trim().endsWith('(')){const c=closeParen('('+t,0);t=t.slice(0,c-1);} M.after=S.slice(ix+1).map(s=>s.t).join(';\n');}
  let mi=t.match(/^insert\s+into\s+(\w+)(\s*\([^)]*\))?\s*/i);
  if(mi&&/^\s*select\b/i.test(t.slice(mi[0].length))){M.insert=mi[1];off+=mi[0].length;t=t.slice(mi[0].length);}
  else if(mi){return null;}
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
function addR(M,a,b,role,id,title){M.ranges.push({a,b,role,id,title});}

async function sourceTables(M,from,run){const out=[];
  for(const it of from.items){let r;
    if(it.derived)r=await run(`select * from (${it.sub})`);else r=await run(`select * from ${it.name}`);
    out.push({it,r,label:it.derived?`תת־שאילתה${it.alias?' '+it.alias:''}`:(it.alias&&it.alias.toLowerCase()!==it.name.toLowerCase()?`${it.name} ${it.alias}`:it.name)});}
  return out;}
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
  // ranges
  if(P.from){addR(M,P.from.a,P.from.b,'from','from','from: מאילו טבלאות');from.items.forEach((it,i)=>addR(M,it.a,it.b,'tbl','t'+i,it.name));}
  J.forEach((c,i)=>addR(M,c.a,c.b,'join','j'+i,'תנאי צירוף'));F.forEach((c,i)=>addR(M,c.a,c.b,'cond','c'+i,'תנאי סינון'));
  if(P['group by'])addR(M,P['group by'].a,P['group by'].b,'group','group','group by');
  if(P.having)addR(M,P.having.a,P.having.b,'having','having','having');
  if(P.select)addR(M,P.select.a,P.distinct?P.distinct.a:P.selA,'select','select','select');
  if(P.select)addR(M,P.selA,P.select.b,'select','select','select');
  if(P.distinct)addR(M,P.distinct.a,P.distinct.b,'distinct','distinct','distinct');
  if(P['order by'])addR(M,P['order by'].a,P['order by'].b,'order','order','order by');
  if(M.cte)addR(M,M.cte.a,M.cte.b,'cte','cte','with');
  // subqueries in where / having / select
  const SQ=[];[P.where,P.having,P.select].filter(Boolean).forEach(z=>subqs(full,z.kb||z.a,z.b).forEach(s=>SQ.push(s)));
  SQ.forEach((s,i)=>addR(M,s.a,s.b,'subq','s'+i,'תת־שאילתה'));
  // data
  const src=await sourceTables(M,from,run);if(M.cte){const r=await run(`select * from ${M.cte.name}`);src.unshift({it:{name:M.cte.name},r,label:`${M.cte.name} (with)`});}
  const cl=await colList(M,from,run);const sel=cl||'*';const fromSQL=P.from?' from '+P.from.body:'';
  const jw=J.length?' where '+J.map(c=>c.text).join(' and '):'';
  const base=await run(`select ${sel}${fromSQL}${jw}`);
  if(base.error)return {error:base.error};
  const fc=F.length?await run(`select ${sel}${F.map((c,i)=>`, (${c.text}) as __c${i}`).join('')}${fromSQL}${jw}`):base;
  if(fc.error)return {error:fc.error};
  const nb=base.cols.length;const truth=(r,i)=>!!r[nb+i];const keep=r=>F.every((_,i)=>truth(r,i));
  const kept=fc.rows.filter(keep).map(r=>r.slice(0,nb));
  // group
  let G=null;const gb=P['group by'];const agg=/\b(count|sum|avg|min|max)\s*\(/i.test(P.selbody||'');
  if(gb||P.having){const gexp=gb?gb.body.trim():"'הכל'";const gq=await run(`select ${sel}, (${gexp.split(',').join(") || '|' || (")}) as __g${fromSQL} where ${[...J,...F].map(c=>c.text).join(' and ')||'1'} order by __g`);
    if(!gq.error){const keys=[...new Set(gq.rows.map(r=>r[r.length-1]))];G={cols:gq.cols,rows:gq.rows,keys,expr:gexp};
      if(P.having&&gb){const hq=await run(`select (${gexp.split(',').join(") || '|' || (")}) as __g, (${P.having.body.trim()}) as __h${fromSQL} where ${[...J,...F].map(c=>c.text).join(' and ')||'1'} group by ${gb.body}`);
        if(!hq.error)G.hv=Object.fromEntries(hq.rows.map(r=>[r[0],!!r[1]]));}}}
  const final=await run(M.text);
  const nodist=P.distinct?await run(M.text.slice(0,P.distinct.a-M.off)+M.text.slice(P.distinct.b-M.off)):null;
  // steps
  const allCols=base.cols;const hi=e=>refs(e,allCols);
  const steps=[];const step=(id,title,cap,html,rk)=>steps.push({id,title,cap,html,rk:rk||id});
  steps.push({id:'tables',title:'הטבלאות',rk:'tbl',cap:`הטבלאות המקוריות ש־from משתמש בהן${src.length>1?' — '+src.length+' טבלאות':''}.`,
    html:`<div class="xsrc">${src.map((s,i)=>`<div class="xsrct" data-t="t${i}">${s.r.error?`<div class="sqlerr">${esc(s.r.error)}</div>`:table(s.r.cols,s.r.rows,{label:esc(s.label)})}</div>`).join('')}</div>`});
  if(P.from&&(src.length>1||J.length)){
    const how=from.joinSyntax?'הצירוף שכתוב ב־from':J.length?`המכפלה של ${src.map(s=>s.it.name).join(' × ')}, ומתוכה רק השורות שמקיימות את תנאי הצירוף (${J.length===1?'השורה המסומנת':'השורות המסומנות'} ב־where)`:`המכפלה הקרטזית: כל שורה מכל טבלה עם כל שורה מהאחרות`;
    const prod=src.reduce((x,s)=>x*(s.r.rows||[]).length,1);
    step('from','from + צירוף',`${how}. ${!from.joinSyntax&&src.length>1?`במכפלה ${prod} שורות; `:''}אחרי הצירוף נשארו ${base.rows.length}.`,
      table(base.cols,base.rows,{colHi:new Set(J.flatMap(c=>[...hi(c.text)]))}),'from');}
  // each condition
  F.forEach((c,i)=>{const prevOK=r=>F.slice(0,i).every((_,k)=>truth(r,k));const alive=fc.rows.filter(prevOK);const n=alive.filter(r=>truth(r,i)).length;
    step('c'+i,`תנאי ${i+1}`,`<code class="xp">${esc(c.text)}</code> — ${n} מתוך ${alive.length} שורות מקיימות אותו (ירוק). השורות האדומות נזרקות.${i?' שורות שכבר נזרקו בתנאים הקודמים מוצגות דהויות.':''}`,
      table(fc.cols,fc.rows,{colHi:hi(c.text),rowCls:r=>!prevOK(r)?'xgone':truth(r,i)?'xok':'xno'}),'c'+i);});
  if(F.length>1)step('where','where — כל התנאים',`אחרי כל התנאים נשארו ${kept.length} שורות.`,table(base.cols,kept,{}),'where');
  if(G){const gi=G.cols.length-1;const nk=G.keys.length;
    step('group','group by',`${gb?`השורות מתחלקות ל־${nk} קבוצות לפי <code class="xp">${esc(G.expr)}</code> — צבע לכל קבוצה.`:'בלי group by כל השורות הן קבוצה אחת.'}`,
      table(G.cols,G.rows,{colHi:hi(G.expr),rowCls:r=>'xg'+(G.keys.indexOf(r[gi])%6)}),'group');
    if(G.hv){const ok=G.keys.filter(k=>G.hv[k]).length;
      step('having','having',`<code class="xp">${esc(P.having.body.trim())}</code> נבדק על כל קבוצה: ${ok} מתוך ${nk} קבוצות נשארות. הקבוצות שנזרקו מחוקות.`,
        table(G.cols,G.rows,{colHi:hi(P.having.body),rowCls:r=>'xg'+(G.keys.indexOf(r[gi])%6)+(G.hv[r[gi]]?'':' xgone xstrike')}),'having');}}
  else if(agg)step('group','קבוצה אחת','ב־select יש פונקציית הקבצה ואין group by — כל השורות שנשארו הן קבוצה אחת, ויוצאת שורה אחת.',table(base.cols,kept,{}),'select');
  // select
  const selCols=new Set();if(P.selbody&&P.selbody.trim()!=='*'){hi(P.selbody).forEach(x=>selCols.add(x));}
  step('select','select',`select בוחר את העמודות לתוצאה${selCols.size?' (מסומנות)':''}.${P.distinct?'':' בלי distinct — שורות כפולות נשארות.'}`,
    `<div class="xpair">${table(base.cols,G?G.rows.filter(r=>!G.hv||G.hv[r[r.length-1]]).map(r=>r.slice(0,nb)):kept,{colHi:selCols,label:'לפני'})}<div class="xarrow">←</div>${table((nodist||final).cols||[],(nodist||final).rows||[],{label:'התוצאה'+(P.distinct?' לפני distinct':''),rowCls:(r,ri)=>{if(!P.distinct)return '';const all=(nodist.rows||[]).map(x=>JSON.stringify(x));return all.indexOf(JSON.stringify(r))<ri?'xno':'';}})}</div>`,'select');
  if(P.distinct)step('distinct','distinct',`distinct זורק שורות כפולות: ${(nodist.rows||[]).length} ← ${(final.rows||[]).length} שורות.`,table(final.cols||[],final.rows||[],{label:'התוצאה'}),'distinct');
  if(P['order by'])step('order','order by','order by ממיין את התוצאה — תמיד בסוף.',table(final.cols||[],final.rows||[],{label:'התוצאה'}),'order');
  if(M.view)step('view','התצפית',`התצפית ${M.view} היא השאילתה הזו עם שם. השימוש בה:`,table(final.cols||[],final.rows||[],{label:M.view}),'select');
  if(M.insert){const r=await M.R(M.src);step('insert','insert',`השורות שהשאילתה מחזירה נוספות ל־${M.insert}.`,r.error?`<div class="sqlerr">${esc(r.error)}</div>`:table(r.cols,r.rows,{label:M.insert+' אחרי ההוספה',rowCls:(x,ri)=>ri>=r.rows.length-(final.rows||[]).length?'xok':''}),'select');}
  M.steps=steps;M.subqs=SQ;M.outerAliases=from.items.map(i=>i.alias);M.condOfSub=s=>F.findIndex(c=>c.a<=s.a&&s.b<=c.b);M.fc=fc;M.F=F;M.qualified=!!cl;
  return M;}

async function explainDML(M,P){const run=M.run;const it=P.from.items[0];const conds=P.where?conjuncts(P.where):[];
  addR(M,it.a,it.b,'tbl','t0',it.name);conds.forEach((c,i)=>addR(M,c.a,c.b,'cond','c'+i,'תנאי'));if(P.set)addR(M,P.set.a,P.set.b,'select','set','set');
  const SQ=[];if(P.where)subqs(M.src,P.where.kb,P.where.b).forEach(s=>SQ.push(s));if(P.set)subqs(M.src,P.set.a,P.set.b).forEach(s=>SQ.push(s));SQ.forEach((s,i)=>addR(M,s.a,s.b,'subq','s'+i,'תת־שאילתה'));
  const base=await run(`select * from ${it.name}`);if(base.error)return {error:base.error};
  const fc=conds.length?await run(`select *${conds.map((c,i)=>`, (${c.text}) as __c${i}`).join('')} from ${it.name}`):base;if(fc.error)return {error:fc.error};
  const nb=base.cols.length;const truth=(r,i)=>!!r[nb+i];const hit=r=>conds.every((_,i)=>truth(r,i));
  const after=await M.R(M.pre+M.text+';\nselect * from '+it.name);const hi=e=>refs(e,base.cols);
  const steps=[];steps.push({id:'tables',title:'הטבלה',rk:'tbl',cap:`${P.kind==='delete'?'delete':'update'} פועל על טבלה אחת: ${it.name}.`,html:table(base.cols,base.rows,{label:it.name})});
  conds.forEach((c,i)=>{const prevOK=r=>conds.slice(0,i).every((_,k)=>truth(r,k));const alive=fc.rows.filter(prevOK);
    steps.push({id:'c'+i,title:conds.length>1?`תנאי ${i+1}`:'where',rk:'c'+i,cap:`<code class="xp">${esc(c.text)}</code> — ${alive.filter(r=>truth(r,i)).length} שורות מקיימות אותו (ירוק).`,
      html:table(fc.cols,fc.rows,{colHi:hi(c.text),rowCls:r=>!prevOK(r)?'xgone':truth(r,i)?'xok':'xno'})});});
  const n=fc.rows.filter(hit).length;
  if(P.kind==='delete')steps.push({id:'res',title:'אחרי המחיקה',rk:'tbl',cap:conds.length?`${n} שורות נמחקות (מחוקות בטבלה הראשונה); נשארות ${after.rows?after.rows.length:'?'}.`:'בלי where — כל השורות נמחקות.',
    html:`<div class="xpair">${table(fc.cols,fc.rows,{label:'לפני',rowCls:r=>hit(r)?'xno xstrike':''})}<div class="xarrow">←</div>${after.error?`<div class="sqlerr">${esc(after.error)}</div>`:table(after.cols,after.rows,{label:'אחרי'})}</div>`});
  else{const setCols=P.set?refs(P.set.text.split(',').map(x=>x.split('=')[0]).join(' '),base.cols):new Set();
    steps.push({id:'set',title:'set',rk:'set',cap:`<code class="xp">${esc(P.set.text)}</code> — חל רק על ${conds.length?n+' השורות שעברו את where':'כל השורות'}; העמודות שמשתנות מסומנות.`,
      html:after.error?`<div class="sqlerr">${esc(after.error)}</div>`:table(after.cols,after.rows,{label:'אחרי',colHi:setCols,rowCls:(r,ri)=>hit(fc.rows[ri]||[])?'xok':''})});}
  M.steps=steps;M.subqs=SQ;M.outerAliases=[it.alias];M.condOfSub=s=>conds.findIndex(c=>c.a<=s.a&&s.b<=c.b);M.fc=fc;M.F=conds;M.qualified=false;return M;}

async function explainSetop(M,P){const run=M.run;const L=M.src.slice(P.left.a,P.left.b).trim(),Rt=M.src.slice(P.right.a,P.right.b).trim();
  addR(M,P.left.a,P.left.b,'from','left','השאילתה השמאלית');addR(M,P.right.a,P.right.b,'from','right','השאילתה הימנית');addR(M,P.opAt,P.opAt+P.opLen,'select','op',P.op);
  const a=await run(L),b=await run(Rt),f=await run(M.text);if(a.error||b.error||f.error)return {error:(a.error||b.error||f.error)};
  const name={union:'איחוד','union all':'איחוד עם כפילויות',except:'הפרש',intersect:'חיתוך'}[P.op.replace(/\s+/,' ')]||P.op;
  const kf=new Set(f.rows.map(r=>JSON.stringify(r)));
  M.steps=[{id:'left',title:'צד ראשון',rk:'left',cap:'התוצאה של השאילתה הראשונה.',html:table(a.cols,a.rows,{rowCls:r=>kf.has(JSON.stringify(r))?'xok':'xno'})},
    {id:'right',title:'צד שני',rk:'right',cap:'התוצאה של השאילתה השנייה.',html:table(b.cols,b.rows,{})},
    {id:'op',title:P.op,rk:'op',cap:`${P.op} — ${name}. פעולות קבוצה זורקות כפילויות בעצמן (חוץ מ־union all).`,html:`<div class="xpair">${table(a.cols,a.rows,{label:'ראשון'})}${table(b.cols,b.rows,{label:'שני'})}<div class="xarrow">←</div>${table(f.cols,f.rows,{label:'התוצאה'})}</div>`}];
  M.subqs=[];return M;}

/* ---------- correlated subquery for one outer row ---------- */
function innerAliases(sub){const P=parseSelect(sub,0);const out=new Set();if(P.from)parseFrom(P.from).items.forEach(i=>{out.add(i.alias.toLowerCase());out.add(i.name.toLowerCase());});return out;}
async function subFor(M,s,row,cols){const inner=innerAliases(s.text);const outer=new Set(M.outerAliases.map(a=>a.toLowerCase()));
  let used=false;const sql=s.text.replace(/'[^']*'|\b(\w+)\.(\w+)\b/g,(m,al,c)=>{if(!al)return m;const k=al.toLowerCase();if(!outer.has(k)||inner.has(k))return m;
    let ci=cols.findIndex(x=>x.toLowerCase()===(al+'.'+c).toLowerCase());if(ci<0)ci=cols.findIndex(x=>x.toLowerCase()===c.toLowerCase());if(ci<0)return m;used=true;const v=row[ci];
    return v==null?'null':typeof v==='number'?String(v):"'"+String(v).replace(/'/g,"''")+"'";});
  return {sql,used,r:await M.run(sql)};}

/* ---------- UI ---------- */
function renderQuery(src,ranges){ranges=ranges.slice().sort((x,y)=>x.a-y.a||y.b-x.b);
  const K2=K();let out='',pos=0;const stack=[];
  const ev=[];ranges.forEach((r,i)=>{ev.push({p:r.a,open:true,i,r});ev.push({p:r.b,open:false,i,r});});
  ev.sort((x,y)=>x.p-y.p||(x.open===y.open?(x.open?y.r.b-x.r.b:x.r.a-y.r.a):(x.open?1:-1)));
  for(const e of ev){if(e.p>pos){out+=K2.hl(src.slice(pos,e.p));pos=e.p;}
    out+=e.open?`<span class="xq x-${e.r.role}" data-k="${e.r.id}" title="${esc(e.r.title||'')}">`:'</span>';}
  out+=K2.hl(src.slice(pos));return out;}
async function mount(el,db,sql){
  el.innerHTML='<div class="sqlmsg">מכין את הפירוק…</div>';
  let M;try{M=await build(db,sql);}catch(e){M={error:e.message};}
  if(!M){el.innerHTML='<div class="sqlmsg">פקודת insert עם values פשוט מוסיפה את השורה — אין כאן מה לפרק.</div>';return;}
  if(M.error){el.innerHTML=`<div class="sqlerr">השאילתה עצמה נכשלת, ולכן אין מה לפרק: ${esc(M.error)}</div>`;return;}
  el.innerHTML=`<div class="xhelp">לחץ על חלק בשאילתה, או על שלב, כדי לראות מה הוא עושה לשורות ולעמודות.</div>
   <pre class="sqlcode xquery">${renderQuery(sql,M.ranges)}</pre>
   <div class="xsteps">${M.steps.map((s,i)=>`<button type="button" class="chip" data-s="${i}">${i+1}. ${s.title}</button>`).join('')}</div>
   <div class="xcap"></div><div class="xpanel"></div>`;
  const Q=el.querySelector('.xquery'),cap=el.querySelector('.xcap'),pan=el.querySelector('.xpanel');let cur=-1;
  function show(i,k){cur=i;const s=M.steps[i];el.querySelectorAll('.xsteps .chip').forEach((b,j)=>b.setAttribute('aria-pressed',j===i));
    Q.querySelectorAll('.xq').forEach(x=>x.classList.toggle('on',x.dataset.k===(k||s.rk)||(s.rk==='tbl'&&x.classList.contains('x-tbl'))||(s.id==='tables'&&x.classList.contains('x-tbl'))));
    cap.innerHTML=s.cap;pan.innerHTML=s.html;
    if(k&&k[0]==='t'){pan.querySelectorAll('.xsrct').forEach(t=>t.classList.toggle('on',t.dataset.t===k));}}
  async function showSub(k){const s=M.subqs[+k.slice(1)];Q.querySelectorAll('.xq').forEach(x=>x.classList.toggle('on',x.dataset.k===k));
    el.querySelectorAll('.xsteps .chip').forEach(b=>b.setAttribute('aria-pressed','false'));
    const alone=await M.run(s.text);const outerRef=M.outerAliases.some(a=>new RegExp('\\b'+a+'\\.','i').test(s.text)&&!innerAliases(s.text).has(a.toLowerCase()));
    if(!alone.error&&!outerRef){cap.innerHTML='תת־שאילתה רגילה (לא מתואמת): היא מחושבת פעם אחת, והתוצאה שלה משמשת את התנאי סביבה.';pan.innerHTML=table(alone.cols,alone.rows,{label:'התוצאה של תת־השאילתה'});return;}
    const ci=M.condOfSub(s);
    cap.innerHTML='תת־שאילתה <b>מתואמת</b>: היא משתמשת בעמודה של השורה החיצונית, ולכן מחושבת מחדש לכל שורה. <b>לחץ על שורה בטבלה</b> כדי לראות מה היא מחזירה עבורה.';
    const fc=M.fc;pan.innerHTML=`<div class="xpair">${table(fc.cols,fc.rows,{rowCls:r=>ci>=0?(r[fc.cols.length-M.F.length+ci]?'xok':'xno'):'',colHi:refs(s.text,fc.cols)})}<div class="xsubout"><div class="sqlmsg">בחר שורה ←</div></div></div>`;
    const out=pan.querySelector('.xsubout');
    pan.querySelectorAll('tbody tr').forEach(tr=>tr.addEventListener('click',async()=>{pan.querySelectorAll('tbody tr').forEach(x=>x.classList.remove('xsel'));tr.classList.add('xsel');
      const row=fc.rows[+tr.dataset.ri];const r=await subFor(M,s,row,fc.cols);
      const cv=ci>=0?row[fc.cols.length-M.F.length+ci]:null;const verdict=ci>=0?`<div class="verdict ${cv?'good':'bad'}">${M.F.length>1?`תנאי ${ci+1} ב־where`:'התנאי ב־where'} לשורה הזו: ${cv?'אמת — השורה נשארת':'שקר — השורה נזרקת'}</div>`:'';
      out.innerHTML=r.used?`${verdict}<pre class="sqlcode xsmall">${K().hl(r.sql)}</pre>${r.r.error?`<div class="sqlerr">${esc(r.r.error)}</div>`:table(r.r.cols,r.r.rows,{label:'מה שתת־השאילתה מחזירה לשורה הזו',count:r.r.rows.length?undefined:'אין שורות — התוצאה ריקה'})}`
        :'<div class="sqlmsg">תת־השאילתה מתייחסת לעמודה החיצונית בלי כינוי, ולכן אי אפשר להציב בה ערכים כאן.</div>';}));}
  el.querySelector('.xsteps').addEventListener('click',e=>{const b=e.target.closest('.chip');if(b)show(+b.dataset.s);});
  Q.addEventListener('click',e=>{const x=e.target.closest('.xq');if(!x)return;e.stopPropagation();const k=x.dataset.k;
    if(k[0]==='s'&&M.subqs.length&&/^s\d+$/.test(k))return showSub(k);
    let i=M.steps.findIndex(s=>s.rk===k||s.id===k);if(i<0&&k[0]==='t')i=0;if(i<0&&k[0]==='j')i=M.steps.findIndex(s=>s.id==='from');if(i<0)i=M.steps.length-1;show(i,k);});
  // reserve the tallest step so switching does not move the page
  let mh=0;for(let i=0;i<M.steps.length;i++){show(i);mh=Math.max(mh,pan.offsetHeight);}pan.style.minHeight=Math.min(mh,640)+'px';show(0);}
window.SQLX={mount,build};
})();
