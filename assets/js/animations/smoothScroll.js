export function initSmoothScroll() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        const targetId = link.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);

        if (target) {
            e.preventDefault();
            const header = document.querySelector('.header');
            const headerHeight = header ? header.offsetHeight : 0;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        } else {
            // Section inexistante → redirection vers home avec hash
            window.location.href = '/#' + targetId;
        }
    });
}