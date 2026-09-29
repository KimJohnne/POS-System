Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
strPath = fso.GetParentFolderName(WScript.ScriptFullName)

' Check for Microsoft Edge or Chrome
edgePath86 = WshShell.ExpandEnvironmentStrings("%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe")
edgePath = WshShell.ExpandEnvironmentStrings("%ProgramFiles%\Microsoft\Edge\Application\msedge.exe")
chromePath86 = WshShell.ExpandEnvironmentStrings("%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe")
chromePath = WshShell.ExpandEnvironmentStrings("%ProgramFiles%\Google\Chrome\Application\chrome.exe")

htmlPath = strPath & "\app\index.html"
targetUrl = "http://localhost:5000"

' Start background loopback server
psCmd = "powershell -WindowStyle Hidden -Command ""$p=5000; $l=New-Object System.Net.HttpListener; $l.Prefixes.Add('http://localhost:5000/'); try{$l.Start()}catch{}; while($l.IsListening){ $c=$l.GetContext(); $req=$c.Request; $res=$c.Response; $url=$req.Url.LocalPath.TrimStart('/'); if([string]::IsNullOrEmpty($url)){$url='index.html'}; $fp=Join-Path -Path '" & strPath & "\app' -ChildPath $url; if(-not (Test-Path $fp)){$fp='" & strPath & "\app\index.html'}; $bytes=[System.IO.File]::ReadAllBytes($fp); if($fp.EndsWith('.html')){$res.ContentType='text/html'}elseif($fp.EndsWith('.js')){$res.ContentType='application/javascript'}elseif($fp.EndsWith('.css')){$res.ContentType='text/css'}elseif($fp.EndsWith('.svg')){$res.ContentType='image/svg+xml'}elseif($fp.EndsWith('.png')){$res.ContentType='image/png'}elseif($fp.EndsWith('.json')){$res.ContentType='application/json'}elseif($fp.EndsWith('.webmanifest')){$res.ContentType='application/manifest+json'}; $res.ContentLength64=$bytes.Length; $res.OutputStream.Write($bytes,0,$bytes.Length); $res.OutputStream.Close() }"""

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
