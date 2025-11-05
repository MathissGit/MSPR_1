Sommaire

Résumé rapide

Prérequis

Installation (rapide)

Windows (PowerShell)

Linux / macOS

Installer Nmap (optionnel)

Quickstart — test de fonctionnement

Commandes d’utilisation (exemples)

Options utiles

Vérifier les rapports (validation)

Versioning minimal (procédure simple)

Automatisation simple (cron / systemd)

Upload post-run (optionnel)

.gitignore recommandé

Nettoyage des backups committés

Dépannage rapide

Checklist avant PR / livraison

Notes sécurité & bonnes pratiques


1) Résumé rapide

Emplacement : MSPR_scan/scripts/ (ou MSPR_scan/Script/ selon arborescence)

Script principal : scanner.py

Sorties : scripts/reports/report_YYYYMMDDTHHMMSSZ.json (ces fichiers doivent être ignorés par Git)

2) Prérequis

Python 3.8+

(Optionnel) Nmap binaire + python-nmap pour enrichir les résultats

Accès GitHub / droits pour créer PR via l’UI (si tu travailles via l’UI)

Recommandé : jq pour lire JSON confortablement

3) Installation (rapide)
Windows (PowerShell)
# aller dans le repo
Set-Location "C:\chemin\vers\MSPR_1\MSPR_scan"

# créer + activer venv
python -m venv .venv
.\.venv\Scripts\Activate.ps1
# si bloqué :
# Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# installer dépendances si existantes
pip install --upgrade pip
pip install -r scripts/requirements.txt

# créer dossier de rapports
New-Item -ItemType Directory -Force scripts\reports

Linux / macOS
cd /chemin/vers/MSPR_1/MSPR_scan
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r scripts/requirements.txt   # si présent
mkdir -p scripts/reports

4) Installer Nmap (optionnel, recommandé)

Debian/Ubuntu

sudo apt update
sudo apt install -y nmap
pip install python-nmap


macOS (Homebrew)

brew install nmap
pip install python-nmap


Windows

Télécharger/installer Nmap depuis https://nmap.org/download.html

Dans le venv : pip install python-nmap

Le script fonctionne sans Nmap (fallback TCP multithread). --use-nmap active l’utilisation de nmap si dispo.

5) Quickstart — test de fonctionnement

Active le venv (source .venv/bin/activate ou .\.venv\Scripts\Activate.ps1).

Lancer un scan simple :

python scripts/scanner.py --hosts 127.0.0.1


Vérifier qu’un fichier scripts/reports/report_*.json a été généré.

6) Commandes d’utilisation — exemples

Afficher l’aide :

python scripts/scanner.py --help


Scan simple :

python scripts/scanner.py --hosts 127.0.0.1


Scanner plusieurs hôtes :

python scripts/scanner.py --hosts 10.0.0.5 10.0.0.6 192.168.1.10


Scanner depuis un inventaire :

python scripts/scanner.py --inventory scripts/inventory.json


Scanner un CIDR (avec nmap si dispo) :

python scripts/scanner.py --cidr 192.168.1.0/24 --use-nmap

7) Options utiles

--hosts (nargs="+") : liste d’IP / hostnames (mutuellement exclusif avec --inventory et --cidr)

--inventory : chemin vers un JSON contenant la liste d’hôtes

--cidr : plage CIDR (ex. 192.168.1.0/24)

--use-nmap : forcer utilisation de python-nmap si disponible

--ports : liste de ports pour fallback (ex. --ports 22 80 443)

--timeout : timeout socket (secondes)

--workers : nb de threads pour fallback TCP

--wan-probe : IP pour mesurer latence WAN (ex. 8.8.8.8)

--report-name : nom du rapport (sans extension)

8) Vérifier les rapports (validation)

Lister :

ls scripts/reports


Inspecter (avec jq) :

jq '.' scripts/reports/report_*.json | less


Rechercher champs essentiels :

meta.generated_at

meta.source

meta.tool_version (si ajouté)

results (liste d’hôtes, ports, états)

Sans jq :

grep -n '"generated_at"\|"source"\|"results"' scripts/reports/*.json || true

9) Versioning minimal (procédure simple)

Ajouter __version__ dans scripts/scanner.py (en haut) :

__version__ = "0.1.0"


Inclure dans le meta du rapport :

meta = {
  "generated_at": "...",
  "source": "scanner.py",
  "tool_version": __version__,
  ...
}


Workflow (UI) : créer branche → commit → ouvrir PR → merger.

Après merge, tagger/versionner via UI Release (ex. v0.1.0) si besoin.

10) Automatisation simple
Cron (Linux) — exécution quotidienne à 02:00
0 2 * * * cd /chemin/MSPR_1/MSPR_scan && /chemin/.venv/bin/python scripts/scanner.py --inventory scripts/inventory.json >> /var/log/mspr_scan.log 2>&1

systemd (one-shot)

/etc/systemd/system/mspr-scan.service :

[Unit]
Description=MSPR scanner

[Service]
Type=oneshot
WorkingDirectory=/chemin/MSPR_1/MSPR_scan
ExecStart=/chemin/MSPR_1/MSPR_scan/.venv/bin/python scripts/scanner.py --inventory scripts/inventory.json


Activer / tester : systemctl daemon-reload puis systemctl start mspr-scan.service.

11) Upload post-run (optionnel)

Si tu dois envoyer les JSON à un endpoint (Nester) :

Bash (curl) :

curl -X POST -H "Authorization: Bearer $NESTER_TOKEN" -F "file=@scripts/reports/report_NAME.json" "$NESTER_URL"


Python (requests) :

import os, requests
NESTER_URL = os.getenv("NESTER_URL")
NESTER_TOKEN = os.getenv("NESTER_TOKEN")
with open("scripts/reports/report_NAME.json","rb") as f:
    headers = {"Authorization": f"Bearer {NESTER_TOKEN}"}
    r = requests.post(NESTER_URL, files={"file": f}, headers=headers, timeout=30)


Ne jamais stocker de token dans le repo. Utiliser variables d’environnement ou secret manager.

12) .gitignore recommandé (à ajouter via UI)

Crée .gitignore à la racine et colle :

# env & editor
.venv/
.vscode/

# rapports générés
scripts/reports/

# backups
*.bak
*.prepatch

# OS
.DS_Store
Thumbs.db

13) Nettoyage des backups committés

Si .bak ou .prepatch ont déjà été committés :

Supprimer via UI : ouvrir fichier → Delete → commit sur nouvelle branche → ouvrir PR → merge

Ou localement : git rm --cached scripts/*.bak puis commit/push et PR → merge

14) Dépannage rapide

Pas de rapport : vérifier que scripts/reports/ existe + droits d’écriture.

venv PowerShell bloqué : Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass.

nmap absent : installer binaire + pip install python-nmap. Fallback TCP ok.

Ping parsing retourne None : dépend de la locale — utiliser --wan-probe.

Fichiers .bak gênants : retirer du repo et ajouter .gitignore.

15) Checklist avant PR / livraison

 scanner.py testé localement (au moins 1 run)

 Rapport JSON valide présent dans scripts/reports/

 meta.tool_version présent (si ajouté)

 .gitignore mis en place et mergé

 Backups (*.bak, *.prepatch) retirés du repo

 RUNBOOK.md ajouté & mergé

 (Optionnel) Release/tag v0.1.0 créé

16) Notes sécurité & bonnes pratiques

Scanner uniquement des cibles autorisées.

Ne pas committer de secrets ou tokens.

Préférer PRs + reviews pour changements critiques.

Utiliser variables d’environnement pour les configurations locales.
