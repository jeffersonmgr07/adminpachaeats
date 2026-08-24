# Ficha técnica — Fase 2 · Flujo de pedidos

**Fecha:** 23 de agosto de 2026  
**Versión:** 2.0 demo operativa  

## Propósito

Transformar la maqueta de la Fase 1 en un circuito interactivo verificable entre cliente, restaurante y repartidor.

## Archivos principales modificados

- `assets/js/app.js`
- `assets/js/pages.js`
- `assets/js/portal.js`
- `assets/data/products.json`
- `assets/css/styles.css`
- `assets/css/portal.css`
- `checkout.html`
- `seguimiento-pedido.html`
- `restaurantes/index.html`
- `restaurantes/dashboard.html`
- `restaurantes/pedidos.html`
- `repartidores/dashboard.html`
- `repartidores/pedidos.html`

## 1. Configurador de productos

El modal se construye desde `modifierGroups` de cada producto.

Estructura conceptual:

```text
modifierGroups[]
  id
  name
  min
  max
  options[]
    id
    name
    price
```

Reglas:

- `min > 0`: grupo requerido.
- `max = 1`: radio button.
- `max > 1`: checkbox múltiple.
- Se impide exceder `max`.
- El total del botón se recalcula con extras y cantidad.

## 2. Carrito

Cada línea usa `lineId` propio para permitir el mismo producto con configuraciones distintas.

```text
lineId
productId
qty
modifiers[]
note
```

El precio unitario se calcula como:

```text
precio_base + suma_recargos_modificadores
```

## 3. Creación de pedido

El checkout crea una orden persistida en `pe_demo_orders_v2` y vacía el carrito.

Se genera:

- código `PE-XXXXXX`;
- PIN aleatorio de cuatro dígitos;
- snapshot del restaurante;
- snapshot de ítems;
- subtotal;
- delivery;
- total;
- evento inicial.

## 4. Operación del restaurante

El restaurante demo se selecciona en `restaurantes/index.html` y se guarda en `pe_restaurant_demo_id`.

Transiciones disponibles:

```text
PENDING_RESTAURANT
→ ACCEPTED
→ PREPARING
→ READY
```

Al llegar a `READY`, la orden queda disponible en el portal de repartidores.

## 5. Operación del repartidor

Flujo:

```text
READY
→ DRIVER_ASSIGNED
→ PICKED_UP
→ ON_THE_WAY
→ DELIVERED
```

Para `DELIVERED` el repartidor debe ingresar el mismo PIN mostrado en la pantalla de seguimiento del comprador.

## 6. Seguimiento

`seguimiento-pedido.html` obtiene el ID desde:

1. parámetro `?id=`;
2. último pedido en `pe_last_order`.

La pantalla consulta periódicamente la orden local y actualiza timeline, repartidor y estado.

## 7. Criterios de aceptación de esta fase

- [x] Configurar un producto con opciones requeridas.
- [x] Agregar dos configuraciones distintas del mismo producto.
- [x] Evitar carrito multicomercio sin confirmación.
- [x] Crear una orden desde checkout.
- [x] Visualizar la orden en el comercio correcto.
- [x] Avanzar el pedido hasta `READY`.
- [x] Visualizarlo como oferta para repartidor.
- [x] Asignarlo a un repartidor demo.
- [x] Confirmar recojo.
- [x] Cambiar a `ON_THE_WAY`.
- [x] Validar entrega con PIN.
- [x] Reflejar estados en seguimiento del cliente.

## 8. Riesgos pendientes

La asignación todavía no es atómica porque `localStorage` no ofrece concurrencia multiusuario. Antes del piloto real debe migrarse la aceptación del reparto a backend con `LockService` o mecanismo transaccional equivalente.
