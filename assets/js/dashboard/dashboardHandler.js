// assets/js/components/dashboard/dashboardHandler.js

export const formModeIndicator = document.getElementById('form-mode-indicator');

export function initDashboard() {
    const tabs = document.querySelectorAll('.dashboard-tab');
    const panes = document.querySelectorAll('.dashboard-pane');
    if (!tabs.length || !panes.length) return;

    // Initialisation : afficher le premier pane
    panes.forEach((p, i) => {
        if (window.innerWidth >= 768 && p.id === 'tab-preview') {
            p.style.display = 'flex';
            p.classList.add('active');
        } else {
            p.style.display = i === 0 ? 'flex' : 'none';
            p.classList.toggle('active', i === 0);
        }
        if (p.classList.contains('active')) {
            const children = p.querySelectorAll('.dashboard-form, .dashboard-preview');
            children.forEach(c => c.style.animation = 'fadeSlideIn 0.4s ease forwards');
        }
    });

    tabs.forEach((t, i) => t.classList.toggle('active', i === 0));

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = `tab-${tab.dataset.tab}`;
            const targetPane = document.getElementById(targetId);
            if (!targetPane) return;

            if (window.innerWidth >= 768 && targetId === 'tab-preview') return;

            panes.forEach(p => {
                if (window.innerWidth >= 768 && p.id === 'tab-preview') return;
                p.style.display = 'none';
                p.classList.remove('active');
            });

            targetPane.style.display = 'flex';
            targetPane.classList.add('active');

            const children = targetPane.querySelectorAll('.dashboard-form, .dashboard-preview');
            children.forEach(c => c.style.animation = 'fadeSlideIn 0.4s ease forwards');

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            if (window.innerWidth < 768) {
                targetPane.scrollIntoView({ behavior: 'smooth' });
                const formInput = targetPane.querySelector('input, select, textarea');
                if (formInput) formInput.focus();
            }
        });
    });

    window.addEventListener('resize', () => {
        panes.forEach(p => {
            if (window.innerWidth >= 768 && p.id === 'tab-preview') {
                p.style.display = 'flex';
                p.classList.add('active');
            } else if (!p.classList.contains('active')) {
                p.style.display = 'none';
            }
        });
    });
}

// Formulaire
export function setFormMode(mode, item = null) {
    const form = document.getElementById('article-form');
    const submitBtn = form && form.querySelector('.dashboard-form__submit');
    const hiddenId = document.getElementById('article-id');
    const previewMainImage = document.getElementById('preview-main-image');
    const removeBtn = document.getElementById('remove-image');

    if (!form || !submitBtn || !hiddenId || !formModeIndicator) return;

    if (mode === 'edit' && item) {
        hiddenId.value = item.id;
        form.action = `/dashboard/edit/${item.id}`;
        submitBtn.textContent = "Mettre à jour l’article";
        formModeIndicator.textContent = "Mode : Édition";
    } else {
        hiddenId.value = "";
        form.action = "/dashboard/add";
        submitBtn.textContent = "Ajouter";
        form.reset();
        if (previewMainImage) previewMainImage.src = "https://via.placeholder.com/400x250?text=Aperçu";
        if (removeBtn) removeBtn.style.display = "none";
        formModeIndicator.textContent = "Mode : Ajout";
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