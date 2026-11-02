/* =================== command store ("מחסן פקודות") =================== */
(function(){
const SQLG=[
 ['שליפה בסיסית',[
  ['שאילתה בסיסית','select A, B\nfrom R\nwhere תנאי','בשורה הראשונה ההטלה (π), בשנייה המכפלה (×), בשלישית הבחירה (σ).','π(σ(R))'],
  ['בלי כפילויות','select distinct A\nfrom R','בלי distinct כפילויות נשארות בתוצאה.','π'],
  ['כל העמודות','select *\nfrom R\nwhere תנאי','הכוכבית מחזירה את כל העמודות של היחסים ב־from.','σ'],
  ['כינוי','select T.A\nfrom R T, R S\nwhere T.B = S.B','שני כינויים לאותו יחס — השוואה של שורה לשורה אחרת.','ρ'],
  ['עמודה מחושבת','select A, B * 1.1 as new_b\nfrom R','המילה as נותנת שם לעמודה. כפל ב־1.0 מונע חילוק שלם.',''],
  ['מחרוזת חלקית',"where A like 'ab%'",'התו % מתאים לכל רצף תווים, והתו _ לתו אחד בדיוק.',''],
  ['טווח',"where D between '2025-01-01' and '2025-12-31'",'כולל את שני הקצוות.',''],
  ['רשימת ערכים',"where A in ('x', 'y', 'z')",'שייכות לקבוצה קבועה.',''],
  ['ערך חסר','where A is null','לעולם לא A = null.',''],
  ['מיון','order by A asc, B desc','ברירת מחדל: עולה. המיון השני רק בין שורות שוות במיון הראשון.',''] ]],
 ['צירופים',[
  ['צירוף בתנאי ב־where','select …\nfrom R, S\nwhere R.A = S.A','מכפלה + תנאי שוויון.','σ(R × S)'],
  ['צירוף טבעי','select …\nfrom R natural join S','לפי כל העמודות בעלות אותו שם.','R ⋈ S'],
  ['join … on','select …\nfrom R inner join S on R.A = S.B','כששמות העמודות שונים.',''],
  ['outer join','select …\nfrom R left outer join S on R.A = S.A','שורות של R בלי התאמה נשארות, עם null מימין.',''],
  ['שלושה יחסים','select …\nfrom R natural join S natural join T\nwhere תנאי','שרשרת צירופים.','R ⋈ S ⋈ T'] ]],
 ['פעולות קבוצה',[
  ['איחוד','select A from R\nunion\nselect A from S','אותו מספר עמודות בשני הצדדים. מסלק כפילויות.','∪'],
  ['חיתוך','select A from R\nintersect\nselect A from S','',"∩"],
  ['הפרש','select A from R\nexcept\nselect A from S','במצגת: minus.','−'],
  ['איחוד עם כפילויות','select A from R\nunion all\nselect A from S','','' ] ]],
 ['תתי־שאילתות',[
  ['שייכות','where A in (select A from S where תנאי)','',''],
  ['שלילה','where A not in (select A from S where תנאי)','״שאין להם״, ״שאינם״ — לא A <> …','−'],
  ['קיום','where exists (select * from S\n              where S.A = R.A and תנאי)','מתואמת: רצה לכל שורה של R.',''],
  ['אי־קיום','where not exists (select * from S\n                  where S.A = R.A and תנאי)','',''],
  ['גדול מכולם','where A > all (select A from S where תנאי)','ב־SQLite: A > (select max(A) …).',''],
  ['גדול מאחד לפחות','where A > some (select A from S where תנאי)','ב־SQLite: A > (select min(A) …).',''],
  ['חילוק — ״בכל״','where not exists (\n    select B from S where תנאי\n    except\n    select T.B from R T where T.A = X.A)','״אין ערך נדרש שחסר לו״.','÷'],
  ['חילוק — תחביר הקורס','where (select T.B from R T where T.A = X.A)\n      contains\n      (select B from S where תנאי)','לא קיים ב־SQLite.','÷'] ]],
 ['הקבצה',[
  ['פונקציות','select count(*), count(distinct A), sum(B), avg(B), min(B), max(B)\nfrom R','מתעלמות מ־null, חוץ מ־count(*).',''],
  ['לכל קבוצה','select A, count(*)\nfrom R\ngroup by A','ב־select רק עמודות מה־group by ופונקציות.',''],
  ['תנאי על קבוצה','select A, avg(B)\nfrom R\ngroup by A\nhaving avg(B) > 100','תנאי על שורות ב־where, תנאי על קבוצות ב־having.',''],
  ['הקבוצה המרבית','group by A\nhaving count(*) >= all (select count(*)\n                        from R\n                        group by A)','בתחביר הקורס. ב־SQLite: >= (select max(c) from (select count(*) as c from R group by A)).',''],
  ['ערך מרבי','select A\nfrom R\nwhere B = (select max(B) from R)','',''] ]],
 ['עדכונים',[
  ['הוספת שורה',"insert into R\nvalues (1, 'x', 100)",'הסדר כמו בהגדרת הטבלה.',''],
  ['הוספה מתוצאה',"insert into R\n  select A, B, 0\n  from S\n  where תנאי",'',''],
  ['מחיקה','delete from R\nwhere תנאי','במצגת: delete R. בלי where — כל השורות.',''],
  ['עדכון','update R\nset B = B * 1.05\nwhere תנאי','',''],
  ['עדכון לפי יחס אחר','update R\nset B = B + 5\nwhere A in (select A from S where תנאי)','',''] ]],
 ['תצפיות והגדרות',[
  ['תצפית','create view V as\n  select A, count(*) as n\n  from R\n  group by A','',''],
  ['מחיקת תצפית','drop view V','',''],
  ['טבלה עם מפתחות','create table R (\n  A integer primary key,\n  B text not null,\n  C integer references S(C)\n)','',''],
  ['מפתח מורכב','create table R (\n  A integer,\n  B integer,\n  primary key (A, B),\n  foreign key (A) references S\n)','לישות חלשה ולטבלת קשר M:N.',''],
  ['ייחודיות','create table R (\n  A integer primary key,\n  E text unique\n)','עמודה ייחודית היא מפתח קביל נוסף.',''] ]]
];
const RAS=[['σ','בחירה'],['π','הטלה'],['×','מכפלה'],['⋈','צירוף טבעי'],['ρ','כינוי'],['∪','איחוד'],['∩','חיתוך'],['−','הפרש'],['÷','חילוק'],
  ['∧','וגם'],['∨','או'],['¬','לא'],['≠','שונה'],['≤','קטן או שווה'],['≥','גדול או שווה'],['∃','קיים'],['∀','לכל'],['∈','שייך'],['⇒','גורר']];
const RAT=[
 ['בחירה והטלה','π_{A,B}(σ_{C=\'x\'}(R))'],['שרשרת צירופים','π_{A}(R ⋈ S ⋈ σ_{…}(T))'],
 ['המרבי','π_{B}(R) − π_{R.B}(σ_{R.B<d.B}(R × ρ_{d}(R)))'],['שלילה','π_{A}(R) − π_{A}(σ_{…}(S))'],
 ['חילוק','π_{A,B}(R) ÷ π_{B}(σ_{…}(S))'],['תחשיב: צורה כללית','{ <x, y> | ∃z ( <x, y, z> ∈ R ∧ … ) }'],
 ['תחשיב: ״בכל״','{ <a> | ∀b ( <b, …> ∈ S ⇒ <a, b> ∈ R ) }']];

let lastTA=null;
document.addEventListener('focusin',e=>{if(e.target.matches&&e.target.matches('textarea'))lastTA=e.target;});
const toast=m=>{let t=document.querySelector('.paltoast');if(!t){t=document.createElement('div');t.className='paltoast';document.body.append(t);}t.textContent=m;t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('on'),1600);};
function insert(code){
  if(lastTA&&document.body.contains(lastTA)){const a=lastTA.selectionStart??lastTA.value.length,b=lastTA.selectionEnd??a;
    lastTA.value=lastTA.value.slice(0,a)+code+lastTA.value.slice(b);lastTA.focus();lastTA.selectionStart=lastTA.selectionEnd=a+code.length;toast('הוכנס לעורך');}
  else copy(code);
}
function copy(code){(navigator.clipboard?navigator.clipboard.writeText(code):Promise.reject()).then(()=>toast('הועתק'),()=>{const t=document.createElement('textarea');t.value=code;document.body.append(t);t.select();document.execCommand('copy');t.remove();toast('הועתק');});}
const hl=c=>window.SQLKIT?window.SQLKIT.hl(c):esc(c);
let el=null;
function build(){
  el=document.createElement('aside');el.className='palette';el.hidden=true;el.setAttribute('aria-label','מחסן פקודות');
  el.innerHTML=`<div class="palhead"><b>מחסן פקודות</b><input type="search" placeholder="חיפוש: join, having, ״שלילה״…" aria-label="חיפוש"><button type="button" class="srcbtn palclose" title="סגור">×</button></div>
   <div class="paltabs"><button type="button" data-p="sql" aria-pressed="true">SQL</button><button type="button" data-p="ra" aria-pressed="false">אלגברה ותחשיב</button></div>
   <p class="palhint">״הכנס״ מכניס את התבנית לעורך האחרון שלחצת בו, במקום הסמן. החלף את המילים <code>R</code>, <code>A</code>, <code>תנאי</code> בשלך.</p>
   <div class="palbody" data-p="sql">${SQLG.map(([g,items])=>`<details class="palgrp" open><summary>${g}</summary>${items.map(([t,c,ex,ra])=>`<div class="palitem" data-s="${esc((g+' '+t+' '+c+' '+ex+' '+ra).toLowerCase())}">
      <div class="paltop"><b>${t}</b>${ra?`<span class="palra">${ra}</span>`:''}<span class="palbtns"><button type="button" class="ins">הכנס</button><button type="button" class="cpy">העתק</button></span></div>
      <pre class="sqlcode">${hl(c)}</pre>${ex?`<div class="palex">${capHTML(ex)}</div>`:''}</div>`).join('')}</details>`).join('')}</div>
   <div class="palbody" data-p="ra" hidden><div class="palsyms">${RAS.map(([s,n])=>`<button type="button" class="sym" data-c="${s}" title="${n}"><span>${s}</span><small>${n}</small></button>`).join('')}</div>
     ${RAT.map(([t,c])=>`<div class="palitem" data-s="${esc((t+' '+c).toLowerCase())}"><div class="paltop"><b>${t}</b><span class="palbtns"><button type="button" class="cpy">העתק</button></span></div><pre class="sqlcode ra">${esc(c)}</pre></div>`).join('')}
     <p class="palex">הסמלים מועתקים ללוח — להדבקה בסיכום, בהודעה או בעורך.</p></div>`;
  document.body.append(el);
  el.querySelector('.palclose').onclick=()=>toggle(false);
  el.querySelector('.paltabs').onclick=e=>{const b=e.target.closest('button');if(!b)return;el.querySelectorAll('.paltabs button').forEach(x=>x.setAttribute('aria-pressed',x===b));el.querySelectorAll('.palbody').forEach(p=>p.hidden=p.dataset.p!==b.dataset.p);};
  el.querySelector('input').oninput=e=>{const q=e.target.value.trim().toLowerCase();el.querySelectorAll('.palitem').forEach(i=>i.hidden=q&&!i.dataset.s.includes(q));
    el.querySelectorAll('.palgrp').forEach(g=>{g.hidden=![...g.querySelectorAll('.palitem')].some(i=>!i.hidden);if(q)g.open=true;});};
  el.addEventListener('mousedown',e=>{if(e.target.closest('button'))e.preventDefault();});   // keep focus/caret in the editor
  el.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.classList.contains('sym')){copy(b.dataset.c);return;}
    const it=b.closest('.palitem');if(!it)return;const code=it.querySelector('pre').textContent;
    if(b.classList.contains('ins'))insert(code);if(b.classList.contains('cpy'))copy(code);});
}
function toggle(on){if(!el)build();const open=on??el.hidden;el.hidden=!open;document.body.classList.toggle('pal-open',open);
  document.querySelectorAll('.palBtn').forEach(b=>b.setAttribute('aria-pressed',open));if(open)el.querySelector('input').focus({preventScroll:true});}
/* floating launcher + a button beside every editor */
const fab=document.createElement('button');fab.type='button';fab.className='palfab palBtn';fab.setAttribute('aria-pressed','false');fab.textContent='מחסן פקודות';fab.onclick=()=>toggle();document.body.append(fab);
function addButtons(root){(root||document).querySelectorAll('.ldbtns').forEach(r=>{if(r.querySelector('.palBtn')||!r.querySelector('.runBtn,#playRun'))return;
  const b=document.createElement('button');b.type='button';b.className='btn ghost palBtn';b.textContent='מחסן פקודות';
  b.onclick=()=>{const ta=r.parentElement.querySelector('textarea')||document.getElementById('playSql');if(ta)lastTA=ta;toggle(true);};r.append(b);});}
addButtons();
new MutationObserver(()=>addButtons()).observe(document.body,{childList:true,subtree:true});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&el&&!el.hidden)toggle(false);});
})();
