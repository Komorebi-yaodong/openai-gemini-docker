# 使用官方 Deno 镜像
FROM denoland/deno:2.0.2

# 您的应用程序将监听的端口
EXPOSE 7860

# 设置工作目录
WORKDIR /app

# 为了安全起见，最好不要以 root 用户运行
USER deno

# 复制应用程序文件到工作目录
# 将 worker.mjs 和 main.ts 都复制过去
COPY worker.mjs .
COPY main.ts .

# 缓存依赖并编译主应用程序，这将加快容器的启动速度
RUN deno cache main.ts

# 运行应用程序的命令
# --allow-net 是 fetch 和网络服务所必需的
# --allow-env 用于读取 PORT 等环境变量
CMD ["run", "--allow-net", "--allow-env", "main.ts"]