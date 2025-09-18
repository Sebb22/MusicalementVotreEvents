// filterTable.js
function initTableFilter(tableSelector, filterWrapperSelector) {
  const table = document.querySelector(tableSelector);
  const wrapper = document.querySelector(filterWrapperSelector);
  if (!table || !wrapper) return;

  const rows = table.querySelectorAll('tbody tr');
  const inputs = wrapper.querySelectorAll('[data-filter]');

  function applyFilters() {
    const values = {};
    inputs.forEach(input => {
      values[input.dataset.filter] = input.value.toLowerCase();
    });

    rows.forEach(row => {
      let visible = true;

      row.querySelectorAll('td').forEach(td => {
        td.innerHTML = td.textContent; // reset highlight
      });

      Object.keys(values).forEach(key => {
        if (key === 'search') {
          const nameTd = row.querySelector('td[data-label="Nom"]');
          if (nameTd) {
            const text = nameTd.textContent.toLowerCase();
            if (!text.includes(values[key])) visible = false;
            else highlightText(nameTd, values[key]);
          }
        } else {
          const cell = row.querySelector(`td[data-label="${capitalize(key)}"]`);
          if (cell && values[key] && !cell.textContent.toLowerCase().includes(values[key])) {
            visible = false;
          } else if (cell && values[key]) {
            highlightText(cell, values[key]);
          }
        }
      });

      row.style.display = visible ? '' : 'none';
      if (visible) {
        row.style.opacity = 0;
        requestAnimationFrame(() => row.style.opacity = 1);
      }
    });
  }

  inputs.forEach(input => {
    input.addEventListener('input', applyFilters);
    input.addEventListener('change', applyFilters);
  });

  // Helper pour mettre en évidence le texte
  function highlightText(td, text) {
    if (!text) return;
    const regex = new RegExp(`(${escapeRegExp(text)})`, 'gi');
    td.innerHTML = td.textContent.replace(regex, '<span class="highlight">$1</span>');
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

export { initTableFilter };
