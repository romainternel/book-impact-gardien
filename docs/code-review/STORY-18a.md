# Code Review — STORY-18a : Réordonnancement de l'écran de saisie match

## Conformité architecture
Diff conforme à `docs/arch/recentrage-match.md` §2.4-2.5 :
- Ordre Résultat → Zone de cage → Zone de tir respecté.
- `.saisie-match-center` regroupe les 3 sections, les deux `.team-roster` sont des enfants directs de `.screen-saisie-match` (sortis de `.team-rosters-row`), exactement comme prescrit.
- `body:has(.screen-saisie-match) #app{ max-width: 920px; }` repris à l'identique de l'architecture.
- `renderTeamRoster()`, `bindScreenSaisieMatch()`, `saveMatchImpact()`, `tryAutoSaveMatch()`, `handleAnnulerDernierImpactMatch()` : zéro modification, confirmé par diff — conforme au périmètre annoncé par la story ("restructuration du HTML uniquement").
- `js/vendor/*`, `css/zones.css`, `js/zone-picker.js` : non touchés.

## Écart avec le document Visual — **Corrigé**
`docs/visual/recentrage-match.md` §4 ("Colonnes rosters en layout large") spécifie explicitement pour la règle `≥760px` :
```css
.team-roster{
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-m);
  padding: 12px 10px;
  border-top: 3px solid var(--team-color, var(--border)); /* cohérent avec le style existant en layout empilé */
}
```
L'implémentation (`css/app.css:466-471`) reprend tout sauf la ligne `border-top`. Or le raccourci `border: 1px solid var(--border)` réinitialise **les 4 côtés**, y compris `border-top` — et la règle `.screen-saisie-match .team-roster` (spécificité 0,0,2,0) est plus spécifique que la règle de base `.team-roster{ border-top: 3px solid var(--team-color,...) }` (0,0,1,0, définie plus haut dans le fichier pour STORY-14a), donc elle l'emporte quel que soit l'ordre des règles. **Conséquence réelle observée en navigateur (capture à 1000px de large)** : le liseré de couleur d'équipe en haut de chaque colonne roster (bleu pour BILLERE, orange pour FENIX), présent et correct à tous les autres paliers (<760px), disparaît silencieusement à partir de 760px — seule la couleur du texte du libellé d'équipe reste distinctive. Écart net avec la spec écrite du Visual Crafter.

**Correction appliquée** : ajout de `border-top: 3px solid var(--team-color, var(--border));` à la règle `≥760px` de `.team-roster`, conforme à `docs/visual/recentrage-match.md` §4. Revérifié en direct (Playwright, capture à 1000px) : liseré bleu (BILLERE) et orange (FENIX) de nouveau visible en haut de chaque colonne.

## Scope
Diff limité à `js/screens/screen-saisie-match.js` et `css/app.css`, conforme au périmètre de la story. Deux nettoyages hors liste explicite mais directement causés par le changement : retrait de `.team-rosters-row` (wrapper disparu du markup, classe orpheline) et de `.impact-locked` (dernier point d'usage remplacé par `.match-saving`) — cohérent avec le précédent déjà approuvé en STORY-17.

## Choix technique notable : `.match-saving` plutôt que `.impact-locked` direct
La story ne prescrit pas de mécanisme précis pour le verrouillage anti double-tap, seulement un résultat fonctionnel inchangé. Le Developer a introduit une classe d'état sur le conteneur racine (`.match-saving`) avec sélecteurs descendants, plutôt que d'envelopper chaque section dans un wrapper `.impact-locked` comme avant — nécessaire car un wrapper autour des rosters aurait cassé le placement en grille CSS (seuls les enfants directs de `.screen-saisie-match` participent au placement). Effet visuel/fonctionnel strictement équivalent (`opacity:.7; pointer-events:none`), header et bandeau de confirmation restent interactifs pendant la sauvegarde comme avant. Bonne décision, pas de remarque.

## Réutilisation vs duplication
Aucune duplication. `renderTeamRoster()` réutilisée telle quelle aux deux points d'appel.

## Sécurité basique
Aucune surface touchée — restructuration HTML/CSS pure, aucune requête Supabase modifiée.

## Vérification des critères d'acceptation (lecture statique + vérification live du Developer)
- [x] Ordre Résultat → Zone de cage → Zone de tir
- [x] < 480px : pile verticale complète (vérifié à 375px)
- [x] 480-759px : rosters en rangée 2 colonnes sous le bloc central (vérifié à 600px)
- [x] ≥ 760px : rosters en colonnes latérales, `#app` élargi (vérifié à 1000px)
- [x] Distinction visuelle par couleur d'équipe (liseré) à ≥760px — corrigée, revérifiée en direct
- [x] Comportement fonctionnel inchangé (vérifié en direct : auto-save, bandeau de confirmation, cycle complet contre le backend réel)
- [ ] Tap sur les 11 zones terrain / 9 zones cage aux 3 paliers — non vérifié exhaustivement par le Code Reviewer (un seul tap testé en direct par le Developer, zones concaves à confirmer explicitement par le QA/E2E)
- [x] Bandeau de confirmation/erreur pleine largeur y compris en layout 3 colonnes (`grid-column:1/-1` confirmé par lecture + capture)

## Verdict
**APPROUVÉ** — écart avec le document Visual identifié et corrigé dans le cadre de cette revue (cf. ci-dessus).

## Addendum post-QA
Le QA a détecté, en testant les bornes exactes des paliers responsive (479/480/759/760px plutôt qu'une largeur médiane par palier), une zone morte à très exactement 759px de large où aucune des deux media queries (`max-width:759px` / `min-width:760px`) ne s'appliquait, faisant retomber l'écran en layout mobile 1 colonne. Corrigé (`max-width:759px` → `max-width:759.98px`) et revérifié — cf. `docs/qa/QA-18a-reordonnancement-saisie-match.md`. Ce type d'écart pixel-exact entre deux bornes entières adjacentes n'est pas détectable par une revue statique du code ; à garder en tête pour les prochaines stories introduisant des paires de media queries `max-width`/`min-width` adjacentes : préférer systématiquement une marge `.98px` sur la borne basse plutôt que deux entiers consécutifs.
