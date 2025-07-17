import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import { randomUUID } from 'node:crypto'; // 用于生成唯一请求ID
import worker from './worker.mjs';

const PORT = process.env.PORT || 3000;

const server = createServer(async (req, res) => {
  const requestId = randomUUID();
  
  // --- 详细日志记录开始 ---
  console.log(`\n[${requestId}] --- New Request ---`);
  console.log(`[${requestId}] Method: ${req.method}`);
  console.log(`[${requestId}] URL: ${req.url}`);
  console.log(`[${requestId}] Headers: ${JSON.stringify(req.headers, null, 2)}`);
  
  // 对于 OPTIONS 请求，我们需要看到客户端到底请求了哪些 Headers
  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] This is a CORS preflight (OPTIONS) request.`);
  }

  // --- 将所有请求（包括 OPTIONS）都传递给 worker ---
  const url = new URL(req.url, `http://${req.headers.host}`);
  const webRequest = new Request(url, {
    method: req.method,
    headers: req.headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req : null,
    duplex: 'half'
  });

  try {
    console.log(`[${requestId}] Passing request to worker.fetch...`);
    const webResponse = await worker.fetch(webRequest);
    console.log(`[${requestId}] Received response from worker.fetch.`);
    console.log(`[${requestId}] Worker Response Status: ${webResponse.status}`);
    console.log(`[${requestId}] Worker Response Headers: ${JSON.stringify(Object.fromEntries(webResponse.headers), null, 2)}`);

    // 将 worker 的响应写回给客户端
    res.writeHead(webResponse.status, webResponse.statusText, Object.fromEntries(webResponse.headers));
    
    if (webResponse.body) {
      console.log(`[${requestId}] Piping response body to client.`);
      Readable.fromWeb(webResponse.body).pipe(res);
    } else {
      console.log(`[${requestId}] Ending response with no body.`);
      res.end();
    }
    console.log(`[${requestId}] --- Request Finished ---`);

  } catch (error) {
    console.error(`[${requestId}] !!! An unexpected error occurred in server.mjs !!!`);
    console.error(error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error. Check logs for details.');
    console.log(`[${requestId}] --- Request Finished with Error ---`);
  }
});

server.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});