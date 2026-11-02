/* v9.9.0：APP 端 API 配置（Base64 拆分存放，页面不出现明文） */
if (window.SL_ENV === 'app') {
  window.SL_API = {
    b: 'aHR0cHM6Ly9hcGkuYWduZXMtYWkuY24vdjE=',
    k: ['c2stcmZSbmZ1bG11eHhvUjFzMmxyb0RoWTFOQlZUREdzeXU2dmc5bUk3Uks4d0Vyekcy'],
    m: 'YWduZXMtMy4wLWZsYXNo',
    lim: [20, 5]
  };
  window.SL_API_NV = { b: 'aHR0cHM6Ly9pbnRlZ3JhdGUuYXBpLm52aWRpYS5jb20vdjE=', k: ["bnZhcGktS01WdVZ1VzNkQkt2eWRlQzVmYUNRbVZYV29xcE9acDNmLXBSR3l3a2NUTUF4XzJZRkRJbHh6SGp2cFgtRHNIbg==","bnZhcGktTlpJN1BzWXRpZXUwSEtTV01tZExzY1YtZFBmaUUtSWF0OXVLNXJTZDJZVWJ4cFpKRHV4UFM3QThmLU90dnN6SQ==","bnZhcGktR2dMb0FmeXlpT25EcGQ1UlB5T0tKXzVVMFVpcm80QmFhdkdLX3pxQi1vZ1NTekJPV0NXVDlHMER2Mk1JQjFaUg==","bnZhcGktcjVPVW1DSDNmMkNDeUFJTTVXZmtHbGtvOGpfemx2cTg5THNsOVUzaTAwRXl5M1gxLVYtRnRWX0NmQThGZW9jRA=="], m: 'ZGVlcHNlZWstYWkvZGVlcHNlZWstdjQuMS1mbGFzaA==', lim: [20, 5] };
}