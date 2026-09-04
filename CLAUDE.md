# CLAUDE.md — Book Impact Gardien

## 1. Nom et objectif
**Book Impact Gardien** : application web pour gardiens de but de handball, permettant d'enregistrer en 2-3 taps, pendant le visionnage d'une vidéo de match, l'impact de chaque tir subi (zone de tir, zone de cage, résultat, contexte), afin de consulter ensuite un "book" statistique par tireur adverse avant un futur match. Étendue par le **Mode Match** pour documenter un match complet en direct (équipes, joueurs, saisie double-roster).

## 2. Stack technique
- HTML/CSS/JS **vanilla**, aucun framework front, aucun bundler, scripts globaux (pas de modules ES — pas d'`import`/`export`).
- Backend **Supabase** (Postgres + API auto-générée PostgREST). Client `@supabase/supabase-js@2` chargé en UMD depuis le CDN `cdn.jsdelivr.net` (pas d'installation npm).
- Pas de `package.json`, pas de `node_modules`, pas d'étape de build. Un fichier modifié = un déploiement (`git push`).
- Un seul `index.html`, qui charge ~20 fichiers JS globaux dans un **ordre de dépendance strict** (l'ordre des balises `<script>` fait foi — cf. section 3).

## 3. Structure des fichiers/dossiers
```
/index.html                     — page unique, charge tous les scripts dans l'ordre de dépendance
/css/
  zones.css                     — copie STRICTEMENT INCHANGÉE de fenix-terrain-zones-export (terrain 11 zones, cage 9 zones) — ne jamais modifier
  app.css                       — chrome de page, tokens couleur/ombre (:root), composants (boutons, cartes, bandeaux)
/js/
  vendor/
    terrain-zones.js            — copie inchangée de l'export (géométrie + rendu heatmap terrain)
    goal-cage-zones.js          — copie inchangée de l'export (géométrie + rendu heatmap cage)
  zone-picker.js                — mode "sélection" (picker cliquable) du terrain ; réutilise vendor/terrain-zones.js sans le modifier
  config.js                     — SUPABASE_URL + SUPABASE_ANON_KEY (clé publique "publishable")
  supabase-client.js            — init du client (window.supabase.createClient)
  api.js                        — TOUS les accès Supabase de l'app (aucune requête ailleurs) ; erreurs toujours propagées (throw), jamais avalées
  state.js                      — état en mémoire (gardienId, tireurCourant, equipeCourante, matchCourant...) + sync localStorage du gardien actif
  util.js                       — escapeHtml(), confirmAndDelete() (helper suppression partagé)
  router.js                     — switch d'écran minimal (registerScreen/renderScreen), pas de routing par URL
  main.js                       — bootstrap : décide l'écran de départ selon présence d'un gardien mémorisé
  screens/
    header.js                   — header partagé (titre, bouton retour, lien "Changer de gardien" ou lien contextuel)
    screen-gardien.js           — écran 1 : sélection/création/suppression du gardien actif
    screen-accueil.js           — hub : Book par tireur / Saisir un match / Paramètres
    screen-tireur.js            — écran 2 : recherche/création/édition/suppression tireur (entrée mode Book)
    screen-book.js              — écran 4 : stats + historique + heatmaps croisées par tireur (accès direct depuis screen-tireur.js — plus d'écran de saisie autonome, cf. STORY-17)
    screen-parametres.js        — hub secondaire : Équipes / Joueurs / Matchs
    screen-equipes.js           — CRUD équipe
    screen-joueurs.js           — CRUD joueur d'une équipe (réutilise tireur-form-shared.js)
    screen-matchs.js            — CRUD match (saison, journée, deux équipes, double FK désambiguïsée)
    screen-selection-match.js   — choix d'un match existant, précharge les deux rosters, lance la saisie
    screen-saisie-match.js      — écran de saisie match complet — boucle cœur du mode Match, layout responsive 3 paliers + habillage visuel réaliste (but/terrain), cf. STORY-18a/18b
    tireur-form-shared.js       — formulaire nom/club/poste/latéralité partagé entre screen-tireur.js et screen-joueurs.js (création ET édition)
/fenix-terrain-zones-export/    — source d'origine des zones (référence externe, ne jamais modifier ici)
/docs/                          — documentation BMAD complète (brief, prd, architecture, design, visual, risks, stories, qa, e2e, code-review, security, regression)
```

## 4. Conventions de code
- Pas de modules ES : chaque fichier déclare des fonctions/variables globales — l'ordre des `<script>` dans `index.html` **est** la résolution des dépendances, à respecter pour tout ajout.
- Pattern d'écran systématique : `render<Nom>()` (string HTML synchrone) / `bind<Nom>()` (câble les listeners après insertion DOM) / `refresh<Nom>Screen()` (re-render + re-bind local). `registerScreen(name, renderFn, onMountFn)` enregistre l'écran ; `onMount` déclenche le chargement de données asynchrone.
- État d'écran privé en variable module-level préfixée `_` (ex. `_impactScreen`, `_tireurScreen`, `_matchsScreen`) — pas d'état partagé entre écrans au-delà de `state` (state.js).
- Actions DOM via attribut `data-action` + délégation (`document.querySelectorAll('[data-action="..."]')`) — jamais d'`onclick` inline.
- Toute injection de texte utilisateur passe par `escapeHtml()` (util.js), sans exception.
- Nommage : camelCase en JS, kebab-case pour classes CSS/data-attributes, snake_case pour les colonnes Supabase.
- Suppression toujours via `confirmAndDelete()` (util.js) : confirmation native `window.confirm`, gère l'erreur FK `23503` avec message dédié.
- Un seul composant de formulaire tireur/joueur (`tireur-form-shared.js`), jamais dupliqué entre mode Book et mode Match.
- Commentaires en tête de fichier : expliquent le "pourquoi" (référence story/risque), jamais le "quoi".

## 5. Stockage des données
Supabase Postgres, RLS activée sur toutes les tables, **policies least-privilege par opération** (pas de `for all using(true)` généralisé — resserré et audité en STORY-02/08/15).

- `gardiens(id uuid pk, nom text not null, created_at)` — anon : select/insert/delete, jamais update.
- `tireurs(id uuid pk, nom text not null, club text, poste text check[...+'gardien_but'], lateralite text check('D'/'G'), notes text, equipe_id uuid null → equipes.id, created_at)` — anon : select/insert/update/delete. Sert à la fois de tireur libre (mode Book) et de joueur d'équipe (mode Match), différenciés uniquement par `equipe_id`.
- `impacts(id uuid pk, gardien_id → gardiens, tireur_id → tireurs, match_id uuid null → matchs, date_visionnage, contexte_match text, zone_tir text check[11 valeurs], type_tir text check[5 valeurs, null en mode Match], main text check['D'/'G', null en mode Match], zone_cage text check[9 valeurs, null si hors_cadre/non_but], resultat text check['but','arret','poteau','hors_cadre','non_but'], notes text, created_at, constraint zone_cage_coherente)` — anon : select/insert/delete, jamais update.
- `equipes(id uuid pk, nom text not null, created_at)` — anon : select/insert/delete, jamais update.
- `matchs(id uuid pk, saison text, journee text check regex J01-J22, equipe_a_id/equipe_b_id → equipes, constraint equipes_distinctes, created_at)` — anon : select/insert/delete, jamais update. Deux FK vers `equipes` : tout embedding PostgREST doit désambiguïser via `equipes!matchs_equipe_a_id_fkey` / `matchs_equipe_b_id_fkey`.
- Intégrité référentielle : toutes les FK sont `ON DELETE RESTRICT` (défaut Postgres) — suppression bloquée tant que des lignes dépendantes existent (erreur `23503`, interceptée par `confirmAndDelete()`).
- `localStorage` : une seule clé, `bookimpact.gardien` (`{id, nom}` du gardien actif). Tout le reste de l'état (`tireurCourant`, `equipeCourante`, `matchCourant`...) est en mémoire (state.js) et ne survit pas à un rechargement — choix assumé (usage en session continue).
- Agrégats du Book (stats, heatmaps) : calculés côté client à la volée depuis `getImpactsForTireur()` — pas de vue Postgres (critère de bascule en section 10).

## 6. Authentification et rôles
Aucune authentification utilisateur. Un seul rôle applicatif Supabase : `anon`. La "sélection de gardien" (écran 1) est déclarative, pas une identité réelle vérifiée. Sécurité entièrement portée par les policies RLS par opération (section 5) — la clé "publishable" est volontairement publique, committée en clair dans `js/config.js` (repo GitHub public). Aucun rôle différencié (admin/lecteur/etc.).

## 7. Hébergement et déploiement
- Hébergement statique : **GitHub Pages**, dépôt `romainternel/book-impact-gardien` (public).
- Déploiement : `git push` sur la branche déployée suffit — pas de CI/CD, pas d'étape de build.
- Backend : Supabase (projet cloud managé), URL et clé anon en clair dans `js/config.js`.
- Aucune variable d'environnement, aucun secret côté serveur — tout tourne côté navigateur.

## 8. Contraintes spécifiques
- **Appareil cible : mobile/téléphone en priorité** — `#app` contraint à `max-width: 480px`, `font-size: 14px`, `-webkit-tap-highlight-color: transparent`. Usage prévu : saisie en 2-3 taps pendant le visionnage d'une vidéo, sur téléphone.
  **Exception** : l'écran de saisie match (`screen-saisie-match.js`) élargit `#app` à 920px à partir de 760px de large, via `body:has(.screen-saisie-match) #app{ max-width:920px }` (`css/app.css`) — mécanisme conditionnel au contenu affiché, aucune autre page n'est concernée (STORY-18a).
- **Offline non géré** — aucun cache/service worker, chaque action requiert une connexion réseau active vers Supabase.
- Performance : agrégation des stats du Book entièrement côté client — critère de bascule si un tireur dépasse quelques milliers d'impacts.
- Fichiers vendor (`terrain-zones.js`, `goal-cage-zones.js`, `zones.css`) : **ne jamais modifier** — un diff avec `fenix-terrain-zones-export/` doit rester vide ; toute adaptation passe par des fichiers séparés.
- Zones concaves du terrain (`69MG`, `69MC`, `69MD`) : nécessitent un `fill` plein (pas `none`) sur les polygones SVG pour un hit-testing correct au tap.
- Pas de gestion de conflit concurrent : dernier écrit gagne si le même gardien utilise l'app sur deux appareils simultanément (accepté, usage mono-appareil typique).

## 9. État d'avancement actuel
**22 stories livrées et validées à tous les stades** (code review APPROUVÉ, QA PASSED, E2E CONFIRMÉ, régression RAS jusqu'à v0.22.0). Dernière livraison : STORY-18b (habillage visuel réaliste but/terrain).

Fonctionnalités en production :
- [x] Sélection/création/suppression du gardien actif (mémorisé en localStorage)
- [x] Recherche, création, édition, suppression d'un tireur ; accès direct au Book depuis la sélection/création (plus d'écran de saisie autonome — toute la saisie de tir passe désormais par le mode Match, STORY-17)
- [x] Book par tireur : stats agrégées, historique, heatmaps croisées terrain × cage avec filtre par zone
- [x] Mode Match complet : Accueil, Paramètres, CRUD équipes/joueurs/matchs, sélection de match, saisie de match (but/non-but, zone, joueur), même robustesse que le mode Book. Écran de saisie : layout responsive 3 paliers (pile <480px / 2 colonnes 480-759px / colonnes latérales ≥760px), habillage visuel réaliste du but et du terrain (STORY-18a/18b)
- [x] Suppression avec confirmation pour gardiens/tireurs/équipes/matchs, protégée par contraintes FK
- [x] Policies RLS resserrées par opération et par table, auditées sans finding critique/majeur

Rien en cours au moment de cette analyse — le backlog "recentrage-match" (STORY-17/18a/18b) est clos.

## 10. Décisions techniques en attente / roadmap
- Backlog V2 explicite (docs/prd.md §5) : heatmap fine, comparaison entre tireurs, filtres par match, export — non commencés.
- "Poste favori" du Book (STORY-07a) : réserve QA non bloquante, calculé depuis `zone_tir` regroupée en 5 secteurs, à valider à l'usage réel.
- Correction d'une équipe/match mal nommé : possible uniquement par SQL direct (pas d'update exposé côté app) — dette assumée.
- Contrainte `journee` par regex (`J01`-`J22`) : ne couvre pas les matchs hors championnat — critère de bascule : table `journees` de référence si le besoin apparaît.
- Critères de bascule déjà actés : recherche full-text Postgres si la liste de tireurs dépasse quelques centaines d'entrées ; vue Postgres/RPC pour les stats du Book au-delà de quelques milliers d'impacts par tireur ; Supabase Auth si l'app doit un jour dépasser un usage interne restreint.
- Généralisation possible de l'élargissement conditionnel de `#app` (`body:has(.screen-saisie-match)`) : si un jour plusieurs écrans ont besoin de dépasser 480px, remplacer par une classe générique `body:has(.screen-wide)` posée sur chaque écran concerné plutôt que d'empiler des sélecteurs `:has()` un par un — non nécessaire tant qu'un seul écran est concerné (critère déjà acté en architecture, `docs/arch/recentrage-match.md` §6).
