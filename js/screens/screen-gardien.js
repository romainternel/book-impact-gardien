/*
 * Écran 1 — Sélection gardien. Maquette : docs/design/book-impact-gardien.md
 * Écran 1. Sélection mémorisée en localStorage (state.js) — cet écran n'est
 * atteint au démarrage que si aucun gardien n'est déjà mémorisé (cf. main.js).
 */

let _gardienScreen = { status: "loading", gardiens: [], creating: false };

function renderScreenGardien(){
  const s = _gardienScreen;
  const header = renderAppHeader("Book Impact Gardien", { showChangeGardien: !!state.gardienId });

  let body;
  if(s.status === "loading"){
    body = `<div class="skeleton-list">
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
    </div>`;
  } else if(s.status === "error"){
    body = `<div class="empty-state">
      <p>Connexion impossible — réessaie</p>
      <button class="btn-secondary" data-action="retry">Réessayer</button>
    </div>`;
  } else {
    const cards = s.gardiens.map(g =>
      `<button class="list-card" data-action="select-gardien" data-id="${escapeHtml(g.id)}">${escapeHtml(g.nom)}</button>`
    ).join("");

    const createBlock = s.creating
      ? `<div class="inline-create">
          <input type="text" id="new-gardien-nom" placeholder="Nom du gardien">
          <button class="btn-primary" data-action="confirm-create-gardien">Créer</button>
        </div>`
      : `<button class="list-card list-card-ghost" data-action="start-create-gardien">+ Nouveau gardien</button>`;

    body = `${cards}${createBlock}`;
  }

  return `
    <div class="screen-gardien">
      ${header}
      <p class="screen-subtitle">Qui es-tu ?</p>
      ${body}
    </div>
  `;
}

function reRenderScreenGardien(){
  document.getElementById("app").innerHTML = renderScreenGardien();
  bindScreenGardien();
}

function bindScreenGardien(){
  bindAppHeader();

  document.querySelectorAll('[data-action="select-gardien"]').forEach(function(btn){
    btn.addEventListener("click", function(){
      const gardien = _gardienScreen.gardiens.find(g => g.id === btn.dataset.id);
      if(!gardien) return;
      saveGardienToStorage(gardien);
      renderScreen("accueil");
    });
  });

  const startCreate = document.querySelector('[data-action="start-create-gardien"]');
  if(startCreate){
    startCreate.addEventListener("click", function(){
      _gardienScreen.creating = true;
      reRenderScreenGardien();
      const input = document.getElementById("new-gardien-nom");
      if(input) input.focus();
    });
  }

  const confirmCreate = document.querySelector('[data-action="confirm-create-gardien"]');
  if(confirmCreate){
    confirmCreate.addEventListener("click", async function(){
      const input = document.getElementById("new-gardien-nom");
      const nom = (input.value || "").trim();
      if(!nom) return;
      try{
        const gardien = await createGardien(nom);
        saveGardienToStorage(gardien);
        renderScreen("accueil");
      }catch(e){
        _gardienScreen.status = "error";
        reRenderScreenGardien();
      }
    });
  }

  const retry = document.querySelector('[data-action="retry"]');
  if(retry) retry.addEventListener("click", loadScreenGardien);
}

async function loadScreenGardien(){
  _gardienScreen = { status: "loading", gardiens: [], creating: false };
  reRenderScreenGardien();
  try{
    const gardiens = await getGardiens();
    _gardienScreen = { status: "ready", gardiens: gardiens, creating: false };
    reRenderScreenGardien();
  }catch(e){
    _gardienScreen = { status: "error", gardiens: [], creating: false };
    reRenderScreenGardien();
  }
}

registerScreen("gardien", renderScreenGardien, loadScreenGardien);
