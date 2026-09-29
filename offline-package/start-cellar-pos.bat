@echo off
title Cellar POS - Wines & Spirits Till
echo ========================================================
echo   Starting Cellar POS Offline Till System
echo   100%% Local In-Store Operation (No Internet Required)
echo ========================================================
echo.

cd /d "%~dp0"

set BROWSER_CMD=
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    set BROWSER_CMD="%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="http://localhost:5000"
) else if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    set BROWSER_CMD="%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app="http://localhost:5000"
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    set BROWSER_CMD="%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --app="http://localhost:5000"
) else if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    set BROWSER_CMD="%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="http://localhost:5000"
) else (
    set BROWSER_CMD=start http://localhost:5000
)

echo Starting local server on port 5000...
start "" powershell -WindowStyle Hidden -Command "$p=5000; $l=New-Object System.Net.HttpListener; $l.Prefixes.Add(\"http://localhost:$p/\"); $l.Start(); while($l.IsListening){ $c=$l.GetContext(); $req=$c.Request; $res=$c.Response; $url=$req.Url.LocalPath.TrimStart('/'); if([string]::IsNullOrEmpty($url)){$url='index.html'}; $fp=Join-Path -Path (Join-Path -Path '%~dp0' -ChildPath 'app') -ChildPath $url; if(-not (Test-Path $fp)){$fp=Join-Path -Path '%~dp0' -ChildPath 'app\index.html'}; $bytes=[System.IO.File]::ReadAllBytes($fp); if($fp.EndsWith('.html')){$res.ContentType='text/html'}elseif($fp.EndsWith('.js')){$res.ContentType='application/javascript'}elseif($fp.EndsWith('.css')){$res.ContentType='text/css'}elseif($fp.EndsWith('.svg')){$res.ContentType='image/svg+xml'}elseif($fp.EndsWith('.png')){$res.ContentType='image/png'}elseif($fp.EndsWith('.json')){$res.ContentType='application/json'}elseif($fp.EndsWith('.webmanifest')){$res.ContentType='application/manifest+json'}; $res.ContentLength64=$bytes.Length; $res.OutputStream.Write($bytes,0,$bytes.Length); $res.OutputStream.Close() }"

timeout /t 1 /nobreak >nul
echo Opening Cellar POS in standalone window...
start "" %BROWSER_CMD%

echo.
echo Cellar POS is running at http://localhost:5000
echo Leave this window minimized or close it when done.
pause
