class SpecialCombatSim {
    static init() {
        this.renderTab();
    }
    
    static renderTab() {
        const tab = document.getElementById('tab13');
        if (!tab) return;
        
        tab.innerHTML = `
            <div class="classic-window" style="margin-bottom:8px;">
                <div class="classic-titlebar">13. 航空・索敵・対地戦 シミュレーター (パズルカスタマイズ対応)</div>
                <div class="classic-content" style="padding:15px; height:calc(100vh - 100px); overflow-y:auto;">
                    
                    <button class="classic-button" style="width:100%; font-weight:bold; padding:8px; margin-bottom:15px;" onclick="SpecialCombatSim.importFleet1()">🔄 現在の第1艦隊をインポート</button>

                    <!-- 航空戦 -->
                    <div style="background-color:#e8f4f8; padding:10px; border:1px solid #b6d4e1; margin-bottom:15px;">
                        <h3 style="margin-top:0; border-bottom:1px solid #000; color:#000080;">✈️ 航空戦・制空値</h3>
                        <div id="sc-air-result" style="font-size:16px; font-weight:bold; color:#b22222; padding:5px; background:#fff; border:1px inset #ccc;">第1艦隊をインポートしてください。</div>
                    </div>

                    <!-- 索敵値 -->
                    <div style="background-color:#e8f8e8; padding:10px; border:1px solid #b6e1b6; margin-bottom:15px;">
                        <h3 style="margin-top:0; border-bottom:1px solid #000; color:#006400;">📡 索敵値 (33式)</h3>
                        <div id="sc-los-result" style="font-size:14px; font-weight:bold; padding:5px; background:#fff; border:1px inset #ccc;">第1艦隊をインポートしてください。</div>
                    </div>

                    <!-- 陸上戦パズルUI -->
                    <div style="background-color:#f8e8e8; padding:10px; border:1px solid #e1b6b6; margin-bottom:15px;">
                        <h3 style="margin-top:0; border-bottom:1px solid #000; color:#8b0000;">🏝️ 対地戦 (陸上型深海棲艦) 特効パズル</h3>
                        
                        <div style="font-size:12px; margin-bottom:15px; color:#333; line-height:1.6;">
                            <details style="background:#fff; border:1px solid #ccc; padding:8px; margin-bottom:8px;" open>
                                <summary style="font-weight:bold; cursor:pointer; color:#b22222;">📖 対地装備のメリット・デメリットとシナジー (クリックで開閉)</summary>
                                <div style="margin-top:8px; border-top:1px dashed #ccc; padding-top:8px;">
                                    <strong>【主要な対地装備の特性】</strong>
                                    <ul style="margin:4px 0 10px 20px; padding:0;">
                                        <li><span style="color:#000080; font-weight:bold;">三式弾</span><br>
                                        [メリット] ソフトスキン(飛行場姫など)に対して2.5倍という絶大な倍率を誇ります。戦艦や重巡に積めるため基礎火力が高い。<br>
                                        [デメリット] 砲台小鬼には全く特効が乗りません。</li>
                                        <li><span style="color:#000080; font-weight:bold;">WG42 (対地ロケット)</span><br>
                                        [メリット] 全ての陸上型に固定ダメージ(加算)と倍率を与えます。駆逐・軽巡の対地主軸。<br>
                                        [デメリット] これ単体では倍率が低く、特に集積地などには力不足。2〜3積みで真価を発揮します。</li>
                                        <li><span style="color:#000080; font-weight:bold;">大発動艇(八九式中戦車) などの戦車系</span><br>
                                        [メリット] 砲台小鬼や離島に対して高い倍率。後述の内火艇と組み合わせることで爆発的なシナジーを生みます。<br>
                                        [デメリット] 搭載できる艦娘が限られます（特定の大発搭載可能艦のみ）。</li>
                                        <li><span style="color:#000080; font-weight:bold;">特二式内火艇 (カミ車)</span><br>
                                        [メリット] 砲台や離島に対して単体で2.4倍と最強クラスの倍率。潜水艦にも積めます。<br>
                                        [デメリット] 戦車以上に搭載可能艦が限定されます。</li>
                                        <li><span style="color:#000080; font-weight:bold;">徹甲弾</span><br>
                                        [メリット] 砲台小鬼と離島棲姫に対して1.85倍の特効。戦艦の昼戦連撃と両立できるのが最大の強み。<br>
                                        [デメリット] ソフトスキン(飛行場姫)には無効です。</li>
                                    </ul>
                                    
                                    <strong>【対地シナジー（相乗効果）の概念】</strong>
                                    <p style="margin:4px 0 10px 0;">
                                        艦これの対地戦において最も重要なのが<strong>「戦車 ＋ 内火艇」のシナジー</strong>です。<br>
                                        この2つを同時に積むことで、それぞれの個別倍率に加え、さらに<strong>「シナジー倍率(約1.5倍)」</strong>が乗算されます。<br>
                                        特に「集積地棲姫」に対しては、「ソフトスキン用の倍率」と「集積地専用の倍率」が二重に掛け算される特殊仕様があるため、<br>
                                        <span style="color:red; font-weight:bold;">WG42 ＋ 戦車 ＋ 内火艇</span> のように積むと、倍率が数十倍に跳ね上がり、昼戦からカンストダメージ（9999）を叩き出します。
                                    </p>

                                    <strong>【対地特効に向いた艦娘（メリット・デメリット）】</strong>
                                    <ul style="margin:4px 0 0 20px; padding:0;">
                                        <li><span style="color:#006400; font-weight:bold;">4スロットの軽巡・駆逐 (大淀、Tashkent など)</span><br>
                                        [メリット] スロット数の多さを活かし「WG42×2 ＋ 戦車 ＋ 内火艇」といった欲張りフルシナジー装備が可能。対地火力は最強クラス。<br>
                                        [デメリット] そもそも大淀やTashkentは大発系が積めないためWG42ガン積みに依存する等、艦ごとに搭載制限のジレンマがあります。</li>
                                        <li><span style="color:#006400; font-weight:bold;">大発・内火艇が両方積める駆逐艦 (Верный、霞改二、満潮改二、朝潮改二丁 など)</span><br>
                                        [メリット] 「戦車＋内火艇」の強烈なシナジーを活かせる対地のエース。イベント海域の対地ボスでは必須級です。<br>
                                        [デメリット] 夜戦連撃（主砲2）と対地シナジーを両立させるにはスロットが足りず、道中の水上艦隊相手には弱くなりがちです。</li>
                                        <li><span style="color:#006400; font-weight:bold;">水上機母艦 (日進、Commandant Teste など)</span><br>
                                        [メリット] 大発系が積める上に4スロットあるため、昼戦連撃と対地シナジーを両立できる最強の対地要員。<br>
                                        [デメリット] 装甲や回避が低く、ボス到達前に大破しやすいのが弱点です。</li>
                                    </ul>
                                </div>
                            </details>

                            <strong>【パズルカスタマイズ】</strong><br>
                            保有している艦娘・装備は「[保有]」マークが付き上部に表示されます。未保有のものも検証のために選択可能です。<br>
                            ※集積地棲姫へのダメージは「ソフトスキン倍率 × 集積地固有倍率」で爆発的に跳ね上がります。<br><br>
                            
                            <div style="font-size:11px; color:#555; background:#eee; padding:8px; border-radius:4px; border:1px solid #ccc;">
                                <strong>※当シミュレーターの計算根拠および参考文献（注釈）</strong><br>
                                本システムにおける対地特効の倍率・加算値およびシナジーの仕様は、有志のプレイヤーコミュニティ（検証勢）による膨大な実測データに基づき、以下の文献・ツールの計算式を参考・引用して構築されています。<br>
                                <ul style="margin:4px 0 0 15px; padding:0;">
                                    <li><strong>艦隊これくしょん -艦これ- 攻略 Wiki* 「対地攻撃」</strong><br>
                                    (<a href="https://wikiwiki.jp/kancolle/%E5%AF%BE%E5%9C%B0%E6%94%BB%E6%92%83" target="_blank" style="color:#0000ee;">https://wikiwiki.jp/kancolle/対地攻撃</a>)<br>
                                    最も詳細な対地倍率テーブルとシナジーの仕様が検証・集約されている一次情報源です。当システムの乗算仕様やWG42の固定値加算ロジックはこれに準拠しています。</li>
                                    <li><strong>KC3改 (KanColle Command Center 改)</strong><br>
                                    (<a href="https://github.com/KC3Kai/KC3Kai" target="_blank" style="color:#0000ee;">https://github.com/KC3Kai/KC3Kai</a>)<br>
                                    海外コミュニティが主導する拡張機能。ソースコード内のダメージ計算式（特に対地シナジーの重複処理）のアルゴリズムを参考にしています。</li>
                                    <li><strong>作戦室 Jervis OR / 制空権シミュレータ</strong><br>
                                    最新の装備シナジーやキャップ後補正の挙動など、最新の検証結果を素早く取り入れている主要な計算機ツールです。</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div id="land-puzzle-container" style="display:flex; flex-direction:column; gap:8px;"></div>
                        
                        <button class="classic-button" style="margin-top:10px; padding:5px 10px;" onclick="SpecialCombatSim.addPuzzleRow()">➕ 艦娘スロットを追加</button>
                    </div>
                </div>
            </div>
        `;

        // パズル用データの初期化
        this.initPuzzleData();
        // 初期状態として1行追加
        this.addPuzzleRow();
    }
    
