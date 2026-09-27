const STAT_KEYS = [
    { key: 'hp', label: '耐久' }, { key: 'armor', label: '装甲' }, { key: 'evade', label: '回避' },
    { key: 'fire', label: '火力' }, { key: 'torp', label: '雷装' }, { key: 'aa', label: '対空' },
    { key: 'asw', label: '対潜' }, { key: 'los', label: '索敵' }, { key: 'luck', label: '運' },
    { key: 'speed', label: '速力' }, { key: 'range', label: '射程' }
];

function calcShipTotalStats(slotData) {
    let stats = { hp:0, armor:0, evade:0, fire:0, torp:0, aa:0, asw:0, eqAsw:0, aswGearCount:0, los:0, luck:0, speed:0, range:0, bomb:0 };
    if (!slotData) return stats;
    
    const ship = AppState.userData.ships.find(x => x.uid === slotData.shipUid);
    if (!ship) return stats;
    const master = MasterData.Ships[ship.id] || {};

    // 艦娘素ステータス取得 (APIデータ優先、なければマスターデータ、それでもなければ艦種から推測)
    const typeName = master.type_name || "不明";
    let defaultHp = 40;
    if (typeName.includes('戦艦')) defaultHp = 90;
    else if (typeName.includes('空母')) defaultHp = 80;
    else if (typeName.includes('重巡') || typeName.includes('航巡')) defaultHp = 60;
    else if (typeName.includes('軽巡') || typeName.includes('雷巡')) defaultHp = 45;
    else if (typeName.includes('駆逐') || typeName.includes('海防')) defaultHp = 30;
    else if (typeName.includes('潜水')) defaultHp = 15;

    stats.hp = ship.api_maxhp || ship.hp || master.hp || master.max_hp || defaultHp;
    stats.armor = (ship.api_soukou && ship.api_soukou[0]) || ship.armor || master.armor || 30;
    stats.evade = (ship.api_kaihi && ship.api_kaihi[0]) || ship.evade || master.evade || 40;
    stats.fire = (ship.api_karyoku && ship.api_karyoku[0]) || ship.fire || master.fire || 30;
    stats.torp = (ship.api_raisou && ship.api_raisou[0]) || ship.torp || master.torp || 0;
    stats.aa = (ship.api_taiku && ship.api_taiku[0]) || ship.aa || master.aa || 20;
    stats.asw = (ship.api_taisen && ship.api_taisen[0]) || ship.asw || master.asw || 20;
    stats.los = (ship.api_sakuteki && ship.api_sakuteki[0]) || ship.los || master.los || 20;
    stats.luck = (ship.api_lucky && ship.api_lucky[0]) || ship.luck || master.luck || 10;
    stats.speed = ship.api_soku || ship.speed || master.speed || 10;
    stats.range = ship.api_leng || ship.range || master.range || 1;

    // 装備ステータス加算
    for (let eqUid of (slotData.equips || [])) {
        if (eqUid === -1) continue;
        const item = AppState.userData.items.find(x => x.uid === eqUid);
        if (!item) continue;
        const im = MasterData.Items[item.id] || {};
        
        stats.armor += im.armor || 0;
        stats.evade += im.evade || 0;
        stats.fire += im.fire || 0;
        stats.torp += im.torp || 0;
        stats.aa += im.aa || 0;
        stats.asw += im.asw || 0;
        stats.eqAsw += im.asw || 0;
        
        if (im.type && Array.isArray(im.type) && im.type.length >= 3) {
            let typeId = im.type[2];
            if (typeId === 14 || typeId === 15 || typeId === 40) {
                stats.aswGearCount += 1;
            }
        } else {
            let tName = im.typeName || "";
            if (tName === 'ソナー' || tName === '大型ソナー' || tName === '爆雷') {
                stats.aswGearCount += 1;
            }
        }

        stats.los += im.los || 0;
        stats.luck += im.luck || 0;
        stats.bomb += im.bomb || im.api_baku || 0;
        
    // 速度と射程は加算ではなく上書き・最大値等の特別な処理があるが簡易化
    if (im.range && im.range > stats.range) stats.range = im.range;
}

// シナジー評価
if (window.currentSynergyEngine) {
    const eqObjs = (slotData.equips || [])
        .map(uid => AppState.userData.items.find(x => x.uid === uid))
        .filter(x => x)
        .map(x => MasterData.Items[x.id])
        .filter(m => m);
        
    const syn = window.currentSynergyEngine.evaluate(master, eqObjs);
    if (syn && syn.bonuses) {
        stats.fire += syn.bonuses.fire || 0;
        stats.torp += syn.bonuses.torp || 0;
        stats.aa += syn.bonuses.aa || 0;
        stats.armor += syn.bonuses.armor || 0;
        stats.evade += syn.bonuses.evade || 0;
        stats.asw += syn.bonuses.asw || 0;
    }
    if (syn && syn.multipliers) {
        stats.multipliers = syn.multipliers;
    }
}
return stats;
}

