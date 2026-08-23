import { Bike, Clock3, MapPin, Navigation, Power, Star, Wallet } from 'lucide-react';
import AppHeader from '../components/AppHeader';

export default function DriverDashboard() {
  return (
    <div className="driver-page">
      <AppHeader />
      <main className="driver-main container">
        <div className="driver-welcome"><div><span className="section-kicker">Hola, Diego 👋</span><h1>¿Listo para repartir?</h1><p>Conéctate para recibir pedidos cercanos.</p></div><button className="online-button"><Power size={18}/>Estás conectado</button></div>
        <div className="driver-stats">
          <div><span><Wallet/></span><small>Ganancia hoy</small><strong>S/ 86.50</strong></div>
          <div><span><Bike/></span><small>Entregas</small><strong>8</strong></div>
          <div><span><Star/></span><small>Calificación</small><strong>4.9</strong></div>
        </div>
        <section className="delivery-offer">
          <div className="offer-top"><span className="pulse-dot"></span><strong>Nueva oferta de entrega</strong><b>18 s</b></div>
          <div className="offer-payment"><small>Tu ganancia</small><strong>S/ 8.90</strong></div>
          <div className="route-line">
            <div><span className="route-dot pickup"></span><section><small>RECOGER EN</small><strong>Pacha Burger</strong><p>Av. Lima 420 · 1.2 km</p></section></div>
            <i></i>
            <div><span className="route-dot dropoff"></span><section><small>ENTREGAR EN</small><strong>Zona Pachacámac Centro</strong><p>2.8 km desde el comercio</p></section></div>
          </div>
          <div className="offer-meta"><span><Clock3 size={16}/>25–35 min</span><span><Navigation size={16}/>4.0 km total</span><span><MapPin size={16}/>Moto</span></div>
          <div className="offer-actions"><button className="secondary-button">Rechazar</button><button className="primary-button">Aceptar pedido</button></div>
        </section>
      </main>
    </div>
  );
}
