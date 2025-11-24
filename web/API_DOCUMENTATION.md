# API 接口文档

本文档列出了 server 提供的所有 API 接口及其使用方法。

## API 基础地址

- **开发环境**: `http://10.228.98.116:8000/api`
- **生产环境**: `/api`（相对路径）

## 数据大屏 API (`/api/dashboard`)

### 1. 获取数据概览

**接口**: `GET /api/dashboard/overview`

**参数**:
- `hours` (int, 可选): 统计最近N小时的数据，默认 24

**响应**:
```json
{
  "total_count": 1000,
  "recent_count": 100,
  "active_devices": 5,
  "total_devices": 10,
  "latest_time": "2024-01-01T12:00:00",
  "time_range": {
    "start": "2024-01-01T00:00:00",
    "end": "2024-01-01T12:00:00"
  }
}
```

### 2. 获取时间序列数据

**接口**: `GET /api/dashboard/timeline`

**参数**:
- `hours` (int, 可选): 统计最近N小时的数据，默认 24
- `interval` (string, 可选): 时间间隔，`hour` 或 `day`，默认 `hour`

**响应**:
```json
{
  "timeline": [
    {
      "time": "2024-01-01 10:00:00",
      "count": 10
    },
    {
      "time": "2024-01-01 11:00:00",
      "count": 15
    }
  ]
}
```

### 3. 获取设备统计

**接口**: `GET /api/dashboard/devices`

**参数**:
- `limit` (int, 可选): 返回前N个设备，默认 10

**响应**:
```json
{
  "devices": [
    {
      "device_id": "device_123",
      "count": 100,
      "last_seen": "2024-01-01T12:00:00"
    }
  ]
}
```

### 4. 获取电量统计

**接口**: `GET /api/dashboard/battery`

**参数**:
- `hours` (int, 可选): 统计最近N小时的数据，默认 24

**响应**:
```json
{
  "total": 50,
  "avg": 75.5,
  "min": 20,
  "max": 100,
  "distribution": {
    "0-20": 5,
    "21-40": 10,
    "41-60": 15,
    "61-80": 15,
    "81-100": 5
  }
}
```

### 5. 获取位置统计

**接口**: `GET /api/dashboard/location`

**参数**:
- `hours` (int, 可选): 统计最近N小时的数据，默认 24

**响应**:
```json
{
  "count": 100,
  "locations": [
    {
      "latitude": 39.9,
      "longitude": 116.4,
      "timestamp": 1699123456789
    }
  ]
}
```

### 6. 获取网络统计

**接口**: `GET /api/dashboard/network`

**参数**:
- `hours` (int, 可选): 统计最近N小时的数据，默认 24

**响应**:
```json
{
  "network_types": [
    {
      "type": "wifi",
      "count": 50
    },
    {
      "type": "4g",
      "count": 30
    }
  ],
  "wifi_ssids": [
    {
      "ssid": "MyWiFi",
      "count": 20
    }
  ]
}
```

### 7. 获取应用统计

**接口**: `GET /api/dashboard/apps`

**参数**:
- `hours` (int, 可选): 统计最近N小时的数据，默认 24
- `limit` (int, 可选): 返回前N个应用，默认 10

**响应**:
```json
{
  "apps": [
    {
      "name": "com.example.app",
      "count": 50
    }
  ]
}
```

## 数据 API (`/api`)

### 1. 提交数据

**接口**: `POST /api/submit`

**请求体**:
```json
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

**响应**:
```json
{
  "success": true,
  "message": "数据保存成功",
  "id": 1
}
```

### 2. 查询数据

**接口**: `GET /api/data`

**参数**:
- `device_id` (string, 可选): 设备ID，用于筛选
- `limit` (int, 可选): 返回记录数限制，默认 100
- `offset` (int, 可选): 偏移量，默认 0

**响应**: 数据列表

### 3. 根据ID查询数据

**接口**: `GET /api/data/{data_id}`

**响应**: 单条数据

### 4. 删除数据

**接口**: `DELETE /api/data/{data_id}`

**响应**:
```json
{
  "success": true,
  "message": "数据删除成功"
}
```

### 5. 获取统计信息

**接口**: `GET /api/stats`

**响应**:
```json
{
  "total_count": 1000,
  "device_stats": [
    {
      "device_id": "device_123",
      "count": 100
    }
  ]
}
```

## 使用示例

在 Vue 组件中使用 API 客户端：

```javascript
import api from '@/utils/api.js'

// 获取概览数据
const overview = await api.getOverview(24)

// 获取时间序列数据
const timeline = await api.getTimeline(24, 'hour')

// 获取设备统计
const devices = await api.getDevices(10)

// 提交数据
await api.submitData({
  device_id: 'device_123',
  timestamp: Date.now(),
  data: {...}
})
```

## 错误处理

所有 API 调用都会自动处理：
- HTTP 状态码检查
- HTML 响应检测（路由错误）
- 错误日志记录
- 异常抛出

如果遇到错误，会在控制台输出详细日志。

