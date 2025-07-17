import worker from "./worker.mjs";

// 从环境变量中获取端口，如果未设置则默认为 8000
const port = parseInt(Deno.env.get("PORT") || "8000");

console.log(`HTTP server listening on http://localhost:${port}`);

// Deno.serve 会启动服务器并使用 worker.fetch 处理请求
Deno.serve({ port }, worker.fetch);