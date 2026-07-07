function renderProjects() {
  const projects = getProjects();
  const container = document.getElementById('projects-list');
  if (projects.length === 0) {
    container.innerHTML = renderEmptyState('🛠️', 'Nema projekata', 'Kreirajte prvi DIY projekat.');
    return;
  }
  container.innerHTML = projects.map(p => `
    <div class="list-item project-item" data-id="${p.id}">
      <div class="list-item__icon">🛠️</div>
      <div class="list-item__content">
        <div class="list-item__title">${p.name}</div>
        <div class="list-item__subtitle">${formatCurrency(p.budget)} · ${p.status}</div>
      </div>
      <button class="btn btn--ghost btn--sm view-proj" data-id="${p.id}">→</button>
    </div>
  `).join('');

  container.querySelectorAll('.view-proj').forEach(btn => {
    btn.addEventListener('click', () => showProjectDetail(btn.dataset.id));
  });
}

function showProjectDetail(id) {
  const project = getProjects().find(p => p.id === id);
  if (!project) return;

  let materials = project.materials;
  if (!materials || materials.length === 0) {
    materials = generateProjectMaterials(project.name, project.dimensions);
    updateProject(id, { materials });
  }

  const workOrder = project.workOrder?.length ? project.workOrder : [
    '1. Pripremite prostor i zaštitite pod',
    '2. Nabavite materijal prema listi',
    '3. Izvršite glavni posao',
    '4. Očistite i proverite kvalitet'
  ];

  const el = document.getElementById('project-detail');
  el.classList.remove('hidden');
  el.innerHTML = `
    <div class="section">
      <div class="section__header">
        <h2 class="section__title">${project.name}</h2>
        <button class="btn btn--ghost btn--sm" id="close-proj">✕</button>
      </div>
      <div class="card card--flat" style="padding:var(--space-md)">
        <p><strong>Budžet:</strong> ${formatCurrency(project.budget)}</p>
        ${project.dimensions ? `<p><strong>Dimenzije:</strong> ${project.dimensions}</p>` : ''}
        ${project.photo ? `<img src="${project.photo}" alt="${project.name}" loading="lazy" style="max-width:100%;border-radius:8px;margin-top:8px">` : ''}
        <h3 class="mt-md mb-sm">Lista materijala (AI)</h3>
        <ul class="project-materials">
          ${materials.map(m => `<li>${m.name} — ${m.qty}${m.note ? ` (${m.note})` : ''}</li>`).join('')}
        </ul>
        <h3 class="mt-md mb-sm">Redosled radova</h3>
        <ol class="project-workorder">
          ${workOrder.map(w => `<li>${w.replace(/^\d+\.\s*/, '')}</li>`).join('')}
        </ol>
        <button class="btn btn--danger btn--sm mt-md del-proj" data-id="${id}">Obriši projekat</button>
      </div>
    </div>
  `;

  document.getElementById('close-proj').addEventListener('click', () => el.classList.add('hidden'));
  document.querySelector('.del-proj')?.addEventListener('click', () => {
    if (confirm('Obrisati projekat?')) {
      deleteProject(id);
      el.classList.add('hidden');
      renderProjects();
      showToast('Projekat obrisan.');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('settings', { title: 'Projekti', showBack: true, backHref: 'home.html' });
  renderProjects();

  let pendingProjectPhoto = null;
  document.getElementById('proj-photo')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500000) {
      showToast('Slika je prevelika (max 500 KB).', 'warning');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      pendingProjectPhoto = compressImageForStorage(reader.result);
      document.getElementById('proj-photo-preview').innerHTML =
        `<img src="${pendingProjectPhoto}" alt="Pregled" style="max-width:100%;border-radius:8px;margin-top:8px" loading="lazy">`;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('add-project').addEventListener('click', () => {
    const name = document.getElementById('proj-name').value.trim();
    if (!name) {
      showToast(getErrorMessage('required'), 'warning');
      return;
    }
    const project = addProject({
      name,
      budget: document.getElementById('proj-budget').value,
      dimensions: document.getElementById('proj-dims').value.trim(),
      photo: pendingProjectPhoto,
      materials: generateProjectMaterials(name, document.getElementById('proj-dims').value.trim())
    });
    document.getElementById('proj-name').value = '';
    document.getElementById('proj-budget').value = '';
    document.getElementById('proj-dims').value = '';
    document.getElementById('proj-photo').value = '';
    document.getElementById('proj-photo-preview').innerHTML = '';
    pendingProjectPhoto = null;
    renderProjects();
    showProjectDetail(project.id);
    showToast('Projekat kreiran!', 'success');
  });
});
