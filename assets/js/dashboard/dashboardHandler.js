import { DashboardEditor } from './dashboardEditor.js';
import { showFormMessage, initConfirmModal } from './dashboardUtils.js';

export function initDashboard({ formId, tableId, previewSelectors, attributesContainer }) {
  const form = document.getElementById(formId);
  const table = document.getElementById(tableId);
  const filter = document.querySelector('.dashboard-filter');
  if (!form || !table) return null;

  const showConfirm = initConfirmModal();
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

  let preventNextReset = false;

  // ---------------------------
  // Submit AJAX
  // ---------------------------
  form.addEventListener('submit', async e => {
    e.preventDefault();

    if (dashboardEditor.imageHandler?.generateTransformedImage) {
      await dashboardEditor.imageHandler.generateTransformedImage();
    }

    const formData = new FormData(form);
    const fileInput = form.querySelector('#image');
    const file = fileInput?.files[0];
    if (!file || file.size === 0) formData.delete('image');

    const isEditMode = !!form.dataset.editId;
    const action = isEditMode ? 'modifier' : 'ajouter';
    const name = formData.get('name') || 'cet article';

    if (!(await showConfirm(`Voulez-vous vraiment ${action} "${name}" ?`))) return;

    try {
      const res = await fetch(form.action, { method: 'POST', body: formData });
      const text = await res.text();
      let result;

      try { result = JSON.parse(text); } 
      catch { return showFormMessage('Réponse invalide du serveur.', 'error'); }

      if (result.success) {
        showFormMessage(result.message, 'success');
        dashboardEditor.updateTableRow(result.data);

        // Switch to list tab
        const listTab = document.querySelector('.dashboard-tab[data-tab="list"]');
        if (listTab) switchTab(listTab);

        if (!isEditMode) dashboardEditor.reset();
        else {
          form.dataset.editId = '';
          dashboardEditor.setMode('add');
        }
      } else showFormMessage(result.message, 'error');
    } catch {
      showFormMessage('Erreur de communication', 'error');
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
    if (filter) filter.style.display = targetId === 'tab-list' ? 'flex' : 'none';
    if (targetId === 'tab-form' && tabElement.dataset.action === 'add' && !preventNextReset) {
      dashboardEditor.reset();
    }
    preventNextReset = false;
  }

  tabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab)));

  // ---------------------------
  // Table delegation (edit/delete)
  // ---------------------------
  table.addEventListener('click', async e => {
    const tr = e.target.closest('tr');
    if (!tr) return;

    // Edit
    if (e.target.closest('.edit-article')) {
      dashboardEditor.editItem(JSON.parse(tr.dataset.item));
      const formTab = document.querySelector('.dashboard-tab[data-tab="form"]');
      if (formTab) { preventNextReset = true; switchTab(formTab); }
      return;
    }

    // Delete single
    if (e.target.closest('.btn-delete')) {
      e.preventDefault();
      const itemData = JSON.parse(tr.dataset.item);
      if (!(await showConfirm(`Supprimer l'article "${itemData.name}" ?`))) return;

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
          updateBulkActions();
        } else showFormMessage(result.message, 'error');
      } catch {
        showFormMessage('Erreur de communication', 'error');
      }
    }
  });

  // ---------------------------
  // Bulk actions
  // ---------------------------
  const bulkBar = document.getElementById('bulk-actions');
  const bulkCount = document.getElementById('bulk-count');
  const bulkCancel = document.getElementById('bulk-cancel');
  const deleteSelected = document.getElementById('delete-selected');
  const selectAll = document.getElementById('select-all');

  function getVisibleCheckboxes() {
    return [...table.querySelectorAll('tbody tr')]
      .filter(row => row.style.display !== 'none')
      .map(row => row.querySelector('.item-checkbox'))
      .filter(Boolean);
  }

  function updateBulkActions() {
    const checkedBoxes = getVisibleCheckboxes().filter(cb => cb.checked);
    const count = checkedBoxes.length;

    if (count > 0) {
      bulkBar?.classList.remove('hidden');
      const names = checkedBoxes.map(cb => JSON.parse(cb.closest('tr').dataset.item).name);
      bulkCount.textContent = `${count} article${count > 1 ? 's' : ''} sélectionné${count > 1 ? 's' : ''} : ${names.join(', ')}`;
    } else bulkBar?.classList.add('hidden');

    updateEditAvailability();
  }

  function clearSelections() {
    table.querySelectorAll('.item-checkbox').forEach(cb => (cb.checked = false));
    if (selectAll) selectAll.checked = false;
    updateBulkActions();
  }

  bulkCancel?.addEventListener('click', clearSelections);
  getVisibleCheckboxes().forEach(cb => cb.addEventListener('change', updateBulkActions));
  selectAll?.addEventListener('change', e => {
    getVisibleCheckboxes().forEach(cb => cb.checked = e.target.checked);
    updateBulkActions();
  });

  function updateEditAvailability() {
    const checked = document.querySelectorAll('.item-checkbox:checked');
    const editBtns = document.querySelectorAll('.edit-article');
    editBtns.forEach(btn => {
      btn.disabled = checked.length >= 2;
      btn.classList.toggle('disabled', checked.length >= 2);
    });
  }

  updateEditAvailability();
  updateBulkActions();

  // ---------------------------
  // Delete multiple
  // ---------------------------
  deleteSelected?.addEventListener('click', async () => {
    const selectedCheckboxes = [...document.querySelectorAll('.item-checkbox:checked')];
    if (!selectedCheckboxes.length) return showFormMessage('Veuillez sélectionner au moins un article à supprimer.', 'error');

    const selectedArticles = selectedCheckboxes.map(cb => {
      const tr = cb.closest('tr');
      if (!tr) return null;
      try { return { id: cb.dataset.id, name: JSON.parse(tr.dataset.item).name }; } 
      catch { return null; }
    }).filter(Boolean);

    const message = selectedArticles.length === 1 
      ? `Supprimer l’article "${selectedArticles[0].name}" ?`
      : `Supprimer les ${selectedArticles.length} articles suivants ?\n- ${selectedArticles.map(a => a.name).join('\n- ')}`;

    if (!(await showConfirm(message))) return;

    try {
      const res = await fetch('/dashboard/delete-multiple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedArticles.map(a => a.id) }),
      });
      const result = await res.json();
      if (result.success) {
        selectedArticles.forEach(a => document.querySelector(`tr[data-item-id="${a.id}"]`)?.remove());
        showFormMessage(result.message, 'success');
        updateBulkActions();
      } else showFormMessage(result.message, 'error');
    } catch { showFormMessage('Erreur de communication', 'error'); }
  });

  // ---------------------------
  // Filtrage recherche + catégorie
  // ---------------------------
  const filterSelect = document.getElementById('category-filter');
  const searchInput = document.getElementById('search-input');

  function applyFilters() {
    const category = filterSelect?.value || '';
    const query = searchInput?.value.toLowerCase() || '';

    table.querySelectorAll('tbody tr').forEach(row => {
      const locId = row.dataset.locationId;
      const text = row.textContent.toLowerCase();
      row.style.display = (!category || locId === category) && (!query || text.includes(query)) ? '' : 'none';
    });
    clearSelections();
  }

  filterSelect?.addEventListener('change', applyFilters);
  searchInput?.addEventListener('input', applyFilters);

  // Reset filters quand on sort de l’onglet liste
  tabs.forEach(tab => tab.addEventListener('click', () => {
    const targetId = `tab-${tab.dataset.tab}`;
    if (targetId !== 'tab-list') {
      if (filterSelect) filterSelect.value = '';
      if (searchInput) searchInput.value = '';
      table.querySelectorAll('tbody tr').forEach(row => row.style.display = '');
      clearSelections();
    }
  }));

  // ---------------------------
  // Remove image
  // ---------------------------
  document.getElementById('remove-image')?.addEventListener('click', () => {
    dashboardEditor.preview.image.src = 'https://via.placeholder.com/400x250?text=Aperçu';
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
