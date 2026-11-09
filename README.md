# AlaskaChinese's Blog

AlaskaChinese 的个人博客，基于 Hugo + Stack 主题定制构建。

* **线上博客地址**：[https://alaskachinese.github.io/](https://alaskachinese.github.io/)
* **静态框架**：[Hugo (Extended)](https://gohugo.io/)
* **博客主题**：[hugo-theme-stack](https://github.com/CaiJimmy/hugo-theme-stack)

---

## ✨ 核心特性

- 🎨 **极简现代视觉**：卡片大圆角、优雅标签、macOS 风格代码高亮窗口头与一键代码复制。
- 🌈 **个性化横幅**：首页欢迎动态横幅（`Welcome back to AlaskaChinese's Blog ！` 字符跳动特效）。
- 🌓 **深浅色模式自适应**：默认根据访客系统偏好（System）智能切换深色/浅色模式，并支持侧边栏手动切换。
- ⏳ **实时运行时间看板**：页脚动态时钟从 **2026-11-09** 开始精确到秒实时跳动。
- 💬 **Giscus (GitHub Discussions) 评论系统**：支持访客使用 GitHub 账号登录留言交流、表情互动与回复。
- 📄 **全功能独立页面**：
  - 📚 **归档 (`/archives/`)**：按年份与月份清晰梳理历史博文。
  - 🔍 **搜索 (`/search/`)**：站内全文即时搜索。
  - 🔗 **友链 (`/links/`)**：精致的友情链接展示卡片。
  - 💬 **留言 (`/talk/`)**：专属讨论与交流留言板。
  - 👤 **关于 (`/about/`)**：博主个人介绍。

---

## 🚀 写作与发布流程

### 方法 1：使用本地一键脚本（推荐）

在项目根目录下执行：

```powershell
.\new-post.ps1 -Title "你的文章标题" -Slug "article-slug" -Category "系统美化" -Tags "Windows,技巧" -Push
```

脚本将自动在 `content/post/article-slug/` 下生成标准 Frontmatter 的 `index.md` 模板，并在确认后自动提交推送到 GitHub，触发自动编译发布！

### 方法 2：本地预览与创作

如需在本地实时预览编写效果：

```powershell
hugo server -D
```

打开浏览器访问 `http://localhost:1313/` 即可边写边实时预览。

---

## 📁 目录架构

```text
AlaskaChinese.github.io/
├── .github/workflows/deploy.yaml  # GitHub Actions 自动化编译部署工作流
├── archetypes/                     # 文章与分类新建模板
├── assets/
│   ├── icons/                     # 侧边栏与系统 SVG 图标
│   ├── img/                       # 头像与 Favicon
│   └── scss/custom.scss           # 主题样式表
├── content/
│   ├── post/                      # 博客文章目录
│   │   └── change-drive-icons/    # 更换硬盘图标教程文章包
│   └── page/                      # 归档、搜索、友链、留言、关于等页面
├── layouts/                       # 首页欢迎横幅、侧边栏、页脚等自定义模板
├── scripts/
│   └── compress-images.py         # 图片自动压缩优化脚本
├── static/                        # 静态资源与下载文件（daimao1.ico, daimao2.ico 等）
├── themes/hugo-theme-stack/       # Stack 主题 Submodule
├── hugo.yaml                      # Hugo 全局核心配置文件
├── new-post.ps1                   # 本地一键新建文章脚本
└── README.md
```
