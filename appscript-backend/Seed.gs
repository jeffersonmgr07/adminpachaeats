function seedDemoData() {
  const admin = createUser('ADMIN', { full_name: 'Administrador Pacha Eats', email: 'admin@pachaeats.pe', phone: '999999999', password: 'admin123' }, 'ACTIVE');
  const restUser = createUser('RESTAURANT', { full_name: 'Pacha Burger Owner', email: 'burger@pachaeats.pe', phone: '988888888', password: 'demo123' }, 'ACTIVE');
  appendRow('Restaurants', {
    restaurant_id: 'RES-DEMO1', owner_user_id: restUser.user_id, name: 'Pacha Burger', slug: 'pacha-burger',
    category: 'Hamburguesas', phone: '988888888', address: 'Pachacamac, Lima', lat: -12.2306, lng: -76.8589,
    status: 'ACTIVE', open_now: true, schedule_json: '{}', commission_rate: 0, rating: 4.8, created_at: now(), updated_at: now()
  });
  appendRow('Products', { product_id: 'PRO-DEMO1', restaurant_id: 'RES-DEMO1', name: 'Hamburguesa Pacha', description: 'Carne, queso, papas y salsa de casa', category: 'Hamburguesas', price: 24.9, image_url: '', available: true, prep_minutes: 18, promo_price: '', created_at: now(), updated_at: now() });
  return { ok: true, admin_email: 'admin@pachaeats.pe', admin_password: 'admin123' };
}
