import json
import urllib.request
import math
import os

def main():
    # 1. Load Master Data (getData.json)
    print("Loading getData.json...")
    with open('my_data/getData.json', 'r', encoding='utf-8') as f:
        text = f.read()
        if text.startswith('svdata='):
            text = text[7:]
        master_data = json.loads(text)
    
    items_db = {}
    for item in master_data['api_data']['api_mst_slotitem']:
        items_db[item['api_id']] = item

    # 2. Fetch KC3 abyssal stats
    print("Fetching abyssal_stats.json from KC3...")
    url = 'https://raw.githubusercontent.com/KC3Kai/KC3Kai/master/src/data/abyssal_stats.json'
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as response:
        abyssal_stats = json.loads(response.read().decode('utf-8'))

    # 3. Load enemy_fleets.json
    with open('data/enemy_fleets.json', 'r', encoding='utf-8') as f:
        enemy_fleets = json.load(f)

    # Air power calculation
    # Item types that are considered planes for air power (api_type[2])
    # 6: Fighter, 7: Dive Bomber, 8: Torpedo Bomber, 11: Seaplane Bomber, 45: Seaplane Fighter, 47: Land Base Bomber, 48: Interceptor, 57: Jet Fighter, 58: Jet Bomber
    # Actually, equipment types in KanColle: api_type[1] or api_type[2]?
    # api_type is [category, ? , type_id, icon_id]
    plane_types = [6, 7, 8, 11, 45, 47, 48, 57, 58, 9, 10, 41] 
    
    fleet_air_powers = {}
    
    for map_id, ship_ids in enemy_fleets.items():
        total_air_power = 0
        for ship_id in ship_ids:
            ship_str_id = str(ship_id)
            if ship_str_id in abyssal_stats:
                stats = abyssal_stats[ship_str_id]
                slots = stats.get('kc3_slots', [])
                slot_sizes = stats.get('api_maxeq', [])
                
                for idx, eq_id in enumerate(slots):
                    if eq_id <= 0:
                        continue
                    if idx >= len(slot_sizes):
                        break
                    
                    slot_size = slot_sizes[idx]
                    if slot_size <= 0:
                        continue
                        
                    if eq_id in items_db:
                        eq = items_db[eq_id]
                        eq_type = eq['api_type'][2]
                        # Check if it's a plane
                        if eq_type in plane_types or eq.get('api_tyku', 0) > 0:
                            # We should be careful not to count radars and AA guns
                            # AA guns: 21, Radars: 12, 13
                            if eq_type not in [12, 13, 16, 21, 27, 28, 36]:
                                aa_stat = eq.get('api_tyku', 0)
                                if aa_stat > 0:
                                    air_power = math.floor(aa_stat * math.sqrt(slot_size))
                                    total_air_power += air_power
                                    
        fleet_air_powers[map_id] = total_air_power

    # 4. Save results to a new file or update map_strategies
    with open('data/map_strategies.json', 'r', encoding='utf-8') as f:
        map_strategies = json.load(f)
        
    for map_id, ap in fleet_air_powers.items():
        if map_id in map_strategies:
            # KanColle AS (Air Superiority) requirement = AP * 1.5, AS+ = AP * 3.0
            as_val = math.floor(ap * 1.5)
            as_plus = ap * 3
            
            if ap > 0:
                req_text = f"優勢: {as_val}+, 確保: {as_plus}+"
                map_strategies[map_id]['req_air_power'] = req_text
                map_strategies[map_id]['enemy_ap'] = ap

    with open('data/map_strategies.json', 'w', encoding='utf-8') as f:
        json.dump(map_strategies, f, ensure_ascii=False, indent=4)
        
    print("Air power calculated and updated in map_strategies.json!")
    for k, v in fleet_air_powers.items():
        print(f"Map {k}: Air Power = {v}")

if __name__ == '__main__':
    main()
