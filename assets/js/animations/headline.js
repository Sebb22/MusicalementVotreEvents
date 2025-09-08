// Cette fonction découpe le texte du titre principal (.hero__headline)
// et anime chaque lettre individuellement avec un effet de translation et opacité
export function splitAndAnimateHeadline() {
    // Sélectionne l'élément du titre principal
    const h = document.querySelector('.hero__headline');
    if (!h) return; // si l'élément n'existe pas, on quitte la fonction

    // Récupère le texte et enlève les espaces inutiles
    const text = h.textContent.trim();
    h.textContent = ''; // vide le texte original pour le reconstruire avec des spans

    // Crée un fragment de document pour éviter de reflow à chaque ajout
    const frag = document.createDocumentFragment();

    // Découpe le texte caractère par caractère
    text.split('').forEach((ch) => {
        const span = document.createElement('span'); // crée un span pour chaque caractère
        span.textContent = ch === ' ' ? '\u00A0' : ch; // espace insécable si c'est un espace
        span.style.display = 'inline-block'; // permet de transformer le span individuellement
        span.style.transform = 'translateY(24px) scale(0.95)'; // position initiale décalée
        span.style.opacity = '0'; // invisible au départ
        frag.appendChild(span); // ajoute le span au fragment
    });

    h.appendChild(frag); // ajoute tous les spans à l'élément
    h.style.opacity = '1'; // rend le container visible
    h.style.transform = 'none'; // annule toute transformation sur le container

    // Déclenche l'animation à la frame suivante pour activer les transitions CSS
    requestAnimationFrame(() => {
        const spans = h.querySelectorAll('span'); // sélectionne tous les spans
        spans.forEach((s, i) => {
            // définit la transition pour chaque span avec un léger décalage
            s.style.transition = `
                transform 0.8s cubic-bezier(.68,-0.55,.27,1.55) ${i*40}ms,
                opacity 0.8s ease ${i*40}ms
            `;
            s.style.transform = 'translateY(0) scale(1)'; // animation vers la position finale
            s.style.opacity = '1'; // rend visible progressivement

            // Ajoute un effet de text-shadow pour créer un glow temporaire
            setTimeout(() => {
                s.style.textShadow = `
                    0 0 16px rgba(255,255,255,1),
                    0 0 32px rgba(255,255,255,0.8),
                    0 0 48px rgba(255,255,255,0.6)
                `;
                // puis réduit le glow progressivement
                setTimeout(() => {
                    s.style.transition = 'text-shadow 0.8s ease';
                    s.style.textShadow = '0 0 2px rgba(255,255,255,0.4)';
                }, 400);
            }, i * 100); // délai progressif pour chaque lettre
        });

        // Si un sous-titre est présent (.hero__subline), on lui ajoute la classe 'on'
        // après que toutes les lettres du titre soient animées
        const h2 = document.querySelector('.hero__subline');
        if (h2) {
            setTimeout(() => h2.classList.add('on'), spans.length * 100 + 800);
        }
    });
}

// Cette fonction initie l'animation du héros (headline + subheadline)
export function animateHero() {
    splitAndAnimateHeadline(); // anime le headline
    const h2 = document.querySelector('.hero__subheadline');
    if (h2) {
        // ajoute la classe 'on' après 1,2s pour déclencher son animation
        setTimeout(() => h2.classList.add('on'), 1200);
    }
}