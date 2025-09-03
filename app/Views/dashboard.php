<section class="dashboard">
  <h1 class="dashboard__title">Gestion des articles</h1>

  <form class="dashboard-form" action="/dashboard/add" method="POST" enctype="multipart/form-data">
    <!-- Sélection de la catégorie -->
    <div class="dashboard-form__group">
      <label for="location_id" class="dashboard-form__label">Sélectionnez une catégorie</label>
      <select id="location_id" name="location_id" class="dashboard-form__input" required>
        <option value="">-- Choisissez --</option>
        <?php foreach ($locations as $location): ?>
          <option value="<?= $location['id'] ?>"><?= htmlspecialchars($location['name']) ?></option>
        <?php endforeach; ?>
      </select>
    </div>

    <!-- Attributs dynamiques selon la location -->
    <div id="attributes" class="dashboard-form__attributes"></div>

    <!-- Champs communs -->
    <div class="dashboard-form__group">
      <label for="prix" class="dashboard-form__label">Tarif (€)</label>
      <input type="number" id="prix" name="prix" class="dashboard-form__input" placeholder="Ex: 120" step="0.01" min="0">
    </div>

    <div class="dashboard-form__group">
      <label for="stock" class="dashboard-form__label">Stock</label>
      <input type="number" id="stock" name="stock" class="dashboard-form__input" placeholder="Ex: 10" min="0">
    </div>

    <div class="dashboard-form__group">
      <label for="disponible" class="dashboard-form__label">Disponible</label>
      <select id="disponible" name="disponible" class="dashboard-form__input">
        <option value="1" selected>Oui</option>
        <option value="0">Non</option>
      </select>
    </div>

    <!-- Upload images -->
    <div class="dashboard-form__group">
      <label for="images" class="dashboard-form__label">Images</label>
      <input type="file" id="images" name="images[]" class="dashboard-form__file" multiple accept="image/*">
      <div id="preview" class="dashboard-form__preview"></div>
    </div>

    <button type="submit" class="dashboard-form__submit">Ajouter</button>
  </form>

  <!-- Liste des articles existants -->
  <div class="dashboard__items">
    <?php foreach ($categories as $category): ?>
      <article class="dashboard__item">
        <h2 class="dashboard__item-title"><?= htmlspecialchars($category['designation']) ?></h2>

        <div class="dashboard__item-images">
          <?php foreach ($category['images'] as $image): ?>
            <div class="dashboard__item-image">
              <img src="<?= $image['image_path'] ?>" alt="">
              <label>
                <input type="radio" name="main_image_<?= $category['id'] ?>" value="<?= $image['id'] ?>" <?= $image['is_main'] ? 'checked' : '' ?>>
                Principale
              </label>
              <button class="dashboard__item-image-delete" data-id="<?= $image['id'] ?>">Supprimer</button>
            </div>
          <?php endforeach; ?>
        </div>

        <!-- Formulaire upload image pour item -->
        <form action="/dashboard/uploadImage?item=<?= $category['id'] ?>" method="POST" enctype="multipart/form-data" class="dashboard__upload">
          <input type="file" name="images[]" multiple required>
          <button type="submit" class="dashboard__upload-button">Uploader</button>
        </form>
      </article>
    <?php endforeach; ?>
  </div>
</section>

