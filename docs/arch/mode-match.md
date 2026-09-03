# Architecture — Mode Match (équipes, joueurs, saisie match complet)

## 1. Décision technique

**Extension du schéma existant (pas de nouvelles tables parallèles pour "joueur") + nouveaux écrans suivant exactement le pattern déjà établi (render/bind/reRender, `registerScreen` avec `onMount`).**

```
js/screens/screen-accueil.js          ← nouveau hub (remplace le saut direct gardien→tireur)
js/screens/screen-parametres.js       ← hub Équipes/Joueurs/Matchs
js/screens/screen-equipes.js          ← CRUD équipe (liste + création)
js/screens/screen-joueurs.js          ← CRUD joueur d'une équipe
js/screens/screen-matchs.js           ← CRUD match
js/screens/screen-selection-match.js  ← choisir un match → lance la saisie
js/screens/screen-saisie-match.js     ← écran de saisie match (cœur du mode)
```

### Pourquoi
- **`tireurs.equipe_id` nullable plutôt qu'une table `joueurs` séparée** : un joueur d'équipe et un tireur libre sont la même donnée (nom, club, poste, latéralité) avec un lien optionnel en plus. Créer une table parallèle dupliquerait le modèle et casserait la décision produit "le mode Match alimente le Book existant" (il faudrait alors faire une jointure ou une synchronisation entre deux tables représentant la même chose). Une seule table, un champ optionnel en plus : zéro duplication, zéro synchronisation à maintenir.
- **`impacts.match_id` nullable** : les impacts du mode Book existant (sans match) restent valides. Un impact du mode Match porte à la fois `tireur_id` (qui a tiré) et `match_id` (dans quel match) — les deux coexistent sans conflit avec le modèle actuel.
- **Nouveaux écrans suivent le pattern déjà en place** : pas de nouveau paradigme d'architecture introduit, cohérent avec "simple et solide" — chaque écran reproduit `render → bind → reRender` déjà utilisé 5 fois dans le projet.

## 2. Impact sur l'existant
- `js/main.js` : la destination après sélection/création gardien change de `renderScreen("tireur")` à `renderScreen("accueil")`. L'écran tireur (STORY-04) et tout le mode Book restent **inchangés** — accessibles depuis le nouvel Accueil via la carte "📖 Book par tireur".
- `js/api.js` : `createTireur()` gagne un paramètre optionnel `equipe_id` (défaut `null`) — signature étendue, pas cassée, les appels existants (screen-tireur.js) continuent de fonctionner sans modification.
- `js/screens/screen-tireur.js`, `screen-impact.js`, `screen-book.js` : **aucune modification requise**. Le mode Book continue de fonctionner à l'identique — un `tireur` avec `equipe_id` renseigné s'y comporte exactement comme un tireur libre.

## 3. Nouvelles structures de données

```sql
create table equipes (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  created_at timestamptz not null default now()
);

alter table tireurs add column equipe_id uuid references equipes(id);

-- Ajout du poste "gardien de but" au référentiel existant (nécessaire pour
-- représenter un vrai gardien de match — à ne pas confondre avec la table
-- `gardiens`, qui reste l'observateur/analyste de l'app, cf. docs/brief-mode-match.md §5).
alter table tireurs drop constraint tireurs_poste_check;
alter table tireurs add constraint tireurs_poste_check
  check (poste in ('ailier_d','ailier_g','arriere_d','arriere_g','demi_centre','pivot','gardien_but'));

create table matchs (
  id uuid primary key default gen_random_uuid(),
  saison text not null,
  journee text not null check (journee ~ '^J(0[1-9]|1[0-9]|2[0-2])$'), -- J01 à J22
  equipe_a_id uuid not null references equipes(id),
  equipe_b_id uuid not null references equipes(id),
  created_at timestamptz not null default now(),
  constraint equipes_distinctes check (equipe_a_id <> equipe_b_id)
);

alter table impacts add column match_id uuid references matchs(id);

-- Résultat étendu : 'non_but' = résultat simplifié du mode Match (englobe
-- arrêt/poteau/hors-cadre non détaillés). Ne réutilise JAMAIS 'hors_cadre'
-- pour ce cas — corromprait les stats existantes du Book (taux d'arrêt,
-- qui compte spécifiquement 'arret').
alter table impacts drop constraint impacts_resultat_check;
alter table impacts add constraint impacts_resultat_check
  check (resultat in ('but','arret','poteau','hors_cadre','non_but'));

-- zone_cage_coherente étendue : 'non_but' se comporte comme 'hors_cadre'
-- (pas de zone de cage requise/autorisée).
alter table impacts drop constraint zone_cage_coherente;
alter table impacts add constraint zone_cage_coherente check (
  (resultat in ('hors_cadre','non_but') and zone_cage is null) or
  (resultat not in ('hors_cadre','non_but') and zone_cage is not null)
);

alter table equipes enable row level security;
create policy "anon select equipes" on equipes for select to anon using (true);
create policy "anon insert equipes" on equipes for insert to anon with check (true);
-- Pas de update/delete au MVP de cette extension (cf. PRD §6 hors scope).

alter table matchs enable row level security;
create policy "anon select matchs" on matchs for select to anon using (true);
create policy "anon insert matchs" on matchs for insert to anon with check (true);
```

