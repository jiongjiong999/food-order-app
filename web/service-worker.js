const CACHE_NAME = 'food-order-v7';
const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './data.js',
  './manifest.json'
];

const IMAGE_ASSETS = [
  './images/fanqie.jpg',
  './images/haiti.jpg',
  './images/jiaozi1.jpg',
  './images/jiaozi2.jpg',
  './images/jidan.jpg',
  './images/jipai.jpg',
  './images/kelejichi.jpg',
  './images/maji.jpg',
  './images/qiezi.jpg',
  './images/qingjiao.jpg',
  './images/qingjiaoeg.jpg',
  './images/suanmo.jpg',
  './images/tudousi.jpg',
  './images/yangchon.jpg',
  './images/yumi.jpg'
];

const ALL_ASSETS = [...CORE_ASSETS, ...IMAGE_ASSETS];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 逐个缓存，避免单个失败导致全部失败
      return Promise.allSettled(
        ALL_ASSETS.map(url => cache.add(url).catch(err => console.warn('缓存失败:', url, err)))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 同源请求走缓存优先策略
  if (url.origin === self.location.origin) {
    // 图片：缓存优先 + 后台更新
    if (url.pathname.includes('/images/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url.pathname)) {
      event.respondWith(
        caches.match(event.request, { ignoreSearch: true }).then((cached) => {
          if (cached) {
            // 后台静默更新
            fetch(event.request).then((response) => {
              if (response.ok) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, response);
                });
              }
            }).catch(() => {});
            return cached;
          }
          // 没有缓存，尝试网络
          return fetch(event.request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, clone);
              });
            }
            return response;
          }).catch(() => {
            // 离线且无缓存，返回占位图
            return new Response('', { status: 404, statusText: 'Offline' });
          });
        })
      );
      return;
    }

    // 导航请求：网络优先，离线时回退到缓存
    if (event.request.mode === 'navigate') {
      event.respondWith(
        fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        }).catch(() => {
          return caches.match('./index.html').then((cached) => {
            return cached || caches.match(event.request, { ignoreSearch: true }).then(c => c || new Response('离线模式', { status: 503 }));
          });
        })
      );
      return;
    }

    // 其他静态资源：缓存优先 + 后台更新
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then((cached) => {
        if (cached) {
          fetch(event.request).then((response) => {
            if (response.ok) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, response);
              });
            }
          }).catch(() => {});
          return cached;
        }
        return fetch(event.request).then((response) => {
          if (response.ok && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        }).catch(() => {
          return new Response('离线模式', { status: 503, statusText: 'Offline' });
        });
      })
    );
    return;
  }

  // 跨域请求：直接透传
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request, { ignoreSearch: true }).then(cached => cached || new Response('', { status: 503 }));
    })
  );
});

// 接收消息：手动更新缓存
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
