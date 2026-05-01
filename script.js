// Mobile nav
const burger = document.getElementById('burger');
const navLinks = document.querySelector('.nav__links');
burger?.addEventListener('click', () => navLinks?.classList.toggle('open'));
document.querySelectorAll('.nav__links a').forEach(link =>
  link.addEventListener('click', () => navLinks?.classList.remove('open'))
);

// Nav style on scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav?.classList.toggle('nav--scrolled', window.scrollY > 40);
}, { passive: true });

// Staggered reveal on scroll
const revealTargets = [
  { selector: '.service-card',    delay: 80  },
  { selector: '.why__item',       delay: 80  },
  { selector: '.process__step',   delay: 120 },
  { selector: '.portfolio__card', delay: 100 },
  { selector: '.pricing__card',   delay: 100 },
  { selector: '.stats__item',     delay: 60  },
];

revealTargets.forEach(({ selector, delay }) => {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * delay}ms`;
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Section headers fade in
document.querySelectorAll('.section__header, .cta-bar__inner').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// Contact form async submit
const form = document.getElementById('contactForm');
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  const original = btn.textContent;
  btn.textContent = 'Sending...';
  btn.disabled = true;

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    });
    if (res.ok) {
      btn.textContent = 'Message Sent!';
      btn.style.background = '#00C8B8';
      btn.style.color = '#000';
      form.reset();
    } else {
      throw new Error();
    }
  } catch {
    btn.textContent = 'Failed — Try WhatsApp';
    btn.style.background = '#c0392b';
    btn.style.color = '#fff';
  }

  setTimeout(() => {
    btn.textContent = original;
    btn.style.background = '';
    btn.style.color = '';
    btn.disabled = false;
  }, 4000);
});
