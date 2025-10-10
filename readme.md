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

## Interfaces 
Nous avons choisi de développer une interface sous forme de dashboard affichant un tableau pour les différentes franchises présentes dans les fichiers JSON. Pour la partie visuelle nous utilisons du HTML / CSS, et pour la partie logique du JavaScript qui cherche dans le dossier data les fichiers JSON stocké. 

## Transfert de fichiers entre les VMs
Nous utilisons "SCP" afin de pouvoir envoyer des fichiers de manière chiffrée en utilisant "SSH". 

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
- Machine "Datacentre" : Seahawks Nester (in progress)

## Collaborateurs 

- [MathissGit](https://github.com/MathissGit)
- [ababacar41](https://github.com/ababacar41)
- [Vingt5](https://github.com/Vingt5)
