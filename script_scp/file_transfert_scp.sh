#!/bin/bash

UTILISATEUR="adminNester"
HOTE_DISTANT="10.251.131.197"
CHEMIN_LOCAL=".............." # chemin et nom de mon fichier à envoyer 
CHEMIN_DISTANT="/var/www/dashboard/data/json/"

scp -P 22334 $CHEMIN_LOCAL $UTILISATEUR@$HOTE_DISTANT:$CHEMIN_DISTANT