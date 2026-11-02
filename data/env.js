/* 巳泷资源库 · 运行环境与解码工具（v9.9.0）
   APP 内运行 = localhost / 127.0.0.1；网页部署 = 其他域名。
   所有链接/密钥都放在 links-app.js / links-web.js / api-app.js / api-web.js 中，页面只引用解码。 */
(function () {
  var h = String(location.hostname || '').toLowerCase();
  window.SL_ENV = (typeof window.Android !== 'undefined' || h === 'localhost' || h === '127.0.0.1' || h === '') ? 'app' : 'web';
  window.SL_D = function (s) {
    if (!s) return '';
    try { return decodeURIComponent(escape(atob(s))); }
    catch (e) { try { return atob(s); } catch (e2) { return String(s); } }
  };
  window.SL_E = function (s) { try { return btoa(unescape(encodeURIComponent(String(s)))); } catch (e) { return String(s); } };
})();
