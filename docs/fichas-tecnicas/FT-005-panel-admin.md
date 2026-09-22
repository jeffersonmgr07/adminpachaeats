# FT-005 · Panel administrativo

**Código:** FT-005
**Versión:** 2.1.0 · 21-09-2026
**Estado:** Implementado (demo, sobre store local en vivo)

## Objetivo

Dar al equipo de Pacha Eats una consola operativa conectada a la operación **real** de la demo (los mismos pedidos que generan cliente, restaurante y repartidor), con control de acceso por roles. Reemplaza al panel anterior, que mostraba datos estáticos de `assets/data/orders.json` y no reflejaba la operación viva.

## Usuarios involucrados

Roles del panel (RBAC): `SUPERADMIN`, `ADMIN`, `OPERACIONES`, `SOPORTE`, `FINANZAS`, `MARKETING`.

| Módulo | Roles con acceso |
|--------|------------------|
| Dashboard | Todos |
| Pedidos | Superadmin, Admin, Operaciones, Soporte |
| Repartidores | Superadmin, Admin, Operaciones |
| Comisiones | Superadmin, Admin, Finanzas |
| Cupones | Superadmin, Admin, Marketing |
| Configuración | Superadmin, Admin |

## Archivos y componentes

- `assets/js/admin.js` — módulo `Admin`: sesión, RBAC, shell, páginas, stores y acciones.
- `assets/css/admin.css` — estilos complementarios (reutiliza `portal.css`).
- `admin/login.html` — acceso demo por roles.
- `admin/index.html` — enruta a login o dashboard según sesión.
- `admin/{dashboard,pedidos,repartidores,comisiones,cupones,configuracion}.html` — montan el shell (`Admin.start('<módulo>')`).
- Depende de `assets/js/app.js` (objeto `PE`: store de pedidos y utilidades).

## Datos y almacenamiento (localStorage)

| Clave | Contenido |
|-------|-----------|
| `pe_admin_session` | Sesión activa `{email, name, role, at}`. |
| `pe_demo_orders_v2` | Pedidos en vivo (compartido con toda la plataforma; propiedad de `PE`). |
| `pe_coupons` | Cupones `{id, code, type, value, minSubtotal, maxRedemptions, redeemed, expiresAt, active, createdAt}`. |
| `pe_admin_config` | `{commissionRate, serviceFeeRate, coverageNote}`. |
| `pe_admin_riders` | Overlay de aprobación de repartidores. |

## Reglas de negocio

- **Comisión** = `subtotal × commissionRate` sobre pedidos `DELIVERED`. Neto al comercio = `subtotal − comisión`. GMV incluye delivery.
- **Cancelación** (admin): pasa el pedido a `CANCELLED`, guarda `cancelReason`/`cancelBy` y añade un evento `actor=ADMIN` al historial. No permitido en estados finales.
- **Incidencia**: no cambia el estado del ciclo; agrega a `order.incidences[]`, marca `hasIncidence` y registra evento `INCIDENCIA`.
- **Cupón**: código único en mayúsculas; `PERCENT` ≤ 100; estados derivados: Activo / Inactivo / Expirado / Agotado.

## Estados de pedido considerados

`PENDING_RESTAURANT, ACCEPTED, PREPARING, READY, DRIVER_ASSIGNED, PICKED_UP, ON_THE_WAY, DELIVERED, CANCELLED` (+ `INCIDENCIA` como marca, `REJECTED` soportado en etiquetas).

## Validaciones

- Guard de sesión en cada página; sin sesión → redirige a `login.html`.
- Chequeo de permiso por módulo; rol sin acceso → pantalla "Sin permiso".
- Formularios: motivo obligatorio en incidencia/cancelación; validación de código/valor en cupones; rango 0–60% en comisión.

## Seguridad (limitaciones actuales)

- Autenticación **demo**: usuarios y contraseñas en el frontend, sesión solo en el navegador. **No es productivo**; se sustituye por Apps Script (login + RBAC en backend) en la Fase 3.
- Sin persistencia servidor: los datos viven en el navegador del usuario.

## Funcionalidades implementadas

- Login por roles, RBAC, dashboard en vivo, gestión de pedidos con detalle y acciones auditadas, repartidores, comisiones configurables, CRUD de cupones y configuración.

## Funcionalidades pendientes

- Consumo de cupones en el checkout del cliente.
- Backend real (autenticación, persistencia, RBAC server-side).
- Exportación de reportes y módulo de soporte/incidencias dedicado.

## Criterios de aceptación (verificados)

- [x] Un pedido creado por el cliente aparece en vivo en el dashboard y en Pedidos del admin.
- [x] Filtrar pedidos por estado, restaurante y texto.
- [x] Abrir el detalle de un pedido con ítems, totales e historial.
- [x] Registrar una incidencia (persiste con evento).
- [x] Cancelar un pedido con motivo (persiste con evento `ADMIN`).
- [x] Crear, activar/desactivar, editar y eliminar cupones.
- [x] Cambiar la tasa de comisión y ver la liquidación recalculada.
- [x] Un rol sin permiso no ve el módulo ni puede entrar por URL.
- [x] Sin sesión, las páginas redirigen al login.

## Cómo probar

Ver README → "Consola administrativa".
