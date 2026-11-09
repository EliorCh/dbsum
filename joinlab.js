/* SQL: natural / on / using / no condition — side-by-side lab on the bank data */
(function(){const K=window.SQLKIT,host=document.getElementById('joinLab');if(!K||!host)return;
const PE=`create table cust(cust_id integer, name text, city text);
insert into cust values (1,'Dana','Haifa'),(2,'Gil','Eilat'),(3,'Noa','Haifa');
create table emp(emp_id integer, name text, city text);
insert into emp values (10,'Rina','Haifa'),(11,'Dana','Haifa'),(12,'Omer','Eilat');
`;
const M=[
 {k:'natural',lab:'natural',sql:'select *\nfrom deposit natural join customer',
  why:'מצרף אוטומטית לפי <b>כל</b> העמודות שיש להן אותו שם בשני היחסים — כאן רק <code class="xp">customer_name</code>. העמודה המשותפת מופיעה בתוצאה פעם אחת.'},
 {k:'on',lab:'on',sql:'select *\nfrom deposit join customer\n     on deposit.customer_name = customer.customer_name',
  why:'מצרף לפי התנאי שכתבת. אותן שורות כמו ב־natural, אבל <code class="xp">customer_name</code> מופיעה <b>פעמיים</b> — פעם מכל יחס — ולכן כדי לבחור אותה צריך לכתוב <code class="xp">deposit.customer_name</code>.'},
 {k:'using',lab:'using',sql:'select *\nfrom deposit join customer using (customer_name)',
  why:'כמו natural, אבל רק לפי העמודות שרשמת בסוגריים. שימושי כשיש עוד עמודות באותו שם שלא רוצים לצרף לפיהן.'},
 {k:'none',lab:'בלי תנאי',sql:'select *\nfrom deposit, customer',
  why:'בלי שום תנאי זו מכפלה קרטזית: כל חשבון עם כל לקוח, 8 × 5 = 40. רוב השורות מזויפות — למשל החשבון של Even ליד Morag.'},
 {k:'nocommon',lab:'natural בלי עמודה משותפת',sql:'select *\nfrom customer natural join branch',
  why:'ל־customer ול־branch אין אף עמודה באותו שם. natural join לא נכשל — הוא פשוט הופך למכפלה: 5 × 4 = 20 שורות, כל לקוח עם כל סניף.'},
 {k:'many',lab:'natural עם שתי עמודות משותפות',pre:PE,sql:'-- לקוחות ועובדים שגרים באותה עיר?\nselect *\nfrom cust natural join emp',
  why:'ל־cust ול־emp יש <b>שתי</b> עמודות משותפות: name ו־city. natural מצרף לפי שתיהן, ולכן מחזיר רק זוגות עם אותו שם <b>וגם</b> אותה עיר — שורה אחת (Dana), ולא כל הזוגות מאותה עיר.'},
 {k:'many2',lab:'אותה שאלה עם using',pre:PE,sql:'-- לקוחות ועובדים שגרים באותה עיר\nselect cust.name, emp.name, city\nfrom cust join emp using (city)',
  why:'<code class="xp">using (city)</code> מצרף רק לפי העיר. עכשיו יוצאים כל הזוגות שגרים באותה עיר: 2 לקוחות ב־Haifa × 2 עובדים שם, ועוד זוג אחד ב־Eilat — 5 שורות.'}];
host.innerHTML=`<div class="jlbtns">${M.map(m=>`<button type="button" class="chip" data-k="${m.k}">${m.lab}</button>`).join('')}</div>
 <div class="jlbox"><div class="jlhead"><pre class="sqlcode jlsql"></pre><p class="jlwhy"></p></div>
 <div class="jlsec"><div class="sxlab">הטבלאות בשאילתה</div><div class="jlsrc"></div></div>
 <div class="jlsec"><div class="sxlab">התוצאה</div><div class="jlstats"></div><div class="jlout"></div></div></div>`;
const tab=(n,cols,rows)=>`<div class="srct">${K.resultHTML({cols,rows},n)}</div>`;
const srcs=(m)=>m.pre?tab('cust',['cust_id','name','city'],[[1,'Dana','Haifa'],[2,'Gil','Eilat'],[3,'Noa','Haifa']])+tab('emp',['emp_id','name','city'],[[10,'Rina','Haifa'],[11,'Dana','Haifa'],[12,'Omer','Eilat']])
  :K.sourcesHTML('bank',m.sql,'',false).replace(/^<aside class="srcside"><div class="sxlab">[^<]*<\/div>/,'').replace(/<\/aside>$/,'');
const cache={};
async function render(m){if(!cache[m.k]){let st,out;
  try{const r=await K.runLive('bank',(m.pre||'')+m.sql.replace(/--[^\n]*/g,''));
    if(r.error){st='';out=K.resultHTML(r);}else{const dup=r.cols.filter((c,i)=>r.cols.indexOf(c)!==i);
    st=`<span class="tgb ok">${r.cols.length} עמודות</span> <span class="tgb ok">${r.rows.length===1?"שורה אחת":r.rows.length+" שורות"}</span>${dup.length?` <span class="tgb bad">${dup.join(', ')} מופיעה פעמיים</span>`:''}`;
    out=K.resultHTML(r,'');}}catch(e){st='';out=`<div class="sqlerr">${e.message}</div>`;}
  cache[m.k]={st,out};}
 /* swap everything in one go, so nothing collapses in between */
 const c=cache[m.k];host.querySelector('.jlsql').innerHTML=K.hl(m.sql);host.querySelector('.jlwhy').innerHTML=m.why;
 host.querySelector('.jlsrc').innerHTML=srcs(m);host.querySelector('.jlstats').innerHTML=c.st;host.querySelector('.jlout').innerHTML=c.out;}
const parts=['.jlhead','.jlsrc','.jlstats','.jlout'];let cur='natural';
/* reserve the tallest height of each part over all modes → switching never shifts the page */
async function fit(){parts.forEach(q=>host.querySelector(q).style.minHeight='');const mx={};
  for(const m of M){await render(m);parts.forEach(q=>{mx[q]=Math.max(mx[q]||0,host.querySelector(q).offsetHeight);});}
  parts.forEach(q=>host.querySelector(q).style.minHeight=mx[q]+'px');await render(M.find(x=>x.k===cur));}
function show(k){cur=k;host.querySelectorAll('.jlbtns .chip').forEach(b=>b.setAttribute('aria-pressed',b.dataset.k===k));render(M.find(x=>x.k===k));}
host.querySelector('.jlbtns').addEventListener('click',e=>{const b=e.target.closest('.chip');if(b)show(b.dataset.k);});
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(fit,200);});
show('natural');fit();})();