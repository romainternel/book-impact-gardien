# STORY-06b — Écran Saisie impact : robustesse (anti double-tap, erreurs, annulation)

**En tant que** gardien qui tape vite pendant un visionnage,
**Je veux** être protégé d'un double-enregistrement accidentel, être prévenu clairement si l'enregistrement échoue, et pouvoir annuler mon dernier tir en cas d'erreur de frappe,
**Afin de** faire confiance à mon book sans avoir à le vérifier ligne par ligne après coup.

## Contexte technique
- Zone concernée : `js/screens/screen-impact.js` (couche ajoutée par-dessus STORY-06a).
- Mitigations directement issues de `docs/risks/book-impact-gardien.md` : P0-#1 (échec silencieux) et P1-#2 (double-tap).
- Bandeau de confirmation + bouton Annuler : maquette `docs/design/book-impact-gardien.md` Écran 3, animation `docs/visual/book-impact-gardien.md` §5 (`slideUp` + `flashBg`).
- `deleteImpact(id)` de `api.js` (STORY-02) pour l'annulation — supprime réellement en base, pas juste visuellement.

## Critères d'acceptation
- [ ] Entre le tap qui déclenche l'écriture (2e ou 3e tap selon le résultat) et la confirmation retour de Supabase, la zone qui vient d'être tapée est verrouillée (pas d'effet sur un second tap pendant cette fenêtre) — vérifié en tapant deux fois très rapidement sur la même case et en confirmant qu'un seul impact est créé en base.
- [ ] Si `createImpact()` échoue (réseau coupé, testé en désactivant le réseau du navigateur), l'écran affiche un état d'erreur explicite (bandeau rouge) et **conserve** la sélection Résultat/Zone de tir/Zone de cage en cours — un nouveau tap sur "réessayer" ou directement sur la zone de cage retente l'écriture sans tout retaper.
- [ ] Après un enregistrement réussi, un bandeau "✓ Impact enregistré — {résultat}, {zone_tir} → {zone_cage}" apparaît avec un bouton "Annuler" visible ~4s (ou jusqu'au prochain enregistrement, qui le remplace).
- [ ] Tap sur "Annuler" → `deleteImpact()` est appelé avec l'id du dernier impact, l'impact disparaît réellement de la base (vérifié par lecture directe), et le bandeau se transforme en confirmation d'annulation.
- [ ] Si l'app est fermée/rouverte, le bouton Annuler n'est plus disponible pour un impact d'une session précédente (le bandeau ne survit pas à un rechargement de page — pas de persistance de "dernier impact annulable" en `localStorage`, c'est un état volatile de session).

## Hors scope
- Annulation de plus d'un impact en arrière (seulement le tout dernier, cf. PRD hors scope).
- Historique des annulations.

## Dépend de
STORY-06a

## Taille
M
