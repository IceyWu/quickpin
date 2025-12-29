# QuickPin

<p align="center">
  <img src="public/icon/icon.png" width="80" height="80" alt="QuickPin Logo">
</p>

<p align="center">
  A sleek floating bookmark manager for your browser.<br>
  Save, organize, and access your bookmarks instantly from any webpage.
</p>

<p align="center">
  <a href="./README.md">中文</a>
</p>

## ✨ Features

- **Floating Widget** - Draggable button that stays on every page, always within reach
- **Quick Save** - One-click bookmark saving with category selection
- **Smart Categories** - Organize bookmarks with color-coded categories
- **Instant Search** - Find any bookmark quickly with real-time search
- **Cross-Tab Sync** - Panel state syncs across all browser tabs
- **Dark Mode** - Automatic dark theme support
- **Clean UI** - Modern, minimal design that doesn't get in your way

## 🚀 Installation

### From Source

1. Clone the repository
```bash
git clone https://github.com/your-username/quickpin.git
cd quickpin
```

2. Install dependencies
```bash
pnpm install
```

3. Build the extension
```bash
pnpm build
```

4. Load in Chrome
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `.output/chrome-mv3` folder

### Development

```bash
# Start dev server with hot reload
pnpm dev

# Build for Firefox
pnpm build:firefox
```

## 🎯 Usage

1. **Click the floating button** on any webpage to open the bookmark panel
2. **Save current page** by selecting a category and clicking "Save"
3. **Create categories** to organize your bookmarks
4. **Search bookmarks** using the search box
5. **Drag the button** to reposition it anywhere on screen
6. **Click a bookmark** to open it in a new tab

## 🛠 Tech Stack

- [WXT](https://wxt.dev/) - Next-gen Web Extension Framework
- [Vue 3](https://vuejs.org/) - Progressive JavaScript Framework
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS

## 📁 Project Structure

```
quickpin/
├── entrypoints/
│   ├── content/          # Content script (floating widget)
│   │   ├── components/   # Vue components
│   │   ├── App.vue       # Main app component
│   │   └── index.ts      # Entry point
│   └── popup/            # Extension popup
├── services/             # Business logic
│   ├── bookmark.ts       # Bookmark operations
│   ├── category.ts       # Category operations
│   └── storage.ts        # Storage abstraction
├── types/                # TypeScript types
└── public/               # Static assets
```

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

Made with ❤️ by developers who love clean bookmarks