function renderFleetEditor() {
    const container = document.getElementById('fleet1-container');
    if (!container) return;
    
    if (!AppState.userData.ships || AppState.userData.ships.length === 0) {
        container.innerHTML = '<div class="text-gray-500 text-sm">艦娘データがありません。「デモデータ一括ロード」を押してください。</div>';
        return;
    }

    let html = '';
    for (let i = 0; i < 6; i++) {
        const slot = AppState.simulationFleet[i];
        
        if (!slot) {
            html += `
                <div class="classic-inset" style="margin-bottom:4px; display:flex; gap:8px; align-items:center; background-color:#d4d0c8;">
                    <div style="font-weight:bold;">${i+1}</div>
                    <div style="flex:1;">（未編成）</div>
                    <button class="classic-button" onclick="openShipSelector(${i})">艦娘を選択</button>
                </div>`;
            continue;
        }
        
        const s = AppState.userData.ships.find(x => x.uid === slot.shipUid);
        if (!s) {
            html += `<div class="bg-red-900 p-2 mb-2 text-white">データエラー (UID: ${slot.shipUid})</div>`;
            continue;
        }

        const master = MasterData.Ships[s.id] || { type_name: '不明' };
        
        // 装備枠
        let equipHtml = '<div style="margin-top:4px;">';
        for (let eqIdx = 0; eqIdx < 4; eqIdx++) {
            const itemUid = slot.equips[eqIdx] || -1;
            let itemName = "（空き）";
            if (itemUid !== -1) {
                const item = AppState.userData.items.find(x => x.uid === itemUid);
                if (item) {
                    const im = MasterData.Items[item.id];
                    itemName = im ? im.name : `不明装備(${item.id})`;
                }
            }
            equipHtml += `
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #808080; padding:2px 0;">
                    <span style="font-size:10px;">${itemName}</span>
                    <button class="classic-button" style="font-size:10px; padding:0 4px;" onclick="openEquipSelector(${i}, ${eqIdx})">変更</button>
                </div>
            `;
        }
        equipHtml += '</div>';

        // --- シナジー判定 ---
        const st = calcShipTotalStats(slot);
        let synergyHtml = '';
        if (window.currentSynergyEngine) {
            const eqObjs = slot.equips.map(uid => AppState.userData.items.find(x => x.uid === uid))
                                      .filter(x => x)
                                      .map(x => MasterData.Items[x.id])
                                      .filter(m => m);
            const syn = window.currentSynergyEngine.evaluate(master, eqObjs);
            if (syn.badges && syn.badges.length > 0) {
                synergyHtml = `<div style="font-size:10px; margin-top:2px;">`;
                syn.badges.forEach(b => {
                    synergyHtml += `<span style="display:inline-block; background-color:#ffd700; color:#000; padding:1px 4px; border:1px solid #888; margin-right:4px; font-weight:bold;">✨ ${b}</span>`;
                });
                synergyHtml += `</div>`;
            }
        }

        // --- 艦娘ステータスUI ---
        let statHtml = `
            <div style="font-size:10px; background:#ffffff; border:1px solid #808080; padding:2px; margin-top:4px; line-height:1.2;">
                HP:${st.hp} 火:${st.fire} 雷:${st.torp} 空:${st.aa} 甲:${st.armor} 潜:${st.asw} 避:${st.evade} 索:${st.los} 運:${st.luck} 速:${st.speed >= 10 ? '高速' : '低速'} 射:${['無','短','中','長','超長'][Math.min(st.range,4)] || '無'}
            </div>
        `;

        html += `
            <div class="classic-inset" style="margin-bottom:4px; background-color:#d4d0c8;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #808080; padding-bottom:2px;">
                    <div>
                        <span style="font-weight:bold;">${i+1}.</span> 
                        <span style="font-size:10px;">[${master.type_name}]</span>
                        <span style="font-weight:bold;">${s.name}</span>
                        <span style="font-size:10px;">Lv ${s.lv}</span>
                    </div>
                    <div>
                        <button class="classic-button" onclick="openShipSelector(${i})">変更</button>
                        <button class="classic-button" onclick="removeShipFromFleet(${i})">外す</button>
                    </div>
                </div>
                ${equipHtml}
                ${synergyHtml}
                ${statHtml}
            </div>`;
    }

    // --- 艦隊総合力の計算と表示 ---
    let total = { hp:0, fire:0, torp:0, aa:0, armor:0, asw:0, evade:0, los:0, airPower:0, f33Los:0 };
    let shipCount = 0;
    
    // 33式索敵値用変数
    let sumShipBaseLos = 0;
    let sumEquipLos = 0;

    for (let i = 0; i < 6; i++) {
        if (!AppState.simulationFleet[i]) continue;
        shipCount++;
        const st = calcShipTotalStats(AppState.simulationFleet[i]);
        total.hp += st.hp; total.fire += st.fire; total.torp += st.torp;
        total.aa += st.aa; total.armor += st.armor; total.asw += st.asw;
        total.evade += st.evade; total.los += st.los;
        
        let slotData = AppState.simulationFleet[i];
        let userShip = AppState.userData.ships.find(x => x.uid === slotData.shipUid);
        let masterShip = userShip ? MasterData.Ships[userShip.id] : null;
        let slotCaps = (masterShip && masterShip.slot_cap) ? masterShip.slot_cap : [];
        let equips = slotData.equips || [];
        
        // 33式用: 艦娘の素索敵値を計算 (総索敵 - 装備索敵)
        let equipLosTotal = 0;
        
        for (let eqIdx = 0; eqIdx < equips.length; eqIdx++) {
            let eqUid = equips[eqIdx];
            if (eqUid === -1) continue;
            const item = AppState.userData.items.find(x => x.uid === eqUid);
            if (!item) continue;
            const im = MasterData.Items[item.id] || {};
            
            if (im.los) {
                equipLosTotal += im.los;
                // 33式 装備係数 (簡易)
                let mod = 0.6; // デフォルト (電探、艦爆など)
                if (im.type) {
                    let typeId = im.type[2];
                    if (typeId === 10) mod = 1.0; // 艦上偵察機
                    else if (typeId === 11) mod = 0.8; // 艦上攻撃機
                    else if (typeId === 17) mod = 1.2; // 水上偵察機
                    else if (typeId === 18) mod = 1.1; // 水上爆撃機
                }
                // 改修ボーナス (索敵改修は複雑なのでここでは省略または簡易化)
                sumEquipLos += im.los * mod;
            }
        }
        
        let baseLos = st.los - equipLosTotal;
        if (baseLos > 0) {
            sumShipBaseLos += Math.sqrt(baseLos);
        }
        
        // --- 制空権シミュレータ計算 (kc-web / Wiki準拠) ---
        // 制空値 = [ (対空値 + 改修ボーナス) × √(搭載数) ] + 熟練度ボーナス
        let shipAir = 0;
        for (let eqIdx = 0; eqIdx < equips.length; eqIdx++) {
            let eqUid = equips[eqIdx];
            if (eqUid === -1) continue;
            const item = AppState.userData.items.find(x => x.uid === eqUid);
            if (!item) continue;
            const im = MasterData.Items[item.id] || {};
            // 艦戦(6), 艦爆(7), 艦攻(8), 水爆(11), 局戦(47), 水戦(45) 等
            if (im.type && [6,7,8,11,41,45,47,57,58,59].includes(im.type[2])) {
                let cap = slotCaps.length > eqIdx ? slotCaps[eqIdx] : 0;
                if (cap > 0) {
                    let aa = im.aa || 0;
                    // 改修ボーナス (簡易: 艦戦等は0.2*★)
                    let star = item.level || 0;
                    let starBonus = 0;
                    if (im.type[2] === 6 || im.type[2] === 45) starBonus = 0.2 * star;
                    else if (im.type[2] === 7) starBonus = 0.25 * star;
                    
                    let baseAir = Math.floor((aa + starBonus) * Math.sqrt(cap));
                    
                    // 熟練度ボーナス (alv: 0~7)
                    let alv = item.alv || 0;
                    let profBonus = 0;
                    if (alv > 0) {
                        // 艦戦・水戦・局戦 (6, 45, 47) の場合、alv7で+25
                        if ([6, 45, 47].includes(im.type[2])) {
                            const profTable = [0, 0, 2, 5, 9, 14, 14, 25];
                            profBonus = profTable[alv] || 0;
                        } 
                        // 艦爆・水爆等の場合、alv7で+3程度
                        else if ([7, 8, 11].includes(im.type[2])) {
                            const profTable = [0, 0, 0, 0, 1, 1, 2, 3];
                            profBonus = profTable[alv] || 0;
                        }
                    }
                    shipAir += baseAir + profBonus;
                }
            }
        }
        total.airPower += shipAir;
    }

    // 司令部レベルを120と仮定して33式索敵値を算出 (分岐点係数1)
    total.f33Los = sumShipBaseLos + sumEquipLos - Math.ceil(0.4 * 120) + 2 * (6 - shipCount);
    total.f33Los = Math.floor(total.f33Los * 100) / 100; // 小数第2位まで

    AppState.currentFleetTotal = total;

    html += `
        <div class="classic-window" style="margin-top:8px;">
            <div class="classic-titlebar">艦隊総合戦力</div>
            <div class="classic-content" style="background-color:#ffffff; font-size:10px;">
                <table class="classic-table" style="text-align:center;">
                    <tr>
                        <th>総耐久</th><th>総火力</th><th>総雷装</th><th>総対空</th>
                    </tr>
                    <tr>
                        <td>${total.hp}</td><td>${total.fire}</td><td>${total.torp}</td><td>${total.aa}</td>
                    </tr>
                    <tr>
                        <th>総装甲</th><th>総対潜</th><th>索敵(33式)</th><th>制空値</th>
                    </tr>
                    <tr>
                        <td>${total.armor}</td><td>${total.asw}</td><td><span style="color:purple; font-weight:bold;">${total.f33Los}</span><span style="font-size:8px;">(素${total.los})</span></td><td style="color:blue; font-weight:bold;">${total.airPower}</td>
                    </tr>
                </table>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function removeShipFromFleet(index) {
    AppState.simulationFleet[index] = null;
    // 間を詰める
    AppState.simulationFleet = AppState.simulationFleet.filter(Boolean);
    while (AppState.simulationFleet.length < 6) AppState.simulationFleet.push(null);
    renderFleetEditor();
    renderSimNodes(); // 再シミュレーション
}


window._currentShipFleetIndex = null;
function openShipSelector(fleetIndex) {
    window._currentShipFleetIndex = fleetIndex;
    const modalId = 'ship-selector-modal';
    let modal = document.getElementById(modalId);
    if (modal) modal.remove();

    const html = `
        <div id="${modalId}" style="position:fixed; top:5%; left:20%; width:60%; z-index:9999;">
            <div class="classic-window">
                <div class="classic-titlebar">
                    <span>艦娘を選択 (${fleetIndex + 1}隻目)</span>
                    <button class="classic-button" style="padding:0 2px; height:16px; line-height:10px;" onclick="document.getElementById('${modalId}').remove()">X</button>
                </div>
                <div class="classic-content" style="background-color:#d4d0c8; padding:4px;">
                    <div style="margin-bottom:4px; display:flex; gap:4px; align-items:center;">
                        <input type="text" id="ship-search-text" class="classic-input" placeholder="名前検索..." onkeyup="updateShipList()" style="width:100px;">
                        <select id="ship-filter-type" class="classic-input" onchange="updateShipList()">
                            <option value="">全艦種</option>
                            <option value="駆逐">駆逐</option>
                            <option value="軽巡">軽巡/雷巡</option>
                            <option value="重巡">重巡/航巡</option>
                            <option value="戦艦">戦艦</option>
                            <option value="空母">空母(軽・正・装)</option>
                            <option value="潜水">潜水艦</option>
                            <option value="海防">海防艦</option>
                        </select>
                        <select id="ship-sort-key" class="classic-input" onchange="updateShipList()">
                            <option value="lv_desc">Lv(降順)</option>
                            <option value="lv_asc">Lv(昇順)</option>
                            <option value="name">名前順</option>
                        </select>
                    </div>
                    <div id="ship-list-container" style="background-color:#ffffff; height:350px; overflow-y:scroll; border:2px inset white;">
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    updateShipList();
}

