export function initDashboard() {
    const locationSelect = document.getElementById('location_id');
    const attributesContainer = document.getElementById('attributes');
    const imagesInput = document.getElementById('images');
    const preview = document.getElementById('preview');
    const addAttrBtn = document.getElementById('addAttr');


    // ➤ Champs dynamiques selon location_id
    const locationAttributes = {
        1: [ // Structures gonflables
            { name: 'nb_personnes', label: 'Nombre de personnes', placeholder: 'Ex: 8', type: 'number' },
            { name: 'age_requis', label: 'Âge requis', placeholder: 'Ex: 2 à 4 ans', type: 'text' },
            { name: 'dimensions', label: 'Dimensions', placeholder: 'Ex: 4 x 4 m', type: 'text' },
            { name: 'poids', label: 'Poids max', placeholder: 'Ex: 100 kg', type: 'text' },
            { name: 'matiere', label: 'Matière', placeholder: 'Ex: PVC', type: 'text' }
        ],
        2: [ // Jeux
            { name: 'age_min', label: 'Âge minimum', placeholder: 'Ex: 5 ans', type: 'text' },
            { name: 'nb_joueurs', label: 'Nombre de joueurs', placeholder: 'Ex: 2-6', type: 'text' },
            { name: 'dimensions', label: 'Dimensions', placeholder: 'Ex: 3 x 3 m', type: 'text' },
            { name: 'duree', label: 'Durée moyenne', placeholder: 'Ex: 30 min', type: 'text' }
        ],
        3: [ // Mascottes / animations
            { name: 'duree', label: 'Durée prestation', placeholder: 'Ex: 1h', type: 'text' },
            { name: 'nb_intervenants', label: 'Nombre d’intervenants', placeholder: 'Ex: 1', type: 'number' },
            { name: 'costume', label: 'Type de costume', placeholder: 'Ex: mascotte lion', type: 'text' },
            { name: 'conditions_meteo', label: 'Conditions météo', placeholder: 'Ex: couvert uniquement', type: 'text' }
        ],
        4: [ // Restauration / traiteur
            { name: 'menu', label: 'Menu', placeholder: 'Ex: Pizza, Burger', type: 'text' },
            { name: 'quantite_min', label: 'Quantité minimum', placeholder: 'Ex: 50', type: 'number' },
            { name: 'allergenes', label: 'Allergènes', placeholder: 'Ex: gluten, lait', type: 'text' },
            { name: 'vegetarien', label: 'Options végétariennes', placeholder: 'Ex: Oui/Non', type: 'text' },
            { name: 'service', label: 'Service inclus', placeholder: 'Ex: Oui/Non', type: 'text' }
        ]
    };


    locationSelect.addEventListener('change', () => {
        const locId = locationSelect.value;
        attributesContainer.innerHTML = '';

        if (!locId || !locationAttributes[locId]) return;

        locationAttributes[locId].forEach(attr => {
            const div = document.createElement('div');
            div.className = 'dashboard-form__group';
            div.innerHTML = `
                <label class="dashboard-form__label" for="${attr.name}">${attr.label}</label>
                <input class="dashboard-form__input" type="${attr.type}" id="${attr.name}" name="attributes[${attr.name}]" placeholder="${attr.placeholder}">
            `;
            attributesContainer.appendChild(div);
        });
    });


    // ➤ Ajouter un attribut dynamique manuel
    if (addAttrBtn) {
        addAttrBtn.addEventListener('click', () => {
            const index = attributesContainer.children.length;
            const div = document.createElement('div');
            div.className = 'dashboard-form__attr';
            div.innerHTML = `
                <input type="text" name="attributes[${index}][name]" placeholder="Nom" required>
                <input type="text" name="attributes[${index}][value]" placeholder="Valeur" required>
                <button type="button" class="dashboard-form__remove-attr">-</button>
            `;
            attributesContainer.appendChild(div);

            div.querySelector('.dashboard-form__remove-attr').addEventListener('click', () => {
                div.remove();
            });
        });
    }

    // ➤ Preview des images avant upload
    if (imagesInput) {
        imagesInput.addEventListener('change', () => {
            preview.innerHTML = '';
            Array.from(imagesInput.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = e => {
                    const imgDiv = document.createElement('div');
                    imgDiv.className = 'dashboard-form__preview-img';
                    imgDiv.innerHTML = `<img src="${e.target.result}" alt=""><button type="button" class="remove-preview">x</button>`;
                    preview.appendChild(imgDiv);

                    imgDiv.querySelector('.remove-preview').addEventListener('click', () => {
                        imgDiv.remove();
                    });
                };
                reader.readAsDataURL(file);
            });
        });
    }

    // ➤ Supprimer image existante
    document.querySelectorAll('.dashboard__item-image-delete').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            const id = btn.dataset.id;
            if (confirm('Supprimer cette image ?')) {
                fetch(`/dashboard/deleteImage?id=${id}`, { method: 'POST' })
                    .then(() => location.reload());
            }
        });
    });
}