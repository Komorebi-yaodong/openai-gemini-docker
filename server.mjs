import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import worker from './worker.mjs';

// 从环境变量获取端口，提供一个默认值
const PORT = process.env.PORT || 3000;

const server = createServer(async (req, res) => {
  // 1. 将 Node.js 的请求转换为标准的 Web Request 对象
  const url = new URL(req.url, `http://${req.headers.host}`);
  const webRequest = new Request(url, {
    method: req.method,
    headers: req.headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req : null,
    duplex: 'half' // 允许在请求中传递 body 流
  });

  try {
    // 2. 调用你的 worker 的 fetch 方法
    const webResponse = await worker.fetch(webRequest);

    // 3. 将标准的 Web Response 对象转换回 Node.js 的响应
    res.writeHead(webResponse.status, webResponse.statusText, Object.fromEntries(webResponse.headers));
    
    // 如果响应体不为空，则将其流式传输到客户端
    if (webResponse.body) {
      Readable.fromWeb(webResponse.body).pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});