function updateShipList() {
    const text = document.getElementById('ship-search-text').value.toLowerCase();
    const typeFilter = document.getElementById('ship-filter-type').value;
    const sortKey = document.getElementById('ship-sort-key').value;
    const fleetIndex = window._currentShipFleetIndex;

    let ships = AppState.userData.ships.slice();
    

    ships = ships.filter(s => {
        // マスターから探す
        const m = MasterData.Ships[s.id] || {};
        const isSet = AppState.simulationFleet.some(f => f && f.shipUid === s.uid);
        if (isSet) return false;

        if (text && !s.name.toLowerCase().includes(text)) return false;

        if (typeFilter) {
            // 艦種名の決定ロジック強化
            let t = m.type_name || '';
            if (!t && s.api_stype) {
                t = MasterData.Stype[s.api_stype] || '';
            }
            if (!t) {
                const n = s.name || '';
                if (['択捉','松輪','佐渡','対馬','福江','平戸','御蔵','倉橋','屋代','海防','日振','大東','昭南','伊良湖','間宮','稲木','八丈','石垣','鵜来','第四号','第二十二号','第三十号','神蔵'].some(x => n.includes(x))) t = '海防艦';
                else if (n.includes('伊') || n.includes('呂') || n.includes('U-')) t = '潜水艦';
                else if (n.includes('改') || n.length >= 2) t = '駆逐'; // 超強引なフォールバック
            }

            if (typeFilter === '軽巡' && !t.includes('軽巡') && !t.includes('雷巡')) return false;
            if (typeFilter === '重巡' && !t.includes('重巡') && !t.includes('航巡')) return false;
            if (typeFilter === '空母' && !t.includes('空母')) return false;
            if (typeFilter === '潜水' && !t.includes('潜水')) return false;
            if (['駆逐','戦艦','海防'].includes(typeFilter) && !t.includes(typeFilter)) return false;
        }
        return true;
    });

    ships.sort((a, b) => {

        if (sortKey === 'lv_desc') return b.lv - a.lv;
        if (sortKey === 'lv_asc') return a.lv - b.lv;
        if (sortKey === 'name') return a.name.localeCompare(b.name);
        return 0;
    });

    let listHtml = '';
    ships.forEach(s => {
        const m = MasterData.Ships[s.id] || { type_name: '?' };
        listHtml += `
            <div style="border-bottom:1px solid #808080; padding:2px; cursor:pointer;" onmouseover="this.style.backgroundColor='#000080'; this.style.color='white';" onmouseout="this.style.backgroundColor=''; this.style.color='';" onclick="selectShipForFleet(${fleetIndex}, ${s.uid})">
                <span style="font-size:10px;">[${m.type_name}]</span>
                <span style="font-weight:bold;">${s.name}</span>
                <span style="float:right; font-size:10px;">Lv ${s.lv}</span>
            </div>
        `;
    });

    document.getElementById('ship-list-container').innerHTML = listHtml;
}

