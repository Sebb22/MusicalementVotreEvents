import { DashboardEditor } from './dashboardEditor.js';

export function showFormMessage(message, type = 'success') {
  const msgDiv = document.getElementById('form-message');
  if (!msgDiv) return;

  // Réinitialiser classes
  msgDiv.className = 'form-message';
  void msgDiv.offsetWidth; // force reflow pour relancer la transition

  // Ajouter type et show
  msgDiv.textContent = message;
  console.log(msgDiv);
  msgDiv.classList.add(type, 'show');

  // Retirer show après 4s pour faire disparaître
  setTimeout(() => {
    msgDiv.classList.remove('show');
  }, 4000);
}

export function initDashboard({
  formId,
  tableId,
  previewSelectors,
  attributesContainer,
}) {
  const form = document.getElementById(formId);
  if (!form) return null;

  const dashboardEditor = new DashboardEditor({
    form,
    preview: {
      name: document.getElementById(previewSelectors.name),
      price: document.getElementById(previewSelectors.price),
      stock: document.getElementById(previewSelectors.stock),
      availability: document.getElementById(previewSelectors.availability),
      image: document.getElementById(previewSelectors.image),
      category: document.getElementById('preview-category'),
    },
    attributesContainer,
    previewAttributes: document.getElementById('preview-attributes'),
    tableId,
  });

  // ---------------------------
  // Submit AJAX
  // ---------------------------
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData(form);
    console.log('[submit] envoi editId =', form.dataset.editId);

    try {
      const res = await fetch(form.action, { method: 'POST', body: formData });
      const result = await res.json();
      if (result.success) {
        showFormMessage(result.message, 'success');
        dashboardEditor.updateTableRow(result.data);

        // Si c'était un ajout ou une édition, passer automatiquement à l'onglet liste
        const listTab = document.querySelector(
          '.dashboard-tab[data-tab="list"]'
        );
        listTab && switchTab(listTab);

        !form.dataset.editId && dashboardEditor.reset();
      } else {
        showFormMessage(result.message, 'error');
      }
    } catch {
      showFormMessage('Erreur de communication avec le serveur', 'error');
    }
  });

  // ---------------------------
  // Gestion onglets avec switchTab
  // ---------------------------
  const tabs = document.querySelectorAll('.dashboard-tab');
  const panes = document.querySelectorAll('.dashboard-pane');

  let preventNextReset = false;

  function switchTab(tabElement) {
    const targetId = `tab-${tabElement.dataset.tab}`;

    panes.forEach(p => p.classList.remove('active'));
    document.getElementById(targetId)?.classList.add('active');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = `tab-${tab.dataset.tab}`;

        // Affiche le bon panneau
        panes.forEach(p => p.classList.remove('active'));
        document.getElementById(targetId)?.classList.add('active');

        // Active le bouton
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Si on passe sur le formulaire
        if (targetId === 'tab-form') {
          if (tab.dataset.action === 'add') {
            // Force le mode ajout
            dashboardEditor.reset();
          }
        }
      });
    });
  }

  tabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab)));

  // ---------------------------
  // Edition depuis la table (delegation)
  // ---------------------------
  const table = document.getElementById(tableId);
  if (table) {
    table.addEventListener('click', e => {
      const editBtn = e.target.closest('.edit-article');
      if (!editBtn) return;
      const tr = editBtn.closest('tr');
      if (!tr) return;

      dashboardEditor.editItem(JSON.parse(tr.dataset.item));

      const formTab = document.querySelector('.dashboard-tab[data-tab="form"]');
      if (formTab) {
        preventNextReset = true;
        switchTab(formTab);
      }
    });
  }

  // ---------------------------
  // Supprimer l’image
  // ---------------------------
  document.getElementById('remove-image')?.addEventListener('click', () => {
    dashboardEditor.preview.image.src =
      'https://via.placeholder.com/400x250?text=Aperçu';
    form.querySelector('#image').value = '';
  });

  // ---------------------------
  // Toggle mobile preview
  // ---------------------------
  const previewWrapper = document.querySelector('.dashboard-preview-wrapper');
  document.querySelectorAll('.mobile-toggle-preview').forEach(btn => {
    btn.textContent = 'Voir l’aperçu ⬇️';
    btn.addEventListener('click', () => {
      const active = previewWrapper.classList.toggle('active');
      btn.textContent = active ? 'Cacher l’aperçu ❌' : 'Voir l’aperçu ⬇️';
    });
  });

  return dashboardEditor;
}
