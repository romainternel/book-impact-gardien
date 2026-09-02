# Visual — Book Impact Gardien

Base : palette et identité de `fenix-terrain-zones-export/zones.css` (navy sombre, accent sky, CF Fenix Stat). Ce document étend ces tokens à tout ce que l'export ne couvre pas (fond de page, hiérarchie de texte, boutons résultat, animations) — sans jamais s'en écarter sur ce qu'il couvre déjà (`--court-fill`, `--panel`, `--bg3`, `--border`, `--t3`, `--fenix-sky` sont repris identiques, pas redéfinis).

## 1. Palette de tokens

```css
:root{
  /* Repris tels quels de zones.css — ne pas redéfinir ailleurs */
  --court-fill: #0F1923;
  --court-line: rgba(123,167,194,.55);
  --court-line-dash: rgba(123,167,194,.35);
  --court-goal: rgba(232,70,90,.6);
  --bg3: #1a2733;
  --panel: #131f2b;
  --t3: #6b7f91;
  --border: rgba(123,167,194,.25);
  --fenix-sky: #5FA8D3;

  /* Nouveaux — fond de page et hiérarchie de texte */
  --bg: #0B131B;
  --panel-2: #17222D;
  --t1: #E8F0F5;   /* texte primaire */
  --t2: #A9BECE;   /* texte secondaire */
  --accent: var(--fenix-sky);
  --accent-glow: rgba(95,168,211,.35);
  --accent-strong: #7FC0E8;

  /* Résultats — chaque couleur porte un sens, jamais décorative */
  --res-but: #4CD97B;        /* but encaissé */
  --res-but-glow: rgba(76,217,123,.35);
  --res-arret: #4ECDE8;      /* arrêt — même bleu que le succès zone.css */
  --res-arret-glow: rgba(78,205,232,.35);
  --res-poteau: #F0A83C;     /* poteau — ambre, seul usage de cette teinte dans l'app */
  --res-poteau-glow: rgba(240,168,60,.35);
  --res-horscadre: #8A98A6;  /* hors cadre — neutre, pas un échec ni un succès pour le gardien */
  --res-horscadre-glow: rgba(138,152,166,.25);

  --danger: #E8465A;         /* reprend --court-goal en opaque, pour Annuler/erreurs */

  --radius-s: 6px;
  --radius-m: 10px;
  --radius-l: 14px;
}
```

Aucune nouvelle teinte de "marque" n'est introduite : `--fenix-sky` reste l'unique accent interactif (sélections, liens, focus). Les couleurs de résultat sont sémantiques et n'apparaissent que sur les boutons résultat + leurs reflets (bandeau de confirmation, badges historique) — jamais en décoration.

## 2. Typographie

```css
font-family: -apple-system, "Segoe UI", Roboto, system-ui, sans-serif;
```
Stack système — pas de police externe chargée (évite une dépendance réseau qui ralentirait le premier tap en conditions de connexion moyenne).

| Niveau | Taille | Weight | Letter-spacing | Usage |
|---|---|---|---|---|
| Titre écran | 20px | 700 | -0.2px | "Antoine D. — US Ivry" |
| Stat chiffre | 26px | 800 | -0.4px | "24 tirs", "78%" |
| Stat label | 11px | 600 | 0.4px, uppercase | "MAIN DOMINANTE" |
| Bouton résultat | 15px | 700 | 0.2px, uppercase | "BUT", "ARRÊT" |
| Corps / historique | 14px | 500 | 0 | lignes d'historique |
| Tertiaire / meta | 12px | 500 | 0 | dates, club |
| Glyphe cage (gz-cell) | 28px hérité de `.gz-big` | — | — | inchangé, ne pas retoucher |

Line-height : 1.3 pour le corps, 1.1 pour les gros chiffres de stats.

## 3. Ombres & effets

```css
--shadow-card: 0 1px 2px rgba(0,0,0,.3), 0 8px 20px -8px rgba(0,0,0,.5);
--shadow-active: 0 0 0 1px var(--accent), 0 0 16px var(--accent-glow);
--shadow-btn-rest: 0 1px 3px rgba(0,0,0,.35);
```

- Cartes stats (`.stat-card`) : `background: var(--panel); border: 1px solid var(--border); border-radius: var(--radius-m); box-shadow: var(--shadow-card);`
- Pas de glassmorphism/backdrop-blur : l'app est utilisée en parallèle d'une vidéo, donc en usage "outil de travail" plutôt que "vitrine" — la priorité va à la lisibilité immédiate des zones cliquables, pas à l'effet visuel. Un seul effet de profondeur (ombre portée légère) suffit à distinguer panneaux et fond.
- Bouton résultat sélectionné : `box-shadow: 0 0 0 2px var(--res-{x}), 0 0 14px var(--res-{x}-glow);` + `background: color-mix(in srgb, var(--res-{x}) 18%, var(--panel));`

