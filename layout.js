/* Layout layer (Nov 2026): shared-site structure, chapter bar, split view, live board. */
window.EX3SHEET={"intro": {"1": {"t": "בהתייחס לבסיס הנתונים היחסי של שאלה מס' 2, דף תרגיל מס' 2, עם תבניות היחסים הבאות:", "s": ["Person = (p_id, p_name, address)", "Owns = (p_id, license)", "Car = (license, model, year)", "Accident = (license, date, driver, damage)"], "a": "כתוב את שאילתות SQL הבאות:"}, "2": {"t": "בהתייחס לבסיס הנתונים היחסי של שאלה מס' 3 דף תרגיל מס' 2, עם תבניות היחסים הבאות, כתוב שאילתת SQL לכל אחת מהשאילתות בשאלה הנ\"ל.", "s": ["Lives = (person-name, street, city)", "Works = (person-name, company-name, salary)", "Located-in = (company-name, city)", "Manages = (person-name, manager-name)"], "a": "(השאילתות עצמן — מתוך תרגיל 2, שאלה 3.)"}, "3": {"t": "בהתייחס לבסיס הנתונים היחסי של שאלה מס' 3 דף תרגיל מס' 2, כתוב ביטוי SQL לכל אחת מהשאילתות הבאות:", "s": ["Lives = (person-name, street, city)", "Works = (person-name, company-name, salary)", "Located-in = (company-name, city)", "Manages = (person-name, manager-name)"]}, "4": {"t": "בהתייחס לבה\"נ היחסי של שאלה 1:", "s": ["Person = (p_id, p_name, address)", "Owns = (p_id, license)", "Car = (license, model, year)", "Accident = (license, date, driver, damage)"]}, "5": {"t": "בהתייחס לבסיס הנתונים היחסי של שאלה מס' 3 דף תרגיל מס' 2, כתוב ביטוי SQL לכל אחת מהשאילתות הבאות:", "s": ["Lives = (person-name, street, city)", "Works = (person-name, company-name, salary)", "Located-in = (company-name, city)", "Manages = (person-name, manager-name)"]}}, "sub": {"e1a": "מצא מספר האנשים שמכוניתם היתה מעורבת בתאונה ב־1989.", "e1b": "מצא מספר התאונות שבהן היו מעורבות המכוניות בבעלותו של 'Cohen'.", "e1c": "הוסף אדם חדש לבה\"נ.", "e1d": "מחק מבה\"נ את המכונית מדגם 'Mazda' השייכת ל־'Cohen'.", "e1e": "הוסף רשומת תאונה למכונית 'Toyota' של 'Levi'.", "e2a": "מצא שמות כל העובדים בחברת \"Elta\".", "e2b": "מצא שמות וכתובות העובדים בחברת \"Elta\".", "e2c": "מצא שמות וכתובות העובדים בחברת \"Elta\" המרוויחים יותר מ־10,000 ש\"ח לחודש.", "e2d": "מצא שמות העובדים הגרים בעיר שבה נמצאת החברה בה הם עובדים.", "e2e": "מצא שמות העובדים הגרים בעיר שבה מתגורר המנהל שלהם.", "e2f": "מצא שמות העובדים שאינם עובדים ב־\"Elta\".", "e2g": "מצא שמות העובדים שמרוויחים יותר מכל עובד בחברת \"Bezek\".", "e2h": "נניח כי כל חברה עשויה להיות ממוקמת במספר ערים (כלומר המפתח הראשי של התבנית Located-in הוא company-name, city). מצא את שמות כל החברות, הממוקמות בכל עיר שבה ממוקמת \"Elta\".", "e3a": "שנה את עיר מגוריו של 'Lahav' ל־'Haifa'.", "e3b": "הענק לכל העובדים בחברת 'Elta' העלאה של 10% בשכרם.", "e3c": "הענק 10% העלאה לכל המנהלים.", "e3d": "מחק מהיחס works את כל ה־n־יות של חברת 'Elta'.", "e4a": "הגדר תצפית pers_acc שתציג לכל אדם מספר התאונות בהן היו מעורבות מכוניות בבעלותו.", "e4b": "כנ\"ל, אך התצפית צריכה להציג עבור לקוחות שבבעלותם 2 מכוניות או יותר, את שמות הלקוחות, את מס' התאונות שבהן היו מכוניותיו מעורבות ואת הנזק הממוצע לתאונה.", "e5a": "המשכורת הממוצעת בכל חברה.", "e5b": "המשכורת הממוצעת של כל העובדים בבה\"נ. (הנח כי כל אדם עובד בחברה אחת בלבד.)", "e5c": "שם החברה המעסיקה את מספר העובדים המירבי.", "e5d": "שם החברה שבה המשכורת המינימלית היא הנמוכה ביותר.", "e5e": "שמות החברות שבהן המשכורת הממוצעת גבוהה מהמשכורת הממוצעת בחברת 'Elit'.", "e5f": "שם החברה שבה מספר המנהלים הגרים ב־'Haifa' הוא מיזערי. (הנח כי לכל אדם בבסיס הנתונים כתובת אחת בלבד, כי כל אדם עובד בחברה אחת בלבד וכי לכל חברה כתובת אחת בלבד.)"}};
(function(){
var on=true;
if(on&&!/(^|\/)(index\.html)?$/.test(location.pathname)){try{localStorage.setItem('mta-menu-collapsed','1')}catch(e){};document.documentElement.classList.add('mta-menu-collapsed')}
function toggle(){}
if(!on){document.addEventListener('DOMContentLoaded',toggle);return}
document.documentElement.classList.add('proto');document.documentElement.setAttribute('data-theme','light');
var l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@500;700;900&display=swap';document.head.appendChild(l);
var GOT={
 'fd-def':['α → β אומרת: כל שתי שורות שמסכימות על α מסכימות גם על β. בודקים זוגות של שורות — שורה בודדת לא יכולה להפר תלות.',
   'ביחס שיש בו שורה אחת בלבד — אילו תלויות מתקיימות?','כולן. אין שתי שורות שונות שיכולות להפר. וזו בדיוק הסיבה שמופע אחד יכול רק <b>להפריך</b> תלות, לא להוכיח שהיא חלק מהתבנית.'],
 'fd-lecture':['להוכיח תלות מההגדרה: לוקחים שתי שורות שמסכימות על אגף שמאל, ומראים — תלות אחרי תלות מתוך F — שהן מסכימות גם על אגף ימין.',
   'בדוגמת ההרצאה — האם התלות הבאה נובעת מ־F?<p class="mathline"><code class="xp">CG → HI</code></p>','כן. שתי התלויות האלה נמצאות ב־F:<p class="mathline"><code class="xp">CG → H ,  CG → I</code></p>ולפי כלל האיחוד מקבלים את התלות המבוקשת.'],
 'armstrong':['שלושת הכללים (רפלקסיביות, הרחבה, טרנזיטיביות) מספיקים כדי להסיק כל תלות ב־F⁺. בפועל לא מחשבים את F⁺ כולה — היא אקספוננציאלית.',
   'נתון:<p class="mathline"><code class="xp">A → B ,  A → C</code></p>מה אפשר להסיק, ובאיזה כלל?','לפי כלל האיחוד:<p class="mathline"><code class="xp">A → BC</code></p>'],
 'closure':['α⁺ הוא כל מה ש־α קובעת. כדי לבדוק אם α → β נובעת — לא מחפשים שרשרת כללים, רק בודקים אם β ⊆ α⁺.',
   'בדוגמת ההרצאה:<p class="mathline"><code class="xp">F = { A → B, A → C, CG → H, CG → I, B → H }</code></p>מהו הסגור של A?','מתחילים מ־A, מוסיפים B ו־C, ואז H בזכות B → H. אי אפשר להפעיל את CG בלי G:<p class="mathline"><code class="xp">A⁺ = ABCH</code></p>'],
 'keys':['מפתח־על: הסגור שלו הוא כל R. מפתח קביל: מפתח־על מינימלי — אם מורידים ממנו תכונה כלשהי, הסגור כבר לא R.',
   'תכונה שלא מופיעה באגף ימין של אף תלות — האם היא חייבת להיות בכל מפתח קביל?','כן. שום תלות לא מוסיפה אותה לסגור, ולכן היא נכנסת לסגור רק אם היא בקבוצה מההתחלה. בדוגמת ההרצאה זו התכונה G — ואכן המפתח היחיד הוא AG.']
};
function wrapBox(b,icon){var h=b.querySelector(':scope>h4,:scope>.lech');if(!h)return;var hd=document.createElement('div');hd.className='pbh';
 hd.innerHTML='<i>'+icon+'</i>';b.insertBefore(hd,h);hd.appendChild(h);var bd=document.createElement('div');bd.className='pbb';
 while(hd.nextSibling)bd.appendChild(hd.nextSibling);b.appendChild(bd)}
document.addEventListener('DOMContentLoaded',function(){
 toggle();
 var isEx=/-ex\d?\.html$/.test(location.pathname)||/-ex\.html/.test(location.pathname);
 if(isEx)document.body.classList.add('exw');
 document.querySelectorAll('.box.rule').forEach(function(b){wrapBox(b,'§')});
 document.querySelectorAll('.box.warn').forEach(function(b){wrapBox(b,'!')});
 document.querySelectorAll('.box.tip').forEach(function(b){wrapBox(b,'✓')});
 document.querySelectorAll('.lec.key').forEach(function(b){wrapBox(b,'★')});
 document.querySelectorAll('.lec.exam').forEach(function(b){wrapBox(b,'✎')});
 // proofs: (reason, formula) rows
 document.querySelectorAll('.steps.proof').forEach(function(pf){var kids=[].slice.call(pf.children),row=null;
  kids.forEach(function(k){if(!k.classList.contains('mathline')){row=document.createElement('div');row.className='prow';pf.insertBefore(row,k);row.appendChild(k)}
   else if(row&&row.children.length===1){row.appendChild(k)}else{var r=document.createElement('div');r.className='prow';pf.insertBefore(r,k);r.appendChild(document.createElement('span'));r.appendChild(k)}})});
 // givens: short "label:" paragraph followed by formulas -> compact panel
 document.querySelectorAll('main section').forEach(function(sec){var kids=[].slice.call(sec.children),i=0,panel=null,last=null;
  while(i<kids.length){var k=kids[i];var txt=(k.textContent||'').trim();
   if(i<=4&&(!panel||last===kids[i-1]||!panel)&&k.tagName==='P'&&!k.classList.contains('mathline')&&txt.length<110&&/:\s*$/.test(txt)&&kids[i+1]&&kids[i+1].classList&&kids[i+1].classList.contains('mathline')){
    if(panel&&last!==kids[i-1]){i++;continue}if(!panel){panel=document.createElement('div');panel.className='pgivs';panel.innerHTML='<div class="pgh">הנתונים</div>';sec.insertBefore(panel,k)}
    var row=document.createElement('div');row.className='pgiv'+(txt.length>48?' stk':'');panel.appendChild(row);row.appendChild(k);var f=document.createElement('div');f.className='pgf';row.appendChild(f);i++;
    while(kids[i]&&kids[i].classList&&kids[i].classList.contains('mathline')){f.appendChild(kids[i]);last=kids[i];i++}
    continue}
   i++}});
 // section eyebrows + page map
 var cm=(document.querySelector('.chapmid')||{}).textContent||'';var cn=(cm.match(/פרק\s*(\d+)/)||[])[1]||'';
 var secs=[].slice.call(document.querySelectorAll('main section[id]:not(.hero)')).filter(function(s){return s.querySelector(':scope>h2')});
 var map=document.createElement('nav');map.className='pmap';
 secs.forEach(function(s,n){var h=s.querySelector(':scope>h2');var eb=document.createElement('div');eb.className='peb';
  eb.textContent=(cn?'פרק '+cn+' · ':'')+'סעיף '+(n+1)+' מתוך '+secs.length;s.insertBefore(eb,h);
  var a=document.createElement('a');a.href='#'+s.id;a.innerHTML='<b>'+(n+1)+'</b><bdi>'+h.textContent.replace(/[—:].*$/,'').trim().slice(0,28)+'</bdi>';map.appendChild(a);
  if(GOT[s.id]){var g=GOT[s.id],d=document.createElement('div');d.className='pgot';
   d.innerHTML='<div class="pk"><b class="lb">💡 השורה התחתונה</b><p>'+g[0]+'</p></div><div class="pq"><p><b>בדוק את עצמך:</b> '+g[1]+'</p><button type="button">הצג תשובה</button><div class="pa">'+g[2]+'</div></div>';
   d.querySelector('button').onclick=function(){d.classList.toggle('open');this.textContent=d.classList.contains('open')?'הסתר':'הצג תשובה'};s.appendChild(d)}});
if(secs.length>2&&document.body.classList.contains('chapter')){var ct=((document.querySelector('.chaptitle')||{}).textContent||'').trim();
  var hd=document.createElement('a');hd.className='pmh';hd.href='#top';hd.innerHTML=(cn?'<b>פרק '+cn+'</b>':'')+'<bdi>'+ct+'</bdi>';
  /* the chapter name stays put; only the section list scrolls */
  var sc=document.createElement('div');sc.className='pmsc';while(map.firstChild)sc.appendChild(map.firstChild);
  var sb=document.createElement('button');sb.type='button';sb.className='pmsrch';sb.title='חיפוש באתר (Ctrl+K)';sb.setAttribute('aria-label','חיפוש באתר');
  sb.innerHTML='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';
  sb.onclick=function(){if(window.MTASearch)MTASearch.open();else{var f=document.querySelector('.mta-srch-fab');f&&f.click()}};
  map.appendChild(hd);map.appendChild(sc);map.appendChild(sb);
  document.body.insertBefore(map,document.body.firstChild);document.documentElement.classList.add('has-pmap');
  var links=[].slice.call(sc.querySelectorAll('a'));
  function upd(){var y=innerHeight*0.3,cur=-1;secs.forEach(function(s,n){if(s.getBoundingClientRect().top<y)cur=n});
   links.forEach(function(a,n){a.classList.toggle('on',n===cur);a.classList.toggle('done',n<cur)});
   if(cur>=0){var a=links[cur],ar=a.getBoundingClientRect(),sr=sc.getBoundingClientRect();if(ar.left<sr.left+20||ar.right>sr.right-20)sc.scrollLeft+=(ar.left+ar.width/2)-(sr.left+sr.width/2)}}
  addEventListener('scroll',upd,{passive:true});upd();
  /* arrows inside the chapter bar move between sections (RTL: left = next), not scroll the bar */
  sc.addEventListener('keydown',function(e){if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;e.preventDefault();
   var on=links.findIndex(function(a){return a===document.activeElement});if(on<0)on=links.findIndex(function(a){return a.classList.contains('on')});
   var n=Math.max(0,Math.min(links.length-1,on+(e.key==='ArrowLeft'?1:-1)));var a=links[n];a.focus({preventScroll:true});
   var t=document.getElementById(a.getAttribute('href').slice(1));if(t)t.scrollIntoView({behavior:'smooth',block:'start'});history.replaceState(null,'','#'+t.id)});
  links.forEach(function(a){a.addEventListener('click',function(){setTimeout(function(){a.focus({preventScroll:true})},0)})})}
 // exercise pages: question + its work side by side
 if(isEx){document.querySelectorAll('main section h3').forEach(function(h){var tq=h.nextElementSibling;if(!tq||!tq.classList.contains('taskq'))return;

  var w=document.createElement('div');w.className='pqw';var a=document.createElement('div');a.className='pqa';var b=document.createElement('div');b.className='pqb';
  h.parentNode.insertBefore(w,h);w.appendChild(a);w.appendChild(b);a.appendChild(h);a.appendChild(tq);
  while(w.nextElementSibling&&!/^H[23]$/.test(w.nextElementSibling.tagName)&&!w.nextElementSibling.classList.contains('pqw'))b.appendChild(w.nextElementSibling)})}
});
})();
/* ===== split ("two-screen") mode for exercise pages ===== */
(function(){
function esc(x){return String(x).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
var on=true;
if(!on)return;
document.addEventListener('DOMContentLoaded',function(){setTimeout(build,1100)});
function units(){var U=[];
 // generic: question = h3 + .taskq ; work = hints + solution
 document.querySelectorAll('.pqw').forEach(function(w){var a=w.querySelector('.pqa'),b=w.querySelector('.pqb');var h=a.querySelector('h3');
  var sec=w.closest('section');var grp=sec&&sec.querySelector('h2')?sec.querySelector('h2').textContent.trim():'';
  U.push({label:h?h.textContent.trim().replace(/^שאלה\s*/,''):'?',group:grp,title:h?h.textContent.trim():'',data:[a],work:[b]})});
 // SQL exercise 3 cards: tables + question on one side, query + alternatives on the other
 document.querySelectorAll('.ex3grp').forEach(function(g){var hq=g.previousElementSibling;var grp=hq&&hq.tagName==='H3'?hq.textContent.trim():'';
  g.querySelectorAll('.e3').forEach(function(c){var q=c.querySelector('.sxq'),side=c.querySelector('.srcside'),main=c.querySelector('.sxmain'),alt=c.querySelector('.e3alt');
   var t=q?q.textContent.trim():'';var lab=(t.match(/(\d+[א-ת])/)||[])[1]||t.slice(0,6);
   var e=(typeof SQLD!=='undefined'&&SQLD.EX3||[]).find(function(x){return x.id===c.id})||{};
   var HL='אבגדהוזחטי',sub=c.id&&/^e\d[a-z]$/.test(c.id)?'סעיף '+HL['abcdefghij'.indexOf(c.id[2])]:'';
   var T=(typeof SQLD!=='undefined'&&SQLD.TABLES||{})[e.db]||{};
   var SH=window.EX3SHEET||{intro:{},sub:{}},qn=c.id?c.id[1]:'',IN=SH.intro[qn];
   var bd=function(x){return esc(x).replace(/([A-Za-z][A-Za-z0-9_\-.,%' ]*[A-Za-z0-9%'])/g,'<bdi dir="ltr">$1</bdi>')};
   var intro='<div class="splintro"><div class="splqh">'+esc(grp)+'</div>'+(IN?'<p>'+bd(IN.t)+'</p><div class="splschema" dir="ltr">'+IN.s.map(function(x){var m=x.match(/^(\S+)(.*)$/);return '<div><b>'+esc(m[1])+'</b>'+esc(m[2])+'</div>'}).join('')+'</div>'+(IN.a?'<p class="splnote">'+bd(IN.a)+'</p>':''):'')+'</div>';
   var subq=SH.sub[c.id]?bd(SH.sub[c.id]):esc(t.replace(/^(תקין|הערה|תיקון)\s*/,'').replace(/^\d+[א-ת]\.?\s*/,''));
   U.push({label:lab,group:grp,title:t,sub:sub,pre:intro+'<div class="splsub"><span class="splsubn">'+sub+'</span> '+subq+'</div>',hideQ:true,data:[q,side].filter(Boolean),work:[main,alt].filter(Boolean)})})});
 return U}
function build(){
 if(!document.body.classList.contains('exw'))return;
 var U=units();if(U.length<2)return;
 var ov=document.createElement('div');ov.className='spl';ov.hidden=true;
 ov.innerHTML='<div class="splh"><b class="splt"></b><div class="spltabs"></div><button class="splx" type="button">✕ חזרה לתצוגה הרגילה</button></div>'+
  '<div class="splb"><div class="splp spld"><div class="spllab">השאלה והנתונים</div><div class="splc"></div></div><div class="splbar" title="גרור כדי לשנות רוחב"></div><div class="splp splw"><div class="spllab">הפתרון</div><div class="splc"></div></div></div>';
 document.body.appendChild(ov);
 var tabs=ov.querySelector('.spltabs'),dc=ov.querySelector('.spld .splc'),wc=ov.querySelector('.splw .splc'),cur=-1,ph=[];
 var lastG=null;U.forEach(function(u,i){if(u.group!==lastG&&lastG!==null){var s=document.createElement('span');s.className='splsep';tabs.appendChild(s)}lastG=u.group;
  var b=document.createElement('button');b.type='button';b.innerHTML='<bdi>'+u.label+'</bdi>';b.title=u.title;b.onclick=function(){show(i)};tabs.appendChild(b)});
 function chapter(){var cm=(document.querySelector('.chapmid .chapnum, .chapmid small')||{}).textContent||'';var n=((document.querySelector('.chapmid')||{}).textContent||'').match(/פרק\s*(\d+)/);var ct=(document.querySelector('.chaptitle')||{}).textContent||'';var ex=((document.querySelector('nav.seg2 a[aria-current] b')||{}).textContent||'').trim();
  return '<span class="splch">'+(n?'פרק '+n[1]+' · ':'')+esc(ct.trim())+'</span>'+(ex?' <span class="splex">'+esc(ex)+'</span>':'')}
 function park(){ov.classList.remove('xlive');document.querySelectorAll('.splhideq').forEach(function(x){x.classList.remove('splhideq')});ph.forEach(function(p){p[0].parentNode.insertBefore(p[1],p[0]);p[0].remove()});ph=[]}
 function take(el,into){var m=document.createComment('spl');el.parentNode.insertBefore(m,el);ph.push([m,el]);into.appendChild(el)}
 function show(i){park();cur=i;var u=U[i];dc.innerHTML='';if(u.pre)dc.insertAdjacentHTML('beforeend',u.pre);u.data.forEach(function(e){take(e,dc)});if(u.hideQ&&u.data[0])u.data[0].classList.add('splhideq');u.work.forEach(function(e){take(e,wc)});
  ov.querySelector('.splt').innerHTML=chapter();
  var slot=document.createElement('div');slot.className='splslot';dc.appendChild(slot);
  var xb=wc.querySelector('.xbtn');
  if(xb){var box=xb.closest('.ldbtns').nextElementSibling;if(box&&box.classList.contains('sqlx')&&box.hidden)xb.click();
   var tries=0,iv=setInterval(function(){if(cur!==i){clearInterval(iv);return}var sb=wc.querySelector('.sqlx .xsrcbox');
    if(sb&&sb.children.length){clearInterval(iv);var m=document.createComment('xsrc');sb.parentNode.insertBefore(m,sb);ph.push([m,sb]);
     slot.innerHTML='<div class="spllab2">כל הטבלאות בשאלה — מתעדכנות לפי השלב שבוחרים בצד הפתרון</div>';slot.appendChild(sb);ov.classList.add('xlive')}
    else if(++tries>60)clearInterval(iv)},100)}
  [].forEach.call(tabs.querySelectorAll('button'),function(b,k){b.classList.toggle('on',k===i)});
  dc.scrollTop=0;wc.scrollTop=0;var a=tabs.querySelectorAll('button')[i];a.scrollIntoView({block:'nearest',inline:'center'});
  wc.querySelectorAll('details.sol').forEach(function(d){d.open=true})}
 function open(i){ov.hidden=false;document.documentElement.classList.add('spl-on');show(i||0)}
 function close(){park();ov.hidden=true;document.documentElement.classList.remove('spl-on');if(U[cur]){var e=U[cur].data[0];e&&e.scrollIntoView({block:'start'})}}
 ov.querySelector('.splx').onclick=close;
 addEventListener('keydown',function(e){if(ov.hidden)return;if(e.key==='Escape')close();
  if(e.key==='ArrowLeft'&&cur<U.length-1&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName))show(cur+1);
  if(e.key==='ArrowRight'&&cur>0&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName))show(cur-1)});
 // divider drag
 var bar=ov.querySelector('.splbar'),body=ov.querySelector('.splb');
 bar.addEventListener('pointerdown',function(e){bar.setPointerCapture(e.pointerId);function mv(ev){var r=body.getBoundingClientRect();var x=(r.right-ev.clientX)/r.width*100;x=Math.max(25,Math.min(70,x));body.style.gridTemplateColumns=x+'% 10px 1fr'}
  function up(){bar.removeEventListener('pointermove',mv);bar.removeEventListener('pointerup',up)}bar.addEventListener('pointermove',mv);bar.addEventListener('pointerup',up)});
 // entry points: a button on every question + one at the top of the page
 U.forEach(function(u,i){var host=u.data[0];if(!host)return;var b=document.createElement('button');b.type='button';b.className='splgo';b.innerHTML='⇆ פתח בתצוגה מפוצלת';b.onclick=function(){open(i)};
  if(host.classList.contains('pqa')){var h=host.querySelector('h3');h.appendChild(b)}else host.appendChild(b)});
 var h=location.hash.slice(1),start=0;if(h){U.forEach(function(u,k){var d=u.data[0];if(d&&(d.id===h||(d.closest&&d.closest('#'+CSS.escape(h)))||(d.querySelector&&d.querySelector('#'+CSS.escape(h)))))start=k})}
 setTimeout(function(){open(start)},50);
 var hero=document.querySelector('.hero');if(hero){var t=document.createElement('button');t.type='button';t.className='splgo big';t.innerHTML='⇆ תצוגה מפוצלת: נתונים מצד אחד, פתרון מצד שני';t.onclick=function(){open(0)};hero.appendChild(t)}
}
})();
/* ===== ex3: one code block when the official answer and the SQLite version are the same ===== */
(function(){
var on=true;
if(!on)return;
function norm(x){return x.replace(/([a-z])-(?=[a-z])/gi,'$1_').replace(/'(\d{4})\/(\d\d)\/(\d\d)'/g,"'$1-$2-$3'")}
function toks(x){return (x.toLowerCase().match(/'[^']*'|\w+|[^\s\w]/g)||[])}
function strip(t){var i=t.indexOf(';');return i<0?t:t.slice(0,i)}
function diff(a,b){var n=a.length,m=b.length,L=[];for(var i=0;i<=n;i++){L.push(new Array(m+1).fill(0))}
 for(i=n-1;i>=0;i--)for(var j=m-1;j>=0;j--)L[i][j]=a[i]===b[j]?L[i+1][j+1]+1:Math.max(L[i+1][j],L[i][j+1]);
 var H=[],i=0,j=0,cur=null;function flush(){if(cur){H.push(cur);cur=null}}
 while(i<n||j<m){if(i<n&&j<m&&a[i]===b[j]){flush();i++;j++}
  else if(j<m&&(i>=n||L[i][j+1]>=L[i+1][j])){cur=cur||{ai:i,a:[],b:[]};cur.b.push(b[j]);j++}
  else{cur=cur||{ai:i,a:[],b:[]};cur.a.push(a[i]);i++}}
 flush();return H}
function J(t){return t.join(' ').replace(/ ([,.)]) ?/g,'$1 ').replace(/\( /g,'(').replace(/ \./g,'.').replace(/\. /g,'.').trim()}
function esc(s){return s.replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){
 document.querySelectorAll('.e3 .sxmain').forEach(function(m){
  var pres=m.querySelectorAll(':scope>pre.sqlcode');if(pres.length!==2)return;
  var card=m.closest('.e3');if(!card.querySelector('.sxq .vd.ok'))return; // a fix or a remark: the difference is the lesson, keep both
  var labs=m.querySelectorAll(':scope>.sxlab');var o=pres[0].textContent,q=pres[1].textContent;
  var subs=[];if(/[a-z]-[a-z]/i.test(o.replace(/'[^']*'/g,''))&&!/[a-z]-[a-z]/i.test(q.replace(/'[^']*'/g,'')))subs.push('בשמות העמודות <code class="xp">_</code> במקום <code class="xp">-</code>');
  if(/'\d{4}\/\d\d\/\d\d'/.test(o)&&!/'\d{4}\/\d\d\/\d\d'/.test(q))subs.push('תאריכים בפורמט <code class="xp">YYYY-MM-DD</code>');
  var A=strip(toks(norm(o))),B=strip(toks(q)),H=diff(A,B);
  if(H.length>2)return;            // a real difference: keep both versions
  var note=document.createElement('div');note.className='sxdiff';
  var h='<b>'+(H.length||subs.length?'ההבדל בין הפתרון הרשמי לגרסה שרצה ב־SQLite:':'הפתרון הרשמי זהה לגרסה שרצה ב־SQLite.')+'</b>';
  var items=subs.map(function(s){return '<li>'+s+'</li>'});
  H.forEach(function(x){var pre=A.slice(Math.max(0,x.ai-1),x.ai),post=A.slice(x.ai+x.a.length,x.ai+x.a.length+(x.a.length?0:1));
   var from=J(pre.concat(x.a).concat(x.a.length?[]:post)),to=J(pre.concat(x.b).concat(x.a.length?[]:post));
   items.push('<li><code class="xp">'+esc(from)+'</code> ← <code class="xp">'+esc(to)+'</code></li>')});
  if(items.length)h+='<ul>'+items.join('')+'</ul>';
  note.innerHTML=h;
  labs[0].textContent='הפתרון';m.classList.add('merged');labs[1].style.display='none';pres[1].style.display='none';
  pres[0].insertAdjacentElement('afterend',note);
 })},500)});
})();

