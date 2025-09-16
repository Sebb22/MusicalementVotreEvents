<section class="dashboard">
  <h1 class="dashboard__title">Gestion des articles</h1>

  <!-- Formulaire d'ajout d'article -->
  <form class="dashboard-form" action="/dashboard/add" method="POST" enctype="multipart/form-data">
    <!-- Sélection de catégorie -->
    <div class="dashboard-form__group">
      <label for="location_id" class="dashboard-form__label">Sélectionnez une catégorie</label>
      <select id="location_id" name="location_id" class="dashboard-form__input" required>
        <option value="">-- Choisissez --</option>
        <?php foreach ($locations as $location): ?>
          <option value="<?= $location['id'] ?>"><?= htmlspecialchars($location['name']) ?></option>
        <?php endforeach; ?>
      </select>
    </div>

    <!-- Nom de l’article -->
    <div class="dashboard-form__group">
      <label for="name" class="dashboard-form__label">Nom de l’article</label>
      <input type="text" id="name" name="name" class="dashboard-form__input" placeholder="Ex: Château Gonflable" required>
    </div>

    <!-- Prix -->
    <div class="dashboard-form__group">
      <label for="prix" class="dashboard-form__label">Tarif (€)</label>
      <input type="number" id="prix" name="prix" class="dashboard-form__input" placeholder="Ex: 120" step="0.01" min="0" required>
    </div>

    <!-- Stock -->
    <div class="dashboard-form__group">
      <label for="stock" class="dashboard-form__label">Stock</label>
      <input type="number" id="stock" name="stock" class="dashboard-form__input" placeholder="Ex: 5" min="0" required>
    </div>

    <!-- Disponibilité -->
    <div class="dashboard-form__group">
      <label for="availability" class="dashboard-form__label">Disponibilité</label>
      <select id="availability" name="availability" class="dashboard-form__input" required>
        <option value="1">Disponible</option>
        <option value="0">Indisponible</option>
      </select>
    </div>

    <!-- Attributs dynamiques -->
    <div id="attributes" class="dashboard-form__attributes"></div>

    <!-- Upload image -->
    <div class="dashboard-form__group">
      <label for="images" class="dashboard-form__label">Image principale</label>
      <input type="file" id="images" name="images" class="dashboard-form__input" accept="image/*">
    </div>

    <button type="submit" class="dashboard-form__submit">Ajouter</button>
  </form>

  <!-- Aperçu -->
  <div class="dashboard-preview">
    <h2>Aperçu</h2>
    <h3 class="preview__item-category" id="preview-category">Catégorie : -</h3>


    <div class="preview">
      <div id="preview-container" class="preview__container">
        <img id="preview-main-image" src="https://via.placeholder.com/400x250?text=Aperçu" alt="Aperçu produit">
        <button id="remove-image" type="button" class="preview__remove" title="Supprimer l’image">✕</button>
        <span class="preview__item-price" id="preview-price">0 €</span>
      </div>

      <div class="preview__controls">
        <label for="resize">Zoom</label>
        <input type="range" id="resize" min="50" max="200" value="100">
      </div>

      <h3 class="preview__item-title" id="preview-name">Nom de l’article</h3>
      <div class="preview__item-meta">
        <p id="preview-stock">Stock : 0</p>
        <p id="preview-availability">Disponibilité : Oui</p>
      </div>

      <div class="preview__item-attributes" id="preview-attributes"></div>
    </div>
  </div>
</section>
