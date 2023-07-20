## 安装依赖

```bash
$ npm install
```

## 运行程序

```bash
# 打包
$ npm run build

# 启动进程
$ pm2 start ./dist/main.js

# 查看pm2进程列表
$ pm2 list

# 停止进程。ID为main进程的id。
$ pm2 stop <id>
```

