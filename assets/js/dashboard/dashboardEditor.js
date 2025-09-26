import { initImagePreview } from './dashboardImagePreviewHandler.js';

export class DashboardEditor {
  constructor({
    form,
    preview,
    attributesContainer,
    previewAttributes,
    tableId,
  }) {
    this.form = form;
    this.tableId = tableId;
    this.attributesContainer = attributesContainer;
    this.previewAttributes = previewAttributes;
    this.formModeIndicator =
      document.getElementById('form-mode-indicator') || null;

    // Inputs
    this.inputs = {
      name: form.querySelector('#name'),
      price: form.querySelector('#price'),
      stock: form.querySelector('#stock'),
      availability: form.querySelector('#availability'),
      location: form.querySelector('#location_id'),
      image: form.querySelector('#image'),
      articleId: form.querySelector('#article-id'),
    };

    // Preview
    this.preview = preview;

    // Catégories
    this.locations = Array.from(this.inputs.location?.options || []).reduce(
      (acc, opt) => {
        if (opt.value) acc[opt.value] = opt.textContent;
        return acc;
      },
      {}
    );

    // Preview image
    this.imageHandler = initImagePreview({
      imageInput: this.inputs.image,
      previewMainImage: this.preview.image,
      resizeInput: document.getElementById('resize'),
      container: document.getElementById('preview-container'),
      removeBtn: document.getElementById('remove-image'),
      form: this.form,
      hiddenInput: document.getElementById('image_transformed'),
      frameSrc: '/assets/frame.png',
    });

    this.bindLivePreview();
    this.setMode('add');
  }

  setMode(mode) {
    const submitBtn = this.form.querySelector('.dashboard-form__submit');
    const config = {
      add: { text: 'Ajouter', action: '/dashboard/add' },
      edit: { text: 'Mettre à jour', action: '/dashboard/edit' },
    };

    if (this.formModeIndicator) {
      this.formModeIndicator.textContent = `Mode : ${mode === 'edit' ? 'Édition' : 'Ajout'}`;
      this.formModeIndicator.classList.toggle('is-edit', mode === 'edit');
    }

    if (submitBtn) submitBtn.textContent = config[mode].text;
    this.form.action = config[mode].action;
  }

  async callRenderAttributes(locId, existingValues = {}) {
    try {
      const { renderAttributes } = await import(
        './dashboardItemAttributesHandler.js'
      );
      await renderAttributes(
        locId,
        this.attributesContainer,
        this.previewAttributes,
        existingValues
      );
    } catch (err) {
      console.error('[Error] Impossible de charger renderAttributes :', err);
    }
  }

  async editItem(item) {
    this.form.dataset.editId = item.id || '';
    this.inputs.articleId.value = item.id || '';
    this.inputs.name.value = item.name || '';
    this.inputs.price.value = item.price || '';
    this.inputs.stock.value = item.stock || '';
    this.inputs.availability.value = item.availability ?? '1';
    this.inputs.location.value = item.location_id || '';

    // Mettre à jour la preview texte
    this.updatePreview(item);
    console.log('[EditItem] Article reçu :', item);

    const mainPicture = item.pictures?.find(p => p.is_main === '1');
    console.log('[EditItem] Main picture trouvée :', mainPicture);

    if (mainPicture && this.imageHandler?.setImage) {
      console.log('[EditItem] Appel setImage...');
      await this.imageHandler.setImage(mainPicture.image_path);
    } else {
      console.log('[EditItem] Pas d’image principale, reset...');
      this.imageHandler?.resetImage();
    }

    if (item.location_id) {
      console.log(
        '[EditItem] Appel renderAttributes pour locId :',
        item.location_id,
        'avec valeurs :',
        item.attributes
      );
      await this.callRenderAttributes(item.location_id, item.attributes || {});
    } else {
      console.log('[EditItem] Pas de location_id, pas d’attributs à rendre.');
    }

    this.setMode('edit');
  }

