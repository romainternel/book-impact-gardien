# Code Review — STORY-14b : Écran Saisie Match, robustesse

## Conformité Architecture
- Réplique exacte du pattern déjà validé sur `screen-impact.js` (STORY-06b) — même structure d'état (`saving`/`errorMessage`/`lastSaved`), mêmes minuteurs, mêmes classes CSS réutilisées sans en créer de nouvelles. Conforme à la mitigation explicite du risque #2 ("ne pas réinventer, copier l'approche"). ✅

## Réutilisation vs duplication
- Zéro nouveau CSS — `.confirm-banner`, `.impact-locked`, `.btn-cancel-impact` tous réutilisés tels quels depuis STORY-06b.
- `findJoueurNom()` factorisée pour retrouver le nom depuis les deux rosters (équipe A + équipe B concaténées) — évite de dupliquer la recherche à chaque usage du bandeau.

## Scope
- Fichier touché : `js/screens/screen-saisie-match.js` uniquement (couche ajoutée sur STORY-14a). Conforme.

## Lisibilité et maintenabilité
- Le bandeau de confirmation inclut le nom du joueur en plus du résultat/zones, adaptant le libellé de STORY-06b à ce contexte à deux équipes — personnalisation minimale et justifiée, pas une divergence de pattern.

## Gestion d'erreurs
- Verrou `s.saving` vérifié à l'entrée de chaque handler pertinent (résultat, terrain, cage, joueur) — cohérent avec `screen-impact.js`, protège aussi contre un tap sur "joueur" pendant une écriture en cours (spécifique à cet écran, absent de l'original puisqu'il n'a pas de sélection joueur).

## Sécurité basique
Rien de nouveau — `deleteImpact` déjà audité en STORY-02.

## Taille et complexité
Story M conforme.

## Point vérifié en conditions réelles
- **Anti double-tap** : triple-tap sur le bouton joueur pendant une écriture ralentie (600ms) → un seul impact créé.
- **Bandeau de confirmation** : libellé exact "✓ But — {nom du joueur}, AILD → BG" avec bouton Annuler.
- **Annulation** : `deleteImpact` réellement appelé, absence confirmée par relecture, bandeau transformé en "Impact annulé".
- **Erreur + retry** : bandeau rouge, sélection (résultat + zone_tir + joueur) intégralement conservée, ré-essai réussi après restauration de la fonction réelle.

## Verdict
**APPROUVÉ**
