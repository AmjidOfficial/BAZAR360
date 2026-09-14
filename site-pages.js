(() => {
  const reveal = () => {
    document.querySelectorAll('[data-reveal]').forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${Math.min(i * 70, 420)}ms`);
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(entries => entries.forEach(entry => {
          if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
        }), { threshold: 0.12 });
        io.observe(el);
      } else el.classList.add('is-visible');
    });
  };

  const nav = document.querySelector('.page-header');
  const toggle = document.querySelector('[data-menu-toggle]');
  if (toggle && nav) toggle.addEventListener('click', () => nav.classList.toggle('menu-open'));

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  const form = document.querySelector('[data-contact-form]');
  if (form) {
    form.addEventListener('submit', e => {
      const button = form.querySelector('button[type="submit"]');
      if (!form.checkValidity()) return;
      if (button) { button.disabled = true; button.textContent = 'Sending…'; }
    });
  }

  reveal();
})();
