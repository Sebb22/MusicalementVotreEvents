export function animationPrestationsFlip() {
    const cards = document.querySelectorAll('.prestations .card');

    if (!cards.length) return;

    const getRandomDirection = () => {
        const directions = ['X', 'Y'];
        return directions[Math.floor(Math.random() * directions.length)];
    };

    cards.forEach(card => {
        const inner = card.querySelector('.card__inner');
        const back = card.querySelector('.card__back');
        if (!inner || !back) return;

        let direction = null;

        card.addEventListener('mouseenter', () => {
            direction = getRandomDirection();

            // On applique la bonne orientation à la back face
            back.classList.remove('card__back--flipX', 'card__back--flipY');
            back.classList.add(`card__back--flip${direction}`);

            inner.style.transform = `rotate${direction}(180deg)`;
            back.style.opacity = "1";
        });

        card.addEventListener('mouseleave', () => {
            inner.style.transform = 'rotate(0deg)';
            back.style.opacity = "0";
        });
    });
}