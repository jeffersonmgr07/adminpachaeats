const TOKEN_HOURS = 24 * 7;
const DEFAULT_RESTAURANT_COMMISSION = 0.00; // lanzamiento 0%
const DEFAULT_RIDER_COMMISSION = 0.00; // lanzamiento 0%
const CASHBACK_RATE = 0.02; // 2% inicial para clientes
const RIDER_SEARCH_RADIUS_KM = 4;

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const action = body.action;
    const payload = body.payload || {};
    const token = body.token || '';
    const result = routeAction(action, payload, token);
    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

function doGet() {
  return jsonResponse({ ok: true, app: 'Pacha Eats API', version: 'v3-appscript-mvp' });
}

function routeAction(action, payload, token) {
  const publicActions = ['registerClient','registerRestaurantOwner','registerRider','login','listRestaurants','listProducts'];
  const session = publicActions.includes(action) ? null : requireSession(token);

  const routes = {
    registerClient, registerRestaurantOwner, registerRider, login, listRestaurants, listProducts,
    createOrder: p => createOrder(p, session),
    clientOrders: p => clientOrders(p, session),
    clientRewards: p => clientRewards(p, session),
    createProduct: p => createProduct(p, session),
    updateProductAvailability: p => updateProductAvailability(p, session),
    restaurantOrders: p => restaurantOrders(p, session),
    restaurantAcceptOrder: p => restaurantAcceptOrder(p, session),
    riderSetActive: p => riderSetActive(p, session),
    riderNearbyOrders: p => riderNearbyOrders(p, session),
    riderAcceptOrder: p => riderAcceptOrder(p, session),
    riderUpdateOrderStatus: p => riderUpdateOrderStatus(p, session),
    adminApproveRestaurant: p => adminApproveRestaurant(p, session),
    adminApproveRider: p => adminApproveRider(p, session),
    adminOrders: p => adminOrders(p, session),
    adminSetCommission: p => adminSetCommission(p, session)
  };
  if (!routes[action]) throw new Error('Acción no válida: ' + action);
  return routes[action](payload);
}

function registerClient(p) {
  validateFields(p, ['full_name','email','phone','password']);
  return createUser('CLIENT', p, 'ACTIVE');
}

function registerRestaurantOwner(p) {
  validateFields(p, ['full_name','email','phone','password','restaurant_name','address','lat','lng']);
  const user = createUser('RESTAURANT', p, 'PENDING');
  appendRow('Restaurants', {
    restaurant_id: id('RES'), owner_user_id: user.user_id, name: p.restaurant_name, slug: slugify(p.restaurant_name),
    category: p.category || 'Restaurante', phone: p.phone, address: p.address, lat: p.lat, lng: p.lng,
    status: 'PENDING', open_now: false, schedule_json: JSON.stringify(p.schedule || {}),
    commission_rate: DEFAULT_RESTAURANT_COMMISSION, rating: 0, created_at: now(), updated_at: now()
  });
  return { ok: true, user_id: user.user_id, message: 'Restaurante registrado. Pendiente de aprobación.' };
}

function registerRider(p) {
  validateFields(p, ['full_name','email','phone','password','vehicle_type','document_number']);
  const user = createUser('RIDER', p, 'PENDING');
  appendRow('Riders', {
    rider_id: id('RID'), user_id: user.user_id, vehicle_type: p.vehicle_type, vehicle_plate: p.vehicle_plate || '',
    vehicle_brand: p.vehicle_brand || '', vehicle_model: p.vehicle_model || '', document_number: p.document_number,
    lat: p.lat || '', lng: p.lng || '', active: false, status: 'PENDING', delivery_fee_base: p.delivery_fee_base || 6,
    commission_rate: DEFAULT_RIDER_COMMISSION, created_at: now(), updated_at: now()
  });
  return { ok: true, user_id: user.user_id, message: 'Repartidor registrado. Pendiente de aprobación.' };
}

function login(p) {
  validateFields(p, ['email','password']);
  const user = findOne('Users', 'email', normalizeEmail(p.email));
  if (!user) throw new Error('Usuario no encontrado');
  if (user.status !== 'ACTIVE') throw new Error('Usuario pendiente o suspendido');
  const hash = hashPassword(p.password, user.salt);
  if (hash !== user.password_hash) throw new Error('Contraseña incorrecta');
  const token = Utilities.getUuid();
  appendRow('Sessions', { token, user_id: user.user_id, role: user.role, expires_at: addHours(TOKEN_HOURS), created_at: now() });
  return { ok: true, token, user: sanitizeUser(user) };
}

