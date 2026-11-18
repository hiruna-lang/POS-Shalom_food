import { Plus, Utensils } from 'lucide-react';
import { MenuItem } from '../../types/pos';
import { getPortions } from '../../utils/portions';
import { formatLkr } from '../../utils/billing';

export function FoodCard({ item, onSelect }: { item: MenuItem; onSelect: (item: MenuItem, image: HTMLImageElement | null) => void }) {
  const portions = getPortions(item);
  const prices = portions.map((portion) => portion.price);
  const startingPrice = Math.min(...prices);

  return (
    <button type="button" className="product-tile" disabled={!item.isAvailable}
      onClick={(event) => onSelect(item, event.currentTarget.querySelector('img'))}>
      <span className="product-image">
        <Utensils size={24} />
        {item.image && <img src={item.image} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }} />}
        {!item.isAvailable && <span className="product-status">Unavailable</span>}
      </span>
      <span className="product-body">
        <strong>{item.name}</strong>
        <span className="product-price">{prices.some((price) => price !== startingPrice) ? 'From ' : ''}{formatLkr(startingPrice)}</span>
        {item.isAvailable && <span className="product-add" aria-hidden="true"><Plus size={17} /></span>}
      </span>
    </button>
  );
}
