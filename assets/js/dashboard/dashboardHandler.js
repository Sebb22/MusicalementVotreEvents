import { DashboardEditor } from './dashboardEditor.js';

// ---------------------------
// Messages de formulaire
// ---------------------------
export function showFormMessage(message, type = 'success') {
  const msgDiv = document.getElementById('form-message');
  if (!msgDiv) return;

  msgDiv.className = 'form-message'; // reset classes
  void msgDiv.offsetWidth; // relancer transition
  msgDiv.textContent = message;
  msgDiv.classList.add(type, 'show');

  setTimeout(() => msgDiv.classList.remove('show'), 4000);
}
// ---------------------------
// Modal confirmation
// ---------------------------
export function initConfirmModal() {
  const modal = document.getElementById('confirm-modal');
  const msg = document.getElementById('confirm-message');
  const yesBtn = document.getElementById('confirm-yes');
  const noBtn = document.getElementById('confirm-no');

  function showConfirm(message) {
    return new Promise(resolve => {
      msg.textContent = message;
      modal.classList.add('active');

      const close = confirmed => {
        modal.classList.remove('active');
        setTimeout(() => resolve(confirmed), 300);
      };

      yesBtn.onclick = () => close(true);
      noBtn.onclick = () => close(false);

      modal.onclick = e => {
        if (e.target === modal) close(false);
      };
    });
  }

  return { showConfirm };
}

export function showConfirm(message) {
  return new Promise(resolve => {
    const modal = document.getElementById('confirm-modal');
    const msg = document.getElementById('confirm-message');
    const yesBtn = document.getElementById('confirm-yes');
    const noBtn = document.getElementById('confirm-no');

    msg.textContent = message;
    modal.classList.add('active');

    yesBtn.onclick = () => {
      modal.classList.remove('active');
      resolve(true);
    };
    noBtn.onclick = () => {
      modal.classList.remove('active');
      resolve(false);
    };
  });
}