function listRestaurants() {
  return { ok: true, restaurants: rows('Restaurants').filter(r => r.status === 'ACTIVE') };
}

function listProducts(p) {
  const all = rows('Products').filter(x => x.restaurant_id === p.restaurant_id && String(x.available) === 'true');
  return { ok: true, products: all };
}

function createOrder(p, session) {
  requireRole(session, 'CLIENT');
  validateFields(p, ['restaurant_id','items','customer_name','customer_phone','delivery_address','delivery_lat','delivery_lng']);
  const products = rows('Products');
  let subtotal = 0;
  const orderId = id('ORD');
  p.items.forEach(item => {
    const product = products.find(x => x.product_id === item.product_id && String(x.available) === 'true');
    if (!product) throw new Error('Producto no disponible: ' + item.product_id);
    const qty = Number(item.quantity || 1);
    const price = Number(product.promo_price || product.price);
    subtotal += price * qty;
    appendRow('OrderItems', { item_id: id('ITM'), order_id: orderId, product_id: product.product_id, product_name: product.name, quantity: qty, unit_price: price, line_total: price * qty, notes: item.notes || '' });
  });
  const deliveryFee = Number(p.delivery_fee || 6);
  const discount = Number(p.discount || 0);
  const total = subtotal + deliveryFee - discount;
  appendRow('Orders', {
    order_id: orderId, client_user_id: session.user_id, restaurant_id: p.restaurant_id, rider_id: '',
    status: 'PENDING_RESTAURANT', subtotal, delivery_fee: deliveryFee, discount, total,
    payment_method: p.payment_method || 'CASH', payment_status: 'PENDING', customer_name: p.customer_name,
    customer_phone: p.customer_phone, delivery_address: p.delivery_address, delivery_lat: p.delivery_lat,
    delivery_lng: p.delivery_lng, restaurant_eta_minutes: '', distance_km: '', rider_earning: '',
    platform_commission: 0, cashback_earned: 0, created_at: now(), updated_at: now()
  });
  notifyRestaurant(p.restaurant_id, orderId);
  return { ok: true, order_id: orderId, status: 'PENDING_RESTAURANT', total };
}

function restaurantOrders(p, session) {
  requireRole(session, 'RESTAURANT');
  const restaurant = restaurantByOwner(session.user_id);
  const orders = rows('Orders').filter(o => o.restaurant_id === restaurant.restaurant_id);
  return { ok: true, orders };
}

function restaurantAcceptOrder(p, session) {
  requireRole(session, 'RESTAURANT');
  validateFields(p, ['order_id','eta_minutes']);
  const restaurant = restaurantByOwner(session.user_id);
  updateWhere('Orders', 'order_id', p.order_id, row => {
    if (row.restaurant_id !== restaurant.restaurant_id) throw new Error('Pedido no pertenece a este restaurante');
    row.status = 'READY_FOR_RIDER_SEARCH';
    row.restaurant_eta_minutes = p.eta_minutes;
    row.updated_at = now();
    return row;
  });
  notifyNearbyRiders(p.order_id);
  return { ok: true, order_id: p.order_id, status: 'READY_FOR_RIDER_SEARCH' };
}

function riderSetActive(p, session) {
  requireRole(session, 'RIDER');
  updateWhere('Riders', 'user_id', session.user_id, row => {
    if (row.status !== 'ACTIVE') throw new Error('Repartidor no aprobado');
    row.active = Boolean(p.active);
    row.lat = p.lat || row.lat;
    row.lng = p.lng || row.lng;
    row.updated_at = now();
    return row;
  });
  return { ok: true };
}

function riderNearbyOrders(p, session) {
  requireRole(session, 'RIDER');
  const rider = findOne('Riders', 'user_id', session.user_id);
  if (!rider || rider.status !== 'ACTIVE' || String(rider.active) !== 'true') return { ok: true, orders: [] };
  const restaurants = rows('Restaurants');
  const pending = rows('Orders').filter(o => o.status === 'READY_FOR_RIDER_SEARCH');
  const nearby = pending.map(o => {
    const res = restaurants.find(r => r.restaurant_id === o.restaurant_id);
    const distance = res ? haversine(Number(rider.lat), Number(rider.lng), Number(res.lat), Number(res.lng)) : 999;
    return Object.assign({}, o, { pickup_distance_km: Number(distance.toFixed(2)) });
  }).filter(o => o.pickup_distance_km <= RIDER_SEARCH_RADIUS_KM);
  return { ok: true, orders: nearby };
}

