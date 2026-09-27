import requests
from bs4 import BeautifulSoup
import json
import re

def crawl_kancolle_wiki(url):
    """
    指定された艦これWikiのURLからテキストとテーブルデータを抽出する
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 不要な要素を削除 (スクリプトやスタイル、ナビゲーション等)
        for element in soup(['script', 'style', 'nav', 'header', 'footer']):
            element.decompose()
            
        content_div = soup.find('div', id='content') or soup.find('body')
        
        result_data = {
            "title": soup.title.string if soup.title else "Unknown",
            "url": url,
            "tables": [],
            "text_content": ""
        }
        
        # テキストの抽出（ある程度のチャンクにまとめる）
        text_blocks = []
        for p in content_div.find_all(['p', 'h2', 'h3', 'li']):
            text = p.get_text(strip=True)
            if len(text) > 5:
                text_blocks.append(text)
        result_data["text_content"] = "\n".join(text_blocks[:50]) # 上限付きで抽出
        
        # テーブルデータの抽出 (編成表や特効リストなど)
        tables = content_div.find_all('table')
        for table in tables:
            table_data = []
            rows = table.find_all('tr')
            for row in rows:
                cols = row.find_all(['td', 'th'])
                row_data = [col.get_text(strip=True) for col in cols]
                if any(row_data):  # 空行をスキップ
                    table_data.append(row_data)
            if len(table_data) > 0:
                result_data["tables"].append(table_data)
                
        return {"status": "success", "data": result_data}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        res = crawl_kancolle_wiki(sys.argv[1])
        print(json.dumps(res, ensure_ascii=False, indent=2))
