# PRD — Book Impact Gardien

## 1. Objectif
Livrer un MVP permettant à un gardien de but d'enregistrer, en 2-3 taps pendant le visionnage d'une vidéo de match, l'impact de chaque tir adverse subi, et de consulter ensuite un book par tireur (croisement zone de tir × zone de cage, stats, historique).

## 2. Décisions sur les questions en suspens (Analyst → PM)
1. **Annulation du dernier impact** : intégrée au MVP (Must Have). Sans ça, une erreur de tap pendant un visionnage rapide corrompt silencieusement les stats — c'est un risque trop direct sur la valeur du produit pour être reporté en V2.
2. **Portée du Book** : agrégation **club-wide** pour tout ce qui décrit le tireur (zone de tir, zone de cage, main, poste, historique) — c'est un book de scouting, la valeur vient du cumul entre gardiens. Le **taux d'arrêt** affiché est filtré sur le gardien actuellement sélectionné (c'est une donnée qui dépend de qui est dans les cages). Table `impacts` garde `gardien_id` sur chaque ligne pour permettre ce filtrage a posteriori.
3. **Contexte match** : champ texte libre pour le MVP, pas de liste/sélecteur, pas de dépendance à un autre outil.
4. **Référentiel poste** : `ailier_d, ailier_g, arriere_d, arriere_g, demi_centre, pivot` confirmé, utilisé tel quel comme liste fixe.

## 3. Features

### F1 — Sélection gardien
Écran d'accueil listant les gardiens existants (table `gardiens`). Sélection en un tap → mémorisée en `localStorage` → les lancements suivants sautent directement à l'écran de sélection tireur. Un lien discret permet de changer de gardien.

### F2 — Sélection / création tireur
Recherche texte instantanée (nom, club) sur les tireurs existants (table `tireurs`). Sélection en un tap → écran de saisie d'impact. Si le tireur n'existe pas : formulaire minimal de création rapide (nom obligatoire, club/poste/latéralité optionnels, complétables plus tard) → création puis enchaînement direct sur l'écran de saisie.

### F3 — Saisie impact (écran central, boucle principale)
1. Tap sur le SVG terrain (11 zones, `terrain-zones.js`) → zone de tir choisie.
2. Tap sur la grille cage (9 zones, `goal-cage-zones.js`) → zone de cage choisie **et** enregistrement immédiat de l'impact en base (le 2e tap déclenche l'écriture — pas de bouton "Valider" séparé, sauf pour résultat/type/main qui doivent être choisis avant ou après selon l'ordre défini par le Designer).
3. Sélection du résultat (but / arrêt / poteau / hors cadre) via boutons visibles en permanence.
4. Sélecteurs rapides type de tir (jet, appui, suspension, extension, penalty) et main (D/G) — pré-sélection sur le dernier choix utilisé pour ce tireur (réduit le nombre de taps sur les tirs répétitifs).
5. Bandeau "Dernier impact enregistré" avec bouton **Annuler** (supprime le dernier impact de ce gardien sur ce tireur) — visible juste après chaque enregistrement, le temps de vérifier.
6. Retour automatique à l'écran prêt pour l'impact suivant, sans navigation.

### F4 — Book tireur
- **Croisement zone de tir × zone de cage** : grille 11×9 (ou vue synthétique équivalente) montrant, pour chaque combinaison ayant des données, le ratio but/tir — réutilise l'esprit `renderCourtZones` + `goalZoneHeatmap` de l'export.
- **Stats** : main dominante (%), poste favori (le plus fréquent), taux d'arrêt du gardien actif face à ce tireur (arrêts / tirs cadrés), nombre total de tirs enregistrés.
- **Historique chronologique** : liste des impacts (date, contexte match, zone tir, zone cage, résultat), la plus récente en haut.

## 4. Priorités

| Feature | Priorité |
|---|---|
| F1 — Sélection gardien | Must Have |
| F2 — Sélection/création tireur | Must Have |
| F3 — Saisie impact (incl. annulation dernier impact) | Must Have |
| F4 — Book tireur (croisement + stats + historique) | Must Have |
| Pré-sélection du dernier type/main utilisé pour un tireur | Should Have |
| Édition d'un tireur existant (club/poste/latéralité après coup) | Should Have |
| Heatmap fine, comparaison tireurs, filtres match, export | Hors scope (V2) |

## 5. Critères d'acceptation (niveau produit)
- Depuis l'écran de saisie déjà en place pour un tireur donné, enregistrer un impact ne demande pas plus de 2 taps sur les zones + 1 tap sur le résultat (le type/main peuvent être laissés à leur valeur pré-sélectionnée).
- Un impact enregistré est immédiatement visible dans le Book du tireur correspondant, sans rafraîchissement manuel nécessaire au retour sur cet écran.
- Le gardien sélectionné reste actif après fermeture/réouverture de l'app (persistance `localStorage`).
- Annuler le dernier impact le supprime réellement de la base (pas juste de l'affichage) et met à jour les stats du Book en conséquence.
- Le découpage de zones (11 terrain / 9 cage), les codes de zone, et la palette visuelle sont strictement identiques à ceux de `fenix-terrain-zones-export`.

## 6. Hors scope (explicite)
- Authentification par mot de passe / rôles (juste une sélection de gardien)
- Heatmap continue / plus fine que le croisement 11×9 zones
- Comparaison de plusieurs tireurs côte à côte
- Filtres par match/contexte dans le Book
- Export (PDF, CSV, partage)
- Édition/suppression d'un impact autre que le tout dernier enregistré
- Mode offline / PWA installable

## 7. Dépendances
- Instance Supabase provisionnée (tables `gardiens`, `tireurs`, `impacts`) avant tout développement écran.
- Fichiers `fenix-terrain-zones-export/` copiés dans le repo du projet (déjà fait).
- Repo GitHub créé pour le déploiement GitHub Pages.

## 8. Risques (identifiés à ce stade, détaillés par le Risk Analyst après l'Architecture)
- Saisie rapide en environnement réel (fatigue, clics imprécis sur mobile/tablette) → zones cliquables trop petites = mauvaise donnée silencieuse.
- Absence d'auth réelle sur Supabase → toute personne avec l'URL peut lire/écrire les books de tous les gardiens (à examiner selon le mode de distribution de l'app).
- Ambiguïté du moment exact où l'impact est écrit en base (au 2e tap vs. après confirmation résultat) — doit être tranché sans ambiguïté par le Designer/Architect pour ne pas créer d'impacts incomplets.
