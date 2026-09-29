import UIKit
import WebKit

class ViewController: UIViewController, WKNavigationDelegate {
    var webView: WKWebView!

    override func loadView() {
        let webConfiguration = WKWebViewConfiguration()
        webConfiguration.allowsInlineMediaPlayback = true
        webView = WKWebView(frame: .zero, configuration: webConfiguration)
        webView.navigationDelegate = self
        view = webView
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        // Load bundled offline POS till from local app bundle
        if let htmlPath = Bundle.main.path(forResource: "index", ofType: "html", inDirectory: "www") {
            let htmlUrl = URL(fileURLWithPath: htmlPath)
            webView.loadFileURL(htmlUrl, allowingReadAccessTo: htmlUrl.deletingLastPathComponent())
        }
    }
}
