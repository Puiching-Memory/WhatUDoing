# ECharts 安装说明

## 安装 ECharts

在 `web` 目录下执行：

```bash
cd web
npm install
```

或者使用 yarn：

```bash
cd web
yarn install
```

## 依赖说明

项目已配置 `package.json`，包含以下依赖：

- `echarts`: ^5.4.3 - ECharts 图表库

## 使用方式

ECharts 已通过 ES6 模块导入方式引入，在 `dashboard.vue` 中：

```javascript
// #ifdef H5
import * as echarts from 'echarts'
// #endif
```

## 构建说明

1. **开发环境**：直接运行即可，ECharts 会通过模块导入加载
2. **生产环境**：构建时会自动打包 ECharts，无需额外配置

## 注意事项

- ECharts 仅在 H5 环境中使用（通过条件编译 `#ifdef H5`）
- 如果使用 HBuilderX，需要在项目根目录执行 `npm install`
- 确保 Node.js 版本 >= 12.0

## 验证安装

安装完成后，可以检查 `node_modules` 目录是否存在 `echarts` 文件夹：

```bash
ls node_modules/echarts
```

或者检查 `package-lock.json` 文件是否已生成。

