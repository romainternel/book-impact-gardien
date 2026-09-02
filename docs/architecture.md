# Architecture — Book Impact Gardien

Projet neuf, pas de `CLAUDE.md` ni de code existant à respecter au-delà des fichiers `fenix-terrain-zones-export/` déjà présents. Cette architecture pose donc la structure de fichiers de départ — elle fera l'objet du premier `CLAUDE.md` du projet une fois la première story livrée.

## 1. Décision technique

**Single-page app en JS vanilla, scripts globaux (pas de bundler, pas de modules ES), chargée directement en pages statiques GitHub Pages, backend Supabase via `@supabase/supabase-js` (UMD, CDN).**

Structure de fichiers :
```
/index.html
/css/
  zones.css              ← copie strictement inchangée de l'export
  app.css                ← nouveau : chrome de page, typo, boutons résultat, cartes (tokens du Visual Crafter)
/js/
  vendor/
    terrain-zones.js     ← copie strictement inchangée de l'export
    goal-cage-zones.js   ← copie strictement inchangée de l'export
  zone-picker.js          ← nouveau : mode "sélection" du terrain (cf. §5)
  config.js                ← URL + clé anon Supabase
  supabase-client.js      ← init du client (window.supabase.createClient)
  api.js                   ← toutes les requêtes Supabase (gardiens/tireurs/impacts)
  state.js                 ← état en mémoire de l'app + sync localStorage (gardien actif)
  screens/
    screen-gardien.js
    screen-tireur.js
    screen-impact.js
    screen-book.js
  router.js                ← switch d'écran minimal (pas de routing par URL)
  main.js                   ← bootstrap : charge la config, décide l'écran de départ, lance le render
```

