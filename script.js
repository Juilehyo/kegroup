// ============ Active nav link on scroll ============
const navLinks = document.getElementById('navLinks');
const sections = ['brands', 'momentum', 'partners']
  .map((id) => document.getElementById(id))
  .filter(Boolean);
const navLinkEls = Array.from(navLinks.querySelectorAll('a[href^="#"]'));

if (sections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinkEls.forEach((a) => {
          a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );
  sections.forEach((s) => sectionObserver.observe(s));
}

// ============ Scroll reveal ============
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealEls = document.querySelectorAll('.reveal');

if (prefersReducedMotion) {
  revealEls.forEach((el) => el.classList.add('in'));
} else if (revealEls.length) {
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  revealEls.forEach((el) => revealObserver.observe(el));
}

// ============ Scroll-driven zoom feature ============
// Applies to the full-bleed banner (.zoomfx__frame) and each brand photo
// (.brand__media) — every target zooms independently as it scrolls through view.
const zoomTargets = document.querySelectorAll('.zoomfx__frame, .brand__media');
if (zoomTargets.length && !prefersReducedMotion) {
  let ticking = false;

  const progressFor = (el) => {
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 as the element enters from the bottom of the viewport, 1 once it has fully exited the top
    const total = rect.height + vh;
    const traveled = vh - rect.top;
    return Math.min(1, Math.max(0, traveled / total));
  };

  const updateZoom = () => {
    ticking = false;
    zoomTargets.forEach((el) => {
      el.style.setProperty('--zp', progressFor(el).toFixed(4));
    });
  };

  const requestUpdate = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateZoom);
    }
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  updateZoom();
}

// ============ Word-by-word reveal for [data-reveal] ============
document.querySelectorAll('[data-reveal]').forEach((el) => {
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words
    .map(
      (w) =>
        `<span class="rt-mask"><span class="rt-word">${w}</span></span>`
    )
    .join(' ');
});

const wordEls = document.querySelectorAll('[data-reveal] .rt-word');
if (prefersReducedMotion) {
  wordEls.forEach((w) => w.classList.add('active'));
} else if (wordEls.length) {
  const wordObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const words = entry.target.querySelectorAll('.rt-word');
        words.forEach((w, i) => {
          setTimeout(() => w.classList.add('active'), i * 28);
        });
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );
  document.querySelectorAll('[data-reveal]').forEach((el) => wordObserver.observe(el));
}

// ============ Compact nav — fades in once scrolled past the hero on the ============
// home page; always visible on inner pages (e.g. About) so there's always a way home.
const navMini = document.getElementById('navMini');
const heroEl = document.querySelector('.hero');
const isHomePage = !!document.getElementById('brands');
if (navMini) {
  if (isHomePage && heroEl) {
    const toggleMini = () => {
      const past = window.scrollY > heroEl.offsetHeight - 120;
      navMini.classList.toggle('visible', past);
    };
    window.addEventListener('scroll', toggleMini, { passive: true });
    window.addEventListener('resize', toggleMini);
    toggleMini();
  } else {
    navMini.classList.add('visible');
  }
}

// ============ Full-screen nav overlay ============
const navOverlay = document.getElementById('navOverlay');
const navMiniBurger = document.getElementById('navMiniBurger');
const navOverlayClose = document.getElementById('navOverlayClose');
if (navOverlay && navMiniBurger && navOverlayClose) {
  const openOverlay = () => {
    navOverlay.classList.add('open');
    navMiniBurger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  const closeOverlay = () => {
    navOverlay.classList.remove('open');
    navMiniBurger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };
  navMiniBurger.addEventListener('click', openOverlay);
  navOverlayClose.addEventListener('click', closeOverlay);
  navOverlay.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeOverlay));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navOverlay.classList.contains('open')) closeOverlay();
  });
}

// ============ Contact form → mailto ============
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(contactForm);
    const name = data.get('name') || '';
    const email = data.get('email') || '';
    const interest = data.get('interest') || '';
    const message = data.get('message') || '';
    const subject = encodeURIComponent(interest ? `K&E inquiry — ${interest}` : 'K&E inquiry');
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n${interest ? `Interested in: ${interest}\n\n` : '\n'}${message}`
    );
    window.location.href = `mailto:partners@ke-group.com?subject=${subject}&body=${body}`;
  });
}
