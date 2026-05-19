// ── SCROLL PROGRESS BAR ──
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.prepend(progressBar);

window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.offsetHeight - window.innerHeight);
  progressBar.style.width = `${Math.min(pct * 100, 100)}%`;
}, { passive: true });

// ── CURSOR GLOW (desktop only) ──
if (!('ontouchstart' in window) && window.matchMedia('(pointer: fine)').matches) {
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  }, { passive: true });
}

// ── HERO CANVAS PARTICLE NETWORK ──
(function initHeroCanvas() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'hero-canvas';
  hero.prepend(canvas);
  const ctx = canvas.getContext('2d');
  let particles = [], W, H;

  function resize() {
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  }

  class Dot {
    constructor() { this.reset(true); }
    reset(anywhere) {
      this.x     = Math.random() * W;
      this.y     = anywhere ? Math.random() * H : (Math.random() > .5 ? -4 : H + 4);
      this.vx    = (Math.random() - .5) * 0.22;
      this.vy    = (Math.random() - .5) * 0.22;
      this.r     = Math.random() * 1.3 + 0.4;
      this.base  = Math.random() * 0.45 + 0.1;
      this.phase = Math.random() * Math.PI * 2;
      this.speed = Math.random() * 0.018 + 0.005;
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
      ctx.fillStyle = `rgba(129,140,248,${a})`;
      ctx.fill();
    }
  }

  function init() {
    resize();
    const count = Math.min(Math.floor((W * H) / 9000), 90);
    particles = Array.from({ length: count }, () => new Dot());
  }

  const LINK = 120;
  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.hypot(dx, dy);
        if (d < LINK) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(129,140,248,${0.06 * (1 - d / LINK)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(frame);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); particles.forEach(p => p.reset(true)); }, 200);
  }, { passive: true });

  init();
  frame();
})();

// ── ANIMATED STAT COUNTERS ──
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
        const t0  = performance.now();
        const dur = 1600;
        function tick(now) {
          const p     = Math.min((now - t0) / dur, 1);
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

// ── SCROLL REVEAL ──
const revealTargets = [
  { selector: '.service-card',      delay: 80  },
  { selector: '.why__item',         delay: 80  },
  { selector: '.process__step',     delay: 120 },
  { selector: '.portfolio__card',   delay: 100 },
  { selector: '.pricing__card',     delay: 100 },
  { selector: '.stats__item',       delay: 60  },
  { selector: '.testimonial__card', delay: 100 },
  { selector: '.faq__item',         delay: 60  },
];

revealTargets.forEach(({ selector, delay }) => {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * delay}ms`;
  });
});

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

document.querySelectorAll('.section__header, .cta-bar__inner').forEach(el => {
  el.classList.add('reveal');
  revealObs.observe(el);
});

// ── FAQ ACCORDION ──
document.querySelectorAll('.faq__item').forEach(item => {
  const btn = item.querySelector('.faq__q');
  const ans = item.querySelector('.faq__a');

  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    // Close all other items
    document.querySelectorAll('.faq__item.open').forEach(other => {
      if (other !== item) {
        other.classList.remove('open');
        other.querySelector('.faq__q').setAttribute('aria-expanded', 'false');
        const otherAns = other.querySelector('.faq__a');
        otherAns.style.maxHeight = otherAns.scrollHeight + 'px';
        requestAnimationFrame(() => { otherAns.style.maxHeight = '0'; });
        setTimeout(() => { otherAns.hidden = true; otherAns.style.maxHeight = ''; }, 320);
      }
    });

    if (isOpen) {
      item.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      ans.style.maxHeight = ans.scrollHeight + 'px';
      requestAnimationFrame(() => { ans.style.maxHeight = '0'; });
      setTimeout(() => { ans.hidden = true; ans.style.maxHeight = ''; }, 320);
    } else {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      ans.hidden = false;
      ans.style.maxHeight = '0';
      requestAnimationFrame(() => { ans.style.maxHeight = ans.scrollHeight + 'px'; });
      setTimeout(() => { ans.style.maxHeight = ''; }, 320);
    }
  });
});

// Smooth FAQ answer transition via CSS
document.querySelectorAll('.faq__a').forEach(el => {
  el.style.overflow  = 'hidden';
  el.style.transition = 'max-height .32s cubic-bezier(.4,0,.2,1)';
});

// ── MOBILE NAV ──
const burger   = document.getElementById('burger');
const navLinks = document.querySelector('.nav__links');
burger?.addEventListener('click', () => navLinks?.classList.toggle('open'));
document.querySelectorAll('.nav__links a').forEach(link =>
  link.addEventListener('click', () => navLinks?.classList.remove('open'))
);

// ── NAV SCROLL STYLE ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav?.classList.toggle('nav--scrolled', window.scrollY > 40);
}, { passive: true });

// ── CONTACT FORM ──
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
      btn.style.background = '#22c55e';
      btn.style.color = '#000';
      form.reset();
    } else {
      throw new Error();
    }
  } catch {
    btn.textContent = 'Failed — Try WhatsApp';
    btn.style.background = '#ef4444';
    btn.style.color = '#fff';
  }

  setTimeout(() => {
    btn.textContent = original;
    btn.style.background = '';
    btn.style.color = '';
    btn.disabled = false;
  }, 4000);
});
