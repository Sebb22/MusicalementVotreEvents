export function initBurgerMenu() {
    const toggle = document.querySelector(".header__toggle");
    const nav = document.querySelector(".header__nav");
    const closeBtn = document.querySelector(".header__close");
    const links = document.querySelectorAll(".header__link");

    function toggleMenu(forceClose = false) {
        nav.classList.toggle("open", !forceClose && !nav.classList.contains("open"));
        toggle.classList.toggle("open", !forceClose && !toggle.classList.contains("open"));
        toggle.setAttribute("aria-expanded", nav.classList.contains("open"));
    }

    if (toggle) {
        toggle.addEventListener("click", () => toggleMenu());
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", () => toggleMenu(true));
    }

    if (links.length > 0) {
        links.forEach(link => {
            link.addEventListener("click", () => toggleMenu(true));
        });
    }
}