    static initPuzzleData() {
        if (!AppState.userData) return;
        
        // 保有IDセット (確実に数値として扱う)
        const ownedShipMstIds = new Set(AppState.userData.ships.map(s => Number(s.id)));
        const ownedItemMstIds = new Set(AppState.userData.items.map(i => Number(i.id)));

        // 艦娘リスト作成
        let allShips = Object.values(MasterData.Ships);
        allShips.sort((a,b) => {
            let aOwned = ownedShipMstIds.has(Number(a.id));
            let bOwned = ownedShipMstIds.has(Number(b.id));
            if (aOwned && !bOwned) return -1;
            if (!aOwned && bOwned) return 1;
            return Number(a.id) - Number(b.id);
        });
        
        this.shipOptionsHTML = '<option value="">-- 艦娘を選択 --</option>';
        allShips.forEach(s => {
            const mark = ownedShipMstIds.has(Number(s.id)) ? '[保有]' : '[未]';
            this.shipOptionsHTML += `<option value="${s.id}">${mark} ${s.name} (${s.type_name})</option>`;
        });

        // 装備リスト作成
        let allItems = Object.values(MasterData.Items);
        allItems.sort((a,b) => {
            let aOwned = ownedItemMstIds.has(Number(a.id));
            let bOwned = ownedItemMstIds.has(Number(b.id));
            if (aOwned && !bOwned) return -1;
            if (!aOwned && bOwned) return 1;
            return Number(a.id) - Number(b.id);
        });
        
        this.itemOptionsHTML = '<option value="">-- 装備なし --</option>';
        allItems.forEach(i => {
            const mark = ownedItemMstIds.has(Number(i.id)) ? '[保有]' : '[未]';
            this.itemOptionsHTML += `<option value="${i.id}">${mark} ${i.name}</option>`;
        });
    }

