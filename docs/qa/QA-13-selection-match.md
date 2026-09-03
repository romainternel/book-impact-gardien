# QA — STORY-13 : Écran Sélection Match

## Critères validés ✅
- ✅ Liste des matchs existants avec journée/saison/deux équipes affichées, bouton "Lancer" par ligne.
- ✅ État vide : message + lien direct vers Paramètres/Matchs.
- ✅ Au clic "Lancer", `state.matchCourant` contient toutes les données nécessaires (id, saison, journée, les deux équipes avec leurs joueurs déjà résolus) — vérifié avec des données réelles.
- ✅ Accessible depuis la carte "⚽ Saisir un match" de l'écran Accueil (route déjà câblée en STORY-09).

## Cas limites testés
- État erreur réseau simulé sur le chargement de la liste.
- Équipe sans aucun joueur (`joueursB: []`) : ne bloque pas, `state.matchCourant` reste correctement formé avec un tableau vide.

## Bugs trouvés
Aucun.

## Verdict
**PASSED**
