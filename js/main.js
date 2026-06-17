/* PatchWork Labs — Site JS */

// Nav scroll effect
const nav = document.querySelector('.nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// Mobile menu toggle
const navToggle = document.querySelector('.nav-toggle');
const mobileNav = document.querySelector('.mobile-nav');
if (navToggle && mobileNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      navToggle.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && mobileNav.classList.contains('open')) {
      mobileNav.classList.remove('open');
      navToggle.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

// Active nav link highlighting
const currentFile = window.location.pathname.split('/').pop() || '/';
document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
  const href = link.getAttribute('href');
  if (href && href === currentFile) {
    link.classList.add('active');
  }
});

// Scroll-triggered fade-up animations
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

// Lightbox
(function () {
  const lb       = document.getElementById('lightbox');
  if (!lb) return;

  const lbImg    = lb.querySelector('.lightbox-img');
  const lbPrev   = lb.querySelector('.lb-prev');
  const lbNext   = lb.querySelector('.lb-next');
  const lbClose  = lb.querySelector('.lightbox-close');
  const lbCount  = lb.querySelector('.lightbox-counter');

  let images = [], idx = 0;

  function show(i) {
    idx = (i + images.length) % images.length;
    lbImg.classList.add('swapping');
    setTimeout(() => {
      lbImg.src = images[idx].src;
      lbImg.alt = images[idx].alt || '';
      lbImg.classList.remove('swapping');
    }, 150);
    if (lbCount) lbCount.textContent = images.length > 1 ? `${idx + 1} / ${images.length}` : '';
    if (lbPrev)  lbPrev.classList.toggle('lb-hidden', images.length < 2);
    if (lbNext)  lbNext.classList.toggle('lb-hidden', images.length < 2);
  }

  function open(imgs, startIdx) {
    images = imgs;
    show(startIdx);
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 300);
  }

  lbClose?.addEventListener('click', close);
  lbPrev?.addEventListener('click', (e) => { e.stopPropagation(); show(idx - 1); });
  lbNext?.addEventListener('click', (e) => { e.stopPropagation(); show(idx + 1); });
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });

  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowRight')  show(idx + 1);
    if (e.key === 'ArrowLeft')   show(idx - 1);
  });

  // Wire up every project-image that has real photos
  document.querySelectorAll('.project-image').forEach(wrap => {
    const imgs = Array.from(wrap.querySelectorAll('img'));
    if (!imgs.length) return;

    wrap.classList.add('has-photo');

    wrap.addEventListener('click', (e) => {
      // Don't intercept carousel button clicks
      if (e.target.closest('.carousel-btn') || e.target.closest('.carousel-dots')) return;

      // Start from whatever slide is currently active in the carousel
      let startIdx = 0;
      const activeSlide = wrap.querySelector('.carousel-slide.active');
      if (activeSlide) {
        const allSlides = Array.from(wrap.querySelectorAll('.carousel-slide'));
        startIdx = allSlides.indexOf(activeSlide);
      }
      open(imgs, startIdx);
    });
  });
})();

// Image carousels
document.querySelectorAll('.carousel').forEach(carousel => {
  const slides = carousel.querySelectorAll('.carousel-slide');
  const dots   = carousel.querySelectorAll('.carousel-dot');
  if (slides.length < 2) return;

  let current = 0;

  function goTo(idx) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  carousel.querySelector('.prev')?.addEventListener('click', () => goTo(current - 1));
  carousel.querySelector('.next')?.addEventListener('click', () => goTo(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  // Auto-advance every 4s when not hovered
  let timer = setInterval(() => goTo(current + 1), 4000);
  carousel.addEventListener('mouseenter', () => clearInterval(timer));
  carousel.addEventListener('mouseleave', () => {
    timer = setInterval(() => goTo(current + 1), 4000);
  });
});

// Typing effect
const typingEl = document.querySelector('.typing-text');
if (typingEl) {
  const phrases = [
    'building and maintaining the software that runs your business.',
    'web development, from the ground up.',
    'server-side upgrades without the downtime.',
    'AWS infrastructure, built right the first time.',
    'automation that gets out of your way.'
  ];
  let phraseIdx = 0, charIdx = 0, deleting = false;

  function type() {
    const current = phrases[phraseIdx];
    if (!deleting) {
      typingEl.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(type, 2400);
        return;
      }
    } else {
      typingEl.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
      }
    }
    setTimeout(type, deleting ? 38 : 68);
  }
  setTimeout(type, 900);
}

// Contact form submission
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  const submitBtn  = contactForm.querySelector('button[type="submit"]');
  const statusEl   = document.getElementById('form-status');
  const messageEl  = contactForm.querySelector('textarea[name="message"]');
  const charCount  = document.getElementById('form-char-count');

  if (messageEl && charCount) {
    const maxLen = messageEl.getAttribute('maxlength') || 1000;
    messageEl.addEventListener('input', () => {
      const len = messageEl.value.length;
      charCount.textContent = `${len} / ${maxLen}`;
      charCount.classList.toggle('limit-near', len >= maxLen * 0.9);
    });
  }

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    if (statusEl) { statusEl.textContent = ''; statusEl.className = 'form-status'; }

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        contactForm.reset();
        if (charCount) charCount.textContent = `0 / ${messageEl?.getAttribute('maxlength') || 1000}`;
        if (statusEl) {
          statusEl.textContent = "Message sent — we'll get back to you soon.";
          statusEl.className = 'form-status success';
        }
      } else {
        throw new Error('Submission failed');
      }
    } catch {
      if (statusEl) {
        statusEl.textContent = 'Something went wrong. Please try again or email us directly.';
        statusEl.className = 'form-status error';
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
}
