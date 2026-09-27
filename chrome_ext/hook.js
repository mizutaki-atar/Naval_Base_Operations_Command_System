/**
 * hook.js (MAIN World)
 * 艦これの通信を傍受し、同一タブ内の拡張機能領域（content.js）へデータを横流しします。
 */

(function() {
    if (window.__KCS_SYNC_HOOKED__) return;
    window.__KCS_SYNC_HOOKED__ = true;

    const targets = ['api_start2/getData', 'api_port/port', 'api_get_member/require_info', 'api_req_kousyou/', 'api_req_quest/', 'questlist'];

    function sendToBackend(url, text) {
        if (!targets.some(t => url.includes(t))) return;
        // ページ内から直接fetchせず、拡張機能へメッセージを送る
        window.postMessage({
            type: "KCS_SYNC_DATA",
            url: url,
            payload: text
        }, "*");
    }

    // --- XHR Hook ---
    const origOpen = XMLHttpRequest.prototype.open;
    const origSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url) {
        this._kcs_url = url;
        return origOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function() {
        this.addEventListener('load', function() {
            if (this._kcs_url && this._kcs_url.includes('/kcsapi/')) {
                sendToBackend(this._kcs_url, this.responseText);
            }
        });
        return origSend.apply(this, arguments);
    };

    // --- Fetch Hook ---
    window.__origFetch = window.fetch;
    window.fetch = async function(...args) {
        const response = await window.__origFetch.apply(this, args);
        const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
        
        if (url && url.includes('/kcsapi/')) {
            const clone = response.clone();
            clone.text().then(text => {
                sendToBackend(url, text);
            }).catch(e => {});
        }
        return response;
    };
})();
