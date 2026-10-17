# Kikoe 官网维护约定

- 根目录的 `Kikoe — Home-html.zip` 是视觉参照。沿用现有英文文案、配色、间距、截图和页面结构；生产组件使用 Astro 与原生 CSS。
- 产品能力、安装方式和链接以 `https://github.com/first-storm/Kikoe` 的实际内容为依据。更新下载信息时核验上游；只记录可核实的版本、平台与功能。
- 共享元数据和安装命令在 `src/site.ts` 维护；使用其中的 `local()` 生成站内路径，兼容子路径部署。
- SEO 与文档框架在 `src/layouts/Base.astro` 维护。新增公开页面时同步更新 sitemap 路由，并提供独立标题和准确描述；404 保持 noindex。
- 未配置 SITE_URL 的构建用于预览，保持 noindex 和禁爬；生产构建必须使用真实公共 HTTPS 地址。修改地址处理时同时验证根路径和子路径。
- 正文、导航和下载入口保持无 JavaScript 可用。交互需支持键盘、清晰焦点、明暗模式和减少动态效果偏好；复制结果必须等待 API 成功后反馈。
- 修改截图或图标后运行 `npm run assets` 更新分享图与触屏图标，保留素材与字体许可证。
- 交付前运行 `npm run check`、`npm test` 和 `npm run build`；浏览器测试首次需安装 Playwright Chromium。测试临时输出放在仓库所在文件系统，避免 Astro 跨文件系统移动资源失败。
- 按完整、可审阅的阶段提交，只暂存相关源码与文档。依赖锁文件需要提交；dist、浏览器截图、缓存和本地环境文件保持忽略。提交前查看 diff 与 git status。
