/* ============================================================
   CodeNamesScript.js
   Gère : lobby (CodeName.html) + salle (Room.html)
   ============================================================ */

/* ============================= */
/* UTILITAIRES COMMUNS           */
/* ============================= */

// Sauvegarde / lecture du nom d'agent en localStorage
function getAgentName() {
  return localStorage.getItem('cn_agent_name') || 'AGENT_???';
}

function setAgentName(name) {
  const clean = name.trim().toUpperCase().replace(/\s+/g, '_') || 'AGENT_???';
  localStorage.setItem('cn_agent_name', clean);
  return clean;
}

/* ============================= */
/* OPT-BTNS (toggle dans groupe) */
/* ============================= */
function toggle(btn) {
  if (btn.disabled) return;
  const siblings = btn.closest('.setting-options').querySelectorAll('.opt-btn');
  siblings.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

/* ============================================================
   LOBBY — CodeName.html
   ============================================================ */

// ---- Pseudo ----
function initAgentName() {
  const input = document.getElementById('agent-name');
  if (!input) return;
  input.value = getAgentName();
}

function saveName() {
  const input = document.getElementById('agent-name');
  if (!input) return;
  const clean = setAgentName(input.value);
  input.value = clean;

  // Feedback visuel
  const btn = document.querySelector('.agent-save-btn');
  if (btn) {
    btn.textContent = '✔ ENREGISTRÉ';
    setTimeout(() => {
      btn.textContent = '✦ OK ✦';
      btn.style.color = '';
      btn.style.borderColor = '';
    }, 1500);
  }
}

// ---- Rooms ----
let roomCount = 3;
let selectedModalMode = 'coop';

function openModal() {
  document.getElementById('modal').classList.add('open');
  // Reset
  document.getElementById('room-name-input').value = '';
  selectedModalMode = 'coop';
  // Remet co-op actif
  document.querySelectorAll('.modal-mode-grid .mode-btn').forEach(b => b.classList.remove('active'));
  const first = document.querySelector('.modal-mode-grid .mode-btn:not(:disabled)');
  if (first) first.classList.add('active');
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

function closeOnOverlay(e) {
  if (e.target === document.getElementById('modal')) closeModal();
}

function selectModalMode(btn, mode) {
  if (btn.disabled) return;
  document.querySelectorAll('.modal-mode-grid .mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedModalMode = mode;
}

function createRoom() {
  const rawName = document.getElementById('room-name-input').value.trim();
  roomCount++;
  const roomName = rawName || `OPÉRATION ${String(roomCount).padStart(2, '0')}`;

  // Sauvegarde pour Room.html
  localStorage.setItem('cn_room_name', roomName);
  localStorage.setItem('cn_room_mode', selectedModalMode);

  // Redirige vers la salle
  window.location.href = '/Games/CodeNames/Room.html';
}

function joinRoom(name, mode) {
  localStorage.setItem('cn_room_name', name);
  localStorage.setItem('cn_room_mode', mode);
  window.location.href = '/Games/CodeNames/Room.html';
}

/* ============================================================
   SALLE — Room.html
   ============================================================ */

// Joueurs temporaires (simulation)
const FAKE_PLAYERS = [
  { name: 'GHOST_47',   role: 'espion',     team: 'red',  avatar: '🕵️' },
  { name: 'SHADOW_X',   role: 'agent',      team: 'blue', avatar: '🧑‍💼' },
  { name: 'CIPHER_9',   role: 'spectateur', team: null,   avatar: '👁️' },
];

let myRole = 'spectateur';
let myTeam = null;
let roomMode = 'coop';

function initRoom() {
  const titleEl   = document.getElementById('room-title');
  const badgeEl   = document.getElementById('room-mode-badge');
  const countEl   = document.getElementById('player-count');

  const roomName = localStorage.getItem('cn_room_name') || 'OPÉRATION ???';
  roomMode       = localStorage.getItem('cn_room_mode') || 'coop';

  if (titleEl) titleEl.textContent = roomName.toUpperCase();
  if (badgeEl) badgeEl.textContent = roomMode === 'duel' ? 'DUEL' : 'CO-OP';
  if (countEl) countEl.textContent = FAKE_PLAYERS.length + 1;

  buildRoleButtons();
  buildPlayerList();
}

function buildRoleButtons() {
  const container = document.getElementById('role-btns');
  const teamRow   = document.getElementById('team-selector-row');
  if (!container) return;

  container.innerHTML = '';

  const roles = ['spectateur', 'agent', 'espion'];
  roles.forEach(r => {
    const btn = document.createElement('button');
    btn.className = 'role-btn' + (r === myRole ? ' active' : '') + (r === 'spectateur' ? ' spectator' : '');
    btn.textContent = r === 'spectateur' ? '👁 SPECTATEUR' : r === 'agent' ? '🧑‍💼 AGENT' : '🕵️ ESPION';
    btn.onclick = () => selectRole(r, btn);
    container.appendChild(btn);
  });

  // Affiche le choix d'équipe seulement en mode duel
  if (teamRow) {
    teamRow.style.display = roomMode === 'duel' ? 'flex' : 'none';
  }
}

function selectRole(role, btn) {
  myRole = role;
  document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  buildPlayerList(); // refresh ma carte
}

function selectTeam(team, btn) {
  myTeam = team;
  document.querySelectorAll('.team-selector-row .team-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  buildPlayerList();
}

function buildPlayerList() {
  const list = document.getElementById('players-list');
  if (!list) return;

  list.innerHTML = '';

  // Ma carte en premier
  const myName = getAgentName();
  list.appendChild(makePlayerCard({
    name:   myName,
    role:   myRole,
    team:   myTeam,
    avatar: '🕹️',
    isMe:   true,
  }));

  // Les autres (simulés)
  FAKE_PLAYERS.forEach((p, i) => {
    const card = makePlayerCard(p);
    card.style.animationDelay = (i * 0.08 + 0.1) + 's';
    list.appendChild(card);
  });

  // Mise à jour compteur
  const countEl = document.getElementById('player-count');
  if (countEl) countEl.textContent = FAKE_PLAYERS.length + 1;
}

function makePlayerCard({ name, role, team, avatar, isMe }) {
  const card = document.createElement('div');

  let teamClass = '';
  if (team === 'red')  teamClass = 'team-red';
  if (team === 'blue') teamClass = 'team-blue';

  card.className = `player-card ${teamClass} ${isMe ? 'is-me' : ''}`;

  const roleLabel = role === 'agent' ? 'AGENT' : role === 'espion' ? 'ESPION' : 'SPECTATEUR';
  const roleCls   = `role-${role}`;

  card.innerHTML = `
    <span class="player-avatar">${avatar}</span>
    <div class="player-info">
      <span class="player-name">${name}</span>
      <span class="player-role-badge ${roleCls}">${roleLabel}</span>
    </div>
    ${isMe ? '<span class="player-me-tag">◄ VOUS</span>' : ''}
  `;
  return card;
}

/* ---- Accordéon options ---- */
let accordionOpen = false;
function toggleAccordion() {
  accordionOpen = !accordionOpen;
  const body  = document.getElementById('accordion-body');
  const arrow = document.getElementById('accordion-arrow');
  if (body)  body.classList.toggle('open', accordionOpen);
  if (arrow) arrow.classList.toggle('open', accordionOpen);
}

/* ---- Launch ---- */
function launch() {
  const btn = document.querySelector('.launch-btn');
  const sub = document.getElementById('launch-sub');
  if (!btn) return;

  btn.innerHTML = '<span>✅</span> MISSION CONFIRMÉE — CHARGEMENT...';
  btn.style.background = 'var(--green)';
  if (sub) sub.textContent = '▶ CONNEXION EN COURS...';

  setTimeout(() => {
    btn.innerHTML = '<span class="launch-icon">✦</span> LANCER LA MISSION <span class="launch-icon">✦</span>';
    btn.style.background = '';
    if (sub) sub.textContent = '⌛ EN ATTENTE DE CONFIRMATION DE L\'AGENT';
  }, 2500);
}

/* ---- Mode selector (Room.html) ---- */
function selectMode(btn) {
  if (btn.disabled) return;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

/* ============================================================
   INIT — détecte la page et lance le bon init
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const isRoom = !!document.getElementById('room-title');
  const isLobby = !!document.getElementById('rooms-list');

  if (isLobby) initAgentName();
  if (isRoom)  initRoom();

  // ESC ferme la modale si on est sur le lobby
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('modal');
      if (modal) modal.classList.remove('open');
    }
  });
});