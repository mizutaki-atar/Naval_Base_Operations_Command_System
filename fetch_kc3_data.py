import json
import urllib.request
import os

# KC3Kai base repository URL for raw files
KC3_BASE_URL = 'https://raw.githubusercontent.com/KC3Kai/KC3Kai/master/src/data/'
# kc3-translations base repository URL for raw Japanese files
KC3_TL_JP_URL = 'https://raw.githubusercontent.com/KC3Kai/kc3-translations/master/data/jp/'

# Files to fetch
# format: (URL_PREFIX, filename)
FILES_TO_FETCH = [
    (KC3_BASE_URL, 'abyssal_stats.json'),  # 深海棲艦のステータス・装備
    (KC3_BASE_URL, 'edges.json'),          # 羅針盤・ルート分岐条件
    (KC3_BASE_URL, 'gunfit.json'),         # フィット砲ボーナス
    (KC3_BASE_URL, 'nodes.json'),          # マス目の情報（戦闘マス、資源マスなど）
    (KC3_BASE_URL, 'quests_meta.json'),    # 任務の前提条件、フラグ管理
    (KC3_BASE_URL, 'akashi.json'),         # 改修工廠（明石）のスケジュールとコスト
    (KC3_TL_JP_URL, 'quests.json'),        # 任務の日本語テキスト
    (KC3_TL_JP_URL, 'ships.json'),         # 艦娘の日本語名辞書
    (KC3_TL_JP_URL, 'items.json')          # 装備の日本語名辞書
]

def main():
    target_dir = os.path.join('data', 'kc3')
    
    # Create directory if it doesn't exist
    if not os.path.exists(target_dir):
        os.makedirs(target_dir)
        print(f"Created directory: {target_dir}")

    for url_prefix, filename in FILES_TO_FETCH:
        url = url_prefix + filename
        target_path = os.path.join(target_dir, filename)
        print(f"Fetching {filename}...")
        
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                # Read and decode JSON
                data = json.loads(response.read().decode('utf-8'))
                
                # Write formatted JSON to file
                with open(target_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                    
                print(f"Successfully saved to {target_path}")
        except Exception as e:
            print(f"Failed to fetch {filename}: {e}")

if __name__ == '__main__':
    main()
