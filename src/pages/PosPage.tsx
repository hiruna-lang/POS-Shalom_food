import React, { useState, useMemo } from 'react';
import { usePos } from '../context/PosContext';
import { FoodCard } from '../components/pos/FoodCard';
import { CartPanel } from '../components/pos/CartPanel';
import { Search, Utensils, X } from 'lucide-react';

export const PosPage: React.FC = () => {
  const { menuItems, categories, addToCart } = usePos();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Filter visible items
  const visibleMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Don't show hidden items in cashier menu unless searched specifically
      if (item.isHidden) return false;

      // Category match
      if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) {
        return false;
      }

      // Search match
      if (
        searchQuery &&
        !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-slate-100 select-none">
      {/* Main Left: Food Catalogue & Filters */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Simple search for quick cashier lookup */}
        <div className="p-3 bg-white border-b border-slate-200 shadow-xs flex items-center gap-3 shrink-0">
          {/* Live Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 min-h-11 text-sm bg-slate-100 focus:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="hidden md:block ml-auto text-sm text-slate-500 font-semibold whitespace-nowrap">
            Tap a food to add
          </div>
        </div>

        {/* Category Horizontal Scrolling Navigation Bar */}
        <div className="bg-slate-900 text-white px-3 py-2 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto shrink-0 shadow-inner">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-3 min-h-11 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            All Menu Items
          </button>

          {categories
            .filter((c) => c.isEnabled)
            .map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-3 min-h-11 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
        </div>

        {/* Food Items Responsive Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          {visibleMenuItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16">
              <Utensils className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-base font-bold text-slate-600">No menu items found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching with a different keyword or category filter
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {visibleMenuItems.map((item) => (
                <FoodCard
                  key={item.id}
                  item={item}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar: Active Cart & Checkout */}
      <CartPanel />
    </div>
  );
};

