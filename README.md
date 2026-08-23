# Pacha Eats — Fase 1 profesional unificada

Esta versión toma como base el proyecto original de Pacha Eats y lo reorganiza como un sistema con entradas separadas por rol, listo para visualizar directamente en GitHub Pages.

## Entradas principales

- `index.html` — marketplace para clientes.
- `restaurantes/index.html` — acceso exclusivo para restaurantes/comercios.
- `repartidores/index.html` — acceso exclusivo para repartidores.
- `admin/index.html` — acceso administrativo existente.

## Qué funciona en esta fase

### Cliente
- Home responsive y mobile-first.
- Banners, categorías, verticales, promociones, restaurantes y productos.
- Búsqueda visual en home.
- Selector de ubicación demo persistente en `localStorage`.
- Carrito persistente y regla de un comercio por carrito.
- Enlaces a catálogo, restaurante, checkout y seguimiento existentes.

### Restaurante
- Portal de ingreso independiente.
- Dashboard profesional.
- Estado abierto/pausado demo.
- Pedidos, menú, promociones y ventas.
- Lectura de los JSON ya existentes para datos demo.

### Repartidor
- Portal de ingreso independiente.
- Dashboard profesional.
- Estado disponible/no disponible demo.
- Oferta de reparto visual.
- Historial, ganancias y documentos.

## Ejecutar localmente

No requiere Node, npm ni compilación.

Desde la carpeta raíz:

```bash
python3 -m http.server 8080
```

Abrir:

- Cliente: `http://localhost:8080/`
- Restaurantes: `http://localhost:8080/restaurantes/`
- Repartidores: `http://localhost:8080/repartidores/`

> No abrir los HTML con `file://`, porque los JSON se cargan mediante `fetch()` y el navegador puede bloquearlos.

## Publicar en GitHub Pages

1. Subir todos los archivos conservando la estructura.
2. En GitHub: **Settings → Pages**.
3. En **Build and deployment**, seleccionar **Deploy from a branch**.
4. Elegir la rama `main` y la carpeta `/ (root)`.
5. Guardar.

La raíz del repositorio mostrará automáticamente el `index.html` del cliente.

## Accesos demo

Restaurante:
- `restaurante@pachaeats.demo`
- `demo123`

Repartidor:
- `rider@pachaeats.demo`
- `demo123`

En esta fase son demostrativos y no validan credenciales. La autenticación real se conectará después.

## Próxima fase recomendada

1. Modal de producto con variantes/complementos obligatorios.
2. Carrito mejorado y cotización backend.
3. Login real por roles.
4. Google Apps Script + Sheets con RBAC.
5. Creación y estados reales de pedidos.
6. Despacho de repartidores con bloqueo atómico.
7. Mercado Pago + Webhooks idempotentes.
