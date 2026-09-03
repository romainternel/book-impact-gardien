# Design — Mode Match (équipes, joueurs, saisie match complet)

## Décision de navigation
L'app a aujourd'hui un seul chemin (gardien → tireur → saisie → book). Avec deux modes désormais, il faut un point de bascule. **Nouvel écran Accueil**, inséré entre la sélection gardien et tout le reste — remplace le saut direct vers l'écran tireur.

```
┌─────────────────────────────────────┐
│ Isaac M.          Changer de gardien │
│                                       │
│   Qu'est-ce que tu veux faire ?      │
│                                       │
│   ┌───────────────────────────────┐ │
│   │  📖  Book par tireur           │ │
│   │  Scouter un tireur adverse     │ │
│   └───────────────────────────────┘ │
│   ┌───────────────────────────────┐ │
│   │  ⚽  Saisir un match            │ │
│   │  Documenter un match complet   │ │
│   └───────────────────────────────┘ │
│   ┌───────────────────────────────┐ │
│   │  ⚙️  Paramètres                 │ │
│   │  Équipes, joueurs, matchs      │ │
│   └───────────────────────────────┘ │
└─────────────────────────────────────┘
```
Le lien "Book par tireur" mène exactement à l'écran tireur existant (STORY-04), inchangé.

---

## Écran Paramètres (hub secondaire)

```
┌─────────────────────────────────────┐
│ ← Paramètres                         │
│                                       │
│   ┌───────────────────────────────┐ │
│   │  🛡️  Équipes                    │ │
│   └───────────────────────────────┘ │
│   ┌───────────────────────────────┐ │
│   │  🤾  Joueurs                    │ │
│   └───────────────────────────────┘ │
│   ┌───────────────────────────────┐ │
│   │  📅  Matchs                     │ │
│   └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Écran Équipes

```
┌─────────────────────────────────────┐
│ ← Équipes                            │
│                                       │
│  ┌───────────────────────────────┐  │
│  │ Fenix Toulouse                 │  │
│  ├───────────────────────────────┤  │
│  │ US Ivry                        │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ + Nouvelle équipe               │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```
Tap sur une équipe → écran Joueurs de cette équipe (ci-dessous). "+ Nouvelle équipe" : formulaire inline, nom obligatoire uniquement (même pattern que la création gardien).

## Écran Joueurs (d'une équipe)

```
┌─────────────────────────────────────┐
│ ← Fenix Toulouse                     │
│                                       │
│  🔍 [ Chercher un joueur...        ] │
│                                       │
│  ┌───────────────────────────────┐  │
│  │ Antoine D.        AILD  ●D    │  │
│  ├───────────────────────────────┤  │
│  │ Nino R.            GB   ●G    │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ + Nouveau joueur                │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```
Repompe exactement l'écran tireur existant (STORY-04) : recherche + création rapide + poste + latéralité. Seule différence : la liste est filtrée sur `equipe_id` = l'équipe en cours, et la création pré-remplit cet `equipe_id`. "Gardien de but" ajouté à la liste des postes disponibles (absent du référentiel original, nécessaire pour représenter un vrai gardien de match — à ne pas confondre avec le `gardien` observateur de l'app).

## Écran Matchs

```
┌─────────────────────────────────────┐
│ ← Matchs                             │
│                                       │
│  ┌───────────────────────────────┐  │
│  │ J03 · 2025-2026                │  │
│  │ Fenix Toulouse vs US Ivry       │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ + Nouveau match                 │  │
│  └───────────────────────────────┘  │
│                                       │
│  Nouveau match :                     │
│  Saison      [ 2025-2026        ]   │
│  Journée     [ J03 ▾ ]              │
│  Équipe A    [ Fenix Toulouse ▾ ]   │
│  Équipe B    [ US Ivry ▾ ]          │
│  [ Créer ]                           │
└─────────────────────────────────────┘
```

---

## Écran Sélection Match (point d'entrée du mode Saisie)

```
┌─────────────────────────────────────┐
│ ← Choisis ton match                  │
│                                       │
│  ┌───────────────────────────────┐  │
│  │ J03 · 2025-2026                │  │
│  │ Fenix Toulouse vs US Ivry       │  │
│  │              [ Lancer ]         │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ J02 · 2025-2026                │  │
│  │ Fenix Toulouse vs Créteil HB    │  │
│  │              [ Lancer ]         │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```
Si aucun match n'existe : état vide invitant à aller en créer un dans Paramètres.

## Écran Saisie Match (le plus dense — le cœur du mode)

```
┌─────────────────────────────────────────────┐
│ ← J03 · Fenix Toulouse vs US Ivry            │
├───────────────────────────────────────────────┤
│  RÉSULTAT                                     │
│  [      BUT      ]  [    NON-BUT    ]         │
├───────────────────────────────────────────────┤
│  ZONE DE TIR                                  │
│  (SVG terrain 11 zones — identique à l'existant)│
├───────────────────────────────────────────────┤
│  ZONE DE CAGE      (grisée si résultat=non-but)│
│  (grille 9 zones — identique à l'existant)     │
├───────────────────────────────────────────────┤
│  QUI A TIRÉ ?                                  │
│  Fenix Toulouse         │  US Ivry             │
│  ( Antoine D. )         │  ( Karim B. )        │
│  ( Nino R. )            │  ( Yanis T. )        │
│  ( Sacha L. )           │  ( Théo M. )         │
├───────────────────────────────────────────────┤
│  ✓ But — Antoine D., 6MC → HC       [Annuler] │
└─────────────────────────────────────────────┘
```

### Interactions
- Même logique d'auto-enregistrement que l'écran de saisie existant : dès que Résultat + Zone de tir + (Zone de cage si `but`) + Joueur sont réunis, enregistrement immédiat, pas de bouton "Valider" séparé.
- Les deux colonnes de joueurs sont **visuellement distinctes** (couleur d'équipe ou simple séparation nette) pour éviter une erreur de sélection sous pression — cf. risque remonté par le PM.
- Taper un joueur d'une colonne sélectionne implicitement l'équipe concernée (pas d'étape séparée).
- Même bandeau de confirmation + Annuler que l'écran existant (réutilisation directe du pattern STORY-06b).
- Ordre de tap libre, comme l'écran existant — un joueur peut être tapé avant ou après le résultat/les zones.

### États
- Résultat = `but` → zone de cage déverrouillée, requise avant enregistrement.
- Résultat = `non_but` → zone de cage grisée, non requise (comportement identique à `hors_cadre` sur l'écran existant).
- Aucun joueur tapé → pas d'enregistrement, même si tout le reste est rempli (le joueur est une donnée requise, contrairement à type_tir/main qui restent optionnels).

### Responsive
Les deux colonnes de joueurs passent en pleine largeur empilées (équipe A puis équipe B) sous ~480px, comme le reste de l'app — priorité à la taille des cibles tactiles.

### Composants réutilisés vs nouveaux
- **Réutilisé tel quel** : `zone-picker.js` (terrain), `renderGoalZoneGrid` (cage), le pattern de bandeau confirmation/erreur/annulation (STORY-06b), le composant header partagé (avec bouton retour).
- **Nouveau** : les deux listes de boutons joueurs par équipe, le bouton résultat à 2 valeurs (variante du composant à 4 valeurs existant).
