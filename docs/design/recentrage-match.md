# Design — Recentrage Match (écran de saisie + simplification du flow Book)

## 1. Simplification du flow "Book par tireur"

### Avant
```
Écran Tireur (recherche/sélection) ──tap──▶ Écran Saisie Impact (screen-impact.js) ──lien "📖 Book"──▶ Écran Book
```

### Après
```
Écran Tireur (recherche/sélection) ──tap──▶ Écran Book (directement)
```

Aucun changement visuel sur l'écran Tireur lui-même (recherche, création, édition, suppression — inchangés, STORY-04/16). Seule la destination du tap change : `select-tireur` et `confirm-create-tireur` mènent directement au Book. Le bouton "retour" de l'écran Book (actuellement câblé sur l'ancien écran de saisie) pointe désormais vers l'écran Tireur.

```
┌─────────────────────────────────────┐        ┌─────────────────────────────────────┐
│ ← Gardien                            │        │ ← Antoine D. — Fenix · Ailier D · D  │
│  🔍 [ Chercher un tireur...        ] │  tap   │                                       │
│  ┌───────────────────────────────┐  │───────▶│  ┌──────┐┌──────┐┌──────┐┌──────┐   │
│  │ Antoine D.      Fenix · AILD  │  │        │  │ 24   │ 62%  │Centre│ 41%  │   │
│  ├───────────────────────────────┤  │        │  └──────┘└──────┘└──────┘└──────┘   │
│  │ Nino R.          Fenix · GB   │  │        │  (heatmaps, historique — inchangé)   │
│  └───────────────────────────────┘  │        │                                       │
└─────────────────────────────────────┘        └─────────────────────────────────────┘
        Écran Tireur (inchangé)                          Écran Book (inchangé)
```

## 2. Écran de saisie match — nouvel ordre et disposition

### Décision de layout
Le bloc central (Résultat → Zone de cage → Zone de tir) reste vertical, dans le nouvel ordre demandé — la cage est positionnée visuellement **au-dessus** du terrain, cohérent avec la réalité (le but est au fond du terrain). Les deux rosters encadrent ce bloc central en colonnes latérales **quand la largeur d'écran le permet**.

**Contrainte technique qui pilote cette décision (cf. CLAUDE.md §8)** : l'app cible en priorité un téléphone en portrait, où `#app` est aujourd'hui plafonné à 480px. À cette largeur, caser deux colonnes de rosters ET un terrain assez large pour un tap précis sur les zones concaves (69MG/69MC/69MD, déjà un point sensible documenté en architecture) n'est pas réaliste sans réduire dangereusement la taille des cibles tactiles du terrain — l'interaction la plus importante de l'écran.

**Décision retenue** : disposition responsive à un seul markup, deux rendus :
- **≥ 760px de large** (tablette, paysage, desktop) : 3 colonnes réelles — roster équipe A à gauche, bloc central (résultat/cage/terrain) au milieu, roster équipe B à droite, sur toute la hauteur disponible.
- **< 760px de large** (téléphone en portrait, usage principal) : une seule colonne, ordre Résultat → Zone de cage → Zone de tir → les deux rosters affichés en rangée (côte à côte, comme déjà aujourd'hui) sous le terrain. Le contenu et l'ordre de lecture demandés (résultat, cage, terrain) sont respectés à l'identique ; seule la position des rosters (dessous plutôt que sur les côtés) s'adapte pour ne pas sacrifier la précision de tap sur le terrain.

### Maquette — téléphone portrait (< 760px, usage principal)
```
┌─────────────────────────────────────┐
│ ← J03 · Fenix Toulouse vs US Ivry    │
├─────────────────────────────────────┤
│  RÉSULTAT                            │
│  [      BUT      ]  [   NON-BUT   ]  │
├─────────────────────────────────────┤
│  ZONE DE CAGE                        │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │
│  ┃▓▓▓▓▓▓▓ barre transversale ▓▓▓┃   │
│  ┃┆        (texture filet)      ┆┃   │
│  ┃┆   ↖      ↑      ↗           ┆┃   │
│  ┃┆   ←      ●      →           ┆┃   │
│  ┃┆   ↙      ↓      ↘           ┆┃   │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │
│  (poteaux latéraux visibles, sol      │
│   légèrement herbe sous la ligne)     │
├─────────────────────────────────────┤
│  ZONE DE TIR                         │
│  ┌───────────────────────────────┐  │
│  │  (terrain 11 zones, texture    │  │
│  │   gazon, lignes plus nettes,   │  │
│  │   même géométrie qu'avant)     │  │
│  └───────────────────────────────┘  │
├─────────────────────────────────────┤
│  QUI A TIRÉ ?                        │
│  Fenix Toulouse   │  US Ivry         │
│  ( Antoine D. )   │  ( Karim B. )    │
│  ( Nino R. )      │  ( Yanis T. )    │
│  ( Sacha L. )     │  ( Théo M. )     │
├─────────────────────────────────────┤
│  ✓ But — Antoine D., 6MC → HC [Annuler]│
└─────────────────────────────────────┘
```

### Maquette — large (≥ 760px, tablette/desktop)
```
┌───────────────────────────────────────────────────────────────────────┐
│ ← J03 · Fenix Toulouse vs US Ivry                                       │
├───────────────────────────────────────────────────────────────────────┤
│  FENIX TOULOUSE   │   RÉSULTAT                              │  US IVRY │
│                    │   [     BUT     ]   [    NON-BUT   ]    │          │
│  ( Antoine D. )    ├──────────────────────────────────────────┤          │
│  ( Nino R.    )    │   ZONE DE CAGE                           │( Karim B.)│
│  ( Sacha L.   )    │   ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │( Yanis T.)│
│                    │   ┃  but réaliste, filet, poteaux   ┃   │( Théo M. )│
│                    │   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │          │
│                    ├──────────────────────────────────────────┤          │
│                    │   ZONE DE TIR                            │          │
│                    │   (terrain texturé, 11 zones)            │          │
├───────────────────────────────────────────────────────────────────────┤
│  ✓ But — Antoine D., 6MC → HC                                 [Annuler] │
└───────────────────────────────────────────────────────────────────────┘
```
Sur cette largeur, `#app` s'élargit spécifiquement pour cet écran (au-delà du plafond 480px habituel) — décision technique détaillée par l'Architect.

## 3. Interactions
- Identiques à l'existant (STORY-14a/14b) : auto-enregistrement dès que Résultat + Zone de tir + (Zone de cage si `but`) + Joueur sont réunis, verrouillage anti double-tap pendant l'écriture, bandeau d'erreur qui conserve la sélection, bandeau de confirmation avec "Annuler".
- Le tap sur une des 9 cases de la cage reste identique (`data-gz`) — seul l'habillage visuel autour change.
- Le tap sur le terrain reste identique (`data-zone`, délégation sur le SVG) — seule la texture/l'arrière-plan autour des polygones change, jamais leur géométrie ni leur ordre de rendu (cf. contrainte vendor).
- Taper un joueur dans une colonne reste équivalent à sélectionner à la fois le joueur et son équipe, comme aujourd'hui.

## 4. États
- Identiques à l'existant : loading (aucun, l'écran est déjà chargé au montage via `state.matchCourant`), erreur d'écriture (bandeau rouge, sélection conservée), confirmation (bandeau vert avec Annuler).
- Nouveau point d'attention pour le Designer : le bandeau de confirmation/erreur reste en pleine largeur en bas de l'écran, y compris en layout large (ne suit pas la colonne centrale seule) — il concerne toute l'action, pas juste le bloc central.

## 5. Responsive
- Bascule à 760px de large (cf. §2) entre disposition 1 colonne (ordre vertical complet) et disposition 3 colonnes (rosters latéraux).
- Le point de bascule est une valeur CSS (`min-width: 760px`), pas une détection JS — cohérent avec le reste de l'app qui n'a aucune logique responsive en JS à ce jour.
- Le contenu et l'ordre de lecture (résultat → cage → terrain) ne changent jamais entre les deux dispositions — seule la position des rosters (dessous vs. sur les côtés) change.

## 6. Composants réutilisés vs nouveaux
- **Réutilisé tel quel (logique)** : `zone-picker.js` (`renderCourtZonePicker`, `bindCourtZonePicker`), `renderGoalZoneGrid`/`goal-cage-zones.js` (grille de sélection 9 zones, `data-gz`), le pattern de bandeau confirmation/erreur/annulation (STORY-06b/14b), le header partagé.
- **Nouveau** : conteneurs décoratifs autour de la cage (poteaux, barre, texture filet) et du terrain (texture, profondeur) — purement visuels, ajoutés en CSS/HTML autour des sorties existantes, jamais à l'intérieur. Layout CSS Grid pour la disposition 1/3 colonnes de l'écran de saisie match.
- **Retiré** : `screen-impact.js` et son inclusion dans `index.html` (plus aucune maquette ne le concerne, il sort du parcours utilisateur).
