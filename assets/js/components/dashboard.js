export function initDashboardForm() {
    const form = document.getElementById('formAddCategory');

    if (form) {
        form.addEventListener('submit', (e) => {
            let errors = [];

            const categorie = form.categorie.value.trim();
            const designation = form.designation.value.trim();
            const nb_personnes = form.nb_personnes.value;
            const age_requis = form.age_requis.value;
            const dimensions = form.dimensions.value.trim();
            const prix = form.prix.value;
            const location_id = form.location_id.value;

            // Vérifications
            if (categorie === '') errors.push("La catégorie est obligatoire.");
            if (designation === '') errors.push("La désignation est obligatoire.");
            if (prix === '' || isNaN(prix) || prix <= 0) errors.push("Le prix doit être un nombre supérieur à 0.");
            if (location_id === '' || isNaN(location_id) || location_id <= 0) errors.push("Location ID doit être un nombre valide.");

            if (nb_personnes !== '' && (isNaN(nb_personnes) || nb_personnes <= 0)) {
                errors.push("Nombre de personnes doit être un nombre positif.");
            }

            if (age_requis !== '' && (isNaN(age_requis) || age_requis < 0)) {
                errors.push("Âge requis doit être un nombre positif.");
            }

            if (errors.length > 0) {
                e.preventDefault();
                alert(errors.join("\n"));
            }
        });
    }
}

export function initDashboardDelete() {
    const deleteLinks = document.querySelectorAll('a[href*="/dashboard/delete/"]');

    deleteLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const confirmed = confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?');
            if (!confirmed) e.preventDefault();
        });
    });
}

// Fonction d'initialisation globale
export function initDashboard() {
    initDashboardForm();
    initDashboardDelete();
}