# 图文模板编辑器

豆瓣小组帖一键生成海报，支持手动编辑与 PNG / JPG / GIF 导出。

## 海报尺寸

| 模板 | 尺寸 |
|------|------|
| 海报 A | 1242 × 2110 |
| 海报 B | 1242 × 1863 |

导出为 Figma 原尺寸 1:1。

## 环境要求

- **Node.js 18+**（[下载](https://nodejs.org/)）
- 可访问互联网（导出 GIF 使用 CDN；豆瓣抓取需联网）

## 快速开始

### 方式一：命令行

```bash
cd poster-template-editor
node server/static.js
```

浏览器打开：**http://localhost:5174**

### 方式二：Mac 双击启动

双击 `start.command`，终端会自动启动服务并提示访问地址。

### 方式三：npm 脚本

```bash
npm start
# 或
npm run serve
```

## 在线部署（发链接，对方无需装 Node）

项目已配置 Render / Railway 一键部署。部署后把链接发给他人即可；**本地 zip 版仍可继续使用**，互不影响。

### Render（推荐，有免费档）

1. 将代码推到 **GitHub** 仓库（只需 `index.html`、`server/`、`package.json`、`render.yaml`）
2. 登录 [render.com](https://render.com) → **New** → **Blueprint**（或 Web Service）
3. 连接 GitHub 仓库；若用 Blueprint，会自动读取 `render.yaml`
4. 手动创建 Web Service 时设置：
   - **Runtime:** Node
   - **Build Command:** 留空或 `echo "ok"`
   - **Start Command:** `node server/static.js`
5. 部署完成后获得公网地址，如 `https://poster-template-editor.onrender.com`

> 免费档长时间无访问会休眠，首次打开需等待约 30 秒唤醒。

### Railway

1. 代码推到 GitHub
2. 登录 [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
3. 平台会自动识别 `npm start`（即 `node server/static.js`）
4. 在 **Settings → Networking** 生成公网域名

### 部署 vs 本地

| | 在线版 | 本地 zip 版 |
|--|--------|-------------|
| 分享方式 | 发链接 | 发 zip |
| 对方要装 Node | 否 | 是 |
| 能否同时使用 | 是，同一套代码 |

## 使用说明

1. 在左侧粘贴**豆瓣小组帖链接**，点击「抓取」，自动填充标题、小组名、成员数、头图和头像
2. 也可手动修改各字段，或上传本地头图 / 头像
3. 右侧预览海报 A、B
4. 选择 PNG / JPG / GIF 格式，导出单张或一键导出全部

> **注意：** 请勿直接用浏览器打开 `index.html`（`file://`）。豆瓣抓取和导出在外链图片场景下需要本地服务。

## 文件说明

```
poster-template-editor/
├── index.html          # 编辑器（单文件，含样式与逻辑）
├── server/
│   ├── static.js       # 本地静态服务 + 豆瓣 API 代理
│   ├── doubanApi.js
│   └── doubanParser.js
├── start.command       # Mac 双击启动（可选）
├── start.sh            # 通用启动脚本（可选）
├── render.yaml         # Render 部署配置（可选）
├── package.json
└── README.md
```

## 常见问题

**抓取失败 / Failed to fetch**  
请确认已通过 `node server/static.js` 启动本地服务，并访问 `http://localhost:5174`，不要直接打开 HTML 文件。

**帖子无法抓取**  
链接需为公开可访问的豆瓣小组帖，格式如：  
`https://www.douban.com/group/topic/490857750/`

**导出图片空白或缺图**  
抓取的头图来自豆瓣 CDN，请保持网络畅通；若仍异常，可手动上传本地图片后再导出。

**修改端口**  
```bash
PORT=8080 node server/static.js
```
