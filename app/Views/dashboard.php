<div class="dashboard">
    <h1>Dashboard - Gestion des catégories de location</h1>

    <!-- Formulaire d'ajout -->
    <section class="dashboard__form">
        <form action="/dashboard/add" method="POST" id="formAddCategory">
            <input type="text" name="categorie" placeholder="Catégorie" required>
            <input type="text" name="designation" placeholder="Désignation" required>
            <input type="number" name="nb_personnes" placeholder="Nombre de personnes">
            <input type="number" name="age_requis" placeholder="Âge requis">
            <input type="text" name="dimensions" placeholder="Dimensions">
            <input type="number" step="0.01" name="prix" placeholder="Prix" required>
            <input type="number" name="location_id" placeholder="Location ID" required>
            <button type="submit">Ajouter</button>
        </form>
    </section>

    <!-- Tableau des catégories -->
    <section class="dashboard__table-wrapper">
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Catégorie</th>
                    <th>Désignation</th>
                    <th>Nb personnes</th>
                    <th>Âge requis</th>
                    <th>Dimensions</th>
                    <th>Prix</th>
                    <th>Location ID</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php if (!empty($categories)): ?>
                    <?php foreach ($categories as $cat): ?>
                        <tr>
                            <td><?= $cat->id ?></td>
                            <td><?= htmlspecialchars($cat->categorie) ?></td>
                            <td><?= htmlspecialchars($cat->designation) ?></td>
                            <td><?= $cat->nb_personnes ?></td>
                            <td><?= $cat->age_requis ?></td>
                            <td><?= htmlspecialchars($cat->dimensions) ?></td>
                            <td><?= $cat->prix ?></td>
                            <td><?= $cat->location_id ?></td>
                            <td>
                                <a href="/dashboard/edit/<?= $cat->id ?>">Éditer</a> |
                                <a href="/dashboard/delete/<?= $cat->id ?>" onclick="return confirm('Supprimer cette catégorie ?')">Supprimer</a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php else: ?>
                    <tr>
                        <td colspan="9">Aucune catégorie trouvée.</td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </section>
</div>
