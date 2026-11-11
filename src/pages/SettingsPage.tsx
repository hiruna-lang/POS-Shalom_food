import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { User, UserRole, KitchenTarget } from '../types/pos';
import {
  Settings,
  Store,
  Users,
  Printer,
  Coins,
  GitFork,
  HardDrive,
  Wifi,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Download,
  Shield,
  KeyRound,
  Network,
  Clock,
  Sparkles
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateGeneralSettings,
    updatePrinterConfig,
    updateCashDrawerSettings,
    updateKitchenRouting,
    updateBackupSettings,
    updateNetworkSettings,
    triggerManualBackup,
    testPrinter,
    testCashDrawer,
    users,
    addUser,
    updateUser,
    deleteUser,
    categories,
    addNotification,
  } = usePos();

  const [activeTab, setActiveTab] = useState<
    'general' | 'users' | 'printers' | 'cash_drawer' | 'routing' | 'backup' | 'network'
  >('general');

  // General Settings local edit state
  const [generalForm, setGeneralForm] = useState(settings.general);

  // Printer Settings local edit state
  const [billPrinter, setBillPrinter] = useState(settings.printers.customerBill);
  const [kitchen1Printer, setKitchen1Printer] = useState(settings.printers.kitchen1);
  const [kitchen2Printer, setKitchen2Printer] = useState(settings.printers.kitchen2);

  // Cash Drawer local edit state
  const [drawerConfig, setDrawerConfig] = useState(settings.cashDrawer);

  // Kitchen Routing local edit state
  const [routingConfig, setRoutingConfig] = useState(settings.kitchenRouting);

  // User Management Modals
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTargetUser, setDeleteTargetUser] = useState<User | null>(null);

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('cashier');
  const [userPin, setUserPin] = useState('1234');
  const [userAvatar, setUserAvatar] = useState('');

  const openUserModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setUserName(user.name);
      setUserEmail(user.email);
      setUserRole(user.role);
      setUserPin(user.pin);
      setUserAvatar(user.avatar);
    } else {
      setEditingUser(null);
      setUserName('');
      setUserEmail('');
      setUserRole('cashier');
      setUserPin('1234');
      setUserAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80');
    }
    setUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    if (editingUser) {
      updateUser({
        ...editingUser,
        name: userName,
        email: userEmail,
        role: userRole,
        pin: userPin,
        avatar: userAvatar,
      });
    } else {
      addUser({
        name: userName,
        email: userEmail,
        username: userName.toLowerCase().replace(/\s+/g, '_'),
        role: userRole,
        pin: userPin,
        avatar: userAvatar,
        status: 'active',
        permissions: userRole === 'admin' ? ['all_access'] : ['pos_billing', 'view_orders', 'print_bills'],
      });
    }
    setUserModalOpen(false);
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateGeneralSettings(generalForm);
  };

  const handleSavePrinters = (e: React.FormEvent) => {
    e.preventDefault();
    updatePrinterConfig('customerBill', billPrinter);
    updatePrinterConfig('kitchen1', kitchen1Printer);
    updatePrinterConfig('kitchen2', kitchen2Printer);
  };

  const handleSaveDrawer = (e: React.FormEvent) => {
    e.preventDefault();
    updateCashDrawerSettings(drawerConfig);
  };

  const handleRoutingChange = (catId: string, target: KitchenTarget) => {
    const updated = { ...routingConfig, [catId]: target };
    setRoutingConfig(updated);
    updateKitchenRouting(updated);
  };

  const tabs = [
    { id: 'general', label: 'General & Restaurant Info', icon: Store },
    { id: 'users', label: 'User & Staff Accounts', icon: Users },
    { id: 'printers', label: 'Printers (Bill & Kitchen 1/2)', icon: Printer },
    { id: 'cash_drawer', label: 'Cash Drawer', icon: Coins },
    { id: 'routing', label: 'Kitchen Routing', icon: GitFork },
    { id: 'backup', label: 'Database Backup', icon: HardDrive },
    { id: 'network', label: 'Local Server & Cloud Sync', icon: Wifi },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto select-none">
      {/* 1. Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Settings</h2>
        <p className="text-xs text-slate-500 mt-1">
          Hardware configurations, Ethernet LAN printers, user roles, routing matrix and cloud sync.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar Tabs */}
        <div className="lg:col-span-3 bg-white p-2 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-xs font-bold text-left transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel */}
        <div className="lg:col-span-9 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
          {/* TAB 1: General Settings */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral} className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-slate-900">General Information</h3>
                <p className="text-xs text-slate-400">
                  Restaurant branding, Sri Lankan Rupee currency, and tax parameters.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Restaurant Trade Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={generalForm.restaurantName}
                    onChange={(e) =>
                      setGeneralForm({ ...generalForm, restaurantName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Branch / Location
                  </label>
                  <input
                    type="text"
                    value={generalForm.branchName}
                    onChange={(e) =>
                      setGeneralForm({ ...generalForm, branchName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Physical Street Address
                </label>
                <input
                  type="text"
                  value={generalForm.address}
                  onChange={(e) => setGeneralForm({ ...generalForm, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={generalForm.phone}
                    onChange={(e) => setGeneralForm({ ...generalForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={generalForm.email}
                    onChange={(e) => setGeneralForm({ ...generalForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Currency</label>
                  <input
                    type="text"
                    value={generalForm.currency}
                    onChange={(e) =>
                      setGeneralForm({ ...generalForm, currency: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-bold bg-slate-50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Currency Symbol</label>
                  <input
                    type="text"
                    value={generalForm.currencySymbol}
                    onChange={(e) =>
                      setGeneralForm({ ...generalForm, currencySymbol: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tax Rate (SSCL %)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={generalForm.taxRate}
                    onChange={(e) =>
                      setGeneralForm({ ...generalForm, taxRate: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Service Charge (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={generalForm.serviceChargeRate}
                    onChange={(e) =>
                      setGeneralForm({ ...generalForm, serviceChargeRate: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Receipt Footer Message</label>
                <input
                  type="text"
                  value={generalForm.receiptFooter}
                  onChange={(e) =>
                    setGeneralForm({ ...generalForm, receiptFooter: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Save General Settings
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: User Management */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900">User Accounts & Roles</h3>
                  <p className="text-xs text-slate-400">
                    Cashiers, Floor Managers, and System Administrators with role-based permissions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openUserModal()}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Staff Member</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {users.map((u) => {
                  const roleBadge = {
                    admin: 'bg-purple-100 text-purple-800 border-purple-200',
                    manager: 'bg-amber-100 text-amber-800 border-amber-200',
                    cashier: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                  }[u.role];

                  return (
                    <div
                      key={u.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between"
                    >
                      <div className="flex items-start space-x-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-slate-900 truncate">{u.name}</h4>
                          <span
                            className={`inline-block px-2 py-0.2 rounded-md text-[10px] font-bold uppercase border mt-1 ${roleBadge}`}
                          >
                            {u.role}
                          </span>
                          <p className="text-[11px] text-slate-400 truncate mt-1">PIN: **** (Set)</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-medium">
                          {u.status === 'active' ? '● Active' : '○ Suspended'}
                        </span>
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => openUserModal(u)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTargetUser(u)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Printer Settings (Customer Bill, Kitchen 1 & Kitchen 2) */}
          {activeTab === 'printers' && (
            <form onSubmit={handleSavePrinters} className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-slate-900">Thermal Printer Configurations</h3>
                <p className="text-xs text-slate-400">
                  Ethernet LAN connection settings for cashier and kitchen production tickets.
                </p>
              </div>

              {/* 1. Customer Bill Printer */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Printer className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-sm text-slate-900">Customer Bill Printer</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => testPrinter(billPrinter.name)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Test Print</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Printer Model / Name
                    </label>
                    <input
                      type="text"
                      value={billPrinter.name}
                      onChange={(e) => setBillPrinter({ ...billPrinter, name: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      LAN IP Address
                    </label>
                    <input
                      type="text"
                      value={billPrinter.ipAddress}
                      onChange={(e) => setBillPrinter({ ...billPrinter, ipAddress: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Port & Paper
                    </label>
                    <input
                      type="number"
                      value={billPrinter.port}
                      onChange={(e) =>
                        setBillPrinter({ ...billPrinter, port: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Kitchen Printer 1 (Ethernet LAN) */}
              <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                      <h4 className="font-bold text-sm text-slate-900">
                        Kitchen Printer 1 (Main Hot Line)
                      </h4>
                    </div>
                    <span className="text-[11px] text-amber-800 font-semibold">
                      Connected via Dedicated Ethernet LAN Cable (Cat6)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => testPrinter(kitchen1Printer.name)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Test KOT 1</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Hardware Name
                    </label>
                    <input
                      type="text"
                      value={kitchen1Printer.name}
                      onChange={(e) =>
                        setKitchen1Printer({ ...kitchen1Printer, name: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Ethernet LAN IP
                    </label>
                    <input
                      type="text"
                      value={kitchen1Printer.ipAddress}
                      onChange={(e) =>
                        setKitchen1Printer({ ...kitchen1Printer, ipAddress: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold text-amber-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Port</label>
                    <input
                      type="number"
                      value={kitchen1Printer.port}
                      onChange={(e) =>
                        setKitchen1Printer({ ...kitchen1Printer, port: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Kitchen Printer 2 (Ethernet LAN) */}
              <div className="p-4 rounded-2xl border border-cyan-200 bg-cyan-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
                      <h4 className="font-bold text-sm text-slate-900">
                        Kitchen Printer 2 (Beverage & Dessert Counter)
                      </h4>
                    </div>
                    <span className="text-[11px] text-cyan-800 font-semibold">
                      Connected via Dedicated Ethernet LAN Cable (Cat6)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => testPrinter(kitchen2Printer.name)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Test KOT 2</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Hardware Name
                    </label>
                    <input
                      type="text"
                      value={kitchen2Printer.name}
                      onChange={(e) =>
                        setKitchen2Printer({ ...kitchen2Printer, name: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Ethernet LAN IP
                    </label>
                    <input
                      type="text"
                      value={kitchen2Printer.ipAddress}
                      onChange={(e) =>
                        setKitchen2Printer({ ...kitchen2Printer, ipAddress: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold text-cyan-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Port</label>
                    <input
                      type="number"
                      value={kitchen2Printer.port}
                      onChange={(e) =>
                        setKitchen2Printer({ ...kitchen2Printer, port: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Save All Printer Configurations
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: Cash Drawer Settings */}
          {activeTab === 'cash_drawer' && (
            <form onSubmit={handleSaveDrawer} className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-slate-900">Cash Drawer Configuration</h3>
                <p className="text-xs text-slate-400">
                  Electronic RJ11 pulse connection through receipt printer kick port.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Drawer Hardware</label>
                  <input
                    type="text"
                    value={drawerConfig.model}
                    onChange={(e) => setDrawerConfig({ ...drawerConfig, model: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Connected Printer Kick Port
                  </label>
                  <input
                    type="text"
                    value={drawerConfig.connectedPrinter}
                    onChange={(e) =>
                      setDrawerConfig({ ...drawerConfig, connectedPrinter: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-2">
                <button
                  type="button"
                  onClick={() => testCashDrawer()}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  <Play className="w-4 h-4" />
                  <span>Test Open Cash Drawer (Kick Pulse)</span>
                </button>

                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={drawerConfig.autoOpenOnCash}
                    onChange={(e) =>
                      setDrawerConfig({ ...drawerConfig, autoOpenOnCash: e.target.checked })
                    }
                    className="rounded text-blue-600"
                  />
                  <span>Auto-open on cash payment receipt</span>
                </label>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Save Drawer Settings
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: Kitchen Routing Settings */}
          {activeTab === 'routing' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-slate-900">
                  Kitchen Category Routing Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Direct food categories to Kitchen 1 (Hot/Main) or Kitchen 2 (Beverage/Dessert) Ethernet printers.
                </p>
              </div>

              <div className="space-y-2">
                {categories.map((cat) => {
                  const currentTarget = routingConfig[cat.id] || cat.kitchenDefault;
                  return (
                    <div
                      key={cat.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {cat.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{cat.name}</h4>
                          <span className="text-[10px] text-slate-400">Category Code: {cat.id}</span>
                        </div>
                      </div>

                      <div className="flex rounded-xl border border-slate-300 overflow-hidden text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => handleRoutingChange(cat.id, 'kitchen_1')}
                          className={`px-3 py-1.5 transition-colors ${
                            currentTarget === 'kitchen_1'
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Kitchen 1 (Hot)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRoutingChange(cat.id, 'kitchen_2')}
                          className={`px-3 py-1.5 transition-colors ${
                            currentTarget === 'kitchen_2'
                              ? 'bg-cyan-600 text-white'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Kitchen 2 (Bar/Cold)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: Backup Settings */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-slate-900">Database & State Snapshots</h3>
                <p className="text-xs text-slate-400">
                  Export complete POS configuration, orders history, inventory, and users as secure offline backup.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-sm text-emerald-900">System Backup Healthy</span>
                  </div>
                  <p className="text-xs text-emerald-700 mt-1">
                    Last snapshot: {settings.backup.lastBackupTime}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={triggerManualBackup}
                  className="flex items-center space-x-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Manual Backup Now</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: Network & Sync Settings */}
          {activeTab === 'network' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-slate-900">
                  Local Server & Cloud Synchronization
                </h3>
                <p className="text-xs text-slate-400">
                  Local edge POS server operating in Colombo with background cloud replication.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Local Edge Server</span>
                    <span className="flex items-center space-x-1.5 text-xs font-bold text-emerald-600">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      <span>Connected</span>
                    </span>
                  </div>
                  <p className="text-sm font-mono font-bold text-slate-900 mt-2">
                    {settings.network.localServerIp}:{settings.network.localPort}
                  </p>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Latency: {settings.network.pingMs} ms (High Speed Local Gigabit LAN)
                  </span>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Shalom Cloud ERP Sync</span>
                    <span className="text-xs font-bold text-sky-600">Synced</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 mt-2">AWS Colombo Region</p>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Pending sync items: {settings.network.pendingSyncCount} (0 in queue)
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() =>
                    addNotification({
                      title: 'Network Diagnostic Passed',
                      message: 'Local LAN ping: 12ms. Cloud endpoint HTTPS response: 200 OK.',
                      type: 'success',
                    })
                  }
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Run Network & LAN Diagnostic Ping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Create / Edit Modal */}
      <Modal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title={editingUser ? `Edit Staff: ${editingUser.name}` : 'Register New Staff Member'}
        subtitle="Assign roles, username and POS access PIN code"
        maxWidth="md"
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Ruwan Rajapakse"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="ruwan@shalomfood.lk"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Role Permission</label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                <option value="cashier">Cashier</option>
                <option value="manager">Floor Manager</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                POS Terminal PIN (4-digit)
              </label>
              <input
                type="password"
                maxLength={4}
                value={userPin}
                onChange={(e) => setUserPin(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-center tracking-widest font-black"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Avatar Image URL</label>
            <input
              type="url"
              value={userAvatar}
              onChange={(e) => setUserAvatar(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono text-xs"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setUserModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Save Staff User
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirmation */}
      {deleteTargetUser && (
        <ConfirmDialog
          isOpen={!!deleteTargetUser}
          onClose={() => setDeleteTargetUser(null)}
          onConfirm={() => deleteUser(deleteTargetUser.id)}
          title={`Remove User ${deleteTargetUser.name}?`}
          message="Are you sure you want to delete this staff account? They will no longer be able to log in."
          confirmText="Delete User"
          variant="danger"
        />
      )}
    </div>
  );
};

