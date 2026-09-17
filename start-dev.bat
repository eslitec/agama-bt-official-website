@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul || (echo 找不到 Node.js，請先安裝 Node.js 20.19 以上：https://nodejs.org & pause & exit /b 1)
if not exist node_modules (
  echo 第一次執行，正在安裝套件...
  call npm install || (pause & exit /b 1)
)
echo 啟動開發伺服器，瀏覽器會自動開啟 http://localhost:5173/
echo 關閉這個視窗即可停止伺服器。
call npm run dev -- --open
pause
