# Audit complet — 2026-09-09

Convoqué hors story, en réaction directe au signalement utilisateur : le nouvel habillage visuel de la cage (STORY-18b renforcé le 2026-09-09) semblait ne produire aucun changement visible, malgré deux déploiements confirmés (`c0c7156`, `d1cb4cc`). Objectif principal : déterminer si c'est une régression réelle ou un problème d'observation, en testant en conditions réelles sur `https://romainternel.github.io/book-impact-gardien/` — puis, puisque `/verifie-complet` a été invoqué sans périmètre, passer en revue le reste de la checklist Critique + Important pour détecter d'éventuelles régressions collatérales des changements récents (habillage cage renforcé + purge/réimport complet des équipes et joueurs via API directe, cf. conversation).

Aucune écriture en base n'a été tentée pendant cet audit (le classifieur d'auto-mode a explicitement bloqué une tentative d'insertion d'un impact de test — décision respectée). Les parcours nécessitant une création/modification/suppression réelle n'ont donc pas pu être re-vérifiés en direct ce cycle-ci ; ils sont marqués ⚠️ ci-dessous avec la raison.

## 1. Périmètre testé

Toutes les features de `docs/regression/checklist.md` sont classées Critique ou Important (aucune Secondaire dans la checklist actuelle) — périmètre complet en théorie, testé selon le mindset Regression Guardian : vérification réelle sur ce qui est plausiblement à risque suite aux changements récents (CSS cage, données équipes/tireurs), test de fumée ou lecture de code sur le reste.

## 2. Résultat par feature

| # | Feature | Criticité | Verdict | Détail |
|---|---|---|---|---|
| 1 | Squelette SPA sans erreur bloquante | Critique | ✅ | Navigation live, seule erreur console = 404 `favicon.ico` connu |
| 2 | Fichiers vendor identiques à l'export | Critique | ✅ | `diff -q` vide sur les 3 fichiers (zones.css, terrain-zones.js, goal-cage-zones.js), reconfirmé pendant cet audit |
| 3 | Rendu lisible viewport mobile 375×667 | Important | ✅ | Capturé à 375×667, pas de débordement horizontal, texte lisible |
| 4 | Picker terrain : hit-testing zones concaves | Critique | ⚠️ | Non re-testé pixel-précis (hors périmètre des changements récents) — terrain affiché et cliquable visuellement, pas de vérification de coordonnées exactes cette passe |
| 5 | Client Supabase live opérationnel | Critique | ✅ | Confirmé indirectement : gardien, équipes, joueurs, matchs réels tous chargés sans erreur |
| 6 | Policies RLS least-privilege | Critique | ⚠️ | Non re-testé (nécessiterait des tentatives d'écriture non autorisées) — aucun changement de policy dans les modifications récentes (CSS + données uniquement) |
| 7 | Écran gardien : liste/sélection/persistance | Critique | ✅ | "Gabin" listé, sélection fonctionne, reload direct sur Accueil (localStorage persisté) |
| 8 | Écran tireur : recherche/récents/création | Critique | ✅ (partiel) | Recherche live vérifiée ("AUDRAIN" → résultat correct + "+ Créer" cohérent car pas de correspondance exacte) ; création non testée (écriture) |
| 9 | Book tireur : stats/historique | Critique | ⚠️ | 0 impact en base actuellement (purge du 2026-09-09) — état vide "Aucun tir enregistré" correctement géré, mais impossible de vérifier des calculs sur données réelles |
| 10 | Book tireur : heatmaps croisées | Critique | ⚠️ | Idem — 0 impact, rien à agréger |
| 11 | Schéma mode Match (equipes/matchs) | Critique | ✅ | Équipes/tireurs/matchs avec colonnes étendues fonctionnels, double FK résolue |
| 12 | Écran Accueil : routage, navigation | Critique | ✅ | Accueil atteint après sélection gardien, 3 modes accessibles |
| 13 | Paramètres/Équipes : liste/sélection | Critique | ✅ (partiel) | Liste des 12 équipes correcte ; création non testée (écriture) |
| 14 | Écran Joueurs : liste par équipe | Critique | ✅ | Roster BILLERE (14 joueurs, format "N° - Nom") correct |
| 15 | Écran Matchs : CRUD + double-FK | Critique | ✅ (partiel) | Liste + résolution des deux noms d'équipes correcte ; CRUD non testé (écriture) |
| 16 | Écran Sélection Match | Critique | ✅ | Match réel listé, lancement fonctionnel |
| 17 | Saisie Match : flow but/non_but | Critique | ✅ (partiel) | Bouton BUT → cage déverrouillée (opacité 1, pointer-events actifs) confirmé ; impact réel non créé (écriture évitée volontairement) |
| 18 | Saisie Match : anti double-tap/erreur/annulation | Critique | ⚠️ | Non testé (nécessite écriture réelle) |
| 19 | Suppression avec confirmation + blocage FK | Critique | ⚠️ | Non testé (suppression réelle) |
| 20 | Édition tireur/joueur | Important | ⚠️ | Non testé (écriture) |
| 21 | Book par tireur : accès direct | Critique | ✅ | Clic joueur BILLERE → Book atteint directement, état vide "Aucun tir enregistré" + bouton Retour présents |
| 22 | Saisie Match : layout responsive 3 paliers | Critique | ✅ (partiel) | Vérifié à 375px, 479px (pile) et 760px (3 colonnes) — bornes exactes 480/759 non retestées ce cycle-ci (aucun changement de layout récent, risque jugé faible) |
| 23 | Saisie Match : habillage cage/terrain | Critique | ✅ | **Vérifié en profondeur** — filet en losanges visible sur les 9 cases (avant : uniquement sur la case active, bug corrigé le 2026-09-09), poteaux/barre lumineux, case sélectionnée avec halo pulsé ; confirmé par capture zoomée + inspection `getComputedStyle` (background-image, background-color, animation) |
| 24 | Book : habillage cage/terrain généralisé | Important | ⚠️ | Code vérifié identique à l'écran de saisie (mêmes classes `.goal-frame`/`.goal-zone-grid`/`.gz-cell`, même structure de markup dans `screen-book.js`) — non confirmé visuellement en direct faute de données (0 impact), création d'un impact de test bloquée par le classifieur |
| 25 | Book par tireur : navigation équipe→joueur, tireur libre joignable | Critique | ✅ (partiel) | Chemin Équipe→Joueur→Book vérifié ; recherche tireur libre vérifiée ; retour dynamique (state.bookBackTarget) non testé explicitement ce cycle-ci |
| 26 | Démarrage app : gardien localStorage vérifié contre la base | Important | ✅ | Reload direct sur Accueil sans repasser par l'écran de sélection (gardien réel toujours valide) |
| 27 | Paramètres → Joueurs : accès direct sans cul-de-sac | Critique | ⚠️ | Non retesté ce cycle-ci |

## 3. Régressions détectées

**Une régression réelle a été trouvée et corrigée pendant l'investigation qui a précédé cet audit** (avant l'invocation de `/verifie-complet`) :

