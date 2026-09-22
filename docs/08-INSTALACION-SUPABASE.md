# Instalación — Backend Supabase (Fase 3.1)

Guía paso a paso para activar el backend real (login, usuarios y base de datos).
Tiempo estimado: 15–20 minutos. No requiere tarjeta.

> Mientras no completes estos pasos, el sitio sigue funcionando en **modo demo**
> (localStorage), sin romperse.

---

## 1. Crear el proyecto en Supabase

1. Entra a <https://supabase.com> → **Start your project** → inicia sesión con GitHub o correo.
2. **New project**:
   - **Name:** `pacha-eats`
   - **Database Password:** genera una fuerte y **guárdala**.
   - **Region:** *South America (São Paulo)* (la más cercana a Perú).
3. Espera 1–2 min a que se aprovisione.

## 2. Crear las tablas y la semilla

1. En el menú lateral: **SQL Editor** → **New query**.
2. Copia y pega **todo** el contenido de `supabase/schema.sql` → **Run**.
   Debe decir *Success*. (Crea tablas, PostGIS, funciones, triggers y políticas RLS.)
3. Nueva query → pega `supabase/seed_demo.sql` → **Run** (restaurantes/productos de prueba).

## 3. Copiar tus llaves

1. **Project Settings** (engranaje) → **API**.
2. Copia:
   - **Project URL** → p. ej. `https://xxxxxxxx.supabase.co`
   - **anon public** (la llave `anon`, NO la `service_role`).

> La llave **anon** es pública por diseño: la seguridad la dan las políticas RLS.
> La **service_role** es secreta: NO la pongas en el frontend ni en el repo.

## 4. Conectar el frontend

Abre `assets/js/pe-config.js` y pega tus valores:

```js
window.PE_CONFIG = {
  SUPABASE_URL: 'https://xxxxxxxx.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOi...tu-anon-key...'
};
```

Con eso, `PE_BACKEND` pasa automáticamente a `'supabase'` y se activa el login real.

## 5. Ajustes de autenticación (para pruebas)

En **Authentication → Providers → Email**:

- Desactiva **Confirm email** (así los registros inician sesión al instante, sin
  esperar correo de confirmación). Puedes reactivarlo en producción.

En **Authentication → URL Configuration**:

- **Site URL:** la URL donde publicas el sitio (tu GitHub Pages, p. ej.
  `https://tuusuario.github.io/adminpachaeats/`). Para pruebas locales puedes
  agregar `http://localhost:8080` en *Redirect URLs*.

## 6. Crear tu SUPERADMIN (tú)

Los registros nuevos entran como `CLIENT`. Para convertirte en superadmin:

1. **Authentication → Users → Add user** → tu correo + contraseña → marca
   *Auto Confirm User*.
2. **SQL Editor** → ejecuta (con tu correo):

```sql
update public.profiles
set role = 'SUPERADMIN', status = 'ACTIVE'
where email = 'tucorreo@ejemplo.com';
```

## 7. Probar el circuito de cuentas

Publica el sitio (o sírvelo local) y prueba:

| Acción | Página | Resultado esperado |
|--------|--------|--------------------|
| Crear cliente | `clientes/registro.html` | Usuario nuevo en **Authentication → Users** y fila en `profiles` (role CLIENT). |
| Login cliente | `clientes/login.html` | Entra y te lleva al inicio. |
| Afiliar restaurante | `restaurantes/registro.html` | Fila en `profiles` (RESTAURANT, PENDING) y en `restaurants` (status PENDING). |
| Registrar repartidor | `repartidores/registro.html` | Fila en `profiles` (DRIVER, PENDING) y en `drivers` (PENDING). |

Verás todo en **Table Editor** de Supabase.

### Aprobar y gestionar usuarios (por ahora, vía SQL)

La gestión visual desde el panel admin llega en una fase siguiente. Mientras tanto:

```sql
-- Aprobar un restaurante
update public.restaurants set status='APPROVED' where name = 'Nombre del restaurante';

-- Aprobar un repartidor
update public.drivers set status='APPROVED'
where id = (select id from public.profiles where email='repartidor@correo.com');

-- Suspender / dar de baja un usuario
update public.profiles set status='SUSPENDED' where email='alguien@correo.com';

-- Promover personal interno (operaciones, finanzas, etc.)
update public.profiles set role='OPERACIONES' where email='staff@pachaeats.com';
```

### Probar "repartidor más cercano" (geolocalización)

```sql
-- Simula una posición para un repartidor aprobado y ONLINE
update public.drivers
set current_location = ST_SetSRID(ST_MakePoint(-76.8556,-12.2286),4326)::geography,
    availability='ONLINE', last_seen=now()
where id = (select id from profiles where email='repartidor@correo.com');

-- Consulta los repartidores más cercanos a la Plaza de Armas de Pachacámac
select * from public.nearest_drivers(
  ST_SetSRID(ST_MakePoint(-76.8556,-12.2286),4326)::geography, 8, 5);
```

Devuelve los repartidores ordenados por distancia (km). Esta es la base para
"avisar primero al más cercano".

## 8. Limpiar los datos demo (cuando entren los reales)

```sql
select public.wipe_demo_data();   -- borra SOLO lo marcado como demo
```

---

## Qué queda para las siguientes fases

- **F3.3:** que la web del cliente y el panel admin **lean** de Supabase (hoy el
  marketplace y el admin todavía usan el store demo). Al terminar esto, un
  restaurante que registres aparecerá en la web tras aprobarlo.
- **F3.4:** repartidores online/posición + asignación por cercanía con ofertas
  escalonadas y notificaciones en tiempo real.
- **F3.5:** gestión de usuarios (crear/suspender/aprobar) desde el panel admin y
  migración del login del admin a Supabase.

## Notas de seguridad

- RLS está activado en todas las tablas; las políticas limitan qué ve cada rol.
- Nunca subas la `service_role` key ni contraseñas al repositorio.
- La `anon` key es segura en el frontend.
