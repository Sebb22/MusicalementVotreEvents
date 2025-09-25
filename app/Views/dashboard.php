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
                            accept="image/*"> <input type="hidden" name="image_transformed" id="image_transformed">
                    </div> <button type="submit" class="dashboard-form__submit">Ajouter</button>
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
                                min="10" max="500" value="150   "> </div>
                        <h3 class="preview__item-title" id="preview-name">Nom de l’article</h3>
                        <div class="preview__item-meta">
                            <p id="preview-stock">Stock : 0</p>
                            <p id="preview-availability">Disponibilité : Oui</p>
                        </div>
                        <div class="preview__item-attributes" id="preview-attributes"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Liste des articles -->
        <div id="tab-list" class="dashboard-pane">
            <!--  filtre -->
            <div class="dashboard-filter">
                <label for="category-filter">Filtrer par catégorie :</label>
                <div class="dashboard-filter__wrapper">
                    <select id="category-filter" class="dashboard-filter__select">
                        <option value="">Toutes</option>
                        <?php foreach ($locations as $location): ?>
                        <option value="<?=$location['id']?>"><?=htmlspecialchars($location['name'])?></option>
                        <?php endforeach; ?>
                    </select>

                    <div class="dashboard-filter__search-wrapper">
                        <span class="search-icon">🔍</span>
                        <input type="text" class="dashboard-filter__search" placeholder="Rechercher...">
                    </div>
                </div>
            </div>



            <div id="bulk-actions" class="bulk-actions hidden">
                <span id="bulk-count">0 sélectionné(s)</span>
                <button id="delete-selected" class="btn btn-danger">🗑 Supprimer</button>
                <button id="bulk-cancel" class="btn btn-secondary">✖ Annuler</button>
            </div>
            <table id="items-table" class="dashboard-table">
                <thead>
                    <tr>
                        <th><input type="checkbox" id="select-all"></th>
                        <th>Nom</th>
                        <th>Catégorie</th>
                        <th>Prix</th>
                        <th>Stock</th>
                        <th>Disponibilité</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($categories as $item): ?>
                    <tr data-item='<?=htmlspecialchars(json_encode($item), ENT_QUOTES)?>' data-item-id="<?=$item->id?>"
                        data-location-id="<?=$item->location_id?>">
                        <td><input type="checkbox" class="item-checkbox" data-id="<?=$item->id?>"></td>
                        <td><?=htmlspecialchars($item->name)?></td>
                        <td><?=htmlspecialchars($item->location_name ?? '-')?></td>
                        <td><?=number_format($item->price, 2, ',', ' ')?> €</td>
                        <td><?=$item->stock?></td>
                        <td><?=$item->availability ? 'Disponible' : 'Indisponible'?></td>
                        <td>
                            <button type="button" class="btn-edit edit-article">✏️</button>
                            <a href="/dashboard/delete/<?=$item->id?>" class="btn-delete">🗑️</a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Modal de confirmation -->
    <div id="confirm-modal" class="modal">
        <div class="modal-content">
            <p id="confirm-message">Supprimer cet article ?</p>
            <div class="modal-actions">
                <button id="confirm-yes" class="btn btn-danger">Oui</button>
                <button id="confirm-no" class="btn btn-secondary">Non</button>
            </div>
        </div>
    </div>

</section>