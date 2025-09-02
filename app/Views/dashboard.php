<section class="dashboard">
    <h1 class="dashboard__title">Gestion des catégories</h1>
    

    <!-- Formulaire d'ajout d'une nouvelle catégorie -->
    <form class="dashboard-form" action="/dashboard/add" method="POST" enctype="multipart/form-data">
        <div class="dashboard-form__group">
        <label for="designation" class="dashboard-form__label">Désignation</label>
    <select id="designation" name="designation" class="dashboard-form__input" required>
        <option value="">-- Sélectionnez une désignation --</option>
        <?php foreach ($locations as $location): ?>
            <option value="<?= htmlspecialchars($location['id']) ?>">
                <?= htmlspecialchars($location['name']) ?>
            </option>
        <?php endforeach; ?>
    </select>
        </div>

        <div class="dashboard-form__group">
            <label for="nb_personnes" class="dashboard-form__label">Nombre de personnes</label>
            <input type="number" id="nb_personnes" name="nb_personnes" class="dashboard-form__input" placeholder="Ex: 8">
        </div>

        <div class="dashboard-form__group">
            <label for="age_requis" class="dashboard-form__label">Âge requis</label>
            <input type="text" id="age_requis" name="age_requis" class="dashboard-form__input" placeholder="Ex: 2 à 4 ans">
        </div>

        <div class="dashboard-form__group">
            <label for="dimensions" class="dashboard-form__label">Dimensions</label>
            <input type="text" id="dimensions" name="dimensions" class="dashboard-form__input" placeholder="Ex: 4 x 4 m">
        </div>

        <div class="dashboard-form__group">
            <label for="prix" class="dashboard-form__label">Tarif (€)</label>
            <input type="number" id="prix" name="prix" class="dashboard-form__input" placeholder="Ex: 120" step="0.01" min="0">
        </div>

        <div class="dashboard-form__group">
            <label for="images" class="dashboard-form__label">Images</label>
            <input type="file" id="images" name="images[]" class="dashboard-form__file" multiple accept="image/*">
            <small class="dashboard-form__hint">Formats acceptés : JPG, PNG, GIF. Taille max : 2 Mo.</small>

            <!-- Zone de preview -->
            <div id="preview" class="dashboard-form__preview"></div>
        </div>

        <button type="submit" class="dashboard-form__submit">Ajouter</button>
    </form>

    <!-- Liste des catégories existantes -->
    <?php foreach ($categories as $category): ?>
        <article class="dashboard__category">
            <h2 class="dashboard__category-title">
                <?= htmlspecialchars($category['categorie']) ?>
            </h2>

            <p class="dashboard__category-description">
                <?= htmlspecialchars($category['designation']) ?>
            </p>

            <div class="dashboard__images">
                <?php foreach ($category['images'] as $image): ?>
                    <div class="dashboard__image">
                        <img src="<?= $image['image_path'] ?>" alt="Image de <?= htmlspecialchars($category['categorie']) ?>">
                        <form action="/dashboard/deleteImage?id=<?= $image['id'] ?>" method="POST" class="dashboard__image-form">
                            <button type="submit" class="dashboard__image-delete">Supprimer</button>
                        </form>
                    </div>
                <?php endforeach; ?>
            </div>

            <form action="/dashboard/uploadImage?category=<?= $category['id'] ?>" method="POST" enctype="multipart/form-data" class="dashboard__upload">
                <label class="dashboard__upload-label">
                    Ajouter une image :
                    <input type="file" name="image" class="dashboard__upload-input" required>
                </label>
                <button type="submit" class="dashboard__upload-button">Uploader</button>
            </form>
        </article>
    <?php endforeach; ?>
</section>
