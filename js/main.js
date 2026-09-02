/*
 * Bootstrap. Si un gardien est déjà mémorisé (localStorage), on saute
 * l'écran de sélection et on arrive directement sur l'écran tireur.
 */

registerScreen("placeholder", function(){
  return `<div class="screen-placeholder">Book Impact Gardien</div>`;
});

document.addEventListener("DOMContentLoaded", function(){
  const gardien = loadGardienFromStorage();
  if(gardien){
    state.gardienId = gardien.id;
    state.gardienNom = gardien.nom;
    renderScreen("tireur");
  }else{
    renderScreen("gardien");
  }
});
