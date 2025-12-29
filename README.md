# QuickPin

<p align="center">
  <img src="public/icon/icon.png" width="80" height="80" alt="QuickPin Logo">
</p>

<p align="center">
  一款简洁优雅的浮动书签管理器浏览器扩展。<br>
  在任何网页上快速保存、整理和访问你的书签。
</p>

<p align="center">
  <a href="./README_EN.md">English</a>
</p>

## ✨ 功能特点

- **浮动小组件** - 可拖拽的按钮悬浮在每个页面上，随时可用
- **快速保存** - 一键保存书签，支持分类选择
- **智能分类** - 使用彩色分类整理书签
- **即时搜索** - 实时搜索快速找到任何书签
- **跨标签同步** - 面板状态在所有浏览器标签页间同步
- **深色模式** - 自动适配系统深色主题
- **简洁界面** - 现代简约设计，不打扰你的浏览

## 🚀 安装

### 从源码安装

1. 克隆仓库
```bash
git clone https://github.com/your-username/quickpin.git
cd quickpin
```

2. 安装依赖
```bash
pnpm install
```

3. 构建扩展
```bash
pnpm build
```

4. 在 Chrome 中加载
   - 打开 `chrome://extensions/`
   - 开启「开发者模式」
   - 点击「加载已解压的扩展程序」
   - 选择 `.output/chrome-mv3` 文件夹

### 开发模式

```bash
# 启动开发服务器（热重载）
pnpm dev

# 为 Firefox 构建
pnpm build:firefox
```

## 🎯 使用方法

1. **点击浮动按钮** - 在任何网页上点击打开书签面板
2. **保存当前页面** - 选择分类后点击「保存」
3. **创建分类** - 点击「新建分类」整理你的书签
4. **搜索书签** - 使用搜索框快速查找
5. **拖动按钮** - 将按钮拖到屏幕任意位置
6. **点击书签** - 在新标签页中打开

## 🛠 技术栈

- [WXT](https://wxt.dev/) - 新一代浏览器扩展框架
- [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
- [Tailwind CSS v4](https://tailwindcss.com/) - 原子化 CSS 框架

## 📁 项目结构

```
quickpin/
├── entrypoints/
│   ├── content/          # 内容脚本（浮动小组件）
│   │   ├── components/   # Vue 组件
│   │   ├── App.vue       # 主应用组件
│   │   └── index.ts      # 入口文件
│   └── popup/            # 扩展弹窗
├── services/             # 业务逻辑
│   ├── bookmark.ts       # 书签操作
│   ├── category.ts       # 分类操作
│   └── storage.ts        # 存储抽象
├── types/                # TypeScript 类型
└── public/               # 静态资源
```

## 📄 许可证

MIT License - 可自由用于个人或商业用途。

---

Made with ❤️ by 热爱整洁书签的开发者
