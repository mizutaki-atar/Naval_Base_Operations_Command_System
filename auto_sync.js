/**
 * auto_sync.js
 * 拡張機能（content.js）からのデータ注入（KCS_INJECT_DATA）をリッスンし、
 * アプリのデータを自動更新するモジュール。
 */

class AutoSyncWatcher {
    constructor() {
        this.onDataUpdated = null;
        this.startListening();
    }

    static parseKancolleJson(rawText) {
        if (!rawText || typeof rawText !== 'string') return null;
        try {
            // svdata= プレフィックス、BOM除去
            let cleaned = rawText.replace(/^\uFEFF/, '').trim().replace(/^svdata=/, '');
            if (cleaned.endsWith(';')) cleaned = cleaned.slice(0, -1);
            return JSON.parse(cleaned);
        } catch (e) {
            console.warn("JSONパースエラー:", e);
            return null;
        }
    }

    static categorizeJson(json) {
        if (!json || !json.api_data) return null;
        const d = json.api_data;
        let cats = {};

        // api_port/port は api_ship2 に艦娘リストが入る
        if (d.api_ship) cats.ships = d.api_ship;
        else if (d.api_ship2) cats.ships = d.api_ship2;
        else if (d.api_ship3) cats.ships = d.api_ship3;

        if (d.api_slot_item) {
            cats.items = d.api_slot_item;
        }
        if (d.api_deck_port) {
            cats.decks = d.api_deck_port;
        }
        else if (d.api_deck) {
            cats.decks = d.api_deck; // デッキだけ単独APIのケース
        }

        return Object.keys(cats).length > 0 ? cats : null;
    }

    startListening() {
        console.log("[AutoSync] 拡張機能からのデータ注入を待機しています...");
        
        window.addEventListener("message", (event) => {
            if (event.data && event.data.type === "KCS_INJECT_DATA") {
                const data = event.data.data;
                if (!data) return;

                let totalUpdates = {};
                let hasUpdates = false;

                if (data.kcs_port) {
                    const parsed = AutoSyncWatcher.parseKancolleJson(data.kcs_port);
                    if (parsed) {
                        const cats = AutoSyncWatcher.categorizeJson(parsed);
                        if (cats) {
                            Object.assign(totalUpdates, cats);
                            hasUpdates = true;
                        }
                    }
                }

                if (data.kcs_require_info) {
                    const parsed = AutoSyncWatcher.parseKancolleJson(data.kcs_require_info);
                    if (parsed) {
                        const cats = AutoSyncWatcher.categorizeJson(parsed);
                        if (cats) {
                            Object.assign(totalUpdates, cats);
                            hasUpdates = true;
                        }
                    }
                }

                if (hasUpdates && this.onDataUpdated) {
                    this.onDataUpdated(totalUpdates);
                    this.showDebugLog(`同期完了: ${Object.keys(totalUpdates).join(', ')}`);
                    
                    const statusEl = document.getElementById('sync-status');
                    if (statusEl) {
                        statusEl.textContent = '🟢 拡張機能と同期中';
                        statusEl.style.backgroundColor = '#90ee90'; // light green classic
                    }
                }
            }
        });
    }

    showDebugLog(msg) {
        let dbg = document.getElementById('sync-debug');
        if (!dbg) {
            dbg = document.createElement('div');
            dbg.id = 'sync-debug';
            dbg.style = 'position:fixed; bottom:10px; left:10px; background:rgba(0,0,0,0.8); color:lime; font-family:monospace; padding:10px; z-index:9999; font-size:12px; pointer-events:none; max-height:200px; overflow:hidden;';
            document.body.appendChild(dbg);
        }
        dbg.innerHTML = `<div>[${new Date().toLocaleTimeString()}] ${msg}</div>` + dbg.innerHTML;
    }
}

window.AutoSyncWatcher = AutoSyncWatcher;
