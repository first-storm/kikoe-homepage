# Kikoe homepage

把 `Kikoe — Home-html.zip` 中的设计稿实现为 Astro + TypeScript 静态官网。保留英文文案、原始截图和明暗配色；页面正文在构建时生成，不依赖浏览器运行 React。

## 本地开发

需要 Node.js ≥ 22.22.0（建议 Node 24）和 npm。

```sh
npm ci
npm run dev
```

开发地址由命令输出，通常为 `http://localhost:4321/`。

```sh
npm run check       # Astro / TypeScript 检查
npm run build       # 输出 dist/
npm run preview     # 预览 dist/，通常为 http://localhost:4321/
```

## 生产构建和部署

把实际部署地址写入环境变量或 `.env`。正式构建强制要求公共 HTTPS 地址：

```sh
SITE_URL=https://你的真实域名/ npm run build:production
```

部署到子路径时，地址包含部署目录：

```sh
SITE_URL=https://你的真实域名/kikoe/ BASE_PATH=/kikoe/ npm run build:production
```

`BASE_PATH` 未设置时，从 `SITE_URL` 的路径推导；显式设置时优先使用 `BASE_PATH`。`.env.example` 提供配置说明，复制后应按部署目录修改或删除 `BASE_PATH`。资源、首页链接、canonical、分享图片地址和 sitemap 使用同一前缀。更改部署目录后必须重新构建。

将 **`dist/` 内的内容**上传到静态托管服务的站点根目录，或上面配置的子目录。构建环境安装开发依赖；线上只需静态文件，不需要 Node 服务。

- 静态托管的构建命令：`npm run build:production`；发布目录：`dist`；环境变量：`SITE_URL`，子路径部署可设置 `BASE_PATH`。
- Nginx 等自管服务器应将未知地址以 HTTP 404 返回 `404.html`，不要把所有路径改写成首页；子路径部署时同步配置错误页位置。
- HTTPS 托管支持剪贴板 API；无法使用时，页面会提示手动复制。
- 不对 HTML 设置长期不可变缓存；带内容哈希的 `/_astro/` 资源可长期缓存。自定义子路径时相应添加前缀。

未提供 `SITE_URL` 的普通构建用于预览：正文完整，但包含 `noindex`，`robots.txt` 禁止抓取，并省略 canonical 和 sitemap。**上线收录前务必使用正式地址重新执行生产构建。** 仓库不预设域名、不含线上账号配置，也不会自动发布。

## SEO 与性能

正式构建提供 title、description、canonical、Open Graph、Twitter 分享信息、WebSite / SoftwareApplication JSON-LD、`robots.txt`、`sitemap.xml` 和 `noindex` 404。分享图与图标随静态产物部署，未虚构版本、评分或评论。

截图生成响应式 WebP；首屏截图优先加载，功能截图延迟加载。Inter 字体本地托管，许可证位于 `public/licenses/inter.txt`。页面支持语义化导航、跳转正文、可见焦点、系统明暗偏好与本地主题记忆。功能和下载链接来自上游 Kikoe 项目；官网本身不录音、不上传音频。

## 验收

首次安装测试浏览器：

```sh
npx playwright install chromium
# Linux 如缺少系统库，可使用 npx playwright install --with-deps chromium
npm test
```

测试覆盖缺少正式地址时拒绝生产构建、本地预览禁止收录、正式 SEO、子路径资源、桌面与手机布局、明暗主题、菜单与 Escape、剪贴板成功及失败、减少动态效果、无 JavaScript 和 404。

测试在当前文件系统的独立临时目录构建并自动清理，不覆盖 `dist/`；浏览器截图保存在忽略的 `test-results/`。GitHub Actions 执行检查、测试和普通预览构建，并上传产物和截图；CI 产物默认禁止收录，正式上线需另用真实 `SITE_URL` 构建。

## 维护

- `src/pages/index.astro`：首页文案、功能数据和页面组合。
- `src/site.ts`：站点元数据、上游地址、安装命令和路径工具。
- `src/layouts/Base.astro`：SEO、基础文档和浏览器交互。
- `src/styles/global.css`：设计 token 和响应式布局。
- `src/assets/`：原始截图和应用图标。

调整品牌图或首屏截图后运行 `npm run assets`，重新生成并提交 `public/social.png` 和 `public/apple-touch-icon.png`。设计稿 ZIP 保留为视觉参照，生产代码不加载设计工具的 vendor、support.js 或组件包。

项目变更按可审阅阶段提交；修改完成后执行 `npm run check`、`npm test`、`npm run build`。截图与构建产物不提交。
