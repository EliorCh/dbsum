
/* ---------- ER diagram renderer ---------- */
const NS='http://www.w3.org/2000/svg';
const chars=s=>[...s].length;
const tw=(s,fs)=>chars(s)*fs*0.56;
function T(x,y,s,cls){return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" direction="rtl"${cls?` class="${cls}"`:''}>${s}</text>`;}
function Ln(x1,y1,x2,y2,c){return `<line class="ln ${c||''}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;}
function er(spec){
  const E={};let L='',S='',M='';
  const show=spec.show||'arctk', nt=spec.nt||'chen', has=c=>show.includes(c);
  const fr=c=>(spec.prev!==undefined&&!spec.prev.includes(c))?' fresh':'';
  (spec.entities||[]).forEach(e=>{e.w=e.w||Math.max(92,tw(e.t,15)+36);e.h=46;E[e.id]=e;});
  function drawAttrs(o,list,side,cat){
    const f=fr(cat);
    const n=list.length,sp=o.sp||106,dy=o.dy||82;
    list.forEach((a,i)=>{
      let [name,flag,ax,ay]=a;
      if(ax===undefined){ax=o.x+(i-(n-1)/2)*sp;ay=o.y+(side==='down'?dy:-dy);}
      const w=tw(name,13),rx=Math.max(40,w/2+15),ry=19;
      L+=Ln(ax,ay,o.x,o.y,'al'+f);
      let u='';
      const fk=f?'':fr('k');
      if(has('k')&&flag==='k')u=`<line class="${fk}" x1="${ax-w/2}" y1="${ay+10}" x2="${ax+w/2}" y2="${ay+10}"/>`;
      if(has('k')&&flag==='p')u=`<line class="${fk}" x1="${ax-w/2}" y1="${ay+10}" x2="${ax+w/2}" y2="${ay+10}" stroke-dasharray="4 3"/>`;
      S+=`<g class="att${f}"><ellipse cx="${ax}" cy="${ay}" rx="${rx}" ry="${ry}"/>${T(ax,ay-1,name)}${u}</g>`;
    });
  }
  if(has('a'))(spec.entities||[]).forEach(e=>{if(e.attrs)drawAttrs(e,e.attrs,e.side,'a');});
  if(has('r'))(spec.rels||[]).forEach(r=>{
    const dw=Math.max(50,tw(r.t,14)/2+30),dh=30;
    r.ends.forEach(en=>{
      const e=E[en.e],px=e.x+(en.o||0),py=e.y+(en.oy||0);
      const rx=r.x+(en.ro||0),ry=r.y+(en.roy||0);L+=Ln(px,py,rx,ry,fr('r'));
      const dx=rx-px,dy=ry-py,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len;
      const tx=ux>0?(e.x+e.w/2-px)/ux:ux<0?(e.x-e.w/2-px)/ux:1e9;
      const ty=uy>0?(e.y+e.h/2-py)/uy:uy<0?(e.y-e.h/2-py)/uy:1e9;
      const t=Math.min(tx,ty),sd=en.s||1,c=en.c||'';
      const ex=px+ux*t,ey=py+uy*t,qx=-uy,qy=ux;
      const role=c.replace(/\s*[1NM]$/,''), one=/1$/.test(c), many=/[NM]$/.test(c);
      const lab=nt==='chen'?c:role;
      const off=11+Math.abs(uy)*(lab?tw(lab,14)/2:0);
      const lx=px+ux*(t+15)-uy*off*sd,ly=py+uy*(t+15)+ux*off*sd;
      if(!has('c'))return;
      const fc=fr('r')||fr('c');
      if(nt==='chen'){if(c)S+=T(en.lx??lx,en.ly??ly,c,'card'+fc);}
      else{
        if(role)S+=T(en.lx??(px+ux*(t+30)-uy*off*sd),en.ly??(py+uy*(t+30)+ux*off*sd),role,'card'+fc);
        if(nt==='arrow'&&one){
          const bx=ex+ux*14,by=ey+uy*14;
          M+=`<polygon class="mk${fc}" points="${ex},${ey} ${bx+qx*7},${by+qy*7} ${bx-qx*7},${by-qy*7}"/>`;
        }
        if(nt==='crow'){
          if(many){const cx=ex+ux*18,cy=ey+uy*18;
            M+=`<line class="mk${fc}" x1="${cx}" y1="${cy}" x2="${ex+qx*11}" y2="${ey+qy*11}"/><line class="mk${fc}" x1="${cx}" y1="${cy}" x2="${ex}" y2="${ey}"/><line class="mk${fc}" x1="${cx}" y1="${cy}" x2="${ex-qx*11}" y2="${ey-qy*11}"/>`;}
          else if(one){const bx=ex+ux*10,by=ey+uy*10;
            M+=`<line class="mk${fc}" x1="${bx+qx*9}" y1="${by+qy*9}" x2="${bx-qx*9}" y2="${by-qy*9}"/>`;}
        }
      }
    });
    if(r.attrs&&has('t'))drawAttrs(r,r.attrs,r.side,'t');
    const pts=(k)=>`${r.x},${r.y-dh*k} ${r.x+dw*k},${r.y} ${r.x},${r.y+dh*k} ${r.x-dw*k},${r.y}`;
    S+=`<g class="rel${fr('r')}"><polygon points="${pts(1)}"/>${r.ident?`<polygon points="${pts(0.8)}"/>`:''}${T(r.x,r.y,r.t)}</g>`;
  });
  (spec.entities||[]).forEach(e=>{
    S+=`<g class="ent"><rect x="${e.x-e.w/2}" y="${e.y-e.h/2}" width="${e.w}" height="${e.h}" rx="3"/>${e.weak?`<rect x="${e.x-e.w/2+5}" y="${e.y-e.h/2+5}" width="${e.w-10}" height="${e.h-10}" rx="2"/>`:''}${T(e.x,e.y,e.t)}</g>`;
  });
  (spec.texts||[]).forEach(t=>{S+=`<text x="${t[0]}" y="${t[1]}" text-anchor="middle" direction="rtl" style="font-size:13px;fill:var(--muted)">${t[2]}</text>`;});
  return `<svg xmlns="${NS}" viewBox="0 0 ${spec.w} ${spec.h}" width="${spec.w}" height="${spec.h}" style="max-width:${spec.w}px" role="img" aria-label="${spec.label||'דיאגרמת ER'}">${spec.pre||''}${L}${S}${M}${spec.extra||''}</svg>`;
}
const SPECS={};
function put(id,spec){const el=document.getElementById(id);if(el)el.innerHTML=er(spec);}
function renderAll(){document.querySelectorAll('div[data-spec]:not(.step)').forEach(el=>{const sp=SPECS[el.dataset.spec];if(sp)el.innerHTML=er({...sp,show:el.dataset.show||'arctk',nt:el.dataset.nt||'chen'});});}

/* legend */
put('legendSvg',{w:760,h:250,label:'מקרא',
  entities:[
    {id:'a',t:'טיפוס ישויות',x:640,y:60},
    {id:'b',t:'ישות חלשה',x:640,y:180,weak:true}
  ],
  rels:[
    {t:'טיפוס קשרים',x:420,y:60,ends:[]},
    {t:'קשר מזהה',x:420,y:180,ident:true,ends:[]}
  ],
  texts:[]
});
(function(){ // add attribute samples to legend
  const el=document.getElementById('legendSvg');if(!el)return;const svg=el.querySelector('svg');
  const g=(x,y,n,f)=>{const w=tw(n,13);let u='';if(f==='k')u=`<line x1="${x-w/2}" y1="${y+10}" x2="${x+w/2}" y2="${y+10}"/>`;if(f==='p')u=`<line x1="${x-w/2}" y1="${y+10}" x2="${x+w/2}" y2="${y+10}" stroke-dasharray="4 3"/>`;return `<g class="att"><ellipse cx="${x}" cy="${y}" rx="${Math.max(40,w/2+15)}" ry="19"/>${T(x,y-1,n)}${u}</g>`;};
  svg.insertAdjacentHTML('beforeend',g(170,40,'תכונה')+g(170,110,'מפתח ראשי','k')+g(170,180,'מפתח חלקי','p')
   +`<text x="170" y="228" text-anchor="middle" direction="rtl" style="font-size:12px;fill:var(--muted)">קו רציף = מפתח, מקווקו = מפתח חלקי</text>`);
})();

/* toy store */
SPECS['toys']={w:820,h:520,label:'חנות צעצועים',
  entities:[
    {id:'emp',t:'עובד',x:205,y:160,attrs:[['מס׳ עובד','k'],['שם'],['כתובת']],side:'up',dy:90},
    {id:'dep',t:'מחלקה',x:560,y:160,attrs:[['שם מחלקה','k',720,90]]},
    {id:'itm',t:'פריט',x:560,y:390,attrs:[['מס׳ פריט','k'],['שם'],['מחיר'],['מס׳ דגם']],side:'down',dy:85,sp:100},
    {id:'man',t:'יצרן',x:180,y:390,attrs:[['שם יצרן','k'],['כתובת']],side:'down',dy:85}
  ],
  rels:[
    {t:'שייך',x:385,y:110,ends:[{e:'emp',c:'N',s:-1},{e:'dep',c:'1'}]},
    {t:'מנהל',x:385,y:220,ends:[{e:'emp',c:'1',s:1},{e:'dep',c:'1',s:-1}]},
    {t:'נמכר_ב',x:560,y:275,ends:[{e:'dep',c:'1'},{e:'itm',c:'N'}]},
    {t:'מספק',x:360,y:390,ends:[{e:'man',c:'1'},{e:'itm',c:'N'}]}
  ]};

/* family */
SPECS['fam']={w:760,h:480,label:'אבהות אימהות ונישואין',
  entities:[{id:'p',t:'אדם',x:420,y:240,w:170,attrs:[['ת״ז','k',190,170],['שם',undefined,190,240],['מין',undefined,190,310]]}],
  rels:[
    {t:'נישואין',x:420,y:75,ends:[{e:'p',c:'בעל 1',o:-30,ro:-30,s:-1},{e:'p',c:'אישה 1',o:30,ro:30,s:1}],attrs:[['תאריך נישואין',undefined,630,75]]},
    {t:'אבהות',x:290,y:410,ends:[{e:'p',c:'אב 1',o:-70,ro:-30,lx:295,ly:300},{e:'p',c:'ילד N',o:-30,ro:15,lx:385,ly:330}]},
    {t:'אימהות',x:570,y:410,ends:[{e:'p',c:'אם 1',o:70,ro:30,lx:550,ly:300},{e:'p',c:'ילד N',o:30,ro:-15,lx:465,ly:330}]}
  ]};

/* weak */
SPECS['weak1']={w:800,h:230,label:'ישות חלשה',
  entities:[
    {id:'l',t:'הלוואה',x:650,y:160,attrs:[['מס׳ הלוואה','k'],['סכום']],side:'up',dy:90,sp:120},
    {id:'p',t:'תשלום',x:210,y:160,weak:true,w:110,attrs:[['מס׳ תשלום','p'],['תאריך'],['סכום תשלום']],side:'up',dy:90,sp:115}
  ],
  rels:[{t:'תשלום_של',x:430,y:160,ident:true,ends:[{e:'l',c:'1'},{e:'p',c:'N'}]}]};
SPECS['weak2']={w:800,h:230,label:'ישות חזקה',
  entities:[
    {id:'l',t:'הלוואה',x:650,y:160,attrs:[['מס׳ הלוואה','k'],['סכום']],side:'up',dy:90,sp:120},
    {id:'p',t:'תשלום',x:245,y:160,attrs:[['מס׳ הלוואה','k'],['מס׳ תשלום','k'],['תאריך'],['סכום תשלום']],side:'up',dy:90,sp:108}
  ],
  rels:[{t:'תשלום_של',x:450,y:160,ends:[{e:'l',c:'1'},{e:'p',c:'N'}]}]};

/* clinic */
SPECS['clinic']={w:1110,h:690,label:'מרפאה',
  entities:[
    {id:'doc',t:'רופא',x:300,y:150,attrs:[['מס׳ זיהוי','k'],['שם'],['כתובת'],['טלפון'],['מס׳ רישיון']],side:'up',dy:88,sp:96},
    {id:'spc',t:'התמחות',x:110,y:410,attrs:[['שם תחום','k',110,495]]},
    {id:'shf',t:'שיבוץ',x:330,y:460,weak:true,w:100,attrs:[['יום','p',230,555],['שעת התחלה','p',340,600],['שעת סיום',undefined,455,555]]},
    {id:'vis',t:'ביקור',x:740,y:300,attrs:[['מס׳ ביקור','k',645,205],['תאריך',undefined,745,195],['אבחנה',undefined,845,205]]},
    {id:'pat',t:'חולה',x:1000,y:300,attrs:[['ת״ז','k',945,215],['שם',undefined,1060,215],['כתובת',undefined,945,385],['טלפון',undefined,1060,385]]},
    {id:'med',t:'תרופה',x:600,y:560,attrs:[['שם תרופה','k',600,640]]},
    {id:'tst',t:'בדיקה',x:880,y:560,attrs:[['קוד','k',780,640],['שם בדיקה',undefined,880,650],['מקום',undefined,985,640]]}
  ],
  rels:[
    {t:'מתמחה',x:120,y:280,ends:[{e:'doc',c:'M'},{e:'spc',c:'N'}]},
    {t:'משובץ',x:330,y:320,ident:true,ends:[{e:'doc',c:'1'},{e:'shf',c:'N'}]},
    {t:'טיפל',x:520,y:225,ends:[{e:'doc',c:'1'},{e:'vis',c:'N'}]},
    {t:'של',x:870,y:300,ends:[{e:'vis',c:'N'},{e:'pat',c:'1'}]},
    {t:'מרשם',x:600,y:420,ends:[{e:'vis',c:'M',s:-1},{e:'med',c:'N'}],attrs:[['כמות יומית',undefined,470,385],['מס׳ ימים',undefined,470,455]]},
    {t:'הפניה',x:880,y:420,ends:[{e:'vis',c:'M'},{e:'tst',c:'N'}],attrs:[['מועד אחרון',undefined,1050,440]]}
  ]};

/* library */
SPECS['lib']={w:900,h:520,label:'ספרייה',
  entities:[
    {id:'bk',t:'ספר',x:250,y:170,attrs:[['ISBN','k'],['כותרת'],['שנה']],side:'up',dy:85},
    {id:'cp',t:'עותק',x:650,y:170,weak:true,attrs:[['מס׳ עותק','p'],['מצב']],side:'up',dy:85,sp:115},
    {id:'au',t:'מחבר',x:250,y:410,attrs:[['מס׳ מחבר','k'],['שם']],side:'down',dy:80,sp:115},
    {id:'mb',t:'מנוי',x:650,y:410,attrs:[['מס׳ מנוי','k'],['שם'],['טלפון']],side:'down',dy:80}
  ],
  rels:[
    {t:'יש_עותק',x:450,y:170,ident:true,ends:[{e:'bk',c:'1'},{e:'cp',c:'N'}]},
    {t:'כתב',x:250,y:290,ends:[{e:'bk',c:'M'},{e:'au',c:'N'}]},
    {t:'מושאל',x:650,y:290,ends:[{e:'cp',c:'N'},{e:'mb',c:'1'}],attrs:[['תאריך השאלה',undefined,820,290]]}
  ]};


/* family — where the traditional model breaks */
SPECS.famBreak={...SPECS.fam,label:'הנחות במודל',
  extra:'<g fill="none" stroke="var(--key)" stroke-width="2.5"><ellipse cx="295" cy="300" rx="30" ry="16"/><ellipse cx="550" cy="300" rx="30" ry="16"/><ellipse cx="358" cy="202" rx="34" ry="16"/><ellipse cx="485" cy="202" rx="38" ry="16"/><ellipse cx="190" cy="310" rx="48" ry="26"/></g>'};
/* family — inclusive model */
SPECS.famInc={w:800,h:480,label:'מודל כוללני',
  entities:[{id:'p',t:'אדם',x:420,y:240,w:170,attrs:[['ת״ז','k',190,170],['שם',undefined,190,240],['מגדר',undefined,190,310]]}],
  rels:[
    {t:'נישואין',x:420,y:75,ends:[{e:'p',c:'בן/בת זוג 1',o:-30,ro:-30,lx:328,ly:180},{e:'p',c:'בן/בת זוג 1',o:30,ro:30,lx:512,ly:180}],attrs:[['תאריך נישואין',undefined,630,75]]},
    {t:'הורות',x:420,y:410,ends:[{e:'p',c:'הורה M',o:-45,ro:-30,lx:345,ly:320},{e:'p',c:'ילד N',o:45,ro:30,lx:495,ly:320}],attrs:[['תפקיד',undefined,620,385],['סוג הורות',undefined,620,445]]}
  ]};
SPECS.famMini={w:520,h:200,label:'קשר רקורסיבי',
  entities:[{id:'p',t:'אדם',x:380,y:100,w:120}],
  rels:[{t:'אבהות',x:140,y:100,ends:[{e:'p',c:'אב 1',oy:-12,roy:-12,lx:290,ly:72},{e:'p',c:'ילד N',oy:12,roy:12,lx:290,ly:128}]}],
  extra:''};
/* visit: wrong vs right */
SPECS.visWrong={w:820,h:330,label:'שגוי',
  entities:[{id:'d',t:'רופא',x:680,y:110},{id:'p',t:'חולה',x:140,y:110},{id:'m',t:'תרופה',x:410,y:290}],
  rels:[{t:'ביקר',x:410,y:110,ends:[{e:'d',c:'M'},{e:'p',c:'N'}],attrs:[['תאריך',undefined,340,30],['אבחנה',undefined,480,30]]}],
  extra:'<line class="bad" x1="410" y1="140" x2="410" y2="267"/><text class="badx" x="440" y="205" text-anchor="middle" dominant-baseline="central">✗</text>'};
SPECS.visRight={w:920,h:330,label:'נכון',
  entities:[{id:'d',t:'רופא',x:800,y:110},{id:'v',t:'ביקור',x:460,y:110,attrs:[['תאריך',undefined,400,30],['אבחנה',undefined,520,30]]},{id:'p',t:'חולה',x:110,y:110},{id:'m',t:'תרופה',x:460,y:290}],
  rels:[
    {t:'טיפל',x:630,y:110,ends:[{e:'d',c:'1'},{e:'v',c:'N'}]},
    {t:'של',x:285,y:110,ends:[{e:'v',c:'N'},{e:'p',c:'1'}]},
    {t:'מרשם',x:460,y:200,ends:[{e:'v',c:'M',s:-1},{e:'m',c:'N',s:-1}]}
  ]};


/* ---- part B specs ---- */
SPECS.bankER={w:820,h:420,label:'מערכת הבנק',
  entities:[{id:'cu',t:'customer',x:180,y:230,w:120,attrs:[['name',undefined,90,150],['street',undefined,180,120],['city',undefined,270,150]]},
            {id:'br',t:'branch',x:640,y:230,w:120,attrs:[['name',undefined,550,150],['city',undefined,640,120],['assets',undefined,730,150]]}],
  rels:[{t:'deposit',x:410,y:150,ends:[{e:'cu'},{e:'br'}],attrs:[['number',undefined,350,60],['balance',undefined,470,60]]},
        {t:'borrow',x:410,y:320,ends:[{e:'cu'},{e:'br'}],attrs:[['number',undefined,350,395],['amount',undefined,470,395]]}]};
SPECS.ex2ER={w:1040,h:230,label:'תרגיל 2 שאלה 2',
  entities:[{id:'pe',t:'Person',x:120,y:160,w:110,attrs:[['name'],['id','k'],['address']],side:'up',dy:85,sp:95},
            {id:'ca',t:'Car',x:520,y:160,w:100,attrs:[['year'],['model'],['license','k']],side:'up',dy:85,sp:95},
            {id:'ac',t:'Accident',x:910,y:160,weak:true,w:130,attrs:[['date','p'],['driver'],['damage-amount']],side:'up',dy:85,sp:110}],
  rels:[{t:'owns',x:320,y:160,ends:[{e:'pe',c:'M'},{e:'ca',c:'N'}]},
        {t:'log',x:715,y:160,ident:true,ends:[{e:'ca',c:'1'},{e:'ac',c:'N'}]}]};
/* ---------- notation grid ---------- */
function setMap(kind){
  // A on the right (cx 175), B on the left (cx 55)
  const ya=[22,44,66,88],yb=[16,34,52,70,88];
  let pairs, nB;
  if(kind==='1:1'){pairs=[[0,0],[1,1],[2,2],[3,3]];nB=4;}
  else if(kind==='1:N'){pairs=[[0,0],[0,1],[1,2],[3,3],[3,4]];nB=5;}
  else {pairs=[[0,0],[0,2],[1,1],[1,3],[2,0],[2,4],[3,2]];nB=5;}
  const yB=nB===4?ya:yb;
  let g=`<ellipse class="setov" cx="175" cy="55" rx="30" ry="48"/><ellipse class="setov" cx="55" cy="55" rx="30" ry="48"/>`;
  pairs.forEach(([i,j])=>g+=`<line class="setln" x1="175" y1="${ya[i]}" x2="55" y2="${yB[j]}"/>`);
  ya.forEach(y=>g+=`<circle class="dot" cx="175" cy="${y}" r="4"/>`);
  yB.forEach(y=>g+=`<circle class="dot" cx="55" cy="${y}" r="4"/>`);
  return g;
}
(function(){
  const rows=[
    {k:'1:1',n:'אחד לאחד',A:'מחלקה',R:'מנהל',B:'עובד',cA:'1',cB:'1',d:'כל מחלקה ← מנהל אחד; כל עובד מנהל לכל היותר מחלקה אחת'},
    {k:'1:N',n:'אחד לרבים',A:'מחלקה',R:'שייך',B:'עובד',cA:'1',cB:'N',d:'מחלקה ← עובדים רבים; עובד ← מחלקה אחת'},
    {k:'M:N',n:'רבים לרבים',A:'רופא',R:'מתמחה',B:'התמחות',cA:'M',cB:'N',d:'רופא ← כמה תחומים; תחום ← כמה רופאים'}
  ];
  const tb=document.getElementById('notGrid');if(!tb)return;
  const fit=svg=>svg.replace(/ width="\d+" height="\d+"/,' style="width:100%;max-width:270px;height:auto"');
  const cellFor=(r,nt)=>fit(er({w:350,h:92,nt,entities:[{id:'a',t:r.A,x:290,y:46,w:100},{id:'b',t:r.B,x:60,y:46,w:100}],rels:[{t:r.R,x:175,y:46,ends:[{e:'a',c:r.cA},{e:'b',c:r.cB}]}]}));
  const setCell=r=>`<svg viewBox="0 0 230 128" style="width:100%;max-width:210px;height:auto" role="img" aria-label="מיפוי קבוצות">${setMap(r.k)}<text class="setlbl" x="175" y="120" text-anchor="middle" direction="rtl">${r.A}</text><text class="setlbl" x="55" y="120" text-anchor="middle" direction="rtl">${r.B}</text></svg><div class="cap">${r.d}</div>`;
  let h='<tr><th>סימון</th>'+rows.map(r=>`<th style="text-align:center">${r.n} <bdi dir="ltr">${r.k}</bdi></th>`).join('')+'</tr>';
  const lines=[['מה זה אומר<br><span style="font-weight:400;color:var(--muted);font-size:.85rem">נקודה = ישות, קו = קשר</span>',setCell],
    ['<bdi dir="ltr">Chen</bdi><br><span style="font-weight:400;color:var(--muted);font-size:.85rem">מספרים</span>',r=>cellFor(r,'chen')],
    ['חצים<br><span style="font-weight:400;color:var(--muted);font-size:.85rem">כמו במצגת</span>',r=>cellFor(r,'arrow')],
    ['<bdi dir="ltr">Crow’s foot</bdi>',r=>cellFor(r,'crow')]];
  lines.forEach(([lab,fn])=>{h+=`<tr><td class="lab">${lab}</td>`+rows.map(r=>`<td style="text-align:center">${fn(r)}</td>`).join('')+'</tr>';});
  tb.innerHTML=h;
})();
renderAll();
document.querySelectorAll('.ntbar').forEach(bar=>bar.addEventListener('click',ev=>{
  const b=ev.target.closest('button');if(!b)return;
  bar.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));
  const el=bar.dataset.for?document.getElementById(bar.dataset.for):bar.parentElement.querySelector('.mainfig');el.dataset.nt=b.dataset.nt;
  if(el._draw)el._draw(b.dataset.nt);else if(el.dataset.spec&&SPECS[el.dataset.spec])el.innerHTML=er({...SPECS[el.dataset.spec],show:el.dataset.show||'arctk',nt:b.dataset.nt});
}));
/* ---------- cardinality tool ---------- */
const st={1:'1',2:'n'};
if(document.getElementById('tA')){
function upd(){
  const A=document.getElementById('tA').value||'A',B=document.getElementById('tB').value||'B',R=document.getElementById('tR').value||'קשר';
  document.getElementById('q1').textContent=`${A} אחד/ת — לכמה ${B} יכול/ה להיות קשור/ה?`;
  document.getElementById('q2').textContent=`${B} אחד/ת — לכמה ${A} יכול/ה להיות קשור/ה?`;
  document.querySelectorAll('.tool .seg').forEach(s=>s.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===st[s.dataset.q])));
  // card next to B = answer to q1 ; card next to A = answer to q2
  const cB=st[1]==='1'?'1':'N', cA=st[2]==='1'?'1':(st[1]==='1'?'N':'M');
  let type,arrow;
  if(st[1]==='1'&&st[2]==='1'){type='1:1';arrow=`חצים לכיוון ${A} ולכיוון ${B}`;}
  else if(st[1]==='n'&&st[2]==='n'){type='M:N';arrow='ללא חצים';}
  else {type=st[1]==='1'?'N:1':'1:N';arrow=`חץ לכיוון ${st[1]==='1'?B:A} בלבד (צד ה״אחד״)`;}
  const names={'1:1':'אחד לאחד','1:N':'אחד לרבים','N:1':'רבים לאחד','M:N':'רבים לרבים'};
  document.getElementById('cardOut').innerHTML=`<span class="big">${type}</span> &nbsp; ${names[type]} (${A} – ${B}). בסימון החצים של המצגת: ${arrow}.`;
  const sp={w:560,h:110,label:'קשר',entities:[{id:'a',t:A,x:470,y:55},{id:'b',t:B,x:90,y:55}],rels:[{t:R,x:280,y:55,ends:[{e:'a',c:cA},{e:'b',c:cB}]}]};
  document.getElementById('cardSvg').innerHTML=[['chen','Chen — מספרים'],['arrow','חצים (כמו במצגת)'],['crow','Crow’s foot']].map(([n,l])=>`<div>${er({...sp,nt:n})}<div class="cap" style="text-align:center;font-size:.85rem;color:var(--muted)">${l}</div></div>`).join('');
}
document.querySelectorAll('.tool .seg').forEach(s=>s.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;st[s.dataset.q]=b.dataset.v;upd();}));
['tA','tB','tR'].forEach(id=>document.getElementById(id).addEventListener('input',upd));
document.getElementById('preset').addEventListener('change',ev=>{
  if(!ev.target.value)return;const [a,r,b,q1,q2]=ev.target.value.split('|');
  tA.value=a;tR.value=r;tB.value=b;st[1]=q1;st[2]=q2;upd();});
upd();
}

/* ---------- stepped solutions: one living diagram in a fixed "notebook page" ---------- */
document.querySelectorAll('.ex.stepped').forEach(ex=>{
  const steps=[...ex.querySelectorAll('.step')],fig=ex.querySelector('.mainfig'),cap=ex.querySelector('.livecap');
  const prevB=ex.querySelector('.prevBtn'),nextB=ex.querySelector('.nextBtn'),allB=ex.querySelector('.allBtn'),prog=ex.querySelector('.prog');
  const stepsBox=ex.querySelector('.steps');
  // page size = the largest diagram used in this solution, so nothing moves between steps
  const used=[...new Set(steps.map(s=>s.dataset.spec).filter(k=>k&&SPECS[k]))];
  const W=Math.max(400,...used.map(k=>SPECS[k].w)),H=Math.max(200,...used.map(k=>SPECS[k].h));
  let cur=0,prevShow;
  fig._draw=nt=>{
    if(nt)fig.dataset.nt=nt;
    const spec=fig.dataset.spec,sp=SPECS[spec];
    const inner=sp?er({...sp,show:fig.dataset.show,nt:fig.dataset.nt||'chen',prev:prevShow}).replace('<svg ',`<svg style="width:${(sp.w/W*100).toFixed(3)}%" `):'<div class="emptyfig">התרשים ייבנה כאן שלב אחרי שלב</div>';
    fig.innerHTML=`<div class="frame" data-w="${W}" style="--fw:${W}px;aspect-ratio:${W}/${H}">${inner}</div>`;
    prevShow=undefined;
  };
  function go(i,forward){
    cur=Math.max(0,Math.min(steps.length-1,i));
    steps.forEach((st,j)=>st.hidden=j!==cur);
    const st=steps[cur],spec=st.dataset.spec;
    prevShow=(forward&&cur>0&&steps[cur-1].dataset.spec===spec)?(steps[cur-1].dataset.show||'arctk'):undefined;
    fig.dataset.spec=spec;fig.dataset.show=st.dataset.show||'arctk';
    fig._draw();
    cap.textContent=st.dataset.cap||'';
    cap.classList.toggle('hasfresh',!!fig.querySelector('.fresh'));
    prog.textContent=`שלב ${cur+1} מתוך ${steps.length}`;
    prevB.disabled=cur===0;nextB.disabled=cur===steps.length-1;allB.disabled=cur===steps.length-1;
    if(forward)st.classList.add('new');
  }
  // lock caption and text-column heights to their tallest step
  function lock(){
    cap.style.minHeight='';stepsBox.style.minHeight='';
    let hc=0,hs=0;const keep=cur;
    steps.forEach((st,j)=>{steps.forEach((x,k)=>x.hidden=k!==j);
      cap.textContent=st.dataset.cap||'';cap.classList.add('hasfresh');
      hc=Math.max(hc,cap.offsetHeight);hs=Math.max(hs,stepsBox.offsetHeight);});
    cap.style.minHeight=hc+'px';stepsBox.style.minHeight=hs+'px';
    go(keep,false);
  }
  prevB.addEventListener('click',()=>go(cur-1,false));
  nextB.addEventListener('click',()=>go(cur+1,true));
  allB.addEventListener('click',()=>go(steps.length-1,false));
  go(0,false);lock();
  let t;window.addEventListener('resize',()=>{clearTimeout(t);t=setTimeout(lock,150);});
  if(document.fonts)document.fonts.ready.then(lock);
});


/* =================== PART B: relational algebra =================== */
/* ---------- relational algebra engine (set semantics + row provenance) ---------- */
const RA=(()=>{
  // prov[i] = ids of the base rows ("rel#index") that produced row i
  function R(name,attrs,rows,prov){
    if(!prov)prov=rows.map((_,i)=>[(name||'t')+'#'+i]);
    const seen=new Map(),outR=[],outP=[];
    rows.forEach((r,i)=>{const k=JSON.stringify(r);
      if(seen.has(k)){const j=seen.get(k);outP[j]=[...new Set([...outP[j],...prov[i]])];}
      else{seen.set(k,outR.length);outR.push([...r]);outP.push([...prov[i]]);}});
    return {name,attrs:[...attrs],rows:outR,prov:outP};
  }
  function idx(r,a){
    let i=r.attrs.indexOf(a);if(i>=0)return i;
    const m=r.attrs.map((x,j)=>[x,j]).filter(([x])=>x.split('.').pop()===a);
    if(m.length===1)return m[0][1];
    throw new Error(`attribute ${a} ${m.length?'ambiguous':'missing'} in (${r.attrs})`);
  }
  const row=(r,t)=>new Proxy({},{get:(_,a)=>t[idx(r,a)]});
  const keepIf=(r,f,attrs)=>{const R_=[],P=[];r.rows.forEach((t,i)=>{if(f(t,i)){R_.push(t);P.push(r.prov[i]);}});return R('',attrs||r.attrs,R_,P);};
  const sel=(r,p)=>keepIf(r,t=>p(row(r,t)));
  const proj=(r,as)=>{const ix=as.map(a=>idx(r,a));return R('',as,r.rows.map(t=>ix.map(i=>t[i])),r.prov);};
  const qual=(r)=>r.attrs.map(a=>a.includes('.')||!r.name?a:r.name+'.'+a);
  const times=(r,s)=>{const rows=[],P=[];r.rows.forEach((a,i)=>s.rows.forEach((b,j)=>{rows.push([...a,...b]);P.push([...r.prov[i],...s.prov[j]]);}));return R('',[...qual(r),...qual(s)],rows,P);};
  const rho=(r,x)=>R(x,r.attrs.map(a=>a.split('.').pop()),r.rows,r.prov);
  const compat=(r,s,op)=>{if(r.attrs.length!==s.attrs.length)throw new Error(op+': schemas not compatible');};
  const key=t=>JSON.stringify(t);
  const union=(r,s)=>{compat(r,s,'∪');return R('',r.attrs,[...r.rows,...s.rows],[...r.prov,...s.prov]);};
  const diff=(r,s)=>{compat(r,s,'−');const S=new Set(s.rows.map(key));return keepIf(r,t=>!S.has(key(t)));};
  const inter=(r,s)=>{compat(r,s,'∩');const M=new Map(s.rows.map((t,j)=>[key(t),s.prov[j]]));
    const rows=[],P=[];r.rows.forEach((t,i)=>{if(M.has(key(t))){rows.push(t);P.push([...r.prov[i],...M.get(key(t))]);}});return R('',r.attrs,rows,P);};
  const base=a=>a.split('.').pop();
  function join(r,s){
    const common=r.attrs.filter(a=>s.attrs.map(base).includes(base(a)));
    const sOnly=s.attrs.filter(a=>!r.attrs.map(base).includes(base(a)));
    const ri=common.map(a=>r.attrs.indexOf(a)),si=common.map(a=>s.attrs.map(base).indexOf(base(a))),so=sOnly.map(a=>s.attrs.indexOf(a));
    const rows=[],P=[];r.rows.forEach((a,i)=>s.rows.forEach((b,j)=>{if(ri.every((x,k)=>a[x]===b[si[k]])){rows.push([...a,...so.map(x=>b[x])]);P.push([...r.prov[i],...s.prov[j]]);}}));
    return R('',[...r.attrs.map(base),...sOnly.map(base)],rows,P);
  }
  function div(r,s){
    const S=s.attrs.map(base),keep=r.attrs.filter(a=>!S.includes(base(a)));
    if(keep.length===r.attrs.length)throw new Error('÷: S must be contained in R');
    const ki=keep.map(a=>r.attrs.indexOf(a)),si=S.map(a=>r.attrs.map(base).indexOf(a));
    const cand=proj(r,keep),rows=[],P=[];
    cand.rows.forEach(c=>{let ok=true,pp=[];
      s.rows.forEach((t,j)=>{const i=r.rows.findIndex(x=>ki.every((q,k)=>x[q]===c[k])&&si.every((q,k)=>x[q]===t[k]));
        if(i<0)ok=false;else pp.push(...r.prov[i],...s.prov[j]);});
      if(ok){rows.push(c);P.push([...new Set(pp)]);}});
    return R('',keep.map(base),rows,P);
  }
  return {R,sel,proj,times,rho,union,diff,inter,join,div};
})();

/* ---------- slide data ---------- */
const BANK={
  customer:RA.R('customer',['customer-name','street','customer-city'],[
    ['Morag','Pinkas','Rishon'],['Tamir','Allenby','Haifa'],['Avivi','Pinkas','Rishon'],['Even','Allenby','Haifa']]),
  branch:RA.R('branch',['branch-name','assets','branch-city'],[
    ['Hamerkaz',9000000,'Tiberias'],['Pinkas',2100000,'Eilat'],['Aviv',1700000,'Jaffa'],['Tsafon',400000,'Jaffa']]),
  borrow:RA.R('borrow',['branch-name','loan-number','customer-name','amount'],[
    ['Hamerkaz',17,'Morag',1000],['Pinkas',23,'Tamir',2000],['Aviv',15,'Avivi',1500],['Tsafon',93,'Even',500],['Pinkas',23,'Avivi',2000]]),
  deposit:RA.R('deposit',['branch-name','account-number','customer-name','balance'],[
    ['Hamerkaz',101,'Even',500],['Tsafon',215,'Tamir',700],['Aviv',102,'Avivi',400]])
};
/* slide 20 data (division example): Darom branch + two more deposits */
const BANK20={
  branch:RA.R('branch',['branch-name','assets','branch-city'],[
    ['Hamerkaz',9000000,'Tiberias'],['Pinkas',2100000,'Eilat'],['Darom',1700000,'Jaffa'],['Tsafon',400000,'Jaffa']]),
  deposit:RA.R('deposit',['branch-name','account-number','customer-name','balance'],[
    ['Hamerkaz',101,'Even',500],['Tsafon',215,'Tamir',700],['Aviv',102,'Avivi',400],['Darom',132,'Tamir',200],['Tsafon',505,'Lerner',1600]])
};

const {sel:σ_,proj:π_,times:X_,rho:ρ_,union:U_,diff:D_,inter:I_,join:J_,div:V_}=RA;
const xs=(c,x)=>`σ<sub>${c}</sub>(${x})`,xp=(a,x)=>`π<sub>${a}</sub>(${x})`,xr=(n,x)=>`ρ<sub>${n}</sub>(${x})`,F=x=>`<span class="fx">${x}</span>`;
const esc=v=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const capHTML=t=>esc(t).replace(/[A-Za-z0-9∅(*][A-Za-z0-9 :.,'=×_\-\/∅()*<>!%]*[A-Za-z0-9∅)*%]|[A-Za-z0-9]/g,m=>{
  let pre='',post='';                       // keep a paren inside only if it is balanced inside the run
  while(m.startsWith('(')&&(m.split('(').length>m.split(')').length)){pre+='(';m=m.slice(1);}
  while(m.endsWith(')')&&(m.split(')').length>m.split('(').length)){post=')'+post;m=m.slice(0,-1);}
  m=m.trim();return m?`${pre}<bdi dir="ltr">${m}</bdi>${post}`:pre+post;});
const rkey=t=>JSON.stringify(t);
const fmt=v=>typeof v==='number'&&v>=10000?v.toLocaleString('en-US'):v;

/* table renderer with diff against the previous step */
function relTable(rel,prev,opt={}){
  const same=prev&&prev.attrs.length===rel.attrs.length&&prev.attrs.every((a,i)=>a.split('.').pop()===rel.attrs[i].split('.').pop());
  const prevBases=prev?prev.attrs.map(a=>a.split('.').pop()):[];
  const freshCol=rel.attrs.map(a=>prev&&!same&&opt.newcols!==false&&!prevBases.includes(a.split('.').pop())&&!prev.attrs.includes(a));
  let rows=[];
  if(same){
    const cur=new Set(rel.rows.map(rkey)),old=new Set(prev.rows.map(rkey));
    prev.rows.forEach((t,i)=>{const j=rel.rows.findIndex(x=>rkey(x)===rkey(t));rows.push({t,cls:j>=0?'':'gone',p:j>=0?rel.prov[j]:prev.prov[i]});});
    rel.rows.forEach((t,i)=>{if(!old.has(rkey(t)))rows.push({t,cls:'fresh',p:rel.prov[i]});});
  }else rows=rel.rows.map((t,i)=>({t,cls:'',p:rel.prov&&rel.prov[i]}));
  if(opt.mark)rows.forEach(r=>{if(r.cls!=='gone'&&opt.mark(r.t))r.cls='mark';});
  const head=rel.attrs.map((a,i)=>`<th class="${freshCol[i]?'fresh':''}">${esc(a)}</th>`).join('');
  const body=rows.map(r=>`<tr class="${r.cls}"${r.p&&!opt.noprov?` data-p="${r.p.join(' ')}" tabindex="0"`:''}>${r.t.map((v,i)=>`<td class="${freshCol[i]&&r.cls!=='gone'?'freshc':''}${v===null?' nul':''}">${v===null?'null':esc(fmt(v))}</td>`).join('')}</tr>`).join('')
    ||`<tr><td colspan="${rel.attrs.length}" class="empty">∅ — אין שורות</td></tr>`;
  const kept=rows.filter(r=>r.cls!=='gone').length,gone=rows.length-kept;
  const title=opt.label||rel.name||'';
  return `<div class="rtwrap">${title?`<div class="rtname">${title}</div>`:''}<table class="rt"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table><div class="rtcount">${kept} שורות${gone?` · ${gone} הוסרו בשלב הזה`:''}</div></div>`;
}
function schemaView(D,hlRel=[],hlAttr=[]){
  return `<div class="schema">${Object.values(D).map(r=>{const on=hlRel.includes(r.name);
    return `<div class="srel ${on?'on':(hlRel.length?'dim':'')}"><b>${r.name}</b>(${r.attrs.map(a=>`<span class="${on&&hlAttr.includes(a)?'sa':''}">${a}</span>`).join(', ')})</div>`;}).join('')}</div>`;
}
const ALGQ={};
const B=BANK,B20=BANK20;
/* ---- worked: join chain (slide 18) ---- */
{const c1=σ_(B.customer,t=>t['customer-city']==='Haifa'),c2=J_(c1,B.deposit),c3=J_(c2,B.branch),c4=π_(c3,['branch-name','assets']);
 const e1=xs("customer-city='Haifa'",'customer');
 ALGQ.wJoin={data:B,steps:[
  {schema:[['customer','deposit','branch'],['branch-name','assets','customer-city','customer-name']],expr:`π<sub>branch-name, assets</sub>( ? )`,cap:'הנתונים פזורים בשלושה יחסים; deposit הוא הגשר'},
  {expr:F(e1),ev:()=>c1,base:B.customer,cap:'σ הוריד את הלקוחות שלא גרים ב־Haifa (מחוקים)'},
  {expr:`${e1} ${F('⋈ deposit')}`,ev:()=>c2,cap:'⋈ על customer-name הוסיף את עמודות החשבון (מסומנות)'},
  {expr:`${e1} ⋈ deposit ${F('⋈ branch')}`,ev:()=>c3,cap:'⋈ על branch-name הוסיף נכסים ועיר סניף'},
  {expr:`${F('π<sub>branch-name, assets</sub>')}(${e1} ⋈ deposit ⋈ branch)`,ev:()=>c4,cap:'התוצאה — זהה לשקף 18'}]};}
/* ---- worked: rename (slide 12) ---- */
{const m1=σ_(B.customer,t=>t['customer-name']==='Morag'),m2=π_(m1,['customer-city']),m3=ρ_(m2,'cust2'),
 m4=X_(B.customer,m3),m5=σ_(m4,t=>t['customer.customer-city']===t['cust2.customer-city']),m6=π_(m5,['customer.customer-name']);
 const a=xs("customer-name='Morag'",'customer'),b=xp('customer-city',a),c=xr('cust2',b);
 ALGQ.wRename={data:B,steps:[
  {schema:[['customer'],['customer-name','customer-city']],cap:'צריך להשוות שתי שורות של אותו יחס'},
  {expr:F(a),ev:()=>m1,base:B.customer,cap:'נשארה השורה של Morag'},
  {expr:`${F('π<sub>customer-city</sub>')}(${a})`,ev:()=>m2,cap:'רק העיר: Rishon'},
  {expr:`${F('ρ<sub>cust2</sub>')}(${b})`,ev:()=>m3,cap:'אותו תוכן, שם חדש: cust2'},
  {expr:`customer ${F('×')} ${c}`,ev:()=>m4,cap:'4 × 1 = 4 שורות; העיר של Morag לצד כל לקוח'},
  {expr:`${F('σ<sub>customer.customer-city=cust2.customer-city</sub>')}(customer × ${c})`,ev:()=>m5,cap:'השוואה בתוך השורה: נשארו שני לקוחות מ־Rishon'},
  {expr:`${F('π<sub>customer.customer-name</sub>')}(σ<sub>…</sub>(customer × ${c}))`,ev:()=>m6,cap:'התוצאה — זהה לשקף 12'}]};}
/* ---- worked: max (slide 15) ---- */
{const d=ρ_(B.deposit,'d'),x1=X_(B.deposit,d),x2=σ_(x1,t=>t['deposit.balance']<t['d.balance']),x3=π_(x2,['deposit.balance']),all=π_(B.deposit,['balance']),x4=D_(all,x3);
 ALGQ.wMax={data:B,steps:[
  {schema:[['deposit'],['balance']],expr:`π<sub>balance</sub>(deposit) − ( הסכומים שקטנים ממשהו )`,cap:'המרבי = מה שנשאר אחרי שמורידים את כל מי שקטן ממשהו'},
  {expr:`deposit ${F('× ρ<sub>d</sub>(deposit)')}`,ev:()=>x1,cap:'3 × 3 = 9 זוגות חשבונות'},
  {expr:`${F('σ<sub>deposit.balance&lt;d.balance</sub>')}(deposit × ρ<sub>d</sub>(deposit))`,ev:()=>x2,cap:'זוגות שבהם הסכום השמאלי קטן מהימני'},
  {expr:`${F('π<sub>deposit.balance</sub>')}(σ<sub>deposit.balance&lt;d.balance</sub>(…))`,ev:()=>x3,cap:'400 ו־500 אינם מרביים (400 נשאר פעם אחת)'},
  {expr:`${F('π<sub>balance</sub>(deposit) −')} π<sub>deposit.balance</sub>(…)`,ev:()=>[['כל הסכומים',all],['קטנים ממשהו',x3],['תוצאה',x4,null]],cap:'נשאר 700 — זהה לשקף 15'}]};}
/* ---- worked: division (slide 20) ---- */
{const s=π_(σ_(B20.branch,t=>t['branch-city']==='Jaffa'),['branch-name']),r=π_(B20.deposit,['customer-name','branch-name']),q=V_(r,s);
 const es=xp('branch-name',xs("branch-city='Jaffa'",'branch')),er_=xp('customer-name, branch-name','deposit');
 ALGQ.wDiv={data:B20,steps:[
  {schema:[['deposit','branch'],['customer-name','branch-name','branch-city']],expr:`(לקוח, סניף) ÷ (סניפים ב־Jaffa)`,cap:'״בכל״ ← חילוק'},
  {expr:F(es),ev:()=>s,base:π_(B20.branch,['branch-name']),cap:'המחלק: Darom ו־Tsafon'},
  {expr:`${F(er_)} ÷ ${es}`,ev:()=>[['המחולק',r],['המחלק',s]],cap:'המחולק: זוגות (לקוח, סניף) בלבד'},
  {expr:`${er_} ${F('÷')} ${es}`,ev:()=>[['המחולק',r,null,t=>t[0]==='Tamir'],['המחלק',s]],cap:'ל־Tamir יש שורה לכל סניף במחלק (מסומן)'},
  {expr:`${er_} ÷ ${es}`,ev:()=>q,cap:'התוצאה — זהה לשקף 20'}]};}
/* ---- practice ---- */
{const p1a=σ_(B.borrow,t=>t['branch-name']==='Pinkas'&&t.amount>1500),p1b=π_(p1a,['customer-name']);
 ALGQ.p1={data:B,steps:[{schema:[[],[]],cap:'נסה לבד'},{schema:[['borrow'],['branch-name','customer-name','amount']],cap:'הכול ב־borrow'},
  {schema:[['borrow'],['branch-name','customer-name','amount']],expr:`π<sub>customer-name</sub>(σ<sub>___ ∧ ___</sub>(borrow))`,cap:'השלם את התנאים'},
  {expr:xs("branch-name='Pinkas' ∧ amount&gt;1500",'borrow'),ev:()=>p1a,base:B.borrow,cap:'שתי הלוואות עומדות בשני התנאים'},
  {expr:`${F('π<sub>customer-name</sub>')}(σ<sub>…</sub>(borrow))`,ev:()=>p1b,cap:'תשובה: Tamir, Avivi'}]};}
{const a=π_(B.borrow,['customer-name']),b=π_(B.deposit,['customer-name']),c=D_(a,b);
 ALGQ.p2={data:B,steps:[{schema:[[],[]],cap:'נסה לבד'},{schema:[['borrow','deposit'],['customer-name']],cap:'שני יחסים, אותה עמודה'},
  {schema:[['borrow','deposit'],['customer-name']],expr:`___ − ___`,cap:'שלילה = הפרש'},
  {schema:[['borrow','deposit'],['customer-name']],expr:`π<sub>customer-name</sub>(borrow) − π<sub>___</sub>(___)`,cap:'השלם את הצד הימני'},
  {expr:F(xp('customer-name','borrow')),ev:()=>a,cap:'כל בעלי ההלוואות'},
  {expr:`${xp('customer-name','borrow')} ${F('− '+xp('customer-name','deposit'))}`,ev:()=>[['בעלי הלוואה',a],['בעלי חיסכון',b],['תוצאה',c]],cap:'תשובה: Morag'}]};}
{const j=J_(B.borrow,B.branch),q=π_(j,['customer-name','branch-city']);
 ALGQ.p3={data:B,steps:[{schema:[[],[]],cap:'נסה לבד'},{schema:[['borrow','branch'],['customer-name','branch-city','branch-name']],cap:'branch-name משותף לשניהם'},
  {schema:[['borrow','branch'],['customer-name','branch-city','branch-name']],expr:`π<sub>customer-name, branch-city</sub>(borrow ⋈ ___)`,cap:'השלם'},
  {expr:`borrow ${F('⋈ branch')}`,ev:()=>j,base:B.borrow,cap:'כל הלוואה עם פרטי הסניף שלה'},
  {expr:`${F('π<sub>customer-name, branch-city</sub>')}(borrow ⋈ branch)`,ev:()=>q,cap:'תשובה: 5 זוגות'}]};}
{const x=X_(B.branch,ρ_(B.branch,'b')),big=π_(σ_(x,t=>t['branch.assets']>t['b.assets']),['branch.branch-name']),all=π_(B.branch,['branch-name']),q=D_(all,big);
 ALGQ.p4={data:B,steps:[{schema:[[],[]],cap:'נסה לבד'},{schema:[['branch'],['branch-name','assets']],expr:`π<sub>branch-name</sub>(branch) − ( סניפים שיש מישהו קטן מהם )`,cap:'תבנית ״המזערי״'},
  {schema:[['branch'],['branch-name','assets']],expr:`π<sub>branch-name</sub>(branch) − π<sub>branch.branch-name</sub>(σ<sub>branch.assets ___ b.assets</sub>(branch × ρ<sub>b</sub>(branch)))`,cap:'איזה סימן השוואה?'},
  {expr:`branch ${F('× ρ<sub>b</sub>(branch)')}`,ev:()=>x,cap:'16 זוגות סניפים'},
  {expr:`${F('π<sub>branch.branch-name</sub>(σ<sub>branch.assets&gt;b.assets</sub>')}(branch × ρ<sub>b</sub>(branch)))`,ev:()=>big,cap:'שלושה סניפים שאינם הנמוכים'},
  {expr:`${F('π<sub>branch-name</sub>(branch) −')} π<sub>branch.branch-name</sub>(…)`,ev:()=>[['כל הסניפים',all],['לא הנמוכים',big],['תוצאה',q]],cap:'תשובה: Tsafon'}]};}
{const x=X_(B.borrow,ρ_(B.borrow,'b2')),s=σ_(x,t=>t['borrow.customer-name']===t['b2.customer-name']&&t['borrow.branch-name']!==t['b2.branch-name']),q=π_(s,['borrow.customer-name']);
 ALGQ.p5={data:B,steps:[{schema:[[],[]],cap:'נסה לבד'},{schema:[['borrow'],['customer-name','branch-name']],expr:`borrow × ρ<sub>b2</sub>(borrow)`,cap:'שני עותקים של borrow'},
  {schema:[['borrow'],['customer-name','branch-name']],expr:`π<sub>borrow.customer-name</sub>(σ<sub>borrow.customer-name=b2.customer-name ∧ ___</sub>(borrow × ρ<sub>b2</sub>(borrow)))`,cap:'השלם את התנאי השני'},
  {expr:`borrow ${F('× ρ<sub>b2</sub>(borrow)')}`,ev:()=>x,cap:'25 זוגות הלוואות'},
  {expr:`${F('σ<sub>borrow.customer-name=b2.customer-name ∧ borrow.branch-name≠b2.branch-name</sub>')}(borrow × ρ<sub>b2</sub>(borrow))`,ev:()=>s,cap:'רק Avivi, פעמיים'},
  {expr:`${F('π<sub>borrow.customer-name</sub>')}(σ<sub>…</sub>(…))`,ev:()=>q,cap:'תשובה: Avivi'}]};}
{const dn=π_(B.deposit,['customer-name']),bn=π_(B.borrow,['customer-name']),w=I_(dn,bn),
  dp=π_(B.deposit,['branch-name','customer-name']),bp=π_(B.borrow,['branch-name','customer-name']),ip=I_(dp,bp),q=π_(ip,['customer-name']);
 ALGQ.p6={data:B,steps:[{schema:[[],[]],cap:'נסה לבד'},{schema:[['deposit','borrow'],['branch-name','customer-name']],expr:`π<sub>?</sub>(deposit) ∩ π<sub>?</sub>(borrow)`,cap:'∩ — אבל על אילו עמודות?'},
  {expr:`${xp('customer-name','deposit')} ∩ ${xp('customer-name','borrow')}`,ev:()=>[['חוסכים',dn],['לווים',bn],['שגוי: ∩ שמות',w]],cap:'שלושה שמות — זו לא התשובה'},
  {expr:`${xp(F('branch-name, customer-name'),'deposit')} ∩ ${xp(F('branch-name, customer-name'),'borrow')}`,ev:()=>[['זוגות חיסכון',dp],['זוגות הלוואה',bp,null,t=>t[0]==='Aviv'&&t[1]==='Avivi']],cap:'הזוג המשותף מסומן'},
  {expr:`${F('π<sub>customer-name</sub>')}(${xp('branch-name, customer-name','deposit')} ∩ ${xp('branch-name, customer-name','borrow')})`,ev:()=>[['∩ זוגות',ip],['תוצאה',q]],cap:'תשובה: Avivi'}]};}


/* ---------- floating source-tables panel ---------- */
const SRC=(()=>{
  let el,body,sub,owner=null,isOpen=false;
  const plain=h=>h.replace(/<[^>]+>/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
  function build(){
    el=document.createElement('aside');el.className='srcpanel';el.hidden=true;el.setAttribute('aria-label','טבלאות המקור');
    el.innerHTML=`<div class="srchead"><b>טבלאות המקור</b><span class="srcsub"></span><button type="button" class="srcbtn srcmin" title="מזער">–</button><button type="button" class="srcbtn srcclose" title="סגור">×</button></div>
    <div class="srclegend"><span><i class="lg row"></i>שורה שמשתתפת בתוצאה</span><span><i class="lg col"></i>עמודה שהשלב משתמש בה</span><span><i class="lg hot"></i>מקור השורה שהסמן עליה</span></div><div class="srcbody"></div>`;
    document.body.append(el);body=el.querySelector('.srcbody');sub=el.querySelector('.srcsub');
    el.querySelector('.srcclose').onclick=()=>close();
    el.querySelector('.srcmin').onclick=()=>el.classList.toggle('mini');
    // drag by header
    const hd=el.querySelector('.srchead');let sx,sy,ox,oy,drag=false;
    hd.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;drag=true;const r=el.getBoundingClientRect();sx=e.clientX;sy=e.clientY;ox=r.left;oy=r.top;hd.setPointerCapture(e.pointerId);el.classList.add('floating');});
    hd.addEventListener('pointermove',e=>{if(!drag)return;const x=Math.max(0,Math.min(innerWidth-80,ox+e.clientX-sx)),y=Math.max(0,Math.min(innerHeight-40,oy+e.clientY-sy));el.style.left=x+'px';el.style.top=y+'px';el.style.right='auto';el.style.bottom='auto';el.style.transform='none';});
    hd.addEventListener('pointerup',()=>drag=false);
  }
  function close(){isOpen=false;if(el)el.hidden=true;document.body.classList.remove('src-open');
    document.querySelectorAll('.srcBtn,.srcDataBtn').forEach(b=>b.setAttribute('aria-pressed','false'));owner=null;}
  function draw(D,results,used,title){
    const ids=new Set();results.forEach(r=>(r.prov||[]).forEach(p=>p.forEach(x=>ids.add(x))));
    const has=results.length>0;
    sub.textContent=title||'';
    const names=Object.keys(D),score=n=>{const r=D[n];return (r.rows.some((_,i)=>ids.has(n+'#'+i))?2:0)+(r.attrs.some(a=>used.has(a))?1:0);};
    const order=names.map((n,ci)=>[n,ci]).sort((a,b)=>score(b[0])-score(a[0]));
    body.innerHTML=order.map(([n,ci])=>{const r=D[n];
      const on=r.rows.map((_,i)=>ids.has(n+'#'+i));const cnt=on.filter(Boolean).length;
      const ucols=r.attrs.map(a=>used.has(a));const relevant=cnt>0||ucols.some(Boolean);
      const head=r.attrs.map((a,i)=>`<th class="${ucols[i]?'use':''}">${esc(a)}</th>`).join('');
      const rows=r.rows.map((t,i)=>`<tr data-id="${n}#${i}" class="${on[i]?'on':(has?'off':'')}">${t.map((v,j)=>`<td class="${ucols[j]?'use':''}">${esc(fmt(v))}</td>`).join('')}</tr>`).join('');
      return `<div class="srcrel c${ci%4} ${relevant?'':'quiet'}"><div class="srcname">${n}${has?`<span>${cnt} מתוך ${r.rows.length} שורות</span>`:''}</div><table class="rt"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;}).join('');
  }
  function usedFrom(D,text,results,extra){
    const t=plain(text||''),u=new Set(extra||[]);
    Object.values(D).forEach(r=>r.attrs.forEach(a=>{const re=new RegExp('(^|[^A-Za-z_-])'+a.replace(/[-]/g,'\\-')+'($|[^A-Za-z_-])');if(re.test(t))u.add(a);}));
    results.forEach(r=>r.attrs.forEach(a=>u.add(a.split('.').pop())));
    // natural join: the shared attributes of the joined relations are used implicitly
    if(t.includes('⋈')){const ns=Object.keys(D).filter(n=>new RegExp('(^|[^A-Za-z_-])'+n+'($|[^A-Za-z_-])').test(t));
      ns.forEach((a,i)=>ns.slice(i+1).forEach(b=>D[a].attrs.filter(x=>D[b].attrs.includes(x)).forEach(x=>u.add(x))));}
    return u;
  }
  function refresh(ex){
    if(!isOpen||owner!==ex)return;
    if(ex._state){const {q,k}=ex._state,st=q.steps[k];let res=[];
      if(st.ev){const o=st.ev();res=Array.isArray(o)?o.map(x=>x[1]):[o];}
      draw(q.data,res,usedFrom(q.data,st.expr,res,st.schema?st.schema[1]:[]),`${ex.querySelector('.q b').textContent} · שלב ${k+1}`);}
    else if(ex._ladder){const L=ex._ladder;const res=L.showRes&&L.res?[L.res]:[];
      draw(L.data,res,usedFrom(L.data,'',res,[]),L.title);}
  }
  function open(ex,btn){if(!el)build();
    if(isOpen&&owner===ex){close();return;}
    document.querySelectorAll('.srcBtn,.srcDataBtn').forEach(b=>b.setAttribute('aria-pressed','false'));
    owner=ex;isOpen=true;el.hidden=false;el.classList.remove('mini');document.body.classList.add('src-open');btn&&btn.setAttribute('aria-pressed','true');refresh(ex);}
  // hover a result row -> light up its exact sources
  const hot=ids=>{if(!el||el.hidden)return;el.querySelectorAll('tr.hot').forEach(r=>r.classList.remove('hot'));
    (ids||[]).forEach(id=>{const r=el.querySelector(`tr[data-id="${id}"]`);if(r){r.classList.add('hot');}});
    const first=ids&&ids.length&&el.querySelector(`tr[data-id="${ids[0]}"]`);if(first)first.closest('.srcrel').scrollIntoView({block:'nearest',inline:'nearest'});};
  ['pointerover','focusin'].forEach(ev=>document.addEventListener(ev,e=>{const tr=e.target.closest&&e.target.closest('tr[data-p]');if(tr&&owner&&owner.contains(tr))hot(tr.dataset.p.split(' '));}));
  ['pointerout','focusout'].forEach(ev=>document.addEventListener(ev,e=>{const tr=e.target.closest&&e.target.closest('tr[data-p]');if(tr)hot([]);}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&isOpen)close();});
  return {open,refresh,close};
})();
document.addEventListener('click',e=>{const b=e.target.closest('.srcBtn');if(b)SRC.open(b.closest('.ex'),b);});
/* ---- alg stepper (fixed page) ---- */
function algRender(q,k){
  const st=q.steps[k],D=q.data;let h='';
  if(st.expr)h+=`<div class="xpr" dir="ltr">${st.expr}</div>`;
  if(st.ev){
    const out=st.ev();
    let prev=st.base||null;
    for(let j=k-1;j>=0&&!prev;j--){const ps=q.steps[j];if(ps.ev){const o=ps.ev();prev=Array.isArray(o)?o[o.length-1][1]:o;}else break;}
    if(Array.isArray(out))h+=`<div class="rtrow">${out.map(([lab,rel,pv,mark])=>relTable(rel,pv||null,{label:lab,mark})).join('')}</div>`;
    else h+=`<div class="rtrow">${relTable(out,prev)}</div>`;
  }else{
    const [hr,ha]=st.schema||[[],[]];
    h+=`<div class="trybox">${hr.length?'':'<div class="tryhead">נסה לבד: כתוב את השאילתה על דף</div>'}${schemaView(D,hr,ha)}</div>`;
  }
  return h;
}
document.querySelectorAll('.ex.alg').forEach(ex=>{
  const q=ALGQ[ex.dataset.q];if(!q)return;
  const steps=[...ex.querySelectorAll('.step')],panel=ex.querySelector('.algpanel'),cap=ex.querySelector('.livecap'),box=ex.querySelector('.steps');
  const prevB=ex.querySelector('.prevBtn'),nextB=ex.querySelector('.nextBtn'),allB=ex.querySelector('.allBtn'),prog=ex.querySelector('.prog');
  if(steps.length!==q.steps.length)console.error('step count mismatch',ex.dataset.q,steps.length,q.steps.length);
  let cur=0;
  function go(i){cur=Math.max(0,Math.min(steps.length-1,i));steps.forEach((s,j)=>s.hidden=j!==cur);
    panel.innerHTML=algRender(q,cur);ex._state={q,k:cur};SRC.refresh(ex);cap.innerHTML=capHTML(q.steps[cur].cap||'');
    prog.textContent=`שלב ${cur+1} מתוך ${steps.length}`;prevB.disabled=cur===0;nextB.disabled=allB.disabled=cur===steps.length-1;}
  function lock(){panel.style.minHeight=cap.style.minHeight=box.style.minHeight='';const keep=cur;let a=0,b=0,c=0;
    if(!ex.offsetParent){go(keep);return;}
    steps.forEach((_,j)=>{go(j);a=Math.max(a,panel.offsetHeight);b=Math.max(b,cap.offsetHeight);c=Math.max(c,box.offsetHeight);});
    panel.style.minHeight=a+'px';cap.style.minHeight=b+'px';box.style.minHeight=c+'px';go(keep);}
  ex._lock=lock;
  prevB.addEventListener('click',()=>go(cur-1));nextB.addEventListener('click',()=>go(cur+1));allB.addEventListener('click',()=>go(steps.length-1));
  go(0);lock();let t;window.addEventListener('resize',()=>{clearTimeout(t);t=setTimeout(lock,150);});
  if(document.fonts)document.fonts.ready.then(lock);
});

