@echo off
echo Creating Cellar POS shortcut on Desktop...
powershell "$s=(New-Object -COM WScript.Shell).CreateShortcut([System.IO.Path]::Combine([Environment]::GetFolderPath('Desktop'), 'Cellar POS.lnk')); $s.TargetPath='%~dp0start-cellar-pos.bat'; $s.WorkingDirectory='%~dp0'; $s.Save()"
echo Desktop shortcut created! You can now start Cellar POS directly from your desktop.
timeout /t 3
