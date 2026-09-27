import json
import os

# --- 遠征データ (主要なものを含む) ---
expeditions = {
    "1": {"id": 1, "name": "練習航海", "time": 15, "fuel": 0, "ammo": 30, "steel": 0, "baux": 0, "flag_lv": 1, "count": 2, "rules": []},
    "2": {"id": 2, "name": "長距離練習航海", "time": 30, "fuel": 0, "ammo": 100, "steel": 30, "baux": 0, "flag_lv": 2, "count": 4, "rules": []},
    "3": {"id": 3, "name": "警備任務", "time": 20, "fuel": 30, "ammo": 30, "steel": 40, "baux": 0, "flag_lv": 3, "count": 3, "rules": []},
    "4": {"id": 4, "name": "対潜警戒任務", "time": 50, "fuel": 0, "ammo": 60, "steel": 0, "baux": 0, "flag_lv": 3, "count": 3, "rules": [['軽巡',1],['駆逐',2]]},
    "5": {"id": 5, "name": "海上護衛任務", "time": 90, "fuel": 200, "ammo": 200, "steel": 20, "baux": 20, "flag_lv": 3, "count": 4, "rules": [['軽巡',1],['駆逐',2]]},
    "6": {"id": 6, "name": "防空射撃演習", "time": 40, "fuel": 0, "ammo": 0, "steel": 0, "baux": 80, "flag_lv": 4, "count": 4, "rules": []},
    "9": {"id": 9, "name": "タンカー護衛任務", "time": 240, "fuel": 350, "ammo": 0, "steel": 0, "baux": 0, "flag_lv": 3, "count": 4, "rules": [['軽巡',1],['駆逐',2]]},
    "11": {"id": 11, "name": "ボーキサイト輸送任務", "time": 300, "fuel": 0, "ammo": 0, "steel": 0, "baux": 250, "flag_lv": 6, "count": 4, "rules": [['駆逐',2]]},
    "13": {"id": 13, "name": "鼠輸送作戦", "time": 240, "fuel": 240, "ammo": 300, "steel": 0, "baux": 0, "flag_lv": 5, "count": 6, "rules": [['軽巡',1],['駆逐',4]]},
    "21": {"id": 21, "name": "北方鼠輸送作戦", "time": 140, "fuel": 320, "ammo": 270, "steel": 0, "baux": 0, "flag_lv": 15, "count": 5, "sum_lv": 30, "rules": [['軽巡',1],['駆逐',4]], "drums": {"ships": 3, "total": 3}},
    "37": {"id": 37, "name": "東京急行", "time": 165, "fuel": 0, "ammo": 380, "steel": 270, "baux": 0, "flag_lv": 50, "count": 6, "sum_lv": 200, "rules": [['軽巡',1],['駆逐',5]], "drums": {"ships": 3, "total": 4}},
    "38": {"id": 38, "name": "東京急行(弐)", "time": 175, "fuel": 420, "ammo": 0, "steel": 200, "baux": 0, "flag_lv": 65, "count": 6, "sum_lv": 240, "rules": [['駆逐',5]], "drums": {"ships": 4, "total": 8}},
    "39": {"id": 39, "name": "遠洋潜水艦作戦", "time": 1800, "fuel": 0, "ammo": 0, "steel": 300, "baux": 0, "flag_lv": 3, "count": 5, "sum_lv": 180, "rules": [['潜水母艦',1],['潜水艦',4]]},
    "40": {"id": 40, "name": "水上機前線輸送", "time": 410, "fuel": 0, "ammo": 0, "steel": 0, "baux": 100, "flag_lv": 25, "count": 6, "sum_lv": 150, "rules": [['軽巡',1],['水母',2],['駆逐',2]]},
    "41": {"id": 41, "name": "ブルネイ泊地沖哨戒", "time": 60, "fuel": 100, "ammo": 0, "steel": 0, "baux": 0, "flag_lv": 30, "count": 3, "sum_lv": 100, "rules": [['駆逐',3]]},
    "A1": {"id": "A1", "name": "兵站線確保! 海上警備を強化せよ!", "time": 40, "fuel": 150, "ammo": 150, "steel": 0, "baux": 0, "flag_lv": 35, "count": 4, "sum_lv": 150, "rules": [['軽巡',1],['駆逐',3]], "req_stats": {"aa": 150, "asw": 180, "los": 120}},
    "B1": {"id": "B1", "name": "南西海域交戦度胸試し", "time": 40, "fuel": 50, "ammo": 50, "steel: ": 50, "baux": 100, "flag_lv": 40, "count": 5, "sum_lv": 150, "rules": [['軽巡',1],['駆逐',3]], "req_stats": {"aa": 150, "asw": 120, "los": 100}},
}

