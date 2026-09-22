/* Pacha Eats — Autenticación (Supabase Auth)
 * ---------------------------------------------------------------
 * Módulo único usado por las páginas de login/registro de cliente,
 * restaurante y repartidor. Si el backend está en modo 'demo'
 * (sin credenciales), estas funciones devuelven {ok:false, demo:true}
 * y las páginas mantienen su comportamiento de demostración.
 */
(function () {
  'use strict';

  const PachaAuth = {
    backend() { return window.PE_BACKEND || 'demo'; },
    isReal() { return this.backend() === 'supabase' && !!window.sb; },
    sb() { return window.sb; },

    // A dónde va cada rol después de iniciar sesión (base relativa a la página).
    ROLE_HOME: {
      CLIENT: 'index.html',
      RESTAURANT: 'restaurantes/dashboard.html',
      DRIVER: 'repartidores/dashboard.html',
      SUPERADMIN: 'admin/dashboard.html',
      ADMIN: 'admin/dashboard.html',
      OPERACIONES: 'admin/dashboard.html',
      SOPORTE: 'admin/dashboard.html',
      FINANZAS: 'admin/dashboard.html',
      MARKETING: 'admin/dashboard.html'
    },

    homeFor(role, base = '') { return (base || '') + (this.ROLE_HOME[role] || 'index.html'); },

    _friendly(msg) {
      const m = String(msg || '').toLowerCase();
      if (m.includes('invalid login')) return 'Correo o contraseña incorrectos.';
      if (m.includes('email not confirmed')) return 'Tu correo aún no está confirmado. Revisa tu bandeja o desactiva la confirmación de correo en Supabase para pruebas.';
      if (m.includes('already registered') || m.includes('already been registered')) return 'Ese correo ya está registrado.';
      if (m.includes('password') && m.includes('6')) return 'La contraseña debe tener al menos 6 caracteres.';
      return msg || 'Ocurrió un error. Inténtalo de nuevo.';
    },

    // ---- Registro ----
    // opts: { email, password, role, full_name, phone, vehicle_type, plate }
    async register(opts) {
      if (!this.isReal()) return { ok: false, demo: true, error: 'Backend en modo demo (sin Supabase configurado).' };
      const role = opts.role || 'CLIENT';
      const { data, error } = await this.sb().auth.signUp({
        email: String(opts.email || '').trim(),
        password: opts.password,
        options: {
          data: {
            role,
            full_name: opts.full_name || '',
            phone: opts.phone || '',
            vehicle_type: opts.vehicle_type || '',
            plate: opts.plate || ''
          }
        }
      });
      if (error) return { ok: false, error: this._friendly(error.message) };
      // Si la confirmación de correo está desactivada, ya hay sesión.
      return { ok: true, user: data.user, session: data.session, role };
    },

    // Crea el registro de restaurante para el dueño recién creado (requiere sesión activa).
    async createRestaurantForOwner(fields) {
      if (!this.isReal()) return { ok: false, demo: true };
      const { data: u } = await this.sb().auth.getUser();
      if (!u || !u.user) return { ok: false, error: 'Debes iniciar sesión para crear el restaurante.' };
      const slug = String(fields.name || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).slice(2, 6);
      const { data, error } = await this.sb().from('restaurants').insert({
        owner_id: u.user.id,
        name: fields.name,
        slug,
        category: fields.category || '',
        address: fields.address || '',
        district: fields.district || '',
        phone: fields.phone || '',
        status: 'PENDING'
      }).select().single();
      if (error) return { ok: false, error: error.message };
      return { ok: true, restaurant: data };
    },

    // ---- Login ----
    async login(email, password) {
      if (!this.isReal()) return { ok: false, demo: true, error: 'Backend en modo demo (sin Supabase configurado).' };
      const { data, error } = await this.sb().auth.signInWithPassword({
        email: String(email || '').trim(), password
      });
      if (error) return { ok: false, error: this._friendly(error.message) };
      const profile = await this._profile(data.user.id);
      if (profile && profile.status === 'SUSPENDED') {
        await this.logout();
        return { ok: false, error: 'Tu cuenta está suspendida. Contacta a soporte de Pacha Eats.' };
      }
      return { ok: true, user: data.user, profile, role: profile ? profile.role : 'CLIENT' };
    },

    async logout() {
      if (this.isReal()) { try { await this.sb().auth.signOut(); } catch (e) {} }
    },

    async _profile(id) {
      try {
        const { data } = await this.sb().from('profiles').select('*').eq('id', id).single();
        return data || null;
      } catch (e) { return null; }
    },

    // Sesión actual: {user, profile} o null.
    async current() {
      if (!this.isReal()) return null;
      const { data } = await this.sb().auth.getUser();
      if (!data || !data.user) return null;
      const profile = await this._profile(data.user.id);
      return { user: data.user, profile };
    },

    // Guard de páginas: exige sesión y, opcionalmente, uno de estos roles.
    // Devuelve {user, profile} o redirige a loginPath.
    async requireAuth(roles, loginPath) {
      if (!this.isReal()) return null; // en demo no se protege
      const s = await this.current();
      if (!s) { location.replace(loginPath); return null; }
      if (roles && roles.length && !roles.includes(s.profile ? s.profile.role : '')) {
        location.replace(loginPath); return null;
      }
      return s;
    }
  };

  window.PachaAuth = PachaAuth;
})();