function riderAcceptOrder(p, session) {
  requireRole(session, 'RIDER');
  validateFields(p, ['order_id']);
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const rider = findOne('Riders', 'user_id', session.user_id);
    if (!rider || rider.status !== 'ACTIVE') throw new Error('Repartidor no aprobado');
    updateWhere('Orders', 'order_id', p.order_id, row => {
      if (row.status !== 'READY_FOR_RIDER_SEARCH') throw new Error('Pedido ya no está disponible');
      row.rider_id = rider.rider_id;
      row.status = 'RIDER_ASSIGNED';
      row.rider_earning = Number(row.delivery_fee) * (1 - Number(rider.commission_rate || 0));
      row.updated_at = now();
      return row;
    });
    return { ok: true, order_id: p.order_id, status: 'RIDER_ASSIGNED' };
  } finally {
    lock.releaseLock();
  }
}

function riderUpdateOrderStatus(p, session) {
  requireRole(session, 'RIDER');
  validateFields(p, ['order_id','status']);
  const allowed = ['PICKED_UP','DELIVERED'];
  if (!allowed.includes(p.status)) throw new Error('Estado no permitido');
  const rider = findOne('Riders', 'user_id', session.user_id);
  updateWhere('Orders', 'order_id', p.order_id, row => {
    if (row.rider_id !== rider.rider_id) throw new Error('Pedido asignado a otro repartidor');
    row.status = p.status;
    row.updated_at = now();
    if (p.status === 'DELIVERED') finalizeOrder(row);
    return row;
  });
  return { ok: true };
}

function clientOrders(p, session) {
  requireRole(session, 'CLIENT');
  return { ok: true, orders: rows('Orders').filter(o => o.client_user_id === session.user_id) };
}

function clientRewards(p, session) {
  requireRole(session, 'CLIENT');
  return { ok: true, rewards: rows('Rewards').filter(r => r.user_id === session.user_id) };
}

function createProduct(p, session) {
  requireRole(session, 'RESTAURANT');
  validateFields(p, ['name','price']);
  const restaurant = restaurantByOwner(session.user_id);
  const product = {
    product_id: id('PRO'), restaurant_id: restaurant.restaurant_id, name: p.name, description: p.description || '',
    category: p.category || 'Platos', price: Number(p.price), image_url: p.image_url || '', available: true,
    prep_minutes: p.prep_minutes || 20, promo_price: p.promo_price || '', created_at: now(), updated_at: now()
  };
  appendRow('Products', product);
  return { ok: true, product };
}

function updateProductAvailability(p, session) {
  requireRole(session, 'RESTAURANT');
  const restaurant = restaurantByOwner(session.user_id);
  updateWhere('Products', 'product_id', p.product_id, row => {
    if (row.restaurant_id !== restaurant.restaurant_id) throw new Error('Producto no pertenece al restaurante');
    row.available = Boolean(p.available);
    row.updated_at = now();
    return row;
  });
  return { ok: true };
}

function adminApproveRestaurant(p, session) {
  requireRole(session, 'ADMIN');
  updateWhere('Restaurants', 'restaurant_id', p.restaurant_id, r => { r.status = 'ACTIVE'; r.updated_at = now(); return r; });
  const r = findOne('Restaurants', 'restaurant_id', p.restaurant_id);
  updateWhere('Users', 'user_id', r.owner_user_id, u => { u.status = 'ACTIVE'; u.updated_at = now(); return u; });
  return { ok: true };
}

function adminApproveRider(p, session) {
  requireRole(session, 'ADMIN');
  updateWhere('Riders', 'rider_id', p.rider_id, r => { r.status = 'ACTIVE'; r.updated_at = now(); return r; });
  const rider = findOne('Riders', 'rider_id', p.rider_id);
  updateWhere('Users', 'user_id', rider.user_id, u => { u.status = 'ACTIVE'; u.updated_at = now(); return u; });
  return { ok: true };
}

function adminOrders(p, session) { requireRole(session, 'ADMIN'); return { ok: true, orders: rows('Orders') }; }

function adminSetCommission(p, session) {
  requireRole(session, 'ADMIN');
  if (p.restaurant_id) updateWhere('Restaurants', 'restaurant_id', p.restaurant_id, r => { r.commission_rate = Number(p.rate); r.updated_at = now(); return r; });
  if (p.rider_id) updateWhere('Riders', 'rider_id', p.rider_id, r => { r.commission_rate = Number(p.rate); r.updated_at = now(); return r; });
  return { ok: true };
}

