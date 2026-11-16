/**
 * Dyha Shop — Catalog & customization data
 * Single source of truth for products, occasions, packaging, ribbons and extras.
 *
 * Classic script: works from file:// and http://.
 */
(function (window) {
  'use strict';

  const DyhaApp = window.DyhaApp = window.DyhaApp || {};

  const CONFIG = {
    whatsapp: '51999999999', // Reemplaza por el número real de Dyha Shop
    brand: 'Dyha Shop',
    defaultDedication: 'Todo lo que siento por ti, en un solo detalle.'
  };

  const PRODUCTS = [
    {
      id: 'momentos',
      name: 'Caja Sorpresa “Momentos”',
      category: 'cajas',
      categoryLabel: 'Cajas sorpresa',
      badge: '100% Personalizable',
      featured: true,
      delivery: 'Entrega 24h',
      description: 'Caja rígida blanca con lazo satinado, un ramo de detalles y una dedicatoria escrita a mano.',
      includes: ['6 fotos Polaroid', 'Dedicatoria a mano', 'Chocolates finos'],
      image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'latidos',
      name: 'Box Romántico “Latidos”',
      category: 'aniversario',
      categoryLabel: 'Aniversario',
      badge: 'Más pedido',
      featured: true,
      delivery: 'Entrega 24h',
      description: 'Nuestra caja insignia: terciopelo, rosas preservadas y un mensaje que lo dice todo.',
      includes: ['Rosas preservadas', 'Carta caligráfica', 'Bombones artesanales'],
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'celebracion',
      name: 'Cofre “Celebración”',
      category: 'cumpleanos',
      categoryLabel: 'Cumpleaños',
      badge: 'Temática a elección',
      featured: false,
      delivery: 'Entrega 24h',
      description: 'Una explosión de detalles: snacks favoritos, mini torta y mensajes que aparecen al abrir.',
      includes: ['Mini torta artesanal', 'Vela mágica', 'Mensajes ocultos'],
      image: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'rosas',
      name: 'Rosas Eternas',
      category: 'aniversario',
      categoryLabel: 'Aniversario',
      badge: 'Edición limitada',
      featured: true,
      delivery: 'Mismo día',
      description: 'Rosas preservadas en una caja de terciopelo, con bombones y dedicatoria caligráfica.',
      includes: ['Rosas premium', 'Caja de terciopelo', 'Dedicatoria a mano'],
      image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'identidad',
      name: 'Kit “Identidad”',
      category: 'corporativo',
      categoryLabel: 'Corporativo',
      badge: 'Pedidos por volumen',
      featured: false,
      delivery: 'Coordinación a medida',
      description: 'Bienvenidas y reconocimientos con el sello de tu empresa, listos para sorprender.',
      includes: ['Branding personalizado', 'Libreta y termo', 'Envíos múltiples'],
      image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'amanecer',
      name: 'Desayuno “Amanecer”',
      category: 'cajas',
      categoryLabel: 'Cajas sorpresa',
      badge: 'Favorito',
      featured: false,
      delivery: 'Reserva previa',
      description: 'Bandeja artesanal con bollería, jugo natural, taza personalizada y globo metálico.',
      includes: ['Taza con nombre', 'Bollería artesanal', 'Globo burbuja'],
      image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'dulce',
      name: 'Box “Dulce Compañía”',
      category: 'cumpleanos',
      categoryLabel: 'Cumpleaños',
      badge: '100% Personalizable',
      featured: true,
      delivery: 'Entrega 24h',
      description: 'Un peluche de felpa, dulces importados y luz cálida para acompañar el abrazo.',
      includes: ['Peluche de felpa', 'Luces LED cálidas', 'Tarjeta a medida'],
      image: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'gracias',
      name: 'Detalle “Gracias”',
      category: 'corporativo',
      categoryLabel: 'Corporativo',
      badge: 'Detalle de equipo',
      featured: false,
      delivery: 'Coordinación a medida',
      description: 'Un gesto floral y artesanal para agradecer a clientes, aliados o equipos.',
      includes: ['Flores preservadas', 'Tarjeta con logo', 'Acabado premium'],
      image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const OCCASIONS = [
    { id: 'aniversario', label: 'Aniversario', hint: 'Para celebrar el amor', icon: 'heart' },
    { id: 'cumpleanos', label: 'Cumpleaños', hint: 'Un año más juntos', icon: 'cake' },
    { id: 'agradecimiento', label: 'Agradecimiento', hint: 'Un gesto que se recuerda', icon: 'sparkles' },
    { id: 'corporativo', label: 'Corporativo', hint: 'Detalles para tu equipo', icon: 'briefcase' }
  ];

  const BOXES = [
    { id: 'clasica', label: 'Caja clásica', hint: 'Blanca, rígida y atemporal', icon: 'gift', bg: '#FFFFFF' },
    { id: 'corazon', label: 'Box corazón', hint: 'Terciopelo rosa y romántico', icon: 'heart', bg: '#FFF1F2' },
    { id: 'rustica', label: 'Bandeja rústica', hint: 'Madera, fibras y calidez', icon: 'box', bg: '#F5E9DB' }
  ];

  const RIBBONS = [
    { id: 'carmesi', label: 'Carmesí', color: '#E11D48' },
    { id: 'rosa', label: 'Rosa', color: '#F0A6B7' },
    { id: 'marfil', label: 'Marfil', color: '#E4D5C3' },
    { id: 'terracota', label: 'Terracota', color: '#C06A4E' },
    { id: 'tinta', label: 'Tinta', color: '#111827' }
  ];

  const EXTRAS = [
    { id: 'polaroid', label: 'Fotos Polaroid', icon: 'camera' },
    { id: 'chocolates', label: 'Chocolates finos', icon: 'gift' },
    { id: 'flores', label: 'Flores preservadas', icon: 'flower' },
    { id: 'taza', label: 'Taza personalizada', icon: 'coffee' },
    { id: 'peluche', label: 'Peluche', icon: 'smile' },
    { id: 'globo', label: 'Globo burbuja', icon: 'balloon' }
  ];

  const DEFAULT_DESIGN = {
    occasion: 'aniversario',
    box: 'clasica',
    ribbon: 'carmesi',
    extras: ['polaroid', 'chocolates'],
    recipient: '',
    signature: '',
    dedication: ''
  };

  DyhaApp.CONFIG = CONFIG;
  DyhaApp.PRODUCTS = PRODUCTS;
  DyhaApp.OCCASIONS = OCCASIONS;
  DyhaApp.BOXES = BOXES;
  DyhaApp.RIBBONS = RIBBONS;
  DyhaApp.EXTRAS = EXTRAS;
  DyhaApp.DEFAULT_DESIGN = DEFAULT_DESIGN;
})(window);
