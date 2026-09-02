/*
 * Init du client Supabase. Dépend du global `supabase` exposé par le CDN
 * UMD (@supabase/supabase-js) et des constantes de config.js — les deux
 * doivent être chargés avant ce fichier.
 */
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
