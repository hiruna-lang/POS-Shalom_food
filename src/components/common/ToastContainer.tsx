import React from 'react';
import { usePos } from '../../context/PosContext';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { notifications, markNotificationAsRead } = usePos();

  // Show only unread notifications as floating toasts, up to 3
  const activeToasts = notifications.filter((n) => !n.read).slice(0, 3);

  if (activeToasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none select-none max-w-sm w-full">
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
            className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-xl border border-slate-200 ${borderClass} animate-in fade-in slide-in-from-bottom-2 duration-200`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5 text-rose-600" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-800">{toast.title}</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => markNotificationAsRead(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

