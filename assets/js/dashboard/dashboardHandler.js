var formModeIndicator = document.getElementById('form-mode-indicator');

function initDashboard() {
    var tabs = document.querySelectorAll('.dashboard-tab');
    var panes = document.querySelectorAll('.dashboard-pane');
    var previewWrapper = document.querySelector('.dashboard-preview-wrapper');
    var togglePreviewBtns = document.querySelectorAll('.mobile-toggle-preview');

    if (!tabs.length || !panes.length || !previewWrapper) return;

    // Masquer les panneaux non actifs au départ
    panes.forEach(function(p) {
        if (!p.classList.contains('active')) {
            p.style.display = 'none';
        }
    });
    previewWrapper.style.right = previewWrapper.classList.contains('active') ? '0' : '-100%';

    // Gestion des onglets
    tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            var targetId = 'tab-' + tab.dataset.tab;
            var targetPane = document.getElementById(targetId);
            if (!targetPane) return;

            panes.forEach(function(p) {
                p.style.display = 'none';
                p.classList.remove('active');
            });

            targetPane.style.display = 'flex';
            targetPane.classList.add('active');

            // Si on est sur formulaire
            if (targetId === 'tab-form') {
                if (window.innerWidth >= 768) {
                    previewWrapper.style.right = '0';
                    previewWrapper.classList.add('active');
                } else {
                    previewWrapper.style.right = '-100%';
                    previewWrapper.classList.remove('active');
                }
            } else {
                previewWrapper.style.right = '-100%';
                previewWrapper.classList.remove('active');
            }

            // Mettre à jour l'onglet actif
            tabs.forEach(function(t) { t.classList.remove('active'); });
            tab.classList.add('active');

            if (window.innerWidth < 768) {
                targetPane.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Toggle mobile
    if (togglePreviewBtns.length && previewWrapper) {
        togglePreviewBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                if (previewWrapper.classList.contains('active')) {
                    previewWrapper.style.right = '-100%';
                    previewWrapper.classList.remove('active');
                } else {
                    previewWrapper.style.right = '0';
                    previewWrapper.classList.add('active');
                }
            });
        });
    }

    // Adaptation au resize
    window.addEventListener('resize', function() {
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
}


function setFormMode(mode, item) {
    var form = document.getElementById('article-form');
    var submitBtn = form && form.querySelector('.dashboard-form__submit');
    var hiddenId = document.getElementById('article-id');
    var previewMainImage = document.getElementById('preview-main-image');
    var removeBtn = document.getElementById('remove-image');
    var formPane = document.getElementById('tab-form');
    var paneList = document.getElementById('tab-list');
    var tabForm = document.querySelector('.dashboard-tab[data-tab="form"]');
    var tabList = document.querySelector('.dashboard-tab[data-tab="list"]');
    var previewWrapper = document.querySelector('.dashboard-preview-wrapper');

    if (!form || !submitBtn || !hiddenId || !formModeIndicator || !formPane) return;

    if (mode === 'edit' && item) {
        hiddenId.value = item.id;
        form.action = '/dashboard/edit/' + item.id;
        submitBtn.textContent = "Mettre à jour l’article";
        formModeIndicator.textContent = "Mode : Édition";

        formPane.style.display = 'flex';
        formPane.classList.add('active');

        if (window.innerWidth >= 768) {
            previewWrapper.style.right = '0';
        } else {
            previewWrapper.style.right = '-100%';
        }
        previewWrapper.classList.add('active');

        if (paneList) {
            paneList.style.display = 'none';
            paneList.classList.remove('active');
        }

        if (tabForm) tabForm.classList.add('active');
        if (tabList) tabList.classList.remove('active');

    } else { // ajout
        hiddenId.value = '';
        form.action = '/dashboard/add';
        submitBtn.textContent = 'Ajouter';
        form.reset();
        if (previewMainImage) previewMainImage.src = 'https://via.placeholder.com/400x250?text=Aperçu';
        if (removeBtn) removeBtn.style.display = 'none';
        formModeIndicator.textContent = 'Mode : Ajout';

        if (tabForm && tabForm.classList.contains('active')) {
            formPane.style.display = 'flex';
            formPane.classList.add('active');

            if (window.innerWidth >= 768) {
                previewWrapper.style.right = '0';
            } else {
                previewWrapper.style.right = '-100%';
            }
            previewWrapper.classList.add('active');
        }
    }

    form.classList.add('highlight');
    formModeIndicator.classList.add('pulse');
    setTimeout(function() {
        form.classList.remove('highlight');
        formModeIndicator.classList.remove('pulse');
    }, 800);
}

function resetFormToAddMode() {
    setFormMode('add');
}

// Export pour module
export { formModeIndicator, initDashboard, setFormMode, resetFormToAddMode };