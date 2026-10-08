/**
 * IRONFIT® - Commercial Performance Sanctuary
 * Production-Ready Interactive Logic & Micro-Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------
  // 1. DOM ELEMENT REFERENCES
  // --------------------------------------------------------
  const header = document.getElementById('header');
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const cursorGlow = document.getElementById('cursorGlow');
  
  // Video Modal Elements
  const openVideoBtn = document.getElementById('openVideoBtn');
  const videoModal = document.getElementById('videoModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const promoIframe = document.getElementById('promoIframe');

  // Cinematic Fitness Walkthrough Video Embed URL
  const PROMO_VIDEO_URL = 'https://www.youtube.com/embed/eas4fcfjPvs?autoplay=1&mute=0&rel=0';

  // --------------------------------------------------------
  // 2. STICKY NAVBAR SCROLL DYNAMICS
  // --------------------------------------------------------
  const updateNavbarOnScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', updateNavbarOnScroll, { passive: true });

  // --------------------------------------------------------
  // 3. AMBIENT MOUSE CURSOR GLOW (DESKTOP ONLY)
  // --------------------------------------------------------
  if (cursorGlow && window.matchMedia('(min-width: 1024px)').matches) {
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Smooth lerp for buttery lag-free cursor follow
    const renderCursorGlow = () => {
      currentX += (mouseX - currentX) * 0.12;
      currentY += (mouseY - currentY) * 0.12;
      cursorGlow.style.left = `${currentX}px`;
      cursorGlow.style.top = `${currentY}px`;
      requestAnimationFrame(renderCursorGlow);
    };

    renderCursorGlow();
  }

  // --------------------------------------------------------
  // 4. MOBILE DRAWER NAVIGATION
  // --------------------------------------------------------
  const toggleMobileMenu = () => {
    const isOpen = navMenu.classList.contains('open');
    menuToggle.classList.toggle('active', !isOpen);
    navMenu.classList.toggle('open', !isOpen);
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    document.body.classList.toggle('no-scroll', !isOpen);
  };

  const closeMobileMenu = () => {
    menuToggle.classList.remove('active');
    navMenu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  };

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', toggleMobileMenu);

    navLinks.forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  // --------------------------------------------------------
  // 5. CINEMATIC VIDEO MODAL LOGIC
  // --------------------------------------------------------
  const openModal = () => {
    if (promoIframe && !promoIframe.src) {
      promoIframe.src = PROMO_VIDEO_URL;
    }
    videoModal.classList.add('active');
    videoModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  };

  const closeModal = () => {
    videoModal.classList.remove('active');
    videoModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    // Stop video playback when modal is closed
    if (promoIframe) {
      promoIframe.src = '';
    }
  };

  if (openVideoBtn && videoModal) {
    openVideoBtn.addEventListener('click', openModal);
    modalCloseBtn.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);

    // Escape key closes modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && videoModal.classList.contains('active')) {
        closeModal();
      }
    });
  }
});
