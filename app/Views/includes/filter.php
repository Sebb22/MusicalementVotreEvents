<div class="table-filters">
  <input type="text" data-filter="search" placeholder="Rechercher..." />
  <select data-filter="category">
    <option value="">Toutes les catégories</option>
    <option value="Catégorie 1">Catégorie 1</option>
    <option value="Catégorie 2">Catégorie 2</option>
  </select>
  <select data-filter="attribute">
    <option value="">Tous les attributs</option>
    <option value="Attribute 1">Attribute 1</option>
    <option value="Attribute 2">Attribute 2</option>
  </select>
</div>

<table class="filterable-table">
  <thead>
    <tr>
      <th>Nom</th>
      <th>Catégorie</th>
      <th>Attributs</th>
    </tr>
  </thead>
  <tbody>
    <tr>
    <tbody>
<?php foreach($items as $item): ?>
<tr data-category="<?= htmlspecialchars($item['category']) ?>" data-attributes="<?= htmlspecialchars(implode(',', $item['attributes'])) ?>">
  <td data-label="Nom"><?= htmlspecialchars($item['name']) ?></td>
  <td data-label="Catégorie"><?= htmlspecialchars($item['category']) ?></td>
  <td data-label="Attributs"><?= htmlspecialchars(implode(', ', $item['attributes'])) ?></td>
</tr>
<?php endforeach; ?>
</tbody>
    </tr>
    <!-- autres lignes -->
  </tbody>
</table>
