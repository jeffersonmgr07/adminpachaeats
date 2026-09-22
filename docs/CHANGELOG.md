# Changelog — Pacha Eats

## 2.1.0 — 21-09-2026

### Añadido — Panel administrativo en vivo
- Consola admin conectada al store de pedidos real (`pe_demo_orders_v2`), compartido con cliente, restaurante y repartidor.
- Login demo por roles y control de acceso (RBAC) con protección de rutas: superadmin, administrador, operaciones, soporte, finanzas y marketing.
- Dashboard en vivo: KPIs (pedidos, activos, entregados, GMV, comisión estimada, incidencias), distribución por estado y alertas.
- Módulo de Pedidos: filtros (estado/restaurante/búsqueda), panel de detalle (ítems, totales, historial de eventos) y acciones auditadas de incidencia y cancelación con motivo.
- Módulo de Repartidores: roster, actividad de entregas en vivo y aprobación/suspensión (demo).
- Módulo de Comisiones: tasa configurable y liquidación estimada por comercio.
- Módulo de Cupones: CRUD real en `localStorage` (`pe_coupons`).
- Módulo de Configuración: parámetros generales, matriz de permisos y reinicio de datos demo.
- Nuevos archivos: `assets/js/admin.js`, `assets/css/admin.css`, `admin/configuracion.html`.

### Cambiado
- `admin/*.html` reescritos para montar el nuevo shell; el login dejó de ser un enlace y ahora valida credenciales demo.

### Corregido
- El panel admin mostraba datos estáticos de `orders.json`; ahora refleja la operación real en vivo.

### Notas
- `assets/js/dashboard.js` quedó obsoleto (conservado, ya no se usa).
- Autenticación aún es demo (sin backend); se migra en la Fase 3.

## 2.0 — 23-08-2026

### Cliente

- Nuevo configurador de producto con variantes y complementos.
- Validación de grupos requeridos y máximos.
- Recargos y cantidades dinámicas.
- Indicaciones para restaurante.
- Carrito con líneas configurables.
- Checkout renovado.
- Generación demo de pedido y PIN.
- Seguimiento dinámico por estados.

### Restaurante

- Selector de restaurante demo.
- Dashboard conectado a pedidos locales.
- Gestión de estados: pendiente, aceptado, preparando y listo.
- Detalle de ítems, extras y notas.

### Repartidor

- Ofertas generadas a partir de pedidos listos.
- Asignación de repartidor demo.
- Recojo, camino y entrega.
- Validación de PIN.

### Documentación

- Ficha técnica general.
- Ficha técnica de Fase 2.
- Material de capacitación para clientes.
- Material de capacitación para restaurantes.
- Material de capacitación para repartidores.
- Notas acumulativas del manual de usuario.
- Índice de documentación viva.

## 1.0 — 23-08-2026

- Unificación del proyecto original.
- Separación de entradas para cliente, restaurante y repartidor.
- Rediseño visual inicial Pacha Eats.