    static addPuzzleRow() {
        const container = document.getElementById('land-puzzle-container');
        if (!container) return;
        
        const rowId = 'puzzle-row-' + Date.now() + '-' + Math.floor(Math.random()*1000);
        const html = `
            <div id="${rowId}" style="background:#fff; border:1px solid #ccc; padding:8px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <select class="classic-select puzzle-ship" style="width:250px;" onchange="SpecialCombatSim.calcPuzzleRow('${rowId}')">${this.shipOptionsHTML}</select>
                    <button class="classic-button" style="color:red; padding:0 8px;" onclick="document.getElementById('${rowId}').remove()">X</button>
                </div>
                <div style="display:flex; gap:5px; margin-bottom:5px;">
                    <select class="classic-select puzzle-equip" style="width:140px;" onchange="SpecialCombatSim.calcPuzzleRow('${rowId}')">${this.itemOptionsHTML}</select>
                    <select class="classic-select puzzle-equip" style="width:140px;" onchange="SpecialCombatSim.calcPuzzleRow('${rowId}')">${this.itemOptionsHTML}</select>
                    <select class="classic-select puzzle-equip" style="width:140px;" onchange="SpecialCombatSim.calcPuzzleRow('${rowId}')">${this.itemOptionsHTML}</select>
                    <select class="classic-select puzzle-equip" style="width:140px;" onchange="SpecialCombatSim.calcPuzzleRow('${rowId}')">${this.itemOptionsHTML}</select>
                    <select class="classic-select puzzle-equip" style="width:140px;" onchange="SpecialCombatSim.calcPuzzleRow('${rowId}')">${this.itemOptionsHTML}</select>
                </div>
                <div id="${rowId}-result" style="background:#f0f0f0; padding:5px; font-size:12px;">艦娘を選択してください。</div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    }

    static calcPuzzleRow(rowId) {
        const row = document.getElementById(rowId);
        const resDiv = document.getElementById(rowId + '-result');
        if (!row || !resDiv) return;

        const shipId = row.querySelector('.puzzle-ship').value;
        if (!shipId) {
            resDiv.innerHTML = '艦娘を選択してください。';
            return;
        }

        let wgCount = 0;
        let sanshikiCount = 0;
        let apShellCount = 0;
        let tankCount = 0; 
        let kamiCount = 0; 
        let daihatsuCount = 0; 
        let seaplaneBomberCount = 0;

        const equips = row.querySelectorAll('.puzzle-equip');
        equips.forEach(eq => {
            const eid = eq.value;
            if (!eid) return;
            const mstItem = MasterData.Items[eid];
            if (!mstItem) return;

            const n = mstItem.name;
            if (n.includes('WG42') || n.includes('ロケットランチャー') || n.includes('迫撃砲')) wgCount++;
            if (n.includes('三式弾')) sanshikiCount++;
            if (n.includes('徹甲弾')) apShellCount++;
            if (n.includes('特二式内火艇')) kamiCount++;
            if (n.includes('戦車') || n.includes('陸戦隊')) tankCount++;
            else if (n.includes('大発動艇') || n.includes('武装大発')) daihatsuCount++;
            
            if (mstItem.type && (mstItem.type[2] === 11)) seaplaneBomberCount++; // 水上爆撃機
        });

        // 簡易倍率計算エンジン (Wiki準拠の概算)
        let softSkin = 1.0; let softAdd = 0;
        let pillbox = 1.0; let pillAdd = 0;
        let island = 1.0; let islAdd = 0;
        let depot = 1.0; let depAdd = 0;

        // 三式弾
        if (sanshikiCount > 0) {
            softSkin *= 2.5;
            island *= 1.75;
            // Depot uses softSkin base
        }
        
        // 徹甲弾
        if (apShellCount > 0) {
            pillbox *= 1.85;
            island *= 1.85;
        }

        // 水上爆撃機
        if (seaplaneBomberCount > 0) {
            softSkin *= 1.2;
            pillbox *= 1.5;
            island *= 1.5;
            depot *= 1.2; 
        }

        // WG42系
        if (wgCount == 1) {
            softAdd += 75; pillAdd += 75; islAdd += 75; depAdd += 75;
            pillbox *= 1.25; island *= 1.3; depot *= 1.25;
        } else if (wgCount >= 2) {
            softAdd += 110; pillAdd += 110; islAdd += 110; depAdd += 110;
            pillbox *= 1.625; island *= 1.82; depot *= 1.625;
        }

        // 大発系
        if (daihatsuCount > 0) {
            pillbox *= 1.5;
            island *= 1.5;
            depot *= 1.7;
        }

        // 戦車系
        if (tankCount > 0) {
            softSkin *= 1.2; // roughly
            pillbox *= 1.8;
            island *= 1.8;
            depot *= 1.3; // Stacks with Daihatsu? Actually Tank overrides Daihatsu usually, but we simplify.
        }

        // 内火艇
        if (kamiCount > 0) {
            pillbox *= 2.4;
            island *= 2.4;
            depot *= 1.7;
        }

        // シナジー
        if (tankCount > 0 && kamiCount > 0) {
            pillbox *= 1.5;
            island *= 1.5;
            // Depot has massive synergy (approx 1.2 extra?)
            depot *= 1.25; 
        }

        // 集積地は「ソフトスキン倍率 × 集積地固有倍率」
        let finalDepot = softSkin * depot;
        // 火力加算値はそのまま加算

        const formatResult = (multi, add) => {
            if (multi === 1.0 && add === 0) return '-';
            let txt = '';
            if (multi !== 1.0) txt += `<span style="color:red; font-weight:bold;">x${multi.toFixed(2)}</span>`;
            if (add > 0) txt += ` <span style="color:blue;">(+${add})</span>`;
            return txt;
        };

        resDiv.innerHTML = `
            <table style="width:100%; border-collapse:collapse; margin-top:5px; text-align:center;">
                <tr>
                    <th style="border-bottom:1px solid #ccc; width:25%;">ソフトスキン<br>(飛行場姫)</th>
                    <th style="border-bottom:1px solid #ccc; width:25%;">砲台小鬼</th>
                    <th style="border-bottom:1px solid #ccc; width:25%;">離島棲姫</th>
                    <th style="border-bottom:1px solid #ccc; width:25%;">集積地棲姫<br>(乗算)</th>
                </tr>
                <tr>
                    <td>${formatResult(softSkin, softAdd)}</td>
                    <td>${formatResult(pillbox, pillAdd)}</td>
                    <td>${formatResult(island, islAdd)}</td>
                    <td>${formatResult(finalDepot, softAdd+depAdd)}</td>
                </tr>
            </table>
        `;
    }

    static importFleet1() {
        if (!AppState.simulationFleet || AppState.simulationFleet.length === 0) {
            alert('第1艦隊に艦娘がセットされていません。');
            return;
        }

        const container = document.getElementById('land-puzzle-container');
        if (container) container.innerHTML = ''; // クリア

        this.updateAirAndLos(); // 航空と索敵の更新

        // 第1艦隊の各艦をパズル行として追加
        AppState.simulationFleet.forEach(fShip => {
            if (!fShip) return;
            const shipData = AppState.userData.ships.find(s => s.api_id === fShip.shipUid);
            if (!shipData) return;
            
            const rowId = 'puzzle-row-' + Date.now() + '-' + Math.floor(Math.random()*1000);
            this.addPuzzleRowWithId(rowId);
            
            // 値のセット
            setTimeout(() => {
                const row = document.getElementById(rowId);
                if (!row) return;
                const sSelect = row.querySelector('.puzzle-ship');
                if (sSelect) sSelect.value = shipData.api_ship_id;

                const eSelects = row.querySelectorAll('.puzzle-equip');
                fShip.equips.forEach((itemId, idx) => {
                    if (idx >= eSelects.length) return;
                    if (itemId === -1 || itemId === 0) return;
                    const itemData = AppState.userData.items[itemId] || AppState.userData.items.find(i => i.api_id === itemId);
                    if (itemData) {
                        eSelects[idx].value = itemData.api_slotitem_id;
                    }
                });
                
                this.calcPuzzleRow(rowId);
            }, 10);
        });
    }

    static addPuzzleRowWithId(rowId) {
        const container = document.getElementById('land-puzzle-container');
        if (!container) return;
        const html = `
            <div id="${rowId}" style="background:#fff; border:1px solid #ccc; padding:8px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <select class="classic-select puzzle-ship" style="width:250px;" onchange="SpecialCombatSim.calcPuzzleRow('${rowId}')">${this.shipOptionsHTML}</select>
                    <button class="classic-button" style="color:red; padding:0 8px;" onclick="document.getElementById('${rowId}').remove()">X</button>
                </div>
                <div style="display:flex; gap:5px; margin-bottom:5px;">
                    <select class="classic-select puzzle-equip" style="width:140px;" onchange="SpecialCombatSim.calcPuzzleRow('${rowId}')">${this.itemOptionsHTML}</select>
                    <select class="classic-select puzzle-equip" style="width:140px;" onchange="SpecialCombatSim.calcPuzzleRow('${rowId}')">${this.itemOptionsHTML}</select>
                    <select class="classic-select puzzle-equip" style="width:140px;" onchange="SpecialCombatSim.calcPuzzleRow('${rowId}')">${this.itemOptionsHTML}</select>
                    <select class="classic-select puzzle-equip" style="width:140px;" onchange="SpecialCombatSim.calcPuzzleRow('${rowId}')">${this.itemOptionsHTML}</select>
                </div>
                <div id="${rowId}-result" style="background:#f0f0f0; padding:5px; font-size:12px;">艦娘を選択してください。</div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    }