/* ---------- source tables beside a question (shared) ---------- */
function relSide(D,names,label,cls){
  names=names.filter(n=>D[n]);if(!names.length)return '';const tabs=names.length>2;
  const body=names.map(n=>`<div class="srct" data-t="${n}">${relTable(D[n],null,{label:n,noprov:1})}</div>`).join('');
  const bar=tabs?`<div class="srctabs" role="tablist"><button type="button" data-t="*" aria-pressed="true">הכל</button>${names.map(n=>`<button type="button" data-t="${n}" aria-pressed="false">${n}</button>`).join('')}</div>`:'';
  return `<aside class="srcside ${cls||''}"><div class="sxlab">${label||'הנתונים בשאלה'}</div>${bar}<div class="srcrow">${body}</div></aside>`;
}
document.addEventListener('click',e=>{const b=e.target.closest('.srctabs button');if(!b)return;const a=b.closest('.srcside'),t=b.dataset.t;
  a.querySelectorAll('.srctabs button').forEach(x=>x.setAttribute('aria-pressed',x===b));
  a.querySelectorAll('.srct').forEach(d=>{d.hidden=t!=='*'&&d.dataset.t!==t;});});
/* data strip under the question of every algebra exercise */
document.querySelectorAll('.ex.alg').forEach(ex=>{const q=ALGQ[ex.dataset.q];if(!q)return;
  const names=Object.keys(q.data).filter(n=>q.steps.some(st=>(st.schema&&st.schema[0].includes(n))||new RegExp('(^|[^A-Za-z_-])'+n+'($|[^A-Za-z_-])').test((st.expr||'').replace(/<[^>]+>/g,' '))));
  ex.querySelector('.q').insertAdjacentHTML('afterend',relSide(q.data,names,'הנתונים בשאלה','strip'));});
