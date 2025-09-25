export function initImagePreview({
    
    imageInput,
    previewMainImage,
    resizeInput,
    container,
    removeBtn,
    form,
    hiddenInput,
    frameSrc // chemin vers ton cadre PNG
}) {
    if (!imageInput || !previewMainImage || !resizeInput || !container || !removeBtn) return;

    let translateX = 0, translateY = 0, scale = 0.9;
    let isDragging = false, startX, startY;

    function applyTransform() {
        previewMainImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }

    function clampTranslation() {
        const rect = container.getBoundingClientRect();
        const imgW = rect.width * scale;
        const imgH = rect.height * scale;
        const maxX = Math.max((imgW - rect.width) / (2 * scale), 0);
        const maxY = Math.max((imgH - rect.height) / (2 * scale), 0);
        translateX = Math.min(Math.max(translateX, -maxX), maxX);
        translateY = Math.min(Math.max(translateY, -maxY), maxY);
    }

    function resetImage() {
        previewMainImage.src = "https://via.placeholder.com/400x250?text=Aperçu";
        imageInput.value = "";
        translateX = 0;
        translateY = 0;
        scale = 0.9;
        resizeInput.value = scale * 100;
        applyTransform();
        removeBtn.style.display = "none";
        hiddenInput.value = ""; // vider le champ caché
    }

    function generateTransformedImage() {
        const canvas = document.createElement('canvas');
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        const ctx = canvas.getContext('2d');

        // calcul des dimensions de l'image transformée
        const imgW = container.clientWidth * scale;
        const imgH = container.clientHeight * scale;
        const dx = translateX + (canvas.width - imgW) / 2;
        const dy = translateY + (canvas.height - imgH) / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(previewMainImage, dx, dy, imgW, imgH);

        if (frameSrc) {
            const frame = new Image();
            frame.src = frameSrc;
            frame.onload = () => {
                ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
                hiddenInput.value = canvas.toDataURL('image/png');
            }
        } else {
            hiddenInput.value = canvas.toDataURL('image/png');
        }
    }

    // --- Events ---
    imageInput.addEventListener('change', () => {
        if (imageInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = e => {
                previewMainImage.src = e.target.result;
                removeBtn.style.display = "block";
                applyTransform();
            };
            reader.readAsDataURL(imageInput.files[0]);
        }
    });

    resizeInput.value = 90;
    resizeInput.addEventListener('input', () => {
        scale = resizeInput.value / 100;
        clampTranslation();
        applyTransform();
    });

    container.addEventListener('mousedown', e => {
        if (scale <= 1) return;
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

    // Avant submit, générer l'image finale
    form.addEventListener('submit', e => {
        generateTransformedImage();
    });
}
