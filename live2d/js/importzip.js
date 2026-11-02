import { log } from './logger.js';

const ZIP_CONFIG = Object.freeze({
  MODEL_JSON_REGEX: /model3?[-\w]*\.json$/i,
  HIGHLIGHT_COLOR:  '#8c5eff',
  ZIP_ACCEPT:       '.zip,.lpk,.wpk',
});

// MIME types for files embedded as data URIs in the patched model JSON.
const MIME_TYPES = Object.freeze({
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.moc3': 'application/octet-stream',
  '.moc':  'application/octet-stream',
});

// Module-level references set after DOMContentLoaded.
let canvasArea = null;

const getMimeType = (filename) => {
  if (!filename) return 'application/octet-stream';
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  return MIME_TYPES[ext] ?? 'application/octet-stream';
};

const blobToDataURL = (blob) =>
  new Promise((resolve, reject) => {
    const reader   = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read blob'));
    reader.readAsDataURL(blob);
  });

// Resolves a relative path from within the model JSON against the model's directory.
const resolvePath = (pathStr, dirPath) => {
  if (!pathStr || typeof pathStr !== 'string') return null;
  if (pathStr.startsWith('data:') || /^https?:\/\//i.test(pathStr)) return null;

  try {
    const resolved = new URL(pathStr, `http://dummy/${dirPath}`).pathname.substring(1);
    return [decodeURIComponent(resolved), pathStr];
  } catch {
    return null;
  }
};

// Recursively visits every string value in an object tree and calls callback(node, key, value).
const walkJSON = (obj, callback) => {
  const traverse = (node) => {
    if (!node || typeof node !== 'object') return;
    for (const key of Object.keys(node)) {
      const val = node[key];
      if (typeof val === 'string') {
        callback(node, key, val);
      } else if (typeof val === 'object') {
        traverse(val);
      }
    }
  };
  traverse(obj);
};

// Walks the parsed model JSON and collects every string value that looks like a relative file path.
const collectPaths = (obj, dirPath) => {
  const refs = new Set();

  walkJSON(obj, (_, __, val) => {
    const resolved = resolvePath(val, dirPath);
    if (resolved) {
      refs.add(resolved[0]);
      refs.add(resolved[1]);
    } else if (val && !val.startsWith('data:') && !/^https?:\/\//i.test(val)) {
      refs.add(val);
    }
  });

  return refs;
};

// Replaces all relative path strings in the model JSON with their data URIs.
const substituteDataURIs = (obj, dirPath, uriMap) => {
  walkJSON(obj, (node, key, val) => {
    const resolved = resolvePath(val, dirPath);
    if (resolved) {
      const uri = uriMap.get(resolved[0]) ?? uriMap.get(resolved[1]);
      if (uri) node[key] = uri;
    } else if (uriMap.has(val)) {
      node[key] = uriMap.get(val);
    }
  });
};

// 巳泷 v9.3.0：支持 ZIP / LPK / WPK 三种模型包格式（本质均为 ZIP 压缩包）
const isModelArchive = (name) => /\.(zip|lpk|wpk)$/i.test(String(name || ''));

// v9.9.2：先读文件头，非标准 ZIP 给出可执行的解决提示（很多 WPK/LPK 是加密或专用格式）
const readMagic = async (file) => {
  try {
    const buf = new Uint8Array(await file.slice(0, 4).arrayBuffer());
    return String.fromCharCode.apply(null, Array.from(buf));
  } catch (e) { return ''; }
};

// v9.9.2：支持「导入文件夹」——任何解包后的模型目录（含 .model3.json 与纹理）
export const processFolderFiles = async (fileList) => {
  const files = Array.from(fileList || []);
  if (!files.length) throw new Error('文件夹里没有文件');

  let modelFile = null;
  let modelPath = '';
  files.forEach((f) => {
    const rel = String(f.webkitRelativePath || f.name);
    if (ZIP_CONFIG.MODEL_JSON_REGEX.test(rel)) { modelFile = f; modelPath = rel; }
  });
  if (!modelFile) throw new Error('文件夹里没找到 .model3.json / .model.json');

  const jsonObj = JSON.parse(await modelFile.text());
  const dirPath = modelPath.includes('/') ? modelPath.slice(0, modelPath.lastIndexOf('/') + 1) : '';
  const referenced = collectPaths(jsonObj, dirPath);
  const uriMap = new Map();

  await Promise.all(files.map(async (f) => {
    const rel = String(f.webkitRelativePath || f.name);
    if (!referenced.has(rel)) return;
    const typed = new Blob([await f.arrayBuffer()], { type: getMimeType(rel) });
    uriMap.set(rel, await blobToDataURL(typed));
  }));

  substituteDataURIs(jsonObj, dirPath, uriMap);
  const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(jsonObj))));
  return `data:application/json;base64,${base64}`;
};

