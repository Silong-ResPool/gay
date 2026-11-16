/* ==========================================================================
   巳泷文游 · 内置世界卡清单（独立引用文件）
   新增世界卡：把 HTML 放进 worlds/ 目录，再在下面追加一条即可。
   字段：
     id       唯一标识
     title    世界名
     subtitle 副标题
     file     世界卡文件（相对 story/ 的路径）
     tags     标签
     desc     简介
     mark     封面大字
     accent   封面渐变色 [起始, 结束]
     adult    是否成人向
   ========================================================================== */
window.SL_WORLDS = [
  {
    id: 'xjlr',
    title: '星际旅人',
    subtitle: 'ARK · TALOS',
    file: 'worlds/xjlr.html',
    tags: ['科幻', '星舰', '探索', '剧情/MUD'],
    desc: '你是 ARK·TALOS 上唯一的旅人。星舰在深空里醒来，船上的每一个人都记得你，而你并不记得他们。探索舱室、维系关系、在理智与欲望之间做出选择。',
    mark: '星',
    accent: ['#22d3ee', '#6366f1'],
    cover: '../assets/ui/world_xjlr.jpg?v=3',
    adult: false
  },
  {
    id: 'zgysl',
    title: '战国·妖神录',
    subtitle: '昭元三年 · 白霜城',
    file: 'worlds/zgysl.html',
    tags: ['古风', '志怪', '权谋', '成人向'],
    desc: '昭元三年，白霜城的风里带着铁锈与香灰。你是忽然被卷进这场局里的人。四卷手存，一章一记；心念、锋刃、气血、器物，以及那些人记住的事，都会跟着你走。',
    mark: '战',
    accent: ['#f59e0b', '#b91c1c'],
    cover: '../assets/ui/world_zgysl.jpg?v=3',
    adult: true
  }
];
