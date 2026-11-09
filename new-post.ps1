<#
.SYNOPSIS
    AlaskaChinese 博客一键新建与发布脚本
.DESCRIPTION
    本脚本用于在本地极速新建 Markdown 博客文章，自动更新 posts.json 索引，并可一键自动提交推送到 GitHub。
.EXAMPLE
    .\new-post.ps1 -Title "我的新文章" -Slug "my-new-post" -Tags "Windows,美化" -Push
#>

param(
    [string]$Title,
    [string]$Slug,
    [string]$Tags = "技术,随笔",
    [string]$Summary = "",
    [switch]$Push
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    AlaskaChinese 博客一键新建工具       " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. 交互式输入补全
if (-not $Title) {
    $Title = Read-Host "请输入文章标题"
}
if (-not $Title) {
    Write-Host "文章标题不能为空！" -ForegroundColor Red
    exit 1
}

if (-not $Slug) {
    $defaultSlug = "post-" + (Get-Date -Format "yyyyMMdd-HHmm")
    $inputSlug = Read-Host "请输入文章标识 Slug (默认: $defaultSlug)"
    if ($inputSlug) { $Slug = $inputSlug } else { $Slug = $defaultSlug }
}

$Slug = $Slug.ToLower() -replace '[^a-z0-9_-]', '-' -replace '^-+|-+$', ''
$postFile = "posts\$Slug.md"

if (Test-Path $postFile) {
    Write-Host "文章文件 $postFile 已存在！" -ForegroundColor Yellow
} else {
    $dateStr = Get-Date -Format "yyyy-MM-dd"
    $template = @"
# $Title

> 发布于 $dateStr | 标签：$Tags

这里是文章正文的开始...

## 第一小节

在此输入正文内容...
"@
    Set-Content -Path $postFile -Value $template -Encoding UTF8
    Write-Host "已创建文章模板：$postFile" -ForegroundColor Green
}

# 2. 更新 posts/posts.json
$jsonPath = "posts\posts.json"
$posts = @()
if (Test-Path $jsonPath) {
    $jsonContent = Get-Content $jsonPath -Raw -Encoding UTF8
    $posts = $jsonContent | ConvertFrom-Json
}

$tagList = ($Tags -split '[,，]') | ForEach-Object { $_.Trim() } | Where-Object { $_ }
$dateNow = Get-Date -Format "yyyy-MM-dd"
if (-not $Summary) {
    $Summary = "$Title 详细内容..."
}

$existing = $posts | Where-Object { $_.id -eq $Slug }
if ($existing) {
    $existing.title = $Title
    $existing.tags = @($tagList)
    $existing.summary = $Summary
} else {
    $newEntry = [PSCustomObject]@{
        id = $Slug
        title = $Title
        date = $dateNow
        summary = $Summary
        tags = @($tagList)
        file = "posts/$Slug.md"
        readTime = "3 分钟"
    }
    $posts = @($newEntry) + $posts
}

$updatedJson = $posts | ConvertTo-Json -Depth 5
Set-Content -Path $jsonPath -Value $updatedJson -Encoding UTF8
Write-Host "已同步更新索引：$jsonPath" -ForegroundColor Green

# 3. 同步更新 js/posts-data.js
$jsPath = "js\posts-data.js"
$jsContent = "window.POSTS_DATA = $updatedJson;"
Set-Content -Path $jsPath -Value $jsContent -Encoding UTF8
Write-Host "已同步更新备用数据：$jsPath" -ForegroundColor Green

# 4. 可选一键 Git 推送
if ($Push -or ((Read-Host "是否现在一键推送到 GitHub? (y/n)") -eq 'y')) {
    Write-Host "正在推送到 GitHub..." -ForegroundColor Cyan
    git add .
    git commit -m "feat(post): publish $Title ($Slug)"
    git push origin main
    Write-Host "🎉 博客已成功推送到 GitHub 并在 GitHub Pages 上线！" -ForegroundColor Green
} else {
    Write-Host "文章已在本地保存，编辑完毕后执行 git push origin main 即可上线。" -ForegroundColor Yellow
}
