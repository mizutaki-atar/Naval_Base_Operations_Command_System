/**
 * features.js
 * 新規追加機能: 明石改修チェッカー、優先投資診断、断捨離クリーナー、お札プランナー
 */

document.addEventListener('DOMContentLoaded', () => {
    // Helper function for user data
    window.getUserData = async function() {
        if (typeof KCSDB !== 'undefined') {
            const data = await KCSDB.get('userdata', 'latest');
            if (data) return data;
        }
        return typeof AppState !== 'undefined' ? AppState.userData : null;
    }
    // -----------------------------------------------------
    // 1. 明石の改修工廠チェッカー
    // -----------------------------------------------------
    const btnAkashi = document.getElementById('btn-akashi-check');
    const daySelect = document.getElementById('akashi-day-select');
    if (daySelect) {
        daySelect.value = new Date().getDay().toString();
    }
    
    if (btnAkashi) {
        btnAkashi.addEventListener('click', async () => {
            const res = document.getElementById('akashi-result');
            res.innerHTML = "判定中...";
            
            const userData = await window.getUserData();
            if (!userData) return res.innerHTML = "ユーザーデータがありません。";

            const day = parseInt(daySelect.value);
            const akashiData = MasterData.KC3?.Akashi;
            
            if (!akashiData) {
                res.innerHTML = "KC3データ (akashi.json) がロードされていません。";
                return;
            }

            // 曜日マップ (0:sun - 6:sat)
            const dayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
            const dayKey = dayMap[day];
            const todaysUpgrades = akashiData[dayKey] || {};

            // 手持ちの装備IDと個数を集計 (api_slotitem_id がマスターID)
            const myItems = {};
            if (userData.items) {
                userData.items.forEach(it => {
                    const mstId = it.api_slotitem_id;
                    myItems[mstId] = (myItems[mstId] || 0) + 1;
                });
            }

            // 手持ちの艦娘マスターIDを収集 (秘書艦チェック用)
            const myShipIds = new Set();
            if (userData.ships) {
                userData.ships.forEach(s => {
                    myShipIds.add(s.api_ship_id);
                });
            }

            let html = '<table class="classic-table" style="width:100%;">';
            html += '<tr><th>装備名</th><th>2番艦</th><th>状況</th></tr>';

            // 主要装備のみ抽出 (10個程度ピックアップして表示)
            // 実際はフィルタリング等を入れるが、今回は今日の改修可能リストを全て表示する
            let count = 0;
            
            for (let eqId in todaysUpgrades) {
                const mstItem = MasterData.Items[eqId];
                if (!mstItem) continue;
                
                // 改修を担当できる2番艦のID配列
                const assistantIds = todaysUpgrades[eqId];
                
                // 持っている艦娘がいるかチェック
                let hasShip = assistantIds.some(id => myShipIds.has(id));
                
                // 艦名リストを生成
                const assistantNames = assistantIds.map(id => {
                    const mst = MasterData.Ships[id];
                    const name = mst ? mst.name : `不明(${id})`;
                    return myShipIds.has(id) ? `<span style="color:blue;">${name}</span>` : `<span style="color:gray;">${name}</span>`;
                }).join(', ');

                let status = hasShip ? `<span style="color:green; font-weight:bold;">🟢 改修可能</span>` : `🔴 秘書艦不在`;
                if (!myItems[eqId]) status = `⚠️ 装備未所持`; // (※未所持でも他装備から更新して作る場合があるので表示はする)
                
                html += `<tr>
                    <td>${mstItem.name} <br><span style="font-size:10px;color:#555;">(所持:${myItems[eqId]||0})</span></td>
                    <td style="font-size:11px;">${assistantNames}</td>
                    <td>${status}</td>
                </tr>`;
                count++;
            }

            if (count === 0) {
                html += `<tr><td colspan="3">本日の改修可能な装備はありません。</td></tr>`;
            }
            html += '</table>';
            res.innerHTML = html;
        });
    }

    // -----------------------------------------------------
    // 2. 改装設計図・優先投資診断
    // -----------------------------------------------------
    const btnBlueprint = document.getElementById('btn-blueprint-rank');
    if (btnBlueprint) {
        btnBlueprint.addEventListener('click', async () => {
            const res = document.getElementById('blueprint-rank-result');
            const userData = await window.getUserData();
            if (!userData) return res.innerHTML = "ユーザーデータがありません。";

            const priorityTargets = [
                { base: "矢矧", final: ["矢矧改二乙", "矢矧改二"], display: "矢矧改二乙", lv: 90, rank: "S", items: "設計図, 戦闘詳報, 航空資材" },
                { base: "最上", final: ["最上改二特", "最上改二"], display: "最上改二特", lv: 90, rank: "S", items: "設計図, 戦闘詳報, 航空資材" },
                { base: "大和", final: ["大和改二", "大和改二重"], display: "大和改二(重)", lv: 90, rank: "S", items: "設計図x3, 詳報x2, 航空x2" },
                { base: "伊勢", final: ["伊勢改二"], display: "伊勢改二", lv: 88, rank: "S", items: "設計図x2, 詳報, カタパルト" },
                { base: "日向", final: ["日向改二"], display: "日向改二", lv: 90, rank: "S", items: "設計図x2, 詳報, カタパルト" },
                { base: "赤城", final: ["赤城改二", "赤城改二戊"], display: "赤城改二(戊)", lv: 90, rank: "S", items: "設計図x2, 詳報, カタパルト" },
                { base: "加賀", final: ["加賀改二", "加賀改二戊", "加賀改二護"], display: "加賀改二(護)", lv: 90, rank: "S", items: "設計図x2, 詳報, カタパルト" },
                { base: "翔鶴", final: ["翔鶴改二", "翔鶴改二甲"], display: "翔鶴改二甲", lv: 88, rank: "S", items: "設計図, カタパルト" },
                { base: "瑞鶴", final: ["瑞鶴改二", "瑞鶴改二甲"], display: "瑞鶴改二甲", lv: 90, rank: "S", items: "設計図, カタパルト" },
                { base: "夕張", final: ["夕張改二特", "夕張改二丁", "夕張改二"], display: "夕張改二特", lv: 88, rank: "S", items: "設計図, 詳報, 兵装資材" },
                { base: "長門", final: ["長門改二"], display: "長門改二", lv: 88, rank: "A", items: "設計図, 詳報" },
                { base: "陸奥", final: ["陸奥改二"], display: "陸奥改二", lv: 89, rank: "A", items: "設計図, 詳報" },
                { base: "鈴谷", final: ["鈴谷改二", "鈴谷航改二"], display: "鈴谷改二/航", lv: 84, rank: "A", items: "設計図, (航:カタパルト)" },
                { base: "熊野", final: ["熊野改二", "熊野航改二"], display: "熊野改二/航", lv: 84, rank: "A", items: "設計図, (航:カタパルト)" },
                { base: "雪風", final: ["雪風改二", "丹陽"], display: "雪風改二", lv: 88, rank: "A", items: "設計図, 詳報" },
                { base: "時雨", final: ["時雨改三"], display: "時雨改三", lv: 97, rank: "A", items: "詳報, 兵装資材x2" },
                { base: "阿武隈", final: ["阿武隈改二"], display: "阿武隈改二", lv: 75, rank: "A", items: "設計図" },
                { base: "金剛", final: ["金剛改二丙"], display: "金剛改二丙", lv: 92, rank: "B", items: "設計図x2, 詳報" },
                { base: "比叡", final: ["比叡改二丙"], display: "比叡改二丙", lv: 90, rank: "B", items: "設計図x2, 詳報" },
                { base: "榛名", final: ["榛名改二乙", "榛名改二丙"], display: "榛名改二乙/丙", lv: 90, rank: "B", items: "設計図x2, 詳報" },
                { base: "霧島", final: ["霧島改二丙"], display: "霧島改二丙", lv: 90, rank: "B", items: "設計図x2, 詳報" },
                { base: "鳥海", final: ["鳥海改二"], display: "鳥海改二", lv: 65, rank: "B", items: "設計図, 詳報" },
                { base: "利根", final: ["利根改二"], display: "利根改二", lv: 70, rank: "B", items: "設計図" },
                { base: "筑摩", final: ["筑摩改二"], display: "筑摩改二", lv: 70, rank: "B", items: "設計図" },
                { base: "瑞鳳", final: ["瑞鳳改二", "瑞鳳改二乙"], display: "瑞鳳改二乙", lv: 80, rank: "B", items: "設計図" }
            ];

            let html = '<table class="classic-table" style="width:100%;">';
            html += '<tr><th>優先度</th><th>艦名 (現在Lv)</th><th>目標</th><th>必要Lv</th><th>要求アイテム</th></tr>';

            userData.ships.forEach(s => {
                const mst = MasterData.Ships[s.id];
                if (!mst) return;
                
                // Remove everything from "改" onwards to get the base class name
                let baseName = mst.name.replace(/改.*/, "");
                // Handle edge cases like "丹陽"
                if (mst.name === "丹陽") baseName = "雪風";
                
                const target = priorityTargets.find(t => t.base === baseName);
                if (target) {
                    // Check if the current ship is already in the final array
                    if (!target.final.includes(mst.name)) {
                        let color = target.rank === 'S' ? 'red' : (target.rank === 'A' ? '#cc6600' : '#006600');
                        html += `<tr>
                            <td style="color:${color}; font-weight:bold;">${target.rank}</td>
                            <td>${mst.name} (Lv${s.lv})</td>
                            <td>${target.display}</td>
                            <td>${target.lv} (あと <b style="color:red;">${Math.max(0, target.lv - s.lv)}</b>)</td>
                            <td style="font-size:11px;">${target.items}</td>
                        </tr>`;
                    }
                }
            });
            html += '</table>';
            res.innerHTML = html;
        });
    }

    // -----------------------------------------------------
    // 3. 断捨離クリーナー
    // -----------------------------------------------------
    const btnDeclutter = document.getElementById('btn-declutter-items');
    if (btnDeclutter) {
        btnDeclutter.addEventListener('click', async () => {
            const res = document.getElementById('declutter-result');
            const userData = await window.getUserData();
            if (!userData) return res.innerHTML = "ユーザーデータがありません。";

            const fodderNames = ["12.7cm連装砲", "14cm単装砲", "20.3cm連装砲", "35.6cm連装砲", "41cm連装砲", "九一式徹甲弾", "25mm機銃", "零式水上偵察機", "ドラム缶(輸送用)"];
            const trashNames = ["12cm単装砲", "15.2cm単装砲", "61cm三連装魚雷", "7.7mm機銃", "12.7mm単装機銃", "九九式艦爆"];
            
            const myItems = {};
            userData.items.forEach(it => {
                myItems[it.id] = (myItems[it.id] || 0) + 1;
            });

            let html = '<table class="classic-table" style="width:100%;">';
            html += '<tr><th>判定</th><th>装備名</th><th>所持数</th><th>提案</th></tr>';

            for (let eqId in myItems) {
                const count = myItems[eqId];
                const mst = MasterData.Items[eqId];
                if (!mst) continue;

                let tag = "";
                let prop = "";

                if (trashNames.includes(mst.name)) {
                    tag = "🗑️ 廃棄候補";
                    prop = "すべて廃棄してOK";
                } else if (fodderNames.includes(mst.name)) {
                    tag = "🔧 改修餌";
                    prop = count > 10 ? `${count - 10}個は廃棄可能` : "温存推奨";
                } else if (mst.aa > 5 || mst.fire > 10 || count <= 2) {
                    tag = "🔒 貴重品";
                    prop = "ロック必須";
                } else {
                    continue; // 表示省略
                }

                html += `<tr>
                    <td>${tag}</td>
                    <td>${mst.name}</td>
                    <td>${count}</td>
                    <td>${prop}</td>
                </tr>`;
            }
            html += '</table>';
            res.innerHTML = html;
        });
    }

    // -----------------------------------------------------
    // 4. お札プランナー (Kanban)
    // -----------------------------------------------------
    const btnLoadPlanners = document.getElementById('btn-load-planners');
    const plannerKanban = document.getElementById('planner-kanban');
    
    // お札の定義
    const tags = [
        { id: 'reserve', name: '無札・温存', color: '#ffffff' },
        { id: 'tag1', name: '第1艦隊札', color: '#ffcccc' },
        { id: 'tag2', name: '第2艦隊札', color: '#ccffcc' },
        { id: 'tag3', name: '第3艦隊札', color: '#ccccff' },
        { id: 'tag4', name: '第4艦隊札', color: '#ffffcc' }
    ];

    if (btnLoadPlanners) {
        // カラム初期化
        const renderColumns = () => {
            plannerKanban.innerHTML = "";
            tags.forEach(t => {
                const col = document.createElement('div');
                col.className = 'classic-inset';
                col.style.cssText = `flex: 0 0 150px; min-height: 300px; background-color:${t.color}; padding:4px;`;
                col.innerHTML = `<div style="font-weight:bold; text-align:center; margin-bottom:4px; border-bottom:1px solid #808080;">${t.name}</div>`;
                col.id = `kanban-${t.id}`;
                
                // Drop Events
                col.addEventListener('dragover', (e) => e.preventDefault());
                col.addEventListener('drop', (e) => {
                    e.preventDefault();
                    const shipUid = e.dataTransfer.getData('text/plain');
                    const el = document.getElementById(`kanban-ship-${shipUid}`);
                    if (el) {
                        col.appendChild(el);
                        saveKanbanState();
                    }
                });

                plannerKanban.appendChild(col);
            });
        };

        const saveKanbanState = () => {
            const state = {};
            tags.forEach(t => {
                const col = document.getElementById(`kanban-${t.id}`);
                const ships = Array.from(col.querySelectorAll('.kanban-item')).map(el => el.dataset.uid);
                state[t.id] = ships;
            });
            localStorage.setItem('kcs_kanban_state', JSON.stringify(state));
        };

        btnLoadPlanners.addEventListener('click', async () => {
            const userData = await window.getUserData();
            if (!userData) return;

            renderColumns();

            // Lv70以上の主力艦を抽出
            const mainShips = userData.ships.filter(s => s.lv >= 70);
            
            const savedStateStr = localStorage.getItem('kcs_kanban_state');
            const savedState = savedStateStr ? JSON.parse(savedStateStr) : null;

            mainShips.forEach(s => {
                const mst = MasterData.Ships[s.id];
                if (!mst) return;

                const el = document.createElement('div');
                el.id = `kanban-ship-${s.uid}`;
                el.className = 'kanban-item classic-button';
                el.style.cssText = 'width: 90%; margin: 2px auto; display: block; text-align: left; cursor: grab; font-size:11px; padding:2px;';
                el.draggable = true;
                el.dataset.uid = s.uid;
                el.innerHTML = `<span style="display:inline-block; width:20px; color:#000080;">Lv${s.lv}</span> ${mst.name}`;
                
                el.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', s.uid);
                });

                // 配置場所の決定
                let targetColId = 'kanban-reserve';
                if (savedState) {
                    for (let tagId of Object.keys(savedState)) {
                        if (savedState[tagId].includes(s.uid.toString())) {
                            targetColId = `kanban-${tagId}`;
                            break;
                        }
                    }
                }

                const targetCol = document.getElementById(targetColId) || document.getElementById('kanban-reserve');
                targetCol.appendChild(el);
            });
        });

        document.getElementById('btn-clear-planners')?.addEventListener('click', () => {
            localStorage.removeItem('kcs_kanban_state');
            btnLoadPlanners.click();
        });
    }
    // -----------------------------------------------------
    // 5. 任務チェッカー
    // -----------------------------------------------------
    document.querySelectorAll('.quest-filter').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update active state or just render
            document.querySelectorAll('.quest-filter').forEach(b => b.style.fontWeight = 'normal');
            e.target.style.fontWeight = 'bold';
            // Store status filter in a data attribute on the container or globally
            document.getElementById('quest-list-container').dataset.statusFilter = e.target.getAttribute('data-filter');
            window.renderKcsQuests();
        });
    });

    const qCatFilter = document.getElementById('quest-category-filter');
    if (qCatFilter) {
        qCatFilter.addEventListener('change', () => window.renderKcsQuests());
    }

    const qTypeFilter = document.getElementById('quest-type-filter');
    if (qTypeFilter) {
        qTypeFilter.addEventListener('change', () => window.renderKcsQuests());
    }
});

