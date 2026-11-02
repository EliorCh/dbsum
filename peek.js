/* =================== "SQL enrichment" pop-out windows =================== */
(function(){
if(typeof PEEK==='undefined'||!window.SQLKIT)return;
const K=window.SQLKIT;
const TARGETS=[
  ...[0,1,2,3,4,5,6,7,8].map(k=>['op'+k,`#op-${k} .opex`]),
  ['wJoin','#w-join .ex'],['wRename','#w-rename .ex'],['wMax','#w-max .ex'],['wDiv','#w-div .ex'],
  ...[1,2,3,4,5,6].map(k=>['p'+k,`.ex.prac[data-q="p${k}"]`]),
  ['clinicDDL','#er2rel .ex.mapx'],
  ['toysDDL','#toys .ex'],['familyDDL','#family .ex'],['weakDDL','#weak .ex'],['clinicDDL','#clinic .ex']];
TARGETS.forEach(([key,sel])=>{
  const host=document.querySelector(sel),p=PEEK[key];if(!host||!p)return;
  const d=document.createElement('details');d.className='sqlpeek';
  d.innerHTML=`<summary><span class="pk">העשרה</span> ${p.ddl?'איך זה נראה ב־SQL: הגדרת הטבלאות':'אותה שאילתה ב־SQL'}</summary>
    <div class="peekbody">${K.withSide(`<pre class="sqlcode">${K.hl(p.show)}</pre>${p.note?`<p class="sxnote">${capHTML(p.note)}</p>`:''}
    <div class="sxres">${p.ddl?'':K.resultHTML(p.res,'התוצאה ב־SQL')}</div>
    <div class="ldbtns"><button class="btn ghost editBtn" type="button">${p.ddl?'הרץ ובדוק שההגדרות חוקיות':'ערוך והרץ'}</button><a class="btn ghost" href="sql.html">לעמוד SQL</a></div><div class="sxed" hidden></div>`,p.ddl?'':K.sourcesHTML(p.db,p.show))}</div>`;
  host.append(d);
  const b=d.querySelector('.editBtn'),ed=d.querySelector('.sxed');let made=false;
  b.onclick=()=>{ed.hidden=!ed.hidden;if(!made){made=true;const h=K.editor(ed,p.db,p.sql);if(p.ddl)h.go();}};
});
})();
