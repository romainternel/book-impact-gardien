# STORY-16 — Édition d'un tireur/joueur existant

**En tant que** utilisateur,
**Je veux** pouvoir corriger les informations d'un tireur ou d'un joueur déjà créé (nom, club, poste, latéralité),
**Afin de** réparer une erreur de saisie (faute de frappe, mauvais poste) sans devoir le supprimer et perdre son historique d'impacts (bloqué par FK depuis STORY-15 dès qu'il a des tirs enregistrés).

## Contexte technique
- Zone concernée : `js/api.js` (nouvelle fonction `updateTireur`), `js/screens/tireur-form-shared.js` (formulaire étendu pour le mode édition), `js/screens/screen-tireur.js` et `js/screens/screen-joueurs.js` (bouton "Modifier" + état d'édition), `css/app.css` (`.list-card-edit-btn`, actions du formulaire).
- **Aucune nouvelle policy RLS nécessaire** : `tireurs` a déjà une policy `update` (`anon update tireurs ... using (true) with check (true)`) posée en STORY-02, jamais utilisée jusqu'ici côté frontend.
- Un "joueur" est un `tireur` avec `equipe_id` renseigné (pas de table séparée, cf. `docs/architecture.md`) — une seule fonction `updateTireur()` sert les deux écrans, comme `deleteTireur()`.
- `equipe_id` n'est jamais modifié par ce formulaire (pas de UI pour changer un joueur d'équipe) — l'update ne touche que nom/club/poste/latéralité.
- Réutilise le pattern déjà en place pour la création (état `creating` → remplacement plein-corps de la liste par le formulaire) : ajout d'un état `editingId` qui suit le même principe, pré-rempli avec les valeurs actuelles.

## Critères d'acceptation
- [ ] Un bouton "Modifier" (icône ✏️) est visible sur chaque ligne des listes tireurs (Book) et joueurs (équipe), à côté du bouton de suppression existant.
- [ ] Le tap ouvre un formulaire pré-rempli avec les valeurs actuelles (nom, club si applicable, poste, latéralité).
- [ ] Enregistrer avec un nom non vide → mise à jour réelle en base, la ligne reflète les nouvelles valeurs sans rechargement réseau complet de la liste.
- [ ] Un bouton "Annuler" permet de fermer le formulaire sans rien modifier.
- [ ] Le bouton "Modifier" ne déclenche jamais l'action de sélection de la ligne (`stopPropagation` sur l'écran tireur, où la ligne est aussi un bouton de navigation).
- [ ] Échec réseau à l'enregistrement → message d'erreur explicite, le formulaire reste ouvert avec les valeurs saisies (pas de perte de saisie).

## Hors scope
- Modification de l'équipe d'appartenance d'un joueur (transfert).
- Édition de gardiens/équipes/matchs (aucune policy `update` en base pour ces tables — hors scope tant que non demandé explicitement).
- Historique des modifications (audit trail).

## Dépend de
STORY-02 (policy `update` déjà existante sur `tireurs`), STORY-11 (écran Joueurs), STORY-15 (pattern `.list-card-row` à deux boutons)

## Taille
S
