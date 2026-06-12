const button = document.querySelector('#menu-btn');
const nav = document.querySelector('#site-nav');

if (button && nav) {
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
  });
}

document.querySelectorAll('.navbar a, .btn[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
      window.scrollTo({ top: target.offsetTop - headerHeight, behavior: 'smooth' });
      nav?.classList.remove('open');
      button?.setAttribute('aria-expanded', 'false');
    }
  });
});
