export function splitAndAnimateHeadline() {
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

        const h2 = document.querySelector('.hero__subline');
        if (h2) {
            setTimeout(() => h2.classList.add('on'), spans.length * 100 + 800);
        }
    });
}

export function animateHero() {
    splitAndAnimateHeadline();
    const h2 = document.querySelector('.hero__subheadline');
    if (h2) {
        setTimeout(() => h2.classList.add('on'), 1200);
    }
}
