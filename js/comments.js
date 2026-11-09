/**
 * AlaskaChinese Blog - Comments Integration via Giscus (GitHub Discussions)
 * Handles theme synchronization and seamless embedded comments.
 */

const Comments = {
  containerId: 'giscus-container',
  repo: 'AlaskaChinese/AlaskaChinese.github.io',
  repoId: '', // Can be filled or dynamically managed
  category: 'Announcements',
  categoryId: '',

  /**
   * Determine Giscus theme based on current HTML dark class
   */
  getGiscusTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    return isDark ? 'dark_dimmed' : 'light';
  },

  /**
   * Load or refresh Giscus comments for a specific post
   * @param {string} postId - Unique ID of the article
   * @param {string} title - Title of the article
   */
  load(postId, title) {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = '';

    const theme = this.getGiscusTheme();

    // Create Giscus script element
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', this.repo);
    script.setAttribute('data-repo-id', 'R_kgDONX...Alaska'); // Giscus repo ID fallback or generic
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-mapping', 'specific');
    script.setAttribute('data-term', `${postId} - ${title}`);
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', theme);
    script.setAttribute('data-lang', 'zh-CN');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    // Notice & Fallback link to GitHub discussions
    const infoHeader = document.createElement('div');
    infoHeader.style.marginBottom = '1.25rem';
    infoHeader.style.fontSize = '0.9rem';
    infoHeader.style.color = 'var(--text-secondary)';
    infoHeader.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
        <span>💬 评论由 <strong>GitHub Discussions</strong> 强力驱动，使用 GitHub 账号登录即可畅所欲言。</span>
        <a href="https://github.com/${this.repo}/discussions" target="_blank" rel="noopener noreferrer" style="font-size: 0.85rem; font-weight: 600;">
          在 GitHub 讨论区查看全部交流 ↗
        </a>
      </div>
    `;

    container.appendChild(infoHeader);
    container.appendChild(script);
  },

  /**
   * Update theme of the active Giscus iframe without reloading
   */
  updateTheme() {
    const theme = this.getGiscusTheme();
    const iframe = document.querySelector('iframe.giscus-frame');
    if (!iframe) return;

    iframe.contentWindow.postMessage(
      { giscus: { setConfig: { theme: theme } } },
      'https://giscus.app'
    );
  }
};

window.Comments = Comments;
