# Ficha técnica general — Pacha Eats

**Proyecto:** Pacha Eats  
**Tipo:** marketplace de delivery multicomercio  
**Versión documentada:** Fase 2  
**Estado:** prototipo operativo frontend  
**Piloto de referencia:** Pachacámac, Lima  

## 1. Objetivo

Pacha Eats conecta cuatro actores principales: comprador, comercio, repartidor y administración. El objetivo del MVP es cerrar de forma confiable el circuito:

**descubrir → configurar producto → carrito → checkout → restaurante prepara → repartidor acepta → entrega con PIN → seguimiento**.

## 2. Arquitectura vigente

### Frontend actual

- HTML5.
- CSS3 responsive/mobile-first.
- JavaScript vanilla modular por responsabilidad.
- JSON local para catálogo y datos demo.
- `localStorage` como persistencia temporal de carrito y pedidos.
- Compatible con hosting estático en GitHub Pages.

### Backend existente/preparado

El repositorio conserva `appscript-backend/`, con una primera API de Google Apps Script para usuarios, pedidos, productos, repartidores y notificaciones. La Fase 2 todavía no conecta el frontend operativo a esa API.

### Persistencia objetivo del MVP

- Google Sheets.
- Google Apps Script como API Web App.
- UUID/IDs lógicos y timestamps.
- `LockService` para operaciones concurrentes.
- `PropertiesService` para secretos.

## 3. Entradas por rol

| Rol | Entrada |
|---|---|
| Comprador | `/index.html` |
| Restaurante/comercio | `/restaurantes/index.html` |
| Repartidor | `/repartidores/index.html` |
| Administración | `/admin/index.html` |

## 4. Componentes JavaScript principales

### `assets/js/app.js`

Responsable de:

- carga de JSON;
- utilidades monetarias y sanitización;
- carrito;
- cálculo de extras;
- regla de un comercio por carrito;
- persistencia demo de órdenes;
- transiciones de estado;
- filtrado de órdenes por restaurante/repartidor.

### `assets/js/pages.js`

Responsable de:

- home cliente;
- modal de configuración de producto;
- restaurante público;
- checkout;
- creación de pedido;
- seguimiento dinámico.

### `assets/js/portal.js`

Responsable de:

- selección del restaurante demo;
- dashboard y flujo de pedidos de comercio;
- ofertas y entregas de repartidor;
- aceptación y avance de estados;
- validación demo del PIN de entrega.

## 5. Modelo de pedido demo

Campos principales:

- `id`
- `customer`
- `phone`
- `address`
- `reference`
- `restaurantId`
- `restaurant`
- `status`
- `paymentStatus`
- `paymentMethod`
- `rider`
- `subtotal`
- `delivery`
- `total`
- `cashbackEstimate`
- `deliveryPin`
- `items[]`
- `events[]`
- `createdAt`
- `updatedAt`

Cada ítem conserva un snapshot de producto, precio, cantidad, modificadores, nota y total de línea.

## 6. Estados de pedido implementados

1. `PENDING_RESTAURANT`
2. `ACCEPTED`
3. `PREPARING`
4. `READY`
5. `DRIVER_ASSIGNED`
6. `PICKED_UP`
7. `ON_THE_WAY`
8. `DELIVERED`
9. `CANCELLED` preparado en el modelo

## 7. Reglas implementadas

- Un carrito pertenece a un solo comercio.
- Cambiar de comercio requiere vaciar el carrito.
- Los extras pueden tener mínimo y máximo.
- Un grupo obligatorio bloquea el agregado si no se completa.
- Los recargos de extras se suman al precio unitario.
- El pedido guarda snapshots de precio y configuración.
- Solo un pedido `READY` sin repartidor aparece como oferta.
- Aceptar una entrega la asigna al repartidor demo.
- La entrega requiere PIN de cuatro dígitos.
- El cliente puede observar el cambio de estados mediante polling local.

## 8. Límites de la Fase 2

- `localStorage` no es una base multiusuario ni multi-dispositivo.
- No hay autenticación real.
- No hay control de concurrencia real.
- No hay geolocalización real ni cálculo de rutas.
- No hay pasarela de pago conectada.
- No hay notificaciones push.
- La distancia y ganancia de reparto siguen siendo valores demo.

## 9. Próxima migración técnica

La Fase 3 debe introducir un `OrderRepository` remoto y conservar la interfaz funcional actual. Las mutaciones deben enviarse a Apps Script con identificación de sesión, rol, propiedad del recurso e idempotencia.