### Pourquoi
- **Pas de bundler** : cohérent avec la contrainte "HTML/CSS/JS vanilla" et avec un déploiement GitHub Pages sans étape de build — un `git push` suffit à mettre à jour le site.
- **Scripts globaux plutôt que modules ES** : `terrain-zones.js` et `goal-cage-zones.js` sont écrits en déclarations globales (pas d'`export`). Les garder tels quels (sans les convertir en modules) évite toute modification du code source réutilisé — l'exigence du projet est de les reprendre "tels quels", donc c'est tout le reste de l'app qui s'adapte à leur format, pas l'inverse.
- **Pas de framework front (React/Vue...)** : le volume d'écrans (4) et la nature de l'interaction (peu d'état partagé, pas de composants imbriqués complexes) ne justifient pas la dépendance. Un `state.js` + fonctions de rendu par écran suffisent, et ça reste dans l'esprit "vanilla" du reste des outils du club.
- **Pas de routing par URL (hash ou history)** : l'usage réel est une session continue (le gardien ouvre l'app, sélectionne un gardien puis un tireur, et reste en boucle sur l'écran de saisie pendant tout le visionnage). Un routing par URL ajouterait de la complexité (gestion des états dans l'URL) sans bénéfice réel — pas de besoin de lien profond partageable pour le MVP. Un simple objet d'état + fonction `renderScreen()` suffit. **Critère de bascule** si ça change : si un besoin de "revenir en arrière" navigateur natif ou de lien partageable vers un tireur précis apparaît, migrer vers un routing par hash (`#tireur/:id`) sans réécrire l'état applicatif.

## 2. Impact sur l'existant
Aucun code existant dans ce dossier projet. Seul point d'attention : **ne pas modifier** `terrain-zones.js` / `goal-cage-zones.js` / `zones.css` en les copiant dans `/js/vendor/` et `/css/` — un diff avec les fichiers source de `fenix-terrain-zones-export/` doit rester vide. Toute adaptation nécessaire passe par des fichiers séparés (`zone-picker.js`, `app.css`).

## 3. Nouvelles structures de données (Supabase / Postgres)

Le brief d'origine proposait `zone_cage int` — **c'est une erreur à corriger** : `goal-cage-zones.js` (`GOAL_ZONES`) utilise des codes texte (`"HG"`, `"MC"`...), pas des entiers. Le schéma ci-dessous corrige ce point et ajoute les contraintes d'intégrité qui découlent des décisions Designer (zone_cage optionnelle seulement si `hors_cadre`).

```sql
create table gardiens (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  created_at timestamptz not null default now()
);

create table tireurs (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  club text,
  poste text check (poste in ('ailier_d','ailier_g','arriere_d','arriere_g','demi_centre','pivot')),
  lateralite text check (lateralite in ('D','G')),
  notes text,
  created_at timestamptz not null default now()
);

create table impacts (
  id uuid primary key default gen_random_uuid(),
  gardien_id uuid not null references gardiens(id),
  tireur_id uuid not null references tireurs(id),
  date_visionnage timestamptz not null default now(),
  contexte_match text,
  zone_tir text not null check (zone_tir in
    ('AILG','AILD','6MG','6MC','6MD','69MG','69MC','69MD','9MG','9MC','9MD')),
  type_tir text check (type_tir in ('jet','appui','suspension','extension','penalty')),
  main text check (main in ('D','G')),
  zone_cage text check (zone_cage in ('HG','HC','HD','MG','MC','MD','BG','BC','BD')),
  resultat text not null check (resultat in ('but','arret','poteau','hors_cadre')),
  notes text,
  created_at timestamptz not null default now(),
  constraint zone_cage_coherente check (
    (resultat = 'hors_cadre' and zone_cage is null) or
    (resultat != 'hors_cadre' and zone_cage is not null)
  )
);

create index idx_impacts_tireur on impacts(tireur_id);
create index idx_impacts_gardien_tireur on impacts(gardien_id, tireur_id, created_at desc);

alter table gardiens enable row level security;
alter table tireurs enable row level security;
alter table impacts enable row level security;

-- MVP : pas d'auth utilisateur réelle (cf. PRD, hors scope). Policies ouvertes
-- au rôle anon, à resserrer si l'app cesse d'être un outil interne restreint.
create policy "anon full access" on gardiens for all to anon using (true) with check (true);
create policy "anon full access" on tireurs for all to anon using (true) with check (true);
create policy "anon full access" on impacts for all to anon using (true) with check (true);
```

`created_at` a été ajouté sur `gardiens`/`tireurs` (absent du brief initial) — nécessaire pour trier les tireurs "récemment créés" et par cohérence avec `impacts`.

## 4. Nouvelles fonctions / modules

### `zone-picker.js` (nouveau, mais 100% appuyé sur du code réutilisé)
`terrain-zones.js` expose `buildCourtZones()` (géométrie pure) et `renderCourtZones()` (rendu **heatmap**, coloré par ratio buts/tirs) — mais **aucune fonction de rendu "picker" cliquable pour la saisie** n'existe dans l'export : c'est un usage nouveau (sélectionner une zone), pas encore couvert par le code source d'origine. `zone-picker.js` comble ce trou en réutilisant `buildCourtZones()` et `COURT_ZONE_ORDER` tels quels, sans toucher à `terrain-zones.js` :

```js
// zone-picker.js — dépend des globals exposés par vendor/terrain-zones.js, chargé avant.
function renderCourtZonePicker(selectedZone){
  const zones = buildCourtZones();
  const toVB = p => ({x: p.x*3.5, y: p.y*2.08});
  return COURT_ZONE_ORDER.map(z => {
    const pts = zones[z].map(p => { const v = toVB(p); return v.x+","+v.y; }).join(" ");
    const active = selectedZone === z ? "active" : "";
    return `<polygon points="${pts}" class="zone-pick ${active}" data-zone="${z}"/>`;
  }).join("");
}
// Usage : container.innerHTML = `<svg viewBox="0 0 350 208">${courtSvgMarkup()}${renderCourtZonePicker(state.zoneTir)}</svg>`
// Un seul listener délégué sur le <svg> : evt.target.closest('[data-zone]')
```
`renderGoalZoneGrid()` (cage), lui, **est déjà** le picker attendu — réutilisé sans wrapper.

### `api.js`
- `getGardiens()`, `createGardien(nom)`
- `searchTireurs(query)`, `getTireursRecents(gardienId, limit=5)` (dérivé de `impacts` : tireurs distincts triés par `max(date_visionnage)` desc pour ce gardien — pas de table de tracking séparée)
- `createTireur({nom, club, poste, lateralite})`
- `createImpact({...})` → id, `deleteImpact(id)` (annulation du dernier impact)
- `getImpactsForTireur(tireurId)` (tous gardiens confondus — Book) et `getLastImpact(gardienId, tireurId)` (pour préremplir type/main)

### `state.js`
État en mémoire : `{ gardienId, gardienNom, tireurCourant, dernierTypeTir, derniereMain, dernierImpact }`. Seul `gardienId`/`gardienNom` sont persistés en `localStorage` (clé `bookimpact.gardien`).

## 5. Point technique critique — hit-testing SVG sur polygones concaves
Le README de l'export signale que certaines zones (`69MC`, `69MG`, `69MD`) sont des **anneaux concaves** (bande entre deux arcs). Pour que le tap soit détecté sur toute la surface visible de ces polygones (pas seulement leur enveloppe convexe), chaque `<polygon>` du picker doit avoir un `fill` non-`none` (peut être `var(--bg3)`, pas nécessairement visible différemment tant qu'il n'est pas sélectionné) — un `fill="none"` avec `pointer-events:all` fonctionne aussi mais est plus fragile sur certains navigateurs mobiles. Recommandation : fill plein + `pointer-events: visiblePainted` (comportement par défaut), à vérifier explicitement en story avec un tap réel sur `69MC` près de son bord intérieur.

## 6. Risques (niveau architecture — détail complet par le Risk Analyst)
- **RLS ouverte à `anon`** : n'importe qui connaissant l'URL Supabase publique peut lire/écrire toutes les tables. Accepté pour le MVP (outil interne, pas de donnée sensible au sens RGPD hors noms de joueurs) mais à documenter comme dette explicite.
- **Pas de gestion de conflit concurrent** : si le même gardien ouvre l'app sur deux appareils en même temps sur le même tireur, pas de verrou — dernier écrit gagne. Accepté (usage mono-appareil typique).
- **`zone-picker.js` est du code neuf**, contrairement au reste de l'export déjà éprouvé en prod sur CF Fenix Stat — à tester spécifiquement (cf. §5), notamment sur les zones concaves.

## 7. Critères de bascule
- **Recherche tireurs** : si la liste dépasse quelques centaines d'entrées, remplacer le filtrage client par du full-text Postgres (`to_tsvector`) plutôt que charger tous les tireurs côté navigateur.
- **Stats du Book** : si le nombre d'impacts par tireur dépasse quelques milliers, remplacer le calcul d'agrégats côté client par une vue Postgres ou une fonction RPC — pour l'instant (dizaines à centaines d'impacts par tireur), tout charger et agréger en JS est largement suffisant et plus simple.
- **Auth** : si l'app doit un jour être exposée au-delà d'un usage interne restreint, basculer vers Supabase Auth (magic link ou sign-in anonyme) + RLS par `auth.uid()`, et remplacer la sélection de gardien "déclarative" actuelle par une vraie identité.
