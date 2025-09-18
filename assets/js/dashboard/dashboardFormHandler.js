/**
 * Gère le mode du formulaire (ajout ou édition).
 */

export function setFormToEditMode(editItem) {
    const form = document.getElementById('article-form');
    const submitBtn = form.querySelector('.dashboard-form__submit');
    const hiddenId = document.getElementById('article-id');

    if (form && submitBtn && hiddenId) {
        hiddenId.value = editItem.id;
        form.action = `/dashboard/edit/${editItem.id}`;
        submitBtn.textContent = "Mettre à jour";
    }
}

export function resetFormToAddMode() {
    const form = document.getElementById('article-form');
    const submitBtn = form.querySelector('.dashboard-form__submit');
    const hiddenId = document.getElementById('article-id');

    if (form && submitBtn && hiddenId) {
        hiddenId.value = "";
        form.action = "/dashboard/add";
        submitBtn.textContent = "Ajouter";
        form.reset();

        // Remettre l'image par défaut
        const previewMainImage = document.getElementById('preview-main-image');
        const removeBtn = document.getElementById('remove-image');
        if (previewMainImage) previewMainImage.src = "https://via.placeholder.com/400x250?text=Aperçu";
        if (removeBtn) removeBtn.style.display = "none";
    }
}
