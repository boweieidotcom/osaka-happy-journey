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
  initCloudSync();
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
    <div id="homeWeatherMini" class="card weather-mini">กำลังโหลด Osaka weather…</div>
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
function savePlan(p){localStorage.setItem('osakaPlan',JSON.stringify(p)); if(CLOUD_READY&&SYNC_TRIP_ID) syncPlanToCloud(p);}
function renderFree(){
 const plan=loadPlan();
 $('#freeView').innerHTML=`<div class="section-head"><div><h2>Free Day — 30 Sep</h2><p>08:00–21:00 · กิน 60% · เที่ยว 30% · ช้อป 10%</p></div><button id="addPlace" class="btn red">＋ เพิ่ม</button></div>
 <div class="warning">🏨 จุดเริ่มต้นจากโรงแรมยังเป็น placeholder เพราะบริษัททัวร์ยังระบุว่า “KANSAI INTERNATIONAL AIRPORT HOTEL 11 หรือเทียบเท่า” เมื่อได้ชื่อโรงแรมจริง ค่อยอัปเดตเส้นทางแรกและขากลับเพื่อไม่ให้พาไปผิดที่</div>
 <div class="section-head"><div><h3>Suggested Route</h3><p>แก้ไข เรียงใหม่ หรือลบได้ ข้อมูลเก็บในเครื่องนี้</p></div></div>
 <div id="plannerList" class="cards">${plan.map((p,i)=>plannerCard(p,i,plan)).join('')}</div>
 <div class="section-head"><div><h3>Near My Plan</h3><p>Saved Spots ที่เข้ากับโซนในแพลน Free Day ตอนนี้</p></div></div><div class="cards two">${nearPlanCards(plan)}</div><div class="section-head"><div><h3>กินอะไรดีระหว่างทาง</h3><p>ร้านหลัก 1 + ร้านสำรอง 2 ต่อช่วง</p></div></div>
 <div class="cards two">${Object.entries(DATA.curated).map(([name,r])=>`<div class="card recommend"><span class="badge">${esc(r.verdict||'แนะนำ')}</span><div style="margin-top:12px"><b class="must">${esc(name)}</b><div class="spot-meta">${esc(r.kind||'')}</div><p><strong>ควรกิน/ทำ:</strong> ${esc(r.must||'')}</p><p>${esc(r.tip||'')}</p><div class="research-grid"><span>🕐 ${esc(r.best_time||'เช็กเวลาอีกครั้ง')}</span><span>💴 ${esc(r.budget||'ดูราคาหน้าร้าน')}</span></div><div class="actions"><a class="btn outline" target="_blank" rel="noopener" href="${spotUrl(name)}">↗ Maps</a><button class="btn add-named" data-name="${esc(name)}" data-url="${esc(spotUrl(name))}">＋ Plan</button></div></div></div>`).join('')}</div>
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

/* ===== V4 FREE EDITION ===== */
const V4_COORDS={
 'Kuromon Market':[34.6653,135.5067],'Kuromon Ichiba Market':[34.6653,135.5067],'Maguroya Kurogin Kuromon':[34.6650,135.5067],
 'Dotonbori':[34.6687,135.5013],'Hozenji Yokocho':[34.6675,135.5023],'Kushikatsu Daruma - Dotombori':[34.6683,135.5025],
 'ICHIRAN Dotonbori -South Building-':[34.6684,135.5031],'Tsurutontan Soemoncho':[34.6691,135.5052],
 'Gyukatsu Motomura Namba Branch':[34.6659,135.5016],'Tempura Makino Namba':[34.6658,135.5011],'Fukutaro Honten':[34.6647,135.5045],
 'Hankyu Umeda Main Store':[34.7027,135.4984],'HARBS in Hankyu Sanban Gai':[34.7053,135.4980],'HARBS Diamor Osaka':[34.7002,135.4973],
 'Osaka Castle':[34.6873,135.5262],'Tsutenkaku':[34.6525,135.5063],'Kuchu Teien Observatory':[34.7053,135.4901],
 'Fushimi Inari Taisha':[34.9671,135.7727],'Kitano Tenmangu Shrine':[35.0312,135.7351], 'Kamikochi':[36.2499,137.6331], 'Shirakawa-go':[36.2578,136.9062]
};
const MENU_HINT={
 'Maguroya Kurogin Kuromon':'Chutoro / Otoro / Akami','Kushikatsu Daruma - Dotombori':'Kushikatsu set','Tsurutontan Soemoncho':'Udon ชามใหญ่','Gyukatsu Motomura Namba Branch':'Gyukatsu set','Tempura Makino Namba':'Tempura set','Fukutaro Honten':'Okonomiyaki / Negiyaki','ICHIRAN Dotonbori -South Building-':'Tonkotsu ramen','HARBS in Hankyu Sanban Gai':'Mille Crepes / เค้กตามฤดูกาล','HARBS Diamor Osaka':'Mille Crepes / เค้กตามฤดูกาล','Kuromon Market':'Sushi / seafood / fruit','Dotonbori':'Takoyaki / Okonomiyaki'
};
const TRIP_INFO={
 'Kitano Tenmangu Shrine':{about:'ศาลเจ้าชินโตสำคัญที่เกี่ยวข้องกับ Sugawara no Michizane และเป็นที่นิยมเรื่องการขอพรด้านการเรียน',photo:'บริเวณประตูและอาคารศาลเจ้า',eat:'ขนมญี่ปุ่นหรือของว่างรอบย่าน Kitano',tip:'ทัวร์เป็นผู้กำหนดเวลาจริง จึงเน้นจุดหลักและกลับรถให้ตรงเวลา'},
 'Fushimi Inari Taisha':{about:'ศาลเจ้าอินาริชื่อดังของเกียวโต เส้นทางขึ้นเขามีโทริอิสีส้มแดงหลายพันต้น และรูปสุนัขจิ้งจอกซึ่งเป็นผู้ส่งสารของอินาริ',photo:'Senbon Torii 千本鳥居',eat:'Inari sushi / Yatsuhashi / Matcha sweets',tip:'ไม่จำเป็นต้องเดินขึ้นถึงยอดเขา โดยเฉพาะเมื่อมากับทัวร์และเวลาจำกัด'},
 'Kamikochi':{about:'พื้นที่ธรรมชาติบนที่สูงในอุทยานแห่งชาติ Chubu Sangaku มีแม่น้ำ Azusa และวิวเทือกเขา Japan Alps',photo:'Kappa Bridge + Azusa River + Hotaka Peaks',eat:'Gohei-mochi หรือของว่างท้องถิ่นถ้ามีเวลา',tip:'อยู่สูงประมาณ 1,500 ม. อากาศอาจเย็นกว่าเมือง ควรมีเสื้อคลุมและรองเท้าเดินสบาย'},
 'Shirakawa-go':{about:'หมู่บ้านประวัติศาสตร์ที่มีบ้านหลังคาทรงกัสโชแบบดั้งเดิม และเป็นหนึ่งในภาพจำสำคัญของภูมิภาคกิฟุ',photo:'บ้าน Gassho-zukuri และวิวหมู่บ้าน',eat:'Hida beef / Gohei-mochi / Hoba miso',tip:'รักษาเวลาเพราะเป็นวันเดินทางหลายจุด และพื้นที่บางส่วนเป็นชุมชนที่มีคนอาศัยจริง'},
 'Osaka Castle':{about:'แลนด์มาร์กสำคัญของโอซาก้า โปรแกรมทัวร์ระบุการชมบริเวณด้านนอก',photo:'ตัวปราสาทจากสวนด้านหน้า',eat:'เก็บท้องไว้สำหรับ Shinsaibashi / Dotonbori',tip:'อย่าเผื่อเวลาเข้าพิพิธภัณฑ์ด้านในหากไกด์ไม่ได้รวมไว้ในโปรแกรม'},
 'Dotonbori':{about:'ย่านกิน เที่ยว และแสงสียอดนิยมใจกลางโอซาก้า เหมาะกับช่วงเย็นถึงค่ำ',photo:'Glico sign + คลอง Dotonbori',eat:'Takoyaki / Okonomiyaki / Kushikatsu',tip:'คนหนาแน่นช่วงค่ำ นัดจุดเจอกันไว้เผื่อเดินแยก'}
};
function favs(){if(CLOUD_READY&&SYNC_TRIP_ID)return new Set(CLOUD_FAVS);try{return new Set(JSON.parse(localStorage.getItem('osakaFavs')||'[]'))}catch{return new Set()}}
async function toggleFav(name){const f=favs();const adding=!f.has(name); adding?f.add(name):f.delete(name); CLOUD_FAVS=new Set(f); localStorage.setItem('osakaFavs',JSON.stringify([...f]));renderSavedV4(); if(document.querySelector('#mapView.active')) renderMapV4(); if(CLOUD_READY&&SYNC_TRIP_ID){try{if(adding) await SB.from('favorites').upsert({trip_id:SYNC_TRIP_ID,spot_id:name}); else await SB.from('favorites').delete().eq('trip_id',SYNC_TRIP_ID).eq('spot_id',name); setSyncState('☁️ Synced');}catch(e){console.error(e);setSyncState('⚠️ Sync failed')}}}
function starButton(name){return `<button class="star-btn ${favs().has(name)?'on':''}" data-fav="${esc(name)}" title="Favorite">${favs().has(name)?'★':'☆'}</button>`}
function bindFavs(){document.querySelectorAll('[data-fav]').forEach(b=>b.onclick=()=>toggleFav(b.dataset.fav))}

const oldRenderSaved=renderSaved;
function renderSavedV4(){
 const q=($('#savedSearch')?.value||'').toLowerCase(); const only=$('#favOnly')?.checked||false; const f=favs();
 const spots=DATA.spots.filter(s=>(!q||s.name.toLowerCase().includes(q)||s.zone_display.toLowerCase().includes(q))&&(!only||f.has(s.name)));
 $('#savedView').innerHTML=`<div class="section-head"><div><h2>Saved Spots</h2><p>${DATA.spots.length} จุดจาก Google Maps • ★ เก็บ Favorite ในเครื่อง</p></div></div><div class="card"><input id="savedSearch" placeholder="ค้นหาร้าน / ย่าน" value="${esc(q)}"><label style="display:flex;gap:8px;align-items:center;margin-top:10px"><input id="favOnly" type="checkbox" ${only?'checked':''}> แสดงเฉพาะ ★ Favorite</label></div><div class="cards two" style="margin-top:12px">${spots.map(s=>`<article class="card"><div class="fav-row"><div><b>${esc(s.name)}</b><div class="spot-meta">${esc(s.zone_display)} · ${esc(s.type_display)}</div></div>${starButton(s.name)}</div>${MENU_HINT[s.name]?`<p><strong>🍴 เมนูเด่น:</strong> ${esc(MENU_HINT[s.name])}</p>`:''}<div class="actions"><a class="btn outline" target="_blank" rel="noopener" href="${esc(s.google_maps_url)}">↗ Google Maps</a>${V4_COORDS[s.name]?'<span class="badge gray">⌖ Map ready</span>':''}</div></article>`).join('')}</div>`;
 $('#savedSearch').oninput=renderSavedV4; $('#favOnly').onchange=renderSavedV4; bindFavs();
}
renderSaved=renderSavedV4;

function weatherCode(c){if(c===0)return['☀️','ฟ้าใส'];if([1,2,3].includes(c))return['⛅','มีเมฆ'];if([51,53,55,61,63,65,80,81,82].includes(c))return['🌧️','ฝน'];if([71,73,75,77,85,86].includes(c))return['🌨️','หิมะ'];if([95,96,99].includes(c))return['⛈️','พายุ'];return['🌤️','อากาศแปรปรวน']}
async function loadWeatherV4(){
 const box=$('#weatherBox'); if(!box)return;
 const locs=[['Osaka',34.6937,135.5023],['Kyoto',35.0116,135.7681],['Gifu',35.4233,136.7607],['Kamikochi',36.2499,137.6331]];
 box.innerHTML='<div class="card">กำลังโหลด Weather…</div>';
 try{
   const groups=await Promise.all(locs.map(async([n,lat,lon])=>{
     const u=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FTokyo&forecast_days=4`;
     const j=await fetch(u).then(r=>{if(!r.ok) throw new Error('weather'); return r.json()});
     const days=j.daily.time.map((date,i)=>{const [ic,tx]=weatherCode(j.daily.weather_code[i]); const label=i===0?'วันนี้':i===1?'พรุ่งนี้':new Intl.DateTimeFormat('th-TH',{weekday:'short',day:'numeric',month:'short'}).format(new Date(date+'T12:00:00+09:00')); return `<div class="wx-day"><div class="wx-day-head"><span>${label}</span><span>${date}</span></div><div class="wx-main"><span class="wx-icon">${ic}</span><div><b>${Math.round(j.daily.temperature_2m_min[i])}–${Math.round(j.daily.temperature_2m_max[i])}°C</b><div>${tx}</div></div><div class="rain">☔ ${j.daily.precipitation_probability_max[i]}%</div></div></div>`}).join('');
     return `<section class="card weather-location"><div class="weather-loc-head"><div><h3>${n}</h3><p>วันนี้ + ล่วงหน้า 3 วัน</p></div><span class="badge gray">Japan</span></div><div class="wx-days">${days}</div></section>`
   }));
   box.innerHTML=`<div class="section-head"><div><h2>Weather ☀️</h2><p>อัปเดตทุกครั้งที่เปิดเว็บ • วันนี้ + ล่วงหน้า 3 วัน • Open-Meteo ฟรี</p></div></div><div class="weather-stack">${groups.join('')}</div><p class="footer-note">พยากรณ์นี้เป็นข้อมูลปัจจุบันของ Osaka / Kyoto / Gifu / Kamikochi ไม่ใช่พยากรณ์วันเดินทางจนกว่าจะเข้าใกล้วันจริง</p>`;
 }catch(e){box.innerHTML='<div class="warning">โหลด Weather ไม่สำเร็จ ลอง Refresh อีกครั้งเมื่อมีอินเทอร์เน็ต</div>'}
}

