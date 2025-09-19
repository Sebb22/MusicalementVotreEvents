import { renderAttributes } from './dashboardItemsAttributesHandler.js';
import { initPreview } from './dashboardPreviewHandler.js';
import { setFormMode } from './dashboardHandler.js';

/**
 * Initialise l'édition d'un article au clic sur un bouton "Edit".
 * Se charge uniquement d'hydrater le formulaire et la preview.
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
    formModeIndicator
}) {
    if (!tbody) return;

    const defaultImage = "https://via.placeholder.com/400x250?text=Aperçu";

    // --- Click sur "Edit" ---
    tbody.querySelectorAll('.edit-article').forEach(btn => {
        btn.addEventListener('click', () => {
            const tr = btn.closest('tr');
            if (!tr || !tr.dataset.item) return;

            const editItem = JSON.parse(tr.dataset.item);

            // Mode édition
            if (editItem.id) {
                setFormMode('edit', editItem);
                const form = document.querySelector('#article-form');
                if (form) form.dataset.editId = editItem.id;
            }

            // Catégorie
            if (locationSelect) {
                locationSelect.value = editItem.location_id || '';
                if (previewCategory) {
                    const selectedOption = locationSelect.options[locationSelect.selectedIndex];
                    previewCategory.textContent = selectedOption.value ? `Catégorie : ${selectedOption.text}` : "Catégorie : -";
                }
            }

            // Champs principaux
            if (nameInput) nameInput.value = editItem.name || '';
            if (priceInput) priceInput.value = editItem.price || '';
            if (stockInput) stockInput.value = editItem.stock || '';
            if (availabilityInput) availabilityInput.value = editItem.availability != null ? editItem.availability : 1;

            // Update preview
            if (previewName) previewName.textContent = editItem.name || 'Nom de l’article';
            if (previewPrice) previewPrice.textContent = editItem.price ? `${editItem.price} €` : '0 €';
            if (previewStock) previewStock.textContent = editItem.stock ? `Stock : ${editItem.stock}` : 'Stock : 0';
            if (previewAvailability)
                previewAvailability.textContent =
                editItem.availability == 1 ? 'Disponibilité : Disponible' : 'Disponibilité : Indisponible';

            // Attributs dynamiques
            const attributesContainer = document.getElementById('attributes');
            const previewAttributes = document.getElementById('preview-attributes');
            if (attributesContainer && previewAttributes) {
                renderAttributes(editItem.location_id, attributesContainer, previewAttributes);

                if (editItem.attributes && typeof editItem.attributes === 'object') {
                    Object.entries(editItem.attributes).forEach(([key, value]) => {
                        const input = document.querySelector(`input[name="attributes[${key}]"]`);
                        const span = document.getElementById(`preview-${key}`);
                        if (input) input.value = value;
                        if (span) {
                            const labels = {
                                nb_personnes: `Jusqu’à ${value} pers.`,
                                age_requis: `Âge : ${value}`,
                                dimensions: `Dimensions : ${value}`,
                                duree: `Durée : ${value}`,
                                nb_joueurs: `Joueurs : ${value}`,
                                poids: `Poids : ${value}`,
                                taille: `Taille : ${value}`
                            };
                            span.textContent = labels[key] || value || '-';
                        }
                    });
                }
            }

            // Image principale
            if (previewMainImage) {
                if (editItem.main_image) {
                    previewMainImage.src = editItem.main_image;
                    if (removeBtn) removeBtn.style.display = "block";
                } else {
                    previewMainImage.src = defaultImage;
                    if (removeBtn) removeBtn.style.display = "none";
                }
            }

            // Scroll form into view
            const formPane = document.getElementById('tab-form');
            if (formPane) formPane.scrollIntoView({ behavior: 'smooth' });

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
        });
    });
}