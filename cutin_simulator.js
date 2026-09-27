/**
 * cutin_simulator.js
 * 特殊攻撃・カットインの発動条件を確認し、ユーザーの保有艦・保有装備で実現可能かを判定するシステム。
 */

const CutinSimulator = {
    types: [
        {
            id: "day_double",
            name: "昼戦連撃 (弾着観測射撃)",
            desc: "昼戦で連撃（攻撃力1.2倍×2回）を行う。発動率が高く昼戦の主力となる。",
            reqDesc: "・制空状態が「航空優勢」または「制空権確保」であること\n・主砲系 2つ以上\n・水上偵察機 または 水上爆撃機 を搭載していること",
            check: function(ship, equips, allOwnedEquips) {
                let result = { canDo: false, missing: [], explanation: "" };
                
                let mainGuns = allOwnedEquips.filter(e => e.type && [1, 2, 3].includes(e.type[2]));
                let seaplanes = allOwnedEquips.filter(e => e.type && [10, 11].includes(e.type[2]));
                
                let isCarrierOrSub = [7, 11, 13, 14, 18].includes(ship.stype);
                let isInvalidType = [1, 2, 4, 19].includes(ship.stype);
                let totalPlaneCap = ship.slot_cap ? ship.slot_cap.reduce((a,b)=>a+b, 0) : 0;
                
                if (isCarrierOrSub || isInvalidType) {
                    result.missing.push("この艦種（" + (ship.typeName || "不明") + "）は昼戦の弾着観測射撃を行えません。");
                } else if (totalPlaneCap === 0) {
                    result.missing.push("この艦娘は搭載数(スロット容量)が0のため、水上機を飛ばして弾着観測射撃を行うことができません。");
                }
                
                if (mainGuns.length < 2) {
                    result.missing.push("主砲系装備が2つ以上必要ですが、所持数が不足しています。（開発などで入手してください）");
                }
                if (seaplanes.length < 1) {
                    result.missing.push("水上偵察機または水上爆撃機が必要ですが、所持していません。");
                }
                
                if (ship.slot && ship.slot.length < 3) {
                    result.missing.push("主砲2＋水偵を装備するには3スロット以上必要ですが、この艦娘（スロット数: " + ship.slot.length + "）では足りません。");
                }

                if (result.missing.length === 0) {
                    result.canDo = true;
                    result.explanation = "現在保有している装備で発動可能です！\n（主砲×2、水上機×1 を装備させて出撃し、制空権確保・航空優勢を取ってください）";
                }
                return result;
            }
        },
        {
            id: "day_ap_cutin",
            name: "昼戦カットイン (主砲/徹甲弾)",
            desc: "昼戦で主砲/徹甲弾カットイン（攻撃力1.5倍）を行う。敵の装甲を貫く強力な一撃。",
            reqDesc: "・制空状態が「航空優勢」または「制空権確保」であること\n・主砲系 2つ以上\n・徹甲弾 1つ以上\n・水上偵察機 または 水上爆撃機 を搭載していること",
            check: function(ship, equips, allOwnedEquips) {
                let result = { canDo: false, missing: [], explanation: "" };
                let mainGuns = allOwnedEquips.filter(e => e.type && [1, 2, 3].includes(e.type[2]));
                let apShells = allOwnedEquips.filter(e => e.type && e.type[2] === 19);
                let seaplanes = allOwnedEquips.filter(e => e.type && [10, 11].includes(e.type[2]));

                let isCarrierOrSub = [7, 11, 13, 14, 18].includes(ship.stype);
                let isInvalidType = [1, 2, 4, 19].includes(ship.stype);
                let totalPlaneCap = ship.slot_cap ? ship.slot_cap.reduce((a,b)=>a+b, 0) : 0;
                
                if (isCarrierOrSub || isInvalidType) {
                    result.missing.push("この艦種（" + (ship.typeName || "不明") + "）は昼戦の弾着観測射撃を行えません。");
                } else if (totalPlaneCap === 0) {
                    result.missing.push("この艦娘は搭載数(スロット容量)が0のため、水上機を飛ばして弾着観測射撃を行うことができません。");
                } else if (![8, 9, 10, 12].includes(ship.stype)) {
                    result.missing.push("徹甲弾は基本的に戦艦級しか装備できません。この艦種（" + (ship.typeName || "不明") + "）では発動できない可能性が高いです。");
                }
                
                if (mainGuns.length < 2) result.missing.push("主砲系装備が2つ以上必要です。");
                if (apShells.length < 1) result.missing.push("徹甲弾が1つ以上必要です。（開発などで入手してください）");
                if (seaplanes.length < 1) result.missing.push("水上機が必要です。");
                
                if (ship.slot && ship.slot.length < 4) {
                    result.missing.push("主砲2＋徹甲弾＋水偵を積むには4スロット必要ですが、足りません。");
                }

                if (result.missing.length === 0) {
                    result.canDo = true;
                    result.explanation = "現在保有している装備で発動可能です！\n（主砲×2、徹甲弾×1、水上機×1 を装備させてください）";
                }
                return result;
            }
        },
        {
            id: "cv_day_cutin",
            name: "戦爆連合カットイン (昼戦空母)",
            desc: "空母が昼戦で強力なカットイン攻撃を行う。",
            reqDesc: "・制空状態が「航空優勢」以上であること\n・「艦上爆撃機」と「艦上攻撃機」をそれぞれ1つ以上装備（さらに艦上戦闘機を積むと最高倍率）",
            check: function(ship, equips, allOwnedEquips) {
                let result = { canDo: false, missing: [], explanation: "" };
                // 7: 軽空母, 11: 正規空母, 18: 装甲空母
                if (![7, 11, 18].includes(ship.stype)) {
                    result.missing.push("空母系の艦娘(軽空母、正規空母、装甲空母)のみ発動可能です。");
                }
                
                let diveBombers = allOwnedEquips.filter(e => e.type && e.type[2] === 7);
                let torpedoBombers = allOwnedEquips.filter(e => e.type && e.type[2] === 8);
                let fighters = allOwnedEquips.filter(e => e.type && e.type[2] === 6);
                
                if (diveBombers.length < 1) result.missing.push("「艦上爆撃機」が必要です。（開発等で入手してください）");
                if (torpedoBombers.length < 1) result.missing.push("「艦上攻撃機」が必要です。（開発等で入手してください）");
                
                if (result.missing.length === 0) {
                    result.canDo = true;
                    if (fighters.length >= 1) {
                        result.explanation = "現在保有している装備で発動可能です！\n（艦戦・艦爆・艦攻を1つずつ装備させると最も倍率の高いFBAカットインになります）";
                    } else {
                        result.explanation = "現在保有している装備で発動可能です！\n（艦爆・艦攻を装備させてください。さらに艦戦もあれば強力なカットインになります）";
                    }
                }
                return result;
            }
        },
        {
            id: "night_torpedo_ci",
            name: "夜戦 魚雷カットイン",
            desc: "夜戦で強力な魚雷カットイン（1.5倍×2回など）を行う。装甲の厚いボスに対するフィニッシャーに必須。",
            reqDesc: "・魚雷系装備 2つ以上\n・運の値が高いほど発動率が上がる（運50以上推奨、最低でも40）",
            check: function(ship, equips, allOwnedEquips) {
                let result = { canDo: false, missing: [], explanation: "" };
                let torps = allOwnedEquips.filter(e => e.type && e.type[2] === 5);

                if ([7, 11, 18].includes(ship.stype)) {
                    result.missing.push("空母系は通常の夜戦魚雷カットインを行えません。（夜間作戦空母などの特殊条件が必要です）");
                }
                
                if (torps.length < 2) result.missing.push("魚雷系装備が2つ以上必要ですが、所持数が不足しています。");
                
                if (ship.slot && ship.slot.length < 2) {
                    result.missing.push("装備スロットが2つ以上必要です。");
                }
                
                let luckAdvice = "";
                let luck = ship.luck || 10;
                if (luck < 40) {
                    luckAdvice = `\n※【注意】現在の運(${luck})では発動率がかなり低いです。まるゆを使った運改修をするか、熟練見張員などを併用するか、運の高い別の艦娘(雪風や時雨など)に変更することをお勧めします。`;
                } else if (luck >= 50) {
                    luckAdvice = `\n※運が${luck}あるため、高い確率でカットイン発動が期待できます。`;
                }

                if (result.missing.length === 0) {
                    result.canDo = true;
                    result.explanation = "現在保有している装備で発動条件を満たせます。（魚雷×2以上を装備させてください）" + luckAdvice;
                }
                return result;
            }
        },
        {
            id: "nelson_touch",
            name: "ネルソンタッチ (Nelson Touch)",
            desc: "Nelsonを旗艦とし、複縦陣を選択すると発動する特殊砲撃。艦隊の1,3,5番艦が強力な攻撃を放つ。",
            reqDesc: "・旗艦が「Nelson」または「Nelson改」であること\n・艦隊が6隻編成（遊撃部隊なら7隻も可）\n・出撃時、陣形選択で「複縦陣」を選ぶこと",
            check: function(ship, equips, allOwnedEquips) {
                let result = { canDo: false, missing: [], explanation: "" };
                if (!ship.name || !ship.name.includes("Nelson")) {
                    result.missing.push(`この艦娘（${ship.name}）はNelsonではありません。旗艦をNelsonにする必要があります。`);
                }
                
                if (result.missing.length === 0) {
                    result.canDo = true;
                    result.explanation = "この艦娘を第一艦隊の旗艦に配置し、水上艦6隻編成を組み、戦闘で「複縦陣」を選択することで発動可能です。\n※装備の特別な指定はありませんが、1・3・5番艦に主砲をしっかり積むと威力が上がります。";
                }
                return result;
            }
        },
        {
            id: "nagato_touch",
            name: "一斉射かッ…胸が熱いな！ (長門/陸奥 特殊砲撃)",
            desc: "長門改二または陸奥改二を旗艦とし、梯形陣または第二警戒航行序列で発動する。",
            reqDesc: "・旗艦が「長門改二」または「陸奥改二」\n・2番艦が「戦艦級」(相方が陸奥改二/長門改二だとダメージ倍率アップ)\n・水上打撃部隊以外の6隻編成\n・陣形「梯形陣」または「第二警戒航行序列」を選択",
            check: function(ship, equips, allOwnedEquips) {
                let result = { canDo: false, missing: [], explanation: "" };
                let isNagatoMutsu = ship.name && (ship.name.includes("長門改二") || ship.name.includes("陸奥改二"));
                if (!isNagatoMutsu) {
                    result.missing.push(`この艦娘（${ship.name || "不明"}）は「長門改二」または「陸奥改二」ではありません。改二への改装が必要です。`);
                }
                
                if (result.missing.length === 0) {
                    result.canDo = true;
                    result.explanation = "条件を満たしています！この艦を旗艦にし、2番艦に戦艦（陸奥や長門がベスト）を配置し、梯形陣を選ぶことで発動できます。\n※1,2番艦に徹甲弾や水上電探を装備すると、さらにダメージ倍率が跳ね上がります。";
                }
                return result;
            }
        },
        {
            id: "aaci_general",
            name: "対空カットイン (汎用・固有)",
            desc: "敵の航空攻撃を強力に撃墜し、自艦隊の被害を抑える。",
            reqDesc: "・汎用: 高角砲 + 高射装置 + 対空電探など\\n・秋月型、摩耶改二、五十鈴改二などは固有の強力な条件を持ちます。",
            check: function(ship, equips, allOwnedEquips) {
                let result = { canDo: false, missing: [], explanation: "" };
                
                // 16: 高角砲アイコン
                let haGuns = allOwnedEquips.filter(e => e.type && [1, 4].includes(e.type[2]) && e.type[3] === 16);
                // 36: 高射装置
                let fd = allOwnedEquips.filter(e => e.type && e.type[2] === 36);
                // 内蔵高射装置をもつ高角砲 (秋月砲など) - 便宜上aa>=8
                let haFd = haGuns.filter(e => e.aa >= 8); 
                
                let aaRadar = allOwnedEquips.filter(e => e.type && [12, 13].includes(e.type[2]) && (e.aa >= 2 || (e.name && e.name.includes("対空"))));
                let aaGun = allOwnedEquips.filter(e => e.type && e.type[2] === 21);
                let aaGunCD = aaGun.filter(e => e.aa >= 9); // 集中配備
                
                // 固有判定
                if (ship.name && ship.name.includes("秋月")) {
                    if (haGuns.length < 1) result.missing.push("高角砲が必要です。");
                    if (haGuns.length >= 2 && aaRadar.length >= 1) {
                        result.canDo = true;
                        result.explanation = "秋月型固有の強力な対空カットインが発動可能です！（高角砲2つ + 対空電探）";
                        return result;
                    } else if (haGuns.length >= 1 && aaRadar.length >= 1) {
                        result.canDo = true;
                        result.explanation = "秋月型固有の対空カットインが発動可能です！（高角砲1つ + 対空電探）";
                        return result;
                    } else if (haGuns.length >= 2) {
                        result.canDo = true;
                        result.explanation = "秋月型固有の対空カットインが発動可能です！（高角砲2つ）";
                        return result;
                    } else {
                        result.missing.push("秋月型の固有カットインには最低でも「高角砲2つ」か「高角砲1つ+対空電探」が必要です。");
                        return result;
                    }
                } else if (ship.name && ship.name.includes("摩耶改二")) {
                    if (haGuns.length === 0) result.missing.push("高角砲が必要です。");
                    if (aaGunCD.length === 0) {
                        let availableMGs = aaGun.map(e => e.name).join("、 ");
                        if (availableMGs === "") availableMGs = "なし";
                        result.missing.push("特殊機銃(集中配備など)が必要です。\n※対空値9以上の機銃が必要です。（現在検知された機銃: " + availableMGs + "）\n※「12cm30連装噴進砲改二」などは対空値8のため特殊機銃扱いになりません。");
                    }
                    
                    if (haGuns.length >= 1 && aaGunCD.length >= 1) {
                        result.canDo = true;
                        if (aaRadar.length >= 1) {
                            result.explanation = "摩耶改二固有の強力な対空カットインが発動可能です！（高角砲 + 特殊機銃 + 対空電探）";
                        } else {
                            result.explanation = "摩耶改二固有の対空カットインが発動可能です！（高角砲 + 特殊機銃）";
                        }
                        return result;
                    } else {
                        return result;
                    }
                } else if (ship.name && ship.name.includes("五十鈴改二")) {
                    if (haGuns.length === 0) result.missing.push("高角砲が必要です。");
                    if (aaGun.length === 0) result.missing.push("機銃が必要です。");
                    
                    if (haGuns.length >= 1 && aaGun.length >= 1) {
                        result.canDo = true;
                        if (aaRadar.length >= 1) {
                            result.explanation = "五十鈴改二固有の強力な対空カットインが発動可能です！（高角砲 + 機銃 + 対空電探）";
                        } else {
                            result.explanation = "五十鈴改二固有の対空カットインが発動可能です！（高角砲 + 機銃）";
                        }
                        return result;
                    } else {
                        return result;
                    }
                }
                
                // 汎用
                if (haGuns.length === 0) result.missing.push("高角砲が必要です。");
                if (fd.length === 0 && haFd.length === 0) result.missing.push("高射装置、または高射装置内蔵の高角砲が必要です。");
                if (aaRadar.length === 0) result.missing.push("対空値2以上の対空電探が必要です。");
                
                if (result.missing.length === 0) {
                    result.canDo = true;
                    if (haFd.length >= 1) {
                        result.explanation = "汎用対空カットインが発動可能です！\\n（高角砲＋高射装置の内蔵武器 と 対空電探 を装備させてください）";
                    } else {
                        result.explanation = "汎用対空カットインが発動可能です！\\n（高角砲 ＋ 高射装置 ＋ 対空電探 を装備させてください）";
                    }
                }
                return result;
            }
        }

        ,{
            id: "day_main_main",
            name: "昼戦カットイン (主砲/主砲)",
            desc: "昼戦で主砲/主砲カットイン（攻撃力1.5倍）を行う。強力だが、徹甲弾装備時に比べると採用されにくい。",
            reqDesc: "・制空状態が「航空優勢」または「制空権確保」であること\n・主砲 2つ以上\n・徹甲弾 を装備していないこと\n・水上偵察機 または 水上爆撃機",
            check: function(ship, equips, allOwnedEquips) {
                let result = { canDo: false, missing: [], explanation: "" };
                let mainGuns = allOwnedEquips.filter(e => e.type && [1, 2, 3].includes(e.type[2]));
                let seaplanes = allOwnedEquips.filter(e => e.type && [10, 11].includes(e.type[2]));
                
                let isCarrierOrSub = [7, 11, 13, 14, 18].includes(ship.stype);
                let isInvalidType = [1, 2, 4, 19].includes(ship.stype);
                let totalPlaneCap = ship.slot_cap ? ship.slot_cap.reduce((a,b)=>a+b, 0) : 0;
                
                if (isCarrierOrSub || isInvalidType) {
                    result.missing.push("この艦種（" + (ship.typeName || "不明") + "）は昼戦の弾着観測射撃を行えません。");
                } else if (totalPlaneCap === 0) {
                    result.missing.push("この艦娘は搭載数(スロット容量)が0のため、水上機を飛ばして弾着観測射撃を行うことができません。");
                }
                
                if (mainGuns.length < 2) result.missing.push("主砲が2つ以上必要です。");
                if (seaplanes.length < 1) result.missing.push("水上機が必要です。");
                if (ship.slot && ship.slot.length < 3) result.missing.push("スロットが足りません。");
                
                if (result.missing.length === 0) {
                    result.canDo = true;
                    result.explanation = "発動可能です！（主砲×2、水上機×1）";
                }
                return result;
            }
        },
        {
            id: "day_main_radar",
            name: "昼戦カットイン (主砲/電探)",
            desc: "昼戦で主砲/電探カットイン（攻撃力1.2倍）を行う。",
            reqDesc: "・制空状態が「航空優勢」または「制空権確保」であること\n・主砲 1つ以上\n・電探 1つ以上\n・水上偵察機 または 水上爆撃機",
            check: function(ship, equips, allOwnedEquips) {
                let result = { canDo: false, missing: [], explanation: "" };
                let mainGuns = allOwnedEquips.filter(e => e.type && [1, 2, 3].includes(e.type[2]));
                let radars = allOwnedEquips.filter(e => e.type && [12, 13].includes(e.type[2]));
                let seaplanes = allOwnedEquips.filter(e => e.type && [10, 11].includes(e.type[2]));
                
                let isCarrierOrSub = [7, 11, 13, 14, 18].includes(ship.stype);
                let isInvalidType = [1, 2, 4, 19].includes(ship.stype);
                let totalPlaneCap = ship.slot_cap ? ship.slot_cap.reduce((a,b)=>a+b, 0) : 0;
                
                if (isCarrierOrSub || isInvalidType) {
                    result.missing.push("この艦種（" + (ship.typeName || "不明") + "）は昼戦の弾着観測射撃を行えません。");
                } else if (totalPlaneCap === 0) {
                    result.missing.push("この艦娘は搭載数(スロット容量)が0のため、水上機を飛ばして弾着観測射撃を行うことができません。");
                }
                
                if (mainGuns.length < 1) result.missing.push("主砲が必要です。");
                if (radars.length < 1) result.missing.push("電探が必要です。");
                if (seaplanes.length < 1) result.missing.push("水上機が必要です。");
                
                if (result.missing.length === 0) {
                    result.canDo = true;
                    result.explanation = "発動可能です！（主砲×1、電探×1、水上機×1）";
                }
                return result;
            }
        },
        {
            id: "day_main_sub",
            name: "昼戦カットイン (主砲/副砲)",
            desc: "昼戦で主砲/副砲カットイン（攻撃力1.1倍）を行う。",
            reqDesc: "・制空状態が「航空優勢」または「制空権確保」であること\n・主砲 1つ以上\n・副砲 1つ以上\n・水上偵察機 または 水上爆撃機",
            check: function(ship, equips, allOwnedEquips) {
                let result = { canDo: false, missing: [], explanation: "" };
                let mainGuns = allOwnedEquips.filter(e => e.type && [1, 2, 3].includes(e.type[2]));
                let subGuns = allOwnedEquips.filter(e => e.type && e.type[2] === 4);
                let seaplanes = allOwnedEquips.filter(e => e.type && [10, 11].includes(e.type[2]));
                
                let isCarrierOrSub = [7, 11, 13, 14, 18].includes(ship.stype);
                let isInvalidType = [1, 2, 4, 19].includes(ship.stype);
                let totalPlaneCap = ship.slot_cap ? ship.slot_cap.reduce((a,b)=>a+b, 0) : 0;
                
                if (isCarrierOrSub || isInvalidType) {
                    result.missing.push("この艦種（" + (ship.typeName || "不明") + "）は昼戦の弾着観測射撃を行えません。");
                } else if (totalPlaneCap === 0) {
                    result.missing.push("この艦娘は搭載数(スロット容量)が0のため、水上機を飛ばして弾着観測射撃を行うことができません。");
                }
                
                if (mainGuns.length < 1) result.missing.push("主砲が必要です。");
                if (subGuns.length < 1) result.missing.push("副砲が必要です。");
                if (seaplanes.length < 1) result.missing.push("水上機が必要です。");
                
                if (result.missing.length === 0) {
                    result.canDo = true;
                    result.explanation = "発動可能です！（主砲×1、副砲×1、水上機×1）";
                }
                return result;
            }
        },
        {
            id: "night_main_torpedo",
            name: "夜戦 主砲/魚雷カットイン",
            desc: "夜戦で主砲/魚雷カットイン（攻撃力1.3倍×2回）を行う。",
            reqDesc: "・主砲 1つ以上 または 2つ\n・魚雷 1つ",
            check: function(ship, equips, allOwnedEquips) {
                let result = { canDo: false, missing: [], explanation: "" };
                let mainGuns = allOwnedEquips.filter(e => e.type && [1, 2, 3].includes(e.type[2]));
                let torps = allOwnedEquips.filter(e => e.type && e.type[2] === 5);
                
                if ([7, 11, 18].includes(ship.stype)) {
                    result.missing.push("空母系は通常の夜戦カットインを行えません。（夜間作戦空母などの特殊条件が必要です）");
                }
                
                if (mainGuns.length < 1) result.missing.push("主砲が必要です。");
                if (torps.length < 1) result.missing.push("魚雷が必要です。");
                
                let luck = ship.luck || 10;
                let luckAdvice = (luck < 40) ? "\n※運が低いため発動率に難があります。" : "";

                if (result.missing.length === 0) {
                    result.canDo = true;
                    result.explanation = "発動可能です！（主砲×1〜2、魚雷×1）" + luckAdvice;
                }
                return result;
            }
        },
        {
            id: "colorado_touch",
            name: "コロラドタッチ (Colorado Touch)",
            desc: "Coloradoを旗艦とし、梯形陣を選択すると発動する特殊砲撃。艦隊の1,2,3番艦が連続して攻撃する。",
            reqDesc: "・旗艦が「Colorado」であること\n・2番艦、3番艦が戦艦であること\n・出撃時、陣形選択で「梯形陣」を選ぶこと",
            check: function(ship, equips, allOwnedEquips) {
                let result = { canDo: false, missing: [], explanation: "" };
                if (!ship.name || !ship.name.includes("Colorado")) {
                    result.missing.push(`この艦娘（${ship.name}）はColoradoではありません。旗艦をColoradoにする必要があります。`);
                }
                if (result.missing.length === 0) {
                    result.canDo = true;
                    result.explanation = "発動条件を満たせます。Coloradoを旗艦にし、2番艦・3番艦に戦艦を配置して「梯形陣」を選択してください。徹甲弾や水上電探を装備させると倍率が上がります。";
                }
                return result;
            }
        },
        {
            id: "yamato_attack",
            name: "大和型特殊攻撃 (大和/武蔵)",
            desc: "大和改二/改二重 または 武蔵改二 を旗艦とし、梯形陣等を選択すると発動。強力な3連続攻撃を放つ。（攻撃力最大約2.5倍以上）",
            reqDesc: "・旗艦が「大和改二/改二重」または「武蔵改二」であること\n・2番艦が特定の戦艦であること",
            check: function(ship, equips, allOwnedEquips) {
                let result = { canDo: false, missing: [], explanation: "" };
                if (!ship.name || !(ship.name.includes("大和改二") || ship.name.includes("武蔵改二"))) {
                    result.missing.push(`この艦娘（${ship.name}）は大和改二系・武蔵改二ではありません。`);
                }
                if (result.missing.length === 0) {
                    result.canDo = true;
                    result.explanation = "大和型特殊攻撃の旗艦条件を満たしています！第2艦に指定の戦艦(武蔵改二/長門改二/陸奥改二等)を配置し徹甲弾＋電探を装備させると最高倍率となります。";
                }
                return result;
            }
        },
        {
            id: "kongo_night",
            name: "僚艦夜戦突撃 (金剛型改二丙)",
            desc: "夜戦開始時に一定確率で発動し、旗艦と2番艦が強力な連続攻撃を行う。",
            reqDesc: "・旗艦が「金剛改二丙」または「比叡改二丙」等であること\n・2番艦が金剛型改二丙・改二等であること",
            check: function(ship, equips, allOwnedEquips) {
                let result = { canDo: false, missing: [], explanation: "" };
                if (!ship.name || !(ship.name.includes("金剛改二丙") || ship.name.includes("比叡改二丙") || ship.name.includes("榛名改二乙/丙") || ship.name.includes("霧島改二丙"))) {
                    result.missing.push(`この艦娘（${ship.name}）は指定の金剛型（改二丙など）ではありません。`);
                }
                if (result.missing.length === 0) {
                    result.canDo = true;
                    result.explanation = "僚艦夜戦突撃の旗艦条件を満たしています！水上電探や徹甲弾を装備させると倍率がアップします。";
                }
                return result;
            }
        }

    ],

    init: function() {
        this.renderTypeSelect();
        this.renderShipSelect();
        
        const btn = document.getElementById("btn-check-cutin");
        if(btn) {
            btn.addEventListener("click", () => {
                this.runCheck();
            });
        }

        // リロードなどのタイミングで艦隊データが更新されたら再描画
        document.addEventListener("storageDataLoaded", () => {
            this.renderShipSelect();
        });

        // タブがクリックされた時に艦娘リストを更新する
        document.querySelectorAll(".tab-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                if (e.target.getAttribute("data-target") === "tab10") {
                    this.renderShipSelect();
                }
            });
        });
    },

    renderTypeSelect: function() {
        const select = document.getElementById("cutin-type-select");
        if(!select) return;
        select.innerHTML = "";
        this.types.forEach(t => {
            const opt = document.createElement("option");
            opt.value = t.id;
            opt.textContent = t.name;
            select.appendChild(opt);
        });
    },

    renderShipSelect: function() {
        const select = document.getElementById("cutin-ship-select");
        if(!select) return;
        select.innerHTML = "";
        const ownedShips = (typeof AppState !== 'undefined' && AppState.userData.ships) ? AppState.userData.ships : [];
        if (ownedShips.length === 0) {
            const opt = document.createElement("option");
            opt.value = "";
            opt.textContent = "(保有艦娘がいません。データをインポートしてください)";
            select.appendChild(opt);
            return;
        }
        
        // レベル順にソート
        ownedShips.sort((a,b) => (b.lv||0) - (a.lv||0));
        
        ownedShips.forEach(s => {
            const m = MasterData.Ships[s.id];
            const name = m ? m.name : "不明艦";
            const opt = document.createElement("option");
            opt.value = s.uid;
            opt.textContent = `Lv${s.lv} ${name}`;
            select.appendChild(opt);
        });
    },
    
    runCheck: function() {
        const resultDiv = document.getElementById("cutin-result");
        const typeId = document.getElementById("cutin-type-select").value;
        const shipUidStr = document.getElementById("cutin-ship-select").value;
        
        if (!typeId || !shipUidStr) {
            resultDiv.innerHTML = "<span style='color:red;'>種別と艦娘を選択してください。</span>";
            return;
        }
        
        const shipUid = parseInt(shipUidStr, 10);
        const typeData = this.types.find(t => t.id === typeId);
        const ownedShips = (typeof AppState !== 'undefined' && AppState.userData.ships) ? AppState.userData.ships : [];
        const ship = ownedShips.find(s => s.uid === shipUid);
        
        if(!ship) {
            resultDiv.innerHTML = "<span style='color:red;'>艦娘データが見つかりません。</span>";
            return;
        }
        
        const mShip = MasterData.Ships[ship.id] || { name: "不明艦", stype: 0 };
        const mergedShip = Object.assign({}, mShip, ship);
        
        const allOwnedEquipsRaw = (typeof AppState !== 'undefined' && AppState.userData.items) ? AppState.userData.items : [];
        const allOwnedEquips = allOwnedEquipsRaw.map(eq => {
            const m = MasterData.Items[eq.id] || {};
            return Object.assign({}, m, eq);
        });
        
        const result = typeData.check(mergedShip, [], allOwnedEquips);
        
        let html = `<h3>${typeData.name}</h3>`;
        html += `<div style="margin-bottom:8px;"><strong>【概要】</strong><br>${typeData.desc}</div>`;
        html += `<div style="margin-bottom:8px; padding:8px; background-color:#e8f4f8; border:1px solid #b6d4e1;"><strong>【基本発動条件】</strong><br>${typeData.reqDesc.replace(/\n/g, '<br>')}</div>`;
        html += `<hr style="margin:8px 0; border:0; border-top:1px dashed #aaa;">`;
        html += `<div style="margin-bottom:8px;"><strong>【判定結果: ${mergedShip.name} (Lv${mergedShip.lv})】</strong></div>`;
        
        if (result.canDo) {
            html += `<div style="color:green; font-weight:bold; margin-bottom:8px; font-size:14px;">⭕ 発動可能です！</div>`;
            html += `<div>${result.explanation.replace(/\n/g, '<br>')}</div>`;
        } else {
            html += `<div style="color:red; font-weight:bold; margin-bottom:8px; font-size:14px;">❌ 現在の状況では発動できません</div>`;
            html += `<div>以下の理由により、この艦娘では発動できないか、装備が不足しています：</div>`;
            html += `<ul style="color:#aa0000; font-weight:bold;">`;
            result.missing.forEach(msg => {
                html += `<li>${msg}</li>`;
            });
            html += `</ul>`;
        }
        
        resultDiv.innerHTML = html;
    }
};

window.addEventListener('DOMContentLoaded', () => {
    CutinSimulator.init();
});
