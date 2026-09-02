# Risques — Book Impact Gardien

## Tableau des risques

| # | Risque | Probabilité | Impact | Recommandation |
|---|---|---|---|---|
| 1 | **Échec d'écriture silencieux** — le gardien sature en usage réel (wifi de gymnase instable), `createImpact()` échoue mais rien ne le signale clairement → l'écran se réinitialise comme si tout allait bien, le tir est perdu et le gardien ne le sait jamais. | Moyenne | Critique | Bloquant : état d'erreur explicite (déjà esquissé par le Designer) qui **ne réinitialise pas** la sélection en cours ; retenter sans retaper. |
| 2 | **Double-enregistrement par double-tap** — le tap sur la cage déclenche l'écriture immédiate (design validé) ; un tap rapide/accidentel répété pendant la saisie pressée crée deux impacts identiques pour un seul tir réel. Le bouton "Annuler" ne supprime que le tout dernier — un doublon silencieux reste possible. | Moyenne-Élevée | Moyen | Verrouiller la zone de cage (et le terrain si `hors_cadre`) dès le premier tap jusqu'à confirmation retour Supabase — fenêtre de verrouillage courte (200-500ms) mais systématique. |
| 3 | **RLS ouverte en `for all` sur les 3 tables** — n'importe qui trouvant l'URL/clé anon Supabase (visibles par nature dans le JS livré au navigateur, repo GitHub Pages généralement public) peut lire, modifier ou **supprimer** l'intégralité des données de tous les gardiens. `delete` généralisé sur `gardiens`/`tireurs` n'est même pas un besoin produit — c'est une porte ouverte inutile. | Faible-Moyenne | Critique (perte totale de données sans aucune barrière) | Resserrer les policies au strict nécessaire par opération (voir §Mitigation P1) plutôt qu'un `for all using(true)` générique. |
| 4 | **Validation uniquement côté contrainte SQL** — la cohérence `zone_cage` vs `resultat` (contrainte `zone_cage_coherente` posée par l'Architect) n'est vérifiée qu'à l'écriture en base. Si un rejet SQL survient (race condition sur un changement rapide de résultat juste avant le tap cage), il retombe sur le risque #1 s'il n'est pas traité comme une erreur d'écriture à part entière. | Faible | Moyen | Valider côté client avant l'appel API (miroir de la contrainte SQL) **et** traiter tout rejet serveur avec le même état d'erreur explicite que le risque #1. |
| 5 | **`main` non renseignée fausse silencieusement la stat "main dominante"** — le champ est optionnel dans le flow de saisie ; si souvent laissé vide, la stat calcule un pourcentage sur un échantillon partiel sans le signaler. | Moyenne | Faible | Afficher "sur X/N tirs avec main connue" plutôt qu'un pourcentage brut qui sous-entend une couverture à 100%. |
| 6 | **Penalty (7m) sans `zone_tir` significative** — un 7m n'a pas de position réelle sur le terrain (position fixe au point de penalty), mais le flow actuel force quand même un tap sur une des 11 zones, polluant légèrement l'agrégat "zone de tir" du Book. | Élevée (à chaque penalty) | Faible-Moyen | Décision produit à trancher rapidement : exclure les tirs `type_tir = 'penalty'` de l'agrégat zone de tir du Book, ou leur assigner conventionnellement `9MC`. Impact limité tant que c'est tranché explicitement plutôt que laissé implicite. |
| 7 | **But sur poteau rentrant** — ambiguïté de saisie entre `resultat = but` et `resultat = poteau` pour un tir qui touche le poteau puis rentre. Le modèle ne porte qu'une seule valeur. | Faible | Faible | Convention d'usage à documenter (ex. toujours prioriser `but`) — pas un sujet de développement. |
| 8 | **Book sans pagination à forte volumétrie** — le Book charge tout l'historique d'un tireur en un appel (décision Designer explicite). Dégradation progressive au-delà de plusieurs saisons cumulées par tireur. | Faible à l'échelle MVP | Faible-Moyen | Déjà couvert par le critère de bascule de l'Architecte (vue Postgres agrégée au-delà de quelques milliers d'impacts) — aucune action avant ce seuil. |

## Classement

- **P0** — #1 (échec d'écriture silencieux)
- **P1** — #2 (double-tap), #3 (RLS trop permissive)
- **P2** — #4 (validation client), #5 (main non renseignée), #6 (penalty sans zone)
- **P3** — #7 (poteau rentrant), #8 (volumétrie Book)

## Mitigations P0/P1 → critères d'acceptation ou stories dédiées

**P0-#1 → critère d'acceptation sur la story "Saisie impact"** :
> Si l'écriture Supabase échoue (réseau ou rejet serveur), l'écran affiche un état d'erreur explicite et **ne réinitialise pas** la sélection Résultat/Zone de tir/Zone de cage en cours — le gardien peut retenter directement sans retaper.

**P1-#2 → critère d'acceptation sur la story "Saisie impact"** :
> Entre le tap qui déclenche l'écriture et la confirmation retour de Supabase, la zone de cage (et le terrain si `hors_cadre`) est verrouillée — un second tap pendant cette fenêtre n'a aucun effet.

**P1-#3 → story dédiée, à traiter avant tout déploiement public (pas juste avant la fin du projet)** :
> **STORY — Policies RLS least-privilege.** Remplacer les 3 policies `for all using(true) with check(true)` de l'Architecte par des policies par opération, alignées sur les besoins réels du produit :
> - `gardiens` : `select`, `insert` (jamais `update`/`delete` depuis l'app)
> - `tireurs` : `select`, `insert`, `update` (édition club/poste/latéralité) — jamais `delete`
> - `impacts` : `select`, `insert`, `delete` (annulation du dernier impact) — jamais `update`
>
> Cette story doit être livrée avant la mise en ligne réelle du repo GitHub Pages, pas reportée en fin de cycle.
