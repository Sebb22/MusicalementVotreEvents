export function initBurgerMenu() {
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
}