# --- 任務データ ---
quests = [
    { "id": "Bd1", "name": "敵艦隊を撃破せよ！", "type": "出撃", "desc": "1回勝利する", "req_ships_any": [], "req_count": 0 },
    { "id": "Bd2", "name": "敵艦隊主力を撃滅せよ！", "type": "出撃", "desc": "1回戦闘する", "req_ships_any": [], "req_count": 0 },
    { "id": "Bd3", "name": "敵艦隊を10回迎撃せよ！", "type": "出撃", "desc": "10回戦闘する", "req_ships_any": [], "req_count": 0 },
    { "id": "Bw1", "name": "あ号作戦", "type": "出撃", "desc": "出撃36回、S勝利6回、ボス24回、ボス勝利12回", "req_ships_any": [], "req_count: ": 0 },
    { "id": "Bw2", "name": "い号作戦", "type": "出撃", "desc": "空母20隻撃沈", "req_ships_any": [], "req_count": 0 },
    { "id": "Bw3", "name": "海上護衛戦", "type": "出撃", "desc": "潜水艦15隻撃沈", "req_ships_any": [], "req_count": 0 },
    { "id": "Bw4", "name": "ろ号作戦", "type": "出撃", "desc": "補給艦50隻撃沈", "req_ships_any": [], "req_count": 0 },
    { "id": "Bq1", "name": "新編成「三川艦隊」、鉄底海峡に突入せよ！", "type": "出撃", "desc": "鳥海 青葉 衣笠 加古 古鷹 天龍から4隻、5-1,5-3,5-4ボスS勝利", "req_ships_any": ["鳥海", "青葉", "衣笠", "加古", "古鷹", "天龍"], "req_count": 4 },
    { "id": "Bq2", "name": "「第六戦隊」南西海域へ出撃せよ！", "type": "出撃", "desc": "古鷹 加古 青葉 衣笠 含む編成で2-5ボスS勝利", "req_ships: ": ["古鷹", "加古", "青葉", "衣笠"] },
    { "id": "A4",  "name": "「第六駆逐隊」を編成せよ！", "type": "編成", "desc": "「暁」「響」「雷」「電」の4隻による第六駆逐隊を編成する", "req_ships": ["暁", "響", "雷", "電"] },
    { "id": "A84", "name": "精鋭「第十駆逐隊」、抜錨準備！", "type": "編成", "desc": "「夕雲改二」「巻雲改二」「風雲改二」「秋雲改二」編成", "req_ships": ["夕雲改二", "巻雲改二", "風雲改二", "秋雲改二"], "checkLevel": True },
    { "id": "B117","name": "主力オブ主力、抜錨開始！", "type": "出撃", "desc": "夕雲型改二を2隻以上含む編成で5-3, 5-4, 5-5ボスA勝利", "req_ships_any": ["夕雲改二", "巻雲改二", "風雲改二", "長波改二", "高波改二", "沖波改二", "朝霜改二", "早波改二", "藤波改二", "清霜改二", "早霜改二", "秋雲改二"], "req_count": 2 }
]

