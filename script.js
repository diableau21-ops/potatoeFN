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
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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

  const powershell = `# PotatoFN — outil de réglages Fortnite
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
Set-IniValue $engineSection "ResolutionSizeX" "${width}"
Set-IniValue $engineSection "ResolutionSizeY" "${height}"
Set-IniValue $engineSection "LastUserConfirmedResolutionSizeX" "${width}"
Set-IniValue $engineSection "LastUserConfirmedResolutionSizeY" "${height}"
Set-IniValue $engineSection "DesiredScreenWidth" "${width}"
Set-IniValue $engineSection "DesiredScreenHeight" "${height}"
Set-IniValue $engineSection "LastUserConfirmedDesiredScreenWidth" "${width}"
Set-IniValue $engineSection "LastUserConfirmedDesiredScreenHeight" "${height}"
Set-IniValue $engineSection "FullscreenMode" "0"
Set-IniValue $engineSection "LastConfirmedFullscreenMode" "0"
Set-IniValue $engineSection "PreferredFullscreenMode" "0"

$fortniteSection = "/Script/FortniteGame.FortGameUserSettings"
Set-IniValue $fortniteSection "FrameRateLimit" "${fps}.000000"

[System.IO.File]::WriteAllLines($configFile, $lines, [System.Text.UTF8Encoding]::new($false))
Write-Host ""
Write-Host "Réglages PotatoFN appliqués !" -ForegroundColor Green
Write-Host "Résolution : ${width} x ${height}"
Write-Host "Limite FPS : ${fpsChoice}"
Write-Host "Sauvegarde créée : $backupFile"
Write-Host ""
Write-Host "Démarrage de Fortnite..."
Write-Host "Le jeu peut remplacer certaines valeurs au démarrage."
try {
    Start-Process "com.epicgames.launcher://apps/Fortnite?action=launch&silent=true"
    Write-Host "La demande de lancement a été envoyée à Epic Games Launcher." -ForegroundColor Green
} catch {
    Write-Host "Impossible de lancer Fortnite automatiquement." -ForegroundColor Yellow
    Write-Host "Ouvre Epic Games Launcher et démarre Fortnite manuellement."
}
Read-Host "Appuie sur Entrée pour fermer"
`;

  saveTextFile("PotatoFN-ApplySettings.ps1", powershell, "text/plain;charset=utf-8");
  alert("Fichier téléchargé ! Ferme Fortnite, puis clique droit sur PotatoFN-ApplySettings.ps1 et choisis « Exécuter avec PowerShell ». Le script prépare les réglages compatibles puis demande à Epic Games Launcher de démarrer Fortnite. Lis le script avant de le lancer.");
});


// Natural color preview and manual settings guide.
const colorInputs = ["saturation", "contrast", "brightness"];
function updateColorPreview() {
  const saturation = Number(document.getElementById("saturation").value);
  const contrast = Number(document.getElementById("contrast").value);
  const brightness = Number(document.getElementById("brightness").value);
  document.getElementById("saturation-value").textContent = saturation + "%";
  document.getElementById("contrast-value").textContent = contrast + "%";
  document.getElementById("brightness-value").textContent = brightness + "%";
  document.getElementById("color-preview").style.filter =
    "saturate(" + saturation / 100 + ") contrast(" + contrast / 100 + ") brightness(" + brightness / 100 + ")";
}
colorInputs.forEach(id => document.getElementById(id).addEventListener("input", updateColorPreview));
updateColorPreview();

document.getElementById("download-colors").addEventListener("click", () => {
  const saturation = document.getElementById("saturation").value;
  const contrast = document.getElementById("contrast").value;
  const brightness = document.getElementById("brightness").value;
  const content = [
    "POTATOFN — VALEURS DE COULEURS NATURELLES",
    "",
    "Saturation suggérée : " + saturation + "%",
    "Contraste suggéré : " + contrast + "%",
    "Luminosité suggérée : " + brightness + "%",
    "",
    "Ces valeurs sont un point de départ, pas des réglages universels.",
    "Ajuste-les progressivement dans le panneau de contrôle graphique de ton PC.",
    "Le fichier ne modifie pas automatiquement Fortnite ni les couleurs de Windows."
  ].join("\n");
  saveTextFile("PotatoFN-couleurs.txt", content, "text/plain;charset=utf-8");
});


