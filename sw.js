// キャッシュの名前（バージョンを上げると古いキャッシュを更新できる）
const CACHE_NAME = "todo-cache-v1";

// オフラインでも使えるようにキャッシュしておくファイルの一覧
const ASSETS = [
  "./index.html",
  "./css/style.css",
  "./js/main.js",
  "./manifest.json",
];

// Service Workerのインストール時：ASSETSのファイルをキャッシュに保存する
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// ネットワークリクエスト時の処理
// キャッシュにファイルがあればそれを返し、なければ通常通りネットから取得する
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
