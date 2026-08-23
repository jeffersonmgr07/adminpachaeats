const PACHA_EATS_SHEETS = {
  USERS: ['id','email','phone','display_name','status','created_at','updated_at','created_by'],
  USER_ROLES: ['id','user_id','role','status','created_at','updated_at','created_by'],
  CUSTOMER_PROFILES: ['id','user_id','cashback_points','trust_level','status','created_at','updated_at'],
  ADDRESSES: ['id','user_id','label','address_text','district','lat','lng','instructions','is_default','status','created_at','updated_at'],
  MERCHANTS: ['id','legal_name','trade_name','merchant_type','commission_rate','status','created_at','updated_at','created_by'],
  MERCHANT_USERS: ['id','merchant_id','user_id','role','status','created_at','updated_at'],
  STORE_LOCATIONS: ['id','merchant_id','name','address_text','district','lat','lng','min_order','prep_time_min','status','created_at','updated_at'],
  BUSINESS_HOURS: ['id','store_id','weekday','open_time','close_time','is_closed','created_at','updated_at'],
  MERCHANT_DOCUMENTS: ['id','merchant_id','document_type','file_url','verification_status','expires_at','created_at','updated_at'],
  CATALOG_CATEGORIES: ['id','merchant_id','store_id','name','sort_order','status','created_at','updated_at'],
  PRODUCTS: ['id','merchant_id','store_id','category_id','sku','name','description','price','stock_enabled','status','created_at','updated_at'],
  PRODUCT_VARIANTS: ['id','product_id','name','price_delta','status','created_at','updated_at'],
  MODIFIER_GROUPS: ['id','merchant_id','name','min_select','max_select','required','status','created_at','updated_at'],
  MODIFIER_OPTIONS: ['id','modifier_group_id','name','price_delta','status','created_at','updated_at'],
  PRODUCT_MODIFIER_GROUPS: ['id','product_id','modifier_group_id','sort_order','created_at'],
  INVENTORY: ['id','product_id','stock_qty','low_stock_threshold','updated_at','updated_by'],
  PRODUCT_IMAGES: ['id','product_id','drive_file_id','image_url','sort_order','status','created_at'],
  ORDERS: ['id','order_code','customer_id','merchant_id','store_id','subtotal','discount_total','delivery_fee','service_fee','cashback_used','total','order_status','payment_status','delivery_status','commission_rate_snapshot','created_at','updated_at'],
  ORDER_ITEMS: ['id','order_id','product_id','product_name_snapshot','unit_price_snapshot','quantity','line_total','created_at'],
  ORDER_ITEM_MODIFIERS: ['id','order_item_id','modifier_name_snapshot','price_snapshot','created_at'],
  ORDER_STATUS_EVENTS: ['id','order_id','event_type','from_status','to_status','actor_user_id','actor_role','metadata_json','created_at'],
  DELIVERY_JOBS: ['id','order_id','driver_id','status','pickup_zone','dropoff_zone','distance_km','driver_fee','created_at','updated_at'],
  DELIVERY_OFFERS: ['id','delivery_job_id','driver_id','status','expires_at','accepted_at','created_at'],
  DRIVERS: ['id','user_id','vehicle_type','rating','cash_debt','online_status','kyc_status','status','created_at','updated_at'],
  VEHICLES: ['id','driver_id','vehicle_type','brand','model','plate','status','created_at','updated_at'],
  DRIVER_DOCUMENTS: ['id','driver_id','document_type','file_url','verification_status','expires_at','created_at','updated_at'],
  DRIVER_LOCATIONS_CURRENT: ['driver_id','lat','lng','accuracy_m','recorded_at'],
  PAYMENTS: ['id','order_id','provider','provider_payment_id','external_reference','amount','status','idempotency_key','created_at','updated_at'],
  PAYMENT_EVENTS: ['id','payment_id','provider_event_id','event_type','payload_json','processed','created_at'],
  REFUNDS: ['id','payment_id','order_id','amount','reason','status','created_at','updated_at'],
  COMMISSION_RULES: ['id','merchant_id','store_id','rate','starts_at','ends_at','reason','priority','status','created_at','created_by'],
  DRIVER_LEDGER: ['id','driver_id','order_id','type','amount','reference','created_at','created_by'],
  MERCHANT_LEDGER: ['id','merchant_id','order_id','type','amount','reference','created_at','created_by'],
  MERCHANT_SETTLEMENTS: ['id','merchant_id','period_start','period_end','gross_amount','fees_amount','net_amount','status','paid_at','created_at'],
  DRIVER_SETTLEMENTS: ['id','driver_id','period_start','period_end','gross_earnings','cash_offset','net_amount','status','paid_at','created_at'],
  CASH_COLLECTIONS: ['id','driver_id','order_id','amount_collected','amount_due_platform','status','settled_at','created_at'],
  CASHBACK_LEDGER: ['id','customer_id','order_id','type','points','reference','expires_at','created_at','created_by'],
  COUPONS: ['id','code','discount_type','discount_value','min_order','starts_at','ends_at','usage_limit','status','created_at','updated_at'],
  COUPON_REDEMPTIONS: ['id','coupon_id','customer_id','order_id','discount_amount','created_at'],
  DELIVERY_ZONES: ['id','name','district','polygon_json','status','created_at','updated_at'],
  DELIVERY_RATE_RULES: ['id','zone_id','base_fee','per_km_fee','min_fee','max_distance_km','status','created_at','updated_at'],
  CUSTOMER_TRUST_RULES: ['id','scope_type','scope_id','required_online_orders','max_cod_amount','status','created_at','updated_at'],
  REVIEWS: ['id','order_id','customer_id','merchant_rating','driver_rating','comment','status','created_at'],
  SUPPORT_TICKETS: ['id','order_id','user_id','category','subject','status','priority','created_at','updated_at'],
  NOTIFICATIONS: ['id','user_id','channel','template_key','subject','body','status','sent_at','created_at'],
  WEBHOOK_EVENTS: ['id','provider','event_id','event_type','payload_json','processed','processed_at','created_at'],
  AUDIT_LOG: ['id','actor_user_id','actor_role','action','resource_type','resource_id','before_json','after_json','created_at'],
  SYSTEM_CONFIG: ['key','value','description','updated_at','updated_by']
};

function setupPachaEats() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(PACHA_EATS_SHEETS).forEach(function(sheetName) {
    const headers = PACHA_EATS_SHEETS[sheetName];
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) sheet = ss.insertSheet(sheetName);
    const current = sheet.getRange(1, 1, 1, Math.max(headers.length, 1)).getValues()[0];
    const needsHeaders = headers.some(function(header, index) { return current[index] !== header; });
    if (needsHeaders) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
  });
  seedSystemConfig_();
}

function seedSystemConfig_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SYSTEM_CONFIG');
  const values = sheet.getDataRange().getValues();
  const existing = {};
  for (let i = 1; i < values.length; i++) existing[values[i][0]] = true;
  const now = new Date().toISOString();
  const defaults = [
    ['APP_NAME','Pacha Eats','Nombre público de la aplicación',now,'setup'],
    ['CURRENCY','PEN','Moneda operativa inicial',now,'setup'],
    ['PILOT_ZONE','Pachacámac, Lima','Zona inicial del piloto',now,'setup'],
    ['CASHBACK_RATE','0.01','Cashback base sobre subtotal elegible',now,'setup'],
    ['COD_REQUIRED_ONLINE_ORDERS','3','Pedidos online exitosos antes de habilitar efectivo',now,'setup']
  ];
  defaults.filter(function(row) { return !existing[row[0]]; }).forEach(function(row) { sheet.appendRow(row); });
}
