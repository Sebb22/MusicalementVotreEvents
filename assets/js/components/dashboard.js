// DashboardForm.js
export function initDashboardForm() {
    const form = document.querySelector('.dashboard-form');
    if (!form) return;

    // Crée ou récupère le conteneur d'erreur pour un input
    const createErrorContainer = (input) => {
        let container = input.parentElement.querySelector('.dashboard-form__error');
        if (!container) {
            container = document.createElement('div');
            container.className = 'dashboard-form__error';
            input.parentElement.appendChild(container);
        }
        return container;
    };

    // Règles de validation basées sur les placeholders et attentes
    const rules = {
        "nb_personnes": /^[1-9][0-9]?$/,
        "age_requis": /^[0-9]{1,2}\s*à\s*[0-9]{1,2}\s*ans$/,
        "dimensions": /^[0-9]{1,2}\s*x\s*[0-9]{1,2}\s*m$/,
        "prix": /^[0-9]+(\.[0-9]{1,2})?$/
    };

    // Fonction de validation d'un input
    const validateInput = (input, rule) => {
        const errorContainer = createErrorContainer(input);
        if (!input.value || !rule.test(input.value)) {
            input.classList.add('error');
            errorContainer.textContent = `Exemple attendu : ${input.placeholder}`;
            return false;
        } else {
            input.classList.remove('error');
            errorContainer.textContent = '';
            return true;
        }
    };

    // Validation live sur chaque champ
    Object.keys(rules).forEach((field) => {
        const input = document.getElementById(field);
        if (!input) return;
        input.addEventListener('input', () => validateInput(input, rules[field]));
        input.addEventListener('blur', () => validateInput(input, rules[field]));
    });

    // Validation finale à la soumission
    form.addEventListener('submit', (e) => {
        let valid = true;
        Object.keys(rules).forEach((field) => {
            const input = document.getElementById(field);
            if (input) {
                const fieldValid = validateInput(input, rules[field]);
                if (!fieldValid) valid = false;
            }
        });
        if (!valid) e.preventDefault();
    });

    // === Gestion de la preview des images ===
    const fileInput = document.getElementById("images");
    if (fileInput) {
        const preview = document.getElementById("preview");
        fileInput.addEventListener("change", (event) => {
            if (!preview) return;
            preview.innerHTML = ""; // reset

            Array.from(event.target.files).forEach(file => {
                if (!file.type.startsWith("image/")) return;

                const reader = new FileReader();
                reader.onload = function(e) {
                    const container = document.createElement("div");
                    container.className = "dashboard-form__thumb-container";

                    const img = document.createElement("img");
                    img.src = e.target.result;
                    img.classList.add("dashboard-form__thumb");

                    const removeBtn = document.createElement("button");
                    removeBtn.type = "button";
                    removeBtn.className = "dashboard-form__remove";
                    removeBtn.innerHTML = "×";
                    removeBtn.addEventListener("click", () => container.remove());

                    container.appendChild(img);
                    container.appendChild(removeBtn);
                    preview.appendChild(container);
                };
                reader.readAsDataURL(file);
            });
        });
    }
}

export function initDashboardDelete() {
    const deleteLinks = document.querySelectorAll('a[href*="/dashboard/delete/"]');
    deleteLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
                e.preventDefault();
            }
        });
    });
}

// Fonction d'initialisation globale
export function initDashboard() {
    initDashboardForm();
    initDashboardDelete();
}