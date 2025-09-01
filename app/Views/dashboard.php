<section class="dashboard">
    <h1 class="dashboard__title">Gestion des catégories</h1>

    <!-- Formulaire d'ajout d'une nouvelle catégorie -->
    <form action="/dashboard/addCategory" method="POST" class="dashboard__form">
        <h2 class="dashboard__form-title">Ajouter une nouvelle catégorie</h2>

        <label for="categorie" class="dashboard__form-label">Nom de la catégorie :</label>
        <input type="text" id="categorie" name="categorie" class="dashboard__form-input"
            placeholder="Ex: Structure_gonflable" required>

        <label for="designation" class="dashboard__form-label">Description :</label>
        <textarea id="designation" name="designation" class="dashboard__form-textarea"
            placeholder="Ex: Soft_Play" required></textarea>

        <label for="nb_personnes" class="dashboard__form-label">Nombre de personnes :</label>
        <input type="number" id="nb_personnes" name="nb_personnes" class="dashboard__form-input"
            placeholder="Ex: 8" min="1" max="50">

        <label for="age_requis" class="dashboard__form-label">Âge requis :</label>
        <input type="text" id="age_requis" name="age_requis" class="dashboard__form-input"
            placeholder="Ex: 2 à 4 ans">

        <label for="dimensions" class="dashboard__form-label">Dimensions :</label>
        <input type="text" id="dimensions" name="dimensions" class="dashboard__form-input"
            placeholder="Ex: 4 x 4 m">

        <label for="prix" class="dashboard__form-label">Prix (€) :</label>
        <input type="number" step="0.01" id="prix" name="prix" class="dashboard__form-input"
            placeholder="Ex: 150.00" min="0" required>

        <button type="submit" class="dashboard__form-button">Ajouter la catégorie</button>
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