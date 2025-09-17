import { renderAttributes } from './dashboardItemsAttributesHandler';

export function initEditArticle({ tbody, locationSelect, nameInput, priceInput, stockInput, availabilityInput, previewCategory, previewMainImage, removeBtn }) {
    if (!tbody) return;

    tbody.addEventListener('click', e => {
        const btn = e.target.closest('.edit-article');
        if (!btn) return;
        const tr = btn.closest('tr');
        if (!tr) return;
        const editItem = JSON.parse(tr.dataset.item);

        document.getElementById('article-id').value = editItem.id || '';
        locationSelect.value = editItem.location_id || '';
        nameInput.value = editItem.name || '';
        priceInput.value = editItem.price || '';
        stockInput.value = editItem.stock || '';
        availabilityInput.value = editItem.availability != null ? editItem.availability : 1;

        const selectedOption = locationSelect.options[locationSelect.selectedIndex];
        previewCategory.textContent = selectedOption.value ? `Catégorie : ${selectedOption.text}` : "Catégorie : -";

        renderAttributes(locationSelect.value, document.getElementById('attributes'), document.getElementById('preview-attributes'));

        if (editItem.attributes) {
            Object.entries(editItem.attributes).forEach(([key, value]) => {
                const input = document.getElementById(key);
                if (input) input.value = value;
                const previewSpan = document.getElementById(`preview-${key}`);
                if (previewSpan) previewSpan.textContent = value;
            });
        }

        if (editItem.main_image) {
            previewMainImage.src = editItem.main_image;
            removeBtn.style.display = "block";
        }

        document.getElementById('tab-form').scrollIntoView({ behavior: 'smooth' });
    });
}