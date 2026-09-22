-- =====================================================================
-- Pacha Eats — Esquema de base de datos (Fase 3.1)
-- Postgres + PostGIS sobre Supabase.
-- Ejecutar en: Supabase → SQL Editor → pegar y "Run".
-- Idempotente donde es posible. Requiere permisos de owner (los tiene
-- el editor SQL de Supabase).
-- =====================================================================

-- ---------- Extensiones ----------
create extension if not exists "uuid-ossp";
create extension if not exists postgis;

-- =====================================================================
-- 1) TIPOS (enums)
-- =====================================================================
do $$ begin
  create type user_role as enum
    ('CLIENT','RESTAURANT','DRIVER','SUPERADMIN','ADMIN','OPERACIONES','SOPORTE','FINANZAS','MARKETING');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_status as enum ('ACTIVE','PENDING','SUSPENDED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type approval_status as enum ('PENDING','APPROVED','SUSPENDED','REJECTED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum
    ('PENDING_RESTAURANT','ACCEPTED','PREPARING','READY','DRIVER_ASSIGNED',
     'PICKED_UP','ON_THE_WAY','DELIVERED','CANCELLED','REJECTED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('PENDING','APPROVED','CASH_ON_DELIVERY','REFUNDED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type driver_availability as enum ('ONLINE','OFFLINE','BUSY');
exception when duplicate_object then null; end $$;

-- =====================================================================
-- 2) FUNCIONES AUXILIARES (helpers de rol, security definer)
--    SECURITY DEFINER + owner postgres => evitan recursión en RLS.
-- =====================================================================
create or replace function public.my_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select role in ('SUPERADMIN','ADMIN','OPERACIONES','SOPORTE','FINANZAS','MARKETING')
       from public.profiles where id = auth.uid()), false)
$$;

create or replace function public.is_superadmin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'SUPERADMIN' from public.profiles where id = auth.uid()), false)
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- =====================================================================
-- 3) TABLAS
-- =====================================================================

