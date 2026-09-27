import http.server
import socketserver
import json
import os

PORT = 8000
DATA_DIR = "my_data"

class SyncHandler(http.server.SimpleHTTPRequestHandler):
    # CORS（異なるオリジンからのPOST通信）を許可する
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Allow-Private-Network', 'true')
        self.end_headers()

    def do_POST(self):
        if self.path == '/sync':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(post_data)
                url = data.get('url', '')
                payload = data.get('payload', '')
                
                # URLからファイル名を自動判別
                filename = "unknown.json"
                if "api_start2/getData" in url:
                    filename = "getData.json"
                elif "api_port/port" in url:
                    filename = "port.json"
                elif "api_get_member/require_info" in url:
                    filename = "require_info.json"
                elif "api_req_kousyou/createitem" in url or "api_req_kousyou/destroyship" in url:
                    filename = "slot_item_update.json"
                elif "questlist" in url or "api_get_member/questlist" in url or "api_req_quest/" in url:
                    filename = "questlist.json"
                
                if filename != "unknown.json":
                    filepath = os.path.join(DATA_DIR, filename)
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(payload)
                    print(f"[SUCCESS] {filename} を保存しました。")
                
                self.send_response(200)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Private-Network', 'true')
                self.end_headers()
                self.wfile.write(b'{"status":"ok"}')
            except Exception as e:
                print(f"[ERROR] {e}")
                self.send_response(500)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Private-Network', 'true')
                self.end_headers()
                self.wfile.write(b'{"status":"error"}')
        elif self.path == '/api/crawl':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(post_data)
                url = data.get('url', '')
                if not url:
                    raise ValueError("URL is required")
                
                import subprocess
                # wiki_crawler.py を実行して結果を取得
                result = subprocess.run(
                    ['python', 'wiki_crawler.py', url],
                    capture_output=True,
                    text=True,
                    encoding='utf-8'
                )
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Private-Network', 'true')
                self.end_headers()
                self.wfile.write(result.stdout.encode('utf-8'))
            except Exception as e:
                print(f"[ERROR] Crawl API: {e}")
                self.send_response(500)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

os.makedirs(DATA_DIR, exist_ok=True)

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

with ReusableTCPServer(("127.0.0.1", PORT), SyncHandler) as httpd:
    print(f"===================================================")
    print(f"   [ 鎮守府作戦司令部 統合バックエンドサーバー稼働中 ]")
    print(f"===================================================")
    print(f" - UIアクセス: http://localhost:{PORT}/index.html")
    print(f" - API傍受待機中... (Chrome拡張機能からのデータを受信します)")
    print(f" - データ保存先: ./{DATA_DIR}/")
    print(f"===================================================")
    httpd.serve_forever()
