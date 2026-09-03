/*
 * Tous les accès Supabase de l'app passent par ce fichier — aucune requête
 * ailleurs (cf. docs/architecture.md §4). Chaque fonction propage l'erreur
 * Supabase telle quelle (throw), jamais avalée silencieusement, pour que
 * les écrans puissent afficher un état d'erreur explicite (cf. STORY-06b,
 * mitigation du risque P0-#1 de docs/risks/book-impact-gardien.md).
 */

async function getGardiens(){
  const { data, error } = await supabaseClient.from("gardiens").select("*").order("nom");
  if(error) throw error;
  return data;
}

async function createGardien(nom){
  const { data, error } = await supabaseClient.from("gardiens").insert({ nom }).select().single();
  if(error) throw error;
  return data;
}

// Filtre nom/club côté serveur. Les caractères significatifs pour la
// grammaire de filtre PostgREST (, ( )) sont retirés de la saisie avant
// interpolation — validation à la frontière, la recherche reste tolérante
// plutôt que de renvoyer une erreur 400 sur une virgule tapée par erreur.
async function searchTireurs(query){
  const safe = (query || "").replace(/[,()]/g, " ").trim();
  if(!safe) return [];
  const like = `*${safe}*`;
  const { data, error } = await supabaseClient
    .from("tireurs")
    .select("*")
    .or(`nom.ilike.${like},club.ilike.${like}`)
    .order("nom")
    .limit(20);
  if(error) throw error;
  return data;
}

// Dérivé de `impacts` (pas de table de tracking séparée, cf. docs/architecture.md
// §4). Charge les impacts récents de ce gardien, déduplique par tireur_id en
// conservant l'ordre de récence, puis récupère les fiches tireur correspondantes.
async function getTireursRecents(gardienId, limit){
  limit = limit || 5;
  const { data: impacts, error } = await supabaseClient
    .from("impacts")
    .select("tireur_id, date_visionnage")
    .eq("gardien_id", gardienId)
    .order("date_visionnage", { ascending: false })
    .limit(200);
  if(error) throw error;

  const orderedIds = [];
  const seen = new Set();
  for(const row of impacts){
    if(!seen.has(row.tireur_id)){
      seen.add(row.tireur_id);
      orderedIds.push(row.tireur_id);
    }
    if(orderedIds.length >= limit) break;
  }
  if(orderedIds.length === 0) return [];

  const { data: tireurs, error: tireursError } = await supabaseClient
    .from("tireurs")
    .select("*")
    .in("id", orderedIds);
  if(tireursError) throw tireursError;

  const byId = {};
  tireurs.forEach(t => { byId[t.id] = t; });
  return orderedIds.map(id => byId[id]).filter(Boolean);
}

async function createTireur({ nom, club, poste, lateralite }){
  const { data, error } = await supabaseClient
    .from("tireurs")
    .insert({ nom, club: club || null, poste: poste || null, lateralite: lateralite || null })
    .select()
    .single();
  if(error) throw error;
  return data;
}

async function createImpact(impact){
  const { data, error } = await supabaseClient.from("impacts").insert(impact).select().single();
  if(error) throw error;
  return data;
}

async function deleteImpact(id){
  const { error } = await supabaseClient.from("impacts").delete().eq("id", id);
  if(error) throw error;
}

// Pour préremplir type_tir/main sur l'écran de saisie (cf. STORY-06a).
async function getLastImpact(gardienId, tireurId){
  const { data, error } = await supabaseClient
    .from("impacts")
    .select("*")
    .eq("gardien_id", gardienId)
    .eq("tireur_id", tireurId)
    .order("date_visionnage", { ascending: false })
    .limit(1)
    .maybeSingle();
  if(error) throw error;
  return data;
}

// Tous gardiens confondus — le Book agrège club-wide (cf. docs/prd.md §2.2).
async function getImpactsForTireur(tireurId){
  const { data, error } = await supabaseClient
    .from("impacts")
    .select("*")
    .eq("tireur_id", tireurId)
    .order("date_visionnage", { ascending: false });
  if(error) throw error;
  return data;
}

// Mode Match — STORY-10.
async function getEquipes(){
  const { data, error } = await supabaseClient.from("equipes").select("*").order("nom");
  if(error) throw error;
  return data;
}

async function createEquipe(nom){
  const { data, error } = await supabaseClient.from("equipes").insert({ nom }).select().single();
  if(error) throw error;
  return data;
}
