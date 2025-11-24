# 使用说明

## 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 配置（可选）

可以通过环境变量配置：

- `DATABASE_URL`: 数据库连接URL（默认：`sqlite:///./data.db`）
- `DATA_EXPIRY_DAYS`: 数据过期天数（默认：30天）

例如：

```bash
# Windows
set DATABASE_URL=sqlite:///./data.db
set DATA_EXPIRY_DAYS=30

# Linux/Mac
export DATABASE_URL=sqlite:///./data.db
export DATA_EXPIRY_DAYS=30
```

### 3. 启动服务器

```bash
# Windows
python main.py
# 或
start.bat

# Linux/Mac
python main.py
# 或
chmod +x start.sh
./start.sh
```

服务器将在 `http://localhost:8000` 启动。

### 4. 访问 API 文档

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## APP 端配置

在 `APP/utils/config.js` 中配置服务器地址：

```javascript
export default {
	// 修改为你的服务器地址
	serverUrl: 'http://your-server-ip:8000',
	
	// 数据发送间隔（毫秒）
	sendInterval: 5 * 60 * 1000, // 5分钟
	
	// 是否在应用隐藏时继续发送
	keepSendingWhenHidden: false
}
```

## 数据清理

系统会自动每天执行一次过期数据清理任务。默认保留最近30天的数据。

清理任务在服务器启动时自动开始，每天执行一次。

## API 接口说明

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

### 健康检查

```
GET /health
```

## 注意事项

1. 生产环境建议修改 CORS 配置，限制允许的域名
2. 生产环境建议使用更强大的数据库（如 PostgreSQL、MySQL）
3. 建议配置 HTTPS
4. 可以根据实际需求调整数据过期时间

