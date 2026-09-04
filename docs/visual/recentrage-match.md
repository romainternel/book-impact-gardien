# Visual — Recentrage Match (but réaliste, terrain réaliste, layout 3 colonnes)

Addendum à `docs/visual/book-impact-gardien.md` et `docs/visual/mode-match.md` — étend les tokens existants, n'en redéfinit aucun. Règle héritée du fichier `app.css` lui-même, à respecter strictement ici aussi : **jamais redéfinir** `--court-fill`, `--court-line`, `--court-line-dash`, `--court-goal`, `--bg3`, `--panel`, `--t3`, `--border`, `--fenix-sky` (tokens possédés par `zones.css`). Tout le réalisme visuel de ce document s'obtient en **encadrant** les rendus vendor (SVG terrain, grille cage), jamais en modifiant leurs couleurs internes.

## 1. Nouveaux tokens

```css
:root{
  /* Cadre du but — distinct des tokens de zone existants, jamais réutilisés pour autre chose */
  --goal-post: #E8EDF0;              /* poteaux — blanc cassé, cohérent avec --t1 mais dédié */
  --goal-post-stripe: var(--danger); /* liseré rouge alterné, réglementaire handball */
  --goal-net-line: rgba(232,237,240,.14); /* trame du filet, très discrète */
  --goal-shadow: rgba(0,0,0,.45);

  /* Surround du terrain — visible uniquement dans la marge ajoutée autour du SVG vendor */
  --pitch-surround: #0C1610;         /* vert-noir très sombre, cohérent avec --bg général */
  --pitch-surround-line: rgba(123,167,194,.2); /* reprend --border en plus discret */
  --pitch-vignette: rgba(0,0,0,.35);
}
```

## 2. Cage réaliste — habillage du conteneur, jamais de la grille elle-même

La grille `.goal-zone-grid.gz-big` (9 cellules, `data-gz`, logique inchangée) est enveloppée dans un nouveau conteneur `.goal-frame` (markup ajouté dans `screen-saisie-match.js`, pas dans le fichier vendor) :

```css
.goal-frame{
  position: relative;
  padding: 14px 10px 4px;
  background: linear-gradient(180deg, #0d1620 0%, var(--panel-2) 100%);
  border-radius: var(--radius-l) var(--radius-l) 4px 4px;
  box-shadow: 0 10px 24px -12px var(--goal-shadow);
}
/* Poteaux : deux bandes verticales aux bords du cadre */
.goal-frame::before, .goal-frame::after{
  content: "";
  position: absolute;
  top: 6px; bottom: 0;
  width: 6px;
  background: repeating-linear-gradient(-45deg, var(--goal-post) 0 6px, var(--goal-post-stripe) 6px 12px);
  border-radius: 3px;
  box-shadow: 0 0 6px rgba(232,237,240,.25);
}
.goal-frame::before{ left: 4px; }
.goal-frame::after{ right: 4px; }
/* Barre transversale */
.goal-frame-bar{
  height: 6px;
  margin: 0 4px 8px;
  background: repeating-linear-gradient(90deg, var(--goal-post) 0 14px, var(--goal-post-stripe) 14px 28px);
  border-radius: 3px;
}
/* Trame de filet — dessinée derrière la grille, très subtile pour ne jamais nuire à la lisibilité des glyphes */
.goal-zone-grid.gz-big{
  position: relative;
  background-image:
    repeating-linear-gradient(45deg, var(--goal-net-line) 0 1px, transparent 1px 9px),
    repeating-linear-gradient(-45deg, var(--goal-net-line) 0 1px, transparent 1px 9px);
  background-color: var(--bg3); /* fond de cellule non sélectionnée — hérité, inchangé */
  box-shadow: inset 0 8px 16px -8px rgba(0,0,0,.6); /* profondeur du filet, effet "creux" */
}
/* Ombre au sol sous le but, pour l'ancrer visuellement au-dessus du terrain */
.goal-frame-ground-shadow{
  height: 8px;
  margin: 6px 20px 0;
  background: radial-gradient(ellipse at center, rgba(0,0,0,.4) 0%, transparent 75%);
}
```
Le comportement des cellules (`.gz-cell`, `.gz-cell.active`) n'est **pas modifié** — la stripe/le filet passent visuellement derrière, `z-index` naturel (pas de `z-index` explicite nécessaire, la grille est un enfant direct sans position:absolute qui la ferait passer dessous).

## 3. Terrain réaliste — marge et cadrage, jamais le fill SVG

