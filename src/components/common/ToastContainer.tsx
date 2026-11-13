import React, { useEffect } from 'react';
import { usePos } from '../../context/PosContext';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { notifications, markNotificationAsRead } = usePos();

  // Show only unread notifications as compact floating toasts, up to 2
  const activeToasts = notifications.filter((n) => !n.read).slice(0, 2);
  const activeToastIds = activeToasts.map((toast) => toast.id).join(',');

  useEffect(() => {
    const timers = activeToasts.map((toast) =>
      window.setTimeout(() => markNotificationAsRead(toast.id), 4000)
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [activeToastIds]);

  if (activeToasts.length === 0) return null;

  return (
    <div className="fixed top-16 right-20 z-50 flex flex-col space-y-1 pointer-events-none select-none w-[calc(100%-2rem)] max-w-[220px]">
      {activeToasts.map((toast) => {
        const borderClass = {
          success: 'border-l-4 border-emerald-500 bg-white shadow-xl',
          warning: 'border-l-4 border-amber-500 bg-white shadow-xl',
          error: 'border-l-4 border-rose-500 bg-white shadow-xl',
          info: 'border-l-4 border-blue-500 bg-white shadow-xl',
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start space-x-1.5 p-1.5 rounded-md border border-slate-200 ${borderClass} animate-in fade-in slide-in-from-top-2 duration-200`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
              {toast.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
              {toast.type === 'error' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
              {toast.type === 'info' && <Info className="w-3.5 h-3.5 text-blue-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[10px] font-bold text-slate-800">{toast.title}</h4>
              <p className="text-[10px] text-slate-600 mt-0.5 leading-tight">{toast.message}</p>
            </div>
            <button
              onClick={() => markNotificationAsRead(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

