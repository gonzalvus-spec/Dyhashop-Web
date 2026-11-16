/**
 * Dyha Shop — Gift customizer
 * Classic script (IIFE): works from file:// and http://.
 * Publishes window.DyhaApp.Customizer.
 */
(function (window) {
  'use strict';

  const DyhaApp = window.DyhaApp = window.DyhaApp || {};

  const icon = (name, classes = 'h-4 w-4') =>
    '<svg class="' + classes + '" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';

  const byId = (collection, id) => collection.find((item) => item.id === id) || collection[0];
  const DEDICATION_LIMIT = 180;

  const data = () => ({
    OCCASIONS: DyhaApp.OCCASIONS || [],
    BOXES: DyhaApp.BOXES || [],
    RIBBONS: DyhaApp.RIBBONS || [],
    EXTRAS: DyhaApp.EXTRAS || [],
    DEFAULT_DESIGN: DyhaApp.DEFAULT_DESIGN || {
      occasion: 'aniversario',
      box: 'clasica',
      ribbon: 'carmesi',
      extras: ['polaroid', 'chocolates'],
      recipient: '',
      signature: '',
      dedication: ''
    },
    CONFIG: DyhaApp.CONFIG || { brand: 'Dyha Shop', defaultDedication: '' }
  });

  /**
   * Step-by-step gift customizer with a live preview card and gift box mockup.
   */
  class Customizer {
    constructor({ onAdd, onQuote } = {}) {
      this.onAdd = onAdd || (() => {});
      this.onQuote = onQuote || (() => {});
      const { DEFAULT_DESIGN } = data();
      this.design = {
        ...DEFAULT_DESIGN,
        extras: [...DEFAULT_DESIGN.extras]
      };
      this.section = null;
      this.stage = null;
      this.addButton = null;
      this.quoteButton = null;
    }

    init() {
      this.section = document.querySelector('#taller');
      this.stage = document.querySelector('#preview-stage');
      this.addButton = document.querySelector('#btn-add-custom');
      this.quoteButton = document.querySelector('#btn-quote-custom');

      if (!this.section) return;

      this.renderOptions();
      this.bind();
      this.bindInputs();
      this.sync();
    }

    bind() {
      this.section.addEventListener('click', (event) => {
        const occasion = event.target.closest('[data-occasion]');
        if (occasion) {
          this.design.occasion = occasion.dataset.occasion;
          this.sync();
          return;
        }

        const box = event.target.closest('[data-box]');
        if (box) {
          this.design.box = box.dataset.box;
          this.sync();
          return;
        }

        const ribbon = event.target.closest('[data-ribbon]');
        if (ribbon) {
          this.design.ribbon = ribbon.dataset.ribbon;
          this.sync();
          return;
        }

        const extra = event.target.closest('[data-extra]');
        if (extra) {
          const id = extra.dataset.extra;
          const index = this.design.extras.indexOf(id);
          if (index > -1) this.design.extras.splice(index, 1);
          else this.design.extras.push(id);
          this.sync();
        }
      });

      if (this.addButton) {
        this.addButton.addEventListener('click', () => this.addToWishlist());
      }

      if (this.quoteButton) {
        this.quoteButton.addEventListener('click', () => this.quote());
      }
    }

    bindInputs() {
      const recipient = document.querySelector('#dedication-recipient');
      const signature = document.querySelector('#dedication-signature');
      const dedication = document.querySelector('#dedication-text');

      if (recipient) {
        recipient.addEventListener('input', (event) => {
          this.design.recipient = event.target.value;
          this.sync();
        });
      }

      if (signature) {
        signature.addEventListener('input', (event) => {
          this.design.signature = event.target.value;
          this.sync();
        });
      }

      if (dedication) {
        dedication.maxLength = DEDICATION_LIMIT;
        dedication.addEventListener('input', (event) => {
          this.design.dedication = event.target.value;
          this.sync();
        });
      }
    }

    renderOptions() {
      const { OCCASIONS, BOXES, RIBBONS, EXTRAS } = data();

      const occasions = document.querySelector('#occasion-options');
      const boxes = document.querySelector('#box-options');
      const ribbons = document.querySelector('#ribbon-options');
      const extras = document.querySelector('#extras-options');

      if (occasions) {
        occasions.innerHTML = OCCASIONS.map((occasion) => `
          <button type="button" class="choice relative flex items-center gap-3 rounded-xl px-3 py-3 text-left" data-occasion="${occasion.id}" aria-pressed="false">
            <span class="choice-icon flex h-8 w-8 flex-none items-center justify-center rounded-full border border-crimson-100 bg-crimson-50 text-crimson-600">${icon(occasion.icon, 'h-4 w-4')}</span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-[11.5px] font-bold text-ink-900">${occasion.label}</span>
              <span class="mt-0.5 block truncate text-[9.5px] text-ink-400">${occasion.hint}</span>
            </span>
            <span class="choice-mark absolute right-2.5 top-2.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-crimson-600 text-white">${icon('check', 'h-2.5 w-2.5')}</span>
          </button>
        `).join('');
      }

      if (boxes) {
        boxes.innerHTML = BOXES.map((box) => `
          <button type="button" class="choice relative flex flex-col items-start gap-2 rounded-xl p-3 text-left" data-box="${box.id}" aria-pressed="false">
            <span class="choice-icon flex h-8 w-8 items-center justify-center rounded-full border border-crimson-100 bg-crimson-50 text-crimson-600">${icon(box.icon, 'h-4 w-4')}</span>
            <span class="min-w-0">
              <span class="block text-[11px] font-bold leading-tight text-ink-900">${box.label}</span>
              <span class="mt-0.5 block text-[9px] leading-snug text-ink-400">${box.hint}</span>
            </span>
            <span class="choice-mark absolute right-2.5 top-2.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-crimson-600 text-white">${icon('check', 'h-2.5 w-2.5')}</span>
          </button>
        `).join('');
      }

      if (ribbons) {
        ribbons.innerHTML = RIBBONS.map((ribbon) => `
          <button type="button" class="ribbon-choice inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3" data-ribbon="${ribbon.id}" aria-pressed="false">
            <span class="h-5 w-5 rounded-full ring-1 ring-inset ring-ink-900/10" style="background:${ribbon.color}"></span>
            <span class="text-[10.5px] font-semibold text-ink-700">${ribbon.label}</span>
          </button>
        `).join('');
      }

      if (extras) {
        extras.innerHTML = EXTRAS.map((extra) => `
          <button type="button" class="extra-choice relative flex items-center gap-2 rounded-xl px-2.5 py-2.5 text-left" data-extra="${extra.id}" aria-pressed="false">
            <span class="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-crimson-50 text-crimson-600">${icon(extra.icon, 'h-3 w-3')}</span>
            <span class="min-w-0 flex-1 text-[10px] font-semibold leading-tight text-ink-700">${extra.label}</span>
            <span class="extra-check flex h-3.5 w-3.5 flex-none items-center justify-center rounded-full bg-crimson-600 text-white">${icon('check', 'h-2 w-2')}</span>
          </button>
        `).join('');
      }
    }

    sync() {
      const { OCCASIONS, BOXES, RIBBONS, EXTRAS, CONFIG } = data();

      const occasion = byId(OCCASIONS, this.design.occasion);
      const box = byId(BOXES, this.design.box);
      const ribbon = byId(RIBBONS, this.design.ribbon);
      const chosenExtras = EXTRAS.filter((extra) => this.design.extras.includes(extra.id));

      document.querySelectorAll('[data-occasion]').forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.occasion === this.design.occasion));
      });
      document.querySelectorAll('[data-box]').forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.box === this.design.box));
      });
      document.querySelectorAll('[data-ribbon]').forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.ribbon === this.design.ribbon));
      });
      document.querySelectorAll('[data-extra]').forEach((button) => {
        button.setAttribute('aria-pressed', String(this.design.extras.includes(button.dataset.extra)));
      });

      if (this.stage) {
        this.stage.style.setProperty('--ribbon', ribbon.color);
        this.stage.style.setProperty('--box-bg', box.bg);
      }

      this.setText('#preview-box-name', box.label);
      this.setText('#ribbon-name', ribbon.label);
      this.setText('#preview-recipient', this.design.recipient.trim() || 'ti');
      this.setText('#preview-dedication', this.design.dedication.trim() || CONFIG.defaultDedication);
      this.setText('#preview-signature', this.design.signature.trim() || CONFIG.brand);

      const occasionLabel = document.querySelector('#preview-occasion');
      if (occasionLabel) {
        occasionLabel.innerHTML = icon(occasion.icon, 'h-2.5 w-2.5') + ' ' + occasion.label;
      }

      const extrasBadge = document.querySelector('#extras-count');
      if (extrasBadge) {
        extrasBadge.textContent = chosenExtras.length
          ? chosenExtras.length + (chosenExtras.length === 1 ? ' elegido' : ' elegidos')
          : 'Sin extras';
      }

      const chipBox = document.querySelector('#preview-chip-box');
      if (chipBox) chipBox.innerHTML = icon('gift', 'h-2.5 w-2.5 text-crimson-500') + ' ' + box.label;

      const chipRibbon = document.querySelector('#preview-chip-ribbon');
      if (chipRibbon) {
        chipRibbon.innerHTML = '<span class="h-2 w-2 rounded-full" style="background:' +
          ribbon.color + '"></span> Cinta ' + ribbon.label.toLowerCase();
      }

      const chipExtras = document.querySelector('#preview-chip-extras');
      if (chipExtras) {
        const text = chosenExtras.length
          ? (chosenExtras.length === 1 ? '1 extra' : chosenExtras.length + ' extras')
          : 'Sin extras';
        chipExtras.innerHTML = icon('sparkles', 'h-2.5 w-2.5 text-crimson-500') + ' ' + text;
      }

      const counter = document.querySelector('#dedication-count');
      if (counter) counter.textContent = this.design.dedication.length + ' / ' + DEDICATION_LIMIT;
    }

    setText(selector, value) {
      const element = document.querySelector(selector);
      if (element) element.textContent = value;
    }

    payload() {
      const { OCCASIONS, BOXES, RIBBONS, EXTRAS } = data();

      const occasion = byId(OCCASIONS, this.design.occasion);
      const box = byId(BOXES, this.design.box);
      const ribbon = byId(RIBBONS, this.design.ribbon);
      const extras = EXTRAS.filter((extra) => this.design.extras.includes(extra.id));

      return {
        occasion: occasion.label,
        box: box.label,
        ribbon: ribbon.label,
        ribbonColor: ribbon.color,
        thumbBg: box.bg,
        extras: extras.map((extra) => extra.label),
        recipient: this.design.recipient.trim(),
        dedication: this.design.dedication.trim(),
        signature: this.design.signature.trim()
      };
    }

    addToWishlist() {
      this.onAdd(this.payload());
      this.flashAdded();
    }

    flashAdded() {
      const button = this.addButton;
      if (!button || button.dataset.busy) return;

      button.dataset.busy = '1';
      button.disabled = true;
      const original = button.innerHTML;
      button.innerHTML = icon('check', 'h-4 w-4') + ' Guardado en tu lista';

      setTimeout(() => {
        button.innerHTML = original;
        button.disabled = false;
        delete button.dataset.busy;
      }, 1700);
    }

    quote() {
      const design = this.payload();

      let message = 'Hola Dyha Shop ❤️\n\nQuisiera cotizar este diseño a medida:\n\n' +
        '• Ocasión: ' + design.occasion + '\n' +
        '• Empaque: ' + design.box + '\n' +
        '• Cinta: ' + design.ribbon + '\n' +
        '• Extras: ' + (design.extras.length ? design.extras.join(', ') : 'Sin extras');

      if (design.recipient) message += '\n• Para: ' + design.recipient;
      if (design.dedication) message += '\n• Dedicatoria: “' + design.dedication + '”';
      if (design.signature) message += '\n• Firma: ' + design.signature;

      message += '\n\n¿Me ayudan con disponibilidad y opciones de personalización? ¡Gracias!';
      this.onQuote(message);
    }
  }

  DyhaApp.Customizer = Customizer;
})(window);
