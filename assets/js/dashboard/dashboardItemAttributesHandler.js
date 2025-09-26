const locationAttributes = {
  1: [
    {
      name: 'nb_personnes',
      label: 'Nombre de personnes',
      type: 'number',
      placeholder: 'Ex: 8',
      icon: 'fas fa-users',
    },
    {
      name: 'age_requis',
      label: 'Âge requis',
      type: 'text',
      placeholder: 'Ex: 2 à 4 ans',
      icon: 'fas fa-child',
    },
    {
      name: 'dimensions',
      label: 'Dimensions',
      type: 'text',
      placeholder: 'Ex: 4x4 m',
      icon: 'fas fa-ruler-combined',
    },
  ],
  2: [
    {
      name: 'duree',
      label: 'Durée',
      type: 'text',
      placeholder: 'Ex: 30 min',
      icon: 'fas fa-clock',
    },
    {
      name: 'nb_joueurs',
      label: 'Nombre de joueurs',
      type: 'number',
      placeholder: 'Ex: 4',
      icon: 'fas fa-users',
    },
  ],
  3: [
    {
      name: 'poids',
      label: 'Poids',
      type: 'text',
      placeholder: 'Ex: 2 kg',
      icon: 'fas fa-weight',
    },
    {
      name: 'taille',
      label: 'Taille',
      type: 'text',
      placeholder: 'Ex: 1,5 m',
      icon: 'fas fa-ruler',
    },
  ],
};

// --- Fonction utilitaire pour le formatage de l'attribut ---
function formatAttribute(name, value) {
  if (!value) return '-';
  switch (name) {
    case 'nb_personnes':
      return `Jusqu’à ${value} pers.`;
    case 'age_requis':
      return `Âge : ${value}`;
    case 'dimensions':
      return `Dimensions : ${value}`;
    case 'duree':
      return `Durée : ${value}`;
    case 'nb_joueurs':
      return `Joueurs : ${value}`;
    case 'poids':
      return `Poids : ${value}`;
    case 'taille':
      return `Taille : ${value}`;
    default:
      return value;
  }
}

// --- Fonction principale pour rendre les attributs ---
export async function renderAttributes(
  locId,
  attributesContainer,
  previewAttributes,
  existingValues = {}
) {
  console.log(
    '[renderAttributes] locId :',
    locId,
    'existingValues :',
    existingValues
  );

  await new Promise(r => requestAnimationFrame(r)); // permet au DOM de se mettre à jour

  attributesContainer.innerHTML = '';
  previewAttributes.innerHTML = '';

  const attrs = locationAttributes[locId];
  if (!attrs) {
    const msg = document.createElement('p');
    msg.textContent = 'Pas d’attributs disponibles pour cette catégorie';
    msg.style.fontStyle = 'italic';
    attributesContainer.appendChild(msg);
    return;
  }

  // Parcours des attributs
  for (const attr of attrs) {
    const existingVal = existingValues[attr.name] || '';

    // --- Formulaire ---
    const div = document.createElement('div');
    div.className = 'dashboard-form__group';
    div.innerHTML = `
        <label class="dashboard-form__label" for="${attr.name}">${attr.label}</label>
        <input class="dashboard-form__input" type="${attr.type}" 
               id="${attr.name}" 
               name="attributes[${attr.name}]" 
               placeholder="${attr.placeholder}"
               value="${existingVal}">
      `;
    attributesContainer.appendChild(div);

    // --- Preview ---
    const attrDiv = document.createElement('div');
    attrDiv.className = 'attribute';
    const formattedVal = formatAttribute(attr.name, existingVal);
    attrDiv.innerHTML = `<i class="${attr.icon}"></i><span id="preview-${attr.name}">${formattedVal}</span>`;
    previewAttributes.appendChild(attrDiv);

    // --- Synchronisation input ↔ preview ---
    const input = div.querySelector('input');
    const span = attrDiv.querySelector('span');
    input.addEventListener('input', () => {
      span.textContent = formatAttribute(attr.name, input.value);
    });
  }

  // On attend que tout soit injecté avant de continuer (utile pour await dans editItem)
  await new Promise(resolve => setTimeout(resolve, 0));
}
