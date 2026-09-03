# QA — STORY-14a : Écran Saisie Match, boucle cœur

## Critères validés ✅
- ✅ Tir `non_but` enregistré dès Résultat + Zone de tir + Joueur (pas de zone de cage requise) — vérifié : `zone_cage: null` en base, cage restée grisée à l'écran.
- ✅ Tir `but` enregistré dès Résultat + Zone de tir + Zone de cage + Joueur.
- ✅ Sélection d'un joueur d'une équipe puis d'un joueur de l'autre remplace correctement la sélection (un seul joueur actif à la fois, tous côtés confondus) — vérifié implicitement par la réussite des deux flows successifs sur des équipes différentes.
- ✅ Aucun enregistrement prématuré tant que le joueur n'est pas sélectionné (résultat+zones seuls ne suffisent pas) — confirmé par la séquence de taps observée (l'écriture n'intervient qu'au tap joueur, dernier de la séquence dans les deux tests).
- ✅ `match_id` correct sur l'impact créé.
- ✅ **Critère explicite du risque #1** : un impact `non_but` créé en mode Match apparaît dans le Book du joueur avec un badge "Non-but" correctement coloré (`--res-horscadre`), pas le texte brut.
- ✅ Un impact `but` apparaît dans le Book avec sa zone de tir/cage correcte, compte dans la heatmap (0/1 correctement affiché sur la zone AILG pour le tir non_but).

## Cas limites testés
- Référence `gardien_id` invalide (donnée de test périmée) : erreur FK proprement catchée, pas de crash — comportement défensif confirmé fonctionnel, bien que découvert par accident plutôt que par un scénario de test prémédité.

## Régression
- Écrans Book/heatmaps (STORY-07a/07b) non modifiés, consomment correctement les nouveaux impacts `match_id`/`non_but` sans adaptation — confirmé par observation directe.

## Bugs trouvés
Aucun (le seul incident rencontré — gardien de test périmé — n'est pas un bug du produit, cf. Code Review).

## Verdict
**PASSED**
