[CmdletBinding()]
param(
  [string]$AgentSkillsDirectory,
  [string]$GitName,
  [string]$GitEmail,
  [switch]$InstallMissingTools,
  [switch]$ReplaceExistingSkill,
  [switch]$NonInteractive,
  [switch]$SkipGitHubCheck
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$skillSource = Join-Path $repoRoot 'paper-skill'
$requiredSkillItems = @(
  'SKILL.md', 'contract.md', 'VERSION', 'assets', 'references', 'scripts', 'templates'
)

function Write-Step {
  param([int]$Number, [string]$Message)
  Write-Host "`n[$Number/7] $Message" -ForegroundColor Cyan
}

function Refresh-ProcessPath {
  $machinePath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
  $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
  $env:Path = (($machinePath, $userPath) -join ';').Trim(';')
}

function Confirm-Action {
  param([string]$Message)
  if ($NonInteractive) {
    return $false
  }
  $answer = Read-Host "$Message [Y/n]"
  return [string]::IsNullOrWhiteSpace($answer) -or $answer -match '^(y|yes)$'
}

function Invoke-Winget {
  param([string]$Operation, [string]$PackageId, [string]$Label)

  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    throw "$Label was not found and winget is unavailable. Install $Label, then run setup again."
  }

  Write-Host "Running winget $Operation for $Label..."
  & winget $Operation --id $PackageId --exact --accept-package-agreements --accept-source-agreements --silent
  if ($LASTEXITCODE -ne 0) {
    throw "winget could not install or upgrade $Label. Resolve the winget error, then run setup again."
  }
  Refresh-ProcessPath
}

function Ensure-Command {
  param([string]$CommandName, [string]$PackageId, [string]$Label)

  if (Get-Command $CommandName -ErrorAction SilentlyContinue) {
    return
  }

  $allowInstall = $InstallMissingTools -or (Confirm-Action "$Label was not found. Install it with winget?")
  if (-not $allowInstall) {
    throw "$Label is required. Install it, or run setup with -InstallMissingTools."
  }

  Invoke-Winget -Operation 'install' -PackageId $PackageId -Label $Label
  if (-not (Get-Command $CommandName -ErrorAction SilentlyContinue)) {
    throw "$Label was installed but is not visible in this terminal. Open a new terminal and run setup again."
  }
}

function Ensure-NodeVersion {
  Ensure-Command -CommandName 'node' -PackageId 'OpenJS.NodeJS.LTS' -Label 'Node.js LTS'
  Ensure-Command -CommandName 'npm' -PackageId 'OpenJS.NodeJS.LTS' -Label 'npm'

  $rawVersion = (& node --version).Trim()
  if ($rawVersion -notmatch '^v(?<major>\d+)') {
    throw "Cannot parse the Node.js version: $rawVersion"
  }

  if ([int]$Matches.major -lt 20) {
    $allowUpgrade = $InstallMissingTools -or (Confirm-Action "Node.js is $rawVersion. Upgrade to version 20 or newer?")
    if (-not $allowUpgrade) {
      throw 'Node.js 20 or newer is required.'
    }
    Invoke-Winget -Operation 'upgrade' -PackageId 'OpenJS.NodeJS.LTS' -Label 'Node.js LTS'
    $rawVersion = (& node --version).Trim()
    if ($rawVersion -notmatch '^v(?<major>\d+)' -or [int]$Matches.major -lt 20) {
      throw "Node.js was upgraded, but this terminal still reports $rawVersion. Open a new terminal and run setup again."
    }
  }

  return $rawVersion
}

function Read-GitValue {
  param([string]$Key)
  $value = & git config --global --get $Key 2>$null
  if ($LASTEXITCODE -ne 0 -or $null -eq $value) {
    return ''
  }
  return ([string]($value | Select-Object -First 1)).Trim()
}

