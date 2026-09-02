# QA — STORY-06b : Écran Saisie impact, robustesse

## Critères validés ✅
- ✅ Triple-tap rapide sur la même case cage pendant une écriture ralentie artificiellement → **un seul** impact créé (vérifié par lecture directe en base, pas une estimation).
- ✅ Échec d'écriture simulé (`createImpact` remplacé par une fonction qui lève une exception) → bandeau rouge explicite affiché, sélection `Résultat`/`Zone de tir`/`Zone de cage` **conservée** après l'échec.
- ✅ Bouton "Réessayer" du bandeau d'erreur retente l'écriture sans que l'utilisateur retape quoi que ce soit — succès confirmé après restauration de la fonction réelle.
- ✅ Bandeau de confirmation "✓ Impact enregistré — {résultat}, {zone_tir} → {zone_cage}" affiché immédiatement après un enregistrement réussi, avec bouton "Annuler".
- ✅ "Annuler" supprime réellement l'impact en base (vérifié par relecture immédiate — absent), bandeau transformé en "Impact annulé".
- ✅ Le bandeau disparaît après son délai (4s confirmation / 2s annulation) — comportement du minuteur vérifié directement dans le code et par observation (le bandeau n'était plus présent lors d'une vérification différée).

## Cas limites testés
- Annulation appelée une seconde fois sur un impact déjà annulé : `handleAnnulerDernierImpact` retourne immédiatement (`s.lastSaved.cancelled` déjà vrai) — pas de double suppression tentée.
- Verrouillage visuel (`impact-locked`, `opacity:.7; pointer-events:none`) appliqué à l'ensemble Résultat+Zone de tir+Zone de cage pendant la sauvegarde, pas seulement à l'élément tapé en dernier — cohérent avec le critère d'acceptation.

## Régression
- Flow cœur de STORY-06a (2/3 taps, préremplissage type/main, réinitialisation post-save) revérifié fonctionnel avec la couche de robustesse ajoutée par-dessus.
- `js/vendor/*` et `css/zones.css` toujours identiques à l'export.

## Bugs trouvés
Aucun.

## Verdict
**PASSED**
