const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.getElementById('site-nav');

function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  navigation.dataset.open = 'false';
}
closeMenu();
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  navigation.dataset.open = String(open);
});
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

const filters = document.querySelectorAll('[data-filter]');
const cards = document.querySelectorAll('[data-category]');
for (const filter of filters) {
  filter.addEventListener('click', () => {
    for (const button of filters) button.setAttribute('aria-pressed', String(button === filter));
    for (const card of cards) {
      card.hidden = filter.dataset.filter !== 'Semua' &&
        card.dataset.category !== filter.dataset.filter;
    }
  });
}

for (const button of document.querySelectorAll('[data-dialog]')) {
  button.addEventListener('click', () => {
    const current = button.closest('dialog');
    if (current) current.close();
    document.getElementById(button.dataset.dialog).showModal();
  });
}
for (const dialog of document.querySelectorAll('dialog')) {
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
}

const player = document.getElementById('video-player');
const video = document.getElementById('video-native');
const videoStatus = document.getElementById('video-status');
const playerTitle = document.getElementById('video-player-title');
const videoSource = document.getElementById('video-source');
const introParts = Array.from({length: 6}, (_,index) =>
  `assets/intro/intro-part-0${index}`);
let pendingVideo;
let objectUrl;
let returnDialog;
let returnButton;

for (const button of document.querySelectorAll('[data-play]')) {
  button.addEventListener('click', async () => {
    returnDialog = button.closest('dialog');
    returnButton = button;
    if (returnDialog) returnDialog.close();
    playerTitle.textContent = button.dataset.title;
    videoSource.href = `https://drive.google.com/file/d/${encodeURIComponent(button.dataset.play)}/view`;
    videoStatus.textContent = 'Memuat video…';
    videoStatus.hidden = false;
    video.hidden = false;
    video.poster = button.dataset.poster || 'assets/profil-dwi-v2.webp';
    player.showModal();

    const request = new AbortController();
    pendingVideo = request;
    try {
      if (button.dataset.videoSrc) {
        video.src = button.dataset.videoSrc;
      } else {
        const parts = await Promise.all(introParts.map(async path => {
          const response = await fetch(path, {signal: request.signal});
          if (!response.ok) throw new Error('Video unavailable');
          return response.blob();
        }));
        if (request.signal.aborted) return;
        objectUrl = URL.createObjectURL(new Blob(parts, {type: 'video/mp4'}));
        video.src = objectUrl;
      }
      await video.play();
      if (!request.signal.aborted) videoStatus.hidden = true;
    } catch {
      if (!request.signal.aborted) {
        videoStatus.textContent = video.hasAttribute('src')
          ? 'Ketuk tombol putar pada video untuk mulai menonton.'
          : 'Video belum bisa dimuat. Buka video lewat Google Drive di bawah.';
      }
    }
  });
}
video.addEventListener('playing', () => { videoStatus.hidden = true; });
video.addEventListener('error', () => {
  if (!video.hasAttribute('src')) return;
  videoStatus.hidden = false;
  videoStatus.textContent = 'Video belum bisa diputar. Buka video lewat Google Drive di bawah.';
});
player.addEventListener('close', () => {
  pendingVideo?.abort();
  video.pause();
  video.removeAttribute('src');
  video.load();
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = undefined;
  if (returnDialog) returnDialog.showModal();
  returnButton?.focus();
  returnDialog = undefined;
  returnButton = undefined;
});

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
