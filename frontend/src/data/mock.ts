export type Store = {
  id: string;
  name: string;
  category: string;
  eta: string;
  delivery: string;
  rating: number;
  promo?: string;
  emoji: string;
  accent: string;
};

export const categories = [
  { label: 'Restaurantes', emoji: '🍔' },
  { label: 'Mercado', emoji: '🛒' },
  { label: 'Farmacia', emoji: '💊' },
  { label: 'Bebidas', emoji: '🥤' },
  { label: 'Postres', emoji: '🍰' },
  { label: 'Mascotas', emoji: '🐶' }
];

export const stores: Store[] = [
  { id: '1', name: 'Pacha Burger', category: 'Hamburguesas', eta: '20–30 min', delivery: 'S/ 4.90', rating: 4.8, promo: '-25%', emoji: '🍔', accent: '#ffe4df' },
  { id: '2', name: 'Sabor Criollo', category: 'Comida peruana', eta: '25–35 min', delivery: 'S/ 3.90', rating: 4.7, emoji: '🍗', accent: '#fff1d6' },
  { id: '3', name: 'Pacha Market', category: 'Minimarket', eta: '15–25 min', delivery: 'S/ 2.90', rating: 4.9, promo: 'Envío gratis', emoji: '🛒', accent: '#e9f7ea' },
  { id: '4', name: 'Vida Farma', category: 'Farmacia', eta: '18–28 min', delivery: 'S/ 3.50', rating: 4.6, emoji: '🧴', accent: '#e7f1ff' }
];

export const activeOrders = [
  { id: '#PE-1048', client: 'María R.', store: 'Pacha Burger', total: 'S/ 48.90', status: 'En preparación', time: '12 min' },
  { id: '#PE-1049', client: 'Luis A.', store: 'Pacha Market', total: 'S/ 72.40', status: 'Buscando rider', time: '4 min' },
  { id: '#PE-1050', client: 'Daniela P.', store: 'Sabor Criollo', total: 'S/ 39.00', status: 'En camino', time: '18 min' }
];
