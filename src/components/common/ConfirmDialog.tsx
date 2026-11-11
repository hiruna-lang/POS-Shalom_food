import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle, Trash2, XCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}) => {
  const icon = {
    danger: <Trash2 className="w-8 h-8 text-rose-500" />,
    warning: <AlertTriangle className="w-8 h-8 text-amber-500" />,
    info: <XCircle className="w-8 h-8 text-blue-500" />,
  }[variant];

  const buttonStyle = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500',
    info: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
  }[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex flex-col items-center text-center py-2">
        <div className="p-3 bg-slate-100 rounded-full mb-3">{icon}</div>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        <div className="flex items-center space-x-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold shadow-md transition-colors ${buttonStyle}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

