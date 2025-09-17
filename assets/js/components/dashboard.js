export function initDashboardForm() {
    // --- Sélecteurs ---
    const locationSelect = document.getElementById('location_id');
    const attributesContainer = document.getElementById('attributes');
    const previewAttributes = document.getElementById('preview-attributes');
    const previewCategory = document.getElementById('preview-category');
    const nameInput = document.getElementById('name');
    const priceInput = document.getElementById('price');
    const stockInput = document.getElementById('stock');
    const availabilityInput = document.getElementById('availability');
    const imageInput = document.getElementById('image'); // attention au nom exact

    const previewName = document.getElementById('preview-name');
    const previewPrice = document.getElementById('preview-price');
    const previewStock = document.getElementById('preview-stock');
    const previewAvailability = document.getElementById('preview-availability');
    const previewMainImage = document.getElementById('preview-main-image');

    const resizeInput = document.getElementById('resize');
    const container = document.getElementById('preview-container');
    const removeBtn = document.getElementById('remove-image');

    if (!locationSelect || !attributesContainer || !previewAttributes || !previewCategory) return;

    // --- Onglets ---
    const tabs = document.querySelectorAll('.dashboard-tab');
    const panes = document.querySelectorAll('.dashboard-pane');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const pane = document.getElementById('tab-' + tab.dataset.tab);
            if (pane) pane.classList.add('active');
        });
    });

    // --- Attributs par catégorie ---
    const locationAttributes = {
        1: [
            { name: 'nb_personnes', label: 'Nombre de personnes', type: 'number', placeholder: 'Ex: 8', icon: 'fas fa-users' },
            { name: 'age_requis', label: 'Âge requis', type: 'text', placeholder: 'Ex: 2 à 4 ans', icon: 'fas fa-child' },
            { name: 'dimensions', label: 'Dimensions', type: 'text', placeholder: 'Ex: 4x4 m', icon: 'fas fa-ruler-combined' }
        ],
        2: [
            { name: 'duree', label: 'Durée', type: 'text', placeholder: 'Ex: 30 min', icon: 'fas fa-clock' },
            { name: 'nb_joueurs', label: 'Nombre de joueurs', type: 'number', placeholder: 'Ex: 4', icon: 'fas fa-users' }
        ],
        3: [
            { name: 'poids', label: 'Poids', type: 'text', placeholder: 'Ex: 2 kg', icon: 'fas fa-weight' },
            { name: 'taille', label: 'Taille', type: 'text', placeholder: 'Ex: 1,5 m', icon: 'fas fa-ruler' }
        ]
    };

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

            const input = div.querySelector('input');
            const span = attrDiv.querySelector('span');
            input.addEventListener('input', () => {
                span.textContent = input.value || '-';
                if (attr.name === 'nb_personnes') span.textContent = input.value ? `Jusqu’à ${input.value} pers.` : '-';
                else if (attr.name === 'age_requis') span.textContent = input.value ? `Âge : ${input.value}` : '-';
                else if (attr.name === 'dimensions') span.textContent = input.value ? `Dimensions : ${input.value}` : '-';
                else if (attr.name === 'duree') span.textContent = input.value ? `Durée : ${input.value}` : '-';
                else if (attr.name === 'nb_joueurs') span.textContent = input.value ? `Joueurs : ${input.value}` : '-';
                else if (attr.name === 'poids') span.textContent = input.value ? `Poids : ${input.value}` : '-';
                else if (attr.name === 'taille') span.textContent = input.value ? `Taille : ${input.value}` : '-';
            });
        });
    }

    locationSelect.addEventListener('change', e => {
        const selectedOption = locationSelect.options[locationSelect.selectedIndex];
        previewCategory.textContent = selectedOption.value ? `Catégorie : ${selectedOption.text}` : "Catégorie : -";
        renderAttributes(e.target.value);
    });

    if (locationSelect.value) {
        const selectedOption = locationSelect.options[locationSelect.selectedIndex];
        previewCategory.textContent = `Catégorie : ${selectedOption.text}`;
        renderAttributes(locationSelect.value);
    }

    // --- Preview générale ---
    if (nameInput) nameInput.addEventListener('input', () => previewName.textContent = nameInput.value || 'Nom de l’article');
    if (priceInput) priceInput.addEventListener('input', () => previewPrice.textContent = priceInput.value ? `${priceInput.value} €` : '0 €');
    if (stockInput) stockInput.addEventListener('input', () => previewStock.textContent = stockInput.value ? `Stock : ${stockInput.value}` : 'Stock : 0');
    if (availabilityInput) availabilityInput.addEventListener('change', () => previewAvailability.textContent = availabilityInput.value == 1 ? 'Disponibilité : Disponible' : 'Disponibilité : Indisponible');

    // --- Upload image + drag/zoom ---
    let translateX = 0,
        translateY = 0,
        scale = 0.9;
    let isDragging = false,
        startX, startY;

    if (imageInput) {
        imageInput.addEventListener('change', () => {
            if (imageInput.files.length > 0) {
                const file = imageInput.files[0];
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

    if (resizeInput) {
        resizeInput.value = 90;
        resizeInput.addEventListener('input', () => {
            scale = resizeInput.value / 100;
            clampTranslation();
            applyTransform(scale);
        });
    }

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

    if (removeBtn) removeBtn.addEventListener('click', resetImage);
    if (previewMainImage) previewMainImage.addEventListener('dblclick', () => {
        translateX = 0;
        translateY = 0;
        scale = 0.9;
        resizeInput.value = scale * 100;
        applyTransform(scale);
    });

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
        imageInput.value = "";
        translateX = 0;
        translateY = 0;
        scale = 0.9;
        resizeInput.value = scale * 100;
        applyTransform(scale);
        removeBtn.style.display = "none";
    }

    // --- Édition d’un article ---
    const editButtons = document.querySelectorAll('.edit-article');
    editButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            //console.log('yo');
            const tr = btn.closest('tr');
            if (!tr) return;
            //console.log('yo');
            const editItem = JSON.parse(tr.dataset.item);
            console.log(editItem);
            document.getElementById('article-id').value = editItem.id || '';
            locationSelect.value = editItem.location_id || '';
            nameInput.value = editItem.name || '';
            priceInput.value = editItem.price || '';
            stockInput.value = editItem.stock || '';
            availabilityInput.value = editItem.availability != null ? editItem.availability : 1;

            const selectedOption = locationSelect.options[locationSelect.selectedIndex];
            previewCategory.textContent = selectedOption.value ? `Catégorie : ${selectedOption.text}` : "Catégorie : -";

            renderAttributes(locationSelect.value);

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
            } else {
                resetImage();
            }

            document.getElementById('tab-form').scrollIntoView({ behavior: 'smooth' });
        });
    });
}