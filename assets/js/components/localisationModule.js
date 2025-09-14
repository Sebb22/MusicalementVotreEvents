export function localisationViaGoogleMap() {
    document.querySelector('.contact__map-btn').addEventListener('click', () => {
        document.querySelector('.contact__map-btn').addEventListener('click', () => {
            const address = "631 Rue de Compiègne, 60162 Vignemont";
            const url = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(address);
            window.open(url, "_blank");
        });

    });

}