/* practice tabs */
(function(){const tabs=document.getElementById('pTabs');if(!tabs)return;const exs=[...document.querySelectorAll('.ex.prac')];
  exs.forEach((ex,i)=>{const b=document.createElement('button');b.type='button';b.textContent=ex.dataset.title;b.setAttribute('aria-pressed',i===0);
    b.addEventListener('click',()=>{exs.forEach((e,j)=>e.hidden=j!==i);tabs.querySelectorAll('button').forEach((x,j)=>x.setAttribute('aria-pressed',j===i));ex._lock&&ex._lock();});tabs.append(b);ex.hidden=i!==0;});})();

/* bank tables + operator gallery */
(function(){
  const g=document.getElementById('bankTables');
  if(g)g.innerHTML=['customer','branch','deposit','borrow'].map(n=>relTable(BANK[n],null,{label:n,noprov:1})).join('');
  const fr=RA.R('r',['fruit','color'],[['apple','red'],['banana','yellow'],['carrot','blue']]),gs=RA.R('s',['name','grade'],[['galit',10],['avi',9]]);
  const rr=RA.R('r',['A','B','C'],[[1,2,4],[3,3,4],[1,7,4],[1,2,9],[1,2,8],[3,3,5],[4,1,2],[3,3,9]]),ss=RA.R('s',['A','B'],[[1,2],[3,3]]);
  const H=n=>σ_(B.borrow,t=>t['branch-name']==='Hamerkaz'),Hd=σ_(B.deposit,t=>t['branch-name']==='Hamerkaz');
  const ic={
    rows:'<svg viewBox="0 0 60 44" class="ic"><g>'+[0,1,2,3].map(r=>[0,1,2].map(c=>`<rect x="${4+c*18}" y="${3+r*10}" width="16" height="8" class="${r%2?'k':'d'}"/>`).join('')).join('')+'</g></svg>',
    cols:'<svg viewBox="0 0 60 44" class="ic"><g>'+[0,1,2,3].map(r=>[0,1,2].map(c=>`<rect x="${4+c*18}" y="${3+r*10}" width="16" height="8" class="${c!==1?'k':'d'}"/>`).join('')).join('')+'</g></svg>',
    venn:m=>`<svg viewBox="0 0 60 44" class="ic"><defs><clipPath id="cl${m}"><circle cx="24" cy="22" r="15"/></clipPath></defs>${m==='u'?'<circle cx="24" cy="22" r="15" class="k"/><circle cx="37" cy="22" r="15" class="k"/>':m==='d'?'<circle cx="24" cy="22" r="15" class="k"/><circle cx="37" cy="22" r="15" class="w"/>':`<circle cx="37" cy="22" r="15" class="k" clip-path="url(#cl${m})"/>`}<circle cx="24" cy="22" r="15" class="o"/><circle cx="37" cy="22" r="15" class="o"/></svg>`
  };
  const hb=n=>σ_(B.borrow,t=>t['branch-name']==='Hamerkaz'),hd=n=>σ_(B.deposit,t=>t['branch-name']==='Hamerkaz');
  const asBase=(name,r)=>RA.R(name,r.attrs,r.rows);   // operand with its own row ids
  const A1=asBase('A',π_(hb(),['customer-name'])),B1=asBase('B',π_(hd(),['customer-name']));
  const A2=asBase('A',π_(hd(),['customer-name'])),B2=asBase('B',π_(hb(),['customer-name']));
  const ops=[
    {sym:'σ',he:'בחירה',en:'select',icon:ic.rows,what:'משאירה רק שורות שמקיימות תנאי. העמודות לא משתנות.',cond:'תנאי על שורה אחת; אפשר לחבר תנאים עם ∧ ו־∨',
     expr:xs("branch-name='Aviv'",'borrow'),ins:[['borrow',B.borrow,['branch-name']]],f:([r])=>σ_(r,t=>t['branch-name']==='Aviv'),look:'השורות העמומות לא עמדו בתנאי'},
    {sym:'π',he:'הטלה',en:'project',icon:ic.cols,what:'משאירה רק את העמודות שנבחרו. שורות שהפכו לזהות מתאחדות.',cond:'העמודות חייבות להיות ביחס',
     expr:xp('branch-name, customer-name','borrow'),ins:[['borrow',B.borrow,['branch-name','customer-name']]],f:([r])=>π_(r,['branch-name','customer-name']),look:'רק העמודות המסומנות עוברות לתוצאה'},
    {sym:'×',he:'מכפלה קרטזית',en:'cartesian product',icon:'<div class="icx">3×2=6</div>',what:'כל שורה מ־r עם כל שורה מ־s. העמודות: של שניהם יחד.',cond:'אין תנאי. עמודות עם אותו שם מקבלות שם מלא: r.A',
     expr:'r × s',ins:[['r',RA.R('r',['fruit','color'],[['apple','red'],['banana','yellow'],['carrot','blue']]),'*'],['s',RA.R('s',['name','grade'],[['galit',10],['avi',9]]),'*']],f:([r,s])=>X_(r,s),look:'כל שורה בתוצאה מורכבת משורה אחת מכל טבלה'},
    {sym:'ρ',he:'כינוי',en:'rename',icon:'<div class="icx">r → x</div>',what:'אותו יחס בדיוק, בשם חדש. מאפשר להשתמש באותו יחס פעמיים.',cond:'—',
     expr:xr('d','deposit'),ins:[['deposit',B.deposit,'*']],f:([r])=>ρ_(r,'d'),look:'התוכן זהה; רק השם השתנה, ולכן עמודות נכתבות d.balance'},
    {sym:'∪',he:'איחוד',en:'union',icon:ic.venn('u'),what:'כל השורות שנמצאות ב־r או ב־s, בלי כפולים.',cond:'אותו מספר עמודות ואותם תחומים',
     expr:`${xp('customer-name','borrow')} ∪ ${xp('customer-name','deposit')}`,
     ins:[['borrow',B.borrow,['customer-name']],['deposit',B.deposit,['customer-name']]],mid:([r,s])=>[['לווים',π_(r,['customer-name'])],['חוסכים',π_(s,['customer-name'])]],
     f:([r,s])=>U_(π_(r,['customer-name']),π_(s,['customer-name'])),look:'כל מי שלווה או חוסך. Avivi מופיע פעמיים ב־borrow ופעם ב־deposit, ובתוצאה רק פעם אחת. Tamir, Avivi ו־Even נמצאים בשתי הרשימות, ובתוצאה כל אחד מהם מופיע פעם אחת'},
    {sym:'−',he:'הפרש',en:'difference',icon:ic.venn('d'),what:'שורות של r שאינן ב־s.',cond:'כמו באיחוד',
     expr:`${xp('customer-name','borrow')} − ${xp('customer-name','deposit')}`,
     ins:[['borrow',B.borrow,['customer-name']],['deposit',B.deposit,['customer-name']]],mid:([r,s])=>[['לווים',π_(r,['customer-name'])],['חוסכים (מורידים)',π_(s,['customer-name'])]],
     f:([r,s])=>D_(π_(r,['customer-name']),π_(s,['customer-name'])),cutMid:1,look:'לווים שאין להם חיסכון. Tamir, Avivi ו־Even מחוקים ברשימת הלווים, כי הם מופיעים גם ברשימה שמורידים. נשאר רק Morag. שים לב שהסדר חשוב: deposit − borrow היה מחזיר רשימה ריקה'},
    {sym:'∩',he:'חיתוך',en:'intersection',icon:ic.venn('i'),what:'שורות שנמצאות גם ב־r וגם ב־s.',cond:'כמו באיחוד. שווה ל־r − (r − s)',
     expr:`${xp('customer-name','borrow')} ∩ ${xp('customer-name','deposit')}`,
     ins:[['borrow',B.borrow,['customer-name']],['deposit',B.deposit,['customer-name']]],mid:([r,s])=>[['לווים',π_(r,['customer-name'])],['חוסכים',π_(s,['customer-name'])]],
     f:([r,s])=>I_(π_(r,['customer-name']),π_(s,['customer-name'])),look:'לקוחות שגם לווים וגם חוסכים. Morag לא נמצא ברשימת החוסכים, ולכן הוא עמום. בשקף 16 החיתוך מוגבל לסניף Hamerkaz, והתוצאה שם ריקה'},
    {sym:'⋈',he:'צירוף טבעי',en:'natural join',icon:'<div class="icx">r⋈s</div>',what:'שרשור של שורות מ־r ו־s שערכיהן שווים בכל התכונות המשותפות. כל תכונה משותפת מופיעה פעם אחת.',cond:'מצרף לפי <strong>כל</strong> התכונות בעלות אותו שם',
     expr:'customer ⋈ deposit',ins:[['customer',B.customer,['customer-name']],['deposit',B.deposit,['customer-name']]],f:([r,s])=>J_(r,s),look:'Morag עמום: אין לו חשבון חיסכון, ולכן אין לו שורה בתוצאה'},
    {sym:'÷',he:'חילוק',en:'division',icon:'<div class="icx">r÷s</div>',what:'הערכים ב־R−S שמופיעים ב־r בשילוב עם <strong>כל</strong> שורה של s.',cond:'S ⊂ R (הכלה ממש). התבנית של התוצאה: R − S',
     expr:'r ÷ s',ins:[['r',RA.R('r',['A','B','C'],[[1,2,4],[3,3,4],[1,7,4],[1,2,9],[1,2,8],[3,3,5],[4,1,2],[3,3,9]]),['A','B']],['s',RA.R('s',['A','B'],[[1,2],[3,3]]),['A','B']]],f:([r,s])=>V_(r,s),look:'C=4 ו־C=9 מופיעים גם עם (1,2) וגם עם (3,3). C=8 מופיע רק עם (1,2)'}
  ];
  const inTable=(lab,rel,use,ids,ci,hasRes)=>{
    const u=a=>use==='*'||use.includes(a);
    const head=rel.attrs.map(a=>`<th class="${u(a)?'use':''}">${esc(a)}</th>`).join('');
    const rows=rel.rows.map((t,i)=>{const id=rel.name+'#'+i,on=ids.has(id);return `<tr data-id="${id}" class="${on?'on':(hasRes?'off':'')}">${t.map((v,j)=>`<td class="${u(rel.attrs[j])?'use':''}">${esc(fmt(v))}</td>`).join('')}</tr>`;}).join('');
    return `<div class="srcrel c${ci}"><div class="srcname rtl">${capHTML(lab)}</div><table class="rt"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
  };
  const midTable=(lab,m,ids,ci,cutAgainst,plain)=>{
    const keep=cutAgainst?new Set(cutAgainst.rows.map(rkey)):null;
    const rows=m.rows.map((t,i)=>{const pp=m.prov[i],on=pp.some(x=>ids.has(x));const cls=plain?'':keep?(keep.has(rkey(t))?'on':'cut'):(on?'on':'off');
      return `<tr data-m="${pp.join(' ')}" class="${cls}">${t.map(v=>`<td class="use">${esc(fmt(v))}</td>`).join('')}</tr>`;}).join('');
    return `<div class="srcrel c${ci} mid"><div class="srcname rtl">${capHTML(lab)}</div><table class="rt"><thead><tr>${m.attrs.map(a=>`<th class="use">${esc(a)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>`;
  };
  const ol=document.getElementById('opGrid');
  if(ol){ol.className='oplist';
    ol.innerHTML=ops.map((o,k)=>{
      const rels=o.ins.map(x=>x[1]),res=o.f(rels),ids=new Set();res.prov.forEach(p=>p.forEach(x=>ids.add(x)));
      return `<div class="oprow" id="op-${k}">
        <div class="opinfo"><div class="ophead"><span class="opsym">${o.sym}</span><div><b>${o.he}</b><span class="open">${o.en}</span></div>${o.icon}</div>
          <p>${o.what}</p><p class="opcond"><strong>תנאי:</strong> ${o.cond}</p></div>
        <div class="opex"><div class="xpr small" dir="ltr">${o.expr}</div>
          <div class="opflow"><div class="opins">${o.ins.map(([lab,rel,use],i)=>inTable(lab,rel,use,ids,i,true)).join('')}</div>
          <div class="oparrow" aria-hidden="true">←</div>${o.mid?`<div class="opins opmid">${o.mid(rels).map(([lab,m],i)=>midTable(lab,m,ids,i,o.cutMid&&i===0?res:null,o.cutMid&&i===1)).join('')}</div><div class="oparrow" aria-hidden="true">←</div>`:''}
          <div class="opout">${relTable(res,null,{label:'תוצאה'})}</div></div>
          <p class="oplook">${o.look}. ריחוף מעל שורה בתוצאה מסמן את שורות המקור שלה.</p></div></div>`;}).join('');
    ol.addEventListener('pointerover',e=>{const tr=e.target.closest('tr[data-p]');if(!tr)return;const row=tr.closest('.oprow');row.querySelectorAll('tr.hot').forEach(x=>x.classList.remove('hot'));const hs=tr.dataset.p.split(' ');hs.forEach(id=>{const t=row.querySelector(`.opins tr[data-id="${id}"]`);if(t)t.classList.add('hot');});row.querySelectorAll('tr[data-m]').forEach(m=>{if(m.dataset.m.split(' ').some(x=>hs.includes(x)))m.classList.add('hot');});});
    ol.addEventListener('pointerout',e=>{const tr=e.target.closest('tr[data-p]');if(tr)tr.closest('.oprow').querySelectorAll('tr.hot').forEach(x=>x.classList.remove('hot'));});
    ol.addEventListener('focusin',e=>{const tr=e.target.closest('tr[data-p]');if(tr)tr.dispatchEvent(new PointerEvent('pointerover',{bubbles:true}));});
  }
})();

/* =================== ER -> relations mapping stepper =================== */
const MAPQ={clinic:{spec:'clinic',steps:[
  {cap:'כללי המיפוי — עוד לא נבחר רכיב'},
  {e:['doc','pat','med','tst','spc'],add:['Doctor(<u>doc_id</u>, name, address, phone, license)','Patient(<u>patient_id</u>, name, address, phone)','Medicine(<u>med_name</u>)','Test(<u>code</u>, test_name, place)','Specialty(<u>spec_name</u>)'],cap:'כלל 1: כל ישות חזקה ← טבלה'},
  {e:['vis'],r:['טיפל','של'],add:['Visit(<u>visit_no</u>, date, diagnosis, <i class="fk">doc_id</i>, <i class="fk">patient_id</i>)'],cap:'כלל 4: קשרי 1:N לא מקבלים טבלה — המפתח של צד ה־1 נכנס לצד ה־N'},
  {e:['shf'],r:['משובץ'],add:['Shift(<u><i class="fk">doc_id</i></u>, <u>day</u>, <u>start_time</u>, end_time)'],cap:'כלל 2: ישות חלשה ← מפתח הבעלים + המפתח החלקי'},
  {r:['מתמחה'],add:['Specializes(<u><i class="fk">doc_id</i></u>, <u><i class="fk">spec_name</i></u>)'],cap:'כלל 3: קשר M:N ← טבלה עם המפתחות של שני הצדדים'},
  {r:['מרשם','הפניה'],add:['Prescription(<u><i class="fk">visit_no</i></u>, <u><i class="fk">med_name</i></u>, daily_amount, days)','Referral(<u><i class="fk">visit_no</i></u>, <u><i class="fk">code</i></u>, deadline)'],cap:'כלל 3: תכונות הקשר עוברות לטבלה של הקשר'},
  {cap:'10 טבלאות. כל M:N קיבל טבלה, כל 1:N נבלע בצד ה־N'}]}};
function mapRender(q,k){
  const sp=SPECS[q.spec],st=q.steps[k];let ov='';
  (st.e||[]).forEach(id=>{const e=sp.entities.find(x=>x.id===id);const w=e.w||Math.max(92,tw(e.t,15)+36);ov+=`<rect class="hlbox" x="${e.x-w/2-9}" y="${e.y-23-9}" width="${w+18}" height="64" rx="8"/>`;});
  (st.r||[]).forEach(n=>{const r=sp.rels.find(x=>x.t===n);const dw=Math.max(50,tw(r.t,14)/2+30);ov+=`<ellipse class="hlbox" cx="${r.x}" cy="${r.y}" rx="${dw+14}" ry="44"/>`;});
  const svg=er({...sp,show:'arctk',nt:'chen',extra:(sp.extra||'')+ov});
  const all=[];q.steps.slice(0,k+1).forEach((s,j)=>(s.add||[]).forEach(t=>all.push([t,j===k])));
  return `<div class="mapfig">${svg}</div><ol class="schemalist">${all.map(([t,f])=>`<li class="${f?'fresh':''}" dir="ltr">${t}</li>`).join('')||'<li class="empty">הטבלאות יופיעו כאן</li>'}</ol>`;
}
document.querySelectorAll('.ex.mapx').forEach(ex=>{
  const q=MAPQ[ex.dataset.q];const steps=[...ex.querySelectorAll('.step')],panel=ex.querySelector('.algpanel'),cap=ex.querySelector('.livecap'),box=ex.querySelector('.steps');
  const prevB=ex.querySelector('.prevBtn'),nextB=ex.querySelector('.nextBtn'),allB=ex.querySelector('.allBtn'),prog=ex.querySelector('.prog');let cur=0;
  function go(i){cur=Math.max(0,Math.min(steps.length-1,i));steps.forEach((s,j)=>s.hidden=j!==cur);panel.innerHTML=mapRender(q,cur);cap.innerHTML=capHTML(q.steps[cur].cap||'');
    prog.textContent=`שלב ${cur+1} מתוך ${steps.length}`;prevB.disabled=cur===0;nextB.disabled=allB.disabled=cur===steps.length-1;}
  function lock(){panel.style.minHeight=cap.style.minHeight=box.style.minHeight='';const keep=cur;let a=0,b=0,c=0;
    steps.forEach((_,j)=>{go(j);a=Math.max(a,panel.offsetHeight);b=Math.max(b,cap.offsetHeight);c=Math.max(c,box.offsetHeight);});
    panel.style.minHeight=a+'px';cap.style.minHeight=b+'px';box.style.minHeight=c+'px';go(keep);}
  prevB.addEventListener('click',()=>go(cur-1));nextB.addEventListener('click',()=>go(cur+1));allB.addEventListener('click',()=>go(steps.length-1));
  go(0);lock();let t;window.addEventListener('resize',()=>{clearTimeout(t);t=setTimeout(lock,150);});if(document.fonts)document.fonts.ready.then(lock);
});

/* =================== Exercise 2: sample data + self-checks =================== */
const W={
  Lives:RA.R('Lives',['person-name','street','city'],[['Dana','Herzl','Tel-Aviv'],['Yossi','Hagana','Haifa'],['Rina','Bialik','Tel-Aviv'],['Avi','Hanasi','Ramat-Gan'],['Moran','Hanasi','Haifa'],['Gil','Herzl','Tel-Aviv']]),
  Works:RA.R('Works',['person-name','company-name','salary'],[['Dana','Elta',12000],['Yossi','Elta',9000],['Yossi','Bezek',3000],['Rina','Bezek',11000],['Avi','Bezek',8000],['Moran','Rafael',15000],['Gil','Rafael',7000]]),
  'Located-in':RA.R('Located-in',['company-name','city'],[['Elta','Ashdod'],['Elta','Haifa'],['Bezek','Tel-Aviv'],['Bezek','Haifa'],['Bezek','Ashdod'],['Rafael','Haifa']]),
  Manages:RA.R('Manages',['person-name','manager-name'],[['Yossi','Moran'],['Avi','Rina'],['Gil','Moran'],['Rina','Dana']])
};
const S={
  Customer:RA.R('Customer',['cust_id','name','birth','street','city'],[['c1','Yael',1990,'Herzl','Tel-Aviv'],['c2','Ron',1985,'Hagana','Haifa']]),
  Order:RA.R('Order',['order_id','cust_id','date','emp_id','amount'],[[100,'c1','2026-01-05',2,1500],[101,'c2','2026-01-07',2,800],[102,'c1','2026-02-01',4,600],[103,'c2','2026-02-03',4,900],[104,'c1','2026-02-10',1,2000],[105,'c2','2026-03-01',3,300]]),
  Line_order:RA.R('Line_order',['order_id','line_id','prod_id','quantity'],[[100,1,'p1',10],[100,2,'p2',5],[100,3,'p3',1],[101,1,'p1',3],[102,1,'p1',2],[102,2,'p2',2],[103,1,'p2',4],[103,2,'p4',1],[104,1,'p1',20],[104,2,'p2',20],[104,3,'p4',2],[105,1,'p3',1]]),
  Employee:RA.R('Employee',['emp_id','emp_name','birth','street','city','manager_id','dept_id'],[[1,'Noa',1975,'Herzl','Tel-Aviv','-',10],[2,'Omer',1985,'Hagana','Haifa',1,10],[3,'Lia',1990,'Bialik','Tel-Aviv',1,20],[4,'Ben',1988,'Hanasi','Haifa',3,20],[5,'Tal',1992,'Rothschild','Tel-Aviv',3,30],[6,'Dor',1983,'Weizman','Haifa',1,30]]),
  Department:RA.R('Department',['dept_id','dept_name','dept_head_id'],[[10,'Sales',1],[20,'Support',3],[30,'Logistics',2]]),
  Products:RA.R('Products',['prod_id','prod_name','price_per_unit'],[['p1','Pen',5],['p2','Pad',10],['p3','Lamp',80],['p4','Mug',25]])
};
const CHECK={
  q3a:()=>π_(σ_(W.Works,t=>t['company-name']==='Elta'),['person-name']),
  q3b:()=>π_(J_(σ_(W.Works,t=>t['company-name']==='Elta'),W.Lives),['person-name','street','city']),
  q3c:()=>π_(J_(σ_(W.Works,t=>t['company-name']==='Elta'&&t.salary>10000),W.Lives),['person-name','street','city']),
  q3d:()=>π_(J_(J_(W.Works,W.Lives),W['Located-in']),['person-name']),
  q3e:()=>{const ml=J_(W.Manages,W.Lives),m=ρ_(W.Lives,'m');return π_(σ_(X_(RA.R('ml',ml.attrs,ml.rows,ml.prov),m),t=>t['ml.manager-name']===t['m.person-name']&&t['ml.city']===t['m.city']),['ml.person-name']);},
  q3f:()=>D_(π_(W.Works,['person-name']),π_(σ_(W.Works,t=>t['company-name']==='Elta'),['person-name'])),
  q3g:()=>{const b=ρ_(σ_(W.Works,t=>t['company-name']==='Bezek'),'b');return D_(π_(W.Works,['person-name']),π_(σ_(X_(W.Works,b),t=>t['Works.salary']<=t['b.salary']),['Works.person-name']));},
  q3h:()=>V_(π_(W['Located-in'],['company-name','city']),π_(σ_(W['Located-in'],t=>t['company-name']==='Elta'),['city'])),
  q4a:()=>π_(σ_(X_(S.Employee,S.Department),t=>t['emp_id']===t['dept_head_id']),['emp_name','birth','city']),
  q4b:()=>π_(J_(σ_(S.Order,t=>t.amount>1000),S.Employee),['emp_id','emp_name']),
  q4c:()=>π_(J_(D_(π_(S.Order,['emp_id']),π_(σ_(S.Order,t=>t.amount>=1000),['emp_id'])),S.Employee),['emp_id','emp_name']),
  q4d:()=>V_(π_(S.Line_order,['order_id','prod_id']),π_(σ_(S.Products,t=>t.price_per_unit<=10),['prod_id'])),
  q4e:()=>D_(π_(S.Department,['dept_id','dept_name']),π_(J_(S.Department,π_(J_(S.Employee,S.Order),['dept_id'])),['dept_id','dept_name']))
};
(function(){
  const put=(id,D)=>{const g=document.getElementById(id);if(g)g.innerHTML=Object.keys(D).map(n=>relTable(D[n],null,{label:n,noprov:1})).join('');};
  put('w3data',W);put('s4data',S);
  document.querySelectorAll('.ladder').forEach(l=>{
    const hints=[...l.querySelectorAll('.hints>li')],hb=l.querySelector('.hintBtn'),cb=l.querySelector('.checkBtn'),box=l.querySelector('.check');let n=0;
    const ck=l.dataset.check,DS=ck.startsWith('q3')?W:ck.startsWith('q4')?S:null;
    if(DS){l._ladder={data:DS,title:(ck.startsWith('q3')?'שאלה 3':'שאלה 4')+' · נתוני הדוגמה',showRes:false,res:null};
      const sb=document.createElement('button');sb.type='button';sb.className='btn ghost srcDataBtn';sb.setAttribute('aria-pressed','false');sb.textContent='טבלאות הדוגמה';
      sb.addEventListener('click',()=>SRC.open(l,sb));l.querySelector('.ldbtns').append(sb);}
    hints.forEach(h=>h.hidden=true);
    const upd=()=>{hb.textContent=n<hints.length?`רמז ${n+1} מתוך ${hints.length}`:'כל הרמזים פתוחים';hb.disabled=n>=hints.length;};
    hb.addEventListener('click',()=>{if(n<hints.length){hints[n].hidden=false;hints[n].classList.add('new');n++;upd();}});upd();
    if(cb)cb.addEventListener('click',()=>{const open=box.hidden;box.hidden=!open;cb.textContent=open?'הסתר בדיקה':'בדוק את עצמך';if(l._ladder){l._ladder.showRes=open;if(open&&!l._ladder.res&&CHECK[ck])l._ladder.res=CHECK[ck]();SRC.refresh(l);}
      if(open&&!box.dataset.done){const f=CHECK[l.dataset.check];box.innerHTML=(f?`<div class="ckhead">התוצאה שהשאילתה שלך צריכה להחזיר על נתוני הדוגמה:</div>${(r=>relTable(RA.R('',r.attrs.map(a=>a.split('.').pop()),r.rows,r.prov),null,{label:'תוצאה צפויה'}))(f())}`:'')+(box.innerHTML||'');box.dataset.done=1;}});
  });
})();

document.querySelectorAll('code.xp').forEach(c=>{if(c.textContent.length>26)c.classList.add('wrap');});
/* hint ladders that work on sample data: tables beside every sub-question */
document.querySelectorAll('.ladder[data-check]').forEach(l=>{const ck=l.dataset.check;
  const D=ck.startsWith('q3')?W:ck.startsWith('q4')?S:(ck.startsWith('m3')&&typeof UNI!=='undefined')?UNI:null;if(!D)return;
  l.querySelector('.lq').insertAdjacentHTML('afterend',relSide(D,Object.keys(D),'נתוני הדוגמה','strip'));});
/* ---------- highlight demo ---------- */
const mb=document.getElementById('markBtn'),rq=document.getElementById('demoReq');
if(mb)mb.addEventListener('click',()=>{const on=rq.classList.toggle('on');mb.setAttribute('aria-pressed',on);mb.textContent=on?'נקה סימון':'סמן את הטקסט';});

/* ---------- nav active state ---------- */
const links=[...document.querySelectorAll('nav.side .local a')];
const secs=links.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){links.forEach(l=>l.classList.toggle('active',l.getAttribute('href')==='#'+e.target.id));}});},{rootMargin:'-20% 0px -70% 0px'});
secs.forEach(s=>io.observe(s));

