import SwiftUI
import WebKit

struct ContentView: View {
    @StateObject private var model = WebViewModel()

    var body: some View {
        ZStack(alignment: .top) {
            Color(red: 8.0 / 255.0, green: 7.0 / 255.0, blue: 12.0 / 255.0)
                .ignoresSafeArea()

            WebView(model: model)
                .ignoresSafeArea(.container, edges: .bottom)

            if model.isLoading {
                Rectangle()
                    .fill(Color(red: 143.0 / 255.0, green: 123.0 / 255.0, blue: 255.0 / 255.0))
                    .frame(height: 2)
                    .transition(.opacity)
            }

            if let error = model.error {
                VStack(spacing: 14) {
                    Image(systemName: "wifi.exclamationmark")
                        .font(.system(size: 30, weight: .semibold))
                        .foregroundStyle(Color(red: 237.0 / 255.0, green: 228.0 / 255.0, blue: 214.0 / 255.0))
                    Text("暂时无法连接")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(.white)
                    Text(error)
                        .font(.system(size: 13))
                        .foregroundStyle(Color(red: 201.0 / 255.0, green: 191.0 / 255.0, blue: 214.0 / 255.0))
                        .multilineTextAlignment(.center)
                        .lineLimit(4)
                    Button("重新加载") { model.reload() }
                        .buttonStyle(.borderedProminent)
                        .tint(Color(red: 237.0 / 255.0, green: 228.0 / 255.0, blue: 214.0 / 255.0))
                        .foregroundStyle(Color(red: 8.0 / 255.0, green: 7.0 / 255.0, blue: 12.0 / 255.0))
                }
                .padding(22)
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .stroke(Color.white.opacity(0.12), lineWidth: 1)
                )
                .padding(.horizontal, 28)
                .frame(maxHeight: .infinity)
            }
        }
        .animation(.easeOut(duration: 0.18), value: model.isLoading)
    }
}

struct WebView: UIViewRepresentable {
    @ObservedObject var model: WebViewModel

    func makeUIView(context: Context) -> WKWebView {
        model.webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}
}

final class WebViewModel: NSObject, ObservableObject, WKNavigationDelegate, WKUIDelegate {
    @Published var isLoading = true
    @Published var error: String?

    let webView: WKWebView

    override init() {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        configuration.preferences.javaScriptCanOpenWindowsAutomatically = true
        configuration.defaultWebpagePreferences.allowsContentJavaScript = true

        webView = WKWebView(frame: .zero, configuration: configuration)
        super.init()

        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.allowsBackForwardNavigationGestures = true
        webView.isOpaque = false
        webView.backgroundColor = .clear
        webView.scrollView.backgroundColor = UIColor(red: 8.0 / 255.0, green: 7.0 / 255.0, blue: 12.0 / 255.0, alpha: 1.0)
        webView.scrollView.contentInsetAdjustmentBehavior = .never

        reload()
    }

    func reload() {
        error = nil
        isLoading = true
        var request = URLRequest(
            url: URL(string: "https://silong-respool.github.io/gay/")!,
            cachePolicy: .reloadRevalidatingCacheData,
            timeoutInterval: 45
        )
        request.setValue("SilongResource-iOS/8.5.0", forHTTPHeaderField: "X-Silong-Client")
        webView.load(request)
    }

    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        isLoading = true
        error = nil
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        isLoading = false
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        isLoading = false
        self.error = friendly(error)
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        isLoading = false
        self.error = friendly(error)
    }

    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        reload()
    }

    func webView(
        _ webView: WKWebView,
        decidePolicyFor navigationAction: WKNavigationAction,
        decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
    ) {
        if let scheme = navigationAction.request.url?.scheme?.lowercased(),
           ["mailto", "tel", "sms"].contains(scheme) {
            UIApplication.shared.open(navigationAction.request.url!)
            decisionHandler(.cancel)
            return
        }
        decisionHandler(.allow)
    }

    func webView(
        _ webView: WKWebView,
        createWebViewWith configuration: WKWebViewConfiguration,
        for navigationAction: WKNavigationAction,
        windowFeatures: WKWindowFeatures
    ) -> WKWebView? {
        if navigationAction.targetFrame == nil, let url = navigationAction.request.url {
            webView.load(URLRequest(url: url))
        }
        return nil
    }

    func webView(
        _ webView: WKWebView,
        runJavaScriptAlertPanelWithMessage message: String,
        initiatedByFrame frame: WKFrameInfo,
        completionHandler: @escaping () -> Void
    ) {
        let alert = UIAlertController(title: "巳泷资源库", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "知道了", style: .default) { _ in completionHandler() })
        present(alert)
    }

    func webView(
        _ webView: WKWebView,
        runJavaScriptConfirmPanelWithMessage message: String,
        initiatedByFrame frame: WKFrameInfo,
        completionHandler: @escaping (Bool) -> Void
    ) {
        let alert = UIAlertController(title: "请确认", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "取消", style: .cancel) { _ in completionHandler(false) })
        alert.addAction(UIAlertAction(title: "确定", style: .default) { _ in completionHandler(true) })
        present(alert)
    }

    func webView(
        _ webView: WKWebView,
        runJavaScriptTextInputPanelWithPrompt prompt: String,
        defaultText: String?,
        initiatedByFrame frame: WKFrameInfo,
        completionHandler: @escaping (String?) -> Void
    ) {
        let alert = UIAlertController(title: "请输入", message: prompt, preferredStyle: .alert)
        alert.addTextField { field in field.text = defaultText }
        alert.addAction(UIAlertAction(title: "取消", style: .cancel) { _ in completionHandler(nil) })
        alert.addAction(UIAlertAction(title: "确定", style: .default) { _ in
            completionHandler(alert.textFields?.first?.text)
        })
        present(alert)
    }

    private func friendly(_ error: Error) -> String {
        let ns = error as NSError
        if ns.code == NSURLErrorNotConnectedToInternet {
            return "当前设备没有网络连接，请联网后重试。"
        }
        if ns.code == NSURLErrorTimedOut {
            return "连接超时，请稍后重试。"
        }
        return ns.localizedDescription
    }

    private func present(_ alert: UIAlertController) {
        guard let top = topViewController() else { return }
        top.present(alert, animated: true)
    }

    private func topViewController() -> UIViewController? {
        let scenes = UIApplication.shared.connectedScenes
        let windowScene = scenes.first { $0.activationState == .foregroundActive } as? UIWindowScene
        var top = windowScene?.windows.first(where: { $0.isKeyWindow })?.rootViewController
        while let presented = top?.presentedViewController {
            top = presented
        }
        return top
    }
}
