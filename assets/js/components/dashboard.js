export function initDashboardForm() {
    const locationSelect = document.getElementById('location_id');
    const attributesContainer = document.getElementById('attributes');
    const previewAttributes = document.getElementById('preview-attributes');
    const previewCategory = document.getElementById('preview-category');

    if (!locationSelect || !attributesContainer || !previewAttributes || !previewCategory) return;

    // --- Attributs par catégorie ---
    const locationAttributes = {
        1: [ // Structures gonflables
            { name: 'nb_personnes', label: 'Nombre de personnes', type: 'number', placeholder: 'Ex: 8', icon: 'fas fa-users' },
            { name: 'age_requis', label: 'Âge requis', type: 'text', placeholder: 'Ex: 2 à 4 ans', icon: 'fas fa-child' },
            { name: 'dimensions', label: 'Dimensions', type: 'text', placeholder: 'Ex: 4x4 m', icon: 'fas fa-ruler-combined' }
        ],
        2: [ // Jeux de société
            { name: 'duree', label: 'Durée', type: 'text', placeholder: 'Ex: 30 min', icon: 'fas fa-clock' },
            { name: 'nb_joueurs', label: 'Nombre de joueurs', type: 'number', placeholder: 'Ex: 4', icon: 'fas fa-users' }
        ],
        3: [ // Équipements sportifs
                { name: 'poids', label: 'Poids', type: 'text', placeholder: 'Ex: 2 kg', icon: 'fas fa-weight' },
                { name: 'taille', label: 'Taille', type: 'text', placeholder: 'Ex: 1,5 m', icon: 'fas fa-ruler' }
            ]
            // ... autres catégories possibles
    };

    // --- Fonction pour afficher les attributs dynamiques ---
    function renderAttributes(locId) {
        attributesContainer.innerHTML = '';
        previewAttributes.innerHTML = '';
        if (!locId || !locationAttributes[locId]) return;

        locationAttributes[locId].forEach(attr => {
            // Formulaire
            const div = document.createElement('div');
            div.className = 'dashboard-form__group';
            div.innerHTML = `
                <label class="dashboard-form__label" for="${attr.name}">${attr.label}</label>
                <input class="dashboard-form__input" type="${attr.type}" id="${attr.name}" name="${attr.name}" placeholder="${attr.placeholder}">
            `;
            attributesContainer.appendChild(div);

            // Preview
            const attrDiv = document.createElement('div');
            attrDiv.className = 'attribute';
            attrDiv.innerHTML = `<i class="${attr.icon}"></i><span id="preview-${attr.name}">-</span>`;
            previewAttributes.appendChild(attrDiv);

            // Liaison input -> preview
            const input = div.querySelector('input');
            const span = attrDiv.querySelector('span');
            input.addEventListener('input', () => {
                if (attr.name === 'nb_personnes') span.textContent = input.value ? `Jusqu’à ${input.value} pers.` : '-';
                else if (attr.name === 'age_requis') span.textContent = input.value ? `Âge : ${input.value}` : '-';
                else if (attr.name === 'dimensions') span.textContent = input.value ? `Dimensions : ${input.value}` : '-';
                else if (attr.name === 'duree') span.textContent = input.value ? `Durée : ${input.value}` : '-';
                else if (attr.name === 'nb_joueurs') span.textContent = input.value ? `Joueurs : ${input.value}` : '-';
                else if (attr.name === 'poids') span.textContent = input.value ? `Poids : ${input.value}` : '-';
                else if (attr.name === 'taille') span.textContent = input.value ? `Taille : ${input.value}` : '-';
                else span.textContent = input.value || '-';
            });
        });
    }

    // --- Mettre à jour la catégorie sélectionnée ---
    locationSelect.addEventListener('change', e => {
        const selectedOption = locationSelect.options[locationSelect.selectedIndex];
        previewCategory.textContent = selectedOption.value ?
            `Catégorie : ${selectedOption.text}` :
            "Catégorie : -";
        renderAttributes(e.target.value);
    });

    if (locationSelect.value) {
        const selectedOption = locationSelect.options[locationSelect.selectedIndex];
        previewCategory.textContent = `Catégorie : ${selectedOption.text}`;
        renderAttributes(locationSelect.value);
    }

    // --- Preview générale ---
    const nameInput = document.getElementById('name');
    const prixInput = document.getElementById('prix');
    const stockInput = document.getElementById('stock');
    const availabilityInput = document.getElementById('availability');
    const imagesInput = document.getElementById('images');

    const previewName = document.getElementById('preview-name');
    const previewPrice = document.getElementById('preview-price');
    const previewStock = document.getElementById('preview-stock');
    const previewAvailability = document.getElementById('preview-availability');
    const previewMainImage = document.getElementById('preview-main-image');

    const resizeInput = document.getElementById('resize');
    const container = document.getElementById('preview-container');
    const removeBtn = document.getElementById('remove-image');

    let translateX = 0,
        translateY = 0,
        scale = 0.9;
    let isDragging = false,
        startX, startY;

    // Inputs texte / prix / stock / dispo
    if (nameInput) nameInput.addEventListener('input', () => previewName.textContent = nameInput.value || 'Nom de l’article');
    if (prixInput) prixInput.addEventListener('input', () => previewPrice.textContent = prixInput.value ? `${prixInput.value} €` : '0 €');
    if (stockInput) stockInput.addEventListener('input', () => previewStock.textContent = stockInput.value ? `Stock : ${stockInput.value}` : 'Stock : 0');
    if (availabilityInput) availabilityInput.addEventListener('change', () => previewAvailability.textContent = availabilityInput.value == 1 ? 'Disponibilité : Disponible' : 'Disponibilité : Indisponible');

    // Upload image
    if (imagesInput) {
        imagesInput.addEventListener('change', () => {
            if (imagesInput.files.length > 0) {
                const file = imagesInput.files[0];
                const reader = new FileReader();
                reader.onload = e => {
                    previewMainImage.src = e.target.result;
                    removeBtn.style.display = "block";
                    applyTransform(scale);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Slider zoom
    if (resizeInput) {
        resizeInput.value = 90;
        resizeInput.addEventListener('input', () => {
            scale = resizeInput.value / 100;
            clampTranslation();
            applyTransform(scale);
        });
    }

    // Drag image
    if (container) {
        container.addEventListener('mousedown', e => {
            if (scale <= 1) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            container.classList.add('dragging');
        });
        document.addEventListener('mousemove', e => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            startX = e.clientX;
            startY = e.clientY;
            translateX += dx;
            translateY += dy;
            clampTranslation();
            applyTransform(scale);
        });
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                container.classList.remove('dragging');
            }
        });
    }

    // Supprimer image
    if (removeBtn) removeBtn.addEventListener('click', resetImage);

    // Double-clic = reset zoom & position (mais conserve l'image)
    if (previewMainImage) previewMainImage.addEventListener('dblclick', () => {
        translateX = 0;
        translateY = 0;
        scale = 0.9;
        resizeInput.value = scale * 100;
        applyTransform(scale);
    });

    // --- Fonctions ---
    function applyTransform(scale) {
        previewMainImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }

    function clampTranslation() {
        const rect = container.getBoundingClientRect();
        const imgW = rect.width * scale;
        const imgH = rect.height * scale;
        const maxX = Math.max((imgW - rect.width) / (2 * scale), 0);
        const maxY = Math.max((imgH - rect.height) / (2 * scale), 0);
        translateX = Math.min(Math.max(translateX, -maxX), maxX);
        translateY = Math.min(Math.max(translateY, -maxY), maxY);
    }

    function resetImage() {
        previewMainImage.src = "https://via.placeholder.com/400x250?text=Aperçu";
        imagesInput.value = "";
        translateX = 0;
        translateY = 0;
        scale = 0.9;
        resizeInput.value = scale * 100;
        applyTransform(scale);
        removeBtn.style.display = "none";
    }
}