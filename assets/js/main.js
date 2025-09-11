import '../scss/style.scss';

import { animateHero } from './animations/headline.js';
import { initRevealAnimations } from './animations/reveal.js';
import { initClientsReveal } from './animations/clients.js';
import { initSmoothScroll } from './animations/smoothScroll.js';
import { initBurgerMenu } from './components/burgerMenu.js';
import { initHeaderScroll } from './components/headerScroll.js';
import { initCards } from './components/cards.js';
//import { initDashboardForm } from './components/dashboard.js'; // <-- ajout

import { initDashboardForm } from './components/dashboard.js';
import FormPreview from './components/formPreview.js';

new FormPreview('#images', '#preview');

import { initFormVerification } from './components/formVerification.js';
import { animationCardFlip } from './animations/flipAnimation.js';
// DOM ready
document.addEventListener("DOMContentLoaded", () => {
    animateHero();
    initRevealAnimations();
    initClientsReveal();
    initBurgerMenu();
    initHeaderScroll();
    initCards();

    // Initialisation dashboard si présent
    initDashboardForm();
    initFormVerification();
    initSmoothScroll();

    animationCardFlip();
});