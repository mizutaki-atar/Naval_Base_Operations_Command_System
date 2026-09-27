const KancolleExpTable = [0,0,100,300,600,1000,1500,2100,2800,3600,4500,5500,6600,7800,9100,10500,12000,13600,15300,17100,19000,21000,23100,25300,27600,30000,32500,35100,37800,40600,43500,46500,49600,52800,56100,59500,63000,66600,70300,74100,78000,82000,86100,90300,94600,99000,103500,108100,112800,117600,122500,127500,132700,138100,143700,149500,155500,161700,168100,174700,181500,188500,195800,203400,211300,219500,228000,236800,245900,255300,265000,275000,285400,296200,307400,319000,331000,343400,356200,369400,383000,397000,411500,426500,442000,458000,474500,491500,509000,527000,545500,564500,584500,606500,631500,661500,701500,761500,851500,1000000,1010000,1020000,1030000,1041000,1052000,1063000,1074000,1086000,1098000,1110000,1123000,1136000,1149000,1163000,1177000,1191000,1206000,1221000,1236000,1252000,1268000,1284000,1301000,1318000,1335000,1353000,1371000,1389000,1408000,1427000,1446000,1466000,1486000,1506000,1527000,1548000,1569000,1591000,1613000,1635000,1658000,1681000,1704000,1728000,1752000,1776000,1801000,1826000,1851000,1877000,1903000,1929000,1956000,1983000,2010000,2038000,2066000,2094000,2123000,2152000,2181000,2211000,2241000,2271000,2302000,2333000,2364000,2396000,2428000,2460000,2493000,2526000,2559000,2593000,2627000,2661000,2696000,2731000,2766000,2802000,2838000,2874000,2911000,2948000,2985000,3023000,3061000,3099000,3138000,3177000,3216000,3256000,3296000,3336000,3377000,3418000,3459000,3501000,3543000,3585000,3628000,3671000,3714000,3758000,3802000,3846000,3891000,3936000,3981000,4027000,4073000,4119000,4166000,4213000,4260000,4308000,4356000,4405000,4455000,4515000,4585000,4665000,4755000,4855000,4965000,5085000,5215000,5355000,5505000,5665000,5835000,6015000,6205000,6405000,6615000,6835000,7065000,7305000,7555000,7815000,8085000,8365000,8655000,8955000,9265000,9585000,9915000,10255000,10605000,10965000,11335000,11715000,12105000,12505000,12915000,13335000,13765000,14205000,14655000,15115000,15585000,16065000,16555000,17055000,17565000,18085000,18615000,19155000,19705000,20265000,20835000];

class LevelingSim {
    static init() {
        this.renderTab();
        // populated by app.js when data changes
    }
    
    static renderTab() {
        const tab = document.getElementById('tab12');
        if (!tab) return;
        
        tab.innerHTML = `
            <div class="classic-window" style="margin-bottom:8px;">
                <div class="classic-titlebar">12. 3-2-C レベリングシミュレーター</div>
                <div class="classic-content" style="padding:15px;">
                    <p>育成したい艦娘と、目標レベルを選択してください。3-2-C（1戦撤退）での育成効率と必要資源を計算します。<br>
                    ※ 3-2-Cは、空母の開幕爆撃で敵を殲滅し、デコイ（潜水艦）に攻撃を吸わせながら旗艦を安全に育成する手法です。</p>
                    
                    <div style="display:flex; gap:10px; margin-bottom:15px;">
                        <div style="flex:1;">
                            <label>育成艦 (旗艦):</label><br>
                            <select id="lvl-target-ship" class="classic-select" style="width:100%;" onchange="LevelingSim.update()"></select>
                        </div>
                        <div style="width:100px;">
                            <label>目標レベル:</label><br>
                            <input type="number" id="lvl-target-level" class="classic-input" style="width:100%;" value="99" min="2" max="180" onchange="LevelingSim.update()">
                        </div>
                    </div>
                    
                    <div style="display:flex; gap:10px; margin-bottom:15px;">
                        <div style="flex:1;">
                            <label>随伴艦1 (デコイ潜水艦推奨):</label>
                            <select id="lvl-escort-1" class="classic-select" style="width:100%;" onchange="LevelingSim.update()"><option value="0">なし</option></select>
                        </div>
                        <div style="flex:1;">
                            <label>随伴艦2 (空母推奨):</label>
                            <select id="lvl-escort-2" class="classic-select" style="width:100%;" onchange="LevelingSim.update()"><option value="0">なし</option></select>
                        </div>
                    </div>
                    <div style="display:flex; gap:10px; margin-bottom:15px;">
                        <div style="flex:1;">
                            <label>随伴艦3 (空母推奨):</label>
                            <select id="lvl-escort-3" class="classic-select" style="width:100%;" onchange="LevelingSim.update()"><option value="0">なし</option></select>
                        </div>
                        <div style="flex:1;">
                            <label>随伴艦4 (空母推奨):</label>
                            <select id="lvl-escort-4" class="classic-select" style="width:100%;" onchange="LevelingSim.update()"><option value="0">なし</option></select>
                        </div>
                        <div style="flex:1;">
                            <label>随伴艦5 (空母推奨):</label>
                            <select id="lvl-escort-5" class="classic-select" style="width:100%;" onchange="LevelingSim.update()"><option value="0">なし</option></select>
                        </div>
                    </div>

                    <div style="background-color:#e8f4f8; padding:10px; border:1px solid #b6d4e1;">
                        <h3 style="margin-top:0; border-bottom:1px solid #000;">シミュレーション結果</h3>
                        <div id="lvl-results">計算するには艦隊データを読み込んでください。</div>
                    </div>
                    
                    <div style="margin-top:10px; font-size:12px; color:#555;">
                        ※ 3-2-C（キス島沖1戦目）の基礎経験値は320で計算します。<br>
                        ※ 旗艦MVP・S勝利時の獲得経験値：1152<br>
                        ※ 消費資源は1戦分（最大値の20%）として計算します。ボーキサイトは制空権確保による撃墜を1周10程度と仮定して算出します。
                    </div>
                </div>
            </div>
        `;
    }
    
