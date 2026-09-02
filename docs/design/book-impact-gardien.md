# Design — Book Impact Gardien

## Décision UX structurante : quand l'impact est-il enregistré ?
Le PRD flaggait une ambiguïté (résultat avant ou après les zones ?). Décision Designer, cohérente avec le pattern déjà validé dans CF Fenix Stat (résultat choisi en premier, cf. `screenshots/visual-1-goal-cage-9zones.png`) :

- Les 3 zones de saisie (**Résultat**, **Zone de tir**, **Zone de cage**) sont **toutes visibles en permanence** sur l'écran 3, et peuvent être tapées **dans n'importe quel ordre**.
- La **Zone de cage** n'est nécessaire (et n'est activée visuellement) que si le résultat choisi est `but`, `arret` ou `poteau` — sur `hors_cadre`, elle reste grisée et non requise (un tir non cadré n'a pas de point d'impact dans la cage).
- L'enregistrement est **automatique** dès que les champs requis pour le résultat en cours sont complets — pas de bouton "Valider" séparé :
  - `hors_cadre` → **2 taps** requis (Résultat + Zone de tir)
  - `but` / `arret` / `poteau` → **3 taps** requis (Résultat + Zone de tir + Zone de cage)
- `type_tir` et `main` ne comptent pas dans les 2-3 taps critiques : ils sont pré-remplis avec la dernière valeur utilisée **pour ce tireur précis**, et ne demandent un tap que si le gardien veut les changer.

Ce découpage respecte exactement la contrainte "2-3 taps maximum" du brief tout en gardant un ordre de saisie libre (le gardien tape ce qu'il voit dans l'ordre où il le voit).

---

## Écran 1 — Sélection gardien

```
┌─────────────────────────────────────┐
│        BOOK IMPACT GARDIEN           │
│                                       │
│   Qui es-tu ?                        │
│                                       │
│   ┌───────────────────────────────┐ │
│   │  Isaac M.                      │ │
│   └───────────────────────────────┘ │
│   ┌───────────────────────────────┐ │
│   │  Nino R.                       │ │
│   └───────────────────────────────┘ │
│   ┌───────────────────────────────┐ │
│   │  + Nouveau gardien             │ │
│   └───────────────────────────────┘ │
│                                       │
└─────────────────────────────────────┘
```

### Interactions
- Tap sur une carte gardien → écrit `gardien_id` en `localStorage` → navigation directe vers Écran 2.
- Tap sur "+ Nouveau gardien" → champ texte inline (nom) + bouton "Créer" → insertion Supabase → sélection automatique.
- Lancements suivants de l'app : cet écran est **sauté** si un `gardien_id` valide est déjà en `localStorage` → arrivée directe sur Écran 2. Un lien "Changer de gardien" reste accessible depuis le header de tous les autres écrans.

### États
- Chargement : liste de gardiens en squelette (3 barres grises).
- Vide (aucun gardien en base) : seul le bouton "+ Nouveau gardien" est visible, avec un texte d'accroche.
- Erreur réseau : message "Connexion impossible — réessaie" + bouton Réessayer.

### Responsive
Écran plein centré verticalement, cartes en colonne unique quelle que soit la largeur — pas de mise en page multi-colonnes nécessaire (liste courte).

### Composants
Nouveau — pas d'équivalent dans l'export.

---

## Écran 2 — Sélection / création tireur

