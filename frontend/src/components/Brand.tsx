import { Bike } from 'lucide-react';

export default function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand" aria-label="Pacha Eats">
      <span className="brand-mark"><Bike size={compact ? 18 : 22} strokeWidth={2.6} /></span>
      <span className={compact ? 'brand-name compact' : 'brand-name'}>Pacha <strong>Eats</strong></span>
    </div>
  );
}
