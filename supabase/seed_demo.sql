-- =====================================================================
-- Pacha Eats — Semilla de DEMO (borrable)
-- Ejecutar DESPUÉS de schema.sql en el SQL Editor de Supabase.
-- Todo lo insertado aquí lleva is_demo=true (o código DEMO*) para poder
-- eliminarlo de una sola pasada cuando entren los comercios reales:
--   select public.wipe_demo_data();
-- =====================================================================

-- ---------- Categorías del marketplace ----------
insert into public.categories (name, image_url, sort, is_demo) values
  ('Pollos',        'assets/img/categorias/Familiares.png', 1, true),
  ('Hamburguesas',  'assets/img/categorias/Hamburguesas.png', 2, true),
  ('Alitas',        'assets/img/categorias/Alitas.png', 3, true),
  ('Chifa',         'assets/img/categorias/Duos.png', 4, true),
  ('Familiares',    'assets/img/categorias/Familiares.png', 5, true),
  ('Postres',       'assets/img/categorias/Banquetes.png', 6, true),
  ('Promociones',   'assets/img/categorias/Promociones.png', 7, true)
on conflict do nothing;

-- ---------- Restaurantes demo (owner_id NULL: sin dueño real todavía) ----------
-- UUIDs fijos para poder referenciarlos desde productos.
insert into public.restaurants
  (id, owner_id, name, slug, category, description, logo_url, cover_url, address, district, location, delivery_fee, commission_rate, rating, status, is_open, is_demo, schedule)
values
  ('a0000000-0000-4000-8000-000000000001', null, 'Qori Chicken', 'qori-chicken', 'Pollos a la brasa',
   'Pollo a la brasa y parrillas de la casa.', 'assets/img/logos/restaurantes/Qori Chicken.png',
   'assets/img/banners/Banner1.png', 'Av. Pachacútec 120, Pachacámac', 'Pachacámac',
   ST_SetSRID(ST_MakePoint(-76.8556, -12.2286), 4326)::geography, 6.00, 0.15, 4.8, 'APPROVED', true, true,
   '{"mon_fri":"11:00 - 22:30","sat_sun":"10:30 - 23:00"}'::jsonb),
  ('a0000000-0000-4000-8000-000000000002', null, 'Pacha Wok', 'pacha-wok', 'Chifa y oriental',
   'Chifa, salteados y combos orientales.', 'assets/img/logos/restaurantes/Pacha Wok.png',
   'assets/img/banners/Banner2.png', 'Zona Casablanca, Pachacámac', 'Pachacámac',
   ST_SetSRID(ST_MakePoint(-76.8601, -12.2244), 4326)::geography, 5.50, 0.15, 4.7, 'APPROVED', true, true,
   '{"mon_fri":"12:00 - 22:00","sat_sun":"12:00 - 23:00"}'::jsonb),
  ('a0000000-0000-4000-8000-000000000003', null, 'Jijuna''s', 'jijunas', 'Alitas y costillas',
   'Alitas, costillas y salsas de autor.', 'assets/img/logos/restaurantes/Jijunas.png',
   'assets/img/banners/Banner3.png', 'Centro de Pachacámac', 'Pachacámac',
   ST_SetSRID(ST_MakePoint(-76.8523, -12.2311), 4326)::geography, 7.00, 0.15, 4.9, 'APPROVED', true, true,
   '{"mon_fri":"16:00 - 23:00","sat_sun":"13:00 - 23:30"}'::jsonb)
on conflict (id) do nothing;

-- ---------- Productos demo ----------
insert into public.products
  (restaurant_id, name, category, description, price, before_price, image_url, available, prime_deal, modifier_groups, is_demo)
values
  ('a0000000-0000-4000-8000-000000000001', '1/4 pollo a la brasa', 'Pollos',
   'Con papas crocantes, ensalada y cremas de la casa.', 18.90, 22.90,
   'assets/img/categorias/Familiares.png', true, true,
   '[{"id":"cremas","name":"Elige tus cremas","min":1,"max":3,"options":[{"id":"aji","name":"Ají de la casa","price":0},{"id":"mayonesa","name":"Mayonesa","price":0},{"id":"ketchup","name":"Ketchup","price":0},{"id":"rocoto","name":"Rocoto","price":0}]},{"id":"extra-papas","name":"¿Agrandar papas?","min":0,"max":1,"options":[{"id":"regular","name":"Regular","price":0},{"id":"grande","name":"Papas grandes","price":5.0}]}]'::jsonb,
   true),
  ('a0000000-0000-4000-8000-000000000001', 'Combo familiar Qori', 'Familiares',
   'Pollo entero + papas familiares + gaseosa 1.5L.', 59.90, 72.00,
   'assets/img/categorias/Banquetes.png', true, true, '[]'::jsonb, true),
  ('a0000000-0000-4000-8000-000000000002', 'Chijaukay', 'Chifa',
   'Pollo apanado en salsa oriental con arroz chaufa.', 24.90, null,
   'assets/img/productos/pacha-wok/Chijaukay.jpg', true, false, '[]'::jsonb, true),
  ('a0000000-0000-4000-8000-000000000002', 'Combo chifa dúo', 'Chifa',
   'Dos platos a elección + wantanes + gaseosa.', 39.90, 46.00,
   'assets/img/categorias/Duos.png', true, true, '[]'::jsonb, true),
  ('a0000000-0000-4000-8000-000000000003', 'Alitas BBQ x12', 'Alitas',
   'Doce alitas bañadas en salsa BBQ con papas.', 32.90, 38.00,
   'assets/img/productos/jijunas/Alitas BBQ.jpg', true, true, '[]'::jsonb, true),
  ('a0000000-0000-4000-8000-000000000003', 'Costillitas Hot BBQ', 'Alitas',
   'Costillas glaseadas picantes con papas rústicas.', 36.90, null,
   'assets/img/productos/jijunas/Costillitas Hot BBQ.jpg', true, false, '[]'::jsonb, true)
on conflict do nothing;

-- ---------- Cupones demo (se identifican por el prefijo DEMO) ----------
insert into public.coupons (code, type, value, min_subtotal, max_redemptions, active) values
  ('DEMO10',    'PERCENT', 10, 35, 0, true),
  ('DEMOENVIO', 'FIXED',    6, 40, 0, true)
on conflict (code) do nothing;

-- =====================================================================
-- LIMPIEZA: borra SOLO lo demo. Ejecuta cuando entren datos reales.
--   select public.wipe_demo_data();
-- =====================================================================
create or replace function public.wipe_demo_data()
returns text language plpgsql security definer set search_path = public as $$
declare n_prod int; n_rest int; n_cat int; n_cup int;
begin
  if not public.is_superadmin() then
    raise exception 'Solo el superadmin puede limpiar los datos demo.';
  end if;
  delete from public.products   where is_demo; get diagnostics n_prod = row_count;
  delete from public.restaurants where is_demo; get diagnostics n_rest = row_count;
  delete from public.categories where is_demo; get diagnostics n_cat = row_count;
  delete from public.coupons    where code like 'DEMO%'; get diagnostics n_cup = row_count;
  return format('Demo eliminado: %s productos, %s restaurantes, %s categorías, %s cupones.',
                n_prod, n_rest, n_cat, n_cup);
end $$;
