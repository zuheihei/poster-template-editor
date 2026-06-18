import {
  fetchDoubanTopic,
  isAllowedDoubanImageUrl,
} from './doubanParser.js';

const IMAGE_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  return JSON.parse(raw);
}

export function createDoubanApiMiddleware() {
  return async (req, res, next) => {
    if (!req.url?.startsWith('/api/douban/')) {
      next();
      return;
    }

    try {
      if (req.method === 'POST' && req.url === '/api/douban/fetch') {
        const body = await readJsonBody(req);
        const url = body.url?.trim();

        if (!url) {
          sendJson(res, 400, { error: '请提供豆瓣小组帖链接' });
          return;
        }

        const data = await fetchDoubanTopic(url);
        sendJson(res, 200, data);
        return;
      }

      if (req.method === 'GET' && req.url.startsWith('/api/douban/image')) {
        const requestUrl = new URL(req.url, 'http://localhost');
        const imageUrl = requestUrl.searchParams.get('url');

        if (!imageUrl || !isAllowedDoubanImageUrl(imageUrl)) {
          sendJson(res, 400, { error: '无效的图片地址' });
          return;
        }

        const imageRes = await fetch(imageUrl, {
          headers: {
            'User-Agent': IMAGE_UA,
            Referer: 'https://www.douban.com/',
          },
          redirect: 'follow',
        });

        if (!imageRes.ok) {
          sendJson(res, imageRes.status, { error: `图片获取失败（HTTP ${imageRes.status}）` });
          return;
        }

        const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
        const buffer = Buffer.from(await imageRes.arrayBuffer());

        res.statusCode = 200;
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.end(buffer);
        return;
      }

      sendJson(res, 404, { error: '接口不存在' });
    } catch (err) {
      sendJson(res, 500, { error: err.message || '服务器错误' });
    }
  };
}
