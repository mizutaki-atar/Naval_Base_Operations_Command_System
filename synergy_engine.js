class SynergyEngine {
    constructor() {
        this.customRules = [];
    }

    async loadCustomRules() {
        if (window.KCSDB) {
            this.customRules = await window.KCSDB.getSynergyRules() || [];
        }
    }

    // Evaluate synergies for a given ship and its equipped items
    evaluate(ship, equips) {
        let result = {
            bonuses: { fire: 0, torp: 0, aa: 0, armor: 0, evade: 0, asw: 0, los: 0 },
            multipliers: { day: 1.0, night: 1.0, asw: 1.0, pt: 1.0, inst: 1.0 },
            badges: [],
            nightCutIn: null,
            dayCutIn: null
        };

        if (!ship || !equips || equips.length === 0) return result;

        const eTypes = equips.map(e => this.getEquipTypeStr(e)).filter(t => t);
        const eNames = equips.map(e => e.name || "");
        
        const has = (keyword) => eNames.some(n => n.includes(keyword)) || eTypes.includes(keyword);
        const count = (keyword) => eNames.filter(n => n.includes(keyword)).length + eTypes.filter(t => t === keyword).length;

        // 1. 夜戦特殊カットイン (Night Battle Cut-Ins)
        const hasLookout = has('見張員');
        const torpCount = count('魚雷');
        const mainGunCount = count('大口径主砲') + count('中口径主砲') + count('小口径主砲');
        const secGunCount = count('副砲');
        const radarCount = count('小型電探') + count('大型電探');
        
        if (torpCount >= 2 && hasLookout && ship.stype === 2) {
            result.badges.push('魚魚水CI');
            result.nightCutIn = '魚魚水CI';
            result.multipliers.night *= 1.5;
        } else if (mainGunCount >= 1 && torpCount >= 1 && radarCount >= 1 && (hasLookout || ship.stype === 2)) {
            result.badges.push('主魚電CI');
            result.nightCutIn = '主魚電CI';
            result.multipliers.night *= 1.3;
        } else if (torpCount >= 2) {
            result.badges.push('夜戦雷撃CI');
            result.nightCutIn = '雷撃CI';
            result.multipliers.night *= 1.5;
        } else if (mainGunCount >= 2) {
            result.badges.push('夜戦連撃');
            result.nightCutIn = '連撃';
            result.multipliers.night *= 1.2;
        }

        // 2. 対地シナジー (Anti-Installation)
        const hasWG = has('WG42') || has('迫撃砲') || has('ロケット');
        const hasTank = has('戦車') || has('陸戦隊') || has('内火艇');
        const hasKami = has('内火艇');
        const hasDaihatsu = has('大発動艇');
        
        if (hasWG && hasTank && hasKami) {
            result.badges.push('対地3点セット(爆発的特効)');
            result.multipliers.inst *= 4.0;
        } else if (hasTank && hasKami) {
            result.badges.push('戦車+内火艇');
            result.multipliers.inst *= 2.5;
        } else if (hasWG) {
            result.multipliers.inst *= 1.4;
        }

        // 3. PT小鬼群特効 (Anti-PT)
        const hasMg = has('機銃');
        const hasSmallGun = count('小口径主砲');
        if ((hasSmallGun || secGunCount > 0) && hasMg && (hasLookout || has('武装大発'))) {
            result.badges.push('対PT小鬼群特効');
            result.multipliers.pt *= 1.8;
        }

        // 4. 空母特殊 (Carrier FBA/BBA)
        const fighterCount = count('艦上戦闘機');
        const bomberCount = count('艦上爆撃機');
        const attackerCount = count('艦上攻撃機');
        if (bomberCount >= 1 && attackerCount >= 1 && fighterCount >= 1) {
            result.badges.push('戦爆連合CI (FBA)');
            result.multipliers.day *= 1.25;
            result.dayCutIn = 'FBA';
        }

        // 5. 特殊砲撃シナジー (Touch Synergy)
        if (ship.name.includes("大和") || ship.name.includes("長門") || ship.name.includes("陸奥") || ship.name.includes("Nelson") || ship.name.includes("Colorado")) {
            if (has('徹甲弾') && radarCount >= 1) {
                result.badges.push('タッチ用 電探+徹甲弾シナジー');
                result.multipliers.day *= 1.55; 
            } else if (has('徹甲弾')) {
                result.multipliers.day *= 1.35;
            }
        } else if (mainGunCount >= 2 && has('徹甲弾')) {
            result.badges.push('徹甲弾弾着');
            result.multipliers.day *= 1.2;
            result.dayCutIn = '徹甲弾弾着';
        }

        // 6. カスタムルールの適用
        for (const rule of this.customRules) {
            // Check ship target
            const matchShip = rule.targetShips === "ALL" || 
                              ship.name.includes(rule.targetShips) || 
                              ship.type_name.includes(rule.targetShips);
            
            if (matchShip) {
                // Check required equips
                let hasAll = true;
                if (rule.requiredEquips && rule.requiredEquips.length > 0) {
                    for (const req of rule.requiredEquips) {
                        if (!has(req)) {
                            hasAll = false;
                            break;
                        }
                    }
                }
                
                if (hasAll) {
                    if (rule.bonusStats) {
                        for (let k in rule.bonusStats) {
                            if (result.bonuses[k] !== undefined) result.bonuses[k] += rule.bonusStats[k];
                        }
                    }
                    if (rule.multiplier && rule.multiplier > 1.0) {
                        result.multipliers.day *= rule.multiplier;
                        result.multipliers.night *= rule.multiplier;
                    }
                    if (rule.badge) {
                        result.badges.push(rule.badge);
                    }
                }
            }
        }

        // 固有ボーナスの代表例 (D砲 + 水上電探 + 魚雷)
        if (ship.name.match(/陽炎|夕雲|島風/) && has('12.7cm連装砲D型') && radarCount >= 1 && torpCount >= 1) {
            result.badges.push('D型砲+電探+魚雷 相互シナジー');
            result.bonuses.fire += 5;
            result.bonuses.torp += 4;
            result.bonuses.evade += 5;
        }

        return result;
    }

    getEquipTypeStr(m) {
        if (!m) return "";
        if (typeof m.typeName === 'string' && m.typeName !== "不明" && m.typeName !== "") return m.typeName;
        const tId = m.type && m.type[2] ? m.type[2] : m.typeName;
        if (tId === 1) return '小口径主砲';
        if (tId === 2) return '中口径主砲';
        if (tId === 3) return '大口径主砲';
        if (tId === 4) return '副砲';
        if (tId === 5) return '魚雷';
        if (tId === 6 || tId === 7 || tId === 8 || tId === 57) return '艦上戦闘機';
        if (tId === 9 || tId === 10 || tId === 59) return '艦上爆撃機';
        if (tId === 11 || tId === 41 || tId === 58) return '艦上攻撃機';
        if (tId === 12 || tId === 13) return '小型電探';
        if (tId === 14) return '大型電探';
        if (tId === 17) return '水上偵察機';
        if (tId === 18) return '水上爆撃機';
        if (tId === 19) return '徹甲弾';
        if (tId === 14 || tId === 40 || m.name.includes('ソナー') || m.name.includes('探信儀') || m.name.includes('聴音機')) return 'ソナー';
        if (tId === 15 || m.name.includes('投射機')) return '爆雷投射機';
        if (tId === 43 || (m.name.includes('爆雷') && !m.name.includes('投射機'))) return '爆雷';
        if (m.name.includes('機銃')) return '対空機銃';
        return m.name || "";
    }
}

window.SynergyEngine = SynergyEngine;
