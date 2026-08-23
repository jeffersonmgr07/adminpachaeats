// Pacha Eats - Adaptador para Google Apps Script
// Pega aquí la URL de tu implementación Web App de Apps Script.
const APP_SCRIPT_URL = 'PEGAR_AQUI_URL_WEB_APP_APPS_SCRIPT';

const PachaAPI = {
  token: localStorage.getItem('pacha_token') || '',

  async request(action, payload = {}) {
    if (!APP_SCRIPT_URL || APP_SCRIPT_URL.includes('PEGAR_AQUI')) {
      console.warn('Configura APP_SCRIPT_URL en assets/js/api-appscript.js');
      return { ok: false, error: 'APP_SCRIPT_URL no configurado' };
    }

    const res = await fetch(APP_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, payload, token: this.token })
    });
    return res.json();
  },

  async login(email, password) {
    const data = await this.request('login', { email, password });
    if (data.ok && data.token) {
      this.token = data.token;
      localStorage.setItem('pacha_token', data.token);
      localStorage.setItem('pacha_user', JSON.stringify(data.user));
    }
    return data;
  },

  logout() {
    this.token = '';
    localStorage.removeItem('pacha_token');
    localStorage.removeItem('pacha_user');
  },

  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('Geolocalización no soportada'));
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        err => reject(err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    });
  },

  // Polling MVP para restaurantes/repartidores. No es push real.
  startPolling(callback, ms = 15000) {
    callback();
    return setInterval(callback, ms);
  }
};

window.PachaAPI = PachaAPI;
