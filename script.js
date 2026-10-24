'use strict';

(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  // Target waktu menggunakan zona WIB agar hitung mundur konsisten untuk ulang tahun di Indonesia.
  const birthdayTimestamp = new Date('2026-10-25T00:00:00+07:00').getTime();
  const birthdayDateLabel = '2026-10-25';
  const countdownLabel = $('#countdownLabel');
  let countdownInterval = null;

  function jakartaDateString(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(date);
    const part = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    return `${part.year}-${part.month}-${part.day}`;
  }

  function updateCountdown() {
    const now = Date.now();
    const remaining = Math.max(0, birthdayTimestamp - now);
    const values = {
      days: Math.floor(remaining / 86400000),
      hours: Math.floor((remaining % 86400000) / 3600000),
      minutes: Math.floor((remaining % 3600000) / 60000),
      seconds: Math.floor((remaining % 60000) / 1000)
    };

    Object.entries(values).forEach(([id, value]) => {
      const node = document.getElementById(id);
      if (node) node.textContent = String(value).padStart(2, '0');
    });

    if (!countdownLabel) return;
    if (now < birthdayTimestamp) {
      countdownLabel.textContent = 'Setiap detik membawa kita lebih dekat ke hari spesialmu.';
    } else if (jakartaDateString() === birthdayDateLabel) {
      countdownLabel.textContent = 'Hari ini harinya, sayang! Selamat ulang tahun ke-24. ♡';
    } else {
      countdownLabel.textContent = 'Satu tanggal istimewa, dan doa baik yang semoga menemanimu sepanjang tahun.';
    }
  }

  function initPhotoPlaceholders() {
    $$('[data-photo]').forEach((img) => {
      const placeholder = img.parentElement?.querySelector('.photo-placeholder');
      if (!placeholder) return;

      const showPlaceholder = () => {
        img.classList.add('hidden');
        placeholder.classList.remove('hidden');
        placeholder.classList.add('flex');
      };
      const showImage = () => {
        img.classList.remove('hidden');
        placeholder.classList.add('hidden');
        placeholder.classList.remove('flex');
      };

      img.addEventListener('load', showImage, { once: true });
      img.addEventListener('error', showPlaceholder, { once: true });

      // Menangani gambar yang selesai dimuat sebelum listener terpasang.
      if (img.complete) {
        if (img.naturalWidth > 0) showImage();
        else showPlaceholder();
      }
    });
  }

  const modal = $('#letterModal');
  const openButtons = [$('#openLetterBtn'), $('#openLetterBtn2')].filter(Boolean);
  const closeButton = $('#closeLetterBtn');
  let lastFocusedElement = null;

  function openLetter() {
    if (!modal) return;
    lastFocusedElement = document.activeElement;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeButton?.focus({ preventScroll: true });
  }

  function closeLetter() {
    if (!modal || modal.classList.contains('hidden')) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus({ preventScroll: true });
    }
  }

  openButtons.forEach((button) => button.addEventListener('click', openLetter));
  closeButton?.addEventListener('click', closeLetter);
  modal?.addEventListener('click', (event) => {
    if (event.target === modal) closeLetter();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeLetter();
  });

  const wishMessages = [
    'Semoga dunia lebih sering bersikap lembut kepadamu, sayang.',
    'Semoga langkahmu dimudahkan dan pintu-pintu baik terbuka di waktu yang tepat.',
    'Semoga kamu selalu dikelilingi orang yang tulus, yang membuatmu merasa aman menjadi diri sendiri.',
    'Semoga hari-hari kecilmu dipenuhi tawa, makanan enak, tidur nyenyak, dan kabar baik.',
    'Semoga kamu bangga pada dirimu sendiri, termasuk untuk hal-hal kecil yang berhasil kamu lewati.',
    'Semoga semua doa yang kamu simpan diam-diam menemukan jalan terbaik untuk menjadi nyata.',
    'Semoga hatimu punya cukup ruang untuk bahagia, beristirahat, dan memulai lagi.',
    'Semoga usia 24 membawakan banyak cerita indah yang kelak ingin kamu kenang sambil tersenyum.'
  ];
  let wishIndex = 0;
  const wishText = $('#wishText');
  $('#newWishBtn')?.addEventListener('click', () => {
    if (!wishText) return;
    wishIndex = (wishIndex + 1) % wishMessages.length;
    wishText.animate?.([{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 280, easing: 'ease-out' });
    wishText.textContent = wishMessages[wishIndex];
  });

  function releaseHearts(amount = 18) {
    const symbols = ['♡', '♥', '✦', '✧'];
    for (let i = 0; i < amount; i += 1) {
      const particle = document.createElement('span');
      particle.className = 'heart-particle';
      particle.setAttribute('aria-hidden', 'true');
      particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      particle.style.left = `${Math.random() * 96 + 2}%`;
      particle.style.fontSize = `${12 + Math.random() * 19}px`;
      particle.style.setProperty('--duration', `${3.2 + Math.random() * 2.7}s`);
      particle.style.animationDelay = `${Math.random() * 0.75}s`;
      document.body.appendChild(particle);
      particle.addEventListener('animationend', () => particle.remove(), { once: true });
    }
  }

  const feedback = $('#actionFeedback');
  $('#sendHugBtn')?.addEventListener('click', () => {
    releaseHearts(24);
    if (feedback) feedback.textContent = 'Peluk virtual terkirim untuk Sayangnya akoo 🫂🫂🫂🫂🫂🫂. Semoga kamu merasa disayangi ya ndut. ♡';
  });

  function getLetterText() {
    const letter = $('#letterCopy');
    return letter ? letter.innerText.trim() : [
      'Selamat ulang tahun ke-24, sayangku, Nadziratul Lathifah.',
      'Semoga kamu sehat, bahagia, dikelilingi kebaikan, dan semua doa baikmu menemukan jalan.',
      'Aku bersyukur bisa mengenalmu. Selamat ulang tahun, sayang. Aku sayang kamu. ♡'
    ].join('\n\n');
  }

  async function copyText(textToCopy) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const helper = document.createElement('textarea');
        helper.value = textToCopy;
        helper.setAttribute('readonly', '');
        helper.style.position = 'fixed';
        helper.style.opacity = '0';
        helper.style.pointerEvents = 'none';
        document.body.appendChild(helper);
        helper.select();
        const copied = document.execCommand('copy');
        helper.remove();
        if (!copied) throw new Error('Copy command was not available');
      }
      if (feedback) feedback.textContent = 'Ucapan berhasil disalin. Tinggal kirim ke orang tersayang. ♡';
      const modalCopy = $('#modalCopyBtn');
      if (modalCopy && !modal?.classList.contains('hidden')) modalCopy.textContent = 'Berhasil disalin ✓';
    } catch (error) {
      if (feedback) feedback.textContent = 'Salin otomatis belum tersedia di browser ini. Buka surat, lalu pilih dan salin teksnya.';
    }
  }

  $('#copyLetterBtn')?.addEventListener('click', () => copyText(getLetterText()));
  $('#modalCopyBtn')?.addEventListener('click', () => copyText(getLetterText()));

  // Mengurangi efek animasi dekoratif bila perangkat meminta reduced motion.
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!reducedMotion) {
    // Efek hati saat tombol surat pertama kali ditekan, tanpa mengambil alih navigasi.
    $('#openLetterBtn')?.addEventListener('click', () => releaseHearts(8));
  }

  initPhotoPlaceholders();
  updateCountdown();
  countdownInterval = window.setInterval(updateCountdown, 1000);
  window.addEventListener('pagehide', () => {
    if (countdownInterval) window.clearInterval(countdownInterval);
  }, { once: true });
})();
