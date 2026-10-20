$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$localRoot = Join-Path $projectRoot '.local'
New-Item -ItemType Directory -Path $localRoot -Force | Out-Null

function Test-LocalPort([int]$Port) {
    $client = New-Object System.Net.Sockets.TcpClient
    try { $client.Connect('127.0.0.1', $Port); return $true }
    catch { return $false }
    finally { $client.Dispose() }
}

function Wait-LocalPort([int]$Port, $Process) {
    for ($attempt = 0; $attempt -lt 60; $attempt++) {
        if (Test-LocalPort $Port) { return }
        if ($Process.HasExited) { throw "Database exited. See logs in $localRoot" }
        Start-Sleep -Milliseconds 500
    }
    throw "Database port $Port did not become ready. See logs in $localRoot"
}

if (-not (Test-LocalPort 3306)) {
    $mysqlBinary = Get-ChildItem 'C:\Program Files\MySQL' -Filter mysqld.exe -Recurse -ErrorAction SilentlyContinue |
        Sort-Object FullName -Descending | Select-Object -First 1
    if (-not $mysqlBinary) { throw 'Install MySQL Server first: winget install --id Oracle.MySQL --exact' }
    $mysqlData = Join-Path $localRoot 'mysql-data'
    $mysqlLog = Join-Path $localRoot 'mysql-error.log'
    if (-not (Test-Path (Join-Path $mysqlData 'mysql'))) {
        & $mysqlBinary.FullName --no-defaults --initialize-insecure "--datadir=$mysqlData"
        if ($LASTEXITCODE -ne 0) { throw 'MySQL data initialization failed.' }
    }
    $mysqlArgs = @('--no-defaults', ('--datadir="' + $mysqlData + '"'), '--bind-address=127.0.0.1', '--port=3306', '--mysqlx=0', ('--log-error="' + $mysqlLog + '"'))
    $mysqlProcess = Start-Process -FilePath $mysqlBinary.FullName -ArgumentList $mysqlArgs -WindowStyle Hidden -PassThru
    Wait-LocalPort 3306 $mysqlProcess
}

if (-not (Test-LocalPort 27017)) {
    $mongoBinary = Get-ChildItem 'C:\Program Files\MongoDB' -Filter mongod.exe -Recurse -ErrorAction SilentlyContinue |
        Sort-Object FullName -Descending | Select-Object -First 1
    if (-not $mongoBinary) { throw 'Install MongoDB first: winget install --id MongoDB.Server --exact' }
    $mongoData = Join-Path $localRoot 'mongo-data'
    $mongoLog = Join-Path $localRoot 'mongo.log'
    New-Item -ItemType Directory -Path $mongoData -Force | Out-Null
    $mongoArgs = @('--dbpath', ('"' + $mongoData + '"'), '--bind_ip', '127.0.0.1', '--port', '27017', '--logpath', ('"' + $mongoLog + '"'), '--logappend')
    $mongoProcess = Start-Process -FilePath $mongoBinary.FullName -ArgumentList $mongoArgs -WindowStyle Hidden -PassThru
    Wait-LocalPort 27017 $mongoProcess
}
Write-Output 'MySQL :3306 and MongoDB :27017 are ready.'
