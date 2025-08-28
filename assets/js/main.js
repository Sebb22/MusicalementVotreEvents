import '../scss/style.scss';

import { animateHero } from './animations/headline.js';
import { initRevealAnimations } from './animations/reveal.js';
import { initClientsReveal } from './animations/clients.js';

import { initBurgerMenu } from './components/burgerMenu.js';
import { initHeaderScroll } from './components/headerScroll.js';
import { initCards } from './components/cards.js';

// DOM ready
document.addEventListener("DOMContentLoaded", () => {
    animateHero();
    initRevealAnimations();
    initClientsReveal();
    initBurgerMenu();
    initHeaderScroll();
    initCards();
});

