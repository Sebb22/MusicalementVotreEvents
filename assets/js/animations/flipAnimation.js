export function animationCardFlip() {
    // Sélectionne toutes les cartes du catalogue
    const cards = document.querySelectorAll('.location-item-card');

    // Parcourt chaque carte
    cards.forEach(card => {
        const seeMoreBtn = card.querySelector('.see-more'); // bouton "voir plus"
        const backBtn = card.querySelector('.back-btn'); // bouton "retour"
        const inner = card.querySelector('.location-item-card__inner'); // contenu interne

        if (!inner) return;

        // Génère une direction aléatoire de flip (X ou Y)
        const getRandomDirection = () => {
            const directions = ['__flipY', '__flipX'];
            return directions[Math.floor(Math.random() * directions.length)];
        };

        // Événement "Voir plus"
        if (seeMoreBtn) {
            seeMoreBtn.addEventListener('click', e => {
                e.preventDefault();
                const directionClass = getRandomDirection();

                card.classList.add('is-flipped', directionClass);
                card.dataset.flipDirection = directionClass;
            });
        }

        // Événement "Retour"
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                const direction = card.dataset.flipDirection;

                if (!direction) return;

                // Si flip vertical, on redresse le texte immédiatement
                if (direction === '__flipX') {
                    const backFace = card.querySelector('.location-item-card__back');
                    if (backFace) {
                        backFace.style.transform = 'rotateX(180deg)';
                    }
                }

                // Écoute la fin de la transition pour retirer les classes
                const removeFlip = () => {
                    card.classList.remove('is-flipped', '__flipX', '__flipY');
                    delete card.dataset.flipDirection;

                    // Supprime le style inline si nécessaire
                    if (direction === '__flipX' && backFace) {
                        backFace.style.transform = '';
                    }

                    inner.removeEventListener('transitionend', removeFlip);
                };

                inner.addEventListener('transitionend', removeFlip);

                // Déclenche la transition
                card.classList.remove(direction);
            });
        }
    });
}