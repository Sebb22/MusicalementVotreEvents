<section class="location-items">
  <header class="location-items__header">
    <h1 class="location-items__title  hero__headline"><?= htmlspecialchars($location['name']) ?></h1>
    <p class="location-items__intro">
      Découvrez tous nos articles disponibles dans cette catégorie.
    </p>
  </header>
  <?php if (!empty($location['items'])): ?>
    <div class="location-items__grid">
      <?php foreach ($location['items'] as $item): ?>
        <!-- Carte article -->
        <article class="location-item-card">
          <?php if (!empty($item['images'])): ?>
            <?php
            $mainImg = null;
            foreach ($item['images'] as $img) {
              if ($img['is_main']) {
                $mainImg = $img['image_path'];
                break;
              }
            }
            if (!$mainImg) $mainImg = $item['images'][0]['image_path'];
            ?>
            <div class="location-item-card__main">
              <img src="<?= htmlspecialchars($mainImg) ?>" alt="<?= htmlspecialchars($item['name']) ?>"
                class="location-card__image">
              <span class="location-card__price-badge"><?= number_format($item['price'], 2, ',', ' ')."€" ?></span>
            </div>
          <?php endif; ?>

          <footer class="location-item-card__footer">
            <h2 class="location-item-card__title"><?= htmlspecialchars($item['name']) ?></h2>
            <div class="location-item-card__actions">
              <button class="cta add-to-cart">
                Ajouter au devis
              </button>
              <a href="#" class="cta see-more">
                Voir plus
              </a>
            </div>
          </footer>
        </article>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
</section>