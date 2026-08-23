const PE={
  base:document.body.dataset.base||'',
  data:{},
  cart:JSON.parse(localStorage.getItem('pe_cart')||'[]'),
  async load(){
    const files=['restaurants','products','categories','promotions','orders','riders','business-config'];
    await Promise.all(files.map(async f=>{try{const r=await fetch(`${this.base}assets/data/${f}.json`);this.data[f]=await r.json()}catch(e){this.data[f]=[];console.warn('Pacha Eats: no se pudo cargar',f,e)}}));
    this.renderCartMini();
    return this.data;
  },
  money(n){return `S/ ${Number(n||0).toFixed(2)}`},
  saveCart(){localStorage.setItem('pe_cart',JSON.stringify(this.cart));this.renderCartMini();window.dispatchEvent(new CustomEvent('pe:cart'))},
  add(productId){const p=this.data.products?.find(x=>x.id===productId);if(!p)return;const currentRestaurant=this.cart[0]&&this.data.products?.find(x=>x.id===this.cart[0].id)?.restaurantId;if(currentRestaurant&&currentRestaurant!==p.restaurantId){if(!confirm('Tu carrito contiene productos de otro restaurante. ¿Quieres vaciarlo y continuar?'))return;this.cart=[]}const found=this.cart.find(x=>x.id===productId);found?found.qty++:this.cart.push({id:productId,qty:1});this.saveCart()},
  remove(productId){this.cart=this.cart.filter(x=>x.id!==productId);this.saveCart()},
  changeQty(productId,delta){const item=this.cart.find(x=>x.id===productId);if(!item)return;item.qty+=delta;if(item.qty<=0)this.cart=this.cart.filter(x=>x.id!==productId);this.saveCart()},
  cartTotals(){const subtotal=this.cart.reduce((s,i)=>{const p=this.data.products?.find(x=>x.id===i.id);return s+(p?p.price*i.qty:0)},0);const restaurantId=this.cart[0]?this.data.products?.find(x=>x.id===this.cart[0].id)?.restaurantId:null;const rest=this.data.restaurants?.find(r=>r.id===restaurantId);const delivery=subtotal>0?(rest?.deliveryFee||6):0;return{subtotal,delivery,total:subtotal+delivery}},
  renderCartMini(){const count=this.cart.reduce((s,i)=>s+i.qty,0);document.querySelectorAll('[data-cart-count]').forEach(el=>el.textContent=count)},
  escape(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
};
function header(base=''){
  return `<header class="topbar"><div class="container"><nav class="nav"><a class="brand" href="${base}index.html"><img src="${base}assets/img/logos/Logo1.png" alt="Pacha Eats"><span>Pacha Eats</span></a><label class="searchbar"><span>⌕</span><input placeholder="Buscar restaurantes o platos"></label><a class="nav-chip" href="${base}clientes/login.html">Mi cuenta</a><a class="cart-pill" href="${base}checkout.html">🛒 <span data-cart-count>0</span></a></nav><div class="quickbar"><a href="${base}index.html">Inicio</a><a href="${base}productos.html">Productos</a><a href="${base}restaurantes.html">Restaurantes</a><a href="${base}seguimiento-pedido.html">Rastrear</a><a href="${base}clientes/prime.html">Pacha+</a></div></div></header>`
}
function footer(base=''){
  return `<footer class="footer"><div class="container footer-grid"><div><h3>Pacha Eats</h3><p>Marketplace local de delivery para Pachacámac y zonas configurables.</p></div><div><h4>Clientes</h4><a href="${base}productos.html">Pedir</a><a href="${base}seguimiento-pedido.html">Rastrear</a></div><div><h4>Aliados</h4><a href="${base}restaurantes/index.html">Portal restaurantes</a><a href="${base}repartidores/index.html">Portal repartidores</a></div><div><h4>Operación</h4><a href="${base}admin/index.html">Administración</a></div></div></footer>`
}
function mountLayout(base=''){
  PE.base=base;document.body.insertAdjacentHTML('afterbegin',header(base));const addFooter=()=>{if(!document.querySelector('.footer'))document.body.insertAdjacentHTML('beforeend',footer(base))};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',addFooter):addFooter();PE.renderCartMini()
}
function restaurantCard(r,base=''){
  return `<article class="restaurant-card"><img class="restaurant-cover" src="${base}${r.cover}" alt="${PE.escape(r.name)}"><div class="restaurant-row"><img class="restaurant-logo" src="${base}${r.logo}" alt=""><div><h3>${PE.escape(r.name)}</h3><div class="meta"><span>★ ${r.rating}</span><span>${r.deliveryTime}</span></div></div></div><p>${PE.escape(r.category)} · ${PE.escape(r.address)}</p><a class="btn btn-primary" href="${base}restaurante.html?id=${encodeURIComponent(r.id)}">Ver restaurante</a></article>`
}
function productCard(p,base=''){
  const r=PE.data.restaurants?.find(x=>x.id===p.restaurantId);return `<article class="product-card"><img src="${base}${p.image}" alt="${PE.escape(p.name)}"><div class="meta"><span>${PE.escape(r?.name||'')}</span></div><h3>${PE.escape(p.name)}</h3><p>${PE.escape(p.description)}</p><div class="price-row"><div><span class="price">${PE.money(p.price)}</span>${p.before?`<span class="before">${PE.money(p.before)}</span>`:''}</div><button class="btn btn-primary" onclick="PE.add('${p.id}')">Agregar</button></div></article>`
}
function renderCartBox(target){const el=document.querySelector(target);if(!el)return;const items=PE.cart.map(i=>{const p=PE.data.products?.find(x=>x.id===i.id);return p?`<div class="cart-line"><span>${i.qty}× ${PE.escape(p.name)}</span><strong>${PE.money(i.qty*p.price)}</strong><button class="btn btn-soft" onclick="PE.remove('${p.id}')">×</button></div>`:''}).join('');const t=PE.cartTotals();el.innerHTML=`<h3>Tu pedido</h3>${items||'<div class="empty">Tu carrito está vacío.</div>'}<div class="cart-line"><span>Subtotal</span><strong>${PE.money(t.subtotal)}</strong></div><div class="cart-line"><span>Delivery</span><strong>${PE.money(t.delivery)}</strong></div><div class="cart-total"><span>Total</span><strong>${PE.money(t.total)}</strong></div><a class="btn btn-primary" style="width:100%" href="${PE.base}checkout.html">Continuar</a>`}
window.PE=PE;window.mountLayout=mountLayout;window.restaurantCard=restaurantCard;window.productCard=productCard;window.renderCartBox=renderCartBox;
