# WhatUDoing 数据大屏

基于 Vue 3 和 uni-app 的数据可视化大屏，用于展示 APP 收集的数据统计信息。

## 功能特性

- 📊 数据概览统计（总数据量、活跃设备等）
- 📈 数据收集趋势图（时间序列）
- 📱 设备数据量排行
- 🔋 电量分布统计
- 🌐 网络类型分布
- 📲 应用使用排行
- 🔄 自动刷新（每30秒）
- 🎨 现代化 UI 设计（渐变背景、毛玻璃效果）

## 技术栈

- Vue 3 (uni-app)
- ECharts 5 (数据可视化)
- uni.request (网络请求)

## 使用方法

### 1. 配置 API 地址

在 `pages/dashboard/dashboard.vue` 中修改 API 地址：

```javascript
apiBase: 'http://10.228.98.116:8000/api'  // 修改为你的服务器地址
```

### 2. 运行项目

#### H5 环境（推荐）

```bash
# 使用 HBuilderX 或 uni-app CLI
npm run dev:h5
```

然后在浏览器中访问数据大屏页面。

#### 其他平台

数据大屏主要针对 H5 环境优化，在其他平台（小程序、App）可能需要调整。

### 3. 访问页面

- 数据大屏路径：`pages/dashboard/dashboard`
- 在 uni-app 中通过路由跳转或直接访问

## 页面路由配置

页面已在 `pages.json` 中配置为首页，可以直接访问。

## API 接口说明

数据大屏使用以下 API 接口：

- `GET /api/dashboard/overview` - 获取数据概览
- `GET /api/dashboard/timeline` - 获取时间序列数据
- `GET /api/dashboard/devices` - 获取设备统计
- `GET /api/dashboard/battery` - 获取电量统计
- `GET /api/dashboard/network` - 获取网络统计
- `GET /api/dashboard/apps` - 获取应用统计

详细 API 文档请访问：`http://your-server:8000/docs`

## 注意事项

1. **ECharts 加载**：ECharts 会在 H5 环境下自动加载，其他环境可能需要手动配置
2. **CORS 配置**：确保服务器已配置 CORS，允许跨域请求
3. **响应式设计**：页面已适配移动端和桌面端
4. **性能优化**：图表会在页面卸载时自动销毁，避免内存泄漏

## 浏览器兼容性

- Chrome/Edge（推荐）
- Firefox
- Safari

建议使用现代浏览器以获得最佳体验。