let leafletMap;
function renderMapV4(){
 $('#mapView').innerHTML=`<div class="section-head"><div><h2>Map 🗺️</h2><p>OpenStreetMap + Saved Spots ที่มีพิกัด • ฟรี</p></div></div><div class="map-toolbar"><button id="locateMe" class="btn red">⌖ Near Me</button><button id="mapFav" class="btn outline">★ Favorites</button><span class="small-muted">ปุ่ม Directions จะเปิด Google Maps ภายนอก</span></div><div id="leafletMap" class="map-wrap"></div><div id="nearbyResults"></div>`;
 if(typeof L==='undefined'){ $('#leafletMap').innerHTML='<div class="warning">โหลดแผนที่ไม่ได้ กรุณาเชื่อมต่ออินเทอร์เน็ต</div>';return }
 leafletMap=L.map('leafletMap').setView([34.6687,135.5013],14); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(leafletMap);
 const add=(name,coord,kind='Saved')=>L.marker(coord).addTo(leafletMap).bindPopup(`<b>${esc(name)}</b><br>${kind}${MENU_HINT[name]?`<br>🍴 ${esc(MENU_HINT[name])}`:''}<br><a target="_blank" href="${mapSearch(name)}">Google Maps ↗</a>`);
 DATA.spots.forEach(s=>{if(V4_COORDS[s.name])add(s.name,V4_COORDS[s.name],favs().has(s.name)?'★ Favorite':'Saved')});
 DATA.trip.flatMap(d=>d.items).forEach(i=>{if(V4_COORDS[i.name]&&!DATA.spots.some(s=>s.name===i.name))add(i.name,V4_COORDS[i.name],'Trip')});
 $('#locateMe').onclick=()=>navigator.geolocation?navigator.geolocation.getCurrentPosition(p=>showNearby(p.coords.latitude,p.coords.longitude),()=>alert('ไม่สามารถอ่านตำแหน่งได้ กรุณาอนุญาต Location ให้เว็บไซต์')):alert('อุปกรณ์นี้ไม่รองรับ Location');
 $('#mapFav').onclick=()=>{const pts=DATA.spots.filter(s=>favs().has(s.name)&&V4_COORDS[s.name]).map(s=>V4_COORDS[s.name]);if(pts.length)leafletMap.fitBounds(pts,{padding:[30,30]});else alert('ยังไม่มี Favorite ที่มีพิกัดบนแผนที่')};
}
function distKm(a,b,c,d){const R=6371,to=x=>x*Math.PI/180,dl=to(c-a),dn=to(d-b),x=Math.sin(dl/2)**2+Math.cos(to(a))*Math.cos(to(c))*Math.sin(dn/2)**2;return 2*R*Math.asin(Math.sqrt(x))}
function showNearby(lat,lon){L.marker([lat,lon]).addTo(leafletMap).bindPopup('คุณอยู่ประมาณนี้').openPopup();leafletMap.setView([lat,lon],15);const list=DATA.spots.filter(s=>V4_COORDS[s.name]).map(s=>({...s,d:distKm(lat,lon,...V4_COORDS[s.name])})).sort((a,b)=>a.d-b.d).slice(0,8);$('#nearbyResults').innerHTML=`<div class="section-head"><div><h3>ร้าน/จุดใกล้คุณ</h3><p>คำนวณระยะเส้นตรงจาก GPS</p></div></div><div class="nearby-grid">${list.map(s=>`<div class="card"><div class="fav-row"><b>${esc(s.name)}</b>${starButton(s.name)}</div><p><strong>📍 ${s.d<1?Math.round(s.d*1000)+' m':s.d.toFixed(1)+' km'}</strong></p>${MENU_HINT[s.name]?`<p>🍴 ${esc(MENU_HINT[s.name])}</p>`:''}<a class="btn outline" target="_blank" href="${esc(s.google_maps_url)}">Directions ↗</a></div>`).join('')}</div>`;bindFavs()}

