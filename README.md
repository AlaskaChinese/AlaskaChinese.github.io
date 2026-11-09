# AlaskaChinese's Blog

一个现代化、极简、高颜值的个人技术博客，专为挂载于 **GitHub Pages** 静态网站设计。

* **博客线上地址**：`https://alaskachinese.github.io/`
* **构建技术**：基于 Antigravity 构建
* **运行计时**：自 2026 年 11 月 09 日起平稳运行，底部精确到秒动态计时

---

## ✨ 核心特性

- 🎨 **极简现代设计**：精美卡片式排版、无闪烁丝滑过渡、移动端自适应。
- 🌓 **深度适配深色模式**：默认跟随操作系统偏好（System），同时支持手动一键切换（跟随系统 💻 / 深色 🌙 / 浅色 ☀️）。
- 📝 **双轨极速更新体系**：
  - **方法一（在线网页发布器）**：网页端内置“GitHub 管理”控制台，登录博主本人 Token 后，可在手机或任意电脑上在线写作 Markdown，点击“一键发布”直接通过 GitHub REST API 自动提交并更新上线！
  - **方法二（本地一键脚本）**：本地提供 `.\new-post.ps1` 命令行工具，敲一行命令自动生成模板、更新索引并自动 commit + push。
- 💬 **GitHub 登录与评论系统**：
  - 基于 GitHub 官方 Discussions（Giscus）驱动，任何访客均可使用 GitHub 账号一键登录发表评论、点赞反应与交流。
  - 博主 AlaskaChinese 拥有最高版主权限，可对任何评论进行置顶、删除、锁定和管理。
- ⏳ **实时运行时间看板**：底部动态时钟从 **2026-11-09** 开始精确到秒实时跳动。
- 🏷️ **全文即时检索与标签过滤**：毫秒级响应标题、标签、正文摘要搜索。
- 📋 **代码高亮与一键复制**：内置 Highlight.js 语法高亮，支持 PowerShell、INI、Markdown、JS 等代码一键复制。

---

## 🚀 快速上手与更新发布

### 方案 1：在网页端直接发布（推荐，免敲命令）

1. 打开博客网页，点击右上角 **「GitHub 管理」**。
2. 输入具有 `repo` 或 `Contents: Read and write` 权限的 GitHub Personal Access Token（仅保存在您的本地浏览器 LocalStorage 中）。
3. 验证通过后即可看到 **「✍️ 发布新文章」** 按钮。
4. 填写标题、Slug（文章标识）、标签与 Markdown 正文，点击 **「一键发布到 GitHub」** 即可完成自动推送！

### 方案 2：本地运行 PowerShell 脚本发布

在项目根目录下运行：

```powershell
.\new-post.ps1 -Title "你的文章标题" -Slug "article-slug" -Tags "Windows,技巧" -Push
```

脚本将自动：
1. 在 `posts/` 目录下生成 `article-slug.md` 模板。
2. 将文章元信息加入 `posts/posts.json` 与 `js/posts-data.js`。
3. 自动执行 `git add .`、`git commit` 并 `git push` 到 GitHub 仓库！

---

## ⚙️ 首次部署配置（GitHub 仓库设置）

1. **启用 GitHub Pages**：
   - 打开 GitHub 仓库：`https://github.com/AlaskaChinese/AlaskaChinese.github.io/settings/pages`
   - 在 **Build and deployment** 下，**Source** 选择 `Deploy from a branch`。
   - **Branch** 选择 `main` / `/ (root)`，点击 **Save** 即可。

2. **启用 GitHub Discussions（评论区）**：
   - 进入仓库设置：`https://github.com/AlaskaChinese/AlaskaChinese.github.io/settings`
   - 向下滚动找到 **Features** 区域。
   - 勾选 **Discussions** 选项即可启用评论区。

---

## 📁 目录结构

```text
AlaskaChinese.github.io/
├── index.html               # 博客主单页应用
├── 404.html                 # GitHub Pages 路由回退重定向
├── css/
│   └── style.css            # 现代化样式表（深浅主题变量、排版、卡片、模态框）
├── js/
│   ├── app.js               # 核心控制：路由、深浅色模式、精确到秒计时器、渲染与搜索
│   ├── admin.js             # GitHub API 认证、在线发布、编辑与删除文章
│   ├── comments.js          # Giscus (GitHub Discussions) 评论系统对接与主题联动
│   └── posts-data.js        # 文章离线/即时加载数据备用
├── posts/
│   ├── posts.json           # 博客文章元数据索引
│   └── change-drive-icons.md# 第一篇博文：更换硬盘图标的简单教程
├── assets/
│   └── ico/
│       ├── daimao1.ico      # 博主自用 C 盘图标（供访客自取）
│       └── daimao2.ico      # 博主自用 D~Z 盘图标（供访客自取）
├── new-post.ps1             # 本地一键新建文章与自动推送脚本
└── README.md
```

---

*由 Antigravity 强力构建于 2026 年 11 月 09 日。*
