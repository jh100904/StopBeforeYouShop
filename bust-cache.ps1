# Setzt bei jedem Deploy eine frische Versionsnummer an styles.css und script.js,
# damit Browser garantiert die neueste Version laden (kein Cache-Problem mehr).
$v = Get-Date -Format 'yyyyMMddHHmmss'
$enc = New-Object System.Text.UTF8Encoding($false)
Get-ChildItem -Path $PSScriptRoot -Filter *.html | ForEach-Object {
    $p = $_.FullName
    $c = [System.IO.File]::ReadAllText($p)
    $c = [regex]::Replace($c, '(src="script\.js)(\?v=\d+)?"',   ('${1}?v=' + $v + '"'))
    $c = [regex]::Replace($c, '(href="styles\.css)(\?v=\d+)?"', ('${1}?v=' + $v + '"'))
    [System.IO.File]::WriteAllText($p, $c, $enc)
}
Write-Host ("Cache-Version gesetzt: " + $v)
