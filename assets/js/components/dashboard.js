// assets/js/components/dashboard/dashboardComponent.js

import { renderAttributes } from '../dashboard/dashboardItemsAttributesHandler.js';
import { initPreview } from '../dashboard/dashboardPreviewHandler.js';
import { initImagePreview } from '../dashboard/dashboardImagePreviewHandler.js';
import { initEditArticle } from '../dashboard/dashboardItemEditHandler.js';
import { initDashboard, resetFormToAddMode, formModeIndicator } from '../dashboard/dashboardHandler.js';

export function initDashboardComponent() {
    const locationSelect = document.getElementById('location_id');
    const attributesContainer = document.getElementById('attributes');
    const previewAttributes = document.getElementById('preview-attributes');
    const previewCategory = document.getElementById('preview-category');

    if (!locationSelect || !attributesContainer || !previewAttributes || !previewCategory) return;

    initDashboard();

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

    initPreview({
        nameInput: document.getElementById('name'),
        priceInput: document.getElementById('price'),
        stockInput: document.getElementById('stock'),
        availabilityInput: document.getElementById('availability'),
        previewName: document.getElementById('preview-name'),
        previewPrice: document.getElementById('preview-price'),
        previewStock: document.getElementById('preview-stock'),
        previewAvailability: document.getElementById('preview-availability')
    });

    initImagePreview({
        imageInput: document.getElementById('image'),
        previewMainImage: document.getElementById('preview-main-image'),
        resizeInput: document.getElementById('resize'),
        container: document.getElementById('preview-container'),
        removeBtn: document.getElementById('remove-image')
    });

    initEditArticle({
        tbody: document.querySelector('#tab-list tbody'),
        locationSelect,
        nameInput: document.getElementById('name'),
        priceInput: document.getElementById('price'),
        stockInput: document.getElementById('stock'),
        availabilityInput: document.getElementById('availability'),
        previewCategory,
        previewMainImage: document.getElementById('preview-main-image'),
        removeBtn: document.getElementById('remove-image'),
        previewName: document.getElementById('preview-name'),
        previewPrice: document.getElementById('preview-price'),
        previewStock: document.getElementById('preview-stock'),
        previewAvailability: document.getElementById('preview-availability'),
        submitBtn: document.querySelector('.dashboard-form__submit'),
        formModeIndicator
    });

    const formTab = document.querySelector('.dashboard-tab[data-tab="form"]');
    if (formTab) formTab.addEventListener('click', resetFormToAddMode);
}