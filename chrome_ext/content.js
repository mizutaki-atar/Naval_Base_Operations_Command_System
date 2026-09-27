/**
 * content.js (ISOLATED World)
 * hook.jsから送られてきたデータを受け取り、特権を持つバックグラウンドへ転送します。
 */

window.addEventListener("message", function(event) {
    // 自分自身からのメッセージのみ受け付ける
    if (event.source !== window) return;
    
    if (event.data && event.data.type === "KCS_SYNC_DATA") {
        // 拡張機能のバックグラウンドへデータを送信
        chrome.runtime.sendMessage({
            action: "sync",
            url: event.data.url,
            payload: event.data.payload
        });
    }
});

// 作戦司令部システム（Webアプリ）側のドメインの場合、自動でデータを流し込む
const isWebApp = location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.hostname.includes("github.io");
if (isWebApp) {
    function injectData() {
        chrome.storage.local.get(["kcs_port", "kcs_require_info"], (result) => {
            window.postMessage({ type: "KCS_INJECT_DATA", data: result }, "*");
        });
    }
    
    // ページロード時に一回流し込む
    injectData();
    
    // データが更新されたらリアルタイムに流し込む
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "local") {
            injectData();
        }
    });
}
