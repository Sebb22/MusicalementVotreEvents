// Module pour gérer les attributs dynamiques des articles selon la catégorie
const locationAttributes = {
    1: [
        { name: 'nb_personnes', label: 'Nombre de personnes', type: 'number', placeholder: 'Ex: 8', icon: 'fas fa-users' },
        { name: 'age_requis', label: 'Âge requis', type: 'text', placeholder: 'Ex: 2 à 4 ans', icon: 'fas fa-child' },
        { name: 'dimensions', label: 'Dimensions', type: 'text', placeholder: 'Ex: 4x4 m', icon: 'fas fa-ruler-combined' }
    ],
    2: [
        { name: 'duree', label: 'Durée', type: 'text', placeholder: 'Ex: 30 min', icon: 'fas fa-clock' },
        { name: 'nb_joueurs', label: 'Nombre de joueurs', type: 'number', placeholder: 'Ex: 4', icon: 'fas fa-users' }
    ],
    3: [
        { name: 'poids', label: 'Poids', type: 'text', placeholder: 'Ex: 2 kg', icon: 'fas fa-weight' },
        { name: 'taille', label: 'Taille', type: 'text', placeholder: 'Ex: 1,5 m', icon: 'fas fa-ruler' }
    ]
};

export function renderAttributes(locId, attributesContainer, previewAttributes) {
    // --- Nettoyage avant affichage ---
    attributesContainer.innerHTML = '';
    previewAttributes.innerHTML = '';

    // --- Vérifier si locId existe dans notre configuration ---
    const attrs = locationAttributes[locId];
    if (!attrs) {
        // Aucun attribut défini pour cette catégorie → afficher un message
        const msg = document.createElement('p');
        msg.textContent = "Pas d’attributs disponibles pour cette catégorie";
        msg.style.fontStyle = 'italic';
        attributesContainer.appendChild(msg);
        return;
    }

    // --- Boucle sur les attributs pour générer formulaire et preview ---
    attrs.forEach(attr => {
        // --- Formulaire ---
        const div = document.createElement('div');
        div.className = 'dashboard-form__group';
        div.innerHTML = `
      <label class="dashboard-form__label" for="${attr.name}">${attr.label}</label>
      <input class="dashboard-form__input" type="${attr.type}" id="${attr.name}" name="${attr.name}" placeholder="${attr.placeholder}">
    `;
        attributesContainer.appendChild(div);

        // --- Preview ---
        const attrDiv = document.createElement('div');
        attrDiv.className = 'attribute';
        attrDiv.innerHTML = `<i class="${attr.icon}"></i><span id="preview-${attr.name}">-</span>`;
        previewAttributes.appendChild(attrDiv);

        // --- Synchronisation input ↔ preview ---
        const input = div.querySelector('input');
        const span = attrDiv.querySelector('span');
        input.addEventListener('input', () => {
            let val = input.value || '-';
            // Gestion de l’affichage spécifique pour chaque type d’attribut
            switch (attr.name) {
                case 'nb_personnes':
                    val = input.value ? `Jusqu’à ${input.value} pers.` : '-';
                    break;
                case 'age_requis':
                    val = input.value ? `Âge : ${input.value}` : '-';
                    break;
                case 'dimensions':
                    val = input.value ? `Dimensions : ${input.value}` : '-';
                    break;
                case 'duree':
                    val = input.value ? `Durée : ${input.value}` : '-';
                    break;
                case 'nb_joueurs':
                    val = input.value ? `Joueurs : ${input.value}` : '-';
                    break;
                case 'poids':
                    val = input.value ? `Poids : ${input.value}` : '-';
                    break;
                case 'taille':
                    val = input.value ? `Taille : ${input.value}` : '-';
                    break;
            }
            span.textContent = val;
        });
    });
}