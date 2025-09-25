export function initLetterBounce() {
  // Sélectionner uniquement le titre ciblé
  const title = document.querySelector('#structures-gonflables');
  if (!title) return;
console.log("je vois", title);
  // Nettoyer le texte et séparer les lettres
  const letters = title.textContent.trim().split('');
  title.textContent = '';
  letters.forEach(letter => {
    if (letter === '') return; // ignorer les caractères vides
    const span = document.createElement('span');
    span.textContent = letter === ' ' ? '\u00A0' : letter; // espace insécable
    title.appendChild(span);
  });

  // Hover
  title.parentElement.addEventListener('mouseenter', () => {
    const spans = title.querySelectorAll('span');
    spans.forEach((span, index) => {
      // Délais irréguliers pour l’effet
      let delay = 0;
      if (index < 5) delay = Math.random() * 500;
      else if (index > spans.length - 7) delay = Math.random() * 500 + 500;
      else delay = Math.random() * 500 + 250;

      setTimeout(() => {
        span.style.animation = 'bounceLetterLong 5s ease forwards';
      }, delay);
    });
  });
}

export function initLetterBites() {
  const title = document.querySelector('#machine-barbe-a-papa');
  if (!title) return;

  // Transformer le texte en spans
  const letters = title.textContent.trim().split('');
  title.textContent = '';
  letters.forEach(letter => {
    const span = document.createElement('span');
    span.textContent = letter === ' ' ? '\u00A0' : letter;
    span.style.display = 'inline-block';
    span.style.position = 'relative';
    span.style.color = 'white';
    span.style.transition =
      'clip-path 0.3s ease, transform 0.3s ease, color 0.3s ease';
    title.appendChild(span);
  });

  const spans = [...title.querySelectorAll('span')];
  let animationPlayed = false;

  title.addEventListener('mouseenter', () => {
    if (animationPlayed) return;
    animationPlayed = true;

    setTimeout(() => {
      let i = 0;
      while (i < spans.length) {
        // Déterminer si cette morsure croque 1 ou 2 lettres
        const biteTwo = Math.random() < 0.4 && i < spans.length - 1; // 40% de chance de croquer 2 lettres
        const group = biteTwo ? [spans[i], spans[i + 1]] : [spans[i]];

        // Nombre de bouchées aléatoire : 1 à 3
        const numBites = Math.floor(Math.random() * 3) + 1;

        for (let bite = 0; bite < numBites; bite++) {
          setTimeout(
            () => {
              group.forEach(span => {
                const biteHeight = Math.floor(Math.random() * 30) + 30; // 30–60%
                const biteCurve = Math.floor(Math.random() * 50) + 20; // largeur de la bouche
                const angle = (Math.random() - 0.5) * 10;

                span.style.clipPath = `polygon(
                0 ${biteHeight}%,
                ${biteCurve}% ${biteHeight - 10}%,
                50% ${biteHeight - 5}%,
                100% ${biteHeight - 10}%,
                100% 100%,
                0 100%
              )`;
                span.style.transform = `rotate(${angle}deg)`;

                // Dernière bouchée : lettre disparait
                if (bite === numBites - 1) {
                  setTimeout(() => {
                    span.style.color = 'transparent';
                    span.style.clipPath = 'none';
                  }, 300);
                }

                // Miettes
                const rect = span.getBoundingClientRect();
                const scrollX = window.scrollX;
                const scrollY = window.scrollY;
                const crumbs = Math.floor(Math.random() * 3) + 2;
                for (let j = 0; j < crumbs; j++) {
                  const crumb = document.createElement('div');
                  crumb.textContent = '•';
                  crumb.style.position = 'absolute';
                  crumb.style.left = `${rect.left + rect.width / 2 + scrollX}px`;
                  crumb.style.top = `${rect.top + (biteHeight / 100) * rect.height + scrollY}px`;
                  crumb.style.color = 'white';

                  // Taille aléatoire des miettes, certaines plus grosses
                  const size =
                    Math.random() < 0.3
                      ? Math.random() * 0.8 + 1 // 30% de chance de grosse miette (1–1.8rem)
                      : Math.random() * 0.5 + 0.6; // sinon petite (0.6–1.1rem)
                  crumb.style.fontSize = `${size}rem`;

                  crumb.style.opacity = 1;
                  crumb.style.transition = 'transform 1s ease, opacity 1s ease';
                  document.body.appendChild(crumb);

                  const x = (Math.random() - 0.5) * 30;
                  const y = Math.random() * 40 + 20;
                  setTimeout(() => {
                    crumb.style.transform = `translate(${x}px, ${y}px)`;
                    crumb.style.opacity = 0;
                  }, 50);
                  setTimeout(() => crumb.remove(), 1200);
                }
              });
            },
            bite * 400 + i * 200
          );
        }

        i += biteTwo ? 2 : 1; // avancer d'une ou deux lettres selon le groupe
      }

      // Réapparition du titre après l'animation
      const totalDuration = spans.length * 200 + 3 * 400;
      setTimeout(() => {
        spans.forEach(s => {
          s.style.color = 'white';
          s.style.clipPath = 'none';
          s.style.transform = 'rotate(0deg)';
        });
      }, totalDuration + 500);
    }, 1500); // délai initial avant l’animation
  });
}