function Ensure-GitIdentity {
  $currentName = Read-GitValue 'user.name'
  $currentEmail = Read-GitValue 'user.email'

  if (-not [string]::IsNullOrWhiteSpace($GitName)) {
    & git config --global user.name $GitName
    if ($LASTEXITCODE -ne 0) { throw 'Could not configure the Git user name.' }
    $currentName = $GitName
  }
  if (-not [string]::IsNullOrWhiteSpace($GitEmail)) {
    & git config --global user.email $GitEmail
    if ($LASTEXITCODE -ne 0) { throw 'Could not configure the Git email.' }
    $currentEmail = $GitEmail
  }

  if ([string]::IsNullOrWhiteSpace($currentName)) {
    if ($NonInteractive) { throw 'Git user.name is missing. Provide -GitName.' }
    $currentName = Read-Host 'Git commit user name'
    if ([string]::IsNullOrWhiteSpace($currentName)) { throw 'Git user name cannot be empty.' }
    & git config --global user.name $currentName
    if ($LASTEXITCODE -ne 0) { throw 'Could not configure the Git user name.' }
  }
  if ([string]::IsNullOrWhiteSpace($currentEmail)) {
    if ($NonInteractive) { throw 'Git user.email is missing. Provide -GitEmail.' }
    $currentEmail = Read-Host 'Git commit email'
    if ([string]::IsNullOrWhiteSpace($currentEmail)) { throw 'Git email cannot be empty.' }
    & git config --global user.email $currentEmail
    if ($LASTEXITCODE -ne 0) { throw 'Could not configure the Git email.' }
  }

  return "$currentName <$currentEmail>"
}

function Test-SkillLayout {
  param([string]$Directory)
  foreach ($item in $requiredSkillItems) {
    if (-not (Test-Path -LiteralPath (Join-Path $Directory $item))) {
      return $false
    }
  }
  return $true
}

