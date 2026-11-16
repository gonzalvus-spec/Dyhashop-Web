/**
 * Dyha Shop — Catalog renderer
 * Classic script (IIFE): works from file:// and http://.
 * Publishes window.DyhaApp.CatalogRenderer.
 */
(function (window) {
  'use strict';

  const DyhaApp = window.DyhaApp = window.DyhaApp || {};

  const icon = (name, classes = 'h-4 w-4') =>
    '<svg class="' + classes + '" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';

  const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));

  const getProducts = () => (Array.isArray(DyhaApp.PRODUCTS) ? DyhaApp.PRODUCTS : []);

  /**
   * Renders the curated catalog, manages category filters and delegates
   * "add to wishlist" / "quote on WhatsApp" actions to the app shell.
   */
  class CatalogRenderer {
    constructor({ onAdd, onQuote } = {}) {
      this.onAdd = onAdd || (() => {});
      this.onQuote = onQuote || (() => {});
      this.filter = 'todos';
      this.grid = null;
      this.count = null;
      this.track = null;
      this.indicator = null;
      this.resizeTimer = null;
    }

    init() {
      this.grid = document.querySelector('#catalog-grid');
      this.count = document.querySelector('#results-count');
      this.track = document.querySelector('#filter-track');
      this.indicator = document.querySelector('#filter-indicator');

      if (!this.grid) return;

      this.grid.setAttribute('role', 'tabpanel');
      this.grid.setAttribute('aria-live', 'polite');

      this.bind();
      this.render();
      this.syncAria();

      requestAnimationFrame(() => this.moveIndicator());
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => requestAnimationFrame(() => this.moveIndicator()));
      }
      window.addEventListener('resize', () => {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => this.moveIndicator(), 120);
      });
    }

    bind() {
      this.grid.addEventListener('click', (event) => {
        const productList = getProducts();

        const addButton = event.target.closest('[data-add]');
        if (addButton) {
          const product = productList.find((item) => item.id === addButton.dataset.add);
          if (!product) return;
          this.onAdd(product);
          this.flashAdded(addButton);
          return;
        }

        const quoteButton = event.target.closest('[data-quote]');
        if (quoteButton) {
          const product = productList.find((item) => item.id === quoteButton.dataset.quote);
          if (!product) return;
          this.onQuote(
            'Hola Dyha Shop ❤️\n\n' +
            'Me interesa cotizar *' + product.name + '* (' + product.badge + ' · ' + product.delivery + ').\n\n' +
            '¿Me cuentan las opciones de personalización y disponibilidad? ¡Gracias!'
          );
        }
      });

      if (!this.track) return;

      this.track.querySelectorAll('.filter-btn').forEach((button) => {
        button.id = 'filter-tab-' + button.dataset.filter;
      });

      this.track.addEventListener('click', (event) => {
        const button = event.target.closest('[data-filter]');
        if (button) this.setFilter(button.dataset.filter);
      });

      this.track.addEventListener('keydown', (event) => {
        const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
        if (!keys.includes(event.key)) return;

        event.preventDefault();
        const buttons = Array.from(this.track.querySelectorAll('.filter-btn'));
        const current = buttons.findIndex((button) => button.getAttribute('aria-selected') === 'true');
        let next = current;

        if (event.key === 'ArrowRight') next = (current + 1) % buttons.length;
        if (event.key === 'ArrowLeft') next = (current - 1 + buttons.length) % buttons.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = buttons.length - 1;

        buttons[next].focus();
        this.setFilter(buttons[next].dataset.filter);
      });
    }

    setFilter(filter) {
      this.filter = filter;

      if (this.track) {
        this.track.querySelectorAll('.filter-btn').forEach((button) => {
          button.setAttribute('aria-selected', String(button.dataset.filter === filter));
        });
      }

      this.render();
      this.syncAria();
      requestAnimationFrame(() => this.moveIndicator());
    }

    syncAria() {
      const active = this.track
        ? this.track.querySelector('.filter-btn[aria-selected="true"]')
        : null;
      if (active && this.grid) this.grid.setAttribute('aria-labelledby', active.id);
    }

    moveIndicator() {
      if (!this.track || !this.indicator) return;
      const active = this.track.querySelector('.filter-btn[aria-selected="true"]');
      if (!active) return;

      const trackRect = this.track.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();
      this.indicator.style.width = activeRect.width + 'px';
      this.indicator.style.transform = 'translateX(' + (activeRect.left - trackRect.left) + 'px)';
    }

    render() {
      if (!this.grid) return;

      const products = getProducts();
      const visible = this.filter === 'todos'
        ? products
        : products.filter((product) => product.category === this.filter);

      this.grid.innerHTML = visible.map((product, index) => this.card(product, index)).join('');

      if (this.count) {
        this.count.innerHTML = '<span class="h-1 w-1 rounded-full bg-crimson-500"></span> ' +
          visible.length + (visible.length === 1 ? ' detalle' : ' detalles');
      }
    }

    card(product, index) {
      const badgeClass = product.featured
        ? 'bg-crimson-600 text-white'
        : 'border border-white/60 bg-white/90 text-ink-800 backdrop-blur-md';

      return `
        <article class="product-card group flex flex-col overflow-hidden rounded-[1.4rem] border border-line bg-white shadow-soft transition-all duration-500 ease-expo hover:-translate-y-1 hover:shadow-lift" style="--i:${index}">
          <div class="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-crimson-50 to-crimson-100">
            <div class="absolute inset-0 flex items-center justify-center text-crimson-300">
              ${icon('gift', 'h-16 w-16 opacity-60')}
            </div>
            <img src="${product.image}" alt="${esc(product.name)}" class="relative h-full w-full object-cover transition-transform duration-[1.1s] ease-expo group-hover:scale-[1.05]" loading="lazy" decoding="async" onerror="this.style.display='none'">
            <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/60 via-ink-900/5 to-transparent"></div>

            <div class="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
              <span class="inline-flex rounded-full px-2.5 py-1.5 text-[8.5px] font-bold uppercase tracking-[0.1em] shadow-sm ${badgeClass}">${esc(product.badge)}</span>
            </div>

            <div class="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
              <span class="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[8.5px] font-semibold text-white backdrop-blur-md">
                ${icon('clock', 'h-2.5 w-2.5')} ${esc(product.delivery)}
              </span>
              <span class="rounded-full bg-ink-900/35 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-white/80 backdrop-blur-sm">${String(index + 1).padStart(2, '0')}</span>
            </div>
          </div>

          <div class="flex flex-1 flex-col p-4 sm:p-[18px]">
            <p class="text-[8.5px] font-bold uppercase tracking-[0.18em] text-crimson-700">${esc(product.categoryLabel)}</p>
            <h3 class="mt-1.5 font-display text-[19px] font-medium leading-[1.15] tracking-[-0.01em] text-ink-900">${esc(product.name)}</h3>
            <p class="mt-2 line-clamp-2 text-[11px] leading-relaxed text-ink-500">${esc(product.description)}</p>

            <ul class="mt-3.5 space-y-1.5 border-t border-line pt-3.5">
              ${product.includes.map((item) => `
                <li class="flex items-start gap-2 text-[10.5px] font-medium leading-snug text-ink-600">
                  ${icon('check', 'mt-[1px] h-3 w-3 flex-none text-crimson-500')}
                  <span>${esc(item)}</span>
                </li>
              `).join('')}
            </ul>

            <div class="mt-auto flex gap-2 pt-4">
              <button type="button" data-add="${product.id}" class="inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full bg-ink-900 px-3 py-2.5 text-[10.5px] font-semibold text-white transition-all duration-300 ease-expo hover:bg-crimson-600 active:scale-[.98]">
                ${icon('heart', 'h-3.5 w-3.5 flex-none')}
                <span class="truncate">Añadir a mi Lista de Deseos</span>
              </button>
              <button type="button" data-quote="${product.id}" class="inline-flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full border border-line text-ink-400 transition-colors hover:border-whatsapp/30 hover:bg-whatsapp/5 hover:text-whatsapp-dark" aria-label="Cotizar ${esc(product.name)} por WhatsApp" title="Cotizar por WhatsApp">
                ${icon('whatsapp', 'h-3.5 w-3.5')}
              </button>
            </div>
          </div>
        </article>
      `;
    }

    flashAdded(button) {
      if (!button || button.dataset.busy) return;
      button.dataset.busy = '1';
      button.disabled = true;
      const original = button.innerHTML;
      button.innerHTML = icon('check', 'h-3.5 w-3.5 flex-none') + '<span class="truncate">En tu lista</span>';

      setTimeout(() => {
        button.innerHTML = original;
        button.disabled = false;
        delete button.dataset.busy;
      }, 1300);
    }
  }

  DyhaApp.CatalogRenderer = CatalogRenderer;
})(window);
