# Roadmap — Pacha Eats

## Fase 1 — Unificación visual y entradas por rol ✅

- Marketplace cliente.
- Portal restaurante.
- Portal repartidor.
- Base administrativa.

## Fase 2 — Circuito demo de pedido ✅

- Configurador de producto.
- Carrito mejorado.
- Checkout.
- Pedido persistido localmente.
- Operación del restaurante.
- Oferta y entrega del repartidor.
- PIN y tracking.
- Documentación y capacitación por rol.

## Fase 2.5 — Consola administrativa en vivo ✅

- Panel admin conectado al store de pedidos real.
- Login demo por roles y RBAC con protección de rutas.
- Dashboard, gestión de pedidos con incidencias/cancelación auditada.
- Repartidores, comisiones configurables y CRUD de cupones.
- (Autenticación y persistencia reales llegan en la Fase 3.)

## Fase 3 — Backend y autenticación (Supabase)

Backend elegido: **Supabase** (Postgres + Auth + Realtime + Storage + PostGIS).

- **F3.1 — Fundación ✅**
  - Esquema de BD (tablas, enums, RLS, PostGIS, triggers, `nearest_drivers`).
  - Semilla demo borrable.
  - Auth real (registro/login/rol) para cliente, restaurante y repartidor.
  - Config-gated: sin claves, sigue el modo demo.
- **F3.2 — Onboarding de comercios:** carta/perfil editable, logo/portada (Storage), aprobación desde el panel.
- **F3.3 — Lectura real en la app:** marketplace y panel admin leen de Supabase; pedidos que persisten entre dispositivos.
- **F3.4 — Repartidores + cercanía:** online/offline, posición, ofertas escalonadas por distancia, notificaciones (Realtime).
- **F3.5 — Gestión de usuarios (super admin):** crear/suspender/aprobar desde el panel; login del admin en Supabase; auditoría.

## Fase 4 — Pagos y conciliación

- Mercado Pago Checkout Pro.
- Webhooks.
- Estados de pago separados.
- Comisión congelada por orden.
- Cashback ledger.
- Refunds y conciliación inicial.

## Fase 5 — Despacho y operación avanzada

- Ubicación de repartidores.
- Elegibilidad y radio.
- Ofertas escalonadas.
- Notificaciones.
- Mapas y ETA.
- Soporte e incidencias.

## Fase 6 — Piloto controlado

- Seguridad.
- QA móvil.
- Accesibilidad.
- Monitoreo.
- Manuales finales.
- Capacitación por rol.
- Métricas de economía unitaria.
