# WhatUDoing Data Server

FastAPI 服务器，用于接收和存储 APP 收集的数据。

## 功能特性

- 接收 APP 发送的数据
- 数据持久化存储（SQLite）
- 自动清理过期数据（默认保留30天）
- RESTful API 接口
- CORS 支持
- **前端页面托管**：自动托管 web 目录下的前端项目

## 安装和运行

### 1. 安装依赖

```bash
cd server
uv venv --python 3.13 --seed
uv pip install -r requirements.txt
```

### 2. 运行服务器

```bash
python main.py
```

或者使用 uvicorn：

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

服务器将在 `http://localhost:8000` 启动。

### 3. 构建前端项目（可选）

如果需要使用构建后的前端文件（推荐生产环境）：

```bash
cd web
# 使用 HBuilderX 或 uni-app CLI 构建 H5 版本
# 构建输出目录：web/unpackage/dist/build/web
```

**注意**：FastAPI 会自动检测构建输出目录，如果存在则优先使用构建后的文件，否则使用源文件（开发模式）。

### 4. 访问前端页面

启动服务器后，可以直接在浏览器中访问：

- **前端首页**：http://localhost:8000/
- **数据大屏**：http://localhost:8000/pages/dashboard/dashboard
- **API 文档**：http://localhost:8000/docs

前端页面会自动从 FastAPI 服务器加载，无需单独启动前端服务器。

## API 文档

启动服务器后，访问以下地址查看 API 文档：

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 环境变量

可以通过环境变量配置：

- `DATABASE_URL`: 数据库连接URL（默认：`sqlite:///./data.db`）
- `DATA_EXPIRY_DAYS`: 数据过期天数（默认：30天）

## API 接口

### 提交数据

```
POST /api/submit
Content-Type: application/json

{
  "device_id": "device_123",
  "timestamp": 1699123456789,
  "data": {
    "battery": {...},
    "location": {...},
    ...
  }
}
```

### 查询数据

```
GET /api/data?device_id=device_123&limit=100&offset=0
```

### 获取统计信息

```
GET /api/stats
```

## 数据清理

系统会自动在每天执行一次过期数据清理任务。默认保留最近30天的数据，可以通过 `DATA_EXPIRY_DAYS` 环境变量配置。

