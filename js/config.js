/*
 * Config Supabase. Clé "publishable" (équivalent anon public) — safe côté
 * client tant que RLS est activée sur toutes les tables (cf. docs/architecture.md
 * §3 et docs/security/story-02-supabase-rls.md). Ne jamais mettre ici une
 * clé "secret"/service_role.
 */
const SUPABASE_URL = "https://uakvmmpmwllekxznlcrd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_mcqEuiA_9n9scFcjpE8xYg_w97IrB13";
