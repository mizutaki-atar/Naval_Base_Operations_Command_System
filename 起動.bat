@echo off
chcp 65001 >nul
echo ===================================================
echo  [ 鎮守府作戦司令部補助システム 統合サーバー起動 ]
echo ===================================================
echo.
python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [エラー] Python 3 がインストールされていません。
    echo バックエンドサーバーを起動できません。Pythonをインストールしてください。
    pause
    exit /b
)

echo [1] ブラウザ (http://localhost:8000/index.html) を開きます...
start http://localhost:8000/index.html

echo [2] 統合バックエンドサーバーを起動します...
python server.py

echo.
echo [エラー] サーバーが予期せず終了しました。
pause
