export function initCards() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                card.classList.toggle('open');
            }
        });
    });
}
