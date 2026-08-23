function seedPachaEatsDemo() {
  setupPachaEats();
  const now = new Date().toISOString();

  appendUnique_('USERS', [
    ['usr_superadmin','admin@pachaeats.demo','999000001','Jefferson Demo','ACTIVE',now,now,'seed'],
    ['usr_merchant','comercio@pachaeats.demo','999000002','Andrea Comercio','ACTIVE',now,now,'seed'],
    ['usr_driver','rider@pachaeats.demo','999000003','Diego Rider','ACTIVE',now,now,'seed'],
    ['usr_customer','cliente@pachaeats.demo','999000004','María Cliente','ACTIVE',now,now,'seed']
  ]);

  appendUnique_('USER_ROLES', [
    ['role_1','usr_superadmin','SUPERADMIN','ACTIVE',now,now,'seed'],
    ['role_2','usr_merchant','MERCHANT_ADMIN','ACTIVE',now,now,'seed'],
    ['role_3','usr_driver','DRIVER','ACTIVE',now,now,'seed'],
    ['role_4','usr_customer','CUSTOMER','ACTIVE',now,now,'seed']
  ]);

  appendUnique_('MERCHANTS', [
    ['mer_pacha_burger','Pacha Burger SAC','Pacha Burger','RESTAURANT',0.10,'ACTIVE',now,now,'seed'],
    ['mer_pacha_market','Pacha Market SAC','Pacha Market','MINIMARKET',0.15,'ACTIVE',now,now,'seed'],
    ['mer_vida_farma','Vida Farma SAC','Vida Farma','PHARMACY',0.00,'ACTIVE',now,now,'seed']
  ]);

  appendUnique_('STORE_LOCATIONS', [
    ['store_burger_1','mer_pacha_burger','Pacha Burger Centro','Av. Lima 420','Pachacámac','','',15,20,'ACTIVE',now,now],
    ['store_market_1','mer_pacha_market','Pacha Market Centro','Jr. Comercio 180','Pachacámac','','',10,15,'ACTIVE',now,now],
    ['store_farma_1','mer_vida_farma','Vida Farma Centro','Av. Manuel Valle 210','Pachacámac','','',10,15,'ACTIVE',now,now]
  ]);

  appendUnique_('CATALOG_CATEGORIES', [
    ['cat_burgers','mer_pacha_burger','store_burger_1','Hamburguesas',1,'ACTIVE',now,now],
    ['cat_market','mer_pacha_market','store_market_1','Abarrotes',1,'ACTIVE',now,now],
    ['cat_farma','mer_vida_farma','store_farma_1','Cuidado personal',1,'ACTIVE',now,now]
  ]);

  appendUnique_('PRODUCTS', [
    ['prd_burger_classic','mer_pacha_burger','store_burger_1','cat_burgers','PB-001','Hamburguesa clásica','Carne, queso, lechuga, tomate y salsa de la casa',22.90,false,'ACTIVE',now,now],
    ['prd_water','mer_pacha_market','store_market_1','cat_market','PM-001','Agua mineral 625 ml','Agua sin gas',2.50,true,'ACTIVE',now,now],
    ['prd_shampoo','mer_vida_farma','store_farma_1','cat_farma','VF-001','Shampoo neutro','Producto demo de cuidado personal',14.90,true,'ACTIVE',now,now]
  ]);

  appendUnique_('DRIVERS', [
    ['drv_diego','usr_driver','MOTO',4.9,0,'ONLINE','APPROVED','ACTIVE',now,now]
  ]);
}

function appendUnique_(sheetName, rows) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error('Missing sheet: ' + sheetName);
  const values = sheet.getDataRange().getValues();
  const existingIds = {};
  for (let i = 1; i < values.length; i++) existingIds[String(values[i][0])] = true;
  const pending = rows.filter(function(row) { return !existingIds[String(row[0])]; });
  if (!pending.length) return;
  sheet.getRange(sheet.getLastRow() + 1, 1, pending.length, pending[0].length).setValues(pending);
}