# --- 深海棲艦データ (代表的なものを大幅に追加) ---
abyssals = {
    1501: {"id": 1501, "name": "戦艦ル級", "fire": 90, "torp": 0, "aa": 70, "armor": 80, "hp": 90},
    1502: {"id": 1502, "name": "戦艦タ級", "fire": 100, "torp": 0, "aa": 80, "armor": 90, "hp": 90},
    1503: {"id": 1503, "name": "空母ヲ級", "fire": 0, "torp": 0, "aa": 90, "armor": 80, "hp": 80, "bomb": 80},
    1504: {"id": 1504, "name": "重巡リ級", "fire": 60, "torp": 50, "aa": 40, "armor": 60, "hp": 60},
    1505: {"id": 1505, "name": "軽巡ヘ級", "fire": 40, "torp": 50, "aa": 30, "armor": 40, "hp": 40},
    1506: {"id": 1506, "name": "駆逐イ級", "fire": 20, "torp": 40, "aa": 20, "armor": 20, "hp": 30},
    1507: {"id": 1507, "name": "潜水カ級", "fire": 0, "torp": 60, "aa": 0, "armor": 20, "hp": 25},
    1508: {"id": 1508, "name": "駆逐ナ級後期型", "fire": 65, "torp": 95, "aa": 80, "armor": 55, "hp": 60},
    1509: {"id": 1509, "name": "潜水ヨ級", "fire": 0, "torp": 80, "aa": 0, "armor": 30, "hp": 40},
    1510: {"id": 1510, "name": "輸送ワ級", "fire": 10, "torp": 0, "aa": 10, "armor": 20, "hp": 50},
    # エリート級
    1511: {"id": 1511, "name": "戦艦ル級 elite", "fire": 100, "torp": 0, "aa": 80, "armor": 90, "hp": 90},
    1512: {"id": 1512, "name": "空母ヲ級 elite", "fire": 0, "torp": 0, "aa": 100, "armor": 90, "hp": 80, "bomb": 90},
    1513: {"id": 1513, "name": "重巡リ級 elite", "fire": 75, "torp": 65, "aa": 50, "armor": 70, "hp": 60},
    1514: {"id": 1514, "name": "軽巡ホ級 elite", "fire": 55, "torp": 70, "aa": 40, "armor": 45, "hp": 43},
    1515: {"id": 1515, "name": "駆逐ロ級 elite", "fire": 35, "torp": 55, "aa": 30, "armor": 25, "hp": 30},
    1516: {"id": 1516, "name": "潜水ヨ級 elite", "fire": 0, "torp": 95, "aa": 0, "armor": 40, "hp": 40},
    # フラッグシップ級
    1521: {"id": 1521, "name": "戦艦ル級 flagship", "fire": 115, "torp": 0, "aa": 90, "armor": 99, "hp": 98},
    1522: {"id": 1522, "name": "戦艦タ級 flagship", "fire": 120, "torp": 0, "aa": 100, "armor": 110, "hp": 98},
    1523: {"id": 1523, "name": "空母ヲ級 flagship", "fire": 0, "torp": 0, "aa": 110, "armor": 120, "hp": 96, "bomb": 120},
    1524: {"id": 1524, "name": "重巡リ級 flagship", "fire": 90, "torp": 80, "aa": 60, "armor": 80, "hp": 76},
    1525: {"id": 1525, "name": "軽巡ヘ級 flagship", "fire": 65, "torp": 80, "aa": 50, "armor": 65, "hp": 57},
    1526: {"id": 1526, "name": "駆逐ハ級 flagship", "fire": 50, "torp": 70, "aa": 40, "armor": 40, "hp": 40},
    1527: {"id": 1527, "name": "潜水ソ級 flagship", "fire": 0, "torp": 110, "aa": 0, "armor": 50, "hp": 48},
    # 鬼・姫クラス (一部)
    1551: {"id": 1551, "name": "南方棲戦鬼", "fire": 140, "torp": 0, "aa": 120, "armor": 150, "hp": 280},
    1552: {"id": 1552, "name": "戦艦レ級", "fire": 130, "torp": 120, "aa": 110, "armor": 130, "hp": 270, "bomb": 120},
    1553: {"id": 1553, "name": "戦艦レ級 elite", "fire": 150, "torp": 140, "aa": 130, "armor": 160, "hp": 380, "bomb": 140},
}