function finalizeOrder(order) {
  const restaurant = findOne('Restaurants', 'restaurant_id', order.restaurant_id);
  const cashback = Number(order.subtotal) * CASHBACK_RATE;
  const platformCommission = Number(order.subtotal) * Number(restaurant.commission_rate || 0);
  order.cashback_earned = Number(cashback.toFixed(2));
  order.platform_commission = Number(platformCommission.toFixed(2));
  order.payment_status = order.payment_method === 'CASH' ? 'CASH_ON_DELIVERY' : 'PAID';
  appendRow('Rewards', { reward_id: id('REW'), user_id: order.client_user_id, order_id: order.order_id, type: 'CASHBACK', amount: order.cashback_earned, status: 'AVAILABLE', created_at: now() });
  updateWhere('Users', 'user_id', order.client_user_id, u => { u.cashback_balance = Number(u.cashback_balance || 0) + order.cashback_earned; u.updated_at = now(); return u; });
}

function notifyRestaurant(restaurantId, orderId) { appendRow('Notifications', { notification_id: id('NOT'), target_role: 'RESTAURANT', target_id: restaurantId, order_id: orderId, type: 'NEW_ORDER', title: 'Nuevo pedido', message: 'Tienes un pedido pendiente de aceptar.', status: 'UNREAD', created_at: now(), read_at: '' }); }
function notifyNearbyRiders(orderId) { appendRow('Notifications', { notification_id: id('NOT'), target_role: 'RIDER', target_id: 'NEARBY', order_id: orderId, type: 'RIDER_SEARCH', title: 'Pedido cercano disponible', message: 'Hay un pedido listo para asignar.', status: 'UNREAD', created_at: now(), read_at: '' }); }

function createUser(role, p, status) {
  if (findOne('Users', 'email', normalizeEmail(p.email))) throw new Error('El correo ya está registrado');
  const salt = Utilities.getUuid();
  const user = { user_id: id('USR'), role, full_name: p.full_name, email: normalizeEmail(p.email), phone: p.phone, password_hash: hashPassword(p.password, salt), salt, status, prime_status: 'FREE', cashback_balance: 0, created_at: now(), updated_at: now() };
  appendRow('Users', user);
  return user;
}

function requireSession(token) {
  if (!token) throw new Error('Token requerido');
  const session = findOne('Sessions', 'token', token);
  if (!session) throw new Error('Sesión inválida');
  if (new Date(session.expires_at) < new Date()) throw new Error('Sesión expirada');
  return session;
}
function requireRole(session, role) { if (session.role !== role && session.role !== 'ADMIN') throw new Error('Rol no autorizado'); }
function restaurantByOwner(userId) { const r = findOne('Restaurants', 'owner_user_id', userId); if (!r) throw new Error('Restaurante no encontrado'); return r; }
function validateFields(p, fields) { fields.forEach(f => { if (p[f] === undefined || p[f] === null || p[f] === '') throw new Error('Campo requerido: ' + f); }); }
function sanitizeUser(u) { return { user_id: u.user_id, role: u.role, full_name: u.full_name, email: u.email, phone: u.phone, status: u.status, prime_status: u.prime_status, cashback_balance: Number(u.cashback_balance || 0) }; }

function rows(sheetName) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const data = sh.getDataRange().getValues();
  const headers = data.shift();
  return data.filter(r => r.join('') !== '').map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
}
function appendRow(sheetName, obj) { const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName); const headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0]; sh.appendRow(headers.map(h => obj[h] !== undefined ? obj[h] : '')); }
function findOne(sheetName, key, value) { return rows(sheetName).find(r => String(r[key]).toLowerCase() === String(value).toLowerCase()); }
function updateWhere(sheetName, key, value, updater) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const idx = headers.indexOf(key);
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idx]) === String(value)) {
      const rowObj = Object.fromEntries(headers.map((h, j) => [h, data[i][j]]));
      const updated = updater(rowObj);
      sh.getRange(i + 1, 1, 1, headers.length).setValues([headers.map(h => updated[h] !== undefined ? updated[h] : '')]);
      return updated;
    }
  }
  throw new Error('Registro no encontrado: ' + sheetName + ' ' + key + '=' + value);
}
function id(prefix) { return prefix + '-' + Utilities.getUuid().split('-')[0].toUpperCase(); }
function now() { return new Date().toISOString(); }
function addHours(h) { return new Date(Date.now() + h * 3600000).toISOString(); }
function normalizeEmail(email) { return String(email).trim().toLowerCase(); }
function hashPassword(password, salt) { const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + String(password)); return raw.map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join(''); }
function slugify(s) { return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
function haversine(lat1, lon1, lat2, lon2) { const R = 6371; const dLat = (lat2-lat1)*Math.PI/180; const dLon = (lon2-lon1)*Math.PI/180; const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2; return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); }
function jsonResponse(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
