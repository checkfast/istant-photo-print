const CACHE='wyip-shell-v1';
const FILES=['./','./index.html','./style.css','./app.js','./manifest.webmanifest','./icon.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('wyip-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request)));});
self.addEventListener('message',e=>{if(e.data==='check-cache')e.waitUntil(caches.open(CACHE).then(async c=>{const all=await Promise.all(FILES.map(f=>c.match(f)));e.ports[0]?.postMessage(all.every(Boolean)?'ready':'missing');}));});
