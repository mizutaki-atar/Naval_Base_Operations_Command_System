/**
 * background.js (Service Worker)
 * 拡張機能の特権コンテキストで動作するため、CORS制限を完全に無視してローカルサーバーへ送信できます。
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "sync") {
        const payload = request.payload;
        if (request.url.includes("api_port/port")) {
            chrome.storage.local.set({ "kcs_port": payload });
        } else if (request.url.includes("api_get_member/require_info")) {
            chrome.storage.local.set({ "kcs_require_info": payload });
        }
        
        // （一応後方互換でローカルサーバーにも投げる場合はここへ。今回は不要なのでコメントアウト）
        /*
        fetch('http://localhost:8000/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: request.url, payload: request.payload })
        }).catch(err => {
            console.debug("Auto-Sync backend is not running.", err);
        });
        */
    }
});
