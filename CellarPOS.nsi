; Cellar POS Windows Installer Script (NSIS 3.0)
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
