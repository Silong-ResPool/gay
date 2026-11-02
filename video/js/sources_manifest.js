/* ==========================================================================
   影视乐园 · sources_manifest.js
   本地源清单（2026-11-01 当天整理，全部为 PowerShell 实测 200 + JSON 的接口）
   · 作用：每日自动更新时的本地基线；远程清单拉取失败 / 离线 / file:// 时直接用它
   · 格式与 sources_data.js 一致：n = 名称，a = 接口，c = 分类，v = 1 实测可用
   ========================================================================== */
window.VIDEO_SOURCE_MANIFEST = {
  updated: '2026-11-01',
  items: [
    { n: "无尽CC", a: "https://api.wujinapi.cc/api.php/provide/vod", c: "综合影视", v: 1 },
    { n: "红牛资源", a: "https://www.hongniuzy2.com/api.php/provide/vod/", c: "综合影视", v: 1 },
    { n: "飘零影视", a: "https://p2100.net/api.php/provide/vod/", c: "综合影视", v: 1 },
    { n: "非凡影视(新线)", a: "https://ffzy5.tv/api.php/provide/vod", c: "综合影视", v: 1 },
    { n: "速播资源", a: "https://www.subozy.com/api.php/provide/vod/", c: "综合影视", v: 1 },
    { n: "速播自营线", a: "https://subocaiji.com/api.php/provide/vod/from/subyun/at/json", c: "综合影视", v: 1 },
    { n: "金鹰资源", a: "https://jinyingzy.com/api.php/provide/vod/", c: "综合影视", v: 1 },
    { n: "360资源ZZ", a: "https://360zyzz.com/api.php/provide/vod", c: "综合影视", v: 1 },
    { n: "巨量影视", a: "https://api.juliang.live/api/provide/vod", c: "综合影视", v: 1 },
    { n: "鸭鸭资源", a: "https://cj.yayazy.net/api.php/provide/vod/", c: "综合影视", v: 1 },
    { n: "新4K采集", a: "http://cmsyun2.qijiyun.vip/api.php/provide/vod/", c: "综合影视", v: 1 },
    { n: "最大资源(新线)", a: "https://zuida.xyz/api.php/provide/vod/", c: "综合影视", v: 1 },
    { n: "茅台采集", a: "https://mtzy.me/api.php/provide/vod/", c: "综合影视", v: 1 },
    { n: "无尽ME", a: "https://api.wujinapi.me/api.php/provide/vod", c: "综合影视", v: 1 },
    { n: "建安影视", a: "http://154.219.117.232:9981/jacloudapi.php/provide/vod", c: "综合影视", v: 1 },
    { n: "优质采集", a: "https://api.yyzy-tv.vip/inc/apijson.php", c: "综合影视", v: 1 },
    { n: "妞妞影视", a: "https://api.niuniuzy.me/api.php/provide/vod/", c: "综合影视", v: 1 },
    { n: "量子影视(新线)", a: "https://lzizy.net/api.php/provide/vod/", c: "综合影视", v: 1 },
    { n: "闪电资源", a: "https://sdzyapi.com/api.php/provide/vod", c: "综合影视", v: 1 },
    { n: "快车资源", a: "https://caiji.kuaichezy.org/api.php/provide/vod/", c: "综合影视", v: 1 },
    { n: "新浪采集", a: "https://api.xinlangapi.com/xinlangapi.php/provide/vod/", c: "综合影视", v: 1 },
    { n: "金鹰采集", a: "https://jyzyapi.com/provide/vod/", c: "综合影视", v: 1 },
    { n: "猫眼影视", a: "https://api.maoyanapi.top/api.php/provide/vod", c: "综合影视", v: 1 },
    { n: "裤佬资源", a: "https://api.wsyzy.net/api.php/provide/vod", c: "综合影视", v: 1 },
    { n: "艾旦影视", a: "https://www.lovedan.net/api.php/provide/vod/", c: "综合影视", v: 1 },
    { n: "牛牛影视", a: "https://api.niuniuzy.me/api.php/provide/vod/from/nnm3u8/at/json", c: "综合影视", v: 1 },
    { n: "无尽NET", a: "https://api.wujinapi.net/api.php/provide/vod", c: "综合影视", v: 1 },
    { n: "暴风资源(新线)", a: "http://bf.xoxowin86cisyap.com/api.php/provide/vod", c: "综合影视", v: 1 },
    { n: "淘片采集", a: "https://taopianapi.com/cjapi/mc/vod/json.html", c: "综合影视", v: 1 },
    { n: "光速资源2", a: "https://api.guangsuapi.com/api.php/provide/vod/", c: "综合影视", v: 1 }
  ]
};

/* 默认远程清单（公开、每日自动更新的 TVBox 配置，无需任何密钥）
   · jsDelivr 镜像优先（国内网络更稳、带 CORS），raw.githubusercontent 作为备用 */
window.VIDEO_REMOTE_MANIFESTS = [
  'https://cdn.jsdelivr.net/gh/shenzengquan/tvbox-clean@main/tvbox.min.json',
  'https://cdn.jsdelivr.net/gh/h564983541/tvbox-config@main/config.json',
  'https://cdn.jsdelivr.net/gh/evenbsies/tvbox-harvest@main/data/tvbox/index.json',
  'https://cdn.jsdelivr.net/gh/cluntop/tvbox@main/box.json',
  'https://raw.githubusercontent.com/shenzengquan/tvbox-clean/main/tvbox.min.json'
];
