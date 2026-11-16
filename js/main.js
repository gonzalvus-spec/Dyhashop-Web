/**
 * Dyha Shop — App bootstrap
 * Classic script (IIFE): works from file:// and http://.
 * Depends on window.DyhaApp being populated by the previously loaded scripts.
 */
(function (window) {
  'use strict';

  const DyhaApp = window.DyhaApp = window.DyhaApp || {};

  const getConfig = () => DyhaApp.CONFIG || { whatsapp: '', brand: 'Dyha Shop' };

  /* --------------------------------------------------------------------------
     Shared services
     -------------------------------------------------------------------------- */
  function openWhatsApp(message) {
    const config = getConfig();
    const url = 'https://wa.me/' + config.whatsapp + '?text=' + encodeURIComponent(message);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  let toastTimer;
  function showToast(message) {
    const pill = document.querySelector('#toast-pill');
    const label = document.querySelector('#toast-message');
    if (!pill || !label) return;

    label.textContent = message;
    pill.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => pill.classList.remove('is-visible'), 3400);
  }

  /* --------------------------------------------------------------------------
     Mobile navigation
     -------------------------------------------------------------------------- */
  function setMobileMenu(open) {
    const menu = document.querySelector('#mobile-menu');
    const toggle = document.querySelector('#mobile-menu-toggle');
    if (!menu || !toggle) return;

    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');

    const menuIcon = toggle.querySelector('[data-icon-menu]');
    const closeIcon = toggle.querySelector('[data-icon-close]');
    if (menuIcon) menuIcon.classList.toggle('hidden', open);
    if (closeIcon) closeIcon.classList.toggle('hidden', !open);
  }

  function bindMobileMenu() {
    const toggle = document.querySelector('#mobile-menu-toggle');
    const menu = document.querySelector('#mobile-menu');

    if (toggle) {
      toggle.addEventListener('click', () => {
        setMobileMenu(menu ? !menu.classList.contains('is-open') : false);
      });
    }

    if (menu) {
      menu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => setMobileMenu(false));
      });
    }

    document.addEventListener('click', (event) => {
      if (!menu || !menu.classList.contains('is-open')) return;
      const header = document.querySelector('#site-header');
      if (header && header.contains(event.target)) return;
      setMobileMenu(false);
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('a[href^="#"]')) return;
      setMobileMenu(false);
    });
  }

  /* --------------------------------------------------------------------------
     Global attributes
     -------------------------------------------------------------------------- */
  function bindHeader() {
    const header = document.querySelector('#site-header');

    function update() {
      if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  function bindDirectWhatsApp() {
    document.querySelectorAll('[data-direct-whatsapp]').forEach((button) => {
      button.addEventListener('click', () => {
        openWhatsApp('Hola Dyha Shop ❤️ Me gustaría recibir asesoría para un regalo personalizado. ¿Me cuentan cómo funciona?');
      });
    });
  }

  /* --------------------------------------------------------------------------
     Hero illustration: entrance restart + heart burst
     -------------------------------------------------------------------------- */
  function setupHeroVisual() {
    const visual = document.querySelector('#hero-visual');
    const svg = document.querySelector('#hero-svg');
    if (!visual || !svg) return null;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let burstTimer;

    function burst() {
      if (reducedMotion.matches) return;
      svg.classList.remove('is-bursting');
      void svg.getBoundingClientRect();
      svg.classList.add('is-bursting');
      clearTimeout(burstTimer);
      burstTimer = setTimeout(() => svg.classList.remove('is-bursting'), 1400);
    }

    function restartEntrance() {
      svg.classList.remove('is-entering');
      svg.classList.remove('is-looping');
      void svg.getBoundingClientRect();

      const replay = () => {
        svg.classList.add('is-entering');
        svg.classList.add('is-looping');
      };

      requestAnimationFrame(replay);
      // Fallback: requestAnimationFrame pauses in background tabs.
      setTimeout(replay, 40);
    }

    visual.addEventListener('pointerenter', burst);
    visual.addEventListener('click', burst);
    visual.addEventListener('focus', burst);

    return { burst, restartEntrance };
  }

  function bindNavbarLogo(hero) {
    const logo = document.querySelector('#navbar-logo');
    if (!logo) return;

    const icon = document.querySelector('#navbar-logo-icon');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    logo.addEventListener('click', (event) => {
      event.preventDefault();

      const target = document.querySelector('#hero');
      if (target) {
        target.scrollIntoView({
          behavior: reducedMotion.matches ? 'auto' : 'smooth',
          block: 'start'
        });
      }

      if (icon && !reducedMotion.matches) {
        icon.classList.remove('logo-pulse');
        void icon.offsetWidth;
        icon.classList.add('logo-pulse');
        setTimeout(() => icon.classList.remove('logo-pulse'), 720);
      }

      if (hero) {
        hero.restartEntrance();
        hero.burst();
      }
    });
  }

  function revealAll() {
    document.querySelectorAll('[data-reveal]').forEach((element) => {
      element.classList.add('is-visible');
    });
  }

  function setupReveal() {
    const elements = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      revealAll();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });

    elements.forEach((element) => observer.observe(element));

    // Safety net: if anything prevents the observer from firing, never leave
    // the page invisible. Runs once, a moment after load.
    window.addEventListener('load', () => {
      setTimeout(() => {
        document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((element) => {
          const rect = element.getBoundingClientRect();
          if (rect.top < window.innerHeight) element.classList.add('is-visible');
        });
      }, 1200);
    });
  }

  function setYear() {
    const year = document.querySelector('#year');
    if (year) year.textContent = new Date().getFullYear();
  }

  /* --------------------------------------------------------------------------
     App bootstrap
     -------------------------------------------------------------------------- */
  function init() {
    const { WishlistDrawer, Customizer, CatalogRenderer } = DyhaApp;

    let wishlist = null;

    if (typeof WishlistDrawer === 'function') {
      wishlist = new WishlistDrawer({
        openWhatsApp,
        showToast,
        onOpen: () => setMobileMenu(false)
      });
      wishlist.init();
    } else {
      console.warn('[Dyha Shop] WishlistDrawer no está disponible.');
    }

    if (typeof Customizer === 'function' && wishlist) {
      const customizer = new Customizer({
        onAdd: (design) => wishlist.addCustom(design),
        onQuote: openWhatsApp
      });
      customizer.init();
    }

    if (typeof CatalogRenderer === 'function' && wishlist) {
      const catalog = new CatalogRenderer({
        onAdd: (product) => wishlist.addProduct(product),
        onQuote: openWhatsApp
      });
      catalog.init();
    }

    const hero = setupHeroVisual();

    bindMobileMenu();
    bindHeader();
    bindDirectWhatsApp();
    bindNavbarLogo(hero);
    setupReveal();
    setYear();

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setMobileMenu(false);
    });
  }

  function start() {
    try {
      init();
    } catch (error) {
      console.error('[Dyha Shop] Error al inicializar:', error);
      revealAll();
    }
  }

  DyhaApp.openWhatsApp = openWhatsApp;
  DyhaApp.showToast = showToast;
  DyhaApp.init = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})(window);
