/* ============ extendable hashing (LSB or MSB) with step log ============ */
(function(){
function run(vals,cap,bits,lsb=true){let g=0,uid=0;let table=[{id:uid++,d:0,k:[]}];const log=[];
  const idx=(v,g)=>lsb?(v&((1<<g)-1)):(g?(v>>(bits-g)):0);
  const snap=(msg,fresh,v,kind)=>log.push({msg,fresh:[...fresh],v,kind,g,table:table.map(b=>b.id),buckets:uniq().map(b=>({id:b.id,d:b.d,k:[...b.k]}))});
  const uniq=()=>{const s=[];table.forEach(b=>{if(!s.includes(b))s.push(b);});return s;};
  for(const v of vals){let first=true;
    for(let guard=0;guard<20;guard++){const j=idx(v,g),b=table[j];
      if(b.k.length<cap){b.k.push(v);snap(`${v} = ${bin(v,bits)} ← ${g?`${g===1?'הביט':`${g} הביטים`} ${lsb?'הימני':'השמאלי'}${g===1?'':'ים'}: ${bin(j,g)}`:'אין ביטים (i=0)'} ← דלי עם ${b.k.length-1} ערכים — נכנס`,[b.id],v,'ins');break;}
      let msg=`${v} = ${bin(v,bits)} ← ${g?`הדלי ${bin(j,g)}`:'הדלי היחיד'} מלא (${cap} ערכים)`;
      if(b.d===g){table=lsb?table.concat(table):Array.from({length:table.length*2},(_,j)=>table[j>>1]);g++;msg+=`. העומק המקומי שלו (${b.d}) שווה לעומק הגלובלי ← מכפילים את הטבלה: i=${g}, ${table.length} כניסות`;}
      const nb={id:uid++,d:b.d+1,k:[]};b.d++;const bit=1<<(b.d-1);
      for(let jj=0;jj<table.length;jj++)if(table[jj]===b&&(lsb?(jj&bit):((jj>>(g-b.d))&1)))table[jj]=nb;
      const test=x=>lsb?(x&(1<<(b.d-1))):((x>>(bits-b.d))&1);const old=b.k;b.k=old.filter(x=>!test(x));nb.k=old.filter(x=>test(x));
      msg+=`. מפצלים את הדלי לפי ביט ${lsb?b.d-1:bits-b.d} (${lsb?'מימין, מתחיל מ־0':'משמאל'}): [${b.k}] ו־[${nb.k}], עומק מקומי ${b.d}`;
      snap(msg,[b.id,nb.id],v,'split');}
  }
  return {log,final:{g,table:table.map(b=>b.id),buckets:uniq()}};}
const bin=(v,w)=>w?v.toString(2).padStart(w,'0'):'';
function svg(st,bits,lsb,fresh=[]){const n=st.table.length,rowH=26,bw=34,bx=90,W=520;const bks=st.buckets,bh=30,colX=230;
  const H=Math.max(n*rowH,bks.length*(bh+12))+40;let s=`<text x="${bx}" y="16" class="ehh">i = ${st.g}</text>`;
  const by=new Map();bks.forEach((b,i)=>by.set(b.id,26+i*(bh+12)));
  st.table.forEach((id,j)=>{const y=26+j*rowH;s+=`<rect class="ehc" x="${bx-10}" y="${y}" width="${bw+30}" height="${rowH}"/><text x="${bx+12}" y="${y+17}" class="ehbits">${st.g?bin(j,st.g):'·'}</text>`;
    s+=`<line class="ehp" x1="${bx+bw+20}" y1="${y+rowH/2}" x2="${colX}" y2="${by.get(id)+bh/2}" marker-end="url(#eha)"/>`;});
  bks.forEach(b=>{const y=by.get(b.id),fr=fresh.includes(b.id);s+=`<g class="ehb${fr?' fresh':''}"><rect x="${colX}" y="${y}" width="${W-colX-10}" height="${bh}" rx="4"/><text x="${colX+8}" y="${y+20}" class="ehd">${b.d}</text><text x="${colX+30}" y="${y+20}">${b.k.join(',  ')}</text></g>`;});
  return `<svg class="ehash" viewBox="0 0 ${W} ${H}" width="${W}" style="max-width:100%;height:auto" role="img" aria-label="טבלת כתובות ודליים"><defs><marker id="eha" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L8,4L0,8z" fill="#5A6577"/></marker></defs>${s}</svg>`;}
window.EH={run,svg,bin};if(typeof module!=='undefined')module.exports=window.EH;
})();
