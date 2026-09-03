/*
 * Écran Joueurs (d'une équipe) — CRUD joueur. Maquette :
 * docs/design/mode-match.md — Écran Joueurs. Réutilise POSTES et le
 * formulaire de création de tireur-form-shared.js (cf. docs/arch/mode-match.md §6) —
 * aucune duplication du référentiel POSTES ni du markup de création.
 * Filtrage client-side (volume par équipe faible, pas de recherche serveur
 * nécessaire contrairement à screen-tireur.js).
 */

let _joueursScreen = { status: "loading", joueurs: [], query: "", creating: false, editingId: null, saveError: "" };

function renderScreenJoueurs(){
  const eq = state.equipeCourante;
  if(!eq){
    return `<div class="screen-placeholder">Aucune équipe sélectionnée</div>`;
  }
  return `
    <div class="screen-joueurs">
      ${renderAppHeader(eq.nom, { back: "equipes" })}
      <input type="text" id="search-joueur" class="search-input" placeholder="Chercher un joueur..." autocomplete="off">
      <div id="joueurs-list-body"></div>
    </div>
  `;
}

function renderJoueurRow(j){
  const meta = posteLabel(j.poste);
  const lat = j.lateralite ? `<span class="tireur-lat">●${escapeHtml(j.lateralite)}</span>` : "";
  return `<div class="list-card-row">
    <div class="list-card tireur-row">
      <span class="tireur-row-top"><span class="tireur-nom">${escapeHtml(j.nom)}</span>${lat}</span>
      ${meta ? `<span class="tireur-meta">${escapeHtml(meta)}</span>` : ""}
    </div>
    <button class="list-card-edit-btn" data-action="edit-joueur" data-id="${escapeHtml(j.id)}" title="Modifier">✏️</button>
    <button class="list-card-delete-btn" data-action="delete-joueur" data-id="${escapeHtml(j.id)}" data-nom="${escapeHtml(j.nom)}" title="Supprimer">🗑</button>
  </div>`;
}

function renderJoueursListBody(){
  const s = _joueursScreen;

  if(s.status === "loading"){
    return `<div class="skeleton-list"><div class="skeleton-row"></div><div class="skeleton-row"></div></div>`;
  }
  if(s.status === "error"){
    return `<div class="empty-state"><p>Connexion impossible — réessaie</p><button class="btn-secondary" data-action="retry-joueurs">Réessayer</button></div>`;
  }
  if(s.creating){
    return renderCreateTireurForm({ showClub: false, submitLabel: "Créer" });
  }
  if(s.editingId){
    const joueur = s.joueurs.find(function(j){ return j.id === s.editingId; });
    const form = renderCreateTireurForm({
      initial: joueur,
      showClub: false,
      submitLabel: "Enregistrer",
      submitAction: "confirm-edit-tireur",
      cancelAction: "cancel-edit-tireur"
    });
    const err = s.saveError ? `<p class="form-error">${escapeHtml(s.saveError)}</p>` : "";
    return `${form}${err}`;
  }

  const query = s.query.trim().toLowerCase();
  const filtered = query ? s.joueurs.filter(function(j){ return j.nom.toLowerCase().includes(query); }) : s.joueurs;
  const rows = filtered.map(renderJoueurRow).join("");

  let emptyHint = "";
  if(s.joueurs.length === 0){
    emptyHint = `<p class="empty-hint">Aucun joueur dans cette équipe</p>`;
  }else if(filtered.length === 0){
    emptyHint = `<p class="empty-hint">Aucun résultat</p>`;
  }

  const createBtn = `<button class="list-card list-card-ghost" data-action="start-create-joueur">+ Nouveau joueur</button>`;

  return `${rows}${emptyHint}${createBtn}`;
}

function refreshJoueursListBody(){
  document.getElementById("joueurs-list-body").innerHTML = renderJoueursListBody();
  bindJoueursListBody();
}

