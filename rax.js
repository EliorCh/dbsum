/* ============ interactive relational-algebra expressions ============
   Every sub-expression is clickable: it shows the table that sub-expression produces,
   its input tables, and a sentence on what the operator did. "שלב אחרי שלב" walks
   through the sub-expressions bottom-up, so the tables are built out of the formula. */
(function(){
if(typeof RA==='undefined')return;
const N={R:n=>({t:'R',n}),S:(lab,f,c)=>({t:'S',lab,f,c}),P:(as,c,lab)=>({t:'P',as,c,lab}),J:(a,b)=>({t:'J',a,b}),X:(a,b)=>({t:'X',a,b}),
  Rho:(n,c)=>({t:'Rho',n,c}),D:(a,b)=>({t:'D',a,b}),U:(a,b)=>({t:'U',a,b}),I:(a,b)=>({t:'I',a,b}),V:(a,b)=>({t:'V',a,b}),L:(n,c)=>({t:'L',n,c})};
const BIN={J:'⋈',X:'×',D:'−',U:'∪',I:'∩',V:'÷'};
const kids=n=>n.t==='R'?[]:n.c?[n.c]:[n.a,n.b];
function ev(n,data){if(n._v)return n._v;let v;
  switch(n.t){case'R':v=data[n.n];break;case'S':v=RA.sel(ev(n.c,data),n.f);break;case'P':v=RA.proj(ev(n.c,data),n.as);break;
    case'J':v=RA.join(ev(n.a,data),ev(n.b,data));break;case'X':v=RA.times(ev(n.a,data),ev(n.b,data));break;
    case'Rho':case'L':{const c=ev(n.c,data);v=RA.R(n.n,c.attrs.map(a=>a.split('.').pop()),c.rows,c.prov);break;}
    case'D':v=RA.diff(ev(n.a,data),ev(n.b,data));break;case'U':v=RA.union(ev(n.a,data),ev(n.b,data));break;
    case'I':v=RA.inter(ev(n.a,data),ev(n.b,data));break;case'V':v=RA.div(ev(n.a,data),ev(n.b,data));break;}
  return n._v=v;}
let UID=0;
function html(n,top){n.id=n.id||'rx'+(++UID);const w=s=>`<span class="rxn" data-id="${n.id}">${s}</span>`;
  const sub=c=>(BIN[c.t]&&!top)||BIN[c.t]?`(${html(c)})`:html(c);
  switch(n.t){case'R':return w(n.n);case'L':return w(`<i>${n.n}</i>`);
    case'S':return w(`σ<sub>${n.lab}</sub>(${html(n.c)})`);case'P':return w(`π<sub>${n.lab||n.as.join(', ')}</sub>(${html(n.c)})`);
    case'Rho':return w(`ρ<sub>${n.n}</sub>(${html(n.c)})`);
    default:{const L=BIN[n.a.t]?`(${html(n.a)})`:html(n.a),R=BIN[n.b.t]?`(${html(n.b)})`:html(n.b);return w(`${L} ${BIN[n.t]} ${R}`);}}}
const plain=n=>{switch(n.t){case'R':return n.n;case'L':return n.n;case'S':return `σ<sub>${n.lab}</sub>(${plain(n.c)})`;case'P':return `π<sub>${n.lab||n.as.join(', ')}</sub>(${plain(n.c)})`;
  case'Rho':return `ρ<sub>${n.n}</sub>(${plain(n.c)})`;default:{const p=c=>BIN[c.t]?`(${plain(c)})`:plain(c);return `${p(n.a)} ${BIN[n.t]} ${p(n.b)}`;}}};
const rows=r=>`${r.rows.length} ${r.rows.length===1?'שורה':'שורות'}`;
function explain(n,data){const v=ev(n,data),k=kids(n).map(c=>ev(c,data));const base=a=>a.split('.').pop();
  switch(n.t){
    case'R':return `היחס <b>${n.n}</b> כמו שהוא: ${rows(v)}.`;
    case'L':return `<b>${n.n}</b> הוא שם לביטוי ${plain(n.c)} — ${rows(v)}.`;
    case'S':return `<b>σ — בחירה.</b> עוברים על כל שורה ומשאירים רק את אלה שמקיימות <code class="xp">${n.lab}</code>. נשארו ${v.rows.length} מתוך ${k[0].rows.length} שורות; העמודות לא השתנו.`;
    case'P':return `<b>π — הטלה.</b> משאירים רק את העמודות <code class="xp">${n.as.map(base).join(', ')}</code>.${k[0].rows.length!==v.rows.length?` שורות שהפכו לזהות מתאחדות: ${k[0].rows.length} ← ${v.rows.length}.`:''}`;
    case'J':{const c=k[0].attrs.map(base).filter(a=>k[1].attrs.map(base).includes(a));return `<b>⋈ — צירוף טבעי.</b> כל שורה משמאל מתחברת לשורות מימין שיש להן אותו ערך ב־<code class="xp">${c.join(', ')}</code>${c.length?'':' (אין עמודות משותפות — זו מכפלה)'}. העמודה המשותפת מופיעה פעם אחת. התקבלו ${rows(v)}.`;}
    case'X':return `<b>× — מכפלה קרטזית.</b> כל שורה משמאל עם כל שורה מימין: ${k[0].rows.length} × ${k[1].rows.length} = ${v.rows.length}. כדי להבדיל בין עמודות עם אותו שם, הן מקבלות קידומת של שם היחס.`;
    case'Rho':return `<b>ρ — שינוי שם.</b> אותן שורות, בשם <b>${n.n}</b>. כך אפשר לכתוב <code class="xp">${n.n}.${base(v.attrs[0])}</code> ולהבדיל בין שני עותקים של אותו יחס.`;
    case'D':return `<b>− — הפרש.</b> השורות של השמאלי שלא מופיעות בימני: ${k[0].rows.length} פחות ${k[0].rows.length-v.rows.length} שנמחקו = ${v.rows.length}.`;
    case'U':return `<b>∪ — איחוד.</b> כל השורות משני הצדדים, בלי כפילויות: ${rows(v)}.`;
    case'I':return `<b>∩ — חיתוך.</b> שורות שמופיעות בשני הצדדים: ${rows(v)}.`;
    case'V':return `<b>÷ — חילוק.</b> מחזיר ערכים של <code class="xp">${v.attrs.join(', ')}</code> שמופיעים בזוג עם <b>כל</b> שורה של המחלק (${k[1].rows.length} ${k[1].rows.length===1?'שורה':'שורות'}). נשארו ${rows(v)}.`;}}
function post(n,out=[]){if(out.includes(n))return out;if(n.t!=='L')kids(n).forEach(c=>post(c,out));out.push(n);return out;}
function mount(host,expr,data){const all=post(expr),order=all.filter(x=>x.t!=='R'),byId={};
  host.classList.add('rax');host.innerHTML=`<div class="rxbar"><span class="muted">לחץ על כל חלק בביטוי כדי לראות מה הוא מחזיר, או:</span><button type="button" class="btn ghost rxprev">הקודם</button><span class="rxprog"></span><button type="button" class="btn rxnext">בנה שלב אחרי שלב</button></div>
    <p class="rxexpr" dir="ltr">${html(expr,true)}</p><div class="rxout"></div>`;
  all.forEach(x=>byId[x.id]=x);let cur=-1;
  const show=(i,node)=>{const n=node||order[i];cur=node?order.indexOf(node):i;if(cur<0)cur=order.findIndex(o=>all.indexOf(o)>all.indexOf(n))-1;host.querySelectorAll('.rxn').forEach(e=>{e.classList.toggle('on',e.dataset.id===n.id);
      const d=order.findIndex(o=>o.id===e.dataset.id);e.classList.toggle('done',d>=0&&d<cur);});
    const v=ev(n,data),ins=kids(n).map(c=>ev(c,data));
    const lab=x=>x.t==='R'||x.t==='L'?x.n:'';
    const inT=n.t==='R'?'':ins.map((t,j)=>relTable(t,null,{label:`קלט${ins.length>1?(j?' ימני':' שמאלי'):''}: ${lab(kids(n)[j])||'תוצאת ביניים'}`,noprov:1})).join('');
    const outT=relTable(v,(n.t==='S'||n.t==='D')?ins[0]:null,{label:'התוצאה',noprov:1});
    host.querySelector('.rxout').innerHTML=`<div class="rxwhat" dir="ltr"><code class="xp">${plain(n)}</code></div><p>${explain(n,data)}</p><div class="rtrow">${inT}${inT?'<div class="rxarr">←</div>':''}${outT}</div>`;
    host.querySelector('.rxprog').textContent=n.t==='R'?'':`${cur+1} / ${order.length}`;host.querySelector('.rxprev').disabled=cur<=0;host.querySelector('.rxnext').disabled=cur>=order.length-1;
    host.querySelector('.rxnext').textContent='השלב הבא';};
  host.querySelector('.rxexpr').addEventListener('click',e=>{const s=e.target.closest('.rxn');if(!s)return;e.stopPropagation();show(0,byId[s.dataset.id]);});
  host.querySelector('.rxnext').onclick=()=>show(Math.min(order.length-1,cur+1));host.querySelector('.rxprev').onclick=()=>show(Math.max(0,cur-1));
  host.querySelector('.rxprev').disabled=true;}
window.RAX={N,mount,ev,plain};
/* ---------- expressions ---------- */
const Rl=N.R,Sel=N.S,Proj=N.P,Jn=N.J,Xx=N.X,Rh=N.Rho,Df=N.D,Dv=N.V,Lt=N.L;
const EXPR={};
const has=n=>{try{return eval('typeof '+n+'!=="undefined"');}catch(e){return false;}};
if(has('W')&&W.Works){const elta=()=>Sel("company-name='Elta'",t=>t['company-name']==='Elta',Rl('Works'));
  Object.assign(EXPR,{
  q3a:[()=>Proj(['person-name'],elta()),W],
  q3b:[()=>Proj(['person-name','street','city'],Jn(elta(),Rl('Lives'))),W],
  q3c:[()=>Proj(['person-name','street','city'],Jn(Sel("company-name='Elta' ∧ salary>10000",t=>t['company-name']==='Elta'&&t.salary>10000,Rl('Works')),Rl('Lives'))),W],
  q3d:[()=>Proj(['person-name'],Jn(Jn(Rl('Works'),Rl('Lives')),Rl('Located-in'))),W],
  q3e:[()=>Proj(['person-name'],Sel('manager-name=m.person-name ∧ city=m.city',t=>t['manager-name']===t['m.person-name']&&t.city===t['m.city'],Xx(Jn(Rl('Manages'),Rl('Lives')),Rh('m',Rl('Lives'))))),W],
  q3f:[()=>Df(Proj(['person-name'],Rl('Works')),Proj(['person-name'],elta())),W],
  q3g:[()=>Df(Proj(['person-name'],Rl('Works')),Proj(['Works.person-name'],Sel('Works.salary ≤ b.salary',t=>t['Works.salary']<=t['b.salary'],Xx(Rl('Works'),Rh('b',Sel("company-name='Bezek'",t=>t['company-name']==='Bezek',Rl('Works'))))))),W],
  q3h:[()=>Dv(Proj(['company-name','city'],Rl('Located-in')),Proj(['city'],Sel("company-name='Elta'",t=>t['company-name']==='Elta',Rl('Located-in')))),W]});}
if(has('S')&&S.Employee){const D4=S;Object.assign(EXPR,{
  q4a:[()=>Proj(['emp_name','birth','city'],Sel('emp_id=dept_head_id',t=>t['emp_id']===t['dept_head_id'],Xx(Rl('Employee'),Rl('Department')))),D4],
  q4b:[()=>Proj(['emp_id','emp_name'],Jn(Sel('amount>1000',t=>t.amount>1000,Rl('Order')),Rl('Employee'))),D4],
  q4c:[()=>Proj(['emp_id','emp_name'],Jn(Df(Proj(['emp_id'],Rl('Order')),Proj(['emp_id'],Sel('amount≥1000',t=>t.amount>=1000,Rl('Order')))),Rl('Employee'))),D4],
  q4d:[()=>Dv(Proj(['order_id','prod_id'],Rl('Line_order')),Proj(['prod_id'],Sel('price_per_unit≤10',t=>t.price_per_unit<=10,Rl('Products')))),D4],
  q4e:[()=>Df(Proj(['dept_id','dept_name'],Rl('Department')),Proj(['dept_id','dept_name'],Jn(Rl('Department'),Proj(['dept_id'],Jn(Rl('Employee'),Proj(['emp_id'],Rl('Order'))))))),D4]});}
if(has('UNI')){const U=UNI,cs=()=>Sel("dept='CS'",t=>t.dept==='CS',Rl('Course'));Object.assign(EXPR,{
  m3a:[()=>Proj(['name'],Sel("city='Haifa'",t=>t.city==='Haifa',Rl('Student'))),U],
  m3b:[()=>Proj(['name','title'],Jn(Jn(Rl('Student'),Rl('Takes')),cs())),U],
  m3c:[()=>Proj(['name'],Sel("title='Databases' ∧ grade>90",t=>t.title==='Databases'&&t.grade>90,Jn(Jn(Rl('Student'),Rl('Takes')),Rl('Course')))),U],
  m3d:[()=>Proj(['name'],Jn(Jn(Rl('Student'),Rl('Takes')),Sel("lecturer-name='Cohen'",t=>t['lecturer-name']==='Cohen',Rl('Teaches')))),U],
  m3e:[()=>Proj(['Student.name'],Sel("Student.city=o.city ∧ Student.name≠'Omer'",t=>t['Student.city']===t['o.city']&&t['Student.name']!=='Omer',Xx(Rl('Student'),Rh('o',Proj(['city'],Sel("name='Omer'",t=>t.name==='Omer',Rl('Student'))))))),U],
  m3f:[()=>Proj(['name'],Jn(Df(Proj(['student-id'],Rl('Student')),Proj(['student-id'],Jn(Rl('Takes'),Sel("dept='MATH'",t=>t.dept==='MATH',Rl('Course'))))),Rl('Student'))),U],
  m3g:[()=>{const Dd=Lt('D',Proj(['student-id','grade'],Jn(Rl('Takes'),Sel("title='Databases'",t=>t.title==='Databases',Rl('Course')))));
     const St=Lt('St',Proj(['grade'],Jn(Rl('Takes'),Sel("title='Statistics'",t=>t.title==='Statistics',Rl('Course')))));
     return Proj(['name'],Jn(Df(Proj(['student-id'],Dd),Proj(['D.student-id'],Sel('D.grade ≤ s.grade',t=>t['D.grade']<=t['s.grade'],Xx(Dd,Rh('s',St))))),Rl('Student')));},U],
  m3h:[()=>Proj(['name'],Jn(Dv(Proj(['student-id','course-id'],Rl('Takes')),Proj(['course-id'],cs())),Rl('Student'))),U]});}
window.RAX_EXPR=EXPR;
const run=()=>document.querySelectorAll('[data-rax]:not(.rax)').forEach(h=>{const e=EXPR[h.dataset.rax];if(e)try{mount(h,e[0](),e[1]);}catch(err){console.error(h.dataset.rax,err);}});
run();document.addEventListener('DOMContentLoaded',run);
})();
