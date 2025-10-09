# MSPR_scan — Scanner réseau (ton travail)

Structure:
- scripts/scanner.py : script unifié (discovery + fallback TCP)
- scripts/inventory.json : hôtes de test
- scripts/requirements.txt : dépendances optionnelles
- scripts/reports/ : rapports JSON générés (ignoré par git)

Usage rapide:
cd scripts
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt   # optionnel ; fallback TCP fonctionne sans nmap
python scanner.py --inventory inventory.json
