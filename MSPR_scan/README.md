# MSPR — `scanner.py`

**Fichier principal :** `scripts/scanner.py`
**Objectif :** outil unifié de découverte & scan réseau. Utilise `nmap` via `python-nmap` si disponible (détection services/OS). Sinon, bascule en **fallback TCP** (sockets multithreadées). Génère des **rapports JSON** prêts à l’ingestion (`scripts/reports/`).

---

## Sommaire

1. [Aperçu](#aperçu)
2. [Prérequis](#prérequis)
3. [Installation](#installation)

   * [Windows (PowerShell)](#windows-powershell)
   * [Linux (Debian/Ubuntu)](#linux-debianubuntu)

4. [Installer Nmap & `python-nmap` (optionnel, recommandé)](#installer-nmap--python-nmap-optionnel-recommandé)
5. [Installer les dépendances Python](#installer-les-dépendances-python)
6. [Utilisation : commandes exemples](#utilisation--commandes-exemples)
7. [Structure du projet](#structure-du-projet)
8. [Format du rapport JSON (extrait)](#format-du-rapport-json-extrait)
9. [Paramètres CLI importants](#paramètres-cli-importants)
10. [Adapter à une autre machine](#adapter-à-une-autre-machine)
11. [Exemple `config.example.yaml` (optionnel)](#exemple-configexampleyaml-optionnel)
12. [Dépannage rapide](#dépannage-rapide)
13. [Résumé des commandes utiles](#résumé-des-commandes-utiles)

---

## Aperçu

Le script permet de :

* Scanner **une ou plusieurs IPs** (`--hosts`).
* Charger un **inventaire** (`--inventory`).
* Scanner un **CIDR** (`--cidr`) avec découverte `nmap` si dispo.
* Mesurer une **latence WAN de référence** (`--wan-probe`).
* Produire un **rapport JSON** contenant `meta`, `results`, `summary`.

## Prérequis

* **Python 3.8+**
* (Optionnel, recommandé) **Nmap** + paquet **`python-nmap`**.

---

## Installation

### Windows (PowerShell)

```powershell
cd C:\chemin\vers\repo
python -m venv .venv
.\.venv\Scripts\Activate.ps1
# Si bloqué :
# Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
pip install --upgrade pip
pip install -r scripts/requirements.txt
```

### Linux (Debian/Ubuntu)

```bash
cd ~/chemin/vers/repo
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r scripts/requirements.txt
```

## Installer Nmap & `python-nmap` (optionnel, recommandé)

### Debian/Ubuntu

```bash
sudo apt update
sudo apt install -y nmap
pip install python-nmap
```

### CentOS/RHEL

```bash
sudo yum install -y nmap
pip install python-nmap
```

### Windows

1. Télécharger l’installeur depuis le site officiel de Nmap et installer.
2. Dans le venv :

```powershell
pip install python-nmap
```

> Le script fonctionne **sans** Nmap (fallback TCP). L’option `--use-nmap` offre cependant des résultats plus riches.

---

## Installer les dépendances Python

Depuis la racine du repo (venv activé) :

```bash
pip install -r scripts/requirements.txt
```

Exemple minimal de `scripts/requirements.txt` :

```ini
python-nmap==0.7.1
```

---

## Utilisation — commandes exemples

Afficher l’aide :

```bash
python scripts/scanner.py --help
```

Scanner une IP (fallback TCP) :

```bash
python scripts/scanner.py --hosts 127.0.0.1
```

Scanner plusieurs IPs :

```bash
python scripts/scanner.py --hosts 10.0.0.5 10.0.0.6 192.168.1.10
```

Scanner depuis un inventaire JSON :

```bash
python scripts/scanner.py --inventory scripts/inventory.json
```

Scanner un CIDR (avec découverte nmap si dispo) :

```bash
python scripts/scanner.py --cidr 192.168.1.0/24 --use-nmap
```

Options avancées :

```bash
python scripts/scanner.py --hosts 10.0.0.5 \
  --ports 22 80 443 \
  --timeout 1.5 \
  --workers 50 \
  --wan-probe 1.1.1.1 \
  --report-name myreport
```

---

## Structure du projet

```
repo-root/
  scripts/
    scanner.py
    inventory.json
    requirements.txt
    reports/               # sorties (ignoré par .gitignore)
      report_YYYYMMDDTHHMMSSZ.json
  .gitignore
  README.md
```

**`.gitignore` recommandé :**

```gitignore
.venv/
scripts/reports/
*.bak
*.prepatch
```

---

## Format du rapport JSON (extrait)

```json
{
  "meta": {
    "generated_at": "2025-10-09T12:11:32Z",
    "source": "scanner.py",
    "wan_probe": "8.8.8.8",
    "wan_avg_rtt_ms": 153.0
  },
  "results": [
    {
      "host": "127.0.0.1",
      "host_id": "uuid",
      "hostname": "localhost",
      "checked_at": "2025-10-09T12:11:33Z",
      "ports": [
        { "port": 445, "state": "open", "product": null, "version": null }
      ],
      "status": "up",
      "open_ports_count": 1,
      "scan_summary": "1 open / 8 scanned (tcp fallback)",
      "avg_rtt_ms": 0.0,
      "os": null,
      "service_versions": []
    }
  ],
  "summary": {
    "hosts_scanned": 1,
    "hosts_up_guess": 1
  }
}
```

---

## Paramètres CLI importants

* `--hosts` *(nargs="+")* : liste d’IP/hostnames (**mutuellement exclusif** avec `--inventory` et `--cidr`).
* `--inventory` : chemin vers un JSON (liste ou `{ "hosts": [...] }`).
* `--cidr` : plage CIDR (ex. `192.168.1.0/24`).
* `--use-nmap` : active `python-nmap` si disponible.
* `--ports` : liste de ports pour le fallback (ex. `--ports 22 80 443`).
* `--timeout` : timeout socket (secondes).
* `--workers` : nombre de threads pour le fallback.
* `--wan-probe` : IP pour mesurer la latence WAN (ex. `8.8.8.8`).
* `--report-name` : nom du fichier de rapport (sans extension).

---

## Adapter à une autre machine

* **Cibles :** ne modifiez pas le code pour changer les IPs ; utilisez `--hosts`/`--inventory`/`--cidr`.
* **Ports par défaut :** ajuster `DEFAULT_PORTS` dans `scanner.py` si besoin.
* **Emplacement des rapports :** ajuster `REPORTS_DIR` dans `scanner.py`.
* **WAN probe :** choisir une IP accessible via `--wan-probe`.
* **Conseil :** créer `scripts/config.local.yaml` (ignoré par Git) pour vos paramètres locaux.

---

## Exemple `config.example.yaml` (optionnel)

```yaml
ports: [22, 80, 443, 8080]
timeout: 1.0
workers: 50
wan_probe: 8.8.8.8
reports_dir: scripts/reports
```

> Copiez ce fichier en `config.local.yaml` et adaptez-le. Ajoutez `config.local.yaml` au `.gitignore`.

---

## Dépannage rapide

* PowerShell bloque l’activation du venv → `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`
* `nmap` absent → installer le binaire + `pip install python-nmap`
* `avg_ping_ms()` retourne `None` → parsing dépend de la locale ; utilisez `--wan-probe` ou adaptez le parsing
* Rapports non écrits → vérifier `REPORTS_DIR` et permissions (`mkdir -p scripts/reports && chmod u+rwx scripts/reports`)
* Scan CIDR lent → utiliser `--use-nmap` ou réduire la plage

---

## Résumé des commandes utiles

```bash
# Cloner
git clone https://github.com/MathissGit/MSPR_1.git
cd MSPR_1

# venv + install
ython3 -m venv .venv
source .venv/bin/activate   # Windows: .\.venv\Scripts\Activate.ps1
pip install -r scripts/requirements.txt

# Run simple
python scripts/scanner.py --hosts 127.0.0.1

# Push une branche
git checkout -b feat/tweak-scanner
git add scripts/scanner.py
git commit -m "feat: tweak scanner"
git push -u origin feat/tweak-scanner
```

