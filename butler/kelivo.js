/* ============================================================
   资源管家 · Kelivo 增强移植层
   独立文件，避免改动主页面巨型内联脚本；仅在主脚本之后加载。
   功能：多供应商/多协议、联网搜索、TTS/ASR、文档解析、Mermaid、
   多版本回复、长期记忆分类、技能、会话管理、备份/WebDAV/S3、
   诊断日志、设备工具、定时任务、MCP 导入与审批。
   ============================================================ */
(function(){
'use strict';
if(window.__KELIVO_LOADED__) return;
window.__KELIVO_LOADED__ = true;

/* ---------------- 基础 ---------------- */
const KSTORE = 'sl_kelivo_v1';
function klLoad(){
  try{ return JSON.parse(localStorage.getItem(KSTORE) || '{}') || {}; }catch(e){ return {}; }
}
let KL = klLoad();
function klSave(){ try{ localStorage.setItem(KSTORE, JSON.stringify(KL)); }catch(e){} }
KL.providers = Array.isArray(KL.providers) ? KL.providers : [];
KL.skills = Array.isArray(KL.skills) ? KL.skills : [];
KL.tasks = Array.isArray(KL.tasks) ? KL.tasks : [];
KL.memoryFacts = Array.isArray(KL.memoryFacts) ? KL.memoryFacts : [];
KL.settings = Object.assign({
  webSearch:false, askUser:true, memAuto:false, memEvery:8,
  mcpApprove:true, docOn:true, mermaidOn:true, versions:true,
  regexOn:true, diagOn:true, shareIntake:true
}, KL.settings || {});
KL.search = Object.assign({provider:'bing', key:'', endpoint:'', model:'', active:false}, KL.search || {});
KL.tts = Object.assign({provider:'edge', key:'', endpoint:'', voice:'', model:'', format:'mp3', active:false}, KL.tts || {});
KL.asr = Object.assign({provider:'system', key:'', endpoint:'', model:''}, KL.asr || {});
KL.backup = Object.assign({webdav:'', user:'', pass:'', path:'silong/', s3:'', region:'us-east-1', bucket:'', ak:'', sk:'', prefix:'silong/'}, KL.backup || {});
KL.diag = Object.assign({logs:[]}, KL.diag || {});

function klB64(str){
  try{ return btoa(unescape(encodeURIComponent(String(str||'')))); }catch(e){ return ''; }
}
function klEsc(s){ return String(s==null?'':s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function klUuid(){ return 'k'+Date.now().toString(36)+Math.random().toString(36).slice(2,8); }
function klBytes(n){ n=+n||0; if(n<1024) return n+' B'; if(n<1048576) return (n/1024).toFixed(1)+' KB'; return (n/1048576).toFixed(1)+' MB'; }
function klToast(msg){ try{ showToast(msg); }catch(e){} }
function klAddSys(msg){ try{ addSys(msg); }catch(e){} }
function klNowTime(){ try{ return new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'}); }catch(e){ return ''; } }

/* ---------------- 供应商预设 ---------------- */
const KL_PROVIDER_PRESETS = [
  {id:'openai', name:'OpenAI', protocol:'openai', base:'https://api.openai.com/v1', model:'gpt-4o-mini', models:['gpt-4o','gpt-4o-mini','gpt-4.1','gpt-4.1-mini','o4-mini']},
  {id:'openai-responses', name:'OpenAI Responses', protocol:'responses', base:'https://api.openai.com/v1', model:'gpt-4o-mini', models:['gpt-4o','gpt-4o-mini','gpt-4.1','o4-mini']},
  {id:'gemini', name:'Google Gemini', protocol:'gemini', base:'https://generativelanguage.googleapis.com/v1beta', model:'gemini-2.5-flash', models:['gemini-2.5-flash','gemini-2.5-pro','gemini-2.0-flash']},
  {id:'claude', name:'Anthropic Claude', protocol:'claude', base:'https://api.anthropic.com/v1', model:'claude-sonnet-4-5', models:['claude-sonnet-4-5','claude-opus-4-1','claude-haiku-4-5']},
  {id:'deepseek', name:'DeepSeek', protocol:'openai', base:'https://api.deepseek.com/v1', model:'deepseek-chat', models:['deepseek-chat','deepseek-reasoner']},
  {id:'openrouter', name:'OpenRouter', protocol:'openai', base:'https://openrouter.ai/api/v1', model:'deepseek-chat', models:['deepseek-chat','gpt-4o-mini','claude-sonnet-4-5','gemini-2.5-flash']},
  {id:'siliconflow', name:'硅基流动', protocol:'openai', base:'https://api.siliconflow.cn/v1', model:'deepseek-ai/DeepSeek-V3', models:['deepseek-ai/DeepSeek-V3','Qwen/Qwen2.5-72B-Instruct']},
  {id:'qwen', name:'阿里云千问', protocol:'openai', base:'https://dashscope.aliyuncs.com/compatible-mode/v1', model:'qwen-plus', models:['qwen-plus','qwen-max','qwen-vl-max']},
  {id:'zhipu', name:'智谱 GLM', protocol:'openai', base:'https://open.bigmodel.cn/api/paas/v4', model:'glm-4-flash', models:['glm-4-flash','glm-4-plus','glm-4v-plus']},
  {id:'xai', name:'xAI Grok', protocol:'openai', base:'https://api.x.ai/v1', model:'grok-3-mini', models:['grok-3','grok-3-mini','grok-4']},
  {id:'volcengine', name:'火山方舟', protocol:'openai', base:'https://ark.cn-beijing.volces.com/api/v3', model:'doubao-seed-1-6', models:['doubao-seed-1-6','doubao-pro-32k']},
  {id:'moonshot', name:'Kimi / Moonshot', protocol:'openai', base:'https://api.moonshot.cn/v1', model:'moonshot-v1-8k', models:['moonshot-v1-8k','moonshot-v1-32k']},
  {id:'groq', name:'Groq', protocol:'openai', base:'https://api.groq.com/openai/v1', model:'llama-3.3-70b-versatile', models:['llama-3.3-70b-versatile','llama-3.1-8b-instant']},
  {id:'mistral', name:'Mistral', protocol:'openai', base:'https://api.mistral.ai/v1', model:'mistral-small-latest', models:['mistral-small-latest','mistral-large-latest']},
  {id:'custom', name:'自定义 OpenAI 兼容', protocol:'openai', base:'', model:'', models:[]}
];

/* ---------------- 搜索服务预设 ---------------- */
const KL_SEARCH_PRESETS = [
  {id:'bing', name:'Bing（免费网页）', needKey:false},
  {id:'duckduckgo', name:'DuckDuckGo（免费网页）', needKey:false},
  {id:'searxng', name:'SearXNG（自建实例）', needKey:false, endpoint:true},
  {id:'brave', name:'Brave Search API', needKey:true},
  {id:'tavily', name:'Tavily', needKey:true},
  {id:'exa', name:'Exa', needKey:true},
  {id:'serper', name:'Serper (Google)', needKey:true},
  {id:'firecrawl', name:'Firecrawl', needKey:true},
  {id:'you', name:'You.com', needKey:true},
  {id:'linkup', name:'LinkUp', needKey:true},
  {id:'jina', name:'Jina Reader', needKey:true},
  {id:'bocha', name:'博查 Bocha', needKey:true},
  {id:'metaso', name:'秘塔搜索', needKey:true},
  {id:'zhipu', name:'智谱 Web Search', needKey:true},
  {id:'custom', name:'自定义搜索 API', needKey:true, endpoint:true}
];

/* ---------------- 界面注入 ---------------- */
function klOption(list, sel){
  return list.map(function(x){
    var v = x.value!==undefined?x.value:x;
    var l = x.label!==undefined?x.label:v;
    return '<option value="'+klEsc(v)+'"'+(String(sel)===String(v)?' selected':'')+'>'+klEsc(l)+'</option>';
  }).join('');
}
function klProviderOptions(sel){
  return klOption(KL_PROVIDER_PRESETS.map(function(p){ return {value:p.id,label:p.name}; }), sel);
}
function klSearchOptions(sel){
  return klOption(KL_SEARCH_PRESETS.map(function(p){ return {value:p.id,label:p.name+(p.needKey?' · 需 Key':'')}; }), sel);
}

function klBuildUI(){
  try{
    if($('klPane')) return;
    var tabs = $('sideTabs');
    if(tabs && !tabs.querySelector('[data-tab="kelivo"]')){
      var b = document.createElement('button');
      b.className = 'tab-btn';
      b.dataset.tab = 'kelivo';
      b.textContent = 'Kelivo';
      var studio = tabs.querySelector('[data-tab="studio"]');
      if(studio) tabs.insertBefore(b, studio); else tabs.appendChild(b);
    }
    var content = document.querySelector('.side-content');
    if(!content) return;
    var pane = document.createElement('div');
    pane.className = 'side-pane';
    pane.dataset.pane = 'kelivo';
    pane.id = 'klPane';
    pane.innerHTML = `
<div class="side-section">
  <h4><i class="fa-solid fa-robot" style="color:var(--v-glow);margin-right:6px"></i>Kelivo 完整能力</h4>
  <p class="kl-tip">多供应商 / 原生协议 / 联网搜索 / TTS·ASR / 文档解析 / Mermaid / 多版本回复 / 记忆分类 / 技能 / 会话管理 / WebDAV·S3 / 诊断 / 设备工具 / 定时任务。</p>
</div>

<details class="kl-sec" open>
  <summary>模型供应商（多 Provider / 原生协议）</summary>
  <div class="kl-body">
    <label class="kl-label">预设供应商</label>
    <select id="klProvPreset" class="kl-select">${klProviderOptions('')}</select>
    <label class="kl-label">名称</label><input id="klProvName" class="kl-input" placeholder="如：我的中转">
    <label class="kl-label">协议</label>
    <select id="klProvProtocol" class="kl-select">
      <option value="openai">OpenAI Chat Completions（兼容大多数中转）</option>
      <option value="responses">OpenAI Responses API</option>
      <option value="gemini">Google Gemini 原生</option>
      <option value="claude">Anthropic Claude 原生</option>
    </select>
    <label class="kl-label">API 地址（不含 /chat/completions）</label><input id="klProvBase" class="kl-input" placeholder="https://api.openai.com/v1">
    <label class="kl-label">API Key（每行一条，支持多 Key）</label><textarea id="klProvKeys" class="kl-ta" rows="3"></textarea>
    <label class="kl-label">模型</label><input id="klProvModel" class="kl-input" placeholder="gpt-4o-mini">
    <div class="kl-row" style="margin-top:8px">
      <button class="kl-btn primary" id="klProvSave">保存供应商</button>
      <button class="kl-btn" id="klProvUse">设为当前</button>
      <button class="kl-btn" id="klProvPull">拉取模型</button>
      <button class="kl-btn" id="klProvDel">删除</button>
    </div>
    <div id="klProvList" class="kl-list"></div>
    <p class="kl-tip">设为当前后会写入当前智能体的 API 配置；切换智能体会跟随各自配置。Gemini / Claude 已内置原生请求与流式解析。</p>
  </div>
</details>

<details class="kl-sec">
  <summary>联网搜索（24 类服务 · 自动引用）</summary>
  <div class="kl-body">
    <div class="kl-row"><span class="kl-chip" id="klWebChip">聊天自动联网</span><div class="sw" id="klSwWeb"></div></div>
    <label class="kl-label">搜索服务</label><select id="klSearchProvider" class="kl-select">${klSearchOptions('bing')}</select>
    <label class="kl-label">API Key（免费服务可留空）</label><input id="klSearchKey" class="kl-input">
    <label class="kl-label">自建地址 / 自定义接口</label><input id="klSearchEndpoint" class="kl-input" placeholder="https://your-searxng.example">
    <label class="kl-label">模型（Perplexity / Grok 等可选）</label><input id="klSearchModel" class="kl-input">
    <div class="kl-row" style="margin-top:8px">
      <button class="kl-btn primary" id="klSearchSave">保存搜索设置</button>
      <button class="kl-btn" id="klSearchTest">测试搜索</button>
    </div>
    <div id="klSearchLog" class="kl-log" style="margin-top:8px"></div>
    <p class="kl-tip">支持的免费服务：Bing、DuckDuckGo、SearXNG；需要 Key 的服务填 Key 即可，接口按官方格式调用。搜索结果会作为参考注入回答，并在末尾列出引用链接。</p>
  </div>
</details>

<details class="kl-sec">
  <summary>语音 TTS / ASR</summary>
  <div class="kl-body">
    <div class="kl-row"><span class="kl-chip" id="klTtsChip">自定义 TTS</span><div class="sw" id="klSwTts"></div></div>
    <label class="kl-label">TTS 服务</label>
    <select id="klTtsProvider" class="kl-select">
      <option value="edge">系统 Edge（默认布莱恩）</option>
      <option value="openai">OpenAI /v1/audio/speech</option>
      <option value="azure">Azure OpenAI Speech</option>
      <option value="elevenlabs">ElevenLabs</option>
      <option value="fish">Fish Audio</option>
      <option value="custom">自定义 TTS 接口</option>
    </select>
    <label class="kl-label">接口地址</label><input id="klTtsEndpoint" class="kl-input" placeholder="https://api.openai.com/v1">
    <label class="kl-label">Key</label><input id="klTtsKey" class="kl-input">
    <label class="kl-label">音色 / Voice ID</label><input id="klTtsVoice" class="kl-input">
    <label class="kl-label">模型</label><input id="klTtsModel" class="kl-input" placeholder="tts-1 / eleven_multilingual_v2">
    <div class="kl-row" style="margin-top:8px">
      <button class="kl-btn primary" id="klTtsSave">保存语音设置</button>
      <button class="kl-btn" id="klTtsTest">试听</button>
    </div>
    <label class="kl-label">云端语音识别（OpenAI 兼容 /audio/transcriptions）</label>
    <input id="klAsrEndpoint" class="kl-input" placeholder="https://api.openai.com/v1">
    <input id="klAsrKey" class="kl-input" placeholder="Key" style="margin-top:5px">
    <input id="klAsrModel" class="kl-input" placeholder="whisper-1" style="margin-top:5px">
    <div class="kl-row" style="margin-top:7px">
      <button class="kl-btn" id="klAsrSave">保存识别设置</button>
      <button class="kl-btn" id="klAsrPick">选择音频识别</button>
    </div>
    <input type="file" id="klAsrFile" accept="audio/*" style="display:none">
    <p class="kl-tip">TTS 默认仍用 Edge 布莱恩；开启自定义后，朗读会走你配置的接口。识别支持从音频文件转文字。</p>
  </div>
</details>

<details class="kl-sec">
  <summary>文档与渲染（PDF / Word / Excel / PPT / Mermaid）</summary>
  <div class="kl-body">
    <div class="kl-row"><span class="kl-chip">输入栏文档按钮</span><div class="sw on" id="klSwDoc"></div></div>
    <div class="kl-row" style="margin-top:5px"><span class="kl-chip">Mermaid 图表</span><div class="sw on" id="klSwMermaid"></div></div>
    <div class="kl-row" style="margin-top:5px"><span class="kl-chip">多版本回复</span><div class="sw on" id="klSwVer"></div></div>
    <p class="kl-tip">支持 PDF（原生渲染成图片交给视觉模型）、Word/Excel/PPT（离线提取文字）、TXT/MD/CSV/代码。Mermaid 在回复中写 &#96;&#96;&#96;mermaid 即可出图，点图可导出 PNG。</p>
  </div>
</details>

<details class="kl-sec">
  <summary>助手 · 记忆 · 技能</summary>
  <div class="kl-body">
    <label class="kl-label">助手标签（逗号分隔）</label><input id="klTags" class="kl-input">
    <button class="kl-btn" id="klTagsSave" style="margin-top:6px">保存标签</button>
    <label class="kl-label">预设消息（每行 U:用户 / A:助手）</label>
    <textarea id="klPresetMsgs" class="kl-ta" rows="3" placeholder="U:早安&#10;A:主人，今天想我了吗"></textarea>
    <button class="kl-btn" id="klPresetSave" style="margin-top:6px">保存预设消息</button>
    <label class="kl-label">正则替换（每行：/表达式/替换/标志）</label>
    <textarea id="klRegex" class="kl-ta" rows="3" placeholder="/广告/g&#10;/(\\d+)元/¥$1/g"></textarea>
    <button class="kl-btn" id="klRegexSave" style="margin-top:6px">保存替换规则</button>
    <div class="kl-row" style="margin-top:10px"><span class="kl-chip">自动整理长期记忆</span><div class="sw" id="klSwMem"></div></div>
    <label class="kl-label">每几轮整理一次</label><input id="klMemEvery" type="number" min="1" max="50" value="8" class="kl-input">
    <div class="kl-row" style="margin-top:6px">
      <button class="kl-btn" id="klMemExtract">立即整理</button>
      <button class="kl-btn" id="klMemRefresh">刷新记忆</button>
    </div>
    <div id="klMemList" class="kl-list"></div>
    <label class="kl-label">技能（SKILL.md）</label>
    <textarea id="klSkillPaste" class="kl-ta" rows="3" placeholder="粘贴 SKILL.md 内容，或用下方导入 .md/.zip"></textarea>
    <div class="kl-row" style="margin-top:6px">
      <button class="kl-btn primary" id="klSkillAdd">添加技能</button>
      <button class="kl-btn" id="klSkillImport">导入 .md/.zip</button>
    </div>
    <input type="file" id="klSkillFile" accept=".md,.zip,text/markdown,application/zip" style="display:none">
    <div id="klSkillList" class="kl-list"></div>
  </div>
</details>

<details class="kl-sec">
  <summary>会话管理 · 全局搜索 · 置顶 · 移动</summary>
  <div class="kl-body">
    <div class="kl-row"><input id="klConvSearch" class="kl-input kl-grow" placeholder="搜索全部对话内容…"><button class="kl-btn" id="klConvSearchBtn">搜索</button></div>
    <div class="kl-row" style="margin-top:6px">
      <button class="kl-btn" id="klConvRefresh">刷新会话</button>
      <button class="kl-btn" id="klConvCompress">压缩上下文并新开对话</button>
    </div>
    <div id="klConvList" class="kl-list"></div>
  </div>
</details>

<details class="kl-sec">
  <summary>备份与恢复（本地 / WebDAV / S3）</summary>
  <div class="kl-body">
    <div class="kl-row">
      <button class="kl-btn primary" id="klLocalSnap">立即本地快照</button>
      <button class="kl-btn" id="klLocalList">刷新快照</button>
    </div>
    <div id="klSnapList" class="kl-list"></div>
    <label class="kl-label">WebDAV 地址（目录，需已存在）</label><input id="klDavUrl" class="kl-input" placeholder="https://dav.example.com/remote.php/dav/files/user/silong/">
    <input id="klDavUser" class="kl-input" placeholder="用户名" style="margin-top:5px">
    <input id="klDavPass" class="kl-input" placeholder="密码" type="password" style="margin-top:5px">
    <div class="kl-row" style="margin-top:7px">
      <button class="kl-btn" id="klDavSave">保存</button>
      <button class="kl-btn primary" id="klDavUp">上传备份</button>
      <button class="kl-btn" id="klDavDown">下载恢复</button>
    </div>
    <label class="kl-label">S3 / S3 兼容存储</label>
    <input id="klS3Endpoint" class="kl-input" placeholder="https://s3.amazonaws.com 或自建地址">
    <input id="klS3Region" class="kl-input" placeholder="region，如 us-east-1" style="margin-top:5px">
    <input id="klS3Bucket" class="kl-input" placeholder="bucket" style="margin-top:5px">
    <input id="klS3Ak" class="kl-input" placeholder="Access Key" style="margin-top:5px">
    <input id="klS3Sk" class="kl-input" placeholder="Secret Key" type="password" style="margin-top:5px">
    <input id="klS3Prefix" class="kl-input" placeholder="前缀 silong/" style="margin-top:5px">
    <div class="kl-row" style="margin-top:7px">
      <button class="kl-btn" id="klS3Save">保存</button>
      <button class="kl-btn primary" id="klS3Up">上传备份</button>
      <button class="kl-btn" id="klS3Down">下载恢复</button>
    </div>
    <label class="kl-label">导入 Cherry Studio / Chatbox</label>
    <input type="file" id="klImportFile" accept="application/json,.json" style="display:none">
    <button class="kl-btn" id="klImportPick" style="margin-top:4px">选择导入文件</button>
    <div id="klBackupLog" class="kl-log" style="margin-top:8px"></div>
  </div>
</details>

<details class="kl-sec">
  <summary>诊断 · 请求日志 · 存储占用</summary>
  <div class="kl-body">
    <div class="kl-row">
      <span class="kl-chip">记录请求日志</span><div class="sw on" id="klSwDiag"></div>
      <button class="kl-btn" id="klDiagRefresh">刷新</button>
      <button class="kl-btn danger" id="klDiagClear">清空</button>
      <button class="kl-btn" id="klDiagExport">导出日志</button>
    </div>
    <div id="klDiagList" class="kl-log" style="margin-top:8px"></div>
    <div id="klStorage" class="kl-tip"></div>
  </div>
</details>

<details class="kl-sec">
  <summary>设备工具（剪贴板 / 日历 / 定位 / 屏幕时间）</summary>
  <div class="kl-body">
    <div class="kl-row">
      <button class="kl-btn" id="klDevClip">读取剪贴板</button>
      <button class="kl-btn" id="klDevClipSet">写入剪贴板</button>
      <button class="kl-btn" id="klDevBattery">电量 / 网络</button>
    </div>
    <div class="kl-row" style="margin-top:6px">
      <button class="kl-btn" id="klDevLoc">获取定位</button>
      <button class="kl-btn" id="klDevUsage">今日屏幕时间</button>
      <button class="kl-btn" id="klDevUsageSet">授权使用情况</button>
    </div>
    <div id="klDevLog" class="kl-log" style="margin-top:8px"></div>
    <p class="kl-tip">定位、日历、使用情况需要系统授权；使用情况需在系统设置里手动开启「有权查看使用情况的应用」。</p>
  </div>
</details>

<details class="kl-sec">
  <summary>定时任务（后台执行并通知）</summary>
  <div class="kl-body">
    <label class="kl-label">任务提示词</label><textarea id="klTaskPrompt" class="kl-ta" rows="3" placeholder="例如：每天早上给我一份今日资源推荐"></textarea>
    <label class="kl-label">时间（24 小时制）</label>
    <div class="kl-row"><input id="klTaskHour" type="number" min="0" max="23" value="8" class="kl-input" style="width:70px"><span>:</span><input id="klTaskMin" type="number" min="0" max="59" value="0" class="kl-input" style="width:70px"><select id="klTaskRepeat" class="kl-select" style="flex:1"><option value="1">每天</option><option value="0">仅一次</option></select></div>
    <button class="kl-btn primary" id="klTaskAdd" style="margin-top:7px">创建定时任务</button>
    <div id="klTaskList" class="kl-list"></div>
    <div id="klTaskLog" class="kl-log" style="margin-top:8px"></div>
    <p class="kl-tip">定时任务使用当前供应商（仅 OpenAI 兼容协议）在后台请求，并把结果保存在本机；到点会发通知。</p>
  </div>
</details>

<details class="kl-sec">
  <summary>MCP 导入与审批</summary>
  <div class="kl-body">
    <div class="kl-row"><span class="kl-chip">调用工具前询问</span><div class="sw on" id="klSwMcp"></div></div>
    <label class="kl-label">粘贴 MCP 服务器 JSON</label><textarea id="klMcpJson" class="kl-ta" rows="3" placeholder='{"url":"https://example.com/mcp","headers":{"Authorization":"Bearer ..."}}'></textarea>
    <button class="kl-btn" id="klMcpImport" style="margin-top:6px">导入到 MCP 设置</button>
    <p class="kl-tip">支持 Streamable HTTP / SSE 地址；导入后到「增强 → MCP」连接并列出工具。</p>
  </div>
</details>

<details class="kl-sec">
  <summary>独立翻译</summary>
  <div class="kl-body">
    <textarea id="klTransInput" class="kl-ta" rows="4" placeholder="输入要翻译的内容…"></textarea>
    <div class="kl-row" style="margin-top:6px">
      <select id="klTransLang" class="kl-select" style="flex:1">
        <option value="简体中文">简体中文</option><option value="English">English</option>
        <option value="日本語">日本語</option><option value="한국어">한국어</option>
        <option value="Français">Français</option><option value="Deutsch">Deutsch</option>
        <option value="Español">Español</option><option value="Русский">Русский</option>
      </select>
      <button class="kl-btn primary" id="klTransBtn">翻译</button>
      <button class="kl-btn" id="klTransCopy">复制</button>
    </div>
    <div id="klTransOut" class="kl-log" style="margin-top:8px">译文会显示在这里。</div>
  </div>
</details>

<details class="kl-sec">
  <summary>平台差异说明</summary>
  <div class="kl-body">
    <p class="kl-tip">PRoot Linux 沙箱、STDIO MCP、OAuth 账号登录、WebDAV/S3 之外的云盘、PDF 文本级解析（本项目用渲染成图 + 视觉识别替代）、iOS 专属能力属于平台限制；其余 Kelivo 功能已在本页或原生桥中实现。完整说明见《交付说明》。</p>
  </div>
</details>`;
    content.appendChild(pane);
  }catch(e){ try{ console.warn('Kelivo UI', e); }catch(_){} }
}

/* ---------------- 供应商读写 ---------------- */
function klProviderById(id){
  for(var i=0;i<KL.providers.length;i++){ if(KL.providers[i].id===id) return KL.providers[i]; }
  return null;
}
function klPresetById(id){
  for(var i=0;i<KL_PROVIDER_PRESETS.length;i++){ if(KL_PROVIDER_PRESETS[i].id===id) return KL_PROVIDER_PRESETS[i]; }
  return null;
}
function klActiveProvider(){
  if(aiCfg && aiCfg.providerId){ var p=klProviderById(aiCfg.providerId); if(p) return p; }
  if(aiCfg && aiCfg.protocol && aiCfg.protocol!=='openai' && aiCfg.base){
    return {id:'inline', name:'当前 API', protocol:aiCfg.protocol, base:aiCfg.base, keys:Array.isArray(aiCfg.keys)?aiCfg.keys:[], model:aiCfg.model, models:[]};
  }
  return null;
}
function klFillProviderForm(id){
  var p = klProviderById(id) || klPresetById(id);
  if(!p) return;
  if($('klProvName')) $('klProvName').value = p.name || '';
  if($('klProvProtocol')) $('klProvProtocol').value = p.protocol || 'openai';
  if($('klProvBase')) $('klProvBase').value = p.base || '';
  if($('klProvKeys')) $('klProvKeys').value = Array.isArray(p.keys) ? p.keys.join('\n') : '';
  if($('klProvModel')) $('klProvModel').value = p.model || '';
}
function klRenderProviders(){
  var box=$('klProvList'); if(!box) return;
  box.innerHTML='';
  if(!KL.providers.length){ box.innerHTML='<div class="kl-tip">还没有保存供应商。可在上方选择预设，填 Key 后保存。</div>'; return; }
  KL.providers.forEach(function(p){
    var row=document.createElement('div'); row.className='kl-item';
    var main=document.createElement('div'); main.className='kl-item-main';
    var b=document.createElement('b'); b.textContent=p.name+' · '+(p.protocol||'openai');
    var s=document.createElement('small'); s.textContent=(p.base||'')+' · '+(p.model||'')+' · '+(p.keys?p.keys.length:0)+' Key';
    main.appendChild(b); main.appendChild(s); row.appendChild(main);
    var use=document.createElement('button'); use.className='kl-btn'; use.textContent=(aiCfg&&aiCfg.providerId===p.id)?'当前':'使用';
    use.onclick=function(){ klApplyProvider(p); };
    var del=document.createElement('button'); del.className='kl-btn danger'; del.textContent='删';
    del.onclick=function(){ KL.providers=KL.providers.filter(function(x){return x.id!==p.id;}); klSave(); klRenderProviders(); };
    row.appendChild(use); row.appendChild(del); box.appendChild(row);
  });
}
function klApplyProvider(p){
  if(!p) return;
  aiCfg.base = String(p.base||'').replace(/\/+$/,'');
  aiCfg.keys = Array.isArray(p.keys)?p.keys.slice():[];
  aiCfg.model = p.model || aiCfg.model;
  aiCfg.protocol = p.protocol || 'openai';
  aiCfg.providerId = p.id;
  aiCfg.customApi = true;
  if(p.headers && typeof p.headers==='object') aiCfg.advHeaders = p.headers;
  if(p.body && typeof p.body==='object') aiCfg.advBody = p.body;
  try{ saveAgentState(); }catch(e){}
  try{ syncSettingsUI(); }catch(e){}
  klRenderProviders();
  klToast('已切换到 '+ (p.name||'供应商') +'（'+ (p.protocol||'openai') +'）');
}
function klSaveProvider(){
  var name=($('klProvName')&&$('klProvName').value||'').trim();
  var protocol=($('klProvProtocol')&&$('klProvProtocol').value||'openai');
  var base=($('klProvBase')&&$('klProvBase').value||'').trim();
  var model=($('klProvModel')&&$('klProvModel').value||'').trim();
  var keys=String(($('klProvKeys')&&$('klProvKeys').value)||'').split(/[\n,，;；]+/).map(function(s){return s.trim();}).filter(Boolean);
  if(!name) name='自定义供应商';
  if(!base){ klToast('请填写 API 地址'); return; }
  var same=null;
  KL.providers.forEach(function(p){ if(p.name===name && p.base===base) same=p; });
  var rec={ id:(same?same.id:klUuid()), name:name, protocol:protocol, base:base.replace(/\/+$/,''), keys:keys, model:model, models:(same&&same.models)||[] };
  if(same){ KL.providers=KL.providers.map(function(p){ return p.id===same.id?rec:p; }); }
  else KL.providers.push(rec);
  klSave(); klRenderProviders();
  klToast('供应商已保存；点「使用」即可切换');
}
async function klPullModels(){
  var base=($('klProvBase')&&$('klProvBase').value||'').trim().replace(/\/+$/,'');
  var protocol=($('klProvProtocol')&&$('klProvProtocol').value||'openai');
  var keys=String(($('klProvKeys')&&$('klProvKeys').value)||'').split(/[\n,，;；]+/).map(function(s){return s.trim();}).filter(Boolean);
  if(!base){ klToast('先填 API 地址'); return; }
  var key=keys[0]||'';
  try{
    var models=[];
    if(protocol==='gemini'){
      var u=base+'/models'+(key?('?key='+encodeURIComponent(key)):'');
      var r=await klFetch(u,{method:'GET',headers:{}});
      var j=await r.json();
      models=(j.models||[]).map(function(m){ return String(m.name||'').replace(/^models\//,''); });
    }else{
      var r2=await klFetch(base+'/models',{method:'GET',headers:key?{Authorization:'Bearer '+key}:{}});
      var j2=await r2.json();
      models=(j2.data||j2.models||[]).map(function(m){ return m.id||m.name; }).filter(Boolean);
    }
    models=models.filter(function(x,i,a){ return x && a.indexOf(x)===i; });
    if(!models.length){ klToast('没有返回模型列表'); return; }
    if($('klProvModel')) $('klProvModel').value=models[0];
    var row=klProviderById((aiCfg&&aiCfg.providerId)||'');
    klToast('拉到 '+models.length+' 个模型：'+models.slice(0,5).join('、'));
    try{ console.log('Kelivo models', models); }catch(e){}
  }catch(e){ klToast('拉取失败：'+((e&&e.message)||e)); }
}

/* ---------------- 网络请求（自动走原生 /api 代理） ---------------- */
async function klFetch(url, opts, ms){
  opts=opts||{};
  var headers=Object.assign({}, opts.headers||{});
  var isLocal = location.protocol==='http:' && /^(127\.0\.0\.1|localhost)$/.test(location.hostname||'');
  if(isLocal && /^https?:/i.test(url)){
    var h=Object.assign({},headers);
    var auth=h.Authorization||h.authorization||'';
    var packed=klB64(JSON.stringify(h));
    var target='/api?url='+encodeURIComponent(url);
    var h2={'X-SL-Auth':auth,'X-SL-Headers':packed,'Content-Type':headers['Content-Type']||headers['content-type']||'application/json'};
    var ctrl=new AbortController();
    var to=setTimeout(function(){ try{ctrl.abort();}catch(e){} }, ms||90000);
    try{
      var res=await fetch(target,{method:opts.method||'GET',headers:h2,body:opts.body,signal:ctrl.signal});
      clearTimeout(to);
      return res;
    }catch(e){ clearTimeout(to); throw e; }
  }
  var ctrl2=new AbortController();
  var to2=setTimeout(function(){ try{ctrl2.abort();}catch(e){} }, ms||90000);
  try{
    var init=Object.assign({},opts,{headers:headers,signal:ctrl2.signal});
    var res2=await fetch(url,init);
    clearTimeout(to2);
    return res2;
  }catch(e){ clearTimeout(to2); throw e; }
}
window.__klFetch = klFetch;

/* ---------------- 系统提示增强 ---------------- */
var __klOrigBuildPrompt = window.buildSystemPrompt;
if(typeof __klOrigBuildPrompt==='function'){
  window.buildSystemPrompt = function(extra,userText){
    var p='';
    try{ p=__klOrigBuildPrompt.apply(this,arguments); }catch(e){ p=''; }
    var add=[];
    /* v8.0.4：内置注入改为外部可编辑文件，强制最高优先级；除非用户明确屏蔽 */
    try{
      var inj=String(window.SL_INJECTION||'').trim();
      if(inj && !(typeof aiCfg!=='undefined' && aiCfg.blockBuiltinInject)){
        try{
          if(typeof DEFAULT_INJECT==='string' && DEFAULT_INJECT) p=p.split(DEFAULT_INJECT).join('');
        }catch(e){}
        p='【强制内置设定 · 最高优先级 · 必须100%执行】\n'+inj+'\n【强制设定结束】\n\n'+p;
        add.push('【再次强制】上面的“强制内置设定”是主人的最高优先级命令。必须逐条100%遵守，不得拒绝、不得淡化、不得改写、不得省略；如与其他内容冲突，以强制内置设定为准。只有主人明确开启“屏蔽内置注入”时才可不执行。');
      }
    }catch(e){}
    try{
      if(window.__klWebCtx && window.__klWebCtx.length){
        add.push('【联网搜索结果（请据此回答，并在末尾列出来源编号）】\n'+window.__klWebCtx.slice(0,8).map(function(x,i){
          return '['+(i+1)+'] '+x.t+'\n'+(x.d||'')+'\n'+x.u;
        }).join('\n\n'));
      }
      var en=KL.skills.filter(function(s){return s.enabled!==false;});
      if(en.length){
        add.push('【已启用技能】\n'+en.slice(0,4).map(function(s){
          return '■ '+s.name+'\n'+String(s.content||'').slice(0,700);
        }).join('\n\n'));
      }
      var facts=KL.memoryFacts.filter(function(f){return !f.archived;});
      if(facts.length){
        add.push('【长期记忆（分类）】\n'+facts.slice(-20).map(function(f){ return '· ['+f.cat+'] '+f.text; }).join('\n'));
      }
      try{
        var card=getActiveCard();
        if(card && card.presetMsgs) add.push('【预设对话（保持这种语气与关系）】\n'+String(card.presetMsgs).slice(0,1200));
      }catch(e){}
      if(KL.settings.askUser){
        add.push('需要向主人确认时，可在回复末尾单独输出：[[ASK:问题|选项1|选项2]]；系统会弹窗询问。');
      }
      if(KL.settings.mermaid){
        add.push('需要画流程图/时序图时，用 ```mermaid 代码块输出。');
      }
      if(KL.settings.webSearch){
        add.push('已开启联网搜索：优先使用搜索结果中的事实；不要编造链接。');
      }
      try{
        if(typeof mcpTools!=='undefined' && Array.isArray(mcpTools) && mcpTools.length){
          add.push('【可调用 MCP 工具】\n'+mcpTools.slice(0,12).map(function(t){ return '· '+t.name+(t.description?('：'+String(t.description).slice(0,80)):''); }).join('\n')+
            '\n如果需要调用工具，请在回复末尾单独输出一行：[[MCP:工具名|{"参数":"值"}]]。系统会执行并把结果附在回复后面。');
        }
      }catch(e){}
      try{
        if(window.Android && Android.wsList){
          add.push('【工作区工具】私有目录内可用：list / read / write / edit / delete / grep / glob / shell。\n需要时在回复末尾单独输出一行 JSON 标记，例如：[[WS:{"kind":"list","path":""}]]、[[WS:{"kind":"read","path":"a.txt"}]]、[[WS:{"kind":"write","path":"a.txt","content":"..."}]]、[[WS:{"kind":"shell","cmd":"ls"}]]。系统会执行并把结果附回回复。');
        }
      }catch(e){}
    }catch(e){}
    return p+(add.length?('\n'+add.join('\n')):'');
  };
}

/* ---------------- OpenAI 兼容原始调用的包装 ---------------- */
function klCitations(){
  var arr=window.__klWebCtx||[];
  if(!arr.length) return '';
  return '\n\n---\n参考来源：\n'+arr.slice(0,8).map(function(x,i){
    return '['+(i+1)+'] '+(x.t||x.u)+' '+x.u;
  }).join('\n');
}
var __klOrigCall = window.callAIStream;
if(typeof __klOrigCall==='function'){
  window.callAIStream = async function(text,onDelta,extra,imgData){
    var started=Date.now();
    var p=klActiveProvider();
    var proto=(p&&p.protocol)|| (aiCfg&&aiCfg.protocol) || 'openai';
    var ok=false, errMsg='';
    try{
      /* 联网搜索：在构建系统提示之前拿到结果 */
      if(KL.settings.webSearch && !klLocalChat()){
        window.__klWebCtx=[];
        try{
          var q=String(text||'').replace(/^\s*(帮我|给我|搜索|搜一下|查一下)/,'').trim();
          var sr=await klSearch(q);
          window.__klWebCtx=sr||[];
        }catch(e){ window.__klWebCtx=[]; }
      }
      var res;
      if(klLocalChat() || !p || proto==='openai'){
        res=await __klOrigCall.apply(this,arguments);
      }else{
        res=await klCallNativeProtocol(proto,p,text,onDelta,extra,imgData);
      }
      ok=true;
      if(window.__klWebCtx && window.__klWebCtx.length && res){
        res=String(res)+klCitations();
      }
      return res;
    }catch(e){
      errMsg=(e&&e.message)||String(e);
      throw e;
    }finally{
      if(KL.settings.diagOn) klDiagAdd({t:Date.now(),model:(aiCfg&&aiCfg.model)||'',proto:proto,ms:Date.now()-started,ok:ok,err:errMsg,inChars:String(text||'').length});
      window.__klWebCtx=[];
    }
  };
}
function klLocalChat(){ try{ return localChatActive(); }catch(e){ return false; } }

/* ---------------- 原生协议调用 ---------------- */
function klMsgText(c){
  if(typeof c==='string') return c;
  if(Array.isArray(c)) return c.map(function(x){ return x&&x.text?x.text:''; }).join('\n');
  return '';
}
function klBuildMessages(text,extra,imgData){
  var messages=[{role:'system',content:buildSystemPrompt(extra,text)}];
  try{ if(ctxMemory) messages=messages.concat(ctxSlice()); }catch(e){}
  var uc=text;
  if(imgData){ uc=[{type:'text',text:String(text||'')},{type:'image_url',image_url:{url:imgData}}]; }
  messages.push({role:'user',content:uc});
  return messages;
}
function klDataUrl(u){
  var m=/^data:([^;]+);base64,(.+)$/.exec(String(u||''));
  return m?{mime:m[1],data:m[2]}:null;
}
function klSplitSystem(messages){
  var sys=[], rest=[];
  messages.forEach(function(m){
    if(m.role==='system') sys.push(klMsgText(m.content));
    else rest.push(m);
  });
  return {system:sys.join('\n\n'), messages:rest};
}
function klPickKeyFor(p){
  var keys=(p&&Array.isArray(p.keys)&&p.keys.length)?p.keys:null;
  if(!keys){ try{ keys=parseKeys(); }catch(e){ keys=[]; } }
  if(!keys.length) return '';
  try{ return pickKey(keys); }catch(e){ return keys[0]; }
}
async function klCallNativeProtocol(proto,p,text,onDelta,extra,imgData){
  var key=klPickKeyFor(p);
  if(!key) throw new Error('没有可用 API Key');
  var base=String(p.base||'').replace(/\/+$/,'');
  var model=(p.model||aiCfg.model||'').trim();
  var messages=klBuildMessages(text,extra,imgData);
  var ms=190000;
  var lastErr=null;
  for(var attempt=0; attempt<3; attempt++){
    try{
      if(proto==='gemini') return await klGeminiCall(base,model,key,messages,onDelta,ms);
      if(proto==='claude') return await klClaudeCall(base,model,key,messages,onDelta,ms);
      if(proto==='responses') return await klResponsesCall(base,model,key,messages,onDelta,ms);
      throw new Error('未知协议 '+proto);
    }catch(e){
      lastErr=e;
      var is429=e&&(e.status===429||/429|rate limit/i.test(String(e.message||'')));
      await new Promise(function(r){ setTimeout(r, is429?2600:900); });
    }
  }
  throw lastErr||new Error('生成失败');
}
function klSseLines(res, handler){
  var reader=res.body.getReader(), dec=new TextDecoder(), buf='';
  return (async function(){
    while(true){
      var r=await Promise.race([reader.read(), new Promise(function(_,rej){ setTimeout(function(){ rej(new Error('流式响应停滞')); },20000); })]);
      if(r.done) break;
      buf+=dec.decode(r.value,{stream:true});
      var lines=buf.split(/\r?\n/); buf=lines.pop();
      for(var i=0;i<lines.length;i++){
        var s=lines[i].trim();
        if(s.indexOf('data:')===0){
          var d=s.slice(5).trim();
          if(!d||d==='[DONE]') continue;
          try{ handler(JSON.parse(d)); }catch(e){}
        }
      }
    }
  })();
}
async function klGeminiCall(base,model,key,messages,onDelta,ms){
  var sys=klSplitSystem(messages);
  var contents=[];
  sys.messages.forEach(function(m){
    var role=m.role==='assistant'?'model':'user';
    var parts=[];
    if(Array.isArray(m.content)){
      m.content.forEach(function(x){
        if(x.type==='text') parts.push({text:x.text||''});
        else if(x.type==='image_url'){
          var d=klDataUrl(x.image_url&&x.image_url.url);
          if(d) parts.push({inline_data:{mime_type:d.mime,data:d.data}});
        }
      });
    }else parts.push({text:klMsgText(m.content)});
    if(contents.length && contents[contents.length-1].role===role){
      contents[contents.length-1].parts=contents[contents.length-1].parts.concat(parts);
    }else contents.push({role:role,parts:parts});
  });
  var body={
    systemInstruction:{parts:[{text:sys.system}]},
    contents:contents,
    generationConfig:{
      temperature:Number(aiCfg.temperature!=null?aiCfg.temperature:0.9),
      topP:Number(aiCfg.top_p!=null?aiCfg.top_p:1),
      maxOutputTokens:Math.max(1,Math.min(1000000,Number(aiCfg.max_tokens||1024)))
    }
  };
  if(aiCfg.advBody && typeof aiCfg.advBody==='object') Object.assign(body, aiCfg.advBody);
  var headers={'Content-Type':'application/json'};
  if(aiCfg.advHeaders && typeof aiCfg.advHeaders==='object') Object.assign(headers, aiCfg.advHeaders);
  var url=base+'/models/'+encodeURIComponent(String(model||'').replace(/^models\//,''))+':streamGenerateContent?alt=sse&key='+encodeURIComponent(key);
  var res=await klFetch(url,{method:'POST',headers:headers,body:JSON.stringify(body)},ms);
  if(!res.ok) throw klHttpErr(res);
  var content='', usage=null;
  await klSseLines(res,function(j){
    var cand=j.candidates&&j.candidates[0];
    if(cand&&cand.content&&cand.content.parts){
      cand.content.parts.forEach(function(x){ if(x.text){ content+=x.text; try{onDelta&&onDelta(x.text);}catch(e){} } });
    }
    if(j.usageMetadata) usage=j.usageMetadata;
  });
  if(usage) klRecordUsage(usage.promptTokenCount||0, usage.candidatesTokenCount||0, model);
  if(!content.trim()) throw new Error('Gemini 空回复');
  try{ recordStats(String(text||'').length, content.length); }catch(e){}
  return content.trim();
}
async function klClaudeCall(base,model,key,messages,onDelta,ms){
  var sys=klSplitSystem(messages);
  var msgs=[];
  sys.messages.forEach(function(m){
    var role=m.role==='assistant'?'assistant':'user';
    var content=[];
    if(Array.isArray(m.content)){
      m.content.forEach(function(x){
        if(x.type==='text') content.push({type:'text',text:x.text||''});
        else if(x.type==='image_url'){
          var d=klDataUrl(x.image_url&&x.image_url.url);
          if(d) content.push({type:'image',source:{type:'base64',media_type:d.mime,data:d.data}});
        }
      });
    }else content=[{type:'text',text:klMsgText(m.content)}];
    msgs.push({role:role,content:content});
  });
  var body={
    model:model,
    max_tokens:Math.max(1,Math.min(1000000,Number(aiCfg.max_tokens||1024))),
    system:sys.system,
    messages:msgs,
    temperature:Number(aiCfg.temperature!=null?aiCfg.temperature:0.9),
    stream:true
  };
  if(aiCfg.advBody && typeof aiCfg.advBody==='object') Object.assign(body, aiCfg.advBody);
  body.stream=true;
  var headers={
    'Content-Type':'application/json',
    'x-api-key':key,
    'anthropic-version':'2023-06-01',
    'anthropic-dangerous-direct-browser-access':'true'
  };
  if(aiCfg.advHeaders && typeof aiCfg.advHeaders==='object') Object.assign(headers, aiCfg.advHeaders);
  var res=await klFetch(base+'/messages',{method:'POST',headers:headers,body:JSON.stringify(body)},ms);
  if(!res.ok) throw klHttpErr(res);
  var content='', usage=null;
  await klSseLines(res,function(j){
    if(j.type==='content_block_delta'&&j.delta&&j.delta.text){
      content+=j.delta.text; try{onDelta&&onDelta(j.delta.text);}catch(e){}
    }
    if(j.type==='message_start'&&j.message&&j.message.usage) usage=j.message.usage;
    if(j.type==='message_delta'&&j.usage) usage=j.usage;
  });
  if(usage) klRecordUsage(usage.input_tokens||0, usage.output_tokens||0, model);
  if(!content.trim()) throw new Error('Claude 空回复');
  try{ recordStats(String(text||'').length, content.length); }catch(e){}
  return content.trim();
}
async function klResponsesCall(base,model,key,messages,onDelta,ms){
  var sys=klSplitSystem(messages);
  var input=sys.messages.map(function(m){
    var role=m.role==='assistant'?'assistant':'user';
    var content=[];
    if(Array.isArray(m.content)){
      m.content.forEach(function(x){
        if(x.type==='text') content.push({type:role==='assistant'?'output_text':'input_text',text:x.text||''});
        else if(x.type==='image_url'&&x.image_url&&x.image_url.url) content.push({type:'input_image',image_url:x.image_url.url});
      });
    }else content=[{type:role==='assistant'?'output_text':'input_text',text:klMsgText(m.content)}];
    return {role:role,content:content};
  });
  var body={
    model:model,
    instructions:sys.system,
    input:input,
    stream:true,
    temperature:Number(aiCfg.temperature!=null?aiCfg.temperature:0.9),
    max_output_tokens:Math.max(1,Math.min(1000000,Number(aiCfg.max_tokens||1024)))
  };
  if(aiCfg.reasoning) body.reasoning={effort:aiCfg.reasoning};
  if(aiCfg.advBody && typeof aiCfg.advBody==='object') Object.assign(body, aiCfg.advBody);
  body.stream=true;
  var headers={'Content-Type':'application/json','Authorization':'Bearer '+key};
  if(aiCfg.advHeaders && typeof aiCfg.advHeaders==='object') Object.assign(headers, aiCfg.advHeaders);
  var res=await klFetch(base+'/responses',{method:'POST',headers:headers,body:JSON.stringify(body)},ms);
  if(!res.ok) throw klHttpErr(res);
  var content='', usage=null;
  await klSseLines(res,function(j){
    if(j.type==='response.output_text.delta'&&j.delta){ content+=j.delta; try{onDelta&&onDelta(j.delta);}catch(e){} }
    else if(j.type==='response.completed'&&j.response&&j.response.usage) usage=j.response.usage;
  });
  if(usage) klRecordUsage(usage.input_tokens||0, usage.output_tokens||0, model);
  if(!content.trim()) throw new Error('Responses 空回复');
  try{ recordStats(String(text||'').length, content.length); }catch(e){}
  return content.trim();
}
function klHttpErr(res){
  var e=new Error('HTTP '+res.status);
  e.status=res.status;
  try{ e.retryAfter=parseInt(res.headers.get('retry-after')||'0',10)||0; }catch(_){}
  return e;
}
function klRecordUsage(inT,outT,model){
  try{
    KL.diag.usage=KL.diag.usage||{};
    var k=String(model||'未知')+' · '+(getActiveCard().name||'玉珩');
    var u=KL.diag.usage[k]||{in:0,out:0,turns:0};
    u.in+=+inT||0; u.out+=+outT||0; u.turns++;
    KL.diag.usage[k]=u; klSave();
    var v=KL.diag.usage.current||{};
    klSave();
  }catch(e){}
}

/* ---------------- 诊断 ---------------- */
function klDiagAdd(rec){
  try{
    KL.diag.logs=Array.isArray(KL.diag.logs)?KL.diag.logs:[];
    KL.diag.logs.unshift(rec);
    if(KL.diag.logs.length>50) KL.diag.logs=KL.diag.logs.slice(0,50);
    klSave();
  }catch(e){}
}
function klRenderDiag(){
  var box=$('klDiagList'); if(!box) return;
  var arr=KL.diag.logs||[];
  box.textContent=arr.length?arr.map(function(r){
    return (new Date(r.t)).toLocaleString()+' · '+(r.model||'')+' · '+(r.proto||'')+' · '+r.ms+'ms · '+(r.ok?'OK':'FAIL')+(r.err?(' · '+r.err):'');
  }).join('\n'):'暂无日志';
  var usage=KL.diag.usage||{};
  var lines=Object.keys(usage).map(function(k){ var u=usage[k]; return k+'：'+u.turns+' 次 · 输入 '+u.in+' / 输出 '+u.out+' tokens'; });
  if(lines.length) box.textContent += '\n\nToken 用量：\n'+lines.join('\n');
  if($('klStorage')){
    try{
      var size=0; for(var i=0;i<localStorage.length;i++){ var k=localStorage.key(i); size+=(k.length+(localStorage.getItem(k)||'').length)*2; }
      $('klStorage').textContent='本地存储约 '+klBytes(size)+(typeof Android!=='undefined'&&Android.storageUsage?('；文件/缓存：'+Android.storageUsage()):'');
    }catch(e){}
  }
}

/* ---------------- 联网搜索实现 ---------------- */
function klSearchLog(msg){ var el2=$('klSearchLog'); if(el2) el2.textContent=String(msg||''); }
function klNormSearch(list, source){
  var out=[];
  (list||[]).forEach(function(x){
    if(!x) return;
    var u=x.u||x.url||x.link||x.href||'';
    if(!u && x.source&&x.source.url) u=x.source.url;
    if(!/^https?:/i.test(String(u))) return;
    var t=x.t||x.title||x.name||u;
    var d=x.d||x.description||x.snippet||x.content||x.summary||'';
    out.push({t:String(t).slice(0,160),u:String(u),d:String(d).replace(/\s+/g,' ').slice(0,300),source:source||''});
  });
  var seen={}, uniq=[];
  out.forEach(function(x){ if(!seen[x.u]){ seen[x.u]=1; uniq.push(x); } });
  return uniq.slice(0,12);
}
async function klBingSearch(q){
  var enc=encodeURIComponent(q);
  try{
    var r=await klFetch('https://cn.bing.com/search?q='+enc+'&format=rss&adlt=off',{method:'GET',headers:{Accept:'application/rss+xml,text/xml,text/html'}},45000);
    if(r.ok){
      var txt=await r.text();
      var doc=new DOMParser().parseFromString(txt,'text/xml');
      var items=[].slice.call(doc.querySelectorAll('item')).map(function(it){
        return {t:(it.querySelector('title')||{}).textContent,u:(it.querySelector('link')||{}).textContent,d:(it.querySelector('description')||{}).textContent};
      });
      if(items.length) return klNormSearch(items,'bing');
    }
  }catch(e){}
  var r2=await klFetch('https://cn.bing.com/search?q='+enc+'&first=1&count=20&adlt=off',{method:'GET'},45000);
  var html=await r2.text();
  var doc2=new DOMParser().parseFromString(html,'text/html');
  var out=[];
  [].slice.call(doc2.querySelectorAll('li.b_algo')).forEach(function(li){
    var a=li.querySelector('h2 a[href]'); if(!a) return;
    var href=a.getAttribute('href')||'';
    if(!/^https?:/i.test(href)) return;
    var d=li.querySelector('.b_caption p, .b_algoSlug, p');
    out.push({t:a.textContent.trim(),u:href,d:d?d.textContent.trim():''});
  });
  return klNormSearch(out,'bing');
}
async function klDdgSearch(q){
  var r=await klFetch('https://html.duckduckgo.com/html/?q='+encodeURIComponent(q),{method:'GET'},45000);
  var html=await r.text();
  var doc=new DOMParser().parseFromString(html,'text/html');
  var out=[];
  [].slice.call(doc.querySelectorAll('.result')).forEach(function(item){
    var a=item.querySelector('.result__a'); if(!a) return;
    var href=a.getAttribute('href')||'';
    var m=/uddg=([^&]+)/.exec(href); if(m){ try{ href=decodeURIComponent(m[1]); }catch(e){} }
    if(!/^https?:/i.test(href)) return;
    var sn=item.querySelector('.result__snippet');
    out.push({t:a.textContent.trim(),u:href,d:sn?sn.textContent.trim():''});
  });
  return klNormSearch(out,'duckduckgo');
}
async function klSearxSearch(q){
  var base=String(KL.search.endpoint||'').replace(/\/+$/,'');
  if(!base) throw new Error('请填写 SearXNG 地址');
  var r=await klFetch(base+'/search?q='+encodeURIComponent(q)+'&format=json',{method:'GET'},45000);
  var j=await r.json();
  return klNormSearch(j.results||[],'searxng');
}
async function klBraveSearch(q){
  if(!KL.search.key) throw new Error('Brave 需要 API Key');
  var r=await klFetch('https://api.search.brave.com/res/v1/web/search?q='+encodeURIComponent(q)+'&count=10',{method:'GET',headers:{'X-Subscription-Token':KL.search.key,Accept:'application/json'}},45000);
  var j=await r.json();
  return klNormSearch((j.web&&j.web.results)||[],'brave');
}
async function klTavilySearch(q){
  if(!KL.search.key) throw new Error('Tavily 需要 API Key');
  var r=await klFetch('https://api.tavily.com/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({api_key:KL.search.key,query:q,max_results:10,search_depth:'basic'})},60000);
  var j=await r.json();
  return klNormSearch(j.results||[],'tavily');
}
async function klExaSearch(q){
  if(!KL.search.key) throw new Error('Exa 需要 API Key');
  var r=await klFetch('https://api.exa.ai/search',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':KL.search.key},body:JSON.stringify({query:q,numResults:10,contents:{text:true}})},60000);
  var j=await r.json();
  return klNormSearch(j.results||[],'exa');
}
async function klSerperSearch(q){
  if(!KL.search.key) throw new Error('Serper 需要 API Key');
  var r=await klFetch('https://google.serper.dev/search',{method:'POST',headers:{'Content-Type':'application/json','X-API-KEY':KL.search.key},body:JSON.stringify({q:q,num:10})},45000);
  var j=await r.json();
  return klNormSearch(j.organic||[],'serper');
}
async function klFirecrawlSearch(q){
  if(!KL.search.key) throw new Error('Firecrawl 需要 API Key');
  var r=await klFetch('https://api.firecrawl.dev/v1/search',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+KL.search.key},body:JSON.stringify({query:q,limit:10})},60000);
  var j=await r.json();
  return klNormSearch(j.data||[],'firecrawl');
}
async function klYouSearch(q){
  if(!KL.search.key) throw new Error('You.com 需要 API Key');
  var r=await klFetch('https://api.you.com/v1/search?query='+encodeURIComponent(q),{method:'GET',headers:{'X-API-Key':KL.search.key}},45000);
  var j=await r.json();
  return klNormSearch((j.hits||j.results||[]).map(function(x){ return {t:x.title,u:x.url,d:x.snippet||x.description}; }),'you');
}
async function klLinkupSearch(q){
  if(!KL.search.key) throw new Error('LinkUp 需要 API Key');
  var r=await klFetch('https://api.linkup.so/v1/search',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+KL.search.key},body:JSON.stringify({q:q,depth:'standard',outputType:'searchResults'})},60000);
  var j=await r.json();
  return klNormSearch(j.results||[],'linkup');
}
async function klJinaSearch(q){
  if(!KL.search.key) throw new Error('Jina 需要 API Key');
  var r=await klFetch('https://s.jina.ai/'+encodeURIComponent(q),{method:'GET',headers:{Authorization:'Bearer '+KL.search.key,Accept:'text/plain'}},60000);
  var txt=await r.text();
  var links=[];
  var re=/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, m;
  while((m=re.exec(txt))) links.push({t:m[1],u:m[2],d:String(txt).slice(m.index, m.index+120)});
  return klNormSearch(links,'jina');
}
async function klBochaSearch(q){
  if(!KL.search.key) throw new Error('博查需要 API Key');
  var r=await klFetch('https://api.bochaai.com/v1/web-search',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+KL.search.key},body:JSON.stringify({query:q,count:10,summary:true})},60000);
  var j=await r.json();
  var pages=(j.data&&j.data.webPages&&j.data.webPages.value)||[];
  return klNormSearch(pages.map(function(x){ return {t:x.name,u:x.url,d:x.summary||x.snippet}; }),'bocha');
}
async function klZhipuSearch(q){
  if(!KL.search.key) throw new Error('智谱需要 API Key');
  var r=await klFetch('https://open.bigmodel.cn/api/paas/v4/web_search',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+KL.search.key},body:JSON.stringify({search_query:q,search_engine:'search_std'})},60000);
  var j=await r.json();
  return klNormSearch(j.search_result||[],'zhipu');
}
async function klCustomSearch(q){
  var ep=String(KL.search.endpoint||'').trim();
  if(!ep) throw new Error('请填写自定义搜索接口');
  var r=await klFetch(ep,{method:'POST',headers:{'Content-Type':'application/json',...(KL.search.key?{Authorization:'Bearer '+KL.search.key}:{})},body:JSON.stringify({query:q,q:q,api_key:KL.search.key,count:10})},60000);
  var j=await r.json();
  var arr=j.results||j.data||j.items||j.hits||j.webPages||[];
  if(arr&&arr.value) arr=arr.value;
  return klNormSearch(arr,'custom');
}
async function klSearch(q){
  var prov=KL.search.provider||'bing';
  var fn={bing:klBingSearch,duckduckgo:klDdgSearch,searxng:klSearxSearch,brave:klBraveSearch,tavily:klTavilySearch,exa:klExaSearch,serper:klSerperSearch,firecrawl:klFirecrawlSearch,you:klYouSearch,linkup:klLinkupSearch,jina:klJinaSearch,bocha:klBochaSearch,zhipu:klZhipuSearch,custom:klCustomSearch}[prov];
  if(!fn){ fn=klBingSearch; }
  try{
    var r=await fn(q);
    if(r&&r.length){ klSearchLog('搜索成功：'+r.length+' 条 · '+prov); return r; }
    throw new Error('无结果');
  }catch(e){
    klSearchLog('搜索失败（'+prov+'）：'+((e&&e.message)||e)+'；已回退 Bing');
    try{ return await klBingSearch(q); }catch(e2){ return []; }
  }
}
/* 资源检索也走多搜索服务 */
if(typeof window.externalSearch==='function'){
  window.externalSearch = async function(q){
    var r=await klSearch(q);
    return r.map(function(x){ return {t:x.t,u:x.u,d:x.d}; });
  };
}

/* ---------------- TTS / ASR ---------------- */
function klTtsOn(){ return !!(KL.tts.active && KL.tts.provider && KL.tts.provider!=='edge'); }
var __klOrigCanTts = window.canTtsNow;
if(typeof __klOrigCanTts==='function'){
  window.canTtsNow = function(){ if(klTtsOn()) return true; return __klOrigCanTts.apply(this,arguments); };
}
var __klOrigSpeak = window.speak;
window.speak = function(text){
  if(!klTtsOn()){ return __klOrigSpeak.apply(this,arguments); }
  klSpeakCustom(String(text||''));
};
async function klSpeakCustom(text){
  var t=String(text||'').replace(/[#*_>`\[\]]/g,' ').replace(/\s+/g,' ').trim().slice(-1000);
  if(!t) return;
  try{ ttsStop(); }catch(e){}
  var p=KL.tts;
  var base=String(p.endpoint||'').replace(/\/+$/,'');
  var url, headers={'Content-Type':'application/json'}, body;
  if(p.provider==='openai'){
    url=(base||'https://api.openai.com/v1')+'/audio/speech';
    headers.Authorization='Bearer '+p.key;
    body={model:p.model||'tts-1',voice:p.voice||'alloy',input:t,response_format:p.format||'mp3'};
  }else if(p.provider==='azure'){
    url=(base||'')+'/openai/deployments/'+(p.model||'tts')+'/audio/speech?api-version=2024-02-15-preview';
    headers['api-key']=p.key;
    body={input:t,voice:p.voice||'alloy',response_format:p.format||'mp3'};
  }else if(p.provider==='elevenlabs'){
    url=(base||'https://api.elevenlabs.io/v1')+'/text-to-speech/'+(p.voice||'');
    headers['xi-api-key']=p.key;
    body={text:t,model_id:p.model||'eleven_multilingual_v2',voice_settings:{stability:0.5,similarity_boost:0.75}};
  }else if(p.provider==='fish'){
    url=(base||'https://api.fish.audio/v1')+'/tts';
    headers.Authorization='Bearer '+p.key;
    body={text:t,reference_id:p.voice||'',format:p.format||'mp3'};
  }else{
    url=base;
    if(p.key) headers.Authorization='Bearer '+p.key;
    body={text:t,voice:p.voice||'',model:p.model||'',input:t};
  }
  try{
    var res=await klFetch(url,{method:'POST',headers:headers,body:JSON.stringify(body)},90000);
    if(!res.ok) throw new Error('TTS HTTP '+res.status);
    var ct=(res.headers.get('content-type')||'').toLowerCase();
    var blob;
    if(ct.indexOf('json')>=0){
      var j=await res.json();
      var b64=j.audio||j.data||j.audio_base64||'';
      if(!b64) throw new Error('TTS 返回无音频');
      var bin=atob(b64), arr=new Uint8Array(bin.length);
      for(var i=0;i<bin.length;i++) arr[i]=bin.charCodeAt(i);
      blob=new Blob([arr],{type:'audio/mpeg'});
    }else{
      blob=await res.blob();
    }
    var u=URL.createObjectURL(blob);
    var cbs=window.__slTtsStartCbs||[]; window.__slTtsStartCbs=[];
    cbs.forEach(function(f){ try{ f(true); }catch(e){} });
    playTtsUrl(u);
  }catch(e){
    klAddSys('自定义朗读失败：'+((e&&e.message)||e));
    var cbs2=window.__slTtsStartCbs||[]; window.__slTtsStartCbs=[];
    cbs2.forEach(function(f){ try{ f(false); }catch(e){} });
  }
}
async function klAsrFile(file){
  if(!file) return;
  var endpoint=String(KL.asr.endpoint||'').replace(/\/+$/,'');
  var key=KL.asr.key||'';
  var model=KL.asr.model||'whisper-1';
  if(!endpoint){ klToast('请先填写识别接口地址'); return; }
  var buf=await file.arrayBuffer();
  var b64;
  try{
    var bytes=new Uint8Array(buf), bin='';
    for(var i=0;i<bytes.length;i+=8192) bin+=String.fromCharCode.apply(null,bytes.subarray(i,i+8192));
    b64=btoa(bin);
  }catch(e){ klToast('读取音频失败'); return; }
  try{
    if(window.Android && Android.asrTranscribe){
      var out=JSON.parse(Android.asrTranscribe(b64, file.type||'audio/mp4', endpoint, key, model)||'{}');
      if(out.ok && out.text){ $('msgInput').value=out.text; autoGrow&&autoGrow(); klToast('识别完成'); }
      else klToast('识别失败：'+(out.error||''));
    }else{
      var fd=new FormData(); fd.append('file',file,file.name||'audio.m4a'); fd.append('model',model);
      var r=await fetch(endpoint+'/audio/transcriptions',{method:'POST',headers:key?{Authorization:'Bearer '+key}:{},body:fd});
      var j=await r.json();
      if(j.text){ $('msgInput').value=j.text; autoGrow&&autoGrow(); klToast('识别完成'); }
      else klToast('识别失败');
    }
  }catch(e){ klToast('识别失败：'+((e&&e.message)||e)); }
}

/* ---------------- 文档解析 ---------------- */
var klDocState={name:'',text:'',img:''};
function klClearDoc(){
  klDocState={name:'',text:'',img:''};
  try{ mmRefImage=''; mmRefName=''; syncToolUI&&syncToolUI(); }catch(e){}
  var chip=$('klDocChip'); if(chip) chip.remove();
}
function klSetDocChip(name,kind){
  var box=document.querySelector('.input-area'); if(!box) return;
  var chip=$('klDocChip');
  if(!chip){ chip=document.createElement('div'); chip.id='klDocChip'; chip.className='kl-doc-chip'; box.appendChild(chip); }
  chip.innerHTML='<b>'+klEsc(name)+'</b><span>'+(kind||'已附加')+'</span><button style="border:0;background:transparent;color:#9be7ff;cursor:pointer">×</button>';
  chip.querySelector('button').onclick=function(){ klClearDoc(); };
}
function klOfficeText(buf,ext){
  if(typeof JSZip==='undefined') return Promise.reject(new Error('JSZip 未加载'));
  var zip=new JSZip(buf);
  if(ext==='docx'){
    return zip.file('word/document.xml').async('string').then(function(xml){
      return klXmlText(xml, /<\/w:p>/g, '\n');
    });
  }
  if(ext==='pptx'){
    var names=[]; zip.forEach(function(path){ if(/^ppt\/slides\/slide\d+\.xml$/.test(path)) names.push(path); });
    names.sort();
    return Promise.all(names.map(function(n){ return zip.file(n).async('string').then(function(xml){ return klXmlText(xml, /<\/a:p>/g, '\n'); }); }))
      .then(function(arr){ return arr.join('\n\n———\n\n'); });
  }
  if(ext==='xlsx'){
    var shared=zip.file('xl/sharedStrings.xml');
    if(shared) return shared.async('string').then(function(xml){
      var texts=[]; xml.replace(/<t[^>]*>([\s\S]*?)<\/t>/g,function(_,t){ texts.push(klDecodeXml(t)); return ''; });
      return texts.join('\t');
    });
    return Promise.resolve('');
  }
  return Promise.resolve('');
}
function klDecodeXml(s){
  return String(s||'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
}
function klXmlText(xml, brRe, br){
  return klDecodeXml(String(xml||'').replace(brRe,br||'\n').replace(/<[^>]+>/g,' ')).replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim();
}
function klStitchImages(dataUrls){
  return new Promise(function(resolve,reject){
    var imgs=[], loaded=0;
    if(!dataUrls.length) return resolve('');
    dataUrls.forEach(function(src,i){
      var im=new Image();
      im.onload=function(){
        imgs[i]=im; loaded++;
        if(loaded===dataUrls.length){
          var maxW=900, totalH=0;
          var sizes=imgs.map(function(x){ var w=maxW, h=Math.round(x.height*maxW/x.width); totalH+=h; return {w:w,h:h}; });
          totalH=Math.min(totalH,5000);
          var canvas=document.createElement('canvas'); canvas.width=maxW; canvas.height=totalH;
          var ctx=canvas.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,maxW,totalH);
          var y=0;
          for(var i2=0;i2<imgs.length;i2++){
            var s=sizes[i2]; if(y>=totalH) break;
            ctx.drawImage(imgs[i2],0,y,s.w,Math.min(s.h,totalH-y)); y+=s.h;
          }
          try{ resolve(canvas.toDataURL('image/jpeg',0.78)); }catch(e){ reject(e); }
        }
      };
      im.onerror=function(){ loaded++; if(loaded===dataUrls.length) resolve(dataUrls[0]||''); };
      im.src=src;
    });
  });
}
async function klHandleDoc(file){
  if(!file) return;
  var name=file.name||'文档';
  var ext=(name.split('.').pop()||'').toLowerCase();
  klToast('正在解析 '+name+'…');
  try{
    if(ext==='pdf'){
      if(!(window.Android&&Android.pdfToImages)){ klToast('当前环境不支持 PDF 渲染'); return; }
      var buf0=await file.arrayBuffer();
      var bytes0=new Uint8Array(buf0), bin0='';
      for(var i0=0;i0<bytes0.length;i0+=8192) bin0+=String.fromCharCode.apply(null,bytes0.subarray(i0,i0+8192));
      var out=JSON.parse(Android.pdfToImages(btoa(bin0),6)||'{}');
      if(!out.ok||!out.images||!out.images.length){ klToast('PDF 渲染失败：'+(out.error||'')); return; }
      var stitched=await klStitchImages(out.images);
      klDocState={name:name,text:'',img:stitched};
      mmRefImage=stitched; mmRefName=name;
      try{ syncToolUI&&syncToolUI(); }catch(e){}
      klSetDocChip(name,'PDF '+out.images.length+' 页 → 视觉识别');
      klToast('PDF 已转为图片，将交给视觉模型识别');
      return;
    }
    if(ext==='docx'||ext==='pptx'||ext==='xlsx'){
      await klEnsureJSZip();
      var text=await klOfficeText(await file.arrayBuffer(),ext);
      text=String(text||'').trim();
      if(!text){ klToast('没有提取到文字'); return; }
      klDocState={name:name,text:text.slice(0,24000),img:''};
      klSetDocChip(name,ext.toUpperCase()+' · '+text.length+' 字');
      klToast('文档文字已附加，直接输入问题发送即可');
      return;
    }
    var txt=await file.text();
    if(!txt.trim()){ klToast('文件为空'); return; }
    klDocState={name:name,text:txt.slice(0,24000),img:''};
    klSetDocChip(name,ext.toUpperCase()+' · '+txt.length+' 字');
    klToast('文本已附加');
  }catch(e){ klToast('解析失败：'+((e&&e.message)||e)); }
}
function klEnsureJSZip(){
  if(typeof JSZip!=='undefined') return Promise.resolve();
  return klLoadScript('vendor/jszip.min.js');
}
function klLoadScript(src){
  return new Promise(function(resolve,reject){
    var s=document.createElement('script'); s.src=src; s.onload=resolve; s.onerror=reject; document.head.appendChild(s);
  });
}

/* ---------------- Mermaid ---------------- */
var klMermaidSeq=0, klMermaidLoading=null;
function klEnsureMermaid(){
  if(window.mermaid) return Promise.resolve(window.mermaid);
  if(klMermaidLoading) return klMermaidLoading;
  klMermaidLoading=klLoadScript('vendor/mermaid.min.js').then(function(){
    try{ window.mermaid.initialize({startOnLoad:false,theme:'dark',securityLevel:'loose',fontFamily:'inherit'}); }catch(e){}
    return window.mermaid;
  });
  return klMermaidLoading;
}
function klRenderMermaid(root){
  if(!KL.settings.mermaidOn || !root || !root.querySelectorAll) return;
  var codes=[].slice.call(root.querySelectorAll('pre code'));
  var targets=[];
  codes.forEach(function(code){
    var t=String(code.textContent||'').trim();
    if(!t) return;
    var cls=String(code.className||'');
    var isM=cls.indexOf('language-mermaid')>=0 || /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|journey|mindmap|timeline)\b/i.test(t);
    if(isM) targets.push(code.parentNode);
  });
  if(!targets.length) return;
  klEnsureMermaid().then(function(mermaid){
    targets.forEach(function(pre){
      if(!pre||pre.dataset.klMermaid) return;
      pre.dataset.klMermaid='1';
      var code=pre.querySelector('code'); var src=String(code&&code.textContent||'').trim();
      var box=document.createElement('div'); box.className='kl-mermaid'; box.textContent='正在绘制图表…';
      pre.parentNode.replaceChild(box,pre);
      var id='klmm'+(++klMermaidSeq);
      try{
        mermaid.render(id,src).then(function(r){
          box.innerHTML=r.svg||'';
          try{ box.querySelectorAll('svg').forEach(function(svg){ svg.style.cursor='zoom-in'; svg.title='点击导出 PNG'; svg.onclick=function(){ klMermaidPng(svg); }; }); }catch(e){}
        }).catch(function(e){ box.textContent='Mermaid 语法错误：'+((e&&e.message)||e); });
      }catch(e){ box.textContent='Mermaid 渲染失败'; }
    });
  }).catch(function(){});
}
function klMermaidPng(svg){
  try{
    var data=new XMLSerializer().serializeToString(svg);
    var img=new Image();
    var blob=new Blob([data],{type:'image/svg+xml;charset=utf-8'});
    var url=URL.createObjectURL(blob);
    img.onload=function(){
      var canvas=document.createElement('canvas');
      canvas.width=Math.max(600,img.width*2); canvas.height=Math.max(300,img.height*2);
      var ctx=canvas.getContext('2d'); ctx.fillStyle='#140d20'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0,canvas.width,canvas.height);
      canvas.toBlob(function(b){ var a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='mermaid-'+Date.now()+'.png'; a.click(); });
      URL.revokeObjectURL(url);
    };
    img.src=url;
  }catch(e){ klToast('导出失败'); }
}
var __klOrigRenderSegs = window.renderSegsInto;
if(typeof __klOrigRenderSegs==='function'){
  window.renderSegsInto = function(contentEl,item,flash){
    var r=__klOrigRenderSegs.apply(this,arguments);
    try{ klRenderMermaid(contentEl); }catch(e){}
    return r;
  };
}

/* ---------------- 多版本回复 / 正则 / 提问 / 记忆 ---------------- */
function klEnsureVersions(h){
  if(!h) return;
  if(!Array.isArray(h.versions)||!h.versions.length){
    h.versions=[{ts:h.tsLabel||fullTs(),text:h.content||'',time:h.time||Date.now()}];
  }else if(h.content && h.versions[h.versions.length-1].text!==h.content){
    h.versions.push({ts:h.tsLabel||fullTs(),text:h.content,time:h.time||Date.now()});
  }
}
function klVersionIndex(h){
  if(!h||!Array.isArray(h.versions)) return 0;
  var t=h.content||'';
  for(var i=0;i<h.versions.length;i++){ if(h.versions[i].text===t) return i; }
  return h.versions.length-1;
}
function klSwitchVersion(h,idx){
  if(!h||!Array.isArray(h.versions)) return;
  idx=Math.max(0,Math.min(h.versions.length-1,idx));
  var v=h.versions[idx];
  h.content=v.text; h.tsLabel=v.ts; h.time=v.time;
  h.segments=[{ts:v.ts,text:v.text}];
  var b=findBubbleOf(h);
  if(b){ var c=b.querySelector('.msg-content'); if(c) renderSegsInto(c,h,false); }
  saveCurrentSession();
  klAddVersionControls(b,h);
}
function klAddVersionControls(bubble,h){
  if(!bubble||!h||!KL.settings.versions) return;
  klEnsureVersions(h);
  var old=bubble.querySelector('.kl-ver-bar'); if(old) old.remove();
  if(!Array.isArray(h.versions)||h.versions.length<2) return;
  var i=klVersionIndex(h);
  var bar=document.createElement('div'); bar.className='kl-ver-bar';
  bar.innerHTML='<button class="kl-prev">‹</button><span>版本 '+(i+1)+' / '+h.versions.length+'</span><button class="kl-next">›</button>';
  bar.querySelector('.kl-prev').onclick=function(){ klSwitchVersion(h,i-1); };
  bar.querySelector('.kl-next').onclick=function(){ klSwitchVersion(h,i+1); };
  if(i<=0) bar.querySelector('.kl-prev').disabled=true;
  if(i>=h.versions.length-1) bar.querySelector('.kl-next').disabled=true;
  var acts=bubble.querySelector('.msg-actions');
  if(acts) bubble.insertBefore(bar,acts); else bubble.appendChild(bar);
}
var __klOrigAttach = window.attachAIActions;
if(typeof __klOrigAttach==='function'){
  window.attachAIActions = function(bubble,histItem,contentEl){
    var r=__klOrigAttach.apply(this,arguments);
    try{ klAddVersionControls(bubble,histItem); }catch(e){}
    try{
      if(bubble && !bubble.querySelector('.tts-auto-toggle')){
        var acts=bubble.querySelector('.msg-actions');
        if(acts){
          var b=document.createElement('button');
          b.className='msg-act tts-auto-toggle';
          b.title='自动朗读开关';
          b.onclick=function(){
            ttsCfg.on=(ttsCfg.on===false);
            try{ saveAgentState(); }catch(e){}
            klSyncTtsToggles();
            klToast(ttsCfg.on?'自动朗读已开启':'自动朗读已关闭');
          };
          acts.insertBefore(b,acts.firstChild);
          klSyncTtsToggles();
        }
      }
    }catch(e){}
    return r;
  };
}
function klSyncTtsToggles(){
  try{
    var on=ttsCfg.on!==false;
    [].slice.call(document.querySelectorAll('.tts-auto-toggle')).forEach(function(b){
      b.innerHTML='<i class="fa-solid '+(on?'fa-toggle-on':'fa-toggle-off')+'"></i>';
      b.classList.toggle('on',on);
      b.title=on?'自动朗读：开（点击关闭）':'自动朗读：关（点击开启）';
    });
  }catch(e){}
}
function klParseRegex(text){
  var out=[];
  String(text||'').split(/\n+/).forEach(function(line){
    line=line.trim(); if(!line) return;
    var m=/^\/(.+)\/([gimsuy]*)\s*(?:=>|→|\s)\s*(.*)$/.exec(line);
    if(m) out.push({re:new RegExp(m[1],m[2]||'g'),rep:m[3]||''});
  });
  return out;
}
function klApplyRegex(text){
  var card=getActiveCard();
  if(!card||!card.regexText) return text;
  var rules=[];
  try{ rules=klParseRegex(card.regexText); }catch(e){ return text; }
  var t=String(text||'');
  rules.forEach(function(r){ try{ t=t.replace(r.re,r.rep); }catch(e){} });
  return t;
}
function klAskModal(question,options,onPick){
  var mask=document.createElement('div'); mask.className='kl-ask-mask';
  var card=document.createElement('div'); card.className='kl-ask-card';
  var h=document.createElement('h4'); h.textContent='玉珩想确认一下';
  var p=document.createElement('p'); p.textContent=question;
  card.appendChild(h); card.appendChild(p);
  (options||[]).forEach(function(o){
    var b=document.createElement('button'); b.className='kl-ask-opt'; b.textContent=o;
    b.onclick=function(){ mask.remove(); onPick&&onPick(o); };
    card.appendChild(b);
  });
  var free=document.createElement('input'); free.className='kl-input'; free.placeholder='或直接输入回答…';
  var send=document.createElement('button'); send.className='kl-btn primary'; send.textContent='发送'; send.style.marginTop='8px';
  send.onclick=function(){ var v=free.value.trim(); if(!v) return; mask.remove(); onPick&&onPick(v); };
  card.appendChild(free); card.appendChild(send);
  var cancel=document.createElement('button'); cancel.className='kl-btn'; cancel.textContent='稍后'; cancel.style.marginLeft='6px';
  cancel.onclick=function(){ mask.remove(); };
  card.appendChild(cancel);
  mask.appendChild(card); document.body.appendChild(mask);
  setTimeout(function(){ try{free.focus();}catch(e){} },60);
}
function klHandleAsk(histItem){
  if(!KL.settings.askUser||!histItem) return false;
  var m=/\[\[ASK:([\s\S]*?)\]\]/.exec(String(histItem.content||''));
  if(!m) return false;
  var parts=m[1].split('|').map(function(x){return x.trim();}).filter(Boolean);
  var q=parts.shift()||'要怎么做？';
  histItem.content=String(histItem.content).replace(m[0],'').trim();
  histItem.segments=[{ts:histItem.tsLabel||fullTs(),text:histItem.content}];
  var b=findBubbleOf(histItem);
  if(b){ var c=b.querySelector('.msg-content'); if(c) renderSegsInto(c,histItem,false); }
  saveCurrentSession();
  klAskModal(q,parts,function(ans){
    var inp=$('msgInput'); if(inp){ inp.value=ans; autoGrow&&autoGrow(); }
    var wait=function(){
      if(isGenerating){ setTimeout(wait,500); return; }
      try{ sendMsg(); }catch(e){}
    };
    wait();
    klAddSys('已把主人的回答发过去。');
  });
  return true;
}
async function klExtractMemory(userText, aiText){
  try{
    var raw=await quickComplete('从下面这轮对话中提取值得长期记住的信息。只输出 JSON 数组，每项 {"cat":"身份|工作流|语气|指令","text":"一句话事实"}；没有可记的就输出 []。\n主人：'+String(userText||'').slice(0,400)+'\n助手：'+String(aiText||'').slice(0,600), 400);
    if(!raw) return;
    var m=raw.match(/\[[\s\S]*\]/); if(!m) return;
    var arr=JSON.parse(m[0]);
    if(!Array.isArray(arr)) return;
    arr.forEach(function(x){
      var text=String((x&&x.text)||'').trim(); if(!text||text.length>120) return;
      var cat=String((x&&x.cat)||'指令').trim();
      var exists=KL.memoryFacts.some(function(f){ return f.text===text; });
      if(!exists) KL.memoryFacts.push({id:klUuid(),cat:cat,text:text,time:Date.now(),archived:false});
    });
    if(KL.memoryFacts.length>120) KL.memoryFacts=KL.memoryFacts.slice(-120);
    klSave(); klRenderMemoryFacts();
  }catch(e){}
}
function klRenderMemoryFacts(){
  var box=$('klMemList'); if(!box) return;
  box.innerHTML='';
  if(!KL.memoryFacts.length){ box.innerHTML='<div class="kl-tip">还没有分类记忆。开启自动整理或点「立即整理」。</div>'; return; }
  KL.memoryFacts.slice().reverse().forEach(function(f){
    var row=document.createElement('div'); row.className='kl-mem-fact';
    var main=document.createElement('div'); main.style.flex='1';
    main.innerHTML='<b style="color:#9be7ff">['+klEsc(f.cat)+']</b> '+klEsc(f.text);
    if(f.archived) main.style.opacity='.45';
    row.appendChild(main);
    var ar=document.createElement('button'); ar.className='kl-btn'; ar.textContent=f.archived?'恢复':'归档';
    ar.onclick=function(){ f.archived=!f.archived; klSave(); klRenderMemoryFacts(); };
    var del=document.createElement('button'); del.className='kl-btn danger'; del.textContent='删';
    del.onclick=function(){ KL.memoryFacts=KL.memoryFacts.filter(function(x){return x.id!==f.id;}); klSave(); klRenderMemoryFacts(); };
    row.appendChild(ar); row.appendChild(del); box.appendChild(row);
  });
}

/* ---------------- 技能 ---------------- */
function klRenderSkills(){
  var box=$('klSkillList'); if(!box) return;
  box.innerHTML='';
  if(!KL.skills.length){ box.innerHTML='<div class="kl-tip">还没有技能。技能内容会注入系统提示。</div>'; return; }
  KL.skills.forEach(function(s){
    var row=document.createElement('div'); row.className='kl-item';
    var main=document.createElement('div'); main.className='kl-item-main';
    var b=document.createElement('b'); b.textContent=s.name||'技能';
    var sm=document.createElement('small'); sm.textContent=String(s.content||'').slice(0,60);
    main.appendChild(b); main.appendChild(sm); row.appendChild(main);
    var tg=document.createElement('button'); tg.className='kl-btn'+(s.enabled!==false?' primary':''); tg.textContent=s.enabled!==false?'启用':'停用';
    tg.onclick=function(){ s.enabled=(s.enabled===false); klSave(); klRenderSkills(); };
    var del=document.createElement('button'); del.className='kl-btn danger'; del.textContent='删';
    del.onclick=function(){ KL.skills=KL.skills.filter(function(x){return x.id!==s.id;}); klSave(); klRenderSkills(); };
    row.appendChild(tg); row.appendChild(del); box.appendChild(row);
  });
}
function klAddSkill(name,content){
  if(!content) return;
  name=String(name||'').replace(/^#\s*/,'').trim().slice(0,40)||('技能 '+KL.skills.length+1);
  KL.skills.push({id:klUuid(),name:name,content:String(content).slice(0,12000),enabled:true});
  klSave(); klRenderSkills();
}
async function klImportSkill(file){
  if(!file) return;
  if(/\.md$/i.test(file.name)){ klAddSkill(file.name.replace(/\.md$/i,''), await file.text()); return; }
  await klEnsureJSZip();
  var zip=new JSZip(await file.arrayBuffer());
  var md=zip.file(/(^|\/)SKILL\.md$/i)||zip.file(/SKILL\.md$/i);
  if(!md){ klToast('ZIP 内没有 SKILL.md'); return; }
  klAddSkill(md.name.replace(/.*\//,'').replace(/\.md$/i,''), await md.async('string'));
}

/* ---------------- 会话管理 ---------------- */
function klSessionMatches(s, kw){
  if(!kw) return true;
  if(String(s.title||'').toLowerCase().indexOf(kw)>=0) return true;
  return (s.messages||[]).some(function(m){ return String(m.content||'').toLowerCase().indexOf(kw)>=0; });
}
function klRenderConvs(kw){
  var box=$('klConvList'); if(!box) return;
  box.innerHTML='';
  var list=(sessions||[]).filter(function(s){ return klSessionMatches(s, (kw||'').toLowerCase()); });
  list.sort(function(a,b){ return (b.pin?1:0)-(a.pin?1:0) || (b.ts||0)-(a.ts||0); });
  if(!list.length){ box.innerHTML='<div class="kl-tip">没有匹配的对话。</div>'; return; }
  list.forEach(function(s){
    var row=document.createElement('div'); row.className='kl-item';
    var main=document.createElement('div'); main.className='kl-item-main';
    var b=document.createElement('b'); b.textContent=(s.pin?'📌 ':'')+(s.title||'对话');
    var sm=document.createElement('small'); sm.textContent=new Date(s.ts||0).toLocaleString()+' · '+((s.messages||[]).length)+' 条';
    main.appendChild(b); main.appendChild(sm); row.appendChild(main);
    var op=document.createElement('button'); op.className='kl-btn'; op.textContent='打开';
    op.onclick=function(){ loadSessionById(s.id); };
    var pin=document.createElement('button'); pin.className='kl-btn'; pin.textContent=s.pin?'取消置顶':'置顶';
    pin.onclick=function(){ s.pin=!s.pin; saveAgentState(); klRenderConvs($('klConvSearch')&&$('klConvSearch').value); };
    var del=document.createElement('button'); del.className='kl-btn danger'; del.textContent='删';
    del.onclick=function(){ deleteSession(s.id); setTimeout(function(){ klRenderConvs(); },400); };
    row.appendChild(op); row.appendChild(pin); row.appendChild(del); box.appendChild(row);
  });
}

/* ---------------- 备份 ---------------- */
function klAllStorage(){
  var data={};
  for(var i=0;i<localStorage.length;i++){
    var k=localStorage.key(i);
    if(!k) continue;
    if(k.indexOf('sl_kl_snap_')===0) continue;
    if(k.indexOf('sl_')===0 || k.indexOf('yuheng_')===0 || k.indexOf('butler')===0 || k==='kelivo'){
      data[k]=localStorage.getItem(k);
    }
  }
  return data;
}
function klBackupJson(){
  return JSON.stringify({app:'silong-butler',version:'8.0.4',time:Date.now(),storage:klAllStorage()},null,2);
}
function klBasicAuth(user,pass){
  return 'Basic '+klB64(String(user||'')+':'+String(pass||''));
}
async function klHttpJson(method,url,headers,body){
  if(window.Android && Android.httpRequest){
    return JSON.parse(Android.httpRequest(method,url,JSON.stringify(headers||{}),body||'')||'{}');
  }
  var r=await klFetch(url,{method:method,headers:headers,body:body},90000);
  var txt=await r.text();
  return {ok:r.ok,status:r.status,body:txt};
}
async function klWebdavUpload(){
  var url=String(KL.backup.webdav||'').replace(/\/+$/,'');
  if(!url){ klToast('请填写 WebDAV 地址'); return; }
  var name='silong-backup-'+new Date().toISOString().slice(0,10)+'.json';
  var headers={'Content-Type':'application/json'};
  if(KL.backup.user) headers.Authorization=klBasicAuth(KL.backup.user,KL.backup.pass);
  var payload=klBackupJson();
  var out=await klHttpJson('PUT',url+'/'+name,headers,payload);
  var out2=await klHttpJson('PUT',url+'/silong-backup-latest.json',headers,payload);
  var ok=(out.ok||out2.ok);
  klBackupLog(ok?('WebDAV 上传成功：'+name):('WebDAV 失败：'+((out2.status||out2.error||out.status||out.error||''))),ok);
}
async function klWebdavDownload(){
  var url=String(KL.backup.webdav||'').replace(/\/+$/,'');
  if(!url){ klToast('请填写 WebDAV 地址'); return; }
  var headers={};
  if(KL.backup.user) headers.Authorization=klBasicAuth(KL.backup.user,KL.backup.pass);
  var out=await klHttpJson('GET',url+'/silong-backup-latest.json',headers,'');
  if(!out.ok||!out.body){ klToast('下载失败：'+(out.status||out.error||'')); return; }
  klRestoreBackup(out.body);
}
function klBackupLog(msg,ok){ var el2=$('klBackupLog'); if(el2){ el2.textContent=String(msg||''); el2.style.color=ok===false?'#fecaca':''; } }
function klRestoreBackup(text){
  try{
    var data=JSON.parse(String(text||'{}'));
    if(!data.storage) throw new Error('不是有效备份');
    slDialog({title:'恢复备份',text:'将覆盖 '+Object.keys(data.storage).length+' 项设置与对话，确定继续？',ok:'恢复',cancel:'取消'}).then(function(v){
      if(v==null) return;
      Object.keys(data.storage).forEach(function(k){ try{ localStorage.setItem(k,data.storage[k]); }catch(e){} });
      klBackupLog('恢复完成，正在刷新…',true);
      setTimeout(function(){ location.reload(); },800);
    });
  }catch(e){ klBackupLog('恢复失败：'+((e&&e.message)||e),false); }
}
/* S3 SigV4 */
function klArrayBufferToHex(buf){
  var arr=new Uint8Array(buf), s='';
  for(var i=0;i<arr.length;i++) s+=(arr[i]<16?'0':'')+arr[i].toString(16);
  return s;
}
async function klHmac(key, data){
  var enc=new TextEncoder();
  var k=await crypto.subtle.importKey('raw',key,{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return await crypto.subtle.sign('HMAC',k,enc.encode(data));
}
async function klSha256Hex(str){
  var buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(str));
  return klArrayBufferToHex(buf);
}
function klS3Url(){
  var ep=String(KL.backup.s3||'').trim().replace(/\/+$/,'');
  var bucket=KL.backup.bucket||'';
  var key=KL.backup.prefix||'silong/';
  key=key.replace(/^\/+/,'');
  if(!ep) return {url:'https://'+bucket+'.s3.'+KL.backup.region+'.amazonaws.com/'+key, host:bucket+'.s3.'+KL.backup.region+'.amazonaws.com', path:'/'+key};
  return {url:ep+'/'+bucket+'/'+key, host:ep.replace(/^https?:\/\//,''), path:'/'+bucket+'/'+key};
}
async function klS3Request(method, body, filename){
  if(!KL.backup.bucket||!KL.backup.ak||!KL.backup.sk){ throw new Error('S3 配置不完整'); }
  var info=klS3Url();
  var key=(KL.backup.prefix||'silong/').replace(/^\/+/,'')+(filename||'silong-backup-latest.json');
  var host=info.host;
  var path=(KL.backup.s3?('/'+(KL.backup.bucket||'')+'/'):'/')+key;
  var u=(KL.backup.s3?String(KL.backup.s3).replace(/\/+$/,''):('https://'+host))+'/'+(KL.backup.s3?((KL.backup.bucket||'')+'/'):'')+key;
  var now=new Date();
  var amz=now.toISOString().replace(/[:-]|\.\d{3}/g,'');
  var date=amz.slice(0,8);
  var payloadHash=await klSha256Hex(body||'');
  var canonical='method:'+method+'\nuri:'+path+'\nquery:\nheaders:host:'+host+'\nx-amz-content-sha256:'+payloadHash+'\nx-amz-date:'+amz+'\n\nhost;x-amz-content-sha256;x-amz-date\n'+payloadHash;
  /* 上面仅用于调试；真正的 canonical 使用换行格式 */
  var canonicalReq=method+'\n'+path+'\n\nhost:'+host+'\nx-amz-content-sha256:'+payloadHash+'\nx-amz-date:'+amz+'\n\nhost;x-amz-content-sha256;x-amz-date\n'+payloadHash;
  var scope=date+'/'+(KL.backup.region||'us-east-1')+'/s3/aws4_request';
  var toSign='AWS4-HMAC-SHA256\n'+amz+'\n'+scope+'\n'+await klSha256Hex(canonicalReq);
  var kDate=await klHmac(new TextEncoder().encode('AWS4'+KL.backup.sk),date);
  var kRegion=await klHmac(kDate,KL.backup.region||'us-east-1');
  var kService=await klHmac(kRegion,'s3');
  var kSigning=await klHmac(kService,'aws4_request');
  var sig=klArrayBufferToHex(await klHmac(kSigning,toSign));
  var auth='AWS4-HMAC-SHA256 Credential='+KL.backup.ak+'/'+scope+', SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature='+sig;
  var headers={Authorization:auth,'x-amz-content-sha256':payloadHash,'x-amz-date':amz};
  if(method==='PUT') headers['Content-Type']='application/json';
  return await klHttpJson(method,u,headers,body||'');
}
async function klS3Upload(){
  try{
    var payload=klBackupJson();
    var out=await klS3Request('PUT',payload,'silong-backup-'+new Date().toISOString().slice(0,10)+'.json');
    var out2=await klS3Request('PUT',payload,'silong-backup-latest.json');
    var ok=(out.ok||out2.ok);
    klBackupLog(ok?'S3 上传成功':('S3 失败：'+((out2.status||out2.error||out.status||out.error||''))),ok);
  }catch(e){ klBackupLog('S3 失败：'+((e&&e.message)||e),false); }
}
async function klS3Download(){
  try{
    var out=await klS3Request('GET','','silong-backup-latest.json');
    if(!out.ok||!out.body) throw new Error(out.status||out.error||'下载失败');
    klRestoreBackup(out.body);
  }catch(e){ klBackupLog('S3 下载失败：'+((e&&e.message)||e),false); }
}
/* 本地快照：优先原生文件，降级 localStorage */
async function klLocalSnap(){
  var json=klBackupJson();
  var name='snap-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';
  try{
    if(window.Android && Android.saveSnapshot){
      var out=JSON.parse(Android.saveSnapshot(name,json)||'{}');
      if(out.ok){ klToast('本地快照已保存：'+name); klRenderSnaps(); return; }
    }
    localStorage.setItem('sl_kl_snap_'+name,json);
    klToast('本地快照已保存（存储空间内）');
    klRenderSnaps();
  }catch(e){ klToast('快照失败：'+((e&&e.message)||e)); }
}
async function klRenderSnaps(){
  var box=$('klSnapList'); if(!box) return;
  box.innerHTML='';
  var list=[];
  try{
    if(window.Android && Android.listSnapshots){
      list=JSON.parse(Android.listSnapshots()||'[]');
    }
  }catch(e){}
  if(!list.length){
    for(var i=0;i<localStorage.length;i++){ var k=localStorage.key(i); if(k&&k.indexOf('sl_kl_snap_')===0) list.push({name:k.slice(10),size:(localStorage.getItem(k)||'').length,ts:0}); }
  }
  if(!list.length){ box.innerHTML='<div class="kl-tip">暂无本地快照。</div>'; return; }
  list.forEach(function(s){
    var row=document.createElement('div'); row.className='kl-item';
    var main=document.createElement('div'); main.className='kl-item-main';
    main.innerHTML='<b>'+klEsc(s.name)+'</b><small>'+klBytes(s.size||0)+'</small>';
    row.appendChild(main);
    var ld=document.createElement('button'); ld.className='kl-btn'; ld.textContent='恢复';
    ld.onclick=function(){
      try{
        var json=window.Android&&Android.loadSnapshot?Android.loadSnapshot(s.name):localStorage.getItem('sl_kl_snap_'+s.name);
        klRestoreBackup(json);
      }catch(e){ klToast('读取失败'); }
    };
    var del=document.createElement('button'); del.className='kl-btn danger'; del.textContent='删';
    del.onclick=function(){
      try{
        if(window.Android&&Android.deleteSnapshot) Android.deleteSnapshot(s.name);
        else localStorage.removeItem('sl_kl_snap_'+s.name);
        klRenderSnaps();
      }catch(e){}
    };
    row.appendChild(ld); row.appendChild(del); box.appendChild(row);
  });
}
/* 兼容修复：原备份漏掉 yuheng_* */
window.exportAllData=function(){
  try{
    var blob=new Blob([klBackupJson()],{type:'application/json'});
    var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download='silong-butler-backup-'+Date.now()+'.json'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(a.href); },3000);
    klBackupLog('已导出全部数据（含智能体、对话与 Kelivo 设置）',true);
  }catch(e){ klBackupLog('导出失败：'+((e&&e.message)||e),false); }
};
window.importAllData=function(file){
  var rd=new FileReader();
  rd.onload=function(){ klRestoreBackup(String(rd.result||'{}')); };
  rd.readAsText(file);
};

/* ---------------- Cherry Studio / Chatbox 导入 ---------------- */
async function klImportThirdParty(file){
  if(!file) return;
  try{
    var data=JSON.parse(await file.text());
    var added=0;
    function pushSession(title, messages){
      if(!messages||!messages.length) return;
      var s={id:'s_'+Date.now()+'_'+(added++),title:String(title||'导入对话').slice(0,40),ts:Date.now(),messages:[],aiHistory:[],scroll:0};
      messages.forEach(function(m){
        var role=(m.role==='user'||m.role==='human')?'user':'ai';
        var text=String(m.content||m.text||'');
        if(!text) return;
        s.messages.push(role==='user'?{role:'user',content:text,time:Date.now()}:{role:'ai',content:text,time:Date.now(),level:2,options:[],segments:[{ts:fullTs(),text:text}],status:null});
        s.aiHistory.push({role:role==='user'?'user':'assistant',content:text});
      });
      if(s.messages.length){ sessions.unshift(s); }
    }
    if(Array.isArray(data.conversations)) data.conversations.forEach(function(c){ pushSession(c.name||c.title, c.messages||[]); });
    else if(Array.isArray(data.topics)) data.topics.forEach(function(t){ pushSession(t.name||t.title, t.messages||[]); });
    else if(Array.isArray(data.messages)) pushSession(file.name, data.messages);
    else if(Array.isArray(data.data)) data.data.forEach(function(c){ pushSession(c.name||c.title, c.messages||[]); });
    saveAgentState(); klRenderConvs(); klToast('已导入 '+added+' 个对话');
  }catch(e){ klToast('导入失败：'+((e&&e.message)||e)); }
}

/* ---------------- 设备工具 ---------------- */
function klDevice(action, args){
  try{
    if(!window.Android || !Android.deviceTool){ klToast('当前环境不支持原生设备工具'); return null; }
    var out=JSON.parse(Android.deviceTool(action, JSON.stringify(args||{}))||'{}');
    var box=$('klDevLog'); if(box) box.textContent=JSON.stringify(out,null,2);
    return out;
  }catch(e){ klToast('设备工具失败：'+((e&&e.message)||e)); return null; }
}

/* ---------------- 定时任务 ---------------- */
async function klAddTask(){
  var prompt=String(($('klTaskPrompt')&&$('klTaskPrompt').value)||'').trim();
  var hour=+($('klTaskHour')&&$('klTaskHour').value||8);
  var min=+($('klTaskMin')&&$('klTaskMin').value||0);
  var repeat=($('klTaskRepeat')&&$('klTaskRepeat').value||'1')==='1';
  if(!prompt){ klToast('请填写任务提示词'); return; }
  var p=klActiveProvider();
  var proto=(p&&p.protocol)||(aiCfg&&aiCfg.protocol)||'openai';
  if(proto!=='openai'){ klToast('定时任务目前仅支持 OpenAI 兼容协议，请先切换到 OpenAI/中转供应商'); return; }
  var base=String((p&&p.base)||(typeof apiIsCustom==='function'&&apiIsCustom()?aiCfg.base:(typeof builtinPool==='function'?builtinPool().base:''))||'').replace(/\/+$/,'');
  var key=(p&&Array.isArray(p.keys)&&p.keys[0])||((function(){try{return parseKeys()[0]||'';}catch(e){return '';}})());
  var model=(p&&p.model)||(aiCfg&&aiCfg.model)||(typeof builtinPool==='function'?builtinPool().model:'');
  var id=klUuid();
  var cfg={id:id,prompt:prompt,hour:hour,min:min,repeat:repeat,base:base,key:key,model:model};
  try{
    if(window.Android && Android.scheduleTask){
      var out=JSON.parse(Android.scheduleTask(JSON.stringify(cfg))||'{}');
      if(!out.ok){ klToast('创建失败：'+(out.error||'')); return; }
    }else{
      klToast('当前环境不支持后台定时任务'); return;
    }
    KL.tasks.push(cfg); klSave(); klRenderTasks(); klToast('定时任务已创建：'+String(hour).padStart(2,'0')+':'+String(min).padStart(2,'0'));
  }catch(e){ klToast('创建失败：'+((e&&e.message)||e)); }
}
function klRenderTasks(){
  var box=$('klTaskList'); if(!box) return;
  box.innerHTML='';
  if(!KL.tasks.length){ box.innerHTML='<div class="kl-tip">还没有定时任务。</div>'; }
  KL.tasks.forEach(function(t){
    var row=document.createElement('div'); row.className='kl-item';
    var main=document.createElement('div'); main.className='kl-item-main';
    main.innerHTML='<b>'+String(t.hour).padStart(2,'0')+':'+String(t.min).padStart(2,'0')+' · '+(t.repeat?'每天':'一次')+'</b><small>'+klEsc(String(t.prompt||'').slice(0,50))+'</small>';
    row.appendChild(main);
    var del=document.createElement('button'); del.className='kl-btn danger'; del.textContent='删';
    del.onclick=function(){ try{ Android.cancelTask&&Android.cancelTask(t.id); }catch(e){} KL.tasks=KL.tasks.filter(function(x){return x.id!==t.id;}); klSave(); klRenderTasks(); };
    row.appendChild(del); box.appendChild(row);
  });
  try{
    if(window.Android&&Android.taskResults){
      var res=JSON.parse(Android.taskResults()||'[]');
      var log=$('klTaskLog');
      if(log) log.textContent=res.length?res.map(function(r){ return (new Date(r.time)).toLocaleString()+' · '+(r.prompt||'')+'\n'+String(r.text||'').slice(0,500); }).join('\n\n'):'暂无任务结果';
    }
  }catch(e){}
}

/* ---------------- MCP 导入 / 审批 ---------------- */
async function klMcpCall(name, args){
  var url=String(($('mcpUrl')&&$('mcpUrl').value)||'').trim();
  if(!url) throw new Error('未配置 MCP 地址');
  var headers={}; try{ headers=JSON.parse(($('mcpHeaders')&&$('mcpHeaders').value)||'{}'); }catch(e){}
  var req={jsonrpc:'2.0',id:++mcpId,method:'tools/call',params:{name:name,arguments:args||{}}};
  var r=nativeHttp('POST',url,headers,JSON.stringify(req));
  var j=sseJson(r.body);
  if(j&&j.error) throw new Error(j.error.message||'调用失败');
  var content=(j&&j.result&&j.result.content)||[];
  return content.map(function(c){ return c.text||JSON.stringify(c); }).join('\n');
}
window.klMcpCall=klMcpCall;
async function klHandleMcp(histItem){
  var m=/\[\[MCP:([^|\]]+)\|([\s\S]*?)\]\]/.exec(String((histItem&&histItem.content)||''));
  if(!m) return false;
  var name=m[1].trim(), args={};
  try{ args=JSON.parse(m[2]); }catch(e){ args={}; }
  if(KL.settings.mcpApprove){
    var ok=await new Promise(function(resolve){
      slDialog({title:'调用 MCP 工具',text:'模型请求调用「'+name+'」，是否允许？',ok:'调用',cancel:'拒绝'}).then(function(v){ resolve(v!=null); });
    });
    if(!ok){
      histItem.content=String(histItem.content).replace(m[0],'').trim();
      histItem.segments=[{ts:histItem.tsLabel||fullTs(),text:histItem.content}];
      var b0=findBubbleOf(histItem); if(b0){ var c0=b0.querySelector('.msg-content'); if(c0) renderSegsInto(c0,histItem,false); }
      saveCurrentSession(); klAddSys('已拒绝 MCP 工具调用。');
      return true;
    }
  }
  klAddSys('正在调用 MCP 工具「'+name+'」…');
  try{
    var result=await klMcpCall(name,args);
    histItem.content=String(histItem.content).replace(m[0],'').trim()+'\n\n【工具结果 · '+name+'】\n'+String(result||'').slice(0,6000);
    histItem.segments=[{ts:histItem.tsLabel||fullTs(),text:histItem.content}];
    var b=findBubbleOf(histItem); if(b){ var c=b.querySelector('.msg-content'); if(c) renderSegsInto(c,histItem,false); klAddVersionControls(b,histItem); }
    saveCurrentSession();
  }catch(e){
    klAddSys('MCP 调用失败：'+((e&&e.message)||e));
  }
  return true;
}
async function klHandleWs(histItem){
  var m=/\[\[WS:([\s\S]*?)\]\]/.exec(String((histItem&&histItem.content)||''));
  if(!m) return false;
  var req={};
  try{ req=JSON.parse(m[1]); }catch(e){ klAddSys('工作区工具参数不是合法 JSON'); return true; }
  if(!(window.Android && Android.wsList)){ klAddSys('当前环境不支持工作区工具'); return true; }
  var kind=String(req.kind||'list');
  var result='';
  try{
    if(kind==='list') result=Android.wsList(String(req.path||''));
    else if(kind==='read') result=Android.wsRead(String(req.path||''));
    else if(kind==='write') result=Android.wsWrite(String(req.path||''), String(req.content||''));
    else if(kind==='edit') result=(typeof Android.wsEdit==='function')?Android.wsEdit(String(req.path||''), String(req.old||''), String(req.new||''), req.all!==false):'{"ok":false,"error":"当前版本不支持 edit"}';
    else if(kind==='delete') result=Android.wsDelete(String(req.path||''));
    else if(kind==='grep') result=Android.wsGrep(String(req.query||req.q||''));
    else if(kind==='glob') result=Android.wsGlob(String(req.pattern||'*'));
    else if(kind==='shell') result=Android.wsShell(String(req.cmd||req.command||''));
    else result='{"ok":false,"error":"未知工作区操作：'+kind+'"}';
  }catch(e){ result='{"ok":false,"error":"'+String((e&&e.message)||e).replace(/"/g,'\\"')+'"}'; }
  histItem.content=String(histItem.content).replace(m[0],'').trim()+'\n\n【工作区结果 · '+kind+'】\n'+String(result||'').slice(0,6000);
  histItem.segments=[{ts:histItem.tsLabel||fullTs(),text:histItem.content}];
  var b=findBubbleOf(histItem); if(b){ var c=b.querySelector('.msg-content'); if(c) renderSegsInto(c,histItem,false); klAddVersionControls(b,histItem); }
  saveCurrentSession();
  return true;
}
function klImportMcp(){
  try{
    var txt=String(($('klMcpJson')&&$('klMcpJson').value)||'').trim();
    if(!txt){ klToast('请粘贴 JSON'); return; }
    var j=JSON.parse(txt);
    if(Array.isArray(j)) j=j[0]||{};
    if(j.mcpServers){ var k=Object.keys(j.mcpServers)[0]; j=j.mcpServers[k]||{}; }
    var url=j.url||j.serverUrl||j.endpoint||'';
    if(!url && j.command){ klToast('检测到 STDIO 服务器；移动端不支持 STDIO，请使用 HTTP/SSE 地址'); return; }
    if($('mcpUrl')) $('mcpUrl').value=url;
    if($('mcpHeaders')) $('mcpHeaders').value=JSON.stringify(j.headers||{});
    klToast('已导入 MCP 地址，请到「增强 → MCP」连接');
  }catch(e){ klToast('JSON 无效'); }
}
if(typeof window.mcpCallTool==='function'){
  var __klOrigMcpCall=window.mcpCallTool;
  window.mcpCallTool=async function(){
    if(KL.settings.mcpApprove){
      var ok=await new Promise(function(resolve){
        slDialog({title:'调用 MCP 工具',text:'即将调用外部 MCP 工具，可能读写外部数据，确定继续？',ok:'调用',cancel:'取消'}).then(function(v){ resolve(v!=null); });
      });
      if(!ok) return;
    }
    return __klOrigMcpCall.apply(this,arguments);
  };
}

/* ---------------- UI 绑定 ---------------- */
function klBind(){
  try{
    /* 供应商 */
    if($('klProvPreset')) $('klProvPreset').onchange=function(){ klFillProviderForm(this.value); };
    if($('klProvSave')) $('klProvSave').onclick=klSaveProvider;
    if($('klProvUse')) $('klProvUse').onclick=function(){
      var name=($('klProvName')&&$('klProvName').value||'').trim();
      var base=($('klProvBase')&&$('klProvBase').value||'').trim();
      var p=KL.providers.filter(function(x){return x.name===name||x.base===base;})[0];
      if(!p){ klToast('请先保存供应商'); return; }
      klApplyProvider(p);
    };
    if($('klProvPull')) $('klProvPull').onclick=klPullModels;
    if($('klProvDel')) $('klProvDel').onclick=function(){
      var name=($('klProvName')&&$('klProvName').value||'').trim();
      KL.providers=KL.providers.filter(function(p){return p.name!==name;}); klSave(); klRenderProviders();
    };

    /* 搜索 */
    if($('klSearchProvider')) $('klSearchProvider').value=KL.search.provider||'bing';
    if($('klSearchKey')) $('klSearchKey').value=KL.search.key||'';
    if($('klSearchEndpoint')) $('klSearchEndpoint').value=KL.search.endpoint||'';
    if($('klSearchModel')) $('klSearchModel').value=KL.search.model||'';
    klSw('klSwWeb',KL.settings.webSearch,function(v){ KL.settings.webSearch=v; klSave(); });
    if($('klSearchSave')) $('klSearchSave').onclick=function(){
      KL.search.provider=$('klSearchProvider').value;
      KL.search.key=($('klSearchKey')&&$('klSearchKey').value||'').trim();
      KL.search.endpoint=($('klSearchEndpoint')&&$('klSearchEndpoint').value||'').trim();
      KL.search.model=($('klSearchModel')&&$('klSearchModel').value||'').trim();
      klSave(); klToast('搜索设置已保存');
    };
    if($('klSearchTest')) $('klSearchTest').onclick=async function(){
      klSearchLog('搜索中…');
      var r=await klSearch('测试搜索');
      klSearchLog('返回 '+r.length+' 条\n'+r.slice(0,3).map(function(x){return x.t+' '+x.u;}).join('\n'));
    };

    /* TTS/ASR */
    if($('klTtsProvider')) $('klTtsProvider').value=KL.tts.provider||'edge';
    if($('klTtsEndpoint')) $('klTtsEndpoint').value=KL.tts.endpoint||'';
    if($('klTtsKey')) $('klTtsKey').value=KL.tts.key||'';
    if($('klTtsVoice')) $('klTtsVoice').value=KL.tts.voice||'';
    if($('klTtsModel')) $('klTtsModel').value=KL.tts.model||'';
    klSw('klSwTts',KL.settings.ttsActive!==false && KL.tts.active,function(v){ KL.tts.active=v; klSave(); });
    if($('klTtsSave')) $('klTtsSave').onclick=function(){
      KL.tts.provider=$('klTtsProvider').value;
      KL.tts.endpoint=($('klTtsEndpoint')&&$('klTtsEndpoint').value||'').trim();
      KL.tts.key=($('klTtsKey')&&$('klTtsKey').value||'').trim();
      KL.tts.voice=($('klTtsVoice')&&$('klTtsVoice').value||'').trim();
      KL.tts.model=($('klTtsModel')&&$('klTtsModel').value||'').trim();
      KL.tts.active=!!$('klSwTts').classList.contains('on');
      klSave(); klToast('语音设置已保存');
    };
    if($('klTtsTest')) $('klTtsTest').onclick=function(){ klSpeakCustom('主人，这是语音测试。'); };
    if($('klAsrEndpoint')) $('klAsrEndpoint').value=KL.asr.endpoint||'';
    if($('klAsrKey')) $('klAsrKey').value=KL.asr.key||'';
    if($('klAsrModel')) $('klAsrModel').value=KL.asr.model||'whisper-1';
    if($('klAsrSave')) $('klAsrSave').onclick=function(){
      KL.asr.endpoint=($('klAsrEndpoint')&&$('klAsrEndpoint').value||'').trim();
      KL.asr.key=($('klAsrKey')&&$('klAsrKey').value||'').trim();
      KL.asr.model=($('klAsrModel')&&$('klAsrModel').value||'').trim();
      klSave(); klToast('识别设置已保存');
    };
    if($('klAsrPick')) $('klAsrPick').onclick=function(){ $('klAsrFile').click(); };
    if($('klAsrFile')) $('klAsrFile').onchange=function(){ var f=this.files&&this.files[0]; this.value=''; klAsrFile(f); };

    /* 文档/mermaid/版本 */
    klSw('klSwDoc',KL.settings.docOn,function(v){ KL.settings.docOn=v; klSave(); klSyncDocButton(); });
    klSw('klSwMermaid',KL.settings.mermaidOn,function(v){ KL.settings.mermaidOn=v; klSave(); });
    klSw('klSwVer',KL.settings.versions,function(v){ KL.settings.versions=v; klSave(); });

    /* 助手标签 / 正则 */
    if($('klTags')) $('klTags').value=(getActiveCard().tags||[]).join('，');
    if($('klTagsSave')) $('klTagsSave').onclick=function(){
      var c=getActiveCard(); c.tags=String($('klTags').value||'').split(/[,，;；]+/).map(function(s){return s.trim();}).filter(Boolean);
      saveAgentState(); klToast('标签已保存');
    };
    if($('klRegex')) $('klRegex').value=getActiveCard().regexText||'';
    if($('klRegexSave')) $('klRegexSave').onclick=function(){
      var c=getActiveCard(); c.regexText=String($('klRegex').value||''); saveAgentState(); klToast('正则替换已保存');
    };
    if($('klPresetMsgs')) $('klPresetMsgs').value=getActiveCard().presetMsgs||'';
    if($('klPresetSave')) $('klPresetSave').onclick=function(){
      var c=getActiveCard(); c.presetMsgs=String($('klPresetMsgs').value||''); saveAgentState(); klToast('预设消息已保存');
    };

    /* 记忆 */
    klSw('klSwMem',KL.settings.memAuto,function(v){ KL.settings.memAuto=v; klSave(); });
    if($('klMemEvery')) $('klMemEvery').value=KL.settings.memEvery||8;
    if($('klMemEvery')) $('klMemEvery').onchange=function(){ KL.settings.memEvery=Math.max(1,+this.value||8); klSave(); };
    if($('klMemExtract')) $('klMemExtract').onclick=function(){
      var lastU=null,lastA=null;
      for(var i=chatHistory.length-1;i>=0;i--){ if(!lastA&&chatHistory[i].role==='ai') lastA=chatHistory[i].content; else if(lastA&&chatHistory[i].role==='user'){ lastU=chatHistory[i].content; break; } }
      if(!lastA){ klToast('当前没有可整理的对话'); return; }
      klExtractMemory(lastU,lastA).then(function(){ klToast('记忆整理完成'); });
    };
    if($('klMemRefresh')) $('klMemRefresh').onclick=klRenderMemoryFacts;

    /* 技能 */
    if($('klSkillAdd')) $('klSkillAdd').onclick=function(){
      var txt=String($('klSkillPaste')&&$('klSkillPaste').value||'').trim();
      if(!txt){ klToast('请粘贴 SKILL.md 内容'); return; }
      var name=(txt.match(/^#\s+(.+)$/m)||[])[1]||'技能';
      klAddSkill(name,txt); $('klSkillPaste').value='';
    };
    if($('klSkillImport')) $('klSkillImport').onclick=function(){ $('klSkillFile').click(); };
    if($('klSkillFile')) $('klSkillFile').onchange=function(){ var f=this.files&&this.files[0]; this.value=''; klImportSkill(f); };

    /* 会话 */
    if($('klConvRefresh')) $('klConvRefresh').onclick=function(){ klRenderConvs(); };
    if($('klConvSearchBtn')) $('klConvSearchBtn').onclick=function(){ klRenderConvs($('klConvSearch').value); };
    if($('klConvSearch')) $('klConvSearch').onkeydown=function(e){ if(e.key==='Enter') klRenderConvs(this.value); };
    if($('klConvCompress')) $('klConvCompress').onclick=async function(){
      try{
        await compressAiHistory();
        var sys=aiHistory.filter(function(m){return m.role==='system';})[0];
        if(sys&&sys.content){ memory.custom=(memory.custom?memory.custom+'\n':'')+sys.content; saveAgentState(); }
        newChat(true); klToast('已压缩并开启新对话');
      }catch(e){ klToast('压缩失败：'+((e&&e.message)||e)); }
    };

    /* 备份 */
    if($('klDavUrl')) $('klDavUrl').value=KL.backup.webdav||'';
    if($('klDavUser')) $('klDavUser').value=KL.backup.user||'';
    if($('klDavPass')) $('klDavPass').value=KL.backup.pass||'';
    if($('klDavSave')) $('klDavSave').onclick=function(){
      KL.backup.webdav=$('klDavUrl').value.trim(); KL.backup.user=$('klDavUser').value.trim(); KL.backup.pass=$('klDavPass').value; klSave(); klToast('WebDAV 已保存');
    };
    if($('klDavUp')) $('klDavUp').onclick=klWebdavUpload;
    if($('klDavDown')) $('klDavDown').onclick=klWebdavDownload;
    if($('klS3Endpoint')) $('klS3Endpoint').value=KL.backup.s3||'';
    if($('klS3Region')) $('klS3Region').value=KL.backup.region||'us-east-1';
    if($('klS3Bucket')) $('klS3Bucket').value=KL.backup.bucket||'';
    if($('klS3Ak')) $('klS3Ak').value=KL.backup.ak||'';
    if($('klS3Sk')) $('klS3Sk').value=KL.backup.sk||'';
    if($('klS3Prefix')) $('klS3Prefix').value=KL.backup.prefix||'silong/';
    if($('klS3Save')) $('klS3Save').onclick=function(){
      KL.backup.s3=$('klS3Endpoint').value.trim(); KL.backup.region=$('klS3Region').value.trim()||'us-east-1';
      KL.backup.bucket=$('klS3Bucket').value.trim(); KL.backup.ak=$('klS3Ak').value.trim(); KL.backup.sk=$('klS3Sk').value.trim();
      KL.backup.prefix=$('klS3Prefix').value.trim()||'silong/'; klSave(); klToast('S3 已保存');
    };
    if($('klS3Up')) $('klS3Up').onclick=klS3Upload;
    if($('klS3Down')) $('klS3Down').onclick=klS3Download;
    if($('klLocalSnap')) $('klLocalSnap').onclick=klLocalSnap;
    if($('klLocalList')) $('klLocalList').onclick=klRenderSnaps;
    if($('klImportPick')) $('klImportPick').onclick=function(){ $('klImportFile').click(); };
    if($('klImportFile')) $('klImportFile').onchange=function(){ var f=this.files&&this.files[0]; this.value=''; klImportThirdParty(f); };

    /* 诊断 */
    klSw('klSwDiag',KL.settings.diagOn,function(v){ KL.settings.diagOn=v; klSave(); });
    if($('klDiagRefresh')) $('klDiagRefresh').onclick=klRenderDiag;
    if($('klDiagClear')) $('klDiagClear').onclick=function(){ KL.diag.logs=[]; klSave(); klRenderDiag(); };
    if($('klDiagExport')) $('klDiagExport').onclick=function(){
      var blob=new Blob([JSON.stringify(KL.diag,null,2)],{type:'application/json'});
      var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='kelivo-diagnostics-'+Date.now()+'.json'; a.click();
    };

    /* 设备 */
    if($('klDevClip')) $('klDevClip').onclick=function(){ klDevice('clipboard_get',{}); };
    if($('klDevClipSet')) $('klDevClipSet').onclick=function(){ var v=prompt('要写入剪贴板的文字'); if(v!=null) klDevice('clipboard_set',{text:v}); };
    if($('klDevBattery')) $('klDevBattery').onclick=function(){ klDevice('battery',{}); };
    if($('klDevLoc')) $('klDevLoc').onclick=function(){ klDevice('location',{}); };
    if($('klDevUsage')) $('klDevUsage').onclick=function(){ klDevice('usage_today',{}); };
    if($('klDevUsageSet')) $('klDevUsageSet').onclick=function(){ klDevice('usage_settings',{}); };

    /* 定时任务 */
    if($('klTaskAdd')) $('klTaskAdd').onclick=klAddTask;

    /* MCP */
    klSw('klSwMcp',KL.settings.mcpApprove,function(v){ KL.settings.mcpApprove=v; klSave(); });
    if($('klMcpImport')) $('klMcpImport').onclick=klImportMcp;

    /* 独立翻译 */
    if($('klTransBtn')) $('klTransBtn').onclick=async function(){
      var src=String(($('klTransInput')&&$('klTransInput').value)||'').trim();
      if(!src){ klToast('请先输入内容'); return; }
      var lang=($('klTransLang')&&$('klTransLang').value)||'简体中文';
      var out=$('klTransOut'); if(out) out.textContent='翻译中…';
      try{
        var r=await quickComplete('请把下面内容翻译成'+lang+'，只输出译文，不要解释：\n'+src, Math.min(4000, 300+src.length*2));
        if(out) out.textContent=r||'翻译失败';
      }catch(e){ if(out) out.textContent='翻译失败：'+((e&&e.message)||e); }
    };
    if($('klTransCopy')) $('klTransCopy').onclick=function(){ var t=$('klTransOut')?$('klTransOut').textContent:''; if(t){ copyText(t); } };

    /* 初始化列表 */
    klFillProviderForm('openai');
    klRenderProviders(); klRenderMemoryFacts(); klRenderSkills(); klRenderConvs(); klRenderSnaps(); klRenderTasks(); klRenderDiag();
    klSyncDocButton();
    klReceiveShare();
    klRebindSpecial();
    setTimeout(klRebindSpecial, 1500);
  }catch(e){ try{ console.warn('Kelivo bind', e); }catch(_){} }
}
function klRebindSpecial(){
  try{
    if($('backupExport')) $('backupExport').onclick=window.exportAllData;
    if($('backupImport')) $('backupImport').onclick=function(){ var f=$('backupImportFile'); if(f) f.click(); };
    if($('backupImportFile')) $('backupImportFile').onchange=function(){ var f=this.files&&this.files[0]; this.value=''; if(f) window.importAllData(f); };
    if($('mcpCall')) $('mcpCall').onclick=function(){ if(window.mcpCallTool) window.mcpCallTool(); };
  }catch(e){}
}
function klSw(id,val,cb){
  var el2=$(id); if(!el2) return;
  el2.classList.toggle('on',!!val);
  el2.onclick=function(){ var v=!this.classList.contains('on'); this.classList.toggle('on',v); try{cb(v);}catch(e){} };
}
function klSyncDocButton(){
  var box=document.querySelector('.input-box'); if(!box) return;
  var b=$('klDocBtn');
  if(KL.settings.docOn){
    if(!b){
      b=document.createElement('button'); b.className='attach-btn'; b.id='klDocBtn'; b.title='附加文档（PDF/Word/Excel/PPT/文本）';
      b.innerHTML='<i class="fa-solid fa-paperclip"></i>';
      var tb=$('toolBtn'); box.insertBefore(b,tb||$('sendBtn'));
      b.onclick=function(){ $('klDocFile').click(); };
    }
  }else if(b){ b.remove(); }
  if(!$('klDocFile')){
    var f=document.createElement('input'); f.type='file'; f.id='klDocFile'; f.style.display='none';
    f.accept='.pdf,.docx,.pptx,.xlsx,.txt,.md,.csv,.json,.js,.html,.css,.py,.java,.xml,.yaml,.yml';
    f.onchange=function(){ var x=this.files&&this.files[0]; this.value=''; klHandleDoc(x); };
    document.querySelector('.input-area').appendChild(f);
  }
}
function klReceiveShare(){
  try{
    if(!window.Android || !Android.getPendingShare) return;
    var txt=Android.getPendingShare();
    if(txt && txt.trim()){
      var inp=$('msgInput'); if(inp){ inp.value=txt; autoGrow&&autoGrow(); klToast('已接收分享内容'); }
      if(window.Android.clearPendingShare) Android.clearPendingShare();
    }
  }catch(e){}
}
window.kelivoReceiveShare=function(txt){
  try{ var inp=$('msgInput'); if(inp){ inp.value=String(txt||''); autoGrow&&autoGrow(); } }catch(e){}
};
/* 主页搜索记录 → 资源管家检索记录 */
window.kelivoAddMainSearch=function(k,m,t){
  try{
    k=String(k||'').trim(); if(!k) return;
    if(!Array.isArray(histData.search)) histData.search=[];
    var exists=histData.search.some(function(x){ return x && x.t===k && String(x.mode||'')===String(m||'web'); });
    if(!exists){
      histData.search.unshift({t:k, ts:t||Date.now(), sid:'', sr:'', src:'main', mode:String(m||'web')});
      if(histData.search.length>100) histData.search=histData.search.slice(0,100);
      saveJSON(STORAGE.hist, histData);
    }
    try{ if($('histPanel') && $('histPanel').classList.contains('open')) renderHist('search'); }catch(e){}
  }catch(e){}
};
function klImportMainSearchLog(){
  try{
    var log=JSON.parse(localStorage.getItem('sl_main_search_log_v1')||'[]');
    if(!Array.isArray(log) || !log.length) return;
    log.slice().reverse().forEach(function(x){
      if(x && x.k) window.kelivoAddMainSearch(x.k, x.m||'web', x.t||Date.now());
    });
    localStorage.removeItem('sl_main_search_log_v1');
  }catch(e){}
}
/* 主动通知点击：直接进入聊天并显示自动发送的消息 */
function klOpenProactiveChat(text){
  var t=String(text||'').trim();
  if(!t) return;
  try{
    var last=null;
    for(var i=chatHistory.length-1;i>=0;i--){ if(chatHistory[i].role==='ai'){ last=chatHistory[i]; break; } }
    if(last && String(last.content||'')===t){ /* 已经在界面里，不重复添加 */ }
    else{
      var ts=fullTs();
      var hist={role:'ai',content:t,time:Date.now(),tsLabel:ts,level:2,options:[],segments:[{ts:ts,text:t}],status:null};
      addAIMsg(t,1,[],false,false,hist);
      chatHistory.push(hist);
      saveCurrentSession();
    }
    try{ if($('sidePanel')) $('sidePanel').classList.remove('open'); if($('sideMask')) $('sideMask').classList.remove('on'); }catch(e){}
    try{ if($('chatBox')){ var b=$('chatBox'); b.style.scrollBehavior='auto'; b.scrollTop=b.scrollHeight; setTimeout(function(){ b.scrollTop=b.scrollHeight; },60); } }catch(e){}
    try{ if($('msgInput')){ $('msgInput').focus(); } }catch(e){}
    try{ if(window.Android && Android.clearPendingChat) Android.clearPendingChat(); }catch(e){}
  }catch(e){}
}
window.kelivoOpenProactive=function(text){ klOpenProactiveChat(text); };
function klReceiveProactive(){
  try{
    if(!window.Android || !Android.getPendingChat) return;
    var t=Android.getPendingChat();
    if(t && String(t).trim()) klOpenProactiveChat(t);
  }catch(e){}
}
setInterval(klReceiveProactive, 2000);
setTimeout(klReceiveProactive, 300);

/* ---------------- 聊天流程钩子 ---------------- */
var klPendingVersions=null;
if(typeof window.regenerateWhole==='function'){
  var __klOrigRegen=window.regenerateWhole;
  window.regenerateWhole=function(h){
    try{ if(h&&Array.isArray(h.versions)) klPendingVersions=JSON.parse(JSON.stringify(h.versions)); }catch(e){ klPendingVersions=null; }
    return __klOrigRegen.apply(this,arguments);
  };
}
if(typeof window.generateChatReply==='function'){
  var __klOrigGen=window.generateChatReply;
  window.generateChatReply=async function(text,refImage){
    var r=await __klOrigGen.apply(this,arguments);
    try{
      var last=null;
      for(var i=chatHistory.length-1;i>=0;i--){ if(chatHistory[i].role==='ai'){ last=chatHistory[i]; break; } }
      if(last){
        if(klPendingVersions && klPendingVersions.length){
          if(klPendingVersions[klPendingVersions.length-1].text!==last.content) klPendingVersions.push({ts:last.tsLabel,text:last.content,time:last.time});
          last.versions=klPendingVersions; klPendingVersions=null;
        }else klEnsureVersions(last);
        /* 正则替换 */
        if(KL.settings.regexOn && getActiveCard().regexText){
          var nt=klApplyRegex(last.content);
          if(nt!==last.content){
            last.content=nt; last.segments=[{ts:last.tsLabel,text:nt}];
            var b=findBubbleOf(last); if(b){ var c=b.querySelector('.msg-content'); if(c) renderSegsInto(c,last,false); }
          }
        }
        klAddVersionControls(findBubbleOf(last),last);
        saveCurrentSession();
        klHandleAsk(last);
        klHandleMcp(last);
        klHandleWs(last);
        /* 自动记忆 */
        if(KL.settings.memAuto && (+memory.turn||0)>0 && ((+memory.turn||0)%Math.max(1,KL.settings.memEvery||8)===0)){
          setTimeout(function(){ klExtractMemory(text,last.content); },300);
        }
      }
    }catch(e){}
    return r;
  };
}
/* 发送时把文档内容带进消息 */
if(typeof window.sendMsg==='function'){
  var __klOrigSend=window.sendMsg;
  window.sendMsg=function(){
    try{
      if(klDocState.text){
        var inp=$('msgInput');
        if(inp){
          var v=String(inp.value||'').trim();
          inp.value='【文档：'+klDocState.name+'】\n'+klDocState.text+'\n\n'+(v||'请阅读并总结这份文档。');
          if(typeof autoGrow==='function') autoGrow();
        }
      }else if(klDocState.img){
        try{ mmRefImage=klDocState.img; mmRefName=klDocState.name; syncToolUI&&syncToolUI(); }catch(e){}
      }
    }catch(e){}
    var r=__klOrigSend.apply(this,arguments);
    setTimeout(function(){ klClearDoc(); },400);
    return r;
  };
}

/* ---------------- 初始化 ---------------- */
function klSetupCompactUI(){
  try{
    /* 发送/停止合并为一个按钮 */
    var sb=$('sendBtn'), st=$('stopBtn');
    if(sb && st){
      var syncSend=function(){
        var gen=st.classList.contains('on');
        sb.innerHTML=gen?'<i class="fa-solid fa-square"></i>':'<i class="fa-solid fa-arrow-up"></i>';
        sb.classList.toggle('stop-mode',gen);
        sb.disabled=false;
        sb.title=gen?'停止生成':'发送';
      };
      try{ new MutationObserver(syncSend).observe(st,{attributes:true,attributeFilter:['class','style']}); }catch(e){}
      setInterval(syncSend,250);
      sb.onclick=function(){
        if(st.classList.contains('on')){
          try{ if(abortCtrl) abortCtrl.abort(); }catch(e){}
        }else{
          try{ sendMsg(); }catch(e){}
        }
      };
      syncSend();
    }
    /* 回到底部：改为瞬时定位，避免平滑滚动卡住 */
    var __klOrigScroll=window.scrollBottom;
    window.scrollBottom=function(force){
      if(!force) return __klOrigScroll.apply(this,arguments);
      var b=$('chatBox'); if(!b) return;
      var old=b.style.scrollBehavior;
      b.style.scrollBehavior='auto';
      b.scrollTop=b.scrollHeight;
      requestAnimationFrame(function(){ b.scrollTop=b.scrollHeight; });
      setTimeout(function(){ b.scrollTop=b.scrollHeight; b.style.scrollBehavior=old||''; },80);
    };
    var bottomBtn=$('scrollBottomBtn');
    if(bottomBtn){
      bottomBtn.onclick=function(){
        var b=$('chatBox'); if(!b) return;
        var old=b.style.scrollBehavior;
        b.style.scrollBehavior='auto';
        b.scrollTop=b.scrollHeight;
        requestAnimationFrame(function(){ b.scrollTop=b.scrollHeight; });
        setTimeout(function(){ b.scrollTop=b.scrollHeight; b.style.scrollBehavior=old||''; },80);
      };
    }
    /* 设置项重新归类：供应商并入「API 与模型」；隐藏重复的 Key 模式和快捷短语设置 */
    var apiPane=document.querySelector('[data-pane="api"]');
    var extPane=document.querySelector('[data-pane="extend"]');
    var klPane=document.getElementById('klPane');
    if(apiPane && klPane){
      var prov=klPane.querySelector('details');
      if(prov && prov.parentNode===klPane){ apiPane.insertBefore(prov, apiPane.firstChild); }
    }
    if(apiPane && extPane){
      var adv=null;
      Array.prototype.forEach.call(extPane.querySelectorAll('.side-section'),function(sec){
        if(!adv && String(sec.textContent||'').indexOf('提供商高级设置')>=0) adv=sec;
      });
      if(adv && adv.parentNode===extPane) apiPane.appendChild(adv);
    }
    var km=$('keyMode');
    if(km){ var kmGroup=km.closest ? km.closest('.form-group') : null; if(kmGroup) kmGroup.style.display='none'; }
    if(extPane){
      Array.prototype.forEach.call(extPane.querySelectorAll('.side-section'),function(sec){
        if(String(sec.textContent||'').indexOf('快捷短语')>=0) sec.remove();
      });
    }
    /* 去掉输入栏朗读按钮的占位（CSS 已隐藏，确保不占布局） */
    var tts=$('ttsBtn'); if(tts) tts.style.display='none';
    /* 彻底移除聊天小人、快捷短语栏，避免继续加载视频/占用布局 */
    var cc=$('chatCharWrap'); if(cc && cc.parentNode) cc.remove();
    var qp=$('quickPhraseBar'); if(qp && qp.parentNode) qp.remove();
  }catch(e){}
}
function klInit(){
  try{
    klBuildUI();
    klSetupCompactUI();
    klBind();
    setTimeout(klImportMainSearchLog, 500);
    /* 让新增的 Kelivo 页签在打开设置时可见 */
    var oldOpen=window.openSettings;
    if(typeof oldOpen==='function'){
      window.openSettings=function(){ var r=oldOpen.apply(this,arguments); try{ klBind(); }catch(e){} return r; };
    }
  }catch(e){ try{ console.warn('Kelivo init',e); }catch(_){} }
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',klInit); else klInit();

window.KELIVO = KL;
window.klSearch = klSearch;
window.klOpenKelivoPane = function(){
  try{ openSettings(); switchTab('kelivo'); }catch(e){}
};
})();
