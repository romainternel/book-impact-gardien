# Brief — Book par équipe (navigation Équipe → Joueur)

## 1. Contexte
"Book par tireur" (`screen-tireur.js`) est aujourd'hui une recherche/liste plate : recherche texte sur `nom`/`club` (`searchTireurs()`) ou, à vide, les tireurs récemment consultés par ce gardien (`getTireursRecents()`, dérivé de `impacts`). La table `tireurs` porte un `equipe_id` optionnel (STORY-08) qui distingue un "tireur libre" (créé directement depuis ce flow, `equipe_id = null`) d'un "joueur d'équipe" (créé depuis Paramètres → Équipes → Joueurs, ou en mode Match, `equipe_id` renseigné) — mais cette distinction n'est **jamais exploitée dans "Book par tireur"**, qui traite tous les tireurs de façon identique et indifférenciée dans une seule liste/recherche.

Depuis STORY-17 ("toute la saisie de tir passe désormais par le mode Match"), la quasi-totalité des tireurs créés le sont via le mode Match (donc rattachés à une équipe) — la structure équipe → joueur existe déjà et est déjà peuplée, mais reste invisible depuis "Book par tireur".

## 2. Besoin réel vs solution proposée
- **Solution proposée par l'utilisateur** : "un filtre de lecture par équipe dans le book plutôt que par joueur. Équipe et ensuite joueur dedans" — remplacer la recherche à plat par une sélection Équipe → puis Joueur de cette équipe.
- **Besoin réel sous-jacent** : l'utilisateur pense par équipe (typiquement l'équipe adverse du prochain match), pas par nom de joueur isolé à retrouver dans une recherche texte — la structure équipe → joueur existe déjà dans l'app (Paramètres → Équipes → Joueurs, en lecture/CRUD) mais n'est pas réutilisée comme point d'entrée du Book, alors qu'elle correspond exactement à la façon dont un coach prépare un match ("je regarde le book de chaque joueur de l'équipe X avant de jouer contre eux").

## 3. Utilisateurs
Même utilisateur principal (le gardien/observateur). Usage typique déclenché : préparation d'un match à venir, consultation groupée des books de plusieurs joueurs d'une même équipe adverse, l'un après l'autre.

## 4. Point d'attention structurant (à trancher par le PM)
Deux catégories de tireurs coexistent en base et le resteront (aucune migration prévue) :
- **Joueurs d'équipe** (`equipe_id` non null) — naviguables par la nouvelle structure Équipe → Joueur.
- **Tireurs libres** (`equipe_id` null) — créés avant STORY-17 ou encore possibles aujourd'hui via "+ Créer" dans "Book par tireur" (aucune équipe associée, cf. `tireur-form-shared.js`) ; **invisibles** dans une navigation strictement équipe-first.

L'utilisateur a dit "plutôt que par joueur", ce qui suggère un remplacement du flow actuel — mais un remplacement pur rendrait les tireurs libres inaccessibles depuis "Book par tireur". Le PM doit trancher explicitement : la recherche texte actuelle disparaît, coexiste comme option secondaire, ou ne s'applique plus qu'aux tireurs libres (regroupés à part, ex. "Sans équipe") ? Ce n'est pas un détail cosmétique — sans décision, des tireurs existants deviennent injoignables depuis cet écran.

## 5. Composants déjà existants à réutiliser (ne pas dupliquer)
- `getEquipes()` (api.js) — liste des équipes, déjà utilisée par `screen-equipes.js`.
- `getJoueursByEquipe(equipeId)` (api.js) — déjà utilisée par `screen-joueurs.js` pour lister les joueurs d'une équipe.
- Pattern de liste/carte déjà établi (`list-card-row`, `list-card`) dans `screen-equipes.js`/`screen-joueurs.js`/`screen-tireur.js` — même langage visuel à conserver.
- `state.equipeCourante` (state.js) — déjà utilisé pour porter l'équipe sélectionnée entre écrans (actuellement Paramètres → Équipes → Joueurs) ; réutilisable ici sans changement de state.js si le flow suit le même pattern.

## 6. Vision
Depuis "Book par tireur", l'utilisateur choisit d'abord une équipe (même liste que Paramètres → Équipes), puis un joueur de son roster, et atterrit directement sur son Book — cohérent avec l'accès direct déjà en place depuis STORY-17 (sélection tireur → Book, sans écran intermédiaire).

## 7. Scope
### Dedans
- Nouvel écran (ou nouvelle vue de `screen-tireur.js`) : liste des équipes → sélection → liste des joueurs de cette équipe → sélection → Book direct.
- Traitement explicite des tireurs libres (`equipe_id = null`) — accessibles par un mécanisme à définir par le PM/Designer (ex. recherche conservée en accès secondaire, ou regroupement "Sans équipe").
- Conservation de la création de tireur (avec ou sans équipe selon le point d'entrée) — fonctionnalité déjà existante, à ne pas perdre.

### Dehors
- Toute modification du schéma de données (`equipe_id` existe déjà sur `tireurs`, aucune migration nécessaire).
- Toute modification de Paramètres → Équipes/Joueurs (CRUD déjà fonctionnel, hors périmètre).
- Toute modification du mode Match ou de l'écran de saisie (STORY-18a/18b, non concernés).
- Modification du Book lui-même (stats/heatmaps/historique) — seul le chemin pour y arriver change.

## 8. Critères de succès
- Depuis "Book par tireur", l'utilisateur peut choisir une équipe puis un joueur de cette équipe et atterrir directement sur son Book.
- Aucun tireur existant (libre ou d'équipe) ne devient injoignable depuis "Book par tireur" par rapport à aujourd'hui.
- Aucune régression sur la création/édition/suppression de tireur déjà en place.

## 9. Questions en suspens
- Remplacement complet de la recherche actuelle, ou coexistence (deux modes d'accès) ? → **Décision PM requise**, cf. §4.
- Les tireurs récemment consultés (`getTireursRecents()`) gardent-ils une place (ex. en tête de la liste d'équipes, ou disparaissent-ils au profit du parcours équipe-first) ?
