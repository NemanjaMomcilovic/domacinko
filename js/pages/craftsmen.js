const CRAFTSMEN = [
  { id: 'electrician', icon: '⚡', name: 'Električar', range: '3.000 – 15.000 RSD', desc: 'Ugradnja utičnica, osigurači, rasveta' },
  { id: 'plumber', icon: '🚿', name: 'Vodoinstalater', range: '2.500 – 12.000 RSD', desc: 'Curenje, slavine, bojler, kanalizacija' },
  { id: 'hvac', icon: '❄️', name: 'Klima servis', range: '4.000 – 20.000 RSD', desc: 'Čišćenje, punjenje freona, popravka' },
  { id: 'painter', icon: '🎨', name: 'Moler', range: '150 – 400 RSD/m²', desc: 'Farbanje zidova, gletovanje' },
  { id: 'locksmith', icon: '🔑', name: 'Bravar', range: '2.000 – 8.000 RSD', desc: 'Brave, štitnici, hitno otvaranje' },
  { id: 'gardener', icon: '🌿', name: 'Baštovan', range: '3.000 – 10.000 RSD', desc: 'Održavanje, orezivanje, navodnjavanje' },
  { id: 'appliance', icon: '🔌', name: 'Servis aparata', range: '2.500 – 15.000 RSD', desc: 'Bela tehnika, dijagnostika' },
  { id: 'roofer', icon: '🏠', name: 'Krovopokrivač', range: '5.000 – 30.000 RSD', desc: 'Curenje krova, oluci, izolacija' }
];

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('ai', { title: 'Mreža majstora', showBack: true, backHref: 'repairs.html' });

  document.getElementById('craftsmen-list').innerHTML = CRAFTSMEN.map(c => `
    <div class="module-card craftsmen-card" data-id="${c.id}">
      <span class="module-card__icon">${c.icon}</span>
      <span class="module-card__title">${c.name}</span>
      <span class="module-card__desc">${c.desc}</span>
      <span class="craftsmen-card__price">${c.range}</span>
    </div>
  `).join('');

  document.querySelectorAll('.craftsmen-card').forEach(card => {
    card.addEventListener('click', () => {
      const c = CRAFTSMEN.find(x => x.id === card.dataset.id);
      showToast(`${c.name}: ${c.range} (orijentaciono)`);
    });
  });
});