## 4. Point technique à ne pas rater : double FK vers `equipes`
`matchs` a **deux** clés étrangères vers `equipes` (`equipe_a_id`, `equipe_b_id`). PostgREST ne peut pas deviner automatiquement laquelle utiliser pour l'embedding (`select("*, equipes(nom)")` échoue ou est ambigu avec deux FK vers la même table). Il faut désambiguïser explicitement dans chaque requête `api.js` :
```js
supabaseClient.from("matchs").select(`
  *,
  equipe_a:equipes!matchs_equipe_a_id_fkey(id, nom),
  equipe_b:equipes!matchs_equipe_b_id_fkey(id, nom)
`)
```
Le nom exact de la contrainte (`matchs_equipe_a_id_fkey`) doit être vérifié après création de la table (Postgres le génère automatiquement selon la convention `table_column_fkey`, mais à confirmer via `\d matchs` ou l'éditeur Supabase avant d'écrire `api.js`) — point d'attention explicite pour le Developer de la story concernée.

## 5. Nouvelles fonctions `api.js`
- `getEquipes()`, `createEquipe(nom)`
- `getJoueursByEquipe(equipeId)` — `tireurs` filtré sur `equipe_id`, trié par nom
- `createTireur({nom, club, poste, lateralite, equipe_id})` — **signature étendue**, `equipe_id` optionnel (défaut `null`)
- `getMatchs()` — avec embedding désambiguïsé (cf. §4)
- `createMatch({saison, journee, equipe_a_id, equipe_b_id})`
- `createImpact()` — **aucune modification de signature nécessaire**, `match_id` passe déjà via l'objet payload existant

## 6. Recommandation anti-duplication (à trancher par le Scrum Master en taille de story)
`screen-joueurs.js` a besoin du même mini-formulaire de création (nom/club/poste/latéralité) que `screen-tireur.js`. Recommandation : extraire `POSTES` et le HTML du formulaire de création dans une fonction partagée (nouveau petit module ou ajout à `util.js`) plutôt que de dupliquer le tableau `POSTES` et le markup une seconde fois. Non bloquant si la duplication reste limitée (deux écrans, pas dix), mais à signaler au Code Reviewer de la story concernée.

## 7. Risques (niveau architecture — détail complet par le Risk Analyst)
- Contrainte `journee` par regex : si l'utilisateur veut un jour des matchs hors championnat (coupe, amical), le format `J01`-`J22` ne conviendra pas — accepté pour ce MVP d'extension (hors scope explicite, cf. PRD §6).
- RLS sans `update`/`delete` sur `equipes`/`matchs` : cohérent avec le choix déjà fait sur `gardiens`/`tireurs`, mais signifie qu'une équipe mal nommée à la création ne peut être corrigée que par SQL direct (même limitation déjà acceptée pour les gardiens).

## 8. Critère de bascule
Si la contrainte `journee` par regex devient trop rigide (formats de compétition variés), remplacer par une table `journees` de référence plutôt que continuer à étendre le regex. Non nécessaire tant que l'usage reste un championnat classique à 22 journées.
