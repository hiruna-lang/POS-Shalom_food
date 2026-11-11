import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Table } from '../../types/pos';
import { usePos } from '../../context/PosContext';
import { Users, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface TableSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTable: (table: Table) => void;
}

export const TableSelectorModal: React.FC<TableSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectTable,
}) => {
  const { tables, selectedTable } = usePos();
  const [activeSection, setActiveSection] = useState<'all' | 'indoor' | 'outdoor' | 'ac_lounge'>('all');

  const filteredTables = tables.filter((t) => {
    if (activeSection === 'all') return true;
    return t.section === activeSection;
  });

  const getStatusBadge = (table: Table) => {
    if (table.status === 'available') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Available</span>
        </span>
      );
    }
    if (table.status === 'occupied') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Occupied</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
        <Clock className="w-3.5 h-3.5" />
        <span>Reserved</span>
      </span>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Dining Table"
      subtitle="Assign order to a restaurant table or lounge booth"
      maxWidth="3xl"
    >
      {/* Section Filter Pills */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-4 mb-4 overflow-x-auto">
        {[
          { key: 'all', label: 'All Tables' },
          { key: 'indoor', label: 'Indoor Dining' },
          { key: 'outdoor', label: 'Garden Patio (Outdoor)' },
          { key: 'ac_lounge', label: 'VIP AC Lounge' },
        ].map((sec) => (
          <button
            key={sec.key}
            onClick={() => setActiveSection(sec.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeSection === sec.key
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredTables.map((table) => {
          const isSelected = selectedTable?.id === table.id;
          const isOccupied = table.status === 'occupied';

          return (
            <div
              key={table.id}
              onClick={() => {
                onSelectTable(table);
                onClose();
              }}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between h-36 ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/80 shadow-lg ring-2 ring-blue-500/20'
                  : isOccupied
                  ? 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  : 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-extrabold text-slate-800">
                    {table.number}
                  </span>
                  <div className="flex items-center text-xs text-slate-500 font-medium">
                    <Users className="w-3.5 h-3.5 mr-1" />
                    <span>{table.capacity}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 capitalize mt-0.5">
                  {table.section.replace('_', ' ')}
                </p>
              </div>

              <div>
                {table.customerName && (
                  <p className="text-xs font-semibold text-slate-700 truncate mb-1">
                    {table.customerName}
                  </p>
                )}
                {getStatusBadge(table)}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

