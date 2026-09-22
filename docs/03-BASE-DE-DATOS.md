# Base de datos — Pacha Eats (Fase 3.1)

Motor: **PostgreSQL + PostGIS** sobre Supabase.
Script fuente: `supabase/schema.sql` · Semilla: `supabase/seed_demo.sql`.

## Entidades

| Tabla | Rol | Notas |
|-------|-----|-------|
| `profiles` | Usuarios | 1:1 con `auth.users`. Campos: `role`, `status`, `full_name`, `email`, `phone`. Se crea por trigger al registrarse. |
| `restaurants` | Comercios | `owner_id`→profiles, `status` (PENDING/APPROVED/…), `location` (geography), `delivery_fee`, `commission_rate`, `is_demo`. |
| `categories` | Marketplace | Categorías globales para el home. |
| `products` | Carta | `restaurant_id`, `modifier_groups` (jsonb), `available`, `is_demo`. |
| `addresses` | Direcciones | `profile_id`, `location` (geography), `is_default`. |
| `drivers` | Repartidores | 1:1 con profiles DRIVER. `availability`, `current_location`, `status`. |
| `orders` | Pedidos | `code` (PE-XXXXXX), `customer_id`, `restaurant_id`, `driver_id`, `status`, montos, `delivery_pin`, `delivery_location`. |
| `order_items` | Ítems | `order_id`, `modifiers` (jsonb). |
| `order_events` | Historial | Un registro por cambio de estado (actor + fecha). |
| `coupons` | Cupones | `code` único, `type` (PERCENT/FIXED), `value`, `active`. |

## Enums

- `user_role`: CLIENT, RESTAURANT, DRIVER, SUPERADMIN, ADMIN, OPERACIONES, SOPORTE, FINANZAS, MARKETING.
- `user_status`: ACTIVE, PENDING, SUSPENDED.
- `approval_status`: PENDING, APPROVED, SUSPENDED, REJECTED (restaurantes y repartidores).
- `order_status`: PENDING_RESTAURANT, ACCEPTED, PREPARING, READY, DRIVER_ASSIGNED, PICKED_UP, ON_THE_WAY, DELIVERED, CANCELLED, REJECTED.
- `payment_status`: PENDING, APPROVED, CASH_ON_DELIVERY, REFUNDED.
- `driver_availability`: ONLINE, OFFLINE, BUSY.

## Relaciones (resumen)

```
auth.users 1─1 profiles 1─1 drivers
profiles 1─* restaurants 1─* products
profiles 1─* addresses
profiles(cliente) 1─* orders *─1 restaurants
orders 1─* order_items
orders 1─* order_events
orders *─1 profiles(driver)
```

## Triggers y funciones

- `handle_new_user()` — crea `profiles` (y `drivers` si el rol es DRIVER) al insertarse en `auth.users`. El rol y datos vienen de `raw_user_meta_data`.
- `set_order_defaults()` — genera `code` (PE-XXXXXX) y `delivery_pin` al crear un pedido.
- `set_updated_at()` — mantiene `updated_at`.
- `nearest_drivers(location, max_km, limit)` — repartidores ONLINE+APPROVED dentro del radio, ordenados por distancia (PostGIS `ST_DWithin` / `<->`). Base de la asignación por cercanía.
- `wipe_demo_data()` — borra solo lo marcado como demo (solo superadmin).

## Seguridad (RLS)

RLS activado en todas las tablas. Resumen de políticas:

- **profiles:** cada quien ve/edita el suyo; el staff ve todos; el superadmin edita todos.
- **restaurants:** lectura pública solo de APPROVED; el dueño ve/edita el suyo; el staff, todos.
- **products:** lectura pública de disponibles; el dueño gestiona los suyos; el staff, todos.
- **addresses:** solo el dueño (o staff).
- **drivers:** el repartidor ve/edita el suyo; el staff, todos.
- **orders:** cliente ve los suyos; el restaurante los de su comercio; el repartidor los asignados y las ofertas READY sin asignar; el staff, todos.
- **order_items / order_events:** heredan la visibilidad del pedido.
- **coupons:** lectura pública de activos; escritura solo staff.

Funciones de rol (`my_role`, `is_staff`, `is_superadmin`) son `security definer` para evitar recursión en las políticas.

## Realtime

`orders` y `order_events` están publicadas en `supabase_realtime` para actualizar en vivo el estado del pedido y las ofertas a repartidores.

## Geolocalización

Las columnas `location` / `current_location` / `delivery_location` son `geography(Point,4326)`. Guardar con `ST_SetSRID(ST_MakePoint(lng,lat),4326)::geography`. Índices GiST para consultas por cercanía.
