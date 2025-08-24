const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 8080;

const statsDir = "C:/Users/fouge/AppData/Roaming/ModrinthApp/profiles/HC - 1.21.8/saves/test/stats";

function getStats() {
  const files = fs.readdirSync(statsDir).filter((f) => f.endsWith(".json"));
  const statsFile = path.join(statsDir, files[0]);
  const raw = fs.readFileSync(statsFile, "utf8");
  const data = JSON.parse(raw).stats;

  const mined = data["minecraft:mined"] || {};
  const used = data["minecraft:used"] || {};

  const totalMined = Object.values(mined).reduce((a, b) => a + b, 0);
  const totalUsed = Object.values(used).reduce((a, b) => a + b, 0);

  return { totalMined, totalUsed };
}

app.get("/stats", (req, res) => {
  try {
    const { totalMined, totalUsed } = getStats();
    res.set("Cache-Control", "no-store");
    res.json({ blocs_casses: totalMined, blocs_poses: totalUsed });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/overlay", (req, res) => {
  res.send(`<!doctype html><meta charset="utf-8">
<h1 id="mined"></h1>
<h1 id="used"></h1>
<script>
  async function refresh(){
    try{
      const r = await fetch('/stats');
      const j = await r.json();
      document.getElementById('mined').textContent = j.blocs_casses ?? 0;
      document.getElementById('used').textContent  = j.blocs_poses  ?? 0;
    }catch(e){}
  }
  refresh();
  setInterval(refresh, 2000);
</script>`);
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