const oldRenderTrip=renderTrip;
renderTrip=function(){oldRenderTrip(); document.querySelectorAll('#tripView .timeline-item').forEach(el=>{const name=el.querySelector('h4')?.textContent;const d=TRIP_INFO[name];if(!d)return;el.insertAdjacentHTML('beforeend',`<div class="place-detail"><p><strong>รู้จักที่นี่:</strong> ${esc(d.about)}</p><div class="detail-grid"><div class="detail-chip">📸 <b>Photo Spot</b><br>${esc(d.photo)}</div><div class="detail-chip">🍴 <b>ลองกิน</b><br>${esc(d.eat)}</div></div><p>💡 ${esc(d.tip)}</p></div>`)});}

const oldRenderMore=renderMore;
renderMore=function(){oldRenderMore();$('#moreView').insertAdjacentHTML('afterbegin','<div id="weatherBox"></div>');loadWeatherV4();}

const oldRenderAll=renderAll;
renderAll=function(){renderHome();loadHomeWeather();renderTrip();renderFree();renderSavedV4();renderPhrase();renderMapV4();renderMore();}


// ===== V4.3 Shared Trip Sync — no accounts / no member split =====
let SB=null, CLOUD_READY=false, SYNC_TRIP_ID=null, CLOUD_FAVS=new Set(), CLOUD_PLAN=null, syncPollTimer=null;
const SHARED_CODE_KEY='osakaSharedTripCode';
function setSyncState(text){const el=document.getElementById('syncState');if(el)el.textContent=text;}
function getSharedCode(){return localStorage.getItem(SHARED_CODE_KEY)||'';}
function setSharedCode(code){code=String(code||'').trim().toLowerCase(); if(code)localStorage.setItem(SHARED_CODE_KEY,code); else localStorage.removeItem(SHARED_CODE_KEY); return code;}

