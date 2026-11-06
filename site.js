const filters = document.querySelectorAll('[data-filter]');
const cards = document.querySelectorAll('[data-category]');

for (const filter of filters) {
  filter.addEventListener('click', () => {
    for (const button of filters) {
      button.setAttribute('aria-pressed', String(button === filter));
    }
    for (const card of cards) {
      card.hidden = filter.dataset.filter !== 'Semua' &&
        card.dataset.category !== filter.dataset.filter;
    }
  });
}

for (const button of document.querySelectorAll('[data-dialog]')) {
  const dialog = document.getElementById(button.dataset.dialog);
  button.addEventListener('click', () => dialog.showModal());
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) {
      dialog.close();
    }
  });
}
