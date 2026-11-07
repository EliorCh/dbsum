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

})();
