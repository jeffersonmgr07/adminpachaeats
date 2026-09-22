# Changelog — Pacha Eats

## 2.2.0 — 22-09-2026

### Añadido — Fundación del backend real (Fase 3.1 · Supabase)
- Esquema completo de base de datos en `supabase/schema.sql`: 10 tablas (profiles, restaurants, categories, products, addresses, drivers, orders, order_items, order_events, coupons), enums de dominio, PostGIS para ubicaciones, triggers (perfil al registrarse, código/PIN de pedido, updated_at), función `nearest_drivers()` para asignación por cercanía, y políticas RLS por rol.
- Semilla demo borrable en `supabase/seed_demo.sql` (todo marcado como demo + `wipe_demo_data()`).
- Capa de autenticación en el frontend: `assets/js/pe-config.js`, `assets/js/supabase-client.js` y `assets/js/auth.js` (registro/login/logout/sesión/ruteo por rol), **config-gated**: sin claves, el sitio sigue en modo demo.
- Login y registro reales (Supabase Auth) para cliente, restaurante y repartidor. El registro de restaurante crea también su ficha en estado PENDING; el de repartidor crea su ficha de repartidor.
- Guía `docs/08-INSTALACION-SUPABASE.md` y modelo `docs/03-BASE-DE-DATOS.md`.

### Cambiado
- `clientes/login.html`, `restaurantes/login.html`, `repartidores/login.html` y los `registro.html` reescritos como páginas de auth reales (con fallback a demo). Nueva `clientes/registro.html`.

### Notas
- El marketplace del cliente y el panel admin todavía leen el store demo; su migración a Supabase es la Fase 3.3. La validación en vivo del backend se realiza al desplegar con las claves del proyecto.

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
