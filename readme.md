# MSPR 1 | Développement et sécurité informatique 

## Sommaire 

- Description
- Les objectifs 
- Stack technique 
- Interface 
- Transfert de fichiers entre les 
- Liste des taches 
- Ressources
- ISO des VMs
- Collaborateurs

## Description

Seahawks Monitoring a pour objectif de standardiser la remontée d’informations essentielles depuis chaque franchise et de fournir au support une vue d’ensemble fiable. L’objectif métier est de réduire les interventions sur site, d’accélérer les diagnostics de niveau 1/2 et d’améliorer l’expérience des équipes locales en limitant les interruptions et les échanges itératifs.

**Le serveur Harvester:**

Il collecte les informations sur le réseau grâce à un script automatisé. Il sort un fichier JSON contenant les informations et peut les afficher dans un dashboard. A chaque modification des informations en comparaison avec le dernier scan, il envoie le fichier JSON au serveur Nester.

**Le serveur Nester:**

Il récupère les fichier JSON de chaques franchises et les affiches dans un dashboard autohebergé.

## Les objectifs 
- Standardiser la collecte d'infos 
- Outiller un support de consultation central 
- Faire remonter les informations d'une frnachise sur un support de consultation
- Accélérer les diagnostics

## Stack technique 
- Linux : Debian 13
- Hebergement : Nginx / PM2 
- Scripting : Python avec python-nmap
- Dashboard : HTML / CSS / Javascript / Node.js

## Scripts Python 
Nous souhaitons scanner un reseaux local afin de mettre en evidence les port open/closed, os et versions, ip des hotes, hostname etc... 

Pour ce faire, nous utilisons la bibliotheque python-nmap et ajoutons les arguments souhaité à notre requete. 

[Documentation de python3-nmap](https://pypi.org/project/python3-nmap/)

## Données des franchises en JSON
Aprés avoir scanner notre machine en utilisant notre script python, nous recupérons un fichier JSON contenant toutes les informations que nous voulions. 

Exemple de sortie en JSON : 

```json
{
  "meta": {
    "generated_at": "2025-10-09T12:11:32.377735+00:00",
    "source": "scanner.py",
    "wan_probe": "8.8.8.8",
    "wan_avg_rtt_ms": 153.0
  },
  "results": [
    {
      "host": "127.0.0.1",
      "host_id": "54600cd2-1700-49c5-a6c9-93abb7537b2b",
      "hostname": "vvs",
      "checked_at": "2025-10-09T12:11:32.389135+00:00",
      "ports": [
        {
          "port": 445,
          "state": "open"
        },
        {
          "port": 443,
          "state": "closed"
        },
        {
          "port": 22,
          "state": "closed"
        },
        {
          "port": 80,
          "state": "closed"
        },
      ],
      "status": "up",
      "open_ports_count": 1,
      "scan_summary": "1 open / 8 scanned (tcp fallback)",
      "avg_rtt_ms": 0.0,
      "os": "Debian",
      "service_versions": []
    }
  ],
  "summary": {
    "hosts_scanned": 1,
    "hosts_up_guess": 1
  }
}
```

## Interfaces 
Nous avons choisi de développer une interface sous forme de dashboard affichant un tableau pour les différentes franchises présentes dans les fichiers JSON. Pour la partie visuelle nous utilisons du HTML / CSS, et pour la partie logique du JavaScript qui cherche dans le dossier data les fichiers JSON stocké. 

## Transfert de fichiers entre les VMs
Nous utilisons "SCP" afin de pouvoir envoyer des fichiers de manière chiffrée en utilisant "SSH". 

Exemple de commande :
``` bash
scp <fichier> -p <port> <utilisateur>@<ip_distante>:<chemin_où_envoyer> 
```
## Compétance évalués
- Concevoir et maintenir des scripts d’acquisition et de persistance des données. 
- Exploiter des données collectées     
- Concevoir et déployer une plateforme centralisée de consultation des données     
- Établir une communication sécurisée au sein d'un réseau local      
- Assurer la continuité d’un service en mode déconnecté      
- Sécuriser les échanges entre sites      
- Appliquer les fondamentaux de la cybersécurité en environnements systèmes & réseaux      
- Mettre en place une journalisation et une observabilité efficaces      
- Communiquer et défendre une proposition technique en contexte client     


## Liste des taches
- [ ] <https://github.com/MathissGit/MathissGit/issues/1>
- [ ] <https://github.com/MathissGit/MathissGit/issues/2>
- [ ] <https://github.com/MathissGit/MathissGit/issues/3>
- [ ] <https://github.com/MathissGit/MathissGit/issues/4>
- [ ] <https://github.com/MathissGit/MathissGit/issues/5>
- [ ] <https://github.com/MathissGit/MathissGit/issues/6>
- [ ] <https://github.com/MathissGit/MathissGit/issues/7>
- [ ] <https://github.com/MathissGit/MathissGit/issues/8>

## Ressources 

- [Cahier des charges](/2025-2026%20CYBERXP%20-%20Sujet%20MSPR%20TPRE552.pdf)
- [Gestion de projet](https://github.com/users/MathissGit/projects/7)
- support soutenance (in progress)

## ISO des VMs

- Machine "Franshise" : Seahawks Harvester (in progress)
- Machine "Datacentre" : Seahawks Nester [Download here](https://drive.google.com/file/d/1QMZidRIt5Z55dETzKwprDj5BBaYkiuaF/view?usp=sharing)

## Collaborateurs 

- [MathissGit](https://github.com/MathissGit)
- [ababacar41](https://github.com/ababacar41)
- [Vingt5](https://github.com/Vingt5)
