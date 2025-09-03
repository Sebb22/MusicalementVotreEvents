export function initFormVerification() {
    const form = document.querySelector('.dashboard-form');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        let valid = true;
        const requiredFields = form.querySelectorAll('[required]');

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                valid = false;
                field.classList.add('dashboard-form__input--error');
            } else {
                field.classList.remove('dashboard-form__input--error');
            }
        });

        if (!valid) {
            e.preventDefault();
            alert('Veuillez remplir tous les champs obligatoires.');
        }
    });
}