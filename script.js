/* =========================================================
   Gabriel Henrique · Portfólio — interações
   ========================================================= */
(() => {
  'use strict';

  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Tema claro/escuro (lembra a escolha) ---------- */
  const themeBtn = $('.theme-toggle');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  const currentTheme = () => root.dataset.theme || (systemDark.matches ? 'dark' : 'light');

  const updateThemeColor = () => {
    const color = getComputedStyle(root).getPropertyValue('--bg').trim();
    $$('meta[name="theme-color"]').forEach(m => m.setAttribute('content', color));
  };

  themeBtn?.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    updateThemeColor();
  });
  if (root.dataset.theme) updateThemeColor();

  /* ---------- 2. Menu do celular ---------- */
  const menuBtn = $('.menu-toggle');
  const nav = $('#menu');

  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };

  menuBtn?.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', e => {
    if (nav.classList.contains('open') && !nav.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false);
  });

  /* ---------- 3. Rolagem: cabeçalho, barra de progresso e linha do tempo ---------- */
  const header = $('.site-header');
  const progress = $('.progress');
  const timeline = $('.timeline');
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('scrolled', y > 8);
    progress.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);

    if (timeline && !reduceMotion) {
      const r = timeline.getBoundingClientRect();
      const start = window.innerHeight * 0.8;
      const fill = Math.min(1, Math.max(0, (start - r.top) / r.height));
      timeline.style.setProperty('--fill', fill.toFixed(3));
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- 4. Destaca no menu a seção visível ---------- */
  const links = $$('.nav a');
  const sections = links.map(a => $(a.getAttribute('href'))).filter(Boolean);

  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(a => {
          const active = a.getAttribute('href') === '#' + entry.target.id;
          a.classList.toggle('active', active);
          if (active) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  /* ---------- 5. Revela os blocos conforme aparecem ---------- */
  const reveals = $$('.reveal');
  // pequeno atraso em cascata para itens irmãos
  reveals.forEach(el => {
    const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
    const i = siblings.indexOf(el);
    if (i > 0) el.style.setProperty('--d', `${Math.min(i, 4) * 0.08}s`);
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  /* ---------- 6. Palavras que se alternam no subtítulo ---------- */
  const rotator = $('.rotator');
  const words = ['novos desafios', 'marketing', 'tecnologia', 'empreender'];
  if (rotator && !reduceMotion) {
    let i = 0;
    setInterval(() => {
      rotator.classList.add('out');
      setTimeout(() => {
        i = (i + 1) % words.length;
        rotator.textContent = words[i];
        rotator.classList.remove('out');
      }, 350);
    }, 2800);
  }

  /* ---------- 7. Contador do selo da foto ---------- */
  $$('[data-count]').forEach(el => {
    const target = Number(el.dataset.count);
    if (reduceMotion) { el.textContent = target; return; }
    const duration = 1200;
    const t0 = performance.now();
    const step = now => {
      const p = Math.min(1, (now - t0) / duration);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });

  /* ---------- 8. Copiar e-mail (além de abrir o app de e-mail) ---------- */
  const toast = $('.toast');
  let toastTimer;
  const showToast = msg => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  };

  $$('[data-copy]').forEach(el => {
    el.addEventListener('click', () => {
      const text = el.dataset.copy;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => showToast('E-mail copiado: ' + text)).catch(() => {});
      }
    });
  });

  /* ---------- 9. Ano automático no rodapé ---------- */
  const ano = $('#ano');
  if (ano) ano.textContent = new Date().getFullYear();
})();