- **Filet de la cage invisible sur les cases non sélectionnées** — `.gz-cell` (vendor, `zones.css`) pose un fond opaque (`background: var(--bg3)`) qui recouvrait entièrement la texture de filet ajoutée sur `.goal-zone-grid` (le conteneur parent). Elle n'était donc visible qu'à travers le fond semi-transparent de la case `.active`, jamais sur les 8 autres — d'où l'impression que le nouveau style n'avait aucun effet. Corrigé en réappliquant le motif directement sur chaque `.gz-cell` depuis `app.css` (commit `d1cb4cc`, poussé et vérifié en direct pendant cet audit — filet visible sur toute la grille, capture zoomée + `getComputedStyle` à l'appui).

**Aucune autre régression détectée** sur les features testées en direct.

**Hypothèse complémentaire pour l'observation utilisateur persistante** ("ça ne marche toujours pas") : la cage démarre à 35% d'opacité (`.cage-locked`, comportement volontaire et pré-existant depuis STORY-14a — tant que "BUT" n'est pas sélectionné, la case est désactivée). À cette opacité réduite, la texture de filet — déjà subtile par design — devient très difficile à distinguer. Combiné à un cache navigateur possible sur l'appareil utilisé pour observer, ça explique plausiblement pourquoi le correctif du filet (pourtant confirmé actif et correctement déployé) a pu sembler invisible. Recommandation : revérifier après avoir tapé "BUT" en premier, et dans un onglet de navigation privée pour exclure tout cache résiduel.

## 4. Verdict global

**RÉGRESSION DÉTECTÉE — CORRIGÉE ET VÉRIFIÉE** (filet de cage invisible sur cases inactives, cf. §3). Pas d'autre régression constatée sur le périmètre testé en direct. Plusieurs items (9, 10, 18, 19, 20, 24, 27) restent **⚠️ NON VÉRIFIÉS ce cycle-ci** — soit par absence de données réelles (impacts = 0 suite à la purge du jour), soit parce que la vérification aurait nécessité une écriture en base que ni le classifieur d'auto-mode ni la prudence de l'auditeur n'ont jugé appropriée sans autorisation explicite de l'utilisateur. Une prochaine passe de `/verifie-complet` (ou un `/verifie` ciblé) après que quelques impacts réels auront été saisis permettrait de couvrir 9, 10 et 24.
