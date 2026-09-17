document.addEventListener('DOMContentLoaded', () => {

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Terminal boot sequence: type "whoami", then reveal the profile block
  const typedEl = document.querySelector('.typed');
  const lineEl = document.querySelector('.line');
  const cursorEl = document.querySelector('.cursor');
  const outputEl = document.getElementById('terminal-output');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function revealOutput() {
    if (!outputEl) return;
    outputEl.hidden = false;
    outputEl.style.animation = 'none';
    // trigger a gentle fade-in without relying on repeated keyframes elsewhere
    outputEl.style.opacity = '0';
    outputEl.style.transition = 'opacity 0.5s ease';
    requestAnimationFrame(() => { outputEl.style.opacity = '1'; });
  }

  if (!typedEl || !lineEl || prefersReducedMotion) {
    // No animation: just show everything immediately
    if (typedEl && lineEl) typedEl.textContent = lineEl.dataset.text || 'whoami';
    if (cursorEl) cursorEl.style.animation = 'none';
    revealOutput();
    return;
  }

  const text = lineEl.dataset.text || 'whoami';
  let i = 0;

  function typeChar() {
    if (i <= text.length) {
      typedEl.textContent = text.slice(0, i);
      i++;
      setTimeout(typeChar, 90);
    } else {
      setTimeout(revealOutput, 350);
    }
  }

  setTimeout(typeChar, 400);

  // Smooth-scroll active nav highlight (progressive enhancement, no dependency)
  const sections = document.querySelectorAll('main .section, .hero');
  const navLinks = document.querySelectorAll('.nav__links a');

  if ('IntersectionObserver' in window && sections.length && navLinks.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            link.style.color = link.getAttribute('href') === `#${id}` ? '' : '';
          });
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px' });

    sections.forEach((s) => observer.observe(s));
  }
});
