/**
 * optimizers.js
 * 遠征、任務、海域攻略、レベリング、開発など多角的な最適化ロジック群
 */

class ExpeditionOptimizer {
    constructor(userData) {
        this.ships = userData.ships || [];
        this.items = userData.items || [];
    }

    optimize(expeditionId, policy = 'max_profit', maxLv = 999) {
        const expData = MasterData.Expeditions[expeditionId];
        if (!expData) return { error: '遠征データが見つかりません' };

        const count = expData.count || 2;
        const flagLv = expData.flag_lv || 1;
        const sumLv = expData.sum_lv || 0;
        const rules = expData.rules || [];
        
        let availableDaihatsu = this.items.filter(i => MasterData.Items[i.id]?.name.includes('大発動艇') || MasterData.Items[i.id]?.name.includes('特大発動艇') || MasterData.Items[i.id]?.name.includes('陸戦隊'));
        let availableDrums = this.items.filter(i => MasterData.Items[i.id]?.name.includes('ドラム缶'));

        const canEquipDaihatsu = (s) => {
            const n = s.master.name;
            const t = s.master.type_name;
            if (t === '揚陸艦' || t === '水上機母艦' || t === '補給艦' || t === '潜水母艦') return true;
            if (n.includes('阿武隈改二') || n.includes('由良改二') || n.includes('鬼怒改二') || n.includes('多摩改二') || n.includes('天龍改二') || n.includes('龍田改二') || n.includes('夕張改二') || n.includes('矢矧改二') || n.includes('能代改二')) return true;
            if (n.includes('睦月改二') || n.includes('如月改二') || n.includes('皐月改二') || n.includes('文月改二') || n.includes('三日月改') || n.includes('望月改') || n.includes('Верный') || n.includes('霞改二') || n.includes('大潮改二') || n.includes('荒潮改二') || n.includes('朝潮改二丁') || n.includes('満潮改二') || n.includes('霰改二') || n.includes('白露改二') || n.includes('村雨改二') || n.includes('海風改二') || n.includes('江風改二') || n.includes('巻雲改二') || n.includes('風雲改二') || n.includes('秋雲改二') || n.includes('夕立改二') || n.includes('時雨改三') || n.includes('雪風改二') || n.includes('丹陽') || n.includes('初春改二') || n.includes('子日改二') || n.includes('若葉改二') || n.includes('初霜改二')) return true;
            return false;
        };

        let useFuel = expData.use_fuel !== undefined ? expData.use_fuel : 0.5;
        let useAmmo = expData.use_bull !== undefined ? expData.use_bull : 0.5;

        // Bauxite is very valuable (often 3x fuel/ammo)
        // Fuel=1, Ammo=1, Steel=1.5, Bauxite=3
        const getResourceScore = (f, a, s, b) => f + a + (s * 1.5) + (b * 3);
        const baseScore = getResourceScore(expData.fuel||0, expData.ammo||0, expData.steel||0, expData.baux||0);

        let availableShips = this.ships.map(s => {
            const m = MasterData.Ships[s.id];
            let d_cap = m ? canEquipDaihatsu({master: m}) : false;
            let d_slots = d_cap ? (m.slots || 3) : 0;
            // 艦単体の「大発なしの場合のコスト」と「大発を積んだ場合のボーナス込みのネットコスト（マイナスなら利益）」を計算
            let rawCost = m ? (m.fuel * useFuel + m.ammo * useAmmo) : 999;
            let bonusScore = d_cap ? (baseScore * 1.5 * (0.05 * Math.min(d_slots, availableDaihatsu.length))) : 0;
            let netCost = rawCost - bonusScore; // 低いほど優秀（利益が大きい）

            // レベルペナルティを追加（1レベルにつき0.1の仮想コストを加算）
            // これにより、数程度の燃費差であれば低レベル艦が優先されるようになります
            let levelPenalty = s.lv * 0.1;
            let sortCost = netCost + levelPenalty;

            return {
                ...s,
                master: m,
                rawCost: rawCost,
                cost: sortCost, // 評価用コスト（ソートキー）
                netCost: netCost, // 実際の純コスト（表示用）
                d_cap: d_cap,
                d_slots: d_slots,
                stats: { fire: m ? m.fire : 0, aa: m ? m.aa : 0, asw: m ? m.asw : 0, los: m ? m.los : 0 }
            };
        }).filter(s => s.master != null && !s.mission && s.lv <= maxLv).sort((a, b) => {
            if (Math.abs(a.cost - b.cost) < 0.01) {
                return a.lv - b.lv;
            }
            return a.cost - b.cost;
        });

        if (availableShips.length < count) return { error: `艦娘の数が足りません(必要:${count}隻)` };

        let fleet = [];
        let remainingShips = [...availableShips];

        let flagIndex = remainingShips.findIndex(s => s.lv >= flagLv);
        if (flagIndex === -1) return { error: `旗艦Lv${flagLv}以上の艦娘がいません` };
        
        let flagship = remainingShips.splice(flagIndex, 1)[0];
        fleet.push(flagship);

        for (const rule of rules) {
            const reqType = rule[0];
            const reqCount = rule[1];
            let found = 0;
            
            for (let i = 0; i < fleet.length; i++) {
                if ((fleet[i].master.type_name === reqType || fleet[i].master.type_name.includes(reqType)) && !fleet[i].usedForRule) {
                    fleet[i].usedForRule = true;
                    found++;
                    if (found >= reqCount) break;
                }
            }

            while (found < reqCount) {
                let idx = remainingShips.findIndex(s => s.master.type_name === reqType || s.master.type_name.includes(reqType));
                if (idx === -1) return { error: `必須艦種 [${reqType}] が足りません (あと${reqCount - found}隻)` };
                let s = remainingShips.splice(idx, 1)[0];
                s.usedForRule = true;
                fleet.push(s);
                found++;
            }
        }

        while (fleet.length < count) {
            fleet.push(remainingShips.shift());
        }

        let currentSumLv = fleet.reduce((sum, s) => sum + s.lv, 0);
        let swapAttempts = 0;
        while (currentSumLv < sumLv && swapAttempts < 10) {
            let swapped = false;
            for (let i = 1; i < fleet.length; i++) {
                let oldShip = fleet[i];
                let betterShips = remainingShips.filter(s => s.lv > oldShip.lv && 
                    (!oldShip.usedForRule || s.master.type_name.includes(oldShip.master.type_name))
                ).sort((a, b) => b.lv - a.lv);
                
                if (betterShips.length > 0) {
                    let newShip = betterShips[0];
                    let newShipIdx = remainingShips.indexOf(newShip);
                    fleet[i] = newShip;
                    fleet[i].usedForRule = oldShip.usedForRule;
                    remainingShips[newShipIdx] = oldShip;
                    oldShip.usedForRule = false;
                    currentSumLv = fleet.reduce((sum, s) => sum + s.lv, 0);
                    swapped = true;
                    break;
                }
            }
            if (!swapped) break;
            swapAttempts++;
        }

        if (currentSumLv < sumLv) return { error: `艦隊合計Lvが足りません (必要:${sumLv} 現在:${currentSumLv})` };

        fleet.forEach(s => {
            s.optimalEquips = Array(s.master.slots || 3).fill(-1);
            s.equipNames = [];
        });

        let equipLogs = [];
        let equippedDrums = 0;
        let equippedDrumsShips = 0;
        let daihatsuCount = 0;

        if (expData.drums) {
            if (availableDrums.length < expData.drums.total) return { error: `ドラム缶が足りません (必要:${expData.drums.total})` };
            
            let eligibleShips = fleet.filter(s => s.master.slots > 0);
            if (eligibleShips.length < expData.drums.ships) return { error: `ドラム缶を積める艦が足りません(必要:${expData.drums.ships}隻)` };
            
            for (let i = 0; i < expData.drums.ships; i++) {
                eligibleShips[i].optimalEquips[0] = availableDrums.shift().uid;
                eligibleShips[i].equipNames.push('ドラム缶');
                equippedDrums++;
                equippedDrumsShips++;
            }
            
            while (equippedDrums < expData.drums.total) {
                let equipped = false;
                for (let s of eligibleShips) {
                    let emptySlot = s.optimalEquips.indexOf(-1);
                    if (emptySlot !== -1) {
                        s.optimalEquips[emptySlot] = availableDrums.shift().uid;
                        s.equipNames.push('ドラム缶');
                        equippedDrums++;
                        equipped = true;
                        break;
                    }
                }
                if (!equipped) return { error: `ドラム缶を積む空きスロットが足りません` };
            }
            equipLogs.push(`ドラム缶を ${equippedDrumsShips}隻 に計 ${equippedDrums}個 搭載しました`);
        }

        if (policy === 'max_profit') {
            let eligibleShips = fleet.filter(s => s.d_cap);
            for (let s of eligibleShips) {
                while (daihatsuCount < 4 && availableDaihatsu.length > 0) {
                    let emptySlot = s.optimalEquips.indexOf(-1);
                    if (emptySlot !== -1) {
                        s.optimalEquips[emptySlot] = availableDaihatsu.shift().uid;
                        s.equipNames.push('大発系');
                        daihatsuCount++;
                    } else {
                        break;
                    }
                }
            }
            if (daihatsuCount > 0) equipLogs.push(`大発動艇系を ${daihatsuCount}個 搭載しました`);
        }

        if (expData.req_stats) {
            let sumAa = fleet.reduce((sum, s) => sum + s.stats.aa, 0);
            let sumAsw = fleet.reduce((sum, s) => sum + s.stats.asw, 0);
            let sumLos = fleet.reduce((sum, s) => sum + s.stats.los, 0);
            
            let reqAa = expData.req_stats.aa || 0;
            let reqAsw = expData.req_stats.asw || 0;
            let reqLos = expData.req_stats.los || 0;

            if (sumAa < reqAa || sumAsw < reqAsw || sumLos < reqLos) {
                return { error: `ステータス条件が足りません(対空:${sumAa}/${reqAa}, 対潜:${sumAsw}/${reqAsw}, 索敵:${sumLos}/${reqLos})` };
            }
        }

        let bonus = 1.0 + (daihatsuCount * 0.05);
        let baseFuel = expData.fuel || 0;
        let baseAmmo = expData.ammo || 0;
        let baseSteel = expData.steel || 0;
        let baseBaux = expData.baux || 0;
        

        let grossFuel = Math.floor(baseFuel * 1.5 * bonus);
        let grossAmmo = Math.floor(baseAmmo * 1.5 * bonus);
        let grossSteel = Math.floor(baseSteel * 1.5 * bonus);
        let grossBaux = Math.floor(baseBaux * 1.5 * bonus);

        let costFuel = Math.floor(fleet.reduce((sum, s) => sum + s.master.fuel, 0) * useFuel);
        let costAmmo = Math.floor(fleet.reduce((sum, s) => sum + s.master.ammo, 0) * useAmmo);
        
        let expTime = expData.time || 60;

        let advices = [];
        advices.push("💡 【大成功の確定】 全艦をキラキラ状態（コンディション50以上）にして送り出すと、報酬が1.5倍になる「大成功」がほぼ確定します。");
        if (daihatsuCount < 4 && policy === 'max_profit') {
            advices.push(`💡 【獲得量アップ】 「大発動艇」系の装備があと ${4 - daihatsuCount} 個あれば、報酬の装備ボーナスを上限（+20%）まで引き上げられます。`);
        } else if (daihatsuCount === 4) {
            advices.push("💡 【獲得量アップ】 大発系を4つ積んでおり通常の上限（+20%）に達しています。「特大発動艇」を混ぜることでさらにボーナスを限界突破できます。");
        }

        return {
            fleet: fleet,
            equipLogs: equipLogs,
            advices: advices,
            bonusPercent: (daihatsuCount * 5),
            profit: { fuel: grossFuel - costFuel, ammo: grossAmmo - costAmmo, steel: grossSteel, baux: grossBaux },
            hourly: { fuel: Math.floor((grossFuel - costFuel) / (expTime / 60)), ammo: Math.floor((grossAmmo - costAmmo) / (expTime / 60)) }
        };
    }
}

