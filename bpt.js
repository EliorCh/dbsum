/* ============ B+ tree (Silberschatz algorithms) with step log ============ */
(function(){
let UID=0;
function node(leaf){return {id:++UID,leaf,keys:[],ch:[],parent:null};}
class BPT{
  constructor(n){this.n=n;this.root=node(true);this.log=[];}
  findLeaf(k){let N=this.root;const path=[N.id];while(!N.leaf){let i=0;while(i<N.keys.length&&k>=N.keys[i])i++;N=N.ch[i];path.push(N.id);}return {N,path};}
  snap(msg,fresh=[],kind=''){this.log.push({msg,kind,fresh:[...fresh],tree:this.clone()});}
  clone(){const c=N=>({id:N.id,leaf:N.leaf,keys:[...N.keys],ch:N.ch.map(c)});return c(this.root);}
  insert(k){const n=this.n;const {N:L}=this.findLeaf(k);
    if(L.keys.includes(k)){this.snap(`${k} כבר בעץ`,[L.id],'noop');return;}
    if(L.keys.length<n-1){L.keys.push(k);L.keys.sort((a,b)=>a<b?-1:a>b?1:0);this.snap(`${k} נכנס לעלה [${L.keys}] — יש בו מקום`,[L.id],'ins');return;}
    const T=[...L.keys,k].sort((a,b)=>a<b?-1:a>b?1:0),c=Math.ceil(n/2),L2=node(true);
    L.keys=T.slice(0,c);L2.keys=T.slice(c);
    this.insParent(L,L2.keys[0],L2,`העלה מלא: ${n} ערכים לא נכנסים ב־${n-1} מקומות. פיצול: [${L.keys}] | [${L2.keys}]. הערך הראשון של העלה החדש, ${L2.keys[0]}, עולה להורה (ונשאר גם בעלה)`,[L.id,L2.id]);}
  insParent(N,K,N2,msg,fresh){const n=this.n;
    if(N===this.root){const R=node(false);R.keys=[K];R.ch=[N,N2];N.parent=N2.parent=R;this.root=R;this.snap(msg+`. אין הורה — נוצר שורש חדש [${K}]`,[...fresh,R.id],'split');return;}
    const P=N.parent,i=P.ch.indexOf(N);P.ch.splice(i+1,0,N2);P.keys.splice(i,0,K);N2.parent=P;
    if(P.ch.length<=n){this.snap(msg,[...fresh,P.id],'split');return;}
    const c=Math.ceil((n+1)/2),P2=node(false),K2=P.keys[c-1];
    P2.keys=P.keys.slice(c);P2.ch=P.ch.slice(c);P.keys=P.keys.slice(0,c-1);P.ch=P.ch.slice(0,c);P2.ch.forEach(x=>x.parent=P2);
    this.snap(msg,[...fresh,P.id],'split');this.log.pop();
    this.insParent(P,K2,P2,msg+`. ההורה התמלא (${n+1} מצביעים) ומתפצל: [${P.keys}] | [${P2.keys}], והערך ${K2} עובר רמה למעלה (ולא נשאר בצומת הביניים)`,[...fresh,P.id,P2.id]);}
  delete(k){const {N:L}=this.findLeaf(k);const i=L.keys.indexOf(k);if(i<0){this.snap(`${k} לא בעץ`,[],'noop');return;}
    L.keys.splice(i,1);this.fix(L,`${k} נמחק מהעלה`,[L.id]);}
  fix(N,msg,fresh){const n=this.n;
    if(N===this.root){if(!N.leaf&&N.ch.length===1){this.root=N.ch[0];this.root.parent=null;msg+='. לשורש נשאר בן אחד — הבן הופך לשורש והעץ מתנמך ברמה';}this.snap(msg,fresh,'del');return;}
    const min=N.leaf?Math.ceil((n-1)/2):Math.ceil(n/2),have=N.leaf?N.keys.length:N.ch.length;
    if(have>=min){this.snap(msg,fresh,'del');return;}
    const P=N.parent,i=P.ch.indexOf(N),left=i>0,Np=left?P.ch[i-1]:P.ch[i+1],kidx=left?i-1:i,Kp=P.keys[kidx];
    const what=N.leaf?`${have} ערכים (מינימום ${min})`:`${have} מצביעים (מינימום ${min})`;
    const fits=N.leaf?N.keys.length+Np.keys.length<=n-1:N.ch.length+Np.ch.length<=n;
    msg+=`. ${N.leaf?'בעלה':'בצומת'} נשארו ${what} — חסר. השכן ${left?'השמאלי':'הימני'}: [${Np.keys}]`;
    if(fits){const [A,B]=left?[Np,N]:[N,Np];
      if(N.leaf)A.keys=A.keys.concat(B.keys);else{A.keys=A.keys.concat([Kp],B.keys);A.ch=A.ch.concat(B.ch);B.ch.forEach(x=>x.parent=A);}
      P.keys.splice(kidx,1);P.ch.splice(P.ch.indexOf(B),1);
      this.fix(P,msg+`. יחד הם נכנסים לצומת אחד — איחוד (coalesce) ל־[${A.keys}]${N.leaf?'':`, כולל ${Kp} שירד מההורה`}, ו־${Kp} נמחק מההורה`,[A.id,P.id]);}
    else{let moved;
      if(left){if(N.leaf){moved=Np.keys.pop();N.keys.unshift(moved);P.keys[kidx]=moved;}else{const c=Np.ch.pop(),kk=Np.keys.pop();N.ch.unshift(c);c.parent=N;N.keys.unshift(Kp);P.keys[kidx]=kk;moved=kk;}}
      else{if(N.leaf){moved=Np.keys.shift();N.keys.push(moved);P.keys[kidx]=Np.keys[0];}else{const c=Np.ch.shift(),kk=Np.keys.shift();N.ch.push(c);c.parent=N;N.keys.push(Kp);P.keys[kidx]=kk;moved=kk;}}
      this.snap(msg+`. יחד הם לא נכנסים לצומת אחד — חלוקה מחדש (redistribution): ${N.leaf?`הערך ${moved} עובר מהשכן`:`מצביע אחד עובר מהשכן`}, וערך ההפרדה בהורה מתעדכן ל־${P.keys[kidx]}`,[N.id,Np.id,P.id],'del');}}
}
function levels(t){const L=[[t]];while(!L[L.length-1][0].leaf)L.push([].concat(...L[L.length-1].map(x=>x.ch)));return L;}
function show(t){return levels(t).map(l=>l.map(x=>'['+x.keys+']').join('  ')).join(' || ');}
/* SVG: node boxes with n-1 key slots */
function svg(t,n,fresh=[],opt={}){const L=levels(t),cw=opt.cw||30,ch=28,gap=opt.gap||14,vgap=62;
  const nw=(n-1)*cw+ (n)*6;
  const leaves=L[L.length-1],W=Math.max(leaves.length*(nw+gap)-gap,nw)+20;
  const pos=new Map();leaves.forEach((x,i)=>pos.set(x.id,10+i*(nw+gap)));
  for(let d=L.length-2;d>=0;d--)L[d].forEach(x=>{const a=pos.get(x.ch[0].id),b=pos.get(x.ch[x.ch.length-1].id);pos.set(x.id,(a+b)/2);});
  const H=L.length*(ch+vgap)-vgap+16;let s='';
  L.forEach((lv,d)=>lv.forEach(x=>{const X=pos.get(x.id),Y=8+d*(ch+vgap),fr=fresh.includes(x.id);
    if(!x.leaf)x.ch.forEach((c,ci)=>{const px=X+3+ci*(cw+6)+3,cx=pos.get(c.id)+nw/2;s+=`<line x1="${px}" y1="${Y+ch}" x2="${cx}" y2="${Y+ch+vgap}" class="bpe"/>`;});
    s+=`<g class="bpn${fr?' fresh':''}${x.leaf?' leaf':''}"><rect x="${X}" y="${Y}" width="${nw}" height="${ch}" rx="4"/>`;
    for(let k=0;k<n-1;k++){const kx=X+6+k*(cw+6);s+=`<rect class="slot" x="${kx}" y="${Y+4}" width="${cw}" height="${ch-8}" rx="2"/>`;if(x.keys[k]!==undefined)s+=`<text x="${kx+cw/2}" y="${Y+ch/2+5}">${x.keys[k]}</text>`;}
    s+='</g>';}));
  // leaf chain
  for(let i=0;i+1<leaves.length;i++){const a=pos.get(leaves[i].id)+nw,b=pos.get(leaves[i+1].id),Y=8+(L.length-1)*(ch+vgap)+ch/2;s+=`<line x1="${a}" y1="${Y}" x2="${b}" y2="${Y}" class="bpl" marker-end="url(#bpa)"/>`;}
  return `<svg class="bptree" viewBox="0 0 ${W} ${H}" width="${W}" style="max-width:100%;height:auto" role="img" aria-label="עץ B+: ${show(t)}"><defs><marker id="bpa" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L8,4L0,8z" fill="#5A6577"/></marker></defs>${s}</svg>`;}
function run(n,ops){UID=0;const t=new BPT(n);for(const [op,k] of ops){t.log.push({head:`${op==='+'?'הכנס':'מחק'} ${k}`,op,k});(op==='+'?t.insert(k):t.delete(k));}return t;}
window.BPT={BPT,run,svg,show,levels};
if(typeof module!=='undefined')module.exports=window.BPT;
})();
