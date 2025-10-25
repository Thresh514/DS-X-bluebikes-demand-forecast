# Bluebikes 实时地图系统

## 📋 项目概述

这是一个完整的 Next.js 全栈应用，集成了 Bluebikes 的实时数据 API（GBFS），展示波士顿地区的自行车共享站点实时状态。

## ✨ 功能特性

### 🗺️ 实时地图
- 使用 React Leaflet 展示所有 Bluebikes 站点
- 根据可用自行车数量显示不同颜色的标记：
  - 🟢 **绿色**：车多（>7 辆）
  - 🔵 **蓝色**：中等（4-7 辆）
  - 🟠 **橙色**：车少（1-3 辆）
  - 🔴 **红色**：无车（0 辆）
- 点击标记查看详细信息

### 📊 实时统计
- 站点总数
- 可用自行车总数
- 可用停车位总数
- 平均使用率

### 🔍 搜索与过滤
- 实时搜索站点名称
- 动态过滤显示结果

### ⏱️ 自动刷新
- 每 60 秒自动刷新数据
- 手动刷新按钮

### 🎨 美观的 UI
- 使用 shadcn ui 组件库
- 响应式设计，支持移动端
- 现代化的渐变背景和卡片设计

## 🏗️ 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI 组件**: shadcn ui
- **地图**: React Leaflet + Leaflet
- **图标**: Lucide React
- **数据源**: Bluebikes GBFS API

## 📁 项目结构

```
nextjs/
├── app/
│   ├── api/
│   │   └── bikes/
│   │       └── route.ts          # API 路由：获取并合并站点数据
│   ├── map/
│   │   └── page.tsx              # 地图页面
│   ├── layout.tsx
│   ├── page.tsx                  # 首页
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn ui 组件
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   └── loading-spinner.tsx
│   ├── bike-map.tsx              # 地图组件
│   └── bike-station-card.tsx     # 站点卡片组件
├── lib/
│   ├── types.ts                  # TypeScript 类型定义
│   └── utils.ts                  # 工具函数
└── package.json
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 打开浏览器

访问 [http://localhost:3000](http://localhost:3000)

- 首页：`/`
- 地图页面：`/map`

## 🔌 API 接口

### GET `/api/bikes`

获取所有站点的实时数据。

**响应格式：**

```json
[
  {
    "station_id": "3",
    "name": "Boylston St at Arlington St",
    "capacity": 19,
    "lat": 42.3521,
    "lon": -71.0679,
    "num_bikes_available": 4,
    "num_docks_available": 15,
    "last_reported": 1735062150
  }
]
```

**数据源：**
- Station Information: `https://gbfs.bluebikes.com/gbfs/en/station_information.json`
- Station Status: `https://gbfs.bluebikes.com/gbfs/en/station_status.json`

## 🎨 组件说明

### BikeMap 组件
位置：`components/bike-map.tsx`

**功能：**
- 渲染交互式地图
- 显示所有站点标记
- 点击标记显示弹窗信息

**Props：**
```typescript
interface BikeMapProps {
  stations: BikeStation[];
  onStationClick?: (station: BikeStation) => void;
}
```

### BikeStationCard 组件
位置：`components/bike-station-card.tsx`

**功能：**
- 显示单个站点的详细信息
- 可用自行车/停车位状态
- 使用率进度条
- 最后更新时间

**Props：**
```typescript
interface BikeStationCardProps {
  station: BikeStation;
  onClick?: () => void;
}
```

## 🎯 核心功能实现

### 1. 数据获取与合并

API Route (`app/api/bikes/route.ts`) 负责：
1. 并行请求两个 Bluebikes API
2. 按 `station_id` 合并数据
3. 返回统一格式的 JSON

### 2. 实时刷新

使用 `setInterval` 每 60 秒自动刷新：

```typescript
useEffect(() => {
  fetchStations();
  const interval = setInterval(() => {
    fetchStations(true);
  }, 60000);
  return () => clearInterval(interval);
}, []);
```

### 3. 搜索功能

实时过滤站点：

```typescript
useEffect(() => {
  if (searchQuery.trim() === "") {
    setFilteredStations(stations);
  } else {
    const filtered = stations.filter((station) =>
      station.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredStations(filtered);
  }
}, [searchQuery, stations]);
```

## 🎨 自定义样式

### 颜色主题

在 `globals.css` 中定义了完整的颜色系统：
- Primary: 蓝色系（#2563eb）
- Success: 绿色系（#10b981）
- Warning: 橙色系（#f59e0b）
- Danger: 红色系（#ef4444）

### 响应式设计

使用 Tailwind CSS 的响应式工具类：
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* 移动端：1 列，大屏幕：3 列 */}
</div>
```

## 🔧 配置文件

### tsconfig.json
已配置路径别名：
```json
{
  "paths": {
    "@/*": ["./*"]
  }
}
```

### tailwind.config.ts
使用 shadcn ui 的颜色系统和 HSL 变量。

## 📱 使用场景

1. **用户找车**：查看附近哪些站点有可用自行车
2. **用户还车**：查看哪些站点有空余停车位
3. **系统监控**：实时监控所有站点状态
4. **数据分析**：观察使用率分布

## 🚀 部署

### Vercel 部署

```bash
npm run build
vercel deploy
```

### 环境要求

- Node.js 18+
- 浏览器支持 ES2017+

## 📝 后续扩展建议

1. **数据可视化**
   - 添加图表展示使用趋势
   - 热力图显示繁忙区域

2. **预测功能**
   - 接入机器学习模型
   - 预测未来站点状态

3. **用户功能**
   - 收藏常用站点
   - 设置提醒通知

4. **数据持久化**
   - 使用数据库存储历史数据
   - 提供历史数据查询

## 📄 License

MIT

## 👨‍💻 开发者

DS-X Bluebikes Demand Forecast Team

---

**Enjoy your ride! 🚴‍♂️**

