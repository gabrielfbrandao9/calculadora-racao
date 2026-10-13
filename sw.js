/*
 * Service worker: deixa a calculadora abrir sem internet.
 * Tenta a rede primeiro (para pegar a versão mais nova depois de cada publicação)
 * e usa a cópia guardada quando está offline.
 *
 * Ao mudar a lista de arquivos, aumente a versão para limpar o cache antigo.
 */
const VERSAO = 'v1';
const CACHE = `racao-${VERSAO}`;
const ARQUIVOS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/dados.js',
  'js/app.js',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const chaves = await caches.keys();
    await Promise.all(chaves.filter((k) => k.startsWith('racao-') && k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const resp = await fetch(req);
      if (resp.ok) cache.put(req, resp.clone());
      return resp;
    } catch {
      return (await cache.match(req, { ignoreSearch: true }))
        || (req.mode === 'navigate' && (await cache.match('index.html')))
        || Response.error();
    }
  })());
});
