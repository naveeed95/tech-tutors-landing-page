// Scroll progress bar
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.prepend(progressBar);

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY / (document.body.offsetHeight - window.innerHeight);
  progressBar.style.width = `${Math.min(scrolled * 100, 100)}%`;
}, { passive: true });

// Cursor glow (desktop only)
if (!('ontouchstart' in window) && window.matchMedia('(pointer: fine)').matches) {
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  }, { passive: true });
}

// Canvas particle system in hero
(function initHeroCanvas() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'hero-canvas';
  hero.prepend(canvas);
  const ctx = canvas.getContext('2d');

  let particles = [];
  let W, H;

  function resize() {
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  }

  class Dot {
    constructor() { this.reset(true); }
    reset(anywhere) {
      this.x  = Math.random() * W;
      this.y  = anywhere ? Math.random() * H : (Math.random() > 0.5 ? -4 : H + 4);
      this.vx = (Math.random() - 0.5) * 0.25;
      this.vy = (Math.random() - 0.5) * 0.25;
      this.r  = Math.random() * 1.4 + 0.4;
      this.base = Math.random() * 0.5 + 0.15;
      this.phase = Math.random() * Math.PI * 2;
      this.speed = Math.random() * 0.018 + 0.006;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.phase += this.speed;
      if (this.x < -8 || this.x > W + 8 || this.y < -8 || this.y > H + 8) this.reset(false);
    }
    draw() {
      const a = this.base * (0.45 + 0.55 * Math.sin(this.phase));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245,197,24,${a})`;
      ctx.fill();
    }
  }

  function init() {
    resize();
    const count = Math.min(Math.floor((W * H) / 9000), 90);
    particles = Array.from({ length: count }, () => new Dot());
  }

  const LINK_DIST = 110;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.hypot(dx, dy);
        if (d < LINK_DIST) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(245,197,24,${0.055 * (1 - d / LINK_DIST)})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); particles.forEach(p => p.reset(true)); }, 200);
  }, { passive: true });

  init();
  draw();
})();

// Animated counters for stats
(function initCounters() {
  document.querySelectorAll('.stats__num').forEach(el => {
    const raw = el.textContent.trim();
    const m = raw.match(/^(\d+)(.*)/);
    if (!m) return;
    const target = parseInt(m[1], 10);
    const suffix = m[2] || '';
    el.textContent = '0' + suffix;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        obs.unobserve(el);
        const t0 = performance.now();
        const dur = 1600;
        function tick(now) {
          const p = Math.min((now - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(eased * target) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });

    obs.observe(el);
  });
})();

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