`.court-svg-bg` est en `position:absolute; inset:0` dans `.court-pick` (zones.css, vendu, inchangé). Ajouter du `padding` à `.court-pick` depuis `app.css` fait naturellement apparaître une marge visible entre le bord du conteneur et le SVG (l'`inset:0` du SVG se recale sur la boîte de padding) — c'est ce mécanisme, pas une redéfinition de token, qui permet le cadrage réaliste :

```css
.screen-saisie-match .court-pick{
  padding: 10px;
  background: radial-gradient(120% 90% at 50% 0%, #142218 0%, var(--pitch-surround) 70%);
  border-radius: var(--radius-l);
  box-shadow:
    inset 0 0 0 1px var(--pitch-surround-line),
    0 14px 28px -16px rgba(0,0,0,.6);
}
/* Vignette légère au-dessus du SVG (pointer-events:none pour ne jamais intercepter le tap) */
.screen-saisie-match .court-pick::after{
  content: "";
  position: absolute;
  inset: 10px; /* aligné sur le padding, épouse le SVG */
  pointer-events: none;
  box-shadow: inset 0 18px 30px -20px var(--pitch-vignette), inset 0 -10px 20px -16px var(--pitch-vignette);
  border-radius: 6px;
}
/* Texture "gazon tondu" très discrète, visible uniquement dans la marge autour du SVG */
.screen-saisie-match .court-pick{
  background-image: repeating-linear-gradient(100grad, rgba(255,255,255,.015) 0 18px, transparent 18px 36px);
}
```
Le SVG vendu (lignes, zones, couleurs de zone) reste strictement inchangé — seul l'entourage (marge, vignette, gazon en périphérie) crée l'impression de terrain réel. Le hit-testing des 11 zones (y compris les zones concaves 69MG/69MC/69MD, cf. architecture §5 du document de base) n'est en rien affecté : le SVG conserve exactement sa taille et sa position relative, seul le conteneur grandit visuellement autour de lui.

## 4. Layout 3 colonnes (≥ 760px)

```css
.screen-saisie-match{
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 760px){
  .screen-saisie-match{
    max-width: 920px;
    margin: 0 auto;
    grid-template-columns: 180px 1fr 180px;
    align-items: start;
  }
  .screen-saisie-match .app-header,
  .screen-saisie-match .confirm-banner{ grid-column: 1 / -1; } /* pleine largeur, cf. Design §4 */
  .screen-saisie-match .team-roster-a{ grid-column: 1; grid-row: 2; }
  .screen-saisie-match .saisie-match-center{ grid-column: 2; grid-row: 2; }
  .screen-saisie-match .team-roster-b{ grid-column: 3; grid-row: 2; }
}
```
`#app` (plafonné à 480px partout ailleurs) est élargi spécifiquement sur cet écran via `.screen-saisie-match{ max-width: 920px }` en cascade — décision technique détaillée par l'Architect, aucune autre page n'est affectée.

### Colonnes rosters en layout large
```css
@media (min-width: 760px){
  .team-roster{
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: var(--radius-m);
    padding: 12px 10px;
    border-top: 3px solid var(--team-color, var(--border)); /* cohérent avec le style existant en layout empilé */
  }
}
```

## 5. États interactifs
- `.player-btn:hover` (pertinent uniquement en layout large, souris) : `background: var(--panel-2); border-color: var(--team-color);` transition `.15s cubic-bezier(.4,0,.2,1)` — cohérent avec les autres composants de l'app.
- `.gz-cell:hover` (layout large) : légère éclaircie `background: rgba(123,167,194,.18)`, même durée.
- Pas de nouvelle micro-animation sur le tap lui-même (le comportement de sélection but/cage/terrain reste géré par les classes `.active` déjà existantes) — l'effort visuel porte sur le décor statique (but, terrain), pas sur de nouvelles transitions.

## 6. Checklist contraste
- `--goal-post` (#E8EDF0) sur `--panel-2` (#17222D) : ratio ~11.8:1, très large marge AAA.
- `--goal-post-stripe` (= `--danger`, #E8465A) sur `--panel-2` : ratio ~4.9:1, conforme AA pour élément décoratif non textuel (pas de texte sur ce fond).
- Texture filet (`--goal-net-line`, opacité .14) : volontairement sous le seuil de lisibilité en tant qu'élément autonome — vérifié à ne jamais réduire le contraste des glyphes `.gz-cell` existants (déjà validés) en dessous de leur ratio actuel, puisqu'elle est positionnée en `background-image` derrière le contenu, pas par-dessus.
- Vignette terrain (`--pitch-vignette`, opacité .35, `pointer-events:none`) : n'affecte aucun texte, uniquement le fond du SVG — aucun impact sur le contraste des labels de zone déjà validés dans le document de base.
