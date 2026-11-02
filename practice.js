/* =================== practice assignments page =================== */
(function(){
if(typeof MP==='undefined')return;
/* ---- ER solution diagrams ---- */
SPECS.cinemaER={w:1060,h:910,label:'בתי קולנוע',
  entities:[
    {id:'cin',t:'בית קולנוע',x:160,y:110,w:120,attrs:[['שם','k',70,30],['כתובת',undefined,170,25],['עיר',undefined,265,30]]},
    {id:'hall',t:'אולם',x:160,y:380,weak:true,attrs:[['מס׳ אולם','p',75,480],['מושבים',undefined,210,490]]},
    {id:'scr',t:'הקרנה',x:520,y:380,attrs:[['מס׳ הקרנה','k',385,285],['תאריך',undefined,480,262],['שעה',undefined,575,262],['מחיר',undefined,665,290]]},
    {id:'mov',t:'סרט',x:870,y:380,attrs:[['קוד','k',790,285],['שם',undefined,880,268],['אורך',undefined,975,295]]},
    {id:'gen',t:'ז׳אנר',x:870,y:650,attrs:[['שם ז׳אנר','k',870,735]]},
    {id:'tic',t:'כרטיס',x:520,y:615,weak:true,attrs:[['שורה','p',375,590],['מושב','p',375,660]]},
    {id:'cus',t:'לקוח',x:520,y:835,attrs:[['ת״ז','k',375,835],['שם',undefined,665,805],['טלפון',undefined,665,870]]}],
  rels:[
    {t:'כולל',x:160,y:245,ident:true,ends:[{e:'cin',c:'1'},{e:'hall',c:'N'}]},
    {t:'מוקרן_ב',x:340,y:380,ends:[{e:'hall',c:'1'},{e:'scr',c:'N'}]},
    {t:'של',x:700,y:380,ends:[{e:'scr',c:'N'},{e:'mov',c:'1'}]},
    {t:'משתייך',x:870,y:515,ends:[{e:'mov',c:'M'},{e:'gen',c:'N'}]},
    {t:'עבור',x:520,y:497,ident:true,ends:[{e:'scr',c:'1'},{e:'tic',c:'N'}]},
    {t:'רוכש',x:520,y:725,ends:[{e:'tic',c:'N'},{e:'cus',c:'1'}]}]};
SPECS.socialER={w:960,h:470,label:'רשת חברתית',
  entities:[
    {id:'u',t:'משתמש',x:440,y:260,w:150,attrs:[['שם משתמש','k',330,400],['שם מלא',undefined,445,430],['הצטרפות',undefined,560,400]]},
    {id:'f',t:'תחום',x:760,y:90,attrs:[['שם תחום','k',900,90]]}],
  rels:[
    {t:'עוקב',x:150,y:260,ends:[{e:'u',c:'עוקב M',oy:-12,roy:-12,lx:310,ly:228},{e:'u',c:'נעקב N',oy:12,roy:12,lx:310,ly:294}],attrs:[['מתאריך',undefined,150,150]]},
    {t:'ממליץ',x:760,y:260,ends:[{e:'u',c:'ממליץ',oy:-12,roy:-12,lx:575,ly:228},{e:'u',c:'מומלץ',oy:12,roy:12,lx:575,ly:294},{e:'f',c:''}],attrs:[['ציון',undefined,900,260]]}]};
SPECS.mnBefore={w:780,h:200,label:'לפני',
  entities:[{id:'v',t:'ביקור',x:640,y:130},{id:'m',t:'תרופה',x:140,y:130}],
  rels:[{t:'מרשם',x:390,y:130,ends:[{e:'v',c:'M'},{e:'m',c:'N'}],attrs:[['כמות יומית',undefined,310,40],['מס׳ ימים',undefined,470,40]]}]};
SPECS.mnAfter={w:940,h:220,label:'אחרי',
  entities:[{id:'v',t:'ביקור',x:820,y:150},{id:'pl',t:'שורת מרשם',x:470,y:150,weak:true,w:130,attrs:[['כמות יומית',undefined,410,50],['מס׳ ימים',undefined,530,50]]},{id:'m',t:'תרופה',x:120,y:150}],
  rels:[{t:'כולל',x:650,y:150,ident:true,ends:[{e:'v',c:'1'},{e:'pl',c:'N'}]},{t:'של',x:290,y:150,ident:true,ends:[{e:'pl',c:'N'},{e:'m',c:'1'}]}]};
SPECS.hotelER={w:1120,h:250,label:'מלונות',
  entities:[
    {id:'g',t:'Guest',x:150,y:170,attrs:[['guest-id','k'],['name'],['phone']],side:'up',dy:85,sp:95},
    {id:'r',t:'Room',x:605,y:170,weak:true,attrs:[['room-no','p'],['type'],['price']],side:'up',dy:85,sp:95},
    {id:'h',t:'Hotel',x:990,y:170,attrs:[['hotel-name','k',905,80],['city',undefined,1005,65],['stars',undefined,1080,85]]}],
  rels:[
    {t:'stays',x:375,y:170,ends:[{e:'g',c:'M'},{e:'r',c:'N'}],attrs:[['check-in',undefined,330,62],['nights',undefined,430,62]]},
    {t:'in',x:810,y:170,ident:true,ends:[{e:'r',c:'N'},{e:'h',c:'1'}]}]};
renderAll();
document.querySelectorAll('.ntbar:not([data-for])').forEach(b=>{const f=b.parentElement.querySelector('[data-spec]');if(f&&f.id)b.dataset.for=f.id;});

/* ---- algebra ladders (assignment 2, Q3): sample tables beside every sub-question ---- */
document.querySelectorAll('.ladder[data-check^="m3"]').forEach(l=>{if(l.querySelector('aside.srcside'))return;
  l.querySelector('.lq').insertAdjacentHTML('afterend',relSide(UNI,Object.keys(UNI),'נתוני הדוגמה','strip'));});
/* ---- sample data ---- */
const ud=document.getElementById('uniData');
if(ud)ud.innerHTML=Object.keys(UNI).map(n=>relTable(UNI[n],null,{label:n,noprov:1})).join('');
const K=window.SQLKIT;
const hd=document.getElementById('hotelData');
if(hd&&K)hd.innerHTML=Object.keys(MP.tables.hotel).map(n=>K.resultHTML(MP.tables.hotel[n],n)).join('');

/* ---- SQL tasks with auto-check ---- */
if(!K)return;
const norm=r=>r.rows.map(x=>JSON.stringify(x.map(v=>typeof v==='number'?Math.round(v*1000)/1000:v))).sort();
const TI=Object.fromEntries(MP.tasks.map(t=>[t.id,t]));
document.querySelectorAll('.mtask[data-task]').forEach(el=>{
  const t=TI[el.dataset.task];if(!t)return;
  const what=t.check?(/view/i.test(t.sql)?'התצפית אחרי הפקודה שלך':'הטבלה אחרי הפקודה שלך'):'התוצאה שלך';
  el.innerHTML=`<div class="lq">${capHTML(t.q)}</div>`+K.withSide(`
    <ol class="hints">${t.hints.map(h=>`<li>${capHTML(h)}</li>`).join('')}</ol>
    <textarea dir="ltr" spellcheck="false" rows="5" aria-label="השאילתה שלך">-- כתוב כאן את הפתרון שלך\n</textarea>
    <div class="ldbtns"><button class="btn runBtn" type="button">בדוק</button><button class="btn ghost hintBtn2" type="button">רמז</button><button class="btn ghost expBtn" type="button">תוצאה צפויה</button><span class="kbd">Ctrl+Enter</span></div>
    <div class="sqlout"></div><div class="pexp" hidden></div>
    <details class="sol"><summary>פתרון</summary><div class="sxlab">בתחביר הקורס</div><pre class="sqlcode course">${K.hl(t.course)}</pre>
      ${t.course!==t.sql?`<div class="sxlab">גרסה שרצה ב־SQLite</div><pre class="sqlcode">${K.hl(t.sql)}</pre>`:''}</details>`,K.sourcesHTML(t.db,'',t.check?'הטבלאות לפני הפקודה':'נתוני הדוגמה',true));
  const hints=[...el.querySelectorAll('.hints li')];let n=0;hints.forEach(h=>h.hidden=true);
  const hb=el.querySelector('.hintBtn2');const upd=()=>{hb.textContent=n<hints.length?`רמז ${n+1} מתוך ${hints.length}`:'כל הרמזים פתוחים';hb.disabled=n>=hints.length;};upd();
  hb.onclick=()=>{if(n<hints.length){hints[n].hidden=false;n++;upd();}};
  const eb=el.querySelector('.expBtn'),ex=el.querySelector('.pexp');
  eb.onclick=()=>{ex.hidden=!ex.hidden;eb.textContent=ex.hidden?'תוצאה צפויה':'הסתר';if(!ex.innerHTML)ex.innerHTML=K.resultHTML(t.expected,t.check?'כך צריכה להיראות אחרי הפקודה':'תוצאה צפויה');};
  const ta=el.querySelector('textarea'),out=el.querySelector('.sqlout');
  const go=async()=>{const code=ta.value.replace(/--[^\n]*/g,'').trim();if(!code){out.innerHTML='<div class="sqlmsg">כתוב שאילתה קודם.</div>';return;}
    out.innerHTML='<div class="sqlmsg">בודק…</div>';
    try{const r=await K.runLive(t.db,code+(t.check?';\n'+t.check:''));
      if(r.error){out.innerHTML=K.resultHTML(r);return;}
      const ok=JSON.stringify(norm(r))===JSON.stringify(norm(t.expected));
      out.innerHTML=`<div class="verdict ${ok?'good':'bad'}">${ok?'נכון ✓':`עדיין לא: אצלך ${r.rows.length} שורות, ובתוצאה הצפויה ${t.expected.rows.length}.${r.rows.length===t.expected.rows.length?' מספר השורות זהה — בדוק את הערכים.':''}`}</div>${K.resultHTML(r,what)}`;
    }catch(e){out.innerHTML=`<div class="sqlerr">${esc(e.message)}</div>`;}};
  el.querySelector('.runBtn').onclick=go;ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();go();}});
});
})();
