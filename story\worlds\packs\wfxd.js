/* 世界：晚风心动 / 都市 BL 言情 · 双男主 */
window.SL_PACK = {
  id: 'wfxd', title: '晚风心动', subtitle: '都市 BL · 雨夜与设计稿',
  kicker: 'EVENING WIND · ROMANCE', theme: 'romance', layout: 'cinema', modeLabel: '都市言情', mode: 'romance',
  accent: '#f472b6', accent2: '#a78bfa', bg: '#0c0710', bg2: '#170d18', cover: 'https://aka.doubaocdn.com/s/86vIuO1odF',
  turnsPerDay: 5, eventChance: 0.32, freePlaceholder: '自由行动：改稿 / 喝咖啡 / 去天台 / 约会 / 和林遇交谈',
  bgm: [
    { id: 'daily', name: '雨夜便利店', mood: 'daily', tempo: 60, scale: 'major', lead: 'piano', pad: 'rain' },
    { id: 'tense', name: '心跳失控', mood: 'tense', tempo: 84, scale: 'minor', lead: 'lowStrings', pad: 'pulse' },
    { id: 'hope', name: '晚风与你', mood: 'hope', tempo: 68, scale: 'major', lead: 'strings', pad: 'warm' },
    { id: 'horror', name: '门外的雨伞', mood: 'horror', tempo: 66, scale: 'minor', lead: 'theremin', pad: 'rain' }
  ],
  stats: [
    { key: 'heart', label: '心动', init: 18, max: 100 },
    { key: 'career', label: '事业', init: 32, max: 100 },
    { key: 'mood', label: '情绪', init: 62, max: 100, danger: true },
    { key: 'courage', label: '勇气', init: 28, max: 100 }
  ],
  relations: [
    { key: 'lin', name: '林遇', role: '建筑事务所合伙人 · 你的甲方', init: 20, max: 100 },
    { key: 'xu', name: '徐野', role: '楼下酒吧老板 · 旧同学', init: 28, max: 100 }
  ],
  items: {
    umbrella: { name: '透明伞', desc: '雨夜第一次见面时他借你的', tags: ['关系', '纪念'], icon: '伞' },
    sketch: { name: '未完成的设计稿', desc: '画的是海边的房子', tags: ['事业', '关键'], icon: '稿' },
    ticket: { name: '天台电影票', desc: '徐野塞给你的，日期是今晚', tags: ['约会'], icon: '票' },
    coffee: { name: '手冲咖啡', desc: '林遇办公室的味道', tags: ['饮品'], icon: '咖' },
    key: { name: '林遇家的备用钥匙', desc: '他说只是方便改稿', tags: ['关系', '关键'], icon: '钥' }
  },
  startItems: [{ id: 'umbrella', qty: 1 }, { id: 'sketch', qty: 1 }],
  skills: [{ id: 'draw', name: '空间手绘' }, { id: 'talk', name: '把天聊死（待升级）' }],
  rules: [
    { text: '林遇不喝加糖的咖啡；他说那会盖掉豆子的坏脾气。', code: 'L-01' },
    { text: '徐野的酒吧每周三歇业，但他会给你留一盏灯。', code: 'L-02' },
    { text: '改稿可以，别改掉自己真正想画的东西。', code: 'L-03' },
    { text: '雨夜里，伞下只能站两个人。', code: 'L-04' },
    { text: '喜欢要说出口；晚风不会替你传话。', code: 'L-05' }
  ],
  places: [
    { name: '雨夜公交站', desc: '故事开始的地方', unlocked: true },
    { name: '林遇事务所', desc: '落地窗与模型室', unlocked: true },
    { name: '徐野酒吧', desc: '楼下那盏暖灯', unlocked: true },
    { name: '天台', desc: '看城市夜景', unlocked: true },
    { name: '海边工地', desc: '未完成的设计', unlocked: false }
  ],
  freeActions: [
    { keys: ['改稿', '画', '设计'], text: '你在事务所改了一版方案，把海边那栋房子重新画成透明的。', eff: { stats: { career: 4 }, rel: { lin: 5 } } },
    { keys: ['咖啡', '喝'], text: '林遇把一杯不加糖的手冲放在你桌边，杯壁上有他的指纹。', eff: { rel: { lin: 6 }, stats: { mood: 3 } } },
    { keys: ['酒吧', '徐野', '喝酒'], text: '徐野在吧台后调了一杯没有名字的酒，杯沿插着一把透明伞。', eff: { rel: { xu: 7 }, stats: { mood: 4 } } },
    { keys: ['天台', '夜景'], text: '你和徐野坐在天台边缘，城市的灯像一片不会落地的星星。', eff: { rel: { xu: 8 }, stats: { heart: 4 } } },
    { keys: ['约会', '告白'], text: '你把手机翻到他的聊天框，打了又删，最后只发了一句“在吗”。', eff: { stats: { courage: 5, heart: 3 } } },
    { keys: ['林遇', '交谈', '甲方'], text: '林遇摘下眼镜揉眉心：“你画的房子，我住过。”', eff: { rel: { lin: 8 }, stats: { heart: 3 } } },
    { keys: ['加班', '工作'], text: '凌晨两点，事务所只剩你和林遇，模型室的灯把两个人的影子拉得很长。', eff: { stats: { career: 3, mood: -3 }, rel: { lin: 5 } } }
  ],
  start: 'busstop',
  scenes: {
    busstop: {
      chapter: '第一幕 · 雨夜', place: '雨夜公交站', title: '伞下只能站两个人',
      text: '晚上十一点，暴雨把公交站牌打得噼啪响。\n你抱着湿透的设计稿等末班车，一把透明伞突然撑到头顶。\n撑伞的男人穿深灰大衣，眼镜上全是雨：“林遇。你的稿子掉了。”\n伞很小，两个人靠得很近。他身上的咖啡味比雨声更清楚。\n马路对面，徐野的酒吧招牌还亮着。',
      choices: [
        { label: '把伞往林遇那边推一点', hint: '林遇 +10，心动 +4', eff: { rel: { lin: 10 }, stats: { heart: 4, mood: 3 }, flags: { metLin: true } }, next: 'studio' },
        { label: '接过伞，先送他去打车', hint: '林遇 +6，勇气 +4', eff: { rel: { lin: 6 }, stats: { courage: 4 }, flags: { metLin: true } }, next: 'studio' },
        { label: '跑进徐野的酒吧避雨', hint: '徐野 +12，心动 +3', eff: { rel: { xu: 12 }, stats: { heart: 3 }, flags: { metXu: true } }, next: 'bar' }
      ]
    },
    studio: {
      chapter: '第二幕 · 事务所', place: '林遇事务所', title: '甲方是他',
      text: '第二天，你抱着改好的稿子进会议室，发现甲方就是林遇。\n他把你的海边房子模型转到背面，指出承重墙画错了。\n“重画。”他说。\n你熬到凌晨，把承重墙改好，却把屋顶画成了一把透明伞。\n林遇看着模型，很久没说话。',
      choices: [
        { label: '问他是不是不喜欢', hint: '林遇 +8，事业 +3', eff: { rel: { lin: 8 }, stats: { career: 3 }, flags: { modelAsk: true } }, next: 'bar' },
        { label: '坚持自己的设计，不改', hint: '事业 +8，林遇 -4', eff: { stats: { career: 8 }, rel: { lin: -4 }, flags: { insist: true } }, next: 'bar' },
        { label: '请他喝一杯咖啡，顺便道歉', hint: '林遇 +10，心动 +4', eff: { rel: { lin: 10 }, stats: { heart: 4, mood: 2 }, flags: { coffee: true } }, next: 'bar' }
      ]
    },
    bar: {
      chapter: '第三幕 · 酒吧', place: '徐野酒吧', title: '旧同学的新酒',
      text: '徐野的酒吧叫“晚风”，只有八张椅子。\n他看见你进门，把一杯酒推过来：“你以前不喝酒。”\n“人会长大。”你说。\n他笑了一下，眼角那颗小痣和高中时一样。\n“林遇是我表哥。”他忽然说，“他这个人，喜欢什么都不会说。”',
      choices: [
        { label: '问徐野，林遇以前是什么样', hint: '徐野 +10，林遇线索', eff: { rel: { xu: 10 }, stats: { heart: 3 }, flags: { linPast: true } }, next: 'rooftop' },
        { label: '告诉徐野，你今晚只想见他', hint: '徐野 +15，心动 +6', eff: { rel: { xu: 15 }, stats: { heart: 6 }, flags: { xuDate: true } }, next: 'rooftop' },
        { label: '喝完就走，回去改稿', hint: '事业 +5，徐野 -4', eff: { stats: { career: 5, mood: -3 }, rel: { xu: -4 } }, next: 'rooftop' }
      ]
    },
    rooftop: {
      chapter: '第四幕 · 天台', place: '天台', title: '城市在脚下睡觉',
      text: '徐野带你上天台，说这里能看见整座城市最晚熄灭的灯。\n他递给你一张电影票：“今晚十二点，天台放映。”\n你看见林遇站在天台另一头，手里拎着两杯咖啡。\n三个人谁都没先开口。\n风把电影票吹得哗哗响。',
      choices: [
        { label: '走向林遇，接过咖啡', hint: '林遇 +15，徐野 -5', eff: { rel: { lin: 15, xu: -5 }, stats: { heart: 5 }, flags: { choseLin: true } }, next: 'site' },
        { label: '坐在徐野旁边，等电影开场', hint: '徐野 +15，林遇 -5', eff: { rel: { xu: 15, lin: -5 }, stats: { heart: 5 }, flags: { choseXu: true } }, next: 'site' },
        { label: '谁都不选，先看城市', hint: '勇气 +2，情绪 +4', eff: { stats: { courage: 2, mood: 4 }, flags: { hesitate: true } }, next: 'site' }
      ]
    },
    site: {
      chapter: '第五幕 · 海边工地', place: '海边工地', title: '那栋房子',
      text: '林遇带你去海边工地。那栋房子还是毛坯，屋顶开着一个大洞，正对海面。\n“我父亲设计的。”他说，“他走后，我一直想把它改完。”\n你终于明白他为什么对透明屋顶那么执着。\n徐野站在工地外，手里提着三份盒饭，没有进来。',
      choices: [
        { label: '和林遇一起把屋顶画完', hint: '林遇 +20，事业 +8', eff: { rel: { lin: 20 }, stats: { career: 8, heart: 5 }, flags: { completeHouse: true } }, next: 'rain' },
        { label: '出去把徐野叫进来，一起吃盒饭', hint: '徐野 +15，三人线', eff: { rel: { xu: 15 }, stats: { mood: 5, heart: 3 }, flags: { three: true } }, next: 'rain' },
        { label: '问林遇，他父亲是怎么走的', hint: '林遇 +12，线索 +1', eff: { rel: { lin: 12 }, stats: { heart: 3 }, flags: { father: true } }, next: 'rain' }
      ]
    },
    rain: {
      chapter: '第六幕 · 又一场雨', place: '雨夜公交站', title: '这一次伞够大',
      text: '方案中标那天，又下了雨。\n你站在同样的公交站，手里拿着同一把透明伞。\n林遇从对面走来，徐野从酒吧门口撑开一把黑伞。\n两个人都停在雨里，等你先动。\n手机屏幕亮着，林遇发来一句：“房子还缺一个住户。”',
      choices: [
        { label: '把透明伞递给林遇，走进他的伞下', hint: '林遇结局', eff: { rel: { lin: 25 }, stats: { heart: 8, courage: 5 }, flags: { endLin: true } }, next: 'finale' },
        { label: '把伞收起来，跑向徐野的黑伞', hint: '徐野结局', eff: { rel: { xu: 25 }, stats: { heart: 8, courage: 5 }, flags: { endXu: true } }, next: 'finale' },
        { label: '谁都不选，自己撑伞走', hint: '独身线', eff: { stats: { career: 6, courage: 6 }, flags: { alone: true } }, next: 'finale' }
      ]
    },
    finale: {
      chapter: '终章 · 晚风', place: '海边工地', title: '房子有了灯',
      text: '雨停时，海边那栋房子的灯亮了。\n林遇站在屋顶，徐野在楼下酒吧门口，两个人都看着你。\n风从海面吹来，带着咸味和咖啡香。\n你终于知道，晚风不会替任何人传话。',
      choices: [
        { label: '走向屋顶，和林遇一起关灯', hint: '林遇终章', eff: { rel: { lin: 20 }, flags: { finalLin: true } }, next: 'end' },
        { label: '走向酒吧，和徐野喝最后一杯', hint: '徐野终章', eff: { rel: { xu: 20 }, flags: { finalXu: true } }, next: 'end' },
        { label: '留在海边，把房子画成自己的', hint: '事业终章', eff: { stats: { career: 10 }, flags: { finalCareer: true } }, next: 'end' }
      ]
    },
    end: { chapter: '终章', place: '晚风', title: '风停了', text: '城市睡着了。', choices: [] }
  },
  events: [
    { id: 'rain_again', title: '又下雨了', if: function (s) { return s.day >= 2; }, text: '雨点敲在事务所的落地窗上，林遇把外套披在你肩上，没说一句话。', eff: { rel: { lin: 4 }, stats: { mood: 2 } } },
    { id: 'xu_light', title: '酒吧的灯还亮着', if: function (s) { return s.rel.xu >= 30; }, text: '凌晨一点，徐野的酒吧还亮着灯。他趴在吧台上睡着，手边放着给你留的酒。', eff: { rel: { xu: 6 }, stats: { heart: 3 } } },
    { id: 'lin_coffee', title: '林遇的手冲', if: function (s) { return s.rel.lin >= 35; }, text: '林遇把咖啡放在你桌边，杯底压着一张便签：“明天别迟到。”', eff: { rel: { lin: 6 }, stats: { career: 2 } } },
    { id: 'exhibit', title: '方案被否了', if: function (s) { return s.stats.career >= 40; }, text: '甲方临时换了方向，你熬了三周的稿子被退回。林遇把自己的模型推到评审面前。', eff: { stats: { career: -4 }, rel: { lin: 8 } } },
    { id: 'old_friend', title: '徐野提起高中', if: function (s) { return s.rel.xu >= 40; }, text: '徐野说高中时你每次路过酒吧，都会在玻璃上看一眼自己的倒影。', eff: { rel: { xu: 6 }, stats: { heart: 3 } } },
    { id: 'mood_low', title: '情绪掉到谷底', if: function (s) { return s.stats.mood <= 30; }, text: '你在模型室坐到天亮，手机里两条未读消息，一条来自林遇，一条来自徐野。', eff: { stats: { mood: -4 }, flags: { lowMood: true } } }
  ],
  endings: [
    { id: 'lin', title: '屋顶的灯', if: function (s) { return s.flags.finalLin; }, text: '你和林遇站在屋顶，把最后一盏灯关掉。\n海面黑下来，他的手还握着你的手。\n“房子缺一个住户。”他说。\n你说：“我知道。”' },
    { id: 'xu', title: '酒吧的第八张椅子', if: function (s) { return s.flags.finalXu; }, text: '徐野把酒吧的第八张椅子搬到吧台里侧，说以后那张椅子只留给你。\n你问他为什么。\n他调了一杯没有名字的酒：“因为我等太久了。”' },
    { id: 'career', title: '自己的房子', if: function (s) { return s.flags.finalCareer; }, text: '你留在海边，把那栋房子改成工作室。\n林遇寄来一张明信片，徐野偶尔带酒来。\n你画了很多房子，每一栋都开着一扇透明的窗。' },
    { id: 'miss', title: '晚风没有传话', if: function (s) { return s.stats.courage <= 10; }, text: '你谁都没选。\n雨停后，林遇去了别的城市，徐野把酒吧转了出去。\n很多年后，你在海边看到一把透明伞，忽然想起那个雨夜。' }
  ],
  nexusLinks: [
    { label: '物品：透明伞与设计稿', kind: '物品', target: 'items' },
    { label: '人物：林遇 / 徐野', kind: '人物档案', target: 'species' },
    { label: '音乐：都市夜雨情绪', kind: '音乐合成', target: 'music' }
  ]
};
