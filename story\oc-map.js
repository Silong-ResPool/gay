/* ==========================================================================
   巳泷文游 · 创世工坊高级世界地图（2026-11-12）
   双主题（羊皮纸 / 深色星图）、自制底图、缩放平移、标注、路线、区域、图层
   ========================================================================== */
(function () {
  'use strict';
  var C = window.SLOC;
  if (!C) return;
  var esc = C.esc, toast = C.toast, uid = C.uid;
  var W = 1000, H = 700;
  var M = { worldId: '', sel: '', mode: '', region: [], layers: { places: true, chars: true, factions: true, events: true, links: true, regions: true } };
  var TYPE = {
    place: { label: '地点', icon: '📍', color: '#a78bfa', ref: 'places' },
    char: { label: '角色', icon: '👤', color: '#a78bfa', ref: 'chars' },
    faction: { label: '势力', icon: '🏛', color: '#fbbf24', ref: 'factions' },
    event: { label: '事件', icon: '⚡', color: '#f87171', ref: 'events' },
    custom: { label: '自定义', icon: '✦', color: '#f472b6', ref: '' }
  };

  var TERRAIN_BUILTIN = [
    { id: 'land', name: '陆地', color: '#7c9a52', rule: '' },
    { id: 'ocean', name: '海洋', color: '#8c2eb3', rule: '跨越大洋需要乘坐轮船；远航耗时更长，可能遇到风暴。' },
    { id: 'desert', name: '沙漠', color: '#d8b45a', rule: '沙漠中水分消耗加快，需要及时补水；可以寻找储水的仙人掌。' },
    { id: 'snow', name: '雪地', color: '#ddd6fe', rule: '雪地与寒冷地带需要厚实衣物或生火取暖，否则极寒值上升，达到 100% 会冻死。' },
    { id: 'forest', name: '森林', color: '#2f7d4f', rule: '' },
    { id: 'rainforest', name: '雨林', color: '#15803d', rule: '雨林中行进缓慢，容易迷路，注意毒虫与瘴气。' },
    { id: 'mountain', name: '山脉', color: '#8b7355', rule: '穿越山脉消耗体力，可能需要绕行或寻找隘口。' },
    { id: 'city', name: '城市', color: '#a78bfa', rule: '' }
  ];
  function terrainBrush(m, id) {
    var arr = m.terrain || [];
    for (var i = 0; i < arr.length; i++) if (String(arr[i].id) === String(id)) return arr[i];
    return arr[0] || null;
  }

  function mapOf(w) {
    if (!w.map) w.map = {};
    if (!Array.isArray(w.map.markers)) w.map.markers = [];
    if (!Array.isArray(w.map.links)) w.map.links = [];
    if (!Array.isArray(w.map.regions)) w.map.regions = [];
    if (!Array.isArray(w.map.terrain)) w.map.terrain = [];
    TERRAIN_BUILTIN.forEach(function (t) {
      var found = false;
      w.map.terrain.forEach(function (x) { if (x.id === t.id) found = true; });
      if (!found) w.map.terrain.push({ id: t.id, name: t.name, color: t.color, rule: t.rule || '', size: 24, strokes: [] });
    });
    if (!w.map.view) w.map.view = { z: 1, x: 0, y: 0 };
    if (!w.map.theme) w.map.theme = 'paper';
    return w.map;
  }
  function markerOf(w, id) { var m = mapOf(w).markers; for (var i = 0; i < m.length; i++) if (String(m[i].id) === String(id)) return m[i]; return null; }
  function regionOf(w, id) { var a = mapOf(w).regions; for (var i = 0; i < a.length; i++) if (String(a[i].id) === String(id)) return a[i]; return null; }

  /* ---------------- 视图 ---------------- */
  function mapView(w) {
    var m = mapOf(w);
    if (M.worldId !== w.id) { M = { worldId: w.id, sel: '', mode: '', region: [], layers: { places: true, chars: true, factions: true, events: true, links: true, regions: true } }; }
    var h = '<div class="bar"><h2>世界地图</h2><span class="cnt">' + m.markers.length + ' 标注 · ' + m.links.length + ' 路线 · ' + m.regions.length + ' 区域</span><div class="sp"></div>' +
      '<button class="btn gho mini" data-a="mapTheme">' + (m.theme === 'star' ? '🌌 星图' : '📜 羊皮纸') + '</button>' +
      '<button class="btn gho mini" data-a="mapBg">上传底图</button>' +
      '<button class="btn pri" data-a="mapAdd">＋ 添加标注</button></div>';
    h += '<div class="map-tools">' +
      '<button class="mt" data-a="mapZoom" data-v="1">＋</button>' +
      '<button class="mt" data-a="mapZoom" data-v="-1">－</button>' +
      '<button class="mt wide" data-a="mapFit">定位全图</button>' +
      '<button class="mt wide" data-a="mapAuto">自动布局</button>' +
      '<button class="mt wide" data-a="mapLink">＋路线</button>' +
      '<button class="mt wide' + (M.mode === 'region' ? ' on' : '') + '" data-a="mapRegion">' + (M.mode === 'region' ? '结束绘制' : '＋区域') + '</button>' +
      '<button class="mt wide' + (M.mode === 'terrain' ? ' on' : '') + '" data-tb-toggle="1">' + (M.mode === 'terrain' ? '结束地形' : '＋地形笔刷') + '</button>' +
      (M.mode === 'region' ? '<button class="mt wide warn" data-a="mapRegionCancel">取消</button>' : '') +
      '</div>';
    h += '<div class="map-layers">' +
      layerBtn('places', '地点') + layerBtn('chars', '角色') + layerBtn('factions', '势力') +
      layerBtn('events', '事件') + layerBtn('links', '路线') + layerBtn('regions', '区域') +
      '</div>';
    h += '<div class="map-wrap ' + (m.theme === 'star' ? 'star' : 'paper') + '" id="mapWrap">' +
      '<svg id="map" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" xmlns:xlink="http://www.w3.org/1999/xlink"></svg>' +
      '<div class="map-tip">拖拽平移 · 滚轮 / 双指缩放 · 拖动标注调整位置 · 点击标注查看</div></div>';
    h += '<div id="mapSel"></div>';
    h += '<div class="map-legend">' + Object.keys(TYPE).map(function (k) {
      return '<span><i style="background:' + TYPE[k].color + '"></i>' + TYPE[k].label + '</span>';
    }).join('') + '<span class="muted">底图：' + (m.bg ? '已上传' : '内置主题') + '</span></div>';
    if (M.mode === 'terrain') h += terrainPanel(m);
    h += '<div class="run-card map-help"><h3>地图操作</h3><p>①「上传底图」可放你自己的世界地图；②「添加标注」把地点、角色、势力、事件钉到地图上；③ 拖动标注调整位置；④「＋路线」连接两个标注；⑤「＋区域」在地图上逐点点击，绘制国家/大陆轮廓；⑥「自动布局」会按地点自动铺开。</p></div>';
    setTimeout(function () { drawMap(w); }, 30);
    setTimeout(function () { bindTerrainBar(w); }, 60);
    return h;
  }
  function layerBtn(k, label) {
    return '<button class="lbtn' + (M.layers[k] ? ' on' : '') + '" data-a="mapLayer" data-k="' + k + '">' + label + '</button>';
  }
  function terrainPanel(m) {
    var cur = M.tb || (m.terrain[0] && m.terrain[0].id) || 'land';
    var b = terrainBrush(m, cur);
    var h = '<div class="run-card" id="tbrushBar"><h3>地形笔刷</h3><div style="display:flex;gap:6px;flex-wrap:wrap">';
    (m.terrain || []).forEach(function (t) {
      h += '<button class="mini" data-tb="' + esc(t.id) + '" style="' + (cur === t.id ? 'background:' + t.color + ';color:#111111;' : '') + 'border:1px solid ' + t.color + '">' + esc(t.name) + '</button>';
    });
    h += '</div><div style="display:flex;gap:8px;align-items:center;margin-top:10px;flex-wrap:wrap">' +
      '<span class="muted" style="font-size:11px">笔刷 ' + (M.tsize || 24) + 'px</span>' +
      '<input id="tSize" type="range" min="8" max="80" value="' + (M.tsize || 24) + '" style="flex:1;min-width:120px">' +
      '<button class="mini" data-tb-erase="1" style="' + (M.terase ? 'background:#b91c1c;color:#ffffff;' : '') + '">' + (M.terase ? '擦除中' : '擦除') + '</button>' +
      '<button class="mini" data-tb-new="1">＋ 自定义笔刷</button>' +
      '<button class="mini danger" data-tb-clear="1">清空</button></div>' +
      '<div class="hint">在地图上按住涂抹即可绘制；「擦除」可擦掉已画区域。规则会进入 AI 叙事：跨海坐船、雪地极寒值、沙漠补水等。</div>';
    if (b) {
      h += '<div class="field" style="margin-top:8px"><label>「' + esc(b.name) + '」区域规则</label>' +
        '<textarea id="tRule" placeholder="例如：进入这片区域会持续灼伤，需要防火装备">' + esc(b.rule || '') + '</textarea>' +
        '<button class="mini" data-tb-rule="1" style="margin-top:6px">保存规则</button></div>';
    }
    return h + '</div>';
  }
  function terrainAdd(w, x, y) {
    var m = mapOf(w);
    var b = terrainBrush(m, M.tb);
    if (!b) return;
    var size = M.tsize || b.size || 24;
    if (M.terase) {
      m.terrain.forEach(function (t) {
        t.strokes = (t.strokes || []).map(function (s) {
          return s.filter(function (p) { return Math.hypot(p.x - x, p.y - y) > size * 0.9; });
        }).filter(function (s) { return s.length > 1; });
      });
      return;
    }
    if (!b.strokes) b.strokes = [];
    var last = b.strokes[b.strokes.length - 1];
    if (last && last.length) {
      var lp = last[last.length - 1];
      if (Math.hypot(lp.x - x, lp.y - y) < 6) return;
      last.push({ x: x, y: y });
    } else {
      b.strokes.push([{ x: x, y: y }]);
    }
    b.size = size;
  }
  function customTerrain(w) {
    var name = prompt('笔刷名称（例如：火山、沼泽、毒雾）'); if (!name) return;
    var rule = prompt('这个区域的规则（例如：进入会持续灼伤，需要防火装备）') || '';
    var m = mapOf(w);
    var t = { id: 't' + Date.now().toString(36), name: name, color: '#f472b6', rule: rule, size: M.tsize || 24, strokes: [] };
    m.terrain.push(t); M.tb = t.id;
    C.touch(); C.renderEditor(); toast('已添加自定义笔刷');
  }
  function bindTerrainBar(w) {
    var bar = document.getElementById('tbrushBar');
    if (bar) {
      bar.querySelectorAll('[data-tb]').forEach(function (bn) {
        bn.onclick = function () { M.tb = bn.getAttribute('data-tb'); C.renderEditor(); };
      });
      var sz = document.getElementById('tSize');
      if (sz) sz.oninput = function () { M.tsize = +sz.value; };
      var er = bar.querySelector('[data-tb-erase]');
      if (er) er.onclick = function () { M.terase = !M.terase; C.renderEditor(); };
      var nw = bar.querySelector('[data-tb-new]');
      if (nw) nw.onclick = function () { customTerrain(w); };
      var cl = bar.querySelector('[data-tb-clear]');
      if (cl) cl.onclick = function () {
        if (confirm('清空所有地形笔迹？')) {
          mapOf(w).terrain.forEach(function (t) { t.strokes = []; });
          C.touch(); drawMap(w);
        }
      };
      var tr = bar.querySelector('[data-tb-rule]');
      if (tr) tr.onclick = function () {
        var ta = document.getElementById('tRule');
        var b = terrainBrush(mapOf(w), M.tb);
        if (b && ta) { b.rule = ta.value; C.touch(); toast('规则已保存'); }
      };
    }
    var tg = document.querySelector('[data-tb-toggle]');
    if (tg) tg.onclick = function () { M.mode = (M.mode === 'terrain' ? '' : 'terrain'); C.renderEditor(); };
  }

  /* ---------------- 绘制 ---------------- */
  function drawMap(w) {
    var svg = document.getElementById('map'); if (!svg) return;
    var m = mapOf(w);
    var v = m.view;
    v.z = Math.max(0.55, Math.min(3.2, v.z || 1));
    var tx = v.x || 0, ty = v.y || 0, z = v.z;
    var html = '';
    html += '<defs>' +
      '<linearGradient id="paperBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8d8b8"/><stop offset=".55" stop-color="#d9c49a"/><stop offset="1" stop-color="#c9ae7d"/></linearGradient>' +
      '<radialGradient id="paperVig" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000000" stop-opacity="0"/><stop offset="1" stop-color="#5b3d19" stop-opacity=".34"/></radialGradient>' +
      '<radialGradient id="starBg" cx=".5" cy=".42" r=".85"><stop offset="0" stop-color="#1c1140"/><stop offset=".55" stop-color="#1c0a24"/><stop offset="1" stop-color="#0b040f"/></radialGradient>' +
      '<radialGradient id="neb1" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#7c3aed" stop-opacity=".42"/><stop offset="1" stop-color="#7c3aed" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="neb2" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#a78bfa" stop-opacity=".28"/><stop offset="1" stop-color="#a78bfa" stop-opacity="0"/></radialGradient>' +
      '<filter id="mgrain"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".07"/></feComponentTransfer><feBlend in="SourceGraphic" mode="multiply"/></filter>' +
      '<filter id="mglow"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '<filter id="mshadow"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity=".45"/></filter>' +
      '</defs>';
    html += '<g transform="translate(' + tx + ',' + ty + ') scale(' + z + ')">';
    // 背景
    if (m.theme === 'star') {
      html += '<rect width="' + W + '" height="' + H + '" fill="url(#starBg)"/>';
      html += '<ellipse cx="300" cy="230" rx="260" ry="180" fill="url(#neb1)"/>';
      html += '<ellipse cx="760" cy="480" rx="240" ry="170" fill="url(#neb2)"/>';
      var seed = 7;
      for (var i = 0; i < 150; i++) {
        seed = (seed * 9301 + 49297) % 233280;
        var sx = (seed / 233280) * W;
        seed = (seed * 9301 + 49297) % 233280;
        var sy = (seed / 233280) * H;
        var sr = 0.6 + (i % 4) * 0.4;
        html += '<circle cx="' + sx.toFixed(1) + '" cy="' + sy.toFixed(1) + '" r="' + sr + '" fill="#ede9fe" opacity="' + (0.25 + (i % 5) * 0.12) + '"/>';
      }
      html += '<g stroke="rgb(173,148,184,.10)" stroke-width="1">';
      for (var gx = 0; gx <= W; gx += 100) html += '<line x1="' + gx + '" y1="0" x2="' + gx + '" y2="' + H + '"/>';
      for (var gy = 0; gy <= H; gy += 100) html += '<line x1="0" y1="' + gy + '" x2="' + W + '" y2="' + gy + '"/>';
      html += '</g>';
    } else {
      html += '<rect width="' + W + '" height="' + H + '" fill="url(#paperBg)"/>';
      html += '<g stroke="rgb(92,62,28,.12)" stroke-width="1">';
      for (var px = 0; px <= W; px += 50) html += '<line x1="' + px + '" y1="0" x2="' + px + '" y2="' + H + '"/>';
      for (var py = 0; py <= H; py += 50) html += '<line x1="0" y1="' + py + '" x2="' + W + '" y2="' + py + '"/>';
      html += '</g>';
      html += '<rect x="22" y="22" width="' + (W - 44) + '" height="' + (H - 44) + '" fill="none" stroke="rgb(92,62,28,.5)" stroke-width="2"/>';
      html += '<rect x="30" y="30" width="' + (W - 60) + '" height="' + (H - 60) + '" fill="none" stroke="rgb(92,62,28,.25)" stroke-width="1"/>';
      // 大陆轮廓 / 等高线
      html += '<g fill="none" stroke="rgb(92,62,28,.22)" stroke-width="1.4">' +
        '<path d="M120 480 C190 380 260 400 330 330 C400 260 470 280 540 210"/>' +
        '<path d="M160 560 C250 470 300 500 390 430 C470 370 560 380 640 300"/>' +
        '<path d="M420 620 C500 560 560 590 650 520 C720 465 790 480 860 420"/>' +
        '<path d="M90 300 C170 250 230 270 300 200 C350 150 420 160 470 120"/>' +
        '</g>';
      // 罗盘
      html += '<g transform="translate(890,112)" opacity=".62">' +
        '<circle r="38" fill="none" stroke="rgb(92,62,28,.55)" stroke-width="1.4"/>' +
        '<circle r="28" fill="none" stroke="rgb(92,62,28,.35)" stroke-width="1"/>' +
        '<path d="M0-30 L7 0 L0 30 L-7 0 Z" fill="rgb(92,62,28,.5)"/>' +
        '<path d="M-30 0 L0 7 L30 0 L0-7 Z" fill="rgb(92,62,28,.26)"/>' +
        '<text y="-44" text-anchor="middle" font-size="11" fill="rgb(70,45,18,.75)">N</text></g>';
      html += '<rect width="' + W + '" height="' + H + '" fill="url(#paperVig)"/>';
      html += '<rect width="' + W + '" height="' + H + '" fill="url(#paperBg)" opacity=".06" filter="url(#mgrain)"/>';
    }
    if (m.bg) {
      html += '<image xlink:href="' + C.imgUrl(m.bg) + '" href="' + C.imgUrl(m.bg) + '" x="0" y="0" width="' + W + '" height="' + H + '" preserveAspectRatio="xMidYMid slice" opacity=".92"/>';
    }
    // 地形笔刷（v9.9.2）
    (m.terrain || []).forEach(function (t) {
      (t.strokes || []).forEach(function (s) {
        if (!s || !s.length) return;
        var pts = s.map(function (p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' ');
        if (s.length === 1) html += '<circle cx="' + s[0].x + '" cy="' + s[0].y + '" r="' + ((t.size || 24) / 2) + '" fill="' + t.color + '" opacity=".55"/>';
        else html += '<polyline points="' + pts + '" fill="none" stroke="' + t.color + '" stroke-width="' + (t.size || 24) + '" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>';
      });
    });
    // 区域
    if (M.layers.regions) {
      (m.regions || []).forEach(function (r) {
        if (!r.points || r.points.length < 3) return;
        var pts = r.points.map(function (p) { return p.x + ',' + p.y; }).join(' ');
        html += '<polygon points="' + pts + '" fill="' + (r.color || 'rgb(167,139,250,.16)') + '" fill-opacity=".18" stroke="' + (r.color || '#a78bfa') + '" stroke-width="1.8" stroke-dasharray="7 5" data-rid="' + esc(r.id) + '"/>';
        var cx = 0, cy = 0;
        r.points.forEach(function (p) { cx += p.x; cy += p.y; });
        cx /= r.points.length; cy /= r.points.length;
        html += '<text x="' + cx + '" y="' + cy + '" text-anchor="middle" font-size="14" font-weight="700" fill="' + (m.theme === 'star' ? '#ede9fe' : '#4a2f10') + '" opacity=".85" pointer-events="none">' + esc(r.name || '区域') + '</text>';
      });
    }
    // 路线
    if (M.layers.links) {
      (m.links || []).forEach(function (ln) {
        var a = markerOf(w, ln.a), b = markerOf(w, ln.b);
        if (!a || !b) return;
        var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - Math.abs(a.x - b.x) * 0.12;
        html += '<path d="M' + a.x + ' ' + a.y + ' Q' + mx + ' ' + my + ' ' + b.x + ' ' + b.y + '" fill="none" stroke="' + (ln.color || '#8b5cf6') + '" stroke-width="2" stroke-dasharray="6 5" opacity=".7"/>';
        if (ln.label) html += '<text x="' + mx + '" y="' + (my - 5) + '" text-anchor="middle" font-size="10" fill="' + (m.theme === 'star' ? '#c4b5fd' : '#5b3d19') + '" opacity=".9">' + esc(ln.label) + '</text>';
      });
    }
    // 标注
    (m.markers || []).forEach(function (mk) {
      if (mk.type === 'place' && !M.layers.places) return;
      if (mk.type === 'char' && !M.layers.chars) return;
      if (mk.type === 'faction' && !M.layers.factions) return;
      if (mk.type === 'event' && !M.layers.events) return;
      var tp = TYPE[mk.type] || TYPE.custom;
      var col = mk.color || tp.color;
      var sel = String(M.sel) === String(mk.id);
      html += '<g class="mk" data-mid="' + esc(mk.id) + '" style="cursor:grab">';
      if (sel) html += '<circle cx="' + mk.x + '" cy="' + mk.y + '" r="24" fill="none" stroke="' + col + '" stroke-width="2" opacity=".9"/>';
      if (mk.type === 'place') {
        html += '<path d="M' + mk.x + ' ' + (mk.y + 12) + ' C' + (mk.x - 13) + ' ' + (mk.y - 2) + ' ' + (mk.x - 11) + ' ' + (mk.y - 18) + ' ' + mk.x + ' ' + (mk.y - 18) + ' C' + (mk.x + 11) + ' ' + (mk.y - 18) + ' ' + (mk.x + 13) + ' ' + (mk.y - 2) + ' ' + mk.x + ' ' + (mk.y + 12) + ' Z" fill="' + col + '" fill-opacity=".92" stroke="#ffffff" stroke-opacity=".65" stroke-width="1.2" filter="url(#mshadow)"/>';
        html += '<circle cx="' + mk.x + '" cy="' + (mk.y - 7) + '" r="5" fill="' + (m.theme === 'star' ? '#1c0a24' : '#5b3d19') + '"/>';
      } else if (mk.type === 'faction') {
        html += '<path d="M' + mk.x + ' ' + (mk.y - 17) + ' L' + (mk.x + 14) + ' ' + (mk.y - 10) + ' L' + (mk.x + 11) + ' ' + (mk.y + 10) + ' L' + mk.x + ' ' + (mk.y + 18) + ' L' + (mk.x - 11) + ' ' + (mk.y + 10) + ' L' + (mk.x - 14) + ' ' + (mk.y - 10) + ' Z" fill="' + col + '" fill-opacity=".9" stroke="#ffffff" stroke-opacity=".6" stroke-width="1.2" filter="url(#mshadow)"/>';
        html += '<text x="' + mk.x + '" y="' + (mk.y + 4) + '" text-anchor="middle" font-size="10" fill="#20140a" font-weight="700">' + esc((mk.icon || '🏛').slice(0, 2)) + '</text>';
      } else if (mk.type === 'event') {
        html += '<path d="M' + mk.x + ' ' + (mk.y - 17) + ' L' + (mk.x + 5) + ' ' + (mk.y - 5) + ' L' + (mk.x + 18) + ' ' + (mk.y - 4) + ' L' + (mk.x + 8) + ' ' + (mk.y + 5) + ' L' + (mk.x + 11) + ' ' + (mk.y + 18) + ' L' + mk.x + ' ' + (mk.y + 10) + ' L' + (mk.x - 11) + ' ' + (mk.y + 18) + ' L' + (mk.x - 8) + ' ' + (mk.y + 5) + ' L' + (mk.x - 18) + ' ' + (mk.y - 4) + ' L' + (mk.x - 5) + ' ' + (mk.y - 5) + ' Z" fill="' + col + '" fill-opacity=".9" stroke="#ffffff" stroke-opacity=".55" stroke-width="1" filter="url(#mshadow)"/>';
      } else {
        html += '<circle cx="' + mk.x + '" cy="' + mk.y + '" r="13" fill="' + col + '" fill-opacity=".9" stroke="#ffffff" stroke-opacity=".6" stroke-width="1.3" filter="url(#mshadow)"/>';
        html += '<text x="' + mk.x + '" y="' + (mk.y + 4) + '" text-anchor="middle" font-size="10" fill="#ffffff" font-weight="700">' + esc(mk.type === 'char' ? String(mk.label || '?').slice(0, 1) : (mk.icon || '✦')) + '</text>';
      }
      var label = String(mk.label || '');
      if (label) {
        var lw = Math.max(30, label.length * 12 + 12);
        html += '<rect x="' + (mk.x - lw / 2) + '" y="' + (mk.y + 20) + '" width="' + lw + '" height="17" rx="8" fill="' + (m.theme === 'star' ? 'rgb(18,6,24,.82)' : 'rgb(255,248,230,.88)') + '" stroke="' + col + '" stroke-opacity=".45" stroke-width="1"/>';
        html += '<text x="' + mk.x + '" y="' + (mk.y + 32) + '" text-anchor="middle" font-size="10.5" fill="' + (m.theme === 'star' ? '#ede9fe' : '#4a2f10') + '" font-weight="600">' + esc(label) + '</text>';
      }
      html += '</g>';
    });
    // 正在绘制的区域
    if (M.mode === 'region' && M.region.length) {
      html += '<polyline points="' + M.region.map(function (p) { return p.x + ',' + p.y; }).join(' ') + '" fill="rgb(167,139,250,.12)" stroke="#a78bfa" stroke-width="2" stroke-dasharray="6 4"/>';
      M.region.forEach(function (p) { html += '<circle cx="' + p.x + '" cy="' + p.y + '" r="4" fill="#a78bfa"/>'; });
    }
    html += '</g>';
    svg.innerHTML = html;
    bindMap(w, svg);
    updateSel(w);
  }

  function updateSel(w) {
    var box = document.getElementById('mapSel'); if (!box) return;
    var m = mapOf(w);
    if (!M.sel) { box.innerHTML = ''; return; }
    var mk = markerOf(w, M.sel);
    if (mk) {
      box.innerHTML = '<div class="map-selbar"><b>已选中：' + esc(mk.label || '标注') + '</b>' +
        '<button class="mini" data-a="mapOpen" data-id="' + esc(mk.id) + '">打开档案</button>' +
        '<button class="mini" data-a="mapEdit" data-id="' + esc(mk.id) + '">编辑标注</button>' +
        '<button class="mini danger" data-a="mapDel" data-id="' + esc(mk.id) + '">删除标注</button></div>';
      return;
    }
    var rg = regionOf(w, M.sel);
    if (rg) {
      box.innerHTML = '<div class="map-selbar"><b>已选中区域：' + esc(rg.name || '区域') + '</b>' +
        '<button class="mini" data-a="mapRegionRename" data-id="' + esc(rg.id) + '">重命名</button>' +
        '<button class="mini danger" data-a="mapRegionDel" data-id="' + esc(rg.id) + '">删除区域</button></div>';
    }
  }

  /* ---------------- 交互 ---------------- */
  function toScene(svg, e) {
    var r = svg.getBoundingClientRect();
    var vx = (e.clientX - r.left) / r.width * W;
    var vy = (e.clientY - r.top) / r.height * H;
    var v = mapOf(C.cur()).view;
    return { x: (vx - (v.x || 0)) / (v.z || 1), y: (vy - (v.y || 0)) / (v.z || 1) };
  }
  function bindMap(w, svg) {
    var m = mapOf(w);
    var drag = null, pan = null, moved = false, pts = {}, pinch = null;
    svg.onpointerdown = function (e) {
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (M.mode === 'terrain') {
        var tp0 = toScene(svg, e);
        M.painting = true;
        terrainAdd(w, tp0.x, tp0.y);
        drawMap(w);
        try { svg.setPointerCapture(e.pointerId); } catch (x) {}
        return;
      }
      var keys = Object.keys(pts);
      if (keys.length >= 2) {
        var p1 = pts[keys[0]], p2 = pts[keys[1]];
        pinch = { d: Math.max(1, Math.hypot(p1.x - p2.x, p1.y - p2.y)), z: m.view.z || 1,
          x: m.view.x || 0, y: m.view.y || 0, mx: (p1.x + p2.x) / 2, my: (p1.y + p2.y) / 2 };
        drag = null; pan = null;
        try { svg.setPointerCapture(e.pointerId); } catch (x) {}
        return;
      }
      var t = e.target.closest ? e.target.closest('[data-mid]') : null;
      moved = false;
      if (t) {
        var id = t.getAttribute('data-mid'), mk = markerOf(w, id);
        var p = toScene(svg, e);
        drag = { id: id, dx: mk.x - p.x, dy: mk.y - p.y, sx: e.clientX, sy: e.clientY };
      } else {
        pan = { sx: e.clientX, sy: e.clientY, tx: m.view.x || 0, ty: m.view.y || 0, rect: svg.getBoundingClientRect() };
      }
      try { svg.setPointerCapture(e.pointerId); } catch (x) {}
    };
    svg.onpointermove = function (e) {
      if (pts[e.pointerId]) pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (M.painting) {
        var tp1 = toScene(svg, e);
        terrainAdd(w, tp1.x, tp1.y);
        drawMap(w);
        return;
      }
      if (pinch) {
        var keys = Object.keys(pts);
        if (keys.length >= 2) {
          var p1 = pts[keys[0]], p2 = pts[keys[1]];
          var d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          var rect = svg.getBoundingClientRect();
          var mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
          var vx = (mx - rect.left) / rect.width * W, vy = (my - rect.top) / rect.height * H;
          var nz = Math.max(0.55, Math.min(3.2, pinch.z * (d / pinch.d)));
          m.view.x = vx - (vx - pinch.x) * (nz / pinch.z);
          m.view.y = vy - (vy - pinch.y) * (nz / pinch.z);
          m.view.z = nz;
          moved = true;
          drawMap(w);
          return;
        }
      }
      if (drag) {
        if (Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) > 4) moved = true;
        var p = toScene(svg, e), mk = markerOf(w, drag.id);
        if (mk) {
          mk.x = Math.max(10, Math.min(W - 10, p.x + drag.dx));
          mk.y = Math.max(10, Math.min(H - 10, p.y + drag.dy));
          drawMap(w);
        }
      } else if (pan) {
        var dx = (e.clientX - pan.sx) / pan.rect.width * W;
        var dy = (e.clientY - pan.sy) / pan.rect.height * H;
        if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
        m.view.x = pan.tx + dx; m.view.y = pan.ty + dy;
        drawMap(w);
      }
    };
    svg.onpointerup = function (e) {
      if (pts[e.pointerId]) delete pts[e.pointerId];
      if (M.painting) { M.painting = false; C.touch(); return; }
      if (pinch) {
        if (Object.keys(pts).length < 2) { pinch = null; if (moved) C.touch(); }
        return;
      }
      if (drag) {
        var id = drag.id; drag = null;
        if (moved) C.touch();
        else { M.sel = id; drawMap(w); }
        return;
      }
      if (pan) {
        pan = null;
        if (moved) C.touch();
        else if (M.mode === 'region') {
          var p = toScene(svg, e);
          M.region.push({ x: Math.max(0, Math.min(W, p.x)), y: Math.max(0, Math.min(H, p.y)) });
          drawMap(w);
        }
      }
    };
    svg.onpointercancel = function (e) {
      if (pts[e.pointerId]) delete pts[e.pointerId];
      if (Object.keys(pts).length < 2) pinch = null;
      drag = null; pan = null;
    };
    svg.onwheel = function (e) {
      e.preventDefault();
      var rect = svg.getBoundingClientRect();
      var vx = (e.clientX - rect.left) / rect.width * W;
      var vy = (e.clientY - rect.top) / rect.height * H;
      var old = m.view.z || 1;
      var nz = Math.max(0.55, Math.min(3.2, old * (e.deltaY < 0 ? 1.12 : 0.9)));
      m.view.x = vx - (vx - (m.view.x || 0)) * (nz / old);
      m.view.y = vy - (vy - (m.view.y || 0)) * (nz / old);
      m.view.z = nz;
      drawMap(w);
      clearTimeout(svg.__t); svg.__t = setTimeout(function () { C.touch(); }, 400);
    };
  }

  /* ---------------- 标注 / 路线 / 区域 ---------------- */
  function addForm() {
    var w = C.cur(); if (!w) return;
    var h = '<div class="mask" data-a="closeMask"><div class="sheet"><h3>添加地图标注</h3>' +
      '<div class="row2"><div class="field"><label>标注类型</label><select id="mkType">' +
      Object.keys(TYPE).map(function (k) { return '<option value="' + k + '">' + TYPE[k].label + '</option>'; }).join('') +
      '</select></div><div class="field"><label>关联条目</label><select id="mkRef"></select></div></div>' +
      '<div class="field"><label>显示名称</label><input id="mkLabel" placeholder="地图上显示的名字"></div>' +
      '<div class="row2"><div class="field"><label>图标文字（可选）</label><input id="mkIcon" placeholder="例如：⛩"></div>' +
      '<div class="field"><label>颜色</label><input id="mkColor" type="color" value="#a78bfa"></div></div>' +
      '<div class="hint">没有关联条目时，可以直接填写显示名称，作为自定义标注。</div>' +
      '<div class="acts"><button class="btn gho" data-a="closeMask">取消</button><button class="btn pri" data-a="mapAddSave">保存标注</button></div></div></div>';
    C.modal.innerHTML = h;
    var sel = document.getElementById('mkType');
    function fillRef() {
      var tp = TYPE[sel.value], arr = tp.ref ? (w[tp.ref] || []) : [];
      document.getElementById('mkRef').innerHTML = '<option value="">（不关联）</option>' + arr.map(function (x) {
        return '<option value="' + esc(x.id) + '">' + esc(x.name || x.title || '未命名') + '</option>';
      }).join('');
    }
    sel.onchange = fillRef; fillRef();
  }
  function addSave() {
    var w = C.cur(); if (!w) return;
    var m = mapOf(w);
    var type = document.getElementById('mkType').value;
    var ref = document.getElementById('mkRef').value;
    var label = (document.getElementById('mkLabel').value || '').trim();
    var icon = (document.getElementById('mkIcon').value || '').trim();
    var color = document.getElementById('mkColor').value || TYPE[type].color;
    if (!label && ref) label = C.refName(w, TYPE[type].ref, ref);
    if (!label) { toast('写一个显示名称'); return; }
    var n = m.markers.length;
    var ang = n * 2.4;
    m.markers.push({ id: uid('mk'), type: type, refId: ref, label: label, icon: icon, color: color,
      x: W / 2 + Math.cos(ang) * (90 + n * 14), y: H / 2 + Math.sin(ang) * (70 + n * 10) });
    C.touch(); C.modal.innerHTML = ''; C.renderEditor(); toast('标注已添加');
  }
  function editForm(id) {
    var w = C.cur(); if (!w) return;
    var mk = markerOf(w, id); if (!mk) return;
    var h = '<div class="mask" data-a="closeMask"><div class="sheet"><h3>编辑标注</h3>' +
      '<div class="field"><label>显示名称</label><input id="mkLabel" value="' + esc(mk.label || '') + '"></div>' +
      '<div class="row2"><div class="field"><label>图标文字</label><input id="mkIcon" value="' + esc(mk.icon || '') + '"></div>' +
      '<div class="field"><label>颜色</label><input id="mkColor" type="color" value="' + (mk.color || '#a78bfa') + '"></div></div>' +
      '<div class="acts"><button class="btn gho" data-a="closeMask">取消</button><button class="btn pri" data-a="mapEditSave" data-id="' + esc(id) + '">保存</button></div></div></div>';
    C.modal.innerHTML = h;
  }
  function editSave(id) {
    var w = C.cur(), mk = markerOf(w, id); if (!mk) return;
    mk.label = (document.getElementById('mkLabel').value || '').trim();
    mk.icon = (document.getElementById('mkIcon').value || '').trim();
    mk.color = document.getElementById('mkColor').value || mk.color;
    C.touch(); C.modal.innerHTML = ''; C.renderEditor(); toast('已保存');
  }
  function openRef(id) {
    var w = C.cur(), mk = markerOf(w, id); if (!mk) return;
    if (!mk.refId) { toast('这个标注没有关联条目'); return; }
    var type = mk.type === 'place' ? 'places' : mk.type === 'char' ? 'chars' : mk.type === 'faction' ? 'factions' : mk.type === 'event' ? 'events' : '';
    if (!type) { toast('自定义标注没有档案'); return; }
    C.openForm(type, mk.refId);
  }
  function linkForm() {
    var w = C.cur(), m = mapOf(w);
    if (m.markers.length < 2) { toast('至少需要两个标注'); return; }
    var h = '<div class="mask" data-a="closeMask"><div class="sheet"><h3>添加路线</h3>' +
      '<div class="row2"><div class="field"><label>起点</label><select id="lnA">' +
      m.markers.map(function (x) { return '<option value="' + esc(x.id) + '">' + esc(x.label) + '</option>'; }).join('') + '</select></div>' +
      '<div class="field"><label>终点</label><select id="lnB">' +
      m.markers.map(function (x) { return '<option value="' + esc(x.id) + '">' + esc(x.label) + '</option>'; }).join('') + '</select></div></div>' +
      '<div class="row2"><div class="field"><label>路线名称</label><input id="lnLabel" placeholder="例如：商道 / 航线"></div>' +
      '<div class="field"><label>颜色</label><input id="lnColor" type="color" value="#8b5cf6"></div></div>' +
      '<div class="acts"><button class="btn gho" data-a="closeMask">取消</button><button class="btn pri" data-a="mapLinkSave">保存路线</button></div></div></div>';
    C.modal.innerHTML = h;
  }
  function linkSave() {
    var w = C.cur(), m = mapOf(w);
    var a = document.getElementById('lnA').value, b = document.getElementById('lnB').value;
    if (a === b) { toast('起点和终点不能相同'); return; }
    m.links.push({ id: uid('ln'), a: a, b: b, label: (document.getElementById('lnLabel').value || '').trim(), color: document.getElementById('lnColor').value || '#8b5cf6' });
    C.touch(); C.modal.innerHTML = ''; C.renderEditor(); toast('路线已添加');
  }
  function regionFinish() {
    var w = C.cur(); if (!w) return;
    if (M.region.length < 3) { toast('至少点击 3 个点'); return; }
    var h = '<div class="mask" data-a="closeMask"><div class="sheet"><h3>保存区域</h3>' +
      '<div class="field"><label>区域名称</label><input id="rgName" placeholder="例如：北境 / 赤月大陆"></div>' +
      '<div class="field"><label>颜色</label><input id="rgColor" type="color" value="#a78bfa"></div>' +
      '<div class="acts"><button class="btn gho" data-a="closeMask">取消</button><button class="btn pri" data-a="mapRegionSave">保存区域</button></div></div></div>';
    C.modal.innerHTML = h;
  }
  function regionSave() {
    var w = C.cur(), m = mapOf(w);
    m.regions.push({ id: uid('rg'), name: (document.getElementById('rgName').value || '').trim() || '区域', color: document.getElementById('rgColor').value || '#a78bfa', points: M.region.slice() });
    M.region = []; M.mode = '';
    C.touch(); C.modal.innerHTML = ''; C.renderEditor(); toast('区域已保存');
  }
  function renameRegion(id) {
    var w = C.cur(), r = regionOf(w, id); if (!r) return;
    var n = prompt('区域名称', r.name || '区域'); if (n == null) return;
    r.name = n.trim() || r.name; C.touch(); C.renderEditor();
  }

  /* ---------------- 自动布局 / 主题 / 底图 ---------------- */
  function autoLayout() {
    var w = C.cur(), m = mapOf(w); if (!w) return;
    m.markers = m.markers.filter(function (x) { return x.type !== 'place'; });
    var places = w.places || [];
    places.forEach(function (p, i) {
      var ang = i * 2.4, rad = 90 + i * 26;
      m.markers.push({ id: uid('mk'), type: 'place', refId: p.id, label: p.name || '地点', icon: '', color: '#a78bfa',
        x: Math.max(70, Math.min(W - 70, W / 2 + Math.cos(ang) * rad)), y: Math.max(70, Math.min(H - 70, H / 2 + Math.sin(ang) * rad)) });
    });
    if (!places.length) {
      (w.chars || []).forEach(function (c, i) {
        var ang = i * 2.4, rad = 90 + i * 22;
        m.markers.push({ id: uid('mk'), type: 'char', refId: c.id, label: c.name || '角色', icon: '', color: '#a78bfa',
          x: Math.max(70, Math.min(W - 70, W / 2 + Math.cos(ang) * rad)), y: Math.max(70, Math.min(H - 70, H / 2 + Math.sin(ang) * rad)) });
      });
    }
    C.touch(); C.renderEditor(); toast('已自动布置 ' + (places.length ? places.length + ' 个地点' : '角色'));
  }
  function toggleTheme() {
    var w = C.cur(), m = mapOf(w); if (!w) return;
    m.theme = m.theme === 'star' ? 'paper' : 'star'; C.touch(); C.renderEditor();
  }
  function uploadBg() {
    C.pickImg(function (u) { var w = C.cur(); mapOf(w).bg = u; C.touch(); C.renderEditor(); toast('底图已更新'); }, 1400);
  }
  function zoom(dir) {
    var w = C.cur(), m = mapOf(w); if (!w) return;
    var old = m.view.z || 1;
    var nz = Math.max(0.55, Math.min(3.2, old * (dir > 0 ? 1.18 : 0.85)));
    m.view.x = W / 2 - (W / 2 - (m.view.x || 0)) * (nz / old);
    m.view.y = H / 2 - (H / 2 - (m.view.y || 0)) * (nz / old);
    m.view.z = nz; C.touch(); drawMap(w);
  }
  function fit() {
    var w = C.cur(); if (!w) return;
    mapOf(w).view = { z: 1, x: 0, y: 0 }; C.touch(); drawMap(w);
  }

  /* ---------------- 事件 ---------------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-a]') : null;
    if (!t) return;
    var a = t.getAttribute('data-a'), id = t.getAttribute('data-id');
    if (a === 'mapAdd') { addForm(); return; }
    if (a === 'mapAddSave') { addSave(); return; }
    if (a === 'mapEdit') { editForm(id); return; }
    if (a === 'mapEditSave') { editSave(id); return; }
    if (a === 'mapOpen') { openRef(id); return; }
    if (a === 'mapDel') {
      var w = C.cur(); if (w && confirm('删除这个标注？')) {
        mapOf(w).markers = mapOf(w).markers.filter(function (x) { return String(x.id) !== String(id); });
        mapOf(w).links = mapOf(w).links.filter(function (l) { return String(l.a) !== String(id) && String(l.b) !== String(id); });
        M.sel = ''; C.touch(); C.renderEditor();
      }
      return;
    }
    if (a === 'mapLink') { linkForm(); return; }
    if (a === 'mapLinkSave') { linkSave(); return; }
    if (a === 'mapRegion') {
      var w2 = C.cur(); if (!w2) return;
      if (M.mode === 'region') { regionFinish(); }
      else { M.mode = 'region'; M.region = []; C.renderEditor(); toast('在地图上逐点点击勾勒区域'); }
      return;
    }
    if (a === 'mapRegionCancel') { M.mode = ''; M.region = []; C.renderEditor(); return; }
    if (a === 'mapRegionSave') { regionSave(); return; }
    if (a === 'mapRegionRename') { renameRegion(id); return; }
    if (a === 'mapRegionDel') {
      var w3 = C.cur(); if (w3 && confirm('删除这个区域？')) {
        mapOf(w3).regions = mapOf(w3).regions.filter(function (x) { return String(x.id) !== String(id); });
        M.sel = ''; C.touch(); C.renderEditor();
      }
      return;
    }
    if (a === 'mapTheme') { toggleTheme(); return; }
    if (a === 'mapBg') { uploadBg(); return; }
    if (a === 'mapAuto') { autoLayout(); return; }
    if (a === 'mapZoom') { zoom(parseInt(t.getAttribute('data-v'), 10)); return; }
    if (a === 'mapFit') { fit(); return; }
    if (a === 'mapLayer') {
      var k = t.getAttribute('data-k');
      M.layers[k] = !M.layers[k]; C.renderEditor(); return;
    }
  });

  C.mapView = mapView;
  C.terrainRules = function (w) {
    var m = w && w.map ? w.map : null;
    if (!m || !m.terrain) return '';
    var lines = [];
    m.terrain.forEach(function (t) {
      if (t.rule && (t.strokes || []).length) lines.push('【' + t.name + '区域】' + t.rule);
    });
    return lines.join('\n');
  };
  C.mapDraw = function () { if (C.cur()) drawMap(C.cur()); };
})();
