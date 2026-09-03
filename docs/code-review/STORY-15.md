# Code Review — STORY-15 : Suppression de données depuis l'app

## Conformité Architecture
- Aucune vérification applicative de dépendances écrite — repose entièrement sur le comportement `RESTRICT` par défaut des contraintes FK Postgres déjà en place, exactement comme anticipé dans la story. Élégant : zéro logique métier dupliquée entre la base et le client.
- `confirmAndDelete()` factorisée dans `util.js`, réutilisée à l'identique par les 5 écrans — un seul point de vérité pour le pattern confirmation/erreur.

## Réutilisation vs duplication
- `deleteTireur()` sert à la fois pour un tireur libre (écran tireur) et un joueur d'équipe (écran joueurs) — même table, pas de fonction dupliquée. Cohérent avec la décision d'unification tireur/joueur de STORY-11.
- `.list-card-row`/`.list-card-delete-btn` : un seul jeu de règles CSS réutilisé par les 5 écrans, pas de duplication de style.

## Scope
- Fichiers touchés : `js/util.js` (helper), `js/api.js` (4 fonctions), `css/app.css` (2 règles), 5 écrans. Conforme à la story. Migration SQL (4 policies delete) fournie séparément à l'utilisateur, cohérent avec le pattern déjà établi pour les migrations de schéma dans ce projet.

## Sécurité basique — signalement au Security Auditor
Quatre nouvelles policies RLS `delete` ouvertes (`using(true)`, sans condition), à l'identique du niveau d'accès déjà en place pour `select`/`insert` sur ces tables. Pas de nouvelle surface d'exposition de données (les policies `select` existantes exposaient déjà tout), mais c'est la première fois que `gardiens`/`equipes`/`matchs` deviennent supprimables via l'API publique — audit indépendant requis avant de considérer cette story close, cohérent avec la pratique déjà suivie pour STORY-02/STORY-08.

## Lisibilité et maintenabilité
- Le cas particulier "suppression du gardien actif" (nettoyage `localStorage`) est géré explicitement dans le callback `onSuccess` de `screen-gardien.js`, pas caché dans `confirmAndDelete()` générique — bonne séparation, la logique spécifique à un écran reste dans cet écran.

## Gestion d'erreurs
- Distinction claire entre erreur de contrainte FK (`code === "23503"`, message pédagogique) et erreur générique (message de repli) — pas un simple `catch` muet.

## Taille et complexité
Story M conforme — la simplicité vient du fait de s'appuyer sur une protection déjà existante (FK RESTRICT) plutôt que d'en réinventer une.

## Point vérifié en conditions réelles
Les 3 dialogues natifs (`confirm` accepté, `confirm` refusé, `alert` d'erreur FK) ont été déclenchés et gérés via de vrais événements navigateur (pas simulés) : blocage d'une équipe avec joueur (message exact vérifié), annulation sans appel réseau, suppression réussie du joueur puis de l'équipe déverrouillée, suppression d'un gardien avec nettoyage `localStorage` confirmé, suppression d'un match avec libellé de confirmation correctement formé (journée + deux équipes).

## Verdict
**APPROUVÉ**