    static updateView() {
        if (!AppState.userData || !AppState.userData.ships) return;
        
        let html = '<option value="0">選択してください</option>';
        let escortHtml = '<option value="0">なし</option>';
        
        const sorted = [...AppState.userData.ships].sort((a,b) => b.api_lv - a.api_lv);
        
        for (const ship of sorted) {
            const mst = MasterData.Ships[ship.api_ship_id];
            if (!mst) continue;
            
            const name = mst.name;
            const lv = ship.api_lv;
            const typeName = mst.type_name;
            const opt = `<option value="${ship.api_id}">Lv.${lv} ${name} (${typeName})</option>`;
            html += opt;
            escortHtml += opt;
        }
        
        const targetSelect = document.getElementById('lvl-target-ship');
        if (targetSelect && targetSelect.innerHTML.length < 100) targetSelect.innerHTML = html;
        
        for (let i=1; i<=5; i++) {
            const sel = document.getElementById('lvl-escort-' + i);
            if (sel && sel.innerHTML.length < 100) sel.innerHTML = escortHtml;
        }
        
        this.update();
    }
    
    static update() {
        const targetId = parseInt(document.getElementById('lvl-target-ship').value) || 0;
        const targetLv = parseInt(document.getElementById('lvl-target-level').value) || 99;
        const res = document.getElementById('lvl-results');
        
        if (!res) return;
        if (!targetId) {
            res.innerHTML = '計算するには育成艦を選択してください。';
            return;
        }
        if (!AppState.userData || !AppState.userData.ships) return;
        
        const targetShip = AppState.userData.ships.find(s => s.api_id === targetId);
        if (!targetShip) return;
        
        const currentExp = targetShip.api_exp[0];
        const reqExp = KancolleExpTable[targetLv] || 0;
        
        if (currentExp >= reqExp) {
            res.innerHTML = `<span style="color:green; font-weight:bold;">すでに目標レベルに到達しています！</span> (現在の累積経験値: ${currentExp})`;
            return;
        }
        
        const diffExp = reqExp - currentExp;
        const expPerRun = 1152; // 3-2-C S-Rank MVP Flagship
        const runs = Math.ceil(diffExp / expPerRun);
        
        let fuelCost = 0;
        let ammoCost = 0;
        let bauxCost = 0; // rough estimation
        
        const addCost = (ship) => {
            const mst = MasterData.Ships[ship.api_ship_id];
            if (mst) {
                fuelCost += Math.floor((mst.fuel || 0) * 0.20);
                ammoCost += Math.floor((mst.ammo || 0) * 0.20);
                if (mst.stype === 7 || mst.stype === 11) { // CV, CVL
                    bauxCost += 10; // rough guess for 1 battle
                }
            }
        };
        
        addCost(targetShip);
        for (let i=1; i<=5; i++) {
            const eid = parseInt(document.getElementById('lvl-escort-' + i).value) || 0;
            if (eid) {
                const eship = AppState.userData.ships.find(s => s.api_id === eid);
                if (eship) addCost(eship);
            }
        }
        
        const totalFuel = fuelCost * runs;
        const totalAmmo = ammoCost * runs;
        const totalBaux = bauxCost * runs;
        
        res.innerHTML = `
            <table style="width:100%; border-collapse:collapse; margin-top:5px; line-height: 1.8;">
                <tr><td style="width:150px; font-weight:bold;">必要経験値:</td><td>${diffExp.toLocaleString()} (目標: ${reqExp.toLocaleString()} - 現在: ${currentExp.toLocaleString()})</td></tr>
                <tr><td style="font-weight:bold;">必要周回数:</td><td><span style="font-size:16px; color:#b22222; font-weight:bold;">約 ${runs.toLocaleString()} 回</span></td></tr>
                <tr><td style="font-weight:bold;">1周の消費資源:</td><td>燃料 ${fuelCost} / 弾薬 ${ammoCost} / ボーキ ${bauxCost}</td></tr>
                <tr><td style="font-weight:bold;">総消費資源 (概算):</td><td>燃料 ${totalFuel.toLocaleString()} / 弾薬 ${totalAmmo.toLocaleString()} / ボーキ ${totalBaux.toLocaleString()}</td></tr>
            </table>
        `;
    }
}