// Reads a ZIP archive, finds the model JSON and converts all referenced assets to data URIs.
export const processZipFile = async (file) => {
  if (!file) return;

  try {
    const magic = await readMagic(file);
    if (!magic.startsWith('PK')) {
      throw new Error('该文件不是标准 ZIP 包（' + (file.name || '') + ' 可能是加密包或专用格式）。请先用 7-Zip 等工具解压成文件夹，再用「导入文件夹」');
    }
    const zip = await JSZip.loadAsync(file);

    // Find the model JSON entry; last match wins if multiple exist.
    let modelEntry = null;
    let modelPath  = '';

    zip.forEach((relPath, entry) => {
      if (!entry.dir && ZIP_CONFIG.MODEL_JSON_REGEX.test(relPath)) {
        modelEntry = entry;
        modelPath  = relPath;
      }
    });

    if (!modelEntry) throw new Error('No .model3.json / .model.json found in ZIP');

    const jsonText = await modelEntry.async('text');
    let jsonObj;

    try {
      jsonObj = JSON.parse(jsonText);
    } catch (error) {
      throw new Error(`Invalid JSON in ${modelPath}: ${error.message}`);
    }

    const dirPath    = modelPath.includes('/') ? modelPath.slice(0, modelPath.lastIndexOf('/') + 1) : '';
    const referenced = collectPaths(jsonObj, dirPath);
    const uriMap     = new Map();

    // Convert all referenced ZIP entries to data URIs in parallel.
    const jobs = [];
    zip.forEach((relPath, entry) => {
      if (!referenced.has(relPath)) return;

      jobs.push(
        entry.async('blob').then(async (blob) => {
          const typed = new Blob([blob], { type: getMimeType(relPath) });
          uriMap.set(relPath, await blobToDataURL(typed));
        })
      );
    });

    await Promise.all(jobs);
    substituteDataURIs(jsonObj, dirPath, uriMap);

    // Encode the patched JSON as a base64 data URI for Live2DModel.from().
    const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(jsonObj))));
    return `data:application/json;base64,${base64}`;

  } catch (error) {
    log('ERROR', 'Failed to process ZIP file:', error);
    throw error;
  }
};

// ===========================================================================
// Drag-and-drop handling
// ===========================================================================

const setDropHighlight = (active) => {
  if (canvasArea) canvasArea.style.borderColor = active ? ZIP_CONFIG.HIGHLIGHT_COLOR : 'var(--border)';
};

const handleDrop = async (event) => {
  event.preventDefault();
  event.stopPropagation();
  setDropHighlight(false);

  const file = event.dataTransfer?.files?.[0];
  if (!file) return;
  if (!isModelArchive(file?.name)) {
    try { window.SL_L2D_TOAST && window.SL_L2D_TOAST('不支持的文件：请拖入 .zip / .lpk / .wpk 模型包'); } catch (e) {}
    return;
  }
  try {
    try { window.SL_L2D_TOAST && window.SL_L2D_TOAST('正在解析模型包：' + file.name); } catch (e) {}
    const url = await processZipFile(file);
    if (url) {
      window.loadLive2DModel?.(url);
      try { window.SL_L2D_TOAST && window.SL_L2D_TOAST('模型已载入：' + file.name); } catch (e) {}
    } else {
      try { window.SL_L2D_TOAST && window.SL_L2D_TOAST('未能从模型包中识别到模型文件'); } catch (e) {}
    }
  } catch (error) {
    try { window.SL_L2D_TOAST && window.SL_L2D_TOAST('模型包解析失败：' + (error.message ?? error)); } catch (e) {}
  }
};

