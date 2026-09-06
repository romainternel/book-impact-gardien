/*
 * Bootstrap. Si un gardien est déjà mémorisé (localStorage), on vérifie
 * qu'il existe toujours en base avant de lui faire confiance, puis on
 * saute l'écran de sélection pour arriver directement sur Accueil.
 *
 * Correctif Audit Final 2026-09-05 : sans cette vérification, un gardien
 * supprimé (depuis un autre appareil, ou en base directement) restait
 * mémorisé indéfiniment côté client — l'app démarrait dessus sans jamais
 * détecter l'incohérence, et toute saisie échouait ensuite en boucle
 * (contrainte FK gardien_id) sans que l'utilisateur comprenne pourquoi.
 */

registerScreen("placeholder", function(){
  return `<div class="screen-placeholder">Book Impact Gardien</div>`;
});

document.addEventListener("DOMContentLoaded", async function(){
  const gardien = loadGardienFromStorage();
  if(!gardien){
    renderScreen("gardien");
    return;
  }
  renderScreen("placeholder");
  try{
    const gardiens = await getGardiens();
    const stillExists = gardiens.some(function(g){ return g.id === gardien.id; });
    if(stillExists){
      state.gardienId = gardien.id;
      state.gardienNom = gardien.nom;
      renderScreen("accueil");
      return;
    }
    clearGardienFromStorage();
  }catch(e){
    // Vérification impossible (réseau indisponible au démarrage) : on
    // retombe sur l'écran de sélection, qui gère déjà son propre état
    // d'erreur/retry (cf. screen-gardien.js) — pas de cas spécial ici.
  }
  renderScreen("gardien");
});
