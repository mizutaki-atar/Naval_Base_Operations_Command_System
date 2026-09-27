/**
 * knowledge_ingestor.js
 * 外部の攻略記事、Wikiテキスト、SNSの編成テキストなどを自然言語解析・正規表現でパースし
 * ユーザーの保有艦娘・装備とのギャップ（再現度％）と代替案を提示するエンジン。
 */

class ExternalKnowledgeIngestor {
    constructor(userData) {
        this.userShips = userData.ships || [];
        this.userItems = userData.items || [];
        this.masterShipNames = Object.values(MasterData.Ships).map(s => s.name);
        this.masterItemNames = Object.values(MasterData.Items).map(i => i.name);
    }

    // テキストから艦娘、装備、制空値、索敵値を抽出
    parseText(text) {
        if (!text) return null;

        const result = {
            mentionedShips: [],
            mentionedItems: [],
            targetAirPower: 0,
            targetLos: 0,
            conditions: []
        };

        // 1. 制空値の抽出 (例: 「制空値252以上」「優勢310」)
        const airMatch = text.match(/(?:制空|制空値|優勢|確保).*?(\d{2,4})/);
        if (airMatch) result.targetAirPower = parseInt(airMatch[1]);

        // 2. 索敵の抽出 (例: 「33式索敵45以上」)
        const losMatch = text.match(/(?:索敵|33式).*?(\d{1,3})/);
        if (losMatch) result.targetLos = parseInt(losMatch[1]);

        // 3. 艦娘名の抽出（マスタデータとの照合）
        for (const name of this.masterShipNames) {
            if (text.includes(name)) {
                // 重複排除と、派生形（改と改二）の厳密チェックの簡易実装
                if (!result.mentionedShips.includes(name)) {
                    result.mentionedShips.push(name);
                }
            }
        }

        // 4. 装備名の抽出
        for (const name of this.masterItemNames) {
            if (text.includes(name)) {
                if (!result.mentionedItems.includes(name)) {
                    result.mentionedItems.push(name);
                }
            }
        }

        return result;
    }

    // 抽出された編成と、自分の母港データとのギャップを診断し、代替案を生成する
    analyzeGapAndSuggest(parsedData) {
        let analysis = {
            reproductionScore: 0,
            matches: [],
            missingShips: [],
            missingItems: [],
            suggestions: []
        };

        let totalRequired = parsedData.mentionedShips.length + parsedData.mentionedItems.length;
        if (totalRequired === 0) return analysis; // 抽出できなかった場合

        let matchCount = 0;

        // 艦娘のギャップ診断
        for (const reqShipName of parsedData.mentionedShips) {
            const owned = this.userShips.find(s => s.name === reqShipName);
            if (owned) {
                analysis.matches.push(`[所持] 艦娘: ${reqShipName} (Lv${owned.lv})`);
                matchCount++;
            } else {
                analysis.missingShips.push(reqShipName);
                
                // 代替案の検索 (同じ艦種で一番Lvが高いもの)
                // まず要求艦娘の艦種を特定
                const masterEntry = Object.values(MasterData.Ships).find(m => m.name === reqShipName);
                if (masterEntry) {
                    const stype = masterEntry.stype;
                    // 自分が持っている同じ艦種を検索
                    const alternatives = this.userShips
                        .filter(s => s.stype === stype && s.name !== reqShipName)
                        .sort((a, b) => b.lv - a.lv);
                    
                    if (alternatives.length > 0) {
                        analysis.suggestions.push(`[代替提案] ${reqShipName} (未所持) -> ${alternatives[0].name} (Lv${alternatives[0].lv}) を使用可能です。`);
                    } else {
                        analysis.suggestions.push(`[警告] ${reqShipName} の代替となる ${masterEntry.type_name} が見つかりません。`);
                    }
                }
            }
        }

        // 装備のギャップ診断
        for (const reqItemName of parsedData.mentionedItems) {
            // 所有アイテムから検索
            const owned = this.userItems.find(i => MasterData.Items[i.id] && MasterData.Items[i.id].name === reqItemName);
            if (owned) {
                analysis.matches.push(`[所持] 装備: ${reqItemName}`);
                matchCount++;
            } else {
                analysis.missingItems.push(reqItemName);
                // 装備の代替は簡易的に同カテゴリから提案
                const masterEntry = Object.values(MasterData.Items).find(m => m.name === reqItemName);
                if (masterEntry) {
                    const typeId = masterEntry.type[2]; // カテゴリID
                    const alternatives = this.userItems.filter(i => MasterData.Items[i.id] && MasterData.Items[i.id].type[2] === typeId);
                    if (alternatives.length > 0) {
                        const altName = MasterData.Items[alternatives[0].id].name;
                        analysis.suggestions.push(`[代替提案] ${reqItemName} (未所持) -> ${altName} を代用できます。`);
                    }
                }
            }
        }

        analysis.reproductionScore = Math.floor((matchCount / totalRequired) * 100);

        return analysis;
    }
}

// 期間限定イベント特効データの管理・パーサー
window.EventBonusManager = {
    bonuses: {}, // { "長門": "1.15", "雪風": "1.25" }
    
    parseText: function(text) {
        this.bonuses = {};
        const lines = text.split('\n');
        let count = 0;
        
        lines.forEach(line => {
            // "1.15" や "1.2" などを探す (倍率っぽい数字)
            const match = line.match(/([1-9]\.\d{1,2})/);
            if (match) {
                const multiplier = match[1];
                // マスタデータの艦娘名と照合
                for (const shipId in MasterData.Ships) {
                    const shipName = MasterData.Ships[shipId].name;
                    const baseName = shipName.replace(/改二.*$/, '').replace(/改$/, '');
                    
                    if (line.includes(shipName) || line.includes(baseName)) {
                        this.bonuses[shipName] = multiplier;
                        this.bonuses[baseName] = multiplier;
                        count++;
                    }
                }
            }
        });
        
        return count;
    },
    
    getBonus: function(shipName) {
        if (this.bonuses[shipName]) return this.bonuses[shipName];
        const baseName = shipName.replace(/改二.*$/, '').replace(/改$/, '');
        if (this.bonuses[baseName]) return this.bonuses[baseName];
        return null;
    }
};