function selectShipForFleet(fleetIndex, shipUid) {
    const s = AppState.userData.ships.find(x => x.uid === shipUid);
    if (s) {
        AppState.simulationFleet[fleetIndex] = {
            shipUid: s.uid,
            equips: s.slot ? [...s.slot] : []
        };
    }
    document.getElementById('ship-selector-modal').remove();
    renderFleetEditor();
    renderSimNodes().then(() => {
        const btnRun = document.getElementById('btn-run-sim');
        if (btnRun) btnRun.click();
    });
}


window._currentEquipFleetIndex = null;
window._currentEquipSlotIndex = null;
window._currentEquipListRaw = [];

function openEquipSelector(fleetIndex, slotIndex) {
    window._currentEquipFleetIndex = fleetIndex;
    window._currentEquipSlotIndex = slotIndex;
    const modalId = 'equip-selector-modal';
    let modal = document.getElementById(modalId);
    if (modal) modal.remove();

    const slotData = AppState.simulationFleet[fleetIndex];
    if (!slotData) return;
    const ship = AppState.userData.ships.find(x => x.uid === slotData.shipUid);
    const shipMaster = ship ? MasterData.Ships[ship.id] : null;
    let sType = shipMaster ? shipMaster.type_name : '';
    let sName = shipMaster ? shipMaster.name : (ship ? (ship.name || ship.api_name || '') : '');

    if (!sType && sName) {
        if (['択捉','松輪','佐渡','対馬','福江','平戸','御蔵','倉橋','屋代','海防','日振','大東','昭南','伊良湖','間宮'].some(n=>sName.includes(n))) sType = '海防艦';
        else if (sName.includes('伊')) sType = '潜水艦';
        else if (sName.includes('駆逐')) sType = '駆逐';
    }

    function canEquip(m, typeName) {
        if (shipMaster && m && m.id) {
            // MasterData.canEquipが実装されていればそちらを優先
            if (typeof MasterData.canEquip === 'function') {
                return MasterData.canEquip(shipMaster.id, m.id);
            }
        }
        if (!typeName || typeof typeName !== 'string') return true;
        try {
            if (typeName.includes('特殊潜航艇') || typeName.includes('甲標的')) {
                if (['阿武隈改二', '由良改二', '夕張改二特', '矢矧改二乙', '球磨改二丁'].some(n => sName.includes(n))) return true;
            }
            if (typeName.includes('大型電探')) {
                if (sName.includes('秋月') || sName.includes('照月') || sName.includes('涼月') || sName.includes('初月') || sName.includes('冬月')) return true;
                if (['霞改二乙', '清霜改二', 'タシュケント'].some(n => sName.includes(n))) return true;
            }
            if (typeName.includes('水上爆撃機') || typeName.includes('水上戦闘機')) {
                if (['由良改二', '多摩改二', '矢矧改二乙', '能代改二', '最上改二'].some(n => sName.includes(n))) return true;
            }
            if (typeName.includes('上陸用舟艇') || typeName.includes('内火艇') || typeName.includes('大発')) {
                const dl = ['睦月改二', '如月改二', '江風改二', '大潮改二', '荒潮改二', '霞改二', '満潮改二', '霰改二', '村雨改二', '白露改二', '時雨改三', '朝霜改二', '巻雲改二', '長波改二', 'タシュケント', '雪風改二'];
                if (dl.some(n => sName.includes(n))) return true;
            }
            if (sType === '潜水艦' || sType === '潜水空母') {
                if (typeName.includes('艦上') || typeName.includes('主砲') || typeName.includes('副砲') || typeName.includes('ソナー') || typeName.includes('爆雷') || typeName.includes('徹甲弾') || typeName.includes('高射装置')) return false;
                if (sType === '潜水艦' && (typeName.includes('水上爆撃機') || typeName.includes('水上偵察機'))) return false;
            }
            else if (sType === '駆逐') {
                if (typeName.includes('艦上') || typeName.includes('水上') || typeName.includes('大型電探') || typeName === '大口径主砲' || typeName === '中口径主砲' || typeName === '徹甲弾') return false;
            }
            else if (sType === '海防艦') {
                if (typeName.includes('艦上') || typeName.includes('水上') || typeName.includes('大型電探') || typeName === '大口径主砲' || typeName === '中口径主砲' || typeName === '徹甲弾' || typeName.includes('魚雷') || typeName.includes('副砲')) return false;
            }
            else if (sType === '軽巡' || sType === '雷巡') {
                if (typeName.includes('艦上') || typeName === '大口径主砲' || typeName === '徹甲弾') return false;
            }
            else if (sType === '戦艦') {
                if (typeName.includes('魚雷') || typeName.includes('ソナー') || typeName.includes('爆雷') || typeName.includes('艦上') || typeName.includes('水上爆撃機')) return false;
            }
            else if (sType === '正規空母' || sType === '装甲空母' || sType === '軽空母') {
                if (typeName.includes('主砲') || typeName === '魚雷' || typeName.includes('ソナー') || typeName.includes('爆雷') || typeName === '徹甲弾' || typeName.includes('水上')) return false;
            }
        } catch (e) {
            return true;
        }
        return true;
    }

    const items = AppState.userData.items || [];
    const grouped = {};
    items.forEach(i => {
        const id = i.id || i.api_slotitem_id;
        if (!id) return;
        if (!grouped[id]) grouped[id] = [];
        grouped[id].push(i.uid || i.id);
    });

    window._currentEquipListRaw = [];
    Object.keys(grouped).forEach(id => {
        const m = MasterData.Items[id] || { name: `不明装備(${id})`, typeName: '' };
        let tName = m.typeName;
        if (typeof tName !== 'string' || !tName || tName === '不明') {
            tName = '';
            const name = m.name || '';
            if (m.type && Array.isArray(m.type) && m.type.length >= 3) {
                const typeId = m.type[2];
                if ([1].includes(typeId)) tName = '小口径主砲';
                else if ([2].includes(typeId)) tName = '中口径主砲';
                else if ([3].includes(typeId)) tName = '大口径主砲';
                else if ([4].includes(typeId)) tName = '副砲';
                else if ([5].includes(typeId)) tName = '魚雷';
                else if ([6, 7, 8, 57].includes(typeId)) tName = '艦上戦闘機';
                else if ([9, 10, 59].includes(typeId)) tName = '艦上爆撃機';
                else if ([11, 41, 58].includes(typeId)) tName = '艦上攻撃機';
                else if ([12, 13].includes(typeId)) tName = '小型電探';
                else if ([14].includes(typeId)) tName = '大型電探';
                else if ([17].includes(typeId)) tName = '水上偵察機';
                else if ([18].includes(typeId)) tName = '水上爆撃機';
                else if ([19].includes(typeId)) tName = '徹甲弾';
            }
            if (!tName) {
                if (name.includes('魚雷')) tName = '魚雷';
                else if (name.match(/35\.6cm|38cm|41cm|46cm|51cm|381mm|460mm/)) tName = '大口径主砲';
                else if (name.match(/14cm|15\.2cm|15\.5cm|20\.3cm|8inch/)) tName = '中口径主砲';
                else if (name.match(/12\.7cm|12cm|10cm/)) tName = '小口径主砲';
                else if (name.match(/機/)) tName = '艦上';
                else if (name.includes('電探') && name.includes('大型')) tName = '大型電探';
                else if (name.includes('電探')) tName = '小型電探';
                else if (name.includes('徹甲弾')) tName = '徹甲弾';
            }
        }
        if (!canEquip(m, tName)) return;

        window._currentEquipListRaw.push({
            m: m,
            tName: tName || 'その他',
            uids: grouped[id]
        });
    });

    const html = `
        <div id="${modalId}" style="position:fixed; top:10%; left:25%; width:50%; z-index:9999;">
            <div class="classic-window">
                <div class="classic-titlebar">
                    <span>装備を選択 (スロット${slotIndex + 1})</span>
                    <button class="classic-button" style="padding:0 2px; height:16px; line-height:10px;" onclick="document.getElementById('${modalId}').remove()">X</button>
                </div>
                <div class="classic-content" style="background-color:#d4d0c8; padding:4px;">
                    <div style="margin-bottom:4px; display:flex; gap:4px; align-items:center;">
                        <input type="text" id="equip-search-text" class="classic-input" placeholder="名前検索..." onkeyup="updateEquipList()" style="width:100px;">
                        <select id="equip-filter-type" class="classic-input" onchange="updateEquipList()">
                            <option value="">全種別</option>
                            <option value="主砲">主砲</option>
                            <option value="副砲">副砲</option>
                            <option value="魚雷">魚雷</option>
                            <option value="電探">電探</option>
                            <option value="艦上戦闘機">艦上戦闘機</option>
                            <option value="艦上爆撃機">艦上爆撃機</option>
                            <option value="艦上攻撃機">艦上攻撃機</option>
                            <option value="水上">水上機</option>
                        </select>
                    </div>
                    <div id="equip-list-container" style="background-color:#ffffff; height:300px; overflow-y:scroll; border:2px inset white;">
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    updateEquipList();
}

function updateEquipList() {
    const text = document.getElementById('equip-search-text').value.toLowerCase();
    const typeFilter = document.getElementById('equip-filter-type').value;
    const fleetIndex = window._currentEquipFleetIndex;
    const slotIndex = window._currentEquipSlotIndex;

    let listHtml = `
        <div style="border-bottom:1px solid #808080; padding:2px; cursor:pointer;" onmouseover="this.style.backgroundColor='#000080'; this.style.color='white';" onmouseout="this.style.backgroundColor=''; this.style.color='';" onclick="selectEquipForFleet(${fleetIndex}, ${slotIndex}, -1)">
            （装備を外す）
        </div>
    `;

    window._currentEquipListRaw.forEach(item => {
        if (text && !item.m.name.toLowerCase().includes(text)) return;
        if (typeFilter && !item.tName.includes(typeFilter)) return;

        let eqStatsHtml = '';
        const m = item.m;
        if (m.fire) eqStatsHtml += `<span style="color:#aa0000;">火+${m.fire}</span> `;
        if (m.torp) eqStatsHtml += `<span style="color:#0000aa;">雷+${m.torp}</span> `;
        if (m.aa) eqStatsHtml += `<span style="color:#aa5500;">空+${m.aa}</span> `;
        if (m.asw) eqStatsHtml += `<span style="color:#00aaaa;">潜+${m.asw}</span> `;
        if (m.armor) eqStatsHtml += `<span style="color:#aaaa00;">甲+${m.armor}</span> `;
        if (m.evade) eqStatsHtml += `<span style="color:#00aa00;">避+${m.evade}</span> `;
        if (m.los) eqStatsHtml += `<span style="color:#aa00aa;">索+${m.los}</span> `;

        listHtml += `
            <div style="border-bottom:1px solid #808080; padding:2px; cursor:pointer;" onmouseover="this.style.backgroundColor='#000080'; this.style.color='white';" onmouseout="this.style.backgroundColor=''; this.style.color='';" onclick="selectEquipForFleet(${fleetIndex}, ${slotIndex}, ${item.uids[0]})">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:bold; font-size:11px;">${m.name}</span>
                    <span style="font-size:10px;">所持: ${item.uids.length}</span>
                </div>
                <div style="font-size:10px; margin-top:2px;">${eqStatsHtml}</div>
            </div>
        `;
    });
    document.getElementById('equip-list-container').innerHTML = listHtml;
}

function selectEquipForFleet(fleetIndex, slotIndex, equipUid) {
    if (AppState.simulationFleet[fleetIndex]) {
        while (AppState.simulationFleet[fleetIndex].equips.length <= slotIndex) {
            AppState.simulationFleet[fleetIndex].equips.push(-1);
        }
        AppState.simulationFleet[fleetIndex].equips[slotIndex] = equipUid;
    }
    document.getElementById('equip-selector-modal').remove();
    renderFleetEditor();
    renderSimNodes().then(() => {
        const btnRun = document.getElementById('btn-run-sim');
        if (btnRun) btnRun.click();
    });
}
