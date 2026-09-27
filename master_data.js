/**
 * master_data.js
 * 外部通信なしでオフライン動作させるための、内蔵知識データベース。
 */

const MasterData = {
    matchStype: function(typeName, reqStype) {
        if (!typeName) return false;
        if (reqStype === 'ANY') return true;
        if (typeName.includes(reqStype)) return true;
        
        const aliases = {
            '雷巡': ['重雷装巡洋艦'],
            '水母': ['水上機母艦'],
            '航戦': ['航空戦艦'],
            '航巡': ['航空巡洋艦'],
            '軽空母': ['軽空母'],
            '正規空母': ['正規空母', '装甲空母'],
            '空母系': ['軽空母', '正規空母', '装甲空母'],
            '潜水艦': ['潜水艦', '潜水空母'],
            '潜水': ['潜水艦', '潜水空母'],
            '戦艦': ['戦艦', '航空戦艦', '超弩級戦艦', '巡洋戦艦', '高速戦艦']
        };
        
        if (aliases[reqStype]) {
            return aliases[reqStype].some(a => typeName.includes(a));
        }
        return false;
    },
    Stype: typeof WikiKnowledgeDB !== 'undefined' ? WikiKnowledgeDB.Stype : {},
    EquipType: {},
    Ships: typeof WikiKnowledgeDB !== 'undefined' ? WikiKnowledgeDB.Ships : {},
    Items: typeof WikiKnowledgeDB !== 'undefined' ? WikiKnowledgeDB.Items : {},
    KC3: {
        Akashi: typeof WikiKnowledgeDB !== 'undefined' ? WikiKnowledgeDB.Akashi : {},
        QuestsDict: typeof WikiKnowledgeDB !== 'undefined' ? WikiKnowledgeDB.Quests : {},
        Edges: typeof WikiKnowledgeDB !== 'undefined' ? WikiKnowledgeDB.Routing : {},
        Nodes: typeof WikiKnowledgeDB !== 'undefined' ? WikiKnowledgeDB.Nodes : {}
    },

    Expeditions: {
        2: { id: 2, name: '長距離練習航海', time: 30, fuel: 0, ammo: 100, steel: 30, baux: 0, flag_lv: 2, count: 4, sum_lv: 0, rules: [] },
        3: { id: 3, name: '警備任務', time: 20, fuel: 30, ammo: 30, steel: 40, baux: 0, flag_lv: 3, count: 3, sum_lv: 0, rules: [] },
        4: { id: 4, name: '対潜警戒任務', time: 50, fuel: 0, ammo: 60, steel: 0, baux: 0, flag_lv: 3, count: 3, sum_lv: 0, rules: [['軽巡',1],['駆逐',2]] },
        5: { id: 5, name: '海上護衛任務', time: 90, fuel: 200, ammo: 200, steel: 20, baux: 20, flag_lv: 3, count: 4, sum_lv: 0, rules: [['軽巡',1],['駆逐',2]] },
        6: { id: 6, name: '防空射撃演習', time: 40, fuel: 0, ammo: 0, steel: 0, baux: 80, flag_lv: 4, count: 4, sum_lv: 0, rules: [] },
        9: { id: 9, name: 'タンカー護衛任務', time: 240, fuel: 350, ammo: 0, steel: 0, baux: 0, flag_lv: 3, count: 4, sum_lv: 0, rules: [['軽巡',1],['駆逐',2]] },
        11: { id: 11, name: 'ボーキサイト輸送任務', time: 300, fuel: 0, ammo: 0, steel: 0, baux: 250, flag_lv: 6, count: 4, sum_lv: 0, rules: [['駆逐',2]] },
        13: { id: 13, name: '鼠輸送作戦', time: 240, fuel: 240, ammo: 300, steel: 0, baux: 0, flag_lv: 5, count: 6, sum_lv: 0, rules: [['軽巡',1],['駆逐',4]] },
        21: { id: 21, name: '北方鼠輸送作戦', time: 140, fuel: 320, ammo: 270, steel: 0, baux: 0, flag_lv: 15, count: 5, sum_lv: 30, rules: [['軽巡',1],['駆逐',4]], drums: {ships: 3, total: 3} },
        24: { id: 24, name: '北方航路海上護衛', time: 500, fuel: 500, ammo: 0, steel: 0, baux: 150, flag_lv: 50, count: 6, sum_lv: 200, rules: [['軽巡',1],['駆逐',4]] },
        32: { id: 32, name: '遠洋練習航海', time: 1440, fuel: 0, ammo: 0, steel: 0, baux: 0, flag_lv: 24, count: 3, sum_lv: 150, rules: [['練習巡洋艦',1],['駆逐',2]] },
        37: { id: 37, name: '東京急行', time: 165, fuel: 0, ammo: 380, steel: 270, baux: 0, flag_lv: 50, count: 6, sum_lv: 200, rules: [['軽巡',1],['駆逐',5]], drums: {ships: 3, total: 4} },
        38: { id: 38, name: '東京急行(弐)', time: 175, fuel: 420, ammo: 0, steel: 200, baux: 0, flag_lv: 65, count: 6, sum_lv: 240, rules: [['駆逐',5]], drums: {ships: 4, total: 8} },
        40: { id: 40, name: '水上機前線輸送', time: 400, fuel: 300, ammo: 300, steel: 0, baux: 100, flag_lv: 25, count: 6, sum_lv: 150, rules: [['軽巡',1],['水上機母艦',2],['駆逐',2]] },
        'A1': { id: 'A1', name: '兵站線確保！海上護衛作戦', time: 35, fuel: 100, ammo: 100, steel: 0, baux: 0, flag_lv: 15, count: 4, sum_lv: 10, rules: [['軽巡',1],['駆逐',3]] },
        'B1': { id: 'B1', name: '南西海域交戦度胸試し', time: 40, fuel: 50, ammo: 50, steel: 50, baux: 100, flag_lv: 40, count: 5, sum_lv: 150, rules: [['軽巡',1],['駆逐',3]], req_stats: { aa: 150, asw: 120, los: 100 } }
    },

    Quests: [
        { id: "A4", name: "「第六駆逐隊」を編成せよ！", type: "編成", desc: "「暁」「響」「雷」「電」の4隻による第六駆逐隊を編成する", req_ships: ["暁", "響", "雷", "電"] },
        { id: "Bq1", name: "新編成「三川艦隊」、鉄底海峡に突入せよ！", type: "出撃", desc: "鳥海 青葉 衣笠 加古 古鷹 天龍から4隻、5-1,5-3,5-4ボスS勝利", req_ships_any: ["鳥海", "青葉", "衣笠", "加古", "古鷹", "天龍"], req_count: 4 },
        { id: "A84", name: "精鋭「第十駆逐隊」、抜錨準備！", type: "編成", desc: "「夕雲改二」「巻雲改二」「風雲改二」「秋雲改二」編成", req_ships: ["夕雲改二", "巻雲改二", "風雲改二", "秋雲改二"], checkLevel: true }, // 改二判定用
        { id: "B117", name: "主力オブ主力、抜錨開始！", type: "出撃", desc: "夕雲型改二を2隻以上含む編成で5-3, 5-4, 5-5ボスA勝利", req_ships_any: ["夕雲改二", "巻雲改二", "風雲改二", "長波改二", "高波改二", "沖波改二", "朝霜改二", "早波改二", "藤波改二", "清霜改二", "早霜改二", "秋雲改二"], req_count: 2 },
        { id: "Bw1", name: "あ号作戦", type: "出撃", desc: "出撃36回、S勝利6回、ボス24回、ボス勝利12回", req_ships_any: [], req_count: 0 },
        { id: "Bw2", name: "い号作戦", type: "出撃", desc: "空母20隻撃沈", req_ships_any: [], req_count: 0 },
        { id: "Bw3", name: "海上護衛戦", type: "出撃", desc: "潜水艦15隻撃沈", req_ships_any: [], req_count: 0 },
        { id: "Bw4", name: "ろ号作戦", type: "出撃", desc: "補給艦50隻撃沈", req_ships_any: [], req_count: 0 }
    ],

    Recipes: [
        { name: "徹甲弾レシピ", type: "徹甲弾", fuel: 10, ammo: 90, steel: 90, baux: 30, secretary: "戦艦", target: "一式徹甲弾 / 九一式徹甲弾" },
        { name: "艦載機レシピ", type: "艦上戦闘機", fuel: 20, ammo: 60, steel: 10, baux: 110, secretary: "空母", target: "烈風 / 紫電改二 / 流星改" },
        { name: "ソナー爆雷レシピ", type: "ソナー", fuel: 10, ammo: 30, steel: 10, baux: 31, secretary: "駆逐/軽巡", target: "三式水中探信儀 / 三式爆雷投射機" },
        { name: "電探レシピ", type: "小型電探", fuel: 10, ammo: 10, steel: 250, baux: 250, secretary: "戦艦", target: "22号/33号/13号対空電探" }
    ],

    MapStrategies: {

        "6-1": {
                "name": "中部海域/6",
                "requirements": "この海域について[編集]マップ概要この海域をクリアするために",
                "stypes": [
                        "駆逐",
                        "駆逐",
                        "駆逐",
                        "軽巡",
                        "軽巡",
                        "水母"
                ],
                "desc": "空母で制空権や索敵条件を掌握しつつ、空母・軽巡で開幕で生き残った敵を叩く編成。..."
        },
        "6-2": {
                "name": "中部海域/6",
                "requirements": "この海域についてマップ概要6-1と比べれば運要素が控えめな分",
                "stypes": [
                        "駆逐",
                        "駆逐",
                        "駆逐",
                        "軽巡",
                        "軽巡",
                        "水母"
                ],
                "desc": "実装日：2019年8月8日旗艦指定：なし随伴指定：自由枠6達成条件：ボス勝利Sx1他海域達成条件：..."
        },
        "6-4": {
                "name": "中部海域/6",
                "requirements": "この海域についてマップ概要2016/03/11実装。ボス編成",
                "stypes": [
                        "駆逐",
                        "駆逐",
                        "駆逐",
                        "軽巡",
                        "軽巡",
                        "水母"
                ],
                "desc": "敵編成※司令部lv110未満の敵編成情報を現在募集中。下例のように詳細に報告してくれるとまとめる際に助かります。※編成報告例：Aマス 司令Lv104 空母ヲ級flagship(艦載機白)、重巡リ級elite、雷巡チ級、軽巡ホ級、駆逐ハ級、駆逐ロ級 輪形 EXP100..."
        },
        "6-5": {
                "name": "中部海域/6",
                "requirements": "この海域について[編集]マップ概要2016年10月5日に実装",
                "stypes": [
                        "駆逐",
                        "駆逐",
                        "駆逐",
                        "軽巡",
                        "軽巡",
                        "水母"
                ],
                "desc": "ボスはイベント海域でおなじみの空母棲姫であるが、敵側が12隻からなる連合艦隊を編成している(第三警戒航行序列・輪形陣)。連合艦隊については専用ページもよく読むこと。..."
        },
        "3-1": {
                "name": "北方海域/3",
                "requirements": "この海域についてマップ概要敵は水上艦中心で待ち構えるマップ。",
                "stypes": [
                        "駆逐",
                        "駆逐",
                        "駆逐",
                        "軽巡",
                        "軽巡",
                        "水母"
                ],
                "desc": "実装日：2017年12月11日旗艦指定：なし随伴指定：軽巡1+自由枠5達成条件：ボス勝利A以上x1他海域達成条件：..."
        },
        "3-2": {
                "name": "北方海域/3",
                "requirements": "この海域についてマップ概要まず、この海域の解放には3-1攻略",
                "stypes": [
                        "駆逐",
                        "駆逐",
                        "駆逐",
                        "軽巡",
                        "軽巡",
                        "水母"
                ],
                "desc": "ルート分岐に関しては、かなり厳格化されており、一般的な「軽巡×1、駆逐×5」等を満たせば、ボスマスへのルートからの逸れは原則的に発生しない。..."
        },
        "3-3": {
                "name": "北方海域/3",
                "requirements": "この海域についてマップ概要この海域の開放には3-2に加え、未",
                "stypes": [
                        "駆逐",
                        "駆逐",
                        "駆逐",
                        "軽巡",
                        "軽巡",
                        "水母"
                ],
                "desc": "実装日：2017年12月11日旗艦指定：なし随伴指定：軽巡1+自由枠5達成条件：ボス勝利A以上x1他海域達成条件：..."
        },
        "3-4": {
                "name": "北方海域/3",
                "requirements": "この海域についてマップ概要基本的には2-4「沖ノ島海域」の発",
                "stypes": [
                        "駆逐",
                        "駆逐",
                        "駆逐",
                        "軽巡",
                        "軽巡",
                        "水母"
                ],
                "desc": "水母1正規空母2軽空母2(球磨改二,多摩改二,由良改二,矢矧改二乙)1の編成は「疑似空母6隻編成」と呼ばれ、戦果稼ぎに特化したランカー御用達の編成。..."
        },
        "5-1": {
                "name": "南方海域/5",
                "requirements": "この海域についてマップ概要北方海域の最深部 (3-4)をクリ",
                "stypes": [
                        "駆逐",
                        "駆逐",
                        "駆逐",
                        "軽巡",
                        "軽巡",
                        "水母"
                ],
                "desc": "実装日:2014年10月10日旗艦指定:なし随伴指定:扶桑型/伊勢型/長門型/大和型3+軽巡1+自由枠2達成条件:ボス勝利Sx1補足：..."
        },
        "5-4": {
                "name": "南方海域/5",
                "requirements": "この海域についてマップ概要第一期では、レベリングと戦果稼ぎの",
                "stypes": [
                        "駆逐",
                        "駆逐",
                        "駆逐",
                        "軽巡",
                        "軽巡",
                        "水母"
                ],
                "desc": "「大発動艇系」は大発動艇、特大発動艇、大発動艇(八九式中戦車＆陸戦隊)、特二式内火艇を指す。特大発動艇＋戦車第11連隊及びM4A1 DDは含まれない。※条件は上に書いてあるものが優先..."
        },
        "7-1": {
                "name": "南西海域/7",
                "requirements": "この海域についてマップ概要マップ全般についてEOを除く通常海",
                "stypes": [
                        "駆逐",
                        "駆逐",
                        "駆逐",
                        "軽巡",
                        "軽巡",
                        "水母"
                ],
                "desc": "実装日：2018年11月16日旗艦指定：なし随伴指定：自由枠6達成条件：ボス勝利Sx3他海域達成条件：..."
        },
        "7-3": {
                "name": "南西海域/7",
                "requirements": "この海域について[編集]マップ概要2020年09月17日のメ",
                "stypes": [
                        "駆逐",
                        "駆逐",
                        "駆逐",
                        "軽巡",
                        "軽巡",
                        "水母"
                ],
                "desc": "戦力ゲージ1(Pマス出現前) ルート分岐法則Pマスが出現するまでは、こちらのルート分岐法則を参照。..."
        },
        "7-5": {
                "name": "南西海域/7",
                "requirements": "この海域についてマップ概要2023年1月20日のメンテナンス",
                "stypes": [
                        "駆逐",
                        "駆逐",
                        "駆逐",
                        "軽巡",
                        "軽巡",
                        "水母"
                ],
                "desc": "各海戦に参加した経歴のある艦娘に史実補正が確認されている*7*8..."
        },
        "2-1": {
                "name": "南西諸島海域/2",
                "requirements": "この海域についてマップ概要「空母3隻以上」or「航空戦艦2隻",
                "stypes": [
                        "駆逐",
                        "駆逐",
                        "駆逐",
                        "軽巡",
                        "軽巡",
                        "水母"
                ],
                "desc": "実装日：2019年2月27日旗艦指定：なし随伴指定：軽空母/軽巡級1+駆逐/海防3+自由枠2達成条件：ボス勝利Sx1他海域達成条件：..."
        },
        "2-2": {
                "name": "南西諸島海域/2",
                "requirements": "この海域についてマップ概要序盤の海域ではあるが、1-4と同様",
                "stypes": [
                        "駆逐",
                        "駆逐",
                        "駆逐",
                        "軽巡",
                        "軽巡",
                        "水母"
                ],
                "desc": "実装日：2018年12月7日旗艦指定：なし随伴指定：航空母艦(正空/装空/軽空母)1+自由枠5達成条件：ボス勝利Sx1他海域達成条件：..."
        },
        "2-4": {
                "name": "南西諸島海域/2",
                "requirements": "この海域について[編集]海域概要序盤の難関マップの一つで初心",
                "stypes": [
                        "駆逐",
                        "駆逐",
                        "駆逐",
                        "軽巡",
                        "軽巡",
                        "水母"
                ],
                "desc": "どちらも編成に制限はない。もちろん同時遂行も問題なく可能。..."
        },
        "2-5": {
                "name": "南西諸島海域/2",
                "requirements": "この海域についてこの海域について[編集]マップ概要南西諸島海",
                "stypes": [
                        "駆逐",
                        "駆逐",
                        "駆逐",
                        "軽巡",
                        "軽巡",
                        "水母"
                ],
                "desc": "編成例：航巡2(ドラム缶要員)+(戦艦級1～3)+(重巡級1～3)+(雷巡0～1)　固定のためには低速艦が含まれている必要がある。..."
        },
        "4-1": {
                "name": "西方海域/4",
                "requirements": "この海域についてマップ概要(戦艦+空母)3隻以上入れると初手",
                "stypes": [
                        "駆逐",
                        "駆逐",
                        "駆逐",
                        "軽巡",
                        "軽巡",
                        "水母"
                ],
                "desc": "ルート分岐はKCNav - KanColle Navigatortとコメント欄から予測※条件は上に書いてあるものが優先..."
        },
        "4-2": {
                "name": "西方海域/4",
                "requirements": "この海域についてマップ概要海域解放には南西海域 ブルネイ泊地",
                "stypes": [
                        "駆逐",
                        "駆逐",
                        "駆逐",
                        "軽巡",
                        "軽巡",
                        "水母"
                ],
                "desc": "実装日：2014年12月1日旗艦指定：なし随伴指定：航空母艦(正空/装空/軽空母)2+駆逐2+自由枠2達成条件：ボス勝利Sx1補足：..."
        },
        "4-3": {
                "name": "西方海域/4",
                "requirements": "この海域についてマップ概要通常海域で初めて、ボスが陸上型深海",
                "stypes": [
                        "駆逐",
                        "駆逐",
                        "駆逐",
                        "軽巡",
                        "軽巡",
                        "水母"
                ],
                "desc": "正規空母1+空母系1+軽巡1+駆逐2+自由枠1(重巡級・雷巡)..."
        },
        "4-5": {
                "name": "西方海域/4",
                "requirements": "この海域について[編集]マップ概要西方海域の中で頭一つ抜けて",
                "stypes": [
                        "駆逐",
                        "駆逐",
                        "駆逐",
                        "軽巡",
                        "軽巡",
                        "水母"
                ],
                "desc": "いずれも前哨戦かゲージ破壊後に達成すると良い。..."
        },
        "1-1": {
                "name": "鎮守府海域/1",
                "requirements": "この海域についてマップ概要最初から解放されている海域。駆逐艦",
                "stypes": [
                        "駆逐",
                        "駆逐",
                        "駆逐",
                        "軽巡",
                        "軽巡",
                        "水母"
                ],
                "desc": "実装日：2020年2月7日旗艦指定：なし随伴指定：海防3+自由枠2以下達成条件：ボス勝利A以上x1他海域達成条件：..."
        },
        "1-2": {
                "name": "鎮守府海域/1",
                "requirements": "この海域についてマップ概要敵は駆逐艦・軽巡に加え雷巡が出没す",
                "stypes": [
                        "駆逐",
                        "駆逐",
                        "駆逐",
                        "軽巡",
                        "軽巡",
                        "水母"
                ],
                "desc": "実装日：2019年2月27日旗艦指定：なし随伴指定：軽空母/軽巡級1+駆逐/海防3+自由枠2達成条件：ボス勝利Sx1他海域達成条件：..."
        },
        "1-3": {
                "name": "鎮守府海域/1",
                "requirements": "この海域についてマップ概要敵の重巡や戦艦が初登場する海域とな",
                "stypes": [
                        "駆逐",
                        "駆逐",
                        "駆逐",
                        "軽巡",
                        "軽巡",
                        "水母"
                ],
                "desc": "実装日：2019年2月27日旗艦指定：なし随伴指定：軽空母/軽巡級1+駆逐/海防3+自由枠2達成条件：ボス勝利Sx1他海域達成条件：..."
        },
        "1-4": {
                "name": "鎮守府海域/1",
                "requirements": "この海域について[編集]概要艦これプレイにおいて第一の関門と",
                "stypes": [
                        "駆逐",
                        "駆逐",
                        "駆逐",
                        "軽巡",
                        "軽巡",
                        "水母"
                ],
                "desc": "実装日：2014年9月26日旗艦指定：軽巡随伴指定：水雷戦隊（軽巡0～2+駆逐1～5）※他の艦種は不可達成条件：ボス勝利Sx1補足：..."
        },
        "1-5": {
                "name": "鎮守府海域/1",
                "requirements": "この海域についてマップ概要1－4を攻略すると解放される、一番",
                "stypes": [
                        "駆逐",
                        "駆逐",
                        "駆逐",
                        "軽巡",
                        "軽巡",
                        "水母"
                ],
                "desc": "実装日：2014年10月24日旗艦指定：なし随伴指定：自由枠4達成条件：ボス勝利A以上x3補足：..."
        },
        "1-6": {
                "name": "鎮守府海域/1",
                "requirements": "この海域について[編集]マップ概要2015/4/10に実装さ",
                "stypes": [
                        "駆逐",
                        "駆逐",
                        "駆逐",
                        "軽巡",
                        "軽巡",
                        "水母"
                ],
                "desc": "基本的に下(AEGFBN)ルートを通るのがオススメ。全ての任務共通で、バイト艦等を使って無理やり進撃し、Nマス到達時までに指定艦(数)が不足していると任務が進まないので注意しよう。..."
        }

},

    Abyssals: {
        1501: { id: 1501, name: "戦艦ル級", fire: 90, torp: 0, aa: 70, armor: 80, hp: 90 },
        1502: { id: 1502, name: "戦艦タ級", fire: 100, torp: 0, aa: 80, armor: 90, hp: 90 },
        1503: { id: 1503, name: "空母ヲ級", fire: 0, torp: 0, aa: 90, armor: 80, hp: 80, bomb: 80 },
        1504: { id: 1504, name: "重巡リ級", fire: 60, torp: 50, aa: 40, armor: 60, hp: 60 },
        1505: { id: 1505, name: "軽巡ヘ級", fire: 40, torp: 50, aa: 30, armor: 40, hp: 40 },
        1506: { id: 1506, name: "駆逐イ級", fire: 20, torp: 40, aa: 20, armor: 20, hp: 30 },
        1507: { id: 1507, name: "潜水カ級", fire: 0, torp: 60, aa: 0, armor: 20, hp: 25 },
        1508: { id: 1508, name: "駆逐ナ級後期型", fire: 65, torp: 95, aa: 80, armor: 55, hp: 60 },
        1509: { id: 1509, name: "潜水ヨ級", fire: 0, torp: 80, aa: 0, armor: 30, hp: 40 },
        1510: { id: 1510, name: "輸送ワ級", fire: 10, torp: 0, aa: 10, armor: 20, hp: 50 }
    },

    EnemyFleets: {
        "1-1": [1505, 1506, 1506], // 軽巡ヘ級, 駆逐イ級x2
        "1-2": [1505, 1506, 1506, 1506], // 軽巡ヘ級, 駆逐イ級x3
        "1-3": [1504, 1505, 1506, 1506, 1506], // 重巡リ級, 軽巡ヘ級, 駆逐イ級x3
        "1-4": [1503, 1504, 1505, 1506, 1506], // 空母ヲ級, 重巡リ級, 軽巡ヘ級, 駆逐イ級x2
        "1-5": [1509, 1507, 1507, 1507],
        "2-1": [1503, 1503, 1510, 1510, 1506, 1506],
        "2-5": [1501, 1501, 1504, 1505, 1506, 1506],
        "3-2": [1505, 1506, 1506, 1506, 1506, 1506],
        "4-5": [1502, 1502, 1503, 1508, 1508, 1508],
        "5-3": [1504, 1504, 1505, 1508, 1508, 1508],
        "7-1": [1507, 1507, 1507, 1507]
    },

    getDemoUserData: function() {
        return {
            ships: [
                { uid: 1, id: 541, name: "長門改二", lv: 99, stype: 8, kyouka: [0,0,0,0,0], exp: 1000000, slot: [9,9,116,59], sp_slot: -1 },
                { uid: 2, id: 883, name: "矢矧改二乙", lv: 97, stype: 3, kyouka: [0,0,0,0,0], exp: 900000, slot: [50,50,59,0], sp_slot: -1 },
                { uid: 3, id: 547, name: "雪風改二", lv: 98, stype: 2, kyouka: [0,0,0,0,0], exp: 950000, slot: [58,58,58], sp_slot: -1 },
                { uid: 4, id: 464, name: "霞改二", lv: 90, stype: 2, kyouka: [0,0,0,0,0], exp: 600000, slot: [68,68,68], sp_slot: -1 },
                { uid: 5, id: 228, name: "陽炎改", lv: 55, stype: 2, kyouka: [0,0,0,0,0], exp: 120000, slot: [3,3,0], sp_slot: -1 },
                { uid: 6, id: 9, name: "暁", lv: 1, stype: 2, kyouka: [0,0,0,0,0], exp: 0, slot: [0,0], sp_slot: -1 },
                { uid: 7, id: 10, name: "響", lv: 1, stype: 2, kyouka: [0,0,0,0,0], exp: 0, slot: [0,0], sp_slot: -1 },
                { uid: 8, id: 599, name: "赤城改二", lv: 99, stype: 11, kyouka: [0,0,0,0,0], exp: 1000000, slot: [101,102,-1,-1,-1], sp_slot: -1 },
                { uid: 9, id: 462, name: "瑞鶴改二甲", lv: 99, stype: 18, kyouka: [0,0,0,0,0], exp: 1000000, slot: [103,-1,-1,-1], sp_slot: -1 }
            ],
            items: [
                { uid: 1, id: 9, name: "46cm三連装砲", level: 4, alv: 0 },
                { uid: 2, id: 9, name: "46cm三連装砲", level: 0, alv: 0 },
                { uid: 3, id: 116, name: "一式徹甲弾", level: 6, alv: 0 },
                { uid: 4, id: 58, name: "61cm五連装(酸素)魚雷", level: 10, alv: 0 },
                { uid: 7, id: 68, name: "大発動艇", level: 0, alv: 0 },
                { uid: 8, id: 68, name: "大発動艇", level: 0, alv: 0 },
                { uid: 10, id: 75, name: "ドラム缶(輸送用)", level: 0, alv: 0 },
                { uid: 11, id: 75, name: "ドラム缶(輸送用)", level: 0, alv: 0 },
                { uid: 13, id: 47, name: "三式水中探信儀", level: 0, alv: 0 },
                { uid: 101, id: 22, name: "烈風", level: 0, alv: 7 },
                { uid: 102, id: 53, name: "紫電改二", level: 0, alv: 7 },
                { uid: 103, id: 59, name: "零式水上観測機", level: 0, alv: 7 },
                { uid: 104, id: 22, name: "烈風", level: 0, alv: 7 }
            ],
            decks: [
                {
                    api_id: 1,
                    api_name: "第1艦隊",
                    api_ship: [1, 2, 8, 4, 5, 6]
                }
            ]
        };
    },
    load: async function() {
        // 1. 外部知識データベース(JSON)のロード
        try {
            const expRes = await fetch('data/expeditions.json');
            if (expRes.ok) {
                const fetchedExp = await expRes.json();
                for (let k in fetchedExp) {
                    if (!this.Expeditions[k]) {
                        this.Expeditions[k] = fetchedExp[k];
                    } else {
                        // 既存のハードコード値（資源量など）を優先してマージ
                        this.Expeditions[k] = { ...fetchedExp[k], ...this.Expeditions[k] };
                    }
                }
            }
            
            // quests.jsで全件ロード済みのため、古いquests.jsonでの上書きを廃止
            // const qRes = await fetch('data/quests.json');
            // if (qRes.ok) this.Quests = await qRes.json();
            
            const abRes = await fetch('data/abyssals.json');
            if (abRes.ok) this.Abyssals = await abRes.json();
            
            const msRes = await fetch('data/map_strategies.json?v=' + Date.now());
            if (msRes.ok) this.MapStrategies = await msRes.json();
            
            const efRes = await fetch('data/enemy_fleets.json?v=' + Date.now());
            if (efRes.ok) this.EnemyFleets = await efRes.json();
            
            // 2. KC3オープンデータのロード
            this.KC3 = {};
            try {
                const kAbRes = await fetch('data/kc3/abyssal_stats.json');
                if (kAbRes.ok) this.KC3.AbyssalStats = await kAbRes.json();
                
                const kEdRes = await fetch('data/kc3/edges.json');
                if (kEdRes.ok) this.KC3.Edges = await kEdRes.json();
                
                const kGfRes = await fetch('data/kc3/gunfit.json');
                if (kGfRes.ok) this.KC3.GunFit = await kGfRes.json();
                
                const kQmRes = await fetch('data/kc3/quests_meta.json');
                if (kQmRes.ok) this.KC3.QuestsMeta = await kQmRes.json();
                
                const kQRes = await fetch('data/kc3/quests.json');
                if (kQRes.ok) {
                    this.KC3.QuestsDict = await kQRes.json();
                    // KC3の任務データをマスタ(Wiki産)にマージして欠けを補完する
                    for (let id in this.KC3.QuestsDict) {
                        if (!this.Quests[id]) {
                            this.Quests[id] = this.KC3.QuestsDict[id];
                        } else {
                            if (!this.Quests[id].code && this.KC3.QuestsDict[id].code) {
                                this.Quests[id].code = this.KC3.QuestsDict[id].code;
                            }
                        }
                    }
                }
                
                const kAkRes = await fetch('data/kc3/akashi.json');
                if (kAkRes.ok) this.KC3.Akashi = await kAkRes.json();
                
                const eqTRes = await fetch('data/kc3/equiptype.json');
                if (eqTRes.ok) {
                    const rawEqT = await eqTRes.json();
                    this.EquipType = this.EquipType || {};
                    for (let id in rawEqT) {
                        this.EquipType[id] = rawEqT[id].api_name;
                    }
                }

                const kIRes = await fetch('data/kc3/items.json');
                if (kIRes.ok) {
                    const rawItems = await kIRes.json();
                    for (let id in rawItems) {
                        const item = rawItems[id];
                        const tName = (this.EquipType && item.api_type && this.EquipType[item.api_type[2]]) ? this.EquipType[item.api_type[2]] : (item.api_type ? String(item.api_type[2]) : "不明");
                        if (this.Items[id]) {
                            this.Items[id].api_type = item.api_type;
                            this.Items[id].typeName = tName;
                        } else {
                            this.Items[id] = { id: parseInt(id), name: item.api_name, api_type: item.api_type, typeName: tName };
                        }
                    }
                }
                
                const kSRes = await fetch('data/kc3/ships.json');
                if (kSRes.ok) {
                    const rawShips = await kSRes.json();
                    for (let id in rawShips) {
                        const ship = rawShips[id];
                        if (!this.Ships[id]) {
                            this.Ships[id] = {
                                id: ship.api_id,
                                name: ship.api_name,
                                yomi: ship.api_yomi,
                                stype: ship.api_stype,
                                type_name: this.Stype[ship.api_stype] || "不明"
                            };
                        }
                    }
                }
            } catch (kc3_e) {
                console.warn("KC3データのロードに失敗しました", kc3_e);
            }
        } catch (e) {
            console.warn("外部JSONファイルのロードに失敗しました (デモモードで続行)", e);
        }

        // 2. ユーザー個別のIndexedDBからのキャッシュロード
        if (typeof KCSDB === 'undefined') return;
        const saved = await KCSDB.get('master', 'latest');
        if (saved) {
            if (saved.Stype) this.Stype = saved.Stype;
            
            // マイグレーション: fuelプロパティが存在しない古いキャッシュは破棄する
            let needsReparse = false;
            if (saved.Ships) {
                let sampleShip = Object.values(saved.Ships)[0];
                if (sampleShip && (sampleShip.fuel === undefined || sampleShip.after_lv === undefined)) {
                    needsReparse = true;
                } else {
                    this.Ships = saved.Ships;
                }
            }

            if (needsReparse) {
                console.log("古いMasterDataを検出しました。再パースを実行します...");
                try {
                    const res = await fetch('./my_data/getData.json');
                    if (res.ok) {
                        const rawText = await res.text();
                        const jsonStr = rawText.replace(/^svdata=/, '');
                        const parsed = JSON.parse(jsonStr);
                        if (parsed.api_data) {
                            await this.update(parsed.api_data);
                        }
                    }
                } catch(e) {
                    console.warn("再パースに失敗しました", e);
                }
            }

            if (saved.Items) this.Items = saved.Items;
            if (saved.Maps) this.Maps = saved.Maps;
            // Expeditionsは外部JSONを正とするため上書きしない（名前などの同期データはマージ）
            if (saved.Expeditions) {
                Object.keys(saved.Expeditions).forEach(eid => {
                    if (this.Expeditions[eid]) {
                        this.Expeditions[eid].name = saved.Expeditions[eid].name;
                    }
                });
            }
        }
    },

    update: async function(api_data) {
        if (api_data.api_mst_stype) {
            this.Stype = {};
            api_data.api_mst_stype.forEach(s => {
                this.Stype[s.api_id] = s.api_name;
            });
        }
        
        if (api_data.api_mst_ship) {
            api_data.api_mst_ship.forEach(s => {
                this.Ships[s.api_id] = {
                    id: s.api_id,
                    name: s.api_name,
                    stype: s.api_stype,
                    type_name: this.Stype[s.api_stype] || "不明",
                    slots: s.api_slot_num,
                    fuel: s.api_fuel_max || 0,
                    ammo: s.api_bull_max || 0,
                    hp: s.api_taik ? s.api_taik[1] : 0,
                    fire: s.api_houg ? s.api_houg[1] : 0,
                    torp: s.api_raig ? s.api_raig[1] : 0,
                    aa: s.api_tyku ? s.api_tyku[1] : 0,
                    armor: s.api_souk ? s.api_souk[1] : 0,
                    yomi: s.api_yomi || "",
                    speed: s.api_soku || 10,
                    slot_cap: s.api_maxeq || [],
                    after_lv: s.api_afterlv || 0,
                    after_ship_id: s.api_aftershipid || "0"
                };
            });
        }
        if (api_data.api_mst_slotitem_equiptype) {
            this.EquipType = this.EquipType || {};
            api_data.api_mst_slotitem_equiptype.forEach(e => {
                this.EquipType[e.api_id] = e.api_name;
            });
        }
        
        if (api_data.api_mst_slotitem) {
            api_data.api_mst_slotitem.forEach(i => {
                this.Items[i.api_id] = {
                    id: i.api_id,
                    name: i.api_name,
                    type: i.api_type,
                    typeName: (this.EquipType && i.api_type && this.EquipType[i.api_type[2]]) ? this.EquipType[i.api_type[2]] : (i.api_type ? String(i.api_type[2]) : "不明"),
                    fire: i.api_houg || 0,
                    torp: i.api_raig || 0,
                    aa: i.api_tyku || 0,
                    armor: i.api_souk || 0,
                    bomb: i.api_baku || 0,
                    los: i.api_saku || 0,
                    asw: i.api_tais || 0,
                    evasion: i.api_houk || 0,
                    hit: i.api_houm || 0,
                    range: i.api_leng || 0,
                    info: i.api_info || ""
                };
            });
        }

        if (api_data.api_mst_mission) {
            // 既存のハードコード遠征データを消さないように拡張する
            api_data.api_mst_mission.forEach(m => {
                if (!this.Expeditions[m.api_id]) {
                    this.Expeditions[m.api_id] = {};
                }
                this.Expeditions[m.api_id] = Object.assign(this.Expeditions[m.api_id], {
                    id: m.api_id,
                    name: m.api_name,
                    time: m.api_time,
                    difficulty: m.api_difficulty,
                    area_id: m.api_maparea_id
                });
            });
        }

        if (api_data.api_mst_mapinfo) {
            this.Maps = this.Maps || {};
            api_data.api_mst_mapinfo.forEach(m => {
                this.Maps[m.api_id] = {
                    id: m.api_id,
                    name: m.api_name,
                    area_id: m.api_maparea_id,
                    no: m.api_no,
                    opetext: m.api_opetext
                };
            });
        }

        if (typeof KCSDB !== 'undefined') {
            await KCSDB.set('master', 'latest', {
                Stype: this.Stype,
                Ships: this.Ships,
                Items: this.Items,
                Expeditions: this.Expeditions,
                Maps: this.Maps
            });
        }
    }
};