class QuestChecker {
    constructor(userData) {
        this.ships = userData.ships || [];
    }

    checkAll() {
        return MasterData.Quests.map(q => this.check(q));
    }

    check(quest) {
        let status = 'ready'; // ready, partial, missing
        let msgs = [];

        if (quest.req_ships) {
            let foundCount = 0;
            let partialFound = false;

            for (const reqName of quest.req_ships) {
                // 完全一致（改二などを要求している場合）
                const exactMatch = this.ships.find(s => s.name === reqName);
                if (exactMatch) {
                    foundCount++;
                } else {
                    // 部分一致（改装前の艦を持っているか）
                    const baseName = reqName.replace(/改二.*$/, '').replace(/改$/, '');
                    const baseMatch = this.ships.find(s => s.name.startsWith(baseName));
                    if (baseMatch) {
                        msgs.push(`⚠️ ${reqName} が必要ですが、現在 ${baseMatch.name} (Lv${baseMatch.lv}) です（育成中）`);
                        partialFound = true;
                    } else {
                        msgs.push(`❌ 未所持: ${reqName}`);
                    }
                }
            }
            if (foundCount === quest.req_ships.length) status = 'ready';
            else if (foundCount > 0 || partialFound) status = 'partial';
            else status = 'missing';
        }

        if (quest.req_ships_any) {
            let foundCount = 0;
            for (const reqName of quest.req_ships_any) {
                if (this.ships.some(s => s.name.startsWith(reqName.replace(/改.*$/, '')))) foundCount++;
            }
            if (foundCount >= quest.req_count) status = 'ready';
            else if (foundCount > 0) {
                status = 'partial';
                msgs.push(`⚠️ 指定艦から ${quest.req_count} 隻必要ですが、現在 ${foundCount} 隻です`);
            } else {
                status = 'missing';
                msgs.push(`❌ 指定艦が全く足りません`);
            }
        }

        let advices = [];
        if (quest.name) {
            if (quest.name.includes("い号")) advices.push("💡 【消化のコツ】 空母(軽空母含む)20隻の撃沈が必要です。2-1（南西諸島哨戒）や 2-2（バシー海峡）の周回が時間・資源効率が良くおすすめです。");
            if (quest.name.includes("ろ号")) advices.push("💡 【消化のコツ】 補給艦50隻の撃沈が必要です。2-2（バシー海峡）の下ルートや、5-3-P、あるいはイベント海域での消化が一般的です。");
            if (quest.name.includes("海上護衛戦")) advices.push("💡 【消化のコツ】 潜水艦15隻の撃沈が必要です。1-5（鎮守府近海）や 7-1（ブルネイ泊地）を回るのが最適解です。");
            if (quest.name.includes("あ号")) advices.push("💡 【消化のコツ】 ボス到達24回、ボス勝利12回など数が多いです。1-1キラ付けのついでや、1-5周回などで気長に進めましょう。");
        }

        return { quest, status, msgs, advices };
    }
}

