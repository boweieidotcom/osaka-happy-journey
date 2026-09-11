let DATA={spots:[],trip:[],curated:{}};
const $=(q,el=document)=>el.querySelector(q), $$=(q,el=document)=>[...el.querySelectorAll(q)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mapSearch=name=>`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
const mapDirections=(from,to)=>`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&travelmode=transit`;

const PHOTO={
 kyoto:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Fushimi-Inari_Torii.jpg/960px-Fushimi-Inari_Torii.jpg',
 kamikochi:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Kamikochi_Azusa_River.jpg/960px-Kamikochi_Azusa_River.jpg',
 shirakawa:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Shirakawa-go_Full_view.jpg/1024px-Shirakawa-go_Full_view.jpg',
 osaka:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/OSAKA_CASTLE.jpg/960px-OSAKA_CASTLE.jpg',
 dotonbori:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Osaka_Dotonbori_yoru.jpg/960px-Osaka_Dotonbori_yoru.jpg',
 kuromon:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/KUROMON_MARKET_OSAKA_%2854676620980%29.jpg/960px-KUROMON_MARKET_OSAKA_%2854676620980%29.jpg'
};
const photo=(key,fallback)=>`<img class="cover-img real-photo" src="${PHOTO[key]}" onerror="this.onerror=null;this.src='${fallback}'" alt="Japan travel photo" loading="lazy">`;

const fmtDate=s=>new Intl.DateTimeFormat('th-TH',{day:'numeric',month:'short',year:'numeric'}).format(new Date(s+'T12:00:00'));

async function boot(){
  DATA=await fetch('data.json').then(r=>r.json());
  setupNav(); renderAll(); setupPWA();
}
function setupNav(){
  $$('.nav-btn').forEach(b=>b.onclick=()=>{ $$('.nav-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); $$('.view').forEach(v=>v.classList.remove('active')); $('#'+b.dataset.view).classList.add('active'); scrollTo({top:0,behavior:'smooth'}); });
}
function currentTripDay(){
  const now=new Date(); const y=now.getFullYear(),m=String(now.getMonth()+1).padStart(2,'0'),d=String(now.getDate()).padStart(2,'0'); const key=`${y}-${m}-${d}`;
  return DATA.trip.find(x=>x.date===key)||null;
}
function countdown(){const start=new Date('2026-09-26T00:00:00'); const now=new Date(); return Math.ceil((start-now)/86400000)}
function renderAll(){renderHome();renderTrip();renderFree();renderSaved();renderPhrase();renderMore();}
function renderHome(){
  const day=currentTripDay(); const n=countdown(); const lead=day?`${day.emoji} ${day.title}`:(n>0?`อีก ${n} วัน เจอกันญี่ปุ่น 🇯🇵`:'OSAKA Happy Journey 🇯🇵');
  const sub=day?day.summary:'แพลนทริป 6 วัน • Kyoto • Kamikochi • Shirakawa-go • Osaka';
  const target=day||DATA.trip[0];
  $('#homeView').innerHTML=`
    <section class="hero">${photo("dotonbori","images/osaka.svg")}<div class="kicker">OUR JAPAN TRIP</div><h2>${esc(lead)}</h2><p>${esc(sub)}</p>
      <div class="hero-grid"><div class="stat"><b>2 คน</b><span>Couple trip</span></div><div class="stat"><b>6 วัน</b><span>26 Sep–1 Oct</span></div><div class="stat"><b>1 Free Day</b><span>Food crawl</span></div><div class="stat"><b>69 จุด</b><span>Saved in Japan</span></div></div>
    </section>
    <div class="section-head"><div><h2>${day?'วันนี้':'Trip snapshot'}</h2><p>${fmtDate(target.date)} · ${esc(target.city)}</p></div><span class="badge">${esc(target.meals)}</span></div>
    <div class="card">
      <div class="timeline">${target.items.map(i=>`<div class="timeline-item"><div class="time">${esc(i.time)}</div><h3>${esc(i.name)}</h3><div class="jp">${esc(i.jp)}</div><p>${esc(i.desc)}</p><div class="actions"><a class="btn outline" target="_blank" rel="noopener" href="${mapSearch(i.name)}">↗ Maps</a></div></div>`).join('')}</div>
    </div>
    <div class="section-head"><div><h3>ของกินที่ควรจำ</h3><p>ใช้เป็น checklist ไม่ต้องเก็บครบทุกอย่าง</p></div></div>
    <div class="food-list">${target.food.map(f=>`<span class="food-pill">${esc(f)}</span>`).join('')}</div>
    <div class="section-head"><div><h3>คืนนี้พัก</h3></div></div><div class="card hotel"><div class="hotel-icon">🏨</div><div><b>${esc(target.hotel)}</b><p>${target.hotel.includes('เทียบเท่า')?'สถานะ: รอยืนยัน Final Hotel จากบริษัททัวร์':'ตามโปรแกรมทัวร์'}</p></div></div>
  `;
}
function renderTrip(){
 $('#tripView').innerHTML=`<div class="section-head"><div><h2>Trip Plan</h2><p>อิงโปรแกรมทัวร์ที่ส่งมา</p></div></div><div class="cards">${DATA.trip.map(d=>`
 <article class="card day-card">${dayPhoto(d)}<div class="day-head"><div class="day-emoji">${d.emoji}</div><div><span class="badge gray">${d.day} · ${fmtDate(d.date)}</span><h3>${esc(d.title)}</h3><div class="day-meta">${esc(d.city)} · อาหาร ${esc(d.meals)}</div></div></div><p>${esc(d.summary)}</p>
 <details><summary>ดู Timeline + ของกิน</summary><div class="timeline" style="margin-top:14px">${d.items.map(i=>`<div class="timeline-item"><div class="time">${esc(i.time)}</div><h4>${esc(i.name)}</h4><div class="jp">${esc(i.jp)}</div><p>${esc(i.desc)}</p><a class="btn outline" target="_blank" rel="noopener" href="${mapSearch(i.name)}">↗ Maps</a></div>`).join('')}</div><div class="food-list">${d.food.map(f=>`<span class="food-pill">${esc(f)}</span>`).join('')}</div></details>
 </article>`).join('')}</div><p class="footer-note">เวลาและลำดับของทัวร์อาจเปลี่ยนตามไกด์ สภาพอากาศ การจราจร และข้อจำกัดรถบัส</p>`;
}
const defaultPlan=[
 {time:'08:00',name:'ออกจากโรงแรม',url:'',note:'อัปเดตจุดเริ่มต้นเมื่อได้ Final Hotel'},
 {time:'09:30',name:'Kuromon Ichiba Market',url:'https://www.google.com/maps/search/?api=1&query=Kuromon%20Ichiba%20Market',note:'เริ่มกินแบบ portion เล็ก ๆ อย่าเพิ่งอิ่มร้านแรก'},
 {time:'10:00',name:'Maguroya Kurogin Kuromon',url:'',note:'ทูน่า: akami / chu-toro / o-toro'},
 {time:'12:30',name:'Namba — เลือกร้านมื้อหลัก',url:'',note:'Fukutaro / Tempura Makino / Gyukatsu Motomura'},
 {time:'15:00',name:'Hozenji Yokocho',url:'',note:'เดินย่อย ถ่ายรูป แล้วค่อยไป Dotonbori'},
 {time:'17:30',name:'Dotonbori',url:'',note:'Glico + Takoyaki + เดินดูแสงสี'},
 {time:'19:00',name:'มื้อเย็น / ร้านสำรอง',url:'',note:'Tsurutontan / Kushikatsu Daruma / Ramen Makotoya'},
 {time:'21:00',name:'กลับโรงแรม',url:'',note:'ปรับตามเวลาและโรงแรมจริง'}
];
function loadPlan(){try{return JSON.parse(localStorage.getItem('osakaPlan'))||defaultPlan}catch{return defaultPlan}}
function savePlan(p){localStorage.setItem('osakaPlan',JSON.stringify(p));}
function renderFree(){
 const plan=loadPlan();
 $('#freeView').innerHTML=`<div class="section-head"><div><h2>Free Day — 30 Sep</h2><p>08:00–21:00 · กิน 60% · เที่ยว 30% · ช้อป 10%</p></div><button id="addPlace" class="btn red">＋ เพิ่ม</button></div>
 <div class="warning">🏨 จุดเริ่มต้นจากโรงแรมยังเป็น placeholder เพราะบริษัททัวร์ยังระบุว่า “KANSAI INTERNATIONAL AIRPORT HOTEL 11 หรือเทียบเท่า” เมื่อได้ชื่อโรงแรมจริง ค่อยอัปเดตเส้นทางแรกและขากลับเพื่อไม่ให้พาไปผิดที่</div>
 <div class="section-head"><div><h3>Suggested Route</h3><p>แก้ไข เรียงใหม่ หรือลบได้ ข้อมูลเก็บในเครื่องนี้</p></div></div>
 <div id="plannerList" class="cards">${plan.map((p,i)=>plannerCard(p,i,plan)).join('')}</div>
 <div class="section-head"><div><h3>Near My Plan</h3><p>Saved Spots ที่เข้ากับโซนในแพลน Free Day ตอนนี้</p></div></div><div class="cards two">${nearPlanCards(plan)}</div><div class="section-head"><div><h3>กินอะไรดีระหว่างทาง</h3><p>ร้านหลัก 1 + ร้านสำรอง 2 ต่อช่วง</p></div></div>
 <div class="cards two">${Object.entries(DATA.curated).map(([area,items])=>`<div class="card recommend"><span class="badge">${esc(area)}</span>${items.map((r,idx)=>`<div style="margin-top:12px"><b class="${idx===0?'must':''}">${idx===0?'★ ':''}${esc(r.name)}</b><div class="spot-meta">${esc(r.tag)} · ${esc(r.dish)}</div><p>${esc(r.why)}</p><div class="actions"><a class="btn outline" target="_blank" rel="noopener" href="${spotUrl(r.name)}">↗ Maps</a><button class="btn add-named" data-name="${esc(r.name)}" data-url="${esc(spotUrl(r.name))}">＋ Plan</button></div></div>`).join('')}</div>`).join('')}</div>
 <div class="section-head"><div><h3>แชร์แพลนกับแฟน</h3><p>Export จากเครื่องหนึ่ง แล้ว Import อีกเครื่อง</p></div></div><div class="card sync-box"><div class="toolbar"><button id="exportPlan" class="btn red">⇩ Export Plan</button><label class="btn outline file-label">⇧ Import Plan<input id="importPlan" type="file" accept="application/json,.json"></label></div><small>ข้อมูล localStorage ไม่ Sync ข้ามเครื่องอัตโนมัติ ฟังก์ชันนี้ใช้ส่งแพลนให้กันแบบง่าย ๆ</small></div><div class="section-head"><div><h3>วิธีเดินทางระหว่างจุด</h3><p>ปุ่ม Route จะเปิด Google Maps แบบขนส่งสาธารณะ</p></div></div><div class="card"><p>ตัวอย่างการอ่านสถานีในเว็บ: <b>Namba Station / なんば駅</b>, <b>Osaka-Namba Station / 大阪難波駅</b>. หลังยืนยันโรงแรมจริง ผมแนะนำให้ปรับจุดเริ่มต้น/กลับโรงแรมให้ตรงก่อนเดินทาง</p></div>`;
 $('#addPlace').onclick=()=>$('#plannerDialog').showModal(); bindPlanner(); bindAddNamed(); bindPlanTransfer();
}
function plannerCard(p,i,plan){const prev=i>0?plan[i-1]:null; const url=p.url||mapSearch(p.name); return `<div class="card planner-item"><div class="planner-time">${esc(p.time||'--:--')}</div><div><h4>${esc(p.name)}</h4><p>${esc(p.note||'')}</p><div class="actions"><a class="btn outline" target="_blank" rel="noopener" href="${esc(url)}">↗ Maps</a>${prev?`<a class="btn" target="_blank" rel="noopener" href="${mapDirections(prev.name,p.name)}">🚆 Route</a>`:''}</div></div><div class="planner-controls"><button class="icon-btn move-up" data-i="${i}" aria-label="move up">↑</button><button class="icon-btn move-down" data-i="${i}" aria-label="move down">↓</button><button class="icon-btn remove" data-i="${i}" aria-label="remove">×</button></div></div>`}
function bindPlanner(){
 $$('.move-up').forEach(b=>b.onclick=()=>movePlan(+b.dataset.i,-1)); $$('.move-down').forEach(b=>b.onclick=()=>movePlan(+b.dataset.i,1)); $$('.remove').forEach(b=>b.onclick=()=>{const p=loadPlan();p.splice(+b.dataset.i,1);savePlan(p);renderFree()});
 $('#plannerForm').onsubmit=e=>{e.preventDefault(); const p=loadPlan();p.push({name:$('#placeName').value.trim(),time:$('#placeTime').value,url:$('#placeUrl').value.trim(),note:$('#placeNote').value.trim()});savePlan(p);$('#plannerDialog').close();e.target.reset();renderFree();};
}
function movePlan(i,d){const p=loadPlan(),j=i+d;if(j<0||j>=p.length)return;[p[i],p[j]]=[p[j],p[i]];savePlan(p);renderFree()}
function bindAddNamed(){$$('.add-named').forEach(b=>b.onclick=()=>{const p=loadPlan();p.push({time:'',name:b.dataset.name,url:b.dataset.url,note:'เพิ่มจาก Saved / Recommendation'});savePlan(p);renderFree();})}
function spotUrl(name){return DATA.spots.find(s=>s.name===name)?.google_maps_url||mapSearch(name)}
let savedFilter='ทั้งหมด';
function renderSaved(){
 const zones=['ทั้งหมด','Free Day แนะนำ','Namba / Dotonbori / Shinsaibashi','Umeda / Nakanoshima','Kyoto','Osaka อื่น ๆ','ญี่ปุ่นอื่น ๆ'];
 $('#savedView').innerHTML=`<div class="section-head"><div><h2>Saved Spots ★</h2><p>69 หมุดในญี่ปุ่นจาก Google Maps Want to go</p></div></div><input id="spotSearch" class="search" placeholder="ค้นหาร้าน / สถานที่..."/><div class="filters">${zones.map(z=>`<button class="chip ${z===savedFilter?'active':''}" data-filter="${esc(z)}">${esc(z)}</button>`).join('')}</div><div id="spotGrid" class="spot-grid"></div>`;
 $('#spotSearch').oninput=drawSpots; $$('.chip').forEach(c=>c.onclick=()=>{savedFilter=c.dataset.filter; $$('.chip').forEach(x=>x.classList.toggle('active',x===c)); drawSpots();}); drawSpots();
}
function drawSpots(){
 const q=($('#spotSearch')?.value||'').trim().toLowerCase(); let list=DATA.spots.filter(s=>{const txt=(s.name+' '+s.city+' '+s.zone_display+' '+s.type_display).toLowerCase(); const fq=savedFilter==='ทั้งหมด'||(savedFilter==='Free Day แนะนำ'?s.trip_priority==='High for this trip':(savedFilter==='ญี่ปุ่นอื่น ๆ'?['Tokyo','Fuji area','Other Japan'].includes(s.city):s.zone_display===savedFilter));return fq&&(!q||txt.includes(q));});
 list.sort((a,b)=>(b.trip_priority==='High for this trip')-(a.trip_priority==='High for this trip')||a.name.localeCompare(b.name));
 $('#spotGrid').innerHTML=list.length?list.map(s=>`<article class="card spot-card"><div class="spot-title"><h4>${esc(s.name)}</h4><span class="badge ${s.trip_priority==='High for this trip'?'green':'gray'}">${esc(s.priority_display)}</span></div><div class="spot-meta">${esc(s.zone_display)} · ${esc(s.type_display)}</div>${s.note?`<p>${esc(s.note)}</p>`:''}${curatedBox(s)}<div class="actions"><a class="btn outline" target="_blank" rel="noopener" href="${esc(s.google_maps_url)}">↗ Google Maps</a>${s.trip_priority==='High for this trip'?`<button class="btn add-saved" data-name="${esc(s.name)}" data-url="${esc(s.google_maps_url)}">＋ Free Day</button>`:''}</div></article>`).join(''):'<div class="empty">ไม่พบสถานที่ที่ตรงกับตัวกรอง</div>';
 $$('.add-saved').forEach(b=>b.onclick=()=>{const p=loadPlan();p.push({time:'',name:b.dataset.name,url:b.dataset.url,note:'เพิ่มจาก Saved Spots'});savePlan(p);alert('เพิ่มเข้า Free Day แล้ว');});
}

function dayImage(d){const t=(d.title+' '+d.city).toLowerCase();if(t.includes('kyoto'))return'images/kyoto.svg';if(t.includes('kamikochi'))return'images/kamikochi.svg';if(t.includes('shirakawa'))return'images/shirakawa.svg';if(t.includes('free'))return'images/kuromon.svg';return'images/osaka.svg'}
function dayPhoto(d){const t=(d.title+' '+d.city).toLowerCase();let k='osaka';if(t.includes('kyoto'))k='kyoto';else if(t.includes('kamikochi'))k='kamikochi';else if(t.includes('shirakawa'))k='shirakawa';else if(t.includes('free'))k='kuromon';return `<img class="day-cover real-photo" src="${PHOTO[k]}" onerror="this.onerror=null;this.src='${dayImage(d)}'" alt="${esc(d.title)}" loading="lazy">`;}
function curatedBox(s){const c=DATA.curated?.[s.name];if(!c)return '';return `<div class="research-box"><div class="research-top"><b>${esc(c.verdict)}</b><span>${esc(c.kind)}</span></div><p><strong>ควรกิน/ทำ:</strong> ${esc(c.must)}</p><div class="research-grid"><span>🕐 ${esc(c.best_time)}</span><span>💴 ${esc(c.budget)}</span></div><p><strong>เวลา:</strong> ${esc(c.hours)}</p><p class="tip">💡 ${esc(c.tip)}</p><a class="source-link" target="_blank" rel="noopener" href="${esc(c.source)}">ข้อมูล: ${esc(c.source_label)} ↗</a></div>`;}

function nearPlanCards(plan){
 const txt=plan.map(x=>x.name).join(' ').toLowerCase(); let zones=[];
 if(/kuromon|namba|dotonbori|hozenji/.test(txt)) zones.push('Namba / Dotonbori / Shinsaibashi');
 if(/umeda|hankyu/.test(txt)) zones.push('Umeda / Nakanoshima');
 let list=DATA.spots.filter(s=>zones.includes(s.zone_display)&&s.trip_priority==='High for this trip').slice(0,8);
 if(!list.length) list=DATA.spots.filter(s=>s.trip_priority==='High for this trip').slice(0,6);
 return list.map(s=>`<article class="card near-card"><img class="mini-img" src="${s.type_display.includes('อาหาร')||s.type_display.includes('คาเฟ่')?'images/food.svg':'images/kuromon.svg'}" alt=""><b>${esc(s.name)}</b><div class="spot-meta">${esc(s.zone_display)} · ${esc(s.type_display)}</div><div class="actions"><a class="btn outline" target="_blank" rel="noopener" href="${esc(s.google_maps_url)}">↗ Maps</a><button class="btn add-named" data-name="${esc(s.name)}" data-url="${esc(s.google_maps_url)}">＋ Plan</button></div></article>`).join('');
}
function bindPlanTransfer(){
 const ex=$('#exportPlan'),im=$('#importPlan'); if(ex)ex.onclick=()=>{const blob=new Blob([JSON.stringify(loadPlan(),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='OSAKA-Free-Day-Plan.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)};
 if(im)im.onchange=async e=>{try{const txt=await e.target.files[0].text();const data=JSON.parse(txt);if(!Array.isArray(data))throw 0;savePlan(data);renderFree();alert('Import แพลนเรียบร้อยแล้ว')}catch{alert('ไฟล์แพลนไม่ถูกต้อง')}};
}
const PHRASES=[
 ['พื้นฐาน','すみません','Sumimasen','ขอโทษครับ/ค่ะ / ขอถามหน่อย'],['พื้นฐาน','ありがとうございます','Arigatou gozaimasu','ขอบคุณครับ/ค่ะ'],['พื้นฐาน','これをください','Kore o kudasai','เอาอันนี้ครับ/ค่ะ'],
 ['ร้านอาหาร','二人です','Futari desu','สองคนครับ/ค่ะ'],['ร้านอาหาร','おすすめは何ですか？','Osusume wa nan desu ka?','แนะนำเมนูไหนครับ/คะ'],['ร้านอาหาร','一番人気はどれですか？','Ichiban ninki wa dore desu ka?','เมนูไหนขายดีที่สุดครับ/คะ'],['ร้านอาหาร','これを二つください','Kore o futatsu kudasai','เอาอันนี้สองที่ครับ/ค่ะ'],['ร้านอาหาร','どのくらい待ちますか？','Dono kurai machimasu ka?','ต้องรอประมาณกี่นาทีครับ/คะ'],['ร้านอาหาร','お会計お願いします','Okaikei onegaishimasu','คิดเงินด้วยครับ/ค่ะ'],
 ['รถไฟ','なんば駅はどこですか？','Namba-eki wa doko desu ka?','สถานี Namba อยู่ทางไหนครับ/คะ'],['รถไฟ','この電車はなんばに行きますか？','Kono densha wa Namba ni ikimasu ka?','รถไฟขบวนนี้ไป Namba ไหมครับ/คะ'],['รถไฟ','どこで乗り換えますか？','Doko de norikaemasu ka?','ต้องเปลี่ยนรถที่ไหนครับ/คะ'],['รถไฟ','このホームで合っていますか？','Kono hoomu de atteimasu ka?','ชานชาลานี้ถูกไหมครับ/คะ'],
 ['ช้อปปิ้ง','免税できますか？','Menzei dekimasu ka?','Tax Free ได้ไหมครับ/คะ'],['ช้อปปิ้ง','カードは使えますか？','Kaado wa tsukaemasu ka?','ใช้บัตรได้ไหมครับ/คะ'],['ช้อปปิ้ง','違うサイズはありますか？','Chigau saizu wa arimasu ka?','มีไซซ์อื่นไหมครับ/คะ'],
 ['ช่วยเหลือ','道に迷いました','Michi ni mayoimashita','หลงทางครับ/ค่ะ'],['ช่วยเหลือ','ここに行きたいです','Koko ni ikitai desu','อยากไปที่นี่ครับ/ค่ะ'],['ช่วยเหลือ','助けてください','Tasukete kudasai','ช่วยด้วยครับ/ค่ะ'],
 ['ร้านอาหาร','予約していません','Yoyaku shiteimasen','ไม่ได้จองไว้ครับ/ค่ะ'],['ร้านอาหาร','二人で入れますか？','Futari de hairemasu ka?','สองคนเข้าได้ไหมครับ/คะ'],['ร้านอาหาร','辛くしないでください','Karaku shinaide kudasai','ขอไม่เผ็ดครับ/ค่ะ'],['ร้านอาหาร','水をください','Mizu o kudasai','ขอน้ำเปล่าครับ/ค่ะ'],['ร้านอาหาร','持ち帰りできますか？','Mochikaeri dekimasu ka?','ซื้อกลับได้ไหมครับ/คะ'],['ร้านอาหาร','これは生ですか？','Kore wa nama desu ka?','อันนี้ดิบไหมครับ/คะ'],
 ['รถไฟ','この電車で合っていますか？','Kono densha de atteimasu ka?','ขึ้นรถไฟขบวนนี้ถูกไหมครับ/คะ'],['รถไฟ','何番出口ですか？','Nanban deguchi desu ka?','ต้องออกทางออกหมายเลขอะไรครับ/คะ'],['รถไฟ','切符はどこで買えますか？','Kippu wa doko de kaemasu ka?','ซื้อตั๋วได้ที่ไหนครับ/คะ'],['รถไฟ','ICOCAは使えますか？','ICOCA wa tsukaemasu ka?','ใช้ ICOCA ได้ไหมครับ/คะ'],['รถไฟ','次の電車は何時ですか？','Tsugi no densha wa nanji desu ka?','รถไฟขบวนถัดไปกี่โมงครับ/คะ'],
 ['ช้อปปิ้ง','これを見せてください','Kore o misete kudasai','ขอดูอันนี้หน่อยครับ/ค่ะ'],['ช้อปปิ้ง','試着してもいいですか？','Shichaku shite mo ii desu ka?','ลองใส่ได้ไหมครับ/คะ'],['ช้อปปิ้ง','もう少し小さいサイズはありますか？','Mou sukoshi chiisai saizu wa arimasu ka?','มีไซซ์เล็กกว่านี้ไหมครับ/คะ'],['ช้อปปิ้ง','袋をお願いします','Fukuro o onegaishimasu','ขอถุงด้วยครับ/ค่ะ'],
 ['โรงแรม','チェックインをお願いします','Chekku-in o onegaishimasu','ขอเช็กอินครับ/ค่ะ'],['โรงแรม','荷物を預かってもらえますか？','Nimotsu o azukatte moraemasu ka?','ฝากกระเป๋าได้ไหมครับ/คะ'],['โรงแรม','タクシーを呼んでください','Takushii o yonde kudasai','ช่วยเรียกแท็กซี่ให้หน่อยครับ/ค่ะ'],
 ['ช่วยเหลือ','英語を話せますか？','Eigo o hanasemasu ka?','พูดภาษาอังกฤษได้ไหมครับ/คะ'],['ช่วยเหลือ','写真を撮ってもらえますか？','Shashin o totte moraemasu ka?','ช่วยถ่ายรูปให้หน่อยได้ไหมครับ/คะ'],['ช่วยเหลือ','トイレはどこですか？','Toire wa doko desu ka?','ห้องน้ำอยู่ที่ไหนครับ/คะ']
];
function renderPhrase(){const cats=[...new Set(PHRASES.map(x=>x[0]))];$('#phraseView').innerHTML=`<div class="section-head"><div><h2>Japanese Phrasebook あ</h2><p>แตะ 🔊 เพื่อให้มือถืออ่านภาษาญี่ปุ่น</p></div></div>${cats.map(c=>`<div class="section-head"><div><h3>${c}</h3></div></div><div class="phrase-grid">${PHRASES.filter(x=>x[0]===c).map(([,jp,ro,th])=>`<div class="card phrase"><div><div class="jp-big">${jp}</div><div class="roman">${ro}</div><div class="th">${th}</div></div><button class="speak" data-jp="${jp}" aria-label="อ่านออกเสียง">🔊</button></div>`).join('')}</div>`).join('')}`;$$('.speak').forEach(b=>b.onclick=()=>speakJP(b.dataset.jp))}
function speakJP(text){if(!('speechSynthesis'in window)){alert('อุปกรณ์นี้ไม่รองรับการอ่านออกเสียง');return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='ja-JP';u.rate=.82;speechSynthesis.speak(u)}
function renderMore(){
 $('#moreView').innerHTML=`<div class="section-head"><div><h2>More</h2><p>Hotel, food notes และข้อมูลใช้จริง</p></div></div>
 <div class="cards">
 <div class="card"><img class="day-cover" src="images/food.svg" alt="Osaka food illustration"><h3>🍜 Food & Travel Toolkit</h3><p>V3 เพิ่มรูปสถานที่จริง, Food Radar จากร้านที่เซฟไว้, เวลา/เมนู/สถานะร้านที่ค้นล่าสุด และ Phrasebook ที่ละเอียดขึ้น</p></div>
 <div class="card"><h3>🏨 Hotels</h3><p><b>Gifu:</b> KOYO HOTEL GIFU หรือเทียบเท่า</p><p><b>Osaka / Kansai:</b> KANSAI INTERNATIONAL AIRPORT HOTEL 11 หรือเทียบเท่า</p><div class="warning" style="margin-top:10px">ยังไม่ควรล็อกเส้นทาง Free Day จากโรงแรมจนกว่าจะได้ Final Hotel เพราะเอกสารทัวร์เปิดสิทธิ์เปลี่ยนเป็นโรงแรมเทียบเท่า</div></div>
 <div class="card"><h3>🏪 Convenience Store — กินอะไรดี</h3><div class="food-list"><span class="food-pill">Onigiri</span><span class="food-pill">Tamago sando</span><span class="food-pill">Karaage / Famichiki</span><span class="food-pill">Pudding</span><span class="food-pill">Ice cream</span><span class="food-pill">Coffee</span></div><p>เหมาะสำหรับมื้อเบา ๆ หรือซื้อกลับโรงแรม โดยเลือกจากสิ่งที่ดูสดใหม่และอย่าซื้อเยอะจนไปตัดโควต้าร้านที่อยากกินจริง ๆ</p></div>
 <div class="quick-grid"><div class="quick"><b>Suica / ICOCA</b><small>แตะขึ้นรถไฟ/รถเมล์และจ่ายร้านสะดวกซื้อหลายแห่ง</small></div><div class="quick"><b>Google Maps</b><small>ใช้ดูชานชาลา ทางออกสถานี และ route แบบ real-time</small></div><div class="quick"><b>Tax Free</b><small>พก Passport ตัวจริงเมื่อตั้งใจซื้อของปลอดภาษี</small></div><div class="quick"><b>Cash</b><small>มีเงินเยนติดตัวไว้สำหรับร้านเล็ก ตู้ หรือกรณีบัตรไม่ผ่าน</small></div></div>
 <div class="card"><h3>🗣️ คำญี่ปุ่นไว้ใช้</h3><p><span class="mono">すみません (Sumimasen)</span> — ขอโทษ/เรียกพนักงาน</p><p><span class="mono">これをください (Kore o kudasai)</span> — เอาอันนี้ครับ/ค่ะ</p><p><span class="mono">おすすめは何ですか？ (Osusume wa nan desu ka?)</span> — แนะนำเมนูไหน</p><p><span class="mono">お会計お願いします (Okaikei onegaishimasu)</span> — เช็กบิลด้วยครับ/ค่ะ</p></div>
 </div><div class="card v3-card"><h3>🔎 V3 Food Radar — 30 Sep</h3><p>ร้านหลักที่ Research แล้ว: Kurogin, Daruma, Tsurutontan, Gyukatsu Motomura, Tempura Makino, Fukutaro, Juhachiban + Kuromon / Hozenji / Dotonbori</p><div class="warning" style="margin-top:10px">Takoyaki Juhachiban มีข้อมูลแหล่งปัจจุบันที่ไม่ตรงกันเรื่องสถานะร้าน จึงทำเครื่องหมาย ⚠️ ให้เช็ก Google Maps วันจริงแทนการล็อกเป็น Must Eat</div></div><div class="card"><h3>📷 Photo credits</h3><p>รูปสถานที่จริงใน V3 โหลดจาก Wikimedia Commons และมี SVG illustration เป็น fallback หากออฟไลน์/รูปโหลดไม่ได้</p><p class="small-note">Fushimi Inari — Takipoint123 (CC BY-SA 4.0) • Kamikochi — Namemiso (CC BY-SA 4.0) • Shirakawa-go — MaedaAkihiko (CC BY-SA 4.0) • Osaka Castle — Tokumeigakarinoaoshima (CC BY-SA 4.0) • Dotonbori — Sakai Yayoi • Kuromon — ERIC SALARD (CC BY-SA 4.0)</p></div><p class="footer-note">ข้อมูลร้าน Research อัปเดต 11 ก.ย. 2026 • เวลา/ราคา/สถานะร้านควรเช็ก Google Maps/หน้าร้านอีกครั้งในวันเดินทาง</p>`;
}
function setupPWA(){
 if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
 let prompt; window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();prompt=e;$('#installBtn').classList.remove('hidden');}); $('#installBtn').onclick=async()=>{if(prompt){prompt.prompt();await prompt.userChoice;prompt=null;$('#installBtn').classList.add('hidden')}};
}
boot();
