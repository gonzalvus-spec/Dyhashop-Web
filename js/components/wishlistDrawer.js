/**
 * Dyha Shop — Wishlist drawer
 * Classic script (IIFE): works from file:// and http://.
 * Publishes window.DyhaApp.WishlistDrawer.
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

  const uid = () => (window.crypto && crypto.randomUUID)
    ? crypto.randomUUID()
    : 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2);

  /**
   * Wishlist drawer: holds the selection (catalog + custom designs), renders it
   * and builds a professional WhatsApp quote request.
   */
  class WishlistDrawer {
    constructor({ openWhatsApp, showToast, onOpen } = {}) {
      this.openWhatsApp = openWhatsApp || (() => {});
      this.showToast = showToast || (() => {});
      this.onOpen = onOpen || (() => {});
      this.entries = [];
      this.lastFocusedElement = null;

      this.root = null;
      this.panel = null;
      this.listEl = null;
      this.summaryEl = null;
      this.sendButton = null;
      this.clearButton = null;
      this.occasionInput = null;
      this.closeButton = null;
      this.overlay = null;
    }

    init() {
      this.root = document.querySelector('#wishlist-root');
      this.panel = document.querySelector('#wishlist-panel');
      this.listEl = document.querySelector('#wishlist-items');
      this.summaryEl = document.querySelector('#wishlist-summary');
      this.sendButton = document.querySelector('#btn-send-wishlist');
      this.clearButton = document.querySelector('#btn-clear-wishlist');
      this.occasionInput = document.querySelector('#client-occasion');
      this.closeButton = document.querySelector('#wishlist-close');
      this.overlay = document.querySelector('#wishlist-overlay');

      this.bind();
      this.updateUI();
    }

    bind() {
      document.querySelectorAll('[data-open-wishlist]').forEach((button) => {
        button.addEventListener('click', () => this.open());
      });

      if (this.closeButton) this.closeButton.addEventListener('click', () => this.close());
      if (this.overlay) this.overlay.addEventListener('click', () => this.close());
      if (this.sendButton) this.sendButton.addEventListener('click', () => this.send());
      if (this.clearButton) this.clearButton.addEventListener('click', () => this.clear());

      if (this.listEl) {
        this.listEl.addEventListener('click', (event) => {
          const removeButton = event.target.closest('[data-remove]');
          if (removeButton) {
            this.remove(removeButton.dataset.remove);
            return;
          }

          const quantityButton = event.target.closest('[data-qty]');
          if (quantityButton) {
            this.changeQuantity(quantityButton.dataset.qty, Number(quantityButton.dataset.delta));
            return;
          }

          if (event.target.closest('[data-go-catalog]')) {
            this.close();
            this.scrollTo('#catalogo');
            return;
          }

          if (event.target.closest('[data-go-workshop]')) {
            this.close();
            this.scrollTo('#taller');
          }
        });
      }

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') this.close();
        if (event.key === 'Tab') this.trapFocus(event);
      });
    }

    scrollTo(selector) {
      const target = document.querySelector(selector);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    open() {
      if (!this.root || !this.panel) return;

      this.render();
      this.onOpen();
      this.lastFocusedElement = document.activeElement;
      this.root.classList.add('is-open');
      this.root.setAttribute('aria-hidden', 'false');
      this.panel.removeAttribute('inert');
      document.body.style.overflow = 'hidden';

      setTimeout(() => {
        if (this.closeButton) this.closeButton.focus();
      }, 80);
    }

    close() {
      if (!this.root || !this.panel) return;
      if (!this.root.classList.contains('is-open')) return;

      this.root.classList.remove('is-open');
      this.root.setAttribute('aria-hidden', 'true');
      this.panel.setAttribute('inert', '');
      document.body.style.overflow = '';

      if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function') {
        this.lastFocusedElement.focus();
      }
    }

    trapFocus(event) {
      if (!this.root || !this.panel || !this.root.classList.contains('is-open')) return;

      const focusable = Array.from(this.panel.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter((element) => element.offsetParent !== null);

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    addProduct(product) {
      const existing = this.entries.find((entry) =>
        entry.type === 'catalog' && entry.productId === product.id
      );

      if (existing) {
        existing.qty += 1;
      } else {
        this.entries.push({
          uid: uid(),
          type: 'catalog',
          productId: product.id,
          name: product.name,
          subtitle: product.categoryLabel,
          meta: product.badge + ' · ' + product.delivery,
          image: product.image,
          qty: 1
        });
      }

      this.commit('“' + product.name + '” se añadió a tu lista.');
    }

    addCustom(design) {
      this.entries.push({
        uid: uid(),
        type: 'custom',
        qty: 1,
        design
      });

      this.commit('¡Tu diseño a medida ya está en la lista!');
    }

    commit(message) {
      this.updateUI();
      this.bumpBadges();
      this.showToast(message);
    }

    remove(id) {
      this.entries = this.entries.filter((entry) => entry.uid !== id);
      this.updateUI();
      this.showToast('Detalle retirado de tu lista.');
    }

    changeQuantity(id, delta) {
      const entry = this.entries.find((item) => item.uid === id);
      if (!entry) return;

      entry.qty += delta;

      if (entry.qty <= 0) {
        this.entries = this.entries.filter((item) => item.uid !== id);
        this.showToast('Detalle retirado de tu lista.');
      }

      this.updateUI();
    }

    clear() {
      if (this.entries.length === 0) return;

      this.entries = [];
      if (this.occasionInput) this.occasionInput.value = '';
      this.updateUI();
      this.showToast('Tu lista quedó vacía. ¿Empezamos otra historia?');
    }

    totalItems() {
      return this.entries.reduce((total, entry) => total + entry.qty, 0);
    }

    updateUI() {
      const total = this.totalItems();
      const customCount = this.entries.filter((entry) => entry.type === 'custom').length;

      document.querySelectorAll('[data-wishlist-count]').forEach((badge) => {
        badge.textContent = total;
      });

      if (this.summaryEl) {
        this.summaryEl.textContent = total === 0
          ? 'Tu selección, lista para cotizar.'
          : total + (total === 1 ? ' detalle' : ' detalles') +
            (customCount ? ' · ' + customCount + ' a medida' : '');
      }

      if (this.sendButton) this.sendButton.disabled = this.entries.length === 0;
      if (this.clearButton) this.clearButton.style.display = this.entries.length === 0 ? 'none' : '';

      this.render();
    }

    bumpBadges() {
      document.querySelectorAll('[data-wishlist-count]').forEach((badge) => {
        badge.classList.remove('badge-bump');
        void badge.offsetWidth;
        badge.classList.add('badge-bump');
      });
    }

    render() {
      if (!this.listEl) return;

      if (this.entries.length === 0) {
        this.listEl.innerHTML = `
          <div class="flex min-h-[320px] flex-col items-center justify-center py-10 text-center">
            <div class="relative mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-crimson-100 bg-crimson-50 text-crimson-500">
              <span class="absolute inset-0 rounded-full border border-crimson-100"></span>
              ${icon('gift', 'h-7 w-7')}
            </div>
            <h4 class="font-display text-[20px] font-medium text-ink-900">Tu lista está esperando</h4>
            <p class="mt-2 max-w-[250px] text-[11.5px] leading-relaxed text-ink-400">Explora el catálogo o diseña una caja a medida. Aquí guardaremos cada detalle que elijas.</p>
            <button type="button" data-go-catalog class="mt-5 inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-[11px] font-semibold text-white transition-colors hover:bg-crimson-600">
              Explorar el catálogo
              ${icon('arrow-right', 'h-3.5 w-3.5')}
            </button>
            <button type="button" data-go-workshop class="mt-2 text-[10px] font-semibold text-crimson-700 underline-offset-4 hover:underline">o diseñar a medida</button>
          </div>
        `;
        return;
      }

      this.listEl.innerHTML = this.entries.map((entry) => (
        entry.type === 'catalog' ? this.catalogItem(entry) : this.customItem(entry)
      )).join('');
    }

    quantityControl(id, qty) {
      return `
        <div class="inline-flex items-center rounded-full border border-line bg-white">
          <button type="button" data-qty="${id}" data-delta="-1" class="flex h-6 w-6 items-center justify-center rounded-l-full text-ink-500 transition-colors hover:bg-crimson-50 hover:text-crimson-700" aria-label="Quitar una unidad">
            ${icon('minus', 'h-2.5 w-2.5')}
          </button>
          <span class="w-6 text-center text-[10px] font-bold text-ink-900 price-free">${qty}</span>
          <button type="button" data-qty="${id}" data-delta="1" class="flex h-6 w-6 items-center justify-center rounded-r-full text-ink-500 transition-colors hover:bg-crimson-50 hover:text-crimson-700" aria-label="Añadir una unidad">
            ${icon('plus', 'h-2.5 w-2.5')}
          </button>
        </div>
      `;
    }

    catalogItem(entry) {
      return `
        <article class="flex gap-3 rounded-[1.15rem] border border-line bg-white p-3 shadow-soft">
          <div class="relative h-[78px] w-[62px] flex-none overflow-hidden rounded-xl bg-crimson-50">
            <span class="absolute inset-0 flex items-center justify-center text-crimson-300">${icon('gift', 'h-7 w-7 opacity-60')}</span>
            <img src="${entry.image}" alt="${esc(entry.name)}" class="relative h-full w-full object-cover" loading="lazy" decoding="async" onerror="this.style.display='none'">
            <span class="absolute inset-x-0 bottom-0 bg-ink-900/75 py-0.5 text-center text-[7px] font-bold uppercase tracking-[0.1em] text-white">Catálogo</span>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="text-[8px] font-bold uppercase tracking-[0.14em] text-crimson-700">${esc(entry.subtitle)}</p>
                <h4 class="mt-0.5 text-[12px] font-bold leading-snug text-ink-900">${esc(entry.name)}</h4>
              </div>
              <button type="button" data-remove="${entry.uid}" class="flex h-6 w-6 flex-none items-center justify-center rounded-full text-ink-300 transition-colors hover:bg-crimson-50 hover:text-crimson-700" aria-label="Quitar ${esc(entry.name)} de la lista">
                ${icon('trash', 'h-3 w-3')}
              </button>
            </div>
            <p class="mt-1 line-clamp-1 text-[9px] text-ink-400">${esc(entry.meta)}</p>
            <div class="mt-2 flex items-center justify-between gap-2">
              ${this.quantityControl(entry.uid, entry.qty)}
              <span class="text-[8px] font-bold uppercase tracking-[0.08em] text-crimson-700">Por cotizar</span>
            </div>
          </div>
        </article>
      `;
    }

    customItem(entry) {
      const design = entry.design;
      const extras = design.extras.length
        ? design.extras.map((extra) => (
            '<span class="rounded-full border border-crimson-100 bg-white px-2 py-0.5 text-[8px] font-medium text-ink-500">' +
            esc(extra) + '</span>'
          )).join('')
        : '<span class="text-[8px] text-ink-400">Sin extras seleccionados</span>';

      return `
        <article class="rounded-[1.15rem] border border-crimson-100 bg-[#FFFDFB] p-3.5 shadow-soft">
          <div class="flex items-start gap-3">
            <div class="relative flex h-[62px] w-[54px] flex-none items-center justify-center overflow-hidden rounded-xl border border-crimson-100" style="background:${design.thumbBg}">
              <span class="absolute inset-y-0 left-1/2 w-2.5 -translate-x-1/2" style="background:${design.ribbonColor}"></span>
              <span class="relative flex h-7 w-7 items-center justify-center rounded-full bg-white/85 text-ink-900 shadow-sm">${icon('gift', 'h-4 w-4')}</span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <span class="inline-flex items-center gap-1 rounded-full bg-crimson-600 px-2 py-0.5 text-[7px] font-bold uppercase tracking-[0.1em] text-white">${icon('pen', 'h-2 w-2')} A medida</span>
                  <h4 class="mt-1 text-[12.5px] font-bold leading-snug text-ink-900">Diseño · ${esc(design.occasion)}</h4>
                </div>
                <button type="button" data-remove="${entry.uid}" class="flex h-6 w-6 flex-none items-center justify-center rounded-full text-ink-300 transition-colors hover:bg-crimson-50 hover:text-crimson-700" aria-label="Quitar diseño a medida de la lista">
                  ${icon('trash', 'h-3 w-3')}
                </button>
              </div>
              <p class="mt-0.5 text-[9.5px] text-ink-400">${esc(design.box)} · Cinta ${esc(design.ribbon)}</p>
            </div>
          </div>

          <div class="mt-2.5 flex flex-wrap gap-1">${extras}</div>

          ${design.dedication ? `
            <p class="mt-2.5 line-clamp-2 rounded-lg border border-crimson-100 bg-white/80 px-2.5 py-2 font-script text-[16px] leading-[1.25] text-ink-800">“${esc(design.dedication)}”</p>
          ` : ''}

          <div class="mt-2.5 flex items-center justify-between gap-2 border-t border-crimson-100/70 pt-2.5">
            ${this.quantityControl(entry.uid, entry.qty)}
            <span class="truncate text-[8px] font-semibold uppercase tracking-[0.08em] text-crimson-700">${design.recipient ? 'Para ' + esc(design.recipient) : 'Diseño propio'}</span>
          </div>
        </article>
      `;
    }

    buildMessage() {
      const occasion = this.occasionInput ? this.occasionInput.value.trim() : '';

      const blocks = this.entries.map((entry, index) => {
        const position = index + 1;

        if (entry.type === 'catalog') {
          return position + '. *' + entry.name + '*\n' +
            '   Cantidad: ' + entry.qty + '\n' +
            '   ' + entry.meta;
        }

        const design = entry.design;
        const lines = [
          position + '. *Diseño a medida · ' + design.occasion + '*',
          '   Cantidad: ' + entry.qty,
          '   • Empaque: ' + design.box,
          '   • Cinta: ' + design.ribbon,
          '   • Extras: ' + (design.extras.length ? design.extras.join(', ') : 'Sin extras')
        ];

        if (design.recipient) lines.push('   • Para: ' + design.recipient);
        if (design.dedication) lines.push('   • Dedicatoria: “' + design.dedication + '”');
        if (design.signature) lines.push('   • Firma: ' + design.signature);

        return lines.join('\n');
      }).join('\n\n');

      let message = 'Hola Dyha Shop ❤️\n\n' +
        'Quisiera cotizar mi Lista de Deseos:\n\n' + blocks;

      if (occasion) message += '\n\n📅 Ocasión / fecha estimada: ' + occasion;
      message += '\n\n¿Me ayudan con disponibilidad y opciones de personalización? ¡Gracias!';

      return message;
    }

    send() {
      if (this.entries.length === 0) return;
      this.openWhatsApp(this.buildMessage());
    }
  }

  DyhaApp.WishlistDrawer = WishlistDrawer;
})(window);