```
┌─────────────────────────────────────┐
│ ← Isaac M.                           │
│                                       │
│  🔍 [ Chercher un tireur...        ] │
│                                       │
│  ┌───────────────────────────────┐  │
│  │ Antoine D.        AILD  ●D    │  │
│  │ US Ivry                        │  │
│  ├───────────────────────────────┤  │
│  │ Antoine L.        PIV   ●G    │  │
│  │ Créteil HB                     │  │
│  └───────────────────────────────┘  │
│                                       │
│  ┌───────────────────────────────┐  │
│  │ + Créer "Anto..."               │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Interactions
- Champ de recherche filtre en temps réel (nom + club) dès la 1re lettre.
- Tap sur une ligne tireur → navigation directe Écran 3, contexte tireur chargé.
- La ligne "+ Créer '...'" n'apparaît que si la recherche ne matche aucun tireur exactement → tap ouvre un mini-formulaire **inline** (pas un nouvel écran) :
  ```
  Nom *        [____________]
  Club         [____________]
  Poste        [ AILD ▾ ]      (liste fixe, optionnel)
  Latéralité   [ D ] [ G ]     (optionnel)
  [ Créer et commencer ]
  ```
  Seul le nom est obligatoire — club/poste/latéralité sont complétables plus tard. Tap "Créer et commencer" → insertion Supabase → navigation directe Écran 3.

### États
- Vide (aucune recherche) : liste des tireurs les plus récemment consultés par ce gardien (max 5), pour retrouver vite un tireur en cours de "book".
- Aucun résultat : uniquement la ligne "+ Créer".
- Erreur réseau : identique Écran 1.

### Responsive
Liste scrollable, une colonne. Le champ de recherche reste sticky en haut au scroll.

### Composants
Nouveau — pas d'équivalent dans l'export.

---

## Écran 3 — Saisie impact (boucle principale)

```
┌─────────────────────────────────────────────┐
│ ← Isaac M.   Antoine D. (US Ivry)   📖 Book  │
├───────────────────────────────────────────────┤
│  RÉSULTAT                                     │
│  [   BUT   ] [ ARRÊT ] [ POTEAU ] [HORS CADRE]│
├───────────────────────────────────────────────┤
│  ZONE DE TIR                                  │
│  ┌─────────────────────────────────────────┐ │
│  │        (SVG terrain 11 zones)             │ │
│  │   AILG   69MG  9MC  69MD   AILD           │ │
│  │        6MG  6MC  6MD                      │ │
│  └─────────────────────────────────────────┘ │
├───────────────────────────────────────────────┤
│  ZONE DE CAGE           (grisée si non requis)│
│  ┌───────┬───────┬───────┐                    │
│  │  ↖   │  ↑   │  ↗   │                        │
│  ├───────┼───────┼───────┤                    │
│  │  ←   │  ●   │  →   │                        │
│  ├───────┼───────┼───────┤                    │
│  │  ↙   │  ↓   │  ↘   │                        │
│  └───────┴───────┴───────┘                    │
├───────────────────────────────────────────────┤
│  Type : (Jet)(Appui)(Suspension)(Extension)(P.)│
│  Main : ( D )( G )                              │
├───────────────────────────────────────────────┤
│  ✓ Impact enregistré — Arrêt, 69MG → MC   [Annuler] │
└─────────────────────────────────────────────┘
```

### Interactions
1. Tap "ARRÊT" (ou But/Poteau/Hors cadre) → bouton devient actif (surbrillance accent), les 3 autres redeviennent neutres.
2. Tap une zone du terrain → zone active en surbrillance, reste du terrain assombri.
3. Si résultat ∈ {but, arrêt, poteau} : la grille cage passe de grisée à pleinement interactive dès qu'un résultat compatible est choisi ; tap sur une case → **déclenche l'enregistrement immédiat** en base.
   Si résultat = hors cadre : l'enregistrement se déclenche dès que la Zone de tir est tapée (pas besoin de la cage).
4. Après enregistrement : bandeau de confirmation apparaît en bas ("✓ Impact enregistré — {résultat}, {zone_tir} → {zone_cage}") avec bouton **Annuler** (supprime l'impact en base + remet l'écran dans l'état juste avant cet enregistrement).
5. L'écran se réinitialise pour le tir suivant : Résultat / Zone de tir / Zone de cage reviennent à "aucune sélection". Type de tir et Main **restent sur la dernière valeur utilisée** (pas de reset) car ils changent rarement d'un tir à l'autre pour un même tireur.
6. Tap sur un chip Type ou Main → change juste la valeur pré-remplie pour le prochain enregistrement (pas d'enregistrement déclenché par ce tap seul).
7. Lien "📖 Book" en header → navigation Écran 4 pour ce tireur (consultation ponctuelle sans perdre le contexte de saisie — retour ramène ici).

### États
- Prêt à saisir (état par défaut, décrit ci-dessus).
- Zone de cage grisée (résultat pas encore choisi, ou = hors_cadre).
- Bandeau de confirmation visible ~4s ou jusqu'au prochain enregistrement (le nouveau bandeau remplace l'ancien).
- Erreur d'écriture Supabase : le bandeau devient rouge "Échec de l'enregistrement — réessaie", la sélection en cours (résultat/zones) **n'est pas réinitialisée** pour permettre de retaper directement sur "Zone de cage" sans tout refaire.

### Responsive
- Terrain et cage empilés verticalement (pas côte à côte) pour garder des cibles de tap larges même sur petit écran — priorité à la taille de la cible tactile sur la densité d'info.
- Boutons résultat en grille 2×2 sous ~480px de large, en ligne sur écran plus large.

### Composants réutilisés vs nouveaux
- **Réutilisé tel quel** : `terrain-zones.js` (`courtSvgMarkup`, `shotZoneCourt` pour associer le clic à une zone, `COURT_ZONE_ORDER`/labels), `goal-cage-zones.js` (`renderGoalZoneGrid`, `GOAL_ZONES`, `GZ_LABELS`), `zones.css` (`.court-pick`, `.goal-zone-grid.gz-big`, `.gz-cell`).
- **Nouveau** : boutons résultat, chips type/main, bandeau de confirmation + annulation, logique de verrouillage conditionnel de la cage.

---

## Écran 4 — Book tireur

```
┌─────────────────────────────────────────────┐
│ ← Antoine D.  US Ivry · AILD · Droitier      │
├───────────────────────────────────────────────┤
│ ┌──────────┐┌──────────┐┌──────────┐┌────────┐│
│ │ 24 tirs  ││ Main D   ││ Aile D   ││ 42%    ││
│ │          ││   78%    ││ favori   ││ arrêt* ││
│ └──────────┘└──────────┘└──────────┘└────────┘│
│                          * face à Isaac M.     │
├───────────────────────────────────────────────┤
│  ZONE DE TIR (tap pour filtrer)  [Tous ✕]      │
│  ┌─────────────────────────────────────────┐  │
│  │   (heatmap terrain 11 zones, buts/tirs)   │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  ZONE DE CAGE  (filtrée sur la zone ci-dessus) │
│  ┌───────┬───────┬───────┐                     │
│  │ 2/3   │ 5/6   │ 0/1   │                      │
│  ├───────┼───────┼───────┤                     │
│  │ 1/2   │ 0/0   │ 3/4   │                      │
│  ├───────┼───────┼───────┤                     │
│  │ 0/1   │ 1/1   │ 2/2   │                      │
│  └───────┴───────┴───────┘                     │
├───────────────────────────────────────────────┤
│  HISTORIQUE                                     │
│  12/09 · Fenix-X · 69MG→MC · Arrêt              │
│  12/09 · Fenix-X · 9MD→HD  · But                │
│  05/09 · Fenix-Y · 6MC→BC  · Poteau             │
│  …                                              │
└─────────────────────────────────────────────┘
```

### Interactions
- Tap sur une zone du terrain heatmap → filtre la heatmap cage sur les tirs originaires de cette seule zone (chip "Tous ✕" apparaît pour réinitialiser).
- Par défaut (aucun filtre) : heatmap cage = agrégat de tous les zone_tir.
- Le taux d'arrêt affiché en stat est explicitement annoté "face à {gardien actif}" — ce n'est pas un agrégat multi-gardiens (cf. décision PM).
- Historique : liste scrollable, pas de pagination pour le MVP (nombre de tirs par tireur reste faible en pratique).
- Tap "←" retourne à l'écran de saisie (Écran 3) si on vient de là, ou à l'écran 2 sinon.

### États
- Moins de 3 tirs enregistrés : les stats (main dominante, poste favori) affichent "Pas encore assez de données" plutôt qu'un pourcentage trompeur sur un échantillon minuscule.
- Aucun tir du tout : écran affiche directement un état vide invitant à retourner en saisie.
- Chargement : squelettes sur les 4 cartes stats + heatmaps grisées.

### Responsive
Cartes stats en grille 2×2 sous ~480px, en ligne sur écran large. Terrain et cage empilés verticalement (cohérence avec Écran 3).

### Composants réutilisés vs nouveaux
- **Réutilisé tel quel** : `renderCourtZones`/`aggregateCourtZones` (adapté : `s.goal` → `resultat==='but'`) pour la heatmap terrain, `goalZoneHeatmap` pour la heatmap cage.
- **Nouveau** : le filtrage croisé terrain→cage (clic sur zone terrain qui recalcule les données passées à `goalZoneHeatmap`), les 4 cartes stats, la liste historique.
