![Dyha Shop — Detalles inolvidables](src/assets/banner-dyha.svg)

# Dyha Shop — Detalles inolvidables

Landing de **Dyha Shop**: regalos personalizados hechos a mano. Cajas sorpresa, desayunos, detalles corporativos y dedicatorias caligráficas. El sitio no muestra precios a propósito: toda cotización se cierra **por WhatsApp**.

## Qué incluye

- **Catálogo curado** sin precios, con etiquetas artesanales (“100% Personalizable”, “Entrega 24h”, “Más pedido”) y lista de detalles incluidos.
- **Taller interactivo**: configura ocasión, caja, cinta y extras con vista previa en vivo de la caja y de la tarjeta de dedicatoria.
- **Lista de Deseos** (drawer lateral) con cantidades, diseño a medida y envío de la cotización por WhatsApp.
- Interacciones: hero con ilustración SVG animada (lazo, tapa entreabierta, destellos), logo del navbar que reinicia la animación, cinta de atributos infinita (marquee).

## Cómo abrir

Abre `index.html` con doble clic (funciona con `file://`) o sirve la carpeta con un servidor local:

```bash
python -m http.server
```

## Estructura

```
index.html            Página completa
assets/               Logo, favicon y banner
css/                  global.css (único archivo que importa y agrega el resto)
                      variables.css, components.css, animations.css
js/
  data/catalog.js     Datos (productos, ocasiones, cinta, extras) y CONFIG
  components/         catalogRenderer.js, customizer.js, wishlistDrawer.js
  main.js             Arranque de la app
```

## Notas

- Reemplaza `js/data/catalog.js` → `CONFIG.whatsapp` con tu número real de Dyha Shop.
- Sin precios ni moneda: todo se cotiza por WhatsApp.
- Tailwind y tipografías se cargan por CDN (requiere conexión).
