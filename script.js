const downloadButton = document.getElementById("download");

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
    "COMMENT APPLIQUER TES RÉGLAGES",
    "1. Ouvre Fortnite.",
    "2. Va dans Paramètres > Vidéo.",
    "3. Choisis le mode graphique et la limite FPS indiqués ci-dessus.",
    "4. Ajuste la résolution dans les options disponibles de ton écran et du jeu.",
    "5. Clique sur Appliquer.",
    "",
    "IMPORTANT : ce fichier est un aide-mémoire. Il ne modifie pas automatiquement Fortnite ou Windows.",
    "Les performances réelles dépendent de ton PC, de ton écran et des paramètres du jeu."
  ].join("\n");

  const file = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = "PotatoFN-preset.txt";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  const original = downloadButton.innerHTML;
  downloadButton.innerHTML = "Preset téléchargé ✓";
  window.setTimeout(() => { downloadButton.innerHTML = original; }, 2200);
});