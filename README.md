$base = "$env:LOCALAPPDATA\MonitorKeyUsersData"
$daily = Join-Path $base "daily\$(Get-Date -Format 'yyyy-MM-dd').json"
$log = Join-Path $base "agent.log"

Get-Item $daily -ErrorAction SilentlyContinue |
    Select-Object Length, LastWriteTime

if (Test-Path $daily) {
    try {
        $json = Get-Content $daily -Raw -Encoding UTF8 |
            ConvertFrom-Json -ErrorAction Stop
        Write-Host "JSON: VALIDO"
        Write-Host "Eventos:" @($json.events).Count
    }
    catch {
        Write-Host "JSON: INVALIDO OU INACESSIVEL"
    }
}
else {
    Write-Host "JSON: AUSENTE"
}

Get-Content $log -Tail 100 |
    Select-String "PERSISTENCE_REJECTED"
