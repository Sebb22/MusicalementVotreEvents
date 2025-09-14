export function applyMasonry() {
    const grid = document.querySelector('.locations__grid');
    const rowHeight = parseInt(getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
    const rowGap = parseInt(getComputedStyle(grid).getPropertyValue('gap'));

    grid.querySelectorAll('.location-card').forEach(card => {
        const cardHeight = card.getBoundingClientRect().height;
        const rowSpan = Math.ceil((cardHeight + rowGap) / (rowHeight + rowGap));
        card.style.gridRowEnd = `span ${rowSpan}`;
    });
}

// Appel initial
window.addEventListener('load', applyMasonry);
// Réajustement au resize
window.addEventListener('resize', applyMasonry);