const attachDropHandlers = () => {
  if (!canvasArea) return;

  const prevent = (event) => { event.preventDefault(); event.stopPropagation(); };

  canvasArea.addEventListener('dragenter', (event) => { prevent(event); setDropHighlight(true);  });
  canvasArea.addEventListener('dragover',  (event) => { prevent(event); setDropHighlight(true);  });
  canvasArea.addEventListener('dragleave', (event) => { prevent(event); setDropHighlight(false); });
  canvasArea.addEventListener('drop', handleDrop);
};

document.addEventListener('DOMContentLoaded', () => {
  canvasArea = document.querySelector('.canvas-area');

  if (canvasArea) canvasArea.id = 'drop-zone';

  // Wire the static upload button and file input declared in index.html.
  const uploadBtn     = document.getElementById('upload-btn');
  const zipInput      = document.getElementById('zip-upload-input');
  const dropdownLabel = document.getElementById('dropdown-label');
  const dropdown      = document.getElementById('model-dropdown');

  if (uploadBtn && zipInput) {
    uploadBtn.addEventListener('click', () => zipInput.click());

    zipInput.addEventListener('change', async () => {
      const file = zipInput.files?.[0];
      if (!file) { zipInput.value = ''; return; }
      if (!isModelArchive(file.name)) {
        try { window.SL_L2D_TOAST && window.SL_L2D_TOAST('不支持的文件：请选择 .zip / .lpk / .wpk；单独 .model3.json 需连同纹理文件夹一起压缩'); } catch (e) {}
        zipInput.value = '';
        return;
      }
      try {
        try { window.SL_L2D_TOAST && window.SL_L2D_TOAST('正在解析模型包：' + file.name); } catch (e) {}
        const url = await processZipFile(file);
        if (url) {
          if (dropdownLabel) dropdownLabel.textContent = file.name;
          if (dropdown) dropdown.classList.remove('open');
          window.loadLive2DModel?.(url);
          try { window.SL_L2D_TOAST && window.SL_L2D_TOAST('模型已载入：' + file.name); } catch (e) {}
        } else {
          try { window.SL_L2D_TOAST && window.SL_L2D_TOAST('未能从模型包中识别到模型文件'); } catch (e) {}
        }
      } catch (error) {
        try { window.SL_L2D_TOAST && window.SL_L2D_TOAST('模型包解析失败：' + (error.message ?? error)); } catch (e) {}
      }
      zipInput.value = '';
    });
  }

  attachDropHandlers();

  // v9.9.2：导入已解包的模型文件夹（适配加密 WPK/LPK / 7-Zip 解包后的目录）
  const folderInput = document.getElementById('folder-upload-input');
  if (folderInput) {
    folderInput.addEventListener('change', async () => {
      if (!folderInput.files || !folderInput.files.length) return;
      try {
        try { window.SL_L2D_TOAST && window.SL_L2D_TOAST('正在解析模型文件夹…'); } catch (e) {}
        const url = await processFolderFiles(folderInput.files);
        window.loadLive2DModel?.(url);
        try { window.SL_L2D_TOAST && window.SL_L2D_TOAST('模型已载入（文件夹导入）'); } catch (e) {}
      } catch (error) {
        try { window.SL_L2D_TOAST && window.SL_L2D_TOAST('文件夹解析失败：' + (error.message ?? error)); } catch (e) {}
      }
      folderInput.value = '';
    });
  }
});