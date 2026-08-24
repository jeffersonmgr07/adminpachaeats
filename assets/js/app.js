const PE={
  base:document.body.dataset.base||'',
  data:{},
  cart:[],
  ORDER_KEY:'pe_demo_orders_v2',
  LAST_ORDER_KEY:'pe_last_order',
  RESTAURANT_DEMO_KEY:'pe_restaurant_demo_id',
  RIDER_NAME:'Diego R.',
  async load(){
    const files=['restaurants','products','categories','promotions','orders','riders','business-config'];
    await Promise.all(files.map(async f=>{try{const r=await fetch(`${this.base}assets/data/${f}.json`);this.data[f]=await r.json()}catch(e){this.data[f]=[];console.warn('Pacha Eats: no se pudo cargar',f,e)}}));
    this.cart=this.normalizeCart(JSON.parse(localStorage.getItem('pe_cart')||'[]'));
    this.renderCartMini();
    return this.data;
  },
  normalizeCart(items){return (Array.isArray(items)?items:[]).map((i,n)=>({lineId:i.lineId||`${i.id||'item'}-${Date.now()}-${n}`,id:i.id,qty:Math.max(1,Number(i.qty||1)),modifiers:Array.isArray(i.modifiers)?i.modifiers:[],note:i.note||''})).filter(i=>i.id)},
  money(n){return `S/ ${Number(n||0).toFixed(2)}`},
  escape(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))},
  getProduct(id){return this.data.products?.find(x=>x.id===id)},
  getRestaurant(id){return this.data.restaurants?.find(x=>x.id===id)},
  cartRestaurantId(){const first=this.cart[0];return first?this.getProduct(first.id)?.restaurantId:null},
  modifierTotal(item){return (item.modifiers||[]).reduce((s,m)=>s+Number(m.price||0),0)},
  lineUnit(item){const p=this.getProduct(item.id);return Number(p?.price||0)+this.modifierTotal(item)},
  lineTotal(item){return this.lineUnit(item)*Number(item.qty||1)},
  saveCart(){localStorage.setItem('pe_cart',JSON.stringify(this.cart));this.renderCartMini();window.dispatchEvent(new CustomEvent('pe:cart'))},
  ensureRestaurant(product){const current=this.cartRestaurantId();if(current&&current!==product.restaurantId){if(!confirm('Tu carrito contiene productos de otro restaurante. ¿Quieres vaciarlo y empezar un pedido nuevo?'))return false;this.cart=[]}return true},
  addConfigured(productId,{qty=1,modifiers=[],note=''}={}){const p=this.getProduct(productId);if(!p||!this.ensureRestaurant(p))return false;const normalized=(modifiers||[]).map(m=>({groupId:m.groupId||'',optionId:m.optionId||'',groupName:m.groupName||'',name:m.name||'',price:Number(m.price||0)}));const signature=JSON.stringify({id:productId,modifiers:normalized.map(m=>[m.optionId,m.price]).sort(),note:(note||'').trim()});const existing=this.cart.find(i=>JSON.stringify({id:i.id,modifiers:(i.modifiers||[]).map(m=>[m.optionId,m.price]).sort(),note:(i.note||'').trim()})===signature);if(existing)existing.qty+=Number(qty||1);else this.cart.push({lineId:`line-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,id:productId,qty:Number(qty||1),modifiers:normalized,note:(note||'').trim()});this.saveCart();return true},
  add(productId){const p=this.getProduct(productId);if(!p)return;if(typeof window.openProductModal==='function')return window.openProductModal(productId);return this.addConfigured(productId)},
  remove(ref){this.cart=this.cart.filter(x=>x.lineId!==ref&&x.id!==ref);this.saveCart()},
  changeQty(ref,delta){const item=this.cart.find(x=>x.lineId===ref)||this.cart.find(x=>x.id===ref);if(!item)return;item.qty+=Number(delta||0);if(item.qty<=0)this.cart=this.cart.filter(x=>x!==item);this.saveCart()},
  cartTotals(){const subtotal=this.cart.reduce((s,i)=>s+this.lineTotal(i),0);const rest=this.getRestaurant(this.cartRestaurantId());const delivery=subtotal>0?Number(rest?.deliveryFee||6):0;const serviceFee=0;const cashback=Number((subtotal*0.01).toFixed(2));return{subtotal,delivery,serviceFee,cashback,total:subtotal+delivery+serviceFee}},
  renderCartMini(){const count=this.cart.reduce((s,i)=>s+Number(i.qty||0),0);document.querySelectorAll('[data-cart-count]').forEach(el=>el.textContent=count)},
  orderStatusLabel(status=''){return ({PENDING_RESTAURANT:'Pendiente de restaurante',ACCEPTED:'Aceptado',PREPARING:'En preparación',READY:'Listo para recojo',DRIVER_ASSIGNED:'Repartidor asignado',PICKED_UP:'Pedido recogido',ON_THE_WAY:'En camino',DELIVERED:'Entregado',CANCELLED:'Cancelado'})[status]||status},
  paymentStatusLabel(status=''){return ({PENDING:'Pendiente',APPROVED:'Aprobado',CASH_ON_DELIVERY:'Pago contra entrega',REFUNDED:'Reembolsado'})[status]||status},
  getOrders(){try{return JSON.parse(localStorage.getItem(this.ORDER_KEY)||'[]')}catch{return[]}},
  saveOrders(orders){localStorage.setItem(this.ORDER_KEY,JSON.stringify(orders));window.dispatchEvent(new CustomEvent('pe:orders'))},
  getOrder(id){return this.getOrders().find(o=>o.id===id)},
  createOrder(fields={}){
    if(!this.cart.length)throw new Error('Tu carrito está vacío.');
    const restaurant=this.getRestaurant(this.cartRestaurantId());if(!restaurant)throw new Error('No se pudo identificar el restaurante.');
    const totals=this.cartTotals();const stamp=Date.now();let id;do{id=`PE-${Math.floor(100000+Math.random()*900000)}`}while(this.getOrders().some(o=>o.id===id));const pin=String(Math.floor(1000+Math.random()*9000));
    const order={id,customer:fields.customer||'Cliente Pacha Eats',phone:fields.phone||'',address:fields.address||'',reference:fields.reference||'',deliveryNotes:fields.deliveryNotes||'',restaurantId:restaurant.id,restaurant:restaurant.name,restaurantAddress:restaurant.address,status:'PENDING_RESTAURANT',paymentStatus:fields.paymentMethod==='CASH'?'CASH_ON_DELIVERY':'PENDING',paymentMethod:fields.paymentMethod||'MERCADO_PAGO_DEMO',receiptType:fields.receiptType||'BOLETA',rider:'',riderId:'',subtotal:totals.subtotal,delivery:totals.delivery,serviceFee:totals.serviceFee,total:totals.total,cashbackEstimate:totals.cashback,distanceKm:Number(fields.distanceKm||3.9),deliveryPin:pin,createdAt:new Date(stamp).toISOString(),updatedAt:new Date(stamp).toISOString(),items:this.cart.map(i=>{const p=this.getProduct(i.id);return{lineId:i.lineId,productId:i.id,name:p?.name||i.id,qty:i.qty,basePrice:Number(p?.price||0),unitPrice:this.lineUnit(i),lineTotal:this.lineTotal(i),modifiers:i.modifiers||[],note:i.note||''}}),events:[{status:'PENDING_RESTAURANT',label:'Pedido recibido',actor:'CUSTOMER',at:new Date(stamp).toISOString()}]};
    const orders=this.getOrders();orders.unshift(order);this.saveOrders(orders);localStorage.setItem(this.LAST_ORDER_KEY,id);this.cart=[];this.saveCart();return order;
  },
  updateOrder(id,patch={},event={}){const orders=this.getOrders();const idx=orders.findIndex(o=>o.id===id);if(idx<0)return null;orders[idx]={...orders[idx],...patch,updatedAt:new Date().toISOString()};if(event.status){orders[idx].events=Array.isArray(orders[idx].events)?orders[idx].events:[];orders[idx].events.push({status:event.status,label:event.label||this.orderStatusLabel(event.status),actor:event.actor||'SYSTEM',at:new Date().toISOString()})}this.saveOrders(orders);return orders[idx]},
  transitionOrder(id,status,actor='SYSTEM',extra={}){return this.updateOrder(id,{status,...extra},{status,label:this.orderStatusLabel(status),actor})},
  restaurantDemoId(){return localStorage.getItem(this.RESTAURANT_DEMO_KEY)||'qori-chicken'},
  setRestaurantDemoId(id){localStorage.setItem(this.RESTAURANT_DEMO_KEY,id)},
  ordersForRestaurant(id=this.restaurantDemoId()){return this.getOrders().filter(o=>o.restaurantId===id)},
  availableDriverOrders(){return this.getOrders().filter(o=>o.status==='READY'&&!o.riderId)},
  activeDriverOrders(){return this.getOrders().filter(o=>o.riderId==='demo-rider'&&!['DELIVERED','CANCELLED'].includes(o.status))},
  completedDriverOrders(){return this.getOrders().filter(o=>o.riderId==='demo-rider'&&o.status==='DELIVERED')}
};
function header(base=''){
  return `<header class="topbar"><div class="container"><nav class="nav"><a class="brand" href="${base}index.html"><img src="${base}assets/img/logos/Logo1.png" alt="Pacha Eats"><span>Pacha Eats</span></a><label class="searchbar"><span>⌕</span><input placeholder="Buscar restaurantes o platos"></label><a class="nav-chip" href="${base}clientes/login.html">Mi cuenta</a><a class="cart-pill" href="${base}checkout.html">🛒 <span data-cart-count>0</span></a></nav><div class="quickbar"><a href="${base}index.html">Inicio</a><a href="${base}productos.html">Productos</a><a href="${base}restaurantes.html">Restaurantes</a><a href="${base}seguimiento-pedido.html">Rastrear</a><a href="${base}clientes/prime.html">Pacha+</a></div></div></header>`
}
function footer(base=''){
  return `<footer class="footer"><div class="container footer-grid"><div><h3>Pacha Eats</h3><p>Marketplace local de delivery para Pachacámac y zonas configurables.</p></div><div><h4>Clientes</h4><a href="${base}productos.html">Pedir</a><a href="${base}seguimiento-pedido.html">Rastrear</a></div><div><h4>Aliados</h4><a href="${base}restaurantes/index.html">Portal restaurantes</a><a href="${base}repartidores/index.html">Portal repartidores</a></div><div><h4>Operación</h4><a href="${base}admin/index.html">Administración</a></div></div></footer>`
}
function mountLayout(base=''){PE.base=base;document.body.insertAdjacentHTML('afterbegin',header(base));const addFooter=()=>{if(!document.querySelector('.footer'))document.body.insertAdjacentHTML('beforeend',footer(base))};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',addFooter):addFooter();PE.renderCartMini()}
function restaurantCard(r,base=''){return `<article class="restaurant-card"><img class="restaurant-cover" src="${base}${r.cover}" alt="${PE.escape(r.name)}"><div class="restaurant-row"><img class="restaurant-logo" src="${base}${r.logo}" alt=""><div><h3>${PE.escape(r.name)}</h3><div class="meta"><span>★ ${r.rating}</span><span>${r.deliveryTime}</span></div></div></div><p>${PE.escape(r.category)} · ${PE.escape(r.address)}</p><a class="btn btn-primary" href="${base}restaurante.html?id=${encodeURIComponent(r.id)}">Ver restaurante</a></article>`}
function productCard(p,base=''){const r=PE.data.restaurants?.find(x=>x.id===p.restaurantId);return `<article class="product-card"><button class="product-card-open" type="button" onclick="openProductModal('${p.id}')"><img src="${base}${p.image}" alt="${PE.escape(p.name)}"></button><div class="meta"><span>${PE.escape(r?.name||'')}</span></div><h3>${PE.escape(p.name)}</h3><p>${PE.escape(p.description)}</p><div class="price-row"><div><span class="price">${PE.money(p.price)}</span>${p.before?`<span class="before">${PE.money(p.before)}</span>`:''}</div><button class="btn btn-primary" onclick="openProductModal('${p.id}')">Agregar</button></div></article>`}
function renderCartBox(target){const el=document.querySelector(target);if(!el)return;const items=PE.cart.map(i=>{const p=PE.getProduct(i.id);if(!p)return'';const mods=(i.modifiers||[]).length?`<small class="cart-mods">${i.modifiers.map(m=>PE.escape(m.name)+(m.price?` (+${PE.money(m.price)})`:'')).join(' · ')}</small>`:'';const note=i.note?`<small class="cart-note">“${PE.escape(i.note)}”</small>`:'';return `<div class="cart-item-rich"><div class="cart-item-copy"><strong>${PE.escape(p.name)}</strong>${mods}${note}<div class="cart-qty"><button type="button" onclick="PE.changeQty('${i.lineId}',-1)">−</button><span>${i.qty}</span><button type="button" onclick="PE.changeQty('${i.lineId}',1)">+</button></div></div><div class="cart-item-price"><strong>${PE.money(PE.lineTotal(i))}</strong><button class="cart-remove" type="button" onclick="PE.remove('${i.lineId}')">Eliminar</button></div></div>`}).join('');const t=PE.cartTotals();el.innerHTML=`<div class="cart-title-row"><h3>Tu pedido</h3><span>${PE.cart.reduce((s,i)=>s+i.qty,0)} ítems</span></div>${items||'<div class="empty">Tu carrito está vacío.</div>'}<div class="cart-summary-row"><span>Subtotal</span><strong>${PE.money(t.subtotal)}</strong></div><div class="cart-summary-row"><span>Delivery</span><strong>${PE.money(t.delivery)}</strong></div>${t.subtotal?`<div class="cart-reward">✦ Ganarías aprox. ${PE.money(t.cashback)} en cashback</div>`:''}<div class="cart-total"><span>Total</span><strong>${PE.money(t.total)}</strong></div><a class="btn btn-primary" style="width:100%" href="${PE.base}checkout.html">Continuar</a>`}
window.PE=PE;window.mountLayout=mountLayout;window.restaurantCard=restaurantCard;window.productCard=productCard;window.renderCartBox=renderCartBox;