class MapStrategyOptimizer {
    constructor(userData) {
        this.ships = userData.ships || [];
        this.items = userData.items || [];
    }

    buildFleet(mapId) {
        let strategy = MasterData.MapStrategies[mapId];
        
        // データがない海域の場合の汎用フォールバック
        if (!strategy) {
            strategy = {
                name: mapId + " (汎用編成)",
                requirements: "未知の海域のため汎用編成",
                stypes: ['ANY', 'ANY', 'ANY', 'ANY', 'ANY', 'ANY'],
                desc: "海域の戦術データが不足しているため、手持ちの高レベル艦を順番に配置した汎用編成です。昼戦重視の装備を自動設定します。"
            };
        }

        let fleet = [];
        let availableShips = [...this.ships].sort((a, b) => b.lv - a.lv);

        for (const reqStype of strategy.stypes) {
            const idx = availableShips.findIndex(s => {
                if (reqStype === 'ANY') return true;
                const master = MasterData.Ships[s.id];
                return master && MasterData.matchStype(master.type_name, reqStype);
            });
            if (idx !== -1) fleet.push(availableShips.splice(idx, 1)[0]);
            else {
                // ANY指定以外で足りない場合はエラーではなく妥協して編成を続ける
                if (reqStype !== 'ANY') {
                    const fallbackIdx = availableShips.findIndex(s => true);
                    if (fallbackIdx !== -1) fleet.push(availableShips.splice(fallbackIdx, 1)[0]);
                }
            }
        }

        // 装備の最適アサインロジック
        let availableItems = [...this.items];
        let equipMap = {};

        // マス構成から特化戦術を推測
        const mapDesc = (strategy.desc || "") + " " + (strategy.requirements || "");
        const isASWMap = mapDesc.includes("対潜");
        const needsAA = mapDesc.includes("対空") || mapDesc.includes("空母");
        const needsLOS = mapDesc.includes("索敵");
        const isNightMap = mapDesc.includes("夜戦");

        // 装備種別の文字列推論ヘルパー
        const getEquipTypeStr = (m) => {
            if (!m) return "";
            if (typeof m.typeName === 'string' && m.typeName !== "不明") return m.typeName;
            const tId = m.type && m.type[2] ? m.type[2] : m.typeName;
            if (tId === 1) return '小口径主砲';
            if (tId === 2) return '中口径主砲';
            if (tId === 3) return '大口径主砲';
            if (tId === 4) return '副砲';
            if (tId === 5) return '魚雷';
            if (tId === 6 || tId === 7 || tId === 8 || tId === 57) return '艦上戦闘機';
            if (tId === 9 || tId === 10 || tId === 59) return '艦上爆撃機';
            if (tId === 11 || tId === 41 || tId === 58) return '艦上攻撃機';
            if (tId === 12) return '小型電探';
            if (tId === 13) return '大型電探';
            if (tId === 17) return '水上偵察機';
            if (tId === 18) return '水上爆撃機';
            if (tId === 19) return '徹甲弾';
            if (tId === 14 || tId === 40 || m.name.includes('ソナー') || m.name.includes('探信儀') || m.name.includes('聴音機')) return 'ソナー';
            if (tId === 15 || m.name.includes('投射機')) return '爆雷投射機';
            if (tId === 43 || (m.name.includes('爆雷') && !m.name.includes('投射機'))) return '爆雷';
            if (m.name.includes('機銃')) return '対空機銃';
            return m.name || "";
        };
        let currentShipId = null;

        const evaluateCombination = (shipMaster, uids, isNightMap, isASWMap, isAntiInst, mapDesc, needsAA, needsLOS) => {
            const eqObjs = uids.map(uid => availableItems.find(x => x.uid === uid)).filter(x => x).map(x => MasterData.Items[x.id]);
            let baseScore = 0;
            eqObjs.forEach(m => {
                let s = (m.fire || 0)*2 + (m.torp || 0)*1.5 + (m.armor || 0);
                if (isASWMap) s += (m.asw || 0) * 10; else s += (m.asw || 0) * 0.5;
                if (needsAA) s += (m.aa || 0) * 5; else s += (m.aa || 0) * 1;
                if (needsLOS) s += (m.los || 0) * 5; else s += (m.los || 0) * 1;
                baseScore += s;
            });
            
            if (window.currentSynergyEngine) {
                const syn = window.currentSynergyEngine.evaluate(shipMaster, eqObjs);
                let synScore = (syn.bonuses.fire || 0)*2 + (syn.bonuses.torp || 0)*1.5 + (syn.bonuses.armor || 0);
                if (isASWMap) synScore += (syn.bonuses.asw || 0) * 10; else synScore += (syn.bonuses.asw || 0) * 0.5;
                
                let mult = 1.0;
                if (isNightMap) mult = syn.multipliers.night;
                else mult = syn.multipliers.day;
                if (isAntiInst) mult *= syn.multipliers.inst;
                if (mapDesc.includes("PT")) mult *= syn.multipliers.pt;
                
                return (baseScore + synScore) * mult;
            }
            return baseScore;
        };

        const assignEquipsByTemplates = (templates, isNightMap, isASWMap, isAntiInst, mapDesc, needsAA, needsLOS) => {
            const candidateLists = templates.map((keywords) => {
                const validItems = availableItems.filter(it => {
                    const master = MasterData.Items[it.id];
                    if (!master) return false;
                    if (!MasterData.canEquip(currentShipId, master.id)) return false;
                    const typeStr = getEquipTypeStr(master);
                    if (keywords.length === 0) return true; // allow anything if empty
                    return keywords.some(kw => typeStr.includes(kw) || master.name.includes(kw));
                });
                
                validItems.sort((a, b) => {
                    const ma = MasterData.Items[a.id];
                    const mb = MasterData.Items[b.id];
                    let sa = (ma.fire || 0)*2 + (ma.torp || 0)*1.5 + (ma.armor || 0);
                    let sb = (mb.fire || 0)*2 + (mb.torp || 0)*1.5 + (mb.armor || 0);
                    if (isASWMap) { sa += (ma.asw||0)*10; sb += (mb.asw||0)*10; }
                    else { sa += (ma.asw||0)*0.5; sb += (mb.asw||0)*0.5; }
                    return sb - sa;
                });
                
                return validItems.slice(0, 3).map(x => x.uid);
            });
            
            let bestComb = [];
            let bestScore = -1;
            const shipMaster = MasterData.Ships[currentShipId];
            
            const backtrack = (slotIdx, currentComb) => {
                if (slotIdx === templates.length) {
                    const score = evaluateCombination(shipMaster, currentComb, isNightMap, isASWMap, isAntiInst, mapDesc, needsAA, needsLOS);
                    if (score > bestScore) {
                        bestScore = score;
                        bestComb = [...currentComb];
                    }
                    return;
                }
                const cands = candidateLists[slotIdx];
                if (cands.length === 0) {
                    currentComb.push(-1);
                    backtrack(slotIdx + 1, currentComb);
                    currentComb.pop();
                } else {
                    for (let uid of cands) {
                        if (!currentComb.includes(uid)) {
                            currentComb.push(uid);
                            backtrack(slotIdx + 1, currentComb);
                            currentComb.pop();
                        }
                    }
                }
            };
            
            backtrack(0, []);
            
            bestComb.forEach(uid => {
                if (uid !== -1) {
                    const idx = availableItems.findIndex(x => x.uid === uid);
                    if (idx !== -1) availableItems.splice(idx, 1);
                }
            });
            
            return bestComb;
        };

        fleet.forEach(s => {
            currentShipId = s.id;
            const master = MasterData.Ships[s.id];
            if (!master) return;
            const stype = master.type_name;
            const slotCount = master.slots || 3;
            let assignedEquips = [];

            // 艦種とマップに応じたテンプレート
            const isAntiInst = mapDesc.includes("陸上") || mapDesc.includes("対地");

            if (MasterData.matchStype(stype, "駆逐") || MasterData.matchStype(stype, "海防艦")) {
                if (isASWMap) {
                    assignedEquips = assignEquipsByTemplates([, , ], isNightMap, isASWMap, isAntiInst, mapDesc, needsAA, needsLOS);
                } else if (isAntiInst) {
                    assignedEquips = assignEquipsByTemplates([, , ], isNightMap, isASWMap, isAntiInst, mapDesc, needsAA, needsLOS);
                } else if (isNightMap) {
                    // 魚魚水CI または 主魚電CI を狙う
                    assignedEquips = assignEquipsByTemplates([, , ], isNightMap, isASWMap, isAntiInst, mapDesc, needsAA, needsLOS);
                } else if (needsAA) {
                    assignedEquips = assignEquipsByTemplates([, , ], isNightMap, isASWMap, isAntiInst, mapDesc, needsAA, needsLOS);
                } else {
                    assignedEquips = assignEquipsByTemplates([, , ], isNightMap, isASWMap, isAntiInst, mapDesc, needsAA, needsLOS);
                }
            } else if (MasterData.matchStype(stype, "軽巡") || MasterData.matchStype(stype, "雷巡")) {
                if (isASWMap) {
                    assignedEquips = assignEquipsByTemplates([, , ], isNightMap, isASWMap, isAntiInst, mapDesc, needsAA, needsLOS);
                } else if (isAntiInst) {
                    assignedEquips = assignEquipsByTemplates([, , ], isNightMap, isASWMap, isAntiInst, mapDesc, needsAA, needsLOS);
                } else if (isNightMap) {
                    assignedEquips = assignEquipsByTemplates([, , ], isNightMap, isASWMap, isAntiInst, mapDesc, needsAA, needsLOS);
                } else if (needsAA) {
                    assignedEquips = assignEquipsByTemplates([, , ], isNightMap, isASWMap, isAntiInst, mapDesc, needsAA, needsLOS);
                } else {
                    assignedEquips = assignEquipsByTemplates([, , ], isNightMap, isASWMap, isAntiInst, mapDesc, needsAA, needsLOS);
                }
            } else if (MasterData.matchStype(stype, "戦艦")) {
                // 特殊砲撃(タッチ)対応艦なら徹甲弾+電探を最優先
                if (s.name.match(/大和|長門|陸奥|Nelson|Colorado/)) {
                    assignedEquips = assignEquipsByTemplates([, , , ], isNightMap, isASWMap, isAntiInst, mapDesc, needsAA, needsLOS);
                } else if (isAntiInst) {
                    assignedEquips = assignEquipsByTemplates([, , , ], isNightMap, isASWMap, isAntiInst, mapDesc, needsAA, needsLOS);
                } else if (needsAA) {
                    assignedEquips = assignEquipsByTemplates([, , , ], isNightMap, isASWMap, isAntiInst, mapDesc, needsAA, needsLOS);
                } else {
                    assignedEquips = assignEquipsByTemplates([, , , ], isNightMap, isASWMap, isAntiInst, mapDesc, needsAA, needsLOS);
                }
            } else if (MasterData.matchStype(stype, "空母")) {
                if (isNightMap) {
                    // 夜襲CI: 夜戦 + 夜攻 + FBA
                    assignedEquips = assignEquipsByTemplates([, , , ], isNightMap, isASWMap, isAntiInst, mapDesc, needsAA, needsLOS);
                } else if (needsAA) {
                    assignedEquips = assignEquipsByTemplates([, , , ], isNightMap, isASWMap, isAntiInst, mapDesc, needsAA, needsLOS);
                } else {
                    // FBA (戦爆連合)
                    assignedEquips = assignEquipsByTemplates([, , , ], isNightMap, isASWMap, isAntiInst, mapDesc, needsAA, needsLOS);
                }
            } else if (MasterData.matchStype(stype, "重巡") || MasterData.matchStype(stype, "航巡")) {
                if (isAntiInst) {
                    assignedEquips = assignEquipsByTemplates([, , , ], isNightMap, isASWMap, isAntiInst, mapDesc, needsAA, needsLOS);
                } else {
                    assignedEquips = assignEquipsByTemplates([, , , ], isNightMap, isASWMap, isAntiInst, mapDesc, needsAA, needsLOS);
                }
            } else {
                assignedEquips = assignEquipsByTemplates([, , ], isNightMap, isASWMap, isAntiInst, mapDesc, needsAA, needsLOS);
            }

            // 長さをスロット数に合わせる、足りない部分は -1、スロット数以上の場合は切り捨て
            assignedEquips = assignedEquips.slice(0, slotCount);
            while (assignedEquips.length < slotCount) assignedEquips.push(-1);
            
            // AppStateの形式に合わせるために仮想slotとして持たせる
            s.optimalEquips = assignedEquips;
        });

        return { success: true, fleet: fleet, desc: strategy.desc + "<br><span class='text-xs text-yellow-300'>※所持装備の中から最適な組み合わせを自動計算・装着しました。</span>" };
    }
}

