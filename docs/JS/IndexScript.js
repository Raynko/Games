  // Compte dynamique des jeux
  const cards = document.querySelectorAll('.game-card-link');
  const countEl = document.getElementById('game-count');
  if (countEl) {
    countEl.textContent = cards.length;
    const label = countEl.nextSibling;
    if (label) label.textContent = cards.length > 1 ? ' jeux' : ' jeu';
  }

  // Pop son visuel au clic sur le logo
  const logo = document.querySelector('.logo');
  logo.addEventListener('click', () => {
    logo.style.animation = 'none';
    void logo.offsetWidth;
    logo.style.animation = 'wiggle 0.4s ease-in-out';
  });   