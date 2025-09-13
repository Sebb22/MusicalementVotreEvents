export function splitAndAnimateHeadline() {
    const h = document.querySelector('.hero__headline');
    if (!h) return;

    const text = h.textContent.trim();
    h.textContent = ''; // vide le texte original

    const frag = document.createDocumentFragment();

    // Découpe en mots
    text.split(' ').forEach((word, wi) => {
        const wordSpan = document.createElement('span');
        wordSpan.classList.add('word');
        wordSpan.style.display = 'inline-block'; // permet le wrapping par mot
        wordSpan.style.marginRight = '0.3em'; // espace entre mots

        // Découpe chaque mot en lettres
        word.split('').forEach((ch, li) => {
            const span = document.createElement('span');
            span.classList.add('letter');
            span.textContent = ch;
            span.style.display = 'inline-block';
            span.style.transform = 'translateY(24px) scale(0.95)';
            span.style.opacity = '0';
            wordSpan.appendChild(span);
        });

        frag.appendChild(wordSpan);
    });

    h.appendChild(frag);
    h.style.opacity = '1';
    h.style.transform = 'none';

    // Animation
    requestAnimationFrame(() => {
        const letters = h.querySelectorAll('.letter');
        letters.forEach((s, i) => {
            s.style.transition = `
                transform 0.8s cubic-bezier(.68,-0.55,.27,1.55) ${i * 40}ms,
                opacity 0.8s ease ${i * 40}ms
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

        // Affiche le sous-titre après l'animation du titre
        const h2 = document.querySelector('.hero__subheadline');
        if (h2) {
            setTimeout(() => h2.classList.add('on'), letters.length * 100 + 800);
        }
    });
}