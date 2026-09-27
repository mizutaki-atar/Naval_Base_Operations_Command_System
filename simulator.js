/**
 * simulator.js
 * メインスレッドをブロックしない、Blob Web Workerを用いたモンテカルロ勝率シミュレータ。
 * 艦これ準拠のダメージ計算式、乱数判定を内包。マルチノード（出撃全体）とルート分岐に対応。
 */

const simulatorWorkerCode = `
self.onmessage = function(e) {
    const { iterations, fleet, paths } = e.data;
    
    let results = {
        total_s_win: 0, 
        total_a_win: 0,
        total_retreats: 0,
        nodes: {}
    };

    const formMods = {
        1: { fire: 1.0, torp: 1.0, asw: 0.6 },
        2: { fire: 0.8, torp: 0.8, asw: 0.8 },
        3: { fire: 0.7, torp: 0.7, asw: 1.2 },
        4: { fire: 0.75, torp: 0.6, asw: 1.1 },
        5: { fire: 0.6, torp: 0.6, asw: 1.3 }
    };
    const engagementMods = [1.0, 1.0, 1.0, 1.0, 0.8, 0.8, 0.8, 1.2, 0.6];

    function calcDamage(atk, def, cap, isCritical, engagementMod = 1.0) {
        let capAtk = atk * engagementMod;
        if (capAtk > cap) capAtk = cap + Math.sqrt(capAtk - cap);
        if (isCritical) capAtk *= 1.5;
        let defArmor = def * (0.7 + Math.random() * 0.6);
        let dmg = Math.floor(capAtk - defArmor);
        return dmg;
    }

    function applyDamageWithStopper(target, dmg, isPlayer) {
        if (target.hp <= 0) return;
        if (dmg < 1) dmg = Math.floor(target.hp * (0.06 + Math.random() * 0.08));
        if (dmg < 1) dmg = 1;
        // 大破ストッパー (プレイヤーのみ。現在HPの50%以上のダメージで、かつ現在HP > 最大HPの25% の場合)
        if (isPlayer && dmg >= target.hp && target.hp > target.max_hp * 0.25) {
            // 割合ダメージ (現在HPの50%〜79%)
            dmg = Math.floor(target.hp * (0.5 + Math.random() * 0.29));
        }
        target.hp -= dmg;
        if (target.hp <= 0) { target.hp = 0; target.isAlive = false; }
    }

    function getCondMod(cond, isAcc) {
        if (cond === undefined) return 1.0;
        if (cond >= 50) return isAcc ? 1.2 : 1.5; // キラキラ(命中1.2倍, 回避1.5倍)
        if (cond >= 30) return 1.0;               // 通常
        if (cond >= 20) return 0.8;               // 間宮点滅(オレンジ疲労)
        return 0.5;                               // 赤疲労(命中回避ともに半減)
    }

    function calcHit(attacker, defender, isEnemy = false) {
        let baseAcc = isEnemy ? 75 : 95; 
        let accMod = getCondMod(attacker.cond, true);
        baseAcc *= accMod;

        let evade = defender.evade || (defender.name.includes("級") ? 20 : 50); 
        if (defender.lv) evade += Math.floor(Math.sqrt(defender.lv) * 2);
        let evaMod = getCondMod(defender.cond, false);
        evade *= evaMod;

        let hitRate = (baseAcc - Math.floor(evade / 2)) / 100;
        hitRate = Math.max(0.10, Math.min(0.97, hitRate));
        return Math.random() < hitRate;
    }

    function cloneFleet(src) {
        return src.map(s => {
            let maxHp = s.hp || 50;
            return Object.assign({}, s, { max_hp: maxHp, hp: maxHp, isAlive: true });
        });
    }

    for (let i = 0; i < iterations; i++) {
        if (i % (iterations / 10) === 0) {
            self.postMessage({ type: 'progress', percent: Math.floor((i / iterations) * 100) });
        }

        let currentFleet = cloneFleet(fleet);
        if (currentFleet.length === 0) continue;

        // ルート分岐の決定
        let rnd = Math.random();
        let selectedPath = paths[0];
        let accum = 0;
        for (let p of paths) {
            accum += p.prob;
            if (rnd <= accum) {
                selectedPath = p;
                break;
            }
        }

        let isRetreated = false;

        for (let nodeIdx = 0; nodeIdx < selectedPath.nodes.length; nodeIdx++) {
            let node = selectedPath.nodes[nodeIdx];
            let isBoss = (nodeIdx === selectedPath.nodes.length - 1);
            
            if (!results.nodes[node.name]) {
                results.nodes[node.name] = { pass: 0, s_win: 0, a_win: 0, retreats: 0 };
            }
            results.nodes[node.name].pass++;

            let currentEnemy = cloneFleet(node.enemy);
            let fMod = formMods[node.formation] || formMods[1];
            const engageMod = engagementMods[Math.floor(Math.random() * engagementMods.length)];

            // --- 開幕航空戦フェーズ ---
            currentFleet.filter(f => f.isAlive && (f.name.includes('空母') || f.name.includes('加賀') || f.name.includes('赤城'))).forEach(f => {
                let strikeCount = 2; // 簡易的に1隻につき2スロット分の爆撃とする
                let hasBomber = (f.bomb || 0) > 0 || (f.torp || 0) > 0;
                if (hasBomber) {
                    for(let i=0; i<strikeCount; i++) {
                        let targets = currentEnemy.filter(e => e.isAlive);
                        if (targets.length > 0) {
                        let target = targets[Math.floor(Math.random() * targets.length)];
                        if (calcHit(f, target, false)) {
                            // 空母のスロット搭載数を擬似的に表現するため、爆装・雷装を3.5倍にする
                            let basePower = ((f.bomb || 5) * 3.5 + (f.torp || 5) * 3.5 + 25) * (0.8 + Math.random() * 0.4);
                            let dmg = calcDamage(basePower, target.armor, 150, false, 1.0);
                            applyDamageWithStopper(target, dmg, false);
                        }
                    }
                }
                }
            });
            currentEnemy.filter(e => e.isAlive && e.name.includes('空母')).forEach(e => {
                let strikeCount = 2;
                for(let i=0; i<strikeCount; i++) {
                    let fTargets = currentFleet.filter(f => f.isAlive);
                    if (fTargets.length > 0) {
                        let target = fTargets[Math.floor(Math.random() * fTargets.length)];
                        if (calcHit(e, target, true)) {
                            let dmg = Math.floor(5 + Math.random() * 20) - Math.floor((target.aa || 0) * 0.1);
                            if (dmg < 1) dmg = 1; // 割合カスダメ
                            applyDamageWithStopper(target, dmg, true);
                        }
                    }
                }
            });

            // --- 昼戦フェーズ ---
            let hasBB = currentFleet.some(f => [8,9,10,12].includes(f.stype) || f.name.includes('戦艦')) || currentEnemy.some(e => e.name.includes('戦艦'));
            let shellingRounds = hasBB ? 2 : 1;
            const maxTurn = 6;

            for (let round = 0; round < shellingRounds; round++) {
                for (let t = 0; t < maxTurn; t++) {
                    let attacker = currentFleet[t % currentFleet.length];
                    let targets = currentEnemy.filter(e => e.isAlive);
                    if (attacker && attacker.isAlive && targets.length > 0) {
                        let isTaiha = attacker.hp <= attacker.max_hp * 0.25;
                        let isChuha = attacker.hp <= attacker.max_hp * 0.5;
                        let isCV = attacker.name.includes('空母') || attacker.name.includes('加賀') || attacker.name.includes('赤城') || attacker.name.includes('翔鶴') || attacker.name.includes('瑞鶴');
                        let hasBomber = !isCV || (attacker.bomb || 0) > 0 || (attacker.torp || 0) > 0;
                        
                        if (!isTaiha && !(isCV && isChuha) && hasBomber) {
                            let target = targets[Math.floor(Math.random() * targets.length)];
                            if (calcHit(attacker, target, false)) {
                                let isCritical = Math.random() < 0.15;
                                let multiFire = attacker.multipliers ? (attacker.multipliers.fire || 1.0) : 1.0;
                                let atkPower = (attacker.fire * multiFire) * fMod.fire + 5; 
                                if (isCV) atkPower = ((attacker.fire * multiFire) + attacker.torp + Math.floor((attacker.bomb || 0) * 1.3)) * 1.5 + 55;
                                if (target.name.includes("潜水")) atkPower = (attacker.asw || 40) * fMod.asw;
                                if (isChuha) atkPower *= 0.7;

                                let dmg = calcDamage(atkPower, target.armor, 180, isCritical, engageMod);
                                applyDamageWithStopper(target, dmg, false);
                            }
                        }
                    }

                    let eAttacker = currentEnemy[t % currentEnemy.length];
                    let fTargets = currentFleet.filter(f => f.isAlive);
                    if (eAttacker && eAttacker.isAlive && fTargets.length > 0) {
                        let isTaiha = eAttacker.hp <= eAttacker.max_hp * 0.25;
                        let isChuha = eAttacker.hp <= eAttacker.max_hp * 0.5;
                        let isCV = eAttacker.name.includes('空母');
                        
                        if (!isTaiha && !(isCV && isChuha)) {
                            let target = fTargets[Math.floor(Math.random() * fTargets.length)];
                            if (calcHit(eAttacker, target, true)) {
                                let isCritical = Math.random() < 0.05;
                                let atkPower = eAttacker.fire + 5;
                                if (isCV) {
                                    if (eAttacker.fire > 0) atkPower = (eAttacker.fire + eAttacker.torp + Math.floor((eAttacker.bomb || 0) * 1.3)) * 1.5 + 55;
                                    else atkPower = 27; 
                                }
                                if (isChuha) atkPower *= 0.7;

                                let dmg = calcDamage(atkPower, target.armor, 180, isCritical, engageMod);
                                applyDamageWithStopper(target, dmg, true);
                            }
                        }
                    }
                }
            }

            // --- 雷撃戦フェーズ ---
            currentFleet.filter(f => f.isAlive && f.hp > f.max_hp * 0.5 && f.torp > 0).forEach(f => {
                let targets = currentEnemy.filter(e => e.isAlive);
                if (targets.length > 0) {
                    let target = targets[Math.floor(Math.random() * targets.length)];
                    if (calcHit(f, target, false)) {
                        let multiTorp = f.multipliers ? (f.multipliers.torp || 1.0) : 1.0;
                        let dmg = calcDamage((f.torp * multiTorp) * fMod.torp + 5, target.armor, 150, false, engageMod);
                        applyDamageWithStopper(target, dmg, false);
                    }
                }
            });
            currentEnemy.filter(e => e.isAlive && e.hp > e.max_hp * 0.5 && e.torp > 0).forEach(e => {
                let fTargets = currentFleet.filter(f => f.isAlive);
                if (fTargets.length > 0) {
                    let target = fTargets[Math.floor(Math.random() * fTargets.length)];
                    if (calcHit(e, target, true)) {
                        let dmg = calcDamage(e.torp + 5, target.armor, 150, false, engageMod);
                        applyDamageWithStopper(target, dmg, true);
                    }
                }
            });

            // --- 夜戦フェーズ ---
            let eAlive = currentEnemy.filter(e => e.isAlive).length;
            if (eAlive > 0) {
                for (let t = 0; t < maxTurn; t++) {
                    let attacker = currentFleet[t % currentFleet.length];
                    let targets = currentEnemy.filter(e => e.isAlive);
                    let isCV = attacker && (attacker.name.includes('空母') || attacker.name.includes('加賀') || attacker.name.includes('赤城'));
                    if (attacker && !isCV && attacker.isAlive && attacker.hp > attacker.max_hp * 0.25 && targets.length > 0) {
                        let target = targets[Math.floor(Math.random() * targets.length)];
                        if (calcHit(attacker, target, false)) {
                            let isCritical = Math.random() < 0.3;
                            // 連撃・カットインを擬似的に表現するため夜戦火力を1.2倍にする、シナジー倍率も乗算
                            let multiNight = attacker.multipliers ? (attacker.multipliers.night || attacker.multipliers.fire || 1.0) : 1.0;
                            let atkPower = (attacker.fire + (attacker.torp || 0)) * 1.2 * multiNight;
                            if (target.name.includes("潜水")) atkPower = 40; 
                            let isChuha = attacker.hp <= attacker.max_hp * 0.5;
                            if (isChuha) atkPower *= 0.7;

                            let dmg = calcDamage(atkPower, target.armor, 300, isCritical, 1.0);
                            applyDamageWithStopper(target, dmg, false);
                        }
                    }

                    let eAttacker = currentEnemy[t % currentEnemy.length];
                    let fTargets = currentFleet.filter(f => f.isAlive);
                    let eIsCV = eAttacker && eAttacker.name.includes('空母');
                    if (eAttacker && !eIsCV && eAttacker.isAlive && eAttacker.hp > eAttacker.max_hp * 0.25 && fTargets.length > 0) {
                        let target = fTargets[Math.floor(Math.random() * fTargets.length)];
                        if (calcHit(eAttacker, target, true)) {
                            let isCritical = Math.random() < 0.1;
                            let atkPower = (eAttacker.fire + (eAttacker.torp || 0)) * 1.2;
                            let isChuha = eAttacker.hp <= eAttacker.max_hp * 0.5;
                            if (isChuha) atkPower *= 0.7;

                            let dmg = calcDamage(atkPower, target.armor, 300, isCritical, 1.0);
                            applyDamageWithStopper(target, dmg, true);
                        }
                    }
                }
            }

            // --- 勝敗判定 ---
            let eDeadCount = currentEnemy.filter(e => !e.isAlive).length;
            let eTotal = currentEnemy.length;
            
            if (eDeadCount === eTotal) {
                results.nodes[node.name].s_win++;
                if (isBoss) results.total_s_win++;
            } else if (eDeadCount >= Math.floor(eTotal * 0.6)) {
                results.nodes[node.name].a_win++;
                if (isBoss) results.total_a_win++;
            }

            // 大破撤退判定 (ボスマス以外)
            if (!isBoss) {
                let hasTaiha = currentFleet.some(f => f.isAlive && f.hp <= f.max_hp * 0.25);
                if (hasTaiha) {
                    results.nodes[node.name].retreats++;
                    results.total_retreats++;
                    isRetreated = true;
                    break; // ルートを中断して次のイテレーションへ
                }
            }
        }
    }

    self.postMessage({ type: 'done', results });
};
`;


class BattleSimulator {
    constructor() {
        this.worker = null;
    }

    run(fleet, paths, iterations, onProgress) {
        return new Promise((resolve) => {
            if (this.worker) {
                this.worker.terminate();
            }

            const blob = new Blob([simulatorWorkerCode], { type: 'application/javascript' });
            this.worker = new Worker(URL.createObjectURL(blob));

            this.worker.onmessage = (e) => {
                const data = e.data;
                if (data.type === 'progress') {
                    if (onProgress) onProgress(data.percent);
                } else if (data.type === 'done') {
                    resolve(data.results);
                }
            };

            this.worker.postMessage({
                iterations: iterations,
                fleet: fleet,
                paths: paths
            });
        });
    }
}

// 外部から利用可能にする
if (typeof window !== 'undefined') {
    window.BattleSimulator = BattleSimulator;
}