class LevelingAdvisor {
    constructor(userData) {
        this.items = userData.items || [];
    }

    diagnose(targetShip) {
        const master = MasterData.Ships[targetShip.id];
        let hasSonar = this.items.some(i => MasterData.Items[i.id]?.name.includes('ソナー') || MasterData.Items[i.id]?.name.includes('探信儀'));
        
        let suggestions = [];
        
        // 改装情報
        if (master && master.after_lv > 0) {
            if (targetShip.lv >= master.after_lv) {
                suggestions.push(`🌟 <b>改装可能！</b> 目標レベル(Lv${master.after_lv})に達しています。直ちに改装を実施できます。`);
            } else {
                let lvLeft = master.after_lv - targetShip.lv;
                suggestions.push(`🎯 <b>次の改装目標: Lv${master.after_lv}</b> (あと ${lvLeft} レベル)`);
            }
            
            // 必要アイテム・資材
            let reqItems = [];
            if (master.after_bull > 0 || master.after_fuel > 0) {
                reqItems.push(`弾薬x${master.after_bull || 0} 鋼材x${master.after_fuel || 0}`); // api_afterbull is ammo, api_afterfuel is steel in Kancolle API
            }
            // wiki metadata if present (blueprint, catapult, etc)
            if (master.req_blueprint) reqItems.push('改装設計図');
            if (master.req_catapult) reqItems.push('試製甲板カタパルト');
            if (master.req_report) reqItems.push('戦闘詳報');
            if (master.req_aviation) reqItems.push('新型航空兵装資材');
            if (master.req_artillery) reqItems.push('新型砲熕兵装資材');

            if (reqItems.length > 0) {
                suggestions.push(`🛠 <b>改装必要資材:</b> ${reqItems.join(', ')}`);
            }

        } else {
            suggestions.push(`✅ 現在最終改装状態、または次の改装情報がありません。`);
        }

        // 経験値情報
        if (targetShip.exp && targetShip.exp.length > 1 && targetShip.exp[1] > 0) {
            suggestions.push(`📊 次のレベルまであと: <b>${targetShip.exp[1]} EXP</b>`);
        }

        if (targetShip.lv < 99) {
            suggestions.push("<br/><b>【推奨レベリング海域】</b>");
            if (master && (master.type_name === '駆逐' || master.type_name === '軽巡' || master.type_name === '海防艦')) {
                if (hasSonar) {
                    suggestions.push("🟢 <b>7-1 ブルネイ泊地</b>: 先制対潜ができる場合、最高の経験値効率です。(旗艦MVP: 約1000〜1400 EXP/周)");
                    suggestions.push("🟢 <b>1-5 鎮守府近海</b>: 序盤の対潜レベリングに最適。(旗艦MVP: 約500 EXP/周)");
                } else {
                    suggestions.push("🟡 <b>7-1 ブルネイ泊地</b>: ソナー等、対潜装備が不足しています。先に装備開発を推奨します。");
                }
            } else if (master && (master.type_name === '戦艦' || master.type_name === '航空戦艦' || master.type_name.includes('空母'))) {
                suggestions.push("🟢 <b>5-2-C 空襲マス</b>: 噴進砲改二などがあれば無傷でレベリング可能です。旗艦MVP固定で安全です。");
                suggestions.push("🟢 <b>5-3-P 夜戦マス</b>: 戦艦・空母の随伴レベリングとしても優秀です。");
            } else {
                suggestions.push("🟢 <b>5-3-P 夜戦マス</b>: 重巡などの火力艦の育成に最適です。(旗艦MVP: 約1400〜1800 EXP/周)");
            }
            suggestions.push("🟢 <b>演習</b>: 毎日必ず旗艦にして育成しましょう。高レベル相手なら1戦で1000〜2000 EXP程度獲得可能です。");
        } else if (targetShip.lv === 99) {
            suggestions.push("🌸 <b>ケッコンカッコカリ可能！</b> (Lv99)");
        } else {
            suggestions.push(`✨ <b>ケッコン済</b> (Lv${targetShip.lv}) - さらなる高みを目指しましょう！`);
        }

        return suggestions;
    }
}

