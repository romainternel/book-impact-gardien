# PRD — Mode Match (équipes, joueurs, saisie match complet)

## 1. Objectif
Permettre à l'utilisateur de structurer son suivi autour d'équipes et de joueurs réels, et de documenter un match complet (les deux équipes, tous les tireurs) en saisie rapide — en enrichissant le système existant (Book par tireur) sans le casser.

## 2. Décisions produit (résolvent les ambiguïtés du brief)

### 2.1 Unification tireur/joueur — pas de nouvelle table "joueurs"
Un "joueur d'équipe" **est** un `tireur` avec un `equipe_id` renseigné. Créer un joueur dans une équipe (mode Paramètres) = créer un `tireur` avec ce lien. Les tireurs créés librement dans le mode Book (sans équipe) restent possibles et valides — `equipe_id` est nullable. Zéro duplication de table, zéro migration nécessaire (base vide actuellement).

### 2.2 Résultat simplifié pour le mode Match
Le mode Match introduit une 5e valeur de résultat : **`non_but`** (englobe arrêt/poteau/hors-cadre — non détaillé, pour la vitesse). `but` reste identique au mode existant. `non_but` se comporte comme `hors_cadre` aujourd'hui vis-à-vis de la zone de cage : **pas de zone de cage requise** (on ne demande pas de détailler où/comment le tir a été manqué, seulement qu'il ne soit pas rentré). Cette distinction est nécessaire pour ne pas corrompre les stats existantes du Book (`arrêt` reste un résultat distinct et fiable, jamais réutilisé à tort pour une donnée moins précise).

### 2.3 Le mode Match reste positionnel
Contrairement à une saisie minimaliste "juste but/raté", le mode Match réutilise **la même zone de tir (terrain 11 zones)** que le mode existant — c'est la donnée qui a le plus de valeur pour un book, la perdre pour aller plus vite n'a pas de sens. La zone de cage reste demandée uniquement sur un `but` (comme aujourd'hui), pas sur un `non_but` (cf. 2.2).

### 2.4 Sélection du joueur = sélection implicite de l'équipe
L'écran de saisie affiche les deux listes de joueurs (une par équipe) en permanence. Taper un nom de joueur détermine en un seul geste **qui** a tiré et **pour quelle équipe** — pas d'étape "choisir l'équipe" séparée.

### 2.5 Le Book existant profite du mode Match
Un impact saisi en mode Match avec un joueur donné apparaît dans le Book de ce joueur (même table `tireurs`/`impacts`, mêmes stats/heatmaps déjà construits) — sans développement supplémentaire, gratuit grâce à la décision 2.1.

## 3. Features

### F1 — CRUD Équipes (mode Paramètres)
Liste des équipes, création rapide (nom obligatoire, club/couleur optionnels — réutilise le pattern de création rapide déjà établi), suppression **non prévue au MVP** (une équipe utilisée par un match ou des joueurs ne doit pas pouvoir disparaître silencieusement — cf. Risk Analyst).

### F2 — CRUD Joueurs par équipe (mode Paramètres)
Depuis une équipe sélectionnée : liste de ses joueurs (= tireurs filtrés par `equipe_id`), création rapide (nom, poste — y compris "gardien de but", latéralité), édition des joueurs existants (Should Have, cohérent avec le PRD MVP qui prévoyait déjà l'édition tireur en Should Have, jamais livrée — l'occasion de la faire maintenant si le temps le permet).

### F3 — CRUD Matchs (mode Paramètres)
Création d'un match : saison (texte libre, ex. "2025-2026"), journée (J01 à J22, liste fixe), équipe A, équipe B. Un match ne peut pas avoir deux fois la même équipe.

### F4 — Sélection d'un match (mode Saisie, écran d'entrée)
Liste des matchs existants (filtrable par saison/journée), tap → lance l'écran de saisie match avec les deux équipes déjà chargées.

### F5 — Écran de saisie match
- Résultat simplifié : **But** / **Non-but** (2 boutons)
- Zone de tir : terrain 11 zones (réutilisation du picker existant)
- Zone de cage : uniquement si `but` (réutilisation de la grille existante)
- Sélection du joueur tireur : deux listes de boutons (une par équipe), tap = qui + quelle équipe
- Enregistrement automatique dès que les champs requis sont réunis, retour immédiat pour le tir suivant — même philosophie 2-3 taps que le mode existant
- Chaque impact porte un `match_id` (nouveau champ), en plus de `tireur_id`/`gardien_id` déjà existants

## 4. Priorités

| Feature | Priorité |
|---|---|
| F1 — CRUD Équipes (créer + lister) | Must Have |
| F2 — CRUD Joueurs (créer + lister par équipe) | Must Have |
| F3 — CRUD Matchs | Must Have |
| F4 — Sélection d'un match | Must Have |
| F5 — Écran de saisie match (résultat simplifié, positions, sélection joueur) | Must Have |
| Édition équipe/joueur après création | Should Have |
| Suppression équipe/joueur/match | Hors scope (MVP de cette extension) |
| Calendrier/classement complet, score live | Hors scope |

## 5. Critères d'acceptation
- Créer une équipe, y créer 2 joueurs, créer un match entre cette équipe et une autre, lancer la saisie → les deux listes de joueurs correspondent aux bonnes équipes.
- Taguer un `but` en mode Match → apparaît dans le Book du joueur concerné avec la bonne zone de tir/cage.
- Taguer un `non_but` en mode Match → apparaît dans le Book, sans zone de cage, sans fausser le taux d'arrêt existant (qui ne compte que les `arret` explicites du mode Book).
- Le mode Book par tireur existant continue de fonctionner à l'identique, aucune régression.

## 6. Hors scope
- Migration/fusion rétroactive de données (base vide, non nécessaire)
- Suppression d'équipe/joueur/match
- Calendrier de championnat réel, classement, score en direct
- Édition d'un impact après saisie (au-delà de l'annulation du dernier, déjà existante)

## 7. Dépendances
- Schéma Supabase à étendre (`equipes`, `tireurs.equipe_id`, `matchs`, `impacts.match_id`, contrainte `resultat` étendue) — nouvelle story de migration, RLS à définir pour les nouvelles tables dès leur création (pas de `for all` générique, cf. précédent déjà établi).

## 8. Risques identifiés à ce stade (détaillés par le Risk Analyst)
- Suppression d'équipe/joueur non prévue mais un utilisateur pourrait s'y attendre — à documenter comme hors scope explicite, pas un oubli.
- Deux listes de joueurs simultanées sur l'écran de saisie = plus dense visuellement que l'écran actuel — risque d'erreur de sélection sous pression du direct, à traiter par le Designer (contraste net entre les deux équipes).
