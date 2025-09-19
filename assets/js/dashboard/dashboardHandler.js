import { initEditArticle } from './dashboardItemEditHandler.js';

var formModeIndicator = document.getElementById('form-mode-indicator');

/**
 * Initialise le dashboard : onglets, preview et formulaire
 */
function initDashboard() {
    var tabs = document.querySelectorAll('.dashboard-tab');
    var panes = document.querySelectorAll('.dashboard-pane');
    var previewWrapper = document.querySelector('.dashboard-preview-wrapper');
    var togglePreviewBtns = document.querySelectorAll('.mobile-toggle-preview');

    if (!tabs.length || !panes.length || !previewWrapper) return;

    // Masquer les panneaux non actifs au départ
    panes.forEach(p => {
        if (!p.classList.contains('active')) p.style.display = 'none';
    });
    previewWrapper.style.right = previewWrapper.classList.contains('active') ? '0' : '-100%';

    // Gestion des onglets
    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab, panes, previewWrapper, tabs));
    });

    // Toggle mobile preview
    togglePreviewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            previewWrapper.classList.toggle('active');
            previewWrapper.style.right = previewWrapper.classList.contains('active') ? '0' : '-100%';
        });
    });

    // Adaptation au resize
    window.addEventListener('resize', () => {
        var formPane = document.getElementById('tab-form');
        if (!formPane) return;
        if (formPane.classList.contains('active') && window.innerWidth >= 768) {
            previewWrapper.style.right = '0';
            previewWrapper.classList.add('active');
        } else if (window.innerWidth < 768) {
            previewWrapper.style.right = '-100%';
            previewWrapper.classList.remove('active');
        }
    });

    // Initialiser gestion du formulaire
    initFormHandler();
}

/**
 * Switch entre les onglets du dashboard
 */