  updatePreview(item) {
    this.preview.name.textContent = item.name || 'Nom de l’article';
    this.preview.price.textContent = item.price
      ? parseFloat(item.price).toFixed(2) + ' €'
      : '0 €';
    this.preview.stock.textContent = 'Stock : ' + (item.stock ?? 0);
    this.preview.availability.textContent =
      Number(item.availability) === 1 ? 'Disponible' : 'Indisponible';
    this.preview.category.textContent =
      'Catégorie : ' + this.getLocationName(item.location_id);
  }

  getLocationName(id) {
    return this.locations[id] || '-';
  }

  reset() {
    this.form.dataset.editId = '';
    this.form.reset();
    this.inputs.articleId.value = '';
    this.updatePreview({});
    this.preview.image.src = 'https://via.placeholder.com/400x250?text=Aperçu';
    this.attributesContainer.innerHTML = '';
    this.previewAttributes.innerHTML = '';
    this.imageHandler?.resetImage();
    this.setMode('add');
  }

  bindLivePreview() {
    const { form, preview, inputs } = this;

    inputs.name?.addEventListener(
      'input',
      e => (preview.name.textContent = e.target.value || 'Nom de l’article')
    );
    inputs.price?.addEventListener(
      'input',
      e =>
        (preview.price.textContent =
          (parseFloat(e.target.value) || 0).toFixed(2) + ' €')
    );
    inputs.stock?.addEventListener(
      'input',
      e =>
        (preview.stock.textContent =
          'Stock : ' + (parseInt(e.target.value) || 0))
    );
    inputs.availability?.addEventListener(
      'change',
      e =>
        (preview.availability.textContent =
          e.target.value === '1' ? 'Disponible' : 'Indisponible')
    );
    inputs.location?.addEventListener('change', async e => {
      preview.category.textContent =
        'Catégorie : ' + this.getLocationName(e.target.value);
      await this.callRenderAttributes(e.target.value);
    });

    inputs.image?.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file)
        return (preview.image.src =
          'https://via.placeholder.com/400x250?text=Aperçu');
      if (file.size > 8 * 1024 * 1024) {
        alert(
          `L'image est trop lourde (${(file.size / 1024 / 1024).toFixed(2)} Mo). Taille max : 8 Mo.`
        );
        e.target.value = '';
        preview.image.src = 'https://via.placeholder.com/400x250?text=Aperçu';
        return;
      }
      const reader = new FileReader();
      reader.onload = ev => (preview.image.src = ev.target.result);
      reader.readAsDataURL(file);
    });
  }

  updateTableRow(itemData) {
    const table = document.getElementById(this.tableId);
    if (!table) return;
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
  
    const priceFormatted =
      parseFloat(itemData.price).toLocaleString('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + ' €';
  
    let row = tbody.querySelector(`tr[data-item-id="${itemData.id}"]`);
    const newRow = document.createElement('tr');
    newRow.dataset.item = JSON.stringify(itemData);
    newRow.dataset.itemId = String(itemData.id);
    newRow.dataset.locationId = itemData.location_id;
  
    newRow.innerHTML = `
      <td><input type="checkbox" class="item-checkbox" data-id="${itemData.id}"></td>
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
  
    row ? row.replaceWith(newRow) : tbody.appendChild(newRow);
  
    newRow.classList.add('highlight');
  
    // Scroll dans le conteneur du tableau
    const container = table.parentElement; // supposé avoir overflow: auto
    if (container) {
      const containerTop = container.getBoundingClientRect().top;
      const rowTop = newRow.getBoundingClientRect().top;
      container.scrollBy({
        top: rowTop - containerTop - container.clientHeight / 2,
        behavior: 'smooth',
      });
    } else {
      // fallback si pas de conteneur, scroll sur la page
      newRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  
    setTimeout(() => newRow.classList.remove('highlight'), 2000);
    table.style.display = 'table';
  }
  
}