class ArsenalAdvisor {
    constructor(userData) {
        this.items = userData.items || [];
        this.ships = userData.ships || [];
    }

    scan() {
        let missingTypes = [];
        let counts = { '徹甲弾': 0, '艦上戦闘機': 0, 'ソナー': 0, '小型電探': 0 };

        for (const it of this.items) {
            const master = MasterData.Items[it.id];
            if (master) {
                let tName = master.typeName;
                if (tName === '対艦強化弾') tName = '徹甲弾';
                if (counts[tName] !== undefined) counts[tName]++;
            }
        }

        let suggestions = [];
        if (counts['徹甲弾'] < 2) missingTypes.push('徹甲弾');
        if (counts['艦上戦闘機'] < 4) missingTypes.push('艦上戦闘機');
        if (counts['ソナー'] < 4) missingTypes.push('ソナー');
        if (counts['小型電探'] < 2) missingTypes.push('小型電探');

        for (const type of missingTypes) {
            const recipe = MasterData.Recipes.find(r => r.type === type);
            if (recipe) {
                const sec = this.ships.find(s => MasterData.Ships[s.id] && MasterData.Ships[s.id].type_name.includes(recipe.secretary));
                suggestions.push({
                    type: type,
                    desc: `現在 ${counts[type]} 個しかありません。戦力拡充のために開発を推奨します。`,
                    recipe: `${recipe.fuel}/${recipe.ammo}/${recipe.steel}/${recipe.baux}`,
                    target: recipe.target,
                    secretary: sec ? `${sec.name} (Lv${sec.lv})` : `[${recipe.secretary}] が必要`
                });
            }
        }

        return { counts, suggestions };
    }
}
