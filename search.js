/* Site-wide free-text search. Index: searchidx.js (built from the rendered pages), loaded on first use. */
(function(){
const FIN={'ך':'כ','ם':'מ','ן':'נ','ף':'פ','ץ':'צ','־':' ','_':' ','-':' ','–':' ','—':' ','״':'"','׳':"'"};
const norm=s=>{let o='';for(const c of s.toLowerCase())o+=FIN[c]||c;return o;};   // same length as the input
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
let IDX=null,loading=null;
function load(){if(IDX)return Promise.resolve(IDX);if(loading)return loading;
  loading=new Promise((res,rej)=>{const s=document.createElement('script');const v=(document.querySelector('meta[name=sidx]')||{}).content;s.src='searchidx.js'+(v?'?v='+v:'');s.onload=()=>{IDX=(window.SIDX||[]).map(e=>Object.assign(e,{nt:norm(e.t),nx:norm(e.x)}));res(IDX);};s.onerror=()=>rej(new Error('לא הצלחתי לטעון את אינדקס החיפוש'));document.head.append(s);});
  return loading;}
function terms(q){return norm(q).split(/\s+/).filter(t=>t.length>0);}
const WL=/[a-z0-9\u05d0-\u05ea]/;
function count(h,t){let n=0,i=0;while((i=h.indexOf(t,i))>=0){const b=h[i-1],a=h[i+t.length];n+=(!b||!WL.test(b))&&(!a||!WL.test(a))?3:1;i+=t.length;if(n>80)break;}return n;}
function search(q){const T=terms(q);if(!T.length)return [];const phrase=norm(q.trim());const out=[];
  for(const e of IDX){let sc=0,ok=true;for(const t of T){const a=count(e.nt,t),b=count(e.nx,t);if(!a&&!b){ok=false;break;}sc+=a*12+Math.min(b,10);}
    if(!ok)continue;if(T.length>1&&(e.nx.includes(phrase)||e.nt.includes(phrase)))sc+=15;if(e.k==='q')sc+=2;out.push([sc,e]);}
  return out.sort((a,b)=>b[0]-a[0]).slice(0,60).map(x=>x[1]);}
function snippet(e,q){const T=terms(q);let at=-1;for(const t of T){const i=e.nx.indexOf(t);if(i>=0&&(at<0||i<at))at=i;}
  const s=Math.max(0,at-70),x=e.x.slice(s,s+220),nx=e.nx.slice(s,s+220);return (s>0?'…':'')+mark(x,nx,T)+(s+220<e.x.length?'…':'');}
function mark(x,nx,T){const hit=new Array(x.length).fill(false);for(const t of T){let i=0;while((i=nx.indexOf(t,i))>=0){for(let k=i;k<i+t.length;k++)hit[k]=true;i+=t.length;}}
  let o='',on=false;for(let i=0;i<x.length;i++){if(hit[i]&&!on){o+='<mark>';on=true;}if(!hit[i]&&on){o+='</mark>';on=false;}o+=esc(x[i]);}return o+(on?'</mark>':'');}
/* ---- UI ---- */
const btn=document.createElement('button');btn.type='button';btn.className='srch-btn';btn.setAttribute('aria-label','חיפוש באתר');
btn.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg><span>חיפוש</span>';
document.body.appendChild(btn);
const ov=document.createElement('div');ov.className='srch-ov';ov.hidden=true;ov.setAttribute('role','dialog');ov.setAttribute('aria-label','חיפוש באתר');
ov.innerHTML=`<div class="srch-box"><div class="srch-top"><input type="search" class="srch-in" placeholder="חפש בכל העמודים — מושג, פקודה, שם טבלה…" autocomplete="off" spellcheck="false"><button type="button" class="srch-x" aria-label="סגור">✕</button></div>
 <div class="srch-meta"></div><ol class="srch-res"></ol></div>`;
document.body.appendChild(ov);
const inp=ov.querySelector('.srch-in'),res=ov.querySelector('.srch-res'),meta=ov.querySelector('.srch-meta');let sel=0,cur=[];
function open(){ov.hidden=false;document.documentElement.classList.add('srch-open');inp.focus();inp.select();
  meta.textContent='טוען את האינדקס…';load().then(()=>{meta.textContent=inp.value?'':`${IDX.length} קטעים ב־${new Set(IDX.map(e=>e.p)).size} עמודים. אפשר לחפש בעברית ובאנגלית; כמה מילים — כולן צריכות להופיע.`;if(inp.value)run();}).catch(e=>meta.textContent=e.message);}
function close(){ov.hidden=true;document.documentElement.classList.remove('srch-open');}
function href(e){return `${e.p}?q=${encodeURIComponent(inp.value.trim())}#${e.id}`;}
function run(){if(!IDX)return;const q=inp.value;cur=search(q);sel=0;
  meta.textContent=q.trim()?(cur.length?`${cur.length>=60?'60+':cur.length} תוצאות`:'אין תוצאות. נסה מילה אחרת, או חלק ממילה.'):'';
  res.innerHTML=cur.map((e,i)=>`<li class="${i===0?'on':''}"><a href="${href(e)}"><span class="srch-where">${esc(e.pt)}${e.t&&e.t!==e.pt?` › ${mark(e.t,e.nt,terms(q))}`:''}</span><span class="srch-snip">${snippet(e,q)}</span></a></li>`).join('');}
function move(d){const L=res.querySelectorAll('li');if(!L.length)return;L[sel].classList.remove('on');sel=(sel+d+L.length)%L.length;L[sel].classList.add('on');L[sel].scrollIntoView({block:'nearest'});}
let t;inp.addEventListener('input',()=>{clearTimeout(t);t=setTimeout(run,120);});
inp.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();move(1);}else if(e.key==='ArrowUp'){e.preventDefault();move(-1);}
  else if(e.key==='Enter'){const a=res.querySelectorAll('li a')[sel];if(a){e.preventDefault();location.href=a.getAttribute('href');}}else if(e.key==='Escape')close();});
