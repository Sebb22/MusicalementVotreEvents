<section class="location-items">
    <header class="location-items__header">
        <h1 class="location-items__title hero__headline">
            <?=htmlspecialchars($location['name'])?>
        </h1>
    </header>

    <?php if (!empty($location['items'])): ?>
    <div class="location-items__grid">
        <?php foreach ($location['items'] as $item): ?>
        <article class="location-item-card">
            <div class="location-item-card__inner">

                <!-- Face avant -->
                <div class="location-item-card__main">
                    <img src="<?=htmlspecialchars($item->thumbnail)?>" alt="<?=htmlspecialchars($item->name)?>"
                        class="location-card__image">
                    <span class="location-card__price-badge">
                        <?=number_format($item->price, 2, ',', ' ') . "€"?>
                    </span>
                </div>


                <footer class="location-item-card__footer">
                    <h2 class="location-item-card__title"><?=htmlspecialchars($item->name)?></h2>
                    <div class="location-item-card__actions">
                        <button class="cta add-to-cart">Ajouter au devis</button>
                        <button type="button" class="cta see-more">Voir plus</button>
                    </div>
                </footer>
            </div>

        </article>
        <?php endforeach; ?>
    </div>
    <?php else: ?>
    <p>Cette catégorie ne contient aucun article pour le moment.</p>
    <?php endif; ?>
</section>