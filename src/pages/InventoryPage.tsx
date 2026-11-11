import React, { useState, useMemo } from 'react';
import { usePos } from '../context/PosContext';
import { InventoryItem, StockTransaction } from '../types/pos';
import {
  Package,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  History,
  Edit,
  Trash2,
  Calendar,
  Truck,
  CheckCircle2,
  XCircle,
  Sliders
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const InventoryPage: React.FC = () => {
  const {
    inventory,
    stockTransactions,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    stockIn,
    stockOut,
    adjustStock,
  } = usePos();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');

  // Modals state
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);

  // Stock action modals (Stock In, Stock Out, Adjust, History)
  const [stockActionModal, setStockActionModal] = useState<{
    type: 'in' | 'out' | 'adjust' | 'history';
    item: InventoryItem;
  } | null>(null);

  const [actionQuantity, setActionQuantity] = useState<number>(5);
  const [actionReason, setActionReason] = useState<string>('');
  const [actionRefNo, setActionRefNo] = useState<string>('');

  // Overview Metrics
  const totalItemsCount = inventory.length;
  const outOfStockCount = inventory.filter((i) => i.currentStock <= 0).length;
  const lowStockCount = inventory.filter(
    (i) => i.currentStock > 0 && i.currentStock <= i.minStockLevel
  ).length;
  const availableStockCount = inventory.filter(
    (i) => i.currentStock > i.minStockLevel
  ).length;

  const categoriesList = useMemo(() => {
    return Array.from(new Set(inventory.map((i) => i.category)));
  }, [inventory]);

  // Filtered inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (statusFilter === 'low_stock' && (item.currentStock <= 0 || item.currentStock > item.minStockLevel)) {
        return false;
      }
      if (statusFilter === 'out_of_stock' && item.currentStock > 0) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !item.name.toLowerCase().includes(q) &&
          !item.supplier.toLowerCase().includes(q) &&
          !item.category.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [inventory, selectedCategory, statusFilter, searchQuery]);

  // Form state for Add/Edit
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('Poultry & Meat');
  const [unit, setUnit] = useState<InventoryItem['unit']>('kg');
  const [currentStock, setCurrentStock] = useState(10);
  const [minStockLevel, setMinStockLevel] = useState(5);
  const [purchasePrice, setPurchasePrice] = useState(1000);
  const [supplier, setSupplier] = useState('');
  const [expiryDate, setExpiryDate] = useState('2027-01-01');

  const openItemModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setName(item.name);
      setImage(item.image);
      setCategory(item.category);
      setUnit(item.unit);
      setCurrentStock(item.currentStock);
      setMinStockLevel(item.minStockLevel);
      setPurchasePrice(item.purchasePrice);
      setSupplier(item.supplier);
      setExpiryDate(item.expiryDate);
    } else {
      setEditingItem(null);
      setName('');
      setImage('https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80');
      setCategory(categoriesList[0] || 'Produce');
      setUnit('kg');
      setCurrentStock(10);
      setMinStockLevel(5);
      setPurchasePrice(800);
      setSupplier('Colombo Wholesale Market');
      setExpiryDate(new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]);
    }
    setItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingItem) {
      updateInventoryItem({
        ...editingItem,
        name,
        image,
        category,
        unit,
        currentStock,
        minStockLevel,
        purchasePrice,
        supplier,
        expiryDate,
      });
    } else {
      addInventoryItem({
        name,
        image,
        category,
        unit,
        currentStock,
        minStockLevel,
        purchasePrice,
        supplier,
        expiryDate,
      });
    }
    setItemModalOpen(false);
  };

  const handleStockActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockActionModal) return;

    const { type, item } = stockActionModal;
    if (type === 'in') {
      stockIn(item.id, actionQuantity, actionReason || 'Supplier Delivery GRN', actionRefNo);
    } else if (type === 'out') {
      stockOut(item.id, actionQuantity, actionReason || 'Kitchen Issue');
    } else if (type === 'adjust') {
      adjustStock(item.id, actionQuantity, actionReason || 'Physical Stock Audit Count');
    }
    setStockActionModal(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto select-none">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Inventory & Ingredient Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Monitor raw ingredient stock levels, low-stock threshold alerts, and supplier GRN logs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openItemModal()}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stock Item</span>
        </button>
      </div>

      {/* 2. Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Items</span>
          <div className="text-xl font-black text-slate-900 mt-1">{totalItemsCount}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-emerald-600">Available In Stock</span>
          <div className="text-xl font-black text-emerald-600 mt-1">{availableStockCount}</div>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'low_stock' ? 'all' : 'low_stock')}
          className={`p-4 rounded-2xl border shadow-xs cursor-pointer transition-all ${
            statusFilter === 'low_stock'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/20'
              : 'bg-white border-slate-200/80 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-amber-700">Low Stock Alert</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-700 mt-1">{lowStockCount} Items</div>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'out_of_stock' ? 'all' : 'out_of_stock')}
          className={`p-4 rounded-2xl border shadow-xs cursor-pointer transition-all ${
            statusFilter === 'out_of_stock'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400/20'
              : 'bg-white border-slate-200/80 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-rose-700">Out of Stock</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-black text-rose-700 mt-1">{outOfStockCount} Items</div>
        </div>
      </div>

      {/* 3. Search and Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search ingredient, supplier, code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Items
          </button>
        </div>
      </div>

      {/* 4. Inventory Items Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Ingredient / Stock Item</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Min. Threshold</th>
                <th className="py-3.5 px-4">Unit Cost (LKR)</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4">Expiry Date</th>
                <th className="py-3.5 px-4 text-right">Quick Stock Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No inventory items match your search.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const isOutOfStock = item.currentStock <= 0;
                  const isLow = !isOutOfStock && item.currentStock <= item.minStockLevel;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{item.name}</span>
                            <span className="text-[10px] text-slate-400">
                              Restocked: {item.lastRestocked}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-800">{item.category}</td>

                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-sm font-black ${
                              isOutOfStock
                                ? 'text-rose-600'
                                : isLow
                                ? 'text-amber-600'
                                : 'text-slate-900'
                            }`}
                          >
                            {item.currentStock} {item.unit}
                          </span>

                          {isOutOfStock && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded">
                              Out
                            </span>
                          )}
                          {isLow && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                              Low
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-500">
                        {item.minStockLevel} {item.unit}
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900">
                        Rs. {item.purchasePrice.toLocaleString()} / {item.unit}
                      </td>

                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {item.supplier}
                      </td>

                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {item.expiryDate}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Stock In Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setActionQuantity(10);
                              setActionReason('GRN Shipment Delivery');
                              setActionRefNo('GRN-' + Math.floor(1000 + Math.random() * 9000));
                              setStockActionModal({ type: 'in', item });
                            }}
                            className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors flex items-center space-x-1 text-xs font-bold"
                            title="Stock In (+)"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">In</span>
                          </button>

                          {/* Stock Out Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setActionQuantity(2);
                              setActionReason('Kitchen Usage / Prep');
                              setStockActionModal({ type: 'out', item });
                            }}
                            className="p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white rounded-lg transition-colors flex items-center space-x-1 text-xs font-bold"
                            title="Stock Out (-)"
                          >
                            <ArrowDownRight className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Out</span>
                          </button>

                          {/* Adjust Stock Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setActionQuantity(item.currentStock);
                              setActionReason('Physical Audit Count');
                              setStockActionModal({ type: 'adjust', item });
                            }}
                            className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                            title="Stock Audit Reconcile"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>

                          {/* Stock History Button */}
                          <button
                            type="button"
                            onClick={() => setStockActionModal({ type: 'history', item })}
                            className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                            title="View Transaction Audit Trail"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Item Details */}
                          <button
                            type="button"
                            onClick={() => openItemModal(item)}
                            className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                            title="Edit Item"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Item */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Stock Movement Action Modal (In, Out, Adjust) */}
      {stockActionModal && stockActionModal.type !== 'history' && (
        <Modal
          isOpen={!!stockActionModal}
          onClose={() => setStockActionModal(null)}
          title={
            stockActionModal.type === 'in'
              ? `Stock In: ${stockActionModal.item.name}`
              : stockActionModal.type === 'out'
              ? `Stock Out: ${stockActionModal.item.name}`
              : `Stock Audit Adjustment: ${stockActionModal.item.name}`
          }
          subtitle={`Current Level: ${stockActionModal.item.currentStock} ${stockActionModal.item.unit}`}
          maxWidth="md"
        >
          <form onSubmit={handleStockActionSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {stockActionModal.type === 'adjust'
                  ? `New Verified Physical Stock (${stockActionModal.item.unit}) *`
                  : `Quantity to ${stockActionModal.type === 'in' ? 'Add' : 'Deduct'} (${stockActionModal.item.unit}) *`}
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={actionQuantity}
                onChange={(e) => setActionQuantity(parseFloat(e.target.value) || 0)}
                className="w-full text-xl font-bold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {stockActionModal.type === 'in' && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  GRN / Invoice Reference #
                </label>
                <input
                  type="text"
                  value={actionRefNo}
                  onChange={(e) => setActionRefNo(e.target.value)}
                  placeholder="e.g. GRN-2026-904"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Reason / Notes</label>
              <input
                type="text"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={
                  stockActionModal.type === 'in'
                    ? 'Batch arrival, wholesale supplier'
                    : stockActionModal.type === 'out'
                    ? 'Kitchen issue, spoilage, staff meal'
                    : 'Discrepancy reconciliation after weekly audit'
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setStockActionModal(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-5 py-2 text-white font-bold text-xs rounded-xl shadow-md transition-colors ${
                  stockActionModal.type === 'in'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : stockActionModal.type === 'out'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Confirm {stockActionModal.type === 'in' ? 'Stock In' : stockActionModal.type === 'out' ? 'Stock Out' : 'Adjustment'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Stock History Audit Modal */}
      {stockActionModal && stockActionModal.type === 'history' && (
        <Modal
          isOpen={true}
          onClose={() => setStockActionModal(null)}
          title={`Stock Audit History: ${stockActionModal.item.name}`}
          subtitle={`Unit: ${stockActionModal.item.unit} • Current: ${stockActionModal.item.currentStock}`}
          maxWidth="2xl"
        >
          <div className="space-y-3">
            {stockTransactions.filter((tx) => tx.itemId === stockActionModal.item.id).length === 0 ? (
              <p className="py-8 text-center text-slate-400 text-xs">
                No logged stock movement transactions recorded yet for this ingredient.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {stockTransactions
                  .filter((tx) => tx.itemId === stockActionModal.item.id)
                  .map((tx) => (
                    <div key={tx.id} className="p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              tx.type === 'stock_in'
                                ? 'bg-emerald-100 text-emerald-800'
                                : tx.type === 'stock_out'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {tx.type.replace('_', ' ')}
                          </span>
                          <span className="font-bold text-slate-800">{tx.reason}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {tx.date} • By {tx.performedBy} {tx.referenceNumber && `• Ref: ${tx.referenceNumber}`}
                        </p>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-black text-sm ${
                            tx.type === 'stock_in'
                              ? 'text-emerald-600'
                              : tx.type === 'stock_out'
                              ? 'text-amber-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {tx.type === 'stock_in' ? `+${tx.quantity}` : tx.type === 'stock_out' ? `-${tx.quantity}` : `${tx.newStock}`}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Level: {tx.previousStock} → {tx.newStock}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStockActionModal(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close History
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Inventory Item Modal */}
      <Modal
        isOpen={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        title={editingItem ? `Edit Ingredient: ${editingItem.name}` : 'New Inventory Ingredient'}
        subtitle="Configure stock thresholds, supplier data, and unit cost"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Item / Ingredient Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Broiler Chicken Skinless"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Poultry & Meat, Dairy, Grains"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Measurement Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                <option value="kg">kg (Kilograms)</option>
                <option value="g">g (Grams)</option>
                <option value="L">L (Liters)</option>
                <option value="ml">ml (Milliliters)</option>
                <option value="pieces">pieces (Units)</option>
                <option value="packs">packs</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Opening Stock *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={currentStock}
                onChange={(e) => setCurrentStock(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Min. Alert Level</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={minStockLevel}
                onChange={(e) => setMinStockLevel(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Purchase Price (Rs.)</label>
              <input
                type="number"
                min="0"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Supplier Company</label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="e.g. Bairaha Farms PLC"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Batch Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Item Image URL</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setItemModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Save Item
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Item Confirmation Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteInventoryItem(deleteTarget.id)}
          title={`Delete ${deleteTarget.name}?`}
          message="Are you sure you want to delete this inventory record? Historical stock movements for this item will remain recorded."
          confirmText="Delete Stock Item"
          variant="danger"
        />
      )}
    </div>
  );
};