/* ===== study pages: one data dock for the whole page =====
   Examples on a page share their data, so the tables live once, in a dock beside the text.
   The example in view drives the dock; an open breakdown marks the dock tables in place. */
(function(){
document.addEventListener('DOMContentLoaded',function(){setTimeout(init,1300)});
function init(){
 if(!document.body.classList.contains('chapter')||document.body.classList.contains('exw'))return;
 if(typeof SQLD==='undefined'||!window.SQLKIT)return;
 var cards=[].slice.call(document.querySelectorAll('.sqlex[data-ex], .ex.sqlstep'));if(cards.length<2)return;
 var EX={};(SQLD.EX||[]).forEach(function(e){EX[e.id]=e});
 function info(c){if(c.classList.contains('sqlstep'))return {db:'bank',sql:'select * from deposit natural join customer',q:(c.querySelector('.q')||{}).textContent||''};
  var e=EX[c.dataset.ex]||{};return {db:e.db||'bank',sql:e.sql||'',q:((c.querySelector('.sxq')||{}).textContent||e.q||'')}}
 var dock=document.createElement('aside');dock.className='dock';
 dock.innerHTML='<div class="dockh"><span class="dockt">הנתונים של הדוגמה</span><span class="dockq"></span></div><div class="docks"></div>';
 document.body.appendChild(dock);document.documentElement.classList.add('has-dock');
 var slot=dock.querySelector('.docks'),qEl=dock.querySelector('.dockq'),cur=null,park=null;
 function unpark(){if(park){park[0].parentNode.insertBefore(park[1],park[0]);park[0].remove();park=null}}
 function show(c){cur=c;unpark();var I=info(c);qEl.textContent=I.q.replace(/^(השאילתה)/,'').trim();
  var sb=c.querySelector('.sqlx:not([hidden]) .xsrcbox');
  if(sb&&sb.children.length){var m=document.createComment('dock');sb.parentNode.insertBefore(m,sb);park=[m,sb];slot.innerHTML='';slot.appendChild(sb);dock.classList.add('live')}
  else{dock.classList.remove('live');slot.innerHTML=SQLKIT.sourcesHTML(I.db,I.sql,'',false)||''}
  cards.forEach(function(x){x.classList.toggle('docked-on',x===c)})}
 function pick(){var y=innerHeight*0.35,best=null,bd=1e9;cards.forEach(function(c){var r=c.getBoundingClientRect();if(r.bottom<80||r.top>innerHeight)return;var d=r.top<=y&&r.bottom>=y?0:Math.min(Math.abs(r.top-y),Math.abs(r.bottom-y));if(d<bd){bd=d;best=c}});
  if(best&&best!==cur)show(best)}
 addEventListener('scroll',function(){if(!pick.t)pick.t=requestAnimationFrame(function(){pick.t=0;pick()})},{passive:true});
 // opening a breakdown hands its tables to the dock
 document.addEventListener('click',function(e){var b=e.target.closest('.xbtn');if(!b)return;var c=b.closest('.sqlex, .ex.sqlstep');if(!c)return;
  var n=0,iv=setInterval(function(){var sb=c.querySelector('.sqlx:not([hidden]) .xsrcbox');if((sb&&sb.children.length)||++n>50){clearInterval(iv);show(c)}else if(c.querySelector('.sqlx[hidden]')){clearInterval(iv);show(c)}},100)},true);
 pick();if(!cur)show(cards[0]);
}
})();
