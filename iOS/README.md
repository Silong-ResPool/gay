# 巳泷资源库 iOS 壳

这是与 Web / Android / PC / Harmony 共用同一套线上界面的 iOS WKWebView 壳。

- 首页加载 `https://silong-respool.github.io/gay/`，因此视觉、导航和 Web 功能与网页版保持一致。
- 支持安全区、深色状态栏、外链、`target=_blank`、JS alert/confirm/prompt、无网络重试。
- App 图标、Launch Screen 均使用白色蛇形 Logo。

## 构建

本地需要 macOS + Xcode + XcodeGen：

```bash
cd iOS
xcodegen generate
xcodebuild -project SilongResource.xcodeproj -scheme SilongResource \
  -configuration Release -sdk iphoneos -archivePath build/SilongResource.xcarchive \
  archive CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO CODE_SIGN_IDENTITY=""
mkdir -p build/Payload
cp -R build/SilongResource.xcarchive/Products/Applications/SilongResource.app build/Payload/
cd build && zip -qry SilongResource-unsigned.ipa Payload
```

未签名 IPA 可通过 AltStore / Sideloadly 自签安装；正式上架需要 Apple Developer 证书与描述文件。
