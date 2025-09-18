export const formModeIndicator = document.getElementById('form-mode-indicator');

export function initDashboard() {
    const tabs = document.querySelectorAll('.dashboard-tab');
    const panes = document.querySelectorAll('.dashboard-pane');
    const previewPane = document.getElementById('tab-preview');
    if (!tabs.length || !panes.length) return;

    // --- Initialisation : tout caché ---
    panes.forEach(p => {
        p.style.display = 'none';
        p.classList.remove('active');
    });
    if (previewPane) {
        previewPane.style.display = 'none';
        previewPane.classList.remove('active');
    }
    tabs.forEach(t => t.classList.remove('active'));

    // --- Gestion des clics onglets ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = `tab-${tab.dataset.tab}`;
            const targetPane = document.getElementById(targetId);
            if (!targetPane) return;

            // Masquer tous les panneaux + preview
            panes.forEach(p => {
                p.style.display = 'none';
                p.classList.remove('active');
            });
            if (previewPane) {
                previewPane.style.display = 'none';
                previewPane.classList.remove('active');
            }

            // Afficher le panneau cible
            targetPane.style.display = 'flex';
            targetPane.classList.add('active');

            // Si c’est le formulaire, on montre la preview
            if (targetId === 'tab-form' && previewPane) {
                previewPane.style.display = 'flex';
                previewPane.classList.add('active');
            }

            // Mobile scroll/focus
            if (window.innerWidth < 768) {
                targetPane.scrollIntoView({ behavior: 'smooth' });
                const formInput = targetPane.querySelector('input, select, textarea');
                if (formInput) formInput.focus();
            }

            // Gestion des onglets actifs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    // --- Resize ---
    window.addEventListener('resize', () => {
        const formPane = document.getElementById('tab-form');
        if (!formPane) return;
        if (formPane.classList.contains('active') && previewPane) {
            previewPane.style.display = 'flex';
            previewPane.classList.add('active');
        } else if (previewPane) {
            previewPane.style.display = 'none';
            previewPane.classList.remove('active');
        }
    });
}

// --- Formulaire ---
export function setFormMode(mode, item = null) {
    const form = document.getElementById('article-form');
    const submitBtn = form && form.querySelector('.dashboard-form__submit');
    const hiddenId = document.getElementById('article-id');
    const previewMainImage = document.getElementById('preview-main-image');
    const removeBtn = document.getElementById('remove-image');
    const formPane = document.getElementById('tab-form');
    const previewPane = document.getElementById('tab-preview');
    const paneList = document.getElementById('tab-list');
    const tabForm = document.querySelector('.dashboard-tab[data-tab="form"]');
    const tabList = document.querySelector('.dashboard-tab[data-tab="list"]');

    if (!form || !submitBtn || !hiddenId || !formModeIndicator || !formPane) return;

    if (mode === 'edit' && item) {
        // --- Remplir formulaire ---
        hiddenId.value = item.id;
        form.action = `/dashboard/edit/${item.id}`;
        submitBtn.textContent = "Mettre à jour l’article";
        formModeIndicator.textContent = "Mode : Édition";

        // --- Afficher form + preview ---
        formPane.style.display = 'flex';
        formPane.classList.add('active');
        if (previewPane) {
            previewPane.style.display = 'flex';
            previewPane.classList.add('active');
        }

        // --- Cacher la liste ---
        if (paneList) {
            paneList.style.display = 'none';
            paneList.classList.remove('active');
        }

        // --- Gérer onglets ---
        if (tabForm) tabForm.classList.add('active');
        if (tabList) tabList.classList.remove('active');

    } else { // Mode ajout
        hiddenId.value = "";
        form.action = "/dashboard/add";
        submitBtn.textContent = "Ajouter";
        form.reset();
        if (previewMainImage) previewMainImage.src = "https://via.placeholder.com/400x250?text=Aperçu";
        if (removeBtn) removeBtn.style.display = "none";
        formModeIndicator.textContent = "Mode : Ajout";

        // Afficher form + preview seulement si l’onglet form est actif
        if (tabForm && tabForm.classList.contains('active')) {
            formPane.style.display = 'flex';
            formPane.classList.add('active');
            if (previewPane) {
                previewPane.style.display = 'flex';
                previewPane.classList.add('active');
            }
        }
    }

    form.classList.add('highlight');
    formModeIndicator.classList.add('pulse');
    setTimeout(() => {
        form.classList.remove('highlight');
        formModeIndicator.classList.remove('pulse');
    }, 800);
}


export function resetFormToAddMode() {
    setFormMode('add');
}