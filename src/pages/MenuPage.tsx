import React, { useState, useMemo } from 'react';
import { usePos } from '../context/PosContext';
import { MenuItem, Category, KitchenTarget } from '../types/pos';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Flame,
  Leaf,
  Layers,
  Utensils,
  Clock,
  SlidersHorizontal,
  FolderPlus
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const MenuPage: React.FC = () => {
  const {
    menuItems,
    categories,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleHideMenuItem,
    toggleAvailability,
    addCategory,
    updateCategory,
    deleteCategory,
  } = usePos();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'available' | 'hidden' | 'unavailable'>('all');

  // Modals state
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteTargetItem, setDeleteTargetItem] = useState<MenuItem | null>(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTargetCategory, setDeleteTargetCategory] = useState<Category | null>(null);

  // Tab: 'items' or 'categories'
  const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items');

  // Overview Statistics
  const totalItemsCount = menuItems.length;
  const availableItemsCount = menuItems.filter((i) => i.isAvailable && !i.isHidden).length;
  const hiddenItemsCount = menuItems.filter((i) => i.isHidden).length;
  const unavailableItemsCount = menuItems.filter((i) => !i.isAvailable).length;
  const totalCategoriesCount = categories.length;

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) {
        return false;
      }
      if (selectedStatusFilter === 'available' && (!item.isAvailable || item.isHidden)) {
        return false;
      }
      if (selectedStatusFilter === 'hidden' && !item.isHidden) {
        return false;
      }
      if (selectedStatusFilter === 'unavailable' && item.isAvailable) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!item.name.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [menuItems, selectedCategory, selectedStatusFilter, searchQuery]);

  // Form state for Item Create/Edit
  const [itemName, setItemName] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemCat, setItemCat] = useState(categories[0]?.id || '');
  const [itemPrice, setItemPrice] = useState(1000);
  const [itemCost, setItemCost] = useState(400);
  const [itemImage, setItemImage] = useState('');
  const [itemKitchen, setItemKitchen] = useState<KitchenTarget>('kitchen_1');
  const [itemPrepTime, setItemPrepTime] = useState(10);
  const [itemIsSpicy, setItemIsSpicy] = useState(false);
  const [itemIsVeg, setItemIsVeg] = useState(false);
  const [itemIsAvailable, setItemIsAvailable] = useState(true);

  // Open item modal for Create or Edit
  const openItemModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setItemName(item.name);
      setItemDesc(item.description);
      setItemCat(item.categoryId);
      setItemPrice(item.price);
      setItemCost(item.costPrice || Math.round(item.price * 0.45));
      setItemImage(item.image);
      setItemKitchen(item.kitchen);
      setItemPrepTime(item.prepTime);
      setItemIsSpicy(!!item.isSpicy);
      setItemIsVeg(!!item.isVegetarian);
      setItemIsAvailable(item.isAvailable);
    } else {
      setEditingItem(null);
      setItemName('');
      setItemDesc('');
      setItemCat(categories[0]?.id || '');
      setItemPrice(1200);
      setItemCost(500);
      setItemImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80');
      setItemKitchen('kitchen_1');
      setItemPrepTime(12);
      setItemIsSpicy(false);
      setItemIsVeg(false);
      setItemIsAvailable(true);
    }
    setItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    if (editingItem) {
      updateMenuItem({
        ...editingItem,
        name: itemName,
        description: itemDesc,
        categoryId: itemCat,
        price: itemPrice,
        costPrice: itemCost,
        image: itemImage,
        kitchen: itemKitchen,
        prepTime: itemPrepTime,
        isSpicy: itemIsSpicy,
        isVegetarian: itemIsVeg,
        isAvailable: itemIsAvailable,
      });
    } else {
      addMenuItem({
        name: itemName,
        description: itemDesc,
        categoryId: itemCat,
        price: itemPrice,
        costPrice: itemCost,
        image: itemImage,
        isAvailable: itemIsAvailable,
        isHidden: false,
        kitchen: itemKitchen,
        prepTime: itemPrepTime,
        isSpicy: itemIsSpicy,
        isVegetarian: itemIsVeg,
      });
    }
    setItemModalOpen(false);
  };

  // Form state for Category Create/Edit
  const [catName, setCatName] = useState('');
  const [catKitchen, setCatKitchen] = useState<KitchenTarget>('kitchen_1');
  const [catOrder, setCatOrder] = useState(1);
  const [catEnabled, setCatEnabled] = useState(true);

  const openCategoryModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setCatName(cat.name);
      setCatKitchen(cat.kitchenDefault);
      setCatOrder(cat.order);
      setCatEnabled(cat.isEnabled);
    } else {
      setEditingCategory(null);
      setCatName('');
      setCatKitchen('kitchen_1');
      setCatOrder(categories.length + 1);
      setCatEnabled(true);
    }
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    if (editingCategory) {
      updateCategory({
        ...editingCategory,
        name: catName,
        kitchenDefault: catKitchen,
        order: catOrder,
        isEnabled: catEnabled,
      });
    } else {
      addCategory({
        name: catName,
        iconName: 'Utensils',
        order: catOrder,
        isEnabled: catEnabled,
        kitchenDefault: catKitchen,
      });
    }
    setCategoryModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto select-none">
      {/* 1. Header & Overview Statistics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Menu & Category Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure dishes, pricing in LKR, dietary tags, kitchen routing, and category visibility.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => openCategoryModal()}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-colors"
          >
            <FolderPlus className="w-4 h-4 text-blue-600" />
            <span>New Category</span>
          </button>
          <button
            type="button"
            onClick={() => openItemModal()}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* 2. Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Dishes</span>
          <div className="text-xl font-black text-slate-900 mt-1">{totalItemsCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-emerald-600">Available</span>
          <div className="text-xl font-black text-emerald-600 mt-1">{availableItemsCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-500">Hidden from Menu</span>
          <div className="text-xl font-black text-slate-600 mt-1">{hiddenItemsCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-rose-600">Unavailable / Out</span>
          <div className="text-xl font-black text-rose-600 mt-1">{unavailableItemsCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-indigo-600">Total Categories</span>
          <div className="text-xl font-black text-indigo-600 mt-1">{totalCategoriesCount}</div>
        </div>
      </div>

      {/* 3. Navigation Tabs: Menu Items vs Categories */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('items')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'items'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Menu Items ({menuItems.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'categories'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Food Categories ({categories.length})</span>
        </button>
      </div>

      {/* TAB 1: Menu Items Management */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          {/* Search & Category Filter Controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search food item name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
              {/* Category dropdown */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Status filter dropdown */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available Only</option>
                <option value="hidden">Hidden Only</option>
                <option value="unavailable">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Menu Items Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Item</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price (LKR)</th>
                    <th className="py-3.5 px-4">Cost (LKR)</th>
                    <th className="py-3.5 px-4">Kitchen</th>
                    <th className="py-3.5 px-4">Prep Time</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No food items match the search query.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const cat = categories.find((c) => c.id === item.categoryId);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
                              />
                              <div>
                                <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                                  <span>{item.name}</span>
                                  {item.isVegetarian && (
                                    <span title="Vegetarian">
                                      <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                                    </span>
                                  )}
                                  {item.isSpicy && (
                                    <span title="Spicy">
                                      <Flame className="w-3.5 h-3.5 text-rose-500" />
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs mt-0.5">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800">
                              {cat?.name || 'Unassigned'}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-black text-slate-900">
                            Rs. {item.price.toLocaleString()}
                          </td>

                          <td className="py-3 px-4 text-slate-500">
                            Rs. {(item.costPrice || 0).toLocaleString()}
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.kitchen === 'kitchen_1'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-cyan-100 text-cyan-800'
                              }`}
                            >
                              {item.kitchen === 'kitchen_1' ? 'Kitchen 1 (Hot)' : 'Kitchen 2 (Bar)'}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center text-slate-500 space-x-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{item.prepTime} mins</span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex flex-col space-y-1">
                              <button
                                type="button"
                                onClick={() => toggleAvailability(item.id)}
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center space-x-1 w-max ${
                                  item.isAvailable
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {item.isAvailable ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Available</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3 h-3" />
                                    <span>Out of Stock</span>
                                  </>
                                )}
                              </button>

                              {item.isHidden && (
                                <span className="text-[10px] font-bold text-slate-400 flex items-center space-x-1">
                                  <EyeOff className="w-3 h-3" />
                                  <span>Hidden</span>
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              {/* Hide / Show Toggle */}
                              <button
                                type="button"
                                onClick={() => toggleHideMenuItem(item.id)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  item.isHidden
                                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                    : 'bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                                }`}
                                title={item.isHidden ? 'Make Item Visible' : 'Hide from Customer Menu'}
                              >
                                {item.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </button>

                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => openItemModal(item)}
                                className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Edit Item Details"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => setDeleteTargetItem(item)}
                                className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                                title="Delete Item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Categories Management */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const itemsInCat = menuItems.filter((i) => i.categoryId === cat.id).length;
              return (
                <div
                  key={cat.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-slate-900">{cat.name}</h4>
                          <span className="text-xs text-slate-400">Order Priority: #{cat.order}</span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          cat.isEnabled
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {cat.isEnabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Associated Items:</span>
                        <span className="font-bold text-slate-800">{itemsInCat} dishes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Default Kitchen:</span>
                        <span className="font-bold text-amber-700">
                          {cat.kitchenDefault === 'kitchen_1' ? 'Kitchen 1 (Hot)' : 'Kitchen 2 (Bar)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2 mt-4 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => openCategoryModal(cat)}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTargetCategory(cat)}
                      className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Item Create / Edit Modal */}
      <Modal
        isOpen={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        title={editingItem ? `Edit: ${editingItem.name}` : 'Create New Menu Item'}
        subtitle="Specify food details, LKR pricing, and kitchen routing"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Dish Name *</label>
              <input
                type="text"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Mutton Biryani Large"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Category *</label>
              <select
                value={itemCat}
                onChange={(e) => setItemCat(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Food Description</label>
            <textarea
              rows={2}
              value={itemDesc}
              onChange={(e) => setItemDesc(e.target.value)}
              placeholder="Ingredients, preparation details, accompaniments..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Selling Price (Rs.) *</label>
              <input
                type="number"
                min="0"
                step="50"
                required
                value={itemPrice}
                onChange={(e) => setItemPrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Cost Price (Rs.)</label>
              <input
                type="number"
                min="0"
                value={itemCost}
                onChange={(e) => setItemCost(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Kitchen Assignment</label>
              <select
                value={itemKitchen}
                onChange={(e) => setItemKitchen(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                <option value="kitchen_1">Kitchen 1 (Hot/Main)</option>
                <option value="kitchen_2">Kitchen 2 (Bar/Dessert)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Prep Time (mins)</label>
              <input
                type="number"
                min="1"
                value={itemPrepTime}
                onChange={(e) => setItemPrepTime(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Food Image URL</label>
            <input
              type="url"
              value={itemImage}
              onChange={(e) => setItemImage(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          {/* Checkbox Options */}
          <div className="flex items-center space-x-6 pt-2">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={itemIsVeg}
                onChange={(e) => setItemIsVeg(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Vegetarian Option</span>
            </label>

            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={itemIsSpicy}
                onChange={(e) => setItemIsSpicy(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Spicy Dish</span>
            </label>

            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={itemIsAvailable}
                onChange={(e) => setItemIsAvailable(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>In Stock & Ready</span>
            </label>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setItemModalOpen(false)}
              className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Save Food Item
            </button>
          </div>
        </form>
      </Modal>

      {/* Category Create / Edit Modal */}
      <Modal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title={editingCategory ? `Edit: ${editingCategory.name}` : 'Create New Category'}
        subtitle="Set category order and default kitchen destination"
        maxWidth="md"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Category Title *</label>
            <input
              type="text"
              required
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="e.g. Seafood Specialties"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Default Kitchen</label>
              <select
                value={catKitchen}
                onChange={(e) => setCatKitchen(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                <option value="kitchen_1">Kitchen 1 (Hot Prep)</option>
                <option value="kitchen_2">Kitchen 2 (Bar/Cold)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Display Order</label>
              <input
                type="number"
                min="1"
                value={catOrder}
                onChange={(e) => setCatOrder(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>
          </div>

          <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={catEnabled}
              onChange={(e) => setCatEnabled(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Enabled on Cashier Screen</span>
          </label>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCategoryModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Save Category
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Item Confirmation Dialog */}
      {deleteTargetItem && (
        <ConfirmDialog
          isOpen={!!deleteTargetItem}
          onClose={() => setDeleteTargetItem(null)}
          onConfirm={() => deleteMenuItem(deleteTargetItem.id)}
          title={`Delete ${deleteTargetItem.name}?`}
          message="Are you sure you want to delete this menu item? This will remove it from all POS screens. You can alternatively use Hide to keep sales history."
          confirmText="Yes, Delete Item"
          variant="danger"
        />
      )}

      {/* Delete Category Confirmation Dialog */}
      {deleteTargetCategory && (
        <ConfirmDialog
          isOpen={!!deleteTargetCategory}
          onClose={() => setDeleteTargetCategory(null)}
          onConfirm={() => deleteCategory(deleteTargetCategory.id)}
          title={`Delete Category "${deleteTargetCategory.name}"?`}
          message="Are you sure you want to remove this category? Items under this category may become unassigned."
          confirmText="Delete Category"
          variant="danger"
        />
      )}
    </div>
  );
};
