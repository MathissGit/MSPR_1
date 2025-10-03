const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const DATA_DIR = path.join(__dirname, 'data/json');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Servir fichiers statiques frontend
app.use(express.static(PUBLIC_DIR));

// API pour lister fichiers JSON dans /data/json
app.get('/api/json-files', (req, res) => {
  fs.readdir(DATA_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: 'Erreur lecture dossier' });

    const jsonFiles = files.filter(f => f.endsWith('.json'));

    const filesInfo = jsonFiles.map(file => {
      const stats = fs.statSync(path.join(DATA_DIR, file));
      return {
        name: file,
        lastModified: stats.mtime.toISOString()
      };
    });

    res.json(filesInfo);
  });
});

// API pour récupérer contenu d’un fichier JSON
app.get('/api/json-files/:filename', (req, res) => {
  const filename = req.params.filename;
  if (!filename.endsWith('.json')) return res.status(400).json({ error: 'Fichier non JSON' });

  const filepath = path.join(DATA_DIR, filename);
  fs.readFile(filepath, 'utf8', (err, data) => {
    if (err) return res.status(404).json({ error: 'Fichier non trouvé' });

    try {
      const json = JSON.parse(data);
      res.json(json);
    } catch (e) {
      res.status(500).json({ error: 'JSON invalide' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
