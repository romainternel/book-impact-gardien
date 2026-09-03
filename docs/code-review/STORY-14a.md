# Code Review — STORY-14a : Écran Saisie Match, boucle cœur

## Conformité Architecture
- Réutilise `zone-picker.js` (`renderCourtZonePicker`/`bindCourtZonePicker`) et `renderGoalZoneGrid` (vendor) tels quels, exactement comme `docs/arch/mode-match.md` le prescrit. Aucun fichier vendor touché. ✅
- `impacts.match_id` correctement renseigné sur chaque enregistrement — vérifié en base, pas seulement dans le code. ✅
- `resultat = 'non_but'` traité comme `hors_cadre` vis-à-vis de la zone de cage (pas requise) — conforme à `docs/arch/mode-match.md` §3, vérifié en conditions réelles (cage verrouillée, `zone_cage: null` en base).

## Mitigation du risque #1 — vérifiée, pas supposée
`RESULTAT_OPTIONS` (screen-impact.js, partagée avec `resultatLabel()`) étendue avec `non_but: "Non-but"`. `.badge-non_but` ajoutée dans `app.css`. Vérifié en conditions réelles : un impact `non_but` saisi en mode Match apparaît dans le Book du joueur avec le badge "Non-but" correctement libellé et coloré (`--res-horscadre`, neutre) — pas la valeur brute `non_but` en texte.

## Réutilisation vs duplication
- `.result-buttons-2` créée comme variante minimale plutôt que de forcer `.result-buttons` (grille 2×2/4 colonnes) à s'adapter à un cas à 2 boutons — évite un `!important` ou une media query supplémentaire. Bon compromis.
- `.team-roster`/`.player-btn`/`--team-a`/`--team-b` implémentés exactement conformes à `docs/visual/mode-match.md` §4, qui les avait déjà spécifiés en amont (Visual Crafter) mais jamais codés avant cette story — premier vrai consommateur.

## Scope
- Fichiers touchés : `js/screens/screen-saisie-match.js` (nouveau), `js/screens/screen-impact.js` (1 ligne, extension `RESULTAT_OPTIONS`), `index.html`, `css/app.css`. Conforme — pas de verrouillage/bandeau/annulation implémentés (STORY-14b), pas de chips type/main (absents du design de cet écran par décision PM).

## Lisibilité et maintenabilité
- `tryAutoSaveMatch()` isolé, règle claire (`resultat === "but"` requiert `zoneCage`) — même lisibilité que `tryAutoSaveImpact()` de `screen-impact.js`, cohérence de style entre les deux écrans de saisie.

## Gestion d'erreurs
- Échec d'écriture : `console.error` sans réinitialiser la sélection — exactement le même niveau minimal que STORY-06a (avant robustesse), cohérent avec le split explicite 14a/14b.
- **Observation de test, pas un bug** : un `gardien_id` périmé (référence un gardien supprimé de la base) déclenche une violation de contrainte FK (`23503`) correctement catchée et loggée sans planter l'écran — comportement défensif qui fonctionne comme prévu, découvert fortuitement pendant les tests (donnée de session de test invalide, pas un défaut du code).

## Sécurité basique
Rien de nouveau — `createImpact`/`getImpactsForTireur` déjà auditées.

## Taille et complexité
Story L conforme à l'estimation — c'est l'écran le plus dense du mode Match, complexité justifiée (deux systèmes de zones + double roster + résultat conditionnel).

## Point vérifié en conditions réelles
Flow `but` complet (résultat + zone_tir 69MC + zone_cage HC + joueur équipe A) → impact créé avec `match_id` correct. Flow `non_but` complet (résultat + zone_tir AILG + joueur équipe B, cage restée verrouillée) → impact créé avec `zone_cage: null`. Les deux impacts confirmés visibles dans le Book du joueur concerné (zone de tir, badge historique, ratio 0/1 correct sur la heatmap).

## Verdict
**APPROUVÉ**
