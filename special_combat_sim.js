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
                                        [メリット] ソフトスキン(飛行場姫など)に対して2.5倍という絶大な倍率を誇ります。戦艦や重巡に積めるため基礎火力が高い。離島棲姫にも1.75倍の特効があります。<br>
                                        [デメリット] 砲台小鬼には全く特効が乗りません。</li>
                                        <li><span style="color:#000080; font-weight:bold;">WG42 (対地ロケット)</span><br>
                                        [メリット] 全ての陸上型に固定ダメージ(加算)と倍率を与えます。駆逐・軽巡の対地主軸。<br>
                                        [デメリット] これ単体では倍率が低く、特に集積地などには力不足。2積みで真価を発揮します（3個目以降は倍率が伸びないため、迫撃砲や四式噴進砲など別系統と組み合わせるのが有効です）。</li>
                                        <li><span style="color:#000080; font-weight:bold;">大発動艇(八九式中戦車) などの戦車系</span><br>
                                        [メリット] 砲台小鬼や離島に対して高い倍率。後述の内火艇と組み合わせることで爆発的なシナジーを生みます。<br>
                                        [デメリット] 搭載できる艦娘が限られます（特定の大発搭載可能艦のみ）。</li>
                                        <li><span style="color:#000080; font-weight:bold;">特二式内火艇 (カミ車)</span><br>
                                        [メリット] 砲台や離島に対して単体で2.4倍と最強クラスの倍率。潜水艦にも積めます。<br>
                                        [デメリット] 戦車以上に搭載可能艦が限定されます。</li>
                                        <li><span style="color:#000080; font-weight:bold;">徹甲弾</span><br>
                                        [メリット] 砲台小鬼に対して1.85倍の特効。戦艦の昼戦連撃と両立できるのが最大の強み。<br>
                                        [デメリット] ソフトスキン(飛行場姫)には無効です。</li>
                                    </ul>
                                    
                                    <strong>【対地シナジー（相乗効果）の概念】</strong>
                                    <p style="margin:4px 0 10px 0;">
                                        艦これの対地戦において最も重要なのが<strong>「戦車 ＋ 内火艇」のシナジー</strong>です。<br>
                                        大発（戦車）系と内火艇は別カテゴリとして扱われるため、両方積むことでそれぞれの特効倍率がそのまま掛け算（乗算）され、単体積みとは比較にならない大ダメージを出せます。<br>
                                        特に「集積地棲姫」に対しては、「ソフトスキン用の倍率」と「集積地専用の倍率」が二重に掛け算される特殊仕様があるため、<br>
                                        <span style="color:red; font-weight:bold;">WG42 ＋ 戦車 ＋ 内火艇</span> のように積むと、倍率が数十倍に跳ね上がり、昼戦から数千ものオーバーキルダメージを叩き出します。
                                    </p>

                                    <strong>【対地特効に向いた艦娘（メリット・デメリット）】</strong>
                                    <ul style="margin:4px 0 0 20px; padding:0;">
                                        <li><span style="color:#006400; font-weight:bold;">4スロット以上の軽巡・航巡（夕張改二特、能代改二、矢矧改二、最上改二特 など）</span><br>
                                        [メリット] スロット数の多さを活かし「WG42×2 ＋ 戦車 ＋ 内火艇」といった欲張りフルシナジー装備が可能。対地火力は最強クラス。<br>
                                        [デメリット] 大淀やTashkentなどは4スロあっても大発系が積めないため、艦ごとの搭載可否の確認が必須です。</li>
                                        <li><span style="color:#006400; font-weight:bold;">大発・内火艇が両方積める駆逐艦 (Верный、霞改二、満潮改二、朝潮改二丁 など)</span><br>
                                        [メリット] 「戦車＋内火艇」の強烈なシナジーを活かせる対地のエース。イベント海域の対地ボスでは必須級です。<br>
                                        [デメリット] 夜戦連撃（主砲2）と対地シナジーを両立させるにはスロットが足りず、道中の水上艦隊相手には弱くなりがちです。</li>
                                        <li><span style="color:#006400; font-weight:bold;">水上機母艦（日進 など）</span><br>
                                        [メリット] 大発系が積める上に4スロットあるため、昼戦連撃と対地シナジーを両立できる最強の対地要員。<br>
                                        [デメリット] 装甲や回避が低く、ボス到達前に大破しやすいのが弱点です。※同じ4スロ水母でもCommandant Testeは主砲（昼連撃）や内火艇が積めないなど、艦によって制限が異なります。</li>
                                    </ul>
                                </div>
                            </details>

                            <strong>【パズルカスタマイズ】</strong><br>
                            保有している艦娘・装備は「[保有]」マークが付き上部に表示されます。未保有のものも検証のために選択可能です。<br>
                            ※集積地棲姫へのダメージは「キャップ前補正（ソフトスキン倍率＋固定加算）」で攻撃力キャップ計算を行った後、さらに「キャップ後補正（集積地固有倍率）」が乗算されるため爆発的に跳ね上がります。<br><br>
                            
                            <div style="font-size:11px; color:#555; background:#eee; padding:8px; border-radius:4px; border:1px solid #ccc;">
                                <strong>※当シミュレーターの計算根拠および参考文献（注釈）</strong><br>
                                本システムにおける対地特効の倍率・加算値およびシナジーの仕様は、有志のプレイヤーコミュニティ（検証勢）による膨大な実測データに基づき、以下の文献・ツールの計算式を参考・引用して構築されています。<br>
                                <ul style="margin:4px 0 0 15px; padding:0;">
                                    <li><strong>艦隊これくしょん -艦これ- 攻略 Wiki* 「対地攻撃」</strong><br>
                                    (<a href="https://wikiwiki.jp/kancolle/%E5%AF%BE%E5%9C%B0%E6%94%BB%E6%92%83" target="_blank" style="color:#0000ee;">https://wikiwiki.jp/kancolle/対地攻撃</a>)<br>
                                    最も詳細な対地倍率テーブルとシナジーの仕様が検証・集約されている一次情報源です。当システムの乗算仕様やWG42の固定値加算ロジックはこれに準拠しています。</li>

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
        
        // 保有IDセット (文字列としてすべて網羅)
        const ownedShipIds = new Set();
        (AppState.userData.ships || []).forEach(s => {
            if (s.id) ownedShipIds.add(String(s.id));
            if (s.api_ship_id) ownedShipIds.add(String(s.api_ship_id));
        });

        const ownedItemIds = new Set();
        (AppState.userData.items || []).forEach(i => {
            if (i.id) ownedItemIds.add(String(i.id));
            if (i.api_slotitem_id) ownedItemIds.add(String(i.api_slotitem_id));
        });

        // 艦娘リスト作成
        let allShips = Object.entries(MasterData.Ships).map(([k, v]) => Object.assign({ key: k }, v));
        allShips.sort((a,b) => {
            let aOwned = ownedShipIds.has(String(a.key)) || ownedShipIds.has(String(a.id));
            let bOwned = ownedShipIds.has(String(b.key)) || ownedShipIds.has(String(b.id));
            if (aOwned && !bOwned) return -1;
            if (!aOwned && bOwned) return 1;
            return Number(a.key) - Number(b.key);
        });
        
        SpecialCombatSim.allShips = allShips;
        SpecialCombatSim.ownedShipIds = ownedShipIds;

        // 装備リスト作成
        let allItems = Object.entries(MasterData.Items).map(([k, v]) => Object.assign({ key: k }, v));
        allItems.sort((a,b) => {
            let aOwned = ownedItemIds.has(String(a.key)) || ownedItemIds.has(String(a.id));
            let bOwned = ownedItemIds.has(String(b.key)) || ownedItemIds.has(String(b.id));
            if (aOwned && !bOwned) return -1;
            if (!aOwned && bOwned) return 1;
            return Number(a.key) - Number(b.key);
        });
        
        SpecialCombatSim.allItems = allItems;
        SpecialCombatSim.ownedItemIds = ownedItemIds;
    }

    static addPuzzleRow() {
        const container = document.getElementById('land-puzzle-container');
        if (!container) return;
        
        const rowId = 'puzzle-row-' + Date.now() + '-' + Math.floor(Math.random()*1000);
        const html = `
            <div id="${rowId}" style="background:#fff; border:1px solid #ccc; padding:8px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <button class="classic-button puzzle-ship" data-value="" style="width:250px; text-align:left;" onclick="SpecialCombatSim.openShipSelector('${rowId}')">-- 艦娘を選択 --</button>
                    <button class="classic-button" style="color:red; padding:0 8px;" onclick="document.getElementById('${rowId}').remove()">X</button>
                </div>
                <div style="display:flex; gap:5px; margin-bottom:5px;">
                    <button class="classic-button puzzle-equip" data-value="" style="width:140px; text-align:left; font-size:11px;" onclick="SpecialCombatSim.openEquipSelector('${rowId}', 0)">-- 装備なし --</button>
                    <button class="classic-button puzzle-equip" data-value="" style="width:140px; text-align:left; font-size:11px;" onclick="SpecialCombatSim.openEquipSelector('${rowId}', 1)">-- 装備なし --</button>
                    <button class="classic-button puzzle-equip" data-value="" style="width:140px; text-align:left; font-size:11px;" onclick="SpecialCombatSim.openEquipSelector('${rowId}', 2)">-- 装備なし --</button>
                    <button class="classic-button puzzle-equip" data-value="" style="width:140px; text-align:left; font-size:11px;" onclick="SpecialCombatSim.openEquipSelector('${rowId}', 3)">-- 装備なし --</button>
                    <button class="classic-button puzzle-equip" data-value="" style="width:140px; text-align:left; font-size:11px;" onclick="SpecialCombatSim.openEquipSelector('${rowId}', 4)">-- 装備なし --</button>
                </div>
                <div id="${rowId}-result" style="background:#f0f0f0; padding:5px; font-size:12px;">艦娘を選択してください。</div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    }

    static openShipSelector(rowId) {
        const modalId = 'puzzle-ship-modal';
        let modal = document.getElementById(modalId);
        if (modal) modal.remove();

        const html = `
            <div id="${modalId}" style="position:fixed; top:5%; left:20%; width:60%; z-index:9999;">
                <div class="classic-window">
                    <div class="classic-titlebar">
                        <span>艦娘検索</span>
                        <button class="classic-button" style="padding:0 2px; height:16px; line-height:10px;" onclick="document.getElementById('${modalId}').remove()">X</button>
                    </div>
                    <div class="classic-content" style="background-color:#d4d0c8; padding:4px;">
                        <div style="margin-bottom:4px; display:flex; gap:4px; align-items:center;">
                            <input type="text" id="puzzle-ship-search" class="classic-input" placeholder="名前検索..." onkeyup="SpecialCombatSim.updateShipModalList('${rowId}')" style="width:120px;">
                            <select id="puzzle-ship-type" class="classic-input" onchange="SpecialCombatSim.updateShipModalList('${rowId}')">
                                <option value="">全艦種</option>
                                <option value="駆逐">駆逐</option>
                                <option value="軽巡">軽巡/雷巡</option>
                                <option value="重巡">重巡/航巡</option>
                                <option value="戦艦">戦艦</option>
                                <option value="空母">空母(軽・正・装)</option>
                                <option value="水母">水母</option>
                                <option value="潜水">潜水艦</option>
                            </select>
                            <label><input type="checkbox" id="puzzle-ship-owned" onchange="SpecialCombatSim.updateShipModalList('${rowId}')"> 保有のみ</label>
                        </div>
                        <div id="puzzle-ship-list" style="background-color:#ffffff; height:350px; overflow-y:scroll; border:2px inset white;">
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        this.updateShipModalList(rowId);
    }
    
    static updateShipModalList(rowId) {
        const text = document.getElementById('puzzle-ship-search').value.toLowerCase();
        const type = document.getElementById('puzzle-ship-type').value;
        const ownedOnly = document.getElementById('puzzle-ship-owned').checked;
        const container = document.getElementById('puzzle-ship-list');
        
        let filtered = this.allShips.filter(s => {
            if (text && !s.name.toLowerCase().includes(text)) return false;
            if (type && !s.type_name.includes(type)) {
                if (type === '軽巡' && !s.type_name.includes('雷巡') && !s.type_name.includes('練巡')) return false;
                if (type === '空母' && !(s.type_name.includes('空母') || s.type_name.includes('装甲'))) return false;
                if (type !== '軽巡' && type !== '空母' && !s.type_name.includes(type)) return false;
            }
            if (ownedOnly && !this.ownedShipIds.has(String(s.key)) && !this.ownedShipIds.has(String(s.id))) return false;
            return true;
        });
        
        let html = '';
        filtered.forEach(s => {
            const isOwned = this.ownedShipIds.has(String(s.key)) || this.ownedShipIds.has(String(s.id));
            const mark = isOwned ? '<span style="color:blue;">[保有]</span>' : '<span style="color:gray;">[未]</span>';
            html += `<div style="padding:2px 4px; border-bottom:1px solid #eee; cursor:pointer;" onclick="SpecialCombatSim.selectShip('${rowId}', '${s.key}', '${s.name.replace(/'/g, "\\'")}')">${mark} ${s.name} <span style="font-size:10px; color:#888;">(${s.type_name})</span></div>`;
        });
        container.innerHTML = html;
    }
    
    static selectShip(rowId, shipKey, shipName) {
        const row = document.getElementById(rowId);
        if (row) {
            const btn = row.querySelector('.puzzle-ship');
            if (btn) {
                btn.dataset.value = shipKey;
                let shortName = shipName;
                if (shortName.length > 20) shortName = shortName.substring(0, 20) + '...';
                btn.innerText = shortName;
                btn.title = shipName;
            }
            this.calcPuzzleRow(rowId);
        }
        document.getElementById('puzzle-ship-modal').remove();
    }
    
    static openEquipSelector(rowId, eqIndex) {
        const modalId = 'puzzle-equip-modal';
        let modal = document.getElementById(modalId);
        if (modal) modal.remove();

        const html = `
            <div id="${modalId}" style="position:fixed; top:10%; left:25%; width:50%; z-index:9999;">
                <div class="classic-window">
                    <div class="classic-titlebar">
                        <span>装備検索</span>
                        <button class="classic-button" style="padding:0 2px; height:16px; line-height:10px;" onclick="document.getElementById('${modalId}').remove()">X</button>
                    </div>
                    <div class="classic-content" style="background-color:#d4d0c8; padding:4px;">
                        <div style="margin-bottom:4px; display:flex; gap:4px; align-items:center;">
                            <input type="text" id="puzzle-equip-search" class="classic-input" placeholder="名前検索..." onkeyup="SpecialCombatSim.updateEquipModalList('${rowId}', ${eqIndex})" style="width:120px;">
                            <select id="puzzle-equip-type" class="classic-input" onchange="SpecialCombatSim.updateEquipModalList('${rowId}', ${eqIndex})">
                                <option value="">全カテゴリ</option>
                                <option value="主砲">主砲</option>
                                <option value="魚雷">魚雷</option>
                                <option value="機銃">機銃</option>
                                <option value="電探">電探</option>
                                <option value="水上機">水上機</option>
                                <option value="艦載機">艦載機</option>
                                <option value="対地">対地(ロケット/戦車/内火艇)</option>
                                <option value="その他">その他</option>
                            </select>
                            <label><input type="checkbox" id="puzzle-equip-owned" onchange="SpecialCombatSim.updateEquipModalList('${rowId}', ${eqIndex})"> 保有のみ</label>
                        </div>
                        <div id="puzzle-equip-list" style="background-color:#ffffff; height:350px; overflow-y:scroll; border:2px inset white;">
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        this.updateEquipModalList(rowId, eqIndex);
    }
    
    static updateEquipModalList(rowId, eqIndex) {
        const text = document.getElementById('puzzle-equip-search').value.toLowerCase();
        const type = document.getElementById('puzzle-equip-type').value;
        const ownedOnly = document.getElementById('puzzle-equip-owned').checked;
        const container = document.getElementById('puzzle-equip-list');
        
        let filtered = this.allItems.filter(i => {
            if (text && !i.name.toLowerCase().includes(text)) return false;
            if (type) {
                const typeName = MasterData.EquipTypes[i.type?.[2]]?.name || "";
                if (type === '主砲' && !typeName.includes('主砲')) return false;
                if (type === '魚雷' && !typeName.includes('魚雷') && !typeName.includes('潜航艇')) return false;
                if (type === '機銃' && !typeName.includes('機銃')) return false;
                if (type === '電探' && !typeName.includes('電探')) return false;
                if (type === '水上機' && !typeName.includes('水上')) return false;
                if (type === '艦載機' && !(typeName.includes('艦戦') || typeName.includes('艦爆') || typeName.includes('艦攻') || typeName.includes('艦偵'))) return false;
                if (type === '対地') {
                    if (!i.name.includes('WG42') && !i.name.includes('迫撃砲') && !i.name.includes('戦車') && !i.name.includes('内火艇') && !i.name.includes('陸戦隊') && !i.name.includes('噴進砲')) return false;
                }
                if (type === 'その他') {
                    if (typeName.includes('主砲') || typeName.includes('魚雷') || typeName.includes('機銃') || typeName.includes('電探') || typeName.includes('水上') || typeName.includes('艦戦') || typeName.includes('艦爆') || typeName.includes('艦攻')) return false;
                }
            }
            if (ownedOnly && !this.ownedItemIds.has(String(i.key)) && !this.ownedItemIds.has(String(i.id))) return false;
            return true;
        });
        
        let html = `<div style="padding:2px 4px; border-bottom:1px solid #eee; cursor:pointer;" onclick="SpecialCombatSim.selectEquip('${rowId}', ${eqIndex}, '', '-- 装備なし --')"><span style="color:gray;">[外す]</span> -- 装備なし --</div>`;
        filtered.forEach(i => {
            const isOwned = this.ownedItemIds.has(String(i.key)) || this.ownedItemIds.has(String(i.id));
            const mark = isOwned ? '<span style="color:blue;">[保有]</span>' : '<span style="color:gray;">[未]</span>';
            const typeName = MasterData.EquipTypes[i.type?.[2]]?.name || "不明";
            html += `<div style="padding:2px 4px; border-bottom:1px solid #eee; cursor:pointer;" onclick="SpecialCombatSim.selectEquip('${rowId}', ${eqIndex}, '${i.key}', '${i.name.replace(/'/g, "\\'")}')">${mark} ${i.name} <span style="font-size:10px; color:#888;">(${typeName})</span></div>`;
        });
        container.innerHTML = html;
    }
    
    static selectEquip(rowId, eqIndex, eqKey, eqName) {
        const row = document.getElementById(rowId);
        if (row) {
            const btns = row.querySelectorAll('.puzzle-equip');
            if (btns[eqIndex]) {
                btns[eqIndex].dataset.value = eqKey;
                let shortName = eqName;
                if (shortName.length > 10) shortName = shortName.substring(0, 10) + '...';
                btns[eqIndex].innerText = shortName;
                btns[eqIndex].title = eqName;
            }
            this.calcPuzzleRow(rowId);
        }
        document.getElementById('puzzle-equip-modal').remove();
    }

    static calcPuzzleRow(rowId) {
        const row = document.getElementById(rowId);
        const resDiv = document.getElementById(rowId + '-result');
        if (!row || !resDiv) return;

        const shipBtn = row.querySelector('.puzzle-ship');
        const shipId = shipBtn.value || shipBtn.dataset.value;
        if (!shipId) {
            resDiv.innerHTML = '艦娘を選択してください。';
            return;
        }

        let wgCount = 0;
        let mortarCount = 0;
        let mortarConcCount = 0; // 迫撃砲集中
        let sanshikiCount = 0;
        let apShellCount = 0;
        let tankCount = 0; 
        let kamiCount = 0; 
        let daihatsuCount = 0; 
        let seaplaneBomberCount = 0;

        const equips = row.querySelectorAll('.puzzle-equip');
        equips.forEach(eq => {
            const eid = eq.value || eq.dataset.value;
            if (!eid) return;
            const mstItem = MasterData.Items[eid];
            if (!mstItem) return;

            const n = mstItem.name;
            if (n.includes('WG42')) wgCount++;
            else if (n.includes('対地噴進砲') || (n.includes('迫撃砲') && n.includes('集中'))) mortarConcCount++;
            else if (n.includes('迫撃砲')) mortarCount++;
            else if (n.includes('三式弾')) sanshikiCount++;
            else if (n.includes('徹甲弾')) apShellCount++;
            else if (n.includes('特二式内火艇')) kamiCount++;
            else if (n.includes('戦車') || n.includes('陸戦隊') || n.includes('M4A1') || n.includes('チハ')) tankCount++;
            else if (n.includes('大発動艇') || n.includes('武装大発')) daihatsuCount++; 
            
            if (mstItem.type && (mstItem.type[2] === 11)) seaplaneBomberCount++; 
        });

        // Wiki準拠 テーブル構造: キャップ前(Pre) と キャップ後(Post)
        let softPre = 1.0, softAdd = 0;
        let pillPre = 1.0, pillAdd = 0;
        let islPre = 1.0,  islAdd = 0;
        
        let depPost = 1.0; 

        // --- 三式弾 ---
        if (sanshikiCount > 0) {
            softPre *= 2.5;
            pillPre *= 1.0;
            islPre *= 1.75;
        }
        
        // --- 徹甲弾 ---
        if (apShellCount > 0) {
            softPre *= 1.0;
            pillPre *= 1.85;
            islPre *= 1.0;
        }

        // --- 水上爆撃機 ---
        if (seaplaneBomberCount > 0) {
            softPre *= 1.2;
            pillPre *= 1.5;
            islPre *= 1.0; 
        }

        // --- ロケットランチャー (WG42) ---
        if (wgCount === 1) {
            softPre *= 1.25; softAdd += 75;
            pillPre *= 1.6;  pillAdd += 75;
            islPre *= 1.4;   islAdd += 75;
            depPost *= 1.25;
        } else if (wgCount >= 2) {
            softPre *= 1.625; softAdd += 110;
            pillPre *= 2.56;  pillAdd += 110;
            islPre *= 2.1;    islAdd += 110;
            depPost *= 1.625;
        }

        // --- 迫撃砲 ---
        if (mortarCount === 1) {
            softPre *= 1.2; softAdd += 30;
            pillPre *= 1.3; pillAdd += 30;
            islPre *= 1.2;  islAdd += 30;
            depPost *= 1.2;
        } else if (mortarCount >= 2) {
            softPre *= 1.5; softAdd += 55;
            pillPre *= 1.82; pillAdd += 55;
            islPre *= 1.68; islAdd += 55;
            depPost *= 1.5;
        }

        // --- 迫撃砲集中 ---
        if (mortarConcCount === 1) {
            softPre *= 1.25; softAdd += 55;
            pillPre *= 1.5;  pillAdd += 55;
            islPre *= 1.3;   islAdd += 55;
            depPost *= 1.25;
        } else if (mortarConcCount >= 2) {
            softPre *= 1.625; softAdd += 115;
            pillPre *= 2.55;  pillAdd += 115;
            islPre *= 2.08;   islAdd += 115;
            depPost *= 1.625;
        }

        // --- 大発動艇 (通常大発等) ---
        if (daihatsuCount > 0 && tankCount === 0) {
            softPre *= 1.0; 
            pillPre *= 1.8;
            islPre *= 1.8;
            depPost *= 1.7; 
        }

        // --- 陸戦隊 (戦車) ---
        if (tankCount > 0) {
            softPre *= 1.0; 
            pillPre *= 2.4; 
            islPre *= 2.8;
            depPost *= 1.3; 
        }

        // --- 内火艇 ---
        if (kamiCount > 0) {
            softPre *= 1.0;
            pillPre *= 2.4;
            islPre *= 2.4;
            depPost *= 1.7;
        }

        // --- 上陸用舟艇のシナジー ---
        // (個別の倍率が乗算されるため、特有の一律シナジー倍率は撤廃)

        const formatResult = (multi, add, postMulti = 1.0) => {
            if (multi === 1.0 && add === 0 && postMulti === 1.0) return '-';
            let txt = '';
            
            let preTxt = '';
            if (multi !== 1.0) preTxt += `<span style="color:red; font-weight:bold;">x${multi.toFixed(2)}</span>`;
            if (add > 0) preTxt += ` <span style="color:blue;">(+${add})</span>`;
            
            if (postMulti !== 1.0) {
                if (preTxt) txt = `[前] ${preTxt}<br>[後] <span style="color:#d97700; font-weight:bold;">x${postMulti.toFixed(2)}</span>`;
                else txt = `[後] <span style="color:#d97700; font-weight:bold;">x${postMulti.toFixed(2)}</span>`;
            } else {
                txt = preTxt || '-';
            }
            return txt;
        };

        resDiv.innerHTML = `
            <table class="classic-table" style="width:100%; border-collapse:collapse; margin-top:5px; text-align:center;">
                <tr style="background:#ddd;">
                    <th style="border-bottom:1px solid #ccc; width:25%;">ソフトスキン<br>(飛行場姫)</th>
                    <th style="border-bottom:1px solid #ccc; width:25%;">砲台小鬼</th>
                    <th style="border-bottom:1px solid #ccc; width:25%;">離島棲姫</th>
                    <th style="border-bottom:1px solid #ccc; width:25%;">集積地棲姫</th>
                </tr>
                <tr>
                    <td>${formatResult(softPre, softAdd)}</td>
                    <td>${formatResult(pillPre, pillAdd)}</td>
                    <td>${formatResult(islPre, islAdd)}</td>
                    <td>${formatResult(softPre, softAdd, depPost)}</td>
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
        // データロード完了後、または同期完了後に呼ばれるので、保有状況を再生成する
        this.initPuzzleData();

        // 既にレンダリング済みのパズルドロップダウンがあれば更新する
        document.querySelectorAll('.puzzle-ship').forEach(sel => {
            const val = sel.value;
            sel.innerHTML = this.shipOptionsHTML;
            sel.value = val;
        });
        document.querySelectorAll('.puzzle-equip').forEach(sel => {
            const val = sel.value;
            sel.innerHTML = this.itemOptionsHTML;
            sel.value = val;
        });

        // 航空と索敵の更新
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
