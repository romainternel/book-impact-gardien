# Brief — Mode Match (équipes, joueurs, saisie match complet)

## 1. Contexte
Le MVP livré ("Book Impact Gardien") permet à un gardien de suivre, tireur par tireur, les tirs qu'il subit — mais les tireurs sont créés librement, sans notion d'équipe ni de match structuré. L'utilisateur veut maintenant pouvoir organiser ses données autour d'une vraie structure de club : des équipes, des joueurs rattachés à ces équipes, et des matchs identifiés par saison/journée. Il veut aussi un mode de saisie pensé pour suivre un **match complet** (les deux équipes, tous les tireurs), pas seulement les tirs subis par le gardien.

## 2. Besoin réel vs solution proposée
- **Solution proposée par l'utilisateur** : "un mode paramètres" (équipes/joueurs/matchs) + "un mode saisie" (terrain + but + boutons But/Tir raté + boutons joueurs).
- **Besoin réel sous-jacent** : structurer les données autour du vrai calendrier du club (qui joue qui, à quelle journée) et pouvoir taguer un match dans son ensemble, avec des joueurs identifiés une fois pour toutes par équipe — plutôt que de retaper un nom de tireur à chaque fois. C'est un besoin de **structuration et de réutilisation des référentiels** (équipes/joueurs) plus qu'un besoin de nouvelles zones de saisie.

## 3. Utilisateurs
Même utilisateur principal que le MVP (le gardien), mais ce mode de saisie "match complet" élargit potentiellement l'usage à un usage plus proche de celui d'un **coach/statisticien de club** qui documente un match entier (les deux équipes), pas seulement à un gardien qui scoute ses adversaires. Contexte d'usage identique (visionnage vidéo en parallèle, saisie rapide).

## 4. Vision
Donner au club une base structurée (équipes → joueurs) réutilisable d'un match à l'autre, et un mode de saisie pensé pour documenter un match complet plutôt qu'un tireur isolé — tout en préservant la valeur déjà livrée du Book par tireur.

## 5. Décisions structurantes (tranchées par l'utilisateur)

**Q1 — Relation entre le mode Match et le mode "Book par tireur" existant : Enrichir l'existant.**
Un "tireur" peut optionnellement être rattaché à un "joueur" d'équipe ; les impacts saisis en mode Match alimentent aussi le Book déjà construit (stats/heatmaps). Rien de l'existant n'est cassé. Aucune donnée réelle en base actuellement (seul un gardien de test existait, supprimé) — pas de migration à gérer, la base de départ est propre.

**Q2 — Périmètre de la saisie en mode Match : les deux équipes.**
Le mode Match est un outil de stats de match complet — les tirs des deux équipes sont tagués, avec sélection du joueur dans l'équipe concernée à chaque tir.

**Clarification conceptuelle importante (utilisateur) :** l'entité `gardien` de l'app (table `gardiens`, sélectionnée à l'écran 1) représente **l'observateur/analyste qui utilise l'app** — pas un joueur du match étudié. Ce n'est donc **pas la même chose** que le gardien de but qui défend les cages dans le match (qui est lui un `joueur` d'équipe, poste "gardien de but", au même titre qu'un ailier ou un arrière). Cette distinction doit être respectée dans le modèle de données du mode Match : le champ `impacts.gardien_id` existant désigne l'app-user qui a loggé la donnée, pas le gardien en poste dans le match — l'Architect doit introduire un concept séparé si le mode Match a besoin de savoir "quel gardien de l'équipe défendante était en poste sur ce tir" (cf. §8 note technique).

## 6. Hypothèse de travail retenue (non bloquante, ajustable)
"But" / "Tir raté" est un résultat **simplifié à 2 valeurs**, propre au mode Match (distinct du jeu à 4 valeurs but/arrêt/poteau/hors_cadre du mode saisie impact existant) — cohérent avec un usage de saisie encore plus rapide sur un match complet où l'on tague les tirs des deux équipes. Le calendrier J01-J22 + saison est traité comme une **métadonnée d'organisation** des matchs (pas un calendrier/classement complet à gérer).

## 7. Scope
### Dedans
- CRUD Équipes
- CRUD Joueurs, rattachés à une équipe (nom, poste — y compris "gardien de but", latéralité)
- CRUD Matchs (saison, journée J01-J22, deux équipes)
- Écran de sélection d'un match (journée + équipes) → lance le mode saisie
- Écran de saisie match : terrain + cage visibles, résultat But/Tir raté, sélection de l'équipe puis du joueur tireur parmi les joueurs de cette équipe
- Chaque impact saisi en mode Match alimente le Book du joueur concerné (si rattaché à un tireur existant ou nouvellement créé en miroir)

### Dehors (MVP de cette extension)
- Calendrier/classement de championnat complet (journée = simple métadonnée texte/numérique, pas un référentiel de dates réelles)
- Édition en direct du score du match (pas un scoreboard live, juste la saisie d'impacts)
- Gestion des remplacements/temps de jeu par joueur

## 8. Décision produit tranchée : pas de tracking du gardien en poste (hors scope, définitif)
Confirmation explicite de l'utilisateur : **l'objectif du logiciel est exclusivement la vue sur les tireurs adverses — leurs préférences, leurs zones, leur book.** Le nombre d'arrêts, la performance d'un gardien en poste dans le match, "qui a arrêté quoi" : **hors scope, pas juste reportable, définitivement pas construit.** `impacts.gardien_id` reste uniquement l'app-user/observateur (déjà le cas dans le schéma implémenté par l'Architect, aucun `gardien_terrain_id` n'a été ajouté). Le poste "gardien de but" reste disponible dans le référentiel joueur pour la complétude d'un roster d'équipe, mais **aucune stat, aucun écran, aucune requête ne doit jamais l'exploiter pour calculer une performance défensive.** Toute la valeur du mode Match se mesure à une seule chose : est-ce que ça enrichit le Book du tireur (zone favorite, main dominante, historique) ? Si une fonctionnalité ne sert pas directement cet objectif, elle ne rentre pas dans le scope.

## 9. Composants réutilisés
`fenix-terrain-zones-export` (déjà intégré, `js/vendor/`, `js/zone-picker.js`) — même terrain 11 zones, même cage 9 zones, à réutiliser tels quels pour ce nouveau mode de saisie également.
