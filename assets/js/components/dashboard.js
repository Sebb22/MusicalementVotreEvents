import { renderAttributes } from '../dashboard/dashboardItemsAttributesHandler.js';
import { initPreview } from '../dashboard/dashboardPreviewHandler.js';
import { initImagePreview } from '../dashboard/dashboardImagePreviewHandler.js';
import { initEditArticle } from '../dashboard/dashboardItemEditHandler.js';
import { initDashboard, formModeIndicator, initFormHandler, updateDashboardTable } from '../dashboard/dashboardHandler.js';

export function initDashboardComponent() {
    const locationSelect = document.getElementById('location_id');
    const attributesContainer = document.getElementById('attributes');
    const previewAttributes = document.getElementById('preview-attributes');
    const previewCategory = document.getElementById('preview-category');

    if (!locationSelect || !attributesContainer || !previewAttributes || !previewCategory) return;

    // --- Tabs et affichage ---
    initDashboard();

    // --- Gestion dynamique catégorie ---
    locationSelect.addEventListener('change', e => {
        const selectedOption = locationSelect.options[locationSelect.selectedIndex];
        previewCategory.textContent = selectedOption.value ? `Catégorie : ${selectedOption.text}` : "Catégorie : -";
        renderAttributes(e.target.value, attributesContainer, previewAttributes);
    });

    if (locationSelect.value) {
        const selectedOption = locationSelect.options[locationSelect.selectedIndex];
        previewCategory.textContent = `Catégorie : ${selectedOption.text}`;
        renderAttributes(locationSelect.value, attributesContainer, previewAttributes);
    }

    // --- Préview texte ---
    const previewConfig = {
        nameInput: document.getElementById('name'),
        priceInput: document.getElementById('price'),
        stockInput: document.getElementById('stock'),
        availabilityInput: document.getElementById('availability'),
        previewName: document.getElementById('preview-name'),
        previewPrice: document.getElementById('preview-price'),
        previewStock: document.getElementById('preview-stock'),
        previewAvailability: document.getElementById('preview-availability')
    };
    initPreview(previewConfig);

    // --- Préview image ---
    const imageConfig = {
        imageInput: document.getElementById('image'),
        previewMainImage: document.getElementById('preview-main-image'),
        resizeInput: document.getElementById('resize'),
        container: document.getElementById('preview-container'),
        removeBtn: document.getElementById('remove-image')
    };
    initImagePreview(imageConfig);

    // --- Edition articles ---
    initEditArticle({
        tbody: document.querySelector('#tab-list tbody'),
        locationSelect,
        nameInput: previewConfig.nameInput,
        priceInput: previewConfig.priceInput,
        stockInput: previewConfig.stockInput,
        availabilityInput: previewConfig.availabilityInput,
        previewCategory,
        previewMainImage: imageConfig.previewMainImage,
        removeBtn: imageConfig.removeBtn,
        previewName: previewConfig.previewName,
        previewPrice: previewConfig.previewPrice,
        previewStock: previewConfig.previewStock,
        previewAvailability: previewConfig.previewAvailability,
        submitBtn: document.querySelector('.dashboard-form__submit'),
        formModeIndicator
    });


    // --- Gestion affichage messages de statut ---
    initFormHandler();
    updateDashboardTable();
}