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

const slides = Array.from(document.querySelectorAll('[data-slide]'));
const slidePosition = document.getElementById('slide-position');
let activeSlide = 0;

for (const button of document.querySelectorAll('[data-slide-step]')) {
  button.addEventListener('click', () => {
    slides[activeSlide].hidden = true;
    activeSlide = (activeSlide + Number(button.dataset.slideStep) + slides.length) % slides.length;
    slides[activeSlide].hidden = false;
    slidePosition.textContent = `${activeSlide + 1} / ${slides.length}`;
  });
}

const player = document.getElementById('video-player');
const frame = document.getElementById('video-frame');
const playerTitle = document.getElementById('video-player-title');
const videoSource = document.getElementById('video-source');

for (const button of document.querySelectorAll('[data-play]')) {
  button.addEventListener('click', () => {
    const source = `https://drive.google.com/file/d/${encodeURIComponent(button.dataset.play)}`;
    playerTitle.textContent = button.dataset.title;
    frame.title = button.dataset.title;
    frame.src = `${source}/preview`;
    videoSource.href = `${source}/view`;
    player.showModal();
  });
}
player.addEventListener('close', () => frame.removeAttribute('src'));

if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const reveal = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('reveal-in');
      observer.unobserve(entry.target);
    }
  }, {threshold: 0.12});
  for (const section of document.querySelectorAll('.section')) reveal.observe(section);
}
