// dashboard.js
import { initTabs } from '../dashboard/dashboardTabsHandler.js';
import { renderAttributes } from '../dashboard/dashboardItemsAttributesHandler.js';
import { initPreview } from '../dashboard/dashboardPreviewHandler.js';
import { initImagePreview } from '../dashboard/dashboardImagePreviewHandler.js';
import { initEditArticle } from '../dashboard/dashboardItemEditHandler.js';

export function initDashboard() {

    // --- Onglets ---
    initTabs();

    // --- Sélecteurs DOM ---
    const locationSelect = document.getElementById('location_id');
    const attributesContainer = document.getElementById('attributes');
    const previewAttributes = document.getElementById('preview-attributes');
    const previewCategory = document.getElementById('preview-category');

    const nameInput = document.getElementById('name');
    const priceInput = document.getElementById('price');
    const stockInput = document.getElementById('stock');
    const availabilityInput = document.getElementById('availability');

    const previewName = document.getElementById('preview-name');
    const previewPrice = document.getElementById('preview-price');
    const previewStock = document.getElementById('preview-stock');
    const previewAvailability = document.getElementById('preview-availability');
    const previewMainImage = document.getElementById('preview-main-image');

    const resizeInput = document.getElementById('resize');
    const container = document.getElementById('preview-container');
    const removeBtn = document.getElementById('remove-image');
    const imageInput = document.getElementById('image');

    // --- Vérification des éléments critiques ---
    const requiredElements = {
        locationSelect,
        attributesContainer,
        previewAttributes,
        previewCategory,
        nameInput,
        priceInput,
        stockInput,
        availabilityInput,
        previewName,
        previewPrice,
        previewStock,
        previewAvailability,
        previewMainImage,
        resizeInput,
        container,
        removeBtn,
        imageInput
    };
    Object.entries(requiredElements).forEach(([key, el]) => {
        if (!el) console.warn(`⚠️ ${key} manquant dans le DOM`, {
            [key]: el });
    });

    if (!locationSelect || !attributesContainer || !previewAttributes || !previewCategory) return;

    // --- Attributs dynamiques ---
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

    // --- Preview des champs ---
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

    // --- Preview image ---
    initImagePreview({ imageInput, previewMainImage, resizeInput, container, removeBtn });

    // --- Edition des articles existants ---
    initEditArticle({
        tbody: document.querySelector('#tab-list tbody'),
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
        previewAvailability
    });
}