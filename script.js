/**
 * PRO FIT | Training Club
 * Minimal, clean vanilla JavaScript for header states & navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  const siteHeader = document.getElementById('siteHeader');
  const mobileToggle = document.getElementById('mobileToggle');
  const mainNav = document.getElementById('mainNav');
  const navLinks = document.querySelectorAll('.nav-link');

  // 1. Subtle scroll state for header
  const handleScroll = () => {
    if (window.scrollY > 20) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  // 2. Mobile navigation toggle
  if (mobileToggle && mainNav) {
    const toggleMenu = () => {
      const isOpen = mainNav.classList.contains('open');
      mobileToggle.classList.toggle('active', !isOpen);
      mainNav.classList.toggle('open', !isOpen);
      mobileToggle.setAttribute('aria-expanded', String(!isOpen));
      document.body.classList.toggle('menu-open', !isOpen);
    };

    const closeMenu = () => {
      mobileToggle.classList.remove('active');
      mainNav.classList.remove('open');
      mobileToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    };

    mobileToggle.addEventListener('click', toggleMenu);

    navLinks.forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
  }
});
