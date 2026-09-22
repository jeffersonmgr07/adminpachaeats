/* Pacha Eats — Consola administrativa
 * -------------------------------------------------------------
 * Panel de operación conectado al MISMO store de pedidos en vivo
 * que usan cliente, restaurante y repartidor (localStorage PE).
 *
 * DEMO: la autenticación es local (sin backend). Las credenciales
 * y el RBAC viven en el navegador y se sustituirán por Apps Script
 * en la Fase 3. Está claramente marcado como demostración.
 */
(function () {
  'use strict';

  const Admin = {
    base: '../',

    // ---- Claves de almacenamiento ----
    SESSION_KEY: 'pe_admin_session',
    COUPON_KEY: 'pe_coupons',
    CONFIG_KEY: 'pe_admin_config',
    RIDERS_KEY: 'pe_admin_riders',

    // ---- Roles y catálogo de módulos con permisos (RBAC) ----
    ROLES: {
      SUPERADMIN: 'Superadministrador',
      ADMIN: 'Administrador',
      OPERACIONES: 'Operaciones',
      SOPORTE: 'Soporte',
      FINANZAS: 'Finanzas',
      MARKETING: 'Marketing'
    },

    MODULES: [
      { id: 'dashboard', label: 'Dashboard', icon: '▦', file: 'dashboard.html', roles: ['SUPERADMIN', 'ADMIN', 'OPERACIONES', 'SOPORTE', 'FINANZAS', 'MARKETING'] },
      { id: 'pedidos', label: 'Pedidos', icon: '▤', file: 'pedidos.html', roles: ['SUPERADMIN', 'ADMIN', 'OPERACIONES', 'SOPORTE'] },
      { id: 'repartidores', label: 'Repartidores', icon: '🛵', file: 'repartidores.html', roles: ['SUPERADMIN', 'ADMIN', 'OPERACIONES'] },
      { id: 'comisiones', label: 'Comisiones', icon: 'S/', file: 'comisiones.html', roles: ['SUPERADMIN', 'ADMIN', 'FINANZAS'] },
      { id: 'cupones', label: 'Cupones', icon: '%', file: 'cupones.html', roles: ['SUPERADMIN', 'ADMIN', 'MARKETING'] },
      { id: 'configuracion', label: 'Configuración', icon: '⚙', file: 'configuracion.html', roles: ['SUPERADMIN', 'ADMIN'] }
    ],

    // Usuarios de demostración (solo frontend, no productivo)
    DEMO_USERS: [
      { email: 'admin@pachaeats.demo', password: 'demo123', name: 'Ana Admin', role: 'SUPERADMIN' },
      { email: 'ops@pachaeats.demo', password: 'demo123', name: 'Oscar Ops', role: 'OPERACIONES' },
      { email: 'soporte@pachaeats.demo', password: 'demo123', name: 'Sofía Soporte', role: 'SOPORTE' },
      { email: 'finanzas@pachaeats.demo', password: 'demo123', name: 'Fabio Finanzas', role: 'FINANZAS' },
      { email: 'marketing@pachaeats.demo', password: 'demo123', name: 'Mia Marketing', role: 'MARKETING' }
    ],

    DEFAULT_CONFIG: {
      commissionRate: 0.15,   // comisión sobre subtotal (comida)
      serviceFeeRate: 0,      // tarifa de servicio al cliente (0 en lanzamiento)
      coverageNote: 'Pachacámac, Manchay y Lurín'
    },

    // =====================================================
    //  Utilidades base (delegan en PE cuando existe)
    // =====================================================
    money(n) { return (window.PE ? PE.money(n) : `S/ ${Number(n || 0).toFixed(2)}`); },
    escape(s = '') {
      return (window.PE ? PE.escape(s) : String(s).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c])));
    },
    fmtDate(iso) {
      if (!iso) return '—';
      try { return new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); }
      catch { return iso; }
    },

    // =====================================================
    //  Sesión y control de acceso (RBAC)
    // =====================================================
    getSession() {
      try { return JSON.parse(localStorage.getItem(this.SESSION_KEY) || 'null'); }
      catch { return null; }
    },
    setSession(user) {
      const session = { email: user.email, name: user.name, role: user.role, at: new Date().toISOString() };
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      return session;
    },
    clearSession() { localStorage.removeItem(this.SESSION_KEY); },

    roleLabel(role) { return this.ROLES[role] || role || '—'; },
    moduleById(id) { return this.MODULES.find(m => m.id === id); },
    can(role, moduleId) {
      const mod = this.moduleById(moduleId);
      return !!mod && mod.roles.includes(role);
    },
    allowedModules(role) { return this.MODULES.filter(m => m.roles.includes(role)); },

    login(email, password) {
      const mail = String(email || '').trim().toLowerCase();
      const user = this.DEMO_USERS.find(u => u.email === mail && u.password === password);
      if (!user) return { ok: false, error: 'Correo o contraseña incorrectos.' };
      return { ok: true, session: this.setSession(user) };
    },

    /* Protege una página: exige sesión y permiso del módulo.
       Devuelve la sesión o null (y redirige / muestra bloqueo). */
    guard(moduleId) {
      const session = this.getSession();
      if (!session) { location.replace('login.html'); return null; }
      if (moduleId && !this.can(session.role, moduleId)) {
        this.renderForbidden(moduleId, session);
        return null;
      }
      return session;
    },

    // =====================================================
    //  Configuración operativa
    // =====================================================
    getConfig() {
      try {
        const saved = JSON.parse(localStorage.getItem(this.CONFIG_KEY) || '{}');
        return Object.assign({}, this.DEFAULT_CONFIG, saved);
      } catch { return Object.assign({}, this.DEFAULT_CONFIG); }
    },
    saveConfig(patch) {
      const next = Object.assign(this.getConfig(), patch);
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(next));
      return next;
    },

    // =====================================================
    //  Cupones (CRUD real en localStorage)
    // =====================================================
    getCoupons() {
      try { const l = JSON.parse(localStorage.getItem(this.COUPON_KEY) || '[]'); return Array.isArray(l) ? l : []; }
      catch { return []; }
    },
    saveCoupons(list) { localStorage.setItem(this.COUPON_KEY, JSON.stringify(list)); },
    upsertCoupon(data) {
      const list = this.getCoupons();
      const code = String(data.code || '').trim().toUpperCase();
      if (!code) throw new Error('El código es obligatorio.');
      const value = Number(data.value || 0);
      if (value <= 0) throw new Error('El valor debe ser mayor a 0.');
      if (data.type === 'PERCENT' && value > 100) throw new Error('El porcentaje no puede superar 100%.');
      const payload = {
        code,
        type: data.type === 'FIXED' ? 'FIXED' : 'PERCENT',
        value,
        minSubtotal: Number(data.minSubtotal || 0),
        maxRedemptions: Number(data.maxRedemptions || 0),
        expiresAt: data.expiresAt || '',
        active: data.active !== false
      };
      const idx = list.findIndex(c => c.code === (data.originalCode ? String(data.originalCode).toUpperCase() : code));
      if (idx >= 0) {
        list[idx] = Object.assign({}, list[idx], payload, { code });
      } else {
        if (list.some(c => c.code === code)) throw new Error('Ya existe un cupón con ese código.');
        list.unshift(Object.assign({ id: `CUP-${Date.now()}`, redeemed: 0, createdAt: new Date().toISOString() }, payload));
      }
      this.saveCoupons(list);
      return list;
    },
    toggleCoupon(code) {
      const list = this.getCoupons();
      const c = list.find(x => x.code === String(code).toUpperCase());
      if (c) { c.active = !c.active; this.saveCoupons(list); }
      return list;
    },
    deleteCoupon(code) {
      const list = this.getCoupons().filter(c => c.code !== String(code).toUpperCase());
      this.saveCoupons(list);
      return list;
    },
    couponState(c) {
      if (!c.active) return { label: 'Inactivo', cls: 'red' };
      if (c.expiresAt && new Date(c.expiresAt) < new Date(new Date().toDateString())) return { label: 'Expirado', cls: 'yellow' };
      if (c.maxRedemptions > 0 && Number(c.redeemed || 0) >= c.maxRedemptions) return { label: 'Agotado', cls: 'yellow' };
      return { label: 'Activo', cls: 'green' };
    },

    // =====================================================
    //  Overlay de aprobación de repartidores (demo)
    // =====================================================
    getRiderOverlay() {
      try { return JSON.parse(localStorage.getItem(this.RIDERS_KEY) || '{}'); }
      catch { return {}; }
    },
    setRiderApproval(id, approved) {
      const o = this.getRiderOverlay();
      o[id] = { approved: !!approved, at: new Date().toISOString() };
      localStorage.setItem(this.RIDERS_KEY, JSON.stringify(o));
      return o;
    },

    // =====================================================
    //  Pedidos: etiquetas, estados y acciones administrativas
    // =====================================================
    statusLabel(status = '') {
      const extra = { REJECTED: 'Rechazado', INCIDENCIA: 'Incidencia' };
      if (window.PE) { const l = PE.orderStatusLabel(status); if (l && l !== status) return l; }
      return extra[status] || status;
    },
    statusClass(s = '') {
      if (['DELIVERED'].includes(s)) return 'green';
      if (['CANCELLED', 'REJECTED', 'INCIDENCIA'].includes(s)) return 'red';
      if (['PREPARING', 'READY', 'PICKED_UP', 'ON_THE_WAY'].includes(s)) return 'yellow';
      return 'blue';
    },
    isActiveStatus(s = '') { return !['DELIVERED', 'CANCELLED', 'REJECTED'].includes(s); },

    cancelOrder(id, reason, actorName) {
      const clean = String(reason || '').trim();
      if (!clean) throw new Error('Indica un motivo para cancelar.');
      return PE.updateOrder(id,
        { status: 'CANCELLED', cancelReason: clean, cancelBy: actorName || 'Admin' },
        { status: 'CANCELLED', label: `Cancelado por administración · ${clean}`, actor: 'ADMIN' });
    },
    markIncidence(id, reason, actorName) {
      const clean = String(reason || '').trim();
      if (!clean) throw new Error('Describe la incidencia.');
      const order = PE.getOrder(id);
      const incidences = (order && Array.isArray(order.incidences)) ? order.incidences : [];
      incidences.push({ reason: clean, by: actorName || 'Admin', at: new Date().toISOString() });
      return PE.updateOrder(id,
        { incidences, hasIncidence: true },
        { status: 'INCIDENCIA', label: `Incidencia registrada · ${clean}`, actor: 'ADMIN' });
    },

    // =====================================================
    //  Métricas del panel (a partir de pedidos EN VIVO)
    // =====================================================
    metrics() {
      const orders = window.PE ? PE.getOrders() : [];
      const cfg = this.getConfig();
      const delivered = orders.filter(o => o.status === 'DELIVERED');
      const active = orders.filter(o => this.isActiveStatus(o.status));
      const cancelled = orders.filter(o => ['CANCELLED', 'REJECTED'].includes(o.status));
      const incidences = orders.filter(o => o.hasIncidence);
      const gmv = delivered.reduce((s, o) => s + Number(o.total || 0), 0);
      const commission = delivered.reduce((s, o) => s + Number(o.subtotal || 0) * cfg.commissionRate, 0);
      const byStatus = {};
      orders.forEach(o => { byStatus[o.status] = (byStatus[o.status] || 0) + 1; });
      return {
        orders, delivered, active, cancelled, incidences,
        total: orders.length,
        gmv,
        commission,
        avgTicket: delivered.length ? gmv / delivered.length : 0,
        byStatus,
        cfg
      };
    },

    // =====================================================
    //  Shell (barra lateral + topbar) reutilizando portal.css
    // =====================================================
    shell(activeId, session) {
      const nav = this.allowedModules(session.role).map(m =>
        `<a class="${m.id === activeId ? 'active' : ''}" href="${m.file}"><span class="nav-icon">${m.icon}</span>${m.label}</a>`
      ).join('');
      const initials = (session.name || 'PE').split(' ').map(x => x[0]).slice(0, 2).join('');
      const active = this.moduleById(activeId);
      return `<div class="portal-shell admin-shell">
        <aside class="portal-sidebar">
          <a class="portal-logo" href="dashboard.html"><img src="../assets/img/logos/Logo1.png" alt=""><span>Pacha Eats</span></a>
          <div class="portal-account-card admin-account">
            <small>Administración</small>
            <strong>${this.escape(session.name)}</strong>
            <div class="store-state"><span class="role-pill">${this.escape(this.roleLabel(session.role))}</span></div>
          </div>
          <nav class="portal-nav">${nav}</nav>
          <div class="portal-sidebar-bottom">
            <a href="../index.html">↗ Ver Pacha Eats</a>
            <a href="#" data-admin-logout>⇥ Cerrar sesión</a>
          </div>
        </aside>
        <main class="portal-main">
          <header class="portal-topbar">
            <button class="portal-mobile-menu" data-menu>☰</button>
            <div class="portal-page-title"><small>Consola administrativa</small><strong>${active ? active.label : ''}</strong></div>
            <div class="portal-top-actions">
              <span class="live-chip">● Datos en vivo (demo)</span>
              <div class="portal-avatar" title="${this.escape(session.name)}">${this.escape(initials)}</div>
            </div>
          </header>
          <div class="portal-content" id="adminContent"></div>
        </main>
      </div>`;
    },

    wireShell() {
      document.querySelector('[data-menu]')?.addEventListener('click', () =>
        document.querySelector('.portal-sidebar')?.classList.toggle('open'));
      document.querySelector('[data-admin-logout]')?.addEventListener('click', e => {
        e.preventDefault();
        this.clearSession();
        location.replace('login.html');
      });
    },

    renderForbidden(moduleId, session) {
      const root = document.querySelector('#adminRoot') || document.body;
      root.innerHTML = this.shell('dashboard', session);
      this.wireShell();
      document.querySelector('#adminContent').innerHTML =
        `<div class="portal-empty admin-forbidden"><div>⛔</div><h3>Sin permiso</h3>
         <p>Tu rol <strong>${this.escape(this.roleLabel(session.role))}</strong> no tiene acceso al módulo
         <strong>${this.escape(this.moduleById(moduleId)?.label || moduleId)}</strong>.</p>
         <a class="portal-btn primary" href="dashboard.html">Volver al dashboard</a></div>`;
    },

    // =====================================================
    //  Arranque de cada página
    // =====================================================
    async start(moduleId) {
      const session = this.guard(moduleId);
      if (!session) return;
      if (window.PE) { PE.base = '../'; await PE.load(); }
      const root = document.querySelector('#adminRoot') || document.body;
      root.innerHTML = this.shell(moduleId, session);
      this.wireShell();

      const renderers = {
        dashboard: () => this.renderDashboard(session),
        pedidos: () => this.renderPedidos(session),
        repartidores: () => this.renderRepartidores(session),
        comisiones: () => this.renderComisiones(session),
        cupones: () => this.renderCupones(session),
        configuracion: () => this.renderConfig(session)
      };
      const render = renderers[moduleId] || (() => {});
      render();

      // Refresco en vivo: mismo tab y otras pestañas
      const live = () => render();
      window.addEventListener('pe:orders', live);
      window.addEventListener('storage', e => { if (e.key === PE.ORDER_KEY) live(); });
    },

    // =====================================================
    //  Página: Dashboard
    // =====================================================
    renderDashboard(session) {
      const m = this.metrics();
      const coupons = this.getCoupons().filter(c => this.couponState(c).label === 'Activo').length;
      const content = document.querySelector('#adminContent');
      if (!content) return;

      const order = ['PENDING_RESTAURANT', 'ACCEPTED', 'PREPARING', 'READY', 'DRIVER_ASSIGNED', 'PICKED_UP', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED'];
      const maxCount = Math.max(1, ...order.map(s => m.byStatus[s] || 0));
      const bars = order.filter(s => m.byStatus[s]).map(s => {
        const c = m.byStatus[s] || 0;
        return `<div class="status-bar-row"><span class="status-bar-label">${this.escape(this.statusLabel(s))}</span>
          <span class="status-bar-track"><span class="status-bar-fill ${this.statusClass(s)}" style="width:${Math.round((c / maxCount) * 100)}%"></span></span>
          <b>${c}</b></div>`;
      }).join('') || '<div class="portal-empty"><p>Aún no hay pedidos. Crea uno desde la web del cliente para ver la operación aquí.</p></div>';

      const recent = m.orders.slice(0, 8);
      content.innerHTML = `
        <div class="portal-greeting">
          <div><h1>Hola, ${this.escape(session.name.split(' ')[0])} 👋</h1>
          <p>Resumen de la operación en tiempo real. Los pedidos se sincronizan con cliente, restaurante y repartidor.</p></div>
          ${this.can(session.role, 'pedidos') ? '<a class="portal-btn outline" href="pedidos.html">Gestionar pedidos →</a>' : ''}
        </div>
        <section class="portal-kpis">
          ${this.kpi('Pedidos totales', m.total, 'histórico demo', '▤')}
          ${this.kpi('Activos ahora', m.active.length, 'en operación', '◎')}
          ${this.kpi('Entregados', m.delivered.length, 'completados', '✓')}
          ${this.kpi('GMV entregado', this.money(m.gmv), 'ventas brutas', 'S/')}
          ${this.kpi('Comisión estimada', this.money(m.commission), `${(m.cfg.commissionRate * 100).toFixed(0)}% sobre subtotal`, '%')}
          ${this.kpi('Incidencias', m.incidences.length, 'requieren revisión', '!')}
        </section>
        <section class="portal-grid-2 admin-dash-grid">
          <article class="portal-card">
            <div class="portal-card-header"><div><h2>Pedidos por estado</h2><p>Distribución actual del ciclo de vida.</p></div></div>
            <div class="status-bars">${bars}</div>
          </article>
          <article class="portal-card">
            <div class="portal-card-header"><div><h2>Alertas</h2><p>Puntos que suelen requerir acción.</p></div></div>
            <ul class="admin-alert-list">
              <li><span class="portal-badge ${m.byStatus['PENDING_RESTAURANT'] ? 'yellow' : 'green'}">${m.byStatus['PENDING_RESTAURANT'] || 0}</span> pedidos esperando que el restaurante acepte</li>
              <li><span class="portal-badge ${m.byStatus['READY'] ? 'yellow' : 'green'}">${m.byStatus['READY'] || 0}</span> listos sin repartidor asignado</li>
              <li><span class="portal-badge ${m.incidences.length ? 'red' : 'green'}">${m.incidences.length}</span> pedidos con incidencia registrada</li>
              <li><span class="portal-badge ${coupons ? 'green' : 'blue'}">${coupons}</span> cupones activos vigentes</li>
            </ul>
          </article>
        </section>
        <section class="portal-card">
          <div class="portal-card-header"><div><h2>Pedidos recientes</h2><p>Últimos movimientos en la plataforma.</p></div>
          ${this.can(session.role, 'pedidos') ? '<a class="portal-link" href="pedidos.html">Ver todos →</a>' : ''}</div>
          <div class="data-table-wrap">
            <table class="portal-table">
              <thead><tr><th>Código</th><th>Cliente</th><th>Restaurante</th><th>Estado</th><th>Total</th><th>Fecha</th></tr></thead>
              <tbody>${recent.map(o => `<tr>
                <td><strong>${this.escape(o.id)}</strong></td>
                <td>${this.escape(o.customer)}</td>
                <td>${this.escape(o.restaurant)}</td>
                <td><span class="portal-badge ${this.statusClass(o.status)}">${this.escape(this.statusLabel(o.status))}</span>${o.hasIncidence ? ' <span class="portal-badge red">!</span>' : ''}</td>
                <td>${this.money(o.total)}</td>
                <td>${this.fmtDate(o.createdAt)}</td>
              </tr>`).join('') || `<tr><td colspan="6"><div class="portal-empty"><p>No hay pedidos todavía.</p></div></td></tr>`}</tbody>
            </table>
          </div>
        </section>`;
    },

    kpi(label, value, trend, icon) {
      return `<article class="metric-card"><div class="metric-head"><span>${label}</span><span class="metric-icon">${icon}</span></div>
        <strong>${value}</strong><span class="metric-trend">${trend}</span></article>`;
    },

    // =====================================================
    //  Página: Pedidos (con detalle y acciones auditadas)
    // =====================================================
    renderPedidos(session) {
      const content = document.querySelector('#adminContent');
      if (!content) return;
      // Preserva filtros entre refrescos en vivo
      const st = this._pedFilters || (this._pedFilters = { status: 'ALL', restaurant: 'ALL', q: '' });
      const restaurants = (PE.data.restaurants || []);
      const allOrders = PE.getOrders();

      const filtered = allOrders.filter(o => {
        if (st.status === 'ACTIVE' && !this.isActiveStatus(o.status)) return false;
        if (st.status === 'INCIDENCE' && !o.hasIncidence) return false;
        if (!['ALL', 'ACTIVE', 'INCIDENCE'].includes(st.status) && o.status !== st.status) return false;
        if (st.restaurant !== 'ALL' && o.restaurantId !== st.restaurant) return false;
        if (st.q) {
          const hay = `${o.id} ${o.customer} ${o.phone} ${o.address}`.toLowerCase();
          if (!hay.includes(st.q.toLowerCase())) return false;
        }
        return true;
      });

      const statusOptions = ['ALL', 'ACTIVE', 'PENDING_RESTAURANT', 'ACCEPTED', 'PREPARING', 'READY', 'DRIVER_ASSIGNED', 'PICKED_UP', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED', 'INCIDENCE'];
      const statusName = s => ({ ALL: 'Todos los estados', ACTIVE: 'Solo activos', INCIDENCE: 'Con incidencia' }[s] || this.statusLabel(s));

      content.innerHTML = `
        <div class="portal-greeting">
          <div><h1>Pedidos</h1><p>Todos los pedidos de la plataforma en tiempo real. Filtra, inspecciona y gestiona incidencias.</p></div>
          <span class="live-chip">${filtered.length} de ${allOrders.length}</span>
        </div>
        <div class="admin-filters">
          <label>Estado
            <select data-filter="status" class="select-control">${statusOptions.map(s => `<option value="${s}" ${st.status === s ? 'selected' : ''}>${statusName(s)}</option>`).join('')}</select>
          </label>
          <label>Restaurante
            <select data-filter="restaurant" class="select-control"><option value="ALL">Todos</option>${restaurants.map(r => `<option value="${r.id}" ${st.restaurant === r.id ? 'selected' : ''}>${this.escape(r.name)}</option>`).join('')}</select>
          </label>
          <label class="admin-search">Buscar
            <input data-filter="q" type="search" class="field-control" placeholder="Código, cliente, teléfono…" value="${this.escape(st.q)}">
          </label>
        </div>
        <div class="admin-order-list">
          ${filtered.map(o => this.orderRow(o)).join('') || `<div class="portal-empty"><div>▤</div><h3>Sin pedidos</h3><p>No hay pedidos que coincidan con el filtro.</p></div>`}
        </div>`;

      // Wire filtros
      content.querySelectorAll('[data-filter]').forEach(el => {
        const evt = el.tagName === 'SELECT' ? 'change' : 'input';
        el.addEventListener(evt, () => {
          st[el.dataset.filter] = el.value;
          this.renderPedidos(session);
          if (evt === 'input') { const again = content.querySelector('[data-filter="q"]'); again && again.focus(); again && again.setSelectionRange(again.value.length, again.value.length); }
        });
      });
      // Wire abrir detalle
      content.querySelectorAll('[data-open-order]').forEach(b =>
        b.addEventListener('click', () => this.openOrderDetail(b.dataset.openOrder, session)));
    },

    orderRow(o) {
      const items = (o.items || []).reduce((s, i) => s + Number(i.qty || 0), 0);
      return `<article class="admin-order-card ${o.hasIncidence ? 'has-incidence' : ''}">
        <div class="admin-order-main">
          <div class="admin-order-id"><span class="order-code">${this.escape(o.id)}</span><small>${this.fmtDate(o.createdAt)}</small></div>
          <div class="admin-order-who"><strong>${this.escape(o.customer)}</strong><span>${this.escape(o.restaurant)}</span></div>
          <div class="admin-order-badges">
            <span class="portal-badge ${this.statusClass(o.status)}">${this.escape(this.statusLabel(o.status))}</span>
            ${o.hasIncidence ? '<span class="portal-badge red">Incidencia</span>' : ''}
            <span class="portal-badge blue">${this.escape(PE.paymentStatusLabel(o.paymentStatus))}</span>
          </div>
          <div class="admin-order-total"><strong>${this.money(o.total)}</strong><small>${items} ítem(s)</small></div>
          <button class="portal-btn outline" data-open-order="${this.escape(o.id)}">Ver detalle</button>
        </div>
      </article>`;
    },

    ensureDetailModal() {
      if (document.querySelector('#adminDetailModal')) return;
      document.body.insertAdjacentHTML('beforeend',
        `<div class="admin-modal" id="adminDetailModal" aria-hidden="true">
           <div class="admin-modal-backdrop" data-close-detail></div>
           <section class="admin-modal-sheet" role="dialog" aria-modal="true" aria-labelledby="adminDetailTitle">
             <button class="admin-modal-close" type="button" data-close-detail aria-label="Cerrar">×</button>
             <div id="adminDetailBody"></div>
           </section>
         </div>`);
      document.querySelectorAll('[data-close-detail]').forEach(b => b.addEventListener('click', () => this.closeDetail()));
      document.addEventListener('keydown', e => { if (e.key === 'Escape') this.closeDetail(); });
    },
    closeDetail() {
      const m = document.querySelector('#adminDetailModal');
      if (!m) return;
      m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    },

    openOrderDetail(id, session) {
      const o = PE.getOrder(id);
      if (!o) return;
      this.ensureDetailModal();
      const canManage = this.can(session.role, 'pedidos');
      const items = (o.items || []).map(i =>
        `<div class="portal-order-item"><div><strong>${i.qty}× ${this.escape(i.name)}</strong>
          ${i.modifiers?.length ? `<small>${i.modifiers.map(m => this.escape(m.name)).join(' · ')}</small>` : ''}
          ${i.note ? `<small>Nota: ${this.escape(i.note)}</small>` : ''}</div><b>${this.money(i.lineTotal)}</b></div>`).join('') || '<small>Sin ítems.</small>';

      const timeline = (o.events || []).map(ev =>
        `<div class="admin-tl-item"><span class="admin-tl-dot ${this.statusClass(ev.status)}"></span>
          <div><strong>${this.escape(ev.label || this.statusLabel(ev.status))}</strong>
          <small>${this.escape(ev.actor || 'SYSTEM')} · ${this.fmtDate(ev.at)}</small></div></div>`).join('');

      const incidences = (o.incidences || []).map(x =>
        `<li>${this.escape(x.reason)} <small>— ${this.escape(x.by)} · ${this.fmtDate(x.at)}</small></li>`).join('');

      const terminal = ['DELIVERED', 'CANCELLED', 'REJECTED'].includes(o.status);
      const actions = !canManage ? '<p class="admin-hint">Tu rol puede consultar pero no modificar pedidos.</p>' : `
        <div class="admin-actions-box">
          <h4>Acciones administrativas</h4>
          <form data-action="incidence" class="reason-form">
            <input name="reason" class="field-control" placeholder="Describir incidencia (ej. cliente no responde)" required>
            <button class="portal-btn soft" type="submit">Registrar incidencia</button>
          </form>
          ${terminal ? `<p class="admin-hint">El pedido está en estado final (${this.escape(this.statusLabel(o.status))}); no se puede cancelar.</p>` : `
          <form data-action="cancel" class="reason-form">
            <input name="reason" class="field-control" placeholder="Motivo de cancelación" required>
            <button class="portal-btn danger" type="submit">Cancelar pedido</button>
          </form>`}
          <p class="admin-feedback" data-feedback hidden></p>
        </div>`;

      document.querySelector('#adminDetailBody').innerHTML = `
        <header class="admin-detail-head">
          <div><span class="eyebrow">${this.escape(o.restaurant)}</span><h2 id="adminDetailTitle">${this.escape(o.id)}</h2>
          <span class="portal-badge ${this.statusClass(o.status)}">${this.escape(this.statusLabel(o.status))}</span>
          ${o.hasIncidence ? '<span class="portal-badge red">Incidencia</span>' : ''}</div>
          <div class="admin-detail-total"><small>Total</small><strong>${this.money(o.total)}</strong></div>
        </header>
        <div class="admin-detail-grid">
          <div><small>Cliente</small><strong>${this.escape(o.customer)}</strong><span>${this.escape(o.phone || 'Sin teléfono')}</span></div>
          <div><small>Entrega</small><strong>${this.escape(o.address || '—')}</strong><span>${this.escape(o.reference || 'Sin referencia')}</span></div>
          <div><small>Pago</small><strong>${this.escape(PE.paymentStatusLabel(o.paymentStatus))}</strong><span>${this.escape(o.paymentMethod || '')}</span></div>
          <div><small>Repartidor</small><strong>${this.escape(o.rider || 'Sin asignar')}</strong><span>PIN ${this.escape(o.deliveryPin || '—')}</span></div>
        </div>
        <div class="admin-detail-cols">
          <section><h4>Ítems</h4><div class="portal-order-items">${items}</div>
            <div class="admin-detail-totals">
              <div><span>Subtotal</span><b>${this.money(o.subtotal)}</b></div>
              <div><span>Delivery</span><b>${this.money(o.delivery)}</b></div>
              <div class="grand"><span>Total</span><b>${this.money(o.total)}</b></div>
            </div>
            ${incidences ? `<h4>Incidencias</h4><ul class="admin-incidence-list">${incidences}</ul>` : ''}
          </section>
          <section><h4>Historial</h4><div class="admin-timeline">${timeline}</div></section>
        </div>
        ${actions}
        <div class="admin-detail-foot"><a class="portal-btn outline" href="../seguimiento-pedido.html?id=${encodeURIComponent(o.id)}" target="_blank">Ver seguimiento del cliente ↗</a></div>`;

      // Wire acciones
      const body = document.querySelector('#adminDetailBody');
      const fb = body.querySelector('[data-feedback]');
      body.querySelector('[data-action="incidence"]')?.addEventListener('submit', e => {
        e.preventDefault();
        try {
          this.markIncidence(o.id, e.target.reason.value, session.name);
          this.openOrderDetail(o.id, session);
        } catch (err) { if (fb) { fb.hidden = false; fb.textContent = err.message; fb.className = 'admin-feedback error'; } }
      });
      body.querySelector('[data-action="cancel"]')?.addEventListener('submit', e => {
        e.preventDefault();
        if (!confirm('¿Cancelar este pedido? Esta acción queda registrada en el historial.')) return;
        try {
          this.cancelOrder(o.id, e.target.reason.value, session.name);
          this.openOrderDetail(o.id, session);
        } catch (err) { if (fb) { fb.hidden = false; fb.textContent = err.message; fb.className = 'admin-feedback error'; } }
      });

      const modal = document.querySelector('#adminDetailModal');
      modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    },

    // =====================================================
    //  Página: Repartidores
    // =====================================================
    renderRepartidores() {
      const content = document.querySelector('#adminContent');
      if (!content) return;
      const roster = PE.data.riders || [];
      const overlay = this.getRiderOverlay();
      const orders = PE.getOrders();
      const activeDeliveries = orders.filter(o => ['DRIVER_ASSIGNED', 'PICKED_UP', 'ON_THE_WAY'].includes(o.status));
      const completed = orders.filter(o => o.status === 'DELIVERED');

      const rows = roster.map(r => {
        const ov = overlay[r.id];
        const approved = ov ? ov.approved : (r.status !== 'Validación');
        return `<tr>
          <td><strong>${this.escape(r.name)}</strong><small class="muted"> ${this.escape(r.id)}</small></td>
          <td>${this.escape(r.vehicle)}</td>
          <td>${this.escape(r.plate)}</td>
          <td>${r.score ? '★ ' + r.score : '—'}</td>
          <td><span class="portal-badge ${approved ? 'green' : 'yellow'}">${approved ? 'Aprobado' : 'En validación'}</span></td>
          <td>
            <button class="portal-btn ${approved ? 'outline' : 'primary'}" data-rider-toggle="${this.escape(r.id)}" data-approve="${approved ? '0' : '1'}">${approved ? 'Suspender' : 'Aprobar'}</button>
          </td>
        </tr>`;
      }).join('');

      content.innerHTML = `
        <div class="portal-greeting"><div><h1>Repartidores</h1>
          <p>Roster de repartidores y actividad de entregas en vivo. La aprobación es una simulación local para esta demo.</p></div></div>
        <section class="portal-kpis">
          ${this.kpi('Repartidores', roster.length, 'en el roster', '🛵')}
          ${this.kpi('Entregas activas', activeDeliveries.length, 'en curso ahora', '◎')}
          ${this.kpi('Entregas completadas', completed.length, 'histórico demo', '✓')}
        </section>
        <section class="portal-card">
          <div class="portal-card-header"><div><h2>Roster</h2><p>Aprueba o suspende repartidores (demo local).</p></div></div>
          <div class="data-table-wrap"><table class="portal-table">
            <thead><tr><th>Nombre</th><th>Vehículo</th><th>Placa</th><th>Score</th><th>Estado</th><th>Acción</th></tr></thead>
            <tbody>${rows || `<tr><td colspan="6"><div class="portal-empty"><p>Sin repartidores en el roster.</p></div></td></tr>`}</tbody>
          </table></div>
        </section>
        <section class="portal-card">
          <div class="portal-card-header"><div><h2>Entregas activas</h2><p>Pedidos actualmente en manos de un repartidor.</p></div></div>
          <div class="data-table-wrap"><table class="portal-table">
            <thead><tr><th>Pedido</th><th>Repartidor</th><th>Ruta</th><th>Estado</th><th>Total</th></tr></thead>
            <tbody>${activeDeliveries.map(o => `<tr>
              <td><strong>${this.escape(o.id)}</strong></td>
              <td>${this.escape(o.rider || '—')}</td>
              <td>${this.escape(o.restaurant)} → ${this.escape(o.customer)}</td>
              <td><span class="portal-badge ${this.statusClass(o.status)}">${this.escape(this.statusLabel(o.status))}</span></td>
              <td>${this.money(o.total)}</td>
            </tr>`).join('') || `<tr><td colspan="5"><div class="portal-empty"><p>No hay entregas activas en este momento.</p></div></td></tr>`}</tbody>
          </table></div>
        </section>`;

      content.querySelectorAll('[data-rider-toggle]').forEach(b =>
        b.addEventListener('click', () => {
          this.setRiderApproval(b.dataset.riderToggle, b.dataset.approve === '1');
          this.renderRepartidores();
        }));
    },

    // =====================================================
    //  Página: Comisiones
    // =====================================================
    renderComisiones(session) {
      const content = document.querySelector('#adminContent');
      if (!content) return;
      const cfg = this.getConfig();
      const delivered = PE.getOrders().filter(o => o.status === 'DELIVERED');
      const totals = delivered.reduce((a, o) => {
        const sub = Number(o.subtotal || 0);
        const com = sub * cfg.commissionRate;
        a.subtotal += sub; a.commission += com; a.net += (sub - com); a.gmv += Number(o.total || 0);
        return a;
      }, { subtotal: 0, commission: 0, net: 0, gmv: 0 });

      // Comisión por restaurante
      const byRest = {};
      delivered.forEach(o => {
        const k = o.restaurant || o.restaurantId;
        byRest[k] = byRest[k] || { orders: 0, subtotal: 0, commission: 0 };
        byRest[k].orders++; byRest[k].subtotal += Number(o.subtotal || 0);
        byRest[k].commission += Number(o.subtotal || 0) * cfg.commissionRate;
      });

      content.innerHTML = `
        <div class="portal-greeting"><div><h1>Comisiones y liquidación</h1>
          <p>La comisión se calcula sobre el subtotal de pedidos entregados. Ajusta la tasa y revisa lo que corresponde a Pacha Eats y a cada comercio.</p></div></div>
        <section class="portal-card admin-rate-card">
          <div class="portal-card-header"><div><h2>Tasa de comisión</h2><p>Aplica a nuevos cálculos de esta consola.</p></div></div>
          <form class="rate-form" data-rate-form>
            <label>Comisión sobre subtotal (%)
              <input name="rate" type="number" min="0" max="60" step="0.5" class="field-control" value="${(cfg.commissionRate * 100)}">
            </label>
            <button class="portal-btn primary" type="submit">Guardar tasa</button>
            <span class="admin-feedback" data-rate-feedback hidden></span>
          </form>
        </section>
        <section class="portal-kpis">
          ${this.kpi('Subtotal entregado', this.money(totals.subtotal), 'base de comisión', 'S/')}
          ${this.kpi('Comisión Pacha Eats', this.money(totals.commission), `${(cfg.commissionRate * 100).toFixed(1)}%`, '%')}
          ${this.kpi('A liquidar a comercios', this.money(totals.net), 'subtotal − comisión', '↦')}
          ${this.kpi('GMV entregado', this.money(totals.gmv), 'incluye delivery', '▤')}
        </section>
        <section class="portal-card">
          <div class="portal-card-header"><div><h2>Por comercio</h2><p>Liquidación estimada por restaurante (pedidos entregados).</p></div></div>
          <div class="data-table-wrap"><table class="portal-table">
            <thead><tr><th>Restaurante</th><th>Pedidos</th><th>Subtotal</th><th>Comisión</th><th>Neto comercio</th></tr></thead>
            <tbody>${Object.entries(byRest).map(([name, v]) => `<tr>
              <td><strong>${this.escape(name)}</strong></td><td>${v.orders}</td>
              <td>${this.money(v.subtotal)}</td><td>${this.money(v.commission)}</td>
              <td>${this.money(v.subtotal - v.commission)}</td></tr>`).join('') ||
              `<tr><td colspan="5"><div class="portal-empty"><p>Aún no hay pedidos entregados para liquidar.</p></div></td></tr>`}</tbody>
          </table></div>
        </section>`;

      content.querySelector('[data-rate-form]')?.addEventListener('submit', e => {
        e.preventDefault();
        const fb = content.querySelector('[data-rate-feedback]');
        const pct = Number(e.target.rate.value);
        if (isNaN(pct) || pct < 0 || pct > 60) { fb.hidden = false; fb.textContent = 'Ingresa un porcentaje entre 0 y 60.'; fb.className = 'admin-feedback error'; return; }
        this.saveConfig({ commissionRate: pct / 100 });
        this.renderComisiones(session);
      });
    },

    // =====================================================
    //  Página: Cupones (CRUD)
    // =====================================================
    renderCupones(session) {
      const content = document.querySelector('#adminContent');
      if (!content) return;
      const coupons = this.getCoupons();

      content.innerHTML = `
        <div class="portal-greeting"><div><h1>Cupones</h1>
          <p>Crea y administra cupones de descuento. Quedan guardados y listos para aplicarse en el checkout (integración del checkout: siguiente avance).</p></div></div>
        <section class="portal-grid-2 admin-coupon-layout">
          <article class="portal-card">
            <div class="portal-card-header"><div><h2 data-form-title>Nuevo cupón</h2><p>Porcentaje o monto fijo.</p></div></div>
            <form class="coupon-form" data-coupon-form>
              <input type="hidden" name="originalCode" value="">
              <label>Código<input name="code" class="field-control" placeholder="PACHA10" required></label>
              <div class="coupon-form-row">
                <label>Tipo<select name="type" class="select-control"><option value="PERCENT">Porcentaje (%)</option><option value="FIXED">Monto fijo (S/)</option></select></label>
                <label>Valor<input name="value" type="number" min="0" step="0.5" class="field-control" placeholder="10" required></label>
              </div>
              <div class="coupon-form-row">
                <label>Mínimo de compra (S/)<input name="minSubtotal" type="number" min="0" step="0.5" class="field-control" placeholder="0"></label>
                <label>Usos máximos<input name="maxRedemptions" type="number" min="0" step="1" class="field-control" placeholder="0 = ilimitado"></label>
              </div>
              <label>Vence<input name="expiresAt" type="date" class="field-control"></label>
              <label class="coupon-check"><input type="checkbox" name="active" checked> Activo</label>
              <div class="coupon-form-actions">
                <button class="portal-btn primary" type="submit" data-form-submit>Crear cupón</button>
                <button class="portal-btn outline" type="button" data-form-reset hidden>Cancelar edición</button>
              </div>
              <p class="admin-feedback" data-coupon-feedback hidden></p>
            </form>
          </article>
          <article class="portal-card">
            <div class="portal-card-header"><div><h2>Cupones (${coupons.length})</h2><p>Activa, edita o elimina.</p></div></div>
            <div class="coupon-list">
              ${coupons.map(c => this.couponCard(c)).join('') || `<div class="portal-empty"><div>%</div><h3>Sin cupones</h3><p>Crea el primero con el formulario.</p></div>`}
            </div>
          </article>
        </section>`;

      const form = content.querySelector('[data-coupon-form]');
      const fb = content.querySelector('[data-coupon-feedback]');
      const resetBtn = content.querySelector('[data-form-reset]');
      const rerender = () => this.renderCupones(session);

      form.addEventListener('submit', e => {
        e.preventDefault();
        const fd = new FormData(form);
        try {
          this.upsertCoupon({
            originalCode: fd.get('originalCode') || '',
            code: fd.get('code'),
            type: fd.get('type'),
            value: fd.get('value'),
            minSubtotal: fd.get('minSubtotal'),
            maxRedemptions: fd.get('maxRedemptions'),
            expiresAt: fd.get('expiresAt'),
            active: fd.get('active') === 'on'
          });
          rerender();
        } catch (err) { fb.hidden = false; fb.textContent = err.message; fb.className = 'admin-feedback error'; }
      });
      resetBtn?.addEventListener('click', rerender);

      content.querySelectorAll('[data-coupon-toggle]').forEach(b =>
        b.addEventListener('click', () => { this.toggleCoupon(b.dataset.couponToggle); rerender(); }));
      content.querySelectorAll('[data-coupon-delete]').forEach(b =>
        b.addEventListener('click', () => { if (confirm(`¿Eliminar el cupón ${b.dataset.couponDelete}?`)) { this.deleteCoupon(b.dataset.couponDelete); rerender(); } }));
      content.querySelectorAll('[data-coupon-edit]').forEach(b =>
        b.addEventListener('click', () => this.fillCouponForm(b.dataset.couponEdit)));
    },

    couponCard(c) {
      const state = this.couponState(c);
      const value = c.type === 'PERCENT' ? `${c.value}%` : this.money(c.value);
      return `<div class="coupon-card">
        <div class="coupon-card-head"><strong>${this.escape(c.code)}</strong><span class="portal-badge ${state.cls}">${state.label}</span></div>
        <div class="coupon-value">${value} de descuento</div>
        <div class="coupon-meta">
          ${c.minSubtotal ? `Mín. ${this.money(c.minSubtotal)} · ` : ''}
          ${c.maxRedemptions ? `${c.redeemed || 0}/${c.maxRedemptions} usos` : 'usos ilimitados'}
          ${c.expiresAt ? ` · vence ${this.escape(c.expiresAt)}` : ''}
        </div>
        <div class="coupon-actions">
          <button class="portal-btn outline" data-coupon-toggle="${this.escape(c.code)}">${c.active ? 'Desactivar' : 'Activar'}</button>
          <button class="portal-btn soft" data-coupon-edit="${this.escape(c.code)}">Editar</button>
          <button class="portal-btn danger" data-coupon-delete="${this.escape(c.code)}">Eliminar</button>
        </div>
      </div>`;
    },

    fillCouponForm(code) {
      const c = this.getCoupons().find(x => x.code === String(code).toUpperCase());
      if (!c) return;
      const form = document.querySelector('[data-coupon-form]');
      form.originalCode.value = c.code;
      form.code.value = c.code;
      form.type.value = c.type;
      form.value.value = c.value;
      form.minSubtotal.value = c.minSubtotal || '';
      form.maxRedemptions.value = c.maxRedemptions || '';
      form.expiresAt.value = c.expiresAt || '';
      form.active.checked = c.active !== false;
      document.querySelector('[data-form-title]').textContent = `Editar ${c.code}`;
      document.querySelector('[data-form-submit]').textContent = 'Guardar cambios';
      document.querySelector('[data-form-reset]').hidden = false;
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },

    // =====================================================
    //  Página: Configuración
    // =====================================================
    renderConfig(session) {
      const content = document.querySelector('#adminContent');
      if (!content) return;
      const cfg = this.getConfig();
      const matrix = this.MODULES.map(m =>
        `<tr><td><strong>${m.label}</strong></td>${Object.keys(this.ROLES).map(r =>
          `<td class="matrix-cell">${m.roles.includes(r) ? '<span class="matrix-yes">✓</span>' : '<span class="matrix-no">·</span>'}</td>`).join('')}</tr>`).join('');

      content.innerHTML = `
        <div class="portal-greeting"><div><h1>Configuración</h1>
          <p>Parámetros generales de la operación, matriz de permisos y utilidades de la demo.</p></div></div>
        <section class="portal-card">
          <div class="portal-card-header"><div><h2>Parámetros generales</h2><p>Se guardan localmente en este navegador (demo).</p></div></div>
          <form class="config-form" data-config-form>
            <label>Comisión sobre subtotal (%)<input name="commissionRate" type="number" min="0" max="60" step="0.5" class="field-control" value="${cfg.commissionRate * 100}"></label>
            <label>Tarifa de servicio al cliente (%)<input name="serviceFeeRate" type="number" min="0" max="30" step="0.5" class="field-control" value="${cfg.serviceFeeRate * 100}"></label>
            <label>Zona de cobertura<input name="coverageNote" class="field-control" value="${this.escape(cfg.coverageNote)}"></label>
            <div><button class="portal-btn primary" type="submit">Guardar cambios</button>
            <span class="admin-feedback" data-config-feedback hidden></span></div>
          </form>
        </section>
        <section class="portal-card">
          <div class="portal-card-header"><div><h2>Matriz de permisos (RBAC)</h2><p>Qué módulo ve cada rol.</p></div></div>
          <div class="data-table-wrap"><table class="portal-table matrix-table">
            <thead><tr><th>Módulo</th>${Object.values(this.ROLES).map(r => `<th>${this.escape(r)}</th>`).join('')}</tr></thead>
            <tbody>${matrix}</tbody>
          </table></div>
        </section>
        <section class="portal-card admin-danger">
          <div class="portal-card-header"><div><h2>Zona de datos demo</h2><p>Reinicia la operación simulada. No afecta el catálogo.</p></div></div>
          <p class="admin-hint">Elimina los pedidos demo generados por el circuito (cliente/restaurante/repartidor). Útil para volver a probar desde cero.</p>
          <button class="portal-btn danger" data-reset-demo>Reiniciar pedidos demo</button>
        </section>`;

      content.querySelector('[data-config-form]')?.addEventListener('submit', e => {
        e.preventDefault();
        const fb = content.querySelector('[data-config-feedback]');
        const cr = Number(e.target.commissionRate.value), sf = Number(e.target.serviceFeeRate.value);
        if (isNaN(cr) || cr < 0 || cr > 60 || isNaN(sf) || sf < 0 || sf > 30) {
          fb.hidden = false; fb.textContent = 'Revisa los porcentajes ingresados.'; fb.className = 'admin-feedback error'; return;
        }
        this.saveConfig({ commissionRate: cr / 100, serviceFeeRate: sf / 100, coverageNote: e.target.coverageNote.value });
        fb.hidden = false; fb.textContent = 'Cambios guardados.'; fb.className = 'admin-feedback ok';
      });
      content.querySelector('[data-reset-demo]')?.addEventListener('click', () => {
        if (!confirm('¿Reiniciar todos los pedidos demo? Esta acción no se puede deshacer.')) return;
        localStorage.removeItem(PE.ORDER_KEY);
        localStorage.removeItem(PE.LAST_ORDER_KEY);
        window.dispatchEvent(new CustomEvent('pe:orders'));
        this.renderConfig(session);
      });
    },

    // =====================================================
    //  Login (página independiente)
    // =====================================================
    initLogin() {
      // Si ya hay sesión, entra directo
      if (this.getSession()) { location.replace('dashboard.html'); return; }
      const form = document.querySelector('#adminLoginForm');
      if (!form) return;
      const fb = document.querySelector('#adminLoginFeedback');
      form.addEventListener('submit', e => {
        e.preventDefault();
        const res = this.login(form.email.value, form.password.value);
        if (!res.ok) { fb.hidden = false; fb.textContent = res.error; fb.className = 'admin-feedback error'; return; }
        location.href = 'dashboard.html';
      });
      // Botones de acceso rápido demo
      document.querySelectorAll('[data-demo-fill]').forEach(b =>
        b.addEventListener('click', () => {
          const u = this.DEMO_USERS.find(x => x.email === b.dataset.demoFill);
          if (u) { form.email.value = u.email; form.password.value = u.password; }
        }));
    }
  };

  window.Admin = Admin;
})();
