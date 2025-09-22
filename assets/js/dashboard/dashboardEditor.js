import { renderAttributes } from './dashboardItemAttributesHandler.js';
import { initImagePreview } from './dashboardImagePreviewHandler.js';

export class DashboardEditor {
    constructor({ form, preview, attributesContainer, previewAttributes, tableId }) {
        this.form = form;
        this.preview = preview;
        this.attributesContainer = attributesContainer;
        this.previewAttributes = previewAttributes;
        this.tableId = tableId;

        // Sélecteurs sécurisés
        this.formModeIndicator = document.getElementById('form-mode-indicator') || null;

        // Catégories
        this.locations = Array.from(document.querySelectorAll('#location_id option'))
            .reduce((acc, opt) => {
                if (opt.value) acc[opt.value] = opt.textContent;
                return acc;
            }, {});

        // Preview image
        this.imageHandler = initImagePreview({
            imageInput: this.form.querySelector('#image'),
            previewMainImage: this.preview.image,
            resizeInput: document.getElementById('resize'),
            container: document.getElementById('preview-container'),
            removeBtn: document.getElementById('remove-image')
        });

        // Lier formulaire → preview texte
        this.bindLivePreview();

        // Mode initial
        this.setMode('add');
    }

    setMode(mode) {
        const submitBtn = this.form.querySelector('.dashboard-form__submit');
        const config = {
            add: { text: 'Ajouter', action: '/dashboard/add' },
            edit: { text: 'Mettre à jour', action: '/dashboard/edit' }
        };

        if (this.formModeIndicator) {
            this.formModeIndicator.textContent = `Mode : ${mode === 'edit' ? 'Édition' : 'Ajout'}`;
            this.formModeIndicator.classList.toggle('is-edit', mode === 'edit');
        }

        if (submitBtn) submitBtn.textContent = config[mode].text;
        this.form.action = config[mode].action;
    }

    editItem(item) {
        this.form.dataset.editId = item.id || '';
        this.form.querySelector('#name').value = item.name || '';
        this.form.querySelector('#price').value = item.price || '';
        this.form.querySelector('#stock').value = item.stock || '';
        this.form.querySelector('#availability').value = item.availability ?? '1';
        this.form.querySelector('#location_id').value = item.location_id || '';

        // Preview texte
        this.preview.name.textContent = item.name || 'Nom de l’article';
        this.preview.price.textContent = item.price ? parseFloat(item.price).toFixed(2) + ' €' : '0 €';
        this.preview.stock.textContent = 'Stock : ' + (item.stock ?? 0);
        this.preview.availability.textContent = item.availability == "1" ? 'Disponible' : 'Indisponible';
        this.preview.category.textContent = 'Catégorie : ' + this.getLocationName(item.location_id);

        // Preview image
        this.preview.image.src = item.main_image || 'https://via.placeholder.com/400x250?text=Aperçu';
        this.imageHandler?.resetImage();

        // Attributs dynamiques
        typeof renderAttributes === 'function' && renderAttributes(
            item.location_id,
            this.attributesContainer,
            this.previewAttributes,
            item.attributes || {}
        );

        this.setMode('edit');
    }

    getLocationName(id) {
        return this.locations[id] || '-';
    }

    reset() {
        this.form.dataset.editId = '';
        this.form.reset();

        this.preview.name.textContent = 'Nom de l’article';
        this.preview.price.textContent = '0 €';
        this.preview.stock.textContent = 'Stock : 0';
        this.preview.availability.textContent = 'Disponibilité : Oui';
        this.preview.category.textContent = 'Catégorie : -';
        this.preview.image.src = 'https://via.placeholder.com/400x250?text=Aperçu';

        this.attributesContainer.innerHTML = '';
        this.previewAttributes.innerHTML = '';
        this.imageHandler?.resetImage();

        this.setMode('add');
    }

    bindLivePreview() {
        const { form, preview, attributesContainer, previewAttributes } = this;

        // Nom
        form.querySelector('#name')?.addEventListener('input', e => {
            preview.name.textContent = e.target.value || 'Nom de l’article';
        });

        // Prix
        form.querySelector('#price')?.addEventListener('input', e => {
            const value = parseFloat(e.target.value) || 0;
            preview.price.textContent = value.toFixed(2) + ' €';
        });

        // Stock
        form.querySelector('#stock')?.addEventListener('input', e => {
            const value = parseInt(e.target.value) || 0;
            preview.stock.textContent = 'Stock : ' + value;
        });

        // Disponibilité
        form.querySelector('#availability')?.addEventListener('change', e => {
            preview.availability.textContent = e.target.value === "1" ? 'Disponible' : 'Indisponible';
        });

        // Catégorie
        form.querySelector('#location_id')?.addEventListener('change', e => {
            const val = e.target.value;
            preview.category.textContent = 'Catégorie : ' + this.getLocationName(val);
            typeof renderAttributes === 'function' && renderAttributes(val, attributesContainer, previewAttributes);
        });

        // Image
        form.querySelector('#image')?.addEventListener('change', e => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = ev => { preview.image.src = ev.target.result; };
                reader.readAsDataURL(file);
            } else preview.image.src = 'https://via.placeholder.com/400x250?text=Aperçu';
        });
    }

    updateTableRow(itemData) {
        const table = document.getElementById(this.tableId);
        if (!table) return;
        const tbody = table.querySelector('tbody');
        const priceFormatted = parseFloat(itemData.price).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

        let existingRow = tbody.querySelector(`tr[data-item-id="${itemData.id}"]`);
        const tr = document.createElement('tr');
        tr.dataset.item = JSON.stringify(itemData);
        tr.dataset.itemId = itemData.id;
        tr.innerHTML = `
            <td data-label="Nom">${itemData.name}</td>
            <td data-label="Catégorie">${itemData.location_name || '-'}</td>
            <td data-label="Prix">${priceFormatted}</td>
            <td data-label="Stock">${itemData.stock}</td>
            <td data-label="Disponibilité">${itemData.availability == 1 ? 'Disponible' : 'Indisponible'}</td>
            <td data-label="Actions">
                <button type="button" class="btn-edit edit-article">✏️</button>
                <button type="button" class="btn-delete">🗑️</button>
            </td>
        `;

        existingRow ? tbody.replaceChild(tr, existingRow) : tbody.appendChild(tr);
        table.style.display = 'table';
    }
}
