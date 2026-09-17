@echo off
chcp 65001 >nul
cd /d "%~dp0"
where git >nul 2>nul || (echo 找不到 Git，請先安裝 Git for Windows：https://git-scm.com/download/win & pause & exit /b 1)
echo 推送到 GitHub：https://github.com/eslitec/agama-bt-official-website
echo 第一次會跳出 GitHub 登入視窗，請用有這個 repo 權限的帳號登入。
echo.
git -c safe.directory=* push -u origin main
if errorlevel 1 (
  echo.
  echo 推送失敗，請把上面的錯誤訊息截圖或貼給 Claude。
) else (
  echo.
  echo 推送完成！部署進度：https://github.com/eslitec/agama-bt-official-website/actions
)
pause
