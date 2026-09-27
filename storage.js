/**
 * storage.js
 * QuotaExceededErrorを回避し、マスタデータやユーザーの大規模データを安全に保存・取得するための
 * IndexedDBラッパークラス
 */

class StorageManager {
    constructor(dbName = 'KancolleCommandDB', version = 2) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = (event) => {
                console.error("IndexedDBの初期化エラー:", event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // ストアの作成
                if (!db.objectStoreNames.contains('master')) {
                    db.createObjectStore('master', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('userdata')) {
                    db.createObjectStore('userdata', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('knowledge')) {
                    db.createObjectStore('knowledge', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('synergies')) {
                    db.createObjectStore('synergies', { keyPath: 'id' });
                }
            };
        });
    }

    async set(storeName, id, data) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put({ id: id, data: data });

            request.onsuccess = () => resolve(true);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async get(storeName, id) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = (event) => {
                resolve(event.target.result ? event.target.result.data : null);
            };
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async delete(storeName, id) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve(true);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async getSynergyRules() {
        return await this.get('synergies', 'custom_rules') || [];
    }

    async saveSynergyRules(rules) {
        await this.set('synergies', 'custom_rules', rules);
    }
}

// グローバルインスタンス
window.KCSDB = new StorageManager();