/* ---------- fit-to-width + zoom for wide diagrams ---------- */
(function(){
  const figs=[...document.querySelectorAll('figure.fig')];
  figs.forEach(f=>{const b=document.createElement('button');b.type='button';b.className='zoombtn';b.textContent='הגדל';
    b.addEventListener('click',()=>{const z=f.classList.toggle('zoomed');b.textContent=z?'התאם לרוחב':'הגדל';});f.prepend(b);});
  function refresh(){figs.forEach(f=>{const s=f.querySelector('svg'),b=f.querySelector('.zoombtn');
    const fr=f.querySelector('.frame');const w=fr?+fr.dataset.w:(s?+s.getAttribute('width')||0:0);b.hidden=!(w>f.clientWidth-24)&&!f.classList.contains('zoomed');});}
  refresh();window.addEventListener('resize',refresh);
  document.addEventListener('click',()=>setTimeout(refresh,0));
})();

/* ---------- collapsible menu ---------- */
(function(){
  const nav=document.querySelector('nav.side');if(!nav)return;
  const b=document.createElement('button');b.type='button';b.className='menubtn';b.setAttribute('aria-expanded','false');b.textContent='הצג תפריט';
  const sc=document.createElement('div');sc.className='scrim';
  document.body.append(b,sc);
  const set=o=>{document.body.classList.toggle('menu-open',o);b.setAttribute('aria-expanded',o);b.textContent=o?'סגור תפריט':'הצג תפריט';};
  b.addEventListener('click',()=>set(!document.body.classList.contains('menu-open')));
  sc.addEventListener('click',()=>set(false));
  nav.addEventListener('click',e=>{if(e.target.closest('a'))set(false);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')set(false);});
})();

;(function(){
  document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href*=".html#"]');if(!a)return;
    try{sessionStorage.setItem('jumpTo',a.getAttribute('href').split('#')[1]);}catch(_){}} ,true);
  let id=decodeURIComponent((location.hash||'').slice(1));
  try{const j=sessionStorage.getItem('jumpTo');sessionStorage.removeItem('jumpTo');if(!id&&j)id=j;}catch(_){}
  if(!id)return;let user=false;
  ['wheel','touchstart','keydown','mousedown','hashchange'].forEach(t=>addEventListener(t,()=>user=true,{once:true,passive:true}));
  const go=()=>{if(user)return;const el=document.getElementById(id);if(!el)return;
    const d=el.closest('details');if(d&&!d.open)d.open=true;el.scrollIntoView({block:'start'});};
  addEventListener('load',go);[150,500,1200,2500].forEach(t=>setTimeout(go,t));
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(go);
})();