// The sidebar download button downloads the selected preset.
document.getElementById("download-sidebar").addEventListener("click", () => {
  downloadButton.click();
});


// Companion mode: shows a guide beside Fortnite without changing the running game.
const companionButton = document.getElementById("open-companion");
if (companionButton) {
  companionButton.addEventListener("click", () => {
    const oldPanel = document.getElementById("potatofn-companion");
    if (oldPanel) oldPanel.remove();

    const mode = document.getElementById("mode").value;
    const resolution = document.getElementById("resolution-select").value;
    const fps = document.getElementById("fps").value;

    const overlay = document.createElement("div");
    overlay.id = "potatofn-companion";
    overlay.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(4,3,9,.88);display:grid;place-items:center;padding:18px;";
    overlay.innerHTML = `
      <section role="dialog" aria-modal="true" aria-labelledby="companion-title" style="width:min(560px,100%);max-height:90vh;overflow:auto;background:#151020;border:1px solid #9b5cff;border-radius:14px;padding:26px;color:#f7f4ff;font-family:Inter,Arial,sans-serif;box-shadow:0 20px 80px #000;">
        <div style="color:#bd83ff;font-size:10px;letter-spacing:2px;font-weight:800;">POTATOFN / MODE COMPAGNON</div>
        <h2 id="companion-title" style="font-family:Orbitron,Arial,sans-serif;font-size:22px;margin:12px 0;">Ton guide de réglages</h2>
        <p style="color:#b8aec8;font-size:13px;line-height:1.6;">Garde cette fenêtre ouverte à côté de Fortnite (ou consulte-la avant de retourner au jeu). Elle ne modifie pas le jeu en direct.</p>
        <div style="background:#21172f;border-radius:9px;padding:14px;margin:16px 0;font-size:13px;line-height:1.9;">
          <strong>Ton profil choisi</strong><br>
          Mode : ${mode}<br>
          Résolution : ${resolution}<br>
          Limite FPS : ${fps}
        </div>
        <ol style="color:#ddd3e9;font-size:13px;line-height:1.9;padding-left:20px;">
          <li>Ouvre les paramètres de Fortnite.</li>
          <li>Dans Vidéo, sélectionne le mode graphique choisi si disponible.</li>
          <li>Règle la résolution et le mode plein écran selon les options proposées.</li>
          <li>Règle la limite d’images par seconde.</li>
          <li>Applique les changements et vérifie que l’image te convient.</li>
        </ol>
        <p style="color:#a99bb9;font-size:11px;line-height:1.6;">Pour modifier le fichier de configuration avec l’outil Windows, ferme d’abord Fortnite. N’exécute pas le script pendant que le jeu est ouvert.</p>
        <button id="close-potatofn-companion" type="button" style="border:0;border-radius:8px;background:linear-gradient(105deg,#8748e8,#c04ce9);color:white;padding:12px 18px;font-weight:800;cursor:pointer;">Fermer le guide</button>
      </section>`;
    document.body.appendChild(overlay);
    document.getElementById("close-potatofn-companion").addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", event => { if (event.target === overlay) overlay.remove(); });
  });
}


