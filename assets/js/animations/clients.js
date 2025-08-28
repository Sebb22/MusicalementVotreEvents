export function initClientsReveal() {
    const clientLogos = document.querySelectorAll(".clients__grid img");

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const randomDelay = (Math.random() * 0.6).toFixed(2);
                entry.target.style.transitionDelay = `${randomDelay}s`;
                entry.target.classList.add("visible");
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    clientLogos.forEach((logo) => observer.observe(logo));
}
