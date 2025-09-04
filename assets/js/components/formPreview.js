// FormPreview.js
export default class FormPreview {
    constructor(inputSelector, previewSelector) {
        this.input = document.querySelector(inputSelector);
        this.preview = document.querySelector(previewSelector);

        if (!this.input || !this.preview) return;

        this.input.addEventListener('change', () => this.updatePreview());
    }

    updatePreview() {
        this.preview.innerHTML = ''; // vider la preview
        const files = Array.from(this.input.files);

        files.forEach(file => {
            if (!file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.classList.add('dashboard-form__thumb');

                const thumbContainer = document.createElement('div');
                thumbContainer.classList.add('dashboard-form__thumb-container');

                const removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.textContent = '×';
                removeBtn.classList.add('dashboard-form__remove');
                removeBtn.addEventListener('click', () => {
                    thumbContainer.remove();
                    this.removeFile(file);
                });

                thumbContainer.appendChild(img);
                thumbContainer.appendChild(removeBtn);
                this.preview.appendChild(thumbContainer);
            };
            reader.readAsDataURL(file);
        });
    }

    removeFile(fileToRemove) {
        // Pour que le fichier soit retiré du input.files, il faut recréer une DataTransfer
        const dt = new DataTransfer();
        Array.from(this.input.files)
            .filter(file => file !== fileToRemove)
            .forEach(file => dt.items.add(file));
        this.input.files = dt.files;
    }
}