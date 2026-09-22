# Estado del proyecto — Pacha Eats

> Situación real y verificada del desarrollo. Última actualización: **21-09-2026**.
> Regla: no se marca como *Completado* nada que solo esté maquetado o simulado sin lógica real.

## Arquitectura vigente

- **Frontend activo:** sitio estático (HTML + CSS + JavaScript vanilla), desplegable en GitHub Pages sin build.
- **Estado compartido demo:** `localStorage` (clave `pe_demo_orders_v2`) sincroniza pedidos entre cliente, restaurante, repartidor y **admin** en el mismo navegador/origen.
- **Catálogo:** `assets/data/*.json`.
- **Backend real (Fase 3): Supabase** (Postgres + Auth + Realtime + Storage + PostGIS) — **elegido**. La fundación (esquema + auth) ya está construida; se activa poniendo las claves en `assets/js/pe-config.js` (ver `docs/08-INSTALACION-SUPABASE.md`). Sin claves, el sitio sigue en modo demo.
- **Legado:** `appscript-backend/` y `apps-script/` (Apps Script) quedan como referencia, no se usan.
- **Pista paralela experimental:** `frontend/` (React + Vite). No integrada con la operación; mantener como experimento, no como producción.

## Completado (verificado en código y/o pruebas)

### Cliente
- Home con hero, categorías, filtros y búsqueda.
- Modal configurador de producto con variantes/extras (`modifierGroups`, validación `min`/`max`).
- Carrito de un solo comercio, persistente.
- Checkout que crea pedido real (`PE-XXXXXX` + PIN de entrega).
- Seguimiento dinámico del pedido por estados.

### Restaurante (portal demo)
- Login demo (selección de restaurante) y dashboard.
- Flujo `PENDING_RESTAURANT → ACCEPTED → PREPARING → READY` sobre pedidos reales del cliente.

### Repartidor (portal demo)
- Ofertas de pedidos `READY`, aceptación, `PICKED_UP → ON_THE_WAY → DELIVERED` con validación por PIN.
- Ganancias e historial demo.

### Panel administrativo — **v2.1.0 (nuevo)** ✅
Consola conectada al **mismo store de pedidos en vivo** (antes leía datos estáticos):
- **Login demo por roles** (superadmin, operaciones, soporte, finanzas, marketing) con protección de rutas.
- **RBAC**: el menú y el acceso a cada módulo dependen del rol.
- **Dashboard en vivo**: KPIs (pedidos, activos, entregados, GMV, comisión estimada, incidencias), distribución por estado y alertas operativas.
- **Pedidos**: listado en vivo con filtros (estado, restaurante, búsqueda), panel de detalle (ítems, totales, historial de eventos) y **acciones auditadas**: registrar incidencia y cancelar con motivo (queda en el historial del pedido).
- **Repartidores**: roster + actividad de entregas en vivo + aprobación/suspensión (demo local).
- **Comisiones**: tasa configurable y liquidación estimada por comercio sobre pedidos entregados.
- **Cupones**: CRUD real en `localStorage` (`pe_coupons`), con estados (activo/inactivo/expirado/agotado).
- **Configuración**: parámetros generales, matriz de permisos y reinicio de datos demo.

**Validación:** 17/17 pruebas automatizadas (Chromium headless / Playwright): creación de pedido desde el cliente visible en vivo en el admin, incidencia y cancelación persistidas con evento auditado, CRUD de cupones, cambio de tasa de comisión y bloqueo RBAC por rol. Sin errores de consola en las páginas del admin.

### Backend real — Fase 3.1 (Supabase) — **v2.2.0 (nuevo)** ✅
Fundación construida (activa al poner las claves en `pe-config.js`):
- **Esquema completo** (`supabase/schema.sql`): 10 tablas, enums de dominio, PostGIS, triggers, `nearest_drivers()` y RLS por rol. Semilla demo borrable.
- **Auth real** (Supabase Auth) con registro/login/ruteo por rol para **cliente, restaurante y repartidor**. El registro de restaurante crea su ficha PENDING; el de repartidor su ficha de repartidor.
- **Config-gated:** sin claves, el sitio sigue en modo demo sin romperse.

**Validación:** estructura SQL verificada (10 tablas, 24 políticas, 7 funciones, 7 triggers, 14 índices); JS `node --check`; modo demo 11/11 sin errores; lógica de `auth.js` 7/7 contra un mock de supabase-js. La validación *en vivo* del backend la realiza el usuario al desplegar con sus claves.

## En desarrollo

- Fase 3.1 entregada; pendiente que el usuario cree el proyecto Supabase y conecte las claves (guía en `docs/08-INSTALACION-SUPABASE.md`).

## Siguiente (recomendado, por dependencia técnica)

1. **F3.3 — Lectura real en la app**: que el marketplace del cliente y el panel admin lean de Supabase (hoy usan el store demo). Al terminar, un restaurante registrado y aprobado aparece en la web.
2. **F3.2 — Onboarding de comercios**: carta/perfil editable y fotos (Storage), aprobación desde el panel.
3. **F3.4 — Repartidores + cercanía**: online/posición + ofertas escalonadas por distancia + notificaciones (Realtime).

## Backlog

- Pagos (Mercado Pago Checkout Pro, Yape/Plin), webhooks y conciliación (Fase 4).
- Geolocalización, zonas de cobertura, asignación por distancia y tracking en mapa (Fase 5).
- Notificaciones push reales, soporte/incidencias como módulo, reportes descargables.

## Errores conocidos

| Sev. | Descripción | Reproducción | Estado |
|------|-------------|--------------|--------|
| BAJO | Banners del hero del **home del cliente** dan 404 (`/assets/css/assets/img/banners/Banner*.png`). El navegador resuelve el `url()` de la variable `--hero` relativo a `styles.css` en lugar del documento. | Abrir `index.html` con la consola abierta. | Abierto (fuera del alcance de v2.1.0; no afecta al admin). |
| BAJO | Duplicación de assets: existe `img/` en la raíz además de `assets/img/`. | — | Abierto (deuda). |

## Deuda técnica

- **`assets/js/dashboard.js`** quedó obsoleto: el admin ya no lo usa. Conservado para no romper referencias externas; candidato a eliminar en una limpieza autorizada.
- **HTML grandes por restaurante** (`Jijunas.html`, `PachaWok.html`, `QoriChicken.html`, 70–78 KB) duplican el flujo data-driven de `restaurante.html?id=`. Definir si son la carta "rica" oficial o legado a retirar.
- **Dos backends Apps Script** en paralelo (`apps-script/` y `appscript-backend/`): elegir uno canónico antes de la Fase 3.
- **`frontend/` React** con dependencias en `"latest"` (frágil); decidir si se mantiene o archiva.
- **Autenticación**: todos los logins son demo (sin backend). El del admin además guarda la sesión solo en el navegador.
