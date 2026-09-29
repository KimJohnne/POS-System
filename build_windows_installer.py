import os
import shutil
from PIL import Image

def generate_ico():
    from PIL import Image, ImageDraw
    img = Image.new('RGBA', (256, 256), color=(74, 14, 23, 255))
    d = ImageDraw.Draw(img)
    # Draw golden border and amber bottle/wine shape
    d.rectangle([10, 10, 245, 245], outline=(245, 158, 11, 255), width=6)
    d.rectangle([100, 40, 156, 100], fill=(245, 158, 11, 255))
    d.rectangle([80, 100, 176, 220], fill=(245, 158, 11, 255))
    img.save('app.ico', format='ICO', sizes=[(256,256), (128,128), (64,64), (48,48), (32,32), (16,16)])
    print("Generated Windows app.ico")

def generate_launcher_scripts():
    # Silent VBS launcher that runs the POS app without flashing a CMD window
    vbs_content = '''Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
strPath = fso.GetParentFolderName(WScript.ScriptFullName)

' Check for Microsoft Edge or Chrome
edgePath86 = WshShell.ExpandEnvironmentStrings("%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe")
edgePath = WshShell.ExpandEnvironmentStrings("%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe")
chromePath86 = WshShell.ExpandEnvironmentStrings("%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe")
chromePath = WshShell.ExpandEnvironmentStrings("%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe")

htmlPath = strPath & "\\app\\index.html"
targetUrl = "http://localhost:5000"

' Start background loopback server
psCmd = "powershell -WindowStyle Hidden -Command ""$p=5000; $l=New-Object System.Net.HttpListener; $l.Prefixes.Add('http://localhost:5000/'); try{$l.Start()}catch{}; while($l.IsListening){ $c=$l.GetContext(); $req=$c.Request; $res=$c.Response; $url=$req.Url.LocalPath.TrimStart('/'); if([string]::IsNullOrEmpty($url)){$url='index.html'}; $fp=Join-Path -Path '" & strPath & "\\app' -ChildPath $url; if(-not (Test-Path $fp)){$fp='" & strPath & "\\app\\index.html'}; $bytes=[System.IO.File]::ReadAllBytes($fp); if($fp.EndsWith('.html')){$res.ContentType='text/html'}elseif($fp.EndsWith('.js')){$res.ContentType='application/javascript'}elseif($fp.EndsWith('.css')){$res.ContentType='text/css'}elseif($fp.EndsWith('.svg')){$res.ContentType='image/svg+xml'}elseif($fp.EndsWith('.png')){$res.ContentType='image/png'}elseif($fp.EndsWith('.json')){$res.ContentType='application/json'}elseif($fp.EndsWith('.webmanifest')){$res.ContentType='application/manifest+json'}; $res.ContentLength64=$bytes.Length; $res.OutputStream.Write($bytes,0,$bytes.Length); $res.OutputStream.Close() }"""

WshShell.Run psCmd, 0, False
WScript.Sleep 800

' Launch standalone window
If fso.FileExists(edgePath) Then
    WshShell.Run """" & edgePath & """ --app=""" & targetUrl & """", 1, False
ElseIf fso.FileExists(edgePath86) Then
    WshShell.Run """" & edgePath86 & """ --app=""" & targetUrl & """", 1, False
ElseIf fso.FileExists(chromePath) Then
    WshShell.Run """" & chromePath & """ --app=""" & targetUrl & """", 1, False
ElseIf fso.FileExists(chromePath86) Then
    WshShell.Run """" & chromePath86 & """ --app=""" & targetUrl & """", 1, False
Else
    ' Direct browser fallback
    WshShell.Run """" & htmlPath & """", 1, False
End If
'''
    with open("CellarPOS.vbs", "w", encoding="utf-8") as f:
        f.write(vbs_content)

    bat_content = '''@echo off
title Cellar POS Till
cd /d "%~dp0"
start "" wscript.exe "%~dp0CellarPOS.vbs"
'''
    with open("CellarPOS.bat", "w", encoding="utf-8") as f:
        f.write(bat_content)

