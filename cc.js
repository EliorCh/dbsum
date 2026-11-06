/* ============ concurrency: schedules, precedence graphs, VS, timestamps, 2PL ============ */
(function(){
// schedule = [{t:'T1', s:'read(A)'}...]; parse op
function op(s){let m=s.match(/^\s*(read|write)\s*\(\s*(\w+)\s*\)/i)||s.match(/^\s*([rw])\s*\(\s*(\w+)\s*\)/i);if(m)return {k:m[1][0].toLowerCase(),x:m[2]};
  m=s.match(/^\s*(slock|xlock|lock-s|lock-x)\s*\(\s*(\w+)\s*\)/i);if(m)return {k:/s/i.test(m[1].replace('lock',''))?'S':'X',x:m[2]};
  m=s.match(/^\s*unlock\s*\(\s*(\w+)\s*\)/i);if(m)return {k:'U',x:m[1]};return {k:'c'};}
function parseShort(str){ // "r1(A) w2(A)" -> schedule
  return str.trim().split(/\s+/).map(tok=>{const m=tok.match(/^([rw])(\w+?)\((\w+)\)$/);return {t:'T'+m[2],s:(m[1]==='r'?'read':'write')+'('+m[3]+')'};});}
function txns(S){const o=[];S.forEach(e=>{if(!o.includes(e.t))o.push(e.t);});return o.sort((a,b)=>+a.slice(1)-+b.slice(1));}
function edges(S){const E=[];const ops=S.map((e,i)=>({...e,...op(e.s),i})).filter(e=>e.k==='r'||e.k==='w');
  for(let a=0;a<ops.length;a++)for(let b=a+1;b<ops.length;b++){const p=ops[a],q=ops[b];if(p.t===q.t||p.x!==q.x||(p.k==='r'&&q.k==='r'))continue;
    E.push({from:p.t,to:q.t,x:p.x,why:`${p.k}${p.t.slice(1)}(${p.x}) לפני ${q.k}${q.t.slice(1)}(${q.x})`,i:p.i,j:q.i});}
  return E;}
function uniqEdges(E){const m=new Map();E.forEach(e=>{const k=e.from+'>'+e.to;if(!m.has(k))m.set(k,{...e,all:[e]});else m.get(k).all.push(e);});return [...m.values()];}
function cycle(nodes,E){const adj=Object.fromEntries(nodes.map(n=>[n,[]]));E.forEach(e=>adj[e.from].push(e.to));const col={},st=[];let found=null;
  const dfs=u=>{col[u]=1;st.push(u);for(const v of adj[u]){if(found)return;if(col[v]===1){found=st.slice(st.indexOf(v)).concat(v);return;}if(!col[v])dfs(v);}col[u]=2;st.pop();};
  nodes.forEach(n=>{if(!col[n]&&!found)dfs(n);});return found;}
function topoAll(nodes,E){const out=[];const go=(done,rest)=>{if(!rest.length){out.push(done);return;}rest.forEach(n=>{if(E.some(e=>e.to===n&&rest.includes(e.from)))return;go(done.concat(n),rest.filter(x=>x!==n));});};go([],nodes);return out;}
function perms(a){if(a.length<=1)return [a];return [].concat(...a.map((x,i)=>perms(a.slice(0,i).concat(a.slice(i+1))).map(p=>[x].concat(p))));}
function viewInfo(S){const last={},rf=[],fw={};S.forEach(e=>{const o=op(e.s);if(o.k==='r')rf.push({t:e.t,x:o.x,from:last[o.x]||'init'});if(o.k==='w'){last[o.x]=e.t;}});Object.assign(fw,last);return {rf,fw};}
function serialOf(S,order){return [].concat(...order.map(t=>S.filter(e=>e.t===t)));}
function viewSerial(S){const T=txns(S),v=viewInfo(S),key=x=>JSON.stringify([x.rf.map(r=>r.t+r.x+r.from).sort(),Object.entries(x.fw).sort()]);
  return perms(T).filter(p=>key(viewInfo(serialOf(S,p)))===key(v));}
// timestamp protocol simulation; mode 'basic' | 'thomas'
function tsSim(S,ts,mode='basic'){const R={},W={},log=[],ab=new Set();let stopped=null;
  for(let i=0;i<S.length;i++){const e=S[i],o=op(e.s);if(o.k!=='r'&&o.k!=='w')continue;const T=ts[e.t],x=o.x;R[x]=R[x]??0;W[x]=W[x]??0;
    if(ab.has(e.t)){log.push({i,t:e.t,s:e.s,x,res:'skip',why:`${e.t} כבר גולגלה אחורנית`,R:{...R},W:{...W}});continue;}
    let res,why;
    if(o.k==='r'){if(T<W[x]){res='rollback';why=`TS(${e.t})=${T} < W-TS(${x})=${W[x]}`;}else{res='ok';why=`TS(${e.t})=${T} ≥ W-TS(${x})=${W[x]}`;R[x]=Math.max(R[x],T);}}
    else{if(T<R[x]){res='rollback';why=`TS(${e.t})=${T} < R-TS(${x})=${R[x]}`;}else if(T<W[x]){if(mode==='thomas'){res='ignore';why=`TS(${e.t})=${T} < W-TS(${x})=${W[x]} — כתיבה מיושנת, מתעלמים ממנה`;}else{res='rollback';why=`TS(${e.t})=${T} < W-TS(${x})=${W[x]}`;}}else{res='ok';why=`TS(${e.t})=${T} ≥ R-TS(${x})=${R[x]} ו־≥ W-TS(${x})=${W[x]}`;W[x]=T;}}
    log.push({i,t:e.t,s:e.s,x,res,why,R:{...R},W:{...W}});if(res==='rollback'){if(stopped===null)stopped=i;ab.add(e.t);}}
  return {log,stopped};}
// 2PL check for a single transaction (list of op strings)
function twoPL(ops){let firstUnlock=-1;const bad=[];ops.forEach((s,i)=>{const o=op(s);if(o.k==='U'&&firstUnlock<0)firstUnlock=i;if((o.k==='S'||o.k==='X')&&firstUnlock>=0)bad.push(i);});return {ok:!bad.length,firstUnlock,bad};}
// interpreter for value-tracking (slides S1..S4)
function exec(S,init){const db={...init},loc={},trace=[];
  S.forEach(e=>{const L=loc[e.t]=loc[e.t]||{},o=op(e.s);let note='';
    if(o.k==='r'){L[o.x]=db[o.x];note=`${e.t}: ${o.x}=${fmtN(db[o.x])} (מקומי)`;}
    else if(o.k==='w'){db[o.x]=L[o.x];note=`${o.x} ← ${fmtN(L[o.x])} בבסיס הנתונים`;}
    else{const m=e.s.match(/^\s*(\w+)\s*=\s*(.+)$/);if(m&&/^[\w\s+\-*/().]+$/.test(m[2])){const v=Function(...Object.keys(L),'return ('+m[2]+')')(...Object.values(L));L[m[1]]=v;note=`${e.t}: ${m[1]}=${fmtN(v)}`;}}
    trace.push({db:{...db},note});});
  return trace;}
const fmtN=v=>typeof v==='number'?(Math.round(v*100)/100).toString():String(v);
/* precedence graph svg; nodes placed on a circle (or given positions) */
function graphSvg(nodes,E,opt={}){const W=opt.w||320,H=opt.h||220,r=20,cx=W/2,cy=H/2,R=Math.min(W,H)/2-r-8;
  const pos=opt.pos||Object.fromEntries(nodes.map((n,i)=>{const a=-Math.PI/2+2*Math.PI*i/nodes.length;return [n,[cx+R*Math.cos(a),cy+R*Math.sin(a)]];}));
  const fresh=opt.fresh||[],cyc=opt.cycle||[];const inCyc=(a,b)=>{for(let i=0;i+1<cyc.length;i++)if(cyc[i]===a&&cyc[i+1]===b)return true;return false;};
  const pair=new Set(E.map(e=>e.from+'>'+e.to));let s='';
  E.forEach(e=>{const [x1,y1]=pos[e.from],[x2,y2]=pos[e.to],dx=x2-x1,dy=y2-y1,d=Math.hypot(dx,dy),ux=dx/d,uy=dy/d;
    const bend=pair.has(e.to+'>'+e.from)?14:0,nx=-uy*bend,ny=ux*bend;
    const sx=x1+ux*r+nx*.6,sy=y1+uy*r+ny*.6,tx=x2-ux*(r+3)+nx*.6,ty=y2-uy*(r+3)+ny*.6,mx=(sx+tx)/2+nx,my=(sy+ty)/2+ny;
    const cls=`gedge${fresh.includes(e.from+'>'+e.to)?' fresh':''}${inCyc(e.from,e.to)?' cyc':''}`;
    s+=`<path class="${cls}" d="M${sx},${sy} Q${mx},${my} ${tx},${ty}" marker-end="url(#gah${inCyc(e.from,e.to)?'c':''})"/>`;
    if(opt.labels)s+=`<text class="glab" x="${mx}" y="${my-4}">${e.x}</text>`;});
  nodes.forEach(n=>{const [x,y]=pos[n];s+=`<g class="gnode"><circle cx="${x}" cy="${y}" r="${r}"/><text x="${x}" y="${y+5}">${n}</text></g>`;});
  return `<svg class="pgraph" viewBox="0 0 ${W} ${H}" width="${W}" style="max-width:100%;height:auto" role="img" aria-label="גרף קדימויות"><defs><marker id="gah" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L8,4L0,8z" fill="#1A2230"/></marker><marker id="gahc" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L8,4L0,8z" fill="#C0392B"/></marker></defs>${s}</svg>`;}
/* schedule table: one column per transaction */
function schedTable(S,opt={}){const T=opt.T||txns(S),hl=opt.hl||{},cur=opt.cur??-1,dim=opt.dim||[];
  const rows=S.map((e,i)=>`<tr class="${i===cur?'cur':''}${dim.includes(i)?' gone':''}${hl[i]?' '+hl[i]:''}">${opt.num?`<td class="sn">${i+1}</td>`:''}${T.map(t=>`<td>${t===e.t?esc(e.s):''}</td>`).join('')}${opt.extra?`<td class="sx">${opt.extra[i]||''}</td>`:''}</tr>`).join('');
  return `<div class="rtwrap"><table class="rt sched" dir="ltr"><thead><tr>${opt.num?'<th>#</th>':''}${T.map(t=>`<th>${t}</th>`).join('')}${opt.extra?`<th>${opt.extraH||''}</th>`:''}</tr></thead><tbody>${rows}</tbody></table></div>`;}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
window.CC={op,parseShort,txns,edges,uniqEdges,cycle,topoAll,viewInfo,viewSerial,serialOf,tsSim,twoPL,exec,graphSvg,schedTable};
if(typeof module!=='undefined')module.exports=window.CC;
})();
