# 使用一个较新的、轻量的 Node.js 镜像
FROM node:20-slim

# 设置工作目录
WORKDIR /app

# 复制 package.json 文件并安装依赖（即使没有依赖，这也是个好习惯）
COPY package.json .
# 如果你有依赖，这行会安装它们。没有的话，它会很快执行完毕。
RUN npm install --omit=dev

# 复制所有项目文件到工作目录
COPY . .

# 从环境变量设置端口，并暴露它
ENV PORT=3000
EXPOSE 3000

USER root

# 容器启动时运行的命令
CMD [ "npm", "start" ]