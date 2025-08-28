export function initRevealAnimations() {
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('on');
                io.unobserve(e.target);
            }
        });
    }, { rootMargin: '0px 0px -10% 0px', threshold: .2 });

    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}
