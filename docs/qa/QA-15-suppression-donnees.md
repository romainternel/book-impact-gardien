# QA — STORY-15 : Suppression de données depuis l'app

## Critères validés ✅
- ✅ Bouton de suppression visible sur chaque ligne des 5 listes (gardiens, tireurs, joueurs, équipes, matchs).
- ✅ Confirmation native (`window.confirm`) déclenchée au tap, nommant l'élément — vérifié avec de vrais dialogues navigateur, pas simulés.
- ✅ Annuler la confirmation → aucune suppression (vérifié par relecture en base), aucune alerte d'erreur déclenchée (donc aucun appel réseau tenté).
- ✅ Confirmer sur un élément sans dépendance → suppression réelle en base, disparition immédiate de la liste sans rechargement réseau (joueur, gardien, match testés).
- ✅ Confirmer sur un élément avec dépendance (équipe avec un joueur) → message d'erreur explicite exact, élément resté dans la liste, aucune suppression.
- ✅ Supprimer le gardien actif efface bien `state.gardienId` et le `localStorage` correspondant.
- ✅ Le bouton de suppression ne déclenche jamais l'action de sélection de la ligne (`stopPropagation` là où la ligne principale est aussi cliquable — gardien, équipe, tireur).

## Cas limites testés
- Débloquer une suppression (retirer la dépendance) puis réessayer → succès, confirmant que le blocage FK n'est pas permanent, juste conditionnel.
- Libellé de confirmation pour un match (journée + deux équipes) correctement formé, pas juste un id.

## Bugs trouvés
Aucun.

## Verdict
**PASSED**
