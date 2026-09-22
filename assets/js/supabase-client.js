/* Pacha Eats — Inicialización del cliente Supabase
 * Requiere haber cargado antes:
 *   1) https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2  (define window.supabase)
 *   2) assets/js/pe-config.js                                (define window.PE_CONFIG / PE_BACKEND)
 * Expone window.sb (o null si estamos en modo demo / falta la librería).
 */
(function () {
  'use strict';
  if (window.PE_BACKEND !== 'supabase') { window.sb = null; return; }
  if (!window.supabase || !window.supabase.createClient) {
    console.error('Pacha Eats: no se cargó supabase-js. Revisa la etiqueta <script> del CDN.');
    window.sb = null;
    return;
  }
  window.sb = window.supabase.createClient(
    window.PE_CONFIG.SUPABASE_URL,
    window.PE_CONFIG.SUPABASE_ANON_KEY,
    { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
  );
})();
