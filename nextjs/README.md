# Bluebikes Demand Forecast - Next.js 应用

这是一个使用 [Next.js](https://nextjs.org) 和 [Tailwind CSS](https://tailwindcss.com) 构建的 Bluebikes 需求预测应用。

## 开始使用

首先，安装依赖：

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

然后，运行开发服务器：

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

你可以开始编辑 `app/page.tsx` 文件来修改页面内容。文件保存后页面会自动更新。

## 技术栈

- **Next.js 15** - React 框架，使用最新的 App Router
- **React 18** - UI 库
- **TypeScript** - 类型安全
- **Tailwind CSS 3** - 实用优先的 CSS 框架
- **PostCSS** - CSS 转换工具

## 项目结构

```
nextjs/
├── app/                 # App Router 目录
│   ├── layout.tsx      # 根布局
│   ├── page.tsx        # 首页
│   └── globals.css     # 全局样式（包含 Tailwind）
├── public/             # 静态资源
├── next.config.ts      # Next.js 配置
├── tailwind.config.ts  # Tailwind CSS 配置
├── tsconfig.json       # TypeScript 配置
└── package.json        # 项目依赖
```

## 构建生产版本

```bash
npm run build
npm run start
```

## 了解更多

- [Next.js 文档](https://nextjs.org/docs) - 学习 Next.js 特性和 API
- [Tailwind CSS 文档](https://tailwindcss.com/docs) - 学习 Tailwind CSS
- [Learn Next.js](https://nextjs.org/learn) - 交互式 Next.js 教程
