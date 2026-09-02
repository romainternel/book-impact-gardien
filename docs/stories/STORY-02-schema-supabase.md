# STORY-02 — Schéma Supabase et client API

**En tant que** développeur qui va implémenter les écrans de données,
**Je veux** les 3 tables Supabase créées avec leurs contraintes, des policies RLS restreintes au strict nécessaire, et un module `api.js` qui centralise tous les accès,
**Afin de** ne jamais avoir à écrire de requête Supabase ailleurs que dans ce module, et de partir directement sur des policies sûres plutôt que de les corriger après coup.

## Contexte technique
- Zone concernée : instance Supabase du projet (nouvelle) + `js/config.js`, `js/supabase-client.js`, `js/api.js`.
- Exécuter le DDL complet de `docs/architecture.md` §3, **avec la correction `zone_cage text`** (pas `int` comme dans le brief d'origine) et la contrainte `zone_cage_coherente`.
- **Ne pas utiliser les policies `for all using(true)` génériques de l'architecture** — les remplacer directement par les policies least-privilege du Risk Analyst (`docs/risks/book-impact-gardien.md`, mitigation P1-#3) :
  - `gardiens` : `select`, `insert` uniquement
  - `tireurs` : `select`, `insert`, `update` uniquement (pas de `delete`)
  - `impacts` : `select`, `insert`, `delete` uniquement (pas de `update`)
- `config.js` : URL + clé anon Supabase (valeurs fournies séparément, ne pas committer de vraies clés de prod dans l'historique si le repo est destiné à changer d'instance plus tard — clé anon uniquement, jamais une clé service_role).
- `api.js` expose au minimum : `getGardiens()`, `createGardien(nom)`, `searchTireurs(query)`, `getTireursRecents(gardienId, limit)`, `createTireur({...})`, `createImpact({...})`, `deleteImpact(id)`, `getLastImpact(gardienId, tireurId)`, `getImpactsForTireur(tireurId)`.

## Critères d'acceptation
- [ ] Les 3 tables existent avec exactement les colonnes, types et contraintes CHECK de `docs/architecture.md` §3 (`zone_cage` en `text`, pas `int`).
- [ ] Un insert dans `impacts` avec `resultat != 'hors_cadre'` et `zone_cage` null est rejeté par la contrainte `zone_cage_coherente` (vérifié manuellement).
- [ ] Un insert dans `impacts` avec `resultat = 'hors_cadre'` et `zone_cage` non null est également rejeté.
- [ ] Les policies RLS sont celles listées ci-dessus (least-privilege), pas des `for all` génériques — vérifié en tentant un `delete` sur `gardiens` depuis le client anon et en confirmant le rejet.
- [ ] Chaque fonction de `api.js` retourne une Promise et propage l'erreur Supabase telle quelle (pas de `try/catch` qui avale l'erreur silencieusement) — nécessaire pour que STORY-06b puisse afficher un état d'erreur explicite.
- [ ] `getTireursRecents` retourne bien les tireurs distincts triés par `date_visionnage` la plus récente, pour ce `gardien_id`, sans table de tracking séparée (dérivé de `impacts`).

## Hors scope
- UI de consommation de ces fonctions (stories suivantes).
- Vue Postgres agrégée pour les stats (hors scope MVP, cf. critère de bascule architecture §7).

## Dépend de
STORY-01

## Taille
M
