export function initDashboardForm() {
    const locationSelect = document.getElementById('location_id');
    const attributesContainer = document.getElementById('attributes');

    if (!locationSelect || !attributesContainer) return; // <- sécurité

    const locationAttributes = {
        1: [
            { name: 'nb_personnes', label: 'Nombre de personnes', type: 'number', placeholder: 'Ex: 8' },
            { name: 'age_requis', label: 'Âge requis', type: 'text', placeholder: 'Ex: 2 à 4 ans' },
            { name: 'dimensions', label: 'Dimensions', type: 'text', placeholder: 'Ex: 4x4 m' },
            { name: 'poids', label: 'Poids', type: 'text', placeholder: 'Ex: 50kg' }
        ],
        2: [
            { name: 'type_jeu', label: 'Type de jeu', type: 'text', placeholder: 'Ex: Jeu de société' },
            { name: 'nombre_joueurs', label: 'Nombre de joueurs', type: 'number', placeholder: 'Ex: 2 à 6' }
        ],
        3: [
            { name: 'mascotte_nom', label: 'Nom de la mascotte', type: 'text', placeholder: 'Ex: Pikachu' },
            { name: 'taille', label: 'Taille', type: 'text', placeholder: 'Ex: 1m50' },
            { name: 'age_min', label: 'Âge minimum', type: 'number', placeholder: 'Ex: 3' }
        ],
        4: [
            { name: 'menu', label: 'Menu', type: 'text', placeholder: 'Ex: Pizza, Burger' },
            { name: 'quantite', label: 'Quantité', type: 'number', placeholder: 'Ex: 50' }
        ]
    };

    function renderAttributes(locId) {
        attributesContainer.innerHTML = '';
        if (!locId || !locationAttributes[locId]) return;

        locationAttributes[locId].forEach(attr => {
            const div = document.createElement('div');
            div.className = 'dashboard-form__group';
            div.innerHTML = `
                <label class="dashboard-form__label" for="${attr.name}">${attr.label}</label>
                <input class="dashboard-form__input" type="${attr.type}" id="${attr.name}" name="${attr.name}" placeholder="${attr.placeholder}">
            `;
            attributesContainer.appendChild(div);
        });
    }

    locationSelect.addEventListener('change', e => {
        renderAttributes(e.target.value);
    });

    if (locationSelect.value) {
        renderAttributes(locationSelect.value);
    }
}