# --- 海域データ ---
map_strategies = {
    "1-1": {"name": "1-1 鎮守府正面海域", "requirements": "自由枠(キラ付け)", "stypes": ['駆逐','駆逐'], "desc": "キラ付け用の海域。"},
    "1-5": {"name": "1-5 鎮守府近海 (対潜哨戒)", "requirements": "海防4 または 軽巡1 駆逐3", "stypes": ['海防艦','海防艦','海防艦','海防艦'], "desc": "先制対潜攻撃ができる艦娘を4隻並べると安全です。"},
    "2-1": {"name": "2-1 南西諸島哨戒 (い号作戦)", "requirements": "空母系2, 潜水艦1, 雷巡など3", "stypes": ['軽空母','軽空母','潜水艦','雷巡','雷巡','軽巡'], "desc": "空母を狩るためのルート。潜水艦をデコイにします。"},
    "2-4": {"name": "2-4 沖ノ島海域", "requirements": "戦艦・空母主体", "stypes": ['戦艦','戦艦','正規空母','正規空母','軽空母','雷巡'], "desc": "ランダム分岐が多いため、火力を最大限に高めて挑みます。"},
    "2-5": {"name": "2-5 沖ノ島沖 (第五戦隊/通常)", "requirements": "重巡系2, 軽巡1, 駆逐3", "stypes": ['重巡','重巡','軽巡','駆逐','駆逐','駆逐'], "desc": "最短ルート固定。索敵値(33式)が一定以上必要です。"},
    "3-2": {"name": "3-2 キス島沖 (高速+ 駆逐6)", "requirements": "駆逐6 (高速+統一)", "stypes": ['駆逐','駆逐','駆逐','駆逐','駆逐','駆逐'], "desc": "高速+統一により道中1戦ルート。全艦に缶＋タービンが必要です。"},
    "3-4": {"name": "3-4 北方海域全域", "requirements": "空母2, 重巡系2, 軽巡1, 水母1", "stypes": ['正規空母','正規空母','重巡','重巡','軽巡','水母'], "desc": "道中1戦ルートの定番。"},
    "4-5": {"name": "4-5 カレー洋 (高速+ まるゆ掘り)", "requirements": "戦艦/空母など (高速+統一)", "stypes": ['戦艦','空母','重巡','重巡','軽巡','駆逐'], "desc": "高速+統一ルート。削りやまるゆ掘りに適しています。"},
    "5-3": {"name": "5-3 サブ島沖海戦 (夜戦レベリング)", "requirements": "育成艦1, 重巡/航巡/戦艦など", "stypes": ['重巡','重巡','重巡','軽巡','駆逐','駆逐'], "desc": "最初の夜戦マスでレベリングを行うための編成。"},
    "5-5": {"name": "5-5 サーモン海域北方", "requirements": "戦艦2, 空母2, 駆逐2", "stypes": ['戦艦','戦艦','正規空母','正規空母','駆逐','駆逐'], "desc": "ゲージ破壊やレ級と戦う最高難易度海域。"},
    "7-1": {"name": "7-1 ブルネイ泊地 (戦果/レベリング)", "requirements": "軽巡1, 駆逐4 (先制対潜)", "stypes": ['軽巡','駆逐','駆逐','駆逐','駆逐'], "desc": "戦果稼ぎ・レベリングのメッカ。先制対潜攻撃が必須です。"},
}

enemy_fleets = {
    "1-1": [1506],
    "1-5": [1509, 1507, 1507, 1507],
    "2-1": [1512, 1503, 1510, 1510, 1506, 1506],
    "2-4": [1521, 1521, 1523, 1514, 1515, 1515],
    "2-5": [1521, 1521, 1524, 1525, 1515, 1515],
    "3-2": [1514, 1515, 1515, 1506, 1506, 1506],
    "3-4": [1523, 1523, 1521, 1525, 1526, 1526],
    "4-5": [1551, 1522, 1522, 1525, 1508, 1508],
    "5-3": [1524, 1524, 1525, 1508, 1508, 1508],
    "5-5": [1553, 1553, 1523, 1523, 1526, 1526], # レ級2隻の極悪編成
    "7-1": [1527, 1527, 1516, 1516]
}

def save_json(filename, data):
    with open(os.path.join("data", filename), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

save_json("expeditions.json", expeditions)
save_json("quests.json", quests)
save_json("abyssals.json", abyssals)
save_json("map_strategies.json", map_strategies)
save_json("enemy_fleets.json", enemy_fleets)

print("Data generated successfully.")
