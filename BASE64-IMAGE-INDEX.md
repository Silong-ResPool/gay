# Base64 图片位置索引 · 巳泷资源库 v8.5.0

本文件用于后续替换 Base64 图片。自有素材已在源码位置用 `BASE64-IMAGE:` 注释标注；第三方库（bootstrap、pixi、mermaid、vs editor、ruffle）内嵌的 Base64 属于库文件，不建议改动。

## 自有素材（可直接替换）

| 文件 | 位置/用途 | 说明 |
|---|---|---|
| `index.html` | `<link rel="icon">` | 站点 Logo / favicon，浏览器标签图标 |
| `index.html` | `window.SL_CHAR_POSTER` | 首页右下角角色立绘 |
| `butler/index.html` | `window.SL_CHAR_POSTER` | 资源管家角色立绘（右下角角色预览） |
| `js/char-fallback.js` | `window.SL_CHAR_POSTER` | 全站角色立绘兜底 |
| `music/index.html` | `var IMG_EGG` | 音乐页隐藏歌曲彩蛋封面 |
| `imagepro/index.html` | `<link rel="icon">` | 图像工坊 favicon |
| `imagepro/index.html` | 两处 `background-image` | 下拉选择框箭头（UI 图标） |
| `imagepro/index.html` | `data:image/gif` 输出 | 运行时生成的 GIF 预览，不是固定素材 |

## 第三方库（不建议改）

`ruffle/ruffle.js`、`video/libs/tailwindcss.min.js`、`live2d/libs/pixi.min.js`、`live2d/lpk/vender/pixi.min.js`、`imagepro/dist/bundle.js`、`codeeditor/vendor/vs/editor/*`、`butler/vendor/mermaid.min.js`、`bootstrap/css/bootstrap.css` 中的 Base64 均为库自身资源。

## 替换建议

1. 只替换注释 `BASE64-IMAGE:` 下方或同一行的 `data:image/...` 字符串。
2. 保持原 MIME 类型（`data:image/png;base64,` / `data:image/svg+xml,`）。
3. 替换后清一次浏览器缓存，或给引用该图片的 HTML/CSS 升版本号。
