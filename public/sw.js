const CACHE_NAME="creator-pwa-v2";
const APP_SHELL=["/manifest.webmanifest","/admin-manifest.webmanifest","/studio-manifest.webmanifest","/app-icon.svg"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)));self.skipWaiting();});
self.addEventListener("activate",event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith("creator-pwa-")&&key!==CACHE_NAME).map(key=>caches.delete(key)));await self.clients.claim();})());});
self.addEventListener("fetch",event=>{const request=event.request;const url=new URL(request.url);if(request.method!=="GET"||url.origin!==self.location.origin)return;if(request.mode==="navigate"){event.respondWith((async()=>{try{return await fetch(request);}catch(_){return(await caches.match(request))||Response.error();}})());}});
