import os, glob, json, re
from bs4 import BeautifulSoup

def process():
    files = glob.glob(r'h:\鎮守府作戦司令部補助システム\海域攻略データ\*_*.html')
    map_strategies = {}

    for file in files:
        basename = os.path.basename(file)
        m = re.search(r'(\d-\d+)', basename)
        if not m: continue
        map_id = m.group(1)

        with open(file, 'r', encoding='utf-8', errors='replace') as f:
            html = f.read()
        
        soup = BeautifulSoup(html, 'html.parser')
        
        title_text = soup.title.string if soup.title else ""
        map_name = title_text.split('-')[0].strip()

        content_div = soup.find('div', id='content')
        desc_lines = []
        fleet_examples = []
        
        if content_div:
            for h3 in content_div.find_all(['h2', 'h3', 'h4', 'strong']):
                h_text = h3.get_text(strip=True)
                if '編成' in h_text or 'ルート' in h_text or '攻略' in h_text:
                    nxt = h3.find_next_sibling()
                    for _ in range(5):
                        if not nxt: break
                        if nxt.name in ['p', 'ul', 'div']:
                            text = nxt.get_text(strip=True)
                            if len(text) > 5:
                                fleet_examples.append(text)
                        nxt = nxt.find_next_sibling()

            for p in content_div.find_all('p', limit=20):
                text = p.get_text(strip=True)
                if len(text) > 20 and not text.startswith('※') and 'ドロップ' not in text and '速力強化' not in text:
                    desc_lines.append(text)
        
        desc = ""
        if desc_lines:
            desc = desc_lines[0][:200] + '...' 
        elif fleet_examples:
            desc = fleet_examples[0][:200] + '...'

        requirements = ""
        if fleet_examples:
            for f_text in fleet_examples:
                if re.search(r'(駆逐|軽巡|重巡|戦艦|空母)', f_text):
                    requirements = f_text[:30]
                    break

        # Remove garbled texts
        desc = desc.replace('\n', ' ').replace('\r', '')

        if len(desc) > 5:
            map_strategies[map_id] = {
                "name": map_name,
                "requirements": requirements,
                "stypes": ['駆逐','駆逐','駆逐','軽巡','軽巡','水母'], # 仮
                "desc": desc
            }
    
    # Python script itself injects this into master_data.js!
    master_path = r'h:\鎮守府作戦司令部補助システム\master_data.js'
    with open(master_path, 'r', encoding='utf-8') as f:
        master_js = f.read()

    strategies_json = json.dumps(map_strategies, ensure_ascii=False, indent=8)
    
    # 既存の MasterData.MapStrategies を置換する
    new_master_js = re.sub(
        r'(MapStrategies:\s*\{)(.*?)(},\s*Abyssals:)', 
        r'\1\n' + strategies_json[1:-1] + r'\n\3', 
        master_js, 
        flags=re.DOTALL
    )

    with open(master_path, 'w', encoding='utf-8') as f:
        f.write(new_master_js)
    
    print("Done generating and injecting into master_data.js!")

if __name__ == '__main__':
    process()
