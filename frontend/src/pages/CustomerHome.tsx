import { ArrowRight, ChevronRight, Clock3, Search, Sparkles, Star } from 'lucide-react';
import AppHeader from '../components/AppHeader';
import BottomNav from '../components/BottomNav';
import { categories, stores } from '../data/mock';

export default function CustomerHome() {
  return (
    <div className="customer-app">
      <AppHeader />
      <main>
        <section className="hero container">
          <div className="hero-copy">
            <span className="eyebrow"><Sparkles size={15} /> Delivery local, rápido y confiable</span>
            <h1>¿Qué se te antoja <span>hoy?</span></h1>
            <p>Comida, mercado, farmacia y más. Todo cerca de ti.</p>
            <label className="search-box">
              <Search size={21} />
              <input placeholder="Buscar restaurantes, platos o productos" />
            </label>
          </div>
          <div className="hero-card">
            <div className="hero-food">🍕</div>
            <div className="hero-badge"><strong>30%</strong><span>OFF</span></div>
            <div className="hero-card-copy"><small>OFERTA DEL DÍA</small><strong>Tu primera orden tiene descuento</strong><span>Usa el cupón PACHA30</span></div>
          </div>
        </section>

        <section className="container section-block">
          <div className="section-heading"><div><span className="section-kicker">Explora</span><h2>¿Qué necesitas?</h2></div><button>Ver todo <ChevronRight size={17}/></button></div>
          <div className="category-grid">
            {categories.map((item) => <button className="category-card" key={item.label}><span>{item.emoji}</span><strong>{item.label}</strong></button>)}
          </div>
        </section>

        <section className="container section-block stores-section">
          <div className="section-heading"><div><span className="section-kicker">Cerca de ti</span><h2>Populares en Pachacámac</h2></div><button>Ver todos <ArrowRight size={17}/></button></div>
          <div className="store-grid">
            {stores.map((store) => (
              <article className="store-card" key={store.id}>
                <div className="store-visual" style={{ background: store.accent }}>
                  <span>{store.emoji}</span>
                  {store.promo && <b>{store.promo}</b>}
                  <button aria-label="Agregar a favoritos">♡</button>
                </div>
                <div className="store-body">
                  <div><h3>{store.name}</h3><span className="rating"><Star size={14} fill="currentColor" />{store.rating}</span></div>
                  <p>{store.category}</p>
                  <div className="store-meta"><span><Clock3 size={15}/>{store.eta}</span><span>Delivery {store.delivery}</span></div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="container rewards-card">
          <div className="rewards-icon">P</div>
          <div><span>Pacha Rewards</span><h3>Gana 1% de cashback en cada pedido</h3><p>Acumula puntos y úsalos en tus próximas compras.</p></div>
          <button>Conocer más</button>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
