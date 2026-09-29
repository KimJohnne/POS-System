import os
import zipfile
import shutil

dist_dir = "dist"
pkg_dir = "offline-package"

if os.path.exists(pkg_dir):
    shutil.rmtree(pkg_dir)

os.makedirs(os.path.join(pkg_dir, "app"), exist_ok=True)

# Copy dist files to pkg/app
for item in os.listdir(dist_dir):
    s = os.path.join(dist_dir, item)
    d = os.path.join(pkg_dir, "app", item)
    if os.path.isdir(s):
        shutil.copytree(s, d)
    elif not item.endswith(".zip"):
        shutil.copy2(s, d)

# Write start-cellar-pos.bat
start_bat = r'''@echo off
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
'''
with open(os.path.join(pkg_dir, "start-cellar-pos.bat"), "w", encoding="utf-8") as f:
    f.write(start_bat)

# Write install-desktop-shortcut.bat
shortcut_bat = r'''@echo off
echo Creating Cellar POS shortcut on Desktop...
powershell "$s=(New-Object -COM WScript.Shell).CreateShortcut([System.IO.Path]::Combine([Environment]::GetFolderPath('Desktop'), 'Cellar POS.lnk')); $s.TargetPath='%~dp0start-cellar-pos.bat'; $s.WorkingDirectory='%~dp0'; $s.Save()"
echo Desktop shortcut created! You can now start Cellar POS directly from your desktop.
timeout /t 3
'''
with open(os.path.join(pkg_dir, "install-desktop-shortcut.bat"), "w", encoding="utf-8") as f:
    f.write(shortcut_bat)

# Write open-in-browser.bat (Direct file opener fallback without server)
direct_bat = r'''@echo off
title Cellar POS - Direct Browser Launcher
cd /d "%~dp0"
start "" "%~dp0app\index.html"
'''
with open(os.path.join(pkg_dir, "open-in-browser.bat"), "w", encoding="utf-8") as f:
    f.write(direct_bat)

# Write README.txt
readme = r'''============================================================
 CELLAR POS — OFFLINE RETAIL TILL SYSTEM (v1.0)
 Windows In-Store Installation Package
============================================================

Requirements:
- Any standard computer or laptop running Windows 10 or 11
- No internet connection required
- No Node.js or development software needed

HOW TO INSTALL & RUN:
1. Extract this entire zip folder to a location on your PC
   (e.g., C:\CellarPOS or Desktop).
2. (Optional) Double-click "install-desktop-shortcut.bat" to add
   the Cellar POS icon to your Windows Desktop.
3. Double-click "start-cellar-pos.bat" to launch the POS till.
   It opens in dedicated, borderless app mode just like an installed program!

DATA & BACKUPS:
- All sales, receipts, products, and adjustments are stored
  in your local database.
- Go to Settings > "Download Backup (.json)" anytime to save
  your daily records to a USB flash drive.
'''
with open(os.path.join(pkg_dir, "README.txt"), "w", encoding="utf-8") as f:
    f.write(readme)

# Package into ZIP in public/ and dist/
zip_name = "cellar-pos-desktop-offline-installer.zip"
pub_zip = os.path.join("public", zip_name)
dist_zip = os.path.join("dist", zip_name)

with zipfile.ZipFile(pub_zip, "w", zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(pkg_dir):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, pkg_dir)
            zf.write(file_path, arcname)

shutil.copy2(pub_zip, dist_zip)
print("Offline zip package created successfully, size:", os.path.getsize(pub_zip), "bytes")