-- 3.1 Perfiles (1:1 con auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        user_role   not null default 'CLIENT',
  status      user_status not null default 'ACTIVE',
  full_name   text        not null default '',
  email       text,
  phone       text        default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_profiles_role on public.profiles(role);

-- 3.2 Restaurantes / comercios
create table if not exists public.restaurants (
  id              uuid primary key default uuid_generate_v4(),
  owner_id        uuid references public.profiles(id) on delete set null,
  name            text not null,
  slug            text unique,
  category        text default '',
  description     text default '',
  logo_url        text default '',
  cover_url       text default '',
  address         text default '',
  district        text default '',
  location        geography(Point,4326),
  phone           text default '',
  delivery_fee    numeric(10,2) not null default 6.00,
  commission_rate numeric(5,4)  not null default 0.15,
  rating          numeric(3,2)  default 0,
  status          approval_status not null default 'PENDING',
  is_open         boolean not null default true,
  is_demo         boolean not null default false,
  schedule        jsonb default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_restaurants_owner  on public.restaurants(owner_id);
create index if not exists idx_restaurants_status on public.restaurants(status);
create index if not exists idx_restaurants_geo    on public.restaurants using gist(location);

-- 3.3 Categorías globales (para el marketplace)
create table if not exists public.categories (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  image_url  text default '',
  sort       int  default 0,
  is_demo    boolean not null default false
);

-- 3.4 Productos
create table if not exists public.products (
  id             uuid primary key default uuid_generate_v4(),
  restaurant_id  uuid not null references public.restaurants(id) on delete cascade,
  name           text not null,
  category       text default '',
  description    text default '',
  price          numeric(10,2) not null default 0,
  before_price   numeric(10,2),
  image_url      text default '',
  available      boolean not null default true,
  prime_deal     boolean not null default false,
  modifier_groups jsonb default '[]'::jsonb,
  sort           int default 0,
  is_demo        boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists idx_products_restaurant on public.products(restaurant_id);

-- 3.5 Direcciones del cliente
create table if not exists public.addresses (
  id          uuid primary key default uuid_generate_v4(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  label       text default 'Casa',
  address     text not null,
  reference   text default '',
  district    text default '',
  location    geography(Point,4326),
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists idx_addresses_profile on public.addresses(profile_id);

-- 3.6 Repartidores (1:1 con profiles de rol DRIVER)
create table if not exists public.drivers (
  id               uuid primary key references public.profiles(id) on delete cascade,
  vehicle_type     text default 'Moto',
  plate            text default '',
  status           approval_status not null default 'PENDING',
  availability     driver_availability not null default 'OFFLINE',
  current_location geography(Point,4326),
  last_seen        timestamptz,
  rating           numeric(3,2) default 0,
  is_demo          boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists idx_drivers_geo on public.drivers using gist(current_location);
create index if not exists idx_drivers_avail on public.drivers(availability, status);

-- 3.7 Pedidos
create table if not exists public.orders (
  id               uuid primary key default uuid_generate_v4(),
  code             text unique,
  customer_id      uuid references public.profiles(id) on delete set null,
  restaurant_id    uuid not null references public.restaurants(id),
  driver_id        uuid references public.profiles(id) on delete set null,
  status           order_status   not null default 'PENDING_RESTAURANT',
  payment_status   payment_status not null default 'PENDING',
  payment_method   text default 'MERCADO_PAGO_DEMO',
  receipt_type     text default 'BOLETA',
  customer_name    text default '',
  customer_phone   text default '',
  address          text default '',
  reference        text default '',
  delivery_notes   text default '',
  delivery_location geography(Point,4326),
  subtotal         numeric(10,2) not null default 0,
  delivery_fee     numeric(10,2) not null default 0,
  service_fee      numeric(10,2) not null default 0,
  total            numeric(10,2) not null default 0,
  commission_amount numeric(10,2) default 0,
  cashback_estimate numeric(10,2) default 0,
  distance_km      numeric(6,2) default 0,
  delivery_pin     text,
  coupon_code      text,
  discount         numeric(10,2) default 0,
  has_incidence    boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists idx_orders_customer   on public.orders(customer_id);
create index if not exists idx_orders_restaurant on public.orders(restaurant_id);
create index if not exists idx_orders_driver     on public.orders(driver_id);
create index if not exists idx_orders_status     on public.orders(status);

-- 3.8 Ítems del pedido
create table if not exists public.order_items (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid references public.products(id) on delete set null,
  name        text not null,
  qty         int  not null default 1,
  base_price  numeric(10,2) not null default 0,
  unit_price  numeric(10,2) not null default 0,
  line_total  numeric(10,2) not null default 0,
  modifiers   jsonb default '[]'::jsonb,
  note        text default ''
);
create index if not exists idx_order_items_order on public.order_items(order_id);

-- 3.9 Historial de estados / eventos del pedido
create table if not exists public.order_events (
  id         uuid primary key default uuid_generate_v4(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  status     order_status,
  label      text,
  actor      text default 'SYSTEM',
  actor_id   uuid,
  note       text default '',
  created_at timestamptz not null default now()
);
create index if not exists idx_order_events_order on public.order_events(order_id);

-- 3.10 Cupones
create table if not exists public.coupons (
  id              uuid primary key default uuid_generate_v4(),
  code            text unique not null,
  type            text not null default 'PERCENT',      -- PERCENT | FIXED
  value           numeric(10,2) not null default 0,
  min_subtotal    numeric(10,2) not null default 0,
  max_redemptions int not null default 0,               -- 0 = ilimitado
  redeemed        int not null default 0,
  active          boolean not null default true,
  expires_at      date,
  created_at      timestamptz not null default now()
);

-- =====================================================================
-- 4) TRIGGERS
-- =====================================================================

-- 4.1 Al crear un usuario en auth.users → crear su perfil (y driver shell)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_role user_role := coalesce((new.raw_user_meta_data->>'role')::user_role, 'CLIENT');
begin
  insert into public.profiles (id, email, full_name, phone, role, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name',''),
    coalesce(new.raw_user_meta_data->>'phone',''),
    v_role,
    case when v_role in ('RESTAURANT','DRIVER') then 'PENDING' else 'ACTIVE' end
  )
  on conflict (id) do nothing;

  if v_role = 'DRIVER' then
    insert into public.drivers (id, vehicle_type, plate, status, availability)
    values (new.id,
            coalesce(new.raw_user_meta_data->>'vehicle_type','Moto'),
            coalesce(new.raw_user_meta_data->>'plate',''),
            'PENDING','OFFLINE')
    on conflict (id) do nothing;
  end if;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4.2 Código de pedido + PIN automáticos
create or replace function public.set_order_defaults()
returns trigger language plpgsql as $$
begin
  if new.code is null then
    new.code := 'PE-' || lpad((floor(random()*900000)+100000)::text, 6, '0');
  end if;
  if new.delivery_pin is null then
    new.delivery_pin := lpad((floor(random()*9000)+1000)::text, 4, '0');
  end if;
  return new;
end $$;

drop trigger if exists trg_order_defaults on public.orders;
create trigger trg_order_defaults
  before insert on public.orders
  for each row execute function public.set_order_defaults();

-- 4.3 updated_at automático
drop trigger if exists trg_restaurants_updated on public.restaurants;
create trigger trg_restaurants_updated before update on public.restaurants
  for each row execute function public.set_updated_at();
drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated before update on public.products
  for each row execute function public.set_updated_at();
drop trigger if exists trg_orders_updated on public.orders;
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.set_updated_at();
drop trigger if exists trg_drivers_updated on public.drivers;
create trigger trg_drivers_updated before update on public.drivers
  for each row execute function public.set_updated_at();
drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- =====================================================================
-- 5) GEO: repartidores más cercanos a un punto
--    Devuelve repartidores ONLINE+APPROVED dentro de p_max_km, ordenados
--    por distancia (línea recta / Haversine vía PostGIS).
-- =====================================================================
create or replace function public.nearest_drivers(
  p_location geography,
  p_max_km   numeric default 8,
  p_limit    int default 5
)
returns table(driver_id uuid, full_name text, distance_km numeric, availability driver_availability)
language sql stable security definer set search_path = public as $$
  select d.id,
         p.full_name,
         round((ST_Distance(d.current_location, p_location) / 1000.0)::numeric, 2) as distance_km,
         d.availability
  from public.drivers d
  join public.profiles p on p.id = d.id
  where d.status = 'APPROVED'
    and d.availability = 'ONLINE'
    and d.current_location is not null
    and ST_DWithin(d.current_location, p_location, p_max_km * 1000)
  order by d.current_location <-> p_location
  limit p_limit;
$$;

-- =====================================================================
-- 6) RLS (Row Level Security)
--    Habilitado en todas las tablas. Políticas por rol.
-- =====================================================================
alter table public.profiles     enable row level security;
alter table public.restaurants  enable row level security;
alter table public.categories   enable row level security;
alter table public.products     enable row level security;
alter table public.addresses    enable row level security;
alter table public.drivers      enable row level security;
alter table public.orders       enable row level security;
alter table public.order_items  enable row level security;
alter table public.order_events enable row level security;
alter table public.coupons      enable row level security;

-- ---- profiles ----
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles for select
  using (id = auth.uid() or public.is_staff());
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update
  using (id = auth.uid() or public.is_superadmin());
drop policy if exists profiles_staff_all on public.profiles;
create policy profiles_staff_all on public.profiles for all
  using (public.is_superadmin()) with check (public.is_superadmin());

-- ---- restaurants ----
drop policy if exists restaurants_public_read on public.restaurants;
create policy restaurants_public_read on public.restaurants for select
  using (status = 'APPROVED' or owner_id = auth.uid() or public.is_staff());
drop policy if exists restaurants_owner_insert on public.restaurants;
create policy restaurants_owner_insert on public.restaurants for insert
  with check (owner_id = auth.uid() or public.is_staff());
drop policy if exists restaurants_owner_update on public.restaurants;
create policy restaurants_owner_update on public.restaurants for update
  using (owner_id = auth.uid() or public.is_staff())
  with check (owner_id = auth.uid() or public.is_staff());
drop policy if exists restaurants_staff_delete on public.restaurants;
create policy restaurants_staff_delete on public.restaurants for delete
  using (public.is_staff());

-- ---- categories (lectura pública, escritura staff) ----
drop policy if exists categories_read on public.categories;
create policy categories_read on public.categories for select using (true);
drop policy if exists categories_staff_write on public.categories;
create policy categories_staff_write on public.categories for all
  using (public.is_staff()) with check (public.is_staff());

-- ---- products ----
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select
  using (
    available
    or public.is_staff()
    or exists (select 1 from public.restaurants r where r.id = products.restaurant_id and r.owner_id = auth.uid())
  );
drop policy if exists products_owner_write on public.products;
create policy products_owner_write on public.products for all
  using (
    public.is_staff()
    or exists (select 1 from public.restaurants r where r.id = products.restaurant_id and r.owner_id = auth.uid())
  )
  with check (
    public.is_staff()
    or exists (select 1 from public.restaurants r where r.id = products.restaurant_id and r.owner_id = auth.uid())
  );

-- ---- addresses ----
drop policy if exists addresses_owner_all on public.addresses;
create policy addresses_owner_all on public.addresses for all
  using (profile_id = auth.uid() or public.is_staff())
  with check (profile_id = auth.uid() or public.is_staff());

-- ---- drivers ----
drop policy if exists drivers_self_read on public.drivers;
create policy drivers_self_read on public.drivers for select
  using (id = auth.uid() or public.is_staff());
drop policy if exists drivers_self_update on public.drivers;
create policy drivers_self_update on public.drivers for update
  using (id = auth.uid() or public.is_staff())
  with check (id = auth.uid() or public.is_staff());
drop policy if exists drivers_staff_all on public.drivers;
create policy drivers_staff_all on public.drivers for all
  using (public.is_staff()) with check (public.is_staff());

-- ---- orders ----
drop policy if exists orders_visibility on public.orders;
create policy orders_visibility on public.orders for select
  using (
    customer_id = auth.uid()
    or driver_id = auth.uid()
    or public.is_staff()
    or exists (select 1 from public.restaurants r where r.id = orders.restaurant_id and r.owner_id = auth.uid())
    -- repartidores ONLINE pueden ver ofertas: pedidos READY sin repartidor
    or (status = 'READY' and driver_id is null and public.my_role() = 'DRIVER')
  );
drop policy if exists orders_customer_insert on public.orders;
create policy orders_customer_insert on public.orders for insert
  with check (customer_id = auth.uid() or public.is_staff());
drop policy if exists orders_update on public.orders;
create policy orders_update on public.orders for update
  using (
    public.is_staff()
    or driver_id = auth.uid()
    or (status = 'READY' and driver_id is null and public.my_role() = 'DRIVER')  -- aceptar oferta
    or exists (select 1 from public.restaurants r where r.id = orders.restaurant_id and r.owner_id = auth.uid())
  );

-- ---- order_items (siguen la visibilidad del pedido padre) ----
drop policy if exists order_items_read on public.order_items;
create policy order_items_read on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_items.order_id));
drop policy if exists order_items_write on public.order_items;
create policy order_items_write on public.order_items for all
  using (
    public.is_staff()
    or exists (select 1 from public.orders o where o.id = order_items.order_id and o.customer_id = auth.uid())
  )
  with check (
    public.is_staff()
    or exists (select 1 from public.orders o where o.id = order_items.order_id and o.customer_id = auth.uid())
  );

-- ---- order_events ----
drop policy if exists order_events_read on public.order_events;
create policy order_events_read on public.order_events for select
  using (exists (select 1 from public.orders o where o.id = order_events.order_id));
drop policy if exists order_events_insert on public.order_events;
create policy order_events_insert on public.order_events for insert
  with check (
    public.is_staff()
    or exists (select 1 from public.orders o where o.id = order_events.order_id
               and (o.customer_id = auth.uid() or o.driver_id = auth.uid()
                    or exists (select 1 from public.restaurants r where r.id = o.restaurant_id and r.owner_id = auth.uid())))
  );

-- ---- coupons ----
drop policy if exists coupons_public_read on public.coupons;
create policy coupons_public_read on public.coupons for select
  using (active or public.is_staff());
drop policy if exists coupons_staff_write on public.coupons;
create policy coupons_staff_write on public.coupons for all
  using (public.is_staff()) with check (public.is_staff());

-- =====================================================================
-- 7) REALTIME (para estado de pedido y ofertas a repartidores)
-- =====================================================================
do $$ begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.order_events;
exception when duplicate_object then null; when undefined_object then null; end $$;

-- =====================================================================
-- FIN DEL ESQUEMA
-- =====================================================================
