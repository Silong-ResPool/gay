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
    id: 'xjlr', title: '星际旅人', subtitle: 'ARK · TALOS',
    file: 'worlds/xjlr.html', tags: ['科幻', '星舰', '探索', '剧情/MUD'],
    desc: '你是 ARK·TALOS 上唯一的旅人。星舰在深空里醒来，船上的每一个人都记得你，而你并不记得他们。探索舱室、维系关系、在理智与欲望之间做出选择。',
    mark: '星', accent: ['#22d3ee', '#6366f1'], cover: 'https://aka.doubaocdn.com/s/6nzI8AJsOo', adult: false
  },
  {
    id: 'zgysl', title: '战国·妖神录', subtitle: '昭元三年 · 白霜城',
    file: 'worlds/zgysl.html', tags: ['古风', '志怪', '权谋', '成人向'],
    desc: '昭元三年，白霜城的风里带着铁锈与香灰。你是忽然被卷进这场局里的人。四卷手存，一章一记；心念、锋刃、气血、器物，以及那些人记住的事，都会跟着你走。',
    mark: '战', accent: ['#f59e0b', '#b91c1c'], cover: 'https://aka.doubaocdn.com/s/dH5cGfyFrh', adult: true
  },
  {
    id: 'hygy', title: '槐阴公寓', subtitle: '中式恐怖 · 规则怪谈',
    file: 'worlds/hygy.html', tags: ['中式恐怖', '规则怪谈', '双男主', '解谜'],
    desc: '槐阴公寓的电梯只停单数层。你搬进来的第一晚，管理员递给你一张住户守则，第七条写着：不要回应镜子里的第二个人。',
    mark: '槐', accent: ['#84cc16', '#3f6212'], cover: 'https://aka.doubaocdn.com/s/LudCf3eAc8', adult: false
  },
  {
    id: 'lxqs', title: '零下七十', subtitle: '极寒末世 · 异能刷怪',
    file: 'worlds/lxqs.html', tags: ['末世', '生存', '异能', '刷怪', '双男主'],
    desc: '零下七十度的末世，你和秦焰、陆沉在冰原上觉醒异能。刷冰尸、吸晶核、守避难所，把体温和人性一起撑到日出。',
    mark: '寒', accent: ['#7dd3fc', '#818cf8'], cover: 'https://aka.doubaocdn.com/s/XyAU4AjY6e', adult: false
  },
  {
    id: 'cxgd', title: '潮汐孤岛', subtitle: '海岛生存 · 双男',
    file: 'worlds/cxgd.html', tags: ['海岛', '生存', '建造', '双男主'],
    desc: '潮水把你和两个男人送上同一座孤岛。淡水、鱼叉、庇护所、求救信号，以及谁在夜里替你守火。',
    mark: '潮', accent: ['#2dd4bf', '#fbbf24'], cover: 'https://aka.doubaocdn.com/s/TZZRjv2621', adult: false
  },
  {
    id: 'fljg', title: '法老金棺', subtitle: '埃及探险 · 机关与逃离',
    file: 'worlds/fljg.html', tags: ['埃及', '探险', '机关', '双男主', '惊悚'],
    desc: '沙下的金棺里躺着一位不该醒来的法老。火把、宝藏、诅咒与机关，你们必须在干尸追上之前找到出口。',
    mark: '埃', accent: ['#fbbf24', '#38bdf8'], cover: 'https://aka.doubaocdn.com/s/4xfz6DQ7w9', adult: false
  },
  {
    id: 'yxsx', title: '云墟双修', subtitle: '国风修仙 · 秘境试炼',
    file: 'worlds/yxsx.html', tags: ['修仙', '双修', '炼丹', '妖宠', '双男主'],
    desc: '外门弟子与剑修在云墟相遇。双修、妖宠、炼丹炼器符箓、秘境试炼与雷劫，大道三千，你们只走彼此这一条。',
    mark: '云', accent: ['#d4af37', '#67e8f9'], cover: 'https://aka.doubaocdn.com/s/aVqvXbYJ22', adult: false
  },
  {
    id: 'lbyy', title: '龙堡银月', subtitle: '异世界 · 魔法与恶龙',
    file: 'worlds/lbyy.html', tags: ['异世界', '魔法', '恶龙', '药剂', '双男主'],
    desc: '恶龙每年娶一个王子，今年轮到你。城堡、魔法天赋、药品调配与龙的好感，你要在婚期之前弄清谁才是真正的祭品。',
    mark: '龙', accent: ['#a78bfa', '#5eead4'], cover: 'https://aka.doubaocdn.com/s/nLEKS1XOLc', adult: false
  },
  {
    id: 'cs1983', title: '重生1983', subtitle: '年代经营 · 系统发家',
    file: 'worlds/cs1983.html', tags: ['年代', '经营', '系统', '攻略', '双男主'],
    desc: '你带着记忆回到 1983 年的县城，觉醒致富系统。知青点大哥、囚犯二哥、可爱小弟，三条攻略线，三条发家路。',
    mark: '83', accent: ['#f97316', '#facc15'], cover: 'https://aka.doubaocdn.com/s/oFSUZXUSIe', adult: false
  },
  {
    id: 'fyzd', title: '烽烟照胆', subtitle: '近代军阀 · 枪火与盟誓',
    file: 'worlds/fyzd.html', tags: ['民国', '军阀', '战略', '双男主'],
    desc: '1927 年，镇北军困守孤城。少帅段峥把军令压在棋盘下，戏班班主沈望递来革命军的密信。你要守的是城，还是人。',
    mark: '烽', accent: ['#c08457', '#facc15'], cover: 'https://aka.doubaocdn.com/s/n7nzzQW7o8', adult: false
  },
  {
    id: 'wfxd', title: '晚风心动', subtitle: '都市 BL · 雨夜与设计稿',
    file: 'worlds/wfxd.html', tags: ['都市', 'BL', '言情', '双男主'],
    desc: '雨夜公交站，一把透明伞下只能站两个人。冷面甲方林遇、旧同学徐野，以及那张画着海边房子的设计稿。',
    mark: '晚', accent: ['#f472b6', '#a78bfa'], cover: 'https://aka.doubaocdn.com/s/86vIuO1odF', adult: false
  },
  {
    id: 'zly', title: '罪乐园', subtitle: '地府 · 十八层罪值分配',
    file: 'worlds/zly.html', tags: ['地府', '罪值', '乐园', '双男主', '怪谈'],
    desc: '你被校园霸凌致死，醒来却落进一座颠覆认知的乐园。第一层零罪者享乐，第二层 1—10 罪，一直到第十八层 161—170 罪。',
    mark: '罪', accent: ['#c084fc', '#fbbf24'], cover: 'https://aka.doubaocdn.com/s/VreO7Kt2Lu', adult: false
  },
  {
    id: 'wyzx', title: '午夜自习', subtitle: '校园怪谈 · 第十三节课',
    file: 'worlds/wyzx.html', tags: ['校园', '怪谈', '规则', '双男主'],
    desc: '23:00 后教学楼只许进不许出。查寝老师敲三下，敲四下的是别的东西；第 13 节自习，黑板上写着你的名字。',
    mark: '夜', accent: ['#4ade80', '#60a5fa'], cover: 'https://aka.doubaocdn.com/s/lpJeTrKJwS', adult: false
  },
  {
    id: 'jycs', title: '黑牢翻盘', subtitle: '冤狱 · 监狱争霸',
    file: 'worlds/jycs.html', tags: ['监狱', '冤案', '争霸', '双男主', '成人向'],
    desc: '你被一桩伪造的命案送进黑牢。沈砚是牢里最沉默的刀，陆骁是唯一肯替你翻案的人。从放风场到地下拳台，从账本到减刑名单，你要一点点拿回自己的名字。',
    mark: '牢', accent: ['#f59e0b', '#ef4444'], cover: 'https://aka.doubaocdn.com/s/2XQbGuyVOO', adult: true
  },
  {
    id: 'xycs', title: '校草协议', subtitle: '校园 BL · 假情侣合约',
    file: 'worlds/xycs.html', tags: ['校园', 'BL', '协议恋爱', '双男主', '青春'],
    desc: '为了挡掉家里的相亲，你和全校最张扬的校草签了一份“情侣协议”。江屿要你陪他演到毕业，周野却把每一次对视都演成了真的。',
    mark: '校', accent: ['#a78bfa', '#f472b6'], cover: 'https://aka.doubaocdn.com/s/1znNqWtOVx', adult: false
  },
  {
    id: 'xlm', title: '仙门卧底', subtitle: '修仙权谋 · 炼丹符箓',
    file: 'worlds/xlm.html', tags: ['修仙', '卧底', '宗门', '炼丹', '双男主'],
    desc: '你带着一枚不能示人的妖纹混进仙门。谢无咎教你剑，裴照教你符，虞长老在丹炉前等你露馅。炼丹、炼器、符箓、妖宠，一步走错就是万劫不复。',
    mark: '仙', accent: ['#67e8f9', '#eab308'], cover: 'https://aka.doubaocdn.com/s/k7wpRcAVFX', adult: false
  },
  {
    id: 'hxy', title: '孤海邮轮', subtitle: '风暴 · 无人生还的名单',
    file: 'worlds/hxy.html', tags: ['悬疑', '邮轮', '密室', '双男主', '解谜'],
    desc: '醒来时邮轮已离港三天。乘客名单上第 47 号被划掉三次，保安陆时在监控里看见另一个你。顾言记得你，但名单上你们从不相识。',
    mark: '海', accent: ['#38bdf8', '#c084fc'], cover: 'https://aka.doubaocdn.com/s/FVOQh0yEe9', adult: false
  },
  {
    id: 'ylq', title: '顶流契约', subtitle: '娱乐圈 BL · 影帝与新人',
    file: 'worlds/ylq.html', tags: ['娱乐圈', 'BL', '影帝', '营业', '双男主'],
    desc: '你第一次进组，对手戏是三届影帝祁越。他从不带新人，却在你被雨浇透时伸手擦掉你脸上的水。热搜、合约、红毯与对家江白，每一步都像在演，每一步又都不像。',
    mark: '星', accent: ['#f472b6', '#fbbf24'], cover: 'https://aka.doubaocdn.com/s/1GRGG3WOHt', adult: true
  }
];
