# Risques — Mode Match (équipes, joueurs, saisie match complet)

## Tableau des risques

| # | Risque | Probabilité | Impact | Recommandation |
|---|---|---|---|---|
| 1 | **`non_but` mal affiché dans le Book** — `resultatLabel()` (screen-impact.js) et les classes CSS `.badge-*` (screen-book.js/app.css) ne connaissent que 4 valeurs de résultat. Un impact `non_but` saisi en mode Match apparaîtra dans l'historique du Book (décision produit explicite) mais son badge affichera le texte brut "non_but" sans couleur ni libellé propre. | Élevée (se produit à chaque tir non-but du mode Match, dès le premier match saisi) | Faible (cosmétique, aucune corruption de donnée) | Ajouter `non_but: "Non-but"` à la table de labels et `.badge-non_but` (réutilise `--res-horscadre`, cf. Visual Crafter) — critère d'acceptation explicite sur la story qui introduit `non_but`. |
| 2 | **Échec d'écriture silencieux sur l'écran de saisie match** — même risque P0 déjà mitigé sur l'écran de saisie impact (STORY-06b), pas encore traité pour ce nouvel écran. | Moyenne | Critique | Répliquer exactement le pattern déjà validé (verrouillage anti double-tap, bandeau d'erreur explicite, sélection conservée) — ne pas réinventer, copier l'approche de `screen-impact.js`. |
| 3 | **RLS ouverte en lecture/écriture sans suppression** sur `equipes`/`matchs` — cohérent avec le choix déjà fait sur `gardiens`/`tireurs`, mais une équipe ou un match créé par erreur (faute de frappe dans le nom) ne peut être corrigé que par SQL direct, pas depuis l'app. | Moyenne (erreurs de saisie humaines fréquentes) | Faible-Moyen (gênant, pas destructeur) | Accepté pour le MVP de cette extension (cohérent avec la dette déjà assumée sur gardiens/tireurs) — à revisiter si l'usage réel montre que les corrections manuelles deviennent fréquentes. |
| 4 | **Homonymes entre équipes** — un joueur "Antoine D." peut exister dans deux équipes différentes ; le Book ne désambiguïse pas au-delà de l'affichage club/poste déjà existant. | Faible | Faible | Le club est déjà affiché à côté du nom dans les résultats de recherche existants (STORY-04) — suffisant pour le MVP, pas de développement supplémentaire nécessaire. |
| 5 | **Contrainte `journee` par regex trop rigide** si l'app doit un jour gérer des matchs hors championnat (coupe, amical) — déjà noté par l'Architect comme accepté/hors scope explicite. | Faible | Faible | Aucune action avant que le besoin réel se présente (cf. critère de bascule architecture §8). |
| 6 | **Double FK `matchs → equipes` mal géré côté requête** — si le Developer utilise `select("*, equipes(nom)")` sans désambiguïser, la requête échoue ou renvoie une erreur PostgREST peu claire, potentiellement découvert tard (en test seulement). | Moyenne (piège classique PostgREST, facile à rater) | Moyen (bloque l'écran Matchs/Sélection Match jusqu'à correction) | Déjà documenté précisément par l'Architect avec la syntaxe exacte à utiliser (`equipes!matchs_equipe_a_id_fkey`) — le Developer doit vérifier le nom réel de la contrainte après création de la table avant d'écrire `api.js`. |

## Classement
- **P1** — #1 (affichage non_but), #2 (robustesse écriture), #6 (double FK)
- **P2** — #3 (RLS sans correction)
- **P3** — #4 (homonymes), #5 (regex journée)

## Mitigations P1 → critères d'acceptation

**#1 → critère d'acceptation sur la story qui introduit `non_but` côté Book** :
> `resultatLabel('non_but')` retourne "Non-but" (pas la valeur brute) ; le badge historique du Book affiche une couleur cohérente (`--res-horscadre`) pour ce résultat, testé en créant un impact `non_but` en mode Match et en vérifiant son rendu dans le Book du joueur concerné.

**#2 → critère d'acceptation sur la story de robustesse de l'écran de saisie match** :
> Mêmes critères que STORY-06b (verrouillage anti double-tap, bandeau d'erreur qui conserve la sélection, annulation du dernier impact) — vérifiés spécifiquement sur ce nouvel écran, pas supposés hérités automatiquement du fait de la ressemblance avec l'écran existant.

**#6 → critère d'acceptation sur la story Matchs/Sélection Match** :
> Le nom exact des contraintes FK (`matchs_equipe_a_id_fkey`, `matchs_equipe_b_id_fkey`) est vérifié après création de la table (via l'éditeur Supabase ou `\d matchs`) avant d'écrire la requête d'embedding — documenté dans le commentaire du code si le nom généré diffère de la convention par défaut.
