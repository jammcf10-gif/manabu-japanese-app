const CACHE='manabu-core-v20';
const CORE=['/','/index.html','/manifest.json','/icon.svg'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.pathname.startsWith('/api/'))return;
  if(url.origin!==location.origin)return;

  // Saved iPhone/Android PWAs may relaunch at the last navigation URL.
  // Any failed/404 navigation returns the cached app shell instead of "Not found".
  if(req.mode==='navigate'){
    event.respondWith(
      fetch(req)
        .then(res=>res.ok?res:caches.match('/index.html'))
        .catch(()=>caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    fetch(req)
      .then(res=>{
        if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}
        return res;
      })
      .catch(()=>caches.match(req))
  );
});