window.renderKcsQuests = async function() {
    const container = document.getElementById('quest-list-container');
    if (!container) return;
    
    const filterType = container.dataset.statusFilter || 'all';
    const catFilter = document.getElementById('quest-category-filter')?.value || 'all';
    const typeFilter = document.getElementById('quest-type-filter')?.value || 'all';
    
    container.innerHTML = "読み込み中...";

    let userData = null;
    if (typeof KCSDB !== 'undefined') {
        userData = await KCSDB.get('userdata', 'latest');
    }
    if (!userData && typeof AppState !== 'undefined') {
        userData = AppState.userData;
    }

    const myQuests = (userData && userData.quests) ? userData.quests : {};
    const masterQuests = MasterData.Quests || {};
    
    if (Object.keys(masterQuests).length === 0) {
        container.innerHTML = "<div class='classic-inset' style='padding:8px; grid-column: span 3; color:red;'>任務データ (quests.js) がロードされていません。</div>";
        return;
    }

    const onlyActive = document.getElementById('quest-only-active') ? document.getElementById('quest-only-active').checked : true;
    
    // データ未同期時の親切設計
    if (onlyActive && Object.keys(myQuests).length === 0) {
        container.innerHTML = `
            <div style="padding: 10px; color: #b30000; font-weight: bold; background: #ffe6e6; border: 1px solid #ff9999; grid-column: span 3;">
                ⚠️ 任務データが未同期です。<br>
                ゲーム内で一度「任務」画面を開いてリストを読み込ませてください。<br>
                （※ 上部の「出現中(同期済)の任務のみ表示」のチェックを外すと、全任務データを確認できます）
            </div>
        `;
        return;
    }

    let html = '';
    let count = 0;
    
    // Sort logic: my active quests first, then others
    const questList = Object.keys(masterQuests).map(id => {
        const qMst = masterQuests[id];
        const qMy = myQuests[id] || {};
        return { id: id, mst: qMst, my: qMy };
    });

    for (let q of questList) {
        try {
            const onlyActive = document.getElementById('quest-only-active') ? document.getElementById('quest-only-active').checked : true;
            if (onlyActive && (!q.my || Object.keys(q.my).length === 0)) {
                continue;
            }

            // カテゴリフィルタ (codeの先頭文字)
            if (catFilter !== 'all' && q.mst.code) {
            if (!q.mst.code.startsWith(catFilter)) continue;
        }
        // タイプフィルタ (1:デイリー, 2:ウィークリー, 3:マンスリー, 4:単発, 5:クォータリー等)
        if (typeFilter !== 'all') {
            let questType = q.mst.type;
            if (!questType && q.mst.code) {
                if (q.mst.code.includes('d')) questType = 1;
                else if (q.mst.code.includes('w')) questType = 2;
                else if (q.mst.code.includes('m')) questType = 3;
                else if (q.mst.code.includes('q') || q.mst.code.includes('y')) questType = 5;
                else questType = 4;
            }
            if (questType && questType.toString() !== typeFilter) continue;
        }

        const state = q.my.api_state || q.my.state || q.my.status || 1; // 1:未達成, 2:遂行中, 3:達成
        
        let statusTag = "⚪ 未達成";
        let bgColor = "#ffffff";
        let isShow = false;

        if (state === 3) {
            statusTag = "🟢 達成済";
            bgColor = "#ccffcc";
            if (filterType === 'all' || filterType === 'ready') isShow = true;
        } else if (state === 2) {
            statusTag = "🟡 遂行中";
            bgColor = "#ffffcc";
            if (filterType === 'all' || filterType === 'partial') isShow = true;
        } else {
            if (filterType === 'all' || filterType === 'missing') isShow = true;
        }

        if (!isShow) continue;

        let missingShipsHtml = "";
        
        // 未達成または遂行中の場合のみ、艦娘の所持チェックを実行
        if (state !== 3 && userData && Array.isArray(userData.ships)) {
            const shipRegex = /「([^」]+)」/g;
            let match;
            const requiredShips = new Set();
            
            const descStr = q.mst.desc || "";
            const nameStr = q.mst.name || "";
            
            while ((match = shipRegex.exec(descStr)) !== null) requiredShips.add(match[1]);
            while ((match = shipRegex.exec(nameStr)) !== null) requiredShips.add(match[1]);
            
            if (requiredShips.size > 0) {
                requiredShips.forEach(reqName => {
                    // 「第X駆逐隊」などは除外
                    if (reqName.includes("駆逐隊") || reqName.includes("戦隊") || reqName.includes("艦隊")) return;
                    
                    // 実在する艦船名かチェック
                    const isRealShip = Object.values(MasterData.Ships).some(s => s && s.name === reqName);
                    if (!isRealShip) return; 
                    
                    // 完全一致で所持しているか
                    const hasExact = userData.ships.some(s => {
                        const mst = MasterData.Ships[s.id];
                        return mst && mst.name === reqName;
                    });
                    
                    if (!hasExact) {
                        // 未改造や改などのベース艦を探す
                        const baseReqName = reqName.replace(/(改二|改三|改|甲|乙|丙|丁|特|戊|白露型|朝潮型|夕雲型|陽炎型|型)/g, "");
                        
                        const baseUserShip = userData.ships.find(s => {
                            const mst = MasterData.Ships[s.id];
                            if (!mst) return false;
                            const mstBase = mst.name.replace(/(改二|改三|改|甲|乙|丙|丁|特|戊|白露型|朝潮型|夕雲型|陽炎型|型)/g, "");
                            return mstBase === baseReqName;
                        });
                        
                        if (baseUserShip) {
                            const mst = MasterData.Ships[baseUserShip.id];
                            missingShipsHtml += `<div style="color:#cc6600; margin-top:2px;">⚠️ 育成中ですが、現在 ${mst.name} (Lv${baseUserShip.lv}) です (育成中)</div>`;
                        } else {
                            missingShipsHtml += `<div style="color:red; margin-top:2px;">❌ 未所持: ${reqName}</div>`;
                        }
                    }
                });
            }
        }

        html += `
        <div class="classic-window" style="background-color: ${bgColor}; padding: 4px; border: 1px solid #808080;">
            <div style="font-weight:bold; font-size:13px; margin-bottom:2px; display:flex; justify-content:space-between;">
                <span>[${q.mst.code}] ${q.mst.name}</span>
                <span style="font-size:11px;">${statusTag}</span>
            </div>
            <div style="font-size:11px; color:#333; margin-bottom:2px; min-height: 35px; max-height: 50px; overflow-y: auto;">
                ${q.mst.desc || "説明なし"}
            </div>
            <div style="font-size:10px; color:#0066cc;">
                ${q.mst.memo || ""}
            </div>
            ${missingShipsHtml}
        </div>`;
        count++;
        } catch (err) {
            console.error("Error rendering quest:", q.id, err);
        }
    }
    
    
    if (count === 0) {
        html = `<div style="grid-column: span 3; padding:8px;">該当する任務がありません。</div>`;
    }
    
    container.innerHTML = html;
};
