export function initLocationModule() {
    const mapBtn = document.querySelector('.contact__map-btn');
    if (!mapBtn) return; // stop si pas de bouton

    mapBtn.addEventListener('click', () => {
        const address = "631 Rue de Compiègne, 60162 Vignemont";
        const url = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(address);
        window.open(url, "_blank");
    });
}