## 4. États interactifs

| Composant | Repos | Hover (desktop) | Active/pressed | Sélectionné | Disabled |
|---|---|---|---|---|---|
| Bouton résultat | `background: var(--panel-2)`, texte `--t2` | `border-color` s'éclaircit légèrement | `transform: scale(.96)` | couleur sémantique pleine (cf. §3) + glow | n/a (toujours actionnable) |
| `.gz-cell` (cage) | hérité `zones.css` (`--bg3`, `--t3`) | `background: rgba(123,167,194,.15)` | `background: rgba(123,167,194,.3)` (déjà dans zones.css) | classe `.active` existante, inchangée | `opacity:.35; pointer-events:none` + curseur `not-allowed` quand résultat = hors cadre ou non choisi |
| Polygone zone terrain | `fill: var(--bg3)` (déjà dans terrain-zones.js) | `filter: brightness(1.15)` | `filter: brightness(.9)` | `stroke: var(--accent); stroke-width: 2` en surcouche | — |
| Chip type/main | `border: 1px solid var(--border)`, `color: var(--t2)` | `border-color: var(--t2)` | `scale(.95)` | `background: var(--accent); color: #0B131B; border-color: var(--accent)` | — |
| Carte gardien/tireur (liste) | `background: var(--panel)` | `background: var(--panel-2)` | `scale(.98)` | — | — |
| Bouton "Annuler" | `color: var(--danger)`, transparent | `background: rgba(232,70,90,.1)` | `scale(.95)` | — | disparaît après ~4s ou nouvel enregistrement |
| Focus clavier (tous) | — | — | — | `outline: 2px solid var(--accent); outline-offset: 2px` | — |

## 5. Micro-animations

Toutes < 250ms, easing `cubic-bezier(.4,0,.2,1)` — jamais de "gadget", chaque animation confirme une action de saisie (le seul feedback que le gardien a, les yeux mi-tournés vers la vidéo).

```css
.result-btn, .chip, .gz-cell, .zone-polygon { transition: all .15s cubic-bezier(.4,0,.2,1); }
.confirm-banner { animation: slideUp .2s cubic-bezier(.4,0,.2,1); }
@keyframes slideUp { from { opacity:0; transform: translateY(8px);} to { opacity:1; transform: translateY(0);} }
.confirm-banner.pulse-once { animation: slideUp .2s, flashBg .4s ease-out; }
@keyframes flashBg { 0%{ background: var(--res-but-glow);} 100%{ background: var(--panel-2);} }
```
- Sélection d'une zone/résultat : transition de fond + bordure en 150ms, pas de rebond.
- Bandeau de confirmation : slide-up + flash bref de la couleur du résultat concerné (200-400ms), puis repos — signale "c'est enregistré" sans texte à relire.
- Aucune animation sur le chargement des heatmaps (Écran 4) au-delà d'un simple fade-in 150ms — ce sont des données consultées à tête reposée, pas un flux critique de vitesse.

## 6. Checklist contraste WCAG (fond `--bg`/`--panel` = très sombre)

| Paire | Ratio approx. | Usage | Verdict |
|---|---|---|---|
| `--t1` (#E8F0F5) sur `--bg` (#0B131B) | ~15.5:1 | Titres, texte primaire | ✅ AAA |
| `--t2` (#A9BECE) sur `--panel` (#131f2b) | ~7.8:1 | Corps, labels | ✅ AAA |
| `--t3` (#6b7f91) sur `--panel` | ~3.4:1 | Meta/tertiaire, jamais du texte porteur d'info critique | ✅ AA (large text only) — ne pas l'utiliser sous 14px pour du texte informatif |
| `--fenix-sky` (#5FA8D3) sur `--bg` | ~5.9:1 | Liens, accents | ✅ AA |
| `#0B131B` (texte foncé) sur `--res-but`/`--res-arret`/`--res-poteau` pleins | > 6:1 sur les 3 | Texte des boutons résultat sélectionnés | ✅ AA — utiliser texte foncé, pas blanc, sur ces fonds clairs saturés |
| `--danger` (#E8465A) sur `--bg` | ~4.6:1 | Bouton Annuler, erreurs | ✅ AA (texte ≥ 14px bold) |

Règle générale : jamais de texte blanc sur les couleurs de résultat pleines (elles sont trop claires) — toujours `#0B131B` ou `--panel` en texte par-dessus quand le bouton est à l'état sélectionné.
