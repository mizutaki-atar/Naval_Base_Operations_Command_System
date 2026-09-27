class SpecialCombatSim {
    static init() {
        this.renderTab();
    }
    
    static renderTab() {
        const tab = document.getElementById('tab13');
        if (!tab) return;
        
        tab.innerHTML = `
            <div class="classic-window" style="margin-bottom:8px;">
                <div class="classic-titlebar">13. 航空・索敵・対地戦 シミュレーター</div>
                <div class="classic-content" style="padding:15px; height:calc(100vh - 100px); overflow-y:auto;">
                    <p style="margin-bottom:10px;">
                        第1艦隊（タブ1で編成した艦隊）の「制空値」「索敵値」、および各艦の「対地特効（陸上型への攻撃力）」を計算します。
                    </p>
                    
                    <button class="classic-button" style="width:100%; font-weight:bold; padding:8px; margin-bottom:15px;" onclick="SpecialCombatSim.update()">🔄 現在の第1艦隊で計算・更新する</button>

                    <!-- 航空戦 -->
                    <div style="background-color:#e8f4f8; padding:10px; border:1px solid #b6d4e1; margin-bottom:15px;">
                        <h3 style="margin-top:0; border-bottom:1px solid #000; color:#000080;">✈️ 航空戦・制空値</h3>
                        <div style="font-size:12px; margin-bottom:10px; color:#333;">
                            <strong>【装備の利点】</strong><br>
                            ・<strong>艦上戦闘機</strong>: 制空値を稼ぐ主力。敵の航空攻撃を弱め、弾着観測射撃を可能にする必須装備です。<br>
                            ・<strong>艦上爆撃機</strong>: 開幕攻撃＋砲撃戦での火力要員ですが、一部の強力な敵（陸上型）には攻撃できなくなる特性があります。<br>
                            ・<strong>艦上攻撃機</strong>: 開幕の雷撃ダメージが非常に高く、雑魚散らしに最適です。<br>
                            ・<strong>水上戦闘機</strong>: 空母を編成できない海域でも、巡洋艦などに積んで制空権を争うことができる重要な装備です。
                        </div>
                        <div id="sc-air-result" style="font-size:16px; font-weight:bold; color:#b22222; padding:5px; background:#fff; border:1px inset #ccc;">計算結果がここに表示されます</div>
                    </div>

                    <!-- 索敵値 -->
                    <div style="background-color:#e8f8e8; padding:10px; border:1px solid #b6e1b6; margin-bottom:15px;">
                        <h3 style="margin-top:0; border-bottom:1px solid #000; color:#006400;">📡 索敵値 (33式)</h3>
                        <div style="font-size:12px; margin-bottom:10px; color:#333;">
                            <strong>【装備の利点】</strong><br>
                            ・<strong>水上偵察機</strong>: 索敵値を大きく稼ぐだけでなく、昼戦の「弾着観測射撃」を発動させるためのキー装備です。<br>
                            ・<strong>電探（レーダー）</strong>: 索敵値を底上げしつつ、艦隊全体の命中率を向上させます。うずしおの被害も軽減できます。<br>
                            ・<strong>彩雲（艦上偵察機）</strong>: 空母に積むことで索敵を大きく稼ぎ、「丁字不利」を回避する強力な効果があります。
                        </div>
                        <div id="sc-los-result" style="font-size:14px; font-weight:bold; padding:5px; background:#fff; border:1px inset #ccc;">計算結果がここに表示されます</div>
                    </div>

                    <!-- 陸上戦 -->
                    <div style="background-color:#f8e8e8; padding:10px; border:1px solid #e1b6b6; margin-bottom:15px;">
                        <h3 style="margin-top:0; border-bottom:1px solid #000; color:#8b0000;">🏝️ 対地戦 (陸上型深海棲艦) 特効</h3>
                        <div style="font-size:12px; margin-bottom:10px; color:#333;">
                            <strong>【装備の利点】</strong><br>
                            ・<strong>三式弾</strong>: 重巡や戦艦に積める対地装備。「ソフトスキン型（飛行場姫など）」に対して絶大な倍率（約2.5倍）を誇ります。<br>
                            ・<strong>WG42 (ロケットランチャー)</strong>: 駆逐や軽巡に積める対地装備。複数積むことで効果が倍増します。<br>
                            ・<strong>大発動艇 (八九式中戦車など)</strong>: 「砲台小鬼」や「離島棲姫」など、装甲が硬い相手（ハードスキン）に対して必須級のダメージ源です。<br>
                            ・<strong>特二式内火艇</strong>: 戦車と組み合わせることでシナジー（相乗効果）が発生し、ダメージが爆発的に伸びます。<br>
                            ※陸上型には「雷装値（魚雷の強さ）」が全く効かないため、艦上爆撃機や雷巡などは相性が非常に悪いです。
                        </div>
                        <div id="sc-land-result" style="font-size:13px; padding:5px; background:#fff; border:1px inset #ccc;">計算結果がここに表示されます</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    static update() {
        if (!AppState.simulationFleet || AppState.simulationFleet.length === 0) {
            alert('第1艦隊に艦娘がセットされていません。タブ1で編成を行ってください。');
            return;
        }

        let totalAir = 0;
        let losTotalBase = 0;
        let losEquipScore = 0;
        let landResultsHTML = '<table style="width:100%; border-collapse:collapse;"><tr><th style="border-bottom:1px solid #000; text-align:left;">艦娘</th><th style="border-bottom:1px solid #000;">ソフトスキン(飛行場など)</th><th style="border-bottom:1px solid #000;">砲台小鬼</th><th style="border-bottom:1px solid #000;">離島棲姫</th></tr>';

        AppState.simulationFleet.forEach(fShip => {
            if (!fShip) return;
            const shipData = AppState.userData.ships.find(s => s.api_id === fShip.shipUid);
            if (!shipData) return;
            const mstShip = MasterData.Ships[shipData.api_ship_id];
            if (!mstShip) return;

            let shipLosBase = shipData.api_sakuteki ? shipData.api_sakuteki[0] : 0;
            let shipEquipLos = 0;

            let wgCount = 0;
            let sanshikiCount = 0;
            let tankCount = 0; 
            let kamiCount = 0; 
            let daihatsuCount = 0; 

            fShip.equips.forEach((itemId, idx) => {
                if (itemId === -1 || itemId === 0) return;
                const itemData = AppState.userData.items[itemId] || AppState.userData.items.find(i => i.api_id === itemId);
                if (!itemData) return;
                const mstItem = MasterData.Items[itemData.api_slotitem_id];
                if (!mstItem) return;

                // 索敵
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

                // 制空 (ざっくり)
                if (mstItem.tyku && mstItem.tyku > 0 && shipData.api_onslot && shipData.api_onslot[idx] > 0) {
                    if (mstItem.type && [6,7,8,11,45].includes(mstItem.type[2])) {
                        totalAir += Math.floor(mstItem.tyku * Math.sqrt(shipData.api_onslot[idx]));
                    }
                }

                // 対地
                if (mstItem.name.includes('WG42') || mstItem.name.includes('ロケットランチャー')) wgCount++;
                if (mstItem.name.includes('三式弾')) sanshikiCount++;
                if (mstItem.name.includes('特二式内火艇')) kamiCount++;
                if (mstItem.name.includes('戦車') || mstItem.name.includes('陸戦隊')) tankCount++;
                else if (mstItem.name.includes('大発動艇')) daihatsuCount++;
            });

            if (shipLosBase < 0) shipLosBase = 0;
            losTotalBase += Math.sqrt(shipLosBase);
            losEquipScore += shipEquipLos;

            // 対地シナジー
            let softSkin = 1.0;
            let pillbox = 1.0;
            let island = 1.0;

            if (sanshikiCount > 0) {
                softSkin *= 2.5;
                island *= 1.75;
            }
            if (wgCount > 0) {
                softSkin *= (1.0 + (wgCount * 0.3)); 
                pillbox *= (1.0 + (wgCount * 0.4));
                island *= (1.0 + (wgCount * 0.4));
            }
            if (daihatsuCount > 0) {
                softSkin *= 1.0;
                pillbox *= 1.5;
                island *= 1.5;
            }
            if (tankCount > 0) {
                softSkin *= 1.0;
                pillbox *= 1.8;
                island *= 1.8;
            }
            if (kamiCount > 0) {
                softSkin *= 1.0;
                pillbox *= 2.4;
                island *= 2.4;
            }
            if (tankCount > 0 && kamiCount > 0) {
                pillbox *= 1.5;
                island *= 1.5;
            }

            const formatMulti = (val) => val === 1.0 ? '-' : `<span style="color:red; font-weight:bold;">x${val.toFixed(2)}</span>`;

            landResultsHTML += `<tr>
                <td style="border-bottom:1px dotted #ccc; padding:4px;">Lv.${shipData.api_lv} ${mstShip.name}</td>
                <td style="border-bottom:1px dotted #ccc; text-align:center;">${formatMulti(softSkin)}</td>
                <td style="border-bottom:1px dotted #ccc; text-align:center;">${formatMulti(pillbox)}</td>
                <td style="border-bottom:1px dotted #ccc; text-align:center;">${formatMulti(island)}</td>
            </tr>`;
        });

        landResultsHTML += '</table>';

        const hqLv = (AppState.userData && AppState.userData.basic) ? AppState.userData.basic.api_level : 120;
        const hqPenalty = Math.ceil(0.4 * hqLv);
        const emptySlots = 6 - AppState.simulationFleet.filter(x => x).length;
        const emptyBonus = 2 * emptySlots;

        const calc33 = (coef) => {
            return (losEquipScore * coef) + losTotalBase - hqPenalty + emptyBonus;
        };

        document.getElementById('sc-air-result').innerHTML = `第1艦隊合計 <strong>制空値: 約 ${totalAir}</strong><br><span style="font-size:11px; font-weight:normal; color:#555;">※熟練度ボーナス（+25等）は未計算の基礎値です。</span>`;
        
        document.getElementById('sc-los-result').innerHTML = `
            司令部Lv: ${hqLv} / 艦娘素索敵計: ${losTotalBase.toFixed(1)} / 装備索敵スコア: ${losEquipScore.toFixed(1)}<br>
            <div style="margin-top:5px;">
                33式 索敵値 (分岐点係数1): <span style="color:#006400; font-weight:bold;">${calc33(1).toFixed(1)}</span><br>
                33式 索敵値 (分岐点係数2): <span style="color:#006400; font-weight:bold;">${calc33(2).toFixed(1)}</span><br>
                33式 索敵値 (分岐点係数3): <span style="color:#006400; font-weight:bold;">${calc33(3).toFixed(1)}</span><br>
                33式 索敵値 (分岐点係数4): <span style="color:#006400; font-weight:bold;">${calc33(4).toFixed(1)}</span>
            </div>
        `;

        document.getElementById('sc-land-result').innerHTML = landResultsHTML + `
            <div style="font-size:11px; margin-top:5px; color:#666;">※WG42などは実際には固定ダメージ加算の性質を持ちますが、目安としてシナジー倍率に換算して表示しています。改修値は計算に含まれません。</div>
        `;
    }
}
