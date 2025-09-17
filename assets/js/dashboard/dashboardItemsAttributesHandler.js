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
  attributesContainer.innerHTML = '';
  previewAttributes.innerHTML = '';
  if (!locId || !locationAttributes[locId]) return;

  locationAttributes[locId].forEach(attr => {
    // Formulaire
    const div = document.createElement('div');
    div.className = 'dashboard-form__group';
    div.innerHTML = `
      <label class="dashboard-form__label" for="${attr.name}">${attr.label}</label>
      <input class="dashboard-form__input" type="${attr.type}" id="${attr.name}" name="${attr.name}" placeholder="${attr.placeholder}">
    `;
    attributesContainer.appendChild(div);

    // Preview
    const attrDiv = document.createElement('div');
    attrDiv.className = 'attribute';
    attrDiv.innerHTML = `<i class="${attr.icon}"></i><span id="preview-${attr.name}">-</span>`;
    previewAttributes.appendChild(attrDiv);

    const input = div.querySelector('input');
    const span = attrDiv.querySelector('span');
    input.addEventListener('input', () => {
      span.textContent = input.value || '-';
      if (attr.name === 'nb_personnes') span.textContent = input.value ? `Jusqu’à ${input.value} pers.` : '-';
      else if (attr.name === 'age_requis') span.textContent = input.value ? `Âge : ${input.value}` : '-';
      else if (attr.name === 'dimensions') span.textContent = input.value ? `Dimensions : ${input.value}` : '-';
      else if (attr.name === 'duree') span.textContent = input.value ? `Durée : ${input.value}` : '-';
      else if (attr.name === 'nb_joueurs') span.textContent = input.value ? `Joueurs : ${input.value}` : '-';
      else if (attr.name === 'poids') span.textContent = input.value ? `Poids : ${input.value}` : '-';
      else if (attr.name === 'taille') span.textContent = input.value ? `Taille : ${input.value}` : '-';
    });
  });
}
