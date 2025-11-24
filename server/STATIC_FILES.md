# 静态文件服务说明

FastAPI 服务器会自动托管 `web` 目录下的前端项目。

## 目录结构

```
项目根目录/
├── server/          # FastAPI 服务器
│   └── main.py      # 主文件（包含静态文件服务配置）
└── web/             # 前端项目目录
    ├── index.html   # 前端入口文件（开发模式）
    ├── main.js      # 前端主文件（开发模式）
    ├── static/      # 静态资源目录
    ├── pages/       # 页面目录
    └── unpackage/   # 构建输出目录
        └── dist/
            └── build/
                └── web/  # 构建后的前端文件（生产环境）
                    ├── index.html
                    ├── assets/
                    └── static/
```

## 目录优先级

FastAPI 会按以下优先级查找前端文件：

1. **构建输出目录**（生产环境）：`web/unpackage/dist/build/web`
   - 如果此目录存在，优先使用构建后的文件
   - 这是 uni-app 构建后的输出目录

2. **源目录**（开发模式）：`web/`
   - 如果构建目录不存在，使用源目录
   - 适用于开发环境

## 路由规则

1. **API 路由**（优先级最高）
   - `/api/*` - 数据 API
   - `/api/dashboard/*` - 数据大屏 API
   - `/health` - 健康检查

2. **静态文件路由**
   - `/static/*` - 静态资源（图片、CSS、JS 等）
   - 其他文件路径 - 直接返回对应文件

3. **SPA 路由支持**
   - 如果请求的文件不存在，返回 `index.html`（支持前端路由）

## 访问方式

启动服务器后：

- **前端首页**：http://localhost:8000/
- **数据大屏**：http://localhost:8000/pages/dashboard/dashboard
- **API 文档**：http://localhost:8000/docs
- **静态资源**：http://localhost:8000/static/logo.png

## 注意事项

1. **API 地址配置**：前端代码中的 API 地址应使用相对路径 `/api`，这样会自动适配当前服务器地址。

2. **CORS 配置**：服务器已配置 CORS，允许跨域请求。

3. **安全性**：静态文件服务会检查文件路径，确保只能访问 `web` 目录内的文件。

4. **开发模式**：如果使用 `reload=True` 启动，修改前端文件后需要手动刷新浏览器。

5. **构建输出**：uni-app 构建后的文件位于 `web/unpackage/dist/build/web`，FastAPI 会自动检测并使用此目录（如果存在）。启动服务器时会在控制台显示使用的目录。

