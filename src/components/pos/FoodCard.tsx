import React from 'react';
import { MenuItem } from '../../types/pos';
import { Plus, Flame, Leaf, Clock } from 'lucide-react';

interface FoodCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item, onAddToCart }) => {
  return (
    <div
      onClick={() => item.isAvailable && onAddToCart(item)}
      className={`group bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between transition-all select-none relative ${
        item.isAvailable
          ? 'hover:shadow-lg hover:border-blue-500/50 hover:-translate-y-0.5 cursor-pointer active:scale-[0.98]'
          : 'opacity-60 cursor-not-allowed bg-slate-100'
      }`}
    >
      {/* Food Image Container */}
      <div className="relative h-36 w-full overflow-hidden bg-slate-100">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Dietary / Spicy Tags */}
        <div className="absolute top-2 left-2 flex items-center space-x-1">
          {item.isVegetarian && (
            <span
              className="bg-emerald-600/90 text-white p-1 rounded-md shadow-sm backdrop-blur-xs"
              title="Vegetarian"
            >
              <Leaf className="w-3.5 h-3.5" />
            </span>
          )}
          {item.isSpicy && (
            <span
              className="bg-rose-600/90 text-white p-1 rounded-md shadow-sm backdrop-blur-xs"
              title="Spicy"
            >
              <Flame className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        {/* Kitchen Routing Tag */}
        <div className="absolute top-2 right-2">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${
              item.kitchen === 'kitchen_1'
                ? 'bg-amber-500 text-white'
                : 'bg-cyan-600 text-white'
            }`}
          >
            {item.kitchen === 'kitchen_1' ? 'Kitchen 1' : 'Kitchen 2'}
          </span>
        </div>

        {/* Prep time badge */}
        <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center space-x-1 backdrop-blur-xs">
          <Clock className="w-3 h-3 text-slate-300" />
          <span>{item.prepTime}m</span>
        </div>

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
      <div className="p-3.5 flex flex-col justify-between flex-1">
        <div>
          <h3 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {item.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-snug">
            {item.description}
          </p>
        </div>

        {/* Price & Add Button */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Price
            </span>
            <span className="text-base font-extrabold text-slate-900">
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
            className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white flex items-center justify-center shadow-md shadow-blue-500/20 transition-all disabled:opacity-40 disabled:pointer-events-none"
            aria-label={`Add ${item.name} to order`}
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};

