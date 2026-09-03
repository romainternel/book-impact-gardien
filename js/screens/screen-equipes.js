/*
 * Écran Équipes — CRUD équipe (liste + création rapide). Maquette :
 * docs/design/mode-match.md — Écran Équipes. Pattern identique à
 * screen-gardien.js (liste/création inline/sélection).
 */

let _equipesScreen = { status: "loading", equipes: [], creating: false };

function renderScreenEquipes(){
  const s = _equipesScreen;
  const header = renderAppHeader("Équipes", { back: "parametres" });

  let body;
  if(s.status === "loading"){
    body = `<div class="skeleton-list"><div class="skeleton-row"></div><div class="skeleton-row"></div></div>`;
  }else if(s.status === "error"){
    body = `<div class="empty-state">
      <p>Connexion impossible — réessaie</p>
      <button class="btn-secondary" data-action="retry-equipes">Réessayer</button>
    </div>`;
  }else{
    const cards = s.equipes.map(function(e){
      return `<button class="list-card" data-action="select-equipe" data-id="${escapeHtml(e.id)}">${escapeHtml(e.nom)}</button>`;
    }).join("");

    const createBlock = s.creating
      ? `<div class="inline-create">
          <input type="text" id="new-equipe-nom" placeholder="Nom de l'équipe">
          <button class="btn-primary" data-action="confirm-create-equipe">Créer</button>
        </div>`
      : `<button class="list-card list-card-ghost" data-action="start-create-equipe">+ Nouvelle équipe</button>`;

    body = `${cards}${createBlock}`;
  }

  return `<div class="screen-equipes">${header}${body}</div>`;
}

function reRenderScreenEquipes(){
  document.getElementById("app").innerHTML = renderScreenEquipes();
  bindScreenEquipes();
}

function bindScreenEquipes(){
  bindAppHeader();

  document.querySelectorAll('[data-action="select-equipe"]').forEach(function(btn){
    btn.addEventListener("click", function(){
      const equipe = _equipesScreen.equipes.find(function(e){ return e.id === btn.dataset.id; });
      if(!equipe) return;
      state.equipeCourante = equipe;
      renderScreen("joueurs");
    });
  });

  const startCreate = document.querySelector('[data-action="start-create-equipe"]');
  if(startCreate){
    startCreate.addEventListener("click", function(){
      _equipesScreen.creating = true;
      reRenderScreenEquipes();
      const input = document.getElementById("new-equipe-nom");
      if(input) input.focus();
    });
  }

  const confirmCreate = document.querySelector('[data-action="confirm-create-equipe"]');
  if(confirmCreate){
    confirmCreate.addEventListener("click", async function(){
      const input = document.getElementById("new-equipe-nom");
      const nom = (input.value || "").trim();
      if(!nom) return;
      try{
        const equipe = await createEquipe(nom);
        state.equipeCourante = equipe;
        renderScreen("joueurs");
      }catch(e){
        _equipesScreen.status = "error";
        reRenderScreenEquipes();
      }
    });
  }

  const retry = document.querySelector('[data-action="retry-equipes"]');
  if(retry) retry.addEventListener("click", loadScreenEquipes);
}

async function loadScreenEquipes(){
  _equipesScreen = { status: "loading", equipes: [], creating: false };
  reRenderScreenEquipes();
  try{
    const equipes = await getEquipes();
    _equipesScreen = { status: "ready", equipes: equipes, creating: false };
    reRenderScreenEquipes();
  }catch(e){
    _equipesScreen = { status: "error", equipes: [], creating: false };
    reRenderScreenEquipes();
  }
}

registerScreen("equipes", renderScreenEquipes, loadScreenEquipes);
