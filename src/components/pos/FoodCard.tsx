import React from 'react';
import { MenuItem } from '../../types/pos';
import { Plus } from 'lucide-react';

interface FoodCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item, onAddToCart }) => {
  return (
    <div
      onClick={() => item.isAvailable && onAddToCart(item)}
      className={`group bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between transition-all select-none relative ${
        item.isAvailable
          ? 'hover:shadow-lg hover:border-blue-500/50 hover:-translate-y-0.5 cursor-pointer active:scale-[0.98]'
          : 'opacity-60 cursor-not-allowed bg-slate-100'
      }`}
    >
      {/* Food Image Container */}
      <div className="relative h-32 w-full overflow-hidden bg-slate-100">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Out of stock overlay */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
            <span className="bg-rose-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="p-3 flex flex-col justify-between flex-1">
        <div>
          <h3 className="font-bold text-base text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {item.name}
          </h3>
        </div>

        {/* Price & Add Button */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-lg font-extrabold text-slate-900">
              Rs. {item.price.toLocaleString()}
            </span>
          </div>

          <button
            type="button"
            disabled={!item.isAvailable}
            onClick={(e) => {
              e.stopPropagation();
              if (item.isAvailable) onAddToCart(item);
            }}
            className="w-12 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white flex items-center justify-center shadow-md shadow-blue-500/20 transition-all disabled:opacity-40 disabled:pointer-events-none"
            aria-label={`Add ${item.name} to order`}
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};

