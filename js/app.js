/**
 * AlaskaChinese Blog - Core Application Controller
 * Manages routing, theme detection, real-time timer, rendering & search.
 */

const App = {
  // Site launch timestamp: 2026-11-09 00:00:00 CST (UTC+8)
  START_TIME: new Date('2026-11-09T00:00:00+08:00').getTime(),
  
  posts: [],
  postCache: {},
  activeTag: null,
  searchQuery: '',
  themeMode: 'auto', // 'auto' | 'light' | 'dark'

  async init() {
    this.initTheme();
    this.initTimer();
    this.bindGlobalEvents();
    await this.loadPosts();
    this.handleRoute();
    window.addEventListener('hashchange', () => this.handleRoute());
  },

  /* -------------------------------------------------------------
   * Theme Management (Follows System by Default)
   * ------------------------------------------------------------- */
  initTheme() {
    const saved = localStorage.getItem('ac_theme_mode') || 'auto';
    this.setThemeMode(saved, false);

    // Watch system color scheme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.themeMode === 'auto') {
        this.applyTheme();
      }
    });

    const themeToggleBtn = document.getElementById('btn-theme-toggle');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const nextMode = this.themeMode === 'auto' ? 'dark' : (this.themeMode === 'dark' ? 'light' : 'auto');
        this.setThemeMode(nextMode, true);
      });
    }
  },

  setThemeMode(mode, showNotice = false) {
    this.themeMode = mode;
    localStorage.setItem('ac_theme_mode', mode);
    this.applyTheme();

    const labelMap = {
      auto: '跟随系统 💻',
      dark: '深色模式 🌙',
      light: '浅色模式 ☀️'
    };

    const themeIcon = document.getElementById('theme-icon');
    const themeLabel = document.getElementById('theme-label');
    if (themeLabel) themeLabel.innerText = labelMap[mode] || mode;

    if (themeIcon) {
      if (mode === 'dark') {
        themeIcon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
      } else if (mode === 'light') {
        themeIcon.innerHTML = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
      } else {
        themeIcon.innerHTML = `<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line>`;
      }
    }

    if (showNotice) {
      this.showToast(`主题模式切换为：${labelMap[mode]}`);
    }

    if (window.Comments) {
      window.Comments.updateTheme();
    }
  },

  applyTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = this.themeMode === 'dark' || (this.themeMode === 'auto' && prefersDark);

    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  /* -------------------------------------------------------------
   * Site Running Tracker (Accurate to Seconds from 2026-11-09)
   * ------------------------------------------------------------- */
  initTimer() {
    const timerElem = document.getElementById('site-runtime-digits');
    if (!timerElem) return;

    const update = () => {
      const now = Date.now();
      let diff = Math.max(0, now - this.START_TIME);

      const seconds = Math.floor((diff / 1000) % 60);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      timerElem.innerText = `${days} 天 ${hours.toString().padStart(2, '0')} 小时 ${minutes.toString().padStart(2, '0')} 分 ${seconds.toString().padStart(2, '0')} 秒`;
    };

    update();
    setInterval(update, 1000);
  },

  /* -------------------------------------------------------------
   * Load Posts from JSON with Fallback
   * ------------------------------------------------------------- */
  async loadPosts() {
    try {
      const res = await fetch('posts/posts.json?t=' + Date.now());
      if (res.ok) {
        this.posts = await res.json();
      } else {
        this.posts = window.POSTS_DATA || [];
      }
    } catch (e) {
      console.warn('Using embedded POSTS_DATA fallback.');
      this.posts = window.POSTS_DATA || [];
    }

    this.renderTagCloud();
  },

  /* -------------------------------------------------------------
   * Hash Router
   * ------------------------------------------------------------- */
  handleRoute() {
    const hash = window.location.hash || '#/';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (hash.startsWith('#/post/')) {
      const postId = hash.replace('#/post/', '').trim();
      this.showPostView(postId);
    } else if (hash.startsWith('#/tag/')) {
      const tag = decodeURIComponent(hash.replace('#/tag/', '').trim());
      this.activeTag = tag;
      this.showListView();
    } else {
      this.activeTag = null;
      this.showListView();
    }
  },

  showListView() {
    const listSection = document.getElementById('list-view-section');
    const postSection = document.getElementById('post-view-section');
    if (listSection) listSection.style.display = 'block';
    if (postSection) postSection.classList.remove('active');

    this.renderPostList();
  },

  /* -------------------------------------------------------------
   * Render Post List & Tags
   * ------------------------------------------------------------- */
  renderTagCloud() {
    const container = document.getElementById('tag-cloud');
    if (!container) return;

    const tagCounts = {};
    this.posts.forEach(p => {
      (p.tags || []).forEach(t => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    });

    let html = `
      <span class="tag-pill ${!this.activeTag ? 'active' : ''}" data-tag="">全部 (${this.posts.length})</span>
    `;

    Object.keys(tagCounts).forEach(tag => {
      const isActive = this.activeTag === tag;
      html += `
        <span class="tag-pill ${isActive ? 'active' : ''}" data-tag="${tag}">
          #${tag} (${tagCounts[tag]})
        </span>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.tag-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const tag = pill.getAttribute('data-tag');
        if (tag) {
          window.location.hash = `#/tag/${encodeURIComponent(tag)}`;
        } else {
          window.location.hash = '#/';
        }
      });
    });
  },

  renderPostList() {
    const container = document.getElementById('post-list');
    if (!container) return;

    let filtered = this.posts.filter(p => {
      const matchTag = !this.activeTag || (p.tags && p.tags.includes(this.activeTag));
      const matchQuery = !this.searchQuery || 
        p.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.summary.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(this.searchQuery.toLowerCase())));
      return matchTag && matchQuery;
    });

    this.renderTagCloud();

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted); background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">🔍 没有找到匹配的文章</p>
          <p style="font-size: 0.9rem;">请尝试更换搜索关键词或选择其他标签</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(post => {
      const tagsHtml = (post.tags || []).map(t => `<span class="badge">#${t}</span>`).join(' ');
      return `
        <article class="post-card" onclick="window.location.hash='#/post/${post.id}'">
          <h2 class="post-card-title">${post.title}</h2>
          <p class="post-card-summary">${post.summary}</p>
          <div class="post-card-meta">
            <div class="post-meta-group">
              <span>📅 ${post.date}</span>
              <span>⏱️ ${post.readTime || '3 分钟'}</span>
              <div style="display:inline-flex; gap:0.35rem;">${tagsHtml}</div>
            </div>
            <div class="post-card-readmore">阅读全文 →</div>
          </div>
        </article>
      `;
    }).join('');
  },

  /* -------------------------------------------------------------
   * Render Single Post View
   * ------------------------------------------------------------- */
  async showPostView(postId) {
    const listSection = document.getElementById('list-view-section');
    const postSection = document.getElementById('post-view-section');
    if (listSection) listSection.style.display = 'none';
    if (postSection) postSection.classList.add('active');

    const post = this.posts.find(p => p.id === postId);
    if (!post) {
      document.getElementById('article-content').innerHTML = `
        <div style="text-align:center; padding: 3rem;">
          <h2>未找到指定文章</h2>
          <p style="margin-top: 1rem;"><a href="#/">← 返回文章列表</a></p>
        </div>
      `;
      return;
    }

    document.getElementById('article-title').innerText = post.title;
    document.getElementById('article-date').innerText = `📅 发布于 ${post.date}`;
    document.getElementById('article-readtime').innerText = `⏱️ 阅读时长约 ${post.readTime || '3 分钟'}`;
    
    const tagsContainer = document.getElementById('article-tags');
    if (tagsContainer) {
      tagsContainer.innerHTML = (post.tags || []).map(t => `<span class="badge badge-accent">#${t}</span>`).join('');
    }

    this.refreshAuthorToolbar(post);

    // Load Markdown Content
    const contentBox = document.getElementById('article-content');
    contentBox.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-muted);">正在加载文章正文...</div>`;

    try {
      let mdText = this.postCache[post.id];
      if (!mdText) {
        const res = await fetch(post.file);
        if (!res.ok) throw new Error('Markdown 文件加载失败');
        mdText = await res.text();
        this.postCache[post.id] = mdText;
      }

      this.renderMarkdown(mdText, post);
    } catch (err) {
      contentBox.innerHTML = `
        <div style="padding: 2rem; border: 1px dashed var(--danger); border-radius: var(--radius-md); color: var(--danger);">
          <p>⚠️ 无法加载文章文件 (${post.file})</p>
          <p style="font-size: 0.9rem; margin-top: 0.5rem; color: var(--text-secondary);">${err.message}</p>
        </div>
      `;
    }

    // Load Comments
    if (window.Comments) {
      window.Comments.load(post.id, post.title);
    }
  },

  renderMarkdown(mdText, post) {
    const contentBox = document.getElementById('article-content');
    if (!contentBox) return;

    // Configure marked with highlight.js
    marked.setOptions({
      highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
      },
      breaks: true,
      gfm: true
    });

    contentBox.innerHTML = marked.parse(mdText);

    // Decorate code blocks with headers and copy buttons
    contentBox.querySelectorAll('pre').forEach((pre) => {
      const codeElem = pre.querySelector('code');
      const langClass = Array.from(codeElem?.classList || []).find(c => c.startsWith('language-'));
      const lang = langClass ? langClass.replace('language-', '') : 'text';

      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';

      const header = document.createElement('div');
      header.className = 'code-block-header';
      header.innerHTML = `
        <span>${lang.toUpperCase()}</span>
        <button class="copy-code-btn" type="button">复制代码</button>
      `;

      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(header);
      wrapper.appendChild(pre);

      const copyBtn = header.querySelector('.copy-code-btn');
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(codeElem.innerText).then(() => {
          copyBtn.innerText = '已复制 ✓';
          setTimeout(() => copyBtn.innerText = '复制代码', 2000);
        });
      });
    });
  },

  refreshAuthorToolbar(currentPost = null) {
    const toolbar = document.getElementById('article-author-toolbar');
    if (!toolbar) return;

    if (window.Admin && window.Admin.state.isAuthor) {
      toolbar.style.display = 'flex';
      toolbar.innerHTML = `
        <button class="btn btn-secondary" style="font-size:0.8rem; padding: 0.35rem 0.75rem;" id="btn-edit-current-post">
          ✏️ 编辑文章
        </button>
        <button class="btn btn-danger" style="font-size:0.8rem; padding: 0.35rem 0.75rem;" id="btn-delete-current-post">
          🗑️ 删除文章
        </button>
      `;

      const editBtn = document.getElementById('btn-edit-current-post');
      const deleteBtn = document.getElementById('btn-delete-current-post');

      if (editBtn && currentPost) {
        editBtn.addEventListener('click', () => {
          window.Admin.openModal();
          window.Admin.showPostEditor({
            ...currentPost,
            content: this.postCache[currentPost.id] || ''
          });
        });
      }

      if (deleteBtn && currentPost) {
        deleteBtn.addEventListener('click', () => {
          window.Admin.deletePost(currentPost.id);
        });
      }
    } else {
      toolbar.style.display = 'none';
    }
  },

  /* -------------------------------------------------------------
   * Global Event Listeners & Search
   * ------------------------------------------------------------- */
  bindGlobalEvents() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        this.renderPostList();
      });
    }

    const backToListBtn = document.getElementById('btn-back-to-list');
    if (backToListBtn) {
      backToListBtn.addEventListener('click', () => {
        window.location.hash = '#/';
      });
    }
  },

  /* -------------------------------------------------------------
   * Toast Notifications
   * ------------------------------------------------------------- */
  showToast(message, duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

window.App = App;

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
  if (window.Admin) window.Admin.init();
});
