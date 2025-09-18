// assets/js/components/dashboard/dashboardItemEditHandler.js

import { initPreview } from './dashboardPreviewHandler.js';
import { renderAttributes } from './dashboardItemsAttributesHandler.js';
import { setFormMode } from './dashboardHandler.js';

/**
 * Initialise l'édition d'un article au clic sur un bouton "Edit".
 */
export function initEditArticle({
    tbody,
    locationSelect,
    nameInput,
    priceInput,
    stockInput,
    availabilityInput,
    previewCategory,
    previewMainImage,
    removeBtn,
    previewName,
    previewPrice,
    previewStock,
    previewAvailability,
    submitBtn,
    formModeIndicator
}) {
    if (!tbody) return;

    const defaultImage = "https://via.placeholder.com/400x250?text=Aperçu";

    tbody.querySelectorAll('.edit-article').forEach(btn => {
        btn.addEventListener('click', () => {
            const tr = btn.closest('tr');
            if (!tr || !tr.dataset.item) return;

            const editItem = JSON.parse(tr.dataset.item);

            // Catégorie
            if (locationSelect) locationSelect.value = editItem.location_id || '';
            if (locationSelect && previewCategory) {
                renderAttributes(
                    editItem.location_id,
                    document.getElementById('attributes'),
                    document.getElementById('preview-attributes')
                );
                const selectedOption = locationSelect.options[locationSelect.selectedIndex];
                previewCategory.textContent = selectedOption.value ?
                    `Catégorie : ${selectedOption.text}` :
                    "Catégorie : -";
            }

            // Champs principaux
            if (nameInput) nameInput.value = editItem.name || '';
            if (priceInput) priceInput.value = editItem.price || '';
            if (stockInput) stockInput.value = editItem.stock || '';
            if (availabilityInput) availabilityInput.value = editItem.availability != null ? editItem.availability : 1;

            // Attributs dynamiques
            if (editItem.attributes && typeof editItem.attributes === 'object') {
                Object.entries(editItem.attributes).forEach(([key, value]) => {
                    const input = document.getElementById(key);
                    const span = document.getElementById(`preview-${key}`);
                    if (input) input.value = value;
                    if (span) {
                        span.textContent = value || '-';
                        if (key === 'nb_personnes') span.textContent = value ? `Jusqu’à ${value} pers.` : '-';
                        if (key === 'age_requis') span.textContent = value ? `Âge : ${value}` : '-';
                        if (key === 'dimensions') span.textContent = value ? `Dimensions : ${value}` : '-';
                        if (key === 'duree') span.textContent = value ? `Durée : ${value}` : '-';
                        if (key === 'nb_joueurs') span.textContent = value ? `Joueurs : ${value}` : '-';
                        if (key === 'poids') span.textContent = value ? `Poids : ${value}` : '-';
                        if (key === 'taille') span.textContent = value ? `Taille : ${value}` : '-';
                    }
                });
            }

            // Image
            if (previewMainImage) {
                if (editItem.main_image) {
                    previewMainImage.src = editItem.main_image;
                    if (removeBtn) removeBtn.style.display = "block";
                } else {
                    previewMainImage.src = defaultImage;
                    if (removeBtn) removeBtn.style.display = "none";
                }
            }

            // Formulaire / liste
            const formPane = document.getElementById('tab-form');
            const tabForm = document.querySelector('.dashboard-tab[data-tab="form"]');
            const tabList = document.querySelector('.dashboard-tab[data-tab="list"]');
            const paneList = document.getElementById('tab-list');

            if (tabForm && formPane) {
                tabForm.classList.add('active');
                formPane.classList.add('active');
                formPane.style.display = 'flex';
            }
            if (tabList && paneList) {
                tabList.classList.remove('active');
                paneList.classList.remove('active');
                paneList.style.display = 'none';
            }

            // Bouton et mode
            if (submitBtn) submitBtn.textContent = "Mettre à jour l’article";
            if (formModeIndicator) formModeIndicator.textContent = "Mode : Édition";

            // Réinitialiser listeners preview
            initPreview({
                nameInput,
                priceInput,
                stockInput,
                availabilityInput,
                previewName,
                previewPrice,
                previewStock,
                previewAvailability
            });

            if (editItem.id) setFormMode('edit', editItem);

            if (formPane) formPane.scrollIntoView({ behavior: 'smooth' });
        });
    });
}