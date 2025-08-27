// Animation Headline (H1)
function splitAndAnimateHeadline() {
    const h = document.querySelector('.hero__headline');
    if (!h) return;
    const text = h.textContent.trim();
    h.textContent = '';

    const frag = document.createDocumentFragment();
    text.split('').forEach((ch) => {
        const span = document.createElement('span');
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        span.style.display = 'inline-block';
        span.style.transform = 'translateY(24px) scale(0.95)';
        span.style.opacity = '0';
        frag.appendChild(span);
    });

    h.appendChild(frag);
    h.style.opacity = '1';
    h.style.transform = 'none';

    requestAnimationFrame(() => {
        const spans = h.querySelectorAll('span');
        spans.forEach((s, i) => {
            s.style.transition = `
                transform 0.8s cubic-bezier(.68,-0.55,.27,1.55) ${i*40}ms,
                opacity 0.8s ease ${i*40}ms
            `;
            s.style.transform = 'translateY(0) scale(1)';
            s.style.opacity = '1';

            // Glow temporaire
            setTimeout(() => {
                s.style.textShadow = `
                    0 0 16px rgba(255,255,255,1),
                    0 0 32px rgba(255,255,255,0.8),
                    0 0 48px rgba(255,255,255,0.6)
                `;
                setTimeout(() => {
                    s.style.transition = 'text-shadow 0.8s ease';
                    s.style.textShadow = '0 0 2px rgba(255,255,255,0.4)';
                }, 400);
            }, i * 100);
        });

        // Après animation H1, afficher H2
        const h2 = document.querySelector('.hero__subline');
        if (h2) {
            setTimeout(() => h2.classList.add('on'), spans.length * 100 + 800);
        }
    });
}

// IntersectionObserver pour les reveals
const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('on');
            io.unobserve(e.target);
        }
    });
}, { rootMargin: '0px 0px -10% 0px', threshold: .2 });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Lancement animation H1
splitAndAnimateHeadline();

// Animation H1 + H2
function animateHero() {
    const h1 = document.querySelector('.hero__headline');
    const h2 = document.querySelector('.hero__subheadline');

    // Animation H1 (lettres)
    splitAndAnimateHeadline();

    // Animation H2 après H1
    setTimeout(() => {
        h2.classList.add('on');
    }, 1200);
}

animateHero();


// Burger menu
const toggle = document.querySelector(".header__toggle");
const nav = document.querySelector(".header__nav");

if (toggle) {
    toggle.addEventListener("click", () => {
        nav.classList.toggle("open");
        toggle.classList.toggle("open");
        const expanded = toggle.getAttribute("aria-expanded") === "true" || false;
        toggle.setAttribute("aria-expanded", !expanded);
    });
}

// Header change background on scroll
const header = document.querySelector(".header");

window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});

// Sélection de toutes les cartes
const cards = document.querySelectorAll('.card');

cards.forEach(card => {
    card.addEventListener('click', () => {
        // Sur mobile, toggle la classe "open"
        if (window.innerWidth <= 768) {
            card.classList.toggle('open');
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const clientLogos = document.querySelectorAll(".clients__grid img");

    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // Délai aléatoire entre 0 et 0.6s
                    const randomDelay = (Math.random() * 0.6).toFixed(2);
                    entry.target.style.transitionDelay = `${randomDelay}s`;

                    entry.target.classList.add("visible");
                    obs.unobserve(entry.target); // pour éviter de rejouer
                }
            });
        }, { threshold: 0.2 }
    );

    clientLogos.forEach((logo) => observer.observe(logo));
});