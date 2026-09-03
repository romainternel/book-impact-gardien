/*
 * État applicatif en mémoire. Persistance localStorage limitée au gardien
 * actif (cf. docs/architecture.md §4) — le reste de l'état ne survit pas
 * à un rechargement de page, par choix (usage en session continue).
 */

const STORAGE_KEY_GARDIEN = "bookimpact.gardien";

const state = {
  currentScreen: null,
  gardienId: null,
  gardienNom: null,
  tireurCourant: null,
  dernierTypeTir: null,
  derniereMain: null,
  dernierImpact: null,
  equipeCourante: null,
  matchCourant: null,
};

function loadGardienFromStorage(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY_GARDIEN);
    if(!raw) return null;
    const gardien = JSON.parse(raw);
    if(!gardien || !gardien.id) return null;
    return gardien;
  }catch(e){
    return null;
  }
}

function saveGardienToStorage(gardien){
  state.gardienId = gardien.id;
  state.gardienNom = gardien.nom;
  localStorage.setItem(STORAGE_KEY_GARDIEN, JSON.stringify(gardien));
}

function clearGardienFromStorage(){
  state.gardienId = null;
  state.gardienNom = null;
  localStorage.removeItem(STORAGE_KEY_GARDIEN);
}
