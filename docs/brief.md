# Brief — Book Impact Gardien

## 1. Contexte
Le club dispose déjà, via **CF Fenix Stat** (match-statcf), d'un système de zones terrain/cage éprouvé (11 zones terrain en géométrie handball réelle, 9 zones cage) et d'une identité visuelle sombre cohérente. Un gardien de but qui visionne une vidéo de match (Dartfish ou autre) n'a aujourd'hui aucun moyen structuré de capturer, tir après tir, comment un tireur adverse donné tire — il regarde, éventuellement il note à la main, mais rien n'est réutilisable d'un match à l'autre ni consultable avant une prochaine rencontre. On construit maintenant l'outil dédié à ce besoin, en réutilisant tel quel ce qui existe déjà (zones SVG, identité visuelle) plutôt que de repartir de zéro.

## 2. Problème
Sans outil dédié, un gardien ne peut pas se construire une mémoire fiable et exploitable des habitudes de tir d'un tireur adverse précis à travers plusieurs matchs visionnés. Il ne peut pas répondre, avant un match, à des questions simples comme : *"ce tireur, quand il attaque depuis l'aile gauche, vise plutôt où dans la cage ? de quelle main ? est-ce que je l'arrête souvent ?"* — parce que rien de ce qu'il observe pendant le visionnage n'est capturé de façon structurée et cumulable.

## 3. Utilisateurs
- **Qui** : le gardien de but du club (plusieurs gardiens, chacun avec son usage), en autonomie.
- **Contexte d'usage** : assis devant un écran (laptop/tablette), en train de visionner une vidéo de match sur un lecteur externe (Dartfish ou équivalent) — l'app n'est **pas** le lecteur vidéo, elle tourne à côté, en parallèle.
- **Contrainte de temps** : chaque impact doit être saisi en 2-3 taps, sans interrompre la lecture vidéo plus que quelques secondes. C'est un usage répété des dizaines de fois par match visionné — la moindre friction se paie à chaque tir.
- **Fréquence** : usage récurrent (à chaque match analysé), pas exceptionnel.
- **Niveau technique** : aucune formation attendue, l'interface doit être auto-explicite dès le premier usage.

## 4. Vision
Donner à chaque gardien du club un **book numérique par tireur adverse**, alimenté en quelques taps pendant le visionnage vidéo, consultable en quelques secondes avant un futur match pour anticiper où et comment un tireur donné va tirer.

## 5. Scope

### Dedans (MVP)
- Sélection du gardien actif, mémorisée localement (pas de re-sélection à chaque session)
- Sélection d'un tireur adverse par recherche, ou création rapide si nouveau
- Écran de saisie d'impact en boucle : zone de tir (11 zones, SVG terrain réutilisé tel quel), zone de cage (9 zones, grille réutilisée telle quelle), résultat, type de tir, main — enregistrement immédiat en base à chaque impact, retour instantané à un écran prêt pour le suivant
- Book tireur : croisement zone de tir × zone de cage, stats simples (main dominante, poste favori, taux d'arrêt, nombre de tirs), historique chronologique des impacts

### Dehors (V2, explicitement reporté)
- Heatmap fine (au-delà du croisement 11×9 zones discret)
- Comparaison entre plusieurs tireurs
- Filtres par match/contexte dans le Book
- Export (PDF, CSV...)
- Authentification complexe (le MVP se limite à une sélection de gardien, pas de mot de passe)

## 6. Critères de succès
- Un gardien peut enregistrer un impact en 2-3 taps, sans avoir à lire ou remplir un formulaire.
- Aucune perte de données : chaque impact est écrit en base immédiatement (pas de brouillon local qui pourrait se perdre si l'onglet se ferme).
- Pour un tireur avec un historique suffisant (~10 tirs), le Book répond visuellement, en un coup d'œil, à "où vise-t-il, avec quelle main, et est-ce que je l'arrête bien face à lui".
- Le découpage des zones (terrain et cage) et l'identité visuelle sont identiques à ceux déjà connus du gardien dans CF Fenix Stat — pas de nouvel apprentissage.

## 7. Questions en suspens
1. **Erreur de saisie** : pendant un visionnage rapide, un mis-tap est probable (mauvaise zone, mauvais résultat). Faut-il permettre d'annuler/corriger le **dernier** impact enregistré directement depuis l'écran de saisie ? — Recommandation Analyst : oui, c'est nécessaire à l'usage réel décrit (2-3 taps, en parallèle vidéo, pas de temps pour un formulaire d'édition complet), mais **limité au dernier impact** pour rester dans l'esprit MVP. À trancher par le PM.
2. **Portée du Book** : le Book d'un tireur agrège-t-il les impacts de **tous** les gardiens du club qui l'ont visionné (book de scouting mutualisé — cohérent avec l'idée de "book par tireur adverse"), ou est-il strictement privé au gardien qui l'a saisi ? Les deux stats "où/comment il tire" (indépendantes du gardien) et "taux d'arrêt face à lui" (dépendante du gardien) n'ont pas forcément la même portée. Recommandation Analyst : agrégation club-wide pour la tendance de tir, filtrage par gardien actif pour le taux d'arrêt — à confirmer par le PM.
3. **Contexte du match** : champ libre texte suffisant pour le MVP (ex. "Fenix vs X - 12/09"), ou faut-il un sélecteur lié à une liste de matchs existante (éventuellement partagée avec CF Fenix Stat) ? Recommandation Analyst : champ libre pour le MVP, pas de dépendance inter-projets.
4. **Référentiel poste tireur** : la liste `ailier_d, ailier_g, arriere_d, arriere_g, demi_centre, pivot` doit être confirmée comme le référentiel club (cohérence avec les autres outils Fenix).
5. Le projet est neuf (pas de `CLAUDE.md` existant) — l'Architect devra poser la structure de fichiers dès le départ, il n'y a pas d'existant à respecter au-delà des composants `fenix-terrain-zones-export`.

## Composants existants à réutiliser tels quels
Le dossier `fenix-terrain-zones-export/` (déjà inspecté) fournit :
- `terrain-zones.js` — 11 zones terrain (SVG viewBox 350×208, géométrie handball réelle), fonctions pures (`shotZoneCourt`, `buildCourtZones`, `renderCourtZones`, `aggregateCourtZones`)
- `goal-cage-zones.js` — 9 zones cage (grille CSS 3×3, pas de SVG), `renderGoalZoneGrid()` pour la saisie, `goalZoneHeatmap()` pour les stats
- `zones.css` — tokens couleur (navy `#0F1923`, panel `#131f2b`, accent sky `#5FA8D3`, vert succès, bleu) et classes associées

Ces fichiers sont conçus pour être autonomes et réutilisables sans dépendance à l'état global de leur app d'origine — seul le branchement des clics (`[data-gz]`, clic sur polygone SVG) doit être reconnecté au modèle de données de ce projet.