export function initDashboard({
  formId,
  tableId,
  previewSelectors,
  attributesContainer,
}) {
  const form = document.getElementById(formId);
  const table = document.getElementById(tableId);
  const filter = document.querySelector('.dashboard-filter');

  if (!form || !table) return null;

  let preventNextReset = false;

  // ---------------------------
  // Init DashboardEditor
  // ---------------------------
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

    // Supprimer l'image si aucun fichier choisi
    const fileInput = form.querySelector('#image');
    const file = fileInput?.files[0];
    if (!file || file.size === 0) {
      formData.delete('image');
    }

    const isEditMode = !!form.dataset.editId;

    try {
      const res = await fetch(form.action, { method: 'POST', body: formData });
      const text = await res.text();

      let result;
      try {
        result = JSON.parse(text);
      } catch {
        console.error('Réponse non-JSON :', text);
        showFormMessage(
          'Réponse invalide du serveur (pas du JSON). Vérifie qu’il n’y a pas de var_dump ou d’erreurs PHP.',
          'error'
        );
        return;
      }

      console.log('[Debug] Réponse serveur :', result);

      if (result.success) {
        showFormMessage(result.message, 'success');
        dashboardEditor.updateTableRow(result.data);

        // Retour à l'onglet liste
        const listTab = document.querySelector('.dashboard-tab[data-tab="list"]');
        if (listTab) switchTab(listTab);

        // Reset formulaire uniquement si on était en ajout
        if (!isEditMode) {
          dashboardEditor.reset();
        } else {
          form.dataset.editId = '';
          dashboardEditor.setMode('add');
        }
      } else {
        showFormMessage(result.message, 'error');
      }
    } catch (err) {
      console.error('Erreur réseau/fetch :', err);
      showFormMessage('Erreur de communication avec le serveur', 'error');
    }
  });
  
  

  // ---------------------------
  // Onglets
  // ---------------------------
  const tabs = document.querySelectorAll('.dashboard-tab');
  const panes = document.querySelectorAll('.dashboard-pane');

  function switchTab(tabElement) {
    const targetId = `tab-${tabElement.dataset.tab}`;
    panes.forEach(p => p.classList.remove('active'));
    document.getElementById(targetId)?.classList.add('active');
    tabs.forEach(t => t.classList.remove('active'));
    tabElement.classList.add('active');

    if (filter)
      filter.style.display = targetId === 'tab-list' ? 'flex' : 'none';

    if (
      targetId === 'tab-form' &&
      tabElement.dataset.action === 'add' &&
      !preventNextReset
    ) {
      dashboardEditor.reset();
    }
    preventNextReset = false;
  }

  tabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab)));

  // ---------------------------
  // Table delegation (edit + delete)
  // ---------------------------
  table.addEventListener('click', async e => {
    const tr = e.target.closest('tr');
    if (!tr) return;

    // ---------------------------
    // Edit
    // ---------------------------
    const editBtn = e.target.closest('.edit-article');
    if (editBtn) {
      dashboardEditor.editItem(JSON.parse(tr.dataset.item));
      const formTab = document.querySelector('.dashboard-tab[data-tab="form"]');
      if (formTab) {
        preventNextReset = true;
        switchTab(formTab);
      }
      return;
    }

    // ---------------------------
    // Delete single
    // ---------------------------
    const deleteBtn = e.target.closest('.btn-delete');
    if (deleteBtn) {
      e.preventDefault();
      const itemData = JSON.parse(tr.dataset.item);
      const confirmed = await showConfirm(
        `Supprimer l'article "${itemData.name}" ?\nCatégorie : ${itemData.location_name || '-'}\nStock : ${itemData.stock}`
      );
      if (!confirmed) return;

      try {
        const res = await fetch('/dashboard/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: itemData.id }),
        });
        const result = await res.json();
        if (result.success) {
          tr.remove();
          showFormMessage(result.message, 'success');
        } else {
          showFormMessage(result.message, 'error');
        }
      } catch {
        showFormMessage('Erreur de communication', 'error');
      }
    }
  });

  // ---------------------------
  // Suppression multiple avec noms des articles
  // ---------------------------
  document
    .getElementById('delete-selected')
    ?.addEventListener('click', async () => {
      // Récupérer uniquement les checkboxes cochées
      const selectedCheckboxes = [
        ...document.querySelectorAll('.item-checkbox:checked'),
      ];
      console.log('[Debug] Checkboxes sélectionnées :', selectedCheckboxes);

      if (!selectedCheckboxes.length) {
        showFormMessage(
          'Veuillez sélectionner au moins un article à supprimer.',
          'error'
        );
        return;
      }

      // Extraire ID + nom de chaque ligne
      const selectedArticles = selectedCheckboxes
        .map(cb => {
          const tr = cb.closest('tr');
          if (!tr) return null;

          const nameCell = tr.querySelector('td[data-label="Nom"]');
          const name = nameCell ? nameCell.textContent.trim() : '';
          const id = cb.dataset.id;
          return { id, name };
        })
        .filter(Boolean);

      console.log('[Debug] Articles sélectionnés :', selectedArticles);

      // Construire le message de confirmation
      const message =
        selectedArticles.length === 1
          ? `Supprimer l’article "${selectedArticles[0].name}" ?`
          : `Supprimer les ${selectedArticles.length} articles suivants ?\n- ${selectedArticles.map(a => a.name).join('\n- ')}`;

      const confirmed = await showConfirm(message);
      if (!confirmed) return;

      // Envoyer au serveur
      const selectedIds = selectedArticles.map(a => a.id);
      console.log('[Debug] IDs à supprimer :', selectedIds);

      try {
        const res = await fetch('/dashboard/delete-multiple', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedIds }),
        });
        const result = await res.json();

        console.log('[Debug] Résultat du serveur :', result);

        if (result.success) {
          // Supprimer les lignes du DOM
          selectedIds.forEach(id => {
            document.querySelector(`tr[data-item-id="${id}"]`)?.remove();
          });
          showFormMessage(result.message, 'success');
        } else {
          showFormMessage(result.message, 'error');
        }
      } catch (err) {
        console.error('[Error] Erreur de communication :', err);
        showFormMessage('Erreur de communication', 'error');
      }
    });

  // ---------------------------
  // Select all checkbox
  // ---------------------------
  document.getElementById('select-all')?.addEventListener('change', e => {
    const checked = e.target.checked;
    document
      .querySelectorAll('.item-checkbox')
      .forEach(cb => (cb.checked = checked));
  });

  // ---------------------------
  // Filtrage par catégorie
  // ---------------------------
  if (table) {
    const filterSelect = document.getElementById('category-filter');
    if (filterSelect) {
      // --- Filtrage instantané
      filterSelect.addEventListener('change', function () {
        const selected = this.value;
        const rows = table.querySelectorAll('tbody tr');
        console.log('[Filter] valeur sélectionnée :', selected);

        rows.forEach(row => {
          const locId = row.dataset.locationId;
          const show = !selected || locId === selected;
          row.style.display = show ? '' : 'none';
          console.log(
            `[Filter] ligne id=${row.dataset.itemId} | location_id=${locId} | visible=${show}`
          );
        });
      });

      // --- Reset filtre quand on quitte l'onglet liste
      tabs.forEach(tab =>
        tab.addEventListener('click', () => {
          const targetId = `tab-${tab.dataset.tab}`;
          if (targetId !== 'tab-list') {
            filterSelect.value = '';
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(row => (row.style.display = ''));
            console.log(
              '[Filter] Reset filtre et affichage de toutes les lignes'
            );
          }
        })
      );
    }
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
