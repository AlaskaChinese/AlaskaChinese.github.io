<#
.SYNOPSIS
    AlaskaChinese Hugo 博客一键新建与发布脚本
.DESCRIPTION
    用于极速创建 Hugo 文章目录和 index.md 模板，支持一键提交推送至 GitHub 触发 Actions 自动构建上线。
.EXAMPLE
    .\new-post.ps1 -Title "新文章" -Slug "my-article" -Category "技术随笔" -Tags "Windows,技巧" -Push
#>

param(
    [string]$Title,
    [string]$Slug,
    [string]$Category = "技术随笔",
    [string]$Tags = "Windows,技巧",
    [string]$Description = "",
    [switch]$Push
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   AlaskaChinese Hugo 博客一键新建工具   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if (-not $Title) {
    $Title = Read-Host "请输入文章标题"
}
if (-not $Title) {
    Write-Host "文章标题不能为空！" -ForegroundColor Red
    exit 1
}

if (-not $Slug) {
    $defaultSlug = (Get-Date -Format "yyyy-MM-dd") + "-" + ($Title -replace '[^\w\s-]', '' -replace '\s+', '-').ToLower()
    if (-not $defaultSlug -or $defaultSlug -eq ((Get-Date -Format "yyyy-MM-dd") + "-")) {
        $defaultSlug = "post-" + (Get-Date -Format "yyyyMMdd-HHmm")
    }
    $inputSlug = Read-Host "请输入文章 Slug (默认: $defaultSlug)"
    if ($inputSlug) { $Slug = $inputSlug } else { $Slug = $defaultSlug }
}

$postDir = "content\post\$Slug"
if (-not (Test-Path $postDir)) {
    New-Item -ItemType Directory -Path $postDir -Force | Out-Null
}

$postFile = "$postDir\index.md"
if (Test-Path $postFile) {
    Write-Host "文章文件 $postFile 已存在！" -ForegroundColor Yellow
} else {
    $dateStr = Get-Date -Format "yyyy-MM-ddTHH:mm:ss+08:00"
    $tagArray = ($Tags -split '[,，]') | ForEach-Object { '"' + $_.Trim() + '"' }
    $tagJoin = $tagArray -join ", "
    $template = @"
---
title: "$Title"
description: "$Description"
date: $dateStr
slug: "$Slug"
image: ""
categories: ["$Category"]
tags: [$tagJoin]
---

## 前言

在此开始撰写文章内容...

## 正文

### 小节标题

正文详情...

## 总结

"@
    Set-Content -Path $postFile -Value $template -Encoding UTF8
    Write-Host "已创建文章：$postFile" -ForegroundColor Green
}

if ($Push -or ((Read-Host "是否现在提交并推送到 GitHub 触发自动构建? (y/n)") -eq 'y')) {
    git add .
    git commit -m "feat(post): publish $Title"
    git push origin main
    Write-Host "🎉 已成功推送到 GitHub！GitHub Actions 将自动编译并部署上线。" -ForegroundColor Green
} else {
    Write-Host "文章已在本地保存。编辑完毕后运行 git push origin main 即可上线。" -ForegroundColor Yellow
}
