import { Heart, Home, ReceiptText, Search, UserRound } from 'lucide-react';

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      <button className="active"><Home size={21} /><span>Inicio</span></button>
      <button><Search size={21} /><span>Buscar</span></button>
      <button><ReceiptText size={21} /><span>Pedidos</span></button>
      <button><Heart size={21} /><span>Favoritos</span></button>
      <button><UserRound size={21} /><span>Cuenta</span></button>
    </nav>
  );
}
