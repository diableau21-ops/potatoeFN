const downloadButton = document.getElementById("download");
const toolButton = document.getElementById("download-tool");

function saveTextFile(filename, content, type) {
  const file = new Blob([content], { type });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

downloadButton.addEventListener("click", () => {
  const mode = document.getElementById("mode").value;
  const resolution = document.getElementById("resolution-select").value;
  const fps = document.getElementById("fps").value;
  const content = [
    "POTATOFN — TON PRESET FORTNITE",
    "================================",
    "",
    "Mode graphique : " + mode,
    "Résolution souhaitée : " + resolution,
    "Limite FPS : " + fps,
    "",
    "Le mode graphique doit être choisi dans les paramètres de Fortnite.",
    "Le rendu étiré peut aussi nécessiter un réglage de mise à l'échelle GPU."
  ].join("\n");
  saveTextFile("PotatoFN-preset.txt", content, "text/plain;charset=utf-8");
});

toolButton.addEventListener("click", () => {
  const resolution = document.getElementById("resolution-select").value;
  const fpsChoice = document.getElementById("fps").value;
  const dimensions = resolution.match(/(\d+)\s*×\s*(\d+)/);
  if (!dimensions) {
    alert("Choisis une résolution précise avant de télécharger l’outil.");
    return;
  }

  const width = Number(dimensions[1]);
  const height = Number(dimensions[2]);
  const fps = fpsChoice === "Illimité" ? 0 : Number(fpsChoice.match(/\d+/)?.[0] || 0);

  const powershell = \`# PotatoFN — outil de réglages Fortnite
# Lis ce fichier avant de l'exécuter. Aucun fichier du jeu ou anti-triche n'est modifié.
$ErrorActionPreference = "Stop"
$configFolder = Join-Path $env:LOCALAPPDATA "FortniteGame\\Saved\\Config\\WindowsClient"
$configFile = Join-Path $configFolder "GameUserSettings.ini"

if (Get-Process -Name "FortniteClient-Win64-Shipping" -ErrorAction SilentlyContinue) {
    Write-Host "Ferme Fortnite complètement, puis relance cet outil." -ForegroundColor Yellow
    Read-Host "Appuie sur Entrée pour fermer"
    exit
}
if (-not (Test-Path $configFile)) {
    Write-Host "Fichier de configuration Fortnite introuvable :" -ForegroundColor Red
    Write-Host $configFile
    Write-Host "Lance Fortnite une fois, ferme-le, puis réessaie."
    Read-Host "Appuie sur Entrée pour fermer"
    exit
}

$backupFile = "$configFile.PotatoFN-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item -LiteralPath $configFile -Destination $backupFile
$lines = [System.Collections.Generic.List[string]]::new()
Get-Content -LiteralPath $configFile | ForEach-Object { $lines.Add($_) }

function Set-IniValue([string]$Section, [string]$Key, [string]$Value) {
    $header = "[$Section]"
    $start = -1
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i].Trim() -ieq $header) { $start = $i; break }
    }
    if ($start -lt 0) {
        $lines.Add("")
        $lines.Add($header)
        $start = $lines.Count - 1
    }
    $end = $lines.Count
    for ($i = $start + 1; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match '^\\s*\\[.+\\]\\s*$') { $end = $i; break }
    }
    $pattern = '^\\s*' + [regex]::Escape($Key) + '\\s*='
    for ($i = $start + 1; $i -lt $end; $i++) {
        if ($lines[$i] -match $pattern) {
            $lines[$i] = "$Key=$Value"
            return
        }
    }
    $lines.Insert($end, "$Key=$Value")
}

$engineSection = "/Script/Engine.GameUserSettings"
Set-IniValue $engineSection "ResolutionSizeX" "\${width}"
Set-IniValue $engineSection "ResolutionSizeY" "\${height}"
Set-IniValue $engineSection "LastUserConfirmedResolutionSizeX" "\${width}"
Set-IniValue $engineSection "LastUserConfirmedResolutionSizeY" "\${height}"
Set-IniValue $engineSection "DesiredScreenWidth" "\${width}"
Set-IniValue $engineSection "DesiredScreenHeight" "\${height}"
Set-IniValue $engineSection "LastUserConfirmedDesiredScreenWidth" "\${width}"
Set-IniValue $engineSection "LastUserConfirmedDesiredScreenHeight" "\${height}"
Set-IniValue $engineSection "FullscreenMode" "0"
Set-IniValue $engineSection "LastConfirmedFullscreenMode" "0"
Set-IniValue $engineSection "PreferredFullscreenMode" "0"

$fortniteSection = "/Script/FortniteGame.FortGameUserSettings"
Set-IniValue $fortniteSection "FrameRateLimit" "\${fps}.000000"

[System.IO.File]::WriteAllLines($configFile, $lines, [System.Text.UTF8Encoding]::new($false))
Write-Host ""
Write-Host "Réglages PotatoFN appliqués !" -ForegroundColor Green
Write-Host "Résolution : \${width} x \${height}"
Write-Host "Limite FPS : \${fpsChoice}"
Write-Host "Sauvegarde créée : $backupFile"
Write-Host ""
Write-Host "Relance Fortnite et vérifie les paramètres Vidéo."
Write-Host "Si le jeu remplace ces valeurs, règle-les dans Fortnite."
Read-Host "Appuie sur Entrée pour fermer"
\`;

  saveTextFile("PotatoFN-ApplySettings.ps1", powershell, "text/plain;charset=utf-8");
  alert("Outil téléchargé ! Ferme Fortnite. Clique droit sur PotatoFN-ApplySettings.ps1 puis choisis « Exécuter avec PowerShell ». Lis le script avant de le lancer.");
});
