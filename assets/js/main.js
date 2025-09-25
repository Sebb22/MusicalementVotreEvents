// ---------------------------
// Imports
// ---------------------------
import '../scss/style.scss';

// Animations
import { splitAndAnimateHeadline } from './animations/headline.js';
import { initRevealAnimations } from './animations/reveal.js';
import { initClientsReveal } from './animations/clients.js';
import { initSmoothScroll } from './animations/smoothScroll.js';
import { animationCardFlip } from './animations/flipAnimation.js';
import { animationPrestationsFlip } from './animations/prestationsCardFlipAnimation.js';
import { initLetterBites, initLetterBounce } from './animations/letterAnimations.js';
// Composants
import { initBurgerMenu } from './components/burgerMenu.js';
import { initHeaderScroll } from './components/headerScroll.js';
import { initCards } from './components/cards.js';
import { initLocationModule } from './components/localisationModule.js';
import { initFormVerification } from './components/formVerification.js';
import { initTableFilter } from './components/filterHandler.js';
import FormPreview from './components/formPreview.js';

// Dashboard
import { initDashboard } from '../js/dashboard/dashboardHandler.js';

// ---------------------------
// DOM Ready
// ---------------------------
document.addEventListener('DOMContentLoaded', () => {
  // ---------------------------
  // Instanciation des animations et composants
  // ---------------------------
  splitAndAnimateHeadline();
  initRevealAnimations();
  initClientsReveal();
  initBurgerMenu();
  initHeaderScroll();
  initCards();
  initLocationModule();
  initFormVerification();
  initSmoothScroll();
  animationPrestationsFlip();
  animationCardFlip();
  initTableFilter('.filterable-table', '.table-filters');
  initLetterBounce();
  initLetterBites();

  // ---------------------------
  // FormPreview (prévisualisation d’images)
  // ---------------------------
  new FormPreview('#images', '#preview');

  // ---------------------------
  // Dashboard : initialisation unique
  // ---------------------------
  initDashboard({
    formId: 'article-form',
    tableId: 'items-table',
    previewSelectors: {
      name: 'preview-name',
      price: 'preview-price',
      stock: 'preview-stock',
      availability: 'preview-availability',
      image: 'preview-main-image',
    },
    attributesContainer: document.getElementById('attributes'),
  });
});
