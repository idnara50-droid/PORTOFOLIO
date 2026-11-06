const INTRO_PARTS = ["assets/intro/intro-part-00", "assets/intro/intro-part-01", "assets/intro/intro-part-02", "assets/intro/intro-part-03", "assets/intro/intro-part-04", "assets/intro/intro-part-05"];

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

const player = document.getElementById('video-player');
const frame = document.getElementById('video-frame');
const playerTitle = document.getElementById('video-player-title');
const videoSource = document.getElementById('video-source');

const nativeVideo = document.getElementById('video-native');
const videoStatus = document.getElementById('video-status');
let videoLoad;
let videoObjectUrl;

for (const button of document.querySelectorAll('[data-play]')) {
  button.addEventListener('click', async () => {
    const source = `https://drive.google.com/file/d/${encodeURIComponent(button.dataset.play)}`;
    const useNative = button.dataset.nativeVideo === 'intro';
    playerTitle.textContent = button.dataset.title;
    frame.title = button.dataset.title;
    frame.hidden = useNative;
    nativeVideo.hidden = !useNative;
    videoStatus.hidden = !useNative;
    videoSource.href = `${source}/view`;
    if (!useNative) frame.src = `${source}/preview`;
    player.showModal();
    if (!useNative) return;

    videoStatus.textContent = 'Memuat video…';
    const load = new AbortController();
    videoLoad = load;
    try {
      const parts = await Promise.all(INTRO_PARTS.map(async (part) => {
        const response = await fetch(part, {signal: load.signal});
        if (!response.ok) throw new Error('Video part unavailable');
        return response.blob();
      }));
      if (load.signal.aborted) return;
      videoObjectUrl = URL.createObjectURL(new Blob(parts, {type: 'video/mp4'}));
      nativeVideo.src = videoObjectUrl;
      videoStatus.hidden = true;
      nativeVideo.play().catch(() => {});
    } catch {
      if (!load.signal.aborted) videoStatus.textContent = 'Video belum bisa dimuat. Coba buka lewat Google Drive.';
    }
  });
}

player.addEventListener('close', () => {
  frame.removeAttribute('src');
  videoLoad?.abort();
  nativeVideo.removeAttribute('src');
  nativeVideo.load();
  if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl);
  videoObjectUrl = undefined;
});
nativeVideo.addEventListener('error', () => {
  if (!nativeVideo.hasAttribute('src')) return;
  videoStatus.hidden = false;
  videoStatus.textContent = 'Video belum bisa diputar. Coba buka lewat Google Drive.';
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
