<section class="dashboard">
    <h1 class="dashboard__title">Gestion des articles</h1>
    <div id="form-message" class="form-message"></div>
    <!-- Onglets -->
    <div class="dashboard-tabs"> <button class="dashboard-tab" data-tab="form" data-action="add">Formulaire
            d'ajout</button> <button class="dashboard-tab" data-tab="list">Liste des articles</button>
        <!-- Mobile toggle preview --> <button class="mobile-toggle-preview">Aperçu</button> </div>
    <!-- Panneaux -->
    <div class="dashboard-panes">
        <!-- Formulaire + Preview côte à côte -->
        <div id="tab-form" class="dashboard-pane ">
            <!-- Formulaire -->
            <div class="dashboard-form-wrapper">
                <p id="form-mode-indicator" class="dashboard-form__mode">Mode : Ajout</p>
                <form id="article-form" class="dashboard-form" action="/dashboard/add" method="POST"
                    enctype="multipart/form-data"> <input type="hidden" id="article-id" name="id" value="">
                    <!-- Champs du formulaire -->
                    <div class="dashboard-form__group"> <label for="location_id"
                            class="dashboard-form__label">Sélectionnez une catégorie</label> <select id="location_id"
                            name="location_id" class="dashboard-form__input" required>
                            <option value="">-- Choisissez --</option> <?php foreach ($locations as $location): ?>
                            <option value="<?=$location['id']?>"><?=htmlspecialchars($location['name'])?>
                            </option>
                            <?php endforeach; ?>
                        </select> </div>
                    <div class="dashboard-form__group"> <label for="name" class="dashboard-form__label">Nom de
                            l’article</label> <input type="text" id="name" name="name" class="dashboard-form__input"
                            placeholder="Ex: Château Gonflable" required> </div>
                    <div class="dashboard-form__group"> <label for="price" class="dashboard-form__label">Tarif
                            (€)</label> <input type="number" id="price" name="price" class="dashboard-form__input"
                            placeholder="Ex: 120" step="0.01" min="0" required> </div>
                    <div class="dashboard-form__group"> <label for="stock" class="dashboard-form__label">Stock</label>
                        <input type="number" id="stock" name="stock" class="dashboard-form__input" placeholder="Ex: 5"
                            min="0" required>
                    </div>
                    <div class="dashboard-form__group"> <label for="availability"
                            class="dashboard-form__label">Disponibilité</label> <select id="availability"
                            name="availability" class="dashboard-form__input" required>
                            <option value="1">Disponible</option>
                            <option value="0">Indisponible</option>
                        </select> </div>
                    <div id="attributes" class="dashboard-form__attributes"></div>
                    <div class="dashboard-form__group"> <label for="image" class="dashboard-form__label">Image
                            principale</label> <input type="file" id="image" name="image" class="dashboard-form__input"
                            accept="image/*"> </div> <button type="submit"
                        class="dashboard-form__submit">Ajouter</button>
                </form>
            </div> <!-- Preview -->
            <div class="dashboard-preview-wrapper">
                <div class="dashboard-preview">
                    <h2>Aperçu</h2>
                    <h3 class="preview__item-category" id="preview-category">Catégorie : -</h3>
                    <div class="preview">
                        <div id="preview-container" class="preview__container"> <img id="preview-main-image"
                                src="https://via.placeholder.com/400x250?text=Aperçu" alt="Aperçu produit"> <button
                                id="remove-image" type="button" class="preview__remove"
                                title="Supprimer l’image">✕</button> <span class="preview__item-price"
                                id="preview-price">0 €</span> </div>
                        <div class="preview__controls"> <label for="resize">Zoom</label> <input type="range" id="resize"
                                min="50" max="200" value="100"> </div>
                        <h3 class="preview__item-title" id="preview-name">Nom de l’article</h3>
                        <div class="preview__item-meta">
                            <p id="preview-stock">Stock : 0</p>
                            <p id="preview-availability">Disponibilité : Oui</p>
                        </div>
                        <div class="preview__item-attributes" id="preview-attributes"></div>
                    </div>
                </div>
            </div>
        </div> <!-- Liste des articles -->
        <!-- Liste des articles -->
        <div id="tab-list" class="dashboard-pane">
            <table id="items-table" class="dashboard-table">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Catégorie</th>
                        <th>Prix</th>
                        <th>Stock</th>
                        <th>Disponibilité</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody> <?php foreach ($categories as $item): ?> <tr
                        data-item='<?=htmlspecialchars(json_encode($item), ENT_QUOTES)?>' data-item-id="<?=$item->id?>">
                        <td data-label="Nom" class="item-name"><?=htmlspecialchars($item->name)?></td>
                        <td data-label="Catégorie" class="category-name">
                            <?=htmlspecialchars($item->location_name ?? '-')?>
                        </td>
                        <td data-label="Prix" class="item-price"><?=number_format($item->price, 2, ',', ' ')?> €
                        </td>
                        <td data-label="Stock" class="item-stock"><?=$item->stock?></td>
                        <td data-label="Disponibilité" class="item-availability">
                            <?=$item->availability ? 'Disponible' : 'Indisponible'?></td>
                        <td data-label="Actions"> <button type="button" class="btn-edit edit-article">✏️</button> <a
                                href="/dashboard/delete/<?=$item->id?>" class="btn-delete"
                                onclick="return confirm('Supprimer cet article ?')">🗑️</a> </td>
                    </tr> <?php endforeach; ?> </tbody>
            </table>
        </div>
    </div>
</section>