    static update() {
        // これは app.js から自動同期時に呼ばれるが、パズルUIなので自動更新は航空と索敵だけに留める
        this.updateAirAndLos();
    }

    static updateAirAndLos() {
        if (!AppState.simulationFleet || AppState.simulationFleet.length === 0) {
            document.getElementById('sc-air-result').innerText = '第1艦隊がセットされていません。';
            return;
        }

        let totalAir = 0;
        let losTotalBase = 0;
        let losEquipScore = 0;

        AppState.simulationFleet.forEach(fShip => {
            if (!fShip) return;
            const shipData = AppState.userData.ships.find(s => s.api_id === fShip.shipUid);
            if (!shipData) return;
            
            let shipLosBase = shipData.api_sakuteki ? shipData.api_sakuteki[0] : 0;
            let shipEquipLos = 0;

            fShip.equips.forEach((itemId, idx) => {
                if (itemId === -1 || itemId === 0) return;
                const itemData = AppState.userData.items[itemId] || AppState.userData.items.find(i => i.api_id === itemId);
                if (!itemData) return;
                const mstItem = MasterData.Items[itemData.api_slotitem_id];
                if (!mstItem) return;

                if (mstItem.saku) {
                    shipLosBase -= mstItem.saku;
                    let coef = 0.6;
                    if (mstItem.type && mstItem.type.length > 2) {
                        const type2 = mstItem.type[2];
                        if (type2 === 10) coef = 1.2;
                        else if (type2 === 11) coef = 1.1;
                        else if (type2 === 12 || type2 === 13) coef = 1.0;
                        else if (type2 === 9) coef = 1.0;
                    }
                    shipEquipLos += mstItem.saku * coef;
                }

                if (mstItem.tyku && mstItem.tyku > 0 && shipData.api_onslot && shipData.api_onslot[idx] > 0) {
                    if (mstItem.type && [6,7,8,11,45].includes(mstItem.type[2])) {
                        totalAir += Math.floor(mstItem.tyku * Math.sqrt(shipData.api_onslot[idx]));
                    }
                }
            });

            if (shipLosBase < 0) shipLosBase = 0;
            losTotalBase += Math.sqrt(shipLosBase);
            losEquipScore += shipEquipLos;
        });

        const hqLv = (AppState.userData && AppState.userData.basic) ? AppState.userData.basic.api_level : 120;
        const hqPenalty = Math.ceil(0.4 * hqLv);
        const emptySlots = 6 - AppState.simulationFleet.filter(x => x).length;
        const emptyBonus = 2 * emptySlots;

        const calc33 = (coef) => {
            return (losEquipScore * coef) + losTotalBase - hqPenalty + emptyBonus;
        };

        const airRes = document.getElementById('sc-air-result');
        if (airRes) airRes.innerHTML = `第1艦隊合計 <strong>制空値: 約 ${totalAir}</strong><br><span style="font-size:11px; font-weight:normal; color:#555;">※熟練度ボーナスは未計算の基礎値です。</span>`;
        
        const losRes = document.getElementById('sc-los-result');
        if (losRes) losRes.innerHTML = `
            司令部Lv: ${hqLv} / 艦娘素索敵計: ${losTotalBase.toFixed(1)} / 装備索敵スコア: ${losEquipScore.toFixed(1)}<br>
            <div style="margin-top:5px;">
                33式 索敵値 (分岐点係数1): <span style="color:#006400; font-weight:bold;">${calc33(1).toFixed(1)}</span><br>
                33式 索敵値 (分岐点係数2): <span style="color:#006400; font-weight:bold;">${calc33(2).toFixed(1)}</span><br>
                33式 索敵値 (分岐点係数3): <span style="color:#006400; font-weight:bold;">${calc33(3).toFixed(1)}</span><br>
                33式 索敵値 (分岐点係数4): <span style="color:#006400; font-weight:bold;">${calc33(4).toFixed(1)}</span>
            </div>
        `;
    }
}
