# STORY-14b — Écran Saisie Match : robustesse

**En tant que** utilisateur qui tague un match complet en direct,
**Je veux** être protégé d'un double-enregistrement, prévenu clairement en cas d'échec, et pouvoir annuler mon dernier tir,
**Afin de** faire confiance à la trace du match sans avoir à la vérifier après coup.

## Contexte technique
- Zone concernée : `js/screens/screen-saisie-match.js` (couche ajoutée par-dessus STORY-14a).
- Mitigation directe du risque #2 (`docs/risks/mode-match.md`) : **répliquer exactement** le pattern déjà validé sur `screen-impact.js` (STORY-06b) — verrouillage pendant l'écriture (`s.saving`), bandeau d'erreur qui conserve la sélection (résultat + zones + joueur), bandeau de confirmation + bouton Annuler qui supprime réellement l'impact (`deleteImpact`, déjà existante).
- Ne pas réinventer le pattern — copier la structure (états, minuteurs `scheduleConfirmationDismiss`) de `screen-impact.js`, adaptée pour inclure le joueur/l'équipe dans le libellé du bandeau ("✓ But — Antoine D., 6MC → HC").

## Critères d'acceptation
- [ ] Triple-tap rapide sur la même zone de cage (ou le même joueur) pendant une écriture ralentie artificiellement → un seul impact créé (même test que STORY-06b, reproduit sur ce nouvel écran).
- [ ] Échec d'écriture simulé → bandeau rouge, sélection (résultat + zones + **joueur**) conservée, bouton Réessayer fonctionnel.
- [ ] Bandeau de confirmation affiche le joueur et l'équipe concernés, bouton Annuler supprime réellement l'impact en base (vérifié par relecture).
- [ ] Le bandeau se réinitialise correctement entre deux tirs successifs (pas de fuite d'état entre un `but` d'un joueur et le `non_but` suivant d'un autre).

## Hors scope
- Toute nouvelle fonctionnalité au-delà de la parité avec STORY-06b.

## Dépend de
STORY-14a

## Taille
M
