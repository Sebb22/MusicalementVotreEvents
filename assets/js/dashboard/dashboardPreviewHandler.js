/**
 * Initialise le preview dynamique des champs du formulaire
 * @param {Object} params - Les éléments du formulaire et du preview
 */
export function initPreview({
    nameInput,
    priceInput,
    stockInput,
    availabilityInput,
    previewName,
    previewPrice,
    previewStock,
    previewAvailability
}) {

    // --- Vérification des éléments essentiels ---
    const requiredElements = {
        nameInput,
        priceInput,
        stockInput,
        availabilityInput,
        previewName,
        previewPrice,
        previewStock,
        previewAvailability
    };

    Object.entries(requiredElements).forEach(([key, el]) => {
        if (!el) {
            console.warn(`⚠️ ${key} manquant dans le DOM`, {
                [key]: el
            });
        }
    });

    // --- Sécurité : stop si aucun élément critique ---
    if (!nameInput && !priceInput && !stockInput && !availabilityInput) {
        return;
    }

    // --- Nom de l’article ---
    if (nameInput && previewName) {
        nameInput.addEventListener('input', () => {
            previewName.textContent = nameInput.value || 'Nom de l’article';
        });
    }

    // --- Prix ---
    if (priceInput && previewPrice) {
        priceInput.addEventListener('input', () => {
            previewPrice.textContent = priceInput.value ? `${priceInput.value} €` : '0 €';
        });
    }

    // --- Stock ---
    if (stockInput && previewStock) {
        stockInput.addEventListener('input', () => {
            previewStock.textContent = stockInput.value ? `Stock : ${stockInput.value}` : 'Stock : 0';
        });
    }

    // --- Disponibilité ---
    if (availabilityInput && previewAvailability) {
        availabilityInput.addEventListener('change', () => {
            previewAvailability.textContent =
                availabilityInput.value == 1 ?
                'Disponibilité : Disponible' :
                'Disponibilité : Indisponible';
        });

    }
}