def generate_nsis_script():
    nsi_content = r'''; Cellar POS Windows Installer Script (NSIS 3.0)
!include "MUI2.nsh"
!include "FileFunc.nsh"

Name "Cellar POS"
OutFile "Cellar-POS-Setup-v1.0.exe"
InstallDir "$LOCALAPPDATA\CellarPOS"
InstallDirRegKey HKCU "Software\CellarPOS" "InstallDir"
RequestExecutionLevel user

; Interface Configuration
!define MUI_ICON "app.ico"
!define MUI_UNICON "app.ico"
!define MUI_HEADERIMAGE
!define MUI_ABORTWARNING

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES

; Finish Page with Run Checkbox
!define MUI_FINISHPAGE_RUN "$INSTDIR\CellarPOS.bat"
!define MUI_FINISHPAGE_RUN_TEXT "Launch Cellar POS Till now"
!insertmacro MUI_PAGE_FINISH

; Uninstaller Pages
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "English"

Section "Install" SecInstall
    SetOutPath "$INSTDIR"
    
    ; Install Core Launcher files & Icons
    File "app.ico"
    File "CellarPOS.vbs"
    File "CellarPOS.bat"
    
    ; Install Web Application Assets
    SetOutPath "$INSTDIR\app"
    File /r "dist\*.*"
    
    ; Return to root install directory
    SetOutPath "$INSTDIR"
    
    ; Create Uninstaller
    WriteUninstaller "$INSTDIR\Uninstall.exe"
    
    ; Create Start Menu Shortcuts
    CreateDirectory "$SMPROGRAMS\Cellar POS"
    CreateShortcut "$SMPROGRAMS\Cellar POS\Cellar POS.lnk" "$INSTDIR\CellarPOS.bat" "" "$INSTDIR\app.ico" 0
    CreateShortcut "$SMPROGRAMS\Cellar POS\Uninstall Cellar POS.lnk" "$INSTDIR\Uninstall.exe" "" "$INSTDIR\Uninstall.exe" 0
    
    ; Create Desktop Shortcut
    CreateShortcut "$DESKTOP\Cellar POS.lnk" "$INSTDIR\CellarPOS.bat" "" "$INSTDIR\app.ico" 0
    
    ; Registry for Add/Remove Programs
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\CellarPOS" "DisplayName" "Cellar POS — Wines & Spirits Till"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\CellarPOS" "DisplayVersion" "1.0.0"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\CellarPOS" "Publisher" "The Cellar Retail Systems"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\CellarPOS" "DisplayIcon" "$INSTDIR\app.ico"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\CellarPOS" "UninstallString" "$INSTDIR\Uninstall.exe"
    WriteRegStr HKCU "Software\CellarPOS" "InstallDir" "$INSTDIR"
SectionEnd

Section "Uninstall"
    ; Remove Shortcuts
    Delete "$DESKTOP\Cellar POS.lnk"
    Delete "$SMPROGRAMS\Cellar POS\Cellar POS.lnk"
    Delete "$SMPROGRAMS\Cellar POS\Uninstall Cellar POS.lnk"
    RMDir "$SMPROGRAMS\Cellar POS"
    
    ; Remove App Files
    RMDir /r "$INSTDIR\app"
    Delete "$INSTDIR\CellarPOS.bat"
    Delete "$INSTDIR\CellarPOS.vbs"
    Delete "$INSTDIR\app.ico"
    Delete "$INSTDIR\Uninstall.exe"
    RMDir "$INSTDIR"
    
    ; Remove Registry entries
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\CellarPOS"
    DeleteRegKey HKCU "Software\CellarPOS"
SectionEnd
'''
    with open("CellarPOS.nsi", "w", encoding="utf-8") as f:
        f.write(nsi_content)
    print("Generated CellarPOS.nsi")

if __name__ == "__main__":
    generate_ico()
    generate_launcher_scripts()
    generate_nsis_script()
