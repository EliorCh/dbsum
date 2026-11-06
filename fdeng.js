/* ============ FD engine: closure, keys, canonical cover, decompositions, chase ============ */
(function(){
const S=x=>[...new Set(x)].sort().join('');            // attribute set -> sorted string
const sub=(a,b)=>[...a].every(c=>b.includes(c));
const uni=(a,b)=>S(a+b), minus=(a,b)=>S([...a].filter(c=>!b.includes(c))), inter=(a,b)=>S([...a].filter(c=>b.includes(c)));
function parse(str){ // "A->BC, CD->E" or with →
  return str.split(/[,;\n]+/).map(t=>t.trim()).filter(Boolean).map(t=>{const m=t.split(/->|→/);return {l:S(m[0].replace(/\s/g,'')),r:S((m[1]||'').replace(/\s/g,''))};}).filter(f=>f.l&&f.r);}
const fds=F=>F.map(f=>`${f.l}→${f.r}`).join(', ');
function closure(X,F){let res=S(X);const steps=[];let ch=true;
  while(ch){ch=false;for(const f of F){if(sub(f.l,res)&&!sub(f.r,res)){const add=minus(f.r,res);res=uni(res,f.r);steps.push({fd:f,add,res});ch=true;}}}
  return {res,steps};}
const clo=(X,F)=>closure(X,F).res;
function combos(arr,k){const out=[];const go=(i,cur)=>{if(cur.length===k){out.push(cur.join(''));return;}for(let j=i;j<arr.length;j++)go(j+1,cur.concat(arr[j]));};go(0,[]);return out;}
function keys(R,F){R=S(R);const ks=[];for(let k=1;k<=R.length;k++)for(const c of combos([...R],k)){if(ks.some(x=>sub(x,c)))continue;if(sub(R,clo(c,F)))ks.push(c);}return ks;}
// course algorithm for ONE candidate key (drop attributes in order)
function oneKey(R,F){let res=S(R);const steps=[];for(const A of S(R)){const t=minus(res,A),c=clo(t,F),ok=sub(R,c);steps.push({A,try:t,c,ok});if(ok)res=t;}return {key:res,steps};}
function unionLHS(F){const m=new Map();F.forEach(f=>m.set(f.l,uni(m.get(f.l)||'',f.r)));return [...m].map(([l,r])=>({l,r})).filter(f=>f.r);}
function canon(F0){let F=unionLHS(F0.map(f=>({...f})));const log=[{kind:'union',F:F.map(f=>({...f}))}];let changed=true;
  while(changed){changed=false;
    for(let i=0;i<F.length&&!changed;i++){const {l,r}=F[i];
      if(l.length>1)for(const A of l){const c=clo(minus(l,A),F);if(sub(r,c)){log.push({kind:'lhs',A,fd:{l,r},why:`(${minus(l,A)})⁺ = ${c}`});F[i]={l:minus(l,A),r};changed=true;break;}}
      if(changed)break;
      for(const A of r){const G=F.map((f,j)=>j===i?{l,r:minus(r,A)}:f).filter(f=>f.r);const c=clo(l,G);if(c.includes(A)){log.push({kind:'rhs',A,fd:{l,r},why:`${l}⁺ = ${c}`});F[i]={l,r:minus(r,A)};changed=true;break;}}
    }
    if(changed){F=F.filter(f=>f.r);const before=F.length;F=unionLHS(F);log[log.length-1].F=F.map(f=>({...f}));if(F.length<before)log[log.length-1].merged=true;}
  }
  return {Fc:F,log};}
function restrict(F,Ri){Ri=S(Ri);const out=[];for(let k=1;k<=Ri.length;k++)for(const X of combos([...Ri],k)){const r=minus(inter(clo(X,F),Ri),X);if(r)out.push({l:X,r});}return out;}
function bcnfViolation(Ri,F){Ri=S(Ri);for(let k=1;k<Ri.length;k++)for(const X of combos([...Ri],k)){const c=inter(clo(X,F),Ri);if(minus(c,X)&&!sub(Ri,c))return {l:X,r:minus(c,X)};}return null;}
function bcnf(R,F){let res=[S(R)];const log=[];for(let guard=0;guard<50;guard++){let did=false;
  for(let i=0;i<res.length;i++){const v=bcnfViolation(res[i],F);if(v){const a=minus(res[i],v.r),b=uni(v.l,v.r);log.push({from:res[i],fd:v,into:[a,b]});res=res.slice(0,i).concat([a,b],res.slice(i+1));did=true;break;}}
  if(!did)break;}return {res,log};}
function prime(R,F){return S(keys(R,F).join(''));}
function is3NF(Ri,F){const ks=keys(Ri,restrictAsF(F,Ri)),pr=S(ks.join(''));Ri=S(Ri);
  for(let k=1;k<Ri.length;k++)for(const X of combos([...Ri],k)){const c=inter(clo(X,F),Ri),r=minus(c,X);if(r&&!sub(Ri,c)&&!sub(r,pr))return {l:X,r};}return null;}
function restrictAsF(F,Ri){return restrict(F,Ri);}
function synth3NF(R,F){const {Fc}=canon(F);const order=[...Fc].sort((a,b)=>uni(b.l,b.r).length-uni(a.l,a.r).length);const res=[],log=[];
  for(const f of order){const sch=uni(f.l,f.r);const cont=res.find(x=>sub(sch,x));log.push({fd:f,sch,skip:cont||null});if(!cont)res.push(sch);}
  const ks=keys(R,F);const hasKey=res.find(x=>ks.some(k=>sub(k,x)));let added=null;if(!hasKey){added=ks[0];res.push(ks[0]);}
  return {Fc,res,log,ks,hasKey,added};}
function lossless2(R1,R2,F){const I=inter(R1,R2),c=clo(I,F);return {I,c,ok:sub(R1,c)||sub(R2,c),which:sub(R1,c)?R1:sub(R2,c)?R2:null};}
function preserves(F,parts){const G=[].concat(...parts.map(p=>restrict(F,p)));return F.map(f=>({fd:f,ok:sub(f.r,clo(f.l,G)),c:clo(f.l,G)}));}
// chase (tableau) for lossless test of n-way decomposition
function chase(R,F,parts){R=S(R);const T=parts.map((p,i)=>Object.fromEntries([...R].map((a,j)=>[a,p.includes(a)?'a':'b'+(i+1)+(j+1)])));
  const snaps=[{T:T.map(t=>({...t})),note:null}];let ch=true;
  while(ch){ch=false;for(const f of F)for(let i=0;i<T.length;i++)for(let j=i+1;j<T.length;j++){if(![...f.l].every(a=>T[i][a]===T[j][a]))continue;
    for(const a of f.r){const x=T[i][a],y=T[j][a];if(x===y)continue;const keep=x==='a'||y==='a'?'a':(x<y?x:y),drop=keep===x?y:x;const cells=[];
      T.forEach((t,k)=>{if(t[a]===drop){t[a]=keep;cells.push([k,a]);}});ch=true;snaps.push({T:T.map(t=>({...t})),note:{fd:f,i,j,a,drop,keep,cells}});}}}
  return {R,snaps,ok:T.some(t=>[...R].every(a=>t[a]==='a'))};}
window.FD={S,sub,uni,minus,inter,parse,fds,closure,clo,keys,oneKey,canon,restrict,bcnfViolation,bcnf,is3NF,synth3NF,lossless2,preserves,chase,prime};
if(typeof module!=='undefined')module.exports=window.FD;
})();
