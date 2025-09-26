export function initImagePreview({
  imageInput,
  previewMainImage,
  resizeInput,
  container,
  removeBtn,
  form,
  hiddenInput,
  frameSrc,
}) {
  if (
    !imageInput ||
    !previewMainImage ||
    !resizeInput ||
    !container ||
    !removeBtn
  )
    return;

  let translateX = 0,
    translateY = 0,
    scale = 1;
  let isDragging = false,
    startX,
    startY;

  function applyTransform() {
    previewMainImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }

  function clampTranslation() {
    const rect = container.getBoundingClientRect();
    const imgW = previewMainImage.naturalWidth * scale;
    const imgH = previewMainImage.naturalHeight * scale;
    const maxX = Math.max((imgW - rect.width) / 2, 0);
    const maxY = Math.max((imgH - rect.height) / 2, 0);
    translateX = Math.min(Math.max(translateX, -maxX), maxX);
    translateY = Math.min(Math.max(translateY, -maxY), maxY);
  }

  function resetImage() {
    previewMainImage.src = 'https://via.placeholder.com/400x250?text=Aperçu';
    imageInput.value = '';
    translateX = 0;
    translateY = 0;
    scale = 1;
    resizeInput.value = scale * 100;
    applyTransform();
    removeBtn.style.display = 'none';
    hiddenInput.value = '';
  }

  async function generateTransformedImage() {
    console.log('[Debug] Génération de l’image transformée...');

    const canvas = document.createElement('canvas');
    const containerRect = container.getBoundingClientRect();
    canvas.width = containerRect.width;
    canvas.height = containerRect.height;
    const ctx = canvas.getContext('2d');

    const img = previewMainImage;
    const imgRect = img.getBoundingClientRect();

    // Conversion pixels affichés -> pixels natifs
    const scaleX = img.naturalWidth / imgRect.width;
    const scaleY = img.naturalHeight / imgRect.height;

    // Portion visible dans le container
    const visibleX = (containerRect.left - imgRect.left) * scaleX;
    const visibleY = (containerRect.top - imgRect.top) * scaleY;
    const visibleW = containerRect.width * scaleX;
    const visibleH = containerRect.height * scaleY;

    console.log(
      '[Debug] Container :',
      containerRect.width,
      containerRect.height
    );
    console.log(
      '[Debug] Image naturelle :',
      img.naturalWidth,
      img.naturalHeight
    );
    console.log(
      '[Debug] Transform :',
      'translateX=',
      translateX,
      'translateY=',
      translateY,
      'scale=',
      scale
    );
    console.log(
      '[Debug] Portion source :',
      visibleX,
      visibleY,
      visibleW,
      visibleH
    );

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      img,
      visibleX,
      visibleY,
      visibleW,
      visibleH,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Ajouter le frame si fourni
    if (frameSrc) {
      await new Promise(resolve => {
        const frame = new Image();
        frame.src = frameSrc;
        frame.onload = () => {
          ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
          resolve();
        };
        frame.onerror = () => {
          console.warn('[Warning] Frame introuvable, on continue sans cadre.');
          resolve();
        };
      });
    }

    hiddenInput.value = canvas.toDataURL('image/png');
    console.log(
      '[Debug] Image transformée dans hiddenInput :',
      hiddenInput.value?.substring(0, 100) + '...'
    );
  }

  // --- Events ---
  imageInput.addEventListener('change', () => {
    if (!imageInput.files.length) return;
    const reader = new FileReader();
    reader.onload = e => {
      previewMainImage.src = e.target.result;
      removeBtn.style.display = 'block';
      applyTransform();
    };
    reader.readAsDataURL(imageInput.files[0]);
  });

  resizeInput.min = 30;
  resizeInput.max = 300;
  resizeInput.value = scale * 100;
  resizeInput.addEventListener('input', () => {
    scale = resizeInput.value / 100;
    clampTranslation();
    applyTransform();
  });

  container.addEventListener('mousedown', e => {
    if (scale <= 0.3) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    container.classList.add('dragging');
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    translateX += e.clientX - startX;
    translateY += e.clientY - startY;
    startX = e.clientX;
    startY = e.clientY;
    clampTranslation();
    applyTransform();
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      container.classList.remove('dragging');
    }
  });

  removeBtn.addEventListener('click', resetImage);
  previewMainImage.addEventListener('dblclick', resetImage);

  form.addEventListener('submit', async e => {
    await generateTransformedImage(); // Génère avant l'envoi
  });

  return {
    resetImage,
    generateTransformedImage,
    setImage(src) {
      return new Promise(resolve => {
        if (!src) {
          resetImage();
          resolve();
          return;
        }
        const img = new Image();
        img.onload = () => {
          previewMainImage.src = src;
          removeBtn.style.display = 'block';
          translateX = 0;
          translateY = 0;
          scale = 1;
          resizeInput.value = scale * 100;
          applyTransform();
          resolve();
        };
        img.onerror = () => {
          console.warn('[ImagePreview] Erreur chargement image', src);
          resolve();
        };
        img.src = src;
      });
    },
  };
}
