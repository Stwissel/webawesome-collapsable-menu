const page = document.querySelector('wa-page');
const modes = ['full', 'compact'];
const switchButton = document.getElementById('menu-switcher');
const REAL_BREAKPOINT = '768px';

function setNavMode(mode) {
  console.log(`Setting mode to ${mode}`);
  page.dataset.nav = mode;
}

switchButton.addEventListener('click', () => {
  const next = page.dataset.nav == 'full' ? 'compact' : 'full';
  setNavMode(next);
});

setNavMode('full');
