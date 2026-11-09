# AlaskaChinese's Blog

AlaskaChinese 的个人博客，架构与主题样式深度参考并学习自 [Ranch007/Ranch007.github.io](https://github.com/Ranch007/Ranch007.github.io)。

* **线上博客地址**：[https://alaskachinese.github.io/](https://alaskachinese.github.io/)
* **静态框架**：[Hugo (Extended)](https://gohugo.io/)
* **博客主题**：[hugo-theme-stack (Stack 主题魔改美化版)](https://github.com/CaiJimmy/hugo-theme-stack)
* **智能构建**：基于 **Antigravity** 强力构建
* **部署流程**：基于 GitHub Actions CI/CD 自动构建并发布至 `gh-pages` 分支

---

## ✨ 特性与视觉定制

- 🎨 **Stack 深度魔改美化**：
  - 继承 Naive Koala 大佬的圆角与高质感阴影设计（全局卡片圆角 25px、标签圆角 8px）。
  - 首页个性化欢迎动态横幅（`Welcome back to AlaskaChinese's Blog ！` 字符跳动特效）。
  - 顶部加载进度条（NProgress）无缝集成。
  - macOS 风格代码高亮窗口头与一键代码复制。
- 🌓 **深浅色模式自动适配**：
  - 默认根据访客系统偏好（System）智能切换深色 / 浅色模式。
  - 侧边栏提供独立深色/浅色模式切换按钮。
- ⏳ **实时运行时间看板**：
  - 页脚动态时钟从 **2026-11-09** 开始精确到秒实时跳动。
  - 标明版权声明与 **「使用 Antigravity 强力构建」**。
- 💬 **Giscus (GitHub Discussions) 评论系统**：
  - 支持访客使用 GitHub 账号登录留言交流、表情互动与回复。
  - 博主拥有完整置顶、审核与删除权限。
- 📄 **全功能独立页面**：
  - 📚 **归档 (`/archives/`)**：按年份与月份清晰梳理历史博文。
  - 🔍 **搜索 (`/search/`)**：站内全文即时搜索。
  - 🔗 **友链 (`/links/`)**：精致的友情链接展示卡片。
  - 💬 **留言 (`/talk/`)**：专属讨论与交流留言板。
  - 👤 **关于 (`/about/`)**：博主个人介绍与博客初衷。

---

## 🚀 极速写作与发布流程

得益于 GitHub Actions 全自动 CI/CD，你只需关注 Markdown 内容创作，提交到仓库即可自动上线：

### 方法 1：使用本地一键脚本（推荐）

在项目根目录下执行：

```powershell
.\new-post.ps1 -Title "你的文章标题" -Slug "article-slug" -Category "系统美化" -Tags "Windows,技巧" -Push
```

脚本将自动在 `content/post/article-slug/` 下生成标准 Frontmatter 的 `index.md` 模板，并在确认后自动提交推送到 GitHub，触发 Actions 自动编译发布！

### 方法 2：本地预览与创作

如需在本地实时预览编写效果：

```powershell
hugo server -D
```

打开浏览器访问 `http://localhost:1313/` 即可享受毫秒级热重载预览！

---

## ⚙️ GitHub 仓库设置（一次性配置）

1. **GitHub Pages 部署分支选择**：
   - 打开：`https://github.com/AlaskaChinese/AlaskaChinese.github.io/settings/pages`
   - **Source** 选择：`Deploy from a branch`
   - **Branch** 选择：`gh-pages` / `/(root)`
   - 点击 **Save** 保存。
   - *(提示：当推送代码后，GitHub Actions 会自动创建 `gh-pages` 分支并完成静态资源部署)*

2. **启用 GitHub Discussions（评论区）**：
   - 打开：`https://github.com/AlaskaChinese/AlaskaChinese.github.io/settings`
   - 在 **Features** 区域勾选 **Discussions** 即可。

---

## 📁 目录架构

```text
AlaskaChinese.github.io/
├── .github/workflows/deploy.yaml  # GitHub Actions 自动化编译部署工作流
├── archetypes/                     # 文章与分类新建模板
├── assets/
│   ├── icons/                     # 侧边栏与系统 SVG 图标
│   ├── img/                       # 头像与 Favicon
│   └── scss/custom.scss           # 主题深度魔改样式表
├── content/
│   ├── post/                      # 博客文章目录
│   │   └── change-drive-icons/    # 更换硬盘图标教程文章包
│   └── page/                      # 归档、搜索、友链、留言、关于等页面
├── layouts/                       # 首页欢迎横幅、侧边栏、页脚等自定义模板
├── scripts/
│   └── compress-images.py         # 图片自动压缩优化脚本
├── static/                        # 静态资源与下载文件（daimao1.ico, daimao2.ico 等）
├── themes/hugo-theme-stack/       # Stack 官方主题 Submodule
├── hugo.yaml                      # Hugo 全局核心配置文件
├── new-post.ps1                   # 本地一键新建文章脚本
└── README.md
```

---

*参考学习自 [Ranch007](https://github.com/Ranch007/Ranch007.github.io)，由 Antigravity 强力构建于 2026 年 11 月 09 日。*
