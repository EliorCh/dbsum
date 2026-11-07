/* ============ page 7: indexing & hashing ============ */
(function(){const {x,m,esc}=H;
const VALS=[2,3,5,7,11,17,19,23,31],OPS=[['+',9],['+',10],['+',8],['-',23],['-',19]];
/* group the engine log into one step per operation */
function opSteps(n,pre,ops){const t=BPT.run(n,pre.concat(ops));const steps=[];let cur=null;
  t.log.forEach(e=>{if(e.head){cur={head:e.head,op:e.op,k:e.k,snaps:[]};steps.push(cur);}else cur.snaps.push(e);});
  return steps;}
function bptGen(n,pre,ops,intro){const all=opSteps(n,[],pre.concat(ops));const skip=pre.length&&ops.length?pre.length:0;
  const out=[];const w=n>5?26:30;
  if(skip){const st=all[skip-1].snaps.slice(-1)[0];out.push({h:'נקודת ההתחלה',p:`<p>העץ משאלה 2 (n=${n}) אחרי הכנסת ${pre.length} הערכים.</p>`,cap:BPT.show(st.tree),fig:()=>BPT.svg(st.tree,n,[],{cw:w})});}
  else if(intro)out.push(intro);
  all.slice(skip).forEach(s=>{const last=s.snaps[s.snaps.length-1];const kind=last.kind;
    out.push({h:`${s.op==='+'?'הכנסת':'מחיקת'} ${s.k}${kind==='split'?' — פיצול':kind==='del'&&/איחוד/.test(last.msg)?' — איחוד':kind==='del'&&/חלוקה/.test(last.msg)?' — חלוקה מחדש':''}`,p:`<p>${s.snaps.map(z=>z.msg).join('</p><p>')}.</p>`,cap:BPT.show(last.tree),fig:()=>BPT.svg(last.tree,n,last.fresh,{cw:w})});});
  return {steps:out};}
const rules=n=>`<p>n=${n}: בעלה בין ${Math.ceil((n-1)/2)} ל־${n-1} ערכים. בצומת פנימי בין ${Math.ceil(n/2)} ל־${n} מצביעים.</p>`;
GEN['i-b4']=()=>bptGen(4,[],VALS.map(k=>['+',k]),{h:'עץ ריק, n=4',p:`<p>כל צומת: עד 4 מצביעים ו־3 ערכים.</p>${rules(4)}`,cap:'[ ]',fig:()=>BPT.svg({id:0,leaf:true,keys:[],ch:[]},4)});
GEN['i-b6']=()=>bptGen(6,[],VALS.map(k=>['+',k]),{h:'עץ ריק, n=6',p:`<p>כל צומת: עד 6 מצביעים ו־5 ערכים.</p>${rules(6)}`,cap:'[ ]',fig:()=>BPT.svg({id:0,leaf:true,keys:[],ch:[]},6,[],{cw:26})});
GEN['i-b4ops']=()=>bptGen(4,VALS.map(k=>['+',k]),OPS);
GEN['i-b6ops']=()=>bptGen(6,VALS.map(k=>['+',k]),OPS);
GEN['i-bslide']=()=>bptGen(3,[],['Aviv','Darom','Eilat','Merkazi','Pinkas','Tsafon'].map(k=>['+',k]),{h:'עץ ריק, n=3',p:`<p>הדוגמה מהמצגת: מפתח החיפוש הוא שם הסניף, n=3 — עד 2 ערכים בצומת.</p>${rules(3)}`,cap:'[ ]',fig:()=>BPT.svg({id:0,leaf:true,keys:[],ch:[]},3,[],{cw:62})});
/* extendable hashing */
function ehGen(vals,cap,bits,lsb,names){const r=EH.run(vals,cap,bits,lsb);const nm=v=>names?names[v]:v;const out=[];
  out.push({h:'התחלה',p:`<p>עומק גלובלי i=0: טבלת הכתובות מכילה כניסה אחת, שמצביעה לדלי יחיד עם עומק מקומי 0. דלי מכיל עד ${cap} ערכים.</p><p>${lsb?'הביטים נלקחים מימין (LSB)':'הביטים נלקחים משמאל (prefix)'}.</p>`,cap:`עומק גלובלי 0, דלי אחד`,fig:()=>EH.svg({g:0,table:[0],buckets:[{id:0,d:0,k:[]}]},bits,lsb)});
  r.log.forEach(e=>{const st={g:e.g,table:e.table,buckets:e.buckets.map(b=>({...b,k:b.k.map(nm)}))};
    out.push({h:`${e.kind==='split'?'פיצול':'הכנסת'} ${nm(e.v)}${names?'':` = ${EH.bin(e.v,bits)}`}`,p:`<p>${names?e.msg.replace(String(e.v),nm(e.v)):e.msg}.</p>`,cap:`עומק גלובלי ${e.g}, ${e.buckets.length} דליים`,fig:()=>EH.svg(st,bits,lsb,e.fresh)});});
  return {steps:out};}
GEN['i-eh7']=()=>ehGen([13,4,7,12,31,27,18,9,32,41,19,11,26,17,23],4,8,true);
const HS={Aviv:0b00101101,Darom:0b10100011,Eilat:0b10000111,Merkazi:0b11110001,Pinkas:0b10110101,Tsafon:0b01011000,Carmel:0b11010101};
GEN['i-ehslide']=()=>ehGen(Object.values(HS),2,8,false,Object.fromEntries(Object.entries(HS).map(([k,v])=>[v,k])));

/* B+ playground */
{const P=document.getElementById('bpPlay');if(P){let steps=[],cur=0,n=4;
  const parse=s=>s.split(/[\s,]+/).filter(Boolean).map(t=>{const m=t.match(/^([+-])?(-?\d+)$/);return m?[m[1]||'+',+m[2]]:null;}).filter(Boolean);
  const show=()=>{const s=steps[cur];if(!s){P.querySelector('.bpfig').innerHTML='';return;}const last=s.snaps[s.snaps.length-1];
    P.querySelector('.bpfig').innerHTML=BPT.svg(last.tree,n,last.fresh,{cw:n>5?24:30});P.querySelector('.bpmsg').innerHTML=`<b>${s.op==='+'?'הכנסת':'מחיקת'} ${s.k}:</b> ${s.snaps.map(z=>esc(z.msg)).join('. ')}.`;
    P.querySelector('.prog').textContent=`פעולה ${cur+1} מתוך ${steps.length}`;P.querySelector('.prevBtn').disabled=cur===0;P.querySelector('.nextBtn').disabled=P.querySelector('.allBtn').disabled=cur===steps.length-1;};
  const run=()=>{n=+P.querySelector('select').value;const ops=parse(P.querySelector('input').value);if(!ops.length)return;steps=opSteps(n,[],ops);cur=0;show();};
  P.querySelector('.runBtn').onclick=run;P.querySelector('input').addEventListener('keydown',e=>{if(e.key==='Enter')run();});P.querySelector('select').onchange=run;
  P.querySelector('.prevBtn').onclick=()=>{cur=Math.max(0,cur-1);show();};P.querySelector('.nextBtn').onclick=()=>{cur=Math.min(steps.length-1,cur+1);show();};P.querySelector('.allBtn').onclick=()=>{cur=steps.length-1;show();};run();}}
/* node-size calculator */
{const C=document.getElementById('nCalc7');if(C){const go=()=>{const k=+C.querySelector('[name=k]').value,p=+C.querySelector('[name=p]').value,b=+C.querySelector('[name=b]').value;
  if(!(k>0&&p>0&&b>0))return;const nmax=Math.floor((b+k)/(p+k));C.querySelector('.calcout').innerHTML=`<p class="mathline"><code class="xp">${p}·n + ${k}·(n − 1) ≤ ${b}</code></p><p class="mathline"><code class="xp">${p+k}·n ≤ ${b+k}</code></p><p class="mathline"><code class="xp">n ≤ ${(Math.round((b+k)/(p+k)*100)/100)}</code></p><p>ה־n השלם המרבי: <b>${nmax}</b>. בעלה עד ${nmax-1} מפתחות; בצומת פנימי לפחות ${Math.ceil(nmax/2)} מצביעים.</p>`;};
  C.querySelectorAll('input').forEach(i=>i.addEventListener('input',go));go();}}
/* bitmap demo */
{const B=document.getElementById('bitmapDemo');if(B){const recs=[['76766','m','L1'],['22222','f','L2'],['12121','f','L1'],['15151','m','L4'],['58583','f','L3']];
  const vals={gender:['m','f'],income:['L1','L2','L3','L4','L5']};let g='f',inc='L3',opn='AND';
  const bm=(col,v)=>recs.map(r=>r[col]===v?1:0);
  const draw=()=>{const a=bm(1,g),b=bm(2,inc),res=a.map((x0,i)=>opn==='AND'?x0&b[i]:x0|b[i]);
    B.querySelector('.bmrecs').innerHTML=H.tbl(['#','ID','gender','income_level'],recs.map((r,i)=>({c:[i+1,...r],cls:res[i]?'hit':''})));
    B.querySelector('.bmops').innerHTML=`<div class="rtwrap"><table class="rt" dir="ltr"><tbody>${[[`gender = ${g}`,a],[`income = ${inc}`,b],[`${opn}`,res]].map(([l,v],i)=>`<tr class="${i===2?'res':''}"><th>${l}</th>${v.map(x0=>`<td class="${x0?'bit1':''}">${x0}</td>`).join('')}</tr>`).join('')}</tbody></table><div class="rtcount">${res.filter(Boolean).length} רשומות</div></div>`;
    B.querySelectorAll('[data-g]').forEach(c=>c.setAttribute('aria-pressed',c.dataset.g===g));B.querySelectorAll('[data-i]').forEach(c=>c.setAttribute('aria-pressed',c.dataset.i===inc));B.querySelectorAll('[data-o]').forEach(c=>c.setAttribute('aria-pressed',c.dataset.o===opn));};
  B.querySelector('.bmpick').innerHTML=`<div>gender: ${vals.gender.map(v=>`<button type="button" class="chip" data-g="${v}">${v}</button>`).join(' ')}</div><div>${['AND','OR'].map(v=>`<button type="button" class="chip" data-o="${v}">${v}</button>`).join(' ')}</div><div>income: ${vals.income.map(v=>`<button type="button" class="chip" data-i="${v}">${v}</button>`).join(' ')}</div>`;
  B.addEventListener('click',e=>{const c=e.target.closest('.chip');if(!c)return;if(c.dataset.g)g=c.dataset.g;if(c.dataset.i)inc=c.dataset.i;if(c.dataset.o)opn=c.dataset.o;draw();});draw();
  const bt=B.querySelector('.bmall');if(bt)bt.innerHTML=H.tbl(['ערך','מפת סיביות'],[...vals.gender.map(v=>[`gender = ${v}`,bm(1,v).join('')]),...vals.income.map(v=>[`income = ${v}`,bm(2,v).join('')])].map(r=>({c:r})));}}
})();