function Get-SkillFingerprint {
  param([string]$Directory)

  $root = [System.IO.Path]::GetFullPath($Directory).TrimEnd('\')
  $records = Get-ChildItem -LiteralPath $root -Recurse -File |
    Sort-Object FullName |
    ForEach-Object {
      $relativePath = $_.FullName.Substring($root.Length).TrimStart('\') -replace '\\', '/'
      $fileHash = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
      "$relativePath`t$fileHash"
    }

  $payload = [System.Text.Encoding]::UTF8.GetBytes(($records -join "`n"))
  $sha256 = [System.Security.Cryptography.SHA256]::Create()
  try {
    return ([System.BitConverter]::ToString($sha256.ComputeHash($payload))).Replace('-', '').ToLowerInvariant()
  }
  finally {
    $sha256.Dispose()
  }
}

function Install-PaperSkill {
  param([string]$SkillsRoot)

  $destination = Join-Path $SkillsRoot 'paper-skill'
  $repoVersion = (Get-Content -LiteralPath (Join-Path $skillSource 'VERSION') -Raw).Trim()
  $repoFingerprint = Get-SkillFingerprint $skillSource
  $destinationReady = (Test-Path -LiteralPath $destination) -and (Test-SkillLayout $destination)
  $installedVersion = ''
  $installedFingerprint = ''
  if ($destinationReady) {
    $installedVersion = (Get-Content -LiteralPath (Join-Path $destination 'VERSION') -Raw).Trim()
    $installedFingerprint = Get-SkillFingerprint $destination
  }

  if ($destinationReady -and $installedVersion -eq $repoVersion -and $installedFingerprint -eq $repoFingerprint) {
    Write-Host 'Paper Skill already matches the repository.'
    return $destination
  }

  if (Test-Path -LiteralPath $destination) {
    $allowReplace = $ReplaceExistingSkill -or (Confirm-Action 'paper-skill already exists. Replace it with the repository copy?')
    if (-not $allowReplace) {
      throw 'paper-skill was not replaced. Confirm the destination, or use -ReplaceExistingSkill.'
    }
  }

  $installId = [Guid]::NewGuid().ToString('N')
  $staging = Join-Path $SkillsRoot ".paper-skill-install-$installId"
  $backup = Join-Path $SkillsRoot ".paper-skill-backup-$installId"
  $hasBackup = $false

  try {
    Copy-Item -LiteralPath $skillSource -Destination $staging -Recurse -Force
    if (-not (Test-SkillLayout $staging)) {
      throw 'The staged Paper Skill copy is incomplete.'
    }

    if (Test-Path -LiteralPath $destination) {
      Move-Item -LiteralPath $destination -Destination $backup
      $hasBackup = $true
    }
    Move-Item -LiteralPath $staging -Destination $destination

    $copiedVersion = (Get-Content -LiteralPath (Join-Path $destination 'VERSION') -Raw).Trim()
    $copiedFingerprint = Get-SkillFingerprint $destination
    if ($copiedVersion -ne $repoVersion -or $copiedFingerprint -ne $repoFingerprint -or -not (Test-SkillLayout $destination)) {
      throw 'The installed Paper Skill failed its integrity or layout check.'
    }

    if ($hasBackup) {
      Remove-Item -LiteralPath $backup -Recurse -Force
      $hasBackup = $false
    }
  }
  catch {
    if (Test-Path -LiteralPath $destination) {
      Remove-Item -LiteralPath $destination -Recurse -Force
    }
    if ($hasBackup -and (Test-Path -LiteralPath $backup)) {
      Move-Item -LiteralPath $backup -Destination $destination
      $hasBackup = $false
    }
    throw
  }
  finally {
    if (Test-Path -LiteralPath $staging) {
      Remove-Item -LiteralPath $staging -Recurse -Force
    }
    if ($hasBackup -and (Test-Path -LiteralPath $backup)) {
      Write-Warning "The previous directory backup remains at: $backup"
    }
  }

  Write-Host 'Paper Skill installed and verified.'
  return $destination
}

try {
  Write-Host 'PaperSkill participant environment setup' -ForegroundColor Green

  Write-Step 1 'Check repository layout'
  foreach ($requiredPath in @('package.json', 'paper-skill\SKILL.md', 'paper-skill\VERSION')) {
    if (-not (Test-Path -LiteralPath (Join-Path $repoRoot $requiredPath))) {
      throw "The script is not inside a complete PaperSkill repository. Missing: $requiredPath"
    }
  }
  Write-Host "Repository: $repoRoot"

  Write-Step 2 'Check Node.js, npm, and Git'
  Ensure-Command -CommandName 'git' -PackageId 'Git.Git' -Label 'Git'
  $nodeVersion = Ensure-NodeVersion
  $npmVersion = (& npm --version).Trim()
  $gitVersion = (& git --version).Trim()
  Write-Host "$nodeVersion | npm $npmVersion | $gitVersion"

  Write-Step 3 'Check Git commit identity'
  $gitIdentity = Ensure-GitIdentity
  Write-Host "Git identity: $gitIdentity"

  Write-Step 4 'Check the GitHub remote'
  $origin = & git -C $repoRoot remote get-url origin 2>$null
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace([string]$origin)) {
    throw 'The repository has no origin remote. Clone the official repository or a personal fork first.'
  }
  Write-Host "origin: $origin"
  if ($SkipGitHubCheck) {
    Write-Host 'Remote connection check skipped.'
  }
  else {
    & git -C $repoRoot ls-remote origin HEAD | Out-Null
    if ($LASTEXITCODE -ne 0) {
      throw 'Cannot connect to origin. Complete GitHub login, HTTPS credentials, or SSH setup first.'
    }
    Write-Host 'GitHub remote read check passed.'
  }

  Write-Step 5 'Resolve the Agent Skill directory'
  if ([string]::IsNullOrWhiteSpace($AgentSkillsDirectory)) {
    if ($NonInteractive) {
      throw 'Provide the selected Agent Skill root with -AgentSkillsDirectory.'
    }
    $AgentSkillsDirectory = Read-Host 'Agent Skill root directory'
  }
  if ([string]::IsNullOrWhiteSpace($AgentSkillsDirectory)) {
    throw 'The Agent Skill root cannot be empty.'
  }
  $skillsRoot = [System.IO.Path]::GetFullPath($AgentSkillsDirectory)
  $repoPrefix = $repoRoot.TrimEnd('\') + '\'
  if ($skillsRoot.StartsWith($repoPrefix, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'The Agent Skill directory cannot be inside the PaperSkill repository.'
  }
  New-Item -ItemType Directory -Path $skillsRoot -Force | Out-Null
  $skillsRoot = (Resolve-Path -LiteralPath $skillsRoot).Path
  Write-Host "Skill root: $skillsRoot"

  Write-Step 6 'Install and verify Paper Skill'
  $installedPath = Install-PaperSkill -SkillsRoot $skillsRoot
  Write-Host "Installed at: $installedPath"

  Write-Step 7 'Run repository validation'
  & npm --prefix $repoRoot run validate
  if ($LASTEXITCODE -ne 0) {
    throw 'Repository validation failed. Resolve the reported errors and run setup again.'
  }

  Write-Host "`nEnvironment setup completed. Reload the selected Agent and confirm it recognizes paper-skill." -ForegroundColor Green
  Write-Host 'The participant must confirm GitHub authorization, fork ownership, and Agent reload.'
  exit 0
}
catch {
  Write-Host "`nEnvironment setup did not complete: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}
