# QA — STORY-19 : Navigation "Book par tireur" par équipe puis joueur

## Méthode
Test en navigateur réel (Playwright) contre le backend de production. Complète les vérifications déjà faites par le Developer (3 chemins de retour, non-régression `equipeCourante`) par des cas non encore couverts : visibilité du lien recherche sur petit viewport, cycle complet de création d'un tireur libre via la recherche, non-régression du CRUD Paramètres.

## Critères validés ✅
- ✅ Accueil → "Book par tireur" affiche la liste des équipes (pas la recherche).
- ✅ **Visibilité du lien "🔍 Rechercher un tireur" (risque P1-#1)** : sur un viewport 375×667 (mobile réel standard), le lien est visible **sans aucun scroll**, avec en plus les 3 récents et les 2 équipes tenant entièrement dans le viewport — large marge par rapport au critère minimal.
- ✅ Tap sur une équipe → roster correct (vérifié BILLERE : 10 joueurs, mêmes noms qu'en Paramètres).
- ✅ Tap sur un joueur → Book direct, header avec bon nom.
- ✅ Équipe sans joueur (FENIX) → état vide "Aucun joueur dans cette équipe".
- ✅ **Cycle complet de création d'un tireur libre** : recherche "QA-STORY19" (inexistant) → "+ Créer" → formulaire → "Créer et commencer" → Book vide affiché → bouton "Retour" de l'état vide ramène bien sur la recherche (pas sur Book — Équipes) → tireur confirmé en base avec `equipe_id: null` (vérifié par requête API directe) → supprimé après vérification.
- ✅ Édition (✏️) et suppression (🗑) restent présentes et inchangées sur l'écran de recherche.
- ✅ CRUD Paramètres → Équipes → Joueurs non affecté : navigation testée (FENIX → Joueurs, recherche/+Nouveau joueur présents, comportement CRUD intact).
- ✅ 0 erreur console sur l'ensemble de la session (hors 404 favicon, sans rapport).

## Cas limites testés
- Viewport mobile réel (375×667), pas seulement une largeur desktop.
- Création d'un tireur **sans** équipe (chemin le moins direct, celui que la recherche doit continuer à couvrir).
- Équipe sans aucun joueur.

## Bugs trouvés
Aucun.

## Régressions détectées
Aucune. Un tireur de test créé pendant la vérification (`QA-STORY19`) supprimé après coup.

## Verdict
**PASSED**
