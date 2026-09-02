# Book d'Impact Gardien — Cahier des charges

## Objectif
Application où le gardien de but consulte une vidéo de match (Dartfish ou autre) et enregistre lui-même, en autonomie, chaque impact de tir adverse : zone de la cage touchée, tireur, contexte du tir, résultat. Ça constitue au fil du temps un "book" par tireur adverse que le gardien peut consulter avant un match pour préparer sa lecture du jeu.

## Utilisateurs
- Chaque gardien du CF a son propre book (login simple par gardien, pas besoin d'auth lourde).
- Usage individuel, en autonomie, pendant le visionnage vidéo — donc l'app doit être **ultra rapide à utiliser en parallèle d'une vidéo** : 2-3 taps max par impact enregistré.

## Modèle de données (Supabase / Postgres)

```sql
create table gardiens (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  created_at timestamptz default now()
);

create table tireurs (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  club text,
  poste text, -- ailier_d, ailier_g, arriere_d, arriere_g, demi_centre, pivot
  lateralite text check (lateralite in ('D','G')),
  notes text,
  created_at timestamptz default now()
);

create table impacts (
  id uuid primary key default gen_random_uuid(),
  gardien_id uuid references gardiens(id),
  tireur_id uuid references tireurs(id),
  date_visionnage timestamptz default now(),
  contexte_match text, -- ex "Fenix vs X - 12/09"
  zone_tir text not null, -- zone de tir sur le terrain (aile_g, arriere_g, demi_centre, arriere_d, aile_d, pivot, 7m...)
  type_tir text, -- jet, appui, suspension, extension, penalty
  main text check (main in ('D','G')),
  zone_cage int not null, -- zone de la cage visée
  resultat text check (resultat in ('but','arret','poteau','hors_cadre')),
  notes text
);
```

**Deux zones distinctes à saisir, pas une** :
- `zone_tir` : d'où part le tir (grille terrain façon zone 9m/6m — ailes, arrières, demi-centre, pivot)
- `zone_cage` : où le ballon touche dans le but

Réutiliser telles quelles les formes SVG (zone de tir en demi-cercle, cage en arc) déjà existantes dans un de tes autres outils plutôt que les redessiner — voir le prompt ci-dessous. Le dossier **fenix-terrain-zones-export** (copié depuis match-statcf) sert de référence pour la conception du découpage des deux zones : Claude Code doit s'appuyer dessus pour reprendre le même nombre de zones, la même forme SVG et le même nommage.

## Écrans

1. **Sélection gardien** (au lancement, ou mémorisé localement)
2. **Sélection tireur** — recherche dans la base, ou création rapide si nouveau tireur
3. **Saisie impact** (écran principal, utilisé en boucle pendant le visionnage)
   - Cage SVG cliquable divisée en 9 zones → 1 tap = zone touchée
   - Boutons résultat : Arrêt / But / Poteau / Hors cadre
   - Sélecteurs rapides : poste de tir, type de tir, main
   - Bouton "Enregistrer" → retour immédiat à l'écran, prêt pour l'impact suivant
4. **Book tireur** — consultation
   - Heatmap de la cage (fréquence par zone)
   - Stats : main dominante, poste favori, taux d'arrêt du gardien face à lui, nombre de tirs enregistrés
   - Historique chronologique des impacts
5. *(V2)* Comparaison entre plusieurs tireurs, filtre par match/contexte, export

## Stack technique
- HTML/CSS/JS vanilla, single-page app (cohérent avec tes autres outils : fenix-eval-cf, appli-terrain)
- Supabase : tables ci-dessus, pas besoin d'auth complexe (juste une table `gardiens` avec sélection au login)
- Déploiement : GitHub repo + GitHub Pages

## MVP vs V2
- **MVP** : écrans 1-4, grille 9 zones, stats simples (compteurs + %)
- **V2** : heatmap plus fine, comparaison tireurs, export, filtres par match

---

## Prompt à coller dans VS Code (Claude Code / BMAD `/construire`)

```
Je veux construire "Book Impact Gardien", une web app pour gardiens de but de handball.

CONTEXTE MÉTIER
Le gardien visionne une vidéo de match (hors app, sur Dartfish ou autre lecteur) et
enregistre en parallèle, en autonomie, l'impact de chaque tir adverse : zone de la
cage touchée, tireur, contexte du tir, résultat. Ça constitue au fil des matchs un
"book" par tireur adverse, consultable avant un futur match.

CONTRAINTE CLÉ : la saisie d'un impact doit se faire en 2-3 taps maximum, car elle
se fait en parallèle du visionnage vidéo — pas de formulaire long.

MODÈLE DE DONNÉES (Supabase / Postgres)
- gardiens (id, nom)
- tireurs (id, nom, club, poste, latéralité D/G, notes)
- impacts (id, gardien_id, tireur_id, date_visionnage, contexte_match, zone_tir,
  type_tir, main D/G, zone_cage, resultat [but/arret/poteau/hors_cadre], notes)

Deux zones distinctes à saisir sur chaque impact : zone_tir (position sur le
terrain, forme demi-cercle 9m/6m) et zone_cage (position dans le but, forme en
arc). J'ai copié dans ce dossier (fenix-terrain-zones-export) les composants SVG
de zone de tir et de cage que j'utilise déjà dans un autre de mes outils.
Inspecte les fichiers présents dans fenix-terrain-zones-export et appuie-toi
dessus pour concevoir le découpage des zones (zone_tir et zone_cage) et la
saisie des impacts — réutilise ces composants tels quels plutôt que de les
redessiner. Je veux la même identité visuelle et le même découpage de zones
que dans cet export.

ÉCRANS
1. Sélection gardien (mémorisée localement après premier choix)
2. Sélection tireur (recherche + création rapide si nouveau)
3. Saisie impact : zone de tir cliquable (1 tap), puis cage cliquable (1 tap),
   boutons résultat, sélecteurs rapides type de tir/main, enregistrement
   immédiat, retour à l'écran prêt pour l'impact suivant
4. Book tireur : vue croisée zone de tir x zone de cage (comme le visuel
   "stat des tireurs" que j'ai déjà), stats (main dominante, poste favori,
   taux d'arrêt du gardien face à lui, nb de tirs), historique chronologique

STACK
HTML/CSS/JS vanilla, single-page app. Backend Supabase (tables ci-dessus).
Déploiement GitHub Pages via repo GitHub.

Commence par le MVP (écrans 1-4, grille 9 zones, stats simples), pas la V2
(heatmap fine, comparaison tireurs, filtres par match) pour l'instant.
```
