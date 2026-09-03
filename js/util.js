function escapeHtml(str){
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/*
 * Suppression avec confirmation native — STORY-15. Les contraintes de clé
 * étrangère existantes (ON DELETE RESTRICT, comportement par défaut Postgres)
 * bloquent nativement la suppression d'une ligne encore référencée (ex.
 * équipe avec des joueurs) : pas de vérification applicative à faire soi-même,
 * juste intercepter l'erreur 23503 et l'afficher clairement.
 */
async function confirmAndDelete(id, label, deleteFn, onSuccess){
  const ok = window.confirm(`Supprimer "${label}" ? Cette action est irréversible.`);
  if(!ok) return;
  try{
    await deleteFn(id);
    onSuccess();
  }catch(e){
    if(e && e.code === "23503"){
      window.alert(`Impossible de supprimer "${label}" : des données liées existent encore (joueurs, matchs ou tirs enregistrés). Supprime-les d'abord.`);
    }else{
      window.alert("Échec de la suppression — réessaie.");
    }
  }
}
