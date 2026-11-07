/* exercise 2: full solution diagram for Q1 + interactive "mark the text" tagger */
(function(){
if(typeof SPECS!=='undefined'){
SPECS.uniER={w:1160,h:780,label:'משרד רישום',
  entities:[
    {id:'crs',t:'קורס',x:340,y:330,attrs:[['מס׳ קורס','k',260,220],['שם',undefined,400,210]]},
    {id:'grp',t:'קבוצה',x:640,y:330,weak:true,attrs:[['שנה','p',560,430],['מס׳ קבוצה','p',740,440]]},
    {id:'mtg',t:'מפגש',x:640,y:80,weak:true,w:110,attrs:[['יום','p',480,60],['שעה','p',800,60]]},
    {id:'lec',t:'מרצה',x:1010,y:330,attrs:[['ת״ז','k',930,210],['שם',undefined,1060,200],['תואר',undefined,1100,270],['כתובת',undefined,1080,430]]},
    {id:'stu',t:'סטודנט',x:640,y:690,attrs:[['מס׳ סטודנט','k',450,740],['שם',undefined,470,630],['כתובת',undefined,820,630],['טלפון',undefined,830,740]]}],
  rels:[
    {t:'של',x:490,y:330,ident:true,ends:[{e:'crs',c:'1'},{e:'grp',c:'N'}]},
    {t:'נפגשת',x:640,y:205,ident:true,ends:[{e:'grp',c:'1'},{e:'mtg',c:'N'}]},
    {t:'מלמד',x:825,y:330,ends:[{e:'grp',c:'N'},{e:'lec',c:'1'}]},
    {t:'רשום',x:640,y:540,ends:[{e:'grp',c:'M'},{e:'stu',c:'N'}],attrs:[['ציון',undefined,800,540]]},
    {t:'קדם',x:110,y:330,ends:[{e:'crs',c:'דורש M',oy:-12,roy:-12,lx:215,ly:300},{e:'crs',c:'נדרש N',oy:12,roy:12,lx:215,ly:366}]}]};
if(typeof renderAll==='function')renderAll();}

/* tagger: click a category, then phrases in the text */
const CAT={e:['ישות','#2457C5'],a:['תכונה','#12806C'],k:['מפתח','#C0392B'],r:['קשר','#B86A00']};
document.querySelectorAll('.tagger').forEach(T=>{
  const toks=[...T.querySelectorAll('.tg')];let cur='e';
  T.querySelector('.tgbar').innerHTML=Object.entries(CAT).map(([k,[n,c]])=>`<button type="button" class="tgcat" data-c="${k}" style="--c:${c}">${n}</button>`).join('')+`<button type="button" class="tgcat" data-c="">ניקוי</button><span class="tgsep"></span><button type="button" class="btn tgcheck">בדוק</button><button type="button" class="btn ghost tgshow">הצג תשובה</button><button type="button" class="btn ghost tgreset">התחל מחדש</button>`;
  const paint=()=>{T.querySelectorAll('.tgcat').forEach(b=>b.setAttribute('aria-pressed',b.dataset.c===cur));toks.forEach(t=>{t.dataset.mine=t.dataset.mine||'';t.className='tg'+(t.dataset.mine?' m-'+t.dataset.mine:'');});};
  T.querySelector('.tgbar').addEventListener('click',e=>{const b=e.target.closest('.tgcat');if(b){cur=b.dataset.c;paint();}});
  toks.forEach(t=>t.addEventListener('click',()=>{t.dataset.mine=t.dataset.mine===cur?'':cur;paint();T.querySelector('.tgout').innerHTML='';}));
  const out=T.querySelector('.tgout');
  const report=(show)=>{let ok=0,wrong=0,miss=0,rows='';
    toks.forEach(t=>{const want=t.dataset.k||'',mine=show?want:t.dataset.mine;if(show)t.dataset.mine=want;
      const good=mine===want;if(want&&good)ok++;else if(mine&&!good)wrong++;else if(want&&!mine)miss++;
      t.classList.add(good?(want?'ok':'n'):(mine?'bad':'miss'));
      if(t.dataset.why&&(show||!good))rows+=`<tr class="${good?'':'gone'}"><td><b>${t.textContent}</b></td><td>${want?CAT[want][0]:'לא מסמנים'}</td><td>${t.dataset.why}</td></tr>`;});
    out.innerHTML=(show?'':`<div class="verdict ${wrong||miss?'bad':'good'}">${wrong||miss?`${ok} נכונים · ${wrong} שגויים · ${miss} חסרים`:'הכל נכון ✓'}</div>`)+`<div class="tbl"><table><tr><th>בטקסט</th><th>מה זה</th><th>למה</th></tr>${rows}</table></div>`;};
  T.querySelector('.tgcheck').onclick=()=>{paint();report(false);};
  T.querySelector('.tgshow').onclick=()=>{paint();report(true);paint();toks.forEach(t=>t.classList.add('ok'));};
  T.querySelector('.tgreset').onclick=()=>{toks.forEach(t=>t.dataset.mine='');out.innerHTML='';paint();};
  paint();});
})();
