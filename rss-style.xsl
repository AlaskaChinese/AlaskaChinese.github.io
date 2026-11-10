<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title><xsl:value-of select="/rss/channel/title"/> - RSS 订阅</title>
        <style>
          :root {
            --bg: #0f172a;
            --surface: #1e293b;
            --border: #334155;
            --text-main: #f8fafc;
            --text-sub: #94a3b8;
            --accent: #6366f1;
            --accent-hover: #818cf8;
          }
          @media (prefers-color-scheme: light) {
            :root {
              --bg: #f8fafc;
              --surface: #ffffff;
              --border: #e2e8f0;
              --text-main: #0f172a;
              --text-sub: #64748b;
              --accent: #4f46e5;
              --accent-hover: #4338ca;
            }
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
            background-color: var(--bg);
            color: var(--text-main);
            line-height: 1.7;
            padding: 2.5rem 1rem;
          }
          .container {
            max-width: 760px;
            margin: 0 auto;
          }
          .card {
            background-color: var(--surface);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          h1 {
            font-size: 1.75rem;
            font-weight: 800;
            margin-bottom: 0.75rem;
            color: var(--text-main);
          }
          p { margin-bottom: 1rem; color: var(--text-sub); font-size: 0.95rem; }
          .feed-url-box {
            display: flex;
            gap: 0.5rem;
            margin: 1.25rem 0;
            background: rgba(99, 102, 241, 0.08);
            border: 1px solid var(--border);
            padding: 0.5rem 0.75rem;
            border-radius: 10px;
            align-items: center;
          }
          .feed-url {
            flex: 1;
            font-family: monospace;
            font-size: 0.9rem;
            color: var(--accent);
            word-break: break-all;
          }
          .copy-btn {
            background: var(--accent);
            color: #fff;
            border: none;
            padding: 0.45rem 1rem;
            font-size: 0.85rem;
            font-weight: 600;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
          }
          .copy-btn:hover { background: var(--accent-hover); }
          .tips {
            font-size: 0.85rem;
            color: var(--text-sub);
            border-left: 3px solid var(--accent);
            padding-left: 0.75rem;
            margin-top: 1rem;
          }
          .post-item {
            border-bottom: 1px solid var(--border);
            padding: 1.25rem 0;
          }
          .post-item:last-child { border-bottom: none; }
          .post-title {
            font-size: 1.15rem;
            font-weight: 700;
            margin-bottom: 0.35rem;
          }
          .post-title a {
            color: var(--text-main);
            text-decoration: none;
          }
          .post-title a:hover { color: var(--accent); }
          .post-date {
            font-size: 0.82rem;
            color: var(--text-sub);
          }
          .back-link {
            display: inline-block;
            margin-bottom: 1.5rem;
            color: var(--accent);
            font-weight: 600;
            text-decoration: none;
            font-size: 0.9rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <a href="/" class="back-link">← 返回博客首页</a>
          
          <div class="card">
            <h1>📡 <xsl:value-of select="/rss/channel/title"/></h1>
            <p>这是博客的 RSS 订阅源（RSS Feed）。你可以复制下方链接，粘贴到你常用的 RSS 阅读器中进行订阅：</p>
            
            <div class="feed-url-box">
              <span class="feed-url" id="feed-url"><xsl:value-of select="/rss/channel/link"/>index.xml</span>
              <button class="copy-btn" onclick="copyFeedUrl()">复制订阅链接</button>
            </div>

            <div class="tips">
              💡 <b>什么是 RSS？</b> RSS 是一种用于内容订阅的开放标准。推荐使用如 <b>Follow</b>、<b>NetNewsWire</b>、<b>Feedly</b>、<b>Fluent Reader</b> 等阅读器添加该链接，即可在博客更新时第一时间收到推送，无需手动刷新网页。
            </div>
          </div>

          <div class="card">
            <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">📑 近期博文列表</h2>
            <xsl:for-each select="/rss/channel/item">
              <div class="post-item">
                <div class="post-title">
                  <a target="_blank">
                    <xsl:attribute name="href">
                      <xsl:value-of select="link"/>
                    </xsl:attribute>
                    <xsl:value-of select="title"/>
                  </a>
                </div>
                <div class="post-date">📅 <xsl:value-of select="pubDate"/></div>
              </div>
            </xsl:for-each>
          </div>
        </div>

        <script>
          function copyFeedUrl() {
            const url = document.getElementById('feed-url').innerText;
            navigator.clipboard.writeText(url).then(() => {
              const btn = document.querySelector('.copy-btn');
              btn.innerText = '已复制 ✓';
              setTimeout(() => { btn.innerText = '复制订阅链接'; }, 2000);
            });
          }
        </script>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
