export function initDashboardEdit() {
    const tabs = document.querySelectorAll('.dashboard-tab');
    const panes = document.querySelectorAll('.dashboard-pane');
    const editButtons = document.querySelectorAll('.edit-article');

    const form = document.getElementById('article-form');
    const idInput = document.getElementById('article-id');
    const nameInput = document.getElementById('name');
    const prixInput = document.getElementById('prix');
    const stockInput = document.getElementById('stock');
    const availabilityInput = document.getElementById('availability');
    const locationSelect = document.getElementById('location_id');
    const previewName = document.getElementById('preview-name');
    const previewPrice = document.getElementById('preview-price');
    const previewStock = document.getElementById('preview-stock');
    const previewAvailability = document.getElementById('preview-availability');
    const previewCategory = document.getElementById('preview-category');
    const previewAttributes = document.getElementById('preview-attributes');

    // --- Onglets ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const target = document.getElementById(`tab-${tab.dataset.tab}`);
            if (target) target.classList.add('active');
        });
    });

    // --- Edition article ---
    editButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tr = btn.closest('tr');
            if (!tr) return;
            const item = JSON.parse(tr.dataset.item);

            // 1️⃣ Basculer vers l’onglet formulaire
            tabs.forEach(t => t.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));
            document.querySelector('.dashboard-tab[data-tab="form"]').classList.add('active');
            document.getElementById('tab-form').classList.add('active');

            // 2️⃣ Remplir le formulaire
            idInput.value = item.id;
            nameInput.value = item.name;
            prixInput.value = item.price;
            stockInput.value = item.stock;
            availabilityInput.value = item.availability ? "1" : "0";
            locationSelect.value = item.location_id;

            // 3️⃣ Mettre à jour la preview
            previewName.textContent = item.name;
            previewPrice.textContent = `${item.price} €`;
            previewStock.textContent = `Stock : ${item.stock}`;
            previewAvailability.textContent = `Disponibilité : ${item.availability ? 'Disponible' : 'Indisponible'}`;
            previewCategory.textContent = `Catégorie : ${item.location_name}`;

            // 4️⃣ Attributs dynamiques
            // Supprimer attributs existants
            previewAttributes.innerHTML = '';
            const attributesContainer = document.getElementById('attributes');
            attributesContainer.innerHTML = '';

            if (item.attributes) {
                Object.entries(item.attributes).forEach(([key, value]) => {
                    // Formulaire
                    const div = document.createElement('div');
                    div.className = 'dashboard-form__group';
                    div.innerHTML = `
                        <label class="dashboard-form__label" for="${key}">${key}</label>
                        <input class="dashboard-form__input" type="text" id="${key}" name="${key}" value="${value}">
                    `;
                    attributesContainer.appendChild(div);

                    // Preview
                    const attrDiv = document.createElement('div');
                    attrDiv.className = 'attribute';
                    attrDiv.innerHTML = `<span id="preview-${key}">${value}</span>`;
                    previewAttributes.appendChild(attrDiv);

                    // Liaison input -> preview
                    const input = div.querySelector('input');
                    const span = attrDiv.querySelector('span');
                    input.addEventListener('input', () => {
                        span.textContent = input.value;
                    });
                });
            }

            // 5️⃣ Image principale
            const previewMainImage = document.getElementById('preview-main-image');
            if (item.main_image) {
                previewMainImage.src = item.main_image;
            } else {
                previewMainImage.src = "https://via.placeholder.com/400x250?text=Aperçu";
            }
        });
    });
}