// Desktop shortcut customizer: only edits the selected Windows .lnk shortcut.
const shortcutNameInput = document.getElementById("shortcut-name");
if (shortcutNameInput) {
  const preview = document.getElementById("shortcut-preview-name");
  shortcutNameInput.addEventListener("input", () => {
    preview.textContent = shortcutNameInput.value.trim() || "Fortnite";
  });
  document.getElementById("download-shortcut-tool").addEventListener("click", () => {
    const chosenName = shortcutNameInput.value.trim().replace(/[\\/:*?"<>|]/g, "").replace(/[. ]+$/g, "");
    if (!chosenName) { alert("Entre un nom valide pour le raccourci."); return; }
    const iconChoice = document.getElementById("shortcut-icon").value;
    const psName = chosenName.replace(/'/g, "''");
    const powershell = String.raw`# PotatoFN — personnaliser le raccourci Fortnite du bureau
$ErrorActionPreference = "Stop"
$desktop = [Environment]::GetFolderPath("Desktop")
$ws = New-Object -ComObject WScript.Shell
$links = @(Get-ChildItem -LiteralPath $desktop -Filter "*.lnk" -File -ErrorAction SilentlyContinue)
$matches = @()
foreach ($file in $links) {
  try {
    $sc = $ws.CreateShortcut($file.FullName)
    if ($file.BaseName -match "Fortnite" -or $sc.TargetPath -match "Fortnite" -or $sc.Arguments -match "Fortnite") { $matches += $file }
  } catch {}
}
$selected = $null
if ($matches.Count -eq 1) { $selected = $matches[0] }
elseif ($matches.Count -gt 1) {
  Write-Host "Plusieurs raccourcis Fortnite ont été trouvés :" -ForegroundColor Cyan
  for ($i=0; $i -lt $matches.Count; $i++) { Write-Host "$($i+1). $($matches[$i].Name)" }
  $pick = Read-Host "Entre le numéro du raccourci à modifier"
  $number = 0
  if ([int]::TryParse($pick, [ref]$number) -and $number -ge 1 -and $number -le $matches.Count) { $selected = $matches[$number-1] }
}
if (-not $selected) {
  Add-Type -AssemblyName System.Windows.Forms
  $dialog = New-Object System.Windows.Forms.OpenFileDialog
  $dialog.InitialDirectory = $desktop
  $dialog.Filter = "Raccourcis Windows (*.lnk)|*.lnk"
  $dialog.Title = "Choisis le raccourci Fortnite de ton bureau"
  if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { $selected = Get-Item -LiteralPath $dialog.FileName }
}
if (-not $selected) { Write-Host "Aucun raccourci choisi. Rien n'a été modifié."; Read-Host "Entrée pour fermer"; exit }
$shortcut = $ws.CreateShortcut($selected.FullName)
$backup = "$($selected.FullName).PotatoFN-backup"
Copy-Item -LiteralPath $selected.FullName -Destination $backup -Force
$newName = '__NEWNAME__'
$iconChoice = '__ICONCHOICE__'
$newPath = Join-Path $desktop ($newName + ".lnk")
if ((Test-Path -LiteralPath $newPath) -and ($newPath -ne $selected.FullName)) { Write-Host "Un raccourci portant déjà ce nom existe. Choisis un autre nom."; Read-Host "Entrée pour fermer"; exit }
if ($iconChoice -eq "epic") {
  $epicCandidates = @("$env:ProgramFiles(x86)\Epic Games\Launcher\Portal\Binaries\Win64\EpicGamesLauncher.exe", "$env:ProgramFiles\Epic Games\Launcher\Portal\Binaries\Win64\EpicGamesLauncher.exe")
  $epicExe = $epicCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
  if ($epicExe) { $shortcut.IconLocation = "$epicExe,0" } else { Write-Host "Epic Games Launcher introuvable : l'icône actuelle sera conservée." -ForegroundColor Yellow }
} elseif ($iconChoice -eq "windows") {
  $shortcut.IconLocation = "$env:SystemRoot\System32\shell32.dll,167"
}
$shortcut.Save()
if ($newPath -ne $selected.FullName) { Move-Item -LiteralPath $selected.FullName -Destination $newPath }
Write-Host "Raccourci mis à jour : $newPath" -ForegroundColor Green
Write-Host "Sauvegarde : $backup"
Write-Host "Actualise le bureau avec F5 si l'icône ne se rafraîchit pas."
Read-Host "Appuie sur Entrée pour fermer"
`;
    const finalScript = powershell.replace("__NEWNAME__", psName).replace("__ICONCHOICE__", iconChoice);
    saveTextFile("PotatoFN-Customiser-Raccourci.ps1", finalScript, "text/plain;charset=utf-8");
    alert("Outil téléchargé ! Lis le script avant de l’exécuter avec PowerShell. Il te fera choisir le raccourci Fortnite et créera une sauvegarde.");
  });
}
