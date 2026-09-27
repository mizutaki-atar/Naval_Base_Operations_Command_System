import json
import urllib.request
import os

KC3_BASE_URL = 'https://raw.githubusercontent.com/KC3Kai/KC3Kai/master/src/data/'
KC3_TL_JP_URL = 'https://raw.githubusercontent.com/KC3Kai/kc3-translations/master/data/jp/'
START2_URL = 'https://api.kcwiki.moe/start2'

FILES_TO_FETCH = [
    (KC3_BASE_URL, 'abyssal_stats.json'),
    (KC3_BASE_URL, 'edges.json'),
    (KC3_BASE_URL, 'gunfit.json'),
    (KC3_BASE_URL, 'nodes.json'),
    (KC3_BASE_URL, 'quests_meta.json'),
    (KC3_BASE_URL, 'akashi.json'),
    (KC3_TL_JP_URL, 'quests.json'),
]

def main():
    target_dir = os.path.join('data', 'kc3')
    
    if not os.path.exists(target_dir):
        os.makedirs(target_dir)

    for url_prefix, filename in FILES_TO_FETCH:
        url = url_prefix + filename
        target_path = os.path.join(target_dir, filename)
        print(f"Fetching {filename}...")
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode('utf-8'))
                with open(target_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Failed to fetch {filename}: {e}")

    # Fetch start2 for ships and items
    print("Fetching start2 for ships and items...")
    try:
        req = urllib.request.Request(START2_URL, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            start2 = json.loads(response.read().decode('utf-8'))
            
            ships_out = {}
            for ship in start2.get('api_mst_ship', []):
                ships_out[str(ship['api_id'])] = ship
            
            items_out = {}
            for item in start2.get('api_mst_slotitem', []):
                items_out[str(item['api_id'])] = item
                
            equiptype_out = {}
            for etype in start2.get('api_mst_slotitem_equiptype', []):
                equiptype_out[str(etype['api_id'])] = etype
            
            with open(os.path.join(target_dir, 'ships.json'), 'w', encoding='utf-8') as f:
                json.dump(ships_out, f, ensure_ascii=False, indent=2)
            with open(os.path.join(target_dir, 'items.json'), 'w', encoding='utf-8') as f:
                json.dump(items_out, f, ensure_ascii=False, indent=2)
            with open(os.path.join(target_dir, 'equiptype.json'), 'w', encoding='utf-8') as f:
                json.dump(equiptype_out, f, ensure_ascii=False, indent=2)
                
            print("Successfully saved ships, items, and equiptype.json")
    except Exception as e:
        print(f"Failed to fetch start2: {e}")

if __name__ == '__main__':
    main()
