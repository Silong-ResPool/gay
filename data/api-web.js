/*
 * 亲爱的，如果你正在这里翻找 Key——先别急着复制。
 * 这些 Key 是本作品公开共享的池子，每天都有很多人同时使用，你拿到手的只会是限流、排队、突然 403 和超时，
 * 反而没有一个人安心用自己申请的免费 Key 舒服。
 * 真正聪明的做法：打开 https://build.nvidia.com/ 或 https://pollinations.ai/ ，用邮箱注册，
 * 几分钟就能免费拿到属于你自己的 Key，额度独占、速度更快、也不会有陌生人跟你抢。
 * 在「资源管家 → 设置 → API 与模型」里点「前往官网免费申请」就能直达。
 * 偷走这份共享 Key 不会让你更强，只会让你和我一起挤在一条已经塞满的通道里——何必呢，亲爱的。
 * 下面这些字符串只是 Base64 编码，不是加密保险箱；真正值得保护的是你自己的账号与额度。
 */
/* v9.9.0：网页端备用 API 配置（Base64 拆分存放） */
if (window.SL_ENV !== 'app') {
  window.SL_API = {
    b: 'aHR0cHM6Ly9hcGkuYWduZXMtYWkuY24vdjE=',
    k: ['c2stcmZSbmZ1bG11eHhvUjFzMmxyb0RsWTFOQlZUREdzeXU2dmc5bUk3Uks4d0Vyekcy'],
    m: 'YWduZXMtMy4wLWZsYXNo',
    lim: [20, 5]
  };
  window.SL_API_NV = { b: 'aHR0cHM6Ly9pbnRlZ3JhdGUuYXBpLm52aWRpYS5jb20vdjE=', k: ["bnZhcGktS01WdVZ1VzNkQkt2eWRlQzVmYUNRbVZYV29xcE9acDNmLXBSR3l3a2NUTUF4XzJZRkRJbHh6SGp2cFgtRHNIbg==","bnZhcGktTlpJN1BzWXRpZXUwSEtTV01tZExzY1YtZFBmaUUtSWF0OXVLNXJTZDJZVWJ4cFpKRHV4UFM3QThmLU90dnN6SQ==","bnZhcGktR2dMb0FmeXlpT25EcGQ1UlB5T0tKXzVVMFVpcm80QmFhdkdLX3pxQi1vZ1NTekJPV0NXVDlHMER2Mk1JQjFaUg==","bnZhcGktcjVPVW1DSDNmMkNDeUFJTTVXZmtHbGtvOGpfemx2cTg5THNsOVUzaTAwRXl5M1gxLVYtRnRWX0NmQThGZW9jRA=="], m: 'bnZpZGlhL25lbW90cm9uLTMtbmFuby1vbW5pLTMwYi1hM2ItcmVhc29uaW5n', lim: [20, 5] };
}