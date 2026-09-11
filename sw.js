const CACHE='osaka-happy-v4.4-final-20260911';
const CORE=[
  './','./index.html','./styles.css','./app.js','./supabase-config.js','./data.json','./manifest.webmanifest','./icon-192.png','./icon-512.png',
  './images/osaka.svg','./images/food.svg','./images/kuromon.svg','./images/kyoto.svg','./images/kamikochi.svg','./images/shirakawa.svg',
  './images/trip/kitano-tenmangu.jpg','./images/trip/fushimi-inari.jpg','./images/trip/kamikochi.jpg','./images/trip/shirakawa-go.jpg',
  './images/trip/hankyu-umeda.jpg','./images/trip/osaka-castle.jpg','./images/trip/dotonbori.jpg','./images/trip/umeda-sky.jpg','./images/trip/osaka-aquarium.jpg'
];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)))});
self.addEventListener('activate',e=>e.waitUntil(Promise.all([caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))))});
