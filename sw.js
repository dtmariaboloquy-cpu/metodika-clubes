/* Metodika Clubes — service worker
   - Páginas (index, videoanálisis, análisis): primero la red, así siempre llega la última versión.
     Si no hay internet, abre la última copia guardada.
   - Íconos y librerías con versión fija: se guardan y se sirven desde el celular.
   - Nunca toca los datos del club (Firebase va directo a la nube). */
const V='mtk-v1';
const LIBS=/^https:\/\/(www\.gstatic\.com\/firebasejs\/|cdnjs\.cloudflare\.com\/ajax\/libs\/|fonts\.(googleapis|gstatic)\.com\/)/;
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(c=>c.addAll(['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png']).catch(()=>{})))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  const propio=u.origin===location.origin&&u.pathname.startsWith(new URL('./',location).pathname);
  if(propio&&(r.mode==='navigate'||/\.html$|\/$/.test(u.pathname))){
    e.respondWith(fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(V).then(x=>x.put(u.pathname.endsWith('/')?new Request('./index.html'):r,c))}return res})
      .catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('./index.html'))));return}
  if((propio&&/\.(png|webmanifest|jpg|svg)$/.test(u.pathname))||LIBS.test(r.url)){
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const c=res.clone();caches.open(V).then(x=>x.put(r,c))}return res})));return}
});