function bindJoueursListBody(){
  const startCreate = document.querySelector('[data-action="start-create-joueur"]');
  if(startCreate){
    startCreate.addEventListener("click", function(){
      _joueursScreen.creating = true;
      refreshJoueursListBody();
    });
  }

  const confirmCreate = document.querySelector('[data-action="confirm-create-tireur"]');
  if(confirmCreate){
    confirmCreate.addEventListener("click", async function(){
      const fields = readTireurFormFields();
      if(!fields.nom) return;
      fields.equipe_id = state.equipeCourante.id;
      try{
        const joueur = await createTireur(fields);
        _joueursScreen.joueurs.push(joueur);
        _joueursScreen.joueurs.sort(function(a, b){ return a.nom.localeCompare(b.nom); });
        _joueursScreen.creating = false;
        refreshJoueursListBody();
      }catch(e){
        _joueursScreen.status = "error";
        refreshJoueursListBody();
      }
    });
  }

  bindLatToggle();

  document.querySelectorAll('[data-action="delete-joueur"]').forEach(function(btn){
    btn.addEventListener("click", async function(){
      await confirmAndDelete(btn.dataset.id, btn.dataset.nom, deleteTireur, function(){
        _joueursScreen.joueurs = _joueursScreen.joueurs.filter(function(j){ return j.id !== btn.dataset.id; });
        refreshJoueursListBody();
      });
    });
  });

  document.querySelectorAll('[data-action="edit-joueur"]').forEach(function(btn){
    btn.addEventListener("click", function(){
      _joueursScreen.editingId = btn.dataset.id;
      _joueursScreen.saveError = "";
      refreshJoueursListBody();
    });
  });

  const cancelEdit = document.querySelector('[data-action="cancel-edit-tireur"]');
  if(cancelEdit){
    cancelEdit.addEventListener("click", function(){
      _joueursScreen.editingId = null;
      _joueursScreen.saveError = "";
      refreshJoueursListBody();
    });
  }

  const confirmEdit = document.querySelector('[data-action="confirm-edit-tireur"]');
  if(confirmEdit){
    confirmEdit.addEventListener("click", async function(){
      const fields = readTireurFormFields();
      if(!fields.nom) return;
      try{
        const updated = await updateTireur(_joueursScreen.editingId, fields);
        const idx = _joueursScreen.joueurs.findIndex(function(j){ return j.id === updated.id; });
        if(idx !== -1) _joueursScreen.joueurs[idx] = updated;
        _joueursScreen.joueurs.sort(function(a, b){ return a.nom.localeCompare(b.nom); });
        _joueursScreen.editingId = null;
        _joueursScreen.saveError = "";
        refreshJoueursListBody();
      }catch(e){
        _joueursScreen.saveError = "Échec de l'enregistrement — réessaie.";
        refreshJoueursListBody();
      }
    });
  }

  const retry = document.querySelector('[data-action="retry-joueurs"]');
  if(retry) retry.addEventListener("click", loadJoueurs);
}

async function loadJoueurs(){
  _joueursScreen.status = "loading";
  _joueursScreen.creating = false;
  _joueursScreen.editingId = null;
  refreshJoueursListBody();
  try{
    const joueurs = await getJoueursByEquipe(state.equipeCourante.id);
    _joueursScreen.joueurs = joueurs;
    _joueursScreen.status = "ready";
    refreshJoueursListBody();
  }catch(e){
    _joueursScreen.status = "error";
    refreshJoueursListBody();
  }
}

function onMountScreenJoueurs(){
  _joueursScreen = { status: "loading", joueurs: [], query: "", creating: false, editingId: null, saveError: "" };
  if(!state.equipeCourante) return;
  const input = document.getElementById("search-joueur");
  input.addEventListener("input", function(){
    _joueursScreen.query = input.value;
    refreshJoueursListBody();
  });
  bindAppHeader();
  loadJoueurs();
}

registerScreen("joueurs", renderScreenJoueurs, onMountScreenJoueurs);
