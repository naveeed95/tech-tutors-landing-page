// Mobile nav toggle
const burger = document.getElementById('burger');
const navLinks = document.querySelector('.nav__links');
burger?.addEventListener('click', () => navLinks?.classList.toggle('open'));
document.querySelectorAll('.nav__links a').forEach(link =>
  link.addEventListener('click', () => navLinks?.classList.remove('open'))
);

// Nav shadow on scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav?.classList.toggle('nav--scrolled', window.scrollY > 40);
});

// Contact form — async submit with feedback
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
  }

  setTimeout(() => {
    btn.textContent = original;
    btn.style.background = '';
    btn.style.color = '';
    btn.disabled = false;
  }, 4000);
});

// Scroll fade-in for cards
const fadeEls = document.querySelectorAll(
  '.service-card, .why__item, .process__step, .portfolio__card, .pricing__card'
);
fadeEls.forEach(el => {
  el.style.cssText += 'opacity:0;transform:translateY(20px);transition:opacity .5s ease,transform .5s ease';
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

fadeEls.forEach(el => observer.observe(el));
