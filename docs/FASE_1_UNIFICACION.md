# Fase 1 — Unificación profesional de Pacha Eats

## Objetivo
Separar correctamente la experiencia de los tres actores principales sin perder la base del proyecto original.

## Decisión de arquitectura de esta etapa
Se conserva HTML/CSS/JavaScript estático porque permite desplegar inmediatamente en GitHub Pages y aprovechar los activos existentes. La capa de datos demo continúa en JSON. Apps Script permanece como backend objetivo del MVP.

## Entradas por rol
- Cliente: `/index.html`
- Restaurante: `/restaurantes/index.html`
- Repartidor: `/repartidores/index.html`

## Principios aplicados
- Mobile-first para cliente y repartidor.
- Portal de escritorio adaptable para restaurante.
- Identidad Pacha Eats roja y original.
- Carrito limitado a un solo comercio.
- Accesos demo claramente separados de producción.
- Componentes compartidos para evitar duplicación visual.

## Archivos nuevos o reestructurados
- `index.html`
- `assets/css/styles.css`
- `assets/css/portal.css`
- `assets/js/app.js`
- `assets/js/pages.js`
- `assets/js/portal.js`
- `restaurantes/index.html`
- `restaurantes/dashboard.html`
- `restaurantes/pedidos.html`
- `restaurantes/menu.html`
- `restaurantes/promociones.html`
- `restaurantes/ventas.html`
- `repartidores/index.html`
- `repartidores/dashboard.html`
- `repartidores/pedidos.html`
- `repartidores/ganancias.html`
- `repartidores/documentos.html`

## Pendiente para Fase 2
- Autenticación real.
- Modal de producto y modificadores.
- Backend de cotización.
- Direcciones y zonas reales.
- Orden real y estados separados de pago/reparto.