function switchTab(target, panes, previewWrapper, tabs) {
    var targetId = 'tab-' + target;
    var targetPane = document.getElementById(targetId);
    if (!targetPane) return;

    // Cacher tous les panneaux
    panes.forEach(p => {
        p.style.display = 'none';
        p.classList.remove('active');
    });

    // Afficher le panneau cible
    targetPane.style.display = (target === 'list') ? 'block' : 'flex';
    targetPane.classList.add('active');

    // Preview visible seulement si formulaire
    if (target === 'form' && window.innerWidth >= 768) {
        previewWrapper.style.right = '0';
        previewWrapper.classList.add('active');
    } else {
        previewWrapper.style.right = '-100%';
        previewWrapper.classList.remove('active');
    }

    // Mettre à jour l'onglet actif
    tabs.forEach(t => t.classList.remove('active'));
    document.querySelector(`.dashboard-tab[data-tab="${target}"]`).classList.add('active');

    // Scroll auto en mobile
    if (window.innerWidth < 768) {
        targetPane.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Configure le formulaire en mode "ajout" ou "édition"
 */
function setFormMode(mode, item) {
    const form = document.getElementById('article-form');
    const submitBtn = form?.querySelector('.dashboard-form__submit');
    const hiddenId = document.getElementById('article-id');
    const previewMainImage = document.getElementById('preview-main-image');
    const removeBtn = document.getElementById('remove-image');
    const formPane = document.getElementById('tab-form');
    const paneList = document.getElementById('tab-list');
    const tabForm = document.querySelector('.dashboard-tab[data-tab="form"]');
    const tabList = document.querySelector('.dashboard-tab[data-tab="list"]');
    const previewWrapper = document.querySelector('.dashboard-preview-wrapper');

    if (!form || !submitBtn || !hiddenId || !formModeIndicator || !formPane) return;

    if (mode === 'edit' && item) {
        hiddenId.value = item.id;
        form.dataset.editId = item.id;
        form.action = '/dashboard/edit';
        submitBtn.textContent = "Mettre à jour l’article";
        formModeIndicator.textContent = "Mode : Édition";

        formPane.style.display = 'flex';
        formPane.classList.add('active');

        if (paneList) {
            paneList.style.display = 'none';
            paneList.classList.remove('active');
        }

        if (window.innerWidth >= 768) previewWrapper.style.right = '0';
        else previewWrapper.style.right = '-100%';
        previewWrapper.classList.add('active');

        if (tabForm) tabForm.classList.add('active');
        if (tabList) tabList.classList.remove('active');

    } else {
        hiddenId.value = '';
        delete form.dataset.editId;
        form.action = '/dashboard/add';
        submitBtn.textContent = 'Ajouter';
        form.reset();
        if (previewMainImage) previewMainImage.src = 'https://via.placeholder.com/400x250?text=Aperçu';
        if (removeBtn) removeBtn.style.display = 'none';
        formModeIndicator.textContent = 'Mode : Ajout';

        if (tabForm?.classList.contains('active')) {
            formPane.style.display = 'flex';
            formPane.classList.add('active');
            if (window.innerWidth >= 768) previewWrapper.style.right = '0';
            else previewWrapper.style.right = '-100%';
            previewWrapper.classList.add('active');
        }
    }

    if (window.innerWidth < 768) formPane.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Gestion du submit formulaire (add / edit)
 */
function initFormHandler() {
    const form = document.getElementById('article-form');
    if (!form) return;
    if (form.dataset.listenerAdded) return;
    form.dataset.listenerAdded = 'true';

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(form);

        if (form.dataset.editId) formData.append('id', form.dataset.editId);

        try {
            const response = await fetch(form.action, { method: 'POST', body: formData });
            const result = await response.json();

            // Affichage du toast
            showFormMessage(result.message, result.success ? 'success' : 'error');

            if (result.success) {
                form.reset();
                delete form.dataset.editId;
                setFormMode('add');

                const previewMainImage = document.getElementById('preview-main-image');
                if (previewMainImage) previewMainImage.src = 'https://via.placeholder.com/400x250?text=Aperçu';

                // Mise à jour table et réinitialisation Edit
                updateDashboardTable(result.data);
            }
        } catch (err) {
            console.error("Erreur fetch :", err);
            showFormMessage("Erreur réseau ou JSON invalide : " + err.message, "error");
        }
    });
}

/**
 * Affichage message toast
 */
function showFormMessage(message, type) {
    const msgEl = document.getElementById('form-message');
    if (!msgEl) return;

    msgEl.textContent = message;
    msgEl.className = 'form-message show ' + type;
    msgEl.style.display = 'block';
    setTimeout(() => {
        msgEl.classList.remove('show');
        setTimeout(() => { msgEl.style.display = 'none'; }, 300);
    }, 3000);
}

/**
 * Met à jour la table du dashboard avec un item existant ou nouvellement ajouté
 */
function updateDashboardTable(itemData) {
    const tableBody = document.querySelector('.dashboard-table tbody');
    if (!tableBody || !itemData) return;

    let existingRow = tableBody.querySelector(`tr[data-item-id="${itemData.id}"]`);
    const rowHTML = `
        <tr data-item-id="${itemData.id}" data-item='${JSON.stringify(itemData)}'>
            <td>${itemData.name}</td>
            <td>${itemData.location_name || '-'}</td>
            <td>${itemData.price} €</td>
            <td>${itemData.stock}</td>
            <td>${itemData.availability ? 'Disponible' : 'Indisponible'}</td>
            <td>
                <button type="button" class="btn-edit edit-article">✏️</button>
                <a href="/dashboard/delete/${itemData.id}" class="btn-delete" onclick="return confirm('Supprimer cet article ?')">🗑️</a>
            </td>
        </tr>`;

    if (existingRow) {
        existingRow.outerHTML = rowHTML;
    } else {
        tableBody.insertAdjacentHTML('beforeend', rowHTML);
    }

    // Vider le formulaire avant switch onglet
    const form = document.getElementById('article-form');
    if (form) {
        form.reset();
        delete form.dataset.editId;
        setFormMode('add');
    }

    // Switch vers l'onglet liste
    switchTab('list',
        document.querySelectorAll('.dashboard-pane'),
        document.querySelector('.dashboard-preview-wrapper'),
        document.querySelectorAll('.dashboard-tab')
    );

    // Réinitialiser les listeners Edit
    initEditArticle({
        tbody: tableBody,
        locationSelect: document.getElementById('location_id'),
        nameInput: document.getElementById('name'),
        priceInput: document.getElementById('price'),
        stockInput: document.getElementById('stock'),
        availabilityInput: document.getElementById('availability'),
        previewCategory: document.getElementById('preview-category'),
        previewMainImage: document.getElementById('preview-main-image'),
        removeBtn: document.getElementById('remove-image'),
        previewName: document.getElementById('preview-name'),
        previewPrice: document.getElementById('preview-price'),
        previewStock: document.getElementById('preview-stock'),
        previewAvailability: document.getElementById('preview-availability'),
        formModeIndicator
    });
}

export { formModeIndicator, initDashboard, setFormMode, initFormHandler, updateDashboardTable };
