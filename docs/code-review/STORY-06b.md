# Code Review — STORY-06b : Écran Saisie impact, robustesse

## Conformité Architecture
- Mitigations implémentées exactement conformes aux recommandations du Risk Analyst (`docs/risks/book-impact-gardien.md` P0-#1, P1-#2). ✅

## Réutilisation vs duplication
- `scheduleConfirmationDismiss(delayMs)` factorisée et réutilisée pour les deux minuteurs (confirmation 4s, annulation 2s) plutôt que deux blocs de code dupliqués.

## Scope
- Fichiers touchés : `js/screens/screen-impact.js` (couche ajoutée sur STORY-06a), `css/app.css`. Rien hors périmètre — pas de retouche à `zone-picker.js` ou aux fichiers vendor.

## Lisibilité et maintenabilité
- Le verrou `s.saving` est vérifié à l'entrée de chaque handler de clic pertinent (résultat, terrain, cage) plutôt que seulement dans `tryAutoSaveImpact()` — redondant en apparence mais plus sûr : ça bloque aussi un tap sur le bouton résultat pendant une sauvegarde en cours, cohérent avec `.impact-locked` qui grise visuellement toute la zone de saisie (pas seulement le dernier élément tapé).
- Distinction claire entre l'échec de sauvegarde (bandeau rouge, sélection conservée) et l'échec de préremplissage (`getLastImpact`, silencieux, déjà en place depuis STORY-06a) — le commentaire de code explicite pourquoi ces deux échecs sont traités différemment.

## Gestion d'erreurs
- `saveImpact()` : `finally`-like pattern (saving repassé à `false` dans les deux branches try/catch) — pas de risque de rester bloqué en état verrouillé après une erreur.
- `handleAnnulerDernierImpact()` : un échec de la suppression elle-même laisse le bandeau tel quel plutôt que de planter — l'utilisateur peut retaper "Annuler".

## Sécurité basique
Rien de nouveau — `deleteImpact` déjà audité en STORY-02 (policy delete existe sur `impacts`).

## Taille et complexité
- Story M conforme. La complexité ajoutée (verrou, minuteurs, bandeau à 3 états) est directement proportionnelle aux risques P0/P1 qu'elle mitige — pas de sur-ingénierie.

## Point vérifié en conditions réelles (le plus important de cette story)
- **Anti double-tap** : triple-clic rapide sur la même case de cage pendant une sauvegarde artificiellement ralentie (600ms) → **un seul** impact créé en base (vérifié par lecture directe, pas seulement par inspection du code).
- **Erreur réseau simulée** : `createImpact` remplacé temporairement par une fonction qui lève une exception → bandeau rouge affiché, sélection (`résultat`+`zone_tir`) intacte après l'échec, ré-essai réussi après restauration de la fonction réelle.
- **Annulation** : bouton "Annuler" → `deleteImpact` réellement appelé, ligne absente d'une relecture immédiate en base, bandeau transformé en "Impact annulé".

## Verdict
**APPROUVÉ**