async function initCloudSync(){
  try{
    if(!window.supabase||!window.OSAKA_SUPABASE)return;
    SB=window.supabase.createClient(window.OSAKA_SUPABASE.url,window.OSAKA_SUPABASE.publishableKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
    CLOUD_READY=true;
    const code=getSharedCode();
    if(code) await connectSharedTrip(code,false);
    else renderMore();
  }catch(e){console.error('Supabase init',e)}
}
async function connectSharedTrip(code,showAlert=true){
  code=String(code||'').trim().toLowerCase(); if(!code)return;
  setSyncState('กำลังเชื่อมต่อ…');
  const {data,error}=await SB.rpc('shared_check_code',{p_code:code});
  if(error||!data){ if(showAlert)alert('Trip Code ไม่ถูกต้อง หรือยังไม่ได้รัน SQL V4.3 ใน Supabase'); setSyncState('⚠️ เชื่อมต่อไม่ได้'); return false; }
  setSharedCode(code); SYNC_TRIP_ID='shared';
  await Promise.all([loadCloudFavorites(),loadCloudPlan()]);
  startSyncPolling(); renderAll(); setSyncState('☁️ Synced');
  return true;
}
function disconnectSharedTrip(){setSharedCode('');SYNC_TRIP_ID=null;CLOUD_FAVS=new Set();CLOUD_PLAN=null;if(syncPollTimer){clearInterval(syncPollTimer);syncPollTimer=null;}renderAll();}
async function loadCloudFavorites(){
  if(!SB||!SYNC_TRIP_ID)return;
  const {data,error}=await SB.rpc('shared_get_favorites',{p_code:getSharedCode()});
  if(error){console.error(error);setSyncState('⚠️ Sync failed');return;}
  CLOUD_FAVS=new Set((data||[]).map(x=>x.spot_id)); localStorage.setItem('osakaFavs',JSON.stringify([...CLOUD_FAVS]));
}
async function loadCloudPlan(){
  if(!SB||!SYNC_TRIP_ID)return;
  const {data,error}=await SB.rpc('shared_get_plan',{p_code:getSharedCode()});
  if(error){console.error(error);setSyncState('⚠️ Sync failed');return;}
  if(data&&data.length){CLOUD_PLAN=data.map(x=>({time:x.plan_time||'',name:x.name||'',url:x.url||'',note:x.note||''}));localStorage.setItem('osakaPlan',JSON.stringify(CLOUD_PLAN));}
  else {const local=loadPlan();await syncPlanToCloud(local);CLOUD_PLAN=local;}
}
async function syncPlanToCloud(plan){
  if(!SB||!SYNC_TRIP_ID)return; setSyncState('☁️ Syncing…');
  const payload=(plan||[]).map((p,i)=>({sort_order:i,time:p.time||'',name:p.name||'',url:p.url||'',note:p.note||''}));
  const {error}=await SB.rpc('shared_replace_plan',{p_code:getSharedCode(),p_plan:payload});
  if(error){console.error(error);setSyncState('⚠️ Sync failed');return;}
  CLOUD_PLAN=plan; setSyncState('☁️ Synced');
}
function startSyncPolling(){
  if(syncPollTimer)clearInterval(syncPollTimer);
  syncPollTimer=setInterval(async()=>{if(!document.hidden&&SYNC_TRIP_ID){await Promise.all([loadCloudFavorites(),loadCloudPlan()]);renderSavedV4();renderFree();}},12000);
}
function favs(){if(CLOUD_READY&&SYNC_TRIP_ID)return new Set(CLOUD_FAVS);try{return new Set(JSON.parse(localStorage.getItem('osakaFavs')||'[]'))}catch{return new Set()}}
async function toggleFav(name){
  const f=favs(),adding=!f.has(name);adding?f.add(name):f.delete(name);CLOUD_FAVS=new Set(f);localStorage.setItem('osakaFavs',JSON.stringify([...f]));renderSavedV4();if(document.querySelector('#mapView.active'))renderMapV4();
  if(CLOUD_READY&&SYNC_TRIP_ID){
    setSyncState('☁️ Syncing…');const {error}=await SB.rpc('shared_set_favorite',{p_code:getSharedCode(),p_spot_id:name,p_add:adding});
    if(error){console.error(error);setSyncState('⚠️ Sync failed');await loadCloudFavorites();renderSavedV4();}else setSyncState('☁️ Synced');
  }
}
function bindFavs(){document.querySelectorAll('[data-fav]').forEach(b=>b.onclick=()=>toggleFav(b.dataset.fav))}

// More: shared Trip Code panel; no email/password/account needed.
const renderMoreV43=renderMore;
renderMore=function(){
  renderMoreV43();
  const holder=document.createElement('div');holder.id='cloudPanel';$('#moreView').prepend(holder);renderCloudPanel();
}
function renderCloudPanel(){
  const holder=$('#cloudPanel');if(!holder)return;
  if(!SB){holder.innerHTML='<div class="card">Supabase ยังไม่พร้อม</div>';return;}
  if(!SYNC_TRIP_ID){holder.innerHTML=`<div class="section-head"><div><h2>☁️ Shared Sync</h2><p>ไม่ต้องสมัครสมาชิก • ใช้ Trip Code เดียวกัน 2 เครื่อง</p></div></div><div class="card"><label>Trip Code<input id="tripCode" autocomplete="off" placeholder="ใส่รหัสทริปส่วนตัว"></label><div class="actions"><button id="connectTrip" class="btn red">Connect</button></div><p class="small-muted">ใครที่รู้รหัสนี้จะเข้าถึง Favorite และ Free Day Plan ชุดเดียวกันได้ อย่าแชร์รหัสสาธารณะ</p><div id="syncState"></div></div>`;$('#connectTrip').onclick=()=>connectSharedTrip($('#tripCode').value);return;}
  holder.innerHTML=`<div class="section-head"><div><h2>☁️ Shared Sync</h2><p>Favorite + Free Day ใช้ข้อมูลชุดเดียวกัน</p></div><span class="badge">Connected</span></div><div class="card"><p><b>OSAKA Happy Journey</b></p><p id="syncState">☁️ Synced</p><p class="small-muted">สองเครื่องใช้ Trip Code เดียวกัน • ระบบตรวจข้อมูลใหม่อัตโนมัติประมาณทุก 12 วินาที</p><div class="actions"><button id="forceSync" class="btn red">↻ Sync now</button><button id="disconnectTrip" class="btn outline">Disconnect</button></div></div>`;
  $('#forceSync').onclick=async()=>{setSyncState('กำลัง Sync…');await Promise.all([loadCloudFavorites(),loadCloudPlan()]);renderAll();setSyncState('☁️ Synced');};$('#disconnectTrip').onclick=disconnectSharedTrip;
}

async function loadHomeWeather(){
  const box=$('#homeWeatherMini');if(!box)return;
  try{const u='https://api.open-meteo.com/v1/forecast?latitude=34.6937&longitude=135.5023&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FTokyo&forecast_days=4';const j=await fetch(u).then(r=>r.json());const [ic,tx]=weatherCode(j.daily.weather_code[0]);box.innerHTML=`<div class="fav-row"><div><b>${ic} Osaka Weather</b><div class="spot-meta">วันนี้ ${Math.round(j.daily.temperature_2m_min[0])}–${Math.round(j.daily.temperature_2m_max[0])}°C · ☔ ${j.daily.precipitation_probability_max[0]}% · ${tx}</div></div><button class="btn outline" id="openWeather">4 วัน</button></div>`;$('#openWeather').onclick=()=>{document.querySelector('[data-view="moreView"]').click();setTimeout(()=>document.getElementById('weatherBox')?.scrollIntoView({behavior:'smooth'}),80)}}catch{box.innerHTML='Weather โหลดไม่ได้ในตอนนี้'}
}

// Saved with area filters + Favorite filter.
renderSavedV4=function(){
 const q=($('#savedSearch')?.value||'').toLowerCase(); const only=$('#favOnly')?.checked||false; const selected=$('#zoneFilter')?.value||'ทั้งหมด'; const f=favs();
 const zones=['ทั้งหมด','Namba / Dotonbori / Shinsaibashi','Umeda / Nakanoshima','Karahori','Osaka Castle / Kyobashi','Shinsekai','Kyoto','Fuji area','Osaka อื่น ๆ','ญี่ปุ่นอื่น ๆ'];
 const spotZone=s=>s.zone_display||'';
 const matchZone=s=>selected==='ทั้งหมด'||(selected==='Kyoto'?s.city==='Kyoto':selected==='Fuji area'?spotZone(s).includes('Fuji'):selected==='ญี่ปุ่นอื่น ๆ'?(!['Osaka','Kyoto'].includes(s.city)&&!spotZone(s).includes('Fuji')):spotZone(s)===selected);
 const spots=DATA.spots.filter(s=>(!q||s.name.toLowerCase().includes(q)||spotZone(s).toLowerCase().includes(q))&&(!only||f.has(s.name))&&matchZone(s)).sort((a,b)=>(f.has(b.name)?1:0)-(f.has(a.name)?1:0));
 $('#savedView').innerHTML=`<div class="section-head"><div><h2>Saved Spots</h2><p>${DATA.spots.length} จุด • ${SYNC_TRIP_ID?'☁️ Favorite sync ร่วมกัน':'★ Favorite ยังเก็บเฉพาะเครื่องนี้'}</p></div></div><div class="card"><input id="savedSearch" placeholder="ค้นหาร้าน / ย่าน" value="${esc(q)}"><select id="zoneFilter" style="margin-top:10px"><option value="ทั้งหมด">ทุกย่าน</option>${zones.slice(1).map(z=>`<option ${selected===z?'selected':''}>${esc(z)}</option>`).join('')}</select><label style="display:flex;gap:8px;align-items:center;margin-top:10px"><input id="favOnly" type="checkbox" ${only?'checked':''}> แสดงเฉพาะ ★ Favorite</label></div><div class="cards two" style="margin-top:12px">${spots.map(s=>`<article class="card"><div class="fav-row"><div><b>${esc(s.name)}</b><div class="spot-meta">${esc(spotZone(s))} · ${esc(s.type_display)}</div></div>${starButton(s.name)}</div>${MENU_HINT[s.name]?`<p><strong>🍴 เมนูเด่น:</strong> ${esc(MENU_HINT[s.name])}</p>`:''}<div class="actions"><a class="btn outline" target="_blank" rel="noopener" href="${esc(s.google_maps_url)}">↗ Google Maps</a>${V4_COORDS[s.name]?'<span class="badge gray">⌖ Map ready</span>':''}</div></article>`).join('')}</div>`;
 $('#savedSearch').oninput=renderSavedV4;$('#favOnly').onchange=renderSavedV4;$('#zoneFilter').onchange=renderSavedV4;bindFavs();
}
renderSaved=renderSavedV4;