btn.addEventListener('click',open);ov.addEventListener('click',e=>{if(e.target===ov||e.target.closest('.srch-x'))close();});
res.addEventListener('click',e=>{const a=e.target.closest('a');if(a&&a.pathname===location.pathname){close();setTimeout(()=>highlight(new URL(a.href).searchParams.get('q'),decodeURIComponent(a.hash.slice(1))),50);}});
document.addEventListener('keydown',e=>{if((e.key==='k'||e.key==='K')&&(e.ctrlKey||e.metaKey)){e.preventDefault();ov.hidden?open():close();}
  else if(e.key==='/'&&ov.hidden&&!/input|textarea|select/i.test((document.activeElement||{}).tagName||'')){e.preventDefault();open();}});
/* ---- on arrival: mark the words in the target part and scroll to it ---- */
function highlight(q,id){if(!q)return;document.querySelectorAll('mark.srch-hit').forEach(m=>m.replaceWith(document.createTextNode(m.textContent)));
  const tgt0=id&&document.getElementById(id);const root=(tgt0&&(tgt0.matches('h2,h3')?tgt0.closest('section'):tgt0))||document.querySelector('main')||document.body;
  const ph=norm(q.trim());let T=terms(q);if(T.length>1&&norm(root.textContent).includes(ph))T=[ph];let first=null,n=0;
  const tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:x=>x.parentElement.closest('script,style,textarea,.srch-ov,svg')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
  const nodes=[];while(tw.nextNode())nodes.push(tw.currentNode);
  for(const nd of nodes){const x=nd.nodeValue,nx=norm(x);if(!T.some(t=>nx.includes(t)))continue;const span=document.createElement('span');span.innerHTML=mark(x,nx,T).replace(/<mark>/g,'<mark class="srch-hit">');
    nd.replaceWith(...span.childNodes);if(++n>400)break;}
  const tgt=tgt0;const marks=[...root.querySelectorAll('mark.srch-hit')];
  first=tgt?marks.find(m=>tgt.compareDocumentPosition(m)&Node.DOCUMENT_POSITION_FOLLOWING)||null:marks[0];
  const go=first||tgt;if(go){const d=go.closest('details');if(d)d.open=true;go.scrollIntoView({block:'center'});}}
const q=new URLSearchParams(location.search).get('q');if(q)setTimeout(()=>highlight(q,decodeURIComponent(location.hash.slice(1))),1400);
window.SITESEARCH={open,search:q=>load().then(()=>search(q))};
})();
