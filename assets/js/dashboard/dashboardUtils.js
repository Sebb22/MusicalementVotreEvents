// ---------------------------
// Messages de formulaire
// ---------------------------
export function showFormMessage(message, type = 'success') {
  const msgDiv = document.getElementById('form-message');
  if (!msgDiv) return;

  msgDiv.className = 'form-message'; // reset classes
  void msgDiv.offsetWidth; // relancer transition
  msgDiv.textContent = message;
  msgDiv.classList.add(type, 'show');

  setTimeout(() => msgDiv.classList.remove('show'), 4000);
}

// ---------------------------
// Modale de confirmation
// ---------------------------
export function initConfirmModal() {
  const modal = document.getElementById('confirm-modal');
  const msg = document.getElementById('confirm-message');
  const yesBtn = document.getElementById('confirm-yes');
  const noBtn = document.getElementById('confirm-no');

  return function showConfirm(message) {
    return new Promise(resolve => {
      msg.textContent = message;
      modal.classList.add('active');

      const close = confirmed => {
        modal.classList.remove('active');
        setTimeout(() => resolve(confirmed), 300);
      };

      yesBtn.onclick = () => close(true);
      noBtn.onclick = () => close(false);
      modal.onclick = e => { if (e.target === modal) close(false); };
    });
  };
}
