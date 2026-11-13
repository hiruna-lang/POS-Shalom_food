import React, { useState, useRef, useEffect } from 'react';
import { usePos } from '../../context/PosContext';
import {
  Bell,
  Clock,
  Wifi,
  ChevronDown,
  LogOut,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  UtensilsCrossed,
  Sliders,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sound } from '../../utils/sound';

export const Navbar: React.FC = () => {
  const {
    settings,
    currentUser,
    setCurrentUser,
    users,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    currentTime,
  } = usePos();

  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const roleBadgeColor = {
    admin: 'bg-purple-900/60 text-purple-300 border-purple-700',
    manager: 'bg-amber-900/60 text-amber-300 border-amber-700',
    cashier: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
  }[currentUser.role];

  return (
    <header className="bg-slate-900 text-white h-16 border-b border-slate-800 flex items-center justify-between px-3 sm:px-6 shadow-md z-30 select-none shrink-0">
      {/* Left: Back to Dashboard Button & Brand */}
      <div className="flex items-center space-x-2.5 sm:space-x-3.5">
        {/* Prominent Back to Dashboard Button */}
        <button
          type="button"
          onClick={() => {
            sound.playTap();
            navigate('/');
          }}
          className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
          title="Return to Home Dashboard"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Dashboard</span>
        </button>

        <div className="h-6 w-px bg-slate-800 hidden sm:block" />

        {/* Brand & Restaurant Info */}
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-extrabold text-sm tracking-wider">
            <UtensilsCrossed className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                {settings.general.restaurantName}
              </h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 hidden sm:inline">
                POS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              {settings.general.branchName} • {settings.general.currency}
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Live Clock & Date */}
      <div className="hidden lg:flex items-center space-x-3 bg-slate-800/80 px-4 py-1.5 rounded-xl border border-slate-700/60 shadow-inner">
        <Clock className="w-4 h-4 text-blue-400 animate-pulse" />
        <div className="text-center font-mono">
          <span className="text-sm font-bold text-white tracking-wider tabular-nums">{formattedTime}</span>
          <span className="text-slate-400 text-xs ml-2 border-l border-slate-600 pl-2">
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Right: Network Status, Notifications & User Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* System Connection Status Badges */}
        <div className="hidden xl:flex items-center space-x-2 bg-slate-800/70 px-3 py-1.5 rounded-lg border border-slate-700/50 text-xs">
          <div className="flex items-center space-x-1.5" title="Local Server: 192.168.1.50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium">Local: 192.168.1.50</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center space-x-1 text-sky-400" title="Frontend simulation mode">
            <Wifi className="w-3.5 h-3.5" />
            <span className="text-slate-300 font-medium">Demo Mode</span>
          </div>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60 focus:outline-none"
            title="Notifications"
            aria-label="View system notifications"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-slate-900 animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-sm text-white">System Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-rose-500/20 text-rose-400 text-xs px-2 py-0.5 rounded-full border border-rose-500/30">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-sm">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    No notifications right now
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`p-3.5 hover:bg-slate-800/80 cursor-pointer transition-colors flex items-start space-x-3 ${
                        !notif.read ? 'bg-slate-800/40' : ''
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {notif.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                        {notif.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                        {notif.type === 'error' && <XCircle className="w-4 h-4 text-rose-400" />}
                        {notif.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-semibold ${!notif.read ? 'text-white' : 'text-slate-300'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-slate-500">{notif.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 transition-colors focus:outline-none"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover ring-1 ring-slate-600"
            />
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-white leading-tight flex items-center space-x-1">
                <span>{currentUser.name}</span>
              </div>
              <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded border inline-block mt-0.5 ${roleBadgeColor}`}>
                {currentUser.role}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {/* Profile & Switch User Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-slate-800">
                <p className="text-xs text-slate-400">Signed in as</p>
                <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
              </div>

              {/* Role Simulation / Quick User Switch for Testing */}
              <div className="px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1">
                  Switch Active Account:
                </p>
                <div className="space-y-1">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                        u.id === currentUser.id
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <img src={u.avatar} className="w-5 h-5 rounded-full object-cover" alt="" />
                        <span>{u.name}</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono tracking-wider opacity-80">
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-800 pt-2 px-2">
                <button
                  onClick={() => {
                    navigate('/settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  <Sliders className="w-4 h-4 text-slate-400" />
                  <span>System Settings</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/');
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Lock Screen / Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
