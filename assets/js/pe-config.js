/* Pacha Eats — Configuración de backend
 * ---------------------------------------------------------------
 * Deja los dos valores VACÍOS para seguir en modo DEMO (localStorage).
 * Rellénalos con los datos de tu proyecto para activar el backend real:
 *   Supabase → Project Settings → API
 *     - SUPABASE_URL       → "Project URL"
 *     - SUPABASE_ANON_KEY  → "anon public" key
 *
 * La ANON KEY es pública por diseño: la seguridad la dan las políticas RLS.
 * NUNCA pongas aquí la "service_role" key (esa es secreta y va solo en el
 * servidor / backend, jamás en el frontend).
 */
window.PE_CONFIG = {
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: ''
};

// 'supabase' si hay credenciales; 'demo' en caso contrario.
window.PE_BACKEND =
  (window.PE_CONFIG.SUPABASE_URL && window.PE_CONFIG.SUPABASE_ANON_KEY) ? 'supabase' : 'demo';
