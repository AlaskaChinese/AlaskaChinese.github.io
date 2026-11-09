/**
 * AlaskaChinese Blog - Author Studio & GitHub Admin
 * Allows publishing, managing, editing posts and moderating comments
 * using GitHub REST API.
 */

const Admin = {
  OWNER: 'AlaskaChinese',
  REPO: 'AlaskaChinese.github.io',
  TOKEN_KEY: 'ac_gh_token',
  USER_KEY: 'ac_gh_user',

  state: {
    token: null,
    user: null,
    isAuthor: false,
    editingPostId: null
  },

  init() {
    this.loadCachedAuth();
    this.bindEvents();
    this.updateUI();
  },

  loadCachedAuth() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);
    if (token && userStr) {
      try {
        this.state.token = token;
        this.state.user = JSON.parse(userStr);
        this.state.isAuthor = this.state.user.login.toLowerCase() === this.OWNER.toLowerCase();
      } catch (e) {
        this.logout();
      }
    }
  },

  bindEvents() {
    const adminBtn = document.getElementById('btn-admin');
    const modal = document.getElementById('admin-modal');
    const closeBtn = document.getElementById('modal-close');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('btn-logout');
    const postForm = document.getElementById('post-form');
    const newPostBtn = document.getElementById('btn-new-post');
    const exportMdBtn = document.getElementById('btn-export-md');

    if (adminBtn) {
      adminBtn.addEventListener('click', () => this.openModal());
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal();
      });
    }

    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const tokenInput = document.getElementById('gh-token');
        if (tokenInput && tokenInput.value.trim()) {
          this.loginWithToken(tokenInput.value.trim());
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }

    if (newPostBtn) {
      newPostBtn.addEventListener('click', () => this.showPostEditor());
    }

    if (postForm) {
      postForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handlePublish();
      });
    }

    if (exportMdBtn) {
      exportMdBtn.addEventListener('click', () => this.exportCurrentMarkdown());
    }
  },

  openModal() {
    const modal = document.getElementById('admin-modal');
    if (!modal) return;
    this.updateUI();
    modal.classList.add('active');
  },

  closeModal() {
    const modal = document.getElementById('admin-modal');
    if (modal) modal.classList.remove('active');
  },

  async loginWithToken(token) {
    const submitBtn = document.querySelector('#login-form button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = '正在验证 GitHub 身份...';
    }

    try {
      const res = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!res.ok) {
        throw new Error('GitHub Token 验证失败，请确认 Token 具有正确权限');
      }

      const userData = await res.json();
      this.state.token = token;
      this.state.user = userData;
      this.state.isAuthor = userData.login.toLowerCase() === this.OWNER.toLowerCase();

      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(userData));

      window.App.showToast(`欢迎回来，${userData.name || userData.login}！`);
      this.updateUI();
    } catch (err) {
      alert(err.message);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = '登录验证';
      }
    }
  },

  logout() {
    this.state.token = null;
    this.state.user = null;
    this.state.isAuthor = false;
    this.state.editingPostId = null;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.updateUI();
    window.App.showToast('已安全退出登录');
  },

  updateUI() {
    const authLoggedOut = document.getElementById('auth-logged-out');
    const authLoggedIn = document.getElementById('auth-logged-in');
    const authorControls = document.getElementById('author-controls');
    const visitorControls = document.getElementById('visitor-controls');
    const userAvatar = document.getElementById('admin-user-avatar');
    const userName = document.getElementById('admin-user-name');
    const userRole = document.getElementById('admin-user-role');
    const navAdminBtn = document.getElementById('btn-admin');

    if (this.state.user) {
      if (authLoggedOut) authLoggedOut.style.display = 'none';
      if (authLoggedIn) authLoggedIn.style.display = 'block';

      if (userAvatar) userAvatar.src = this.state.user.avatar_url;
      if (userName) userName.innerText = this.state.user.name || this.state.user.login;
      
      if (navAdminBtn) {
        navAdminBtn.innerHTML = `
          <img src="${this.state.user.avatar_url}" style="width:18px;height:18px;border-radius:50%;" />
          <span>${this.state.isAuthor ? '博主空间' : this.state.user.login}</span>
        `;
      }

      if (this.state.isAuthor) {
        if (userRole) userRole.innerText = '博客管理员 (AlaskaChinese)';
        if (authorControls) authorControls.style.display = 'block';
        if (visitorControls) visitorControls.style.display = 'none';
      } else {
        if (userRole) userRole.innerText = 'GitHub 访客';
        if (authorControls) authorControls.style.display = 'none';
        if (visitorControls) visitorControls.style.display = 'block';
      }
    } else {
      if (authLoggedOut) authLoggedOut.style.display = 'block';
      if (authLoggedIn) authLoggedIn.style.display = 'none';
      if (navAdminBtn) {
        navAdminBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span>GitHub 管理</span>
        `;
      }
    }

    // Refresh article author toolbars if an article is open
    window.App && window.App.refreshAuthorToolbar();
  },

  showPostEditor(postToEdit = null) {
    const editorSection = document.getElementById('post-editor-section');
    if (!editorSection) return;

    editorSection.style.display = 'block';

    if (postToEdit) {
      this.state.editingPostId = postToEdit.id;
      document.getElementById('post-title').value = postToEdit.title || '';
      document.getElementById('post-slug').value = postToEdit.id || '';
      document.getElementById('post-tags').value = (postToEdit.tags || []).join(', ');
      document.getElementById('post-summary').value = postToEdit.summary || '';
      document.getElementById('post-content').value = postToEdit.content || '';
      document.getElementById('editor-modal-title').innerText = '编辑文章';
    } else {
      this.state.editingPostId = null;
      document.getElementById('post-title').value = '';
      document.getElementById('post-slug').value = 'my-new-post-' + new Date().toISOString().slice(0, 10);
      document.getElementById('post-tags').value = '技术, 随笔';
      document.getElementById('post-summary').value = '';
      document.getElementById('post-content').value = `# 文章标题\n\n正文内容...`;
      document.getElementById('editor-modal-title').innerText = '发布新文章';
    }

    editorSection.scrollIntoView({ behavior: 'smooth' });
  },

  async handlePublish() {
    if (!this.state.isAuthor || !this.state.token) {
      alert('只有博主 AlaskaChinese 本人账号授权才能直接推送到 GitHub。');
      return;
    }

    const title = document.getElementById('post-title').value.trim();
    let slug = document.getElementById('post-slug').value.trim();
    const tagsStr = document.getElementById('post-tags').value.trim();
    const summary = document.getElementById('post-summary').value.trim();
    const content = document.getElementById('post-content').value;

    if (!title || !slug || !content) {
      alert('请完整填写文章标题、Slug 路径和正文内容！');
      return;
    }

    // Sanitize slug
    slug = slug.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/^-+|-+$/g, '');
    const tags = tagsStr.split(/[,，]/).map(t => t.trim()).filter(Boolean);
    const date = new Date().toISOString().slice(0, 10);

    const publishBtn = document.getElementById('btn-publish-submit');
    if (publishBtn) {
      publishBtn.disabled = true;
      publishBtn.innerText = '正在推送到 GitHub...';
    }

    try {
      const filePath = `posts/${slug}.md`;
      const postsJsonPath = `posts/posts.json`;

      // 1. Check if markdown file exists to get SHA for updating
      let existingFileSha = null;
      try {
        const fileRes = await fetch(`https://api.github.com/repos/${this.OWNER}/${this.REPO}/contents/${filePath}`, {
          headers: {
            'Authorization': `Bearer ${this.state.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        if (fileRes.ok) {
          const fileData = await fileRes.json();
          existingFileSha = fileData.sha;
        }
      } catch (e) {
        console.warn('File not found, will create new file.');
      }

      // 2. Commit Markdown Content
      const utf8Bytes = new TextEncoder().encode(content);
      let binaryStr = '';
      utf8Bytes.forEach(b => binaryStr += String.fromCharCode(b));
      const base64Content = btoa(binaryStr);

      const commitRes = await fetch(`https://api.github.com/repos/${this.OWNER}/${this.REPO}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.state.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `chore(blog): ${existingFileSha ? 'update' : 'publish'} ${title}`,
          content: base64Content,
          sha: existingFileSha || undefined
        })
      });

      if (!commitRes.ok) {
        const errJson = await commitRes.json();
        throw new Error(`GitHub 提交失败: ${errJson.message}`);
      }

      // 3. Update posts/posts.json
      let currentPosts = [...window.App.posts];
      let postsJsonSha = null;
      try {
        const pJsonRes = await fetch(`https://api.github.com/repos/${this.OWNER}/${this.REPO}/contents/${postsJsonPath}`, {
          headers: {
            'Authorization': `Bearer ${this.state.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        if (pJsonRes.ok) {
          const pJsonData = await pJsonRes.json();
          postsJsonSha = pJsonData.sha;
          const decoded = decodeURIComponent(escape(atob(pJsonData.content)));
          currentPosts = JSON.parse(decoded);
        }
      } catch (e) {
        console.warn('Could not fetch existing posts.json, using local state.');
      }

      const existingIndex = currentPosts.findIndex(p => p.id === slug);
      const postMeta = {
        id: slug,
        title: title,
        date: date,
        summary: summary || content.slice(0, 140).replace(/#|`/g, '').trim() + '...',
        tags: tags.length ? tags : ['随笔'],
        file: filePath,
        readTime: `${Math.max(1, Math.ceil(content.length / 400))} 分钟`
      };

      if (existingIndex >= 0) {
        currentPosts[existingIndex] = postMeta;
      } else {
        currentPosts.unshift(postMeta);
      }

      const updatedJsonStr = JSON.stringify(currentPosts, null, 2);
      const updatedJsonUtf8 = new TextEncoder().encode(updatedJsonStr);
      let updatedJsonBin = '';
      updatedJsonUtf8.forEach(b => updatedJsonBin += String.fromCharCode(b));

      await fetch(`https://api.github.com/repos/${this.OWNER}/${this.REPO}/contents/${postsJsonPath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.state.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `chore(blog): update post index for ${slug}`,
          content: btoa(updatedJsonBin),
          sha: postsJsonSha || undefined
        })
      });

      // Update local memory and view
      window.App.posts = currentPosts;
      window.App.postCache[slug] = content;
      window.App.renderPostList();

      this.closeModal();
      window.App.showToast('🎉 文章已成功推送到 GitHub 仓库！');
      window.location.hash = `#/post/${slug}`;
    } catch (err) {
      alert(`发布出错: ${err.message}`);
    } finally {
      if (publishBtn) {
        publishBtn.disabled = false;
        publishBtn.innerText = '一键发布到 GitHub';
      }
    }
  },

  async deletePost(postId) {
    if (!this.state.isAuthor || !this.state.token) {
      alert('只有博主本人可以删除文章！');
      return;
    }

    if (!confirm(`确定要彻底删除文章 "${postId}" 吗？此操作将向 GitHub 提交删除 commit。`)) {
      return;
    }

    try {
      window.App.showToast('正在从 GitHub 仓库删除...');
      const filePath = `posts/${postId}.md`;
      const postsJsonPath = `posts/posts.json`;

      // 1. Get SHA of the markdown file
      const fileRes = await fetch(`https://api.github.com/repos/${this.OWNER}/${this.REPO}/contents/${filePath}`, {
        headers: {
          'Authorization': `Bearer ${this.state.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (fileRes.ok) {
        const fileData = await fileRes.json();
        await fetch(`https://api.github.com/repos/${this.OWNER}/${this.REPO}/contents/${filePath}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.state.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `chore(blog): delete post ${postId}`,
            sha: fileData.sha
          })
        });
      }

      // 2. Remove from posts.json
      const pJsonRes = await fetch(`https://api.github.com/repos/${this.OWNER}/${this.REPO}/contents/${postsJsonPath}`, {
        headers: {
          'Authorization': `Bearer ${this.state.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (pJsonRes.ok) {
        const pJsonData = await pJsonRes.json();
        const decoded = decodeURIComponent(escape(atob(pJsonData.content)));
        let currentPosts = JSON.parse(decoded);
        currentPosts = currentPosts.filter(p => p.id !== postId);

        const updatedJsonStr = JSON.stringify(currentPosts, null, 2);
        const updatedJsonUtf8 = new TextEncoder().encode(updatedJsonStr);
        let updatedJsonBin = '';
        updatedJsonUtf8.forEach(b => updatedJsonBin += String.fromCharCode(b));

        await fetch(`https://api.github.com/repos/${this.OWNER}/${this.REPO}/contents/${postsJsonPath}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.state.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `chore(blog): remove ${postId} from index`,
            content: btoa(updatedJsonBin),
            sha: pJsonData.sha
          })
        });

        window.App.posts = currentPosts;
        window.App.renderPostList();
      }

      window.App.showToast('文章已删除');
      window.location.hash = '#/';
    } catch (err) {
      alert(`删除失败: ${err.message}`);
    }
  },

  exportCurrentMarkdown() {
    const title = document.getElementById('post-title').value.trim() || 'post';
    const slug = document.getElementById('post-slug').value.trim() || 'post';
    const content = document.getElementById('post-content').value;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    window.App.showToast(`已导出 ${slug}.md`);
  }
};

window.Admin = Admin;
